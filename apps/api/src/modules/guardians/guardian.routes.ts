import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/asyncHandler';
import { Guardian } from './guardian.model';
import { Student } from '../students/student.model';
import * as studentService from '../students/student.service';
import { isDBConnected } from '../../config/database';

const router = Router();
router.use(authenticate);

const guardianInputSchema = z.object({
  name: z.string().min(1, 'Guardian name is required'),
  relationship: z.string().default('Guardian'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').or(z.literal('')).optional().default(''),
  occupation: z.string().optional().default(''),
  address: z.string().optional().default(''),
  status: z.enum(['Active', 'Archived']).default('Active'),
});

const guardianUpdateSchema = guardianInputSchema.partial();

router.get(
  '/',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal', 'Admission Officer', 'Parent', 'Teacher'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const schoolId = user.schoolId || 'school-default';
    const search = req.query.search as string;
    const relationship = req.query.relationship as string;
    const status = req.query.status as string;

    if (isDBConnected()) {
      const filter: Record<string, any> = { schoolId };

      // SEC-3: If user is Parent, only show their own guardian record
      if (user.role === 'Parent') {
        if (user.email) {
          filter.email = user.email.toLowerCase();
        } else {
          // No email -> no results
          filter._id = null;
        }
      }
      // SEC-3: Student role should be rejected (handled by requireRole above, but defense in depth)
      if (user.role === 'Student') {
        return res.status(403).json({ error: 'Forbidden: Students cannot access guardian directory.' });
      }

      if (status && status !== 'All') {
        filter.status = status;
      } else if (!status) {
        filter.status = { $ne: 'Archived' };
      }

      if (relationship && relationship !== 'All') {
        filter.relationship = relationship;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: regex }, { phone: regex }, { email: regex }, { occupation: regex }];
      }

      const guardians = await Guardian.find(filter).sort({ name: 1 }).lean();

      // Attach wards (linked students) for each guardian
      const guardianIds = guardians.map((g) => g._id);
      const guardianPhones = guardians.map((g) => g.phone).filter(Boolean);

      const wards = await Student.find({
        schoolId,
        status: { $ne: 'Archived' },
        $or: [
          { 'guardian.id': { $in: guardianIds } },
          { 'guardian.phone': { $in: guardianPhones } },
        ],
      })
        .select('_id name class rollNo admissionNo guardian status')
        .lean();

      const guardiansWithWards = guardians.map((g) => {
        const linkedWards = wards.filter(
          (w) =>
            (w.guardian?.id && String(w.guardian.id) === String(g._id)) ||
            (w.guardian?.phone && w.guardian.phone === g.phone)
        );
        return {
          ...g,
          wards: linkedWards,
        };
      });

      return res.json({
        data: guardiansWithWards,
        source: 'database',
        isLive: true,
      });
    }

    // In disconnected mode, derive guardians with linked students from demo store
    const { data: students } = await studentService.getStudents(user, {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    // Map unique guardians from student demo store
    const guardianMap = new Map<string, any>();
    students.forEach((s: any) => {
      const gName = s.guardian?.name || 'Guardian';
      const gPhone = s.guardian?.phone || '';
      const key = `${gName}-${gPhone}`;

      if (!guardianMap.has(key)) {
        guardianMap.set(key, {
          _id: `g-${s._id}`,
          schoolId,
          name: gName,
          phone: gPhone,
          email: s.guardian?.email || '',
          relationship: s.guardian?.relationship || 'Parent',
          occupation: s.guardian?.occupation || 'Professional',
          address: s.address || '',
          status: 'Active',
          wards: [
            {
              _id: s._id,
              name: s.name,
              class: s.class,
              rollNo: s.rollNo,
              admissionNo: s.admissionNo,
            },
          ],
        });
      } else {
        const existing = guardianMap.get(key);
        existing.wards.push({
          _id: s._id,
          name: s.name,
          class: s.class,
          rollNo: s.rollNo,
          admissionNo: s.admissionNo,
        });
      }
    });

    let demoGuardians = Array.from(guardianMap.values());

    // SEC-3: In disconnected mode, if Parent, filter to only their email
    if (user.role === 'Parent' && user.email) {
      demoGuardians = demoGuardians.filter((g) => g.email.toLowerCase() === user.email!.toLowerCase());
    } else if (user.role === 'Parent') {
      demoGuardians = [];
    }
    // SEC-3: Student role already blocked by requireRole

    if (relationship && relationship !== 'All') {
      demoGuardians = demoGuardians.filter((g) => g.relationship === relationship);
    }

    if (status && status !== 'All') {
      demoGuardians = demoGuardians.filter((g) => g.status === status);
    }

    if (search && search.trim()) {
      const sLower = search.trim().toLowerCase();
      demoGuardians = demoGuardians.filter(
        (g) =>
          g.name.toLowerCase().includes(sLower) ||
          g.phone.toLowerCase().includes(sLower) ||
          g.email.toLowerCase().includes(sLower)
      );
    }

    return res.json({
      data: demoGuardians,
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const schoolId = user.schoolId || 'school-default';
    const { id } = req.params;

    if (isDBConnected()) {
      const guardian = await Guardian.findOne({ _id: id, schoolId }).lean();
      if (!guardian) {
        return res.status(404).json({ error: 'Guardian not found' });
      }

      // SEC-4: BOLA prevention - If Parent, verify email matches
      if (user.role === 'Parent') {
        if (!user.email || guardian.email.toLowerCase() !== user.email.toLowerCase()) {
          return res.status(403).json({ error: 'Forbidden: You can only view your own guardian record.' });
        }
      }

      const wards = await Student.find({
        schoolId,
        $or: [{ 'guardian.id': guardian._id }, { 'guardian.phone': guardian.phone }],
      })
        .select('_id name class rollNo admissionNo status')
        .lean();

      return res.json({
        data: { ...guardian, wards },
        source: 'database',
        isLive: true,
      });
    }

    // Disconnected mode read - SEC-4: Don't return static data, lookup by ID
    // Build guardian map from ALL demo students (not filtered by user role) so we can
    // distinguish "not found" (404) from "forbidden" (403) for BOLA prevention.
    const allStudentsResult = await studentService.getStudents(
      { ...user, role: 'School Admin' } as any,
      {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
    );

    // Build guardian map from all demo students
    const guardianMap = new Map<string, any>();
    allStudentsResult.data.forEach((s: any) => {
      const gName = s.guardian?.name || 'Guardian';
      const gPhone = s.guardian?.phone || '';
      const key = `${gName}-${gPhone}`;

      if (!guardianMap.has(key)) {
        guardianMap.set(key, {
          _id: `g-${s._id}`,
          schoolId,
          name: gName,
          phone: gPhone,
          email: s.guardian?.email || '',
          relationship: s.guardian?.relationship || 'Parent',
          occupation: s.guardian?.occupation || 'Professional',
          address: s.address || '',
          status: 'Active',
          wards: [
            {
              _id: s._id,
              name: s.name,
              class: s.class,
              rollNo: s.rollNo,
              admissionNo: s.admissionNo,
            },
          ],
        });
      } else {
        const existing = guardianMap.get(key);
        existing.wards.push({
          _id: s._id,
          name: s.name,
          class: s.class,
          rollNo: s.rollNo,
          admissionNo: s.admissionNo,
        });
      }
    });

    const demoGuardians = Array.from(guardianMap.values());

    // Find matching guardian by ID
    const demoGuardian = demoGuardians.find((g) => g._id === id);
    if (!demoGuardian) {
      return res.status(404).json({ error: 'Guardian not found' });
    }

    // SEC-4: BOLA prevention - If Parent, verify email matches
    if (user.role === 'Parent') {
      if (!user.email || demoGuardian.email.toLowerCase() !== user.email.toLowerCase()) {
        return res.status(403).json({ error: 'Forbidden: You can only view your own guardian record.' });
      }
    }

    return res.json({
      data: demoGuardian,
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

router.post(
  '/',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Admission Officer'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const parse = guardianInputSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues[0]?.message || 'Validation error' });
    }

    const guardian = await Guardian.create({
      schoolId,
      ...parse.data,
    });
    return res.status(201).json({ data: guardian, message: 'Guardian registered successfully' });
  })
);

router.patch(
  '/:id',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Admission Officer'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const { id } = req.params;
    const parse = guardianUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues[0]?.message || 'Validation error' });
    }

    const updated = await Guardian.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: parse.data },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Guardian not found or access denied across school boundary.' });
    }

    return res.json({ data: updated, message: 'Guardian updated successfully' });
  })
);

router.delete(
  '/:id',
  requireRole('Super Admin', 'Super Administrator', 'School Admin'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const { id } = req.params;

    const archived = await Guardian.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { status: 'Archived' } },
      { new: true }
    ).lean();

    if (!archived) {
      return res.status(404).json({ error: 'Guardian not found or access denied across school boundary.' });
    }

    return res.json({ data: archived, message: 'Guardian archived successfully' });
  })
);

export default router;
