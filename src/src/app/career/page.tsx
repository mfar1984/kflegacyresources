"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import JobApplicationForm from "@/components/JobApplicationForm";

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_notes: string | null;
  experience_min: number | null;
  experience_max: number | null;
  experience_level: string | null;
  job_type: string;
  employment_type: string;
  icon: string;
  icon_bg: string;
  icon_color: string;
  btn_color: string;
  overview: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  posted_date: string;
  closing_date: string | null;
}

export default function CareerPage() {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<JobPosting | null>(null);

  useEffect(() => {
    fetch('/api/public/career')
      .then(res => res.json())
      .then(data => {
        setJobPostings(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching career postings:', error);
        setLoading(false);
      });
  }, []);

  // Helper functions
  const formatSalary = (job: JobPosting) => {
    if (job.salary_notes) return job.salary_notes;
    if (job.salary_min && job.salary_max) {
      return `RM ${job.salary_min.toLocaleString()} - RM ${job.salary_max.toLocaleString()}`;
    }
    return 'Negotiable';
  };

  const formatExperience = (job: JobPosting) => {
    if (job.experience_level) return job.experience_level;
    if (job.experience_min && job.experience_max) {
      return `${job.experience_min}-${job.experience_max} years experience`;
    }
    return 'All levels welcome';
  };

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
  };

  const formatClosingDate = (dateString: string | null) => {
    if (!dateString) return 'Open until filled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/career.png)',
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
              <h1 className="with-separator">Join Our Team</h1>
              <p className="text-justify">Build your career with ANSAR TECHNOLOGIES. We&apos;re looking for passionate, talented engineers and professionals who want to make an impact in the engineering industry. Join us and grow with a team that values innovation, excellence, and continuous development.</p>
              <div className="d-flex">
                <a href="#openings" className="btn-get-started">View Openings</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/career-hero.png" className="img-fluid animated" alt="Career at ANSAR TECHNOLOGIES" width={800} height={600} />
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us - Section 1 (Light) */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Why Join ANSAR TECHNOLOGIES?</h2>
          <p>Your growth is our priority. We invest in people who invest in excellence.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="0">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-graph-up-arrow display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Career Growth</h5>
                <p className="small text-muted mb-0">Clear career paths, mentorship programs, and opportunities to lead engineering projects. We promote from within and support your professional development with training, certifications, and skill-building initiatives.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-people display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Collaborative Culture</h5>
                <p className="small text-muted mb-0">Work with talented, passionate engineers in a supportive environment. We value teamwork, open communication, and mutual respect. Your ideas matter, and we encourage innovation at every level.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-tools display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Cutting-Edge Projects</h5>
                <p className="small text-muted mb-0">Work on government and private sector projects using the latest technologies and engineering practices. Gain hands-on experience with civil, M&E, and ICT solutions that advance your expertise.</p>
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
                <p className="small text-muted mb-0">Access to training programs, industry certifications, workshops, and conferences. We invest in continuous learning so you stay ahead in engineering technology and enhance your professional credentials.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm h-100 text-center">
                <i className="bi bi-star display-4 text-primary mb-3"></i>
                <h5 className="mb-3">Impactful Projects</h5>
                <p className="small text-muted mb-0">Contribute to projects for government agencies, corporate clients, and infrastructure development. Your work makes a real difference in building Malaysia&apos;s future.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings - Section 2 (Dark) */}
      <section id="openings" className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Current Openings</h2>
          
          <p className="text-white-50">Join our dynamic team and build your career with ANSAR TECHNOLOGIES.</p>
        </div>
        <div className="container">
          <div className="row g-4">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading job postings...</p>
              </div>
            ) : jobPostings.length === 0 ? (
              <div className="col-12 text-center py-5">
                <i className="bi bi-briefcase" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                <h4 className="mt-3">No Current Openings</h4>
                <p className="text-muted">Check back soon for new opportunities!</p>
              </div>
            ) : (
              jobPostings.map((job, index) => (
                <div key={job.id} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="card h-100 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden', border: 'none' }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start mb-3">
                        <div className={`rounded ${job.icon_bg} bg-opacity-10 p-3 me-3`}>
                          <i className={`bi ${job.icon} ${job.icon_color}`} style={{ fontSize: '32px' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1">{job.title}</h5>
                          <p className="text-muted small mb-0">{job.department}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <span className={`badge ${job.icon_bg}`}>{job.job_type}</span>
                          <span className="badge bg-info">{job.employment_type}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="small text-muted mb-2">
                          <i className="bi bi-geo-alt me-2"></i>{job.location}
                        </div>
                        <div className="small text-muted mb-2">
                          <i className="bi bi-briefcase me-2"></i>{formatExperience(job)}
                        </div>
                        <div className="small mb-2" style={{ fontWeight: 600, color: '#059669' }}>
                          <i className="bi bi-cash-stack me-2"></i>{formatSalary(job)}
                        </div>
                      </div>

                      <p className="card-text small text-muted mb-4" style={{ minHeight: '60px' }}>
                        {job.overview.replace(/<[^>]*>/g, '').substring(0, 120)}...
                      </p>

                      <div className="d-grid gap-2">
                        <button 
                          className={`btn ${job.btn_color}`}
                          onClick={() => setSelectedJob(job)}
                        >
                          <i className="bi bi-eye me-2"></i>View Details
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setSelectedJobForApplication(job);
                            setShowApplicationForm(true);
                          }}
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>Apply Now
                        </button>
                      </div>
                    </div>
                    <div className="card-footer bg-light border-0 p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>Posted: {formatPostedDate(job.posted_date)}
                        </small>
                        <small className={job.closing_date ? 'text-danger fw-semibold' : 'text-success'}>
                          <i className="bi bi-calendar-event me-1"></i>{formatClosingDate(job.closing_date)}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content" style={{ maxHeight: '90vh' }}>
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <div className={`rounded ${selectedJob.icon_bg} bg-opacity-10 p-2 me-3`}>
                    <i className={`bi ${selectedJob.icon} ${selectedJob.icon_color}`} style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">{selectedJob.title}</h5>
                    <small className="text-muted">{selectedJob.department}</small>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedJob(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-lg-8">
                    {/* Overview */}
                    <h6 className="mb-2">Job Overview</h6>
                    <div className="small mb-4" dangerouslySetInnerHTML={{ __html: selectedJob.overview }} />
                    
                    {/* Key Responsibilities */}
                    <h6 className="mb-2">Key Responsibilities</h6>
                    <div className="small mb-4" dangerouslySetInnerHTML={{ __html: selectedJob.responsibilities }} />
                    
                    {/* Requirements */}
                    <h6 className="mb-2">Requirements</h6>
                    <div className="small mb-4" dangerouslySetInnerHTML={{ __html: selectedJob.requirements }} />
                    
                    {/* What We Offer */}
                    <h6 className="mb-2">What We Offer</h6>
                    <div className="small mb-0" dangerouslySetInnerHTML={{ __html: selectedJob.benefits }} />
                  </div>
                  <div className="col-lg-4">
                    <div className="card bg-light border-0 sticky-top" style={{ top: '20px' }}>
                      <div className="card-body">
                        <h6 className="card-title mb-3">Job Details</h6>
                        <div className="mb-3">
                          <small className="text-muted d-block">Job Type</small>
                          <strong>{selectedJob.job_type}</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">Employment Type</small>
                          <strong>{selectedJob.employment_type}</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">Salary Range</small>
                          <strong className="text-success">{formatSalary(selectedJob)}</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">Experience Level</small>
                          <strong>{formatExperience(selectedJob)}</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">Location</small>
                          <strong>{selectedJob.location}</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">Department</small>
                          <strong>{selectedJob.department}</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">Posted</small>
                          <strong>{formatPostedDate(selectedJob.posted_date)}</strong>
                        </div>
                        <div className="mb-4">
                          <small className="text-muted d-block">Closing Date</small>
                          <strong className={selectedJob.closing_date ? 'text-danger' : 'text-success'}>
                            {formatClosingDate(selectedJob.closing_date)}
                          </strong>
                        </div>
                        <div className="d-grid gap-2">
                          <button 
                            className={`btn ${selectedJob.btn_color}`}
                            onClick={() => {
                              setSelectedJobForApplication(selectedJob);
                              setShowApplicationForm(true);
                              setSelectedJob(null);
                            }}
                          >
                            <i className="bi bi-file-earmark-text me-2"></i>Apply Now
                          </button>
                          <button 
                            className="btn btn-outline-secondary" 
                            onClick={() => setSelectedJob(null)}
                          >
                            <i className="bi bi-x-circle me-2"></i>Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How to Apply - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="mb-4">How to Apply</h2>
              <p className="mb-4">Ready to take the next step in your engineering career? We&apos;d love to hear from you.</p>
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
                      <p className="small text-muted mb-0">Update your resume/CV, cover letter, and any relevant engineering certifications, licenses, or portfolio work.</p>
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
                      <p className="small text-muted mb-0">Email your application to <strong>hr@ansartechnologies.my</strong> with the position title in the subject line.</p>
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
                    <p className="small mb-0">Creative problem-solving and engineering excellence</p>
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

      {/* Application Form Modal */}
      {showApplicationForm && selectedJobForApplication && (
        <JobApplicationForm
          jobId={selectedJobForApplication.id}
          jobTitle={selectedJobForApplication.title}
          onClose={() => {
            setShowApplicationForm(false);
            setSelectedJobForApplication(null);
          }}
          onSuccess={() => {
            // Could add success tracking here
          }}
        />
      )}

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

