export default function BackupDRPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background storage-backup-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Backup & Disaster Recovery</h1>
              <p className="text-justify">Protect your business from data loss with comprehensive backup and disaster recovery solutions. From automated backups to full DR orchestration, we ensure your data is safe and your business can recover quickly from any disruption.</p>
              <div className="d-flex">
                <a href="#solutions" className="btn-get-started">Protect Your Data</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/systemstorage-hero.png" className="img-fluid animated" alt="Backup & Disaster Recovery" />
            </div>
          </div>
        </div>
      </section>

      {/* 3-2-1 Rule - Section 1 (Light) - Highlight Banner */}
      <section id="solutions" className="section light-background">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-primary text-white text-center">
                <h2 className="mb-3">The 3-2-1 Backup Rule</h2>
                <div className="row">
                  <div className="col-lg-4">
                    <div className="p-3">
                      <h1 className="display-1 mb-2">3</h1>
                      <p className="mb-0">Keep at least 3 copies of your data</p>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="p-3">
                      <h1 className="display-1 mb-2">2</h1>
                      <p className="mb-0">Store backups on 2 different media types</p>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="p-3">
                      <h1 className="display-1 mb-2">1</h1>
                      <p className="mb-0">Keep 1 copy offsite or in the cloud</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-hdd-stack display-3 text-primary mb-4"></i>
                <h4 className="mb-3">Backup Solutions</h4>
                <p className="mb-4">Automated, reliable backups with versioning, deduplication, and encryption to protect against accidental deletion, ransomware, and hardware failure.</p>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Incremental & differential backups</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>File, VM, database, and application-aware</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Deduplication & compression</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>AES-256 encryption at rest & in transit</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Automated scheduling & retention policies</li>
                  <li className="mb-0"><i className="bi bi-check-circle-fill text-primary me-2"></i>Backup verification & test restores</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-arrow-repeat display-3 text-primary mb-4"></i>
                <h4 className="mb-3">Disaster Recovery (DR)</h4>
                <p className="mb-4">Business continuity with orchestrated failover to secondary sites or cloud. Minimize downtime and meet recovery time objectives (RTO) and recovery point objectives (RPO).</p>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Hot, warm, or cold DR sites</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>VM replication & failover orchestration</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>RTO/RPO planning & SLA alignment</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Runbook automation & testing</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Annual DR drills & validation</li>
                  <li className="mb-0"><i className="bi bi-check-circle-fill text-primary me-2"></i>Cloud DR (DRaaS) options</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies - Section 2 (Dark) - Product Cards */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Backup & DR Technologies</h2>
          <p className="text-white-50">Enterprise-grade platforms we deploy and support.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3">Veeam Backup & Replication</h5>
                <p className="small text-muted mb-3">Industry-leading VM backup with instant recovery, replication, and cloud integration for VMware and Hyper-V.</p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-light text-dark">VM Backup</span>
                  <span className="badge bg-light text-dark">Instant Recovery</span>
                  <span className="badge bg-light text-dark">Cloud Ready</span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3">Acronis Cyber Protect</h5>
                <p className="small text-muted mb-3">Unified backup and cybersecurity with anti-malware, anti-ransomware, and forensic recovery capabilities.</p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-light text-dark">Cyber Protection</span>
                  <span className="badge bg-light text-dark">Ransomware Defense</span>
                  <span className="badge bg-light text-dark">Forensics</span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3">Veritas NetBackup</h5>
                <p className="small text-muted mb-3">Enterprise data protection for heterogeneous environments with petabyte-scale capability and multi-cloud support.</p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-light text-dark">Enterprise Scale</span>
                  <span className="badge bg-light text-dark">Multi-Platform</span>
                  <span className="badge bg-light text-dark">Deduplication</span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3">Microsoft Azure Backup</h5>
                <p className="small text-muted mb-3">Cloud-native backup for Azure VMs, on-prem servers, and Microsoft 365 with geo-redundant storage.</p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-light text-dark">Cloud Native</span>
                  <span className="badge bg-light text-dark">M365 Backup</span>
                  <span className="badge bg-light text-dark">Geo-Redundant</span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3">Commvault Complete</h5>
                <p className="small text-muted mb-3">Comprehensive data management with backup, recovery, archiving, and analytics across on-prem and cloud.</p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-light text-dark">Data Management</span>
                  <span className="badge bg-light text-dark">Archiving</span>
                  <span className="badge bg-light text-dark">Analytics</span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3">Zerto Disaster Recovery</h5>
                <p className="small text-muted mb-3">Continuous data protection (CDP) with near-zero RPO and orchestrated failover for VMware and Hyper-V.</p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-light text-dark">CDP</span>
                  <span className="badge bg-light text-dark">Orchestration</span>
                  <span className="badge bg-light text-dark">Near-Zero RPO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recovery Tiers - Section 3 (Light) - Table Comparison */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Disaster Recovery Tiers</h2>
          <p>Choose the DR level that matches your business requirements and budget.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <span className="badge bg-secondary mb-3">Tier 3</span>
                <h5 className="mb-3">Cold Site</h5>
                <p className="small text-muted mb-3">Empty facility with basic infrastructure</p>
                <div className="mb-3">
                  <strong className="text-primary">RTO: Days</strong><br/>
                  <strong className="text-primary">RPO: 24hrs</strong>
                </div>
                <p className="small text-muted mb-0">Manual recovery with tape restores. Lowest cost, highest recovery time.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <span className="badge bg-info mb-3">Tier 2</span>
                <h5 className="mb-3">Warm Site</h5>
                <p className="small text-muted mb-3">Partial infrastructure with recent backups</p>
                <div className="mb-3">
                  <strong className="text-primary">RTO: Hours</strong><br/>
                  <strong className="text-primary">RPO: 1-4hrs</strong>
                </div>
                <p className="small text-muted mb-0">Scheduled replication with semi-automated failover. Balanced cost/recovery.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100 border border-primary border-2">
                <span className="badge bg-success mb-3">Tier 1</span>
                <h5 className="mb-3">Hot Site</h5>
                <p className="small text-muted mb-3">Fully mirrored infrastructure ready to go</p>
                <div className="mb-3">
                  <strong className="text-primary">RTO: Minutes</strong><br/>
                  <strong className="text-primary">RPO: Near-Zero</strong>
                </div>
                <p className="small text-muted mb-0">Real-time replication with automatic failover. Highest cost, minimal downtime.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <span className="badge bg-primary mb-3">Cloud DR</span>
                <h5 className="mb-3">DRaaS</h5>
                <p className="small text-muted mb-3">Cloud-based disaster recovery as a service</p>
                <div className="mb-3">
                  <strong className="text-primary">RTO: Configurable</strong><br/>
                  <strong className="text-primary">RPO: Minutes</strong>
                </div>
                <p className="small text-muted mb-0">Pay-as-you-go DR with no secondary datacenter investment required.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - Section 2 (Dark) - Two Column */}
      <section className="section dark-background">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="text-white mb-4">Why Backup & DR Matter</h2>
              <p className="text-white mb-4">60% of businesses that lose data shut down within 6 months. Ransomware, hardware failure, natural disasters, and human error can strike anytime. Are you prepared?</p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                    <h3 className="text-white mb-1">$200K</h3>
                    <p className="small text-white-50 mb-0">Avg. Cost of Downtime/Hour</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded bg-white bg-opacity-10 text-center">
                    <h3 className="text-white mb-1">93%</h3>
                    <p className="small text-white-50 mb-0">Companies Hit by Ransomware</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow">
                    <h6 className="mb-2"><i className="bi bi-shield-fill-check text-primary me-2"></i>Ransomware Protection</h6>
                    <p className="small text-muted mb-0">Immutable backups, air-gapped copies, and rapid recovery prevent paying ransoms.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow">
                    <h6 className="mb-2"><i className="bi bi-clock-history text-primary me-2"></i>Point-in-Time Recovery</h6>
                    <p className="small text-muted mb-0">Restore to any backup snapshot - hourly, daily, or weekly retention.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow">
                    <h6 className="mb-2"><i className="bi bi-file-earmark-check text-primary me-2"></i>Compliance & Retention</h6>
                    <p className="small text-muted mb-0">Meet regulatory requirements with audit logs and long-term archival.</p>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-4 rounded-3 bg-white shadow">
                    <h6 className="mb-2"><i className="bi bi-lightning text-primary me-2"></i>Instant VM Recovery</h6>
                    <p className="small text-muted mb-0">Boot VMs directly from backup storage within minutes for critical services.</p>
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

