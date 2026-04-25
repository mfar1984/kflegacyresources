export default function SANNASPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background storage-san-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">SAN & NAS Storage Solutions</h1>
              <p className="text-justify">Scale your storage infrastructure with enterprise SAN and NAS systems. From block-level SAN for databases and VMs to file-level NAS for collaboration, we deliver performance, redundancy, and data protection.</p>
              <div className="d-flex">
                <a href="#comparison" className="btn-get-started">Compare Solutions</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/systemstorage-hero.png" className="img-fluid animated" alt="SAN & NAS Storage Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* SAN vs NAS - Section 1 (Light) - Comparison Cards */}
      <section id="comparison" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>SAN vs NAS: Which Do You Need?</h2>
          <p>Understanding the difference helps you choose the right architecture.</p>
        </div>
        <div className="container">
          <div className="row g-4 mb-5">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100 border-top border-primary border-4">
                <div className="mb-4">
                  <i className="bi bi-hdd-rack-fill display-3 text-primary"></i>
                  <h3 className="mt-3 mb-2">Storage Area Network (SAN)</h3>
                  <p className="text-muted small">Block-level storage over dedicated network</p>
                </div>
                <h6 className="mb-3">Best For:</h6>
                <ul className="list-unstyled mb-4">
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Database servers (SQL, Oracle)</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Virtual machine datastores</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>High-performance applications</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Boot from SAN</li>
                </ul>
                <h6 className="mb-3">Key Features:</h6>
                <div className="row g-2 small">
                  <div className="col-6"><i className="bi bi-lightning-fill text-primary me-2"></i>Low latency</div>
                  <div className="col-6"><i className="bi bi-lightning-fill text-primary me-2"></i>High IOPS</div>
                  <div className="col-6"><i className="bi bi-lightning-fill text-primary me-2"></i>Fibre Channel / iSCSI</div>
                  <div className="col-6"><i className="bi bi-lightning-fill text-primary me-2"></i>Block-level access</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100 border-top border-success border-4">
                <div className="mb-4">
                  <i className="bi bi-server display-3 text-success"></i>
                  <h3 className="mt-3 mb-2">Network Attached Storage (NAS)</h3>
                  <p className="text-muted small">File-level storage over standard Ethernet</p>
                </div>
                <h6 className="mb-3">Best For:</h6>
                <ul className="list-unstyled mb-4">
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>File shares & collaboration</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Home directories & user data</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Backup target storage</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Media & document archiving</li>
                </ul>
                <h6 className="mb-3">Key Features:</h6>
                <div className="row g-2 small">
                  <div className="col-6"><i className="bi bi-folder-fill text-success me-2"></i>Easy file access</div>
                  <div className="col-6"><i className="bi bi-folder-fill text-success me-2"></i>SMB/NFS protocols</div>
                  <div className="col-6"><i className="bi bi-folder-fill text-success me-2"></i>Cost-effective</div>
                  <div className="col-6"><i className="bi bi-folder-fill text-success me-2"></i>Simple management</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storage Features - Section 2 (Dark) - Feature Grid */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Enterprise Storage Features</h2>
          <p className="text-white-50">Reliability, performance, and data protection built-in.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-hdd display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">RAID Protection</h5>
                <p className="text-white-50 small mb-0">RAID 5/6/10 for redundancy and performance with hot-spare drives</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-camera-reels display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Snapshots & Clones</h5>
                <p className="text-white-50 small mb-0">Point-in-time recovery and rapid provisioning with storage snapshots</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-lightning display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Tiered Storage</h5>
                <p className="text-white-50 small mb-0">SSD/NVMe for hot data, HDD for warm/cold automatic tiering</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-arrow-left-right display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Replication</h5>
                <p className="text-white-50 small mb-0">Synchronous/asynchronous replication to DR site for data protection</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-hdd-fill display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Thin Provisioning</h5>
                <p className="text-white-50 small mb-0">Oversubscription and dynamic allocation for capacity optimization</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-file-zip display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Deduplication</h5>
                <p className="text-white-50 small mb-0">Inline or post-process dedupe reduces storage footprint by 10-50x</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-lock display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">Encryption</h5>
                <p className="text-white-50 small mb-0">Data-at-rest encryption with key management for compliance</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-arrow-repeat display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-3">High Availability</h5>
                <p className="text-white-50 small mb-0">Dual controllers, redundant paths, and automatic failover</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vendors - Section 3 (Light) - Logo Grid */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Storage Vendors We Partner With</h2>
          <p>Leading brands for enterprise and SMB storage.</p>
        </div>
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-lg-3 col-md-4 col-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h6 className="mb-2">Dell EMC</h6>
                <p className="small text-muted mb-0">Unity, PowerStore, Isilon</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6" data-aos="zoom-in" data-aos-delay="50">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h6 className="mb-2">HPE</h6>
                <p className="small text-muted mb-0">Nimble, 3PAR, StoreOnce</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h6 className="mb-2">NetApp</h6>
                <p className="small text-muted mb-0">AFF, FAS, ONTAP</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6" data-aos="zoom-in" data-aos-delay="150">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h6 className="mb-2">QNAP</h6>
                <p className="small text-muted mb-0">SMB NAS appliances</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h6 className="mb-2">Synology</h6>
                <p className="small text-muted mb-0">Reliable NAS with DSM</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6" data-aos="zoom-in" data-aos-delay="50">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h6 className="mb-2">Pure Storage</h6>
                <p className="small text-muted mb-0">All-flash arrays</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h6 className="mb-2">Lenovo</h6>
                <p className="small text-muted mb-0">ThinkSystem storage</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6" data-aos="zoom-in" data-aos-delay="150">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <h6 className="mb-2">Buffalo</h6>
                <p className="small text-muted mb-0">TeraStation NAS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - Section 2 (Dark) - Split with Icons */}
      <section className="section dark-background">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <h2 className="text-white mb-3">Storage Use Cases</h2>
              <p className="text-white-50">Common scenarios where SAN and NAS deliver value.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-right">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-database-fill-check display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Database Storage (SAN)</h5>
                  <p className="text-white-50 small mb-0">Dedicated LUNs for SQL Server, Oracle, MySQL with low-latency block storage for transactional workloads requiring high IOPS and consistent performance.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-box-seam display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">VM Datastores (SAN)</h5>
                  <p className="text-white-50 small mb-0">Shared storage for VMware vSphere or Hyper-V clusters with vMotion/Live Migration, snapshots, and thin provisioning for virtual infrastructure.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-right">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-folder-fill display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">File Sharing (NAS)</h5>
                  <p className="text-white-50 small mb-0">Centralized file server with Windows (SMB) and Linux (NFS) shares, permissions, quotas, and shadow copies for version recovery.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="d-flex p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-camera-video-fill display-4 text-accent me-4"></i>
                <div>
                  <h5 className="text-white mb-2">Surveillance Recording (NAS)</h5>
                  <p className="text-white-50 small mb-0">Large-capacity NAS for IP camera recording with iSCSI targets for NVRs or direct SMB recording with optimized RAID for streaming writes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sizing Guide - Section 3 (Light) - Cards */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Storage Sizing Guide</h2>
          <p>Right-size your storage investment.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <span className="badge bg-light text-dark mb-3">SMB</span>
                <h5 className="mb-3">5-20 Users</h5>
                <p className="small text-muted mb-3">2-8TB usable capacity</p>
                <ul className="list-unstyled small text-start">
                  <li className="mb-2"><i className="bi bi-check text-primary me-2"></i>Entry NAS (QNAP, Synology)</li>
                  <li className="mb-2"><i className="bi bi-check text-primary me-2"></i>4-6 bay with RAID 5</li>
                  <li className="mb-2"><i className="bi bi-check text-primary me-2"></i>1GbE connectivity</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <span className="badge bg-primary mb-3">Mid-Market</span>
                <h5 className="mb-3">50-200 Users</h5>
                <p className="small text-muted mb-3">20-100TB usable capacity</p>
                <ul className="list-unstyled small text-start">
                  <li className="mb-2"><i className="bi bi-check text-primary me-2"></i>Business NAS or entry SAN</li>
                  <li className="mb-2"><i className="bi bi-check text-primary me-2"></i>12-24 bay with RAID 6</li>
                  <li className="mb-2"><i className="bi bi-check text-primary me-2"></i>10GbE or iSCSI</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <span className="badge bg-success mb-3">Enterprise</span>
                <h5 className="mb-3">500+ Users</h5>
                <p className="small text-muted mb-3">100TB to multi-PB</p>
                <ul className="list-unstyled small text-start">
                  <li className="mb-2"><i className="bi bi-check text-primary me-2"></i>Enterprise SAN (Dell EMC, NetApp)</li>
                  <li className="mb-2"><i className="bi bi-check text-primary me-2"></i>Dual controllers, HA</li>
                  <li className="mb-2"><i className="bi bi-check text-primary me-2"></i>16/32Gb FC or 25/100GbE</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

