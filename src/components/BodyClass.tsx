"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function BodyClass() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const isTransparentHeroPage = pathname === "/" || 
      pathname.startsWith("/request-quotation") || 
      pathname === "/products" || 
      pathname === "/career" || 
      pathname === "/projects" || 
      pathname === "/barcode-rfid" || 
      pathname === "/network" || pathname.startsWith("/network/") ||
      pathname === "/security" || pathname.startsWith("/security/") ||
      pathname === "/system-storage" || pathname.startsWith("/system-storage/") ||
      pathname === "/other-services" || pathname.startsWith("/other-services/") ||
      pathname === "/store" ||
      pathname === "/cart" ||
      pathname === "/checkout" ||
      pathname === "/privacy" ||
      pathname === "/disclaimer" ||
      pathname === "/terms-of-use" ||
      pathname === "/sitemap";
    const body = document.body;
    if (isTransparentHeroPage) {
      body.classList.add("index-page");
    } else {
      body.classList.remove("index-page");
    }
    return () => {
      body.classList.remove("index-page");
    };
  }, [pathname]);

  return null;
}


