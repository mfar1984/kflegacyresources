'use client';

import { useEffect, useState } from 'react';

interface Band { id: number; min_score: number; max_score: number; grade: string; description: string | null; bonus_type: 'fixed' | 'percent'; bonus_value: number }

export default function KpiGradeBandsManagement({ sessionHash }: { sessionHash: string }) {
  const [items, setItems] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Band | null>(null);
  const [form, setForm] = useState({ min_score: 0, max_score: 100, grade: 'A', description: '', bonus_type: 'fixed' as 'fixed' | 'percent', bonus_value: 0 });
  const [permissions, setPermissions] = useState<string[]>([]);
  const canCreate = permissions.includes('kpi_grades_create');
  const canEdit = permissions.includes('kpi_grades_edit');
  const canDelete = permissions.includes('kpi_grades_delete');

  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/admin/kpi/grade-bands?hash=${sessionHash}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      setItems(d.grade_bands || []);
    } catch (e: any) { setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { (async () => { try { const r = await fetch(`/api/admin/user-permissions?hash=${sessionHash}`); const d = await r.json(); if (r.ok) setPermissions(d.permissions || []);} catch {} })(); }, [sessionHash]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = `/api/admin/kpi/grade-bands?hash=${sessionHash}`;
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed');
      setEditing(null);
      setForm({ min_score: 0, max_score: 100, grade: 'A', description: '', bonus_type: 'fixed', bonus_value: 0 });
      await fetchData();
    } catch (e: any) { setError(e.message || 'Failed to save'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete grade band?')) return;
    try {
      const r = await fetch(`/api/admin/kpi/grade-bands?hash=${sessionHash}&id=${id}`, { method: 'DELETE' });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed');
      await fetchData();
    } catch (e: any) { setError(e.message || 'Failed to delete'); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status" /></div>;

  return (
    <div>
      {error && <div className="alert alert-danger" style={{ fontSize: 12 }}>{error}</div>}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0" style={{ fontSize: 14, fontWeight: 600 }}>KPI Grade Bands</h6>
        {canCreate && <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setEditing({ id: 0, min_score: 0, max_score: 100, grade: 'A', description: '', bonus_type: 'fixed', bonus_value: 0 })}>Add Grade Band</button>}
      </div>
      <div className="table-responsive">
        <table className="table table-hover" style={{ fontSize: 12 }}>
          <thead><tr><th>Min</th><th>Max</th><th>Grade</th><th>Bonus</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 ? (<tr><td colSpan={5} className="text-center py-4">No grade bands</td></tr>) : items.map(b => (
              <tr key={b.id}>
                <td>{Number(b.min_score).toFixed(2)}</td>
                <td>{Number(b.max_score).toFixed(2)}</td>
                <td>{b.grade}</td>
                <td>{b.bonus_type === 'fixed' ? `RM ${Number(b.bonus_value).toFixed(2)}` : `${Number(b.bonus_value).toFixed(2)}% of basic`}</td>
                <td>
                  <div className="d-flex gap-2">
                    {canEdit && <button className="btn btn-sm btn-outline-primary" style={{ fontSize: 10 }} onClick={() => setEditing({ ...b })}>Edit</button>}
                    {canDelete && <button className="btn btn-sm btn-outline-danger" style={{ fontSize: 10 }} onClick={() => remove(b.id)}>Delete</button>}
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
              <div className="modal-header"><h5 className="modal-title" style={{ fontSize: 14 }}>{editing.id ? 'Edit Grade Band' : 'Add Grade Band'}</h5><button className="btn-close" onClick={() => setEditing(null)} /></div>
              <form onSubmit={save}>
                <div className="modal-body">
                  <div className="row g-2">
                    <div className="col-md-3"><label className="form-label" style={{ fontSize: 11 }}>Min</label><input type="number" step="0.01" className="form-control" style={{ fontSize: 12 }} value={form.min_score} onChange={e => setForm({ ...form, min_score: Number(e.target.value) })} /></div>
                    <div className="col-md-3"><label className="form-label" style={{ fontSize: 11 }}>Max</label><input type="number" step="0.01" className="form-control" style={{ fontSize: 12 }} value={form.max_score} onChange={e => setForm({ ...form, max_score: Number(e.target.value) })} /></div>
                    <div className="col-md-3"><label className="form-label" style={{ fontSize: 11 }}>Grade</label><input className="form-control" style={{ fontSize: 12 }} value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} /></div>
                    <div className="col-md-3"><label className="form-label" style={{ fontSize: 11 }}>Bonus Type</label><select className="form-select" style={{ fontSize: 12 }} value={form.bonus_type} onChange={e => setForm({ ...form, bonus_type: e.target.value as any })}><option value="fixed">Fixed</option><option value="percent">Percent</option></select></div>
                  </div>
                  <div className="mt-2"><label className="form-label" style={{ fontSize: 11 }}>Bonus Value</label><input type="number" step="0.01" className="form-control" style={{ fontSize: 12 }} value={form.bonus_value} onChange={e => setForm({ ...form, bonus_value: Number(e.target.value) })} /></div>
                  <div className="mt-2"><label className="form-label" style={{ fontSize: 11 }}>Description</label><input className="form-control" style={{ fontSize: 12 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
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


