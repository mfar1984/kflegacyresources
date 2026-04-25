-- Add Cache and Backup settings to site_settings table
-- Run this migration: mysql -u root -p kflr < migrations/add-cache-backup-settings.sql

-- First, modify the ENUM to include 'cache' and 'backup' types
ALTER TABLE site_settings 
MODIFY COLUMN setting_type ENUM('general', 'security', 'email', 'payment', 'social', 'api', 'maintenance', 'cache', 'backup') NOT NULL;

-- Insert Cache settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_by) VALUES
('cache_enabled', 'true', 'cache', 'system'),
('cache_ttl', '3600', 'cache', 'system'),
('cache_driver', 'redis', 'cache', 'system'),
('revalidate_on_demand', 'true', 'cache', 'system')
ON DUPLICATE KEY UPDATE 
setting_value = VALUES(setting_value),
updated_by = VALUES(updated_by);

-- Insert Backup settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_by) VALUES
('backup_enabled', 'false', 'backup', 'system'),
('backup_schedule', 'daily', 'backup', 'system'),
('backup_retention', '7', 'backup', 'system'),
('backup_location', 'local', 'backup', 'system'),
('backup_include_database', 'true', 'backup', 'system'),
('backup_include_files', 'true', 'backup', 'system'),
('ftp_host', '', 'backup', 'system'),
('ftp_port', '21', 'backup', 'system'),
('ftp_username', '', 'backup', 'system'),
('ftp_password', '', 'backup', 'system'),
('ftp_path', '/backups', 'backup', 'system'),
('r2_account_id', '', 'backup', 'system'),
('r2_access_key_id', '', 'backup', 'system'),
('r2_secret_access_key', '', 'backup', 'system'),
('r2_bucket_name', '', 'backup', 'system')
ON DUPLICATE KEY UPDATE 
setting_value = VALUES(setting_value),
updated_by = VALUES(updated_by);

-- Verify the changes
SELECT setting_key, setting_value, setting_type 
FROM site_settings 
WHERE setting_type IN ('cache', 'backup')
ORDER BY setting_type, setting_key;
