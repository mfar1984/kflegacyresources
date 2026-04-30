'use client';

import { useState, useEffect, useMemo } from 'react';
import Pagination from '@/components/Pagination';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';

interface Advance {
  id: number;
  advance_number: string;
  employee_id: number;
  employee_number: string;
  employee_name: string;
  employee_position: string;
  department_name: string;
  advance_amount: number;
  repayment_months: number;
  monthly_deduction: number;
  remaining_balance: number;
  paid_months: number;
  start_date: string;
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

interface AdvancesManagementProps {
  sessionHash: string;
}

export default function AdvancesManagement({ sessionHash }: AdvancesManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);
  
  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    advance_amount: '0',
    repayment_months: '3',
    start_date: new Date().toISOString().split('T')[0],
    remarks: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchAdvances();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const fetchAdvances = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/advances?hash=${sessionHash}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAdvances(data || []);
      } else {
        setError('Failed to fetch advances');
      }
    } catch (err) {
      setError('Error loading advances');
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

  const filteredAdvances = useMemo(() => {
    return advances.filter(advance => {
      const matchesSearch = 
        advance.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advance.employee_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advance.department_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || advance.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [advances, searchQuery, statusFilter]);

  const paginatedAdvances = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAdvances.slice(startIndex, endIndex);
  }, [filteredAdvances, page, pageSize]);

  const totalPages = Math.ceil(filteredAdvances.length / pageSize);

  const tableColumns: AdminTableColumn<Advance>[] = useMemo(() => [
    {
      key: 'advance_number',
      label: 'Advance Number',
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
      key: 'advance_amount',
      label: 'Advance Amount',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>RM {(parseFloat(String(value)) || 0).toFixed(2)}</span>
    },
    {
      key: 'monthly_deduction',
      label: 'Monthly',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>RM {(parseFloat(String(value)) || 0).toFixed(2)}</span>
    },
    {
      key: 'remaining_balance',
      label: 'Balance',
      sortable: true,
      render: (value, row) => {
        const balance = parseFloat(String(value)) || 0;
        const total = parseFloat(String(row.advance_amount)) || 1;
        const percentage = ((total - balance) / total * 100).toFixed(0);
        return (
          <div style={{ fontSize: '12px' }}>
            <div>RM {balance.toFixed(2)}</div>
            <div className="progress" style={{ height: '4px', marginTop: '2px' }}>
              <div 
                className="progress-bar bg-success" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'paid_months',
      label: 'Progress',
      sortable: true,
      render: (value, row) => (
        <span style={{ fontSize: '12px' }}>
          {String(value)} / {String(row.repayment_months)} months
        </span>
      )
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
      render: (_, row) => (
        <AdminTableActions
          actions={[
            actionPresets.view(() => handleView(row)),
            ...(canPerformAction('advances', 'update') ? [actionPresets.edit(() => handleEdit(row))] : []),
            ...(canPerformAction('advances', 'delete') ? [actionPresets.delete(() => handleDelete(row.id))] : [])
          ]}
        />
      )
    }
  ], []);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedAdvance(null);
    setFormData({
      employee_id: '',
      advance_amount: '0',
      repayment_months: '3',
      start_date: new Date().toISOString().split('T')[0],
      remarks: '',
      status: 'pending'
    });
    setShowModal(true);
  };

  const handleEdit = (advance: Advance) => {
    setModalMode('edit');
    setSelectedAdvance(advance);
    setFormData({
      employee_id: advance.employee_id.toString(),
      advance_amount: advance.advance_amount.toString(),
      repayment_months: advance.repayment_months.toString(),
      start_date: advance.start_date.split('T')[0],
      remarks: advance.remarks || '',
      status: advance.status
    });
    setShowModal(true);
  };

  const handleView = (advance: Advance) => {
    setModalMode('view');
    setSelectedAdvance(advance);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = modalMode === 'edit' && selectedAdvance
        ? `/api/admin/advances/${selectedAdvance.id}?hash=${sessionHash}`
        : `/api/admin/advances?hash=${sessionHash}`;
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: parseInt(formData.employee_id),
          advance_amount: parseFloat(formData.advance_amount) || 0,
          repayment_months: parseInt(formData.repayment_months) || 3,
          start_date: formData.start_date,
          remarks: formData.remarks,
          status: formData.status
        })
      });

      if (response.ok) {
        setShowModal(false);
        fetchAdvances();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save advance setup');
      }
    } catch (err) {
      setError('Error saving advance setup');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this advance setup?')) return;

    try {
      const response = await fetch(`/api/admin/advances/${id}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAdvances();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete advance setup');
      }
    } catch (err) {
      setError('Error deleting advance setup');
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  const getRepaymentProgress = (advance: Advance) => {
    const paid = advance.paid_months || 0;
    const total = advance.repayment_months || 1;
    return ((paid / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" style={{ width: 48, height: 48 }} />
        <p className="mt-3 text-muted" style={{ fontSize: 12 }}>Loading advances...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1" style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
            Advances Management
          </h4>
          <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
            Manage employee advances (housing, transport, meal, other)
          </p>
        </div>
        <PermissionButton
          sessionHash={sessionHash}
          module="advances"
          action="create"
          className="btn btn-primary"
          style={{ fontSize: 12, borderRadius: 2 }}
          onClick={handleCreate}
        >
          <i className="bi bi-plus-circle me-1"></i>
          New Advance Setup
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
      <AdminTable<Advance>
        columns={tableColumns}
        data={paginatedAdvances}
        emptyMessage="No advances found."
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
                  {modalMode === 'create' && 'New Advance Setup'}
                  {modalMode === 'edit' && 'Edit Advance Setup'}
                  {modalMode === 'view' && 'View Advance Setup'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} style={{ fontSize: 12 }}></button>
              </div>
              <div className="modal-body">
                {modalMode === 'view' && selectedAdvance ? (
                  <div className="row g-3">
                    <div className="col-md-12">
                      <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>Employee Information</h6>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Employee ID:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAdvance.employee_number}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Employee Name:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAdvance.employee_name}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Position:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAdvance.employee_position}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Department:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAdvance.department_name || '-'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>Advance Details</h6>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Advance Number:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAdvance.advance_number}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Advance Amount:</label>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#059669', marginBottom: 8 }}>
                            RM {(parseFloat(String(selectedAdvance.advance_amount)) || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Monthly Deduction:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>RM {(parseFloat(String(selectedAdvance.monthly_deduction)) || 0).toFixed(2)}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Repayment Period:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAdvance.repayment_months} months</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Remaining Balance:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>RM {(parseFloat(String(selectedAdvance.remaining_balance)) || 0).toFixed(2)}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Progress:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAdvance.paid_months} / {selectedAdvance.repayment_months} months ({getRepaymentProgress(selectedAdvance)}%)</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Start Date:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{new Date(selectedAdvance.start_date).toLocaleDateString('en-MY')}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Status:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>
                            <span className={`badge ${selectedAdvance.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {selectedAdvance.status}
                            </span>
                          </p>
                        </div>
                        {selectedAdvance.remarks && (
                          <div className="col-md-12">
                            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Remarks:</label>
                            <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAdvance.remarks}</p>
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
                          Advance Amount (RM) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.advance_amount}
                          onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                          style={{ fontSize: 12, borderRadius: 2 }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                          Repayment Months <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.repayment_months}
                          onChange={(e) => setFormData({ ...formData, repayment_months: e.target.value })}
                          required
                          style={{ fontSize: 12, borderRadius: 2 }}
                        >
                          <option value="1">1 month</option>
                          <option value="2">2 months</option>
                          <option value="3">3 months</option>
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                          Start Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          required
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
    </div>
  );
}

