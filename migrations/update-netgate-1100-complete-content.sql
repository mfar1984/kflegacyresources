-- ============================================================================
-- Migration: Update Netgate 1100 with COMPLETE Content
-- Product ID: 6
-- Description: Extract full HTML content from public page for all tabs
-- Date: 2025-10-24
-- ============================================================================

UPDATE products SET

-- TAB 1: OVERVIEW (Complete HTML from public page)
tab_overview = '<div class="row">
  <div class="col-lg-8">
    <h4 class="mb-3" style="font-size: 1.25rem">Product Overview</h4>
    <p>With a compact form factor, low power draw, and silent operation it can run completely unnoticed on a desktop or wall. Featuring a Dual-core ARM Cortex-A53 1.2 GHz CPU, (3) 1 GbE ports, and 1 GB of DDR4 RAM, the Netgate 1100 enables up to 927 Mbps routing and 607 Mbps of firewall throughput.</p>
    <p>The Netgate 1100 delivers a substantial improvement in pfSense Plus firewall performance relative to its highly popular predecessor, the SG-1000. Consumer and business customers will quickly appreciate this product packs a serious punch with pfSense Plus software, world-class price-performance, elegant packaging, and an unbeatable low price.</p>
    
    <h5 class="mt-4 mb-2" style="font-size: 1.1rem">Best For:</h5>
    <ul class="small">
      <li>Consumers & Home Users</li>
      <li>Remote Workers</li>
      <li>Small to Medium-Sized Business Networks</li>
      <li>Small to Medium-Sized Branch Office</li>
      <li>Managed Service Providers (MSP/MSSP) On-Premises Appliance</li>
    </ul>
    
    <h5 class="mt-4 mb-2" style="font-size: 1.1rem">Key Benefits:</h5>
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-shield-check text-primary me-2"></i>Enhanced Security</h5>
            <p class="card-text small">Secured with pfSense Plus software. First product equipped with Microchip® CryptoAuthentication Device.</p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-lightning-charge text-primary me-2"></i>Price-Performance Killer</h5>
            <p class="card-text small">5x packet processing performance gain vs. the Netgate SG-1000. 64-bit ARMv8 networking platform.</p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-box-seam text-primary me-2"></i>Modern Packaging</h5>
            <p class="card-text small">Cost-efficient, low power. Sleek, compact, and attractive case. Quiet operation with fanless design.</p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-wallet2 text-primary me-2"></i>Low Total Cost of Ownership</h5>
            <p class="card-text small">No artificial limits or add-ons required. No additional usage or feature-based pricing.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-4">
    <div class="card bg-primary text-white">
      <div class="card-body">
        <h5 class="card-title">Why Choose KF Legacy?</h5>
        <ul class="list-unstyled small">
          <li class="mb-2"><i class="bi bi-check2 me-2"></i>Official Netgate Partner</li>
          <li class="mb-2"><i class="bi bi-check2 me-2"></i>pfSense Certified Engineers</li>
          <li class="mb-2"><i class="bi bi-check2 me-2"></i>Local Support (MY/EN)</li>
          <li class="mb-2"><i class="bi bi-check2 me-2"></i>Professional Deployment</li>
          <li class="mb-2"><i class="bi bi-check2 me-2"></i>Competitive Pricing</li>
        </ul>
        <hr class="bg-white">
        <p class="small mb-0"><i class="bi bi-envelope me-2"></i><strong>Contact:</strong><br>enquiry@kflegacyresources.com</p>
      </div>
    </div>
  </div>
</div>',

-- TAB 2: TECHNICAL SPECIFICATIONS (Complete table from public page)
tab_specifications = '<h4 class="mb-3" style="font-size: 1.25rem">Technical Specifications</h4>
<div class="table-responsive">
  <table class="table table-striped table-hover table-sm">
    <tbody style="font-size: 0.9rem">
      <tr>
        <th style="width: 30%">SoC</th>
        <td>Marvell Armada 3720LP (88F3720) dual core ARM Cortex A53 processor @ 1.2GHz</td>
      </tr>
      <tr>
        <th>System Memory</th>
        <td>1 GB DDR4 RAM on board</td>
      </tr>
      <tr>
        <th>Storage</th>
        <td>10.6 GB eMMC storage</td>
      </tr>
      <tr>
        <th>Network Interfaces</th>
        <td>1x Marvell 88E6141 networking switch<br>3x GbE Ethernet (WAN/LAN/OPT)</td>
      </tr>
      <tr>
        <th>USB</th>
        <td>1x USB 3.0<br>1x USB 2.0<br>1x Micro USB port (console)</td>
      </tr>
      <tr>
        <th>Misc</th>
        <td>Reset button, heatsink, 3 Status LED</td>
      </tr>
      <tr>
        <th>Power</th>
        <td>12V 2A DC 5.5mm x 2.1mm x 10mm jack, center pin positive (power over USB not supported)</td>
      </tr>
      <tr>
        <th>Power Consumption</th>
        <td>3.48W (idle)</td>
      </tr>
      <tr>
        <th>Operating Temperature</th>
        <td>0°C (32°F) to 45°C (113°F)</td>
      </tr>
      <tr>
        <th>Enclosure</th>
        <td>Plastic 110 x 84.6 x 31.75 mm (4.33" x 3.33" x 1.25")</td>
      </tr>
      <tr>
        <th>Hardware Warranty</th>
        <td>1 year standard with purchase</td>
      </tr>
      <tr>
        <th>Certifications</th>
        <td>CE, FCC, RoHS, UKCA, TAA</td>
      </tr>
    </tbody>
  </table>
</div>',

-- TAB 3: PERFORMANCE (Complete performance cards from public page)
tab_performance = '<h4 class="mb-3" style="font-size: 1.25rem">Performance Metrics</h4>
<p class="text-muted small">Netgate 1100 performance tests conducted with pfSense Plus software version 22.01</p>

<div class="row g-3">
  <div class="col-md-4">
    <div class="card text-center h-100">
      <div class="card-body p-3">
        <i class="bi bi-hdd-network display-5 text-primary mb-2"></i>
        <h6 class="card-title mb-2" style="font-size: 0.95rem">L3 Forwarding</h6>
        <hr class="my-2">
        <div class="mb-2">
          <small class="d-block text-muted">IPERF3 Traffic</small>
          <span class="h5 text-primary mb-0">927 Mbps</span>
        </div>
        <div>
          <small class="d-block text-muted">IMIX Traffic</small>
          <span class="h5 text-primary mb-0">472 Mbps</span>
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card text-center h-100">
      <div class="card-body p-3">
        <i class="bi bi-shield-lock display-5 text-primary mb-2"></i>
        <h6 class="card-title mb-2" style="font-size: 0.95rem">Firewall (10k ACLs)</h6>
        <hr class="my-2">
        <div class="mb-2">
          <small class="d-block text-muted">IPERF3 Traffic</small>
          <span class="h5 text-primary mb-0">607 Mbps</span>
        </div>
        <div>
          <small class="d-block text-muted">IMIX Traffic</small>
          <span class="h5 text-primary mb-0">191 Mbps</span>
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card text-center h-100">
      <div class="card-body p-3">
        <i class="bi bi-lock display-5 text-primary mb-2"></i>
        <h6 class="card-title mb-1" style="font-size: 0.95rem">IPsec VPN</h6>
        <small class="text-muted d-block mb-2" style="font-size: 0.75rem">(AES-CBC-128 + SHA1)</small>
        <hr class="my-2">
        <div class="mb-2">
          <small class="d-block text-muted">IPERF3 Traffic</small>
          <span class="h5 text-primary mb-0">247 Mbps</span>
        </div>
        <div>
          <small class="d-block text-muted">IMIX Traffic</small>
          <span class="h5 text-primary mb-0">90 Mbps</span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="alert alert-info mt-4">
  <h6><i class="bi bi-info-circle me-2"></i>Performance Note</h6>
  <p class="mb-0 small">Maximum Active Connections: <strong>1 million</strong>. Performance may vary based on configuration, enabled features, and network conditions.</p>
</div>',

-- TAB 4: FEATURES (Complete feature cards from public page)
tab_features = '<h4 class="mb-3" style="font-size: 1.25rem">pfSense Plus Software Features</h4>

<div class="row g-3">
  <div class="col-md-6">
    <div class="card h-100">
      <div class="card-header bg-primary text-white py-2">
        <h6 class="mb-0" style="font-size: 0.95rem"><i class="bi bi-router me-2"></i>Router</h6>
      </div>
      <div class="card-body p-3">
        <ul class="list-unstyled mb-0 small">
          <li><i class="bi bi-check text-success me-2"></i>Policy-based routing</li>
          <li><i class="bi bi-check text-success me-2"></i>Multiple IP addresses per interface</li>
          <li><i class="bi bi-check text-success me-2"></i>Multiple WAN connections (with load balancing and failover)</li>
          <li><i class="bi bi-check text-success me-2"></i>Complex NAT mapping (outbound and inbound)</li>
          <li><i class="bi bi-check text-success me-2"></i>Concurrent IPv4 and IPv6 support</li>
          <li><i class="bi bi-check text-success me-2"></i>Optional multi-node High Availability (HA) clustering</li>
          <li><i class="bi bi-check text-success me-2"></i>Dynamic routing protocol support [w/pkg]</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100">
      <div class="card-header bg-primary text-white py-2">
        <h6 class="mb-0" style="font-size: 0.95rem"><i class="bi bi-shield-fill-check me-2"></i>Firewall & Security</h6>
      </div>
      <div class="card-body p-3">
        <ul class="list-unstyled mb-0 small">
          <li><i class="bi bi-check text-success me-2"></i>Extensive firewall rules</li>
          <li><i class="bi bi-check text-success me-2"></i>Stateful filtering & packet inspection</li>
          <li><i class="bi bi-check text-success me-2"></i>Per-interface configuration</li>
          <li><i class="bi bi-check text-success me-2"></i>Ethernet (layer 2) rule-based packet filtering</li>
          <li><i class="bi bi-check text-success me-2"></i>IP/DNS-based filtering and blacklisting [w/pkg]</li>
          <li><i class="bi bi-check text-success me-2"></i>IDS/IPS with Snort-based packet analyzer [w/pkg]</li>
          <li><i class="bi bi-check text-success me-2"></i>Layer 7 application detection and blocking [w/pkg]</li>
          <li><i class="bi bi-check text-success me-2"></i>Geo/country blocking, IP block lists [w/pkg]</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100">
      <div class="card-header bg-primary text-white py-2">
        <h6 class="mb-0" style="font-size: 0.95rem"><i class="bi bi-key me-2"></i>VPN</h6>
      </div>
      <div class="card-body p-3">
        <ul class="list-unstyled mb-0 small">
          <li><i class="bi bi-check text-success me-2"></i>Site-to-site and remote access VPNs</li>
          <li><i class="bi bi-check text-success me-2"></i>IPsec, OpenVPN, WireGuard®</li>
          <li><i class="bi bi-check text-success me-2"></i>Split tunneling</li>
          <li><i class="bi bi-check text-success me-2"></i>IPsec policy-based and route-based protocol support</li>
          <li><i class="bi bi-check text-success me-2"></i>OpenVPN Data Channel Offload (DCO)</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100">
      <div class="card-header bg-primary text-white py-2">
        <h6 class="mb-0" style="font-size: 0.95rem"><i class="bi bi-person-lock me-2"></i>User Authentication</h6>
      </div>
      <div class="card-body p-3">
        <ul class="list-unstyled mb-0 small">
          <li><i class="bi bi-check text-success me-2"></i>User and group-based privileges</li>
          <li><i class="bi bi-check text-success me-2"></i>LDAP authentication</li>
          <li><i class="bi bi-check text-success me-2"></i>Automatic lockout after repeated attempts</li>
          <li><i class="bi bi-check text-success me-2"></i>Optional key-based SSH access</li>
          <li><i class="bi bi-check text-success me-2"></i>Traffic and bandwidth shaping</li>
          <li><i class="bi bi-check text-success me-2"></i>Captive portal with user data transfer quotas</li>
          <li><i class="bi bi-check text-success me-2"></i>External RADIUS authentication [w/pkg]</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100">
      <div class="card-header bg-primary text-white py-2">
        <h6 class="mb-0" style="font-size: 0.95rem"><i class="bi bi-gear me-2"></i>Configuration</h6>
      </div>
      <div class="card-body p-3">
        <ul class="list-unstyled mb-0 small">
          <li><i class="bi bi-check text-success me-2"></i>Setup wizard for initial configuration</li>
          <li><i class="bi bi-check text-success me-2"></i>Encrypted automatic backup to Netgate server</li>
          <li><i class="bi bi-check text-success me-2"></i>Easy configuration backup/restore</li>
          <li><i class="bi bi-check text-success me-2"></i>Multi-language support</li>
          <li><i class="bi bi-check text-success me-2"></i>Web-based GUI management</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100">
      <div class="card-header bg-primary text-white py-2">
        <h6 class="mb-0" style="font-size: 0.95rem"><i class="bi bi-graph-up me-2"></i>Monitoring & Reporting</h6>
      </div>
      <div class="card-body p-3">
        <ul class="list-unstyled mb-0 small">
          <li><i class="bi bi-check text-success me-2"></i>Customizable dashboard with widgets</li>
          <li><i class="bi bi-check text-success me-2"></i>Local monitoring graphs</li>
          <li><i class="bi bi-check text-success me-2"></i>Remote logging</li>
          <li><i class="bi bi-check text-success me-2"></i>Network usage monitoring [w/pkg]</li>
          <li><i class="bi bi-check text-success me-2"></i>Network diagnostics [w/pkg]</li>
        </ul>
      </div>
    </div>
  </div>
</div>',

-- TAB 5: SUPPORT (Complete support cards from public page)
tab_support = '<h4 class="mb-3" style="font-size: 1.25rem">Support & Warranty Information</h4>

<div class="row g-4">
  <div class="col-md-4">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title"><i class="bi bi-headset text-primary me-2"></i>Support Information</h5>
        <ul class="small">
          <li>TAC Lite included with purchase</li>
          <li>24x7x365 zero-to-ping support</li>
          <li>Access to pfSense+ online documentation</li>
          <li>TAC Pro and Enterprise SLA available</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title"><i class="bi bi-shield-check text-primary me-2"></i>Warranty Information</h5>
        <ul class="small">
          <li>1 year manufacturer''s hardware warranty</li>
          <li>Extended warranties available</li>
          <li>Standard 30 day return policy</li>
          <li>All specifications subject to change</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title"><i class="bi bi-info-circle text-primary me-2"></i>Additional Information</h5>
        <ul class="small">
          <li>Standard build time: 2-3 days after payment</li>
          <li>Not POE compatible</li>
          <li>Does not support mSATA or LTE cards</li>
          <li>Quick Start Guide included</li>
        </ul>
      </div>
    </div>
  </div>
</div>'

WHERE id = 6;

-- ============================================================================
-- Verification Query (run after migration):
-- SELECT id, name, 
--   LENGTH(tab_overview) as overview_len, 
--   LENGTH(tab_specifications) as specs_len,
--   LENGTH(tab_performance) as perf_len,
--   LENGTH(tab_features) as feat_len,
--   LENGTH(tab_support) as supp_len
-- FROM products WHERE id = 6;
-- 
-- Expected Results:
-- - overview_len: ~4800 chars (vs old: 691)
-- - specs_len: ~1900 chars (vs old: 857)
-- - perf_len: ~1900 chars (vs old: 528)
-- - feat_len: ~3800 chars (vs old: 196)
-- - supp_len: ~900 chars (vs old: 368)
-- ============================================================================

