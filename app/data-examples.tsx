"use client";

import { useState, type KeyboardEvent } from "react";

import { ArrowIcon, FileIcon, Icon, LogoMark, SiteImage } from "./site";

const steps = [
  {
    label: "Eerste contact",
    title: "We beginnen bij de vraag achter de data.",
    text: "Wat wil je weten, welke beslissing wil je nemen en wat ligt er al? In een eerste gesprek maken we de vraag en de verwachtingen concreet.",
    overview: "Vraagverkenning",
    rows: [
      ["Vraagstuk", "Intake", "Besproken", "Wat wil je kunnen beslissen?"],
      [
        "Beschikbare bronnen",
        "Intake",
        "In beeld",
        "Systemen en exports inventariseren",
      ],
      [
        "Gewenst resultaat",
        "Intake",
        "Afstemmen",
        "Een analyse, rapportage of advies",
      ],
      [
        "Vervolgafspraak",
        "Intake",
        "Samen bepalen",
        "Scope en planning afspreken",
      ],
    ],
  },
  {
    label: "Analyse",
    title: "We brengen de huidige situatie helder in kaart.",
    text: "We bekijken databronnen, bestandsstructuren, kwaliteit en knelpunten. Zo wordt snel duidelijk waar winst te behalen valt.",
    overview: "Analyse overzicht",
    rows: [
      ["Rauw1.csv", "CSV", "Controle nodig", "Inconsistente kolomnamen"],
      ["eind.xlsx", "XLSX", "Vergelijking", "Nieuwe versie aanwezig"],
      ["orders_export.xlsx", "XLSX", "Gekoppeld", "Structuur deels bruikbaar"],
      ["legacy_db.csv", "CSV", "Te controleren", "Ontbrekende waarden"],
    ],
  },
  {
    label: "Uitwerking",
    title: "We maken van losse bronnen één samenhangend geheel.",
    text: "We schonen gegevens op, verbinden bronnen en werken de analyse uit. Definities, aannames en verschillen blijven zichtbaar.",
    overview: "Uitwerking overzicht",
    rows: [
      [
        "bronnen_gecombineerd.csv",
        "CSV",
        "Verbonden",
        "Sleutels en definities afgestemd",
      ],
      [
        "datakwaliteit.xlsx",
        "XLSX",
        "Gecontroleerd",
        "Ontbrekende waarden gemarkeerd",
      ],
      [
        "verschillen.xlsx",
        "XLSX",
        "Inzichtelijk",
        "Afwijkingen naast elkaar gezet",
      ],
      [
        "analyse.csv",
        "CSV",
        "Uitgewerkt",
        "Patronen en verklaringen onderzocht",
      ],
    ],
  },
  {
    label: "Oplevering",
    title: "Je krijgt informatie die je direct kunt gebruiken.",
    text: "Een helder rapport, bruikbare bestanden of een dashboard. We leveren op in de vorm die past bij de vraag, met uitleg over uitkomsten en beperkingen.",
    overview: "Oplevering overzicht",
    rows: [
      [
        "managementinformatie.xlsx",
        "XLSX",
        "Gereed",
        "Indicatoren met duidelijke definities",
      ],
      ["schone_data.csv", "CSV", "Gereed", "Gecontroleerde gegevens"],
      ["analyse_en_advies.pdf", "PDF", "Gereed", "Conclusies en aanbevelingen"],
      [
        "toelichting.pdf",
        "PDF",
        "Gereed",
        "Aannames en beperkingen vastgelegd",
      ],
    ],
  },
  {
    label: "Bespreking",
    title: "We zorgen dat het inzicht ook in de praktijk landt.",
    text: "We bespreken de bevindingen, beantwoorden vragen en bepalen welke vervolgstappen zinvol zijn. Zo leidt de analyse tot onderbouwde keuzes.",
    overview: "Bespreking overzicht",
    rows: [
      ["Bevindingen", "Overleg", "Besproken", "Wat vertellen de uitkomsten?"],
      [
        "Aanbevelingen",
        "Overleg",
        "Afgestemd",
        "Welke keuzes zijn onderbouwd?",
      ],
      ["Actiepunten", "Overleg", "Concreet", "Wie pakt welke vervolgstap op?"],
      ["Vervolg", "Overleg", "Samen bepalen", "Ondersteuning waar nodig"],
    ],
  },
];

export function ProcessExample() {
  const [active, setActive] = useState(1);
  const [query, setQuery] = useState("");
  const step = steps[active];
  const rows = step.rows.filter((row) =>
    row
      .join(" ")
      .toLocaleLowerCase("nl")
      .includes(query.trim().toLocaleLowerCase("nl")),
  );

  function selectStep(index: number) {
    setActive(index);
    setQuery("");
  }

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % steps.length;
    else if (event.key === "ArrowLeft")
      next = (index + steps.length - 1) % steps.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = steps.length - 1;
    else return;
    event.preventDefault();
    selectStep(next);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  }

  return (
    <div className="process-example">
      <div
        className="process-tabs"
        role="tablist"
        aria-label="Van eerste contact tot bruikbare data"
      >
        {steps.map((item, index) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            id={`process-tab-${index}`}
            aria-controls="process-panel"
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            onClick={() => selectStep(index)}
            onKeyDown={(event) => handleTabKey(event, index)}
          >
            <span>{index + 1}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div
        className="process-demo"
        role="tabpanel"
        id="process-panel"
        aria-labelledby={`process-tab-${active}`}
        tabIndex={0}
      >
        <div className="process-demo-copy">
          <div className="demo-brand">
            <LogoMark />
            <span>MagisData</span>
          </div>
          <h3>“{step.title}”</h3>
          <p>{step.text}</p>
        </div>
        <div className="analysis-window">
          <div className="analysis-toolbar">
            <h3>
              <SiteImage
                className="toolbar-icon"
                src="/icons/file-search.svg"
                alt=""
              />
              {step.overview}
            </h3>
            <label className="analysis-search">
              <SiteImage
                className="search-icon"
                src="/icons/search.svg"
                alt=""
              />
              <span className="sr-only">
                Zoek in het {step.overview.toLocaleLowerCase("nl")}
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Zoek naar bestanden, bronnen of opmerkingen..."
              />
            </label>
          </div>
          <div
            className="table-scroll"
            role="region"
            aria-label={step.overview}
            tabIndex={0}
          >
            <table className="analysis-table">
              <caption className="sr-only">
                {step.overview} met fictieve voorbeeldgegevens
              </caption>
              <thead>
                <tr>
                  <th scope="col">Bron</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Opmerking</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([source, type, status, note], index) => (
                  <tr
                    key={source}
                    className={index === 1 ? "is-highlighted" : undefined}
                  >
                    <th scope="row">
                      <FileIcon type={type} />
                      {source}
                    </th>
                    <td>{type}</td>
                    <td>
                      <span className="status-dot" />
                      {status}
                    </td>
                    <td>{note}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      Geen resultaten voor “{query}”. Probeer een andere
                      zoekterm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="demo-caption" role="status">
            {query ? `${rows.length} resultaten · ` : ""}Voorbeeld met fictieve
            data
          </p>
        </div>
      </div>
      <a className="text-link process-more" href="/werkwijze">
        Meer over de werkwijze <ArrowIcon />
      </a>
    </div>
  );
}

const invoices = [
  { id: "INV-084", excel: 640, crm: 640 },
  { id: "INV-085", excel: 275, crm: 275 },
  { id: "INV-086", excel: 890, crm: 980 },
  { id: "INV-087", excel: 120, crm: 120 },
];
const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export function ComparisonExample() {
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const rows = onlyDifferences
    ? invoices.filter((invoice) => invoice.excel !== invoice.crm)
    : invoices;

  return (
    <section
      className="comparison-section"
      id="verschillen"
      aria-labelledby="comparison-title"
    >
      <div className="site-container">
        <div className="comparison-eyebrow">
          <div className="demo-brand">
            <LogoMark />
            <span>MagisData</span>
          </div>
          <p>04 / Bronvergelijking</p>
          <span className="demo-label">Voorbeeld · fictieve data</span>
        </div>
        <div className="comparison-heading">
          <div>
            <h2 id="comparison-title">
              Bestanden die elkaar
              <br /> tegenspreken?
            </h2>
            <p>
              We vergelijken bronnen en maken verschillen zichtbaar, in plaats
              van ze stilletjes te negeren.
            </p>
          </div>
          <button
            className="button button-dark"
            type="button"
            aria-pressed={onlyDifferences}
            aria-controls="comparison-table"
            onClick={() => setOnlyDifferences(!onlyDifferences)}
          >
            {onlyDifferences ? "Toon alle regels" : "Bekijk de verschillen"}
            <ArrowIcon />
          </button>
        </div>
        <div className="comparison-demo">
          <aside className="reconciliation-summary">
            <p className="eyebrow">Reconciliatie #R-021</p>
            <h3>Waar komt het verschil vandaan?</h3>
            <p>
              Bedragen, sleutels en statusvelden uit meerdere systemen worden
              naast elkaar gecontroleerd.
            </p>
            <dl>
              <div>
                <dt>Bronnen</dt>
                <dd>CRM + Excel</dd>
              </div>
              <div>
                <dt>Vergeleken regels</dt>
                <dd>850</dd>
              </div>
              <div>
                <dt>Niet-overeenkomend</dt>
                <dd className="blue-text">12</dd>
              </div>
              <div>
                <dt>Resultaat</dt>
                <dd>Onderzoek nodig</dd>
              </div>
            </dl>
            <p className="source-note">
              <span className="status-dot" />
              Herleidbaar naar de oorspronkelijke bron <ArrowIcon />
            </p>
          </aside>
          <div className="comparison-window">
            <div className="comparison-toolbar">
              <Icon name="dashboard" />
              <h3>
                facturen.xlsx <span aria-hidden="true">↔</span> crm_export.csv
              </h3>
              <span>Verschillen</span>
            </div>
            <div
              className="table-scroll"
              role="region"
              aria-label="Bronvergelijking van Excel en CRM"
              tabIndex={0}
            >
              <table className="comparison-table" id="comparison-table">
                <caption className="sr-only">
                  Vier fictieve facturen, waarvan één afwijkt tussen Excel en
                  CRM.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Factuur-ID</th>
                    <th scope="col">Excel</th>
                    <th scope="col">CRM</th>
                    <th scope="col">Resultaat</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((invoice) => {
                    const differs = invoice.excel !== invoice.crm;
                    return (
                      <tr
                        key={invoice.id}
                        className={differs ? "is-different" : undefined}
                      >
                        <th scope="row">#{invoice.id}</th>
                        <td>{euro.format(invoice.excel)}</td>
                        <td>{euro.format(invoice.crm)}</td>
                        <td>
                          <span
                            className={differs ? "status-dot" : "equal-mark"}
                            aria-hidden="true"
                          >
                            {differs ? "" : "✓"}
                          </span>
                          {differs ? "Verschil" : "Gelijk"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="difference-note" role="status">
              <div>
                <strong>
                  <span aria-hidden="true">!</span>Afwijking gevonden
                </strong>
                <span>#INV-086</span>
              </div>
              <p>
                Het factuurbedrag wijkt <strong>{euro.format(90)}</strong> af
                tussen Excel en CRM. Controleer welke bron leidend is.
              </p>
              <footer>
                <span>Brondata</span>
                <span>Beide versies blijven inzichtelijk</span>
              </footer>
            </div>
          </div>
        </div>
        <p className="comparison-disclaimer">
          <span>Selectie van vier voorbeeldregels</span>
          <span>Alle gegevens en resultaten zijn fictieve voorbeelden.</span>
        </p>
      </div>
    </section>
  );
}
