'use client';

import { useEffect, useState } from 'react';
import { AdminTable, AdminTableColumn } from './AdminTable';
import { AdminTableActions, actionPresets } from './AdminTableActions';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';

interface AchievementAward {
  id: number;
  award_name: string;
  category: string;
  issuer: string;
  file_type: string;
  file_size: string;
  description: string;
  file_path: string;
  is_active: number;
  created_at: string;
}

interface AchievementAwardsManagementProps {
  sessionHash: string;
}

export default function AchievementAwardsManagement({ sessionHash }: AchievementAwardsManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [awards, setAwards] = useState<AchievementAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    award_name: '',
    category: '',
    issuer: '',
    description: '',
    is_active: 1
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAwards();
  }, [sessionHash]);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/achievement-awards?hash=${sessionHash}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievement awards');
      }
      
      const data = await response.json();
      setAwards(data.awards || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching awards:', err);
      setError('Failed to load achievement awards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      award_name: '',
      category: '',
      issuer: '',
      description: '',
      is_active: 1
    });
    setSelectedFiles([]);
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleEdit = (award: AchievementAward) => {
    setIsEditing(true);
    setCurrentId(award.id);
    setFormData({
      award_name: award.award_name,
      category: award.category,
      issuer: award.issuer,
      description: award.description,
      is_active: award.is_active
    });
    setSelectedFiles([]);
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Validate file types (PDF only)
      const invalidFiles = filesArray.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext !== 'pdf';
      });
      
      if (invalidFiles.length > 0) {
        alert('Only PDF files are allowed!');
        e.target.value = '';
        return;
      }
      
      // Validate file sizes (max 20MB each)
      const oversizedFiles = filesArray.filter(file => file.size > 20 * 1024 * 1024);
      
      if (oversizedFiles.length > 0) {
        alert('Each file must be less than 20MB!');
        e.target.value = '';
        return;
      }
      
      setSelectedFiles(filesArray);
      
      // Auto-fill award name if empty (use first file name)
      if (!formData.award_name && filesArray.length > 0) {
        const nameWithoutExt = filesArray[0].name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, award_name: nameWithoutExt }));
      }
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing && selectedFiles.length === 0) {
      alert('Please select at least one PDF file to upload');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('award_name', formData.award_name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('issuer', formData.issuer);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('is_active', formData.is_active.toString());
      
      // Append multiple files
      selectedFiles.forEach((file) => {
        formDataToSend.append('files', file);
      });

      const url = isEditing 
        ? `/api/admin/achievement-awards/${currentId}?hash=${sessionHash}`
        : `/api/admin/achievement-awards?hash=${sessionHash}`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save achievement award');
      }

      setUploadProgress(100);
      await fetchAwards();
      setShowModal(false);
      setFormData({
        award_name: '',
        category: '',
        issuer: '',
        description: '',
        is_active: 1
      });
      setSelectedFiles([]);
    } catch (err) {
      console.error('Error saving award:', err);
      alert(err instanceof Error ? err.message : 'Failed to save achievement award');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this achievement award?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/achievement-awards/${id}?hash=${sessionHash}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete award');
      }

      await fetchAwards();
    } catch (err) {
      console.error('Error deleting award:', err);
      alert('Failed to delete achievement award');
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('government') || cat.includes('kerajaan')) {
      return { icon: 'bi-trophy', color: '#eab308' };
    }
    if (cat.includes('private') || cat.includes('swasta')) {
      return { icon: 'bi-award', color: '#3b82f6' };
    }
    if (cat.includes('international') || cat.includes('antarabangsa')) {
      return { icon: 'bi-globe', color: '#10b981' };
    }
    if (cat.includes('industry') || cat.includes('industri')) {
      return { icon: 'bi-star', color: '#8b5cf6' };
    }
    return { icon: 'bi-patch-check', color: '#6b7280' };
  };

  const columns: AdminTableColumn<AchievementAward>[] = [
    {
      key: 'award_name',
      label: 'Award',
      render: (_, award) => {
        const iconStyle = getCategoryIcon(award.category);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className={`bi ${iconStyle.icon}`} style={{ fontSize: '24px', color: iconStyle.color }}></i>
            <div>
              <div style={{ fontWeight: 500, fontSize: '12px' }}>{award.award_name}</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>{award.file_type} • {award.file_size}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'issuer',
      label: 'Issuer',
      render: (_, award) => (
        <div style={{ fontSize: '11px', color: '#374151' }}>
          {award.issuer}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (_, award) => (
        <span className="badge bg-primary" style={{ fontSize: '10px' }}>
          {award.category}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (_, award) => (
        <div style={{ fontSize: '11px', color: '#6b7280', maxWidth: '250px' }}>
          {award.description}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (_, award) => (
        <span className={`badge ${award.is_active ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '10px' }}>
          {award.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      width: '140px',
      render: (_, row: AchievementAward) => (
        <AdminTableActions
          actions={[
            ...(canPerformAction('achievement', 'edit') ? [actionPresets.edit(() => handleEdit(row))] : []),
            ...(canPerformAction('achievement', 'delete') ? [actionPresets.delete(() => handleDelete(row.id))] : [])
          ]}
        />
      )
    }
  ];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = awards.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(awards.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div>
          <h5 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
            Achievement Awards Management
          </h5>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
            Manage recognition letters from government, private sector, and other organizations
          </p>
        </div>
        <PermissionButton
          sessionHash={sessionHash}
          module="achievement"
          action="create"
          className="btn btn-primary btn-sm"
          style={{ fontSize: '11px', padding: '6px 16px' }}
          onClick={handleCreate}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Add Achievement Award
        </PermissionButton>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-trophy text-warning" style={{ fontSize: '28px' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Total Awards</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>{awards.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '28px' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Active</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                    {awards.filter(a => a.is_active).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-x-circle text-secondary" style={{ fontSize: '28px' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Inactive</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                    {awards.filter(a => !a.is_active).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-tags text-info" style={{ fontSize: '28px' }}></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Categories</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                    {new Set(awards.map(a => a.category)).size}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={currentItems}
        emptyMessage="No achievement awards found"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, awards.length)} of {awards.length} entries
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => paginate(currentPage - 1)} style={{ fontSize: '11px' }}>
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => paginate(index + 1)} style={{ fontSize: '11px' }}>
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => paginate(currentPage + 1)} style={{ fontSize: '11px' }}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
                <h6 className="modal-title" style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                  {isEditing ? 'Edit Achievement Award' : 'Add New Achievement Award'}
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  style={{ fontSize: '10px' }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ padding: '20px' }}>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                      Award Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '11px', padding: '8px 12px' }}
                      value={formData.award_name}
                      onChange={(e) => setFormData({ ...formData, award_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      style={{ fontSize: '11px', padding: '8px 12px' }}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Government">Government / Kerajaan</option>
                      <option value="Private Sector">Private Sector / Swasta</option>
                      <option value="International">International / Antarabangsa</option>
                      <option value="Industry">Industry / Industri</option>
                      <option value="Excellence">Excellence / Kecemerlangan</option>
                      <option value="Innovation">Innovation / Inovasi</option>
                      <option value="Other">Other / Lain-lain</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                      Issuer / Issued By <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '11px', padding: '8px 12px' }}
                      placeholder="e.g., Ministry of Works, Industry Association"
                      value={formData.issuer}
                      onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      style={{ fontSize: '11px', padding: '8px 12px' }}
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                      Award Files {!isEditing && <span className="text-danger">*</span>}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      style={{ fontSize: '11px', padding: '8px 12px' }}
                      onChange={handleFileChange}
                      accept=".pdf"
                      multiple
                      required={!isEditing}
                    />
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                      Accepted format: PDF only (Max 20MB per file, multiple files allowed)
                    </div>
                    {selectedFiles.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        {selectedFiles.map((file, index) => (
                          <div key={index} style={{ 
                            fontSize: '10px', 
                            color: '#059669', 
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '4px'
                          }}>
                            <span>
                              <i className="bi bi-file-earmark-pdf me-1"></i>
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => removeFile(index)}
                              style={{ fontSize: '10px' }}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      className="form-select"
                      style={{ fontSize: '11px', padding: '8px 12px' }}
                      value={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 20px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    style={{ fontSize: '11px', padding: '6px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSubmitting}
                    style={{ fontSize: '11px', padding: '6px 16px' }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1"></i>
                        {isEditing ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

