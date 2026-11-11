import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, clearTestDB, setupTestDB, teardownTestDB } from './setup';

describe('Candidate Profile & Resume GridFS API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('blocks unauthorized profile access', async () => {
    const res = await request(app).get('/api/profile/me');
    expect(res.status).toBe(401);
  });

  it('fetches, updates, and persists candidate profile across sessions', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    const initial = await agent.get('/api/profile/me');
    expect(initial.status).toBe(200);
    expect(initial.body.data.user.email).toBe('rohan@example.com');
    expect(initial.body.data.profile.profileCompletion).toBe(10);

    const updated = await agent.put('/api/profile/me').send({
      name: 'Rohan K. Verma',
      phone: '+91 9876543210',
      location: 'Bengaluru, India',
      headline: 'Senior Backend Engineer',
      bio: 'Building resilient distributed services with TypeScript and MongoDB.',
      skills: ['TypeScript', 'Node.js', 'MongoDB'],
      education: [
        {
          institution: 'NIT Karnataka',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science',
          startYear: 2017,
          endYear: 2021,
        },
      ],
      experience: [
        {
          jobTitle: 'Software Engineer',
          company: 'Acme Tech',
          description: 'Designed REST APIs and background job pipelines.',
          startDate: '2021-07',
          currentlyWorking: true,
        },
      ],
    });

    expect(updated.status).toBe(200);
    expect(updated.body.data.user.name).toBe('Rohan K. Verma');
    expect(updated.body.data.profile.skills).toEqual(['TypeScript', 'Node.js', 'MongoDB']);
    expect(updated.body.data.profile.profileCompletion).toBe(90);

    // Re-login in a fresh agent to verify persistence
    const freshAgent = request.agent(app);
    await freshAgent.post('/api/auth/login').send({
      email: 'rohan@example.com',
      password: 'Password123',
    });
    const persisted = await freshAgent.get('/api/profile/me');
    expect(persisted.status).toBe(200);
    expect(persisted.body.data.user.name).toBe('Rohan K. Verma');
    expect(persisted.body.data.profile.headline).toBe('Senior Backend Engineer');
    expect(persisted.body.data.profile.education).toHaveLength(1);
    expect(persisted.body.data.profile.experience).toHaveLength(1);
  });

  it('uploads valid PDF resume to GridFS, downloads it, and rejects invalid files', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({
      name: 'Priya Iyer',
      email: 'priya@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    const invalidType = await agent
      .post('/api/profile/resume')
      .attach('resume', Buffer.from('console.log("bad")'), {
        filename: 'script.js',
        contentType: 'application/javascript',
      });
    expect(invalidType.status).toBe(400);

    const spoofedPdf = await agent
      .post('/api/profile/resume')
      .attach('resume', Buffer.from('not really a pdf'), {
        filename: 'fake.pdf',
        contentType: 'application/pdf',
      });
    expect(spoofedPdf.status).toBe(400);
    expect(spoofedPdf.body.error.code).toBe('INVALID_FILE_SIGNATURE');

    const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
    const uploadRes = await agent
      .post('/api/profile/resume')
      .attach('resume', validPdfBuffer, {
        filename: 'priya_resume.pdf',
        contentType: 'application/pdf',
      });

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.data.resume.filename).toBe('priya_resume.pdf');

    const downloadRes = await agent.get('/api/profile/resume');
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers['content-type']).toContain('application/pdf');
    expect(downloadRes.headers['content-disposition']).toContain('priya_resume.pdf');
  });
});

