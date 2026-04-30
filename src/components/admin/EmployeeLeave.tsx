'use client';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

interface LeaveBalance {
  leave_type: string;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

interface LeaveApplication {
  id: number;
  application_number: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: string;
  created_at: string;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
}

interface LeaveType {
  id: number;
  leave_type: string;
  max_days_per_year: number;
  requires_document: number;
  document_label: string | null;
  allow_half_days: boolean;
}

export default function EmployeeLeave({ sessionHash, employeeId }: { sessionHash: string; employeeId: number | null }) {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    day_type: 'full' as 'full' | 'half',
    total_days: 0,
    reason: '',
    remarks: ''
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selectedTypeBalance, setSelectedTypeBalance] = useState<LeaveBalance | null>(null);

  useEffect(() => {
    if (employeeId) {
      fetchLeaveData();
    }
  }, [employeeId, sessionHash]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [balanceRes, applicationsRes, typesRes] = await Promise.all([
        fetch(`/api/employee/leave/balance?hash=${sessionHash}&employee_id=${employeeId}`),
        fetch(`/api/employee/leave?hash=${sessionHash}&employee_id=${employeeId}`),
        fetch(`/api/employee/leave/types?hash=${sessionHash}&employee_id=${employeeId}`)
      ]);

      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setLeaveBalances(data.balances || []);
      }

      if (applicationsRes.ok) {
        const data = await applicationsRes.json();
        setLeaveApplications(data.applications || []);
      }

      if (typesRes.ok) {
        const data = await typesRes.json();
        setLeaveTypes(data.types || []);
      }
    } catch (err) {
      console.error('Error fetching leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const baseDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    // Check if single day and allow_half_days
    const isSingleDay = formData.start_date === formData.end_date;
    const selectedType = leaveTypes.find(t => t.id === parseInt(formData.leave_type_id));
    
    if (isSingleDay && selectedType?.allow_half_days && formData.day_type === 'half') {
      return 0.5;
    }
    
    return baseDays;
  };
  
  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Auto-calculate total days and reset day_type if needed
    if (newFormData.start_date && newFormData.end_date) {
      const isSingleDay = newFormData.start_date === newFormData.end_date;
      const selectedType = leaveTypes.find(t => t.id === parseInt(newFormData.leave_type_id));
      
      // Reset to full if not single day or leave type doesn't allow half days
      if (!isSingleDay || !selectedType?.allow_half_days) {
        newFormData.day_type = 'full';
      }
    }
    
    setFormData(newFormData);
  };

  const handleLeaveTypeChange = (typeId: string) => {
    setFormData({ ...formData, leave_type_id: typeId });
    if (typeId) {
      const selectedType = leaveTypes.find(t => t.id === parseInt(typeId));
      if (selectedType) {
        const balance = leaveBalances.find(b => b.leave_type === selectedType.leave_type);
        setSelectedTypeBalance(balance || null);
      }
    } else {
      setSelectedTypeBalance(null);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date || !formData.reason) {
      alert('Please fill all required fields');
      return;
    }

    // Check if selected leave type requires document
    const selectedType = leaveTypes.find(t => t.id === parseInt(formData.leave_type_id));
    if (selectedType && selectedType.requires_document === 1 && !documentFile) {
      alert('Please upload supporting document (MC/Letter) for this leave type');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('employee_id', String(employeeId));
      formDataToSend.append('leave_type_id', formData.leave_type_id);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('remarks', formData.remarks);
      if (documentFile) {
        formDataToSend.append('document', documentFile);
      }

      const response = await fetch(`/api/employee/leave/apply?hash=${sessionHash}`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        alert('Leave application submitted successfully');
        
        // Emit notification to admins
        try {
          const socket = getSocket();
          if (socket && socket.connected) {
            console.log('📤 Emitting task_submitted for leave:', result.application_number);
            socket.emit('task_submitted', {
              module: 'leave',
              action: 'apply',
              employeeId,
              entityId: result.application_number,
              message: `New leave application ${result.application_number} submitted`,
              view: 'leave'
            });
            console.log('✅ Notification emitted successfully');
          } else {
            console.warn('⚠️ Socket not connected, notification not sent');
          }
        } catch (err) {
          console.error('❌ Error emitting notification:', err);
        }
        
        setShowApplyModal(false);
        setFormData({ leave_type_id: '', start_date: '', end_date: '', day_type: 'full', total_days: 0, reason: '', remarks: '' });
        setDocumentFile(null);
        setSelectedTypeBalance(null);
        fetchLeaveData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit leave application');
      }
    } catch (err) {
      alert('Error submitting leave application');
    }
  };

  const handleCancelLeave = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this leave application?')) return;

    try {
      const response = await fetch(`/api/employee/leave/cancel?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: id, employee_id: employeeId })
      });

      if (response.ok) {
        alert('Leave application cancelled');
        fetchLeaveData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel leave');
      }
    } catch (err) {
      alert('Error cancelling leave');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'secondary'
    };
    return <span className={`badge bg-${colors[status] || 'secondary'}`} style={{ fontSize: 10 }}>{status.toUpperCase()}</span>;
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>My Leave Applications</h2>
        <button onClick={() => setShowApplyModal(true)} className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
          <i className="bi bi-plus-circle me-1"></i>Apply for Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="row g-3 mb-4">
        {leaveBalances.map((balance, idx) => (
          <div key={idx} className="col" style={{ flex: '0 0 20%', maxWidth: '20%' }}>
            <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
              <div className="card-body">
                <h6 style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>{balance.leave_type}</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#059669' }}>{balance.remaining_days}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>Remaining</div>
                  </div>
                  <div className="text-end">
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Used: {balance.used_days}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Total: {balance.total_days}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Applications Table */}
      <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
        <div className="card-body">
          <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Leave History</h6>
          <div className="table-responsive">
            <table className="table table-hover" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Application No.</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Leave Type</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Start Date</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>End Date</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Days</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Status</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveApplications.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4" style={{ color: '#6b7280' }}>No leave applications found</td></tr>
                ) : (
                  leaveApplications.map((app) => (
                    <tr key={app.id}>
                      <td style={{ padding: '12px' }}>{app.application_number}</td>
                      <td style={{ padding: '12px' }}>{app.leave_type}</td>
                      <td style={{ padding: '12px' }}>{new Date(app.start_date).toLocaleDateString('en-MY')}</td>
                      <td style={{ padding: '12px' }}>{new Date(app.end_date).toLocaleDateString('en-MY')}</td>
                      <td style={{ padding: '12px' }}>{app.total_days}</td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(app.status)}</td>
                      <td style={{ padding: '12px' }}>
                        {app.status === 'pending' && (
                          <button onClick={() => handleCancelLeave(app.id)} className="btn btn-sm btn-outline-danger" style={{ fontSize: 10, padding: '4px 8px' }}>
                            <i className="bi bi-x-circle"></i> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Apply for Leave
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)} style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleApplyLeave}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="row g-3">
                    {/* Leave Type */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Leave Type <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select 
                        className="form-select" 
                        value={formData.leave_type_id} 
                        onChange={(e) => handleLeaveTypeChange(e.target.value)} 
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                        required
                      >
                        <option value="">Select Leave Type</option>
                        {leaveTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.leave_type} ({type.max_days_per_year} days/year)</option>
                        ))}
                      </select>
                    </div>

                    {/* Leave Balance Display */}
                    {selectedTypeBalance && (
                      <div className="col-md-12">
                        <div style={{ 
                          backgroundColor: '#f0f9ff', 
                          border: '1px solid #bae6fd', 
                          borderRadius: '6px', 
                          padding: '12px'
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#0c4a6e', marginBottom: '8px' }}>
                            Leave Balance (2025):
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ 
                              backgroundColor: '#3b82f6', 
                              color: '#ffffff', 
                              padding: '4px 12px', 
                              borderRadius: '12px', 
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              Total: {selectedTypeBalance.total_days}
                            </span>
                            <span style={{ 
                              backgroundColor: '#f59e0b', 
                              color: '#ffffff', 
                              padding: '4px 12px', 
                              borderRadius: '12px', 
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              Used: {selectedTypeBalance.used_days}
                            </span>
                            <span style={{ 
                              backgroundColor: '#10b981', 
                              color: '#ffffff', 
                              padding: '4px 12px', 
                              borderRadius: '12px', 
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              Remaining: {selectedTypeBalance.remaining_days}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Start Date & End Date */}
                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Start Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={formData.start_date} 
                        onChange={(e) => handleDateChange('start_date', e.target.value)} 
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                        required 
                      />
                    </div>

                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        End Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={formData.end_date} 
                        onChange={(e) => handleDateChange('end_date', e.target.value)} 
                        min={formData.start_date}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                        required 
                      />
                    </div>

                    {/* Day Type - Conditional for single day only */}
                    {formData.leave_type_id && 
                     formData.start_date && 
                     formData.end_date && 
                     formData.start_date === formData.end_date && 
                     leaveTypes.find(t => t.id === parseInt(formData.leave_type_id))?.allow_half_days && (
                      <div className="col-md-12">
                        <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                          Day Type <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          className="form-select"
                          required
                          value={formData.day_type}
                          onChange={(e) => {
                            const newDayType = e.target.value as 'full' | 'half';
                            setFormData({ ...formData, day_type: newDayType });
                          }}
                          style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                        >
                          <option value="full">Full Day (1.0)</option>
                          <option value="half">Half Day (0.5)</option>
                        </select>
                        <small style={{ fontSize: '10px', color: '#6b7280' }}>
                          Half day option only available for single day leave
                        </small>
                      </div>
                    )}

                    {/* Total Days */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Total Days
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={calculateTotalDays()} 
                        readOnly
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px', backgroundColor: '#f9fafb', fontWeight: 600 }} 
                      />
                    </div>

                    {/* Reason */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Reason <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea 
                        className="form-control" 
                        rows={2} 
                        value={formData.reason} 
                        onChange={(e) => setFormData({...formData, reason: e.target.value})} 
                        placeholder="Enter reason for leave"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                        required 
                      />
                    </div>

                    {/* Remarks */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Remarks
                      </label>
                      <textarea 
                        className="form-control" 
                        rows={2} 
                        value={formData.remarks} 
                        onChange={(e) => setFormData({...formData, remarks: e.target.value})} 
                        placeholder="Additional remarks (optional)"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                      />
                    </div>

                    {/* Supporting Document - Conditional */}
                    {formData.leave_type_id && leaveTypes.find(t => t.id === parseInt(formData.leave_type_id))?.requires_document === 1 && (
                      <div className="col-md-12">
                        <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                          Supporting Document <span style={{ color: '#ef4444' }}>*</span>
                          <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>
                            {(() => {
                              const selectedType = leaveTypes.find(t => t.id === parseInt(formData.leave_type_id));
                              return selectedType?.document_label ? `(${selectedType.document_label})` : '(Supporting Document)';
                            })()}
                          </span>
                        </label>
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="image/*,.pdf" 
                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} 
                          style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                          required 
                        />
                        <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                          Max 5MB (PDF or Image)
                        </small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowApplyModal(false)} 
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
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
