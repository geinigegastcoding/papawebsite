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

`OPENROUTER_MODEL` is optional. The default is `qwen/qwen3.8-27b:free`, a current multimodal free model. Free-model availability and provider retention can change, so the model is configurable and the UI labels every photo result as an estimate. The prompt, calibration examples, JSON contract and validation live in `lib/papa-ai.ts`.

The photo route sends the selected image as base64 to OpenRouter server-side, never to the browser with an API key. The barcode route requests only the needed fields from Open Food Facts v3, identifies the app with a User-Agent, and keeps the source URL visible so a product can be checked.

Cloudflare/OpenNext deployment uses the existing `papawebsite` Worker. If the Worker is not already attached to the `magisintel.nl` custom domain, attach it in Cloudflare Workers → Settings → Domains & Routes; the existing public routes and `/papa` paths can then share the same host.

The photo model is deliberately review-first: it returns a central kcal estimate, a range, component breakdown, assumptions, confidence, and `yes`/`no`/`uncertain` against only the explicit diet rules supplied by the user. It must not be presented as medical advice.
