"use client";

import { useEffect, useState } from "react";

export default function Topbar() {
  const [now, setNow] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dateStr = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);

  const timeStr = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  return (
    <div id="topbar" className="topbar d-flex align-items-center text-white">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Left: Date • Live Time */}
        <div className="d-flex align-items-center">
          <span suppressHydrationWarning>{mounted ? dateStr : ''}</span>
          <span className="px-2">•</span>
          <span suppressHydrationWarning>{mounted ? timeStr : ''}</span>
        </div>

        {/* Right: Email and Phone */}
        <div className="d-flex align-items-center gap-3">
          <a href="mailto:support@ansartechnologies.my" className="text-white text-decoration-none d-flex align-items-center">
            <i className="bi bi-envelope me-2"></i>
            support@ansartechnologies.my
          </a>
          <a href="tel:+60389590530" className="text-white text-decoration-none d-flex align-items-center">
            <i className="bi bi-telephone me-2"></i>
            03-8959 0530
          </a>
        </div>
      </div>
    </div>
  );
}

