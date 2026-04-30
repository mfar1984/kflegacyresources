'use client';

import { useState, useEffect, useMemo } from 'react';
import Pagination from '@/components/Pagination';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from '@/components/admin/PermissionButton';
import PermissionGuard from '@/components/admin/PermissionGuard';

interface Department {
  id: number;
  code: string;
  name: string;
  description: string;
  manager_id: number | null;
  manager_name: string | null;
  employee_count: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  position: string;
  department_id: number;
  status: string;
}

interface DepartmentManagementProps {
  sessionHash: string;
}

export default function DepartmentManagement({ sessionHash }: DepartmentManagementProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { canPerformAction } = usePermissions(sessionHash);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Partial<Department>>({});
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch departments when filters or page changes
  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterStatus, page, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterStatus]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/departments?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        const allDepartments = data.departments || [];
        
        // Client-side filtering
        let filtered = allDepartments;
        
        // Search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((dept: Department) =>
            dept.name.toLowerCase().includes(query) ||
            dept.code.toLowerCase().includes(query) ||
            dept.description.toLowerCase().includes(query)
          );
        }
        
        // Filter by status
        if (filterStatus) {
          filtered = filtered.filter((dept: Department) => dept.status === filterStatus);
        }
        
        // Client-side pagination
        setTotal(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
        
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const paginated = filtered.slice(startIdx, endIdx);
        
        setDepartments(paginated);
      } else {
        setError('Failed to fetch departments');
      }
    } catch (err) {
      setError('Error fetching departments');
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

  const handleCreate = () => {
    setFormData({
      status: 'active',
      code: '',
      name: '',
      description: '',
      manager_id: null
    });
    setShowCreateModal(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData(department);
    setShowEditModal(true);
  };

  const handleView = (department: Department) => {
    setSelectedDepartment(department);
    setShowViewModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/departments?hash=${sessionHash}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        alert('Department deleted successfully');
        fetchDepartments();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete department');
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      alert('Error deleting department');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = `/api/admin/departments?hash=${sessionHash}`;
      const method = selectedDepartment ? 'PUT' : 'POST';

      const payload: {
        id?: number;
        code: string | undefined;
        name: string | undefined;
        description: string | null;
        manager_id: number | null;
        status?: 'active' | 'inactive';
      } = {
        code: formData.code?.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        manager_id: formData.manager_id || null,
        status: formData.status
      };

      if (selectedDepartment) {
        payload.id = selectedDepartment.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(selectedDepartment ? 'Department updated successfully' : 'Department added successfully');
        setShowCreateModal(false);
        setShowEditModal(false);
        fetchDepartments();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to save department');
      }
    } catch (err) {
      console.error('Error saving department:', err);
      alert('Error saving department');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: '#10b981', text: 'Active' },
      inactive: { bg: '#6b7280', text: 'Inactive' }
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
    return (
      <span style={{
        backgroundColor: badge.bg,
        color: '#ffffff',
        padding: '4px 8px',
        borderRadius: '2px',
        fontSize: '11px',
        fontWeight: 500
      }}>
        {badge.text}
      </span>
    );
  };

  // Row hover handlers
  const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#f9fafb';
  };
  
  const handleRowLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#ffffff';
  };

  // Table columns configuration
  const canEditDepartment = canPerformAction('departments', 'edit');
  const canDeleteDepartment = canPerformAction('departments', 'delete');

  const tableColumns: AdminTableColumn<Department>[] = useMemo(() => [
    {
      key: 'code',
      label: 'Code',
      width: '80px',
      render: (_, row) => (
        <span style={{
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          padding: '4px 8px',
          borderRadius: '2px',
          fontSize: '11px',
          fontWeight: 600
        }}>
          {row.code}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Department Name',
      render: (_, row) => (
        <span style={{ fontSize: '12px', color: '#1f2937', fontWeight: 500 }}>
          {row.name}
        </span>
      )
    },
    {
      key: 'manager_name',
      label: 'Manager',
      width: '180px',
      render: (_, row) => (
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {row.manager_name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>None</span>}
        </span>
      )
    },
    {
      key: 'employee_count',
      label: 'Employees',
      width: '80px',
      align: 'center',
      render: (_, row) => (
        <span style={{
          backgroundColor: row.employee_count > 0 ? '#dcfce7' : '#f3f4f6',
          color: row.employee_count > 0 ? '#166534' : '#6b7280',
          padding: '4px 8px',
          borderRadius: '2px',
          fontSize: '11px',
          fontWeight: 600
        }}>
          {row.employee_count}
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
      key: 'actions',
      label: 'Actions',
      align: 'center',
      width: '140px',
      render: (_, row) => (
        <AdminTableActions
          actions={[
            actionPresets.view(() => handleView(row)),
            actionPresets.edit(() => handleEdit(row), canEditDepartment),
            actionPresets.delete(() => handleDelete(row.id), canDeleteDepartment)
          ]}
        />
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [canEditDepartment, canDeleteDepartment]);

  // Get employees for selected department
  const departmentEmployees = selectedDepartment
    ? employees.filter(emp => emp.department_id === selectedDepartment.id)
    : [];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
            Department Management
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage company departments and organizational structure
          </p>
        </div>
        <PermissionButton
          sessionHash={sessionHash}
          module="departments"
          action="create"
          className="btn btn-primary"
          onClick={handleCreate}
          title="Add Department"
          style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '6px', fontWeight: 500 }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Department
        </PermissionButton>
      </div>

      {/* Filters */}
      <form className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by department name, code, or description..."
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

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" style={{ fontSize: '12px' }}>{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: '24px' }}>
            <AdminTable<Department>
              columns={tableColumns}
              data={departments}
              emptyMessage="No departments found. Add your first department to get started."
              onRowHover={handleRowHover}
              onRowLeave={handleRowLeave}
            />
          </div>

          {/* Pagination */}
          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {total > 0 ? Math.min(page * pageSize, total) : 0} of {total} departments
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className={`bi bi-${showCreateModal ? 'building-add' : 'pencil-square'} me-2`}></i>
                  {showCreateModal ? 'Add New Department' : 'Edit Department'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                ></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="row g-3">
                    {/* Department Code */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Department Code <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        maxLength={10}
                        placeholder="Example: IT, HR, FIN"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px', textTransform: 'uppercase' }}
                      />
                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                        Unique code for department (maximum 10 characters)
                      </div>
                    </div>

                    {/* Department Name */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Department Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="Example: Information Technology"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* Description */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Description about this department..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* Manager */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Department Manager
                      </label>
                      <select
                        className="form-select"
                        value={formData.manager_id || ''}
                        onChange={(e) => setFormData({ ...formData, manager_id: e.target.value ? parseInt(e.target.value) : null })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="">None (Will be assigned later)</option>
                        {employees
                          .filter(emp => emp.status === 'active')
                          .map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.full_name} ({emp.employee_id}) - {emp.position}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Status <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.status || 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                    }}
                    style={{ fontSize: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-sm"
                    style={{ fontSize: '12px' }}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    {showCreateModal ? 'Save Department' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDepartment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <div>
                  <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                    <i className="bi bi-building me-2"></i>{selectedDepartment.name}
                  </h5>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    Kod: {selectedDepartment.code}
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>

              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row g-4">
                  {/* Department Info */}
                  <div className="col-md-12">
                    <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                      Department Information
                    </h6>
                    <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                      <div className="row">
                        <div className="col-md-6">
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Department Code</div>
                            <div>
                              <span style={{
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                padding: '4px 8px',
                                borderRadius: '2px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                {selectedDepartment.code}
                              </span>
                            </div>
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Department Name</div>
                            <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedDepartment.name}</div>
                          </div>
                          {selectedDepartment.description && (
                            <div>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Description</div>
                              <div style={{ fontSize: '11px', color: '#374151' }}>{selectedDepartment.description}</div>
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Manager</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>
                              {selectedDepartment.manager_name || (
                                <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No manager assigned</span>
                              )}
                            </div>
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Employee Count</div>
                            <div>
                              <span style={{
                                backgroundColor: selectedDepartment.employee_count > 0 ? '#dcfce7' : '#f3f4f6',
                                color: selectedDepartment.employee_count > 0 ? '#166534' : '#6b7280',
                                padding: '4px 8px',
                                borderRadius: '2px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                {selectedDepartment.employee_count} {selectedDepartment.employee_count === 1 ? 'employee' : 'employees'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Status</div>
                            <div>{getStatusBadge(selectedDepartment.status)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employees List */}
                  {departmentEmployees.length > 0 && (
                    <div className="col-md-12">
                      <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                        Employee List
                      </h6>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {departmentEmployees.map(emp => (
                          <div
                            key={emp.id}
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '2px',
                              padding: '12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 600, color: '#1f2937', marginBottom: '2px' }}>
                                {emp.full_name}
                              </div>
                              <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                {emp.employee_id} • {emp.position}
                              </div>
                            </div>
                            <span style={{
                              backgroundColor: emp.status === 'active' ? '#dcfce7' : '#f3f4f6',
                              color: emp.status === 'active' ? '#166534' : '#6b7280',
                              padding: '4px 8px',
                              borderRadius: '2px',
                              fontSize: '10px',
                              fontWeight: 500
                            }}>
                              {emp.status === 'active' ? 'Aktif' : emp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="col-md-12">
                    <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                      Additional Information
                    </h6>
                    <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Created at</div>
                        <div style={{ fontSize: '11px', fontWeight: 500 }}>
                          {new Date(selectedDepartment.created_at).toLocaleString('en-MY', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Updated at</div>
                        <div style={{ fontSize: '11px', fontWeight: 500 }}>
                          {new Date(selectedDepartment.updated_at).toLocaleString('en-MY', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowViewModal(false)}
                  style={{ fontSize: '12px' }}
                >
                  Close
                </button>
                <PermissionGuard sessionHash={sessionHash} permission="departments_edit" fallback={null}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedDepartment);
                    }}
                    style={{ fontSize: '12px' }}
                  >
                    <i className="bi bi-pencil me-1"></i>Update
                  </button>
                </PermissionGuard>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

