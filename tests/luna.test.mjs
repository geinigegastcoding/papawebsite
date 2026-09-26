import assert from 'node:assert/strict';
import test from 'node:test';

const {
  addTotals,
  averageNutrition,
  estimateNutrition,
  fitMealsForDay,
  initialLunaState,
  migrateLegacyState,
  nutritionFor,
  sampleFoods,
  savedMealTotals,
  targetHistoryAfterUpdate,
  totalsFor,
  topContributors,
  weeklyBudget
} = await import('../lib/luna.ts');

const today = '2026-09-26';
const food = sampleFoods[0];
const log = { id: 'log-1', date: today, meal: 'breakfast', food, servings: 2 };

test('Luna totals are portion-aware and preserve the reason users log food', () => {
  const totals = totalsFor([log], today);
  assert.equal(totals.calories, food.calories * 2);
  assert.equal(totals.protein, food.protein * 2);
  assert.deepEqual(addTotals(totals, nutritionFor(food, 1)), nutritionFor(food, 3));
});

test('Luna target updates are date-aware instead of rewriting history', () => {
  const state = initialLunaState();
  const profile = { ...state.profile, dailyCalories: 1800, proteinGrams: 150 };
  const history = targetHistoryAfterUpdate(state, profile, today);
  assert.equal(history.at(-1)?.effectiveDate, today);
  assert.equal(history.at(-1)?.dailyCalories, 1800);
  assert.equal(history.at(-1)?.proteinGrams, 150);
});

test('Luna weekly budget exposes remaining calories for flexible planning', () => {
  const state = { ...initialLunaState(), logs: [log] };
  const budget = weeklyBudget(state, today);
  assert.equal(budget.days.length, 7);
  assert.equal(budget.consumed, food.calories * 2);
  assert.ok(budget.averageRemainingPerDay > 0);
});

test('Luna recommendations stay within the remaining day budget', () => {
  const profile = { ...initialLunaState().profile, dailyCalories: 500, proteinGrams: 40 };
  const recommendations = fitMealsForDay(sampleFoods, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }, profile);
  assert.ok(recommendations.length > 0);
  assert.ok(recommendations.every((item) => item.food.calories <= 500));
});

test('Luna estimate returns a transparent target and macro split', () => {
  const estimate = estimateNutrition({ goal: 'Afvallen', ageYears: 42, heightCm: 178, weightKg: 92, estimateSex: 'male', activityLevel: 'moderate', vegetarian: false });
  assert.ok(estimate);
  assert.ok(estimate.profile.dailyCalories >= 1200);
  assert.ok(estimate.profile.proteinGrams > 0);
  assert.match(estimate.adjustmentLabel, /onderhoud/);
});

test('Luna migration keeps legacy logs usable in the richer model', () => {
  const migrated = migrateLegacyState([{ id: 'old-1', date: today, name: 'Banaan', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, portion: '1 stuk', source: 'Handmatig' }], '1900', 'eiwitrijk');
  assert.equal(migrated.profile.dailyCalories, 1900);
  assert.equal(migrated.dietRules, 'eiwitrijk');
  assert.equal(migrated.logs[0]?.food.name, 'Banaan');
  assert.equal(migrateLegacyState(null, null, null).profile.dailyCalories, 2000);
});

test('Luna insights aggregate top contributors and daily averages', () => {
  const logs = [log, { ...log, id: 'log-2', date: '2026-09-25', servings: 1 }];
  assert.equal(topContributors(logs, 1)[0]?.servings, 3);
  assert.equal(averageNutrition(logs).calories, Math.round(food.calories * 3 / 2));
  const meal = { id: 'meal-1', name: 'Ontbijt', meal: 'breakfast', entries: [{ food, servings: 2 }] };
  assert.equal(savedMealTotals(meal).calories, food.calories * 2);
});
