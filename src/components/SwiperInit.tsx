"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SwiperInit() {
  const pathname = usePathname();

  useEffect(() => {
    const init = () => {
      interface MinimalSwiperConstructor {
        new (el: Element, config: unknown): { destroy: () => void };
      }
      const win = window as unknown as { Swiper?: MinimalSwiperConstructor };
      const Swiper = win.Swiper;
      if (!Swiper) return;

      document.querySelectorAll<HTMLElement>(".init-swiper").forEach((el) => {
        // Destroy existing swiper instance if present
        const existingSwiper = (el as unknown as { swiper?: { destroy: () => void } }).swiper;
        if (existingSwiper) {
          try {
            existingSwiper.destroy();
          } catch {
            // ignore
          }
        }
        
        // Re-initialize
        el.dataset.swiperInit = "";
        const configEl = el.querySelector(".swiper-config");
        let config: unknown = {};
        try {
          const raw = configEl?.textContent?.trim() || "{}";
          config = JSON.parse(raw);
        } catch {
          config = {};
        }
        try {
          const swiperInstance = new Swiper(el, config);
          (el as unknown as { swiper: { destroy: () => void } }).swiper = swiperInstance;
          el.dataset.swiperInit = "1";
        } catch {
          // ignore
        }
      });
    };

    // Run after hydration and whenever route changes
    init();
    const t = window.setTimeout(init, 300);
    return () => window.clearTimeout(t);
  }, [pathname]); // Re-run when pathname changes

  return null;
}


