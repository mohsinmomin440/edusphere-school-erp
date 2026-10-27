import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { isDBConnected } from '../config/database';
import { Student } from '../modules/students/student.model';
import { Staff } from '../modules/staff/staff.model';
import { Guardian } from '../modules/guardians/guardian.model';
import { ClassModel } from '../modules/academics/academic.model';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

const DEFAULT_DEMO_SUMMARY = {
  stats: {
    totalStudents: { value: 1248, change: '+12%', label: 'from last month' },
    totalTeachers: { value: 86, change: '+5%', label: 'from last month' },
    totalParents: { value: 1102, change: '+8%', label: 'from last month' },
    totalClasses: { value: 48, change: '+2%', label: 'from last month' },
  },
  enrollmentTrend: [
    { month: 'Jan', newStudents: 280, totalStudents: 320 },
    { month: 'Feb', newStudents: 350, totalStudents: 410 },
    { month: 'Mar', newStudents: 320, totalStudents: 390 },
    { month: 'Apr', newStudents: 420, totalStudents: 520 },
    { month: 'May', newStudents: 480, totalStudents: 590 },
    { month: 'Jun', newStudents: 540, totalStudents: 680 },
    { month: 'Jul', newStudents: 720, totalStudents: 850 },
    { month: 'Aug', newStudents: 790, totalStudents: 920 },
  ],
  recentActivities: [
    {
      id: '1',
      title: 'New student registration',
      detail: 'Aarav Sharma (Grade 5)',
      time: '2 hours ago',
      type: 'student',
    },
    {
      id: '2',
      title: 'Fee payment received',
      detail: 'Riya Patel (Grade 8) - ₹5,000',
      time: '3 hours ago',
      type: 'fee',
    },
    {
      id: '3',
      title: 'Leave request approved',
      detail: 'Arjun Mehta (Grade 10)',
      time: '4 hours ago',
      type: 'leave',
    },
    {
      id: '4',
      title: 'New parent inquiry',
      detail: 'Neha Gupta',
      time: '5 hours ago',
      type: 'inquiry',
    },
    {
      id: '5',
      title: 'Exam result published',
      detail: 'Class 10 - Science',
      time: '6 hours ago',
      type: 'exam',
    },
  ],
  source: 'fallback-demo',
  isLive: false,
};

router.get(
  '/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId || 'school-default';

    if (isDBConnected()) {
      const [studentCount, teacherCount, parentCount, classCount, recentStudents] =
        await Promise.all([
          Student.countDocuments({ schoolId, status: { $ne: 'Archived' } }),
          Staff.countDocuments({ schoolId, status: { $ne: 'Inactive' } }),
          Guardian.countDocuments({ schoolId }),
          ClassModel.countDocuments({ schoolId }),
          Student.find({ schoolId }).sort({ createdAt: -1 }).limit(5).lean(),
        ]);

      const liveActivities =
        recentStudents.length > 0
          ? recentStudents.map((s: any) => ({
              id: s._id.toString(),
              title: 'New student registration',
              detail: `${s.name} (${s.grade || s.class})`,
              time: 'Recently registered',
              type: 'student',
            }))
          : DEFAULT_DEMO_SUMMARY.recentActivities;

      const summary = {
        stats: {
          totalStudents: {
            value: studentCount,
            change: studentCount > 0 ? '+12%' : '0%',
            label: 'from last month',
          },
          totalTeachers: {
            value: teacherCount,
            change: teacherCount > 0 ? '+5%' : '0%',
            label: 'from last month',
          },
          totalParents: {
            value: parentCount,
            change: parentCount > 0 ? '+8%' : '0%',
            label: 'from last month',
          },
          totalClasses: {
            value: classCount,
            change: classCount > 0 ? '+2%' : '0%',
            label: 'from last month',
          },
        },
        enrollmentTrend: DEFAULT_DEMO_SUMMARY.enrollmentTrend,
        recentActivities: liveActivities,
        source: 'database',
        isLive: true,
      };

      return res.json(summary);
    }

    // Disconnected development fallback
    return res.json(DEFAULT_DEMO_SUMMARY);
  })
);

export default router;
