"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BodyClass() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    body.classList.add("index-page");
    
    return () => {
      body.classList.remove("index-page");
    };
  }, [pathname]);

  return null;
}

