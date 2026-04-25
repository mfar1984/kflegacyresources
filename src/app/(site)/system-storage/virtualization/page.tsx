export default function VirtualizationPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background storage-virtualization-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Virtualization Solutions</h1>
              <p className="text-justify">Maximize hardware utilization and agility with server virtualization. Run multiple workloads on consolidated infrastructure with rapid provisioning, live migration, and high availability for modern data centers.</p>
              <div className="d-flex">
                <a href="#platforms" className="btn-get-started">Explore Virtualization</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/systemstorage-hero.png" className="img-fluid animated" alt="Virtualization Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* Hypervisor Platforms - Section 1 (Light) - Large Product Cards */}
      <section id="platforms" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Hypervisor Platforms</h2>
          <p>Industry-leading virtualization technologies.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100 border-start border-primary border-4">
                <div className="d-flex align-items-center mb-4">
                  <i className="bi bi-ubuntu display-3 text-primary me-3"></i>
                  <div>
                    <h3 className="mb-1">VMware vSphere</h3>
                    <p className="text-muted small mb-0">Industry Standard for Enterprise Virtualization</p>
                  </div>
                </div>
                <p className="mb-4">vSphere (ESXi + vCenter) is the world&apos;s most trusted virtualization platform. Proven reliability, extensive ecosystem, and advanced features for mission-critical workloads.</p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="mb-2">Key Features:</h6>
                    <ul className="list-unstyled small">
                      <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>vMotion (live migration)</li>
                      <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>HA & DRS clustering</li>
                      <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>Fault Tolerance (FT)</li>
                      <li className="mb-1"><i className="bi bi-check text-primary me-2"></i>Distributed switches</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-2">Use Cases:</h6>
                    <ul className="list-unstyled small">
                      <li className="mb-1"><i className="bi bi-arrow-right text-primary me-2"></i>Enterprise data centers</li>
                      <li className="mb-1"><i className="bi bi-arrow-right text-primary me-2"></i>VDI (Horizon)</li>
                      <li className="mb-1"><i className="bi bi-arrow-right text-primary me-2"></i>Business-critical apps</li>
                      <li className="mb-1"><i className="bi bi-arrow-right text-primary me-2"></i>Large VM estates (100+)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 bg-white shadow-sm h-100 border-start border-info border-4">
                <div className="d-flex align-items-center mb-4">
                  <i className="bi bi-windows display-3 text-info me-3"></i>
                  <div>
                    <h3 className="mb-1">Microsoft Hyper-V</h3>
                    <p className="text-muted small mb-0">Cost-Effective Virtualization for Windows Shops</p>
                  </div>
                </div>
                <p className="mb-4">Built into Windows Server, Hyper-V delivers enterprise virtualization with no additional licensing. Ideal for Microsoft-centric environments and SMBs seeking value.</p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="mb-2">Key Features:</h6>
                    <ul className="list-unstyled small">
                      <li className="mb-1"><i className="bi bi-check text-info me-2"></i>Live Migration</li>
                      <li className="mb-1"><i className="bi bi-check text-info me-2"></i>Failover Clustering</li>
                      <li className="mb-1"><i className="bi bi-check text-info me-2"></i>Replica for DR</li>
                      <li className="mb-1"><i className="bi bi-check text-info me-2"></i>SCVMM management</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-2">Use Cases:</h6>
                    <ul className="list-unstyled small">
                      <li className="mb-1"><i className="bi bi-arrow-right text-info me-2"></i>Windows-centric orgs</li>
                      <li className="mb-1"><i className="bi bi-arrow-right text-info me-2"></i>SMB virtualization</li>
                      <li className="mb-1"><i className="bi bi-arrow-right text-info me-2"></i>Azure hybrid (Arc)</li>
                      <li className="mb-1"><i className="bi bi-arrow-right text-info me-2"></i>Cost-conscious deployments</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Section 3 (Light) - Icon Grid */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Virtualization Benefits</h2>
          <p>Why organizations virtualize their infrastructure.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-speedometer display-3 text-primary mb-3"></i>
                <h5 className="mb-2">80% Less Hardware</h5>
                <p className="small text-muted mb-0">Consolidate 10 physical servers to 2-3 hosts</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-lightning display-3 text-primary mb-3"></i>
                <h5 className="mb-2">Rapid Provisioning</h5>
                <p className="small text-muted mb-0">Deploy new servers in minutes vs days</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-arrow-down-up display-3 text-primary mb-3"></i>
                <h5 className="mb-2">Live Migration</h5>
                <p className="small text-muted mb-0">Zero-downtime host maintenance</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-cash-coin display-3 text-primary mb-3"></i>
                <h5 className="mb-2">Lower TCO</h5>
                <p className="small text-muted mb-0">Reduce power, cooling, and datacenter space</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

