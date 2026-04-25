import Link from "next/link";

export default function OtherServicesPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background other-main-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Other Services</h1>
              <p className="text-justify">Beyond infrastructure. We offer specialized services including IT advisory, outsourcing, custom development, and vehicle rental to support your complete business operations and technology journey.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Explore Services</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/others-hero.png" className="img-fluid animated" alt="Other Services" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Section 1 (Light) */}
      <section id="services" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Additional Services</h2>
          <p>Specialized offerings to complement your IT infrastructure.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up">
              <Link href="/other-services/car-rental" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-4">
                    <i className="bi bi-car-front-fill display-3 text-primary me-4"></i>
                    <div className="flex-grow-1">
                      <h4 className="mb-2">CAR Rental</h4>
                      <p className="text-muted small mb-0">Corporate Transportation</p>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                  <p className="text-muted mb-3">Reliable vehicle rental for business travel, site visits, and project logistics with daily, weekly, and monthly options.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">Daily/Weekly</span>
                    <span className="badge bg-light text-dark">Monthly Lease</span>
                    <span className="badge bg-light text-dark">Corporate Rates</span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <Link href="/other-services/it-advisory" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-4">
                    <i className="bi bi-lightbulb-fill display-3 text-primary me-4"></i>
                    <div className="flex-grow-1">
                      <h4 className="mb-2">IT Advisory</h4>
                      <p className="text-muted small mb-0">Strategic Technology Consulting</p>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                  <p className="text-muted mb-3">Expert guidance on IT strategy, vendor selection, cloud migration, and compliance with actionable roadmaps and business cases.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">Strategy</span>
                    <span className="badge bg-light text-dark">RFP Support</span>
                    <span className="badge bg-light text-dark">Cloud Advisory</span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-up">
              <Link href="/other-services/it-outsourcing" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-4">
                    <i className="bi bi-people-fill display-3 text-primary me-4"></i>
                    <div className="flex-grow-1">
                      <h4 className="mb-2">IT Outsourcing</h4>
                      <p className="text-muted small mb-0">Managed IT Services</p>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                  <p className="text-muted mb-3">Full or partial IT department replacement with helpdesk, monitoring, patch management, and strategic planning at predictable costs.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">Helpdesk</span>
                    <span className="badge bg-light text-dark">Managed IT</span>
                    <span className="badge bg-light text-dark">24/7 Support</span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <Link href="/other-services/it-programming" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-4">
                    <i className="bi bi-code-slash display-3 text-primary me-4"></i>
                    <div className="flex-grow-1">
                      <h4 className="mb-2">IT Programming</h4>
                      <p className="text-muted small mb-0">Custom Software Development</p>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                  <p className="text-muted mb-3">Web applications, mobile apps, and system integrations tailored to your business with modern frameworks and agile methodology.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">Web Apps</span>
                    <span className="badge bg-light text-dark">Mobile Apps</span>
                    <span className="badge bg-light text-dark">Integration</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Projects - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Recent Engagements</h2>
          <p className="text-white-50">How we&apos;ve helped clients across these services.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-geo-alt-fill display-4 text-primary mb-3"></i>
                <h5 className="mb-3">JARA Fleet Tracking App</h5>
                <p className="small text-muted mb-0">Mobile application development for RISDA vehicle tracking with GPS integration and maintenance records.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-file-earmark-text-fill display-4 text-primary mb-3"></i>
                <h5 className="mb-3">E-Kubur Management System</h5>
                <p className="small text-muted mb-0">Custom grave registration software with mapping, family portal, and mobile access for PPJUB.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-shop-window display-4 text-primary mb-3"></i>
                <h5 className="mb-3">An-Nur Tailor Website</h5>
                <p className="small text-muted mb-0">Responsive company profile website with product catalog and online inquiry system.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Section 4 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-primary text-white">
                <h3 className="mb-3">Let&apos;s Talk About Your Needs</h3>
                <p className="mb-4">Whether you need consulting, managed services, custom development, or transportation - we&apos;re here to help.</p>
                <Link href="/request-quotation" className="btn btn-light btn-lg">Get in Touch</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
