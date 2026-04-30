"use client";

import { usePathname } from "next/navigation";
import Topbar from "./Topbar";
import Header from "./Header";
import Footer from "./Footer";
import FloatingHelp from "./FloatingHelp";
import Clients from "./Clients";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideLayout = pathname?.startsWith("/admin") || pathname?.startsWith("/auth");

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Topbar />
      <Header />
      {children}
      <Clients />
      <Footer />
      <FloatingHelp />
    </>
  );
}

