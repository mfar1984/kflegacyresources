-- Migration: Add bank details fields to orders table for refund support
-- Date: 2025-10-22
-- Description: Add optional bank account fields and refund_pending status

-- IMPORTANT: Make sure you select the 'kflr' database first!
-- In phpMyAdmin: Select 'kflr' from left sidebar before running this
-- In MySQL CLI: Run "USE kflr;" first

USE kflr;

-- Add new status value
ALTER TABLE `orders` 
MODIFY COLUMN `status` ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded', 'refund_pending') DEFAULT 'pending';

-- Add bank detail columns
ALTER TABLE `orders` 
ADD COLUMN `customer_bank_account` VARCHAR(50) DEFAULT NULL COMMENT 'Optional bank account for refunds' AFTER `chip_checkout_url`,
ADD COLUMN `customer_bank_code` VARCHAR(20) DEFAULT NULL COMMENT 'Bank SWIFT/BIC code' AFTER `customer_bank_account`,
ADD COLUMN `customer_bank_holder_name` VARCHAR(255) DEFAULT NULL COMMENT 'Bank account holder name' AFTER `customer_bank_code`;

-- Add index for faster refund queries
ALTER TABLE `orders` ADD INDEX `idx_bank_account` (`customer_bank_account`);

