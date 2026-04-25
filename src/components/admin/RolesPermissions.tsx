'use client';

import { useState, useEffect } from 'react';
import styles from './OrdersManagement.module.css';

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  user_count: number;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'dashboard.view', name: 'View Dashboard', category: 'Dashboard' },
  
  // Orders
  { id: 'orders.view', name: 'View Orders', category: 'Orders' },
  { id: 'orders.create', name: 'Create Orders', category: 'Orders' },
  { id: 'orders.edit', name: 'Edit Orders', category: 'Orders' },
  { id: 'orders.delete', name: 'Delete Orders', category: 'Orders' },
  
  // Products
  { id: 'products.view', name: 'View Products', category: 'Products' },
  { id: 'products.create', name: 'Create Products', category: 'Products' },
  { id: 'products.edit', name: 'Edit Products', category: 'Products' },
  { id: 'products.delete', name: 'Delete Products', category: 'Products' },
  
  // Customers
  { id: 'customers.view', name: 'View Customers', category: 'Customers' },
  { id: 'customers.edit', name: 'Edit Customers', category: 'Customers' },
  { id: 'customers.delete', name: 'Delete Customers', category: 'Customers' },
  
  // Settings
  { id: 'settings.view', name: 'View Settings', category: 'Settings' },
  { id: 'settings.edit', name: 'Edit Settings', category: 'Settings' },
  
  // Users
  { id: 'users.view', name: 'View Users', category: 'Users' },
  { id: 'users.create', name: 'Create Users', category: 'Users' },
  { id: 'users.edit', name: 'Edit Users', category: 'Users' },
  { id: 'users.delete', name: 'Delete Users', category: 'Users' },
];

export default function RolesPermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      
      // Mock data
      const mockRoles: Role[] = [
        {
          id: 1,
          name: 'Super Admin',
          slug: 'super_admin',
          description: 'Full system access with all permissions',
          permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
          user_count: 1,
          created_at: '2023-01-01 00:00:00',
        },
        {
          id: 2,
          name: 'Admin',
          slug: 'admin',
          description: 'Standard admin access',
          permissions: ['dashboard.view', 'orders.view', 'orders.edit', 'products.view', 'products.edit', 'customers.view'],
          user_count: 3,
          created_at: '2023-01-01 00:00:00',
        },
        {
          id: 3,
          name: 'Editor',
          slug: 'editor',
          description: 'Content management only',
          permissions: ['dashboard.view', 'products.view', 'products.edit'],
          user_count: 2,
          created_at: '2023-01-01 00:00:00',
        },
      ];
      
      setRoles(mockRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    try {
      // TODO: API call
      alert('Add role functionality - Coming soon');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleEditRole = async () => {
    try {
      // TODO: API call
      alert('Edit role functionality - Coming soon');
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error editing role:', error);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      // TODO: API call
      alert('Delete role functionality - Coming soon');
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      permissions: [],
    });
    setSelectedRole(null);
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description,
      permissions: role.permissions,
    });
    setShowEditModal(true);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const toggleAllInCategory = (category: string) => {
    const categoryPerms = AVAILABLE_PERMISSIONS.filter(p => p.category === category).map(p => p.id);
    const allSelected = categoryPerms.every(p => formData.permissions.includes(p));
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !categoryPerms.includes(p))
        : [...new Set([...prev.permissions, ...categoryPerms])]
    }));
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading && roles.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading roles...</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Container Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                Roles & Permissions
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Manage user roles and their permissions
              </p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary d-flex align-items-center" 
              style={{ 
                fontSize: '12px', 
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 500
              }}
            >
              <span className="material-symbols-outlined me-2" style={{ fontSize: '16px' }}>add_circle</span>
              Add Role
            </button>
          </div>

          {/* Filter Section */}
          <form className="row g-3 mb-4">
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-danger w-100"
                onClick={() => setSearchTerm('')}
                style={{ 
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  borderColor: '#dc2626',
                  color: '#dc2626'
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {/* Roles Table */}
          <div className="overflow-x-auto shadow" style={{ 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            marginBottom: '24px',
            overflow: 'visible'
          }}>
            <table className="table mb-0" style={{ 
              fontSize: '12px',
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0
            }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: '1px solid #d1d5db'
                  }}>ROLE NAME</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: '1px solid #d1d5db'
                  }}>DESCRIPTION</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db'
                  }}>PERMISSIONS</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db'
                  }}>USERS</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db',
                    width: '100px'
                  }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#ffffff' }}>
                      No roles found
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr 
                      key={role.id} 
                      style={{ backgroundColor: '#ffffff' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                          {role.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {role.slug}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {role.description}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                          }}>
                            {role.permissions.length} permissions
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                          {role.user_count} {role.user_count === 1 ? 'user' : 'users'}
                        </div>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionsContainer}>
                          <button
                            onClick={() => openEditModal(role)}
                            className={styles.actionButton}
                            style={{ color: '#3b82f6' }}
                            title="Edit"
                          >
                            <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className={styles.actionButton}
                            style={{ color: '#dc2626' }}
                            title="Delete"
                            disabled={role.slug === 'super_admin'}
                          >
                            <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Role Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 24px' }}>
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                  {showAddModal ? 'Add Role' : 'Edit Role'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                    placeholder="Enter role name"
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                    placeholder="role-slug"
                  />
                </div>

                <div className="mb-4">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                    rows={2}
                    placeholder="Enter role description"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '12px', display: 'block' }}>
                    Permissions
                  </label>
                  
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={perms.every(p => formData.permissions.includes(p.id))}
                          onChange={() => toggleAllInCategory(category)}
                          style={{ cursor: 'pointer' }}
                        />
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', cursor: 'pointer', margin: 0 }}>
                          {category}
                        </label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', paddingLeft: '24px' }}>
                        {perms.map((perm) => (
                          <div key={perm.id} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={formData.permissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              id={perm.id}
                            />
                            <label className="form-check-label" htmlFor={perm.id} style={{ fontSize: '12px', color: '#6b7280' }}>
                              {perm.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={showAddModal ? handleAddRole : handleEditRole}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  {showAddModal ? 'Add Role' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
