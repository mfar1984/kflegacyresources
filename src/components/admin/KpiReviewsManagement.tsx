'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

interface ReviewItem {
  id: number;
  period_id: number;
  employee_name: string;
  employee_id: number;
  template_title: string;
  status: string;
  assignment_id: number;
}

export default function KpiReviewsManagement({ sessionHash }: { sessionHash: string }) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [periods, setPeriods] = useState<{ id: number; name: string }[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<number | ''>('' as any);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<{ open: boolean; assignment_id: number | null; decision: 'approve' | 'reject'; score: string; remarks: string; reviewer_role: 'PPP' | 'PPK' | 'HR'; phase: 'mid' | 'final' }>({ open: false, assignment_id: null, decision: 'approve', score: '', remarks: '', reviewer_role: 'PPP', phase: 'final' });
  const [permissions, setPermissions] = useState<string[]>([]);
  const canReview = permissions.includes('kpi_reviews_approve') || permissions.includes('kpi_reviews_reject');
  const canCompetency = permissions.includes('kpi_competencies_view') || permissions.includes('kpi_competencies_edit') || permissions.includes('kpi_competencies_create');
  const [competencyModal, setCompetencyModal] = useState<{ open: boolean; employee_id: number | null; period_id: number | null; phase: 'mid' | 'final'; items: Array<{ competency_id: number; code: string; title: string; score: string }> }>({ open: false, employee_id: null, period_id: null, phase: 'final', items: [] });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, a] = await Promise.all([
        fetch(`/api/admin/kpi/periods?hash=${sessionHash}`),
        fetch(`/api/admin/kpi/assignments?hash=${sessionHash}${filterPeriod ? `&period_id=${filterPeriod}` : ''}`)
      ]);
      const pd = await p.json();
      const ad = await a.json();
      const rows = (ad.assignments || []).filter((r: any) => r.status === 'submitted');
      setPeriods(pd.periods || []);
      setItems(rows.map((r: any) => ({ id: r.id, assignment_id: r.id, period_id: r.period_id, employee_id: r.employee_id, employee_name: r.employee_name, template_title: r.template_title, status: r.status })));
    } catch (e) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterPeriod]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { (async () => { try { const r = await fetch(`/api/admin/user-permissions?hash=${sessionHash}`); const d = await r.json(); if (r.ok) setPermissions(d.permissions || []);} catch {} })(); }, [sessionHash]);

  const openReview = (assignment_id: number) => {
    setModal({ open: true, assignment_id, decision: 'approve', score: '', remarks: '', reviewer_role: 'PPP', phase: 'final' });
  };

  const submitReview = async () => {
    if (!modal.assignment_id) return;
    try {
      const payload = { assignment_id: modal.assignment_id, decision: modal.decision, score: modal.score ? Number(modal.score) : undefined, remarks: modal.remarks, reviewer_role: modal.reviewer_role, phase: modal.phase };
      const res = await fetch(`/api/admin/kpi/reviews?hash=${sessionHash}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setModal({ open: false, assignment_id: null, decision: 'approve', score: '', remarks: '', reviewer_role: 'PPP', phase: 'final' });
      await fetchData();
      
      // Emit notification to employee
      try {
        const empId = items.find(i => i.assignment_id === (modal.assignment_id as number))?.employee_id;
        if (empId) {
          const socket = getSocket();
          if (socket && socket.connected) {
            const assignmentId = modal.assignment_id;
            const assignment = items.find(i => i.assignment_id === assignmentId);
            const templateTitle = assignment?.template_title || 'KPI';
            console.log('📤 Emitting task_reviewed for KPI:', templateTitle, 'to employee:', empId);
            socket.emit('task_reviewed', {
              module: 'kpi',
              action: modal.decision,
              result: modal.decision === 'approve' ? 'approved' : 'rejected',
              employeeId: empId,
              entityId: assignmentId?.toString() || null,
              message: `Your KPI "${templateTitle}" has been ${modal.decision}d`,
              view: 'employee-kpis'
            });
            console.log('✅ Notification emitted successfully');
          } else {
            console.warn('⚠️ Socket not connected, notification not sent');
          }
        }
      } catch (err) {
        console.error('❌ Error emitting notification:', err);
      }
    } catch (e) {
      setError('Failed to submit review');
    }
  };

  const openCompetencies = async (employee_id: number) => {
    try {
      const resC = await fetch(`/api/admin/kpi/competencies?hash=${sessionHash}`);
      const dataC = await resC.json();
      const list = (dataC.competencies || []).map((c: any) => ({ competency_id: c.id, code: c.code, title: c.title, score: '' }));
      setCompetencyModal({ open: true, employee_id, period_id: (filterPeriod as number) || null, phase: 'final', items: list });
    } catch (e) {
      setError('Failed to open competencies');
    }
  };

  const saveCompetencies = async () => {
    if (!competencyModal.open || !competencyModal.employee_id || !competencyModal.period_id) return;
    try {
      const payload = { period_id: competencyModal.period_id, employee_id: competencyModal.employee_id, phase: competencyModal.phase, items: competencyModal.items.map(i => ({ competency_id: i.competency_id, score: Number(i.score || 0) })) };
      const r = await fetch(`/api/admin/kpi/competency-scores?hash=${sessionHash}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed');
      setCompetencyModal({ open: false, employee_id: null, period_id: null, phase: 'final', items: [] });
    } catch (e) {
      setError('Failed to save competency scores');
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status" /></div>;

  return (
    <div>
      {error && <div className="alert alert-danger" style={{ fontSize: 12 }}>{error}</div>}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className="form-label" style={{ fontSize: 11 }}>Filter by Period</label>
          <select className="form-select" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value ? Number(e.target.value) : '')} style={{ fontSize: 12 }}>
            <option value="">All</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th>Employee</th>
              <th>Template</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4">No submitted assignments</td></tr>
            ) : items.map(it => (
              <tr key={it.id}>
                <td>{it.employee_name}</td>
                <td>{it.template_title}</td>
                <td>{it.status}</td>
                <td className="text-end">
                  <div className="btn-group" role="group">
                    {canReview && (
                      <button className="btn btn-sm btn-outline-primary" style={{ fontSize: 10 }} onClick={() => openReview(it.assignment_id)}>Review</button>
                    )}
                    {filterPeriod && canCompetency && (
                      <button className="btn btn-sm btn-outline-success" style={{ fontSize: 10 }} onClick={() => openCompetencies(it.employee_id)}>Competencies</button>
                    )}
                    {filterPeriod && (
                      <a className="btn btn-sm btn-outline-secondary" style={{ fontSize: 10 }} href={`/api/admin/kpi/report?hash=${sessionHash}&employee_id=${it.employee_id}&period_id=${filterPeriod}`} target="_blank" rel="noreferrer">Export PDF</a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: 14 }}>Review KPI Assignment</h5>
                <button className="btn-close" onClick={() => setModal({ ...modal, open: false })} />
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: 11 }}>Decision</label>
                  <select className="form-select" value={modal.decision} onChange={e => setModal({ ...modal, decision: e.target.value as any })} style={{ fontSize: 12 }}>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: 11 }}>Reviewer Role</label>
                    <select className="form-select" value={modal.reviewer_role} onChange={e => setModal({ ...modal, reviewer_role: e.target.value as any })} style={{ fontSize: 12 }}>
                      <option value="PPP">PPP</option>
                      <option value="PPK">PPK</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: 11 }}>Phase</label>
                    <select className="form-select" value={modal.phase} onChange={e => setModal({ ...modal, phase: e.target.value as any })} style={{ fontSize: 12 }}>
                      <option value="mid">Mid-Year</option>
                      <option value="final">Final</option>
                    </select>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: 11 }}>Score (0-100)</label>
                  <input className="form-control" value={modal.score} onChange={e => setModal({ ...modal, score: e.target.value })} style={{ fontSize: 12 }} />
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: 11 }}>Remarks</label>
                  <textarea className="form-control" rows={2} value={modal.remarks} onChange={e => setModal({ ...modal, remarks: e.target.value })} style={{ fontSize: 12 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setModal({ ...modal, open: false })}>Cancel</button>
                <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={submitReview}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {competencyModal.open && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: 14 }}>Competency Scoring ({competencyModal.phase})</h5>
                <button className="btn-close" onClick={() => setCompetencyModal({ open: false, employee_id: null, period_id: null, phase: 'final', items: [] })} />
              </div>
              <div className="modal-body">
                <div className="row g-2 mb-2">
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: 11 }}>Phase</label>
                    <select className="form-select" style={{ fontSize: 12 }} value={competencyModal.phase} onChange={e => setCompetencyModal({ ...competencyModal, phase: e.target.value as any })}>
                      <option value="mid">Mid-Year</option>
                      <option value="final">Final</option>
                    </select>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm" style={{ fontSize: 12 }}>
                    <thead><tr><th>Code</th><th>Title</th><th style={{ width: 140 }}>Score (0-100)</th></tr></thead>
                    <tbody>
                      {competencyModal.items.map((c, idx) => (
                        <tr key={c.competency_id}>
                          <td>{c.code}</td>
                          <td>{c.title}</td>
                          <td>
                            <input className="form-control" style={{ fontSize: 12 }} value={c.score} onChange={e => {
                              const val = e.target.value; const items = [...competencyModal.items]; items[idx] = { ...items[idx], score: val }; setCompetencyModal({ ...competencyModal, items });
                            }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setCompetencyModal({ open: false, employee_id: null, period_id: null, phase: 'final', items: [] })}>Cancel</button>
                <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={saveCompetencies}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


