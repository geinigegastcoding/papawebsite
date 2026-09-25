import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luna | Papa tools',
  description: 'Persoonlijke voedingslog met barcode- en fotoanalyse.',
  robots: { index: false, follow: false }
};

export default function LunaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
