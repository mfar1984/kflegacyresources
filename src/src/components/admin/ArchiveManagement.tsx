'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminTable, AdminTableColumn } from './AdminTable';
import { AdminTableActions, actionPresets } from './AdminTableActions';
import Pagination from '../Pagination';

interface ArchivedApplicant {
  id: number;
  application_no: string;
  full_name: string;
  email: string;
  job_title?: string;
  status: string;
  submitted_at: string;
  archived_at: string;
}

interface ArchiveManagementProps {
  sessionHash: string;
  userPermissions?: string[];
}

export default function ArchiveManagement({ sessionHash, userPermissions = [] }: ArchiveManagementProps) {
  const [archivedApplicants, setArchivedApplicants] = useState<ArchivedApplicant[]>([]);
  
  // Permission helper
  const hasPermission = (permission: string) => userPermissions.includes(permission);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchArchivedApplicants();
  }, [sessionHash]);

  const fetchArchivedApplicants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/applicants/archive?hash=${sessionHash}`);
      if (!response.ok) throw new Error('Failed to fetch archived applicants');
      const data = await response.json();
      setArchivedApplicants(data);
      setError('');
    } catch (err) {
      setError('Failed to load archived applicants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (applicantId: number) => {
    if (!confirm('Restore this applicant from archive?')) return;

    try {
      const response = await fetch(`/api/admin/applicants/${applicantId}/restore?hash=${sessionHash}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to restore applicant');
      
      fetchArchivedApplicants();
      alert('Applicant restored successfully!');
    } catch (err) {
      alert('Failed to restore applicant');
      console.error(err);
    }
  };

  const handlePermanentDelete = async (applicantId: number) => {
    if (!confirm('Permanently delete this applicant? This action CANNOT be undone!')) return;
    if (!confirm('Are you absolutely sure? All data will be lost forever.')) return;

    try {
      const response = await fetch(`/api/admin/applicants/${applicantId}/permanent?hash=${sessionHash}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete applicant');
      
      fetchArchivedApplicants();
      alert('Applicant permanently deleted.');
    } catch (err) {
      alert('Failed to delete applicant');
      console.error(err);
    }
  };

  // Filter and search
  const filteredApplicants = useMemo(() => {
    return archivedApplicants.filter(applicant => {
      const matchesSearch = searchQuery === '' || 
        applicant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.application_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [archivedApplicants, searchQuery]);

  // Pagination
  const paginatedApplicants = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredApplicants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplicants, page]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Table columns
  const tableColumns: AdminTableColumn<ArchivedApplicant>[] = useMemo(() => [
    {
      key: 'application_no',
      label: 'Application No',
      width: '12%',
      render: (value) => <span className="fw-semibold" style={{ fontSize: '11px' }}>{value as string}</span>,
    },
    {
      key: 'full_name',
      label: 'Applicant Name',
      width: '22%',
      render: (value, row) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500 }}>{value as string}</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'job_title',
      label: 'Position Applied',
      width: '20%',
      render: (value) => <span style={{ fontSize: '11px' }}>{value as string || '-'}</span>,
    },
    {
      key: 'status',
      label: 'Final Status',
      width: '12%',
      align: 'center',
      render: (value) => <span className="badge bg-secondary" style={{ fontSize: '11px' }}>{value as string}</span>,
    },
    {
      key: 'submitted_at',
      label: 'Applied Date',
      width: '12%',
      render: (value) => <span style={{ fontSize: '10px', color: '#6b7280' }}>{formatDate(value as string)}</span>,
    },
    {
      key: 'archived_at',
      label: 'Archived Date',
      width: '12%',
      render: (value) => <span style={{ fontSize: '10px', color: '#6b7280' }}>{formatDate(value as string)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '10%',
      align: 'center',
      render: (_, row) => (
        <AdminTableActions
          actions={[
            ...(hasPermission('career_archive_approve') ? [{
              type: 'custom' as const,
              icon: 'unarchive',
              title: 'Restore from Archive',
              onClick: () => handleRestore(row.id),
              color: '#2563eb',
            }] : []),
            ...(hasPermission('career_archive_delete') ? [actionPresets.delete(() => handlePermanentDelete(row.id))] : []),
          ]}
        />
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  if (loading && archivedApplicants.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading archive...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>Career Archive</h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            View and manage archived applicant records
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4" style={{ border: '1px solid #e5e7eb' }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search archived applicants..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                style={{ fontSize: '13px' }}
              />
            </div>
            <div className="col-md-6 text-end">
              <span className="text-muted" style={{ fontSize: '13px' }}>
                Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredApplicants.length)} of {filteredApplicants.length} archived records
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info mb-4" style={{ fontSize: '13px' }}>
        <i className="bi bi-info-circle me-2"></i>
        <strong>Archive Policy:</strong> Archived applicants are kept for record purposes. You can restore them to active status or permanently delete them.
      </div>

      {/* Table */}
      <AdminTable<ArchivedApplicant>
        columns={tableColumns}
        data={paginatedApplicants}
        emptyMessage="No archived applicants. Rejected or old applications will appear here."
      />

      {/* Pagination */}
      {filteredApplicants.length > itemsPerPage && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(filteredApplicants.length / itemsPerPage)}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

