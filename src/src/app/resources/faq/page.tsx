import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about ANSAR TECHNOLOGIES SDN. BHD. services, processes, and policies.",
};

export default function FAQPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/faq.png)',
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
              <h1 className="with-separator">Frequently Asked Questions</h1>
              <p className="text-justify">Find quick answers to common questions about our services, processes, and policies. Browse by category or use the search to find specific information.</p>
              <div className="d-flex">
                <a href="#faq-list" className="btn-get-started">Browse FAQs</a>
                <a href="/contact" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>Contact Us</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image 
                src="/assets/img/faq-hero.png" 
                className="img-fluid animated" 
                alt="FAQ" 
                width={800} 
                height={600} 
                priority 
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Browse by Category</h2>
          <p>Select a category to view related questions</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card border-0 shadow-sm h-100 text-center">
                <div className="card-body p-4">
                  <i className="bi bi-building display-4 text-primary mb-3"></i>
                  <h5 className="mb-2">General</h5>
                  <p className="text-muted small mb-3">12 Questions</p>
                  <a href="#general" className="btn btn-outline-primary btn-sm">View Questions</a>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100 text-center">
                <div className="card-body p-4">
                  <i className="bi bi-gear-wide-connected display-4 text-warning mb-3"></i>
                  <h5 className="mb-2">Services</h5>
                  <p className="text-muted small mb-3">18 Questions</p>
                  <a href="#services" className="btn btn-outline-warning btn-sm">View Questions</a>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100 text-center">
                <div className="card-body p-4">
                  <i className="bi bi-file-earmark-text display-4 text-info mb-3"></i>
                  <h5 className="mb-2">Projects</h5>
                  <p className="text-muted small mb-3">15 Questions</p>
                  <a href="#projects" className="btn btn-outline-info btn-sm">View Questions</a>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="card border-0 shadow-sm h-100 text-center">
                <div className="card-body p-4">
                  <i className="bi bi-briefcase display-4 text-success mb-3"></i>
                  <h5 className="mb-2">Business</h5>
                  <p className="text-muted small mb-3">10 Questions</p>
                  <a href="#business" className="btn btn-outline-success btn-sm">View Questions</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* General FAQs */}
      <section id="general" className="section">
        <div className="container section-title" data-aos="fade-up">
          <h2>General Questions</h2>
          <p>Common questions about our company</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="accordion" id="generalFAQ">
                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#g1">
                      What is ANSAR TECHNOLOGIES SDN. BHD.?
                    </button>
                  </h3>
                  <div id="g1" className="accordion-collapse collapse show" data-bs-parent="#generalFAQ">
                    <div className="accordion-body">
                      ANSAR TECHNOLOGIES SDN. BHD. is a leading engineering company in Malaysia, specializing in Civil Engineering, Mechanical & Electrical Engineering, ICT Engineering, and Project Management & Consultancy services. We serve both government and private sectors across Malaysia.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#g2">
                      Where are you located?
                    </button>
                  </h3>
                  <div id="g2" className="accordion-collapse collapse" data-bs-parent="#generalFAQ">
                    <div className="accordion-body">
                      Our headquarters is located at B2-1-34, Tingkat 1, Jalan Pinggiran 1/3, Taman Pinggiran Putra, 43300 Seri Kembangan, Selangor, Malaysia. We also operate across multiple states in Malaysia through our project offices.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#g3">
                      What are your office hours?
                    </button>
                  </h3>
                  <div id="g3" className="accordion-collapse collapse" data-bs-parent="#generalFAQ">
                    <div className="accordion-body">
                      Our office is open Monday to Friday, 9:00 AM to 5:00 PM. We are closed on weekends and public holidays. For urgent matters, please contact our emergency hotline available 24/7.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#g4">
                      Are you a Bumiputera company?
                    </button>
                  </h3>
                  <div id="g4" className="accordion-collapse collapse" data-bs-parent="#generalFAQ">
                    <div className="accordion-body">
                      Yes, ANSAR TECHNOLOGIES is a registered Bumiputera company with valid MOF (Ministry of Finance) registration, making us eligible for government contracts and tenders.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services FAQs */}
      <section id="services" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Services Questions</h2>
          <p>Questions about our engineering services</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="accordion" id="servicesFAQ">
                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#s1">
                      What engineering services do you provide?
                    </button>
                  </h3>
                  <div id="s1" className="accordion-collapse collapse show" data-bs-parent="#servicesFAQ">
                    <div className="accordion-body">
                      We provide comprehensive engineering services including Civil Engineering (infrastructure, construction), Mechanical & Electrical Engineering (HVAC, electrical, plumbing), ICT Engineering (networking, telecommunications), and Project Management & Consultancy.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#s2">
                      Do you provide maintenance services?
                    </button>
                  </h3>
                  <div id="s2" className="accordion-collapse collapse" data-bs-parent="#servicesFAQ">
                    <div className="accordion-body">
                      Yes, we offer comprehensive maintenance services for all systems we install, including preventive maintenance, corrective maintenance, and 24/7 emergency support for critical systems.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#s3">
                      Can you handle both design and build projects?
                    </button>
                  </h3>
                  <div id="s3" className="accordion-collapse collapse" data-bs-parent="#servicesFAQ">
                    <div className="accordion-body">
                      Absolutely! We provide turnkey solutions covering design, procurement, installation, testing, commissioning, and maintenance. We can also work as a specialist subcontractor for specific scopes.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#s4">
                      What industries do you serve?
                    </button>
                  </h3>
                  <div id="s4" className="accordion-collapse collapse" data-bs-parent="#servicesFAQ">
                    <div className="accordion-body">
                      We serve various industries including government agencies, commercial buildings, industrial facilities, healthcare, education, hospitality, residential developments, and infrastructure projects.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects FAQs */}
      <section id="projects" className="section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Project Questions</h2>
          <p>Questions about project implementation and delivery</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="accordion" id="projectsFAQ">
                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#p1">
                      How do I request a quotation?
                    </button>
                  </h3>
                  <div id="p1" className="accordion-collapse collapse show" data-bs-parent="#projectsFAQ">
                    <div className="accordion-body">
                      You can request a quotation by contacting us via phone, email, or through our contact form. Please provide project details, drawings (if available), and your requirements. We typically respond within 3-5 working days.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#p2">
                      What is your typical project timeline?
                    </button>
                  </h3>
                  <div id="p2" className="accordion-collapse collapse" data-bs-parent="#projectsFAQ">
                    <div className="accordion-body">
                      Project timelines vary depending on scope and complexity. Small projects may take 2-4 weeks, medium projects 2-3 months, and large-scale projects 6-12 months or more. We provide detailed timelines in our proposals.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#p3">
                      Do you provide warranty for your work?
                    </button>
                  </h3>
                  <div id="p3" className="accordion-collapse collapse" data-bs-parent="#projectsFAQ">
                    <div className="accordion-body">
                      Yes, we provide warranty coverage for all our projects. Workmanship warranty is typically 12 months from completion, while equipment warranties vary by manufacturer (usually 12-36 months). Extended warranties are available.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#p4">
                      What are your payment terms?
                    </button>
                  </h3>
                  <div id="p4" className="accordion-collapse collapse" data-bs-parent="#projectsFAQ">
                    <div className="accordion-body">
                      Our standard payment terms are progressive payments based on project milestones. Typically: 10% deposit, 30% upon mobilization, 50% at 50% completion, and 10% upon project completion. Terms may vary for government projects.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business FAQs */}
      <section id="business" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Business Questions</h2>
          <p>Questions about partnerships and business opportunities</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="accordion" id="businessFAQ">
                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#b1">
                      How can I become your supplier?
                    </button>
                  </h3>
                  <div id="b1" className="accordion-collapse collapse show" data-bs-parent="#businessFAQ">
                    <div className="accordion-body">
                      Visit our Procurement Portal to register as a supplier. Submit your company profile, relevant licenses, and product catalogs. Our procurement team will evaluate and contact you if you meet our requirements.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#b2">
                      Do you accept subcontractors?
                    </button>
                  </h3>
                  <div id="b2" className="accordion-collapse collapse" data-bs-parent="#businessFAQ">
                    <div className="accordion-body">
                      Yes, we work with qualified subcontractors for various scopes. Subcontractors must have valid licenses, insurance, and proven track record. Registration can be done through our procurement portal.
                    </div>
                  </div>
                </div>

                <div className="accordion-item mb-3 border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#b3">
                      Are you open to joint ventures?
                    </button>
                  </h3>
                  <div id="b3" className="accordion-collapse collapse" data-bs-parent="#businessFAQ">
                    <div className="accordion-body">
                      We are open to discussing joint venture opportunities for large-scale projects. Please contact our business development team with your proposal and company credentials for evaluation.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 shadow-sm">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#b4">
                      How do I stay updated on tender opportunities?
                    </button>
                  </h3>
                  <div id="b4" className="accordion-collapse collapse" data-bs-parent="#businessFAQ">
                    <div className="accordion-body">
                      Visit our Tenders & Opportunities page regularly, or subscribe to our tender notification service to receive email alerts about new tender announcements matching your category.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="section dark-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="zoom-in">
              <h2 className="text-white mb-4">Still Have Questions?</h2>
              <p className="text-white-50 mb-4">Can&apos;t find the answer you&apos;re looking for? Our team is here to help you with any questions or concerns.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/contact" className="btn btn-light btn-lg">
                  <i className="bi bi-envelope me-2"></i>Contact Us
                </Link>
                <Link href="/resources/documentation" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-book me-2"></i>View Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <style
        dangerouslySetInnerHTML={{
          __html: `
#generalFAQ .accordion-body, #generalFAQ .accordion-body * ,
#servicesFAQ .accordion-body, #servicesFAQ .accordion-body * ,
#projectsFAQ .accordion-body, #projectsFAQ .accordion-body * ,
#businessFAQ .accordion-body, #businessFAQ .accordion-body * {
  color: #222 !important;
  opacity: 1 !important;
  visibility: visible !important;
  -webkit-text-fill-color: #222 !important;
}
          `,
        }}
      />
    </main>
  );
}

