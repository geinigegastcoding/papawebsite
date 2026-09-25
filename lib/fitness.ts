import {
  EXERCISE_EDUCATION,
  isValidYouTubeVideoId,
  validateExerciseEducation,
  type ExerciseEducation,
  type ExerciseVideo
} from './exercise-content';

export { EXERCISE_EDUCATION, isValidYouTubeVideoId, validateExerciseEducation };
export type { ExerciseEducation, ExerciseVideo };

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'core'
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export type Goal = 'hypertrophy' | 'strength' | 'general-fitness';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'bodyweight' | 'dumbbells' | 'barbell' | 'machines' | 'cables' | 'bands';
export type Sleep = 'poor' | 'fair' | 'good';
export type Stress = 'low' | 'medium' | 'high';
export type Limitation = 'shoulder' | 'elbow' | 'wrist' | 'back' | 'hip' | 'knee' | 'ankle';

export type MovementPattern =
  | 'horizontal-push'
  | 'incline-push'
  | 'vertical-push'
  | 'horizontal-pull'
  | 'vertical-pull'
  | 'squat'
  | 'hinge'
  | 'single-leg'
  | 'leg-curl'
  | 'glute'
  | 'calves'
  | 'core'
  | 'lateral-raise'
  | 'biceps'
  | 'triceps';

export type SetupRequirement = 'floor' | 'bench' | 'rack' | 'pull-up-bar' | 'cable-stack' | 'band-anchor' | 'slider';

export interface DayAvailability {
  weekday: number;
  minutes: 30 | 45 | 60 | 75 | 90;
}

export interface CurrentVolume {
  directSetsPerWeek: Partial<Record<MuscleGroup, number>>;
  confidence: 'unknown' | 'rough' | 'logged';
}

export interface TrainingPreferences {
  style: 'machines' | 'free-weights' | 'bodyweight' | 'mixed';
  variety: 'repeatable' | 'balanced' | 'varied';
  favoriteExerciseIds: string[];
  dislikedExerciseIds: string[];
  excludedExerciseIds: string[];
}

export interface MedicalRestriction {
  area: Limitation;
  forbiddenPatterns: MovementPattern[];
  forbiddenExerciseIds: string[];
}

export interface SafetyProfile {
  activeSymptoms: boolean;
  medicalRestrictions: MedicalRestriction[];
  clearedWithRestrictions: boolean;
  historyOnly: Limitation[];
}

export interface Profile {
  schemaVersion: 4;
  goal: Goal;
  experience: Experience;
  currentVolume: CurrentVolume;
  availability: DayAvailability[];
  otherSportDays: number[];
  equipment: Equipment[];
  setups: SetupRequirement[];
  sleep: Sleep;
  stress: Stress;
  safety: SafetyProfile;
  priorityMuscles: MuscleGroup[];
  preferences: TrainingPreferences;
}

export interface MuscleContribution {
  /** Bookkeeping contribution for weekly direct/secondary volume. */
  volume: number;
  /** Separate planning weight for recovery debt; not assumed equal to volume. */
  recovery: number;
}

/**
 * Explicit exercise metadata used by the deterministic selector.
 * stimulus = how stable and repeatable the target-muscle stimulus is;
 * progressionEase = how easily reps or load can be progressed;
 * fatigueCost = local and systemic fatigue cost on a 1-3 scale.
 */
export interface ExerciseDefinition {
  id: string;
  name: string;
  pattern: MovementPattern;
  primary: MuscleGroup[];
  secondary: MuscleGroup[];
  equipment: Equipment;
  requirements: SetupRequirement[];
  avoidWith: Limitation[];
  muscleContributions: Partial<Record<MuscleGroup, MuscleContribution>>;
  stimulus: 1 | 2 | 3;
  progressionEase: 1 | 2 | 3;
  fatigueCost: 1 | 2 | 3;
  /** Planning estimate for this exercise, not a medical recovery claim. */
  recoveryHours: 24 | 36 | 48 | 72;
  /** Seconds for setup, loading and material changes for this exercise. */
  setupSeconds: number;
  loadStepKg: number;
  unilateral: boolean;
  compound: boolean;
  cue: string;
  education: ExerciseEducation;
}

export interface ExercisePrescription extends ExerciseDefinition {
  sets: number;
  reps: string;
  repMin: number;
  repMax: number;
  restSeconds: number;
  rir: number;
  suggestedLoadKg?: number;
  progression: ProgressionDecision;
}

export interface Workout {
  id: string;
  weekday: number;
  day: string;
  title: string;
  focus: string;
  duration: number;
  timeBudget: number;
  exercises: ExercisePrescription[];
  fitNote?: string;
}

export interface TrainingWeek {
  number: number;
  label: string;
  intent: string;
  workouts: Workout[];
}

export type PlanWarningCode =
  | 'missing-pattern'
  | 'missing-muscle'
  | 'under-start-volume'
  | 'recovery-overlap'
  | 'time-constraint'
  | 'no-safe-alternative'
  | 'sport-overlap'
  | 'deload-recommended';

export interface PlanWarning {
  code: PlanWarningCode;
  severity: 'info' | 'warning' | 'blocking';
  message: string;
  muscle?: MuscleGroup;
  pattern?: MovementPattern;
  workoutTitle?: string;
  suggestions: string[];
}

export interface SetLog {
  reps: number;
  weightKg: number | null;
  rir: number | null;
  completed: boolean;
}

export type Discomfort = 'none' | 'discomfort' | 'pain';

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
  discomfort: Discomfort;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  completedAt: string;
  exercises: ExerciseLog[];
  actualDurationMinutes: number | null;
  sessionRpe: number | null;
  recovery: 'good' | 'okay' | 'poor';
}

export interface TrainingState {
  logs: WorkoutLog[];
  overrides: Record<string, string>;
  timeFactor: number;
}

export interface ProgressionDecision {
  action: 'start' | 'increase-load' | 'add-reps' | 'repeat' | 'reduce-load' | 'reduce-volume' | 'swap-review';
  nextLoadKg?: number;
  nextSets?: number;
  message: string;
}

export interface TrainingPlan {
  title: string;
  description: string;
  frequency: string;
  rhythm: string;
  reason: string;
  startVolume: Record<MuscleGroup, number>;
  volumeSource: Record<MuscleGroup, 'current-volume' | 'conservative-default' | 'adapted-from-logs'>;
  directWeeklyVolume: Record<MuscleGroup, number>;
  weeklyVolume: Record<MuscleGroup, number>;
  warnings: PlanWarning[];
  workouts: Workout[];
  weeks: TrainingWeek[];
  deloadRecommended: boolean;
}

export interface ExerciseExposure {
  completedSets: number;
  totalSets: number;
  completionRate: number;
  averageReps: number | null;
  bestWeightKg: number | null;
  averageRir: number | null;
  discomfort: Discomfort;
  completedAt: string;
}

export type ExerciseTrend = 'new' | 'progressing' | 'steady' | 'declining' | 'pain';

export interface ExerciseProgress {
  exerciseId: string;
  exposures: number;
  latest: ExerciseExposure | null;
  previous: ExerciseExposure | null;
  deltaAverageReps: number | null;
  deltaBestWeightKg: number | null;
  trend: ExerciseTrend;
}

export interface WorkoutProgress {
  plannedWorkouts: number;
  completedWorkouts: number;
  plannedSets: number;
  completedSets: number;
  completionRate: number;
  completedWorkoutIds: string[];
}

export interface WorkoutFeedback {
  workoutId: string;
  plannedSets: number;
  completedSets: number;
  skippedSets: number;
  plannedExercises: number;
  completedExercises: number;
  completionRate: number;
  completionPercentage: number;
  actualDurationMinutes: number | null;
  sessionRpe: number | null;
  recovery: WorkoutLog['recovery'] | null;
  hasPain: boolean;
}

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Borst',
  back: 'Rug',
  shoulders: 'Schouders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Quadriceps',
  hamstrings: 'Hamstrings',
  glutes: 'Bilspieren',
  calves: 'Kuiten',
  core: 'Core'
};

export const DAY_LABELS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

export function emptyTrainingState(): TrainingState {
  return { logs: [], overrides: {}, timeFactor: 1.15 };
}

function emptyVolume(): Record<MuscleGroup, number> {
  return Object.fromEntries(MUSCLE_GROUPS.map((muscle) => [muscle, 0])) as Record<MuscleGroup, number>;
}

function emptySources(): Record<MuscleGroup, 'current-volume' | 'conservative-default' | 'adapted-from-logs'> {
  return Object.fromEntries(MUSCLE_GROUPS.map((muscle) => [muscle, 'conservative-default'])) as Record<MuscleGroup, 'current-volume' | 'conservative-default' | 'adapted-from-logs'>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isMuscleGroup(value: unknown): value is MuscleGroup {
  return typeof value === 'string' && MUSCLE_GROUPS.includes(value as MuscleGroup);
}

function isEquipment(value: unknown): value is Equipment {
  return value === 'bodyweight' || value === 'dumbbells' || value === 'barbell' || value === 'machines' || value === 'cables' || value === 'bands';
}

function isSetup(value: unknown): value is SetupRequirement {
  return value === 'floor' || value === 'bench' || value === 'rack' || value === 'pull-up-bar' || value === 'cable-stack' || value === 'band-anchor' || value === 'slider';
}

function isLimitation(value: unknown): value is Limitation {
  return value === 'shoulder' || value === 'elbow' || value === 'wrist' || value === 'back' || value === 'hip' || value === 'knee' || value === 'ankle';
}

function validRestriction(value: unknown): value is { area: Limitation; forbiddenPatterns: MovementPattern[]; forbiddenExerciseIds: string[] } {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return isLimitation(item.area) && Array.isArray(item.forbiddenPatterns) && Array.isArray(item.forbiddenExerciseIds);
}

const patternSecondaryVolume: Record<MovementPattern, number> = {
  'horizontal-push': 0.35,
  'incline-push': 0.3,
  'vertical-push': 0.25,
  'horizontal-pull': 0.35,
  'vertical-pull': 0.3,
  squat: 0.45,
  hinge: 0.55,
  'single-leg': 0.4,
  'leg-curl': 0.3,
  glute: 0.35,
  calves: 0,
  core: 0,
  'lateral-raise': 0,
  biceps: 0,
  triceps: 0
};

function defaultRequirements(id: string, equipment: Equipment): SetupRequirement[] {
  if (id === 'barbell-bench-press') return ['bench', 'rack'];
  if (id === 'back-squat') return ['rack'];
  if (id === 'barbell-hip-thrust') return ['bench'];
  if (id === 'pull-up') return ['pull-up-bar'];
  if (id === 'sliding-leg-curl') return ['floor', 'slider'];
  if (id === 'feet-elevated-push-up') return ['bench'];
  if (equipment === 'cables') return ['cable-stack'];
  if (equipment === 'bands') return ['band-anchor'];
  if (equipment === 'bodyweight' && ['push-up', 'dumbbell-dead-bug', 'dead-bug', 'single-leg-glute-bridge'].includes(id)) return ['floor'];
  if (equipment === 'dumbbells' && id === 'dumbbell-floor-press') return ['floor'];
  return [];
}

function defaultSetupSeconds(equipment: Equipment, requirements: SetupRequirement[]): number {
  const base = equipment === 'barbell' ? 60 : equipment === 'cables' || equipment === 'bands' ? 45 : equipment === 'machines' ? 30 : equipment === 'dumbbells' ? 30 : 15;
  return base + (requirements.includes('floor') ? 10 : 0) + (requirements.includes('rack') ? 15 : 0);
}

function defaultLoadStep(equipment: Equipment): number {
  if (equipment === 'barbell') return 2.5;
  if (equipment === 'machines') return 5;
  if (equipment === 'cables') return 2.5;
  if (equipment === 'dumbbells') return 1;
  return 0;
}

function createContributions(pattern: MovementPattern, primary: MuscleGroup[], secondary: MuscleGroup[], overrides: Partial<Record<MuscleGroup, MuscleContribution>> = {}): Partial<Record<MuscleGroup, MuscleContribution>> {
  const result: Partial<Record<MuscleGroup, MuscleContribution>> = {};
  for (const muscle of primary) result[muscle] = { volume: 1, recovery: 1 };
  for (const muscle of secondary) {
    const volume = overrides[muscle]?.volume ?? patternSecondaryVolume[pattern];
    result[muscle] = overrides[muscle] ?? { volume, recovery: Math.min(1, volume * 0.85) };
  }
  for (const [muscle, contribution] of Object.entries(overrides) as Array<[MuscleGroup, MuscleContribution]>) result[muscle] = contribution;
  return result;
}

interface ExerciseOptions {
  requirements?: SetupRequirement[];
  stimulus?: 1 | 2 | 3;
  progressionEase?: 1 | 2 | 3;
  fatigueCost?: 1 | 2 | 3;
  recoveryHours?: 24 | 36 | 48 | 72;
  setupSeconds?: number;
  loadStepKg?: number;
  unilateral?: boolean;
  contributions?: Partial<Record<MuscleGroup, MuscleContribution>>;
}

/* The seed tier produces documented dimensions; the planner never uses it as a hidden score. */
const exercise = (
  id: string,
  name: string,
  pattern: MovementPattern,
  primary: MuscleGroup[],
  secondary: MuscleGroup[],
  equipment: Equipment,
  avoidWith: Limitation[],
  compound: boolean,
  seedTier: number,
  cue: string,
  options: ExerciseOptions = {}
): ExerciseDefinition => {
  const tier = seedTier >= 4 ? 3 : seedTier <= 2 ? 1 : 2;
  const stimulus = options.stimulus ?? tier as 1 | 2 | 3;
  const progressionEase = options.progressionEase ?? tier as 1 | 2 | 3;
  const fatigueCost = options.fatigueCost ?? (compound ? (tier === 3 ? 2 : 3) : tier === 1 ? 2 : 1);
  const requirements = options.requirements ?? defaultRequirements(id, equipment);
  const education = EXERCISE_EDUCATION[id];
  validateExerciseEducation(id, education);
  return {
    id,
    name,
    pattern,
    primary,
    secondary,
    equipment,
    requirements,
    avoidWith,
    muscleContributions: createContributions(pattern, primary, secondary, options.contributions),
    stimulus,
    progressionEase,
    fatigueCost,
    recoveryHours: options.recoveryHours ?? (fatigueCost === 3 ? 72 : compound ? 48 : 36),
    setupSeconds: options.setupSeconds ?? defaultSetupSeconds(equipment, requirements),
    loadStepKg: options.loadStepKg ?? defaultLoadStep(equipment),
    unilateral: options.unilateral ?? ['one-arm-dumbbell-row', 'reverse-lunge', 'dumbbell-split-squat', 'barbell-split-squat', 'machine-single-leg-press', 'band-split-squat', 'single-leg-hip-hinge', 'single-leg-calf-raise', 'single-leg-glute-bridge'].includes(id),
    compound,
    cue,
    education
  };
};

export const EXERCISES: ExerciseDefinition[] = [
  exercise('machine-chest-press', 'Machine chest press', 'horizontal-push', ['chest'], ['triceps', 'shoulders'], 'machines', ['shoulder', 'elbow'], true, 4, 'Houd je schouderbladen laag en stop zodra je schouders naar voren rollen.'),
  exercise('dumbbell-floor-press', 'Dumbbell floor press', 'horizontal-push', ['chest'], ['triceps', 'shoulders'], 'dumbbells', ['shoulder', 'elbow'], true, 4, 'Laat je bovenarmen rustig de vloer raken en druk recht boven je borst.'),
  exercise('barbell-bench-press', 'Barbell bench press', 'horizontal-push', ['chest'], ['triceps', 'shoulders'], 'barbell', ['shoulder', 'elbow', 'wrist'], true, 4, 'Zet je voeten vast, trek je schouderbladen samen en raak laag op de borst.'),
  exercise('push-up', 'Push-up', 'horizontal-push', ['chest'], ['triceps', 'shoulders', 'core'], 'bodyweight', ['shoulder', 'elbow', 'wrist'], true, 3, 'Maak een rechte lijn en stop twee nette herhalingen voor vormverlies.'),
  exercise('band-chest-press', 'Band chest press', 'horizontal-push', ['chest'], ['triceps', 'shoulders'], 'bands', ['shoulder', 'elbow'], true, 3, 'Druk vooruit zonder je schouders op te trekken.'),
  exercise('incline-dumbbell-press', 'Incline dumbbell press', 'incline-push', ['chest'], ['shoulders', 'triceps'], 'dumbbells', ['shoulder', 'elbow'], true, 4, 'Kies een lage helling en houd je onderarmen verticaal.'),
  exercise('incline-machine-press', 'Incline machine press', 'incline-push', ['chest'], ['shoulders', 'triceps'], 'machines', ['shoulder', 'elbow'], true, 4, 'Laat de handgrepen gecontroleerd zakken tot een comfortabele diepte.'),
  exercise('feet-elevated-push-up', 'Push-up met voeten verhoogd', 'incline-push', ['chest'], ['shoulders', 'triceps', 'core'], 'bodyweight', ['shoulder', 'elbow', 'wrist'], true, 2, 'Houd je ribben laag en beweeg als een plank.'),
  exercise('machine-shoulder-press', 'Machine shoulder press', 'vertical-push', ['shoulders'], ['triceps'], 'machines', ['shoulder', 'elbow'], true, 4, 'Stop voordat je onderrug loskomt van de rugleuning.'),
  exercise('dumbbell-shoulder-press', 'Dumbbell shoulder press', 'vertical-push', ['shoulders'], ['triceps', 'core'], 'dumbbells', ['shoulder', 'elbow', 'back'], true, 3, 'Span je buik aan en druk in een lichte boog omhoog.'),
  exercise('barbell-overhead-press', 'Barbell overhead press', 'vertical-push', ['shoulders'], ['triceps', 'core'], 'barbell', ['shoulder', 'elbow', 'wrist', 'back'], true, 3, 'Knijp je billen aan en eindig met de stang boven het midden van je voet.'),
  exercise('pike-push-up', 'Pike push-up', 'vertical-push', ['shoulders'], ['triceps'], 'bodyweight', ['shoulder', 'elbow', 'wrist'], true, 2, 'Breng je hoofd schuin voor je handen en houd je heupen hoog.'),
  exercise('band-overhead-press', 'Band overhead press', 'vertical-push', ['shoulders'], ['triceps', 'core'], 'bands', ['shoulder', 'elbow', 'back'], true, 2, 'Blijf lang en voorkom dat je onderrug hol trekt.'),
  exercise('chest-supported-row', 'Chest-supported row', 'horizontal-pull', ['back'], ['biceps', 'shoulders'], 'machines', ['shoulder', 'elbow'], true, 4, 'Trek je ellebogen naar je heupen zonder je borst los te laten.'),
  exercise('one-arm-dumbbell-row', 'One-arm dumbbell row', 'horizontal-pull', ['back'], ['biceps', 'shoulders'], 'dumbbells', ['shoulder', 'elbow', 'back'], true, 4, 'Trek naar je broekzak en houd je romp stil.'),
  exercise('barbell-row', 'Barbell row', 'horizontal-pull', ['back'], ['biceps', 'shoulders', 'hamstrings'], 'barbell', ['shoulder', 'elbow', 'wrist', 'back'], true, 3, 'Houd dezelfde romphoek en trek de stang naar je onderste ribben.'),
  exercise('seated-cable-row', 'Seated cable row', 'horizontal-pull', ['back'], ['biceps', 'shoulders'], 'cables', ['shoulder', 'elbow', 'back'], true, 4, 'Begin met lange armen en eindig zonder achterover te leunen.'),
  exercise('band-row', 'Band row', 'horizontal-pull', ['back'], ['biceps', 'shoulders'], 'bands', ['shoulder', 'elbow'], true, 3, 'Pauzeer kort wanneer je handen naast je romp zijn.'),
  exercise('prone-w-raise', 'Prone W raise', 'horizontal-pull', ['back'], ['shoulders'], 'bodyweight', ['shoulder'], false, 1, 'Til alleen zo hoog als je schouderbladen gecontroleerd blijven.', { requirements: ['floor'], loadStepKg: 0, recoveryHours: 24 }),
  exercise('lat-pulldown', 'Lat pulldown', 'vertical-pull', ['back'], ['biceps'], 'machines', ['shoulder', 'elbow'], true, 4, 'Trek je ellebogen naar je zij en laat je armen volledig lang worden.'),
  exercise('cable-pulldown', 'Cable lat pulldown', 'vertical-pull', ['back'], ['biceps'], 'cables', ['shoulder', 'elbow'], true, 4, 'Houd je borst rustig en trek vanuit je oksels.'),
  exercise('dumbbell-pullover', 'Dumbbell pullover', 'vertical-pull', ['back'], ['chest', 'triceps'], 'dumbbells', ['shoulder', 'elbow'], true, 2, 'Beweeg alleen binnen een pijnvrije schouderhoek en houd je ribben laag.'),
  exercise('pull-up', 'Pull-up', 'vertical-pull', ['back'], ['biceps'], 'bodyweight', ['shoulder', 'elbow', 'wrist'], true, 4, 'Start vanuit lange armen en trek je borst richting de stang.'),
  exercise('band-pulldown', 'Band lat pulldown', 'vertical-pull', ['back'], ['biceps'], 'bands', ['shoulder', 'elbow'], true, 3, 'Zet de band stevig hoog vast en trek je ellebogen naar beneden.'),
  exercise('hack-squat', 'Hack squat', 'squat', ['quads'], ['glutes'], 'machines', ['knee', 'hip'], true, 4, 'Laat je knieen dezelfde richting volgen als je tenen.'),
  exercise('goblet-squat', 'Goblet squat', 'squat', ['quads'], ['glutes', 'core'], 'dumbbells', ['knee', 'hip', 'back'], true, 4, 'Zak tussen je heupen en houd de hele voet op de vloer.'),
  exercise('back-squat', 'Barbell back squat', 'squat', ['quads'], ['glutes', 'core'], 'barbell', ['knee', 'hip', 'back'], true, 4, 'Adem en span voor elke herhaling; duw de vloer uit elkaar.'),
  exercise('bodyweight-squat', 'Bodyweight squat', 'squat', ['quads'], ['glutes', 'core'], 'bodyweight', ['knee', 'hip'], true, 2, 'Gebruik een tempo van drie tellen omlaag als gewone squats te licht zijn.'),
  exercise('band-squat', 'Band squat', 'squat', ['quads'], ['glutes', 'core'], 'bands', ['knee', 'hip', 'back'], true, 3, 'Blijf midden op je voet en strek heupen en knieen tegelijk.'),
  exercise('romanian-deadlift', 'Romanian deadlift', 'hinge', ['hamstrings'], ['glutes', 'back'], 'barbell', ['back', 'hip'], true, 4, 'Duw je heupen naar achteren en houd de stang dicht langs je benen.'),
  exercise('dumbbell-rdl', 'Dumbbell Romanian deadlift', 'hinge', ['hamstrings'], ['glutes', 'back'], 'dumbbells', ['back', 'hip'], true, 4, 'Stop zodra je hamstrings op spanning staan en je rug neutraal blijft.'),
  exercise('machine-back-extension', 'Machine back extension', 'hinge', ['hamstrings', 'glutes'], ['back'], 'machines', ['back', 'hip'], true, 3, 'Strek tot je romp in een rechte lijn staat, niet verder.'),
  exercise('band-good-morning', 'Band good morning', 'hinge', ['hamstrings'], ['glutes', 'back'], 'bands', ['back', 'hip'], true, 3, 'Maak de beweging vanuit je heupen en houd spanning op de band.'),
  exercise('single-leg-hip-hinge', 'Single-leg hip hinge', 'hinge', ['hamstrings'], ['glutes', 'core'], 'bodyweight', ['back', 'hip', 'ankle'], true, 2, 'Reik lang naar achteren met je vrije been en houd je heupen recht.'),
  exercise('reverse-lunge', 'Reverse lunge', 'single-leg', ['quads', 'glutes'], ['hamstrings', 'core'], 'bodyweight', ['knee', 'hip', 'ankle'], true, 3, 'Stap rustig terug en duw door je hele voorste voet.'),
  exercise('dumbbell-split-squat', 'Dumbbell split squat', 'single-leg', ['quads', 'glutes'], ['hamstrings'], 'dumbbells', ['knee', 'hip', 'ankle'], true, 4, 'Zak recht omlaag en houd je voorste voet volledig belast.'),
  exercise('barbell-split-squat', 'Barbell split squat', 'single-leg', ['quads', 'glutes'], ['hamstrings'], 'barbell', ['knee', 'hip', 'ankle', 'back'], true, 3, 'Gebruik een stabiele stand en laat je achterste knie richting vloer zakken.'),
  exercise('machine-single-leg-press', 'Single-leg press', 'single-leg', ['quads', 'glutes'], ['hamstrings'], 'machines', ['knee', 'hip'], true, 4, 'Laat je knie gecontroleerd naar je borst komen zonder je bekken te kantelen.'),
  exercise('band-split-squat', 'Band split squat', 'single-leg', ['quads', 'glutes'], ['hamstrings'], 'bands', ['knee', 'hip', 'ankle'], true, 3, 'Houd spanning op de band en druk recht omhoog.'),
  exercise('lying-leg-curl', 'Lying leg curl', 'leg-curl', ['hamstrings'], [], 'machines', ['knee'], false, 4, 'Houd je heupen in het kussen en krul zonder vaart.'),
  exercise('cable-leg-curl', 'Cable leg curl', 'leg-curl', ['hamstrings'], [], 'cables', ['knee', 'ankle'], false, 3, 'Houd je bovenbeen stil terwijl je hiel naar je bil beweegt.'),
  exercise('sliding-leg-curl', 'Sliding leg curl', 'leg-curl', ['hamstrings'], ['glutes'], 'bodyweight', ['knee', 'hip'], false, 3, 'Houd je heupen hoog en schuif alleen zo ver als je controle houdt.'),
  exercise('band-leg-curl', 'Band leg curl', 'leg-curl', ['hamstrings'], [], 'bands', ['knee'], false, 3, 'Beweeg langzaam terug tegen de spanning van de band.'),
  exercise('machine-hip-thrust', 'Machine hip thrust', 'glute', ['glutes'], ['hamstrings'], 'machines', ['hip', 'back'], true, 4, 'Kantel je bekken licht achterover en pauzeer bovenaan.'),
  exercise('barbell-hip-thrust', 'Barbell hip thrust', 'glute', ['glutes'], ['hamstrings'], 'barbell', ['hip', 'back'], true, 4, 'Eindig met je ribben laag en je schenen ongeveer verticaal.'),
  exercise('dumbbell-glute-bridge', 'Dumbbell glute bridge', 'glute', ['glutes'], ['hamstrings'], 'dumbbells', ['hip', 'back'], true, 3, 'Duw via je hielen en knijp bovenaan zonder je rug te overstrekken.'),
  exercise('single-leg-glute-bridge', 'Single-leg glute bridge', 'glute', ['glutes'], ['hamstrings', 'core'], 'bodyweight', ['hip', 'back'], true, 3, 'Houd je bekken recht en maak de beweging kleiner als het draait.', { requirements: ['floor'] }),
  exercise('band-hip-thrust', 'Band hip thrust', 'glute', ['glutes'], ['hamstrings'], 'bands', ['hip', 'back'], true, 3, 'Houd de band laag over je heupen en pauzeer in de eindpositie.'),
  exercise('standing-calf-machine', 'Standing calf raise', 'calves', ['calves'], [], 'machines', ['ankle'], false, 4, 'Zak volledig, pauzeer kort onderaan en kom zo hoog mogelijk.'),
  exercise('dumbbell-calf-raise', 'Dumbbell calf raise', 'calves', ['calves'], [], 'dumbbells', ['ankle'], false, 3, 'Gebruik steun voor balans en beweeg door je volledige enkelbereik.'),
  exercise('barbell-calf-raise', 'Barbell calf raise', 'calves', ['calves'], [], 'barbell', ['ankle', 'back'], false, 3, 'Houd de stang stabiel en laat elke herhaling volledig uitrekken.'),
  exercise('single-leg-calf-raise', 'Single-leg calf raise', 'calves', ['calves'], [], 'bodyweight', ['ankle'], false, 3, 'Gebruik een trage daling en houd alleen licht steun voor balans.'),
  exercise('band-calf-press', 'Band calf press', 'calves', ['calves'], [], 'bands', ['ankle'], false, 2, 'Strek je enkel volledig en laat gecontroleerd terugkomen.'),
  exercise('cable-crunch', 'Cable crunch', 'core', ['core'], [], 'cables', ['back'], false, 4, 'Breng je ribben richting bekken zonder aan het touw te trekken.'),
  exercise('machine-crunch', 'Machine crunch', 'core', ['core'], [], 'machines', ['back'], false, 3, 'Krul vanuit je romp en houd je heupen stil.'),
  exercise('dumbbell-dead-bug', 'Dumbbell dead bug', 'core', ['core'], [], 'dumbbells', ['back'], false, 3, 'Adem uit en houd je onderrug rustig tegen de vloer.', { requirements: ['floor'] }),
  exercise('dead-bug', 'Dead bug', 'core', ['core'], [], 'bodyweight', ['back'], false, 4, 'Strek alleen zo ver als je onderrug contact houdt met de vloer.', { requirements: ['floor'] }),
  exercise('pallof-press', 'Band Pallof press', 'core', ['core'], [], 'bands', ['back'], false, 3, 'Laat de band je romp niet draaien terwijl je armen strekken.'),
  exercise('machine-lateral-raise', 'Machine lateral raise', 'lateral-raise', ['shoulders'], [], 'machines', ['shoulder'], false, 4, 'Leid met je ellebogen en stop rond schouderhoogte.'),
  exercise('cable-lateral-raise', 'Cable lateral raise', 'lateral-raise', ['shoulders'], [], 'cables', ['shoulder'], false, 4, 'Houd spanning onderin en beweeg zonder je romp te kantelen.'),
  exercise('dumbbell-lateral-raise', 'Dumbbell lateral raise', 'lateral-raise', ['shoulders'], [], 'dumbbells', ['shoulder'], false, 3, 'Gebruik een licht gewicht en houd je nek ontspannen.'),
  exercise('band-lateral-raise', 'Band lateral raise', 'lateral-raise', ['shoulders'], [], 'bands', ['shoulder'], false, 2, 'Maak de band lichter als je schouders optrekken.'),
  exercise('machine-curl', 'Machine biceps curl', 'biceps', ['biceps'], [], 'machines', ['elbow'], false, 4, 'Houd je bovenarmen in het kussen en strek gecontroleerd uit.'),
  exercise('cable-curl', 'Cable curl', 'biceps', ['biceps'], [], 'cables', ['elbow', 'wrist'], false, 4, 'Laat je ellebogen op hun plek en knijp bovenaan.'),
  exercise('dumbbell-curl', 'Dumbbell curl', 'biceps', ['biceps'], [], 'dumbbells', ['elbow', 'wrist'], false, 3, 'Houd je schouders stil en draai je handpalm rustig omhoog.'),
  exercise('barbell-curl', 'Barbell curl', 'biceps', ['biceps'], [], 'barbell', ['elbow', 'wrist'], false, 3, 'Vermijd heupzwaai en laat de stang langzaam zakken.'),
  exercise('band-curl', 'Band curl', 'biceps', ['biceps'], [], 'bands', ['elbow', 'wrist'], false, 3, 'Stap breder voor meer weerstand en houd je ellebogen naast je romp.'),
  exercise('cable-pressdown', 'Cable triceps pressdown', 'triceps', ['triceps'], [], 'cables', ['elbow', 'wrist'], false, 4, 'Strek je ellebogen volledig zonder je schouders mee te laten bewegen.'),
  exercise('machine-triceps-extension', 'Machine triceps extension', 'triceps', ['triceps'], [], 'machines', ['elbow'], false, 4, 'Houd je bovenarmen stabiel en controleer de terugweg.'),
  exercise('dumbbell-triceps-extension', 'Dumbbell triceps extension', 'triceps', ['triceps'], [], 'dumbbells', ['shoulder', 'elbow'], false, 3, 'Houd je ellebogen smal en kies een pijnvrij bewegingsbereik.'),
  exercise('close-grip-push-up', 'Close-grip push-up', 'triceps', ['triceps'], ['chest', 'shoulders', 'core'], 'bodyweight', ['shoulder', 'elbow', 'wrist'], true, 2, 'Houd je ellebogen langs je romp en schaal op een verhoging indien nodig.', { requirements: ['floor'], contributions: { chest: { volume: 0.45, recovery: 0.38 }, shoulders: { volume: 0.2, recovery: 0.17 }, core: { volume: 0.15, recovery: 0.12 } } }),
  exercise('band-pressdown', 'Band pressdown', 'triceps', ['triceps'], [], 'bands', ['elbow', 'wrist'], false, 3, 'Zet de band stevig hoog vast en houd je bovenarmen stil.')
];

interface SessionDefinition {
  title: string;
  patterns: MovementPattern[];
}

const FULL_A: SessionDefinition = { title: 'Full body A', patterns: ['squat', 'horizontal-push', 'horizontal-pull', 'hinge', 'core', 'calves'] };
const FULL_B: SessionDefinition = { title: 'Full body B', patterns: ['hinge', 'vertical-pull', 'incline-push', 'single-leg', 'vertical-push', 'glute'] };
const FULL_C: SessionDefinition = { title: 'Full body C', patterns: ['single-leg', 'horizontal-pull', 'horizontal-push', 'leg-curl', 'lateral-raise', 'calves', 'core'] };
const UPPER_A: SessionDefinition = { title: 'Upper A', patterns: ['horizontal-push', 'horizontal-pull', 'vertical-push', 'vertical-pull', 'lateral-raise', 'biceps', 'triceps'] };
const UPPER_B: SessionDefinition = { title: 'Upper B', patterns: ['vertical-pull', 'incline-push', 'horizontal-pull', 'horizontal-push', 'lateral-raise', 'biceps', 'triceps'] };
const LOWER_A: SessionDefinition = { title: 'Lower A', patterns: ['squat', 'hinge', 'single-leg', 'leg-curl', 'calves', 'core', 'glute'] };
const LOWER_B: SessionDefinition = { title: 'Lower B', patterns: ['hinge', 'squat', 'glute', 'leg-curl', 'calves', 'core', 'single-leg'] };
const PUSH: SessionDefinition = { title: 'Push', patterns: ['horizontal-push', 'vertical-push', 'incline-push', 'lateral-raise', 'triceps', 'core'] };
const PULL: SessionDefinition = { title: 'Pull', patterns: ['vertical-pull', 'horizontal-pull', 'hinge', 'biceps', 'horizontal-pull', 'core'] };
const LEGS: SessionDefinition = { title: 'Legs', patterns: ['squat', 'hinge', 'single-leg', 'leg-curl', 'glute', 'calves', 'core'] };

function sessionsFor(days: number): SessionDefinition[] {
  if (days === 2) return [FULL_A, FULL_B];
  if (days === 3) return [FULL_A, FULL_B, FULL_C];
  if (days === 4) return [UPPER_A, LOWER_A, UPPER_B, LOWER_B];
  if (days === 5) return [UPPER_A, LOWER_A, PUSH, PULL, LEGS];
  return [PUSH, PULL, LEGS, PUSH, PULL, LEGS];
}

function allowedMinutes(value: unknown): value is 30 | 45 | 60 | 75 | 90 {
  return value === 30 || value === 45 || value === 60 || value === 75 || value === 90;
}

function nearestMinutes(value: number): 30 | 45 | 60 | 75 | 90 {
  const choices = [30, 45, 60, 75, 90] as const;
  return choices.reduce((best, choice) => Math.abs(choice - value) < Math.abs(best - value) ? choice : best, choices[0]);
}

function legacySetups(equipment: Equipment[]): SetupRequirement[] {
  const setups: SetupRequirement[] = [];
  if (equipment.includes('bodyweight')) setups.push('floor');
  if (equipment.includes('cables')) setups.push('cable-stack');
  if (equipment.includes('bands')) setups.push('band-anchor');
  return setups;
}

export function normalizeProfile(value: Profile | Record<string, unknown>): Profile {
  const raw = value as Record<string, unknown>;
  const oldDays = Array.isArray(raw.trainingDays) ? raw.trainingDays.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6) : [];
  const oldMinutes = typeof raw.minutes === 'number' && Number.isFinite(raw.minutes) ? nearestMinutes(raw.minutes) : 60;
  const availability = Array.isArray(raw.availability)
    ? raw.availability
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map((item) => ({ weekday: Number(item.weekday), minutes: allowedMinutes(item.minutes) ? item.minutes : nearestMinutes(Number(item.minutes) || 60) }))
      .filter((item) => Number.isInteger(item.weekday) && item.weekday >= 0 && item.weekday <= 6)
    : oldDays.map((weekday) => ({ weekday, minutes: oldMinutes }));
  const equipment = Array.isArray(raw.equipment) ? raw.equipment.filter(isEquipment) : [];
  const oldLimitations = Array.isArray(raw.limitations) ? raw.limitations.filter(isLimitation) : [];
  const rawSafety = raw.safety && typeof raw.safety === 'object' ? raw.safety as Record<string, unknown> : null;
  const restrictions = rawSafety && Array.isArray(rawSafety.medicalRestrictions)
    ? rawSafety.medicalRestrictions.filter(validRestriction).map((item) => ({ area: item.area as Limitation, forbiddenPatterns: item.forbiddenPatterns as MovementPattern[], forbiddenExerciseIds: item.forbiddenExerciseIds as string[] }))
    : oldLimitations.map((area) => ({ area, forbiddenPatterns: [], forbiddenExerciseIds: [] }));
  const safety: SafetyProfile = {
    activeSymptoms: rawSafety ? Boolean(rawSafety.activeSymptoms) : raw.clearedToTrain === false,
    medicalRestrictions: restrictions,
    clearedWithRestrictions: rawSafety ? Boolean(rawSafety.clearedWithRestrictions) : oldLimitations.length > 0 && raw.clearedToTrain !== false,
    historyOnly: rawSafety && Array.isArray(rawSafety.historyOnly) ? rawSafety.historyOnly.filter(isLimitation) : []
  };
  const currentVolumeRaw = raw.currentVolume && typeof raw.currentVolume === 'object' ? raw.currentVolume as Record<string, unknown> : null;
  const directSetsRaw = currentVolumeRaw?.directSetsPerWeek && typeof currentVolumeRaw.directSetsPerWeek === 'object' ? currentVolumeRaw.directSetsPerWeek as Record<string, unknown> : {};
  const directSetsPerWeek: Partial<Record<MuscleGroup, number>> = {};
  for (const muscle of MUSCLE_GROUPS) {
    const sets = directSetsRaw[muscle];
    if (typeof sets === 'number' && Number.isFinite(sets) && sets >= 0) directSetsPerWeek[muscle] = clamp(Math.round(sets), 0, 30);
  }
  const rawPriority = Array.isArray(raw.priorityMuscles) ? raw.priorityMuscles.filter(isMuscleGroup) : [];
  const rawPreferences = raw.preferences && typeof raw.preferences === 'object' ? raw.preferences as Record<string, unknown> : {};
  const style = rawPreferences.style === 'machines' || rawPreferences.style === 'free-weights' || rawPreferences.style === 'bodyweight' || rawPreferences.style === 'mixed' ? rawPreferences.style : 'mixed';
  const variety = rawPreferences.variety === 'repeatable' || rawPreferences.variety === 'balanced' || rawPreferences.variety === 'varied' ? rawPreferences.variety : 'balanced';
  return {
    schemaVersion: 4,
    goal: raw.goal === 'strength' || raw.goal === 'general-fitness' ? raw.goal : 'hypertrophy',
    experience: raw.experience === 'advanced' || raw.experience === 'intermediate' ? raw.experience : 'beginner',
    currentVolume: { directSetsPerWeek, confidence: currentVolumeRaw?.confidence === 'logged' ? 'logged' : Object.keys(directSetsPerWeek).length ? 'rough' : 'unknown' },
    availability: availability.sort((a, b) => a.weekday - b.weekday) as DayAvailability[],
    otherSportDays: Array.isArray(raw.otherSportDays) ? raw.otherSportDays.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6) : [],
    equipment,
    setups: Array.isArray(raw.setups) ? raw.setups.filter(isSetup) : legacySetups(equipment),
    sleep: raw.sleep === 'poor' || raw.sleep === 'fair' ? raw.sleep : 'good',
    stress: raw.stress === 'high' || raw.stress === 'medium' ? raw.stress : 'low',
    safety,
    priorityMuscles: rawPriority.slice(0, 3),
    preferences: {
      style,
      variety,
      favoriteExerciseIds: Array.isArray(rawPreferences.favoriteExerciseIds) ? rawPreferences.favoriteExerciseIds.filter((id): id is string => typeof id === 'string') : [],
      dislikedExerciseIds: Array.isArray(rawPreferences.dislikedExerciseIds) ? rawPreferences.dislikedExerciseIds.filter((id): id is string => typeof id === 'string') : [],
      excludedExerciseIds: Array.isArray(rawPreferences.excludedExerciseIds) ? rawPreferences.excludedExerciseIds.filter((id): id is string => typeof id === 'string') : []
    }
  };
}

function validateProfile(profile: Profile): void {
  if (profile.safety.activeSymptoms || (profile.safety.medicalRestrictions.length > 0 && !profile.safety.clearedWithRestrictions)) throw new Error('Actieve of onduidelijke klachten blokkeren automatisch plannen. Laat beperkingen eerst professioneel beoordelen.');
  if (!Array.isArray(profile.availability) || profile.availability.length < 2) throw new Error('Kies minimaal 2 trainingsdagen.');
  if (profile.availability.length > 6 || new Set(profile.availability.map((day) => day.weekday)).size !== profile.availability.length || profile.availability.some((day) => day.weekday < 0 || day.weekday > 6 || !allowedMinutes(day.minutes))) throw new Error('De gekozen trainingsdagen of tijden zijn ongeldig.');
  if (!profile.equipment.length) throw new Error('Kies minimaal een beschikbare materiaalsoort.');
  if (profile.priorityMuscles.length > 3 || profile.priorityMuscles.some((muscle) => !isMuscleGroup(muscle))) throw new Error('Kies maximaal drie prioriteitsspieren.');
  for (const muscle of MUSCLE_GROUPS) {
    const value = profile.currentVolume.directSetsPerWeek[muscle];
    if (value !== undefined && (!Number.isFinite(value) || value < 0 || value > 30)) throw new Error('Het huidige trainingsvolume is ongeldig.');
  }
}

function patternPrimary(pattern: MovementPattern): MuscleGroup[] {
  const definition = EXERCISES.find((item) => item.pattern === pattern);
  return definition?.primary ?? [];
}

function sessionOverlap(a: SessionDefinition, b: SessionDefinition): number {
  const aMuscles = new Set(a.patterns.flatMap(patternPrimary));
  const bMuscles = new Set(b.patterns.flatMap(patternPrimary));
  return [...aMuscles].filter((muscle) => bMuscles.has(muscle)).length;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const result: T[][] = [];
  items.forEach((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    for (const tail of permutations(rest)) result.push([item, ...tail]);
  });
  return result;
}

function orderedSessions(days: number, profile: Profile): SessionDefinition[] {
  const sessions = sessionsFor(days);
  const orderedDays = [...profile.availability].sort((a, b) => a.weekday - b.weekday);
  const candidates = permutations(sessions);
  const best = candidates.sort((a, b) => {
    const score = (order: SessionDefinition[]) => {
      let total = 0;
      for (let index = 1; index < order.length; index += 1) total += sessionOverlap(order[index - 1], order[index]) * 10;
      order.forEach((session, index) => {
        if (profile.otherSportDays.includes(orderedDays[index].weekday)) total += session.patterns.some((pattern) => ['squat', 'hinge', 'single-leg', 'leg-curl', 'glute'].includes(pattern)) ? 6 : 2;
      });
      return total;
    };
    const difference = score(a) - score(b);
    if (difference !== 0) return difference;
    return a.map((item) => item.title).join('|').localeCompare(b.map((item) => item.title).join('|'));
  })[0];
  return best ?? sessions;
}

function defaultStartVolume(): number {
  return 6;
}

function logExerciseForMuscle(log: WorkoutLog, muscle: MuscleGroup): ExerciseLog[] {
  return log.exercises.filter((item) => {
    const definition = EXERCISES.find((exerciseItem) => exerciseItem.id === item.exerciseId);
    return definition?.primary.includes(muscle) ?? false;
  });
}

function completionRate(item: ExerciseLog): number {
  if (!item.sets.length) return 0;
  return item.sets.filter((set) => set.completed).length / item.sets.length;
}

function performanceTrend(logs: WorkoutLog[], muscle: MuscleGroup): 'none' | 'progressing' | 'declining' | 'pain' {
  const relevant = logs.slice().sort((a, b) => a.completedAt.localeCompare(b.completedAt)).flatMap((log) => logExerciseForMuscle(log, muscle).map((exerciseLog) => ({ log, exerciseLog })));
  if (relevant.some(({ exerciseLog }) => exerciseLog.discomfort === 'pain')) return 'pain';
  if (relevant.length < 2) return 'none';
  const recent = relevant.slice(-4);
  const last = recent[recent.length - 1];
  const previous = recent[recent.length - 2];
  const lastReps = last.exerciseLog.sets.reduce((sum, set) => sum + set.reps, 0);
  const previousReps = previous.exerciseLog.sets.reduce((sum, set) => sum + set.reps, 0);
  const lastCompletion = completionRate(last.exerciseLog);
  const previousCompletion = completionRate(previous.exerciseLog);
  if (lastCompletion < 0.8 && previousCompletion < 0.8) return 'declining';
  if (lastReps < previousReps - 1 && lastCompletion <= previousCompletion) return 'declining';
  if (lastCompletion === 1 && previousCompletion === 1 && lastReps >= previousReps) return 'progressing';
  return 'none';
}

function startVolumeFor(profile: Profile, state: TrainingState, muscle: MuscleGroup): { value: number; source: 'current-volume' | 'conservative-default' | 'adapted-from-logs' } {
  const reported = profile.currentVolume.directSetsPerWeek[muscle];
  const baseline = reported === undefined ? defaultStartVolume() : clamp(Math.round(reported), 0, 16);
  const trend = performanceTrend(state.logs, muscle);
  if (trend === 'declining') return { value: clamp(baseline - 1, 2, 16), source: 'adapted-from-logs' };
  const relevantLogs = state.logs.slice().sort((a, b) => a.completedAt.localeCompare(b.completedAt)).filter((log) => logExerciseForMuscle(log, muscle).length).slice(-2);
  if (trend === 'progressing' && profile.priorityMuscles[0] === muscle && relevantLogs.length === 2 && relevantLogs.every((log) => log.recovery !== 'poor')) return { value: clamp(baseline + 1, 2, 16), source: 'adapted-from-logs' };
  return { value: baseline, source: reported === undefined ? 'conservative-default' : 'current-volume' };
}

function startVolumes(profile: Profile, state: TrainingState): { volumes: Record<MuscleGroup, number>; sources: Record<MuscleGroup, 'current-volume' | 'conservative-default' | 'adapted-from-logs'> } {
  const volumes = emptyVolume();
  const sources = emptySources();
  for (const muscle of MUSCLE_GROUPS) {
    const result = startVolumeFor(profile, state, muscle);
    volumes[muscle] = result.value;
    sources[muscle] = result.source;
  }
  return { volumes, sources };
}

function styleFit(definition: ExerciseDefinition, style: TrainingPreferences['style']): number {
  if (style === 'mixed') return 1;
  if (style === 'machines') return definition.equipment === 'machines' || definition.equipment === 'cables' ? 2 : 0;
  if (style === 'free-weights') return definition.equipment === 'dumbbells' || definition.equipment === 'barbell' ? 2 : 0;
  return definition.equipment === 'bodyweight' ? 2 : 0;
}

function varietyPenalty(definition: ExerciseDefinition, usage: Map<string, number>, variety: TrainingPreferences['variety']): number {
  const use = usage.get(definition.id) ?? 0;
  if (variety === 'repeatable') return use * 0.25;
  if (variety === 'varied') return use * 2;
  return use;
}

function candidateNeed(definition: ExerciseDefinition, planned: Record<MuscleGroup, number>, start: Record<MuscleGroup, number>): number {
  return Object.entries(definition.muscleContributions).reduce((sum, [muscle, contribution]) => {
    if (!isMuscleGroup(muscle) || !contribution) return sum;
    const deficit = Math.max(0, start[muscle] - planned[muscle]);
    return sum + (deficit / Math.max(start[muscle], 1)) * contribution.volume;
  }, 0);
}

function priorityScore(definition: ExerciseDefinition, priorities: MuscleGroup[]): number {
  return definition.primary.reduce((best, muscle) => {
    const index = priorities.indexOf(muscle);
    return index >= 0 ? Math.max(best, priorities.length - index) : best;
  }, 0);
}

function restrictionBlocks(definition: ExerciseDefinition, profile: Profile): boolean {
  return profile.safety.medicalRestrictions.some((restriction) => restriction.forbiddenExerciseIds.includes(definition.id) || restriction.forbiddenPatterns.includes(definition.pattern) || definition.avoidWith.includes(restriction.area));
}

function eligible(definition: ExerciseDefinition, profile: Profile, chosen: ExerciseDefinition[] = []): boolean {
  if (!profile.equipment.includes(definition.equipment)) return false;
  if (definition.requirements.some((requirement) => !profile.setups.includes(requirement))) return false;
  if (restrictionBlocks(definition, profile)) return false;
  if (profile.preferences.excludedExerciseIds.includes(definition.id)) return false;
  if (chosen.some((item) => item.id === definition.id)) return false;
  return true;
}

function chooseCandidate(pattern: MovementPattern, profile: Profile, usage: Map<string, number>, planned: Record<MuscleGroup, number>, start: Record<MuscleGroup, number>, chosen: ExerciseDefinition[]): ExerciseDefinition | undefined {
  return EXERCISES.filter((definition) => definition.pattern === pattern && eligible(definition, profile, chosen)).sort((a, b) => {
    const needDifference = candidateNeed(b, planned, start) - candidateNeed(a, planned, start);
    if (Math.abs(needDifference) > 0.0001) return needDifference;
    const priorityDifference = priorityScore(b, profile.priorityMuscles) - priorityScore(a, profile.priorityMuscles);
    if (priorityDifference !== 0) return priorityDifference;
    const styleDifference = styleFit(b, profile.preferences.style) - styleFit(a, profile.preferences.style);
    if (styleDifference !== 0) return styleDifference;
    const favoriteDifference = Number(profile.preferences.favoriteExerciseIds.includes(b.id)) - Number(profile.preferences.favoriteExerciseIds.includes(a.id));
    if (favoriteDifference !== 0) return favoriteDifference;
    const dislikedDifference = Number(profile.preferences.dislikedExerciseIds.includes(a.id)) - Number(profile.preferences.dislikedExerciseIds.includes(b.id));
    if (dislikedDifference !== 0) return dislikedDifference;
    const varietyDifference = varietyPenalty(a, usage, profile.preferences.variety) - varietyPenalty(b, usage, profile.preferences.variety);
    if (Math.abs(varietyDifference) > 0.0001) return varietyDifference;
    if (b.stimulus !== a.stimulus) return b.stimulus - a.stimulus;
    if (b.progressionEase !== a.progressionEase) return b.progressionEase - a.progressionEase;
    if (a.fatigueCost !== b.fatigueCost) return a.fatigueCost - b.fatigueCost;
    return a.id.localeCompare(b.id);
  })[0];
}

function repRange(definition: ExerciseDefinition): { min: number; max: number } {
  return definition.compound ? { min: 6, max: 10 } : { min: 10, max: 15 };
}

function baseSets(definition: ExerciseDefinition, profile: Profile): number {
  const recoveryPenalty = profile.sleep === 'poor' || profile.stress === 'high' ? 1 : 0;
  const experienceSets = profile.experience === 'beginner' ? 2 : 3;
  const fatiguePenalty = recoveryPenalty && definition.fatigueCost === 3 ? 1 : 0;
  return clamp(experienceSets - Math.min(1, recoveryPenalty) - fatiguePenalty, 2, 4);
}

function restSeconds(definition: ExerciseDefinition): number {
  return definition.compound ? 120 : 75;
}

function recentExerciseLogs(state: TrainingState, exerciseId: string): ExerciseLog[] {
  return state.logs.slice().sort((a, b) => a.completedAt.localeCompare(b.completedAt)).flatMap((log) => log.exercises.filter((item) => item.exerciseId === exerciseId));
}

function chronologicalLogs(logs: WorkoutLog[]): WorkoutLog[] {
  return logs.slice().sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt) || a.id.localeCompare(b.id));
}

function exposureFromLog(log: WorkoutLog, exerciseId: string): ExerciseExposure | null {
  const exerciseLog = log.exercises.find((item) => item.exerciseId === exerciseId);
  if (!exerciseLog) return null;
  const completedSets = exerciseLog.sets.filter((set) => set.completed);
  const reps = completedSets.map((set) => set.reps).filter((reps): reps is number => Number.isFinite(reps));
  const weights = completedSets.map((set) => set.weightKg).filter((weight): weight is number => typeof weight === 'number' && Number.isFinite(weight) && weight > 0);
  const rirValues = completedSets.map((set) => set.rir).filter((rir): rir is number => typeof rir === 'number' && Number.isFinite(rir));
  return {
    completedSets: completedSets.length,
    totalSets: exerciseLog.sets.length,
    completionRate: exerciseLog.sets.length ? completedSets.length / exerciseLog.sets.length : 0,
    averageReps: reps.length ? reps.reduce((sum, value) => sum + value, 0) / reps.length : null,
    bestWeightKg: weights.length ? Math.max(...weights) : null,
    averageRir: rirValues.length ? rirValues.reduce((sum, value) => sum + value, 0) / rirValues.length : null,
    discomfort: exerciseLog.discomfort,
    completedAt: log.completedAt
  };
}

export function getExerciseProgress(exerciseId: string, state: TrainingState): ExerciseProgress {
  const exposures = chronologicalLogs(state.logs).map((log) => exposureFromLog(log, exerciseId)).filter((exposure): exposure is ExerciseExposure => Boolean(exposure));
  const latest = exposures.at(-1) ?? null;
  const previous = exposures.at(-2) ?? null;
  const deltaAverageReps = latest?.averageReps !== null && latest?.averageReps !== undefined && previous?.averageReps !== null && previous?.averageReps !== undefined ? latest.averageReps - previous.averageReps : null;
  const deltaBestWeightKg = latest?.bestWeightKg !== null && latest?.bestWeightKg !== undefined && previous?.bestWeightKg !== null && previous?.bestWeightKg !== undefined ? latest.bestWeightKg - previous.bestWeightKg : null;
  let trend: ExerciseTrend = 'new';
  if (latest?.discomfort === 'pain' || previous?.discomfort === 'pain') trend = 'pain';
  else if (exposures.length >= 2 && ((deltaAverageReps !== null && deltaAverageReps >= 1) || (deltaBestWeightKg !== null && deltaBestWeightKg > 0) || (latest!.completionRate > previous!.completionRate + 0.1 && (deltaAverageReps === null || deltaAverageReps >= 0)))) trend = 'progressing';
  else if (exposures.length >= 2 && ((deltaAverageReps !== null && deltaAverageReps <= -1) || (deltaBestWeightKg !== null && deltaBestWeightKg < 0) || (latest!.completionRate < previous!.completionRate - 0.1 && (deltaAverageReps === null || deltaAverageReps <= 0)))) trend = 'declining';
  else if (exposures.length >= 2) trend = 'steady';
  return { exerciseId, exposures: exposures.length, latest, previous, deltaAverageReps, deltaBestWeightKg, trend };
}

export function getWorkoutFeedback(workout: Workout, log?: WorkoutLog | null): WorkoutFeedback {
  const plannedSets = workout.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  let completedSets = 0;
  let completedExercises = 0;
  let hasPain = false;
  for (const exercise of workout.exercises) {
    const exerciseLog = log?.exercises.find((item) => item.exerciseId === exercise.id);
    if (!exerciseLog) continue;
    if (exerciseLog.discomfort === 'pain') hasPain = true;
    const completed = exerciseLog.sets.slice(0, exercise.sets).filter((set) => set.completed).length;
    completedSets += completed;
    if (completed > 0) completedExercises += 1;
  }
  const completionRate = plannedSets ? completedSets / plannedSets : 0;
  return {
    workoutId: workout.id,
    plannedSets,
    completedSets,
    skippedSets: Math.max(0, plannedSets - completedSets),
    plannedExercises: workout.exercises.length,
    completedExercises,
    completionRate,
    completionPercentage: Math.round(completionRate * 100),
    actualDurationMinutes: log?.actualDurationMinutes ?? null,
    sessionRpe: log?.sessionRpe ?? null,
    recovery: log?.recovery ?? null,
    hasPain
  };
}

function localWeekStart(reference: Date): Date {
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function isInLocalWeek(log: WorkoutLog, reference: Date): boolean {
  const completedAt = new Date(log.completedAt);
  if (!Number.isFinite(completedAt.getTime())) return false;
  const start = localWeekStart(reference);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return completedAt >= start && completedAt < end;
}

export function getWorkoutProgress(workouts: Workout[], logs: WorkoutLog[], reference = new Date()): WorkoutProgress {
  const latestByWorkout = new Map<string, WorkoutLog>();
  for (const log of chronologicalLogs(logs.filter((item) => isInLocalWeek(item, reference)))) {
    if (workouts.some((workout) => workout.id === log.workoutId)) latestByWorkout.set(log.workoutId, log);
  }
  const plannedSets = workouts.reduce((sum, workout) => sum + workout.exercises.reduce((workoutSum, exercise) => workoutSum + exercise.sets, 0), 0);
  const completedSets = workouts.reduce((sum, workout) => sum + getWorkoutFeedback(workout, latestByWorkout.get(workout.id)).completedSets, 0);
  const completedWorkoutIds = workouts.filter((workout) => latestByWorkout.has(workout.id)).map((workout) => workout.id);
  return {
    plannedWorkouts: workouts.length,
    completedWorkouts: completedWorkoutIds.length,
    plannedSets,
    completedSets,
    completionRate: plannedSets ? completedSets / plannedSets : 0,
    completedWorkoutIds
  };
}

function successfulExposureCount(state: TrainingState, exerciseId: string, repMin: number, targetRir: number): number {
  const relevant = state.logs.slice().sort((a, b) => a.completedAt.localeCompare(b.completedAt)).flatMap((log) => log.exercises.filter((item) => item.exerciseId === exerciseId).map((exerciseLog) => ({ log, exerciseLog }))).slice(-2);
  return relevant.filter(({ log, exerciseLog }) => {
    if (log.recovery === 'poor' || exerciseLog.discomfort === 'pain' || !exerciseLog.sets.length || completionRate(exerciseLog) < 1) return false;
    const rirValues = exerciseLog.sets.map((set) => set.rir).filter((rir): rir is number => typeof rir === 'number');
    const averageRir = rirValues.length ? rirValues.reduce((sum, rir) => sum + rir, 0) / rirValues.length : null;
    return exerciseLog.sets.every((set) => set.reps >= repMin) && (averageRir === null || Math.abs(averageRir - targetRir) <= 1);
  }).length;
}

function roundToStep(value: number, step: number): number {
  if (!step) return Math.max(0, Math.round(value * 10) / 10);
  return Math.max(0, Math.round(value / step) * step);
}

export function progressionForExercise(prescription: ExercisePrescription, state: TrainingState): ProgressionDecision {
  const history = recentExerciseLogs(state, prescription.id);
  const latest = history[history.length - 1];
  if (!latest) return { action: 'start', message: `Start met ${prescription.rir} RIR en noteer elke set.` };
  if (latest.discomfort === 'pain') return { action: 'swap-review', message: 'Pijn gemeld: stop deze oefening en kies een alternatief of laat dit beoordelen.' };
  const allTop = latest.sets.length >= prescription.sets && latest.sets.every((set) => set.completed && set.reps >= prescription.repMax);
  const rirValues = latest.sets.map((set) => set.rir).filter((rir): rir is number => typeof rir === 'number');
  const averageRir = rirValues.length ? rirValues.reduce((sum, rir) => sum + rir, 0) / rirValues.length : null;
  const rirWithinTarget = averageRir === null || Math.abs(averageRir - prescription.rir) <= 1;
  if (allTop && rirWithinTarget) {
    const lastWeight = latest.sets.map((set) => set.weightKg).find((weight): weight is number => typeof weight === 'number' && weight > 0);
    return { action: 'increase-load', nextLoadKg: lastWeight === undefined ? undefined : roundToStep(lastWeight + Math.max(prescription.loadStepKg, lastWeight * 0.025), prescription.loadStepKg), message: 'Alle werksets haalden de bovenkant met passende RIR: verhoog de belasting klein.' };
  }
  const completedRate = completionRate(latest);
  const totalReps = latest.sets.reduce((sum, set) => sum + set.reps, 0);
  const previous = history.length > 1 ? history[history.length - 2] : null;
  const previousReps = previous?.sets.reduce((sum, set) => sum + set.reps, 0) ?? totalReps;
  if (completedRate < 0.8 && previous && completionRate(previous) < 0.8) {
    const lastWeight = latest.sets.map((set) => set.weightKg).find((weight): weight is number => typeof weight === 'number' && weight > 0);
    const reduction = lastWeight === undefined ? undefined : roundToStep(Math.max(0, lastWeight * 0.95), prescription.loadStepKg);
    return { action: 'reduce-volume', nextLoadKg: reduction, nextSets: Math.max(1, prescription.sets - 1), message: 'Twee sessies bleven onder de uitvoering: verlaag tijdelijk belasting en volume.' };
  }
  if (previous && totalReps < previousReps - 1 && completedRate <= completionRate(previous)) return { action: 'repeat', message: 'De prestatie daalde één keer: herhaal dezelfde belasting en focus op controle.' };
  if (completedRate === 1 && totalReps < prescription.sets * prescription.repMax) return { action: 'add-reps', message: 'Alle sets zijn voltooid: houd het gewicht en bouw reps op binnen de range.' };
  return { action: 'repeat', message: 'Herhaal deze belasting tot de rep range stabiel is.' };
}

function basePrescription(definition: ExerciseDefinition, profile: Profile, deload: boolean): ExercisePrescription {
  const range = repRange(definition);
  const normalSets = baseSets(definition, profile);
  const sets = deload ? Math.max(1, Math.ceil(normalSets / 2)) : normalSets;
  return {
    ...definition,
    sets,
    reps: `${range.min}-${range.max}`,
    repMin: range.min,
    repMax: range.max,
    restSeconds: restSeconds(definition),
    rir: deload ? 3 : 2,
    progression: { action: 'start', message: deload ? 'Deload: gebruik een rustige belasting en houd 3-4 herhalingen over.' : 'Start met 2 RIR en noteer elke set.' }
  };
}

function applyProgression(item: ExercisePrescription, state: TrainingState, deload: boolean): ExercisePrescription {
  if (deload) return { ...item, progression: { action: 'repeat', message: 'Deload: gebruik een rustige belasting en houd 3-4 herhalingen over.' } };
  const decision = progressionForExercise(item, state);
  const canAddSet = decision.action !== 'reduce-volume' && decision.action !== 'swap-review' && successfulExposureCount(state, item.id, item.repMin, item.rir) >= 2;
  const sets = Math.min(4, (decision.nextSets ?? item.sets) + (canAddSet ? 1 : 0));
  return { ...item, sets, suggestedLoadKg: decision.nextLoadKg, progression: decision };
}

function exerciseSeconds(item: ExercisePrescription, firstCompound: boolean): number {
  const reps = (item.repMin + item.repMax) / 2;
  const sideFactor = item.unilateral ? 1.8 : 1;
  const workSeconds = item.sets * reps * 4 * sideFactor;
  const rest = Math.max(0, item.sets - 1) * item.restSeconds * sideFactor;
  const warmupSets = item.compound ? (firstCompound ? 2 : 1) : 0;
  const warmupSeconds = warmupSets * 105 * sideFactor;
  return item.setupSeconds + workSeconds + rest + warmupSeconds;
}

export function estimateWorkoutMinutes(exercises: ExercisePrescription[], timeFactor = 1.15): number {
  let firstCompound = true;
  const exerciseTime = exercises.reduce((sum, item) => {
    const seconds = exerciseSeconds(item, firstCompound);
    if (item.compound) firstCompound = false;
    return sum + seconds;
  }, 0);
  const transitions = Math.max(0, exercises.length - 1) * 30;
  const sessionOverhead = 5 * 60;
  return Math.ceil(((exerciseTime + transitions + sessionOverhead) / 60) * clamp(timeFactor, 1, 1.35));
}

function priorityNeed(item: ExercisePrescription, start: Record<MuscleGroup, number>): number {
  return Math.max(...item.primary.map((muscle) => start[muscle]), 0) + (item.compound ? 0.2 : 0);
}

function exposesMuscle(item: ExercisePrescription, muscle: MuscleGroup): boolean {
  return (item.muscleContributions[muscle]?.volume ?? 0) > 0;
}

function keepsPriorityExposure(item: ExercisePrescription, exercises: ExercisePrescription[], priorities: MuscleGroup[]): boolean {
  return priorities.every((muscle) => !exposesMuscle(item, muscle) || exercises.some((candidate) => candidate !== item && exposesMuscle(candidate, muscle)));
}

function timeSacrificeOrder(a: ExercisePrescription, b: ExercisePrescription, start: Record<MuscleGroup, number>, priorities: MuscleGroup[]): number {
  const aPriority = priorityScore(a, priorities);
  const bPriority = priorityScore(b, priorities);
  if (aPriority !== bPriority) return aPriority - bPriority;
  if (a.compound !== b.compound) return Number(a.compound) - Number(b.compound);
  const needDifference = priorityNeed(a, start) - priorityNeed(b, start);
  if (needDifference !== 0) return needDifference;
  if (a.stimulus !== b.stimulus) return a.stimulus - b.stimulus;
  if (a.progressionEase !== b.progressionEase) return a.progressionEase - b.progressionEase;
  return a.id.localeCompare(b.id);
}

function timeExerciseLimit(minutes: number, count: number): number {
  if (minutes <= 30) return Math.min(count, 4);
  if (minutes <= 45) return Math.min(count, 5);
  return count;
}

function fitToTime(exercises: ExercisePrescription[], minutes: number, start: Record<MuscleGroup, number>, priorities: MuscleGroup[], timeFactor: number): { exercises: ExercisePrescription[]; changed: boolean; feasible: boolean } {
  const fitted = exercises.map((item) => ({ ...item }));
  let changed = false;
  const exerciseLimit = timeExerciseLimit(minutes, fitted.length);

  // ponytail: deterministic greedy fit; replace with measured scheduling only if real timing data shows it misses.
  while (fitted.length > exerciseLimit) {
    const removable = fitted
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => keepsPriorityExposure(item, fitted, priorities))
      .sort((a, b) => timeSacrificeOrder(a.item, b.item, start, priorities))[0];
    if (!removable || fitted.length <= 3) break;
    fitted.splice(removable.index, 1);
    changed = true;
  }

  while (fitted.length > 3 && estimateWorkoutMinutes(fitted, timeFactor) > minutes) {
    const removable = fitted
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => keepsPriorityExposure(item, fitted, priorities))
      .sort((a, b) => timeSacrificeOrder(a.item, b.item, start, priorities))[0];
    if (!removable) break;
    fitted.splice(removable.index, 1);
    changed = true;
  }

  while (fitted.length && estimateWorkoutMinutes(fitted, timeFactor) > minutes) {
    const reducible = fitted
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.sets > 2)
      .sort((a, b) => timeSacrificeOrder(a.item, b.item, start, priorities))[0];
    if (reducible) {
      fitted[reducible.index].sets -= 1;
      changed = true;
      continue;
    }
    const singleSetFallback = fitted
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.sets > 1)
      .sort((a, b) => timeSacrificeOrder(a.item, b.item, start, priorities))[0];
    if (singleSetFallback) {
      fitted[singleSetFallback.index].sets -= 1;
      changed = true;
      continue;
    }
    const removable = fitted
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => fitted.length > 3 && keepsPriorityExposure(item, fitted, priorities))
      .sort((a, b) => timeSacrificeOrder(a.item, b.item, start, priorities))[0];
    if (!removable) break;
    fitted.splice(removable.index, 1);
    changed = true;
  }
  return { exercises: fitted, changed, feasible: estimateWorkoutMinutes(fitted, timeFactor) <= minutes };
}

function fitNote(original: ExercisePrescription[], fitted: ExercisePrescription[], minutes: number, changed: boolean): string | undefined {
  if (!changed) return undefined;
  const removed = original.length - fitted.length;
  const reducedSets = original.reduce((sum, item) => {
    const result = fitted.find((candidate) => candidate.id === item.id);
    return sum + (result ? Math.max(0, item.sets - result.sets) : 0);
  }, 0);
  const changes = [];
  if (removed > 0) changes.push(`${removed} oefening${removed === 1 ? '' : 'en'} geschrapt`);
  if (reducedSets > 0) changes.push(`${reducedSets} werkset${reducedSets === 1 ? '' : 's'} verminderd`);
  return `Je hebt ${minutes} minuten. Daarom ${changes.join(' en ') || 'de werksets aangepast'} zodat de sessie binnen je limiet blijft.`;
}

function addVolume(volume: Record<MuscleGroup, number>, item: ExercisePrescription): void {
  for (const [muscle, contribution] of Object.entries(item.muscleContributions) as Array<[MuscleGroup, MuscleContribution]>) if (isMuscleGroup(muscle)) volume[muscle] += item.sets * contribution.volume;
}

function addDirectVolume(volume: Record<MuscleGroup, number>, item: ExercisePrescription): void {
  for (const muscle of item.primary) volume[muscle] += item.sets;
}

function roundedVolume(volume: Record<MuscleGroup, number>): Record<MuscleGroup, number> {
  for (const muscle of MUSCLE_GROUPS) volume[muscle] = Math.round(volume[muscle] * 10) / 10;
  return volume;
}

function warningKey(warning: PlanWarning): string {
  return [warning.code, warning.muscle, warning.pattern, warning.workoutTitle, warning.message].join('|');
}

function addWarning(warnings: PlanWarning[], warning: PlanWarning): void {
  if (!warnings.some((item) => warningKey(item) === warningKey(warning))) warnings.push(warning);
}

function recoveryLoads(workout: Workout): Record<MuscleGroup, number> {
  const result = emptyVolume();
  for (const item of workout.exercises) for (const [muscle, contribution] of Object.entries(item.muscleContributions) as Array<[MuscleGroup, MuscleContribution]>) if (isMuscleGroup(muscle)) result[muscle] += item.sets * contribution.recovery * (item.fatigueCost / 2);
  return result;
}

function dayGap(from: number, to: number): number {
  return (to - from + 7) % 7 || 7;
}

function recoveryWarnings(workouts: Workout[], profile: Profile, warnings: PlanWarning[]): void {
  const ordered = [...workouts].sort((a, b) => a.weekday - b.weekday);
  for (let index = 0; index < ordered.length; index += 1) {
    const current = ordered[index];
    const next = ordered[(index + 1) % ordered.length];
    const gapHours = dayGap(current.weekday, next.weekday) * 24;
    const currentLoads = recoveryLoads(current);
    const nextLoads = recoveryLoads(next);
    for (const muscle of MUSCLE_GROUPS.filter((item) => currentLoads[item] > 0 && nextLoads[item] > 0)) {
      const recoveryHours = Math.max(...current.exercises.filter((item) => item.muscleContributions[muscle]).map((item) => item.recoveryHours), ...next.exercises.filter((item) => item.muscleContributions[muscle]).map((item) => item.recoveryHours));
      if (gapHours < recoveryHours && currentLoads[muscle] + nextLoads[muscle] > 1.5) addWarning(warnings, { code: 'recovery-overlap', severity: 'warning', muscle, workoutTitle: next.title, message: `${MUSCLE_LABELS[muscle]} krijgt opnieuw belasting voordat de geplande herstelruimte voorbij is.`, suggestions: ['Houd de volgorde aan als je week vastligt en log je prestaties.', 'Kies bij teruglopende prestaties een veilige swap of minder volume.'] });
    }
  }
  for (const workout of workouts) if (profile.otherSportDays.includes(workout.weekday)) addWarning(warnings, { code: 'sport-overlap', severity: 'warning', workoutTitle: workout.title, message: `${workout.day} valt samen met je intensieve andere sport.`, suggestions: ['Plan krachttraining op een ander moment als dat kan.', 'Log extra vermoeidheid zodat de volgende training kan worden aangepast.'] });
}

function deloadNeeded(logs: WorkoutLog[]): boolean {
  const recent = logs.slice().sort((a, b) => a.completedAt.localeCompare(b.completedAt)).slice(-2);
  if (recent.length < 2) return false;
  const lowCompletion = recent.filter((log) => {
    const sets = log.exercises.flatMap((item) => item.sets);
    return sets.length > 0 && sets.filter((set) => set.completed).length / sets.length < 0.8;
  }).length === 2;
  const highRpe = recent.filter((log) => typeof log.sessionRpe === 'number' && log.sessionRpe >= 9).length === 2;
  const poorRecovery = recent.filter((log) => log.recovery === 'poor').length === 2;
  const repeatedFailure = recent.filter((log) => log.exercises.some((exercise) => exercise.sets.some((set) => set.rir === 0))).length === 2;
  const decliningMuscles = MUSCLE_GROUPS.filter((muscle) => performanceTrend(recent, muscle) === 'declining').length;
  return [lowCompletion, highRpe, poorRecovery, repeatedFailure, decliningMuscles >= 2].filter(Boolean).length >= 2;
}

function planTitle(days: number): string {
  if (days === 2) return 'Compacte spiergroei';
  if (days === 3) return 'Full body spiergroei';
  if (days === 4) return 'Upper / lower spiergroei';
  if (days === 5) return 'Vijfdaagse spiergroei';
  return 'Push / pull / legs';
}

function workoutFocus(exercises: ExercisePrescription[], priorities: MuscleGroup[]): string {
  const muscles = [...new Set(exercises.flatMap((item) => item.primary))].sort((a, b) => {
    const aPriority = priorities.indexOf(a);
    const bPriority = priorities.indexOf(b);
    return (aPriority < 0 ? 99 : aPriority) - (bPriority < 0 ? 99 : bPriority);
  });
  return muscles.slice(0, 2).map((muscle) => MUSCLE_LABELS[muscle]).join(' + ') || 'Pijnvrije beweging';
}

function applyOverride(definition: ExerciseDefinition, workoutId: string, profile: Profile, state: TrainingState, warnings: PlanWarning[]): ExerciseDefinition {
  const replacementId = state.overrides[`${workoutId}:${definition.id}`];
  if (!replacementId) return definition;
  const replacement = EXERCISES.find((item) => item.id === replacementId);
  if (!replacement || !eligible(replacement, profile)) {
    addWarning(warnings, { code: 'no-safe-alternative', severity: 'warning', workoutTitle: workoutId, message: `De opgeslagen swap voor ${definition.name} kon niet veilig worden toegepast.`, suggestions: ['Kies opnieuw uit de veilige alternatieven.', 'Controleer apparatuur en restricties.'] });
    return definition;
  }
  return replacement;
}

export function buildPlan(input: Profile | Record<string, unknown>, state: TrainingState = emptyTrainingState()): TrainingPlan {
  const profile = normalizeProfile(input);
  validateProfile(profile);
  const { volumes: start, sources } = startVolumes(profile, state);
  const deload = deloadNeeded(state.logs);
  const warnings: PlanWarning[] = [];
  const usage = new Map<string, number>();
  const planned = emptyVolume();
  const plannedDirect = emptyVolume();
  const orderedDays = [...profile.availability].sort((a, b) => a.weekday - b.weekday);
  const sessions = orderedSessions(orderedDays.length, profile);
  const workouts: Workout[] = [];

  sessions.forEach((session, sessionIndex) => {
    const day = orderedDays[sessionIndex];
    const workoutId = `day-${day.weekday}-${sessionIndex + 1}`;
    const chosenDefinitions: ExerciseDefinition[] = [];
    const chosen: ExercisePrescription[] = [];
    for (const pattern of session.patterns) {
      const selected = chooseCandidate(pattern, profile, usage, planned, start, chosenDefinitions);
      if (!selected) {
        addWarning(warnings, { code: 'missing-pattern', severity: 'warning', pattern, workoutTitle: session.title, message: `${session.title} heeft geen toegestane oefening voor ${pattern}.`, suggestions: ['Controleer de gekozen apparatuur en setups.', 'Gebruik een veilige swap zodra een alternatief beschikbaar is.'] });
        continue;
      }
      const overridden = applyOverride(selected, workoutId, profile, state, warnings);
      chosenDefinitions.push(overridden);
      usage.set(overridden.id, (usage.get(overridden.id) ?? 0) + 1);
      chosen.push(basePrescription(overridden, profile, deload));
    }
    if (chosen.length < 3) {
      const fallback = EXERCISES.filter((definition) => eligible(definition, profile, chosenDefinitions)).sort((a, b) => candidateNeed(b, planned, start) - candidateNeed(a, planned, start) || a.id.localeCompare(b.id));
      while (chosen.length < 3 && fallback.length) {
        const definition = fallback.shift()!;
        chosenDefinitions.push(definition);
        usage.set(definition.id, (usage.get(definition.id) ?? 0) + 1);
        chosen.push(basePrescription(definition, profile, deload));
      }
    }
    const initialFit = fitToTime(chosen, day.minutes, start, profile.priorityMuscles, state.timeFactor);
    const adapted = initialFit.exercises.map((item) => applyProgression(item, state, deload));
    const finalFit = fitToTime(adapted, day.minutes, start, profile.priorityMuscles, state.timeFactor);
    const fitChanged = initialFit.changed || finalFit.changed;
    if (fitChanged) addWarning(warnings, { code: 'time-constraint', severity: 'warning', workoutTitle: session.title, message: `${session.title} is ingekort om binnen ${day.minutes} minuten te blijven.`, suggestions: ['Kies een langere trainingsduur op deze dag.', 'Log werkelijke trainingstijd voor een betere persoonlijke schatting.'] });
    if (!finalFit.feasible && finalFit.exercises.length) addWarning(warnings, { code: 'time-constraint', severity: 'blocking', workoutTitle: session.title, message: `${session.title} past niet binnen de opgegeven tijd met veilige warming-up en rust.`, suggestions: ['Kies een langere trainingsduur.', 'Verwijder een trainingsdag of restrictie alleen wanneer dat klopt.'] });
    const workout: Workout = {
      id: workoutId,
      weekday: day.weekday,
      day: DAY_LABELS[day.weekday],
      title: session.title,
      focus: workoutFocus(finalFit.exercises, profile.priorityMuscles),
      duration: estimateWorkoutMinutes(finalFit.exercises, state.timeFactor),
      timeBudget: day.minutes,
      exercises: finalFit.exercises,
      fitNote: fitNote(chosen, finalFit.exercises, day.minutes, fitChanged)
    };
    workouts.push(workout);
    for (const item of workout.exercises) {
      addVolume(planned, item);
      addDirectVolume(plannedDirect, item);
    }
  });

  const directWeeklyVolume = roundedVolume(plannedDirect);
  const weeklyVolume = roundedVolume(planned);
  for (const muscle of MUSCLE_GROUPS) {
    if (directWeeklyVolume[muscle] === 0 && start[muscle] > 0) addWarning(warnings, { code: 'missing-muscle', severity: 'warning', muscle, message: `${MUSCLE_LABELS[muscle]} krijgt geen directe werksets in deze combinatie van dagen, tijd, materiaal en restricties.`, suggestions: ['Kies een extra trainingsdag of langere sessie.', 'Controleer of een benodigde setup ontbreekt.'] });
    else if (directWeeklyVolume[muscle] < start[muscle] * 0.8) addWarning(warnings, { code: 'under-start-volume', severity: 'warning', muscle, message: `${MUSCLE_LABELS[muscle]} blijft onder het persoonlijke directe startvolume door de gekozen beperkingen.`, suggestions: ['Houd prestaties en herstel twee tot drie blootstellingen bij.', 'Verhoog niet blind; laat de coach eerst leren hoe je reageert.'] });
  }
  recoveryWarnings(workouts, profile, warnings);
  if (deload) addWarning(warnings, { code: 'deload-recommended', severity: 'info', message: 'De recente logs wijzen op onvoldoende herstel of teruglopende prestaties.', suggestions: ['Gebruik deze week halve sets en ongeveer 3-4 RIR.', 'Ga daarna terug naar de laatste succesvolle belasting.'] });
  const rhythm = orderedDays.map((day) => DAY_LABELS[day.weekday].slice(0, 2)).join(' / ');
  const week: TrainingWeek = { number: 1, label: deload ? 'Herstelweek' : 'Huidige week', intent: deload ? 'Vermoeidheid laten zakken op basis van je logs.' : 'Een startpunt dat zich aanpast aan je prestaties.', workouts };
  return {
    title: planTitle(orderedDays.length),
    description: `${orderedDays.length} trainingen met individuele tijdslimieten. Dit is een startpunt; je logs bepalen de volgende aanpassing.`,
    frequency: `${orderedDays.length}x per week`,
    rhythm,
    reason: profile.currentVolume.confidence === 'unknown' ? 'Er was geen betrouwbare volumehistorie. FitQuest start conservatief en verhoogt pas na aantoonbaar goede prestaties en herstel.' : 'Je huidige directe sets zijn het startpunt. Prioriteit stuurt de verdeling; logs bepalen of volume omhoog, gelijk of omlaag gaat.',
    startVolume: start,
    volumeSource: sources,
    directWeeklyVolume,
    weeklyVolume,
    warnings,
    workouts,
    weeks: [week],
    deloadRecommended: deload
  };
}

export function getSafeAlternatives(exerciseId: string, input: Profile | Record<string, unknown>): ExerciseDefinition[] {
  const profile = normalizeProfile(input);
  const original = EXERCISES.find((item) => item.id === exerciseId);
  if (!original) return [];
  return EXERCISES.filter((item) => item.id !== original.id && item.pattern === original.pattern && item.primary.some((muscle) => original.primary.includes(muscle)) && eligible(item, profile)).sort((a, b) => {
    const favoriteDifference = Number(profile.preferences.favoriteExerciseIds.includes(b.id)) - Number(profile.preferences.favoriteExerciseIds.includes(a.id));
    if (favoriteDifference !== 0) return favoriteDifference;
    const styleDifference = styleFit(b, profile.preferences.style) - styleFit(a, profile.preferences.style);
    if (styleDifference !== 0) return styleDifference;
    if (b.stimulus !== a.stimulus) return b.stimulus - a.stimulus;
    return a.id.localeCompare(b.id);
  });
}

export function replaceExercise(plan: TrainingPlan, workoutId: string, exerciseId: string, replacementId: string, profileInput: Profile | Record<string, unknown>): TrainingPlan {
  const profile = normalizeProfile(profileInput);
  const workout = plan.workouts.find((item) => item.id === workoutId);
  const current = workout?.exercises.find((item) => item.id === exerciseId);
  const replacement = EXERCISES.find((item) => item.id === replacementId);
  if (!workout || !current || !replacement || replacement.pattern !== current.pattern || !getSafeAlternatives(exerciseId, profile).some((item) => item.id === replacementId)) throw new Error('Deze oefening is geen veilige vervanging voor deze training.');
  const exercises = workout.exercises.map((item) => item.id === exerciseId ? { ...replacement, sets: current.sets, reps: current.reps, repMin: current.repMin, repMax: current.repMax, restSeconds: current.restSeconds, rir: current.rir, suggestedLoadKg: current.suggestedLoadKg, progression: current.progression } : item);
  const workouts = plan.workouts.map((item) => item.id === workoutId ? { ...item, exercises, duration: estimateWorkoutMinutes(exercises) } : item);
  const volumes = workouts.reduce((result, item) => { item.exercises.forEach((exerciseItem) => { addVolume(result.effective, exerciseItem); addDirectVolume(result.direct, exerciseItem); }); return result; }, { effective: emptyVolume(), direct: emptyVolume() });
  return { ...plan, workouts, directWeeklyVolume: roundedVolume(volumes.direct), weeklyVolume: roundedVolume(volumes.effective), weeks: [{ ...plan.weeks[0], workouts }] };
}

export function goalLabel(goal: Goal): string {
  return { hypertrophy: 'Spiergroei', strength: 'Kracht', 'general-fitness': 'Algemene fitheid' }[goal];
}

export function experienceLabel(experience: Experience): string {
  return { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[experience];
}

export function equipmentLabel(equipment: Equipment): string {
  return { bodyweight: 'Lichaamsgewicht', dumbbells: 'Dumbbells', barbell: 'Barbell', machines: 'Machines', cables: 'Kabels', bands: 'Weerstandsbanden' }[equipment];
}

export function setupLabel(setup: SetupRequirement): string {
  return { floor: 'Vloer', bench: 'Bankje', rack: 'Rack', 'pull-up-bar': 'Pull-up bar', 'cable-stack': 'Kabelstation', 'band-anchor': 'Bandanker', slider: 'Gliders' }[setup];
}

export function limitationLabel(limitation: Limitation): string {
  return { shoulder: 'Schouder', elbow: 'Elleboog', wrist: 'Pols', back: 'Onderrug', hip: 'Heup', knee: 'Knie', ankle: 'Enkel' }[limitation];
}

function nextDateForWeekday(weekday: number, base = new Date()): Date {
  const date = new Date(base);
  const currentDay = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const offset = (weekday - currentDay + 7) % 7;
  date.setDate(date.getDate() + offset);
  date.setHours(7, 0, 0, 0);
  return date;
}

function icsDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function icsUtcDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function workoutDescription(workout: Workout): string {
  return `${workout.focus}. ${workout.exercises.map((item) => `${item.name}: ${item.sets} x ${item.reps} @ ${item.rir} RIR`).join('; ')}`;
}

export function createIcs(plan: TrainingPlan, base = new Date()): string {
  const now = icsUtcDate(new Date());
  const events = plan.workouts.map((item, index) => {
    const start = nextDateForWeekday(item.weekday, base);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + item.duration);
    return ['BEGIN:VEVENT', `UID:fitquest-${item.weekday}-${index}@fitquest.local`, `DTSTAMP:${now}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${escapeIcs(`FitQuest - ${item.title}`)}`, `DESCRIPTION:${escapeIcs(workoutDescription(item))}`, 'END:VEVENT'].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FitQuest//Training Plan//NL', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR', ''].join('\r\n');
}

export function createGoogleCalendarUrl(workoutItem: Workout, base = new Date()): string {
  const start = nextDateForWeekday(workoutItem.weekday, base);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + workoutItem.duration);
  const params = new URLSearchParams({ action: 'TEMPLATE', text: `FitQuest - ${workoutItem.title}`, dates: `${icsUtcDate(start)}/${icsUtcDate(end)}`, details: workoutDescription(workoutItem), location: 'Training' });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
