import {
  ArrowIcon,
  CheckIcon,
  Credential,
  Footer,
  Header,
  Icon,
  SectionHeader,
  CheckList,
  credentials,
  expertise,
  services,
} from "./site";

const caseSignals = [
  "Stuurinformatie voor managementteams",
  "Analyse van risico's en kansen",
  "Rapportages die besluitvorming versnellen",
];

const detailedServices = [
  {
    title: "Data-analyse",
    text: "Analyse van bestaande databronnen om patronen, trends, afwijkingen en verklaringen zichtbaar te maken. De nadruk ligt op vragen die relevant zijn voor beleid, operatie of management.",
  },
  {
    title: "Managementinformatie",
    text: "Ontwikkeling van rapportages en dashboards die definities, indicatoren en stuurinformatie helder maken. Niet meer cijfers, maar betere informatie voor overleg en besluitvorming.",
  },
  {
    title: "Risico- en kansenanalyse",
    text: "Signaleren waar processen, prestaties of beleid afwijken van verwachting. Dit helpt om risico's eerder te zien en verbeterkansen concreter te bespreken.",
  },
  {
    title: "Strategisch advies",
    text: "Vertaling van analyse naar handelingsperspectief. Wat betekent de uitkomst, welke keuzes liggen voor en welke informatie is nodig om verantwoord te besluiten?",
  },
  {
    title: "Procesoptimalisatie",
    text: "Onderzoeken waar informatie, werkprocessen en besluitvorming elkaar versterken of juist vertragen. Advies richt zich op praktische verbetering, niet op abstracte modellen.",
  },
];

const processSteps = [
  ["01", "Vraag scherp maken", "Eerst wordt bepaald welke beslissing, prestatie of onzekerheid beter onderbouwd moet worden."],
  ["02", "Data beoordelen", "Beschikbaarheid, kwaliteit, definities en beperkingen van de data worden expliciet gemaakt."],
  ["03", "Analyse uitvoeren", "Relevante patronen, verschillen en verklaringen worden onderzocht met passende kwantitatieve methoden."],
  ["04", "Vertalen naar sturing", "Uitkomsten worden omgezet naar begrijpelijke managementinformatie, dashboards of adviesnotities."],
  ["05", "Bespreken en toepassen", "Resultaten worden besproken met betrokkenen, zodat inzichten kunnen landen in keuzes en werkwijze."],
];

const sectors = [
  "Zorgorganisaties met complexe prestatie- en capaciteitsvragen",
  "Verzekeraars en financiele dienstverleners met risico- en portefeuilledata",
  "Overheid en publieke sector waar beleid, uitvoering en verantwoording samenkomen",
  "Zakelijke dienstverlening met behoefte aan betere stuurinformatie",
];

const miniCases = [
  {
    title: "Kostenverschillen verklaren",
    text: "Een kostenrapportage toont afwijkingen, maar nog geen oorzaak. Analyse brengt verschillen terug naar volume, processtappen, segmenten of definities.",
  },
  {
    title: "Dashboard bruikbaar maken",
    text: "Een dashboard bevat veel cijfers, maar weinig richting. Door indicatoren te verscherpen ontstaat informatie die bespreekbaar is in managementoverleg.",
  },
  {
    title: "Risico's eerder herkennen",
    text: "Operationele signalen worden gecombineerd met historische patronen. Zo ontstaat een realistischer beeld van waar aandacht nodig is.",
  },
];

const faqItems = [
  ["Moet onze data al perfect op orde zijn?", "Nee. Vaak begint waarde juist met inzicht in kwaliteit, definities en ontbrekende gegevens. Dat wordt onderdeel van de analyse."],
  ["Gaat het vooral om dashboards bouwen?", "Dashboards kunnen onderdeel zijn, maar de kern is betere managementinformatie: begrijpen wat cijfers betekenen en hoe ze besluitvorming ondersteunen."],
  ["Kunnen kleine opdrachten ook?", "Ja. Een scherpe analyse, second opinion of tijdelijke ondersteuning kan al waardevol zijn wanneer de vraag duidelijk is afgebakend."],
  ["Hoe wordt vertrouwelijkheid geborgd?", "Er wordt zorgvuldig gewerkt met data, toegang en context. Afspraken over vertrouwelijkheid, opslag en gebruik worden vooraf concreet gemaakt."],
  ["Wat levert een eerste gesprek op?", "Een eerste gesprek maakt duidelijk welke vraag centraal staat, welke data beschikbaar is en waar analyse mogelijk waarde toevoegt."],
  ["Past dit bij publieke organisaties?", "Ja. De aanpak is geschikt voor omgevingen waar beleid, uitvoering, verantwoording en data nauw met elkaar verbonden zijn."],
];

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ServicesStrip />
      <AboutSection />
      <ExpertiseSection />
      <CasesSection />
      <DetailedServicesSection />
      <HowItWorksSection />
      <SectorsSection />
      <MiniCasesSection />
      <DecisionFitSection />
      <FaqSection />
      <ContactCta />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="site-container hero-grid">
        <div className="hero-copy">
          <p className="section-kicker">Data-analyse en managementinformatie</p>
          <h1 id="hero-title">
            Van data naar <span>slimme beslissingen</span>
          </h1>
          <p className="hero-lede">
            Ik help organisaties om ruwe data om te zetten in bruikbare inzichten die leiden tot
            betere keuzes, efficientere processen en duurzame groei.
          </p>
          <div className="hero-actions" aria-label="Belangrijkste acties">
            <a className="button button-primary" href="/contact">
              Wat kan ik voor u betekenen?
              <ArrowIcon />
            </a>
            <a className="button button-secondary" href="/cases">
              Bekijk cases
              <ArrowIcon />
            </a>
          </div>
        </div>
        <HeroPhoto />
      </div>
    </section>
  );
}

function HeroPhoto() {
  return (
    <div className="hero-photo" aria-label="Gerhard Magis bij een dashboard met managementinformatie">
      <img
        src="/images/gerhard-dashboard.webp"
        alt="Gerhard Magis naast een dashboard met grafieken en managementinformatie"
      />
      <div className="hero-photo-shade" aria-hidden="true" />
    </div>
  );
}

function ServicesStrip() {
  return (
    <section id="diensten" className="service-strip" aria-labelledby="services-title">
      <h2 id="services-title" className="sr-only">
        Diensten
      </h2>
      <div className="site-container service-grid">
        {services.map((service) => (
          <article key={service.title} className="service-card">
            <Icon name={service.icon} />
            <div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="over-mij" className="section about-section" aria-labelledby="about-title">
      <div className="site-container about-grid">
        <div className="about-image" aria-label="Portret Gerhard Magis">
          <img src="/images/gerhard-portrait.webp" alt="Portret van Gerhard Magis" />
          <p>Gerhard Magis, PhD</p>
        </div>
        <div className="about-copy">
          <p className="section-kicker dark">Over mij</p>
          <h2 id="about-title">
            Ervaring. Analytisch. <span>Betrokken.</span>
          </h2>
          <p>
            Met een achtergrond in natuurkunde, data-analyse en business consultancy help ik
            organisaties de brug te slaan tussen data en strategie. Mijn aanpak is analytisch,
            pragmatisch en altijd gericht op resultaat.
          </p>
          <p className="signature">Gerhard Magis</p>
        </div>
        <div className="credential-list" aria-label="Credentials">
          {credentials.map((credential) => (
            <Credential key={credential}>{credential}</Credential>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExpertiseSection() {
  return (
    <section id="expertise" className="section expertise-section" aria-labelledby="expertise-title">
      <div className="site-container">
        <SectionHeader
          eyebrow="Expertise"
          title="Inzicht dat management helpt kiezen."
          text="De dienstverlening richt zich op vragen waar data, beleid en organisatiebesluiten elkaar raken."
        />
        <div className="expertise-grid">
          {expertise.map((item) => (
            <article key={item} className="expertise-card">
              <CheckIcon />
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CasesSection() {
  return (
    <section id="cases" className="section cases-section" aria-labelledby="cases-title">
      <div className="site-container cases-grid">
        <SectionHeader
          eyebrow="Werkwijze"
          title="Rustige analyse, heldere vertaling, bruikbaar resultaat."
          text="Samenwerking start bij de vraag achter de vraag: welke beslissing moet beter worden, welke informatie ontbreekt en welke definities moeten eerst scherp staan?"
        />
        <div className="case-panel">
          <h2 id="cases-title">Typische vraagstukken</h2>
          <ul>
            {caseSignals.map((signal) => (
              <li key={signal}>
                <CheckIcon />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
          <p>
            Geschikt voor organisaties die al over data beschikken, maar behoefte hebben aan
            structuur, duiding en een onafhankelijke blik.
          </p>
        </div>
      </div>
    </section>
  );
}

function DetailedServicesSection() {
  return (
    <section className="section detail-section" aria-labelledby="service-detail-title">
      <div className="site-container">
        <SectionHeader
          eyebrow="Diensten in detail"
          title="Van analyse naar bruikbare managementinformatie."
          text="Elke opdracht begint bij de vraag welke keuze, prestatie of onzekerheid beter onderbouwd moet worden."
        />
        <div className="detail-list">
          {detailedServices.map((service) => (
            <article key={service.title} className="detail-block">
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="section page-section-light" aria-labelledby="process-title">
      <div className="site-container">
        <SectionHeader
          eyebrow="Werkwijze"
          title="Een nuchtere aanpak met duidelijke tussenstappen."
          text="De analyse wordt niet los gezien van de organisatiecontext. Dat voorkomt mooie cijfers zonder praktische betekenis."
        />
        <div className="compact-process">
          {processSteps.map(([number, title, text]) => (
            <article key={title} className="compact-step">
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectorsSection() {
  return (
    <section className="section" aria-labelledby="sectors-title">
      <div className="site-container split-panel">
        <div>
          <p className="section-kicker dark">Sectoren</p>
          <h2 id="sectors-title">Ervaring in omgevingen waar data bestuurlijke waarde heeft.</h2>
        </div>
        <CheckList items={sectors} />
      </div>
    </section>
  );
}

function MiniCasesSection() {
  return (
    <section className="section page-section-light" aria-labelledby="mini-cases-title">
      <div className="site-container">
        <SectionHeader
          eyebrow="Voorbeelden"
          title="Typische inzichten die organisaties verder helpen."
          text="Geen standaardoplossingen, maar concrete duiding van wat de data laat zien en wat dat betekent voor keuzes."
        />
        <div className="mini-case-grid">
          {miniCases.map((item) => (
            <article key={item.title} className="mini-case">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DecisionFitSection() {
  return (
    <section className="section" aria-labelledby="fit-title">
      <div className="site-container split-panel">
        <div>
          <p className="section-kicker dark">Wanneer passend</p>
          <h2 id="fit-title">Geschikt wanneer er data is, maar nog onvoldoende richting.</h2>
        </div>
        <CheckList
          items={[
            "Managementrapportages roepen meer vragen op dan ze beantwoorden",
            "Teams hanteren verschillende definities voor dezelfde indicator",
            "Besluiten vragen om betere onderbouwing dan losse exports of incidentanalyses",
            "Er is behoefte aan tijdelijke senior expertise zonder uitbreiding van de vaste organisatie",
          ]}
        />
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="section faq-section" aria-labelledby="faq-title">
      <div className="site-container">
        <SectionHeader
          eyebrow="FAQ"
          title="Veelgestelde vragen."
          text="Praktische antwoorden voor organisaties die overwegen om externe data-analyse of advies in te zetten."
        />
        <div className="faq-list">
          {faqItems.map(([question, answer]) => (
            <details key={question} className="faq-item">
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCta() {
  return (
    <section id="contact" className="cta-section" aria-labelledby="contact-title">
      <div className="site-container cta-inner">
        <div>
          <p className="section-kicker">Contact</p>
          <h2 id="contact-title">Wilt u meer waarde halen uit uw data?</h2>
          <p>
            Plan een vrijblijvend gesprek en ontdek waar data-analyse direct kan bijdragen aan
            betere besluitvorming.
          </p>
        </div>
        <a className="button button-primary" href="/contact">
          Vrijblijvend kennismaken
          <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
