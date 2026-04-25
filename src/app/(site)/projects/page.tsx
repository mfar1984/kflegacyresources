export default function ProjectsPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background projects-page-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Our Projects</h1>
              <p className="text-justify">Explore our portfolio of successful ICT implementations across government, healthcare, education, and enterprise sectors. From network infrastructure to security solutions, we deliver excellence in every project.</p>
              <div className="d-flex">
                <a href="#portfolio" className="btn-get-started">View Portfolio</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/project-hero.png" className="img-fluid animated" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid - Section 1 (Light) */}
      <section id="portfolio" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Featured Projects</h2>
          <p>Delivering excellence across diverse industries and critical infrastructure.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-1.webp" className="card-img-top" alt="MASkargo" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-primary">Logistics</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">MASkargo Sdn Bhd</h5>
                  <p className="card-text small text-muted mb-3">Deployed comprehensive CCTV surveillance system and SMS Blaster notification platform for cargo operations and logistics management.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">CCTV</span>
                    <span className="badge bg-light text-dark">SMS Blaster</span>
                    <span className="badge bg-light text-dark">Logistics</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-3.webp" className="card-img-top" alt="Technology Park Malaysia" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-info">Corporate</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">Technology Park Malaysia</h5>
                  <p className="card-text small text-muted mb-3">Implemented IP surveillance system covering the technology park with high-definition cameras, centralized VMS, and 24/7 monitoring capabilities.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">CCTV</span>
                    <span className="badge bg-light text-dark">Surveillance</span>
                    <span className="badge bg-light text-dark">VMS</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-4.webp" className="card-img-top" alt="Kolej Komuniti" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-success">Education</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">Kolej Komuniti</h5>
                  <p className="card-text small text-muted mb-3">Deployed pfSense network security solution with ControlD DNS filtering for secure internet access, content filtering, and network protection for students and staff.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">pfSense</span>
                    <span className="badge bg-light text-dark">Network Security</span>
                    <span className="badge bg-light text-dark">ControlD</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-7.webp" className="card-img-top" alt="Kolej MARA" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-success">Education</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">Kolej MARA</h5>
                  <p className="card-text small text-muted mb-3">Implemented comprehensive network security infrastructure with firewall, IPS, content filtering, and secure connectivity for student accommodation and campus facilities.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">Network Security</span>
                    <span className="badge bg-light text-dark">Firewall</span>
                    <span className="badge bg-light text-dark">IPS</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-8.webp" className="card-img-top" alt="An-Nur Tailor" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-warning text-dark">SME</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">An-Nur Tailor & Collection</h5>
                  <p className="card-text small text-muted mb-3">Developed responsive company profile website with product catalog, online inquiry system, and mobile-friendly design for tailoring business.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">Web Development</span>
                    <span className="badge bg-light text-dark">Company Profile</span>
                    <span className="badge bg-light text-dark">Responsive</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-9.webp" className="card-img-top" alt="RISDA JARA" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-danger">Government</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">RISDA Bahagian Sibu - Driver Apps JARA</h5>
                  <p className="card-text small text-muted mb-3">Developed mobile application for fleet tracking (Jejak Aset & Rekod Automotif) with GPS integration, maintenance records, and driver management system.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">Mobile App</span>
                    <span className="badge bg-light text-dark">Fleet Management</span>
                    <span className="badge bg-light text-dark">GPS Tracking</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-10.webp" className="card-img-top" alt="ASN Berhad" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-primary">Corporate</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">Amanah Saham Nasional Berhad</h5>
                  <p className="card-text small text-muted mb-3">Supplied and configured enterprise video conferencing system with HD cameras, audio DSP, and collaboration tools for boardroom and meeting spaces.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">Video Conference</span>
                    <span className="badge bg-light text-dark">Collaboration</span>
                    <span className="badge bg-light text-dark">AV Systems</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-1.webp" className="card-img-top" alt="MRSM" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-success">Education</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">MRSM (Maktab Rendah Sains MARA)</h5>
                  <p className="card-text small text-muted mb-3">Supplied 3D printers for STEM education and interactive smart board screens for modern classrooms enhancing student learning experience.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">3D Printer</span>
                    <span className="badge bg-light text-dark">Smart Board</span>
                    <span className="badge bg-light text-dark">Education Tech</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-3.webp" className="card-img-top" alt="PPJUB" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-info">Non-Profit</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">Pertubuhan Pengurusan Jenazah Ummah Bintulu</h5>
                  <p className="card-text small text-muted mb-3">Developed custom E-Kubur management system for grave registration, plot mapping, burial records, and family access portal with mobile app.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">Custom Software</span>
                    <span className="badge bg-light text-dark">Database</span>
                    <span className="badge bg-light text-dark">Mobile App</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-4.webp" className="card-img-top" alt="Future Makers" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-warning text-dark">Enterprise</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">Future Makers</h5>
                  <p className="card-text small text-muted mb-3">Supplied Netgate pfSense appliances (1541 & 8300 models) for high-performance firewall and routing with VPN, IDS/IPS, and traffic shaping capabilities.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">pfSense</span>
                    <span className="badge bg-light text-dark">Netgate</span>
                    <span className="badge bg-light text-dark">Firewall</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-7.webp" className="card-img-top" alt="Atline" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-secondary">Corporate</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">Atline Sdn Bhd</h5>
                  <p className="card-text small text-muted mb-3">Implemented network security infrastructure with pfSense firewall deployment including VPN, intrusion prevention, and advanced threat protection for corporate network.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">pfSense</span>
                    <span className="badge bg-light text-dark">Network Security</span>
                    <span className="badge bg-light text-dark">VPN</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100 overflow-hidden">
                <div className="position-relative">
                  <img src="/assets/img/portfolio/portfolio-8.webp" className="card-img-top" alt="Ansar Technology" style={{height: '240px', objectFit: 'cover'}} />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-danger">Technology</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">Ansar Technology Sdn Bhd</h5>
                  <p className="card-text small text-muted mb-3">Deployed pfSense network security solution with firewall, IPS, web filtering, and VPN for secure remote access and branch connectivity.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark">pfSense</span>
                    <span className="badge bg-light text-dark">Network Security</span>
                    <span className="badge bg-light text-dark">IPS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Highlights - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Success Stories</h2>
          <p className="text-white-50">Client challenges we solved with innovative ICT solutions.</p>
        </div>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <div className="mb-3">
                  <span className="badge bg-primary mb-2">Case Study</span>
                  <h4 className="mb-3">Network Modernization for Public Sector</h4>
                </div>
                <div className="mb-4">
                  <h6 className="text-primary mb-2">Challenge</h6>
                  <p className="small text-muted">Legacy network infrastructure causing downtime, security vulnerabilities, and poor performance across 15 offices.</p>
                </div>
                <div className="mb-4">
                  <h6 className="text-primary mb-2">Solution</h6>
                  <p className="small text-muted">Designed and deployed Cisco SD-WAN with next-gen firewalls, unified threat management, and centralized monitoring. Migrated to fiber connectivity with automatic failover.</p>
                </div>
                <div>
                  <h6 className="text-primary mb-2">Results</h6>
                  <ul className="list-unstyled small text-muted mb-0">
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>99.9% uptime achieved</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>50% reduction in network incidents</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>30% cost savings on bandwidth</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Enhanced security posture with zero breaches</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <div className="mb-3">
                  <span className="badge bg-success mb-2">Case Study</span>
                  <h4 className="mb-3">Smart Surveillance for Smart City</h4>
                </div>
                <div className="mb-4">
                  <h6 className="text-success mb-2">Challenge</h6>
                  <p className="small text-muted">City council needed integrated surveillance covering public areas, traffic monitoring, and emergency response coordination.</p>
                </div>
                <div className="mb-4">
                  <h6 className="text-success mb-2">Solution</h6>
                  <p className="small text-muted">Deployed 500+ Hikvision AI cameras with Milestone XProtect VMS, LPR integration, and command center with video wall. Integration with emergency services and traffic management systems.</p>
                </div>
                <div>
                  <h6 className="text-success mb-2">Results</h6>
                  <ul className="list-unstyled small text-muted mb-0">
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>24/7 monitoring & rapid response</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>40% reduction in crime rate</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Improved traffic flow management</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Enhanced public safety & confidence</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Stats - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-building display-3 text-primary mb-3"></i>
                <h3 className="mb-2">150+</h3>
                <p className="text-muted mb-0">Projects Completed</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-people display-3 text-primary mb-3"></i>
                <h3 className="mb-2">80+</h3>
                <p className="text-muted mb-0">Satisfied Clients</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-globe display-3 text-primary mb-3"></i>
                <h3 className="mb-2">12</h3>
                <p className="text-muted mb-0">States Covered</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-award display-3 text-primary mb-3"></i>
                <h3 className="mb-2">99%</h3>
                <p className="text-muted mb-0">Client Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Served - Section 4 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Industries We Serve</h2>
          <p className="text-white-50">Trusted by leading organizations across diverse sectors.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-bank2 display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Government & Public Sector</h5>
                <p className="text-white-50 small mb-3">Federal agencies, state departments, and local councils trust us for critical infrastructure, secure networks, and compliance-ready solutions.</p>
                <p className="text-white small mb-0"><strong>Notable Projects:</strong> Ministry network upgrade, district office connectivity, public safety surveillance.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-hospital display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Healthcare</h5>
                <p className="text-white-50 small mb-3">Hospitals, clinics, and medical facilities rely on our secure, high-availability solutions for patient care, records, and facility management.</p>
                <p className="text-white small mb-0"><strong>Notable Projects:</strong> Hospital IP surveillance, clinic networks, medical records infrastructure.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-mortarboard display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Education</h5>
                <p className="text-white-50 small mb-3">Schools, universities, and training centers choose us for wireless campuses, e-learning infrastructure, and student/staff connectivity.</p>
                <p className="text-white small mb-0"><strong>Notable Projects:</strong> Campus WiFi, smart classrooms, student portal infrastructure.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-building display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Corporate & Enterprise</h5>
                <p className="text-white-50 small mb-3">Fortune 500 companies and SMEs depend on our enterprise networking, security, and unified communications solutions.</p>
                <p className="text-white small mb-0"><strong>Notable Projects:</strong> HQ network redesign, branch SD-WAN, data center consolidation.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-cart display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Retail & Hospitality</h5>
                <p className="text-white-50 small mb-3">Retail chains and hotels trust our POS networks, guest WiFi, surveillance, and inventory management infrastructure.</p>
                <p className="text-white small mb-0"><strong>Notable Projects:</strong> Multi-store network, hotel guest WiFi, retail surveillance.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-lightning-charge display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Utilities & Infrastructure</h5>
                <p className="text-white-50 small mb-3">Energy, water, and transportation providers choose us for SCADA networks, remote monitoring, and industrial security solutions.</p>
                <p className="text-white small mb-0"><strong>Notable Projects:</strong> Substation networks, SCADA security, facility surveillance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Section 5 (Light) */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>What Our Clients Say</h2>
          <p>Real feedback from real projects.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                </div>
                <p className="mb-3 fst-italic">&quot;KF Legacy delivered our network upgrade on time and within budget. Their technical expertise and professionalism exceeded our expectations.&quot;</p>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <img src="/assets/img/person/person-m-6.webp" className="rounded-circle" alt="Client" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                  </div>
                  <div>
                    <strong className="d-block">Ahmad bin Abdullah</strong>
                    <small className="text-muted">IT Director, Government Agency</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                </div>
                <p className="mb-3 fst-italic">&quot;The surveillance system has transformed our security operations. Clear footage, reliable recording, and easy management make this investment worthwhile.&quot;</p>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <img src="/assets/img/person/person-f-4.webp" className="rounded-circle" alt="Client" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                  </div>
                  <div>
                    <strong className="d-block">Dr. Sarah Lee</strong>
                    <small className="text-muted">Facility Manager, Hospital</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                </div>
                <p className="mb-3 fst-italic">&quot;Excellent support from design to deployment. The wireless network handles thousands of students seamlessly. Highly recommended!&quot;</p>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <img src="/assets/img/person/person-m-7.webp" className="rounded-circle" alt="Client" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                  </div>
                  <div>
                    <strong className="d-block">Prof. Ramesh Kumar</strong>
                    <small className="text-muted">CIO, University</small>
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

