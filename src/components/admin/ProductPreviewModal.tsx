'use client';

import { useState, useEffect } from 'react';

interface ProductPreviewModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface ProductVariant {
  id: number;
  product_id: number;
  option1_name: string | null;
  option1_value: string | null;
  option2_name: string | null;
  option2_value: string | null;
  option3_name: string | null;
  option3_value: string | null;
  sku: string;
  price: number | string;
  stock_quantity: number;
  status: string;
}

interface ProductData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number | string;
  compare_price?: number | string | null;
  currency: string;
  sku: string | null;
  stock_quantity: number;
  featured_image: string | null;
  gallery_images: Array<{ id: string; url: string; alt: string }>;
  key_highlights: string[];
  included_items: string[];
  tab_overview: string | null;
  tab_specifications: string | null;
  tab_performance: string | null;
  tab_features: string | null;
  tab_support: string | null;
  status: string;
  category_names: string | null;
}

export default function ProductPreviewModal({ productId, isOpen, onClose }: ProductPreviewModalProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
        setVariants(data.variants || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePrevImage = () => {
    if (product?.gallery_images.length) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.gallery_images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product?.gallery_images.length) {
      setCurrentImageIndex((prev) => 
        prev === product.gallery_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const getStockBadge = () => {
    if (!product) return null;
    if (product.stock_quantity === -1) {
      return <span className="badge" style={{ backgroundColor: '#a855f7', color: '#ffffff', fontSize: '11px', padding: '4px 8px' }}>Pre-order</span>;
    } else if (product.stock_quantity === 0) {
      return <span className="badge" style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '11px', padding: '4px 8px' }}>Out of Stock</span>;
    } else {
      return <span className="badge" style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '11px', padding: '4px 8px' }}>In Stock ({product.stock_quantity})</span>;
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        overflow: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          maxWidth: '1400px',
          width: '100%',
          maxHeight: '95vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#6b7280' }}>close</span>
        </button>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>Loading product preview...</p>
          </div>
        ) : product ? (
          <div style={{ padding: '40px' }}>
            {/* Product Header */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {getStockBadge()}
                {product.category_names && product.category_names.split(',').map((cat, idx) => (
                  <span key={idx} className="badge" style={{ backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '11px', padding: '4px 8px' }}>
                    {cat.trim()}
                  </span>
                ))}
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                {product.name}
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                SKU: {product.sku || 'N/A'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
                  {product.currency} {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                </div>
                {product.compare_price && (
                  <div style={{ fontSize: '20px', fontWeight: 500, color: '#9ca3af', textDecoration: 'line-through' }}>
                    {product.currency} {typeof product.compare_price === 'number' ? product.compare_price.toFixed(2) : product.compare_price}
                  </div>
                )}
              </div>
              {product.compare_price && (
                <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                  Save {product.currency} {(typeof product.compare_price === 'number' && typeof product.price === 'number') 
                    ? (product.compare_price - product.price).toFixed(2) 
                    : '0.00'}
                </div>
              )}
            </div>

            <div className="row g-4">
              {/* Left Column: Gallery */}
              <div className="col-lg-6">
                {product.gallery_images && product.gallery_images.length > 0 ? (
                  <div>
                    {/* Main Image */}
                    <div style={{ 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '12px', 
                      padding: '24px',
                      marginBottom: '16px',
                      position: 'relative',
                      minHeight: '400px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img 
                        src={product.gallery_images[currentImageIndex].url} 
                        alt={product.gallery_images[currentImageIndex].alt}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '400px',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                      
                      {/* Navigation Arrows */}
                      {product.gallery_images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            <span className="material-symbols-outlined">chevron_left</span>
                          </button>
                          <button
                            onClick={handleNextImage}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            <span className="material-symbols-outlined">chevron_right</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {product.gallery_images.length > 1 && (
                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {product.gallery_images.map((img, idx) => (
                          <div
                            key={img.id}
                            onClick={() => setCurrentImageIndex(idx)}
                            style={{
                              minWidth: '80px',
                              height: '80px',
                              backgroundColor: '#f9fafb',
                              borderRadius: '8px',
                              padding: '8px',
                              cursor: 'pointer',
                              border: currentImageIndex === idx ? '2px solid #3b82f6' : '2px solid transparent',
                              transition: 'all 0.2s'
                            }}
                          >
                            <img 
                              src={img.url} 
                              alt={img.alt}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : product.featured_image ? (
                  <div style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '12px', 
                    padding: '24px',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={product.featured_image} 
                      alt={product.name}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '400px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '12px', 
                    padding: '60px',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}>
                    <div>
                      <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#d1d5db' }}>image</span>
                      <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '12px' }}>No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Details */}
              <div className="col-lg-6">
                {/* Description */}
                {product.short_description && (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                      {product.short_description}
                    </p>
                  </div>
                )}

                {/* Key Highlights */}
                {product.key_highlights && product.key_highlights.length > 0 && (
                  <div className="card" style={{ 
                    backgroundColor: '#3b82f6', 
                    color: '#ffffff',
                    border: 'none',
                    marginBottom: '24px'
                  }}>
                    <div className="card-body" style={{ padding: '20px' }}>
                      <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#ffffff' }}>
                        Key Highlights
                      </h5>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {product.key_highlights.map((highlight, idx) => (
                          <li key={idx} style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px', marginTop: '2px' }}>
                              check_circle
                            </span>
                            <span style={{ fontSize: '13px', lineHeight: '1.5' }}>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Included Items */}
                {product.included_items && product.included_items.length > 0 && (
                  <div className="alert alert-success" style={{ marginBottom: '24px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px' }}>
                        card_giftcard
                      </span>
                      Included with Purchase
                    </h6>
                    <ul style={{ marginBottom: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      {product.included_items.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Product Variants */}
                {variants && variants.length > 0 && (
                  <div className="card" style={{ border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                    <div className="card-body" style={{ padding: '20px' }}>
                      <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px', color: '#3b82f6' }}>
                          inventory_2
                        </span>
                        Product Variants ({variants.length})
                      </h5>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="table table-sm" style={{ marginBottom: 0, fontSize: '13px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                              <th style={{ padding: '10px', fontWeight: 600, color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Options</th>
                              <th style={{ padding: '10px', fontWeight: 600, color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>SKU</th>
                              <th style={{ padding: '10px', fontWeight: 600, color: '#6b7280', borderBottom: '2px solid #e5e7eb', textAlign: 'right' }}>Price</th>
                              <th style={{ padding: '10px', fontWeight: 600, color: '#6b7280', borderBottom: '2px solid #e5e7eb', textAlign: 'center' }}>Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((variant) => {
                              // Build variant name from options
                              const optionParts = [];
                              if (variant.option1_name && variant.option1_value) {
                                optionParts.push(`${variant.option1_name}: ${variant.option1_value}`);
                              }
                              if (variant.option2_name && variant.option2_value) {
                                optionParts.push(`${variant.option2_name}: ${variant.option2_value}`);
                              }
                              if (variant.option3_name && variant.option3_value) {
                                optionParts.push(`${variant.option3_name}: ${variant.option3_value}`);
                              }
                              const variantName = optionParts.length > 0 ? optionParts.join(' • ') : 'Default';

                              return (
                                <tr key={variant.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '10px', color: '#1f2937', fontWeight: 500 }}>{variantName}</td>
                                  <td style={{ padding: '10px', color: '#6b7280', fontFamily: 'monospace', fontSize: '12px' }}>{variant.sku}</td>
                                  <td style={{ padding: '10px', color: '#3b82f6', fontWeight: 600, textAlign: 'right' }}>
                                    {product.currency} {typeof variant.price === 'number' ? variant.price.toFixed(2) : variant.price}
                                  </td>
                                  <td style={{ padding: '10px', textAlign: 'center' }}>
                                    {variant.stock_quantity === -1 ? (
                                      <span className="badge" style={{ backgroundColor: '#a855f7', color: '#ffffff', fontSize: '11px' }}>Pre-order</span>
                                    ) : variant.stock_quantity === 0 ? (
                                      <span className="badge" style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '11px' }}>Out of Stock</span>
                                    ) : (
                                      <span className="badge" style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '11px' }}>
                                        {variant.stock_quantity} in stock
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs Section */}
            {(product.tab_overview || product.tab_specifications || product.tab_performance || product.tab_features || product.tab_support) && (
              <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '32px' }}>
                {/* Tab Navigation */}
                <ul className="nav nav-tabs" style={{ marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
                  {product.tab_overview && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                        style={{
                          border: 'none',
                          borderBottom: activeTab === 'overview' ? '2px solid #3b82f6' : '2px solid transparent',
                          color: activeTab === 'overview' ? '#3b82f6' : '#6b7280',
                          fontWeight: activeTab === 'overview' ? 600 : 400,
                          fontSize: '14px',
                          padding: '12px 20px',
                          background: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Overview
                      </button>
                    </li>
                  )}
                  {product.tab_specifications && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'specs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('specs')}
                        style={{
                          border: 'none',
                          borderBottom: activeTab === 'specs' ? '2px solid #3b82f6' : '2px solid transparent',
                          color: activeTab === 'specs' ? '#3b82f6' : '#6b7280',
                          fontWeight: activeTab === 'specs' ? 600 : 400,
                          fontSize: '14px',
                          padding: '12px 20px',
                          background: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Specifications
                      </button>
                    </li>
                  )}
                  {product.tab_performance && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'performance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('performance')}
                        style={{
                          border: 'none',
                          borderBottom: activeTab === 'performance' ? '2px solid #3b82f6' : '2px solid transparent',
                          color: activeTab === 'performance' ? '#3b82f6' : '#6b7280',
                          fontWeight: activeTab === 'performance' ? 600 : 400,
                          fontSize: '14px',
                          padding: '12px 20px',
                          background: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Performance
                      </button>
                    </li>
                  )}
                  {product.tab_features && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
                        onClick={() => setActiveTab('features')}
                        style={{
                          border: 'none',
                          borderBottom: activeTab === 'features' ? '2px solid #3b82f6' : '2px solid transparent',
                          color: activeTab === 'features' ? '#3b82f6' : '#6b7280',
                          fontWeight: activeTab === 'features' ? 600 : 400,
                          fontSize: '14px',
                          padding: '12px 20px',
                          background: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Features
                      </button>
                    </li>
                  )}
                  {product.tab_support && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'support' ? 'active' : ''}`}
                        onClick={() => setActiveTab('support')}
                        style={{
                          border: 'none',
                          borderBottom: activeTab === 'support' ? '2px solid #3b82f6' : '2px solid transparent',
                          color: activeTab === 'support' ? '#3b82f6' : '#6b7280',
                          fontWeight: activeTab === 'support' ? 600 : 400,
                          fontSize: '14px',
                          padding: '12px 20px',
                          background: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Support
                      </button>
                    </li>
                  )}
                </ul>

                {/* Tab Content */}
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                  {activeTab === 'overview' && product.tab_overview && (
                    <div dangerouslySetInnerHTML={{ __html: product.tab_overview }} />
                  )}
                  {activeTab === 'specs' && product.tab_specifications && (
                    <div dangerouslySetInnerHTML={{ __html: product.tab_specifications }} />
                  )}
                  {activeTab === 'performance' && product.tab_performance && (
                    <div dangerouslySetInnerHTML={{ __html: product.tab_performance }} />
                  )}
                  {activeTab === 'features' && product.tab_features && (
                    <div dangerouslySetInnerHTML={{ __html: product.tab_features }} />
                  )}
                  {activeTab === 'support' && product.tab_support && (
                    <div dangerouslySetInnerHTML={{ __html: product.tab_support }} />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>Product not found</p>
          </div>
        )}
      </div>
    </div>
  );
}

