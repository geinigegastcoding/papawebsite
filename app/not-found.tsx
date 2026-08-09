import type { Metadata } from "next";

import { ArrowIcon, Footer, Header, SiteImage } from "./site";

export const metadata: Metadata = {
  title: "Pagina niet gevonden | Magis Data Intelligence",
  description: "De opgevraagde pagina bestaat niet of is verplaatst.",
  alternates: null,
  openGraph: null,
  twitter: null,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="not-found" aria-labelledby="not-found-title">
          <SiteImage
            src="/images/magis-analysis-closeup.webp"
            alt=""
            className="not-found-image"
            aria-hidden="true"
            priority
          />
          <div className="site-container not-found-inner">
            <p className="not-found-code">404</p>
            <div data-reveal>
              <p className="eyebrow light">Geen signaal op deze locatie</p>
              <h1 id="not-found-title">Deze pagina geeft geen richting.</h1>
              <p>De link is mogelijk verouderd of het adres bevat een fout.</p>
              <a className="button button-paper" href="/">
                Terug naar de homepage <ArrowIcon />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
