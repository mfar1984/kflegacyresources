import fs from "fs";
import path from "path";

function getProductLogos(): { src: string; alt: string }[] {
  const dir = path.join(process.cwd(), "public", "assets", "img", "product");
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    entries = [];
  }
  const allowed = new Set([".png", ".jpg", ".jpeg"]);
  return entries
    .filter((n) => allowed.has(path.extname(n).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      src: `/assets/img/product/${name}`,
      alt: path.parse(name).name.replace(/[-_]/g, " ")
    }));
}

export default function Products() {
  const logos = getProductLogos();

  return (
    <section id="products" className="clients section light-background">
      <div className="container" data-aos="zoom-in">
        <div className="swiper init-swiper">
          <script
            type="application/json"
            className="swiper-config"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                loop: true,
                speed: 600,
                autoplay: { delay: 2500, disableOnInteraction: false },
                slidesPerView: "auto",
                breakpoints: {
                  320: { slidesPerView: 2, spaceBetween: 30 },
                  480: { slidesPerView: 3, spaceBetween: 40 },
                  640: { slidesPerView: 4, spaceBetween: 60 },
                  992: { slidesPerView: 5, spaceBetween: 80 },
                  1200: { slidesPerView: 6, spaceBetween: 100 }
                }
              }),
            }}
          />
          <div className="swiper-wrapper align-items-center">
            {logos.map((l) => (
              <div className="swiper-slide" key={l.src}>
                <img src={l.src} className="img-fluid product-logo" alt={l.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


