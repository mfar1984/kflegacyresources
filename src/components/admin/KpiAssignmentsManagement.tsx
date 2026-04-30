'use client';

import { useEffect, useState } from 'react';

interface AssignmentRow {
  id: number;
  period_id: number;
  employee_id: number;
  template_id: number;
  target_value: number;
  weight: number;
  status: string;
  template_code: string;
  template_title: string;
  unit: string;
  employee_number: string;
  employee_name: string;
}

interface TemplateRow { id: number; code: string; title: string; unit: string; default_weight: number }
interface PeriodRow { id: number; name: string; status: string }
interface EmployeeRow { id: number; full_name: string }
interface AdminRow { id: number; username: string; full_name?: string }

export default function KpiAssignmentsManagement({ sessionHash }: { sessionHash: string }) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [periods, setPeriods] = useState<PeriodRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<number | ''>('' as any);

  const [form, setForm] = useState({ period_id: '', employee_id: '', template_id: '', target_value: '', weight: '' });
  const [permissions, setPermissions] = useState<string[]>([]);
  const canCreate = permissions.includes('kpi_assignments_create');
  const canEdit = permissions.includes('kpi_assignments_edit');
  const [updateModal, setUpdateModal] = useState<{ open: boolean; assignment_id: number | null; actual_value: string; remarks: string; evidence?: File | null }>(
    { open: false, assignment_id: null, actual_value: '', remarks: '', evidence: null }
  );

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [p, t, e, a] = await Promise.all([
        fetch(`/api/admin/kpi/periods?hash=${sessionHash}`),
        fetch(`/api/admin/kpi/templates?hash=${sessionHash}`),
        fetch(`/api/admin/employees?hash=${sessionHash}`),
        fetch(`/api/admin/admins?hash=${sessionHash}`)
      ]);
      const pd = await p.json(); const td = await t.json(); const ed = await e.json(); const ad = await a.json();
      setPeriods(pd.periods || []);
      setTemplates((td.templates || td) as any);
      setEmployees(ed.employees || []);
      setAdmins(ad.admins || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const params = new URLSearchParams({ hash: sessionHash });
      if (filterPeriod) params.append('period_id', String(filterPeriod));
      const res = await fetch(`/api/admin/kpi/assignments?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAssignments(data.assignments || []);
    } catch (e) {
      setError('Failed to load assignments');
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAssignments(); }, [filterPeriod]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { (async () => { try { const r = await fetch(`/api/admin/user-permissions?hash=${sessionHash}`); const d = await r.json(); if (r.ok) setPermissions(d.permissions || []);} catch {} })(); }, [sessionHash]);

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        period_id: Number(form.period_id),
        employee_id: Number(form.employee_id),
        template_id: Number(form.template_id),
        target_value: Number(form.target_value || 0),
        weight: Number(form.weight || 10),
        reviewer_admin_id: Number((document.getElementById('reviewer_admin_id') as HTMLSelectElement)?.value || '') || undefined
      };
      const res = await fetch(`/api/admin/kpi/assignments?hash=${sessionHash}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setForm({ period_id: '', employee_id: '', template_id: '', target_value: '', weight: '' });
      await fetchAssignments();
    } catch (e: any) {
      setError(e.message || 'Failed to create');
    }
  };

  const submitForReview = async (assignmentId: number) => {
    try {
      const res = await fetch(`/api/admin/kpi/assignments?hash=${sessionHash}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assignmentId, status: 'submitted' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      await fetchAssignments();
    } catch (e: any) {
      setError(e.message || 'Failed to submit for review');
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
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
            ))}
          </select>
        </div>
        <div className="col-md-9 d-flex align-items-end justify-content-end">
          <form className="d-flex gap-2" encType="multipart/form-data" onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            if (!filterPeriod) { alert('Select a period to import into'); return; }
            fd.append('period_id', String(filterPeriod));
            try {
              const r = await fetch(`/api/admin/kpi/assignments-import?hash=${sessionHash}`, { method: 'POST', body: fd });
              const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed');
              await fetchAssignments();
            } catch (e) { setError('Failed to import CSV'); }
          }}>
            <input type="file" name="file" accept=".csv" className="form-control" style={{ fontSize: 12, maxWidth: 280 }} />
            <button className="btn btn-outline-secondary" type="submit" style={{ fontSize: 12 }}>Import CSV</button>
          </form>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h6 className="mb-3" style={{ fontSize: 14, fontWeight: 600 }}>Create Assignment</h6>
          <form className="row g-2" onSubmit={createAssignment}>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: 11 }}>Period</label>
              <select className="form-select" required value={form.period_id} onChange={e => setForm({ ...form, period_id: e.target.value })} style={{ fontSize: 12 }}>
                <option value="">Select</option>
                {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: 11 }}>Employee</label>
              <select className="form-select" required value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} style={{ fontSize: 12 }}>
                <option value="">Select</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: 11 }}>Template</label>
              <select className="form-select" required value={form.template_id} onChange={e => setForm({ ...form, template_id: e.target.value })} style={{ fontSize: 12 }}>
                <option value="">Select</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.code} - {t.title}</option>)}
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label" style={{ fontSize: 11 }}>Target</label>
              <input className="form-control" value={form.target_value} onChange={e => setForm({ ...form, target_value: e.target.value })} style={{ fontSize: 12 }} />
            </div>
            <div className="col-md-1">
              <label className="form-label" style={{ fontSize: 11 }}>Weight</label>
              <input className="form-control" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} style={{ fontSize: 12 }} />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ fontSize: 11 }}>Reviewer</label>
              <select id="reviewer_admin_id" className="form-select" style={{ fontSize: 12 }}>
                <option value="">(Optional)</option>
                {admins.map(adm => <option key={adm.id} value={adm.id}>{adm.full_name || adm.username}</option>)}
              </select>
            </div>
            <div className="col-md-1 d-flex align-items-end">
              {canCreate && <button className="btn btn-primary w-100" type="submit" style={{ fontSize: 12 }}>Add</button>}
            </div>
          </form>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th>Employee</th>
              <th>Template</th>
              <th>Target</th>
              <th>Weight</th>
              <th>Status</th>
              {canEdit && <th className="text-end">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr><td colSpan={canEdit ? 6 : 5} className="text-center py-4">No assignments</td></tr>
            ) : assignments.map(a => (
              <tr key={a.id}>
                <td>{a.employee_name}</td>
                <td>{a.template_code} - {a.template_title}</td>
                <td>{a.target_value}</td>
                <td>{a.weight}</td>
                <td>{a.status}</td>
                {canEdit && (
                  <td className="text-end">
                    <div className="btn-group" role="group">
                      <button className="btn btn-sm btn-outline-primary" style={{ fontSize: 10 }} onClick={() => setUpdateModal({ open: true, assignment_id: a.id, actual_value: '', remarks: '' })}>Update</button>
                      <button className="btn btn-sm btn-outline-success" style={{ fontSize: 10 }} onClick={() => submitForReview(a.id)} disabled={a.status === 'submitted'}>Submit</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {updateModal.open && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: 14 }}>Update Progress</h5>
                <button className="btn-close" onClick={() => setUpdateModal({ open: false, assignment_id: null, actual_value: '', remarks: '' })} />
              </div>
              <form encType="multipart/form-data" onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (!updateModal.assignment_id) return;
                  const fd = new FormData();
                  fd.append('assignment_id', String(updateModal.assignment_id));
                  if (updateModal.actual_value !== '') fd.append('actual_value', updateModal.actual_value);
                  if (updateModal.remarks) fd.append('remarks', updateModal.remarks);
                  if (updateModal.evidence) fd.append('evidence', updateModal.evidence);
                  const r = await fetch(`/api/admin/kpi/updates?hash=${sessionHash}`, { method: 'POST', body: fd });
                  const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed');
                  setUpdateModal({ open: false, assignment_id: null, actual_value: '', remarks: '', evidence: null });
                  await fetchAssignments();
                } catch (e: any) {
                  setError(e.message || 'Failed to update progress');
                }
              }}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label" style={{ fontSize: 11 }}>Actual Value</label>
                    <input className="form-control" style={{ fontSize: 12 }} value={updateModal.actual_value} onChange={e => setUpdateModal({ ...updateModal, actual_value: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontSize: 11 }}>Evidence (optional)</label>
                    <input type="file" className="form-control" style={{ fontSize: 12 }} onChange={e => setUpdateModal({ ...updateModal, evidence: (e.target.files && e.target.files[0]) || null })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontSize: 11 }}>Remarks</label>
                    <textarea className="form-control" style={{ fontSize: 12 }} rows={2} value={updateModal.remarks} onChange={e => setUpdateModal({ ...updateModal, remarks: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setUpdateModal({ open: false, assignment_id: null, actual_value: '', remarks: '' })}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }}>Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


