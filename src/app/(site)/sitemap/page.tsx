import Link from "next/link";

export default function SitemapPage() {
  return (
    <main className="main">
      {/* Page Title */}
      <section className="page-title">
        <div className="container" data-aos="fade-up">
          <h1>Sitemap</h1>
          <p>Complete overview of all pages on our website</p>
        </div>
      </section>

      {/* Sitemap Content */}
      <section className="section">
        <div className="container">
          <div className="row g-4">
            
            {/* Main Pages */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up">
              <div className="sitemap-card h-100">
                <div className="sitemap-icon">
                  <i className="bi bi-house-door"></i>
                </div>
                <h4>Main Pages</h4>
                <ul className="sitemap-list">
                  <li><Link href="/"><i className="bi bi-chevron-right"></i> Home</Link></li>
                  <li><Link href="/#about"><i className="bi bi-chevron-right"></i> About Us</Link></li>
                  <li><Link href="/#vision"><i className="bi bi-chevron-right"></i> Our Vision</Link></li>
                  <li><Link href="/#mission"><i className="bi bi-chevron-right"></i> Our Mission</Link></li>
                  <li><Link href="/#value"><i className="bi bi-chevron-right"></i> Our Value</Link></li>
                  <li><Link href="/#services"><i className="bi bi-chevron-right"></i> Services</Link></li>
                  <li><Link href="/contact"><i className="bi bi-chevron-right"></i> Contact Us</Link></li>
                  <li><Link href="/request-quotation"><i className="bi bi-chevron-right"></i> Request Quotation</Link></li>
                </ul>
              </div>
            </div>

            {/* Network Services */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="sitemap-card h-100">
                <div className="sitemap-icon">
                  <i className="bi bi-diagram-3"></i>
                </div>
                <h4>Network Services</h4>
                <ul className="sitemap-list">
                  <li><Link href="/network"><i className="bi bi-chevron-right"></i> Network Overview</Link></li>
                  <li><Link href="/network/bandwidth-management"><i className="bi bi-chevron-right"></i> Bandwidth Management</Link></li>
                  <li><Link href="/network/internet-intranet-solutions"><i className="bi bi-chevron-right"></i> Internet & Intranet Solutions</Link></li>
                  <li><Link href="/network/infrastructure-setup"><i className="bi bi-chevron-right"></i> Infrastructure Setup</Link></li>
                  <li><Link href="/network/management-solutions"><i className="bi bi-chevron-right"></i> Management Solutions</Link></li>
                </ul>
              </div>
            </div>

            {/* Security Services */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="sitemap-card h-100">
                <div className="sitemap-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h4>Security Services</h4>
                <ul className="sitemap-list">
                  <li><Link href="/security"><i className="bi bi-chevron-right"></i> Security Overview</Link></li>
                  <li><Link href="/security/network-security-solutions"><i className="bi bi-chevron-right"></i> Network Security Solutions</Link></li>
                  <li><Link href="/security/spa"><i className="bi bi-chevron-right"></i> SPA (Structured Physical Audit)</Link></li>
                  <li><Link href="/security/surveillance-solutions"><i className="bi bi-chevron-right"></i> Surveillance Solutions</Link></li>
                </ul>
              </div>
            </div>

            {/* System & Storage Services */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="sitemap-card h-100">
                <div className="sitemap-icon">
                  <i className="bi bi-hdd-rack"></i>
                </div>
                <h4>System & Storage</h4>
                <ul className="sitemap-list">
                  <li><Link href="/system-storage"><i className="bi bi-chevron-right"></i> System & Storage Overview</Link></li>
                  <li><Link href="/system-storage/backup-disaster-recovery"><i className="bi bi-chevron-right"></i> Backup & Disaster Recovery</Link></li>
                  <li><Link href="/system-storage/desktop-management"><i className="bi bi-chevron-right"></i> Desktop Management</Link></li>
                  <li><Link href="/system-storage/san-nas-storage"><i className="bi bi-chevron-right"></i> SAN & NAS Storage</Link></li>
                  <li><Link href="/system-storage/virtualization"><i className="bi bi-chevron-right"></i> Virtualization</Link></li>
                  <li><Link href="/system-storage/windows-linux-solutions"><i className="bi bi-chevron-right"></i> Windows & Linux Solutions</Link></li>
                </ul>
              </div>
            </div>

            {/* Other Services */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up">
              <div className="sitemap-card h-100">
                <div className="sitemap-icon">
                  <i className="bi bi-gear"></i>
                </div>
                <h4>Other Services</h4>
                <ul className="sitemap-list">
                  <li><Link href="/other-services"><i className="bi bi-chevron-right"></i> Other Services Overview</Link></li>
                  <li><Link href="/other-services/car-rental"><i className="bi bi-chevron-right"></i> Car Rental</Link></li>
                  <li><Link href="/other-services/it-advisory"><i className="bi bi-chevron-right"></i> IT Advisory</Link></li>
                  <li><Link href="/other-services/it-outsourcing"><i className="bi bi-chevron-right"></i> IT Outsourcing</Link></li>
                  <li><Link href="/other-services/it-programming"><i className="bi bi-chevron-right"></i> IT Programming</Link></li>
                </ul>
              </div>
            </div>

            {/* Products & Solutions */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="sitemap-card h-100">
                <div className="sitemap-icon">
                  <i className="bi bi-box-seam"></i>
                </div>
                <h4>Products & Solutions</h4>
                <ul className="sitemap-list">
                  <li><Link href="/products"><i className="bi bi-chevron-right"></i> Products Overview</Link></li>
                  <li><Link href="/barcode-rfid"><i className="bi bi-chevron-right"></i> Barcode & RFID Solutions</Link></li>
                </ul>
              </div>
            </div>

            {/* Company Information */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="sitemap-card h-100">
                <div className="sitemap-icon">
                  <i className="bi bi-building"></i>
                </div>
                <h4>Company</h4>
                <ul className="sitemap-list">
                  <li><Link href="/career"><i className="bi bi-chevron-right"></i> Career</Link></li>
                  <li><Link href="/projects"><i className="bi bi-chevron-right"></i> Projects</Link></li>
                </ul>
              </div>
            </div>

            {/* Legal & Policies */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="sitemap-card h-100">
                <div className="sitemap-icon">
                  <i className="bi bi-file-text"></i>
                </div>
                <h4>Legal & Policies</h4>
                <ul className="sitemap-list">
                  <li><Link href="/disclaimer"><i className="bi bi-chevron-right"></i> Disclaimer</Link></li>
                  <li><Link href="/privacy"><i className="bi bi-chevron-right"></i> Privacy Policy</Link></li>
                  <li><Link href="/terms-of-use"><i className="bi bi-chevron-right"></i> Terms of Use</Link></li>
                  <li><Link href="/sitemap"><i className="bi bi-chevron-right"></i> Sitemap</Link></li>
                </ul>
              </div>
            </div>

          </div>

          {/* Quick Contact Section */}
          <div className="row mt-5">
            <div className="col-12" data-aos="fade-up">
              <div className="sitemap-cta">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <h3 className="mb-2">Need Help Finding Something?</h3>
                    <p className="mb-0">Can&apos;t find what you&apos;re looking for? Contact us and we&apos;ll be happy to help.</p>
                  </div>
                  <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                    <Link href="/contact" className="btn btn-primary btn-lg">
                      <i className="bi bi-envelope me-2"></i>Contact Us
                    </Link>
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

