import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/asyncHandler';
import { Staff } from './staff.model';
import { isDBConnected } from '../../config/database';

const router = Router();
router.use(authenticate);

const DEMO_STAFF = [
  {
    _id: 'staff-1',
    schoolId: 'school-default',
    employeeId: 'EMP-01',
    firstName: 'Meenakshi',
    lastName: 'Sundaram',
    name: 'Meenakshi Sundaram',
    email: 'm.sundaram@edusphere.com',
    phone: '+91 98765 11001',
    department: 'Mathematics',
    designation: 'Head of Department',
    qualification: 'Ph.D Mathematics, B.Ed',
    joiningDate: '2020-06-15',
    status: 'Active',
  },
  {
    _id: 'staff-2',
    schoolId: 'school-default',
    employeeId: 'EMP-02',
    firstName: 'Rajesh',
    lastName: 'Verma',
    name: 'Rajesh Verma',
    email: 'r.verma@edusphere.com',
    phone: '+91 98765 11002',
    department: 'Science',
    designation: 'Senior Teacher',
    qualification: 'M.Sc Physics, B.Ed',
    joiningDate: '2021-07-01',
    status: 'Active',
  },
  {
    _id: 'staff-3',
    schoolId: 'school-default',
    employeeId: 'EMP-03',
    firstName: 'Ananya',
    lastName: 'Sen',
    name: 'Ananya Sen',
    email: 'a.sen@edusphere.com',
    phone: '+91 98765 11003',
    department: 'English & Literature',
    designation: 'Class Teacher - 5A',
    qualification: 'M.A English, B.Ed',
    joiningDate: '2022-04-10',
    status: 'Active',
  },
  {
    _id: 'staff-4',
    schoolId: 'school-default',
    employeeId: 'EMP-04',
    firstName: 'Vikram',
    lastName: 'Joshi',
    name: 'Vikram Joshi',
    email: 'v.joshi@edusphere.com',
    phone: '+91 98765 11004',
    department: 'Social Sciences',
    designation: 'Senior Teacher',
    qualification: 'M.A History, B.Ed',
    joiningDate: '2021-08-20',
    status: 'On Leave',
  },
];

const staffInputSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  department: z.string().default('Academics'),
  designation: z.string().default('Teacher'),
  qualification: z.string().optional().default(''),
  joiningDate: z.string().optional().default(''),
  status: z.enum(['Active', 'On Leave', 'Inactive']).default('Active'),
});

const staffUpdateSchema = staffInputSchema.partial();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId || 'school-default';
    const search = req.query.search as string;
    const department = req.query.department as string;
    const status = req.query.status as string;

    if (isDBConnected()) {
      const filter: Record<string, any> = { schoolId };
      if (department && department !== 'All') {
        filter.department = department;
      }
      if (status && status !== 'All') {
        filter.status = status;
      } else if (!status) {
        filter.status = { $ne: 'Inactive' };
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: regex }, { employeeId: regex }, { email: regex }, { department: regex }];
      }
      const staffList = await Staff.find(filter).sort({ name: 1 }).lean();
      return res.json({
        data: staffList,
        source: 'database',
        isLive: true,
      });
    }

    let filtered = DEMO_STAFF.filter((s) => s.schoolId === schoolId);
    if (department && department !== 'All') {
      filtered = filtered.filter((s) => s.department === department);
    }
    if (status && status !== 'All') {
      filtered = filtered.filter((s) => s.status === status);
    }
    if (search && search.trim()) {
      const sLower = search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(sLower) ||
          s.employeeId.toLowerCase().includes(sLower) ||
          s.department.toLowerCase().includes(sLower)
      );
    }

    return res.json({
      data: filtered,
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

router.get(
  '/:id',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal', 'Teacher'),
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId || 'school-default';
    const { id } = req.params;

    if (isDBConnected()) {
      const staff = await Staff.findOne({ _id: id, schoolId }).lean();
      if (!staff) return res.status(404).json({ error: 'Staff member not found' });
      return res.json({
        data: staff,
        source: 'database',
        isLive: true,
      });
    }

    const member = DEMO_STAFF.find((s) => s._id === id && s.schoolId === schoolId);
    if (!member) return res.status(404).json({ error: 'Staff member not found' });
    return res.json({
      data: member,
      source: 'fallback-demo',
      isLive: false,
    });
  })
);

router.post(
  '/',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const parse = staffInputSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues[0]?.message || 'Validation error' });
    }

    const fullName = `${parse.data.firstName} ${parse.data.lastName}`.trim();

    const existing = await Staff.findOne({ schoolId, employeeId: parse.data.employeeId });
    if (existing) {
      return res.status(400).json({ error: `Employee ID "${parse.data.employeeId}" already exists.` });
    }
    const staff = await Staff.create({ ...parse.data, name: fullName, schoolId });
    return res.status(201).json({ data: staff, message: 'Staff created successfully' });
  })
);

router.patch(
  '/:id',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const { id } = req.params;
    const parse = staffUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.issues[0]?.message || 'Validation error' });
    }

    const updateData: Record<string, any> = { ...parse.data };
    if (parse.data.firstName || parse.data.lastName) {
      const existing = await Staff.findOne({ _id: id, schoolId }).lean();
      if (existing) {
        const fName = parse.data.firstName || existing.firstName;
        const lName = parse.data.lastName || existing.lastName;
        updateData.name = `${fName} ${lName}`.trim();
      }
    }

    const updated = await Staff.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Staff member not found or access denied across school boundary.' });
    }

    return res.json({ data: updated, message: 'Staff member updated successfully' });
  })
);

router.delete(
  '/:id',
  requireRole('Super Admin', 'Super Administrator', 'School Admin', 'Principal'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'Database unavailable: Persistent write operations require an active MongoDB connection. Local changes cannot be safely persisted.',
      });
    }

    const schoolId = req.user?.schoolId || 'school-default';
    const { id } = req.params;

    const archived = await Staff.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { status: 'Inactive' } },
      { new: true }
    ).lean();

    if (!archived) {
      return res.status(404).json({ error: 'Staff member not found or access denied across school boundary.' });
    }

    return res.json({ data: archived, message: 'Staff member deactivated successfully' });
  })
);

export default router;
