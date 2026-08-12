# PJCC Flair Request

## Required reading before responding
Read these files in full and confirm before generating:
1. `private/_pjcc/notes.md` — story bible. **Moved out of this repo 2026-08-12** into the private half (`private/` is gitignored here and has its own private remote), because the canon includes things that are deliberately never stated anywhere on the site. Same filename, same relative layout, one folder up. Chess gameplay is battle-room style; players inhabit pieces. Princess plays as a pawn, not a queen. This is permanent and non-negotiable.
2. `_pjcc/flair-log.md` — shipped and rejected items. Do not repeat patterns from either column.
3. `tools/flair_checker.js` — validation rules every flair piece must pass.
4. `_assets/css/style_css` — Royal Chess tokens (#2D1B69 purple, #F5C518 gold), existing components, animation conventions.

## The bar
Every suggestion must:
- Reinforce the chess-battle-room concept. This is not a generic chess site; it is a series about being inside the game.
- Pass the checker on first attempt. No new dependencies. Palette-compliant. Mobile-responsive. Accessible.
- Be implementable in under 30 minutes by a solo dev.
- Degrade cleanly on mobile and with JS disabled.

## Output format
Generate exactly 10 pieces of flair, with at least 2 in each category:
- Micro-interactions (hover, click, scroll-triggered)
- Copy/voice flourishes (404, empty states, button labels, alt text personality)
- Easter eggs (Konami code, dev console messages, hidden routes)
- Visual/decorative (backgrounds, transitions, decorative SVG)
- Motion or sound (subtle animations, optional audio)

For each piece, provide:
- **Name** (2–4 words, memorable)
- **Description** (2 sentences max)
- **PJCC tie-in** (one sentence: how does this reinforce battle-room?)
- **Effort** (1–5; 1 = 5 min, 5 = 30 min)
- **Payoff** (1–5; gut call on memorability)
- **Checker verdict** (pass / fail / needs-work, with one-line reason if not pass)
- **Files touched** (list of paths)

## After the list
Compute (Payoff − Effort) for each, sort descending, recommend the top 3. Do not implement. I will pick.

## Anti-patterns — do not suggest
- Parallax on hero
- Cursor trails
- "Hello world" console eggs
- Anything requiring a new npm package
- Anything off the Royal Chess palette
- [Append rejected items from flair-log.md as they accumulate]