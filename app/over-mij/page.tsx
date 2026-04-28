import { CheckList, PageShell, credentials } from "../site";

const profileFocus = [
  {
    title: "Technische basis",
    text: "De achtergrond in natuurkunde en analyse helpt bij het structureren van complexe vraagstukken en het kritisch beoordelen van data.",
  },
  {
    title: "Consultancyervaring",
    text: "Ervaring als senior business consultant zorgt dat analyses aansluiten op organisatievragen, stakeholders en besluitvorming.",
  },
  {
    title: "Onafhankelijke rol",
    text: "Als zelfstandig consultant is de blik onafhankelijk en gericht op wat de organisatie nodig heeft, niet op het verkopen van tooling.",
  },
];

const goodFit = [
  "Er is behoefte aan iemand die technische analyse en managementtaal verbindt",
  "De organisatie heeft data, maar mist scherpe duiding of prioritering",
  "Een tijdelijk senior profiel is passender dan een groot extern team",
  "Vraagstukken raken meerdere afdelingen, definities of belangen",
];

export default function OverMijPage() {
  return (
    <PageShell
      eyebrow="Over mij"
      title="Gerhard Magis, PhD."
      text="Senior business consultant en data-analist met een achtergrond in natuurkunde en ervaring in complexe, data-intensieve omgevingen."
    >
      <section className="page-section">
        <div className="site-container profile-grid">
          <div className="profile-photo">
            <img src="/images/gerhard-portrait.webp" alt="Portret van Gerhard Magis" />
          </div>
          <div className="profile-copy">
            <p className="section-kicker dark">Brug tussen data en strategie</p>
            <h2>Complexe analyses helder maken.</h2>
            <p>
              Gerhard helpt organisaties om de brug te slaan tussen data en strategie. Zijn kracht
              ligt in het vertalen van complexe analyses naar heldere inzichten die direct
              toepasbaar zijn.
            </p>
            <CheckList items={credentials} />
          </div>
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Kenmerken</p>
            <h2>Onafhankelijk en betrokken.</h2>
          </div>
          <CheckList
            items={[
              "Analytisch en gestructureerd",
              "Onafhankelijk en betrouwbaar",
              "Gericht op resultaat en toepasbaarheid",
              "Werkzaam als zelfstandig consultant",
            ]}
          />
        </div>
      </section>
      <section className="page-section">
        <div className="site-container">
          <div className="section-header">
            <p className="section-kicker dark">Achtergrond</p>
            <h2>Een profiel tussen analyse, organisatie en besluitvorming.</h2>
            <p>
              De meerwaarde zit in het vermogen om details serieus te nemen zonder het bestuurlijke
              doel uit het oog te verliezen.
            </p>
          </div>
          <div className="mini-case-grid">
            {profileFocus.map((item) => (
              <article key={item.title} className="mini-case">
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
            <p className="section-kicker dark">Wanneer passend</p>
            <h2>Voor organisaties die senior analysekracht zoeken.</h2>
          </div>
          <CheckList items={goodFit} />
        </div>
      </section>
    </PageShell>
  );
}
