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

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // IMPORTANT: Capture form data BEFORE setting isSubmitting to true
    const form = document.getElementById("contactForm") as HTMLFormElement;
    if (!form || !(form instanceof HTMLFormElement)) {
      alert("Contact form not found");
      return;
    }
    
    const formData = new FormData(form);
    
    // NOW set submitting state (after capturing data)
    setIsSubmitting(true);
    setProgressPercent(0);

    try {
      // Step 1: Security verification
      setProgressMessage("🔒 Verifying security...");
      setProgressPercent(10);

      if (!window.grecaptcha) {
        alert("reCAPTCHA not loaded. Please refresh the page and try again.");
        setIsSubmitting(false);
        return;
      }

      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: "contact_form",
      });

      setProgressMessage("✓ Security verified");
      setProgressPercent(30);

      // Step 2: Prepare data
      setProgressMessage("📋 Preparing your message...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      formData.append("recaptcha_token", token);

      // Check file count
      const attachmentInput = form.querySelector('input[name="attachments"]') as HTMLInputElement;
      const fileCount = attachmentInput?.files?.length || 0;

      if (fileCount > 0) {
        setProgressMessage(`📎 Uploading ${fileCount} attachment(s)...`);
      } else {
        setProgressMessage("📤 Sending your message...");
      }
      setProgressPercent(50);

      // Send to API
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      setProgressPercent(80);
      setProgressMessage("📧 Sending confirmation...");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      setProgressPercent(100);
      setProgressMessage("✓ Complete!");

      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 500));
        alert("✓ Message sent successfully!\n\nThank you for contacting us. We will get back to you as soon as possible.\n\nYou will receive a confirmation email shortly.");
        form.reset();
      } else {
        alert(result.message || "Error sending message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setProgressMessage("❌ Error occurred");
      alert(`Error sending message: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
      setProgressPercent(0);
      setProgressMessage("");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Loading Overlay */}
      {isSubmitting && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            borderRadius: "0.5rem",
          }}
        >
          <div className="text-center" style={{ maxWidth: "400px", width: "100%" }}>
            <div
              className="spinner-border text-primary mb-4"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>

            <h5 className="mb-4" style={{ color: "#0d6efd", fontSize: "1rem" }}>
              {progressMessage || "Processing..."}
            </h5>

            <div className="progress" style={{ height: "8px", marginBottom: "1rem" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${progressPercent}%` }}
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <p className="text-muted small mb-0">{progressPercent}% complete</p>
          </div>
        </div>
      )}

      {/* Contact Form */}
      <form id="contactForm" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="name" className="form-label" style={{ fontSize: '0.875rem' }}>Full Name *</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              style={{ fontSize: '0.875rem' }}
              required
              readOnly={isSubmitting}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="company" className="form-label" style={{ fontSize: '0.875rem' }}>Company</label>
            <input
              type="text"
              className="form-control"
              id="company"
              name="company"
              style={{ fontSize: '0.875rem' }}
              readOnly={isSubmitting}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="email" className="form-label" style={{ fontSize: '0.875rem' }}>Email *</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              style={{ fontSize: '0.875rem' }}
              required
              readOnly={isSubmitting}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="phone" className="form-label" style={{ fontSize: '0.875rem' }}>Phone *</label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              name="phone"
              style={{ fontSize: '0.875rem' }}
              required
              readOnly={isSubmitting}
            />
          </div>
          <div className="col-12">
            <label htmlFor="subject" className="form-label" style={{ fontSize: '0.875rem' }}>Subject *</label>
            <input
              type="text"
              className="form-control"
              id="subject"
              name="subject"
              style={{ fontSize: '0.875rem' }}
              required
              readOnly={isSubmitting}
            />
          </div>
          <div className="col-12">
            <label htmlFor="service" className="form-label" style={{ fontSize: '0.875rem' }}>Service Interest</label>
            <select
              className="form-select"
              id="service"
              name="service"
              style={{ fontSize: '0.875rem' }}
              disabled={isSubmitting}
            >
              <option value="">Select a service...</option>
              <option value="civil">Civil Engineering</option>
              <option value="mne">Mechanical & Electrical Engineering</option>
              <option value="ict">ICT Engineering</option>
              <option value="pmc">Project Management & Consultancy</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-12">
            <label htmlFor="message" className="form-label" style={{ fontSize: '0.875rem' }}>Message *</label>
            <textarea
              className="form-control"
              id="message"
              name="message"
              rows={5}
              style={{ fontSize: '0.875rem' }}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          <div className="col-12">
            <label htmlFor="attachments" className="form-label" style={{ fontSize: '0.875rem' }}>
              Attachments <span className="text-muted">(Optional - PDF, PNG, JPG, JPEG only)</span>
            </label>
            <input
              type="file"
              className="form-control"
              id="attachments"
              name="attachments"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              style={{ fontSize: '0.875rem' }}
              disabled={isSubmitting}
            />
            <small className="text-muted">Maximum 5 files, 10MB each</small>
          </div>
          <div className="col-12 mt-4">
            <button
              type="submit"
              className="btn btn-primary w-100"
              style={{ fontSize: '1rem', padding: '0.75rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

