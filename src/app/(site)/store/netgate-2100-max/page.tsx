"use client";

import Link from "next/link";
import { useState } from "react";

export default function Netgate2100MAXDetailPage() {
  const [mainImage, setMainImage] = useState("/assets/img/store/netgate2100/SG-2100frontAngled_1024x1024.webp");
  const [selectedPowerCord, setSelectedPowerCord] = useState("USA (IEC Type B)");
  const [quantity, setQuantity] = useState(1);

  const productImages = [
    { src: "/assets/img/store/netgate2100/SG-2100frontAngled_1024x1024.webp", alt: "Front angled view" },
    { src: "/assets/img/store/netgate2100/SG-2100front_720x.webp", alt: "Front view" },
    { src: "/assets/img/store/netgate2100/Rogue2rearheadon_1024x1024.webp", alt: "Rear view" },
  ];

  const basePrice = 1.00; // Temporary price
  const totalPrice = basePrice * quantity;

  return (
    <main className="main">
      {/* Product Detail Section */}
      <section className="section">
        <div className="container">
          <div className="row gy-4">
            {/* Product Images */}
            <div className="col-lg-6">
              {/* Main Image */}
              <div className="mb-3 bg-white p-4 rounded text-center" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={mainImage} alt="Netgate 2100 MAX" className="img-fluid" style={{ maxHeight: "400px" }} />
              </div>

              {/* Thumbnail Images */}
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
                      <img src={image.src} alt={image.alt} className="img-fluid" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="col-lg-6">
              <div className="mb-2">
                <span className="badge bg-info">Pre Order</span>
              </div>

              <h2 className="mb-2" style={{ fontSize: "1.75rem" }}>Netgate 2100 MAX pfSense+ Security Gateway</h2>

              <div className="mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="bi bi-star-fill text-warning"></i>
                ))}
              </div>

              <h3 className="text-primary mb-3" style={{ fontSize: "1.5rem" }}>RM {basePrice.toFixed(2)}</h3>

              <p className="mb-3" style={{ fontSize: "0.95rem" }}>
                Enhanced performance model with MAX configuration. Features 128 GB M.2 SATA SSD storage for expanded capabilities. 
                Pound-for-pound delivers unbeatable performance and flexibility in its class.
              </p>

              {/* Configuration Card */}
              <div className="card mb-3">
                <div className="card-body p-3">
                  <h6 className="card-title mb-3" style={{ fontSize: "0.95rem", fontWeight: "600" }}>Configure Your Device</h6>

                  {/* Power Cord Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      <i className="bi bi-plug me-2"></i>Power Cord
                    </label>
                    <select 
                      className="form-select" 
                      value={selectedPowerCord}
                      onChange={(e) => setSelectedPowerCord(e.target.value)}
                    >
                      <option>USA (IEC Type B)</option>
                      <option>EURO (IEC Type E/F)</option>
                      <option>UK (IEC Type G)</option>
                      <option>None</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Quantity</label>
                    <div className="input-group" style={{ maxWidth: "150px" }}>
                      <button 
                        className="btn btn-outline-secondary btn-sm" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        className="form-control form-control-sm text-center" 
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <button 
                        className="btn btn-outline-secondary btn-sm" 
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="alert alert-light mb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">Total:</span>
                      <span className="h5 text-primary mb-0">RM {totalPrice.toFixed(2)}</span>
                    </div>
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
                  <li>Console Cable (MiniUSB)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
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
                    Pound-for-pound, the Netgate® 2100 MAX security gateway appliance with pfSense® Plus software delivers unbeatable performance and flexibility in its class. 
                    It is ideal for home, remote worker, and small business deployments that require more compute resources to support the use of multiple pfSense add-on packages 
                    and VPN performance to support multiple user- and site-to-site connections.
                  </p>
                  <p>
                    Featuring a Dual core ARM Cortex A53 1.2 GHz CPU, a dedicated 1 GbE WAN port (RJ45/SFP combo), (4) 1 GbE Marvell switch ports, 4GB of DDR4 RAM, 
                    and <strong>128 GB M.2 SATA 2242 SSD</strong> storage. The 2100 has additional expansion slots available for DIY LTE, Wi-Fi or M.2 SSD expansion.
                  </p>
                  <p>
                    The Netgate 2100 MAX is a compact and powerful desktop device. Leveraging a Dual core ARM Cortex A53 processor @ 1.2GHz and 4GB of DDR4 RAM, 
                    the Netgate 2100 shines as a 2.20 Gbps router, 964 Mbps firewall, or 254 Mbps IPsec VPN solution.
                  </p>

                  <h5 className="mt-4 mb-2" style={{ fontSize: "1.1rem" }}>Best For:</h5>
                  <ul className="small">
                    <li>Consumers & Home Users</li>
                    <li>Remote Workers</li>
                    <li>Small to Medium-Sized Business Networks</li>
                    <li>Small to Medium-Sized Branch Office</li>
                    <li>Managed Service Providers (MSP/MSSP) On-Premises Appliance</li>
                  </ul>

                  <h5 className="mt-4 mb-2" style={{ fontSize: "1.1rem" }}>Product Features:</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-piggy-bank text-primary me-2"></i>Low Total Cost of Ownership
                          </h5>
                          <ul className="small">
                            <li>No artificial limits or add-ons required</li>
                            <li>Unlimited users, firewall rules, IPsec tunnels</li>
                            <li>Low power requirements</li>
                            <li>Long deployment lifetime</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-arrows-angle-expand text-primary me-2"></i>Grows With You
                          </h5>
                          <ul className="small">
                            <li>Multi-function security gateway</li>
                            <li>Multi-WAN, HA, VPN support</li>
                            <li>Load balancing & monitoring</li>
                            <li>Maximum 1 million active connections</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-laptop text-primary me-2"></i>Easy GUI Management
                          </h5>
                          <ul className="small">
                            <li>Web-based graphical interface</li>
                            <li>No command line required</li>
                            <li>Intuitive configuration</li>
                            <li>Multi-language support</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-shield-lock text-primary me-2"></i>Secure Remote Access
                          </h5>
                          <ul className="small">
                            <li>Encrypted VPN connections</li>
                            <li>Site-to-site & remote access</li>
                            <li>Amazon VPC Wizard</li>
                            <li>Cloud connectivity</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Key Highlights</h5>
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>2.20 Gbps Router Performance</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>964 Mbps Firewall Throughput</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>254 Mbps IPsec VPN</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>128 GB SSD Storage (MAX)</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>4 GB DDR4 RAM</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>5x GbE Ports</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>Expansion Slots (LTE/WiFi)</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>Passive Cooling</li>
                      </ul>
                    </div>
                  </div>

                  <div className="card mt-3 bg-light">
                    <div className="card-body">
                      <h6 className="card-title">Expansion Options</h6>
                      <ul className="small mb-0">
                        <li>M.2 &apos;B&apos; key socket (SSD, LTE)</li>
                        <li>miniPCIe slot (WiFi)</li>
                        <li>microSIM slot</li>
                      </ul>
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
                      <th style={{ width: "30%" }}>CPU</th>
                      <td>Marvell Armada 3720 (88F3720) ARMv8-A 64-bit Cortex A53 @ 1.2GHz with NEON SIMD and FPU</td>
                    </tr>
                    <tr>
                      <th>CPU Cores</th>
                      <td>Dual Core</td>
                    </tr>
                    <tr>
                      <th>System Memory</th>
                      <td>4 GB DDR4 RAM (not expandable)</td>
                    </tr>
                    <tr>
                      <th>Storage</th>
                      <td><strong>128 GB M.2 SATA 2242 SSD</strong> (not NVMe compatible)</td>
                    </tr>
                    <tr>
                      <th>Network Interfaces</th>
                      <td>
                        One 1 Gigabit Ethernet WAN port (RJ45 / SFP Combo)<br />
                        Four 1 Gigabit Ethernet LAN ports (Marvell 88E6141 switch)<br />
                        LAN ports can be repurposed for additional WAN ports
                      </td>
                    </tr>
                    <tr>
                      <th>Expansion</th>
                      <td>
                        1x M.2 &apos;B&apos; key sockets (SSD, LTE)<br />
                        1x miniPCIe (WiFi)<br />
                        microSIM slot
                      </td>
                    </tr>
                    <tr>
                      <th>Console Port</th>
                      <td>MiniUSB (console cable included)</td>
                    </tr>
                    <tr>
                      <th>USB Ports</th>
                      <td>1x USB 2.0 port</td>
                    </tr>
                    <tr>
                      <th>LED</th>
                      <td>3 full color RGB LEDs</td>
                    </tr>
                    <tr>
                      <th>Power</th>
                      <td>
                        External ITE P/S AC/DC 100-240V, 50-60 Hz, 12V 2.0A, threaded barrel connector<br />
                        AC Inlet: IEC320-C7 (2 PIN)
                      </td>
                    </tr>
                    <tr>
                      <th>Power Consumption</th>
                      <td>Low power design for efficient operation</td>
                    </tr>
                    <tr>
                      <th>Operating Temperature</th>
                      <td>32°F (0°C) to 122°F (50°C)</td>
                    </tr>
                    <tr>
                      <th>Enclosure</th>
                      <td>Desktop 1.7&quot; (42.2 mm) tall x 4.25&quot; (108 mm) deep x 6.8&quot; (172.7 mm) wide with integrated keyholes for wall mount</td>
                    </tr>
                    <tr>
                      <th>Cooling</th>
                      <td>Passive (fanless design)</td>
                    </tr>
                    <tr>
                      <th>Hardware Warranty</th>
                      <td>1 year standard with purchase</td>
                    </tr>
                    <tr>
                      <th>Certifications</th>
                      <td>CE, FCC (Class B), RoHS, UL, RCM, VCCI, UKCA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Tab */}
            <div className="tab-pane fade" id="performance">
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Performance Metrics</h4>
              <p className="text-muted small">Netgate 2100 performance tests conducted with pfSense Plus software version 22.01</p>
              
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-hdd-network display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-2" style={{ fontSize: "0.95rem" }}>L3 Forwarding</h6>
                      <hr className="my-2" />
                      <div className="mb-2">
                        <small className="d-block text-muted">IPERF3 Traffic</small>
                        <span className="h5 text-primary mb-0">2.20 Gbps</span>
                      </div>
                      <div>
                        <small className="d-block text-muted">IMIX Traffic</small>
                        <span className="h5 text-primary mb-0">594 Mbps</span>
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
                        <span className="h5 text-primary mb-0">964 Mbps</span>
                      </div>
                      <div>
                        <small className="d-block text-muted">IMIX Traffic</small>
                        <span className="h5 text-primary mb-0">249 Mbps</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-lock display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-1" style={{ fontSize: "0.95rem" }}>IPsec VPN</h6>
                      <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>(AES-GCM-128 / AES-NI w/ SafeXcel)</small>
                      <hr className="my-2" />
                      <div className="mb-2">
                        <small className="d-block text-muted">IPERF3 Traffic</small>
                        <span className="h5 text-primary mb-0">254 Mbps</span>
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
                  Maximum Active Connections: <strong>1 million</strong>. The Dual core ARM v8 Cortex-A53 1.2 GHz delivers exceptional performance for common workloads. 
                  Performance may vary based on configuration, enabled features, and network conditions.
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
                        <li><i className="bi bi-check text-success me-2"></i>Reverse proxy [w/pkg]</li>
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
                        <li><i className="bi bi-check text-success me-2"></i>Intel® IPsec Multi-Buffer (IIMB) where available</li>
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

      {/* Support & Warranty Section */}
      <section className="section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 border-primary">
                <div className="card-body">
                  <h5 className="card-title"><i className="bi bi-headset text-primary me-2"></i>Support Information</h5>
                  <ul className="mb-0">
                    <li>24x7x365 Technical assistance from Netgate Global Support</li>
                    <li>TAC Lite included with purchase</li>
                    <li>TAC Pro and TAC Enterprise options available</li>
                    <li>Community forum support</li>
                    <li>Continuously updated pfSense documentation</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 border-success">
                <div className="card-body">
                  <h5 className="card-title"><i className="bi bi-shield-check text-success me-2"></i>Warranty Information</h5>
                  <ul className="mb-0">
                    <li>One year manufacturer&apos;s hardware warranty</li>
                    <li>Extended warranties available</li>
                    <li>30 day return policy</li>
                    <li>Professional installation services available</li>
                    <li>Contact: enquiry@kflegacyresources.com</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Back to Store */}
      <section className="section bg-light">
        <div className="container text-center">
          <Link href="/store" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>Back to Store
          </Link>
        </div>
      </section>
    </main>
  );
}

