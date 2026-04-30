import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Products",
  description: "Explore our range of enterprise-grade IT products and solutions from leading global brands. ANSAR TECHNOLOGIES is your trusted technology partner.",
};

export default function ProductsPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/products.png)',
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
              <h1 className="with-separator">Our Product Partners</h1>
              <p className="text-justify">We collaborate with world-class technology leaders to deliver cutting-edge solutions. Our trusted partnerships ensure you receive proven, reliable products backed by innovation and excellence.</p>
              <div className="d-flex">
                <a href="#fortesys" className="btn-get-started">Explore Products</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image 
                src="/assets/img/products-hero.png" 
                className="img-fluid animated" 
                alt="Products" 
                width={800} 
                height={600} 
                priority 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fortesys - Section 1 (Light) - Centered Hero Style */}
      <section id="fortesys" className="section light-background product-section">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8" data-aos="fade-up">
              <div className="mb-4" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 className="display-4 mb-0">Fortesys</h2>
              </div>
              <p className="lead text-muted mb-4">Enterprise Security Solutions</p>
              <p className="mb-5">Fortesys provides comprehensive security and network infrastructure solutions designed for modern enterprises. From advanced threat protection to network management, Fortesys delivers robust security architecture.</p>
            </div>
          </div>
          <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
            <div className="col-md-4">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-shield-lock display-4 text-primary mb-3 d-block"></i>
                <h5>Network Security</h5>
                <p className="small mb-0">Advanced firewall and intrusion prevention</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-diagram-3 display-4 text-primary mb-3 d-block"></i>
                <h5>Network Infrastructure</h5>
                <p className="small mb-0">Enterprise routing and switching solutions</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-graph-up-arrow display-4 text-primary mb-3 d-block"></i>
                <h5>Performance Monitoring</h5>
                <p className="small mb-0">Real-time network analytics and reporting</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HCI Sangfor - Section 2 (Dark) - Split with Stats */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row gy-4 align-items-stretch">
            <div className="col-lg-4" data-aos="fade-right">
              <div className="d-flex flex-column h-100">
                <div className="text-center mb-4">
                  <h2 className="text-white mb-2 display-5">HCI Sangfor</h2>
                  <p className="text-white-50 mb-0">Hyper-Converged Infrastructure</p>
                </div>
                <p className="text-white mb-4">Sangfor HCI is a next-generation hyper-converged infrastructure platform that integrates compute, storage, and virtualization. Simplify your data center operations with policy-driven automation and built-in disaster recovery.</p>
                <div className="row g-3 mt-auto">
                  <div className="col-6">
                    <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                      <h3 className="text-white mb-1">99.99%</h3>
                      <p className="small text-white-50 mb-0">Uptime SLA</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                      <h3 className="text-white mb-1">50%</h3>
                      <p className="small text-white-50 mb-0">Cost Reduction</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                      <h3 className="text-white mb-1">3-Click</h3>
                      <p className="small text-white-50 mb-0">Simple Deployment</p>
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
                      <i className="bi bi-cloud-fill display-5 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Cloud Computing Platform</h5>
                        <p className="small text-muted mb-0">Full-featured virtualization with automated resource management, live migration, and seamless scaling for modern workloads.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow h-100">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-hdd-stack display-5 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Distributed Storage</h5>
                        <p className="small text-muted mb-0">High-performance distributed storage with data deduplication, compression, and automatic tiering for optimal efficiency.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow h-100">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-shield-check display-5 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Built-in Security</h5>
                        <p className="small text-muted mb-0">Integrated security features including micro-segmentation, encryption, and advanced threat protection for your infrastructure.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow h-100">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-arrow-repeat display-5 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Disaster Recovery</h5>
                        <p className="small text-muted mb-0">Automated backup and replication with one-click recovery ensures business continuity and data protection.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* pfSense - Section 3 (Light) - Feature Grid with Banner */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center" data-aos="fade-up">
              <h2 className="mb-2 display-5">pfSense</h2>
              <p className="lead text-muted mb-4">Open Source Firewall & Router Platform</p>
            </div>
          </div>
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="0">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <div className="mb-3">
                  <i className="bi bi-shield-fill-check display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Stateful Firewall</h5>
                <p className="small text-muted mb-0">Advanced packet filtering with comprehensive rule management and NAT support.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <div className="mb-3">
                  <i className="bi bi-lock-fill display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">VPN Solutions</h5>
                <p className="small text-muted mb-0">IPsec, OpenVPN, and WireGuard support for secure remote access.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <div className="mb-3">
                  <i className="bi bi-speedometer2 display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Traffic Shaping</h5>
                <p className="small text-muted mb-0">QoS and bandwidth management for optimized network performance.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <div className="mb-3">
                  <i className="bi bi-bug-fill display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">IDS/IPS</h5>
                <p className="small text-muted mb-0">Intrusion detection and prevention with Snort and Suricata.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-primary text-white text-center">
                <h5 className="mb-2">Trusted by 3 Million+ Installations Worldwide</h5>
                <p className="mb-0">The world&apos;s most trusted open-source firewall platform for enterprise and SMB deployments.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cisco - Section 4 (Dark) - List with Large Icons */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-lg-6 offset-lg-3 text-center" data-aos="fade-up">
              <h2 className="text-white mb-3 display-5">Cisco</h2>
              <p className="text-white-50 mb-0">Global leader in networking hardware, software, and telecommunications equipment. Cisco powers the infrastructure of businesses worldwide.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-right" data-aos-delay="0">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="me-4">
                  <i className="bi bi-router display-3 text-accent"></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="text-white mb-2">Enterprise Networking</h5>
                  <p className="text-white-50 small mb-0">High-performance routers, switches, and controllers for campus and data center environments.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left" data-aos-delay="0">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="me-4">
                  <i className="bi bi-shield-lock display-3 text-accent"></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="text-white mb-2">Security Solutions</h5>
                  <p className="text-white-50 small mb-0">Next-generation firewalls and advanced threat defense systems.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-right" data-aos-delay="100">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="me-4">
                  <i className="bi bi-headset display-3 text-accent"></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="text-white mb-2">Collaboration Tools</h5>
                  <p className="text-white-50 small mb-0">Unified communications and video conferencing solutions.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left" data-aos-delay="100">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="me-4">
                  <i className="bi bi-wifi display-3 text-accent"></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="text-white mb-2">Wireless Solutions</h5>
                  <p className="text-white-50 small mb-0">Enterprise-grade access points and wireless controllers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APC - Section 5 (Light) - Logo Left, Rich Content Right */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row gy-4 align-items-stretch">
            <div className="col-lg-3" data-aos="fade-right">
              <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4 rounded-3 bg-white shadow-sm">
                <div className="mb-4" style={{ height: '60px', display: 'flex', alignItems: 'center' }}>
                  <h3 className="text-center mb-0">APC</h3>
                </div>
                <p className="text-muted text-center small mb-0">Power & Cooling Solutions</p>
              </div>
            </div>
            <div className="col-lg-9" data-aos="fade-left">
              <div className="mb-4">
                <h4 className="mb-3">Uninterruptible Power Supply & Data Center Infrastructure</h4>
                <p className="mb-4">APC by Schneider Electric provides industry-leading UPS systems, power distribution units, and environmental monitoring solutions. Protect your critical infrastructure with reliable backup power and intelligent power management.</p>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-lightning-charge-fill display-6 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">UPS Systems</h5>
                        <p className="small text-muted mb-0">Single-phase and three-phase UPS solutions with advanced battery management and remote monitoring capabilities.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-plug-fill display-6 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Power Distribution</h5>
                        <p className="small text-muted mb-0">Rack PDUs with intelligent power monitoring, metering, and outlet-level control for data centers.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-thermometer-half display-6 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Cooling Solutions</h5>
                        <p className="small text-muted mb-0">Precision cooling systems and environmental monitoring for optimal data center performance.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-hdd-rack display-6 text-primary me-3"></i>
                      <div>
                        <h5 className="mb-2">Rack Infrastructure</h5>
                        <p className="small text-muted mb-0">NetShelter enclosures and cable management solutions for organized data center deployments.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ubiquiti - Section 6 (Dark) - Full Width Cards Grid */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <h2 className="text-white mb-3 display-5">Ubiquiti</h2>
              <p className="text-white-50 lead mb-4">Enterprise WiFi & Networking Solutions</p>
              <p className="text-white">Ubiquiti delivers enterprise-grade network solutions at accessible pricing. From UniFi wireless access points to EdgeMAX routers, Ubiquiti provides powerful, scalable networking infrastructure.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="0">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-broadcast-pin display-3 text-primary mb-3"></i>
                <h5 className="mb-3">UniFi Access Points</h5>
                <p className="small text-muted mb-3">Wi-Fi 6 APs with seamless roaming and centralized management</p>
                <ul className="list-unstyled small text-start text-dark">
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>PoE Powered</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Guest Portal</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>VLAN Support</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-hdd-network display-3 text-primary mb-3"></i>
                <h5 className="mb-3">UniFi Switches</h5>
                <p className="small text-muted mb-3">Managed switches with PoE+ and SFP+ uplinks</p>
                <ul className="list-unstyled small text-start text-dark">
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Layer 2/3 Routing</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Port Mirroring</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Link Aggregation</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-shield-fill display-3 text-primary mb-3"></i>
                <h5 className="mb-3">UniFi Gateway</h5>
                <p className="small text-muted mb-3">Next-gen security gateway with DPI and IPS</p>
                <ul className="list-unstyled small text-start text-dark">
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Deep Packet Inspection</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>VPN Server</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Traffic Analytics</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow text-center h-100">
                <i className="bi bi-cloud display-3 text-primary mb-3"></i>
                <h5 className="mb-3">UniFi Controller</h5>
                <p className="small text-muted mb-3">Centralized management platform</p>
                <ul className="list-unstyled small text-start text-dark">
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Single Dashboard</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Auto-Backup</li>
                  <li className="mb-2"><i className="bi bi-check2 text-primary me-2"></i>Mobile App</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* H3C - Section 7 (Light) - Two Column Feature List */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-5" data-aos="fade-right">
              <h2 className="mb-3 display-5">H3C</h2>
              <p className="text-muted lead mb-3">Network Infrastructure Solutions</p>
              <p className="mb-4">H3C Technologies delivers enterprise-grade switches, routers, and wireless solutions. With industry-leading performance and reliability, H3C provides comprehensive networking infrastructure for modern data centers and campuses.</p>
              <div className="p-4 rounded-3 bg-primary text-white">
                <h5 className="mb-3">Global Presence</h5>
                <div className="row g-3 text-center">
                  <div className="col-6">
                    <h4 className="mb-1">#2</h4>
                    <p className="small mb-0">In Enterprise Networks</p>
                  </div>
                  <div className="col-6">
                    <h4 className="mb-1">100+</h4>
                    <p className="small mb-0">Countries Served</p>
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
                        <i className="bi bi-hdd-network-fill display-6 text-primary"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">Data Center Switches</h5>
                      <p className="small text-muted mb-0">High-density 10/25/40/100G switches with VXLAN, SDN, and spine-leaf architecture support.</p>
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
                      <h5 className="mb-2">Enterprise Routers</h5>
                      <p className="small text-muted mb-0">Carrier-grade routers with advanced routing protocols and MPLS for WAN connectivity.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                        <i className="bi bi-wifi display-6 text-primary"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">Wireless Solutions</h5>
                      <p className="small text-muted mb-0">Wi-Fi 6 access points with intelligent RF management and centralized control.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex p-4 rounded-3 bg-white shadow-sm">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                        <i className="bi bi-cpu-fill display-6 text-primary"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">Network Management</h5>
                      <p className="small text-muted mb-0">Unified management platform with AI-powered analytics and automation capabilities.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dell - Section 8 (Dark) - Centered with 3-Column Grid */}
      <section className="section dark-background product-section">
        <div className="container text-center">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-7" data-aos="fade-up">
              <h2 className="text-white mb-3 display-5">Dell</h2>
              <p className="text-white-50 lead mb-3">PC & Server Solutions</p>
              <p className="text-white">Dell Technologies provides enterprise servers, workstations, and storage solutions. From PowerEdge servers to Precision workstations, Dell delivers performance, reliability, and innovation for business computing needs.</p>
            </div>
          </div>
          <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
            <div className="col-lg-4 col-md-6">
              <div className="p-4 rounded-3 bg-white shadow h-100 text-start">
                <i className="bi bi-server display-4 text-primary mb-3 d-block"></i>
                <h5 className="mb-3">PowerEdge Servers</h5>
                <p className="small text-muted mb-3">Rack, tower, and blade servers with Intel Xeon processors and NVMe storage.</p>
                <p className="small text-muted mb-0">Scalable computing power for virtualization, databases, and mission-critical applications.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="p-4 rounded-3 bg-white shadow h-100 text-start">
                <i className="bi bi-pc-display-horizontal display-4 text-primary mb-3 d-block"></i>
                <h5 className="mb-3">Precision Workstations</h5>
                <p className="small text-muted mb-3">Professional workstations with ISV certifications for CAD, rendering, and data science.</p>
                <p className="small text-muted mb-0">High-performance systems for engineers, designers, and content creators.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="p-4 rounded-3 bg-white shadow h-100 text-start">
                <i className="bi bi-hdd-stack display-4 text-primary mb-3 d-block"></i>
                <h5 className="mb-3">Storage Solutions</h5>
                <p className="small text-muted mb-3">PowerStore and Unity XT storage arrays with NVMe, AI-driven optimization, and data reduction.</p>
                <p className="small text-muted mb-0">Enterprise storage for modern workloads and multi-cloud environments.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asus - Section 9 (Light) - Split with Large Feature Cards */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row gy-5">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="mb-3 display-5">Asus</h2>
              <p className="text-muted lead mb-3">PC & Professional Displays</p>
              <p className="mb-4">Asus delivers high-performance computers and professional displays for business environments. From compact mini PCs to ultra-wide monitors, Asus provides reliable computing solutions with innovative design and cutting-edge technology.</p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-primary text-white text-center">
                    <h4 className="mb-1">Top 5</h4>
                    <p className="small mb-0">PC Manufacturer</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-primary text-white text-center">
                    <h4 className="mb-1">4,400+</h4>
                    <p className="small mb-0">Quality Awards</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <h5 className="mb-3"><i className="bi bi-pc-display text-primary me-2"></i>Business Desktops</h5>
                    <p className="small text-muted mb-0">ExpertCenter series with reliability testing, security features, and easy serviceability for corporate deployments.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <h5 className="mb-3"><i className="bi bi-laptop text-primary me-2"></i>Business Laptops</h5>
                    <p className="small text-muted mb-0">ExpertBook series with military-grade durability, extended battery life, and enterprise security.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <h5 className="mb-3"><i className="bi bi-display text-primary me-2"></i>Professional Monitors</h5>
                    <p className="small text-muted mb-0">ProArt displays with color accuracy, HDR support, and factory calibration for professional workflows.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dahua - Section 10 (Dark) - Alternating Icon List */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <h2 className="text-white mb-3 display-5">Dahua</h2>
              <p className="text-white-50 lead">CCTV & Video Surveillance Solutions</p>
            </div>
          </div>
          <div className="row gy-4">
            <div className="col-md-6" data-aos="fade-right">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-camera-video-fill display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">AI-Powered Cameras</h5>
                  <p className="text-white-50 small mb-0">Smart cameras with perimeter protection, face recognition, and people counting powered by deep learning algorithms.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-hdd-rack display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Network Video Recorders</h5>
                  <p className="text-white-50 small mb-0">Enterprise NVRs with hot-swappable drives, RAID support, and intelligent search capabilities.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-right">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-display display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Video Management System</h5>
                  <p className="text-white-50 small mb-0">Scalable VMS platform for centralized monitoring, playback, and analytics across multiple sites.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="d-flex align-items-start p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-shield-check display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Access Control & Intercom</h5>
                  <p className="text-white-50 small mb-0">Integrated access control systems with biometric readers and video intercom solutions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lenovo - Section 11 (Light) - Grid with Highlight Banner */}
      <section className="section light-background product-section">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12" data-aos="fade-up">
              <div className="text-center p-5 rounded-3 bg-primary text-white">
                <h2 className="mb-3 display-5">Lenovo</h2>
                <p className="lead mb-0">Business Computers & Mobile Workstations</p>
              </div>
            </div>
          </div>
          <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
            <div className="col-lg-6">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-laptop display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">ThinkPad Series</h5>
                <p className="text-muted mb-3">Legendary business laptops with TrackPoint, MIL-STD durability, and enterprise security.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Fingerprint reader & TPM 2.0</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>All-day battery life</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Excellent keyboard & touchpad</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>4G/5G connectivity options</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-pc-display display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">ThinkCentre Desktops</h5>
                <p className="text-muted mb-3">Reliable business desktops with tool-less design and comprehensive management features.</p>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Tiny, SFF, and Tower form factors</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>ISV certified for business apps</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>Energy Star & EPEAT certified</li>
                  <li className="mb-2"><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>vPro & DASH management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EPSON - Section 12 (Dark) - Horizontal Feature Showcase */}
      <section className="section dark-background product-section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-lg-5" data-aos="fade-right">
              <h2 className="text-white mb-3 display-5">EPSON</h2>
              <p className="text-white-50 lead mb-3">Professional Projectors & Large Format Displays</p>
              <p className="text-white mb-4">Epson delivers innovative projection and visual display solutions for business, education, and large venue applications. From compact portable projectors to large venue laser projectors, Epson provides exceptional image quality and reliability.</p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                    <h4 className="text-white mb-1">#1</h4>
                    <p className="small text-white-50 mb-0">Projector Brand</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                    <h4 className="text-white mb-1">20+ Years</h4>
                    <p className="small text-white-50 mb-0">Market Leadership</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <div className="row g-4">
                <div className="col-6">
                  <div className="text-center p-4 rounded-3 bg-white bg-opacity-10">
                    <i className="bi bi-projector-fill display-3 text-accent mb-3"></i>
                    <h5 className="text-white mb-2">3LCD Technology</h5>
                    <p className="text-white-50 small mb-0">True color projection</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-4 rounded-3 bg-white bg-opacity-10">
                    <i className="bi bi-brightness-high-fill display-3 text-accent mb-3"></i>
                    <h5 className="text-white mb-2">High Brightness</h5>
                    <p className="text-white-50 small mb-0">Up to 30,000 lumens</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-4 rounded-3 bg-white bg-opacity-10">
                    <i className="bi bi-aspect-ratio display-3 text-accent mb-3"></i>
                    <h5 className="text-white mb-2">4K Enhancement</h5>
                    <p className="text-white-50 small mb-0">Ultra HD resolution</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-4 rounded-3 bg-white bg-opacity-10">
                    <i className="bi bi-wifi display-3 text-accent mb-3"></i>
                    <h5 className="text-white mb-2">Wireless Connectivity</h5>
                    <p className="text-white-50 small mb-0">Screen mirroring & BYOD</p>
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
