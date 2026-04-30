'use client';

import { useEffect, useState } from 'react';

interface EmpAssignment {
  id: number;
  period_id: number;
  period_name: string;
  template_title: string;
  unit: 'number' | 'percent' | 'boolean';
  target_value: number;
  progress_percent: number;
  status: string;
}

export default function EmployeeKpis({ sessionHash }: { sessionHash: string }) {
  const [items, setItems] = useState<EmpAssignment[]>([]);
  const [periodId, setPeriodId] = useState<number | ''>('' as any);
  const [periods, setPeriods] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // View-only mode: employees cannot update KPIs
  const viewOnly = true;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, a] = await Promise.all([
        fetch(`/api/admin/kpi/periods?hash=${sessionHash}`),
        fetch(`/api/employee/kpi?hash=${sessionHash}${periodId ? `&period_id=${periodId}` : ''}`)
      ]);
      const pd = await p.json(); const ad = await a.json();
      if (!a.ok) throw new Error(ad.error || 'Failed');
      const open = (pd.periods || []).filter((x: any) => x.status !== 'closed');
      setPeriods(open);
      // Auto-select the only open period to enable Export PDF immediately
      if (!periodId && open.length === 1) {
        setPeriodId(open[0].id);
      }
      setItems(ad.assignments || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [periodId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Updates and submissions are disabled in view-only mode

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status" /></div>;

  return (
    <div>
      {error && <div className="alert alert-danger" style={{ fontSize: 12 }}>{error}</div>}
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div style={{ maxWidth: 320 }}>
          <label className="form-label" style={{ fontSize: 11 }}>Select Period</label>
          <select className="form-select" value={periodId} onChange={e => setPeriodId(e.target.value ? Number(e.target.value) : '')} style={{ fontSize: 12 }}>
            <option value="">Current / All Open</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="d-flex gap-2">
          {(() => {
            const effectivePeriodId = periodId || (items.length > 0 ? items[0].period_id : '');
            const disabled = !effectivePeriodId;
            const href = disabled ? '#' : `/api/employee/kpi/report?hash=${sessionHash}&period_id=${effectivePeriodId}`;
            return (
              <a className={`btn btn-outline-secondary ${disabled ? 'disabled' : ''}`} style={{ fontSize: 12 }} href={href} target="_blank" rel="noreferrer">Export PDF</a>
            );
          })()}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th>Template</th>
              <th>Target</th>
              <th>Progress</th>
              <th>Status</th>
              { !viewOnly && <th className="text-end">Update</th> }
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4">No KPI assignments</td></tr>
            ) : items.map(it => (
              <tr key={it.id}>
                <td>{it.template_title}</td>
                <td>{it.target_value}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress w-100" style={{ height: 6 }}>
                      <div className="progress-bar" role="progressbar" style={{ width: `${it.progress_percent}%` }} />
                    </div>
                    <span>{it.progress_percent}%</span>
                  </div>
                </td>
                <td>{it.status}</td>
                { !viewOnly && (
                  <td className="text-end">
                    <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
                      {/* Update controls (disabled in view-only) */}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-muted" style={{ fontSize: 12 }}>Note: KPI progress is managed by HR/Admin. This page is view-only.</div>
    </div>
  );
}


