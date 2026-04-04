import Image from "next/image";
import Link from "next/link";

import { AnalysisIcon, DashboardIcon, StrategyIcon } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { formatDutchDate, getFeaturedPosts } from "@/lib/blog";
import {
  capabilityBlocks,
  faqItems,
  focusAreas,
  heroStats,
  projectFlow,
  serviceCards,
} from "@/lib/site";

const icons = [AnalysisIcon, DashboardIcon, StrategyIcon];

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts(3);

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-white/8 pb-16 pt-10 md:pb-24">
          <div className="hero-ambient one" />
          <div className="hero-ambient two" />
          <div className="container-wide grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div className="relative">
              <span className="eyebrow">Data-analyse en stuurinformatie</span>
              <h1 className="font-heading mt-6 max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-white md:text-7xl">
                Magis Data Intelligence brengt rust, structuur en richting in complexe data.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[rgba(214,224,246,0.82)]">
                Gerhard Magis is doctor in de natuurkunde, analytisch gedreven en in staat om rauwe
                data om te zetten naar nuttige informatie. Van jongs af aan analytisch gedreven, met
                aantoonbare ervaring in het oplossen van complexe vraagstukken.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/contact" className="button-primary">
                  Plan een kennismaking
                </Link>
                <Link href="/blog" className="button-secondary">
                  Lees het blog
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="glass-panel stat-card rounded-[1.8rem] p-5">
                    <strong>{stat.value}</strong>
                    <span className="mt-2 block text-sm leading-6">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="glass-panel grid-lines rounded-[2.2rem] p-4 md:p-6">
                <div className="overflow-hidden rounded-[1.6rem] border border-white/8">
                  <Image
                    src="/images/workspace.jpg"
                    alt="Dashboards en analyses op meerdere schermen"
                    width={1200}
                    height={800}
                    className="h-[240px] w-full object-cover md:h-[310px]"
                    priority
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-mint)]">
                      Analysefocus
                    </p>
                    <p className="mt-3 font-heading text-3xl font-semibold tracking-[-0.05em]">
                      Van ruwe input naar stuurbare inzichten
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      Ik combineer analytische diepgang met begrijpelijke output, zodat data ook
                      werkelijk gebruikt wordt in keuzes en gesprekken.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <div className="rounded-[1.5rem] border border-[var(--color-mint)]/18 bg-[rgba(94,240,196,0.08)] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--color-mint)]">
                          Dashboardkwaliteit
                        </span>
                        <span className="text-sm text-white/70">KPI, context en actie</span>
                      </div>
                      <div className="mt-5 flex h-24 items-end gap-3">
                        {[38, 65, 52, 84, 72, 92].map((height, index) => (
                          <div
                            key={height}
                            className={`flex-1 rounded-t-2xl bg-gradient-to-t ${
                              index % 2 === 0
                                ? "from-[var(--color-cyan)]/30 to-[var(--color-cyan)]"
                                : "from-[var(--color-mint)]/25 to-[var(--color-mint)]"
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Werkwijze</p>
                        <p className="mt-2 font-heading text-xl font-semibold">Scherp op inhoud</p>
                        <p className="mt-2 text-sm leading-6 text-white/68">
                          Analyse met logica, definities en context als basis.
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Resultaat</p>
                        <p className="mt-2 font-heading text-xl font-semibold">Bruikbare informatie</p>
                        <p className="mt-2 text-sm leading-6 text-white/68">
                          Inzichten die besluitvorming ondersteunen in plaats van vertragen.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="float-soft absolute -bottom-8 -left-6 hidden rounded-[1.5rem] border border-white/10 bg-[#091425]/90 px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.3)] md:block">
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">
                  Positionering
                </span>
                <p className="mt-2 font-heading text-xl font-semibold text-white">
                  Consultant met inhoudelijke diepte
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container-wide">
            <SectionHeading
              eyebrow="Diensten"
              title="Gericht op analyses en informatie die beweging creëren."
              description="De site is opgezet als een scherpe portfolio- en contactpresentatie: inhoudelijk stevig, persoonlijk van toon en duidelijk over waar de toegevoegde waarde zit."
            />

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {serviceCards.map((service, index) => {
                const Icon = icons[index];

                return (
                  <article key={service.title} className="glass-panel card-hover rounded-[2rem] p-6">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white/6 text-[var(--color-mint)]">
                      <Icon className="size-7" />
                    </div>
                    <h3 className="font-heading mt-6 text-2xl font-semibold text-white">
                      {service.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-white/72">{service.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-paper)] py-20 text-[#13213f] md:py-28">
          <div className="container-wide light-copy grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-start">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Expertise"
                title="Sterk in inhoud, structuur en het vertalen van complexiteit."
                description="De vormgeving leunt op een mix van high-end tech, consultancy en portfolio: donkere hero, lichte inzichten-secties en visuele ritmes die vertrouwen uitstralen."
              />
              <div className="space-y-4">
                {capabilityBlocks.map((item) => (
                  <article
                    key={item.number}
                    className="paper-panel card-hover rounded-[1.7rem] border border-[#13213f]/8 px-5 py-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1d72f2]">
                      {item.number}
                    </p>
                    <h3 className="font-heading mt-3 text-2xl font-semibold text-[#13213f]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-8 text-[#53658f]">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              <div className="overflow-hidden rounded-[2rem] border border-[#13213f]/8 bg-white">
                <Image
                  src="/images/data-matrix.jpg"
                  alt="Abstracte datamatrix"
                  width={1400}
                  height={900}
                  className="h-[280px] w-full object-cover md:h-[360px]"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {focusAreas.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[1.7rem] border border-[#13213f]/8 bg-white px-5 py-5 shadow-[0_18px_48px_rgba(20,37,78,0.08)]"
                  >
                    <h3 className="font-heading text-xl font-semibold text-[#13213f]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#53658f]">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container-wide grid gap-12 md:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionHeading
                eyebrow="Aanpak"
                title="Praktisch samenwerken zonder onnodige complexiteit."
                description="Kort op de inhoud, helder in communicatie en altijd gericht op een resultaat dat door anderen verder gebruikt kan worden."
              />
              <div className="mt-8 space-y-4">
                {projectFlow.map((step) => (
                  <article
                    key={step.title}
                    className="glass-panel card-hover rounded-[1.8rem] border border-white/8 px-6 py-6"
                  >
                    <h3 className="font-heading text-2xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-3 text-base leading-8 text-white/72">{step.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="overflow-hidden rounded-[2rem] border border-white/8">
                <Image
                  src="/images/analytics-report.jpg"
                  alt="Close-up van scherm met grafieken en rapportage"
                  width={1400}
                  height={900}
                  className="h-[270px] w-full object-cover md:h-[350px]"
                />
              </div>
              <div className="glass-panel rounded-[2rem] p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-gold)]">
                  Voor organisaties die
                </p>
                <ul className="mt-5 space-y-4 text-base leading-8 text-white/74">
                  <li>meer richting willen geven aan bestaande data en rapportages;</li>
                  <li>een analytisch sparringpartner nodig hebben voor complexe vragen;</li>
                  <li>informatievoorziening willen verbeteren zonder extra managementlagen.</li>
                </ul>
              </div>
              <div className="divider-line" />
              <div className="grid gap-4 sm:grid-cols-2">
                {faqItems.slice(0, 2).map((faq) => (
                  <article
                    key={faq.question}
                    className="rounded-[1.6rem] border border-white/8 bg-white/3 px-5 py-5"
                  >
                    <h3 className="font-heading text-xl font-semibold text-white">{faq.question}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-paper)] py-20 md:py-28">
          <div className="container-wide light-copy">
            <SectionHeading
              eyebrow="Ervaringen"
              title="Aanbevelingen van mensen die direct met Gerhard hebben samengewerkt."
              description="De carousel hieronder vertaalt de inhoud van de aangeleverde aanbevelingen naar een rustige, portfolio-achtige presentatielaag zonder de afbeelding zelf te gebruiken."
            />
            <div className="mt-10">
              <TestimonialCarousel />
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container-wide">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Blog"
                title="Inzichten, praktijkvoorbeelden en gedachten over data-intelligentie."
                description="De blog is ingericht voor Decap CMS, zodat nieuwe artikelen eenvoudig toegevoegd en beheerd kunnen worden."
              />
              <Link href="/blog" className="button-secondary">
                Bekijk alle artikelen
              </Link>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {featuredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="glass-panel card-hover overflow-hidden rounded-[2rem] border border-white/8"
                >
                  <div className="overflow-hidden">
                    <Image
                      src={post.cover}
                      alt={post.title}
                      width={900}
                      height={600}
                      className="h-52 w-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-mint)]">
                      {formatDutchDate(post.date)}
                    </p>
                    <h3 className="font-heading mt-4 text-2xl font-semibold text-white">
                      {post.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-white/72">{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex font-semibold text-[var(--color-cyan)]">
                      Lees artikel
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="container-wide">
            <div className="overflow-hidden rounded-[2.6rem] border border-white/8 bg-gradient-to-br from-[rgba(84,199,255,0.18)] via-[rgba(11,20,36,0.92)] to-[rgba(94,240,196,0.14)] px-6 py-10 md:px-10 md:py-12">
              <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
                <div>
                  <span className="eyebrow">Contact</span>
                  <h2 className="font-heading mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                    Een vraagstuk rond data, dashboards of informatievoorziening?
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-white/76">
                    Laten we kennismaken. Je krijgt rechtstreeks contact met Gerhard Magis en een
                    inhoudelijke eerste reactie zonder verkooppraatjes.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 md:justify-end">
                  <Link href="/contact" className="button-primary">
                    Naar contactpagina
                  </Link>
                  <a href="/admin" className="button-secondary">
                    Open CMS
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
