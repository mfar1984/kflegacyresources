export default function BarcodeRFIDPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background barcode-page-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Barcode & RFID Solutions</h1>
              <p className="text-justify">Transform your operations with automated identification and tracking. From inventory management to asset tracking, our barcode and RFID solutions deliver accuracy, efficiency, and real-time visibility across your supply chain.</p>
              <div className="d-flex">
                <a href="#solutions" className="btn-get-started">Explore Solutions</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/barcode-hero.png" className="img-fluid animated" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Overview - Section 1 (Light) */}
      <section id="solutions" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Auto-ID Solutions</h2>
          <p>Comprehensive barcode and RFID systems for tracking, traceability, and operational excellence.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <div className="text-center mb-4">
                  <i className="bi bi-upc-scan display-1 text-primary mb-3"></i>
                  <h3 className="mb-3">Barcode Systems</h3>
                </div>
                <p className="mb-4">Proven, cost-effective identification technology for inventory, assets, and products. From 1D linear codes to 2D matrix symbologies, barcode systems deliver reliable scanning and data capture.</p>
                <h5 className="mb-3">Key Features</h5>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>1D & 2D Barcode Scanning</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Mobile & Fixed Scanners</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Label Printing Solutions</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Inventory Management Software</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Integration with ERP/WMS</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <div className="text-center mb-4">
                  <i className="bi bi-broadcast display-1 text-primary mb-3"></i>
                  <h3 className="mb-3">RFID Systems</h3>
                </div>
                <p className="mb-4">Advanced radio-frequency identification for non-contact, bulk reading and real-time tracking. RFID enables faster operations, improved accuracy, and enhanced visibility across the supply chain.</p>
                <h5 className="mb-3">Key Features</h5>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Passive & Active RFID Tags</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Fixed & Handheld Readers</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>UHF, HF, LF Frequency Support</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Real-Time Asset Tracking</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Middleware & Cloud Integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Applications</h2>
          <p className="text-white-50">Barcode and RFID solutions across industries and use cases.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-box-seam display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Inventory Management</h5>
                <p className="text-white-50 small mb-0">Track stock levels, movements, and replenishment with real-time visibility and automated alerts.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-truck display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Supply Chain & Logistics</h5>
                <p className="text-white-50 small mb-0">End-to-end traceability from receiving to shipping with proof of delivery and exception handling.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-building display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Asset Tracking</h5>
                <p className="text-white-50 small mb-0">Monitor IT equipment, tools, and fixed assets with location tracking and maintenance records.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-cart-check display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Retail & POS</h5>
                <p className="text-white-50 small mb-0">Fast checkout, price verification, and product lookup with handheld or countertop scanners.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-file-earmark-medical display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Healthcare & Pharmacy</h5>
                <p className="text-white-50 small mb-0">Patient wristbands, medication tracking, and specimen labeling for safety and compliance.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-hammer display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Manufacturing</h5>
                <p className="text-white-50 small mb-0">Work-in-progress tracking, quality control, and production line automation with real-time data.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-book display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Library & Document</h5>
                <p className="text-white-50 small mb-0">Automated check-in/out, self-service kiosks, and inventory management for libraries and archives.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-person-badge display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Access Control</h5>
                <p className="text-white-50 small mb-0">Employee badges, visitor management, and time & attendance with RFID card readers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="mb-4">Why Choose Auto-ID Solutions?</h2>
              <p className="mb-4">Barcode and RFID technologies eliminate manual data entry, reduce errors, and provide real-time visibility into your operations. The ROI is measurable through labor savings, inventory accuracy, and operational efficiency.</p>
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-primary text-white">
                    <div className="row text-center">
                      <div className="col-4">
                        <h3 className="mb-1">99.9%</h3>
                        <p className="small mb-0">Scan Accuracy</p>
                      </div>
                      <div className="col-4">
                        <h3 className="mb-1">80%</h3>
                        <p className="small mb-0">Time Savings</p>
                      </div>
                      <div className="col-4">
                        <h3 className="mb-1">50%</h3>
                        <p className="small mb-0">Error Reduction</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <i className="bi bi-lightning-charge-fill display-5 text-primary me-3"></i>
                    <div>
                      <h5 className="mb-2">Faster Operations</h5>
                      <p className="small text-muted mb-0">Reduce cycle times with instant scanning and automated data capture. Speed up receiving, picking, packing, and shipping processes.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <i className="bi bi-check-circle-fill display-5 text-primary me-3"></i>
                    <div>
                      <h5 className="mb-2">Improved Accuracy</h5>
                      <p className="small text-muted mb-0">Eliminate manual entry errors and ensure data integrity. Barcode/RFID accuracy rates exceed 99.9% compared to manual methods.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <i className="bi bi-eye-fill display-5 text-primary me-3"></i>
                    <div>
                      <h5 className="mb-2">Real-Time Visibility</h5>
                      <p className="small text-muted mb-0">Know exactly what you have, where it is, and when it moved. Cloud dashboards provide instant insights and analytics.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <i className="bi bi-cash-coin display-5 text-primary me-3"></i>
                    <div>
                      <h5 className="mb-2">Cost Savings</h5>
                      <p className="small text-muted mb-0">Reduce labor costs, minimize shrinkage, optimize stock levels, and avoid stockouts with automated tracking and alerts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products & Hardware - Section 4 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Products & Hardware</h2>
          <p className="text-white-50">Enterprise-grade scanners, printers, and readers from trusted brands.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-phone display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Handheld Scanners</h5>
                <p className="small text-muted mb-3">Wireless 1D/2D barcode scanners with Bluetooth connectivity and long battery life.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-dot"></i>Zebra, Honeywell, Datalogic</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Rugged & IP-rated options</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Batch & real-time modes</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-printer display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Label Printers</h5>
                <p className="small text-muted mb-3">Thermal transfer and direct thermal printers for labels, tags, and wristbands.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-dot"></i>Desktop & industrial models</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>RFID encoding capability</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Durable, high-resolution output</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-tablet display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Mobile Computers</h5>
                <p className="small text-muted mb-3">Rugged handheld terminals with integrated scanners and Android/Windows OS.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-dot"></i>Touchscreen with stylus/glove support</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>WiFi, 4G/5G connectivity</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Drop-rated & sealed for harsh environments</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-inbox display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Fixed RFID Readers</h5>
                <p className="small text-muted mb-3">Portal and overhead readers for automatic capture at doorways, conveyors, and loading docks.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-dot"></i>Multi-tag simultaneous reading</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Long read range (up to 10m)</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>PoE & network integration</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-receipt display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Receipt & Ticket Printers</h5>
                <p className="small text-muted mb-3">Thermal printers for receipts, tickets, and shipping labels with USB/Ethernet/Bluetooth.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-dot"></i>High-speed printing</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Compact & reliable</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Compatible with POS systems</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-tag display-4 text-primary mb-3"></i>
                <h5 className="mb-3">RFID Tags & Labels</h5>
                <p className="small text-muted mb-3">Passive and active tags in various form factors for assets, apparel, pallets, and products.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-dot"></i>Customizable data encoding</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>Durable adhesive & mounting</li>
                  <li className="mb-2"><i className="bi bi-dot"></i>EPC Gen2, NFC compatible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow - Section 5 (Light) */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Our Implementation Process</h2>
          <p>From consultation to support, we guide you every step of the way.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="fade-up">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                    <h4 className="mb-0">1</h4>
                  </div>
                </div>
                <h5 className="mb-3">Consultation & Assessment</h5>
                <p className="small text-muted mb-0">We analyze your workflows, pain points, and requirements to recommend the right technology and architecture.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                    <h4 className="mb-0">2</h4>
                  </div>
                </div>
                <h5 className="mb-3">Solution Design</h5>
                <p className="small text-muted mb-0">Custom design with hardware selection, software integration, and workflow optimization tailored to your operations.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                    <h4 className="mb-0">3</h4>
                  </div>
                </div>
                <h5 className="mb-3">Deployment & Training</h5>
                <p className="small text-muted mb-0">Professional installation, configuration, testing, and comprehensive user training to ensure smooth adoption.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                    <h4 className="mb-0">4</h4>
                  </div>
                </div>
                <h5 className="mb-3">Support & Maintenance</h5>
                <p className="small text-muted mb-0">Ongoing technical support, firmware updates, hardware replacement, and optimization services to maximize uptime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
