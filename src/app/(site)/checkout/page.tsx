"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, getTotalItems } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    
    // Billing Address
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "MY",
    
    // Bank Details (Optional - for refunds)
    bankAccount: "",
    bankCode: "",
    bankHolderName: "",
    
    // Additional
    notes: "",
  });
  
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      console.log('Submitting checkout...');
      console.log('Customer:', formData.email);
      console.log('Cart items:', cart.length);
      console.log('Total:', getTotalPrice());

      // Create payment with CHIP
      const response = await fetch('/api/chip/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerDetails: formData,
          cartItems: cart,
          totalAmount: getTotalPrice(),
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success && data.checkoutUrl) {
        console.log('✅ Payment created, redirecting to:', data.checkoutUrl);
        // Redirect to CHIP payment page
        window.location.href = data.checkoutUrl;
      } else {
        console.error('❌ Payment creation failed:', data);
        const errorMessage = data.details 
          ? `Payment creation failed: ${JSON.stringify(data.details)}` 
          : data.message || 'Payment creation failed. Please try again.';
        alert(errorMessage);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('💥 Checkout error:', error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Please try again'}`);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <style jsx>{`
        .order-summary-sticky {
          z-index: 1000 !important;
        }
      `}</style>
      <main className="main">
      {/* Page Title */}
      <div className="page-title" data-aos="fade">
        <div className="container">
          <h1>Checkout</h1>
        </div>
      </div>

      {/* Checkout Section */}
      <section className="section">
        <div className="container">
          {/* Breadcrumbs */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb" style={{ fontSize: "0.875rem" }}>
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/store">Store</Link></li>
              <li className="breadcrumb-item"><Link href="/cart">Cart</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Checkout</li>
            </ol>
          </nav>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Billing Details */}
              <div className="col-lg-8">
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0 text-white" style={{ fontSize: "0.875rem", color: "#fff" }}><i className="bi bi-person me-2"></i>Billing Details</h6>
                  </div>
                  <div className="card-body" style={{ fontSize: "0.875rem" }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>First Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ fontSize: "0.875rem" }}
                          name="firstName" 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>Last Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ fontSize: "0.875rem" }}
                          name="lastName" 
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>Email <span className="text-danger">*</span></label>
                        <input 
                          type="email" 
                          className="form-control" 
                          style={{ fontSize: "0.875rem" }}
                          name="email" 
                          value={formData.email}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>Phone <span className="text-danger">*</span></label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          style={{ fontSize: "0.875rem" }}
                          name="phone" 
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+60123456789"
                          required 
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>Address <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ fontSize: "0.875rem" }}
                          name="address" 
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Street address"
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>City <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ fontSize: "0.875rem" }}
                          name="city" 
                          value={formData.city}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>State <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          style={{ fontSize: "0.875rem" }}
                          name="state" 
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select State</option>
                          <option value="Johor">Johor</option>
                          <option value="Kedah">Kedah</option>
                          <option value="Kelantan">Kelantan</option>
                          <option value="Kuala Lumpur">Kuala Lumpur</option>
                          <option value="Labuan">Labuan</option>
                          <option value="Malacca">Malacca</option>
                          <option value="Negeri Sembilan">Negeri Sembilan</option>
                          <option value="Pahang">Pahang</option>
                          <option value="Penang">Penang</option>
                          <option value="Perak">Perak</option>
                          <option value="Perlis">Perlis</option>
                          <option value="Putrajaya">Putrajaya</option>
                          <option value="Sabah">Sabah</option>
                          <option value="Sarawak">Sarawak</option>
                          <option value="Selangor">Selangor</option>
                          <option value="Terengganu">Terengganu</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>Postcode <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ fontSize: "0.875rem" }}
                          name="postcode" 
                          value={formData.postcode}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>Country</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ fontSize: "0.875rem" }}
                          value="Malaysia" 
                          disabled 
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>Order Notes (Optional)</label>
                        <textarea 
                          className="form-control" 
                          style={{ fontSize: "0.875rem" }}
                          name="notes" 
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Notes about your order, e.g. special delivery instructions"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details (Optional - for refunds) */}
                <div className="card mb-4">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0" style={{ fontSize: "0.875rem" }}>
                      <i className="bi bi-bank me-2"></i>Bank Details (Optional)
                    </h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => setShowBankDetails(!showBankDetails)}
                    >
                      {showBankDetails ? (
                        <><i className="bi bi-chevron-up me-1"></i>Hide</>
                      ) : (
                        <><i className="bi bi-chevron-down me-1"></i>Add for faster refunds</>
                      )}
                    </button>
                  </div>
                  {showBankDetails && (
                    <div className="card-body" style={{ fontSize: "0.875rem" }}>
                      <div className="alert alert-info" style={{ fontSize: "0.75rem" }}>
                        <i className="bi bi-info-circle me-2"></i>
                        Providing your bank details allows us to process refunds instantly if needed. This information is securely stored and only used for refund purposes.
                      </div>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label" style={{ fontSize: "0.875rem" }}>Bank</label>
                          <select
                            className="form-select"
                            style={{ fontSize: "0.875rem" }}
                            name="bankCode"
                            value={formData.bankCode}
                            onChange={handleInputChange}
                          >
                            <option value="">Select your bank</option>
                            <option value="MBBEMYKL">Maybank (Malayan Banking Berhad)</option>
                            <option value="CIBBMYKL">CIMB Bank</option>
                            <option value="PBBEMYKL">Public Bank</option>
                            <option value="RHBBMYKL">RHB Bank</option>
                            <option value="HLBBMYKL">Hong Leong Bank</option>
                            <option value="AMBBMYKL">AmBank (M) Berhad</option>
                            <option value="UOVBMYKL">UOB Malaysia</option>
                            <option value="OCBCMYKL">OCBC Bank Malaysia</option>
                            <option value="BIMBMYKL">Bank Islam Malaysia</option>
                            <option value="BKRMMYKL">Bank Rakyat</option>
                            <option value="BMMBMYKL">Bank Muamalat Malaysia</option>
                            <option value="AFBQMYKL">Affin Bank</option>
                            <option value="ARBKMYKL">Alliance Bank Malaysia</option>
                            <option value="BSNAMYK1">Bank Simpanan Nasional</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label" style={{ fontSize: "0.875rem" }}>Account Number</label>
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: "0.875rem" }}
                            name="bankAccount"
                            value={formData.bankAccount}
                            onChange={handleInputChange}
                            placeholder="1234567890"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label" style={{ fontSize: "0.875rem" }}>Account Holder Name</label>
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: "0.875rem" }}
                            name="bankHolderName"
                            value={formData.bankHolderName}
                            onChange={handleInputChange}
                            placeholder="As per bank account"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="col-lg-4">
                <div className="card sticky-top order-summary-sticky" style={{ top: "100px" }}>
                  <div className="card-header bg-light">
                    <h6 className="mb-0" style={{ fontSize: "0.875rem" }}>Order Summary</h6>
                  </div>
                  <div className="card-body">
                    {/* Cart Items */}
                    <div className="mb-3" style={{ fontSize: "0.875rem" }}>
                      {cart.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom">
                          <div className="flex-grow-1">
                            <div className="mb-1">{item.name}</div>
                            <div className="text-muted">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">
                              {item.priceLabel || formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr />

                    {/* Totals */}
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.875rem" }}>
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span className="fw-bold">{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.875rem" }}>
                      <span className="text-muted">Shipping</span>
                      <span className="text-muted">To be calculated</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4" style={{ fontSize: "1rem" }}>
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold text-primary">{formatPrice(getTotalPrice())}</span>
                    </div>

                    {/* Payment Info */}
                    <div className="alert alert-info mb-3" style={{ fontSize: "0.75rem" }}>
                      <i className="bi bi-shield-check me-2"></i>
                      <strong>Secure Payment</strong>
                      <p className="mb-0 mt-1">Powered by CHIP - Malaysia&apos;s trusted payment gateway</p>
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ fontSize: "0.875rem" }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-credit-card me-2"></i>
                            Place Order
                          </>
                        )}
                      </button>
                      <Link href="/cart" className="btn btn-outline-secondary" style={{ fontSize: "0.875rem" }}>
                        <i className="bi bi-arrow-left me-2"></i>Back to Cart
                      </Link>
                    </div>

                    <div className="mt-3 text-center" style={{ fontSize: "0.75rem" }}>
                      <div className="text-muted">
                        By placing your order, you agree to our{" "}
                        <Link href="/terms-of-use" className="text-primary">Terms &amp; Conditions</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
    </>
  );
}

