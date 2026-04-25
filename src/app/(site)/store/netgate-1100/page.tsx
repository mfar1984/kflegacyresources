"use client";

import { useState } from "react";
import Link from "next/link";

export default function Netgate1100DetailPage() {
  const [selectedPowerCord, setSelectedPowerCord] = useState("USA (IEC Type B)");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("/assets/img/store/netgate1100/sg-1100_fronttopangle1_80d4b75d-176d-4074-98e3-1b44b83484d2_1024x1024.webp");

  const basePrice = 1; // RM1 placeholder - will update later

  // Product images array
  const productImages = [
    {
      src: "/assets/img/store/netgate1100/sg-1100_fronttopangle1_80d4b75d-176d-4074-98e3-1b44b83484d2_1024x1024.webp",
      alt: "Angle view"
    },
    {
      src: "/assets/img/store/netgate1100/SG-1100_Front_Head-on_1024x1024.webp",
      alt: "Front view"
    },
    {
      src: "/assets/img/store/netgate1100/SG-1100_Rear_Head-on_1024x1024.webp",
      alt: "Back view"
    },
    {
      src: "/assets/img/store/netgate1100/SG-1100_RightHead-On_1024x1024.webp",
      alt: "Side view"
    },
    {
      src: "/assets/img/store/netgate1100/SG-1100_bottom_1024x1024.webp",
      alt: "Bottom view"
    }
  ];

  return (
    <main className="main">
      {/* Breadcrumb */}
      <section className="section py-3 bg-light">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/store">Store</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Netgate 1100 pfSense+ Security Gateway</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Product Overview */}
      <section className="section">
        <div className="container">
          <div className="row gy-4">
            {/* Product Images */}
            <div className="col-lg-5" data-aos="fade-right">
              <div className="product-images">
                <div className="main-image mb-3 bg-light rounded p-4 text-center">
                  <img 
                    src={mainImage} 
                    alt="Netgate 1100 pfSense+ Security Gateway" 
                    className="img-fluid"
                    style={{ maxHeight: "400px", objectFit: "contain" }}
                  />
                </div>
                <div className="row g-2">
                  {productImages.map((image, index) => (
                    <div key={index} className="col-3">
                      <div 
                        className={`bg-light rounded p-2 text-center ${mainImage === image.src ? 'border border-primary border-2' : ''}`}
                        style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                        onClick={() => setMainImage(image.src)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          className="img-fluid" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="col-lg-7" data-aos="fade-left">
              <span className="badge bg-info mb-2">Pre Order</span>
              <h2 className="mb-2" style={{ fontSize: "1.75rem" }}>Netgate 1100 pfSense+ Security Gateway</h2>
              
              <div className="mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="bi bi-star-fill text-warning" style={{ fontSize: "0.9rem" }}></i>
                ))}
              </div>

              <h3 className="text-primary mb-3" style={{ fontSize: "1.5rem" }}>RM {basePrice.toFixed(2)}</h3>

              <p className="mb-3" style={{ fontSize: "0.95rem" }}>
                The Netgate® 1100 security gateway appliance with pfSense® Plus software is the ideal microdevice for the home and small office network.
              </p>

              <div className="mb-3">
                <h6 className="mb-2" style={{ fontSize: "0.95rem", fontWeight: "600" }}>Key Highlights:</h6>
                <ul className="list-unstyled small">
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>Dual-core ARM Cortex-A53 1.2 GHz CPU</li>
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>3x 1 GbE Ethernet Ports</li>
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>1 GB DDR4 RAM</li>
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>Up to 927 Mbps routing throughput</li>
                  <li className="mb-1"><i className="bi bi-check-circle text-success me-2"></i>Fanless, silent operation</li>
                </ul>
              </div>

              {/* Configuration Options */}
              <div className="card mb-3">
                <div className="card-body p-3">
                  <h6 className="card-title mb-3" style={{ fontSize: "0.95rem", fontWeight: "600" }}>Configure Your Device</h6>
                  
                  {/* Power Cord Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold mb-1">
                      <i className="bi bi-plug me-1"></i>Power Cord Type
                    </label>
                    <select 
                      className="form-select form-select-sm" 
                      value={selectedPowerCord}
                      onChange={(e) => setSelectedPowerCord(e.target.value)}
                    >
                      <option value="USA (IEC Type B)">USA (IEC Type B)</option>
                      <option value="EURO (IEC Type E/F)">EURO (IEC Type E/F)</option>
                      <option value="UK (IEC Type G)">UK (IEC Type G)</option>
                      <option value="None">None</option>
                    </select>
                    <small className="text-muted d-block mt-1">Select the power cord type for your region</small>
                  </div>

                  {/* Quantity */}
                  <div className="mb-0">
                    <label className="form-label small fw-semibold mb-1">Quantity</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      min="1" 
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      style={{ maxWidth: "120px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2 mb-3">
                <a href="/request-quotation" className="btn btn-primary">
                  <i className="bi bi-envelope me-2"></i>Request Quotation
                </a>
                <a href="/contact" className="btn btn-outline-primary">
                  <i className="bi bi-telephone me-2"></i>Contact Sales
                </a>
              </div>

              {/* Included with Purchase */}
              <div className="alert alert-success mb-0">
                <h6 className="alert-heading small mb-2"><i className="bi bi-gift me-2"></i>Included with Purchase:</h6>
                <ul className="mb-0" style={{ fontSize: "0.85rem" }}>
                  <li>1 Year Hardware Warranty</li>
                  <li>TAC Lite Support (24x7 zero-to-ping)</li>
                  <li>pfSense+ Software License</li>
                  <li>Automatic Configuration Backup Service</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Description Tabs */}
      <section className="section bg-light">
        <div className="container">
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item">
              <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#overview">Overview</button>
            </li>
            <li className="nav-item">
              <button className="nav-link" data-bs-toggle="tab" data-bs-target="#specs">Technical Specifications</button>
            </li>
            <li className="nav-item">
              <button className="nav-link" data-bs-toggle="tab" data-bs-target="#performance">Performance</button>
            </li>
            <li className="nav-item">
              <button className="nav-link" data-bs-toggle="tab" data-bs-target="#features">Features</button>
            </li>
          </ul>

          <div className="tab-content">
            {/* Overview Tab */}
            <div className="tab-pane fade show active" id="overview">
              <div className="row">
                <div className="col-lg-8">
                  <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Product Overview</h4>
                  <p>
                    With a compact form factor, low power draw, and silent operation it can run completely unnoticed on a desktop or wall. 
                    Featuring a Dual-core ARM Cortex-A53 1.2 GHz CPU, (3) 1 GbE ports, and 1 GB of DDR4 RAM, the Netgate 1100 enables 
                    up to 927 Mbps routing and 607 Mbps of firewall throughput.
                  </p>
                  <p>
                    The Netgate 1100 delivers a substantial improvement in pfSense Plus firewall performance relative to its highly popular 
                    predecessor, the SG-1000. Consumer and business customers will quickly appreciate this product packs a serious punch with 
                    pfSense Plus software, world-class price-performance, elegant packaging, and an unbeatable low price.
                  </p>

                  <h5 className="mt-4 mb-2" style={{ fontSize: "1.1rem" }}>Best For:</h5>
                  <ul className="small">
                    <li>Consumers & Home Users</li>
                    <li>Remote Workers</li>
                    <li>Small to Medium-Sized Business Networks</li>
                    <li>Small to Medium-Sized Branch Office</li>
                    <li>Managed Service Providers (MSP/MSSP) On-Premises Appliance</li>
                  </ul>

                  <h5 className="mt-4 mb-2" style={{ fontSize: "1.1rem" }}>Key Benefits:</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-shield-check text-primary me-2"></i>Enhanced Security
                          </h5>
                          <p className="card-text small">Secured with pfSense Plus software. First product equipped with Microchip® CryptoAuthentication Device.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-lightning-charge text-primary me-2"></i>Price-Performance Killer
                          </h5>
                          <p className="card-text small">5x packet processing performance gain vs. the Netgate SG-1000. 64-bit ARMv8 networking platform.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-box-seam text-primary me-2"></i>Modern Packaging
                          </h5>
                          <p className="card-text small">Cost-efficient, low power. Sleek, compact, and attractive case. Quiet operation with fanless design.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-wallet2 text-primary me-2"></i>Low Total Cost of Ownership
                          </h5>
                          <p className="card-text small">No artificial limits or add-ons required. No additional usage or feature-based pricing.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Why Choose KF Legacy?</h5>
                      <ul className="list-unstyled small">
                        <li className="mb-2"><i className="bi bi-check2 me-2"></i>Official Netgate Partner</li>
                        <li className="mb-2"><i className="bi bi-check2 me-2"></i>pfSense Certified Engineers</li>
                        <li className="mb-2"><i className="bi bi-check2 me-2"></i>Local Support (MY/EN)</li>
                        <li className="mb-2"><i className="bi bi-check2 me-2"></i>Professional Deployment</li>
                        <li className="mb-2"><i className="bi bi-check2 me-2"></i>Competitive Pricing</li>
                      </ul>
                      <hr className="bg-white" />
                      <p className="small mb-0">
                        <i className="bi bi-envelope me-2"></i>
                        <strong>Contact:</strong><br />
                        enquiry@kflegacyresources.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Specifications Tab */}
            <div className="tab-pane fade" id="specs">
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Technical Specifications</h4>
              <div className="table-responsive">
                <table className="table table-striped table-hover table-sm">
                  <tbody style={{ fontSize: "0.9rem" }}>
                    <tr>
                      <th style={{ width: "30%" }}>SoC</th>
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
                      <td>
                        1x Marvell 88E6141 networking switch<br />
                        3x GbE Ethernet (WAN/LAN/OPT)
                      </td>
                    </tr>
                    <tr>
                      <th>USB</th>
                      <td>
                        1x USB 3.0<br />
                        1x USB 2.0<br />
                        1x Micro USB port (console)
                      </td>
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
                      <td>Plastic 110 x 84.6 x 31.75 mm (4.33&quot; x 3.33&quot; x 1.25&quot;)</td>
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
              </div>
            </div>

            {/* Performance Tab */}
            <div className="tab-pane fade" id="performance">
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Performance Metrics</h4>
              <p className="text-muted small">Netgate 1100 performance tests conducted with pfSense Plus software version 22.01</p>
              
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-hdd-network display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-2" style={{ fontSize: "0.95rem" }}>L3 Forwarding</h6>
                      <hr className="my-2" />
                      <div className="mb-2">
                        <small className="d-block text-muted">IPERF3 Traffic</small>
                        <span className="h5 text-primary mb-0">927 Mbps</span>
                      </div>
                      <div>
                        <small className="d-block text-muted">IMIX Traffic</small>
                        <span className="h5 text-primary mb-0">472 Mbps</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-shield-lock display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-2" style={{ fontSize: "0.95rem" }}>Firewall (10k ACLs)</h6>
                      <hr className="my-2" />
                      <div className="mb-2">
                        <small className="d-block text-muted">IPERF3 Traffic</small>
                        <span className="h5 text-primary mb-0">607 Mbps</span>
                      </div>
                      <div>
                        <small className="d-block text-muted">IMIX Traffic</small>
                        <span className="h5 text-primary mb-0">191 Mbps</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-lock display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-1" style={{ fontSize: "0.95rem" }}>IPsec VPN</h6>
                      <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>(AES-CBC-128 + SHA1)</small>
                      <hr className="my-2" />
                      <div className="mb-2">
                        <small className="d-block text-muted">IPERF3 Traffic</small>
                        <span className="h5 text-primary mb-0">247 Mbps</span>
                      </div>
                      <div>
                        <small className="d-block text-muted">IMIX Traffic</small>
                        <span className="h5 text-primary mb-0">90 Mbps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info mt-4">
                <h6><i className="bi bi-info-circle me-2"></i>Performance Note</h6>
                <p className="mb-0 small">
                  Maximum Active Connections: <strong>1 million</strong>. Performance may vary based on configuration, 
                  enabled features, and network conditions.
                </p>
              </div>
            </div>

            {/* Features Tab */}
            <div className="tab-pane fade" id="features">
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>pfSense Plus Software Features</h4>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2">
                      <h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-router me-2"></i>Router</h6>
                    </div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>Policy-based routing</li>
                        <li><i className="bi bi-check text-success me-2"></i>Multiple IP addresses per interface</li>
                        <li><i className="bi bi-check text-success me-2"></i>Multiple WAN connections (with load balancing and failover)</li>
                        <li><i className="bi bi-check text-success me-2"></i>Complex NAT mapping (outbound and inbound)</li>
                        <li><i className="bi bi-check text-success me-2"></i>Concurrent IPv4 and IPv6 support</li>
                        <li><i className="bi bi-check text-success me-2"></i>Optional multi-node High Availability (HA) clustering</li>
                        <li><i className="bi bi-check text-success me-2"></i>Dynamic routing protocol support [w/pkg]</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2">
                      <h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-shield-fill-check me-2"></i>Firewall & Security</h6>
                    </div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>Extensive firewall rules</li>
                        <li><i className="bi bi-check text-success me-2"></i>Stateful filtering & packet inspection</li>
                        <li><i className="bi bi-check text-success me-2"></i>Per-interface configuration</li>
                        <li><i className="bi bi-check text-success me-2"></i>Ethernet (layer 2) rule-based packet filtering</li>
                        <li><i className="bi bi-check text-success me-2"></i>IP/DNS-based filtering and blacklisting [w/pkg]</li>
                        <li><i className="bi bi-check text-success me-2"></i>IDS/IPS with Snort-based packet analyzer [w/pkg]</li>
                        <li><i className="bi bi-check text-success me-2"></i>Layer 7 application detection and blocking [w/pkg]</li>
                        <li><i className="bi bi-check text-success me-2"></i>Geo/country blocking, IP block lists [w/pkg]</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2">
                      <h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-key me-2"></i>VPN</h6>
                    </div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>Site-to-site and remote access VPNs</li>
                        <li><i className="bi bi-check text-success me-2"></i>IPsec, OpenVPN, WireGuard®</li>
                        <li><i className="bi bi-check text-success me-2"></i>Split tunneling</li>
                        <li><i className="bi bi-check text-success me-2"></i>IPsec policy-based and route-based protocol support</li>
                        <li><i className="bi bi-check text-success me-2"></i>OpenVPN Data Channel Offload (DCO)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2">
                      <h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-person-lock me-2"></i>User Authentication</h6>
                    </div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>User and group-based privileges</li>
                        <li><i className="bi bi-check text-success me-2"></i>LDAP authentication</li>
                        <li><i className="bi bi-check text-success me-2"></i>Automatic lockout after repeated attempts</li>
                        <li><i className="bi bi-check text-success me-2"></i>Optional key-based SSH access</li>
                        <li><i className="bi bi-check text-success me-2"></i>Traffic and bandwidth shaping</li>
                        <li><i className="bi bi-check text-success me-2"></i>Captive portal with user data transfer quotas</li>
                        <li><i className="bi bi-check text-success me-2"></i>External RADIUS authentication [w/pkg]</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2">
                      <h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-gear me-2"></i>Configuration</h6>
                    </div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>Setup wizard for initial configuration</li>
                        <li><i className="bi bi-check text-success me-2"></i>Encrypted automatic backup to Netgate server</li>
                        <li><i className="bi bi-check text-success me-2"></i>Easy configuration backup/restore</li>
                        <li><i className="bi bi-check text-success me-2"></i>Multi-language support</li>
                        <li><i className="bi bi-check text-success me-2"></i>Web-based GUI management</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2">
                      <h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-graph-up me-2"></i>Monitoring & Reporting</h6>
                    </div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>Customizable dashboard with widgets</li>
                        <li><i className="bi bi-check text-success me-2"></i>Local monitoring graphs</li>
                        <li><i className="bi bi-check text-success me-2"></i>Remote logging</li>
                        <li><i className="bi bi-check text-success me-2"></i>Network usage monitoring [w/pkg]</li>
                        <li><i className="bi bi-check text-success me-2"></i>Network diagnostics [w/pkg]</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support & Warranty Information */}
      <section className="section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-headset text-primary me-2"></i>Support Information
                  </h5>
                  <ul className="small">
                    <li>TAC Lite included with purchase</li>
                    <li>24x7x365 zero-to-ping support</li>
                    <li>Access to pfSense+ online documentation</li>
                    <li>TAC Pro and Enterprise SLA available</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-shield-check text-primary me-2"></i>Warranty Information
                  </h5>
                  <ul className="small">
                    <li>1 year manufacturer&apos;s hardware warranty</li>
                    <li>Extended warranties available</li>
                    <li>Standard 30 day return policy</li>
                    <li>All specifications subject to change</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-info-circle text-primary me-2"></i>Additional Information
                  </h5>
                  <ul className="small">
                    <li>Standard build time: 2-3 days after payment</li>
                    <li>Not POE compatible</li>
                    <li>Does not support mSATA or LTE cards</li>
                    <li>Quick Start Guide included</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products / Accessories */}
      <section className="section bg-light">
        <div className="container">
          <h3 className="text-center mb-4">Related Accessories</h3>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Netgate 1100 Wall Mount Kit</h5>
                  <p className="text-muted">Contact for Price</p>
                  <a href="/request-quotation" className="btn btn-outline-primary btn-sm">Request Quote</a>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Netgate 1100 DIN Rail Mount Kit</h5>
                  <p className="text-muted">Contact for Price</p>
                  <a href="/request-quotation" className="btn btn-outline-primary btn-sm">Request Quote</a>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Netgate 1100 Power Supply</h5>
                  <p className="text-muted">Contact for Price</p>
                  <a href="/request-quotation" className="btn btn-outline-primary btn-sm">Request Quote</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Back to Store */}
      <section className="section">
        <div className="container text-center">
          <Link href="/store" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>Back to Store
          </Link>
        </div>
      </section>
    </main>
  );
}

