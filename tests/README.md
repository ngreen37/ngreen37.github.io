# Game regression checks

Automated smoke tests that drive the **real** canvas games in headless Chrome and assert
their key behaviors still work. They exist to catch *regressions* — something that used to
work silently breaking after an edit.

They test **behavior/logic, not feel** (they can't tell you a game is fun) — but they'll catch
a JS crash, a broken promotion, a dog that stops fetching, or the Follow-the-Dog miss bug
coming back.

## Run

```bash
npm install            # one-time: installs puppeteer-core (no browser download)
npm run test:games     # run every game check
npm run test:skyrun    # just Sky Run
npm run test:ftd       # just Follow the Dog
```

Needs Chrome or Edge installed (puppeteer-core drives your system browser — it does **not**
download one). Auto-detected on Windows/mac/Linux; override with `CHROME_PATH=/path/to/chrome`.

Each check exits `0` on pass, `1` on failure — so they drop straight into CI or a git hook later.

## What's covered

- **Sky Run** (`skyrun.check.js`) — starts as Pawn/5 hearts · auto-fires · Focus engages on Shift ·
  Crockett fetches & delivers a power-up · the region boss has its own attack kind · a weak-point
  window opens · clearing a region promotes Princess a rank · no JS exceptions.
- **Follow the Dog** (`ftd.check.js`) — the fair-but-strict miss fix: no instant heart loss on the
  starter rook · no docking while riding · landing scores · survives with no input · a missed
  off-lane piece still costs exactly one heart, once · no JS exceptions.

## How it works

`harness.js` writes a throwaway **instrumented copy** of the game to your OS temp dir (the original
file plus a tiny `window.__t` hook that exposes internal state), loads it via `file://` in headless
Chrome, runs the assertions, then deletes the temp copy. **The shipped game files are never modified.**

## Adding a check for another game

Copy `ftd.check.js`, point `GAME` at the game's HTML, set `MARKER` to a unique string near the end of
its inline `<script>` (the hook is injected just before the marker's last occurrence, so it shares the
game's scope), and write a `HOOK` that exposes whatever state you want to assert on.
