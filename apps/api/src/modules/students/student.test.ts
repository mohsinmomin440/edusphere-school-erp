import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { resetDemoStore } from './student.service';

describe('Students & Guardians API Module', () => {
  let authCookie: any;

  beforeEach(async () => {
    resetDemoStore();
    // Login as Super Administrator to get valid session cookie
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@edusphere.com', password: 'admin123' });
    authCookie = loginRes.headers['set-cookie'];
  });

  describe('GET /api/v1/students', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app).get('/api/v1/students');
      expect(res.status).toBe(401);
    });

    it('returns paginated students list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/students?page=1&limit=5')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination.page).toBe(1);
    });

    it('filters students by search keyword', async () => {
      const res = await request(app)
        .get('/api/v1/students?search=Aarav')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].name).toContain('Aarav');
    });

    it('filters students by class', async () => {
      const res = await request(app)
        .get('/api/v1/students?class=8B')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.data.every((s: any) => s.class === '8B')).toBe(true);
    });
  });

  describe('GET /api/v1/students/:id', () => {
    it('returns student profile for valid ID', async () => {
      const res = await request(app)
        .get('/api/v1/students/demo-student-1')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Aarav Sharma');
      expect(res.body.data).toHaveProperty('guardian');
      expect(res.body.data.guardian).toHaveProperty('name', 'Rahul Sharma');
    });

    it('returns 404 for non-existent student ID', async () => {
      const res = await request(app)
        .get('/api/v1/students/non-existent-id-999')
        .set('Cookie', authCookie);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/students', () => {
    it('validates required fields and returns 400 on invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Cookie', authCookie)
        .send({ firstName: 'Test' }); // Missing required fields
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('creates a new student with valid input', async () => {
      const newStudentPayload = {
        admissionNo: 'ADM-2025-9999',
        rollNo: '99',
        firstName: 'Ananya',
        lastName: 'Verma',
        class: '6A',
        section: 'A',
        gender: 'Female',
        dateOfBirth: '2013-07-15',
        email: 'ananya@example.com',
        phone: '+91 98765 43299',
        guardian: {
          name: 'Suresh Verma',
          relationship: 'Father',
          phone: '+91 98765 43299',
          email: 'suresh@example.com',
          occupation: 'Engineer',
        },
      };

      const res = await request(app)
        .post('/api/v1/students')
        .set('Cookie', authCookie)
        .send(newStudentPayload);
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('name', 'Ananya Verma');
      expect(res.body.data.admissionNo).toBe('ADM-2025-9999');
    });
  });

  describe('PATCH /api/v1/students/:id', () => {
    it('updates student details', async () => {
      const res = await request(app)
        .patch('/api/v1/students/demo-student-1')
        .set('Cookie', authCookie)
        .send({ phone: '+91 99999 88888' });
      expect(res.status).toBe(200);
      expect(res.body.data.phone).toBe('+91 99999 88888');
    });
  });

  describe('DELETE /api/v1/students/:id', () => {
    it('archives student record', async () => {
      const res = await request(app)
        .delete('/api/v1/students/demo-student-1')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Archived');
    });
  });

  describe('GET /api/v1/guardians', () => {
    it('returns guardians list', async () => {
      const res = await request(app)
        .get('/api/v1/guardians')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('GET /api/v1/staff', () => {
    it('returns staff list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/staff')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Academic Routes', () => {
    it('GET /api/v1/academics/years returns academic sessions', async () => {
      const res = await request(app)
        .get('/api/v1/academics/years')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.some((y: any) => y.name === '2024-2025')).toBe(true);
    });

    it('GET /api/v1/academics/classes returns classes list', async () => {
      const res = await request(app)
        .get('/api/v1/academics/classes')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.some((c: any) => c.name === '5A')).toBe(true);
    });
  });
});
