export default function InfrastructureSetupPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background network-infra-hero" style={{
        backgroundImage: 'url(/assets/img/background/infrastructure.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Network Infrastructure Setup</h1>
              <p className="text-justify">Build a robust, scalable network foundation from the ground up. We design and deploy structured cabling, switching, routing, and wireless infrastructure engineered for performance, reliability, and future growth.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Our Services</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/infrastructure-hero.png" className="img-fluid animated" alt="Network Infrastructure Setup" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Services - Section 1 (Light) - Centered Grid */}
      <section id="services" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Infrastructure Services</h2>
          <p>End-to-end network design, deployment, and commissioning.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-diagram-3-fill display-3 text-primary mb-4"></i>
                <h4 className="mb-3">Structured Cabling</h4>
                <p className="mb-3">Professional Cat6/Cat6A/Cat7 and fiber optic cabling with certified installation, testing, and documentation.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Horizontal & vertical cabling</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Patch panels & cable management</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Fiber backbone (SM/MM)</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Certification & testing reports</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>25-year warranty</li>
                </ul>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-hdd-network-fill display-3 text-primary mb-4"></i>
                <h4 className="mb-3">Switching & Routing</h4>
                <p className="mb-3">Enterprise switches and routers with PoE, 10G uplinks, redundancy, and advanced features for core, distribution, and access layers.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Cisco, Aruba, HP networking</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Stacking & VSS/VSF</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>PoE/PoE+ for devices</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Layer 3 routing & VLAN</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Redundant power & uplinks</li>
                </ul>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-wifi display-3 text-primary mb-4"></i>
                <h4 className="mb-3">Wireless Infrastructure</h4>
                <p className="mb-3">Enterprise WiFi with seamless coverage, high density support, and centralized management for offices, campuses, and public venues.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Wi-Fi 6/6E access points</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Controller-based or cloud-managed</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Guest portal & BYOD support</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>RF survey & heatmap optimization</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Roaming & load balancing</li>
                </ul>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-server display-3 text-primary mb-4"></i>
                <h4 className="mb-3">Data Center & Rack Setup</h4>
                <p className="mb-3">Professional rack mounting, cable management, power distribution, and cooling for server rooms and data centers.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>42U server racks with PDU</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Hot/cold aisle containment</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>UPS & redundant power</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Environmental monitoring</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Cable ladder & trunking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Approach - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <h2 className="text-white mb-3">Our Design Approach</h2>
              <p className="text-white-50">We follow industry best practices and standards to ensure your network is built right the first time.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4" data-aos="fade-right">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3">1. Site Survey & Assessment</h5>
                <p className="small text-muted mb-0">Physical walk-through, measurements, existing infrastructure audit, and requirements gathering. We identify challenges early and plan accordingly.</p>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3">2. Detailed Design & BOQ</h5>
                <p className="small text-muted mb-0">CAD drawings, IP addressing scheme, VLAN design, and bill of quantities with equipment specs, pricing, and delivery timelines.</p>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-left">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3">3. Professional Installation</h5>
                <p className="small text-muted mb-0">Certified technicians, clean cable runs, proper termination, labeling, testing, and handover with as-built documentation and warranty.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standards & Certifications - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Standards & Certifications</h2>
          <p>We adhere to international standards for quality and compliance.</p>
        </div>
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-award-fill display-4 text-primary mb-3"></i>
                <h5 className="mb-2">TIA/EIA-568</h5>
                <p className="small text-muted mb-0">Structured cabling standards compliance</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-patch-check-fill display-4 text-primary mb-3"></i>
                <h5 className="mb-2">ISO/IEC 11801</h5>
                <p className="small text-muted mb-0">International cabling standard</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-file-earmark-check-fill display-4 text-primary mb-3"></i>
                <h5 className="mb-2">BICSI Certified</h5>
                <p className="small text-muted mb-0">Industry-recognized cabling certification</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-clipboard-check-fill display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Fluke Certified</h5>
                <p className="small text-muted mb-0">Testing with Fluke DSX/DTX analyzers</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

