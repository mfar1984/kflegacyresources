export default function ManagementSolutionsPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background network-mgmt-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Network Management Solutions</h1>
              <p className="text-justify">Monitor, manage, and optimize your network with centralized visibility and control. From simple SNMP monitoring to advanced AI-driven analytics, we deliver the tools you need to keep your network running smoothly.</p>
              <div className="d-flex">
                <a href="#platforms" className="btn-get-started">Explore Platforms</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/managementsolution-hero.png" className="img-fluid animated" alt="Network Management Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* Management Platforms - Section 1 (Light) - Large Feature Cards */}
      <section id="platforms" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Management Platforms</h2>
          <p>Choose the right platform for your network size and complexity.</p>
        </div>
        <div className="container">
          <div className="row g-4 mb-5">
            <div className="col-12" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-primary text-white">
                <div className="row align-items-center">
                  <div className="col-lg-2 text-center mb-3 mb-lg-0">
                    <i className="bi bi-cloud-check display-1"></i>
                  </div>
                  <div className="col-lg-10">
                    <h3 className="mb-3">Cloud-Managed Platforms</h3>
                    <p className="mb-3">Zero-touch provisioning, automatic updates, and global visibility from anywhere. Ideal for distributed organizations and MSPs.</p>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <strong>Cisco Meraki</strong>
                        <p className="small mb-0">Full-stack cloud management</p>
                      </div>
                      <div className="col-md-4">
                        <strong>Aruba Central</strong>
                        <p className="small mb-0">AI-powered insights & automation</p>
                      </div>
                      <div className="col-md-4">
                        <strong>TP-Link Omada</strong>
                        <p className="small mb-0">Cost-effective SDN solution</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="d-flex align-items-start mb-3">
                  <i className="bi bi-hdd-rack display-4 text-primary me-3"></i>
                  <div>
                    <h5 className="mb-2">On-Premises Controllers</h5>
                    <p className="small text-muted mb-3">Hardware or virtual appliances for organizations requiring local control and data sovereignty.</p>
                    <ul className="list-unstyled small">
                      <li className="mb-2"><i className="bi bi-dot"></i>Cisco Prime Infrastructure</li>
                      <li className="mb-2"><i className="bi bi-dot"></i>Aruba Mobility Master</li>
                      <li className="mb-2"><i className="bi bi-dot"></i>Ruijie Cloud/On-Prem Controller</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="d-flex align-items-start mb-3">
                  <i className="bi bi-graph-up-arrow display-4 text-primary me-3"></i>
                  <div>
                    <h5 className="mb-2">Network Monitoring (NMS)</h5>
                    <p className="small text-muted mb-3">Real-time visibility with SNMP, NetFlow, syslog, and alerts for proactive issue detection.</p>
                    <ul className="list-unstyled small">
                      <li className="mb-2"><i className="bi bi-dot"></i>PRTG Network Monitor</li>
                      <li className="mb-2"><i className="bi bi-dot"></i>SolarWinds NPM</li>
                      <li className="mb-2"><i className="bi bi-dot"></i>Zabbix / LibreNMS (Open Source)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - Section 2 (Dark) - Icon Grid */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Key Management Features</h2>
          <p className="text-white-50">Comprehensive tools for network operations and troubleshooting.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-display display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Unified Dashboard</h5>
                <p className="text-white-50 small mb-0">Single pane of glass for all devices</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-bell display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Alerts & Notifications</h5>
                <p className="text-white-50 small mb-0">Email/SMS for threshold breaches</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-tools display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Configuration Backup</h5>
                <p className="text-white-50 small mb-0">Automated device config snapshots</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-arrow-clockwise display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Firmware Updates</h5>
                <p className="text-white-50 small mb-0">Centralized patch management</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-graph-up display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Performance Analytics</h5>
                <p className="text-white-50 small mb-0">Bandwidth, latency, packet loss trending</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-geo display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Topology Mapping</h5>
                <p className="text-white-50 small mb-0">Auto-discovery and visual network maps</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-eye display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">User & App Visibility</h5>
                <p className="text-white-50 small mb-0">Who&apos;s using what and how much</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-file-earmark-bar-graph display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Custom Reports</h5>
                <p className="text-white-50 small mb-0">Scheduled PDF/Excel reports for management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Managed Networks - Section 4 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="mb-4">Why Managed Networks Matter</h2>
              <p className="mb-4">Unmanaged networks are like flying blind. Without visibility and control, you can&apos;t diagnose issues, plan capacity, or ensure security. Network management transforms reactive firefighting into proactive optimization.</p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-primary text-white text-center">
                    <h4 className="mb-1">70%</h4>
                    <p className="small mb-0">Faster MTTR</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-primary text-white text-center">
                    <h4 className="mb-1">50%</h4>
                    <p className="small mb-0">Fewer Incidents</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <h5 className="mb-2"><i className="bi bi-lightning-charge text-primary me-2"></i>Proactive Issue Detection</h5>
                    <p className="small text-muted mb-0">Identify problems before users complain. Alerts for high CPU, link saturation, device offline, and anomalies.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <h5 className="mb-2"><i className="bi bi-bar-chart text-primary me-2"></i>Capacity Planning</h5>
                        <p className="small text-muted mb-0">Historical trends show when you&apos;ll need upgrades. Right-size bandwidth and avoid over-provisioning.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow-sm">
                    <h5 className="mb-2"><i className="bi bi-shield-check text-primary me-2"></i>Security & Compliance</h5>
                    <p className="small text-muted mb-0">Audit trails, change logs, and compliance reports for ISO, PCI-DSS, and regulatory requirements.</p>
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

