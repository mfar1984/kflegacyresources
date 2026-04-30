'use client';

import React, { useState, useEffect } from 'react';
import EmailProfiles from './EmailProfiles';
import { usePermissions } from '@/hooks/usePermissions';

interface IntegrationSettings {
  // API
  api_token: string | null;
  api_token_created_at: string | null;
  api_token_last_used: string | null;
  api_token_usage_count: number;
  api_allowed_origins: string[];
  api_cors_allow_all: boolean;
  api_rate_limit_enabled: boolean;
  api_rate_limit_max: number;
  
  // Email SMTP
  smtp_host: string;
  smtp_port: number;
  smtp_encryption: string | null;
  smtp_authentication: boolean;
  smtp_username: string;
  smtp_password: string;
  smtp_from_address: string;
  smtp_from_name: string;
  smtp_reply_to: string | null;
  smtp_connection_timeout: number;
  smtp_max_retries: number;
  smtp_last_test: string | null;
  smtp_test_status: string | null;
  smtp_test_message: string | null;
  
  // Weather
  weather_provider: string;
  weather_api_key: string;
  weather_base_url: string;
  weather_default_location: string;
  weather_default_lat: number | null;
  weather_default_long: number | null;
  weather_units: string;
  weather_update_frequency: number;
  weather_cache_duration: number;
  weather_last_update: string | null;
  weather_current_data: any;
  
  // Public Holidays
  holidays_enabled: boolean;
  holidays_auto_sync: boolean;
  holidays_include_states: string[];
  holidays_last_sync: string | null;
  holidays_cache_duration: number;
  
  // Tides
  tides_enabled: boolean;
  tides_location: string;
  tides_data: any;
  tides_last_sync: string | null;
}

interface IntegrationsProps {
  hash: string;
}

export default function Integrations({ hash }: IntegrationsProps) {
  const { canPerformAction } = usePermissions(hash);
  
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'email' | 'weather' | 'holidays' | 'tides'>('api');
  const [showToken, setShowToken] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [emailProfilesView, setEmailProfilesView] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [hash]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/integrations', {
        headers: { Authorization: `Bearer ${hash}` },
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      
      // Ensure arrays are initialized
      if (!Array.isArray(data.api_allowed_origins)) {
        data.api_allowed_origins = [];
      }
      if (!Array.isArray(data.holidays_include_states)) {
        data.holidays_include_states = [];
      }
      
      setSettings(data);
    } catch (error) {
      console.error('Error fetching integration settings:', error);
      alert('Failed to load integration settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof IntegrationSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const formData = new FormData();

      // Add all fields to formData
      Object.entries(settings).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            formData.append(key, value.join(key === 'api_allowed_origins' ? '\n' : ','));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const res = await fetch('/api/admin/integrations', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${hash}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to save');

      alert('Settings saved successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateToken = async () => {
    if (!confirm('Generate new API token? The old token will be invalidated.')) return;

    setGeneratingToken(true);
    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hash}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'generate_api_token' }),
      });

      if (!res.ok) throw new Error('Failed to generate token');

      const data = await res.json();
      alert(`New token generated successfully!\n\nToken: ${data.token}`);
      fetchSettings();
    } catch (error) {
      console.error('Error generating token:', error);
      alert('Failed to generate token');
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCopyToken = () => {
    if (settings?.api_token) {
      navigator.clipboard.writeText(settings.api_token);
      alert('Token copied to clipboard!');
    }
  };

  const handleGetCoordinates = async () => {
    if (!settings) return;

    const location = settings.weather_default_location?.trim();
    const apiKey = settings.weather_api_key?.trim();

    if (!location) {
      alert('Please enter a location first.');
      return;
    }

    if (!apiKey) {
      alert('Please enter Weather API Key first.');
      return;
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const result = data[0];
        setSettings({
          ...settings,
          weather_default_lat: parseFloat(result.lat.toFixed(8)),
          weather_default_long: parseFloat(result.lon.toFixed(8)),
          weather_default_location: result.state
            ? `${result.name}, ${result.state}, ${result.country}`
            : `${result.name}, ${result.country}`,
        });
        alert(
          `✅ Coordinates found!\n\nLocation: ${result.name}\nLatitude: ${result.lat}\nLongitude: ${result.lon}`
        );
      } else {
        alert('❌ Location not found. Try a different location name.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('❌ Error: Failed to get coordinates. Check your API key or internet connection.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <i className="bi bi-hourglass-split" style={{ fontSize: '24px', color: '#3b82f6' }}></i>
        <p style={{ marginTop: '12px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#6b7280' }}>
          Loading integration settings...
        </p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <i className="bi bi-exclamation-triangle" style={{ fontSize: '24px', color: '#ef4444' }}></i>
        <p style={{ marginTop: '12px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#6b7280' }}>
          Failed to load settings
        </p>
      </div>
    );
  }

  return (
    <div className="integrations-container">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>
          Integrations
        </h2>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
          Manage system integrations (API, Email, Weather & Public Holidays)
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <nav style={{ display: 'flex', gap: '32px' }}>
          <button
            onClick={() => setActiveTab('api')}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: '500',
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'api' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'api' ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <i className="bi bi-link-45deg" style={{ fontSize: '16px' }}></i>
            API
          </button>
          <button
            onClick={() => setActiveTab('email')}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: '500',
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'email' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'email' ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <i className="bi bi-envelope" style={{ fontSize: '16px' }}></i>
            Email (SMTP)
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: '500',
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'weather' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'weather' ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <i className="bi bi-cloud-sun" style={{ fontSize: '16px' }}></i>
            Weather
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: '500',
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'holidays' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'holidays' ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <i className="bi bi-calendar-event" style={{ fontSize: '16px' }}></i>
            Public Holidays
          </button>
          <button
            onClick={() => setActiveTab('tides')}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: '500',
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'tides' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'tides' ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <i className="bi bi-water" style={{ fontSize: '16px' }}></i>
            Tides
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="tab-content">
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
              API Configuration
            </h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#6b7280', marginBottom: '24px' }}>
              Global API token for mobile app and external system integrations
            </p>

            {/* API Token Card */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Global API Token
                  </h4>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280' }}>
                    Used by all mobile applications
                  </p>
                </div>
                {settings.api_token && (
                  <span
                    style={{
                      padding: '4px 10px',
                      background: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '2px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '10px',
                      fontWeight: '500',
                    }}
                  >
                    <i className="bi bi-check-circle" style={{ marginRight: '4px' }}></i>
                    Active
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  API Token
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      value={showToken ? settings.api_token || 'No token' : settings.api_token ? settings.api_token.substring(0, 8) + '********' : 'No token'}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '8px 40px 8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '2px',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '11px',
                        background: '#f9fafb',
                      }}
                    />
                    {settings.api_token && (
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af',
                        }}
                      >
                        <i className={`bi bi-eye${showToken ? '-slash' : ''}`} style={{ fontSize: '16px' }}></i>
                      </button>
                    )}
                  </div>
                  {settings.api_token && (
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      style={{
                        padding: '8px 16px',
                        background: '#4b5563',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '11px',
                        fontWeight: '500',
                      }}
                    >
                      <i className="bi bi-clipboard" style={{ marginRight: '4px' }}></i>
                      Copy
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateToken}
                    disabled={generatingToken}
                    style={{
                      padding: '8px 16px',
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: generatingToken ? 'not-allowed' : 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '11px',
                      fontWeight: '500',
                      opacity: generatingToken ? 0.6 : 1,
                    }}
                  >
                    <i className="bi bi-arrow-repeat" style={{ marginRight: '4px' }}></i>
                    {settings.api_token ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#10b981', marginTop: '8px' }}>
                  🔄 <strong>Auto-Rotation:</strong> Token rotates daily at midnight. Old token deleted automatically.
                </p>
              </div>

              {settings.api_token && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>
                      Created At
                    </div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500' }}>
                      {settings.api_token_created_at ? new Date(settings.api_token_created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>
                      Last Used
                    </div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500' }}>
                      {settings.api_token_last_used ? new Date(settings.api_token_last_used).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>
                      Usage Count
                    </div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500' }}>
                      {(settings.api_token_usage_count || 0).toLocaleString()} requests
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rate Limiting */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                Rate Limiting
              </h4>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginBottom: '16px' }}>
                Limit the number of API requests per IP address
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.api_rate_limit_enabled || false}
                    onChange={(e) => handleChange('api_rate_limit_enabled', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                    Enable Rate Limiting
                  </span>
                </label>
              </div>

              {settings.api_rate_limit_enabled && (
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                    Max Requests Per Hour (per IP)
                  </label>
                  <input
                    type="number"
                    value={settings.api_rate_limit_max || 1000}
                    onChange={(e) => handleChange('api_rate_limit_max', parseInt(e.target.value) || 1000)}
                    min="1"
                    max="10000"
                    style={{
                      width: '200px',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '2px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '12px',
                    }}
                  />
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginTop: '8px' }}>
                    💡 Recommended: 1000-5000 for production. Lower values = stricter protection.
                  </p>
                </div>
              )}
            </div>

            {/* CORS Configuration */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                CORS Configuration
              </h4>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginBottom: '16px' }}>
                Cross-Origin Resource Sharing for API security
              </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.api_cors_allow_all || false}
                  onChange={(e) => handleChange('api_cors_allow_all', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                  Allow All Origins (*) - <span style={{ color: '#ef4444' }}>Not recommended for production</span>
                </span>
              </label>
            </div>

              <div>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  Allowed Origins
                </label>
                <textarea
                  value={Array.isArray(settings.api_allowed_origins) ? settings.api_allowed_origins.join('\n') : ''}
                  onChange={(e) => {
                    // Split by newlines, keep empty lines for formatting
                    const lines = e.target.value.split('\n');
                    handleChange('api_allowed_origins', lines.filter((line) => line.trim()));
                  }}
                  onKeyDown={(e) => {
                    // Prevent form submission on Enter inside textarea
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                    }
                  }}
                  rows={6}
                  placeholder="http://localhost&#10;https://app.example.com&#10;*.ansartechnologies.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '11px',
                    resize: 'vertical',
                    whiteSpace: 'pre',
                    overflowWrap: 'break-word',
                    lineHeight: '1.6',
                  }}
                />
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginTop: '8px' }}>
                  💡 One domain per line. Use <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '2px' }}>*</code> for wildcard subdomains
                </p>
              </div>
            </div>

            {/* Info Card */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderLeft: '4px solid #3b82f6',
                borderRadius: '2px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <i className="bi bi-info-circle" style={{ color: '#3b82f6', fontSize: '20px', flexShrink: 0 }}></i>
                <div>
                  <h5 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                    How This Token Works
                  </h5>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#1e40af', lineHeight: '1.6' }}>
                    <p>1. Token automatically rotates <strong>daily at 00:00 MYT</strong></p>
                    <p>2. Old token is <strong>deleted immediately</strong> after rotation</p>
                    <p>3. Apps must fetch new token daily or handle 401 errors gracefully</p>
                    <p>4. Manual regeneration available anytime via button above</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email SMTP Tab */}
        {activeTab === 'email' && (
          <div className="tab-content">
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: '700', marginBottom: '20px' }}>
              Email Profiles Management
            </h3>
            
            <EmailProfiles hash={hash} />
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="tab-content">
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
              Weather API Configuration
            </h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#6b7280', marginBottom: '24px' }}>
              Configure OpenWeatherMap API for real-time weather data
            </p>

            {/* API Key */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                API Key
              </label>
              <input
                type="text"
                name="weather_api_key"
                value={settings.weather_api_key || ''}
                onChange={(e) => setSettings({ ...settings, weather_api_key: e.target.value })}
                placeholder="Enter your OpenWeatherMap API key"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontFamily: 'Poppins, sans-serif',
                }}
              />
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                Get your free API key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>OpenWeatherMap</a>
              </p>
            </div>

            {/* Base URL */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Base URL
              </label>
              <input
                type="text"
                name="weather_base_url"
                value={settings.weather_base_url || 'https://api.openweathermap.org/data/2.5'}
                onChange={(e) => setSettings({ ...settings, weather_base_url: e.target.value })}
                placeholder="https://api.openweathermap.org/data/2.5"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontFamily: 'Poppins, sans-serif',
                }}
              />
            </div>

            {/* Location */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Default Location
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="weather_default_location"
                  value={settings.weather_default_location || ''}
                  onChange={(e) => setSettings({ ...settings, weather_default_location: e.target.value })}
                  placeholder="e.g., Kuching, Sarawak"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const location = settings.weather_default_location;
                    if (!location) {
                      alert('Please enter a location name first');
                      return;
                    }
                    
                    // Geocoding using OpenWeatherMap Geocoding API
                    const apiKey = settings.weather_api_key;
                    if (!apiKey) {
                      alert('Please enter API Key first');
                      return;
                    }
                    
                    try {
                      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
                      console.log('Geocoding URL:', url);
                      
                      const response = await fetch(url);
                      const data = await response.json();
                      
                      console.log('Geocoding response:', data);
                      
                      if (!response.ok) {
                        console.error('API Error:', data);
                        alert(`❌ API Error: ${data.message || 'Failed to fetch coordinates'}`);
                        return;
                      }
                      
                      if (data && data.length > 0) {
                        const { lat, lon, name, state, country } = data[0];
                        const locationName = state ? `${name}, ${state}, ${country}` : `${name}, ${country}`;
                        setSettings({
                          ...settings,
                          weather_default_lat: lat,
                          weather_default_long: lon,
                          weather_default_location: locationName,
                        });
                        alert(`✅ Coordinates found!\n${locationName}\nLat: ${lat}\nLon: ${lon}`);
                      } else {
                        alert(`❌ Location not found: "${location}"\n\nTry:\n- Adding country (e.g., "Petaling Jaya, Malaysia")\n- Using major city name\n- Different spelling`);
                      }
                    } catch (error) {
                      console.error('Geocoding error:', error);
                      alert(`❌ Failed to fetch coordinates.\nError: ${error instanceof Error ? error.message : 'Unknown error'}\nPlease check your API key and internet connection.`);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>🎯</span>
                  Detect Coordinates
                </button>
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                Enter location name and click button to auto-populate coordinates
              </p>
            </div>

            {/* Latitude & Longitude */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  name="weather_default_lat"
                  value={settings.weather_default_lat || ''}
                  onChange={(e) => setSettings({ ...settings, weather_default_lat: parseFloat(e.target.value) })}
                  placeholder="e.g., 1.5535"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  name="weather_default_long"
                  value={settings.weather_default_long || ''}
                  onChange={(e) => setSettings({ ...settings, weather_default_long: parseFloat(e.target.value) })}
                  placeholder="e.g., 110.3593"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                />
              </div>
            </div>

            {/* Units */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Unit
              </label>
              <select
                name="weather_units"
                value={settings.weather_units || 'metric'}
                onChange={(e) => setSettings({ ...settings, weather_units: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                <option value="metric">Metric (°C, m/s)</option>
                <option value="imperial">Imperial (°F, mph)</option>
                <option value="standard">Standard (K, m/s)</option>
              </select>
            </div>

            {/* Update & Cache */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  Update Frequency (Minutes)
                </label>
                <input
                  type="number"
                  name="weather_update_frequency"
                  value={settings.weather_update_frequency || 30}
                  onChange={(e) => setSettings({ ...settings, weather_update_frequency: parseInt(e.target.value) })}
                  min="1"
                  placeholder="30"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  Cache Duration (Minutes)
                </label>
                <input
                  type="number"
                  name="weather_cache_duration"
                  value={settings.weather_cache_duration || 15}
                  onChange={(e) => setSettings({ ...settings, weather_cache_duration: parseInt(e.target.value) })}
                  min="1"
                  placeholder="15"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                />
              </div>
            </div>

            {/* Current Weather Status */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Status Current Weather
              </label>
              <div
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  background: '#f9fafb',
                }}
              >
                {settings.weather_current_data ? (
                  <div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#059669', marginBottom: '8px', fontWeight: '600' }}>
                      ✅ Weather data available
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280' }}>
                      Last updated: {settings.weather_last_update ? new Date(settings.weather_last_update).toLocaleString() : 'Never'}
                    </p>
                    {typeof settings.weather_current_data === 'string' && (() => {
                      try {
                        const data = JSON.parse(settings.weather_current_data);
                        return (
                          <div style={{ marginTop: '8px', padding: '8px', background: '#fff', borderRadius: '2px' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: '600' }}>
                              {data.name || 'N/A'} - {data.weather?.[0]?.description || 'N/A'}
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280' }}>
                              Temp: {data.main?.temp}° | Humidity: {data.main?.humidity}% | Wind: {data.wind?.speed} m/s
                            </p>
                          </div>
                        );
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                ) : (
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#6b7280' }}>
                    No weather data available. Save settings to fetch weather data.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Public Holidays Tab */}
        {activeTab === 'holidays' && (
          <PublicHolidaysTab hash={hash} />
        )}

        {/* Tides Tab */}
        {activeTab === 'tides' && (
          <div className="tab-content">
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
              Tides Configuration
            </h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#6b7280', marginBottom: '24px' }}>
              Configure tides/air pasang surut display for Malaysian coastal locations
            </p>

            {/* Enable Tides */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings?.tides_enabled || false}
                  onChange={(e) =>
                    setSettings((prev: any) => ({ ...prev, tides_enabled: e.target.checked }))
                  }
                  style={{ marginRight: '8px', width: '16px', height: '16px' }}
                />
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500' }}>
                  Enable Tides Display
                </span>
              </label>
            </div>

            {/* Location Selector */}
            {settings?.tides_enabled && (
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="tides_location"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Coastal Location
                </label>
                <select
                  id="tides_location"
                  value={settings?.tides_location || 'Pelabuhan Kelang'}
                  onChange={(e) =>
                    setSettings((prev: any) => ({ ...prev, tides_location: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '12px',
                    fontFamily: 'Poppins, sans-serif',
                    background: '#fff',
                  }}
                >
                  <option value="Pulau Langkawi">Pulau Langkawi</option>
                  <option value="Pulau Pinang">Pulau Pinang</option>
                  <option value="Lumut">Lumut</option>
                  <option value="Pelabuhan Kelang">Pelabuhan Kelang</option>
                  <option value="Tanjung Keling">Tanjung Keling</option>
                  <option value="Kukup">Kukup</option>
                  <option value="Johor Bahru">Johor Bahru</option>
                  <option value="Tanjung Sedili">Tanjung Sedili</option>
                  <option value="Pulau Tioman">Pulau Tioman</option>
                  <option value="Tanjung Gelang">Tanjung Gelang</option>
                  <option value="Cendering">Cendering</option>
                  <option value="Geting">Geting</option>
                  <option value="Pulau Lakei">Pulau Lakei</option>
                  <option value="Sejingkat">Sejingkat</option>
                  <option value="Bintulu">Bintulu</option>
                  <option value="Miri">Miri</option>
                  <option value="Kota Kinabalu">Kota Kinabalu</option>
                  <option value="Kudat">Kudat</option>
                  <option value="Sandakan">Sandakan</option>
                  <option value="Lahad Datu">Lahad Datu</option>
                  <option value="Tawau">Tawau</option>
                  <option value="Labuan">Labuan</option>
                </select>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                  Select the coastal location for tides data display
                </p>
              </div>
            )}

            {/* Last Sync Info */}
            {settings?.tides_enabled && settings?.tides_last_sync && (
              <div
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '12px 16px',
                  marginBottom: '24px',
                }}
              >
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#6b7280', margin: 0 }}>
                  <i className="bi bi-clock-history" style={{ marginRight: '8px' }}></i>
                  Last synced: {new Date(settings.tides_last_sync).toLocaleString('en-GB')}
                </p>
              </div>
            )}

            {/* Info Box */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '2px',
                padding: '16px',
                marginTop: '24px',
              }}
            >
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#1e40af', margin: 0 }}>
                <i className="bi bi-info-circle" style={{ marginRight: '8px' }}></i>
                <strong>Note:</strong> Tides data will be displayed in the weather widget breadcrumb. Data will auto-sync based on weather update frequency.
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={saving || !canPerformAction('integrations', 'edit')}
            style={{
              padding: '10px 24px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '2px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: '600',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <>
                <i className="bi bi-hourglass-split" style={{ marginRight: '8px' }}></i>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save" style={{ marginRight: '8px' }}></i>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Public Holidays Tab Component (embedded in Integrations)
function PublicHolidaysTab({ hash }: { hash: string }) {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [mode, setMode] = useState<'all' | 'single'>('single');
  const [selectedState, setSelectedState] = useState('13'); // Default Sarawak
  const [holidays, setHolidays] = useState<any[]>([]);
  const [customHolidays, setCustomHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    start_date: '',
    end_date: '',
    name: '',
    notes: '',
    apply_all_states: true,
    selected_states: [] as string[],
  });

  // Default detection state (for holiday checking across the system)
  const [defaultDetectionState, setDefaultDetectionState] = useState<string>('14');
  const [savingDefault, setSavingDefault] = useState(false);

  const STATES = [
    { code: '01', name: 'Johor' },
    { code: '02', name: 'Kedah' },
    { code: '03', name: 'Kelantan' },
    { code: '04', name: 'Melaka' },
    { code: '05', name: 'Negeri Sembilan' },
    { code: '06', name: 'Pahang' },
    { code: '07', name: 'Penang' },
    { code: '08', name: 'Perak' },
    { code: '09', name: 'Perlis' },
    { code: '10', name: 'Selangor' },
    { code: '11', name: 'Terengganu' },
    { code: '12', name: 'Sabah' },
    { code: '13', name: 'Sarawak' },
    { code: '14', name: 'Kuala Lumpur' },
    { code: '15', name: 'Labuan' },
    { code: '16', name: 'Putrajaya' },
  ];

  useEffect(() => {
    // Fetch current default detection state from integrations
    (async () => {
      try {
        const res = await fetch('/api/admin/integrations', { headers: { Authorization: `Bearer ${hash}` } });
        if (res.ok) {
          const data = await res.json();
          let code = '14';
          if (Array.isArray(data.holidays_include_states) && data.holidays_include_states.length > 0) {
            code = String(data.holidays_include_states[0]);
          }
          setDefaultDetectionState(code);
        }
      } catch {}
    })();
    fetchHolidays();
    fetchCustomHolidays();
  }, [selectedYear, mode, selectedState]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        mode,
        ...(mode === 'single' && { state: selectedState }),
      });

      const res = await fetch(`/api/admin/holidays?${params}`, {
        headers: { Authorization: `Bearer ${hash}` },
      });

      if (res.ok) {
        const data = await res.json();
        setHolidays(data.holidays || []);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomHolidays = async () => {
    try {
      const res = await fetch(`/api/admin/holidays/custom?year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${hash}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCustomHolidays(data.customHolidays || []);
      }
    } catch (error) {
      console.error('Error fetching custom holidays:', error);
    }
  };

  const handleSync = async () => {
    if (!confirm('Sync cuti umum dari npm package? Ini akan update data terkini.')) return;

    setSyncing(true);
    try {
      const res = await fetch('/api/admin/holidays/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hash}`,
        },
        body: JSON.stringify({
          year: selectedYear,
          state: mode === 'single' ? selectedState : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Sync berjaya! ${data.synced} cuti ditambah/dikemaskini.`);
        fetchHolidays();
      } else {
        alert('❌ Sync gagal. Sila cuba lagi.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Sync gagal. Sila cuba lagi.');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddCustomHoliday = async () => {
    if (!modalData.start_date || !modalData.name) {
      alert('Sila isi tarikh dan nama cuti.');
      return;
    }

    try {
      const res = await fetch('/api/admin/holidays/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hash}`,
        },
        body: JSON.stringify({
          ...modalData,
          end_date: modalData.end_date || modalData.start_date,
          state_codes: modalData.apply_all_states ? null : modalData.selected_states,
        }),
      });

      if (res.ok) {
        alert('✅ Cuti khas ditambah!');
        setShowModal(false);
        setModalData({
          start_date: '',
          end_date: '',
          name: '',
          notes: '',
          apply_all_states: true,
          selected_states: [],
        });
        fetchCustomHolidays();
      } else {
        alert('❌ Gagal menambah cuti khas.');
      }
    } catch (error) {
      console.error('Add custom holiday error:', error);
      alert('❌ Gagal menambah cuti khas.');
    }
  };

  const handleDeleteCustomHoliday = async (id: number) => {
    if (!confirm('Padam cuti khas ini?')) return;

    try {
      const res = await fetch(`/api/admin/holidays/custom/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${hash}` },
      });

      if (res.ok) {
        alert('✅ Cuti khas dipadam!');
        fetchCustomHolidays();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const years = Array.from({ length: 3 }, (_, i) => 2024 + i);

  // Format date to "1 January 2025"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="tab-content">
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
        Public Holidays Configuration
      </h3>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#6b7280', marginBottom: '24px' }}>
        Manage Malaysian public holidays using date-holidays npm package
      </p>

      {/* Filters */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '2px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: '24px', alignItems: 'start' }}>
          {/* Year Selector */}
          <div>
            <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '2px',
                fontSize: '12px',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selector */}
          <div>
            <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              Display Mode
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                <input
                  type="radio"
                  checked={mode === 'all'}
                  onChange={() => setMode('all')}
                  style={{ marginRight: '8px' }}
                />
                All States
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                <input
                  type="radio"
                  checked={mode === 'single'}
                  onChange={() => setMode('single')}
                  style={{ marginRight: '8px' }}
                />
                Single State
              </label>
            </div>
          </div>

          {/* State Selector (if single mode) */}
          {mode === 'single' && (
            <div>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                Select State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{
                  minWidth: '200px',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sync Button */}
        <div style={{ marginTop: '16px' }}>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            style={{
              padding: '8px 16px',
              background: syncing ? '#9ca3af' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '2px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {syncing ? '🔄 Syncing...' : '🔄 Sync Latest Holidays'}
          </button>
        </div>

        {/* Default Detection State (system-wide) */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 500 }}>Default Detection State</label>
          <select
            value={defaultDetectionState}
            onChange={(e) => setDefaultDetectionState(e.target.value)}
            style={{ minWidth: '220px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '2px', fontSize: '12px' }}
          >
            {STATES.map((state) => (
              <option key={state.code} value={state.code}>{state.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={async () => {
              setSavingDefault(true);
              try {
                const fd = new FormData();
                fd.append('holidays_include_states', defaultDetectionState);
                const res = await fetch('/api/admin/integrations', { method: 'PUT', headers: { Authorization: `Bearer ${hash}` }, body: fd });
                if (res.ok) {
                  alert('Default state saved!');
                } else {
                  alert('Failed to save default state');
                }
              } catch {}
              setSavingDefault(false);
            }}
            disabled={savingDefault}
            style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '11px', cursor: savingDefault ? 'not-allowed' : 'pointer' }}
          >
            {savingDefault ? 'Saving...' : 'Save Default'}
          </button>
        </div>
      </div>

      {/* Holidays Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
        {mode === 'single' && (
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: '600', margin: 0 }}>
              Public Holidays {STATES.find((s) => s.code === selectedState)?.name} {selectedYear} ({holidays.length} days)
            </h3>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
                Date
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
                Day
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
                Holiday Name
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
                Type of Holiday
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                  Loading...
                </td>
              </tr>
            ) : holidays.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                  No holiday data. Click "Sync Latest Holidays" to download.
                </td>
              </tr>
            ) : (
              holidays.map((holiday, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>{formatDate(holiday.date)}</td>
                  <td style={{ padding: '12px' }}>{holiday.day_name}</td>
                  <td style={{ padding: '12px' }}>{holiday.name}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '2px',
                        fontSize: '10px',
                        fontWeight: '500',
                        background: holiday.type === 'national' ? '#d1fae5' : '#dbeafe',
                        color: holiday.type === 'national' ? '#065f46' : '#1e40af',
                      }}
                    >
                      {holiday.type === 'national' ? 'National Holiday' : 'Regional Holiday'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Holidays Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: '600', margin: 0 }}>
            Custom Holidays (Manual Entry)
          </h4>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            + Add Custom Holiday
          </button>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Holiday Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>States</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Notes</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customHolidays.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                    No custom holidays. Click "Add Custom Holiday" to add one.
                  </td>
                </tr>
              ) : (
                customHolidays.map((custom) => (
                  <tr key={custom.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      {custom.start_date === custom.end_date ? formatDate(custom.start_date) : `${formatDate(custom.start_date)} - ${formatDate(custom.end_date)}`}
                    </td>
                    <td style={{ padding: '12px' }}>{custom.name}</td>
                    <td style={{ padding: '12px' }}>
                      {custom.state_codes === null || custom.state_codes.length === 0
                        ? 'All States'
                        : custom.state_codes
                            .map((code: string) => STATES.find((s) => s.code === code)?.name)
                            .filter(Boolean)
                            .join(', ')}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>{custom.notes || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomHoliday(custom.id)}
                        style={{
                          padding: '4px 12px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          fontFamily: 'Poppins, sans-serif',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Holiday Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '2px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div style={{ background: '#10b981', color: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', fontFamily: 'Poppins, sans-serif' }}>Add Custom Holiday</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={modalData.start_date}
                  onChange={(e) => setModalData({ ...modalData, start_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '2px', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  End Date (optional, leave blank if single day)
                </label>
                <input
                  type="date"
                  value={modalData.end_date}
                  onChange={(e) => setModalData({ ...modalData, end_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '2px', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  Holiday Name
                </label>
                <input
                  type="text"
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  placeholder="Example: Election Day"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '2px', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  States Applicable
                </label>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={modalData.apply_all_states}
                    onChange={(e) =>
                      setModalData({ ...modalData, apply_all_states: e.target.checked, selected_states: [] })
                    }
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px' }}>✅ All States (16 states)</span>
                </label>

                {!modalData.apply_all_states && (
                  <div
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '2px',
                      padding: '12px',
                      maxHeight: '200px',
                      overflow: 'auto',
                      background: '#f9fafb',
                    }}
                  >
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginBottom: '8px' }}>
                      Or select specific states:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {STATES.map((state) => (
                        <label key={state.code} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={modalData.selected_states.includes(state.code)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setModalData({
                                  ...modalData,
                                  selected_states: [...modalData.selected_states, state.code],
                                });
                              } else {
                                setModalData({
                                  ...modalData,
                                  selected_states: modalData.selected_states.filter((c) => c !== state.code),
                                });
                              }
                            }}
                            style={{ marginRight: '8px' }}
                          />
                          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px' }}>{state.name}</span>
                        </label>
                      ))}
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#6b7280', marginTop: '8px' }}>
                      This holiday will apply to {modalData.apply_all_states ? '16' : modalData.selected_states.length} state(s)
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={modalData.notes}
                  onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                  placeholder="Example: Special holiday for general election"
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '2px', fontSize: '11px', fontFamily: 'Poppins, sans-serif', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', fontWeight: '500', fontFamily: 'Poppins, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomHoliday}
                  style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', fontWeight: '500', fontFamily: 'Poppins, sans-serif' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

