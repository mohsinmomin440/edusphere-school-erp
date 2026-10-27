import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/asyncHandler';
import { AcademicYear, ClassModel } from './academic.model';
import { isDBConnected } from '../../config/database';

const router = Router();
router.use(authenticate);

const DEMO_CLASSES = [
  { _id: 'class-1', schoolId: 'school-default', name: '5A', grade: 'Grade 5', section: 'A', roomNo: '101', capacity: 40, classTeacher: 'Ananya Sen' },
  { _id: 'class-2', schoolId: 'school-default', name: '7C', grade: 'Grade 7', section: 'C', roomNo: '204', capacity: 35, classTeacher: 'Rajesh Verma' },
  { _id: 'class-3', schoolId: 'school-default', name: '8B', grade: 'Grade 8', section: 'B', roomNo: '302', capacity: 38, classTeacher: 'Meenakshi Sundaram' },
  { _id: 'class-4', schoolId: 'school-default', name: '9B', grade: 'Grade 9', section: 'B', roomNo: '401', capacity: 40, classTeacher: 'Sunita Rao' },
  { _id: 'class-5', schoolId: 'school-default', name: '10A', grade: 'Grade 10', section: 'A', roomNo: '501', capacity: 42, classTeacher: 'Vikram Joshi' },
];

const DEMO_YEARS = [
  { _id: 'ay-2024-25', schoolId: 'school-default', name: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31', isCurrent: true },
  { _id: 'ay-2025-26', schoolId: 'school-default', name: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: false },
];

router.get(
  '/years',
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId || 'school-default';
    if (isDBConnected()) {
      const years = await AcademicYear.find({ schoolId }).sort({ startDate: -1 }).lean();
      return res.json({
        data: years,
        source: 'database',
        isLive: true,
      });
    }
    return res.json({
      data: DEMO_YEARS,
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

router.get(
  '/classes',
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId || 'school-default';
    if (isDBConnected()) {
      const classes = await ClassModel.find({ schoolId }).sort({ grade: 1, section: 1 }).lean();
      return res.json({
        data: classes,
        source: 'database',
        isLive: true,
      });
    }
    return res.json({
      data: DEMO_CLASSES,
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

const classInputSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().default('A'),
  roomNo: z.string().optional().default(''),
  capacity: z.number().min(1).default(40),
  classTeacher: z.string().optional().default(''),
});

router.post(
  '/classes',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const parse = classInputSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues[0]?.message || 'Validation error' });
    }

    const existing = await ClassModel.findOne({ schoolId, grade: parse.data.grade, section: parse.data.section });
    if (existing) {
      return res.status(400).json({ error: `Class ${parse.data.grade} Section ${parse.data.section} already exists.` });
    }
    const newClass = await ClassModel.create({ ...parse.data, schoolId });
    return res.status(201).json({ data: newClass, message: 'Class created successfully' });
  })
);

export default router;
