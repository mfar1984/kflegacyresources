export default function CareerPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background career-page-hero">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Join Our Team</h1>
              <p className="text-justify">Build your career with KF Legacy Resources. We&apos;re looking for passionate, talented individuals who want to make an impact in the ICT industry. Join us and grow with a team that values innovation, excellence, and continuous learning.</p>
              <div className="d-flex">
                <a href="#openings" className="btn-get-started">View Openings</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/career-hero.png" className="img-fluid animated" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us - Section 1 (Light) */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Why Join KF Legacy Resources?</h2>
          <p>Your growth is our priority. We invest in people who invest in excellence.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-graph-up-arrow display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Career Growth</h5>
                <p className="small text-muted mb-0">Clear career paths, mentorship programs, and opportunities to lead projects. We promote from within and support your professional development with training, certifications, and skill-building initiatives.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-people display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Collaborative Culture</h5>
                <p className="small text-muted mb-0">Work with talented, passionate colleagues in a supportive environment. We value teamwork, open communication, and mutual respect. Your ideas matter, and we encourage innovation at every level.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-laptop display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Cutting-Edge Technology</h5>
                <p className="small text-muted mb-0">Work with the latest technologies from Cisco, HP, Aruba, and industry leaders. Gain hands-on experience with enterprise solutions, cloud platforms, and emerging ICT trends that advance your expertise.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-award display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Competitive Benefits</h5>
                <p className="small text-muted mb-0">Attractive salary packages, performance bonuses, medical coverage, and work-life balance. We recognize and reward excellence with comprehensive benefits that support you and your family.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-mortarboard display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Learning & Development</h5>
                <p className="small text-muted mb-0">Access to training programs, industry certifications, workshops, and conferences. We invest in continuous learning so you stay ahead in technology and enhance your professional credentials.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-star display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Impactful Projects</h5>
                <p className="small text-muted mb-0">Contribute to projects for government, healthcare, education, and enterprise clients. Your work makes a real difference in critical infrastructure and business transformation across Malaysia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings - Section 2 (Dark) */}
      <section id="openings" className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Current Openings</h2>
          <p className="text-white-50">We&apos;re always looking for talented individuals to join our team.</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white bg-opacity-10">
                <i className="bi bi-inbox display-1 text-accent mb-4"></i>
                <h4 className="text-white mb-3">No Current Openings</h4>
                <p className="text-white-50 mb-4">We don&apos;t have any open positions at this moment, but we&apos;re always interested in meeting talented professionals.</p>
                <p className="text-white-50 mb-4">Send us your resume and we&apos;ll keep you in mind for future opportunities.</p>
                <a href="mailto:enquiry@kflegacyresources.com" className="btn btn-primary">Send Your Resume</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="mb-4">How to Apply</h2>
              <p className="mb-4">Ready to take the next step in your career? We&apos;d love to hear from you.</p>
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                        <strong>1</strong>
                      </div>
                    </div>
                    <div>
                      <h5 className="mb-2">Prepare Your Documents</h5>
                      <p className="small text-muted mb-0">Update your resume/CV, cover letter, and any relevant certifications or portfolio work.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                        <strong>2</strong>
                      </div>
                    </div>
                    <div>
                      <h5 className="mb-2">Submit Your Application</h5>
                      <p className="small text-muted mb-0">Email your application to <strong>enquiry@kflegacyresources.com</strong> with the position title in the subject line.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                        <strong>3</strong>
                      </div>
                    </div>
                    <div>
                      <h5 className="mb-2">Interview Process</h5>
                      <p className="small text-muted mb-0">Our HR team will review your application and contact shortlisted candidates for interviews within 2 weeks.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                        <strong>4</strong>
                      </div>
                    </div>
                    <div>
                      <h5 className="mb-2">Join Our Team</h5>
                      <p className="small text-muted mb-0">Successful candidates will receive an offer and onboarding support to start your journey with us.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="p-5 rounded-3 bg-primary text-white text-center">
                <h4 className="mb-4">What We Look For</h4>
                <div className="row g-4">
                  <div className="col-6">
                    <i className="bi bi-lightbulb display-4 mb-3 d-block"></i>
                    <h6>Innovation</h6>
                    <p className="small mb-0">Creative problem-solving and fresh ideas</p>
                  </div>
                  <div className="col-6">
                    <i className="bi bi-heart display-4 mb-3 d-block"></i>
                    <h6>Passion</h6>
                    <p className="small mb-0">Drive to excel and make an impact</p>
                  </div>
                  <div className="col-6">
                    <i className="bi bi-chat-dots display-4 mb-3 d-block"></i>
                    <h6>Communication</h6>
                    <p className="small mb-0">Clear, effective collaboration skills</p>
                  </div>
                  <div className="col-6">
                    <i className="bi bi-trophy display-4 mb-3 d-block"></i>
                    <h6>Excellence</h6>
                    <p className="small mb-0">Commitment to quality and results</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Benefits - Section 4 (Dark) */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Employee Benefits</h2>
          <p className="text-white-50">We value our team and invest in their well-being and success.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="0">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-cash-stack display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Competitive Salary</h5>
                <p className="text-white-50 small mb-0">Market-rate compensation with performance bonuses</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-heart-pulse display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Medical Coverage</h5>
                <p className="text-white-50 small mb-0">Comprehensive health insurance for you & family</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-calendar-check display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Paid Leave</h5>
                <p className="text-white-50 small mb-0">Annual leave, sick leave, and public holidays</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-piggy-bank display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">EPF & SOCSO</h5>
                <p className="text-white-50 small mb-0">Statutory contributions and retirement planning</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="0">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-book display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Training Budget</h5>
                <p className="text-white-50 small mb-0">Annual allocation for courses & certifications</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-clock display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Flexible Hours</h5>
                <p className="text-white-50 small mb-0">Work-life balance with flexible arrangements</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-cup-hot display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Team Activities</h5>
                <p className="text-white-50 small mb-0">Team building, events, and social gatherings</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white bg-opacity-10 h-100">
                <i className="bi bi-gift display-3 text-accent mb-3"></i>
                <h5 className="text-white mb-2">Performance Bonus</h5>
                <p className="text-white-50 small mb-0">Annual bonuses based on individual & company performance</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

