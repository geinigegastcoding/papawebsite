import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="flex min-h-[70vh] items-center py-20">
        <div className="container-wide">
          <div className="glass-panel rounded-[2.2rem] p-8 md:p-12">
            <span className="eyebrow">Niet gevonden</span>
            <h1 className="font-heading mt-6 text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl">
              Deze pagina bestaat niet of is verplaatst.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/76">
              Ga terug naar de homepage of bekijk de blogartikelen om verder te lezen.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/" className="button-primary">
                Naar home
              </Link>
              <Link href="/blog" className="button-secondary">
                Naar blog
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
