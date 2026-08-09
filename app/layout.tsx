import type { Metadata } from "next";
import "@fontsource/manrope/latin.css";
import "@fontsource/space-grotesk/latin.css";

import "./globals.css";
import { MotionSystem } from "./motion";

const siteUrl = "https://magisintel.nl";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Magis Data Intelligence",
      url: siteUrl,
      email: "jgmagis@hotmail.com",
      logo: `${siteUrl}/favicon.svg`,
      image: `${siteUrl}/images/magis-signal-hero.webp`,
      founder: { "@id": `${siteUrl}/#gerhard-magis` },
      areaServed: { "@type": "Country", name: "Nederland" },
      knowsAbout: [
        "Data-analyse",
        "Managementinformatie",
        "Business intelligence",
        "Strategisch advies",
      ],
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#gerhard-magis`,
      name: "Gerhard Magis",
      honorificSuffix: "PhD",
      jobTitle: "Senior Business Consultant en Data-analist",
      worksFor: { "@id": `${siteUrl}/#organization` },
      url: `${siteUrl}/over-mij`,
      sameAs: ["https://nl.linkedin.com/in/gerhard-magis-phd-5222943"],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Magis Data Intelligence | Van data naar richting",
  description:
    "Senior data-analyse, managementinformatie en strategisch advies door Gerhard Magis, PhD. Voor beslissingen die helder onderbouwd moeten zijn.",
  applicationName: "Magis Data Intelligence",
  authors: [{ name: "Gerhard Magis, PhD" }],
  creator: "Gerhard Magis, PhD",
  category: "Data-analyse en strategisch advies",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Magis Data Intelligence",
    title: "Magis Data Intelligence | Van data naar richting",
    description:
      "Complexe data vertaald naar managementinformatie, scherpe inzichten en keuzes die u kunt uitleggen.",
    url: "/",
    images: [
      {
        url: "/images/magis-signal-hero.webp",
        width: 1752,
        height: 898,
        alt: "Gerhard Magis werkt aan een data-analyse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Magis Data Intelligence | Van data naar richting",
    description: "Senior data-analyse en advies voor beter onderbouwde beslissingen.",
    images: ["/images/magis-signal-hero.webp"],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <a className="skip-link" href="#main-content">
          Ga naar de inhoud
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <MotionSystem />
        {children}
      </body>
    </html>
  );
}
