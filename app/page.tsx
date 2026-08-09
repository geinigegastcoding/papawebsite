import type { Metadata } from "next";

import { createPageMetadata } from "./metadata";
import {
  ArrowIcon,
  Credential,
  Footer,
  Header,
  Icon,
  SiteImage,
  credentials,
} from "./site";

export const metadata: Metadata = createPageMetadata({
  title: "Magis Data Intelligence | Zie wat uw data vertelt",
  description:
    "Gerhard Magis vertaalt complexe data naar managementinformatie, heldere duiding en beslissingen die organisaties kunnen uitleggen.",
  path: "/",
  image: "/images/magis-signal-hero.webp",
  socialTitle: "Zie wat uw data al vertelt | Magis Data Intelligence",
  socialDescription: "Senior data-analyse en advies voor meer richting in complexe beslissingen.",
});

const signalPoints = [
  ["01", "De vraag achter het cijfer"],
  ["02", "De verklaring achter de afwijking"],
  ["03", "De keuze achter het dashboard"],
  ["04", "De taal die teams delen"],
];

const serviceLedger = [
  {
    number: "01",
    title: "Data-analyse",
    text: "Van patroon naar verklaring, met oog voor definities, kwaliteit en context.",
    icon: "analysis",
  },
  {
    number: "02",
    title: "Managementinformatie",
    text: "Rapportages die laten zien waar aandacht nodig is en welk gesprek moet volgen.",
    icon: "dashboard",
  },
  {
    number: "03",
    title: "Risico- en kansenanalyse",
    text: "Afwijkingen eerder herkennen en vertalen naar concrete scenario's en keuzes.",
    icon: "shield",
  },
  {
    number: "04",
    title: "Strategisch advies",
    text: "Een onafhankelijke vertaling van inzicht naar handelingsperspectief.",
    icon: "target",
  },
  {
    number: "05",
    title: "Procesoptimalisatie",
    text: "Zichtbaar maken waar informatie, uitvoering en besluitvorming elkaar vertragen.",
    icon: "dashboard",
  },
];

const processSteps = [
  ["01", "Vraag", "Welke beslissing, prestatie of onzekerheid moet beter worden onderbouwd?"],
  ["02", "Data", "Welke bronnen, definities en beperkingen bepalen wat we verantwoord kunnen zeggen?"],
  ["03", "Analyse", "Welke patronen, verschillen en verklaringen zijn relevant voor de vraag?"],
  ["04", "Richting", "Wat betekent dit voor beleid, proces, risico of prioriteit?"],
  ["05", "Toepassing", "Hoe landt het inzicht in overleg, rapportage en dagelijks handelen?"],
];

const recommendations = [
  {
    quote:
      "Gerhard kan zeer complexe data-analyses opzetten en begrijpelijk maken voor iedereen.",
    name: "Marieke Pronk",
    role: "Directeur Health Contracting & strategisch zorgadviseur",
  },
  {
    quote:
      "Hij is inhoudelijk sterk, prettig in omgang en bouwde complexe tools waar nog steeds mee wordt gewerkt.",
    name: "Marco Ruiter",
    role: "Directeur Strategische Partnerships, Dedimo",
  },
  {
    quote:
      "Sterk in complexe problemen gestructureerd analyseren en haalbare oplossingen aandragen.",
    name: "Paul Wagenaar",
    role: "Specialist digitale contractering",
  },
];

const sectors = [
  "Zorgorganisaties",
  "Verzekeraars & financiële dienstverlening",
  "Overheid & publieke sector",
  "Zakelijke dienstverlening",
];

const faqItems = [
  [
    "Moet onze data al op orde zijn?",
    "Nee. Onduidelijke definities, ontbrekende gegevens en kwaliteitsvragen zijn vaak onderdeel van het echte vraagstuk. Die worden zichtbaar gemaakt voordat conclusies worden getrokken.",
  ],
  [
    "Gaat het vooral om dashboards?",
    "Alleen wanneer een dashboard de besluitvorming helpt. Soms is een scherpe analyse, second opinion of adviesnotitie waardevoller dan nog een rapportage.",
  ],
  [
    "Kunnen kleine opdrachten ook?",
    "Ja. Een afgebakende analyse of onafhankelijke blik kan snel duidelijk maken waar vervolgonderzoek wel of niet zinvol is.",
  ],
  [
    "Hoe wordt met vertrouwelijke data gewerkt?",
    "Toegang, opslag, gebruik en vertrouwelijkheid worden vooraf concreet afgesproken. Alleen informatie die voor de opdracht nodig is, wordt gebruikt.",
  ],
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <SignalStrip />
        <ManifestoSection />
        <ServicesSection />
        <ArtifactSection />
        <ProcessSection />
        <ProfileSection />
        <ProofSection />
        <FitAndFaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

function HeroSection() {
  return (
    <section className="hero-canvas" aria-labelledby="hero-title">
      <SiteImage
        className="hero-canvas-media"
        src="/images/magis-signal-hero.webp"
        alt="Gerhard Magis analyseert rapportages aan een werktafel"
        priority
      />
      <div className="hero-canvas-shade" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />

      <div className="site-container hero-canvas-inner">
        <div className="hero-statement" data-reveal>
          <p className="eyebrow light">Senior data-analyse · managementinformatie · advies</p>
          <h1 id="hero-title">Zie wat uw data al vertelt.</h1>
          <p className="hero-lede">
            Complexe cijfers worden pas waardevol wanneer mensen dezelfde betekenis zien en weten
            welke keuze volgt.
          </p>
          <div className="hero-actions" aria-label="Belangrijkste acties">
            <a className="button button-primary" href="/contact">
              Start met uw vraag <ArrowIcon />
            </a>
            <a className="text-link text-link-light" href="/cases">
              Bekijk typische vraagstukken <ArrowIcon />
            </a>
          </div>
        </div>

        <div className="hero-corner-note" data-reveal>
          <span>Gerhard Magis, PhD</span>
          <p>Data die niet ruist, maar richting geeft.</p>
          <SignalTrace />
        </div>

        <a className="scroll-cue" href="#richting" aria-label="Scroll naar de volgende sectie">
          <span>Scroll</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function SignalStrip() {
  return (
    <section className="signal-strip" aria-label="Waar Magis scherpte brengt">
      <div className="site-container signal-strip-grid">
        {signalPoints.map(([number, text]) => (
          <div key={number} className="signal-point" data-reveal>
            <span>{number}</span>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ManifestoSection() {
  return (
    <section id="richting" className="manifesto-section section-space">
      <div className="site-container manifesto-grid">
        <div className="section-rail" data-reveal>
          <span>01</span>
          <p>Waarom Magis</p>
        </div>

        <div className="manifesto-heading" data-reveal>
          <p className="eyebrow">Van observatie naar betekenis</p>
          <h2>
            Van meer cijfers naar <em>minder twijfel.</em>
          </h2>
        </div>

        <div className="manifesto-copy" data-reveal>
          <p>
            Een dashboard kan een afwijking tonen. Maar niet vanzelf waarom die ontstaat, welke
            definitie erachter zit of welke keuze verstandig is.
          </p>
          <p>
            Magis verbindt analyse met de organisatievraag. Zodat cijfers niet eindigen in een
            rapport, maar beginnen aan een beter gesprek.
          </p>
          <a className="text-link" href="/werkwijze">
            Bekijk de werkwijze <ArrowIcon />
          </a>
        </div>

        <DecisionField />
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="services-ledger section-space" aria-labelledby="services-title">
      <div className="site-container">
        <div className="services-heading" data-reveal>
          <div>
            <p className="eyebrow light">Diensten</p>
            <h2 id="services-title">Vijf manieren om ruis terug te brengen.</h2>
          </div>
          <p>
            Geen standaardpakket. De vorm volgt de beslissing die beter moet worden onderbouwd.
          </p>
        </div>

        <div className="service-ledger-list">
          {serviceLedger.map((service) => (
            <a className="service-ledger-row" href="/diensten" key={service.number} data-reveal>
              <span className="service-number">{service.number}</span>
              <Icon name={service.icon} />
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <span className="service-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArtifactSection() {
  return (
    <section className="artifact-section" aria-labelledby="artifact-title">
      <SiteImage
        className="artifact-image"
        src="/images/magis-analysis-closeup.webp"
        alt="Analysebladen waarop één blauwe lijn duidelijk wordt"
      />
      <div className="artifact-shade" aria-hidden="true" />
      <div className="site-container artifact-layout">
        <div className="artifact-copy" data-reveal>
          <p className="eyebrow light">Een typisch omslagpunt</p>
          <h2 id="artifact-title">Niet nog een dashboard. Eén scherper gesprek.</h2>
          <p>
            De grootste winst ontstaat vaak wanneer een veelheid aan indicatoren wordt teruggebracht
            tot het patroon, de verklaring en de keuze die ertoe doen.
          </p>
          <a className="button button-paper" href="/cases">
            Bekijk voorbeelden <ArrowIcon />
          </a>
        </div>

        <div className="artifact-markers" aria-label="Van patroon naar keuze" data-reveal>
          <span>Patroon</span>
          <span>Verklaring</span>
          <span>Keuze</span>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="process-section section-space" aria-labelledby="process-title">
      <div className="site-container process-heading" data-reveal>
        <p className="eyebrow">Werkwijze</p>
        <h2 id="process-title">Eerst scherpte. Dan analyse. Dan richting.</h2>
      </div>

      <div className="site-container process-layout">
        <div className="process-visual" data-reveal>
          <ProcessMap />
          <div className="process-visual-caption">
            <span>Vraag</span>
            <p>De rode draad blijft zichtbaar, ook wanneer de analyse complex wordt.</p>
            <span>Besluit</span>
          </div>
        </div>

        <div className="process-list">
          {processSteps.map(([number, title, text]) => (
            <article key={number} className="process-step" data-reveal>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfileSection() {
  return (
    <section className="profile-section section-space" aria-labelledby="profile-title">
      <div className="site-container profile-layout">
        <div className="profile-media" data-reveal>
          <SiteImage
            className="profile-session"
            src="/images/magis-work-session.webp"
            alt="Gerhard Magis licht een analyse toe tijdens een werksessie"
          />
          <SiteImage
            className="profile-portrait"
            src="/images/gerhard-portrait.webp"
            alt="Portret van Gerhard Magis"
          />
          <p className="profile-side-note">De analyse is technisch. De uitkomst moet menselijk leesbaar zijn.</p>
        </div>

        <div className="profile-copy" data-reveal>
          <p className="eyebrow">Gerhard Magis, PhD</p>
          <h2 id="profile-title">Analytische diepgang zonder afstand.</h2>
          <p>
            Gerhard combineert een achtergrond in natuurkunde met ervaring als senior business
            consultant. Hij beweegt tussen detail en bestuur: precies genoeg voor inhoudelijke teams,
            helder genoeg voor management.
          </p>
          <div className="credential-list">
            {credentials.map((credential) => (
              <Credential key={credential}>{credential}</Credential>
            ))}
          </div>
          <a className="text-link" href="/over-mij">
            Meer over Gerhard <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  return (
    <section className="proof-section section-space" aria-labelledby="proof-title">
      <div className="site-container proof-heading" data-reveal>
        <p className="eyebrow light">Aanbevelingen van collega's en leidinggevenden</p>
        <h2 id="proof-title">Vertrouwen dat niet uit een marketingtekst komt.</h2>
      </div>

      <div className="site-container quote-wall">
        {recommendations.map((item, index) => (
          <figure className={index === 0 ? "quote-card quote-card-featured" : "quote-card"} key={item.name} data-reveal>
            <blockquote>“{item.quote}”</blockquote>
            <figcaption>
              <strong>{item.name}</strong>
              <span>{item.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function FitAndFaqSection() {
  return (
    <section className="fit-faq-section section-space" aria-labelledby="fit-title">
      <div className="site-container fit-faq-grid">
        <div className="fit-column" data-reveal>
          <p className="eyebrow">Past dit bij uw organisatie?</p>
          <h2 id="fit-title">Voor omgevingen waar een cijfer nooit alleen een cijfer is.</h2>
          <div className="sector-list">
            {sectors.map((sector, index) => (
              <a href="/expertise" key={sector}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {sector}
                <ArrowIcon />
              </a>
            ))}
          </div>
        </div>

        <div className="faq-column" data-reveal>
          <p className="eyebrow">Veelgestelde vragen</p>
          <div className="faq-list">
            {faqItems.map(([question, answer]) => (
              <details key={question} className="faq-item">
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="contact-title">
      <SiteImage
        src="/images/magis-analysis-closeup.webp"
        alt=""
        className="final-cta-image"
        aria-hidden="true"
      />
      <div className="site-container final-cta-inner" data-reveal>
        <p className="eyebrow light">Een inhoudelijk eerste gesprek</p>
        <h2 id="contact-title">Welke beslissing verdient meer richting?</h2>
        <p>
          Breng de vraag, een dashboard of een terugkerende twijfel mee. Het eerste gesprek is
          vrijblijvend en begint bij de inhoud.
        </p>
        <a className="button button-paper" href="/contact">
          Plan een kennismaking <ArrowIcon />
        </a>
      </div>
    </section>
  );
}

function SignalTrace() {
  return (
    <svg className="signal-trace" viewBox="0 0 300 72" aria-hidden="true">
      <path d="M1 53h42l18-21 22 13 30-34 28 42 25-20 24 7 34-24 25 18h40" />
      <circle cx="113" cy="11" r="4" />
      <circle cx="224" cy="16" r="4" />
    </svg>
  );
}

function DecisionField() {
  return (
    <div className="decision-field" data-reveal aria-label="Van meerdere signalen naar één duidelijke richting">
      <div className="decision-field-labels" aria-hidden="true">
        <span>Ruis</span>
        <span>Richting</span>
      </div>
      <svg viewBox="0 0 760 340" role="img" aria-label="Lijnen komen samen in één duidelijk signaal">
        <g className="field-grid">
          <path d="M0 56h760M0 112h760M0 168h760M0 224h760M0 280h760" />
          <path d="M126 0v340M252 0v340M378 0v340M504 0v340M630 0v340" />
        </g>
        <path className="field-line field-line-muted" d="M0 248 75 219 130 242 195 135 250 181 316 112 380 201 438 156 495 168 560 102 625 119 692 82 760 98" />
        <path className="field-line" d="M0 289 75 260 130 273 195 208 250 221 316 170 380 177 438 142 495 146 560 109 625 105 692 71 760 72" />
        <circle className="field-pulse" cx="692" cy="71" r="9" />
      </svg>
    </div>
  );
}

function ProcessMap() {
  return (
    <svg className="process-map" viewBox="0 0 560 560" role="img" aria-label="Vijf stappen van vraag naar toepassing">
      <circle className="map-ring" cx="280" cy="280" r="208" />
      <circle className="map-ring map-ring-inner" cx="280" cy="280" r="122" />
      <path className="map-path" d="M77 307c72-185 142-226 216-157 63 59 91 114 190 60" />
      <g className="map-points">
        <circle cx="84" cy="292" r="10" />
        <circle cx="167" cy="166" r="10" />
        <circle cx="280" cy="147" r="10" />
        <circle cx="367" cy="229" r="10" />
        <circle cx="483" cy="210" r="10" />
      </g>
      <circle className="map-center" cx="280" cy="280" r="36" />
      <path className="map-cross" d="M255 280h50M280 255v50" />
    </svg>
  );
}
