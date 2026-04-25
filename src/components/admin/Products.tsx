'use client';

import { useState, useEffect } from 'react';
import styles from './OrdersManagement.module.css'; // EXACT styles from Orders
import AddProduct from './AddProduct';
import ProductPreviewModal from './ProductPreviewModal';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number | string;
  compare_price: number | string | null;
  currency: string;
  sku: string | null;
  stock_quantity: number;
  track_inventory: boolean;
  featured_image: string | null;
  images: string[];
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  category_names: string | null;
  category_ids: number[];
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddPage, setShowAddPage] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const itemsPerPage = 10;
  
  // Calculate showing range - EXACT like Orders
  const showingStart = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, total);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, categoryFilter, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageClick = async (product: Product) => {
    const images: string[] = [];
    
    try {
      // Fetch full product details to get gallery_images
      const response = await fetch(`/api/admin/products/${product.id}`);
      const data = await response.json();
      
      if (data.success && data.product) {
        const fullProduct = data.product;
        
        // Add gallery_images (primary source)
        if (fullProduct.gallery_images && Array.isArray(fullProduct.gallery_images)) {
          fullProduct.gallery_images.forEach((img: unknown) => {
            if (typeof img === 'string') {
              images.push(img);
            } else if (typeof img === 'object' && img !== null) {
              if ('url' in img) {
                images.push((img as { url: string }).url);
              }
            }
          });
        }
        
        // Fallback: Add featured image if no gallery images
        if (images.length === 0 && fullProduct.featured_image) {
          images.push(fullProduct.featured_image);
        }
        
        // Additional fallback: Check images array
        if (images.length === 0 && fullProduct.images && Array.isArray(fullProduct.images)) {
          fullProduct.images.forEach((img: unknown) => {
            if (typeof img === 'string') {
              images.push(img);
            } else if (typeof img === 'object' && img !== null && 'url' in img) {
              images.push((img as { url: string }).url);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching product gallery:', error);
      
      // Ultimate fallback: use featured image from current product
      if (product.featured_image) {
        images.push(product.featured_image);
      }
    }
    
    if (images.length > 0) {
      setGalleryImages(images);
      setCurrentImageIndex(0);
      setShowGalleryModal(true);
    } else {
      alert('No images available for this product');
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showGalleryModal) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'Escape') {
        setShowGalleryModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showGalleryModal, galleryImages]);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Product deleted successfully!');
        fetchProducts();
      } else {
        alert(`Failed to delete product: ${data.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    }
  };

  const formatCurrency = (amount: number | string, currency: string = 'MYR') => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currency} ${num.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      active: { bg: '#d1fae5', text: '#065f46' },
      draft: { bg: '#fef3c7', text: '#92400e' },
      archived: { bg: '#e5e7eb', text: '#374151' },
    };

    const { bg, text } = config[status] || config.active;

    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: bg,
          color: text,
        }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const getStockBadge = (product: Product) => {
    if (!product.track_inventory) {
      return <span style={{ fontSize: '12px', color: '#6b7280' }}>∞</span>;
    }

    const stock = product.stock_quantity;
    let color = '#059669'; // Green for in stock
    let bg = '#d1fae5';
    let text = `${stock}`;

    if (stock === -1) {
      color = '#7c3aed'; // Purple for pre-order
      bg = '#ede9fe';
      text = 'Pre-order';
    } else if (stock === 0) {
      color = '#dc2626'; // Red for out of stock
      bg = '#fee2e2';
      text = 'Out of stock';
    } else if (stock <= 5) {
      color = '#d97706'; // Orange for low stock
      bg = '#fed7aa';
    }

    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: bg,
          color: color,
        }}
      >
        {text}
      </span>
    );
  };

  // Show Add/Edit Product page
  if (showAddPage || editingProductId !== null) {
    return (
      <AddProduct 
        productId={editingProductId || undefined}
        onBack={() => {
          setShowAddPage(false);
          setEditingProductId(null);
          fetchProducts();
        }} 
      />
    );
  }

  if (loading && products.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading products...</p>
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
                Products
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Manage your product catalog
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                onClick={() => setShowAddPage(true)}
                className="btn btn-primary d-flex align-items-center" 
                style={{ 
                  fontSize: '12px', 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 500
                }}
              >
                <span className="material-symbols-outlined me-2" style={{ fontSize: '16px' }}>add_circle</span>
                Add Product
              </button>
            </div>
          </div>

          {/* Filter Section - NO CARD, just form with white background inputs */}
          <form className="row g-3 mb-4">
        {/* Search */}
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search products by name, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="col-md-2">
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
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="col-md-4">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ 
              fontSize: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-outline-danger w-100"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCategoryFilter('');
            }}
            style={{ 
              fontSize: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              fontWeight: 500,
              borderColor: '#dc2626',
              color: '#dc2626'
            }}
          >
            Reset
          </button>
        </div>
      </form>

          {/* Orders Table - EXACT from Orders (overflow-x-auto with shadow and ring) */}
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
                padding: '12px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center',
                borderBottom: '1px solid #d1d5db',
                width: '64px'
              }}></th>
              <th scope="col" style={{ 
                padding: '12px 24px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'left',
                borderBottom: '1px solid #d1d5db'
              }}>PRODUCT</th>
              <th scope="col" style={{ 
                padding: '12px 24px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center',
                borderBottom: '1px solid #d1d5db'
              }}>CATEGORY</th>
              <th scope="col" style={{ 
                padding: '12px 24px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center',
                borderBottom: '1px solid #d1d5db'
              }}>STOCK</th>
              <th scope="col" style={{ 
                padding: '12px 24px',
                fontSize: '11px', 
                fontWeight: 500, 
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center',
                borderBottom: '1px solid #d1d5db'
              }}>PRICE</th>
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#ffffff' }}>
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr 
                  key={product.id} 
                  style={{ backgroundColor: '#ffffff' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', width: '64px', textAlign: 'center' }}>
                    {product.featured_image ? (
                      <img
                        src={product.featured_image}
                        alt={product.name}
                        onClick={() => handleImageClick(product)}
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb',
                          display: 'block',
                          margin: '0 auto',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f3f4f6',
                          margin: '0 auto',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#9ca3af' }}>
                          image
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937', marginBottom: '2px' }}>
                      {product.name}
                    </div>
                    {product.sku && (
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>SKU: {product.sku}</div>
                    )}
                  </td>
                  <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#1f2937' }}>
                        {product.category_names || <span style={{ color: '#9ca3af' }}>—</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getStockBadge(product)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                        {formatCurrency(product.price, product.currency)}
                      </div>
                      {product.compare_price && (
                        <div style={{ fontSize: '11px', color: '#9ca3af', textDecoration: 'line-through' }}>
                          {formatCurrency(product.compare_price, product.currency)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getStatusBadge(product.status)}
                    </div>
                  </td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actionsContainer}>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDetailModal(true);
                        }}
                        className={styles.actionButton}
                        style={{ color: '#10b981' }}
                        title="Show Details"
                      >
                        <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                          visibility
                        </span>
                      </button>
                      <button
                        onClick={() => setEditingProductId(product.id)}
                        className={styles.actionButton}
                        style={{ color: '#3b82f6' }}
                        title="Edit"
                      >
                        <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
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

          {/* Pagination - EXACT from Orders */}
          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between" style={{ marginTop: '24px', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Showing {showingStart} to {showingEnd} of {total} products
            </div>
            <nav>
              <ul className="pagination mb-0" style={{ gap: '4px' }}>
                <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link border-0" 
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{ 
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: currentPage <= 1 ? '#f3f4f6' : '#ffffff',
                      color: currentPage <= 1 ? '#9ca3af' : '#111827',
                      border: currentPage <= 1 ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    Previous
                  </button>
                </li>
                <li className="page-item active">
                  <button 
                    className="page-link border-0" 
                    style={{ 
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      fontWeight: 500
                    }}
                  >
                    {currentPage}
                  </button>
                </li>
                <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link border-0" 
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{ 
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: currentPage >= totalPages ? '#f3f4f6' : '#ffffff',
                      color: currentPage >= totalPages ? '#9ca3af' : '#111827',
                      border: currentPage >= totalPages ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Product Preview Modal - Separate Component */}
      <ProductPreviewModal 
        productId={selectedProduct?.id || 0}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      {/* Image Gallery Modal */}
      {showGalleryModal && galleryImages.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
          }}
          onClick={() => setShowGalleryModal(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowGalleryModal(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'all 0.2s',
              zIndex: 100000,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
          </button>

          {/* Image Counter */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 500,
              zIndex: 100000,
            }}
          >
            {currentImageIndex + 1} / {galleryImages.length}
          </div>

          {/* Gallery Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 120px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={handlePrevImage}
                style={{
                  position: 'absolute',
                  left: '40px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.3s',
                  zIndex: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>chevron_left</span>
              </button>
            )}

            {/* Main Image - BESAR! */}
            <img
              src={galleryImages[currentImageIndex]}
              alt={`Gallery image ${currentImageIndex + 1}`}
              style={{
                maxWidth: '85vw',
                maxHeight: '75vh',
                minWidth: '600px',
                minHeight: '400px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              }}
            />

            {/* Next Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={handleNextImage}
                style={{
                  position: 'absolute',
                  right: '40px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.3s',
                  zIndex: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>chevron_right</span>
              </button>
            )}
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '12px',
                maxWidth: '90vw',
                overflowX: 'auto',
              }}
            >
              {galleryImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: index === currentImageIndex ? '2px solid #3b82f6' : '2px solid transparent',
                    opacity: index === currentImageIndex ? 1 : 0.6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentImageIndex) {
                      e.currentTarget.style.opacity = '0.6';
                    }
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

