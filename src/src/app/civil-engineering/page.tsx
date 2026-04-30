import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Civil Engineering Services",
  description: "Professional civil engineering services from ANSAR TECHNOLOGIES SDN. BHD. - Infrastructure development, structural design, project management, and construction solutions.",
};

export default function CivilEngineeringPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/civil-engineering.png)',
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
              <h1 className="with-separator">Civil Engineering</h1>
              <p className="text-justify">Building the foundation for tomorrow&apos;s infrastructure. Our comprehensive civil engineering services deliver innovative, sustainable, and cost-effective solutions for government and private sector projects across Malaysia.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Our Services</a>
                <a href="/contact" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>Get Quote</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/civil-engineering-hero.png" className="img-fluid animated" alt="Civil Engineering Services" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Civil Engineering Excellence</h2>
          <p>Transforming visions into structural realities</p>
        </div>
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6" data-aos="fade-right" data-aos-delay="100">
              <h3 className="mb-4">Comprehensive Infrastructure Solutions</h3>
              <div className="text-justify">
                <p>ANSAR TECHNOLOGIES delivers professional civil engineering services that encompass the planning, design, construction, and maintenance of infrastructure projects. Our team of experienced engineers and project managers brings technical expertise and innovative approaches to every project.</p>
                <p>From initial concept through to completion, we provide integrated solutions that meet the highest standards of quality, safety, and sustainability. Our civil engineering division has successfully delivered numerous projects across government and private sectors throughout Malaysia.</p>
                <p className="mb-0">With a commitment to excellence and client satisfaction, we leverage the latest technology and best practices to ensure projects are completed on time, within budget, and to exacting specifications.</p>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="200">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 bg-white rounded-3 shadow-sm text-center h-100">
                    <div className="text-primary display-4 mb-2"><i className="bi bi-diagram-3"></i></div>
                    <h5 className="h6 mb-1">Expert Team</h5>
                    <p className="small text-muted mb-0">Qualified civil engineers</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-white rounded-3 shadow-sm text-center h-100">
                    <div className="text-primary display-4 mb-2"><i className="bi bi-clipboard-check"></i></div>
                    <h5 className="h6 mb-1">Quality Assured</h5>
                    <p className="small text-muted mb-0">ISO standards compliance</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-white rounded-3 shadow-sm text-center h-100">
                    <div className="text-primary display-4 mb-2"><i className="bi bi-award"></i></div>
                    <h5 className="h6 mb-1">CIDB Registered</h5>
                    <p className="small text-muted mb-0">Certified contractor</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-white rounded-3 shadow-sm text-center h-100">
                    <div className="text-primary display-4 mb-2"><i className="bi bi-graph-up-arrow"></i></div>
                    <h5 className="h6 mb-1">Proven Track Record</h5>
                    <p className="small text-muted mb-0">100+ projects delivered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Our Civil Engineering Services</h2>
          <p className="text-white-50">Comprehensive solutions for your infrastructure needs</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-building display-6 text-white"></i>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Structural Design & Analysis</h5>
                    </div>
                  </div>
                  <ul className="text-white-50 small mb-0">
                    <li>Building structural design</li>
                    <li>Bridge and flyover engineering</li>
                    <li>Foundation design and analysis</li>
                    <li>Seismic design evaluation</li>
                    <li>Structural health monitoring</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-signpost-split display-6 text-white"></i>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Infrastructure Development</h5>
                    </div>
                  </div>
                  <ul className="text-white-50 small mb-0">
                    <li>Road and highway construction</li>
                    <li>Drainage systems design</li>
                    <li>Water supply infrastructure</li>
                    <li>Sewerage system planning</li>
                    <li>Earthwork and site development</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-geo-alt display-6 text-white"></i>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Site Investigation & Survey</h5>
                    </div>
                  </div>
                  <ul className="text-white-50 small mb-0">
                    <li>Geotechnical investigation</li>
                    <li>Topographic surveying</li>
                    <li>Soil testing and analysis</li>
                    <li>Land surveying services</li>
                    <li>As-built survey documentation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-clipboard-data display-6 text-white"></i>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Project Management</h5>
                    </div>
                  </div>
                  <ul className="text-white-50 small mb-0">
                    <li>Project planning and scheduling</li>
                    <li>Construction supervision</li>
                    <li>Quality control and assurance</li>
                    <li>Contract administration</li>
                    <li>Cost estimation and control</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-droplet display-6 text-white"></i>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Hydraulic Engineering</h5>
                    </div>
                  </div>
                  <ul className="text-white-50 small mb-0">
                    <li>Flood mitigation design</li>
                    <li>Stormwater management</li>
                    <li>River engineering solutions</li>
                    <li>Coastal protection works</li>
                    <li>Erosion control systems</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-tools display-6 text-white"></i>
                    </div>
                    <div>
                      <h5 className="text-white mb-2">Construction Works</h5>
                    </div>
                  </div>
                  <ul className="text-white-50 small mb-0">
                    <li>Building construction</li>
                    <li>Renovation and retrofitting</li>
                    <li>Infrastructure rehabilitation</li>
                    <li>Site preparation works</li>
                    <li>Concrete and steel works</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Types Section */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Project Types We Handle</h2>
          <p>Diverse expertise across multiple sectors</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="0">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-bank2 display-3 text-primary mb-3"></i>
                  <h5 className="mb-3">Government Projects</h5>
                  <p className="small text-muted mb-0">Public infrastructure, government buildings, civic facilities</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-building display-3 text-primary mb-3"></i>
                  <h5 className="mb-3">Commercial Buildings</h5>
                  <p className="small text-muted mb-0">Office towers, shopping complexes, hotels, retail spaces</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-house display-3 text-primary mb-3"></i>
                  <h5 className="mb-3">Residential Projects</h5>
                  <p className="small text-muted mb-0">Housing estates, condominiums, landed properties</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-hospital display-3 text-primary mb-3"></i>
                  <h5 className="mb-3">Institutional</h5>
                  <p className="small text-muted mb-0">Schools, hospitals, universities, research facilities</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="0">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-gear-wide-connected display-3 text-primary mb-3"></i>
                  <h5 className="mb-3">Industrial Facilities</h5>
                  <p className="small text-muted mb-0">Factories, warehouses, manufacturing plants</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-sign-turn-right display-3 text-primary mb-3"></i>
                  <h5 className="mb-3">Transportation</h5>
                  <p className="small text-muted mb-0">Roads, bridges, tunnels, railway infrastructure</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-water display-3 text-primary mb-3"></i>
                  <h5 className="mb-3">Water Resources</h5>
                  <p className="small text-muted mb-0">Dams, reservoirs, water treatment plants</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-tree display-3 text-primary mb-3"></i>
                  <h5 className="mb-3">Environmental</h5>
                  <p className="small text-muted mb-0">Waste management, landfills, environmental remediation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Why Choose Our Civil Engineering Services</h2>
          <p className="text-white-50">Excellence in every aspect of project delivery</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-right" data-aos-delay="100">
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex align-items-start p-3 bg-white bg-opacity-10 rounded-3">
                    <i className="bi bi-check-circle-fill text-accent fs-4 me-3 mt-1"></i>
                    <div>
                      <h5 className="text-white mb-2">Experienced Engineering Team</h5>
                      <p className="text-white-50 small mb-0">Our qualified civil engineers bring years of experience and technical expertise to every project.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start p-3 bg-white bg-opacity-10 rounded-3">
                    <i className="bi bi-check-circle-fill text-accent fs-4 me-3 mt-1"></i>
                    <div>
                      <h5 className="text-white mb-2">Advanced Technology & Tools</h5>
                      <p className="text-white-50 small mb-0">We utilize the latest CAD software, BIM technology, and engineering tools for precise design and planning.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start p-3 bg-white bg-opacity-10 rounded-3">
                    <i className="bi bi-check-circle-fill text-accent fs-4 me-3 mt-1"></i>
                    <div>
                      <h5 className="text-white mb-2">Quality Assurance</h5>
                      <p className="text-white-50 small mb-0">Rigorous quality control processes ensure all work meets or exceeds industry standards and regulations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="200">
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex align-items-start p-3 bg-white bg-opacity-10 rounded-3">
                    <i className="bi bi-check-circle-fill text-accent fs-4 me-3 mt-1"></i>
                    <div>
                      <h5 className="text-white mb-2">Cost-Effective Solutions</h5>
                      <p className="text-white-50 small mb-0">We optimize designs and construction methods to deliver maximum value without compromising quality.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start p-3 bg-white bg-opacity-10 rounded-3">
                    <i className="bi bi-check-circle-fill text-accent fs-4 me-3 mt-1"></i>
                    <div>
                      <h5 className="text-white mb-2">Timely Project Delivery</h5>
                      <p className="text-white-50 small mb-0">Efficient project management ensures completion within scheduled timelines and budget constraints.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start p-3 bg-white bg-opacity-10 rounded-3">
                    <i className="bi bi-check-circle-fill text-accent fs-4 me-3 mt-1"></i>
                    <div>
                      <h5 className="text-white mb-2">Sustainable Engineering</h5>
                      <p className="text-white-50 small mb-0">We incorporate sustainable practices and green engineering principles in our designs and construction.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section light-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="zoom-in">
              <div className="p-5 rounded-3 shadow-lg" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none'}}>
                <h2 className="mb-4" style={{color: '#ffffff'}}>Ready to Start Your Civil Engineering Project?</h2>
                <p className="mb-4" style={{color: '#ffffff'}}>Let our experienced team transform your vision into reality. Contact us today for a consultation and discover how we can help bring your infrastructure project to life.</p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link href="/contact" className="btn btn-light btn-lg">
                    <i className="bi bi-telephone me-2"></i>Contact Us
                  </Link>
                  <Link href="/resources/projects" className="btn btn-outline-light btn-lg">
                    <i className="bi bi-folder me-2"></i>View Projects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

