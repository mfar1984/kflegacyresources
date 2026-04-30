import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about ANSAR TECHNOLOGIES SDN. BHD. - A leading telecommunications and IT company based in Malaysia, specializing in comprehensive engineering solutions.",
};

export default function AboutUsPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/aboutus.png)',
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
              <h1 className="with-separator">About Us</h1>
              <p className="text-justify">Discover our journey, values, and commitment to delivering excellence in telecommunications and IT solutions across Malaysia and beyond.</p>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/aboutus-hero.png" className="img-fluid animated" alt="About ANSAR TECHNOLOGIES" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about section">
        <div className="container section-title" data-aos="fade-up">
          <h2>About Us</h2>
        </div>

        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-12" data-aos="fade-up" data-aos-delay="100">
              <div className="text-justify">
                <p><strong>ANSAR TECHNOLOGIES SDN. BHD.</strong> is a telecommunications and IT company based in Klang Valley, Malaysia. We specialize in providing comprehensive telecommunication and IT solutions covering full-service technologies including wired and wireless systems.</p>
                
                <p>We offer a complete range of telecommunications and ICT products, services, maintenance, solutions, consultancy, and human resources to clients in the telecommunication and ICT/Security industry, primarily in Malaysia and across the globe. Our expertise also extends to general trading business operations.</p>
                
                <p>Registered with the Malaysia Commissioner of Companies on 14th April 2011 and the Malaysia Ministry of Finance on 29th September 2011, we hold Bumiputera status and are registered with CIDB, demonstrating our credibility and commitment to industry standards.</p>
                
                <p className="mb-0">Our mission is to become a key player and well-recognized company in this industry. We achieve this by working closely with our clients, providing excellent services, and actively listening to their needs. Through this approach, we deliver enhanced value and build lasting partnerships with our clients.</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row text-center mt-5" data-aos="fade-up" data-aos-delay="200">
            <div className="col-6 col-md-3 mb-3">
              <div className="fw-bold fs-3 text-primary">2011</div>
              <div className="small text-secondary">Established</div>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <div className="fw-bold fs-3 text-primary">100+</div>
              <div className="small text-secondary">Projects Completed</div>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <div className="fw-bold fs-3 text-primary">CIDB</div>
              <div className="small text-secondary">Registered</div>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <div className="fw-bold fs-3 text-primary">Bumiputera</div>
              <div className="small text-secondary">Status Company</div>
            </div>
          </div>
        </div>
      </section>

      {/* Objective Section */}
      <section id="objective" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Our Objective</h2>
          <p>Striving for excellence across multiple sectors</p>
        </div>
        <div className="container">
          <div className="row gy-4 align-items-center mb-4">
            <div className="col-lg-10 mx-auto text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="p-5 rounded-3 shadow-lg" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none'}}>
                <i className="bi bi-bullseye display-3 text-white mb-3 d-block"></i>
                <p className="text-white mb-0 fs-5 fw-light" style={{color: '#ffffff'}}>To be among the best companies providing comprehensive engineering and consultancy services to both government and private sectors.</p>
              </div>
            </div>
          </div>
          
          <div className="row g-4 mt-2">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 text-center border-top border-primary border-4">
                <div className="mb-3">
                  <i className="bi bi-cart display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">General Trading</h5>
                <p className="text-muted small mb-0">Supplying quality products and solutions for various industry needs.</p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 text-center border-top border-primary border-4">
                <div className="mb-3">
                  <i className="bi bi-broadcast-pin display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Telecommunication</h5>
                <p className="text-muted small mb-0">Expert contracting services for advanced communication infrastructure.</p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 text-center border-top border-primary border-4">
                <div className="mb-3">
                  <i className="bi bi-pc-display-horizontal display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">ICT Solutions</h5>
                <p className="text-muted small mb-0">Innovative technology solutions for modern business challenges.</p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 text-center border-top border-primary border-4">
                <div className="mb-3">
                  <i className="bi bi-shield-lock display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Security Systems</h5>
                <p className="text-muted small mb-0">Comprehensive security solutions to protect your assets and data.</p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 text-center border-top border-primary border-4">
                <div className="mb-3">
                  <i className="bi bi-kanban display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Project Consultancy</h5>
                <p className="text-muted small mb-0">Expert guidance and management for successful project delivery.</p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 text-center border-top border-primary border-4">
                <div className="mb-3">
                  <i className="bi bi-people display-4 text-primary"></i>
                </div>
                <h5 className="mb-3">Government & Private</h5>
                <p className="text-muted small mb-0">Serving both public and private sectors with equal excellence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="section dark-background mission-animated">
        <i className="bi bi-stars mission-float mission-float-1"></i>
        <i className="bi bi-cpu mission-float mission-float-2"></i>
        <i className="bi bi-diagram-3 mission-float mission-float-3"></i>
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Our Mission</h2>
          <p className="text-white-50">Your trusted one-stop engineering solutions provider</p>
        </div>
        <div className="container">
          <div className="row gy-4 align-items-center mb-5" data-aos="fade-up" data-aos-delay="100">
            <div className="col-lg-10 mx-auto text-center">
              <div className="p-5 rounded-3 bg-white bg-opacity-10 shadow-lg">
                <i className="bi bi-rocket-takeoff display-2 text-accent mb-4 d-block"></i>
                <h4 className="text-white mb-4 fw-light">One-Stop Centre & Reference Point</h4>
                <p className="text-white fs-5 mb-0 fw-light">To be a comprehensive one-stop centre and trusted reference point covering Telecommunication Engineering, ICT, Security, and Project Consultancy services.</p>
              </div>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-6 col-md-6" data-aos="zoom-in" data-aos-delay="0">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="d-flex align-items-start">
                  <div className="me-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-broadcast display-6 text-white"></i>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white mb-2">Telecommunication Engineering</h5>
                    <p className="text-white-50 small mb-0">Providing end-to-end telecommunication infrastructure, installation, and maintenance services with cutting-edge technology.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="d-flex align-items-start">
                  <div className="me-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-hdd-network display-6 text-white"></i>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white mb-2">ICT Solutions</h5>
                    <p className="text-white-50 small mb-0">Comprehensive IT and communication solutions including network infrastructure, systems integration, and digital transformation.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="d-flex align-items-start">
                  <div className="me-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-shield-check display-6 text-white"></i>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white mb-2">Security Systems</h5>
                    <p className="text-white-50 small mb-0">Advanced security solutions including surveillance, access control, and integrated security management systems.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <div className="d-flex align-items-start">
                  <div className="me-3">
                    <div className="rounded-circle bg-accent d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', minWidth: '60px'}}>
                      <i className="bi bi-clipboard-check display-6 text-white"></i>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white mb-2">Project Consultancy</h5>
                    <p className="text-white-50 small mb-0">Expert project management and consultancy services ensuring successful delivery from planning to completion.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="section light-background vision-animated">
        <div className="container section-title" data-aos="fade-up">
          <h2>Our Vision</h2>
          <p>Leading innovation and technology advancement nationwide</p>
        </div>
        <div className="container">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-10 mx-auto" data-aos="fade-up" data-aos-delay="100">
              <div className="text-justify">
                <p>To support government agencies in promoting Telecommunication, ICT, Security, and Project Consultancy services while enhancing technology penetration nationwide.</p>
                <p className="mb-0">To introduce and promote new technologies that drive innovation and progress across all sectors of Malaysian society and beyond.</p>
              </div>
            </div>
          </div>
          <div className="row row-cols-1 row-cols-md-3 g-3 mt-3" data-aos="fade-up" data-aos-delay="150">
            <div className="col d-flex">
              <div className="p-3 flex-fill rounded-3 vision-card bg-white border">
                <h5 className="h6 mb-1"><i className="bi bi-globe text-primary me-2"></i>Technology Leadership</h5>
                <p className="mb-0 text-muted">Leading the way in telecommunications and ICT advancement.</p>
              </div>
            </div>
            <div className="col d-flex">
              <div className="p-3 flex-fill rounded-3 vision-card bg-white border">
                <h5 className="h6 mb-1"><i className="bi bi-lightbulb text-primary me-2"></i>Innovation Drive</h5>
                <p className="mb-0 text-muted">Introducing cutting-edge solutions to the market.</p>
              </div>
            </div>
            <div className="col d-flex">
              <div className="p-3 flex-fill rounded-3 vision-card bg-white border">
                <h5 className="h6 mb-1"><i className="bi bi-people text-primary me-2"></i>Nationwide Impact</h5>
                <p className="mb-0 text-muted">Enhancing technology penetration across Malaysia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Section */}
      <section id="value" className="section dark-background value-animated">
        <i className="bi bi-award value-float value-float-1"></i>
        <i className="bi bi-lightbulb value-float value-float-2"></i>
        <i className="bi bi-people value-float value-float-3"></i>
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Our Values</h2>
          <p className="text-white-50">The principles that guide everything we do</p>
        </div>
        <div className="container">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-12" data-aos="fade-up" data-aos-delay="100">
              <div className="row row-cols-1 row-cols-md-2 g-3 align-items-stretch">
                <div className="col d-flex">
                  <div className="p-4 flex-fill bg-white bg-opacity-10 rounded-3 value-card">
                    <h5 className="h6 mb-2 text-white"><i className="bi bi-award text-accent me-2"></i>Integrity</h5>
                    <p className="mb-0 text-white-50 small">We conduct business with honesty, transparency, and the highest ethical standards.</p>
                  </div>
                </div>
                <div className="col d-flex">
                  <div className="p-4 flex-fill bg-white bg-opacity-10 rounded-3 value-card">
                    <h5 className="h6 mb-2 text-white"><i className="bi bi-stars text-accent me-2"></i>Excellence</h5>
                    <p className="mb-0 text-white-50 small">We are committed to delivering superior quality in every project and service we provide.</p>
                  </div>
                </div>
                <div className="col d-flex">
                  <div className="p-4 flex-fill bg-white bg-opacity-10 rounded-3 value-card">
                    <h5 className="h6 mb-2 text-white"><i className="bi bi-people text-accent me-2"></i>Client Partnership</h5>
                    <p className="mb-0 text-white-50 small">We build lasting relationships by understanding and prioritizing our clients&apos; needs.</p>
                  </div>
                </div>
                <div className="col d-flex">
                  <div className="p-4 flex-fill bg-white bg-opacity-10 rounded-3 value-card">
                    <h5 className="h6 mb-2 text-white"><i className="bi bi-lightbulb text-accent me-2"></i>Innovation</h5>
                    <p className="mb-0 text-white-50 small">We embrace new technologies and creative solutions to stay ahead of industry trends.</p>
                  </div>
                </div>
                <div className="col d-flex">
                  <div className="p-4 flex-fill bg-white bg-opacity-10 rounded-3 value-card">
                    <h5 className="h6 mb-2 text-white"><i className="bi bi-hand-thumbs-up text-accent me-2"></i>Reliability</h5>
                    <p className="mb-0 text-white-50 small">We deliver on our promises with consistent, dependable service and support.</p>
                  </div>
                </div>
                <div className="col d-flex">
                  <div className="p-4 flex-fill bg-white bg-opacity-10 rounded-3 value-card">
                    <h5 className="h6 mb-2 text-white"><i className="bi bi-graph-up-arrow text-accent me-2"></i>Continuous Improvement</h5>
                    <p className="mb-0 text-white-50 small">We constantly evolve and enhance our capabilities to serve our clients better.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

