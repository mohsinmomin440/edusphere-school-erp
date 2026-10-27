import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { resetDemoStore } from './student.service';
import { getAuthSecret } from '../../config/jwt';

describe('Students, RBAC & Multi-Tenancy API Module', () => {
  let adminCookie: any;
  const secret = getAuthSecret();

  // Helper to create valid JWT cookie for any role/context
  const createTestAuthCookie = (payload: {
    id: string;
    email: string;
    name: string;
    role: string;
    schoolId?: string;
    linkedStudentIds?: string[];
    assignedClasses?: string[];
    studentProfileId?: string;
  }) => {
    const token = jwt.sign(
      {
        sub: payload.id,
        ...payload,
        schoolId: payload.schoolId || 'school-default',
      },
      secret,
      { expiresIn: '1h' }
    );
    return [`auth=${token}`];
  };

  beforeEach(async () => {
    resetDemoStore();
    // Default Super Admin cookie
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@edusphere.com', password: 'admin123' });
    adminCookie = loginRes.headers['set-cookie'];
  });

  describe('GET /api/v1/students (Scoping & Filtering)', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app).get('/api/v1/students');
      expect(res.status).toBe(401);
    });

    it('returns paginated students list for admin user with source indicator', async () => {
      const res = await request(app)
        .get('/api/v1/students?page=1&limit=5')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body).toHaveProperty('source');
      expect(res.body).toHaveProperty('isLive');
    });

    it('filters students by search keyword', async () => {
      const res = await request(app)
        .get('/api/v1/students?search=Aarav')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].name).toContain('Aarav');
    });

    it('filters students by class', async () => {
      const res = await request(app)
        .get('/api/v1/students?class=8B')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.data.every((s: any) => s.class === '8B')).toBe(true);
    });

    it('enforces Parent role scoping: only linked children are visible in list', async () => {
      const parentCookie = createTestAuthCookie({
        id: 'parent-123',
        email: 'rahul.sharma@example.com',
        name: 'Rahul Sharma',
        role: 'Parent',
        linkedStudentIds: ['demo-student-1'],
      });

      const res = await request(app)
        .get('/api/v1/students')
        .set('Cookie', parentCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe('demo-student-1');
      expect(res.body.data[0].name).toBe('Aarav Sharma');
    });

    it('enforces Student role scoping: only self-profile is visible in list', async () => {
      const studentCookie = createTestAuthCookie({
        id: 'demo-student-3',
        email: 'arjun@example.com',
        name: 'Arjun Mehta',
        role: 'Student',
        studentProfileId: 'demo-student-3',
      });

      const res = await request(app)
        .get('/api/v1/students')
        .set('Cookie', studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe('demo-student-3');
    });

    it('enforces Teacher class-level scoping when assignedClasses is set', async () => {
      const teacherCookie = createTestAuthCookie({
        id: 'teacher-101',
        email: 'teacher@edusphere.com',
        name: 'Teacher One',
        role: 'Teacher',
        assignedClasses: ['5A'],
      });

      const res = await request(app)
        .get('/api/v1/students')
        .set('Cookie', teacherCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.every((s: any) => s.class === '5A')).toBe(true);
    });
  });

  describe('GET /api/v1/students/:id (Access Control & Multi-Tenancy)', () => {
    it('returns student profile for authorized admin', async () => {
      const res = await request(app)
        .get('/api/v1/students/demo-student-1')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Aarav Sharma');
      expect(res.body.data).toHaveProperty('guardian');
    });

    it('returns 404 for non-existent student ID', async () => {
      const res = await request(app)
        .get('/api/v1/students/non-existent-id-999')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(404);
    });

    it('returns 403 when Parent attempts to view unlinked student record', async () => {
      const parentCookie = createTestAuthCookie({
        id: 'parent-123',
        email: 'other.parent@example.com',
        name: 'Other Parent',
        role: 'Parent',
        linkedStudentIds: ['demo-student-1'],
      });

      const res = await request(app)
        .get('/api/v1/students/demo-student-2')
        .set('Cookie', parentCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('returns 403 when Student attempts to view another student record', async () => {
      const studentCookie = createTestAuthCookie({
        id: 'demo-student-3',
        email: 'arjun@example.com',
        name: 'Arjun Mehta',
        role: 'Student',
        studentProfileId: 'demo-student-3',
      });

      const res = await request(app)
        .get('/api/v1/students/demo-student-1')
        .set('Cookie', studentCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('enforces multi-tenancy isolation: returns 404 for student belonging to another school', async () => {
      const foreignAdminCookie = createTestAuthCookie({
        id: 'foreign-admin-1',
        email: 'admin@foreignschool.com',
        name: 'Foreign Admin',
        role: 'School Admin',
        schoolId: 'school-foreign-999',
      });

      const res = await request(app)
        .get('/api/v1/students/demo-student-1')
        .set('Cookie', foreignAdminCookie);

      expect(res.status).toBe(404);
    });
  });

  describe('Disconnected Database Write Behavior (HTTP 503 Guard)', () => {
    it('returns 503 when attempting to create a student while disconnected', async () => {
      const newStudentPayload = {
        admissionNo: 'ADM-2025-9999',
        rollNo: '99',
        firstName: 'Ananya',
        lastName: 'Verma',
        class: '6A',
        section: 'A',
        gender: 'Female',
        dateOfBirth: '2013-07-15',
        guardian: {
          name: 'Suresh Verma',
          phone: '+91 98765 43299',
        },
      };

      const res = await request(app)
        .post('/api/v1/students')
        .set('Cookie', adminCookie)
        .send(newStudentPayload);

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to update a student while disconnected', async () => {
      const res = await request(app)
        .patch('/api/v1/students/demo-student-1')
        .set('Cookie', adminCookie)
        .send({ phone: '+91 99999 88888' });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to archive a student while disconnected', async () => {
      const res = await request(app)
        .delete('/api/v1/students/demo-student-1')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to create a guardian while disconnected', async () => {
      const res = await request(app)
        .post('/api/v1/guardians')
        .set('Cookie', adminCookie)
        .send({ name: 'Test Guardian', phone: '+91 98765 99999' });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to update a guardian while disconnected', async () => {
      const res = await request(app)
        .patch('/api/v1/guardians/demo-guardian-1')
        .set('Cookie', adminCookie)
        .send({ occupation: 'Senior Architect' });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to archive a guardian while disconnected', async () => {
      const res = await request(app)
        .delete('/api/v1/guardians/demo-guardian-1')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to create a staff member while disconnected', async () => {
      const res = await request(app)
        .post('/api/v1/staff')
        .set('Cookie', adminCookie)
        .send({
          employeeId: 'EMP-99',
          firstName: 'Test',
          lastName: 'Teacher',
          email: 'teacher.test@edusphere.com',
          phone: '+91 98765 99998',
        });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to update a staff member while disconnected', async () => {
      const res = await request(app)
        .patch('/api/v1/staff/staff-1')
        .set('Cookie', adminCookie)
        .send({ qualification: 'Ph.D Mathematics, M.Ed' });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to deactivate a staff member while disconnected', async () => {
      const res = await request(app)
        .delete('/api/v1/staff/staff-1')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to create a class while disconnected', async () => {
      const res = await request(app)
        .post('/api/v1/academics/classes')
        .set('Cookie', adminCookie)
        .send({
          name: '11A',
          grade: 'Grade 11',
          section: 'A',
          capacity: 35,
        });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to update a class while disconnected', async () => {
      const res = await request(app)
        .patch('/api/v1/academics/classes/class-1')
        .set('Cookie', adminCookie)
        .send({ capacity: 45 });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to archive a class while disconnected', async () => {
      const res = await request(app)
        .delete('/api/v1/academics/classes/class-1')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to create an academic session while disconnected', async () => {
      const res = await request(app)
        .post('/api/v1/academics/years')
        .set('Cookie', adminCookie)
        .send({
          name: '2026-2027',
          startDate: '2026-04-01',
          endDate: '2027-03-31',
        });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to create a subject while disconnected', async () => {
      const res = await request(app)
        .post('/api/v1/academics/subjects')
        .set('Cookie', adminCookie)
        .send({
          code: 'PHYS-11',
          name: 'Physics',
          grade: 'Grade 11',
        });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });

    it('returns 503 when attempting to create an enrollment while disconnected', async () => {
      const res = await request(app)
        .post('/api/v1/academics/enrollments')
        .set('Cookie', adminCookie)
        .send({
          studentId: 'demo-student-1',
          academicYearId: 'ay-2024-25',
          classId: 'class-1',
          className: '5A',
          rollNo: '101',
          enrollmentDate: '2024-04-01',
        });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('Database unavailable');
    });
  });

  describe('Read-Only Fallback & Previews', () => {
    it('GET /api/v1/guardians returns demo guardians with wards and fallback-demo label', async () => {
      const res = await request(app)
        .get('/api/v1/guardians')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.source).toBe('fallback-demo');
      expect(res.body.isLive).toBe(false);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]).toHaveProperty('wards');
    });

    it('GET /api/v1/staff returns demo staff with fallback-demo label', async () => {
      const res = await request(app)
        .get('/api/v1/staff')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.source).toBe('fallback-demo');
      expect(res.body.isLive).toBe(false);
      expect(res.body.data.some((s: any) => s.name === 'Meenakshi Sundaram')).toBe(true);
    });

    it('GET /api/v1/academics/years returns academic sessions', async () => {
      const res = await request(app)
        .get('/api/v1/academics/years')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.source).toBe('fallback-demo');
      expect(res.body.data.some((y: any) => y.name === '2024-2025')).toBe(true);
    });

    it('GET /api/v1/academics/classes returns classes list', async () => {
      const res = await request(app)
        .get('/api/v1/academics/classes')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.source).toBe('fallback-demo');
      expect(res.body.data.some((c: any) => c.name === '5A')).toBe(true);
    });

    it('GET /api/v1/academics/subjects returns subjects list', async () => {
      const res = await request(app)
        .get('/api/v1/academics/subjects')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.source).toBe('fallback-demo');
      expect(res.body.data.some((s: any) => s.code === 'MATH-05')).toBe(true);
    });

    it('GET /api/v1/academics/enrollments returns empty list in disconnected mode', async () => {
      const res = await request(app)
        .get('/api/v1/academics/enrollments')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Authorization Permissions (Role Enforcement)', () => {
    it('denies Student role from creating staff (403)', async () => {
      const studentCookie = createTestAuthCookie({
        id: 'student-99',
        email: 'student@edusphere.com',
        name: 'Student User',
        role: 'Student',
      });

      const res = await request(app)
        .post('/api/v1/staff')
        .set('Cookie', studentCookie)
        .send({ employeeId: 'EMP-99', firstName: 'Bad', lastName: 'Actor', email: 'bad@edusphere.com', phone: '123' });

      expect(res.status).toBe(403);
    });

    it('denies Parent role from creating classes (403)', async () => {
      const parentCookie = createTestAuthCookie({
        id: 'parent-99',
        email: 'parent@edusphere.com',
        name: 'Parent User',
        role: 'Parent',
      });

      const res = await request(app)
        .post('/api/v1/academics/classes')
        .set('Cookie', parentCookie)
        .send({ name: 'Class 99', grade: 'Grade 9', section: 'A' });

      expect(res.status).toBe(403);
    });
  });
});
