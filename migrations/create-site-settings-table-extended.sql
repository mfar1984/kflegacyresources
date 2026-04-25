-- Extended Site Settings Migration
-- Adds settings for Email, Payment, Social Media, Integrations, and Maintenance tabs

-- First, alter the setting_type ENUM to include new types
ALTER TABLE `site_settings` 
MODIFY COLUMN `setting_type` ENUM('string', 'number', 'boolean', 'json', 'general', 'security', 'email', 'payment', 'social', 'api', 'maintenance') DEFAULT 'string';

-- Add new settings to existing site_settings table
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES

-- Email & Notifications Settings
('smtp_host', 'smtp.gmail.com', 'email', 'SMTP server host'),
('smtp_port', '587', 'email', 'SMTP server port'),
('smtp_username', '', 'email', 'SMTP username/email'),
('smtp_password', '', 'email', 'SMTP password'),
('smtp_encryption', 'tls', 'email', 'SMTP encryption (tls/ssl/none)'),
('smtp_from_name', 'KF Legacy Resources', 'email', 'Email sender name'),
('smtp_from_email', 'noreply@kflegacy.com', 'email', 'Email sender address'),
('smtp_reply_to', 'info@kflegacy.com', 'email', 'Reply-to email address'),
('notify_new_order', 'true', 'email', 'Send notification on new order'),
('notify_customer_inquiry', 'true', 'email', 'Send notification on customer inquiry'),
('notify_low_stock', 'true', 'email', 'Send notification on low stock'),

-- Payment Gateway Settings
('chip_brand_id', '', 'payment', 'CHIP Brand ID'),
('chip_secret_key', '', 'payment', 'CHIP Secret Key'),
('chip_public_key', '', 'payment', 'CHIP Public Key'),
('chip_webhook_url', '', 'payment', 'CHIP Webhook URL'),
('chip_test_mode', 'false', 'payment', 'Enable CHIP test mode'),
('payment_currency', 'MYR', 'payment', 'Default payment currency'),
('payment_currency_symbol', 'RM', 'payment', 'Currency symbol'),
('payment_min_amount', '10', 'payment', 'Minimum payment amount'),
('payment_max_amount', '50000', 'payment', 'Maximum payment amount'),
('payment_fpx_enabled', 'true', 'payment', 'Enable FPX payment'),
('payment_card_enabled', 'true', 'payment', 'Enable credit/debit card'),
('payment_ewallet_enabled', 'true', 'payment', 'Enable e-wallet payment'),

-- Social Media & SEO Settings
('social_facebook', '', 'social', 'Facebook page URL'),
('social_instagram', '', 'social', 'Instagram profile URL'),
('social_linkedin', '', 'social', 'LinkedIn company URL'),
('social_twitter', '', 'social', 'Twitter/X profile URL'),
('social_whatsapp', '', 'social', 'WhatsApp business number'),
('social_youtube', '', 'social', 'YouTube channel URL'),
('analytics_google_id', '', 'social', 'Google Analytics ID (GA4)'),
('analytics_gtm_id', '', 'social', 'Google Tag Manager ID'),
('analytics_facebook_pixel', '', 'social', 'Facebook Pixel ID'),
('analytics_tiktok_pixel', '', 'social', 'TikTok Pixel ID'),
('seo_meta_keywords', 'network, infrastructure, security, IT solutions', 'social', 'Meta keywords'),
('seo_meta_author', 'KF Legacy Resources', 'social', 'Meta author'),
('seo_meta_robots', 'index, follow', 'social', 'Meta robots'),
('seo_og_type', 'website', 'social', 'Open Graph type'),

-- API Settings
('api_enabled', 'false', 'api', 'Enable API access'),
('api_key', '', 'api', 'API public key'),
('api_secret', '', 'api', 'API secret key'),
('api_allowed_origins', '', 'api', 'Comma-separated allowed origins for CORS'),
('api_rate_limit', '100', 'api', 'API rate limit (requests per window)'),
('api_rate_limit_window', '60', 'api', 'Rate limit time window in seconds'),
('api_webhook_secret', '', 'api', 'Webhook signature secret'),
('api_cors_enabled', 'true', 'api', 'Enable CORS'),
('api_require_https', 'true', 'api', 'Require HTTPS for API requests'),
('api_log_requests', 'true', 'api', 'Log all API requests'),

-- Maintenance & System Settings
('maintenance_mode', 'false', 'maintenance', 'Enable maintenance mode'),
('maintenance_message', 'We are currently performing scheduled maintenance. Please check back soon.', 'maintenance', 'Maintenance mode message'),
('maintenance_allowed_ips', '', 'maintenance', 'Comma-separated allowed IPs during maintenance'),
('maintenance_scheduled_start', '', 'maintenance', 'Scheduled maintenance start time'),
('maintenance_scheduled_end', '', 'maintenance', 'Scheduled maintenance end time'),
('system_debug_mode', 'false', 'maintenance', 'Enable debug mode'),
('system_log_level', 'error', 'maintenance', 'Logging level (error/warning/info/debug)'),
('system_log_retention_days', '30', 'maintenance', 'Log retention period in days'),
('system_cache_enabled', 'true', 'maintenance', 'Enable caching'),
('system_cache_ttl', '3600', 'maintenance', 'Cache TTL in seconds'),
('system_backup_enabled', 'false', 'maintenance', 'Enable automatic backups'),
('system_backup_schedule', 'daily', 'maintenance', 'Backup schedule (daily/weekly/monthly)'),
('system_backup_retention', '7', 'maintenance', 'Backup retention in days')

ON DUPLICATE KEY UPDATE 
  `setting_value` = VALUES(`setting_value`),
  `description` = VALUES(`description`);
