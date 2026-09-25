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
npx wrangler secret put PAPA_APP_PASSWORD
npx wrangler secret put PAPA_AUTH_SECRET
npx wrangler secret put OPENROUTER_API_KEY
```

OpenRouter free means that the selected model endpoint is priced at zero; you still need an OpenRouter account and API key, and free endpoints are rate-limited. `OPENROUTER_MODEL` is optional. The default is `qwen/qwen3.8-27b:free`, a multimodal free model. Free-model availability and provider retention can change, so the model is configurable and the UI labels every photo result as an estimate.

The photo output is constrained in three layers:

1. `lib/papa-ai.ts` gives the model a method, Dutch portion-calibration examples, a fixed field list, and explicit diet rules.
2. The OpenRouter request uses strict JSON Schema output and requires a provider that supports the requested parameters.
3. The Worker validates numeric limits, required food components, the calorie range, and the diet verdict again before returning anything to the browser. If no diet rules were supplied, the Worker forces the verdict to `uncertain`.

The prompt and schema live in `lib/papa-ai.ts`; the API key stays server-side in a Cloudflare secret. Use the interactive `wrangler secret put` prompts locally rather than putting secrets in `.env.example`, Notepad, chat, or Git.

The photo route sends the selected image as base64 to OpenRouter server-side, never to the browser with an API key. The barcode route requests only the needed fields from Open Food Facts v3, identifies the app with a User-Agent, and keeps the source URL visible so a product can be checked.

Cloudflare/OpenNext deployment uses the existing `papawebsite` Worker. If the Worker is not already attached to the `magisintel.nl` custom domain, attach it in Cloudflare Workers → Settings → Domains & Routes; the existing public routes and `/papa` paths can then share the same host.

The photo model is deliberately review-first: it returns a central kcal estimate, a range, component breakdown, assumptions, confidence, and `yes`/`no`/`uncertain` against only the explicit diet rules supplied by the user. It must not be presented as medical advice.
