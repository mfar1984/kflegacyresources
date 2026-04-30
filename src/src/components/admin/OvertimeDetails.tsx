'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { usePermissions } from '@/hooks/usePermissions';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';

interface OvertimeApplication {
  id: number;
  overtime_number: string;
  project_name: string;
  overtime_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  hourly_rate: number;
  overtime_rate_id: number | null;
  rate_name: string | null;
  rate_multiplier: number | null;
  total_amount: number;
  reason: string;
  remarks: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  applied_date: string;
  reviewed_by: number | null;
  reviewer_name: string | null;
  reviewed_date: string | null;
  review_remarks: string | null;
  payment_date: string | null;
}

interface Employee {
  id: number;
  full_name: string;
  employee_number: string;
  basic_salary: number;
  department: string;
  position: string;
}

interface Summary {
  total_applications: number;
  total_hours: number;
  total_amount: number;
  status_counts: {
    pending: number;
    approved: number;
    rejected: number;
    paid: number;
    cancelled: number;
  };
}

interface OvertimeRate {
  id: number;
  name: string;
  rate_multiplier: number;
}

interface OvertimeDetailsProps {
  sessionHash: string;
  employeeId: number;
  month: string;
  onBack: () => void;
}

export default function OvertimeDetails({ sessionHash, employeeId, month, onBack }: OvertimeDetailsProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [applications, setApplications] = useState<OvertimeApplication[]>([]);
  const [overtimeRates, setOvertimeRates] = useState<OvertimeRate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOvertime, setSelectedOvertime] = useState<OvertimeApplication | null>(null);
  const [selectedOvertimes, setSelectedOvertimes] = useState<number[]>([]);
  const [holidayInfo, setHolidayInfo] = useState<any>(null);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  
  const [approvalData, setApprovalData] = useState({
    action: 'approve' as 'approve' | 'reject',
    overtime_rate_id: '',
    review_remarks: ''
  });

  useEffect(() => {
    fetchDetails();
    fetchOvertimeRates();
  }, [employeeId, month]);

  // Open modal after holidayInfo is set
  useEffect(() => {
    if (pendingModalOpen && holidayInfo !== null) {
      console.log('Opening modal with holiday info:', holidayInfo);
      setShowApproveModal(true);
      setPendingModalOpen(false);
    }
  }, [holidayInfo, pendingModalOpen]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/overtime/details?hash=${sessionHash}&employee_id=${employeeId}&month=${month}`
      );
      const data = await res.json();
      
      if (res.ok) {
        setEmployee(data.employee);
        setSummary(data.summary);
        setApplications(data.applications || []);
      } else {
        alert(data.error || 'Failed to fetch overtime details');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      alert('Failed to fetch overtime details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOvertimeRates = async () => {
    try {
      const res = await fetch(`/api/admin/overtime/rates?hash=${sessionHash}`);
      const data = await res.json();
      if (res.ok) {
        setOvertimeRates(data.rates || data.overtimeRates || data || []);
      }
    } catch (error) {
      console.error('Error fetching overtime rates:', error);
    }
  };

  const handleApprove = async (overtime: OvertimeApplication) => {
    setSelectedOvertime(overtime);
    
    // Auto-detect suggested rate based on date
    let suggestedRateId = '';
    let detectedHolidayInfo = null;
    
    try {
      // Format date properly for API in local timezone (YYYY-MM-DD)
      const srcDate = new Date(overtime.overtime_date);
      const localIso = new Date(srcDate.getTime() - srcDate.getTimezoneOffset() * 60000).toISOString();
      const dateStr = localIso.slice(0, 10);
      console.log('Checking holiday for date (local):', dateStr);
      
      const holidayCheckResponse = await fetch(
        `/api/admin/holidays/check?date=${dateStr}`
      );
      
      if (holidayCheckResponse.ok) {
        const holidayData = await holidayCheckResponse.json();
        suggestedRateId = holidayData.overtime_rate_id?.toString() || '';
        detectedHolidayInfo = holidayData;
        console.log('Holiday detection result:', holidayData);
      } else {
        console.error('Holiday check failed:', await holidayCheckResponse.text());
      }
    } catch (err) {
      console.error('Failed to auto-detect rate:', err);
    }
    
    // If overtime already has a rate (from staff submission), use that
    // Otherwise use auto-detected rate
    const defaultRateId = overtime.overtime_rate_id 
      ? overtime.overtime_rate_id.toString() 
      : suggestedRateId;
    
    console.log('Setting approval data with rate:', defaultRateId, 'Holiday info:', detectedHolidayInfo);
    
    // Set approval data first
    setApprovalData({
      action: 'approve',
      overtime_rate_id: defaultRateId,
      review_remarks: ''
    });
    
    // Set holiday info and trigger modal opening via useEffect
    setHolidayInfo(detectedHolidayInfo);
    setPendingModalOpen(true);
  };

  const handleReject = (overtime: OvertimeApplication) => {
    setSelectedOvertime(overtime);
    setApprovalData({
      action: 'reject',
      overtime_rate_id: '',
      review_remarks: ''
    });
    setShowApproveModal(true);
  };

  const submitApproval = async () => {
    if (!selectedOvertime) return;

    if (approvalData.action === 'approve' && !approvalData.overtime_rate_id) {
      alert('Please select overtime rate');
      return;
    }

    try {
      const res = await fetch(`/api/admin/overtime/approve?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOvertime.id,
          ...approvalData
        })
      });

      const data = await res.json();

      if (res.ok) {
        let message = data.message;
        if (data.warning) {
          message += `\n\n${data.warning}`;
        }
        alert(message);
        
        // Emit notification to employee
        if (selectedOvertime) {
          try {
            const socket = getSocket();
            if (socket && socket.connected) {
              const overtimeNumber = selectedOvertime.overtime_number || data?.overtime_number || 'N/A';
              console.log('📤 Emitting task_reviewed for overtime:', overtimeNumber, 'to employee:', employeeId);
              socket.emit('task_reviewed', {
                module: 'overtime',
                action: approvalData.action,
                result: approvalData.action === 'approve' ? 'approved' : 'rejected',
                employeeId,
                entityId: overtimeNumber,
                message: `Your overtime ${overtimeNumber} has been ${approvalData.action}d`,
                view: 'employee-overtime'
              });
              console.log('✅ Notification emitted successfully');
            } else {
              console.warn('⚠️ Socket not connected, notification not sent');
            }
          } catch (err) {
            console.error('❌ Error emitting notification:', err);
          }
        }
        
        setShowApproveModal(false);
        setHolidayInfo(null);
        fetchDetails();
      } else {
        alert(data.error || 'Failed to process overtime');
      }
    } catch (error) {
      console.error('Error processing overtime:', error);
      alert('Failed to process overtime');
    }
  };

  const handleBulkApprove = async () => {
    const pendingOvertimes = applications.filter(app => app.status === 'pending');
    
    if (pendingOvertimes.length === 0) {
      alert('No pending overtime applications to approve');
      return;
    }

    if (!confirm(`Approve all ${pendingOvertimes.length} pending overtime applications?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/overtime/bulk-approve?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overtime_ids: pendingOvertimes.map(ot => ot.id),
          action: 'approve',
          review_remarks: 'Bulk approved'
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Bulk approval completed:\n✅ Success: ${data.results.success.length}\n⚠️ Skipped: ${data.results.skipped.length}\n❌ Failed: ${data.results.failed.length}`);
        
        // Emit notification to employee
        try {
          const socket = getSocket();
          if (socket && socket.connected) {
            console.log('📤 Emitting task_reviewed for bulk overtime approval to employee:', employeeId);
            socket.emit('task_reviewed', {
              module: 'overtime',
              action: 'approve',
              result: 'approved',
              employeeId,
              entityId: null,
              message: `Your ${pendingOvertimes.length} overtime applications were approved`,
              view: 'employee-overtime'
            });
            console.log('✅ Notification emitted successfully');
          } else {
            console.warn('⚠️ Socket not connected, notification not sent');
          }
        } catch (err) {
          console.error('❌ Error emitting notification:', err);
        }
        
        fetchDetails();
      } else {
        alert(data.error || 'Failed to bulk approve');
      }
    } catch (error) {
      console.error('Error bulk approving:', error);
      alert('Failed to bulk approve');
    }
  };

  const handleView = (overtime: OvertimeApplication) => {
    setSelectedOvertime(overtime);
    setShowViewModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: '#fff3cd', color: '#856404', text: '⏳ Pending' },
      approved: { bg: '#d1ecf1', color: '#0c5460', text: '✅ Approved' },
      rejected: { bg: '#f8d7da', color: '#721c24', text: '❌ Rejected' },
      paid: { bg: '#d4edda', color: '#155724', text: '💰 Paid' },
      cancelled: { bg: '#e2e3e5', color: '#383d41', text: '🚫 Cancelled' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span style={{
        padding: '4px 12px',
        background: badge.bg,
        color: badge.color,
        borderRadius: '2px',
        fontSize: '11px',
        fontWeight: 500
      }}>
        {badge.text}
      </span>
    );
  };

  const getHolidayBadge = (date: string) => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) {
      return (
        <span style={{
          padding: '2px 6px',
          background: '#dbeafe',
          color: '#1e40af',
          borderRadius: '2px',
          fontSize: '10px',
          fontWeight: 500,
          marginLeft: '4px'
        }}>
          🏖️ Weekend
        </span>
      );
    }
    
    return null;
  };

  const tableColumns: AdminTableColumn<OvertimeApplication>[] = [
    {
      key: 'overtime_number',
      label: 'OT No.',
      render: (_: unknown, row: OvertimeApplication) => (
        <span style={{ fontSize: '11px', fontWeight: 500, fontFamily: 'monospace' }}>
          {row.overtime_number}
        </span>
      )
    },
    {
      key: 'overtime_date',
      label: 'Date',
      render: (_: unknown, row: OvertimeApplication) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px' }}>{formatDate(row.overtime_date)}</span>
          {getHolidayBadge(row.overtime_date)}
        </div>
      )
    },
    {
      key: 'time',
      label: 'Time',
      render: (_: unknown, row: OvertimeApplication) => (
        <span style={{ fontSize: '11px' }}>
          {formatTime(row.start_time)} - {formatTime(row.end_time)}
        </span>
      )
    },
    {
      key: 'total_hours',
      label: 'Hours',
      render: (_: unknown, row: OvertimeApplication) => (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1976d2' }}>
          {row.total_hours.toFixed(1)}h
        </span>
      )
    },
    {
      key: 'rate',
      label: 'Rate',
      render: (_: unknown, row: OvertimeApplication) => (
        <span style={{ fontSize: '12px' }}>
          {row.rate_multiplier ? `${row.rate_multiplier}x` : '-'}
        </span>
      )
    },
    {
      key: 'total_amount',
      label: 'Amount',
      render: (_: unknown, row: OvertimeApplication) => (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#2e7d32' }}>
          {formatCurrency(row.total_amount)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: OvertimeApplication) => getStatusBadge(row.status)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: OvertimeApplication) => {
        const actions = [actionPresets.view(() => handleView(row))];
        
        if (row.status === 'pending' && canPerformAction('overtime', 'approve')) {
          actions.push({
            type: 'custom',
            icon: 'check_circle',
            color: '#28a745',
            title: 'Approve',
            onClick: () => handleApprove(row),
            show: true
          });
          actions.push({
            type: 'custom',
            icon: 'cancel',
            color: '#dc3545',
            title: 'Reject',
            onClick: () => handleReject(row),
            show: true
          });
        }
        
        return <AdminTableActions actions={actions} />;
      }
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!employee || !summary) {
    return (
      <div style={{ padding: '24px' }}>
        <button onClick={onBack} className="btn btn-secondary mb-3" style={{ fontSize: '12px' }}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Employee data not found</p>
        </div>
      </div>
    );
  }

  const monthDisplay = new Date(month + '-01').toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <button 
        onClick={onBack} 
        className="btn btn-secondary mb-3" 
        style={{ fontSize: '12px', borderRadius: '2px' }}
      >
        <i className="bi bi-arrow-left me-2"></i>Back to Summary
      </button>

      {/* Employee Info Card */}
      <div style={{
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '2px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              {employee.full_name}
            </h5>
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              {employee.employee_number} • {employee.department} • {employee.position}
            </p>
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              Basic Salary: {formatCurrency(employee.basic_salary)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h6 style={{ margin: 0, fontSize: '14px', color: '#666' }}>{monthDisplay}</h6>
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              {summary.total_applications} Applications
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ padding: '12px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '2px' }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>Total Hours</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#1976d2' }}>
            {summary.total_hours.toFixed(1)}h
          </div>
        </div>
        <div style={{ padding: '12px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '2px' }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>Total Amount</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#2e7d32' }}>
            {formatCurrency(summary.total_amount)}
          </div>
        </div>
        <div style={{ padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '2px' }}>
          <div style={{ fontSize: '10px', color: '#856404', marginBottom: '4px' }}>Pending</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#856404' }}>
            {summary.status_counts.pending}
          </div>
        </div>
        <div style={{ padding: '12px', background: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '2px' }}>
          <div style={{ fontSize: '10px', color: '#0c5460', marginBottom: '4px' }}>Approved</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#0c5460' }}>
            {summary.status_counts.approved}
          </div>
        </div>
      </div>

      {/* Actions */}
      {summary.status_counts.pending > 0 && canPerformAction('overtime', 'approve') && (
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={handleBulkApprove}
            className="btn btn-primary"
            style={{ fontSize: '12px', borderRadius: '2px' }}
          >
            <i className="bi bi-check-all me-2"></i>
            Approve All {summary.status_counts.pending} Pending Applications
          </button>
        </div>
      )}

      {/* Table */}
      <AdminTable
        columns={tableColumns}
        data={applications}
      />

      {/* View Modal */}
      {showViewModal && selectedOvertime && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: '2px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <h5 className="modal-title" style={{ fontSize: '14px' }}>Overtime Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body" style={{ fontSize: '12px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong>OT Number:</strong> {selectedOvertime.overtime_number}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Project:</strong> {selectedOvertime.project_name}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Date:</strong> {formatDate(selectedOvertime.overtime_date)}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Time:</strong> {formatTime(selectedOvertime.start_time)} - {formatTime(selectedOvertime.end_time)} ({selectedOvertime.total_hours}h)
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Reason:</strong> {selectedOvertime.reason}
                </div>
                {selectedOvertime.remarks && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Remarks:</strong> {selectedOvertime.remarks}
                  </div>
                )}
                <div style={{ marginBottom: '12px' }}>
                  <strong>Status:</strong> {getStatusBadge(selectedOvertime.status)}
                </div>
                {selectedOvertime.rate_name && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Rate:</strong> {selectedOvertime.rate_name} ({selectedOvertime.rate_multiplier}x)
                  </div>
                )}
                {selectedOvertime.reviewer_name && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Reviewed by:</strong> {selectedOvertime.reviewer_name} on {formatDate(selectedOvertime.reviewed_date || '')}
                  </div>
                )}
                {selectedOvertime.review_remarks && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Review Remarks:</strong> {selectedOvertime.review_remarks}
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e0e0e0' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowViewModal(false)}
                  style={{ fontSize: '12px', borderRadius: '2px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedOvertime && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: '2px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <h5 className="modal-title" style={{ fontSize: '14px' }}>
                  {approvalData.action === 'approve' ? 'Approve' : 'Reject'} Overtime
                </h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowApproveModal(false);
                  setHolidayInfo(null);
                }}></button>
              </div>
              <div className="modal-body" style={{ fontSize: '12px' }}>
                <div style={{ marginBottom: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '2px' }}>
                  <div><strong>{selectedOvertime.overtime_number}</strong></div>
                  <div>{formatDate(selectedOvertime.overtime_date)} • {selectedOvertime.total_hours}h</div>
                </div>

                {/* Holiday/Weekend Indicator */}
                {approvalData.action === 'approve' && holidayInfo && (
                  <div style={{ marginBottom: '12px' }}>
                    {holidayInfo.is_holiday && (
                      <div style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#fef3c7', 
                        border: '1px solid #fbbf24', 
                        borderRadius: '2px',
                        fontSize: '11px',
                        color: '#92400e',
                        marginBottom: '4px'
                      }}>
                        <i className="bi bi-calendar-event me-1"></i>
                        <strong>🎉 Public Holiday:</strong> {holidayInfo.holiday_name}
                      </div>
                    )}
                    {holidayInfo.is_weekend && !holidayInfo.is_holiday && (
                      <div style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#dbeafe', 
                        border: '1px solid #3b82f6', 
                        borderRadius: '2px',
                        fontSize: '11px',
                        color: '#1e40af',
                        marginBottom: '4px'
                      }}>
                        <i className="bi bi-calendar-week me-1"></i>
                        <strong>Weekend Day</strong>
                      </div>
                    )}
                    {holidayInfo.is_holiday && holidayInfo.is_weekend && (
                      <div style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#fce7f3', 
                        border: '1px solid #ec4899', 
                        borderRadius: '2px',
                        fontSize: '11px',
                        color: '#9f1239',
                        marginBottom: '4px'
                      }}>
                        <i className="bi bi-star-fill me-1"></i>
                        <strong>Special Rate:</strong> Public Holiday + Weekend
                      </div>
                    )}
                    <div style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#f0fdf4', 
                      border: '1px solid #22c55e', 
                      borderRadius: '2px',
                      fontSize: '11px',
                      color: '#15803d'
                    }}>
                      <i className="bi bi-info-circle me-1"></i>
                      <strong>Auto-detected rate:</strong> {holidayInfo.overtime_rate_name} ({holidayInfo.overtime_multiplier}x)
                      <br />
                      <span style={{ fontSize: '10px', fontStyle: 'italic' }}>You can change this if needed</span>
                    </div>
                  </div>
                )}

                {approvalData.action === 'approve' && (
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px' }}>
                      Overtime Rate <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={approvalData.overtime_rate_id}
                      onChange={(e) => setApprovalData({ ...approvalData, overtime_rate_id: e.target.value })}
                      required
                      style={{ fontSize: '12px', borderRadius: '2px' }}
                    >
                      <option value="">Select rate...</option>
                      {overtimeRates && overtimeRates.length > 0 ? (
                        overtimeRates.map(rate => (
                          <option key={rate.id} value={rate.id}>
                            {rate.name} ({rate.rate_multiplier}x)
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No rates available</option>
                      )}
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '12px' }}>Review Remarks</label>
                  <textarea
                    className="form-control"
                    value={approvalData.review_remarks}
                    onChange={(e) => setApprovalData({ ...approvalData, review_remarks: e.target.value })}
                    rows={3}
                    style={{ fontSize: '12px', borderRadius: '2px' }}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e0e0e0' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowApproveModal(false);
                    setHolidayInfo(null);
                  }}
                  style={{ fontSize: '12px', borderRadius: '2px' }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className={`btn ${approvalData.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  onClick={submitApproval}
                  style={{ fontSize: '12px', borderRadius: '2px' }}
                >
                  {approvalData.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

