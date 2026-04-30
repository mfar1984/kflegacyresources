'use client';

import { useEffect, useState } from 'react';

interface Period { id: number; name: string; status: string }
interface ResultRow { id: number; employee_id: number; employee_name: string; final_score: number; grade: string | null; bonus_amount: number; }

export default function KpiResultsManagement({ sessionHash }: { sessionHash: string }) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodId, setPeriodId] = useState<number | ''>('' as any);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [p, r] = await Promise.all([
        fetch(`/api/admin/kpi/periods?hash=${sessionHash}`),
        fetch(`/api/admin/kpi/results?hash=${sessionHash}${periodId ? `&period_id=${periodId}` : ''}`)
      ]);
      const pd = await p.json();
      const rd = await r.json();
      setPeriods(pd.periods || []);
      if (r.ok) setRows(rd.results || []); else setError(rd.error || 'Failed to load results');
    } catch (e) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [periodId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status" /></div>;

  return (
    <div>
      {error && <div className="alert alert-danger" style={{ fontSize: 12 }}>{error}</div>}
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div style={{ maxWidth: 320 }}>
          <label className="form-label" style={{ fontSize: 11 }}>Filter by Period</label>
          <select className="form-select" value={periodId} onChange={e => setPeriodId(e.target.value ? Number(e.target.value) : '')} style={{ fontSize: 12 }}>
            <option value="">All (Closed)</option>
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
            ))}
          </select>
        </div>
        <div>
          <a className={`btn btn-outline-secondary ${!periodId ? 'disabled' : ''}`} style={{ fontSize: 12 }} href={periodId ? `/api/admin/kpi/results-export?hash=${sessionHash}&period_id=${periodId}` : '#'} target="_blank" rel="noreferrer">Export CSV</a>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th>Employee</th>
              <th className="text-end">Final Score</th>
              <th className="text-center">Grade</th>
              <th className="text-end">Bonus</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4">No results</td></tr>
            ) : rows.map(r => (
              <tr key={r.id}>
                <td>{r.employee_name}</td>
                <td className="text-end">{Number(r.final_score).toFixed(2)}</td>
                <td className="text-center">{r.grade || '-'}</td>
                <td className="text-end">{Number(r.bonus_amount).toFixed(2)}</td>
                <td className="text-end">
                  {periodId && (
                    <a className="btn btn-sm btn-outline-secondary" style={{ fontSize: 10 }} href={`/api/admin/kpi/report?hash=${sessionHash}&employee_id=${r.employee_id}&period_id=${periodId}`} target="_blank" rel="noreferrer">PDF</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


