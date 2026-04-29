import { innerPageImages } from "../inner-page-images";
import { CheckList, InfoCard, PageShell } from "../site";

const cases = [
  {
    title: "Managementdashboards",
    text: "Ontwikkelen van dashboards voor betere sturing, met duidelijke definities en managementgerichte indicatoren.",
    icon: "dashboard",
  },
  {
    title: "Kosten en prestaties",
    text: "Analyse van kosten, opbrengsten en prestaties binnen organisaties om afwijkingen en verklaringen zichtbaar te maken.",
    icon: "analysis",
  },
  {
    title: "Risico's en kansen",
    text: "Identificeren van beleidsmatige en operationele risico's, plus concrete optimalisatiekansen.",
    icon: "shield",
  },
  {
    title: "Besluitvorming op data",
    text: "Verbeteren van besluitvorming door informatie betrouwbaarder, begrijpelijker en toepasbaar te maken.",
    icon: "target",
  },
];

const miniCaseExplanations = [
  {
    title: "Van losse rapportage naar stuurinformatie",
    text: "Veel organisaties hebben periodieke exports, maar missen samenhang. Door indicatoren te ordenen rond managementvragen ontstaat rapportage die richting geeft.",
  },
  {
    title: "Afwijking begrijpen voordat er wordt bijgestuurd",
    text: "Een stijging of daling is pas bruikbaar als duidelijk is waar deze vandaan komt. Analyse maakt onderscheid tussen volume, mix, proces en definitie-effecten.",
  },
  {
    title: "Risico's bespreekbaar maken",
    text: "Data kan vroeg laten zien waar uitvoering, beleid of prestaties uit elkaar lopen. De waarde zit in tijdige duiding, niet alleen in signalering achteraf.",
  },
];

const miniCaseImages = [
  innerPageImages.dashboardScreen,
  innerPageImages.monitoringScreen,
  innerPageImages.dataMeeting,
];

const caseApproach = [
  "Start met de vraag die beter beantwoord moet worden",
  "Maak aannames en definities expliciet",
  "Onderzoek patronen en verklaringen in plaats van alleen totalen",
  "Vertaal uitkomsten naar besluiten, acties of vervolgvragen",
];

export default function CasesPage() {
  return (
    <PageShell
      eyebrow="Cases"
      title="Voorbeelden van typische vraagstukken."
      text="Projecten waarin data-analyse leidt tot betere inzichten en besluitvorming, zonder overdreven claims of standaard marketingtaal."
    >
      <section className="page-section">
        <div className="site-container page-grid">
          {cases.map((item) => (
            <InfoCard key={item.title} {...item} />
          ))}
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container split-panel page-visual-split">
          <div>
            <p className="section-kicker dark">Focus</p>
            <h2>Aanpak, inzicht en impact.</h2>
          </div>
          <div>
            <p>
              Cases tonen vooral hoe vraagstukken worden aangepakt, welke inzichten ontstaan en hoe
              deze bijdragen aan beter onderbouwde keuzes.
            </p>
            <img src={innerPageImages.dataMeeting} alt="Team bespreekt data-inzichten aan tafel" />
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="site-container">
          <div className="section-header">
            <p className="section-kicker dark">Mini-cases</p>
            <h2>Voorbeelden van inzichten die vaak ontbreken.</h2>
            <p>
              Deze voorbeelden zijn representatief voor het soort vragen waarbij analyse helpt om
              van observatie naar verklaring te komen.
            </p>
          </div>
          <div className="mini-case-grid">
            {miniCaseExplanations.map((item, index) => (
              <article key={item.title} className="mini-case mini-case-image">
                <img src={miniCaseImages[index]} alt="Voorbeeld van data-inzicht in de praktijk" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Aanpak bij cases</p>
            <h2>Niet meer cijfers, maar betere vragen en duiding.</h2>
          </div>
          <CheckList items={caseApproach} />
        </div>
      </section>
    </PageShell>
  );
}
