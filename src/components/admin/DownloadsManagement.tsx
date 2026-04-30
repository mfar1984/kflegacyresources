'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminTable, AdminTableColumn } from './AdminTable';
import { AdminTableActions, actionPresets } from './AdminTableActions';
import Pagination from '../Pagination';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';

interface Download {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: string;
  description: string;
  download_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DownloadLog {
  id: number;
  client_name: string;
  client_email: string;
  ip_address: string;
  user_agent: string;
  status: string;
  downloaded_at: string;
}

interface DownloadsManagementProps {
  sessionHash: string;
}

export default function DownloadsManagement({ sessionHash }: DownloadsManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDownload, setSelectedDownload] = useState<Download | null>(null);
  
  // View modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewDownload, setViewDownload] = useState<Download | null>(null);
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    file_name: '',
    file_type: 'PDF',
    file_size: '',
    description: '',
    is_active: true
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDownloads();
  }, [sessionHash]);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/downloads?hash=${sessionHash}`);
      if (!response.ok) throw new Error('Failed to fetch downloads');
      const data = await response.json();
      setDownloads(data.downloads);
      setError('');
    } catch (err) {
      setError('Failed to load downloads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      file_name: '',
      file_type: 'PDF',
      file_size: '',
      description: '',
      is_active: true
    });
    setFile(null);
    setShowModal(true);
  };

  const handleEdit = (download: Download) => {
    setModalMode('edit');
    setSelectedDownload(download);
    setFormData({
      file_name: download.file_name,
      file_type: download.file_type,
      file_size: download.file_size,
      description: download.description,
      is_active: download.is_active
    });
    setFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this download?')) return;
    
    try {
      const response = await fetch(`/api/admin/downloads/${id}?hash=${sessionHash}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete download');
      
      await fetchDownloads();
      alert('Download deleted successfully');
    } catch (err) {
      alert('Failed to delete download');
      console.error(err);
    }
  };

  const handleView = async (download: Download) => {
    setViewDownload(download);
    setShowViewModal(true);
    setLogsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/downloads/${download.id}/logs?hash=${sessionHash}`);
      if (response.ok) {
        const data = await response.json();
        setDownloadLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching download logs:', err);
      setDownloadLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('file_name', formData.file_name);
    data.append('file_type', formData.file_type);
    data.append('file_size', formData.file_size);
    data.append('description', formData.description);
    data.append('is_active', formData.is_active.toString());
    
    if (file) {
      data.append('file', file);
    }

    try {
      const url = modalMode === 'create' 
        ? `/api/admin/downloads?hash=${sessionHash}`
        : `/api/admin/downloads/${selectedDownload?.id}?hash=${sessionHash}`;
      
      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        body: data
      });

      if (!response.ok) throw new Error(`Failed to ${modalMode} download`);

      await fetchDownloads();
      setShowModal(false);
      alert(`Download ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (err) {
      alert(`Failed to ${modalMode} download`);
      console.error(err);
    }
  };

  const filteredDownloads = useMemo(() => {
    return downloads.filter(download => {
      const matchesSearch = download.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          download.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || download.file_type === typeFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && download.is_active) ||
                           (statusFilter === 'inactive' && !download.is_active);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [downloads, searchQuery, typeFilter, statusFilter]);

  const paginatedDownloads = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredDownloads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDownloads, page]);

  const totalPages = Math.ceil(filteredDownloads.length / itemsPerPage);

  const getFileIcon = (fileType: string) => {
    const icons: { [key: string]: { icon: string; color: string } } = {
      'PDF': { icon: 'bi-file-earmark-pdf', color: '#dc2626' },
      'EXE': { icon: 'bi-app-indicator', color: '#2563eb' },
      'MSI': { icon: 'bi-app-indicator', color: '#7c3aed' },
      'ZIP': { icon: 'bi-file-earmark-zip', color: '#ea580c' },
      'RAR': { icon: 'bi-file-earmark-zip', color: '#6b7280' },
      'ISO': { icon: 'bi-disc', color: '#8b5cf6' },
      'DMG': { icon: 'bi-apple', color: '#6b7280' },
      'PNG': { icon: 'bi-file-earmark-image', color: '#ec4899' },
      'JPEG': { icon: 'bi-file-earmark-image', color: '#f97316' },
      'JPG': { icon: 'bi-file-earmark-image', color: '#f59e0b' },
      'XLSX': { icon: 'bi-file-earmark-excel', color: '#16a34a' },
      'DOCX': { icon: 'bi-file-earmark-word', color: '#0891b2' },
      'PPTX': { icon: 'bi-file-earmark-ppt', color: '#ea580c' },
    };
    return icons[fileType] || { icon: 'bi-file-earmark', color: '#6b7280' };
  };

  const columns: AdminTableColumn<Download>[] = [
    {
      key: 'file_name',
      label: 'File',
      render: (_, download) => {
        const iconStyle = getFileIcon(download.file_type);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className={`bi ${iconStyle.icon}`} style={{ fontSize: '24px', color: iconStyle.color }}></i>
            <div>
              <div style={{ fontWeight: 500, fontSize: '12px' }}>{download.file_name}</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>{download.file_type} • {download.file_size}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'description',
      label: 'Description',
      render: (_, download) => (
        <div style={{ fontSize: '11px', color: '#6b7280', maxWidth: '300px' }}>
          {download.description}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (_, download) => (
        <span className={`badge ${download.is_active ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '10px' }}>
          {download.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'download_hash',
      label: 'Downloads',
      render: (_, download) => (
        <div style={{ fontSize: '11px', color: '#6b7280' }}>
          {download.download_hash ? 'Available' : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      width: '140px',
      render: (_, row: Download) => (
        <AdminTableActions 
          actions={[
            actionPresets.view(() => handleView(row)),
            ...(canPerformAction('downloads', 'update') ? [actionPresets.edit(() => handleEdit(row))] : []),
            ...(canPerformAction('downloads', 'delete') ? [actionPresets.delete(() => handleDelete(row.id))] : [])
          ]}
        />
      )
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0 }}>Downloads Management</h1>
        <PermissionButton
          sessionHash={sessionHash}
          module="downloads"
          action="create"
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '8px 16px' }}
          onClick={handleCreate}
        >
          <i className="bi bi-plus-circle me-2"></i>Add Download
        </PermissionButton>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ fontSize: '12px' }}>
          {error}
        </div>
      )}

      <div className="card shadow-sm mb-4" style={{ borderRadius: '2px' }}>
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search downloads..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                style={{ fontSize: '12px' }}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                style={{ fontSize: '12px' }}
              >
                <option value="all">All Types</option>
                <option value="PDF">PDF</option>
                <option value="EXE">EXE</option>
                <option value="ZIP">ZIP</option>
                <option value="RAR">RAR</option>
                <option value="XLSX">XLSX</option>
                <option value="DOCX">DOCX</option>
                <option value="PPTX">PPTX</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ fontSize: '12px' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button onClick={fetchDownloads} className="btn btn-outline-secondary w-100" style={{ fontSize: '12px' }}>
                <i className="bi bi-arrow-clockwise me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <AdminTable
            data={paginatedDownloads}
            columns={columns}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}

          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '16px' }}>
            Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredDownloads.length)} of {filteredDownloads.length} entries
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: '16px' }}>
                  {modalMode === 'create' ? 'Add New Download' : 'Edit Download'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>File Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.file_name}
                      onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                      required
                      style={{ fontSize: '12px' }}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>File Type</label>
                      <select
                        className="form-select"
                        value={formData.file_type}
                        onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                        required
                        style={{ fontSize: '12px' }}
                      >
                        <option value="">Select File Type</option>
                        <option value="PDF">PDF</option>
                        <option value="EXE">EXE</option>
                        <option value="MSI">MSI</option>
                        <option value="ZIP">ZIP</option>
                        <option value="RAR">RAR</option>
                        <option value="ISO">ISO</option>
                        <option value="DMG">DMG</option>
                        <option value="PNG">PNG</option>
                        <option value="JPEG">JPEG</option>
                        <option value="JPG">JPG</option>
                        <option value="XLSX">XLSX</option>
                        <option value="DOCX">DOCX</option>
                        <option value="PPTX">PPTX</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>File Size</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-detected from file"
                        value={formData.file_size}
                        readOnly
                        disabled
                        style={{ fontSize: '12px', backgroundColor: '#f8f9fa' }}
                      />
                      <small className="text-muted" style={{ fontSize: '10px' }}>
                        File size will be automatically detected when you upload a file
                      </small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      style={{ fontSize: '12px' }}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>Upload File</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          setFile(selectedFile);
                          
                          // Auto-detect file type
                          const fileExt = selectedFile.name.split('.').pop()?.toUpperCase() || '';
                          
                          // Auto-detect file size
                          const fileSizeInBytes = selectedFile.size;
                          let fileSizeStr = '';
                          
                          if (fileSizeInBytes < 1024) {
                            fileSizeStr = `${fileSizeInBytes} B`;
                          } else if (fileSizeInBytes < 1024 * 1024) {
                            fileSizeStr = `${(fileSizeInBytes / 1024).toFixed(2)} KB`;
                          } else if (fileSizeInBytes < 1024 * 1024 * 1024) {
                            fileSizeStr = `${(fileSizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
                          } else {
                            fileSizeStr = `${(fileSizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
                          }
                          
                          // Update form data
                          setFormData(prev => ({
                            ...prev,
                            file_type: fileExt,
                            file_size: fileSizeStr,
                            file_name: prev.file_name || selectedFile.name.replace(/\.[^/.]+$/, '')
                          }));
                        } else {
                          setFile(null);
                        }
                      }}
                      style={{ fontSize: '12px' }}
                    />
                    <small className="text-muted" style={{ fontSize: '10px' }}>
                      Upload the file - Type and size will be auto-detected
                    </small>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="is_active" style={{ fontSize: '12px' }}>
                      Active (visible to public)
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ fontSize: '12px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>
                    {modalMode === 'create' ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Download Modal */}
      {showViewModal && viewDownload && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '2px solid #e5e7eb', padding: '16px 24px' }}>
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                  <i className="bi bi-file-earmark-text me-2"></i>Download Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                {/* File Details Section */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h6 className="mb-3" style={{ fontSize: '14px', fontWeight: 600, color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                      <i className="bi bi-info-circle me-2"></i>File Information
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '6px' }}>File Name</label>
                        <div style={{ fontSize: '12px', color: '#111827', fontWeight: 500 }}>{viewDownload.file_name}</div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '6px' }}>File Type</label>
                        <span className="badge bg-primary" style={{ fontSize: '11px' }}>{viewDownload.file_type}</span>
                      </div>
                      <div className="col-md-3 mb-3">
                        <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '6px' }}>File Size</label>
                        <div style={{ fontSize: '12px', color: '#111827' }}>{viewDownload.file_size}</div>
                      </div>
                      <div className="col-12 mb-3">
                        <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Description</label>
                        <div style={{ fontSize: '12px', color: '#111827' }}>{viewDownload.description}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Client Table */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h6 className="mb-3" style={{ fontSize: '14px', fontWeight: 600, color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                      <i className="bi bi-people me-2"></i>Download Client Table
                    </h6>
                    {logsLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-2 mb-0" style={{ fontSize: '11px' }}>Loading download logs...</p>
                      </div>
                    ) : downloadLogs.length === 0 ? (
                      <div className="text-center py-4">
                        <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#d1d5db' }}></i>
                        <p className="text-muted mt-2 mb-0" style={{ fontSize: '12px' }}>No download records yet</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover" style={{ marginBottom: 0 }}>
                          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            <tr>
                              <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                              <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                              <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>IP Address</th>
                              <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Agent</th>
                              <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timestamp</th>
                              <th style={{ fontSize: '11px', fontWeight: 600, color: '#374151', padding: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody style={{ backgroundColor: '#ffffff' }}>
                            {downloadLogs.map((log) => (
                              <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ fontSize: '11px', color: '#111827', padding: '12px', fontWeight: 500 }}>{log.client_name}</td>
                                <td style={{ fontSize: '11px', color: '#6b7280', padding: '12px' }}>{log.client_email}</td>
                                <td style={{ fontSize: '11px', color: '#6b7280', padding: '12px' }}>{log.ip_address}</td>
                                <td style={{ fontSize: '10px', color: '#9ca3af', padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.user_agent}>
                                  {log.user_agent}
                                </td>
                                <td style={{ fontSize: '11px', color: '#6b7280', padding: '12px' }}>
                                  {new Date(log.downloaded_at).toLocaleString('en-MY', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </td>
                                <td style={{ fontSize: '11px', padding: '12px', textAlign: 'center' }}>
                                  <span className={`badge ${log.status === 'completed' ? 'bg-success' : log.status === 'pending' ? 'bg-warning' : 'bg-danger'}`} style={{ fontSize: '10px' }}>
                                    {log.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '2px solid #e5e7eb', padding: '12px 24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowViewModal(false)}
                  style={{ fontSize: '11px', padding: '6px 16px' }}
                >
                  <i className="bi bi-x-circle me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

