'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

interface Download {
  id: number;
  file_name: string;
  file_type: string;
  file_size: string;
  description: string;
  download_hash: string;
}

export default function DownloadPage() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Download modal states
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState<Download | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const response = await fetch('/api/public/downloads');
      if (response.ok) {
        const data = await response.json();
        setDownloads(data.downloads);
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = (download: Download) => {
    setSelectedDownload(download);
    setShowDownloadModal(true);
  };

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Request unique download token
      const response = await fetch('/api/public/download/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          download_id: selectedDownload?.id,
          client_name: clientName,
          client_email: clientEmail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { download_token } = data;

        // Trigger download with unique token
        const link = document.createElement('a');
        link.href = `/api/public/download/${selectedDownload?.download_hash}?token=${download_token}`;
        link.download = selectedDownload?.file_name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Notify admins
        try {
          const socket = getSocket();
          socket.emit('task_submitted', {
            module: 'downloads',
            action: 'request',
            entityId: selectedDownload?.id || null,
            message: `Download requested – ${selectedDownload?.file_name}`,
            view: 'downloads'
          });
        } catch {}

        // Reset and close modal
        setShowDownloadModal(false);
        setClientName('');
        setClientEmail('');
        setSelectedDownload(null);
      } else {
        alert('Failed to initiate download. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting download:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toUpperCase();
    switch (type) {
      case 'PDF':
        return { icon: 'bi-file-earmark-pdf', color: 'text-danger', bg: 'bg-danger' };
      case 'EXE':
        return { icon: 'bi-app-indicator', color: 'text-primary', bg: 'bg-primary' };
      case 'MSI':
        return { icon: 'bi-app-indicator', color: 'text-purple', bg: 'bg-purple' };
      case 'ZIP':
        return { icon: 'bi-file-earmark-zip', color: 'text-warning', bg: 'bg-warning' };
      case 'RAR':
        return { icon: 'bi-file-earmark-zip', color: 'text-secondary', bg: 'bg-secondary' };
      case 'ISO':
        return { icon: 'bi-disc', color: 'text-purple', bg: 'bg-purple' };
      case 'DMG':
        return { icon: 'bi-apple', color: 'text-dark', bg: 'bg-dark' };
      case 'PNG':
      case 'JPEG':
      case 'JPG':
        return { icon: 'bi-file-earmark-image', color: 'text-pink', bg: 'bg-pink' };
      case 'XLSX':
      case 'XLS':
        return { icon: 'bi-file-earmark-excel', color: 'text-success', bg: 'bg-success' };
      case 'DOCX':
      case 'DOC':
        return { icon: 'bi-file-earmark-word', color: 'text-info', bg: 'bg-info' };
      case 'PPTX':
      case 'PPT':
        return { icon: 'bi-file-earmark-ppt', color: 'text-warning', bg: 'bg-warning' };
      default:
        return { icon: 'bi-file-earmark', color: 'text-secondary', bg: 'bg-secondary' };
    }
  };
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/documentation.png)',
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
              <h1 className="with-separator">Download</h1>
              <p className="text-justify">Download our comprehensive technical documentation, implementation guides, and resources. Access the information you need to successfully plan, execute, and maintain your engineering projects.</p>
              <div className="d-flex">
                <a href="#docs" className="btn-get-started">Browse Downloads</a>
                <a href="/resources/faq" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>View FAQs</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image 
                src="/assets/img/documentation-hero.png?v2" 
                className="img-fluid animated" 
                alt="Download" 
                width={800} 
                height={600} 
                priority 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Download Library */}
      <section id="docs" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Download Library</h2>
          <p>Browse and download files, documents, and software</p>
        </div>
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No downloads available at the moment.</p>
            </div>
          ) : (
            <div className="row g-4">
              {downloads.map((download, index) => {
                const fileStyle = getFileIcon(download.file_type);
                return (
                  <div key={download.id} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex align-items-start mb-3">
                          <i className={`bi ${fileStyle.icon} display-5 ${fileStyle.color} me-3`}></i>
                          <div className="flex-grow-1">
                            <h6 className="mb-2" style={{ fontSize: '14px' }}>{download.file_name}</h6>
                            <p className="text-muted mb-2" style={{ fontSize: '11px' }}>{download.description}</p>
                            <span className={`badge ${fileStyle.bg} me-2`} style={{ fontSize: '10px' }}>{download.file_type}</span>
                            <span className="text-muted" style={{ fontSize: '10px' }}>{download.file_size}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadClick(download)}
                          className="btn btn-primary btn-sm mt-auto" 
                          style={{ fontSize: '12px' }}
                        >
                          <i className="bi bi-download me-1"></i>Download
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
              <h2 className="text-white mb-4">Need Technical Support?</h2>
              <p className="text-white-50 mb-4">Can&apos;t find what you&apos;re looking for? Our technical team is ready to assist you with documentation and implementation guidance.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/contact" className="btn btn-light btn-lg">
                  <i className="bi bi-headset me-2"></i>Contact Support
                </Link>
                <Link href="/resources/faq" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-question-circle me-2"></i>View FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Modal */}
      {showDownloadModal && selectedDownload && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 600 }}>
                  <i className="bi bi-download me-2 text-primary"></i>Download: {selectedDownload.file_name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDownloadModal(false);
                    setClientName('');
                    setClientEmail('');
                  }}
                ></button>
              </div>
              <form onSubmit={handleDownloadSubmit}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <p className="text-muted mb-4" style={{ fontSize: '13px' }}>
                    Please provide your details to proceed with the download. This helps us track usage and improve our services.
                  </p>
                  <div className="mb-3">
                    <label htmlFor="clientName" className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="clientEmail" className="form-label" style={{ fontSize: '12px', fontWeight: 500 }}>
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="clientEmail"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      required
                      placeholder="Enter your email address"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                  <div className="alert alert-info d-flex align-items-start" style={{ fontSize: '11px', padding: '12px' }}>
                    <i className="bi bi-info-circle me-2" style={{ fontSize: '16px' }}></i>
                    <div>
                      <strong>Privacy Notice:</strong> Your information will only be used for download tracking and will not be shared with third parties.
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDownloadModal(false);
                      setClientName('');
                      setClientEmail('');
                    }}
                    disabled={isSubmitting}
                    style={{ fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ fontSize: '13px' }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-download me-2"></i>Proceed to Download
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

