export default function BandwidthManagementPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background network-bandwidth-hero" style={{
        backgroundImage: 'url(/assets/img/background/bandwidthmanagement.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Bandwidth Management</h1>
              <p className="text-justify">Optimize your network performance with intelligent bandwidth management. Control traffic, prioritize critical applications, and ensure consistent user experience across your organization.</p>
              <div className="d-flex">
                <a href="#solution" className="btn-get-started">Learn More</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/bandwidthmanagement-hero.png" className="img-fluid animated" alt="Bandwidth Management" />
            </div>
          </div>
        </div>
      </section>

      {/* Solution Overview - Section 1 (Light) */}
      <section id="solution" className="section light-background">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-5" data-aos="fade-right">
              <h2 className="mb-4">Take Control of Your Network Traffic</h2>
              <p className="mb-4">Bandwidth management ensures fair allocation of network resources, prevents congestion, and guarantees performance for business-critical applications. Our solutions deliver granular control over traffic shaping, QoS policies, and usage monitoring.</p>
              <div className="p-4 rounded-3 bg-primary text-white">
                <h5 className="mb-3">Key Benefits</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i>Prevent network congestion</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i>Prioritize VoIP & video conferencing</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i>Limit non-business traffic</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill me-2"></i>Fair usage policies</li>
                  <li className="mb-0"><i className="bi bi-check-circle-fill me-2"></i>Real-time monitoring & reporting</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <i className="bi bi-speedometer2 display-5 text-primary mb-3"></i>
                    <h5 className="mb-3">Traffic Shaping & QoS</h5>
                    <p className="small text-muted mb-0">Hierarchical queuing, bandwidth limits per user/group/application, and priority lanes for latency-sensitive traffic like VoIP and video.</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <i className="bi bi-graph-up display-5 text-primary mb-3"></i>
                    <h5 className="mb-3">Usage Monitoring</h5>
                    <p className="small text-muted mb-0">Real-time dashboards showing bandwidth consumption by user, department, application, and protocol with historical trends and alerts.</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <i className="bi bi-diagram-3 display-5 text-primary mb-3"></i>
                    <h5 className="mb-3">Application Control</h5>
                    <p className="small text-muted mb-0">Deep packet inspection (DPI) to identify and control applications. Block, throttle, or prioritize based on business policies.</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded-3 bg-white shadow-sm h-100">
                    <i className="bi bi-shield-check display-5 text-primary mb-3"></i>
                    <h5 className="mb-3">Policy Enforcement</h5>
                    <p className="small text-muted mb-0">Flexible policies by time, user, department, and device. Fair usage quotas, guest bandwidth limits, and automatic enforcement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Our Technology Stack</h2>
          <p className="text-white-50">Enterprise-grade bandwidth management solutions.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4" data-aos="zoom-in">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3"><i className="bi bi-router text-primary me-2"></i>Cisco QoS & NBAR</h5>
                <p className="small text-muted mb-3">Network-Based Application Recognition (NBAR) for deep packet inspection and Class-Based QoS for precise traffic control on Cisco routers and switches.</p>
                <p className="small mb-0"><strong>Best For:</strong> Enterprise networks with Cisco infrastructure</p>
              </div>
            </div>
            <div className="col-lg-4" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3"><i className="bi bi-shield-lock text-primary me-2"></i>pfSense Traffic Shaper</h5>
                <p className="small text-muted mb-3">ALTQ and Limiters for hierarchical queuing, per-user/IP bandwidth limits, and application-based prioritization with real-time graphs.</p>
                <p className="small mb-0"><strong>Best For:</strong> SMB and cost-conscious deployments</p>
              </div>
            </div>
            <div className="col-lg-4" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow h-100">
                <h5 className="mb-3"><i className="bi bi-cloud text-primary me-2"></i>SD-WAN Solutions</h5>
                <p className="small text-muted mb-3">Application-aware routing, dynamic path selection, and WAN optimization with Cisco Meraki, Aruba EdgeConnect, or Fortinet SD-WAN.</p>
                <p className="small mb-0"><strong>Best For:</strong> Multi-site organizations with cloud apps</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Common Use Cases</h2>
          <p>How organizations use bandwidth management to solve real problems.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-up">
              <div className="d-flex p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="me-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                    <i className="bi bi-headset display-6 text-primary"></i>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">VoIP Quality Assurance</h5>
                  <p className="small text-muted mb-0">Guarantee crystal-clear voice calls by prioritizing VoIP traffic (SIP, RTP) with guaranteed bandwidth and minimal latency/jitter. Prevent choppy calls during peak hours.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="d-flex p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="me-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                    <i className="bi bi-youtube display-6 text-primary"></i>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Limit Streaming & Social Media</h5>
                  <p className="small text-muted mb-0">Throttle YouTube, Netflix, Facebook, and TikTok during business hours to preserve bandwidth for work applications. Set quotas or block entirely.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up">
              <div className="d-flex p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="me-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                    <i className="bi bi-arrow-down-up display-6 text-primary"></i>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">P2P & Torrent Control</h5>
                  <p className="small text-muted mb-0">Block or severely limit peer-to-peer file sharing (BitTorrent, eMule) that consumes bandwidth and introduces security risks.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="d-flex p-4 rounded-3 bg-white shadow-sm h-100">
                <div className="me-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                    <i className="bi bi-people display-6 text-primary"></i>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Guest Network Throttling</h5>
                  <p className="small text-muted mb-0">Provide limited bandwidth for guest WiFi to prevent abuse while ensuring staff and critical services have priority access.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

