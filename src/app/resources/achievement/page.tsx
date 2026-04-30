'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AchievementAward {
  id: number;
  award_name: string;
  category: string;
  issuer: string;
  file_type: string;
  file_size: string;
  description: string;
  view_hash: string;
}

export default function AchievementPage() {
  const [awards, setAwards] = useState<AchievementAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAward, setSelectedAward] = useState<AchievementAward | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const response = await fetch('/api/public/achievement-awards');
      if (response.ok) {
        const data = await response.json();
        setAwards(data.awards || []);
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('government') || cat.includes('kerajaan')) {
      return { icon: 'bi-trophy-fill', color: 'text-warning', bg: 'bg-warning' };
    }
    if (cat.includes('private') || cat.includes('swasta')) {
      return { icon: 'bi-award-fill', color: 'text-primary', bg: 'bg-primary' };
    }
    if (cat.includes('international') || cat.includes('antarabangsa')) {
      return { icon: 'bi-globe', color: 'text-success', bg: 'bg-success' };
    }
    if (cat.includes('industry') || cat.includes('industri')) {
      return { icon: 'bi-star-fill', color: 'text-info', bg: 'bg-info' };
    }
    if (cat.includes('excellence') || cat.includes('kecemerlangan')) {
      return { icon: 'bi-gem', color: 'text-purple', bg: 'bg-purple' };
    }
    if (cat.includes('innovation') || cat.includes('inovasi')) {
      return { icon: 'bi-lightbulb-fill', color: 'text-danger', bg: 'bg-danger' };
    }
    return { icon: 'bi-patch-check-fill', color: 'text-secondary', bg: 'bg-secondary' };
  };

  const handleViewAward = (award: AchievementAward) => {
    setSelectedAward(award);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAward(null);
  };

  useEffect(() => {
    // Add global CSS to prevent selection in PDF modal
    const style = document.createElement('style');
    style.innerHTML = `
      #achievementPdfModal * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      #achievementPdfModal iframe {
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
          backgroundImage: 'url(/assets/img/achievement.png)',
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
              <h1 className="with-separator">Achievement &amp; Awards</h1>
              <p className="text-justify">Celebrating our journey of excellence and recognition in the engineering and construction industry. Our achievements reflect our commitment to quality, innovation, and customer satisfaction.</p>
              <div className="d-flex">
                <a href="#achievements" className="btn-get-started">View Achievements</a>
                <a href="/about" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>About Us</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image 
                src="/assets/img/achievement-hero.png" 
                className="img-fluid animated" 
                alt="Achievement & Awards" 
                width={800} 
                height={600} 
                priority 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Awards Library Section */}
      <section id="achievements" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Achievement Awards Library</h2>
          <p>Official recognition letters and awards from government, private sector, and organizations</p>
        </div>
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3">Loading achievement awards...</p>
            </div>
          ) : awards.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-trophy display-1 text-muted mb-4"></i>
              <h5 className="text-muted">No achievement awards available at this time</h5>
              <p className="text-muted">Check back later for updates</p>
            </div>
          ) : (
            <div className="row g-4">
              {awards.map((award, index) => {
                const iconStyle = getCategoryIcon(award.category);
                return (
                  <div key={award.id} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex align-items-start mb-3">
                          <i className={`bi ${iconStyle.icon} display-5 ${iconStyle.color} me-3`}></i>
                          <div className="flex-grow-1">
                            <h6 className="mb-2" style={{ fontSize: '14px' }}>{award.award_name}</h6>
                            <p className="text-muted mb-2" style={{ fontSize: '11px' }}>{award.description}</p>
                            <div className="mb-2">
                              <span className="badge bg-info me-2" style={{ fontSize: '10px' }}>{award.category}</span>
                              <span className="text-muted" style={{ fontSize: '10px' }}>{award.file_size}</span>
                            </div>
                            <div className="text-muted" style={{ fontSize: '10px' }}>
                              <i className="bi bi-building me-1"></i>
                              <strong>Issued by:</strong> {award.issuer}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewAward(award)}
                          className="btn btn-primary btn-sm mt-auto"
                          style={{ fontSize: '12px' }}
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i>View Award Letter
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

      {/* Call to Action */}
      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5">
                  <i className="bi bi-briefcase display-4 text-primary mb-4"></i>
                  <h3 className="mb-3">Join Our Success Story</h3>
                  <p className="text-muted mb-4">
                    Explore career opportunities and be part of our award-winning team. We are always looking for talented individuals passionate about engineering excellence.
                  </p>
                  <Link href="/career" className="btn btn-primary btn-lg">
                    <i className="bi bi-arrow-right-circle me-2"></i>View Career Opportunities
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Award PDF Modal */}
      {showModal && selectedAward && (
        <div
          className="modal fade show d-block"
          id="achievementPdfModal"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          aria-hidden="false"
          aria-labelledby="achievementPdfModalLabel"
          tabIndex={-1}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); alert('⚠️ Right-click is disabled for this confidential document'); return false; }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '800px', height: '90vh', margin: '1rem auto' }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
          >
            <div
              className="modal-content"
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
            >
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title text-white" id="achievementPdfModalLabel">
                  <i className="bi bi-trophy me-2"></i>{selectedAward.award_name} - Confidential
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal} aria-label="Close"></button>
              </div>
              <div
                className="modal-body p-0"
                style={{ position: 'relative', padding: 0, flex: '1 1 auto', height: 0, minHeight: 0, overflow: 'hidden' }}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); alert('⚠️ Right-click is disabled for this confidential document'); return false; }}
              >
                <AchievementPdfViewer hash={selectedAward.view_hash} />
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

function AchievementPdfViewer({ hash }: { hash: string }) {
  useEffect(() => {
    // Block screenshot keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') { e.preventDefault(); alert('⚠️ Screenshot disabled for confidential document'); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5'].includes(e.key)) { e.preventDefault(); alert('⚠️ Screenshot disabled for confidential document'); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); alert('⚠️ Printing disabled for confidential document'); }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Block F12, Ctrl+Shift+I (DevTools)
    const blockDevTools = (e: KeyboardEvent) => {
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I')) { e.preventDefault(); }
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
        src={`/api/public/achievement-awards/view/${hash}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Achievement Award PDF - Confidential"
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
