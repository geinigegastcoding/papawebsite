'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BarcodeScanner } from '@/components/papa/barcode-scanner';
import type { DietFit, FoodAnalysis } from '@/lib/papa-ai';

const LOG_STORAGE_KEY = 'papa-luna-food-log-v1';
const TARGET_STORAGE_KEY = 'papa-luna-calorie-target-v1';
const DIET_STORAGE_KEY = 'papa-luna-diet-rules-v1';

type LoggedFood = {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  source: string;
  portion: string;
  createdAt: string;
};

type BarcodeProduct = {
  barcode: string;
  name: string;
  brand: string;
  quantity: string;
  servingSize: string;
  servingGrams: number | null;
  image: string | null;
  per100g: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null; fiber: number | null; salt: number | null };
  allergens: string[];
  labels: string[];
  ingredients: string;
  source: string;
  sourceUrl: string;
};

type ManualDraft = { name: string; calories: string; protein: string; carbs: string; fat: string; fiber: string; portion: string };

const EMPTY_MANUAL: ManualDraft = { name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', portion: '1 portie' };

function todayKey(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function numberValue(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 }).format(Math.round(value * 10) / 10);
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addPortion(value: number | null, grams: number): number | null {
  return value === null ? null : Math.round((value * grams / 100) * 10) / 10;
}

function dietFitLabel(value: DietFit): string {
  return value === 'yes' ? 'Waarschijnlijk passend' : value === 'no' ? 'Waarschijnlijk niet passend' : 'Niet zeker';
}

export default function LunaPage() {
  const [logs, setLogs] = useState<LoggedFood[]>([]);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [diet, setDiet] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [manual, setManual] = useState<ManualDraft>(EMPTY_MANUAL);
  const [barcodeCode, setBarcodeCode] = useState('');
  const [barcodeProduct, setBarcodeProduct] = useState<BarcodeProduct | null>(null);
  const [barcodeGrams, setBarcodeGrams] = useState('100');
  const [barcodeBusy, setBarcodeBusy] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);

  useEffect(() => {
    try {
      const storedLogs = JSON.parse(window.localStorage.getItem(LOG_STORAGE_KEY) ?? '[]') as LoggedFood[];
      if (Array.isArray(storedLogs)) setLogs(storedLogs.filter((item) => item && typeof item.name === 'string' && typeof item.date === 'string'));
      const storedTarget = Number(window.localStorage.getItem(TARGET_STORAGE_KEY));
      if (Number.isFinite(storedTarget) && storedTarget >= 500 && storedTarget <= 10000) setTargetCalories(storedTarget);
      setDiet(window.localStorage.getItem(DIET_STORAGE_KEY) ?? '');
    } catch {
      setNotice('Lokale Luna-data konden niet volledig worden gelezen.');
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs)); } catch { setNotice('De log kon niet lokaal worden opgeslagen.'); }
  }, [hydrated, logs]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(TARGET_STORAGE_KEY, String(targetCalories));
    window.localStorage.setItem(DIET_STORAGE_KEY, diet);
  }, [diet, hydrated, targetCalories]);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const today = todayKey();
  const todayLogs = useMemo(() => logs.filter((item) => item.date === today), [logs, today]);
  const totals = useMemo(() => todayLogs.reduce((sum, item) => ({
    calories: sum.calories + item.calories,
    protein: sum.protein + item.protein,
    carbs: sum.carbs + item.carbs,
    fat: sum.fat + item.fat,
    fiber: sum.fiber + item.fiber
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), [todayLogs]);
  const remaining = targetCalories - totals.calories;

  const addLog = (item: Omit<LoggedFood, 'id' | 'date' | 'createdAt'>) => {
    setLogs((current) => [...current, { ...item, id: newId(), date: today, createdAt: new Date().toISOString() }]);
    setNotice(`${item.name} staat in je log.`);
  };

  const addManual = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manual.name.trim() || numberValue(manual.calories) <= 0) {
      setNotice('Vul minstens een naam en calorieën in.');
      return;
    }
    addLog({ name: manual.name.trim(), calories: numberValue(manual.calories), protein: numberValue(manual.protein), carbs: numberValue(manual.carbs), fat: numberValue(manual.fat), fiber: numberValue(manual.fiber), source: 'Handmatig', portion: manual.portion.trim() || '1 portie' });
    setManual(EMPTY_MANUAL);
  };

  const lookupBarcode = useCallback(async (value = barcodeCode) => {
    const code = value.replace(/\D/g, '');
    if (!/^\d{8,14}$/.test(code)) {
      setBarcodeError('Vul een barcode van 8 tot 14 cijfers in.');
      return;
    }
    setBarcodeBusy(true);
    setBarcodeError(null);
    setBarcodeProduct(null);
    try {
      const response = await fetch(`/api/papa/barcode/${code}`);
      const payload = await response.json().catch(() => ({})) as { product?: BarcodeProduct; message?: string };
      if (!response.ok || !payload.product) throw new Error(payload.message ?? 'Product niet gevonden.');
      setBarcodeCode(code);
      setBarcodeProduct(payload.product);
      setBarcodeGrams(String(payload.product.servingGrams ?? 100));
    } catch (error) {
      setBarcodeError(error instanceof Error ? error.message : 'Barcode zoeken is niet gelukt.');
    } finally {
      setBarcodeBusy(false);
    }
  }, [barcodeCode]);

  const onBarcodeDetected = useCallback((code: string) => {
    setScannerOpen(false);
    setBarcodeCode(code);
    void lookupBarcode(code);
  }, [lookupBarcode]);

  const barcodePortion = useMemo(() => {
    if (!barcodeProduct) return null;
    const grams = Math.max(1, numberValue(barcodeGrams));
    return { grams, calories: addPortion(barcodeProduct.per100g.calories, grams), protein: addPortion(barcodeProduct.per100g.protein, grams), carbs: addPortion(barcodeProduct.per100g.carbs, grams), fat: addPortion(barcodeProduct.per100g.fat, grams), fiber: addPortion(barcodeProduct.per100g.fiber, grams) };
  }, [barcodeGrams, barcodeProduct]);

  const addBarcode = () => {
    if (!barcodeProduct || !barcodePortion || barcodePortion.calories === null) {
      setNotice('Dit product heeft geen bruikbare caloriegegevens. Voeg het handmatig toe.');
      return;
    }
    addLog({ name: barcodeProduct.name, calories: barcodePortion.calories, protein: barcodePortion.protein ?? 0, carbs: barcodePortion.carbs ?? 0, fat: barcodePortion.fat ?? 0, fiber: barcodePortion.fiber ?? 0, source: 'Open Food Facts', portion: `${formatNumber(barcodePortion.grams)} g` });
  };

  const choosePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPhotoError('Kies een foto.'); return; }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setAnalysis(null);
    setPhotoError(null);
  };

  const analyzePhoto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!photo) { setPhotoError('Kies eerst een foto.'); return; }
    setPhotoBusy(true);
    setPhotoError(null);
    setAnalysis(null);
    const formData = new FormData();
    formData.set('image', photo);
    formData.set('description', photoDescription);
    formData.set('diet', diet);
    try {
      const response = await fetch('/api/papa/analyze-food', { method: 'POST', body: formData });
      const payload = await response.json().catch(() => ({})) as { result?: FoodAnalysis; message?: string };
      if (!response.ok || !payload.result) throw new Error(payload.message ?? 'Foto-analyse is niet gelukt.');
      setAnalysis(payload.result);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Foto-analyse is niet gelukt.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const addAnalysis = () => {
    if (!analysis) return;
    addLog({ name: 'Foto-schatting', calories: analysis.estimatedCalories, protein: analysis.proteinGrams, carbs: analysis.carbGrams, fat: analysis.fatGrams, fiber: analysis.fiberGrams, source: 'AI-schatting · controleren', portion: `${analysis.calorieRange.low}–${analysis.calorieRange.high} kcal` });
  };

  const removeLog = (id: string) => setLogs((current) => current.filter((item) => item.id !== id));

  if (!hydrated) return <main className="papa-luna-page luna-loading"><span className="papa-wordmark-mark large">M</span><p>Luna wordt geladen…</p></main>;

  return <main className="papa-luna-page">
    <header className="luna-page-header">
      <div><p className="luna-kicker">Luna / voedingshulp</p><h1>Rust in je bord.</h1><p>Log iets snel, controleer een barcode of laat een foto een eerste schatting maken.</p></div>
      <Link className="luna-back-link" href="/papa">← Overzicht</Link>
    </header>

    <section className="luna-balance-card" aria-labelledby="luna-balance-title">
      <div className="luna-balance-copy"><span className="luna-kicker">Vandaag · {todayLogs.length} {todayLogs.length === 1 ? 'item' : 'items'}</span><h2 id="luna-balance-title">{formatNumber(Math.abs(remaining))} <small>{remaining >= 0 ? 'kcal over' : 'kcal boven doel'}</small></h2><p>{remaining >= 0 ? 'Je hebt nog ruimte binnen je ingestelde dagdoel.' : 'Dit is informatie, geen foutmelding. Kijk vooral naar je patroon.'}</p></div>
      <div className="luna-balance-side"><label htmlFor="luna-target">Dagdoel</label><div><input id="luna-target" type="number" min="500" max="10000" step="50" value={targetCalories} onChange={(event) => setTargetCalories(Math.min(10000, Math.max(500, numberValue(event.target.value))))} /><span>kcal</span></div><div className="luna-progress"><span style={{ width: `${Math.min(100, Math.max(0, totals.calories / Math.max(1, targetCalories) * 100))}%` }} /></div><small>{formatNumber(totals.calories)} gegeten</small></div>
    </section>

    <section className="luna-macro-strip" aria-label="Macro totalen">
      <span><b>{formatNumber(totals.protein)} g</b><small>eiwit</small></span><span><b>{formatNumber(totals.carbs)} g</b><small>koolhydraten</small></span><span><b>{formatNumber(totals.fat)} g</b><small>vet</small></span><span><b>{formatNumber(totals.fiber)} g</b><small>vezels</small></span>
    </section>

    <div className="luna-grid">
      <div className="luna-actions-column">
        <section className="luna-panel" id="handmatig">
          <div className="luna-panel-heading"><div><span className="luna-kicker">Snelste route</span><h2>Handmatig toevoegen</h2></div><span className="luna-panel-index">01</span></div>
          <form className="luna-form" onSubmit={addManual}>
            <label>Wat heb je gegeten?<input value={manual.name} onChange={(event) => setManual({ ...manual, name: event.target.value })} placeholder="bijv. boterham met kaas" /></label>
            <div className="luna-field-grid"><label>kcal<input inputMode="numeric" type="number" min="0" value={manual.calories} onChange={(event) => setManual({ ...manual, calories: event.target.value })} /></label><label>portie<input value={manual.portion} onChange={(event) => setManual({ ...manual, portion: event.target.value })} /></label></div>
            <div className="luna-field-grid four"><label>Eiwit g<input type="number" min="0" step=".1" value={manual.protein} onChange={(event) => setManual({ ...manual, protein: event.target.value })} /></label><label>KH g<input type="number" min="0" step=".1" value={manual.carbs} onChange={(event) => setManual({ ...manual, carbs: event.target.value })} /></label><label>Vet g<input type="number" min="0" step=".1" value={manual.fat} onChange={(event) => setManual({ ...manual, fat: event.target.value })} /></label><label>Vezel g<input type="number" min="0" step=".1" value={manual.fiber} onChange={(event) => setManual({ ...manual, fiber: event.target.value })} /></label></div>
            <button className="luna-primary-button" type="submit">Zet in vandaag +</button>
          </form>
        </section>

        <section className="luna-panel" id="barcode">
          <div className="luna-panel-heading"><div><span className="luna-kicker">Nederlandse producten</span><h2>Barcode scannen</h2></div><span className="luna-panel-index">02</span></div>
          <p className="luna-panel-intro">We zoeken de barcode op in Open Food Facts. Staat het product er niet in, dan kun je het gewoon handmatig loggen.</p>
          <div className="luna-barcode-row"><input inputMode="numeric" value={barcodeCode} onChange={(event) => setBarcodeCode(event.target.value.replace(/\D/g, ''))} placeholder="EAN-13 barcode" aria-label="EAN barcode" /><button type="button" className="luna-secondary-button" onClick={() => void lookupBarcode()} disabled={barcodeBusy}>{barcodeBusy ? 'Zoeken…' : 'Zoek'}</button><button type="button" className="luna-camera-button" onClick={() => setScannerOpen(true)} aria-label="Barcode met camera scannen">⌁</button></div>
          {scannerOpen && <BarcodeScanner onDetected={onBarcodeDetected} onClose={() => setScannerOpen(false)} />}
          {barcodeError && <p className="luna-error" role="alert">{barcodeError}</p>}
          {barcodeProduct && barcodePortion && <article className="luna-product-result">
            <div className="luna-product-top">{barcodeProduct.image ? <img src={barcodeProduct.image} alt="" width="52" height="52" /> : <span className="luna-product-placeholder">◎</span>}<div><h3>{barcodeProduct.name}</h3><p>{barcodeProduct.brand || 'Merk onbekend'} · {barcodeProduct.quantity || 'hoeveelheid onbekend'}</p></div></div>
            <div className="luna-portion-row"><label>Hoeveel?<input type="number" min="1" step="1" value={barcodeGrams} onChange={(event) => setBarcodeGrams(event.target.value)} /><span>gram</span></label><div><b>{barcodePortion.calories === null ? '—' : formatNumber(barcodePortion.calories)} kcal</b><small>per {formatNumber(barcodePortion.grams)} g</small></div></div>
            <div className="luna-mini-macros"><span>P {barcodePortion.protein === null ? '—' : `${formatNumber(barcodePortion.protein)} g`}</span><span>KH {barcodePortion.carbs === null ? '—' : `${formatNumber(barcodePortion.carbs)} g`}</span><span>V {barcodePortion.fat === null ? '—' : `${formatNumber(barcodePortion.fat)} g`}</span></div>
            <button className="luna-primary-button" type="button" onClick={addBarcode} disabled={barcodePortion.calories === null}>Voeg product toe</button>
            <a className="luna-source-link" href={barcodeProduct.sourceUrl} target="_blank" rel="noreferrer">Bekijk bron: Open Food Facts ↗</a>
          </article>}
        </section>

        <section className="luna-panel" id="foto">
          <div className="luna-panel-heading"><div><span className="luna-kicker">Eerste schatting</span><h2>Foto → calorieën</h2></div><span className="luna-panel-index">03</span></div>
          <p className="luna-panel-intro">Een foto is een startpunt, geen weegschaal. Controleer de portie voordat je hem opslaat.</p>
          <form className="luna-form" onSubmit={analyzePhoto}>
            <label className="luna-upload"><span>{photo ? 'Andere foto kiezen' : 'Kies of maak een foto'}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" capture="environment" onChange={(event) => choosePhoto(event.target.files?.[0])} /><small>JPG, PNG of WebP · max. 8 MB</small></label>
            {photoPreview && <img className="luna-photo-preview" src={photoPreview} alt="Voorbeeld van gekozen maaltijd" />}
            <label>Beschrijving (optioneel)<textarea value={photoDescription} onChange={(event) => setPhotoDescription(event.target.value)} placeholder="bijv. 2 boterhammen, beetje boter, kop koffie" rows={3} /></label>
            <label>Mijn dieet / aandachtspunt<textarea value={diet} onChange={(event) => setDiet(event.target.value)} placeholder="bijv. vooral eiwitrijk; geen extra regels" rows={2} /></label>
            <button className="luna-primary-button" type="submit" disabled={photoBusy || !photo}>{photoBusy ? 'Foto wordt beoordeeld…' : 'Maak schatting'}</button>
          </form>
          {photoError && <p className="luna-error" role="alert">{photoError}</p>}
          {analysis && <article className="luna-analysis-result" aria-live="polite"><div className="luna-analysis-hero"><div><span className="luna-kicker">Centrale schatting</span><strong>{formatNumber(analysis.estimatedCalories)} kcal</strong><small>waarschijnlijke bandbreedte {analysis.calorieRange.low}–{analysis.calorieRange.high} kcal</small></div><span className={`luna-confidence ${analysis.confidence}`}>{analysis.confidence === 'high' ? 'hoog vertrouwen' : analysis.confidence === 'medium' ? 'middel vertrouwen' : 'laag vertrouwen'}</span></div><div className="luna-mini-macros"><span>P {formatNumber(analysis.proteinGrams)} g</span><span>KH {formatNumber(analysis.carbGrams)} g</span><span>V {formatNumber(analysis.fatGrams)} g</span><span>vezel {formatNumber(analysis.fiberGrams)} g</span></div><div className={`luna-diet-check ${analysis.dietFit}`}><b>{analysis.dietFit === 'yes' ? 'Ja' : analysis.dietFit === 'no' ? 'Nee' : 'Onzeker'} · {dietFitLabel(analysis.dietFit)}</b><span>{analysis.dietReason}</span></div><details><summary>Waar komt de schatting vandaan?</summary><ul>{analysis.foods.map((food) => <li key={`${food.name}-${food.grams}`}><b>{food.name}</b><span>{formatNumber(food.grams)} g · {formatNumber(food.calories)} kcal · {food.rationale}</span></li>)}</ul>{analysis.assumptions.length > 0 && <p><strong>Aannames:</strong> {analysis.assumptions.join(' ')}</p>}</details><button className="luna-primary-button" type="button" onClick={addAnalysis}>Schatting toevoegen aan vandaag</button><p className="luna-disclaimer">{analysis.needsReview ? 'Controleer deze schatting extra goed; de foto laat niet alles betrouwbaar zien.' : 'Controleer de portie en pas hem aan als je meer weet. Dit is geen medisch advies.'}</p></article>}
        </section>
      </div>

      <aside className="luna-panel luna-log-panel" id="vandaag">
        <div className="luna-panel-heading"><div><span className="luna-kicker">Vandaag</span><h2>Je log</h2></div><span className="luna-panel-index">{todayLogs.length}</span></div>
        {todayLogs.length === 0 ? <div className="luna-empty"><span aria-hidden="true">○</span><h3>Nog niets gelogd.</h3><p>Begin met de handmatige invoer, een barcode of een foto.</p></div> : <div className="luna-log-list">{todayLogs.map((item) => <article key={item.id}><div><h3>{item.name}</h3><p>{item.portion} · {item.source}</p></div><strong>{formatNumber(item.calories)} <small>kcal</small></strong><button type="button" onClick={() => removeLog(item.id)} aria-label={`${item.name} verwijderen`}>×</button></article>)}</div>}
        <div className="luna-log-total"><span>Totaal vandaag</span><strong>{formatNumber(totals.calories)} kcal</strong></div>
      </aside>
    </div>

    {notice && <button className="luna-notice" type="button" onClick={() => setNotice(null)} role="status">{notice} ×</button>}
    <p className="luna-footer-note">AI-schattingen worden niet bewaard door deze app. De foto wordt tijdens analyse doorgestuurd naar de ingestelde AI-provider. Open Food Facts levert de barcodegegevens en kan onvolledige of door gebruikers aangeleverde informatie bevatten.</p>
  </main>;
}
