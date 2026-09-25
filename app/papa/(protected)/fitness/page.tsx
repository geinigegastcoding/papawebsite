'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import CloudSync from '@/components/cloud-sync';
import {
  DAY_LABELS,
  EXERCISES,
  MUSCLE_GROUPS,
  MUSCLE_LABELS,
  buildPlan,
  createGoogleCalendarUrl,
  createIcs,
  emptyTrainingState,
  equipmentLabel,
  experienceLabel,
  getExerciseProgress,
  getSafeAlternatives,
  getWorkoutFeedback,
  getWorkoutProgress,
  limitationLabel,
  setupLabel,
  type Discomfort,
  type Equipment,
  type ExerciseDefinition,
  type ExercisePrescription,
  type Limitation,
  type MuscleGroup,
  type PlanWarning,
  type Profile,
  type SetLog,
  type SetupRequirement,
  type TrainingPlan,
  type TrainingState,
  type Workout,
  type WorkoutLog
} from '@/lib/fitness';
import { calculateWeeklyStreak } from '@/lib/streaks';
import { ANALYTICS_EVENTS } from '@/lib/analytics-policy';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { captureClientException } from '@/lib/monitoring';
import type { CheckInRecord, FitnessSnapshot } from '@/lib/sync';
import {
  LEGACY_ONBOARDING_DRAFT_STORAGE_KEY,
  LEGACY_PROFILE_STORAGE_KEY,
  LEGACY_PROFILE_V2_STORAGE_KEY,
  ONBOARDING_DRAFT_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  completeOnboardingAnswers,
  createEmptyOnboardingAnswers,
  createStoredProfileRecord,
  draftFromProfile,
  parseOnboardingDraft,
  parseStoredProfileRecord,
  profileFromAnswers,
  type OnboardingAnswersDraft,
  type SafetyStatus,
  type TrainingConsistency,
  type VolumeBand
} from '@/lib/profile';

const TRAINING_STATE_KEY = 'fitquest-training-state-v1';

type StepId = 'adult' | 'experience' | 'volume' | 'schedule' | 'equipment' | 'sport' | 'safety' | 'priority' | 'preferences' | 'review';
type Screen = 'welcome' | 'onboarding' | 'plan';

const EXPERIENCE_OPTIONS: Array<{ value: TrainingConsistency; title: string; description: string }> = [
  { value: 'new', title: 'Nieuw met trainen', description: 'Je start net of hebt nog geen vaste routine.' },
  { value: 'under-6-months', title: 'Korter dan 6 maanden', description: 'Je bouwt de basis en leert je werksets kennen.' },
  { value: '6-12-months', title: '6–12 maanden', description: 'Je traint al regelmatig met een herkenbaar volume.' },
  { value: '1-3-years', title: '1–3 jaar', description: 'Je kent je oefeningen en kunt volume redelijk inschatten.' },
  { value: '3-plus-years', title: '3+ jaar', description: 'Je hebt een stabiele historie en duidelijke voorkeuren.' }
];

const VOLUME_OPTIONS: Array<{ value: VolumeBand; title: string; description: string }> = [
  { value: 'unknown', title: 'Onbekend', description: 'Ik heb geen betrouwbare schatting.' },
  { value: '1-4', title: '1–4 sets', description: 'Weinig directe sets per week.' },
  { value: '5-8', title: '5–8 sets', description: 'Een bescheiden huidig volume.' },
  { value: '9-12', title: '9–12 sets', description: 'Een gemiddeld huidig volume.' },
  { value: '13-16', title: '13–16 sets', description: 'Een hoog huidig volume.' },
  { value: '17-plus', title: '17+ sets', description: 'Zeer hoog; FitQuest begrenst de start veilig.' }
];

const EQUIPMENT_OPTIONS: Array<{ value: Equipment; title: string; description: string }> = [
  { value: 'bodyweight', title: 'Lichaamsgewicht', description: 'Push-ups, lunges, core en meer.' },
  { value: 'dumbbells', title: 'Dumbbells', description: 'Vrije gewichten met flexibele setup.' },
  { value: 'barbell', title: 'Barbell', description: 'Barbellwerk met passende rack-setup.' },
  { value: 'machines', title: 'Machines', description: 'Stabiele toestellen in de gym.' },
  { value: 'cables', title: 'Kabels', description: 'Kabelstation met instelbare weerstand.' },
  { value: 'bands', title: 'Weerstandsbanden', description: 'Bandwerk met ankerpunt.' }
];

const SETUP_OPTIONS: Array<{ value: SetupRequirement; title: string; description: string }> = [
  { value: 'floor', title: 'Vloer', description: 'Een vrije ondergrond voor matwerk.' },
  { value: 'bench', title: 'Bankje', description: 'Vlak of verstelbaar bankje.' },
  { value: 'rack', title: 'Rack', description: 'Squat- of halterrek.' },
  { value: 'pull-up-bar', title: 'Optrekstang', description: 'Vaste of deurpost-optrekstang.' },
  { value: 'cable-stack', title: 'Kabelstation', description: 'Kabelstack met bevestigingen.' },
  { value: 'band-anchor', title: 'Bandanker', description: 'Veilig bevestigingspunt voor banden.' },
  { value: 'slider', title: 'Sliders', description: 'Glijders of handdoeken op een gladde vloer.' }
];

const STYLE_OPTIONS: Array<{ value: NonNullable<OnboardingAnswersDraft['style']>; title: string; description: string }> = [
  { value: 'mixed', title: 'Gemengd', description: 'FitQuest kiest de beste mix voor je context.' },
  { value: 'machines', title: 'Machines', description: 'Stabiliteit en eenvoudige herhaling.' },
  { value: 'free-weights', title: 'Vrije gewichten', description: 'Dumbbells en barbells als basis.' },
  { value: 'bodyweight', title: 'Lichaamsgewicht', description: 'Zo veel mogelijk zonder externe gewichten.' }
];

const VARIETY_OPTIONS: Array<{ value: NonNullable<OnboardingAnswersDraft['variety']>; title: string; description: string }> = [
  { value: 'repeatable', title: 'Herhaalbaar', description: 'Weinig wissels zodat progressie helder blijft.' },
  { value: 'balanced', title: 'Gebalanceerd', description: 'Vaste ankers met af en toe een andere prikkel.' },
  { value: 'varied', title: 'Veel variatie', description: 'Meer wissels binnen dezelfde bewegingsdoelen.' }
];

const SAFETY_OPTIONS: Array<{ value: SafetyStatus; title: string; description: string }> = [
  { value: 'none', title: 'Geen beperkingen', description: 'Ik kan normaal trainen.' },
  { value: 'active', title: 'Actieve of onverklaarde klacht', description: 'FitQuest maakt dan geen automatisch plan.' },
  { value: 'managed', title: 'Vrijgegeven met restricties', description: 'Restricties blijven harde filters voor de planner.' },
  { value: 'history', title: 'Alleen voorgeschiedenis', description: 'Ter context; dit blokkeert oefeningen niet automatisch.' }
];

const LIMITATIONS: Limitation[] = ['shoulder', 'elbow', 'wrist', 'back', 'hip', 'knee', 'ankle'];

const STEP_PHASES = [
  { label: 'Start', steps: ['adult'] },
  { label: 'Training', steps: ['experience', 'volume'] },
  { label: 'Week', steps: ['schedule', 'equipment', 'sport'] },
  { label: 'Veiligheid', steps: ['safety'] },
  { label: 'Focus', steps: ['priority', 'preferences', 'review'] }
] as const;

function getStepIds(form: OnboardingAnswersDraft): StepId[] {
  const experienced = form.consistentTraining === '6-12-months' || form.consistentTraining === '1-3-years' || form.consistentTraining === '3-plus-years';
  return experienced
    ? ['adult', 'experience', 'volume', 'schedule', 'equipment', 'sport', 'safety', 'priority', 'preferences', 'review']
    : ['adult', 'experience', 'schedule', 'equipment', 'sport', 'safety', 'priority', 'preferences', 'review'];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',');
}

type IconName = 'alert' | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'bar-chart' | 'bookmark' | 'calendar' | 'check' | 'chevron' | 'clock' | 'dumbbell' | 'home' | 'info' | 'play' | 'plus' | 'refresh' | 'shield' | 'spark' | 'target' | 'trend' | 'user' | 'x';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  const paths: Record<IconName, ReactNode> = {
    alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5M12 16h.01" /></>,
    'arrow-left': <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    'arrow-right': <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    'arrow-up': <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
    'bar-chart': <><path d="M5 20V10M12 20V4M19 20v-7" /></>,
    bookmark: <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" />,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M16 2v4M8 2v4M3 9h18" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    dumbbell: <><path d="M6 5v14M18 5v14M3 9v6M21 9v6M6 12h12" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M10 20v-6h4v6" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7h.01" /></>,
    play: <path d="m9 6 10 6-10 6V6Z" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14-4L4 9" /><path d="M4 4v5h5" /><path d="M4 13a8 8 0 0 0 14 4l2-2" /><path d="M20 20v-5h-5" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3" /></>,
    trend: <><path d="m4 16 5-5 4 3 7-8" /><path d="M15 6h5v5" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function Brand() {
  return <span className="brand"><span className="brand-mark">FQ</span><span>FitQuest</span></span>;
}

function ChoiceCard({ title, description, selected, onClick, icon, disabled = false }: { title: string; description: string; selected: boolean; onClick: () => void; icon?: ReactNode; disabled?: boolean }) {
  return <button type="button" className={`choice-card${selected ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}`} onClick={onClick} disabled={disabled}>
    <span className="choice-copy"><strong>{title}</strong><small>{description}</small></span>
    <span className="choice-state">{selected ? <Icon name="check" size={15} /> : icon ?? <Icon name="chevron" size={15} />}</span>
  </button>;
}

function QuestionHeading({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return <div className="question-heading"><span className="kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div>;
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return <main className="welcome-screen">
    <header className="site-header"><Brand /><span className="local-label"><i /> Lokaal opgeslagen</span></header>
    <section className="hero-shell">
      <div className="hero-copy">
        <span className="kicker">Hypertrofieplanner / v3</span>
        <h1>Train wat <em>achterloopt.</em></h1>
        <p>Een rustig startpunt op basis van je echte volume, je week en je feedback. Geen schijnprecisie — wel een coach die leert van iedere sessie.</p>
        <button type="button" className="primary-button hero-button" onClick={onStart}>Start je intake <Icon name="arrow-right" size={18} /></button>
        <div className="hero-facts"><span><b>01</b><small>huidig volume</small></span><span><b>02</b><small>feedbackloop</small></span><span><b>03</b><small>lokaal</small></span></div>
      </div>
      <div className="hero-visual"><Image className="hero-illustration" src="/onboarding-coach.png" alt="FitQuest coachillustratie" width={720} height={720} priority /><div className="hero-callout callout-top"><Icon name="target" size={16} /><span><b>Prioriteit eerst</b><small>focus zonder extreme sets</small></span></div><div className="hero-callout callout-bottom"><Icon name="spark" size={16} /><span><b>Adaptief schema</b><small>reps, RIR en herstel tellen mee</small></span></div></div>
    </section>
    <footer className="welcome-footer"><span>18+ en gezond kunnen trainen</span><span>•</span><span>Deterministisch</span><span>•</span><span>Geen account nodig</span></footer>
  </main>;
}

function AdultStep({ form, onUpdate }: { form: OnboardingAnswersDraft; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void }) {
  const [answered, setAnswered] = useState(form.adultConfirmed);
  return <><QuestionHeading kicker="Stap 01 / start" title="Kun je veilig trainen?" description="FitQuest is gemaakt voor volwassenen die zelfstandig krachttraining kunnen doen." /><div className="choice-grid two-columns"><ChoiceCard title="Ja, ik ben 18+" description="Ik bevestig dat ik volwassen ben." selected={answered && form.adultConfirmed} onClick={() => { setAnswered(true); onUpdate({ adultConfirmed: true }); }} icon={<Icon name="shield" size={17} />} /><ChoiceCard title="Nee / liever niet" description="Dan maakt FitQuest geen trainingsplan." selected={answered && !form.adultConfirmed} onClick={() => { setAnswered(true); onUpdate({ adultConfirmed: false }); }} icon={<Icon name="info" size={17} />} /></div><p className="form-note"><Icon name="info" size={15} /> Bij actieve of onverklaarde klachten stopt de intake later zonder automatisch schema.</p></>;
}

function ExperienceStep({ form, onUpdate }: { form: OnboardingAnswersDraft; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void }) {
  return <><QuestionHeading kicker="Stap 02 / training" title="Hoe lang train je consistent?" description="Dit bepaalt vooral hoeveel informatie we al van je hebben — niet een magisch aantal sets." /><div className="consistency-grid">{EXPERIENCE_OPTIONS.map((option) => <button type="button" key={option.value} className={form.consistentTraining === option.value ? 'is-selected' : ''} onClick={() => onUpdate({ consistentTraining: option.value })}><b>{option.title}</b><small>{option.description}</small></button>)}</div><p className="form-note"><Icon name="spark" size={15} /> Vanaf ongeveer zes maanden vragen we je huidige directe sets per spiergroep mee te nemen.</p></>;
}

function CurrentVolumeStep({ form, onUpdate }: { form: OnboardingAnswersDraft; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void }) {
  return <><QuestionHeading kicker="Stap 03 / huidig volume" title="Waar kom je nu ongeveer vandaan?" description="Een ruwe bandbreedte is genoeg. We behouden je huidige basis en laten logs bepalen of er later iets verandert." /><div className="volume-input-grid">{MUSCLE_GROUPS.map((muscle) => <label className="volume-input" key={muscle}><span><b>{MUSCLE_LABELS[muscle]}</b><small>directe sets / week</small></span><select value={form.currentVolumeBands[muscle]} onChange={(event) => onUpdate({ currentVolumeBands: { ...form.currentVolumeBands, [muscle]: event.target.value as VolumeBand } })}>{VOLUME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.title}</option>)}</select></label>)}</div><p className="form-note"><Icon name="info" size={15} /> Beginners slaan deze stap over en starten conservatief met 6 directe sets als richtpunt.</p></>;
}

function DayPicker({ selected, onToggle, disabledDays = [] }: { selected: number[]; onToggle: (day: number) => void; disabledDays?: number[] }) {
  return <div className="day-picker">{DAY_LABELS.map((label, day) => <button type="button" key={day} className={selected.includes(day) ? 'is-selected' : ''} disabled={disabledDays.includes(day)} onClick={() => onToggle(day)}><b>{label.slice(0, 2)}</b><small>{label}</small></button>)}</div>;
}

function ScheduleStep({ form, onUpdate }: { form: OnboardingAnswersDraft; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void }) {
  const toggleDay = (day: number) => {
    const selected = form.trainingDays.includes(day);
    const trainingDays = selected ? form.trainingDays.filter((item) => item !== day) : [...form.trainingDays, day].sort((a, b) => a - b);
    const minutesByDay = { ...form.minutesByDay };
    if (selected) delete minutesByDay[day];
    else minutesByDay[day] = 60;
    onUpdate({ trainingDays, minutesByDay });
  };
  return <><QuestionHeading kicker="Stap 04 / week" title="Wanneer kun je trainen?" description="Kies twee tot zes dagen. Per dag houden we rekening met je deur-tot-deur tijdslimiet." /><div className="subheading first"><span>Trainingsdagen</span><small>{form.trainingDays.length}/6 geselecteerd</small></div><DayPicker selected={form.trainingDays} onToggle={(day) => { if (form.trainingDays.includes(day) || form.trainingDays.length < 6) toggleDay(day); }} /><div className="schedule-times"><div className="subheading"><span>Tijd per dag</span><small>inclusief warming-up en rust</small></div>{form.trainingDays.map((day) => <label className="schedule-time-row" key={day}><span><b>{DAY_LABELS[day]}</b><small>persoonlijke limiet</small></span><select value={form.minutesByDay[day] ?? ''} onChange={(event) => onUpdate({ minutesByDay: { ...form.minutesByDay, [day]: event.target.value ? Number(event.target.value) : '' } })}><option value="">Kies tijd</option>{[30, 45, 60, 75, 90].map((minutes) => <option key={minutes} value={minutes}>{minutes} minuten</option>)}</select></label>)}</div><p className="form-note"><Icon name="clock" size={15} /> De planner toont geen training die boven je conservatieve tijdslimiet uitkomt.</p></>;
}

function EquipmentStep({ form, onUpdate }: { form: OnboardingAnswersDraft; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void }) {
  const toggleEquipment = (equipment: Equipment) => {
    const selected = form.equipment.includes(equipment);
    const nextEquipment = selected ? form.equipment.filter((item) => item !== equipment) : [...form.equipment, equipment];
    const requiredSetup: Partial<Record<Equipment, SetupRequirement>> = { bodyweight: 'floor', cables: 'cable-stack', bands: 'band-anchor' };
    const required = requiredSetup[equipment];
    const setups = required && !selected && !form.setups.includes(required) ? [...form.setups, required] : form.setups;
    onUpdate({ equipment: nextEquipment, setups });
  };
  const toggleSetup = (setup: SetupRequirement) => onUpdate({ setups: form.setups.includes(setup) ? form.setups.filter((item) => item !== setup) : [...form.setups, setup] });
  const selectFullGym = () => onUpdate({ equipment: EQUIPMENT_OPTIONS.map((option) => option.value), setups: SETUP_OPTIONS.map((option) => option.value) });
  return <><QuestionHeading kicker="Stap 05 / materiaal" title="Wat staat er tot je beschikking?" description="Oefeningen worden pas gekozen als materiaal, setup en veiligheidsregels kloppen." /><div className="choice-grid two-columns equipment-grid">{EQUIPMENT_OPTIONS.map((option) => <ChoiceCard key={option.value} title={option.title} description={option.description} selected={form.equipment.includes(option.value)} onClick={() => toggleEquipment(option.value)} icon={<Icon name="dumbbell" size={17} />} />)}</div><button type="button" className="text-button compact-action" onClick={selectFullGym}>Alles van een volledige gym selecteren</button><div className="subheading"><span>Beschikbare setups</span><small>{form.setups.length} gekozen</small></div><div className="setup-grid">{SETUP_OPTIONS.map((option) => <ChoiceCard key={option.value} title={option.title} description={option.description} selected={form.setups.includes(option.value)} onClick={() => toggleSetup(option.value)} icon={<Icon name="check" size={16} />} />)}</div></>;
}

function SportStep({ form, onUpdate }: { form: OnboardingAnswersDraft; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void }) {
  const toggleDay = (day: number) => onUpdate({ otherSportDays: form.otherSportDays.includes(day) ? form.otherSportDays.filter((item) => item !== day) : [...form.otherSportDays, day].sort((a, b) => a - b) });
  return <><QuestionHeading kicker="Stap 06 / belasting" title="Doe je daarnaast intensieve sport?" description="Een paar dagen is genoeg. FitQuest gebruikt dit voor weekplanning en vermoeidheidswaarschuwingen." /><div className="choice-grid two-columns"><ChoiceCard title="Nee" description="Krachttraining is mijn enige intensieve sport." selected={!form.hasOtherSport} onClick={() => onUpdate({ hasOtherSport: false, otherSportDays: [] })} /><ChoiceCard title="Ja" description="Ik doe daarnaast intensieve sport." selected={form.hasOtherSport} onClick={() => onUpdate({ hasOtherSport: true })} /></div>{form.hasOtherSport && <><div className="subheading"><span>Op welke dagen?</span><small>{form.otherSportDays.length} gekozen</small></div><DayPicker selected={form.otherSportDays} onToggle={toggleDay} /><p className="form-note"><Icon name="info" size={15} /> We blokkeren de dag niet automatisch, maar maken overlap zichtbaar en nemen het mee in herstelplanning.</p></>}</>;
}

function SafetyStep({ form, onUpdate }: { form: OnboardingAnswersDraft; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void }) {
  const toggleArea = (area: Limitation) => onUpdate({ restrictionAreas: form.restrictionAreas.includes(area) ? form.restrictionAreas.filter((item) => item !== area) : [...form.restrictionAreas, area] });
  const status = form.safetyStatus;
  return <><QuestionHeading kicker="Stap 07 / veiligheid" title="Zijn er klachten of restricties?" description="FitQuest behandelt niets. Het kan alleen harde grenzen respecteren en actieve klachten blokkeren." /><div className="choice-grid two-columns compact-cards">{SAFETY_OPTIONS.map((option) => <ChoiceCard key={option.value} title={option.title} description={option.description} selected={status === option.value} onClick={() => onUpdate({ safetyStatus: option.value, restrictionAreas: option.value === 'none' ? [] : form.restrictionAreas, clearedWithRestrictions: option.value === 'managed' ? form.clearedWithRestrictions : false })} icon={<Icon name={option.value === 'active' ? 'x' : 'shield'} size={16} />} />)}</div>{status === 'active' && <div className="blocking-note"><Icon name="shield" size={20} /><div><b>Geen automatisch trainingsplan</b><p>Laat een actieve of onverklaarde klacht eerst beoordelen. FitQuest doet geen diagnose of revalidatievoorstel.</p></div></div>}{(status === 'managed' || status === 'history' || status === 'active') && <><div className="subheading"><span>Betrokken gebied(en)</span><small>kies wat van toepassing is</small></div><div className="limitation-picker">{LIMITATIONS.map((area) => <button type="button" key={area} className={form.restrictionAreas.includes(area) ? 'is-selected' : ''} onClick={() => toggleArea(area)}>{form.restrictionAreas.includes(area) ? <Icon name="check" size={14} /> : <Icon name="plus" size={14} />} {limitationLabel(area)}</button>)}</div></>}{status === 'managed' && <label className="check-row"><input type="checkbox" checked={form.clearedWithRestrictions} onChange={(event) => onUpdate({ clearedWithRestrictions: event.target.checked })} /><span>Ik ben vrijgegeven om te trainen binnen deze restricties.</span></label>}{status === 'history' && <p className="safety-copy">Deze voorgeschiedenis blijft in je profiel als context, maar wordt niet als actuele beperking gebruikt.</p>}</>;
}

function PriorityStep({ form, onUpdate }: { form: OnboardingAnswersDraft; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void }) {
  const toggle = (muscle: MuscleGroup) => onUpdate({ priorityMuscles: form.priorityMuscles.includes(muscle) ? form.priorityMuscles.filter((item) => item !== muscle) : form.priorityMuscles.length < 3 ? [...form.priorityMuscles, muscle] : form.priorityMuscles });
  return <><QuestionHeading kicker="Stap 08 / focus" title="Welke spieren wil je het meest laten groeien?" description="Kies maximaal drie in volgorde. Prioriteit stuurt oefeningen, volgorde en blootstelling — niet automatisch enorme sets." /><div className="priority-summary"><div className="priority-summary-head"><strong>Jouw volgorde</strong><span className="kicker">{form.priorityMuscles.length}/3</span></div><div className="priority-slots">{[0, 1, 2].map((index) => { const muscle = form.priorityMuscles[index]; return <div className={`priority-slot${muscle ? ' is-filled' : ''}`} key={index}><span>{index + 1}</span><span><b>{muscle ? MUSCLE_LABELS[muscle] : 'Nog vrij'}</b><small>{muscle ? 'focuspunt' : 'optioneel'}</small></span></div>; })}</div><p>Een onderontwikkelde spier is een prioriteitssignaal, geen bewijs dat je direct meer volume aankunt.</p></div><div className="priority-grid">{MUSCLE_GROUPS.map((muscle) => { const selected = form.priorityMuscles.includes(muscle); return <button type="button" key={muscle} className={`priority-card${selected ? ' is-selected' : ''}${!selected && form.priorityMuscles.length >= 3 ? ' is-disabled' : ''}`} disabled={!selected && form.priorityMuscles.length >= 3} onClick={() => toggle(muscle)}><span className="priority-rank">{selected ? form.priorityMuscles.indexOf(muscle) + 1 : <Icon name="plus" size={14} />}</span><span><b>{MUSCLE_LABELS[muscle]}</b><small>{selected ? 'Geselecteerd' : 'Kies als focus'}</small></span></button>; })}</div></>;
}

function PreferencesStep({ form, onUpdate }: { form: OnboardingAnswersDraft; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void }) {
  return <><QuestionHeading kicker="Stap 09 / voorkeur" title="Hoe wil je trainen?" description="Voorkeuren breken de basislogica niet: veiligheid en trainingsdoel blijven altijd voorrang houden." /><div className="subheading first"><span>Trainingsstijl</span><small>wat voelt duurzaam?</small></div><div className="choice-grid two-columns compact-cards">{STYLE_OPTIONS.map((option) => <ChoiceCard key={option.value} title={option.title} description={option.description} selected={form.style === option.value} onClick={() => onUpdate({ style: option.value })} />)}</div><div className="subheading"><span>Variatie</span><small>hoe vaak wisselen?</small></div><div className="choice-grid three-columns compact-cards">{VARIETY_OPTIONS.map((option) => <ChoiceCard key={option.value} title={option.title} description={option.description} selected={form.variety === option.value} onClick={() => onUpdate({ variety: option.value })} />)}</div><div className="subheading"><span>Herstelcontext</span><small>voor belastinginschatting</small></div><div className="workset-metrics"><label className="number-field"><span><b>Slaap</b><small>gemiddeld per nacht</small></span><span className="number-input"><input type="number" min="3" max="14" step="0.5" value={form.averageSleepHours} onChange={(event) => onUpdate({ averageSleepHours: event.target.value ? Number(event.target.value) : '' })} /><em>uur</em></span></label><label className="number-field"><span><b>Stress</b><small>deze periode</small></span><span className="number-input"><select value={form.stress} onChange={(event) => onUpdate({ stress: event.target.value as OnboardingAnswersDraft['stress'] })}><option value="">Kies</option><option value="low">Laag</option><option value="medium">Gemiddeld</option><option value="high">Hoog</option></select></span></label></div></>;
}

function ReviewStep({ form }: { form: OnboardingAnswersDraft }) {
  const answers = completeOnboardingAnswers(form);
  const selectedEquipment = form.equipment.map(equipmentLabel).join(', ');
  const selectedDays = form.trainingDays.map((day) => DAY_LABELS[day]).join(', ');
  const priority = form.priorityMuscles.map((muscle) => MUSCLE_LABELS[muscle]).join(' → ');
  const status = form.safetyStatus === 'none' ? 'Geen actuele beperkingen' : form.safetyStatus === 'history' ? 'Voorgeschiedenis als context' : form.safetyStatus === 'managed' ? 'Vrijgegeven binnen restricties' : 'Geen plan bij actieve klacht';
  return <><QuestionHeading kicker="Stap 10 / overzicht" title="Klaar om je startpunt te bouwen?" description="FitQuest maakt één huidige trainingsweek. Daarna bepalen je logs samen met de coach wat er verandert." /><div className="review-grid"><div className="review-card"><span className="kicker">Training</span><b>{form.consistentTraining ? EXPERIENCE_OPTIONS.find((option) => option.value === form.consistentTraining)?.title : 'Nog niet gekozen'}</b><small>{selectedDays || 'Geen dagen gekozen'}</small></div><div className="review-card"><span className="kicker">Materiaal</span><b>{form.equipment.length} categorieën</b><small>{selectedEquipment || 'Nog niets gekozen'}</small></div><div className="review-card"><span className="kicker">Prioriteit</span><b>{priority || 'Nog niets gekozen'}</b><small>maximaal drie groeifocuspunten</small></div><div className="review-card"><span className="kicker">Veiligheid</span><b>{status}</b><small>{form.restrictionAreas.length ? form.restrictionAreas.map(limitationLabel).join(', ') : 'Geen gebieden gemarkeerd'}</small></div></div>{!answers && <div className="inline-error"><Icon name="info" size={16} /> Er ontbreekt nog informatie. Ga terug naar de gemarkeerde stap en vul die aan.</div>}<p className="form-note"><Icon name="spark" size={15} /> Na drie gelogde sessies kan FitQuest je tijdsfactor persoonlijk bijstellen. Volume verandert alleen wanneer prestaties en herstel dat ondersteunen.</p></>;
}

function OnboardingScreen({ form, stepId, onUpdate, onBack, onContinue, onExit, canContinue, error }: { form: OnboardingAnswersDraft; stepId: StepId; onUpdate: (patch: Partial<OnboardingAnswersDraft>) => void; onBack: () => void; onContinue: () => void; onExit: () => void; canContinue: boolean; error: string | null }) {
  const steps = getStepIds(form);
  const index = Math.max(0, steps.indexOf(stepId));
  const renderStep = () => {
    if (stepId === 'adult') return <AdultStep form={form} onUpdate={onUpdate} />;
    if (stepId === 'experience') return <ExperienceStep form={form} onUpdate={onUpdate} />;
    if (stepId === 'volume') return <CurrentVolumeStep form={form} onUpdate={onUpdate} />;
    if (stepId === 'schedule') return <ScheduleStep form={form} onUpdate={onUpdate} />;
    if (stepId === 'equipment') return <EquipmentStep form={form} onUpdate={onUpdate} />;
    if (stepId === 'sport') return <SportStep form={form} onUpdate={onUpdate} />;
    if (stepId === 'safety') return <SafetyStep form={form} onUpdate={onUpdate} />;
    if (stepId === 'priority') return <PriorityStep form={form} onUpdate={onUpdate} />;
    if (stepId === 'preferences') return <PreferencesStep form={form} onUpdate={onUpdate} />;
    return <ReviewStep form={form} />;
  };
  return <main className="onboarding-screen"><header className="flow-header"><button type="button" className="text-button muted" onClick={onExit}><Brand /></button><span className="kicker">{index + 1} / {steps.length}</span></header><div className="progress-line"><span style={{ width: `${((index + 1) / steps.length) * 100}%` }} /></div><div className="flow-layout"><aside className="step-rail"><span className="rail-label">Je intake</span><ol>{STEP_PHASES.map((phase, phaseIndex) => { const phaseActive = (phase.steps as readonly string[]).includes(stepId); const phaseComplete = steps.indexOf(stepId) > Math.max(...phase.steps.map((item) => steps.indexOf(item)).filter((value) => value >= 0), -1); return <li key={phase.label} className={`${phaseActive ? 'is-active' : ''}${phaseComplete ? ' is-complete' : ''}`}><span>{phaseComplete ? <Icon name="check" size={14} /> : phaseIndex + 1}</span><b>{phase.label}</b></li>; })}</ol><span className="rail-trust">Lokaal opgeslagen</span></aside><section className="flow-content"><div className="onboarding-visual"><Image src="/onboarding-coach.png" alt="FitQuest coach" width={720} height={360} loading="eager" /></div>{renderStep()}{error && <div className="inline-error"><Icon name="info" size={16} /> {error}</div>}<div className="flow-actions"><button type="button" className="back-button" onClick={onBack}><Icon name="arrow-left" size={16} /> Terug</button><button type="button" className="primary-button" onClick={onContinue} disabled={!canContinue}>{stepId === 'review' ? <>Schema bouwen <Icon name="spark" size={17} /></> : <>Verder <Icon name="arrow-right" size={17} /></>}</button></div></section></div></main>;
}

type DraftSet = { reps: string; weightKg: string; rir: string; completed: boolean };
type DraftExercise = { sets: DraftSet[]; discomfort: Discomfort };

function draftForExercise(item: ExercisePrescription): DraftExercise {
  return { sets: Array.from({ length: item.sets }, () => ({ reps: String(item.repMin), weightKg: item.suggestedLoadKg === undefined ? '' : String(item.suggestedLoadKg), rir: String(item.rir), completed: true })), discomfort: 'none' };
}

function draftForWorkout(workout: Workout): Record<string, DraftExercise> {
  return Object.fromEntries(workout.exercises.map((item) => [item.id, draftForExercise(item)])) as Record<string, DraftExercise>;
}

function WorkoutLogger({ workout, onLog, logged }: { workout: Workout; onLog: (log: WorkoutLog) => void; logged: boolean }) {
  const [drafts, setDrafts] = useState<Record<string, DraftExercise>>(() => draftForWorkout(workout));
  const [actualDuration, setActualDuration] = useState(String(workout.duration));
  const [sessionRpe, setSessionRpe] = useState('7');
  const [recovery, setRecovery] = useState<WorkoutLog['recovery']>('good');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDrafts(draftForWorkout(workout));
    setActualDuration(String(workout.duration));
    setSessionRpe('7');
    setRecovery('good');
    setError(null);
    setSaved(false);
  }, [workout.id, workout.duration]);

  const updateSet = (exerciseId: string, setIndex: number, patch: Partial<DraftSet>) => setDrafts((current) => {
    const exercise = workout.exercises.find((item) => item.id === exerciseId);
    const draft = current[exerciseId] ?? (exercise ? draftForExercise(exercise) : null);
    if (!draft) return current;
    return { ...current, [exerciseId]: { ...draft, sets: draft.sets.map((set, index) => index === setIndex ? { ...set, ...patch } : set) } };
  });
  const updateExercise = (exerciseId: string, patch: Partial<DraftExercise>) => setDrafts((current) => {
    const exercise = workout.exercises.find((item) => item.id === exerciseId);
    const draft = current[exerciseId] ?? (exercise ? draftForExercise(exercise) : null);
    return draft ? { ...current, [exerciseId]: { ...draft, ...patch } } : current;
  });

  const save = () => {
    try {
      const exercises = workout.exercises.map((item) => {
        const draft = drafts[item.id] ?? draftForExercise(item);
        const sets: SetLog[] = draft.sets.map((set) => ({ reps: Number(set.reps), weightKg: set.weightKg === '' ? null : Number(set.weightKg), rir: set.rir === '' ? null : Number(set.rir), completed: set.completed }));
        if (sets.some((set) => !Number.isInteger(set.reps) || set.reps < 0 || (set.weightKg !== null && (!Number.isFinite(set.weightKg) || set.weightKg < 0)) || (set.rir !== null && (!Number.isFinite(set.rir) || set.rir < 0 || set.rir > 5)))) throw new Error(`Controleer de waarden bij ${item.name}.`);
        return { exerciseId: item.id, sets, discomfort: draft.discomfort };
      });
      const duration = actualDuration === '' ? null : Number(actualDuration);
      const rpe = sessionRpe === '' ? null : Number(sessionRpe);
      if (duration !== null && (!Number.isFinite(duration) || duration < 1 || duration > 300)) throw new Error('Vul een werkelijke sessieduur tussen 1 en 300 minuten in.');
      if (rpe !== null && (!Number.isFinite(rpe) || rpe < 1 || rpe > 10)) throw new Error('RPE moet tussen 1 en 10 liggen.');
      onLog({ id: `${workout.id}-${Date.now()}`, workoutId: workout.id, completedAt: new Date().toISOString(), exercises, actualDurationMinutes: duration, sessionRpe: rpe, recovery });
      setSaved(true);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Deze sessie kon niet worden opgeslagen.');
    }
  };

  return <div className="logger"><div className="logger-head"><div><span className="kicker">{logged ? 'Opnieuw loggen' : 'Na je training'}</span><h3>Log deze sessie</h3><p>Completion en prestaties wegen zwaarder dan één subjectieve RIR-score.</p></div>{saved && <span className="saved-label"><Icon name="check" size={14} /> Opgeslagen</span>}</div>{workout.exercises.map((item, exerciseIndex) => { const draft = drafts[item.id] ?? draftForExercise(item); return <div className="logger-exercise" key={item.id}><div className="logger-exercise-head"><span><b>{exerciseIndex + 1}. {item.name}</b><small>{item.sets} sets · {item.repMin}–{item.repMax} reps · doel {item.rir} RIR</small></span><select value={draft.discomfort} onChange={(event) => updateExercise(item.id, { discomfort: event.target.value as Discomfort })} aria-label={`Klacht bij ${item.name}`}><option value="none">Geen klacht</option><option value="discomfort">Ongemak</option><option value="pain">Pijn</option></select></div><div className="set-log-grid"><div className="set-log-row set-log-labels"><span>Set</span><span>Reps</span><span>Kg</span><span>RIR</span><span>✓</span></div>{draft.sets.map((set, setIndex) => <div className="set-log-row" key={setIndex}><span>{setIndex + 1}</span><input type="number" min="0" step="1" value={set.reps} onChange={(event) => updateSet(item.id, setIndex, { reps: event.target.value })} aria-label={`${item.name} set ${setIndex + 1} reps`} /><input type="number" min="0" step="0.5" value={set.weightKg} onChange={(event) => updateSet(item.id, setIndex, { weightKg: event.target.value })} placeholder="—" aria-label={`${item.name} set ${setIndex + 1} gewicht`} /><input type="number" min="0" max="5" step="1" value={set.rir} onChange={(event) => updateSet(item.id, setIndex, { rir: event.target.value })} aria-label={`${item.name} set ${setIndex + 1} RIR`} /><input type="checkbox" checked={set.completed} onChange={(event) => updateSet(item.id, setIndex, { completed: event.target.checked })} aria-label={`${item.name} set ${setIndex + 1} voltooid`} /></div>)}</div></div>; })}<div className="logger-meta"><label><span>Duur</span><input type="number" min="1" max="300" value={actualDuration} onChange={(event) => setActualDuration(event.target.value)} /><small>minuten</small></label><label><span>Session RPE</span><select value={sessionRpe} onChange={(event) => setSessionRpe(event.target.value)}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => <option key={value} value={value}>{value}/10</option>)}</select></label><label><span>Herstel</span><select value={recovery} onChange={(event) => setRecovery(event.target.value as WorkoutLog['recovery'])}><option value="good">Goed</option><option value="okay">Oké</option><option value="poor">Onvoldoende</option></select></label></div>{error && <div className="inline-error"><Icon name="info" size={15} /> {error}</div>}<button type="button" className="primary-button logger-save" onClick={save}><Icon name="check" size={16} /> Sessie opslaan</button></div>;
}

const TREND_LABELS: Record<string, string> = {
  new: 'Eerste blootstelling',
  progressing: 'Verbetering',
  steady: 'Gelijk',
  declining: 'Aandacht nodig',
  pain: 'Veiligheidsmelding'
};

const RECOVERY_LABELS: Record<WorkoutLog['recovery'], string> = { good: 'goed', okay: 'oké', poor: 'onvoldoende' };

function latestWorkoutLog(logs: WorkoutLog[], workoutId: string): WorkoutLog | null {
  return logs.filter((log) => log.workoutId === workoutId).sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt)).at(-1) ?? null;
}

function signedValue(value: number | null): string | null {
  if (value === null) return null;
  return `${value > 0 ? '+' : ''}${formatNumber(value)}`;
}

function ExerciseEducationPanel({ item, videoOpen, onVideoToggle }: { item: ExercisePrescription; videoOpen: boolean; onVideoToggle: () => void }) {
  const { education } = item;
  const videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(education.video.videoId)}`;
  return <div className="exercise-education"><div className="education-grid"><div className="education-copy"><section><span className="kicker">Zo stel je op</span><p>{education.setup}</p></section><section><span className="kicker">Zo voer je uit</span><ol className="education-steps">{education.steps.map((step) => <li key={step}>{step}</li>)}</ol></section><section className="education-mistakes"><span className="kicker">Let op</span><ul>{education.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></section></div><div className="video-preview"><div className="video-frame">{videoOpen ? <iframe src={`https://www.youtube-nocookie.com/embed/${education.video.videoId}?rel=0`} title={education.video.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture" allowFullScreen /> : <button type="button" className="video-thumb" onClick={onVideoToggle} aria-label={`Laad video: ${education.video.title}`}><img src={`https://i.ytimg.com/vi/${education.video.videoId}/hqdefault.jpg`} alt="" loading="lazy" /><span className="video-play">Afspelen</span></button>}</div><div className="video-copy"><b>{education.video.title}</b><small>{education.video.channel} · {education.video.language === 'nl' ? 'Nederlands' : 'Engels'}</small><a href={videoUrl} target="_blank" rel="noreferrer">Open op YouTube</a></div></div></div></div>;
}

function WorkoutFeedbackSummary({ workout, log }: { workout: Workout; log: WorkoutLog | null }) {
  if (!log) return null;
  const feedback = getWorkoutFeedback(workout, log);
  const duration = feedback.actualDurationMinutes === null ? 'duur niet gelogd' : `${feedback.actualDurationMinutes} minuten`;
  return <div className={`feedback-panel${feedback.hasPain ? ' has-pain' : ''}`} role={feedback.hasPain ? 'alert' : 'status'}><div><span className="kicker">{feedback.hasPain ? 'Veiligheidsmelding' : 'Coachsamenvatting'}</span><b>{feedback.completedSets}/{feedback.plannedSets} sets voltooid · {duration} · herstel {feedback.recovery ? RECOVERY_LABELS[feedback.recovery] : 'niet gelogd'}</b><small>{feedback.completedExercises}/{feedback.plannedExercises} oefeningen geraakt{feedback.sessionRpe === null ? '' : ` · RPE ${feedback.sessionRpe}/10`}</small></div>{feedback.hasPain && <p>Er is pijn gelogd. Stop met de pijnlijke oefening, kies geen progressie en laat een deskundige meekijken als de klacht aanhoudt.</p>}</div>;
}

function WorkoutDetailEnhanced({ profile, workout, trainingState, onLog, onSwap, logged }: { profile: Profile; workout: Workout; trainingState: TrainingState; onLog: (log: WorkoutLog) => void; onSwap: (current: ExercisePrescription, replacement: ExerciseDefinition) => void; logged: boolean }) {
  const [swapOpenId, setSwapOpenId] = useState<string | null>(null);
  const [replacementIds, setReplacementIds] = useState<Record<string, string>>({});
  const [educationOpenId, setEducationOpenId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const latestLog = latestWorkoutLog(trainingState.logs, workout.id);
  const toggleEducation = (exerciseId: string) => {
    if (educationOpenId === exerciseId) {
      setEducationOpenId(null);
      setActiveVideoId(null);
      return;
    }
    setEducationOpenId(exerciseId);
    setActiveVideoId(null);
  };
  return <article className="workout-detail"><header className="workout-detail-header"><div><span className="kicker">{workout.day} · {workout.duration} min / limiet {workout.timeBudget}</span><h2>{workout.title}</h2><p>{workout.focus} · {workout.exercises.length} oefeningen · {logged ? 'deze week gelogd' : 'nog te loggen'}</p>{workout.fitNote && <p className="fit-note"><Icon name="clock" size={14} /> {workout.fitNote}</p>}</div><span className="plan-status"><Icon name="clock" size={14} /> {workout.duration <= workout.timeBudget ? 'Past binnen tijd' : 'Te lang'}</span></header><WorkoutFeedbackSummary workout={workout} log={latestLog} /><div className="exercise-table-head"><span>Oefening</span><span>Sets × reps</span><span>Rust</span><span>RIR</span></div><div>{workout.exercises.map((item, index) => { const alternatives = getSafeAlternatives(item.id, profile); const selectedReplacement = replacementIds[item.id] ?? alternatives[0]?.id ?? ''; const progress = getExerciseProgress(item.id, trainingState); const latest = progress.latest; const trendText = progress.trend === 'progressing' && progress.deltaBestWeightKg !== null ? `${signedValue(progress.deltaBestWeightKg)} kg` : progress.trend === 'progressing' && progress.deltaAverageReps !== null ? `${signedValue(progress.deltaAverageReps)} reps` : TREND_LABELS[progress.trend]; const loadText = item.equipment === 'bodyweight' || item.equipment === 'bands' ? 'lichaamsgewicht / band' : latest?.bestWeightKg === null || latest?.bestWeightKg === undefined ? 'geen belasting gelogd' : `${formatNumber(latest.bestWeightKg)} kg`; return <div className={`exercise-item${progress.trend === 'pain' ? ' has-pain' : ''}`} key={item.id}><span className="exercise-number">0{index + 1}</span><div className="exercise-copy"><div className="exercise-heading"><b>{item.name}</b><button type="button" className="education-toggle" onClick={() => toggleEducation(item.id)} aria-expanded={educationOpenId === item.id}>{educationOpenId === item.id ? 'Techniek verbergen' : 'Techniek bekijken'}</button></div><small>{item.cue}</small><div className="exercise-targets"><span>Doel: {item.primary.map((muscle) => MUSCLE_LABELS[muscle]).join(' + ')}</span>{item.secondary.length > 0 && <span>secundair: {item.secondary.slice(0, 2).map((muscle) => MUSCLE_LABELS[muscle]).join(' + ')}</span>}</div><div className="exercise-history"><span>Laatste keer: {latest ? `${latest.completedSets}/${latest.totalSets} sets · ${latest.averageReps === null ? 'geen reps' : `${formatNumber(latest.averageReps)} reps`} · ${loadText}` : 'nog geen blootstelling'}</span><span className={`trend-badge trend-${progress.trend}`}>{trendText}</span></div>{progress.trend === 'pain' && <small className="exercise-safety">Pijn gelogd: geen progressie maken; beoordeel eerst de klacht.</small>}</div><div className="exercise-dose"><b>{item.sets} × {item.reps}</b><small>{item.suggestedLoadKg !== undefined ? `volgende belasting ${formatNumber(item.suggestedLoadKg)} kg` : `${item.reps} reps met ${item.rir} RIR`}</small></div><div className="exercise-rest"><b>{item.restSeconds}s</b><small>rust</small></div><div className="exercise-rir"><b>{item.rir}</b><small>RIR</small></div><div className="exercise-next-action"><span>Volgende keer</span><small>{item.progression.message}</small></div><button type="button" className="swap-trigger" onClick={() => setSwapOpenId(swapOpenId === item.id ? null : item.id)}><Icon name="refresh" size={14} /> Swap</button>{educationOpenId === item.id && <ExerciseEducationPanel item={item} videoOpen={activeVideoId === item.id} onVideoToggle={() => setActiveVideoId(activeVideoId === item.id ? null : item.id)} />}{swapOpenId === item.id && <div className="swap-panel"><div><b>Veilige alternatieven</b><small>zelfde bewegingsdoel, opnieuw gefilterd op je profiel</small></div>{alternatives.length ? <><select value={selectedReplacement} onChange={(event) => setReplacementIds((current) => ({ ...current, [item.id]: event.target.value }))}>{alternatives.map((alternative) => <option key={alternative.id} value={alternative.id}>{alternative.name}</option>)}</select><button type="button" className="secondary-button" onClick={() => { const replacement = alternatives.find((alternative) => alternative.id === selectedReplacement); if (replacement) { onSwap(item, replacement); setSwapOpenId(null); } }}>Toepassen</button></> : <p>Geen veilige alternatief gevonden met je huidige materiaal en restricties.</p>}</div>}</div>; })}</div><WorkoutLogger workout={workout} onLog={onLog} logged={logged} /></article>;
}

const WARNING_GROUPS: Record<string, string> = {
  'time-constraint': 'Tijd',
  'missing-pattern': 'Oefeningen',
  'no-safe-alternative': 'Oefeningen',
  'missing-muscle': 'Volume',
  'under-start-volume': 'Volume',
  'recovery-overlap': 'Herstel',
  'sport-overlap': 'Herstel',
  'deload-recommended': 'Coach'
};

const WARNING_SEVERITY_ORDER: Record<PlanWarning['severity'], number> = { blocking: 0, warning: 1, info: 2 };

function WarningListEnhanced({ warnings }: { warnings: PlanWarning[] }) {
  if (!warnings.length) return <section className="why-strip"><span className="why-icon"><Icon name="shield" size={20} /></span><div><span className="kicker">Coach check</span><h2>Geen open waarschuwingen</h2><p>De huidige combinatie van dagen, materiaal, tijd en restricties heeft een uitvoerbaar startpunt opgeleverd.</p></div></section>;
  const sorted = [...warnings].sort((a, b) => WARNING_SEVERITY_ORDER[a.severity] - WARNING_SEVERITY_ORDER[b.severity] || a.message.localeCompare(b.message));
  const grouped = sorted.reduce<Record<string, PlanWarning[]>>((groups, warning) => { const group = WARNING_GROUPS[warning.code] ?? 'Coach'; (groups[group] ??= []).push(warning); return groups; }, {});
  const primary = sorted[0];
  return <section className="warning-section"><Icon name="info" size={21} /><div><span className="kicker">Coach check · {warnings.length} aandachtspunt{warnings.length === 1 ? '' : 'en'}</span><h2>Dit vraagt aandacht</h2><div className="warning-primary"><span>Primaire aanbeveling</span><b>{primary.suggestions[0] ?? primary.message}</b></div><div className="warning-groups">{['Tijd', 'Oefeningen', 'Volume', 'Herstel', 'Coach'].filter((group) => grouped[group]?.length).map((group, index) => <details className="warning-group" key={group} open={index === 0}><summary><span>{group}</span><small>{grouped[group].length} item{grouped[group].length === 1 ? '' : 's'}</small></summary><div className="warning-group-items">{grouped[group].map((warning, warningIndex) => <div className="warning-item" key={`${warning.code}-${warning.muscle ?? ''}-${warning.workoutTitle ?? ''}-${warningIndex}`}><div><span className={`warning-severity ${warning.severity}`}>{warning.severity}</span><b>{warning.message}</b></div><small>{warning.suggestions.join(' ')}</small></div>)}</div></details>)}</div></div></section>;
}

function PlanScreenEnhanced({ profile, plan, trainingState, onStateChange, onEdit, onReset }: { profile: Profile; plan: TrainingPlan; trainingState: TrainingState; onStateChange: (state: TrainingState) => void; onEdit: () => void; onReset: () => void }) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(plan.workouts[0]?.id ?? '');
  const [notice, setNotice] = useState<string | null>(null);
  const selectedWorkout = plan.workouts.find((workout) => workout.id === selectedWorkoutId) ?? plan.workouts[0];
  const weekProgress = getWorkoutProgress(plan.workouts, trainingState.logs);
  const loggedIds = new Set(weekProgress.completedWorkoutIds);
  const setPercentage = weekProgress.plannedSets ? Math.round((weekProgress.completedSets / weekProgress.plannedSets) * 100) : 0;
  const nextWorkout = plan.workouts.find((workout) => !loggedIds.has(workout.id));
  const nextAction = plan.deloadRecommended ? 'Plan een rustige herstelweek met halve sets.' : nextWorkout ? `Log ${nextWorkout.title} na je volgende training.` : 'Alle trainingen staan gelogd; volg nu de oefening-acties.';

  useEffect(() => {
    if (!plan.workouts.some((workout) => workout.id === selectedWorkoutId)) setSelectedWorkoutId(plan.workouts[0]?.id ?? '');
  }, [plan.workouts, selectedWorkoutId]);

  const logWorkout = (log: WorkoutLog) => {
    const logs = [...trainingState.logs, log].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    const actualRatios = logs.filter((item) => item.actualDurationMinutes && item.actualDurationMinutes > 0).map((item) => { const reference = plan.workouts.find((workout) => workout.id === item.workoutId)?.duration ?? item.actualDurationMinutes!; return item.actualDurationMinutes! / reference; });
    const timeFactor = actualRatios.length >= 3 ? clamp(actualRatios.reduce((sum, ratio) => sum + ratio, 0) / actualRatios.length, 1, 1.35) : trainingState.timeFactor;
    onStateChange({ ...trainingState, logs, timeFactor });
    const workout = plan.workouts.find((item) => item.id === log.workoutId);
    const feedback = workout ? getWorkoutFeedback(workout, log) : null;
    setNotice(`Sessie opgeslagen — ${feedback?.completedSets ?? 0}/${feedback?.plannedSets ?? log.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} sets.`);
  };

  const swapExercise = (workout: Workout, current: ExercisePrescription, replacement: ExerciseDefinition) => {
    const overrides = { ...trainingState.overrides };
    const existingKey = Object.entries(overrides).find(([key, value]) => key.startsWith(`${workout.id}:`) && value === current.id)?.[0];
    overrides[existingKey ?? `${workout.id}:${current.id}`] = replacement.id;
    onStateChange({ ...trainingState, overrides });
    setNotice(`${replacement.name} staat nu als veilige swap klaar.`);
  };

  const downloadCalendar = () => {
    const blob = new Blob([createIcs(plan)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'fitquest-schema.ics'; anchor.click(); URL.revokeObjectURL(url);
  };

  return <main className="plan-screen"><header className="plan-header"><Brand /><nav><button type="button" className="is-active">Mijn schema</button><button type="button" onClick={onEdit}>Profiel</button></nav><button type="button" className="profile-chip" onClick={onEdit}><Icon name="refresh" size={14} /> Profiel aanpassen</button></header><div className="plan-content"><section className="plan-hero"><div className="plan-hero-copy"><span className="kicker">{plan.deloadRecommended ? 'Data-gestuurde herstelweek' : 'Jouw huidige startpunt'}</span><h1>{plan.title}</h1><p>{plan.description}</p><div className="plan-pills"><span><Icon name="calendar" size={14} /> {plan.frequency}</span><span><Icon name="clock" size={14} /> {plan.rhythm}</span><span><Icon name="target" size={14} /> {profile.priorityMuscles.slice(0, 3).map((muscle) => MUSCLE_LABELS[muscle]).join(' · ')}</span></div></div><div className="plan-score"><span className="progress-ring" style={{ background: `conic-gradient(var(--accent) ${Math.min(100, (weekProgress.completedWorkouts / Math.max(weekProgress.plannedWorkouts, 1)) * 100)}%, #dbe9d5 0)` }}><i>{weekProgress.completedWorkouts}/{weekProgress.plannedWorkouts}</i></span><span><small>Weekvoortgang</small><b>{weekProgress.completedWorkouts}/{weekProgress.plannedWorkouts} trainingen deze week</b><em>{weekProgress.completedSets}/{weekProgress.plannedSets} sets voltooid</em></span><div className="hero-next-action"><span>Volgende actie</span><b>{nextAction}</b></div><span className="hero-progress-track"><i style={{ width: `${setPercentage}%` }} /></span></div></section><section className="schedule-section"><div className="section-heading"><span className="kicker">Deze week</span><h2>Je trainingen</h2><p>Kies een dag, voer de sessie uit en log daarna wat er echt gebeurde.</p></div><div className="schedule-layout"><div className="workout-list">{plan.workouts.map((workout) => { const workoutProgress = getWorkoutProgress([workout], trainingState.logs); const plannedSets = workoutProgress.plannedSets; const percent = plannedSets ? Math.round((workoutProgress.completedSets / plannedSets) * 100) : 0; return <button type="button" key={workout.id} className={selectedWorkout?.id === workout.id ? 'is-active' : ''} onClick={() => setSelectedWorkoutId(workout.id)}><span className="workout-day">{workout.day.slice(0, 2)}</span><span className="workout-card-copy"><b>{workout.title}</b><small>{workout.focus}</small><em>{workout.duration} min · limiet {workout.timeBudget}</em></span><span className="workout-card-progress"><b>{workoutProgress.completedSets}/{plannedSets}</b><small>sets</small><span className="mini-progress"><i style={{ width: `${percent}%` }} /></span></span>{loggedIds.has(workout.id) ? <span className="done-mark"><Icon name="check" size={13} /></span> : <Icon name="chevron" size={16} />}</button>; })}</div>{selectedWorkout && <WorkoutDetailEnhanced profile={profile} workout={selectedWorkout} trainingState={trainingState} onLog={logWorkout} onSwap={(current, replacement) => swapExercise(selectedWorkout, current, replacement)} logged={loggedIds.has(selectedWorkout.id)} />}</div></section><WarningListEnhanced warnings={plan.warnings} /><section className="volume-section"><div className="volume-copy"><span className="kicker">Volume-accounting</span><h2>Direct gepland, effectief gerekend.</h2><p>Directe sets zijn de sets die een spiergroep rechtstreeks traint. De effectieve bijdrage telt secundaire betrokkenheid mee voor planning en herstel; dat zijn dus geen extra directe sets.</p></div><div className="volume-list">{MUSCLE_GROUPS.map((muscle) => { const source = plan.volumeSource[muscle] === 'current-volume' ? 'huidig volume' : plan.volumeSource[muscle] === 'adapted-from-logs' ? 'aangepast uit logs' : 'conservatieve start'; const direct = plan.directWeeklyVolume[muscle]; const effective = plan.weeklyVolume[muscle]; const start = plan.startVolume[muscle]; const width = start > 0 ? Math.min(100, Math.max(4, direct / start * 100)) : Math.min(100, direct / 16 * 100); return <div className="volume-row" key={muscle}><div className="volume-row-heading"><b>{MUSCLE_LABELS[muscle]}</b><small>{source}</small></div><div className="volume-metrics"><span><small>Direct gepland</small><strong>{formatNumber(direct)} sets</strong></span><span><small>Startvolume</small><strong>{formatNumber(start)} sets</strong></span><span><small>Effectief</small><strong>{formatNumber(effective)}</strong></span></div><span className="volume-track"><i style={{ width: `${width}%` }} /></span></div>; })}</div></section><section className="calendar-section"><div><span className="kicker">Je agenda</span><h2>Plan het in.</h2><p>Exporteer je huidige week lokaal naar je agenda. Geen account en geen synchronisatie.</p></div><div className="calendar-actions"><button type="button" className="primary-button" onClick={downloadCalendar}><Icon name="calendar" size={16} /> Download .ics</button>{selectedWorkout && <a className="secondary-button" href={createGoogleCalendarUrl(selectedWorkout)} target="_blank" rel="noreferrer"><Icon name="calendar" size={16} /> Google Calendar</a>}</div></section><footer className="plan-footer"><p>FitQuest geeft trainingsinformatie, geen medisch advies. Bij pijn: stop, log het en kies geen oefening blind door.</p><div><button type="button" className="text-button muted" onClick={onEdit}>Intake aanpassen</button><button type="button" className="text-button muted" onClick={onReset}>Nieuw profiel</button></div></footer></div>{notice && <button type="button" className="toast" onClick={() => setNotice(null)}><b>Coach update</b><span>{notice}</span></button>}</main>;
}

type PostView = 'overview' | 'plan' | 'exercises' | 'progress' | 'profile';
type TrainingMode = 'education' | 'logging';
type SessionSetDraft = { reps: string; weightKg: string; rir: string; completed: boolean };
type SessionExerciseDraft = { sets: SessionSetDraft[]; discomfort: Discomfort };
type SessionMeta = { duration: string; rpe: string; recovery: WorkoutLog['recovery'] };
type ActiveTrainingSession = { workoutId: string; exerciseIndex: number; mode: TrainingMode; drafts: Record<string, SessionExerciseDraft>; meta: SessionMeta };
const POST_CHECK_IN_KEY = 'fitquest-coach-check-in-v1';
const POST_NAV_ITEMS: Array<{ id: PostView; label: string; icon: IconName }> = [
  { id: 'overview', label: 'Overzicht', icon: 'home' },
  { id: 'plan', label: 'Plan', icon: 'calendar' },
  { id: 'exercises', label: 'Oefeningen', icon: 'dumbbell' },
  { id: 'progress', label: 'Voortgang', icon: 'bar-chart' },
  { id: 'profile', label: 'Profiel', icon: 'user' }
];
const CHECK_IN_QUESTIONS = [
  { key: 'time', title: 'Is je beschikbare trainingstijd nog juist?', options: [['same', 'Ja, zo is het goed'], ['shorter', 'Ik heb minder tijd'], ['longer', 'Ik heb meer tijd']] },
  { key: 'recovery', title: 'Hoe was je herstel na de laatste sessies?', options: [['good', 'Goed'], ['okay', 'Oké'], ['poor', 'Niet goed']] },
  { key: 'comfort', title: 'Was een oefening prettig om te doen?', options: [['good', 'Ja, prettig'], ['attention', 'Met aandacht'], ['problem', 'Nee, problematisch']] },
  { key: 'variety', title: 'Wil je meer of minder variatie?', options: [['same', 'Zo is het goed'], ['less', 'Minder wisselen'], ['more', 'Meer wisselen']] }
] as const;

function localWeekday(date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

function dateForWeekday(weekday: number, reference = new Date()): Date {
  const date = new Date(reference);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - localWeekday(reference) + weekday);
  return date;
}

function distanceFromDay(day: number, referenceDay: number): number {
  return (day - referenceDay + 7) % 7 || 7;
}

function latestLog(logs: WorkoutLog[]): WorkoutLog | null {
  return logs.slice().sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt) || a.id.localeCompare(b.id)).at(-1) ?? null;
}

function workoutCompletedThisWeek(workout: Workout, logs: WorkoutLog[]): boolean {
  return getWorkoutProgress([workout], logs).completedWorkouts > 0;
}

function nextOpenWorkout(plan: TrainingPlan, fromDay: number, logs: WorkoutLog[]): Workout | undefined {
  const open = plan.workouts.filter((workout) => !workoutCompletedThisWeek(workout, logs));
  return open.sort((a, b) => distanceFromDay(a.weekday, fromDay) - distanceFromDay(b.weekday, fromDay))[0] ?? plan.workouts[0];
}

function recommendedNextAction(plan: TrainingPlan, workout: Workout, logs: WorkoutLog[]): string {
  const latest = latestLog(logs.filter((log) => log.workoutId === workout.id));
  if (latest && getWorkoutFeedback(workout, latest).hasPain) return 'Pauzeer de pijnlijke oefening en kies geen progressie.';
  if (plan.deloadRecommended) return 'Volg een rustige herstelweek en houd extra marge.';
  const next = nextOpenWorkout(plan, workout.weekday, logs);
  return next && next.id !== workout.id ? `Volgende aanbevolen training: ${next.title}.` : 'Geef je lichaam herstel en log je volgende blootstelling.';
}

function sessionDraftForExercise(item: ExercisePrescription, trainingState: TrainingState): SessionExerciseDraft {
  const progress = getExerciseProgress(item.id, trainingState);
  const latest = progress.latest;
  const reps = latest?.averageReps === null || latest?.averageReps === undefined ? item.repMin : clamp(Math.round(latest.averageReps), item.repMin, item.repMax);
  const weight = item.suggestedLoadKg ?? latest?.bestWeightKg ?? null;
  const rir = latest?.averageRir === null || latest?.averageRir === undefined ? item.rir : clamp(Math.round(latest.averageRir), 0, 5);
  return {
    sets: Array.from({ length: item.sets }, () => ({ reps: String(reps), weightKg: weight === null ? '' : String(weight), rir: String(rir), completed: false })),
    discomfort: 'none'
  };
}

function sessionDraftForWorkout(workout: Workout, trainingState: TrainingState): Record<string, SessionExerciseDraft> {
  return Object.fromEntries(workout.exercises.map((item) => [item.id, sessionDraftForExercise(item, trainingState)])) as Record<string, SessionExerciseDraft>;
}

function trendLabel(progress: ReturnType<typeof getExerciseProgress>): string {
  if (progress.trend === 'progressing' && progress.deltaBestWeightKg !== null) return `${signedValue(progress.deltaBestWeightKg)} kg`;
  if (progress.trend === 'progressing' && progress.deltaAverageReps !== null) return `${signedValue(progress.deltaAverageReps)} reps`;
  return TREND_LABELS[progress.trend] ?? 'Nieuw';
}

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'Goedemorgen!' : hour < 18 ? 'Goedemiddag!' : 'Goedenavond!';
}

function PostHeader({ activeView, streak, onNavigate }: { activeView: PostView; streak: ReturnType<typeof calculateWeeklyStreak>; onNavigate: (view: PostView) => void }) {
  return <header className="post-header"><Brand /><nav className="post-desktop-nav" aria-label="Hoofdnavigatie">{POST_NAV_ITEMS.map((item) => <button type="button" key={item.id} className={activeView === item.id ? 'is-active' : ''} aria-current={activeView === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}><Icon name={item.icon} size={16} /> {item.label}</button>)}</nav><div className="post-header-actions"><span className="post-streak"><Icon name="spark" size={17} /><span><small>Streak</small><b>{streak.current}</b></span></span><button type="button" className="post-avatar" onClick={() => onNavigate('profile')} aria-label="Open profiel"><Icon name="user" size={18} /></button></div></header>;
}

function BottomNav({ activeView, onNavigate }: { activeView: PostView; onNavigate: (view: PostView) => void }) {
  return <nav className="post-bottom-nav" aria-label="App-navigatie">{POST_NAV_ITEMS.map((item) => <button type="button" key={item.id} className={activeView === item.id ? 'is-active' : ''} aria-current={activeView === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}><Icon name={item.icon} size={18} /><span>{item.label}</span></button>)}</nav>;
}

function VideoPreview({ item, open, onOpen }: { item: ExercisePrescription; open: boolean; onOpen: () => void }) {
  const video = item.education.video;
  const videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(video.videoId)}`;
  return <section className="post-video-card"><div className="post-video-frame">{open ? <iframe src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`} title={video.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture" allowFullScreen /> : <button type="button" className="post-video-thumb" onClick={onOpen} aria-label={`Laad video: ${video.title}`}><img src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt="" loading="lazy" /><span className="post-video-play"><Icon name="play" size={16} /> Bekijk video</span></button>}</div><div className="post-video-copy"><div><span className="kicker">Video-uitleg</span><b>{video.title}</b><small>{video.channel}</small></div><div className="post-video-links"><a href={videoUrl} target="_blank" rel="noreferrer">Open op YouTube</a><code>{video.videoId}</code></div></div></section>;
}

function ExerciseEducationView({ item, videoOpen, onVideoToggle }: { item: ExercisePrescription; videoOpen: boolean; onVideoToggle: () => void }) {
  const muscles = [...new Set([...item.primary, ...item.secondary])].slice(0, 3).map((muscle) => MUSCLE_LABELS[muscle]).join(' · ');
  return <div className="post-education"><div className="post-education-heading"><span className="kicker">Oefening-uitleg</span><h1>{item.name}</h1><p>{muscles}</p><span className="post-prescription">{item.sets} sets × {item.reps} · RIR {item.rir}</span></div><VideoPreview item={item} open={videoOpen} onOpen={onVideoToggle} /><div className="post-education-sections"><section><span className="post-section-icon"><Icon name="dumbbell" size={18} /></span><div><h2>Zo stel je op</h2><p>{item.education.setup}</p></div></section><section><span className="post-section-icon"><Icon name="arrow-up" size={18} /></span><div><h2>Zo voer je uit</h2><ol>{item.education.steps.map((step) => <li key={step}>{step}</li>)}</ol></div></section><section className="post-attention"><span className="post-section-icon"><Icon name="alert" size={18} /></span><div><h2>Let op</h2><ul>{item.education.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></div></section></div></div>;
}

function MetricStepper({ label, value, unit, step, min, max, disabled = false, onChange }: { label: string; value: string; unit: string; step: number; min: number; max: number; disabled?: boolean; onChange: (value: string) => void }) {
  const adjust = (delta: number) => { if (disabled) return; const numeric = Number(value); const next = clamp((Number.isFinite(numeric) ? numeric : 0) + delta, min, max); onChange(String(Math.round(next * 10) / 10)); };
  return <div className={`post-metric-stepper${disabled ? ' is-disabled' : ''}`}><span>{label}</span><div><button type="button" onClick={() => adjust(-step)} disabled={disabled} aria-label={`${label} verlagen`}>−</button><strong>{disabled ? 'Eigen gewicht' : value || '—'}</strong><button type="button" onClick={() => adjust(step)} disabled={disabled} aria-label={`${label} verhogen`}>+</button></div><small>{unit}</small></div>;
}

function PreviousPerformance({ item, trainingState }: { item: ExercisePrescription; trainingState: TrainingState }) {
  const progress = getExerciseProgress(item.id, trainingState);
  const latest = progress.latest;
  const previous = latest ? `${latest.bestWeightKg === null ? 'Eigen gewicht' : `${formatNumber(latest.bestWeightKg)} kg`} × ${latest.averageReps === null ? '—' : formatNumber(latest.averageReps)}` : 'Nog geen eerdere blootstelling';
  return <div className="post-previous-performance"><span><Icon name="clock" size={16} /> Vorige keer</span><b>{previous}</b><span className={`post-trend-badge trend-${progress.trend}`}>{trendLabel(progress)}</span></div>;
}

function ExerciseLogger({ item, draft, trainingState, onDraftChange }: { item: ExercisePrescription; draft: SessionExerciseDraft; trainingState: TrainingState; onDraftChange: (patch: Partial<SessionExerciseDraft>) => void }) {
  const firstOpenSet = draft.sets.findIndex((set) => !set.completed);
  const currentIndex = firstOpenSet === -1 ? Math.max(0, draft.sets.length - 1) : firstOpenSet;
  const activeSet = draft.sets[currentIndex] ?? draft.sets[draft.sets.length - 1];
  const progress = getExerciseProgress(item.id, trainingState);
  const weightless = item.equipment === 'bodyweight' || item.equipment === 'bands';
  const nextAction = progress.trend === 'pain' || draft.discomfort === 'pain' ? 'Geen progressie zolang pijn is gemeld.' : item.progression.message;
  return <div className="post-logger"><div className="post-logger-head"><div><span className="kicker">Setlogger</span><h2>Log wat er echt gebeurde</h2></div><b>Set {currentIndex + 1} van {item.sets}</b></div><div className="post-metric-grid"><MetricStepper label="Reps" value={activeSet?.reps ?? ''} unit="herhalingen" step={1} min={0} max={100} onChange={(value) => onDraftChange({ sets: draft.sets.map((set, index) => index === currentIndex ? { ...set, reps: value } : set) })} /><MetricStepper label="Gewicht" value={activeSet?.weightKg ?? ''} unit="kg" step={item.loadStepKg || 1} min={0} max={500} disabled={weightless} onChange={(value) => onDraftChange({ sets: draft.sets.map((set, index) => index === currentIndex ? { ...set, weightKg: value } : set) })} /><MetricStepper label="RIR" value={activeSet?.rir ?? ''} unit="ruimte over" step={1} min={0} max={5} onChange={(value) => onDraftChange({ sets: draft.sets.map((set, index) => index === currentIndex ? { ...set, rir: value } : set) })} /></div><PreviousPerformance item={item} trainingState={trainingState} /><div className="post-next-action"><span>Volgende keer</span><b>{nextAction}</b></div><label className="post-discomfort-field"><span>Hoe voelde deze oefening?</span><select aria-label={`Pijn of ongemak bij ${item.name}`} value={draft.discomfort} onChange={(event) => onDraftChange({ discomfort: event.target.value as Discomfort })}><option value="none">Geen pijn of ongemak</option><option value="discomfort">Ongemak, aanpassen indien nodig</option><option value="pain">Pijn, stop en laat beoordelen</option></select></label>{draft.discomfort === 'pain' && <div className="post-pain-note" role="alert"><Icon name="alert" size={17} /><span><b>Pijn blijft leidend.</b> Sla deze oefening over, kies geen progressie en laat de klacht beoordelen als deze aanhoudt.</span></div>}<p className="post-logger-hint">Sla elke set op zodra je hem hebt afgerond. Niet ingevulde sets blijven overgeslagen.</p></div>;
}

function SessionMetaFields({ meta, onChange }: { meta: SessionMeta; onChange: (patch: Partial<SessionMeta>) => void }) {
  return <section className="post-session-meta"><div><span className="kicker">Sessie afronden</span><h2>Hoe was de training?</h2></div><label><span>Werkelijke duur</span><div><input type="number" min="1" max="300" value={meta.duration} onChange={(event) => onChange({ duration: event.target.value })} aria-label="Werkelijke duur in minuten" /><small>min</small></div></label><label><span>RPE</span><select value={meta.rpe} onChange={(event) => onChange({ rpe: event.target.value })} aria-label="Session RPE">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => <option key={value} value={value}>{value}/10</option>)}</select></label><label><span>Herstel</span><select value={meta.recovery} onChange={(event) => onChange({ recovery: event.target.value as WorkoutLog['recovery'] })} aria-label="Herstel na de training"><option value="good">Goed</option><option value="okay">Oké</option><option value="poor">Onvoldoende</option></select></label></section>;
}

function ActiveTrainingView({ workout, session, trainingState, onChange, onExit, onComplete }: { workout: Workout; session: ActiveTrainingSession; trainingState: TrainingState; onChange: (session: ActiveTrainingSession) => void; onExit: () => void; onComplete: (session: ActiveTrainingSession) => void }) {
  const [videoExerciseId, setVideoExerciseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const item = workout.exercises[session.exerciseIndex] ?? workout.exercises[0];
  const draft = session.drafts[item.id] ?? sessionDraftForExercise(item, trainingState);
  const currentIndex = draft.sets.findIndex((set) => !set.completed);
  const allSetsComplete = currentIndex === -1;
  const canAdvance = allSetsComplete || draft.discomfort === 'pain';
  const lastExercise = session.exerciseIndex === workout.exercises.length - 1;
  const updateDraft = (patch: Partial<SessionExerciseDraft>) => { onChange({ ...session, drafts: { ...session.drafts, [item.id]: { ...draft, ...patch } } }); setError(null); };
  const saveSet = () => {
    if (allSetsComplete) return;
    const activeSet = draft.sets[currentIndex];
    const reps = Number(activeSet.reps);
    const rir = Number(activeSet.rir);
    const weight = activeSet.weightKg === '' ? null : Number(activeSet.weightKg);
    if (!Number.isInteger(reps) || reps < 0 || !Number.isInteger(rir) || rir < 0 || rir > 5 || (weight !== null && (!Number.isFinite(weight) || weight < 0))) {
      setError('Controleer reps, gewicht en RIR voordat je deze set opslaat.');
      return;
    }
    updateDraft({ sets: draft.sets.map((set, index) => index === currentIndex ? { ...set, completed: true } : set) });
  };
  const advance = () => {
    if (!canAdvance) { setError('Sla deze set op voordat je doorgaat, of markeer pijn zodat de oefening veilig kan worden overgeslagen.'); return; }
    setError(null);
    if (lastExercise) return onComplete(session);
    onChange({ ...session, exerciseIndex: session.exerciseIndex + 1, mode: 'education' });
    setVideoExerciseId(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const finish = () => {
    const duration = Number(session.meta.duration);
    if (!Number.isFinite(duration) || duration < 1 || duration > 300) { setError('Vul een werkelijke sessieduur tussen 1 en 300 minuten in.'); return; }
    if (!canAdvance) { setError('Rond de huidige set af voordat je de sessie afrondt.'); return; }
    onComplete(session);
  };
  const primaryAction = session.mode === 'education' ? () => onChange({ ...session, mode: 'logging' }) : draft.discomfort === 'pain' ? (lastExercise ? finish : advance) : allSetsComplete ? (lastExercise ? finish : advance) : saveSet;
  const primaryLabel = session.mode === 'education' ? 'Naar loggen' : draft.discomfort === 'pain' ? (lastExercise ? 'Sessie afronden' : 'Oefening overslaan') : allSetsComplete ? (lastExercise ? 'Sessie afronden' : 'Volgende oefening') : 'Set opslaan';
  return <main className="active-training"><header className="active-training-header"><button type="button" className="post-icon-button" onClick={onExit} aria-label="Training verlaten"><Icon name="arrow-left" size={19} /></button><div><span className="kicker">{workout.title}</span><b>Oefening {session.exerciseIndex + 1} van {workout.exercises.length}</b></div><span className="active-training-time"><Icon name="clock" size={15} /> {workout.duration} min</span></header><div className="active-training-progress" aria-label="Oefeningvoortgang">{workout.exercises.map((exercise, index) => <span key={exercise.id} className={`${index < session.exerciseIndex ? 'is-done' : ''}${index === session.exerciseIndex ? ' is-active' : ''}`} />)}</div><div className="active-training-main"><div className="active-exercise-title"><span className="kicker">{item.primary.map((muscle) => MUSCLE_LABELS[muscle]).join(' · ')}</span><h1>{item.name}</h1><p>{item.sets} sets · {item.reps} reps · {item.rir} RIR</p></div><div className="post-tabs" role="tablist" aria-label="Oefeningstappen"><button type="button" role="tab" aria-selected={session.mode === 'education'} className={session.mode === 'education' ? 'is-active' : ''} onClick={() => { setError(null); onChange({ ...session, mode: 'education' }); }}>Uitleg</button><button type="button" role="tab" aria-selected={session.mode === 'logging'} className={session.mode === 'logging' ? 'is-active' : ''} onClick={() => { setError(null); onChange({ ...session, mode: 'logging' }); }}>Loggen</button></div>{session.mode === 'education' ? <ExerciseEducationView item={item} videoOpen={videoExerciseId === item.id} onVideoToggle={() => setVideoExerciseId(videoExerciseId === item.id ? null : item.id)} /> : <><ExerciseLogger item={item} draft={draft} trainingState={trainingState} onDraftChange={updateDraft} /><SessionMetaFields meta={session.meta} onChange={(patch) => onChange({ ...session, meta: { ...session.meta, ...patch } })} /></>}{error && <div className="post-inline-error" role="alert"><Icon name="info" size={15} /> {error}</div>}</div><div className="active-training-actions"><button type="button" className="primary-button" onClick={primaryAction}>{primaryLabel} <Icon name="arrow-right" size={17} /></button>{session.mode === 'logging' && <button type="button" className="secondary-button" onClick={lastExercise ? () => onChange({ ...session, mode: 'education' }) : advance} disabled={!canAdvance && !lastExercise}>{lastExercise ? 'Terug naar uitleg' : 'Volgende oefening'}</button>}</div></main>;
}

function weightless(item: ExercisePrescription): boolean {
  return item.equipment === 'bodyweight' || item.equipment === 'bands';
}

function CoachSummaryCard({ workout, log, nextAction }: { workout: Workout; log: WorkoutLog; nextAction: string }) {
  const feedback = getWorkoutFeedback(workout, log);
  const duration = feedback.actualDurationMinutes === null ? 'Niet gelogd' : `${feedback.actualDurationMinutes} min`;
  return <section className={`post-coach-summary${feedback.hasPain ? ' has-pain' : ''}`} role={feedback.hasPain ? 'alert' : 'status'}><div className="post-summary-heading"><span className="post-summary-check"><Icon name={feedback.hasPain ? 'alert' : 'check'} size={22} /></span><div><span className="kicker">{feedback.hasPain ? 'Veiligheidsmelding' : 'Coachsamenvatting'}</span><h2>{feedback.hasPain ? 'Pauzeer en beoordeel je pijn' : 'Sessie opgeslagen'}</h2><p>{feedback.hasPain ? 'Pijn is leidend. Er is geen progressiebeloning aan deze sessie gekoppeld.' : 'Rustig opgebouwd en klaar voor de volgende blootstelling.'}</p></div></div><div className="post-summary-grid"><span><b>{feedback.completedSets}/{feedback.plannedSets}</b><small>sets</small></span><span><b>{duration}</b><small>werkelijke duur</small></span><span><b>{feedback.recovery ? RECOVERY_LABELS[feedback.recovery] : '—'}</b><small>herstel</small></span><span><b>{feedback.sessionRpe === null ? '—' : `${feedback.sessionRpe}/10`}</b><small>RPE</small></span><span><b>{feedback.completedExercises}/{feedback.plannedExercises}</b><small>oefeningen</small></span></div><div className="post-summary-next"><span>Volgende aanbevolen actie</span><b>{nextAction}</b></div>{feedback.hasPain && <p className="post-summary-safety"><Icon name="shield" size={16} /> Stop met de pijnlijke oefening. Kies geen hoger gewicht en laat aanhoudende klachten beoordelen.</p>}</section>;
}

function SafetyWarning({ warnings }: { warnings: PlanWarning[] }) {
  if (!warnings.length) return null;
  const primary = warnings.slice().sort((a, b) => ({ blocking: 0, warning: 1, info: 2 }[a.severity] - { blocking: 0, warning: 1, info: 2 }[b.severity]))[0];
  return <aside className={`post-warning ${primary.severity}`}><Icon name={primary.severity === 'blocking' ? 'alert' : 'info'} size={19} /><div><span className="kicker">Coach check</span><h2>{primary.severity === 'blocking' ? 'Actie nodig' : 'Aandacht voor deze week'}</h2><p>{primary.message}</p><small>{primary.suggestions[0]}</small></div></aside>;
}

function VolumeOverview({ plan }: { plan: TrainingPlan }) {
  return <section className="post-volume-card"><div><span className="kicker">Volume-overzicht</span><h2>Direct gepland, effectief gerekend.</h2><p>Directe sets zijn zichtbaar naast de effectieve bijdrage voor planning en herstel.</p></div><div className="post-volume-list">{MUSCLE_GROUPS.map((muscle) => { const direct = plan.directWeeklyVolume[muscle]; const start = plan.startVolume[muscle]; const width = start > 0 ? Math.min(100, Math.max(4, direct / start * 100)) : Math.min(100, direct / 16 * 100); return <div className="post-volume-row" key={muscle}><div><b>{MUSCLE_LABELS[muscle]}</b><small>{plan.volumeSource[muscle] === 'current-volume' ? 'huidig volume' : plan.volumeSource[muscle] === 'adapted-from-logs' ? 'aangepast uit logs' : 'conservatieve start'}</small></div><strong>{formatNumber(direct)} sets</strong><span><i style={{ width: `${width}%` }} /></span></div>; })}</div></section>;
}

function DashboardView({ plan, trainingState, streak, selectedDay, onSelectDay, onStartWorkout, checkIn, lastSummary }: { plan: TrainingPlan; trainingState: TrainingState; streak: ReturnType<typeof calculateWeeklyStreak>; selectedDay: number; onSelectDay: (day: number) => void; onStartWorkout: (workout: Workout) => void; checkIn: ReactNode; lastSummary: ReactNode }) {
  const weekProgress = getWorkoutProgress(plan.workouts, trainingState.logs);
  const selectedWorkout = plan.workouts.find((workout) => workout.weekday === selectedDay);
  const selectedComplete = selectedWorkout ? weekProgress.completedWorkoutIds.includes(selectedWorkout.id) : false;
  const actionWorkout = selectedWorkout && !selectedComplete ? selectedWorkout : nextOpenWorkout(plan, selectedDay, trainingState.logs);
  const actionLabel = selectedWorkout && !selectedComplete ? 'Start training' : actionWorkout ? 'Bekijk volgende training' : 'Geen training gepland';
  const today = localWeekday();
  return <div className="post-page dashboard-page"><section className="post-greeting"><div><span className="kicker">{new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</span><h1>{greeting()}</h1><p>Klaar om sterk te worden?</p></div><span className="post-greeting-mark"><Icon name="target" size={23} /></span></section><section className="post-day-picker" aria-label="Kies een dag">{Array.from({ length: 7 }, (_, day) => { const date = dateForWeekday(day); const isToday = day === today; return <button type="button" key={day} className={selectedDay === day ? 'is-selected' : ''} onClick={() => onSelectDay(day)} aria-label={`${DAY_LABELS[day]} ${date.getDate()} ${date.toLocaleDateString('nl-NL', { month: 'long' })}`}><span>{isToday ? 'Vandaag' : DAY_LABELS[day].slice(0, 2)}</span><b>{date.getDate()}</b></button>; })}</section>{lastSummary}<section className={`post-today-card${selectedWorkout ? '' : ' is-rest-day'}`}><div className="post-today-card-top"><span className="kicker">{selectedWorkout ? (selectedDay === today ? 'Vandaag trainen' : 'Geplande training') : 'Herstel is onderdeel van het plan'}</span><span className="post-status-pill"><span /> {selectedWorkout ? `${selectedWorkout.timeBudget} min beschikbaar` : 'Rustdag'}</span></div>{selectedWorkout ? <><h2>{selectedWorkout.title}</h2><p>{selectedWorkout.focus} · {selectedWorkout.exercises.length} oefeningen</p><div className="post-today-meta"><span><Icon name="clock" size={15} /> {selectedWorkout.duration} min</span><span><Icon name="dumbbell" size={15} /> {selectedWorkout.exercises.reduce((sum, item) => sum + item.sets, 0)} sets</span><span>{selectedComplete ? <><Icon name="check" size={15} /> Afgerond</> : 'Nog te doen'}</span></div></> : <><h2>Rustdag</h2><p>Plan je herstel. De volgende training staat al klaar wanneer je er weer bent.</p>{actionWorkout && <div className="post-rest-next"><span>Volgende training</span><b>{actionWorkout.title}</b><small>{actionWorkout.day} · {actionWorkout.duration} min</small></div>}</>}</section><button type="button" className="primary-button post-start-button" onClick={() => actionWorkout && onStartWorkout(actionWorkout)} disabled={!actionWorkout}>{actionLabel}<Icon name="arrow-right" size={19} /></button><section className="post-status-grid"><div className="post-stat-card"><span className="post-stat-icon"><Icon name="calendar" size={17} /></span><div><span className="kicker">Weekvoortgang</span><strong>{weekProgress.completedWorkouts}/{weekProgress.plannedWorkouts}</strong><small>trainingen voltooid</small></div><span className="post-progress-track"><i style={{ width: `${weekProgress.plannedWorkouts ? Math.round(weekProgress.completedWorkouts / weekProgress.plannedWorkouts * 100) : 0}%` }} /></span></div><div className="post-stat-card"><span className="post-stat-icon"><Icon name="dumbbell" size={17} /></span><div><span className="kicker">Setvoortgang</span><strong>{weekProgress.completedSets}/{weekProgress.plannedSets}</strong><small>sets voltooid</small></div><span className="post-progress-track"><i style={{ width: `${weekProgress.plannedSets ? Math.round(weekProgress.completedSets / weekProgress.plannedSets * 100) : 0}%` }} /></span></div><div className="post-stat-card post-streak-card"><span className="post-stat-icon"><Icon name="spark" size={17} /></span><div><span className="kicker">Streak</span><strong>{streak.current} weken</strong><small>{streak.completedThisWeek} van {streak.requiredThisWeek || weekProgress.plannedWorkouts} nodig deze week</small></div><b>Beste {streak.best}</b></div></section>{checkIn}<SafetyWarning warnings={plan.warnings} /><p className="post-local-note"><Icon name="shield" size={14} /> Je logs, voortgang en coachfeedback worden lokaal bewaard.</p></div>;
}

function PlanView({ plan, trainingState, onStartWorkout, onDownloadCalendar, onGoogleCalendar }: { plan: TrainingPlan; trainingState: TrainingState; onStartWorkout: (workout: Workout) => void; onDownloadCalendar: () => void; onGoogleCalendar: (workout: Workout) => void }) {
  return <div className="post-page"><div className="post-page-intro"><span className="kicker">Je huidige week</span><h1>{plan.title}</h1><p>{plan.description}</p><div className="post-intro-pills"><span><Icon name="calendar" size={14} /> {plan.frequency}</span><span><Icon name="clock" size={14} /> {plan.rhythm}</span></div></div><section className="post-plan-list">{plan.workouts.map((workout) => { const progress = getWorkoutProgress([workout], trainingState.logs); return <button type="button" key={workout.id} onClick={() => onStartWorkout(workout)}><span className="post-plan-day">{workout.day.slice(0, 2)}</span><span><b>{workout.title}</b><small>{workout.focus}</small><em>{workout.duration} min · limiet {workout.timeBudget}</em></span><strong>{progress.completedSets}/{progress.plannedSets} sets</strong><Icon name={progress.completedWorkouts ? 'check' : 'chevron'} size={17} /></button>; })}</section><SafetyWarning warnings={plan.warnings} /><VolumeOverview plan={plan} /><section className="post-calendar-card"><div><span className="kicker">Je agenda</span><h2>Plan het in.</h2><p>Exporteer de huidige week lokaal naar je agenda.</p></div><div><button type="button" className="primary-button" onClick={onDownloadCalendar}><Icon name="calendar" size={16} /> Download .ics</button>{plan.workouts[0] && <button type="button" className="secondary-button" onClick={() => onGoogleCalendar(plan.workouts[0])}><Icon name="calendar" size={16} /> Google Calendar</button>}</div></section></div>;
}

function ExercisesView({ plan, trainingState, onStartWorkout }: { plan: TrainingPlan; trainingState: TrainingState; onStartWorkout: (workout: Workout, exerciseIndex?: number) => void }) {
  const entries = plan.workouts.flatMap((workout) => workout.exercises.map((item) => ({ workout, item }))).filter((entry, index, all) => all.findIndex((candidate) => candidate.item.id === entry.item.id) === index);
  return <div className="post-page"><div className="post-page-intro"><span className="kicker">Bibliotheek</span><h1>Oefeningen</h1><p>Bekijk de techniekcues en log vanuit de echte training.</p></div><section className="post-exercise-list">{entries.map(({ workout, item }) => { const progress = getExerciseProgress(item.id, trainingState); const exerciseIndex = workout.exercises.findIndex((candidate) => candidate.id === item.id); return <article key={item.id}><div className="post-exercise-list-icon"><Icon name="dumbbell" size={18} /></div><div><h2>{item.name}</h2><p>{[...new Set([...item.primary, ...item.secondary])].slice(0, 3).map((muscle) => MUSCLE_LABELS[muscle]).join(' · ')}</p><small>{item.sets} sets × {item.reps} · {item.rir} RIR</small><span className={`post-trend-badge trend-${progress.trend}`}>{trendLabel(progress)}</span></div><button type="button" className="secondary-button" onClick={() => onStartWorkout(workout, exerciseIndex)}>Bekijk uitleg</button></article>; })}</section></div>;
}

function ProgressView({ plan, trainingState, streak }: { plan: TrainingPlan; trainingState: TrainingState; streak: ReturnType<typeof calculateWeeklyStreak> }) {
  const uniqueExercises = plan.workouts.flatMap((workout) => workout.exercises).filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
  const weekProgress = getWorkoutProgress(plan.workouts, trainingState.logs);
  return <div className="post-page"><div className="post-page-intro"><span className="kicker">Je data</span><h1>Voortgang</h1><p>Rustig kijken naar wat je lichaam en logs laten zien.</p></div><section className="post-progress-hero"><div><span className="kicker">Huidige streak</span><strong>{streak.current}</strong><p>gekwalificeerde weken</p></div><div><span className="kicker">Beste streak</span><strong>{streak.best}</strong><p>weken achter elkaar</p></div><div><span className="kicker">Deze week</span><strong>{streak.completedThisWeek}/{streak.requiredThisWeek}</strong><p>nodig voor kwalificatie</p></div></section><section className="post-progress-section"><div className="post-section-heading"><span className="kicker">Deze week</span><h2>{weekProgress.completedSets} van {weekProgress.plannedSets} sets</h2></div><span className="post-progress-track large"><i style={{ width: `${weekProgress.plannedSets ? Math.round(weekProgress.completedSets / weekProgress.plannedSets * 100) : 0}%` }} /></span></section><section className="post-progress-section"><div className="post-section-heading"><span className="kicker">Oefeningstrends</span><h2>Wat verandert?</h2></div><div className="post-trend-list">{uniqueExercises.map((item) => { const progress = getExerciseProgress(item.id, trainingState); return <div key={item.id}><span><b>{item.name}</b><small>{item.primary.map((muscle) => MUSCLE_LABELS[muscle]).join(' · ')}</small></span><strong className={`post-trend-badge trend-${progress.trend}`}>{trendLabel(progress)}</strong></div>; })}</div></section><VolumeOverview plan={plan} /></div>;
}

function ProfileView({ profile, snapshot, onSnapshot, onEdit, onReset }: { profile: Profile; snapshot: FitnessSnapshot; onSnapshot: (snapshot: FitnessSnapshot) => void; onEdit: () => void; onReset: () => void }) {
  return <div className="post-page"><div className="post-page-intro"><span className="kicker">Jouw context</span><h1>Profiel</h1><p>Deze keuzes blijven de basis van je lokale startpunt.</p></div><section className="post-profile-grid"><article><span className="kicker">Doel & ervaring</span><b>{profile.goal === 'hypertrophy' ? 'Spiergroei' : profile.goal === 'strength' ? 'Kracht' : 'Algemene fitheid'}</b><small>{experienceLabel(profile.experience)}</small></article><article><span className="kicker">Trainingsdagen</span><b>{profile.availability.length}x per week</b><small>{profile.availability.map((day) => `${DAY_LABELS[day.weekday].slice(0, 2)} ${day.minutes} min`).join(' · ')}</small></article><article><span className="kicker">Materiaal</span><b>{profile.equipment.length} categorieën</b><small>{profile.equipment.map(equipmentLabel).join(', ')}</small></article><article><span className="kicker">Veiligheid</span><b>{profile.safety.medicalRestrictions.length ? 'Restricties actief' : 'Geen actuele restricties'}</b><small>{profile.safety.historyOnly.length ? 'Voorgeschiedenis als context' : 'FitQuest blijft pijnveilig'}</small></article></section><div className="post-profile-actions"><button type="button" className="primary-button" onClick={onEdit}>Profiel aanpassen</button><button type="button" className="secondary-button" onClick={onReset}>Nieuw profiel</button></div><CloudSync snapshot={snapshot} onSnapshot={onSnapshot} /><p className="post-local-note"><Icon name="shield" size={14} /> Je profiel en trainingdata blijven lokaal op dit apparaat.</p></div>;
}

function CoachCheckIn({ startIndex, onComplete }: { startIndex: number; onComplete: (answers: Record<string, string>) => void }) {
  const questions = [CHECK_IN_QUESTIONS[startIndex % CHECK_IN_QUESTIONS.length], CHECK_IN_QUESTIONS[(startIndex + 1) % CHECK_IN_QUESTIONS.length]];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const question = questions[questionIndex];
  const answer = (value: string) => { const next = { ...answers, [question.key]: value }; if (questionIndex === questions.length - 1) onComplete(next); else { setAnswers(next); setQuestionIndex(questionIndex + 1); } };
  return <section className="post-check-in"><div className="post-check-in-heading"><span className="post-section-icon"><Icon name="spark" size={17} /></span><div><span className="kicker">Coach check-in · {questionIndex + 1}/2</span><h2>Korte check-in</h2><p>Je antwoord wordt lokaal bewaard. Je schema verandert niet automatisch.</p></div></div><div className="post-check-in-question"><b>{question.title}</b><div>{question.options.map(([value, label]) => <button type="button" key={value} onClick={() => answer(value)}>{label}</button>)}</div></div></section>;
}

function SessionSummaryView({ workout, log, plan, trainingState, onBack, onStartWorkout }: { workout: Workout; log: WorkoutLog; plan: TrainingPlan; trainingState: TrainingState; onBack: () => void; onStartWorkout: (workout: Workout) => void }) {
  const next = nextOpenWorkout(plan, workout.weekday, trainingState.logs);
  return <div className="post-page post-summary-page"><div className="post-page-intro"><span className="kicker">Training afgerond</span><h1>Goed gelogd.</h1><p>Je coachsamenvatting blijft op je overzicht staan.</p></div><CoachSummaryCard workout={workout} log={log} nextAction={recommendedNextAction(plan, workout, trainingState.logs)} /><div className="post-summary-actions"><button type="button" className="primary-button" onClick={onBack}>Terug naar overzicht</button>{next && next.id !== workout.id && <button type="button" className="secondary-button" onClick={() => onStartWorkout(next)}>Start volgende training</button>}</div></div>;
}

function PostOnboardingScreen({ profile, profileUpdatedAt, plan, trainingState, onStateChange, onProfileChange, onEdit, onReset }: { profile: Profile; profileUpdatedAt: string | null; plan: TrainingPlan; trainingState: TrainingState; onStateChange: (state: TrainingState) => void; onProfileChange: (profile: Profile, updatedAt: string | null) => void; onEdit: () => void; onReset: () => void }) {
  const [activeView, setActiveView] = useState<PostView>('overview');
  const [selectedDay, setSelectedDay] = useState(() => localWeekday());
  const [activeSession, setActiveSession] = useState<ActiveTrainingSession | null>(null);
  const [sessionSummary, setSessionSummary] = useState<{ workout: Workout; log: WorkoutLog } | null>(null);
  const [checkInRecord, setCheckInRecord] = useState<CheckInRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const streak = useMemo(() => calculateWeeklyStreak({ plannedPerWeek: plan.workouts.length, completed: trainingState.logs.map((log) => ({ workoutId: log.workoutId, completedAt: log.completedAt })) }), [plan.workouts.length, trainingState.logs]);

  useEffect(() => {
    try { const raw = window.localStorage.getItem(POST_CHECK_IN_KEY); if (raw) setCheckInRecord(JSON.parse(raw) as CheckInRecord); } catch { setNotice('De lokale coachcheck-in kon niet worden gelezen.'); }
  }, []);

  const navigate = (view: PostView) => { setActiveView(view); setSessionSummary(null); window.scrollTo({ top: 0, behavior: 'auto' }); };
  const startWorkout = (workout: Workout, exerciseIndex = 0) => { trackAnalyticsEvent(ANALYTICS_EVENTS.workoutStarted); setSessionSummary(null); setActiveView('overview'); setActiveSession({ workoutId: workout.id, exerciseIndex: clamp(exerciseIndex, 0, Math.max(0, workout.exercises.length - 1)), mode: 'education', drafts: sessionDraftForWorkout(workout, trainingState), meta: { duration: String(workout.duration), rpe: '7', recovery: 'good' } }); window.scrollTo({ top: 0, behavior: 'auto' }); };
  const completeSession = (session: ActiveTrainingSession) => {
    const workout = plan.workouts.find((item) => item.id === session.workoutId);
    if (!workout) return;
    const log: WorkoutLog = { id: `${workout.id}-${Date.now()}`, workoutId: workout.id, completedAt: new Date().toISOString(), exercises: workout.exercises.map((item) => { const draft = session.drafts[item.id] ?? sessionDraftForExercise(item, trainingState); return { exerciseId: item.id, sets: draft.sets.map((set) => ({ reps: set.completed ? Number(set.reps) : 0, weightKg: set.completed && set.weightKg !== '' && !weightless(item) ? Number(set.weightKg) : null, rir: set.completed && set.rir !== '' ? Number(set.rir) : null, completed: set.completed })), discomfort: draft.discomfort }; }), actualDurationMinutes: Number(session.meta.duration), sessionRpe: Number(session.meta.rpe), recovery: session.meta.recovery };
    const logs = [...trainingState.logs, log].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    const ratios = logs.filter((item) => item.actualDurationMinutes && item.actualDurationMinutes > 0).map((item) => { const reference = plan.workouts.find((candidate) => candidate.id === item.workoutId)?.duration ?? item.actualDurationMinutes!; return item.actualDurationMinutes! / reference; });
    const timeFactor = ratios.length >= 3 ? clamp(ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length, 1, 1.35) : trainingState.timeFactor;
    onStateChange({ ...trainingState, logs, timeFactor });
    trackAnalyticsEvent(ANALYTICS_EVENTS.workoutCompleted);
    setSessionSummary({ workout, log });
    setActiveSession(null);
  };
  const downloadCalendar = () => { const blob = new Blob([createIcs(plan)], { type: 'text/calendar;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'fitquest-schema.ics'; anchor.click(); URL.revokeObjectURL(url); setNotice('Je huidige week staat klaar als .ics-bestand.'); };
  const checkInEligible = trainingState.logs.length >= 2 && trainingState.logs.length % 2 === 0 && (!checkInRecord || checkInRecord.completedFor < trainingState.logs.length);
  const checkInStartIndex = Math.max(0, ((Math.floor(trainingState.logs.length / 2) - 1) * 2) % CHECK_IN_QUESTIONS.length);
  const checkIn = activeView === 'overview' && checkInEligible ? <CoachCheckIn startIndex={checkInStartIndex} onComplete={(answers) => { const record = { completedFor: trainingState.logs.length, completedAt: new Date().toISOString(), answers }; try { window.localStorage.setItem(POST_CHECK_IN_KEY, JSON.stringify(record)); setCheckInRecord(record); trackAnalyticsEvent(ANALYTICS_EVENTS.feedbackCompleted); } catch (caught) { captureClientException(caught); setNotice('De check-in kon niet lokaal worden opgeslagen.'); } }} /> : null;
  const applySnapshot = (snapshot: FitnessSnapshot) => {
    if (snapshot.profile) onProfileChange(snapshot.profile, snapshot.profileUpdatedAt);
    onStateChange(snapshot.trainingState);
    setCheckInRecord(snapshot.checkIn);
    try {
      if (snapshot.checkIn) window.localStorage.setItem(POST_CHECK_IN_KEY, JSON.stringify(snapshot.checkIn));
      else window.localStorage.removeItem(POST_CHECK_IN_KEY);
    } catch (error) {
      captureClientException(error);
      setNotice('De gesynchroniseerde check-in kon niet lokaal worden opgeslagen.');
    }
  };
  const last = latestLog(trainingState.logs);
  const lastWorkout = last ? plan.workouts.find((workout) => workout.id === last.workoutId) : undefined;
  const lastSummary = activeView === 'overview' && last && lastWorkout ? <CoachSummaryCard workout={lastWorkout} log={last} nextAction={recommendedNextAction(plan, lastWorkout, trainingState.logs)} /> : null;

  if (activeSession) {
    const workout = plan.workouts.find((item) => item.id === activeSession.workoutId);
    if (workout) return <ActiveTrainingView workout={workout} session={activeSession} trainingState={trainingState} onChange={setActiveSession} onExit={() => setActiveSession(null)} onComplete={completeSession} />;
  }
  if (sessionSummary) return <main className="post-shell"><PostHeader activeView="overview" streak={streak} onNavigate={navigate} /><SessionSummaryView workout={sessionSummary.workout} log={sessionSummary.log} plan={plan} trainingState={trainingState} onBack={() => setSessionSummary(null)} onStartWorkout={startWorkout} /><BottomNav activeView="overview" onNavigate={navigate} />{notice && <button type="button" className="post-toast" onClick={() => setNotice(null)}>{notice}</button>}</main>;
  return <main className="post-shell"><PostHeader activeView={activeView} streak={streak} onNavigate={navigate} /><div className="post-main">{activeView === 'overview' && <DashboardView plan={plan} trainingState={trainingState} streak={streak} selectedDay={selectedDay} onSelectDay={setSelectedDay} onStartWorkout={startWorkout} checkIn={checkIn} lastSummary={lastSummary} />}{activeView === 'plan' && <PlanView plan={plan} trainingState={trainingState} onStartWorkout={startWorkout} onDownloadCalendar={downloadCalendar} onGoogleCalendar={(workout) => window.open(createGoogleCalendarUrl(workout), '_blank', 'noopener,noreferrer')} />}{activeView === 'exercises' && <ExercisesView plan={plan} trainingState={trainingState} onStartWorkout={startWorkout} />}{activeView === 'progress' && <ProgressView plan={plan} trainingState={trainingState} streak={streak} />}{activeView === 'profile' && <ProfileView profile={profile} snapshot={{ profile, profileUpdatedAt, trainingState, checkIn: checkInRecord }} onSnapshot={applySnapshot} onEdit={onEdit} onReset={onReset} />}</div><BottomNav activeView={activeView} onNavigate={navigate} />{notice && <button type="button" className="post-toast" onClick={() => setNotice(null)}>{notice}</button>}</main>;
}

function isStepId(value: string): value is StepId {
  return ['adult', 'experience', 'volume', 'schedule', 'equipment', 'sport', 'safety', 'priority', 'preferences', 'review'].includes(value);
}

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [form, setForm] = useState<OnboardingAnswersDraft>(() => createEmptyOnboardingAnswers());
  const [stepId, setStepId] = useState<StepId>('adult');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(null);
  const [trainingState, setTrainingState] = useState<TrainingState>(() => emptyTrainingState());
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawState = window.localStorage.getItem(TRAINING_STATE_KEY);
      if (rawState) {
        const value = JSON.parse(rawState) as Partial<TrainingState>;
        if (Array.isArray(value.logs) && value.logs.every((item) => item && typeof item === 'object')) setTrainingState({ logs: value.logs as WorkoutLog[], overrides: value.overrides && typeof value.overrides === 'object' ? value.overrides as Record<string, string> : {}, timeFactor: typeof value.timeFactor === 'number' ? clamp(value.timeFactor, 1, 1.35) : 1.15 });
      }
      let restoredProfile: Profile | null = null;
      for (const key of [PROFILE_STORAGE_KEY, LEGACY_PROFILE_STORAGE_KEY, LEGACY_PROFILE_V2_STORAGE_KEY]) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const record = parseStoredProfileRecord(JSON.parse(raw));
        if (record) { restoredProfile = record.profile; setForm(draftFromProfile(record.profile)); setProfile(record.profile); setProfileUpdatedAt(record.updatedAt); setScreen('plan'); window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(createStoredProfileRecord(record.profile, record.answers, record.updatedAt))); break; }
      }
      if (!restoredProfile) for (const key of [ONBOARDING_DRAFT_STORAGE_KEY, LEGACY_ONBOARDING_DRAFT_STORAGE_KEY]) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const draft = parseOnboardingDraft(JSON.parse(raw));
        if (draft) { setForm(draft.answers); setStepId(isStepId(draft.stepId) ? draft.stepId : 'adult'); setScreen('onboarding'); break; }
      }
    } catch (caught) {
      captureClientException(caught);
      setError(caught instanceof Error ? `Lokale data konden niet worden gelezen: ${caught.message}` : 'Lokale data konden niet worden gelezen.');
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(TRAINING_STATE_KEY, JSON.stringify(trainingState)); } catch (caught) { captureClientException(caught); setError('Je training kon niet lokaal worden opgeslagen.'); }
  }, [hydrated, trainingState]);

  useEffect(() => {
    if (!hydrated || screen !== 'onboarding') return;
    try { window.localStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify({ schemaVersion: 2, answers: form, stepId, updatedAt: new Date().toISOString() })); } catch (caught) { captureClientException(caught); setError('Je intake kon niet lokaal worden opgeslagen.'); }
  }, [form, hydrated, screen, stepId]);

  const plan = useMemo(() => {
    if (!profile) return null;
    try { return buildPlan(profile, trainingState); } catch { return null; }
  }, [profile, trainingState]);

  const updateForm = (patch: Partial<OnboardingAnswersDraft>) => { setForm((current) => ({ ...current, ...patch })); setError(null); };
  const steps = getStepIds(form);
  const canContinue = (() => {
    if (stepId === 'adult') return form.adultConfirmed;
    if (stepId === 'experience') return form.consistentTraining !== '';
    if (stepId === 'volume') return true;
    if (stepId === 'schedule') return form.trainingDays.length >= 2 && form.trainingDays.length <= 6 && form.trainingDays.every((day) => [30, 45, 60, 75, 90].includes(Number(form.minutesByDay[day])));
    if (stepId === 'equipment') return form.equipment.length > 0 && form.setups.every((setup) => SETUP_OPTIONS.some((option) => option.value === setup));
    if (stepId === 'sport') return !form.hasOtherSport || form.otherSportDays.length > 0;
    if (stepId === 'safety') return form.safetyStatus !== '' && form.safetyStatus !== 'active' && (form.safetyStatus === 'none' || form.restrictionAreas.length > 0) && (form.safetyStatus !== 'managed' || form.clearedWithRestrictions);
    if (stepId === 'priority') return form.priorityMuscles.length >= 1 && form.priorityMuscles.length <= 3;
    if (stepId === 'preferences') return form.style !== '' && form.variety !== '' && form.averageSleepHours !== '' && form.stress !== '';
    return completeOnboardingAnswers(form) !== null;
  })();

  const startNew = () => { trackAnalyticsEvent(ANALYTICS_EVENTS.onboardingStarted); setProfile(null); setProfileUpdatedAt(null); setTrainingState(emptyTrainingState()); setForm(createEmptyOnboardingAnswers()); setStepId('adult'); setScreen('onboarding'); setError(null); };
  const editProfile = () => { if (profile) setForm(draftFromProfile(profile)); setStepId('experience'); setScreen('onboarding'); setError(null); };
  const goBack = () => { const index = steps.indexOf(stepId); if (index <= 0) { setScreen('welcome'); return; } setStepId(steps[index - 1]); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const finish = () => {
    const answers = completeOnboardingAnswers(form);
    if (!answers) return setError('Vul alle intakevelden in voordat je een schema bouwt.');
    try {
      const nextProfile = profileFromAnswers(answers);
      buildPlan(nextProfile, trainingState);
      const updatedAt = new Date().toISOString();
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(createStoredProfileRecord(nextProfile, answers, updatedAt)));
      window.localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY); window.localStorage.removeItem(LEGACY_PROFILE_V2_STORAGE_KEY); window.localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY); window.localStorage.removeItem(LEGACY_ONBOARDING_DRAFT_STORAGE_KEY);
      setProfile(nextProfile); setProfileUpdatedAt(updatedAt); setScreen('plan'); setError(null); trackAnalyticsEvent(ANALYTICS_EVENTS.onboardingCompleted);
    } catch (caught) { captureClientException(caught); setError(caught instanceof Error ? caught.message : 'Het schema kon niet worden gebouwd.'); }
  };
  const applyProfile = (nextProfile: Profile, updatedAt: string | null) => {
    const answers = completeOnboardingAnswers(draftFromProfile(nextProfile));
    if (!answers) throw new Error('Het gesynchroniseerde profiel is niet compleet genoeg om lokaal te gebruiken.');
    const nextUpdatedAt = updatedAt ?? new Date().toISOString();
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(createStoredProfileRecord(nextProfile, answers, nextUpdatedAt)));
    setForm(draftFromProfile(nextProfile));
    setProfile(nextProfile);
    setProfileUpdatedAt(nextUpdatedAt);
  };
  const continueFlow = () => { if (!canContinue) return; if (stepId === 'review') return finish(); const index = steps.indexOf(stepId); setStepId(steps[index + 1] ?? 'review'); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => { window.localStorage.removeItem(PROFILE_STORAGE_KEY); window.localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY); window.localStorage.removeItem(LEGACY_PROFILE_V2_STORAGE_KEY); window.localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY); window.localStorage.removeItem(LEGACY_ONBOARDING_DRAFT_STORAGE_KEY); window.localStorage.removeItem(TRAINING_STATE_KEY); startNew(); };

  if (!hydrated) return <main className="loading-screen"><span className="brand-mark">FQ</span><span>Je lokale coach wordt geladen…</span></main>;
  if (screen === 'welcome') return <WelcomeScreen onStart={startNew} />;
  if (screen === 'plan' && profile && plan) return <PostOnboardingScreen profile={profile} profileUpdatedAt={profileUpdatedAt} plan={plan} trainingState={trainingState} onStateChange={setTrainingState} onProfileChange={applyProfile} onEdit={editProfile} onReset={reset} />;
  return <OnboardingScreen form={form} stepId={steps.includes(stepId) ? stepId : 'adult'} onUpdate={updateForm} onBack={goBack} onContinue={continueFlow} onExit={() => setScreen('welcome')} canContinue={canContinue} error={error} />;
}
