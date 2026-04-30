'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminTable, AdminTableColumn } from './AdminTable';
import Pagination from '../Pagination';
import dynamic from 'next/dynamic';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionButton from './PermissionButton';
import { AdminTableActions, actionPresets } from './AdminTableActions';

const TinyMCEWrapper = dynamic(() => import('./TinyMCEWrapper'), {
  ssr: false,
  loading: () => <p style={{ fontSize: '11px' }}>Loading editor...</p>
});

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string;
  featured_image: string | null;
  gallery_images: string | null;
  read_time: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  published_date: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsManagementProps {
  sessionHash: string;
}

export default function NewsManagement({ sessionHash }: NewsManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    tags: '',
    read_time: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_featured: false,
    published_date: ''
  });

  const [files, setFiles] = useState({
    featured_image: null as File | null,
    gallery_images: null as FileList | null
  });

  useEffect(() => {
    fetchArticles();
  }, [sessionHash]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/news?hash=${sessionHash}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      setArticles(data);
      setError('');
    } catch (err) {
      setError('Failed to load articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: '',
      category: '',
      tags: '',
      read_time: '',
      status: 'draft',
      is_featured: false,
      published_date: ''
    });
    setFiles({ featured_image: null, gallery_images: null });
    setShowModal(true);
  };

  const handleView = (article: NewsArticle) => {
    setModalMode('view');
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      category: article.category,
      tags: article.tags || '',
      read_time: article.read_time || '',
      status: article.status,
      is_featured: article.is_featured,
      published_date: article.published_date || ''
    });
    setFiles({ featured_image: null, gallery_images: null });
    setShowModal(true);
  };

  const handleEdit = (article: NewsArticle) => {
    setModalMode('edit');
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      category: article.category,
      tags: article.tags || '',
      read_time: article.read_time || '',
      status: article.status,
      is_featured: article.is_featured,
      published_date: article.published_date || ''
    });
    setFiles({ featured_image: null, gallery_images: null });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/admin/news/${id}?hash=${sessionHash}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete article');
      
      fetchArticles();
      alert('Article deleted successfully!');
    } catch (err) {
      alert('Failed to delete article');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitData.append(key, value.toString());
        }
      });

      if (files.featured_image) {
        submitData.append('featured_image', files.featured_image);
      }

      if (files.gallery_images) {
        Array.from(files.gallery_images).forEach((file) => {
          submitData.append('gallery_images', file);
        });
      }

      const url = modalMode === 'create' 
        ? `/api/admin/news?hash=${sessionHash}`
        : `/api/admin/news/${selectedArticle?.id}?hash=${sessionHash}`;

      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        body: submitData
      });

      if (!response.ok) throw new Error('Failed to save article');

      setShowModal(false);
      fetchArticles();
      alert(`Article ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
    } catch (err) {
      alert(`Failed to ${modalMode === 'create' ? 'create' : 'update'} article`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Filter and search
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [articles, searchQuery, statusFilter, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(articles.map(a => a.category)));
  }, [articles]);

  // Pagination
  const paginatedArticles = filteredArticles.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      'draft': { class: 'bg-secondary', label: 'Draft' },
      'published': { class: 'bg-success', label: 'Published' },
      'archived': { class: 'bg-dark', label: 'Archived' }
    };
    const config = statusMap[status] || { class: 'bg-secondary', label: status };
    return <span className={`badge ${config.class}`} style={{ fontSize: '10px' }}>{config.label}</span>;
  };

  // Table columns
  const tableColumns: AdminTableColumn<NewsArticle>[] = useMemo(() => [
    {
      key: 'title',
      label: 'Title',
      width: '30%',
      render: (value, row) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>{value as string}</div>
          {row.is_featured && <span className="badge bg-warning text-dark" style={{ fontSize: '9px' }}>Featured</span>}
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      width: '12%',
      render: (value) => <span style={{ fontSize: '11px' }}>{value as string}</span>
    },
    {
      key: 'category',
      label: 'Category',
      width: '12%',
      render: (value) => <span className="badge bg-primary" style={{ fontSize: '10px' }}>{value as string}</span>
    },
    {
      key: 'status',
      label: 'Status',
      width: '10%',
      align: 'center',
      render: (value) => getStatusBadge(value as string)
    },
    {
      key: 'published_date',
      label: 'Published',
      width: '12%',
      render: (value, row) => (
        <span style={{ fontSize: '10px', color: '#6b7280' }}>
          {value ? formatDate(value as string) : formatDate(row.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '12%',
      align: 'center',
      render: (_, row) => (
        <AdminTableActions
          actions={[
            actionPresets.view(() => handleView(row)),
            ...(canPerformAction('news', 'edit') ? [actionPresets.edit(() => handleEdit(row))] : []),
            ...(canPerformAction('news', 'delete') ? [actionPresets.delete(() => handleDelete(row.id))] : [])
          ]}
        />
      )
    }
  ], [canPerformAction]);

  if (loading && articles.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading news articles...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>News Management</h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Manage news articles and announcements
          </p>
        </div>
        <PermissionButton
          sessionHash={sessionHash}
          module="news"
          action="create"
          className="btn btn-primary btn-sm"
          style={{ fontSize: '12px' }}
          onClick={handleCreate}
        >
          <i className="bi bi-plus-circle me-2"></i>Create Article
        </PermissionButton>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <form className="row g-3 mb-4">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, author, or category..."
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
        <div className="col-md-3">
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
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
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
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-outline-danger w-100"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
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
      <AdminTable<NewsArticle>
        columns={tableColumns}
        data={paginatedArticles}
        emptyMessage="No articles found. Create your first news article to get started."
      />

      {/* Pagination */}
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Showing {filteredArticles.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, filteredArticles.length)} of {filteredArticles.length} articles
        </div>
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredArticles.length / itemsPerPage)}
          onPageChange={setPage}
        />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl" style={{ maxWidth: '1200px', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ flexShrink: 0 }}>
                <h5 className="modal-title" style={{ fontSize: '14px' }}>
                  {modalMode === 'create' ? 'Create New Article' : modalMode === 'view' ? 'View Article' : 'Edit Article'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                  <div className="row g-3">
                    {/* Title */}
                    <div className="col-12">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            title: e.target.value,
                            slug: generateSlug(e.target.value)
                          });
                        }}
                        required
                        disabled={modalMode === 'view'}
                        style={{ fontSize: '11px' }}
                      />
                    </div>

                    {/* Slug */}
                    <div className="col-12">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Slug <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                        disabled={modalMode === 'view'}
                        style={{ fontSize: '11px' }}
                      />
                    </div>

                    {/* Excerpt */}
                    <div className="col-12">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Excerpt <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control form-control-sm"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        rows={3}
                        required
                        disabled={modalMode === 'view'}
                        style={{ fontSize: '11px' }}
                      />
                    </div>

                    {/* Content */}
                    <div className="col-12">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Content <span className="text-danger">*</span></label>
                      <TinyMCEWrapper
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                      />
                    </div>

                    {/* Author */}
                    <div className="col-md-6">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Author <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        required
                        style={{ fontSize: '11px' }}
                      />
                    </div>

                    {/* Category */}
                    <div className="col-md-6">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Category <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        style={{ fontSize: '11px' }}
                        placeholder="e.g., Company News, Industry Updates"
                      />
                    </div>

                    {/* Tags */}
                    <div className="col-md-6">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Tags</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        style={{ fontSize: '11px' }}
                        placeholder="Comma-separated"
                      />
                    </div>

                    {/* Read Time */}
                    <div className="col-md-6">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Read Time</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.read_time}
                        onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                        style={{ fontSize: '11px' }}
                        placeholder="e.g., 5 min read"
                      />
                    </div>

                    {/* Status */}
                    <div className="col-md-4">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Status <span className="text-danger">*</span></label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        required
                        style={{ fontSize: '11px' }}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Published Date */}
                    <div className="col-md-4">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Published Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.published_date}
                        onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                        style={{ fontSize: '11px' }}
                      />
                    </div>

                    {/* Is Featured */}
                    <div className="col-md-4">
                      <label className="form-label small d-block" style={{ fontSize: '11px' }}>&nbsp;</label>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                          id="isFeatured"
                        />
                        <label className="form-check-label small" htmlFor="isFeatured" style={{ fontSize: '11px' }}>
                          Featured Article
                        </label>
                      </div>
                    </div>

                    {/* Featured Image */}
                    <div className="col-md-6">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Featured Image</label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept="image/*"
                        onChange={(e) => setFiles({ ...files, featured_image: e.target.files?.[0] || null })}
                        style={{ fontSize: '11px' }}
                      />
                      {modalMode === 'edit' && selectedArticle?.featured_image && (
                        <small className="text-muted d-block mt-1" style={{ fontSize: '10px' }}>
                          Current: {selectedArticle.featured_image}
                        </small>
                      )}
                    </div>

                    {/* Gallery Images */}
                    <div className="col-md-6">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Gallery Images</label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept="image/*"
                        multiple
                        onChange={(e) => setFiles({ ...files, gallery_images: e.target.files })}
                        style={{ fontSize: '11px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ flexShrink: 0, borderTop: '1px solid #dee2e6' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} style={{ fontSize: '11px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ fontSize: '11px' }}>
                    {loading ? 'Saving...' : modalMode === 'create' ? 'Create Article' : 'Update Article'}
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

