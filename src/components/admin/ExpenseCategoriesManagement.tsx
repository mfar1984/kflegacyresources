'use client';

import { useState, useEffect, useMemo } from 'react';
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
  requires_approval: boolean;
  approval_threshold: number | null;
  color: string;
  status: string;
}

export default function ExpenseCategoriesManagement({ sessionHash }: { sessionHash: string }) {
  const { canPerformAction } = usePermissions(sessionHash);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    requires_approval: false,
    approval_threshold: '',
    color: '#6366f1',
    status: 'active'
  });

  useEffect(() => {
    fetchCategories();
  }, [sessionHash]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/expenses/categories?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || data.expenseCategories || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = showEditModal && selectedCategory 
      ? `/api/admin/expenses/categories/${selectedCategory.id}?hash=${sessionHash}`
      : `/api/admin/expenses/categories?hash=${sessionHash}`;
    
    try {
      const response = await fetch(url, {
        method: showEditModal ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Expense category ${showEditModal ? 'updated' : 'created'} successfully`);
        setShowCreateModal(false);
        setShowEditModal(false);
        resetForm();
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Operation failed');
      }
    } catch (error) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense category?')) return;
    try {
      const response = await fetch(`/api/admin/expenses/categories/${id}?hash=${sessionHash}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      alert('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      requires_approval: false,
      approval_threshold: '',
      color: '#6366f1',
      status: 'active'
    });
    setSelectedCategory(null);
  };

  const openEditModal = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description,
      requires_approval: category.requires_approval,
      approval_threshold: category.approval_threshold ? category.approval_threshold.toString() : '',
      color: category.color,
      status: category.status
    });
    setShowEditModal(true);
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cat.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || cat.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadge = (status: string) => status === 'active' ? 
    <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>Active</span> : 
    <span style={{ backgroundColor: '#6b7280', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>Inactive</span>;

  const tableColumns: AdminTableColumn<ExpenseCategory>[] = useMemo(() => [
    { key: 'code', label: 'Code', render: (_, row) => <span style={{ backgroundColor: `${row.color}15`, color: row.color, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{row.code}</span> },
    { key: 'name', label: 'Category Name', render: (value) => <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>{String(value)}</div> },
    { key: 'approval_threshold', label: 'Approval Threshold', render: (value) => <div style={{ fontSize: '12px', color: '#4b5563' }}>{value ? `RM ${Number(value).toFixed(2)}` : 'No threshold'}</div> },
    { key: 'requires_approval', label: 'Approval Required', align: 'center', render: (value) => value ? <i className="bi bi-check-circle-fill" style={{ color: '#10b981', fontSize: '14px' }}></i> : <i className="bi bi-x-circle-fill" style={{ color: '#6b7280', fontSize: '14px' }}></i> },
    { key: 'status', label: 'Status', render: (value) => getStatusBadge(String(value)) },
    { key: 'actions', label: 'Actions', align: 'center', width: '140px', render: (_, row) => (
      <AdminTableActions actions={[
        actionPresets.view(() => { setSelectedCategory(row); setShowViewModal(true); }),
        ...(canPerformAction('expense_categories', 'edit') ? [actionPresets.edit(() => { setSelectedCategory(row); setFormData({ code: row.code, name: row.name, description: row.description, requires_approval: row.requires_approval, approval_threshold: row.approval_threshold?.toString() || '', color: row.color, status: row.status }); setShowEditModal(true); })] : []),
        ...(canPerformAction('expense_categories', 'delete') ? [actionPresets.delete(() => handleDelete(row.id))] : [])
      ]} />
    )}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [categories, canPerformAction]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
        <p className="text-muted mb-0" style={{ fontSize: 12 }}>Loading expense categories...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>Expense Categories Management</h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Manage business expense categories</p>
        </div>
        <PermissionButton sessionHash={sessionHash} module="expense_categories" action="create" className="btn btn-primary"
          onClick={() => setShowCreateModal(true)} style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}>
          <i className="bi bi-plus-circle me-2"></i>Add Category
        </PermissionButton>
      </div>

      <form className="row g-3 mb-4">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Search by name or code..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="col-md-2">
          <button type="button" onClick={() => { setSearchQuery(''); setFilterStatus(''); }} className="btn btn-outline-danger w-100"
            style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', fontWeight: 500 }}>Reset</button>
        </div>
      </form>

      <div style={{ marginBottom: '24px' }}>
        <AdminTable<ExpenseCategory> columns={tableColumns} data={paginatedCategories} emptyMessage="No expense categories found." />
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
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
                  {showCreateModal ? 'Add Expense Category' : 'Edit Expense Category'}
                </h5>
                <button onClick={() => { showCreateModal ? setShowCreateModal(false) : setShowEditModal(false); resetForm(); }}
                  className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Code <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="text" className="form-control" required maxLength={10} value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g., OFF"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} />
                    </div>
                    <div className="col-md-8">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Category Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="text" className="form-control" required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Office Supplies"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} />
                    </div>
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Description</label>
                      <textarea className="form-control" rows={2} value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} />
                    </div>
                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Approval Threshold (RM)</label>
                      <input type="number" step="0.01" className="form-control" value={formData.approval_threshold}
                        onChange={(e) => setFormData({ ...formData, approval_threshold: e.target.value })} placeholder="Optional"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }} />
                      <small style={{ fontSize: '10px', color: '#6b7280' }}>Amount requiring approval</small>
                    </div>
                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Color</label>
                      <input type="color" className="form-control" value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '2px', height: '38px' }} />
                    </div>
                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Status <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select className="form-select" required value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-12">
                      <div className="form-check" style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '2px' }}>
                        <input type="checkbox" className="form-check-input" id="requires_approval" checked={formData.requires_approval}
                          onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })} />
                        <label className="form-check-label" htmlFor="requires_approval" style={{ fontSize: '11px', fontWeight: 500 }}>
                          <i className="bi bi-check-square me-2"></i>Requires Manager Approval
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button type="button" onClick={() => { showCreateModal ? setShowCreateModal(false) : setShowEditModal(false); resetForm(); }}
                    className="btn btn-outline-secondary" style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}>
                    <i className="bi bi-check-circle me-2"></i>{showCreateModal ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedCategory && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-info-circle me-2"></i>Category Details
                </h5>
                <button onClick={() => setShowViewModal(false)} className="btn-close" style={{ fontSize: '10px' }}></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Code</label>
                    <div><span style={{ backgroundColor: `${selectedCategory.color}15`, color: selectedCategory.color, padding: '6px 12px', borderRadius: '2px', fontSize: '12px', fontWeight: 600 }}>{selectedCategory.code}</span></div>
                  </div>
                  <div className="col-md-8">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Name</label>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedCategory.name}</div>
                  </div>
                  <div className="col-md-12">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Description</label>
                    <div style={{ fontSize: '12px' }}>{selectedCategory.description || '-'}</div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Approval Threshold</label>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>
                      {selectedCategory.approval_threshold ? `RM ${selectedCategory.approval_threshold.toLocaleString('en-MY', { minimumFractionDigits: 2 })}` : 'N/A'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Status</label>
                    <div><span style={{ backgroundColor: selectedCategory.status === 'active' ? '#10b981' : '#6b7280', color: '#ffffff', padding: '4px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 500 }}>{selectedCategory.status === 'active' ? 'Active' : 'Inactive'}</span></div>
                  </div>
                  <div className="col-md-12">
                    <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Requires Approval</label>
                    <div style={{ fontSize: '12px' }}>
                      {selectedCategory.requires_approval ? <span style={{ color: '#f59e0b' }}><i className="bi bi-check-circle-fill me-1"></i>Yes</span> : <span style={{ color: '#6b7280' }}><i className="bi bi-x-circle-fill me-1"></i>No</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                <button onClick={() => setShowViewModal(false)} className="btn btn-secondary" style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

