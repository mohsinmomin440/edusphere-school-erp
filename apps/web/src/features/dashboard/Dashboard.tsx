import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users,
  GraduationCap,
  UserCheck,
  School,
  Calendar,
  UserPlus,
  CreditCard,
  CheckCircle,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAuth } from '@/features/auth/useAuth';
import { StatCard } from '@/components/ui/StatCard';

interface DashboardData {
  stats: {
    totalStudents: { value: number; change: string; label: string };
    totalTeachers: { value: number; change: string; label: string };
    totalParents: { value: number; change: string; label: string };
    totalClasses: { value: number; change: string; label: string };
  };
  enrollmentTrend: Array<{
    month: string;
    newStudents: number;
    totalStudents: number;
  }>;
  recentActivities: Array<{
    id: string;
    title: string;
    detail: string;
    time: string;
    type: string;
  }>;
}

const DEFAULT_DASHBOARD_DATA: DashboardData = {
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/api/v1/dashboard/summary', {
          withCredentials: true,
        });
        if (res.data) {
          setData(res.data);
        }
      } catch (_err) {
        // Fall back to design-reference baseline data
        setData(DEFAULT_DASHBOARD_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      case 'fee':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      case 'leave':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
        );
      case 'inquiry':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'exam':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-2">
            Welcome back, {user?.name || 'Admin'}! <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here&apos;s what&apos;s happening at your school today.
          </p>
        </div>

        {/* Date Pill */}
        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-text shadow-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={data.stats.totalStudents.value.toLocaleString()}
          change={data.stats.totalStudents.change}
          changeLabel={data.stats.totalStudents.label}
          isPositive={true}
          icon={<Users className="w-5 h-5 text-cyan-600" />}
          iconBgColor="bg-cyan-50"
        />
        <StatCard
          title="Total Teachers"
          value={data.stats.totalTeachers.value.toLocaleString()}
          change={data.stats.totalTeachers.change}
          changeLabel={data.stats.totalTeachers.label}
          isPositive={true}
          icon={<GraduationCap className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Total Parents"
          value={data.stats.totalParents.value.toLocaleString()}
          change={data.stats.totalParents.change}
          changeLabel={data.stats.totalParents.label}
          isPositive={true}
          icon={<UserCheck className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <StatCard
          title="Total Classes"
          value={data.stats.totalClasses.value.toLocaleString()}
          change={data.stats.totalClasses.change}
          changeLabel={data.stats.totalClasses.label}
          isPositive={true}
          icon={<School className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
        />
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Enrollment Trend Line Chart (2 cols) */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-text">
                Student Enrollment Trend
              </h2>
              <p className="text-xs text-muted">Academic growth over the calendar year</p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                New
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3882F6]" />
                Total
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.enrollmentTrend}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalStudents"
                  stroke="#3882F6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3882F6', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Total Students"
                />
                <Line
                  type="monotone"
                  dataKey="newStudents"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  name="New Students"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Activities (1 col) */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-text">
              Recent Activities
            </h2>
            <span className="text-xs text-primary font-medium cursor-pointer hover:underline">
              Live updates
            </span>
          </div>

          <div className="mt-4 flex-1 divide-y divide-slate-100">
            {data.recentActivities.map((activity) => (
              <div key={activity.id} className="py-3 flex items-start gap-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {activity.detail}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
