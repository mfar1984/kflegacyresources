"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = "6Lf7hforAAAAACCYb0lu0SkMooXlLhWY48_4mO7x";

export default function FloatingHelp() {
  const [showMenu, setShowMenu] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Client Registration
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    address: "",
    // Ticket Details
    subject: "",
    category: "",
    priority: "",
    description: "",
    attachments: [] as File[],
  });

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify reCAPTCHA
      if (!window.grecaptcha) {
        alert("Security verification not loaded. Please refresh the page and try again.");
        setIsSubmitting(false);
        return;
      }

      const recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: "submit_ticket",
      });

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('company_name', formData.company_name);
      submitData.append('contact_person', formData.contact_person);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('password', formData.password);
      submitData.append('address', formData.address);
      submitData.append('subject', formData.subject);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      submitData.append('description', formData.description);
      submitData.append('recaptcha_token', recaptchaToken);

      // Append attachments
      formData.attachments.forEach((file) => {
        submitData.append('attachments', file);
      });

      const response = await fetch('/api/public/helpdesk/submit', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit ticket');
      }

      alert(`✅ Ticket submitted successfully!\n\nTicket No: ${result.ticketNo}\n\nPlease check your email (${formData.email}) to verify your account and get your login credentials.`);
      
      setShowTicketModal(false);
      setFormData({
        company_name: "",
        contact_person: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
        address: "",
        subject: "",
        category: "",
        priority: "",
        description: "",
        attachments: [],
      });
    } catch (error: any) {
      console.error('Error submitting ticket:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/601163440530", "_blank");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, attachments: Array.from(e.target.files) });
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <div className="floating-help-container">
        {/* Help Menu */}
        {showMenu && (
          <div className="help-menu">
            <button
              className="help-menu-item"
              onClick={handleWhatsApp}
            >
              <i className="bi bi-whatsapp me-2"></i>
              WhatsApp
            </button>
            <button
              className="help-menu-item"
              onClick={() => {
                setShowTicketModal(true);
                setShowMenu(false);
              }}
            >
              <i className="bi bi-ticket-detailed me-2"></i>
              Submit Ticket
            </button>
          </div>
        )}

        {/* Main Help Button */}
        <button
          className="floating-help-btn"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Help"
        >
          {showMenu ? (
            <i className="bi bi-x-lg"></i>
          ) : (
            <i className="bi bi-question-circle"></i>
          )}
        </button>
      </div>

      {/* Ticket Registration Modal */}
      {showTicketModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={() => !isSubmitting && setShowTicketModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px' }}
          >
            <div className="modal-content" style={{ maxHeight: '90vh' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '16px 20px' }}>
                <div>
                  <h5 className="modal-title mb-1" style={{fontSize: '16px', fontWeight: 600}}>
                    <i className="bi bi-ticket-detailed me-2"></i>
                    Submit Support Ticket
                  </h5>
                  <small className="text-muted" style={{ fontSize: '11px' }}>Create an account and submit your support request</small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => !isSubmitting && setShowTicketModal(false)}
                  disabled={isSubmitting}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '20px', overflowY: 'auto' }}>
                <form onSubmit={handleTicketSubmit} id="ticket-form">
                  {/* Company Details Section */}
                  <div className="mb-4">
                    <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a', borderBottom: '2px solid #3b82f6', paddingBottom: '8px' }}>
                      <i className="bi bi-building me-2"></i>Company Details
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Company Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Your company name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          style={{fontSize: '12px'}}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Contact Person <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Your full name"
                          value={formData.contact_person}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                          style={{fontSize: '12px'}}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          style={{fontSize: '12px'}}
                          required
                        />
                        <small className="text-muted" style={{ fontSize: '10px' }}>This will be your username</small>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="0123456789"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          style={{fontSize: '12px'}}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Min 8 characters"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          style={{fontSize: '12px'}}
                          minLength={8}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Confirm Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Re-enter password"
                          value={formData.confirm_password}
                          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                          style={{fontSize: '12px'}}
                          minLength={8}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Company Address
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Company address (optional)"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          style={{fontSize: '12px'}}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Details Section */}
                  <div className="mb-3">
                    <h6 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a', borderBottom: '2px solid #3b82f6', paddingBottom: '8px' }}>
                      <i className="bi bi-info-circle me-2"></i>Ticket Details
                    </h6>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Subject <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Brief description of your issue"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          style={{fontSize: '12px'}}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Category <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          style={{fontSize: '12px'}}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Hardware Issues">Hardware Issues</option>
                          <option value="Software Issues">Software Issues</option>
                          <option value="Network & Connectivity">Network & Connectivity</option>
                          <option value="System Performance">System Performance</option>
                          <option value="Security & Access">Security & Access</option>
                          <option value="Billing & Payments">Billing & Payments</option>
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Bug Report">Bug Report</option>
                          <option value="Feature Request">Feature Request</option>
                          <option value="Project Support">Project Support</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Priority <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          style={{fontSize: '12px'}}
                          required
                        >
                          <option value="">Select Priority</option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          rows={4}
                          placeholder="Provide detailed information about your issue"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          style={{fontSize: '12px'}}
                          required
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{fontSize: '12px', fontWeight: '500'}}>
                          Attachments (Optional)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                          onChange={handleFileChange}
                          style={{fontSize: '12px'}}
                        />
                        <small className="text-muted" style={{ fontSize: '10px' }}>Max 10MB per file. Supported: PDF, DOC, DOCX, JPG, PNG, ZIP</small>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '12px 20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTicketModal(false)}
                  style={{fontSize: '12px', padding: '8px 16px'}}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="ticket-form"
                  className="btn btn-primary" 
                  style={{fontSize: '12px', padding: '8px 16px'}}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .floating-help-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .floating-help-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.3s ease;
        }

        .floating-help-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(13, 110, 253, 0.6);
        }

        .help-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 10px;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .help-menu-item {
          background: white;
          border: 1px solid #dee2e6;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          color: #212529;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          white-space: nowrap;
          display: flex;
          align-items: center;
        }

        .help-menu-item:hover {
          background: #0d6efd;
          color: white;
          transform: translateX(-5px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }

        .help-menu-item i {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .floating-help-container {
            bottom: 20px;
            right: 20px;
          }

          .floating-help-btn {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }

          .help-menu-item {
            padding: 10px 16px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}
