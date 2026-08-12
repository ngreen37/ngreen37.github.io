# PJCC Translation Worker (optional, bulletproof EN→JA)

> ## ⚠ REDEPLOYING? PASTE THE **DeepL** BLOCK, NOT THE FIRST ONE.
>
> There are two complete Workers in this file. The one immediately below is the **Workers AI
> starter**; the live Worker has been the **DeepL** version since 2026-06-30 — jump to
> [DeepL engine](#deepl-engine-sharper-japanese--deployed-2026-06-30) and paste that.
>
> Probed 2026-08-11: `…workers.dev/?q=Hello%20world` answers `{"translation":"ハロー・ワールド",
> "engine":"deepl"}`. Pasting the starter block would fix CORS and silently drop the site's
> Japanese from DeepL to `m2m100` — a regression bought with a fix, and nothing would report it,
> because both engines return a valid translation.
>
> **Both blocks carry the same corrected `ALLOW` list**, which is the thing that actually needs
> deploying: the running Worker still answers `Access-Control-Allow-Origin:
> https://mcpuppystudios.com` for a `chesswild.com` request, so `chesswild.com` is not in the
> array it was deployed with.
>
> **Your `DEEPL_KEY` survives a code paste.** Secrets live in the Worker's settings, not in its
> source — you are not re-entering the key, and you do not need to touch the AI binding either.

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
      'https://chesswild.com',
      'https://www.chesswild.com',
      'https://mcpuppystudios.com',
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

## DeepL engine (sharper Japanese) — DEPLOYED 2026-06-30

DeepL gives noticeably better Japanese than `m2m100`. Free tier = 500,000 chars/month
(signup needs a card for verification but is **never charged** on the Free plan).

**This is the version currently deployed.** It tries DeepL first and falls back to
Workers AI (`m2m100`) on any DeepL hiccup — over quota, key missing, or outage — so the
Worker always returns *something*. (And the site still has gtx → MyMemory → English under
that.) Because of the fallback, pasting this code is safe even before the key is added: it
just runs on `m2m100` until `DEEPL_KEY` exists, then auto-upgrades.

### Steps
1. **Get a key:** [deepl.com/pro-api](https://www.deepl.com/pro-api) → sign up for the
   **DeepL API Free** plan (NOT a DeepL Pro/app subscription — only the *API* plan issues a
   key). Copy the **Authentication Key** from your account page. Free keys end in `:fx`.
2. **Store it as a secret:** Worker → **Settings → Variables and Secrets → Add → Secret**,
   name exactly `DEEPL_KEY`, value = the key. Save. (CLI: `wrangler secret put DEEPL_KEY`.)
3. **Swap the code:** Worker → **Edit code** → select all, paste the block below → **Deploy**.
4. **Test:** `…workers.dev/?q=The%20princess%20learned%20to%20play%20chess` → the response
   includes `"engine":"deepl"` when DeepL answered (or `"m2m100"` if it fell back).

```js
export default {
  async fetch(request, env) {
    const ALLOW = [
      'https://chesswild.com',
      'https://www.chesswild.com',
      'https://mcpuppystudios.com',
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

    const cache = { 'Cache-Control': 'public, max-age=86400' };

    // 1) DeepL — sharper Japanese. Any failure (over quota / no key / outage) falls
    //    through to Workers AI below, so the Worker never goes dead.
    if (env.DEEPL_KEY) {
      try {
        const r = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: {
            'Authorization': 'DeepL-Auth-Key ' + env.DEEPL_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({ text: q, source_lang: 'EN', target_lang: 'JA' })
        });
        if (r.ok) {
          const d = await r.json();
          const t = d && d.translations && d.translations[0] && d.translations[0].text;
          if (t) return json({ translation: t, engine: 'deepl' }, 200, { ...cors, ...cache });
        }
      } catch (_) { /* fall through to Workers AI */ }
    }

    // 2) Workers AI (m2m100) — the always-on fallback.
    try {
      const out = await env.AI.run('@cf/meta/m2m100-1.2b', { text: q, source_lang: sl, target_lang: tl });
      return json({ translation: out.translated_text, engine: 'm2m100' }, 200, { ...cors, ...cache });
    } catch (e) {
      return json({ error: String(e) }, 502, cors);
    }
  }
};
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}
```

---

## Notes
- **Cost:** Workers AI has a free daily allowance; the site caches every translation in
  the visitor's browser, so the Worker is hit rarely. Low-traffic = effectively free.
- **Safety:** if the Worker is ever down, the site silently falls back to gtx → MyMemory →
  English. Nothing breaks.
- **Quality:** `m2m100` is good, not DeepL-great. Easy to switch engines later without
  touching the site — only the Worker changes.
