import type { Metadata } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import { DataExample, MobileMenu, RevealEffects } from "./gerhard-interactions";
import "./gerhard-site.css";

const email = "contact@magisintel.nl";
const mailto = `mailto:${email}?subject=${encodeURIComponent("Kennismaken met Gerhard Magis")}`;
const gerhardFont = localFont({ src: "../public/fonts/manrope-latin-variable.woff2", display: "swap", weight: "400 800", variable: "--font-gerhard" });

export function gerhardMetadata(title: string, description: string, path = "/"): Metadata {
  return {
    metadataBase: new URL("https://magisintel.nl"),
    title: { absolute: title }, description, alternates: { canonical: path },
    openGraph: { type: "website", locale: "nl_NL", siteName: "Magis Data Intelligence", title, description, url: path, images: [{ url: "/images/gerhard-social-orange.jpg", width: 1200, height: 630, alt: "Gerhard Magis, PhD. Minder giswerk. Meer grip." }] },
    twitter: { card: "summary_large_image", title, description, images: ["/images/gerhard-social-orange.jpg"] },
  };
}

function Brand() {
  return <a href="/" className="gm-brand" aria-label="Magis Data Intelligence, naar de homepage"><span>magis<span className="gm-brand-period">.</span></span><small>data intelligence</small></a>;
}

function Header() {
  return <header className="gm-header gm-container"><Brand /><nav className="gm-desktop-nav" aria-label="Hoofdnavigatie"><a href="/diensten">Diensten</a><a href="/werkwijze">Werkwijze</a><a href="/over-mij">Over Gerhard</a></nav><a className="gm-button gm-button-small gm-nav-cta" href="/contact">Kennismaken <span aria-hidden="true">↗</span></a><MobileMenu /></header>;
}

function Footer() {
  return <footer className="gm-footer gm-container"><div className="gm-footer-main"><Brand /><p>Heldere inzichten.<br />Menselijke samenwerking.</p><nav aria-label="Footernavigatie"><a href="/diensten">Diensten</a><a href="/expertise">Expertise</a><a href="/cases">Praktijkervaring</a><a href="/werkwijze">Werkwijze</a><a href="/over-mij">Over Gerhard</a><a href="/contact">Contact</a></nav></div><div className="gm-footer-bottom"><span>© {new Date().getFullYear()} Magis Data Intelligence</span><span>Ook kennismaken met <a href="https://magisdata.nl" target="_blank" rel="noopener noreferrer">MagisData <span aria-hidden="true">↗</span></a></span><a href="/privacy">Privacy</a></div></footer>;
}

function Contact({ full = false }: { full?: boolean }) {
  return <section id="contact" className={`gm-contact${full ? " gm-contact-full" : ""}`} data-gm-reveal><div className="gm-container"><span className="gm-small-label">Een goed gesprek is een goed begin.</span><h2>Jouw data heeft<br />iets te vertellen<span>.</span></h2><div className="gm-contact-bottom"><p>Een concrete vraag of nog een berg losse cijfers?<br />Vertel me waar je tegenaan loopt.</p><div><a href={mailto} className="gm-button">Kennismaken <span aria-hidden="true">↗</span></a><a className="gm-contact-email" href={`mailto:${email}`}>{email}</a><small>Opent je mailprogramma.</small></div></div></div></section>;
}

const services = [
  { label: "Analyse", title: "Data die je verder helpt.", text: "Ik onderzoek je data, leg verbanden en maak zichtbaar waar kansen en risico’s zitten. Altijd vanuit de vraag die je wilt beantwoorden.", tags: ["Data-analyse", "Statistiek", "SAS, SQL & VBA"] },
  { label: "Inzicht", title: "Informatie om op te sturen.", text: "Van losse databronnen naar begrijpelijke managementinformatie, benchmarks en rapportages. Zodat jij en je team weten wat aandacht verdient.", tags: ["Managementinformatie", "Benchmarks", "Rapportages"] },
  { label: "Advies", title: "Beleid met onderbouwing.", text: "Ik verbind analyse met besluitvorming. Denk aan zorginkoop, kostenontwikkeling, scenario’s en het cijfermatig onderbouwen van beleidskeuzes.", tags: ["Risicoanalyse", "Zorginkoop", "Scenario’s"] },
  { label: "Overdracht", title: "Een team dat zelf verder kan.", text: "Ik neem je team mee in de analyse en draag kennis over. Met begeleiding in statistiek, SAS en het stellen van de juiste vragen.", tags: ["Coaching", "Kennisoverdracht", "Analysevaardigheden"] },
];

function Services() {
  return <section id="diensten" className="gm-services gm-container gm-section" data-gm-reveal><h2>Complexe data.<br /><span className="gm-muted">Heldere antwoorden.</span></h2><div className="gm-service-list">{services.map((service, index) => <details key={service.label} name="gerhard-services" open={index === 0}><summary><span className="gm-service-label">{service.label}</span><h3>{service.title}</h3><span className="gm-service-plus" aria-hidden="true">+</span></summary><div className="gm-service-body"><p>{service.text}</p><div className="gm-tags">{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></details>)}</div></section>;
}

function Credentials() {
  return <div className="gm-credentials gm-container" aria-label="Achtergrond van Gerhard"><div><strong>PhD</strong><span>Natuurkunde, Universiteit Leiden</span></div><div><strong>Sinds 2010</strong><span>Data-analyse in de zorg</span></div><div><strong>Sinds 2014</strong><span>Magis Data Intelligence</span></div><div><strong>SAS / SQL / VBA</strong><span>Van bron tot bruikbaar inzicht</span></div></div>;
}

function About({ expanded = false }: { expanded?: boolean }) {
  return <section id="over-gerhard" className="gm-about gm-container gm-section"><div className="gm-about-photo" data-gm-reveal><Image src="/images/gerhard-dashboard.webp" alt="Gerhard Magis aan het werk met data en managementinformatie" width={1536} height={1024} sizes="(max-width: 767px) 92vw, 46vw" /><div className="gm-photo-caption"><span>Gerhard Magis</span><span>PhD, Natuurkunde</span></div></div><div className="gm-about-copy" data-gm-reveal><span className="gm-small-label">De mens achter de analyse</span><h2>Aangenaam.<br />Ik ben Gerhard<span>.</span></h2><p>Ik sla de brug tussen ruwe data en beslissingen waar je iets aan hebt. Nieuwsgierig naar de cijfers. Betrokken bij de mensen erachter.</p><p>Mijn basis is de natuurkunde, mijn werk draait om de praktijk. Van financiële modellen tot zorginkoop en beleidsadvies: ik maak complexe vraagstukken begrijpelijk.</p>{expanded && <p>In 2014 richtte ik Magis Data Intelligence op. Als zelfstandig data-analist en business consultant help ik organisaties om kansen en risico’s te herkennen en hun keuzes te onderbouwen.</p>}<a className="gm-text-link" href={expanded ? "/expertise" : "/over-mij"}>{expanded ? "Bekijk mijn expertise" : "Meer over Gerhard"}<span aria-hidden="true">↗</span></a></div></section>;
}

function Experience() {
  return <section id="ervaring" className="gm-experience gm-container gm-section" data-gm-reveal><h2>Analytisch van huis uit.<br /><span className="gm-muted">Ervaren in de praktijk.</span></h2><div className="gm-experience-list"><article><span className="gm-experience-date">Sinds 2017</span><div><h3>Zorg en Zekerheid</h3><p>Senior business consultant en data-analist. Eerder senior beleidsadviseur en financieel analist.</p></div><span className="gm-experience-topic">Data & beleid</span></article><article><span className="gm-experience-date">2010 - 2017</span><div><h3>Achmea & Zilveren Kruis</h3><p>Businessanalyse voor zorginkoop, risicoanalyse, voorspellende modellen en begeleiding van analisten.</p></div><span className="gm-experience-topic">Zorg & inzicht</span></article><article><span className="gm-experience-date">2008 - 2010</span><div><h3>International Marketmakers Combination</h3><p>Ontwikkeling van prijsmodellen en risicomanagement als derivatives trader en strategist.</p></div><span className="gm-experience-topic">Modellen & risico</span></article><article><span className="gm-experience-date">2003 - 2008</span><div><h3>Universiteit Leiden</h3><p>Promotieonderzoek in de natuurkunde. De wetenschappelijke basis voor een kritische blik op data.</p></div><span className="gm-experience-topic">Onderzoek</span></article></div></section>;
}

function Recommendation() {
  return <section className="gm-recommendation gm-container" data-gm-reveal><div className="gm-quote-mark" aria-hidden="true">“</div><blockquote><p>Hij kan zeer complexe data-analyses opzetten en begrijpelijk maken voor iedereen.</p><footer><strong>Marieke Pronk</strong><span>Directeur Health Contracting & strategisch zorgadviseur</span><small>LinkedIn-aanbeveling, november 2016</small></footer></blockquote></section>;
}

function Approach({ expanded = false }: { expanded?: boolean }) {
  return <section id="werkwijze" className="gm-approach gm-section" data-gm-reveal><div className="gm-container"><h2>Van “hoe zit dat?”<br />naar “zo zit dat.”</h2><div className="gm-approach-steps"><article><span className="gm-step-symbol" aria-hidden="true">?</span><h3>De vraag scherp.</h3><p>We beginnen bij je organisatie en de beslissing die je wilt nemen. Wat wil je weten, en waarom?</p>{expanded && <p>We bespreken de context, beschikbare data en gewenste uitkomst. Zo werken we aan een vraag die echt iets oplevert.</p>}</article><article><span className="gm-step-symbol gm-step-bars" aria-hidden="true"><i /><i /><i /></span><h3>De data op tafel.</h3><p>Ik onderzoek de kwaliteit, leg verbanden en toets aannames. Met een aanpak die bij het vraagstuk past.</p>{expanded && <p>Onzekerheden, ontbrekende gegevens en beperkingen worden zichtbaar. Je weet hoe de analyse tot stand komt.</p>}</article><article><span className="gm-step-symbol" aria-hidden="true">↗</span><h3>De richting helder.</h3><p>Je krijgt begrijpelijke inzichten en onderbouwd advies. Plus de kennis om er zelf mee verder te werken.</p>{expanded && <p>We bespreken de betekenis voor beleid, management of uitvoering. De analyse eindigt bij een bruikbare volgende stap.</p>}</article></div><a href="/contact" className="gm-text-link">Kennismaken <span aria-hidden="true">↗</span></a></div></section>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div id="gm-site" className={`gm-site ${gerhardFont.variable}`}><Header /><main id="main-content">{children}</main><Footer /><RevealEffects /></div>;
}

export function GerhardHome() {
  const structuredData = { "@context": "https://schema.org", "@type": "ProfessionalService", name: "Magis Data Intelligence", url: "https://magisintel.nl", email, description: "Data-analyse, managementinformatie en beleidsadvies door Gerhard Magis, PhD.", founder: { "@type": "Person", name: "Gerhard Magis", honorificSuffix: "PhD", jobTitle: "Zelfstandig data-analist en business consultant" }, foundingDate: "2014" };
  return <Shell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><section className="gm-hero gm-container"><div className="gm-hero-copy"><p className="gm-hero-eyebrow">Zelfstandig data-analist & business consultant</p><h1>Minder giswerk.<br /><span>Meer grip.</span></h1><p className="gm-hero-description">Ik maak van complexe data heldere inzichten. Zodat jij met vertrouwen de volgende stap zet.</p><div className="gm-hero-actions"><a className="gm-button" href="#contact">Kennismaken <span aria-hidden="true">↗</span></a><a className="gm-text-link" href="#diensten">Wat ik voor je doe <span aria-hidden="true">↓</span></a></div></div><figure className="gm-hero-portrait"><div className="gm-portrait-stage"><div className="gm-orange-disc" aria-hidden="true" /><div className="gm-portrait-bars" aria-hidden="true"><i /><i /><i /><i /></div><Image className="gm-portrait" src="/images/gerhard-studio-orange.webp" alt="Gerhard Magis, PhD, zelfstandig data-analist en business consultant" width={1122} height={1402} sizes="(max-width: 767px) 70vw, (max-width: 1199px) 332px, 376px" preload fetchPriority="high" /></div><figcaption><strong>Gerhard Magis<span>, PhD</span></strong><span>Goed met cijfers. Fijn om mee te werken.</span></figcaption></figure></section><Credentials /><Services /><section className="gm-data-section gm-container gm-section"><h2>De vraag achter<br /><span className="gm-muted">de cijfers.</span></h2><p className="gm-section-intro">Een grafiek is het begin. De waarde zit in begrijpen wat er gebeurt, waarom, en wat je ermee kunt.</p><DataExample /></section><About /><Experience /><Recommendation /><Approach /><Contact /></Shell>;
}

const pageTitles = {
  diensten: { title: "De juiste analyse.\nEen bruikbaar antwoord.", intro: "Van een eerste datavraag tot onderbouwd beleid. Ik help je de stap van cijfers naar keuzes te maken." },
  werkwijze: { title: "Een scherpe vraag.\nEen helder resultaat.", intro: "Samen bepalen we wat je wilt weten. Ik breng de data, de context en de betekenis bij elkaar." },
  "over-mij": { title: "Gerhard Magis.\nAnalist. Adviseur. Mens.", intro: "Een natuurkundige met een praktische blik. Ik verbind complexe data met de vragen die er voor jouw organisatie toe doen." },
  expertise: { title: "Diepgang in de data.\nGevoel voor de praktijk.", intro: "Ervaring met zorg, financiële analyse, risicomodellen en beleid. Met de kritische blik van een gepromoveerd natuurkundige." },
  cases: { title: "Cijfers begrijpen.\nOrganisaties verder helpen.", intro: "Mijn ervaring ligt op het snijvlak van data, zorg en beleid. Deze vraagstukken laten zien wat ik meebreng." },
  contact: { title: "Laten we\nkennismaken.", intro: "Vertel me over je vraagstuk. Dan bespreken we welke analyse en welke aanpak jou verder helpen." },
};

export function GerhardNotFound() {
  return <Shell><section className="gm-inner-hero gm-container"><a className="gm-back-link" href="/">← Home</a><h1>Deze pagina<br /><span className="gm-accent">bestaat niet.</span></h1><p>Misschien is het adres veranderd of zit er een typfout in. Vanaf de homepage vind je de juiste richting.</p><div className="gm-hero-actions"><a className="gm-button" href="/">Naar home <span aria-hidden="true">↗</span></a><a className="gm-text-link" href="/contact">Kennismaken <span aria-hidden="true">↗</span></a></div></section></Shell>;
}

export function GerhardPage({ page }: { page: keyof typeof pageTitles }) {
  const content = pageTitles[page];
  return <Shell><section className={`gm-inner-hero gm-container${page === "contact" ? " gm-inner-contact" : ""}`}><a className="gm-back-link" href="/">← Home</a><h1>{content.title.split("\n").map((line, index) => <span key={line} className={index === 1 ? "gm-accent" : ""}>{line}</span>)}</h1><p>{content.intro}</p>{page === "contact" && <div className="gm-contact-direct"><a href={mailto} className="gm-button">Kennismaken <span aria-hidden="true">↗</span></a><a href={`mailto:${email}`}>{email}</a><small>Opent je mailprogramma. Je kunt je vraag direct meesturen.</small></div>}</section>{page === "diensten" && <><Services /><section className="gm-data-section gm-container gm-section"><h2>Inzicht dat je<br />kunt gebruiken.</h2><DataExample /></section></>}{page === "werkwijze" && <Approach expanded />}{page === "over-mij" && <><About expanded /><Recommendation /></>}{page === "expertise" && <><Credentials /><Experience /></>}{page === "cases" && <><section className="gm-container gm-section gm-practice"><article><h2>Zorginkoop onderbouwen.</h2><p>Regioanalyses, spiegelinformatie en benchmarks om kansen en risico’s in de zorg zichtbaar te maken. Ervaring opgedaan bij Achmea en Zilveren Kruis.</p></article><article><h2>Risico’s zichtbaar maken.</h2><p>Statistische en financiële modellen die helpen om onzekerheid te begrijpen. Van optieprijsmodellen tot risicoanalyse in de zorg.</p></article><article><h2>Kennis laten groeien.</h2><p>Analisten begeleiden in SAS, statistiek en analysevaardigheden. Complexe analyses begrijpelijk maken voor collega’s en externe partijen.</p></article></section><Experience /></>}{page === "contact" ? <section className="gm-contact-notes gm-container"><div><h2>Een vraag is genoeg.</h2><p>Je hoeft je vraagstuk nog niet tot achter de komma te kennen. Vertel me waar je tegenaan loopt en wat je wilt bereiken.</p></div><div><h2>Rechtstreeks met Gerhard.</h2><p>Je spreekt met de analist die ook aan je vraagstuk werkt. Persoonlijk, inhoudelijk en met aandacht voor jouw organisatie.</p></div></section> : <Contact />}</Shell>;
}
