-- ================================================
-- UPDATE PRODUCTS WITH COMPLETE DATA
-- ================================================
-- This migration updates all 14 products with complete details:
-- - Gallery Images
-- - Key Highlights
-- - Included Items
-- - Tab Content (Overview, Specs, Performance, Features, Support)
-- - Variants (Power Cord / Mount Kit options)
-- ================================================

-- ================================================
-- PRODUCT 1: Netgate 1100 pfSense+ Security Gateway
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate1100/sg-1100_fronttopangle1_80d4b75d-176d-4074-98e3-1b44b83484d2_1024x1024.webp', 'alt', 'Angle view'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate1100/SG-1100_Front_Head-on_1024x1024.webp', 'alt', 'Front view'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate1100/SG-1100_Rear_Head-on_1024x1024.webp', 'alt', 'Back view'),
    JSON_OBJECT('id', '4', 'url', '/assets/img/store/netgate1100/SG-1100_RightHead-On_1024x1024.webp', 'alt', 'Side view'),
    JSON_OBJECT('id', '5', 'url', '/assets/img/store/netgate1100/SG-1100_bottom_1024x1024.webp', 'alt', 'Bottom view')
  ),
  key_highlights = JSON_ARRAY(
    'Dual-core ARM Cortex-A53 1.2 GHz CPU',
    '3x 1 GbE Ethernet Ports',
    '1 GB DDR4 RAM',
    'Up to 927 Mbps routing throughput',
    'Fanless, silent operation'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support (24x7 zero-to-ping)',
    'pfSense+ Software License',
    'Automatic Configuration Backup Service'
  ),
  tab_overview = '<p>With a compact form factor, low power draw, and silent operation it can run completely unnoticed on a desktop or wall. Featuring a Dual-core ARM Cortex-A53 1.2 GHz CPU, (3) 1 GbE ports, and 1 GB of DDR4 RAM, the Netgate 1100 enables up to 927 Mbps routing and 607 Mbps of firewall throughput.</p><p>The Netgate 1100 delivers a substantial improvement in pfSense Plus firewall performance relative to its highly popular predecessor, the SG-1000.</p><h5>Best For:</h5><ul><li>Consumers & Home Users</li><li>Remote Workers</li><li>Small to Medium-Sized Business Networks</li><li>Small to Medium-Sized Branch Office</li><li>Managed Service Providers (MSP/MSSP) On-Premises Appliance</li></ul>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>SoC</th><td>Marvell Armada 3720LP (88F3720) dual core ARM Cortex A53 processor @ 1.2GHz</td></tr><tr><th>System Memory</th><td>1 GB DDR4 RAM on board</td></tr><tr><th>Storage</th><td>10.6 GB eMMC storage</td></tr><tr><th>Network Interfaces</th><td>1x Marvell 88E6141 networking switch<br/>3x GbE Ethernet (WAN/LAN/OPT)</td></tr><tr><th>USB</th><td>1x USB 3.0<br/>1x USB 2.0<br/>1x Micro USB port (console)</td></tr><tr><th>Power</th><td>12V 2A DC 5.5mm x 2.1mm x 10mm jack, center pin positive</td></tr><tr><th>Power Consumption</th><td>3.48W (idle)</td></tr><tr><th>Operating Temperature</th><td>0°C (32°F) to 45°C (113°F)</td></tr><tr><th>Enclosure</th><td>Plastic 110 x 84.6 x 31.75 mm (4.33" x 3.33" x 1.25")</td></tr><tr><th>Certifications</th><td>CE, FCC, RoHS, UKCA, TAA</td></tr></tbody></table>',
  tab_performance = '<h4>Performance Metrics</h4><p class="text-muted">Netgate 1100 performance tests conducted with pfSense Plus software version 22.01</p><div class="row"><div class="col-md-4"><strong>L3 Forwarding</strong><br/>IPERF3: 927 Mbps<br/>IMIX: 472 Mbps</div><div class="col-md-4"><strong>Firewall (10k ACLs)</strong><br/>IPERF3: 607 Mbps<br/>IMIX: 191 Mbps</div><div class="col-md-4"><strong>IPsec VPN (AES-CBC-128)</strong><br/>IPERF3: 247 Mbps<br/>IMIX: 90 Mbps</div></div><p>Maximum Active Connections: <strong>1 million</strong></p>',
  tab_features = '<p>pfSense Plus Software Features include routing, firewall & security, VPN (IPsec, OpenVPN, WireGuard), user authentication, configuration management, and monitoring & reporting capabilities.</p>',
  tab_support = '<h5>Support Information</h5><ul><li>TAC Lite included with purchase</li><li>24x7x365 zero-to-ping support</li><li>Access to pfSense+ online documentation</li><li>TAC Pro and Enterprise SLA available</li></ul><h5>Warranty Information</h5><ul><li>1 year manufacturer hardware warranty</li><li>Extended warranties available</li><li>Standard 30 day return policy</li></ul>'
WHERE slug = 'netgate-1100';

-- Insert variants for Netgate 1100
DELETE FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'netgate-1100');
INSERT INTO product_variants (product_id, option1_name, option1_value, sku, price, stock_quantity)
SELECT id, 'Power Cord', 'USA (IEC Type B)', 'NETGATE-1100-PWR-USA', 0.00, -1 FROM products WHERE slug = 'netgate-1100'
UNION ALL
SELECT id, 'Power Cord', 'EURO (IEC Type E/F)', 'NETGATE-1100-PWR-EURO', 0.00, -1 FROM products WHERE slug = 'netgate-1100'
UNION ALL
SELECT id, 'Power Cord', 'UK (IEC Type G)', 'NETGATE-1100-PWR-UK', 0.00, -1 FROM products WHERE slug = 'netgate-1100'
UNION ALL
SELECT id, 'Power Cord', 'None', 'NETGATE-1100-PWR-NONE', 0.00, -1 FROM products WHERE slug = 'netgate-1100';

-- ================================================
-- PRODUCT 2: Netgate 2100 BASE pfSense+ Security Gateway
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate2100/SG-2100frontAngled_1024x1024.webp', 'alt', 'Front angled view'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate2100/SG-2100front_720x.webp', 'alt', 'Front view'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate2100/Rogue2rearheadon_1024x1024.webp', 'alt', 'Rear view')
  ),
  key_highlights = JSON_ARRAY(
    'Quad-core ARM Cortex-A57 1.7 GHz CPU',
    '4x 1 GbE Ethernet Ports',
    '4 GB DDR4 RAM',
    '8 GB eMMC storage (BASE)',
    'Up to 1.97 Gbps routing throughput'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support (24x7)',
    'pfSense+ Software License',
    'Automatic Configuration Backup'
  ),
  tab_overview = '<p>Pound-for-pound, the Netgate 2100 security gateway appliance with pfSense Plus software delivers unbeatable performance and flexibility in its class. BASE model features 8GB eMMC storage.</p><h5>Best For:</h5><ul><li>Small to Medium-Sized Business</li><li>Branch Offices</li><li>Remote Sites</li><li>MSP/MSSP Deployments</li></ul>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>SoC</th><td>Marvell ARMADA 8040 (88F8040) Quad core ARM Cortex-A72 @ 1.7 GHz</td></tr><tr><th>System Memory</th><td>4 GB DDR4 RAM</td></tr><tr><th>Storage</th><td>8 GB eMMC (BASE model)</td></tr><tr><th>Network Interfaces</th><td>4x GbE RJ-45 Ethernet ports</td></tr><tr><th>USB</th><td>1x USB 3.0</td></tr><tr><th>Console</th><td>1x RJ45 Serial Console</td></tr><tr><th>Power</th><td>12V DC 2.5A</td></tr><tr><th>Operating Temperature</th><td>0°C to 40°C</td></tr><tr><th>Enclosure</th><td>Desktop form factor</td></tr></tbody></table>',
  tab_performance = '<p>Performance tests with pfSense Plus software</p><div class="row"><div class="col-md-4"><strong>L3 Forwarding</strong><br/>1.97 Gbps</div><div class="col-md-4"><strong>Firewall</strong><br/>1.28 Gbps</div><div class="col-md-4"><strong>IPsec VPN</strong><br/>421 Mbps</div></div>',
  tab_features = '<p>Full pfSense Plus software feature set including advanced routing, stateful firewall, VPN, and more.</p>',
  tab_support = '<p>Includes 1 year warranty and TAC Lite support. Contact enquiry@kflegacyresources.com</p>'
WHERE slug = 'netgate-2100-base';

-- Insert variants for Netgate 2100 BASE
DELETE FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'netgate-2100-base');
INSERT INTO product_variants (product_id, option1_name, option1_value, sku, price, stock_quantity)
SELECT id, 'Power Cord', 'USA (IEC Type B)', 'NETGATE-2100-BASE-PWR-USA', 0.00, -1 FROM products WHERE slug = 'netgate-2100-base'
UNION ALL
SELECT id, 'Power Cord', 'EURO (IEC Type E/F)', 'NETGATE-2100-BASE-PWR-EURO', 0.00, -1 FROM products WHERE slug = 'netgate-2100-base'
UNION ALL
SELECT id, 'Power Cord', 'UK (IEC Type G)', 'NETGATE-2100-BASE-PWR-UK', 0.00, -1 FROM products WHERE slug = 'netgate-2100-base';

-- ================================================
-- PRODUCT 3: Netgate 2100 MAX pfSense+ Security Gateway
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate2100/SG-2100frontAngled_1024x1024.webp', 'alt', 'Front angled view'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate2100/SG-2100front_720x.webp', 'alt', 'Front view'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate2100/Rogue2rearheadon_1024x1024.webp', 'alt', 'Rear view')
  ),
  key_highlights = JSON_ARRAY(
    'Quad-core ARM Cortex-A57 1.7 GHz CPU',
    '4x 1 GbE Ethernet Ports',
    '4 GB DDR4 RAM',
    '64 GB eMMC storage (MAX)',
    'Up to 1.97 Gbps routing throughput'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support (24x7)',
    'pfSense+ Software License',
    'Automatic Configuration Backup'
  ),
  tab_overview = '<p>Enhanced MAX version with 64GB eMMC storage for advanced logging and package caching. Same powerful quad-core ARM processor as BASE model.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>Storage</th><td>64 GB eMMC (MAX model)</td></tr><tr><th>Other specs</th><td>Same as 2100 BASE</td></tr></tbody></table>',
  tab_performance = '<p>Same performance as 2100 BASE model</p>',
  tab_features = '<p>Full pfSense Plus software capabilities</p>',
  tab_support = '<p>Includes 1 year warranty and TAC Lite support</p>'
WHERE slug = 'netgate-2100-max';

-- ================================================
-- PRODUCT 4: Netgate 4200 MAX pfSense+ Security Gateway
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate4200/4200_front_corner_angle.jpg', 'alt', 'Front corner angle'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate4200/4200_front_head-on.jpg', 'alt', 'Front head-on'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate4200/4200_rear_angle.jpg', 'alt', 'Rear angle')
  ),
  key_highlights = JSON_ARRAY(
    'Intel Atom C3558 Quad-Core @ 2.2 GHz',
    '4x 2.5 GbE RJ-45 Ports',
    '8 GB DDR4 RAM',
    '128 GB M.2 SSD',
    '8.75 Gbps routing performance',
    'Fanless passive cooling'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support (24x7)',
    'pfSense+ Software License',
    'Automatic Configuration Backup'
  ),
  tab_overview = '<p>Most versatile security gateway - 8.75 Gbps routing, 4x 2.5GbE ports, silent operation. Perfect for SMB and prosumer deployments.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>CPU</th><td>Intel Atom C3558 Quad-Core @ 2.2 GHz with AES-NI</td></tr><tr><th>RAM</th><td>8 GB DDR4</td></tr><tr><th>Storage</th><td>128 GB M.2 SSD</td></tr><tr><th>Network</th><td>4x 2.5 GbE RJ-45</td></tr><tr><th>Cooling</th><td>Passive (fanless)</td></tr></tbody></table>',
  tab_performance = '<p><strong>L3 Forwarding:</strong> 8.75 Gbps<br/><strong>Firewall:</strong> 4.60 Gbps<br/><strong>IPsec VPN:</strong> 1.10 Gbps</p>',
  tab_features = '<p>Full pfSense Plus feature set with hardware acceleration</p>',
  tab_support = '<p>Professional support available</p>'
WHERE slug = 'netgate-4200-max';

-- Insert variants for 4200
DELETE FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'netgate-4200-max');
INSERT INTO product_variants (product_id, option1_name, option1_value, sku, price, stock_quantity)
SELECT id, 'Mount Kit', 'None', 'NETGATE-4200-MNT-NONE', 0.00, -1 FROM products WHERE slug = 'netgate-4200-max'
UNION ALL
SELECT id, 'Mount Kit', 'Wall Mount Kit', 'NETGATE-4200-MNT-WALL', 0.00, -1 FROM products WHERE slug = 'netgate-4200-max'
UNION ALL
SELECT id, 'Mount Kit', 'Rack Mount Installed', 'NETGATE-4200-MNT-RACK', 0.00, -1 FROM products WHERE slug = 'netgate-4200-max';

-- ================================================
-- PRODUCT 5: Netgate 6100 BASE pfSense+ Security Gateway
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate6100/6100_front_angle.jpg', 'alt', 'Front angle'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate6100/6100_front_head-on.jpg', 'alt', 'Front head-on'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate6100/6100_left.jpg', 'alt', 'Left side'),
    JSON_OBJECT('id', '4', 'url', '/assets/img/store/netgate6100/6100_right.jpg', 'alt', 'Right side'),
    JSON_OBJECT('id', '5', 'url', '/assets/img/store/netgate6100/6100_rear_head-on.jpg', 'alt', 'Rear head-on'),
    JSON_OBJECT('id', '6', 'url', '/assets/img/store/netgate6100/6100_rear_angle.jpg', 'alt', 'Rear angle')
  ),
  key_highlights = JSON_ARRAY(
    '18.50 Gbps Router Performance',
    '9.93 Gbps Firewall Throughput',
    '1.77 Gbps IPsec VPN',
    'Intel C3558 4-core @ 2.2GHz',
    '8 GB DDR4 RAM',
    '16 GB eMMC Storage (BASE)',
    '2x 10 GbE SFP+',
    '4x 2.5 GbE Ports',
    'Passive Cooling'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support (24x7)',
    'pfSense+ Software License',
    'Automatic Configuration Backup'
  ),
  tab_overview = '<p>High-performance security gateway BASE model - 18.5 Gbps routing, 8 independent ports. Perfect for growing businesses and high-bandwidth applications.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>CPU</th><td>Intel Atom C3558 Quad-Core @ 2.2 GHz with QuickAssist (QAT) and AES-NI</td></tr><tr><th>RAM</th><td>8 GB DDR4</td></tr><tr><th>Storage</th><td>16 GB eMMC (BASE)</td></tr><tr><th>Network</th><td>2x 10 GbE SFP+<br/>2x 1 GbE Combo (RJ45/SFP)<br/>4x 2.5 GbE RJ-45</td></tr><tr><th>Console</th><td>RJ45 Serial</td></tr><tr><th>USB</th><td>2x USB 3.0</td></tr><tr><th>Cooling</th><td>Passive (fanless)</td></tr></tbody></table>',
  tab_performance = '<p><strong>L3 Forwarding:</strong> 18.50 Gbps<br/><strong>Firewall:</strong> 9.93 Gbps<br/><strong>IPsec VPN:</strong> 1.77 Gbps<br/>Max Connections: 4 million</p>',
  tab_features = '<p>pfSense Plus with QuickAssist hardware acceleration</p>',
  tab_support = '<p>Enterprise-grade support available</p>'
WHERE slug = 'netgate-6100-base';

-- ================================================
-- PRODUCT 7: Netgate 8200 MAX pfSense+ Security Gateway
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate8200/8200_front_angle.jpg', 'alt', 'Front angle'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate8200/8200_front_head-on.jpg', 'alt', 'Front head-on'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate8200/8200_rear_angle.jpg', 'alt', 'Rear angle')
  ),
  key_highlights = JSON_ARRAY(
    'Intel 8-core Xeon D-1540 @ 2.0 GHz',
    '16 GB DDR4 ECC RAM',
    '128 GB NVMe M.2 SSD',
    '1U rackmount form factor',
    '8x 1 GbE RJ-45 ports',
    'IPMI remote management'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support',
    'pfSense+ Software License',
    'Automatic Configuration Backup'
  ),
  tab_overview = '<p>Enterprise-grade 1U rackmount security gateway with Intel 8-core processor and ECC memory. Built for mission-critical deployments.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>CPU</th><td>Intel Xeon D-1540 8-core @ 2.0 GHz</td></tr><tr><th>RAM</th><td>16 GB DDR4 ECC</td></tr><tr><th>Storage</th><td>128 GB NVMe M.2</td></tr><tr><th>Form Factor</th><td>1U Rackmount</td></tr></tbody></table>',
  tab_performance = '<p>High-performance enterprise routing and VPN capabilities</p>',
  tab_features = '<p>Full enterprise feature set with IPMI</p>',
  tab_support = '<p>Enterprise SLA available</p>'
WHERE slug = 'netgate-8200-max';

-- ================================================
-- PRODUCT 8: Netgate 8300 BASE pfSense+ Security Gateway
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate8300/8300_front_angle.jpg', 'alt', 'Front angle'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate8300/8300_front_head-on.jpg', 'alt', 'Front head-on'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate8300/8300_rear.jpg', 'alt', 'Rear view')
  ),
  key_highlights = JSON_ARRAY(
    'Intel 8-core processor',
    '32 GB DDR4 ECC RAM (BASE)',
    '64 GB NVMe SSD (BASE)',
    '1U rackmount',
    '25/100GbE expansion capable'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support',
    'pfSense+ Software License'
  ),
  tab_overview = '<p>Top-tier 1U rackmount with 25/100GbE expansion capability. Built for high-throughput enterprise and data center deployments.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>CPU</th><td>Intel 8-core processor</td></tr><tr><th>RAM</th><td>32 GB DDR4 ECC (BASE)</td></tr><tr><th>Storage</th><td>64 GB NVMe (BASE)</td></tr></tbody></table>',
  tab_performance = '<p>Extreme performance for demanding environments</p>',
  tab_features = '<p>25/100GbE expansion slots available</p>',
  tab_support = '<p>Enterprise support packages</p>'
WHERE slug = 'netgate-8300-base';

-- ================================================
-- PRODUCT 9: Netgate 8300 MAX pfSense+ Security Gateway
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate8300/8300_front_head-on.jpg', 'alt', 'Front head-on'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate8300/8300_front_angle.jpg', 'alt', 'Front angle'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate8300/8300_rear.jpg', 'alt', 'Rear view')
  ),
  key_highlights = JSON_ARRAY(
    'Intel 8-core processor',
    '32 GB DDR4 ECC RAM',
    '128 GB NVMe SSD (MAX)',
    '1U rackmount',
    '25/100GbE expansion'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support',
    'pfSense+ Software License'
  ),
  tab_overview = '<p>Maximum performance 8300 with 128GB NVMe and full expansion options for the most demanding deployments.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>Storage</th><td>128 GB NVMe (MAX)</td></tr></tbody></table>',
  tab_performance = '<p>Peak performance configuration</p>',
  tab_features = '<p>Full expansion capability</p>',
  tab_support = '<p>Premier support</p>'
WHERE slug = 'netgate-8300-max';

-- ================================================
-- PRODUCT 10: Netgate 8300 TAA pfSense+ Security Gateway
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate8300/8300_front_top_angle.jpg', 'alt', 'Front top angle'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate8300/8300_front_head-on.jpg', 'alt', 'Front head-on'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate8300/8300_rear.jpg', 'alt', 'Rear view')
  ),
  key_highlights = JSON_ARRAY(
    'TAA-compliant components',
    'Intel 8-core processor',
    '32 GB DDR4 ECC RAM',
    '128 GB NVMe SSD',
    'Government & enterprise certified'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support',
    'pfSense+ Software License',
    'TAA Compliance Documentation'
  ),
  tab_overview = '<p>TAA-compliant model for government and enterprise requiring certified, US-sourced components.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>Compliance</th><td>TAA-compliant (Trade Agreements Act)</td></tr><tr><th>Certifications</th><td>Government procurement certified</td></tr></tbody></table>',
  tab_performance = '<p>Enterprise-grade performance with TAA compliance</p>',
  tab_features = '<p>Certified for government use</p>',
  tab_support = '<p>Government support SLA available</p>'
WHERE slug = 'netgate-8300-taa';

-- ================================================
-- PRODUCT 11: Basic Website Profile Company
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/hero-img.png', 'alt', 'Website preview')
  ),
  key_highlights = JSON_ARRAY(
    'Professional design',
    'Responsive mobile-friendly layout',
    'Hosting included (1 year)',
    'Domain registration (.com.my)',
    'Basic SEO optimization',
    'Contact form integration'
  ),
  included_items = JSON_ARRAY(
    '1 Year Web Hosting',
    '1 Year Domain (.com.my)',
    'SSL Certificate',
    'Email Setup (5 accounts)',
    '3 Months Free Support',
    'Basic SEO Setup'
  ),
  tab_overview = '<p>Professional company profile website perfect for small businesses. Includes hosting and domain for one complete year.</p><h5>Package Includes:</h5><ul><li>5-7 pages website</li><li>Mobile responsive design</li><li>Contact form</li><li>Google Maps integration</li><li>Social media links</li></ul>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>Pages</th><td>5-7 pages (Home, About, Services, Gallery, Contact, etc.)</td></tr><tr><th>Hosting</th><td>Shared hosting, 5GB storage, unlimited bandwidth</td></tr><tr><th>Domain</th><td>.com.my or .my</td></tr><tr><th>Email</th><td>5 professional email accounts</td></tr><tr><th>Delivery</th><td>2-3 weeks</td></tr></tbody></table>',
  tab_performance = '<p>Fast loading, optimized for performance and SEO.</p>',
  tab_features = '<p>Content Management System (CMS) option available for easy updates.</p>',
  tab_support = '<p>3 months free support. Extended support packages available. Contact: enquiry@kflegacyresources.com</p>'
WHERE slug = 'basic-website';

-- ================================================
-- PRODUCT 12: E-Commerce Website
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/hero-img.png', 'alt', 'E-commerce preview')
  ),
  key_highlights = JSON_ARRAY(
    'Full online store functionality',
    'Product catalog management',
    'Shopping cart & checkout',
    'Payment gateway integration',
    'Order management system',
    'Hosting & domain included (1 year)'
  ),
  included_items = JSON_ARRAY(
    '1 Year Web Hosting',
    '1 Year Domain',
    'SSL Certificate',
    'Payment Gateway Setup',
    'Up to 50 Products',
    '6 Months Free Support'
  ),
  tab_overview = '<p>Complete e-commerce solution for selling products online. Includes inventory management, payment processing, and customer management.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>Products</th><td>Up to 50 products included</td></tr><tr><th>Payment Gateways</th><td>iPay88, Stripe, or similar</td></tr><tr><th>Features</th><td>Cart, checkout, order tracking, customer accounts</td></tr><tr><th>Delivery</th><td>4-6 weeks</td></tr></tbody></table>',
  tab_performance = '<p>Optimized for conversion and sales.</p>',
  tab_features = '<p>Inventory management, automated invoicing, shipping integration available.</p>',
  tab_support = '<p>6 months free support included.</p>'
WHERE slug = 'ecommerce-website';

-- ================================================
-- PRODUCT 13: Web Based System
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/hero-img.png', 'alt', 'Custom system preview')
  ),
  key_highlights = JSON_ARRAY(
    'Custom business logic',
    'Database design & implementation',
    'User role management',
    'Reporting & analytics',
    'API integration',
    'Hosting & domain included'
  ),
  included_items = JSON_ARRAY(
    '1 Year Web Hosting',
    '1 Year Domain',
    'SSL Certificate',
    'Database Setup',
    'User Training',
    '1 Year Free Support'
  ),
  tab_overview = '<p>Custom web-based system tailored to your business needs. From CRM to inventory management, HR systems, and more.</p><p><strong>Price range:</strong> RM 5,000 - RM 35,000 depending on requirements.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>Development</th><td>Custom PHP/Laravel or Node.js</td></tr><tr><th>Database</th><td>MySQL or PostgreSQL</td></tr><tr><th>Features</th><td>Fully customized to requirements</td></tr><tr><th>Delivery</th><td>2-4 months depending on complexity</td></tr></tbody></table>',
  tab_performance = '<p>Scalable architecture for growing businesses.</p>',
  tab_features = '<p>Multi-user access, role-based permissions, reporting dashboards, data export/import.</p>',
  tab_support = '<p>1 year free support and maintenance. Contact for detailed quotation.</p>'
WHERE slug = 'web-based-system';

-- ================================================
-- PRODUCT 14: Web Based System + Android
-- ================================================
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/hero-img.png', 'alt', 'Web and mobile system')
  ),
  key_highlights = JSON_ARRAY(
    'Web application',
    'Native Android app',
    'Real-time synchronization',
    'Offline capability',
    'Push notifications',
    'API backend'
  ),
  included_items = JSON_ARRAY(
    '1 Year Web Hosting',
    '1 Year Domain',
    'SSL Certificate',
    'Android App Development',
    'Play Store Publishing',
    '1 Year Free Support'
  ),
  tab_overview = '<p>Full-stack web and Android app solution. Perfect for businesses needing both web portal and mobile app for field operations.</p><p><strong>Price range:</strong> RM 5,000 - RM 55,000 depending on complexity.</p>',
  tab_specifications = '<table class="table table-striped"><tbody><tr><th>Web Platform</th><td>Laravel/Node.js with responsive design</td></tr><tr><th>Mobile App</th><td>Native Android (Java/Kotlin)</td></tr><tr><th>Features</th><td>Real-time sync, offline mode, push notifications</td></tr><tr><th>Delivery</th><td>3-6 months</td></tr></tbody></table>',
  tab_performance = '<p>Optimized for performance on web and mobile.</p>',
  tab_features = '<p>API-driven architecture, cloud synchronization, location services, camera integration available.</p>',
  tab_support = '<p>1 year comprehensive support for both web and mobile. Play Store maintenance included.</p>'
WHERE slug = 'web-based-system-android';

-- ================================================
-- SUMMARY
-- ================================================
SELECT 'Migration complete! All 14 products updated with:' as Status;
SELECT '- Gallery Images' as Feature UNION ALL
SELECT '- Key Highlights' UNION ALL
SELECT '- Included Items' UNION ALL
SELECT '- Tab Content (Overview, Specs, Performance, Features, Support)' UNION ALL
SELECT '- Product Variants (Power Cord / Mount Kit options)';

