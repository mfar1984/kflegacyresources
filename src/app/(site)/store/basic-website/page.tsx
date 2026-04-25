"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export default function BasicWebsitePage() {
  const [mainImage] = useState("/assets/img/hero-img.png");
  const { addToCart } = useCart();

  const product = {
    id: 11,
    name: "Basic Website Profile Company",
    price: 750,
    image: "/assets/img/hero-img.png",
    description: "Professional company profile website with hosting and domain included",
    stock: "In-Stock",
    rating: 5,
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <main className="main">
      {/* Page Title */}
      <div className="page-title" data-aos="fade">
        <div className="container">
          <h1>Basic Website Profile Company</h1>
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
              <li className="breadcrumb-item active" aria-current="page">Basic Website</li>
            </ol>
          </nav>

          <div className="row">
            {/* Product Images */}
            <div className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <img 
                    src={mainImage} 
                    alt="Basic Website" 
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
                      <span style={{ fontSize: "0.95rem" }}>Price:</span>
                      <h3 className="text-primary mb-0" style={{ fontSize: "2rem" }}>{formatPrice(product.price)}</h3>
                    </div>
                  </div>

                  <div className="d-grid gap-2 mb-4">
                    <button 
                      onClick={handleAddToCart}
                      className="btn btn-success btn-lg"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <i className="bi bi-cart-plus me-2"></i>Add to Cart
                    </button>
                    <Link href="/request-quotation" className="btn btn-outline-primary" style={{ fontSize: "0.875rem" }}>
                      <i className="bi bi-envelope me-2"></i>Request Custom Quote
                    </Link>
                  </div>

                  <div className="alert alert-info" style={{ fontSize: "0.875rem" }}>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Included:</strong> Hosting + Domain for 1 year
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
                  <button className="nav-link" style={{ fontSize: "0.875rem" }} id="specifications-tab" data-bs-toggle="tab" data-bs-target="#specifications" type="button" role="tab">
                    Specifications
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
                  <h5 style={{ fontSize: "1rem" }} className="mb-3">What&apos;s Included</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Professional Design</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Responsive Layout (Mobile & Desktop)</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Up to 5 Pages</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Contact Form</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Google Maps Integration</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Free Domain (.com/.com.my) for 1 Year</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Free Hosting for 1 Year</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Free SSL Certificate</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>SEO Ready</li>
                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Basic Training</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="tab-pane fade" id="specifications" role="tabpanel">
                  <h5 style={{ fontSize: "1rem" }} className="mb-3">Technical Specifications</h5>
                  <table className="table table-bordered" style={{ fontSize: "0.875rem" }}>
                    <tbody>
                      <tr>
                        <td className="fw-bold" style={{ width: "30%" }}>Pages Included</td>
                        <td>Home, About Us, Services, Contact, Gallery (Total: 5 pages)</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Technology</td>
                        <td>HTML5, CSS3, JavaScript, Bootstrap</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Hosting</td>
                        <td>1 GB Storage, Unlimited Bandwidth</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Domain</td>
                        <td>.com or .com.my (1 year free)</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Email Accounts</td>
                        <td>3 Professional Email Accounts</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Delivery Time</td>
                        <td>7-14 Working Days</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Revisions</td>
                        <td>Up to 3 rounds of revisions</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="tab-pane fade" id="support" role="tabpanel">
                  <h5 style={{ fontSize: "1rem" }} className="mb-3">Support & Maintenance</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-headset text-primary me-2"></i>Technical Support</h6>
                          <p className="mb-0">3 months free technical support via email and phone</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-tools text-primary me-2"></i>Maintenance</h6>
                          <p className="mb-0">Optional maintenance package available after launch</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-book text-primary me-2"></i>Training</h6>
                          <p className="mb-0">Basic content management training included</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-arrow-repeat text-primary me-2"></i>Updates</h6>
                          <p className="mb-0">Content updates available at additional cost</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-warning mt-3" style={{ fontSize: "0.875rem" }}>
                    <h6 style={{ fontSize: "0.95rem" }}><i className="bi bi-exclamation-triangle me-2"></i>Renewal Information</h6>
                    <p className="mb-0">Domain and hosting renewal required after 1 year. Renewal costs approximately RM 150-200/year.</p>
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

