import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import BodyClass from "@/components/BodyClass";
import SwiperInit from "@/components/SwiperInit";
import ConditionalLayout from "@/components/ConditionalLayout";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://www.kflegacyresources.com'),
  title: {
    default: "KF Legacy Resources | pfSense Malaysia Partner & Network Security",
    template: "%s | KF Legacy Resources",
  },
  other: {
    'Content-Security-Policy': "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://www.google.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com data:;",
  },
  description:
    "pfSense Malaysia partner. KF Legacy Resources delivers network infrastructure, security, system & storage, and barcode/RFID solutions.",
  keywords: [
    "KF Legacy Resources",
    "pfSense Malaysia",
    "pfSense partner Malaysia",
    "Netgate partner Malaysia",
    "IT solutions Malaysia",
    "network infrastructure",
    "network management",
    "bandwidth management",
    "security solutions",
    "surveillance",
    "SPA",
    "system and storage",
    "SAN NAS",
    "virtualization",
    "barcode RFID",
    "Cheras Kuala Lumpur",
  ],
  alternates: { canonical: "https://www.kflegacyresources.com" },
  openGraph: {
    type: "website",
    url: "https://www.kflegacyresources.com",
    title: "KF Legacy Resources | pfSense Malaysia Partner & Network Security",
    description:
      "Official pfSense (Netgate) partner in Malaysia. Network design & management, security, SPA & surveillance, system & storage, barcode/RFID.",
    siteName: "KF Legacy Resources",
    images: [{ url: "/assets/img/hero-product.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KF Legacy Resources | pfSense Malaysia Partner & Network Security",
    description:
      "Official pfSense (Netgate) partner in Malaysia. Network, security, system & storage solutions.",
    images: ["/assets/img/hero-product.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/assets/img/logo.png", type: "image/png" }],
    apple: [{ url: "/assets/img/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Favicons - use company logo */}
        <link rel="icon" href="/assets/img/logo.png" />
        <link rel="apple-touch-icon" href="/assets/img/logo.png" />

        {/* Schema.org JSON-LD */}
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'KF Legacy Resources',
              url: 'https://www.kflegacyresources.com',
              logo: 'https://www.kflegacyresources.com/assets/img/logo.png',
              email: 'enquiry@kflegacyresources.com',
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  email: 'enquiry@kflegacyresources.com',
                  areaServed: 'MY',
                  availableLanguage: ['en', 'ms'],
                },
              ],
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'SUITE: 33-01, 33RD FLOOR, MENARA KECK SENG 203 JALAN BUKIT BINTANG , 55100 KUALA LUMPUR, WILAYAH PERSEKUTUAN',
                addressLocality: 'Cheras',
                addressRegion: 'Kuala Lumpur',
                postalCode: '56100',
                addressCountry: 'MY',
              },
              sameAs: ['https://www.facebook.com/kflr2015/'],
            }),
          }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'KF Legacy Resources',
              url: 'https://www.kflegacyresources.com',
              publisher: {
                '@type': 'Organization',
                name: 'KF Legacy Resources',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://www.kflegacyresources.com/assets/img/logo.png',
                },
              },
            }),
          }}
        />

        {/* Fonts */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&family=Jost:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet" />
        
        {/* Material Symbols for Admin Dashboard */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

        {/* Vendor CSS */}
        <link href="/assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet" />
        <link href="/assets/vendor/aos/aos.css" rel="stylesheet" />
        <link href="/assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet" />
        <link href="/assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet" />

        {/* Main CSS */}
        <link href="/assets/css/main.css" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <BodyClass />
          <SwiperInit />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>

          {/* Vendor JS */}
          <Script src="/assets/vendor/bootstrap/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
          <Script src="/assets/vendor/aos/aos.js" strategy="beforeInteractive" />
          <Script id="init-aos" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: "window.AOS&&AOS.init({duration:600,easing:'ease-in-out',once:true,mirror:false});"
          }} />
          <Script src="/assets/vendor/glightbox/js/glightbox.min.js" strategy="afterInteractive" />
          <Script src="/assets/vendor/swiper/swiper-bundle.min.js" strategy="afterInteractive" />
          <Script src="/assets/vendor/imagesloaded/imagesloaded.pkgd.min.js" strategy="afterInteractive" />
          <Script src="/assets/vendor/isotope-layout/isotope.pkgd.min.js" strategy="afterInteractive" />
          <Script src="/assets/vendor/waypoints/noframework.waypoints.js" strategy="afterInteractive" />
          <Script src="/assets/js/main.js" strategy="afterInteractive" />
        </CartProvider>
      </body>
    </html>
  );
}
