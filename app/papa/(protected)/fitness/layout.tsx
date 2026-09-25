import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './fitquest.css';

export const metadata: Metadata = {
  title: 'Fitness | Papa tools',
  description: 'Persoonlijk trainingsschema en trainingslogs voor Gerhard Magis.',
  robots: { index: false, follow: false }
};

export default function FitnessLayout({ children }: { children: ReactNode }) {
  return <div className="fitquest-surface">{children}</div>;
}
