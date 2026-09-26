# Magis Data Intelligence

Next.js, TypeScript and Tailwind homepage for Magis Data Intelligence.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Papa portal

The personal tools live at `/papa` and are intentionally separate from the public website:

- `/papa/luna` — local food log, Dutch barcode lookup through Open Food Facts, and review-first photo estimates.
- `/papa/fitness` — the existing FitQuest planner and training log, ported to the same protected portal.

The portal uses one server-side password and an HMAC-signed HttpOnly session cookie. Food logs and fitness data stay in browser `localStorage`; there is no VPS, Supabase account, or cloud database in this version.

Copy `.env.example` to `.env.local` for local testing. For a Cloudflare Worker, set the values as secrets instead of committing them:

```bash
npx wrangler versions secret put PAPA_APP_PASSWORD
npx wrangler versions secret put PAPA_AUTH_SECRET
npx wrangler versions secret put OPENROUTER_API_KEY
```

OpenRouter free means that the selected model endpoint is priced at zero; you still need one OpenRouter account and API key, and free endpoints are rate-limited. The route uses OpenRouter's multimodal model chain first and then Cloudflare Workers AI's native `@cf/google/gemma-3-12b-it` vision model as a separate provider fallback. `OPENROUTER_MODEL` and the comma-separated `OPENROUTER_MODELS` override the OpenRouter order; extra OpenRouter keys are intentionally not supported because they do not create an independent account quota. Cloudflare Workers AI is enabled by the `AI` binding in `wrangler.jsonc`, so it needs no additional secret.

The photo output is constrained in three layers:

1. `lib/papa-ai.ts` gives the model a method, Dutch portion-calibration examples, a fixed field list, and explicit diet rules.
2. The OpenRouter request uses strict JSON Schema output only for models that advertise compatible JSON mode; other free models still receive the same JSON-only instruction without being incorrectly excluded.
3. The Worker validates numeric limits, required food components, the calorie range, and the diet verdict again before returning anything to the browser. If no diet rules were supplied, the Worker forces the verdict to `uncertain`.

The prompt and schema live in `lib/papa-ai.ts`; the API key stays server-side in a Cloudflare secret. Use the interactive `wrangler secret put` prompts locally rather than putting secrets in `.env.example`, Notepad, chat, or Git.

The photo route sends the selected image server-side to OpenRouter or the Cloudflare AI binding, never to the browser with a provider key. If a provider returns HTTP success but unusable JSON, the Worker tries the next provider/model instead of blaming the photo. The barcode route requests only the needed fields from Open Food Facts v3, identifies the app with a User-Agent, and keeps the source URL visible so a product can be checked.

Cloudflare/OpenNext deployment uses the existing `papawebsite` Worker. If the Worker is not already attached to the `magisintel.nl` custom domain, attach it in Cloudflare Workers → Settings → Domains & Routes; the existing public routes and `/papa` paths can then share the same host.

The photo model is deliberately review-first: it returns a central kcal estimate, a range, component breakdown, assumptions, confidence, and `yes`/`no`/`uncertain` against only the explicit diet rules supplied by the user. It must not be presented as medical advice.
