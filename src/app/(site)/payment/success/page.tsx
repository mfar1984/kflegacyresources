"use client";

import Link from "next/link";
import { useEffect, Suspense, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const reference = searchParams?.get('reference');
  const hasCleared = useRef(false);

  useEffect(() => {
    // Clear cart only once after successful payment
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }

    // Verify payment status with CHIP API and update database
    if (reference) {
      fetch('/api/chip/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Payment verification:', data);
          if (data.status === 'paid') {
            console.log(`✅ Order ${reference} confirmed as PAID in database`);
          }
        })
        .catch(error => {
          console.error('❌ Payment verification failed:', error);
        });
    }
  }, [clearCart, reference]);

  return (
    <main className="main">
      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card text-center">
                <div className="card-body p-5">
                  <div className="mb-4">
                    <i className="bi bi-check-circle-fill display-1 text-success"></i>
                  </div>
                  <h2 className="mb-3">Payment Successful!</h2>
                  <p className="lead mb-4">
                    Thank you for your purchase. Your order has been confirmed.
                  </p>
                  
                  {reference && (
                    <div className="alert alert-info">
                      <strong>Order Reference:</strong> {reference}
                    </div>
                  )}

                  <div className="mb-4">
                    <p>We&apos;ve sent a confirmation email to your registered email address.</p>
                    <p className="small text-muted">You will receive another email once your order has been shipped.</p>
                  </div>

                  <div className="d-grid gap-2 d-md-block">
                    <Link href="/store" className="btn btn-primary me-2">
                      <i className="bi bi-shop me-2"></i>Continue Shopping
                    </Link>
                    <Link href="/" className="btn btn-outline-primary">
                      <i className="bi bi-house me-2"></i>Back to Home
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="card mt-4">
                <div className="card-body">
                  <h5 className="card-title">Need Help?</h5>
                  <p className="card-text small">If you have any questions about your order, please contact our support team.</p>
                  <Link href="/contact" className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-envelope me-2"></i>Contact Support
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="container py-5"><div className="text-center">Loading...</div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

