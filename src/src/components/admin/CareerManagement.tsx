'use client';

import { useState, useEffect, useMemo } from 'react';
import Pagination from '@/components/Pagination';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import dynamic from 'next/dynamic';

// Dynamically import TinyMCE wrapper to avoid SSR issues
const TinyMCEWrapper = dynamic(() => import('./TinyMCEWrapper'), { 
  ssr: false,
  loading: () => <div style={{ minHeight: '200px', backgroundColor: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb', padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>Loading editor...</div>
});

interface CareerPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_notes: string | null;
  experience_min: number | null;
  experience_max: number | null;
  experience_level: string | null;
  job_type: string;
  employment_type: string;
  icon: string;
  icon_bg: string;
  icon_color: string;
  btn_color: string;
  overview: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  status: string;
  posted_date: string;
  closing_date: string | null;
  created_at: string;
  updated_at: string;
}

interface CareerManagementProps {
  sessionHash: string;
  userPermissions?: string[];
}

// Pre-defined templates for editor
const TEMPLATES = {
  overview: '<p>We are seeking a skilled [Position Title] to join our [Department] team. You will be responsible for [main responsibilities]. This role requires [key requirements and expertise].</p>',
  responsibilities: `<ul>
  <li>Main responsibility 1</li>
  <li>Main responsibility 2</li>
  <li>Main responsibility 3</li>
  <li>Main responsibility 4</li>
  <li>Main responsibility 5</li>
  <li>Main responsibility 6</li>
  <li>Main responsibility 7</li>
  <li>Main responsibility 8</li>
</ul>`,
  requirements: `<ul>
  <li>Bachelor's Degree in [Field] or related field</li>
  <li>Minimum [X] years of experience in [Area]</li>
  <li>Strong knowledge of [Skills/Technologies]</li>
  <li>Experience with [Tools/Systems]</li>
  <li>Professional certifications ([Certifications]) are highly advantageous</li>
  <li>Excellent problem-solving and analytical skills</li>
  <li>Strong communication skills in English and Bahasa Malaysia</li>
  <li>Ability to work independently and in team environment</li>
  <li>Willing to travel for project site visits if required</li>
</ul>`,
  benefits: `<ul>
  <li>Competitive salary package ranging from RM [Min] to RM [Max] based on experience</li>
  <li>Annual performance bonus and salary increment review</li>
  <li>Comprehensive medical and hospitalization coverage</li>
  <li>EPF, SOCSO, and EIS contributions</li>
  <li>Annual leave, medical leave, and public holidays</li>
  <li>Professional development opportunities and training programs</li>
  <li>Career advancement opportunities within the organization</li>
  <li>Supportive work environment with work-life balance</li>
</ul>`
};

const ICON_OPTIONS = [
  { value: 'bi-laptop', label: 'Laptop (IT/Tech)', bg: 'bg-primary', color: 'text-primary', btn: 'btn-primary' },
  { value: 'bi-graph-up-arrow', label: 'Graph Up (Sales/Marketing)', bg: 'bg-success', color: 'text-success', btn: 'btn-success' },
  { value: 'bi-people', label: 'People (HR)', bg: 'bg-warning', color: 'text-warning', btn: 'btn-warning' },
  { value: 'bi-tools', label: 'Tools (Engineering)', bg: 'bg-danger', color: 'text-danger', btn: 'btn-danger' },
  { value: 'bi-gear', label: 'Gear (Technical)', bg: 'bg-info', color: 'text-info', btn: 'btn-info' },
  { value: 'bi-briefcase', label: 'Briefcase (General)', bg: 'bg-secondary', color: 'text-secondary', btn: 'btn-secondary' },
];

export default function CareerManagement({ sessionHash, userPermissions = [] }: CareerManagementProps) {
  const [postings, setPostings] = useState<CareerPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // Permission helper
  const hasPermission = (permission: string) => userPermissions.includes(permission);
  const [selectedPosting, setSelectedPosting] = useState<CareerPosting | null>(null);
  
  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: 'Selangor',
    salary_min: '',
    salary_max: '',
    salary_notes: '',
    experience_min: '',
    experience_max: '',
    experience_level: '',
    job_type: 'Full Time',
    employment_type: 'Permanent',
    icon: 'bi-briefcase',
    icon_bg: 'bg-primary',
    icon_color: 'text-primary',
    btn_color: 'btn-primary',
    overview: TEMPLATES.overview,
    responsibilities: TEMPLATES.responsibilities,
    requirements: TEMPLATES.requirements,
    benefits: TEMPLATES.benefits,
    status: 'draft',
    posted_date: new Date().toISOString().split('T')[0],
    closing_date: ''
  });

  useEffect(() => {
    fetchPostings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/career?hash=${sessionHash}&status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setPostings(data.postings || []);
      } else {
        setError('Failed to fetch career postings');
      }
    } catch (err) {
      setError('Error fetching career postings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and pagination
  const filteredPostings = useMemo(() => {
    let filtered = postings;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = postings.filter((posting) =>
        posting.title.toLowerCase().includes(query) ||
        posting.department.toLowerCase().includes(query) ||
        posting.location.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [postings, searchQuery]);

  const paginatedPostings = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    return filteredPostings.slice(startIdx, endIdx);
  }, [filteredPostings, page, pageSize]);

  const totalPages = Math.ceil(filteredPostings.length / pageSize);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedPosting(null);
    setFormData({
      title: '',
      department: '',
      location: 'Selangor',
      salary_min: '',
      salary_max: '',
      salary_notes: '',
      experience_min: '',
      experience_max: '',
      experience_level: '',
      job_type: 'Full Time',
      employment_type: 'Permanent',
      icon: 'bi-briefcase',
      icon_bg: 'bg-primary',
      icon_color: 'text-primary',
      btn_color: 'btn-primary',
      overview: TEMPLATES.overview,
      responsibilities: TEMPLATES.responsibilities,
      requirements: TEMPLATES.requirements,
      benefits: TEMPLATES.benefits,
      status: 'draft',
      posted_date: new Date().toISOString().split('T')[0],
      closing_date: ''
    });
    setShowModal(true);
  };

  const handleView = (posting: CareerPosting) => {
    setModalMode('view');
    setSelectedPosting(posting);
    setFormData({
      title: posting.title,
      department: posting.department,
      location: posting.location,
      salary_min: posting.salary_min?.toString() || '',
      salary_max: posting.salary_max?.toString() || '',
      salary_notes: posting.salary_notes || '',
      experience_min: posting.experience_min?.toString() || '',
      experience_max: posting.experience_max?.toString() || '',
      experience_level: posting.experience_level || '',
      job_type: posting.job_type,
      employment_type: posting.employment_type,
      icon: posting.icon,
      icon_bg: posting.icon_bg,
      icon_color: posting.icon_color,
      btn_color: posting.btn_color,
      overview: posting.overview,
      responsibilities: posting.responsibilities,
      requirements: posting.requirements,
      benefits: posting.benefits,
      status: posting.status,
      posted_date: posting.posted_date.split('T')[0],
      closing_date: posting.closing_date ? posting.closing_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleEdit = (posting: CareerPosting) => {
    setModalMode('edit');
    setSelectedPosting(posting);
    setFormData({
      title: posting.title,
      department: posting.department,
      location: posting.location,
      salary_min: posting.salary_min?.toString() || '',
      salary_max: posting.salary_max?.toString() || '',
      salary_notes: posting.salary_notes || '',
      experience_min: posting.experience_min?.toString() || '',
      experience_max: posting.experience_max?.toString() || '',
      experience_level: posting.experience_level || '',
      job_type: posting.job_type,
      employment_type: posting.employment_type,
      icon: posting.icon,
      icon_bg: posting.icon_bg,
      icon_color: posting.icon_color,
      btn_color: posting.btn_color,
      overview: posting.overview,
      responsibilities: posting.responsibilities,
      requirements: posting.requirements,
      benefits: posting.benefits,
      status: posting.status,
      posted_date: posting.posted_date.split('T')[0],
      closing_date: posting.closing_date ? posting.closing_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this career posting?')) return;

    try {
      const response = await fetch(`/api/admin/career/${id}?hash=${sessionHash}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPostings();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete career posting');
      }
    } catch (err) {
      setError('Error deleting career posting');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = modalMode === 'edit' && selectedPosting
        ? `/api/admin/career/${selectedPosting.id}?hash=${sessionHash}`
        : `/api/admin/career?hash=${sessionHash}`;
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        experience_min: formData.experience_min ? parseInt(formData.experience_min) : null,
        experience_max: formData.experience_max ? parseInt(formData.experience_max) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        await fetchPostings();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save career posting');
      }
    } catch (err) {
      setError('Error saving career posting');
      console.error(err);
    }
  };

  const handleIconChange = (iconValue: string) => {
    const selectedIcon = ICON_OPTIONS.find(opt => opt.value === iconValue);
    if (selectedIcon) {
      setFormData(prev => ({
        ...prev,
        icon: selectedIcon.value,
        icon_bg: selectedIcon.bg,
        icon_color: selectedIcon.color,
        btn_color: selectedIcon.btn
      }));
    }
  };

  const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#f9fafb';
  };

  const handleRowLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.backgroundColor = '#ffffff';
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      active: 'success',
      inactive: 'secondary',
      draft: 'warning'
    };
    return badges[status] || 'secondary';
  };

  // Table columns configuration
  const tableColumns: AdminTableColumn<CareerPosting>[] = useMemo(() => [
    {
      key: 'title',
      label: 'Job Title',
      render: (value) => (
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937', whiteSpace: 'nowrap' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (value) => (
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => (
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (value) => {
        const status = String(value);
        return (
          <span className={`badge bg-${getStatusBadge(status)}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'posted_date',
      label: 'Posted Date',
      align: 'center',
      render: (value) => (
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {new Date(String(value)).toLocaleDateString('en-MY')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      width: '140px',
      render: (_, row: CareerPosting) => (
        <AdminTableActions 
          actions={[
            actionPresets.view(() => handleView(row)),
            ...(hasPermission('career_edit') ? [actionPresets.edit(() => handleEdit(row))] : []),
            ...(hasPermission('career_delete') ? [actionPresets.delete(() => handleDelete(row.id))] : [])
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
          <p className="text-muted mt-3" style={{ fontSize: '12px' }}>Loading career postings...</p>
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
            Career Management
          </h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Manage job postings and career opportunities
          </p>
        </div>
        <div className="d-flex gap-2">
          {hasPermission('career_create') && (
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
              Create Posting
            </button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <form className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, department, or location..."
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
        <div className="col-md-4">
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
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
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
              fontWeight: 500
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div style={{ marginBottom: '24px' }}>
        <AdminTable<CareerPosting>
          columns={tableColumns}
          data={paginatedPostings}
          emptyMessage="No career postings found."
          onRowHover={handleRowHover}
          onRowLeave={handleRowLeave}
        />
      </div>

      {/* Pagination */}
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Showing {filteredPostings.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredPostings.length)} of {filteredPostings.length} postings
        </div>
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Modal - To be continued in next part */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl" style={{ maxWidth: '1200px', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ fontSize: '11px', maxHeight: 'calc(100vh - 3.5rem)', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '12px 16px', flexShrink: 0 }}>
                <h5 className="modal-title" style={{ fontSize: '13px', fontWeight: 500 }}>
                  {modalMode === 'view' ? 'View Career Posting' : modalMode === 'edit' ? 'Edit Career Posting' : 'Create Career Posting'}
                </h5>
                <button type="button" className="btn-close" style={{ fontSize: '10px' }} onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
                  {/* Basic Information */}
                  <h6 className="mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>Basic Information</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Job Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="e.g., IT Engineer"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Department *</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="e.g., ICT Engineering"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Location</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={modalMode === 'view'}
                        placeholder="e.g., Selangor"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Job Type</label>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.job_type}
                        onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                        disabled={modalMode === 'view'}
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Employment Type</label>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                        disabled={modalMode === 'view'}
                      >
                        <option value="Permanent">Permanent</option>
                        <option value="Contract">Contract</option>
                        <option value="Temporary">Temporary</option>
                      </select>
                    </div>
                  </div>

                  {/* Salary Information */}
                  <h6 className="mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>Salary & Experience</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Min Salary (RM)</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.salary_min}
                        onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                        disabled={modalMode === 'view'}
                        placeholder="4500"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Max Salary (RM)</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.salary_max}
                        onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                        disabled={modalMode === 'view'}
                        placeholder="7000"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Salary Notes</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.salary_notes}
                        onChange={(e) => setFormData({ ...formData, salary_notes: e.target.value })}
                        disabled={modalMode === 'view'}
                        placeholder="e.g., + Commission"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Min Experience (Years)</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.experience_min}
                        onChange={(e) => setFormData({ ...formData, experience_min: e.target.value })}
                        disabled={modalMode === 'view'}
                        placeholder="2"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Max Experience (Years)</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.experience_max}
                        onChange={(e) => setFormData({ ...formData, experience_max: e.target.value })}
                        disabled={modalMode === 'view'}
                        placeholder="5"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Experience Level</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.experience_level}
                        onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                        disabled={modalMode === 'view'}
                        placeholder="e.g., Mid Level (2-5 years)"
                      />
                    </div>
                  </div>

                  {/* Icon & Styling */}
                  <h6 className="mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>Icon & Styling</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-12">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>
                        Select Icon & Button Color Theme
                        <small className="text-muted d-block" style={{ fontSize: '10px', fontWeight: 400 }}>
                          This will set the icon, background color, and "View Details" button color
                        </small>
                      </label>
                      <div className="d-flex flex-wrap gap-2">
                        {ICON_OPTIONS.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            className={`btn btn-sm ${formData.icon === option.value ? option.btn : 'btn-outline-secondary'}`}
                            style={{ fontSize: '11px', padding: '6px 12px' }}
                            onClick={() => handleIconChange(option.value)}
                            disabled={modalMode === 'view'}
                          >
                            <i className={`bi ${option.value} me-2`}></i>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Job Overview - Rich Text Editor */}
                  <h6 className="mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>Job Overview *</h6>
                  <div className="mb-4">
                    <TinyMCEWrapper
                      value={formData.overview}
                      onChange={(data) => setFormData({ ...formData, overview: data })}
                      disabled={modalMode === 'view'}
                      placeholder="Enter job overview..."
                    />
                  </div>

                  {/* Key Responsibilities - Rich Text Editor */}
                  <h6 className="mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>Key Responsibilities *</h6>
                  <div className="mb-4">
                    <TinyMCEWrapper
                      value={formData.responsibilities}
                      onChange={(data) => setFormData({ ...formData, responsibilities: data })}
                      disabled={modalMode === 'view'}
                      placeholder="Enter key responsibilities..."
                    />
                  </div>

                  {/* Requirements - Rich Text Editor */}
                  <h6 className="mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>Requirements *</h6>
                  <div className="mb-4">
                    <TinyMCEWrapper
                      value={formData.requirements}
                      onChange={(data) => setFormData({ ...formData, requirements: data })}
                      disabled={modalMode === 'view'}
                      placeholder="Enter requirements..."
                    />
                  </div>

                  {/* Benefits - Rich Text Editor */}
                  <h6 className="mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>What We Offer (Benefits) *</h6>
                  <div className="mb-4">
                    <TinyMCEWrapper
                      value={formData.benefits}
                      onChange={(data) => setFormData({ ...formData, benefits: data })}
                      disabled={modalMode === 'view'}
                      placeholder="Enter benefits..."
                    />
                  </div>

                  {/* Status & Dates */}
                  <h6 className="mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>Status & Dates</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Status</label>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        disabled={modalMode === 'view'}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Posted Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.posted_date}
                        onChange={(e) => setFormData({ ...formData, posted_date: e.target.value })}
                        required
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500 }}>Closing Date (Optional)</label>
                      <input
                        type="date"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.closing_date}
                        onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '12px 16px', flexShrink: 0 }}>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  {modalMode !== 'view' && (
                    <button type="submit" className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }}>
                      {modalMode === 'edit' ? 'Update' : 'Create'} Posting
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

