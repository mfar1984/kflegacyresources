'use client';
import { useState, useEffect } from 'react';
import PayslipPrintView from '@/components/admin/PayslipPrintView';

interface Payslip {
  id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  gross_salary: number;
  net_salary: number;
  status: string;
}

export default function EmployeePayslips({ sessionHash, employeeId }: { sessionHash: string; employeeId: number | null }) {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [printId, setPrintId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/employee/payslips?hash=${sessionHash}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setPayslips(data.payslips || []))
      .catch(() => setPayslips([]))
      .finally(() => setLoading(false));
  }, [sessionHash]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>My Payslips</h2>
      <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ fontSize: 11, padding: '12px' }}>Period</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Start Date</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>End Date</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Gross Salary</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Net Salary</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Status</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payslips.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4">No payslips found</td></tr>
                ) : (
                  payslips.map((slip) => (
                    <tr key={slip.id}>
                      <td style={{ padding: '12px' }}>{slip.period_name}</td>
                      <td style={{ padding: '12px' }}>{new Date(slip.start_date).toLocaleDateString('en-MY')}</td>
                      <td style={{ padding: '12px' }}>{new Date(slip.end_date).toLocaleDateString('en-MY')}</td>
                      <td style={{ padding: '12px' }}>RM {parseFloat(String(slip.gross_salary || 0)).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>RM {parseFloat(String(slip.net_salary || 0)).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}><span className="badge bg-success" style={{ fontSize: 10 }}>{slip.status.toUpperCase()}</span></td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => setPrintId(slip.id)} className="btn btn-sm btn-outline-primary" style={{ fontSize: 10, padding: '4px 8px' }}>
                          <i className="bi bi-printer"></i> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {printId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl" style={{ maxWidth: '95%' }}>
            <div className="modal-content">
              <div className="modal-body" style={{ padding: 0 }}>
                <PayslipPrintView recordId={printId} hash={sessionHash} onClose={() => setPrintId(null)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
