'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export function PortalHeader() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/papa/sw.js', { scope: '/papa/' }).catch((error) => {
      console.warn('Papa PWA could not be registered', error);
    });
  }, []);

  const logout = async () => {
    await fetch('/api/papa/logout', { method: 'POST' });
    window.location.href = '/papa/login';
  };

  return <header className="papa-portal-header">
    <Link className="papa-wordmark" href="/papa" aria-label="Papa tools overzicht">
      <span className="papa-wordmark-mark">M</span>
      <span><strong>Papa tools</strong><small>magisintel.nl</small></span>
    </Link>
    <nav aria-label="Papa tools navigatie">
      <Link href="/papa/luna">Luna</Link>
      <Link href="/papa/fitness">Fitness</Link>
      <button type="button" onClick={() => void logout}>Uitloggen</button>
    </nav>
  </header>;
}
