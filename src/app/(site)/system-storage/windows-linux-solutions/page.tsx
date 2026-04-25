export default function WindowsLinuxPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background storage-os-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Windows & Linux Solutions</h1>
              <p className="text-justify">Deploy, manage, and secure Windows and Linux server infrastructure. From Active Directory and file servers to web hosting and database platforms, we deliver enterprise-grade OS solutions with best-practice configuration and ongoing support.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Our Services</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/systemstorage-hero.png" className="img-fluid animated" alt="Windows & Linux Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* OS Platforms - Section 1 (Light) - Side by Side */}
      <section id="services" className="section light-background">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-windows display-1 text-primary mb-4"></i>
                <h3 className="mb-4">Windows Server Solutions</h3>
                <p className="mb-4">Microsoft Windows Server for business applications, file services, and Active Directory with licensing, deployment, and management expertise.</p>
                <div className="mb-4">
                  <h6 className="mb-3">Core Services:</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Active Directory Domain Services (AD DS)</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>File & Print Services (SMB shares)</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>DNS, DHCP, WINS</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Group Policy Management</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Remote Desktop Services (RDS)</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Hyper-V Virtualization</li>
                  </ul>
                </div>
                <div>
                  <h6 className="mb-3">Editions:</h6>
                  <div className="row g-2 small">
                    <div className="col-6">
                      <div className="p-2 rounded bg-light text-center">
                        <strong>Essentials</strong><br/>
                        <span className="text-muted">Up to 25 users</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded bg-light text-center">
                        <strong>Standard</strong><br/>
                        <span className="text-muted">2 VMs</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-2 rounded bg-primary text-white text-center">
                        <strong>Datacenter</strong> — Unlimited VMs (most popular)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-terminal-fill display-1 text-success mb-4"></i>
                <h3 className="mb-4">Linux Server Solutions</h3>
                <p className="mb-4">Open-source Linux distributions for web servers, databases, containers, and cloud-native applications with security hardening and enterprise support.</p>
                <div className="mb-4">
                  <h6 className="mb-3">Core Services:</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Web Servers (Apache, Nginx)</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Database Servers (MySQL, PostgreSQL)</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Docker & Kubernetes</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>LDAP & Samba (AD integration)</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>NFS & CIFS file sharing</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Firewall & security hardening</li>
                  </ul>
                </div>
                <div>
                  <h6 className="mb-3">Distributions:</h6>
                  <div className="row g-2 small">
                    <div className="col-6">
                      <div className="p-2 rounded bg-light text-center">
                        <strong>Ubuntu Server</strong><br/>
                        <span className="text-muted">Popular & user-friendly</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded bg-light text-center">
                        <strong>RHEL / CentOS</strong><br/>
                        <span className="text-muted">Enterprise support</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-2 rounded bg-success text-white text-center">
                        <strong>Debian</strong> — Stable & reliable for production
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services We Provide - Section 2 (Dark) - Service Cards */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">What We Deliver</h2>
          <p className="text-white-50">Comprehensive Windows and Linux server services.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-box-seam display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Server Installation & Configuration</h5>
                <p className="small text-muted mb-0">Fresh OS install, role/feature configuration, security hardening, domain join, and handover with documentation.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-arrow-up-circle display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Migration & Upgrades</h5>
                <p className="small text-muted mb-0">In-place or swing migration to newer OS versions with application compatibility testing and minimal downtime.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-shield-check display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Security Hardening</h5>
                <p className="small text-muted mb-0">CIS benchmark compliance, firewall rules, SELinux/AppArmor, and audit logging per best practices.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-wrench display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Performance Tuning</h5>
                <p className="small text-muted mb-0">Optimize memory, disk I/O, network stack, and kernel parameters for workload-specific performance.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-life-preserver display-4 text-primary mb-3"></i>
                <h5 className="mb-3">24/7 Support & Monitoring</h5>
                <p className="small text-muted mb-0">Proactive monitoring, alerting, patch management, and rapid issue resolution with SLA guarantees.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-clipboard-data display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Compliance & Auditing</h5>
                <p className="small text-muted mb-0">Audit logs, compliance reports, and policy enforcement for ISO, PCI-DSS, and regulatory requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Workloads - Section 4 (Light) - Workload Cards */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Common Server Workloads</h2>
          <p>Applications and services we deploy on Windows and Linux.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="d-flex align-items-start">
                  <i className="bi bi-database-fill display-5 text-primary me-3"></i>
                  <div>
                    <h5 className="mb-2">Database Servers</h5>
                    <p className="small text-muted mb-0">Microsoft SQL Server, MySQL, PostgreSQL, Oracle with HA clustering, backup integration, and performance optimization.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="d-flex align-items-start">
                  <i className="bi bi-globe display-5 text-primary me-3"></i>
                  <div>
                    <h5 className="mb-2">Web & Application Servers</h5>
                    <p className="small text-muted mb-0">IIS, Apache, Nginx, Tomcat with SSL certificates, load balancing, and reverse proxy configuration.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="d-flex align-items-start">
                  <i className="bi bi-envelope display-5 text-primary me-3"></i>
                  <div>
                    <h5 className="mb-2">Mail Servers</h5>
                    <p className="small text-muted mb-0">Microsoft Exchange, Zimbra, Postfix/Dovecot with spam filtering, antivirus, and mobile ActiveSync support.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="d-flex align-items-start">
                  <i className="bi bi-box display-5 text-primary me-3"></i>
                  <div>
                    <h5 className="mb-2">Container Platforms</h5>
                    <p className="small text-muted mb-0">Docker, Kubernetes (K8s), OpenShift for microservices and cloud-native application deployment with orchestration.</p>
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

