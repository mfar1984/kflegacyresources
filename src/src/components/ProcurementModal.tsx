"use client";

import { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = "6Lf7hforAAAAACCYb0lu0SkMooXlLhWY48_4mO7x";

export default function ProcurementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [progressMessage, setProgressMessage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openModal = () => {
    setIsOpen(true);
    setCurrentStep(1);
    setFormData({}); // Reset form data
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setFormData({}); // Reset form data
  };

  // Save current step data before moving to next step
  const saveCurrentStepData = () => {
    const form = document.getElementById("procurementForm") as HTMLFormElement;
    if (!form) return;

    const data = new FormData(form);
    const newFormData: Record<string, string> = {};
    
    data.forEach((value, key) => {
      if (value instanceof File) return; // Skip files
      newFormData[key] = value.toString();
    });

    setFormData((prev) => ({ ...prev, ...newFormData }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgressPercent(0);

    try {
      // Step 1: Security verification
      setProgressMessage("🔒 Verifying security...");
      setProgressPercent(5);

      // Check if reCAPTCHA is loaded
      if (!window.grecaptcha) {
        alert("reCAPTCHA not loaded. Please refresh the page and try again.");
        setIsSubmitting(false);
        return;
      }

      // Execute reCAPTCHA
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: "procurement_registration",
      });

      setProgressMessage("✓ Security verified");
      setProgressPercent(10);

      // Step 2: Prepare data
      setProgressMessage("📋 Preparing your data...");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get form element properly
      const form = document.getElementById("procurementForm") as HTMLFormElement;
      if (!form) {
        throw new Error("Form not found");
      }

      const formData = new FormData(form);
      
      // Count files for progress estimation
      let fileCount = 0;
      for (const [, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) fileCount++;
      }
      
      // Add recaptcha token
      formData.append("recaptcha_token", token);

      setProgressMessage(`📤 Uploading ${fileCount} documents...`);
      setProgressPercent(20);

      // Simulate upload progress (estimate 8s per file)
      const uploadDuration = fileCount * 8000; // 8 seconds per file
      const uploadSteps = 10;
      const stepDuration = uploadDuration / uploadSteps;
      
      for (let i = 0; i < uploadSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration / 10)); // Don't actually wait, just update UI
        setProgressPercent(20 + (i + 1) * 5); // 20% to 70%
      }

      // Send to API endpoint (this is where the real work happens)
      setProgressMessage("⏳ Processing your application...");
      setProgressPercent(70);

      const response = await fetch("/api/public/procurement/register", {
        method: "POST",
        body: formData,
      });

      setProgressPercent(85);
      setProgressMessage("📧 Sending confirmation emails...");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      setProgressPercent(100);
      setProgressMessage("✓ Complete!");

      if (result.success) {
        // Show success message
        await new Promise(resolve => setTimeout(resolve, 500));
        alert("✓ Registration submitted successfully!\n\nOur procurement team will review your application and contact you soon.\n\nYou will receive a confirmation email shortly.");
        // Notify admins
        try {
          const socket = getSocket();
          if (socket && socket.connected) {
            const applicationNo = result.application_no || result.registration_id || 'N/A';
            console.log('📤 Emitting task_submitted for procurement registration:', applicationNo);
            socket.emit('task_submitted', {
              module: 'procurement',
              action: 'register',
              entityId: applicationNo,
              message: `New supplier registration ${applicationNo} submitted`,
              view: 'procurement'
            });
            console.log('✅ Notification emitted successfully');
          } else {
            console.warn('⚠️ Socket not connected, notification not sent');
          }
        } catch (err) {
          console.error('❌ Error emitting notification:', err);
        }
        closeModal();
      } else {
        alert(result.message || "Error submitting form. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setProgressMessage("❌ Error occurred");
      alert(`Error submitting form: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
      setProgressPercent(0);
      setProgressMessage("");
    }
  };

  const nextStep = () => {
    saveCurrentStepData(); // Save data before moving forward
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };
  
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Expose openModal function globally
  useEffect(() => {
    (window as unknown as { openProcurementModal?: () => void }).openProcurementModal = openModal;
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={closeModal}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" style={{ fontSize: '1rem', color: '#ffffff' }}>Supplier Registration Form</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closeModal}
              ></button>
            </div>

            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto", position: "relative" }}>
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
                  }}
                >
                  <div className="text-center" style={{ maxWidth: "400px", width: "100%" }}>
                    {/* Spinner */}
                    <div
                      className="spinner-border text-primary mb-4"
                      role="status"
                      style={{ width: "4rem", height: "4rem" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>

                    {/* Progress Message */}
                    <h5 className="mb-4" style={{ color: "#0d6efd", fontSize: "1.1rem" }}>
                      {progressMessage || "Processing..."}
                    </h5>

                    {/* Progress Bar */}
                    <div className="progress" style={{ height: "10px", marginBottom: "1rem" }}>
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

                    {/* Info message */}
                    <div
                      className="alert alert-info mt-4 mb-0"
                      style={{ fontSize: "0.875rem", textAlign: "left" }}
                    >
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Please wait.</strong> We&apos;re processing your documents and sending emails. This may take up to 2 minutes depending on file sizes.
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Steps */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex-fill text-center ${
                        step === currentStep ? "fw-bold text-primary" : ""
                      }`}
                      style={{ fontSize: "0.875rem" }}
                    >
                      <div
                        className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1 ${
                          step <= currentStep
                            ? "bg-primary text-white"
                            : "bg-secondary text-white"
                        }`}
                        style={{ width: "30px", height: "30px" }}
                      >
                        {step}
                      </div>
                      <div className="small">
                        {step === 1 && "Company"}
                        {step === 2 && "Registration"}
                        {step === 3 && "Services"}
                        {step === 4 && "Documents"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="progress" style={{ height: "3px" }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              <form onSubmit={handleSubmit} id="procurementForm">
                {/* Hidden inputs to preserve data from all steps */}
                {Object.entries(formData).map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value} />
                ))}

                {/* Step 1: Company Information */}
                {currentStep === 1 && (
                  <div>
                    <h6 className="mb-3 text-primary" style={{ fontSize: '0.95rem' }}>Company Information</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Company Name (Registered) *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="company_name"
                          defaultValue={formData.company_name || ""}
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Company Registration Number (SSM) *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="ssm_number"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Company Type *
                        </label>
                        <select
                          className="form-select"
                          name="company_type"
                          style={{ fontSize: "0.875rem" }}
                          required
                        >
                          <option value="">Select...</option>
                          <option value="sole_proprietor">Sole Proprietor</option>
                          <option value="partnership">Partnership</option>
                          <option value="sdn_bhd">Sdn Bhd</option>
                          <option value="berhad">Berhad</option>
                          <option value="others">Others</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Date of Incorporation *
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="incorporation_date"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Business Address *
                        </label>
                        <textarea
                          className="form-control"
                          name="business_address"
                          rows={2}
                          style={{ fontSize: "0.875rem" }}
                          required
                        ></textarea>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          City *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          State *
                        </label>
                        <select
                          className="form-select"
                          name="state"
                          style={{ fontSize: "0.875rem" }}
                          required
                        >
                          <option value="">Select...</option>
                          <option value="Johor">Johor</option>
                          <option value="Kedah">Kedah</option>
                          <option value="Kelantan">Kelantan</option>
                          <option value="Melaka">Melaka</option>
                          <option value="Negeri Sembilan">Negeri Sembilan</option>
                          <option value="Pahang">Pahang</option>
                          <option value="Penang">Penang</option>
                          <option value="Perak">Perak</option>
                          <option value="Perlis">Perlis</option>
                          <option value="Sabah">Sabah</option>
                          <option value="Sarawak">Sarawak</option>
                          <option value="Selangor">Selangor</option>
                          <option value="Terengganu">Terengganu</option>
                          <option value="Kuala Lumpur">Kuala Lumpur</option>
                          <option value="Labuan">Labuan</option>
                          <option value="Putrajaya">Putrajaya</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Postcode *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="postcode"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Office Phone *
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="office_phone"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="mobile_phone"
                          style={{ fontSize: "0.875rem" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Website URL
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          name="website"
                          style={{ fontSize: "0.875rem" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Registration & Compliance */}
                {currentStep === 2 && (
                  <div>
                    <h6 className="mb-3 text-primary" style={{ fontSize: '0.95rem' }}>Registration & Compliance</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          MOF Registration Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="mof_number"
                          style={{ fontSize: "0.875rem" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          CIDB Registration Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="cidb_number"
                          style={{ fontSize: "0.875rem" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          CIDB Grade
                        </label>
                        <select
                          className="form-select"
                          name="cidb_grade"
                          style={{ fontSize: "0.875rem" }}
                        >
                          <option value="">Select...</option>
                          <option value="G1">G1</option>
                          <option value="G2">G2</option>
                          <option value="G3">G3</option>
                          <option value="G4">G4</option>
                          <option value="G5">G5</option>
                          <option value="G6">G6</option>
                          <option value="G7">G7</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Bumiputera Status *
                        </label>
                        <select
                          className="form-select"
                          name="bumiputera_status"
                          style={{ fontSize: "0.875rem" }}
                          required
                        >
                          <option value="">Select...</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Paid-up Capital (RM)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="paid_up_capital"
                          style={{ fontSize: "0.875rem" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Number of Employees
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="num_employees"
                          style={{ fontSize: "0.875rem" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Annual Turnover (RM)
                        </label>
                        <select
                          className="form-select"
                          name="annual_turnover"
                          style={{ fontSize: "0.875rem" }}
                        >
                          <option value="">Select...</option>
                          <option value="below_500k">Below RM 500,000</option>
                          <option value="500k_1m">RM 500,000 - RM 1 Million</option>
                          <option value="1m_5m">RM 1 Million - RM 5 Million</option>
                          <option value="5m_10m">RM 5 Million - RM 10 Million</option>
                          <option value="above_10m">Above RM 10 Million</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Years in Business *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="years_in_business"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <h6 className="mt-3 mb-2" style={{ fontSize: "0.875rem" }}>Banking Information</h6>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="bank_name"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Bank Account Number *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="bank_account_number"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Bank Account Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="bank_account_name"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Services & Profile */}
                {currentStep === 3 && (
                  <div>
                    <h6 className="mb-3 text-primary" style={{ fontSize: '0.95rem' }}>Services & Company Profile</h6>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Category of Services Offered * (Select all that apply)
                        </label>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" name="service_civil" id="service_civil" />
                          <label className="form-check-label" htmlFor="service_civil" style={{ fontSize: "0.875rem" }}>
                            Civil Engineering
                          </label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" name="service_mne" id="service_mne" />
                          <label className="form-check-label" htmlFor="service_mne" style={{ fontSize: "0.875rem" }}>
                            Mechanical & Electrical Engineering
                          </label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" name="service_ict" id="service_ict" />
                          <label className="form-check-label" htmlFor="service_ict" style={{ fontSize: "0.875rem" }}>
                            ICT Engineering
                          </label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" name="service_pmc" id="service_pmc" />
                          <label className="form-check-label" htmlFor="service_pmc" style={{ fontSize: "0.875rem" }}>
                            Project Management & Consultancy
                          </label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" name="service_trading" id="service_trading" />
                          <label className="form-check-label" htmlFor="service_trading" style={{ fontSize: "0.875rem" }}>
                            General Trading
                          </label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" name="service_others" id="service_others" />
                          <label className="form-check-label" htmlFor="service_others" style={{ fontSize: "0.875rem" }}>
                            Others
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Nature of Business *
                        </label>
                        <textarea
                          className="form-control"
                          name="nature_of_business"
                          rows={3}
                          style={{ fontSize: "0.875rem" }}
                          placeholder="Describe your main business activities..."
                          required
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Products/Services Description *
                        </label>
                        <textarea
                          className="form-control"
                          name="products_services"
                          rows={3}
                          style={{ fontSize: "0.875rem" }}
                          placeholder="Describe the products/services you offer..."
                          required
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <h6 className="mt-3 mb-2" style={{ fontSize: "0.875rem" }}>Key Personnel/Director Information</h6>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Director Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="director_name"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          IC Number *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="director_ic"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Position *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="director_position"
                          style={{ fontSize: "0.875rem" }}
                          placeholder="e.g., Managing Director"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="director_contact"
                          style={{ fontSize: "0.875rem" }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Documents & Declaration */}
                {currentStep === 4 && (
                  <div>
                    <h6 className="mb-3 text-primary" style={{ fontSize: '0.95rem' }}>Supporting Documents</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          SSM Certificate (Form 9/24/49) *
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="doc_ssm"
                          style={{ fontSize: "0.875rem" }}
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Company Profile
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="doc_profile"
                          style={{ fontSize: "0.875rem" }}
                          accept=".pdf,.doc,.docx"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          MOF Certificate
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="doc_mof"
                          style={{ fontSize: "0.875rem" }}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          CIDB Certificate
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="doc_cidb"
                          style={{ fontSize: "0.875rem" }}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Financial Statement (Latest)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="doc_financial"
                          style={{ fontSize: "0.875rem" }}
                          accept=".pdf"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Bank Statement
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="doc_bank"
                          style={{ fontSize: "0.875rem" }}
                          accept=".pdf"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: "0.875rem" }}>
                          Other Certificates (ISO, Safety, etc.)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="doc_others"
                          style={{ fontSize: "0.875rem" }}
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                        />
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                          You can select multiple files
                        </small>
                      </div>
                      <div className="col-12 mt-4">
                        <h6 className="mb-3" style={{ fontSize: "0.875rem" }}>Declaration</h6>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="declaration_accuracy"
                            id="declaration_accuracy"
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="declaration_accuracy"
                            style={{ fontSize: "0.875rem" }}
                          >
                            I hereby declare that all information provided is true and accurate to the best of my knowledge. *
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="declaration_terms"
                            id="declaration_terms"
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="declaration_terms"
                            style={{ fontSize: "0.875rem" }}
                          >
                            I agree to the terms and conditions for supplier registration. *
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="declaration_privacy"
                            id="declaration_privacy"
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="declaration_privacy"
                            style={{ fontSize: "0.875rem" }}
                          >
                            I consent to the collection and processing of my personal data in accordance with the Personal Data Protection Act 2010. *
                          </label>
                        </div>
                      </div>
                      <div className="col-12 mt-3">
                        <div className="alert alert-info" style={{ fontSize: "0.875rem" }}>
                          <i className="bi bi-info-circle me-2"></i>
                          This site is protected by reCAPTCHA and the Google{" "}
                          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                            Privacy Policy
                          </a>{" "}
                          and{" "}
                          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
                            Terms of Service
                          </a>{" "}
                          apply.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="modal-footer">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  style={{ fontSize: "0.875rem" }}
                >
                  <i className="bi bi-arrow-left me-2"></i>Previous
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={nextStep}
                  style={{ fontSize: "0.875rem" }}
                >
                  Next<i className="bi bi-arrow-right ms-2"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  form="procurementForm"
                  className="btn btn-success"
                  disabled={isSubmitting}
                  style={{ fontSize: "0.875rem" }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>Submit Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

