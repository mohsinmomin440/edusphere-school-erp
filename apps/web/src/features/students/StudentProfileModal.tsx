import React, { useState } from 'react';
import {
  X,
  User,
  FileText,
  MessageSquare,
  Edit,
  ShieldCheck,
  Calendar,
  CreditCard,
  Info,
  Clock,
} from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onEdit?: (student: any) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [actionNotification, setActionNotification] = useState<{
    title: string;
    message: string;
    type: 'info' | 'warning';
  } | null>(null);

  if (!isOpen || !student) return null;

  const profileTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'fees', label: 'Fees' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header matching Design Reference */}
        <div className="p-6 border-b border-border bg-slate-50/50 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl shadow-sm">
              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
                <Badge variant="success" size="sm">
                  {student.status || 'Active'}
                </Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Grade {student.class} • Roll No: <span className="font-semibold text-slate-700">{student.rollNo}</span> • Admission: {student.admissionNo}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActionNotification(null);
              onClose();
            }}
            className="text-muted hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action notification banner if user clicks future features */}
        {actionNotification && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>{actionNotification.title}:</strong> {actionNotification.message}
              </span>
            </div>
            <button
              onClick={() => setActionNotification(null)}
              className="text-blue-500 hover:text-blue-700 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-2 bg-white">
          <Tabs
            tabs={profileTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information (2 cols) */}
              <div className="md:col-span-2 bg-slate-50/70 rounded-xl border border-slate-200/80 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-muted block">Full Name</span>
                    <span className="font-semibold text-text">{student.name}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Date of Birth</span>
                    <span className="font-semibold text-text">{student.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Gender</span>
                    <span className="font-semibold text-text">{student.gender || 'Male'}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Parent/Guardian Name</span>
                    <span className="font-semibold text-text">{student.guardian?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Student Phone</span>
                    <span className="font-semibold text-text">{student.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Parent Phone</span>
                    <span className="font-semibold text-text">{student.guardian?.phone || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted block">Email</span>
                    <span className="font-semibold text-text">{student.email || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted block">Address</span>
                    <span className="font-semibold text-text">{student.address || 'Standard Campus Residence'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions (1 col) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    onClick={() => {
                      onClose();
                      if (onEdit) onEdit(student);
                    }}
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    onClick={() => {
                      setActionNotification({
                        title: 'Messaging Module (Phase 5)',
                        message: `Direct communications with guardian ${student.guardian?.name || ''} will be enabled in Phase 5. Contact phone: ${student.guardian?.phone || 'N/A'}.`,
                        type: 'info',
                      });
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    onClick={() => {
                      setActionNotification({
                        title: 'Report Cards (Phase 6)',
                        message: `Consolidated term report card generation for ${student.name} will be active in Phase 6 (Exams & Results).`,
                        type: 'info',
                      });
                    }}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Generate Report
                  </Button>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enrolled Student</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-3">
              <h4 className="font-bold text-text">Academic Session 2024-2025</h4>
              <p className="text-muted">Class & Section: <span className="font-medium text-text">{student.class}</span></p>
              <p className="text-muted">Roll Number: <span className="font-medium text-text">{student.rollNo}</span></p>
              <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Subjects Curriculum:</span>
                <p className="text-muted mt-1">Mathematics, English Literature, General Science, Social Studies</p>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text">Attendance Tracking</h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Daily period-wise attendance recording and monthly percentage reports will be available once <strong>Phase 3 (Attendance Module)</strong> is activated.
              </p>
              <Badge variant="secondary" size="sm">
                Module Planned for Phase 3
              </Badge>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text">Fees & Invoices</h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Term tuition fee structures, outstanding balances, and receipt generation will be linked here once <strong>Phase 4 (Fees & Finance Module)</strong> is activated.
              </p>
              <Badge variant="secondary" size="sm">
                Module Planned for Phase 4
              </Badge>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text">Behavioral & Faculty Notes</h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Academic progress remarks and teacher observations will be logged here as part of continuous evaluation.
              </p>
              <span className="text-[11px] text-muted block">No formal disciplinary or behavioral notes recorded.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
