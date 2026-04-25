'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Variant {
  id: string;
  option1_name: string;
  option1_value: string;
  option2_name?: string;
  option2_value?: string;
  option3_name?: string;
  option3_value?: string;
  sku: string;
  price: string;
  compare_price: string;
  stock_quantity: string;
}

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  compare_price: string;
  cost_price: string;
  currency: string;
  sku: string;
  barcode: string;
  stock_quantity: string;
  track_inventory: boolean;
  low_stock_threshold: string;
  weight: string;
  dimensions: string;
  vendor: string;
  brand: string;
  featured_image: string;
  tags: string;
  status: 'active' | 'draft' | 'archived';
  categories: number[];
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  notes: string;
  // NEW EXTENDED FIELDS
  gallery_images: GalleryImage[];
  key_highlights: string[];
  included_items: string[];
  tab_overview: string;
  tab_specifications: string;
  tab_performance: string;
  tab_features: string;
  tab_support: string;
}

interface AddProductProps {
  onBack: () => void;
  productId?: number; // For edit mode
}

export default function AddProduct({ onBack, productId }: AddProductProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const isEditMode = !!productId;
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    cost_price: '',
    currency: 'MYR',
    sku: '',
    barcode: '',
    stock_quantity: '0',
    track_inventory: true,
    low_stock_threshold: '5',
    weight: '',
    dimensions: '',
    vendor: '',
    brand: '',
    featured_image: '',
    tags: '',
    status: 'active',
    categories: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    notes: '',
    // NEW EXTENDED FIELDS
    gallery_images: [],
    key_highlights: [],
    included_items: [],
    tab_overview: '',
    tab_specifications: '',
    tab_performance: '',
    tab_features: '',
    tab_support: '',
  });

  useEffect(() => {
    fetchCategories();
    if (isEditMode && productId) {
      fetchProductData(productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, productId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories.filter((c: Category & { status: string }) => c.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProductData = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${id}`);
      const data = await response.json();
      
      if (data.success && data.product) {
        const product = data.product;
        
        // Populate form with existing data
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          short_description: product.short_description || '',
          price: product.price || '',
          compare_price: product.compare_price || '',
          cost_price: product.cost_price || '',
          currency: product.currency || 'MYR',
          sku: product.sku || '',
          barcode: product.barcode || '',
          stock_quantity: product.stock_quantity?.toString() || '0',
          track_inventory: product.track_inventory || false,
          low_stock_threshold: product.low_stock_threshold?.toString() || '5',
          weight: product.weight || '',
          dimensions: product.dimensions || '',
          vendor: product.vendor || '',
          brand: product.brand || '',
          featured_image: product.featured_image || '',
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
          status: product.status || 'active',
          categories: product.category_ids || [],
          seo_title: product.seo_title || '',
          seo_description: product.seo_description || '',
          seo_keywords: product.seo_keywords || '',
          notes: product.notes || '',
          gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images : [],
          key_highlights: Array.isArray(product.key_highlights) ? product.key_highlights : [],
          included_items: Array.isArray(product.included_items) ? product.included_items : [],
          tab_overview: product.tab_overview || '',
          tab_specifications: product.tab_specifications || '',
          tab_performance: product.tab_performance || '',
          tab_features: product.tab_features || '',
          tab_support: product.tab_support || '',
        });

        // Fetch variants if any
        if (data.variants && Array.isArray(data.variants)) {
          setVariants(data.variants.map((v: Record<string, unknown>) => ({
            id: v.id?.toString() || Date.now().toString(),
            option1_name: v.option1_name || '',
            option1_value: v.option1_value || '',
            option2_name: v.option2_name || '',
            option2_value: v.option2_value || '',
            option3_name: v.option3_name || '',
            option3_value: v.option3_value || '',
            sku: v.sku || '',
            price: v.price || '',
            compare_price: v.compare_price || '',
            stock_quantity: v.stock_quantity?.toString() || '0',
          })));
        }
      } else {
        alert('Failed to load product data');
        onBack();
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error loading product data');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from name
      if (name === 'name' && !formData.slug) {
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
      }
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleAddVariant = () => {
    setEditingVariant(null);
    setShowVariantModal(true);
  };

  const handleEditVariant = (variant: Variant) => {
    setEditingVariant(variant);
    setShowVariantModal(true);
  };

  const handleDeleteVariant = (variantId: string) => {
    if (confirm('Are you sure you want to delete this variant?')) {
      setVariants(prev => prev.filter(v => v.id !== variantId));
    }
  };

  const handleSaveVariant = (variant: Variant) => {
    if (editingVariant) {
      // Update existing
      setVariants(prev => prev.map(v => v.id === variant.id ? variant : v));
    } else {
      // Add new
      setVariants(prev => [...prev, { ...variant, id: Date.now().toString() }]);
    }
    setShowVariantModal(false);
    setEditingVariant(null);
  };

  // Gallery Images Handlers
  const handleAddGalleryImage = () => {
    const url = prompt('Enter image URL:');
    const alt = prompt('Enter image alt text (optional):');
    if (url) {
      const newImage: GalleryImage = {
        id: Date.now().toString(),
        url: url.trim(),
        alt: alt?.trim() || '',
      };
      setFormData(prev => ({
        ...prev,
        gallery_images: [...prev.gallery_images, newImage]
      }));
    }
  };

  const handleRemoveGalleryImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter(img => img.id !== imageId)
    }));
  };

  // Removed unused handleUpdateGalleryImageAlt - can be added back when inline editing is needed

  // Key Highlights Handlers
  const handleAddHighlight = () => {
    const highlight = prompt('Enter key highlight:');
    if (highlight && highlight.trim()) {
      setFormData(prev => ({
        ...prev,
        key_highlights: [...prev.key_highlights, highlight.trim()]
      }));
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_highlights: prev.key_highlights.filter((_, i) => i !== index)
    }));
  };

  const handleEditHighlight = (index: number) => {
    const newValue = prompt('Edit highlight:', formData.key_highlights[index]);
    if (newValue !== null && newValue.trim()) {
      setFormData(prev => ({
        ...prev,
        key_highlights: prev.key_highlights.map((h, i) => i === index ? newValue.trim() : h)
      }));
    }
  };

  // Included Items Handlers
  const handleAddIncludedItem = () => {
    const item = prompt('Enter included item:');
    if (item && item.trim()) {
      setFormData(prev => ({
        ...prev,
        included_items: [...prev.included_items, item.trim()]
      }));
    }
  };

  const handleRemoveIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      included_items: prev.included_items.filter((_, i) => i !== index)
    }));
  };

  const handleEditIncludedItem = (index: number) => {
    const newValue = prompt('Edit included item:', formData.included_items[index]);
    if (newValue !== null && newValue.trim()) {
      setFormData(prev => ({
        ...prev,
        included_items: prev.included_items.map((item, i) => i === index ? newValue.trim() : item)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug || !formData.price) {
      alert('Please fill in required fields: Name, Slug, and Price');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images: [], // Will be added later with image upload
        // NEW EXTENDED FIELDS - pass as-is (already in correct format)
        gallery_images: formData.gallery_images,
        key_highlights: formData.key_highlights,
        included_items: formData.included_items,
        tab_overview: formData.tab_overview || null,
        tab_specifications: formData.tab_specifications || null,
        tab_performance: formData.tab_performance || null,
        tab_features: formData.tab_features || null,
        tab_support: formData.tab_support || null,
        variants: variants.map(v => ({
          option1_name: v.option1_name,
          option1_value: v.option1_value,
          option2_name: v.option2_name || null,
          option2_value: v.option2_value || null,
          option3_name: v.option3_name || null,
          option3_value: v.option3_value || null,
          sku: v.sku || null,
          price: parseFloat(v.price) || 0,
          compare_price: v.compare_price ? parseFloat(v.compare_price) : null,
          stock_quantity: parseInt(v.stock_quantity) || 0,
        })),
      };

      const url = isEditMode ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
        onBack();
      } else {
        alert(`Failed to ${isEditMode ? 'update' : 'create'} product: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Main Container Card - EXACT from Orders */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3" style={{ fontSize: '12px', color: '#6b7280' }}>Loading product data...</p>
            </div>
          ) : (
            <>
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {isEditMode ? 'Update product information' : 'Create a new product for your store'}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                type="button"
                onClick={onBack}
                className="btn btn-outline-secondary d-flex align-items-center" 
                style={{ 
                  fontSize: '12px', 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 500
                }}
              >
                <span className="material-symbols-outlined me-2" style={{ fontSize: '16px' }}>arrow_back</span>
                Back
              </button>
              <button 
                type="submit"
                form="product-form"
                disabled={saving}
                className="btn btn-primary d-flex align-items-center" 
                style={{ 
                  fontSize: '12px', 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 500
                }}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined me-2" style={{ fontSize: '16px' }}>save</span>
                    Save Product
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Product Form */}
          <form id="product-form" onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Left Column */}
              <div className="col-md-8">
                {/* Basic Information */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Basic Information
                    </h6>
                    
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        Product Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        style={{ fontSize: '12px' }}
                        placeholder="e.g. Ubiquiti UniFi Dream Machine"
                      />
                    </div>

                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        Slug <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        style={{ fontSize: '12px', fontFamily: 'monospace' }}
                        placeholder="e.g. ubiquiti-unifi-dream-machine"
                      />
                      <small style={{ fontSize: '11px', color: '#6b7280' }}>
                        URL-friendly version of the name
                      </small>
                    </div>

                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        Short Description
                      </label>
                      <textarea
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleInputChange}
                        className="form-control"
                        rows={2}
                        style={{ fontSize: '12px' }}
                        placeholder="Brief description shown in product listings"
                      />
                    </div>

                    <div className="mb-0">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        Full Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="form-control"
                        rows={6}
                        style={{ fontSize: '12px' }}
                        placeholder="Detailed product description with features and specifications"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Pricing
                    </h6>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Price (MYR) <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          step="0.01"
                          min="0"
                          className="form-control"
                          style={{ fontSize: '12px' }}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Compare at Price (MYR)
                        </label>
                        <input
                          type="number"
                          name="compare_price"
                          value={formData.compare_price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="form-control"
                          style={{ fontSize: '12px' }}
                          placeholder="0.00"
                        />
                        <small style={{ fontSize: '11px', color: '#6b7280' }}>
                          Original price for showing discounts
                        </small>
                      </div>

                      <div className="col-md-6 mb-0">
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Cost per Item (MYR)
                        </label>
                        <input
                          type="number"
                          name="cost_price"
                          value={formData.cost_price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="form-control"
                          style={{ fontSize: '12px' }}
                          placeholder="0.00"
                        />
                        <small style={{ fontSize: '11px', color: '#6b7280' }}>
                          Your cost (for profit margin calculation)
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Inventory
                    </h6>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                          SKU
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          className="form-control"
                          style={{ fontSize: '12px', fontFamily: 'monospace' }}
                          placeholder="e.g. UDM-PRO"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Barcode
                        </label>
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleInputChange}
                          className="form-control"
                          style={{ fontSize: '12px', fontFamily: 'monospace' }}
                          placeholder="ISBN, UPC, GTIN, etc."
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            name="track_inventory"
                            checked={formData.track_inventory}
                            onChange={handleInputChange}
                            className="form-check-input"
                            id="track-inventory"
                          />
                          <label className="form-check-label" htmlFor="track-inventory" style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                            Track inventory for this product
                          </label>
                        </div>
                      </div>

                      {formData.track_inventory && (
                        <>
                          <div className="col-md-6 mb-3">
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              name="stock_quantity"
                              value={formData.stock_quantity}
                              onChange={handleInputChange}
                              min="-1"
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="0"
                            />
                            <small style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                              Use <strong>-1</strong> for Pre-order
                            </small>
                          </div>

                          <div className="col-md-6 mb-0">
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                              Low Stock Threshold
                            </label>
                            <input
                              type="number"
                              name="low_stock_threshold"
                              value={formData.low_stock_threshold}
                              onChange={handleInputChange}
                              min="0"
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="5"
                            />
                            <small style={{ fontSize: '11px', color: '#6b7280' }}>
                              Show warning when stock falls below this
                            </small>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Shipping
                    </h6>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="form-control"
                          style={{ fontSize: '12px' }}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="col-md-6 mb-0">
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Dimensions (L × W × H cm)
                        </label>
                        <input
                          type="text"
                          name="dimensions"
                          value={formData.dimensions}
                          onChange={handleInputChange}
                          className="form-control"
                          style={{ fontSize: '12px' }}
                          placeholder="e.g. 30 × 20 × 10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                        Product Variants
                      </h6>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="btn btn-sm btn-outline-primary"
                        style={{ fontSize: '11px', padding: '4px 12px' }}
                      >
                        <span className="material-symbols-outlined me-1" style={{ fontSize: '14px', verticalAlign: 'middle' }}>add</span>
                        Add Variant
                      </button>
                    </div>
                    
                    {variants.length === 0 ? (
                      <div style={{ 
                        padding: '24px', 
                        textAlign: 'center', 
                        backgroundColor: '#ffffff', 
                        borderRadius: '8px',
                        border: '2px dashed #e5e7eb'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '12px', display: 'block' }}>
                          inventory_2
                        </span>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                          No variants yet
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                          Add variants like Size (S, M, L) or Color (Red, Blue) to offer multiple options
                        </p>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <table className="table mb-0" style={{ fontSize: '11px' }}>
                          <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                              <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Variant</th>
                              <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>SKU</th>
                              <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Price</th>
                              <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Stock</th>
                              <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', textAlign: 'center', width: '80px' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((variant) => (
                              <tr key={variant.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '10px 12px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: 500, color: '#1f2937' }}>
                                    {variant.option1_name}: {variant.option1_value}
                                    {variant.option2_name && ` / ${variant.option2_name}: ${variant.option2_value}`}
                                    {variant.option3_name && ` / ${variant.option3_name}: ${variant.option3_value}`}
                                  </div>
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                                  {variant.sku || '—'}
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#1f2937', textAlign: 'right' }}>
                                  RM {parseFloat(variant.price).toFixed(2)}
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
                                  {variant.stock_quantity}
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleEditVariant(variant)}
                                      style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#3b82f6' }}
                                      title="Edit"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVariant(variant.id)}
                                      style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#dc2626' }}
                                      title="Delete"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #dbeafe' }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3b82f6' }}>
                          info
                        </span>
                        <div>
                          <p style={{ fontSize: '11px', color: '#1e40af', margin: 0, fontWeight: 500, marginBottom: '4px' }}>
                            About Variants
                          </p>
                          <p style={{ fontSize: '11px', color: '#3b82f6', margin: 0, lineHeight: '1.4' }}>
                            Variants let you sell the same product with different options. Each variant can have its own price, SKU, and stock level. Perfect for products with sizes, colors, or different configurations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Highlights Section */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                        Key Highlights
                      </h6>
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="btn btn-sm btn-outline-primary"
                        style={{ fontSize: '11px', padding: '4px 12px' }}
                      >
                        <span className="material-symbols-outlined me-1" style={{ fontSize: '14px', verticalAlign: 'middle' }}>add</span>
                        Add Highlight
                      </button>
                    </div>
                    
                    {formData.key_highlights.length === 0 ? (
                      <div style={{ 
                        padding: '24px', 
                        textAlign: 'center', 
                        backgroundColor: '#ffffff', 
                        borderRadius: '8px',
                        border: '2px dashed #e5e7eb'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '12px', display: 'block' }}>
                          check_circle
                        </span>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                          No highlights yet
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                          Add key features like &quot;Dual-core ARM CPU&quot; or &quot;Up to 927 Mbps routing&quot;
                        </p>
                      </div>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {formData.key_highlights.map((highlight, index) => (
                          <li key={index} style={{ 
                            padding: '10px 12px',
                            backgroundColor: '#ffffff',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10b981', marginRight: '8px', marginTop: '2px' }}>
                                check_circle
                              </span>
                              <span style={{ fontSize: '12px', color: '#1f2937', lineHeight: '1.5' }}>
                                {highlight}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                              <button
                                type="button"
                                onClick={() => handleEditHighlight(index)}
                                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#3b82f6' }}
                                title="Edit"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveHighlight(index)}
                                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#dc2626' }}
                                title="Remove"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px', display: 'block' }}>
                      These bullet points will appear on the product detail page
                    </small>
                  </div>
                </div>

                {/* Included Items Section */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                        Included with Purchase
                      </h6>
                      <button
                        type="button"
                        onClick={handleAddIncludedItem}
                        className="btn btn-sm btn-outline-primary"
                        style={{ fontSize: '11px', padding: '4px 12px' }}
                      >
                        <span className="material-symbols-outlined me-1" style={{ fontSize: '14px', verticalAlign: 'middle' }}>add</span>
                        Add Item
                      </button>
                    </div>
                    
                    {formData.included_items.length === 0 ? (
                      <div style={{ 
                        padding: '24px', 
                        textAlign: 'center', 
                        backgroundColor: '#ffffff', 
                        borderRadius: '8px',
                        border: '2px dashed #e5e7eb'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '12px', display: 'block' }}>
                          card_giftcard
                        </span>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                          No included items yet
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                          Add items like &quot;1 Year Warranty&quot; or &quot;TAC Lite Support&quot;
                        </p>
                      </div>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {formData.included_items.map((item, index) => (
                          <li key={index} style={{ 
                            padding: '10px 12px',
                            backgroundColor: '#ffffff',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10b981', marginRight: '8px', marginTop: '2px' }}>
                                check_box
                              </span>
                              <span style={{ fontSize: '12px', color: '#1f2937', lineHeight: '1.5' }}>
                                {item}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                              <button
                                type="button"
                                onClick={() => handleEditIncludedItem(index)}
                                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#3b82f6' }}
                                title="Edit"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveIncludedItem(index)}
                                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#dc2626' }}
                                title="Remove"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px', display: 'block' }}>
                      Items that come with this product (e.g., warranty, support, accessories)
                    </small>
                  </div>
                </div>

                {/* SEO */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '0' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Search Engine Optimization (SEO)
                    </h6>
                    
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        SEO Title
                      </label>
                      <input
                        type="text"
                        name="seo_title"
                        value={formData.seo_title}
                        onChange={handleInputChange}
                        className="form-control"
                        style={{ fontSize: '12px' }}
                        placeholder="e.g. Buy Ubiquiti Dream Machine - Best Price in Malaysia"
                      />
                      <small style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        {formData.seo_title.length}/70 characters
                      </small>
                    </div>

                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        SEO Description
                      </label>
                      <textarea
                        name="seo_description"
                        value={formData.seo_description}
                        onChange={handleInputChange}
                        className="form-control"
                        rows={3}
                        style={{ fontSize: '12px' }}
                        placeholder="Brief description that appears in search results"
                      />
                      <small style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        {formData.seo_description.length}/160 characters
                      </small>
                    </div>

                    <div className="mb-0">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        SEO Keywords
                      </label>
                      <input
                        type="text"
                        name="seo_keywords"
                        value={formData.seo_keywords}
                        onChange={handleInputChange}
                        className="form-control"
                        style={{ fontSize: '12px' }}
                        placeholder="ubiquiti, unifi, dream machine, networking"
                      />
                      <small style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Separate keywords with commas
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-4">
                {/* Product Media */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Product Media
                    </h6>
                    
                    {/* Featured Image */}
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                        Featured Image
                      </label>
                      {formData.featured_image ? (
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                          <img
                            src={formData.featured_image}
                            alt="Featured"
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '2px solid #e5e7eb'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          border: '2px dashed #d1d5db',
                          borderRadius: '8px',
                          padding: '32px 16px',
                          textAlign: 'center',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer'
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>
                            add_photo_alternate
                          </span>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, marginBottom: '4px', fontWeight: 500 }}>
                            Add Featured Image
                          </p>
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                            Click or drag & drop
                          </p>
                        </div>
                      )}
                      <input
                        type="text"
                        name="featured_image"
                        value={formData.featured_image}
                        onChange={handleInputChange}
                        className="form-control mt-2"
                        style={{ fontSize: '11px' }}
                        placeholder="Or paste image URL"
                      />
                      <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Recommended: 800x800px, JPG or PNG
                      </small>
                    </div>

                    {/* Gallery Images - Functional with preview */}
                    <div className="mb-0">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: 0 }}>
                          Gallery Images
                        </label>
                        <button
                          type="button"
                          onClick={handleAddGalleryImage}
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '10px', padding: '4px 10px' }}
                        >
                          <span className="material-symbols-outlined me-1" style={{ fontSize: '12px', verticalAlign: 'middle' }}>add</span>
                          Add Image
                        </button>
                      </div>
                      
                      {formData.gallery_images.length === 0 ? (
                        <div style={{
                          border: '2px dashed #d1d5db',
                          borderRadius: '8px',
                          padding: '24px 16px',
                          textAlign: 'center',
                          backgroundColor: '#ffffff'
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#d1d5db', display: 'block', marginBottom: '8px' }}>
                            collections
                          </span>
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                            No gallery images yet
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                          {formData.gallery_images.map((image) => (
                            <div key={image.id} style={{ position: 'relative' }}>
                              <img
                                src={image.url}
                                alt={image.alt}
                                style={{
                                  width: '100%',
                                  height: '100px',
                                  objectFit: 'cover',
                                  borderRadius: '6px',
                                  border: '1px solid #e5e7eb'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(image.id)}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  fontWeight: 500
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Add multiple product images for gallery view
                      </small>
                    </div>
                  </div>
                </div>

                {/* Status & Visibility */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Status
                    </h6>
                    
                    <div className="mb-0">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="form-select"
                        style={{ fontSize: '12px' }}
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                      <small style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', display: 'block' }}>
                        Only active products are visible in store
                      </small>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Categories
                    </h6>
                    
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {categories.length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          No categories available
                        </p>
                      ) : (
                        <>
                          {categories.map((category) => (
                            <div key={category.id} className="form-check mb-2">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`category-${category.id}`}
                                checked={formData.categories.includes(category.id)}
                                onChange={() => handleCategoryToggle(category.id)}
                              />
                              <label 
                                className="form-check-label" 
                                htmlFor={`category-${category.id}`}
                                style={{ fontSize: '12px', color: '#374151' }}
                              >
                                {category.name}
                              </label>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Tags
                    </h6>
                    
                    <textarea
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="form-control"
                      rows={3}
                      style={{ fontSize: '12px' }}
                      placeholder="networking, ubiquiti, wifi"
                    />
                    <small style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', display: 'block' }}>
                      Separate tags with commas
                    </small>
                  </div>
                </div>

                {/* Product Organization */}
                <div className="card border-0" style={{ backgroundColor: '#f9fafb', marginBottom: '24px' }}>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Organization
                    </h6>
                    
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        Vendor
                      </label>
                      <input
                        type="text"
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleInputChange}
                        className="form-control"
                        style={{ fontSize: '12px' }}
                        placeholder="e.g. Ubiquiti Networks"
                      />
                    </div>

                    <div className="mb-0">
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="form-control"
                        style={{ fontSize: '12px' }}
                        placeholder="e.g. UniFi"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FULL WIDTH: Tabbed Content Section for Product Detail Page */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="card border-0" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="card-body" style={{ padding: '24px' }}>
                    <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
                      Product Detail Page Content (Tabs)
                    </h6>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '20px' }}>
                      These sections will appear as tabs on the product detail page (e.g., Overview, Technical Specifications, Performance, Features, Support)
                    </p>

                    {/* Tab: Overview */}
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                        <span className="material-symbols-outlined me-2" style={{ fontSize: '14px', verticalAlign: 'middle', color: '#3b82f6' }}>
                          description
                        </span>
                        Tab 1: Overview
                      </label>
                      <textarea
                        name="tab_overview"
                        value={formData.tab_overview}
                        onChange={handleInputChange}
                        className="form-control"
                        rows={4}
                        style={{ fontSize: '12px', fontFamily: 'monospace' }}
                        placeholder="Enter overview content (supports HTML). Example: <p>The Netgate 1100 is ideal for...</p>"
                      />
                      <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        General product overview and description. Supports HTML for rich formatting.
                      </small>
                    </div>

                    {/* Tab: Specifications */}
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                        <span className="material-symbols-outlined me-2" style={{ fontSize: '14px', verticalAlign: 'middle', color: '#10b981' }}>
                          list_alt
                        </span>
                        Tab 2: Technical Specifications
                      </label>
                      <textarea
                        name="tab_specifications"
                        value={formData.tab_specifications}
                        onChange={handleInputChange}
                        className="form-control"
                        rows={6}
                        style={{ fontSize: '12px', fontFamily: 'monospace' }}
                        placeholder="Enter technical specs (supports HTML). Example: <table><tr><td>Processor</td><td>Dual-core ARM</td></tr></table>"
                      />
                      <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Technical specifications table or structured data. Supports HTML for tables.
                      </small>
                    </div>

                    {/* Tab: Performance */}
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                        <span className="material-symbols-outlined me-2" style={{ fontSize: '14px', verticalAlign: 'middle', color: '#f59e0b' }}>
                          speed
                        </span>
                        Tab 3: Performance Metrics
                      </label>
                      <textarea
                        name="tab_performance"
                        value={formData.tab_performance}
                        onChange={handleInputChange}
                        className="form-control"
                        rows={5}
                        style={{ fontSize: '12px', fontFamily: 'monospace' }}
                        placeholder="Enter performance data (supports HTML). Example: <ul><li>Routing: 927 Mbps</li><li>VPN: 200 Mbps</li></ul>"
                      />
                      <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Performance benchmarks, throughput, speed metrics. Supports HTML.
                      </small>
                    </div>

                    {/* Tab: Features */}
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                        <span className="material-symbols-outlined me-2" style={{ fontSize: '14px', verticalAlign: 'middle', color: '#8b5cf6' }}>
                          star
                        </span>
                        Tab 4: Features
                      </label>
                      <textarea
                        name="tab_features"
                        value={formData.tab_features}
                        onChange={handleInputChange}
                        className="form-control"
                        rows={5}
                        style={{ fontSize: '12px', fontFamily: 'monospace' }}
                        placeholder="Enter detailed features (supports HTML). Example: <h6>Advanced Firewall</h6><p>Stateful packet inspection...</p>"
                      />
                      <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Detailed feature descriptions and capabilities. Supports HTML for rich content.
                      </small>
                    </div>

                    {/* Tab: Support/Warranty */}
                    <div className="mb-0">
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                        <span className="material-symbols-outlined me-2" style={{ fontSize: '14px', verticalAlign: 'middle', color: '#ec4899' }}>
                          support_agent
                        </span>
                        Tab 5: Support & Warranty
                      </label>
                      <textarea
                        name="tab_support"
                        value={formData.tab_support}
                        onChange={handleInputChange}
                        className="form-control"
                        rows={4}
                        style={{ fontSize: '12px', fontFamily: 'monospace' }}
                        placeholder="Enter support info (supports HTML). Example: <p>1 Year Hardware Warranty<br>24/7 Technical Support</p>"
                      />
                      <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Support details, warranty information, documentation links. Supports HTML.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
            </>
          )}
        </div>
      </div>

      {/* Variant Modal */}
      {showVariantModal && (
        <VariantModal
          variant={editingVariant}
          onSave={handleSaveVariant}
          onClose={() => {
            setShowVariantModal(false);
            setEditingVariant(null);
          }}
        />
      )}
    </>
  );
}

// Variant Modal Component
interface VariantModalProps {
  variant: Variant | null;
  onSave: (variant: Variant) => void;
  onClose: () => void;
}

function VariantModal({ variant, onSave, onClose }: VariantModalProps) {
  const [formData, setFormData] = useState<Variant>(
    variant || {
      id: '',
      option1_name: '',
      option1_value: '',
      option2_name: '',
      option2_value: '',
      option3_name: '',
      option3_value: '',
      sku: '',
      price: '',
      compare_price: '',
      stock_quantity: '0',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.option1_name || !formData.option1_value || !formData.price) {
      alert('Please fill in Option 1 name, value, and price');
      return;
    }

    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }} onClick={(e) => e.stopPropagation()}>
        <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
          {variant ? 'Edit Variant' : 'Add Variant'}
        </h5>

        <form onSubmit={handleSubmit}>
          {/* Option 1 (Required) */}
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937', marginBottom: '12px' }}>
              Option 1 <span style={{ color: '#dc2626' }}>*</span>
            </p>
            <div className="row">
              <div className="col-6">
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', marginBottom: '6px', display: 'block' }}>
                  Name (e.g. Size, Color)
                </label>
                <input
                  type="text"
                  name="option1_name"
                  value={formData.option1_name}
                  onChange={handleChange}
                  required
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="Size"
                />
              </div>
              <div className="col-6">
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', marginBottom: '6px', display: 'block' }}>
                  Value (e.g. S, Red)
                </label>
                <input
                  type="text"
                  name="option1_value"
                  value={formData.option1_value}
                  onChange={handleChange}
                  required
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="Small"
                />
              </div>
            </div>
          </div>

          {/* Option 2 (Optional) */}
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937', marginBottom: '12px' }}>
              Option 2 <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400 }}>(Optional)</span>
            </p>
            <div className="row">
              <div className="col-6">
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', marginBottom: '6px', display: 'block' }}>
                  Name
                </label>
                <input
                  type="text"
                  name="option2_name"
                  value={formData.option2_name}
                  onChange={handleChange}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="Color"
                />
              </div>
              <div className="col-6">
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', marginBottom: '6px', display: 'block' }}>
                  Value
                </label>
                <input
                  type="text"
                  name="option2_value"
                  value={formData.option2_value}
                  onChange={handleChange}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="Red"
                />
              </div>
            </div>
          </div>

          {/* Option 3 (Optional) */}
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937', marginBottom: '12px' }}>
              Option 3 <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400 }}>(Optional)</span>
            </p>
            <div className="row">
              <div className="col-6">
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', marginBottom: '6px', display: 'block' }}>
                  Name
                </label>
                <input
                  type="text"
                  name="option3_name"
                  value={formData.option3_name}
                  onChange={handleChange}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="Material"
                />
              </div>
              <div className="col-6">
                <label style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', marginBottom: '6px', display: 'block' }}>
                  Value
                </label>
                <input
                  type="text"
                  name="option3_value"
                  value={formData.option3_value}
                  onChange={handleChange}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="Cotton"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div style={{ marginBottom: '20px' }}>
            <div className="row g-3">
              <div className="col-6">
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="form-control"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  placeholder="VARIANT-SKU"
                />
              </div>
              <div className="col-6">
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  min="0"
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="0"
                />
              </div>
              <div className="col-6">
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Price (MYR) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="0.00"
                />
              </div>
              <div className="col-6">
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Compare Price (MYR)
                </label>
                <input
                  type="number"
                  name="compare_price"
                  value={formData.compare_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
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
              {variant ? 'Update Variant' : 'Add Variant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

