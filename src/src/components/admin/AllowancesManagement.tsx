'use client';

import { useState, useEffect, useMemo } from 'react';
import Pagination from '@/components/Pagination';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';

interface Allowance {
  id: number;
  employee_id: number;
  employee_number: string;
  employee_name: string;
  employee_position: string;
  department_name: string;
  housing_allowance: number;
  transport_allowance: number;
  meal_allowance: number;
  other_allowances: number;
  effective_date: string;
  remarks: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
  updated_by_name: string | null;
}

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  position: string;
  department_name: string;
}

interface AllowancesManagementProps {
  sessionHash: string;
}

export default function AllowancesManagement({ sessionHash }: AllowancesManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null);
  
  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    housing_allowance: '0',
    transport_allowance: '0',
    meal_allowance: '0',
    other_allowances: '0',
    effective_date: new Date().toISOString().split('T')[0],
    remarks: '',
    status: 'active'
  });

  useEffect(() => {
    fetchAllowances();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const fetchAllowances = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/allowances?hash=${sessionHash}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAllowances(data || []);
      } else {
        setError('Failed to fetch allowances');
      }
    } catch (err) {
      setError('Error loading allowances');
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

  const filteredAllowances = useMemo(() => {
    return allowances.filter(allowance => {
      const matchesSearch = 
        allowance.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        allowance.employee_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        allowance.department_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || allowance.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [allowances, searchQuery, statusFilter]);

  const paginatedAllowances = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAllowances.slice(startIndex, endIndex);
  }, [filteredAllowances, page, pageSize]);

  const totalPages = Math.ceil(filteredAllowances.length / pageSize);

  const tableColumns: AdminTableColumn<Allowance>[] = useMemo(() => [
    {
      key: 'employee_number',
      label: 'Employee ID',
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
      key: 'department_name',
      label: 'Department',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>{String(value || '-')}</span>
    },
    {
      key: 'housing_allowance',
      label: 'Housing',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>RM {parseFloat(String(value)).toFixed(2)}</span>
    },
    {
      key: 'transport_allowance',
      label: 'Transport',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>RM {parseFloat(String(value)).toFixed(2)}</span>
    },
    {
      key: 'meal_allowance',
      label: 'Meal',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>RM {parseFloat(String(value)).toFixed(2)}</span>
    },
    {
      key: 'other_allowances',
      label: 'Other',
      sortable: true,
      render: (value) => <span style={{ fontSize: '12px' }}>RM {parseFloat(String(value)).toFixed(2)}</span>
    },
    {
      key: 'effective_date',
      label: 'Effective Date',
      sortable: true,
      render: (value) => {
        const date = new Date(String(value));
        return <span style={{ fontSize: '12px' }}>{date.toLocaleDateString('en-MY')}</span>;
      }
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
            ...(canPerformAction('allowances', 'update') ? [actionPresets.edit(() => handleEdit(row))] : []),
            ...(canPerformAction('allowances', 'delete') ? [actionPresets.delete(() => handleDelete(row.id))] : [])
          ]}
        />
      )
    }
  ], []);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedAllowance(null);
    setFormData({
      employee_id: '',
      housing_allowance: '0',
      transport_allowance: '0',
      meal_allowance: '0',
      other_allowances: '0',
      effective_date: new Date().toISOString().split('T')[0],
      remarks: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (allowance: Allowance) => {
    setModalMode('edit');
    setSelectedAllowance(allowance);
    setFormData({
      employee_id: allowance.employee_id.toString(),
      housing_allowance: allowance.housing_allowance.toString(),
      transport_allowance: allowance.transport_allowance.toString(),
      meal_allowance: allowance.meal_allowance.toString(),
      other_allowances: allowance.other_allowances.toString(),
      effective_date: allowance.effective_date.split('T')[0],
      remarks: allowance.remarks || '',
      status: allowance.status
    });
    setShowModal(true);
  };

  const handleView = (allowance: Allowance) => {
    setModalMode('view');
    setSelectedAllowance(allowance);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = modalMode === 'edit' && selectedAllowance
        ? `/api/admin/allowances/${selectedAllowance.id}?hash=${sessionHash}`
        : `/api/admin/allowances?hash=${sessionHash}`;
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          housing_allowance: parseFloat(formData.housing_allowance) || 0,
          transport_allowance: parseFloat(formData.transport_allowance) || 0,
          meal_allowance: parseFloat(formData.meal_allowance) || 0,
          other_allowances: parseFloat(formData.other_allowances) || 0
        })
      });

      if (response.ok) {
        setShowModal(false);
        fetchAllowances();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save allowance setup');
      }
    } catch (err) {
      setError('Error saving allowance setup');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this allowance setup?')) return;

    try {
      const response = await fetch(`/api/admin/allowances/${id}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAllowances();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete allowance setup');
      }
    } catch (err) {
      setError('Error deleting allowance setup');
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  const getTotalAllowances = (allowance: Allowance) => {
    return (
      parseFloat(String(allowance.housing_allowance)) +
      parseFloat(String(allowance.transport_allowance)) +
      parseFloat(String(allowance.meal_allowance)) +
      parseFloat(String(allowance.other_allowances))
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" style={{ width: 48, height: 48 }} />
        <p className="mt-3 text-muted" style={{ fontSize: 12 }}>Loading allowances...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1" style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
            Allowances Management
          </h4>
          <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
            Manage employee allowances (housing, transport, meal, other)
          </p>
        </div>
        <PermissionButton
          sessionHash={sessionHash}
          module="allowances"
          action="create"
          className="btn btn-primary"
          style={{ fontSize: 12, borderRadius: 2 }}
          onClick={handleCreate}
        >
          <i className="bi bi-plus-circle me-1"></i>
          New Allowance Setup
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
      <AdminTable<Allowance>
        columns={tableColumns}
        data={paginatedAllowances}
        emptyMessage="No allowances found."
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
                {modalMode === 'view' && selectedAllowance ? (
                  <div className="row g-3">
                    <div className="col-md-12">
                      <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>Employee Information</h6>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Employee ID:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAllowance.employee_number}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Employee Name:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAllowance.employee_name}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Position:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAllowance.employee_position}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Department:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAllowance.department_name || '-'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#374151' }}>Allowance Details</h6>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Housing Allowance:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>RM {(parseFloat(String(selectedAllowance.housing_allowance)) || 0).toFixed(2)}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Transport Allowance:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>RM {(parseFloat(String(selectedAllowance.transport_allowance)) || 0).toFixed(2)}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Meal Allowance:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>RM {(parseFloat(String(selectedAllowance.meal_allowance)) || 0).toFixed(2)}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Other Allowances:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>RM {(parseFloat(String(selectedAllowance.other_allowances)) || 0).toFixed(2)}</p>
                        </div>
                        <div className="col-md-12">
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>Total Monthly Allowances:</label>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#059669', marginBottom: 8 }}>
                            RM {getTotalAllowances(selectedAllowance).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Effective Date:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>{new Date(selectedAllowance.effective_date).toLocaleDateString('en-MY')}</p>
                        </div>
                        <div className="col-md-6">
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Status:</label>
                          <p style={{ fontSize: 12, marginBottom: 8 }}>
                            <span className={`badge ${selectedAllowance.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {selectedAllowance.status}
                            </span>
                          </p>
                        </div>
                        {selectedAllowance.remarks && (
                          <div className="col-md-12">
                            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Remarks:</label>
                            <p style={{ fontSize: 12, marginBottom: 8 }}>{selectedAllowance.remarks}</p>
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
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Housing Allowance (RM)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.housing_allowance}
                          onChange={(e) => setFormData({ ...formData, housing_allowance: e.target.value })}
                          min="0"
                          step="0.01"
                          style={{ fontSize: 12, borderRadius: 2 }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Transport Allowance (RM)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.transport_allowance}
                          onChange={(e) => setFormData({ ...formData, transport_allowance: e.target.value })}
                          min="0"
                          step="0.01"
                          style={{ fontSize: 12, borderRadius: 2 }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Meal Allowance (RM)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.meal_allowance}
                          onChange={(e) => setFormData({ ...formData, meal_allowance: e.target.value })}
                          min="0"
                          step="0.01"
                          style={{ fontSize: 12, borderRadius: 2 }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Other Allowances (RM)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.other_allowances}
                          onChange={(e) => setFormData({ ...formData, other_allowances: e.target.value })}
                          min="0"
                          step="0.01"
                          style={{ fontSize: 12, borderRadius: 2 }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                          Effective Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.effective_date}
                          onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                          required
                          style={{ fontSize: 12, borderRadius: 2 }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          style={{ fontSize: 12, borderRadius: 2 }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
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

