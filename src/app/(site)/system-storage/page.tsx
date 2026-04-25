import Link from "next/link";

export default function SystemStoragePage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background storage-main-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">System & Storage Solutions</h1>
              <p className="text-justify">Enterprise servers, storage, virtualization, and endpoint management. We deliver the compute and storage infrastructure that powers your business applications with reliability, performance, and scalability.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Our Solutions</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/systemstorage-hero.png" className="img-fluid animated" alt="System & Storage Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Section 1 (Light) */}
      <section id="services" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>System & Storage Services</h2>
          <p>Complete infrastructure solutions for modern data centers.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up">
              <Link href="/system-storage/backup-disaster-recovery" className="text-decoration-none">
                <div className="p-4 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-hdd-stack-fill display-4 text-primary me-3"></i>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">Backup & Disaster Recovery</h5>
                      <p className="text-muted small mb-3">Protect your data with automated backups and DR orchestration</p>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge bg-light text-dark">Veeam</span>
                        <span className="badge bg-light text-dark">DR</span>
                        <span className="badge bg-light text-dark">Cloud Backup</span>
                      </div>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <Link href="/system-storage/desktop-management" className="text-decoration-none">
                <div className="p-4 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-pc-display-horizontal display-4 text-primary me-3"></i>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">Desktop Management</h5>
                      <p className="text-muted small mb-3">Centralized control of endpoints with patching and software deployment</p>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge bg-light text-dark">SCCM</span>
                        <span className="badge bg-light text-dark">Intune</span>
                        <span className="badge bg-light text-dark">Patch Mgmt</span>
                      </div>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-up">
              <Link href="/system-storage/san-nas-storage" className="text-decoration-none">
                <div className="p-4 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-server display-4 text-primary me-3"></i>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">SAN & NAS Storage</h5>
                      <p className="text-muted small mb-3">Enterprise storage with RAID, snapshots, and replication</p>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge bg-light text-dark">Dell EMC</span>
                        <span className="badge bg-light text-dark">NetApp</span>
                        <span className="badge bg-light text-dark">QNAP</span>
                      </div>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <Link href="/system-storage/virtualization" className="text-decoration-none">
                <div className="p-4 rounded-3 bg-white shadow-sm h-100 service-hover-card">
                  <div className="d-flex align-items-start mb-3">
                    <i className="bi bi-box-seam display-4 text-primary me-3"></i>
                    <div className="flex-grow-1">
                      <h5 className="mb-2">Virtualization</h5>
                      <p className="text-muted small mb-3">VMware vSphere and Hyper-V for server consolidation</p>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge bg-light text-dark">VMware</span>
                        <span className="badge bg-light text-dark">Hyper-V</span>
                        <span className="badge bg-light text-dark">HA</span>
                      </div>
                    </div>
                    <i className="bi bi-arrow-right display-6 text-primary"></i>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-12" data-aos="fade-up">
              <Link href="/system-storage/windows-linux-solutions" className="text-decoration-none">
                <div className="p-4 rounded-3 bg-white shadow-sm service-hover-card">
                  <div className="row align-items-center">
                    <div className="col-lg-2 text-center">
                      <i className="bi bi-terminal-fill display-1 text-primary"></i>
                    </div>
                    <div className="col-lg-9">
                      <h4 className="mb-2">Windows & Linux Solutions</h4>
                      <p className="text-muted mb-3">Server OS deployment, Active Directory, file servers, web hosting, and database platforms with best-practice configuration.</p>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge bg-light text-dark">Windows Server</span>
                        <span className="badge bg-light text-dark">Linux</span>
                        <span className="badge bg-light text-dark">Active Directory</span>
                        <span className="badge bg-light text-dark">Web Servers</span>
                      </div>
                    </div>
                    <div className="col-lg-1 text-end">
                      <i className="bi bi-arrow-right display-6 text-primary"></i>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Why Choose Our Infrastructure Solutions?</h2>
          <p>Experience, expertise, and proven delivery.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-tools display-3 text-primary mb-3"></i>
                <h5 className="mb-2">Expert Engineers</h5>
                <p className="small text-muted mb-0">VCP, MCSE, Linux+ certified teams</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-trophy display-3 text-primary mb-3"></i>
                <h5 className="mb-2">Proven Track Record</h5>
                <p className="small text-muted mb-0">200+ server & storage deployments</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-headset display-3 text-primary mb-3"></i>
                <h5 className="mb-2">24/7 Support</h5>
                <p className="small text-muted mb-0">Always available when you need us</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-shield-check display-3 text-primary mb-3"></i>
                <h5 className="mb-2">Warranty & SLA</h5>
                <p className="small text-muted mb-0">Comprehensive warranties and guarantees</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
