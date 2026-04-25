export default function SPAPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background security-spa-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Security Posture Assessment (SPA)</h1>
              <p className="text-justify">Understand your security risks before attackers do. Our comprehensive SPA evaluates your infrastructure, policies, and practices to identify vulnerabilities and provide actionable recommendations for improvement.</p>
              <div className="d-flex">
                <a href="#assessment" className="btn-get-started">Get Assessed</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/security-hero.png" className="img-fluid animated" alt="Security Posture Assessment" />
            </div>
          </div>
        </div>
      </section>

      {/* What is SPA - Section 1 (Light) - Split Layout */}
      <section id="assessment" className="section light-background">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="mb-4">What is Security Posture Assessment?</h2>
              <p className="mb-4">SPA is a comprehensive evaluation of your organization&apos;s security readiness. We examine technical controls, processes, and human factors to provide a holistic view of your security strengths and weaknesses.</p>
              <p className="mb-4">Unlike penetration testing that simulates attacks, SPA takes a broader view—assessing policies, configurations, access controls, patch management, backup procedures, and security awareness across your entire IT estate.</p>
              <div className="p-4 rounded-3 bg-primary text-white">
                <h5 className="mb-3">Assessment Deliverables</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><i className="bi bi-file-earmark-text-fill me-2"></i>Executive summary report</li>
                  <li className="mb-2"><i className="bi bi-file-earmark-text-fill me-2"></i>Detailed findings with evidence</li>
                  <li className="mb-2"><i className="bi bi-file-earmark-text-fill me-2"></i>Risk scoring & prioritization</li>
                  <li className="mb-2"><i className="bi bi-file-earmark-text-fill me-2"></i>Remediation roadmap</li>
                  <li className="mb-0"><i className="bi bi-file-earmark-text-fill me-2"></i>Compliance gap analysis</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <i className="bi bi-search display-4 text-primary mb-3"></i>
                    <h5 className="mb-3">Vulnerability Scanning</h5>
                    <p className="small text-muted mb-0">Automated scanning of servers, network devices, and applications for known vulnerabilities (CVEs) with severity ratings and patch recommendations.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <i className="bi bi-gear-fill display-4 text-primary mb-3"></i>
                    <h5 className="mb-3">Configuration Review</h5>
                    <p className="small text-muted mb-0">Audit firewall rules, router ACLs, switch port security, wireless encryption, and server hardening against CIS benchmarks and vendor best practices.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <i className="bi bi-people-fill display-4 text-primary mb-3"></i>
                    <h5 className="mb-3">Policy & Process Review</h5>
                    <p className="small text-muted mb-0">Evaluate access control policies, password practices, change management, backup procedures, and incident response plans.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Scope - Section 2 (Dark) - Checklist Style */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Assessment Scope</h2>
          <p className="text-white-50">What we evaluate during a comprehensive SPA engagement.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-4 text-dark"><i className="bi bi-hdd-network text-primary me-2"></i>Network Security</h5>
                <ul className="list-unstyled small mb-0 text-dark">
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Firewall rule review & optimization</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Network segmentation & VLAN design</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>VPN configuration & encryption strength</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Wireless security (WPA3, 802.1X)</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>IDS/IPS effectiveness</li>
                  <li className="mb-0"><i className="bi bi-check2-circle text-primary me-2"></i>DDoS protection measures</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-4 text-dark"><i className="bi bi-server text-primary me-2"></i>Server & Endpoint Security</h5>
                <ul className="list-unstyled small mb-0 text-dark">
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>OS patch levels & update compliance</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Anti-malware coverage & definitions</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>EDR/XDR deployment status</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Server hardening (CIS benchmarks)</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Local admin & privilege management</li>
                  <li className="mb-0"><i className="bi bi-check2-circle text-primary me-2"></i>USB/device control policies</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-4 text-dark"><i className="bi bi-person-lock text-primary me-2"></i>Identity & Access Management</h5>
                <ul className="list-unstyled small mb-0 text-dark">
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Active Directory security posture</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Password policies & complexity</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Multi-factor authentication (MFA) coverage</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Privileged account monitoring</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>User access reviews & least privilege</li>
                  <li className="mb-0"><i className="bi bi-check2-circle text-primary me-2"></i>Offboarding processes</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-4 text-dark"><i className="bi bi-file-earmark-ruled text-primary me-2"></i>Policies & Governance</h5>
                <ul className="list-unstyled small mb-0 text-dark">
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Information security policy existence</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Acceptable use & BYOD policies</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Incident response plan & testing</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Business continuity & DR plans</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-primary me-2"></i>Security awareness training</li>
                  <li className="mb-0"><i className="bi bi-check2-circle text-primary me-2"></i>Vendor risk management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

