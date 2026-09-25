import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');

const { buildFoodAnalysisPrompt, parseFoodAnalysis } = await import('../lib/papa-ai.ts');

test('photo prompt calibrates portions and refuses false precision', () => {
  const prompt = buildFoodAnalysisPrompt('2 boterhammen met kaas', 'eiwitrijk');
  assert.match(prompt, /70 g/);
  assert.match(prompt, /250 g cooked potatoes/);
  assert.match(prompt, /Return ONLY valid JSON/);
  assert.match(prompt, /eiwitrijk/);
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
  assert.equal(parseFoodAnalysis({ ...valid, foods: [] }), null);
});

test('portal keeps secrets server-side and protects its food routes', () => {
  const login = read('app/api/papa/login/route.ts');
  const analyze = read('app/api/papa/analyze-food/route.ts');
  const barcode = read('app/api/papa/barcode/[code]/route.ts');
  assert.match(login, /httpOnly:\s*true/);
  assert.match(login, /path:\s*['"]\/['"]/);
  assert.doesNotMatch(analyze, /NEXT_PUBLIC_OPENROUTER/);
  assert.match(analyze, /hasPapaSession/);
  assert.match(barcode, /world\.openfoodfacts\.org\/api\/v3\/product/);
  assert.match(barcode, /User-Agent/);
});
