'use client';

import { useState, useEffect } from 'react';
import styles from './OrdersManagement.module.css';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  last_login: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/users');
      // const data = await response.json();
      
      // Mock data for now
      const mockUsers: AdminUser[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@kflegacy.com',
          role: 'Super Admin',
          status: 'active',
          last_login: '2024-01-15 10:30:00',
          created_at: '2023-01-01 00:00:00',
        },
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      // TODO: API call to add user
      alert('Add user functionality - Coming soon');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEditUser = async () => {
    try {
      // TODO: API call to edit user
      alert('Edit user functionality - Coming soon');
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      // TODO: API call to delete user
      alert('Delete user functionality - Coming soon');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'admin',
      status: 'active',
    });
    setSelectedUser(null);
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      active: { bg: '#d1fae5', text: '#065f46' },
      inactive: { bg: '#fee2e2', text: '#991b1b' },
    };

    const { bg, text } = config[status] || config.active;

    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: bg,
          color: text,
        }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#dbeafe',
          color: '#1e40af',
        }}
      >
        {role}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading admin users...</p>
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
                Admin Users
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Manage administrator accounts and access
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
              Add Admin User
            </button>
          </div>

          {/* Filter Section */}
          <form className="row g-3 mb-4">
            {/* Search */}
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by username or email..."
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

            {/* Role Filter */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ 
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

            {/* Reset Button */}
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-danger w-100"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
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

          {/* Users Table */}
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
                  }}>USERNAME</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: '1px solid #d1d5db'
                  }}>EMAIL</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db'
                  }}>ROLE</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db'
                  }}>STATUS</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db'
                  }}>LAST LOGIN</th>
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#ffffff' }}>
                      No admin users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user.id} 
                      style={{ backgroundColor: '#ffffff' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                          {user.username}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {user.email}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getRoleBadge(user.role)}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getStatusBadge(user.status)}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                          {new Date(user.last_login).toLocaleString()}
                        </div>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionsContainer}>
                          <button
                            onClick={() => openEditModal(user)}
                            className={styles.actionButton}
                            style={{ color: '#3b82f6' }}
                            title="Edit"
                          >
                            <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className={styles.actionButton}
                            style={{ color: '#dc2626' }}
                            title="Delete"
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 24px' }}>
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                  Add Admin User
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                    placeholder="Enter username"
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                    placeholder="Enter email"
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                    placeholder="Enter password"
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                    style={{ fontSize: '12px' }}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="form-select"
                    style={{ fontSize: '12px' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddUser}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 24px' }}>
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                  Edit Admin User
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                    placeholder="Enter username"
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                    placeholder="Enter email"
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                    style={{ fontSize: '12px' }}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="form-select"
                    style={{ fontSize: '12px' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleEditUser}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
