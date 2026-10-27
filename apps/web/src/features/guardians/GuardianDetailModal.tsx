import React from 'react';
import { X, User, Phone, Mail, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface GuardianDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  guardian: any;
  onEdit?: (guardian: any) => void;
}

export const GuardianDetailModal: React.FC<GuardianDetailModalProps> = ({
  isOpen,
  onClose,
  guardian,
  onEdit,
}) => {
  if (!isOpen || !guardian) return null;

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
            <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-lg shadow-sm">
              {guardian.name ? guardian.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{guardian.name}</h3>
                <Badge variant="primary" size="sm">
                  {guardian.relationship || 'Guardian'}
                </Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Status: <span className="font-semibold text-slate-700">{guardian.status || 'Active'}</span>
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
          {/* Contact Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="font-medium">{guardian.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="font-medium truncate">{guardian.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Briefcase className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="font-medium">{guardian.occupation || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="font-medium truncate">{guardian.address || 'Standard Address'}</span>
              </div>
            </div>
          </div>

          {/* Linked Wards (Students) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-primary" />
              Linked Children / Wards ({guardian.wards?.length || 0})
            </h4>

            {guardian.wards && guardian.wards.length > 0 ? (
              <div className="space-y-2">
                {guardian.wards.map((ward: any) => (
                  <div
                    key={ward._id}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ward.name}</p>
                      <p className="text-[11px] text-muted">
                        Class {ward.class} • Roll No: {ward.rollNo} • Adm: {ward.admissionNo}
                      </p>
                    </div>
                    <Badge variant="secondary" size="sm">
                      Enrolled
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-muted">
                No students currently linked to this guardian record.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
          {onEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(guardian);
              }}
            >
              Edit Guardian
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
