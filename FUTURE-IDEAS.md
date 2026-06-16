# PJCC — Future Ideas

A running backlog of ideas raised across build sessions that we have **not** built
yet. Pulled from the whole chat history and project notes. Done items are not
listed here (they live on the site already: accounts, credits, leaderboards,
Dossier with rank ladder + achievements + world map + titles + pet mood + share
card, Shopkeeper avatars/titles/themes, jukebox, mailing list + Resend sync,
referrals, Cloudflare analytics, EN/JP toggle, Shogi v2, weekly bounty,
accessibility pass, opt-in coaching).

---

## New game concepts (bigger builds — own session each)
- **Sky Run — chess Bloons (à la Bloons Supermonkey 2).** A side/auto-scrolling shooter:
  Princess flies and pops chess pieces as they appear, town to town, ending at **Chess
  City**, with a **secret level: the CEO's Office**. Power-ups by piece:
  - **Bishop** → an **"X" shot** (four diagonal beams)
  - **Knight** → **two sharpshooter escorts** firing alongside you
  - **Queen** → a **super-shot** (screen-clearing blast)
  - **King** → the **end-villain / boss** of a region
  Best built in a real engine (or a focused canvas effort); ties beautifully to the
  Blender/Godot path so the flier + pieces could be 3D later. Scores would log to the
  same leaderboard.
- ~~**Tower Defense**~~ — **BUILT** as *Siege on Chess City* (`/games/tower-defense/`): the
  CEO's pieces march the Journey road; five PJCC defenders (Pawn Picket, Argus Outpost,
  Bishop Spire, Rook Bastion, Queen's Guard), upgrades/sell, a charge-up Royal Decree
  ultimate, 12 waves ending in the King boss. Scores log to the leaderboard.
- **Personality quiz** — a short quiz that tells you which PJCC character you're most like
  (Princess, the Rival/Kennie, the Father, Argus, Louie, the Narrator…). Shareable result,
  could grant a cosmetic title. Light to build, high shareability.

## Engagement / live features
- **Daily Dispatch** — one date-seeded challenge that's identical for every operative
  each day (a rotating game or fixed CIPHER word), with its own daily leaderboard and
  a consecutive-day streak. Framed as a Dead Drop intercept. Best single driver of
  daily return visits; the `scores` table already has a `seed` column for it.
- **Cross-game streak flame** — a unified "days active" streak shown on the Dossier
  (distinct from per-game streaks).
- **"Beat the creator" ghost scores** — Nate's own scores posted as the target to chase
  in each game.
- **Leaderboard Seasons / Tours + Hall of Fame** — periodic (monthly) resets, each a leg
  of the Journey to Chess City, with a permanent Hall of Fame page of past winners.

## Social
- **Guilds / Houses** — operatives pick a faction (Checker Town vs Chess City, or a
  piece-house); team leaderboards sum members' credits.
- **Async duels** — challenge another operative to the same seeded puzzle; compare
  scores; winner takes a credit pot.
- **Shareable result cards (per-game)** — extend the Dossier share card so each game can
  emit its own "I hit a CIPHER streak of 12" image at game-over (pairs with referrals).

## Story / world
- **Lore Codex** — a collectible in-universe encyclopedia; playing unlocks entries
  (characters, locations, Subject Zero), complementing the rank-fragment reveals.
- **Cross-link game cards to lore** — each game card deep-links to the character/location
  it ties to (Ferry → Shogi Island, Sand Mine → the Father).
- **"Find Princess" ARG / mystery door** — a hidden hub unlocked by collecting the
  `frag_` easter-egg fragments across the site, leading to a career-portfolio of
  different art styles/mediums (from the PJCC notes).

## Games page polish
- **Status filter tabs** — All / Playable / In Development / Daily.
- **"Daily" badge** on cards that have a date-seeded mode, with a done-today checkmark.
- **Animated card previews** — a small looping GIF/canvas thumbnail per game on hover.
- **Per-card mini-stat** — "Your best: 1,240" pulled from the player's saved data.
- **Game of the Week hero strip** at the top (the weekly bounty banner is a first step).

## Projects page polish
- **Version-history timeline / changelog** ("Ferry v1.0 → v1.1") so the "pending
  improvements" story is visible.
- **Progress meters** on In-Development cards ("Space Run — 60% to v1.0").
- **Public roadmap / "What's next"** that visitors can vote on.
- **Stat counters at the top** — "10 playable games · N completed · 1 in the lab."

## Audio / cosmetics
- **A PJCC original track** — commission/compose one studio theme for the jukebox, plus
  a per-game SFX toggle.
- **Jukebox favorites** — let logged-in operatives ❤ tracks (touches the site-wide
  jukebox; do carefully).
- **Board skins** — in-game cosmetic board themes sold in the Shopkeeper (themes
  currently only restyle the Dossier).
- **Full Japanese localization** — extend the EN/JP toggle beyond the nav to page body
  content.

## Onboarding / reach
- **Expanded coaching** — in-game guided first runs (current coaching is an opt-in panel
  on the wrapper pages for Shogi & Pirc).

## Animation (Blender)
- **Blender cutscene intros** — short rendered clips of rigged Princess + the chess
  pieces as game intros / loading screens / leaderboard-season trailers. (Saved favorite.)

## The big one — a real game
- **Binding of Isaac-style roguelite / 3D Space Run in Godot** — use the existing Blender
  assets (rigged Princess, chess pieces, the battle-room concept). Start with ONE
  playable battle room exported to HTML5, embedded on the games page like the others, and
  wired to the same Supabase profile/leaderboard. Then layer rooms + items + procedural
  floors. Pair Blender (assets) with Godot 4 (engine; GDScript ≈ Python, imports .blend,
  exports web).
