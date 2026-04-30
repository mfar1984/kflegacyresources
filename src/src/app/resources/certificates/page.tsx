'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Certificate {
  id: number;
  certificate_name: string;
  category: string;
  file_type: string;
  file_size: string;
  description: string;
  view_hash: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/public/certificates');
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('registration') || cat.includes('business')) {
      return { icon: 'bi-building', color: 'text-primary' };
    }
    if (cat.includes('license') || cat.includes('permit')) {
      return { icon: 'bi-award', color: 'text-success' };
    }
    if (cat.includes('iso') || cat.includes('quality')) {
      return { icon: 'bi-shield-check', color: 'text-info' };
    }
    if (cat.includes('safety') || cat.includes('environmental')) {
      return { icon: 'bi-shield-exclamation', color: 'text-warning' };
    }
    return { icon: 'bi-file-earmark-text', color: 'text-secondary' };
  };

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCertificate(null);
  };

  useEffect(() => {
    // Add global CSS to prevent selection in PDF modal
    const style = document.createElement('style');
    style.innerHTML = `
      #certificatePdfModal * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      #certificatePdfModal iframe {
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/downloads.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Certificates</h1>
              <p className="text-justify">View and download our official certificates, registrations, and licenses. All certificates are verified and up-to-date, demonstrating our compliance with industry standards and regulations.</p>
              <div className="d-flex">
                <a href="#documents" className="btn-get-started">Browse Certificates</a>
                <a href="/contact" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>Need Help?</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image 
                src="/assets/img/downloads-hero.png" 
                className="img-fluid animated" 
                alt="Certificates" 
                width={800} 
                height={600} 
                priority 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Certificates Library - 3 Column Grid */}
      <section id="documents" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Certificates Library</h2>
          <p>Browse and view our official certificates and registrations</p>
        </div>
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No certificates available at the moment.</p>
            </div>
          ) : (
            <div className="row g-4">
              {certificates.map((certificate, index) => {
                const iconStyle = getCategoryIcon(certificate.category);
                return (
                  <div key={certificate.id} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-start mb-3">
                          <i className={`bi ${iconStyle.icon} display-5 ${iconStyle.color} me-3`}></i>
                    <div className="flex-grow-1">
                            <h6 className="mb-2" style={{ fontSize: '14px' }}>{certificate.certificate_name}</h6>
                            <p className="text-muted mb-2" style={{ fontSize: '11px' }}>{certificate.description}</p>
                            <span className="badge bg-info me-2" style={{ fontSize: '10px' }}>{certificate.category}</span>
                            <span className="text-muted" style={{ fontSize: '10px' }}>{certificate.file_size}</span>
                    </div>
                  </div>
                        <button
                          onClick={() => handleViewCertificate(certificate)}
                          className="btn btn-primary btn-sm mt-auto"
                          style={{ fontSize: '12px' }}
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i>View Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
                      </div>
      </section>

      {/* Contact Support */}
      <section className="section dark-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="zoom-in">
              <h2 className="text-white mb-4">Need Verification?</h2>
              <p className="text-white-50 mb-4">Need to verify any of our certificates or require additional documentation? Our team is ready to assist you with any queries regarding our certifications and registrations.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/contact" className="btn btn-light btn-lg">
                  <i className="bi bi-headset me-2"></i>Contact Us
                </Link>
                <Link href="/resources/faq" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-question-circle me-2"></i>View FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate PDF Modal */}
      {showModal && selectedCertificate && (
        <div 
          className="modal fade show d-block" 
          id="certificatePdfModal" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          aria-hidden="false" 
          aria-labelledby="certificatePdfModalLabel" 
          tabIndex={-1}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert('⚠️ Right-click is disabled for this confidential document');
            return false;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
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
                <h5 className="modal-title text-white" id="certificatePdfModalLabel">
                  <i className="bi bi-file-earmark-text me-2"></i>{selectedCertificate.certificate_name} - Confidential
                      </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal} aria-label="Close"></button>
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
                <CertificatePdfViewer hash={selectedCertificate.view_hash} />
                    </div>
              <div className="modal-footer bg-light">
                <div className="text-muted small me-auto">
                  <i className="bi bi-shield-lock-fill me-1 text-danger"></i>
                  <strong>Watermarked PDF:</strong> All copies contain permanent CONFIDENTIAL watermarks
                </div>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  <i className="bi bi-x-circle me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CertificatePdfViewer({ hash }: { hash: string }) {
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
        src={`/api/public/certificates/view/${hash}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Certificate PDF - Confidential"
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
