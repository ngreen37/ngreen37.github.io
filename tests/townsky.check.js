/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE TOWN'S SKY, WHERE IT NOW REACHES — cohesion #6 and ingenuity #11
 * -----------------------------------------------------------------------------------
 * Two things shipped together on 2026-08-03 and both are the same idea: the sky that has
 * kept the town's hour since July now reaches somewhere it never did.
 *
 *   §1–5  INSIDE THE GAMES — sixteen standalone shells that used to sit at a permanent
 *         midnight now wear the phase and the forecast.
 *   §6    ON THE WIRE — the ticker remembers the hour you last arrived in and says so,
 *         once: "LAST SEEN: DUSK."
 *
 * ═══════════════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════════════
 * PART ONE — THE GAMES WEAR THE TOWN'S SKY (cohesion #6)
 * -----------------------------------------------------------------------------------
 * Nate 2026-08-03: "Every game should wear the town's sky… If PJCC_TIME set their phase
 * too, playing Sand Mine at night would *feel* like night. Same clock, same town."
 *
 * THREE THINGS CAN GO WRONG HERE, and this file exists for each of them:
 *
 *   1. A SHELL FORGETS THE SCRIPTS. Sixteen standalone documents, and the seventeenth
 *      game will be written by copying one of them. pjcc-game-sky.js does nothing at all
 *      without pjcc-time.js and says nothing about it — the textbook
 *      [[feature-shipped-but-never-loaded]] — so every shell is grepped for BOTH tags,
 *      in ORDER, and a new game that misses one fails this suite instead of quietly
 *      living at a permanent midnight.
 *
 *   2. THE COLORS DRIFT. The wash is duplicated: once in _sass/_pjcc-09-widgets.scss for
 *      the site, once as a string in pjcc-game-sky.js for the games, because a game shell
 *      does not load the site stylesheet and there is no way to share the rule. So the
 *      two are parsed and compared channel for channel. Two copies of a color always
 *      drift; the only question is whether anything notices.
 *
 *   3. THE CLOCK GETS COPIED. The moment somebody pastes the clock into a game rather
 *      than loading it, the town has two clocks and one of them will be wrong about DST.
 *      assets/js/pjcc-time.js must stay a one-line Jekyll include of the real source.
 *
 * …and then it drives a real shell in a real browser and looks at what actually rendered.
 *
 *   node tests/townsky.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');
const ROOT = path.join(__dirname, '..');

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const SKY = read('assets/js/pjcc-game-sky.js');
const CLOCK_ASSET = read('assets/js/pjcc-time.js');
const WIDGETS = read('_sass/_pjcc-09-widgets.scss');
const GAMES = fs.readdirSync(path.join(ROOT, 'assets/games')).filter((f) => f.endsWith('.html'));

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── THE GAMES WEAR THE TOWN\'S SKY ─────────────────────────\n');

/* ── 1. EVERY SHELL LOADS THE PAIR, IN ORDER ──────────────────────────────────────── */
check('there are game shells to check', GAMES.length > 0, GAMES.length + ' shells');
let wired = 0;
GAMES.forEach((f) => {
  const src = read('assets/games/' + f);
  const t = src.indexOf('/assets/js/pjcc-time.js');
  const s = src.indexOf('/assets/js/pjcc-game-sky.js');
  if (t > -1 && s > -1 && t < s) { wired++; return; }
  check(`[${f}] loads the clock, then the sky`, false,
    t < 0 ? 'NO pjcc-time.js — this game has no clock and will sit at midnight forever'
          : s < 0 ? 'NO pjcc-game-sky.js — the clock is loaded and nothing reads it'
                  : 'WRONG ORDER — the sky script runs before the clock exists and exits silently');
});
check('every shell loads the clock and then the sky', wired === GAMES.length,
  wired + '/' + GAMES.length + ' shells');

/* ── 2. THE CLOCK IS THE REAL ONE, NOT A SECOND ONE ───────────────────────────────
   The games load `/assets/js/pjcc-time.js`; the site inlines `_includes/pjcc-time.js`.
   They must be the same clock or the arcade and the town will disagree about DST, the
   season, or the moon — and disagree quietly, on one day a year.

   It is a COMMITTED, GENERATED COPY (`npm run gen:clock`), not a Jekyll-built asset,
   and that is a lesson rather than a preference: the Jekyll version was front matter
   plus one `{% include %}`, which is correct in production and NOT JAVASCRIPT ON DISK.
   Every harness in tests/ serves the repo's own files, so the day the shells started
   loading it, gauntlet.check.js threw eighteen "Invalid or unexpected token" — with all
   eleven of its assertions still passing. A file only valid after a build is a file no
   test can see. */
{
  const SOURCE = read('_includes/pjcc-time.js');
  check('the loadable clock carries the whole source, byte for byte',
    CLOCK_ASSET.endsWith(SOURCE), CLOCK_ASSET.endsWith(SOURCE)
      ? SOURCE.length + ' bytes verbatim' : 'DRIFTED — run `npm run gen:clock`');
  check('…and adds nothing but the generated-file banner',
    CLOCK_ASSET.length - SOURCE.length < 700 &&
    /GENERATED FILE/.test(CLOCK_ASSET.slice(0, CLOCK_ASSET.length - SOURCE.length)),
    (CLOCK_ASSET.length - SOURCE.length) + ' bytes of banner');
  check('the file a browser fetches is real JavaScript, not Liquid',
    !/\{%|^---$/m.test(CLOCK_ASSET) && (() => {
      try { new Function(CLOCK_ASSET); return true; } catch (e) { return false; }
    })(), 'parses');
}

/* ── 3. THE WASH MATCHES THE SITE, VALUE FOR VALUE ────────────────────────────────── */
{
  const norm = (s) => s.replace(/\s+/g, '').replace(/;$/, '').toLowerCase();
  const grab = (txt, host, re) => {
    const out = {};
    let m;
    while ((m = re.exec(txt))) {
      const bg = /background:\s*([^;}]+)/.exec(m[3]);
      if (bg) out[m[1] + '::' + m[2]] = norm(bg[1]);
    }
    return out;
  };
  const site = grab(WIDGETS, 'site',
    /html\.((?:sky|town)-\w+)\s+\.town-weather-overlay::(after|before)\s*\{([^}]*)\}/g);
  const game = grab(SKY, 'game',
    /html\.((?:sky|town)-\w+)\s+\.pjcc-game-sky::(after|before)\s*\{([^}]*)\}/g);

  const siteKeys = Object.keys(site).sort();
  check('the site declares a wash for every hour and every weather', siteKeys.length === 7,
    siteKeys.join(' · '));
  check('the games declare exactly the same set', Object.keys(game).sort().join() === siteKeys.join(),
    Object.keys(game).sort().join(' · ') || 'NONE');
  siteKeys.forEach((k) => {
    check(`[${k}] the game's wash is the site's wash`, game[k] === site[k],
      game[k] === site[k] ? 'identical' : `\n      site: ${site[k]}\n      game: ${game[k]}`);
  });
}

/* ── 4. IT NEVER TOUCHES THE THINGS THE PERF LAW PROTECTS ─────────────────────────── */
{
  // comments stripped: the header explains at length WHY there is no canvas in here, and
  // a test that cannot tell a rule from the note about the rule forces the next person to
  // delete the explanation to make it pass. (Same trap as gambit.check.js §13.)
  const CODE = SKY.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  check('no falling weather is started inside a game',
    !/PJCCWeather|requestAnimationFrame|createElement\(['"]canvas/.test(CODE),
    'static wash only — a particle loop next to a game loop is the one thing perf will not forgive');
  check('the layer cannot swallow a click', /pointer-events:none/.test(CODE));
  check('the layer is inert to the reader', /aria-hidden/.test(CODE));
  check('nothing animates', !/animation|transition/.test(CODE),
    'the site fades its wash on a phase change; a game shell is loaded AT one phase');
}

/* ── 5. DRIVE A REAL SHELL ────────────────────────────────────────────────────────── */
(async () => {
  const exe = findChrome();
  if (!exe) { console.log('\n  (no Chrome found — skipping the browser half)'); return done(); }
  const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox'] });

  // Serve the repo's own files for anything the shell asks for, so this is the SHIPPED
  // script running in the SHIPPED document — not a reconstruction of either.
  async function openShell(shell, query) {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      const u = new URL(r.url());
      const local = path.join(ROOT, u.pathname.replace(/^\//, ''));
      if (fs.existsSync(local) && fs.statSync(local).isFile()) {
        const ext = path.extname(local);
        return r.respond({ status: 200, body: fs.readFileSync(local),
          contentType: ext === '.js' ? 'application/javascript'
                     : ext === '.html' ? 'text/html'
                     : ext === '.css' ? 'text/css' : 'application/octet-stream' });
      }
      return r.respond({ status: 404, contentType: 'text/plain', body: 'not served' });
    });
    await page.goto('https://chesswild.com/assets/games/' + shell + (query || ''),
      { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 250));
    return { page, errs };
  }

  {
    const { page, errs } = await openShell('pjcc_sandmine.html');
    const got = await page.evaluate(() => {
      const el = document.querySelector('.pjcc-game-sky');
      const cs = el && getComputedStyle(el);
      const after = el && getComputedStyle(el, '::after').backgroundImage;
      return {
        classes: document.documentElement.className,
        layer: !!el,
        fixed: cs && cs.position,
        clicks: cs && cs.pointerEvents,
        wash: after,
        canvases: document.querySelectorAll('canvas.tw-canvas').length,
        reported: window.PJCCGameSky || null
      };
    });
    check('the shell gets the town\'s hour on <html>', /\bsky-(dawn|day|dusk|night)\b/.test(got.classes),
      got.classes);
    check('and the town\'s season', /\bseason-(winter|spring|summer|fall)\b/.test(got.classes));
    check('one fixed, click-through sky layer is laid over the game',
      got.layer && got.fixed === 'fixed' && got.clicks === 'none',
      `${got.fixed} · pointer-events:${got.clicks}`);
    check('…and it is actually painting a gradient', /gradient/.test(got.wash || ''),
      (got.wash || 'none').slice(0, 58));
    check('no weather canvas was started inside the game', got.canvases === 0, got.canvases + ' canvases');
    check('what the script reports is what it actually painted',
      !!got.reported && got.classes.indexOf('sky-' + got.reported.phase) > -1,
      got.reported ? got.reported.phase + ' · ' + got.reported.kind : 'PJCCGameSky missing');
    check('no page errors', errs.length === 0, errs.join(' | ') || 'clean');
    await page.close();
  }

  /* ?wx= has to reach INSIDE the frame, or snow is unreviewable until December. In a real
     game page the switch is on the PARENT (the iframe src carries no query), which the
     script reads across the same-origin boundary; opened directly, its own URL is the
     fallback. This drives the fallback — the parent path is one try/catch above it. */
  {
    const { page } = await openShell('pjcc_fork.html', '?wx=snow');
    const cls = await page.evaluate(() => document.documentElement.className);
    check('?wx=snow paints a snowy sky inside the game', /\btown-snow\b/.test(cls), cls);
    await page.close();
  }
  {
    const { page } = await openShell('pjcc_fork.html', '?wx=clear');
    const cls = await page.evaluate(() => document.documentElement.className);
    check('?wx=clear leaves the game with no weather', !/\btown-(rain|snow|mist)\b/.test(cls), cls);
    await page.close();
  }

  /* ═══════════════════════════════════════════════════════════════════════════════
   * PART TWO — §6 THE SKY REMEMBERS (ingenuity #11)
   * -------------------------------------------------------------------------------
   * Nate: "Store the phase you last arrived in. Come back at a different hour and the
   * ticker says, once, quietly: 'Last seen: dusk.' Free continuity, no mechanics."
   *
   * "ONCE" IS THE WHOLE FEATURE AND IT IS INVISIBLE WHEN IT BREAKS. A memory that
   * repeats on every refresh is nagging; one that never fires is nothing at all; and
   * either failure looks exactly like the other from the outside — you cannot tell a
   * line that didn't apply from a line that was never written. Only a test can.
   *
   * ⚠ THE REAL BLOCK IS EXTRACTED FROM _layouts/home.html, VERBATIM, not retyped here.
   * The ticker is ~350 lines of Liquid-wrapped JS that cannot be imported, and a test
   * that reimplements the logic it is testing proves the test works. So the shipped
   * source is cut out by its own comment banner and run against stubs for the two
   * things it touches from outside itself (`item` and `DESK`).
   * ═══════════════════════════════════════════════════════════════════════════════ */
  {
    const HOME = read('_layouts/home.html');
    const a = HOME.indexOf('// ---- THE SKY REMEMBERS');
    const b = HOME.indexOf('// ---- BREAKING (studio-wide)');
    check('the sky-memory block is still in the ticker', a > -1 && b > a,
      a > -1 ? (b - a) + ' chars' : 'GONE — ingenuity #11 has been deleted or renamed');
    const BLOCK = HOME.slice(a, b);
    check('…and it is the ticker that says it', /item\(\s*'LAST SEEN: '/.test(BLOCK),
      'the line goes on the wire, not into a popup');

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', r => r.respond({ status: 200, contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>' }));
    await page.goto('https://chesswild.com/pjcc/', { waitUntil: 'domcontentloaded' });

    // one run of the shipped block, at a stated hour, on a stated desk
    const run = (phase, away) => page.evaluate((src, phase, away) => {
      window.__said = [];
      window.item = (text, cls) => window.__said.push({ text, cls });
      window.DESK = { away };
      window.PJCC_TIME = { phase: () => phase };
      eval(src);
      return { said: window.__said, stored: localStorage.getItem('pjcc.sky.last') };
    }, BLOCK, phase, !!away);

    await page.evaluate(() => localStorage.clear());

    let r = await run('day');
    check('a first-ever visitor is told nothing', r.said.length === 0, JSON.stringify(r.said));
    check('…but the hour is remembered from then on', r.stored === 'day', r.stored);

    r = await run('day');
    check('a refresh in the same hour stays silent', r.said.length === 0, JSON.stringify(r.said));

    r = await run('night');
    check('coming back at a different hour says it, once',
      r.said.length === 1 && r.said[0].text === 'LAST SEEN: DAY',
      r.said.map(s => s.text).join(' | ') || 'nothing');
    check('…quietly — its own class, not a news headline',
      r.said[0] && r.said[0].cls === 'ticker-item--memory', r.said[0] && r.said[0].cls);

    r = await run('night');
    check('and it does not say it again', r.said.length === 0, JSON.stringify(r.said));

    /* THE ONE THAT IS EASY TO GET WRONG. On a night the desk is unattended the line is
       suppressed — but suppression must happen BEFORE the write, or the memory is spent
       on a night it could never have been shown and the visitor silently loses it. */
    r = await run('dawn', true);
    check('an unattended desk says nothing', r.said.length === 0, JSON.stringify(r.said));
    check('…and does not SPEND the memory it refused to say', r.stored === 'night', r.stored);
    r = await run('dawn');
    check('so the next visit still has it to tell',
      r.said.length === 1 && r.said[0].text === 'LAST SEEN: NIGHT',
      r.said.map(s => s.text).join(' | ') || 'nothing — the memory was lost');

    // junk in storage must never reach the wire
    await page.evaluate(() => localStorage.setItem('pjcc.sky.last', 'tuesday'));
    r = await run('day');
    check('nonsense in storage is ignored, not printed', r.said.length === 0, JSON.stringify(r.said));

    await page.close();
  }

  /* ══ ⚠⚠ THE MOON IS THE SHAPE IT CLAIMS TO BE (2026-08-18) ═════════════════════════
     Nate: *"The moon looks a bit odd in its waning gibbous."*

     For a year the terminator was a same-size disc of sky slid across the face, and the
     difference of two EQUAL circles is always a crescent — so every gibbous night drew the
     wrong figure while the lit AREA was perfect. Nothing caught it, and the reason is worth
     writing down: **every phase it got wrong still looked like a moon.** A wrong picture
     that is still a plausible picture is invisible to a reviewer and to any test that only
     checks numbers.

     So this asserts the SHAPE, by measuring the area the drawn path actually encloses:

         half disc            = 0.500 of the disc
         half terminator ellipse (semi-axes a, r) = `a` of the disc
         crescent lit = 0.5 − a        gibbous lit = 0.5 + a

     ⭐ THE LOAD-BEARING ASSERTION IS THE LAST ONE: a moon that is more than half lit must
     DRAW more than half lit. That is exactly the sentence the old implementation could not
     satisfy at any value of its dial. */
  {
    const T = (() => { const w = {}; new Function('window', 'self', CLOCK_ASSET)(w, w); return w.PJCC_TIME; })();

    // lit fraction enclosed by the emitted path, read back off the path itself
    function drawnLit(p) {
      const m = p.match(/^M0\.5 0A0\.5 0\.5 0 0 (\d) 0\.5 1A([\d.]+) 0\.5 0 0 (\d) 0\.5 0Z$/);
      if (!m) return null;
      const a = parseFloat(m[2]), limb = +m[1], term = +m[3];
      // the terminator bows into the DARK (a gibbous) when its sweep matches the limb's
      return { lit: (limb === term ? 0.5 + a : 0.5 - a), a, gibbous: limb === term };
    }

    check('every phase emits a clip path', (() => {
      for (let i = 0; i < 30; i++) {
        const ds = new Date(Date.UTC(2026, 7, 1 + i)).toISOString().slice(0, 10);
        const mn = T.moon(ds);
        if (mn.name !== 'new' && !drawnLit(mn.path)) return false;
      }
      return true;
    })(), 'a parseable two-arc path on every night that has a moon');

    /* the gibbous half of the month, measured */
    const bad = [];
    for (let i = 0; i < 30; i++) {
      const ds = new Date(Date.UTC(2026, 7, 1 + i)).toISOString().slice(0, 10);
      const mn = T.moon(ds);
      if (mn.name === 'new') continue;
      const d = drawnLit(mn.path);
      if (mn.lit > 0.5 && !d.gibbous) bad.push(ds + ' lit ' + mn.lit.toFixed(2) + ' drawn as a crescent');
      if (mn.lit < 0.5 && d.gibbous) bad.push(ds + ' lit ' + mn.lit.toFixed(2) + ' drawn as a gibbous');
    }
    check('⚠⚠ a moon more than half lit is DRAWN more than half lit', bad.length === 0,
      bad.length ? bad.join(' · ') : 'all 29 nights draw the right figure — this is the 2026-08-18 bug');

    /* area fidelity on the gibbous side, where there is no floor to excuse a difference */
    let worst = 0, worstDs = '';
    for (let i = 0; i < 30; i++) {
      const ds = new Date(Date.UTC(2026, 7, 1 + i)).toISOString().slice(0, 10);
      const mn = T.moon(ds);
      if (mn.name === 'new' || mn.lit <= 0.5) continue;
      const err = Math.abs(drawnLit(mn.path).lit - mn.lit);
      if (err > worst) { worst = err; worstDs = ds; }
    }
    check('…and the gibbous area matches the real phase exactly', worst < 0.002,
      'worst ' + (worst * 100).toFixed(3) + '% on ' + worstDs);

    /* ⭐ the thin-crescent floor is DELIBERATE and must not be "fixed" back out — Nate
       picked 0.155 of a diameter from a render on 2026-08-09. It only ever LIFTS. */
    const thin = T.moon('2026-08-08');
    check('the thinnest crescent is still floored so it reads as a crescent',
      drawnLit(thin.path).lit > thin.lit && drawnLit(thin.path).lit >= 0.15,
      'lit ' + thin.lit.toFixed(3) + ' drawn ' + drawnLit(thin.path).lit.toFixed(3));

    check('waxing lights the RIGHT limb and waning the LEFT', (() => {
      const wax = T.moon('2026-08-15'), wane = T.moon('2026-08-27');
      return wax.waxing && !wane.waxing &&
             wax.path.startsWith('M0.5 0A0.5 0.5 0 0 1') && wane.path.startsWith('M0.5 0A0.5 0.5 0 0 0');
    })(), 'the northern hemisphere, which is what the chart shows');

    check('a new moon draws nothing at all', T.moon('2026-08-07').path === '',
      'it is not a thin moon, it is no moon');
  }

  await browser.close();
  done();
})().catch((e) => { console.error('\nABORT: ' + e.message); process.exit(2); });

function done() {
  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}
