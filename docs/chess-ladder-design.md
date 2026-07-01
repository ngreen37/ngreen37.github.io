# The Gauntlet — chess-game ladder of opponents (design doc)

*Status: **Option A confirmed.** **Phase 1 (engine) shipped & perft-verified** —
`assets/js/pjcc-chess.js`. Phases 2+ (playable game, then the ladder) proceed next; the open
questions below shape the UX/ladder, not the engine. Headline Arcade build.*
*Working title: **The Gauntlet** (alts: The Ascent · Coronation Run · Challengers' Road · Rivals' Ladder).*

## 1. The fantasy

You play **real games of chess** against a ladder of PJCC characters and climb from a
fumbling Checker-Town recruit all the way to **the CEO** at the gates of Chess City. Each
rung is a named character with a distinct *playstyle* and *strength* — not "one engine, set
harder." Win to advance; the climb is the campaign. It reuses the world's existing meta:
City Crowns, a leaderboard board, and a dossier rank.

This is the first game on the site where you play a **whole game of chess**, not a puzzle —
the headline depth piece that anchors the arcade funnel.

## 2. Engine decision — fuller pros & cons

The riskiest part of a "real chess" build is **rule correctness** (legal move generation,
check/pin filtering, castling, en passant, promotion, draw conditions). The audit for the
Fork multi-solution bug surfaced the decisive fact:

> **A legal move generator + `legalMoves` / `makeMove` / `inCheck` / `isCheckmate` /
> `isStalemate` + SAN + a minimax search with mate scoring already exist in
> `assets/games/pjcc_blindfold.html`**, and an alpha-beta + `evaluate()` exist in
> `pjcc_shogi.html`. Both are shipping and use FEN. The hard part is largely *already written
> and in production.*

### Option A — Hand-rolled, extend the in-repo Blindfold engine  ✅ RECOMMENDED
**Pros**
- The proven part (rules + checkmate + search) already exists in two shipped games; we
  extract it to a shared `assets/js/pjcc-chess.js` instead of writing from scratch.
- **Total control of strength *and* personality** — depth, blunder rate, and eval weights
  per opponent. Essential for a beatable→brutal ladder and for teaching.
- Zero dependencies; fits the one-file-per-game, all-vanilla pattern; tiny payload.
- Same board model + `pjcc-pieces.js` rendering as Fork/Blindfold/Shogi → visually consistent.
- Verifiable: **perft** tests pin move-gen correctness to known node counts.

**Cons**
- Blindfold's engine was built to *generate puzzles* (mate/fork), not play full games — it
  must be audited and extended to tournament-legal completeness: castling rights, en passant,
  underpromotion, and the draws (50-move, threefold, insufficient material).
- We own correctness (mitigated by reuse + perft) and must keep the JS search fast (depth 1–4
  with alpha-beta + MVV-LVA ordering is cheap and plenty).

### Option B — Vendor chess.js for rules + custom AI
**Pros**: 100%-correct, battle-tested rules incl. every draw rule, out of the box; fastest path
to provably-legal; still allows a custom characterful AI on top; it speaks FEN, which Blindfold
already uses, so the boundary is clean.
**Cons**: an external dependency breaks the all-vanilla, self-contained ethos and is another
thing to vendor/update; it **duplicates** legal move-gen + checkmate the repo already has;
slight model divergence from the other chess games.

### Option C — Stockfish (WASM)
**Pros**: real grandmaster strength; a trivially unbeatable top boss.
**Cons**: ~1 MB+ WASM payload + init complexity for a quick web game; **hard to make
convincingly weak / human-beatable / characterful** on the low rungs ("weak Stockfish" plays
alien, not easy-human); opaque — no personality knobs; overkill and against the curated-
difficulty design.

### Recommendation
**Option A.** Extract the existing Blindfold engine into a shared, perft-tested module, extend
it to full legal rules, and write a tunable alpha-beta AI with per-opponent personality. It
reuses proven in-repo code, stays dependency-free and consistent, and gives the fine difficulty
control a *character* ladder needs. **chess.js (B)** is the sensible fallback only if we'd rather
not own rule-correctness. **Stockfish (C)** is the wrong tool for a beatable, characterful ladder.

## 3. Architecture

- `assets/js/pjcc-chess.js` (new, shared): board model, FEN I/O, **full** legal move generation,
  `inCheck` / `isCheckmate` / `isStalemate`, draw detection, SAN, and `applyMove`. Extracted from
  Blindfold, completed, and **perft-tested** (depths 1–4 against known counts from the start
  position and a few standard positions).
- `assets/js/pjcc-chess-ai.js` (new, shared): negamax + alpha-beta, iterative deepening optional,
  MVV-LVA move ordering; `evaluate()` = weighted material + piece-square tables + mobility +
  king safety + center. Exposes `bestMove(state, persona)`.
- `assets/games/pjcc_gauntlet.html` (new): the game — board UX + ladder shell, using
  `pjcc-pieces.js` for rendering (matches Fork/Blindfold/Shogi) and `pjcc-profile.js` for meta.

## 4. Opponent roster (the rungs)

Escalating, lore-grounded, mirroring the world's regions (Checker Town → Sand Mines → Sea →
Shogi Isle → Chess City) and Siege's boss cadence. Each is a config: `{ depth, blunderRate,
eval weights, book? }` plus portrait, accent, and flavor lines.

| # | Opponent | Region | Personality | Strength |
|---|----------|--------|-------------|----------|
| 1 | **Checker-Town Recruit** (a pawn conscript) | Checker Town | barely knows the moves; grabby | depth 1, high blunder — tutorial-tier |
| 2 | **Argus the Guard-Dog** | Checker Town | loyal, aggressive, chases captures | depth 1–2, attack-weighted |
| 3 | **The Sand-Mine Foreman** | Sand Mines | grinder, materialistic | depth 2 |
| 4 | **The Tidecaller** | The Sea | slow, defensive, positional | depth 2–3, king-safety eval |
| 5 | **The Shogi Sentinel** | Shogi Isle | tricky, loves forks/tactics | depth 3, low blunder |
| 6 | **The City Gatekeeper** | Chess City gates | solid all-rounder | depth 3–4 |
| 7 | **The Rival** | — | your foil; plays the Pirc | depth 4 + opening book, ~no blunder |
| 8 | **The CEO** | Chess City | the climax | depth 4–5 + book + best ordering |

Optional secret rung: **The King** — a gimmick/endgame challenge.

## 5. Difficulty & personality

Difficulty = **search depth × blunder rate × eval personality**, not depth alone.
- **Blunder rate** `p`: with probability `p`, play the 2nd/3rd-best (or a random legal) move.
  Low rungs are human-beatable; it also *expresses character* (a greedy bot overvalues material,
  an aggressive bot overvalues attacking the king).
- **Eval weights** per persona: `{ material, mobility, kingSafety, center, aggression }`.
- **Opening book** for the top rungs only (reuse the Pirc Protocol's opening data for the Rival;
  a short e4 book for the CEO).

## 6. Game UX

- Board + `pjcc-pieces.js` rendering (consistent with the other chess games). Tap-to-select →
  legal-move dots → tap-to-move; drag optional. **Promotion picker** (Q/R/B/N).
- Whose-move + check indicator; **bold "YOU PLAY WHITE / BLACK" badge** (the color-emphasis
  lesson from Fork carries over). Captured-pieces tray; SAN move list.
- Resign / offer-draw / restart; **takebacks + hints** allowed on low rungs (teaching), disabled
  on the Rival/CEO (competitive) — *open question below*.
- Game-end overlay with the opponent's flavor line; on a win, the ladder advances and pays Crowns.

## 7. Meta hooks (reuse what exists)

- Ladder progress in `localStorage` + PJCC profile (like Fork's journey restore).
- **City Crowns** on a win (as Siege does); a win unlocks the next rung.
- `PJCC.saveScore('chess-ladder', highestRung, {...})` + a new board in `leaderboards.md`.
- Dossier rank reflects the highest rung cleared.
- Later: a **daily gauntlet** (seeded opponent + handicap for everyone).

## 8. Build phases

- **Phase 0** — this doc, sign-off.
- ✅ **Phase 1 (done)** — extracted + **perft-verified** `assets/js/pjcc-chess.js` (startpos→d4,
  Kiwipete→d3, positions 3/5; plus FEN I/O, halfmove/fullmove clocks, insufficient-material &
  draw detection, repetition keys, disambiguated SAN, and a legal-move finder).
- **Phase 2** — vertical slice: a real game vs **one** tunable AI (board UX, promotion, all
  game-end states, resign).
- **Phase 3** — the ladder shell: roster, progression, unlock, Crowns, win/lose flavor.
- **Phase 4** — opening books for top rungs; leaderboard + dossier integration; polish
  (captured tray, move list, sound).
- **Phase 5 (later)** — daily gauntlet, accessibility, mobile tuning.

## 9. Open questions for sign-off

1. **Engine**: confirm Option A (extend the in-repo engine). Fallback is chess.js.
2. **Color**: always White, alternate per rung, or player's choice?
3. **Assist**: takebacks/hints on the early rungs (teaching) vs. strict throughout (competitive)?
4. **Name**: The Gauntlet / The Ascent / Coronation Run / Rivals' Road / other?
5. **Roster**: any must-include canon characters, or order tweaks?

## 10. Shipped (2026-07-01)

The game is live at `/games/the-gauntlet/` (`assets/games/pjcc_gauntlet.html`). Decisions locked:

- **Roster — 10 rungs, Argus first.** Argus the Guard-Dog (Checker Town Chess Open titleholder) opens the
  climb; the old anonymous "Checker-Town Recruit" was dropped. Order: **Argus → Sand-Mine Foreman → Tidecaller
  → Shogi Sentinel → City Gatekeeper → The Auditor → The Enforcer → The Vice President → The Rival → The CEO.**
  The last five are framed as the CEO's cronies climbing the floors of his tower.
- **Color:** alternate per rung (unchanged).
- **Assist:** strict throughout — no takebacks/hints (Q3 answered: strict).
- **Draw rule (Q new):** a draw does **not** advance you and does **not** cost progress — "you held the line,"
  play again to break the tie. Only a win opens the next rung.
- **Secret ending:** clearing the CEO drops a map from his coat — he owns **the Sand Mine Depths**. The victory
  screen unlocks a **▾ DESCEND** button straight to `/games/sand-mine-depths/`, and sets `prog.secret`.
- Progress key bumped to `pjcc.gauntlet.v2` (the roster overhaul invalidates old unlock indices).
