'use client';

import { useRef, useState } from 'react';
import type { FitnessSnapshot } from '@/lib/sync';

export default function CloudSync({ snapshot, onSnapshot }: { snapshot: FitnessSnapshot; onSnapshot: (snapshot: FitnessSnapshot) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const download = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'fitquest-papa-backup.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Backup gedownload.');
  };

  const restore = async (file: File) => {
    try {
      const value = JSON.parse(await file.text()) as FitnessSnapshot;
      if (!value || typeof value !== 'object' || !value.trainingState || !Array.isArray(value.trainingState.logs)) throw new Error('Ongeldig backupbestand.');
      onSnapshot(value);
      setNotice('Backup teruggezet op dit apparaat.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Backup kon niet worden gelezen.');
    }
  };

  return <section className="cloud-sync-panel" aria-labelledby="local-backup-title">
    <div className="cloud-sync-copy">
      <span className="kicker">Privé op dit apparaat</span>
      <h2 id="local-backup-title">Backup van je training</h2>
      <p>FitQuest slaat je profiel en logs lokaal op. Download af en toe een backup als je van apparaat wisselt.</p>
    </div>
    <div className="cloud-sync-actions">
      <button type="button" className="secondary-button" onClick={download}>Download backup</button>
      <button type="button" className="primary-button" onClick={() => inputRef.current?.click()}>Zet backup terug</button>
      <input ref={inputRef} className="sr-only" type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void restore(file); event.currentTarget.value = ''; }} />
    </div>
    {notice && <p className="cloud-sync-notice" role="status">{notice}</p>}
  </section>;
}
