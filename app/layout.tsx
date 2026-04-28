import type { Metadata } from "next";
import "@fontsource/manrope/latin.css";
import "@fontsource/space-grotesk/latin.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Magis Data Intelligence | Van data naar slimme beslissingen",
  description:
    "Data-analyse, managementinformatie, dashboards en strategisch advies door Gerhard Magis, PhD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
