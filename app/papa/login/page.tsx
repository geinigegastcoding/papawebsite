import type { Metadata } from 'next';

import { LoginForm } from '@/components/papa/login-form';

export const metadata: Metadata = {
  title: 'Inloggen | Papa tools',
  description: 'Afgeschermde toegang tot de persoonlijke Luna- en fitnesstools.',
  robots: { index: false, follow: false }
};

export default function PapaLoginPage() {
  return <main className="papa-login-page">
    <div className="papa-login-card">
      <span className="papa-wordmark-mark large">M</span>
      <p className="papa-kicker">Persoonlijke omgeving</p>
      <h1>Welkom terug.</h1>
      <p>Log in om Luna en je trainingsschema te openen.</p>
      <LoginForm />
      <a className="papa-back-link" href="/">Terug naar magisintel.nl</a>
    </div>
  </main>;
}
