'use client';

import { useState, useEffect } from 'react';
import Pagination from '@/components/Pagination';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  created_at: string;
  roles: number[];
  status: 'active' | 'suspended';
}

interface UsersManagementProps {
  sessionHash: string;
}

export default function UsersManagement({ sessionHash }: UsersManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', verifyPassword: '', roles: [] as number[] });
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  
  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`/api/admin/user-permissions?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || []);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  // Fetch users when search or page changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page, pageSize]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on dropdown button or dropdown menu
      if (!target.closest('[data-dropdown-trigger]') && !target.closest('[data-dropdown-menu]')) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId !== null) {
      // Add slight delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdownId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        const allUsers = data.users || [];
        
        // Client-side filtering
        let filtered = allUsers;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = allUsers.filter((user: User) => 
            user.username.toLowerCase().includes(query)
          );
        }
        
        // Client-side pagination
        setTotal(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
        
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const paginated = filtered.slice(startIdx, endIdx);
        
        setUsers(paginated);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`/api/admin/roles?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      } else {
        setError('Failed to fetch roles');
      }
    } catch (err) {
      setError('Error fetching roles');
      console.error(err);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', verifyPassword: '', roles: [] });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', verifyPassword: '', roles: user.roles });
    setShowModal(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleStatusChange = async (userId: number, newStatus: 'active' | 'suspended') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status?hash=${sessionHash}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchUsers();
        setOpenDropdownId(null);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Error updating status');
      console.error(err);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}?hash=${sessionHash}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password && formData.password !== formData.verifyPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}?hash=${sessionHash}`
        : `/api/admin/users?hash=${sessionHash}`;
      
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          roles: formData.roles
        }),
      });

      if (response.ok) {
        setShowModal(false);
        await fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save user');
      }
    } catch (err) {
      setError('Error saving user');
      console.error(err);
    }
  };

  const toggleRole = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  const getRoleNames = (roleIds: number[]) => {
    return roles
      .filter(role => roleIds.includes(role.id))
      .map(role => role.name)
      .join(', ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#f9fafb';
  };
  
  const handleRowLeave = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.currentTarget.style.backgroundColor = '#ffffff';
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3" style={{ fontSize: '12px' }}>Loading users...</p>
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

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
            Users
          </h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Manage admin users and their roles
          </p>
        </div>
        <div className="d-flex gap-2">
          {hasPermission('users_create') && (
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
              Create User
            </button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <form className="row g-3 mb-4">
        {/* Search */}
        <div className="col-md-10">
          <input
            type="text"
            className="form-control"
            placeholder="Search username..."
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
      <div className="shadow" style={{ 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
        marginBottom: '24px',
        overflow: 'visible',
        position: 'relative'
      }}>
        <table className="table mb-0" style={{ 
          fontSize: '12px',
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          overflow: 'visible'
        }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th scope="col" style={{ 
                padding: '10px 16px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'left',
                borderBottom: '1px solid #d1d5db'
              }}>
                Username
              </th>
              <th scope="col" style={{ 
                padding: '10px 16px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'left',
                borderBottom: '1px solid #d1d5db'
              }}>
                Roles
              </th>
              <th scope="col" style={{ 
                padding: '10px 16px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center',
                borderBottom: '1px solid #d1d5db'
              }}>
                Status
              </th>
              <th scope="col" style={{ 
                padding: '10px 16px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'left',
                borderBottom: '1px solid #d1d5db'
              }}>
                Created
              </th>
              <th scope="col" style={{ 
                padding: '10px 16px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center',
                borderBottom: '1px solid #d1d5db',
                width: '140px'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff', position: 'relative' }}>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center" style={{ 
                  padding: '48px 24px',
                  color: '#6b7280', 
                  fontSize: '12px',
                  borderBottom: 'none'
                }}>
                  No users found. Create your first user.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr 
                  key={user.id}
                  onMouseEnter={handleRowHover}
                  onMouseLeave={handleRowLeave}
                  style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.15s'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                      {user.username}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {getRoleNames(user.roles) || 'No roles assigned'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 500,
                      borderRadius: '9999px',
                      backgroundColor: user.status === 'active' ? '#d1fae5' : '#fee2e2',
                      color: user.status === 'active' ? '#065f46' : '#991b1b'
                    }}>
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative', whiteSpace: 'nowrap' }}>
                    {/* Status Dropdown - users_edit permission for status change */}
                    {hasPermission('users_edit') && (
                      <div style={{ display: 'inline-block', position: 'relative', marginRight: '4px' }}>
                        <button 
                          data-dropdown-trigger
                          onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                          style={{ 
                            background: 'transparent',
                            border: 'none',
                            color: '#111827',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            position: 'relative',
                            zIndex: 1
                          }}
                          title="Change Status"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            format_list_bulleted
                          </span>
                        </button>
                        {openDropdownId === user.id && (
                          <div 
                            data-dropdown-menu
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              marginTop: '4px',
                              background: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                              zIndex: 9999,
                              minWidth: '160px',
                              overflow: 'visible'
                            }}>
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleStatusChange(user.id, 'suspended')}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '11px',
                                  textAlign: 'left',
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  color: '#dc2626'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                Suspend User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(user.id, 'active')}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '11px',
                                  textAlign: 'left',
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  color: '#059669'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                Activate User
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {/* View - users_view permission */}
                    {hasPermission('users_view') && (
                      <button 
                        onClick={() => handleView(user)}
                        style={{ 
                          background: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          marginRight: '4px'
                        }}
                        title="View Details"
                      >
                        <i className="bi bi-eye" style={{ fontSize: '16px' }}></i>
                      </button>
                    )}
                    {/* Edit - users_edit permission */}
                    {hasPermission('users_edit') && (
                      <button 
                        onClick={() => handleEdit(user)}
                        style={{ 
                          background: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          marginRight: '4px'
                        }}
                        title="Edit"
                      >
                        <i className="bi bi-pencil" style={{ fontSize: '16px' }}></i>
                      </button>
                    )}
                    {/* Delete - users_delete permission */}
                    {hasPermission('users_delete') && (
                      <button 
                        onClick={() => handleDelete(user.id)}
                        style={{ 
                          background: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '4px 6px'
                        }}
                        title="Delete"
                      >
                        <i className="bi bi-trash" style={{ fontSize: '16px' }}></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {total > 0 ? Math.min(page * pageSize, total) : 0} of {total} users
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
          <div className="modal-dialog modal-lg" style={{ maxWidth: '600px', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ fontSize: '11px', maxHeight: 'calc(100vh - 3.5rem)', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '12px 16px', flexShrink: 0 }}>
                <h5 className="modal-title" style={{ fontSize: '13px', fontWeight: 500 }}>
                  {editingUser ? 'Edit User' : 'Create User'}
                </h5>
                <button type="button" className="btn-close" style={{ fontSize: '10px' }} onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Username (Email)</label>
                    <input
                      type="email"
                      className="form-control"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                      Password {editingUser && <span className="text-muted">(leave blank to keep current)</span>}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                      Verify Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      value={formData.verifyPassword}
                      onChange={(e) => setFormData({ ...formData, verifyPassword: e.target.value })}
                      required={!editingUser || !!formData.password}
                    />
                    {formData.password && formData.verifyPassword && formData.password !== formData.verifyPassword && (
                      <small className="text-danger" style={{ fontSize: '10px' }}>Passwords do not match</small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>Assign Roles</label>
                    <div className="border rounded p-3" style={{ backgroundColor: '#fafafa' }}>
                      {roles.length === 0 ? (
                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>No roles available. Create roles first.</p>
                      ) : (
                        roles.map(role => (
                          <div key={role.id} className="form-check mb-2" style={{ padding: '6px 8px', backgroundColor: 'white', borderRadius: '4px' }}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`role-${role.id}`}
                              checked={formData.roles.includes(role.id)}
                              onChange={() => toggleRole(role.id)}
                            />
                            <label className="form-check-label" htmlFor={`role-${role.id}`} style={{ fontSize: '11px', cursor: 'pointer', marginLeft: '4px' }}>
                              <strong>{role.name}</strong>
                              <br />
                              <small className="text-muted" style={{ fontSize: '10px' }}>{role.description}</small>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '12px 16px', flexShrink: 0, backgroundColor: '#fff' }}>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 14px' }} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 14px' }}>
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-md" style={{ maxWidth: '500px', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ fontSize: '11px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '12px 16px' }}>
                <h5 className="modal-title" style={{ fontSize: '13px', fontWeight: 500 }}>
                  User Details
                </h5>
                <button type="button" className="btn-close" style={{ fontSize: '10px' }} onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body" style={{ padding: '16px' }}>
                <div className="mb-3">
                  <label style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Username</label>
                  <div style={{ fontSize: '12px', color: '#1f2937', marginTop: '4px' }}>{selectedUser.username}</div>
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Status</label>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 500,
                      borderRadius: '9999px',
                      backgroundColor: selectedUser.status === 'active' ? '#d1fae5' : '#fee2e2',
                      color: selectedUser.status === 'active' ? '#065f46' : '#991b1b'
                    }}>
                      {selectedUser.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Roles</label>
                  <div style={{ fontSize: '12px', color: '#1f2937', marginTop: '4px' }}>
                    {getRoleNames(selectedUser.roles) || 'No roles assigned'}
                  </div>
                </div>
                <div className="mb-3">
                  <label style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Created</label>
                  <div style={{ fontSize: '12px', color: '#1f2937', marginTop: '4px' }}>{formatDate(selectedUser.created_at)}</div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '12px 16px' }}>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 14px' }} onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

