'use client';

import { useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/Pagination';

type Unit = 'number' | 'percent' | 'boolean';

interface KpiTemplate {
  id: number;
  code: string;
  title: string;
  description: string | null;
  unit: Unit;
  default_weight: number;
  owner_scope: 'company' | 'department' | 'role';
  is_active: number;
  created_at: string;
  updated_at: string;
}

export default function KpiTemplatesManagement({ sessionHash }: { sessionHash: string }) {
  const [templates, setTemplates] = useState<KpiTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<KpiTemplate | null>(null);
  const [form, setForm] = useState({ code: '', title: '', description: '', unit: 'percent' as Unit, default_weight: 10, owner_scope: 'company', is_active: true });
  const [permissions, setPermissions] = useState<string[]>([]);
  const canCreate = permissions.includes('kpi_templates_create');
  const canEdit = permissions.includes('kpi_templates_edit');
  const canDelete = permissions.includes('kpi_templates_delete');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const data = q ? templates.filter(t => (t.title + ' ' + t.code).toLowerCase().includes(q)) : templates;
    setTotal(data.length);
    setTotalPages(Math.max(1, Math.ceil(data.length / pageSize)));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [templates, search, page, pageSize]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/kpi/templates?hash=${sessionHash}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (e) {
      setError('Failed to load KPI templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/user-permissions?hash=${sessionHash}`);
        const d = await r.json();
        if (r.ok) setPermissions(d.permissions || []);
      } catch {}
    })();
  }, [sessionHash]);
  useEffect(() => { setPage(1); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', title: '', description: '', unit: 'percent', default_weight: 10, owner_scope: 'company', is_active: true });
    setShowModal(true);
  };

  const openEdit = (t: KpiTemplate) => {
    setEditing(t);
    setForm({
      code: t.code,
      title: t.title,
      description: t.description || '',
      unit: t.unit,
      default_weight: Number(t.default_weight || 10),
      owner_scope: t.owner_scope,
      is_active: t.is_active === 1
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const url = editing ? `/api/admin/kpi/templates/${editing.id}?hash=${sessionHash}` : `/api/admin/kpi/templates?hash=${sessionHash}`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      setShowModal(false);
      await fetchTemplates();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this KPI template?')) return;
    try {
      const res = await fetch(`/api/admin/kpi/templates/${id}?hash=${sessionHash}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await fetchTemplates();
    } catch (e) {
      setError('Failed to delete template');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-danger" style={{ fontSize: 12 }}>{error}</div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1" style={{ fontSize: 18, fontWeight: 600 }}>KPI Templates</h5>
          <p className="text-muted mb-0" style={{ fontSize: 12 }}>Manage reusable KPI items</p>
        </div>
        <div className="d-flex gap-2">
          <input className="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 12, width: 220 }} />
          {canCreate && (
            <button className="btn btn-primary" onClick={openCreate} style={{ fontSize: 12 }}>Add Template</button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th>Code</th>
              <th>Title</th>
              <th>Unit</th>
              <th>Weight</th>
              <th>Scope</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-4">No templates</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id}>
                <td>{t.code}</td>
                <td>{t.title}</td>
                <td>{t.unit}</td>
                <td>{Number(t.default_weight).toFixed(2)}</td>
                <td>{t.owner_scope}</td>
                <td>{t.is_active ? <span className="badge bg-success" style={{ fontSize: 10 }}>ACTIVE</span> : <span className="badge bg-secondary" style={{ fontSize: 10 }}>INACTIVE</span>}</td>
                <td>
                  <div className="d-flex gap-2">
                    {canEdit && <button className="btn btn-sm btn-outline-primary" style={{ fontSize: 10 }} onClick={() => openEdit(t)}>Edit</button>}
                    {canDelete && <button className="btn btn-sm btn-outline-danger" style={{ fontSize: 10 }} onClick={() => handleDelete(t.id)}>Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: 12, gap: 12 }}>
        <div style={{ fontSize: 12, color: '#6b7280' }}>Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {total > 0 ? Math.min(page * pageSize, total) : 0} of {total} templates</div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: 14 }}>{editing ? 'Edit KPI Template' : 'Add KPI Template'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label" style={{ fontSize: 11 }}>Code</label>
                    <input className="form-control" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} style={{ fontSize: 12 }} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontSize: 11 }}>Title</label>
                    <input className="form-control" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ fontSize: 12 }} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontSize: 11 }}>Description</label>
                    <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ fontSize: 12 }} />
                  </div>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: 11 }}>Unit</label>
                      <select className="form-select" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value as Unit })} style={{ fontSize: 12 }}>
                        <option value="number">Number</option>
                        <option value="percent">Percent</option>
                        <option value="boolean">Boolean</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: 11 }}>Default Weight</label>
                      <input type="number" step="0.01" className="form-control" value={form.default_weight} onChange={e => setForm({ ...form, default_weight: Number(e.target.value) })} style={{ fontSize: 12 }} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: 11 }}>Scope</label>
                      <select className="form-select" value={form.owner_scope} onChange={e => setForm({ ...form, owner_scope: e.target.value as any })} style={{ fontSize: 12 }}>
                        <option value="company">Company</option>
                        <option value="department">Department</option>
                        <option value="role">Role</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-check mt-2">
                    <input className="form-check-input" type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                    <label className="form-check-label" style={{ fontSize: 12 }}>Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowModal(false)}>Cancel</button>
                  {(editing ? canEdit : canCreate) && (
                    <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }}>{editing ? 'Update' : 'Create'}</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


