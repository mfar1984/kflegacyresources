-- Migration: Create order analytics table for tracking cancelled/archived orders
-- Date: 2025-10-22
-- Description: Track all order lifecycle events for analytics before cancellation

USE kflr;

-- Create order_analytics table to preserve data before cancellation
CREATE TABLE IF NOT EXISTS `order_analytics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL COMMENT 'Reference to orders.id',
  `reference` VARCHAR(255) NOT NULL COMMENT 'Order reference number',
  `chip_payment_id` VARCHAR(255) NULL COMMENT 'CHIP payment ID',
  
  -- Customer info (for analytics)
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NULL,
  
  -- Order details
  `total_amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'MYR',
  `status_before_cancel` ENUM('pending', 'viewed', 'paid', 'failed', 'cancelled', 'refunded', 'refund_pending', 'partial_refund') NOT NULL,
  
  -- Timestamps for analytics
  `order_created_at` DATETIME NOT NULL COMMENT 'When order was created',
  `order_viewed_at` DATETIME NULL COMMENT 'When user viewed payment page',
  `order_cancelled_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When order was cancelled',
  
  -- Analytics metrics
  `days_until_cancel` INT COMMENT 'Days between creation and cancellation',
  `cancel_reason` ENUM('auto_cleanup', 'manual_admin', 'user_request', 'expired') DEFAULT 'auto_cleanup',
  `cancel_method` ENUM('chip_api', 'local_only') DEFAULT 'chip_api',
  
  -- Additional metadata
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_reference (reference),
  INDEX idx_chip_payment_id (chip_payment_id),
  INDEX idx_customer_email (customer_email),
  INDEX idx_status (status_before_cancel),
  INDEX idx_cancelled_at (order_cancelled_at),
  INDEX idx_cancel_reason (cancel_reason)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Analytics archive for cancelled orders';

-- Verify table creation
SHOW TABLES LIKE 'order_analytics';
DESCRIBE order_analytics;

