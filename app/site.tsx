import type { ReactNode } from "react";

export const navItems = [
  { label: "Diensten", href: "/diensten" },
  { label: "Werkwijze", href: "/werkwijze" },
  { label: "Expertise", href: "/expertise" },
  { label: "Over mij", href: "/over-mij" },
  { label: "Cases", href: "/cases" },
  { label: "Contact", href: "/contact" },
];

export const services = [
  {
    title: "Data-analyse",
    text: "Identificeren van patronen, trends en afwijkingen in bestaande data.",
    icon: "analysis",
  },
  {
    title: "Managementinformatie",
    text: "Ontwikkelen van heldere rapportages en dashboards voor betere sturing.",
    icon: "dashboard",
  },
  {
    title: "Strategisch advies",
    text: "Vertalen van inzichten naar concrete acties die passen bij organisatiedoelen.",
    icon: "target",
  },
  {
    title: "Betrouwbaar & onafhankelijk",
    text: "Flexibele ondersteuning met korte lijnen en een onafhankelijke blik.",
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
          <span>
            <strong>Magis</strong>
            <span>Data Intelligence</span>
          </span>
        </a>
        <nav className="nav-links" aria-label="Primaire navigatie">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="header-cta" href="/contact">
          Vrijblijvend kennismaken
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <p>Magis Data Intelligence</p>
        <p>Data-analyse, managementinformatie en strategisch advies.</p>
      </div>
    </footer>
  );
}

export function PageHero({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="page-hero" aria-labelledby="page-title">
      <div className="site-container page-hero-inner">
        <p className="section-kicker">{eyebrow}</p>
        <h1 id="page-title">{title}</h1>
        <p>{text}</p>
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
      <main>
        <PageHero eyebrow={eyebrow} title={title} text={text} />
        {children}
      </main>
      <Footer />
    </>
  );
}

export function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="section-header">
      <p className="section-kicker dark">{eyebrow}</p>
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
    <article className="info-card">
      <Icon name={icon} />
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>
          <CheckIcon />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Credential({ children }: { children: ReactNode }) {
  return (
    <div className="credential-item">
      <CheckIcon />
      <span>{children}</span>
    </div>
  );
}

export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M7 39V9l17 17L41 9v30" />
      <path d="M15 39V24l9 9 9-9v15" />
    </svg>
  );
}

export function Icon({ name }: { name: string }) {
  if (name === "dashboard") {
    return (
      <svg className="line-icon" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 39h32M12 34V14M22 34V20M32 34V10M40 34V24" />
        <path d="M11 25l8-7 8 5 11-12" />
      </svg>
    );
  }

  if (name === "target") {
    return (
      <svg className="line-icon" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="23" cy="25" r="15" />
        <circle cx="23" cy="25" r="8" />
        <path d="M29 19l10-10M34 9h5v5" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg className="line-icon" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 6l16 6v11c0 10-7 16-16 20C15 39 8 33 8 23V12l16-6z" />
        <path d="M16 24l5 5 11-12" />
      </svg>
    );
  }

  return (
    <svg className="line-icon" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="20" cy="20" r="12" />
      <path d="M29 29l11 11M15 25V15M21 25v-7M27 25V12" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className="check-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
