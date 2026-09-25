import {
  MUSCLE_GROUPS,
  normalizeProfile,
  type DayAvailability,
  type Equipment,
  type Experience,
  type Limitation,
  type MovementPattern,
  type MuscleGroup,
  type Profile,
  type SetupRequirement,
  type Sleep,
  type Stress,
  type TrainingPreferences
} from './fitness';

export const PROFILE_STORAGE_KEY = 'fitquest-profile-v4';
export const LEGACY_PROFILE_STORAGE_KEY = 'fitquest-profile-v3';
export const LEGACY_PROFILE_V2_STORAGE_KEY = 'fitquest-profile-v2';
export const ONBOARDING_DRAFT_STORAGE_KEY = 'fitquest-onboarding-draft-v2';
export const LEGACY_ONBOARDING_DRAFT_STORAGE_KEY = 'fitquest-onboarding-draft-v1';

export type PrimaryGoal = 'muscle-gain' | 'strength' | 'fat-loss-muscle-retention' | 'general-fitness' | 'sport-performance' | 'combination';
export type TrainingConsistency = 'new' | 'under-6-months' | '6-12-months' | '1-3-years' | '3-plus-years';
export type VolumeBand = 'unknown' | '1-4' | '5-8' | '9-12' | '13-16' | '17-plus';
export type SafetyStatus = 'none' | 'active' | 'managed' | 'history';

export interface OnboardingAnswers {
  schemaVersion: 2;
  adultConfirmed: true;
  consistentTraining: TrainingConsistency;
  currentVolumeBands: Record<MuscleGroup, VolumeBand>;
  availability: DayAvailability[];
  otherSportDays: number[];
  equipment: Equipment[];
  setups: SetupRequirement[];
  safetyStatus: SafetyStatus;
  restrictionAreas: Limitation[];
  clearedWithRestrictions: boolean;
  priorityMuscles: MuscleGroup[];
  style: TrainingPreferences['style'];
  variety: TrainingPreferences['variety'];
  averageSleepHours: number;
  stress: Stress;
}

export interface OnboardingAnswersDraft {
  schemaVersion: 2;
  adultConfirmed: boolean;
  consistentTraining: TrainingConsistency | '';
  currentVolumeBands: Record<MuscleGroup, VolumeBand>;
  trainingDays: number[];
  minutesByDay: Partial<Record<number, number | ''>>;
  hasOtherSport: boolean;
  otherSportDays: number[];
  equipment: Equipment[];
  setups: SetupRequirement[];
  safetyStatus: SafetyStatus | '';
  restrictionAreas: Limitation[];
  clearedWithRestrictions: boolean;
  priorityMuscles: MuscleGroup[];
  style: TrainingPreferences['style'] | '';
  variety: TrainingPreferences['variety'] | '';
  averageSleepHours: number | '';
  stress: Stress | '';
}

export interface StoredProfileRecord {
  schemaVersion: 4;
  profile: Profile;
  answers: OnboardingAnswers;
  updatedAt: string;
}

export interface OnboardingDraftRecord {
  schemaVersion: 2;
  answers: OnboardingAnswersDraft;
  stepId: string;
  updatedAt: string;
}

const CONSISTENCY_OPTIONS: TrainingConsistency[] = ['new', 'under-6-months', '6-12-months', '1-3-years', '3-plus-years'];
const VOLUME_BANDS: VolumeBand[] = ['unknown', '1-4', '5-8', '9-12', '13-16', '17-plus'];
const SAFETY_STATUSES: SafetyStatus[] = ['none', 'active', 'managed', 'history'];
const STYLES: TrainingPreferences['style'][] = ['machines', 'free-weights', 'bodyweight', 'mixed'];
const VARIETIES: TrainingPreferences['variety'][] = ['repeatable', 'balanced', 'varied'];
const EQUIPMENT: Equipment[] = ['bodyweight', 'dumbbells', 'barbell', 'machines', 'cables', 'bands'];
const SETUPS: SetupRequirement[] = ['floor', 'bench', 'rack', 'pull-up-bar', 'cable-stack', 'band-anchor', 'slider'];
const LIMITATIONS: Limitation[] = ['shoulder', 'elbow', 'wrist', 'back', 'hip', 'knee', 'ankle'];

export function createEmptyOnboardingAnswers(): OnboardingAnswersDraft {
  return {
    schemaVersion: 2,
    adultConfirmed: false,
    consistentTraining: '',
    currentVolumeBands: Object.fromEntries(MUSCLE_GROUPS.map((muscle) => [muscle, 'unknown'])) as Record<MuscleGroup, VolumeBand>,
    trainingDays: [],
    minutesByDay: {},
    hasOtherSport: false,
    otherSportDays: [],
    equipment: [],
    setups: [],
    safetyStatus: '',
    restrictionAreas: [],
    clearedWithRestrictions: false,
    priorityMuscles: [],
    style: '',
    variety: '',
    averageSleepHours: '',
    stress: ''
  };
}

function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

function isMuscleGroup(value: unknown): value is MuscleGroup {
  return typeof value === 'string' && MUSCLE_GROUPS.includes(value as MuscleGroup);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDay(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 6;
}

function isMinutes(value: unknown): value is 30 | 45 | 60 | 75 | 90 {
  return value === 30 || value === 45 || value === 60 || value === 75 || value === 90;
}

function emptyVolumeBands(): Record<MuscleGroup, VolumeBand> {
  return Object.fromEntries(MUSCLE_GROUPS.map((muscle) => [muscle, 'unknown'])) as Record<MuscleGroup, VolumeBand>;
}

function bandValue(band: VolumeBand): number | undefined {
  return { unknown: undefined, '1-4': 2, '5-8': 6, '9-12': 10, '13-16': 14, '17-plus': 17 }[band];
}

function bandForValue(value: number | undefined): VolumeBand {
  if (value === undefined || !Number.isFinite(value)) return 'unknown';
  if (value <= 4) return '1-4';
  if (value <= 8) return '5-8';
  if (value <= 12) return '9-12';
  if (value <= 16) return '13-16';
  return '17-plus';
}

export function experienceForConsistency(consistency: TrainingConsistency): Experience {
  if (consistency === 'new' || consistency === 'under-6-months') return 'beginner';
  if (consistency === '3-plus-years') return 'advanced';
  return 'intermediate';
}

export function sleepForHours(hours: number): Sleep {
  if (hours < 6) return 'poor';
  if (hours < 7) return 'fair';
  return 'good';
}

function consistencyForExperience(experience: Experience): TrainingConsistency {
  if (experience === 'beginner') return 'under-6-months';
  if (experience === 'advanced') return '3-plus-years';
  return '1-3-years';
}

function safetyFromAnswers(answers: OnboardingAnswers): Profile['safety'] {
  const restrictions = answers.safetyStatus === 'managed'
    ? answers.restrictionAreas.map((area) => ({ area, forbiddenPatterns: [] as MovementPattern[], forbiddenExerciseIds: [] }))
    : [];
  return {
    activeSymptoms: answers.safetyStatus === 'active',
    medicalRestrictions: restrictions,
    clearedWithRestrictions: answers.safetyStatus === 'managed' && answers.clearedWithRestrictions,
    historyOnly: answers.safetyStatus === 'history' ? answers.restrictionAreas : []
  };
}

export function profileFromAnswers(answers: OnboardingAnswers): Profile {
  const directSetsPerWeek: Partial<Record<MuscleGroup, number>> = {};
  for (const muscle of MUSCLE_GROUPS) {
    const value = bandValue(answers.currentVolumeBands[muscle]);
    if (value !== undefined) directSetsPerWeek[muscle] = value;
  }
  return normalizeProfile({
    schemaVersion: 4,
    goal: 'hypertrophy',
    experience: experienceForConsistency(answers.consistentTraining),
    currentVolume: { directSetsPerWeek, confidence: Object.keys(directSetsPerWeek).length ? 'rough' : 'unknown' },
    availability: answers.availability,
    otherSportDays: answers.otherSportDays,
    equipment: answers.equipment,
    setups: answers.setups,
    sleep: sleepForHours(answers.averageSleepHours),
    stress: answers.stress,
    safety: safetyFromAnswers(answers),
    priorityMuscles: answers.priorityMuscles,
    preferences: { style: answers.style, variety: answers.variety, favoriteExerciseIds: [], dislikedExerciseIds: [], excludedExerciseIds: [] }
  });
}

export function completeOnboardingAnswers(draft: OnboardingAnswersDraft): OnboardingAnswers | null {
  if (draft.schemaVersion !== 2 || draft.adultConfirmed !== true) return null;
  if (!isOneOf(draft.consistentTraining, CONSISTENCY_OPTIONS)) return null;
  if (!Array.isArray(draft.trainingDays) || draft.trainingDays.length < 2 || draft.trainingDays.length > 6 || new Set(draft.trainingDays).size !== draft.trainingDays.length || !draft.trainingDays.every(isDay)) return null;
  const availability: DayAvailability[] = [];
  for (const weekday of draft.trainingDays) {
    const minutes = draft.minutesByDay[weekday];
    if (!isMinutes(minutes)) return null;
    availability.push({ weekday, minutes });
  }
  if (!Array.isArray(draft.equipment) || !draft.equipment.length || !draft.equipment.every((item) => isOneOf(item, EQUIPMENT))) return null;
  if (!Array.isArray(draft.setups) || !draft.setups.every((item) => isOneOf(item, SETUPS))) return null;
  if (!isOneOf(draft.safetyStatus, SAFETY_STATUSES)) return null;
  if (!Array.isArray(draft.restrictionAreas) || !draft.restrictionAreas.every((item) => isOneOf(item, LIMITATIONS))) return null;
  if ((draft.safetyStatus === 'managed' || draft.safetyStatus === 'history') && !draft.restrictionAreas.length) return null;
  if (draft.safetyStatus === 'managed' && !draft.clearedWithRestrictions) return null;
  if (draft.safetyStatus === 'none' && draft.restrictionAreas.length) return null;
  if (!Array.isArray(draft.otherSportDays) || !draft.otherSportDays.every(isDay) || new Set(draft.otherSportDays).size !== draft.otherSportDays.length) return null;
  if (!draft.hasOtherSport && draft.otherSportDays.length) return null;
  if (!Array.isArray(draft.priorityMuscles) || draft.priorityMuscles.length < 1 || draft.priorityMuscles.length > 3 || !draft.priorityMuscles.every(isMuscleGroup) || new Set(draft.priorityMuscles).size !== draft.priorityMuscles.length) return null;
  if (!isOneOf(draft.style, STYLES) || !isOneOf(draft.variety, VARIETIES)) return null;
  if (!isFiniteNumber(draft.averageSleepHours) || draft.averageSleepHours < 3 || draft.averageSleepHours > 14) return null;
  if (!isOneOf(draft.stress, ['low', 'medium', 'high'] as const)) return null;
  if (!MUSCLE_GROUPS.every((muscle) => isOneOf(draft.currentVolumeBands[muscle], VOLUME_BANDS))) return null;
  return {
    schemaVersion: 2,
    adultConfirmed: true,
    consistentTraining: draft.consistentTraining,
    currentVolumeBands: { ...draft.currentVolumeBands },
    availability,
    otherSportDays: draft.hasOtherSport ? [...draft.otherSportDays] : [],
    equipment: [...draft.equipment],
    setups: [...draft.setups],
    safetyStatus: draft.safetyStatus,
    restrictionAreas: [...draft.restrictionAreas],
    clearedWithRestrictions: draft.clearedWithRestrictions,
    priorityMuscles: [...draft.priorityMuscles],
    style: draft.style,
    variety: draft.variety,
    averageSleepHours: draft.averageSleepHours,
    stress: draft.stress
  };
}

function answersFromProfile(profileInput: Profile | Record<string, unknown>): OnboardingAnswers {
  const profile = normalizeProfile(profileInput);
  const currentVolumeBands = emptyVolumeBands();
  for (const muscle of MUSCLE_GROUPS) currentVolumeBands[muscle] = bandForValue(profile.currentVolume.directSetsPerWeek[muscle]);
  const safetyStatus: SafetyStatus = profile.safety.activeSymptoms ? 'active' : profile.safety.medicalRestrictions.length ? 'managed' : profile.safety.historyOnly.length ? 'history' : 'none';
  const restrictionAreas = safetyStatus === 'managed' ? profile.safety.medicalRestrictions.map((item) => item.area) : profile.safety.historyOnly;
  return {
    schemaVersion: 2,
    adultConfirmed: true,
    consistentTraining: consistencyForExperience(profile.experience),
    currentVolumeBands,
    availability: profile.availability,
    otherSportDays: profile.otherSportDays,
    equipment: profile.equipment,
    setups: profile.setups,
    safetyStatus,
    restrictionAreas,
    clearedWithRestrictions: profile.safety.clearedWithRestrictions,
    priorityMuscles: profile.priorityMuscles,
    style: profile.preferences.style,
    variety: profile.preferences.variety,
    averageSleepHours: profile.sleep === 'poor' ? 5.5 : profile.sleep === 'fair' ? 6.5 : 7.5,
    stress: profile.stress
  };
}

function draftFromAnswers(answers: OnboardingAnswers): OnboardingAnswersDraft {
  return {
    schemaVersion: 2,
    adultConfirmed: answers.adultConfirmed,
    consistentTraining: answers.consistentTraining,
    currentVolumeBands: { ...answers.currentVolumeBands },
    trainingDays: answers.availability.map((item) => item.weekday),
    minutesByDay: Object.fromEntries(answers.availability.map((item) => [item.weekday, item.minutes])),
    hasOtherSport: answers.otherSportDays.length > 0,
    otherSportDays: [...answers.otherSportDays],
    equipment: [...answers.equipment],
    setups: [...answers.setups],
    safetyStatus: answers.safetyStatus,
    restrictionAreas: [...answers.restrictionAreas],
    clearedWithRestrictions: answers.clearedWithRestrictions,
    priorityMuscles: [...answers.priorityMuscles],
    style: answers.style,
    variety: answers.variety,
    averageSleepHours: answers.averageSleepHours,
    stress: answers.stress
  };
}

export function createStoredProfileRecord(profile: Profile, answers: OnboardingAnswers, updatedAt = new Date().toISOString()): StoredProfileRecord {
  return { schemaVersion: 4, profile: normalizeProfile(profile), answers, updatedAt };
}

export function parseOnboardingAnswers(value: unknown): OnboardingAnswers | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (raw.schemaVersion !== 2 || raw.adultConfirmed !== true) return null;
  const currentVolumeBands = raw.currentVolumeBands && typeof raw.currentVolumeBands === 'object' ? raw.currentVolumeBands as Record<string, unknown> : {};
  const availability = Array.isArray(raw.availability) ? raw.availability.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object').map((item) => ({ weekday: item.weekday as number, minutes: item.minutes as number })) : [];
  const draft: OnboardingAnswersDraft = {
    schemaVersion: 2,
    adultConfirmed: true,
    consistentTraining: isOneOf(raw.consistentTraining, CONSISTENCY_OPTIONS) ? raw.consistentTraining : '',
    currentVolumeBands: Object.fromEntries(MUSCLE_GROUPS.map((muscle) => [muscle, isOneOf(currentVolumeBands[muscle], VOLUME_BANDS) ? currentVolumeBands[muscle] : 'unknown'])) as Record<MuscleGroup, VolumeBand>,
    trainingDays: availability.map((item) => item.weekday),
    minutesByDay: Object.fromEntries(availability.map((item) => [item.weekday, item.minutes])),
    hasOtherSport: Array.isArray(raw.otherSportDays) && raw.otherSportDays.length > 0,
    otherSportDays: Array.isArray(raw.otherSportDays) ? raw.otherSportDays.filter(isDay) : [],
    equipment: Array.isArray(raw.equipment) ? raw.equipment.filter((item): item is Equipment => isOneOf(item, EQUIPMENT)) : [],
    setups: Array.isArray(raw.setups) ? raw.setups.filter((item): item is SetupRequirement => isOneOf(item, SETUPS)) : [],
    safetyStatus: isOneOf(raw.safetyStatus, SAFETY_STATUSES) ? raw.safetyStatus : '',
    restrictionAreas: Array.isArray(raw.restrictionAreas) ? raw.restrictionAreas.filter((item): item is Limitation => isOneOf(item, LIMITATIONS)) : [],
    clearedWithRestrictions: raw.clearedWithRestrictions === true,
    priorityMuscles: Array.isArray(raw.priorityMuscles) ? raw.priorityMuscles.filter(isMuscleGroup).slice(0, 3) : [],
    style: isOneOf(raw.style, STYLES) ? raw.style : '',
    variety: isOneOf(raw.variety, VARIETIES) ? raw.variety : '',
    averageSleepHours: isFiniteNumber(raw.averageSleepHours) ? raw.averageSleepHours : '',
    stress: isOneOf(raw.stress, ['low', 'medium', 'high'] as const) ? raw.stress : ''
  };
  const answers = completeOnboardingAnswers(draft);
  return answers;
}

export function parseStoredProfileRecord(value: unknown): StoredProfileRecord | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const rawProfile = record.profile && typeof record.profile === 'object' ? record.profile : record.planner && typeof record.planner === 'object' ? record.planner : null;
  if (typeof record.updatedAt !== 'string' || !rawProfile) return null;
  const profile = normalizeProfile(rawProfile as Record<string, unknown>);
  const answers = record.schemaVersion === 4 ? parseOnboardingAnswers(record.answers) ?? answersFromProfile(profile) : answersFromProfile(profile);
  return { schemaVersion: 4, profile, answers, updatedAt: record.updatedAt };
}

function legacyDraft(value: Record<string, unknown>): OnboardingDraftRecord | null {
  const planner = value.planner && typeof value.planner === 'object' ? value.planner as Record<string, unknown> : {};
  const oldAnswers = value.answers && typeof value.answers === 'object' ? value.answers as Record<string, unknown> : {};
  const profile = normalizeProfile(planner);
  const answers = answersFromProfile(profile);
  const draft = draftFromAnswers(answers);
  draft.adultConfirmed = typeof oldAnswers.age === 'number' ? oldAnswers.age >= 18 : true;
  if (oldAnswers.priorityMuscles && Array.isArray(oldAnswers.priorityMuscles)) draft.priorityMuscles = oldAnswers.priorityMuscles.filter(isMuscleGroup).slice(0, 3);
  return { schemaVersion: 2, answers: draft, stepId: 'experience', updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString() };
}

export function parseOnboardingDraft(value: unknown): OnboardingDraftRecord | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (record.schemaVersion === 1) return legacyDraft(record);
  if (record.schemaVersion !== 2 || typeof record.updatedAt !== 'string' || typeof record.stepId !== 'string' || !record.answers || typeof record.answers !== 'object') return null;
  const defaults = createEmptyOnboardingAnswers();
  const raw = record.answers as Record<string, unknown>;
  const answers: OnboardingAnswersDraft = {
    ...defaults,
    ...raw,
    currentVolumeBands: { ...defaults.currentVolumeBands, ...(raw.currentVolumeBands && typeof raw.currentVolumeBands === 'object' ? raw.currentVolumeBands : {}) },
    trainingDays: Array.isArray(raw.trainingDays) ? raw.trainingDays.filter(isDay) : [],
    minutesByDay: raw.minutesByDay && typeof raw.minutesByDay === 'object' ? raw.minutesByDay as Partial<Record<number, number | ''>> : {},
    otherSportDays: Array.isArray(raw.otherSportDays) ? raw.otherSportDays.filter(isDay) : [],
    equipment: Array.isArray(raw.equipment) ? raw.equipment.filter((item): item is Equipment => isOneOf(item, EQUIPMENT)) : [],
    setups: Array.isArray(raw.setups) ? raw.setups.filter((item): item is SetupRequirement => isOneOf(item, SETUPS)) : [],
    restrictionAreas: Array.isArray(raw.restrictionAreas) ? raw.restrictionAreas.filter((item): item is Limitation => isOneOf(item, LIMITATIONS)) : [],
    priorityMuscles: Array.isArray(raw.priorityMuscles) ? raw.priorityMuscles.filter(isMuscleGroup).slice(0, 3) : [],
    adultConfirmed: raw.adultConfirmed === true,
    hasOtherSport: raw.hasOtherSport === true,
    clearedWithRestrictions: raw.clearedWithRestrictions === true
  };
  return { schemaVersion: 2, answers, stepId: record.stepId, updatedAt: record.updatedAt };
}

export function draftFromProfile(profile: Profile): OnboardingAnswersDraft {
  return draftFromAnswers(answersFromProfile(profile));
}
