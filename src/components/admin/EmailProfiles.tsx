'use client';

import React, { useState, useEffect } from 'react';

interface EmailProfilesProps {
  hash: string;
}

interface EmailProfile {
  id: number;
  profile_key: string;
  profile_name: string;
  provider_type: 'gmail' | 'custom_smtp';
  email_address: string;
  from_name: string;
  reply_to: string | null;
  smtp_host: string;
  smtp_port: number;
  smtp_encryption: 'tls' | 'ssl' | 'none';
  smtp_authentication: boolean;
  smtp_username: string;
  smtp_password: string; // Hidden
  connection_timeout: number;
  max_retries: number;
  is_active: boolean;
  last_test_at: string | null;
  test_status: 'success' | 'failed' | 'not_tested';
  test_message: string | null;
}

const EmailProfiles: React.FC<EmailProfilesProps> = ({ hash }) => {
  const [profiles, setProfiles] = useState<EmailProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<string>('support');
  const [formData, setFormData] = useState({
    profile_key: 'support',
    profile_name: 'Support Email',
    provider_type: 'gmail' as 'gmail' | 'custom_smtp',
    email_address: '',
    from_name: '',
    reply_to: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_encryption: 'tls' as 'tls' | 'ssl' | 'none',
    smtp_authentication: true,
    smtp_username: '',
    smtp_password: '',
    connection_timeout: 30,
    max_retries: 3,
    is_active: true
  });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    // Load selected profile data
    const profile = profiles.find(p => p.profile_key === selectedProfile);
    if (profile) {
      setFormData({
        profile_key: profile.profile_key,
        profile_name: profile.profile_name,
        provider_type: profile.provider_type,
        email_address: profile.email_address,
        from_name: profile.from_name,
        reply_to: profile.reply_to || '',
        smtp_host: profile.smtp_host,
        smtp_port: profile.smtp_port,
        smtp_encryption: profile.smtp_encryption,
        smtp_authentication: profile.smtp_authentication,
        smtp_username: profile.smtp_username,
        smtp_password: '', // Don't pre-fill password
        connection_timeout: profile.connection_timeout,
        max_retries: profile.max_retries,
        is_active: profile.is_active
      });
    }
  }, [selectedProfile, profiles]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email-profiles', {
        headers: {
          'Authorization': `Bearer ${hash}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setProfiles(data.profiles);
      } else {
        alert('Failed to fetch email profiles');
      }
    } catch (error) {
      console.error('Fetch profiles error:', error);
      alert('Failed to fetch email profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: 'gmail' | 'custom_smtp') => {
    if (provider === 'gmail') {
      setFormData(prev => ({
        ...prev,
        provider_type: 'gmail',
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_encryption: 'tls',
        smtp_authentication: true
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        provider_type: 'custom_smtp',
        smtp_host: '',
        smtp_port: 587,
        smtp_encryption: 'tls'
      }));
    }
  };

  const handleTestConnection = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/admin/email-profiles/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hash}`
        },
        body: JSON.stringify({ 
          profile_key: formData.profile_key,
          test_email: testEmail
        })
      });

      const data = await response.json();
      setTestResult(data);

      // Refresh profiles to get updated test status
      await fetchProfiles();
      
      // Close modal on success
      if (data.success) {
        setTimeout(() => {
          setShowTestModal(false);
          setTestEmail('');
        }, 2000);
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setTestResult({
        success: false,
        message: 'Failed to test connection'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.email_address || !formData.from_name || !formData.smtp_password) {
      alert('Please fill in all required fields, including password');
      return;
    }

    setSaving(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/admin/email-profiles', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hash}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Email profile saved successfully');
        await fetchProfiles();
        setFormData(prev => ({ ...prev, smtp_password: '' })); // Clear password after save
      } else {
        alert(data.error || 'Failed to save email profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save email profile');
    } finally {
      setSaving(false);
    }
  };

  const currentProfile = profiles.find(p => p.profile_key === selectedProfile);

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        fontFamily: 'Poppins, sans-serif',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        Loading email profiles...
      </div>
    );
  }

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => e.preventDefault()}
      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}
    >
      {/* Profile Selector */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: '600', color: '#374151' }}>Select Email Profile:</span>
        {profiles.map(profile => (
          <button
            key={profile.profile_key}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedProfile(profile.profile_key);
            }}
            type="button"
            style={{
              padding: '8px 16px',
              borderRadius: '2px',
              border: selectedProfile === profile.profile_key 
                ? '2px solid #3b82f6' 
                : '1px solid #d1d5db',
              background: selectedProfile === profile.profile_key 
                ? '#eff6ff' 
                : '#ffffff',
              color: selectedProfile === profile.profile_key 
                ? '#1e40af' 
                : '#374151',
              fontWeight: selectedProfile === profile.profile_key ? '600' : '500',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {profile.profile_key === 'support' && '📧'}
            {profile.profile_key === 'hr' && '👥'}
            {profile.profile_name}
            {profile.is_active ? (
              <span style={{ color: '#10b981', fontSize: '10px' }}>●</span>
            ) : (
              <span style={{ color: '#ef4444', fontSize: '10px' }}>●</span>
            )}
          </button>
        ))}
      </div>

      {/* Configuration Form */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '2px',
        padding: '24px'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {formData.profile_key === 'support' && '📧'}
          {formData.profile_key === 'hr' && '👥'}
          {formData.profile_name} Configuration
        </h3>

        {/* Provider Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#374151',
            fontSize: '11px'
          }}>
            Provider Type: <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="provider_type"
                value="gmail"
                checked={formData.provider_type === 'gmail'}
                onChange={() => handleProviderChange('gmail')}
              />
              <span style={{ fontSize: '12px', color: '#374151' }}>Gmail / Google Workspace</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="provider_type"
                value="custom_smtp"
                checked={formData.provider_type === 'custom_smtp'}
                onChange={() => handleProviderChange('custom_smtp')}
              />
              <span style={{ fontSize: '12px', color: '#374151' }}>Custom SMTP Server</span>
            </label>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          paddingTop: '20px',
          marginBottom: '20px' 
        }} />

        {/* Email Address */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: '600',
            color: '#374151',
            fontSize: '11px'
          }}>
            Email Address: <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="email"
            value={formData.email_address}
            onChange={(e) => setFormData(prev => ({ ...prev, email_address: e.target.value }))}
            placeholder="support@ansartechnologies.my"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '2px',
              fontSize: '12px',
              fontFamily: 'Poppins, sans-serif'
            }}
          />
        </div>

        {/* Display Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: '600',
            color: '#374151',
            fontSize: '11px'
          }}>
            Display Name (From): <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.from_name}
            onChange={(e) => setFormData(prev => ({ ...prev, from_name: e.target.value }))}
            placeholder="ANSAR TECHNOLOGIES - Support Department"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '2px',
              fontSize: '12px',
              fontFamily: 'Poppins, sans-serif'
            }}
          />
        </div>

        {/* Reply-To */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: '600',
            color: '#374151',
            fontSize: '11px'
          }}>
            Reply-To Email (Optional):
          </label>
          <input
            type="email"
            value={formData.reply_to}
            onChange={(e) => setFormData(prev => ({ ...prev, reply_to: e.target.value }))}
            placeholder="support@ansartechnologies.my"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '2px',
              fontSize: '12px',
              fontFamily: 'Poppins, sans-serif'
            }}
          />
        </div>

        {/* Provider-Specific Configuration */}
        {formData.provider_type === 'gmail' ? (
          <div style={{
            background: '#f3f4f6',
            padding: '16px',
            borderRadius: '2px',
            marginBottom: '16px'
          }}>
            <h4 style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Gmail / Google Workspace Settings
            </h4>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500',
                color: '#4b5563',
                fontSize: '11px'
              }}>
                SMTP Host: <span style={{ color: '#6b7280', fontWeight: '400' }}>(Auto-configured)</span>
              </label>
              <input
                type="text"
                value="smtp.gmail.com"
                disabled
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif',
                  background: '#e5e7eb',
                  color: '#6b7280'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500',
                  color: '#4b5563',
                  fontSize: '11px'
                }}>
                  Port:
                </label>
                <input
                  type="text"
                  value="587"
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '12px',
                    fontFamily: 'Poppins, sans-serif',
                    background: '#e5e7eb',
                    color: '#6b7280'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500',
                  color: '#4b5563',
                  fontSize: '11px'
                }}>
                  Encryption:
                </label>
                <input
                  type="text"
                  value="TLS"
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '12px',
                    fontFamily: 'Poppins, sans-serif',
                    background: '#e5e7eb',
                    color: '#6b7280'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '11px'
              }}>
                Gmail App Password: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={formData.smtp_password}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_password: e.target.value }))}
                placeholder="Enter Gmail App Password (xxxx xxxx xxxx xxxx)"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <p style={{ 
                marginTop: '6px', 
                fontSize: '10px', 
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Generate an App Password from Google Account → Security → 2-Step Verification → App passwords
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#f3f4f6',
            padding: '16px',
            borderRadius: '2px',
            marginBottom: '16px'
          }}>
            <h4 style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Custom SMTP Server Settings
            </h4>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '11px'
              }}>
                SMTP Host: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.smtp_host}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_host: e.target.value }))}
                placeholder="mail.yourdomain.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '11px'
                }}>
                  Port: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtp_port: parseInt(e.target.value) || 587 }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '12px',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '11px'
                }}>
                  Encryption: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.smtp_encryption}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    smtp_encryption: e.target.value as 'tls' | 'ssl' | 'none',
                    smtp_port: e.target.value === 'ssl' ? 465 : 587
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    fontSize: '12px',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  <option value="tls">TLS (Port 587)</option>
                  <option value="ssl">SSL (Port 465)</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '11px'
              }}>
                Username: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.smtp_username}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_username: e.target.value }))}
                placeholder="your-email@domain.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '11px'
              }}>
                Password: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={formData.smtp_password}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_password: e.target.value }))}
                placeholder="Enter SMTP password"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.smtp_authentication}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtp_authentication: e.target.checked }))}
                />
                <span style={{ fontSize: '11px', color: '#374151', fontWeight: '500' }}>
                  Authentication Required
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        <div style={{
          background: '#f9fafb',
          padding: '16px',
          borderRadius: '2px',
          marginBottom: '20px'
        }}>
          <h4 style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Connection Settings (Advanced)
          </h4>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500',
                color: '#4b5563',
                fontSize: '11px'
              }}>
                Connection Timeout (seconds):
              </label>
              <input
                type="number"
                value={formData.connection_timeout}
                onChange={(e) => setFormData(prev => ({ ...prev, connection_timeout: parseInt(e.target.value) || 30 }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500',
                color: '#4b5563',
                fontSize: '11px'
              }}>
                Max Retries:
              </label>
              <input
                type="number"
                value={formData.max_retries}
                onChange={(e) => setFormData(prev => ({ ...prev, max_retries: parseInt(e.target.value) || 3 }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTestModal(true);
            }}
            disabled={false}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '2px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Test Connection
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave();
            }}
            disabled={saving || !formData.smtp_password}
            style={{
              padding: '10px 20px',
              background: saving ? '#d1d5db' : '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '2px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div style={{
            padding: '12px 16px',
            background: testResult.success ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`,
            borderRadius: '2px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '11px',
              color: testResult.success ? '#065f46' : '#991b1b',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              {testResult.success ? '✓ Success' : '✗ Failed'}
            </p>
            <p style={{
              fontSize: '11px',
              color: testResult.success ? '#047857' : '#dc2626',
              margin: 0
            }}>
              {testResult.message}
            </p>
          </div>
        )}

        {/* Status */}
        {currentProfile && (
          <div style={{
            padding: '12px 16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '2px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Status: 
              </span>
              <span style={{
                marginLeft: '8px',
                fontSize: '11px',
                fontWeight: '600',
                color: currentProfile.is_active ? '#10b981' : '#ef4444'
              }}>
                {currentProfile.is_active ? '● Active' : '● Inactive'}
              </span>
            </div>
            {currentProfile.last_test_at && (
              <span style={{ fontSize: '10px', color: '#6b7280' }}>
                Last tested: {new Date(currentProfile.last_test_at).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Test Connection Modal */}
      {showTestModal && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '2px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h3 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Test Email Connection
            </h3>
            <p style={{
              fontSize: '11px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Enter an email address to receive a test email from this profile
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '11px'
              }}>
                Test Email Address: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@example.com"
                disabled={testing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <p style={{
                marginTop: '6px',
                fontSize: '10px',
                color: '#6b7280'
              }}>
                A test email will be sent to this address to verify the SMTP configuration
              </p>
            </div>

            {/* Test Result */}
            {testResult && (
              <div style={{
                padding: '12px 16px',
                background: testResult.success ? '#d1fae5' : '#fee2e2',
                border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`,
                borderRadius: '2px',
                marginBottom: '20px'
              }}>
                <p style={{
                  fontSize: '11px',
                  color: testResult.success ? '#065f46' : '#991b1b',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {testResult.success ? '✓ Success' : '✗ Failed'}
                </p>
                <p style={{
                  fontSize: '11px',
                  color: testResult.success ? '#047857' : '#dc2626',
                  margin: 0
                }}>
                  {testResult.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTestModal(false);
                  setTestEmail('');
                  setTestResult(null);
                }}
                disabled={testing}
                style={{
                  padding: '10px 20px',
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: testing ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTestConnection();
                }}
                disabled={testing || !testEmail || !testEmail.includes('@')}
                style={{
                  padding: '10px 20px',
                  background: (testing || !testEmail || !testEmail.includes('@')) ? '#d1d5db' : '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '2px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: (testing || !testEmail || !testEmail.includes('@')) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {testing ? 'Sending Test Email...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailProfiles;

