'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Pagination from '../Pagination';

interface Subscriber {
  id: number;
  full_name: string;
  email: string;
  ip_address: string;
  user_agent: string;
  is_active: number;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

interface NewsSubscribersManagementProps {
  sessionHash: string;
  userPermissions?: string[];
}

export default function NewsSubscribersManagement({ sessionHash, userPermissions = [] }: NewsSubscribersManagementProps) {
  const hasPermission = (permission: string) => userPermissions.includes(permission);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, [sessionHash, statusFilter]);

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

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/admin/news-subscribers?hash=${sessionHash}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscribers');
      }
      const data = await response.json();
      setSubscribers(Array.isArray(data.subscribers) ? data.subscribers : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscribers');
      console.error('Fetch error:', err);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const response = await fetch(`/api/admin/news-subscribers/${id}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete subscriber');

      setOpenDropdownId(null);
      await fetchSubscribers();
      alert('Subscriber deleted successfully');
    } catch (err) {
      alert('Failed to delete subscriber');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#f9fafb';
  };

  const handleRowLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleExport = () => {
    const csv = [
      ['Full Name', 'Email', 'Status', 'IP Address', 'Subscribed At', 'Unsubscribed At'],
      ...filteredSubscribers.map(sub => [
        sub.full_name,
        sub.email,
        sub.is_active === 1 ? 'Active' : 'Unsubscribed',
        sub.ip_address,
        new Date(sub.subscribed_at).toLocaleString(),
        sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub => {
      const matchesSearch = searchQuery === '' || 
        sub.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && sub.is_active === 1) ||
        (statusFilter === 'unsubscribed' && sub.is_active === 0);
      
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchQuery, statusFilter]);

  const paginatedSubscribers = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredSubscribers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubscribers, page]);

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

  if (loading && subscribers.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>Newsletter Subscribers</h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage newsletter subscriptions and subscriber list
          </p>
        </div>
        {hasPermission('news_subscribers_export') && (
          <button
            onClick={handleExport}
            className="btn btn-success"
            style={{
              fontSize: '12px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 500
            }}
          >
            <i className="bi bi-download me-2"></i>
            Export CSV
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ fontSize: '12px' }}>
          {error}
        </div>
      )}

      {/* Filter Section */}
      <form className="row g-3 mb-4">
        {/* Search */}
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
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
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
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
            <option value="unsubscribed">Unsubscribed</option>
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
              setPage(1);
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
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        overflow: 'visible'
      }}>
        <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
          <table style={{
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
                  borderBottom: '1px solid #d1d5db',
                  width: '20%'
                }}>
                  Full Name
                </th>
                <th scope="col" style={{
                  padding: '10px 16px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'left',
                  borderBottom: '1px solid #d1d5db',
                  width: '25%'
                }}>
                  Email
                </th>
                <th scope="col" style={{
                  padding: '10px 16px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'left',
                  borderBottom: '1px solid #d1d5db',
                  width: '12%'
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
                  borderBottom: '1px solid #d1d5db',
                  width: '15%'
                }}>
                  IP Address
                </th>
                <th scope="col" style={{
                  padding: '10px 16px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'left',
                  borderBottom: '1px solid #d1d5db',
                  width: '18%'
                }}>
                  Subscribed At
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
                  width: '10%'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    No subscribers found
                  </td>
                </tr>
              ) : (
                paginatedSubscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    onMouseEnter={handleRowHover}
                    onMouseLeave={handleRowLeave}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#111827'
                    }}>
                      {sub.full_name}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '12px',
                      color: '#374151'
                    }}>
                      {sub.email}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${sub.is_active === 1 ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '11px' }}>
                        {sub.is_active === 1 ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {sub.ip_address}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '12px',
                      color: '#374151'
                    }}>
                      {formatDate(sub.subscribed_at)}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      {hasPermission('news_subscribers_delete') && (
                        <button
                          onClick={() => handleDelete(sub.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '4px 6px'
                          }}
                          title="Delete Subscriber"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            delete
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Showing {filteredSubscribers.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {filteredSubscribers.length > 0 ? Math.min(page * itemsPerPage, filteredSubscribers.length) : 0} of {filteredSubscribers.length} subscribers
        </div>
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredSubscribers.length / itemsPerPage)}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

