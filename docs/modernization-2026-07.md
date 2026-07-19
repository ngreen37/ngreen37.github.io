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
| 1 | **Design tokens** — a type scale (`--step-*`), spacing rhythm (`--space-*`), radius/elevation, in a new `_sass` partial. The single source future work reads. | M | ▢ next |
| 2 | **Confident type** — a self-hosted *variable* display font; bigger, tighter headings; more generous body line-height. Apply to headings first. | M | ▢ |
| 3 | **Whitespace + grid pass** — consistent spacing scale + a responsive grid; the cramped retro feel eases immediately. | M | ▢ |
| 4 | **Town-sky depth + parallax** — layers drift toward the pointer + on scroll; far moves least, near most. | S | ✅ 2026-07-19 (76e3a94) |
| 5 | **Scroll-reveal layer** — `data-reveal` fade/rise on enter (IntersectionObserver, reduced-motion aware). | S | ▢ |
| 6 | **Page transitions** — the View Transitions API for cross-page morphs; app-like for ~20 lines. | S | ▢ |
| 7 | **Micro-interactions** — unified hover/press on buttons, cards, chips (lift + glow), from the tokens. | S | ▢ |

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

## Status log

- **2026-07-19** — Kickoff. Direction = bold reinvention. Shipped: town-sky depth + parallax
  (#4). Also that day (pre-mission): taller Chess City hero towers; Gauntlet game review +
  Robert the Expert bot.
