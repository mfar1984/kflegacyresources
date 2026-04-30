import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Organization",
  description: "Learn about ANSAR TECHNOLOGIES SDN. BHD. organizational structure, board of directors, key personnel, and subsidiaries.",
};

export default function OrganizationPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/organization.png)',
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
              <h1 className="with-separator">Our Organization</h1>
              <p className="text-justify">Meet our leadership team and discover the corporate structure that drives our success in delivering exceptional engineering solutions across Malaysia.</p>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/organization-hero.png" className="img-fluid animated" alt="Organization at ANSAR TECHNOLOGIES" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Organization Chart */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Organization Chart</h2>
          <p>Corporate structure and functional divisions</p>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          {/* Top Row - Highest Level */}
          <div className="row g-4 justify-content-center mb-4">
            <div className="col-md-6 col-lg-4">
              <div className="card border-primary border-3 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="small text-muted mb-1">Group Managing Director</div>
                  <h4 className="text-primary mb-0">T.c Rashid bin Rahmat</h4>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="small text-muted mb-1">Company Secretaries</div>
                  <h5 className="mb-0">Double You Management Sdn Bhd</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Subsidiary */}
          <div className="row g-4 justify-content-center mb-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="small text-muted">Subsidiary</div>
                  <h5 className="mb-1">ANSAR Solutions Sdn Bhd</h5>
                  <div className="text-muted small">Managing Director — Apijan bin Rahmat</div>
                </div>
              </div>
            </div>
          </div>

          {/* Corporate Functions */}
          <div className="row g-4 mb-4">
            <div className="col-12">
              <h5 className="text-uppercase text-muted mb-3"><i className="bi bi-diagram-3 me-2"></i>Corporate Functions</h5>
            </div>
            {[
              { title: 'Administration & HR', name: 'Haslina Bt Mohammad Hashim', icon: 'bi-people' },
              { title: 'Human Resources', name: '—', icon: 'bi-person-badge' },
              { title: 'Procurement', name: '—', icon: 'bi-bag-check' },
              { title: 'Administration', name: '—', icon: 'bi-building' },
              { title: 'Finance', name: 'Amelina Rosnaida Bt Azmi', icon: 'bi-cash-coin' },
              { title: 'Marketing & Sales', name: 'Yuszalina Bt Farouk', icon: 'bi-megaphone' },
              { title: 'Online Marketing', name: '—', icon: 'bi-globe2' },
              { title: 'Offline Marketing', name: '—', icon: 'bi-bullseye' },
              { title: 'Customer Quality & Services', name: 'Saleyha Bt Saina', icon: 'bi-headset' },
              { title: 'Call Centre', name: '—', icon: 'bi-telephone' },
              { title: 'Quality Assurance', name: '—', icon: 'bi-patch-check' },
            ].map((item, idx) => (
              <div className="col-sm-6 col-lg-4" key={idx}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start">
                      <i className={`bi ${item.icon} text-primary me-3 fs-3`}></i>
                      <div>
                        <h6 className="mb-1">{item.title}</h6>
                        <div className="text-muted small">{item.name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Engineering Divisions */}
          <div className="row g-4">
            <div className="col-12">
              <h5 className="text-uppercase text-muted mb-3"><i className="bi bi-gear-wide-connected me-2"></i>Engineering Divisions</h5>
            </div>
            {[
              { title: 'Engineering & Project Consultancy', name: 'Najib B Mokhtar', icon: 'bi-clipboard-check' },
              { title: 'Telecommunication Engineering', name: 'Faizal B Othman', icon: 'bi-broadcast' },
              { title: 'Facilities Management', name: 'Nazaruddin B Jawahir', icon: 'bi-building-gear' },
              { title: 'Electrical / Electronic', name: 'Ridzaudin B Bistaman', icon: 'bi-lightning-charge' },
              { title: 'Access & Security System', name: 'Guna AL Vera', icon: 'bi-shield-lock' },
              { title: 'Information Technologies & Network', name: 'Zulhadi B Mohammad Hashim', icon: 'bi-hdd-network' },
            ].map((item, idx) => (
              <div className="col-sm-6 col-lg-4" key={idx}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start">
                      <i className={`bi ${item.icon} text-success me-3 fs-3`}></i>
                      <div>
                        <h6 className="mb-1">{item.title}</h6>
                        <div className="text-muted small">{item.name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board of Directors Section */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Board of Directors</h2>
          <p>Leadership that drives innovation and excellence</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-primary">
                    <tr>
                      <th className="text-center" style={{width: '80px'}}>No</th>
                      <th>Name</th>
                      <th>Nationality/Race</th>
                      <th>Position</th>
                      <th>Date Appointed</th>
                      <th className="text-center" style={{width: '100px'}}>Share %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-center fw-bold">1</td>
                      <td className="fw-bold">T.c Rashid bin Rahmat</td>
                      <td>Malaysian/Malay</td>
                      <td className="fw-bold">Managing Director</td>
                      <td>14/04/2011</td>
                      <td className="text-center fw-bold">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Personnel Section */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Key Personnel</h2>
          <p className="text-white-50">Meet the professionals behind our success</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="card bg-white bg-opacity-10 border-0 shadow-lg">
                <div className="card-body p-5">
                  <div className="row align-items-center">
                    <div className="col-md-4 text-center mb-4 mb-md-0">
                      <div className="rounded-circle overflow-hidden mx-auto" style={{width: '250px', height: '250px', border: '5px solid rgba(255,255,255,0.3)'}}>
                        <Image src="/assets/img/passport2.png" alt="T.c Rashid bin Rahmat" width={250} height={250} className="img-fluid" />
                      </div>
                    </div>
                    <div className="col-md-8">
                      <h3 className="text-white mb-2">T.c Rashid bin Rahmat</h3>
                      <h5 className="text-accent mb-4">Company Director and Managing Director</h5>
                      <div className="text-white-50">
                        <p>T.c Rashid bin Rahmat graduated with Higher National Diploma (HND) from British Malaysian Institute. His first job is in telecommunication with Maxis Broadband Sdn Bhd 2004. He has more than 10 years experiences in telecommunication industry.</p>
                        <p>Have a multivendor experience and get expose with variant project abroad and also locally. Major experiences in optimization of networks, managing professional team as well as consultant in telecommunication and IT industries.</p>
                        <p className="mb-0">He also has experiences in wired telecommunication engineering and system as well as involving in general trading business.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subsidiaries Section */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Subsidiaries</h2>
          <p>Registered under Ansar Technologies Sdn Bhd</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8" data-aos="fade-up" data-aos-delay="100">
              <div className="text-center mb-5">
                <div className="p-4 bg-primary text-white rounded-3 d-inline-block mb-4">
                  <h4 className="mb-0">ANSAR TECHNOLOGIES GROUP</h4>
                  <p className="mb-0">CORPORATE STRUCTURE</p>
                </div>
              </div>

              <div className="row g-4 align-items-center">
                <div className="col-md-6" data-aos="fade-right" data-aos-delay="200">
                  <div className="card h-100 shadow-sm border-primary border-3">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                          <i className="bi bi-building display-6"></i>
                        </div>
                      </div>
                      <h5 className="card-title text-primary mb-3">ANSAR TECHNOLOGIES SDN BHD</h5>
                      <h2 className="text-primary fw-bold mb-0">49%</h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-6" data-aos="fade-left" data-aos-delay="300">
                  <div className="card h-100 shadow-sm border-danger border-3">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <div className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                          <i className="bi bi-gear-fill display-6"></i>
                        </div>
                      </div>
                      <h5 className="card-title text-danger mb-3">ANSAR SOLUTIONS SDN BHD</h5>
                      <p className="small text-muted mb-0">(1172586-M)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5" data-aos="fade-up" data-aos-delay="400">
                <div className="card shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-3">Ansar Solutions Sdn Bhd (1172586-M)</h5>
                    <p className="mb-3">B2-1-34 Jalan Pinggiran Putra 1/3, Taman Pinggiran Putra, 43300 Seri Kembangan, Selangor, Malaysia.</p>
                    <h6 className="mb-2">Business Focusing:</h6>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Printing Services</li>
                      <li><i className="bi bi-check-circle-fill text-primary me-2"></i>General Trading and Supplies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Particulars Section */}
      <section className="section dark-background">
        <div className="container section-title" data-aos="fade-up">
          <h2 className="text-white">Company Particulars</h2>
          <p className="text-white-50">Essential information about our company</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card bg-white bg-opacity-10 border-0 h-100">
                    <div className="card-body p-4">
                      <h5 className="text-accent mb-4"><i className="bi bi-building me-2"></i>Company Information</h5>
                      <div className="text-white-50">
                        <p className="mb-2"><strong className="text-white">Name:</strong><br/>Ansar Technologies Sdn Bhd</p>
                        <p className="mb-2"><strong className="text-white">Registration No:</strong><br/>940482-W</p>
                        <p className="mb-2"><strong className="text-white">Nature of Business:</strong><br/>Telecommunication Engineering, ICT Technologies and Trading</p>
                        <p className="mb-2"><strong className="text-white">Authorised Capital:</strong><br/>RM 1,000,000.00</p>
                        <p className="mb-0"><strong className="text-white">Paid Up Capital:</strong><br/>RM 1,000,000.00</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-white bg-opacity-10 border-0 h-100">
                    <div className="card-body p-4">
                      <h5 className="text-accent mb-4"><i className="bi bi-geo-alt me-2"></i>Addresses & Contact</h5>
                      <div className="text-white-50">
                        <p className="mb-2"><strong className="text-white">Registered Address:</strong><br/>E-1-2 2nd Floor, Putra Walk Taman Pinggiran Putra, 43300 Seri Kembangan, Selangor, Malaysia</p>
                        <p className="mb-2"><strong className="text-white">Phone:</strong><br/>03-89552585</p>
                        <p className="mb-2"><strong className="text-white">Correspondence Address:</strong><br/>B2-1-34, Jalan Pinggiran Putra 1/3, Taman Pinggiran Putra, 43300, Seri Kembangan, Selangor, Malaysia</p>
                        <p className="mb-0"><strong className="text-white">Phone/Fax:</strong><br/>03-89590530</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-white bg-opacity-10 border-0 h-100">
                    <div className="card-body p-4">
                      <h5 className="text-accent mb-4"><i className="bi bi-person-badge me-2"></i>Company Secretary</h5>
                      <div className="text-white-50">
                        <p className="mb-2"><strong className="text-white">Name:</strong><br/>Double You Management Services (1222615-A)</p>
                        <p className="mb-2"><strong className="text-white">Address:</strong><br/>B-2-1 1st Floor, Putra Walk Taman Pinggiran Putra, 43300 Seri Kembangan, Selangor, Malaysia</p>
                        <p className="mb-2"><strong className="text-white">Phone:</strong><br/>03-95439890</p>
                        <p className="mb-0"><strong className="text-white">Contact Person:</strong><br/>Mohd Fawzi Bin Abdol Rahim (LS007010)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-white bg-opacity-10 border-0 h-100">
                    <div className="card-body p-4">
                      <h5 className="text-accent mb-4"><i className="bi bi-bank me-2"></i>Banking Details</h5>
                      <div className="text-white-50">
                        <p className="mb-2"><strong className="text-white">Bank:</strong><br/>Maybank Berhad</p>
                        <p className="mb-2"><strong className="text-white">Address:</strong><br/>B-1, Block B, Persiaran Akademi Perdana, Taman Equine, Bandar Putra Permai, 43300 Seri Kembangan, Selangor, Malaysia</p>
                        <p className="mb-2"><strong className="text-white">Phone:</strong><br/>03-8945 7012</p>
                        <p className="mb-0"><strong className="text-white">Account No:</strong><br/>5628-0750-5311</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card bg-white bg-opacity-10 border-0">
                    <div className="card-body p-4">
                      <h5 className="text-accent mb-4"><i className="bi bi-person-circle me-2"></i>Contact Person</h5>
                      <div className="text-white-50">
                        <p className="mb-2"><strong className="text-white">Name:</strong> T.c Rashid bin Rahmat</p>
                        <p className="mb-2"><strong className="text-white">Phone:</strong> +6017-3762509</p>
                        <p className="mb-2"><strong className="text-white">Email:</strong> rashid@ansartechnologies.my</p>
                        <p className="mb-0"><strong className="text-white">Alternative Email:</strong> rashid.rahmat@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>List of Branches</h2>
          <p>Our presence across Malaysia</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="card shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Pulau Pinang</h6>
                        <p className="small mb-0">2669 Bagan Buaya, Changkat, Seberang Perai Selatan, 14300 Nibong Tebal Pulau Pinang</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Kedah</h6>
                        <p className="small mb-0">No 167 Tingkat 1, Bandar Baru Mergong, Kota Setar, 05150 Alor Setar, Kedah</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Perak</h6>
                        <p className="small mb-0">No 175-A, Tingkat 1, Jalan PPMP 3/3, Pusat Perniagaan Manjung Point 3, 32040 Manjung, Mukim Lumut, Perak</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Kelantan</h6>
                        <p className="small mb-0">No 2 KG. Berangan Masjid, Tumpat, 16200 Tumpat, Kelantan</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Pahang</h6>
                        <p className="small mb-0">No 40 Tingkat Atas Blik 2, Rompin, 26800 Mukim Rompin, Pahang</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Sarawak</h6>
                        <p className="small mb-0">No 14B Tingkat 2, Jalan Kampung Datu, 96000 Sibu Town, Sarawak</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Johor</h6>
                        <p className="small mb-0">No 9 Jalan Padi Ria, Bandar Baru Uda, 81200 Johor Bahru Johor</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Melaka</h6>
                        <p className="small mb-0">MT 2783 (Tingkat Atas) Jalan Bandar Baru 1, Alor Gajah, 78300 Masjid Tanah, Melaka</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Negeri Sembilan</h6>
                        <p className="small mb-0">No 68-A Jalan Pulasan 2, Bandar Baru Ampangan, 70400 Seremban, Negeri Sembilan</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="text-primary mb-2"><i className="bi bi-geo-alt-fill me-2"></i>Kuala Lumpur</h6>
                        <p className="small mb-0">No 59-3 Jalan 5/76B, Desa Pandan, 55100 Kuala Lumpur, WPKL</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info d-flex align-items-center" role="alert">
                <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                <div>
                  <strong>Nationwide Coverage</strong> - We have branches strategically located across Malaysia to serve you better.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

