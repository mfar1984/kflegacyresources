-- ============================================================================
-- Migration: Add Missing Product Variants
-- Description: Add Power Cord variants for Netgate products that are missing them
-- Date: 2025-10-24
-- ============================================================================

-- Netgate 2100 MAX (product_id = 8) - Power Cord Variants
INSERT INTO product_variants (
  product_id, 
  option1_name, option1_value, 
  option2_name, option2_value, 
  option3_name, option3_value,
  sku, 
  price, 
  stock_quantity, 
  status
) VALUES
(8, 'Power Cord', 'USA (IEC Type B)', NULL, NULL, NULL, NULL, 'NETGATE-2100-MAX-PWR-USA', 0.00, -1, 'active'),
(8, 'Power Cord', 'EURO (IEC Type E/F)', NULL, NULL, NULL, NULL, 'NETGATE-2100-MAX-PWR-EURO', 0.00, -1, 'active'),
(8, 'Power Cord', 'UK (IEC Type G)', NULL, NULL, NULL, NULL, 'NETGATE-2100-MAX-PWR-UK', 0.00, -1, 'active'),
(8, 'Power Cord', 'None', NULL, NULL, NULL, NULL, 'NETGATE-2100-MAX-PWR-NONE', 0.00, -1, 'active');

-- Netgate 6100 BASE (product_id = 10) - Power Cord Variants
INSERT INTO product_variants (
  product_id, 
  option1_name, option1_value, 
  option2_name, option2_value, 
  option3_name, option3_value,
  sku, 
  price, 
  stock_quantity, 
  status
) VALUES
(10, 'Power Cord', 'USA (IEC Type B)', NULL, NULL, NULL, NULL, 'NETGATE-6100-BASE-PWR-USA', 0.00, -1, 'active'),
(10, 'Power Cord', 'EURO (IEC Type E/F)', NULL, NULL, NULL, NULL, 'NETGATE-6100-BASE-PWR-EURO', 0.00, -1, 'active'),
(10, 'Power Cord', 'UK (IEC Type G)', NULL, NULL, NULL, NULL, 'NETGATE-6100-BASE-PWR-UK', 0.00, -1, 'active'),
(10, 'Power Cord', 'None', NULL, NULL, NULL, NULL, 'NETGATE-6100-BASE-PWR-NONE', 0.00, -1, 'active');

-- Netgate 8200 MAX (product_id = 11) - Power Cord Variants
INSERT INTO product_variants (
  product_id, 
  option1_name, option1_value, 
  option2_name, option2_value, 
  option3_name, option3_value,
  sku, 
  price, 
  stock_quantity, 
  status
) VALUES
(11, 'Power Cord', 'USA (IEC Type B)', NULL, NULL, NULL, NULL, 'NETGATE-8200-MAX-PWR-USA', 0.00, -1, 'active'),
(11, 'Power Cord', 'EURO (IEC Type E/F)', NULL, NULL, NULL, NULL, 'NETGATE-8200-MAX-PWR-EURO', 0.00, -1, 'active'),
(11, 'Power Cord', 'UK (IEC Type G)', NULL, NULL, NULL, NULL, 'NETGATE-8200-MAX-PWR-UK', 0.00, -1, 'active'),
(11, 'Power Cord', 'None', NULL, NULL, NULL, NULL, 'NETGATE-8200-MAX-PWR-NONE', 0.00, -1, 'active');

-- Netgate 8300 BASE (product_id = 12) - Power Cord Variants
INSERT INTO product_variants (
  product_id, 
  option1_name, option1_value, 
  option2_name, option2_value, 
  option3_name, option3_value,
  sku, 
  price, 
  stock_quantity, 
  status
) VALUES
(12, 'Power Cord', 'USA (IEC Type B)', NULL, NULL, NULL, NULL, 'NETGATE-8300-BASE-PWR-USA', 0.00, -1, 'active'),
(12, 'Power Cord', 'EURO (IEC Type E/F)', NULL, NULL, NULL, NULL, 'NETGATE-8300-BASE-PWR-EURO', 0.00, -1, 'active'),
(12, 'Power Cord', 'UK (IEC Type G)', NULL, NULL, NULL, NULL, 'NETGATE-8300-BASE-PWR-UK', 0.00, -1, 'active'),
(12, 'Power Cord', 'None', NULL, NULL, NULL, NULL, 'NETGATE-8300-BASE-PWR-NONE', 0.00, -1, 'active');

-- Netgate 8300 MAX (product_id = 13) - Power Cord Variants
INSERT INTO product_variants (
  product_id, 
  option1_name, option1_value, 
  option2_name, option2_value, 
  option3_name, option3_value,
  sku, 
  price, 
  stock_quantity, 
  status
) VALUES
(13, 'Power Cord', 'USA (IEC Type B)', NULL, NULL, NULL, NULL, 'NETGATE-8300-MAX-PWR-USA', 0.00, -1, 'active'),
(13, 'Power Cord', 'EURO (IEC Type E/F)', NULL, NULL, NULL, NULL, 'NETGATE-8300-MAX-PWR-EURO', 0.00, -1, 'active'),
(13, 'Power Cord', 'UK (IEC Type G)', NULL, NULL, NULL, NULL, 'NETGATE-8300-MAX-PWR-UK', 0.00, -1, 'active'),
(13, 'Power Cord', 'None', NULL, NULL, NULL, NULL, 'NETGATE-8300-MAX-PWR-NONE', 0.00, -1, 'active');

-- Netgate 8300 TAA (product_id = 14) - Power Cord Variants
INSERT INTO product_variants (
  product_id, 
  option1_name, option1_value, 
  option2_name, option2_value, 
  option3_name, option3_value,
  sku, 
  price, 
  stock_quantity, 
  status
) VALUES
(14, 'Power Cord', 'USA (IEC Type B)', NULL, NULL, NULL, NULL, 'NETGATE-8300-TAA-PWR-USA', 0.00, -1, 'active'),
(14, 'Power Cord', 'EURO (IEC Type E/F)', NULL, NULL, NULL, NULL, 'NETGATE-8300-TAA-PWR-EURO', 0.00, -1, 'active'),
(14, 'Power Cord', 'UK (IEC Type G)', NULL, NULL, NULL, NULL, 'NETGATE-8300-TAA-PWR-UK', 0.00, -1, 'active'),
(14, 'Power Cord', 'None', NULL, NULL, NULL, NULL, 'NETGATE-8300-TAA-PWR-NONE', 0.00, -1, 'active');

-- ============================================================================
-- Summary:
-- - Added 24 variants total (4 variants × 6 products)
-- - All variants set to Pre-order (stock_quantity = -1)
-- - All variants have price = 0.00 (no additional cost for power cord selection)
-- - Power Cord options: USA (IEC Type B), EURO (IEC Type E/F), UK (IEC Type G), None
-- ============================================================================

