import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { Guardian } from './guardian.model';
import { Student } from '../students/student.model';
import { getAuthSecret } from '../../config/jwt';

describe('Guardians API Integration Tests (Real MongoMemoryServer)', () => {
  let mongoServer: MongoMemoryServer;
  const secret = getAuthSecret();

  // Test-only JWT auth cookie generator
  const createAuthCookie = (payload: {
    id: string;
    email: string;
    name: string;
    role: string;
    schoolId?: string;
  }) => {
    const token = jwt.sign(
      {
        sub: payload.id,
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        schoolId: payload.schoolId || 'school-default',
      },
      secret,
      { expiresIn: '1h' }
    );
    return [`auth=${token}`];
  };

  const adminCookie = createAuthCookie({
    id: 'admin-test-id',
    email: 'admin@edusphere.test',
    name: 'Admin Test',
    role: 'Super Administrator',
    schoolId: 'school-default',
  });

  const foreignAdminCookie = createAuthCookie({
    id: 'foreign-admin-id',
    email: 'admin@foreign.test',
    name: 'Foreign Admin',
    role: 'Super Administrator',
    schoolId: 'school-foreign-999',
  });

  const studentCookie = createAuthCookie({
    id: 'student-test-id',
    email: 'student@edusphere.test',
    name: 'Student Test',
    role: 'Student',
    schoolId: 'school-default',
  });

  const teacherCookie = createAuthCookie({
    id: 'teacher-test-id',
    email: 'teacher@edusphere.test',
    name: 'Teacher Test',
    role: 'Teacher',
    schoolId: 'school-default',
  });

  const parentOneCookie = createAuthCookie({
    id: 'parent-1-id',
    email: 'parent.one@example.com',
    name: 'Parent One',
    role: 'Parent',
    schoolId: 'school-default',
  });

  const parentTwoCookie = createAuthCookie({
    id: 'parent-2-id',
    email: 'parent.two@example.com',
    name: 'Parent Two',
    role: 'Parent',
    schoolId: 'school-default',
  });

  const parentNoEmailCookie = createAuthCookie({
    id: 'parent-no-email-id',
    email: '',
    name: 'Parent No Email',
    role: 'Parent',
    schoolId: 'school-default',
  });

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Guardian.deleteMany({});
    await Student.deleteMany({});
  });

  describe('POST /api/v1/guardians (Create)', () => {
    it('creates a persistent guardian in the database with valid payload', async () => {
      const payload = {
        name: 'Sunita Sharma',
        relationship: 'Mother',
        phone: '+91 98765 00001',
        email: 'sunita.sharma@example.com',
        occupation: 'Architect',
        address: '502 Lotus Tower, Mumbai',
      };

      const res = await request(app)
        .post('/api/v1/guardians')
        .set('Cookie', adminCookie)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.name).toBe('Sunita Sharma');
      expect(res.body.data.relationship).toBe('Mother');
      expect(res.body.data.schoolId).toBe('school-default');
      expect(res.body.data.status).toBe('Active');

      // Verify persistent record in MongoDB
      const inDb = await Guardian.findById(res.body.data._id).lean();
      expect(inDb).not.toBeNull();
      expect(inDb?.phone).toBe('+91 98765 00001');
      expect(inDb?.email).toBe('sunita.sharma@example.com');
    });

    it('rejects creation when required fields are missing (400)', async () => {
      const res = await request(app)
        .post('/api/v1/guardians')
        .set('Cookie', adminCookie)
        .send({ phone: '+91 98765 00002' }); // missing name

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('rejects unauthorized roles (Student, Teacher, Parent) from creating guardian (403)', async () => {
      for (const cookie of [studentCookie, teacherCookie, parentOneCookie]) {
        const res = await request(app)
          .post('/api/v1/guardians')
          .set('Cookie', cookie)
          .send({
            name: 'Unauthorized Creator',
            phone: '+91 98765 00003',
          });

        expect(res.status).toBe(403);
      }
    });

    it('rejects unauthenticated requests (401)', async () => {
      const res = await request(app)
        .post('/api/v1/guardians')
        .send({
          name: 'No Token',
          phone: '+91 98765 00004',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/guardians (List, Search & Linked Wards)', () => {
    it('returns live database guardians with source=database and attached linked wards', async () => {
      // 1. Create guardian in database
      const guardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Vikram Malhotra',
        relationship: 'Father',
        phone: '+91 98765 11111',
        email: 'vikram.m@example.com',
        occupation: 'Engineer',
        status: 'Active',
      });

      // 2. Create student linked to guardian
      await Student.create({
        schoolId: 'school-default',
        admissionNo: 'ADM-2025-0991',
        rollNo: '11',
        firstName: 'Rohit',
        lastName: 'Malhotra',
        name: 'Rohit Malhotra',
        class: '5A',
        gender: 'Male',
        dateOfBirth: '2014-03-20',
        status: 'Active',
        guardian: {
          id: guardian._id,
          name: 'Vikram Malhotra',
          relationship: 'Father',
          phone: '+91 98765 11111',
          email: 'vikram.m@example.com',
        },
      });

      const res = await request(app)
        .get('/api/v1/guardians')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.source).toBe('database');
      expect(res.body.isLive).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);

      const returned = res.body.data[0];
      expect(returned.name).toBe('Vikram Malhotra');
      expect(returned).toHaveProperty('wards');
      expect(Array.isArray(returned.wards)).toBe(true);
      expect(returned.wards.length).toBe(1);
      expect(returned.wards[0].name).toBe('Rohit Malhotra');
      expect(returned.wards[0].class).toBe('5A');
    });

    it('enforces multi-tenancy: does not return guardians of another school', async () => {
      await Guardian.create({
        schoolId: 'school-other-777',
        name: 'Foreign Parent',
        relationship: 'Father',
        phone: '+91 98765 77777',
        email: 'foreign@example.com',
        status: 'Active',
      });

      const res = await request(app)
        .get('/api/v1/guardians')
        .set('Cookie', adminCookie); // admin of school-default

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('filters guardians by relationship', async () => {
      await Guardian.create([
        {
          schoolId: 'school-default',
          name: 'Father One',
          relationship: 'Father',
          phone: '+91 98765 22221',
          email: 'father1@example.com',
          status: 'Active',
        },
        {
          schoolId: 'school-default',
          name: 'Mother One',
          relationship: 'Mother',
          phone: '+91 98765 22222',
          email: 'mother1@example.com',
          status: 'Active',
        },
      ]);

      const res = await request(app)
        .get('/api/v1/guardians?relationship=Mother')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].relationship).toBe('Mother');
    });

    it('filters guardians by search term', async () => {
      await Guardian.create([
        {
          schoolId: 'school-default',
          name: 'UniqueName Malhotra',
          relationship: 'Father',
          phone: '+91 98765 33331',
          email: 'uniquename@example.com',
          status: 'Active',
        },
        {
          schoolId: 'school-default',
          name: 'Someone Else',
          relationship: 'Mother',
          phone: '+91 98765 33332',
          email: 'someone@example.com',
          status: 'Active',
        },
      ]);

      const res = await request(app)
        .get('/api/v1/guardians?search=UniqueName')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toContain('UniqueName');
    });

    it('restricts Parent to only their own guardian record matching authenticated email in database mode', async () => {
      await Guardian.create([
        {
          schoolId: 'school-default',
          name: 'Parent One Full',
          relationship: 'Mother',
          phone: '+91 98765 10001',
          email: 'parent.one@example.com',
          status: 'Active',
        },
        {
          schoolId: 'school-default',
          name: 'Parent Two Full',
          relationship: 'Father',
          phone: '+91 98765 10002',
          email: 'parent.two@example.com',
          status: 'Active',
        },
      ]);

      const res = await request(app)
        .get('/api/v1/guardians')
        .set('Cookie', parentOneCookie);

      expect(res.status).toBe(200);
      expect(res.body.source).toBe('database');
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toBe('parent.one@example.com');
      expect(res.body.data[0].name).toBe('Parent One Full');
    });

    it('prevents Parent query-filter bypass attempts using search, status, and relationship parameters', async () => {
      await Guardian.create([
        {
          schoolId: 'school-default',
          name: 'Parent One Full',
          relationship: 'Mother',
          phone: '+91 98765 10001',
          email: 'parent.one@example.com',
          status: 'Active',
        },
        {
          schoolId: 'school-default',
          name: 'Parent Two Full',
          relationship: 'Father',
          phone: '+91 98765 10002',
          email: 'parent.two@example.com',
          status: 'Active',
        },
      ]);

      // Attempt 1: Search for other parent's name
      const searchRes = await request(app)
        .get('/api/v1/guardians?search=Parent Two Full')
        .set('Cookie', parentOneCookie);
      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.length).toBe(0);

      // Attempt 2: Search for other parent's email
      const searchEmailRes = await request(app)
        .get('/api/v1/guardians?search=parent.two@example.com')
        .set('Cookie', parentOneCookie);
      expect(searchEmailRes.status).toBe(200);
      expect(searchEmailRes.body.data.length).toBe(0);

      // Attempt 3: Query other parent's relationship
      const relRes = await request(app)
        .get('/api/v1/guardians?relationship=Father')
        .set('Cookie', parentOneCookie);
      expect(relRes.status).toBe(200);
      expect(relRes.body.data.length).toBe(0);

      // Attempt 4: Status filter still confines to own email
      const statusRes = await request(app)
        .get('/api/v1/guardians?status=Active')
        .set('Cookie', parentOneCookie);
      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.length).toBe(1);
      expect(statusRes.body.data[0].email).toBe('parent.one@example.com');
    });

    it('never returns unrestricted results when Parent has missing email in database mode', async () => {
      await Guardian.create([
        {
          schoolId: 'school-default',
          name: 'Parent One Full',
          relationship: 'Mother',
          phone: '+91 98765 10001',
          email: 'parent.one@example.com',
          status: 'Active',
        },
        {
          schoolId: 'school-default',
          name: 'Parent Two Full',
          relationship: 'Father',
          phone: '+91 98765 10002',
          email: 'parent.two@example.com',
          status: 'Active',
        },
      ]);

      const res = await request(app)
        .get('/api/v1/guardians')
        .set('Cookie', parentNoEmailCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('rejects Student and Teacher with 403 on GET /guardians', async () => {
      const studentRes = await request(app)
        .get('/api/v1/guardians')
        .set('Cookie', studentCookie);
      expect(studentRes.status).toBe(403);

      const teacherRes = await request(app)
        .get('/api/v1/guardians')
        .set('Cookie', teacherCookie);
      expect(teacherRes.status).toBe(403);
    });
  });

  describe('GET /api/v1/guardians/:id (Detail)', () => {
    it('returns guardian detail and linked wards for valid ID', async () => {
      const guardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Kavita Sen',
        relationship: 'Mother',
        phone: '+91 98765 44441',
        email: 'kavita.sen@example.com',
        status: 'Active',
      });

      await Student.create({
        schoolId: 'school-default',
        admissionNo: 'ADM-2025-0992',
        rollNo: '12',
        firstName: 'Ananya',
        lastName: 'Sen',
        name: 'Ananya Sen',
        class: '8B',
        gender: 'Female',
        dateOfBirth: '2011-09-15',
        status: 'Active',
        guardian: {
          id: guardian._id,
          name: 'Kavita Sen',
          relationship: 'Mother',
          phone: '+91 98765 44441',
        },
      });

      const res = await request(app)
        .get(`/api/v1/guardians/${guardian._id}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(guardian._id.toString());
      expect(res.body.data.wards.length).toBe(1);
      expect(res.body.data.wards[0].name).toBe('Ananya Sen');
    });

    it('returns 404 for non-existent guardian ID in current school', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/guardians/${nonExistentId}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(404);
    });

    it('returns 404 when querying guardian belonging to another school', async () => {
      const foreignGuardian = await Guardian.create({
        schoolId: 'school-other-999',
        name: 'Other School Guardian',
        relationship: 'Father',
        phone: '+91 98765 99991',
        email: 'other@example.com',
        status: 'Active',
      });

      const res = await request(app)
        .get(`/api/v1/guardians/${foreignGuardian._id}`)
        .set('Cookie', adminCookie); // caller is school-default

      expect(res.status).toBe(404);
    });

    it('allows Parent to view their own guardian profile in database mode', async () => {
      const ownGuardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Parent One Full',
        relationship: 'Mother',
        phone: '+91 98765 10001',
        email: 'parent.one@example.com',
        status: 'Active',
      });

      const res = await request(app)
        .get(`/api/v1/guardians/${ownGuardian._id}`)
        .set('Cookie', parentOneCookie);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(ownGuardian._id.toString());
      expect(res.body.data.email).toBe('parent.one@example.com');
      expect(res.body.source).toBe('database');
    });

    it('returns 403 when Parent attempts to view another Parent guardian profile (BOLA defense)', async () => {
      const otherGuardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Parent Two Full',
        relationship: 'Father',
        phone: '+91 98765 10002',
        email: 'parent.two@example.com',
        status: 'Active',
      });

      const res = await request(app)
        .get(`/api/v1/guardians/${otherGuardian._id}`)
        .set('Cookie', parentOneCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('You can only view your own guardian record');

      // But Parent Two accessing their own profile succeeds
      const parentTwoRes = await request(app)
        .get(`/api/v1/guardians/${otherGuardian._id}`)
        .set('Cookie', parentTwoCookie);

      expect(parentTwoRes.status).toBe(200);
      expect(parentTwoRes.body.data.email).toBe('parent.two@example.com');
    });

    it('rejects Student and Teacher with 403 on GET /guardians/:id', async () => {
      const guardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Sample Guardian',
        relationship: 'Mother',
        phone: '+91 98765 10003',
        email: 'sample@example.com',
        status: 'Active',
      });

      const studentRes = await request(app)
        .get(`/api/v1/guardians/${guardian._id}`)
        .set('Cookie', studentCookie);
      expect(studentRes.status).toBe(403);

      const teacherRes = await request(app)
        .get(`/api/v1/guardians/${guardian._id}`)
        .set('Cookie', teacherCookie);
      expect(teacherRes.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/guardians/:id (Update)', () => {
    it('updates guardian details in the database', async () => {
      const guardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Deepak Joshi',
        relationship: 'Father',
        phone: '+91 98765 55551',
        email: 'deepak.old@example.com',
        occupation: 'Consultant',
        status: 'Active',
      });

      const updatePayload = {
        phone: '+91 98765 55552',
        email: 'deepak.new@example.com',
        occupation: 'Senior Consultant',
      };

      const res = await request(app)
        .patch(`/api/v1/guardians/${guardian._id}`)
        .set('Cookie', adminCookie)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data.phone).toBe('+91 98765 55552');
      expect(res.body.data.email).toBe('deepak.new@example.com');
      expect(res.body.data.occupation).toBe('Senior Consultant');

      // Verify persistent update directly in MongoDB
      const inDb = await Guardian.findById(guardian._id).lean();
      expect(inDb?.phone).toBe('+91 98765 55552');
      expect(inDb?.email).toBe('deepak.new@example.com');
    });

    it('rejects cross-school guardian update with 404', async () => {
      const guardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Local Parent',
        relationship: 'Mother',
        phone: '+91 98765 66661',
        email: 'local@example.com',
        status: 'Active',
      });

      const res = await request(app)
        .patch(`/api/v1/guardians/${guardian._id}`)
        .set('Cookie', foreignAdminCookie) // different schoolId
        .send({ phone: '+91 99999 00000' });

      expect(res.status).toBe(404);

      // Verify database record remained untouched
      const inDb = await Guardian.findById(guardian._id).lean();
      expect(inDb?.phone).toBe('+91 98765 66661');
    });

    it('rejects unauthorized roles (Teacher, Student, Parent) from updating guardians (403)', async () => {
      const guardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Sample Guardian',
        relationship: 'Mother',
        phone: '+91 98765 10004',
        email: 'sample4@example.com',
        status: 'Active',
      });

      for (const cookie of [teacherCookie, studentCookie, parentOneCookie]) {
        const res = await request(app)
          .patch(`/api/v1/guardians/${guardian._id}`)
          .set('Cookie', cookie)
          .send({ phone: '+91 99999 88888' });

        expect(res.status).toBe(403);
      }
    });
  });

  describe('DELETE /api/v1/guardians/:id (Soft Archive)', () => {
    it('soft-archives the guardian record in the database', async () => {
      const guardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Pradeep Rao',
        relationship: 'Father',
        phone: '+91 98765 77771',
        email: 'pradeep@example.com',
        status: 'Active',
      });

      const res = await request(app)
        .delete(`/api/v1/guardians/${guardian._id}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Archived');

      // Verify persistent soft-delete in MongoDB
      const inDb = await Guardian.findById(guardian._id).lean();
      expect(inDb?.status).toBe('Archived');
    });

    it('rejects cross-school archive attempt with 404', async () => {
      const guardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Untouchable Parent',
        relationship: 'Father',
        phone: '+91 98765 88881',
        email: 'untouchable@example.com',
        status: 'Active',
      });

      const res = await request(app)
        .delete(`/api/v1/guardians/${guardian._id}`)
        .set('Cookie', foreignAdminCookie);

      expect(res.status).toBe(404);

      const inDb = await Guardian.findById(guardian._id).lean();
      expect(inDb?.status).toBe('Active');
    });

    it('rejects unauthorized roles (Teacher, Student, Parent) from archiving guardians (403)', async () => {
      const guardian = await Guardian.create({
        schoolId: 'school-default',
        name: 'Sample Guardian',
        relationship: 'Mother',
        phone: '+91 98765 10005',
        email: 'sample5@example.com',
        status: 'Active',
      });

      for (const cookie of [teacherCookie, studentCookie, parentOneCookie]) {
        const res = await request(app)
          .delete(`/api/v1/guardians/${guardian._id}`)
          .set('Cookie', cookie);

        expect(res.status).toBe(403);
      }
    });
  });
});
