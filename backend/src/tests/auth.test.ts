import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, clearTestDB, setupTestDB, teardownTestDB } from './setup';

describe('Authentication API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('registers a new candidate and sets HTTP-only auth cookie', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      role: 'admin', // Must be ignored by server
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('aarav@example.com');
    expect(res.body.data.user.role).toBe('candidate');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('jt_token=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    const dup = await request(app).post('/api/auth/register').send({
      name: 'Aarav Two',
      email: 'aarav@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(dup.status).toBe(409);
    expect(dup.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('rejects invalid email and weak password', async () => {
    const badEmail = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'not-an-email',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    expect(badEmail.status).toBe(400);

    const weakPass = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(weakPass.status).toBe(400);
  });

  it('logs in valid user, rejects invalid credentials, accesses /me, and logs out', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Meera Nair',
      email: 'meera@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    const badLogin = await request(app).post('/api/auth/login').send({
      email: 'meera@example.com',
      password: 'WrongPassword1',
    });
    expect(badLogin.status).toBe(401);

    const agent = request.agent(app);
    const loginRes = await agent.post('/api/auth/login').send({
      email: 'meera@example.com',
      password: 'Password123',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.email).toBe('meera@example.com');

    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.name).toBe('Meera Nair');

    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);

    const meAfterLogout = await agent.get('/api/auth/me');
    expect(meAfterLogout.status).toBe(401);
  });

  it('blocks unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

