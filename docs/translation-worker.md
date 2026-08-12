# PJCC Translation Worker — EN→JA

The site's 日本語 toggle runs on your own Cloudflare Worker: **DeepL first, Workers AI
(`m2m100`) if DeepL hiccups.** Under that the site still has gtx → MyMemory → English, so a
visitor never sees a failure. Live at `pjcc-translate.nathgreen37.workers.dev`, wired into
`assets/js/pjcc-lang.js` as `WORKER_URL`.

**There is exactly one Worker in this file.** Whatever you are here to do, the code block below
is the code.

---

## Redeploy it

The usual reason: something in the code changed — most often the `ALLOW` list, after a domain
move.

1. **Cloudflare → Workers & Pages → `pjcc-translate` → Edit code.**
2. Select all, paste [the code](#the-code), click **Deploy**. *Editing is not deploying.*
3. Check it: open `https://pjcc-translate.nathgreen37.workers.dev/?q=Hello%20world`
   → `{"translation":"ハロー・ワールド","engine":"deepl"}`

**`"engine":"deepl"` is the part that matters.** `"m2m100"` means DeepL didn't answer — see
[Troubleshooting](#troubleshooting).

⚠ **Nothing else needs re-entering.** `DEEPL_KEY` and the `AI` binding live in the Worker's
settings, not in its source, so they survive any code paste.

---

## First-time setup

Only needed for a Worker that doesn't exist yet.

1. **Create it:** Cloudflare → Workers & Pages → Create → Worker, named `pjcc-translate`.
   Deploy the starter, then **Edit code** and paste [the code](#the-code).
2. **Bind Workers AI:** Settings → Bindings → Add → Workers AI. Variable name exactly **`AI`**.
3. **Add the DeepL key:** get one at [deepl.com/pro-api](https://www.deepl.com/pro-api) — the
   **DeepL API Free** plan, not a Pro/app subscription; only the API plan issues a key, and free
   keys end in `:fx`. Then Settings → Variables and Secrets → Add → **Secret**, named exactly
   **`DEEPL_KEY`**.
   *Optional — the Worker runs on `m2m100` without it and upgrades itself the moment it exists.*
4. **Point the site at it:** in `assets/js/pjcc-lang.js`, set
   `var WORKER_URL = 'https://pjcc-translate.<subdomain>.workers.dev';` — commit and push.

---

## The code

```js
export default {
  async fetch(request, env) {
    // ⚠ Every domain the site is served from has to be listed here, or the browser
    //    discards the reply. Update this on any domain move, then REDEPLOY.
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

    // 1) DeepL — the sharper Japanese. Any failure (no key, over quota, outage) falls
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

**`{"error":"AiError: 3040: Capacity temporarily exceeded"}`**
Cloudflare's free-tier Workers AI limit — transient, and nothing you did. But seeing it means
**DeepL didn't answer**, since DeepL runs first and Workers AI only catches. Check
`DEEPL_KEY` under Settings → Variables and Secrets. If it's missing, re-add it. If it's there,
check your DeepL usage — the Free plan caps at 500,000 characters a month.

**The answer comes back `"engine":"m2m100"`**
Same cause, softer symptom: the Worker is working, just on the weaker engine. Same check.

**The site's Japanese still works but the console is full of failed requests**
The `ALLOW` list doesn't include the domain you're on, so the browser throws the Worker's reply
away and the page falls to gtx. Add the domain to `ALLOW` above and redeploy.
⚠ **This is how it hides.** The visible feature keeps working, because the fallbacks exist for
exactly this. Driven on the live front door in that state: `lang="ja"`, 271 Japanese glyphs,
carried by gtx, while all 41 Worker calls returned 502. **A Worker error is one rung of the
ladder giving way, not an outage** — so check the console, not the page.

---

## Notes

- **Cost:** effectively nothing. Every translation is cached in the visitor's browser, so the
  Worker is hit rarely, and both engines have free tiers.
- **Prefer the CLI?** `npm i -g wrangler`, code in `src/index.js`, `wrangler secret put
  DEEPL_KEY`, then `wrangler deploy`, with:
  ```toml
  name = "pjcc-translate"
  main = "src/index.js"
  compatibility_date = "2024-11-01"
  [ai]
  binding = "AI"
  ```
- **History, and why this file is now one block.** It used to carry two complete Workers — a
  June 24 Workers AI starter and the June 30 DeepL version that was actually running — under a
  heading reading "DEPLOYED 2026-06-30". On 2026-08-11 that produced a wrong deploy: the date
  read as a version stamp, so the newer block looked like the older one, and the starter got
  pasted over production. It fixed the `ALLOW` list and silently dropped the site's Japanese to
  `m2m100`, which nothing reported, because both engines return a perfectly valid translation.
  Three warning banners were added to prevent a repeat; deleting the starter deleted the need for
  all three. **The starter was always redundant — the DeepL block contains the same Workers AI
  call as its fallback.** ⭐ *A runbook that offers a choice it doesn't want you to make is a
  runbook with a bug in it.*
