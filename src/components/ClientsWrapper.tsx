"use client";

import { usePathname } from "next/navigation";
import Clients from "@/components/Clients";

export default function ClientsWrapper() {
  const pathname = usePathname();
  
  // Hide clients slider on /products page only
  if (pathname === "/products") {
    return null;
  }
  
  return <Clients />;
}

