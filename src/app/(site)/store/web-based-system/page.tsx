"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export default function WebBasedSystemPage() {
  const [mainImage] = useState("/assets/img/hero-img.png");
  const { addToCart } = useCart();

  const product = {
    id: 13,
    name: "Web Based System",
    priceLabel: "RM 5,000 - RM 35,000",
    image: "/assets/img/hero-img.png",
    description: "Custom web-based system tailored to your needs - hosting and domain included",
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
          <h1>Web Based System</h1>
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
              <li className="breadcrumb-item active" aria-current="page">Web Based System</li>
            </ol>
          </nav>

          <div className="row">
            {/* Product Images */}
            <div className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <img 
                    src={mainImage} 
                    alt="Web Based System" 
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
                    <p className="text-muted small mb-0 mt-2">Final price depends on project requirements and complexity</p>
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
                    <strong>Included:</strong> Hosting + Domain for 1 year + Custom Development
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
                  <h5 style={{ fontSize: "1rem" }} className="mb-3">Custom Web System Features</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Custom Design & Branding</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>User Authentication & Authorization</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Role-Based Access Control</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Database Design & Implementation</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Reporting & Analytics Dashboard</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Data Import/Export (Excel, PDF, CSV)</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Email Notifications</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Responsive Web Design</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Search & Filter Functions</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Audit Trail & Logging</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>API Integration (if needed)</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Free Domain (.com/.com.my) for 1 Year</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Free Hosting for 1 Year</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Free SSL Certificate</li>
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
                          <h6 className="text-primary"><i className="bi bi-file-text me-2"></i>Document Management System</h6>
                          <p className="small mb-0">Upload, organize, track, and share documents with version control and approval workflows.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 8,000 - RM 15,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-clipboard-check me-2"></i>Inventory Management System</h6>
                          <p className="small mb-0">Track stock levels, manage suppliers, generate reports, and automate reordering processes.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 10,000 - RM 20,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-people me-2"></i>HR Management System</h6>
                          <p className="small mb-0">Employee records, leave management, attendance tracking, payroll integration, and performance reviews.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 12,000 - RM 25,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-cash-coin me-2"></i>Accounting System</h6>
                          <p className="small mb-0">Invoice generation, expense tracking, financial reporting, and integration with banking systems.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 15,000 - RM 30,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-calendar-check me-2"></i>Booking/Reservation System</h6>
                          <p className="small mb-0">Online booking, calendar management, automated confirmations, and payment integration.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 8,000 - RM 18,000</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="text-primary"><i className="bi bi-mortarboard me-2"></i>Learning Management System</h6>
                          <p className="small mb-0">Course management, student enrollment, assignments, quizzes, and progress tracking.</p>
                          <p className="small text-muted mb-0 mt-2"><strong>Est. Price:</strong> RM 12,000 - RM 28,000</p>
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
                          <p className="mb-0">12 months free technical support via email, phone, and WhatsApp</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-tools text-primary me-2"></i>Warranty</h6>
                          <p className="mb-0">3 months warranty for bug fixes and system issues</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-book text-primary me-2"></i>Training</h6>
                          <p className="mb-0">Comprehensive user & admin training (multiple sessions as needed)</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-file-earmark-text text-primary me-2"></i>Documentation</h6>
                          <p className="mb-0">Complete user manual and technical documentation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info mt-3" style={{ fontSize: "0.875rem" }}>
                    <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-info-circle me-2"></i>Development Process</h6>
                    <ol className="mb-0">
                      <li>Requirements gathering & system analysis</li>
                      <li>Database & system design with approval</li>
                      <li>Development & weekly progress updates</li>
                      <li>User Acceptance Testing (UAT)</li>
                      <li>Training & go-live support</li>
                    </ol>
                  </div>

                  <div className="alert alert-warning mt-3" style={{ fontSize: "0.875rem" }}>
                    <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-exclamation-triangle me-2"></i>Additional Information</h6>
                    <ul className="mb-0">
                      <li>Domain & Hosting Renewal: RM 300-500/year (depending on usage)</li>
                      <li>Optional Maintenance Package: RM 200-500/month (after warranty period)</li>
                      <li>Additional features can be added after deployment</li>
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

