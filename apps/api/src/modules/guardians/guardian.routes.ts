import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/asyncHandler';
import { Guardian } from './guardian.model';
import { Student } from '../students/student.model';
import * as studentService from '../students/student.service';
import { isDBConnected } from '../../config/database';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const schoolId = user.schoolId || 'school-default';
    const search = req.query.search as string;

    if (isDBConnected()) {
      const filter: Record<string, any> = { schoolId };
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
      }
      const guardians = await Guardian.find(filter).sort({ name: 1 }).lean();
      return res.json({
        data: guardians,
        source: 'database',
        isLive: true,
      });
    }

    // In detached mode, derive guardians from local demo student store
    const { data: students } = await studentService.getStudents(user, {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    const demoGuardians = students.map((s: any) => ({
      _id: `g-${s._id}`,
      schoolId,
      name: s.guardian?.name || 'Guardian',
      phone: s.guardian?.phone || '',
      email: s.guardian?.email || '',
      relationship: s.guardian?.relationship || 'Parent',
      occupation: s.guardian?.occupation || '',
    }));

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
    const schoolId = req.user?.schoolId || 'school-default';
    const { id } = req.params;

    if (isDBConnected()) {
      const guardian = await Guardian.findOne({ _id: id, schoolId }).lean();
      if (!guardian) {
        return res.status(404).json({ error: 'Guardian not found' });
      }
      const wards = await Student.find({
        schoolId,
        $or: [{ 'guardian.id': guardian._id }, { 'guardian.phone': guardian.phone }],
      }).lean();

      return res.json({
        data: { ...guardian, wards },
        source: 'database',
        isLive: true,
      });
    }

    // Disconnected mode read
    return res.json({
      data: {
        _id: id,
        schoolId,
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        email: 'rahul.sharma@example.com',
        relationship: 'Father',
        wards: [],
      },
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
    const { name, phone, email, relationship, occupation, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Guardian name and phone are required' });
    }

    const guardian = await Guardian.create({
      schoolId,
      name,
      phone,
      email: email || '',
      relationship: relationship || 'Guardian',
      occupation: occupation || '',
      address: address || '',
    });
    return res.status(201).json({ data: guardian, message: 'Guardian registered successfully' });
  })
);

export default router;
