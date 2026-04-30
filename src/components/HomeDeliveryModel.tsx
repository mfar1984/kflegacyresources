export default function HomeDeliveryModel() {
  return (
    <section className="section dark-background">
      <div className="container section-title" data-aos="fade-up">
        <h2 className="text-white">Delivery Model</h2>
        <p className="text-white-50">Clear stages, controlled risks, compliant handover</p>
      </div>
      <div className="container">
        <div className="row g-4">
          {[
            { n: 1, title: 'Consult', desc: 'Requirements, site study, stakeholder alignment' },
            { n: 2, title: 'Design', desc: 'Engineering design, compliance, value engineering' },
            { n: 3, title: 'Build', desc: 'Procurement, construction, installation, testing' },
            { n: 4, title: 'Operate', desc: 'Commissioning, maintenance, performance reporting' },
          ].map((s, i) => (
            <div className="col-md-6 col-lg-3" data-aos="zoom-in" data-aos-delay={i * 100} key={s.n}>
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4 text-center">
                  <div className="rounded-circle bg-accent d-inline-flex align-items-center justify-content-center mb-3" style={{width: 56, height: 56}}>
                    <strong className="text-white">{s.n}</strong>
                  </div>
                  <h5 className="text-white mb-2">{s.title}</h5>
                  <p className="text-white-50 small mb-0">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
