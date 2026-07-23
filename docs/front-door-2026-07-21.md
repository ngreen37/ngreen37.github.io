# The front door — splash vs PJCC home vs the studio page

> **Nate, 2026-07-21:** "How do we better organize the page to modernize? I should delete
> the Splash Page? We worked hard on it; maybe we can incorporate it to the PJCC home
> page. Without the splash page, I'll have two home pages, more-or-less. that's no good.
> Perhaps McPuppy page should simply be 'About The Studio'"

This is the answer, and the plan. It sits under `docs/` so it is not published.
Companion to `docs/modernization-2026-07.md` — this resolves that roadmap's items #9
(cinematic splash) and part of #8 (a real moving hero) by deciding *where the front door
lives* before anyone builds one.

**How it was produced:** a thirteen-agent pass — five parallel audits (the splash, the
PJCC home, the McPuppy side, a full link/migration-risk map, and an outside-in visitor
walk), four independent architecture proposals written from deliberately different angles,
and a four-judge panel scoring them on modernization, owner-fit, engineering risk and
visitor experience. An adversarial stress phase was planned and did **not** run (it hit a
session limit), so the risk list below is the judges' verification work rather than a
dedicated red-team. Treat the URL/PWA specifics as verified — several judges independently
confirmed them against the repo — and treat the perf and craft-loss estimates as unaudited.

---

## The three answers, up front

**1. Should you delete the splash page?** No — but you should stop having a *page* at `/`
whose job is to be a menu. Nearly everything you built on it survives; the four quads do
not. Three of those four (PJCC, Academy, Games) are already in the site header on every
other page, which is the real reason the splash reads as a duplicate.

**2. If you fold it into the PJCC home, don't you have two home pages?** You have that
problem *today* — worse than you think. The audit's count: the splash, `/pjcc/`,
`/projects/`, `/games/` and `/academy/` all currently behave like a landing page, and
`/projects/` even carries its own five-door nav bar. Merging doesn't create the problem,
it ends it: `/` becomes the one front door, `/pjcc/` becomes a redirect stub, and
`/projects/` stops competing by losing the nav bar that makes it look like a home.

**3. Should the McPuppy page simply be "About The Studio"?** Yes. That is the single
highest-value, lowest-risk move on this whole list, and it is the thing to do first. It
needs no URL change, no PWA change, and no migration.

---

## The recommended architecture

**One door, built somewhere safe first.** Rebuild `/pjcc/` into the real front door one
shippable step at a time while the splash keeps running untouched at `/`. Then swap which
URL each page answers to — which is genuinely a two-line front-matter change, because
`index.md` and `pjcc.md` are five-line shells whose only meaningful content is
`permalink:`. All the substance lives in the layouts. The rollback is the same two lines.

Three of four judges picked this. The dissent is worth reading — see *The judgement call*
below.

The end state:

| URL | Becomes | Why |
|---|---|---|
| `/` | The one front door — `pjcc.md`'s permalink, rendered by a rebuilt `_layouts/home.html` | The site logo in `_layouts/default.html:35` points here from every page, `sw.js` precaches it, and `404.html`, `500.html`, `classified.md` and `dispatch.md` all send visitors back to it. It must stay a real page — and it should be the thing the `WebSite` JSON-LD in `_includes/head.html` already claims it is. |
| `/pjcc/` | A permanent hand-authored redirect stub | There is no redirect plugin (verified: `Gemfile` is `jekyll` + `webrick`; `_config.yml` plugins are sitemap + seo-tag only). Copy the proven `games/space-run-redirect.html` pattern: `sitemap:false`, robots noindex, canonical to `/`, meta-refresh plus `location.replace`, and a visible fallback link. **This stub stays up for months, not weeks.** |
| `/projects/` | About the Studio — same URL, same `theme-studio`, same McPuppy nav | Referenced from `_data/brands.yml:17`, `_layouts/default.html:64` and `:94`, `_layouts/home.html:131`, `assets/js/pjcc-nav.js:29`, `_config.yml` and `tests/perf.js:49`. Change the page's identity, never its address — and because the 🐾 badge still lands here, the McPuppy half keeps a home of its own. |
| `manifest.json` `start_url` | `/?source=pwa` (was `/pjcc/?source=pwa`) | Safe to change. |
| `manifest.json` `id` | **`/pjcc/` — never touch this** | `id` is the app's permanent identity. Changing it makes browsers treat the PWA as a brand-new app, so anyone who installed it ends up with two icons instead of an update. This is the one irreversible mistake available in the whole migration. |
| `sw.js` | Keep **both** `/` and `/pjcc/` in `PRECACHE`; bump `VERSION` `pjcc-pwa-v4` → `v5` | Both are real pages. `start_url` is baked into the launcher **at install time**, so every already-installed app keeps opening `/pjcc/?source=pwa` no matter what the manifest later says. The version bump is the only thing that forces `activate()` to purge the old shell. |
| `assets/js/pjcc-nav.js` (⌘K) | Delete the "The Splash → /" entry, retarget "PJCC Home" to `/`, rewrite the `/projects/` subtitle | `tests/links.check.js` skips every `.js` file, so this palette can go fully dangling on every page of the site with `npm test` green. Walk it by hand. |
| `_layouts/home.html` TVSeries JSON-LD | `@id` and `url` → `{{site.url}}/` | It is the rich-result entity for the show. The `Organization` and `WebSite` nodes in `head.html` are already root-anchored and need no change. |
| `/classified/` | Unchanged — but **both** of its doors move with the hero | The day door (the flickering "i" in *Million*) and the night door (the ✦ star) are deliberately split across the clock. Lose either half and the classified → archive → recovery → dispatch wing goes dark for twelve hours a day. |

### The new front page, top to bottom

1. **Header + PJCC nav** — the shared chrome the splash never had. This is *why* the quads
   can die: PJCC, Academy and Games are already here.
2. **The opening — a poster hero.** Full town sky. The title at `clamp(44px, 6vw, 76px)`.
   The cycling seven-word tagline directly beneath it, in your arc order, carrying the
   flickering "i". **Remove its `aria-hidden`** — the front door currently has no
   descriptive copy at all for Google or a screen reader, which is the site's biggest SEO
   defect. The flat CSS skyline is deleted; Checker Town and Chess City survive as two
   plain links.
3. **The one CTA — the Gauntlet.** One arch, centered, about double its current size,
   hydrated from `pjcc.gauntlet.v2` exactly as now: grandeur tier, per-floor dressing, the
   boss's accent and glyph, ten pips, the `#climb`/`#tower` deep link, the "Floor N of 10"
   whisper. The park table sits beside it as the band's art, and Park Tables becomes one
   secondary line — it is correspondence chess behind a sign-in gate, so it can't be the
   first thing you ask a stranger for.
4. **The studio is awake — the lamp and the devlog.** The anglepoise, lit when the build
   stamp is under twelve hours old, still linking the Direct Line. Beside it: the title and
   date of the newest post. This is the first time the front door would admit the blog
   exists — today the only route is a drifting ¶ that is `display:none` on phones.
5. **The cast — four faces.** Same content, retyped off the design tokens.
6. **Footer** — the shared one. Note this finally gives the front door a **✨ Reduce
   motion** control: the splash is currently the most animated page on the site *and* the
   one page where you cannot turn motion down.

### What happens to everything you worked hard on

**Kept:** the ACCcccccc sigil bloom (same 483/805/546ms timing, still night-only, still
with its two failsafes) · the cycling tagline, all seven words in your arc order · the
flickering "i" door to `/classified/`, technique intact · the ✦ secret star and the hourly
comet, night-only, with the reduced-motion gutter-parking that keeps the secret reachable ·
the park table and its win-glint · the Gauntlet door, its hydration and the pips whisper —
**promoted to the single lead CTA** · the seasonal emblem, re-homed onto the header logo so
it now appears on *every* page instead of one · the quad mote · the Shogi Gate rite (free —
`default.html` already loads `pjcc-portal.js`).

**Kept and promoted:** the desk lamp stops being a corner ornament and anchors a real
section. The June 13 "· for Princess" egg moves into the site footer — which finally makes
it fire on phones, where the splash footer is `display:none` and the egg has never worked.

**Deleted:** the four quads · the corner Contact pill, 日本語 toggle, logo link and footer
signature (all four duplicated by the shared header and footer) · the corner lean glow (it
existed only to serve the quads) · the `.studio-warp` enter-wipe (roadmap #6, View
Transitions, does this natively site-wide in about twenty lines and takes the bfcache bug
with it) · two of five drifters, ♞ and ♜, because Games and the studio are both in the nav.
The surviving three move into the hero **and are shown on phones for the first time** —
they were hidden there precisely because they were the only route to those places.

### Grafts the judges pulled from the losing proposals

- Move the ✦ star and hourly comet into `_includes/town-sky.html` as night-only
  `.ts-secret` / `.ts-streak`. Three of four judges named this the best idea in any losing
  proposal: it makes them legitimately viewport-fixed instead of needing fiddly
  re-anchoring, and it protects the `/classified/` wing.
- A scroll-linked `--sky-veil` driver (one rAF-throttled listener, opacity only) fading the
  clouds and stars out across the first 100vh. Better layering than today's
  `body:not(.studio-body){display:none}` hack. *(Corrected 2026-07-22: this was written up
  as a fix for the "jellybeans" bug. It was not one — the jellybeans were
  `.flair-weathering` footer splats in `pjcc-flair.js`, found and deleted 2026-07-22. The
  veil is still the right call for layering; it just never had anything to do with that
  bug. See `docs/jellybeans-2026-07-22.md`.)*
- Make the lamp's tooltip **name** what shipped — about six lines of Liquid writing
  `site.posts.first.title` into the lit-state string. Turns "something happened" into "this
  happened."
- A `sessionStorage` returning-visitor fast path that collapses the opening beat from about
  2.8s to about 700ms while still striking the pips.

---

## The order to do it in

**Step 0 — the smallest first move. Ship this on its own; it touches no URL.**
Delete the `.studio-master` five-door bar and its page-local `<style>` from
`projects.md:14-35`, drop `own_title: true` and the `.page-title` negative-margin
full-bleed hack, and recolor Special Thanks off PJCC purple onto `theme-studio`'s brass
`#caa24a`. Zero effect on `/`, `/pjcc/`, `sw.js`, `brands.yml` or any permalink. Purely
page-local and revertible — and **it resolves about a third of the "two home pages"
problem by itself**, because that bar is the single thing making `/projects/` read as a
home.

1. **De-duplicate before merging.** Delete the inline `.gdoor` `<style>` copies from
   `_layouts/home.html` and `games.md` so `_sass/_pjcc-21-gauntlet-door.scss` is the only
   source (they have already drifted — arch 78×100 vs 72×92). Delete the duplicated
   `pjcc-config.js`/`pjcc-profile.js` script pair at `home.html:625-626` that
   double-initializes PJCC.
2. **Decouple atmosphere from page identity.** Change the two town-sky gates from
   `body:not(.studio-body)` to also exempt a new `full-sky` class, and give `pjcc.md` that
   class. `/pjcc/` gets the site's best sky.
3. **Rebuild the hero on `/pjcc/`.** Screenshot at 1536×864, 390×844, day and night.
4. **Port the state furniture** — the Gauntlet door as lead CTA, the star, the lamp band.
   Re-run the full reduced-motion pass; it is the most likely thing to be lost in a port.
5. **Soak.** Leave it live a few days.
6. **The flip** — one atomic commit: the two permalinks, the stub, the manifest
   `start_url`, the `sw.js` version bump, the JSON-LD, `pjcc-nav.js`, the nav hop.
7. **Batched wording proposal** (below).
8. **Cleanup**, a week after the flip — delete `_layouts/studio-home.html` and the
   splash-only CSS. Run `sweep` last: until this point its report is noise, because an
   unreferenced layout makes several hundred live `.studio-*` classes look dead.

---

## What this costs, and what could go wrong

- **The flip is a real SEO moment.** GitHub Pages cannot issue a 301. A meta-refresh plus
  canonical stub is the strongest signal available and it is genuinely weaker. Expect
  reindex lag on the two most-indexed URLs on the domain.
- **`npm test` cannot defend this migration.** `links.check.js` skips every `.js` file and
  seeds `/` as unconditionally valid; `pwa.check.js` only truthiness-checks `start_url`;
  `sweep.js` parses `_sass` only, so page-local `<style>` blocks are invisible to it. The
  suite will stay green while `pjcc-nav.js` dangles on every page. `pjcc-nav.js`,
  `manifest.json`, `sw.js` and `brands.yml` must be walked by hand.
- **The merged page is by construction the worst-case perf target on the site** — splash
  ambience, hero and hydration in one document. Record a `npm run perf` baseline for the
  current splash and `/pjcc/` *before* step 3, not after, so there's something to compare
  against. Guardrail #4 is "rich but fast," and this is the design that most endangers it.
- **You live with two front doors during steps 2–5**, and `/pjcc/` will visibly be the
  better page while `/` is still the one everyone lands on. The sequencing buys safety by
  paying in interim incoherence.
- **Splash markup moves under `_layouts/default.html`'s full script stack for the first
  time** (`pjcc-eggs.js`, `pjcc-flair.js`, `pjcc-reveal.js`, `pjcc-profile.js`,
  `pjcc-lang.js`). Under-costed by every proposal; watch for collisions.
- **Patreon loses its quad.** The proposed answer is one footer link, which is a demotion
  of the studio's only revenue surface — your call.
- **`.studio-content` is `pointer-events:none`** with a small re-arm allowlist. Anything
  new must be added to it or it is silently unclickable.

## Wording vs mechanics

**Needs your approval before shipping** (batch these into one old → new list): retitling
`/projects/` to "About the Studio" · the ⌘K subtitle for it · the front door's CTA label ·
`500.html`'s "Return to McPuppy Studios" · the "RETURN TO SURFACE" copy in
`classified.md:89` and `:268`, `404.html:24` and `dispatch.md:29` (they still resolve but
stop being true) · the Patreon link · any ticker retirement.

**No approval needed** (mechanical, auto-push per the standing rule): everything else here
— deleting the `.studio-master` bar, the de-duplication, the sky gate, the hero rebuild,
the ports, the permalink flip, the PWA and JSON-LD changes.

---

## The judgement call you might want to overrule

Three judges picked the merge. The **engineering** judge dissented, and made a real case:
your stated problem is "two home pages," but the *mechanism* causing that feeling is
**duplication, not addressing**. Both front doors carry a Gauntlet door and a park table;
`/projects/` wears a nav bar that makes it read as a third home. Fix those three things in
place and you keep every URL, canonical, sitemap entry, `brands.yml` line and PWA identity
exactly where it is — and you pay none of the migration bill.

The counter-argument, which is why it lost 3–1: that plan leaves you a month from now
still maintaining a 902-line layout and a 1,043-line layout, still with two pages whose
browser tab says "McPuppy Studios," and still with two home pages by design. It answers
"how do I make the splash better" rather than the question you actually asked.

**If you want the cheap 80%:** do Step 0 plus step 1, stop, and see how the site feels.
Both are on the path to the merge anyway, so nothing is wasted either way. That is the
honest hedge, and it is why Step 0 is written to be shippable entirely on its own.

---

## Status log

- **2026-07-21** — Written. Nothing built yet.
- **2026-07-21 (same session)** — **BUILT AND FLIPPED.** Nate: "let's get it done right.
  We can't have five landing pages lol." Every step below shipped to `main`, each as its
  own commit with its own verification:

  | Step | What shipped | Commit |
  |---|---|---|
  | 0 | `/projects/` stops being a second home — the five-door `.studio-master` bar deleted, `own_title` + the full-bleed hack gone, Special Thanks recolored onto the studio's brass | `10aeab2` |
  | 1 | One Gauntlet-door stylesheet instead of three; the duplicate PJCC init and two dead rules removed | `d49c200` |
  | 2 | `full-sky` + **the sky veil** — a page can own the whole sky without the discrete layers floating behind its content | `6a9c969` |
  | 3 | The poster hero: `clamp(44px,6vw,76px)` title, the cycling tagline with the flickering "i", the sigil bloom — and the flat CSS skyline deleted | `1db88cb` |
  | 4a | The ✦ secret star + hourly comet moved into the shared sky | `273ec38` |
  | 4b | One CTA: the Gauntlet door at 124×160, Park Tables demoted to a line | `6a77a1f` |
  | 4c | "The studio is awake" — the desk lamp beside the newest post; the lamp became a shared partial + include | `2820c01` |
  | flip | `/` is the front door, `/pjcc/` is a hand-authored redirect stub | `a1a9439` |

  **Deviations from the plan, and why.** The Step 5 soak was skipped — Nate asked for the
  swap in the same session. Two things the plan asserted turned out to be wrong under
  test and were fixed: the secret ✦ cannot live *inside* `.town-sky` (it is `z-index:-1`
  and `pointer-events:none`, so the link would be unclickable), and `z-index:0` was not
  enough for it either on a normal scrolling page. The drifters and the seasonal mote
  were **not** ported to the hero — see below.

  **Still open:**
  - The wording batch (below) is unsent. Nothing visitor-facing was reworded; the flip
    deliberately pins `tab_title` and `description` so the `<title>` and meta description
    did not change by a character.
  - The hero eyebrow still reads "McPuppy Studios Presents" directly above a tagline
    whose last line also says "McPuppy Studios". Cutting it is wording, so it waits.
  - The three surviving drifters (♛ ¶ ♟) and the seasonal quad-mote were not ported.
    They are decorative and the hero is stronger without more moving parts; if they are
    wanted, the sky veil is the mechanism to hang them on.
  - The ticker is untouched. Retiring it means deleting ~50 authored strings — wording.
  - `_layouts/studio-home.html` and the splash-only blocks of `_pjcc-02-studio.scss` are
    still in the repo, unreferenced, deliberately: one week of easy rollback. Deleting
    them is the cleanup step, and the dead-CSS sweep stays green until it happens because
    an unreferenced layout still counts as a reference.
  - `npm run perf` has not been run against the merged front door. It is by construction
    the worst-case page on the site.

- **2026-07-22 — THE SECOND MOVE.** Nate: "The website URL is mcpuppystudios.com, so our
  home page must be a black/white McPuppy Home page." So the front door moved again:

  | URL | Now serves | File |
  |---|---|---|
  | `/` | The **McPuppy Studios** home — black/white studio landing that also surfaces the six drawer destinations (PJCC featured) + the newest build-log post | `index.md` (was the `/pjcc/` stub) |
  | `/pjcc/` | The **PJCC world landing** — the cinematic hero kept, plus a band of big doors: Characters · Locations · Fan Art | `pjcc.md` (permalink moved back from `/`) |
  | `/projects/` | Unchanged content, retitled **Projects** (was "About the Studio") | `projects.md` |

  Also this session: the header nav became a **left drawer** (site-wide, `#site-nav.drawer`
  in `_layouts/default.html` + `_sass/_pjcc-13-nav.scss`; the old brand-bar CSS was deleted,
  sweep stays green) with six links — Play Now→Park Tables · Gauntlet · Puzzles→Fork in the
  Road · Academy · PJCC · Projects. Park Tables + Fork in the Road were pulled from the games
  hall (they're drawer links now; Fork via a `noHall` flag). `manifest.json` `id` still
  `/pjcc/` (untouched); `start_url` still `/`; `sw.js` VERSION → `v6` (both `/` and `/pjcc/`
  are still real 200 pages, both precached). The TVSeries JSON-LD `@id`/`url` → `/pjcc/`.
  Both flips verified with `npm test` green + puppeteer screenshots of the home + drawer.

- **2026-07-23 — THE INTRO.** Nate: "It's weird to go to mcpuppystudios.com and it goes to
  PJCC. The splash made sense but was too much. So let's do a compromise: a black/white,
  2-second typing intro that says 'McPuppy Studios Presents', then it opens to the PJCC
  site." So `/` is no longer the studio landing — it's a **standalone black-&-white intro**
  (`index.md`, no site chrome) that types "McPuppy Studios Presents" (CSS `steps(24)`
  typewriter), holds, then `location.replace('/pjcc/')` at ~1.85s. Plays **once per session**
  (a `<head>` script redirects instantly on repeat visits, keyed on `sessionStorage
  mcp.intro.seen`, so the header logo → `/` doesn't replay it); skippable on any click/key;
  honors reduced motion; `<noscript>` meta-refresh fallback. **This is the slot Nate's
  Blender animations drop into later** — swap `.intro-stage` for a `<video>`/`<canvas>` and
  keep the forward logic. The studio-landing version of `index.md` is superseded (its content
  lives on at `/projects/`; recover the landing from git). `sw.js` VERSION → `v7`. Verified
  with puppeteer (mid-type + full line).
