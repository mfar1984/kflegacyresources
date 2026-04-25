import About from "@/components/About";
import VisionMissionValue from "@/components/VisionMissionValue";
import Services from "@/components/Services";

export default function Home() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Your Technology Our Inspiration</h1>
              <p className="text-justify">KF Legacy provides premium quality services and help customer to dynamic growth for driven by industry knowledge especially in Information Technology</p>
              <div className="d-flex">
                <a href="#about" className="btn-get-started">Get Started</a>
                <a href="https://www.youtube.com/watch?v=Y7f98aduVJ8" className="glightbox btn-watch-video d-flex align-items-center"><i className="bi bi-play-circle"></i><span>Watch Video</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <img src="/assets/img/hero-img.png" className="img-fluid animated" alt="KF Legacy Resources – pfSense Malaysia partner offering network, security and system solutions" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section (redesigned) */}
      <About />

      {/* Vision / Mission / Value (redesigned) */}
      <VisionMissionValue />
      {/* Services (visible on Home only; appears after Our Value, before Clients) */}
      <Services />
      </main>
  );
}
