"use client";

import { useState } from "react";
import Image from "next/image";

interface CertificateViewerProps {
  category: string;
  title: string;
  pageCount: number;
}

export default function CertificateViewer({ category, title, pageCount }: CertificateViewerProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleViewCertificate = () => {
    setCurrentPage(1);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <button 
        onClick={handleViewCertificate}
        className="btn btn-outline-primary btn-sm"
      >
        <i className="bi bi-eye me-2"></i>View Certificate
      </button>

      {showModal && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'block', 
            backgroundColor: 'rgba(0,0,0,0.8)' 
          }}
          onClick={handleClose}
        >
          <div 
            className="modal-dialog modal-xl modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {title} - Page {currentPage} of {pageCount}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleClose}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center p-0" style={{ backgroundColor: '#f5f5f5' }}>
                <div className="position-relative" style={{ minHeight: '500px' }}>
                  <Image
                    src={`/assets/img/certificates/${category}-${currentPage}.png`}
                    alt={`${title} - Page ${currentPage}`}
                    width={1200}
                    height={800}
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      maxHeight: '80vh',
                      objectFit: 'contain'
                    }}
                    priority
                  />
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-secondary"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left me-2"></i>Previous
                </button>
                
                <div className="d-flex gap-2">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={handleNext}
                  disabled={currentPage === pageCount}
                >
                  Next<i className="bi bi-chevron-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

