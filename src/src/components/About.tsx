"use client";

export default function About() {
  return (
    <section id="about" className="about section about-animated">
      <span className="float float-1"></span>
      <span className="float float-2"></span>
      <span className="float float-3"></span>
      <div className="container section-title" data-aos="fade-up">
        <h2>About Us</h2>
      </div>

      <div className="container">
        <div className="row gy-4 align-items-stretch">
          {/* Who We Are */}
          <div className="col-lg-7" data-aos="fade-up" data-aos-delay="100">
            <h3 className="mb-3">Who We Are</h3>
            <div className="text-justify">
              <p><strong>ANSAR TECHNOLOGIES SDN. BHD.</strong> is a leading engineering solutions provider specializing in Civil Engineering, Mechanical & Electrical Engineering, and ICT Engineering services.</p>
              <p>We are committed to delivering innovative and reliable engineering solutions that empower businesses and organizations to achieve their goals. Our team of experienced professionals works closely with clients to understand their unique challenges and provide customized solutions that drive efficiency and growth.</p>
              <p>From infrastructure design and construction to mechanical and electrical systems and ICT implementations, we offer end-to-end engineering services that ensure your projects are delivered with excellence, on time, and within budget.</p>
              <p className="mb-0">At ANSAR TECHNOLOGIES, we believe in building long-term partnerships with our clients. We provide ongoing support and consultation to ensure that your engineering investments continue to deliver value as your projects evolve.</p>
            </div>
          </div>

          {/* At a Glance */}
          <div className="col-lg-5" data-aos="fade-up" data-aos-delay="150">
            <div className="h-100 p-4 bg-body-tertiary rounded-3 border">
              <h4 className="h6 text-uppercase text-secondary mb-3">At a Glance</h4>
              <ul className="list-unstyled mb-0">
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>Civil engineering design & construction</span></li>
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>Mechanical & electrical systems</span></li>
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>ICT infrastructure & network solutions</span></li>
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>Project management & consultation</span></li>
                <li className="d-flex"><i className="bi bi-check2-circle text-primary me-2"></i><span>Client-focused partnerships</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sub-features */}
        <div className="row row-cols-1 row-cols-md-3 g-4 mt-2" data-aos="fade-up" data-aos-delay="200">
          <div className="col">
            <div className="p-4 h-100 bg-white rounded-3 border shadow-sm feature-card">
              <div className="d-flex align-items-center mb-2"><i className="bi bi-building text-primary fs-4 me-2"></i><h5 className="h6 mb-0">Quality Engineering</h5></div>
              <p className="mb-0 text-justify">Professional engineering services with attention to detail and quality standards.</p>
            </div>
          </div>
          <div className="col">
            <div className="p-4 h-100 bg-white rounded-3 border shadow-sm feature-card">
              <div className="d-flex align-items-center mb-2"><i className="bi bi-tools text-primary fs-4 me-2"></i><h5 className="h6 mb-0">End-to-End Solutions</h5></div>
              <p className="mb-0 text-justify">Complete project lifecycle management from design to implementation.</p>
            </div>
          </div>
          <div className="col">
            <div className="p-4 h-100 bg-white rounded-3 border shadow-sm feature-card">
              <div className="d-flex align-items-center mb-2"><i className="bi bi-people text-primary fs-4 me-2"></i><h5 className="h6 mb-0">Expert Team</h5></div>
              <p className="mb-0 text-justify">Experienced engineers dedicated to delivering excellence in every project.</p>
            </div>
          </div>
        </div>

        <div className="row text-center mt-4" data-aos="fade-up" data-aos-delay="250">
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary counter" data-target="15">15+</div><div className="small text-secondary">Years Experience</div></div>
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary counter" data-target="100">100+</div><div className="small text-secondary">Projects Delivered</div></div>
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary counter" data-target="4">4</div><div className="small text-secondary">Core Services</div></div>
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary">100%</div><div className="small text-secondary">Client Satisfaction</div></div>
        </div>
      </div>
    </section>
  );
}

