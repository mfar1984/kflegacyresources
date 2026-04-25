"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";

const TITLES = ["Mr.", "Mis.", "Ms", "Master", "Miss", "Dato'", "Datin", "Doctor", "Datuk", "Tun", "YB", "Puan Sri", "Toh Puan", "Dato Sri", "Puan", "Tuan"] as const;

export default function RequestQuotationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const SITE_KEY = "6LcTlOcrAAAAAHTY9FiiXUoYtt6ggAFyyRQ1xEuN";

  useEffect(() => {
    const w = window as unknown as { grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> } };
    if (!w.grecaptcha) return;
    const gre = w.grecaptcha;
    gre.ready(() => {
      gre.execute(SITE_KEY, { action: "contact" }).then((token: string) => {
        const input = document.querySelector<HTMLInputElement>("#g-recaptcha-token");
        if (input) input.value = token;
      });
    });
  }, []);

  return (
    <main className="main">
      {/* Hero / Page Title */}
      <section className="contact-hero">
        <div className="container" data-aos="fade-up">
          <h1>Request Quotation</h1>
          <p className="mb-0 contact-lead">Tell us what you need and we&apos;ll prepare a quotation tailored to your requirements.</p>
        </div>
      </section>

      {/* Quote Form */}
      <section className="section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Request Quotation / Contact Us</h2>
        <p className="mb-0 contact-lead">Share your details and scope. We&apos;ll respond within one business day.</p>
      </div>
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-5">
            <div className="p-4 p-lg-4 contact-info-card h-100">
              <div className="contact-info-icon mb-3">
                <i className="bi bi-receipt"></i>
              </div>
              <div className="mb-3">
                <span className="contact-badge-open"><i className="bi bi-clock"></i> Office Hours</span>
              </div>
              <ul className="list-unstyled contact-hours mb-4">
                <li><span>Monday</span><span>8am–5pm</span></li>
                <li><span>Tuesday</span><span>8am–5pm</span></li>
                <li><span>Wednesday</span><span>8am–5pm</span></li>
                <li><span>Thursday</span><span>8am–5pm</span></li>
                <li><span>Friday</span><span>8am–5pm</span></li>
                <li><span>Saturday - Sunday</span><span className="contact-badge-closed">Closed</span></li>
              </ul>

              <div className="mb-3">
                <span className="section-title-mini">Office</span>
                <p className="mb-1">SUITE: 33-01, 33RD FLOOR,<br/>
                MENARA KECK SENG 203 JALAN BUKIT BINTANG , 55100 KUALA<br/>
                LUMPUR, WILAYAH PERSEKUTUAN - <a className="map-link" href="https://maps.app.goo.gl/DA2EY9UzUv8vJztr6" target="_blank" rel="noopener">Maps</a></p>
              </div>
              <div>
                <span className="section-title-mini">Branch</span>
                <p className="mb-0">No. 12B, Lot 1732, Block 4,<br/>2nd Floor, Jalan Kampung dato,<br/>96000, Sibu, Sarawak, Malaysia - <a className="map-link" href="https://www.google.com/maps?q=2%C2%B018'42.8%22N+111%C2%B049'15.9%22E" target="_blank" rel="noopener">Maps</a></p>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="p-4 p-lg-5 bg-white rounded-3 border shadow-sm position-relative overflow-hidden contact-form">
              <div className="position-absolute" style={{ inset: 0, pointerEvents: 'none', background: 'radial-gradient(800px 800px at -10% 20%, rgba(71,178,228,.12), transparent 60%), radial-gradient(600px 600px at 110% 10%, rgba(55,81,126,.10), transparent 60%)', transform: 'translateZ(0)' }} />
              <form ref={formRef} className="row g-3 position-relative" onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                setProgress(0);
                setError(null);

                try {
                  // Get reCAPTCHA token
                  const w = window as unknown as { grecaptcha?: { execute: (key: string, opts: { action: string }) => Promise<string> } };
                  let token = '';
                  if (w.grecaptcha) {
                    token = await w.grecaptcha.execute(SITE_KEY, { action: "quotation" });
                  }

                  // Simulate progress
                  const progressInterval = setInterval(() => {
                    setProgress(prev => {
                      if (prev >= 90) return prev;
                      return prev + Math.random() * 15;
                    });
                  }, 200);

                  // Prepare form data
                  const formData = new FormData(formRef.current!);
                  formData.append('g-recaptcha-token', token);

                  // Submit to API
                  const response = await fetch('/api/quotation', {
                    method: 'POST',
                    body: formData,
                  });

                  clearInterval(progressInterval);
                  setProgress(100);

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to submit request');
                  }

                  // Success
                  setTimeout(() => {
                    setSubmitting(false);
                    setShowSuccess(true);
                    formRef.current?.reset();
                    
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                      setShowSuccess(false);
                      setProgress(0);
                    }, 5000);
                  }, 500);

                } catch (err) {
                  setSubmitting(false);
                  setProgress(0);
                  setError(err instanceof Error ? err.message : 'An error occurred');
                  setTimeout(() => setError(null), 5000);
                }
              }}>
                <div className="col-md-3">
                  <label className="form-label">Select your Title</label>
                  <select className="form-select" name="title" required>
                    <option value="">Choose…</option>
                    {TITLES.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">First Name</label>
                  <input className="form-control" type="text" name="firstName" required />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Last Name</label>
                  <input className="form-control" type="text" name="lastName" required />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Hp Number</label>
                  <input className="form-control" type="tel" name="hpNumber" placeholder="0123456789" required />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" name="email" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Company Name</label>
                  <input className="form-control" type="text" name="companyName" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Company Address</label>
                  <input className="form-control" type="text" name="companyAddress" />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Office Tel</label>
                  <input className="form-control" type="tel" name="officeTel" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Office Fax</label>
                  <input className="form-control" type="tel" name="officeFax" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Website</label>
                  <input className="form-control" type="url" name="website" placeholder="https://" />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Upload Document (pdf, png, jpeg, jpg — max 30MB)</label>
                  <input className="form-control" type="file" name="document" accept="application/pdf,image/png,image/jpeg" />
                </div>

                <div className="col-12">
                  <label className="form-label">Requirements / Questions</label>
                  <textarea className="form-control" name="question" rows={5} required></textarea>
                  <small className="text-secondary d-block mt-2">This page is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</small>
                </div>

                <div className="col-12 d-flex justify-content-end">
                  <button className="btn btn-primary px-4 py-2" type="submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Progress Modal */}
      {submitting && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-body text-center p-5">
                <div className="mb-4">
                  <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <h4 className="mb-3">Sending Your Request</h4>
                <div className="progress mb-3" style={{ height: '25px' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                    role="progressbar" 
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  >
                    {Math.round(progress)}%
                  </div>
                </div>
                <p className="text-muted mb-0">Please wait while we process your quotation request...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-body text-center p-5">
                <div className="mb-4">
                  <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-check-lg text-white" style={{ fontSize: '3rem' }}></i>
                  </div>
                </div>
                <h3 className="text-success mb-3">Request Submitted Successfully!</h3>
                <p className="text-muted mb-4">
                  Thank you for your quotation request. We&apos;ve received your inquiry and sent a confirmation email to your address.
                </p>
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Our team will review your request and respond within 24 hours.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className="toast show" role="alert">
            <div className="toast-header bg-danger text-white">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong className="me-auto">Error</strong>
              <button type="button" className="btn-close btn-close-white" onClick={() => setError(null)}></button>
            </div>
            <div className="toast-body">
              {error}
            </div>
          </div>
        </div>
      )}

      <Script src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`} strategy="afterInteractive" />
      <style>{`.grecaptcha-badge{left:16px !important; right:auto !important; bottom:16px !important;}`}</style>
    </main>
  );
}


