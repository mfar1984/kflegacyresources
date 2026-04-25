-- Update API Settings Migration
-- Removes old API fields and adds new API configuration fields

-- Delete old API settings that are no longer used
DELETE FROM `site_settings` WHERE `setting_key` IN ('api_endpoint', 'api_timeout');

-- Insert/Update new API settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('api_enabled', 'false', 'api', 'Enable API access'),
('api_key', '', 'api', 'API public key'),
('api_secret', '', 'api', 'API secret key'),
('api_allowed_origins', '', 'api', 'Comma-separated allowed origins for CORS'),
('api_rate_limit', '100', 'api', 'API rate limit (requests per window)'),
('api_rate_limit_window', '60', 'api', 'Rate limit time window in seconds'),
('api_webhook_secret', '', 'api', 'Webhook signature secret'),
('api_cors_enabled', 'true', 'api', 'Enable CORS'),
('api_require_https', 'true', 'api', 'Require HTTPS for API requests'),
('api_log_requests', 'true', 'api', 'Log all API requests')
ON DUPLICATE KEY UPDATE 
  `setting_value` = VALUES(`setting_value`),
  `description` = VALUES(`description`);
