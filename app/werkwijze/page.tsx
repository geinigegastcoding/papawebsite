import { CheckList, PageShell } from "../site";

const steps = [
  {
    title: "Verkenning",
    text: "Begrijpen van de vraag, context, beslissingen en beschikbare data.",
  },
  {
    title: "Analyse",
    text: "Onderzoeken van data en identificeren van relevante patronen, trends en afwijkingen.",
  },
  {
    title: "Vertaling",
    text: "Omzetten van analyses naar begrijpelijke managementinformatie en duiding.",
  },
  {
    title: "Advies",
    text: "Formuleren van concrete, onderbouwde aanbevelingen voor besluitvorming.",
  },
  {
    title: "Implementatie",
    text: "Optioneel ondersteunen bij toepassing in de organisatie, rapportagecyclus of werkwijze.",
  },
];

const principles = [
  "Eerst de beslisvraag, daarna de analyse",
  "Definities en datakwaliteit worden expliciet besproken",
  "Uitkomsten worden vertaald naar taal die management en inhoudelijke teams delen",
  "Beperkingen van de data blijven zichtbaar in de conclusies",
];

const collaboration = [
  {
    title: "Korte lijnen",
    text: "Regelmatige afstemming voorkomt dat analyse losraakt van de praktijk. Bevindingen worden tussentijds getoetst op herkenbaarheid en relevantie.",
  },
  {
    title: "Transparante keuzes",
    text: "Aannames, definities en selecties worden benoemd. Zo blijft duidelijk waarop conclusies gebaseerd zijn.",
  },
  {
    title: "Werkbaar resultaat",
    text: "De uitkomst moet bruikbaar zijn in overleg, rapportage of besluitvorming. Vorm volgt functie.",
  },
];

export default function WerkwijzePage() {
  return (
    <PageShell
      eyebrow="Werkwijze"
      title="Gestructureerd, analytisch en resultaatgericht."
      text="De aanpak begint bij begrip van de context en eindigt bij inzichten die bruikbaar zijn in dagelijkse sturing en strategische besluitvorming."
    >
      <section className="page-section">
        <div className="site-container process-list">
          {steps.map((step, index) => (
            <article key={step.title} className="process-step">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Uitgangspunt</p>
            <h2>Pragmatisch per klantvraag.</h2>
          </div>
          <CheckList
            items={[
              "Aansluiten op bestaande systemen en definities",
              "Complexe analyse begrijpelijk maken voor besluitvormers",
              "Resultaat afstemmen op de specifieke situatie van de klant",
            ]}
          />
        </div>
      </section>
      <section className="page-section">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Werkprincipes</p>
            <h2>Analyse met bestuurlijke bruikbaarheid.</h2>
          </div>
          <CheckList items={principles} />
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container">
          <div className="section-header">
            <p className="section-kicker dark">Samenwerking</p>
            <h2>Helder proces, zonder onnodige complexiteit.</h2>
            <p>
              Organisaties krijgen grip op voortgang, keuzes en uitkomsten. Dat maakt analyse beter
              bespreekbaar en voorkomt verrassingen aan het einde.
            </p>
          </div>
          <div className="mini-case-grid">
            {collaboration.map((item) => (
              <article key={item.title} className="mini-case">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
