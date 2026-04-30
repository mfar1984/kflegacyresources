import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mechanical & Electrical Engineering Services",
  description: "Expert M&E engineering solutions from ANSAR TECHNOLOGIES SDN. BHD. - HVAC, electrical systems, fire protection, plumbing, and building services.",
};

export default function MechanicalElectricalPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/mne.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Mechanical & Electrical Engineering</h1>
              <p className="text-justify">Powering buildings with intelligent M&E solutions. We deliver comprehensive mechanical and electrical engineering services that ensure optimal performance, energy efficiency, and occupant comfort.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Our Solutions</a>
                <a href="/contact" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>Request Quote</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/mne-hero.png" className="img-fluid animated" alt="Mechanical & Electrical Engineering" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="container">
          <div className="row text-center text-white">
            <div className="col-lg-3 col-6 mb-3" data-aos="fade-up" data-aos-delay="0">
              <div className="p-3">
                <i className="bi bi-lightning-charge display-3 mb-2"></i>
                <h3 className="fw-bold mb-1">500+</h3>
                <p className="mb-0">Systems Installed</p>
              </div>
            </div>
            <div className="col-lg-3 col-6 mb-3" data-aos="fade-up" data-aos-delay="100">
              <div className="p-3">
                <i className="bi bi-building display-3 mb-2"></i>
                <h3 className="fw-bold mb-1">200+</h3>
                <p className="mb-0">Buildings Serviced</p>
              </div>
            </div>
            <div className="col-lg-3 col-6 mb-3" data-aos="fade-up" data-aos-delay="200">
              <div className="p-3">
                <i className="bi bi-people display-3 mb-2"></i>
                <h3 className="fw-bold mb-1">50+</h3>
                <p className="mb-0">Expert Engineers</p>
              </div>
            </div>
            <div className="col-lg-3 col-6 mb-3" data-aos="fade-up" data-aos-delay="300">
              <div className="p-3">
                <i className="bi bi-award display-3 mb-2"></i>
                <h3 className="fw-bold mb-1">15+</h3>
                <p className="mb-0">Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section id="services" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>M&E Engineering Services</h2>
          <p>Comprehensive building services engineering solutions</p>
        </div>
        <div className="container">
          <div className="row g-4">
            {/* HVAC Systems */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card border-0 shadow h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-3 bg-primary bg-opacity-10 p-3 me-3">
                      <i className="bi bi-wind display-5 text-primary"></i>
                    </div>
                    <h4 className="mb-0">HVAC Systems</h4>
                  </div>
                  <p className="text-muted mb-3">Heating, Ventilation & Air Conditioning solutions for optimal indoor climate control.</p>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Central air conditioning design & installation</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>VRF/VRV system implementation</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Chiller plant design & optimization</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Ventilation & exhaust systems</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-primary me-2"></i>Indoor air quality management</li>
                    <li><i className="bi bi-check-circle text-primary me-2"></i>Energy-efficient cooling solutions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Electrical Systems */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-3 bg-warning bg-opacity-10 p-3 me-3">
                      <i className="bi bi-lightning-charge display-5 text-warning"></i>
                    </div>
                    <h4 className="mb-0">Electrical Systems</h4>
                  </div>
                  <p className="text-muted mb-3">Complete electrical engineering services from power distribution to lighting design.</p>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><i className="bi bi-check-circle text-warning me-2"></i>Power distribution system design</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-warning me-2"></i>LV/HV switchgear installation</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-warning me-2"></i>Lighting design & controls</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-warning me-2"></i>Emergency power systems & UPS</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-warning me-2"></i>Cable management systems</li>
                    <li><i className="bi bi-check-circle text-warning me-2"></i>Earthing & lightning protection</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Fire Protection */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-3 bg-danger bg-opacity-10 p-3 me-3">
                      <i className="bi bi-fire display-5 text-danger"></i>
                    </div>
                    <h4 className="mb-0">Fire Protection Systems</h4>
                  </div>
                  <p className="text-muted mb-3">Advanced fire detection, alarm, and suppression systems for life safety.</p>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Fire alarm & detection systems</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Sprinkler system design</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Fire suppression systems</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Smoke control & extraction</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-danger me-2"></i>Emergency evacuation systems</li>
                    <li><i className="bi bi-check-circle text-danger me-2"></i>Fire fighting equipment</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Plumbing & Sanitary */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
              <div className="card border-0 shadow h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-3 bg-info bg-opacity-10 p-3 me-3">
                      <i className="bi bi-droplet display-5 text-info"></i>
                    </div>
                    <h4 className="mb-0">Plumbing & Sanitary</h4>
                  </div>
                  <p className="text-muted mb-3">Efficient water supply and drainage systems for modern buildings.</p>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><i className="bi bi-check-circle text-info me-2"></i>Water supply & distribution</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-info me-2"></i>Drainage & sewerage systems</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-info me-2"></i>Hot water systems</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-info me-2"></i>Rainwater harvesting</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-info me-2"></i>Sanitary & bathroom fittings</li>
                    <li><i className="bi bi-check-circle text-info me-2"></i>Pump systems design</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Services */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Specialized M&E Solutions</h2>
          <p className="text-white-50">Advanced systems for modern building requirements</p>
        </div>
        <div className="container">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            <div className="col" data-aos="zoom-in" data-aos-delay="0">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 h-100">
                <i className="bi bi-building-gear display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Building Automation</h5>
                <p className="text-white-50 small mb-0">BMS & smart building controls</p>
              </div>
            </div>
            <div className="col" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 h-100">
                <i className="bi bi-ev-station display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">EV Charging</h5>
                <p className="text-white-50 small mb-0">Electric vehicle infrastructure</p>
              </div>
            </div>
            <div className="col" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 h-100">
                <i className="bi bi-sun display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Solar Systems</h5>
                <p className="text-white-50 small mb-0">Renewable energy solutions</p>
              </div>
            </div>
            <div className="col" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 h-100">
                <i className="bi bi-water display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Water Treatment</h5>
                <p className="text-white-50 small mb-0">Filtration & purification</p>
              </div>
            </div>
            <div className="col" data-aos="zoom-in" data-aos-delay="0">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 h-100">
                <i className="bi bi-thermometer-half display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Energy Monitoring</h5>
                <p className="text-white-50 small mb-0">Real-time energy management</p>
              </div>
            </div>
            <div className="col" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 h-100">
                <i className="bi bi-shield-check display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Safety Systems</h5>
                <p className="text-white-50 small mb-0">Access control & security</p>
              </div>
            </div>
            <div className="col" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 h-100">
                <i className="bi bi-broadcast display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Communication</h5>
                <p className="text-white-50 small mb-0">PA & AV systems</p>
              </div>
            </div>
            <div className="col" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-3 h-100">
                <i className="bi bi-recycle display-4 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Sustainable Design</h5>
                <p className="text-white-50 small mb-0">Green building solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Served */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Industries We Serve</h2>
          <p>Delivering M&E excellence across diverse sectors</p>
        </div>
        <div className="container">
          <div className="row g-3">
            <div className="col-md-4 col-6" data-aos="fade-up" data-aos-delay="0">
              <div className="p-3 border rounded-3 text-center h-100">
                <i className="bi bi-hospital display-6 text-primary mb-2"></i>
                <h6 className="mb-0">Healthcare</h6>
              </div>
            </div>
            <div className="col-md-4 col-6" data-aos="fade-up" data-aos-delay="50">
              <div className="p-3 border rounded-3 text-center h-100">
                <i className="bi bi-buildings display-6 text-primary mb-2"></i>
                <h6 className="mb-0">Commercial</h6>
              </div>
            </div>
            <div className="col-md-4 col-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-3 border rounded-3 text-center h-100">
                <i className="bi bi-house-door display-6 text-primary mb-2"></i>
                <h6 className="mb-0">Residential</h6>
              </div>
            </div>
            <div className="col-md-4 col-6" data-aos="fade-up" data-aos-delay="150">
              <div className="p-3 border rounded-3 text-center h-100">
                <i className="bi bi-bank display-6 text-primary mb-2"></i>
                <h6 className="mb-0">Institutional</h6>
              </div>
            </div>
            <div className="col-md-4 col-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-3 border rounded-3 text-center h-100">
                <i className="bi bi-basket display-6 text-primary mb-2"></i>
                <h6 className="mb-0">Retail</h6>
              </div>
            </div>
            <div className="col-md-4 col-6" data-aos="fade-up" data-aos-delay="250">
              <div className="p-3 border rounded-3 text-center h-100">
                <i className="bi bi-gear-wide-connected display-6 text-primary mb-2"></i>
                <h6 className="mb-0">Industrial</h6>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section dark-background">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8" data-aos="fade-right">
              <h2 className="text-white mb-3">Ready to Optimize Your Building Systems?</h2>
              <p className="text-white-50 mb-4 mb-lg-0">Our M&E engineering experts are ready to design and implement efficient, reliable solutions for your project. Get in touch today for a comprehensive consultation.</p>
            </div>
            <div className="col-lg-4 text-lg-end" data-aos="fade-left">
              <Link href="/contact" className="btn btn-light btn-lg">
                <i className="bi bi-chat-dots me-2"></i>Contact Our Experts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

