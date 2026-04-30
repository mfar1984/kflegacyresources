import Link from "next/link";

export default function Services() {
  return (
    <section id="services" className="services section light-background services-animated">
      <div className="container section-title" data-aos="fade-up">
        <h2>Services</h2>
        <p>Comprehensive engineering solutions tailored to your project needs</p>
      </div>
      <div className="container">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
          <div className="col d-flex" data-aos="fade-up" data-aos-delay="100">
            <div className="service-item position-relative w-100 text-center service-card">
              <div className="icon mx-auto"><i className="bi bi-building"></i></div>
              <h4><Link href="/civil-engineering" className="stretched-link">Civil Engineering</Link></h4>
              <p>Infrastructure design, construction management, and structural engineering solutions.</p>
            </div>
          </div>
          <div className="col d-flex" data-aos="fade-up" data-aos-delay="150">
            <div className="service-item position-relative w-100 text-center service-card">
              <div className="icon mx-auto"><i className="bi bi-lightning-charge"></i></div>
              <h4><Link href="/mechanical-electrical-engineering" className="stretched-link">Mechanical &amp; Electrical Engineering</Link></h4>
              <p>HVAC systems, power distribution, electrical installations, and energy management solutions.</p>
            </div>
          </div>
          <div className="col d-flex" data-aos="fade-up" data-aos-delay="200">
            <div className="service-item position-relative w-100 text-center service-card">
              <div className="icon mx-auto"><i className="bi bi-hdd-network"></i></div>
              <h4><Link href="/ict-engineering" className="stretched-link">ICT Engineering</Link></h4>
              <p>Network infrastructure, IT systems, and communication technology solutions.</p>
            </div>
          </div>
          <div className="col d-flex" data-aos="fade-up" data-aos-delay="250">
            <div className="service-item position-relative w-100 text-center service-card">
              <div className="icon mx-auto"><i className="bi bi-clipboard-check"></i></div>
              <h4><Link href="/project-management-consultancy" className="stretched-link">Project Management &amp; Consultancy</Link></h4>
              <p>Expert project planning, tender documentation, and comprehensive technical advisory services.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

