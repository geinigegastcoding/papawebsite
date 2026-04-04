import Link from "next/link";

import { navLinks } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[rgba(4,10,18,0.72)] backdrop-blur-xl">
      <div className="container-wide flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-mint)] via-[var(--color-cyan)] to-white text-sm font-black text-[var(--color-ink)]">
            MD
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-base font-bold tracking-tight text-white">
              Magis Data Intelligence
            </span>
            <span className="text-sm text-white/55">Gerhard Magis</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-white/3 p-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/76 transition hover:bg-white/8 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/contact" className="button-primary">
          Plan een kennismaking
        </Link>
      </div>
    </header>
  );
}
