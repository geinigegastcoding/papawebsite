import type { Metadata } from "next";

import { ComparisonExample, ProcessExample } from "./data-examples";
import { createPageMetadata } from "./metadata";
import {
  ArrowIcon,
  FileIcon,
  Footer,
  Header,
  LogoMark,
  SiteImage,
} from "./site";

export const metadata: Metadata = createPageMetadata({
  title: "Van ruwe data naar inzicht | Magis Data Intelligence",
  description:
    "Van ruwe data naar bruikbare informatie en gedegen advies. Gerhard Magis, PhD, helpt met scherpe data-analyses, rapportages en ondersteuning.",
  path: "/",
  image: "/images/gerhard-cutout.webp",
  socialTitle: "Van ruwe data naar bruikbare informatie en gedegen advies",
});

const experience = [
  ["leiden", "Universiteit Leiden"],
  ["imc", "IMC"],
  ["achmea", "Achmea"],
  ["zilveren-kruis", "Zilveren Kruis"],
  ["zorg-en-zekerheid", "Zorg en Zekerheid"],
];

const rawFiles = [
  { name: "Rauw1.csv", type: "CSV", size: "12 MB" },
  { name: "raw_export.xlsx", type: "XLSX", size: "8.4 MB" },
  { name: "messy_data.json", type: "JSON", size: "4.1 MB" },
  { name: "data_dump.txt", type: "TXT", size: "2.8 MB" },
  { name: "legacy_db.csv", type: "DATABASE", size: "15 MB" },
];
const cleanFiles = [
  { name: "eind.xlsx", type: "XLSX", size: "1.2 MB" },
  { name: "clean_report.csv", type: "CSV", size: "980 KB" },
  { name: "dashboard-ready.xlsx", type: "XLSX", size: "1.5 MB" },
  { name: "processed_data.csv", type: "CSV", size: "760 KB" },
  { name: "clean_database.csv", type: "DATABASE", size: "2.1 MB" },
];
const dataTools = [
  { type: "XLSX", label: "Excel" },
  { type: "CSV", label: "CSV" },
  { type: "DATABASE", label: "Data" },
  { type: "CRM", label: "CRM" },
  { type: "CHART", label: "Inzicht" },
];

const recommendations = [
  {
    name: "Marco Ruiter",
    role: "Directeur Strategische Partnerships bij Dedimo",
    date: "30 november 2016",
    relation: "heeft met Gerhard in hetzelfde team gewerkt",
    quote:
      "Gerhard is een super fijne collega om mee te werken. Hij is inhoudelijk sterk en hij is een erg prettig persoon in omgang. Gerhard heeft complexe tools gebouwd voor Zilveren Kruis waar nog steeds mee gewerkt wordt.",
  },
  {
    name: "Marieke Pronk",
    role: "Directeur Health Contracting & strategisch zorgadviseur",
    date: "23 november 2016",
    relation: "heeft met Gerhard in hetzelfde team gewerkt",
    quote:
      "Gerhard is een fijne collega waar je op kan bouwen. Hij is zeer gedreven en betrokken, kritisch als het moet. Hij kan zeer complexe data-analyses opzetten en begrijpelijk maken voor iedereen, kan van data een goudmijn maken.",
  },
  {
    name: "Guus Mulder",
    role: "Business Intelligence Specialist bij Zilveren Kruis",
    date: "16 november 2016",
    relation: "heeft met Gerhard in verschillende teams gewerkt",
    quote:
      "Samen met Gerhard heb ik benchmarkinformatie voor zorgverleners van Zilveren Kruis geproduceerd. De samenwerking was prettig. Ik heb daarin Gerhard leren kennen als iemand die op hoog analytisch niveau een complex product kan maken. Dit product is nu overgedragen aan Vektis, branche-organisatie voor alle zorgverzekeraars.",
  },
  {
    name: "Paul Wagenaar",
    role: "Specialist Digitale contractering bij Zilveren Kruis",
    date: "8 november 2016",
    relation: "heeft met Gerhard in hetzelfde team gewerkt",
    quote:
      "Gerhard is goed in het gestructureerd analyseren van complexe problemen en het aandragen van haalbare oplossingen. Daarnaast is Gerhard gewoon een heel aangenaam persoon om mee samen te werken :)",
  },
  {
    name: "Sander van Ekeren",
    role: "HR Executive | People Strategy, Performance & Talent | Leadership Development",
    date: "8 november 2016",
    relation: "gaf rechtstreeks leiding aan Gerhard",
    quote:
      "Gerhard is een meer dan uitstekende data-/informatie analist, met een liefde voor complexe vraagstukken. Naast zijn uitmuntende analytische vaardigheden, is hij zeer betrokken bij zijn werk en toont hij eigenaarschap op de momenten die er toe doen. Hij is de eerste die ik zal benaderen als ik een ingewikkeld datagerelateerd vraagstuk moet oplossen.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="intel-hero" aria-labelledby="hero-title">
          <div className="intel-hero-stage">
            <div className="intel-hero-copy" data-reveal>
              <h1 id="hero-title">
                <span>Van ruwe data naar</span>
                <span>bruikbare informatie</span>
                <span>en gedegen advies.</span>
              </h1>
              <p>
                Scherpe data-analyses, bruikbare adviezen en ondersteuning bij
                elke stap.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="/contact">
                  Neem contact op <ArrowIcon />
                </a>
                <a className="button button-dark" href="#ervaringen">
                  Lees ervaringen
                </a>
              </div>
            </div>
            <div className="intel-portrait-wrap">
              <SiteImage
                className="intel-portrait"
                src="/images/gerhard-cutout.webp"
                alt="Gerhard Magis, PhD, data-analist en adviseur"
                priority
              />
            </div>
            <SiteImage
              className="intel-road"
              src="/images/gerhard-road.webp"
              alt="Een klassieke Volvo-vrachtwagen, de J.G. Magis-lesauto en een rode tractor op een gebogen weg"
              priority
            />
          </div>
        </section>

        <section
          className="experience-section"
          aria-labelledby="experience-title"
        >
          <div className="site-container" data-reveal>
            <h2 id="experience-title">Ervaring bij:</h2>
            <div className="experience-logos">
              {experience.map(([id, name]) => (
                <SiteImage
                  key={id}
                  src={`/images/experience-${id}.webp`}
                  alt={name}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          className="data-flow-section"
          id="diensten"
          aria-labelledby="flow-title"
        >
          <div className="site-container data-flow-inner" data-reveal>
            <h2 id="flow-title">Van rauwe naar bruikbare data</h2>
            <div className="data-flow-grid">
              <svg
                className="flow-connections"
                viewBox="0 0 1000 444"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {[38, 130, 222, 314, 406].map((y, index) => (
                  <g
                    key={y}
                    className={
                      index === 1 ? "flow-path is-active" : "flow-path"
                    }
                  >
                    <path d={`M220 ${y} C340 ${y} 335 222 425 222`} />
                    <path d={`M575 222 C665 222 660 ${y} 780 ${y}`} />
                    <circle cx="220" cy={y} r="3" />
                    <circle cx="780" cy={y} r="3" />
                  </g>
                ))}
              </svg>
              <div className="flow-file-column">
                <div className="flow-column-heading">
                  <h3>Rauwe data</h3>
                  <p>Losse bestanden, verschillende formaten</p>
                </div>
                <ul>
                  {rawFiles.map((file, index) => (
                    <li
                      key={file.name}
                      className={
                        index === 1 ? "flow-file is-active" : "flow-file"
                      }
                    >
                      <FileIcon type={file.type} />
                      <div>
                        <strong>{file.name}</strong>
                        <span>
                          {file.type === "DATABASE" ? "CSV" : file.type} ·{" "}
                          {file.size}
                        </span>
                      </div>
                      <span className="flow-file-more" aria-hidden="true">
                        ···
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flow-center">
                <div className="flow-brand-node">
                  <LogoMark />
                  <strong>MagisData</strong>
                </div>
                <p>
                  Analyseren, opschonen
                  <br /> en verbinden
                </p>
              </div>
              <div className="flow-file-column">
                <div className="flow-column-heading">
                  <h3>Schone data</h3>
                  <p>Gestructureerd en klaar voor gebruik</p>
                </div>
                <ul>
                  {cleanFiles.map((file, index) => (
                    <li
                      key={file.name}
                      className={
                        index === 1 ? "flow-file is-active" : "flow-file"
                      }
                    >
                      <FileIcon type={file.type} />
                      <div>
                        <strong>{file.name}</strong>
                        <span>
                          {file.type === "DATABASE" ? "CSV" : file.type} ·{" "}
                          {file.size}
                        </span>
                      </div>
                      <SiteImage
                        className="flow-file-check"
                        src="/icons/circle-check.svg"
                        alt="Gecontroleerd"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <a className="text-link flow-link" href="/diensten">
              Meer over de diensten <ArrowIcon />
            </a>
          </div>
        </section>

        <section
          className="reviews-section"
          id="ervaringen"
          aria-labelledby="reviews-title"
        >
          <div className="site-container">
            <div className="intel-section-heading" data-reveal>
              <div>
                <p className="eyebrow">Reviews</p>
                <h2 id="reviews-title">
                  Geloof niet alleen
                  <br /> mijn woord.
                </h2>
              </div>
              <p>
                Hier zijn een paar aanbevelingen van mensen die met mij hebben
                samengewerkt aan data- en analyseprojecten.
              </p>
            </div>
            <div className="review-grid">
              {recommendations.map((item) => (
                <figure className="review-card" key={item.name} data-reveal>
                  <span className="review-quote-mark" aria-hidden="true">
                    “
                  </span>
                  <blockquote>{item.quote}</blockquote>
                  <figcaption>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                    <small>
                      {item.date}, {item.relation}
                    </small>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section
          className="process-example-section"
          id="werkwijze"
          aria-labelledby="process-title"
        >
          <div className="site-container">
            <div className="intel-section-heading" data-reveal>
              <h2 id="process-title">
                Van eerste contact
                <br /> tot bruikbare data.
              </h2>
              <p>
                Een helder traject waarin we de vraag begrijpen, de situatie
                analyseren, uitwerken en samen afronden.
              </p>
            </div>
            <ProcessExample />
          </div>
        </section>

        <ComparisonExample />

        <section className="data-cta" aria-labelledby="data-cta-title">
          <div className="cloud-ceiling" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="site-container data-cta-copy" data-reveal>
            <h2 id="data-cta-title">Laat je data voor je werken.</h2>
            <p>
              Van losse bestanden naar heldere inzichten. Koppel bronnen,
              <br className="desktop-break" /> structureer data en maak
              rapportages die direct bruikbaar zijn.
            </p>
            <div className="data-cta-prompt">
              <p>
                Combineer deze Excel-, CSV- en CRM-data tot één betrouwbaar
                overzicht en laat zien waar de grootste afwijkingen zitten.
              </p>
              <a className="button button-blue" href="#verschillen">
                <LogoMark />
                Bekijk voorbeeld <ArrowIcon />
              </a>
            </div>
          </div>
          <div className="data-output-art" aria-hidden="true">
            <svg
              className="data-tool-connection"
              viewBox="0 0 1440 260"
              preserveAspectRatio="none"
            >
              <path d="M40 240 C80 50 170 30 285 110 S430 40 560 100 S700 160 805 100 S1030 140 1140 90 S1350 80 1400 240" />
            </svg>
            <div className="data-tools">
              {dataTools.map((tool) => (
                <div
                  className={`data-tool data-tool-${tool.type.toLowerCase()}`}
                  key={tool.type}
                >
                  <FileIcon type={tool.type} />
                  <span>{tool.label}</span>
                </div>
              ))}
            </div>
            <div className="cloud-character-row">
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  className={`cloud-character cloud-character-${index}`}
                  key={index}
                >
                  <span className="cloud-body" />
                  <span className="cloud-eyes">
                    <i />
                    <i />
                  </span>
                  <span className="cloud-legs">
                    <i />
                    <i />
                  </span>
                  {index !== 2 && index !== 7 && (
                    <span className="cloud-prop">
                      {index === 3 ? (
                        <LogoMark />
                      ) : (
                        <FileIcon
                          type={dataTools[index % dataTools.length].type}
                        />
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
