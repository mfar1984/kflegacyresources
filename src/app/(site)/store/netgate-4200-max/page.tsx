"use client";

import Link from "next/link";
import { useState } from "react";

export default function Netgate4200MAXDetailPage() {
  const [mainImage, setMainImage] = useState("/assets/img/store/netgate4200/4200_front_corner_angle.jpg");
  const [selectedMountKit, setSelectedMountKit] = useState("None");
  const [selectedPowerCord, setSelectedPowerCord] = useState("USA (IEC Type A)");
  const [quantity, setQuantity] = useState(1);

  const productImages = [
    { src: "/assets/img/store/netgate4200/4200_front_corner_angle.jpg", alt: "Front corner angle view" },
    { src: "/assets/img/store/netgate4200/4200_front_head-on.jpg", alt: "Front head-on view" },
    { src: "/assets/img/store/netgate4200/4200_right.jpg", alt: "Right side view" },
    { src: "/assets/img/store/netgate4200/4200_rear_head-on.jpg", alt: "Rear head-on view" },
    { src: "/assets/img/store/netgate4200/4200_rear_angle.jpg", alt: "Rear angle view" },
    { src: "/assets/img/store/netgate4200/4200_rear_corner_angle.jpg", alt: "Rear corner angle view" },
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
                <img src={mainImage} alt="Netgate 4200 MAX" className="img-fluid" style={{ maxHeight: "400px" }} />
              </div>

              {/* Thumbnail Images */}
              <div className="row g-2">
                {productImages.map((image, index) => (
                  <div key={index} className="col-2">
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

              <h2 className="mb-2" style={{ fontSize: "1.75rem" }}>Netgate 4200 MAX pfSense+ Security Gateway</h2>

              <div className="mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="bi bi-star-fill text-warning"></i>
                ))}
              </div>

              <h3 className="text-primary mb-3" style={{ fontSize: "1.5rem" }}>RM {basePrice.toFixed(2)}</h3>

              <p className="mb-3" style={{ fontSize: "0.95rem" }}>
                The most versatile security gateway in its class. Utilizes Intel® Atom® C3558 4-core CPU achieving benchmark results up to 3x faster 
                in routing, firewall forwarding and IPsec VPN. Delivers over 9.2 Gbps routing across four independent 2.5 GbE ports.
              </p>

              {/* Configuration Card */}
              <div className="card mb-3">
                <div className="card-body p-3">
                  <h6 className="card-title mb-3" style={{ fontSize: "0.95rem", fontWeight: "600" }}>Configure Your Device</h6>

                  {/* Mount Kit Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      <i className="bi bi-box me-2"></i>Mount Kit
                    </label>
                    <select 
                      className="form-select" 
                      value={selectedMountKit} 
                      onChange={(e) => setSelectedMountKit(e.target.value)}
                    >
                      <option>None</option>
                      <option>Wall Mount Kit</option>
                    </select>
                  </div>

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
                      <option>USA (IEC Type A)</option>
                      <option>EURO (IEC Type E/F)</option>
                      <option>UK (IEC Type G)</option>
                      <option>AUS/NZ (IEC Type I)</option>
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
                  <li>Complimentary Software Updates (Lifetime)</li>
                  <li>Automatic Configuration Backup Service</li>
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
                    The Netgate® 4200 with pfSense® Plus software is the most versatile security gateway in its class. The 4200 utilizes the blazing fast performance 
                    of 4-core Intel® Atom® C3558 CPU to achieve benchmark results up to three times faster in routing, firewall forwarding and IPsec VPN than the 
                    previous generation of security gateways.
                  </p>
                  <p>
                    The 4200 delivers over <strong>9.2 Gbps of L3 routing</strong> across four independent 2.5 GbE flexible WAN/LAN ports. The Netgate 4200 is ideal for 
                    pro-home, small/medium businesses, branch and edge deployments that require flexible port configurations to handle 1 to 2.5 Gbps WAN capabilities 
                    across four discrete, unswitched 2.5 Gbps RJ-45 ethernet LAN ports - all in a silent desktop form factor.
                  </p>

                  <h5 className="mt-4 mb-2" style={{ fontSize: "1.1rem" }}>Best For:</h5>
                  <ul className="small">
                    <li>Prosumers</li>
                    <li>Remote Workers</li>
                    <li>Small to Medium-Sized Business Networks</li>
                    <li>Small to Medium-Sized Branch Office</li>
                    <li>Managed Service Providers (MSP/MSSP) On-Premises Appliance</li>
                    <li>Edge-to-Cloud deployments</li>
                    <li>Anyone with High-Speed Gigabit Connections</li>
                    <li>Situations requiring no fan noise</li>
                  </ul>

                  <h5 className="mt-4 mb-2" style={{ fontSize: "1.1rem" }}>Product Features:</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-piggy-bank text-primary me-2"></i>Low Total Cost of Ownership
                          </h5>
                          <ul className="list-unstyled mb-0 small">
                            <li><i className="bi bi-check text-success me-1"></i>No artificial limits or add-ons required</li>
                            <li><i className="bi bi-check text-success me-1"></i>Unlimited users, firewall rules, IPsec tunnels</li>
                            <li><i className="bi bi-check text-success me-1"></i>Low power requirements</li>
                            <li><i className="bi bi-check text-success me-1"></i>Long deployment lifetime</li>
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
                          <ul className="list-unstyled mb-0 small">
                            <li><i className="bi bi-check text-success me-1"></i>Multi-function security gateway</li>
                            <li><i className="bi bi-check text-success me-1"></i>Multi-WAN, HA, VPN support</li>
                            <li><i className="bi bi-check text-success me-1"></i>IDS/IPS with Snort/Suricata packages</li>
                            <li><i className="bi bi-check text-success me-1"></i>Maximum 4 million active connections</li>
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
                          <ul className="list-unstyled mb-0 small">
                            <li><i className="bi bi-check text-success me-1"></i>Web-based graphical interface</li>
                            <li><i className="bi bi-check text-success me-1"></i>No command line required</li>
                            <li><i className="bi bi-check text-success me-1"></i>Intuitive configuration</li>
                            <li><i className="bi bi-check text-success me-1"></i>Multi-language support</li>
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
                          <ul className="list-unstyled mb-0 small">
                            <li><i className="bi bi-check text-success me-1"></i>Encrypted VPN connections</li>
                            <li><i className="bi bi-check text-success me-1"></i>Site-to-site & remote access</li>
                            <li><i className="bi bi-check text-success me-1"></i>Amazon VPC Wizard</li>
                            <li><i className="bi bi-check text-success me-1"></i>Cloud connectivity</li>
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
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>8.75 Gbps Router Performance</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>8.61 Gbps Firewall Throughput</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>3.2 Gbps IPsec VPN</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>Intel Atom 4-core @ 2.1GHz</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>4 GB LPDDR5 RAM</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>128 GB NVMe SSD</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>4x 2.5 GbE Ports</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>Passive Cooling / Fanless</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>Silent Operation</li>
                      </ul>
                    </div>
                  </div>

                  <div className="card mt-3 bg-warning">
                    <div className="card-body">
                      <h6 className="card-title"><i className="bi bi-exclamation-triangle me-2"></i>Important Note</h6>
                      <p className="small mb-0">This system uses the case as a heatsink. Please be aware it may feel warm when in use. This is normal operation for passive cooling systems.</p>
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
                      <td>Intel Atom C3558 with AVX2, 4-core @ 2.1 GHz</td>
                    </tr>
                    <tr>
                      <th>System Memory</th>
                      <td>4 GB LPDDR5 RAM (not expandable)</td>
                    </tr>
                    <tr>
                      <th>Storage</th>
                      <td>128 GB NVMe M.2 SSD</td>
                    </tr>
                    <tr>
                      <th>Network Interfaces</th>
                      <td>
                        Four 2.5 Gigabit Ethernet independent and configurable RJ45 ports<br />
                        Configure for single or dual WAN, or high-availability failover
                      </td>
                    </tr>
                    <tr>
                      <th>Console Port</th>
                      <td>RJ45 Serial Console</td>
                    </tr>
                    <tr>
                      <th>USB Ports</th>
                      <td>2x USB 3.0 Type-A ports</td>
                    </tr>
                    <tr>
                      <th>LED</th>
                      <td>Status LEDs for power and network activity</td>
                    </tr>
                    <tr>
                      <th>Power</th>
                      <td>
                        External Power Supply 12V DC<br />
                        AC Inlet: IEC320-C7 (2 PIN)<br />
                        One US, UK, EU or ANZ power cord included
                      </td>
                    </tr>
                    <tr>
                      <th>Power Consumption</th>
                      <td>Low power design with passive cooling</td>
                    </tr>
                    <tr>
                      <th>Operating Temperature</th>
                      <td>32°F (0°C) to 122°F (50°C)</td>
                    </tr>
                    <tr>
                      <th>Enclosure</th>
                      <td>Desktop form factor with wall mount capability (optional kit)</td>
                    </tr>
                    <tr>
                      <th>Cooling</th>
                      <td>Passive (fanless - silent operation)</td>
                    </tr>
                    <tr>
                      <th>Dimensions</th>
                      <td>Compact desktop unit</td>
                    </tr>
                    <tr>
                      <th>Hardware Warranty</th>
                      <td>1 year standard with purchase</td>
                    </tr>
                    <tr>
                      <th>Certifications</th>
                      <td>CE, FCC, RoHS</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Tab */}
            <div className="tab-pane fade" id="performance">
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Performance Metrics</h4>
              <p className="text-muted small">Netgate 4200 performance tests conducted with pfSense Plus software version 23.09.1</p>
              
              <div className="alert alert-info mb-4">
                <h6><i className="bi bi-speedometer2 me-2"></i>Up to 3x Performance Improvement</h6>
                <p className="mb-0 small">The Netgate 4200 delivers benchmark results up to three times faster in routing, firewall forwarding and IPsec VPN compared to the previous Netgate 4100 generation.</p>
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-hdd-network display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-2" style={{ fontSize: "0.95rem" }}>L3 Forwarding (Router)</h6>
                      <hr className="my-2" />
                      <div className="mb-2">
                        <small className="d-block text-muted">IPERF3 Traffic</small>
                        <span className="h5 text-primary mb-0">8.75 Gbps</span>
                      </div>
                      <div>
                        <small className="d-block text-muted">IMIX Traffic</small>
                        <span className="h5 text-primary mb-0">9.28 Gbps</span>
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
                        <span className="h5 text-primary mb-0">8.61 Gbps</span>
                      </div>
                      <div>
                        <small className="d-block text-muted">IMIX Traffic</small>
                        <span className="h5 text-primary mb-0">3.21 Gbps</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-lock display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-1" style={{ fontSize: "0.95rem" }}>IPsec VPN</h6>
                      <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>(AES-GCM-128 w/AES-NI)</small>
                      <hr className="my-2" />
                      <div className="mb-2">
                        <small className="d-block text-muted">IPERF3 Traffic</small>
                        <span className="h5 text-primary mb-0">3.2 Gbps</span>
                      </div>
                      <div>
                        <small className="d-block text-muted">IMIX Traffic</small>
                        <span className="h5 text-primary mb-0">1.05 Gbps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info mt-4">
                <h6><i className="bi bi-info-circle me-2"></i>Performance Note</h6>
                <p className="mb-0 small">
                  Maximum Active Connections: <strong>4,000,000</strong>. Intel Atom C3558 4-core @ 2.1 GHz with AVX2 delivers exceptional performance. 
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
                        <li><i className="bi bi-check text-success me-2"></i>Intel IPsec Multi-Buffer (IIMB) where available</li>
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
                    <li>Complimentary Software Updates (Lifetime)</li>
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

