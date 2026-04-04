import Link from "next/link";

import { navLinks } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#050912]">
      <div className="container-wide grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <span className="eyebrow">Magis Data Intelligence</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-white">
            Van complexe data naar inzichten die je echt kunt gebruiken.
          </h2>
          <p className="max-w-xl text-white/70">
            Analytisch gedreven ondersteuning van Gerhard Magis voor organisaties die meer richting uit hun data willen halen.
          </p>
        </div>

        <div>
          <h3 className="font-heading text-lg font-semibold text-white">Navigatie</h3>
          <div className="mt-4 flex flex-col gap-3 text-white/70">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
            <a href="/admin" className="transition hover:text-white">
              CMS
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-heading text-lg font-semibold text-white">Contact</h3>
          <div className="mt-4 space-y-3 text-white/70">
            <p>Gerhard Magis</p>
            <p>doctor in de natuurkunde</p>
            <p>Analytisch, inhoudelijk sterk en prettig om mee samen te werken.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
