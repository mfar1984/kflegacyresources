'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Pagination from '../Pagination';

interface Applicant {
  id: number;
  career_posting_id: number;
  application_no: string;
  job_title?: string;
  
  // Personal Information
  full_name: string;
  ic_number: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  religion: string;
  marital_status: string;
  email: string;
  phone_number: string;
  alt_phone_number: string;
  
  // IC Address
  ic_address: string;
  ic_postcode: string;
  ic_city: string;
  ic_state: string;
  ic_country: string;
  
  // Current Address
  current_address: string;
  current_postcode: string;
  current_city: string;
  current_state: string;
  current_country: string;
  same_as_ic_address: boolean;
  
  // Emergency Contact
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  emergency_email: string;
  emergency_address: string;
  
  // Education & Experience
  highest_education: string;
  field_of_study: string;
  years_of_experience: number;
  current_employer: string;
  current_position: string;
  expected_salary: number;
  notice_period: string;
  available_start_date: string;
  
  // Documents
  passport_photo: string;
  resume_pdf: string;
  cover_letter_pdf: string;
  
  // Additional
  cover_message: string;
  how_did_you_hear: string;
  
  // Status & Admin
  status: 'pending' | 'shortlisted' | 'interview-scheduled' | 'interview-completed' | 'offered' | 'rejected' | 'withdrawn' | 'hired' | 'archived';
  interview_date: string;
  interview_notes: string;
  rejection_reason: string;
  admin_notes: string;
  submitted_at: string;
  reviewed_at: string;
  reviewed_by: number;
  updated_at: string;
  archived_at: string;
}

interface ApplicantsManagementProps {
  sessionHash: string;
  userPermissions?: string[];
}

export default function ApplicantsManagement({ sessionHash, userPermissions = [] }: ApplicantsManagementProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Permission helper
  const hasPermission = (permission: string) => userPermissions.includes(permission);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  
  // Interview Schedule Modal
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewApplicantId, setInterviewApplicantId] = useState<number | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplicants();
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

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/applicants?hash=${sessionHash}&status=${statusFilter}`);
      if (!response.ok) throw new Error('Failed to fetch applicants');
      const data = await response.json();
      setApplicants(data);
      setError('');
    } catch (err) {
      setError('Failed to load applicants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => {
      const matchesSearch = searchQuery === '' || 
        applicant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.application_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (applicant.job_title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [applicants, searchQuery]);

  // Pagination
  const paginatedApplicants = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredApplicants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplicants, page]);

  const handleView = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setModalMode('view');
    setShowModal(true);
  };

  const handleStatusUpdate = async (applicantId: number, newStatus: string) => {
    // If interview-scheduled, show modal for interview details
    if (newStatus === 'interview-scheduled') {
      setInterviewApplicantId(applicantId);
      setShowInterviewModal(true);
      setOpenDropdownId(null);
      return;
    }

    // For other statuses, update directly
    try {
      const response = await fetch(`/api/admin/applicants/${applicantId}?hash=${sessionHash}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      setOpenDropdownId(null);
      await fetchApplicants();
      setError('');
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  const handleInterviewScheduleSubmit = async () => {
    if (!interviewDate) {
      alert('Please select interview date');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/applicants/${interviewApplicantId}?hash=${sessionHash}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'interview-scheduled',
          interview_date: interviewDate,
          interview_notes: `${interviewTime ? `Time: ${interviewTime}\n` : ''}${interviewLocation ? `Location: ${interviewLocation}\n` : ''}${interviewNotes}`
        }),
      });

      if (!response.ok) throw new Error('Failed to schedule interview');
      
      // Reset form
      setShowInterviewModal(false);
      setInterviewApplicantId(null);
      setInterviewDate('');
      setInterviewTime('');
      setInterviewLocation('');
      setInterviewNotes('');
      
      await fetchApplicants();
      alert('Interview scheduled and email sent to applicant!');
      setError('');
    } catch (err) {
      setError('Failed to schedule interview');
      console.error(err);
      alert('Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (applicantId: number) => {
    if (!confirm('Are you sure you want to delete this applicant? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/applicants/${applicantId}?hash=${sessionHash}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete applicant');
      
      fetchApplicants();
      alert('Applicant deleted successfully!');
    } catch (err) {
      alert('Failed to delete applicant');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      'pending': { class: 'bg-secondary', label: 'Pending' },
      'shortlisted': { class: 'bg-info', label: 'Shortlisted' },
      'interview-scheduled': { class: 'bg-primary', label: 'Interview Scheduled' },
      'interview-completed': { class: 'bg-primary', label: 'Interview Done' },
      'offered': { class: 'bg-success', label: 'Offered' },
      'rejected': { class: 'bg-danger', label: 'Rejected' },
      'withdrawn': { class: 'bg-warning', label: 'Withdrawn' },
      'hired': { class: 'bg-success', label: 'Hired' },
      'archived': { class: 'bg-dark', label: 'Archived' },
    };

    const config = statusMap[status] || { class: 'bg-secondary', label: status };
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

  if (loading && applicants.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>Applicants Management</h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage job applications and candidate pipeline
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
        {/* Search */}
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or application no..."
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
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview-scheduled">Interview Scheduled</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
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
                  Applicant Name
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
                  Position Applied
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
                  Education
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
                  Experience
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
                  width: '10%'
                }}>
                  Applied Date
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
              {paginatedApplicants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center" style={{ 
                    padding: '48px 24px',
                    color: '#6b7280', 
                    fontSize: '12px',
                    borderBottom: 'none'
                  }}>
                    No applicants found. Applications will appear here once candidates apply.
                  </td>
                </tr>
              ) : (
                paginatedApplicants.map(applicant => (
                  <tr 
                    key={applicant.id}
                    onMouseEnter={handleRowHover}
                    onMouseLeave={handleRowLeave}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span className="fw-semibold" style={{ fontSize: '11px' }}>{applicant.application_no}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                        {applicant.full_name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>
                        {applicant.email}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{applicant.job_title || '-'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{applicant.highest_education}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{applicant.years_of_experience} years</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {getStatusBadge(applicant.status)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '10px', color: '#6b7280' }}>{formatDate(applicant.submitted_at)}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative', whiteSpace: 'nowrap' }}>
                      {/* Status Dropdown */}
                      {hasPermission('applicants_update') && (
                        <div style={{ display: 'inline-block', position: 'relative', marginRight: '4px' }}>
                          <button 
                            data-dropdown-trigger
                            onClick={() => setOpenDropdownId(openDropdownId === applicant.id ? null : applicant.id)}
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
                          {openDropdownId === applicant.id && (
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
                            {[
                              { key: 'pending', label: 'Pending', color: '#6b7280' },
                              { key: 'shortlisted', label: 'Shortlisted', color: '#0284c7' },
                              { key: 'interview-scheduled', label: 'Interview Scheduled', color: '#7c3aed' },
                              { key: 'offered', label: 'Offered', color: '#059669' },
                              { key: 'rejected', label: 'Rejected', color: '#dc2626' },
                              { key: 'hired', label: 'Hired', color: '#16a34a' }
                            ].filter(opt => opt.key !== applicant.status)
                              .map(opt => (
                                <button
                                  key={opt.key}
                                  onClick={() => handleStatusUpdate(applicant.id, opt.key)}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    fontSize: '11px',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: opt.color,
                                    display: 'block'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  {opt.label}
                                </button>
                            ))}
                          </div>
                        )}
                        </div>
                      )}
                      {/* View Button */}
                      <button 
                        onClick={() => handleView(applicant)}
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
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          visibility
                        </span>
                      </button>
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
          Showing {filteredApplicants.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {filteredApplicants.length > 0 ? Math.min(page * itemsPerPage, filteredApplicants.length) : 0} of {filteredApplicants.length} applicants
        </div>
        <Pagination 
          currentPage={page}
          totalPages={Math.ceil(filteredApplicants.length / itemsPerPage)}
          onPageChange={setPage}
        />
      </div>

      {/* View/Edit Modal - Full Details */}
      {showModal && selectedApplicant && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ maxWidth: '1200px' }}>
            <div className="modal-content" style={{ maxHeight: '90vh' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '16px 20px' }}>
                <div>
                  <h5 className="modal-title mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>Applicant Details</h5>
                  <small className="text-muted">Application No: {selectedApplicant.application_no}</small>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="row g-3">
                  {/* Row 1: Personal Information | Job Application (Interview details shown above Job if present) */}
                  <div className="col-lg-8 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-person me-2"></i>Personal Information
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Full Name</td><td>{selectedApplicant.full_name}</td></tr>
                            <tr><td className="text-muted">IC Number</td><td>{selectedApplicant.ic_number}</td></tr>
                            <tr><td className="text-muted">Email</td><td>{selectedApplicant.email}</td></tr>
                            <tr><td className="text-muted">Phone</td><td>{selectedApplicant.phone_number}</td></tr>
                            <tr><td className="text-muted">Alt Phone</td><td>{selectedApplicant.alt_phone_number || 'N/A'}</td></tr>
                            <tr><td className="text-muted">Date of Birth</td><td>{selectedApplicant.date_of_birth ? new Date(selectedApplicant.date_of_birth).toLocaleDateString('en-MY') : 'N/A'}</td></tr>
                            <tr><td className="text-muted">Gender</td><td>{selectedApplicant.gender || 'N/A'}</td></tr>
                            <tr><td className="text-muted">Marital Status</td><td>{selectedApplicant.marital_status || 'N/A'}</td></tr>
                            <tr><td className="text-muted">Nationality</td><td>{selectedApplicant.nationality || 'N/A'}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    {/* Interview Details (if any) */}
                    {selectedApplicant.status === 'interview-scheduled' && selectedApplicant.interview_date && (
                      <div className="card mb-3">
                        <div className="card-header bg-light">
                          <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                            <i className="bi bi-calendar-check me-2"></i>Interview Details
                          </h6>
                        </div>
                        <div className="card-body" style={{ fontSize: '12px' }}>
                          <div className="mb-3">
                            <label className="text-muted small d-block mb-1">
                              <i className="bi bi-calendar-event me-1"></i>Interview Date
                            </label>
                            <strong>{formatDate(selectedApplicant.interview_date)}</strong>
                          </div>
                          {selectedApplicant.interview_notes && (
                            <>
                              {selectedApplicant.interview_notes.includes('Time:') && (
                                <div className="mb-3">
                                  <label className="text-muted small d-block mb-1">
                                    <i className="bi bi-clock me-1"></i>Time
                                  </label>
                                  <strong>{selectedApplicant.interview_notes.split('\n').find(line => line.includes('Time:'))?.replace('Time:', '').trim() || '-'}</strong>
                                </div>
                              )}
                              {selectedApplicant.interview_notes.includes('Location:') && (
                                <div className="mb-3">
                                  <label className="text-muted small d-block mb-1">
                                    <i className="bi bi-geo-alt me-1"></i>Location
                                  </label>
                                  <strong>{selectedApplicant.interview_notes.split('\n').find(line => line.includes('Location:'))?.replace('Location:', '').trim() || '-'}</strong>
                                </div>
                              )}
                              {(() => {
                                const lines = selectedApplicant.interview_notes.split('\n').filter(line => !line.includes('Time:') && !line.includes('Location:') && line.trim());
                                return lines.length > 0 && (
                                  <div className="mb-0">
                                    <label className="text-muted small d-block mb-1">
                                      <i className="bi bi-journal-text me-1"></i>Additional Notes
                                    </label>
                                    <div style={{ backgroundColor: '#f8f9fa', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                                      {lines.join('\n')}
                                    </div>
                                  </div>
                                );
                              })()}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Job Details */}
                    <div className="card w-100 mb-0">
                      <div className="card-header bg-primary text-white">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-briefcase me-2"></i>Job Application
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <div className="mb-3">
                          <label className="text-muted small d-block mb-1">Position Applied</label>
                          <strong className="d-block">{selectedApplicant.job_title}</strong>
                        </div>
                        <div className="mb-3">
                          <label className="text-muted small d-block mb-1">Application Status</label>
                          {(() => {
                            const status = selectedApplicant.status;
                            const statusColors: Record<string, { bg: string; text: string }> = {
                              'pending': { bg: '#f3f4f6', text: '#6b7280' },
                              'shortlisted': { bg: '#dbeafe', text: '#0284c7' },
                              'interview-scheduled': { bg: '#f3e8ff', text: '#7c3aed' },
                              'offered': { bg: '#d1fae5', text: '#059669' },
                              'rejected': { bg: '#fee2e2', text: '#dc2626' },
                              'hired': { bg: '#d1fae5', text: '#16a34a' }
                            };
                            const colors = statusColors[status] || statusColors['pending'];
                            return (
                              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '9999px', backgroundColor: colors.bg, color: colors.text, textTransform: 'capitalize' }}>
                                {status.replace('-', ' ')}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="mb-3">
                          <label className="text-muted small d-block mb-1">Submitted</label>
                          <strong>{new Date(selectedApplicant.submitted_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                        </div>
                        {selectedApplicant.available_start_date && (
                          <div className="mb-3">
                            <label className="text-muted small d-block mb-1">Available Start Date</label>
                            <strong>{new Date(selectedApplicant.available_start_date).toLocaleDateString('en-MY')}</strong>
                          </div>
                        )}
                        {selectedApplicant.how_did_you_hear && (
                          <div>
                            <label className="text-muted small d-block mb-1">How They Found Us</label>
                            <strong>{selectedApplicant.how_did_you_hear}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Address Information | Documents */}
                  <div className="col-lg-8 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-geo-alt me-2"></i>Address Information
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <div className="mb-3">
                          <label className="text-primary small d-block mb-2">Address as per IC</label>
                          <p className="mb-1">{selectedApplicant.ic_address}</p>
                          <p className="mb-0 text-muted">
                            {selectedApplicant.ic_postcode} {selectedApplicant.ic_city}, {selectedApplicant.ic_state}
                          </p>
                        </div>
                        {!selectedApplicant.same_as_ic_address && (
                          <div>
                            <label className="text-primary small d-block mb-2">Current Address</label>
                            <p className="mb-1">{selectedApplicant.current_address}</p>
                            <p className="mb-0 text-muted">
                              {selectedApplicant.current_postcode} {selectedApplicant.current_city}, {selectedApplicant.current_state}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-file-earmark-text me-2"></i>Documents
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        {selectedApplicant.passport_photo && (
                          <div className="mb-2">
                            <a href={`/uploads/applicants/${selectedApplicant.passport_photo}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info w-100">
                              <i className="bi bi-image me-2"></i>View Passport Photo
                            </a>
                          </div>
                        )}
                        {selectedApplicant.resume_pdf && (
                          <div className="mb-2">
                            <a href={`/uploads/applicants/${selectedApplicant.resume_pdf}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary w-100">
                              <i className="bi bi-file-pdf me-2"></i>View Resume/CV
                            </a>
                          </div>
                        )}
                        {selectedApplicant.cover_letter_pdf && (
                          <div>
                            <a href={`/uploads/applicants/${selectedApplicant.cover_letter_pdf}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary w-100">
                              <i className="bi bi-file-pdf me-2"></i>View Cover Letter
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Education & Experience | Emergency Contact */}
                  <div className="col-lg-8 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-mortarboard me-2"></i>Education & Experience
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Highest Education</td><td>{selectedApplicant.highest_education}</td></tr>
                            <tr><td className="text-muted">Field of Study</td><td>{selectedApplicant.field_of_study}</td></tr>
                            <tr><td className="text-muted">Years of Experience</td><td>{selectedApplicant.years_of_experience} years</td></tr>
                            <tr><td className="text-muted">Current Position</td><td>{selectedApplicant.current_position || 'N/A'}</td></tr>
                            <tr><td className="text-muted">Current/Last Employer</td><td>{selectedApplicant.current_employer || 'N/A'}</td></tr>
                            <tr><td className="text-muted">Expected Salary</td><td><span className="text-success">{selectedApplicant.expected_salary}</span></td></tr>
                            <tr><td className="text-muted">Notice Period</td><td>{selectedApplicant.notice_period}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-telephone me-2"></i>Emergency Contact
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Name</td><td>{selectedApplicant.emergency_name}</td></tr>
                            <tr><td className="text-muted">Relationship</td><td>{selectedApplicant.emergency_relationship}</td></tr>
                            <tr><td className="text-muted">Phone</td><td>{selectedApplicant.emergency_phone}</td></tr>
                            <tr><td className="text-muted">Email</td><td style={{ wordBreak: 'break-all' }}>{selectedApplicant.emergency_email || 'N/A'}</td></tr>
                            {selectedApplicant.emergency_address && (
                              <tr><td className="text-muted">Address</td><td>{selectedApplicant.emergency_address}</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Cover Message full width */}
                  {selectedApplicant.cover_message && (
                    <div className="col-12">
                      <div className="card mb-0">
                        <div className="card-header bg-light">
                          <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                            <i className="bi bi-info-circle me-2"></i>Cover Message
                          </h6>
                        </div>
                        <div className="card-body" style={{ fontSize: '12px' }}>
                          <p className="mb-0">{selectedApplicant.cover_message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 14px' }} onClick={() => setShowModal(false)}>
                  <i className="bi bi-x-circle me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Schedule Modal */}
      {showInterviewModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-calendar-check me-2"></i>Schedule Interview
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowInterviewModal(false)}></button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
                  Please provide interview details. An email will be automatically sent to the applicant.
                </p>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Interview Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ fontSize: '12px' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Interview Time (Optional)
                  </label>
                  <input
                    type="time"
                    className="form-control form-control-sm"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Interview Location (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    placeholder="e.g., ANSAR Technologies Office, Meeting Room 1"
                    style={{ fontSize: '12px' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    rows={3}
                    placeholder="Any additional information for the applicant..."
                    style={{ fontSize: '12px' }}
                  />
                </div>

                <div className="alert alert-info py-2 px-3 mb-0" style={{ fontSize: '11px' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  The applicant will receive an email with interview details and instructions to bring required documents.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowInterviewModal(false)}
                  style={{ fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm" 
                  onClick={handleInterviewScheduleSubmit}
                  disabled={loading}
                  style={{ fontSize: '12px' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>Schedule & Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

