import type { Metadata } from "next";
import Image from "next/image";
import ProcurementClient from "@/components/ProcurementClient";
import ProcurementButtons from "@/components/ProcurementButtons";

export const metadata: Metadata = {
  title: "Procurement Portal",
  description: "Supplier registration and procurement information for ANSAR TECHNOLOGIES SDN. BHD. - Join our network of trusted vendors and contractors.",
};

export default function ProcurementPage() {
  return (
    <>
      <ProcurementClient />
      <ProcurementButtons />
      <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/procurement.png)',
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
              <h1 className="with-separator">Procurement Portal</h1>
              <p className="text-justify">Join our network of trusted suppliers and contractors. Register to receive procurement opportunities and become a preferred vendor for ANSAR TECHNOLOGIES projects nationwide.</p>
              <div className="d-flex">
                <a href="#" className="btn-get-started" data-action="open-procurement">Register Now</a>
                <a href="#" className="btn-watch-video d-flex align-items-center" data-action="open-procurement"><i className="bi bi-arrow-right-circle"></i><span>Contact Procurement</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image 
                src="/assets/img/procurement-hero.png" 
                className="img-fluid animated" 
                alt="Procurement Portal" 
                width={1000} 
                height={1000} 
                priority 
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Why Partner With Us</h2>
          <p>Benefits of being an ANSAR TECHNOLOGIES supplier</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <i className="bi bi-graph-up-arrow display-4 text-primary mb-3"></i>
                  <h5 className="mb-3">Growth Opportunities</h5>
                  <p className="text-muted mb-0">Access to government and private sector projects across Malaysia with potential for long-term partnerships and business expansion.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <i className="bi bi-cash-coin display-4 text-success mb-3"></i>
                  <h5 className="mb-3">Fair Payment Terms</h5>
                  <p className="text-muted mb-0">Competitive pricing and prompt payment schedules. We value our suppliers and ensure timely settlements for services rendered.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <i className="bi bi-handshake display-4 text-info mb-3"></i>
                  <h5 className="mb-3">Professional Relationship</h5>
                  <p className="text-muted mb-0">Build lasting business relationships with a reputable engineering company. Transparent processes and ethical business practices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procurement Categories */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Procurement Categories</h2>
          <p className="text-white-50">We procure products and services across multiple categories</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-tools text-accent me-2"></i>
                    Construction Materials & Equipment
                  </h5>
                  <ul className="text-white-50 mb-0">
                    <li>Building materials (cement, steel, aggregates)</li>
                    <li>Construction equipment rental</li>
                    <li>Formwork and scaffolding</li>
                    <li>Safety equipment and PPE</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-lightning-charge text-accent me-2"></i>
                    M&E Materials & Systems
                  </h5>
                  <ul className="text-white-50 mb-0">
                    <li>Electrical cables, panels, and accessories</li>
                    <li>HVAC equipment and components</li>
                    <li>Plumbing fixtures and pipes</li>
                    <li>Fire protection systems</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-hdd-network text-accent me-2"></i>
                    ICT Hardware & Software
                  </h5>
                  <ul className="text-white-50 mb-0">
                    <li>Network equipment (routers, switches, cables)</li>
                    <li>Servers and storage solutions</li>
                    <li>Telecommunications equipment</li>
                    <li>Software licenses and subscriptions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-briefcase text-accent me-2"></i>
                    Professional Services
                  </h5>
                  <ul className="text-white-50 mb-0">
                    <li>Subcontractors (civil, M&E, ICT)</li>
                    <li>Testing and commissioning services</li>
                    <li>Consulting and design services</li>
                    <li>Maintenance and support services</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Requirements */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Supplier Requirements</h2>
          <p>Minimum criteria for vendor registration</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h5 className="mb-3">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        Company Requirements
                      </h5>
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-dot text-primary"></i> Valid SSM registration</li>
                        <li className="mb-2"><i className="bi bi-dot text-primary"></i> Active business operation</li>
                        <li className="mb-2"><i className="bi bi-dot text-primary"></i> Valid licenses (if applicable)</li>
                        <li className="mb-2"><i className="bi bi-dot text-primary"></i> Tax compliance (LHDN)</li>
                        <li className="mb-0"><i className="bi bi-dot text-primary"></i> Bank account details</li>
                      </ul>
                    </div>

                    <div className="col-md-6">
                      <h5 className="mb-3">
                        <i className="bi bi-file-earmark-text text-info me-2"></i>
                        Required Documents
                      </h5>
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-dot text-primary"></i> Company registration (SSM)</li>
                        <li className="mb-2"><i className="bi bi-dot text-primary"></i> Business profile & brochure</li>
                        <li className="mb-2"><i className="bi bi-dot text-primary"></i> Financial statements (latest)</li>
                        <li className="mb-2"><i className="bi bi-dot text-primary"></i> Professional certifications</li>
                        <li className="mb-0"><i className="bi bi-dot text-primary"></i> Product catalogs/portfolios</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Process */}
      <section id="register" className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Registration Process</h2>
          <p className="text-white-50">Simple steps to become our registered supplier</p>
        </div>
        <div className="container">
          <div className="row g-4 justify-content-center">
            <div className="col-lg-10">
              <div className="row g-4">
                <div className="col-md-6" data-aos="fade-up" data-aos-delay="0">
                  <div className="d-flex align-items-start p-4 bg-white bg-opacity-10 rounded-3 h-100">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                      <strong className="text-white">1</strong>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Submit Application</h5>
                      <p className="text-white-50 small mb-0">Send your company profile and required documents to our procurement team via email.</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
                  <div className="d-flex align-items-start p-4 bg-white bg-opacity-10 rounded-3 h-100">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                      <strong className="text-white">2</strong>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Evaluation</h5>
                      <p className="text-white-50 small mb-0">Our team will review your application and may request additional information or site visit.</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
                  <div className="d-flex align-items-start p-4 bg-white bg-opacity-10 rounded-3 h-100">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                      <strong className="text-white">3</strong>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Approval</h5>
                      <p className="text-white-50 small mb-0">Upon approval, you will be registered in our vendor database and receive a supplier code.</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
                  <div className="d-flex align-items-start p-4 bg-white bg-opacity-10 rounded-3 h-100">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                      <strong className="text-white">4</strong>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Start Partnership</h5>
                      <p className="text-white-50 small mb-0">Receive procurement requests and quotation invitations for relevant projects.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Performance Standards */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Supplier Performance Standards</h2>
          <p>Our expectations from registered suppliers</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <i className="bi bi-award display-4 text-primary mb-3"></i>
                  <h5 className="mb-3">Quality Assurance</h5>
                  <p className="text-muted small">All products and services must meet industry standards and specifications. Quality certifications are preferred.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <i className="bi bi-clock-history display-4 text-success mb-3"></i>
                  <h5 className="mb-3">Timely Delivery</h5>
                  <p className="text-muted small">Adherence to delivery schedules is critical. Suppliers must maintain reliable supply chain and logistics.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <i className="bi bi-currency-dollar display-4 text-info mb-3"></i>
                  <h5 className="mb-3">Competitive Pricing</h5>
                  <p className="text-muted small">Transparent and competitive pricing structure. Value for money without compromising quality.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <i className="bi bi-headset display-4 text-warning mb-3"></i>
                  <h5 className="mb-3">Responsive Support</h5>
                  <p className="text-muted small">Quick response to quotation requests, technical queries, and after-sales support requirements.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <i className="bi bi-shield-check display-4 text-danger mb-3"></i>
                  <h5 className="mb-3">Compliance</h5>
                  <p className="text-muted small">Full compliance with Malaysian regulations, safety standards, and environmental requirements.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <i className="bi bi-file-earmark-text display-4 text-secondary mb-3"></i>
                  <h5 className="mb-3">Documentation</h5>
                  <p className="text-muted small">Proper documentation including warranties, certifications, manuals, and as-built drawings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procurement Process Timeline */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Procurement Process Timeline</h2>
          <p className="text-white-50">From quotation request to delivery</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="timeline">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-4 bg-white bg-opacity-10 rounded-3 h-100">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                          <strong className="text-white">1</strong>
                        </div>
                        <div>
                          <h5 className="text-white mb-2">RFQ Issued</h5>
                          <p className="text-white-50 small mb-1">Request for Quotation sent to registered suppliers</p>
                          <span className="badge bg-accent">Day 0</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-4 bg-white bg-opacity-10 rounded-3 h-100">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                          <strong className="text-white">2</strong>
                        </div>
                        <div>
                          <h5 className="text-white mb-2">Quotation Submission</h5>
                          <p className="text-white-50 small mb-1">Suppliers submit detailed quotations and documents</p>
                          <span className="badge bg-accent">Day 1-7</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-4 bg-white bg-opacity-10 rounded-3 h-100">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                          <strong className="text-white">3</strong>
                        </div>
                        <div>
                          <h5 className="text-white mb-2">Evaluation</h5>
                          <p className="text-white-50 small mb-1">Technical and commercial evaluation of proposals</p>
                          <span className="badge bg-accent">Day 8-14</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-4 bg-white bg-opacity-10 rounded-3 h-100">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                          <strong className="text-white">4</strong>
                        </div>
                        <div>
                          <h5 className="text-white mb-2">Award & PO</h5>
                          <p className="text-white-50 small mb-1">Purchase Order issued to selected supplier</p>
                          <span className="badge bg-accent">Day 15-21</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-4 bg-white bg-opacity-10 rounded-3 h-100">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                          <strong className="text-white">5</strong>
                        </div>
                        <div>
                          <h5 className="text-white mb-2">Delivery</h5>
                          <p className="text-white-50 small mb-1">Products/services delivered as per schedule</p>
                          <span className="badge bg-accent">As per PO</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-4 bg-white bg-opacity-10 rounded-3 h-100">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                          <strong className="text-white">6</strong>
                        </div>
                        <div>
                          <h5 className="text-white mb-2">Payment</h5>
                          <p className="text-white-50 small mb-1">Invoice processing and payment settlement</p>
                          <span className="badge bg-accent">30-60 days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Frequently Asked Questions</h2>
          <p>Common questions about supplier registration</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <style
                dangerouslySetInnerHTML={{
                  __html: `
#procurementFAQ .accordion-body, #procurementFAQ .accordion-body * {
  color: #222 !important;
  opacity: 1 !important;
  visibility: visible !important;
  -webkit-text-fill-color: #222 !important;
}
                  `,
                }}
              />
              <div className="accordion" id="procurementFAQ">
                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      How long does the supplier registration process take?
                    </button>
                  </h3>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#procurementFAQ">
                    <div className="accordion-body">
                      The registration process typically takes 7-14 working days from submission of complete documents. We will notify you upon approval and provide your unique supplier code.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      Is there any registration fee?
                    </button>
                  </h3>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#procurementFAQ">
                    <div className="accordion-body">
                      No, supplier registration with ANSAR TECHNOLOGIES is completely FREE. We do not charge any fees for registration or vendor listing.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      What are the payment terms?
                    </button>
                  </h3>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#procurementFAQ">
                    <div className="accordion-body">
                      Our standard payment terms are 30-60 days from invoice date, depending on project type. Specific terms will be stated in the Purchase Order.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                      Do you accept overseas suppliers?
                    </button>
                  </h3>
                  <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#procurementFAQ">
                    <div className="accordion-body">
                      Yes, we accept overseas suppliers for specialized equipment and technology. However, suppliers must have local representation in Malaysia for after-sales support.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                      How often will I receive RFQs after registration?
                    </button>
                  </h3>
                  <div id="faq5" className="accordion-collapse collapse" data-bs-parent="#procurementFAQ">
                    <div className="accordion-body">
                      This depends on our project requirements and your category of supply. Registered suppliers will be contacted when we have relevant procurement needs matching their expertise.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section dark-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="zoom-in">
              <h2 className="text-white mb-4">Ready to Register as Our Supplier?</h2>
              <p className="text-white-50 mb-4">Contact our procurement department to start the registration process and explore business opportunities with ANSAR TECHNOLOGIES.</p>
              <div className="card bg-white bg-opacity-10 border-0 p-4 mb-4">
                <h5 className="text-white mb-3">Procurement Department</h5>
                <p className="text-white-50 mb-2">
                  <i className="bi bi-envelope text-accent me-2"></i>
                  <strong className="text-white">Email:</strong> <a href="mailto:procurement@ansartechnologies.my" className="text-white">procurement@ansartechnologies.my</a>
                </p>
                <p className="text-white-50 mb-2">
                  <i className="bi bi-telephone text-accent me-2"></i>
                  <strong className="text-white">Phone:</strong> <a href="tel:+60389590530" className="text-white">03-8959 0530</a>
                </p>
                <p className="text-white-50 mb-0">
                  <i className="bi bi-clock text-accent me-2"></i>
                  <strong className="text-white">Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM
                </p>
              </div>
              <a href="#" className="btn btn-light btn-lg" data-action="open-procurement">
                <i className="bi bi-chat-dots me-2"></i>Contact Procurement Team
              </a>
            </div>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

