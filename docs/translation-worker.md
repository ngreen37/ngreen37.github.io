# PJCC Translation Worker (optional, bulletproof EN→JA)

The site's 日本語 toggle works today with a free, keyless Google endpoint (`gtx`) +
MyMemory fallback. That's fine for low traffic, but it's *unofficial*. This Worker is
the rock-solid upgrade: translation runs **server-side in your own Cloudflare account**,
so it's reliable, CORS-controlled, and (if you ever use a paid API) the key stays secret.

**Recommended engine: Cloudflare Workers AI** — no third-party signup, no API key, runs
inside Cloudflare on a free daily allowance. (A DeepL variant is at the bottom if you want
higher Japanese quality later.)

Once deployed, you make it the site's **primary** engine by pasting one URL into
`assets/js/pjcc-lang.js` (`var WORKER_URL = '...'`). `gtx` + MyMemory stay as fallbacks.

---

## Deploy in the Cloudflare dashboard (no CLI, ~10 min)

1. **Cloudflare dashboard → Workers & Pages → Create → Worker.** Name it `pjcc-translate`. Deploy the starter, then click **Edit code**.
2. Replace the starter code with this and **Deploy**:

```js
export default {
  async fetch(request, env) {
    const ALLOW = [
      'https://mcpuppystudios.com',
      'https://www.mcpuppystudios.com',
      'https://ngreen37.github.io'
    ];
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOW.includes(origin) ? origin : ALLOW[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);
    let q  = url.searchParams.get('q')  || '';
    let sl = url.searchParams.get('sl') || 'english';
    let tl = url.searchParams.get('tl') || 'japanese';
    if (request.method === 'POST') {
      try { const b = await request.json(); q = b.q || q; sl = b.sl || sl; tl = b.tl || tl; } catch (_) {}
    }
    if (!q) return json({ error: 'no text' }, 400, cors);

    try {
      const out = await env.AI.run('@cf/meta/m2m100-1.2b', { text: q, source_lang: sl, target_lang: tl });
      return json({ translation: out.translated_text }, 200, { ...cors, 'Cache-Control': 'public, max-age=86400' });
    } catch (e) {
      return json({ error: String(e) }, 502, cors);
    }
  }
};
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}
```

3. **Bind Workers AI:** Worker → **Settings → Bindings → Add → Workers AI**. Set the
   **Variable name to exactly `AI`**. Save (it redeploys).
4. **Copy the Worker URL** (looks like `https://pjcc-translate.<your-subdomain>.workers.dev`).
   Test it in a browser:
   `https://pjcc-translate.<your-subdomain>.workers.dev/?q=Hello%20world`
   → should return `{"translation":"こんにちは世界"}` (or similar).
5. **Activate it on the site:** open `assets/js/pjcc-lang.js`, set:
   ```js
   var WORKER_URL = 'https://pjcc-translate.<your-subdomain>.workers.dev';
   ```
   Commit + push. Done — the Worker is now primary; gtx/MyMemory auto-cover any hiccup.

> Prefer the CLI? `npm i -g wrangler`, drop the code in `src/index.js`, add the
> `wrangler.toml` below, then `wrangler deploy`.

```toml
# wrangler.toml
name = "pjcc-translate"
main = "src/index.js"
compatibility_date = "2024-11-01"

[ai]
binding = "AI"
```

---

## Optional: DeepL engine (better Japanese, needs a free key)

DeepL's free tier is 500,000 chars/month (signup needs a card, but isn't charged on Free).
Get a key at deepl.com → swap the `try` block in the Worker for:

```js
const r = await fetch('https://api-free.deepl.com/v2/translate', {
  method: 'POST',
  headers: {
    'Authorization': 'DeepL-Auth-Key ' + env.DEEPL_KEY,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({ text: q, source_lang: 'EN', target_lang: 'JA' })
});
const d = await r.json();
return json({ translation: d.translations[0].text }, 200, { ...cors, 'Cache-Control': 'public, max-age=86400' });
```

Then store the key as a secret (never in code): Worker → **Settings → Variables and Secrets
→ Add → Secret**, name `DEEPL_KEY`. (CLI: `wrangler secret put DEEPL_KEY`.)

---

## Notes
- **Cost:** Workers AI has a free daily allowance; the site caches every translation in
  the visitor's browser, so the Worker is hit rarely. Low-traffic = effectively free.
- **Safety:** if the Worker is ever down, the site silently falls back to gtx → MyMemory →
  English. Nothing breaks.
- **Quality:** `m2m100` is good, not DeepL-great. Easy to switch engines later without
  touching the site — only the Worker changes.
