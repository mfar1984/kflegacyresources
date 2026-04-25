"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const reference = searchParams?.get('reference');

  useEffect(() => {
    // Verify payment status with CHIP API and update database
    if (reference) {
      console.log(`🔍 Verifying cancelled/viewed payment for: ${reference}`);
      
      fetch('/api/chip/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      })
        .then(res => {
          console.log(`📡 verify-payment response status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log('✅ Payment verification response:', data);
          console.log(`📊 DB Status: ${data.status}, CHIP Status: ${data.chipStatus}`);
          
          if (data.status === 'viewed' || data.status === 'pending') {
            console.log(`✅ Order ${reference} updated to VIEWED (payment page abandoned)`);
          } else {
            console.warn(`⚠️  Expected 'viewed' but got: ${data.status}`);
          }
        })
        .catch(error => {
          console.error('❌ Payment verification error:', error);
          console.error('Error details:', error.message);
        });
    } else {
      console.warn('⚠️  No reference provided on cancelled page');
    }
  }, [reference]);

  return (
    <main className="main">
      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card text-center">
                <div className="card-body p-5">
                  <div className="mb-4">
                    <i className="bi bi-dash-circle-fill display-1 text-warning"></i>
                  </div>
                  <h2 className="mb-3">Payment Cancelled</h2>
                  <p className="lead mb-4">
                    You have cancelled the payment process.
                  </p>
                  
                  {reference && (
                    <div className="alert alert-info">
                      <strong>Order Reference:</strong> {reference}
                    </div>
                  )}

                  <div className="mb-4">
                    <p>Your order has been saved but not yet paid.</p>
                    <p className="small text-muted">You can return to complete the payment anytime, or modify your cart.</p>
                  </div>

                  <div className="d-grid gap-2 d-md-block">
                    <Link href="/checkout" className="btn btn-primary me-2">
                      <i className="bi bi-arrow-repeat me-2"></i>Try Again
                    </Link>
                    <Link href="/cart" className="btn btn-outline-primary me-2">
                      <i className="bi bi-cart me-2"></i>View Cart
                    </Link>
                    <Link href="/store" className="btn btn-outline-secondary">
                      <i className="bi bi-shop me-2"></i>Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="card mt-4">
                <div className="card-body">
                  <h5 className="card-title">Need Help?</h5>
                  <p className="card-text small">
                    If you&apos;re experiencing any issues with the checkout process, please contact our support team.
                  </p>
                  <Link href="/contact" className="btn btn-sm btn-primary">
                    <i className="bi bi-headset me-2"></i>Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<div className="container py-5"><div className="text-center">Loading...</div></div>}>
      <PaymentCancelledContent />
    </Suspense>
  );
}

