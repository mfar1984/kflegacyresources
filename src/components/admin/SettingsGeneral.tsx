'use client';

import { useState, useEffect } from 'react';

interface GeneralSettings {
  // Site Branding
  admin_sidebar_logo: string;
  admin_login_logo: string;
  web_menu_logo: string;
  favicon_ico: string;
  
  // Site Information
  site_title: string;
  site_description: string;
  site_tagline: string;
  
  // Regional Settings
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
  
  // Contact Information
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

interface EmailSettings {
  // SMTP Configuration
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  
  // Email Settings
  smtp_from_name: string;
  smtp_from_email: string;
  smtp_reply_to: string;
  
  // Notifications
  notify_new_order: boolean;
  notify_customer_inquiry: boolean;
  notify_low_stock: boolean;
}

interface PaymentSettings {
  // CHIP Configuration
  chip_brand_id: string;
  chip_secret_key: string;
  chip_public_key: string;
  chip_webhook_url: string;
  chip_test_mode: boolean;
  
  // Payment Settings
  payment_currency: string;
  payment_currency_symbol: string;
  payment_min_amount: string;
  payment_max_amount: string;
  
  // Payment Methods
  payment_fpx_enabled: boolean;
  payment_card_enabled: boolean;
  payment_ewallet_enabled: boolean;
}

interface SocialSettings {
  // Social Media
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
  social_twitter: string;
  social_whatsapp: string;
  social_youtube: string;
  
  // Analytics
  analytics_google_id: string;
  analytics_gtm_id: string;
  analytics_facebook_pixel: string;
  analytics_tiktok_pixel: string;
  
  // SEO
  seo_meta_keywords: string;
  seo_meta_author: string;
  seo_meta_robots: string;
  seo_og_type: string;
}

interface ApiSettings {
  api_enabled: boolean;
  api_key: string;
  api_secret: string;
  api_allowed_origins: string;
  api_rate_limit: number;
  api_rate_limit_window: number;
  api_webhook_secret: string;
  api_cors_enabled: boolean;
  api_require_https: boolean;
  api_log_requests: boolean;
}

interface MaintenanceSettings {
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_allowed_ips: string;
  maintenance_scheduled_start: string;
  maintenance_scheduled_end: string;
  system_debug_mode: boolean;
  system_log_level: string;
  system_log_retention_days: string;
  system_cache_enabled: boolean;
  system_cache_ttl: string;
  system_backup_enabled: boolean;
  system_backup_schedule: string;
  system_backup_retention: string;
}

interface SecuritySettings {
  // Admin Credentials
  admin_username: string;
  admin_password: string;
  session_secret: string;
  
  // Rate Limiting
  rate_limit_enabled: boolean;
  rate_limit_max_requests: number;
  rate_limit_window_minutes: number;
  
  // Brute Force Protection
  brute_force_enabled: boolean;
  brute_force_max_attempts: number;
  brute_force_lockout_minutes: number;
  
  // Password Security
  bcrypt_rounds: number;
}

export default function SettingsGeneral() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'payment' | 'social' | 'api' | 'maintenance' | 'cache' | 'backup'>('general');
  
  // Cache settings
  const [cacheSettings, setCacheSettings] = useState({
    cache_enabled: true,
    cache_ttl: '3600',
    cache_driver: 'redis',
    revalidate_on_demand: true,
  });

  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    backup_enabled: false,
    backup_schedule: 'daily',
    backup_retention: '7',
    backup_location: 'local',
    backup_include_database: true,
    backup_include_files: true,
    // FTP Settings
    ftp_host: '',
    ftp_port: '21',
    ftp_username: '',
    ftp_password: '',
    ftp_path: '/backups',
    // Cloudflare R2 Settings
    r2_account_id: '',
    r2_access_key_id: '',
    r2_secret_access_key: '',
    r2_bucket_name: '',
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [testingChip, setTestingChip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [showBackupHistory, setShowBackupHistory] = useState(false);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [cleaningBackups, setCleaningBackups] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // General settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    admin_sidebar_logo: '/assets/img/logo.png',
    admin_login_logo: '/assets/img/logo.png',
    web_menu_logo: '/assets/img/logo.png',
    favicon_ico: '/favicon.ico',
    site_title: 'KF Legacy Resources',
    site_description: 'Network Infrastructure & Security Solutions',
    site_tagline: 'Your Trusted IT Partner',
    timezone: 'Asia/Kuala_Lumpur',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    language: 'en',
    contact_email: 'info@kflegacy.com',
    contact_phone: '+60 3-1234 5678',
    contact_address: 'Kuala Lumpur, Malaysia',
  });

  // Email settings
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_name: 'KF Legacy Resources',
    smtp_from_email: 'noreply@kflegacy.com',
    smtp_reply_to: 'info@kflegacy.com',
    notify_new_order: true,
    notify_customer_inquiry: true,
    notify_low_stock: true,
  });

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    chip_brand_id: '',
    chip_secret_key: '',
    chip_public_key: '',
    chip_webhook_url: '',
    chip_test_mode: false,
    payment_currency: 'MYR',
    payment_currency_symbol: 'RM',
    payment_min_amount: '10',
    payment_max_amount: '50000',
    payment_fpx_enabled: true,
    payment_card_enabled: true,
    payment_ewallet_enabled: true,
  });

  // Social settings
  const [socialSettings, setSocialSettings] = useState<SocialSettings>({
    social_facebook: '',
    social_instagram: '',
    social_linkedin: '',
    social_twitter: '',
    social_whatsapp: '',
    social_youtube: '',
    analytics_google_id: '',
    analytics_gtm_id: '',
    analytics_facebook_pixel: '',
    analytics_tiktok_pixel: '',
    seo_meta_keywords: 'network, infrastructure, security, IT solutions',
    seo_meta_author: 'KF Legacy Resources',
    seo_meta_robots: 'index, follow',
    seo_og_type: 'website',
  });

  // API settings
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    api_enabled: false,
    api_key: '',
    api_secret: '',
    api_allowed_origins: '',
    api_rate_limit: 100,
    api_rate_limit_window: 60,
    api_webhook_secret: '',
    api_cors_enabled: true,
    api_require_https: true,
    api_log_requests: true,
  });

  // Maintenance settings
  const [maintenanceSettings, setMaintenanceSettings] = useState<MaintenanceSettings>({
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance. Please check back soon.',
    maintenance_allowed_ips: '',
    maintenance_scheduled_start: '',
    maintenance_scheduled_end: '',
    system_debug_mode: false,
    system_log_level: 'error',
    system_log_retention_days: '30',
    system_cache_enabled: true,
    system_cache_ttl: '3600',
    system_backup_enabled: false,
    system_backup_schedule: 'daily',
    system_backup_retention: '7',
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    admin_username: '',
    admin_password: '',
    session_secret: '',
    rate_limit_enabled: true,
    rate_limit_max_requests: 10,
    rate_limit_window_minutes: 15,
    brute_force_enabled: true,
    brute_force_max_attempts: 5,
    brute_force_lockout_minutes: 15,
    bcrypt_rounds: 10,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings-general');
      const data = await response.json();

      if (data.success && data.settings) {
        if (data.settings.general) {
          setGeneralSettings(prev => ({ ...prev, ...data.settings.general }));
        }
        if (data.settings.security) {
          setSecuritySettings(prev => ({ ...prev, ...data.settings.security }));
        }
        if (data.settings.email) {
          setEmailSettings(prev => ({ ...prev, ...data.settings.email }));
        }
        if (data.settings.payment) {
          setPaymentSettings(prev => ({ ...prev, ...data.settings.payment }));
        }
        if (data.settings.social) {
          setSocialSettings(prev => ({ ...prev, ...data.settings.social }));
        }
        if (data.settings.api) {
          setApiSettings(prev => ({ ...prev, ...data.settings.api }));
        }
        if (data.settings.maintenance) {
          setMaintenanceSettings(prev => ({ ...prev, ...data.settings.maintenance }));
        }
        if (data.settings.cache) {
          setCacheSettings(prev => ({ ...prev, ...data.settings.cache }));
        }
        if (data.settings.backup) {
          setBackupSettings(prev => ({ ...prev, ...data.settings.backup }));
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings-general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ general: generalSettings }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'General settings saved successfully!');
      } else {
        alert(`Failed to save: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save general settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings-general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ security: securitySettings }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Security settings saved successfully!');
      } else {
        alert(`Failed to save: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings-general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailSettings }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Email settings saved successfully!');
      } else {
        alert(`Failed to save: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings-general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment: paymentSettings }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Payment settings saved successfully!');
      } else {
        alert(`Failed to save: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocial = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings-general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ social: socialSettings }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Social & SEO settings saved successfully!');
      } else {
        alert(`Failed to save: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save social settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApi = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings-general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api: apiSettings }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'API settings saved successfully!');
      } else {
        alert(`Failed to save: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save API settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMaintenance = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings-general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenance: maintenanceSettings }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Maintenance settings saved successfully!');
      } else {
        alert(`Failed to save: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save maintenance settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCache = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings-general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cache: cacheSettings }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Cache settings saved successfully!');
      } else {
        alert(`Failed to save: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save cache settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBackup = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings-general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup: backupSettings }),
      });

      const data = await response.json();

      if (data.success) {
        // Restart backup scheduler with new settings
        try {
          const schedulerResponse = await fetch('/api/admin/backup/scheduler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'start' }),
          });
          
          const schedulerData = await schedulerResponse.json();
          console.log('Scheduler updated:', schedulerData.message);
        } catch (schedulerError) {
          console.error('Failed to update scheduler:', schedulerError);
        }

        alert(data.message || 'Backup settings saved successfully!');
      } else {
        alert(`Failed to save: ${data.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save backup settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (settingKey: keyof GeneralSettings, file: File) => {
    try {
      setUploading(settingKey);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Update setting with new image URL
        setGeneralSettings({ ...generalSettings, [settingKey]: data.url });
        
        // Auto-save to database
        const saveResponse = await fetch('/api/admin/settings-general', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            general: { [settingKey]: data.url } 
          }),
        });

        const saveData = await saveResponse.json();
        if (saveData.success) {
          alert('Image uploaded and saved successfully!');
        }
      } else {
        alert(`Upload failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(null);
    }
  };

  const triggerFileInput = (inputId: string) => {
    document.getElementById(inputId)?.click();
  };

  const handleCreateBackup = async () => {
    if (!confirm('Create backup now? This may take a few minutes depending on your data size.')) {
      return;
    }

    try {
      setCreatingBackup(true);

      const response = await fetch('/api/admin/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        alert(`Backup created successfully!\n\nBackup Name: ${data.backupName}\nLocation: ${data.path}\n\nResults:\n${data.results.join('\n')}`);
      } else {
        alert(`Failed to create backup: ${data.message}`);
      }
    } catch (error) {
      console.error('Backup creation error:', error);
      alert('Failed to create backup. Please check console for details.');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadLatest = async () => {
    try {
      // Fetch backup list
      const response = await fetch('/api/admin/backup/list');
      const data = await response.json();

      if (!data.success || data.backups.length === 0) {
        alert('No backups available to download');
        return;
      }

      // Get latest backup (first in sorted list)
      const latestBackup = data.backups[0];

      // Download the backup
      window.location.href = `/api/admin/backup/download?name=${encodeURIComponent(latestBackup.name)}`;
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download backup. Please check console for details.');
    }
  };

  const handleViewHistory = async () => {
    try {
      setLoadingHistory(true);
      setShowBackupHistory(true);

      const response = await fetch('/api/admin/backup/list');
      const data = await response.json();

      if (data.success) {
        setBackupHistory(data.backups);
      } else {
        alert('Failed to load backup history');
      }
    } catch (error) {
      console.error('History error:', error);
      alert('Failed to load backup history. Please check console for details.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDownloadBackup = (backupName: string) => {
    window.location.href = `/api/admin/backup/download?name=${encodeURIComponent(backupName)}`;
  };

  const handleTestConnection = async () => {
    const location = backupSettings.backup_location;
    
    if (location === 'local') {
      alert('Local storage does not require connection testing.');
      return;
    }

    try {
      setTestingConnection(true);

      const response = await fetch('/api/admin/backup/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          config: location === 'ftp' ? {
            host: backupSettings.ftp_host,
            port: backupSettings.ftp_port,
            username: backupSettings.ftp_username,
            password: backupSettings.ftp_password,
            path: backupSettings.ftp_path,
          } : {
            account_id: backupSettings.r2_account_id,
            access_key_id: backupSettings.r2_access_key_id,
            secret_access_key: backupSettings.r2_secret_access_key,
            bucket_name: backupSettings.r2_bucket_name,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Connection successful!\n\n${data.message}`);
      } else {
        alert(`❌ Connection failed!\n\n${data.message}`);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      alert('❌ Connection test failed. Please check console for details.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCleanOldBackups = async () => {
    if (!confirm(`Clean old backups based on retention settings (${backupSettings.backup_retention} days)?\n\nThis will permanently delete backups older than ${backupSettings.backup_retention} days.`)) {
      return;
    }

    try {
      setCleaningBackups(true);

      const response = await fetch('/api/admin/backup/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Failed to clean backups: ${data.message}`);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('❌ Failed to clean old backups. Please check console for details.');
    } finally {
      setCleaningBackups(false);
    }
  };

  const handleRestoreBackup = async (file: File) => {
    if (!confirm('⚠️ WARNING: Restoring will overwrite your current database and files!\n\nMake sure you have a backup of your current data before proceeding.\n\nDo you want to continue?')) {
      return;
    }

    try {
      setRestoringBackup(true);

      const formData = new FormData();
      formData.append('backup', file);

      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Backup restored successfully!\n\n${data.message}\n\nThe page will reload in 3 seconds...`);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        alert(`❌ Failed to restore backup: ${data.message}`);
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('❌ Failed to restore backup. Please check console for details.');
    } finally {
      setRestoringBackup(false);
    }
  };

  const handleRestoreFromHistory = async () => {
    try {
      setLoadingHistory(true);
      setShowRestoreModal(true);

      const response = await fetch('/api/admin/backup/list');
      const data = await response.json();

      if (data.success) {
        setBackupHistory(data.backups);
      } else {
        alert('Failed to load backup history');
      }
    } catch (error) {
      console.error('History error:', error);
      alert('Failed to load backup history. Please check console for details.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRestoreFromBackupName = async (backupName: string) => {
    if (!confirm(`⚠️ WARNING: Restore backup "${backupName}"?\n\nThis will overwrite your current database and files!\n\nMake sure you have a backup of your current data before proceeding.\n\nDo you want to continue?`)) {
      return;
    }

    try {
      setRestoringBackup(true);

      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupName }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Backup restored successfully!\n\n${data.message}\n\nThe page will reload in 3 seconds...`);
        setShowRestoreModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        alert(`❌ Failed to restore backup: ${data.message}`);
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('❌ Failed to restore backup. Please check console for details.');
    } finally {
      setRestoringBackup(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      alert('Please enter an email address to send test email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailAddress)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setSendingTestEmail(true);

      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          testEmail: testEmailAddress,
          smtpSettings: emailSettings,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Test email sent successfully!\n\nEmail sent to: ${testEmailAddress}\n\nPlease check your inbox (and spam folder).`);
        setTestEmailAddress('');
      } else {
        alert(`❌ Failed to send test email:\n\n${data.message}`);
      }
    } catch (error) {
      console.error('Test email error:', error);
      alert('❌ Failed to send test email. Please check console for details.');
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleTestChip = async () => {
    if (!paymentSettings.chip_brand_id || !paymentSettings.chip_secret_key) {
      alert('Please enter CHIP Brand ID and Secret Key before testing connection');
      return;
    }

    try {
      setTestingChip(true);

      const response = await fetch('/api/admin/chip/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chip_brand_id: paymentSettings.chip_brand_id,
          chip_secret_key: paymentSettings.chip_secret_key,
          chip_test_mode: paymentSettings.chip_test_mode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const balanceInfo = data.balance ? 
          `\n\nAccount Balance:\nMYR: RM ${data.balance.myr?.toFixed(2) || '0.00'}\nUSD: $ ${data.balance.usd?.toFixed(2) || '0.00'}` : 
          '';
        alert(`✅ CHIP connection successful!${balanceInfo}\n\nMode: ${paymentSettings.chip_test_mode ? 'Test Mode' : 'Production Mode'}`);
      } else {
        alert(`❌ CHIP connection failed!\n\n${data.message}`);
      }
    } catch (error) {
      console.error('CHIP test error:', error);
      alert('❌ Failed to test CHIP connection. Please check console for details.');
    } finally {
      setTestingChip(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Container Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                General Settings
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Configure general and security settings for your application
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                onClick={() => {
                  if (activeTab === 'general') handleSaveGeneral();
                  else if (activeTab === 'security') handleSaveSecurity();
                  else if (activeTab === 'email') handleSaveEmail();
                  else if (activeTab === 'payment') handleSavePayment();
                  else if (activeTab === 'social') handleSaveSocial();
                  else if (activeTab === 'api') handleSaveApi();
                  else if (activeTab === 'maintenance') handleSaveMaintenance();
                  else if (activeTab === 'cache') handleSaveCache();
                  else if (activeTab === 'backup') handleSaveBackup();
                }}
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

          {/* Tabs Navigation */}
          <ul className="nav nav-tabs mb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'general' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'general' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-gear me-2"></i>
                General
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'security' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'security' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-shield-lock me-2"></i>
                Security
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'email' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'email' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-envelope me-2"></i>
                Email
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'payment' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'payment' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-credit-card me-2"></i>
                Payment
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'social' ? 'active' : ''}`}
                onClick={() => setActiveTab('social')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'social' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'social' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-share me-2"></i>
                Social & SEO
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'api' ? 'active' : ''}`}
                onClick={() => setActiveTab('api')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'api' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'api' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-code-square me-2"></i>
                API
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'maintenance' ? 'active' : ''}`}
                onClick={() => setActiveTab('maintenance')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'maintenance' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'maintenance' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-tools me-2"></i>
                Maintenance
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'cache' ? 'active' : ''}`}
                onClick={() => setActiveTab('cache')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'cache' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'cache' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-lightning-charge me-2"></i>
                Cache
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'backup' ? 'active' : ''}`}
                onClick={() => setActiveTab('backup')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'backup' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'backup' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-cloud-arrow-down me-2"></i>
                Backup & Restore
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            {/* General Tab */}
            {activeTab === 'general' && (
              <div>
                {/* Site Branding Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Site Branding
                  </h6>

                  {/* Horizontal Layout - All 4 images in one row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {/* Admin Sidebar Logo */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                        Admin Sidebar Logo
                      </label>
                      <div 
                        onClick={() => triggerFileInput('admin_sidebar_logo_input')}
                        style={{ 
                          width: '100%',
                          height: '120px', 
                          border: '2px dashed #d1d5db', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: '#f9fafb',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                      >
                        {uploading === 'admin_sidebar_logo' ? (
                          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        ) : generalSettings.admin_sidebar_logo ? (
                          <img 
                            src={generalSettings.admin_sidebar_logo} 
                            alt="Sidebar Logo" 
                            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                          />
                        ) : (
                          <i className="bi bi-image" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
                        )}
                      </div>
                      <input
                        id="admin_sidebar_logo_input"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('admin_sidebar_logo', file);
                        }}
                      />
                      <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
                        Click to upload<br />PNG, JPG, SVG (max 5MB)
                      </div>
                    </div>

                    {/* Admin Login Logo */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                        Admin Login Logo
                      </label>
                      <div 
                        onClick={() => triggerFileInput('admin_login_logo_input')}
                        style={{ 
                          width: '100%',
                          height: '120px', 
                          border: '2px dashed #d1d5db', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: '#f9fafb',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                      >
                        {uploading === 'admin_login_logo' ? (
                          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        ) : generalSettings.admin_login_logo ? (
                          <img 
                            src={generalSettings.admin_login_logo} 
                            alt="Login Logo" 
                            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                          />
                        ) : (
                          <i className="bi bi-image" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
                        )}
                      </div>
                      <input
                        id="admin_login_logo_input"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('admin_login_logo', file);
                        }}
                      />
                      <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
                        Click to upload<br />PNG, JPG, SVG (max 5MB)
                      </div>
                    </div>

                    {/* Web Menu Logo */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                        Website Menu Logo
                      </label>
                      <div 
                        onClick={() => triggerFileInput('web_menu_logo_input')}
                        style={{ 
                          width: '100%',
                          height: '120px', 
                          border: '2px dashed #d1d5db', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: '#f9fafb',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                      >
                        {uploading === 'web_menu_logo' ? (
                          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        ) : generalSettings.web_menu_logo ? (
                          <img 
                            src={generalSettings.web_menu_logo} 
                            alt="Menu Logo" 
                            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                          />
                        ) : (
                          <i className="bi bi-image" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
                        )}
                      </div>
                      <input
                        id="web_menu_logo_input"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('web_menu_logo', file);
                        }}
                      />
                      <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
                        Click to upload<br />PNG, JPG, SVG (max 5MB)
                      </div>
                    </div>

                    {/* Favicon */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                        Favicon (ICO)
                      </label>
                      <div 
                        onClick={() => triggerFileInput('favicon_ico_input')}
                        style={{ 
                          width: '100%',
                          height: '120px', 
                          border: '2px dashed #d1d5db', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: '#f9fafb',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                      >
                        {uploading === 'favicon_ico' ? (
                          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        ) : generalSettings.favicon_ico ? (
                          <img 
                            src={generalSettings.favicon_ico} 
                            alt="Favicon" 
                            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                          />
                        ) : (
                          <i className="bi bi-image" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
                        )}
                      </div>
                      <input
                        id="favicon_ico_input"
                        type="file"
                        accept="image/x-icon,image/png,image/jpeg,image/jpg"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('favicon_ico', file);
                        }}
                      />
                      <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
                        Click to upload<br />ICO, PNG (max 5MB)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Site Information Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Site Information
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Site Title */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Site Title
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Main title displayed in browser and SEO
                        </div>
                      </label>
                      <input
                        type="text"
                        value={generalSettings.site_title}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, site_title: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        placeholder="KF Legacy Resources"
                      />
                    </div>

                    {/* Site Description */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', paddingTop: '8px' }}>
                        Site Description
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Brief description for SEO and meta tags
                        </div>
                      </label>
                      <textarea
                        value={generalSettings.site_description}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, site_description: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        rows={3}
                        placeholder="Network Infrastructure & Security Solutions"
                      />
                    </div>

                    {/* Site Tagline */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Site Tagline
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Short catchy phrase about your business
                        </div>
                      </label>
                      <input
                        type="text"
                        value={generalSettings.site_tagline}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, site_tagline: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        placeholder="Your Trusted IT Partner"
                      />
                    </div>
                  </div>
                </div>

                {/* Regional Settings Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Regional Settings
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Timezone */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Timezone
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Default timezone for dates and times
                        </div>
                      </label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '300px' }}
                      >
                        <option value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur (GMT+8)</option>
                        <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                        <option value="Asia/Jakarta">Asia/Jakarta (GMT+7)</option>
                        <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>

                    {/* Date Format */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Date Format
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          How dates are displayed throughout the site
                        </div>
                      </label>
                      <select
                        value={generalSettings.date_format}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, date_format: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                        <option value="DD-MM-YYYY">DD-MM-YYYY (31-12-2024)</option>
                      </select>
                    </div>

                    {/* Time Format */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Time Format
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          12-hour or 24-hour time display
                        </div>
                      </label>
                      <select
                        value={generalSettings.time_format}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, time_format: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="24h">24-hour (14:30)</option>
                        <option value="12h">12-hour (2:30 PM)</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Language
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Default language for the website
                        </div>
                      </label>
                      <select
                        value={generalSettings.language}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="en">English</option>
                        <option value="ms">Bahasa Melayu</option>
                        <option value="zh">中文 (Chinese)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Contact Information
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Contact Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Contact Email
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Primary email for customer inquiries
                        </div>
                      </label>
                      <input
                        type="email"
                        value={generalSettings.contact_email}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contact_email: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="info@kflegacy.com"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Contact Phone
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Primary phone number for customer support
                        </div>
                      </label>
                      <input
                        type="tel"
                        value={generalSettings.contact_phone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contact_phone: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '300px' }}
                        placeholder="+60 3-1234 5678"
                      />
                    </div>

                    {/* Contact Address */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', paddingTop: '8px' }}>
                        Contact Address
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Physical business address
                        </div>
                      </label>
                      <textarea
                        value={generalSettings.contact_address}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contact_address: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        rows={3}
                        placeholder="Kuala Lumpur, Malaysia"
                      />
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#eff6ff', 
                  border: '1px solid #bfdbfe', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <i className="bi bi-info-circle" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
                      Configuration Note
                    </div>
                    <div style={{ fontSize: '11px', color: '#1e40af', lineHeight: '1.5' }}>
                      These settings control the general appearance and behavior of your website. Changes to logos and branding will be reflected immediately across the site.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                {/* Admin Credentials Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Admin Credentials
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Admin Username */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Admin Username
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Username for admin login
                        </div>
                      </label>
                      <input
                        type="text"
                        value={securitySettings.admin_username}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, admin_username: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="administrator@root"
                      />
                    </div>

                    {/* Admin Password */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Admin Password
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Strong password (min 16 characters)
                        </div>
                      </label>
                      <input
                        type="password"
                        value={securitySettings.admin_password}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, admin_password: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="Enter new password"
                      />
                    </div>

                    {/* Session Secret */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Session Secret
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Secret key for session encryption (64 chars)
                        </div>
                      </label>
                      <div className="d-flex gap-2" style={{ maxWidth: '600px' }}>
                        <input
                          type="text"
                          value={securitySettings.session_secret}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, session_secret: e.target.value })}
                          className="form-control"
                          style={{ fontSize: '12px' }}
                          placeholder="Random 64-character string"
                        />
                        <button
                          onClick={() => {
                            const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                              .map(b => b.toString(16).padStart(2, '0'))
                              .join('');
                            setSecuritySettings({ ...securitySettings, session_secret: secret });
                          }}
                          className="btn btn-outline-secondary"
                          style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Limiting Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Rate Limiting
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Enable Rate Limiting */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Enable Rate Limiting
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Limit number of requests per IP address
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={securitySettings.rate_limit_enabled}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, rate_limit_enabled: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Max Requests */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Max Requests
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Maximum requests allowed per time window
                        </div>
                      </label>
                      <input
                        type="number"
                        value={securitySettings.rate_limit_max_requests}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, rate_limit_max_requests: parseInt(e.target.value) })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        min="1"
                        max="100"
                      />
                    </div>

                    {/* Time Window */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Time Window (minutes)
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Time period for rate limit calculation
                        </div>
                      </label>
                      <input
                        type="number"
                        value={securitySettings.rate_limit_window_minutes}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, rate_limit_window_minutes: parseInt(e.target.value) })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        min="1"
                        max="60"
                      />
                    </div>
                  </div>
                </div>

                {/* Brute Force Protection Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Brute Force Protection
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Enable Brute Force Protection */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Enable Brute Force Protection
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Lock account after failed login attempts
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={securitySettings.brute_force_enabled}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, brute_force_enabled: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Max Attempts */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Max Failed Attempts
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Number of failed attempts before lockout
                        </div>
                      </label>
                      <input
                        type="number"
                        value={securitySettings.brute_force_max_attempts}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, brute_force_max_attempts: parseInt(e.target.value) })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        min="3"
                        max="10"
                      />
                    </div>

                    {/* Lockout Duration */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Lockout Duration (minutes)
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          How long account stays locked
                        </div>
                      </label>
                      <input
                        type="number"
                        value={securitySettings.brute_force_lockout_minutes}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, brute_force_lockout_minutes: parseInt(e.target.value) })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        min="5"
                        max="60"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Hashing Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Password Security
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Bcrypt Rounds */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Bcrypt Rounds
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Higher = more secure but slower (10-12 recommended)
                        </div>
                      </label>
                      <input
                        type="number"
                        value={securitySettings.bcrypt_rounds}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, bcrypt_rounds: parseInt(e.target.value) })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        min="8"
                        max="15"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Status Box */}
                <div style={{ 
                  backgroundColor: '#f0fdf4', 
                  border: '1px solid #bbf7d0', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <i className="bi bi-shield-check" style={{ color: '#16a34a', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
                      Security Status: Active
                    </div>
                    <div style={{ fontSize: '11px', color: '#166534', lineHeight: '1.5' }}>
                      ✓ Rate limiting enabled ({securitySettings.rate_limit_max_requests} requests per {securitySettings.rate_limit_window_minutes} min)<br />
                      ✓ Brute force protection enabled (lockout after {securitySettings.brute_force_max_attempts} attempts)<br />
                      ✓ Bcrypt password hashing ({securitySettings.bcrypt_rounds} rounds)<br />
                      ✓ Security headers active
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email & Notifications Tab */}
            {activeTab === 'email' && (
              <div>
                {/* SMTP Configuration Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    SMTP Configuration
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* SMTP Host */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        SMTP Host
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          SMTP server hostname
                        </div>
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtp_host}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    {/* SMTP Port */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        SMTP Port
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          SMTP server port (587 for TLS, 465 for SSL)
                        </div>
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtp_port}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        placeholder="587"
                      />
                    </div>

                    {/* SMTP Username */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        SMTP Username
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          SMTP authentication username/email
                        </div>
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtp_username}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="your-email@gmail.com"
                      />
                    </div>

                    {/* SMTP Password */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        SMTP Password
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          SMTP authentication password or app password
                        </div>
                      </label>
                      <input
                        type="password"
                        value={emailSettings.smtp_password}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="Enter SMTP password"
                      />
                    </div>

                    {/* SMTP Encryption */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Encryption
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Email encryption method
                        </div>
                      </label>
                      <select
                        value={emailSettings.smtp_encryption}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_encryption: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="tls">TLS (Recommended)</option>
                        <option value="ssl">SSL</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Email Settings Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Email Settings
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* From Name */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        From Name
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Sender name displayed in emails
                        </div>
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtp_from_name}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_from_name: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="KF Legacy Resources"
                      />
                    </div>

                    {/* From Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        From Email
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Sender email address
                        </div>
                      </label>
                      <input
                        type="email"
                        value={emailSettings.smtp_from_email}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_from_email: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="noreply@kflegacy.com"
                      />
                    </div>

                    {/* Reply To */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Reply-To Email
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Email address for customer replies
                        </div>
                      </label>
                      <input
                        type="email"
                        value={emailSettings.smtp_reply_to}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_reply_to: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="info@kflegacy.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Preferences Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Notification Preferences
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* New Order Notification */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        New Order Notifications
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Receive email when new order is placed
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={emailSettings.notify_new_order}
                          onChange={(e) => setEmailSettings({ ...emailSettings, notify_new_order: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Customer Inquiry Notification */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Customer Inquiry Notifications
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Receive email when customer submits inquiry
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={emailSettings.notify_customer_inquiry}
                          onChange={(e) => setEmailSettings({ ...emailSettings, notify_customer_inquiry: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Low Stock Notification */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Low Stock Notifications
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Receive email when product stock is low
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={emailSettings.notify_low_stock}
                          onChange={(e) => setEmailSettings({ ...emailSettings, notify_low_stock: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Email Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Test Email Configuration
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Test Email Address
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Enter email address to receive test email
                        </div>
                      </label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', maxWidth: '600px' }}>
                        <input
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          className="form-control"
                          style={{ fontSize: '12px', flex: 1 }}
                          placeholder="test@example.com"
                          disabled={sendingTestEmail}
                        />
                        <button
                          onClick={handleSendTestEmail}
                          disabled={sendingTestEmail || !testEmailAddress}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '8px 16px', whiteSpace: 'nowrap' }}
                        >
                          {sendingTestEmail ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-2"></i>
                              Send Test Email
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div style={{ 
                    marginTop: '16px',
                    backgroundColor: '#fef3c7', 
                    border: '1px solid #fde68a', 
                    borderRadius: '8px', 
                    padding: '12px',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <i className="bi bi-exclamation-triangle" style={{ color: '#d97706', fontSize: '16px' }}></i>
                    <div style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.5' }}>
                      Test email will use the current SMTP settings above. Make sure to save your settings first if you made any changes.
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#eff6ff', 
                  border: '1px solid #bfdbfe', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <i className="bi bi-info-circle" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
                      SMTP Configuration Note
                    </div>
                    <div style={{ fontSize: '11px', color: '#1e40af', lineHeight: '1.5' }}>
                      For Gmail, use App Password instead of regular password. Enable 2-factor authentication and generate an app password from your Google Account settings.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Gateway Tab */}
            {activeTab === 'payment' && (
              <div>
                {/* CHIP Configuration Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    CHIP Payment Gateway
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Brand ID */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Brand ID
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Your CHIP Brand ID
                        </div>
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.chip_brand_id}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, chip_brand_id: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="Enter CHIP Brand ID"
                      />
                    </div>

                    {/* Secret Key */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Secret Key
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          CHIP API Secret Key
                        </div>
                      </label>
                      <input
                        type="password"
                        value={paymentSettings.chip_secret_key}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, chip_secret_key: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="Enter Secret Key"
                      />
                    </div>

                    {/* Public Key */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Public Key
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          CHIP API Public Key
                        </div>
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.chip_public_key}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, chip_public_key: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="Enter Public Key"
                      />
                    </div>

                    {/* Webhook URL */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Webhook URL
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          URL for payment callbacks
                        </div>
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.chip_webhook_url}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, chip_webhook_url: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        placeholder="https://yourdomain.com/api/chip/webhook"
                      />
                    </div>

                    {/* Test Mode */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Test Mode
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Enable test mode for development
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={paymentSettings.chip_test_mode}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, chip_test_mode: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Test Connection Button */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Test Connection
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Verify CHIP credentials
                        </div>
                      </label>
                      <div>
                        <button
                          onClick={handleTestChip}
                          disabled={testingChip || !paymentSettings.chip_brand_id || !paymentSettings.chip_secret_key}
                          className="btn btn-outline-primary btn-sm"
                          style={{ fontSize: '12px', padding: '6px 16px' }}
                        >
                          {testingChip ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Testing...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined me-2" style={{ fontSize: '16px', verticalAlign: 'middle' }}>credit_card</span>
                              Test CHIP Connection
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Settings Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Payment Settings
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Currency */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Currency
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Default payment currency
                        </div>
                      </label>
                      <select
                        value={paymentSettings.payment_currency}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_currency: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="MYR">MYR - Malaysian Ringgit</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="SGD">SGD - Singapore Dollar</option>
                      </select>
                    </div>

                    {/* Currency Symbol */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Currency Symbol
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Symbol displayed for prices
                        </div>
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.payment_currency_symbol}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_currency_symbol: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '100px' }}
                        placeholder="RM"
                      />
                    </div>

                    {/* Min Amount */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Minimum Amount
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Minimum payment amount allowed
                        </div>
                      </label>
                      <input
                        type="number"
                        value={paymentSettings.payment_min_amount}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_min_amount: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        placeholder="10"
                      />
                    </div>

                    {/* Max Amount */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Maximum Amount
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Maximum payment amount allowed
                        </div>
                      </label>
                      <input
                        type="number"
                        value={paymentSettings.payment_max_amount}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_max_amount: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Payment Methods
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* FPX */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        FPX (Online Banking)
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Enable FPX payment method
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={paymentSettings.payment_fpx_enabled}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_fpx_enabled: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Credit/Debit Card */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Credit/Debit Card
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Enable card payment method
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={paymentSettings.payment_card_enabled}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_card_enabled: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* E-Wallet */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        E-Wallet
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Enable e-wallet payment (GrabPay, Touch 'n Go, etc)
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={paymentSettings.payment_ewallet_enabled}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_ewallet_enabled: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#f0fdf4', 
                  border: '1px solid #bbf7d0', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <i className="bi bi-shield-check" style={{ color: '#16a34a', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
                      CHIP Payment Gateway
                    </div>
                    <div style={{ fontSize: '11px', color: '#166534', lineHeight: '1.5' }}>
                      Get your API keys from CHIP dashboard. Test mode allows you to test payments without real transactions.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Media & SEO Tab */}
            {activeTab === 'social' && (
              <div>
                {/* Social Media Links Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Social Media Links
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Facebook
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Facebook page URL
                        </div>
                      </label>
                      <input
                        type="url"
                        value={socialSettings.social_facebook}
                        onChange={(e) => setSocialSettings({ ...socialSettings, social_facebook: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Instagram
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Instagram profile URL
                        </div>
                      </label>
                      <input
                        type="url"
                        value={socialSettings.social_instagram}
                        onChange={(e) => setSocialSettings({ ...socialSettings, social_instagram: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        placeholder="https://instagram.com/yourprofile"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        LinkedIn
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          LinkedIn company URL
                        </div>
                      </label>
                      <input
                        type="url"
                        value={socialSettings.social_linkedin}
                        onChange={(e) => setSocialSettings({ ...socialSettings, social_linkedin: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Twitter/X
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Twitter/X profile URL
                        </div>
                      </label>
                      <input
                        type="url"
                        value={socialSettings.social_twitter}
                        onChange={(e) => setSocialSettings({ ...socialSettings, social_twitter: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        placeholder="https://twitter.com/yourprofile"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        WhatsApp
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          WhatsApp business number (with country code)
                        </div>
                      </label>
                      <input
                        type="text"
                        value={socialSettings.social_whatsapp}
                        onChange={(e) => setSocialSettings({ ...socialSettings, social_whatsapp: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '300px' }}
                        placeholder="+60123456789"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        YouTube
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          YouTube channel URL
                        </div>
                      </label>
                      <input
                        type="url"
                        value={socialSettings.social_youtube}
                        onChange={(e) => setSocialSettings({ ...socialSettings, social_youtube: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        placeholder="https://youtube.com/@yourchannel"
                      />
                    </div>
                  </div>
                </div>

                {/* Analytics & Tracking Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Analytics & Tracking
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Google Analytics ID
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          GA4 Measurement ID (G-XXXXXXXXXX)
                        </div>
                      </label>
                      <input
                        type="text"
                        value={socialSettings.analytics_google_id}
                        onChange={(e) => setSocialSettings({ ...socialSettings, analytics_google_id: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '300px' }}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Google Tag Manager ID
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          GTM Container ID (GTM-XXXXXXX)
                        </div>
                      </label>
                      <input
                        type="text"
                        value={socialSettings.analytics_gtm_id}
                        onChange={(e) => setSocialSettings({ ...socialSettings, analytics_gtm_id: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '300px' }}
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Facebook Pixel ID
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Facebook Pixel tracking ID
                        </div>
                      </label>
                      <input
                        type="text"
                        value={socialSettings.analytics_facebook_pixel}
                        onChange={(e) => setSocialSettings({ ...socialSettings, analytics_facebook_pixel: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '300px' }}
                        placeholder="123456789012345"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        TikTok Pixel ID
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          TikTok Pixel tracking ID
                        </div>
                      </label>
                      <input
                        type="text"
                        value={socialSettings.analytics_tiktok_pixel}
                        onChange={(e) => setSocialSettings({ ...socialSettings, analytics_tiktok_pixel: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '300px' }}
                        placeholder="XXXXXXXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Settings Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    SEO Settings
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', paddingTop: '8px' }}>
                        Meta Keywords
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Comma-separated keywords for SEO
                        </div>
                      </label>
                      <textarea
                        value={socialSettings.seo_meta_keywords}
                        onChange={(e) => setSocialSettings({ ...socialSettings, seo_meta_keywords: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        rows={2}
                        placeholder="network, infrastructure, security, IT solutions"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Meta Author
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Website author/company name
                        </div>
                      </label>
                      <input
                        type="text"
                        value={socialSettings.seo_meta_author}
                        onChange={(e) => setSocialSettings({ ...socialSettings, seo_meta_author: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '400px' }}
                        placeholder="KF Legacy Resources"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Meta Robots
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Search engine indexing instructions
                        </div>
                      </label>
                      <select
                        value={socialSettings.seo_meta_robots}
                        onChange={(e) => setSocialSettings({ ...socialSettings, seo_meta_robots: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '250px' }}
                      >
                        <option value="index, follow">Index, Follow (Recommended)</option>
                        <option value="noindex, nofollow">No Index, No Follow</option>
                        <option value="index, nofollow">Index, No Follow</option>
                        <option value="noindex, follow">No Index, Follow</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Open Graph Type
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Type for social media sharing
                        </div>
                      </label>
                      <select
                        value={socialSettings.seo_og_type}
                        onChange={(e) => setSocialSettings({ ...socialSettings, seo_og_type: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="website">Website</option>
                        <option value="article">Article</option>
                        <option value="product">Product</option>
                        <option value="business.business">Business</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #fde68a', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <i className="bi bi-lightbulb" style={{ color: '#d97706', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                      SEO & Analytics Tip
                    </div>
                    <div style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.5' }}>
                      Add tracking codes to monitor website traffic and user behavior. Social media links will appear in website footer and contact pages.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Tab */}
            {activeTab === 'api' && (
              <div>
                {/* API Access Control Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    API Access Control
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Enable API */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Enable API Access
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Allow public website to access admin API
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={apiSettings.api_enabled}
                          onChange={(e) => setApiSettings({ ...apiSettings, api_enabled: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* API Key */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        API Key
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Public key for API authentication
                        </div>
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={apiSettings.api_key}
                          readOnly
                          className="form-control"
                          style={{ fontSize: '12px', maxWidth: '400px', backgroundColor: '#f9fafb' }}
                          placeholder="Click generate to create API key"
                        />
                        <button
                          onClick={() => {
                            const newKey = 'pk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                            setApiSettings({ ...apiSettings, api_key: newKey });
                          }}
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Generate
                        </button>
                        {apiSettings.api_key && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(apiSettings.api_key);
                              alert('API Key copied to clipboard!');
                            }}
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '11px' }}
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* API Secret */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        API Secret
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Secret key for request signing (keep secure!)
                        </div>
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="password"
                          value={apiSettings.api_secret}
                          readOnly
                          className="form-control"
                          style={{ fontSize: '12px', maxWidth: '400px', backgroundColor: '#f9fafb' }}
                          placeholder="Click generate to create API secret"
                        />
                        <button
                          onClick={() => {
                            const newSecret = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                            setApiSettings({ ...apiSettings, api_secret: newSecret });
                          }}
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Generate
                        </button>
                        {apiSettings.api_secret && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(apiSettings.api_secret);
                              alert('API Secret copied to clipboard!');
                            }}
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '11px' }}
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Webhook Secret */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Webhook Secret
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Secret for webhook signature verification
                        </div>
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="password"
                          value={apiSettings.api_webhook_secret}
                          readOnly
                          className="form-control"
                          style={{ fontSize: '12px', maxWidth: '400px', backgroundColor: '#f9fafb' }}
                          placeholder="Click generate to create webhook secret"
                        />
                        <button
                          onClick={() => {
                            const newWebhookSecret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                            setApiSettings({ ...apiSettings, api_webhook_secret: newWebhookSecret });
                          }}
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Generate
                        </button>
                        {apiSettings.api_webhook_secret && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(apiSettings.api_webhook_secret);
                              alert('Webhook Secret copied to clipboard!');
                            }}
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '11px' }}
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CORS & Security Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    CORS & Security
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Allowed Origins */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', paddingTop: '8px' }}>
                        Allowed Origins
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Comma-separated domains allowed to access API
                        </div>
                      </label>
                      <textarea
                        value={apiSettings.api_allowed_origins}
                        onChange={(e) => setApiSettings({ ...apiSettings, api_allowed_origins: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '600px' }}
                        rows={3}
                        placeholder="https://yourwebsite.com, https://www.yourwebsite.com"
                      />
                    </div>

                    {/* Enable CORS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Enable CORS
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Allow cross-origin requests from allowed domains
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={apiSettings.api_cors_enabled}
                          onChange={(e) => setApiSettings({ ...apiSettings, api_cors_enabled: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Require HTTPS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Require HTTPS
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Only accept requests over secure HTTPS connection
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={apiSettings.api_require_https}
                          onChange={(e) => setApiSettings({ ...apiSettings, api_require_https: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Limiting Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Rate Limiting
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Rate Limit */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Maximum Requests
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Maximum API requests allowed per time window
                        </div>
                      </label>
                      <input
                        type="number"
                        value={apiSettings.api_rate_limit}
                        onChange={(e) => setApiSettings({ ...apiSettings, api_rate_limit: parseInt(e.target.value) })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                        placeholder="100"
                      />
                    </div>

                    {/* Rate Limit Window */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Time Window
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Time window in seconds for rate limiting
                        </div>
                      </label>
                      <select
                        value={apiSettings.api_rate_limit_window}
                        onChange={(e) => setApiSettings({ ...apiSettings, api_rate_limit_window: parseInt(e.target.value) })}
                        className="form-select"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                        <option value="900">15 minutes</option>
                        <option value="3600">1 hour</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Logging Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Logging & Monitoring
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Log Requests */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Log API Requests
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Log all API requests for monitoring and debugging
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={apiSettings.api_log_requests}
                          onChange={(e) => setApiSettings({ ...apiSettings, api_log_requests: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #fde68a', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <i className="bi bi-shield-lock" style={{ color: '#d97706', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                      API Security Best Practices
                    </div>
                    <div style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.5' }}>
                      • Never share your API Secret or Webhook Secret publicly<br />
                      • Always use HTTPS in production<br />
                      • Regularly rotate your API keys<br />
                      • Only whitelist trusted domains in Allowed Origins<br />
                      • Monitor API logs for suspicious activity
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance & System Tab */}
            {activeTab === 'maintenance' && (
              <div>
                {/* Maintenance Mode Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Maintenance Mode
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Enable Maintenance Mode */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Enable Maintenance Mode
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          When enabled, visitors will see a maintenance message
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={maintenanceSettings.maintenance_mode}
                          onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, maintenance_mode: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Maintenance Message */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', paddingTop: '8px' }}>
                        Maintenance Message
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Message displayed to visitors during maintenance
                        </div>
                      </label>
                      <textarea
                        value={maintenanceSettings.maintenance_message}
                        onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, maintenance_message: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '600px' }}
                        rows={3}
                        placeholder="Enter maintenance message"
                      />
                    </div>

                    {/* Allowed IPs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Allowed IPs
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Comma-separated IPs that can access during maintenance
                        </div>
                      </label>
                      <input
                        type="text"
                        value={maintenanceSettings.maintenance_allowed_ips}
                        onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, maintenance_allowed_ips: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '500px' }}
                        placeholder="192.168.1.1, 10.0.0.1"
                      />
                    </div>

                    {/* Scheduled Start */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Scheduled Start
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Scheduled maintenance start time
                        </div>
                      </label>
                      <input
                        type="datetime-local"
                        value={maintenanceSettings.maintenance_scheduled_start}
                        onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, maintenance_scheduled_start: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '300px' }}
                      />
                    </div>

                    {/* Scheduled End */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Scheduled End
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Scheduled maintenance end time
                        </div>
                      </label>
                      <input
                        type="datetime-local"
                        value={maintenanceSettings.maintenance_scheduled_end}
                        onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, maintenance_scheduled_end: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '300px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* System Settings Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    System Settings
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Debug Mode */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Enable Debug Mode
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Show detailed error messages
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={maintenanceSettings.system_debug_mode}
                          onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, system_debug_mode: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Log Level */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Log Level
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Minimum log level to record
                        </div>
                      </label>
                      <select
                        value={maintenanceSettings.system_log_level}
                        onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, system_log_level: e.target.value })}
                        className="form-select"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                      </select>
                    </div>

                    {/* Log Retention */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Log Retention
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Number of days to keep logs
                        </div>
                      </label>
                      <input
                        type="number"
                        value={maintenanceSettings.system_log_retention_days}
                        onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, system_log_retention_days: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>



                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #fde68a', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <i className="bi bi-exclamation-triangle" style={{ color: '#d97706', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                      Maintenance Mode Warning
                    </div>
                    <div style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.5' }}>
                      When maintenance mode is enabled, all visitors except allowed IPs will see the maintenance message. Make sure to test before enabling.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cache Tab */}
            {activeTab === 'cache' && (
              <div>
                {/* Cache Configuration Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Cache Configuration
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Enable Cache */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Enable Cache
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Enable application caching for better performance
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={cacheSettings.cache_enabled}
                          onChange={(e) => setCacheSettings({ ...cacheSettings, cache_enabled: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Cache Driver */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Cache Driver
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Cache storage backend
                        </div>
                      </label>
                      <select
                        value={cacheSettings.cache_driver}
                        onChange={(e) => setCacheSettings({ ...cacheSettings, cache_driver: e.target.value })}
                        className="form-select"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="redis">Redis</option>
                        <option value="memory">Memory</option>
                        <option value="file">File System</option>
                      </select>
                    </div>

                    {/* Cache TTL */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Cache TTL (seconds)
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Default cache time-to-live
                        </div>
                      </label>
                      <input
                        type="number"
                        value={cacheSettings.cache_ttl}
                        onChange={(e) => setCacheSettings({ ...cacheSettings, cache_ttl: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        placeholder="3600"
                      />
                    </div>

                    {/* Revalidate on Demand */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Revalidate on Demand
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Allow manual cache revalidation
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={cacheSettings.revalidate_on_demand}
                          onChange={(e) => setCacheSettings({ ...cacheSettings, revalidate_on_demand: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cache Actions Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Cache Actions
                  </h6>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => alert('Clear all cache - Coming soon')}
                      className="btn btn-outline-danger"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      <i className="bi bi-trash me-2"></i>
                      Clear All Cache
                    </button>
                    <button
                      onClick={() => alert('Clear page cache - Coming soon')}
                      className="btn btn-outline-warning"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      <i className="bi bi-file-earmark-x me-2"></i>
                      Clear Page Cache
                    </button>
                    <button
                      onClick={() => alert('Revalidate paths - Coming soon')}
                      className="btn btn-outline-primary"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Revalidate Paths
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#eff6ff', 
                  border: '1px solid #bfdbfe', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <i className="bi bi-info-circle" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
                      Cache Performance
                    </div>
                    <div style={{ fontSize: '11px', color: '#1e40af', lineHeight: '1.5' }}>
                      Caching improves performance by storing frequently accessed data. Clear cache after making significant changes to ensure users see the latest content.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backup & Restore Tab */}
            {activeTab === 'backup' && (
              <div>
                {/* Backup Configuration Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Backup Configuration
                  </h6>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Enable Automatic Backups */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Enable Automatic Backups
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Automatically backup database and files
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={backupSettings.backup_enabled}
                          onChange={(e) => setBackupSettings({ ...backupSettings, backup_enabled: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Backup Schedule */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Backup Schedule
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          How often to run automatic backups
                        </div>
                      </label>
                      <select
                        value={backupSettings.backup_schedule}
                        onChange={(e) => setBackupSettings({ ...backupSettings, backup_schedule: e.target.value })}
                        className="form-select"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {/* Backup Retention */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Backup Retention (days)
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Number of days to keep backups
                        </div>
                      </label>
                      <input
                        type="number"
                        value={backupSettings.backup_retention}
                        onChange={(e) => setBackupSettings({ ...backupSettings, backup_retention: e.target.value })}
                        className="form-control"
                        style={{ fontSize: '12px', maxWidth: '150px' }}
                        placeholder="7"
                      />
                    </div>

                    {/* Backup Location */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Backup Location
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Where to store backup files
                        </div>
                      </label>
                      <select
                        value={backupSettings.backup_location}
                        onChange={(e) => setBackupSettings({ ...backupSettings, backup_location: e.target.value })}
                        className="form-select"
                        style={{ fontSize: '12px', maxWidth: '200px' }}
                      >
                        <option value="local">Local Storage</option>
                        <option value="ftp">FTP Server</option>
                        <option value="r2">Cloudflare R2 Storage</option>
                      </select>
                    </div>

                    {/* FTP Server Configuration */}
                    {backupSettings.backup_location === 'ftp' && (
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '20px', 
                        backgroundColor: '#f0f9ff', 
                        border: '1px solid #bfdbfe', 
                        borderRadius: '8px' 
                      }}>
                        <h6 style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af', marginBottom: '16px' }}>
                          <i className="bi bi-hdd-network me-2"></i>
                          FTP Server Configuration
                        </h6>
                        
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {/* FTP Host */}
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                              FTP Host
                            </label>
                            <input
                              type="text"
                              value={backupSettings.ftp_host}
                              onChange={(e) => setBackupSettings({ ...backupSettings, ftp_host: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="ftp.example.com"
                            />
                          </div>

                          {/* FTP Port */}
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                              FTP Port
                            </label>
                            <input
                              type="text"
                              value={backupSettings.ftp_port}
                              onChange={(e) => setBackupSettings({ ...backupSettings, ftp_port: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '12px', maxWidth: '150px' }}
                              placeholder="21"
                            />
                          </div>

                          {/* FTP Username */}
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                              Username
                            </label>
                            <input
                              type="text"
                              value={backupSettings.ftp_username}
                              onChange={(e) => setBackupSettings({ ...backupSettings, ftp_username: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="ftpuser"
                            />
                          </div>

                          {/* FTP Password */}
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                              Password
                            </label>
                            <input
                              type="password"
                              value={backupSettings.ftp_password}
                              onChange={(e) => setBackupSettings({ ...backupSettings, ftp_password: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="Enter FTP password"
                            />
                          </div>

                          {/* FTP Path */}
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                              Remote Path
                            </label>
                            <input
                              type="text"
                              value={backupSettings.ftp_path}
                              onChange={(e) => setBackupSettings({ ...backupSettings, ftp_path: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="/backups"
                            />
                          </div>

                          {/* Test Connection Button */}
                          <div style={{ marginTop: '8px' }}>
                            <button
                              onClick={handleTestConnection}
                              disabled={testingConnection}
                              className="btn btn-outline-primary btn-sm"
                              style={{ fontSize: '12px', padding: '6px 16px' }}
                            >
                              {testingConnection ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Testing Connection...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-plug me-2"></i>
                                  Test FTP Connection
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cloudflare R2 Configuration */}
                    {backupSettings.backup_location === 'r2' && (
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '20px', 
                        backgroundColor: '#fef3c7', 
                        border: '1px solid #fde68a', 
                        borderRadius: '8px' 
                      }}>
                        <h6 style={{ fontSize: '13px', fontWeight: 600, color: '#92400e', marginBottom: '16px' }}>
                          <i className="bi bi-cloud me-2"></i>
                          Cloudflare R2 Storage Configuration
                        </h6>
                        
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {/* Account ID */}
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                              Account ID
                            </label>
                            <input
                              type="text"
                              value={backupSettings.r2_account_id}
                              onChange={(e) => setBackupSettings({ ...backupSettings, r2_account_id: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="Your Cloudflare Account ID"
                            />
                          </div>

                          {/* Access Key ID */}
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                              Access Key ID
                            </label>
                            <input
                              type="text"
                              value={backupSettings.r2_access_key_id}
                              onChange={(e) => setBackupSettings({ ...backupSettings, r2_access_key_id: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="R2 Access Key ID"
                            />
                          </div>

                          {/* Secret Access Key */}
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                              Secret Access Key
                            </label>
                            <input
                              type="password"
                              value={backupSettings.r2_secret_access_key}
                              onChange={(e) => setBackupSettings({ ...backupSettings, r2_secret_access_key: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="R2 Secret Access Key"
                            />
                          </div>

                          {/* Bucket Name */}
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                              Bucket Name
                            </label>
                            <input
                              type="text"
                              value={backupSettings.r2_bucket_name}
                              onChange={(e) => setBackupSettings({ ...backupSettings, r2_bucket_name: e.target.value })}
                              className="form-control"
                              style={{ fontSize: '12px' }}
                              placeholder="my-backup-bucket"
                            />
                          </div>

                          {/* Test Connection Button */}
                          <div style={{ marginTop: '8px' }}>
                            <button
                              onClick={handleTestConnection}
                              disabled={testingConnection}
                              className="btn btn-outline-warning btn-sm"
                              style={{ fontSize: '12px', padding: '6px 16px' }}
                            >
                              {testingConnection ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Testing Connection...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-plug me-2"></i>
                                  Test R2 Connection
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Include Database */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Include Database
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Backup database in addition to files
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={backupSettings.backup_include_database}
                          onChange={(e) => setBackupSettings({ ...backupSettings, backup_include_database: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Include Files */}
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                        Include Files
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>
                          Backup uploaded files and assets
                        </div>
                      </label>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={backupSettings.backup_include_files}
                          onChange={(e) => setBackupSettings({ ...backupSettings, backup_include_files: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info Box - Automatic Backup */}
                  <div style={{ 
                    marginTop: '20px',
                    backgroundColor: '#eff6ff', 
                    border: '1px solid #bfdbfe', 
                    borderRadius: '8px', 
                    padding: '16px',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <i className="bi bi-info-circle" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
                        Automatic Backup Schedule
                      </div>
                      <div style={{ fontSize: '11px', color: '#1e40af', lineHeight: '1.5' }}>
                        When enabled, backups will run automatically based on your schedule. The system will also automatically delete backups older than your retention period ({backupSettings.backup_retention} days). You can manually clean old backups anytime using the "Clean Old Backups" button below.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backup Actions Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Backup Actions
                  </h6>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleCreateBackup}
                      disabled={creatingBackup}
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      {creatingBackup ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Backup...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-arrow-down me-2"></i>
                          Create Backup Now
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadLatest}
                      className="btn btn-outline-primary"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      <i className="bi bi-download me-2"></i>
                      Download Latest
                    </button>
                    <button
                      onClick={handleViewHistory}
                      className="btn btn-outline-secondary"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      <i className="bi bi-clock-history me-2"></i>
                      View History
                    </button>
                    <button
                      onClick={handleCleanOldBackups}
                      disabled={cleaningBackups}
                      className="btn btn-outline-danger"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      {cleaningBackups ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Cleaning...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-trash me-2"></i>
                          Clean Old Backups
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Restore Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h6 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
                    Restore from Backup
                  </h6>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Select Backup to Restore
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept=".zip"
                        id="restore-backup-input"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleRestoreBackup(file);
                          }
                        }}
                      />
                      <button
                        onClick={() => document.getElementById('restore-backup-input')?.click()}
                        className="btn btn-warning"
                        style={{ fontSize: '12px', padding: '8px 16px' }}
                      >
                        <i className="bi bi-upload me-2"></i>
                        Upload Backup ZIP
                      </button>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        Or select from existing backups below
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <button
                      onClick={handleRestoreFromHistory}
                      className="btn btn-outline-warning"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      <i className="bi bi-clock-history me-2"></i>
                      Restore from Backup History
                    </button>
                  </div>

                  {/* Warning Box */}
                  <div style={{ 
                    marginTop: '16px',
                    backgroundColor: '#fef3c7', 
                    border: '1px solid #fde68a', 
                    borderRadius: '8px', 
                    padding: '16px',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <i className="bi bi-exclamation-triangle" style={{ color: '#d97706', fontSize: '20px' }}></i>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                        Warning: Restore will overwrite current data
                      </div>
                      <div style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.5' }}>
                        Restoring a backup will replace your current database and files with the backup data. Make sure to create a backup of your current data before restoring. This action cannot be undone.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#f0fdf4', 
                  border: '1px solid #bbf7d0', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <i className="bi bi-shield-check" style={{ color: '#16a34a', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
                      Backup & Restore Best Practices
                    </div>
                    <div style={{ fontSize: '11px', color: '#166534', lineHeight: '1.5' }}>
                      Regular backups protect your data. Store backups in multiple locations and test restoration periodically to ensure data integrity. Always create a fresh backup before restoring to avoid data loss.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backup History Modal */}
      {showBackupHistory && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowBackupHistory(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: '12px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600 }}>
                  <i className="bi bi-clock-history me-2"></i>
                  Backup History
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowBackupHistory(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {loadingHistory ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading backup history...</p>
                  </div>
                ) : backupHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    <i className="bi bi-inbox" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                    <p>No backups found</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover" style={{ fontSize: '12px' }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Backup Name</th>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Created</th>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Size</th>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Type</th>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backupHistory.map((backup, index) => (
                          <tr key={index}>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{backup.name}</td>
                            <td>{new Date(backup.created).toLocaleString()}</td>
                            <td>{backup.size}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {backup.metadata?.database && (
                                  <span style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    fontSize: '10px', 
                                    backgroundColor: '#dbeafe', 
                                    color: '#1e40af' 
                                  }}>
                                    DB
                                  </span>
                                )}
                                {backup.metadata?.files && (
                                  <span style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    fontSize: '10px', 
                                    backgroundColor: '#fef3c7', 
                                    color: '#92400e' 
                                  }}>
                                    Files
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => handleDownloadBackup(backup.name)}
                                className="btn btn-sm btn-outline-primary"
                                style={{ fontSize: '11px', padding: '4px 12px' }}
                              >
                                <i className="bi bi-download me-1"></i>
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowBackupHistory(false)}
                  style={{ fontSize: '12px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore from History Modal */}
      {showRestoreModal && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowRestoreModal(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: '12px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef3c7' }}>
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600, color: '#92400e' }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Restore from Backup
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRestoreModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {/* Warning Message */}
                <div style={{ 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #fde68a', 
                  borderRadius: '8px', 
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                    ⚠️ Warning: This will overwrite your current data
                  </div>
                  <div style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.5' }}>
                    Restoring a backup will replace your current database and files. Make sure to create a backup of your current data before proceeding.
                  </div>
                </div>

                {loadingHistory ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading backup history...</p>
                  </div>
                ) : backupHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    <i className="bi bi-inbox" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                    <p>No backups found</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover" style={{ fontSize: '12px' }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Backup Name</th>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Created</th>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Size</th>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Type</th>
                          <th style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backupHistory.map((backup, index) => (
                          <tr key={index}>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{backup.name}</td>
                            <td>{new Date(backup.created).toLocaleString()}</td>
                            <td>{backup.size}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {backup.metadata?.database && (
                                  <span style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    fontSize: '10px', 
                                    backgroundColor: '#dbeafe', 
                                    color: '#1e40af' 
                                  }}>
                                    DB
                                  </span>
                                )}
                                {backup.metadata?.files && (
                                  <span style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    fontSize: '10px', 
                                    backgroundColor: '#fef3c7', 
                                    color: '#92400e' 
                                  }}>
                                    Files
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => handleRestoreFromBackupName(backup.name)}
                                disabled={restoringBackup}
                                className="btn btn-sm btn-warning"
                                style={{ fontSize: '11px', padding: '4px 12px' }}
                              >
                                {restoringBackup ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Restoring...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                                    Restore
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowRestoreModal(false)}
                  style={{ fontSize: '12px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
