# PJCC — Build Roadmaps (the destination phase)

*Decision made 2026-06-23: the site is built; the next ~3–6 months go to the **destination** — Blender +
Godot — built quietly, ending in a **launch flare** (the first thing real humans see). Zero views until
then is **runway, not failure** — but the runway has to end on a **date.***

**Pick ONE roadmap.** They share the guardrails below. The Godot phase tags (P0–P8) refer to the
step-by-step in `FUTURE-IDEAS.md`.

---

## Universal guardrails (apply to every roadmap)
1. **The date is sacred.** It's the forcing function. Without it, "I expect zero" quietly becomes
   permanent. Write the launch date on the wall today.
2. **Weekly minimum beats sporadic bursts.** You're a tortoise with a full-time job — protect a small,
   non-negotiable weekly chunk (even 1 evening) over rare big weekends. Momentum > heroics.
3. **No new website games or systems in the window.** Bug-fixes only. New ideas go to `FUTURE-IDEAS.md`
   to wait. This is the whole point.
4. **Learn in-context.** Week 1 = one Godot tutorial + one Blender beginner project. Then immediately
   apply it to *PJCC* assets — you learn fastest when it's tied to your real thing, not abstract.
5. **The success metric during the build is NOT views.** It's *milestones hit* and *weeks not skipped.*
   Views only become the scoreboard **after** the flare. Judge yourself by shipping, not by an empty room.
6. **Reuse what you already built.** Princess Dungeon and the Battle Room are your *specs*; the chess
   logic ports to GDScript; the leaderboard wiring is already designed (JavaScriptBridge → `PJCC.saveScore`).
   You are not starting from zero — you're starting from "tested 2D prototype + a written plan."
7. **Done beats perfect.** The flare can be rough. Shipped-and-rough out-launches polished-and-imaginary.

---

## The "Open vs. Silent" overlay (choose one; works with any roadmap)
- **Silent build** — head down, no posting; let the Press Pass / dispatch / Founders apparatus *sleep
  guilt-free* until the flare. Bigger surprise at launch. Best if posting drains you.
- **Open build** — post the *making* weekly (a 15-sec Blender WIP, a devlog GIF, "watch Princess get
  rigged"). The zero starts ticking up *during* the build, and it's dead-on-brand with your own
  "made in the open" thread. People watch a thing get *made* before they watch a thing that's done.
  Costs ~30 min/week. **Recommended if you can stomach showing rough work.**

---

## Roadmap 1 — **The Vertical Slice** *(6 months · recommended default)*
**Thesis:** prove the game. Ship ONE beautiful, web-exported Godot room — real PJCC chess-crawler gameplay
in 3D — embedded on the site and wired to the leaderboard, plus a short Blender Princess clip. **Window:
late June → December 2026.**

- **Month 1 (July):** P0 pipeline (Blender → `.glb` → renders in Godot) + tool fundamentals + P1 grey-box
  room (capsule hero, King-step movement, TurnManager, step-on-Stairs = win). *Milestone: you walk a
  capsule around a board in 3D.*
- **Month 2 (Aug):** P3 — port the proven movement/threat/attack logic to GDScript so the grey-box room
  **plays like the 2D prototype**, then **P6 web-export it early** (ugly but LIVE on the site, posting to
  the `dungeon` board). *Milestone: a real, if ugly, room is playable in a browser and de-risked.*
- **Month 3 (Sep):** P2 — model/rig **Princess + 2–3 chess-piece enemies** in Blender; swap out the
  capsules. *Milestone: it looks like PJCC, not a tech demo.*
- **Month 4 (Oct):** P4 — relics + the run loop (one floor, a 3-relic choice, hearts). *Milestone: it's a
  game, not a room.*
- **Month 5 (Nov):** P7 — juice (camera shake, particles, sound) + start a **Blender cutscene intro**
  (Princess entering the dungeon). *Milestone: it *feels* good.*
- **Month 6 (Dec):** finish the intro clip, polish, **SHIP** — embed the room, post the trailer, announce
  on the dispatch. **🚀 Launch flare: the zero ends here.**
- **Main risk:** the 3D learning curve in months 1–2. Mitigation: web-export *early* (Month 2), so the
  scariest part is behind you by fall.

---

## Roadmap 2 — **The Story Flare** *(3 months · fastest proof, fewest unknowns)*
**Thesis:** before building a whole game, test whether people fall for **Princess and the story** at all.
Ship a single **30–60 second Blender-rendered scene** — a real PJCC story beat (e.g., a Bill-and-Princess
montage moment, or a Checker-Town vignette). Cheaper and faster than a playable game, and it tests the
*actual product* (the character/show), not the funnel. **Window: late June → September 2026.**

- **Month 1 (July):** Blender fundamentals + **model & rig Princess** (the hero asset you'll need for
  *everything* later — never wasted). *Milestone: a poseable Princess.*
- **Month 2 (Aug):** build the scene — a small environment, camera moves, a simple animation/montage;
  rough render. *Milestone: a watchable rough cut.*
- **Month 3 (Sep):** polish + add a music bed (a leitmotif) + final render. **SHIP** the clip (site +
  dispatch + socials). **🚀 Launch flare.**
- **Bonus:** the Princess rig + the environment are **reused** in the Godot game later — this is a head
  start on Roadmap 1, not a detour.
- **Main risk:** animation is its own craft; keep the scene tiny (one location, one beat). A 30-second
  clip that *moves people* beats a 3-minute one that drags.

---

## Roadmap 3 — **The Hybrid** *(6 months · recommended overall)*
**Thesis:** do the Story Flare *first* (it teaches you Blender and gives an early emotional flare), then
roll straight into the Vertical Slice (the Princess rig is already done). Best of both — an early signal
*and* a playable destination. **Window: late June → December 2026.**

- **Months 1–2 (Jul–Aug):** Roadmap 2 compressed — learn Blender by **building the Princess rig + a
  30‑sec story clip.** **🚀 Mini-flare #1: ship the clip** (your first non-zero views, and proof people
  care about her).
- **Month 3 (Sep):** P0–P1 Godot pipeline + grey-box room (you already know Blender now, so this is faster).
- **Month 4 (Oct):** P3 rules → plays like the 2D prototype → **P6 web-export early.**
- **Month 5 (Nov):** P2 drop in the **already-built** Princess rig + enemies; P4 relics + run loop.
- **Month 6 (Dec):** P7 juice + polish, reuse the clip as the intro, **SHIP the playable room.**
  **🚀 Launch flare #2.**
- **Why it's the pick:** two flares instead of one (a story signal in Aug, a game in Dec), and the Blender
  learning curve pays for itself twice. Slightly more juggling — but the most *de-risked* path to both
  "do they love Princess?" and "is the game real?"

---

## How to choose (quick guide)
- **Most unsure people would even care?** → **Story Flare** (3 mo) — cheapest test of the real product.
- **Most confident; want the game to be the thing?** → **Vertical Slice** (6 mo).
- **Want both, and to learn Blender the smart way?** → **Hybrid** (6 mo) — *my recommendation.*
- **However you choose:** pick **Open or Silent**, write the **launch date on the wall**, protect the
  **weekly minimum**, and let `FUTURE-IDEAS.md` hold every shiny new website idea until the flare fires.

*Whatever you ship, the day it goes live is the day the tortoise's quiet ends — and the stadium you already
built finally has something playing in it.* 🐢
