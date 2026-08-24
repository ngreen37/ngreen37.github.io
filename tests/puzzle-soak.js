/* =============================================================================
 * puzzle-soak.js — generate a pile of puzzles and look HARDER at them than the
 * room's own gate does.   npm run soak:puzzles  [count-per-difficulty]
 * -----------------------------------------------------------------------------
 * Nate, 2026-08-24: "I took a photo of a broken puzzle - knight can take queen."
 *
 * ⭐ THE POINT IS THE DEPTH, NOT THE VOLUME. A gate that runs in a browser between two
 * puzzles can only look so far; a hunt that can take an afternoon can look further, and the
 * gap between the two is exactly where a "wait, the knight just takes the queen" puzzle
 * lives. So this asks the SAME two questions the gate asks, deeper:
 *
 *   SECOND-SOLUTION   is there a first move OTHER than the scripted one that still nets
 *                     +300 after the defender gets THREE plies? If so, the room is calling
 *                     a perfectly good move wrong — the player's complaint, exactly.
 *
 *   REFUTED-SOLUTION  does the SCRIPTED move still net +300 against that same deeper reply?
 *                     This is where "your own answer hangs a piece" shows up.
 *
 * ⚑ WHAT IT FOUND ON THE DAY IT WAS WRITTEN, and what came of it. The gate screened
 * alternatives ONE ply deep while proving its own line at `line.length + 1`, so any
 * alternative needing two moves to collect was invisible — and every skewer and every
 * discovered check has a three-move line. Measured, 200 puzzles, 20 at each difficulty:
 *
 *     the old 1-ply screen ......... 21% of puzzles came back suspect
 *     screened at line.length ......  8%   <- shipped; difficulties 1-4 came back clean
 *
 * Run with `--old` to watch that first number come back. The residual 8% is real and is
 * NOT a hole in the same sense: those are alternatives that win a ply BEYOND the horizon
 * the puzzle's own answer is proved to, and buying that ply costs 5x the generation time
 * and two men off the average board (the measurement table sits over secondSolution).
 *
 * ⚠ A HIT IS A SUSPECT, NOT A VERDICT. Material-only search has no idea about mate,
 * perpetual check or a fortress, so a deeper number disagreeing with a shallower one is a
 * position to LOOK AT, not proof of a bug. Every hit prints its puzzle code and its FEN so
 * it can be pasted straight onto a board. [[accuracy-above-all]]
 *
 * ⚠ IT DRIVES THE REAL ROOM. The generator, the referee and the search all live inside
 * assets/games/pjcc_fork.html, so a copy of them here would be a second implementation
 * free to disagree with the shipped one — which is the failure this file exists to catch.
 * ========================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { findChrome } = require('./harness');

let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { console.error('puppeteer-core not installed. Run `npm install` first.'); process.exit(2); }

const ROOT = path.join(__dirname, '..');
const GAME = path.join(ROOT, 'assets', 'games', 'pjcc_fork.html');
const PER_DIFF = Math.max(1, parseInt(process.argv[2], 10) || 25);
/* `--old` puts the pre-2026-08-24 screen back for the run (alternatives searched one ply,
   full window) WITHOUT touching the shipped file, so the fix can show its own before and
   after on the same machine in the same afternoon. A finding you cannot re-derive on
   demand is an anecdote. */
const OLD_GATE = process.argv.includes('--old');
const DEEP = 3;          // plies of defense the deeper look allows (the gate allows 1)
const WIN = 300;         // the room's own "a clean piece" threshold, in centipawns

/* Runs inside the page, for ONE difficulty. Everything it calls is the room's own. */
function soak(diff, n, DEEP, WIN, oldGate) {
  const out = { made: 0, failed: 0, second: [], refuted: [] };
  const prev = searchCap;
  const prevScreen = secondSolution;
  if (oldGate) secondSolution = function (p, b0, start) {
    const foe = p.side === 'w' ? 'b' : 'w';
    const first = uci(p.line[0][0]);
    for (const m of legalMovesFor(b0, p.side)) {
      if (m.fx === first.fx && m.fy === first.fy && m.tx === first.tx && m.ty === first.ty) continue;
      const moved = b0[m.fy][m.fx], cap = b0[m.ty][m.tx];
      b0[m.ty][m.tx] = moved; b0[m.fy][m.fx] = null;
      const v = -proveGain(b0, foe, 1, -Infinity, Infinity);
      b0[m.fy][m.fx] = moved; b0[m.ty][m.tx] = cap;
      if (v - start >= 300) return true;
    }
    return false;
  };
  searchCap = Infinity;                       // an afternoon, not a frame
  try {
    for (let i = 0; i < n; i++) {
      const p = genPuzzle(diff, Math.random);
      if (!p) { out.failed++; continue; }
      out.made++;
      const fen = puzzleFEN(p);
      const line = p.line.map(m => m[1]).join(' ');
      const b0 = parseBoard(p);
      const foe = p.side === 'w' ? 'b' : 'w';
      const start = (p.side === 'w' ? 1 : -1) * matSum(b0);
      const first = uci(p.line[0][0]);
      const row = { id: p.id, diff, fen, theme: p.theme, goal: p.goal, line, rating: p.rating };

      // ── is there a SECOND answer the shallow gate let through?
      for (const m of legalMovesFor(b0, p.side)) {
        if (m.fx === first.fx && m.fy === first.fy && m.tx === first.tx && m.ty === first.ty) continue;
        const moved = b0[m.fy][m.fx], cap = b0[m.ty][m.tx];
        b0[m.ty][m.tx] = moved; b0[m.fy][m.fx] = null;
        let v;
        try { v = -proveGain(b0, foe, DEEP, -Infinity, Infinity); }
        finally { b0[m.fy][m.fx] = moved; b0[m.ty][m.tx] = cap; }
        if (v - start >= WIN) {
          // A mate puzzle is allowed to have other material-winning moves — the goal is
          // mate, not material, so only a second MATE is a defect there (secondMate's job).
          if (p.cat === 'mate' || /\bmate\b/i.test(p.goal)) break;
          out.second.push(Object.assign({ alt: shortSan(b0, m.fx, m.fy, m.tx, m.ty), gain: v - start }, row));
          break;
        }
      }

      // ── and does the room's OWN answer survive the same deeper defense?
      if (!(p.cat === 'mate' || /\bmate\b/i.test(p.goal))) {
        const moved = b0[first.fy][first.fx], cap = b0[first.ty][first.tx];
        b0[first.ty][first.tx] = moved; b0[first.fy][first.fx] = null;
        let v;
        try { v = -proveGain(b0, foe, DEEP, -Infinity, Infinity); }
        finally { b0[first.fy][first.fx] = moved; b0[first.ty][first.tx] = cap; }
        if (v - start < WIN) out.refuted.push(Object.assign({ gain: v - start }, row));
      }
    }
  } finally { searchCap = prev; secondSolution = prevScreen; }
  return out;
}

(async () => {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Install one or set CHROME_PATH.'); process.exit(2); }

  const src = fs.readFileSync(GAME, 'utf8')
    .replace(/src="\/assets\//g, 'src="file:///' + ROOT.replace(/\\/g, '/') + '/assets/');
  const tmp = path.join(os.tmpdir(), 'pjcc_soak_' + Date.now() + '.html');
  fs.writeFileSync(tmp, src);

  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new',
    args: ['--no-sandbox', '--mute-audio'], protocolTimeout: 3600000 });   // a soak is allowed to take an hour
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message));
  await page.goto('file://' + tmp.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 20000 });

  console.log('\n=== PUZZLE SOAK — ' + PER_DIFF + ' per difficulty, defense searched ' + DEEP + ' plies ===');
  console.log('    screen under test: ' + (OLD_GATE ? 'THE OLD ONE (1 ply, restored for this run)'
                                                    : 'the shipped one (line.length plies, null window)') + '\n');
  const all = { made: 0, failed: 0, second: [], refuted: [] };
  for (let d = 1; d <= 10; d++) {
    const t0 = Date.now();
    const r = await page.evaluate(soak, d, PER_DIFF, DEEP, WIN, OLD_GATE);
    all.made += r.made; all.failed += r.failed;
    all.second.push(...r.second); all.refuted.push(...r.refuted);
    console.log('  difficulty ' + String(d).padStart(2) + ': ' + String(r.made).padStart(4) + ' made · '
      + r.second.length + ' second-answer · ' + r.refuted.length + ' refuted   ('
      + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
  }
  await browser.close();
  fs.unlinkSync(tmp);

  const show = (title, rows) => {
    if (!rows.length) return;
    console.log('\n── ' + title + ' (' + rows.length + ') ' + '─'.repeat(Math.max(0, 58 - title.length)));
    for (const r of rows.slice(0, 40)) {
      console.log('  puzzle ' + r.id + '  d' + r.diff + '  ' + r.theme + ' · ' + r.goal
        + (r.alt ? '\n    a second answer: ' + r.alt + '  (+' + r.gain + 'cp)' : '')
        + (r.alt ? '' : '\n    the room\'s answer nets only ' + r.gain + 'cp')
        + '\n    line: ' + r.line + '\n    FEN:  ' + r.fen);
    }
    if (rows.length > 40) console.log('  …and ' + (rows.length - 40) + ' more');
  };
  show('THE ROOM WOULD CALL A GOOD MOVE WRONG', all.second);
  show("THE ROOM'S OWN ANSWER DOES NOT HOLD UP", all.refuted);

  const bad = all.second.length + all.refuted.length;
  console.log('\n' + all.made + ' puzzles generated, ' + all.failed + ' attempts produced nothing, '
    + bad + ' suspect (' + (all.made ? (bad / all.made * 100).toFixed(2) : '0') + '%).');
  console.log(bad
    ? 'Each one above is a position to LOOK AT — a material-only search is not a referee.\n'
    : 'Nothing deeper disagreed with the gate at this depth and sample size.\n');
})();
