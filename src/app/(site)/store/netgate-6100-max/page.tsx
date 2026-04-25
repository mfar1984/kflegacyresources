"use client";

import Link from "next/link";
import { useState } from "react";

export default function Netgate6100MAXDetailPage() {
  const [mainImage, setMainImage] = useState("/assets/img/store/netgate6100/6100_front_angle.jpg");
  const [selectedMountKit, setSelectedMountKit] = useState("None");
  const [selectedPowerCord, setSelectedPowerCord] = useState("USA (IEC Type A)");
  const [quantity, setQuantity] = useState(1);

  const productImages = [
    { src: "/assets/img/store/netgate6100/6100_front_angle.jpg", alt: "Front angle" },
    { src: "/assets/img/store/netgate6100/6100_front_head-on.jpg", alt: "Front head-on" },
    { src: "/assets/img/store/netgate6100/6100_left.jpg", alt: "Left side" },
    { src: "/assets/img/store/netgate6100/6100_right.jpg", alt: "Right side" },
    { src: "/assets/img/store/netgate6100/6100_rear_head-on.jpg", alt: "Rear head-on" },
    { src: "/assets/img/store/netgate6100/6100_rear_angle.jpg", alt: "Rear angle" },
  ];

  const basePrice = 1.00;
  const totalPrice = basePrice * quantity;

  return (
    <main className="main">
      <section className="section">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="mb-3 bg-white p-4 rounded text-center" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={mainImage} alt="Netgate 6100 MAX" className="img-fluid" style={{ maxHeight: "400px" }} />
              </div>
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

            <div className="col-lg-6">
              <div className="mb-2">
                <span className="badge bg-info">Pre Order</span>
              </div>
              <h2 className="mb-2" style={{ fontSize: "1.75rem" }}>Netgate 6100 MAX pfSense+ Security Gateway</h2>
              <div className="mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="bi bi-star-fill text-warning"></i>
                ))}
              </div>
              <h3 className="text-primary mb-3" style={{ fontSize: "1.5rem" }}>RM {basePrice.toFixed(2)}</h3>
              <p className="mb-3" style={{ fontSize: "0.95rem" }}>
                Enhanced MAX version with 128 GB NVMe SSD storage. Intel C3558 Quad Core CPU with QuickAssist Technology delivers 
                over 18 Gbps routing performance. Perfect for power users and enterprise deployments.
              </p>

              <div className="card mb-3">
                <div className="card-body p-3">
                  <h6 className="card-title mb-3" style={{ fontSize: "0.95rem", fontWeight: "600" }}>Configure Your Device</h6>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold"><i className="bi bi-box me-2"></i>Mount Kit</label>
                    <select className="form-select" value={selectedMountKit} onChange={(e) => setSelectedMountKit(e.target.value)}>
                      <option>None</option>
                      <option>Wall Mount Kit</option>
                      <option>Rack Mount Installed</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold"><i className="bi bi-plug me-2"></i>Power Cord</label>
                    <select className="form-select" value={selectedPowerCord} onChange={(e) => setSelectedPowerCord(e.target.value)}>
                      <option>USA (IEC Type A)</option>
                      <option>EURO (IEC Type E/F)</option>
                      <option>UK (IEC Type G)</option>
                      <option>AUS/NZ (IEC Type I)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Quantity</label>
                    <div className="input-group" style={{ maxWidth: "150px" }}>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                      <input type="number" className="form-control form-control-sm text-center" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="alert alert-light mb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">Total:</span>
                      <span className="h5 text-primary mb-0">RM {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 mb-3">
                <a href="/request-quotation" className="btn btn-primary"><i className="bi bi-envelope me-2"></i>Request Quotation</a>
                <a href="/contact" className="btn btn-outline-primary"><i className="bi bi-telephone me-2"></i>Contact Sales</a>
              </div>

              <div className="alert alert-success mb-0">
                <h6 className="alert-heading small mb-2"><i className="bi bi-gift me-2"></i>Included with Purchase:</h6>
                <ul className="mb-0" style={{ fontSize: "0.85rem" }}>
                  <li>1 Year Hardware Warranty</li>
                  <li>TAC Lite Support (24x7)</li>
                  <li>pfSense+ Software License</li>
                  <li>Automatic Configuration Backup</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item"><button className="nav-link active" data-bs-toggle="tab" data-bs-target="#overview">Overview</button></li>
            <li className="nav-item"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#specs">Technical Specifications</button></li>
            <li className="nav-item"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#performance">Performance</button></li>
            <li className="nav-item"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#features">Features</button></li>
          </ul>

          <div className="tab-content">
            <div className="tab-pane fade show active" id="overview">
              <div className="row">
                <div className="col-lg-8">
                  <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Product Overview</h4>
                  <p>The Netgate® 6100 MAX with pfSense® Plus software offers enhanced storage capacity with a 128 GB NVMe M.2 SSD, perfect for intensive logging, package caching, and advanced security features. Same powerful Intel C3558 Quad Core CPU with QuickAssist Technology as the BASE model.</p>
                  <p>Delivers over <strong>18 Gbps of L3 routing</strong> with 8 independent ports including 2x 10 GbE SFP+, 2x 1 GbE Combo ports, and 4x 2.5 GbE. Ideal for power users and businesses requiring maximum storage and performance.</p>

                  <h5 className="mt-4 mb-2" style={{ fontSize: "1.1rem" }}>Best For:</h5>
                  <ul className="small">
                    <li>Power Users & Prosumers</li>
                    <li>Small to Medium-Sized Enterprises</li>
                    <li>Branch Office with IDS/IPS requirements</li>
                    <li>MSP/MSSP Managed Services</li>
                    <li>High-bandwidth applications</li>
                    <li>Advanced logging & monitoring</li>
                  </ul>
                </div>

                <div className="col-lg-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Key Highlights</h5>
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>18.50 Gbps Router Performance</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>9.93 Gbps Firewall Throughput</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>1.77 Gbps IPsec VPN</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>Intel C3558 4-core @ 2.2GHz</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>8 GB DDR4 RAM</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i><strong>128 GB NVMe SSD (MAX)</strong></li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>2x 10 GbE SFP+</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>4x 2.5 GbE Ports</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>QuickAssist Technology</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>Passive Cooling</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tab-pane fade" id="specs">
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Technical Specifications</h4>
              <div className="table-responsive">
                <table className="table table-striped table-hover table-sm">
                  <tbody style={{ fontSize: "0.9rem" }}>
                    <tr><th style={{ width: "30%" }}>CPU</th><td>Intel Atom C3558 Quad-Core @ 2.2 GHz with QuickAssist (QAT) and AES-NI</td></tr>
                    <tr><th>System Memory</th><td>8 GB DDR4 RAM</td></tr>
                    <tr><th>Storage</th><td><strong>128 GB NVMe M.2 SSD</strong></td></tr>
                    <tr><th>Network Interfaces</th><td>(2) 10 GbE SFP+<br />(2) 1 GbE Combo (RJ45/SFP)<br />(4) 2.5 GbE RJ-45</td></tr>
                    <tr><th>Console Port</th><td>RJ45 Serial Console</td></tr>
                    <tr><th>USB Ports</th><td>2x USB 3.0 Type-A ports</td></tr>
                    <tr><th>Power</th><td>External Power Supply 12V DC<br />AC Inlet: IEC320-C7 (2 PIN)</td></tr>
                    <tr><th>Operating Temperature</th><td>32°F (0°C) to 122°F (50°C)</td></tr>
                    <tr><th>Enclosure</th><td>Desktop: 10 x 7.88 x 1.88 in (254 x 200 x 47.63 mm)</td></tr>
                    <tr><th>Cooling</th><td>Passive (fanless - silent operation)</td></tr>
                    <tr><th>Certifications</th><td>CE, FCC, RoHS</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="tab-pane fade" id="performance">
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Performance Metrics</h4>
              <p className="text-muted small">Performance tests conducted with pfSense Plus software</p>
              
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-hdd-network display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-2" style={{ fontSize: "0.95rem" }}>L3 Forwarding</h6>
                      <hr className="my-2" />
                      <div className="mb-2"><small className="d-block text-muted">IPERF3 Traffic</small><span className="h5 text-primary mb-0">18.50 Gbps</span></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-shield-lock display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-2" style={{ fontSize: "0.95rem" }}>Firewall (10k ACLs)</h6>
                      <hr className="my-2" />
                      <div className="mb-2"><small className="d-block text-muted">IPERF3 Traffic</small><span className="h5 text-primary mb-0">9.93 Gbps</span></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-lock display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-1" style={{ fontSize: "0.95rem" }}>IPsec VPN</h6>
                      <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>(AES-GCM-128 w/QAT)</small>
                      <hr className="my-2" />
                      <div className="mb-2"><small className="d-block text-muted">IPERF3 Traffic</small><span className="h5 text-primary mb-0">1.77 Gbps</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info mt-4">
                <h6><i className="bi bi-info-circle me-2"></i>Performance Note</h6>
                <p className="mb-0 small">Maximum Active Connections: <strong>4,000,000</strong>. QuickAssist Technology provides hardware acceleration for encryption tasks.</p>
              </div>
            </div>

            <div className="tab-pane fade" id="features">
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>pfSense Plus Software Features</h4>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2"><h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-router me-2"></i>Router</h6></div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>Policy-based routing</li>
                        <li><i className="bi bi-check text-success me-2"></i>Multiple WAN connections</li>
                        <li><i className="bi bi-check text-success me-2"></i>Load balancing and failover</li>
                        <li><i className="bi bi-check text-success me-2"></i>IPv4 and IPv6 support</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2"><h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-shield-fill-check me-2"></i>Firewall & Security</h6></div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>Stateful filtering</li>
                        <li><i className="bi bi-check text-success me-2"></i>IDS/IPS with Snort [w/pkg]</li>
                        <li><i className="bi bi-check text-success me-2"></i>Layer 7 application filtering [w/pkg]</li>
                        <li><i className="bi bi-check text-success me-2"></i>Geo-blocking [w/pkg]</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2"><h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-key me-2"></i>VPN</h6></div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>IPsec, OpenVPN, WireGuard®</li>
                        <li><i className="bi bi-check text-success me-2"></i>Site-to-site & remote access</li>
                        <li><i className="bi bi-check text-success me-2"></i>Hardware acceleration (QAT)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2"><h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-graph-up me-2"></i>Monitoring</h6></div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>Customizable dashboard</li>
                        <li><i className="bi bi-check text-success me-2"></i>Real-time graphs</li>
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

      <section className="section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 border-primary">
                <div className="card-body">
                  <h5 className="card-title"><i className="bi bi-headset text-primary me-2"></i>Support Information</h5>
                  <ul className="mb-0">
                    <li>24x7x365 Netgate Global Support</li>
                    <li>TAC Lite included with purchase</li>
                    <li>Community forum support</li>
                    <li>Contact: enquiry@kflegacyresources.com</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 border-success">
                <div className="card-body">
                  <h5 className="card-title"><i className="bi bi-shield-check text-success me-2"></i>Warranty Information</h5>
                  <ul className="mb-0">
                    <li>One year hardware warranty</li>
                    <li>30 day return policy</li>
                    <li>Extended warranties available</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container text-center">
          <Link href="/store" className="btn btn-primary"><i className="bi bi-arrow-left me-2"></i>Back to Store</Link>
        </div>
      </section>
    </main>
  );
}

