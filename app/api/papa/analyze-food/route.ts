import { getCloudflareContext } from '@opennextjs/cloudflare';
import { hasPapaSession } from '@/lib/papa-auth';
import { buildFoodAnalysisPrompt, getFoodAnalysisModels, parseFoodAnalysis } from '@/lib/papa-ai';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ANALYSIS_DEADLINE_MS = 30000;
const PROVIDER_ATTEMPT_TIMEOUT_MS = 8000;
const CLOUDFLARE_AI_ATTEMPT_TIMEOUT_MS = 9000;
const CLOUDFLARE_AI_TOTAL_TIMEOUT_MS = 14000;
const CLOUDFLARE_AI_MODELS = [
  '@cf/moondream/moondream3.1-9B-A2B',
  '@cf/google/gemma-4-26b-a4b-it',
  '@cf/qwen/qwen3.8-27b',
  '@cf/mistralai/mistral-small-3.1-24b-instruct'
] as const;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const RETRYABLE_UPSTREAM_STATUSES = new Set([401, 403, 408, 425, 429, 500, 502, 503, 504]);
const JSON_MODE_MODELS = new Set([
  'openrouter/free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'dots-studio/dots-3-note-preview:free'
]);

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
    const objectContent = content as { parsed?: unknown; json?: unknown; text?: unknown; content?: unknown; value?: unknown; answer?: unknown; caption?: unknown };
    for (const candidate of [objectContent.text, objectContent.value, objectContent.content, objectContent.parsed, objectContent.json, objectContent.answer, objectContent.caption]) {
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

type ParsedFoodAnalysis = NonNullable<ReturnType<typeof parseFoodAnalysis>>;
type WorkersAiBinding = { run: (model: string, input: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown> };

function getWorkersAiBinding(env: unknown): WorkersAiBinding | null {
  if (!env || typeof env !== 'object') return null;
  const ai = (env as Record<string, unknown>).AI;
  return ai && typeof ai === 'object' && typeof (ai as { run?: unknown }).run === 'function' ? ai as WorkersAiBinding : null;
}

function workersAiText(payload: unknown): string {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const response = payload as { response?: unknown; result?: unknown; answer?: unknown; caption?: unknown };
    return modelText(response.response ?? response.result ?? response.answer ?? response.caption ?? payload);
  }
  return modelText(payload);
}

function workersAiInput(model: string, prompt: string, image: string): Record<string, unknown> {
  if (model.startsWith('@cf/moondream/')) {
    return { task: 'query', image, question: `${prompt}\n\nReturn ONLY the JSON object requested above.`, reasoning: false, temperature: 0.1, max_tokens: 1800, stream: false };
  }
  return {
    messages: [
      { role: 'system', content: prompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyse this food photo and return the required JSON only.' },
          { type: 'image_url', image_url: { url: image } }
        ]
      }
    ],
    temperature: 0.1,
    max_tokens: 1800
  };
}

async function tryCloudflareFoodAnalysis(prompt: string, image: string, deadline: number): Promise<{ result: ParsedFoodAnalysis; model: string } | null> {
  let env: unknown;
  try {
    ({ env } = await getCloudflareContext({ async: true }));
  } catch (error) {
    console.error('Cloudflare AI context unavailable', { error: error instanceof Error ? error.message : 'unknown error' });
    return null;
  }

  const ai = getWorkersAiBinding(env);
  const remainingMs = deadline - Date.now();
  if (!ai) {
    console.error('Cloudflare AI binding unavailable');
    return null;
  }
  if (remainingMs <= 0) return null;

  const cloudflareDeadline = Math.min(deadline, Date.now() + CLOUDFLARE_AI_TOTAL_TIMEOUT_MS);
  for (const model of CLOUDFLARE_AI_MODELS) {
    const modelRemainingMs = cloudflareDeadline - Date.now();
    if (modelRemainingMs <= 0) break;
    try {
      const payload = await Promise.race([
        ai.run(model, workersAiInput(model, prompt, image), { rejectIfBusy: true }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Cloudflare AI timeout')), Math.min(CLOUDFLARE_AI_ATTEMPT_TIMEOUT_MS, modelRemainingMs)))
      ]);
      const rawText = workersAiText(payload);
      const result = parseFoodAnalysis(extractJson(rawText) ?? payload);
      if (result) return { result, model: `cloudflare:${model}` };
      console.error('Cloudflare AI food analysis returned no usable estimate; trying next model', { model, contentLength: rawText.length });
    } catch (error) {
      console.error('Cloudflare AI food analysis request failed; trying next model', { model, error: error instanceof Error ? error.message : 'unknown error' });
    }
  }
  return null;
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
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const image = `data:${file.type};base64,${toBase64(await file.arrayBuffer())}`;

  const baseRequestBody = {
    temperature: 0.1,
    max_tokens: 3000,
    messages: [
      { role: 'system', content: buildFoodAnalysisPrompt(description, diet) },
      { role: 'user', content: [{ type: 'text', text: 'Analyse this food photo and return the required JSON only.' }, { type: 'image_url', image_url: { url: image } }] }
    ]
  };

  const requestBodies = models.map((model) => ({
    ...baseRequestBody,
    model,
    provider: { allow_fallbacks: true, ...(JSON_MODE_MODELS.has(model) ? { require_parameters: true } : {}) },
    ...(JSON_MODE_MODELS.has(model) ? { response_format: { type: 'json_object' } } : {})
  }));
  let result: ReturnType<typeof parseFoodAnalysis> = null;
  let selectedModel = models[0];
  let lastStatus = 502;
  let sawRateLimit = false;
  let receivedUsableHttpResponse = false;
  const analysisDeadline = Date.now() + ANALYSIS_DEADLINE_MS;

  const cloudflareResult = await tryCloudflareFoodAnalysis(buildFoodAnalysisPrompt(description, diet), image, analysisDeadline);
  if (cloudflareResult) {
    result = cloudflareResult.result;
    selectedModel = cloudflareResult.model;
    receivedUsableHttpResponse = true;
  }

  if (!result && openRouterApiKey) {
    for (let modelIndex = 0; modelIndex < requestBodies.length && !result; modelIndex += 1) {
      if (Date.now() >= analysisDeadline) break;
      const requestBody = requestBodies[modelIndex];
      const remainingMs = analysisDeadline - Date.now();
      if (remainingMs <= 0) break;
      try {
        const candidate = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://magisintel.nl',
            'X-Title': 'Papa voedingshulp'
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(Math.min(PROVIDER_ATTEMPT_TIMEOUT_MS, remainingMs))
        });

        if (!candidate.ok) {
          lastStatus = candidate.status;
          sawRateLimit = sawRateLimit || candidate.status === 429;
          const detail = await candidate.text().catch(() => '');
          console.error('OpenRouter food analysis failed', { model: requestBody.model, status: candidate.status, detail: detail.slice(0, 300) });
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
      } catch (error) {
        lastStatus = 503;
        console.error('OpenRouter food analysis request failed', { model: requestBody.model, error: error instanceof Error ? error.message : 'unknown error' });
      }
    }
  }

  if (!result && !openRouterApiKey && !receivedUsableHttpResponse) {
    return jsonResponse({ message: 'De foto-analyse is nog niet geconfigureerd.' }, 503);
  }
  if (!result && !receivedUsableHttpResponse) {
    return jsonResponse({ message: sawRateLimit || lastStatus === 429 ? 'De gratis AI is even druk. Probeer het zo opnieuw.' : 'De foto-analyse kon niet worden uitgevoerd.' }, 502);
  }
  if (!result) {
    console.error('Food analysis returned no usable estimate after provider and model fallbacks', { modelCount: models.length });
    return jsonResponse({ message: 'De AI-providers gaven geen bruikbare schatting terug. Probeer het opnieuw; de foto zelf lijkt bruikbaar.' }, 502);
  }
  const safeResult = diet ? result : { ...result, dietFit: 'uncertain' as const, dietReason: 'Geen expliciete dieetregels opgegeven; daarom is de dieetcheck onzeker.' };
  return jsonResponse({ result: safeResult, model: selectedModel });
}
