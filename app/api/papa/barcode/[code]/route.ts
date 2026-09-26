import { hasPapaSession } from '@/lib/papa-auth';

export const dynamic = 'force-dynamic';

type Nutriments = Record<string, unknown>;

function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function firstNumber(values: unknown[]): number | null {
  for (const value of values) {
    const parsed = number(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function servingGrams(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = value.replace(',', '.').match(/(\d+(?:\.\d+)?)\s*g\b/i);
  return match ? Number(match[1]) : null;
}

function kcalPer100g(nutriments: Nutriments): number | null {
  const direct = firstNumber([nutriments['energy-kcal_100g'], nutriments['energy-kcal_value']]);
  if (direct !== null) return direct;
  const kilojoules = firstNumber([nutriments['energy_100g'], nutriments['energy_value']]);
  return kilojoules === null ? null : kilojoules / 4.184;
}

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!(await hasPapaSession())) return jsonResponse({ message: 'Niet ingelogd.' }, 401);
  const code = (await params).code;
  if (!/^\d{8,14}$/.test(code)) return jsonResponse({ message: 'Ongeldige barcode.' }, 400);

  const fields = ['code', 'product_name', 'product_name_nl', 'generic_name', 'brands', 'quantity', 'serving_size', 'image_front_small_url', 'nutriments', 'allergens_tags', 'ingredients_text', 'ingredients_text_nl', 'labels_tags', 'categories_tags'].join(',');
  const endpoints = [
    `https://world.openfoodfacts.org/api/v3/product/${code}?product_type=food&cc=nl&lc=nl&fields=${fields}`,
    `https://nl.openfoodfacts.org/api/v2/product/${code}.json?product_type=food&cc=nl&lc=nl&fields=${fields}`
  ];
  let product: Record<string, unknown> | undefined;
  let sawNotFound = false;
  for (const endpoint of endpoints) {
    try {
      const upstream = await fetch(endpoint, {
        headers: { 'User-Agent': 'MagisPapaPortal/0.1 (https://magisintel.nl; contact: jgmagis@hotmail.com)' },
        cache: 'no-store',
        signal: AbortSignal.timeout(7000)
      });
      if (upstream.status === 404) {
        sawNotFound = true;
        continue;
      }
      if (!upstream.ok) continue;
      const payload = await upstream.json().catch(() => null) as { product?: Record<string, unknown>; status?: number } | null;
      if (payload?.product) {
        product = payload.product;
        break;
      }
    } catch {
      // Try the regional API before returning a temporary database error.
    }
  }
  if (!product) return jsonResponse({ message: sawNotFound ? 'Deze barcode staat niet in Open Food Facts.' : 'De productdatabase is tijdelijk niet bereikbaar.' }, sawNotFound ? 404 : 502);
  if (!product) return jsonResponse({ message: 'Geen productgegevens gevonden voor deze barcode.' }, 404);

  const nutriments = product.nutriments && typeof product.nutriments === 'object' ? product.nutriments as Nutriments : {};
  const result = {
    barcode: code,
    name: String(product.product_name_nl || product.product_name || product.generic_name || `Product ${code}`),
    brand: typeof product.brands === 'string' ? product.brands : '',
    quantity: typeof product.quantity === 'string' ? product.quantity : '',
    servingSize: typeof product.serving_size === 'string' ? product.serving_size : '',
    servingGrams: servingGrams(product.serving_size),
    image: typeof product.image_front_small_url === 'string' ? product.image_front_small_url : null,
    per100g: {
      calories: kcalPer100g(nutriments),
      protein: firstNumber([nutriments.proteins_100g, nutriments.proteins]),
      carbs: firstNumber([nutriments.carbohydrates_100g, nutriments.carbohydrates]),
      fat: firstNumber([nutriments.fat_100g, nutriments.fat]),
      fiber: firstNumber([nutriments.fiber_100g, nutriments.fiber]),
      salt: firstNumber([nutriments.salt_100g, nutriments.salt])
    },
    allergens: Array.isArray(product.allergens_tags) ? product.allergens_tags.filter((item): item is string => typeof item === 'string').slice(0, 20) : [],
    labels: Array.isArray(product.labels_tags) ? product.labels_tags.filter((item): item is string => typeof item === 'string').slice(0, 20) : [],
    ingredients: String(product.ingredients_text_nl || product.ingredients_text || ''),
    source: 'Open Food Facts',
    sourceUrl: `https://world.openfoodfacts.org/product/${code}`
  };

  return jsonResponse({ product: result });
}
