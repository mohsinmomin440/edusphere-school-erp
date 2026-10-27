import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Database,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GuardianFormModal, GuardianFormData } from './GuardianFormModal';
import { GuardianDetailModal } from './GuardianDetailModal';

export const GuardianManagement: React.FC = () => {
  const [guardians, setGuardians] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('database');
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<any | null>(null);
  const [selectedGuardianForDetail, setSelectedGuardianForDetail] = useState<any | null>(null);

  const fetchGuardians = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (search.trim()) params.search = search.trim();
      if (relationshipFilter !== 'All') params.relationship = relationshipFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await axios.get('/api/v1/guardians', {
        params,
        withCredentials: true,
      });

      if (res.data) {
        setGuardians(res.data.data || []);
        if (res.data.source) setDataSource(res.data.source);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load guardians');
    } finally {
      setIsLoading(false);
    }
  }, [search, relationshipFilter, statusFilter]);

  useEffect(() => {
    fetchGuardians();
  }, [fetchGuardians]);

  const handleCreateOrUpdateGuardian = async (formData: GuardianFormData) => {
    try {
      if (editingGuardian) {
        await axios.patch(`/api/v1/guardians/${editingGuardian._id}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post('/api/v1/guardians', formData, {
          withCredentials: true,
        });
      }
      fetchGuardians();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          'Operation failed: Persistent database storage is required to save changes.'
      );
    }
  };

  const handleArchive = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this guardian record?')) {
      try {
        await axios.delete(`/api/v1/guardians/${id}`, { withCredentials: true });
        fetchGuardians();
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
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Parents & Guardians Directory
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage family contacts, emergency relations, and linked student profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingGuardian(null);
              setIsFormOpen(true);
            }}
            className="shadow-sm shadow-blue-500/20"
          >
            Add Guardian
          </Button>
        </div>
      </div>

      {/* Database Status Pill if running in detached fallback */}
      {dataSource === 'fallback-demo' && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Read-Only Preview Mode:</strong> Displaying demo guardian profiles. Persistent create/update/archive operations require an active MongoDB connection.
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
            placeholder="Search guardian name, phone, email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-text placeholder-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Relationship filter */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span>Relation:</span>
            <select
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Relations</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
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
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guardians Table */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/75 text-[11px] font-bold text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Guardian Name</th>
                <th className="py-3 px-4">Relationship</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Occupation</th>
                <th className="py-3 px-4">Linked Students</th>
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
                      <span>Loading guardians directory...</span>
                    </div>
                  </td>
                </tr>
              ) : guardians.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Users className="w-8 h-8 text-slate-300 mb-1" />
                      <p className="font-semibold text-slate-700">No guardian records found</p>
                      <p className="text-[11px]">Try adjusting your search filter or add a new guardian.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                guardians.map((g) => (
                  <tr key={g._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {g.name ? g.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <span>{g.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" size="sm">
                        {g.relationship || 'Guardian'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">{g.phone || 'N/A'}</td>
                    <td className="py-3 px-4 text-muted">{g.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">{g.occupation || '—'}</td>
                    <td className="py-3 px-4">
                      {g.wards && g.wards.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {g.wards.map((w: any) => (
                            <span
                              key={w._id}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {w.name} ({w.class})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={g.status === 'Archived' ? 'secondary' : 'success'} size="sm">
                        {g.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedGuardianForDetail(g)}
                          title="View Profile & Wards"
                          className="p-1.5 text-muted hover:text-primary hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingGuardian(g);
                            setIsFormOpen(true);
                          }}
                          title="Edit Guardian"
                          className="p-1.5 text-muted hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {g.status !== 'Archived' && (
                          <button
                            onClick={() => handleArchive(g._id)}
                            title="Archive Record"
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
      <GuardianFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdateGuardian}
        initialData={editingGuardian}
      />

      {/* Detail Modal */}
      <GuardianDetailModal
        isOpen={!!selectedGuardianForDetail}
        onClose={() => setSelectedGuardianForDetail(null)}
        guardian={selectedGuardianForDetail}
        onEdit={(g) => {
          setEditingGuardian(g);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
};
