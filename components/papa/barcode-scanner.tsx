'use client';

import { BrowserMultiFormatReader } from '@zxing/browser';
import { useEffect, useRef, useState } from 'react';

export function BarcodeScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    const video = videoRef.current;
    if (!video) return;
    let active = true;
    void reader.decodeFromVideoDevice(undefined, video, (result) => {
      if (!active || !result) return;
      const code = result.getText().replace(/\D/g, '');
      if (!/^\d{8,14}$/.test(code)) return;
      active = false;
      controlsRef.current?.stop();
      onDetected(code);
    }).then((controls) => {
      if (active) controlsRef.current = controls;
      else controls.stop();
    }).catch(() => setError('De camera kon niet worden geopend. Controleer de cameratoestemming en probeer de barcode handmatig.'));

    return () => {
      active = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [onDetected]);

  return <div className="luna-scanner" role="dialog" aria-label="Barcode scannen">
    <div className="luna-scanner-head"><div><span className="luna-kicker">Camera</span><h3>Richt op de barcode</h3></div><button type="button" className="luna-icon-button" onClick={onClose} aria-label="Scanner sluiten">×</button></div>
    <div className="luna-video-frame"><video ref={videoRef} autoPlay muted playsInline /><span className="luna-scan-line" aria-hidden="true" /></div>
    <p className="luna-help">Houd de hele streepjescode in beeld. Op iPhone werkt dit via HTTPS.</p>
    {error && <p className="luna-error" role="alert">{error}</p>}
  </div>;
}
