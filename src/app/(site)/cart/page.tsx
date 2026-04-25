"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const [isClient, setIsClient] = useState(false);

  // Ensure component is mounted on client
  useState(() => {
    setIsClient(true);
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <style jsx>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        .order-summary-sticky {
          z-index: 1000 !important;
        }
      `}</style>
      <main className="main">
        {/* Page Title */}
        <div className="page-title" data-aos="fade">
          <div className="container">
            <h1>Shopping Cart</h1>
          </div>
        </div>

      {/* Cart Section */}
      <section className="section">
        <div className="container">
          {/* Breadcrumbs */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb" style={{ fontSize: "0.9rem" }}>
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/store">Store</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Shopping Cart</li>
            </ol>
          </nav>
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cart-x text-muted mb-4" style={{ fontSize: "4rem" }}></i>
              <h4 className="mb-3" style={{ fontSize: "1.25rem" }}>Your cart is empty</h4>
              <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>Add some products to your cart to see them here</p>
              <Link href="/store" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>
                <i className="bi bi-shop me-2"></i>Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="row">
              {/* Cart Items */}
              <div className="col-lg-8">
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0 text-white" style={{ fontSize: "1rem", color: "#fff" }}><i className="bi bi-cart3 me-2"></i>Cart Items ({getTotalItems()})</h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0" style={{ fontSize: "0.875rem" }}>
                        <thead className="bg-light">
                          <tr>
                            <th style={{ width: "15%" }}>Image</th>
                            <th style={{ width: "30%" }}>Product</th>
                            <th style={{ width: "20%" }}>Price</th>
                            <th style={{ width: "20%", textAlign: "center" }}>Quantity</th>
                            <th style={{ width: "15%", textAlign: "center" }}>Total</th>
                            <th style={{ width: "5%" }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="img-fluid rounded" 
                                  style={{ maxHeight: "80px", objectFit: "contain" }} 
                                />
                              </td>
                              <td>
                                <div className="mb-1" style={{ fontWeight: "500" }}>{item.name}</div>
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                  <div className="small text-muted">
                                    {Object.entries(item.selectedOptions).map(([key, value]) => (
                                      <div key={key}>
                                        <strong>{key}:</strong> {value}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td>
                                {item.priceLabel || formatPrice(item.price)}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div className="input-group mx-auto" style={{ maxWidth: "120px" }}>
                                  <button 
                                    className="btn btn-outline-secondary btn-sm" 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <i className="bi bi-dash"></i>
                                  </button>
                                  <input 
                                    type="number" 
                                    className="form-control form-control-sm" 
                                    style={{ 
                                      textAlign: "center", 
                                      padding: "0.375rem 0.5rem",
                                      MozAppearance: "textfield"
                                    }}
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                    min="1"
                                  />
                                  <button 
                                    className="btn btn-outline-secondary btn-sm" 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                              </td>
                              <td className="fw-bold" style={{ textAlign: "center" }}>
                                {item.priceLabel ? "Contact for Price" : formatPrice(item.price * item.quantity)}
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeFromCart(item.id)}
                                  title="Remove from cart"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Continue Shopping */}
                <Link href="/store" className="btn btn-outline-primary" style={{ fontSize: "0.875rem" }}>
                  <i className="bi bi-arrow-left me-2"></i>Continue Shopping
                </Link>
              </div>

              {/* Cart Summary */}
              <div className="col-lg-4">
                <div className="card sticky-top order-summary-sticky" style={{ top: "100px" }}>
                  <div className="card-header bg-light">
                    <h6 className="mb-0" style={{ fontSize: "0.875rem" }}>Order Summary</h6>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.875rem" }}>
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span className="fw-bold">{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.875rem" }}>
                      <span className="text-muted">Shipping</span>
                      <span className="text-muted">Calculated at checkout</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4" style={{ fontSize: "1rem" }}>
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold text-primary">{formatPrice(getTotalPrice())}</span>
                    </div>
                    
                    <div className="d-grid gap-2">
                      <Link href="/checkout" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>
                        <i className="bi bi-credit-card me-2"></i>Proceed to Checkout
                      </Link>
                      <Link href="/request-quotation" className="btn btn-outline-secondary" style={{ fontSize: "0.875rem" }}>
                        <i className="bi bi-envelope me-2"></i>Request Quotation
                      </Link>
                    </div>

                    <div className="alert alert-info mt-4 mb-0" style={{ fontSize: "0.75rem" }}>
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Note:</strong> For products with &quot;Contact for Price&quot;, please request a quotation or contact our sales team.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section bg-light py-4">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-3">
              <i className="bi bi-shield-check text-primary mb-2" style={{ fontSize: "2.5rem" }}></i>
              <h6 style={{ fontSize: "0.875rem" }}>Secure Payment</h6>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>Your payment information is secure</p>
            </div>
            <div className="col-md-3 mb-3">
              <i className="bi bi-truck text-primary mb-2" style={{ fontSize: "2.5rem" }}></i>
              <h6 style={{ fontSize: "0.875rem" }}>Fast Delivery</h6>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>Quick and reliable shipping</p>
            </div>
            <div className="col-md-3 mb-3">
              <i className="bi bi-arrow-repeat text-primary mb-2" style={{ fontSize: "2.5rem" }}></i>
              <h6 style={{ fontSize: "0.875rem" }}>Easy Returns</h6>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>30-day return policy</p>
            </div>
            <div className="col-md-3 mb-3">
              <i className="bi bi-headset text-primary mb-2" style={{ fontSize: "2.5rem" }}></i>
              <h6 style={{ fontSize: "0.875rem" }}>24/7 Support</h6>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>We&apos;re here to help</p>
            </div>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

