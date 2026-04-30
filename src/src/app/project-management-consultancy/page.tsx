import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Project Management & Consultancy Services",
  description: "Professional project management and engineering consultancy from ANSAR TECHNOLOGIES SDN. BHD. - Expert guidance from concept to completion for government and private sector projects.",
};

export default function ProjectManagementPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/pmc.png)',
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
              <h1 className="with-separator">Project Management & Consultancy</h1>
              <p className="text-justify">Expert guidance for successful project delivery. We provide comprehensive project management and engineering consultancy services that ensure your projects are completed on time, within budget, and to the highest quality standards.</p>
              <div className="d-flex">
                <a href="#services" className="btn-get-started">Our Services</a>
                <a href="/contact" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>Engage Us</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/pmc-hero.png" className="img-fluid animated" alt="Project Management & Consultancy" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="section light-background">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="mb-4">Why Choose Our PM & Consultancy Services</h2>
              <p className="text-muted mb-4">With over a decade of experience managing complex engineering projects across Malaysia, we bring technical expertise, industry knowledge, and proven methodologies to ensure your project success.</p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-center">
                    <h3 className="text-primary mb-0">100+</h3>
                    <p className="small mb-0">Projects Managed</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-success bg-opacity-10 rounded-3 text-center">
                    <h3 className="text-success mb-0">95%</h3>
                    <p className="small mb-0">On-Time Delivery</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-warning bg-opacity-10 rounded-3 text-center">
                    <h3 className="text-warning mb-0">RM 500M+</h3>
                    <p className="small mb-0">Project Value</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-info bg-opacity-10 rounded-3 text-center">
                    <h3 className="text-info mb-0">15+</h3>
                    <p className="small mb-0">Years Experience</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="p-4 bg-white rounded-3 shadow">
                <h5 className="mb-3">Our Approach</h5>
                <div className="d-flex align-items-start mb-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', minWidth: '40px'}}>
                    <strong>1</strong>
                  </div>
                  <div>
                    <h6 className="mb-1">Assess & Plan</h6>
                    <p className="small text-muted mb-0">Comprehensive project evaluation and strategic planning</p>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', minWidth: '40px'}}>
                    <strong>2</strong>
                  </div>
                  <div>
                    <h6 className="mb-1">Execute & Monitor</h6>
                    <p className="small text-muted mb-0">Disciplined execution with continuous tracking and control</p>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', minWidth: '40px'}}>
                    <strong>3</strong>
                  </div>
                  <div>
                    <h6 className="mb-1">Review & Optimize</h6>
                    <p className="small text-muted mb-0">Regular reviews and continuous improvement initiatives</p>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', minWidth: '40px'}}>
                    <strong>4</strong>
                  </div>
                  <div>
                    <h6 className="mb-1">Deliver & Close</h6>
                    <p className="small text-muted mb-0">Successful handover and project closure documentation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section id="services" className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Our Services</h2>
          <p className="text-white-50">Comprehensive project management and consultancy solutions</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <i className="bi bi-clipboard-data display-3 text-accent"></i>
                  </div>
                  <h4 className="text-white mb-3">Project Management</h4>
                  <ul className="text-white-50 mb-0">
                    <li className="mb-2">Project planning & scheduling</li>
                    <li className="mb-2">Resource allocation & management</li>
                    <li className="mb-2">Budget control & cost management</li>
                    <li className="mb-2">Risk assessment & mitigation</li>
                    <li className="mb-2">Quality assurance & control</li>
                    <li>Stakeholder management</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <i className="bi bi-pencil-square display-3 text-accent"></i>
                  </div>
                  <h4 className="text-white mb-3">Design Consultancy</h4>
                  <ul className="text-white-50 mb-0">
                    <li className="mb-2">Conceptual design development</li>
                    <li className="mb-2">Engineering design review</li>
                    <li className="mb-2">Value engineering studies</li>
                    <li className="mb-2">Technical specifications</li>
                    <li className="mb-2">Buildability assessment</li>
                    <li>Design coordination services</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <i className="bi bi-file-earmark-text display-3 text-accent"></i>
                  </div>
                  <h4 className="text-white mb-3">Tender & Procurement</h4>
                  <ul className="text-white-50 mb-0">
                    <li className="mb-2">Tender documentation preparation</li>
                    <li className="mb-2">Bill of quantities (BOQ)</li>
                    <li className="mb-2">Contractor prequalification</li>
                    <li className="mb-2">Bid evaluation & analysis</li>
                    <li className="mb-2">Contract negotiation support</li>
                    <li>Procurement strategy</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <i className="bi bi-building-check display-3 text-accent"></i>
                  </div>
                  <h4 className="text-white mb-3">Construction Supervision</h4>
                  <ul className="text-white-50 mb-0">
                    <li className="mb-2">Site supervision & inspection</li>
                    <li className="mb-2">Progress monitoring & reporting</li>
                    <li className="mb-2">Quality control testing</li>
                    <li className="mb-2">Safety compliance monitoring</li>
                    <li className="mb-2">Defect identification & rectification</li>
                    <li>As-built documentation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <i className="bi bi-calculator display-3 text-accent"></i>
                  </div>
                  <h4 className="text-white mb-3">Cost Consultancy</h4>
                  <ul className="text-white-50 mb-0">
                    <li className="mb-2">Cost estimation & budgeting</li>
                    <li className="mb-2">Life cycle cost analysis</li>
                    <li className="mb-2">Cash flow projection</li>
                    <li className="mb-2">Variation order assessment</li>
                    <li className="mb-2">Final account settlement</li>
                    <li>Cost-benefit analysis</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <i className="bi bi-gear-wide-connected display-3 text-accent"></i>
                  </div>
                  <h4 className="text-white mb-3">Commissioning Services</h4>
                  <ul className="text-white-50 mb-0">
                    <li className="mb-2">System testing & commissioning</li>
                    <li className="mb-2">Performance verification</li>
                    <li className="mb-2">Operational readiness</li>
                    <li className="mb-2">Training & handover</li>
                    <li className="mb-2">Defect liability period support</li>
                    <li>Facility management planning</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Life Cycle */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Full Project Life Cycle Management</h2>
          <p>Supporting your project from concept to completion</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="timeline">
                <div className="row g-4">
                  <div className="col-md-4" data-aos="fade-up" data-aos-delay="0">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4 text-center">
                        <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-lightbulb fs-4"></i>
                        </div>
                        <h5 className="mb-3">Initiation & Planning</h5>
                        <ul className="list-unstyled text-muted small text-start">
                          <li className="mb-2">• Feasibility studies</li>
                          <li className="mb-2">• Requirement analysis</li>
                          <li className="mb-2">• Scope definition</li>
                          <li>• Project charter</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4 text-center">
                        <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-pencil fs-4"></i>
                        </div>
                        <h5 className="mb-3">Design & Procurement</h5>
                        <ul className="list-unstyled text-muted small text-start">
                          <li className="mb-2">• Detailed design</li>
                          <li className="mb-2">• Tender documentation</li>
                          <li className="mb-2">• Contractor selection</li>
                          <li>• Contract award</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4 text-center">
                        <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-tools fs-4"></i>
                        </div>
                        <h5 className="mb-3">Execution & Control</h5>
                        <ul className="list-unstyled text-muted small text-start">
                          <li className="mb-2">• Construction management</li>
                          <li className="mb-2">• Progress monitoring</li>
                          <li className="mb-2">• Quality control</li>
                          <li>• Change management</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="0">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4 text-center">
                        <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-check-circle fs-4"></i>
                        </div>
                        <h5 className="mb-3">Testing & Commissioning</h5>
                        <ul className="list-unstyled text-muted small text-start">
                          <li className="mb-2">• System testing</li>
                          <li className="mb-2">• Performance verification</li>
                          <li className="mb-2">• User training</li>
                          <li>• Handover preparation</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4 text-center">
                        <div className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-box-arrow-up fs-4"></i>
                        </div>
                        <h5 className="mb-3">Handover & Close-Out</h5>
                        <ul className="list-unstyled text-muted small text-start">
                          <li className="mb-2">• Project completion</li>
                          <li className="mb-2">• Documentation delivery</li>
                          <li className="mb-2">• Defect management</li>
                          <li>• Post-project review</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className="section" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Technical Expertise</h2>
          <p className="text-white-50">Specialized knowledge across multiple engineering disciplines</p>
        </div>
        <div className="container">
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-3">
            <div className="col text-center" data-aos="zoom-in" data-aos-delay="0">
              <div className="p-3 bg-white bg-opacity-10 rounded-3 text-white">
                <i className="bi bi-building display-5 mb-2"></i>
                <p className="small mb-0">Civil Engineering</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in" data-aos-delay="50">
              <div className="p-3 bg-white bg-opacity-10 rounded-3 text-white">
                <i className="bi bi-lightning display-5 mb-2"></i>
                <p className="small mb-0">M&E Systems</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in" data-aos-delay="100">
              <div className="p-3 bg-white bg-opacity-10 rounded-3 text-white">
                <i className="bi bi-hdd-network display-5 mb-2"></i>
                <p className="small mb-0">ICT Infrastructure</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in" data-aos-delay="150">
              <div className="p-3 bg-white bg-opacity-10 rounded-3 text-white">
                <i className="bi bi-tree display-5 mb-2"></i>
                <p className="small mb-0">Environmental</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in" data-aos-delay="200">
              <div className="p-3 bg-white bg-opacity-10 rounded-3 text-white">
                <i className="bi bi-cone-striped display-5 mb-2"></i>
                <p className="small mb-0">Safety & Health</p>
              </div>
            </div>
            <div className="col text-center" data-aos="zoom-in" data-aos-delay="250">
              <div className="p-3 bg-white bg-opacity-10 rounded-3 text-white">
                <i className="bi bi-clipboard-check display-5 mb-2"></i>
                <p className="small mb-0">Quality Management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Benefits */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Client Benefits</h2>
          <p>Value-added outcomes for your organization</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="text-center p-4 bg-white rounded-3 shadow-sm h-100">
                <i className="bi bi-clock-history display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Time Savings</h5>
                <p className="small text-muted mb-0">Efficient project execution reduces delivery timelines</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="text-center p-4 bg-white rounded-3 shadow-sm h-100">
                <i className="bi bi-piggy-bank display-4 text-success mb-3"></i>
                <h5 className="mb-2">Cost Optimization</h5>
                <p className="small text-muted mb-0">Value engineering and cost control minimize expenses</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="text-center p-4 bg-white rounded-3 shadow-sm h-100">
                <i className="bi bi-patch-check display-4 text-warning mb-3"></i>
                <h5 className="mb-2">Quality Assurance</h5>
                <p className="small text-muted mb-0">Rigorous QA/QC ensures superior project outcomes</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="text-center p-4 bg-white rounded-3 shadow-sm h-100">
                <i className="bi bi-shield-check display-4 text-danger mb-3"></i>
                <h5 className="mb-2">Risk Mitigation</h5>
                <p className="small text-muted mb-0">Proactive risk management prevents project issues</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section dark-background">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8" data-aos="zoom-in">
              <h2 className="text-white mb-4">Partner with Experienced PM & Consultancy Experts</h2>
              <p className="text-white-50 mb-4">Let us help you achieve project success with our proven methodologies, technical expertise, and commitment to excellence.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/contact" className="btn btn-light btn-lg">
                  <i className="bi bi-briefcase me-2"></i>Start Your Project
                </Link>
                <Link href="/about-us" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-info-circle me-2"></i>Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

