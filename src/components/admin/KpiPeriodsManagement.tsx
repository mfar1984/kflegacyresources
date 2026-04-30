'use client';

import { useEffect, useState } from 'react';

interface KpiPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'open' | 'closed';
  has_midyear?: number;
  mid_review_start_date?: string | null;
  mid_review_end_date?: string | null;
  total_assignments?: number;
  submitted_count?: number;
  approved_count?: number;
}

export default function KpiPeriodsManagement({ sessionHash }: { sessionHash: string }) {
  const [periods, setPeriods] = useState<KpiPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', has_midyear: false, mid_review_start_date: '', mid_review_end_date: '' });
  const [permissions, setPermissions] = useState<string[]>([]);
  const canCreate = permissions.includes('kpi_periods_create');
  const canOpen = permissions.includes('kpi_periods_edit');
  const canClose = permissions.includes('kpi_periods_close');

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/kpi/periods?hash=${sessionHash}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setPeriods(data.periods || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load periods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPeriods(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    (async () => {
      try { const r = await fetch(`/api/admin/user-permissions?hash=${sessionHash}`); const d = await r.json(); if (r.ok) setPermissions(d.permissions || []); } catch {}
    })();
  }, [sessionHash]);

  const createPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`/api/admin/kpi/periods?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setForm({ name: '', start_date: '', end_date: '', has_midyear: false, mid_review_start_date: '', mid_review_end_date: '' });
      await fetchPeriods();
    } catch (e: any) {
      setError(e.message || 'Failed to create');
    }
  };

  const updateStatus = async (id: number, action: 'open' | 'close') => {
    try {
      const res = await fetch(`/api/admin/kpi/periods?hash=${sessionHash}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      await fetchPeriods();
    } catch (e) {
      setError('Failed to update status');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" role="status" /></div>;
  }

  return (
    <div>
      {error && <div className="alert alert-danger" style={{ fontSize: 12 }}>{error}</div>}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="mb-3" style={{ fontSize: 14, fontWeight: 600 }}>Create Period</h6>
              <form onSubmit={createPeriod}>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: 11 }}>Name</label>
                  <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ fontSize: 12 }} />
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: 11 }}>Start Date</label>
                  <input type="date" className="form-control" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} style={{ fontSize: 12 }} />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: 11 }}>End Date</label>
                  <input type="date" className="form-control" required value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} style={{ fontSize: 12 }} />
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" checked={form.has_midyear} onChange={e => setForm({ ...form, has_midyear: e.target.checked })} />
                  <label className="form-check-label" style={{ fontSize: 12 }}>Enable Mid-Year Review</label>
                </div>
                {form.has_midyear && (
                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: 11 }}>Mid-Year Start</label>
                      <input type="date" className="form-control" value={form.mid_review_start_date} onChange={e => setForm({ ...form, mid_review_start_date: e.target.value })} style={{ fontSize: 12 }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: 11 }}>Mid-Year End</label>
                      <input type="date" className="form-control" value={form.mid_review_end_date} onChange={e => setForm({ ...form, mid_review_end_date: e.target.value })} style={{ fontSize: 12 }} />
                    </div>
                  </div>
                )}
                <div className="d-flex justify-content-end">
                  {canCreate && <button className="btn btn-primary" type="submit" style={{ fontSize: 12 }}>Create</button>}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="table-responsive">
            <table className="table table-hover" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th>Name</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th className="text-center">Assignments</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {periods.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">No periods</td></tr>
                ) : periods.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.start_date} → {p.end_date}</td>
                    <td>
                      {p.status === 'open' ? (
                        <span className="badge bg-success" style={{ fontSize: 10 }}>OPEN</span>
                      ) : p.status === 'closed' ? (
                        <span className="badge bg-secondary" style={{ fontSize: 10 }}>CLOSED</span>
                      ) : (
                        <span className="badge bg-info" style={{ fontSize: 10 }}>DRAFT</span>
                      )}
                    </td>
                    <td className="text-center">{p.submitted_count}/{p.total_assignments}</td>
                    <td className="text-end">
                      <div className="btn-group" role="group">
                        {p.status !== 'open' && canOpen && (
                          <button className="btn btn-sm btn-outline-primary" style={{ fontSize: 10 }} onClick={() => updateStatus(p.id, 'open')}>Open</button>
                        )}
                        {p.status !== 'closed' && canClose && (
                          <button className="btn btn-sm btn-outline-danger" style={{ fontSize: 10 }} onClick={() => updateStatus(p.id, 'close')}>Close</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


