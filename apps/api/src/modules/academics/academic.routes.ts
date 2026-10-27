import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/asyncHandler';
import { AcademicYear, ClassModel } from './academic.model';
import { Subject } from './subject.model';
import { Enrollment } from './enrollment.model';
import { isDBConnected } from '../../config/database';

const router = Router();
router.use(authenticate);

// Initial fallback demo dataset matching design reference
const DEMO_CLASSES = [
  { _id: 'class-1', schoolId: 'school-default', name: '5A', grade: 'Grade 5', section: 'A', roomNo: '101', capacity: 40, classTeacher: 'Ananya Sen', status: 'Active' },
  { _id: 'class-2', schoolId: 'school-default', name: '7C', grade: 'Grade 7', section: 'C', roomNo: '204', capacity: 35, classTeacher: 'Rajesh Verma', status: 'Active' },
  { _id: 'class-3', schoolId: 'school-default', name: '8B', grade: 'Grade 8', section: 'B', roomNo: '302', capacity: 38, classTeacher: 'Meenakshi Sundaram', status: 'Active' },
  { _id: 'class-4', schoolId: 'school-default', name: '9B', grade: 'Grade 9', section: 'B', roomNo: '401', capacity: 40, classTeacher: 'Vikram Joshi', status: 'Active' },
  { _id: 'class-5', schoolId: 'school-default', name: '10A', grade: 'Grade 10', section: 'A', roomNo: '501', capacity: 42, classTeacher: 'Vikram Joshi', status: 'Active' },
];

const DEMO_YEARS = [
  { _id: 'ay-2024-25', schoolId: 'school-default', name: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31', isCurrent: true, status: 'Current' },
  { _id: 'ay-2025-26', schoolId: 'school-default', name: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: false, status: 'Upcoming' },
];

const DEMO_SUBJECTS = [
  { _id: 'subj-1', schoolId: 'school-default', code: 'MATH-05', name: 'Mathematics', grade: 'Grade 5', type: 'Core', status: 'Active' },
  { _id: 'subj-2', schoolId: 'school-default', code: 'ENG-05', name: 'English Literature', grade: 'Grade 5', type: 'Core', status: 'Active' },
  { _id: 'subj-3', schoolId: 'school-default', code: 'SCI-05', name: 'General Science', grade: 'Grade 5', type: 'Core', status: 'Active' },
  { _id: 'subj-4', schoolId: 'school-default', code: 'HIST-08', name: 'Social Studies & History', grade: 'Grade 8', type: 'Core', status: 'Active' },
  { _id: 'subj-5', schoolId: 'school-default', code: 'COMP-10', name: 'Computer Science', grade: 'Grade 10', type: 'Elective', status: 'Active' },
];

/* ----------------- ACADEMIC YEARS ----------------- */

const yearInputSchema = z
  .object({
    name: z.string().min(1, 'Academic year name is required (e.g. 2025-2026)'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    isCurrent: z.boolean().default(false),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

router.get(
  '/years',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal', 'Admission Officer', 'Teacher'),
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
    // Disconnected mode: filter demo years by schoolId
    const filtered = DEMO_YEARS.filter((y) => y.schoolId === schoolId);
    return res.json({
      data: filtered,
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

router.post(
  '/years',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const parse = yearInputSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues[0]?.message || 'Validation error' });
    }

    const existing = await AcademicYear.findOne({ schoolId, name: parse.data.name });
    if (existing) {
      return res.status(400).json({ error: `Academic session "${parse.data.name}" already exists.` });
    }

    // If new session is marked current, unset current on other sessions
    if (parse.data.isCurrent) {
      await AcademicYear.updateMany({ schoolId }, { $set: { isCurrent: false, status: 'Completed' } });
    }

    const newYear = await AcademicYear.create({
      ...parse.data,
      schoolId,
      status: parse.data.isCurrent ? 'Current' : 'Upcoming',
    });

    return res.status(201).json({ data: newYear, message: 'Academic year created successfully' });
  })
);

/* ----------------- CLASSES ----------------- */

const classInputSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().default('A'),
  roomNo: z.string().optional().default(''),
  capacity: z.number().min(1, 'Capacity must be at least 1').default(40),
  classTeacher: z.string().optional().default(''),
  status: z.enum(['Active', 'Archived']).default('Active'),
});

const classUpdateSchema = classInputSchema.partial();

router.get(
  '/classes',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal', 'Admission Officer', 'Teacher'),
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId || 'school-default';
    const grade = req.query.grade as string;
    const status = req.query.status as string;

    if (isDBConnected()) {
      const filter: Record<string, any> = { schoolId };
      if (grade && grade !== 'All') filter.grade = grade;
      if (status && status !== 'All') {
        filter.status = status;
      } else if (!status) {
        filter.status = { $ne: 'Archived' };
      }

      const classes = await ClassModel.find(filter).sort({ grade: 1, section: 1 }).lean();
      return res.json({
        data: classes,
        source: 'database',
        isLive: true,
      });
    }

    let filtered = DEMO_CLASSES.filter((c) => c.schoolId === schoolId);
    if (grade && grade !== 'All') filtered = filtered.filter((c) => c.grade === grade);
    if (status && status !== 'All') filtered = filtered.filter((c) => c.status === status);

    return res.json({
      data: filtered,
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

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

router.patch(
  '/classes/:id',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const { id } = req.params;
    const parse = classUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues[0]?.message || 'Validation error' });
    }

    if (parse.data.grade && parse.data.section) {
      const duplicate = await ClassModel.findOne({
        _id: { $ne: id },
        schoolId,
        grade: parse.data.grade,
        section: parse.data.section,
      });
      if (duplicate) {
        return res.status(400).json({ error: `Class ${parse.data.grade} Section ${parse.data.section} already exists.` });
      }
    }

    const updated = await ClassModel.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: parse.data },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Class not found or access denied.' });
    }

    return res.json({ data: updated, message: 'Class updated successfully' });
  })
);

router.delete(
  '/classes/:id',
  requireRole('Super Admin', 'Super Administrator', 'School Admin'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const { id } = req.params;

    const archived = await ClassModel.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { status: 'Archived' } },
      { new: true }
    ).lean();

    if (!archived) {
      return res.status(404).json({ error: 'Class not found or access denied.' });
    }

    return res.json({ data: archived, message: 'Class archived successfully' });
  })
);

/* ----------------- SUBJECTS ----------------- */

const subjectInputSchema = z.object({
  code: z.string().min(1, 'Subject code is required'),
  name: z.string().min(1, 'Subject name is required'),
  grade: z.string().optional().default(''),
  department: z.string().optional().default('Academics'),
  type: z.enum(['Core', 'Elective', 'Extra-curricular']).default('Core'),
  status: z.enum(['Active', 'Archived']).default('Active'),
});

router.get(
  '/subjects',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal', 'Admission Officer', 'Teacher'),
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId || 'school-default';
    const grade = req.query.grade as string;

    if (isDBConnected()) {
      const filter: Record<string, any> = { schoolId, status: { $ne: 'Archived' } };
      if (grade && grade !== 'All') filter.grade = grade;
      const subjects = await Subject.find(filter).sort({ name: 1 }).lean();
      return res.json({
        data: subjects,
        source: 'database',
        isLive: true,
      });
    }

    // Disconnected mode: filter demo subjects by schoolId
    let filtered = DEMO_SUBJECTS.filter((s) => s.schoolId === schoolId);
    if (grade && grade !== 'All') filtered = filtered.filter((s) => s.grade === grade);

    return res.json({
      data: filtered,
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

router.post(
  '/subjects',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const parse = subjectInputSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues[0]?.message || 'Validation error' });
    }

    const existing = await Subject.findOne({ schoolId, code: parse.data.code });
    if (existing) {
      return res.status(400).json({ error: `Subject code "${parse.data.code}" already exists.` });
    }

    const subject = await Subject.create({ ...parse.data, schoolId });
    return res.status(201).json({ data: subject, message: 'Subject created successfully' });
  })
);

/* ----------------- ENROLLMENTS ----------------- */

const enrollmentInputSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  academicYearId: z.string().min(1, 'Academic Year ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  className: z.string().min(1, 'Class name is required'),
  rollNo: z.string().min(1, 'Roll number is required'),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  status: z.enum(['Enrolled', 'Promoted', 'Transferred', 'Graduated', 'Withdrawn']).default('Enrolled'),
});

router.get(
  '/enrollments',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal', 'Admission Officer', 'Teacher'),
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId || 'school-default';
    const studentId = req.query.studentId as string;
    const classId = req.query.classId as string;
    const academicYearId = req.query.academicYearId as string;

    if (isDBConnected()) {
      const filter: Record<string, any> = { schoolId };
      if (studentId) filter.studentId = studentId;
      if (classId) filter.classId = classId;
      if (academicYearId) filter.academicYearId = academicYearId;

      const enrollments = await Enrollment.find(filter)
        .populate('studentId', 'name admissionNo')
        .sort({ rollNo: 1 })
        .lean();

      return res.json({
        data: enrollments,
        source: 'database',
        isLive: true,
      });
    }

    return res.json({
      data: [],
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

router.post(
  '/enrollments',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Admission Officer'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const parse = enrollmentInputSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues[0]?.message || 'Validation error' });
    }

    const existing = await Enrollment.findOne({
      schoolId,
      studentId: parse.data.studentId,
      academicYearId: parse.data.academicYearId,
    });
    if (existing) {
      return res.status(400).json({ error: 'Student is already enrolled in this academic session.' });
    }

    const enrollment = await Enrollment.create({ ...parse.data, schoolId });
    return res.status(201).json({ data: enrollment, message: 'Student enrolled successfully' });
  })
);

export default router;
