'use client';

import { useState, useEffect, useMemo } from 'react';
import Pagination from '@/components/Pagination';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import QRCode from 'qrcode';
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
}

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  ic_number: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other' | 'male' | 'female';
  nationality: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  position: string;
  department_id: number;
  department_name: string;
  department_code: string;
  employment_type: 'Permanent' | 'Contract' | 'Intern' | 'Part-Time';
  join_date: string;
  confirmation_date: string;
  resign_date: string | null;
  basic_salary: number;
  allowances: number;
  bank_name: string;
  bank_account_number: string;
  epf_number: string;
  socso_number: string;
  tax_number: string;
  status: 'active' | 'on_leave' | 'resigned' | 'terminated';
  profile_photo: string | null;
  qr_code: string;
  notes: string;
  resume_path?: string | null;
  cover_letter_path?: string | null;
  certificates_path?: string | null;
  highest_education?: string | null;
  field_of_study?: string | null;
  institution?: string | null;
  graduation_year?: string | null;
  years_of_experience?: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

interface EmployeeDocument {
  id: number;
  employee_id: number;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size: number;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
}

interface EmployeeManagementProps {
  sessionHash: string;
}

export default function EmployeeManagement({ sessionHash }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { canPerformAction } = usePermissions(sessionHash);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [allowSubmit, setAllowSubmit] = useState(false);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmploymentType, setFilterEmploymentType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // QR Code
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'documents' | 'login'>('personal');
  
  // Login Account Management
  const [employeeLoginAccount, setEmployeeLoginAccount] = useState<{ username: string; status: string } | null>(null);
  const [showCreateLoginModal, setShowCreateLoginModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch employees when filters or page changes
  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterDepartment, filterStatus, filterEmploymentType, page, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterDepartment, filterStatus, filterEmploymentType]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/employees?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        const allEmployees = data.employees || [];
        
        // Client-side filtering
        let filtered = allEmployees;

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
          filtered = filtered.filter((emp: Employee) =>
        emp.full_name.toLowerCase().includes(query) ||
        emp.employee_id.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query)
      );
    }

    // Filter by department
    if (filterDepartment) {
          filtered = filtered.filter((emp: Employee) => emp.department_id === parseInt(filterDepartment));
    }

    // Filter by status
    if (filterStatus) {
          filtered = filtered.filter((emp: Employee) => emp.status === filterStatus);
    }

    // Filter by employment type
    if (filterEmploymentType) {
          filtered = filtered.filter((emp: Employee) => emp.employment_type === filterEmploymentType);
    }

        // Client-side pagination
    setTotal(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));

    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
        const paginated = filtered.slice(startIdx, endIdx);
        
        setEmployees(paginated);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err) {
      setError('Error fetching employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`/api/admin/departments?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };


  const handleCreate = () => {
    setFormData({
      status: 'active',
      employment_type: 'Permanent',
      nationality: 'Malaysian',
      country: 'Malaysia',
      allowances: 0
    });
    setProfilePhoto(null);
    setCurrentStep(1);
    setAllowSubmit(false);
    setShowCreateModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    
    // Format dates for HTML5 date inputs (YYYY-MM-DD)
    const formatDate = (date: string | null | undefined): string => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    };
    
    setFormData({
      ...employee,
      date_of_birth: formatDate(employee.date_of_birth),
      join_date: formatDate(employee.join_date),
      confirmation_date: formatDate(employee.confirmation_date),
      resign_date: formatDate(employee.resign_date)
    });
    
    setProfilePhoto(null);
    setCurrentStep(1);
    setAllowSubmit(false);
    setShowEditModal(true);
  };

  const handleView = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setActiveTab('personal');
    
    // Fetch employee documents
    try {
      const response = await fetch(`/api/admin/employees/${employee.id}?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
    }
    
    // Fetch login account status
    fetchEmployeeLoginAccount(employee.id);
    
    setShowViewModal(true);
  };

  const handleShowQR = async (employee: Employee) => {
    setSelectedEmployee(employee);
    try {
      const qrData = `ANSAR-EMPLOYEE:${employee.employee_id}:${employee.qr_code}`;
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
      setShowQRModal(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
      alert('Failed to generate QR code');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees/${id}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Employee deleted successfully');
        fetchEmployees();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete employee');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Error deleting employee');
    }
  };

  const fetchEmployeeLoginAccount = async (employeeId: number) => {
    try {
      const response = await fetch(`/api/admin/employees/${employeeId}/login-status?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeLoginAccount(data.loginAccount);
      } else {
        setEmployeeLoginAccount(null);
      }
    } catch (err) {
      setEmployeeLoginAccount(null);
    }
  };

  const handleCreateLogin = async () => {
    if (!selectedEmployee || !loginUsername || !loginPassword) {
      alert('Username and password are required');
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees/create-login?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          username: loginUsername,
          password: loginPassword
        })
      });

      if (response.ok) {
        alert('Login account created successfully');
        setShowCreateLoginModal(false);
        setLoginUsername('');
        setLoginPassword('');
        fetchEmployeeLoginAccount(selectedEmployee.id);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create login account');
      }
    } catch (err) {
      alert('Error creating login account');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedEmployee || !newPassword) {
      alert('New password is required');
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees/reset-password?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          new_password: newPassword
        })
      });

      if (response.ok) {
        alert('Password reset successfully');
        setShowResetPasswordModal(false);
        setNewPassword('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reset password');
      }
    } catch (err) {
      alert('Error resetting password');
    }
  };

  const handleSuspendLogin = async (action: 'suspend' | 'activate') => {
    if (!selectedEmployee) return;

    if (!confirm(`Are you sure you want to ${action} this login account?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees/suspend-login?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          action: action
        })
      });

      if (response.ok) {
        alert(`Login account ${action}d successfully`);
        fetchEmployeeLoginAccount(selectedEmployee.id);
      } else {
        const data = await response.json();
        alert(data.error || `Failed to ${action} login account`);
      }
    } catch (err) {
      alert(`Error ${action}ing login account`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only submit if explicitly allowed (user clicked Update button)
    if (!allowSubmit) {
      return;
    }

    setAllowSubmit(false); // Reset flag after submission

    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataToSend.append(key, String(value));
      }
    });

    // Append profile photo if selected
    if (profilePhoto) {
      formDataToSend.append('profile_photo', profilePhoto);
    } else if (selectedEmployee?.profile_photo) {
      formDataToSend.append('existing_profile_photo', selectedEmployee.profile_photo);
    }

    try {
      const url = selectedEmployee
        ? `/api/admin/employees/${selectedEmployee.id}?hash=${sessionHash}`
        : `/api/admin/employees?hash=${sessionHash}`;
      
      const method = selectedEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        alert(selectedEmployee ? 'Employee updated successfully' : 'Employee created successfully');
        setShowCreateModal(false);
        setShowEditModal(false);
        fetchEmployees();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to save employee');
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      alert('Error saving employee');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: '#10b981', text: 'Active' },
      on_leave: { bg: '#3b82f6', text: 'On Leave' },
      resigned: { bg: '#6b7280', text: 'Resigned' },
      terminated: { bg: '#ef4444', text: 'Terminated' }
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
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

  // Row hover handlers
  const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#f9fafb';
  };
  
  const handleRowLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#ffffff';
  };

  // Table columns configuration
  const canEditEmployee = canPerformAction('employees', 'edit');
  const canDeleteEmployee = canPerformAction('employees', 'delete');

  const tableColumns: AdminTableColumn<Employee>[] = useMemo(() => [
    {
      key: 'employee_id',
      label: 'Employee ID',
      width: '120px',
      render: (_, row) => (
        <button
          onClick={() => handleShowQR(row)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0891b2',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '12px',
            padding: 0
          }}
        >
          {String(row.employee_id)}
        </button>
      )
    },
    {
      key: 'full_name',
      label: 'Name',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {row.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.profile_photo}
              alt={row.full_name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280'
            }}>
              {row.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>{String(row.full_name)}</div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>{String(row.email)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'position',
      label: 'Position',
      width: '150px',
      render: (_, row) => (
        <span style={{ fontSize: '12px', color: '#374151' }}>
          {String(row.position)}
        </span>
      )
    },
    {
      key: 'department_name',
      label: 'Department',
      width: '120px',
      render: (_, row) => (
        <span style={{ fontSize: '12px', color: '#374151' }}>
          {String(row.department_name || '-')}
        </span>
      )
    },
    {
      key: 'employment_type',
      label: 'Type',
      width: '100px',
      align: 'center',
      render: (_, row) => (
        <span style={{ fontSize: '12px', color: '#374151' }}>
          {String(row.employment_type)}
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
            actionPresets.edit(() => handleEdit(row), canEditEmployee),
            actionPresets.delete(() => handleDelete(row.id), canDeleteEmployee)
          ]}
        />
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [canEditEmployee, canDeleteEmployee]);

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>Employee Management</h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage employee records, profiles, and information
          </p>
        </div>
        <PermissionButton
          sessionHash={sessionHash}
          module="employees"
          action="create"
          className="btn btn-primary d-flex align-items-center"
          onClick={handleCreate}
          title="Add Employee"
          style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '6px', fontWeight: 500 }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Employee
        </PermissionButton>
      </div>

      {/* Filters */}
      <form className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, ID, email, position..."
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
            <option value="on_leave">On Leave</option>
            <option value="resigned">Resigned</option>
            <option value="terminated">Terminated</option>
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
            <AdminTable<Employee>
              columns={tableColumns}
              data={employees}
              emptyMessage="No employees found. Add your first employee to get started."
              onRowHover={handleRowHover}
              onRowLeave={handleRowLeave}
            />
          </div>

          {/* Pagination */}
          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {total > 0 ? Math.min(page * pageSize, total) : 0} of {total} employees
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedEmployee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-qr-code me-2"></i>Employee QR Code
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowQRModal(false)}></button>
              </div>
              <div className="modal-body text-center" style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>
                    {selectedEmployee.full_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {selectedEmployee.employee_id}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {selectedEmployee.position} • {selectedEmployee.department_name}
                  </div>
                </div>
                {qrCodeDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    style={{ maxWidth: '100%', border: '1px solid #e5e7eb', borderRadius: '2px' }}
                  />
                )}
                <div style={{ marginTop: '16px', fontSize: '10px', color: '#6b7280' }}>
                  Scan this QR code to verify employee identity
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowQRModal(false)}
                  style={{ fontSize: '12px' }}
                >
                  Close
                </button>
                <a
                  href={qrCodeDataUrl}
                  download={`${selectedEmployee.employee_id}-qr.png`}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '12px' }}
                >
                  <i className="bi bi-download me-1"></i>Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl" style={{ maxHeight: '90vh', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className={`bi bi-${showCreateModal ? 'person-plus' : 'pencil-square'} me-2`}></i>
                  {showCreateModal ? 'Add New Employee' : 'Update Employee'}
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
              
              {/* Step Indicator */}
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center" style={{ flex: 1 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: currentStep >= 1 ? '#0891b2' : '#e5e7eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>1</div>
                    <div style={{ flex: 1, height: '2px', backgroundColor: currentStep >= 2 ? '#0891b2' : '#e5e7eb', margin: '0 8px' }}></div>
                  </div>
                  <div className="d-flex align-items-center" style={{ flex: 1 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: currentStep >= 2 ? '#0891b2' : '#e5e7eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>2</div>
                    <div style={{ flex: 1, height: '2px', backgroundColor: currentStep >= 3 ? '#0891b2' : '#e5e7eb', margin: '0 8px' }}></div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: currentStep >= 3 ? '#0891b2' : '#e5e7eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>3</div>
                  </div>
                </div>
                <div className="d-flex justify-content-between" style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: currentStep >= 1 ? '#0891b2' : '#6b7280', flex: 1, textAlign: 'left' }}>
                    Personal Info
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: currentStep >= 2 ? '#0891b2' : '#6b7280', flex: 1, textAlign: 'center' }}>
                    Employment Info
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: currentStep >= 3 ? '#0891b2' : '#6b7280', flex: 1, textAlign: 'right' }}>
                    Salary & Bank
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div>
                      <h6 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>
                        Personal Information
                      </h6>
                      
                      <div className="row g-3">
                        {/* Profile Photo */}
                        <div className="col-md-12">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Profile Photo
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setProfilePhoto(e.target.files[0]);
                              }
                            }}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                          {profilePhoto && (
                            <div style={{ fontSize: '10px', color: '#10b981', marginTop: '4px' }}>
                              Selected: {profilePhoto.name}
                            </div>
                          )}
                        </div>

                        {/* Full Name */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Full Name <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.full_name || ''}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Email */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Email <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            required
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Phone */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Phone Number <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* IC Number */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            IC Number <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.ic_number || ''}
                            onChange={(e) => setFormData({ ...formData, ic_number: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Date of Birth */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Date of Birth <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            required
                            value={formData.date_of_birth || ''}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Gender */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Gender <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            className="form-select"
                            required
                            value={formData.gender || ''}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* Marital Status */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Marital Status
                          </label>
                          <select
                            className="form-select"
                            value={formData.marital_status || 'single'}
                            onChange={(e) => setFormData({ ...formData, marital_status: e.target.value as 'single' | 'married' | 'divorced' | 'widowed' })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          >
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                          </select>
                        </div>

                        {/* Nationality */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Nationality <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.nationality || 'Malaysian'}
                            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Address */}
                        <div className="col-md-12">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Address <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <textarea
                            className="form-control"
                            required
                            rows={2}
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Postcode */}
                        <div className="col-md-3">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Postcode <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.postcode || ''}
                            onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* City */}
                        <div className="col-md-3">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            City <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.city || ''}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* State */}
                        <div className="col-md-3">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            State <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.state || ''}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Country */}
                        <div className="col-md-3">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Country <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.country || 'Malaysia'}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Emergency Contact Name */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Emergency Contact Name <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.emergency_contact_name || ''}
                            onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Emergency Contact Phone */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Emergency Phone <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.emergency_contact_phone || ''}
                            onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Emergency Contact Relationship */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Relationship <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            placeholder="Example: Mother, Father, Sibling"
                            value={formData.emergency_contact_relationship || ''}
                            onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Employment Information */}
                  {currentStep === 2 && (
                    <div>
                      <h6 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>
                        Employment Information
                      </h6>
                      
                      <div className="row g-3">
                        {/* Position */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Position <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.position || ''}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Department */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Department <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            className="form-select"
                            required
                            value={formData.department_id || ''}
                            onChange={(e) => setFormData({ ...formData, department_id: parseInt(e.target.value) })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name} ({dept.code})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Employment Type */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Employment Type <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            className="form-select"
                            required
                            value={formData.employment_type || 'Permanent'}
                            onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          >
                            <option value="Permanent">Permanent</option>
                            <option value="Contract">Contract</option>
                            <option value="Intern">Intern</option>
                            <option value="Part-Time">Part-Time</option>
                          </select>
                        </div>

                        {/* Join Date */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Join Date <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            required
                            value={formData.join_date || ''}
                            onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Confirmation Date */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Confirmation Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.confirmation_date || ''}
                            onChange={(e) => setFormData({ ...formData, confirmation_date: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Status */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Status <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            className="form-select"
                            required
                            value={formData.status || 'active'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          >
                            <option value="active">Active</option>
                            <option value="on_leave">On Leave</option>
                            <option value="resigned">Resigned</option>
                            <option value="terminated">Terminated</option>
                          </select>
                        </div>

                        {/* Resign Date (if resigned/terminated) */}
                        {(formData.status === 'resigned' || formData.status === 'terminated') && (
                          <div className="col-md-6">
                            <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                              Last Working Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              value={formData.resign_date || ''}
                              onChange={(e) => setFormData({ ...formData, resign_date: e.target.value })}
                              style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                            />
                          </div>
                        )}

                        {/* Notes */}
                        <div className="col-md-12">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Notes
                          </label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Salary & Bank Information */}
                  {currentStep === 3 && (
                    <div>
                      <h6 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>
                        Salary & Bank Information
                      </h6>
                      
                      <div className="row g-3">
                        {/* Basic Salary */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Basic Salary (RM) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            required
                            step="0.01"
                            value={formData.basic_salary || ''}
                            onChange={(e) => setFormData({ ...formData, basic_salary: parseFloat(e.target.value) })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Allowances */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Allowances (RM)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            step="0.01"
                            value={formData.allowances || 0}
                            onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Bank Name */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Bank Name <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.bank_name || ''}
                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Bank Account Number */}
                        <div className="col-md-6">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            No. Akaun Bank <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={formData.bank_account_number || ''}
                            onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* EPF Number */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            EPF Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.epf_number || ''}
                            onChange={(e) => setFormData({ ...formData, epf_number: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* SOCSO Number */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            SOCSO Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.socso_number || ''}
                            onChange={(e) => setFormData({ ...formData, socso_number: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>

                        {/* Tax Number */}
                        <div className="col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Tax Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.tax_number || ''}
                            onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                            style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      style={{ fontSize: '12px' }}
                    >
                      <i className="bi bi-arrow-left me-1"></i>Kembali
                    </button>
                  )}
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      style={{ fontSize: '12px' }}
                    >
                      Next<i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-success btn-sm"
                      style={{ fontSize: '12px' }}
                      onClick={() => setAllowSubmit(true)}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      {showCreateModal ? 'Save Employee' : 'Update'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <div className="d-flex align-items-center gap-3">
                  {selectedEmployee.profile_photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedEmployee.profile_photo}
                      alt={selectedEmployee.full_name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #e5e7eb'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#6b7280',
                      border: '2px solid #e5e7eb'
                    }}>
                      {selectedEmployee.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
                      {selectedEmployee.full_name}
                    </h5>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {selectedEmployee.employee_id} • {selectedEmployee.position}
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>

              {/* Tabs */}
              <div style={{ borderBottom: '1px solid #e5e7eb', padding: '0 16px', backgroundColor: '#f9fafb' }}>
                <div className="d-flex" style={{ gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTab === 'personal' ? 'btn-primary' : 'btn-link'}`}
                    onClick={() => setActiveTab('personal')}
                    style={{
                      fontSize: '11px',
                      padding: '8px 16px',
                      borderRadius: '0',
                      borderBottom: activeTab === 'personal' ? '2px solid #0891b2' : 'none',
                      textDecoration: 'none',
                      color: activeTab === 'personal' ? '#ffffff' : '#6b7280'
                    }}
                  >
                    <i className="bi bi-person me-1"></i>Personal
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTab === 'employment' ? 'btn-primary' : 'btn-link'}`}
                    onClick={() => setActiveTab('employment')}
                    style={{
                      fontSize: '11px',
                      padding: '8px 16px',
                      borderRadius: '0',
                      borderBottom: activeTab === 'employment' ? '2px solid #0891b2' : 'none',
                      textDecoration: 'none',
                      color: activeTab === 'employment' ? '#ffffff' : '#6b7280'
                    }}
                  >
                    <i className="bi bi-briefcase me-1"></i>Employment
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTab === 'documents' ? 'btn-primary' : 'btn-link'}`}
                    onClick={() => setActiveTab('documents')}
                    style={{
                      fontSize: '11px',
                      padding: '8px 16px',
                      borderRadius: '0',
                      borderBottom: activeTab === 'documents' ? '2px solid #0891b2' : 'none',
                      textDecoration: 'none',
                      color: activeTab === 'documents' ? '#ffffff' : '#6b7280'
                    }}
                  >
                    <i className="bi bi-file-earmark-text me-1"></i>Documents ({employeeDocuments.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTab === 'login' ? 'btn-primary' : 'btn-link'}`}
                    onClick={() => setActiveTab('login')}
                    style={{
                      fontSize: '11px',
                      padding: '8px 16px',
                      borderRadius: '0',
                      borderBottom: activeTab === 'login' ? '2px solid #0891b2' : 'none',
                      textDecoration: 'none',
                      color: activeTab === 'login' ? '#ffffff' : '#6b7280'
                    }}
                  >
                    <i className="bi bi-key me-1"></i>Login Account
                  </button>
                </div>
              </div>

              <div className="modal-body" style={{ padding: '24px' }}>
                {/* Personal Tab */}
                {activeTab === 'personal' && (
                  <div>
                    <div className="row g-4">
                      {/* Contact Information */}
                      <div className="col-md-6">
                        <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                          Contact Information
                        </h6>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Email</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.email}</div>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Phone</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.phone}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>IC Number</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.ic_number}</div>
                          </div>
                        </div>
                      </div>

                      {/* Personal Details */}
                      <div className="col-md-6">
                        <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                          Personal Details
                        </h6>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Date of Birth</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>
                              {new Date(selectedEmployee.date_of_birth).toLocaleDateString('en-MY')}
                            </div>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Gender</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.gender}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Marital Status</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>
                              {selectedEmployee.marital_status ? selectedEmployee.marital_status.charAt(0).toUpperCase() + selectedEmployee.marital_status.slice(1) : 'Not specified'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Nationality</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.nationality}</div>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="col-md-12">
                        <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                          Address
                        </h6>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>
                            {selectedEmployee.address}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {selectedEmployee.postcode} {selectedEmployee.city}, {selectedEmployee.state}, {selectedEmployee.country}
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="col-md-12">
                        <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                          Emergency Contact
                        </h6>
                        <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '2px', border: '1px solid #fde68a' }}>
                          <div className="row">
                            <div className="col-md-4">
                              <div style={{ fontSize: '10px', color: '#92400e', marginBottom: '2px' }}>Name</div>
                              <div style={{ fontSize: '11px', fontWeight: 500, color: '#78350f' }}>
                                {selectedEmployee.emergency_contact_name}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div style={{ fontSize: '10px', color: '#92400e', marginBottom: '2px' }}>Phone</div>
                              <div style={{ fontSize: '11px', fontWeight: 500, color: '#78350f' }}>
                                {selectedEmployee.emergency_contact_phone}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div style={{ fontSize: '10px', color: '#92400e', marginBottom: '2px' }}>Relationship</div>
                              <div style={{ fontSize: '11px', fontWeight: 500, color: '#78350f' }}>
                                {selectedEmployee.emergency_contact_relationship}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Employment Tab */}
                {activeTab === 'employment' && (
                  <div>
                    <div className="row g-4">
                      {/* Employment Info */}
                      <div className="col-md-6">
                        <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                          Employment Information
                        </h6>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Position</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.position}</div>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Department</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.department_name}</div>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Employment Type</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.employment_type}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Status</div>
                            <div>{getStatusBadge(selectedEmployee.status)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="col-md-6">
                        <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                          Important Dates
                        </h6>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Join Date</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>
                              {new Date(selectedEmployee.join_date).toLocaleDateString('en-MY')}
                            </div>
                          </div>
                          {selectedEmployee.confirmation_date && (
                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Confirmation Date</div>
                              <div style={{ fontSize: '11px', fontWeight: 500 }}>
                                {new Date(selectedEmployee.confirmation_date).toLocaleDateString('en-MY')}
                              </div>
                            </div>
                          )}
                          {selectedEmployee.resign_date && (
                            <div>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Last Working Date</div>
                              <div style={{ fontSize: '11px', fontWeight: 500 }}>
                                {new Date(selectedEmployee.resign_date).toLocaleDateString('en-MY')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Salary Info */}
                      <div className="col-md-6">
                        <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                          Salary Information
                        </h6>
                        <div style={{ backgroundColor: '#dcfce7', padding: '12px', borderRadius: '2px', border: '1px solid #bbf7d0' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#166534', marginBottom: '2px' }}>Basic Salary</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>
                              RM {selectedEmployee.basic_salary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#166534', marginBottom: '2px' }}>Allowances</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>
                              RM {selectedEmployee.allowances.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bank Info */}
                      <div className="col-md-6">
                        <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                          Bank Information
                        </h6>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Bank Name</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.bank_name}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Account Number</div>
                            <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.bank_account_number}</div>
                          </div>
                        </div>
                      </div>

                      {/* Statutory Info */}
                      <div className="col-md-12">
                        <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                          Statutory Information
                        </h6>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div className="row">
                            <div className="col-md-4">
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>EPF Number</div>
                              <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.epf_number || '-'}</div>
                            </div>
                            <div className="col-md-4">
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>SOCSO Number</div>
                              <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.socso_number || '-'}</div>
                            </div>
                            <div className="col-md-4">
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Tax Number</div>
                              <div style={{ fontSize: '11px', fontWeight: 500 }}>{selectedEmployee.tax_number || '-'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedEmployee.notes && (
                        <div className="col-md-12">
                          <h6 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>
                            Notes
                          </h6>
                          <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '11px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                              {selectedEmployee.notes}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 style={{ fontSize: '12px', fontWeight: 600, margin: 0, color: '#1f2937' }}>
                        Employee Documents
                      </h6>
                      <PermissionGuard sessionHash={sessionHash} permission="employees_document_upload" fallback={null}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                            fileInput.onchange = async (e: any) => {
                              const file = e.target?.files?.[0];
                              if (!file) return;

                              const docType = prompt('Document Type (example: Resume, Certificate, Contract):');
                              if (!docType) return;

                              const docName = prompt('Document Name:', file.name);
                              if (!docName) return;

                              const formData = new FormData();
                              formData.append('document', file);
                              formData.append('document_type', docType);
                              formData.append('document_name', docName);

                              try {
                                const response = await fetch(
                                  `/api/admin/employees/${selectedEmployee.id}/documents?hash=${sessionHash}`,
                                  {
                                    method: 'POST',
                                    body: formData
                                  }
                                );

                                if (response.ok) {
                                  alert('Document uploaded successfully');
                                  const docResponse = await fetch(
                                    `/api/admin/employees/${selectedEmployee.id}?hash=${sessionHash}`
                                  );
                                  if (docResponse.ok) {
                                    const data = await docResponse.json();
                                    setEmployeeDocuments(data.documents || []);
                                  }
                                } else {
                                  const data = await response.json();
                                  alert(data.message || 'Failed to upload document');
                                }
                              } catch (err) {
                                console.error('Error uploading document:', err);
                                alert('Error uploading document');
                              }
                            };
                            fileInput.click();
                          }}
                          style={{ fontSize: '11px', padding: '6px 12px' }}
                        >
                          <i className="bi bi-upload me-1"></i>Upload
                        </button>
                      </PermissionGuard>
                    </div>

                    {employeeDocuments.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '48px 24px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '2px',
                        border: '1px dashed #d1d5db'
                      }}>
                        <i className="bi bi-file-earmark" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                          No documents. Upload your first document.
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {employeeDocuments.map(doc => (
                          <div
                            key={doc.id}
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
                            <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <i className="bi bi-file-earmark-pdf" style={{ fontSize: '20px', color: '#1e40af' }}></i>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#1f2937', marginBottom: '2px' }}>
                                  {doc.document_name}
                                </div>
                                <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                  {doc.document_type} • {(doc.file_size / 1024).toFixed(2)} KB • 
                                  Uploaded by {doc.uploaded_by_name} • 
                                  {new Date(doc.uploaded_at).toLocaleDateString('en-MY')}
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <a
                                href={doc.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                                style={{ fontSize: '10px', padding: '4px 8px' }}
                              >
                                <i className="bi bi-download"></i>
                              </a>
                              <PermissionGuard sessionHash={sessionHash} permission="employees_document_delete" fallback={null}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={async () => {
                                    if (!confirm('Delete this document?')) return;

                                    try {
                                      const response = await fetch(
                                        `/api/admin/employees/${selectedEmployee.id}/documents?hash=${sessionHash}&documentId=${doc.id}`,
                                        { method: 'DELETE' }
                                      );

                                      if (response.ok) {
                                        alert('Document deleted successfully');
                                        setEmployeeDocuments(employeeDocuments.filter(d => d.id !== doc.id));
                                      } else {
                                        const data = await response.json();
                                        alert(data.message || 'Failed to delete document');
                                      }
                                    } catch (err) {
                                      console.error('Error deleting document:', err);
                                      alert('Error deleting document');
                                    }
                                  }}
                                  style={{ fontSize: '10px', padding: '4px 8px' }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </PermissionGuard>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Login Account Tab */}
                {activeTab === 'login' && (
                  <div>
                    <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1f2937' }}>
                      Login Account Management
                    </h6>
                    
                    {!employeeLoginAccount ? (
                      <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#f9fafb', borderRadius: '2px', border: '1px dashed #d1d5db' }}>
                        <i className="bi bi-key" style={{ fontSize: 32, color: '#9ca3af' }}></i>
                        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12, marginBottom: 16 }}>
                          No login account created for this employee
                        </p>
                        <button
                          onClick={() => {
                            setLoginUsername(selectedEmployee?.email?.split('@')[0] || '');
                            setLoginPassword('');
                            setShowCreateLoginModal(true);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 12 }}
                        >
                          <i className="bi bi-plus-circle me-1"></i>
                          Create Login Account
                        </button>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 4 }}>Username</label>
                            <p style={{ fontSize: 12, color: '#1f2937', marginBottom: 0 }}>{employeeLoginAccount.username}</p>
                          </div>
                          <div className="col-md-6">
                            <label style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 4 }}>Status</label>
                            <span className={`badge ${employeeLoginAccount.status === 'active' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: 11 }}>
                              {employeeLoginAccount.status}
                            </span>
                          </div>
                          <div className="col-12" style={{ marginTop: 20 }}>
                            <div className="d-flex gap-2">
                              <button
                                onClick={() => {
                                  setNewPassword('');
                                  setShowResetPasswordModal(true);
                                }}
                                className="btn btn-outline-warning btn-sm"
                                style={{ fontSize: 11 }}
                              >
                                <i className="bi bi-arrow-repeat me-1"></i>
                                Reset Password
                              </button>
                              {employeeLoginAccount.status === 'active' ? (
                                <button
                                  onClick={() => handleSuspendLogin('suspend')}
                                  className="btn btn-outline-danger btn-sm"
                                  style={{ fontSize: 11 }}
                                >
                                  <i className="bi bi-lock me-1"></i>
                                  Suspend Account
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSuspendLogin('activate')}
                                  className="btn btn-outline-success btn-sm"
                                  style={{ fontSize: 11 }}
                                >
                                  <i className="bi bi-unlock me-1"></i>
                                  Activate Account
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Login Modal */}
      {showCreateLoginModal && selectedEmployee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: 14 }}>Create Login Account</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateLoginModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500 }}>Employee</label>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>{selectedEmployee.full_name} ({selectedEmployee.employee_id})</p>
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500 }}>Username</label>
                  <input type="text" className="form-control" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} style={{ fontSize: 12 }} />
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500 }}>Password</label>
                  <input type="password" className="form-control" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ fontSize: 12 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateLoginModal(false)} style={{ fontSize: 12 }}>Cancel</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleCreateLogin} style={{ fontSize: 12 }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedEmployee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: 14 }}>Reset Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowResetPasswordModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500 }}>Employee</label>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>{selectedEmployee.full_name} ({employeeLoginAccount?.username})</p>
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 500 }}>New Password</label>
                  <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ fontSize: 12 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowResetPasswordModal(false)} style={{ fontSize: 12 }}>Cancel</button>
                <button type="button" className="btn btn-warning btn-sm" onClick={handleResetPassword} style={{ fontSize: 12 }}>Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

