import Link from "next/link";

export default function SecurityPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background security-main-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Security Solutions</h1>
              <p className="text-justify">Protect your organization with multi-layered security. From network firewalls to video surveillance and security assessments, we deliver comprehensive protection against cyber threats and physical risks.</p>
              <div className="d-flex">
                <a href="#solutions" className="btn-get-started">Explore Security</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/security-hero.png" className="img-fluid animated" alt="Security Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Section 1 (Light) */}
      <section id="solutions" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Security Services</h2>
          <p>Comprehensive protection for your digital and physical assets.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4" data-aos="fade-up">
              <Link href="/security/network-security-solutions" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card text-center">
                  <i className="bi bi-shield-fill-check display-1 text-primary mb-4"></i>
                  <h4 className="mb-3">Network Security Solutions</h4>
                  <p className="text-muted mb-4">Firewalls, IPS, VPN, and threat intelligence for comprehensive network protection against cyber attacks.</p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <span className="badge bg-light text-dark">NGFW</span>
                    <span className="badge bg-light text-dark">IPS</span>
                    <span className="badge bg-light text-dark">VPN</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-primary">Learn More <i className="bi bi-arrow-right"></i></span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <Link href="/security/spa" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card text-center">
                  <i className="bi bi-clipboard-data display-1 text-primary mb-4"></i>
                  <h4 className="mb-3">Security Posture Assessment</h4>
                  <p className="text-muted mb-4">Comprehensive security evaluation with vulnerability scanning, policy review, and actionable remediation roadmap.</p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <span className="badge bg-light text-dark">Assessment</span>
                    <span className="badge bg-light text-dark">Compliance</span>
                    <span className="badge bg-light text-dark">Audit</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-primary">Learn More <i className="bi bi-arrow-right"></i></span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <Link href="/security/surveillance-solutions" className="text-decoration-none">
                <div className="p-5 rounded-3 bg-white shadow-sm h-100 service-hover-card text-center">
                  <i className="bi bi-camera-video-fill display-1 text-primary mb-4"></i>
                  <h4 className="mb-3">Surveillance Solutions</h4>
                  <p className="text-muted mb-4">Professional IP surveillance with AI analytics, centralized VMS, and 24/7 monitoring for facilities and perimeters.</p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <span className="badge bg-light text-dark">CCTV</span>
                    <span className="badge bg-light text-dark">AI Analytics</span>
                    <span className="badge bg-light text-dark">VMS</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-primary">Learn More <i className="bi bi-arrow-right"></i></span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Challenges - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Modern Security Challenges</h2>
          <p className="text-white-50">Threats are evolving. Your defenses must evolve faster.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-bug-fill display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Cyber Attacks</h5>
                <p className="text-white-50 small mb-0">Ransomware, phishing, and zero-day exploits</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-person-x-fill display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Insider Threats</h5>
                <p className="text-white-50 small mb-0">Malicious or negligent employees</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-file-earmark-lock-fill display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Data Breaches</h5>
                <p className="text-white-50 small mb-0">Unauthorized access and data exfiltration</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-exclamation-triangle-fill display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Compliance Risk</h5>
                <p className="text-white-50 small mb-0">Regulatory penalties and audit failures</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h2 className="text-primary mb-2">50+</h2>
                <p className="text-muted mb-0">Security Projects Delivered</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h2 className="text-primary mb-2">99.9%</h2>
                <p className="text-muted mb-0">Uptime SLA Achievement</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h2 className="text-primary mb-2">5,000+</h2>
                <p className="text-muted mb-0">Cameras Installed</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h2 className="text-primary mb-2">Zero</h2>
                <p className="text-muted mb-0">Major Security Breaches</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
