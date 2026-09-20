# ARCHITECTURE — how this site is put together

A map for walking the code. It answers "where does this live and what touches it",
not "how do I use it" — the runbooks in `docs/` do that.

**The shape in one paragraph.** This is a static Jekyll site on GitHub Pages. Every page
shares one `<head>`, one stylesheet and one town sky. The expensive things — the chess
engine, 3D models, the Godot game — load only on the pages that ask for them, which is why
no page stutters. Games are self-contained single files that work offline. Anything a
player earns syncs to Supabase; everything else is local.

---

## The render path — where a visitor's page comes from

```
_config.yml ──> Jekyll ──> _layouts/<layout>.html
                             ├── _includes/head.html      ONE head for the whole site
                             │     ├── pjcc-time.js       the town clock, inlined before first paint
                             │     ├── town-sky.html      the sky behind every page
                             │     └── pwa-head.html
                             ├── _includes/site-header.html
                             ├── the page's own content + its inline <style>
                             └── assets/css/style.scss ──> _sass/*.scss   ONE stylesheet
```

⚠ **The clock is inlined before first paint on purpose.** `<html>` gets `sky-<phase>` and
`cloud-<0..3>` set before anything renders, so the sky never flashes the wrong hour.

---

## The directories

| Path | What is in it |
|---|---|
| `index.md` | **The front door** — `chesswild.com/`. Long, with a big inline `<style>`. |
| `_layouts/home.html` | **`/pjcc/`** — the world's landing page. The other long one. |
| `games.md` | **The arcade hall** — every game in one grid. |
| `_layouts/` | 10 layouts. `default.html` wraps almost everything. |
| `_includes/` | 15 partials. Shared furniture: head, header, sky, weather, park table, chess piece. |
| `_sass/` | 31 partials, numbered. **Import order is load-bearing** — see below. |
| `assets/js/` | 48 scripts, one job each. Nothing bundles; pages load what they need. |
| `assets/games/` | 19 games. Each is one self-contained file. |
| `assets/vendor/` | Third-party slices: three.js, Stockfish. Never edited by hand. |
| `assets/models/` | Blender exports (`.glb`). Written by `npm run gen:models`. |
| `_characters/` `_locations/` `_evolutions/` `_tag_pages/` | Jekyll collections — lore, one file per entry. |
| `_posts/` | The blog. |
| `_data/` | YAML the templates read. |
| `tests/` | 68 checks **plus** the generators and simulators. Not just tests. |
| `docs/` | Runbooks — setup steps you follow once. |
| `private/` | Canon, roadmaps, backlog. **Gitignored, no remote.** |

---

## The stylesheet — one sheet, and the order matters

`assets/css/style.scss` imports `_sass/pjcc-00` through `pjcc-31` **in numeric order**, and
that order is the cascade. A partial can only override one with a lower number.

| | |
|---|---|
| `00-fonts` `01-core` | Fonts, then the **design tokens** — `--space-*`, `--step-*`, `--r-*`, `--dur-*`. Everything downstream reads these. |
| `02`–`12` | Studio, pages, flair, classified, world, characters, features, widgets, a11y, portal. |
| `13-nav` | The left drawer. Owns `--rail-w`, which the town sky also reads. |
| `14`–`19` | Profile, games, creator, companion, warp. |
| `20-town-sky` | The sky on every page. |
| `21-gauntlet-door` | **The only source for the Gauntlet door's look.** |
| `22-chess-canon` | **The board and piece colors.** Every real board reads these tokens. |
| `23-motion` `27-tap-targets` | The quiet switches; the 44px floor. |
| `24`–`31` | Desk lamp, front door, VS rails, first-100k, academy, 3D stage. |

⚠ `_pjcc-30-academy` **must** import after `20-town-sky`.
⚠ Pages also carry their own inline `<style>`. That is page-local and always wins — which is
why `/games/` can trim a global padding without touching any other page.

---

## The JavaScript — by job

Nothing is bundled. A page includes the scripts it needs, and `default.html` loads the
handful that every page needs.

| Job | Files |
|---|---|
| **Identity + saving** | `pjcc-profile.js` (the big one), `pjcc-config.js`, `pjcc-profile-bar.js` |
| **The town** | `pjcc-time.js` (clock), `pjcc-weather.js`, `pjcc-weather-canvas.js`, `pjcc-game-sky.js` |
| **Chess** | `pjcc-chess.js`, `pjcc-chess-ai.js`, `pjcc-openings.js`, `pjcc-analysis.js`, `pjcc-game-review.js`, `pjcc-pgn.js` |
| **Opponents** | `pjcc-auston.js`, `pjcc-adapt.js`, `pjcc-match.js`, `pjcc-systems.js`, `pjcc-gauntlet-engine.js` |
| **Rooms + doors** | `pjcc-hall.js`, `pjcc-games-data.js`, `pjcc-gauntlet-door.js`, `pjcc-vs.js`, `pjcc-portal.js` |
| **Art at runtime** | `pjcc-pieces.js`, `pjcc-face-art.js`, `pjcc-pet-art.js`, `pjcc-stage.js` (3D) |
| **Secrets** | `pjcc-eggs.js`, `pjcc-fragments.js` |
| **Economy** | `pjcc-gift.js`, `pjcc-leaderboard.js`, `pjcc-creator.js` |

⚠ **`PJCC` is not defined when a page's inline script parses.** `pjcc-profile.js` loads at the
foot of the page, so `if (window.PJCC…)` in page markup is always false. Wait for
`DOMContentLoaded`. No test catches this.
⚠ **`pjcc-profile.js` is an IIFE ending in `window.PJCC = PJCC`.** Loading it twice builds a
second object over the first and orphans everything registered against it.
⚠ **`assets/js/pjcc-time.js` is GENERATED** from `_includes/pjcc-time.js` by `npm run gen:clock`.
Edit the include, regenerate, commit both.

---

## The games — three different things wearing one word

| Kind | What it is | Cost to a visitor |
|---|---|---|
| **Arcade** (`assets/games/pjcc_*.html`) | One self-contained HTML file each: markup, style and JS together. Canvas 2D. Works offline. | Small. Measured free. |
| **Chess rooms** | A real board plus Stockfish (WASM) from `assets/vendor/`. | Engine loads **per room**, never on a hub. |
| **Godot** (`assets/games/checker-town/`) | A WebAssembly export. | **10.2 MB gzipped** — 94% of it is the engine, not the game. Behind its own door. |

⚠ `games/<slug>/` is a **wrapper page**. The game itself is `assets/games/pjcc_<slug>.html`.
Editing the wrapper does not change the game.

---

## The build — `tests/` holds the generators too

Nothing here runs on a visitor's machine. These write files you commit.

| Command | Makes |
|---|---|
| `gen:models` | Blender `.blend` → `.glb` for the site **and** the Godot project |
| `gen:pieces` | Blender → 512px piece PNGs for the Tournament Board |
| `gen:clock` | `_includes/pjcc-time.js` → `assets/js/pjcc-time.js` |
| `gen:city` `gen:puzzles` `gen:rating` `gen:marchland` | Baked data — skylines, puzzle pools, ladders |
| `gen:three` | The three.js slice in `assets/vendor/` |
| `gen:icons` `gen:splash` `gen:favicon` | PWA art |
| `sim:bots` `sim:skyrun` `sim:marchland` | Balance simulators — they print numbers, they change nothing |

---

## The tests

```
npm test            the site: CSS compiles, tags close, house rules, links, dead code
npm run test:games  the games and systems: 31 check files
npm run perf        real Chrome against the LIVE site — prices every ambient feature
npm run sweep       dead CSS classes, unused keyframes, unloaded JS  (also inside npm test)
```

⚠⚠ **Run the two suites SERIALLY.** `tests/parktables.check.js` writes a scratch file at
`assets/css/__pt_test.css`, and `tests/doors.check.js` scans that folder — concurrently they
fail in a way that looks exactly like a real regression.
⚠ **A pipe hides the exit code.** `npm test | grep …` reports *grep's* status. Redirect to a
file and echo `$?`.
⚠ A **pre-push hook** runs the gates. A failed push is usually a real finding.

---

## The rules that bite

These have each cost real time. They are the short version; the comment at each site has the long one.

1. **Animate `transform` and `opacity` only.** Anything else — `visibility`, `filter`,
   `background-position` — repaints on the main thread every frame, forever. One 8px letter
   animating `visibility` once cost more than every cloud, ticker and weather effect combined.
   `npm run perf` flags these as `⚠ REPAINTS: <property>`.
2. **Size is no defense.** Cost is painted *area* and frames per second, not bytes.
3. **One heavy thing per page, and the visitor chooses to open it.** three.js loads only where
   a `data-stage-model` exists; Stockfish only in chess rooms.
4. **Inside `background-clip: text`, `opacity` and `filter` reach nothing.** Only `visibility`
   does. Outside one, use `opacity`.
5. **A `.md` page is kramdown first.** It rewrites raw HTML in four ways. `npm run test:tags`.
6. **`[hidden]` loses to any `display:` value.** Say it out loud when you set one.
7. **Delete a dead keyframe, never `animation: none` it** — an override leaves something that
   still reads as live.
8. **Earned things sync as max/union/sticky.** A push only ever asserts true.
9. **American spelling, Title Case.** The pre-push gate enforces it, and it reads comments too.

---

## Where to start reading

- **"How does a page get built?"** → `_includes/head.html`, then `_layouts/default.html`.
- **"Why does it look like that?"** → `_sass/_pjcc-01-core.scss` for the tokens, then the
  numbered partial for the thing you are looking at.
- **"How does a game work?"** → open one file in `assets/games/`. They are self-contained on purpose.
- **"What is the world?"** → `_characters/` and `_locations/`.
- **"What is not done?"** → `private/FUTURE-IDEAS.md`.
