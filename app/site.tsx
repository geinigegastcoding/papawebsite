import type { ComponentPropsWithoutRef, ReactNode } from "react";

const imageDimensions: Record<string, { width: number; height: number }> = {
  "/images/gerhard-cutout.webp": { width: 820, height: 887 },
  "/images/gerhard-road.webp": { width: 1672, height: 345 },
  "/images/magis-mark.webp": { width: 256, height: 256 },
  "/images/experience-leiden.webp": { width: 310, height: 135 },
  "/images/experience-imc.webp": { width: 290, height: 105 },
  "/images/experience-achmea.webp": { width: 365, height: 110 },
  "/images/experience-zilveren-kruis.webp": { width: 330, height: 135 },
  "/images/experience-zorg-en-zekerheid.webp": { width: 335, height: 135 },
  "/icons/excel.svg": { width: 48, height: 48 },
  "/icons/file-type-csv.svg": { width: 24, height: 24 },
  "/icons/file-text.svg": { width: 24, height: 24 },
  "/icons/file-type-pdf.svg": { width: 24, height: 24 },
  "/icons/braces.svg": { width: 24, height: 24 },
  "/icons/database.svg": { width: 24, height: 24 },
  "/icons/chart-bar.svg": { width: 24, height: 24 },
  "/icons/cloud.svg": { width: 24, height: 24 },
  "/icons/circle-check.svg": { width: 24, height: 24 },
  "/icons/search.svg": { width: 24, height: 24 },
  "/icons/file-search.svg": { width: 24, height: 24 },
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

const fileIcons: Record<string, string> = {
  XLSX: "/icons/excel.svg",
  CSV: "/icons/file-type-csv.svg",
  JSON: "/icons/braces.svg",
  DATABASE: "/icons/database.svg",
  PDF: "/icons/file-type-pdf.svg",
  CRM: "/icons/cloud.svg",
  CHART: "/icons/chart-bar.svg",
};

export function FileIcon({ type }: { type: string }) {
  return <span className={`file-icon file-icon-${type.toLowerCase()}`}><SiteImage src={fileIcons[type] ?? "/icons/file-text.svg"} alt="" /></span>;
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
        <p>Realisatie door <a href="https://magisdata.nl">MagisData</a></p>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="page-hero" aria-labelledby="page-title">
      <div className="site-container page-hero-inner">
        <div className="page-hero-copy" data-reveal>
          <p className="eyebrow">{eyebrow}</p>
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
    <SiteImage className="logo-mark" src="/images/magis-mark.webp" alt="" />
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
