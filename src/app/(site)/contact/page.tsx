"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const TITLES = ["Mr.", "Mis.", "Ms", "Master", "Miss", "Dato'", "Datin", "Doctor", "Datuk", "Tun", "YB", "Puan Sri", "Toh Puan", "Dato Sri", "Puan", "Tuan"] as const;

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
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
          <h1>Contact Us</h1>
          <p className="mb-0 contact-lead">Talk to our team about your needs. We aim to respond within one business day.</p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Get in Touch</h2>
        <p className="mb-0 contact-lead">We&apos;d love to hear from you. Share your details and question, and we&apos;ll respond promptly.</p>
      </div>
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-5">
            <div className="p-4 p-lg-4 contact-info-card h-100">
              <div className="contact-info-icon mb-3">
                <i className="bi bi-headset"></i>
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
                <p className="mb-1">SUITE: 33-01, 33RD FLOOR,<br/>MENARA KECK SENG 203 JALAN BUKIT BINTANG , 55100 KUALA<br/>LUMPUR, WILAYAH PERSEKUTUAN - <a className="map-link" href="https://maps.app.goo.gl/DA2EY9UzUv8vJztr6" target="_blank" rel="noopener">Maps</a></p>
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
              <form className="row g-3 position-relative" onSubmit={(e) => {
                e.preventDefault();
                const w = window as unknown as { grecaptcha?: { execute: (key: string, opts: { action: string }) => Promise<string> } };
                if (w.grecaptcha) {
                  w.grecaptcha.execute(SITE_KEY, { action: "contact" }).then((token: string) => {
                    const input = document.querySelector<HTMLInputElement>("#g-recaptcha-token");
                    if (input) input.value = token;
                    setSubmitting(true);
                    setTimeout(() => setSubmitting(false), 1500);
                  });
                } else {
                  setSubmitting(true);
                  setTimeout(() => setSubmitting(false), 1500);
                }
              }}>
                <div className="col-md-3">
                  <label className="form-label">Select your Title</label>
                  <select className="form-select" required>
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
                  <input className="form-control" type="tel" name="hp" placeholder="0123456789" required />
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
                  <label className="form-label">Company Email</label>
                  <input className="form-control" type="email" name="companyEmail" />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Website</label>
                  <input className="form-control" type="url" name="website" placeholder="https://" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Upload Document (pdf, png, jpeg, jpg — max 30MB)</label>
                  <input className="form-control" type="file" name="file" accept="application/pdf,image/png,image/jpeg" />
                </div>

                <div className="col-12">
                  <label className="form-label">Ask your question</label>
                  <textarea className="form-control" name="question" rows={5} required></textarea>
                  <small className="text-secondary d-block mt-2">This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</small>
                </div>
                <input type="hidden" id="g-recaptcha-token" name="g-recaptcha-token" />

                <div className="col-12 d-flex justify-content-end">
                  <button className="btn btn-primary px-4" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Send Message'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      </section>
      <Script src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`} strategy="afterInteractive" />
      <style>{`.grecaptcha-badge{left:16px !important; right:auto !important; bottom:16px !important;}`}</style>
    </main>
  );
}


