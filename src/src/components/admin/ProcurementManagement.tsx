'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Pagination from '../Pagination';

interface ProcurementApplication {
  id: number;
  application_no: string;
  company_name: string;
  ssm_number: string;
  company_type?: string | null;
  incorporation_date?: string | null;
  email: string;
  office_phone: string;
  mobile_phone?: string | null;
  website?: string | null;
  city: string;
  state: string;
  postcode?: string | null;
  business_address?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  lo_value: number | null;
  approval_date: string | null;
  approval_notes: string | null;
  rejection_reason: string | null;
  rejected_date: string | null;
  submitted_at: string;
  // Compliance / company stats
  mof_number?: string | null;
  cidb_number?: string | null;
  cidb_grade?: string | null;
  bumiputera_status?: string | null;
  paid_up_capital?: string | null;
  num_employees?: string | number | null;
  annual_turnover?: string | null;
  years_in_business?: string | number | null;
  // Services offered flags (Yes/No)
  service_civil?: string | null;
  service_mne?: string | null;
  service_ict?: string | null;
  service_pmc?: string | null;
  service_trading?: string | null;
  service_others?: string | null;
  nature_of_business?: string | null;
  products_services?: string | null;
  // Banking
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  // Director
  director_name?: string | null;
  director_ic?: string | null;
  director_position?: string | null;
  director_contact?: string | null;
  attachments?: {
    doc_ssm?: string | null;
    doc_profile?: string | null;
    doc_mof?: string | null;
    doc_cidb?: string | null;
    doc_financial?: string | null;
    doc_bank?: string | null;
    doc_others?: string[] | null;
  } | string | null;
}

type ProcurementAttachments = {
  doc_ssm?: string | null;
  doc_profile?: string | null;
  doc_mof?: string | null;
  doc_cidb?: string | null;
  doc_financial?: string | null;
  doc_bank?: string | null;
  doc_others?: string[] | null;
} | null;

interface ProcurementManagementProps {
  sessionHash: string;
  userPermissions?: string[];
}

export default function ProcurementManagement({ sessionHash, userPermissions = [] }: ProcurementManagementProps) {
  // Permission helper (similar to Applicants Management)
  const hasPermission = (permission: string) => userPermissions.includes(permission);
  
  const [applications, setApplications] = useState<ProcurementApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ProcurementApplication | null>(null);

  // Approval form
  const [loValue, setLoValue] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Rejection form
  const [rejectionReason, setRejectionReason] = useState('');

  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

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

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const url = `/api/admin/procurement?hash=${sessionHash}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`;
      console.log('Fetching from:', url);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);
        const normalized = ((data || []) as ProcurementApplication[]).map((app) => {
          let attachmentsParsed: ProcurementAttachments = null;
          try {
            if (typeof app.attachments === 'string') {
              attachmentsParsed = JSON.parse(app.attachments);
            } else {
              attachmentsParsed = app.attachments || null;
            }
          } catch {
            attachmentsParsed = null;
          }
          return { ...app, attachments: attachmentsParsed } as ProcurementApplication;
        });
        setApplications(normalized);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        setError(`Failed to load applications: ${errorData.error || response.statusText}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Error loading applications: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchQuery === '' ||
        app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.application_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.ssm_number.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [applications, searchQuery]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, page, itemsPerPage]);

  const handleView = (application: ProcurementApplication) => {
    setSelectedApplication(application);
    setShowViewModal(true);
  };

  const handleApprove = (application: ProcurementApplication) => {
    setSelectedApplication(application);
    setLoValue('');
    setApprovalNotes('');
    setShowApproveModal(true);
    setOpenDropdownId(null);
  };

  const handleReject = (application: ProcurementApplication) => {
    setSelectedApplication(application);
    setRejectionReason('');
    setShowRejectModal(true);
    setOpenDropdownId(null);
  };

  const handleApproveSubmit = async () => {
    if (!selectedApplication || !loValue) return;

    try {
      const response = await fetch(`/api/admin/procurement/${selectedApplication.id}?hash=${sessionHash}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          lo_value: parseFloat(loValue),
          approval_notes: approvalNotes
        })
      });

      if (response.ok) {
        setShowApproveModal(false);
        fetchApplications();
        alert('Application approved successfully!');
      } else {
        alert('Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Error approving application');
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedApplication || !rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(`/api/admin/procurement/${selectedApplication.id}?hash=${sessionHash}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: rejectionReason
        })
      });

      if (response.ok) {
        setShowRejectModal(false);
        fetchApplications();
        alert('Application rejected');
      } else {
        alert('Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Error rejecting application');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/procurement/${id}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchApplications();
        alert('Application deleted successfully');
      } else {
        alert('Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting application');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; label: string } } = {
      'pending': { class: 'bg-warning', label: 'Pending Review' },
      'approved': { class: 'bg-success', label: 'Approved' },
      'rejected': { class: 'bg-danger', label: 'Rejected' }
    };
    const config = statusConfig[status] || { class: 'bg-secondary', label: status };
    return <span className={`badge ${config.class}`} style={{ fontSize: '11px' }}>{config.label}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#f9fafb';
  };

  const handleRowLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  if (loading && applications.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading applications...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>Procurement Management</h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage supplier registration applications
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <form className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by company name, application no, email, or SSM..."
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
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

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
              fontWeight: 500
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
        overflow: 'visible',
        position: 'relative'
      }}>
        <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
          <table className="table mb-0" style={{
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
                  width: '12%'
                }}>
                  Application No
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
                  width: '20%'
                }}>
                  Company Name
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
                  SSM Number
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
                  Location
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
                  width: '12%'
                }}>
                  LO Value
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
                  width: '10%'
                }}>
                  Submitted
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
              {paginatedApplications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center" style={{
                    padding: '48px 24px',
                    color: '#6b7280',
                    fontSize: '12px',
                    borderBottom: 'none'
                  }}>
                    No applications found.
                  </td>
                </tr>
              ) : (
                paginatedApplications.map(app => (
                  <tr
                    key={app.id}
                    onMouseEnter={handleRowHover}
                    onMouseLeave={handleRowLeave}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span className="fw-semibold" style={{ fontSize: '11px' }}>{app.application_no}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                        {app.company_name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>
                        {app.email}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{app.ssm_number}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{app.city}, {app.state}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {getStatusBadge(app.status)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {app.lo_value ? (
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                          RM {Number(app.lo_value).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '10px', color: '#6b7280' }}>{formatDate(app.submitted_at)}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative', whiteSpace: 'nowrap' }}>
                      {/* Actions Dropdown */}
                      <div style={{ display: 'inline-block', position: 'relative', marginRight: '4px' }}>
                        <button
                          data-dropdown-trigger
                          onClick={() => setOpenDropdownId(openDropdownId === app.id ? null : app.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#111827',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            position: 'relative',
                            zIndex: 1
                          }}
                          title="Actions"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            more_vert
                          </span>
                        </button>
                        {openDropdownId === app.id && (
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
                            {app.status === 'pending' && hasPermission('procurement_approve') && (
                              <>
                                <button
                                  onClick={() => handleApprove(app)}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    fontSize: '11px',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#059669',
                                    display: 'block'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <i className="bi bi-check-circle me-2"></i>Approve
                                </button>
                                <button
                                  onClick={() => handleReject(app)}
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
                                  <i className="bi bi-x-circle me-2"></i>Reject
                                </button>
                              </>
                            )}
                            {app.status !== 'pending' && hasPermission('procurement_approve') && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setLoValue(app.lo_value?.toString() || '');
                                    setApprovalNotes(app.approval_notes || '');
                                    setShowApproveModal(true);
                                    setOpenDropdownId(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    fontSize: '11px',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#2563eb',
                                    display: 'block'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <i className="bi bi-pencil me-2"></i>Update LO Value
                                </button>
                              </>
                            )}
                            {hasPermission('procurement_delete') && (
                              <button
                                onClick={() => handleDelete(app.id)}
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
                                <i className="bi bi-trash me-2"></i>Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Action Icons */}
                      {hasPermission('procurement_view') && (
                        <button
                          onClick={() => handleView(app)}
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
          Showing {filteredApplications.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {filteredApplications.length > 0 ? Math.min(page * itemsPerPage, filteredApplications.length) : 0} of {filteredApplications.length} applications
        </div>
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredApplications.length / itemsPerPage)}
          onPageChange={setPage}
        />
      </div>

      {/* View Modal */}
      {showViewModal && selectedApplication && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ maxWidth: '1000px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600 }}>Application Details</h5>
                  <small className="text-muted">Application No: {selectedApplication.application_no}</small>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body" style={{ fontSize: '12px' }}>
                <div className="row g-3">
                  {/* Row 1: Company Info | Registration & Compliance */}
                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-building me-2"></i>Company Information
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Company Name</td><td><strong>{selectedApplication.company_name}</strong></td></tr>
                            <tr><td className="text-muted">SSM Number</td><td>{selectedApplication.ssm_number}</td></tr>
                            <tr><td className="text-muted">Company Type</td><td>{selectedApplication.company_type}</td></tr>
                            <tr><td className="text-muted">Incorporation Date</td><td>{selectedApplication.incorporation_date ? formatDate(selectedApplication.incorporation_date) : '-'}</td></tr>
                            <tr><td className="text-muted">Email</td><td>{selectedApplication.email}</td></tr>
                            <tr><td className="text-muted">Office Phone</td><td>{selectedApplication.office_phone}</td></tr>
                            <tr><td className="text-muted">Mobile Phone</td><td>{selectedApplication.mobile_phone || '-'}</td></tr>
                            <tr><td className="text-muted">Website</td><td>{selectedApplication.website || '-'}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-shield-check me-2"></i>Registration & Compliance
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '45%' }}>MOF Number</td><td>{selectedApplication.mof_number || '-'}</td></tr>
                            <tr><td className="text-muted">CIDB Number</td><td>{selectedApplication.cidb_number || '-'}</td></tr>
                            <tr><td className="text-muted">CIDB Grade</td><td>{selectedApplication.cidb_grade || '-'}</td></tr>
                            <tr><td className="text-muted">Bumiputera Status</td><td>{selectedApplication.bumiputera_status}</td></tr>
                            <tr><td className="text-muted">Paid-up Capital</td><td>RM {selectedApplication.paid_up_capital || '-'}</td></tr>
                            <tr><td className="text-muted">Number of Employees</td><td>{selectedApplication.num_employees || '-'}</td></tr>
                            <tr><td className="text-muted">Annual Turnover</td><td>{selectedApplication.annual_turnover || '-'}</td></tr>
                            <tr><td className="text-muted">Years in Business</td><td>{selectedApplication.years_in_business} years</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Address | Services Offered */}
                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-geo-alt me-2"></i>Business Address
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <p className="mb-1">{selectedApplication.business_address}</p>
                        <p className="mb-0">{selectedApplication.postcode} {selectedApplication.city}, {selectedApplication.state}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-tools me-2"></i>Services Offered
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <div className="mb-2">
                          {selectedApplication.service_civil === 'Yes' && <span className="badge bg-primary me-1 mb-1">Civil Engineering</span>}
                          {selectedApplication.service_mne === 'Yes' && <span className="badge bg-primary me-1 mb-1">M&E Engineering</span>}
                          {selectedApplication.service_ict === 'Yes' && <span className="badge bg-primary me-1 mb-1">ICT Engineering</span>}
                          {selectedApplication.service_pmc === 'Yes' && <span className="badge bg-primary me-1 mb-1">PMC</span>}
                          {selectedApplication.service_trading === 'Yes' && <span className="badge bg-primary me-1 mb-1">General Trading</span>}
                          {selectedApplication.service_others === 'Yes' && <span className="badge bg-primary me-1 mb-1">Others</span>}
                        </div>
                        <div className="mt-3">
                          <label className="text-muted small d-block mb-1">Nature of Business</label>
                          <p style={{ fontSize: '11px' }}>{selectedApplication.nature_of_business}</p>
                        </div>
                        <div className="mt-2">
                          <label className="text-muted small d-block mb-1">Products/Services</label>
                          <p style={{ fontSize: '11px' }}>{selectedApplication.products_services}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Banking | Director */}
                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-bank me-2"></i>Banking Information
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Bank Name</td><td>{selectedApplication.bank_name}</td></tr>
                            <tr><td className="text-muted">Account Number</td><td>{selectedApplication.bank_account_number}</td></tr>
                            <tr><td className="text-muted">Account Name</td><td>{selectedApplication.bank_account_name}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-person-badge me-2"></i>Director Information
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Name</td><td>{selectedApplication.director_name}</td></tr>
                            <tr><td className="text-muted">IC Number</td><td>{selectedApplication.director_ic}</td></tr>
                            <tr><td className="text-muted">Position</td><td>{selectedApplication.director_position}</td></tr>
                            <tr><td className="text-muted">Contact</td><td>{selectedApplication.director_contact}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Attachments full width */}
                  <div className="col-12">
                    <div className="card mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-paperclip me-2"></i>Supporting Documents
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        {(() => {
                          const att = (selectedApplication.attachments || {}) as NonNullable<ProcurementAttachments> | Record<string, never>;
                          const entries: Array<{ key: string; label: string; file?: string | null }> = [
                            { key: 'doc_ssm', label: 'SSM Certificate', file: att?.doc_ssm },
                            { key: 'doc_profile', label: 'Company Profile', file: att?.doc_profile },
                            { key: 'doc_mof', label: 'MOF Certificate', file: att?.doc_mof },
                            { key: 'doc_cidb', label: 'CIDB Certificate', file: att?.doc_cidb },
                            { key: 'doc_financial', label: 'Financial Statement', file: att?.doc_financial },
                            { key: 'doc_bank', label: 'Bank Statement', file: att?.doc_bank },
                          ];

                          const hasAny = entries.some(e => !!e.file) || (Array.isArray((att as ProcurementAttachments)?.doc_others) && ((att as ProcurementAttachments)!.doc_others as string[]).length > 0);
                          if (!hasAny) {
                            return <div className="text-muted">No documents uploaded</div>;
                          }

                          return (
                            <div className="row g-2">
                              {entries.map((e, idx) => e.file ? (
                                <div className="col-12" key={e.key + idx}>
                                  <a
                                    href={`/uploads/procurement/${e.file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-inline-flex align-items-center text-decoration-none"
                                    style={{ fontSize: '12px', color: '#1d4ed8' }}
                                  >
                                    <i className="bi bi-file-earmark-pdf me-2" style={{ color: '#ef4444' }}></i>
                                    {e.label}
                                  </a>
                                </div>
                              ) : null)}
                              {Array.isArray((att as ProcurementAttachments)?.doc_others) && ((att as ProcurementAttachments)!.doc_others as string[]).map((file: string, i: number) => (
                                <div className="col-12" key={`doc-others-${i}`}>
                                  <a
                                    href={`/uploads/procurement/${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-inline-flex align-items-center text-decoration-none"
                                    style={{ fontSize: '12px', color: '#1d4ed8' }}
                                  >
                                    <i className="bi bi-file-earmark-text me-2" style={{ color: '#6b7280' }}></i>
                                    Other Document {i + 1}
                                  </a>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Row 5 (optional): Status full width when not pending) */}
                  {selectedApplication.status !== 'pending' && (
                    <div className="col-12">
                      <div className="card mb-0">
                        <div className="card-header bg-light">
                          <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                            <i className="bi bi-info-circle me-2"></i>Application Status
                          </h6>
                        </div>
                        <div className="card-body" style={{ fontSize: '12px' }}>
                          <div className="mb-2">
                            <label className="text-muted small d-block mb-1">Status</label>
                            {getStatusBadge(selectedApplication.status)}
                          </div>
                          {selectedApplication.status === 'approved' && (
                            <>
                              <div className="mb-2">
                                <label className="text-muted small d-block mb-1">LO Value</label>
                                <strong className="text-success">RM {Number(selectedApplication.lo_value || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</strong>
                              </div>
                              <div className="mb-2">
                                <label className="text-muted small d-block mb-1">Approval Date</label>
                                <span>{selectedApplication.approval_date ? formatDate(selectedApplication.approval_date) : '-'}</span>
                              </div>
                              {selectedApplication.approval_notes && (
                                <div className="mb-0">
                                  <label className="text-muted small d-block mb-1">Approval Notes</label>
                                  <p className="mb-0" style={{ fontSize: '11px' }}>{selectedApplication.approval_notes}</p>
                                </div>
                              )}
                            </>
                          )}
                          {selectedApplication.status === 'rejected' && (
                            <>
                              <div className="mb-2">
                                <label className="text-muted small d-block mb-1">Rejection Date</label>
                                <span>{selectedApplication.rejected_date ? formatDate(selectedApplication.rejected_date) : '-'}</span>
                              </div>
                              {selectedApplication.rejection_reason && (
                                <div className="mb-0">
                                  <label className="text-muted small d-block mb-1">Rejection Reason</label>
                                  <p className="mb-0" style={{ fontSize: '11px' }}>{selectedApplication.rejection_reason}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 14px' }} onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedApplication && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600 }}>Approve Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowApproveModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p><strong>Company:</strong> {selectedApplication.company_name}</p>
                  <p><strong>Application No:</strong> {selectedApplication.application_no}</p>
                </div>
                <div className="alert alert-info" style={{ fontSize: '12px' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  Please specify the maximum Local Order (LO) value for this supplier.
                </div>
                <div className="mb-3">
                  <label htmlFor="loValue" className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Local Order (LO) Value <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">RM</span>
                    <input
                      type="number"
                      className="form-control"
                      id="loValue"
                      value={loValue}
                      onChange={(e) => setLoValue(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                  <small className="text-muted">Enter the maximum value per Local Order for this supplier</small>
                </div>
                <div className="mb-3">
                  <label htmlFor="approvalNotes" className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Approval Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="approvalNotes"
                    rows={3}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add any notes or conditions..."
                    style={{ fontSize: '13px' }}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApproveModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={handleApproveSubmit}
                  disabled={!loValue}
                >
                  <i className="bi bi-check-circle me-2"></i>Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApplication && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600 }}>Reject Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p><strong>Company:</strong> {selectedApplication.company_name}</p>
                  <p><strong>Application No:</strong> {selectedApplication.application_no}</p>
                </div>
                <div className="alert alert-warning" style={{ fontSize: '12px' }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Please provide a reason for rejection. This will be sent to the applicant.
                </div>
                <div className="mb-3">
                  <label htmlFor="rejectionReason" className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="rejectionReason"
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide constructive feedback..."
                    required
                    style={{ fontSize: '13px' }}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleRejectSubmit}
                  disabled={!rejectionReason}
                >
                  <i className="bi bi-x-circle me-2"></i>Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

