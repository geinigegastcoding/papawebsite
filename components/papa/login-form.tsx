'use client';

import { useState } from 'react';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/papa/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message ?? 'Inloggen is niet gelukt.');
      window.location.href = '/papa';
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Inloggen is niet gelukt.');
      setBusy(false);
    }
  };

  return <form className="papa-login-form" onSubmit={submit}>
    <label htmlFor="papa-password">Wachtwoord</label>
    <input id="papa-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
    <button className="papa-primary-button" type="submit" disabled={busy}>{busy ? 'Even controleren…' : 'Inloggen'}</button>
    {error && <p className="papa-form-error" role="alert">{error}</p>}
  </form>;
}
