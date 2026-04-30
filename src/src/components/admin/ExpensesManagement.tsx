'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSocket } from '@/lib/socket';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import Pagination from '@/components/Pagination';

interface ExpenseCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  budget_limit: number | null;
  color: string;
  status: string;
}

interface ExpenseItem {
  id?: number;
  item_date: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  remarks: string;
}

interface Expense {
  id: number;
  expense_number: string;
  category_id: number;
  category_name: string;
  category_code: string;
  category_color: string;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  department_name: string;
  expense_date: string;
  vendor_name: string;
  invoice_number: string;
  description: string;
  total_amount: number;
  tax_amount: number;
  payment_method: string;
  payment_reference: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  remarks: string;
  receipt_url: string | null;
  applied_date: string;
  reviewed_by_name: string | null;
  reviewed_date: string | null;
  review_remarks: string | null;
  items_count: number;
  items?: ExpenseItem[];
}

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  department_name: string;
  position: string;
  status: string;
}

interface ExpensesManagementProps {
  sessionHash: string;
}

export default function ExpensesManagement({ sessionHash }: ExpensesManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    category_id: '',
    expense_date: '',
    vendor_name: '',
    invoice_number: '',
    description: '',
    tax_amount: '0.00',
    payment_method: 'bank_transfer',
    payment_reference: '',
    remarks: '',
    items: [] as ExpenseItem[]
  });
  
  const [approvalData, setApprovalData] = useState({
    action: 'approve' as 'approve' | 'reject',
    review_remarks: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch expenses
        const expensesResponse = await fetch(`/api/admin/expenses?hash=${sessionHash}`);
        if (expensesResponse.ok) {
          const expensesData = await expensesResponse.json();
          setExpenses(expensesData);
        }
        
        // Fetch employees
        const employeesResponse = await fetch(`/api/admin/employees?hash=${sessionHash}&status=active`);
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setEmployees(employeesData.employees || []);
        }
        
        // Fetch categories
        const categoriesResponse = await fetch(`/api/admin/expenses/categories?hash=${sessionHash}&status=active`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionHash, filterYear, filterMonth]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { 
        item_date: formData.expense_date, 
        description: '', 
        quantity: 1, 
        unit_price: 0, 
        total_price: 0,
        remarks: '' 
      }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof ExpenseItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate total_price
    if (field === 'quantity' || field === 'unit_price') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
      const price = field === 'unit_price' ? parseFloat(value) || 0 : newItems[index].unit_price;
      newItems[index].total_price = qty * price;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const tax = parseFloat(formData.tax_amount) || 0;
    return itemsTotal + tax;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert('Please add at least one expense item');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/expenses?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_amount: calculateTotal()
        })
      });

      if (response.ok) {
        alert('Expense submitted successfully');
        setShowCreateModal(false);
        setFormData({
          employee_id: '',
          category_id: '',
          expense_date: '',
          vendor_name: '',
          invoice_number: '',
          description: '',
          tax_amount: '0.00',
          payment_method: 'bank_transfer',
          payment_reference: '',
          remarks: '',
          items: []
        });
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit expense');
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to submit expense');
    }
  };

  const handleApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExpense) return;
    
    try {
      const response = await fetch(`/api/admin/expenses/approve?hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedExpense.id, ...approvalData })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Expense ${approvalData.action}d successfully`);
        
        // Emit notification to employee
        if (selectedExpense) {
          try {
            const socket = getSocket();
            if (socket && socket.connected) {
              const expenseNumber = selectedExpense.expense_number || result?.expense_number || 'N/A';
              console.log('📤 Emitting task_reviewed for expense:', expenseNumber, 'to employee:', selectedExpense.employee_id);
              socket.emit('task_reviewed', {
                module: 'expenses',
                action: approvalData.action,
                result: approvalData.action === 'approve' ? 'approved' : 'rejected',
                employeeId: selectedExpense.employee_id,
                entityId: expenseNumber,
                message: `Your expense ${expenseNumber} has been ${approvalData.action}d`,
                view: 'employee-expenses'
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
        setSelectedExpense(null);
        setApprovalData({ action: 'approve', review_remarks: '' });
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || `Failed to ${approvalData.action} expense`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert(`Failed to ${approvalData.action} expense`);
    }
  };

  const handleViewExpense = async (expense: Expense) => {
    try {
      const response = await fetch(`/api/admin/expenses/${expense.id}?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedExpense(data.expense);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching expense details:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: '#9ca3af', text: 'Draft' },
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

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      credit_card: 'Credit Card',
      cheque: 'Cheque',
      online: 'Online Payment'
    };
    return methods[method] || method;
  };

  const tableColumns: AdminTableColumn<Expense>[] = useMemo(() => [
    {
      key: 'expense_number',
      label: 'Expense No.',
      width: '120px',
      render: (_, row) => <span style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>{String(row.expense_number)}</span>
    },
    {
      key: 'employee_name',
      label: 'Employee',
      width: '180px',
      render: (_, row) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>{String(row.employee_name)}</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>{String(row.department_name || '')}</div>
        </div>
      )
    },
    {
      key: 'category_name',
      label: 'Category',
      width: '140px',
      render: (_, row) => <span style={{ fontSize: '12px', color: '#374151' }}>{String(row.category_name)}</span>
    },
    {
      key: 'expense_date',
      label: 'Date',
      width: '100px',
      render: (_, row) => <span style={{ fontSize: '12px', color: '#374151' }}>{String(new Date(row.expense_date).toLocaleDateString())}</span>
    },
    {
      key: 'vendor_name',
      label: 'Vendor',
      width: '140px',
      render: (_, row) => <span style={{ fontSize: '12px', color: '#374151' }}>{String(row.vendor_name || '-')}</span>
    },
    {
      key: 'total_amount',
      label: 'Amount (RM)',
      width: '110px',
      align: 'right',
      render: (_, row) => <span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>RM {(parseFloat(String(row.total_amount)) || 0).toFixed(2)}</span>
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
      render: (_, row) => {
        const actions = [actionPresets.view(() => handleViewExpense(row))];
        if (row.status === 'pending' && canPerformAction('expenses', 'approve')) {
          actions.push({
            type: 'custom',
            icon: 'check_circle',
            color: '#10b981',
            title: 'Approve/Reject',
            onClick: () => { setSelectedExpense(row); setApprovalData({ action: 'approve', review_remarks: '' }); setShowApproveModal(true); }
          });
        }
        return <AdminTableActions actions={actions} />;
      }
    }
  ], [canPerformAction]);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.expense_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || expense.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredExpenses.length / pageSize);
  const paginatedExpenses = filteredExpenses.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
        <p className="text-muted mb-0" style={{ fontSize: 12 }}>Loading expenses management...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
            Expenses Management
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Track and manage company operational expenses
          </p>
        </div>
        
        <PermissionButton
          sessionHash={sessionHash}
          module="expenses"
          action="create"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Record Expense
        </PermissionButton>
      </div>

      {/* Filters */}
      <form className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by employee, vendor or expense number..."
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
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
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

      {/* Expenses Table */}
      <div style={{ marginBottom: '24px' }}>
        <AdminTable<Expense>
          columns={tableColumns}
          data={paginatedExpenses}
          emptyMessage="No expense records found. Record your first expense to get started."
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

      {/* Create Expense Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl" style={{ maxHeight: '90vh', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Record New Expense
                </h5>
                <button onClick={() => setShowCreateModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                  <div className="row g-3">
                    <div className="col-md-4">
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

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Category <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Expense Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.expense_date}
                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Vendor Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.vendor_name}
                        onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                        placeholder="Enter vendor name"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Invoice Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        placeholder="Enter invoice number"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
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
                        placeholder="Enter expense description"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Payment Method <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online Payment</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Payment Reference
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.payment_reference}
                        onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                        placeholder="Transaction/Ref number"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Tax Amount (RM)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.tax_amount}
                        onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                        placeholder="0.00"
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
                          Expense Items <span style={{ color: '#ef4444' }}>*</span>
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
                                    Qty <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    required
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    placeholder="1"
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Unit Price (RM) <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    required
                                    value={item.unit_price}
                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Total (RM)
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={item.total_price.toFixed(2)}
                                    readOnly
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px', backgroundColor: '#f9fafb', fontWeight: 600 }}
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
                            <div style={{ fontSize: '10px', color: '#166534', marginTop: '4px' }}>
                              Items: RM {formData.items.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)} + Tax: RM {formData.tax_amount}
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
                    Submit Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      {showViewModal && selectedExpense && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-receipt me-2"></i>
                  Expense Details
                </h5>
                <button onClick={() => setShowViewModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Expense Number</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedExpense.expense_number}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Status</label>
                    <div>{getStatusBadge(selectedExpense.status)}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Employee</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedExpense.employee_name}</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{selectedExpense.employee_code} • {selectedExpense.department_name}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Category</label>
                    <div>
                      <span style={{
                        backgroundColor: `${selectedExpense.category_color}15`,
                        color: selectedExpense.category_color,
                        padding: '4px 8px',
                        borderRadius: '2px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}>
                        {selectedExpense.category_name}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Expense Date</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{new Date(selectedExpense.expense_date).toLocaleDateString('en-MY')}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Vendor</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedExpense.vendor_name || '-'}</div>
                  </div>
                  <div className="col-md-12">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Description</label>
                    <div style={{ fontSize: '12px', fontWeight: 400 }}>{selectedExpense.description}</div>
                  </div>
                  
                  {/* Expense Items */}
                  <div className="col-md-12 mt-4">
                    <h6 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>Expense Items</h6>
                    <div className="table-responsive">
                      <table className="table table-sm" style={{ fontSize: '11px' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                          <tr>
                            <th style={{ fontSize: '10px', padding: '8px' }}>Date</th>
                            <th style={{ fontSize: '10px', padding: '8px' }}>Description</th>
                            <th style={{ fontSize: '10px', padding: '8px', textAlign: 'right' }}>Qty</th>
                            <th style={{ fontSize: '10px', padding: '8px', textAlign: 'right' }}>Unit Price</th>
                            <th style={{ fontSize: '10px', padding: '8px', textAlign: 'right' }}>Total (RM)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExpense.items && selectedExpense.items.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ fontSize: '10px', padding: '8px' }}>{new Date(item.item_date).toLocaleDateString('en-MY')}</td>
                              <td style={{ fontSize: '10px', padding: '8px' }}>{item.description}</td>
                              <td style={{ fontSize: '10px', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                              <td style={{ fontSize: '10px', padding: '8px', textAlign: 'right' }}>
                                {item.unit_price.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ fontSize: '10px', padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                                {item.total_price.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            <td colSpan={4} style={{ fontSize: '10px', padding: '8px', textAlign: 'right', fontWeight: 600 }}>Subtotal</td>
                            <td style={{ fontSize: '10px', padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                              RM {(selectedExpense.total_amount - selectedExpense.tax_amount).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            <td colSpan={4} style={{ fontSize: '10px', padding: '8px', textAlign: 'right', fontWeight: 600 }}>Tax</td>
                            <td style={{ fontSize: '10px', padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                              RM {selectedExpense.tax_amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#dcfce7', fontWeight: 700 }}>
                            <td colSpan={4} style={{ fontSize: '11px', padding: '8px', textAlign: 'right' }}>TOTAL</td>
                            <td style={{ fontSize: '11px', padding: '8px', textAlign: 'right', color: '#10b981' }}>
                              RM {selectedExpense.total_amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="col-md-6 mt-3">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Payment Method</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{getPaymentMethodLabel(selectedExpense.payment_method)}</div>
                  </div>
                  <div className="col-md-6 mt-3">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Payment Reference</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedExpense.payment_reference || '-'}</div>
                  </div>

                  <div className="col-md-12 mt-3">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Receipt</label>
                    {selectedExpense.receipt_url ? (
                      <div>
                        <a
                          href={selectedExpense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '2px' }}
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i>
                          View Receipt
                        </a>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px' }}>N/A</div>
                    )}
                  </div>

                  {selectedExpense.reviewed_by_name && (
                    <>
                      <div className="col-md-6 mt-3">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Reviewed By</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedExpense.reviewed_by_name}</div>
                      </div>
                      <div className="col-md-6 mt-3">
                        <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Reviewed Date</label>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>
                          {selectedExpense.reviewed_date && new Date(selectedExpense.reviewed_date).toLocaleDateString('en-MY')}
                        </div>
                      </div>
                      {selectedExpense.review_remarks && (
                        <div className="col-md-12">
                          <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Review Remarks</label>
                          <div style={{ fontSize: '12px', fontWeight: 400 }}>{selectedExpense.review_remarks}</div>
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
      {showApproveModal && selectedExpense && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-check-circle me-2"></i>
                  Review Expense
                </h5>
                <button onClick={() => setShowApproveModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleApproval}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Expense Number
                    </label>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedExpense.expense_number}</div>
                  </div>
                  
                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Employee
                    </label>
                    <div style={{ fontSize: '12px' }}>{selectedExpense.employee_name}</div>
                  </div>

                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Total Amount
                    </label>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>
                      RM {selectedExpense.total_amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Receipt
                    </label>
                    {selectedExpense.receipt_url ? (
                      <div>
                        <a
                          href={selectedExpense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '2px' }}
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i>
                          View Receipt
                        </a>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px' }}>N/A</div>
                    )}
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

