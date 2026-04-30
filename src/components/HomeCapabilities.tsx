export default function HomeCapabilities() {
  return (
    <section id="services" className="section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Core Capabilities</h2>
        <p>From ground to grid to network</p>
      </div>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="0">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <i className="bi bi-building display-5 text-primary mb-3"></i>
                <h5 className="mb-2">Civil Engineering</h5>
                <p className="text-muted small mb-3">Infrastructure, earthworks, structures and site development.</p>
                <a className="small text-primary text-decoration-none" href="/civil-engineering">Discover more →</a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <i className="bi bi-lightning-charge display-5 text-warning mb-3"></i>
                <h5 className="mb-2">M&E Engineering</h5>
                <p className="text-muted small mb-3">Power, HVAC, plumbing, fire protection and ELV systems.</p>
                <a className="small text-primary text-decoration-none" href="/mechanical-electrical-engineering">Discover more →</a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <i className="bi bi-hdd-network display-5 text-info mb-3"></i>
                <h5 className="mb-2">ICT Engineering</h5>
                <p className="text-muted small mb-3">Network, telecom, security and data infrastructure.</p>
                <a className="small text-primary text-decoration-none" href="/ict-engineering">Discover more →</a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <i className="bi bi-clipboard-check display-5 text-success mb-3"></i>
                <h5 className="mb-2">Project Management</h5>
                <p className="text-muted small mb-3">Planning, cost, quality and risk management for delivery.</p>
                <a className="small text-primary text-decoration-none" href="/project-management-consultancy">Discover more →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
