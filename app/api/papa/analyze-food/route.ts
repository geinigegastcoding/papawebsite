import { hasPapaSession } from '@/lib/papa-auth';
import { buildFoodAnalysisPrompt, parseFoodAnalysis } from '@/lib/papa-ai';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + 0x8000, bytes.length)));
  return btoa(binary);
}

function modelText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter((part): part is { type: 'text'; text: string } => Boolean(part && typeof part === 'object' && (part as { type?: unknown }).type === 'text' && typeof (part as { text?: unknown }).text === 'string')).map((part) => part.text).join('\n');
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!(await hasPapaSession())) return jsonResponse({ message: 'Niet ingelogd.' }, 401);
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return jsonResponse({ message: 'De foto-analyse is nog niet geconfigureerd.' }, 503);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ message: 'De upload kon niet worden gelezen.' }, 400);
  }

  const file = formData.get('image');
  if (!(file instanceof File)) return jsonResponse({ message: 'Kies eerst een foto.' }, 400);
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return jsonResponse({ message: 'Gebruik een JPG-, PNG-, WebP- of GIF-foto.' }, 415);
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) return jsonResponse({ message: 'De foto moet kleiner zijn dan 8 MB.' }, 413);

  const description = typeof formData.get('description') === 'string' ? String(formData.get('description')).trim().slice(0, 500) : '';
  const diet = typeof formData.get('diet') === 'string' ? String(formData.get('diet')).trim().slice(0, 500) : '';
  const model = process.env.OPENROUTER_MODEL?.trim() || 'qwen/qwen3.8-27b:free';
  const image = `data:${file.type};base64,${toBase64(await file.arrayBuffer())}`;

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://magisintel.nl',
      'X-Title': 'Papa voedingshulp'
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 1800,
      messages: [
        { role: 'system', content: buildFoodAnalysisPrompt(description, diet) },
        { role: 'user', content: [{ type: 'text', text: 'Analyse this food photo and return the required JSON only.' }, { type: 'image_url', image_url: { url: image } }] }
      ]
    })
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    console.error('OpenRouter food analysis failed', upstream.status, detail.slice(0, 300));
    return jsonResponse({ message: upstream.status === 429 ? 'De gratis AI is even druk. Probeer het zo opnieuw.' : 'De foto-analyse kon niet worden uitgevoerd.' }, 502);
  }

  const payload = await upstream.json().catch(() => null) as { choices?: Array<{ message?: { content?: unknown } }> } | null;
  const rawText = modelText(payload?.choices?.[0]?.message?.content);
  const result = parseFoodAnalysis(extractJson(rawText));
  if (!result) return jsonResponse({ message: 'De AI gaf geen bruikbare voedingsschatting terug. Probeer een duidelijkere foto.' }, 502);
  return jsonResponse({ result, model });
}
