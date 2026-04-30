"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const clients = [
  { name: "Telekom Malaysia", logo: "/assets/img/client/tm.svg" },
  { name: "TNB Research", logo: "/assets/img/client/tnbr.png" },
  { name: "Sime Darby", logo: "/assets/img/client/simedarby.png" },
  { name: "Universiti Putra Malaysia", logo: "/assets/img/client/upm.png" },
  { name: "Universiti Teknologi Malaysia", logo: "/assets/img/client/utm.png" },
  { name: "PDRM", logo: "/assets/img/client/pdrm.png" },
  { name: "NAHRIM", logo: "/assets/img/client/nahrim.png" },
  { name: "MPSJ", logo: "/assets/img/client/mpsj.png" },
  { name: "MPAJ", logo: "/assets/img/client/mpaj.png" },
  { name: "SSM", logo: "/assets/img/client/ssm.png" },
  { name: "Jabatan Perdana Menteri", logo: "/assets/img/client/jabatan-perdana-menteri.png" },
  { name: "KPWKM", logo: "/assets/img/client/kpwkm.png" },
  { name: "Ministry of Agriculture", logo: "/assets/img/client/moa.png" },
  { name: "LGM", logo: "/assets/img/client/lgm.png" },
  { name: "KCJ", logo: "/assets/img/client/kcj.png" },
  { name: "KK Ampang", logo: "/assets/img/client/kkampang.png" },
  { name: "KK Selayang", logo: "/assets/img/client/kkselayang.png" },
  { name: "Hospital Tuanku Jaafar", logo: "/assets/img/client/hospital-tuanku-jaafar.png" },
  { name: "Kumpulan Melaka Berhad", logo: "/assets/img/client/kumpulanmelakaberhad.png" },
  { name: "Maju Expressway", logo: "/assets/img/client/majuexpressway.png" },
  { name: "Ranhill", logo: "/assets/img/client/ranhill.png" },
  { name: "Ericsson", logo: "/assets/img/client/ericson.png" },
  { name: "ZTE", logo: "/assets/img/client/zte.png" },
  { name: "Delta Perdana", logo: "/assets/img/client/deltaperdana.png" },
  { name: "HPD", logo: "/assets/img/client/hpd.png" },
  { name: "Eimas", logo: "/assets/img/client/eimas.png" },
  { name: "KYK", logo: "/assets/img/client/kyk.png" },
];

export default function Clients() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const scroll = () => {
      scrollPosition += scrollSpeed;
      
      // Reset position when first set of logos is completely scrolled
      const scrollWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= scrollWidth) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      requestAnimationFrame(scroll);
    };

    const animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="clients section light-background">
      <div className="container" data-aos="fade-up">
        <div 
          ref={scrollRef}
          className="clients-slider"
          style={{
            overflow: "hidden",
            position: "relative",
            width: "100%",
          }}
        >
          <div
            className="clients-track"
            style={{
              display: "flex",
              gap: "60px",
              alignItems: "center",
              width: "max-content",
            }}
          >
            {/* First set of logos */}
            {clients.map((client, index) => (
              <div
                key={`client-1-${index}`}
                className="client-logo"
                style={{
                  minWidth: "150px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  opacity: 0.9,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={150}
                  height={80}
                  style={{
                    objectFit: "contain",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {clients.map((client, index) => (
              <div
                key={`client-2-${index}`}
                className="client-logo"
                style={{
                  minWidth: "150px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  opacity: 0.9,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={150}
                  height={80}
                  style={{
                    objectFit: "contain",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .clients-slider {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        }
      `}</style>
    </section>
  );
}

