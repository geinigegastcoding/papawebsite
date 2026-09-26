import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');

const { buildFoodAnalysisPrompt, DEFAULT_FOOD_ANALYSIS_MODELS, FOOD_ANALYSIS_RESPONSE_FORMAT, getFoodAnalysisModels, parseFoodAnalysis } = await import('../lib/papa-ai.ts');

test('photo prompt calibrates portions and refuses false precision', () => {
  const prompt = buildFoodAnalysisPrompt('2 boterhammen met kaas', 'eiwitrijk');
  assert.match(prompt, /70 g/);
  assert.match(prompt, /250 g cooked potatoes/);
  assert.match(prompt, /Return ONLY valid JSON/);
  assert.match(prompt, /eiwitrijk/);
  assert.equal(FOOD_ANALYSIS_RESPONSE_FORMAT.type, 'json_schema');
  assert.equal(FOOD_ANALYSIS_RESPONSE_FORMAT.json_schema.strict, true);
  assert.equal(FOOD_ANALYSIS_RESPONSE_FORMAT.json_schema.schema.additionalProperties, false);
});

test('AI response parser accepts a complete estimate and rejects unsafe incomplete data', () => {
  const valid = parseFoodAnalysis({
    estimatedCalories: 600,
    calorieRange: { low: 520, high: 690 },
    proteinGrams: 42,
    carbGrams: 58,
    fatGrams: 18,
    fiberGrams: 9,
    foods: [{ name: 'aardappelen', grams: 250, calories: 190, rationale: 'zichtbare portie op het bord' }],
    confidence: 'medium',
    assumptions: ['10 g olie aangenomen'],
    dietFit: 'uncertain',
    dietReason: 'De expliciete dieetregels geven geen harde uitsluiting.',
    needsReview: true
  });
  assert.equal(valid?.estimatedCalories, 600);
  assert.equal(valid?.dietFit, 'uncertain');
  assert.equal(parseFoodAnalysis({ ...valid, calorieRange: { low: 700, high: 800 } }), null);
  const incompleteProviderResult = parseFoodAnalysis({ ...valid, foods: [] });
  assert.equal(incompleteProviderResult?.estimatedCalories, 600);
  assert.equal(incompleteProviderResult?.needsReview, true);

  const providerShapeVariant = parseFoodAnalysis({
    ...valid,
    estimatedCalories: '600',
    calorieRange: { low: '520', high: '690' },
    proteinGrams: '42',
    carbGrams: '58',
    fatGrams: '18',
    fiberGrams: '9',
    foods: [{ name: 'aardappelen', grams: '250', calories: '190', rationale: 'zichtbare portie op het bord' }],
    confidence: undefined,
    dietFit: undefined,
    dietReason: undefined
  });
  assert.equal(providerShapeVariant?.confidence, 'low');
  assert.equal(providerShapeVariant?.dietFit, 'uncertain');
  assert.equal(providerShapeVariant?.needsReview, true);

  const freeProviderShape = parseFoodAnalysis({
    calories: 640,
    calorie_range: { minimum: 480, maximum: 820 },
    ingredients: [{ item: 'couscoussalade', amount: '350', kcal: '640' }]
  });
  assert.equal(freeProviderShape?.estimatedCalories, 640);
  assert.equal(freeProviderShape?.foods[0]?.name, 'couscoussalade');
  assert.equal(freeProviderShape?.needsReview, true);

  const nestedFreeShape = parseFoodAnalysis({
    analysis: {
      estimated_calories: 720,
      calorie_range_low: 540,
      calorie_range_high: 900,
      protein_g: 32,
      carb_grams: 84,
      fat_g: 25,
      fiber_g: 8,
      components: { maaltijd: { grams: 350, kcal: 720 } },
      needs_review: true
    }
  });
  assert.equal(nestedFreeShape?.estimatedCalories, 720);
  assert.equal(nestedFreeShape?.foods[0]?.calories, 720);
});

test('photo analysis has a bounded free-model fallback chain', () => {
  assert.equal(DEFAULT_FOOD_ANALYSIS_MODELS.length, 8);
  assert.equal(DEFAULT_FOOD_ANALYSIS_MODELS[0], 'openrouter/free');
  assert.deepEqual(getFoodAnalysisModels('custom/primary:free', 'backup/one:free,backup/one:free,backup/two:free,backup/three:free'), [
    'custom/primary:free',
    'backup/one:free',
    'backup/two:free',
    'backup/three:free',
    'openrouter/free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'qwen/qwen3.8-27b:free'
  ]);
});

test('portal keeps secrets server-side and protects its food routes', () => {
  const login = read('app/api/papa/login/route.ts');
  const analyze = read('app/api/papa/analyze-food/route.ts');
  const ai = read('lib/papa-ai.ts');
  const barcode = read('app/api/papa/barcode/[code]/route.ts');
  assert.match(login, /httpOnly:\s*true/);
  assert.match(login, /path:\s*['"]\/['"]/);
  assert.doesNotMatch(analyze, /NEXT_PUBLIC_OPENROUTER/);
  assert.match(analyze, /hasPapaSession/);
  assert.match(analyze, /JSON_MODE_MODELS/);
  assert.match(analyze, /response_format:\s*\{ type: 'json_object' \}/);
  assert.match(analyze, /AbortSignal\.timeout/);
  assert.match(analyze, /ANALYSIS_DEADLINE_MS/);
  assert.match(analyze, /OPENROUTER_API_KEY_2/);
  assert.match(analyze, /OPENROUTER_API_KEY_3/);
  assert.match(analyze, /OPENROUTER_API_KEY_6/);
  assert.match(analyze, /trying next model/);
  assert.match(ai, /dietFit: \{ type: 'string', enum: \['yes', 'no', 'uncertain'\] \}/);
  assert.match(barcode, /world\.openfoodfacts\.org\/api\/v3\/product/);
  assert.match(barcode, /nl\.openfoodfacts\.org\/api\/v2\/product/);
  assert.match(barcode, /User-Agent/);
});
