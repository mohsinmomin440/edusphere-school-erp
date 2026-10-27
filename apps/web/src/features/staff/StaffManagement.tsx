import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Database,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StaffFormModal, StaffFormData } from './StaffFormModal';
import { StaffProfileModal } from './StaffProfileModal';

export const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('database');
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [selectedStaffForProfile, setSelectedStaffForProfile] = useState<any | null>(null);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (search.trim()) params.search = search.trim();
      if (departmentFilter !== 'All') params.department = departmentFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await axios.get('/api/v1/staff', {
        params,
        withCredentials: true,
      });

      if (res.data) {
        setStaffList(res.data.data || []);
        if (res.data.source) setDataSource(res.data.source);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load staff directory');
    } finally {
      setIsLoading(false);
    }
  }, [search, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleCreateOrUpdateStaff = async (formData: StaffFormData) => {
    try {
      if (editingStaff) {
        await axios.patch(`/api/v1/staff/${editingStaff._id}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post('/api/v1/staff', formData, {
          withCredentials: true,
        });
      }
      fetchStaff();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          'Operation failed: Persistent database storage is required to save changes.'
      );
    }
  };

  const handleDeactivate = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this staff member?')) {
      try {
        await axios.delete(`/api/v1/staff/${id}`, { withCredentials: true });
        fetchStaff();
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            'Deactivation failed: Persistent database storage is required to update records.'
        );
      }
    }
  };

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Staff & Teachers Directory
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage faculty profiles, employee IDs, departments, and class teacher allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingStaff(null);
              setIsFormOpen(true);
            }}
            className="shadow-sm shadow-blue-500/20"
          >
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Database Status Pill if running in detached fallback */}
      {dataSource === 'fallback-demo' && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Read-Only Preview Mode:</strong> Displaying demo faculty profiles. Persistent create/update/deactivate operations require an active MongoDB connection.
            </span>
          </div>
          <span className="font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
            Atlas Disconnected
          </span>
        </div>
      )}

      {/* Error message banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teacher, employee ID, department..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-text placeholder-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Department filter */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span>Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Departments</option>
              <option value="Academics">Academics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English & Literature">English & Literature</option>
              <option value="Social Sciences">Social Sciences</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/75 text-[11px] font-bold text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Qualifications</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs text-text">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading faculty directory...</span>
                    </div>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <GraduationCap className="w-8 h-8 text-slate-300 mb-1" />
                      <p className="font-semibold text-slate-700">No faculty records found</p>
                      <p className="text-[11px]">Try adjusting your search criteria or add a staff member.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {s.name ? s.name.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{s.name}</p>
                          <p className="text-[11px] font-mono text-muted">{s.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{s.department}</td>
                    <td className="py-3 px-4 text-slate-600">{s.designation || 'Teacher'}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">{s.phone}</td>
                    <td className="py-3 px-4 text-muted">{s.email}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                      {s.qualification || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(s.status)} size="sm">
                        {s.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedStaffForProfile(s)}
                          title="View Profile"
                          className="p-1.5 text-muted hover:text-primary hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStaff(s);
                            setIsFormOpen(true);
                          }}
                          title="Edit Staff"
                          className="p-1.5 text-muted hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {s.status !== 'Inactive' && (
                          <button
                            onClick={() => handleDeactivate(s._id)}
                            title="Deactivate Staff"
                            className="p-1.5 text-muted hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdateStaff}
        initialData={editingStaff}
      />

      {/* Profile Modal */}
      <StaffProfileModal
        isOpen={!!selectedStaffForProfile}
        onClose={() => setSelectedStaffForProfile(null)}
        staff={selectedStaffForProfile}
        onEdit={(s) => {
          setEditingStaff(s);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
};
