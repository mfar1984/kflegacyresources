export default function InternetIntranetSolutionsPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background network-internet-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Internet & Intranet Solutions</h1>
              <p className="text-justify">Connect your organization with reliable, high-speed internet and secure intranet infrastructure. From fiber connectivity to VPN tunnels, we deliver seamless communication for offices, branches, and remote workers.</p>
              <div className="d-flex">
                <a href="#connectivity" className="btn-get-started">Explore Connectivity</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/internet-hero.png" className="img-fluid animated" alt="Internet & Intranet Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* Connectivity Options - Section 1 (Light) */}
      <section id="connectivity" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Connectivity Solutions</h2>
          <p>High-speed, reliable internet and private network options.</p>
        </div>
        <div className="container">
          <div className="row g-4 mb-5">
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-4">
                  <i className="bi bi-globe2 display-3 text-primary"></i>
                  <h3 className="mt-3 mb-3">Internet Connectivity</h3>
                </div>
                <p className="mb-4">Enterprise-grade internet access with SLA guarantees, symmetric bandwidth, and redundant paths for business continuity.</p>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="p-3 rounded bg-light">
                      <h6 className="mb-2"><i className="bi bi-lightning text-primary me-2"></i>Fiber Broadband</h6>
                      <p className="small text-muted mb-0">Up to 10Gbps symmetric with ultra-low latency for headquarters and data centers</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 rounded bg-light">
                      <h6 className="mb-2"><i className="bi bi-broadcast text-primary me-2"></i>Wireless WAN (4G/5G)</h6>
                      <p className="small text-muted mb-0">Cellular connectivity for remote sites, temporary offices, or failover backup</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 rounded bg-light">
                      <h6 className="mb-2"><i className="bi bi-hdd-network text-primary me-2"></i>MPLS / Metro-E</h6>
                      <p className="small text-muted mb-0">Private lines with guaranteed bandwidth and QoS for mission-critical applications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-4">
                  <i className="bi bi-building display-3 text-primary"></i>
                  <h3 className="mt-3 mb-3">Intranet Infrastructure</h3>
                </div>
                <p className="mb-4">Secure internal networks for file sharing, collaboration, and business applications with centralized management and access control.</p>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="p-3 rounded bg-light">
                      <h6 className="mb-2"><i className="bi bi-lock text-primary me-2"></i>VPN Connectivity</h6>
                      <p className="small text-muted mb-0">Site-to-site and remote access VPN with IPsec, OpenVPN, or WireGuard encryption</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 rounded bg-light">
                      <h6 className="mb-2"><i className="bi bi-folder2 text-primary me-2"></i>File Servers & Collaboration</h6>
                      <p className="small text-muted mb-0">Windows file shares, NAS storage, and SharePoint for document management</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 rounded bg-light">
                      <h6 className="mb-2"><i className="bi bi-person-badge text-primary me-2"></i>Active Directory & SSO</h6>
                      <p className="small text-muted mb-0">Centralized authentication with single sign-on for seamless access to internal resources</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-primary text-white text-center">
                <h5 className="mb-2">Redundancy & High Availability</h5>
                <p className="mb-0">Dual ISP failover, load balancing, and automatic path selection ensure 99.9% uptime for your business operations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-speedometer display-3 text-primary mb-3"></i>
                <h5 className="mb-2">High Performance</h5>
                <p className="small text-muted mb-0">Dedicated bandwidth with SLA guarantees</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-shield-check display-3 text-primary mb-3"></i>
                <h5 className="mb-2">Secure Connectivity</h5>
                <p className="small text-muted mb-0">Encrypted VPN tunnels and firewall protection</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-arrow-clockwise display-3 text-primary mb-3"></i>
                <h5 className="mb-2">Automatic Failover</h5>
                <p className="small text-muted mb-0">Seamless backup with zero downtime</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-arrow-repeat display-3 text-primary mb-3"></i>
                <h5 className="mb-2">Scalable Architecture</h5>
                <p className="small text-muted mb-0">Grow bandwidth as your business expands</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

