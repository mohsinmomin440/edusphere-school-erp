import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Plus,
  Edit,
  Trash2,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { ClassFormModal, ClassFormData } from './ClassFormModal';
import { AcademicYearFormModal, AcademicYearFormData } from './AcademicYearFormModal';

export const ClassManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('classes');

  // Classes state
  const [classes, setClasses] = useState<any[]>([]);
  const [gradeFilter, setGradeFilter] = useState('All');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);

  // Academic Sessions state
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);

  // Subjects state
  const [subjects, setSubjects] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('database');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [classRes, yearRes, subjRes] = await Promise.all([
        axios.get('/api/v1/academics/classes', { withCredentials: true }),
        axios.get('/api/v1/academics/years', { withCredentials: true }),
        axios.get('/api/v1/academics/subjects', { withCredentials: true }),
      ]);

      if (classRes.data) {
        setClasses(classRes.data.data || []);
        if (classRes.data.source) setDataSource(classRes.data.source);
      }
      if (yearRes.data) {
        setAcademicYears(yearRes.data.data || []);
      }
      if (subjRes.data) {
        setSubjects(subjRes.data.data || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load academics information');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOrUpdateClass = async (formData: ClassFormData) => {
    try {
      if (editingClass) {
        await axios.patch(`/api/v1/academics/classes/${editingClass._id}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post('/api/v1/academics/classes', formData, {
          withCredentials: true,
        });
      }
      fetchData();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          'Operation failed: Persistent database storage is required to save changes.'
      );
    }
  };

  const handleArchiveClass = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this class?')) {
      try {
        await axios.delete(`/api/v1/academics/classes/${id}`, { withCredentials: true });
        fetchData();
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            'Archive failed: Persistent database storage is required to update records.'
        );
      }
    }
  };

  const handleCreateYear = async (formData: AcademicYearFormData) => {
    try {
      await axios.post('/api/v1/academics/years', formData, { withCredentials: true });
      fetchData();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          'Operation failed: Persistent database storage is required to save changes.'
      );
    }
  };

  const academicTabs = [
    { id: 'classes', label: 'Classes & Sections' },
    { id: 'years', label: 'Academic Sessions' },
    { id: 'subjects', label: 'Subjects Curriculum' },
  ];

  const filteredClasses =
    gradeFilter === 'All' ? classes : classes.filter((c) => c.grade === gradeFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Academics & Classes
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage academic years, grade sections, classroom capacity, and subject curricula.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'classes' ? (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingClass(null);
                setIsClassModalOpen(true);
              }}
              className="shadow-sm shadow-blue-500/20"
            >
              Add Class
            </Button>
          ) : activeTab === 'years' ? (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsYearModalOpen(true)}
              className="shadow-sm shadow-blue-500/20"
            >
              New Academic Session
            </Button>
          ) : null}
        </div>
      </div>

      {/* Database Status Pill if running in detached fallback */}
      {dataSource === 'fallback-demo' && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Read-Only Preview Mode:</strong> Displaying demo academic structures. Persistent mutations require an active MongoDB connection.
            </span>
          </div>
          <span className="font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
            Atlas Disconnected
          </span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-surface rounded-xl border border-border p-2">
        <Tabs tabs={academicTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab 1: Classes & Sections */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>Filter by Grade:</span>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Grades</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
              </select>
            </div>
            <span className="text-xs text-muted">Showing {filteredClasses.length} classes</span>
          </div>

          <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/75 text-[11px] font-bold text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Grade Level</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Room No</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Class Teacher</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-text">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted">
                      Loading classes...
                    </td>
                  </tr>
                ) : filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted">
                      No classes found.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {c.name}
                          </div>
                          <span>Class {c.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{c.grade}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                          {c.section}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">{c.roomNo || 'Room 101'}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{c.capacity || 40} students</td>
                      <td className="py-3 px-4 text-slate-800">{c.classTeacher || 'Unassigned'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={c.status === 'Archived' ? 'secondary' : 'success'} size="sm">
                          {c.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingClass(c);
                              setIsClassModalOpen(true);
                            }}
                            title="Edit Class"
                            className="p-1.5 text-muted hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {c.status !== 'Archived' && (
                            <button
                              onClick={() => handleArchiveClass(c._id)}
                              title="Archive Class"
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
      )}

      {/* Tab 2: Academic Sessions */}
      {activeTab === 'years' && (
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/75 text-[11px] font-bold text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Academic Session</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs text-text">
              {academicYears.map((y) => (
                <tr key={y._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{y.name}</td>
                  <td className="py-3 px-4 text-muted">{y.startDate}</td>
                  <td className="py-3 px-4 text-muted">{y.endDate}</td>
                  <td className="py-3 px-4">
                    <Badge variant={y.isCurrent ? 'success' : 'secondary'} size="sm">
                      {y.isCurrent ? 'Current Session' : y.status || 'Upcoming'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {y.isCurrent ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        ● Official Enrolling Term
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Subjects Curriculum */}
      {activeTab === 'subjects' && (
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/75 text-[11px] font-bold text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Applicable Grade</th>
                <th className="py-3 px-4">Curriculum Type</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs text-text">
              {subjects.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                  <td className="py-3 px-4 text-slate-700">{s.grade || 'All Grades'}</td>
                  <td className="py-3 px-4">
                    <Badge variant={s.type === 'Core' ? 'primary' : 'secondary'} size="sm">
                      {s.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="success" size="sm">
                      {s.status || 'Active'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Class Modal */}
      <ClassFormModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSubmit={handleCreateOrUpdateClass}
        initialData={editingClass}
      />

      {/* Academic Year Modal */}
      <AcademicYearFormModal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        onSubmit={handleCreateYear}
      />
    </div>
  );
};
