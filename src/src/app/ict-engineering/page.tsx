import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ICT Engineering Services",
  description: "Advanced ICT solutions from ANSAR TECHNOLOGIES SDN. BHD. - Network infrastructure, telecommunications, data centers, cybersecurity, and smart technology integration.",
};

export default function ICTEngineeringPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/ict.png)',
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
              <h1 className="with-separator">ICT Engineering</h1>
              <p className="text-justify">Connecting your business to the future of technology. We deliver cutting-edge ICT solutions that enhance connectivity, security, and digital transformation for organizations across Malaysia.</p>
              <div className="d-flex">
                <a href="#solutions" className="btn-get-started">View Solutions</a>
                <a href="/contact" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>Consult Us</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/ict-hero.png" className="img-fluid animated" alt="ICT Engineering Services" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Key Offerings - Icon Cards */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Core ICT Capabilities</h2>
          <p>Comprehensive technology solutions for the digital age</p>
        </div>
        <div className="container">
          <div className="row row-cols-1 row-cols-md-3 g-4">
            <div className="col" data-aos="flip-left" data-aos-delay="0">
              <div className="card border-primary border-2 h-100 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="mb-3" style={{fontSize: '4rem', color: '#007bff'}}>
                    <i className="bi bi-hdd-network"></i>
                  </div>
                  <h4 className="mb-3">Network Infrastructure</h4>
                  <p className="text-muted">Design, implementation, and management of robust network systems</p>
                </div>
              </div>
            </div>
            <div className="col" data-aos="flip-left" data-aos-delay="100">
              <div className="card border-success border-2 h-100 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="mb-3" style={{fontSize: '4rem', color: '#28a745'}}>
                    <i className="bi bi-broadcast-pin"></i>
                  </div>
                  <h4 className="mb-3">Telecommunications</h4>
                  <p className="text-muted">Advanced communication systems for seamless connectivity</p>
                </div>
              </div>
            </div>
            <div className="col" data-aos="flip-left" data-aos-delay="200">
              <div className="card border-danger border-2 h-100 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="mb-3" style={{fontSize: '4rem', color: '#dc3545'}}>
                    <i className="bi bi-shield-lock"></i>
                  </div>
                  <h4 className="mb-3">Cybersecurity</h4>
                  <p className="text-muted">Protect your digital assets with enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Solutions - Tabs Style */}
      <section id="solutions" className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">ICT Solutions & Services</h2>
          <p className="text-white-50">Technology infrastructure that drives business success</p>
        </div>
        <div className="container">
          <div className="row g-4">
            {/* Network Solutions */}
            <div className="col-12" data-aos="fade-up" data-aos-delay="0">
              <div className="card bg-white bg-opacity-10 border-0">
                <div className="card-header bg-transparent border-bottom border-white border-opacity-25">
                  <h4 className="text-white mb-0">
                    <i className="bi bi-diagram-3 me-2 text-accent"></i>
                    Network Solutions
                  </h4>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">LAN/WAN Design & Implementation</h6>
                          <p className="text-white-50 small mb-0">Structured cabling, switches, routers, and network optimization</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Wireless Networks (WiFi 6/6E)</h6>
                          <p className="text-white-50 small mb-0">Enterprise WiFi, access points, controllers, and coverage planning</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Network Security Solutions</h6>
                          <p className="text-white-50 small mb-0">Firewalls, IPS/IDS, VPN, and network segmentation</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Network Monitoring & Management</h6>
                          <p className="text-white-50 small mb-0">24/7 monitoring, performance optimization, troubleshooting</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Telecommunications */}
            <div className="col-12" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0">
                <div className="card-header bg-transparent border-bottom border-white border-opacity-25">
                  <h4 className="text-white mb-0">
                    <i className="bi bi-telephone me-2 text-accent"></i>
                    Telecommunications Engineering
                  </h4>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">IP Telephony & VOIP</h6>
                          <p className="text-white-50 small mb-0">Unified communications, PBX systems, SIP trunking</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Video Conferencing Solutions</h6>
                          <p className="text-white-50 small mb-0">Meeting room systems, cloud collaboration platforms</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Fiber Optic Networks</h6>
                          <p className="text-white-50 small mb-0">Fiber installation, splicing, FTTH/FTTB solutions</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Mobile Communication Infrastructure</h6>
                          <p className="text-white-50 small mb-0">DAS, small cells, 4G/5G network deployment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Center & Cloud */}
            <div className="col-12" data-aos="fade-up" data-aos-delay="200">
              <div className="card bg-white bg-opacity-10 border-0">
                <div className="card-header bg-transparent border-bottom border-white border-opacity-25">
                  <h4 className="text-white mb-0">
                    <i className="bi bi-server me-2 text-accent"></i>
                    Data Center & Cloud Infrastructure
                  </h4>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Data Center Design & Build</h6>
                          <p className="text-white-50 small mb-0">Tier I-IV facilities, cooling, power, and infrastructure</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Server & Storage Solutions</h6>
                          <p className="text-white-50 small mb-0">Virtualization, SAN/NAS, backup & disaster recovery</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Cloud Migration & Management</h6>
                          <p className="text-white-50 small mb-0">AWS, Azure, Google Cloud implementation and support</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle-fill text-accent me-2 mt-1"></i>
                        <div>
                          <h6 className="text-white mb-1">Hybrid Cloud Solutions</h6>
                          <p className="text-white-50 small mb-0">On-premise and cloud integration, workload optimization</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Technology Partners</h2>
          <p>Working with industry-leading brands</p>
        </div>
        <div className="container">
          <div className="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3 align-items-center">
            <div className="col text-center" data-aos="zoom-in">
              <div className="p-3 bg-white rounded-3 shadow-sm">
                <p className="mb-0 fw-bold text-primary">Cisco</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in">
              <div className="p-3 bg-white rounded-3 shadow-sm">
                <p className="mb-0 fw-bold text-primary">HP/HPE</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in">
              <div className="p-3 bg-white rounded-3 shadow-sm">
                <p className="mb-0 fw-bold text-primary">Dell</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in">
              <div className="p-3 bg-white rounded-3 shadow-sm">
                <p className="mb-0 fw-bold text-primary">Aruba</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in">
              <div className="p-3 bg-white rounded-3 shadow-sm">
                <p className="mb-0 fw-bold text-primary">Huawei</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in">
              <div className="p-3 bg-white rounded-3 shadow-sm">
                <p className="mb-0 fw-bold text-primary">Microsoft</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cybersecurity Section */}
      <section className="section" style={{background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'}}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0" data-aos="fade-right">
              <h2 className="text-white mb-4">Cybersecurity Services</h2>
              <p className="text-white mb-4">Protect your organization from cyber threats with our comprehensive security solutions.</p>
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex align-items-start text-white">
                    <i className="bi bi-shield-check fs-4 me-3 text-warning"></i>
                    <div>
                      <h6 className="mb-1">Security Assessment & Audit</h6>
                      <p className="small mb-0 text-white-50">Vulnerability scanning, penetration testing, compliance audits</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start text-white">
                    <i className="bi bi-eye fs-4 me-3 text-warning"></i>
                    <div>
                      <h6 className="mb-1">Security Monitoring (SOC)</h6>
                      <p className="small mb-0 text-white-50">24/7 threat detection, SIEM, incident response</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start text-white">
                    <i className="bi bi-envelope-lock fs-4 me-3 text-warning"></i>
                    <div>
                      <h6 className="mb-1">Email & Endpoint Security</h6>
                      <p className="small mb-0 text-white-50">Anti-malware, encryption, DLP solutions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="p-4 bg-white bg-opacity-10 rounded-3 text-white">
                <h5 className="mb-3">Security Certifications & Compliance</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><i className="bi bi-patch-check text-warning me-2"></i>ISO 27001 Implementation</li>
                  <li className="mb-2"><i className="bi bi-patch-check text-warning me-2"></i>PCI-DSS Compliance</li>
                  <li className="mb-2"><i className="bi bi-patch-check text-warning me-2"></i>GDPR & Data Protection</li>
                  <li className="mb-2"><i className="bi bi-patch-check text-warning me-2"></i>Network Security Standards</li>
                  <li><i className="bi bi-patch-check text-warning me-2"></i>Security Policy Development</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Building Integration */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Smart Building & IoT Solutions</h2>
          <p>Integrate intelligent technology for modern facilities</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-cpu display-4 text-primary mb-3"></i>
                  <h5 className="mb-2">Building Management System</h5>
                  <p className="small text-muted mb-0">Centralized control of HVAC, lighting, and energy</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-camera-video display-4 text-primary mb-3"></i>
                  <h5 className="mb-2">CCTV & Surveillance</h5>
                  <p className="small text-muted mb-0">IP cameras, NVR/DVR, video analytics</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-fingerprint display-4 text-primary mb-3"></i>
                  <h5 className="mb-2">Access Control</h5>
                  <p className="small text-muted mb-0">Biometric, card readers, visitor management</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-router display-4 text-primary mb-3"></i>
                  <h5 className="mb-2">IoT Integration</h5>
                  <p className="small text-muted mb-0">Sensors, automation, smart devices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section dark-background">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8" data-aos="zoom-in">
              <h2 className="text-white mb-4">Transform Your ICT Infrastructure</h2>
              <p className="text-white-50 mb-4">Partner with us to build a robust, secure, and future-ready technology foundation for your organization.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/contact" className="btn btn-light btn-lg">
                  <i className="bi bi-envelope me-2"></i>Get Started
                </Link>
                <Link href="/resources/projects" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-folder2-open me-2"></i>Case Studies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

