import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { app, clearTestDB, setupTestDB, teardownTestDB } from './setup';

describe('Admin & Recruiter Workspace API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    const passwordHash = await bcrypt.hash('AdminPass123!', 10);
    await User.create({
      name: 'Admin Recruiter',
      email: 'admin@jobsterritory.demo',
      passwordHash,
      role: 'admin',
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('restricts admin endpoints from candidates', async () => {
    const candidate = request.agent(app);
    await candidate.post('/api/auth/register').send({
      name: 'Regular Candidate',
      email: 'cand@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    const dash = await candidate.get('/api/admin/dashboard');
    expect(dash.status).toBe(403);

    const createJob = await candidate.post('/api/jobs').send({
      title: 'Test Job',
      company: 'Test Co',
      location: 'Remote',
      employmentType: 'Full-time',
      workplaceType: 'Remote',
      experienceLevel: 'Mid',
      category: 'Engineering',
      description: 'At least twenty characters description here.',
    });
    expect(createJob.status).toBe(403);
  });

  it('allows admin to create, edit, publish, archive jobs and update application status with history', async () => {
    const admin = request.agent(app);
    const loginRes = await admin.post('/api/auth/login').send({
      email: 'admin@jobsterritory.demo',
      password: 'AdminPass123!',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.role).toBe('admin');

    // Create draft job
    const createRes = await admin.post('/api/jobs').send({
      title: 'Platform Engineer',
      company: 'Jobs Territory',
      location: 'Bengaluru',
      employmentType: 'Full-time',
      workplaceType: 'Hybrid',
      experienceLevel: 'Senior',
      category: 'Engineering',
      description: 'Build core candidate discovery and application systems.',
      skills: ['TypeScript', 'MongoDB'],
      status: 'draft',
    });
    expect(createRes.status).toBe(201);
    const jobId = createRes.body.data.job.id;

    // Publish job
    const publishRes = await admin.put(`/api/jobs/${jobId}`).send({
      status: 'published',
      title: 'Senior Platform Engineer',
    });
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.job.status).toBe('published');
    expect(publishRes.body.data.job.postedAt).toBeTruthy();

    // Candidate applies
    const candidate = request.agent(app);
    await candidate.post('/api/auth/register').send({
      name: 'Dev Candidate',
      email: 'dev@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    const appRes = await candidate.post('/api/applications').send({
      jobId,
      coverLetter: 'Strong TypeScript background.',
    });
    expect(appRes.status).toBe(201);
    const applicationId = appRes.body.data.application.id;

    // Admin views applications & dashboard
    const adminApps = await admin.get(`/api/admin/applications?jobId=${jobId}`);
    expect(adminApps.status).toBe(200);
    expect(adminApps.body.data.applications).toHaveLength(1);

    // Admin updates status -> Under Review -> Shortlisted
    const reviewRes = await admin
      .patch(`/api/admin/applications/${applicationId}/status`)
      .send({ status: 'Under Review', note: 'Initial resume screening passed.' });
    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.application.status).toBe('Under Review');
    expect(reviewRes.body.data.application.statusHistory).toHaveLength(2);

    const shortlistRes = await admin
      .patch(`/api/admin/applications/${applicationId}/status`)
      .send({ status: 'Shortlisted', note: 'Advancing to technical round.' });
    expect(shortlistRes.status).toBe(200);
    expect(shortlistRes.body.data.application.statusHistory).toHaveLength(3);

    // Dashboard metrics reflect real counts
    const dashRes = await admin.get('/api/admin/dashboard');
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.metrics.publishedJobs).toBe(1);
    expect(dashRes.body.data.applicationsByStatus.Shortlisted).toBe(1);

    // Archive job (safe archival since it has applications)
    const archiveRes = await admin.delete(`/api/jobs/${jobId}`);
    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.data.action).toBe('archived');
  });
});

