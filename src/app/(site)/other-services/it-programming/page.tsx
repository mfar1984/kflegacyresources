export default function ITProgrammingPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background other-programming-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">IT Programming & Development</h1>
              <p className="text-justify">Custom software solutions tailored to your business needs. From web applications to mobile apps and system integrations, our development team delivers quality code, on-time delivery, and ongoing support for your digital initiatives.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Our Development Services</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/others-hero.png" className="img-fluid animated" alt="IT Programming & Development" />
            </div>
          </div>
        </div>
      </section>

      {/* Development Services - Section 1 (Light) - Service Grid */}
      <section id="services" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Development Services</h2>
          <p>Full-stack development across platforms and technologies.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-window display-4 text-primary mb-3"></i>
                <h4 className="mb-3">Web Application Development</h4>
                <p className="mb-3">Responsive, scalable web applications with modern frameworks and cloud-native architecture.</p>
                <div className="mb-3">
                  <h6 className="mb-2">Technologies:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">React / Next.js</span>
                    <span className="badge bg-light text-dark">Laravel / PHP</span>
                    <span className="badge bg-light text-dark">Node.js</span>
                    <span className="badge bg-light text-dark">ASP.NET</span>
                    <span className="badge bg-light text-dark">MySQL / PostgreSQL</span>
                    <span className="badge bg-light text-dark">REST APIs</span>
                  </div>
                </div>
                <ul className="list-unstyled small">
                  <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>Custom business applications</li>
                  <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>CMS & portals</li>
                  <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>E-commerce platforms</li>
                  <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>Progressive web apps (PWA)</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-phone display-4 text-primary mb-3"></i>
                <h4 className="mb-3">Mobile App Development</h4>
                <p className="mb-3">Native and cross-platform mobile applications for iOS and Android with backend integration.</p>
                <div className="mb-3">
                  <h6 className="mb-2">Technologies:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">React Native</span>
                    <span className="badge bg-light text-dark">Flutter</span>
                    <span className="badge bg-light text-dark">Swift / Kotlin</span>
                    <span className="badge bg-light text-dark">Firebase</span>
                    <span className="badge bg-light text-dark">Push Notifications</span>
                    <span className="badge bg-light text-dark">GPS/Maps</span>
                  </div>
                </div>
                <ul className="list-unstyled small">
                  <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>iOS & Android apps</li>
                  <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>Offline-first architecture</li>
                  <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>Biometric authentication</li>
                  <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>App Store deployment</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-diagram-3 display-4 text-primary mb-3"></i>
                <h4 className="mb-3">System Integration</h4>
                <p className="mb-3">Connect disparate systems with APIs, middleware, and data synchronization for seamless workflows.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>ERP / CRM integration</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Third-party API connectivity</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Data migration & ETL</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Middleware development</li>
                  <li className="mb-0"><i className="bi bi-check-circle text-primary me-2"></i>Legacy system modernization</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-code-slash display-4 text-primary mb-3"></i>
                <h4 className="mb-3">Custom Software Development</h4>
                <p className="mb-3">Bespoke applications designed for your unique business processes and requirements.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Requirements analysis & design</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Agile development methodology</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>QA testing & UAT support</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Documentation & training</li>
                  <li className="mb-0"><i className="bi bi-check-circle text-primary me-2"></i>Post-launch support & maintenance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Process - Section 2 (Dark) - Timeline */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Our Development Process</h2>
          <p className="text-white-50">Agile methodology with continuous collaboration.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <div className="mb-3">
                  <span className="badge bg-primary">Phase 1</span>
                  <h5 className="mt-3 mb-3">Discovery & Planning</h5>
                </div>
                <p className="small text-muted mb-0">Requirements gathering, user stories, wireframes, technical architecture, and project timeline with fixed-price quotation.</p>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <div className="mb-3">
                  <span className="badge bg-primary">Phase 2</span>
                  <h5 className="mt-3 mb-3">Design & Development</h5>
                </div>
                <p className="small text-muted mb-0">UI/UX design, sprint-based coding, continuous integration, code reviews, and regular demos with stakeholder feedback loops.</p>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <div className="mb-3">
                  <span className="badge bg-primary">Phase 3</span>
                  <h5 className="mt-3 mb-3">Testing & Deployment</h5>
                </div>
                <p className="small text-muted mb-0">QA testing, UAT support, performance optimization, production deployment, training, and warranty support period.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past Projects - Section 4 (Light) */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Sample Projects</h2>
          <p>Applications we&apos;ve built for clients.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <i className="bi bi-geo-alt-fill display-4 text-primary mb-3"></i>
                <h5 className="mb-3">JARA Fleet Tracking App</h5>
                <p className="small text-muted mb-0">Mobile app for RISDA vehicle tracking with GPS, maintenance records, and driver management.</p>
              </div>
            </div>
            <div className="col-lg-4" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <i className="bi bi-file-earmark-text-fill display-4 text-primary mb-3"></i>
                <h5 className="mb-3">E-Kubur Management System</h5>
                <p className="small text-muted mb-0">Custom grave registration and mapping system with family portal and mobile access.</p>
              </div>
            </div>
            <div className="col-lg-4" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <i className="bi bi-shop-window display-4 text-primary mb-3"></i>
                <h5 className="mb-3">An-Nur Tailor Website</h5>
                <p className="small text-muted mb-0">Responsive company profile with product catalog and inquiry system for tailoring business.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

