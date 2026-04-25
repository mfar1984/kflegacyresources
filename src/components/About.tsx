"use client";

import { useEffect } from 'react';

export default function About() {
  useEffect(() => {
    // Add global CSS to prevent selection in PDF modal
    const style = document.createElement('style');
    style.innerHTML = `
      #ssmPdfModal * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      #ssmPdfModal iframe {
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section id="about" className="about section about-animated">
      <span className="float float-1"></span>
      <span className="float float-2"></span>
      <span className="float float-3"></span>
      <div className="container section-title" data-aos="fade-up">
        <h2>About Us</h2>
      </div>

      <div className="container">
        <div className="row gy-4 align-items-stretch">
          {/* Who We Are (full original text) */}
          <div className="col-lg-7" data-aos="fade-up" data-aos-delay="100">
            <h3 className="mb-3">Who We Are</h3>
            <div className="text-justify">
              <p>KF LEGACY RESOURCES was established in <strong>November 2015</strong>. We provide network service management to help clients focus on their core business while we deliver reliable, scalable support.</p>
              <p>At KF Legacy Resources, we strive to deliver the best service experience so clients meet high expectations and feel confident in the outcomes.</p>
              <p>We provide network infrastructure, management, security and technical support — from standalone networks to WAN — connecting branches securely with cost‑efficient, high‑speed networking.</p>
              <p className="mb-0">Through consultation, we deliver effective solutions aligned to each client’s objectives. Every customer is unique; we build long‑term trust by tailoring approaches to their potential, vision and goals.</p>
              <p className="mt-3 text-justify mb-0">
                KF Legacy Resources with Registration Number: <strong>201503318537 (002488335-X)</strong> valid until <strong>14 November 2029</strong>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary ms-3 align-baseline"
                  data-bs-toggle="modal"
                  data-bs-target="#ssmPdfModal"
                >
                  View SSM (PDF)
                </button>
              </p>
            </div>
          </div>

          {/* At a Glance (card) */}
          <div className="col-lg-5" data-aos="fade-up" data-aos-delay="150">
            <div className="h-100 p-4 bg-body-tertiary rounded-3 border">
              <h4 className="h6 text-uppercase text-secondary mb-3">At a Glance</h4>
              <ul className="list-unstyled mb-0">
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>Established 2015</span></li>
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>Network infrastructure &amp; management</span></li>
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>Security &amp; technical support</span></li>
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>WAN &amp; inter-branch connectivity</span></li>
                <li className="d-flex"><i className="bi bi-check2-circle text-primary me-2"></i><span>Client-first, long-term partnership</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sub-features & stats for visual interest (optional) */}
        <div className="row row-cols-1 row-cols-md-3 g-4 mt-2" data-aos="fade-up" data-aos-delay="200">
          <div className="col">
            <div className="p-4 h-100 bg-white rounded-3 border shadow-sm feature-card">
              <div className="d-flex align-items-center mb-2"><i className="bi bi-shield-lock text-primary fs-4 me-2"></i><h5 className="h6 mb-0">Security First</h5></div>
              <p className="mb-0 text-justify">Hardened designs, monitoring and assessments to protect your network and data.</p>
            </div>
          </div>
          <div className="col">
            <div className="p-4 h-100 bg-white rounded-3 border shadow-sm feature-card">
              <div className="d-flex align-items-center mb-2"><i className="bi bi-hdd-network text-primary fs-4 me-2"></i><h5 className="h6 mb-0">Scalable Infrastructure</h5></div>
              <p className="mb-0 text-justify">From standalone networks to WAN, architectures that grow with your business.</p>
            </div>
          </div>
          <div className="col">
            <div className="p-4 h-100 bg-white rounded-3 border shadow-sm feature-card">
              <div className="d-flex align-items-center mb-2"><i className="bi bi-people text-primary fs-4 me-2"></i><h5 className="h6 mb-0">Trusted Delivery</h5></div>
              <p className="mb-0 text-justify">Outcomes, timelines and communication you can trust.</p>
            </div>
          </div>
        </div>

        <div className="row text-center mt-4" data-aos="fade-up" data-aos-delay="250">
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary counter" data-target="10">10+</div><div className="small text-secondary">Years Experience</div></div>
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary counter" data-target="50">50+</div><div className="small text-secondary">Projects Delivered</div></div>
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary counter" data-target="5">5</div><div className="small text-secondary">Core Domains</div></div>
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary">100%</div><div className="small text-secondary">Client Commitment</div></div>
        </div>
      </div>
      {/* SSM PDF Modal */}
      <div 
        className="modal fade" 
        id="ssmPdfModal" 
        aria-hidden="true" 
        aria-labelledby="ssmPdfModalLabel" 
        tabIndex={-1}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          alert('⚠️ Right-click is disabled for this confidential document');
          return false;
        }}
      >
        <div 
          className="modal-dialog modal-dialog-centered" 
          style={{ maxWidth: '800px', height: '90vh', margin: '1rem auto' }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
        >
          <div 
            className="modal-content" 
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          >
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title text-white" id="ssmPdfModalLabel">
                <i className="bi bi-file-earmark-text me-2"></i>SSM Registration - Confidential
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div 
              className="modal-body p-0" 
              style={{ position: 'relative', padding: 0, flex: '1 1 auto', height: 0, minHeight: 0, overflow: 'hidden' }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('⚠️ Right-click is disabled for this confidential document');
                return false;
              }}
            >
              <SsmPdfViewer />
            </div>
            <div className="modal-footer bg-light">
              <div className="text-muted small me-auto">
                <i className="bi bi-shield-lock-fill me-1 text-danger"></i>
                <strong>Watermarked PDF:</strong> All copies contain permanent CONFIDENTIAL watermarks
              </div>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                <i className="bi bi-x-circle me-2"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SsmPdfViewer() {
  useEffect(() => {
    // Block screenshot keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Print Screen (Windows)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('⚠️ Screenshot disabled for confidential document');
      }
      // Block Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5 (Mac screenshots)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        alert('⚠️ Screenshot disabled for confidential document');
      }
      // Block Ctrl+P (Print)
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        alert('⚠️ Printing disabled for confidential document');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Block F12, Ctrl+Shift+I (DevTools)
    const blockDevTools = (e: KeyboardEvent) => {
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', blockDevTools);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', blockDevTools);
    };
  }, []);

  return (
    <div
      style={{ 
        position: 'relative', 
        userSelect: 'none' as const,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#525659'
      }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => { if (e.button === 2) e.preventDefault(); }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Watermarked PDF from API */}
      <iframe
        src="/api/pdf/watermark-ssm"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="SSM Registration PDF - Confidential"
      />
      
      {/* Screenshot Protection Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(220, 53, 69, 0.95)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          zIndex: 10000,
          pointerEvents: 'none',
          userSelect: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          border: '2px solid rgba(255,255,255,0.3)'
        }}
      >
        <i className="bi bi-shield-lock-fill me-2"></i>
        CONFIDENTIAL - WATERMARKED
      </div>
    </div>
  );
}



