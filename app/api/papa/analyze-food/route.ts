import { hasPapaSession } from '@/lib/papa-auth';
import { buildFoodAnalysisPrompt, getFoodAnalysisModels, parseFoodAnalysis } from '@/lib/papa-ai';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const OPENROUTER_KEY_NAMES = [
  'OPENROUTER_API_KEY',
  'OPENROUTER_API_KEY_2',
  'OPENROUTER_API_KEY_3',
  'OPENROUTER_API_KEY_4',
  'OPENROUTER_API_KEY_5',
  'OPENROUTER_API_KEY_6'
] as const;
const RETRYABLE_UPSTREAM_STATUSES = new Set([401, 403, 408, 425, 429, 500, 502, 503, 504]);

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
  if (content && typeof content === 'object' && !Array.isArray(content)) {
    const objectContent = content as { parsed?: unknown; json?: unknown; text?: unknown; content?: unknown; value?: unknown };
    for (const candidate of [objectContent.text, objectContent.value, objectContent.content, objectContent.parsed, objectContent.json]) {
      const text = modelText(candidate);
      if (text) return text;
    }
    return JSON.stringify(content);
  }
  if (!Array.isArray(content)) return '';
  return content.map((part) => modelText(part)).filter(Boolean).join('\n');
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
  } catch {
    // Some providers add a short sentence before or after the JSON object.
  }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!(await hasPapaSession())) return jsonResponse({ message: 'Niet ingelogd.' }, 401);

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
  const models = getFoodAnalysisModels(process.env.OPENROUTER_MODEL, process.env.OPENROUTER_MODELS);
  const apiKeys = OPENROUTER_KEY_NAMES.map((name) => process.env[name]?.trim()).filter((key): key is string => Boolean(key));
  if (apiKeys.length === 0) return jsonResponse({ message: 'De foto-analyse is nog niet geconfigureerd.' }, 503);
  const image = `data:${file.type};base64,${toBase64(await file.arrayBuffer())}`;

  const baseRequestBody = {
    temperature: 0.1,
    max_tokens: 3000,
    provider: { allow_fallbacks: true, require_parameters: true },
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildFoodAnalysisPrompt(description, diet) },
      { role: 'user', content: [{ type: 'text', text: 'Analyse this food photo and return the required JSON only.' }, { type: 'image_url', image_url: { url: image } }] }
    ]
  };

  const requestBodies = models.map((model, index) => ({
    ...baseRequestBody,
    model,
    ...(index === 0 ? { models: models.slice(1) } : {})
  }));
  let result: ReturnType<typeof parseFoodAnalysis> = null;
  let selectedModel = models[0];
  let lastStatus = 502;
  let sawRateLimit = false;
  let receivedUsableHttpResponse = false;

  for (let modelIndex = 0; modelIndex < requestBodies.length && !result; modelIndex += 1) {
    const requestBody = requestBodies[modelIndex];
    for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex += 1) {
      try {
        const candidate = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKeys[keyIndex]}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://magisintel.nl',
            'X-Title': 'Papa voedingshulp'
          },
          body: JSON.stringify(requestBody)
        });

        if (!candidate.ok) {
          lastStatus = candidate.status;
          sawRateLimit = sawRateLimit || candidate.status === 429;
          const detail = await candidate.text().catch(() => '');
          console.error('OpenRouter food analysis failed', { model: requestBody.model, keySlot: keyIndex + 1, status: candidate.status, detail: detail.slice(0, 300) });
          if (!RETRYABLE_UPSTREAM_STATUSES.has(candidate.status)) break;
          continue;
        }

        receivedUsableHttpResponse = true;
        const payload = await candidate.json().catch(() => null) as { model?: unknown; choices?: Array<{ finish_reason?: unknown; message?: { content?: unknown; parsed?: unknown; reasoning?: unknown } }> } | null;
        const message = payload?.choices?.[0]?.message;
        const rawText = modelText(message?.content);
        const reasoningText = modelText(message?.reasoning ?? (message as { reasoning_content?: unknown } | undefined)?.reasoning_content);
        const parsedPayload = typeof message?.parsed === 'string' ? extractJson(message.parsed) : message?.parsed;
        const parsedResult = parseFoodAnalysis(parsedPayload ?? extractJson(rawText) ?? extractJson(reasoningText));
        if (parsedResult) {
          result = parsedResult;
          selectedModel = typeof payload?.model === 'string' ? payload.model : requestBody.model;
          break;
        }

        console.error('OpenRouter food analysis returned no usable estimate; trying next model', {
          model: payload?.model || requestBody.model,
          finishReason: payload?.choices?.[0]?.finish_reason,
          messageKeys: message && typeof message === 'object' ? Object.keys(message) : [],
          contentType: typeof message?.content,
          contentBlockCount: Array.isArray(message?.content) ? message.content.length : null,
          contentLength: rawText.length,
          reasoningLength: reasoningText.length
        });
        break;
      } catch (error) {
        lastStatus = 503;
        console.error('OpenRouter food analysis request failed', { model: requestBody.model, keySlot: keyIndex + 1, error: error instanceof Error ? error.message : 'unknown error' });
      }
    }
  }

  if (!result && !receivedUsableHttpResponse) {
    return jsonResponse({ message: sawRateLimit || lastStatus === 429 ? 'De gratis AI is even druk. Probeer het zo opnieuw.' : 'De foto-analyse kon niet worden uitgevoerd.' }, 502);
  }
  if (!result) {
    console.error('OpenRouter food analysis returned no usable estimate after model fallbacks', { modelCount: models.length });
    return jsonResponse({ message: 'De AI-providers gaven geen bruikbare schatting terug. Probeer het opnieuw; de foto zelf lijkt bruikbaar.' }, 502);
  }
  const safeResult = diet ? result : { ...result, dietFit: 'uncertain' as const, dietReason: 'Geen expliciete dieetregels opgegeven; daarom is de dieetcheck onzeker.' };
  return jsonResponse({ result: safeResult, model: selectedModel });
}
