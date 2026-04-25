import Products from "@/components/Products";

export default function ProductsPage() {
  return (
    <main className="main">
      {/* Hero Section - matching Home style */}
      <section id="hero" className="hero section dark-background products-page-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Our Product Partners</h1>
              <p className="text-justify">We collaborate with world-class technology leaders to deliver cutting-edge solutions. Our trusted partnerships ensure you receive proven, reliable products backed by innovation and excellence.</p>
              <div className="d-flex">
                <a href="#cisco" className="btn-get-started">Explore Products</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/hero-product.png" className="img-fluid animated" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* Cisco - Section 1 (Light) - Centered Hero Style */}
      <section id="cisco" className="section light-background product-section">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8" data-aos="fade-up">
              <img src="/assets/img/product/cisco.png" alt="Cisco" className="product-section-logo mb-4" />
              <h2 className="mb-3">Cisco Systems</h2>
              <p className="lead text-muted mb-4">Worldwide Leader in Networking</p>
              <p className="mb-5">Cisco is the global leader in networking hardware, software, and telecommunications equipment. From enterprise routers and switches to advanced security appliances, Cisco powers the infrastructure of businesses worldwide.</p>
            </div>
          </div>
          <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
            <div className="col-md-3">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-router display-4 text-primary mb-3 d-block"></i>
                <h5>Enterprise Networking</h5>
                <p className="small mb-0">Routers, switches, and controllers</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-shield-lock display-4 text-primary mb-3 d-block"></i>
                <h5>Security Solutions</h5>
                <p className="small mb-0">Firewalls and threat defense</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-headset display-4 text-primary mb-3 d-block"></i>
                <h5>Collaboration</h5>
                <p className="small mb-0">Unified communications systems</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-wifi display-4 text-primary mb-3 d-block"></i>
                <h5>Wireless & Mobility</h5>
                <p className="small mb-0">Access points and controllers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HP - Section 2 (Dark) - Split with Stats */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row gy-4 align-items-stretch">
            <div className="col-lg-4" data-aos="fade-right">
              <div className="d-flex flex-column h-100">
                <div className="text-center mb-4">
                  <img src="/assets/img/product/hp.png" alt="HP" className="product-section-logo mb-3" />
                  <h2 className="text-white mb-2">HP Inc.</h2>
                  <p className="text-white-50 mb-0">Innovation in Computing & Printing</p>
                </div>
                <p className="text-white mb-4">HP is a global technology leader providing personal systems, printers, and 3D printing solutions. From enterprise-grade multifunction printers to high-performance workstations, HP&apos;s devices power productivity for businesses and creative professionals worldwide.</p>
                <div className="row g-3 mt-auto">
                  <div className="col-6">
                    <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                      <h3 className="text-white mb-1">80+</h3>
                      <p className="small text-white-50 mb-0">Years of Innovation</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                      <h3 className="text-white mb-1">#1</h3>
                      <p className="small text-white-50 mb-0">PC & Printer Market Leader</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                      <h3 className="text-white mb-1">500M+</h3>
                      <p className="small text-white-50 mb-0">Devices Shipped Worldwide</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-8" data-aos="fade-left">
              <div className="row g-3 h-100">
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow h-100">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-printer display-5 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Enterprise Printers & MFPs</h5>
                        <p className="small text-muted mb-0">High-volume multifunction printers with advanced security features, mobile printing, and cloud integration. Ideal for corporate offices and production environments requiring reliability and cost efficiency.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow h-100">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-laptop display-5 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Workstations & Business Laptops</h5>
                        <p className="small text-muted mb-0">Performance-driven systems engineered for professionals, designers, and engineers. HP EliteBook and ZBook series deliver power, security, and durability for demanding workloads.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow h-100">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-box-seam display-5 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">3D Printing Solutions</h5>
                        <p className="small text-muted mb-0">Next-generation additive manufacturing with HP Multi Jet Fusion technology. Transform product development and production with industrial-grade 3D printers for prototyping and end-use parts.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow h-100">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-gear display-5 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Managed Print Services</h5>
                        <p className="small text-muted mb-0">Comprehensive fleet management, automated supply replenishment, and predictive maintenance. Reduce printing costs by up to 30% while improving document security and workflow efficiency.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hikvision - Section 3 (Light) - Feature Grid with Banner */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center" data-aos="fade-up">
              <img src="/assets/img/product/hikvision.png" alt="Hikvision" className="product-section-logo mb-3" />
              <h2 className="mb-2">Hikvision</h2>
              <p className="lead text-muted mb-4">World&apos;s Leading Video Surveillance Provider</p>
            </div>
          </div>
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="0">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <div className="mb-3">
                  <i className="bi bi-camera-video display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">AI-Powered Cameras</h5>
                <p className="small text-muted mb-0">Deep learning analytics for face recognition, perimeter protection, and behavior analysis.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <div className="mb-3">
                  <i className="bi bi-hdd-rack display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Network Video Recorders</h5>
                <p className="small text-muted mb-0">Enterprise-grade NVRs with hot-swappable drives and redundancy.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <div className="mb-3">
                  <i className="bi bi-display display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Video Management</h5>
                <p className="small text-muted mb-0">Scalable VMS for centralized monitoring and intelligent playback.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <div className="mb-3">
                  <i className="bi bi-shield-check display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Access Control</h5>
                <p className="small text-muted mb-0">Integrated access control and intrusion alarm systems.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-primary text-white text-center">
                <h5 className="mb-2">Trusted by 150+ Countries Worldwide</h5>
                <p className="mb-0">Deployed in airports, smart cities, critical infrastructure, and Fortune 500 enterprises globally.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D-Link - Section 4 (Dark) - List with Large Icons */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-lg-6 offset-lg-3 text-center" data-aos="fade-up">
              <img src="/assets/img/product/dlink.png" alt="D-Link" className="product-section-logo mb-4" />
              <h2 className="text-white mb-3">D-Link</h2>
              <p className="text-white-50 mb-0">Award-winning networking hardware for SMB and enterprise. D-Link delivers performance, reliability, and value.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-right" data-aos-delay="0">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="me-4">
                  <i className="bi bi-hdd-network display-3 text-accent"></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="text-white mb-2">Managed & Unmanaged Switches</h5>
                  <p className="text-white-50 small mb-0">Enterprise and SMB switches with PoE+, 10G uplinks, and VLAN support for scalable network infrastructure.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left" data-aos-delay="0">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="me-4">
                  <i className="bi bi-broadcast display-3 text-accent"></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="text-white mb-2">Wireless Access Points</h5>
                  <p className="text-white-50 small mb-0">Wi-Fi 6 APs with centralized controllers and cloud management for seamless wireless coverage.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-right" data-aos-delay="100">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="me-4">
                  <i className="bi bi-camera display-3 text-accent"></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="text-white mb-2">Surveillance & IP Cameras</h5>
                  <p className="text-white-50 small mb-0">Cost-effective IP cameras with HD resolution and remote monitoring capabilities.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left" data-aos-delay="100">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="me-4">
                  <i className="bi bi-cloud display-3 text-accent"></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="text-white mb-2">Cloud Management</h5>
                  <p className="text-white-50 small mb-0">Unified cloud platform for centralized device configuration, monitoring, and troubleshooting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bosch - Section 5 (Light) - Logo Left, Rich Content Right */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row gy-4 align-items-stretch">
            <div className="col-lg-3" data-aos="fade-right">
              <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4 rounded-3 bg-white shadow-sm">
                <img src="/assets/img/product/bosch.png" alt="Bosch Security" className="product-section-logo mb-4" />
                <h3 className="text-center mb-2">Bosch Security Systems</h3>
                <p className="text-muted text-center small mb-0">Trusted Security & Safety Solutions</p>
              </div>
            </div>
            <div className="col-lg-9" data-aos="fade-left">
              <div className="mb-4">
                <h4 className="mb-3">German Engineering Excellence for Critical Security</h4>
                <p className="mb-4">Bosch Security Systems is a global leader in safety, security, and communications products. With over 130 years of innovation, Bosch delivers professional-grade solutions for video surveillance, intrusion detection, fire alarms, and public address systems trusted by governments, airports, hospitals, and Fortune 500 companies worldwide.</p>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-camera-video-fill display-6 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Professional Video Surveillance</h5>
                        <p className="small text-muted mb-0">IP cameras with starlight technology, intelligent video analytics, and thermal imaging. Ideal for perimeter protection, retail analytics, and critical infrastructure monitoring with exceptional image quality in any lighting condition.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-exclamation-triangle-fill display-6 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Intrusion & Fire Detection</h5>
                        <p className="small text-muted mb-0">Advanced intrusion panels, motion detectors, and fire alarm systems with multi-path communication and remote diagnostics. Certified for high-security applications and compliant with international safety standards.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-megaphone-fill display-6 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Public Address & Emergency Systems</h5>
                        <p className="small text-muted mb-0">Networked PA systems with voice evacuation, background music, and emergency communication. Deployed in stadiums, transportation hubs, campuses, and commercial buildings for clear, reliable audio delivery.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-door-closed-fill display-6 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Access Control & Management</h5>
                        <p className="small text-muted mb-0">Integrated access control with biometric readers, smart card systems, and centralized management. Scalable from single-door installations to enterprise-wide deployments with audit trails and compliance reporting.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TP-Link - Section 6 (Dark) - Full Width Cards Grid */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <img src="/assets/img/product/tplink.png" alt="TP-Link" className="product-section-logo mb-3" />
              <h2 className="text-white mb-3">TP-Link</h2>
              <p className="text-white-50 lead mb-4">Reliable Networking for All</p>
              <p className="text-white">TP-Link is a global provider of networking products for consumers and businesses. From SMB switches to enterprise wireless solutions, TP-Link delivers performance at exceptional value with enterprise-grade features at accessible pricing for growing businesses worldwide.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="0">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-hdd-network display-3 text-primary mb-3"></i>
                <h5 className="mb-3">Business Switches</h5>
                <p className="small text-muted mb-3">Managed switches with PoE+, 10G uplinks, Layer 3 routing</p>
                <ul className="list-unstyled small text-start text-dark">
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Omada SDN Ready</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>VLAN & ACL</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Stacking Support</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-wifi display-3 text-primary mb-3"></i>
                <h5 className="mb-3">Wi-Fi 6 APs</h5>
                <p className="small text-muted mb-3">High-performance access points with MU-MIMO & OFDMA</p>
                <ul className="list-unstyled small text-start text-dark">
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Seamless Roaming</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Band Steering</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Mesh Support</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-cloud-arrow-up display-3 text-primary mb-3"></i>
                <h5 className="mb-3">Omada Platform</h5>
                <p className="small text-muted mb-3">Cloud & on-prem SDN management</p>
                <ul className="list-unstyled small text-start text-dark">
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Zero-Touch Provisioning</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Multi-Site Management</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Guest Portal</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-camera-video display-3 text-primary mb-3"></i>
                <h5 className="mb-3">VIGI Surveillance</h5>
                <p className="small text-muted mb-3">Professional IP cameras & NVRs</p>
                <ul className="list-unstyled small text-start text-dark">
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>AI Detection</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Smart Tracking</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Cloud Storage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aruba (HPE) - Section 7 (Light) - Two Column Feature List */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-5" data-aos="fade-right">
              <img src="/assets/img/product/aruba.png" alt="Aruba Networks" className="product-section-logo mb-4" />
              <h2 className="mb-3">Aruba Networks (HPE)</h2>
              <p className="text-muted lead mb-3">Intelligent Edge-to-Cloud Networking</p>
              <p className="mb-4">Aruba, a Hewlett Packard Enterprise company, provides next-generation network access solutions for the mobile enterprise. With AI-powered insights, zero-trust security architecture, and seamless cloud management via Aruba Central, Aruba delivers unified wired, wireless, and SD-WAN infrastructure.</p>
              <div className="p-4 rounded-3 bg-primary text-white">
                <h5 className="mb-3">Trusted By</h5>
                <div className="row g-3 text-center">
                  <div className="col-6">
                    <h4 className="mb-1">300K+</h4>
                    <p className="small mb-0">Customers</p>
                  </div>
                  <div className="col-6">
                    <h4 className="mb-1">100+ Countries</h4>
                    <p className="small mb-0">Worldwide</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <div className="row g-4">
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                        <i className="bi bi-cpu-fill display-6 text-primary"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">AI-Powered Wireless & Wired Solutions</h5>
                      <p className="small text-muted mb-0">AIOps with machine learning for automated troubleshooting, capacity planning, and network optimization. Proactive insights reduce downtime and improve user experience across campus and branch networks with predictive analytics and anomaly detection.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                        <i className="bi bi-diagram-3-fill display-6 text-primary"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">SD-WAN & Edge Services</h5>
                      <p className="small text-muted mb-0">Orchestrated connectivity with automated policy enforcement, application steering, and WAN optimization. Securely connect branches, remote workers, and cloud workloads with dynamic path selection and intelligent traffic routing.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                        <i className="bi bi-shield-fill-check display-6 text-primary"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">Network Security & Zero Trust</h5>
                      <p className="small text-muted mb-0">Dynamic segmentation, role-based policies, and integrated threat intelligence. Aruba ClearPass provides NAC, guest access, device profiling, and policy enforcement for comprehensive security across the network edge.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                        <i className="bi bi-cloud-fill display-6 text-primary"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">Aruba Central Cloud Management</h5>
                      <p className="small text-muted mb-0">Unified cloud-native platform for managing wireless, wired, and SD-WAN infrastructure. Single pane of glass for configuration, monitoring, troubleshooting, and guest access across global deployments with AI-driven recommendations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTi - Section 8 (Dark) - Centered with 3-Column Grid */}
      <section className="section dark-background product-section">
        <div className="container text-center">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-7" data-aos="fade-up">
              <img src="/assets/img/product/acti.png" alt="ACTi" className="product-section-logo mb-3" />
              <h2 className="text-white mb-3">ACTi Corporation</h2>
              <p className="text-white-50 lead mb-3">Professional IP Video Surveillance</p>
              <p className="text-white">ACTi is a Taiwan-based manufacturer specializing in megapixel IP cameras and video management software. With over 20 years of surveillance expertise and 100+ camera models, ACTi delivers high-performance surveillance at competitive pricing with robust build quality ideal for commercial, industrial, and critical infrastructure deployments.</p>
            </div>
          </div>
          <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
            <div className="col-lg-4 col-md-6">
              <div className="p-4 rounded-3 bg-white shadow h-100 text-start">
                <i className="bi bi-camera-fill display-4 text-primary mb-3 d-block"></i>
                <h5 className="mb-3">Megapixel IP Cameras</h5>
                <p className="small text-muted mb-3">2MP to 12MP resolution cameras with WDR, P-Iris, and advanced low-light performance.</p>
                <p className="small text-muted mb-0">Dome, bullet, box, PTZ, and fisheye form factors for every application from retail to transportation hubs with weatherproof and vandal-resistant options.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="p-4 rounded-3 bg-white shadow h-100 text-start">
                <i className="bi bi-hdd-rack-fill display-4 text-primary mb-3 d-block"></i>
                <h5 className="mb-3">Video Management (NVR)</h5>
                <p className="small text-muted mb-3">ACTi NVR 3.0 software with multi-server support, intelligent search, and export tools.</p>
                <p className="small text-muted mb-0">Hardware NVRs with RAID, hot-swap bays, and redundant power for mission-critical recording with centralized management and mobile access.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="p-4 rounded-3 bg-white shadow h-100 text-start">
                <i className="bi bi-graph-up-arrow display-4 text-primary mb-3 d-block"></i>
                <h5 className="mb-3">Analytics & Smart Features</h5>
                <p className="small text-muted mb-3">Built-in video analytics for people counting, intrusion detection, object removal, and loitering alerts.</p>
                <p className="small text-muted mb-0">Integration with third-party AI platforms for advanced behavior analysis, facial recognition, and forensic search capabilities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestone - Section 9 (Light) - Split with Large Feature Cards */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row gy-5">
            <div className="col-lg-6" data-aos="fade-right">
              <img src="/assets/img/product/milestonesys.png" alt="Milestone Systems" className="product-section-logo mb-4" />
              <h2 className="mb-3">Milestone Systems</h2>
              <p className="text-muted lead mb-3">Open Platform Video Management Software</p>
              <p className="mb-4">Milestone XProtect is the leading open-platform VMS trusted by over 500,000 sites worldwide. Seamlessly integrate 10,000+ camera models, AI analytics, access control, and IoT sensors into a unified security ecosystem powering airports, hospitals, stadiums, and city surveillance.</p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-primary text-white text-center">
                    <h4 className="mb-1">500K+</h4>
                    <p className="small mb-0">Installations</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-primary text-white text-center">
                    <h4 className="mb-1">10,000+</h4>
                    <p className="small mb-0">Camera Models</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <h5 className="mb-3"><i className="bi bi-collection-play text-primary me-2"></i>XProtect VMS Platform</h5>
                    <p className="small text-muted mb-0">Flexible architecture from SMB (Essential) to enterprise (Expert/Corporate). Federated, failover, and multi-server configurations for high-availability deployments.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <h5 className="mb-3"><i className="bi bi-plugin text-primary me-2"></i>Open Architecture & Integrations</h5>
                    <p className="small text-muted mb-0">MIP SDK and partner ecosystem with 10,000+ integrations. Connect analytics, LPR, access control, building systems, and sensors.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <h5 className="mb-3"><i className="bi bi-robot text-primary me-2"></i>AI & Analytics Ready</h5>
                    <p className="small text-muted mb-0">Native support for AI analytics. Object classification, facial recognition, behavior analysis with metadata indexing for instant forensic search.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ruijie - Section 10 (Dark) - Alternating Icon List */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <img src="/assets/img/product/rujie.png" alt="Ruijie Networks" className="product-section-logo mb-3" />
              <h2 className="text-white mb-3">Ruijie Networks</h2>
              <p className="text-white-50 lead">Cloud-Driven Campus & Enterprise Solutions</p>
            </div>
          </div>
          <div className="row gy-4">
            <div className="col-md-6" data-aos="fade-right">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-cloud-check display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Cloud-Managed Networking</h5>
                  <p className="text-white-50 small mb-0">Reyee Cloud platform for zero-touch provisioning, centralized configuration, and real-time monitoring. Simplified multi-site management with guest portal and traffic analytics.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-building display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Campus & Enterprise Switches</h5>
                  <p className="text-white-50 small mb-0">Layer 2/3 switches with 10G/25G/100G uplinks, stacking, PoE++, and advanced QoS. SDN-ready architecture with deep packet inspection for campus core and distribution.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-right">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-broadcast-pin display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Wireless Access & Controllers</h5>
                  <p className="text-white-50 small mb-0">Wi-Fi 6/6E access points with intelligent RF optimization and seamless roaming. Hardware/virtual controllers and cloud management for distributed deployments.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-server display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Hyper-Converged Infrastructure</h5>
                  <p className="text-white-50 small mb-0">RIIL HCI platform integrating compute, storage, and virtualization. Simplified data center operations with policy-driven automation and built-in DR.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Untangle - Section 11 (Light) - Grid with Highlight Banner */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12" data-aos="fade-up">
              <div className="text-center p-5 rounded-3 bg-primary text-white">
                <img src="/assets/img/product/untangle.png" alt="Untangle" className="product-section-logo mb-3" style={{filter: 'brightness(0) invert(1)'}} />
                <h2 className="mb-3">Untangle (Arista)</h2>
                <p className="lead mb-0">Comprehensive Network Security & SD-WAN for Distributed Enterprises</p>
              </div>
            </div>
          </div>
          <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
            <div className="col-lg-6">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-shield-fill-plus display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Next-Gen Firewall (NGFW)</h5>
                <p className="text-muted mb-3">Integrated firewall, IPS, application control, and web filtering in a unified appliance.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Real-time threat intelligence</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>SSL inspection & decryption</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Granular policy enforcement</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Advanced reporting & alerts</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-signpost-split-fill display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">SD-WAN & Policy Routing</h5>
                <p className="text-muted mb-3">Intelligent WAN orchestration with multi-path routing and application-aware steering.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Automatic failover & load balancing</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Application QoS & prioritization</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Bandwidth optimization</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Multi-site VPN mesh</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-filter-circle-fill display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Web Filtering & Application Control</h5>
                <p className="text-muted mb-3">Category-based web filtering and Layer 7 application visibility/control.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Content filtering & safe search</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Bandwidth quotas & throttling</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>User/group-based policies</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Detailed usage reports</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-cloud-download-fill display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Cloud Command Center</h5>
                <p className="text-muted mb-3">Centralized cloud management for multi-site deployments with single dashboard.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Zero-touch provisioning</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Unified monitoring & alerting</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Automated firmware updates</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Multi-tenant support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* pfSense - Section 12 (Dark) - Horizontal Feature Showcase */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-lg-5" data-aos="fade-right">
              <img src="/assets/img/product/pfsense.png" alt="pfSense" className="product-section-logo mb-4" />
              <h2 className="text-white mb-3">pfSense (Netgate)</h2>
              <p className="text-white-50 lead mb-3">Open Source Firewall & Router</p>
              <p className="text-white mb-4">pfSense is the world&apos;s most trusted open-source firewall and router platform. Built on FreeBSD, pfSense offers unmatched flexibility, security, and performance for any network environment with zero licensing costs and active community support trusted by SMBs, ISPs, and Fortune 500 companies.</p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                    <h4 className="text-white mb-1">3M+</h4>
                    <p className="small text-white-50 mb-0">Installations</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                    <h4 className="text-white mb-1">100%</h4>
                    <p className="small text-white-50 mb-0">Free & Open</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <div className="row g-4">
                <div className="col-6">
                  <div className="text-center p-4 rounded-3 bg-white bg-opacity-10">
                    <i className="bi bi-shield-fill-check display-3 text-accent mb-3"></i>
                    <h5 className="text-white mb-2">Firewall & NAT</h5>
                    <p className="text-white-50 small mb-0">Stateful inspection with rules</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-4 rounded-3 bg-white bg-opacity-10">
                    <i className="bi bi-lock-fill display-3 text-accent mb-3"></i>
                    <h5 className="text-white mb-2">Multi-Protocol VPN</h5>
                    <p className="text-white-50 small mb-0">IPsec, OpenVPN, WireGuard</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-4 rounded-3 bg-white bg-opacity-10">
                    <i className="bi bi-speedometer2 display-3 text-accent mb-3"></i>
                    <h5 className="text-white mb-2">Traffic Shaping</h5>
                    <p className="text-white-50 small mb-0">QoS & bandwidth management</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-4 rounded-3 bg-white bg-opacity-10">
                    <i className="bi bi-bug-fill display-3 text-accent mb-3"></i>
                    <h5 className="text-white mb-2">IDS/IPS</h5>
                    <p className="text-white-50 small mb-0">Snort & Suricata engines</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm">
                <h5 className="mb-3">Complete Feature Set</h5>
                <div className="row text-dark">
                  <div className="col-md-4">
                    <ul className="list-unstyled small mb-0">
                      <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Multi-WAN Failover & Load Balancing</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>DHCP, DNS, NTP Servers</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Captive Portal & RADIUS</li>
                    </ul>
                  </div>
                  <div className="col-md-4">
                    <ul className="list-unstyled small mb-0">
                      <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>VLAN, Bridge, LAGG Support</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Dynamic Routing (OSPF, BGP)</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>High Availability (CARP)</li>
                    </ul>
                  </div>
                  <div className="col-md-4">
                    <ul className="list-unstyled small mb-0">
                      <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Package System (300+ Add-ons)</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Real-Time Monitoring & Graphs</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Hardware Crypto Acceleration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPNsense - Section 13 (Light) - Wide Cards with Description */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-10 text-center" data-aos="fade-up">
              <img src="/assets/img/product/opnsense.png" alt="OPNsense" className="product-section-logo mb-3" />
              <h2 className="mb-3">OPNsense</h2>
              <p className="lead text-muted mb-3">Secure, Intuitive Open Source Firewall</p>
              <p className="mb-0">OPNsense is a FreeBSD-based firewall and routing platform with a focus on security and ease of use. Modern web-based UI, inline IPS, and forward proxy make OPNsense a powerful security solution. With weekly security updates, extensive plugin ecosystem, and true open-source transparency, OPNsense is perfect for security-conscious organizations.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-12" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm">
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <i className="bi bi-window-desktop display-3 text-primary"></i>
                  </div>
                  <div className="col-md-10">
                    <h5 className="mb-2">Modern Web-Based Interface</h5>
                    <p className="small text-muted mb-0">Intuitive responsive GUI with real-time dashboards, graphs, and configuration wizards. Dark mode, multi-language support, and mobile-friendly design for administration from any device with role-based access control.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm">
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <i className="bi bi-shield-fill-exclamation display-3 text-primary"></i>
                  </div>
                  <div className="col-md-10">
                    <h5 className="mb-2">Inline IPS with Suricata Engine</h5>
                    <p className="small text-muted mb-0">Real-time intrusion prevention with Suricata engine and ET Pro/Snort rulesets. Block threats inline with automatic signature updates, custom rules, comprehensive alerting, and integration with threat intelligence feeds.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm">
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <i className="bi bi-arrow-left-right display-3 text-primary"></i>
                  </div>
                  <div className="col-md-10">
                    <h5 className="mb-2">Forward Caching Proxy (Squid)</h5>
                    <p className="small text-muted mb-0">Transparent/explicit proxy with SSL interception, content filtering, and caching. Reduce bandwidth costs, enforce acceptable use policies, and improve web performance with authentication and ACL support.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow-sm">
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <i className="bi bi-key-fill display-3 text-primary"></i>
                  </div>
                  <div className="col-md-10">
                    <h5 className="mb-2">Two-Factor Authentication & Advanced Security</h5>
                    <p className="small text-muted mb-0">Built-in 2FA with TOTP, RADIUS, and LDAP integration. Secure admin access, VPN authentication, and captive portal with multi-factor enforcement. Weekly security patches and hardened kernel for enhanced security posture.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product logos slider - before footer */}
      <Products />
    </main>
  );
}


