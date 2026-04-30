import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tenders & Opportunities",
  description: "Current tender opportunities and business proposals from ANSAR TECHNOLOGIES SDN. BHD. - Partner with us for government and private sector projects.",
};

export default function TendersPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/tenders.png)',
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
              <h1 className="with-separator">Tenders & Opportunities</h1>
              <p className="text-justify">Explore current tender opportunities and business partnerships with ANSAR TECHNOLOGIES. We welcome collaborations from contractors, suppliers, and project partners for government and private sector projects.</p>
              <div className="d-flex">
                <a href="#tenders" className="btn-get-started">View Tenders</a>
                <a href="/contact" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>Inquire Now</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/tenders-hero.png" className="img-fluid animated" alt="Tenders & Opportunities" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Current Tenders */}
      <section id="tenders" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Current Tender Opportunities</h2>
          <p>Active tenders and requests for quotation</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                <div>
                  <strong>Notice:</strong> No active tenders at this moment. Please check back regularly for updates or contact us for partnership opportunities.
                </div>
              </div>

              {/* Tender Template - Hidden for now */}
              <div className="card border-0 shadow-sm mb-4" style={{display: 'none'}}>
                <div className="card-header bg-primary text-white">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h5 className="mb-0">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Tender Reference: AT/2024/001
                      </h5>
                    </div>
                    <div className="col-md-4 text-md-end mt-2 mt-md-0">
                      <span className="badge bg-warning text-dark">Open</span>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  <h5 className="mb-3">Project Title Example</h5>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Sector:</strong> Government / Private</p>
                      <p className="mb-1"><strong>Category:</strong> Civil Engineering</p>
                      <p className="mb-0"><strong>Location:</strong> Selangor, Malaysia</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Published:</strong> 01 Jan 2024</p>
                      <p className="mb-1"><strong>Closing Date:</strong> 31 Jan 2024</p>
                      <p className="mb-0"><strong>Estimated Value:</strong> RM X.X Million</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Scope of Work:</strong>
                    <p className="text-muted mb-0">Brief description of the project scope and requirements.</p>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary">
                      <i className="bi bi-download me-2"></i>Download Tender Documents
                    </button>
                    <button className="btn btn-outline-primary">
                      <i className="bi bi-info-circle me-2"></i>More Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Participate */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">How to Participate in Our Tenders</h2>
          <p className="text-white-50">Simple steps to submit your proposal</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-accent mx-auto d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <strong className="text-white fs-4">1</strong>
                  </div>
                  <h5 className="text-white mb-3">Review Tender</h5>
                  <p className="text-white-50 small mb-0">Read the tender notice and download required documents</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-accent mx-auto d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <strong className="text-white fs-4">2</strong>
                  </div>
                  <h5 className="text-white mb-3">Prepare Proposal</h5>
                  <p className="text-white-50 small mb-0">Compile all required documents and technical proposals</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-accent mx-auto d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <strong className="text-white fs-4">3</strong>
                  </div>
                  <h5 className="text-white mb-3">Submit Bid</h5>
                  <p className="text-white-50 small mb-0">Submit your proposal before the closing date and time</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="card bg-white bg-opacity-10 border-0 h-100">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-accent mx-auto d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <strong className="text-white fs-4">4</strong>
                  </div>
                  <h5 className="text-white mb-3">Evaluation</h5>
                  <p className="text-white-50 small mb-0">Wait for evaluation results and award notification</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tender Categories */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Tender Categories</h2>
          <p>We issue tenders across various engineering disciplines</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="0">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-building display-4 text-primary mb-3"></i>
                  <h5 className="mb-2">Civil Engineering</h5>
                  <p className="small text-muted mb-0">Infrastructure, construction, structural works</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-lightning display-4 text-warning mb-3"></i>
                  <h5 className="mb-2">M&E Systems</h5>
                  <p className="small text-muted mb-0">Electrical, HVAC, plumbing, fire protection</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-hdd-network display-4 text-info mb-3"></i>
                  <h5 className="mb-2">ICT Solutions</h5>
                  <p className="small text-muted mb-0">Network, telecommunications, IT infrastructure</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-clipboard-check display-4 text-success mb-3"></i>
                  <h5 className="mb-2">Consultancy</h5>
                  <p className="small text-muted mb-0">Project management, design, supervision</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tender Information */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Tender Information & Requirements</h2>
          <p>Important information for tender participants</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="0">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="mb-3">
                    <i className="bi bi-file-earmark-check text-primary me-2"></i>
                    Eligibility Criteria
                  </h5>
                  <ul className="list-unstyled">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Valid company registration (SSM)</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Relevant industry licenses & certifications</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Financial capability & credit standing</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Track record of similar projects</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Technical capacity & expertise</li>
                    <li className="mb-0"><i className="bi bi-check-circle text-success me-2"></i>Compliance with safety & quality standards</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="mb-3">
                    <i className="bi bi-folder text-info me-2"></i>
                    Required Documents
                  </h5>
                  <ul className="list-unstyled">
                    <li className="mb-2"><i className="bi bi-file-earmark text-primary me-2"></i>Company registration certificate</li>
                    <li className="mb-2"><i className="bi bi-file-earmark text-primary me-2"></i>Valid licenses (CIDB, PKK, etc.)</li>
                    <li className="mb-2"><i className="bi bi-file-earmark text-primary me-2"></i>Financial statements (audited)</li>
                    <li className="mb-2"><i className="bi bi-file-earmark text-primary me-2"></i>Company profile & portfolio</li>
                    <li className="mb-2"><i className="bi bi-file-earmark text-primary me-2"></i>Technical proposal & methodology</li>
                    <li className="mb-0"><i className="bi bi-file-earmark text-primary me-2"></i>Pricing schedule & BOQ</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="mb-3">
                    <i className="bi bi-clipboard-data text-warning me-2"></i>
                    Evaluation Criteria
                  </h5>
                  <ul className="list-unstyled">
                    <li className="mb-2"><i className="bi bi-star text-warning me-2"></i>Technical capability (40%)</li>
                    <li className="mb-2"><i className="bi bi-star text-warning me-2"></i>Price competitiveness (30%)</li>
                    <li className="mb-2"><i className="bi bi-star text-warning me-2"></i>Past performance & references (15%)</li>
                    <li className="mb-2"><i className="bi bi-star text-warning me-2"></i>Financial strength (10%)</li>
                    <li className="mb-0"><i className="bi bi-star text-warning me-2"></i>Compliance & safety record (5%)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="mb-3">
                    <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                    Important Notes
                  </h5>
                  <ul className="list-unstyled">
                    <li className="mb-2"><i className="bi bi-dot text-danger"></i>Late submissions will NOT be accepted</li>
                    <li className="mb-2"><i className="bi bi-dot text-danger"></i>Incomplete documents will be rejected</li>
                    <li className="mb-2"><i className="bi bi-dot text-danger"></i>All prices must be in MYR currency</li>
                    <li className="mb-2"><i className="bi bi-dot text-danger"></i>Validity period: 90 days from closing</li>
                    <li className="mb-0"><i className="bi bi-dot text-danger"></i>Amendments may be issued anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="section dark-background">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="p-4">
                <i className="bi bi-trophy display-3 text-accent mb-3"></i>
                <h2 className="text-white mb-2">150+</h2>
                <p className="text-white-50 mb-0">Projects Awarded</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4">
                <i className="bi bi-people display-3 text-accent mb-3"></i>
                <h2 className="text-white mb-2">500+</h2>
                <p className="text-white-50 mb-0">Registered Vendors</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4">
                <i className="bi bi-building display-3 text-accent mb-3"></i>
                <h2 className="text-white mb-2">50+</h2>
                <p className="text-white-50 mb-0">Government Clients</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="p-4">
                <i className="bi bi-graph-up display-3 text-accent mb-3"></i>
                <h2 className="text-white mb-2">RM 2B+</h2>
                <p className="text-white-50 mb-0">Projects Value</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe to Tender Notifications */}
      <section className="section light-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <h2 className="mb-4">Get Tender Notifications</h2>
              <p className="text-muted mb-4">Subscribe to receive instant notifications about new tender opportunities matching your expertise.</p>
              <div className="card border-0 shadow-sm p-4">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label text-start d-block">Company Name</label>
                    <input type="text" className="form-control" placeholder="Your company name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-start d-block">Email Address</label>
                    <input type="email" className="form-control" placeholder="your@email.com" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-start d-block">Category</label>
                    <select className="form-select">
                      <option>All Categories</option>
                      <option>Civil Engineering</option>
                      <option>M&E Engineering</option>
                      <option>ICT Solutions</option>
                      <option>Consultancy</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary w-100">
                      <i className="bi bi-bell me-2"></i>Subscribe to Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Opportunities */}
      <section className="section dark-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="zoom-in">
              <h2 className="text-white mb-4">Interested in Partnership Opportunities?</h2>
              <p className="text-white-50 mb-4">Contact our business development team to explore collaboration opportunities and receive notifications about future tenders.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/contact" className="btn btn-light btn-lg">
                  <i className="bi bi-envelope me-2"></i>Contact Us
                </Link>
                <Link href="/business/procurement" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-box-seam me-2"></i>Become a Supplier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

