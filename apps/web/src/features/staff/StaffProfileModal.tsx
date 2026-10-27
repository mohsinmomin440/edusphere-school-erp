import React from 'react';
import { X, User, Phone, Mail, Award, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
  onEdit?: (staff: any) => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  isOpen,
  onClose,
  staff,
  onEdit,
}) => {
  if (!isOpen || !staff) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'On Leave':
        return 'warning';
      case 'Inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-slate-50/50 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl shadow-sm">
              {staff.name ? staff.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{staff.name}</h3>
                <Badge variant={getStatusVariant(staff.status)} size="sm">
                  {staff.status || 'Active'}
                </Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {staff.designation || 'Teacher'} • <span className="font-semibold text-slate-700">{staff.department}</span>
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

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Professional Information */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              Employment & Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted block">Employee ID</span>
                <span className="font-mono font-bold text-slate-900">{staff.employeeId}</span>
              </div>
              <div>
                <span className="text-muted block">Department</span>
                <span className="font-semibold text-slate-800">{staff.department}</span>
              </div>
              <div>
                <span className="text-muted block">Designation</span>
                <span className="font-semibold text-slate-800">{staff.designation}</span>
              </div>
              <div>
                <span className="text-muted block">Joining Date</span>
                <span className="font-semibold text-slate-800">{staff.joiningDate || '2022-06-01'}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="font-medium truncate">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="font-medium">{staff.phone}</span>
              </div>
            </div>
          </div>

          {/* Qualifications & Subject Specialization */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-primary" />
              Academic Qualifications
            </h4>
            <p className="text-xs text-slate-700 font-medium">
              {staff.qualification || 'Certified Faculty Degree (B.Ed / M.Ed)'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(staff);
              }}
            >
              Edit Staff
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
