import Link from "next/link";

export default function Services() {
  return (
    <section id="services" className="services section light-background services-animated">
      <div className="container section-title" data-aos="fade-up">
        <h2>Services</h2>
        <p>We design value into profit by developing solutions to your problems!</p>
      </div>
      <div className="container">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-5 g-4">
          <div className="col d-flex" data-aos="fade-up" data-aos-delay="100">
            <div className="service-item position-relative w-100 text-center service-card">
              <div className="icon mx-auto"><i className="bi bi-upc-scan"></i></div>
              <h4><Link href="/barcode-rfid" className="stretched-link">Barcode &amp; RFID</Link></h4>
              <p>Auto-ID solutions for tracking and operations visibility.</p>
            </div>
          </div>
          <div className="col d-flex" data-aos="fade-up" data-aos-delay="150">
            <div className="service-item position-relative w-100 text-center service-card">
              <div className="icon mx-auto"><i className="bi bi-diagram-3"></i></div>
              <h4><Link href="/network" className="stretched-link">Network</Link></h4>
              <p>Design, bandwidth, infrastructure setup and management.</p>
            </div>
          </div>
          <div className="col d-flex" data-aos="fade-up" data-aos-delay="200">
            <div className="service-item position-relative w-100 text-center service-card">
              <div className="icon mx-auto"><i className="bi bi-shield-lock"></i></div>
              <h4><Link href="/security" className="stretched-link">Security</Link></h4>
              <p>Network security, SPA and surveillance solutions.</p>
            </div>
          </div>
          <div className="col d-flex" data-aos="fade-up" data-aos-delay="250">
            <div className="service-item position-relative w-100 text-center service-card">
              <div className="icon mx-auto"><i className="bi bi-hdd-stack"></i></div>
              <h4><Link href="/system-storage" className="stretched-link">System &amp; Storage</Link></h4>
              <p>Backup/DR, desktop, SAN/NAS, virtualization, OS solutions.</p>
            </div>
          </div>
          <div className="col d-flex" data-aos="fade-up" data-aos-delay="300">
            <div className="service-item position-relative w-100 text-center service-card">
              <div className="icon mx-auto"><i className="bi bi-briefcase"></i></div>
              <h4><Link href="/other-services" className="stretched-link">Other Services</Link></h4>
              <p>CAR rental, IT advisory, outsourcing, and programming.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


