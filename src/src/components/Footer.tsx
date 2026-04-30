"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }

    if (!fullName) {
      setMessage('Please enter your full name');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/public/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Thank you for subscribing!');
        setEmail('');
        setFullName('');
        setShowNameInput(false);
      } else {
        setMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer id="footer" className="footer">
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <Link href="/" className="d-flex align-items-center">
              <Image src="/assets/img/logo.png" alt="ANSAR TECHNOLOGIES SDN. BHD." width={150} height={40} />
            </Link>
            <div className="footer-contact pt-3">
              <p className="mb-1"><strong>Ansar Technologies Sdn. Bhd.</strong></p>
              <p className="mb-1">( 940482-W / 201101012342 )</p>
              <p className="mb-1">B2-1-34, Tingkat 1, Jalan Pinggiran 1/3</p>
              <p className="mb-1">Taman Pinggiran Putra,</p>
              <p className="mb-2">43300 Seri Kembangan, Selangor, Malaysia</p>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><i className="bi bi-chevron-right"></i> <Link href="/">Home</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/about-us">About Us</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/business/tenders">Tenders</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/resources/downloads">Resources</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/career">Career</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-3 footer-links">
            <h4>Our Services</h4>
            <ul>
              <li><i className="bi bi-chevron-right"></i> <Link href="/civil-engineering">Civil Engineering</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/mechanical-electrical-engineering">M&amp;E Engineering</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/ict-engineering">ICT Engineering</Link></li>
              <li><i className="bi bi-chevron-right"></i> <Link href="/project-management-consultancy">PM &amp; Consultancy</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-12">
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Follow Us</h4>
            <p style={{ fontSize: '11px', marginBottom: '16px', color: '#6c757d' }}>Stay updated with our latest news.</p>

            <form onSubmit={handleSubscribe} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '0', marginBottom: showNameInput ? '10px' : '0' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    fontSize: '11px',
                    border: '1px solid #dee2e6',
                    borderRadius: '2px 0 0 2px',
                    outline: 'none'
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0 2px 2px 0',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>

              {showNameInput && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '11px',
                    border: '1px solid #dee2e6',
                    borderRadius: '2px',
                    outline: 'none'
                  }}
                  required
                />
              )}

              {message && (
                <p style={{
                  fontSize: '11px',
                  marginTop: '8px',
                  marginBottom: '0',
                  color: message.includes('Thank you') ? '#28a745' : '#dc3545'
                }}>
                  {message}
                </p>
              )}
            </form>

            <div className="social-links d-flex" style={{ gap: '10px' }}>
              <a href="https://www.facebook.com/ansartec" target="_blank" rel="noopener noreferrer" title="Facebook" style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #dee2e6',
                borderRadius: '50%',
                color: '#495057',
                fontSize: '20px',
                transition: 'all 0.3s'
              }}>
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://www.tiktok.com/@ansartechnologies" target="_blank" rel="noopener noreferrer" title="TikTok" style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #dee2e6',
                borderRadius: '50%',
                color: '#495057',
                fontSize: '20px',
                transition: 'all 0.3s'
              }}>
                <i className="bi bi-tiktok"></i>
              </a>
              <a href="mailto:support@ansartechnologies.my" title="Email" style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #dee2e6',
                borderRadius: '50%',
                color: '#495057',
                fontSize: '20px',
                transition: 'all 0.3s'
              }}>
                <i className="bi bi-envelope"></i>
              </a>
              <a href="https://wa.me/601163440530" target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #dee2e6',
                borderRadius: '50%',
                color: '#495057',
                fontSize: '20px',
                transition: 'all 0.3s'
              }}>
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

