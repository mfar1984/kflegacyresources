"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";
import type React from "react";

export default function Menu() {
  const onToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;
    parent.classList.toggle("active");
    const next = parent.nextElementSibling as HTMLElement | null;
    if (next) next.classList.toggle("dropdown-active");
    e.stopPropagation();
  }, []);

  // Flip nested submenu direction if it would overflow viewport
  useEffect(() => {
    const nav = document.getElementById("navmenu");
    if (!nav) return;
    const nestedDropdowns = Array.from(nav.querySelectorAll<HTMLLIElement>("li.dropdown li.dropdown"));

    const listeners: Array<{ li: HTMLLIElement; handler: (e: Event) => void }> = [];

    nestedDropdowns.forEach((li) => {
      const handler = () => {
        const submenu = li.querySelector<HTMLElement>(":scope > ul");
        if (!submenu) return;
        // reset any inline positioning
        submenu.style.left = "";
        li.classList.remove("submenu-left");

        const rect = submenu.getBoundingClientRect();
        const overflowRight = rect.right > window.innerWidth - 8;
        const overflowLeft = rect.left < 8;

        if (overflowRight) {
          li.classList.add("submenu-left");
          const rect2 = submenu.getBoundingClientRect();
          if (rect2.left < 8) submenu.style.left = `${8 - rect2.left}px`;
        } else if (overflowLeft) {
          submenu.style.left = `${8 - rect.left}px`;
        }
      };
      li.addEventListener("mouseenter", handler);
      li.addEventListener("focusin", handler);
      listeners.push({ li, handler });
    });

    return () => {
      listeners.forEach(({ li, handler }) => {
        li.removeEventListener("mouseenter", handler);
        li.removeEventListener("focusin", handler);
      });
    };
  }, []);

  return (
    <nav id="navmenu" className="navmenu me-3">
      <ul>
        <li className="dropdown">
          <Link href="/"><span>Home</span> <i className="bi bi-chevron-down toggle-dropdown" onClick={onToggle}></i></Link>
          <ul>
            <li><Link href="/#about">About Us</Link></li>
            <li><Link href="/#vision">Our Vision</Link></li>
            <li><Link href="/#mission">Our Mission</Link></li>
            <li><Link href="/#value">Our Value</Link></li>
          </ul>
        </li>
        <li className="dropdown">
          <Link href="/#services"><span>Services</span> <i className="bi bi-chevron-down toggle-dropdown" onClick={onToggle}></i></Link>
          <ul>
            <li><Link href="/barcode-rfid">Barcode &amp; RFID</Link></li>
            <li className="dropdown"><a href="#"><span>Network</span> <i className="bi bi-chevron-down toggle-dropdown" onClick={onToggle}></i></a>
              <ul>
                <li><Link href="/network/bandwidth-management">Bandwidth Management</Link></li>
                <li><Link href="/network/internet-intranet-solutions">Internet &amp; Intranet Solutions</Link></li>
                <li><Link href="/network/infrastructure-setup">Network Infrastructure Setup</Link></li>
                <li><Link href="/network/management-solutions">Network Management Solutions</Link></li>
              </ul>
            </li>
            <li className="dropdown"><a href="#"><span>Security</span> <i className="bi bi-chevron-down toggle-dropdown" onClick={onToggle}></i></a>
              <ul>
                <li><Link href="/security/network-security-solutions">Network Security Solutions</Link></li>
                <li><Link href="/security/spa">Security Posture Assessment (SPA)</Link></li>
                <li><Link href="/security/surveillance-solutions">Surveillance Solutions</Link></li>
              </ul>
            </li>
            <li className="dropdown"><a href="#"><span>System &amp; Storage</span> <i className="bi bi-chevron-down toggle-dropdown" onClick={onToggle}></i></a>
              <ul>
                <li><Link href="/system-storage/backup-disaster-recovery">Backup &amp; Disaster Recovery Solutions</Link></li>
                <li><Link href="/system-storage/desktop-management">Desktop Management Solutions</Link></li>
                <li><Link href="/system-storage/san-nas-storage">SAN &amp; NAS Storage Solutions</Link></li>
                <li><Link href="/system-storage/virtualization">Virtualization</Link></li>
                <li><Link href="/system-storage/windows-linux-solutions">Windows &amp; Linux Solutions</Link></li>
              </ul>
            </li>
            <li className="dropdown"><a href="#"><span>Other Services</span> <i className="bi bi-chevron-down toggle-dropdown" onClick={onToggle}></i></a>
              <ul>
                <li><Link href="/other-services/car-rental">CAR Rental</Link></li>
                <li><Link href="/other-services/it-advisory">IT Advisory</Link></li>
                <li><Link href="/other-services/it-outsourcing">IT Outsourcing</Link></li>
                <li><Link href="/other-services/it-programming">IT Programming</Link></li>
              </ul>
            </li>
          </ul>
        </li>
        <li><Link href="/store">Store</Link></li>
        <li><Link href="/products">Product</Link></li>
        <li><Link href="/projects">Projects</Link></li>
        <li><Link href="/career">Career</Link></li>
      </ul>
      <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
    </nav>
  );
}


