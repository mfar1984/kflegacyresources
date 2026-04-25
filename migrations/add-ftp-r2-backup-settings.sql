-- Add FTP and Cloudflare R2 backup settings to site_settings table
-- Run this migration: mysql -u root -p kflr < migrations/add-ftp-r2-backup-settings.sql

-- Insert FTP and R2 settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_by) VALUES
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
WHERE setting_type = 'backup'
ORDER BY setting_key;
