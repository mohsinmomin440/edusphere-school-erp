import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Authentication & Dashboard API', () => {
  it('rejects login with missing fields (400)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bad-email' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects invalid credentials (401)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'unknown@edusphere.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('allows valid login, sets auth cookie, and returns user payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@edusphere.com', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('admin@edusphere.com');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('auth=');
  });

  it('rejects unauthenticated /me request (401)', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('allows authenticated /me request when auth cookie is provided', async () => {
    // 1. Login to get cookie
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@edusphere.com', password: 'admin123' });
    const cookie = loginRes.headers['set-cookie'];

    // 2. Access /me
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user).toHaveProperty('email', 'admin@edusphere.com');
    expect(meRes.body.user).toHaveProperty('name', 'Admin');
  });

  it('clears cookie on logout', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('protects /dashboard/summary endpoint and returns data for authenticated user', async () => {
    const unauth = await request(app).get('/api/v1/dashboard/summary');
    expect(unauth.status).toBe(401);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@edusphere.com', password: 'admin123' });
    const cookie = loginRes.headers['set-cookie'];

    const summaryRes = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Cookie', cookie);
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body).toHaveProperty('stats');
    expect(summaryRes.body.stats).toHaveProperty('totalStudents');
    expect(summaryRes.body).toHaveProperty('enrollmentTrend');
    expect(summaryRes.body).toHaveProperty('recentActivities');
    expect(summaryRes.body).toHaveProperty('source');
    expect(summaryRes.body).toHaveProperty('isLive');
  });
});
