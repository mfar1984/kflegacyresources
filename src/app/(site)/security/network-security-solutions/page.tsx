export default function NetworkSecuritySolutionsPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background security-network-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Network Security Solutions</h1>
              <p className="text-justify">Protect your network from cyber threats with multi-layered security. Firewalls, intrusion prevention, VPN, and threat intelligence keep your data and operations safe from attacks, malware, and unauthorized access.</p>
              <div className="d-flex">
                <a href="#solutions" className="btn-get-started">Secure Your Network</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/security-hero.png" className="img-fluid animated" alt="Network Security Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* Security Layers - Section 1 (Light) - Stacked Cards */}
      <section id="solutions" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Multi-Layered Defense</h2>
          <p>Comprehensive protection from perimeter to endpoint.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-12" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm">
                <div className="row align-items-center">
                  <div className="col-lg-2 text-center">
                    <i className="bi bi-shield-fill-check display-1 text-primary"></i>
                  </div>
                  <div className="col-lg-10">
                    <h4 className="mb-3">Next-Generation Firewalls (NGFW)</h4>
                    <p className="mb-3">Go beyond port/protocol filtering with application awareness, user identity, SSL inspection, and integrated threat prevention.</p>
                    <div className="row">
                      <div className="col-md-6">
                        <ul className="list-unstyled small">
                          <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Stateful packet inspection</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Application control (Layer 7)</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>SSL/TLS decryption</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="list-unstyled small">
                          <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>User/group-based policies</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Geo-IP filtering</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>High availability (HA)</li>
                        </ul>
                      </div>
                    </div>
                    <p className="small text-muted mb-0"><strong>Brands:</strong> Cisco Firepower, Fortinet FortiGate, pfSense, OPNsense, Sophos XG</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm">
                <div className="row align-items-center">
                  <div className="col-lg-2 text-center">
                    <i className="bi bi-bug-fill display-1 text-danger"></i>
                  </div>
                  <div className="col-lg-10">
                    <h4 className="mb-3">Intrusion Prevention System (IPS)</h4>
                    <p className="mb-3">Real-time detection and blocking of exploits, malware, command-and-control traffic, and zero-day attacks with signature and behavior-based engines.</p>
                    <div className="row">
                      <div className="col-md-6">
                        <ul className="list-unstyled small">
                          <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Snort & Suricata engines</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>ET Pro / Talos rulesets</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Custom signatures</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="list-unstyled small">
                          <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Inline blocking mode</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Threat intelligence feeds</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Automated updates</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm">
                <div className="row align-items-center">
                  <div className="col-lg-2 text-center">
                    <i className="bi bi-lock-fill display-1 text-success"></i>
                  </div>
                  <div className="col-lg-10">
                    <h4 className="mb-3">VPN & Secure Remote Access</h4>
                    <p className="mb-3">Encrypted tunnels for site-to-site connectivity and remote workers with multi-factor authentication and certificate-based security.</p>
                    <div className="row">
                      <div className="col-md-6">
                        <ul className="list-unstyled small">
                          <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>IPsec site-to-site VPN</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>OpenVPN / WireGuard</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>SSL VPN portal</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="list-unstyled small">
                          <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Two-factor authentication</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Mobile & desktop clients</li>
                          <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Split tunneling options</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Security Features - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Advanced Security Features</h2>
          <p className="text-white-50">Go beyond basic firewall protection.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-filter-circle display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Web Filtering & DNS Security</h5>
                <p className="small text-muted mb-0">Category-based content filtering, malware/phishing domain blocking, and safe search enforcement with detailed reporting.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-virus display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Anti-Malware & Sandboxing</h5>
                <p className="small text-muted mb-0">Real-time scanning of files, emails, and downloads with cloud-based sandboxing for unknown threats and zero-day exploits.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-exclamation-triangle display-4 text-primary mb-3"></i>
                <h5 className="mb-3">DDoS Protection</h5>
                <p className="small text-muted mb-0">Detect and mitigate distributed denial-of-service attacks with rate limiting, SYN cookies, and upstream scrubbing services.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-eye-slash display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Data Loss Prevention (DLP)</h5>
                <p className="small text-muted mb-0">Monitor and block sensitive data exfiltration via email, web, USB, or cloud with policy-based enforcement.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-file-earmark-lock display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Email Security Gateway</h5>
                <p className="small text-muted mb-0">Spam filtering, phishing protection, attachment sandboxing, and email encryption for secure communications.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-clipboard-data display-4 text-primary mb-3"></i>
                <h5 className="mb-3">SIEM & Log Management</h5>
                <p className="small text-muted mb-0">Centralized logging, correlation, and security event analysis for compliance and forensic investigation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Standards - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-5" data-aos="fade-right">
              <h2 className="mb-4">Compliance-Ready Security</h2>
              <p className="mb-4">Meet regulatory requirements with security controls, audit trails, and documentation that satisfy ISO 27001, PCI-DSS, PDPA, and government mandates.</p>
              <div className="p-4 rounded-3 bg-primary text-white">
                <h5 className="mb-3">Compliance Support</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i>ISO 27001 controls mapping</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i>PCI-DSS firewall requirements</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i>PDPA data protection</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i>Audit logs & reporting</li>
                  <li className="mb-0"><i className="bi bi-check-circle-fill me-2"></i>Vulnerability assessments</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                    <i className="bi bi-shield-lock-fill display-3 text-primary mb-3"></i>
                    <h5 className="mb-2">Defense in Depth</h5>
                    <p className="small text-muted mb-0">Multiple security layers prevent single point of failure</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                    <i className="bi bi-arrow-repeat display-3 text-primary mb-3"></i>
                    <h5 className="mb-2">Continuous Monitoring</h5>
                    <p className="small text-muted mb-0">24/7 threat detection and automated response</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                    <i className="bi bi-clock-history display-3 text-primary mb-3"></i>
                    <h5 className="mb-2">Incident Response</h5>
                    <p className="small text-muted mb-0">Rapid containment and forensic analysis</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                    <i className="bi bi-patch-check display-3 text-primary mb-3"></i>
                    <h5 className="mb-2">Regular Updates</h5>
                    <p className="small text-muted mb-0">Firmware patches and signature updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Threat Landscape - Section 2 (Dark) - Info Cards */}
      <section className="section dark-background">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <h2 className="text-white mb-3">Modern Threat Landscape</h2>
              <p className="text-white-50">Cyber threats are evolving. Your security must evolve faster.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="fade-up">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-envelope-x display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Phishing & Social Engineering</h5>
                <p className="text-white-50 small mb-0">93% of breaches start with phishing emails</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-file-lock display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Ransomware Attacks</h5>
                <p className="text-white-50 small mb-0">Encryption of files demanding payment for decryption</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-person-x display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Insider Threats</h5>
                <p className="text-white-50 small mb-0">Malicious or negligent employees compromising data</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-box-arrow-in-right display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Lateral Movement</h5>
                <p className="text-white-50 small mb-0">Attackers moving between systems after initial breach</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach - Section 3 (Light) - Timeline */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Our Security Approach</h2>
          <p>From assessment to ongoing protection.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="d-flex p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="me-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                    <strong>1</strong>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Security Assessment</h5>
                  <p className="small text-muted mb-0">Current state analysis, vulnerability scan, and risk assessment to identify gaps and prioritize remediation.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="d-flex p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="me-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                    <strong>2</strong>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Policy & Architecture Design</h5>
                  <p className="small text-muted mb-0">Security policies, firewall rules, segmentation strategy, and technology selection aligned to your risk profile.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-right">
              <div className="d-flex p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="me-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                    <strong>3</strong>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Deployment & Hardening</h5>
                  <p className="small text-muted mb-0">Professional installation, configuration per best practices, testing, and security hardening with documentation.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="d-flex p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="me-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                    <strong>4</strong>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Monitoring & Maintenance</h5>
                  <p className="small text-muted mb-0">24/7 monitoring, quarterly reviews, patch management, and continuous improvement with annual pen-testing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

