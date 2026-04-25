"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export default function WebBasedSystemAndroidPage() {
  const [mainImage] = useState("/assets/img/hero-img.png");
  const { addToCart } = useCart();

  const product = {
    id: 14,
    name: "Web Based System + Android",
    priceLabel: "RM 5,000 - RM 55,000",
    image: "/assets/img/hero-img.png",
    description: "Full-stack web and Android app solution - hosting and domain included",
    stock: "In-Stock",
    rating: 5,
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: 0,
      priceLabel: product.priceLabel,
      image: product.image,
    });
  };

  return (
    <main className="main">
      {/* Page Title */}
      <div className="page-title" data-aos="fade">
        <div className="container">
          <h1>Web Based System + Android App</h1>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className="section">
        <div className="container">
          {/* Breadcrumbs */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb" style={{ fontSize: "0.9rem" }}>
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/store">Store</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Web System + Android</li>
            </ol>
          </nav>

          <div className="row">
            {/* Product Images */}
            <div className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <img 
                    src={mainImage} 
                    alt="Web System + Android App" 
                    className="img-fluid rounded mb-3" 
                    style={{ width: "100%", height: "400px", objectFit: "contain", background: "#f8f9fa" }}
                  />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="mb-3">
                    <span className="badge bg-success mb-2">{product.stock}</span>
                    <span className="badge bg-info mb-2 ms-2">Web + Mobile</span>
                    <h2 style={{ fontSize: "1.75rem" }}>{product.name}</h2>
                    <p className="text-muted" style={{ fontSize: "0.95rem" }}>{product.description}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-warning me-1" style={{ fontSize: "1rem" }}></i>
                      ))}
                    </div>
                  </div>

                  <div className="border-top border-bottom py-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ fontSize: "0.95rem" }}>Price Range:</span>
                      <h3 className="text-primary mb-0" style={{ fontSize: "1.5rem" }}>{product.priceLabel}</h3>
                    </div>
                    <p className="text-muted small mb-0 mt-2">Final price depends on project requirements, complexity, and features</p>
                  </div>

                  <div className="d-grid gap-2 mb-4">
                    <button 
                      onClick={handleAddToCart}
                      className="btn btn-success btn-lg"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <i className="bi bi-cart-plus me-2"></i>Add to Cart
                    </button>
                    <Link href="/request-quotation" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>
                      <i className="bi bi-envelope me-2"></i>Request Detailed Quote
                    </Link>
                  </div>

                  <div className="alert alert-info" style={{ fontSize: "0.875rem" }}>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Included:</strong> Web System + Android App + Hosting + Domain for 1 year
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="row mt-5">
            <div className="col-12">
              <ul className="nav nav-tabs" id="productTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button className="nav-link active" style={{ fontSize: "0.875rem" }} id="features-tab" data-bs-toggle="tab" data-bs-target="#features" type="button" role="tab">
                    Features
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" style={{ fontSize: "0.875rem" }} id="examples-tab" data-bs-toggle="tab" data-bs-target="#examples" type="button" role="tab">
                    System Examples
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" style={{ fontSize: "0.875rem" }} id="support-tab" data-bs-toggle="tab" data-bs-target="#support" type="button" role="tab">
                    Support
                  </button>
                </li>
              </ul>

              <div className="tab-content p-4 border border-top-0 rounded-bottom" id="productTabContent" style={{ fontSize: "0.875rem" }}>
                <div className="tab-pane fade show active" id="features" role="tabpanel">
                  <h5 style={{ fontSize: "1rem" }} className="mb-3">Complete Web & Mobile Solution</h5>
                  
                  <h6 className="text-primary mt-4 mb-3">Web System Features</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Custom Web Admin Panel</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>User Authentication & Authorization</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Role-Based Access Control</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Database Design & Implementation</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Reporting & Analytics Dashboard</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>RESTful API Development</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Real-time Data Sync</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Data Import/Export</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Email & Push Notifications</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Audit Trail & Logging</li>
                      </ul>
                    </div>
                  </div>

                  <h6 className="text-primary mt-4 mb-3">Android App Features</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Native Android Development</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Material Design UI/UX</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Offline Mode Support</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Push Notifications</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Camera & File Upload</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>GPS & Location Services</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Barcode/QR Code Scanner</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Secure Data Encryption</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Auto-update Mechanism</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Google Play Store Publishing</li>
                      </ul>
                    </div>
                  </div>

                  <h6 className="text-primary mt-4 mb-3">Included Services</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Free Domain (.com/.com.my) for 1 Year</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Free Hosting for 1 Year</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Free SSL Certificate</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Google Play Console Setup</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>App Icon & Splash Screen Design</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>API Security Implementation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="tab-pane fade" id="examples" role="tabpanel">
                  <h5 style={{ fontSize: "1rem" }} className="mb-3">Example System Types</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-truck me-2"></i>Delivery Management System</h6>
                          <p className="small mb-0">Web admin for order management + Android app for delivery drivers with GPS tracking and real-time updates.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 15,000 - RM 30,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-people me-2"></i>Field Service Management</h6>
                          <p className="small mb-0">Web dashboard for job assignment + Android app for field technicians with job tracking and reporting.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 18,000 - RM 35,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-clipboard-check me-2"></i>Inventory & Warehouse System</h6>
                          <p className="small mb-0">Web admin for stock control + Android app for warehouse staff with barcode scanning.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 20,000 - RM 40,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-clock-history me-2"></i>Attendance & Leave System</h6>
                          <p className="small mb-0">Web HR portal + Android app for employees with GPS check-in/out, leave applications, and approvals.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 12,000 - RM 25,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-cart me-2"></i>Sales Order Management</h6>
                          <p className="small mb-0">Web admin for order processing + Android app for sales team with customer management and invoicing.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 15,000 - RM 32,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-building me-2"></i>Property/Facility Management</h6>
                          <p className="small mb-0">Web portal for property owners + Android app for tenants/maintenance staff with request tracking.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 22,000 - RM 45,000</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tab-pane fade" id="support" role="tabpanel">
                  <h5 style={{ fontSize: "1rem" }} className="mb-3">Support & Maintenance</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-headset text-primary me-2"></i>Technical Support</h6>
                          <p className="mb-0">12 months free technical support for both web and mobile app</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-tools text-primary me-2"></i>Warranty</h6>
                          <p className="mb-0">6 months warranty for bug fixes and system issues</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-book text-primary me-2"></i>Training</h6>
                          <p className="mb-0">Comprehensive training for web admin & mobile app users</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-google-play text-primary me-2"></i>App Store Management</h6>
                          <p className="mb-0">Google Play Store publishing and initial update support</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info mt-3" style={{ fontSize: "0.875rem" }}>
                    <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-info-circle me-2"></i>Development Timeline</h6>
                    <ol className="mb-0">
                      <li>Requirements gathering & analysis (1-2 weeks)</li>
                      <li>UI/UX design & database design (2-3 weeks)</li>
                      <li>Web system development (4-8 weeks)</li>
                      <li>Android app development (4-6 weeks)</li>
                      <li>Integration & testing (2-3 weeks)</li>
                      <li>User Acceptance Testing (1-2 weeks)</li>
                      <li>Training & deployment (1 week)</li>
                    </ol>
                    <p className="mb-0 mt-2"><strong>Total estimated timeline: 3-6 months</strong></p>
                  </div>

                  <div className="alert alert-warning mt-3" style={{ fontSize: "0.875rem" }}>
                    <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-exclamation-triangle me-2"></i>Additional Costs</h6>
                    <ul className="mb-0">
                      <li>Domain & Hosting Renewal: RM 300-500/year</li>
                      <li>Google Play Developer Account: USD 25 (one-time, by Google)</li>
                      <li>Optional iOS version: +30% of project cost</li>
                      <li>Maintenance Package: RM 300-800/month (after warranty)</li>
                      <li>Additional features after deployment available</li>
                    </ul>
                  </div>

                  <div className="alert alert-success mt-3" style={{ fontSize: "0.875rem" }}>
                    <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-star me-2"></i>Why Choose This Package?</h6>
                    <ul className="mb-0">
                      <li>Complete end-to-end solution (web + mobile)</li>
                      <li>Real-time data synchronization</li>
                      <li>Increase productivity with mobile accessibility</li>
                      <li>Professional support and maintenance</li>
                      <li>Scalable architecture for future growth</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

