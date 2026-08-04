# Domain cutover — mcpuppystudios.com → chesswild.com

**Bought 2026-08-03.** Site structure was reset the same day (front door moved to `/`, renamed
ChessWild). **The domain itself has NOT been flipped yet** — that is this document.

Read the order. Steps 1–2 are yours and must both be done before step 3, or the site goes dark:
the moment `CNAME` says `chesswild.com`, GitHub stops answering for `mcpuppystudios.com`.

---

## The one constraint that shapes everything

**GitHub Pages serves exactly ONE custom domain per site.** Whichever domain is in the `CNAME`
file gets the site and the free TLS certificate (plus its own `www`). The other domain **cannot**
be pointed at GitHub — visitors would hit a certificate error *before* any redirect could fire,
because the TLS handshake happens first and GitHub has no cert for a domain it doesn't own.

So: **chesswild.com is served. mcpuppystudios.com is forwarded at the registrar.**

---

## Step 1 — DNS for chesswild.com (Squarespace)

Squarespace → **Domains** → chesswild.com → **DNS Settings** → *DNS Records*.

Add **four A records** on the root — the same four mcpuppystudios.com already uses (verified live):

| Host | Type | Value |
|---|---|---|
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |

And **one CNAME** so `www` works too — GitHub's cert covers the apex and its `www` together:

| Host | Type | Value |
|---|---|---|
| `www` | CNAME | `ngreen37.github.io` |

Delete any parking/forwarding records Squarespace added on purchase — a leftover A record or
`ALIAS` on `@` will fight these and the site will resolve intermittently.

**Then wait for propagation.** Check from here with `nslookup -type=a chesswild.com`; you want the
same four `185.199.*` addresses back. Usually minutes, allow up to a few hours.

---

## Step 2 — tell me it resolves

That's the whole step. When `nslookup` returns the four GitHub IPs, say so and I do step 3 in one
commit. Doing it earlier takes the live site down for the length of the gap.

---

## Step 3 — the repo flip (mine, one commit)

Four files, and they must move together:

1. **`CNAME`** → `chesswild.com`
2. **`_config.yml`** → `url: "https://chesswild.com"` — drives every canonical, `og:url`, and the
   sitemap. Flipping it before DNS is live would point every canonical at a dead host.
3. **`robots.txt`** → `Sitemap: https://chesswild.com/sitemap.xml`
4. **`games/the-gambit/index.html`** → the hardcoded `<link rel="canonical">`

Then GitHub → repo **Settings → Pages → Custom domain** = `chesswild.com`, wait for the
certificate to provision (a few minutes; the box says "provisioning"), then tick **Enforce HTTPS**.
It cannot be ticked until the cert exists.

---

## Step 4 — forward the old domain (yours)

Squarespace → **Domains** → mcpuppystudios.com. Remove the four GitHub A records (they now point
at a site that no longer claims this domain, which is a 404) and set up **domain forwarding** to
`https://chesswild.com`, permanent (301), *with* path forwarding if offered — so
`mcpuppystudios.com/pjcc/` lands on `chesswild.com/pjcc/` rather than dumping everyone on the home
page.

**If Squarespace's forwarding won't do HTTPS or won't preserve the path**, the free fallback is
Cloudflare: move mcpuppystudios.com's nameservers there and add one Redirect Rule
(`https://chesswild.com/${path}`, 301). Cloudflare gives it a cert for free. Only worth doing if
Squarespace's own forwarding disappoints — check it first.

A 301 passes accumulated ranking to the new domain. There isn't much yet (indexing was requested
2026-07-11), which is exactly why doing this now is cheap.

---

## Step 5 — the three services that break silently

Each of these is keyed to the old origin and **fails without an error message**. All three are yours.

### 5a. Supabase — or nobody can sign in

Dashboard → **Authentication → URL Configuration**:
- **Site URL** → `https://chesswild.com`
- **Redirect URLs** → add `https://chesswild.com/**`

⚠ The **double star** matters — a single `*` does not cross `/`, and every path on this site ends
in one. Keep only chesswild.com entries; drop the mcpuppystudios.com ones once the forward is live,
so there is one origin and one identity.

### 5b. The translation Worker — or Japanese quietly degrades

Cloudflare → Workers → `pjcc-translate` → **Edit code**. The `ALLOW` array is hardcoded:

```js
const ALLOW = [
  'https://chesswild.com',
  'https://www.chesswild.com',
  'https://mcpuppystudios.com',
  'https://ngreen37.github.io'
];
```

Add the two chesswild lines and **Deploy**. Without this the Worker rejects the new origin, the
site falls back to the free keyless gtx/MyMemory chain, that chain rate-limits under volume, and
Japanese pages come back mostly English — with nothing in the console to say why.

### 5c. Google Search Console — a new property

chesswild.com is a *different site* to Google. Add it as a new property (domain verification via
Squarespace DNS, same flow as last time), submit `https://chesswild.com/sitemap.xml`, and request
indexing of `/`. Leave the old property in place — it is what reports the 301s being followed.

---

## Step 6 — what visitors lose, and what you should say

Browsers key storage to the **origin**, so chesswild.com is a stranger to every returning visitor.
Nothing is corrupted; some of it is simply not reachable from the new address.

| | |
|---|---|
| **Accounts, codename, collection, ratings, puzzle Elo** | ✅ safe — on Supabase, restored at sign-in |
| **Everyone's login session** | ⚠️ signed out once; sign in again (use the emailed **code**, not the link, if you're in the installed app) |
| **Signed-OUT progress** — the 1,000-puzzle road, Gauntlet floors, karma | ❌ gone; it only ever lived in that one browser |
| **Your installed iOS app** | ❌ delete and reinstall — a different origin is a different app, and no manifest edit reaches an installed launcher |

That last row applies to you personally on the first day. Sign in on the new domain **before**
deleting the app, so the account is the thing that carries your progress over.

---

## What is already done (2026-08-03, shipped)

- Front door moved `/chess/` → **`/`**; `/chess/` is now the redirect stub (it is the `start_url`
  baked into launchers installed that week and is precached, so it can never 404).
- Renamed **McPuppy Chess → ChessWild** in the h1, tab title, drawer brand, drawer Home row, ⌘K,
  and the PWA manifest `name`/`short_name`.
- `manifest.json` `start_url` → `/?source=pwa`. **`id` stays `/pjcc/` — never change it**; changing
  a manifest id orphans every existing install as a second app.
- `sw.js` → **v12**, precaching `/`, `/chess/` and `/pjcc/` (three generations of baked start_url).
- `_includes/head.html` redirects a `/pjcc/?source=pwa` launch to `/?source=pwa`.
- `tests/pwa.check.js` gained a gate on the `/chess/` stub — it is `layout: null`, so the shared-head
  check cannot see it, and a missing redirect there would only ever show up as an app opening on a
  dead page.
