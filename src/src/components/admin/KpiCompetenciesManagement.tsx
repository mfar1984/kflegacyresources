'use client';

import { useEffect, useState } from 'react';

interface Competency { id: number; code: string; title: string; description: string | null; weight: number; is_active: number }

export default function KpiCompetenciesManagement({ sessionHash }: { sessionHash: string }) {
  const [items, setItems] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Competency | null>(null);
  const [form, setForm] = useState({ code: '', title: '', description: '', weight: 10, is_active: true });
  const [permissions, setPermissions] = useState<string[]>([]);
  const canCreate = permissions.includes('kpi_competencies_create');
  const canEdit = permissions.includes('kpi_competencies_edit');
  const canDelete = permissions.includes('kpi_competencies_delete');

  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/admin/kpi/competencies?hash=${sessionHash}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      setItems(d.competencies || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { (async () => { try { const r = await fetch(`/api/admin/user-permissions?hash=${sessionHash}`); const d = await r.json(); if (r.ok) setPermissions(d.permissions || []);} catch {} })(); }, [sessionHash]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/admin/kpi/competencies?hash=${sessionHash}` : `/api/admin/kpi/competencies?hash=${sessionHash}`;
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      setEditing(null);
      setForm({ code: '', title: '', description: '', weight: 10, is_active: true });
      await fetchData();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete competency?')) return;
    try {
      const r = await fetch(`/api/admin/kpi/competencies?hash=${sessionHash}&id=${id}`, { method: 'DELETE' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      await fetchData();
    } catch (e: any) { setError(e.message || 'Failed to delete'); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status" /></div>;

  return (
    <div>
      {error && <div className="alert alert-danger" style={{ fontSize: 12 }}>{error}</div>}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0" style={{ fontSize: 14, fontWeight: 600 }}>KPI Competencies</h6>
        {canCreate && <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setEditing({ id: 0, code: '', title: '', description: '', weight: 10, is_active: 1 })}>Add Competency</button>}
      </div>
      <div className="table-responsive">
        <table className="table table-hover" style={{ fontSize: 12 }}>
          <thead><tr><th>Code</th><th>Title</th><th>Weight</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 ? (<tr><td colSpan={5} className="text-center py-4">No competencies</td></tr>) : items.map(c => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.title}</td>
                <td>{Number(c.weight).toFixed(2)}</td>
                <td>{c.is_active ? <span className="badge bg-success" style={{ fontSize: 10 }}>ACTIVE</span> : <span className="badge bg-secondary" style={{ fontSize: 10 }}>INACTIVE</span>}</td>
                <td>
                  <div className="d-flex gap-2">
                    {canEdit && <button className="btn btn-sm btn-outline-primary" style={{ fontSize: 10 }} onClick={() => setEditing({ ...c })}>Edit</button>}
                    {canDelete && <button className="btn btn-sm btn-outline-danger" style={{ fontSize: 10 }} onClick={() => remove(c.id)}>Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: 14 }}>{editing.id ? 'Edit Competency' : 'Add Competency'}</h5>
                <button className="btn-close" onClick={() => setEditing(null)} />
              </div>
              <form onSubmit={save}>
                <div className="modal-body">
                  <div className="mb-2"><label className="form-label" style={{ fontSize: 11 }}>Code</label><input className="form-control" style={{ fontSize: 12 }} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required /></div>
                  <div className="mb-2"><label className="form-label" style={{ fontSize: 11 }}>Title</label><input className="form-control" style={{ fontSize: 12 }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                  <div className="mb-2"><label className="form-label" style={{ fontSize: 11 }}>Description</label><textarea className="form-control" style={{ fontSize: 12 }} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="row g-2">
                    <div className="col-md-6"><label className="form-label" style={{ fontSize: 11 }}>Weight</label><input type="number" step="0.01" className="form-control" style={{ fontSize: 12 }} value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} /></div>
                    <div className="col-md-6"><label className="form-label" style={{ fontSize: 11 }}>Active</label><div className="form-check"><input className="form-check-input" type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /></div></div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setEditing(null)}>Cancel</button>
                  {(editing.id ? canEdit : canCreate) && <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }}>{editing.id ? 'Update' : 'Create'}</button>}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


