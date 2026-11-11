import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Job } from '../models/Job';
import { app, clearTestDB, setupTestDB, teardownTestDB } from './setup';

describe('Jobs Discovery API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    await Job.create([
      {
        title: 'Senior React Engineer',
        company: 'Alpha Corp',
        location: 'Bengaluru, India',
        employmentType: 'Full-time',
        workplaceType: 'Hybrid',
        experienceLevel: 'Senior',
        category: 'Engineering',
        salaryRange: { min: 2500000, max: 3500000, currency: 'INR', period: 'year', isDisclosed: true },
        description: 'Lead frontend engineering across core dashboards.',
        skills: ['React', 'TypeScript', 'Next.js'],
        status: 'published',
        postedAt: new Date('2026-10-05T10:00:00Z'),
      },
      {
        title: 'Product Design Intern',
        company: 'Beta Studio',
        location: 'Remote (India)',
        employmentType: 'Internship',
        workplaceType: 'Remote',
        experienceLevel: 'Entry',
        category: 'Design',
        salaryRange: { min: 30000, max: 40000, currency: 'INR', period: 'month', isDisclosed: true },
        description: 'Support design systems and user research.',
        skills: ['Figma', 'UI Design'],
        status: 'published',
        postedAt: new Date('2026-10-04T10:00:00Z'),
      },
      {
        title: 'Internal Draft Role',
        company: 'Secret Org',
        location: 'Mumbai, India',
        employmentType: 'Full-time',
        workplaceType: 'On-site',
        experienceLevel: 'Mid',
        category: 'Operations',
        description: 'This draft job should not appear publicly.',
        skills: ['Operations'],
        status: 'draft',
        postedAt: null,
      },
    ]);
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('fetches only published jobs and supports keyword, location, employmentType, experience filters, and pagination', async () => {
    const allRes = await request(app).get('/api/jobs');
    expect(allRes.status).toBe(200);
    expect(allRes.body.data.jobs).toHaveLength(2);
    expect(allRes.body.data.pagination.total).toBe(2);

    const kwRes = await request(app).get('/api/jobs?q=React&sort=relevance');
    expect(kwRes.status).toBe(200);
    expect(kwRes.body.data.jobs).toHaveLength(1);
    expect(kwRes.body.data.jobs[0].title).toBe('Senior React Engineer');

    const locRes = await request(app).get('/api/jobs?location=Remote');
    expect(locRes.status).toBe(200);
    expect(locRes.body.data.jobs).toHaveLength(1);
    expect(locRes.body.data.jobs[0].company).toBe('Beta Studio');

    const typeRes = await request(app).get('/api/jobs?employmentType=Internship&experienceLevel=Entry');
    expect(typeRes.status).toBe(200);
    expect(typeRes.body.data.jobs).toHaveLength(1);

    const pageRes = await request(app).get('/api/jobs?page=1&limit=1');
    expect(pageRes.status).toBe(200);
    expect(pageRes.body.data.jobs).toHaveLength(1);
    expect(pageRes.body.data.pagination.totalPages).toBe(2);
  });

  it('fetches job details and rejects invalid or draft job IDs', async () => {
    const list = await request(app).get('/api/jobs');
    const publishedId = list.body.data.jobs[0].id;

    const detail = await request(app).get(`/api/jobs/${publishedId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.job.id).toBe(publishedId);

    const invalid = await request(app).get('/api/jobs/not-a-valid-id');
    expect(invalid.status).toBe(400);

    const draftJob = await Job.findOne({ status: 'draft' });
    const draftRes = await request(app).get(`/api/jobs/${draftJob!.id}`);
    expect(draftRes.status).toBe(404);
  });
});

