"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    let ok = false;
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      ok = res.ok;
      if (!ok) {
        const t = await res.text();
        console.error('Subscribe API error:', t);
      }
    } catch (err) {
      console.error('Subscribe failed', err);
    }

    if (ok) {
      // Show thank you message only when API succeeds
      setShowThankYou(true);
      setEmail("");
    }

    // Hide after 5 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 5000);
  };

  return (
    <footer id="footer" className="footer">
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <Link href="/" className="d-flex align-items-center">
              <Image src="/assets/img/footerlogo.png" alt="KF Legacy Resources" width={200} height={100} />
            </Link>
            <div className="footer-contact pt-3">
              <p className="mb-1">SUITE: 33-01, 33RD FLOOR,</p>
              <p className="mb-2">MENARA KECK SENG 203 JALAN BUKIT BINTANG , 55100 KUALA<br/>
              LUMPUR, WILAYAH PERSEKUTUAN - <a className="map-link" href="https://maps.app.goo.gl/DA2EY9UzUv8vJztr6" target="_blank" rel="noopener">Maps</a></p>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Legal</h4>
            <ul>
              <li><i className="bi bi-chevron-right"></i> <Link href="/disclaimer">Disclaimer</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/privacy">Privacy</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/terms-of-use">Terms of Use</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/sitemap">Sitemap</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Our Services</h4>
            <ul>
              <li><i className="bi bi-chevron-right"></i> <Link href="/network">Network</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/security">Security</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/system-storage">System Storage</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/other-services/it-programming">Programming</Link></li>
            </ul>
          </div>
          <div className="col-lg-4 col-md-12">
            <h4>Follow Us</h4>
            <p className="mb-3">Stay updated with our latest news.</p>
            
            <form onSubmit={handleSubscribe} className="mb-3" style={{maxWidth: '320px'}}>
              <div className="input-group input-group-sm">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="btn btn-danger" type="submit">
                  Subscribe
                </button>
              </div>
            </form>

            {showThankYou && (
              <div className="alert alert-success py-2 px-3 mb-3 small" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>Thank you for subscribing!
              </div>
            )}

            <div className="social-links d-flex">
              <a href="https://www.facebook.com/kflr2015/" target="_blank" rel="noopener" title="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="mailto:enquiry@kflegacyresources.com" title="Email"><i className="bi bi-envelope"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


