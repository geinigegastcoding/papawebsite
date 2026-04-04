import Image from "next/image";

import { ContactForm } from "@/components/contact-form";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contactHighlights, faqItems } from "@/lib/site";

const fallbackEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "gerhard@magisdataintelligence.nl";

export default function ContactPage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="border-b border-white/8 py-16 md:py-24">
          <div className="container-wide grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <span className="eyebrow">Contact</span>
              <h1 className="font-heading mt-6 text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-white md:text-7xl">
                Bespreek je data-uitdaging rechtstreeks met Gerhard Magis.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                Of je nu behoefte hebt aan een scherpe analyse, betere stuurinformatie of tijdelijke
                inhoudelijke versterking: een eerste gesprek is vaak genoeg om richting te krijgen.
              </p>
              <div className="mt-8 grid gap-4">
                {contactHighlights.map((item) => (
                  <article
                    key={item.title}
                    className="glass-panel rounded-[1.7rem] border border-white/8 px-5 py-5"
                  >
                    <h2 className="font-heading text-2xl font-semibold text-white">{item.title}</h2>
                    <p className="mt-3 text-base leading-8 text-white/72">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2.2rem] border border-white/8">
              <Image
                src="/images/collaboration.jpg"
                alt="Illustratie van samenwerken met dashboards en data"
                width={1400}
                height={900}
                className="h-full min-h-[320px] w-full object-cover"
                priority
              />
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-paper)] py-20 md:py-28">
          <div className="container-wide light-copy grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <SectionHeading
                eyebrow="Stuur een bericht"
                title="Vertel kort waar je organisatie mee worstelt of op wil versnellen."
                description="Het formulier hieronder opent je eigen e-mailprogramma met een voorgesteld bericht. Wil je liever direct mailen, gebruik dan het adres dat je hieronder ziet of vervang dit in de omgevingsvariabelen."
              />
              <div className="mt-8">
                <ContactForm contactEmail={fallbackEmail} />
              </div>
            </div>

            <div className="space-y-5">
              <div className="overflow-hidden rounded-[2rem] border border-[#13213f]/8 bg-white">
                <Image
                  src="/images/launch.jpg"
                  alt="Illustratie van versnelling en groei"
                  width={1400}
                  height={900}
                  className="h-[260px] w-full object-cover md:h-[320px]"
                />
              </div>

              <div className="paper-panel rounded-[2rem] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1d72f2]">
                  Handig om mee te sturen
                </p>
                <ul className="mt-5 space-y-4 text-base leading-8 text-[#53658f]">
                  <li>de vraag die op dit moment speelt;</li>
                  <li>voor wie het inzicht bedoeld is;</li>
                  <li>welke data of rapportages nu al beschikbaar zijn;</li>
                  <li>de gewenste timing of vorm van samenwerking.</li>
                </ul>
              </div>

              <div className="grid gap-4">
                {faqItems.slice(2).map((faq) => (
                  <article
                    key={faq.question}
                    className="rounded-[1.7rem] border border-[#13213f]/8 bg-white px-5 py-5 shadow-[0_18px_40px_rgba(20,37,78,0.08)]"
                  >
                    <h2 className="font-heading text-xl font-semibold text-[#13213f]">{faq.question}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#53658f]">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
