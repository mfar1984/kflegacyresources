export default function HomeAccreditations() {
  return (
    <section className="section light-background">
      <div className="container section-title" data-aos="fade-up">
        <h2>Accreditations & Compliance</h2>
        <p>Registered and qualified to deliver public and private sector works</p>
      </div>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-6" data-aos="fade-up" data-aos-delay="0">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="mb-3">Registrations</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i> Malaysia Ministry of Finance (MOF)</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i> CIDB Malaysia</li>
                  <li className="mb-2"><i className="bi bi-check text-success me-2"></i> Bumiputera Status</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="mb-3">Standards</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><i className="bi bi-shield-check text-primary me-2"></i> ISO-aligned quality management practices</li>
                  <li className="mb-2"><i className="bi bi-shield-check text-primary me-2"></i> Workplace safety and HSE procedures</li>
                  <li className="mb-2"><i className="bi bi-shield-check text-primary me-2"></i> Government procurement compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
