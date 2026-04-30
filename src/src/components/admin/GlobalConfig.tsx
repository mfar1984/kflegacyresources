'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface SystemSettings {
  id: number;
  // General
  site_name: string;
  site_tagline: string;
  site_url: string;
  // Company Info
  company_name: string;
  company_registration_no: string;
  company_address_line1: string;
  company_address_line2: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  // Branding
  logo_path: string;
  favicon_path: string;
  primary_color: string;
  secondary_color: string;
  // Email
  email_from_name: string;
  email_from_address: string;
  email_footer_text: string;
  // System Preferences
  date_format: string;
  time_format: string;
  timezone: string;
  currency: string;
  currency_symbol: string;
  // Social Media
  facebook_url: string | null;
  tiktok_url: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  // Maintenance
  maintenance_mode: number;
  maintenance_message: string | null;
  // Metadata
  updated_at: string;
  updated_by: number | null;
}

interface SystemSettingsProps {
  hash: string;
}

export default function GlobalConfig({ hash }: SystemSettingsProps) {
  const { canPerformAction } = usePermissions(hash);
  
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'company' | 'branding' | 'system' | 'social'>('general');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/admin/system-settings?hash=${hash}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setLogoPreview(data.settings.logo_path);
        setFaviconPreview(data.settings.favicon_path);
      } else {
        alert('Failed to fetch system settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const formData = new FormData();
      
      // Append all settings fields
      Object.entries(settings).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'updated_at' && key !== 'updated_by') {
          formData.append(key, value !== null ? String(value) : '');
        }
      });
      
      // Append files if selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (faviconFile) {
        formData.append('favicon', faviconFile);
      }

      const response = await fetch(`/api/admin/system-settings?hash=${hash}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        alert('Settings updated successfully');
        
        // Refresh page to apply new branding
        if (logoFile || faviconFile) {
          window.location.reload();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return <div className="loading-spinner">Loading system settings...</div>;
  }

  if (!settings) {
    return <div className="alert-danger">System settings not found</div>;
  }

  return (
    <div className="system-settings-container">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
            Global Config
          </h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Configure global system preferences and branding
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <i className="bi bi-gear"></i> General
        </button>
        <button
          className={`tab-button ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          <i className="bi bi-building"></i> Company Info
        </button>
        <button
          className={`tab-button ${activeTab === 'branding' ? 'active' : ''}`}
          onClick={() => setActiveTab('branding')}
        >
          <i className="bi bi-palette"></i> Branding
        </button>
        <button
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <i className="bi bi-sliders"></i> System
        </button>
        <button
          className={`tab-button ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          <i className="bi bi-share"></i> Social Media
        </button>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <h3 className="section-title">General Settings</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Site Name *</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Site Tagline</label>
                <input
                  type="text"
                  value={settings.site_tagline}
                  onChange={(e) => handleChange('site_tagline', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>Site URL *</label>
                <input
                  type="url"
                  value={settings.site_url}
                  onChange={(e) => handleChange('site_url', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Maintenance Mode</label>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode === 1}
                    onChange={(e) => handleChange('maintenance_mode', e.target.checked ? 1 : 0)}
                  />
                  <span>Enable maintenance mode</span>
                </div>
              </div>
              {settings.maintenance_mode === 1 && (
                <div className="form-group full-width">
                  <label>Maintenance Message</label>
                  <textarea
                    rows={3}
                    value={settings.maintenance_message || ''}
                    onChange={(e) => handleChange('maintenance_message', e.target.value)}
                    placeholder="We are currently performing scheduled maintenance..."
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Info Tab */}
        {activeTab === 'company' && (
          <div className="settings-section">
            <h3 className="section-title">Company Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Company Name *</label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Registration No *</label>
                <input
                  type="text"
                  value={settings.company_registration_no}
                  onChange={(e) => handleChange('company_registration_no', e.target.value)}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  value={settings.company_address_line1}
                  onChange={(e) => handleChange('company_address_line1', e.target.value)}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Address Line 2 *</label>
                <input
                  type="text"
                  value={settings.company_address_line2}
                  onChange={(e) => handleChange('company_address_line2', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="text"
                  value={settings.company_phone}
                  onChange={(e) => handleChange('company_phone', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={settings.company_email}
                  onChange={(e) => handleChange('company_email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Website</label>
                <input
                  type="text"
                  value={settings.company_website}
                  onChange={(e) => handleChange('company_website', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="settings-section">
            <h3 className="section-title">Branding & Visual Identity</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Logo</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoChange}
                />
                {logoPreview && (
                  <div className="image-preview">
                    <img src={logoPreview} alt="Logo preview" style={{ maxHeight: '80px' }} />
                  </div>
                )}
              </div>
              <div className="form-group full-width">
                <label>Favicon</label>
                <input
                  type="file"
                  accept="image/x-icon,image/png"
                  onChange={handleFaviconChange}
                />
                {faviconPreview && (
                  <div className="image-preview">
                    <img src={faviconPreview} alt="Favicon preview" style={{ maxHeight: '32px' }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Primary Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    placeholder="#1e3a8a"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Secondary Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                  />
                  <input
                    type="text"
                    value={settings.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="settings-section">
            <h3 className="section-title">System Preferences</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Date Format</label>
                <select
                  value={settings.date_format}
                  onChange={(e) => handleChange('date_format', e.target.value)}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="form-group">
                <label>Time Format</label>
                <select
                  value={settings.time_format}
                  onChange={(e) => handleChange('time_format', e.target.value)}
                >
                  <option value="24h">24-hour</option>
                  <option value="12h">12-hour</option>
                </select>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur (GMT+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <option value="MYR">MYR - Malaysian Ringgit</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
              <div className="form-group">
                <label>Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => handleChange('currency_symbol', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="settings-section">
            <h3 className="section-title">Social Media Links</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Facebook</label>
                <input
                  type="url"
                  value={settings.facebook_url || ''}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="form-group full-width">
                <label>TikTok</label>
                <input
                  type="url"
                  value={settings.tiktok_url || ''}
                  onChange={(e) => handleChange('tiktok_url', e.target.value)}
                  placeholder="https://tiktok.com/@yourhandle"
                />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input
                  type="text"
                  value={settings.whatsapp_number || ''}
                  onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                  placeholder="+60123456789"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
              <div className="form-group full-width">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={settings.linkedin_url || ''}
                  onChange={(e) => handleChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div className="form-group full-width">
                <label>Twitter</label>
                <input
                  type="url"
                  value={settings.twitter_url || ''}
                  onChange={(e) => handleChange('twitter_url', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="settings-footer">
          <button type="submit" className="btn-save" disabled={saving || !canPerformAction('global-config', 'edit')}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .system-settings-container {
          background: white;
          padding: 0;
        }
        
        .settings-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 24px;
          overflow-x: auto;
        }
        
        .tab-button {
          background: none;
          border: none;
          padding: 12px 20px;
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          color: #6b7280;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .tab-button:hover {
          color: #1e3a8a;
          background: #f3f4f6;
        }
        
        .tab-button.active {
          color: #1e3a8a;
          border-bottom-color: #1e3a8a;
          font-weight: 600;
        }
        
        .settings-section {
          margin-bottom: 24px;
        }
        
        .section-title {
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
          margin-bottom: 16px;
          color: #1f2937;
          font-weight: 600;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        
        .form-group label {
          font-size: 11px;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          margin-bottom: 6px;
          color: #374151;
        }
        
        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="url"],
        .form-group input[type="file"],
        .form-group select,
        .form-group textarea {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        
        .color-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .color-input-wrapper input[type="color"] {
          width: 50px;
          height: 36px;
          border: 1px solid #d1d5db;
          cursor: pointer;
        }
        
        .color-input-wrapper input[type="text"] {
          flex: 1;
        }
        
        .image-preview {
          margin-top: 12px;
          padding: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          text-align: center;
        }
        
        .settings-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }
        
        .btn-save {
          background: #1e3a8a;
          color: white;
          border: none;
          padding: 10px 24px;
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
        }
        
        .btn-save:hover:not(:disabled) {
          background: #1e40af;
        }
        
        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          text-align: center;
          padding: 48px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .alert-danger {
          background: #fee2e2;
          color: #991b1b;
          padding: 16px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

