-- Add extended fields to products table for store detail pages
-- This migration adds support for:
-- 1. Gallery images (multiple images)
-- 2. Key highlights (bullet points)
-- 3. Included items (what's included with purchase)
-- 4. Tabbed content (overview, specs, performance, features, support)

USE kflr;

-- Add new columns to products table (one by one to handle existing columns gracefully)
-- Check if columns exist before adding

-- Check and add gallery_images
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'kflr' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'gallery_images');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE products ADD COLUMN gallery_images JSON COMMENT "Array of gallery image URLs with alt text" AFTER images;',
  'SELECT "Column gallery_images already exists" as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add key_highlights
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'kflr' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'key_highlights');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE products ADD COLUMN key_highlights JSON COMMENT "Array of key highlight points" AFTER gallery_images;',
  'SELECT "Column key_highlights already exists" as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add included_items
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'kflr' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'included_items');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE products ADD COLUMN included_items JSON COMMENT "Array of items included with purchase" AFTER key_highlights;',
  'SELECT "Column included_items already exists" as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add tab_overview
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'kflr' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'tab_overview');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE products ADD COLUMN tab_overview LONGTEXT COMMENT "Overview tab content (HTML/Rich text)" AFTER included_items;',
  'SELECT "Column tab_overview already exists" as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add tab_specifications
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'kflr' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'tab_specifications');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE products ADD COLUMN tab_specifications LONGTEXT COMMENT "Technical specifications tab content (HTML/JSON)" AFTER tab_overview;',
  'SELECT "Column tab_specifications already exists" as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add tab_performance
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'kflr' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'tab_performance');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE products ADD COLUMN tab_performance LONGTEXT COMMENT "Performance metrics tab content (HTML/JSON)" AFTER tab_specifications;',
  'SELECT "Column tab_performance already exists" as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add tab_features
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'kflr' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'tab_features');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE products ADD COLUMN tab_features LONGTEXT COMMENT "Features tab content (HTML/Rich text)" AFTER tab_performance;',
  'SELECT "Column tab_features already exists" as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add tab_support
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'kflr' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'tab_support');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE products ADD COLUMN tab_support LONGTEXT COMMENT "Support/Warranty tab content (HTML/Rich text)" AFTER tab_features;',
  'SELECT "Column tab_support already exists" as message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing products with sample data structure (optional - for testing)
-- You can remove this if you don't want sample data
UPDATE products SET
  gallery_images = JSON_ARRAY(),
  key_highlights = JSON_ARRAY(),
  included_items = JSON_ARRAY()
WHERE gallery_images IS NULL;

SELECT 'Migration completed: Added extended product fields for store detail pages' as status;

