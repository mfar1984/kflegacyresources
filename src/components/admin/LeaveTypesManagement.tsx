'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import Pagination from '@/components/Pagination';

interface LeaveType {
  id: number;
  code: string;
  name: string;
  description: string;
  days_per_year: number;
  requires_document: boolean;
  document_label: string | null;
  is_paid: boolean;
  requires_approval: boolean;
  allow_half_days: boolean;
  carry_forward: boolean;
  color: string;
  status: string;
}

interface LeaveTypesManagementProps {
  sessionHash: string;
}

export default function LeaveTypesManagement({ sessionHash }: LeaveTypesManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    days_per_year: '',
    requires_document: false,
    document_label: '',
    is_paid: true,
    requires_approval: true,
    allow_half_days: false,
    carry_forward: false,
    color: '#3b82f6',
    status: 'active'
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, [sessionHash]);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/leave/types?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setLeaveTypes(data.leaveTypes || []);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/admin/leave/types?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Leave type created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchLeaveTypes();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create leave type');
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create leave type');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) return;
    
    try {
      const response = await fetch(`/api/admin/leave/types/${selectedType.id}?hash=${sessionHash}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Leave type updated successfully');
        setShowEditModal(false);
        setSelectedType(null);
        resetForm();
        fetchLeaveTypes();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update leave type');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update leave type');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leave type?')) return;
    
    try {
      const response = await fetch(`/api/admin/leave/types/${id}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Leave type deleted successfully');
        fetchLeaveTypes();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete leave type');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete leave type');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      days_per_year: '',
      requires_document: false,
      document_label: '',
      is_paid: true,
      requires_approval: true,
      allow_half_days: false,
      carry_forward: false,
      color: '#3b82f6',
      status: 'active'
    });
  };

  const openEditModal = (type: LeaveType) => {
    setSelectedType(type);
    setFormData({
      code: type.code,
      name: type.name,
      description: type.description,
      days_per_year: type.days_per_year.toString(),
      requires_document: type.requires_document,
      document_label: type.document_label || '',
      is_paid: type.is_paid,
      requires_approval: type.requires_approval,
      allow_half_days: type.allow_half_days,
      carry_forward: type.carry_forward,
      color: type.color,
      status: type.status
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <span style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '4px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 500 }}>
        Active
      </span>
    ) : (
      <span style={{ backgroundColor: '#6b7280', color: '#ffffff', padding: '4px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 500 }}>
        Inactive
      </span>
    );
  };

  const filteredTypes = leaveTypes.filter((type) => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         type.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || type.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTypes.length / pageSize);
  const paginatedTypes = filteredTypes.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Table columns configuration
  const tableColumns: AdminTableColumn<LeaveType>[] = useMemo(() => [
    {
      key: 'code',
      label: 'Code',
      render: (_, row: LeaveType) => (
        <span style={{
          backgroundColor: `${row.color}15`,
          color: row.color,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600
        }}>
          {row.code}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Leave Type',
      render: (value) => (
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'days_per_year',
      label: 'Max Days/Year',
      render: (value) => (
        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          {Number(value) === 0 ? 'Unlimited' : `${value} days`}
        </div>
      )
    },
    {
      key: 'is_paid',
      label: 'Paid',
      align: 'center',
      render: (value) => (
        value ? (
          <i className="bi bi-check-circle-fill" style={{ color: '#10b981', fontSize: '14px' }}></i>
        ) : (
          <i className="bi bi-x-circle-fill" style={{ color: '#ef4444', fontSize: '14px' }}></i>
        )
      )
    },
    {
      key: 'requires_approval',
      label: 'Approval',
      align: 'center',
      render: (value) => (
        value ? (
          <i className="bi bi-check-circle-fill" style={{ color: '#10b981', fontSize: '14px' }}></i>
        ) : (
          <i className="bi bi-x-circle-fill" style={{ color: '#6b7280', fontSize: '14px' }}></i>
        )
      )
    },
    {
      key: 'carry_forward',
      label: 'Carry Forward',
      align: 'center',
      render: (value) => (
        value ? (
          <i className="bi bi-check-circle-fill" style={{ color: '#10b981', fontSize: '14px' }}></i>
        ) : (
          <i className="bi bi-x-circle-fill" style={{ color: '#6b7280', fontSize: '14px' }}></i>
        )
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(String(value))
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      width: '140px',
      render: (_, row: LeaveType) => (
        <AdminTableActions 
          actions={[
            actionPresets.view(() => {
              setSelectedType(row);
              setShowViewModal(true);
            }),
            ...(canPerformAction('leave_types', 'edit') ? [actionPresets.edit(() => openEditModal(row))] : []),
            ...(canPerformAction('leave_types', 'delete') ? [actionPresets.delete(() => handleDelete(row.id))] : [])
          ]}
        />
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [leaveTypes, canPerformAction]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
        <p className="text-muted mb-0" style={{ fontSize: 12 }}>Loading leave types...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
            Leave Types Management
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage types of leave available for employees
          </p>
        </div>
        
        <PermissionButton
          sessionHash={sessionHash}
          module="leave_types"
          action="create"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Leave Type
        </PermissionButton>
      </div>

      {/* Filters */}
      <form className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or code..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
              fontWeight: 500
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div style={{ marginBottom: '24px' }}>
        <AdminTable<LeaveType>
          columns={tableColumns}
          data={paginatedTypes}
          emptyMessage="No leave types found."
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className={`bi bi-${showCreateModal ? 'plus' : 'pencil'}-circle me-2`}></i>
                  {showCreateModal ? 'Add Leave Type' : 'Edit Leave Type'}
                </h5>
                <button onClick={() => {
                  showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
                  resetForm();
                  setSelectedType(null);
                }} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={showCreateModal ? handleCreate : handleUpdate}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Code <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        maxLength={10}
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., AL"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    <div className="col-md-8">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Leave Type Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Annual Leave"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Max Days/Year <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        min="0"
                        value={formData.days_per_year}
                        onChange={(e) => setFormData({ ...formData, days_per_year: e.target.value })}
                        placeholder="0 for unlimited"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                      <small style={{ fontSize: '10px', color: '#6b7280' }}>0 = Unlimited</small>
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Color
                      </label>
                      <input
                        type="color"
                        className="form-control"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '2px', height: '38px' }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Status <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <div className="form-check" style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '2px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="is_paid"
                          checked={formData.is_paid}
                          onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="is_paid" style={{ fontSize: '11px', fontWeight: 500 }}>
                          <i className="bi bi-cash-coin me-2"></i>
                          Paid Leave
                        </label>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-check" style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '2px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="requires_approval"
                          checked={formData.requires_approval}
                          onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="requires_approval" style={{ fontSize: '11px', fontWeight: 500 }}>
                          <i className="bi bi-check-circle me-2"></i>
                          Requires Approval
                        </label>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-check" style={{ padding: '12px', backgroundColor: '#e0f2fe', borderRadius: '2px', border: '1px solid #0284c7' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="allow_half_days"
                          checked={formData.allow_half_days}
                          onChange={(e) => setFormData({ ...formData, allow_half_days: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="allow_half_days" style={{ fontSize: '11px', fontWeight: 500 }}>
                          <i className="bi bi-calendar2-check me-2"></i>
                          Allow Half Days
                        </label>
                        <small style={{ display: 'block', fontSize: '10px', color: '#075985', marginTop: '4px', marginLeft: '24px' }}>
                          Staff can apply for 0.5 days (half day) for this leave type
                        </small>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-check" style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '2px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="carry_forward"
                          checked={formData.carry_forward}
                          onChange={(e) => setFormData({ ...formData, carry_forward: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="carry_forward" style={{ fontSize: '11px', fontWeight: 500 }}>
                          <i className="bi bi-arrow-right-circle me-2"></i>
                          Allow Carry Forward to Next Year
                        </label>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-check" style={{ padding: '12px', backgroundColor: '#fff3cd', borderRadius: '2px', border: '1px solid #ffc107' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="requires_document"
                          checked={formData.requires_document}
                          onChange={(e) => setFormData({ ...formData, requires_document: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="requires_document" style={{ fontSize: '11px', fontWeight: 500 }}>
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Requires Supporting Document
                        </label>
                        <small style={{ display: 'block', fontSize: '10px', color: '#856404', marginTop: '4px', marginLeft: '24px' }}>
                          Staff must upload supporting document when applying for this leave type
                        </small>
                      </div>
                    </div>

                    {formData.requires_document && (
                      <div className="col-md-12">
                        <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                          Document Label <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required={formData.requires_document}
                          value={formData.document_label}
                          onChange={(e) => setFormData({ ...formData, document_label: e.target.value })}
                          placeholder="e.g., Medical Certificate (MC), Birth Certificate, Acceptance Letter/Course Information"
                          style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                        />
                        <small style={{ fontSize: '10px', color: '#6b7280' }}>
                          This label will be shown to staff when uploading document
                        </small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
                      resetForm();
                      setSelectedType(null);
                    }}
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
                    {showCreateModal ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedType && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-info-circle me-2"></i>
                  Leave Type Details
                </h5>
                <button onClick={() => setShowViewModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Code</label>
                    <div>
                      <span style={{
                        backgroundColor: `${selectedType.color}15`,
                        color: selectedType.color,
                        padding: '6px 12px',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {selectedType.code}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Name</label>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedType.name}</div>
                  </div>
                  <div className="col-md-12">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Description</label>
                    <div style={{ fontSize: '12px' }}>{selectedType.description || '-'}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Max Days/Year</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>
                      {selectedType.days_per_year === 0 ? 'Unlimited' : `${selectedType.days_per_year} days`}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Status</label>
                    <div>{getStatusBadge(selectedType.status)}</div>
                  </div>
                  <div className="col-md-4">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Paid Leave</label>
                    <div style={{ fontSize: '12px' }}>
                      {selectedType.is_paid ? (
                        <span style={{ color: '#10b981' }}><i className="bi bi-check-circle-fill me-1"></i>Yes</span>
                      ) : (
                        <span style={{ color: '#ef4444' }}><i className="bi bi-x-circle-fill me-1"></i>No</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Requires Approval</label>
                    <div style={{ fontSize: '12px' }}>
                      {selectedType.requires_approval ? (
                        <span style={{ color: '#10b981' }}><i className="bi bi-check-circle-fill me-1"></i>Yes</span>
                      ) : (
                        <span style={{ color: '#6b7280' }}><i className="bi bi-x-circle-fill me-1"></i>No</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Carry Forward</label>
                    <div style={{ fontSize: '12px' }}>
                      {selectedType.carry_forward ? (
                        <span style={{ color: '#10b981' }}><i className="bi bi-check-circle-fill me-1"></i>Yes</span>
                      ) : (
                        <span style={{ color: '#6b7280' }}><i className="bi bi-x-circle-fill me-1"></i>No</span>
                      )}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

