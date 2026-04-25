"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

// Product categories
const categories = [
  { id: "all", name: "All Products", icon: "bi-grid-fill" },
  { id: "networking", name: "Networking", icon: "bi-router" },
  { id: "security", name: "Security", icon: "bi-shield-lock" },
  { id: "programming", name: "Programming", icon: "bi-code-slash" },
];

// Product type definitions
interface ProductOption {
  name: string;
  label: string;
  options: string[];
  prices?: { [key: string]: number }; // Optional price adjustments
}

interface Product {
  id: number;
  name: string;
  categories: string[];
  basePrice?: number;
  priceLabel?: string;
  image: string;
  description: string;
  stock: string;
  rating: number;
  options?: ProductOption[];
}

// Netgate pfSense Products
const products: Product[] = [
  {
    id: 1,
    name: "Netgate 1100 pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 899,
    image: "/assets/img/store/netgate1100/sg-1100_fronttopangle1_80d4b75d-176d-4074-98e3-1b44b83484d2_1024x1024.webp",
    description: "Compact and powerful pfSense+ security gateway for home and small office",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "powerCord",
        label: "Power Cord",
        options: ["USA (IEC Type B)", "EURO (IEC Type E/F)", "UK (IEC Type G)", "None"],
      },
    ],
  },
  {
    id: 2,
    name: "Netgate 2100 BASE pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 1299,
    image: "/assets/img/store/netgate2100/SG-2100frontAngled_1024x1024.webp",
    description: "Entry-level enterprise security gateway with BASE configuration",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "powerCord",
        label: "Power Cord",
        options: ["USA (IEC Type B)", "EURO (IEC Type E/F)", "UK (IEC Type G)", "None"],
      },
    ],
  },
  {
    id: 3,
    name: "Netgate 2100 MAX pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 1699,
    image: "/assets/img/store/netgate2100/SG-2100frontAngled_1024x1024.webp",
    description: "Enhanced performance model with MAX configuration",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "powerCord",
        label: "Power Cord",
        options: ["USA (IEC Type B)", "EURO (IEC Type E/F)", "UK (IEC Type G)", "None"],
      },
    ],
  },
  {
    id: 4,
    name: "Netgate 4200 MAX pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 2499,
    image: "/assets/img/store/netgate4200/4200_front_corner_angle.jpg",
    description: "Most versatile security gateway - 8.75 Gbps routing, 4x 2.5GbE ports, silent operation",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "mountKit",
        label: "Mount Kit",
        options: ["None", "Wall Mount Kit"],
      },
      {
        name: "powerCord",
        label: "Power Cord",
        options: ["USA (IEC Type A)", "EURO (IEC Type E/F)", "UK (IEC Type G)", "AUS/NZ (IEC Type I)"],
      },
    ],
  },
  {
    id: 5,
    name: "Netgate 6100 BASE pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 3299,
    image: "/assets/img/store/netgate6100/6100_front_angle.jpg",
    description: "High-performance security gateway BASE model - 18.5 Gbps routing, 8 independent ports",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "mountKit",
        label: "Mount Kit",
        options: ["None", "Wall Mount Kit", "Rack Mount Installed"],
      },
      {
        name: "powerCord",
        label: "Power Cord",
        options: ["USA (IEC Type B)", "EURO (IEC Type E/F)", "UK (IEC Type G)", "None"],
      },
    ],
  },
  {
    id: 6,
    name: "Netgate 6100 MAX pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 3799,
    image: "/assets/img/store/netgate6100/6100_front_head-on.jpg",
    description: "Maximum performance 6100 series with 128GB NVMe SSD - enhanced storage for advanced features",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "mountKit",
        label: "Mount Kit",
        options: ["None", "Wall Mount Kit", "Rack Mount Installed"],
      },
      {
        name: "powerCord",
        label: "Power Cord",
        options: ["USA (IEC Type B)", "EURO (IEC Type E/F)", "UK (IEC Type G)", "None"],
      },
    ],
  },
  {
    id: 7,
    name: "Netgate 8200 MAX pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 4999,
    image: "/assets/img/store/netgate8200/8200_front_angle.jpg",
    description: "Enterprise-grade 1U rackmount - Intel 8-core, 16GB RAM, 128GB NVMe",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "powerCord",
        label: "Power Cord",
        options: ["USA (IEC Type B)", "EURO (IEC Type E/F)", "UK (IEC Type G)", "None"],
      },
    ],
  },
  {
    id: 8,
    name: "Netgate 8300 BASE pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 5999,
    image: "/assets/img/store/netgate8300/8300_front_angle.jpg",
    description: "Top-tier 1U rackmount with 25/100GbE expansion - Intel 8-core processor",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "expansionCard",
        label: "Expansion Card",
        options: [
          "None (left) / 2-Port 25GbE SFP28 Card (right)",
          "None (left port) / 2-Port 100GbE QSFP28 Card (right)",
          "2-Port 25GbE SFP28 Card (left) / None (right)",
          "2-Port 25GbE SFP28 Card (left) / 2-Port 25GbE SFP28 Card (right)",
          "2-Port 25GbE SFP28 Card (left) / 2-Port 100GbE QSFP28 Card (right)",
        ],
      },
    ],
  },
  {
    id: 9,
    name: "Netgate 8300 MAX pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 6999,
    image: "/assets/img/store/netgate8300/8300_front_head-on.jpg",
    description: "Maximum performance 8300 with 128GB NVMe and full expansion options",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "expansionCard",
        label: "Expansion Card",
        options: [
          "None (left) / 2-Port 25GbE SFP28 Card (right)",
          "None (left port) / 2-Port 100GbE QSFP28 Card (right)",
          "2-Port 25GbE SFP28 Card (left) / None (right)",
          "2-Port 25GbE SFP28 Card (left) / 2-Port 25GbE SFP28 Card (right)",
          "2-Port 25GbE SFP28 Card (left) / 2-Port 100GbE QSFP28 Card (right)",
        ],
      },
    ],
  },
  {
    id: 10,
    name: "Netgate 8300 TAA pfSense+ Security Gateway",
    categories: ["networking", "security"],
    basePrice: 7499,
    image: "/assets/img/store/netgate8300/8300_front_top_angle.jpg",
    description: "TAA-compliant model for government and enterprise - fully certified",
    stock: "Pre Order",
    rating: 5,
    options: [
      {
        name: "expansionCard",
        label: "Expansion Card",
        options: [
          "None (left) / 2-Port 25GbE SFP28 Card (right)",
          "None (left port) / 2-Port 100GbE QSFP28 Card (right)",
          "2-Port 25GbE SFP28 Card (left) / None (right)",
          "2-Port 25GbE SFP28 Card (left) / 2-Port 25GbE SFP28 Card (right)",
          "2-Port 25GbE SFP28 Card (left) / 2-Port 100GbE QSFP28 Card (right)",
        ],
      },
    ],
  },
  {
    id: 11,
    name: "Basic Website Profile Company",
    categories: ["programming"],
    basePrice: 750,
    image: "/assets/img/hero-img.png",
    description: "Professional company profile website with hosting and domain included",
    stock: "In-Stock",
    rating: 5,
  },
  {
    id: 12,
    name: "E-Commerce Website",
    categories: ["programming"],
    basePrice: 1500,
    image: "/assets/img/hero-img.png",
    description: "Complete e-commerce solution with hosting and domain included",
    stock: "In-Stock",
    rating: 5,
  },
  {
    id: 13,
    name: "Web Based System",
    categories: ["programming"],
    priceLabel: "RM 5,000 - RM 35,000",
    image: "/assets/img/hero-img.png",
    description: "Custom web-based system tailored to your needs - hosting and domain included",
    stock: "In-Stock",
    rating: 5,
  },
  {
    id: 14,
    name: "Web Based System + Android",
    categories: ["programming"],
    priceLabel: "RM 5,000 - RM 55,000",
    image: "/assets/img/hero-img.png",
    description: "Full-stack web and Android app solution - hosting and domain included",
    stock: "In-Stock",
    rating: 5,
  },
];

export default function StorePage() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Store selected options for each product
  const [productSelections, setProductSelections] = useState<{ [key: number]: { [key: string]: string } }>({});

  // Handle Add to Cart
  const handleAddToCart = (product: Product) => {
    const selectedOptions = getSelectedOptions(product.id);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.basePrice || 0,
      priceLabel: product.priceLabel,
      image: product.image,
      selectedOptions,
    });
    
    // Show success message (optional - you can use toast or alert)
    alert(`${product.name} added to cart!`);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.categories.includes(selectedCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Handle option change for a product
  const handleOptionChange = (productId: number, optionName: string, value: string) => {
    setProductSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [optionName]: value,
      },
    }));
  };

  // Get selected options for a product
  const getSelectedOptions = (productId: number) => {
    return productSelections[productId] || {};
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/background/store.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">KF Legacy Store</h1>
              <p className="text-justify">
                Your trusted partner for enterprise networking, security, and IT infrastructure solutions. Browse our selection of professional-grade 
                equipment from leading manufacturers. All products come with official warranty, expert support, and professional deployment services.
              </p>
              <div className="d-flex">
                <a href="#products" className="btn-get-started">Browse Products</a>
                <a href="/request-quotation" className="btn-watch-video d-flex align-items-center ms-3">
                  <i className="bi bi-envelope"></i>
                  <span>Request Quote</span>
                </a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/store-hero.png" className="img-fluid animated" alt="KF Legacy Store" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section light-background">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-3" data-aos="fade-up" data-aos-delay="0">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-patch-check display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Genuine Products</h5>
                <p className="small text-muted mb-0">100% authentic products with official manufacturer warranty</p>
              </div>
            </div>
            <div className="col-md-3" data-aos="fade-up" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-gear-wide-connected display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Flexible Configuration</h5>
                <p className="small text-muted mb-0">Customizable options to match your requirements</p>
              </div>
            </div>
            <div className="col-md-3" data-aos="fade-up" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-tools display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Professional Services</h5>
                <p className="small text-muted mb-0">Expert installation, configuration, and deployment</p>
              </div>
            </div>
            <div className="col-md-3" data-aos="fade-up" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-headset display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Local Support</h5>
                <p className="small text-muted mb-0">Dedicated technical support in Malaysia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section id="products" className="section">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12 text-center" data-aos="fade-up">
              <h2 className="mb-3">Product Catalog</h2>
              <p className="text-muted">Browse our selection of enterprise-grade networking and security solutions</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="row mb-4" data-aos="fade-up" data-aos-delay="100">
            <div className="col-12">
              <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`btn ${selectedCategory === category.id ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <i className={`bi ${category.icon} me-2`}></i>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <div className="row mb-4" data-aos="fade-up" data-aos-delay="200">
            <div className="col-md-8 mx-auto mb-3">
              <div className="input-group input-group-lg">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Netgate pfSense products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="row g-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const selectedOptions = getSelectedOptions(product.id);
                
                return (
                  <div key={product.id} className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay={index * 50}>
                    <div className="card h-100 shadow-sm product-card">
                      <div className="card-img-top bg-white p-4 text-center" style={{ height: "280px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div className="card-body d-flex flex-column">
                        <div className="mb-2">
                          <span className={`badge ${product.stock === "In-Stock" || product.stock === "In Stock" ? "bg-success" : product.stock === "Limited Stock" ? "bg-warning" : "bg-info"} mb-2`}>
                            {product.stock}
                          </span>
                        </div>
                        <h5 className="card-title mb-2" style={{ fontSize: "0.95rem", minHeight: "2.8rem", lineHeight: "1.4" }}>
                          {product.name}
                        </h5>
                        <p className="card-text text-muted small mb-3" style={{ minHeight: "3rem" }}>
                          {product.description}
                        </p>
                        <div className="mb-3">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`bi bi-star${i < product.rating ? "-fill" : ""} text-warning`}></i>
                          ))}
                        </div>

                        {/* Product Options/Dropdowns */}
                        {product.options && product.options.length > 0 && (
                          <div className="mb-3">
                            {product.options.map((option) => (
                              <div key={option.name} className="mb-2">
                                <label className="form-label small text-muted mb-1">
                                  <i className="bi bi-gear me-1"></i>
                                  {option.label}
                                </label>
                                <select
                                  className="form-select form-select-sm"
                                  value={selectedOptions[option.name] || option.options[0]}
                                  onChange={(e) => handleOptionChange(product.id, option.name, e.target.value)}
                                >
                                  {option.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto">
                          <div className="text-center mb-3 p-2 bg-light rounded">
                            <h5 className="text-primary mb-0">
                              {product.basePrice ? formatPrice(product.basePrice) : (product.priceLabel || "Contact for Price")}
                            </h5>
                          </div>
                          <div className="d-grid gap-2">
                            <button 
                              onClick={() => handleAddToCart(product)} 
                              className="btn btn-success btn-sm"
                            >
                              <i className="bi bi-cart-plus me-2"></i>Add to Cart
                            </button>
                            <a 
                              href={
                                product.id === 1 ? "/store/netgate-1100" : 
                                product.id === 2 ? "/store/netgate-2100-base" : 
                                product.id === 3 ? "/store/netgate-2100-max" :
                                product.id === 4 ? "/store/netgate-4200-max" :
                                product.id === 5 ? "/store/netgate-6100-base" :
                                product.id === 6 ? "/store/netgate-6100-max" :
                                product.id === 7 ? "/store/netgate-8200-max" :
                                product.id === 8 ? "/store/netgate-8300-base" :
                                product.id === 9 ? "/store/netgate-8300-max" :
                                product.id === 10 ? "/store/netgate-8300-taa" :
                                product.id === 11 ? "/store/basic-website" :
                                product.id === 12 ? "/store/ecommerce-website" :
                                product.id === 13 ? "/store/web-based-system" :
                                product.id === 14 ? "/store/web-based-system-android" :
                                "#"
                              } 
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="bi bi-info-circle me-2"></i>View Details
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                <h4 className="text-muted">No products found</h4>
                <p className="text-muted">Try adjusting your search criteria</p>
              </div>
            )}
          </div>

          {/* Results Count */}
          {filteredProducts.length > 0 && (
            <div className="row mt-4">
              <div className="col-12 text-center">
                <p className="text-muted">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Buy From Us Section */}
      <section className="section dark-background">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <h2 className="text-white mb-3">Why Choose KF Legacy Resources?</h2>
              <p className="text-white-50">Your trusted partner for IT infrastructure solutions in Malaysia</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-right">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-award display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Authorized Partner</h5>
                  <p className="text-white-50 small mb-0">Official distributor and partner for leading technology brands. All products come with official manufacturer warranty and comprehensive support packages.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-person-badge display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Certified Engineers</h5>
                  <p className="text-white-50 small mb-0">Our team includes certified professionals with years of enterprise deployment experience. Get expert advice on solution design, sizing, and implementation.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-right" data-aos-delay="100">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-wrench-adjustable display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Complete Deployment Services</h5>
                  <p className="text-white-50 small mb-0">From site survey to rack installation and advanced configuration. We handle the technical complexity including migration, integration, and optimization for you.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left" data-aos-delay="100">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-headset display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Ongoing Support & Maintenance</h5>
                  <p className="text-white-50 small mb-0">Local technical support in Bahasa Malaysia and English. Emergency support, regular updates, preventive maintenance, and system health checks available.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section light-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="zoom-in">
              <div className="p-5 rounded-3 bg-primary text-white">
                <h3 className="mb-3">Need Help Choosing?</h3>
                <p className="mb-4">Our experts are here to help you find the perfect solution for your business needs. Get a free consultation and customized quote today.</p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <a href="/request-quotation" className="btn btn-light btn-lg">
                    <i className="bi bi-envelope me-2"></i>Request Quotation
                  </a>
                  <a href="/contact" className="btn btn-outline-light btn-lg">
                    <i className="bi bi-telephone me-2"></i>Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .product-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: none;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        }
        .btn {
          transition: all 0.3s ease;
        }
      `}</style>
    </main>
  );
}

