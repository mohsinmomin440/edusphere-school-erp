import React, { useState } from 'react';
import {
  X,
  User,
  FileText,
  MessageSquare,
  Edit,
  ShieldCheck,
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
            onClick={onClose}
            className="text-muted hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                    <span className="text-muted block">Phone</span>
                    <span className="font-semibold text-text">{student.phone || student.guardian?.phone || 'N/A'}</span>
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
                    <span className="font-semibold text-text">{student.address || 'Standard Campus Hostel / Residence'}</span>
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
                    onClick={() => alert(`Message module triggered for guardian: ${student.guardian?.name}`)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    onClick={() => alert(`Report card generation for ${student.name} will be available in Phase 6.`)}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Generate Report
                  </Button>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enrolled & Verified</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-3">
              <h4 className="font-bold text-text">Academic Session 2024-2025</h4>
              <p className="text-muted">Class Teacher: <span className="font-medium text-text">Ananya Sen</span></p>
              <p className="text-muted">Section: <span className="font-medium text-text">{student.section || 'A'}</span></p>
              <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Subjects Enrolled:</span>
                <p className="text-muted mt-1">Mathematics, English, General Science, Social Studies, Second Language</p>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-text">Attendance Summary (Phase 3 Foundation)</h4>
              <p className="text-muted">Overall Attendance Rate: <span className="font-bold text-emerald-600">94.5%</span></p>
              <p className="text-muted">Present Days: 170 / 180</p>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-text">Fee Status (Phase 4 Foundation)</h4>
              <p className="text-muted">Current Term: <span className="text-emerald-700 font-semibold">Paid in Full</span></p>
              <p className="text-muted">Next Installment Due: 15 Nov 2025</p>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-text">Faculty Observations</h4>
              <p className="text-muted">Aarav participates actively in science experiments and exhibits strong problem-solving skills in mathematics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
