"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Swiper?: {
      new (el: Element, config: Record<string, unknown>): unknown;
    };
  }
}

export default function SwiperInit() {
  useEffect(() => {
    const initSwiper = () => {
      if (typeof window !== "undefined" && window.Swiper) {
        const Swiper = window.Swiper;
        document.querySelectorAll(".init-swiper").forEach((el) => {
          const configEl = el.querySelector(".swiper-config");
          if (configEl) {
            const config = JSON.parse(configEl.innerHTML.trim());
            new Swiper(el, config);
          }
        });
      }
    };

    const timer = setTimeout(initSwiper, 500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}

