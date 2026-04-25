export default function CARRentalPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background other-car-hero" style={{
        backgroundImage: 'url(/assets/img/background/carrental.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">CAR Rental Services</h1>
              <p className="text-justify">Reliable transportation for your business needs. From daily rentals to long-term leases, we provide well-maintained vehicles with flexible terms, competitive rates, and professional service for corporate travel and project logistics.</p>
              <div className="d-flex">
                <a href="#fleet" className="btn-get-started">View Fleet</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/background/carrental-hero.png" className="img-fluid animated" alt="CAR Rental" />
            </div>
          </div>
        </div>
      </section>

      {/* Fleet & Services - Section 1 (Light) */}
      <section id="fleet" className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Our Services</h2>
          <p>Flexible rental options for business and personal use.</p>
        </div>
        <div className="container">
          <div className="row g-4 mb-5">
            <div className="col-lg-4 col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <i className="bi bi-calendar-day display-3 text-primary mb-3"></i>
                <h5 className="mb-3">Daily / Weekly Rental</h5>
                <p className="small text-muted mb-0">Short-term rentals for business trips, site visits, and project assignments with daily or weekly rates.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <i className="bi bi-calendar-month display-3 text-primary mb-3"></i>
                <h5 className="mb-3">Monthly Rental</h5>
                <p className="small text-muted mb-0">Extended rentals for ongoing projects or temporary staff with discounted monthly rates and flexible terms.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4 rounded-3 bg-white shadow-sm text-center h-100">
                <i className="bi bi-briefcase display-3 text-primary mb-3"></i>
                <h5 className="mb-3">Corporate Leasing</h5>
                <p className="small text-muted mb-0">Long-term lease agreements for company fleets with maintenance, insurance, and replacement vehicle support.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12" data-aos="fade-up">
              <div className="p-4 rounded-3 bg-primary text-white">
                <div className="row align-items-center text-center">
                  <div className="col-md-3">
                    <i className="bi bi-shield-check display-4 mb-2"></i>
                    <p className="mb-0">Fully Insured</p>
                  </div>
                  <div className="col-md-3">
                    <i className="bi bi-tools display-4 mb-2"></i>
                    <p className="mb-0">Well-Maintained</p>
                  </div>
                  <div className="col-md-3">
                    <i className="bi bi-telephone display-4 mb-2"></i>
                    <p className="mb-0">24/7 Support</p>
                  </div>
                  <div className="col-md-3">
                    <i className="bi bi-geo-alt display-4 mb-2"></i>
                    <p className="mb-0">Delivery Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Section 2 (Dark) */}
      <section className="section dark-background">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <h2 className="text-white mb-3">Why Rent From Us?</h2>
              <p className="text-white-50">Hassle-free rentals with transparent pricing and professional service.</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6" data-aos="zoom-in">
              <div className="text-center p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-cash-stack display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Competitive Rates</h5>
                <p className="small text-muted mb-0">Market-rate pricing with no hidden fees</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-clock display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Flexible Terms</h5>
                <p className="small text-muted mb-0">Daily, weekly, monthly - no long-term commitment required</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-file-text display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Simple Process</h5>
                <p className="small text-muted mb-0">Easy booking, minimal paperwork, fast approval</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4 rounded-3 bg-white shadow h-100">
                <i className="bi bi-headset display-4 text-primary mb-3"></i>
                <h5 className="mb-2">Customer Support</h5>
                <p className="small text-muted mb-0">Dedicated support for bookings and roadside assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Section 3 (Light) */}
      <section className="section light-background">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <div className="p-5 rounded-3 bg-white shadow-sm">
                <i className="bi bi-car-front-fill display-1 text-primary mb-4"></i>
                <h3 className="mb-3">Need a Vehicle?</h3>
                <p className="mb-4">Contact us for availability, pricing, and booking. We&apos;ll help you find the right vehicle for your requirements.</p>
                <a href="/request-quotation" className="btn btn-primary btn-lg">Request Quotation</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

