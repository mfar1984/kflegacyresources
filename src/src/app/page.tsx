import Image from "next/image";
import HomeOverview from "@/components/HomeOverview";
import HomeCapabilities from "@/components/HomeCapabilities";
import HomeDeliveryModel from "@/components/HomeDeliveryModel";
import HomeAccreditations from "@/components/HomeAccreditations";

export default function Home() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/home.png)',
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
              <h1 className="with-separator">Efficient, Progressive & Productive</h1>
              <p className="text-justify">&quot;Clients are our most valuable partners.&quot; Guided by this principle, we dedicate ourselves to understanding your unique needs and delivering exceptional solutions across all engineering disciplines. Through strategic partnerships, meticulous planning, and cost-effective implementation, we build lasting relationships founded on excellence. Your objectives become our mission as we work together toward shared success.</p>
              <div className="d-flex">
                <a href="/about-us" className="btn-get-started">Get Started</a>
                <a href="#services" className="btn-watch-video d-flex align-items-center"><i className="bi bi-arrow-right-circle"></i><span>Our Services</span></a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/home-hero.png" className="img-fluid animated" alt="ANSAR TECHNOLOGIES - Engineering Solutions Provider" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      {/* New Corporate Sections */}
      <HomeOverview />
      <HomeCapabilities />
      <HomeDeliveryModel />
      <HomeAccreditations />
    </main>
  );
}

