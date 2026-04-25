-- ================================================
-- FIX ALL PRODUCTS WITH COMPLETE & ACCURATE DATA
-- ================================================
-- This migration corrects ALL product data extracted from actual product detail pages
-- Includes: Complete gallery images, accurate highlights, full specifications, etc.
-- ================================================

-- ================================================
-- PRODUCT 1: Netgate 1100 pfSense+ Security Gateway
-- ================================================
-- Source: src/app/(site)/store/netgate-1100/page.tsx
-- Images: 5 images
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
  )
WHERE slug = 'netgate-1100';

-- ================================================
-- PRODUCT 7: Netgate 8200 MAX pfSense+ Security Gateway
-- ================================================
-- Source: src/app/(site)/store/netgate-8200-max/page.tsx
-- Images: 6 images (NOT 3!)
UPDATE products SET
  gallery_images = JSON_ARRAY(
    JSON_OBJECT('id', '1', 'url', '/assets/img/store/netgate8200/8200_front_angle.jpg', 'alt', 'Front angle'),
    JSON_OBJECT('id', '2', 'url', '/assets/img/store/netgate8200/8200_front.jpg', 'alt', 'Front view'),
    JSON_OBJECT('id', '3', 'url', '/assets/img/store/netgate8200/8200_rear_angle.jpg', 'alt', 'Rear angle'),
    JSON_OBJECT('id', '4', 'url', '/assets/img/store/netgate8200/8200_top.jpg', 'alt', 'Top view'),
    JSON_OBJECT('id', '5', 'url', '/assets/img/store/netgate8200/8200_bottom.jpg', 'alt', 'Bottom view'),
    JSON_OBJECT('id', '6', 'url', '/assets/img/store/netgate8200/8200_ha_front.jpg', 'alt', 'HA configuration')
  ),
  key_highlights = JSON_ARRAY(
    '18.50 Gbps Router Performance',
    '9.93 Gbps Firewall',
    '1.77 Gbps IPsec VPN',
    'Intel C3758 8-core @ 2.2GHz',
    '16 GB DDR4 RAM',
    '128 GB NVMe SSD',
    '2x 10 GbE SFP+',
    'QuickAssist Technology',
    '4M Connections'
  ),
  included_items = JSON_ARRAY(
    '1 Year Hardware Warranty',
    'TAC Lite Support (24x7)',
    'pfSense+ Software License',
    'Automatic Configuration Backup'
  ),
  tab_overview = '<h4>Product Overview</h4><p>The Netgate® 8200 MAX is an enterprise-grade security gateway featuring an Intel C3758 8-core processor @ 2.2 GHz with QuickAssist Technology (QAT) and 16 GB DDR4 RAM. The MAX version includes 128 GB NVMe SSD for extensive logging and package storage.</p><p>Delivers exceptional <strong>18.50 Gbps routing performance</strong> with 8 independent network ports. Perfect for medium to large enterprises requiring high-throughput firewall, VPN, and advanced security features.</p><h5>Best For:</h5><ul><li>Medium to Large Enterprises</li><li>Branch Office deployments</li><li>MSP/MSSP Service Providers</li><li>High-availability environments</li><li>Multi-WAN configurations</li><li>Advanced IDS/IPS deployments</li></ul>',
  tab_specifications = '<h4>Technical Specifications</h4><table class="table table-striped table-hover table-sm"><tbody><tr><th style="width: 30%">CPU</th><td>Intel Atom C3758 8-Core @ 2.2 GHz with QuickAssist (QAT) and AES-NI</td></tr><tr><th>System Memory</th><td>16 GB DDR4 RAM</td></tr><tr><th>Storage</th><td>128 GB NVMe M.2 SSD</td></tr><tr><th>Network Interfaces</th><td>(2) 10 GbE SFP+<br />(2) 1 GbE Combo (RJ45/SFP)<br />(4) 2.5 GbE RJ-45</td></tr><tr><th>Console Port</th><td>RJ45 Serial Console</td></tr><tr><th>USB Ports</th><td>2x USB 3.0 Type-A</td></tr><tr><th>Power</th><td>12V DC External Power Supply</td></tr><tr><th>Cooling</th><td>Passive (fanless)</td></tr><tr><th>Certifications</th><td>CE, FCC, RoHS</td></tr></tbody></table>',
  tab_performance = '<h4>Performance Metrics</h4><div class="row g-3"><div class="col-md-4"><div class="card text-center"><div class="card-body"><i class="bi bi-hdd-network display-5 text-primary"></i><h6>L3 Forwarding</h6><hr /><div><small>IPERF3</small><br /><span class="h5 text-primary">18.50 Gbps</span></div></div></div></div><div class="col-md-4"><div class="card text-center"><div class="card-body"><i class="bi bi-shield-lock display-5 text-primary"></i><h6>Firewall</h6><hr /><div><small>IPERF3</small><br /><span class="h5 text-primary">9.93 Gbps</span></div></div></div></div><div class="col-md-4"><div class="card text-center"><div class="card-body"><i class="bi bi-lock display-5 text-primary"></i><h6>IPsec VPN (w/QAT)</h6><hr /><div><small>IPERF3</small><br /><span class="h5 text-primary">1.77 Gbps</span></div></div></div></div></div><div class="alert alert-info mt-4"><h6><i class="bi bi-info-circle me-2"></i>Performance Note</h6><p class="mb-0 small">Maximum Active Connections: <strong>4,000,000</strong>. QuickAssist Technology provides hardware-accelerated encryption.</p></div>',
  tab_features = '<h4>pfSense Plus Software Features</h4><div class="row g-3"><div class="col-md-6"><div class="card"><div class="card-header bg-primary text-white"><h6><i class="bi bi-router me-2"></i>Router</h6></div><div class="card-body"><ul class="list-unstyled mb-0 small"><li><i class="bi bi-check text-success me-2"></i>Multi-WAN with load balancing</li><li><i class="bi bi-check text-success me-2"></i>Policy-based routing</li><li><i class="bi bi-check text-success me-2"></i>High Availability clustering</li></ul></div></div></div><div class="col-md-6"><div class="card"><div class="card-header bg-primary text-white"><h6><i class="bi bi-shield-fill-check me-2"></i>Security</h6></div><div class="card-body"><ul class="list-unstyled mb-0 small"><li><i class="bi bi-check text-success me-2"></i>IDS/IPS with Snort/Suricata</li><li><i class="bi bi-check text-success me-2"></i>Advanced firewall rules</li><li><i class="bi bi-check text-success me-2"></i>Geo-blocking</li></ul></div></div></div></div>',
  tab_support = '<h5>Support Information</h5><ul><li>24x7x365 Technical Support</li><li>TAC Lite included</li><li>Contact: enquiry@kflegacyresources.com</li></ul><h5>Warranty Information</h5><ul><li>1 year hardware warranty</li><li>30 day return policy</li></ul>'
WHERE slug = 'netgate-8200-max';

-- ================================================
-- TO BE CONTINUED: Need to extract complete data for remaining 12 products
-- ================================================

