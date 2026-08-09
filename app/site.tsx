import type { ComponentPropsWithoutRef, ReactNode } from "react";

const imageDimensions: Record<string, { width: number; height: number }> = {
  "/images/gerhard-dashboard.webp": { width: 1600, height: 1000 },
  "/images/gerhard-portrait.webp": { width: 512, height: 512 },
  "/images/magis-analysis-closeup.webp": { width: 1536, height: 1024 },
  "/images/magis-signal-hero.webp": { width: 1752, height: 898 },
  "/images/magis-work-session.webp": { width: 1752, height: 898 },
};

type SiteImageProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "src" | "alt" | "width" | "height" | "loading" | "decoding" | "fetchPriority"
> & {
  src: string;
  alt: string;
  priority?: boolean;
};

export function SiteImage({ src, alt, priority = false, ...props }: SiteImageProps) {
  const dimensions = imageDimensions[src];

  if (!dimensions) {
    throw new Error(`Missing intrinsic dimensions for image: ${src}`);
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

export const navItems = [
  { label: "Diensten", href: "/diensten" },
  { label: "Werkwijze", href: "/werkwijze" },
  { label: "Expertise", href: "/expertise" },
  { label: "Cases", href: "/cases" },
  { label: "Over mij", href: "/over-mij" },
  { label: "Contact", href: "/contact" },
];

export const services = [
  {
    title: "Data-analyse",
    text: "Patronen, oorzaken en afwijkingen vinden die een beslissing werkelijk veranderen.",
    icon: "analysis",
  },
  {
    title: "Managementinformatie",
    text: "Rapportages en dashboards die een gesprek sturen in plaats van alleen cijfers tonen.",
    icon: "dashboard",
  },
  {
    title: "Strategisch advies",
    text: "Inzichten vertalen naar keuzes, prioriteiten en een uitvoerbare volgende stap.",
    icon: "target",
  },
  {
    title: "Onafhankelijke blik",
    text: "Senior ondersteuning zonder voorkeur voor een tool, platform of vooraf bedachte uitkomst.",
    icon: "shield",
  },
];

export const credentials = [
  "Senior Business Consultant / Data Analist",
  "PhD Natuurkunde, Universiteit Leiden",
  "Ervaring in zorg, verzekeringen, overheid en zakelijke dienstverlening",
  "SAS Certified Base Programmer for SAS 9",
];

export const expertise = [
  "Data-analyse en statistiek",
  "Business intelligence en dashboards",
  "Beleidsanalyse en besluitvorming",
  "Risico- en kansenidentificatie",
  "Proces- en prestatieanalyse",
  "Data naar managementinformatie",
];

const pageVisuals: Record<string, { src: string; alt: string; index: string }> = {
  Diensten: {
    src: "/images/magis-analysis-closeup.webp",
    alt: "Analysebladen met een duidelijke blauwe trendlijn",
    index: "01",
  },
  Werkwijze: {
    src: "/images/magis-work-session.webp",
    alt: "Gerhard Magis bespreekt een analyse tijdens een werksessie",
    index: "02",
  },
  Expertise: {
    src: "/images/magis-analysis-closeup.webp",
    alt: "Gelaagde analyse op papier",
    index: "03",
  },
  "Over mij": {
    src: "/images/magis-signal-hero.webp",
    alt: "Gerhard Magis aan het werk met data en rapportages",
    index: "04",
  },
  Cases: {
    src: "/images/magis-analysis-closeup.webp",
    alt: "Datapatronen teruggebracht tot een heldere lijn",
    index: "05",
  },
  Contact: {
    src: "/images/magis-work-session.webp",
    alt: "Inhoudelijk gesprek over data en besluitvorming",
    index: "06",
  },
  Privacy: {
    src: "/images/magis-analysis-closeup.webp",
    alt: "Zorgvuldige analyse van informatie",
    index: "07",
  },
};

export function Header() {
  return (
    <header className="site-header" aria-label="Hoofdnavigatie">
      <div className="site-container header-inner">
        <a className="brand" href="/" aria-label="Magis Data Intelligence home">
          <LogoMark />
          <span className="brand-copy">
            <strong>Magis</strong>
            <span>Data Intelligence</span>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primaire navigatie">
          {navItems.slice(0, -1).map((item) => (
            <a key={item.href} href={item.href} data-nav-link>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="header-action" href="/contact">
          Bespreek uw vraag
          <ArrowIcon />
        </a>

        <details className="mobile-menu">
          <summary aria-label="Menu openen">
            <span />
            <span />
          </summary>
          <div className="mobile-menu-panel">
            <nav className="mobile-nav" aria-label="Mobiele navigatie">
              {navItems.map((item, index) => (
                <a key={item.href} href={item.href} data-nav-link>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                  <ArrowIcon />
                </a>
              ))}
            </nav>
            <p>Data naar beslissingen. Rust in cijfers. Richting in keuzes.</p>
          </div>
        </details>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-lead" data-reveal>
        <div>
          <p className="eyebrow light">Magis Data Intelligence</p>
          <h2>Een scherpe vraag is een goed begin.</h2>
        </div>
        <a className="text-link text-link-light" href="/contact">
          Bespreek uw vraag <ArrowIcon />
        </a>
      </div>

      <div className="site-container footer-grid">
        <div className="footer-signature">
          <a className="brand" href="/" aria-label="Magis Data Intelligence home">
            <LogoMark />
            <span className="brand-copy">
              <strong>Magis</strong>
              <span>Data Intelligence</span>
            </span>
          </a>
          <p>Senior data-analyse en advies door Gerhard Magis, PhD.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigatie">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="footer-contact">
          <p className="eyebrow light">Direct contact</p>
          <a href="mailto:jgmagis@hotmail.com">jgmagis@hotmail.com</a>
          <p>Nederland · opdrachten op locatie en op afstand</p>
        </div>
      </div>

      <div className="site-container footer-bottom">
        <p>© 2026 Magis Data Intelligence</p>
        <a href="/privacy">Privacy</a>
        <p>Van data naar richting.</p>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  const visual = pageVisuals[eyebrow] ?? pageVisuals.Expertise;

  return (
    <section className="page-hero" aria-labelledby="page-title">
      <SiteImage className="page-hero-image" src={visual.src} alt={visual.alt} priority />
      <div className="page-hero-shade" aria-hidden="true" />
      <div className="site-container page-hero-inner">
        <p className="page-index" aria-hidden="true">
          {visual.index} / 07
        </p>
        <div className="page-hero-copy" data-reveal>
          <p className="eyebrow light">{eyebrow}</p>
          <h1 id="page-title">{title}</h1>
          <p>{text}</p>
        </div>
      </div>
    </section>
  );
}

export function PageShell({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content">
        <PageHero eyebrow={eyebrow} title={title} text={text} />
        {children}
      </main>
      <Footer />
    </>
  );
}

export function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="section-header" data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export function InfoCard({
  title,
  text,
  icon = "analysis",
}: {
  title: string;
  text: string;
  icon?: string;
}) {
  return (
    <article className="info-card" data-reveal>
      <Icon name={icon} />
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <span className="info-card-arrow" aria-hidden="true">
        ↗
      </span>
    </article>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((item, index) => (
        <li key={item} data-reveal>
          <span className="check-number">{String(index + 1).padStart(2, "0")}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Credential({ children }: { children: ReactNode }) {
  return (
    <div className="credential-item" data-reveal>
      <SignalDot />
      <span>{children}</span>
    </div>
  );
}

export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 56 56" aria-hidden="true">
      <rect x="1" y="1" width="54" height="54" rx="2" />
      <path d="M11 38V18l17 13 17-13v20" />
      <path className="logo-signal" d="M11 28h7l4-8 7 17 5-10h11" />
      <circle cx="45" cy="27" r="2" />
    </svg>
  );
}

export function Icon({ name }: { name: string }) {
  if (name === "dashboard") {
    return (
      <svg className="line-icon" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M6 39h36M10 33V21m9 12V13m10 20V25m9 8V8" />
        <path d="m8 19 9-7 9 8L40 6" />
      </svg>
    );
  }

  if (name === "target") {
    return (
      <svg className="line-icon" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="23" cy="25" r="15" />
        <circle cx="23" cy="25" r="6" />
        <path d="m28 20 12-12m-7 0h7v7" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg className="line-icon" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 35h9l6-22 7 29 5-18h7" />
        <circle cx="8" cy="35" r="2" />
        <circle cx="42" cy="24" r="2" />
      </svg>
    );
  }

  return (
    <svg className="line-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M7 37 17 24l8 6L40 10" />
      <circle cx="7" cy="37" r="3" />
      <circle cx="17" cy="24" r="3" />
      <circle cx="25" cy="30" r="3" />
      <circle cx="40" cy="10" r="3" />
    </svg>
  );
}

export function SignalDot() {
  return (
    <svg className="signal-dot" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className="check-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 13h5l3-7 4 12 4-8" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}
