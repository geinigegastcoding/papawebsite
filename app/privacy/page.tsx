import type { Metadata } from "next";

import { createPageMetadata } from "../metadata";
import { CheckList, InfoCard, PageShell } from "../site";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy | Magis Data Intelligence",
  description:
    "Lees welke persoonsgegevens Magis Data Intelligence verwerkt, waarom dat gebeurt en welke privacyrechten u heeft.",
  path: "/privacy",
  image: "/images/magis-analysis-closeup.webp",
  socialDescription: "Heldere informatie over persoonsgegevens, e-mailcontact en cookies.",
});

const processing = [
  {
    title: "Bij e-mailcontact",
    text: "Naam, e-mailadres, organisatie en berichtinhoud worden gebruikt om uw vraag te beantwoorden. Grondslag: uw verzoek vóór een mogelijke overeenkomst, of het gerechtvaardigd belang om een zakelijke vraag te beantwoorden.",
    icon: "analysis",
  },
  {
    title: "Bij een opdracht",
    text: "Gegevens voor afspraken, uitvoering, facturatie en administratie worden gebruikt voor de overeenkomst en om aan wettelijke verplichtingen te voldoen.",
    icon: "dashboard",
  },
  {
    title: "Bij websitebezoek",
    text: "De website gebruikt geen marketing- of analysetracking. Technische loggegevens kunnen worden verwerkt op basis van het gerechtvaardigd belang om de website veilig en beschikbaar te houden.",
    icon: "shield",
  },
];

const retention = [
  "Contact dat niet tot een opdracht leidt: maximaal 24 maanden na het laatste inhoudelijke contact",
  "Opdrachtgegevens: zolang de opdracht loopt en daarna zolang dat nodig is voor mogelijke rechtsvorderingen",
  "Facturen en fiscale basisadministratie: 7 jaar volgens de wettelijke fiscale bewaarplicht",
  "Technische hostinglogs: alleen gedurende de beveiligings- en storingsperiode die de hostingprovider hanteert",
];

const rights = [
  "Inzage vragen in de persoonsgegevens die over u worden verwerkt",
  "Onjuiste of onvolledige gegevens laten corrigeren",
  "Verwijdering of beperking van verwerking vragen wanneer dat wettelijk mogelijk is",
  "Overdraagbaarheid vragen voor gegevens die u zelf verstrekte, wanneer dat recht van toepassing is",
  "Bezwaar maken tegen een verwerking en een klacht indienen bij de Autoriteit Persoonsgegevens",
];

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="Uw gegevens blijven van u."
      text="Magis Data Intelligence verwerkt alleen persoonsgegevens die nodig zijn voor contact, samenwerking en een veilige werking van deze website."
    >
      <section className="page-section">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Verantwoordelijke</p>
            <h2>Helder over wat er gebeurt.</h2>
          </div>
          <div>
            <p>
              Magis Data Intelligence, vertegenwoordigd door Gerhard Magis, is verantwoordelijk
              voor de persoonsgegevens die in het kader van contact en opdrachten worden verwerkt.
              Deze verklaring is voor het laatst bijgewerkt op 9 augustus 2026. Magis is bereikbaar
              in Nederland en gebruikt het onderstaande e-mailadres als privacycontact.
            </p>
            <p>
              Vragen over privacy kunt u sturen naar{" "}
              <a className="text-link" href="mailto:jgmagis@hotmail.com">
                jgmagis@hotmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="page-section page-section-light">
        <div className="site-container">
          <div className="section-header">
            <p className="section-kicker dark">Grondslag en doel</p>
            <h2>Alleen wat nodig is voor de vraag.</h2>
            <p>
              Persoonsgegevens worden niet verkocht en niet gebruikt voor ongevraagde marketing.
            </p>
          </div>
          <div className="page-grid">
            {processing.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Bewaartermijnen</p>
            <h2>Niet langer dan het doel vraagt.</h2>
          </div>
          <CheckList items={retention} />
        </div>
      </section>

      <section className="page-section page-section-light">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Delen en doorgifte</p>
            <h2>Alleen wanneer een dienst dat nodig maakt.</h2>
          </div>
          <div>
            <p>
              Gegevens worden alleen gedeeld met dienstverleners voor hosting, e-mail of
              administratie, of wanneer de wet dit verplicht. Zij mogen de gegevens niet voor eigen
              marketing gebruiken. Met verwerkers worden waar nodig afspraken over beveiliging en
              verwerking gemaakt.
            </p>
            <p>
              Als een dienstverlener persoonsgegevens buiten de Europese Economische Ruimte
              verwerkt, gebruikt Magis een wettelijk doorgiftemechanisme, zoals een
              adequaatheidsbesluit of standaardcontractbepalingen. U kunt via het privacycontact
              vragen welke waarborg voor een specifieke dienst geldt.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section page-section-light">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Persoonlijke apps</p>
            <h2>Een afgeschermde omgeving voor Luna en Fitness.</h2>
          </div>
          <div>
            <p>
              De portal op <a className="text-link" href="https://magisintel.nl/papa">magisintel.nl/papa</a> is
              alleen bedoeld voor Gerhard Magis en wordt beschermd met een apart wachtwoord. Luna- en
              Fitnesstrainingsdata worden in de browser op het gebruikte apparaat bewaard; de app heeft geen
              accountdatabase of advertentieprofiel.
            </p>
            <p>
              Een foto wordt alleen doorgestuurd wanneer u op fotoanalyse drukt. Voor die ene analyse wordt de
              foto naar de ingestelde OpenRouter-AI-provider gestuurd en niet door deze app opgeslagen. Een barcode
              wordt via Open Food Facts opgezocht. Deze externe diensten verwerken verzoeken volgens hun eigen
              voorwaarden; gebruik fotoanalyse daarom alleen met foto&apos;s die u daarvoor wilt delen.
            </p>
            <p>
              AI-calorieën, dieetchecks en trainingssuggesties zijn informatieve schattingen en geen medisch advies,
              diagnose of vervanging van een arts of diëtist.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Vrije keuze</p>
            <h2>Geen profilering of automatische besluiten.</h2>
          </div>
          <div>
            <p>
              Persoonsgegevens verstrekken is niet verplicht om deze website te bekijken. Bij
              e-mailcontact verstrekt u gegevens vrijwillig; zonder een bereikbaar e-mailadres kan
              Magis uw vraag niet beantwoorden. Voor een opdracht zijn identificatie-, afspraak- en
              factuurgegevens nodig om de overeenkomst uit te voeren en de administratie te voeren.
            </p>
            <p>
              Magis gebruikt uw gegevens niet voor profilering en neemt geen uitsluitend
              geautomatiseerde besluiten met rechtsgevolgen of vergelijkbare wezenlijke gevolgen.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section page-section-light">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Uw rechten</p>
            <h2>U houdt grip op uw gegevens.</h2>
          </div>
          <CheckList items={rights} />
        </div>
      </section>
    </PageShell>
  );
}
