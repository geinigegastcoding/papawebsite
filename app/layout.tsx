import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://magisintel.nl"),
  title: "Magis Data Intelligence | Gerhard Magis, PhD",
  description: "Data-analyse, managementinformatie en onderbouwd advies door Gerhard Magis, PhD.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="nl"><body><a className="skip-link gm-root-skip" href="#main-content">Ga naar de inhoud</a>{children}</body></html>;
}
