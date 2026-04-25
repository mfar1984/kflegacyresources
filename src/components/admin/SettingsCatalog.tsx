'use client';

import { useState, useEffect } from 'react';

interface Settings {
  [key: string]: {
    value: string | number | boolean | null;
    type: string;
    description: string;
  };
}

export default function SettingsCatalog() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/catalog-settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Convert settings to simple key-value pairs
      const settingsToSave: Record<string, string | number | boolean | null> = {};
      Object.keys(settings).forEach((key) => {
        settingsToSave[key] = settings[key].value;
      });

      const response = await fetch('/api/admin/catalog-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Settings saved successfully!');
      } else {
        alert(`Failed to save settings: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string | number | boolean | null) => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading catalog settings...</p>
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
                Catalog Settings
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Configure how your store and products are displayed
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                onClick={handleSave}
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
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Settings Form */}
          <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            {/* Store Display Section */}
            <div style={{ marginBottom: '32px' }}>
              <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                Store Display Settings
              </h6>

              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Products Per Page */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Products per page
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.products_per_page?.description}
                    </div>
                  </label>
                  <input
                    type="number"
                    value={(settings.products_per_page?.value as number) || 12}
                    onChange={(e) => updateSetting('products_per_page', parseInt(e.target.value))}
                    className="form-control"
                    style={{ fontSize: '12px', maxWidth: '150px' }}
                  />
                </div>

                {/* Default Sort */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Default sorting
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.default_sort?.description}
                    </div>
                  </label>
                  <select
                    value={(settings.default_sort?.value as string) || 'newest'}
                    onChange={(e) => updateSetting('default_sort', e.target.value)}
                    className="form-control"
                    style={{ fontSize: '12px', maxWidth: '200px' }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                  </select>
                </div>

                {/* Show Search Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Show search bar
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.show_search_bar?.description}
                    </div>
                  </label>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={(settings.show_search_bar?.value as boolean) || false}
                      onChange={(e) => updateSetting('show_search_bar', e.target.checked)}
                    />
                  </div>
                </div>

                {/* Show Category Filter */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Show category filter
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.show_category_filter?.description}
                    </div>
                  </label>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={(settings.show_category_filter?.value as boolean) || false}
                      onChange={(e) => updateSetting('show_category_filter', e.target.checked)}
                    />
                  </div>
                </div>

                {/* Show Out of Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Show out of stock products
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.show_out_of_stock?.description}
                    </div>
                  </label>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={(settings.show_out_of_stock?.value as boolean) || false}
                      onChange={(e) => updateSetting('show_out_of_stock', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Display Section */}
            <div style={{ marginBottom: '32px' }}>
              <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                Product Display Settings
              </h6>

              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Show Low Stock Badge */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Show low stock badge
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.low_stock_badge?.description}
                    </div>
                  </label>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={(settings.low_stock_badge?.value as boolean) || false}
                      onChange={(e) => updateSetting('low_stock_badge', e.target.checked)}
                    />
                  </div>
                </div>

                {/* Show Compare Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Show compare price (discount)
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.show_compare_price?.description}
                    </div>
                  </label>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={(settings.show_compare_price?.value as boolean) || false}
                      onChange={(e) => updateSetting('show_compare_price', e.target.checked)}
                    />
                  </div>
                </div>

                {/* Currency Symbol */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Currency symbol
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.currency_symbol?.description}
                    </div>
                  </label>
                  <input
                    type="text"
                      value={(settings.currency_symbol?.value as string) || 'RM'}
                    onChange={(e) => updateSetting('currency_symbol', e.target.value)}
                    className="form-control"
                    style={{ fontSize: '12px', maxWidth: '100px' }}
                  />
                </div>

                {/* Related Products Count */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Related products count
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.related_products_count?.description}
                    </div>
                  </label>
                  <input
                    type="number"
                      value={(settings.related_products_count?.value as number) || 4}
                    onChange={(e) => updateSetting('related_products_count', parseInt(e.target.value))}
                    className="form-control"
                    style={{ fontSize: '12px', maxWidth: '100px' }}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Section */}
            <div>
              <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                Advanced Settings
              </h6>

              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Enable Product Reviews */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                    Enable product reviews
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                      {settings.enable_product_reviews?.description}
                    </div>
                  </label>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={(settings.enable_product_reviews?.value as boolean) || false}
                      onChange={(e) => updateSetting('enable_product_reviews', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
