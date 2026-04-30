'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSocket } from '@/lib/socket';
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
  allow_half_days: boolean;
  color: string;
  status: string;
}

interface LeaveApplication {
  id: number;
  application_number: string;
  employee_id: number;
  employee_name: string;
  employee_number: string;
  department_name: string;
  leave_type_id: number;
  leave_type_name: string;
  leave_type_code: string;
  leave_type_color: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  remarks: string;
  document_path: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applied_date: string;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  reviewed_date: string | null;
  review_remarks: string | null;
}

interface LeaveBalance {
  id: number;
  employee_id: number;
  employee_name: string;
  leave_type_id: number;
  leave_type_name: string;
  leave_type_code: string;
  leave_type_color: string;
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  carried_forward: number;
}

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  department_id: number;
  department_name: string;
  position: string;
  status: string;
  gender: 'male' | 'female';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
}

interface LeaveManagementProps {
  sessionHash: string;
}

export default function LeaveManagement({ sessionHash }: LeaveManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState<LeaveBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString()); // For Balance tab only
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [balanceSearchQuery, setBalanceSearchQuery] = useState('');
  
  // View states
  const [activeTab, setActiveTab] = useState<'applications' | 'balances'>('applications');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    day_type: 'full' as 'full' | 'half',
    total_days: 0,
    reason: '',
    remarks: ''
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  // Approval data
  const [approvalData, setApprovalData] = useState({
    action: 'approve' as 'approve' | 'reject',
    review_remarks: ''
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch leave applications
        const appsResponse = await fetch(`/api/admin/leave?hash=${sessionHash}`);
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApplications(appsData);
        }
        
        // Fetch leave types
        const typesResponse = await fetch(`/api/admin/leave/types?hash=${sessionHash}&status=active`);
        if (typesResponse.ok) {
          const typesData = await typesResponse.json();
          setLeaveTypes(typesData.leaveTypes || typesData.types || []);
        }
        
        // Fetch employees (active only)
        const employeesResponse = await fetch(`/api/admin/employees?hash=${sessionHash}&status=active`);
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setEmployees(employeesData.employees || []);
        }
        
        // Fetch leave balances
        const balancesResponse = await fetch(`/api/admin/leave/balance?hash=${sessionHash}&year=${filterYear}`);
        if (balancesResponse.ok) {
          const balancesData = await balancesResponse.json();
          setBalances(balancesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionHash, filterYear]);

  // Calculate total days between dates
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  // Fetch leave balance for selected employee and leave type
  const fetchLeaveBalance = async (employeeId: string, leaveTypeId: string) => {
    if (!employeeId || !leaveTypeId) {
      setCurrentBalance(null);
      return;
    }

    try {
      setBalanceLoading(true);
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `/api/admin/leave/balance?hash=${sessionHash}&employee_id=${employeeId}&year=${currentYear}`
      );
      
      if (response.ok) {
        const balancesData = await response.json();
        const balance = balancesData.find((b: LeaveBalance) => b.leave_type_id === parseInt(leaveTypeId));
        setCurrentBalance(balance || null);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Get filtered leave types based on selected employee
  const getFilteredLeaveTypes = () => {
    if (!formData.employee_id) return leaveTypes;
    
    const selectedEmployee = employees.find(emp => emp.id.toString() === formData.employee_id);
    if (!selectedEmployee) return leaveTypes;
    
    return leaveTypes.filter(type => {
      const typeName = type.name.toLowerCase();
      const typeCode = type.code.toUpperCase();
      const empGender = selectedEmployee.gender.toLowerCase();
      
      // Check if it's Paternity Leave (code: PL)
      if (typeName.includes('paternity') || typeCode === 'PL') {
        // Only show for MALE + MARRIED
        return empGender === 'male' && selectedEmployee.marital_status === 'married';
      }
      
      // Check if it's Maternity Leave (code: ML-MC)
      if (typeName.includes('maternity') || typeCode === 'ML-MC') {
        // Only show for FEMALE + MARRIED
        return empGender === 'female' && selectedEmployee.marital_status === 'married';
      }
      
      // Show all other leave types
      return true;
    });
  };

  // Handle employee selection
  const handleEmployeeChange = (employeeId: string) => {
    setFormData({ ...formData, employee_id: employeeId, leave_type_id: '' }); // Reset leave type when employee changes
    if (formData.leave_type_id) {
      fetchLeaveBalance(employeeId, formData.leave_type_id);
    }
  };

  // Handle leave type selection
  const handleLeaveTypeChange = (leaveTypeId: string) => {
    setFormData({ ...formData, leave_type_id: leaveTypeId });
    if (formData.employee_id) {
      fetchLeaveBalance(formData.employee_id, leaveTypeId);
    }
  };

  // Handle date change
  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    if (newFormData.start_date && newFormData.end_date) {
      const baseDays = calculateDays(newFormData.start_date, newFormData.end_date);
      
      // If single day and allow_half_days and day_type is half, set to 0.5
      const isSingleDay = newFormData.start_date === newFormData.end_date;
      const selectedLeaveType = leaveTypes.find(t => t.id === parseInt(newFormData.leave_type_id));
      
      if (isSingleDay && selectedLeaveType?.allow_half_days && newFormData.day_type === 'half') {
        newFormData.total_days = 0.5;
      } else {
        newFormData.total_days = baseDays;
        // Reset to full if not single day or leave type doesn't allow half days
        if (!isSingleDay || !selectedLeaveType?.allow_half_days) {
          newFormData.day_type = 'full';
        }
      }
    }
    
    setFormData(newFormData);
  };

  // Handle create leave application
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate leave balance
    if (currentBalance && formData.total_days > currentBalance.remaining_days) {
      alert(`Insufficient leave balance! You have only ${currentBalance.remaining_days} days remaining.`);
      return;
    }

    // Check if selected leave type requires document
    const selectedType = leaveTypes.find(t => t.id === parseInt(formData.leave_type_id));
    if (selectedType && selectedType.requires_document && !documentFile) {
      alert('Please upload supporting document for this leave type');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('employee_id', formData.employee_id);
      formDataToSend.append('leave_type_id', formData.leave_type_id);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('total_days', formData.total_days.toString());
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('remarks', formData.remarks);
      if (documentFile) {
        formDataToSend.append('document', documentFile);
      }

      const response = await fetch(`/api/admin/leave?hash=${sessionHash}`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        alert('Leave application submitted successfully');
        setShowCreateModal(false);
        setFormData({
          employee_id: '',
          leave_type_id: '',
          start_date: '',
          end_date: '',
          day_type: 'full',
          total_days: 0,
          reason: '',
          remarks: ''
        });
        setDocumentFile(null);
        // Refresh data
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit leave application');
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to submit leave application');
    }
  };

  // Handle approve/reject leave
  const handleApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedApplication) return;
    
    try {
      const response = await fetch(`/api/admin/leave/approve?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedApplication.id,
          ...approvalData
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Leave application ${approvalData.action}d successfully`);
        
        // Emit notification to employee
        if (selectedApplication) {
          try {
            const socket = getSocket();
            if (socket && socket.connected) {
              const applicationNumber = selectedApplication.application_number || result?.application_number || 'N/A';
              console.log('📤 Emitting task_reviewed for leave:', applicationNumber, 'to employee:', selectedApplication.employee_id);
              socket.emit('task_reviewed', {
                module: 'leave',
                action: approvalData.action,
                result: approvalData.action === 'approve' ? 'approved' : 'rejected',
                employeeId: selectedApplication.employee_id,
                entityId: applicationNumber,
                message: `Your leave application ${applicationNumber} has been ${approvalData.action}d`,
                view: 'employee-leave'
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
        setSelectedApplication(null);
        setApprovalData({ action: 'approve', review_remarks: '' });
        // Refresh data
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || `Failed to ${approvalData.action} leave application`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert(`Failed to ${approvalData.action} leave application`);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: '#f59e0b', text: 'Pending' },
      approved: { bg: '#10b981', text: 'Approved' },
      rejected: { bg: '#ef4444', text: 'Rejected' },
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

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.application_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / pageSize);
  const paginatedApplications = filteredApplications.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Table columns configuration
  const tableColumns: AdminTableColumn<LeaveApplication>[] = useMemo(() => [
    {
      key: 'application_number',
      label: 'Application No.',
      render: (value) => (
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'employee_name',
      label: 'Employee',
      render: (_, row: LeaveApplication) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
            {row.employee_name}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            {row.employee_number}
          </div>
        </div>
      )
    },
    {
      key: 'leave_type_name',
      label: 'Leave Type',
      render: (_, row: LeaveApplication) => (
        <span style={{
          backgroundColor: `${row.leave_type_color}15`,
          color: row.leave_type_color,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 500
        }}>
          {row.leave_type_name}
        </span>
      )
    },
    {
      key: 'start_date',
      label: 'Period',
      render: (_, row: LeaveApplication) => (
        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          {new Date(row.start_date).toLocaleDateString('en-MY')} - {new Date(row.end_date).toLocaleDateString('en-MY')}
        </div>
      )
    },
    {
      key: 'total_days',
      label: 'Days',
      align: 'center',
      render: (value) => (
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (value) => getStatusBadge(String(value))
    },
    {
      key: 'applied_date',
      label: 'Applied Date',
      render: (value) => (
        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          {new Date(String(value)).toLocaleDateString('en-MY')}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      width: '140px',
      render: (_, row: LeaveApplication) => {
        const actions = [
          actionPresets.view(() => {
            setSelectedApplication(row);
            setShowViewModal(true);
          })
        ];

        // Add approve action for pending applications
        if (row.status === 'pending' && canPerformAction('leave', 'approve')) {
          actions.push({
            type: 'custom' as const,
            icon: 'check_circle',
            color: '#16a34a',
            title: 'Approve/Reject',
            onClick: () => {
              setSelectedApplication(row);
              setApprovalData({ action: 'approve', review_remarks: '' });
              setShowApproveModal(true);
            }
          });
        }

        return <AdminTableActions actions={actions} />;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [applications, canPerformAction]);

  // Filter balances
  const filteredBalances = balances.filter((balance) => {
    const matchesSearch = balance.employee_name.toLowerCase().includes(balanceSearchQuery.toLowerCase()) ||
                         balance.leave_type_name.toLowerCase().includes(balanceSearchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination for balances
  const totalBalancePages = Math.ceil(filteredBalances.length / pageSize);
  const paginatedBalances = filteredBalances.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Balance table columns configuration
  const balanceColumns: AdminTableColumn<LeaveBalance>[] = useMemo(() => [
    {
      key: 'employee_name',
      label: 'Employee',
      render: (value) => (
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'leave_type_name',
      label: 'Leave Type',
      render: (_, row: LeaveBalance) => (
        <span style={{
          backgroundColor: `${row.leave_type_color}15`,
          color: row.leave_type_color,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 500
        }}>
          {row.leave_type_name}
        </span>
      )
    },
    {
      key: 'total_days',
      label: 'Total Days',
      align: 'center',
      render: (value) => (
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'used_days',
      label: 'Used Days',
      align: 'center',
      render: (value) => (
        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'pending_days',
      label: 'Pending Days',
      align: 'center',
      render: (value) => (
        <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 500 }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'remaining_days',
      label: 'Remaining Days',
      align: 'center',
      render: (value) => (
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>
          {String(value)}
        </div>
      )
    }
  ], []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
        <p className="text-muted mb-0" style={{ fontSize: 12 }}>Loading leave management...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
            Leave Management
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage employee leave applications and balances
          </p>
        </div>
        
        {activeTab === 'applications' && (
          <PermissionButton
            sessionHash={sessionHash}
            module="leave"
            action="create"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Apply Leave
          </PermissionButton>
        )}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
            style={{
              fontSize: '12px',
              fontWeight: activeTab === 'applications' ? 600 : 400,
              color: activeTab === 'applications' ? '#2563eb' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'applications' ? '2px solid #2563eb' : 'none',
              background: 'none'
            }}
          >
            <i className="bi bi-file-text me-2"></i>
            Leave Applications
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'balances' ? 'active' : ''}`}
            onClick={() => setActiveTab('balances')}
            style={{
              fontSize: '12px',
              fontWeight: activeTab === 'balances' ? 600 : 400,
              color: activeTab === 'balances' ? '#2563eb' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'balances' ? '2px solid #2563eb' : 'none',
              background: 'none'
            }}
          >
            <i className="bi bi-wallet2 me-2"></i>
            Leave Balances
          </button>
        </li>
      </ul>

      {/* Leave Applications Tab */}
      {activeTab === 'applications' && (
        <div>
          {/* Filters */}
          <form className="row g-3 mb-4">
            <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by employee name or application number..."
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
                  fontWeight: 500
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {/* Applications Table */}
          <div style={{ marginBottom: '24px' }}>
            <AdminTable<LeaveApplication>
              columns={tableColumns}
              data={paginatedApplications}
              emptyMessage="No leave applications found."
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
        </div>
      )}

      {/* Leave Balances Tab */}
      {activeTab === 'balances' && (
        <div>
          {/* Filters */}
          <form className="row g-3 mb-4">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by employee or leave type..."
                value={balanceSearchQuery}
                onChange={(e) => setBalanceSearchQuery(e.target.value)}
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
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                style={{ 
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</option>
                <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
                <option value={(new Date().getFullYear() + 1).toString()}>{new Date().getFullYear() + 1}</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-danger w-100"
                onClick={() => {
                  setBalanceSearchQuery('');
                  setFilterYear(new Date().getFullYear().toString());
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

          {/* Balances Table */}
          <div style={{ marginBottom: '24px' }}>
            <AdminTable<LeaveBalance>
              columns={balanceColumns}
              data={paginatedBalances}
              emptyMessage="No leave balances found."
            />
          </div>

          {/* Pagination */}
          {totalBalancePages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination
                currentPage={page}
                totalPages={totalBalancePages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Create Leave Application Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Apply for Leave
                </h5>
                <button onClick={() => setShowCreateModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="row g-3">
                    {/* Employee */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Employee <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.employee_id}
                        onChange={(e) => handleEmployeeChange(e.target.value)}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="">-- Select Employee --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.employee_id} - {emp.full_name} ({emp.department_name})
                          </option>
                        ))}
                      </select>
                      <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Select employee to view leave balance
                      </small>
                    </div>

                    {/* Leave Type */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Leave Type <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.leave_type_id}
                        onChange={(e) => handleLeaveTypeChange(e.target.value)}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="">Select Leave Type</option>
                        {getFilteredLeaveTypes().map((type) => (
                          <option key={type.id} value={type.id}>{type.name} ({type.days_per_year} days/year)</option>
                        ))}
                      </select>
                    </div>

                    {/* Leave Balance Display */}
                    {balanceLoading ? (
                      <div className="col-md-12">
                        <div className="alert alert-info mb-0" style={{ fontSize: '11px', padding: '10px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                          <i className="bi bi-hourglass-split me-2"></i>Loading balance...
                        </div>
                      </div>
                    ) : currentBalance ? (
                      <div className="col-md-12">
                        <div className={`alert mb-0 ${currentBalance.remaining_days > 0 ? 'alert-success' : 'alert-danger'}`} style={{ fontSize: '11px', padding: '10px 12px', borderRadius: '2px' }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong style={{ fontSize: '12px' }}>Leave Balance ({new Date().getFullYear()}):</strong>
                              <div style={{ marginTop: '4px' }}>
                                <span className="badge bg-primary me-2" style={{ fontSize: '10px' }}>Total: {currentBalance.total_days}</span>
                                <span className="badge bg-warning me-2" style={{ fontSize: '10px' }}>Used: {currentBalance.used_days}</span>
                                <span className="badge bg-info me-2" style={{ fontSize: '10px' }}>Pending: {currentBalance.pending_days}</span>
                                <span className={`badge ${currentBalance.remaining_days > 0 ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '10px' }}>
                                  Remaining: {currentBalance.remaining_days}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : formData.employee_id && formData.leave_type_id ? (
                      <div className="col-md-12">
                        <div className="alert alert-warning mb-0" style={{ fontSize: '11px', padding: '10px 12px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                          <i className="bi bi-exclamation-triangle me-2"></i>No leave balance found. Please contact HR to initialize leave balance for this employee.
                        </div>
                      </div>
                    ) : null}

                    {/* Start Date */}
                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Start Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.start_date}
                        onChange={(e) => handleDateChange('start_date', e.target.value)}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* End Date */}
                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        End Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.end_date}
                        onChange={(e) => handleDateChange('end_date', e.target.value)}
                        min={formData.start_date}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
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
                            setFormData({ 
                              ...formData, 
                              day_type: newDayType,
                              total_days: newDayType === 'half' ? 0.5 : 1
                            });
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
                        type="number"
                        className="form-control"
                        value={formData.total_days}
                        readOnly
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px', backgroundColor: '#f9fafb' }}
                      />
                    </div>

                    {/* Reason */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Reason <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        className="form-control"
                        required
                        rows={3}
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Enter reason for leave"
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

                    {/* Supporting Document - Conditional */}
                    {formData.leave_type_id && leaveTypes.find(t => t.id === parseInt(formData.leave_type_id))?.requires_document && (
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
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Leave Application Modal */}
      {showViewModal && selectedApplication && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-file-text me-2"></i>
                  Leave Application Details
                </h5>
                <button onClick={() => setShowViewModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Application Number</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedApplication.application_number}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Status</label>
                    <div>{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Employee</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedApplication.employee_name}</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{selectedApplication.employee_number}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Department</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedApplication.department_name}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Leave Type</label>
                    <div>
                      <span style={{
                        backgroundColor: `${selectedApplication.leave_type_color}15`,
                        color: selectedApplication.leave_type_color,
                        padding: '4px 8px',
                        borderRadius: '2px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}>
                        {selectedApplication.leave_type_name}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Total Days</label>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{selectedApplication.total_days} days</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Start Date</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{new Date(selectedApplication.start_date).toLocaleDateString('en-MY')}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>End Date</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{new Date(selectedApplication.end_date).toLocaleDateString('en-MY')}</div>
                  </div>
                  <div className="col-md-12">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Reason</label>
                    <div style={{ fontSize: '12px', fontWeight: 400 }}>{selectedApplication.reason}</div>
                  </div>
                  {selectedApplication.remarks && (
                    <div className="col-md-12">
                      <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Remarks</label>
                      <div style={{ fontSize: '12px', fontWeight: 400 }}>{selectedApplication.remarks}</div>
                    </div>
                  )}
                  {selectedApplication.reviewed_by_name && (
                    <>
                      <div className="col-md-6">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Reviewed By</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedApplication.reviewed_by_name}</div>
                      </div>
                      <div className="col-md-6">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Reviewed Date</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>
                          {selectedApplication.reviewed_date && new Date(selectedApplication.reviewed_date).toLocaleDateString('en-MY')}
                        </div>
                      </div>
                      {selectedApplication.review_remarks && (
                        <div className="col-md-12">
                          <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Review Remarks</label>
                          <div style={{ fontSize: '12px', fontWeight: 400 }}>{selectedApplication.review_remarks}</div>
                        </div>
                      )}
                    </>
                  )}
                  {selectedApplication.document_path && (
                    <div className="col-md-12">
                      <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Supporting Document</label>
                      <div>
                        <a
                          href={selectedApplication.document_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px' }}
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          View/Download Document
                        </a>
                      </div>
                    </div>
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
      {showApproveModal && selectedApplication && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-check-circle me-2"></i>
                  Review Leave Application
                </h5>
                <button onClick={() => setShowApproveModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleApproval}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Application Number
                    </label>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedApplication.application_number}</div>
                  </div>
                  
                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Employee
                    </label>
                    <div style={{ fontSize: '12px' }}>{selectedApplication.employee_name}</div>
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

