'use client';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

interface ClaimType {
  id: number;
  code: string;
  claim_type: string;
  max_amount: number;
}

interface ClaimItem {
  item_date: string;
  description: string;
  category: string;
  amount: number;
  remarks: string;
  receiptFile?: File | null;
}

interface Claim {
  id: number;
  claim_number: string;
  claim_date: string;
  claim_type: string;
  total_amount: number;
  description: string;
  status: string;
  reviewed_by_name: string | null;
  items_count: number;
}

export default function EmployeeClaims({ sessionHash, employeeId }: { sessionHash: string; employeeId: number | null }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimTypes, setClaimTypes] = useState<ClaimType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const [formData, setFormData] = useState({
    claim_type_id: '',
    claim_date: new Date().toISOString().split('T')[0],
    description: '',
    remarks: '',
    items: [] as ClaimItem[]
  });

  useEffect(() => {
    if (employeeId) {
      fetchClaimsData();
    }
  }, [employeeId, sessionHash]);

  const fetchClaimsData = async () => {
    try {
      setLoading(true);
      const [claimsRes, typesRes] = await Promise.all([
        fetch(`/api/employee/claims?hash=${sessionHash}&employee_id=${employeeId}`),
        fetch(`/api/employee/claims/types?hash=${sessionHash}&employee_id=${employeeId}`)
      ]);

      if (claimsRes.ok) setClaims((await claimsRes.json()).claims || []);
      if (typesRes.ok) setClaimTypes((await typesRes.json()).claim_types || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        item_date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        amount: 0,
        remarks: '',
        receiptFile: null
      }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof ClaimItem, value: any) => {
    const newItems = [...formData.items];
    if (field === 'receiptFile') {
      newItems[index] = { ...newItems[index], receiptFile: value };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      return alert('Please add at least one claim item');
    }

    // Check all items have receipts
    const missingReceipts = formData.items.some(item => !item.receiptFile);
    if (missingReceipts) {
      return alert('Please upload receipt for all claim items');
    }

    const formDataToSend = new FormData();
    formDataToSend.append('employee_id', String(employeeId));
    formDataToSend.append('claim_type_id', formData.claim_type_id);
    formDataToSend.append('claim_date', formData.claim_date);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('remarks', formData.remarks);
    
    // Prepare items data (without files)
    const itemsData = formData.items.map(item => ({
      item_date: item.item_date,
      description: item.description,
      category: item.category,
      amount: item.amount,
      remarks: item.remarks
    }));
    formDataToSend.append('items', JSON.stringify(itemsData));
    
    // Append receipt files
    formData.items.forEach((item, index) => {
      if (item.receiptFile) {
        formDataToSend.append(`receipt_${index}`, item.receiptFile);
      }
    });

    try {
      const response = await fetch(`/api/employee/claims/submit?hash=${sessionHash}`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        alert('Claim submitted successfully');
        
        // Emit notification to admins
        try {
          const socket = getSocket();
          if (socket && socket.connected) {
            console.log('📤 Emitting task_submitted for claim:', result.claim_number);
            socket.emit('task_submitted', {
              module: 'claims',
              action: 'submit',
              employeeId,
              entityId: result.claim_number,
              message: `New claim ${result.claim_number} submitted`,
              view: 'claims'
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
          claim_type_id: '',
          claim_date: new Date().toISOString().split('T')[0],
          description: '',
          remarks: '',
          items: []
        });
        fetchClaimsData();
      } else {
        alert((await response.json()).error || 'Failed to submit claim');
      }
    } catch (err) {
      alert('Error submitting claim');
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>My Claims</h2>
        <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
          <i className="bi bi-plus-circle me-1"></i>Submit Claim
        </button>
      </div>

      <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ fontSize: 11, padding: '12px' }}>Claim No.</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Date</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Type</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Amount</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Items</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">No claims found</td></tr>
                ) : (
                  claims.map((claim) => (
                    <tr key={claim.id}>
                      <td style={{ padding: '12px' }}>{claim.claim_number}</td>
                      <td style={{ padding: '12px' }}>{new Date(claim.claim_date).toLocaleDateString('en-MY')}</td>
                      <td style={{ padding: '12px' }}>{claim.claim_type}</td>
                      <td style={{ padding: '12px' }}>RM {parseFloat(String(claim.total_amount)).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge bg-secondary" style={{ fontSize: 10 }}>{claim.items_count} items</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge bg-${claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'danger' : 'warning'}`} style={{ fontSize: 10 }}>
                          {claim.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl" style={{ maxHeight: '90vh', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Submit Claim
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowSubmitModal(false)} style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleSubmitClaim} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                  <div className="row g-3">
                    {/* Claim Type & Date */}
                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Claim Type <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.claim_type_id}
                        onChange={(e) => setFormData({ ...formData, claim_type_id: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="">Select Claim Type</option>
                        {claimTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.claim_type} {type.max_amount ? `(Max: RM ${type.max_amount})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Claim Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.claim_date}
                        onChange={(e) => setFormData({ ...formData, claim_date: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* Description */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Description <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        className="form-control"
                        required
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter claim description"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
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
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Additional remarks (optional)"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* Claim Items */}
                    <div className="col-md-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: 0 }}>
                          Claim Items <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <button
                          type="button"
                          onClick={addItem}
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '10px', padding: '4px 12px', borderRadius: '2px' }}
                        >
                          <i className="bi bi-plus me-1"></i>
                          Add Item
                        </button>
                      </div>

                      {formData.items.length === 0 ? (
                        <div className="text-center py-3" style={{ backgroundColor: '#f9fafb', borderRadius: '2px', border: '1px dashed #d1d5db' }}>
                          <p className="text-muted mb-0" style={{ fontSize: '11px' }}>No items added. Click "Add Item" to begin.</p>
                        </div>
                      ) : (
                        <div className="border rounded" style={{ padding: '12px', backgroundColor: '#f9fafb' }}>
                          {formData.items.map((item, index) => (
                            <div key={index} className="mb-3 p-3" style={{ backgroundColor: '#ffffff', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>Item {index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="btn btn-sm btn-outline-danger"
                                  style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '2px' }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                              <div className="row g-2">
                                <div className="col-md-3">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Date <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    required
                                    value={item.item_date}
                                    onChange={(e) => updateItem(index, 'item_date', e.target.value)}
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Category <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={item.category}
                                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                                    placeholder="e.g. Accommodation"
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Amount (RM) <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    required
                                    value={item.amount}
                                    onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Receipt <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="file"
                                    className="form-control"
                                    required
                                    accept="image/*,.pdf"
                                    onChange={(e) => updateItem(index, 'receiptFile', e.target.files?.[0] || null)}
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-9">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Description <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    placeholder="Item description"
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Remarks
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={item.remarks}
                                    onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                                    placeholder="Optional"
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div style={{ 
                            backgroundColor: '#dcfce7', 
                            border: '1px solid #bbf7d0', 
                            borderRadius: '2px', 
                            padding: '12px',
                            marginTop: '12px'
                          }}>
                            <div style={{ fontSize: '11px', color: '#166534', marginBottom: '4px' }}>Total Amount</div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>
                              RM {calculateTotal().toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
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
                    Submit Claim
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
