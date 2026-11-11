import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Job } from '../models/Job';
import { app, clearTestDB, setupTestDB, teardownTestDB } from './setup';

describe('Applications API', () => {
  let publishedJobId = '';

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    const job = await Job.create({
      title: 'Full Stack Engineer',
      company: 'Jobs Territory',
      location: 'Bengaluru',
      employmentType: 'Full-time',
      workplaceType: 'On-site',
      experienceLevel: 'Mid',
      category: 'Engineering',
      description: 'Build reliable candidate portal services.',
      skills: ['Node.js', 'Next.js'],
      status: 'published',
      postedAt: new Date(),
    });
    publishedJobId = job.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('submits application, prevents duplicates, records status history, and isolates candidate data', async () => {
    const candidateA = request.agent(app);
    await candidateA.post('/api/auth/register').send({
      name: 'Candidate A',
      email: 'candA@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    const applyRes = await candidateA.post('/api/applications').send({
      jobId: publishedJobId,
      coverLetter: 'Excited to contribute to Jobs Territory.',
      status: 'Hired', // Must be ignored!
    });

    expect(applyRes.status).toBe(201);
    const appId = applyRes.body.data.application.id;
    expect(applyRes.body.data.application.status).toBe('Applied');
    expect(applyRes.body.data.application.statusHistory).toHaveLength(1);
    expect(applyRes.body.data.application.statusHistory[0].status).toBe('Applied');

    // Duplicate application check
    const dupRes = await candidateA.post('/api/applications').send({
      jobId: publishedJobId,
      coverLetter: 'Applying again.',
    });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('DUPLICATE_APPLICATION');

    // Fetch own applications
    const myApps = await candidateA.get('/api/applications/me');
    expect(myApps.status).toBe(200);
    expect(myApps.body.data.applications).toHaveLength(1);
    expect(myApps.body.data.applications[0].job.title).toBe('Full Stack Engineer');

    // Candidate cannot modify their own status
    const modifyStatus = await candidateA
      .patch(`/api/admin/applications/${appId}/status`)
      .send({ status: 'Shortlisted' });
    expect(modifyStatus.status).toBe(403);

    // Another candidate cannot view Candidate A's application
    const candidateB = request.agent(app);
    await candidateB.post('/api/auth/register').send({
      name: 'Candidate B',
      email: 'candB@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    const snoopingRes = await candidateB.get(`/api/applications/${appId}`);
    expect(snoopingRes.status).toBe(403);
  });
});

