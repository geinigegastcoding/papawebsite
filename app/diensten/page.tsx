import { CheckList, InfoCard, PageShell } from "../site";

const serviceBlocks = [
  {
    title: "Data-analyse",
    text: "Onderzoek naar patronen, trends, afwijkingen en verklaringen in bestaande data. De analyse wordt gekoppeld aan concrete vragen uit beleid, operatie of management.",
    icon: "analysis",
  },
  {
    title: "Managementinformatie",
    text: "Rapportages en dashboards die helpen sturen op relevante indicatoren. Aandacht gaat naar definities, consistentie en begrijpelijke presentatie.",
    icon: "dashboard",
  },
  {
    title: "Risico- en kansenanalyse",
    text: "Signaleren van ontwikkelingen die aandacht vragen: afwijkingen, kwetsbaarheden, kansen voor verbetering of keuzes met beleidsmatige gevolgen.",
    icon: "shield",
  },
  {
    title: "Strategisch advies",
    text: "Vertalen van analyse naar concrete aanbevelingen. Niet alleen wat de data laat zien, maar wat dit betekent voor prioriteiten, keuzes en vervolgstappen.",
    icon: "target",
  },
  {
    title: "Procesoptimalisatie",
    text: "Verbeteren van besluitvorming en efficientie door procesdata, prestatie-indicatoren en praktijkkennis bij elkaar te brengen.",
    icon: "target",
  },
];

const outputs = [
  "Een scherpe probleemdefinitie en afbakening van de analyse",
  "Heldere rapportage met bevindingen, duiding en beperkingen",
  "Dashboard of managementoverzicht wanneer dat de besluitvorming ondersteunt",
  "Concrete aanbevelingen voor beleid, proces of sturing",
];

const engagementTypes = [
  "Korte analyse of second opinion op een bestaand vraagstuk",
  "Tijdelijke ondersteuning bij rapportage, dashboarding of besluitvorming",
  "Verdiepend onderzoek naar risico's, prestaties of afwijkingen",
  "Adviestraject waarin analyse en managementgesprekken samenkomen",
];

export default function DienstenPage() {
  return (
    <PageShell
      eyebrow="Diensten"
      title="Data vertalen naar bruikbare inzichten."
      text="Magis Data Intelligence helpt organisaties om waarde te halen uit bestaande data door deze te analyseren en te vertalen naar managementinformatie, advies en concrete keuzes."
    >
      <section className="page-section">
        <div className="site-container page-grid">
          {serviceBlocks.map((service) => (
            <InfoCard key={service.title} {...service} />
          ))}
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Praktische waarde</p>
            <h2>Gericht op toepasbaarheid.</h2>
          </div>
          <p>
            De focus ligt op analyses die direct bruikbaar zijn voor de organisatie: helder genoeg
            voor management, precies genoeg voor inhoudelijke teams en concreet genoeg om op te
            handelen.
          </p>
        </div>
      </section>
      <section className="page-section">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Opbrengst</p>
            <h2>Wat een opdracht concreet kan opleveren.</h2>
          </div>
          <CheckList items={outputs} />
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container">
          <div className="section-header">
            <p className="section-kicker dark">Samenwerkingsvormen</p>
            <h2>Van korte analyse tot tijdelijk senior advies.</h2>
            <p>
              De dienstverlening is geschikt wanneer specialistische data-expertise nodig is zonder
              een vaste uitbreiding van het team.
            </p>
          </div>
          <div className="mini-case-grid">
            {engagementTypes.map((item) => (
              <article key={item} className="mini-case">
                <h3>{item}</h3>
                <p>
                  Afbakening, planning en resultaat worden vooraf concreet gemaakt, zodat duidelijk
                  is welke informatie nodig is en wat de organisatie ermee kan doen.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
