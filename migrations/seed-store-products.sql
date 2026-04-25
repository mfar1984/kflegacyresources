-- ================================================
-- SEED STORE PRODUCTS FROM EXISTING STORE PAGE
-- ================================================
-- This migration adds all 14 products from the store page
-- Including: Netgate products (10) + Web Development services (4)
-- ================================================

-- Create categories first (if not exist)
INSERT INTO categories (name, slug, description, status, sort_order) VALUES
('Networking', 'networking', 'Enterprise networking solutions and equipment', 'active', 1),
('Security', 'security', 'Security gateways and firewall solutions', 'active', 2),
('Programming', 'programming', 'Web development and software solutions', 'active', 3)
ON DUPLICATE KEY UPDATE name=name;

-- Get category IDs for reference
SET @cat_networking = (SELECT id FROM categories WHERE slug = 'networking' LIMIT 1);
SET @cat_security = (SELECT id FROM categories WHERE slug = 'security' LIMIT 1);
SET @cat_programming = (SELECT id FROM categories WHERE slug = 'programming' LIMIT 1);

-- ================================================
-- PRODUCT 1: Netgate 1100 pfSense+ Security Gateway
-- ================================================
INSERT INTO products (
    name, slug, description, short_description, 
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Netgate 1100 pfSense+ Security Gateway',
    'netgate-1100',
    'Compact and powerful pfSense+ security gateway for home and small office',
    'Compact and powerful pfSense+ security gateway for home and small office',
    899.00, 'MYR', 'NETGATE-1100', -1, 1,
    '/assets/img/store/netgate1100/sg-1100_fronttopangle1_80d4b75d-176d-4074-98e3-1b44b83484d2_1024x1024.webp',
    'active', 'Netgate', 'pfSense', '["networking","security","firewall","pfsense"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_networking), (@product_id, @cat_security);

-- ================================================
-- PRODUCT 2: Netgate 2100 BASE pfSense+ Security Gateway
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Netgate 2100 BASE pfSense+ Security Gateway',
    'netgate-2100-base',
    'Entry-level enterprise security gateway with BASE configuration',
    'Entry-level enterprise security gateway with BASE configuration',
    1299.00, 'MYR', 'NETGATE-2100-BASE', -1, 1,
    '/assets/img/store/netgate2100/SG-2100frontAngled_1024x1024.webp',
    'active', 'Netgate', 'pfSense', '["networking","security","firewall","pfsense","enterprise"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_networking), (@product_id, @cat_security);

-- ================================================
-- PRODUCT 3: Netgate 2100 MAX pfSense+ Security Gateway
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Netgate 2100 MAX pfSense+ Security Gateway',
    'netgate-2100-max',
    'Enhanced performance model with MAX configuration',
    'Enhanced performance model with MAX configuration',
    1699.00, 'MYR', 'NETGATE-2100-MAX', -1, 1,
    '/assets/img/store/netgate2100/SG-2100frontAngled_1024x1024.webp',
    'active', 'Netgate', 'pfSense', '["networking","security","firewall","pfsense","enterprise"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_networking), (@product_id, @cat_security);

-- ================================================
-- PRODUCT 4: Netgate 4200 MAX pfSense+ Security Gateway
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Netgate 4200 MAX pfSense+ Security Gateway',
    'netgate-4200-max',
    'Most versatile security gateway - 8.75 Gbps routing, 4x 2.5GbE ports, silent operation',
    'Most versatile security gateway - 8.75 Gbps routing, 4x 2.5GbE ports, silent operation',
    2499.00, 'MYR', 'NETGATE-4200-MAX', -1, 1,
    '/assets/img/store/netgate4200/4200_front_corner_angle.jpg',
    'active', 'Netgate', 'pfSense', '["networking","security","firewall","pfsense","enterprise","2.5gbe"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_networking), (@product_id, @cat_security);

-- ================================================
-- PRODUCT 5: Netgate 6100 BASE pfSense+ Security Gateway
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Netgate 6100 BASE pfSense+ Security Gateway',
    'netgate-6100-base',
    'High-performance security gateway BASE model - 18.5 Gbps routing, 8 independent ports',
    'High-performance security gateway BASE model - 18.5 Gbps routing, 8 independent ports',
    3299.00, 'MYR', 'NETGATE-6100-BASE', -1, 1,
    '/assets/img/store/netgate6100/6100_front_angle.jpg',
    'active', 'Netgate', 'pfSense', '["networking","security","firewall","pfsense","enterprise","10gbe"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_networking), (@product_id, @cat_security);

-- ================================================
-- PRODUCT 6: Netgate 6100 MAX pfSense+ Security Gateway (ALREADY EXISTS - SKIP)
-- ================================================
-- This product already exists in database from manual entry
-- Skip to avoid duplicate

-- ================================================
-- PRODUCT 7: Netgate 8200 MAX pfSense+ Security Gateway
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Netgate 8200 MAX pfSense+ Security Gateway',
    'netgate-8200-max',
    'Enterprise-grade 1U rackmount - Intel 8-core, 16GB RAM, 128GB NVMe',
    'Enterprise-grade 1U rackmount - Intel 8-core, 16GB RAM, 128GB NVMe',
    4999.00, 'MYR', 'NETGATE-8200-MAX', -1, 1,
    '/assets/img/store/netgate8200/8200_front_angle.jpg',
    'active', 'Netgate', 'pfSense', '["networking","security","firewall","pfsense","enterprise","rackmount","1u"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_networking), (@product_id, @cat_security);

-- ================================================
-- PRODUCT 8: Netgate 8300 BASE pfSense+ Security Gateway
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Netgate 8300 BASE pfSense+ Security Gateway',
    'netgate-8300-base',
    'Top-tier 1U rackmount with 25/100GbE expansion - Intel 8-core processor',
    'Top-tier 1U rackmount with 25/100GbE expansion - Intel 8-core processor',
    5999.00, 'MYR', 'NETGATE-8300-BASE', -1, 1,
    '/assets/img/store/netgate8300/8300_front_angle.jpg',
    'active', 'Netgate', 'pfSense', '["networking","security","firewall","pfsense","enterprise","rackmount","1u","25gbe","100gbe"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_networking), (@product_id, @cat_security);

-- ================================================
-- PRODUCT 9: Netgate 8300 MAX pfSense+ Security Gateway
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Netgate 8300 MAX pfSense+ Security Gateway',
    'netgate-8300-max',
    'Maximum performance 8300 with 128GB NVMe and full expansion options',
    'Maximum performance 8300 with 128GB NVMe and full expansion options',
    6999.00, 'MYR', 'NETGATE-8300-MAX', -1, 1,
    '/assets/img/store/netgate8300/8300_front_head-on.jpg',
    'active', 'Netgate', 'pfSense', '["networking","security","firewall","pfsense","enterprise","rackmount","1u","25gbe","100gbe"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_networking), (@product_id, @cat_security);

-- ================================================
-- PRODUCT 10: Netgate 8300 TAA pfSense+ Security Gateway
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Netgate 8300 TAA pfSense+ Security Gateway',
    'netgate-8300-taa',
    'TAA-compliant model for government and enterprise - fully certified',
    'TAA-compliant model for government and enterprise - fully certified',
    7499.00, 'MYR', 'NETGATE-8300-TAA', -1, 1,
    '/assets/img/store/netgate8300/8300_front_top_angle.jpg',
    'active', 'Netgate', 'pfSense', '["networking","security","firewall","pfsense","enterprise","rackmount","1u","taa","government","25gbe","100gbe"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_networking), (@product_id, @cat_security);

-- ================================================
-- PRODUCT 11: Basic Website Profile Company
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'Basic Website Profile Company',
    'basic-website',
    'Professional company profile website with hosting and domain included',
    'Professional company profile website with hosting and domain included',
    750.00, 'MYR', 'WEB-BASIC-001', 100, 1,
    '/assets/img/hero-img.png',
    'active', 'KF Legacy Resources', 'KF Legacy', '["web development","website","company profile","hosting","domain"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_programming);

-- ================================================
-- PRODUCT 12: E-Commerce Website
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags
) VALUES (
    'E-Commerce Website',
    'ecommerce-website',
    'Complete e-commerce solution with hosting and domain included',
    'Complete e-commerce solution with hosting and domain included',
    1500.00, 'MYR', 'WEB-ECOM-001', 100, 1,
    '/assets/img/hero-img.png',
    'active', 'KF Legacy Resources', 'KF Legacy', '["web development","ecommerce","online store","hosting","domain"]'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_programming);

-- ================================================
-- PRODUCT 13: Web Based System
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags,
    notes
) VALUES (
    'Web Based System',
    'web-based-system',
    'Custom web-based system tailored to your needs - hosting and domain included',
    'Custom web-based system tailored to your needs - hosting and domain included',
    5000.00, 'MYR', 'WEB-SYSTEM-001', 100, 1,
    '/assets/img/hero-img.png',
    'active', 'KF Legacy Resources', 'KF Legacy', '["web development","custom system","web app","hosting","domain"]',
    'Price range: RM 5,000 - RM 35,000 depending on requirements'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_programming);

-- ================================================
-- PRODUCT 14: Web Based System + Android
-- ================================================
INSERT INTO products (
    name, slug, description, short_description,
    price, currency, sku, stock_quantity, track_inventory,
    featured_image, status, vendor, brand, tags,
    notes
) VALUES (
    'Web Based System + Android',
    'web-based-system-android',
    'Full-stack web and Android app solution - hosting and domain included',
    'Full-stack web and Android app solution - hosting and domain included',
    5000.00, 'MYR', 'WEB-SYSTEM-ANDROID-001', 100, 1,
    '/assets/img/hero-img.png',
    'active', 'KF Legacy Resources', 'KF Legacy', '["web development","android app","mobile app","custom system","hosting","domain"]',
    'Price range: RM 5,000 - RM 55,000 depending on requirements'
);
SET @product_id = LAST_INSERT_ID();
INSERT INTO product_categories (product_id, category_id) VALUES (@product_id, @cat_programming);

-- ================================================
-- SUMMARY
-- ================================================
-- Total products inserted: 13 (excluding Netgate 6100 MAX which already exists)
-- Categories: Networking, Security, Programming
-- All products set to Pre-order (-1 stock) for Netgate, In-stock (100) for web services
-- ================================================

