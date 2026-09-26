'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';

import { BarcodeScanner } from '@/components/papa/barcode-scanner';
import type { DietFit, FoodAnalysis } from '@/lib/papa-ai';
import {
  MEALS,
  MEAL_ICONS,
  MEAL_LABELS,
  LUNA_STORAGE_KEY,
  LEGACY_DIET_STORAGE_KEY,
  LEGACY_LOG_STORAGE_KEY,
  LEGACY_TARGET_STORAGE_KEY,
  addTotals,
  adjustWater,
  allFoodOptions,
  averageNutrition,
  copyLogsToDate,
  copyMealToDate,
  dateKeys,
  displayDate,
  estimateNutrition,
  fitMealsForDay,
  hasCompleteFiberData,
  initialLunaState,
  mealForHour,
  mealLabel,
  migrateLegacyState,
  newLunaId,
  nutritionFor,
  normalizeLunaState,
  repeatSavedMeal,
  repeatFoods,
  savedMealTotals,
  shiftDate,
  targetForDate,
  targetHistoryAfterUpdate,
  todayKey,
  topContributors,
  totalsFor,
  weeklyBudget,
  type ActivityLevel,
  type LunaFood,
  type LunaLog,
  type LunaProfile,
  type LunaState,
  type MealType,
  type NutritionEstimate,
  type PortionTarget
} from '@/lib/luna';

type Tab = 'today' | 'log' | 'insights' | 'you';
type LogFilter = 'all' | 'recent' | 'saved' | 'protein';

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

type ManualDraft = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  servings: string;
  meal: MealType;
};

const EMPTY_MANUAL: ManualDraft = {
  name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', servings: '1', meal: mealForHour()
};

const NAV_ITEMS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'today', label: 'Vandaag', icon: '◒' },
  { id: 'log', label: 'Log', icon: '+' },
  { id: 'insights', label: 'Inzicht', icon: '⌁' },
  { id: 'you', label: 'Jij', icon: '◡' }
];

const ACTIVITY_OPTIONS: Array<{ value: ActivityLevel; label: string }> = [
  { value: 'sedentary', label: 'Zittend / weinig beweging' },
  { value: 'light', label: 'Licht actief' },
  { value: 'moderate', label: 'Gemiddeld actief' },
  { value: 'very-active', label: 'Zeer actief' },
  { value: 'athlete', label: 'Sportief / zwaar actief' }
];

function numberValue(value: string | number | null | undefined, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function nullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 }).format(Math.round(value * 10) / 10);
}

function formatDateLong(date: string): string {
  return new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`));
}

function formatDay(date: string): string {
  return new Intl.DateTimeFormat('nl-NL', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '');
}

function dietFitLabel(value: DietFit): string {
  return value === 'yes' ? 'Past waarschijnlijk' : value === 'no' ? 'Waarschijnlijk niet passend' : 'Nog onzeker';
}

function percent(value: number, total: number): number {
  return Math.min(100, Math.max(0, total > 0 ? (value / total) * 100 : 0));
}

function Section({ eyebrow, title, action, children, className = '' }: { eyebrow?: string; title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`luna-card ${className}`}>
    <div className="luna-section-head">
      <div>{eyebrow && <span className="luna-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>
      {action}
    </div>
    {children}
  </section>;
}

function MacroPills({ totals, compact = false }: { totals: { protein: number; carbs: number; fat: number; fiber?: number }; compact?: boolean }) {
  return <div className={`luna-macro-pills ${compact ? 'compact' : ''}`}>
    <span className="protein"><b>{formatNumber(totals.protein)}g</b> eiwit</span>
    <span className="carbs"><b>{formatNumber(totals.carbs)}g</b> koolh.</span>
    <span className="fat"><b>{formatNumber(totals.fat)}g</b> vet</span>
    {typeof totals.fiber === 'number' && <span className="fiber"><b>{formatNumber(totals.fiber)}g</b> vezels</span>}
  </div>;
}

function Onboarding({
  draft,
  step,
  estimate,
  onChange,
  onNext,
  onBack,
  onEstimate,
  onComplete,
  onSkip
}: {
  draft: LunaProfile;
  step: number;
  estimate: NutritionEstimate | null;
  onChange: (patch: Partial<LunaProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  onEstimate: () => void;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const canContinue = step !== 0 || draft.onboarded;
  return <div className="luna-onboarding-backdrop">
    <section className="luna-onboarding" role="dialog" aria-modal="true" aria-labelledby="luna-onboarding-title">
      <div className="luna-onboarding-art"><img src="/luna/luna_logo.png" alt="Luna" /><span>Jouw rustige voedingsritme.</span></div>
      <div className="luna-onboarding-copy">
        <div className="luna-stepper"><span className="active">{step + 1}</span><i /><span>{step < 3 ? step + 2 : '✓'}</span></div>
        {step === 0 && <>
          <span className="luna-eyebrow">Eerst even veilig</span>
          <h1 id="luna-onboarding-title">Luna werkt met schattingen, jij houdt de regie.</h1>
          <p>De app is bedoeld voor algemene voedingsinformatie voor volwassenen. Foto&apos;s, barcodes en doelen zijn hulpmiddelen — geen medisch advies.</p>
          <label className="luna-check-row"><input type="checkbox" checked={draft.onboarded} onChange={(event) => onChange({ onboarded: event.target.checked })} /><span>Ik ben volwassen en gebruik dit niet als vervanging voor medische begeleiding.</span></label>
        </>}
        {step === 1 && <>
          <span className="luna-eyebrow">Wat wil je voelen?</span>
          <h1 id="luna-onboarding-title">Een doel dat bij je dag past.</h1>
          <div className="luna-choice-grid">
            {['Afvallen', 'Voel je sterker', 'Gewicht behouden', 'Aankomen'].map((goal) => <button key={goal} type="button" className={draft.goal === goal ? 'selected' : ''} onClick={() => onChange({ goal })}><b>{goal}</b><small>{goal === 'Afvallen' ? 'Rustig en haalbaar tekort' : goal === 'Aankomen' ? 'Meer energie met marge' : 'Een helder startpunt'}</small></button>)}
          </div>
          <label className="luna-check-row"><input type="checkbox" checked={draft.vegetarian} onChange={(event) => onChange({ vegetarian: event.target.checked })} /><span>Ik eet vegetarisch</span></label>
        </>}
        {step === 2 && <>
          <span className="luna-eyebrow">Persoonlijke start</span>
          <h1 id="luna-onboarding-title">Geef Luna genoeg context.</h1>
          <div className="luna-onboard-fields">
            <label>Leeftijd<input type="number" min="18" max="110" value={draft.ageYears ?? ''} onChange={(event) => onChange({ ageYears: nullableNumber(event.target.value) })} placeholder="bijv. 42" /></label>
            <label>Lengte (cm)<input type="number" min="120" max="230" value={draft.heightCm ?? ''} onChange={(event) => onChange({ heightCm: nullableNumber(event.target.value) })} placeholder="178" /></label>
            <label>Gewicht (kg)<input type="number" min="35" max="300" step=".1" value={draft.weightKg ?? ''} onChange={(event) => onChange({ weightKg: nullableNumber(event.target.value) })} placeholder="92" /></label>
            <label>Berekening<select value={draft.estimateSex} onChange={(event) => onChange({ estimateSex: event.target.value as LunaProfile['estimateSex'] })}><option value="unspecified">Neutrale schatting</option><option value="male">Man</option><option value="female">Vrouw</option></select></label>
          </div>
          <label className="luna-field-wide">Beweging<select value={draft.activityLevel} onChange={(event) => onChange({ activityLevel: event.target.value as ActivityLevel })}>{ACTIVITY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </>}
        {step === 3 && <>
          <span className="luna-eyebrow">Jouw eerste dag</span>
          <h1 id="luna-onboarding-title">Dit is je startpunt, geen examen.</h1>
          <div className="luna-estimate-card">
            {estimate ? <><strong>{formatNumber(estimate.profile.dailyCalories)} <small>kcal / dag</small></strong><p>Gebaseerd op een onderhoud van ongeveer {formatNumber(estimate.maintenanceCalories)} kcal en {estimate.adjustmentLabel}.</p><MacroPills totals={{ protein: estimate.profile.proteinGrams, carbs: estimate.profile.carbsGrams, fat: estimate.profile.fatGrams }} /></> : <><strong>{formatNumber(draft.dailyCalories)} <small>kcal / dag</small></strong><p>Je kunt ook gewoon met een handmatig dagdoel beginnen.</p></>}
          </div>
          <div className="luna-onboard-fields compact"><label>Dagdoel (kcal)<input type="number" min="500" max="10000" step="10" value={draft.dailyCalories} onChange={(event) => onChange({ dailyCalories: Math.max(500, numberValue(event.target.value, 2000)) })} /></label><label>Waterdoel (ml)<input type="number" min="500" max="10000" step="250" value={draft.waterTargetMl ?? 2000} onChange={(event) => onChange({ waterTargetMl: nullableNumber(event.target.value) })} /></label></div>
          <button type="button" className="luna-text-button" onClick={onEstimate}>Herbereken met mijn gegevens</button>
        </>}
        <div className="luna-onboarding-actions"><button type="button" className="luna-quiet-button" onClick={step === 0 ? onSkip : onBack}>{step === 0 ? 'Later instellen' : 'Terug'}</button>{step < 3 ? <button type="button" className="luna-primary" disabled={!canContinue} onClick={onNext}>Verder <span>→</span></button> : <button type="button" className="luna-primary" onClick={onComplete}>Start met Luna <span>→</span></button>}</div>
      </div>
    </section>
  </div>;
}

export default function LunaPage() {
  const [state, setState] = useState<LunaState>(() => initialLunaState());
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>('today');
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [notice, setNotice] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingDraft, setOnboardingDraft] = useState<LunaProfile>(initialLunaState().profile);
  const [estimatePreview, setEstimatePreview] = useState<NutritionEstimate | null>(null);
  const [profileDraft, setProfileDraft] = useState<LunaProfile>(initialLunaState().profile);
  const [expandedMeals, setExpandedMeals] = useState<Record<MealType, boolean>>({ breakfast: true, lunch: true, dinner: true, snack: true });
  const [selectedMeal, setSelectedMeal] = useState<MealType>(mealForHour());
  const [manual, setManual] = useState<ManualDraft>(EMPTY_MANUAL);
  const [manualSave, setManualSave] = useState(true);
  const [search, setSearch] = useState('');
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const [portionTarget, setPortionTarget] = useState<PortionTarget>('servings');
  const [selectedFood, setSelectedFood] = useState<LunaFood | null>(null);
  const [portionValue, setPortionValue] = useState('1');
  const [editingLog, setEditingLog] = useState<LunaLog | null>(null);
  const [editingServings, setEditingServings] = useState('1');
  const [editingMeal, setEditingMeal] = useState<MealType>('snack');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeCode, setBarcodeCode] = useState('');
  const [barcodeProduct, setBarcodeProduct] = useState<BarcodeProduct | null>(null);
  const [barcodeGrams, setBarcodeGrams] = useState('100');
  const [barcodeBusy, setBarcodeBusy] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [saveMealSource, setSaveMealSource] = useState<MealType | null>(null);
  const [saveMealName, setSaveMealName] = useState('');
  const [insightRange, setInsightRange] = useState<7 | 30 | 0>(7);

  useEffect(() => {
    try {
      const stored = normalizeLunaState(JSON.parse(window.localStorage.getItem(LUNA_STORAGE_KEY) ?? 'null'));
      const migrated = stored ?? migrateLegacyState(
        JSON.parse(window.localStorage.getItem(LEGACY_LOG_STORAGE_KEY) ?? 'null'),
        window.localStorage.getItem(LEGACY_TARGET_STORAGE_KEY),
        window.localStorage.getItem(LEGACY_DIET_STORAGE_KEY)
      );
      setState(migrated);
      setProfileDraft(migrated.profile);
      setOnboardingDraft(migrated.profile);
      setShowOnboarding(!migrated.profile.onboarded);
    } catch {
      setNotice('Luna kon je lokale gegevens niet volledig lezen. Er is een lege start gebruikt.');
      setShowOnboarding(true);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(LUNA_STORAGE_KEY, JSON.stringify(state));
    } catch {
      setNotice('Luna kon de wijziging niet lokaal opslaan.');
    }
  }, [hydrated, state]);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  useEffect(() => {
    setProfileDraft(state.profile);
  }, [state.profile]);

  const profile = useMemo(() => targetForDate(state, selectedDate), [selectedDate, state]);
  const selectedLogs = useMemo(() => state.logs.filter((log) => log.date === selectedDate).sort((a, b) => (a.loggedAtMinutes ?? 0) - (b.loggedAtMinutes ?? 0)), [selectedDate, state.logs]);
  const totals = useMemo(() => totalsFor(state.logs, selectedDate), [selectedDate, state.logs]);
  const today = todayKey();
  const isToday = selectedDate === today;
  const remaining = profile.dailyCalories - totals.calories;
  const water = state.waterMlByDate[selectedDate] ?? 0;
  const waterTarget = profile.waterTargetMl ?? 2000;
  const budget = useMemo(() => weeklyBudget(state, selectedDate), [selectedDate, state]);
  const catalog = useMemo(() => {
    const byId = new Map<string, LunaFood>();
    for (const food of allFoodOptions(state)) byId.set(food.id, food);
    return [...byId.values()];
  }, [state]);
  const recentFoods = useMemo(() => repeatFoods(state.logs, 12).map((item) => item.food), [state.logs]);
  const recommendations = useMemo(() => fitMealsForDay(catalog, totals, profile), [catalog, profile, totals]);
  const dateRail = useMemo(() => Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 3)), [today]);
  const selectedFoodServings = useMemo(() => {
    if (!selectedFood) return 1;
    const value = Math.max(.01, numberValue(portionValue, 1));
    if (portionTarget === 'calories') return selectedFood.calories > 0 ? value / selectedFood.calories : 1;
    if (portionTarget === 'protein') return selectedFood.protein > 0 ? value / selectedFood.protein : 1;
    return value;
  }, [portionTarget, portionValue, selectedFood]);
  const selectedFoodNutrition = useMemo(() => selectedFood ? nutritionFor(selectedFood, selectedFoodServings) : null, [selectedFood, selectedFoodServings]);
  const filteredFoods = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let foods = catalog;
    if (logFilter === 'recent') foods = recentFoods;
    if (logFilter === 'saved') foods = state.savedFoods;
    if (logFilter === 'protein') foods = foods.filter((food) => food.protein >= 20);
    if (needle) foods = foods.filter((food) => `${food.name} ${food.brand} ${food.source}`.toLowerCase().includes(needle));
    return foods.slice(0, 80);
  }, [catalog, logFilter, recentFoods, search, state.savedFoods]);
  const rangeLogs = useMemo(() => {
    if (insightRange === 0) return state.logs;
    const cutoff = shiftDate(today, -(insightRange - 1));
    return state.logs.filter((log) => log.date >= cutoff && log.date <= today);
  }, [insightRange, state.logs, today]);
  const insightAverage = useMemo(() => averageNutrition(rangeLogs), [rangeLogs]);
  const insightTop = useMemo(() => topContributors(rangeLogs), [rangeLogs]);
  const insightDays = useMemo(() => dateKeys(today, 7).reverse(), [today]);

  const addFood = useCallback((food: LunaFood, servings: number, meal: MealType = selectedMeal, date = selectedDate) => {
    const safeServings = Math.max(.01, Number.isFinite(servings) ? servings : 1);
    setState((current) => ({ ...current, logs: [...current.logs, { id: newLunaId('log'), date, meal, food, servings: safeServings, loggedAtMinutes: new Date().getHours() * 60 + new Date().getMinutes() }] }));
    setNotice(`${food.name} staat bij ${mealLabel(meal).toLowerCase()}.`);
  }, [selectedDate, selectedMeal]);

  const saveFood = useCallback((food: LunaFood) => {
    setState((current) => current.savedFoods.some((item) => item.id === food.id) ? current : { ...current, savedFoods: [food, ...current.savedFoods].slice(0, 500) });
    setNotice(`${food.name} is opgeslagen bij je favorieten.`);
  }, []);

  const addManual = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manual.name.trim() || numberValue(manual.calories) <= 0) {
      setNotice('Vul minstens een naam en calorieën in.');
      return;
    }
    const food: LunaFood = { id: newLunaId('food'), name: manual.name.trim(), brand: '', servingSize: '1 portie', calories: numberValue(manual.calories), protein: numberValue(manual.protein), carbs: numberValue(manual.carbs), fat: numberValue(manual.fat), fiber: numberValue(manual.fiber), source: 'Handmatig', fiberKnown: manual.fiber.trim() !== '' };
    addFood(food, numberValue(manual.servings, 1), manual.meal);
    if (manualSave) saveFood(food);
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

  const barcodePortion = useMemo(() => {
    if (!barcodeProduct) return null;
    const grams = Math.max(1, numberValue(barcodeGrams, 100));
    const scale = grams / 100;
    return { grams, calories: barcodeProduct.per100g.calories === null ? null : barcodeProduct.per100g.calories * scale, protein: barcodeProduct.per100g.protein === null ? null : barcodeProduct.per100g.protein * scale, carbs: barcodeProduct.per100g.carbs === null ? null : barcodeProduct.per100g.carbs * scale, fat: barcodeProduct.per100g.fat === null ? null : barcodeProduct.per100g.fat * scale, fiber: barcodeProduct.per100g.fiber === null ? null : barcodeProduct.per100g.fiber * scale };
  }, [barcodeGrams, barcodeProduct]);

  const addBarcode = () => {
    if (!barcodeProduct || !barcodePortion || barcodePortion.calories === null) {
      setNotice('Dit product heeft geen bruikbare caloriegegevens. Voeg het handmatig toe.');
      return;
    }
    const food: LunaFood = { id: `barcode-${barcodeProduct.barcode}`, name: barcodeProduct.name, brand: barcodeProduct.brand, servingSize: '100 g', calories: barcodeProduct.per100g.calories ?? 0, protein: barcodeProduct.per100g.protein ?? 0, carbs: barcodeProduct.per100g.carbs ?? 0, fat: barcodeProduct.per100g.fat ?? 0, fiber: barcodeProduct.per100g.fiber ?? 0, source: 'Open Food Facts', barcode: barcodeProduct.barcode, imageUrl: barcodeProduct.image ?? undefined, fiberKnown: barcodeProduct.per100g.fiber !== null };
    addFood(food, barcodePortion.grams / 100, selectedMeal);
    saveFood(food);
  };

  const onBarcodeDetected = useCallback((code: string) => {
    setScannerOpen(false);
    setTab('log');
    setBarcodeCode(code);
    void lookupBarcode(code);
  }, [lookupBarcode]);

  const choosePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPhotoError('Kies een foto.'); return; }
    if (file.size > 8 * 1024 * 1024) { setPhotoError('De foto is groter dan 8 MB. Kies een kleinere foto.'); return; }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setAnalysis(null);
    setPhotoError(null);
  };

  const analyzePhoto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!photo) { setPhotoError('Kies eerst een foto.'); return; }
    setPhotoBusy(true);
    setPhotoError(null);
    setAnalysis(null);
    const formData = new FormData();
    formData.set('image', photo);
    formData.set('description', photoDescription);
    formData.set('diet', state.dietRules);
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
    const food: LunaFood = { id: newLunaId('ai-food'), name: analysis.foods.slice(0, 3).map((item) => item.name).join(', ') || 'Foto-schatting', brand: 'Luna foto-analyse', servingSize: `${analysis.calorieRange.low}–${analysis.calorieRange.high} kcal`, calories: analysis.estimatedCalories, protein: analysis.proteinGrams, carbs: analysis.carbGrams, fat: analysis.fatGrams, fiber: analysis.fiberGrams, source: 'AI-schatting · controleren', fiberKnown: true, icon: '📷' };
    addFood(food, 1, selectedMeal);
    saveFood(food);
  };

  const removeLog = (id: string) => setState((current) => ({ ...current, logs: current.logs.filter((log) => log.id !== id) }));

  const openEditLog = (log: LunaLog) => {
    setEditingLog(log);
    setEditingServings(String(log.servings));
    setEditingMeal(log.meal);
  };

  const saveLogEdit = () => {
    if (!editingLog) return;
    setState((current) => ({ ...current, logs: current.logs.map((log) => log.id === editingLog.id ? { ...log, servings: Math.max(.01, numberValue(editingServings, 1)), meal: editingMeal } : log) }));
    setEditingLog(null);
    setNotice('Je log is bijgewerkt.');
  };

  const openFood = (food: LunaFood) => {
    setSelectedFood(food);
    setPortionTarget('servings');
    setPortionValue('1');
  };

  const addSelectedFood = () => {
    if (!selectedFood) return;
    addFood(selectedFood, selectedFoodServings, selectedMeal);
    setSelectedFood(null);
  };

  const saveMeal = () => {
    if (!saveMealSource || !saveMealName.trim()) return;
    const entries = selectedLogs.filter((log) => log.meal === saveMealSource).map((log) => ({ food: log.food, servings: log.servings }));
    if (!entries.length) { setNotice('Deze maaltijd heeft nog geen items.'); return; }
    setState((current) => ({ ...current, savedMeals: [{ id: newLunaId('meal'), name: saveMealName.trim(), meal: saveMealSource, entries }, ...current.savedMeals].slice(0, 500) }));
    setSaveMealSource(null);
    setSaveMealName('');
    setNotice('Maaltijd opgeslagen.');
  };

  const repeatYesterday = () => {
    setState((current) => copyLogsToDate(current, shiftDate(selectedDate, -1), selectedDate));
    setNotice('De vorige dag is gekopieerd. Controleer de porties gerust.');
  };

  const repeatMeal = (meal: MealType) => {
    setState((current) => copyMealToDate(current, shiftDate(selectedDate, -1), selectedDate, meal));
    setNotice(`${mealLabel(meal)} van de vorige dag is gekopieerd.`);
  };

  const updateWater = (delta: number) => setState((current) => adjustWater(current, selectedDate, delta));

  const saveProfile = () => {
    const next = { ...profileDraft, onboarded: true };
    setState((current) => ({ ...current, profile: next, targetHistory: targetHistoryAfterUpdate(current, next, today) }));
    setNotice('Je Luna-doelen zijn bijgewerkt.');
  };

  const calculateProfile = () => {
    const estimate = estimateNutrition(profileDraft);
    if (!estimate) { setNotice('Vul leeftijd, lengte en gewicht in voor een persoonlijke schatting.'); return; }
    setEstimatePreview(estimate);
    setProfileDraft({ ...estimate.profile, onboarded: true });
    setNotice('Nieuwe startdoelen berekend. Controleer ze en sla ze op.');
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `luna-export-${today}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File | undefined) => {
    if (!file) return;
    try {
      const next = normalizeLunaState(JSON.parse(await file.text()));
      if (!next) throw new Error('Ongeldige Luna-export.');
      setState(next);
      setProfileDraft(next.profile);
      setNotice('Luna-export geïmporteerd.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Importeren is niet gelukt.');
    }
  };

  const completeOnboarding = () => {
    const next = { ...onboardingDraft, onboarded: true };
    setState((current) => ({ ...current, profile: next, targetHistory: targetHistoryAfterUpdate(current, next, today) }));
    setProfileDraft(next);
    setShowOnboarding(false);
    setTab('today');
    setNotice('Welkom bij Luna. Je startdoelen staan klaar.');
  };

  const skipOnboarding = () => {
    const next = { ...state.profile, onboarded: true };
    setState((current) => ({ ...current, profile: next }));
    setProfileDraft(next);
    setShowOnboarding(false);
  };

  if (!hydrated) return <main className="luna-app luna-loading"><img src="/luna/luna_logo.png" alt="Luna" /><p>Je rustige voedingsruimte wordt geladen…</p></main>;

  return <main className="luna-app">
    <aside className="luna-sidebar">
      <Link className="luna-brand" href="/papa"><img src="/luna/luna_logo.png" alt="Luna" /><span>persoonlijke voeding</span></Link>
      <div className="luna-sidebar-date"><span>Je logboek</span><b>{formatDateLong(selectedDate)}</b></div>
      <nav aria-label="Luna navigatie">{NAV_ITEMS.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} type="button" onClick={() => setTab(item.id)}><span>{item.icon}</span>{item.label}{item.id === 'log' && <i>+</i>}</button>)}</nav>
      <div className="luna-sidebar-footer"><img src="/luna/luna_bunny_poses.png" alt="" /><p>Een goed ritme is<br /><b>geen perfect ritme.</b></p><Link href="/papa">← Papa tools</Link></div>
    </aside>

    <div className="luna-main">
      <header className="luna-mobile-header"><Link href="/papa" aria-label="Terug naar Papa tools">←</Link><img src="/luna/luna_logo.png" alt="Luna" /><button type="button" onClick={() => setTab('you')} aria-label="Open je profiel">◡</button></header>
      <div className="luna-date-rail" aria-label="Kies een dag">{dateRail.map((date) => <button key={date} type="button" className={selectedDate === date ? 'active' : ''} onClick={() => setSelectedDate(date)}><small>{formatDay(date)}</small><b>{date.slice(-2)}</b>{date === today && <i>nu</i>}</button>)}</div>

      <div className="luna-content">
        {tab === 'today' && <>
          <div className="luna-page-intro"><div><span className="luna-eyebrow">{isToday ? 'Vandaag, stap voor stap' : formatDateLong(selectedDate)}</span><h1>{isToday ? 'Rust in je bord.' : 'Terugkijken zonder oordeel.'}</h1><p>{remaining >= 0 ? `${formatNumber(remaining)} kcal ruimte over. Wat past er nu bij jou?` : `${formatNumber(Math.abs(remaining))} kcal boven je startdoel. Kijk naar je week, niet naar één getal.`}</p></div><div className="luna-intro-actions"><button type="button" className="luna-outline-button" onClick={() => setTab('log')}>+ Eten loggen</button><button type="button" className="luna-coral-button" onClick={() => { setTab('log'); document.getElementById('luna-photo')?.scrollIntoView({ behavior: 'smooth' }); }}>📷 Foto</button></div></div>
          <section className="luna-hero-grid">
            <div className="luna-balance-card"><div className="luna-gauge-wrap"><svg className="luna-gauge" viewBox="0 0 220 132" role="img" aria-label={`${formatNumber(totals.calories)} van ${formatNumber(profile.dailyCalories)} kilocalorieën gelogd`}><path className="track" d="M 22 108 A 88 88 0 0 1 198 108" /><path className="value" d="M 22 108 A 88 88 0 0 1 198 108" strokeDasharray={`${Math.PI * 88 * percent(totals.calories, profile.dailyCalories) / 100} ${Math.PI * 88}`} /></svg><div className="luna-gauge-number"><strong>{formatNumber(Math.max(0, remaining))}</strong><span>kcal over</span></div><img src="/luna/luna_bunny_poses.png" alt="" className="luna-gauge-bunny" /></div><div className="luna-balance-meta"><span>{formatNumber(totals.calories)} gegeten</span><span>doel {formatNumber(profile.dailyCalories)}</span></div><div className="luna-goal-strip"><span>Dagbalans</span><b>{remaining >= 0 ? 'Je ligt op koers' : 'Vandaag was ruimer'}</b></div></div>
            <div className="luna-day-summary"><span className="luna-eyebrow">Jouw basis</span><h2>Goed bezig,<br /><em>op jouw manier.</em></h2><MacroPills totals={totals} /><div className="luna-summary-art"><img src="/luna/luna_picnic_foods.png" alt="Illustratie van verschillende voedingsmiddelen" /></div></div>
          </section>
          <section className="luna-meal-section"><div className="luna-section-head"><div><span className="luna-eyebrow">Eetmomenten</span><h2>Wat staat er op je dag?</h2></div><button type="button" className="luna-text-button" onClick={repeatYesterday}>↺ Kopieer gisteren</button></div><div className="luna-meal-grid">{MEALS.map((meal) => {
            const mealLogs = selectedLogs.filter((log) => log.meal === meal);
            const mealTotals = mealLogs.reduce((sum, log) => addTotals(sum, nutritionFor(log.food, log.servings)), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
            const expanded = expandedMeals[meal];
            return <article key={meal} className={`luna-meal-card ${meal}`}><button type="button" className="luna-meal-toggle" onClick={() => setExpandedMeals((current) => ({ ...current, [meal]: !current[meal] }))}><span className="luna-meal-icon">{MEAL_ICONS[meal]}</span><span><b>{MEAL_LABELS[meal]}</b><small>{mealLogs.length ? `${mealLogs.length} item${mealLogs.length === 1 ? '' : 's'}` : 'Nog open'}</small></span><strong>{mealLogs.length ? `${formatNumber(mealTotals.calories)} kcal` : '—'}</strong><i>{expanded ? '−' : '+'}</i></button>{expanded && <div className="luna-meal-body">{mealLogs.length ? mealLogs.map((log) => <div className="luna-log-row" key={log.id}><button type="button" className="luna-food-main" onClick={() => openEditLog(log)}><span className="luna-food-icon">{log.food.icon ?? '🥣'}</span><span><b>{log.food.name}</b><small>{formatNumber(log.servings)} × {log.food.servingSize}</small></span></button><strong>{formatNumber(nutritionFor(log.food, log.servings).calories)}<small> kcal</small></strong><button type="button" className="luna-row-action" onClick={() => saveFood(log.food)} aria-label={`${log.food.name} opslaan`}>♡</button><button type="button" className="luna-row-action danger" onClick={() => removeLog(log.id)} aria-label={`${log.food.name} verwijderen`}>×</button></div>) : <p className="luna-meal-empty">Nog niets gepland. <button type="button" onClick={() => { setSelectedMeal(meal); setTab('log'); }}>Voeg iets toe →</button></p>}<div className="luna-meal-actions"><button type="button" onClick={() => { setSelectedMeal(meal); setTab('log'); }}>+ Toevoegen</button>{mealLogs.length > 0 && <button type="button" onClick={() => setSaveMealSource(meal)}>♡ Bewaar maaltijd</button>}{!isToday && <button type="button" onClick={() => repeatMeal(meal)}>↺ Herhaal vorige</button>}</div></div>}</article>;
          })}</div></section>
          <div className="luna-two-column"><Section eyebrow="Hydratatie" title="Water, ook een kleine stap." className="luna-water-card"><div className="luna-water-layout"><img src="/luna/luna_water_bottle.png" alt="Waterfles" /><div><strong>{formatNumber(water)} <small>/ {formatNumber(waterTarget)} ml</small></strong><div className="luna-progress"><span style={{ width: `${percent(water, waterTarget)}%` }} /></div><div className="luna-water-actions"><button type="button" onClick={() => updateWater(-250)}>− 250</button><button type="button" onClick={() => updateWater(250)}>+ 250</button><button type="button" onClick={() => updateWater(500)}>+ 500</button></div></div></div></Section><Section eyebrow="Flexibele week" title="Ruimte over je week." className="luna-week-card"><div className="luna-week-number"><strong>{formatNumber(budget.averageRemainingPerDay)}</strong><span>kcal gemiddeld<br />per resterende dag</span></div><div className="luna-week-bars">{budget.days.map((day) => <div key={day.date} title={`${displayDate(day.date)}: ${formatNumber(day.consumed)} kcal`}><span style={{ height: `${Math.min(100, Math.max(4, percent(day.consumed, day.target)))}%` }} /><small>{formatDay(day.date).slice(0, 2)}</small></div>)}</div><p>{budget.remaining >= 0 ? 'Niet elke dag hoeft hetzelfde te zijn. Je week telt mee.' : 'Deze week zit je boven budget; gebruik dit als informatie, niet als straf.'}</p></Section></div>
          <div className="luna-two-column"><Section eyebrow="Snel opnieuw" title="Je vaste favorieten"><div className="luna-favorite-list">{repeatFoods(state.logs.filter((log) => log.date !== selectedDate), 4).map(({ food, log }) => <button type="button" key={food.id} onClick={() => addFood(food, log.servings, selectedMeal)}><span>{food.icon ?? '🍽️'}</span><span><b>{food.name}</b><small>{formatNumber(nutritionFor(food, log.servings).calories)} kcal · {formatNumber(log.servings)}×</small></span><i>+</i></button>)}{repeatFoods(state.logs.filter((log) => log.date !== selectedDate), 4).length === 0 && <p className="luna-muted">Je herhalingen verschijnen hier zodra je iets logt.</p>}</div>{state.savedMeals.length > 0 && <div className="luna-saved-meal-list"><span className="luna-eyebrow">Opgeslagen maaltijden</span>{state.savedMeals.slice(0, 4).map((meal) => <button type="button" key={meal.id} onClick={() => { setState((current) => repeatSavedMeal(current, meal, selectedDate)); setNotice(`${meal.name} is toegevoegd.`); }}><span>🍱</span><span><b>{meal.name}</b><small>{formatNumber(savedMealTotals(meal).calories)} kcal · {meal.entries.length} items</small></span><i>+</i></button>)}</div>}</Section><Section eyebrow="Past bij je ruimte" title="Fits your day"><div className="luna-recommendations">{recommendations.length ? recommendations.map((item) => <button type="button" key={item.food.id} onClick={() => openFood(item.food)}><span>{item.food.icon ?? '🥗'}</span><span><b>{item.food.name}</b><small>{formatNumber(item.food.calories)} kcal · {formatNumber(item.food.protein)}g eiwit</small></span><i>+</i></button>) : <p className="luna-muted">Je dagdoel is bereikt. Drink wat water en kijk later opnieuw.</p>}</div></Section></div>
        </>}

        {tab === 'log' && <>
          <div className="luna-page-intro"><div><span className="luna-eyebrow">Logboek · {formatDateLong(selectedDate)}</span><h1>Maak het jezelf makkelijk.</h1><p>Kies iets uit je vaste lijst, scan een product, voeg snel toe of laat Luna naar een foto kijken.</p></div><div className="luna-intro-actions"><select className="luna-meal-select" value={selectedMeal} onChange={(event) => setSelectedMeal(event.target.value as MealType)} aria-label="Eetmoment voor nieuwe items">{MEALS.map((meal) => <option key={meal} value={meal}>{MEAL_LABELS[meal]}</option>)}</select></div></div>
          <section className="luna-log-tools"><div className="luna-search-wrap"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Zoek eten, recept of favoriet…" aria-label="Zoek eten" /></div><div className="luna-filter-row">{([['all', 'Alles'], ['recent', 'Recent'], ['saved', 'Favorieten'], ['protein', 'Eiwitrijk']] as Array<[LogFilter, string]>).map(([value, label]) => <button type="button" className={logFilter === value ? 'active' : ''} key={value} onClick={() => setLogFilter(value)}>{label}</button>)}</div></section>
          <div className="luna-log-layout"><div className="luna-food-library"><div className="luna-section-head"><div><span className="luna-eyebrow">{filteredFoods.length} keuzes</span><h2>Kies uit Luna</h2></div><span className="luna-library-note">Klik voor portie</span></div><div className="luna-food-grid">{filteredFoods.map((food) => <article key={food.id} className="luna-food-card"><button type="button" className="luna-food-card-main" onClick={() => openFood(food)}><span className="luna-food-large-icon">{food.icon ?? '🍽️'}</span><span><b>{food.name}</b><small>{food.brand || food.source}</small><em>{formatNumber(food.calories)} kcal · {formatNumber(food.protein)}g eiwit</em></span></button><button type="button" className="luna-heart-button" onClick={() => saveFood(food)} aria-label={`${food.name} bewaren`}>{state.savedFoods.some((item) => item.id === food.id) ? '♥' : '♡'}</button></article>)}</div>{filteredFoods.length === 0 && <div className="luna-empty-state"><span>⌕</span><h3>Niets gevonden.</h3><p>Probeer een andere zoekterm of voeg het handmatig toe.</p></div>}</div><div className="luna-log-side"><Section eyebrow="Snel toevoegen" title="Handmatig"><form className="luna-form luna-manual-form" onSubmit={addManual}><label>Naam<input value={manual.name} onChange={(event) => setManual({ ...manual, name: event.target.value })} placeholder="bijv. boterham met kaas" /></label><div className="luna-form-grid"><label>Kcal<input type="number" min="0" value={manual.calories} onChange={(event) => setManual({ ...manual, calories: event.target.value })} /></label><label>Porties<input type="number" min=".01" step=".25" value={manual.servings} onChange={(event) => setManual({ ...manual, servings: event.target.value })} /></label></div><div className="luna-form-grid four"><label>P<input type="number" min="0" step=".1" value={manual.protein} onChange={(event) => setManual({ ...manual, protein: event.target.value })} /></label><label>KH<input type="number" min="0" step=".1" value={manual.carbs} onChange={(event) => setManual({ ...manual, carbs: event.target.value })} /></label><label>V<input type="number" min="0" step=".1" value={manual.fat} onChange={(event) => setManual({ ...manual, fat: event.target.value })} /></label><label>Vezel<input type="number" min="0" step=".1" value={manual.fiber} onChange={(event) => setManual({ ...manual, fiber: event.target.value })} /></label></div><label>Eetmoment<select value={manual.meal} onChange={(event) => setManual({ ...manual, meal: event.target.value as MealType })}>{MEALS.map((meal) => <option key={meal} value={meal}>{MEAL_LABELS[meal]}</option>)}</select></label><label className="luna-check-row compact"><input type="checkbox" checked={manualSave} onChange={(event) => setManualSave(event.target.checked)} /><span>Bewaar ook als favoriet</span></label><button type="submit" className="luna-primary">Zet op {isToday ? 'vandaag' : displayDate(selectedDate)} +</button></form></Section><Section eyebrow="Producten" title="Barcode"><p className="luna-card-intro">Scan een Nederlandse verpakking of typ de EAN-code in. De gegevens komen via Open Food Facts.</p><div className="luna-barcode-row"><input inputMode="numeric" value={barcodeCode} onChange={(event) => setBarcodeCode(event.target.value.replace(/\D/g, ''))} placeholder="EAN-13 barcode" aria-label="EAN barcode" /><button type="button" className="luna-outline-button" onClick={() => void lookupBarcode()} disabled={barcodeBusy}>{barcodeBusy ? 'Zoeken…' : 'Zoek'}</button><button type="button" className="luna-icon-action" onClick={() => setScannerOpen(true)} aria-label="Barcode met camera scannen">⌁</button></div>{scannerOpen && <BarcodeScanner onDetected={onBarcodeDetected} onClose={() => setScannerOpen(false)} />}{barcodeError && <p className="luna-error" role="alert">{barcodeError}</p>}{barcodeProduct && barcodePortion && <div className="luna-product-result"><div className="luna-product-top">{barcodeProduct.image ? <img src={barcodeProduct.image} alt="" width="52" height="52" /> : <span>◎</span>}<div><b>{barcodeProduct.name}</b><small>{barcodeProduct.brand || 'Merk onbekend'}</small></div></div><label className="luna-grams-field">Hoeveel gram<input type="number" min="1" value={barcodeGrams} onChange={(event) => setBarcodeGrams(event.target.value)} /></label><strong className="luna-product-kcal">{barcodePortion.calories === null ? '—' : formatNumber(barcodePortion.calories)} kcal</strong><MacroPills totals={{ protein: barcodePortion.protein ?? 0, carbs: barcodePortion.carbs ?? 0, fat: barcodePortion.fat ?? 0, fiber: barcodePortion.fiber ?? 0 }} compact /><button type="button" className="luna-primary" disabled={barcodePortion.calories === null} onClick={addBarcode}>Voeg toe</button></div>}</Section></div></div>
          <Section eyebrow="Luna kijkt mee" title="Foto → calorieën" className="luna-photo-card" action={<span className="luna-beta-pill">eerste schatting</span>}><div id="luna-photo" className="luna-photo-layout"><form className="luna-photo-form" onSubmit={analyzePhoto}><label className="luna-photo-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" capture="environment" onChange={(event) => choosePhoto(event.target.files?.[0])} /><span>{photo ? 'Andere foto kiezen' : 'Kies of maak een foto'}</span><small>JPG, PNG, WebP · max 8 MB</small></label>{photoPreview && <img className="luna-photo-preview" src={photoPreview} alt="Voorbeeld van je maaltijd" />}<label>Wat weet je al? (optioneel)<textarea value={photoDescription} onChange={(event) => setPhotoDescription(event.target.value)} placeholder="bijv. couscoussalade, ongeveer een half bord" rows={3} /></label><label>Dieet of aandachtspunt<textarea value={state.dietRules} onChange={(event) => setState((current) => ({ ...current, dietRules: event.target.value.slice(0, 500) }))} placeholder="bijv. eiwitrijk; geen medische regels" rows={2} /></label><button type="submit" className="luna-coral-button wide" disabled={photoBusy || !photo}>{photoBusy ? 'Luna vergelijkt porties…' : 'Maak mijn schatting →'}</button></form><div className="luna-photo-explanation"><img src="/luna/luna_picnic_bunny.png" alt="Luna bunny bij een picknick" /><div><h3>Gebruik dit als startpunt.</h3><p>Luna benoemt zichtbare onderdelen, maakt aannames expliciet en laat een bandbreedte zien. Voeg de schatting pas toe als de portie voor jou klopt.</p><small>De foto wordt alleen tijdens deze analyse naar de ingestelde provider gestuurd.</small></div></div></div>{photoError && <p className="luna-error" role="alert">{photoError}</p>}{analysis && <article className="luna-analysis-result" aria-live="polite"><div className="luna-analysis-top"><div><span className="luna-eyebrow">Centrale schatting</span><strong>{formatNumber(analysis.estimatedCalories)} <small>kcal</small></strong><p>Bandbreedte {formatNumber(analysis.calorieRange.low)}–{formatNumber(analysis.calorieRange.high)} kcal</p></div><span className={`luna-confidence ${analysis.confidence}`}>{analysis.confidence === 'high' ? 'hoog vertrouwen' : analysis.confidence === 'medium' ? 'middel vertrouwen' : 'laag vertrouwen'}</span></div><MacroPills totals={{ protein: analysis.proteinGrams, carbs: analysis.carbGrams, fat: analysis.fatGrams, fiber: analysis.fiberGrams }} /><div className={`luna-diet-check ${analysis.dietFit}`}><b>{analysis.dietFit === 'yes' ? 'Ja' : analysis.dietFit === 'no' ? 'Nee' : 'Onzeker'} · {dietFitLabel(analysis.dietFit)}</b><span>{analysis.dietReason}</span></div><details><summary>Onderdelen en aannames bekijken</summary><ul>{analysis.foods.map((food) => <li key={`${food.name}-${food.grams}`}><b>{food.name}</b><span>{formatNumber(food.grams)} g · {formatNumber(food.calories)} kcal · {food.rationale}</span></li>)}</ul>{analysis.assumptions.length > 0 && <p><strong>Aannames:</strong> {analysis.assumptions.join(' ')}</p>}</details><button type="button" className="luna-primary" onClick={addAnalysis}>Zet schatting bij {MEAL_LABELS[selectedMeal].toLowerCase()} +</button><p className="luna-disclaimer">{analysis.needsReview ? 'Controleer verborgen olie, saus en portiegrootte extra goed.' : 'Dit blijft een schatting, geen medisch advies.'}</p></article>}</Section>
        </>}

        {tab === 'insights' && <>
          <div className="luna-page-intro"><div><span className="luna-eyebrow">Patroon boven perfectie</span><h1>Zie wat je week vertelt.</h1><p>Inzicht wordt beter als je het vriendelijk leest. Onvolledige dagen zijn geen mislukking.</p></div><div className="luna-range-tabs">{([[7, '7 dagen'], [30, '30 dagen'], [0, 'Alles']] as Array<[7 | 30 | 0, string]>).map(([value, label]) => <button type="button" key={value} className={insightRange === value ? 'active' : ''} onClick={() => setInsightRange(value)}>{label}</button>)}</div></div>
          <div className="luna-insight-grid"><Section eyebrow="Gemiddeld per gelogde dag" title="Je basisritme"><div className="luna-big-stat"><strong>{formatNumber(insightAverage.calories)}</strong><span>kcal</span></div><MacroPills totals={insightAverage} /><p className="luna-card-footnote">{rangeLogs.length ? `${rangeLogs.length} items over ${new Set(rangeLogs.map((log) => log.date)).size} gelogde dagen.` : 'Log een paar items om je eerste patroon te zien.'}</p></Section><Section eyebrow="Datakwaliteit" title="Hoe compleet is je beeld?"><div className="luna-quality-layout"><div className="luna-quality-ring" style={{ '--quality': `${hasCompleteFiberData(rangeLogs) ? 100 : rangeLogs.length ? 68 : 0}%` } as CSSProperties}><strong>{rangeLogs.length ? (hasCompleteFiberData(rangeLogs) ? '100' : '68') : '0'}<small>%</small></strong></div><div><b>{rangeLogs.length ? (hasCompleteFiberData(rangeLogs) ? 'Sterke basis' : 'Goed begin') : 'Nog geen basis'}</b><p>{rangeLogs.length ? (hasCompleteFiberData(rangeLogs) ? 'Je gelogde items hebben vezelgegevens.' : 'Sommige producten hebben nog geen volledige voedingsdata.') : 'Een paar eenvoudige logs maken dit inzicht bruikbaar.'}</p></div></div></Section></div>
          <Section eyebrow="Laatste 7 dagen" title="Calorieën in beeld" className="luna-chart-card"><div className="luna-chart">{insightDays.map((date) => { const dayTotals = totalsFor(state.logs, date); const dayProfile = targetForDate(state, date); return <div className="luna-chart-day" key={date}><div className="luna-chart-column"><span style={{ height: `${Math.min(100, Math.max(3, percent(dayTotals.calories, dayProfile.dailyCalories)))}%` }} /><i style={{ height: '100%' }} /></div><b>{dayTotals.calories ? formatNumber(dayTotals.calories) : '—'}</b><small>{formatDay(date).slice(0, 2)}</small></div>; })}</div><div className="luna-chart-legend"><span><i className="coral" /> gegeten</span><span><i className="line" /> dagdoel</span></div></Section>
          <div className="luna-insight-grid"><Section eyebrow="Grootste bijdragen" title="Wat telt het meest?"><div className="luna-contributor-list">{insightTop.length ? insightTop.map((item, index) => <div key={item.food.id}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{item.food.name}</b><small>{formatNumber(item.servings)} portie{item.servings === 1 ? '' : 's'}</small></div><strong>{formatNumber(item.calories)}<small> kcal</small></strong></div>) : <p className="luna-muted">Nog geen gelogde bijdragen.</p>}</div></Section><Section eyebrow="Macro balans" title="Waar komt je energie vandaan?"><div className="luna-macro-bars">{[['Eiwit', insightAverage.protein * 4, 'protein'], ['Koolhydraten', insightAverage.carbs * 4, 'carbs'], ['Vet', insightAverage.fat * 9, 'fat']].map(([label, value, color]) => <div key={String(label)}><span><b>{label}</b><small>{formatNumber(Number(value))} kcal</small></span><i className={String(color)} style={{ width: `${percent(Number(value), insightAverage.calories)}%` }} /></div>)}</div><p className="luna-card-footnote">Verdeling op basis van je gemiddeld gelogde macro&apos;s.</p></Section></div>
          <Section eyebrow="Flexibele week" title="Je weekbudget"><div className="luna-budget-row"><div><strong>{formatNumber(budget.consumed)}</strong><span>kcal gelogd</span></div><div><strong>{formatNumber(budget.target)}</strong><span>kcal doel</span></div><div className={budget.remaining < 0 ? 'over' : ''}><strong>{formatNumber(Math.abs(budget.remaining))}</strong><span>{budget.remaining >= 0 ? 'kcal ruimte' : 'kcal erboven'}</span></div></div><p className="luna-card-footnote">Luna rekent met de dagdoelen die op die datum actief waren.</p></Section>
        </>}

        {tab === 'you' && <>
          <div className="luna-page-intro"><div><span className="luna-eyebrow">Jij bepaalt de basis</span><h1>Maak Luna van jou.</h1><p>Pas je doel aan wanneer je context verandert. De app bewaart alles lokaal in deze browser.</p></div><img className="luna-you-art" src="/luna/luna_doodles.png" alt="Luna illustraties" /></div>
          <div className="luna-you-grid"><Section eyebrow="Profiel & doelen" title="Mijn startpunt"><form className="luna-form luna-profile-form" onSubmit={(event) => { event.preventDefault(); saveProfile(); }}><label>Doel<input value={profileDraft.goal} onChange={(event) => setProfileDraft({ ...profileDraft, goal: event.target.value })} /></label><div className="luna-form-grid three"><label>Leeftijd<input type="number" min="18" value={profileDraft.ageYears ?? ''} onChange={(event) => setProfileDraft({ ...profileDraft, ageYears: nullableNumber(event.target.value) })} /></label><label>Lengte cm<input type="number" min="120" value={profileDraft.heightCm ?? ''} onChange={(event) => setProfileDraft({ ...profileDraft, heightCm: nullableNumber(event.target.value) })} /></label><label>Gewicht kg<input type="number" min="35" step=".1" value={profileDraft.weightKg ?? ''} onChange={(event) => setProfileDraft({ ...profileDraft, weightKg: nullableNumber(event.target.value) })} /></label></div><div className="luna-form-grid two"><label>Dagdoel kcal<input type="number" min="500" max="10000" step="10" value={profileDraft.dailyCalories} onChange={(event) => setProfileDraft({ ...profileDraft, dailyCalories: Math.max(500, numberValue(event.target.value, 2000)) })} /></label><label>Waterdoel ml<input type="number" min="500" max="10000" step="250" value={profileDraft.waterTargetMl ?? 2000} onChange={(event) => setProfileDraft({ ...profileDraft, waterTargetMl: nullableNumber(event.target.value) })} /></label></div><div className="luna-form-grid two"><label>Berekening<select value={profileDraft.estimateSex} onChange={(event) => setProfileDraft({ ...profileDraft, estimateSex: event.target.value as LunaProfile['estimateSex'] })}><option value="unspecified">Neutraal</option><option value="male">Man</option><option value="female">Vrouw</option></select></label><label>Beweging<select value={profileDraft.activityLevel} onChange={(event) => setProfileDraft({ ...profileDraft, activityLevel: event.target.value as ActivityLevel })}>{ACTIVITY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div><label className="luna-check-row"><input type="checkbox" checked={profileDraft.vegetarian} onChange={(event) => setProfileDraft({ ...profileDraft, vegetarian: event.target.checked })} /><span>Vegetarisch eten</span></label><div className="luna-profile-actions"><button type="button" className="luna-outline-button" onClick={calculateProfile}>Bereken opnieuw</button><button type="submit" className="luna-primary">Doelen opslaan</button></div>{estimatePreview && <div className="luna-inline-estimate"><b>{formatNumber(estimatePreview.profile.dailyCalories)} kcal</b><span>{estimatePreview.adjustmentLabel} · onderhoud {formatNumber(estimatePreview.maintenanceCalories)} kcal</span></div>}</form></Section><Section eyebrow="Jouw dieetcontext" title="Waar moet Luna rekening mee houden?"><textarea className="luna-long-textarea" value={state.dietRules} onChange={(event) => setState((current) => ({ ...current, dietRules: event.target.value.slice(0, 500) }))} placeholder="bijv. eiwitrijk, geen varkensvlees, lactosevrij…" rows={5} /><p className="luna-card-footnote">Dit wordt alleen meegestuurd met je fotoanalyse en bepaalt de dieetcheck. Het is geen medische filter.</p></Section><Section eyebrow="Privé blijven" title="Je gegevens"><p className="luna-card-intro">Luna gebruikt browseropslag. Er is geen account-sync voor deze app. Maak af en toe een export als je naar een andere browser wilt.</p><div className="luna-data-actions"><button type="button" className="luna-outline-button" onClick={exportData}>↓ Exporteer Luna</button><label className="luna-outline-button">↑ Importeer Luna<input type="file" accept="application/json,.json" onChange={(event) => void importData(event.target.files?.[0])} /></label></div><button type="button" className="luna-danger-text" onClick={() => { if (window.confirm('Alle lokale Luna-data verwijderen?')) { const next = initialLunaState(); setState(next); setProfileDraft(next.profile); setShowOnboarding(true); } }}>Wis lokale Luna-data</button></Section></div>
        </>}
      </div>
      <p className="luna-disclaimer luna-global-disclaimer">AI-schattingen zijn hulpmiddelen en worden niet automatisch juist. Controleer porties, olie en saus zelf. Lokale Luna-data blijft in deze browser.</p>
    </div>

    <nav className="luna-bottom-nav" aria-label="Mobiele Luna navigatie">{NAV_ITEMS.map((item) => <button key={item.id} type="button" className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>

    {showOnboarding && <Onboarding draft={onboardingDraft} step={onboardingStep} estimate={estimatePreview} onChange={(patch) => setOnboardingDraft((current) => ({ ...current, ...patch }))} onNext={() => setOnboardingStep((step) => Math.min(3, step + 1))} onBack={() => setOnboardingStep((step) => Math.max(0, step - 1))} onEstimate={() => { const estimate = estimateNutrition(onboardingDraft); if (estimate) { setEstimatePreview(estimate); setOnboardingDraft({ ...estimate.profile, onboarded: false }); } }} onComplete={completeOnboarding} onSkip={skipOnboarding} />}

    {selectedFood && <div className="luna-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedFood(null); }}><section className="luna-modal" role="dialog" aria-modal="true" aria-labelledby="luna-food-modal-title"><button type="button" className="luna-modal-close" onClick={() => setSelectedFood(null)} aria-label="Sluiten">×</button><span className="luna-food-large-icon">{selectedFood.icon ?? '🍽️'}</span><span className="luna-eyebrow">{selectedFood.brand || selectedFood.source}</span><h2 id="luna-food-modal-title">{selectedFood.name}</h2><p className="luna-modal-serving">{selectedFood.servingSize} · {formatNumber(selectedFood.calories)} kcal per portie</p><div className="luna-portion-tabs">{([['servings', 'Porties'], ['calories', 'Kcal'], ['protein', 'Eiwit']] as Array<[PortionTarget, string]>).map(([value, label]) => <button type="button" key={value} className={portionTarget === value ? 'active' : ''} onClick={() => { setPortionTarget(value); setPortionValue(value === 'servings' ? '1' : value === 'calories' ? String(selectedFood.calories) : String(selectedFood.protein)); }}>{label}</button>)}</div><label className="luna-modal-input">{portionTarget === 'servings' ? 'Aantal porties' : portionTarget === 'calories' ? 'Gewenste kcal' : 'Gewenst eiwit (g)'}<input type="number" min=".01" step={portionTarget === 'servings' ? '.25' : '1'} value={portionValue} onChange={(event) => setPortionValue(event.target.value)} /></label>{selectedFoodNutrition && <><MacroPills totals={selectedFoodNutrition} /><div className="luna-modal-preview"><b>{formatNumber(selectedFoodNutrition.calories)} kcal</b><span>{formatNumber(selectedFoodServings)} portie{selectedFoodServings === 1 ? '' : 's'} · {MEAL_LABELS[selectedMeal].toLowerCase()}</span></div></>}<button type="button" className="luna-primary wide" onClick={addSelectedFood}>Zet in mijn log →</button></section></div>}

    {editingLog && <div className="luna-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingLog(null); }}><section className="luna-modal" role="dialog" aria-modal="true" aria-labelledby="luna-edit-title"><button type="button" className="luna-modal-close" onClick={() => setEditingLog(null)} aria-label="Sluiten">×</button><span className="luna-food-large-icon">{editingLog.food.icon ?? '🍽️'}</span><span className="luna-eyebrow">Log aanpassen</span><h2 id="luna-edit-title">{editingLog.food.name}</h2><label className="luna-modal-input">Porties<input type="number" min=".01" step=".25" value={editingServings} onChange={(event) => setEditingServings(event.target.value)} /></label><label className="luna-modal-input">Eetmoment<select value={editingMeal} onChange={(event) => setEditingMeal(event.target.value as MealType)}>{MEALS.map((meal) => <option key={meal} value={meal}>{MEAL_LABELS[meal]}</option>)}</select></label><MacroPills totals={nutritionFor(editingLog.food, numberValue(editingServings, 1))} /><div className="luna-modal-actions"><button type="button" className="luna-danger-button" onClick={() => { removeLog(editingLog.id); setEditingLog(null); }}>Verwijder</button><button type="button" className="luna-primary" onClick={saveLogEdit}>Bewaar wijziging</button></div></section></div>}

    {saveMealSource && <div className="luna-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSaveMealSource(null); }}><section className="luna-modal" role="dialog" aria-modal="true" aria-labelledby="luna-save-meal-title"><button type="button" className="luna-modal-close" onClick={() => setSaveMealSource(null)} aria-label="Sluiten">×</button><span className="luna-eyebrow">{MEAL_LABELS[saveMealSource]} bewaren</span><h2 id="luna-save-meal-title">Nog een keer makkelijk.</h2><p>Bewaar alle items uit dit eetmoment als één herhaalbare maaltijd.</p><label className="luna-modal-input">Naam<input autoFocus value={saveMealName} onChange={(event) => setSaveMealName(event.target.value)} placeholder="bijv. mijn vaste ontbijt" /></label><button type="button" className="luna-primary wide" onClick={saveMeal}>Bewaar maaltijd →</button></section></div>}

    {notice && <button type="button" className="luna-toast" onClick={() => setNotice(null)} role="status">{notice}<span>×</span></button>}
  </main>;
}
