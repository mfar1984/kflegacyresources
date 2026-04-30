'use client';

import { useState, useEffect, useMemo } from 'react';
import Pagination from '@/components/Pagination';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';

interface Permission {
  id: number;
  module: string;
  action: string;
  name: string;
  description: string | null;
  category: string | null;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: number[];
  user_count: number;
}

interface RoleGroupsManagerProps {
  sessionHash: string;
}

export default function RoleGroupsManager({ sessionHash }: RoleGroupsManagerProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] as number[] });
  
  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch roles when search or page changes
  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page, pageSize]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/roles?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        const allRoles = data.roles || [];
        
        // Client-side filtering
        let filtered = allRoles;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = allRoles.filter((role: Role) => 
            role.name.toLowerCase().includes(query) || 
            role.description.toLowerCase().includes(query)
          );
        }
        
        // Client-side pagination
        setTotal(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
        
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const paginated = filtered.slice(startIdx, endIdx);
        
        setRoles(paginated);
      } else {
        setError('Failed to fetch roles');
      }
    } catch (err) {
      setError('Error fetching roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/permissions?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setGroupedPermissions(data.grouped || {});
      } else {
        setError('Failed to fetch permissions');
      }
    } catch (err) {
      setError('Error fetching permissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
    setShowModal(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description, permissions: role.permissions });
    setShowModal(true);
  };

  const handleDelete = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/admin/roles/${roleId}?hash=${sessionHash}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRoles();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete role');
      }
    } catch (err) {
      setError('Error deleting role');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingRole
        ? `/api/admin/roles/${editingRole.id}?hash=${sessionHash}`
        : `/api/admin/roles?hash=${sessionHash}`;
      
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        await fetchRoles();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save role');
      }
    } catch (err) {
      setError('Error saving role');
      console.error(err);
    }
  };

  const togglePermission = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };


  const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#f9fafb';
  };
  
  const handleRowLeave = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.currentTarget.style.backgroundColor = '#ffffff';
  };

  // Table columns configuration
  const tableColumns: AdminTableColumn<Role>[] = useMemo(() => [
    {
      key: 'name',
      label: 'Role Name',
      render: (value) => (
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'permissions',
      label: 'Permissions',
      align: 'center',
      render: (value) => {
        const permCount = Array.isArray(value) ? value.length : 0;
        return (
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 500,
            borderRadius: '9999px',
            backgroundColor: '#dbeafe',
            color: '#1e40af'
          }}>
            {permCount}
          </span>
        );
      }
    },
    {
      key: 'user_count',
      label: 'Users',
      align: 'center',
      render: (value) => (
        <span style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: 500,
          borderRadius: '9999px',
          backgroundColor: '#d1fae5',
          color: '#065f46'
        }}>
          {String(value)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      width: '120px',
      render: (_, row: Role) => (
        <AdminTableActions 
          actions={[
            actionPresets.edit(() => handleEdit(row)),
            actionPresets.delete(() => handleDelete(row.id))
          ]}
        />
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3" style={{ fontSize: '12px' }}>Loading role groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{ fontSize: '12px', padding: '12px 16px', marginBottom: '20px' }}>
          {error}
          <button type="button" className="btn-close" style={{ fontSize: '10px' }} onClick={() => setError('')}></button>
        </div>
      )}

      {/* Page Header - EXACT from kf-next */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
            Role Groups
          </h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Manage user roles and permissions
          </p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary d-flex align-items-center" 
            onClick={handleCreate}
            style={{ 
              fontSize: '12px', 
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 500
            }}
          >
            <span className="material-symbols-outlined me-2" style={{ fontSize: '16px' }}>add_circle</span>
            Create Role
          </button>
        </div>
      </div>

      {/* Filter Section - NO CARD, just form with white background inputs */}
      <form className="row g-3 mb-4">
        {/* Search */}
        <div className="col-md-10">
          <input
            type="text"
            className="form-control"
            placeholder="Search role name or description..."
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

        {/* Reset Button */}
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-outline-danger w-100"
            onClick={() => {
              setSearchQuery('');
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
      <div style={{ marginBottom: '24px' }}>
        <AdminTable<Role>
          columns={tableColumns}
          data={roles}
          emptyMessage="No roles found. Create your first role group."
          onRowHover={handleRowHover}
          onRowLeave={handleRowLeave}
        />
      </div>

          {/* Pagination */}
          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {total > 0 ? Math.min(page * pageSize, total) : 0} of {total} roles
            </div>
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg" style={{ maxWidth: '900px', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ fontSize: '11px', maxHeight: 'calc(100vh - 3.5rem)', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '12px 16px', flexShrink: 0 }}>
                <h5 className="modal-title" style={{ fontSize: '13px', fontWeight: 500 }}>
                  {editingRole ? 'Edit Role' : 'Create Role'}
                </h5>
                <button type="button" className="btn-close" style={{ fontSize: '10px' }} onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Role Name</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Description</label>
                    <textarea
                      className="form-control"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>Permissions Matrix</label>
                    <div className="permission-matrix" style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead style={{ backgroundColor: '#f3f4f6' }}>
                          <tr>
                            <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textAlign: 'left', borderBottom: '1px solid #e5e7eb', minWidth: '200px' }}>
                              Module
                            </th>
                            <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textAlign: 'center', borderBottom: '1px solid #e5e7eb', width: '80px' }}>
                              Create
                            </th>
                            <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textAlign: 'center', borderBottom: '1px solid #e5e7eb', width: '80px' }}>
                              Read
                            </th>
                            <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textAlign: 'center', borderBottom: '1px solid #e5e7eb', width: '80px' }}>
                              Update
                            </th>
                            <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textAlign: 'center', borderBottom: '1px solid #e5e7eb', width: '80px' }}>
                              Delete
                            </th>
                            <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textAlign: 'center', borderBottom: '1px solid #e5e7eb', width: '80px' }}>
                              Approve
                            </th>
                            <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textAlign: 'center', borderBottom: '1px solid #e5e7eb', width: '80px' }}>
                              Export
                            </th>
                          </tr>
                        </thead>
                        <tbody style={{ backgroundColor: '#ffffff' }}>
                          {(() => {
                            // Group permissions by category
                            const categoryOrder = ['dashboard', 'human_resources', 'web_tools', 'helpdesk', 'settings'];
                            const categoryLabels: Record<string, string> = {
                              'dashboard': 'Dashboard',
                              'human_resources': 'Human Resources',
                              'web_tools': 'Web Tools',
                              'helpdesk': 'Helpdesk',
                              'settings': 'Settings'
                            };
                            
                            const moduleLabels: Record<string, { name: string; indent: number }> = {
                              'dashboard': { name: 'Dashboard', indent: 0 },
                              // Career submenu
                              'career': { name: 'Career Postings', indent: 2 },
                              'applicants': { name: 'Applicants', indent: 2 },
                              'career_archive': { name: 'Archive', indent: 2 },
                              // Employee Management submenu
                              'employees': { name: 'Employee List', indent: 2 },
                              'departments': { name: 'Department List', indent: 2 },
                              // Leave Management submenu
                              'leave': { name: 'Leave Applications', indent: 2 },
                              'leave_types': { name: 'Leave Types', indent: 2 },
                              // Claim Management submenu
                              'claims': { name: 'Claim Applications', indent: 2 },
                              'claim_types': { name: 'Claim Types', indent: 2 },
                              'claim': { name: 'Claim (Legacy)', indent: 2 },
                              // Overtime Management submenu
                              'overtime': { name: 'Overtime Applications', indent: 2 },
                              'overtime_rates': { name: 'Overtime Rates', indent: 2 },
                              // Expenses submenu
                              'expenses': { name: 'Expense Applications', indent: 2 },
                              'expense_categories': { name: 'Expense Categories', indent: 2 },
                              // Payroll & Compensation submenu
                              // KPI submenu
                              'kpi_templates': { name: 'KPI Templates', indent: 2 },
                              'kpi_periods': { name: 'KPI Periods', indent: 2 },
                              'kpi_assignments': { name: 'KPI Assignments', indent: 2 },
                              'kpi_reviews': { name: 'KPI Reviews', indent: 2 },
                              'kpi_competencies': { name: 'KPI Competencies', indent: 2 },
                              'kpi_grades': { name: 'KPI Grade Bands', indent: 2 },
                              // Payroll & Compensation submenu
                              'payroll': { name: 'Payroll Periods', indent: 2 },
                              'allowances': { name: 'Allowances Management', indent: 2 },
                              'bonuses': { name: 'Bonus Management', indent: 2 },
                              'commissions': { name: 'Commission Management', indent: 2 },
                              'loans': { name: 'Loan Management', indent: 2 },
                              'advances': { name: 'Advance Management', indent: 2 },
                              // Web Tools
                              'achievement': { name: 'Achievement Awards', indent: 1 },
                              'certificates': { name: 'Certificates', indent: 1 },
                              'downloads': { name: 'Downloads', indent: 1 },
                              // News / Blogs submenu
                              'news': { name: 'Posting', indent: 2 },
                              'news_subscribers': { name: 'Subscribers', indent: 2 },
                              'procurement': { name: 'Procurement', indent: 1 },
                              'projects': { name: 'Project Records', indent: 1 },
                              // Helpdesk
                              'helpdesk': { name: 'Helpdesk Board', indent: 1 },
                              'helpdesk_clients': { name: 'Client List', indent: 1 },
                              // Settings
                              'global-config': { name: 'Global Config', indent: 1 },
                              'integrations': { name: 'Integrations', indent: 1 },
                              'role-groups': { name: 'Role Groups', indent: 1 },
                              'users': { name: 'Users', indent: 1 },
                              'activity-logs': { name: 'Activity Logs', indent: 1 }
                            };

                            // Get all permissions and organize by category
                            const allPermissions: Permission[] = Object.values(groupedPermissions).flat();
                            
                            // Group by category
                            const byCategory: Record<string, Record<string, Permission[]>> = {};
                            allPermissions.forEach(perm => {
                              const cat = perm.category || 'uncategorized';
                              if (!byCategory[cat]) byCategory[cat] = {};
                              if (!byCategory[cat][perm.module]) byCategory[cat][perm.module] = [];
                              byCategory[cat][perm.module].push(perm);
                            });

                            const renderCheckbox = (perms: Permission[], action: string) => {
                              const perm = perms.find(p => p.action === action || (action === 'view' && (p.action === 'read' || p.action === 'view')) || (action === 'edit' && (p.action === 'update' || p.action === 'edit')));
                              if (perm) {
                                return (
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    checked={formData.permissions.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                  />
                                );
                              }
                              return <span style={{ color: '#d1d5db' }}>—</span>;
                            };

                            return categoryOrder.map(cat => {
                              if (!byCategory[cat]) return null;

                              const rows = [];
                              
                              // Category header (skip for dashboard since it's standalone - no submenu)
                              if (cat !== 'dashboard') {
                                rows.push(
                                  <tr key={`cat-${cat}`} style={{ backgroundColor: '#f9fafb' }}>
                                    <td colSpan={7} style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#111827', borderTop: '2px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                                      {categoryLabels[cat]}
                                    </td>
                                  </tr>
                                );
                              }
                              
                              // Define HR subgroups
                              const hrSubgroups = {
                                'career': { modules: ['career', 'applicants', 'career_archive'], label: 'Career' },
                                'employee': { modules: ['employees', 'departments'], label: 'Employee Management' },
                                'leave': { modules: ['leave', 'leave_types'], label: 'Leave Management' },
                                'claim': { modules: ['claims', 'claim_types', 'claim'], label: 'Claim Management' },
                                'overtime': { modules: ['overtime', 'overtime_rates'], label: 'Overtime Management' },
                                'expenses': { modules: ['expenses', 'expense_categories'], label: 'Expenses' },
                                'kpi': { modules: ['kpi_templates','kpi_periods','kpi_assignments','kpi_reviews','kpi_competencies','kpi_grades'], label: 'KPI' },
                                'payroll': { modules: ['payroll', 'allowances', 'bonuses', 'commissions', 'loans', 'advances'], label: 'Payroll & Compensation' }
                              };

                              // Define Web Tools subgroups
                              const webToolsSubgroups = {
                                'news_blogs': { modules: ['news', 'news_subscribers'], label: 'News / Blogs' }
                              };
                              
                              // Track which subtitles we've shown
                              const shownSubtitles = new Set<string>();
                              
                              // Define module order for HR category (MUST match sidebar order)
                              const hrModuleOrder = [
                                // Career
                                'career', 'applicants', 'career_archive',
                                // Employee Management
                                'employees', 'departments',
                                // Leave Management
                                'leave', 'leave_types',
                                // Claim Management
                                'claims', 'claim_types', 'claim',
                                // Overtime Management
                                'overtime', 'overtime_rates',
                                // Expenses
                                'expenses', 'expense_categories',
                                // KPI (BEFORE Payroll)
                                'kpi_templates', 'kpi_periods', 'kpi_assignments', 'kpi_reviews', 'kpi_competencies', 'kpi_grades',
                                // Payroll & Compensation
                                'payroll', 'allowances', 'bonuses', 'commissions', 'loans', 'advances'
                              ];
                              
                              // Define Web Tools module order
                              const webToolsModuleOrder = [
                                'achievement',
                                'certificates',
                                'downloads',
                                // News / Blogs
                                'news', 'news_subscribers',
                                'procurement',
                                'projects'
                              ];

                              // Define Settings module order
                              const settingsModuleOrder = [
                                'global-config',
                                'integrations',
                                'role-groups',
                                'users',
                                'activity-logs'
                              ];

                              // Sort modules for HR, Web Tools and Settings categories
                              const sortedModules = cat === 'human_resources'
                                ? Object.entries(byCategory[cat]).sort(([a], [b]) => {
                                    const indexA = hrModuleOrder.indexOf(a);
                                    const indexB = hrModuleOrder.indexOf(b);
                                    if (indexA === -1) return 1;
                                    if (indexB === -1) return -1;
                                    return indexA - indexB;
                                  })
                                : cat === 'web_tools'
                                  ? Object.entries(byCategory[cat]).sort(([a], [b]) => {
                                      const indexA = webToolsModuleOrder.indexOf(a);
                                      const indexB = webToolsModuleOrder.indexOf(b);
                                      if (indexA === -1) return 1;
                                      if (indexB === -1) return -1;
                                      return indexA - indexB;
                                    })
                                : cat === 'settings'
                                  ? Object.entries(byCategory[cat]).sort(([a], [b]) => {
                                      const indexA = settingsModuleOrder.indexOf(a);
                                      const indexB = settingsModuleOrder.indexOf(b);
                                      if (indexA === -1) return 1;
                                      if (indexB === -1) return -1;
                                      return indexA - indexB;
                                    })
                                  : Object.entries(byCategory[cat]);

                              // Module rows
                              sortedModules.forEach(([moduleName, perms]) => {
                                // Check if this module belongs to an HR subgroup and add subtitle
                                if (cat === 'human_resources') {
                                  for (const [groupKey, groupData] of Object.entries(hrSubgroups)) {
                                    if (groupData.modules.includes(moduleName) && !shownSubtitles.has(groupKey)) {
                                      shownSubtitles.add(groupKey);
                                      rows.push(
                                        <tr key={`subtitle-${groupKey}`} style={{ backgroundColor: '#fefefe' }}>
                                          <td colSpan={7} style={{ padding: '6px 12px 4px 24px', fontSize: '11px', fontWeight: 600, color: '#4b5563' }}>
                                            {groupData.label}
                                          </td>
                                        </tr>
                                      );
                                      break;
                                    }
                                  }
                                }

                                // Check if this module belongs to a Web Tools subgroup and add subtitle
                                if (cat === 'web_tools') {
                                  for (const [groupKey, groupData] of Object.entries(webToolsSubgroups)) {
                                    if (groupData.modules.includes(moduleName) && !shownSubtitles.has(groupKey)) {
                                      shownSubtitles.add(groupKey);
                                      rows.push(
                                        <tr key={`subtitle-${groupKey}`} style={{ backgroundColor: '#fefefe' }}>
                                          <td colSpan={7} style={{ padding: '6px 12px 4px 24px', fontSize: '11px', fontWeight: 600, color: '#4b5563' }}>
                                            {groupData.label}
                                          </td>
                                        </tr>
                                      );
                                      break;
                                    }
                                  }
                                }
                                const label = moduleLabels[moduleName] || { name: moduleName, indent: 0 };
                                const paddingLeft = 12 + (label.indent * 12);

                                rows.push(
                                  <tr key={`${cat}-${moduleName}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '10px 12px', paddingLeft: `${paddingLeft}px`, fontSize: '11px', color: '#1f2937', fontWeight: label.indent === 0 ? 500 : 400 }}>
                                      {label.indent === 1 && '- '}
                                      {label.indent === 2 && '-- '}
                                      {label.name}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{renderCheckbox(perms, 'create')}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{renderCheckbox(perms, 'view')}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{renderCheckbox(perms, 'edit')}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{renderCheckbox(perms, 'delete')}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{renderCheckbox(perms, 'approve')}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{renderCheckbox(perms, 'export')}</td>
                                  </tr>
                                );
                              });

                              return rows;
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '12px 16px', flexShrink: 0, backgroundColor: '#fff' }}>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 14px' }} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 14px' }}>
                    {editingRole ? 'Update Role' : 'Create Role'}
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
