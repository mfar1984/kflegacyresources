'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSocket } from '@/lib/socket';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import Pagination from '@/components/Pagination';

interface ClaimType {
  id: number;
  code: string;
  name: string;
  description: string;
  requires_receipt: boolean;
  max_amount: number | null;
  color: string;
  status: string;
}

interface ClaimItem {
  id?: number;
  item_date: string;
  description: string;
  category: string;
  amount: number;
  remarks: string;
}

interface Claim {
  id: number;
  claim_number: string;
  employee_id: number;
  employee_name: string;
  employee_number: string;
  department_name: string;
  claim_type_id: number;
  claim_type_name: string;
  claim_type_code: string;
  claim_type_color: string;
  claim_date: string;
  total_amount: number;
  description: string;
  remarks: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  applied_date: string;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  reviewed_date: string | null;
  review_remarks: string | null;
  payment_date: string | null;
  payment_method: string | null;
  items_count: number;
  items?: ClaimItem[];
}

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  department_name: string;
  position: string;
  status: string;
}

interface ClaimManagementProps {
  sessionHash: string;
}

export default function ClaimManagement({ sessionHash }: ClaimManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimTypes, setClaimTypes] = useState<ClaimType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClaimType, setFilterClaimType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    claim_type_id: '',
    claim_date: '',
    description: '',
    remarks: '',
    items: [] as ClaimItem[]
  });
  
  const [approvalData, setApprovalData] = useState({
    action: 'approve' as 'approve' | 'reject',
    review_remarks: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const claimsResponse = await fetch(`/api/admin/claims?hash=${sessionHash}`);
        if (claimsResponse.ok) {
          const claimsData = await claimsResponse.json();
          setClaims(claimsData);
        }
        
        const typesResponse = await fetch(`/api/admin/claims/types?hash=${sessionHash}&status=active`);
        if (typesResponse.ok) {
          const typesData = await typesResponse.json();
          setClaimTypes(typesData.claimTypes || typesData.types || []);
        }
        
        const employeesResponse = await fetch(`/api/admin/employees?hash=${sessionHash}&status=active`);
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setEmployees(employeesData.employees || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionHash]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_date: '', description: '', category: '', amount: 0, remarks: '' }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof ClaimItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.amount.toString()) || 0), 0);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/claims?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Claim submitted successfully');
        setShowCreateModal(false);
        setFormData({ employee_id: '', claim_type_id: '', claim_date: '', description: '', remarks: '', items: [] });
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit claim');
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to submit claim');
    }
  };

  const handleApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClaim) return;
    
    try {
      const response = await fetch(`/api/admin/claims/approve?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedClaim.id, ...approvalData })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Claim ${approvalData.action}d successfully`);
        
        // Emit notification to employee
        if (selectedClaim) {
          try {
            const socket = getSocket();
            if (socket && socket.connected) {
              const claimNumber = selectedClaim.claim_number || result?.claim_number || 'N/A';
              console.log('📤 Emitting task_reviewed for claim:', claimNumber, 'to employee:', selectedClaim.employee_id);
              socket.emit('task_reviewed', {
                module: 'claims',
                action: approvalData.action,
                result: approvalData.action === 'approve' ? 'approved' : 'rejected',
                employeeId: selectedClaim.employee_id,
                entityId: claimNumber,
                message: `Your claim ${claimNumber} has been ${approvalData.action}d`,
                view: 'employee-claims'
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
        setSelectedClaim(null);
        setApprovalData({ action: 'approve', review_remarks: '' });
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || `Failed to ${approvalData.action} claim`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert(`Failed to ${approvalData.action} claim`);
    }
  };

  const handleViewClaim = async (claim: Claim) => {
    try {
      const response = await fetch(`/api/admin/claims/${claim.id}?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedClaim(data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching claim details:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: '#f59e0b', text: 'Pending' },
      approved: { bg: '#10b981', text: 'Approved' },
      rejected: { bg: '#ef4444', text: 'Rejected' },
      paid: { bg: '#3b82f6', text: 'Paid' },
      cancelled: { bg: '#6b7280', text: 'Cancelled' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
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

  const tableColumns: AdminTableColumn<Claim>[] = useMemo(() => [
    {
      key: 'claim_number',
      label: 'Claim No.',
      width: '110px',
      render: (_, row) => (
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
          {String(row.claim_number)}
        </span>
      )
    },
    {
      key: 'employee_name',
      label: 'Employee',
      width: '180px',
      render: (_, row) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>{String(row.employee_name)}</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>{String(row.employee_number)}</div>
        </div>
      )
    },
    {
      key: 'claim_type_name',
      label: 'Claim Type',
      width: '140px',
      render: (_, row) => {
        const claimType = claimTypes.find(t => t.id === row.claim_type_id);
        return (
          <span style={{
            backgroundColor: claimType?.color || '#e5e7eb',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 500
          }}>
            {String(row.claim_type_name)}
          </span>
        );
      }
    },
    {
      key: 'claim_date',
      label: 'Claim Date',
      width: '100px',
      render: (_, row) => (
        <span style={{ fontSize: '12px', color: '#374151' }}>
          {String(new Date(row.claim_date).toLocaleDateString())}
        </span>
      )
    },
    {
      key: 'items_count',
      label: 'Items',
      width: '60px',
      align: 'center',
      render: (_, row) => (
        <span style={{
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          padding: '4px 8px',
          borderRadius: '2px',
          fontSize: '11px',
          fontWeight: 600
        }}>
          {String(row.items_count)}
        </span>
      )
    },
    {
      key: 'total_amount',
      label: 'Amount (RM)',
      width: '110px',
      align: 'right',
      render: (_, row) => (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>
          {(typeof row.total_amount === 'number' ? row.total_amount : parseFloat(row.total_amount) || 0).toFixed(2)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      align: 'center',
      render: (_, row) => getStatusBadge(row.status)
    },
    {
      key: 'applied_date',
      label: 'Applied Date',
      width: '110px',
      render: (_, row) => (
        <span style={{ fontSize: '11px', color: '#6b7280' }}>
          {String(new Date(row.applied_date).toLocaleDateString())}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      width: '140px',
      render: (_, row) => {
        const actions = [actionPresets.view(() => handleViewClaim(row))];
        if (row.status === 'pending' && canPerformAction('claims', 'approve')) {
          actions.push({
            type: 'custom',
            icon: 'check_circle',
            color: '#10b981',
            title: 'Approve/Reject',
            onClick: () => {
              setSelectedClaim(row);
              setApprovalData({ action: 'approve', review_remarks: '' });
              setShowApproveModal(true);
            }
          });
        }
        return <AdminTableActions actions={actions} />;
      }
    }
  ], [claimTypes, canPerformAction]);

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch = claim.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.claim_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || claim.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClaims.length / pageSize);
  const paginatedClaims = filteredClaims.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
        <p className="text-muted mb-0" style={{ fontSize: 12 }}>Loading claim management...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
            Claim Management
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage employee expense claims and reimbursements
          </p>
        </div>
        
        <PermissionButton
          sessionHash={sessionHash}
          module="claims"
          action="create"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Submit Claim
        </PermissionButton>
      </div>

      {/* Filters */}
      <form className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by employee name or claim number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              fontSize: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              fontSize: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-outline-danger w-100"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('');
            }}
            style={{
              fontSize: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              fontWeight: 500,
              borderColor: '#dc2626',
              color: '#dc2626'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Claims Table */}
      <div style={{ marginBottom: '24px' }}>
        <AdminTable<Claim>
          columns={tableColumns}
          data={paginatedClaims}
          emptyMessage="No claims found. Submit your first claim to get started."
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Create Claim Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl" style={{ maxHeight: '90vh', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Submit New Claim
                </h5>
                <button onClick={() => setShowCreateModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Employee <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.employee_id}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="">-- Select Employee --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.employee_id} - {emp.full_name} ({emp.department_name})
                          </option>
                        ))}
                      </select>
                    </div>

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
                        {claimTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name} {type.max_amount ? `(Max: RM ${type.max_amount})` : ''}
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

                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Total Amount
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={`RM ${calculateTotal().toFixed(2)}`}
                        readOnly
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px', backgroundColor: '#f9fafb', fontWeight: 600 }}
                      />
                    </div>

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
                                <div className="col-md-4">
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
                                <div className="col-md-2">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Category
                                  </label>
                                  <select
                                    className="form-select"
                                    value={item.category}
                                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  >
                                    <option value="">Select Category</option>
                                    {claimTypes.map((type) => (
                                      <option key={type.id} value={type.name}>
                                        {type.name}
                                      </option>
                                    ))}
                                  </select>
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
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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

      {/* View Claim Modal */}
      {showViewModal && selectedClaim && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-receipt me-2"></i>
                  Claim Details
                </h5>
                <button onClick={() => setShowViewModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Claim Number</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedClaim.claim_number}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Status</label>
                    <div>{getStatusBadge(selectedClaim.status)}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Employee</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedClaim.employee_name}</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{selectedClaim.employee_number}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Department</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedClaim.department_name}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Claim Type</label>
                    <div>
                      <span style={{
                        backgroundColor: `${selectedClaim.claim_type_color}15`,
                        color: selectedClaim.claim_type_color,
                        padding: '4px 8px',
                        borderRadius: '2px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}>
                        {selectedClaim.claim_type_name}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Claim Date</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{new Date(selectedClaim.claim_date).toLocaleDateString('en-MY')}</div>
                  </div>
                  <div className="col-md-12">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Description</label>
                    <div style={{ fontSize: '12px', fontWeight: 400 }}>{selectedClaim.description}</div>
                  </div>
                  {selectedClaim.remarks && (
                    <div className="col-md-12">
                      <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Remarks</label>
                      <div style={{ fontSize: '12px', fontWeight: 400 }}>{selectedClaim.remarks}</div>
                    </div>
                  )}
                  
                  {/* Claim Items */}
                  <div className="col-md-12 mt-4">
                    <h6 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>Claim Items</h6>
                    <div className="table-responsive">
                      <table className="table table-sm" style={{ fontSize: '11px' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                          <tr>
                            <th style={{ fontSize: '10px', padding: '8px' }}>Date</th>
                            <th style={{ fontSize: '10px', padding: '8px' }}>Description</th>
                            <th style={{ fontSize: '10px', padding: '8px' }}>Category</th>
                            <th style={{ fontSize: '10px', padding: '8px', textAlign: 'right' }}>Amount (RM)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClaim.items && selectedClaim.items.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ fontSize: '10px', padding: '8px' }}>{new Date(item.item_date).toLocaleDateString('en-MY')}</td>
                              <td style={{ fontSize: '10px', padding: '8px' }}>{item.description}</td>
                              <td style={{ fontSize: '10px', padding: '8px' }}>{item.category || '-'}</td>
                              <td style={{ fontSize: '10px', padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                                {item.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                          <tr style={{ backgroundColor: '#f9fafb', fontWeight: 600 }}>
                            <td colSpan={3} style={{ fontSize: '11px', padding: '8px', textAlign: 'right' }}>TOTAL</td>
                            <td style={{ fontSize: '11px', padding: '8px', textAlign: 'right', color: '#10b981' }}>
                              RM {selectedClaim.total_amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedClaim.reviewed_by_name && (
                    <>
                      <div className="col-md-6 mt-3">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Reviewed By</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedClaim.reviewed_by_name}</div>
                      </div>
                      <div className="col-md-6 mt-3">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Reviewed Date</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>
                          {selectedClaim.reviewed_date && new Date(selectedClaim.reviewed_date).toLocaleDateString('en-MY')}
                        </div>
                      </div>
                      {selectedClaim.review_remarks && (
                        <div className="col-md-12">
                          <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Review Remarks</label>
                          <div style={{ fontSize: '12px', fontWeight: 400 }}>{selectedClaim.review_remarks}</div>
                        </div>
                      )}
                    </>
                  )}
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {showApproveModal && selectedClaim && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-check-circle me-2"></i>
                  Review Claim
                </h5>
                <button onClick={() => setShowApproveModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleApproval}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Claim Number
                    </label>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedClaim.claim_number}</div>
                  </div>
                  
                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Employee
                    </label>
                    <div style={{ fontSize: '12px' }}>{selectedClaim.employee_name}</div>
                  </div>

                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Total Amount
                    </label>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>
                      RM {selectedClaim.total_amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Action <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      required
                      value={approvalData.action}
                      onChange={(e) => setApprovalData({ ...approvalData, action: e.target.value as 'approve' | 'reject' })}
                      style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                    >
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Review Remarks
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={approvalData.review_remarks}
                      onChange={(e) => setApprovalData({ ...approvalData, review_remarks: e.target.value })}
                      placeholder="Enter review remarks (optional)"
                      style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="btn btn-outline-secondary"
                    style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${approvalData.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                    style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
                  >
                    <i className={`bi bi-${approvalData.action === 'approve' ? 'check' : 'x'}-circle me-2`}></i>
                    {approvalData.action === 'approve' ? 'Approve' : 'Reject'}
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

