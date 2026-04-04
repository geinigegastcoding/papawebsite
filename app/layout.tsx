import type { Metadata } from "next";
import "@fontsource/manrope/latin.css";
import "@fontsource/space-grotesk/latin.css";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://magis-data-intelligence.nl"),
  title: {
    default: "Magis Data Intelligence",
    template: "%s | Magis Data Intelligence",
  },
  description:
    "Data-analyse en informatievoorziening door Gerhard Magis. Van rauwe data naar heldere sturing, dashboards en strategische inzichten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="bg-[var(--color-ink)] text-white antialiased">{children}</body>
    </html>
  );
}
