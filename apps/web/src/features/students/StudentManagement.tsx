import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Archive,
  AlertCircle,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StudentProfileModal } from './StudentProfileModal';
import { StudentFormModal, StudentFormData } from './StudentFormModal';

export interface StudentRecord {
  _id: string;
  admissionNo: string;
  rollNo: string;
  name: string;
  firstName?: string;
  lastName?: string;
  class: string;
  section?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'Active' | 'Inactive' | 'Archived';
  guardian: {
    name: string;
    relationship?: string;
    phone: string;
    email?: string;
  };
}

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 5, totalPages: 1 });
  const [dataSource, setDataSource] = useState<'database' | 'fallback-demo'>('fallback-demo');
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<StudentRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [actionMenuStudentId, setActionMenuStudentId] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedClass !== 'All') params.class = selectedClass;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await axios.get('/api/v1/students', {
        params,
        withCredentials: true,
      });

      if (res.data) {
        setStudents(res.data.data || []);
        if (res.data.pagination) setPagination(res.data.pagination);
        if (res.data.source) setDataSource(res.data.source);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, selectedClass, selectedStatus]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleCreateOrUpdateStudent = async (formData: StudentFormData) => {
    const payload = {
      admissionNo: formData.admissionNo,
      rollNo: formData.rollNo,
      firstName: formData.firstName,
      lastName: formData.lastName,
      class: formData.class,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      email: formData.email,
      phone: formData.phone,
      guardian: {
        name: formData.guardianName,
        relationship: formData.guardianRelationship,
        phone: formData.guardianPhone,
        email: formData.guardianEmail,
      },
    };

    try {
      if (editingStudent) {
        await axios.patch(`/api/v1/students/${editingStudent._id}`, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post('/api/v1/students', payload, {
          withCredentials: true,
        });
      }
      fetchStudents();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          'Operation failed: Persistent database storage is required to save changes.'
      );
    }
  };

  const handleArchive = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this student record?')) {
      try {
        await axios.delete(`/api/v1/students/${id}`, { withCredentials: true });
        fetchStudents();
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            'Archive failed: Persistent database storage is required to update records.'
        );
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Add Student Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Students Management
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage student admissions, profiles, academic records, and guardians.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingStudent(null);
              setIsFormOpen(true);
            }}
            className="shadow-sm shadow-blue-500/20"
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Database Status Pill if running in detached fallback */}
      {dataSource === 'fallback-demo' && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Read-Only Preview Mode:</strong> Displaying reference records. Persistent create/update/archive operations require an active MongoDB connection.
            </span>
          </div>
          <span className="font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
            Atlas Disconnected
          </span>
        </div>
      )}

      {/* Search and Filters Toolbar matching Design Reference */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students, roll no, parent..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-text placeholder-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Filter className="w-3.5 h-3.5" />
            <span>Class:</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-text focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Classes</option>
            <option value="5A">Grade 5A</option>
            <option value="7C">Grade 7C</option>
            <option value="8B">Grade 8B</option>
            <option value="9B">Grade 9B</option>
            <option value="10A">Grade 10A</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-text focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
            <option value="All">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table matching Design Reference */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50/60 text-muted font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Parent / Guardian</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading student directory...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    <p className="font-semibold text-text">No students found</p>
                    <p className="text-xs mt-1">Try clearing your search query or filter settings.</p>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr
                    key={student._id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStudentForProfile(student)}
                  >
                    <td className="py-3.5 px-4 text-center text-muted">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>

                    {/* Student Name with Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-text group-hover:text-primary transition-colors">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-muted">{student.email || student.admissionNo}</p>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3.5 px-4 font-medium text-text">
                      {student.class}
                    </td>

                    {/* Roll No */}
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">
                      {student.rollNo}
                    </td>

                    {/* Parent Name */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>
                        <p className="font-medium">{student.guardian?.name || 'N/A'}</p>
                        <p className="text-[11px] text-muted">{student.guardian?.phone || ''}</p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          student.status === 'Active'
                            ? 'success'
                            : student.status === 'Inactive'
                            ? 'warning'
                            : 'secondary'
                        }
                        size="sm"
                      >
                        {student.status}
                      </Badge>
                    </td>

                    {/* Actions Dropdown */}
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setActionMenuStudentId(
                              actionMenuStudentId === student._id ? null : student._id
                            )
                          }
                          className="p-1 rounded-lg text-muted hover:text-text hover:bg-slate-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {actionMenuStudentId === student._id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg border border-border shadow-lg py-1 z-30 animate-in fade-in duration-100">
                            <button
                              onClick={() => {
                                setActionMenuStudentId(null);
                                setSelectedStudentForProfile(student);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text hover:bg-slate-50"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted" />
                              View Profile
                            </button>
                            <button
                              onClick={() => {
                                setActionMenuStudentId(null);
                                setEditingStudent(student);
                                setIsFormOpen(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text hover:bg-slate-50"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-muted" />
                              Edit Student
                            </button>
                            <button
                              onClick={() => {
                                setActionMenuStudentId(null);
                                handleArchive(student._id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                            >
                              <Archive className="w-3.5 h-3.5 text-red-500" />
                              Archive
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>
            Showing {students.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="px-2 font-medium text-text">
              {pagination.page} / {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <StudentProfileModal
        isOpen={!!selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        student={selectedStudentForProfile}
        onEdit={(student) => {
          setEditingStudent(student);
          setIsFormOpen(true);
        }}
      />

      {/* Add / Edit Form Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdateStudent}
        initialData={editingStudent}
      />
    </div>
  );
};
