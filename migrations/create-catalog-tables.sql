-- ============================================================================
-- Migration: Create Catalog Tables for Product Management
-- Date: 2025-10-22
-- Description: Create tables for products, categories, and catalog settings
-- ============================================================================

USE kflr;

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================
-- Stores product categories for store filter buttons
-- Examples: "All Products", "Networking", "Security", "Programming"

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Category name (e.g., "Networking")',
  `slug` VARCHAR(255) NOT NULL UNIQUE COMMENT 'URL-friendly slug (e.g., "networking")',
  `description` TEXT DEFAULT NULL COMMENT 'Category description',
  `icon` VARCHAR(100) DEFAULT NULL COMMENT 'Icon class or emoji for category button',
  `image` VARCHAR(500) DEFAULT NULL COMMENT 'Category image URL',
  `parent_id` INT DEFAULT NULL COMMENT 'Parent category for hierarchical categories',
  `sort_order` INT DEFAULT 0 COMMENT 'Display order in store page',
  `status` ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Category visibility',
  `seo_title` VARCHAR(255) DEFAULT NULL COMMENT 'SEO meta title',
  `seo_description` TEXT DEFAULT NULL COMMENT 'SEO meta description',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. PRODUCTS TABLE
-- ============================================================================
-- Stores all products displayed in the store

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Product name',
  `slug` VARCHAR(255) NOT NULL UNIQUE COMMENT 'URL-friendly slug',
  `description` TEXT DEFAULT NULL COMMENT 'Product description (supports HTML)',
  `short_description` VARCHAR(500) DEFAULT NULL COMMENT 'Short description for card display',
  
  -- Pricing
  `price` DECIMAL(10,2) NOT NULL COMMENT 'Current selling price',
  `compare_price` DECIMAL(10,2) DEFAULT NULL COMMENT 'Original price (for showing discount)',
  `cost_price` DECIMAL(10,2) DEFAULT NULL COMMENT 'Cost price (for profit calculation)',
  `currency` VARCHAR(10) DEFAULT 'MYR' COMMENT 'Currency code',
  
  -- Inventory
  `sku` VARCHAR(100) DEFAULT NULL COMMENT 'Stock Keeping Unit',
  `barcode` VARCHAR(100) DEFAULT NULL COMMENT 'Product barcode',
  `stock_quantity` INT DEFAULT 0 COMMENT 'Available stock quantity',
  `track_inventory` BOOLEAN DEFAULT TRUE COMMENT 'Whether to track stock',
  `low_stock_threshold` INT DEFAULT 5 COMMENT 'Low stock alert threshold',
  
  -- Product Details
  `weight` DECIMAL(10,2) DEFAULT NULL COMMENT 'Product weight in kg',
  `dimensions` VARCHAR(100) DEFAULT NULL COMMENT 'Product dimensions (L x W x H)',
  `vendor` VARCHAR(255) DEFAULT NULL COMMENT 'Product vendor/supplier',
  `brand` VARCHAR(255) DEFAULT NULL COMMENT 'Product brand',
  
  -- Media & Assets
  `images` JSON DEFAULT NULL COMMENT 'Array of product image URLs',
  `featured_image` VARCHAR(500) DEFAULT NULL COMMENT 'Main product image',
  
  -- Organization
  `tags` JSON DEFAULT NULL COMMENT 'Product tags (e.g., ["new", "sale", "featured"])',
  `status` ENUM('active', 'draft', 'archived') DEFAULT 'active' COMMENT 'Product visibility',
  
  -- SEO
  `seo_title` VARCHAR(255) DEFAULT NULL COMMENT 'SEO meta title',
  `seo_description` TEXT DEFAULT NULL COMMENT 'SEO meta description',
  `seo_keywords` VARCHAR(500) DEFAULT NULL COMMENT 'SEO keywords',
  
  -- Additional Info
  `specifications` JSON DEFAULT NULL COMMENT 'Technical specifications (key-value pairs)',
  `features` JSON DEFAULT NULL COMMENT 'Product features (array)',
  `notes` TEXT DEFAULT NULL COMMENT 'Internal notes (not visible to customers)',
  
  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_slug` (`slug`),
  INDEX `idx_sku` (`sku`),
  INDEX `idx_status` (`status`),
  INDEX `idx_price` (`price`),
  INDEX `idx_stock` (`stock_quantity`),
  FULLTEXT INDEX `idx_search` (`name`, `description`, `sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. PRODUCT_CATEGORIES TABLE (Many-to-Many Junction)
-- ============================================================================
-- Links products to categories (one product can have multiple categories)

CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_product_category` (`product_id`, `category_id`),
  INDEX `idx_product` (`product_id`),
  INDEX `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. PRODUCT_VARIANTS TABLE (Optional - for products with variants)
-- ============================================================================
-- Stores product variants (e.g., Size, Color combinations)

CREATE TABLE IF NOT EXISTS `product_variants` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL COMMENT 'Parent product',
  
  -- Variant Options (up to 3 option levels)
  `option1_name` VARCHAR(100) DEFAULT NULL COMMENT 'First option name (e.g., "Size")',
  `option1_value` VARCHAR(100) DEFAULT NULL COMMENT 'First option value (e.g., "Large")',
  `option2_name` VARCHAR(100) DEFAULT NULL COMMENT 'Second option name (e.g., "Color")',
  `option2_value` VARCHAR(100) DEFAULT NULL COMMENT 'Second option value (e.g., "Red")',
  `option3_name` VARCHAR(100) DEFAULT NULL COMMENT 'Third option name',
  `option3_value` VARCHAR(100) DEFAULT NULL COMMENT 'Third option value',
  
  -- Variant Specifics
  `sku` VARCHAR(100) DEFAULT NULL COMMENT 'Variant-specific SKU',
  `barcode` VARCHAR(100) DEFAULT NULL COMMENT 'Variant-specific barcode',
  `price` DECIMAL(10,2) DEFAULT NULL COMMENT 'Variant price (overrides product price)',
  `compare_price` DECIMAL(10,2) DEFAULT NULL COMMENT 'Variant compare price',
  `cost_price` DECIMAL(10,2) DEFAULT NULL COMMENT 'Variant cost price',
  `stock_quantity` INT DEFAULT 0 COMMENT 'Variant stock quantity',
  `weight` DECIMAL(10,2) DEFAULT NULL COMMENT 'Variant weight',
  `image` VARCHAR(500) DEFAULT NULL COMMENT 'Variant-specific image',
  
  -- Status
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  
  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_product` (`product_id`),
  INDEX `idx_sku` (`sku`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. CATALOG_SETTINGS TABLE
-- ============================================================================
-- Stores global catalog/store display settings

CREATE TABLE IF NOT EXISTS `catalog_settings` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Setting identifier',
  `setting_value` TEXT DEFAULT NULL COMMENT 'Setting value (can be JSON)',
  `setting_type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT 'Value type',
  `description` VARCHAR(500) DEFAULT NULL COMMENT 'Setting description',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. INSERT DEFAULT SETTINGS
-- ============================================================================

INSERT INTO `catalog_settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('products_per_page', '12', 'number', 'Number of products to display per page in store'),
('default_sort', 'newest', 'string', 'Default product sorting (newest, price_asc, price_desc, name_asc, name_desc)'),
('show_search_bar', 'true', 'boolean', 'Show search bar in store page'),
('show_category_filter', 'true', 'boolean', 'Show category filter buttons in store page'),
('show_out_of_stock', 'true', 'boolean', 'Show out of stock products in store'),
('low_stock_badge', 'true', 'boolean', 'Show low stock badge on products'),
('show_compare_price', 'true', 'boolean', 'Show original price with strikethrough for discounts'),
('currency_symbol', 'RM', 'string', 'Currency symbol to display'),
('related_products_count', '4', 'number', 'Number of related products to show on product page'),
('enable_product_reviews', 'false', 'boolean', 'Enable customer product reviews')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- ============================================================================
-- 7. INSERT DEFAULT CATEGORIES
-- ============================================================================

INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `sort_order`, `status`) VALUES
('All Products', 'all', 'Browse all available products', '📦', 0, 'active'),
('Networking', 'networking', 'Enterprise-grade networking equipment', '🌐', 1, 'active'),
('Security', 'security', 'Security and surveillance solutions', '🛡️', 2, 'active'),
('Programming', 'programming', 'Custom programming and development services', '💻', 3, 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Categories table created' AS status, COUNT(*) AS count FROM categories;
SELECT 'Products table created' AS status, COUNT(*) AS count FROM products;
SELECT 'Catalog settings inserted' AS status, COUNT(*) AS count FROM catalog_settings;

SHOW TABLES LIKE '%product%';
SHOW TABLES LIKE '%categor%';
SHOW TABLES LIKE '%catalog%';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

