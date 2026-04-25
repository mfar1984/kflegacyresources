-- Migration: Add refund amount tracking for partial refunds
-- Date: 2025-10-22
-- Description: Add refund_amount column and partial_refund status

USE kflr;

-- Add partial_refund to status ENUM
ALTER TABLE `orders` 
MODIFY COLUMN `status` ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded', 'refund_pending', 'partial_refund') DEFAULT 'pending';

-- Add refund_amount column to track partial refunds
ALTER TABLE `orders` 
ADD COLUMN `refund_amount` DECIMAL(10,2) DEFAULT NULL COMMENT 'Amount refunded (for partial refunds)' AFTER `total_amount`;

-- Verify changes
SHOW COLUMNS FROM `orders` LIKE 'status';
SHOW COLUMNS FROM `orders` LIKE 'refund_amount';

