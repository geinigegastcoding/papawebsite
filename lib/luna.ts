export const LUNA_STORAGE_KEY = 'papa-luna-state-v2';
export const LEGACY_LOG_STORAGE_KEY = 'papa-luna-food-log-v1';
export const LEGACY_TARGET_STORAGE_KEY = 'papa-luna-calorie-target-v1';
export const LEGACY_DIET_STORAGE_KEY = 'papa-luna-diet-rules-v1';

export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = (typeof MEALS)[number];
export type EstimateSex = 'female' | 'male' | 'unspecified';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very-active' | 'athlete';
export type PortionTarget = 'servings' | 'calories' | 'protein';

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Ontbijt',
  lunch: 'Lunch',
  dinner: 'Diner',
  snack: 'Snack'
};

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '☀️',
  lunch: '🥪',
  dinner: '🍲',
  snack: '🍎'
};

export interface LunaFood {
  id: string;
  name: string;
  brand: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  source: string;
  barcode?: string;
  imageUrl?: string;
  icon?: string;
  fiberKnown: boolean;
}

export interface LunaLog {
  id: string;
  date: string;
  meal: MealType;
  food: LunaFood;
  servings: number;
  loggedAtMinutes?: number;
}

export interface SavedMealEntry {
  food: LunaFood;
  servings: number;
}

export interface SavedMeal {
  id: string;
  name: string;
  meal: MealType;
  entries: SavedMealEntry[];
}

export interface LunaProfile {
  onboarded: boolean;
  goal: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  vegetarian: boolean;
  metric: boolean;
  ageYears: number | null;
  heightCm: number | null;
  weightKg: number | null;
  estimateSex: EstimateSex;
  activityLevel: ActivityLevel;
  waterTargetMl: number | null;
}

export interface TargetSnapshot {
  effectiveDate: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface LunaState {
  version: 2;
  profile: LunaProfile;
  logs: LunaLog[];
  savedFoods: LunaFood[];
  savedMeals: SavedMeal[];
  targetHistory: TargetSnapshot[];
  waterMlByDate: Record<string, number>;
  dietRules: string;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface NutritionEstimate {
  profile: LunaProfile;
  restingCalories: number;
  maintenanceCalories: number;
  adjustmentLabel: string;
  floorApplied: boolean;
}

export interface WeeklyDayBudget {
  date: string;
  consumed: number;
  target: number;
  remaining: number;
}

export interface WeeklyBudget {
  weekStart: string;
  weekEnd: string;
  consumed: number;
  target: number;
  remaining: number;
  daysRemaining: number;
  averageRemainingPerDay: number;
  days: WeeklyDayBudget[];
}

export interface DayFitRecommendation {
  food: LunaFood;
  caloriesLeftAfter: number;
  proteinLeftAfter: number;
}

const DEFAULT_PROFILE: LunaProfile = {
  onboarded: false,
  goal: 'Voel je sterker',
  dailyCalories: 2000,
  proteinGrams: 140,
  carbsGrams: 210,
  fatGrams: 56,
  vegetarian: false,
  metric: true,
  ageYears: null,
  heightCm: null,
  weightKg: null,
  estimateSex: 'unspecified',
  activityLevel: 'moderate',
  waterTargetMl: null
};

export function initialLunaState(): LunaState {
  return {
    version: 2,
    profile: { ...DEFAULT_PROFILE },
    logs: [],
    savedFoods: [],
    savedMeals: [],
    targetHistory: [],
    waterMlByDate: {},
    dietRules: ''
  };
}

export function newLunaId(prefix = 'luna'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function numberValue(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return fallback;
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function finiteOrNull(value: unknown): number | null {
  const parsed = numberValue(value, -1);
  return parsed >= 0 ? parsed : null;
}

export function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && todayKey(date) === value;
}

export function shiftDate(date: string, days: number): string {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return todayKey(next);
}

export function displayDate(date: string): string {
  return new Intl.DateTimeFormat('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

export function dateKeys(anchorDate = todayKey(), count = 7): string[] {
  return Array.from({ length: count }, (_, index) => shiftDate(anchorDate, -index));
}

export function mealForHour(hour = new Date().getHours()): MealType {
  if (hour >= 5 && hour <= 10) return 'breakfast';
  if (hour >= 11 && hour <= 14) return 'lunch';
  if (hour >= 17 && hour <= 21) return 'dinner';
  return 'snack';
}

export function mealLabel(meal: MealType): string {
  return MEAL_LABELS[meal];
}

export function nutritionFor(food: LunaFood, servings: number): NutritionTotals {
  const multiplier = Number.isFinite(servings) && servings >= 0 ? servings : 0;
  return {
    calories: Math.round(food.calories * multiplier),
    protein: food.protein * multiplier,
    carbs: food.carbs * multiplier,
    fat: food.fat * multiplier,
    fiber: food.fiber * multiplier
  };
}

export function addTotals(left: NutritionTotals, right: NutritionTotals): NutritionTotals {
  return {
    calories: left.calories + right.calories,
    protein: left.protein + right.protein,
    carbs: left.carbs + right.carbs,
    fat: left.fat + right.fat,
    fiber: left.fiber + right.fiber
  };
}

export function totalsFor(logs: LunaLog[], date = todayKey()): NutritionTotals {
  return logs.filter((log) => log.date === date).reduce((totals, log) => addTotals(totals, nutritionFor(log.food, log.servings)), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

export function averageNutrition(logs: LunaLog[]): NutritionTotals {
  const days = new Set(logs.map((log) => log.date)).size;
  if (!days) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const total = logs.reduce((sum, log) => addTotals(sum, nutritionFor(log.food, log.servings)), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  return { calories: Math.round(total.calories / days), protein: total.protein / days, carbs: total.carbs / days, fat: total.fat / days, fiber: total.fiber / days };
}

export function targetForDate(state: LunaState, date: string): LunaProfile {
  const snapshot = state.targetHistory.filter((item) => item.effectiveDate <= date).sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate)).at(-1);
  return snapshot ? { ...state.profile, ...snapshot } : state.profile;
}

export function targetHistoryAfterUpdate(state: LunaState, profile: LunaProfile, effectiveDate = todayKey()): TargetSnapshot[] {
  if (profile.dailyCalories === state.profile.dailyCalories && profile.proteinGrams === state.profile.proteinGrams && profile.carbsGrams === state.profile.carbsGrams && profile.fatGrams === state.profile.fatGrams) return state.targetHistory;
  const baseline = state.targetHistory.length ? state.targetHistory : [{ effectiveDate: state.logs[0]?.date ?? '0001-01-01', dailyCalories: state.profile.dailyCalories, proteinGrams: state.profile.proteinGrams, carbsGrams: state.profile.carbsGrams, fatGrams: state.profile.fatGrams }];
  return [...baseline.filter((item) => item.effectiveDate !== effectiveDate), { effectiveDate, dailyCalories: profile.dailyCalories, proteinGrams: profile.proteinGrams, carbsGrams: profile.carbsGrams, fatGrams: profile.fatGrams }].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
}

export function weeklyBudget(state: LunaState, anchorDate = todayKey()): WeeklyBudget {
  const anchor = new Date(`${anchorDate}T12:00:00`);
  const mondayOffset = (anchor.getDay() + 6) % 7;
  const weekStart = shiftDate(anchorDate, -mondayOffset);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(weekStart, index);
    const target = targetForDate(state, date).dailyCalories;
    const consumed = totalsFor(state.logs, date).calories;
    return { date, consumed, target, remaining: target - consumed };
  });
  const weekEnd = days.at(-1)?.date ?? weekStart;
  const trackedDates = new Set(state.logs.map((log) => log.date));
  const remaining = days.filter((day) => day.date >= anchorDate || trackedDates.has(day.date)).reduce((sum, day) => sum + day.remaining, 0);
  const daysRemaining = Math.max(1, 7 - mondayOffset);
  return { weekStart, weekEnd, consumed: days.reduce((sum, day) => sum + day.consumed, 0), target: days.reduce((sum, day) => sum + day.target, 0), remaining, daysRemaining, averageRemainingPerDay: Math.round(remaining / daysRemaining), days };
}

export function adjustWater(state: LunaState, date: string, deltaMl: number): LunaState {
  const next = Math.max(0, Math.min(20000, (state.waterMlByDate[date] ?? 0) + deltaMl));
  const waterMlByDate = { ...state.waterMlByDate };
  if (next === 0) delete waterMlByDate[date];
  else waterMlByDate[date] = next;
  return { ...state, waterMlByDate };
}

export function copyLogsToDate(state: LunaState, sourceDate: string, targetDate: string): LunaState {
  const copies = state.logs.filter((log) => log.date === sourceDate).map((log) => ({ ...log, id: newLunaId('log'), date: targetDate, loggedAtMinutes: new Date().getHours() * 60 + new Date().getMinutes() }));
  return { ...state, logs: [...state.logs, ...copies] };
}

export function copyMealToDate(state: LunaState, sourceDate: string, targetDate: string, meal: MealType): LunaState {
  const copies = state.logs.filter((log) => log.date === sourceDate && log.meal === meal).map((log) => ({ ...log, id: newLunaId('log'), date: targetDate, loggedAtMinutes: new Date().getHours() * 60 + new Date().getMinutes() }));
  return { ...state, logs: [...state.logs, ...copies] };
}

export function savedMealTotals(meal: SavedMeal): NutritionTotals {
  return meal.entries.reduce((sum, entry) => addTotals(sum, nutritionFor(entry.food, entry.servings)), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

export function repeatSavedMeal(state: LunaState, meal: SavedMeal, date: string): LunaState {
  const copies = meal.entries.map((entry) => ({ id: newLunaId('log'), date, meal: meal.meal, food: entry.food, servings: entry.servings, loggedAtMinutes: new Date().getHours() * 60 + new Date().getMinutes() }));
  return { ...state, logs: [...state.logs, ...copies] };
}

export function repeatFoods(logs: LunaLog[], limit = 5): Array<{ food: LunaFood; log: LunaLog }> {
  const foods = new Map<string, LunaFood>();
  const result: Array<{ food: LunaFood; log: LunaLog }> = [];
  for (const log of [...logs].reverse()) {
    if (foods.has(log.food.id)) continue;
    foods.set(log.food.id, log.food);
    result.push({ food: log.food, log });
    if (result.length >= limit) break;
  }
  return result;
}

export function hasCompleteFiberData(logs: LunaLog[]): boolean {
  return logs.length > 0 && logs.every((log) => log.food.fiberKnown);
}

export function fitMealsForDay(foods: LunaFood[], totals: NutritionTotals, profile: LunaProfile, limit = 3): DayFitRecommendation[] {
  const caloriesLeft = profile.dailyCalories - totals.calories;
  if (caloriesLeft <= 0) return [];
  const proteinLeft = Math.max(0, profile.proteinGrams - totals.protein);
  return [...new Map(foods.map((food) => [food.id, food])).values()]
    .filter((food) => food.calories <= caloriesLeft)
    .map((food) => ({ food, caloriesLeftAfter: caloriesLeft - food.calories, proteinLeftAfter: Math.max(0, proteinLeft - food.protein), score: Math.abs(caloriesLeft - food.calories) + Math.max(0, proteinLeft - food.protein) * 2 }))
    .sort((a, b) => a.score - b.score || b.food.protein - a.food.protein)
    .slice(0, limit)
    .map(({ food, caloriesLeftAfter, proteinLeftAfter }) => ({ food, caloriesLeftAfter, proteinLeftAfter }));
}

export function topContributors(logs: LunaLog[], limit = 5): Array<{ food: LunaFood; calories: number; servings: number }> {
  const grouped = new Map<string, { food: LunaFood; calories: number; servings: number }>();
  for (const log of logs) {
    const current = grouped.get(log.food.id) ?? { food: log.food, calories: 0, servings: 0 };
    current.calories += nutritionFor(log.food, log.servings).calories;
    current.servings += log.servings;
    grouped.set(log.food.id, current);
  }
  return [...grouped.values()].sort((a, b) => b.calories - a.calories).slice(0, limit);
}

export function estimateNutrition(profile: Pick<LunaProfile, 'goal' | 'ageYears' | 'heightCm' | 'weightKg' | 'estimateSex' | 'activityLevel' | 'vegetarian'>): NutritionEstimate | null {
  if (!profile.ageYears || !profile.heightCm || !profile.weightKg) return null;
  const sexConstant = profile.estimateSex === 'male' ? 5 : profile.estimateSex === 'female' ? -161 : -78;
  const restingCalories = Math.round(10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.ageYears + sexConstant);
  const multiplier: Record<ActivityLevel, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, 'very-active': 1.725, athlete: 1.9 };
  const maintenanceCalories = Math.round(restingCalories * multiplier[profile.activityLevel]);
  const adjustment = profile.goal.toLowerCase().includes('afvallen') || profile.goal.toLowerCase().includes('lose') ? 0.9 : profile.goal.toLowerCase().includes('aankomen') || profile.goal.toLowerCase().includes('gain') ? 1.08 : 1;
  const requestedCalories = Math.round(maintenanceCalories * adjustment / 10) * 10;
  const dailyCalories = Math.max(1200, Math.min(6000, requestedCalories));
  const proteinGrams = Math.round(profile.weightKg * (profile.goal.toLowerCase().includes('sterk') || profile.goal.toLowerCase().includes('gain') ? 1.4 : 1.2));
  const fatGrams = Math.round(dailyCalories * 0.3 / 9);
  const carbsGrams = Math.max(0, Math.round((dailyCalories - proteinGrams * 4 - fatGrams * 9) / 4));
  return {
    profile: { ...DEFAULT_PROFILE, ...profile, onboarded: true, dailyCalories, proteinGrams, carbsGrams, fatGrams },
    restingCalories,
    maintenanceCalories,
    adjustmentLabel: adjustment < 1 ? 'rustig onder onderhoud' : adjustment > 1 ? 'rustig boven onderhoud' : 'onderhoud als startpunt',
    floorApplied: requestedCalories < 1200
  };
}

function normalizeFood(value: unknown): LunaFood | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 160) : '';
  const calories = numberValue(raw.calories, -1);
  if (!name || calories < 0) return null;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : newLunaId('food'),
    name,
    brand: typeof raw.brand === 'string' ? raw.brand.slice(0, 120) : '',
    servingSize: typeof raw.servingSize === 'string' ? raw.servingSize.slice(0, 80) : '1 portie',
    calories: Math.round(calories),
    protein: numberValue(raw.protein),
    carbs: numberValue(raw.carbs),
    fat: numberValue(raw.fat),
    fiber: numberValue(raw.fiber),
    source: typeof raw.source === 'string' ? raw.source.slice(0, 120) : 'Handmatig',
    barcode: typeof raw.barcode === 'string' ? raw.barcode.slice(0, 20) : undefined,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : undefined,
    icon: typeof raw.icon === 'string' ? raw.icon : undefined,
    fiberKnown: raw.fiberKnown !== false
  };
}

function normalizeMeal(value: unknown): MealType {
  return MEALS.includes(value as MealType) ? value as MealType : mealForHour();
}

function normalizeProfile(value: unknown): LunaProfile {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const activity = raw.activityLevel as ActivityLevel;
  const sex = raw.estimateSex as EstimateSex;
  return {
    ...DEFAULT_PROFILE,
    onboarded: raw.onboarded === true,
    goal: typeof raw.goal === 'string' && raw.goal.trim() ? raw.goal.slice(0, 80) : DEFAULT_PROFILE.goal,
    dailyCalories: Math.max(500, Math.min(10000, Math.round(numberValue(raw.dailyCalories, 2000)))),
    proteinGrams: Math.max(0, Math.round(numberValue(raw.proteinGrams, 140))),
    carbsGrams: Math.max(0, Math.round(numberValue(raw.carbsGrams, 210))),
    fatGrams: Math.max(0, Math.round(numberValue(raw.fatGrams, 56))),
    vegetarian: raw.vegetarian === true,
    metric: raw.metric !== false,
    ageYears: finiteOrNull(raw.ageYears),
    heightCm: finiteOrNull(raw.heightCm),
    weightKg: finiteOrNull(raw.weightKg),
    estimateSex: sex === 'female' || sex === 'male' || sex === 'unspecified' ? sex : 'unspecified',
    activityLevel: activity === 'sedentary' || activity === 'light' || activity === 'moderate' || activity === 'very-active' || activity === 'athlete' ? activity : 'moderate',
    waterTargetMl: finiteOrNull(raw.waterTargetMl)
  };
}

export function normalizeLunaState(value: unknown): LunaState | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const logs = Array.isArray(raw.logs) ? raw.logs.map((item): LunaLog | null => {
    if (!item || typeof item !== 'object') return null;
    const log = item as Record<string, unknown>;
    const food = normalizeFood(log.food);
    if (!food || !isDateKey(log.date)) return null;
    const loggedAtMinutes = finiteOrNull(log.loggedAtMinutes);
    return { id: typeof log.id === 'string' ? log.id : newLunaId('log'), date: log.date, meal: normalizeMeal(log.meal), food, servings: Math.max(.01, numberValue(log.servings, 1)), ...(loggedAtMinutes === null ? {} : { loggedAtMinutes }) };
  }).filter((item): item is LunaLog => item !== null) : [];
  const savedFoods = Array.isArray(raw.savedFoods) ? raw.savedFoods.map(normalizeFood).filter((item): item is LunaFood => item !== null).slice(0, 500) : [];
  const savedMeals = Array.isArray(raw.savedMeals) ? raw.savedMeals.map((item) => {
    if (!item || typeof item !== 'object') return null;
    const meal = item as Record<string, unknown>;
    const entries = Array.isArray(meal.entries) ? meal.entries.map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const rawEntry = entry as Record<string, unknown>;
      const food = normalizeFood(rawEntry.food);
      return food ? { food, servings: Math.max(.01, numberValue(rawEntry.servings, 1)) } : null;
    }).filter((entry): entry is SavedMealEntry => entry !== null).slice(0, 20) : [];
    if (!entries.length || typeof meal.name !== 'string') return null;
    return { id: typeof meal.id === 'string' ? meal.id : newLunaId('meal'), name: meal.name.trim().slice(0, 80), meal: normalizeMeal(meal.meal), entries };
  }).filter((item): item is SavedMeal => item !== null).slice(0, 500) : [];
  const water = raw.waterMlByDate && typeof raw.waterMlByDate === 'object' ? Object.fromEntries(Object.entries(raw.waterMlByDate).filter(([date, amount]) => isDateKey(date) && Number.isFinite(Number(amount))).map(([date, amount]) => [date, Math.max(0, Math.min(20000, Math.round(Number(amount))))])) : {};
  const targetHistory = Array.isArray(raw.targetHistory) ? raw.targetHistory.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object')).map((item) => ({ effectiveDate: isDateKey(item.effectiveDate) ? item.effectiveDate : '0001-01-01', dailyCalories: Math.round(numberValue(item.dailyCalories, 2000)), proteinGrams: Math.round(numberValue(item.proteinGrams, 140)), carbsGrams: Math.round(numberValue(item.carbsGrams, 210)), fatGrams: Math.round(numberValue(item.fatGrams, 56)) })).slice(0, 500) : [];
  return { version: 2, profile: normalizeProfile(raw.profile), logs, savedFoods, savedMeals, targetHistory, waterMlByDate: water as Record<string, number>, dietRules: typeof raw.dietRules === 'string' ? raw.dietRules.slice(0, 500) : '' };
}

export function migrateLegacyState(logsValue: unknown, targetValue: unknown, dietRules: unknown): LunaState {
  const state = initialLunaState();
  state.profile.dailyCalories = Math.max(500, Math.min(10000, Math.round(numberValue(targetValue, 2000))));
  state.dietRules = typeof dietRules === 'string' ? dietRules.slice(0, 500) : '';
  if (Array.isArray(logsValue)) {
    state.logs = logsValue.map((item): LunaLog | null => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Record<string, unknown>;
      const food = normalizeFood({ id: raw.id, name: raw.name, calories: raw.calories, protein: raw.protein, carbs: raw.carbs, fat: raw.fat, fiber: raw.fiber, source: raw.source, servingSize: raw.portion });
      if (!food || !isDateKey(raw.date)) return null;
      return { id: typeof raw.id === 'string' ? raw.id : newLunaId('log'), date: raw.date, meal: mealForHour(new Date(typeof raw.createdAt === 'string' ? raw.createdAt : `${raw.date}T12:00:00`).getHours()), food, servings: 1 };
    }).filter((item): item is LunaLog => item !== null);
  }
  return state;
}

function recipe(id: string, meal: MealType, name: string, servingSize: string, calories: number, protein: number, carbs: number, fat: number, fiber: number, icon: string): LunaFood {
  return { id: `recipe-${meal}-${id}`, name, brand: 'Luna keuken', servingSize, calories, protein, carbs, fat, fiber, source: 'Luna recepten', icon, fiberKnown: true };
}

export const sampleFoods: LunaFood[] = [
  { id: 'sample-yogurt', name: 'Griekse yoghurt', brand: 'Naturel', servingSize: '1 kom (200 g)', calories: 146, protein: 20, carbs: 8, fat: 4, fiber: 0, source: 'Luna basis', fiberKnown: true, icon: '🥣' },
  { id: 'sample-oats', name: 'Bessen-havermout', brand: 'Luna keuken', servingSize: '1 kom', calories: 380, protein: 16, carbs: 57, fat: 11, fiber: 9, source: 'Luna basis', fiberKnown: true, icon: '🫐' },
  { id: 'sample-wrap', name: 'Kip crunch wrap', brand: 'Luna keuken', servingSize: '1 wrap', calories: 520, protein: 34, carbs: 48, fat: 21, fiber: 5, source: 'Luna basis', fiberKnown: true, icon: '🌯' },
  { id: 'sample-banana', name: 'Banaan', brand: 'Vers', servingSize: '1 middelgrote', calories: 105, protein: 1.3, carbs: 27, fat: .4, fiber: 3.1, source: 'Luna basis', fiberKnown: true, icon: '🍌' },
  { id: 'sample-shake', name: 'Proteïneshake', brand: 'Vanille', servingSize: '1 scoop', calories: 180, protein: 25, carbs: 8, fat: 4, fiber: 1, source: 'Luna basis', fiberKnown: true, icon: '🥤' }
];

export const recipeFoods: LunaFood[] = [
  recipe('001', 'breakfast', 'Greek yoghurt met bessen en haver', '1 kom', 380, 28, 48, 9, 9, '🫐'),
  recipe('002', 'breakfast', 'Appel-kaneel overnight oats', '1 pot', 360, 20, 55, 8, 10, '🍎'),
  recipe('003', 'breakfast', 'Banaan-pindakaas proteïne oats', '1 kom', 440, 29, 53, 14, 9, '🥜'),
  recipe('004', 'breakfast', 'Spinazie-feta eierscramble', '1 bord', 330, 27, 10, 20, 4, '🍳'),
  recipe('005', 'breakfast', 'Avocado-ei volkoren toast', '2 sneetjes', 410, 20, 35, 21, 9, '🥑'),
  recipe('006', 'breakfast', 'Skyr perzik granola bowl', '1 kom', 370, 29, 51, 7, 7, '🍑'),
  recipe('007', 'breakfast', 'Bessen proteïne pancakes', '3 pancakes', 390, 31, 45, 9, 7, '🥞'),
  recipe('008', 'breakfast', 'Linzenschakshuka', '1 pan', 450, 27, 55, 14, 14, '🍅'),
  recipe('009', 'lunch', 'Kip-quinoa rainbow bowl', '1 kom', 520, 42, 55, 16, 11, '🥗'),
  recipe('010', 'lunch', 'Tonijn-wittebonensalade', '1 kom', 430, 39, 35, 16, 11, '🐟'),
  recipe('011', 'lunch', 'Linzen-feta graan bowl', '1 kom', 480, 24, 61, 16, 15, '🌿'),
  recipe('012', 'lunch', 'Kikkererwt tzatziki pita', '1 bord', 450, 20, 57, 14, 13, '🫓'),
  recipe('013', 'lunch', 'Zalm bruine-rijst sushi bowl', '1 kom', 550, 37, 58, 20, 8, '🍣'),
  recipe('014', 'lunch', 'Kip-linzensoep', '1 kom', 430, 38, 43, 11, 13, '🍲'),
  recipe('015', 'lunch', 'Tofu edamame soba bowl', '1 kom', 510, 28, 64, 16, 10, '🥢'),
  recipe('016', 'lunch', 'Kip pesto volkoren pastasalade', '1 kom', 520, 40, 52, 18, 9, '🍝'),
  recipe('017', 'dinner', 'Citroen-kruiden kip met quinoa', '1 bord', 540, 48, 48, 18, 9, '🍗'),
  recipe('018', 'dinner', 'Zalm met zoete aardappel en broccoli', '1 bord', 560, 40, 47, 23, 11, '🐟'),
  recipe('019', 'dinner', 'Kalkoenballetjes met volkoren spaghetti', '1 kom', 570, 43, 65, 15, 12, '🍝'),
  recipe('020', 'dinner', 'Tofu roerbak met zilvervliesrijst', '1 kom', 520, 27, 68, 17, 13, '🥦'),
  recipe('021', 'dinner', 'Linzencurry met kokos en rijst', '1 kom', 540, 22, 78, 17, 16, '🍛'),
  recipe('022', 'dinner', 'Kip-kikkererwt tomatenpan', '1 pan', 510, 45, 44, 17, 13, '🍅'),
  recipe('023', 'dinner', 'Kabeljauw met gerst en groente', '1 bord', 500, 43, 50, 15, 12, '🐟'),
  recipe('024', 'dinner', 'Kikkererwt spinaziecurry met quinoa', '1 kom', 510, 21, 72, 16, 16, '🥬'),
  recipe('025', 'snack', 'Greek yoghurt berry crunch', '1 kom', 220, 20, 25, 6, 5, '🫐'),
  recipe('026', 'snack', 'Appel met pindakaas', '1 appel', 210, 6, 29, 9, 5, '🍎'),
  recipe('027', 'snack', 'Cottage cheese met ananas', '1 bakje', 190, 22, 20, 4, 2, '🍍'),
  recipe('028', 'snack', 'Hummus-wortel komkommerbox', '1 box', 180, 6, 24, 8, 7, '🥕'),
  recipe('029', 'snack', 'Edamame met zeezout', '1 kom', 190, 17, 15, 8, 8, '🫛'),
  recipe('030', 'snack', 'Cacao chia proteïnepudding', '1 kom', 230, 20, 18, 10, 10, '🍫'),
  recipe('031', 'snack', 'Bessen-kefir smoothie', '1 glas', 220, 18, 28, 4, 5, '🥤'),
  recipe('032', 'snack', 'Gerookte zalm komkommerrolletjes', '6 rolletjes', 170, 17, 5, 9, 1, '🥒'),
  recipe('033', 'breakfast', 'Tomaat-witteboon toast', '2 sneetjes', 380, 19, 53, 10, 11, '🍅'),
  recipe('034', 'breakfast', 'Hartige cottage-cheese bowl', '1 kom', 330, 29, 25, 15, 6, '🥣'),
  recipe('035', 'lunch', 'Mediterrane tonijn-couscous bowl', '1 kom', 500, 37, 57, 14, 8, '🥗'),
  recipe('036', 'lunch', 'Falafel tabouleh bowl', '1 kom', 500, 19, 68, 17, 15, '🧆'),
  recipe('037', 'dinner', 'Kip fajita sheet-pan', '1 bord', 500, 46, 41, 17, 9, '🌶️'),
  recipe('038', 'dinner', 'Rode-linzen dal met bloemkool', '1 kom', 500, 24, 68, 15, 18, '🥦'),
  recipe('039', 'snack', 'Kip salsa lettuce cups', '4 cups', 180, 23, 8, 6, 2, '🥬'),
  recipe('040', 'snack', 'Kiwi chia yoghurt pot', '1 pot', 190, 18, 20, 6, 7, '🥝')
];

export function allFoodOptions(state: LunaState): LunaFood[] {
  return [...state.savedFoods, ...sampleFoods, ...recipeFoods];
}
