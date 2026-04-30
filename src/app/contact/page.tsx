import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with ANSAR TECHNOLOGIES SDN. BHD. for engineering solutions, project inquiries, and business partnerships.",
};

export default function ContactPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/contact.png)',
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
              <h1 className="with-separator">Contact Us</h1>
              <p className="text-justify">Let&apos;s discuss your project requirements. Our team is ready to provide expert engineering solutions tailored to your needs.</p>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/contact-hero.png" className="img-fluid animated" alt="Contact ANSAR TECHNOLOGIES" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Get In Touch</h2>
          <p>We&apos;re here to answer your questions and discuss your projects</p>
        </div>

        <div className="container">
          <div className="row gy-4">
            {/* Office Location */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="flex-shrink-0">
                      <i className="bi bi-geo-alt-fill text-primary" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5 className="mb-2">Office Address</h5>
                      <p className="mb-0">
                        <strong>ANSAR TECHNOLOGIES SDN. BHD.</strong><br />
                        ( 940482-W / 201101012342 )<br />
                        B2-1-34, TINGKAT 1, JALAN PINGGIRAN 1/3<br />
                        TAMAN PINGGIRAN PUTRA<br />
                        43300 SERI KEMBANGAN<br />
                        SELANGOR, MALAYSIA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  {/* Phone */}
                  <div className="d-flex align-items-start mb-4">
                    <div className="flex-shrink-0">
                      <i className="bi bi-telephone-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">Phone</h6>
                      <p className="mb-0">
                        <a href="tel:+60389590530" className="text-decoration-none">03-8959 0530</a>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="d-flex align-items-start mb-4">
                    <div className="flex-shrink-0">
                      <i className="bi bi-envelope-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">Email</h6>
                      <p className="mb-0">
                        <a href="mailto:support@ansartechnologies.my" className="text-decoration-none">support@ansartechnologies.my</a>
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <i className="bi bi-whatsapp text-success" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">WhatsApp</h6>
                      <p className="mb-0">
                        <a href="https://wa.me/601163440530" target="_blank" rel="noopener noreferrer" className="text-decoration-none">+60 11-6344 0530</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Business Hours</h2>
          <p>We&apos;re available to serve you during these hours</p>
        </div>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="fade-up" data-aos-delay="100">
              <div className="row g-4">
                {/* Weekdays Card */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-5 text-center">
                      <div 
                        className="mb-4 mx-auto d-flex align-items-center justify-content-center"
                        style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: '#007bff',
                          borderRadius: '50%'
                        }}
                      >
                        <i className="bi bi-check-circle text-white" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <h4 className="mb-3">Weekdays</h4>
                      <p className="text-muted mb-2" style={{ fontSize: '1.1rem' }}>Monday - Friday</p>
                      <p className="fw-bold mb-0" style={{ fontSize: '1.25rem', color: '#007bff' }}>9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Weekend Card */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-5 text-center">
                      <div 
                        className="mb-4 mx-auto d-flex align-items-center justify-content-center"
                        style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: '#6c757d',
                          borderRadius: '50%'
                        }}
                      >
                        <i className="bi bi-x-circle text-white" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <h4 className="mb-3">Weekend</h4>
                      <p className="text-muted mb-2" style={{ fontSize: '1.1rem' }}>Saturday & Sunday</p>
                      <p className="fw-bold mb-0" style={{ fontSize: '1.25rem', color: '#6c757d' }}>Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <section className="section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Find Us</h2>
          <p>Visit our office location</p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="ratio ratio-21x9">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.476782234567!2d101.6794368!3d2.995323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cdb50a13b9ab71%3A0x4bcf9b3fc32fec5b!2sAnsar%20Solutions%20Sdn%20Bhd!5e0!3m2!1sen!2smy!4v1635789012345!5m2!1sen!2smy" 
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ANSAR TECHNOLOGIES Office Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Send Us A Message</h2>
          <p>Fill out the form below and we&apos;ll get back to you as soon as possible</p>
        </div>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

