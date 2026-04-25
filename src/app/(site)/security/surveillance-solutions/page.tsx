export default function SurveillanceSolutionsPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background security-surveillance-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Surveillance Solutions</h1>
              <p className="text-justify">Protect your facilities with professional IP surveillance. From AI-powered cameras to enterprise video management systems, we deliver 24/7 monitoring, forensic playback, and intelligent analytics for security, safety, and operational insights.</p>
              <div className="d-flex">
                <a href="#systems" className="btn-get-started">Explore Systems</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/security-hero.png" className="img-fluid animated" alt="Surveillance Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* System Components - Section 1 (Light) - Centered Cards */}
      <section id="systems" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Surveillance System Components</h2>
          <p>End-to-end IP video surveillance architecture.</p>
        </div>
        <div className="container">
          <div className="row g-4 justify-content-center mb-5">
            <div className="col-lg-10" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-primary text-white text-center">
                <h3 className="mb-3">Complete IP Surveillance Ecosystem</h3>
                <p className="mb-0">Cameras → Network → Recording → Management → Analytics → Display</p>
              </div>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-camera-video display-3 text-primary mb-3"></i>
                <h5 className="mb-3">IP Cameras</h5>
                <p className="small text-muted mb-3">2MP to 12MP resolution with WDR, starlight, and AI analytics</p>
                <ul className="list-unstyled small text-start">
                  <li className="mb-2"><i className="bi bi-dot"></i>Dome, bullet, PTZ, fisheye</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Indoor & outdoor (IP66/IP67)</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>IR & thermal imaging</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>PoE powered</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-hdd-rack display-3 text-primary mb-3"></i>
                <h5 className="mb-3">Network Video Recorders</h5>
                <p className="small text-muted mb-3">Enterprise NVRs with RAID, hot-swap, and redundancy</p>
                <ul className="list-unstyled small text-start">
                  <li className="mb-2"><i className="bi bi-dot"></i>4 to 128 channels</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>RAID 5/6/10 storage</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Redundant power supplies</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>30+ days retention</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-display display-3 text-primary mb-3"></i>
                <h5 className="mb-3">Video Management Software</h5>
                <p className="small text-muted mb-3">Centralized VMS for multi-site monitoring and playback</p>
                <ul className="list-unstyled small text-start">
                  <li className="mb-2"><i className="bi bi-dot"></i>Milestone XProtect</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Hikvision iVMS</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Multi-server federation</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Mobile app access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Analytics - Section 2 (Dark) - Feature Highlight */}
      <section className="section dark-background">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center" data-aos="fade-up">
              <i className="bi bi-cpu display-1 text-accent mb-4"></i>
              <h2 className="text-white mb-3">AI-Powered Video Analytics</h2>
              <p className="text-white-50 mb-0">Turn cameras into intelligent sensors with deep learning analytics.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-person-bounding-box display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Face Recognition</h5>
                <p className="small text-muted mb-0">Identify VIPs, blacklist suspects, and track attendance</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-car-front display-4 text-primary mb-3"></i>
                <h5 className="mb-3">License Plate Recognition</h5>
                <p className="small text-muted mb-0">Automated vehicle access and parking management</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-people display-4 text-primary mb-3"></i>
                <h5 className="mb-3">People Counting</h5>
                <p className="small text-muted mb-0">Occupancy tracking and crowd analytics for retail/venues</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-exclamation-triangle display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Intrusion Detection</h5>
                <p className="small text-muted mb-0">Perimeter protection with line-crossing and zone alerts</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-bicycle display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Loitering Detection</h5>
                <p className="small text-muted mb-0">Alert when someone stays in area too long</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-bag-x display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Object Removal/Left Behind</h5>
                <p className="small text-muted mb-0">Detect missing or abandoned objects</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-thermometer-half display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Thermal Screening</h5>
                <p className="small text-muted mb-0">Body temperature detection for health screening</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-bar-chart display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Heat Mapping</h5>
                <p className="small text-muted mb-0">Customer behavior and traffic flow analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Types - Section 3 (Light) - Comparison Table */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Deployment Options</h2>
          <p>Choose the architecture that fits your needs.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <span className="badge bg-primary mb-3">Small - Medium</span>
                  <h5>Standalone NVR</h5>
                </div>
                <p className="small text-muted mb-3">4-64 cameras, single-site, local recording and playback.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Simple setup</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Low cost</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Local storage</li>
                  <li className="mb-2"><i className="bi bi-x text-danger me-2"></i>Limited scalability</li>
                  <li className="mb-2"><i className="bi bi-x text-danger me-2"></i>No centralized management</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 border border-primary border-2">
                <div className="mb-3">
                  <span className="badge bg-success mb-3">Recommended</span>
                  <h5>Enterprise VMS</h5>
                </div>
                <p className="small text-muted mb-3">Unlimited cameras, multi-site, centralized management and analytics.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Unlimited scalability</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Multi-site federation</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Advanced analytics</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Open platform (10,000+ cameras)</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Mobile & web access</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <span className="badge bg-info mb-3">Cloud-Based</span>
                  <h5>VSaaS (Cloud)</h5>
                </div>
                <p className="small text-muted mb-3">Cloud storage and management, no on-prem servers required.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>No NVR hardware</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Access from anywhere</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i>Automatic updates</li>
                  <li className="mb-2"><i className="bi bi-x text-danger me-2"></i>Recurring subscription</li>
                  <li className="mb-2"><i className="bi bi-x text-danger me-2"></i>Bandwidth intensive</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - Section 2 (Dark) - Icon Grid */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Surveillance Use Cases</h2>
          <p className="text-white-50">Applications across industries.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-shop display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Retail Loss Prevention</h5>
                <p className="text-white-50 small mb-0">Deter shoplifting, monitor cash registers, and analyze customer behavior</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-hospital display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Hospital Security</h5>
                <p className="text-white-50 small mb-0">Patient safety, restricted area monitoring, and incident documentation</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-building display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Corporate Offices</h5>
                <p className="text-white-50 small mb-0">Lobby monitoring, parking, and perimeter protection for access control integration</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-mortarboard display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Campus Safety</h5>
                <p className="text-white-50 small mb-0">Student safety, visitor tracking, and emergency response coordination</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-hammer display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Manufacturing</h5>
                <p className="text-white-50 small mb-0">Production monitoring, quality control, and workplace safety compliance</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-bank display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Government Facilities</h5>
                <p className="text-white-50 small mb-0">High-security monitoring with audit trails and encrypted storage</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-truck-front display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Transportation Hubs</h5>
                <p className="text-white-50 small mb-0">Airport, bus terminal, train station security and passenger monitoring</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-globe display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Smart Cities</h5>
                <p className="text-white-50 small mb-0">Public safety, traffic monitoring, and emergency response integration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - Section 3 (Light) - Two Column List */}
      <section className="section light-background">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6" data-aos="fade-right">
              <h3 className="mb-4">System Capabilities</h3>
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm d-flex flex-column" style={{minHeight: '140px'}}>
                    <h6 className="mb-2"><i className="bi bi-calendar3 text-primary me-2"></i>Continuous Recording & Retention</h6>
                    <p className="small text-muted mb-0">24/7 recording with configurable retention (7 days to 1 year+) and automated archival to NAS or cloud.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm d-flex flex-column" style={{minHeight: '140px'}}>
                    <h6 className="mb-2"><i className="bi bi-search text-primary me-2"></i>Smart Search & Playback</h6>
                    <p className="small text-muted mb-0">Search by time, camera, event, or AI metadata. Export clips with watermarking for evidence.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm d-flex flex-column" style={{minHeight: '140px'}}>
                    <h6 className="mb-2"><i className="bi bi-bell text-primary me-2"></i>Real-Time Alerts</h6>
                    <p className="small text-muted mb-0">Email, SMS, or push notifications for motion, tampering, analytics events, and system health.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <h3 className="mb-4">Enterprise Features</h3>
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm d-flex flex-column" style={{minHeight: '140px'}}>
                    <h6 className="mb-2"><i className="bi bi-diagram-3 text-primary me-2"></i>Multi-Site Management</h6>
                    <p className="small text-muted mb-0">Centralized view of all sites with role-based access and delegated administration.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm d-flex flex-column" style={{minHeight: '140px'}}>
                    <h6 className="mb-2"><i className="bi bi-grid-3x3 text-primary me-2"></i>Video Wall & Control Room</h6>
                    <p className="small text-muted mb-0">Multi-monitor displays with flexible layouts, PTZ joystick control, and alarm management.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm d-flex flex-column" style={{minHeight: '140px'}}>
                    <h6 className="mb-2"><i className="bi bi-phone text-primary me-2"></i>Mobile Access</h6>
                    <p className="small text-muted mb-0">iOS and Android apps for live view, playback, PTZ control, and push notifications anywhere.</p>
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

