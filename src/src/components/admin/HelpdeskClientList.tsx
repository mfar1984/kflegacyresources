'use client';

import { useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/Pagination';
import { usePermissions } from '@/hooks/usePermissions';

interface ClientRow {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending_verification' | 'active' | 'suspended';
  email_verified: number;
  created_at: string;
}

interface HelpdeskClientListProps {
  hash: string;
}

export default function HelpdeskClientList({ hash }: HelpdeskClientListProps) {
  const { canPerformAction } = usePermissions(hash);
  
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  
  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, page, pageSize]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-trigger]') && !target.closest('[data-dropdown-menu]')) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId !== null) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdownId]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        hash,
        page: String(page),
        pageSize: String(pageSize),
      });
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/helpdesk/clients?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setError('Failed to fetch clients');
      }
    } catch (err) {
      setError('Error fetching clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (client: ClientRow) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleStatusChange = async (clientId: number, newStatus: 'active' | 'suspended') => {
    try {
      const response = await fetch(`/api/admin/helpdesk/clients/${clientId}/status?hash=${hash}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchClients();
        setOpenDropdownId(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Error updating status');
      console.error(err);
    }
  };

  const handleResetPassword = async (clientId: number) => {
    if (!confirm('Are you sure you want to reset this client\'s password? A new password will be emailed to them.')) return;

    try {
      const response = await fetch(`/api/admin/helpdesk/clients/${clientId}/reset-password?hash=${hash}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Password reset successfully. New credentials have been emailed to the client.');
        setOpenDropdownId(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Error resetting password');
      console.error(err);
    }
  };

  const handleDelete = async (clientId: number) => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all their tickets and cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/helpdesk/clients/${clientId}?hash=${hash}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchClients();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete client');
      }
    } catch (err) {
      setError('Error deleting client');
      console.error(err);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#d1fae5', color: '#065f46' };
      case 'suspended': return { bg: '#fee2e2', color: '#991b1b' };
      case 'pending_verification': return { bg: '#fef3c7', color: '#92400e' };
      default: return { bg: '#e5e7eb', color: '#374151' };
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
          <p className="text-muted mt-3" style={{ fontSize: '12px' }}>Loading clients...</p>
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
            Helpdesk Clients
          </h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Manage registered helpdesk clients
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <form className="row g-3 mb-4">
        {/* Search */}
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search company, contact person, email or phone..."
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
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending_verification">Pending Verification</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-outline-danger w-100"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
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
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '12px'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <th style={{ 
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'left',
                    fontSize: '12px'
                  }}>Company Name</th>
                  <th style={{ 
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'left',
                    fontSize: '12px'
                  }}>Contact Person</th>
                  <th style={{ 
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'left',
                    fontSize: '12px'
                  }}>Email</th>
                  <th style={{ 
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}>Status</th>
                  <th style={{ 
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}>Verified</th>
                  <th style={{ 
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ 
                      padding: '48px 16px',
                      textAlign: 'center',
                      color: '#9ca3af',
                      fontSize: '12px'
                    }}>
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-inbox" style={{ fontSize: '48px', marginBottom: '12px' }}></i>
                        <p style={{ margin: 0 }}>No clients found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr 
                      key={client.id}
                      onMouseEnter={handleRowHover}
                      onMouseLeave={handleRowLeave}
                      style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                          {client.company_name}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {client.contact_person}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>
                          {client.email}
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
                          backgroundColor: getStatusBadgeColor(client.status).bg,
                          color: getStatusBadgeColor(client.status).color
                        }}>
                          {formatStatus(client.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {client.email_verified ? (
                          <i className="bi bi-check-circle-fill" style={{ color: '#10b981', fontSize: '16px' }}></i>
                        ) : (
                          <i className="bi bi-x-circle-fill" style={{ color: '#ef4444', fontSize: '16px' }}></i>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative' }}>
                        {/* View Button */}
                        {canPerformAction('helpdesk_clients', 'view') && (
                          <button
                            onClick={() => handleView(client)}
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

                        {/* Reset Password Button */}
                        <button
                          onClick={() => handleResetPassword(client.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#f59e0b',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            marginRight: '4px'
                          }}
                          title="Reset Password"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            key
                          </span>
                        </button>

                        {/* More Actions Dropdown */}
                        <div style={{ display: 'inline-block', position: 'relative' }}>
                          <button
                            data-dropdown-trigger="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === client.id ? null : client.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#6b7280',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              position: 'relative',
                              zIndex: 1
                            }}
                            title="More Actions"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              format_list_bulleted
                            </span>
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdownId === client.id && (
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
                              }}
                            >
                              {canPerformAction('helpdesk_clients', 'edit') && (
                                client.status === 'active' ? (
                                  <button
                                    onClick={() => handleStatusChange(client.id, 'suspended')}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      fontSize: '11px',
                                      textAlign: 'left',
                                      border: 'none',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      color: '#dc2626',
                                      display: 'block'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    Suspend
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStatusChange(client.id, 'active')}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      fontSize: '11px',
                                      textAlign: 'left',
                                      border: 'none',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      color: '#10b981',
                                      display: 'block'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    Activate
                                  </button>
                                )
                              )}
                              {canPerformAction('helpdesk_clients', 'delete') && (
                                <button
                                  onClick={() => handleDelete(client.id)}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    fontSize: '11px',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#dc2626',
                                    display: 'block'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
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

      {/* Pagination */}
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {total > 0 ? Math.min(page * pageSize, total) : 0} of {total} clients
        </div>
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '16px 20px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Client Details
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="row g-3">
                  <div className="col-12">
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <table style={{ width: '100%', fontSize: '12px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: '#374151', width: '40%' }}>Company Name</td>
                            <td style={{ padding: '8px 0', color: '#6b7280' }}>{selectedClient.company_name}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: '#374151' }}>Contact Person</td>
                            <td style={{ padding: '8px 0', color: '#6b7280' }}>{selectedClient.contact_person}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: '#374151' }}>Email</td>
                            <td style={{ padding: '8px 0', color: '#6b7280', wordBreak: 'break-all' }}>{selectedClient.email}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: '#374151' }}>Phone</td>
                            <td style={{ padding: '8px 0', color: '#6b7280' }}>{selectedClient.phone || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: '#374151' }}>Address</td>
                            <td style={{ padding: '8px 0', color: '#6b7280' }}>{selectedClient.address || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: '#374151' }}>Status</td>
                            <td style={{ padding: '8px 0' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 12px',
                                fontSize: '11px',
                                fontWeight: 500,
                                borderRadius: '9999px',
                                backgroundColor: getStatusBadgeColor(selectedClient.status).bg,
                                color: getStatusBadgeColor(selectedClient.status).color
                              }}>
                                {formatStatus(selectedClient.status)}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: '#374151' }}>Email Verified</td>
                            <td style={{ padding: '8px 0' }}>
                              {selectedClient.email_verified ? (
                                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <i className="bi bi-check-circle-fill"></i> Yes
                                </span>
                              ) : (
                                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <i className="bi bi-x-circle-fill"></i> No
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: '#374151' }}>Created At</td>
                            <td style={{ padding: '8px 0', color: '#6b7280' }}>
                              {new Date(selectedClient.created_at).toLocaleString('en-MY')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '12px 16px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetailsModal(false)}
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
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


