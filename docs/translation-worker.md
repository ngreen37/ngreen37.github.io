# PJCC Translation Worker (optional, bulletproof EN→JA)

> ## ⚠ REDEPLOYING? PASTE THE **DeepL** BLOCK, NOT THE FIRST ONE.
>
> There are two complete Workers in this file. The one immediately below is the older **Workers
> AI starter** (June 24). The one you want is the **DeepL** version further down — scroll to the
> heading **"⭐ THE ONE TO PASTE"**.
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

> ### ⚠ FIRST-TIME SETUP ONLY — DO NOT PASTE THIS BLOCK TO REDEPLOY.
> This is the original Workers AI starter (June 24) and it has **no DeepL branch at all**.
> Deploying it over the live Worker silently drops the site's Japanese to `m2m100` and leaves the
> `DEEPL_KEY` secret sitting there unused. If you are here to redeploy, scroll to
> **"⭐ THE ONE TO PASTE"**. Keep reading here only for steps 1, 3 and 4 — creating the Worker,
> binding Workers AI, and finding your URL.

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

## ⭐ THE ONE TO PASTE — DeepL engine (sharper Japanese)

> **⚠ "2026-06-30" IS A STATUS LABEL, NOT A VERSION STAMP — and it caused a wrong deploy on
> 2026-08-11.** The heading used to read "DEPLOYED 2026-06-30", which reads like old code you
> would be reverting to. It is the opposite: **June 30 is the day this version went live**, and
> it is the *newer* of the two blocks in this file. The starter above it dates from **June 24**.
>
> Nothing in this file's Worker code is newer than August 3rd, when `chesswild.com` was added to
> both `ALLOW` lists — the fix that still needs deploying. Pasting this block is not going back
> in time; it is putting the engine that ran from June 30 until now back in front, with the
> allowlist corrected.

DeepL gives noticeably better Japanese than `m2m100`. Free tier = 500,000 chars/month
(signup needs a card for verification but is **never charged** on the Free plan).

**This is the version that was running in production until it was overwritten.** It tries DeepL
first and falls back to
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

## Troubleshooting

**`{"error":"AiError: 3040: Capacity temporarily exceeded, please try again."}`**
Cloudflare's own free-tier Workers AI capacity limit — transient, and nothing you did. But
**seeing it at all means DeepL did not answer**, because DeepL runs first and Workers AI is only
the catcher. Two causes, in order of likelihood:

1. **The wrong block is deployed.** Ctrl+F the Cloudflare editor for `DEEPL_KEY`. Not found → you
   have the June 24 starter, which has no DeepL branch. Paste "⭐ THE ONE TO PASTE" and Deploy.
   *(This is exactly what happened on 2026-08-11.)*
2. **The key is gone or spent.** Worker → **Settings → Variables and Secrets**; `DEEPL_KEY` should
   be listed with its value hidden. If it is missing, re-add it (secrets survive a code paste but
   not deleting and recreating the Worker). If it is there, check your DeepL usage — the Free plan
   caps at 500,000 characters a month.

⭐ **This error is a feature of the layering, not a failure of it.** With the right block deployed
the site has four rungs — DeepL → Workers AI → gtx → MyMemory → English — so a visitor never sees
any of this. Driven on the live front door while the Worker was returning 502 on all 41 calls: the
page still came back `lang="ja"` with 271 Japanese glyphs, carried by gtx. **A Worker error is not
an outage; it is one rung of the ladder giving way.**

## Notes
- **Cost:** Workers AI has a free daily allowance; the site caches every translation in
  the visitor's browser, so the Worker is hit rarely. Low-traffic = effectively free.
- **Safety:** if the Worker is ever down, the site silently falls back to gtx → MyMemory →
  English. Nothing breaks.
- **Quality:** `m2m100` is good, not DeepL-great. Easy to switch engines later without
  touching the site — only the Worker changes.
