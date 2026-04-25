import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | KF Legacy Resources",
  description: "Secure admin login for KF Legacy Resources",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

