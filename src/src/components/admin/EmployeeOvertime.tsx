'use client';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

interface Overtime {
  id: number;
  overtime_number: string;
  overtime_date: string;
  overtime_type: string;
  total_hours: number;
  hourly_rate: number;
  total_amount: number;
  reason: string;
  status: string;
  created_at: string;
}

interface OvertimeRate {
  id: number;
  overtime_type: string;
  rate_multiplier: number;
}

interface HolidayInfo {
  is_holiday: boolean;
  is_weekend: boolean;
  holiday_name: string | null;
  overtime_type: string;
  overtime_multiplier: number;
  overtime_rate_name: string;
}

export default function EmployeeOvertime({ sessionHash, employeeId }: { sessionHash: string; employeeId: number | null }) {
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState<HolidayInfo | null>(null);
  const [formData, setFormData] = useState({
    project_name: '',
    overtime_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    reason: '',
    remarks: ''
  });

  useEffect(() => {
    if (employeeId) {
      fetchOvertimeData();
    }
  }, [employeeId, sessionHash]);

  const fetchOvertimeData = async () => {
    try {
      setLoading(true);
      const overtimeRes = await fetch(`/api/employee/overtime?hash=${sessionHash}&employee_id=${employeeId}`);

      if (overtimeRes.ok) {
        const data = await overtimeRes.json();
        setOvertimes(data.overtimes || []);
      }
    } catch (err) {
      console.error('Error fetching overtime data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = (): number => {
    if (!formData.start_time || !formData.end_time) return 0;
    
    const [startHour, startMinute] = formData.start_time.split(':').map(Number);
    const [endHour, endMinute] = formData.end_time.split(':').map(Number);
    
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    
    const diffInMinutes = endInMinutes - startInMinutes;
    const hours = diffInMinutes / 60;
    
    return hours > 0 ? parseFloat(hours.toFixed(2)) : 0;
  };

  // Check holiday when date changes
  useEffect(() => {
    if (formData.overtime_date) {
      checkHoliday(formData.overtime_date);
    }
  }, [formData.overtime_date]);

  const checkHoliday = async (date: string) => {
    try {
      const response = await fetch(`/api/admin/holidays/check?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setHolidayInfo(data);
      } else {
        setHolidayInfo(null);
      }
    } catch (err) {
      console.error('Error checking holiday:', err);
      setHolidayInfo(null);
    }
  };

  const handleSubmitOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_name || !formData.overtime_date || !formData.start_time || !formData.end_time || !formData.reason) {
      alert('Please fill all required fields');
      return;
    }

    const totalHours = calculateTotalHours();
    if (totalHours <= 0) {
      alert('End time must be after start time');
      return;
    }

    try {
      const response = await fetch(`/api/employee/overtime/submit?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          project_name: formData.project_name,
          overtime_date: formData.overtime_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          total_hours: totalHours,
          reason: formData.reason,
          remarks: formData.remarks
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Overtime submitted successfully');
        
        // Emit notification to admins
        try {
          const socket = getSocket();
          if (socket && socket.connected) {
            console.log('📤 Emitting task_submitted for overtime:', result.overtime_number);
            socket.emit('task_submitted', {
              module: 'overtime',
              action: 'submit',
              employeeId,
              entityId: result.overtime_number,
              message: `New overtime ${result.overtime_number} submitted`,
              view: 'overtime'
            });
            console.log('✅ Notification emitted successfully');
          } else {
            console.warn('⚠️ Socket not connected, notification not sent');
          }
        } catch (err) {
          console.error('❌ Error emitting notification:', err);
        }
        
        setShowSubmitModal(false);
        setFormData({ 
          project_name: '', 
          overtime_date: new Date().toISOString().split('T')[0], 
          start_time: '', 
          end_time: '', 
          reason: '', 
          remarks: '' 
        });
        fetchOvertimeData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit overtime');
      }
    } catch (err) {
      alert('Error submitting overtime');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <span className={`badge bg-${colors[status] || 'secondary'}`} style={{ fontSize: 10 }}>{status.toUpperCase()}</span>;
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>My Overtime</h2>
        <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
          <i className="bi bi-plus-circle me-1"></i>Submit Overtime
        </button>
      </div>

      <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
        <div className="card-body">
          <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Overtime History</h6>
          <div className="table-responsive">
            <table className="table table-hover" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>OT No.</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Date</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Type</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Hours</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Amount</th>
                  <th style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {overtimes.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4" style={{ color: '#6b7280' }}>No overtime records found</td></tr>
                ) : (
                  overtimes.map((ot) => (
                    <tr key={ot.id}>
                      <td style={{ padding: '12px' }}>{ot.overtime_number}</td>
                      <td style={{ padding: '12px' }}>{new Date(ot.overtime_date).toLocaleDateString('en-MY')}</td>
                      <td style={{ padding: '12px' }}>{ot.overtime_type}</td>
                      <td style={{ padding: '12px' }}>{ot.total_hours}</td>
                      <td style={{ padding: '12px' }}>RM {parseFloat(String(ot.total_amount)).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(ot.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submit Overtime Modal */}
      {showSubmitModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Submit Overtime
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowSubmitModal(false)} style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleSubmitOvertime}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="row g-3">
                    {/* Project Name */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Project Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.project_name} 
                        onChange={(e) => setFormData({...formData, project_name: e.target.value})} 
                        placeholder="Enter project name"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                        required 
                      />
                    </div>

                    {/* Overtime Date */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Overtime Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={formData.overtime_date} 
                        onChange={(e) => setFormData({...formData, overtime_date: e.target.value})} 
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                        required 
                      />
                      {holidayInfo && (
                        <div style={{ marginTop: '8px' }}>
                          {holidayInfo.is_holiday && (
                            <div style={{ 
                              padding: '8px 12px', 
                              backgroundColor: '#fef3c7', 
                              border: '1px solid #fbbf24', 
                              borderRadius: '2px',
                              fontSize: '11px',
                              color: '#92400e'
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
                              color: '#1e40af'
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
                              marginTop: '4px'
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
                            color: '#15803d',
                            marginTop: '4px'
                          }}>
                            <i className="bi bi-calculator me-1"></i>
                            <strong>Suggested Rate:</strong> {holidayInfo.overtime_rate_name} ({holidayInfo.overtime_multiplier}x)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Start Time & End Time */}
                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Start Time <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="time" 
                        className="form-control" 
                        value={formData.start_time} 
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})} 
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                        required 
                      />
                    </div>

                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        End Time <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="time" 
                        className="form-control" 
                        value={formData.end_time} 
                        onChange={(e) => setFormData({...formData, end_time: e.target.value})} 
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} 
                        required 
                      />
                    </div>

                    {/* Total Hours */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Total Hours
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={calculateTotalHours()} 
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
                        placeholder="Enter reason for overtime"
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
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowSubmitModal(false)} 
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
                    Submit Overtime
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
