export default function HomeOverview() {
  return (
    <section className="section light-background">
      <div className="container section-title" data-aos="fade-up">
        <h2>ANSAR TECHNOLOGIES</h2>
        <p>Trusted Malaysian engineering partner for government and private sectors</p>
      </div>
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-7" data-aos="fade-right">
            <h3 className="mb-3">Integrated Engineering, Built For Delivery</h3>
            <p className="text-muted mb-3">
              We plan, design, build and maintain critical infrastructure and technology systems across
              Malaysia. Our teams combine civil, mechanical & electrical, ICT and project management capabilities
              to deliver safe, compliant and cost-effective outcomes.
            </p>
            <ul className="list-unstyled mb-0">
              <li className="mb-2 d-flex align-items-start"><i className="bi bi-check-circle text-success me-2"></i> Registered Bumiputera company with MOF, CIDB, Suruhanjaya Tenaga and SPAN</li>
              <li className="mb-2 d-flex align-items-start"><i className="bi bi-check-circle text-success me-2"></i> Government and enterprise delivery experience</li>
              <li className="mb-2 d-flex align-items-start"><i className="bi bi-check-circle text-success me-2"></i> Multi-disciplinary in-house engineers and partners</li>
              <li className="d-flex align-items-start"><i className="bi bi-check-circle text-success me-2"></i> Quality, safety and compliance at every stage</li>
            </ul>
            <div className="mt-4">
              <a href="/about-us" className="btn btn-primary me-2"><i className="bi bi-info-circle me-2"></i>About Us</a>
              <a href="/organization" className="btn btn-outline-primary"><i className="bi bi-diagram-3 me-2"></i>Organization</a>
            </div>
          </div>
          <div className="col-lg-5" data-aos="fade-left">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="mb-3">Quick Facts</h5>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center h-100">
                      <div className="fw-bold">2011</div>
                      <div className="text-muted small">Incorporated</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center h-100">
                      <div className="fw-bold">14+ Years</div>
                      <div className="text-muted small">Industry Experience</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center h-100">
                      <div className="fw-bold">150+</div>
                      <div className="text-muted small">Projects Delivered</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 text-center h-100">
                      <div className="fw-bold">MY</div>
                      <div className="text-muted small">Nationwide</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
