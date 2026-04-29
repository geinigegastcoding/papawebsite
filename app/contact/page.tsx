import { innerPageImages } from "../inner-page-images";
import { ArrowIcon, CheckList, PageShell } from "../site";

const preparation = [
  "Welke beslissing of rapportage nu onvoldoende onderbouwd is",
  "Welke databronnen, dashboards of exports beschikbaar zijn",
  "Welke teams of stakeholders de informatie gebruiken",
  "Welke termijn en vorm van ondersteuning realistisch is",
];

const contactFaq = [
  {
    question: "Is een eerste gesprek echt vrijblijvend?",
    answer: "Ja. Het gesprek is bedoeld om de vraag te begrijpen en te beoordelen of data-analyse of advies zinvol kan bijdragen.",
  },
  {
    question: "Moet er al een duidelijke opdracht liggen?",
    answer: "Nee. Vaak begint het gesprek juist met het scherper maken van de vraag, scope en mogelijke aanpak.",
  },
  {
    question: "Kan het ook om tijdelijke ondersteuning gaan?",
    answer: "Ja. Ondersteuning kan projectmatig, adviserend of tijdelijk binnen een lopend traject worden ingericht.",
  },
  {
    question: "Wordt er met vertrouwelijke data gewerkt?",
    answer: "Alleen binnen duidelijke afspraken over toegang, verwerking en vertrouwelijkheid. Dat wordt vooraf concreet besproken.",
  },
];

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Vrijblijvend kennismaken."
      text="Direct en laagdrempelig contact voor een eerste inhoudelijk gesprek over data, inzicht en mogelijke toegevoegde waarde."
    >
      <section className="page-section">
        <div className="site-container contact-grid">
          <div className="contact-panel">
            <p className="section-kicker dark">Doel gesprek</p>
            <h2>Samen verkennen waar data beter ingezet kan worden.</h2>
            <CheckList
              items={[
                "Verkennen van vraagstukken",
                "Bespreken van mogelijkheden",
                "Inschatten van toegevoegde waarde",
                "Geen verplichtingen, wel een inhoudelijk gesprek",
              ]}
            />
          </div>
          <aside className="contact-card" aria-label="Contact opnemen">
            <h2>Plan een vrijblijvend kennismakingsgesprek</h2>
            <p>
              Bespreek kort welke informatie, dashboards of analyses nodig zijn om betere keuzes te
              maken.
            </p>
            <a className="button button-primary" href="mailto:info@magis-data-intelligence.nl">
              Neem contact op
              <ArrowIcon />
            </a>
          </aside>
        </div>
      </section>
      <section className="page-section page-section-light">
        <div className="site-container split-panel page-visual-split">
          <div>
            <p className="section-kicker dark">Voorbereiding</p>
            <h2>Een goed eerste gesprek vraagt weinig voorbereiding.</h2>
          </div>
          <div>
            <CheckList items={preparation} />
            <img
              src={innerPageImages.dataMeeting}
              alt="Kennismakingsgesprek over data en advies"
            />
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="site-container">
          <div className="section-header">
            <p className="section-kicker dark">Veelgestelde vragen</p>
            <h2>Praktisch rond contact en start.</h2>
            <p>
              Antwoorden op vragen die vaak spelen voordat een organisatie externe data-expertise
              inschakelt.
            </p>
          </div>
          <div className="faq-list">
            {contactFaq.map((item) => (
              <details key={item.question} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
