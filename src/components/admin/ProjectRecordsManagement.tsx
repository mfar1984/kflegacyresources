'use client';

import { useState, useEffect } from 'react';
import Pagination from '@/components/Pagination';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';

interface ProjectAttachment {
  id: number;
  filename: string;
  original_name: string;
  size: number;
  uploaded_at: string;
}

interface Project {
  id: number;
  title: string;
  client: string;
  sector: 'Government' | 'Private';
  category: string;
  year: number;
  location: string;
  value: string;
  status: 'planning' | 'ongoing' | 'completed' | 'on-hold';
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  attachments?: ProjectAttachment[];
  created_at: string;
}

interface ProjectRecordsManagementProps {
  sessionHash: string;
}

export default function ProjectRecordsManagement({ sessionHash }: ProjectRecordsManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [allProjects, setAllProjects] = useState<Project[]>([]); // Store all projects
  const [projects, setProjects] = useState<Project[]>([]); // Display filtered projects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    sector: 'Private' as Project['sector'],
    category: '',
    year: new Date().getFullYear(),
    location: '',
    value: '',
    status: 'completed' as Project['status'],
    start_date: '',
    end_date: '',
    description: ''
  });
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<ProjectAttachment[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  
  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPermissions();
    fetchProjects(); // Fetch once on mount
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

  // Fetch all projects from API (once)
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/projects?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setAllProjects(data.projects || []);
        // Initial display without filters
        applyFiltersAndPagination(data.projects || [], '', '', 1);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('Error fetching projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filtering and pagination
  const applyFiltersAndPagination = (
    sourceProjects: Project[], 
    search: string, 
    status: string, 
    currentPage: number
  ) => {
    let filtered = [...sourceProjects];
    
    // Apply search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter((project: Project) => 
        project.title.toLowerCase().includes(query) || 
        project.client.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (status) {
      filtered = filtered.filter((project: Project) => project.status === status);
    }
    
    // Update totals
    setTotal(filtered.length);
    const pages = Math.ceil(filtered.length / pageSize);
    setTotalPages(pages);
    
    // Apply pagination
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginated = filtered.slice(startIdx, endIdx);
    
    setProjects(paginated);
  };

  // Apply filters when search, status, or page changes
  useEffect(() => {
    if (allProjects.length > 0) {
      applyFiltersAndPagination(allProjects, searchQuery, statusFilter, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, page]);

  // Reset to page 1 when filters change (but not on first mount)
  useEffect(() => {
    if (allProjects.length > 0) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter]);

  const handleCreate = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      client: '',
      sector: 'Private',
      category: '',
      year: new Date().getFullYear(),
      location: '',
      value: '',
      status: 'completed',
      start_date: '',
      end_date: '',
      description: ''
    });
    setUploadFiles([]);
    setExistingAttachments([]);
    setShowModal(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      client: project.client,
      sector: project.sector,
      category: project.category,
      year: project.year,
      location: project.location,
      value: project.value,
      status: project.status,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      description: project.description || ''
    });
    setUploadFiles([]);
    setExistingAttachments(project.attachments || []);
    setShowModal(true);
  };

  const handleView = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project record?')) return;

    try {
      const response = await fetch(`/api/admin/projects/${projectId}?hash=${sessionHash}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProjects();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete project');
      }
    } catch (err) {
      setError('Error deleting project');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Step 1: Create/Update project data
      const url = editingProject
        ? `/api/admin/projects/${editingProject.id}?hash=${sessionHash}`
        : `/api/admin/projects?hash=${sessionHash}`;
      
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const projectId = editingProject ? editingProject.id : data.project_id;
        
        // Step 2: Upload attachments if any
        if (uploadFiles.length > 0 && projectId) {
          const formDataUpload = new FormData();
          formDataUpload.append('project_id', projectId.toString());
          uploadFiles.forEach((file) => {
            formDataUpload.append('files', file);
          });

          const uploadResponse = await fetch(`/api/admin/projects/attachments?hash=${sessionHash}`, {
            method: 'POST',
            body: formDataUpload,
          });

          if (!uploadResponse.ok) {
            console.error('Failed to upload attachments');
            setError('Project saved but some attachments failed to upload');
          }
        }

        setShowModal(false);
        await fetchProjects();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save project');
      }
    } catch (err) {
      setError('Error saving project');
      console.error(err);
    }
  };

  const getStatusBadge = (status: Project['status']) => {
    const config: Record<Project['status'], { bg: string; text: string; label: string }> = {
      planning: { bg: '#fef3c7', text: '#92400e', label: 'Planning' },
      ongoing: { bg: '#e0e7ff', text: '#3730a3', label: 'Ongoing' },
      completed: { bg: '#d1fae5', text: '#065f46', label: 'Completed' },
      'on-hold': { bg: '#fee2e2', text: '#991b1b', label: 'On Hold' },
    };

    const c = config[status];
    return (
      <span style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        fontSize: '11px',
        fontWeight: 500,
        borderRadius: '9999px',
        backgroundColor: c.bg,
        color: c.text
      }}>
        {c.label}
      </span>
    );
  };

  const formatCurrency = (amount: string) => {
    // Already formatted from database
    return amount;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
          <p className="text-muted mt-3" style={{ fontSize: '12px' }}>Loading project records...</p>
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
            Project Records
          </h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Manage project records and documentation
          </p>
        </div>
        <div className="d-flex gap-2">
          {hasPermission('projects_create') && (
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
              Create Project
            </button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <form className="row g-3 mb-4">
        {/* Search */}
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search title, client or location..."
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
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-outline-danger w-100"
            onClick={() => {
              setSearchQuery('');
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
                Project
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
                Client
              </th>
              <th scope="col" style={{ 
                padding: '10px 16px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'right',
                borderBottom: '1px solid #d1d5db'
              }}>
                Value
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
                textAlign: 'center',
                borderBottom: '1px solid #d1d5db',
                width: '140px'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff', position: 'relative' }}>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center" style={{ 
                  padding: '48px 24px',
                  color: '#6b7280', 
                  fontSize: '12px',
                  borderBottom: 'none'
                }}>
                  No project records found. Create your first project.
                </td>
              </tr>
            ) : (
              projects.map(project => (
                <tr 
                  key={project.id}
                  onMouseEnter={handleRowHover}
                  onMouseLeave={handleRowLeave}
                  style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.15s'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937', marginBottom: '2px' }}>
                      {project.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {project.location}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', color: '#1f2937' }}>
                      {project.client}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                      {formatCurrency(project.value)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {getStatusBadge(project.status)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative', whiteSpace: 'nowrap' }}>
                    {/* View - projects_view permission */}
                    {hasPermission('projects_view') && (
                      <button 
                        onClick={() => handleView(project)}
                        style={{ 
                          background: 'transparent',
                          border: 'none',
                          color: '#6b7280',
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
                    )}
                    {/* Edit - projects_edit permission */}
                    {hasPermission('projects_edit') && (
                      <button 
                        onClick={() => handleEdit(project)}
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
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          edit
                        </span>
                      </button>
                    )}
                    {/* Delete - projects_delete permission */}
                    {hasPermission('projects_delete') && (
                      <button 
                        onClick={() => handleDelete(project.id)}
                        style={{ 
                          background: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '4px 6px'
                        }}
                        title="Delete"
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

      {/* Pagination */}
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {total > 0 ? Math.min(page * pageSize, total) : 0} of {total} projects
        </div>
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg" style={{ maxWidth: '700px', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ fontSize: '11px', maxHeight: 'calc(100vh - 3.5rem)', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '12px 16px', flexShrink: 0 }}>
                <h5 className="modal-title" style={{ fontSize: '13px', fontWeight: 500 }}>
                  {editingProject ? 'Edit Project' : 'Create Project'}
                </h5>
                <button type="button" className="btn-close" style={{ fontSize: '10px' }} onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Project Title</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Client</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Sector</label>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value as Project['sector'] })}
                        required
                      >
                        <option value="Government">Government</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Category</label>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="ICT Engineering">ICT Engineering</option>
                        <option value="Mechanical & Electrical Engineering">Mechanical & Electrical Engineering</option>
                        <option value="Project Management & Consultancy">Project Management & Consultancy</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Year</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        min="2000"
                        max={new Date().getFullYear() + 5}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Location</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Project Value</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        placeholder="e.g., RM 14,400.00"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        required
                      />
                      <small style={{ fontSize: '10px', color: '#6b7280' }}>Format: RM 14,400.00</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Status</label>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                        required
                      >
                        <option value="planning">Planning</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Start Date (Optional)</label>
                      <input
                        type="date"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>End Date (Optional)</label>
                      <input
                        type="date"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Description (Optional)</label>
                      <textarea
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                    
                    {/* Attachments Section */}
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                        Attachments (Optional)
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            setUploadFiles(Array.from(e.target.files));
                          }
                        }}
                      />
                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                        You can select multiple files. Maximum 10MB per file.
                      </div>
                      
                      {/* Show selected files to upload */}
                      {uploadFiles.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
                            Files to Upload ({uploadFiles.length})
                          </div>
                          {uploadFiles.map((file, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '6px 10px', 
                              backgroundColor: '#eff6ff', 
                              borderRadius: '4px',
                              marginBottom: '4px',
                              border: '1px solid #dbeafe'
                            }}>
                              <i className="bi bi-file-earmark-plus" style={{ fontSize: '14px', color: '#3b82f6', marginRight: '8px' }}></i>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', color: '#1f2937', fontWeight: 500 }}>{file.name}</div>
                                <div style={{ fontSize: '9px', color: '#6b7280' }}>
                                  {(file.size / 1024).toFixed(2)} KB
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm"
                                style={{ padding: '2px 6px', fontSize: '9px', border: 'none', backgroundColor: 'transparent', color: '#dc2626' }}
                                onClick={() => {
                                  setUploadFiles(uploadFiles.filter((_, i) => i !== idx));
                                }}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show existing attachments when editing */}
                      {editingProject && existingAttachments.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
                            Existing Attachments ({existingAttachments.length})
                          </div>
                          {existingAttachments.map((file, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '6px 10px', 
                              backgroundColor: '#f9fafb', 
                              borderRadius: '4px',
                              marginBottom: '4px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <i className="bi bi-file-earmark-text" style={{ fontSize: '14px', color: '#6b7280', marginRight: '8px' }}></i>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', color: '#1f2937', fontWeight: 500 }}>{file.original_name}</div>
                                <div style={{ fontSize: '9px', color: '#6b7280' }}>
                                  {(file.size / 1024).toFixed(2)} KB
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm"
                                style={{ padding: '2px 6px', fontSize: '9px', border: 'none', backgroundColor: 'transparent', color: '#dc2626' }}
                                onClick={async () => {
                                  if (confirm('Delete this attachment?')) {
                                    try {
                                      const response = await fetch(`/api/admin/projects/attachment/${file.id}?hash=${sessionHash}`, {
                                        method: 'DELETE',
                                      });
                                      if (response.ok) {
                                        setExistingAttachments(existingAttachments.filter((_, i) => i !== idx));
                                      } else {
                                        alert('Failed to delete attachment');
                                      }
                                    } catch (err) {
                                      console.error('Error deleting attachment:', err);
                                      alert('Error deleting attachment');
                                    }
                                  }
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '12px 16px', flexShrink: 0, backgroundColor: '#fff' }}>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 14px' }} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 14px' }}>
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg" style={{ maxWidth: '700px', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ fontSize: '11px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '12px 16px' }}>
                <h5 className="modal-title" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Project Details
                </h5>
                <button type="button" className="btn-close" style={{ fontSize: '10px' }} onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body" style={{ padding: '16px' }}>
                <div className="row g-3">
                  {/* Row 1: Summary left | Meta right */}
                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-journal-text me-2"></i>Project Summary
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Title</td><td><strong>{selectedProject.title}</strong></td></tr>
                            <tr><td className="text-muted">Client</td><td>{selectedProject.client}</td></tr>
                            <tr><td className="text-muted">Sector</td><td>{selectedProject.sector}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-clipboard-data me-2"></i>Project Meta
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Category</td><td>{selectedProject.category}</td></tr>
                            <tr><td className="text-muted">Year</td><td>{selectedProject.year}</td></tr>
                            <tr><td className="text-muted">Location</td><td>{selectedProject.location}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Financial & Status | Schedule */}
                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-cash-coin me-2"></i>Financial & Status
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Value</td><td>{formatCurrency(selectedProject.value)}</td></tr>
                            <tr><td className="text-muted">Status</td><td>{getStatusBadge(selectedProject.status)}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex">
                    <div className="card w-100 h-100 mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-calendar-event me-2"></i>Schedule
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><td className="text-muted" style={{ width: '40%' }}>Start Date</td><td>{selectedProject.start_date ? formatDate(selectedProject.start_date) : 'Not set'}</td></tr>
                            <tr><td className="text-muted">End Date</td><td>{selectedProject.end_date ? formatDate(selectedProject.end_date) : 'Not set'}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Description full width */}
                  <div className="col-12">
                    <div className="card mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-card-text me-2"></i>Description
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {selectedProject.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Attachments full width */}
                  <div className="col-12">
                    <div className="card mb-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-paperclip me-2"></i>Attachments
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        {selectedProject.attachments && selectedProject.attachments.length > 0 ? (
                          <div className="row g-2">
                            {selectedProject.attachments.map((file: { id: number; filename: string; original_name: string; size: number; uploaded_at: string }, idx: number) => (
                              <div className="col-12" key={idx}>
                                <a
                                  href={`/api/admin/projects/attachment/${file.id}?hash=${sessionHash}`}
                                  download={file.original_name}
                                  className="d-inline-flex align-items-center text-decoration-none"
                                  style={{ fontSize: '12px', color: '#1d4ed8' }}
                                >
                                  <i className="bi bi-file-earmark-text me-2" style={{ color: '#6b7280' }}></i>
                                  {file.original_name}
                                  <span className="text-muted ms-2" style={{ fontSize: '10px' }}>({(file.size / 1024).toFixed(2)} KB)</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted">No attachments</div>
                        )}
                      </div>
                    </div>
                  </div>
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

