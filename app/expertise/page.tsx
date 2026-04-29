import { innerPageImages } from "../inner-page-images";
import { CheckList, InfoCard, PageShell, expertise } from "../site";

const applications = [
  "Stuurinformatie voor managementteams en directies",
  "Analyse van prestaties, kosten, capaciteit en doorlooptijden",
  "Onderbouwing van beleidskeuzes en prioriteiten",
  "Duiding van risico's, afwijkingen en verbeterpotentieel",
];

const methodNotes = [
  {
    title: "Kwantitatief waar nodig",
    text: "Statistische en analytische methoden worden ingezet wanneer ze waarde toevoegen aan de vraag. Complexiteit is geen doel op zichzelf.",
  },
  {
    title: "Businesscontext centraal",
    text: "Cijfers worden gelezen in samenhang met processen, beleid, incentives en praktische beperkingen.",
  },
  {
    title: "Vertaling naar besluitvorming",
    text: "Uitkomsten worden zo gepresenteerd dat management kan bespreken wat er speelt, waarom het speelt en wat mogelijke vervolgstappen zijn.",
  },
];

const methodImages = [
  innerPageImages.monitoringScreen,
  innerPageImages.dataMeeting,
  innerPageImages.focusedOffice,
];

export default function ExpertisePage() {
  return (
    <PageShell
      eyebrow="Expertise"
      title="Technische analyse met business inzicht."
      text="Sterke combinatie van data-analyse, statistiek, beleidsmatig denken en vertaling naar managementinformatie."
    >
      <section className="page-section">
        <div className="site-container page-grid">
          {expertise.map((item) => (
            <InfoCard
              key={item}
              title={item}
              text="Toegepast op complexe omgevingen waar data, processen en besluitvorming nauw samenhangen."
            />
          ))}
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container split-panel page-visual-split">
          <div>
            <p className="section-kicker dark">Omgevingen</p>
            <h2>Voor data-intensieve organisaties.</h2>
          </div>
          <div>
            <p>
              Ervaring ligt vooral in situaties waar cijfers niet op zichzelf staan, maar verbonden
              zijn met beleid, risico's, prestaties en bestuurlijke keuzes.
            </p>
            <img
              src={innerPageImages.monitoringScreen}
              alt="Analyse op een scherm met datavisualisaties"
            />
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="site-container split-panel">
          <div>
            <p className="section-kicker dark">Toepassing</p>
            <h2>Expertise wordt pas waardevol als zij keuzes ondersteunt.</h2>
          </div>
          <CheckList items={applications} />
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container">
          <div className="section-header">
            <p className="section-kicker dark">Manier van kijken</p>
            <h2>Analytisch, maar nooit los van de organisatie.</h2>
            <p>
              De kracht zit in de combinatie van cijfermatig onderzoek en begrip van de bestuurlijke
              vraag waarvoor de analyse bedoeld is.
            </p>
          </div>
          <div className="mini-case-grid">
            {methodNotes.map((item, index) => (
              <article key={item.title} className="mini-case mini-case-image">
                <img src={methodImages[index]} alt="Data-expertise toegepast in overleg" />
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
