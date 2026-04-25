import Link from "next/link";

export default function NetworkPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background network-main-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Network Solutions</h1>
              <p className="text-justify">Design, deploy, and manage enterprise network infrastructure. From high-speed connectivity to intelligent bandwidth management, we deliver networks that are secure, scalable, and optimized for your business.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Our Services</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/network-hero.png" className="img-fluid animated" alt="Network Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Section 1 (Light) */}
      <section id="services" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Network Services</h2>
          <p>Comprehensive networking solutions for modern enterprises.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up">
              <Link href="/network/bandwidth-management" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-4">
                    <i className="bi bi-speedometer2 display-3 text-primary me-4"></i>
                    <div className="flex-grow-1">
                      <h4 className="mb-2">Bandwidth Management</h4>
                      <p className="text-muted small mb-0">Traffic Shaping & QoS</p>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                  <p className="text-muted mb-3">Optimize network performance with intelligent traffic control, application prioritization, and fair usage policies for consistent user experience.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">QoS</span>
                    <span className="badge bg-light text-dark">Traffic Shaping</span>
                    <span className="badge bg-light text-dark">Monitoring</span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <Link href="/network/internet-intranet-solutions" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-4">
                    <i className="bi bi-globe2 display-3 text-primary me-4"></i>
                    <div className="flex-grow-1">
                      <h4 className="mb-2">Internet & Intranet Solutions</h4>
                      <p className="text-muted small mb-0">Connectivity & VPN</p>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                  <p className="text-muted mb-3">High-speed internet access, fiber connectivity, VPN tunnels, and secure intranet infrastructure for offices, branches, and remote workers.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">Fiber</span>
                    <span className="badge bg-light text-dark">VPN</span>
                    <span className="badge bg-light text-dark">SD-WAN</span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-up">
              <Link href="/network/infrastructure-setup" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-4">
                    <i className="bi bi-diagram-3-fill display-3 text-primary me-4"></i>
                    <div className="flex-grow-1">
                      <h4 className="mb-2">Network Infrastructure Setup</h4>
                      <p className="text-muted small mb-0">Cabling, Switching & Wireless</p>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                  <p className="text-muted mb-3">Professional structured cabling, enterprise switches, routers, and wireless infrastructure with certified installation and documentation.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">Cabling</span>
                    <span className="badge bg-light text-dark">Switches</span>
                    <span className="badge bg-light text-dark">WiFi</span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <Link href="/network/management-solutions" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-4">
                    <i className="bi bi-graph-up-arrow display-3 text-primary me-4"></i>
                    <div className="flex-grow-1">
                      <h4 className="mb-2">Network Management Solutions</h4>
                      <p className="text-muted small mb-0">Monitoring & Control</p>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                  <p className="text-muted mb-3">Centralized network monitoring, configuration management, and analytics with cloud or on-premises platforms for proactive operations.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">NMS</span>
                    <span className="badge bg-light text-dark">Cloud Managed</span>
                    <span className="badge bg-light text-dark">Analytics</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Why Choose Our Network Solutions?</h2>
          <p className="text-white-50">Proven expertise and trusted partnerships.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-award display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Certified Engineers</h5>
                <p className="text-white-50 small mb-0">CCNA, CCNP, Aruba certified professionals</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-building display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">100+ Projects</h5>
                <p className="text-white-50 small mb-0">Enterprise deployments across Malaysia</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-clock-history display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">24/7 Support</h5>
                <p className="text-white-50 small mb-0">Round-the-clock monitoring and assistance</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-handshake display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Trusted Partners</h5>
                <p className="text-white-50 small mb-0">Cisco, Aruba, TP-Link authorized</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-primary text-white">
                <h3 className="mb-3">Need Network Solutions?</h3>
                <p className="mb-4">Let&apos;s discuss your requirements. We&apos;ll design a network that supports your business goals.</p>
                <Link href="/request-quotation" className="btn btn-light btn-lg">Request Quotation</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
