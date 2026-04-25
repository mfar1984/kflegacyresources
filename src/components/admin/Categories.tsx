'use client';

import { useState, useEffect } from 'react';
import styles from './OrdersManagement.module.css'; // EXACT styles from Orders

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  sort_order: number;
  status: 'active' | 'inactive';
  product_count: number;
  created_at: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    sort_order: 0,
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = `/api/admin/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingCategory
            ? { ...formData, id: editingCategory.id }
            : formData
        ),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        setShowModal(false);
        resetForm();
        fetchCategories();
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save category');
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.product_count > 0) {
      alert(`Cannot delete "${category.name}" because it has ${category.product_count} products assigned.\n\nPlease reassign or delete the products first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: category.id }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        alert(`Failed to delete category: ${data.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      sort_order: category.sort_order,
      status: category.status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      sort_order: 0,
      status: 'active',
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading categories...</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Container Card - EXACT from Orders */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          {/* Page Header - EXACT from Orders */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                Categories
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Manage product categories for store filters
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="btn btn-primary d-flex align-items-center" 
                style={{ 
                  fontSize: '12px', 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 500
                }}
              >
                <span className="material-symbols-outlined me-2" style={{ fontSize: '16px' }}>add_circle</span>
                Add Category
              </button>
            </div>
          </div>

          {/* Categories Table - EXACT from Orders */}
          <div className="overflow-x-auto shadow" style={{ 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            marginBottom: '24px',
            overflow: 'visible'
          }}>
            <table className="table mb-0" style={{ 
              fontSize: '12px',
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0
            }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db',
                    width: '50px'
                  }}>ICON</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: '1px solid #d1d5db'
                  }}>NAME</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'left',
                    borderBottom: '1px solid #d1d5db'
                  }}>SLUG</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db'
                  }}>PRODUCTS</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db'
                  }}>ORDER</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db'
                  }}>STATUS</th>
                  <th scope="col" style={{ 
                    padding: '12px 24px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db',
                    width: '100px'
                  }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#ffffff' }}>
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr 
                      key={category.id} 
                      style={{ backgroundColor: '#ffffff' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', fontSize: '20px' }}>
                        {category.icon || '📦'}
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                          {category.name}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                          {category.slug}
                        </div>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: category.product_count > 0 ? '#dbeafe' : '#f3f4f6',
                          color: category.product_count > 0 ? '#1e40af' : '#6b7280'
                        }}>
                          {category.product_count}
                        </span>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {category.sort_order}
                        </span>
                      </td>
                      <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: category.status === 'active' ? '#d1fae5' : '#e5e7eb',
                            color: category.status === 'active' ? '#065f46' : '#374151',
                          }}
                        >
                          {category.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionsContainer}>
                          <button
                            onClick={() => handleEdit(category)}
                            className={styles.actionButton}
                            style={{ color: '#3b82f6' }}
                            title="Edit"
                          >
                            <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className={styles.actionButton}
                            style={{ color: '#dc2626' }}
                            title="Delete"
                          >
                            <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                              delete
                            </span>
                          </button>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 600 }}>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h5>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (!editingCategory) {
                      setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="form-control"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                  rows={3}
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>
                  Icon (emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="form-control"
                  placeholder="📦"
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
