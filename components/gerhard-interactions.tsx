"use client";

import { useEffect, useId, useState } from "react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="gm-mobile-menu" onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); event.currentTarget.querySelector("button")?.focus(); } }}>
      <button className="gm-menu-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {open ? "Sluiten" : "Menu"}<span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && <nav id={id} aria-label="Mobiele navigatie" onClick={() => setOpen(false)}>
        <a href="/diensten">Diensten</a><a href="/werkwijze">Werkwijze</a><a href="/over-mij">Over Gerhard</a><a href="/contact">Kennismaken <span aria-hidden="true">↗</span></a>
      </nav>}
    </div>
  );
}

export function RevealEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) { target.classList.add("gm-inview"); observer.unobserve(target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("#gm-site [data-gm-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return null;
}

const examples = [
  { label: "Overzicht", question: "Hoe ontwikkelen de kosten zich?", answer: "Een trend wordt zichtbaar.", detail: "Een tijdreeks maakt de ontwikkeling begrijpelijk. Het vertrekpunt voor een gerichte vervolgvraag.", values: [42, 49, 46, 61, 58, 72], labels: ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun"], type: "line" },
  { label: "Verdieping", question: "Waar zitten de verschillen?", answer: "Het gemiddelde vertelt niet alles.", detail: "Een vergelijking tussen groepen laat zien waar je verder moet kijken. Verschillen vragen om context.", values: [57, 34, 76, 46, 62, 39], labels: ["A", "B", "C", "D", "E", "F"], type: "bars" },
  { label: "Vooruitkijken", question: "Wat als de trend doorzet?", answer: "Maak aannames bespreekbaar.", detail: "Een scenario geeft richting aan het gesprek. Inclusief de onzekerheid die bij een verwachting hoort.", values: [42, 49, 46, 61, 66, 72], labels: ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun"], type: "forecast" },
];

export function DataExample() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const example = examples[selected];
  const points = example.values.map((value, index) => `${62 + index * 70},${210 - value * 1.8}`).join(" ");
  return (
    <div className="gm-data-example" data-gm-reveal>
      <div className="gm-example-tabs" role="tablist" aria-label="Ontdek drie soorten data-analyse">
        {examples.map((item, index) => <button key={item.label} id={`${id}-tab-${index}`} role="tab" aria-selected={selected === index} aria-controls={`${id}-panel`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (selected + (event.key === "ArrowRight" ? 1 : 2)) % 3;
          setSelected(next);
          document.getElementById(`${id}-tab-${next}`)?.focus();
        }}>{item.label}</button>)}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${selected}`} className="gm-example-panel">
        <div className="gm-example-visual">
          <p className="gm-chart-title">{example.question}</p>
          <svg viewBox="0 0 480 258" role="img" aria-label={`${example.question} Illustratieve waarden: ${example.values.join(", ")}.`}>
            {[30, 90, 150, 210].map((y, index) => <g key={y}><line x1="40" x2="450" y1={y} y2={y} className="gm-chart-grid" /><text x="12" y={y + 4} className="gm-chart-label">{[100, 67, 33, 0][index]}</text></g>)}
            {example.type === "bars" ? example.values.map((value, index) => <rect key={index} x={43 + index * 70} y={210 - value * 1.8} width="38" height={value * 1.8} rx="4" className={index === 2 ? "gm-chart-highlight" : "gm-chart-bar"} />) : <>
              <polyline points={example.type === "forecast" ? points.split(" ").slice(0, 4).join(" ") : points} className="gm-chart-line" />
              {example.type === "forecast" && <polyline points={points.split(" ").slice(3).join(" ")} className="gm-chart-line gm-chart-forecast" />}
              {example.values.map((value, index) => <circle key={index} cx={62 + index * 70} cy={210 - value * 1.8} r="5" className="gm-chart-point" />)}
            </>}
            {example.labels.map((label, index) => <text key={label} x={62 + index * 70} y="242" textAnchor="middle" className="gm-chart-label">{label}</text>)}
          </svg>
          <p className="gm-example-disclaimer">Illustratief voorbeeld met fictieve indexwaarden. Geen klantdata.</p>
        </div>
        <div className="gm-example-insight" aria-live="polite">
          <span className="gm-small-label">Van grafiek naar gesprek</span>
          <h3>{example.answer}</h3><p>{example.detail}</p>
          <a className="gm-text-link" href="/contact">Kennismaken <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </div>
  );
}
