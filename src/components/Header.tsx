"use client";

import Link from "next/link";
import Menu from "@/components/Menu";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid container-xl position-relative d-flex align-items-center">
        <Link href="/" className="logo d-flex align-items-center me-auto">
          <img src="/assets/img/logo.png" alt="KF Legacy Resources" />
        </Link>
        <Menu />
        {totalItems > 0 && (
          <Link href="/cart" className="position-relative me-3" style={{ fontSize: "16px", color: "#ffffff" }}>
            <i className="bi bi-cart3"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "10px" }}>
              {totalItems}
            </span>
          </Link>
        )}
        <Link className="btn-getstarted" href="/request-quotation">Request Quotation</Link>
      </div>
    </header>
  );
}


