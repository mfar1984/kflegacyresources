"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const reference = searchParams?.get('reference');

  useEffect(() => {
    // Verify payment status with CHIP API and update database
    if (reference) {
      console.log(`🔍 Verifying failed payment for: ${reference}`);
      
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
          
          if (data.status === 'failed') {
            console.log(`✅ Order ${reference} confirmed as FAILED in database`);
          } else {
            console.warn(`⚠️  Expected 'failed' but got: ${data.status}`);
          }
        })
        .catch(error => {
          console.error('❌ Payment verification error:', error);
          console.error('Error details:', error.message);
        });
    } else {
      console.warn('⚠️  No reference provided on failed page');
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
                    <i className="bi bi-x-circle-fill display-1 text-danger"></i>
                  </div>
                  <h2 className="mb-3">Payment Failed</h2>
                  <p className="lead mb-4">
                    We&apos;re sorry, but your payment could not be processed.
                  </p>
                  
                  {reference && (
                    <div className="alert alert-warning">
                      <strong>Order Reference:</strong> {reference}
                    </div>
                  )}

                  <div className="mb-4">
                    <p>This could be due to one of the following reasons:</p>
                    <ul className="text-start small">
                      <li>Insufficient funds in your account</li>
                      <li>Incorrect payment details</li>
                      <li>Your bank declined the transaction</li>
                      <li>Network or connection issue</li>
                    </ul>
                  </div>

                  <div className="d-grid gap-2 d-md-block">
                    <Link href="/checkout" className="btn btn-primary me-2">
                      <i className="bi bi-arrow-repeat me-2"></i>Try Again
                    </Link>
                    <Link href="/cart" className="btn btn-outline-primary me-2">
                      <i className="bi bi-cart me-2"></i>View Cart
                    </Link>
                    <Link href="/contact" className="btn btn-outline-secondary">
                      <i className="bi bi-headset me-2"></i>Contact Support
                    </Link>
                  </div>
                </div>
              </div>

              {/* Alternative Payment Options */}
              <div className="card mt-4">
                <div className="card-body">
                  <h5 className="card-title">Need Alternative Payment Methods?</h5>
                  <p className="card-text small">
                    If you&apos;re experiencing payment issues, you can also:
                  </p>
                  <ul className="small">
                    <li>Request a quotation and pay via bank transfer</li>
                    <li>Contact our sales team for alternative payment arrangements</li>
                  </ul>
                  <Link href="/request-quotation" className="btn btn-sm btn-primary">
                    <i className="bi bi-envelope me-2"></i>Request Quotation
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

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="container py-5"><div className="text-center">Loading...</div></div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}

