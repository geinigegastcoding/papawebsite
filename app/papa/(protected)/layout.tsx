import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PortalHeader } from '@/components/papa/portal-header';
import { hasPapaSession } from '@/lib/papa-auth';

export const metadata: Metadata = {
  title: 'Papa tools | Magis',
  description: 'Persoonlijke Luna- en fitnesstools voor Gerhard Magis.',
  robots: { index: false, follow: false },
  manifest: '/papa/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Papa tools', statusBarStyle: 'default' }
};

export default async function ProtectedPapaLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasPapaSession())) redirect('/papa/login');

  return <div className="papa-protected-shell">
    <PortalHeader />
    {children}
  </div>;
}
