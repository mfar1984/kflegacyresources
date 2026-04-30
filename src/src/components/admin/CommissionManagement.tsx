'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import Pagination from '@/components/Pagination';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import PermissionButton from './PermissionButton';

interface Commission {
  id: number;
  commission_number: string;
  employee_id: number;
  employee_number: string;
  employee_name: string;
  employee_position: string;
  department_name: string;
  payroll_period_id: number;
  period_name: string;
  period_month: number;
  period_year: number;
  commission_type: string;
  amount: number;
  remarks: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
  approved_by_name: string | null;
}

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  position: string;
  department_name: string;
}

interface PayrollPeriod {
  id: number;
  period_name: string;
  period_month: number;
  period_year: number;
  status: string;
}

interface CommissionManagementProps {
  sessionHash: string;
}

export default function CommissionManagement({ sessionHash }: CommissionManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [approvalData, setApprovalData] = useState<{ action: 'approve' | 'reject', remarks: string }>({ 
    action: 'approve', 
    remarks: '' 
  });
  
  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    payroll_period_id: '',
    commission_type: 'performance',
    amount: '0',
    remarks: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchCommissions();
    fetchEmployees();
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/commissions?hash=${sessionHash}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCommissions(data || []);
      } else {
        setError('Failed to fetch commissions');
      }
    } catch (err) {
      setError('Error loading commissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/admin/employees?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchPeriods = async () => {
    try {
      const response = await fetch(`/api/admin/payroll/periods?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setPeriods(data || []);
      }
    } catch (err) {
      console.error('Error fetching periods:', err);
    }
  };

  const filteredCommissions = useMemo(() => {
    return commissions.filter(commission => {
      const matchesSearch = 
        commission.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commission.employee_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commission.department_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [commissions, searchQuery, statusFilter]);

  const paginatedCommissions = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCommissions.slice(startIndex, endIndex);
  }, [filteredCommissions, page, pageSize]);

  const totalPages = Math.ceil(filteredCommissions.length / pageSize);

  const tableColumns: AdminTableColumn<Commission>[] = useMemo(() => [
    {
      key: 'commission_number',
      label: 'Commission Number',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px', fontWeight: 500 }}>{String(value)}</span>
    },
    {
      key: 'employee_name',
      label: 'Employee Name',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>{String(value)}</span>
    },
    {
      key: 'period_name',
      label: 'Period',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>{String(value || '-')}</span>
    },
    {
      key: 'commission_type',
      label: 'Commission Type',
      sortable: true,
      render: (value) => {
        const typeLabels: Record<string, string> = {
          sales: 'Sales',
          referral: 'Referral',
          project: 'Project',
          performance: 'Performance',
          other: 'Other'
        };
        return <span style={{ fontSize: '12px' }}>{typeLabels[String(value)] || String(value)}</span>;
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>RM {(parseFloat(String(value)) || 0).toFixed(2)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, row) => (
        <span 
          className={`badge ${row.status === 'active' ? 'bg-success' : 'bg-secondary'}`}
          style={{ fontSize: '11px' }}
        >
          {String(value)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const actions = [
          actionPresets.view(() => handleView(row)),
        ];
        
        // Only show approve/reject for pending commissions
        if (row.status === 'pending' && canPerformAction('commissions', 'approve')) {
          actions.push({
            type: 'custom',
            icon: 'check_circle',
            color: '#10b981',
            title: 'Approve/Reject',
            onClick: () => {
              setSelectedCommission(row);
              setApprovalData({ action: 'approve', remarks: '' });
              setShowApproveModal(true);
            }
          });
        }
        
        // Only show edit for pending commissions
        if (row.status === 'pending' && canPerformAction('commissions', 'update')) {
          actions.push(actionPresets.edit(() => handleEdit(row)));
        }
        
        if (canPerformAction('commissions', 'delete')) {
          actions.push(actionPresets.delete(() => handleDelete(row.id)));
        }
        
        return <AdminTableActions actions={actions} />;
      }
    }
  ], [canPerformAction]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedCommission(null);
    setFormData({
      employee_id: '',
      payroll_period_id: '',
      commission_type: 'performance',
      amount: '0',
      remarks: '',
      status: 'pending'
    });
    setShowModal(true);
  };

  const handleEdit = (commission: Commission) => {
    setModalMode('edit');
    setSelectedCommission(commission);
    setFormData({
      employee_id: commission.employee_id.toString(),
      payroll_period_id: commission.payroll_period_id.toString(),
      commission_type: commission.commission_type,
      amount: commission.amount.toString(),
      remarks: commission.remarks || '',
      status: commission.status
    });
    setShowModal(true);
  };

  const handleView = (commission: Commission) => {
    setModalMode('view');
    setSelectedCommission(commission);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = modalMode === 'edit' && selectedCommission
        ? `/api/admin/commissions/${selectedCommission.id}?hash=${sessionHash}`
        : `/api/admin/commissions?hash=${sessionHash}`;
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: parseInt(formData.employee_id),
          payroll_period_id: parseInt(formData.payroll_period_id),
          commission_type: formData.commission_type,
          amount: parseFloat(formData.amount) || 0,
          remarks: formData.remarks,
          status: formData.status
        })
      });

      if (response.ok) {
        setShowModal(false);
        fetchCommissions();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save commission setup');
      }
    } catch (err) {
      setError('Error saving commission setup');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this commission setup?')) return;

    try {
      const response = await fetch(`/api/admin/commissions/${id}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCommissions();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete commission setup');
      }
    } catch (err) {
      setError('Error deleting commission setup');
      console.error(err);
    }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommission) return;

    try {
      const response = await fetch(`/api/admin/commissions/approve?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCommission.id,
          action: approvalData.action,
          remarks: approvalData.remarks
        })
      });

      if (response.ok) {
        setShowApproveModal(false);
        fetchCommissions();
        setError('');
        alert(`Commission ${approvalData.action === 'approve' ? 'approved' : 'rejected'} successfully`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to process approval');
      }
    } catch (err) {
      setError('Error processing approval');
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  const getCommissionAmount = (commission: Commission) => {
    return parseFloat(String(commission.amount)) || 0;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" style={{ width: 48, height: 48 }} />
        <p className="mt-3 text-muted" style={{ fontSize: 12 }}>Loading commissions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1" style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
            Commission Management
          </h4>
          <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
            Manage employee commissions (sales, referral, project, performance)
          </p>
        </div>
        <PermissionButton
          sessionHash={sessionHash}
          module="commissions"
          action="create"
          className="btn btn-primary"
          style={{ fontSize: 12, borderRadius: 2 }}
          onClick={handleCreate}
        >
          <i className="bi bi-plus-circle me-1"></i>
          New Commission Setup
        </PermissionButton>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{ fontSize: 12, borderRadius: 2 }}>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} style={{ fontSize: 10 }}></button>
        </div>
      )}

      {/* Filters - Exact Career Management Pattern */}
      <form className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by employee name, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: 12, borderRadius: 2 }}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: 12, borderRadius: 2 }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="col-md-2">
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-outline-danger w-100"
            style={{ fontSize: 12, borderRadius: 2 }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <AdminTable<Commission>
        columns={tableColumns}
        data={paginatedCommissions}
        emptyMessage="No commissions found."
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 2 }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <h5 className="modal-title" style={{ fontSize: 16, fontWeight: 600 }}>
                  {modalMode === 'create' && 'New Allowance Setup'}
                  {modalMode === 'edit' && 'Edit Allowance Setup'}
                  {modalMode === 'view' && 'View Allowance Setup'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} style={{ fontSize: 12 }}></button>
              </div>
              <div className="modal-body">
                {modalMode === 'view' && selectedCommission ? (
                  <div className="row g-3">
                    <div className="col-md-12">
                      <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>Employee Information</h6>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Employee ID:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedCommission.employee_number}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Employee Name:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedCommission.employee_name}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Position:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedCommission.employee_position}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Department:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedCommission.department_name || '-'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>Commission Details</h6>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Commission Number:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedCommission.commission_number}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Period:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedCommission.period_name}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Commission Type:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedCommission.commission_type}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Amount:</label>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#059669', marginBottom: 8 }}>
                            RM {(parseFloat(String(selectedCommission.amount)) || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Status:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>
                            <span className={`badge ${selectedCommission.status === 'approved' ? 'bg-success' : selectedCommission.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                              {selectedCommission.status}
                            </span>
                          </p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Created:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{new Date(selectedCommission.created_at).toLocaleDateString('en-MY')}</p>
                        </div>
                        {selectedCommission.remarks && (
                          <div className="col-md-12">
                            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Remarks:</label>
                            <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedCommission.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-12">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                          Employee <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.employee_id}
                          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                          required
                          disabled={modalMode === 'edit'}
                          style={{ fontSize: 12, borderRadius: 2 }}
                        >
                          <option value="">Select employee...</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.employee_id} - {emp.full_name} ({emp.position})
                            </option>
                          ))}
                        </select>
                        {modalMode === 'edit' && (
                          <small className="text-muted" style={{ fontSize: 11 }}>
                            Employee cannot be changed in edit mode
                          </small>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                          Payroll Period <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.payroll_period_id}
                          onChange={(e) => setFormData({ ...formData, payroll_period_id: e.target.value })}
                          required
                          style={{ fontSize: 12, borderRadius: 2 }}
                        >
                          <option value="">Select period...</option>
                          {periods.map(period => (
                            <option key={period.id} value={period.id}>
                              {period.period_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                          Commission Type <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.commission_type}
                          onChange={(e) => setFormData({ ...formData, commission_type: e.target.value })}
                          required
                          style={{ fontSize: 12, borderRadius: 2 }}
                        >
                          <option value="sales">Sales Commission</option>
                          <option value="referral">Referral Commission</option>
                          <option value="project">Project Commission</option>
                          <option value="performance">Performance Commission</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                          Amount (RM) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                          style={{ fontSize: 12, borderRadius: 2 }}
                        />
                      </div>
                      <div className="col-md-12">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Remarks</label>
                        <textarea
                          className="form-control"
                          value={formData.remarks}
                          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                          rows={3}
                          style={{ fontSize: 12, borderRadius: 2 }}
                        ></textarea>
                      </div>
                    </div>
                    <div className="modal-footer mt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                      <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ fontSize: 12, borderRadius: 2 }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" style={{ fontSize: 12, borderRadius: 2 }}>
                        {modalMode === 'create' ? 'Create' : 'Update'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
              {modalMode === 'view' && (
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ fontSize: 12, borderRadius: 2 }}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {showApproveModal && selectedCommission && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: 14, fontWeight: 600 }}>
                  Approve/Reject Commission
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApproveModal(false)}
                  style={{ fontSize: 12 }}
                ></button>
              </div>
              <form onSubmit={handleApprove}>
                <div className="modal-body" style={{ padding: '20px' }}>
                  <div className="mb-3">
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                      Commission Number:
                    </label>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{selectedCommission.commission_number}</p>
                  </div>
                  
                  <div className="mb-3">
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                      Employee:
                    </label>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{selectedCommission.employee_name}</p>
                  </div>
                  
                  <div className="mb-3">
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                      Amount:
                    </label>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                      RM {(parseFloat(String(selectedCommission.amount)) || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="mb-3">
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                      Action: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={approvalData.action}
                      onChange={(e) => setApprovalData({ ...approvalData, action: e.target.value as 'approve' | 'reject' })}
                      style={{ fontSize: 12, padding: '8px 12px', borderRadius: '2px' }}
                      required
                    >
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                      Remarks:
                    </label>
                    <textarea
                      className="form-control"
                      value={approvalData.remarks}
                      onChange={(e) => setApprovalData({ ...approvalData, remarks: e.target.value })}
                      rows={3}
                      style={{ fontSize: 12, padding: '8px 12px', borderRadius: '2px' }}
                      placeholder="Optional remarks..."
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="btn btn-secondary"
                    style={{ fontSize: 12, padding: '8px 16px', borderRadius: '6px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-${approvalData.action === 'approve' ? 'success' : 'danger'}`}
                    style={{ fontSize: 12, padding: '8px 16px', borderRadius: '6px' }}
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

