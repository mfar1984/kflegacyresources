-- Migration: Add 'viewed' status for payments that were viewed but not completed
-- Date: 2025-10-22
-- Description: Add 'viewed' status to orders table to match CHIP-Asia status

USE kflr;

-- Add 'viewed' to status ENUM
-- This represents: Payment page was viewed by customer but not completed
ALTER TABLE `orders` 
MODIFY COLUMN `status` ENUM('pending', 'viewed', 'paid', 'failed', 'cancelled', 'refunded', 'refund_pending', 'partial_refund') DEFAULT 'pending';

-- Verify changes
SHOW COLUMNS FROM `orders` LIKE 'status';

-- Optional: Update existing 'pending' orders to 'viewed' if they have chip_payment_id
-- (This means they were redirected to CHIP payment page)
-- Uncomment if you want to update historical data:
-- UPDATE `orders` 
-- SET `status` = 'viewed' 
-- WHERE `status` = 'pending' 
--   AND `chip_payment_id` IS NOT NULL 
--   AND `paid_at` IS NULL;

