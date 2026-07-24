# Modernization — the plan (kickoff 2026-07-19)

> **Mission (Nate):** modernize the site so it stops looking "stuck in time." Plan &
> design it *completely*; execute the cheap web wins now. The long tail (3D animation,
> the cartoon series) runs far past one week and is sequenced **behind** the Blender/Godot
> work — don't block modernization on it.
>
> **Direction:** *bold reinvention* — willing to substantially redesign the hero / home /
> splash from the studs, not just nudge them.

This is the working roadmap. Update the **Status** column as items ship. The one-line
directive + guardrails also live in agent memory (`modernization-mission`).

---

## The vision — traits of the best sites in our lane

Exemplars: **Supergiant** (Hades), **Laika / Pixar** campaign sites, **Lichess / Chess.com**
on the learning side, **Awwwards** narrative pieces. The through-lines — these are the
design principles every item below is judged against:

1. **One authored world, not a theme.** Every pixel looks drawn by the same hand.
2. **A signature moment in the first 3 seconds** — a looping cinematic or one interactive toy that *shows* the craft.
3. **Motion is meaning, not decoration** — restrained, 60fps, `prefers-reduced-motion` honored.
4. **Rich but fast** — lazy media, progressive enhancement, flawless on a phone on the bus.
5. **Visibly alive** — a dated cadence (devlog / "this week" / changelog).
6. **Confident modern type & space.**
7. **One front-door promise + one CTA** (watch / play / learn).
8. **A community loop** (newsletter, Discord, fan wall).

## What reads "stuck in time" today (Nate agrees) — mostly cheap to fix

- **Flat CSS-shape art** (checker stacks, the tiny hero skyline).
- **The ticker / operative chrome.**
- **Small-ish type.**
- **No real depth or moving imagery.** ← first strike landed (town-sky parallax).

---

## Guardrails (Nate's own north stars — do not break)

- **Modern ≠ MORE.** Keep decluttering; a modern site is *edited*, not busier.
- **Perf law:** animate `transform`/`opacity` only; viewport-cap ambient layers; no filters
  on wrappers of animating children. Off under reduced-motion / `reduce-flourish`.
- **Wording still needs approval** before shipping (visitor-facing copy). Visual / layout /
  motion is auto-push once verified.
- **Home + splash are "finished" pages** — verify every change with a repro screenshot
  (no local Jekyll) before pushing; each push to `main` stays shippable.
- **Steer toward the belief:** Season 1 in ~2 years — modernization should make the site a
  worthy front door for the series, academy, and games.

---

## Phase 1 — Foundations & motion (cheap, THIS WEEK)

The base everything else stands on, plus the motion layer that kills "static."

| # | Item | Effort | Status |
|---|------|--------|--------|
| 1 | **Design tokens** — a type scale (`--step-*`), spacing rhythm (`--space-*`), radius/elevation, in a new `_sass` partial. The single source future work reads. | M | ✅ 2026-07-19 — shipped in `_pjcc-01-core.scss` (`--step-*`, `--space-*`, `--r-*`, `--lift`, `--ease-*`) |
| 2 | **Confident type** — a self-hosted *variable* display font; bigger, tighter headings; more generous body line-height. Apply to headings first. | M | ◐ the fluid scale shipped; the variable-font swap is the open half |
| 3 | **Whitespace + grid pass** — consistent spacing scale + a responsive grid; the cramped retro feel eases immediately. | M | ◐ spacing tokens shipped + adoption started; the responsive grid is open |
| 4 | **Town-sky depth + parallax** — layers drift toward the pointer + on scroll; far moves least, near most. | S | ✅ 2026-07-19 (76e3a94) |
| 5 | **Scroll-reveal layer** — `data-reveal` fade/rise on enter (IntersectionObserver, reduced-motion aware). | S | ✅ — `pjcc-reveal.js` / `data-reveal` (live on the landing) |
| 6 | **Page transitions** — the View Transitions API for cross-page morphs; app-like for ~20 lines. | S | ✅ — `@view-transition { navigation: auto }` (`_pjcc-23-motion.scss`) |
| 7 | **Micro-interactions** — unified hover/press on buttons, cards, chips (lift + glow), from the tokens. | S | ◐ ad-hoc hovers exist; not yet unified from the motion tokens |

## Phase 2 — The front door, reinvented (bold)

The big swing. Substantial redesign of the first thing anyone sees.

| # | Item | Effort | Status |
|---|------|--------|--------|
| 8 | **A real moving hero** — replace the flat CSS skyline with a looping scene of Princess → Chess City (animated SVG / CSS now, a Blender loop later). The #1 lever against "flat." | L | ▢ |
| 9 | **Cinematic splash** — the McPuppy/PJCC front door as a signature 3-second moment, not a menu. | L | ▢ |
| 10 | **World-map navigation** — Checker Town → the Sea → Chess City as an explorable spine (we have `_layouts/worldmap.html` + locations). Turns "a menu" into "a place." | L | ▢ |
| 11 | **Retire / restyle the operative chrome** — reframe the ticker + HUD so it reads intentional and modern, not dated. (Copy changes here need Nate's sign-off.) | M | ▢ |

## Phase 3 — Product surfaces (games + academy as the product)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 12 | **Unified Arcade shell** — consistent HUD, share cards, one frame around every game; a "3D board" option later. | M | ▢ |
| 13 | **Academy as a real path** — "next lesson," progress, gentle streaks, taught-by-cast avatars (Duolingo/Brilliant patterns, no dark ones). | L | ▢ |
| 14 | **Dynamic Open Graph cards** per game / lesson / character, so shared links look modern. | M | ▢ |

## Phase 4 — The 3D / series payoff (sequence BEHIND Blender/Godot)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 15 | **Homepage 3D toy** — drag to rotate one chess piece (`<model-viewer>` / Three.js), lazy-loaded: a 2-second taste of the game's 3D. | M | ⏳ needs a model |
| 16 | **Sizzle / animatic** — a ~20-sec "what PJCC is," with sound, behind a play button. | L | ⏳ needs footage |
| 17 | **Swap glyph/emoji placeholders for rendered assets** as they land — one hero render at a time. | ongoing | ⏳ |

## Phase 5 — Alive & community (the growth loop)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 18 | **Devlog front-and-center** — a dated "Building in the open" feed; turn build-log posts into a visible weekly cadence. | S | ▢ |
| 19 | **Newsletter with a real reason** — episode drops, new lessons; the loop that makes everything compound. | M | ▢ |
| 20 | **Community surface** — Discord / updates channel + a "what's new" the returning visitor can see. | M | ▢ |

## Cross-cutting (apply throughout)

- **Performance budget** — measure LCP / CLS / INP; AVIF/WebP, preconnect, lazy media, so
  "rich" never means "slow." (`npm run perf` already prices ambient features.)
- **Accessibility by default** — focus rings, contrast, landmarks, motion prefs (already
  strong on reduced-motion).
- **Ship the PWA** — the offline arcade + "add to home screen" moment is genuinely app-tier.

---

## This week's focus

**Plan completely** (this doc) + **execute Phase 1**. Order: parallax (done) → design
tokens → type → whitespace/grid → scroll reveals → view transitions. Phase 2's moving hero
is the first *bold* piece once the foundation is set. Everything verified with a repro
screenshot before it hits `main`.

## The 2026-07-23 rework — the 20 re-pointed for the current front door

The original 20 (the phase tables above) were written against the OLD shape (splash-as-menu +
horizontal nav). After the front-door rework — a 2-second B/W intro → the single PJCC landing →
a left docked rail — several items changed target or turned out already-shipped. This is the
re-pointed read. **Legend:** ✅ shipped · ↻ re-pointed · ◐ open · ✂ fold/defer.

**Identity & type**
1. Bigger display type — ↻ the scale shipped; the real work is ADOPTING it (main pages + radius
   site-wide done 2026-07-23; see the `modernization-mission` memory).
2. Variable headline font — ◐ the fluid scale shipped; the variable-font swap is the open half.
3. Unify the two brands into one token system — ◐ radius now unified via `--r-*`; color/edge/
   surface tokens exist but card/button look is still partly ad-hoc per page.
4. Dark/light toggle — ✂ defer; the site already shifts by time-of-day + brand, and a manual
   toggle fights the authored day/night sky.

**Motion & the hero**
5. One moving hero — ↻ BIG re-point: the flat skyline is already deleted; the moving-image slot
   is now **the B/W intro card** (`index.md`), engineered as the Blender drop-in.
6. Parallax depth — ✅ shipped.
7. Scroll-reveal — ✅ shipped (`pjcc-reveal.js` / `data-reveal`); could extend to more sections.
8. Page transitions — ✅ shipped (`@view-transition { navigation: auto }`).

**The 3D / series payoff**
9. Homepage 3D toy — ◐ needs a model; the clean landing hero is its natural home.
10. Sizzle / animatic — ↻ collapses into #5: the intro card IS the sizzle slot.
11. Swap glyph/emoji placeholders for renders — ◐ ongoing (world-door icons + hero pieces first).

**Games & Academy as the product**
12. Unified Arcade shell — ◐ open; Gauntlet / Park Tables / review already share DNA.
13. Academy as a real path — ◐ in progress (framework rebuilt; next = next-lesson / streak / avatars).
14. Dynamic OG cards — ◐ open; cheap "shared links look modern" win.

**Modern web craft**
15. Performance budget — ◐ half-built (`npm run perf` prices features; no enforced thresholds;
    the merged landing has no baseline yet).
16. Accessibility — ✅ mostly (reduced-motion strong; contrast 24→0). Keep it per-change.
17. Ship the PWA — ◐ built but PRIVATE, gated on the `ENABLED` flip; iOS in-app sign-in untested.
18. Signature sound layer — ◐ open (the jukebox is the seed).

**Front door & growth loop**
19. World-map navigation — ↻ re-point: not primary chrome any more (nav is a rail) — becomes the
    destination behind the **Locations** door on the landing.
20. Cadence + newsletter — ◐ open; the seed is already on the landing (the "Building in the open" band).

**The new cheapest wins** (the old "start here" three are done): (a) token adoption — mostly done;
(b) put something moving in the intro slot (#5/#10); (c) a hold-the-line hero declutter — ✅ DONE
2026-07-23 (world-line links, per-word glint, and the sigil bloom all cut).

## Status log

- **2026-07-19** — Kickoff. Direction = bold reinvention. Shipped: town-sky depth + parallax
  (#4). Also that day (pre-mission): taller Chess City hero towers; Gauntlet game review +
  Robert the Expert bot.
- **2026-07-23** — **Status reconciled against the code.** A Phase-1 audit found the
  foundation further along than this table claimed. The type + spacing tokens (#1) shipped in
  `_pjcc-01-core.scss` on 2026-07-19; scroll-reveal (#5) is live via `pjcc-reveal.js` /
  `data-reveal`; View Transitions (#6) are on site-wide. So **all three of the original "start
  here" cheap moves are done** — the columns above now say so. The next cheap win shifted from
  *adding* tokens to **adopting** them: retiring the hand-tuned px in `_layouts/home.html` onto
  `--step-*` / `--space-*` / `--r-*`. Started with the cleanest component — the three world-doors
  on the PJCC landing (radius → `--r-lg`, gaps → `--space-*`, name/sub type → `--step-0`/`--step--1`,
  hover → `--dur-fast`/`--ease-out`) plus the hero lede + cast-tools rhythm. The poster geometry
  (the hero title clamp, the two-town pieces board, the CTA baseline alignment) is deliberately
  left literal — those are mechanical constants, not design-system values. Also this session
  (hero declutter, Nate): removed the "Checker Town → Chess City" world-line links + arrow, and
  the per-word title glint (the sweep). The list itself was re-worked for the current front-door
  shape (2-sec intro → single PJCC landing + left rail); several items re-pointed onto the intro
  slot as the Blender drop-in.
