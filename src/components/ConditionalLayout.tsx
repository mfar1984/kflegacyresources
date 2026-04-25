"use client";

import { usePathname } from "next/navigation";
import Topbar from "@/components/Topbar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientsWrapper from "@/components/ClientsWrapper";
import FloatingContact from "@/components/FloatingContact";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header/footer for auth pages
  const isAuthPage = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Topbar />
      <Header />
      {children}
      <ClientsWrapper />
      <Footer />
      <FloatingContact />
    </>
  );
}

