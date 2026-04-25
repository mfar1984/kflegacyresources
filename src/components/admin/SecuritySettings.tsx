"use client";

import { useState, useEffect } from 'react';

interface SecurityConfig {
  // Rate Limiting
  rateLimitEnabled: boolean;
  rateLimitMaxRequests: number;
  rateLimitWindowMinutes: number;
  
  // Account Lockout
  accountLockoutEnabled: boolean;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  
  // Password Policy
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  
  // Session
  sessionExpiryHours: number;
  
  // Security Headers
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXFrameOptions: boolean;
}

export default function SecuritySettings() {
  const [config, setConfig] = useState<SecurityConfig>({
    rateLimitEnabled: true,
    rateLimitMaxRequests: 10,
    rateLimitWindowMinutes: 15,
    accountLockoutEnabled: true,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    sessionExpiryHours: 24,
    enableCSP: true,
    enableHSTS: true,
    enableXFrameOptions: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/security-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Failed to load security config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/security-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Security settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save security settings' });
      }
    } catch (error) {
      console.error('Failed to save security settings:', error);
      setMessage({ type: 'error', text: 'Failed to save security settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="security-settings">
      <h2>Security Settings</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-section">
        <h3>Rate Limiting</h3>
        <label>
          <input
            type="checkbox"
            checked={config.rateLimitEnabled}
            onChange={(e) => setConfig({ ...config, rateLimitEnabled: e.target.checked })}
          />
          Enable Rate Limiting
        </label>
        <label>
          Max Requests:
          <input
            type="number"
            value={config.rateLimitMaxRequests}
            onChange={(e) => setConfig({ ...config, rateLimitMaxRequests: parseInt(e.target.value) })}
          />
        </label>
        <label>
          Window (minutes):
          <input
            type="number"
            value={config.rateLimitWindowMinutes}
            onChange={(e) => setConfig({ ...config, rateLimitWindowMinutes: parseInt(e.target.value) })}
          />
        </label>
      </div>

      <div className="settings-section">
        <h3>Account Lockout</h3>
        <label>
          <input
            type="checkbox"
            checked={config.accountLockoutEnabled}
            onChange={(e) => setConfig({ ...config, accountLockoutEnabled: e.target.checked })}
          />
          Enable Account Lockout
        </label>
        <label>
          Max Login Attempts:
          <input
            type="number"
            value={config.maxLoginAttempts}
            onChange={(e) => setConfig({ ...config, maxLoginAttempts: parseInt(e.target.value) })}
          />
        </label>
        <label>
          Lockout Duration (minutes):
          <input
            type="number"
            value={config.lockoutDurationMinutes}
            onChange={(e) => setConfig({ ...config, lockoutDurationMinutes: parseInt(e.target.value) })}
          />
        </label>
      </div>

      <div className="settings-section">
        <h3>Password Policy</h3>
        <label>
          Minimum Length:
          <input
            type="number"
            value={config.minPasswordLength}
            onChange={(e) => setConfig({ ...config, minPasswordLength: parseInt(e.target.value) })}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.requireUppercase}
            onChange={(e) => setConfig({ ...config, requireUppercase: e.target.checked })}
          />
          Require Uppercase
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.requireLowercase}
            onChange={(e) => setConfig({ ...config, requireLowercase: e.target.checked })}
          />
          Require Lowercase
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.requireNumbers}
            onChange={(e) => setConfig({ ...config, requireNumbers: e.target.checked })}
          />
          Require Numbers
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.requireSpecialChars}
            onChange={(e) => setConfig({ ...config, requireSpecialChars: e.target.checked })}
          />
          Require Special Characters
        </label>
      </div>

      <div className="settings-section">
        <h3>Session</h3>
        <label>
          Session Expiry (hours):
          <input
            type="number"
            value={config.sessionExpiryHours}
            onChange={(e) => setConfig({ ...config, sessionExpiryHours: parseInt(e.target.value) })}
          />
        </label>
      </div>

      <div className="settings-section">
        <h3>Security Headers</h3>
        <label>
          <input
            type="checkbox"
            checked={config.enableCSP}
            onChange={(e) => setConfig({ ...config, enableCSP: e.target.checked })}
          />
          Enable Content Security Policy
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.enableHSTS}
            onChange={(e) => setConfig({ ...config, enableHSTS: e.target.checked })}
          />
          Enable HTTP Strict Transport Security
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.enableXFrameOptions}
            onChange={(e) => setConfig({ ...config, enableXFrameOptions: e.target.checked })}
          />
          Enable X-Frame-Options
        </label>
      </div>

      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}