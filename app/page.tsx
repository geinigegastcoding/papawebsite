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
  stockImages,
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
    image: stockImages.analyticsScreen,
  },
  {
    title: "Dashboard bruikbaar maken",
    text: "Een dashboard bevat veel cijfers, maar weinig richting. Door indicatoren te verscherpen ontstaat informatie die bespreekbaar is in managementoverleg.",
    image: "/images/gerhard-dashboard.webp",
  },
  {
    title: "Risico's eerder herkennen",
    text: "Operationele signalen worden gecombineerd met historische patronen. Zo ontstaat een realistischer beeld van waar aandacht nodig is.",
    image: stockImages.strategyMeeting,
  },
];

const visualStories = [
  {
    title: "Dashboard dat stuurt",
    text: "Van losse grafieken naar managementinformatie met focus.",
    image: "/images/gerhard-dashboard.webp",
  },
  {
    title: "Analyse met context",
    text: "Cijfers krijgen pas waarde wanneer de organisatievraag scherp is.",
    image: stockImages.dashboardDesk,
  },
  {
    title: "Samen beslissen",
    text: "Inzichten landen beter wanneer teams dezelfde taal spreken.",
    image: stockImages.strategyMeeting,
  },
];

const recommendations = [
  {
    name: "Marco Ruiter",
    initials: "MR",
    role: "Directeur Strategische Partnerships bij Dedimo",
    date: "30 november 2016",
    relation: "werkte met Gerhard in hetzelfde team",
    summary:
      "Inhoudelijk sterk, prettig in omgang, en bouwer van complexe tools waar nog steeds mee gewerkt wordt.",
    quote:
      "Gerhard is een super fijne collega om mee te werken. Hij is inhoudelijk sterk en hij is een erg prettig persoon in omgang. Gerhard heeft complexe tools gebouwd voor Zilveren Kruis waar nog steeds mee gewerkt wordt.",
  },
  {
    name: "Marieke Pronk",
    initials: "MP",
    role: "Directeur Health Contracting & Strategisch zorgadviseur",
    date: "23 november 2016",
    relation: "werkte met Gerhard in hetzelfde team",
    summary:
      "Zeer gedreven en betrokken, kritisch waar nodig, en sterk in complexe analyses begrijpelijk maken.",
    quote:
      "Gerhard is een fijne collega waar je op kan bouwen. Hij is zeer gedreven en betrokken, kritisch als het moet. Hij kan zeer complexe data-analyses opzetten en begrijpelijk maken voor iedereen, kan van data een goudmijn maken.",
  },
  {
    name: "Guus Mulder",
    initials: "GM",
    role: "Business Intelligence Specialist at Zilveren Kruis",
    date: "16 november 2016",
    relation: "werkte met Gerhard in verschillende teams",
    summary:
      "Werkt op hoog analytisch niveau en kan een complex product bouwen dat breed overdraagbaar is.",
    quote:
      "Samen met Gerhard heb ik benchmarkinformatie voor zorgverleners van Zilveren Kruis geproduceerd. De samenwerking was prettig. Ik heb daarin Gerhard leren kennen als iemand die op hoog analytisch niveau een complex product kan maken. Dit product is nu overgedragen aan Vektis, branche-organisatie voor alle zorgverzekeraars.",
  },
  {
    name: "Paul Wagenaar",
    initials: "PW",
    role: "Specialist Digitale contractering bij Zilveren Kruis",
    date: "8 november 2016",
    relation: "werkte met Gerhard in hetzelfde team",
    summary:
      "Sterk in complexe problemen gestructureerd analyseren en haalbare oplossingen aandragen.",
    quote:
      "Gerhard is goed in het gestructureerd analyseren van complexe problemen en het aandragen van haalbare oplossingen. Daarnaast is Gerhard gewoon een heel aangenaam persoon om mee samen te werken.",
  },
  {
    name: "Sander van Ekeren",
    initials: "SE",
    role: "Strategische HR Vraagstukken | Innovatie in Arbeidsvoorwaarden en Werkgeverschap",
    date: "8 november 2016",
    relation: "gaf rechtstreeks leiding aan Gerhard",
    summary:
      "Uitstekende data-analist met eigenaarschap, betrokkenheid en liefde voor complexe vraagstukken.",
    quote:
      "Gerhard is een meer dan uitstekende data-/informatie analist, met een liefde voor complexe vraagstukken. Naast zijn uitmuntende analytische vaardigheden, is hij zeer betrokken bij zijn werk en toont hij eigenaarschap op de momenten die er toe doen. Hij is de eerste die ik zal benaderen als ik een ingewikkeld datagerelateerd vraagstuk moet oplossen.",
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
      <VisualStorySection />
      <AboutSection />
      <RecommendationsSection />
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
            Data die niet ruist, maar <span>richting geeft.</span>
          </h1>
          <p className="hero-lede">
            Magis helpt organisaties om cijfers te vertalen naar scherpe inzichten, betere
            gesprekken en besluiten die met vertrouwen genomen worden.
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

function VisualStorySection() {
  return (
    <section className="visual-story-section" aria-labelledby="visual-story-title">
      <div className="site-container visual-story-header">
        <div>
          <p className="section-kicker dark">Meer beeld, minder ruis</p>
          <h2 id="visual-story-title">Inzicht moet u kunnen zien, niet alleen lezen.</h2>
        </div>
        <p>
          Daarom draait de site om herkenbare dashboards, werksituaties en scherpe visuele
          samenvattingen naast de inhoud.
        </p>
      </div>
      <div className="site-container visual-story-grid">
        {visualStories.map((item) => (
          <article key={item.title} className="visual-card">
            <img src={item.image} alt="" />
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
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
            Senior denkkracht voor data die <span>ertoe doet.</span>
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

function RecommendationsSection() {
  return (
    <section className="section recommendations-section" aria-labelledby="recommendations-title">
      <div className="site-container recommendations-panel">
        <div className="recommendations-topline">
          <div>
            <p className="section-kicker dark">LinkedIn aanbevelingen</p>
            <h2 id="recommendations-title">Vertrouwd door collega's en leidinggevenden.</h2>
          </div>
          <div className="recommendations-score" aria-label="Vijf aanbevelingen">
            <strong>5</strong>
            <span className="stars" aria-hidden="true">★★★★★</span>
            <span>aanbevelingen</span>
          </div>
        </div>
        <div className="recommendations-carousel">
          <div className="recommendations-viewport">
            <div className="recommendations-lane">
              {[0, 1].map((group) => (
                <div key={group} className="recommendations-group" aria-hidden={group === 1}>
                  {recommendations.map((item) => (
                    <article key={`${group}-${item.name}`} className="recommendation-card">
                      <div className="recommendation-head">
                        <div className="review-avatar" aria-hidden="true">
                          {item.initials}
                        </div>
                        <div className="recommendation-meta">
                          <h3>{item.name}</h3>
                          <p>{item.role}</p>
                        </div>
                      </div>
                      <div className="stars" aria-hidden="true">★★★★★</div>
                      <p className="recommendation-quote">"{item.summary}"</p>
                      <span>
                        {item.date} &middot; {item.relation}
                      </span>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
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
      <div className="site-container cases-grid cases-grid-visual">
        <SectionHeader
          eyebrow="Werkwijze"
          title="Van twijfel in cijfers naar taal die teams delen."
          text="Samenwerking start bij de vraag achter de vraag: welke beslissing moet beter worden, welke informatie ontbreekt en welke definities moeten eerst scherp staan?"
        />
        <div className="case-media-panel">
          <img src={stockImages.strategyMeeting} alt="Professionals bespreken data-inzichten rond een tafel" />
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
          title="Niet meer dashboards. Meer duidelijkheid."
          text="Elke opdracht begint bij de vraag welke keuze, prestatie of onzekerheid beter onderbouwd moet worden."
        />
        <div className="service-visual-band" aria-label="Visuele voorbeelden van data-analyse en dashboards">
          <img src={stockImages.dashboardDesk} alt="Laptop met analytics dashboard op een bureau" />
          <img src="/images/gerhard-dashboard.webp" alt="Gerhard Magis naast een managementdashboard" />
          <img src={stockImages.analyticsScreen} alt="Close-up van datavisualisatie op een scherm" />
        </div>
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
          title="Eerst scherpte. Dan analyse. Dan richting."
          text="De analyse wordt niet los gezien van de organisatiecontext. Dat voorkomt mooie cijfers zonder praktische betekenis."
        />
        <div className="process-photo-row" aria-hidden="true">
          <img src={stockImages.planningTable} alt="" />
          <img src={stockImages.strategyMeeting} alt="" />
        </div>
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
      <div className="site-container sectors-visual-panel">
        <div>
          <p className="section-kicker dark">Sectoren</p>
          <h2 id="sectors-title">Waar data bestuurlijke waarde moet krijgen.</h2>
          <div className="sector-photo-stack" aria-hidden="true">
            <img src={stockImages.dashboardDesk} alt="" />
            <img src="/images/gerhard-portrait.webp" alt="" />
          </div>
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
          title="Inzichten die het gesprek direct scherper maken."
          text="Geen standaardoplossingen, maar concrete duiding van wat de data laat zien en wat dat betekent voor keuzes."
        />
        <div className="mini-case-grid">
          {miniCases.map((item) => (
            <article key={item.title} className="mini-case mini-case-image">
              <img src={item.image} alt="" />
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
