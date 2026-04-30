import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Strategic Partners",
  description: "Technology and business partners of ANSAR TECHNOLOGIES SDN. BHD. - Working with industry leaders to deliver excellence in engineering solutions.",
};

export default function PartnersPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/partners.png)',
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
              <h1 className="with-separator">Strategic Partners</h1>
              <p className="text-justify">We collaborate with world-class technology providers and business partners to deliver cutting-edge engineering solutions and services to our clients across all industries.</p>
              <div className="d-flex">
                <a href="#technology-partners" className="btn-get-started">View Partners</a>
                <a href="/contact" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>Partner With Us</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/partners-hero.png?v=2" className="img-fluid animated" alt="Strategic Partners" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Philosophy */}
      <section className="section light-background">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0" data-aos="fade-right">
              <h2 className="mb-4">Our Partnership Philosophy</h2>
              <p className="text-muted mb-4">At ANSAR TECHNOLOGIES, we believe in building strong, mutually beneficial partnerships with leading technology providers and service companies. These strategic alliances enable us to:</p>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                  <span>Deliver best-in-class solutions using proven technologies from industry leaders</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                  <span>Provide comprehensive support backed by manufacturer warranties and certifications</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                  <span>Stay at the forefront of technological innovation and industry best practices</span>
                </li>
                <li className="d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                  <span>Ensure long-term value and sustainability for our clients&apos; investments</span>
                </li>
              </ul>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-4 bg-white rounded-3 shadow-sm text-center">
                    <i className="bi bi-award display-4 text-primary mb-2"></i>
                    <h5>Certified Partners</h5>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 bg-white rounded-3 shadow-sm text-center">
                    <i className="bi bi-globe display-4 text-info mb-2"></i>
                    <h5>Global Reach</h5>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 bg-white rounded-3 shadow-sm text-center">
                    <i className="bi bi-shield-check display-4 text-success mb-2"></i>
                    <h5>Quality Assured</h5>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 bg-white rounded-3 shadow-sm text-center">
                    <i className="bi bi-headset display-4 text-warning mb-2"></i>
                    <h5>Local Support</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section id="technology-partners" className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Technology Partners</h2>
          <p className="text-white-50">Leading brands we work with</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-hdd-network text-accent me-2"></i>
                    Network & Infrastructure
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-white text-dark">Cisco</span>
                    <span className="badge bg-white text-dark">HP/HPE</span>
                    <span className="badge bg-white text-dark">Dell</span>
                    <span className="badge bg-white text-dark">Aruba</span>
                    <span className="badge bg-white text-dark">Huawei</span>
                    <span className="badge bg-white text-dark">Ubiquiti</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-wind text-accent me-2"></i>
                    HVAC & M&E Systems
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-white text-dark">Daikin</span>
                    <span className="badge bg-white text-dark">Mitsubishi</span>
                    <span className="badge bg-white text-dark">Carrier</span>
                    <span className="badge bg-white text-dark">Schneider Electric</span>
                    <span className="badge bg-white text-dark">Siemens</span>
                    <span className="badge bg-white text-dark">ABB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-shield-lock text-accent me-2"></i>
                    Security & Safety
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-white text-dark">Honeywell</span>
                    <span className="badge bg-white text-dark">Bosch</span>
                    <span className="badge bg-white text-dark">Hikvision</span>
                    <span className="badge bg-white text-dark">Axis Communications</span>
                    <span className="badge bg-white text-dark">Notifier</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-laptop text-accent me-2"></i>
                    Software & Cloud
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-white text-dark">Microsoft</span>
                    <span className="badge bg-white text-dark">VMware</span>
                    <span className="badge bg-white text-dark">AWS</span>
                    <span className="badge bg-white text-dark">Google Cloud</span>
                    <span className="badge bg-white text-dark">Azure</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-telephone text-accent me-2"></i>
                    Telecommunications
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-white text-dark">Alcatel-Lucent</span>
                    <span className="badge bg-white text-dark">Ericsson</span>
                    <span className="badge bg-white text-dark">Nokia</span>
                    <span className="badge bg-white text-dark">Avaya</span>
                    <span className="badge bg-white text-dark">Panasonic</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-lightning-charge text-accent me-2"></i>
                    Electrical Systems
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-white text-dark">Legrand</span>
                    <span className="badge bg-white text-dark">GE</span>
                    <span className="badge bg-white text-dark">Eaton</span>
                    <span className="badge bg-white text-dark">Philips</span>
                    <span className="badge bg-white text-dark">LS Electric</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Partners */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Business Partners</h2>
          <p>Strategic collaborations for project delivery</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-building display-5 text-primary me-3"></i>
                    <div>
                      <h5 className="mb-2">Main Contractors</h5>
                      <p className="text-muted small mb-0">We partner with leading construction companies and main contractors for large-scale infrastructure and building projects across Malaysia.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-people display-5 text-info me-3"></i>
                    <div>
                      <h5 className="mb-2">Engineering Consultants</h5>
                      <p className="text-muted small mb-0">Collaboration with registered engineering consultants for design, planning, and technical consultancy services on government and private projects.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-bank display-5 text-success me-3"></i>
                    <div>
                      <h5 className="mb-2">Government Agencies</h5>
                      <p className="text-muted small mb-0">Trusted partner for government ministries and agencies, delivering critical infrastructure and technology solutions for public sector projects.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-gear-wide-connected display-5 text-warning me-3"></i>
                    <div>
                      <h5 className="mb-2">System Integrators</h5>
                      <p className="text-muted small mb-0">Strategic alliances with specialized system integrators for complex ICT, building automation, and smart technology implementations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="section" style={{background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'}}>
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Partnership Benefits</h2>
          <p className="text-white-50">How our partnerships benefit our clients</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="0">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 text-white h-100">
                <i className="bi bi-star display-4 mb-3"></i>
                <h5 className="mb-2">Premium Quality</h5>
                <p className="small mb-0">Access to genuine products and certified solutions from trusted global brands</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 text-white h-100">
                <i className="bi bi-tools display-4 mb-3"></i>
                <h5 className="mb-2">Expert Support</h5>
                <p className="small mb-0">Technical expertise and training from manufacturers and specialists</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 text-white h-100">
                <i className="bi bi-shield-check display-4 mb-3"></i>
                <h5 className="mb-2">Warranty Coverage</h5>
                <p className="small mb-0">Comprehensive manufacturer warranties and after-sales support</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 text-white h-100">
                <i className="bi bi-lightning display-4 mb-3"></i>
                <h5 className="mb-2">Latest Technology</h5>
                <p className="small mb-0">Early access to new products and innovative solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Partner */}
      <section className="section light-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="zoom-in">
              <h2 className="mb-4">Interested in Partnering With Us?</h2>
              <p className="text-muted mb-4">We are always open to exploring new partnerships with technology providers, service companies, and business collaborators who share our commitment to excellence and innovation.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/contact" className="btn btn-primary btn-lg">
                  <i className="bi bi-handshake me-2"></i>Discuss Partnership
                </Link>
                <Link href="/about-us" className="btn btn-outline-primary btn-lg">
                  <i className="bi bi-building me-2"></i>About Our Company
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

