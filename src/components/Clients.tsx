export default function Clients() {
  return (
    <section id="clients" className="clients section light-background">
      <div className="container" data-aos="zoom-in">
        <div className="swiper init-swiper">
          <script
            type="application/json"
            className="swiper-config"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                loop: true,
                speed: 600,
                autoplay: { delay: 3000, disableOnInteraction: false },
                slidesPerView: "auto",
                breakpoints: {
                  320: { slidesPerView: 2, spaceBetween: 40 },
                  480: { slidesPerView: 3, spaceBetween: 60 },
                  640: { slidesPerView: 4, spaceBetween: 80 },
                  992: { slidesPerView: 5, spaceBetween: 120 },
                  1200: { slidesPerView: 6, spaceBetween: 120 }
                }
              }),
            }}
          />
          <div className="swiper-wrapper align-items-center">
            {[
              { src: "/assets/img/clients/annurtailor.jpeg", alt: "Annur Tailor" },
              { src: "/assets/img/clients/ansar.png", alt: "ANSAR" },
              { src: "/assets/img/clients/asnb.png", alt: "ASNB" },
              { src: "/assets/img/clients/cbc.png", alt: "CBC" },
              { src: "/assets/img/clients/intosolutions-logo.png", alt: "Into Solutions" },
              { src: "/assets/img/clients/Kementerian_Pendidikan_Malaysia.png", alt: "Kementerian Pendidikan Malaysia" },
              { src: "/assets/img/clients/kka.png", alt: "KKA" },
              { src: "/assets/img/clients/kkkoklanas.png", alt: "KK Koklanas" },
              { src: "/assets/img/clients/klgsystem.jpeg", alt: "KLG System" },
              { src: "/assets/img/clients/maskargo.webp", alt: "MASkargo" },
              { src: "/assets/img/clients/mirage_visual.png", alt: "Mirage Visual" },
              { src: "/assets/img/clients/mrsm.png", alt: "MRSM" },
              { src: "/assets/img/clients/risda.png", alt: "RISDA" },
              { src: "/assets/img/clients/sl_cybersec.png", alt: "SL Cybersec" },
              { src: "/assets/img/clients/tpm.jpg", alt: "TPM" },
              { src: "/assets/img/clients/trec.png", alt: "TREC" }
            ].map((logo) => (
              <div className="swiper-slide" key={logo.src}>
                <img src={logo.src} className="img-fluid" alt={logo.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


