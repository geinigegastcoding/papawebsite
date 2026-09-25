import Link from 'next/link';

export default function PapaHomePage() {
  return <main className="papa-home-page">
    <section className="papa-home-intro">
      <p className="papa-kicker">Jouw persoonlijke gereedschap</p>
      <h1>Twee rustige plekken om je dag goed te sturen.</h1>
      <p>Open Luna om eten eenvoudig te loggen of ga naar Fitness voor je trainingsplan. Je gegevens blijven lokaal in deze browser.</p>
    </section>

    <section className="papa-tool-grid" aria-label="Persoonlijke tools">
      <Link className="papa-tool-card luna-card" href="/papa/luna">
        <span className="papa-tool-number">01</span>
        <span className="papa-tool-icon" aria-hidden="true">◒</span>
        <span className="papa-tool-copy"><strong>Luna</strong><span>Voeding, calorieën en een snelle foto- of barcodescan.</span></span>
        <span className="papa-tool-arrow" aria-hidden="true">↗</span>
      </Link>
      <Link className="papa-tool-card fitness-card" href="/papa/fitness">
        <span className="papa-tool-number">02</span>
        <span className="papa-tool-icon" aria-hidden="true">✦</span>
        <span className="papa-tool-copy"><strong>Fitness</strong><span>Je persoonlijke schema, oefeningen en trainingslogs.</span></span>
        <span className="papa-tool-arrow" aria-hidden="true">↗</span>
      </Link>
    </section>

    <section className="papa-install-card">
      <div><p className="papa-kicker">Op je iPhone of computer</p><h2>Zet deze portal op je beginscherm.</h2><p>iPhone: deelknop → <em>Zet op beginscherm</em>. Computer: gebruik het installatie-icoon in de adresbalk als je browser dat toont.</p></div>
      <span className="papa-install-mark" aria-hidden="true">＋</span>
    </section>
  </main>;
}
