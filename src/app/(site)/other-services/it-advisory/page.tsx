export default function ITAdvisoryPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background other-advisory-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">IT Advisory Services</h1>
              <p className="text-justify">Strategic IT guidance for business transformation. From technology roadmaps to vendor selection, our consultants help you make informed decisions, optimize investments, and align IT with business objectives.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Our Advisory Services</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/others-hero.png" className="img-fluid animated" alt="IT Advisory Services" />
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Services - Section 1 (Light) - Service Cards */}
      <section id="services" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Our Advisory Services</h2>
          <p>Expert guidance across the IT lifecycle.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-map display-4 text-primary mb-3"></i>
                <h4 className="mb-3">IT Strategy & Roadmap</h4>
                <p className="mb-3">Align technology with business goals through strategic planning, budgeting, and multi-year roadmaps.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Current state assessment</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Future state visioning</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Gap analysis & prioritization</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>3-5 year technology roadmap</li>
                  <li className="mb-0"><i className="bi bi-check-circle text-primary me-2"></i>Budget planning & TCO modeling</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-clipboard-check display-4 text-primary mb-3"></i>
                <h4 className="mb-3">Vendor Selection & RFP</h4>
                <p className="mb-3">Navigate the vendor landscape with independent advice, RFP preparation, and proposal evaluation.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Requirements gathering</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>RFP/RFI drafting</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Vendor shortlisting</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Proposal scoring & comparison</li>
                  <li className="mb-0"><i className="bi bi-check-circle text-primary me-2"></i>Contract negotiation support</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-shield-check display-4 text-primary mb-3"></i>
                <h4 className="mb-3">Security & Compliance Advisory</h4>
                <p className="mb-3">Navigate regulatory requirements and implement security frameworks with expert guidance.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>ISO 27001 readiness</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>PCI-DSS compliance</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>PDPA gap assessment</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Security architecture review</li>
                  <li className="mb-0"><i className="bi bi-check-circle text-primary me-2"></i>Policy & procedure development</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-cloud display-4 text-primary mb-3"></i>
                <h4 className="mb-3">Cloud Strategy & Migration</h4>
                <p className="mb-3">Plan and execute cloud adoption with readiness assessment, provider selection, and migration roadmap.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Cloud readiness assessment</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>AWS / Azure / GCP evaluation</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Migration planning (6R framework)</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Cost optimization</li>
                  <li className="mb-0"><i className="bi bi-check-circle text-primary me-2"></i>Hybrid cloud architecture</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-5" data-aos="fade-right">
              <h2 className="text-white mb-4">Our Advisory Approach</h2>
              <p className="text-white mb-4">We combine deep technical expertise with business acumen to deliver actionable recommendations that drive value.</p>
              <div className="p-4 rounded bg-white bg-opacity-10">
                <h5 className="text-white mb-3">Engagement Models</h5>
                <ul className="list-unstyled text-white-50 small mb-0">
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-accent me-2"></i>Project-based consulting</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-accent me-2"></i>Retainer advisory (monthly)</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-accent me-2"></i>On-demand expert hours</li>
                  <li className="mb-0"><i className="bi bi-check-circle-fill text-accent me-2"></i>Workshop facilitation</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow">
                    <h6 className="mb-2"><i className="bi bi-1-circle-fill text-primary me-2"></i>Discovery & Assessment</h6>
                    <p className="small text-muted mb-0">Understand your business, technology landscape, challenges, and objectives through interviews and documentation review.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow">
                    <h6 className="mb-2"><i className="bi bi-2-circle-fill text-primary me-2"></i>Analysis & Recommendations</h6>
                    <p className="small text-muted mb-0">Evaluate options, model scenarios, and develop tailored recommendations with risk/benefit analysis.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow">
                    <h6 className="mb-2"><i className="bi bi-3-circle-fill text-primary me-2"></i>Roadmap & Business Case</h6>
                    <p className="small text-muted mb-0">Deliver actionable roadmap with timelines, costs, resource requirements, and executive business case.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow">
                    <h6 className="mb-2"><i className="bi bi-4-circle-fill text-primary me-2"></i>Implementation Support (Optional)</h6>
                    <p className="small text-muted mb-0">Guide execution, vendor management, and change management to ensure successful delivery.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

