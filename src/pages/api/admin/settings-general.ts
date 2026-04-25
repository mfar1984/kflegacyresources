import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { clearAuthCache } from '@/config/auth';
import { settingsCache } from '@/lib/cache';

interface GeneralSettings {
  admin_sidebar_logo: string;
  admin_login_logo: string;
  web_menu_logo: string;
  favicon_ico: string;
  site_title: string;
  site_description: string;
  site_tagline: string;
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

interface SecuritySettings {
  admin_username: string;
  admin_password: string;
  session_secret: string;
  rate_limit_enabled: boolean;
  rate_limit_max_requests: number;
  rate_limit_window_minutes: number;
  brute_force_enabled: boolean;
  brute_force_max_attempts: number;
  brute_force_lockout_minutes: number;
  bcrypt_rounds: number;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  smtp_from_name: string;
  smtp_from_email: string;
  smtp_reply_to: string;
  notify_new_order: boolean;
  notify_customer_inquiry: boolean;
  notify_low_stock: boolean;
}

interface PaymentSettings {
  chip_brand_id: string;
  chip_secret_key: string;
  chip_public_key: string;
  chip_webhook_url: string;
  chip_test_mode: boolean;
  payment_currency: string;
  payment_currency_symbol: string;
  payment_min_amount: string;
  payment_max_amount: string;
  payment_fpx_enabled: boolean;
  payment_card_enabled: boolean;
  payment_ewallet_enabled: boolean;
}

interface SocialSettings {
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
  social_twitter: string;
  social_whatsapp: string;
  social_youtube: string;
  analytics_google_id: string;
  analytics_gtm_id: string;
  analytics_facebook_pixel: string;
  analytics_tiktok_pixel: string;
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

interface CacheSettings {
  cache_enabled: boolean;
  cache_ttl: string;
  cache_driver: string;
  revalidate_on_demand: boolean;
}

interface BackupSettings {
  backup_enabled: boolean;
  backup_schedule: string;
  backup_retention: string;
  backup_location: string;
  backup_include_database: boolean;
  backup_include_files: boolean;
  ftp_host: string;
  ftp_port: string;
  ftp_username: string;
  ftp_password: string;
  ftp_path: string;
  r2_account_id: string;
  r2_access_key_id: string;
  r2_secret_access_key: string;
  r2_bucket_name: string;
}

interface SettingsResponse {
  general: GeneralSettings;
  security: SecuritySettings;
  email: EmailSettings;
  payment: PaymentSettings;
  social: SocialSettings;
  api: ApiSettings;
  maintenance: MaintenanceSettings;
  cache: CacheSettings;
  backup: BackupSettings;
}

interface SettingRow {
  setting_key: string;
  setting_value: string;
  setting_type: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Fetch current settings from database
    try {
      // Check cache first
      const cacheKey = 'settings:all';
      const cachedSettings = settingsCache.get(cacheKey);
      
      if (cachedSettings) {
        return res.status(200).json({ success: true, settings: cachedSettings });
      }

      const rows = await query(
        'SELECT setting_key, setting_value, setting_type FROM site_settings'
      ) as SettingRow[];

      // Convert rows to settings object
      const generalSettings: any = {};
      const securitySettings: any = {};
      const emailSettings: any = {};
      const paymentSettings: any = {};
      const socialSettings: any = {};
      const apiSettings: any = {};
      const maintenanceSettings: any = {};
      const cacheSettings: any = {};
      const backupSettings: any = {};

      rows.forEach((row) => {
        const key = row.setting_key;
        let value: any = row.setting_value;

        // Convert string values to appropriate types
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(Number(value)) && value !== '') value = Number(value);

        if (row.setting_type === 'general') {
          generalSettings[key] = value;
        } else if (row.setting_type === 'security') {
          // Don't send actual password
          if (key === 'admin_password') {
            securitySettings[key] = '';
          } else {
            securitySettings[key] = value;
          }
        } else if (row.setting_type === 'email') {
          emailSettings[key] = value;
        } else if (row.setting_type === 'payment') {
          paymentSettings[key] = value;
        } else if (row.setting_type === 'social') {
          socialSettings[key] = value;
        } else if (row.setting_type === 'api') {
          apiSettings[key] = value;
        } else if (row.setting_type === 'maintenance') {
          maintenanceSettings[key] = value;
        } else if (row.setting_type === 'cache') {
          cacheSettings[key] = value;
        } else if (row.setting_type === 'backup') {
          backupSettings[key] = value;
        }
      });

      const settings: SettingsResponse = {
        general: generalSettings,
        security: securitySettings,
        email: emailSettings,
        payment: paymentSettings,
        social: socialSettings,
        api: apiSettings,
        maintenance: maintenanceSettings,
        cache: cacheSettings,
        backup: backupSettings,
      };

      // Cache the settings with 5 minute TTL
      settingsCache.set(cacheKey, settings, 5 * 60 * 1000);

      return res.status(200).json({ success: true, settings });
    } catch (error) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch settings' 
      });
    }
  }

  if (req.method === 'PUT') {
    // Save settings to database
    try {
      const { general, security, email, payment, social, api, maintenance, cache, backup } = req.body as { 
        general?: Partial<GeneralSettings>; 
        security?: Partial<SecuritySettings>;
        email?: Partial<EmailSettings>;
        payment?: Partial<PaymentSettings>;
        social?: Partial<SocialSettings>;
        api?: Partial<ApiSettings>;
        maintenance?: Partial<MaintenanceSettings>;
        cache?: Partial<CacheSettings>;
        backup?: Partial<BackupSettings>;
      };

      const updates: Array<{ key: string; value: string; type: string }> = [];

      // Process general settings
      if (general) {
        Object.entries(general).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updates.push({
              key,
              value: String(value),
              type: 'general',
            });
          }
        });
      }

      // Process security settings
      if (security) {
        for (const [key, value] of Object.entries(security)) {
          if (value !== undefined && value !== null) {
            // Special handling for password - hash it
            if (key === 'admin_password' && value && String(value).length > 0) {
              const bcryptRounds = security.bcrypt_rounds || 10;
              const hashedPassword = await bcrypt.hash(String(value), bcryptRounds);
              updates.push({
                key,
                value: hashedPassword,
                type: 'security',
              });
            } else if (key !== 'admin_password') {
              updates.push({
                key,
                value: String(value),
                type: 'security',
              });
            }
          }
        }
      }

      // Process email settings
      if (email) {
        Object.entries(email).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updates.push({
              key,
              value: String(value),
              type: 'email',
            });
          }
        });
      }

      // Process payment settings
      if (payment) {
        Object.entries(payment).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updates.push({
              key,
              value: String(value),
              type: 'payment',
            });
          }
        });
      }

      // Process social settings
      if (social) {
        Object.entries(social).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updates.push({
              key,
              value: String(value),
              type: 'social',
            });
          }
        });
      }

      // Process api settings
      if (api) {
        Object.entries(api).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updates.push({
              key,
              value: String(value),
              type: 'api',
            });
          }
        });
      }

      // Process maintenance settings
      if (maintenance) {
        Object.entries(maintenance).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updates.push({
              key,
              value: String(value),
              type: 'maintenance',
            });
          }
        });
      }

      // Process cache settings
      if (cache) {
        Object.entries(cache).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updates.push({
              key,
              value: String(value),
              type: 'cache',
            });
          }
        });
      }

      // Process backup settings
      if (backup) {
        Object.entries(backup).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updates.push({
              key,
              value: String(value),
              type: 'backup',
            });
          }
        });
      }

      // Update database
      for (const update of updates) {
        // Get old value for audit log
        const oldRows = await query(
          'SELECT setting_value FROM site_settings WHERE setting_key = ?',
          [update.key]
        ) as SettingRow[];
        const oldValue = oldRows.length > 0 ? oldRows[0].setting_value : null;

        // Update setting
        await query(
          `INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_by) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           setting_value = VALUES(setting_value), 
           updated_by = VALUES(updated_by)`,
          [update.key, update.value, update.type, 'admin']
        );

        // Log to audit table (skip password for security)
        if (update.key !== 'admin_password' && update.key !== 'session_secret') {
          await query(
            `INSERT INTO site_settings_audit (setting_key, old_value, new_value, changed_by) 
             VALUES (?, ?, ?, ?)`,
            [update.key, oldValue, update.value, 'admin']
          );
        }
      }

      // Clear auth cache so new settings take effect immediately
      clearAuthCache();

      // Invalidate settings cache on update
      settingsCache.delete('settings:all');

      return res.status(200).json({ 
        success: true, 
        message: 'Settings saved successfully. Changes are now active.' 
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save settings' 
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
