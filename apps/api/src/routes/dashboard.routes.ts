import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/summary', authenticate, (_req: Request, res: Response) => {
  // Baseline matching the EduSphere design reference
  const summary = {
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
  };

  return res.json(summary);
});

export default router;
