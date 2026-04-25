"use client";

import Link from "next/link";
import { useState } from "react";

export default function Netgate8300BASEDetailPage() {
  const [mainImage, setMainImage] = useState("/assets/img/store/netgate8300/8300_front_angle.jpg");
  const [selectedExpansionCard, setSelectedExpansionCard] = useState("None (left) / 2-Port 25GbE SFP28 Card (right)");
  const [quantity, setQuantity] = useState(1);

  const productImages = [
    { src: "/assets/img/store/netgate8300/8300_front_angle.jpg", alt: "Front angle" },
    { src: "/assets/img/store/netgate8300/8300_front_head-on.jpg", alt: "Front head-on" },
    { src: "/assets/img/store/netgate8300/8300_front_top_angle.jpg", alt: "Front top angle" },
    { src: "/assets/img/store/netgate8300/8300_rear_angle.jpg", alt: "Rear angle" },
    { src: "/assets/img/store/netgate8300/8300_rear_head-on.jpg", alt: "Rear head-on" },
    { src: "/assets/img/store/netgate8300/8300_dual_psu.jpg", alt: "Dual PSU" },
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
                <img src={mainImage} alt="Netgate 8300 BASE" className="img-fluid" style={{ maxHeight: "400px" }} />
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
              <div className="mb-2"><span className="badge bg-info">Pre Order</span></div>
              <h2 className="mb-2" style={{ fontSize: "1.75rem" }}>Netgate 8300 BASE pfSense+ Security Gateway</h2>
              <div className="mb-3">
                {[...Array(5)].map((_, i) => (<i key={i} className="bi bi-star-fill text-warning"></i>))}
              </div>
              <h3 className="text-primary mb-3" style={{ fontSize: "1.5rem" }}>RM {basePrice.toFixed(2)}</h3>
              <p className="mb-3" style={{ fontSize: "0.95rem" }}>
                Enterprise 1U rackmount security gateway with Intel C3758 8-core processor @ 2.2 GHz and 16 GB RAM. 
                Supports high-speed expansion cards for 25GbE/100GbE connectivity.
              </p>

              <div className="card mb-3">
                <div className="card-body p-3">
                  <h6 className="card-title mb-3" style={{ fontSize: "0.95rem", fontWeight: "600" }}>Configure Your Device</h6>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold"><i className="bi bi-hdd-rack me-2"></i>Expansion Card</label>
                    <select className="form-select form-select-sm" value={selectedExpansionCard} onChange={(e) => setSelectedExpansionCard(e.target.value)}>
                      <option>None (left) / 2-Port 25GbE SFP28 Card (right)</option>
                      <option>None (left port) / 2-Port 100GbE QSFP28 Card (right)</option>
                      <option>2-Port 25GbE SFP28 Card (left) / None (right)</option>
                      <option>2-Port 25GbE SFP28 Card (left) / 2-Port 25GbE SFP28 Card (right)</option>
                      <option>2-Port 25GbE SFP28 Card (left) / 2-Port 100GbE QSFP28 Card (right)</option>
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
                  <p>The Netgate® 8300 BASE is a premium 1U rackmount security gateway powered by Intel C3758 8-core processor @ 2.2 GHz with QuickAssist Technology. With 16 GB DDR4 RAM and flexible expansion options for high-speed networking, it&apos;s designed for demanding enterprise environments.</p>
                  <p>Delivers exceptional <strong>18.50 Gbps routing</strong> and supports expansion cards for 25GbE/100GbE connectivity. Perfect for data centers, large enterprises, and service providers.</p>

                  <h5 className="mt-4 mb-2" style={{ fontSize: "1.1rem" }}>Best For:</h5>
                  <ul className="small">
                    <li>Large Enterprises & Data Centers</li>
                    <li>Service Providers (MSP/MSSP)</li>
                    <li>High-availability deployments</li>
                    <li>Multi-gigabit WAN connections</li>
                    <li>Advanced VPN concentrators</li>
                  </ul>
                </div>

                <div className="col-lg-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Key Highlights</h5>
                      <ul className="list-unstyled small">
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i><strong>Intel C3758 8-core</strong></li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>16 GB DDR4 RAM</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>18.50 Gbps Routing</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>25/100GbE Expansion</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>1U Rack Mount</li>
                        <li className="mb-2"><i className="bi bi-check-circle me-2"></i>QuickAssist (QAT)</li>
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
                    <tr><th style={{ width: "30%" }}>CPU</th><td>Intel Atom C3758 8-Core @ 2.2 GHz with QuickAssist (QAT) and AES-NI</td></tr>
                    <tr><th>System Memory</th><td>16 GB DDR4 RAM</td></tr>
                    <tr><th>Storage</th><td>eMMC (upgradeable to 128GB NVMe with MAX version)</td></tr>
                    <tr><th>Network Interfaces</th><td>(2) 10 GbE SFP+<br />(2) 1 GbE Combo (RJ45/SFP)<br />(4) 2.5 GbE RJ-45<br />Optional 25GbE/100GbE expansion</td></tr>
                    <tr><th>Form Factor</th><td>1U Rackmount</td></tr>
                    <tr><th>Power</th><td>Dual redundant PSU support</td></tr>
                    <tr><th>Cooling</th><td>Active (enterprise-grade fans)</td></tr>
                    <tr><th>Certifications</th><td>CE, FCC, RoHS</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="tab-pane fade" id="performance">
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Performance Metrics</h4>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-hdd-network display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-2" style={{ fontSize: "0.95rem" }}>L3 Forwarding</h6>
                      <hr className="my-2" />
                      <div><small className="d-block text-muted">IPERF3</small><span className="h5 text-primary mb-0">18.50 Gbps</span></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-shield-lock display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-2" style={{ fontSize: "0.95rem" }}>Firewall</h6>
                      <hr className="my-2" />
                      <div><small className="d-block text-muted">IPERF3</small><span className="h5 text-primary mb-0">9.93 Gbps</span></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center h-100">
                    <div className="card-body p-3">
                      <i className="bi bi-lock display-5 text-primary mb-2"></i>
                      <h6 className="card-title mb-1" style={{ fontSize: "0.95rem" }}>IPsec VPN</h6>
                      <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>(w/QAT)</small>
                      <hr className="my-2" />
                      <div><small className="d-block text-muted">IPERF3</small><span className="h5 text-primary mb-0">1.77 Gbps</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info mt-4">
                <h6><i className="bi bi-info-circle me-2"></i>Performance Note</h6>
                <p className="mb-0 small">Maximum Active Connections: <strong>4,000,000</strong>. QuickAssist Technology for hardware-accelerated encryption.</p>
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
                        <li><i className="bi bi-check text-success me-2"></i>Multi-WAN with load balancing</li>
                        <li><i className="bi bi-check text-success me-2"></i>Policy-based routing</li>
                        <li><i className="bi bi-check text-success me-2"></i>High Availability clustering</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white py-2"><h6 className="mb-0" style={{ fontSize: "0.95rem" }}><i className="bi bi-shield-fill-check me-2"></i>Security</h6></div>
                    <div className="card-body p-3">
                      <ul className="list-unstyled mb-0 small">
                        <li><i className="bi bi-check text-success me-2"></i>IDS/IPS with Snort/Suricata</li>
                        <li><i className="bi bi-check text-success me-2"></i>Advanced firewall rules</li>
                        <li><i className="bi bi-check text-success me-2"></i>Geo-blocking</li>
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
                  <h5 className="card-title"><i className="bi bi-headset text-primary me-2"></i>Support</h5>
                  <ul className="mb-0 small">
                    <li>24x7x365 Technical Support</li>
                    <li>TAC Lite included</li>
                    <li>Contact: enquiry@kflegacyresources.com</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 border-success">
                <div className="card-body">
                  <h5 className="card-title"><i className="bi bi-shield-check text-success me-2"></i>Warranty</h5>
                  <ul className="mb-0 small">
                    <li>1 year hardware warranty</li>
                    <li>30 day return policy</li>
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

