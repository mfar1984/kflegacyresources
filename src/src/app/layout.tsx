import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import BodyClass from "@/components/BodyClass";
import SwiperInit from "@/components/SwiperInit";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://www.ansartechnologies.my'),
  title: {
    default: "ANSAR TECHNOLOGIES SDN. BHD. | Engineering Solutions Malaysia",
    template: "%s | ANSAR TECHNOLOGIES",
  },
  description:
    "ANSAR TECHNOLOGIES SDN. BHD. delivers Civil Engineering, Mechanical & Electrical Engineering, and ICT Engineering solutions in Malaysia.",
  keywords: [
    "ANSAR TECHNOLOGIES",
    "Engineering solutions Malaysia",
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "ICT Engineering",
    "Infrastructure development",
    "Construction engineering",
    "HVAC systems",
    "Power systems",
    "Network infrastructure",
    "Seri Kembangan",
    "Selangor Malaysia",
  ],
  alternates: { canonical: "https://www.ansartechnologies.my" },
  openGraph: {
    type: "website",
    url: "https://www.ansartechnologies.my",
    title: "ANSAR TECHNOLOGIES SDN. BHD. | Engineering Solutions Malaysia",
    description:
      "Leading engineering solutions provider in Malaysia. Civil, Mechanical & Electrical, and ICT Engineering services.",
    siteName: "ANSAR TECHNOLOGIES SDN. BHD.",
    images: [{ url: "/assets/img/hero-img.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ANSAR TECHNOLOGIES SDN. BHD. | Engineering Solutions Malaysia",
    description:
      "Leading engineering solutions provider in Malaysia. Civil, Mechanical & Electrical, and ICT Engineering services.",
    images: ["/assets/img/hero-img.png"],
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
    <html lang="en">
      <head>
        {/* Favicons */}
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
              name: 'ANSAR TECHNOLOGIES SDN. BHD.',
              url: 'https://www.ansartechnologies.my',
              logo: 'https://www.ansartechnologies.my/assets/img/logo.png',
              email: 'support@ansartechnologies.my',
              telephone: '+60389590530',
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  email: 'support@ansartechnologies.my',
                  telephone: '+60389590530',
                  areaServed: 'MY',
                  availableLanguage: ['en', 'ms'],
                },
              ],
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'B2-1-34, TINGKAT 1, JALAN PINGGIRAN 1/3, TAMAN PINGGIRAN PUTRA',
                addressLocality: 'Seri Kembangan',
                addressRegion: 'Selangor',
                postalCode: '43300',
                addressCountry: 'MY',
              },
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
              name: 'ANSAR TECHNOLOGIES SDN. BHD.',
              url: 'https://www.ansartechnologies.my',
              publisher: {
                '@type': 'Organization',
                name: 'ANSAR TECHNOLOGIES SDN. BHD.',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://www.ansartechnologies.my/assets/img/logo.png',
                },
              },
            }),
          }}
        />

        {/* Fonts */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&family=Jost:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet" />

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
      </body>
    </html>
  );
}

