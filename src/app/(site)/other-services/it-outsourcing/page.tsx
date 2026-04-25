export default function ITOutsourcingPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background other-outsourcing-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">IT Outsourcing</h1>
              <p className="text-justify">Focus on your core business while we handle your IT. From helpdesk support to full infrastructure management, our outsourcing services deliver predictable costs, expert staff, and 24/7 coverage without the overhead of hiring in-house teams.</p>
              <div className="d-flex">
                <a href="#models" className="btn-get-started">Explore Models</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/others-hero.png" className="img-fluid animated" alt="IT Outsourcing" />
            </div>
          </div>
        </div>
      </section>

      {/* Outsourcing Models - Section 1 (Light) - Cards with Icons */}
      <section id="models" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Outsourcing Models</h2>
          <p>Choose the level of support that fits your needs.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="text-center mb-4">
                  <i className="bi bi-headset display-3 text-primary mb-3"></i>
                  <h5>Helpdesk Support</h5>
                  <span className="badge bg-light text-dark">Basic</span>
                </div>
                <p className="small text-muted mb-3">Frontline user support via phone, email, or ticketing system. Password resets, software issues, and basic troubleshooting.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-dot"></i>8x5 or 24x7 coverage</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Ticket management system</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Remote support tools</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Knowledge base & FAQs</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 border border-primary border-2">
                <div className="text-center mb-4">
                  <i className="bi bi-tools display-3 text-primary mb-3"></i>
                  <h5>Managed IT Services</h5>
                  <span className="badge bg-primary">Recommended</span>
                </div>
                <p className="small text-muted mb-3">Proactive management of your entire IT infrastructure with monitoring, patching, backup verification, and strategic planning.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-dot"></i>24/7 monitoring & alerting</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Patch management</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Backup verification</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Monthly reporting & reviews</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="text-center mb-4">
                  <i className="bi bi-building display-3 text-primary mb-3"></i>
                  <h5>Full IT Outsourcing</h5>
                  <span className="badge bg-success">Enterprise</span>
                </div>
                <p className="small text-muted mb-3">Complete IT department replacement. We become your IT team with on-site staff, strategic planning, and full operational responsibility.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-dot"></i>Dedicated on-site engineers</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>IT strategy & governance</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Project delivery</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Vendor management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Section 2 (Dark) - Icon Grid */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Why Outsource Your IT?</h2>
          <p className="text-white-50">The business case for IT outsourcing.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-graph-down display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Reduce Costs</h5>
                <p className="text-white-50 small mb-0">30-50% savings vs full-time IT staff with benefits</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-people display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Expert Team</h5>
                <p className="text-white-50 small mb-0">Access to specialists across all IT domains</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-calendar-check display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Predictable Budget</h5>
                <p className="text-white-50 small mb-0">Fixed monthly fees with no surprise expenses</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-bullseye display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Focus on Core Business</h5>
                <p className="text-white-50 small mb-0">Let us handle IT while you focus on growth</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-arrow-repeat display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Scalability</h5>
                <p className="text-white-50 small mb-0">Scale support up or down as business changes</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-clock-history display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">24/7 Coverage</h5>
                <p className="text-white-50 small mb-0">Round-the-clock monitoring and support</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-graph-up display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Proactive Management</h5>
                <p className="text-white-50 small mb-0">Prevent issues before they impact users</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-file-earmark-check display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">SLA Guarantees</h5>
                <p className="text-white-50 small mb-0">Committed uptime and response times</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>What&apos;s Included in Managed IT?</h2>
          <p>Comprehensive coverage for your technology infrastructure.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h5 className="mb-3"><i className="bi bi-diagram-3-fill text-primary me-2"></i>Network Management</h5>
                <p className="small text-muted mb-0">Switches, routers, firewalls, wireless - configuration, monitoring, optimization, and security patching with change management.</p>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h5 className="mb-3"><i className="bi bi-hdd-rack-fill text-primary me-2"></i>Server Management</h5>
                <p className="small text-muted mb-0">Windows/Linux servers, VMs, applications - monitoring, patching, performance tuning, and backup verification.</p>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h5 className="mb-3"><i className="bi bi-shield-lock-fill text-primary me-2"></i>Security Management</h5>
                <p className="small text-muted mb-0">Firewall, antivirus, IPS, vulnerability scanning, and threat response with quarterly security reviews.</p>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h5 className="mb-3"><i className="bi bi-hdd-fill text-primary me-2"></i>Backup & DR Management</h5>
                <p className="small text-muted mb-0">Daily backup monitoring, test restores, retention management, and DR plan maintenance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

