'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';
import PayslipPrintView from './PayslipPrintView';
import { getSocket } from '@/lib/socket';

interface PayrollPeriod {
  id: number;
  period_name: string;
  period_month: number;
  period_year: number;
  start_date: string;
  end_date: string;
  payment_date: string;
  status: 'draft' | 'processing' | 'approved' | 'paid' | 'closed';
  total_employees: number;
  total_gross_salary: number;
  total_deductions: number;
  total_net_salary: number;
  processed_date: string | null;
  approved_date: string | null;
  processed_by_name?: string;
  approved_by_name?: string;
  remarks?: string;
}

interface PayrollRecord {
  id: number;
  payslip_number: string;
  period_name: string;
  period_month: number;
  period_year: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  department_name: string;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  meal_allowance: number;
  other_allowances: number;
  overtime_amount: number;
  bonus_amount: number;
  gross_salary: number;
  epf_employee: number;
  socso_employee: number;
  eis_employee: number;
  tax_deduction: number;
  loan_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled';
  payment_date: string | null;
  payment_method: string;
}

interface PayrollManagementProps {
  sessionHash: string;
}

export default function PayrollManagement({ sessionHash }: PayrollManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [view, setView] = useState<'periods' | 'records'>('periods');
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showViewPeriodModal, setShowViewPeriodModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [printRecordId, setPrintRecordId] = useState<number | null>(null);
  
  // New modals for period workflow
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [closeRemarks, setCloseRemarks] = useState('');
  
  const [periodData, setPeriodData] = useState({
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    payment_date: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (view === 'periods') {
          const response = await fetch(`/api/admin/payroll/periods?hash=${sessionHash}&year=${filterYear}`);
          if (response.ok) {
            const data = await response.json();
            setPeriods(data);
          }
        } else {
          const response = await fetch(`/api/admin/payroll/records?hash=${sessionHash}&year=${filterYear}`);
          if (response.ok) {
            const data = await response.json();
            setRecords(data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionHash, view, filterYear]);

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/admin/payroll/periods?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(periodData)
      });

      if (response.ok) {
        alert('Payroll period created successfully');
        setShowPeriodModal(false);
        setPeriodData({
          period_month: new Date().getMonth() + 1,
          period_year: new Date().getFullYear(),
          payment_date: ''
        });
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create payroll period');
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create payroll period');
    }
  };

  const handleProcessPayroll = async (periodId: number) => {
    if (!confirm('Are you sure you want to process this payroll period? This will generate payslips for all active employees.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/payroll/process?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_id: periodId })
      });

      if (response.ok) {
        alert('Payroll processed successfully');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to process payroll');
      }
    } catch (error) {
      console.error('Process error:', error);
      alert('Failed to process payroll');
    }
  };

  const handleViewRecord = async (record: PayrollRecord) => {
    try {
      const response = await fetch(`/api/admin/payroll/records/${record.id}?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedRecord(data.record);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching record details:', error);
    }
  };

  const handleDeletePeriod = async (periodId: number) => {
    if (!confirm('⚠️ WARNING: Delete this payroll period will also DELETE ALL PAYSLIPS for this period!\n\nThis action cannot be undone. Are you sure?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/payroll/periods/${periodId}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Payroll period deleted successfully');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete payroll period');
      }
    } catch (error) {
      console.error('Delete period error:', error);
      alert('Failed to delete payroll period');
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!confirm('Are you sure you want to delete this payslip? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/payroll/records/${recordId}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Payslip deleted successfully');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete payslip');
      }
    } catch (error) {
      console.error('Delete record error:', error);
      alert('Failed to delete payslip');
    }
  };

  const handleApprovePeriod = async () => {
    if (!selectedPeriod) return;

    try {
      const response = await fetch(`/api/admin/payroll/approve-period?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_id: selectedPeriod.id,
          remarks: approvalRemarks
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Payroll period approved successfully');
        
        // Notify all employees with payslips in this period
        try {
          // Fetch employee IDs from payroll records
          const recordsResponse = await fetch(`/api/admin/payroll/records?hash=${sessionHash}&period_id=${selectedPeriod.id}`);
          if (recordsResponse.ok) {
            const recordsData = await recordsResponse.json();
            const employeeIds = [...new Set((recordsData.records || []).map((r: PayrollRecord) => r.employee_id))] as number[];
            
            const socket = getSocket();
            if (socket && socket.connected) {
              console.log(`📤 Emitting task_reviewed for payroll approval to ${employeeIds.length} employees`);
              // Notify each employee
              employeeIds.forEach((empId: number) => {
                socket.emit('task_reviewed', {
                  module: 'payslip',
                  action: 'approve',
                  result: 'approved',
                  employeeId: empId,
                  entityId: selectedPeriod.id.toString(),
                  message: `Your payslip for ${selectedPeriod.period_name} has been approved`,
                  view: 'employee-payslips'
                });
              });
              console.log('✅ Notifications emitted successfully');
            } else {
              console.warn('⚠️ Socket not connected, notifications not sent');
            }
          }
        } catch (err) {
          console.error('❌ Error emitting notifications:', err);
        }
        
        setShowApproveModal(false);
        setApprovalRemarks('');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve payroll period');
      }
    } catch (error) {
      console.error('Approve period error:', error);
      alert('Failed to approve payroll period');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPeriod || !paymentDate || !paymentProof) {
      alert('Payment date and payment proof are required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('period_id', selectedPeriod.id.toString());
      formData.append('payment_date', paymentDate);
      formData.append('payment_reference', paymentReference);
      formData.append('payment_proof', paymentProof);
      formData.append('remarks', approvalRemarks);

      const response = await fetch(`/api/admin/payroll/mark-paid?hash=${sessionHash}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Payroll period marked as paid successfully');
        
        // Notify all employees with payslips in this period
        try {
          // Fetch employee IDs from payroll records
          const recordsResponse = await fetch(`/api/admin/payroll/records?hash=${sessionHash}&period_id=${selectedPeriod.id}`);
          if (recordsResponse.ok) {
            const recordsData = await recordsResponse.json();
            const employeeIds = [...new Set((recordsData.records || []).map((r: PayrollRecord) => r.employee_id))] as number[];
            
            const socket = getSocket();
            if (socket && socket.connected) {
              console.log(`📤 Emitting task_reviewed for payroll payment to ${employeeIds.length} employees`);
              // Notify each employee
              employeeIds.forEach((empId: number) => {
                socket.emit('task_reviewed', {
                  module: 'payslip',
                  action: 'paid',
                  result: 'paid',
                  employeeId: empId,
                  entityId: selectedPeriod.id.toString(),
                  message: `Your payslip for ${selectedPeriod.period_name} has been paid`,
                  view: 'employee-payslips'
                });
              });
              console.log('✅ Notifications emitted successfully');
            } else {
              console.warn('⚠️ Socket not connected, notifications not sent');
            }
          }
        } catch (err) {
          console.error('❌ Error emitting notifications:', err);
        }
        
        setShowMarkPaidModal(false);
        setPaymentDate('');
        setPaymentReference('');
        setPaymentProof(null);
        setApprovalRemarks('');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to mark payroll period as paid');
      }
    } catch (error) {
      console.error('Mark as paid error:', error);
      alert('Failed to mark payroll period as paid');
    }
  };

  const handleClosePeriod = async () => {
    if (!selectedPeriod) return;

    if (!confirm('⚠️ WARNING: Closing this period will LOCK it permanently for audit purposes.\n\nYou will NOT be able to edit or delete this period after closing.\n\nAre you sure?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/payroll/close-period?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_id: selectedPeriod.id,
          remarks: closeRemarks
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Payroll period closed successfully');
        setShowCloseModal(false);
        setCloseRemarks('');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to close payroll period');
      }
    } catch (error) {
      console.error('Close period error:', error);
      alert('Failed to close payroll period');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: '#9ca3af', text: 'Draft' },
      processing: { bg: '#f59e0b', text: 'Processing' },
      pending: { bg: '#f59e0b', text: 'Pending' },
      approved: { bg: '#10b981', text: 'Approved' },
      paid: { bg: '#3b82f6', text: 'Paid' },
      closed: { bg: '#6b7280', text: 'Closed' },
      cancelled: { bg: '#ef4444', text: 'Cancelled' }
    };
    const badge = badges[status as keyof typeof badges] || badges.draft;
    return (
      <span style={{
        backgroundColor: badge.bg,
        color: '#ffffff',
        padding: '4px 8px',
        borderRadius: '2px',
        fontSize: '10px',
        fontWeight: 500
      }}>
        {badge.text}
      </span>
    );
  };

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const filteredPeriods = periods.filter((period) => {
    const matchesStatus = !filterStatus || period.status === filterStatus;
    return matchesStatus;
  });

  const filteredRecords = records.filter((record) => {
    const matchesStatus = !filterStatus || record.status === filterStatus;
    return matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
        <p className="text-muted mb-0" style={{ fontSize: 12 }}>Loading payroll management...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
            Payroll Management
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage employee salaries, deductions and payslips
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${view === 'periods' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setView('periods')}
              style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px 0 0 6px' }}
            >
              <i className="bi bi-calendar3 me-2"></i>
              Periods
            </button>
            <button
              type="button"
              className={`btn ${view === 'records' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setView('records')}
              style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '0 6px 6px 0' }}
            >
              <i className="bi bi-receipt me-2"></i>
              Payslips
            </button>
          </div>
          
          {view === 'periods' && (
            <PermissionButton
              sessionHash={sessionHash}
              module="payroll"
              action="create"
              className="btn btn-primary"
              onClick={() => setShowPeriodModal(true)}
              style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Create Period
            </PermissionButton>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ fontSize: '11px', borderRadius: '6px', padding: '8px 12px' }}
          >
            <option value="">All Status</option>
            {view === 'periods' ? (
              <>
                <option value="draft">Draft</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="closed">Closed</option>
              </>
            ) : (
              <>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </>
            )}
          </select>
        </div>

        <div className="col-md-2">
          <select
            className="form-select"
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            style={{ fontSize: '11px', borderRadius: '6px', padding: '8px 12px' }}
          >
            <option value={filterYear - 1}>{filterYear - 1}</option>
            <option value={filterYear}>{filterYear}</option>
            <option value={filterYear + 1}>{filterYear + 1}</option>
          </select>
        </div>

        <div className="col-md-2">
          <button
            onClick={() => {
              setFilterStatus('');
              setFilterYear(new Date().getFullYear());
            }}
            className="btn btn-outline-secondary w-100"
            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '6px' }}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Reset
          </button>
        </div>
      </div>

      {/* Periods Table */}
      {view === 'periods' && (
        <div className="table-responsive">
          <table className="table table-hover" style={{ fontSize: '11px' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px' }}>Period</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px' }}>Duration</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px' }}>Payment Date</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textAlign: 'center' }}>Employees</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textAlign: 'right' }}>Gross (RM)</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textAlign: 'right' }}>Net (RM)</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px' }}>Status</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeriods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4" style={{ fontSize: '12px', color: '#6b7280' }}>
                    <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#d1d5db', display: 'block', margin: '0 auto 12px' }}></i>
                    No payroll periods found
                  </td>
                </tr>
              ) : (
                filteredPeriods.map((period) => (
                  <tr key={period.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ fontSize: '11px', padding: '12px', fontWeight: 500 }}>
                      {getMonthName(period.period_month)} {period.period_year}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px' }}>
                      <div style={{ fontSize: '10px' }}>
                        {new Date(period.start_date).toLocaleDateString('en-MY')} - {new Date(period.end_date).toLocaleDateString('en-MY')}
                      </div>
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px' }}>
                      {new Date(period.payment_date).toLocaleDateString('en-MY')}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                      {period.total_employees}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px', fontWeight: 500, textAlign: 'right' }}>
                      {period.total_gross_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px', fontWeight: 600, textAlign: 'right', color: '#10b981' }}>
                      {period.total_net_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px' }}>{getStatusBadge(period.status)}</td>
                    <td style={{ fontSize: '11px', padding: '12px', textAlign: 'center' }}>
                      <div className="d-flex gap-1 justify-content-center">
                        {period.status === 'draft' && canPerformAction('payroll', 'process') && (
                          <button
                            onClick={() => handleProcessPayroll(period.id)}
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '2px' }}
                            title="Process Payroll"
                          >
                            <i className="bi bi-play-circle"></i>
                          </button>
                        )}
                        {period.status === 'processing' && canPerformAction('payroll', 'approve') && (
                          <button
                            onClick={() => {
                              setSelectedPeriod(period);
                              setShowApproveModal(true);
                            }}
                            className="btn btn-sm btn-outline-success"
                            style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '2px' }}
                            title="Approve Period"
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                        )}
                        {period.status === 'approved' && canPerformAction('payroll', 'pay') && (
                          <button
                            onClick={() => {
                              setSelectedPeriod(period);
                              setPaymentDate(new Date().toISOString().split('T')[0]);
                              setShowMarkPaidModal(true);
                            }}
                            className="btn btn-sm btn-outline-info"
                            style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '2px' }}
                            title="Mark as Paid"
                          >
                            <i className="bi bi-cash-coin"></i>
                          </button>
                        )}
                        {period.status === 'paid' && canPerformAction('payroll', 'close') && (
                          <button
                            onClick={() => {
                              setSelectedPeriod(period);
                              setShowCloseModal(true);
                            }}
                            className="btn btn-sm btn-outline-warning"
                            style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '2px' }}
                            title="Close Period (Lock for Audit)"
                          >
                            <i className="bi bi-lock"></i>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedPeriod(period);
                            setShowViewPeriodModal(true);
                          }}
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '2px' }}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {(period.status === 'draft' || period.status === 'processing') && canPerformAction('payroll', 'delete') && (
                          <button
                            onClick={() => handleDeletePeriod(period.id)}
                            className="btn btn-sm btn-outline-danger"
                            style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '2px' }}
                            title="Delete Period & All Payslips"
                          >
                            <i className="bi bi-trash"></i>
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
      )}

      {/* Records Table */}
      {view === 'records' && (
        <div className="table-responsive">
          <table className="table table-hover" style={{ fontSize: '11px' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px' }}>Payslip No.</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px' }}>Period</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px' }}>Employee</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textAlign: 'right' }}>Basic (RM)</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textAlign: 'right' }}>Gross (RM)</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textAlign: 'right' }}>Deductions (RM)</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textAlign: 'right' }}>Net (RM)</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px' }}>Status</th>
                <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4" style={{ fontSize: '12px', color: '#6b7280' }}>
                    <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#d1d5db', display: 'block', margin: '0 auto 12px' }}></i>
                    No payroll records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ fontSize: '11px', padding: '12px', fontWeight: 500 }}>{record.payslip_number}</td>
                    <td style={{ fontSize: '11px', padding: '12px' }}>
                      {getMonthName(record.period_month)} {record.period_year}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px' }}>
                      <div style={{ fontWeight: 500 }}>{record.employee_name}</div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>{record.employee_code}</div>
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px', textAlign: 'right' }}>
                      {record.basic_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px', fontWeight: 500, textAlign: 'right' }}>
                      {record.gross_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px', textAlign: 'right', color: '#ef4444' }}>
                      {record.total_deductions.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px', fontWeight: 600, textAlign: 'right', color: '#10b981' }}>
                      {record.net_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '11px', padding: '12px' }}>{getStatusBadge(record.status)}</td>
                    <td style={{ fontSize: '11px', padding: '12px', textAlign: 'center' }}>
                      <div className="d-flex gap-1 justify-content-center">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '2px' }}
                          title="View Payslip"
                        >
                          <i className="bi bi-file-text"></i>
                        </button>
                        <button
                          onClick={() => {
                            setPrintRecordId(record.id);
                            setShowPrintView(true);
                          }}
                          className="btn btn-sm btn-outline-success"
                          style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '2px' }}
                          title="Print Payslip"
                        >
                          <i className="bi bi-printer"></i>
                        </button>
                        {(record.status === 'draft' || record.status === 'cancelled') && canPerformAction('payroll', 'delete') && (
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="btn btn-sm btn-outline-danger"
                            style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '2px' }}
                            title="Delete Payslip"
                          >
                            <i className="bi bi-trash"></i>
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
      )}

      {/* Create Period Modal */}
      {showPeriodModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Payroll Period
                </h5>
                <button onClick={() => setShowPeriodModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleCreatePeriod}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Month <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      required
                      value={periodData.period_month}
                      onChange={(e) => setPeriodData({ ...periodData, period_month: parseInt(e.target.value) })}
                      style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
                        <option key={m} value={m}>{getMonthName(m)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Year <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      required
                      value={periodData.period_year}
                      onChange={(e) => setPeriodData({ ...periodData, period_year: parseInt(e.target.value) })}
                      style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                    >
                      {[filterYear - 1, filterYear, filterYear + 1].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Payment Date <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={periodData.payment_date}
                      onChange={(e) => setPeriodData({ ...periodData, payment_date: e.target.value })}
                      style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                    />
                    <small style={{ fontSize: '10px', color: '#6b7280' }}>Expected salary payment date</small>
                  </div>

                  <div className="alert alert-info" style={{ fontSize: '11px', padding: '12px', borderRadius: '2px' }}>
                    <i className="bi bi-info-circle me-2"></i>
                    After creating the period, you can process payroll to generate payslips for all active employees.
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowPeriodModal(false)}
                    className="btn btn-outline-secondary"
                    style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Create Period
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Payslip Modal */}
      {showViewModal && selectedRecord && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-file-text me-2"></i>
                  Payslip Details
                </h5>
                <button onClick={() => setShowViewModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Payslip Number</label>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedRecord.payslip_number}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Status</label>
                    <div>{getStatusBadge(selectedRecord.status)}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Employee</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedRecord.employee_name}</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{selectedRecord.employee_code} • {selectedRecord.department_name}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Period</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>
                      {getMonthName(selectedRecord.period_month)} {selectedRecord.period_year}
                    </div>
                  </div>

                  {/* Salary Breakdown */}
                  <div className="col-md-12 mt-4">
                    <h6 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>Earnings</h6>
                    <table className="table table-sm" style={{ fontSize: '11px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px', borderTop: 'none' }}>Basic Salary</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500, borderTop: 'none' }}>
                            RM {selectedRecord.basic_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px' }}>Housing Allowance</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                            RM {selectedRecord.housing_allowance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px' }}>Transport Allowance</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                            RM {selectedRecord.transport_allowance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px' }}>Meal Allowance</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                            RM {selectedRecord.meal_allowance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        {selectedRecord.other_allowances > 0 && (
                          <tr>
                            <td style={{ padding: '8px' }}>Other Allowances</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                              RM {selectedRecord.other_allowances.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                        {selectedRecord.overtime_amount > 0 && (
                          <tr>
                            <td style={{ padding: '8px' }}>Overtime</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                              RM {selectedRecord.overtime_amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                        {selectedRecord.bonus_amount > 0 && (
                          <tr>
                            <td style={{ padding: '8px' }}>Bonus</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                              RM {selectedRecord.bonus_amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                        <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 600 }}>
                          <td style={{ padding: '8px' }}>Gross Salary</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#10b981' }}>
                            RM {selectedRecord.gross_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-md-12">
                    <h6 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>Deductions</h6>
                    <table className="table table-sm" style={{ fontSize: '11px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px', borderTop: 'none' }}>EPF (Employee 11%)</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500, borderTop: 'none', color: '#ef4444' }}>
                            - RM {selectedRecord.epf_employee.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px' }}>SOCSO (Employee)</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500, color: '#ef4444' }}>
                            - RM {selectedRecord.socso_employee.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px' }}>EIS (Employee)</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500, color: '#ef4444' }}>
                            - RM {selectedRecord.eis_employee.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        {selectedRecord.tax_deduction > 0 && (
                          <tr>
                            <td style={{ padding: '8px' }}>Income Tax</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500, color: '#ef4444' }}>
                              - RM {selectedRecord.tax_deduction.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                        {selectedRecord.loan_deduction > 0 && (
                          <tr>
                            <td style={{ padding: '8px' }}>Loan Deduction</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500, color: '#ef4444' }}>
                              - RM {selectedRecord.loan_deduction.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                        {selectedRecord.other_deductions > 0 && (
                          <tr>
                            <td style={{ padding: '8px' }}>Other Deductions</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500, color: '#ef4444' }}>
                              - RM {selectedRecord.other_deductions.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                        <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 600 }}>
                          <td style={{ padding: '8px' }}>Total Deductions</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#ef4444' }}>
                            - RM {selectedRecord.total_deductions.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-md-12">
                    <div style={{ 
                      backgroundColor: '#dcfce7', 
                      border: '2px solid #10b981', 
                      borderRadius: '2px', 
                      padding: '16px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#166534', marginBottom: '8px', fontWeight: 500 }}>Net Salary (Take Home)</div>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: '#15803d' }}>
                        RM {selectedRecord.net_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
                >
                  <i className="bi bi-printer me-2"></i>
                  Print Payslip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Period Details Modal */}
      {showViewPeriodModal && selectedPeriod && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-calendar3 me-2"></i>
                  Payroll Period Details
                </h5>
                <button onClick={() => setShowViewPeriodModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Period Name</label>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>{selectedPeriod.period_name}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Status</label>
                    <div>{getStatusBadge(selectedPeriod.status)}</div>
                  </div>
                  <div className="col-md-4">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Start Date</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{new Date(selectedPeriod.start_date).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div className="col-md-4">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>End Date</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{new Date(selectedPeriod.end_date).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div className="col-md-4">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Payment Date</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{new Date(selectedPeriod.payment_date).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div className="col-md-3">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Total Employees</label>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}>{selectedPeriod.total_employees || 0}</div>
                  </div>
                  <div className="col-md-3">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Gross Salary (RM)</label>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>
                      {selectedPeriod.total_gross_salary?.toLocaleString('en-MY', { minimumFractionDigits: 2 }) || '0.00'}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Deductions (RM)</label>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444' }}>
                      {selectedPeriod.total_deductions?.toLocaleString('en-MY', { minimumFractionDigits: 2 }) || '0.00'}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Net Salary (RM)</label>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>
                      {selectedPeriod.total_net_salary?.toLocaleString('en-MY', { minimumFractionDigits: 2 }) || '0.00'}
                    </div>
                  </div>
                  {selectedPeriod.processed_by_name && (
                    <>
                      <div className="col-md-6">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Processed By</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedPeriod.processed_by_name}</div>
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Processed Date</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>
                          {selectedPeriod.processed_date ? new Date(selectedPeriod.processed_date).toLocaleString('en-GB') : '-'}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedPeriod.approved_by_name && (
                    <>
                      <div className="col-md-6">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Approved By</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedPeriod.approved_by_name}</div>
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Approved Date</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>
                          {selectedPeriod.approved_date ? new Date(selectedPeriod.approved_date).toLocaleString('en-GB') : '-'}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedPeriod.remarks && (
                    <div className="col-12">
                      <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Remarks</label>
                      <div style={{ fontSize: '12px', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                        {selectedPeriod.remarks}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                <button
                  onClick={() => setShowViewPeriodModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Period Modal */}
      {showApproveModal && selectedPeriod && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: 14, fontWeight: 600 }}>
                  Approve Payroll Period
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowApproveModal(false);
                    setApprovalRemarks('');
                  }}
                  style={{ fontSize: 12 }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Period:
                  </label>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{selectedPeriod.period_name}</p>
                </div>
                
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Total Employees:
                  </label>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{selectedPeriod.total_employees}</p>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Total Net Salary:
                  </label>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                    RM {selectedPeriod.total_net_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Approval Remarks:
                  </label>
                  <textarea
                    className="form-control"
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    rows={3}
                    style={{ fontSize: 12, padding: '8px 12px', borderRadius: '2px' }}
                    placeholder="Optional approval remarks..."
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowApproveModal(false);
                    setApprovalRemarks('');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: '8px 16px', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprovePeriod}
                  className="btn btn-success"
                  style={{ fontSize: 12, padding: '8px 16px', borderRadius: '6px' }}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Approve Period
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showMarkPaidModal && selectedPeriod && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: 14, fontWeight: 600 }}>
                  Mark as Paid
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowMarkPaidModal(false);
                    setPaymentDate('');
                    setPaymentReference('');
                    setPaymentProof(null);
                    setApprovalRemarks('');
                  }}
                  style={{ fontSize: 12 }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Period:
                  </label>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{selectedPeriod.period_name}</p>
                </div>
                
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Payment Date: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    style={{ fontSize: 12, padding: '8px 12px', borderRadius: '2px' }}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Payment Reference:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    style={{ fontSize: 12, padding: '8px 12px', borderRadius: '2px' }}
                    placeholder="e.g. Bank transfer reference number"
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Payment Proof (Attachment): <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ fontSize: 12, padding: '8px 12px', borderRadius: '2px' }}
                    required
                  />
                  <small style={{ fontSize: 10, color: '#6b7280' }}>
                    Upload bank transfer receipt or payment proof (PDF, JPG, PNG - Max 10MB)
                  </small>
                </div>
                
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Remarks:
                  </label>
                  <textarea
                    className="form-control"
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    rows={3}
                    style={{ fontSize: 12, padding: '8px 12px', borderRadius: '2px' }}
                    placeholder="Optional remarks..."
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowMarkPaidModal(false);
                    setPaymentDate('');
                    setPaymentReference('');
                    setPaymentProof(null);
                    setApprovalRemarks('');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: '8px 16px', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMarkAsPaid}
                  className="btn btn-info"
                  style={{ fontSize: 12, padding: '8px 16px', borderRadius: '6px' }}
                >
                  <i className="bi bi-cash-coin me-2"></i>
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Period Modal */}
      {showCloseModal && selectedPeriod && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: 14, fontWeight: 600 }}>
                  Close Payroll Period
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCloseModal(false);
                    setCloseRemarks('');
                  }}
                  style={{ fontSize: 12 }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="alert alert-warning" style={{ fontSize: 12, padding: '12px', borderRadius: '6px', marginBottom: 16 }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> Closing this period will LOCK it permanently for audit purposes. 
                  You will NOT be able to edit or delete this period after closing.
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Period:
                  </label>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{selectedPeriod.period_name}</p>
                </div>
                
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Status:
                  </label>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{selectedPeriod.status}</p>
                </div>
                
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Closing Remarks:
                  </label>
                  <textarea
                    className="form-control"
                    value={closeRemarks}
                    onChange={(e) => setCloseRemarks(e.target.value)}
                    rows={3}
                    style={{ fontSize: 12, padding: '8px 12px', borderRadius: '2px' }}
                    placeholder="Optional closing remarks..."
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCloseModal(false);
                    setCloseRemarks('');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: '8px 16px', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClosePeriod}
                  className="btn btn-warning"
                  style={{ fontSize: 12, padding: '8px 16px', borderRadius: '6px' }}
                >
                  <i className="bi bi-lock me-2"></i>
                  Close Period
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Payslip View */}
      {showPrintView && printRecordId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '95%' }}>
            <div className="modal-content" style={{ borderRadius: '6px', overflow: 'hidden' }}>
              <div className="modal-body" style={{ padding: 0 }}>
                <PayslipPrintView
                  recordId={printRecordId}
                  hash={sessionHash}
                  onClose={() => {
                    setShowPrintView(false);
                    setPrintRecordId(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

