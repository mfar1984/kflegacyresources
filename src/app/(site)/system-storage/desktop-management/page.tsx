export default function DesktopManagementPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background storage-desktop-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Desktop Management Solutions</h1>
              <p className="text-justify">Streamline IT operations with centralized desktop and endpoint management. Deploy software, enforce policies, patch vulnerabilities, and support users efficiently across hundreds or thousands of devices.</p>
              <div className="d-flex">
                <a href="#features" className="btn-get-started">Simplify IT Management</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/systemstorage-hero.png" className="img-fluid animated" alt="Desktop Management Solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities - Section 1 (Light) - Grid Layout */}
      <section id="features" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Desktop Management Capabilities</h2>
          <p>Control every aspect of your endpoint estate from one console.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-download display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Software Deployment</h5>
                <p className="small text-muted mb-3">Automated application distribution with scheduling, retry logic, and user notification.</p>
                <ul className="list-unstyled small text-dark">
                  <li className="mb-1"><i className="bi bi-dot"></i>Silent installs & uninstalls</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>MSI, EXE, script support</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>Dependency checks</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-patch-check display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Patch Management</h5>
                <p className="small text-muted mb-3">Automated OS and third-party patching with approval workflows and rollback capability.</p>
                <ul className="list-unstyled small text-dark">
                  <li className="mb-1"><i className="bi bi-dot"></i>Windows Update integration</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>Third-party app patching</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>Test groups & staging</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-pc-display display-4 text-primary mb-3"></i>
                <h5 className="mb-3">OS Deployment & Imaging</h5>
                <p className="small text-muted mb-3">Standardized Windows deployment with PXE boot, driver injection, and domain join automation.</p>
                <ul className="list-unstyled small text-dark">
                  <li className="mb-1"><i className="bi bi-dot"></i>MDT / SCCM integration</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>Zero-touch provisioning</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>Driver & app pre-install</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-shield-lock display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Policy Enforcement</h5>
                <p className="small text-muted mb-3">Group Policy (GPO) and configuration baselines ensure security and compliance.</p>
                <ul className="list-unstyled small text-dark">
                  <li className="mb-1"><i className="bi bi-dot"></i>Password & lockout policies</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>USB/device restrictions</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>Firewall & AppLocker rules</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-bar-chart display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Inventory & Reporting</h5>
                <p className="small text-muted mb-3">Real-time asset inventory with hardware, software, and license tracking.</p>
                <ul className="list-unstyled small text-dark">
                  <li className="mb-1"><i className="bi bi-dot"></i>Hardware/software inventory</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>License compliance reports</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>Scheduled dashboards</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                <i className="bi bi-headset display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Remote Support & Control</h5>
                <p className="small text-muted mb-3">Remote desktop, PowerShell execution, and file transfer for quick troubleshooting.</p>
                <ul className="list-unstyled small text-dark">
                  <li className="mb-1"><i className="bi bi-dot"></i>Remote desktop (RDP/VNC)</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>Wake-on-LAN</li>
                  <li className="mb-1"><i className="bi bi-dot"></i>Chat & screen sharing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms - Section 3 (Dark) - Product Showcase */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Management Platforms</h2>
          <p className="text-white-50">Enterprise tools we deploy and support.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3"><i className="bi bi-microsoft text-primary me-2"></i>Microsoft Endpoint Manager (Intune + SCCM)</h5>
                <p className="small text-muted mb-0">Unified endpoint management for Windows, macOS, iOS, and Android with cloud and on-prem options. Patch management, app deployment, compliance policies, and co-management capabilities.</p>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3"><i className="bi bi-building text-primary me-2"></i>VMware Workspace ONE</h5>
                <p className="small text-muted mb-0">Digital workspace platform with unified endpoint management (UEM), virtual app delivery, and zero-trust security for modern workforce mobility and BYOD.</p>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3"><i className="bi bi-globe text-primary me-2"></i>ManageEngine Desktop Central</h5>
                <p className="small text-muted mb-0">Cost-effective desktop management with patch automation, software deployment, and remote control. Ideal for SMB and budget-conscious enterprises requiring comprehensive endpoint control.</p>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3"><i className="bi bi-laptop text-primary me-2"></i>Ivanti Endpoint Manager</h5>
                <p className="small text-muted mb-0">Enterprise endpoint management with self-service portals, application virtualization (App-V), and advanced security posture management for regulated industries.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

