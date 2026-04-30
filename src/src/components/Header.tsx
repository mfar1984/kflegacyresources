"use client";

import Link from "next/link";
import Image from "next/image";
import Menu from "@/components/Menu";

export default function Header() {
  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid container-xl position-relative d-flex align-items-center">
        <Link href="/" className="logo d-flex align-items-center me-auto">
          <Image src="/assets/img/logo.png" alt="ANSAR TECHNOLOGIES SDN. BHD." width={100} height={48} priority />
        </Link>
        <Menu />
        <Link className="btn-getstarted" href="/contact">Contact Us</Link>
      </div>
    </header>
  );
}

