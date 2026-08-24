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

  /* ══ THE MOON'S NEIGHBORHOOD (2026-08-19) ══════════════════════════════════════════
     Nate: "Can the moon have some faint stars in the near area? … or if it's cloudy that
     day, some faint clouds around the moon … some days, at a low probability, and never on
     meteor shower or northern lights days or eclipse days. But only if it adds MINIMAL
     performance hit."

     Three things to defend, and the first is his hard rule: */
  {
    const SKY  = fs.readFileSync(path.join(ROOT, '_includes/town-sky.html'), 'utf8');
    const HEAD = fs.readFileSync(path.join(ROOT, '_includes/town-weather.html'), 'utf8');
    const CSS  = fs.readFileSync(path.join(ROOT, '_sass/_pjcc-20-town-sky.scss'), 'utf8');
    /* the clock, evaluated the same way the moon block above does it — the roll has to be
       RUN over real dates, not pattern-matched, because "never on those three nights" is a
       property of three salted hashes and cannot be read off the source. */
    const T = (() => { const w = {}; new Function('window', 'self', CLOCK_ASSET)(w, w); return w.PJCC_TIME; })();

    /* ⚠⚠ NEVER ON THE THREE RARE NIGHTS. Each of those already CLEARS the sky, so a veil on
       one of them would spend a 1-in-100 night hiding the rarest thing the town does. Walked
       over ten years of real dates rather than asserted from the source, because the roll is
       three salted hashes and an `||` — exactly the shape that reads correct and is not. */
    let veiled = 0, clash = 0, days = 0;
    const d = new Date(2026, 0, 1);
    for (let i = 0; i < 3650; i++) {
      const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
                 '-' + String(d.getDate()).padStart(2, '0');
      days++;
      if (T.moonVeil(ds)) {
        veiled++;
        if (T.showerDay(ds) || T.auroraDay(ds) || T.eclipseDay(ds)) clash++;
      }
      d.setDate(d.getDate() + 1);
    }
    check('a veiled night never lands on a shower, an aurora or an eclipse', clash === 0,
      clash ? clash + ' collisions in ' + days + ' nights' : '0 collisions over ' + days + ' nights');
    /* ⚠ AND IT IS UNCOMMON BUT NOT RARE — above the shower (3%) and the aurora (1%), because
       thin cloud is the most ordinary thing on that list; well under half, because an effect
       you meet most nights is not weather, it is what the moon looks like. */
    const pct = 100 * veiled / days;
    check('…and it is a low probability, in the band between rare and routine',
      pct > 5 && pct < 20, pct.toFixed(2) + '% of nights');
    /* ⭐ PER NIGHT, NOT PER LOAD — the standing rule for everything ambient here. */
    check('…rolled off the town DATE, so one town has one sky all night',
      T.moonVeil('2026-08-19') === T.moonVeil('2026-08-19') &&
      /daySeed\(ds \+ '#moonveil'\)/.test(CLOCK_ASSET),
      'and salted, not carved out of the shared day seed');

    /* ⚠⚠ THE PERFORMANCE DECISION, PINNED. `.ts-orb` wears `filter: drop-shadow(...)` at
       night, and a filter re-rasterizes its whole SUBTREE whenever anything inside changes.
       Move the field inside the orb and the twinkle repaints a blurred 51px disc every
       frame — no visible change, real cost. Measured at 0.000 MB of compositor texture as a
       sibling; this check is what keeps it one. */
    check('the moon field is a SIBLING of the orb, never a child of it',
      /<i class="ts-orb"><\/i>\s*(\{%-?\s*comment[\s\S]*?endcomment\s*-?%\}\s*)?<div class="ts-moonfield"/.test(SKY),
      'the orb drop-shadow would re-raster the whole subtree on every twinkle');
    /* ⚠ AND THE VEIL DOES NOT MOVE. The moon is already crossing the sky; a drifting cloud
       over a moving moon is two motions arguing, and a static band never takes a layer. */
    check('…and nothing in the veil animates',
      !/\.ts-moon-veil[^{]*\{[^}]*animation/.test(CSS), 'static bands cost no layer at all');
    check('the veil is a gradient, not a blur filter',
      /\.ts-moon-veil \{[\s\S]*?radial-gradient/.test(CSS) &&
      !/\.ts-moon-veil \{[\s\S]*?filter:\s*blur/.test(CSS),
      'a blur is a paint pass per frame; a gradient rasters once');

    /* ⚠ DRAWN ONLY WHEN THERE IS A MOON TO DRAW IT ON. `moon-new` already takes the orb off
       the sky, and stars ringing an empty patch — or a veil over nothing — is the one night
       a month the whole effect points at a blank. */
    check('a new moon takes the field with it',
      /html\.sky-night\.moon-new \.ts-moonfield \{ display: none; \}/.test(CSS));
    check('the veil needs BOTH night and a veiled night to render',
      /html\.sky-night\.moon-veiled \.ts-moon-veil \{ display: block; \}/.test(CSS) &&
      /\.ts-moon-veil \{[\s\S]{0,200}?display: none;/.test(CSS),
      'default is off, so a missed class draws nothing rather than something');
    /* ⚠ AND NOT OVER AN ALREADY-OVERCAST SKY. The roll deliberately does not ask about cloud
       cover (same reason it does not ask about phase); the head script declines to stamp the
       class, because that is where cover is known. */
    check('the class is withheld when the sky is already covered',
      /if\(mv&&!ec\.forced&&c<=1\)R\.classList\.add\('moon-veiled'\)/.test(HEAD),
      'cloud-2 and cloud-3 already have a deck; rain and snow report 3');
    check('…and there is a preview switch, like the other rare skies',
      /qp\.get\('moonveil'\)!==null/.test(HEAD), '?moonveil=1');
  }


  /* ══ THE MILESTONE BANNER ═══════════════════════════════════════════════════════════
     Every assertion here is about a date this feature will meet ONCE. There is no rolling
     it back and looking again, and no percentage that makes a near miss acceptable: if the
     epoch is off by a day the banner flies on the wrong day, and nobody finds out until the
     day after. So the arithmetic is pinned rather than described. */
  {
    const T = (() => { const w = {}; new Function('window', 'self', CLOCK_ASSET)(w, w); return w.PJCC_TIME; })();
    /* ⚠ module-scope `SKY` is pjcc-game-sky.js, a different file entirely — read the two
       includes under their own names rather than shadowing it. */
    const SKY_INC  = fs.readFileSync(path.join(ROOT, '_includes/town-sky.html'), 'utf8');
    const HEAD_INC = fs.readFileSync(path.join(ROOT, '_includes/town-weather.html'), 'utf8');

    check('day 180 is 2026-08-28, and that is the half-year mark',
      T.milestone('2026-08-28') === '6 MONTHS',
      'Nate: "6 months is coming up in like four days (today is day 176)" on 2026-08-24');
    check('…and the days either side of it are ordinary',
      T.milestone('2026-08-27') === null && T.milestone('2026-08-29') === null,
      'a milestone is one day, like the shower and the aurora');
    check('day 1 is not a milestone of itself',
      T.milestone('2026-03-02') === null, 'year 0 is a start, not an anniversary');

    /* ⚠⚠ THE ANNIVERSARIES ARE THE REASON THIS IS NOT DAY ARITHMETIC. Day 365 lands on
       2027-03-01 and day 730 on 2028-02-29 — a day early, then a date that only exists in
       a leap year. Both of those are what a `days % 365` implementation would have shipped,
       and both would have been found by a human on the wrong morning. */
    check('the year marks are real anniversaries and never drift',
      T.milestone('2027-03-02') === '1 YEAR' && T.milestone('2028-03-02') === '2 YEARS' &&
      T.milestone('2029-03-02') === '3 YEARS' && T.milestone('2036-03-02') === '10 YEARS',
      '1/2/3 and 10 years, all on 03-02');
    check('…so the dates a day-count would have picked are NOT milestones',
      T.milestone('2027-03-01') === null && T.milestone('2028-02-29') === null,
      'day 365 and day 730 — both wrong, both silent');
    check('one YEAR, many YEARS',
      T.milestone('2027-03-02') === '1 YEAR' && !/YEARS/.test(T.milestone('2027-03-02')),
      'the banner has to read as English');

    /* ⚠ parts() emits an UNPADDED date on any browser that falls through to the catch path.
       Every other reader hashes `ds`, so it never mattered; this one compares it. */
    check('an unpadded date still fires the banner',
      T.milestone('2026-8-28') === '6 MONTHS' && T.milestone('2027-3-2') === '1 YEAR',
      "the parts() fallback emits '2026-8-28', not '2026-08-28'");

    check('a milestone names the sky, and outranks the rolled ones',
      T.skyKind('2026-08-28') === 'milestone',
      'a shower comes round again in a month; this does not');
    /* ⚠⚠ PROVE IT THROUGH SOMETHING THAT TAKES A DATE. The first draft of this check asked
       `T.clouds('2026-08-28')` and `T.weather('2026-08-28')` — and BOTH of those read the
       clock directly and take no `ds` at all (clouds takes `(kind, lv)`), so it was handing a
       date string in as a weather kind and grading the answer. It failed, which is the only
       reason the instrument got looked at. moonVeil(ds) is the one exported function that
       takes a date AND asks rareSky(), so it is what can actually be walked. */
    check('…and it is in the same tier: no milestone is ever a veiled night', (() => {
      for (let y = 0; y < 12; y++) {
        const ds = y === 0 ? '2026-08-28' : (2026 + y) + '-03-02';
        if (T.moonVeil(ds) !== false) return false;
      }
      return true;
    })(), 'the same rareSky() gate the shower and the aurora go through');
    check('…and rareSky() is where that comes from, not a second copy of the rule',
      /function rareSky\([^)]*\)\s*\{[^}]*milestoneDay/.test(
        CLOCK_ASSET.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*/g, ' ')),
      'one gate, so the forecast, the cover and the veil cannot drift apart');

    check('the banner beat fires on the day, and never on an ordinary one',
      T.skyBeat('banner', '2026-08-28') === true && T.skyBeat('banner', '2026-08-27') === false,
      'the plane IS the milestone, so it is a 100');

    /* A calendar walk, because the two rules above could both be right and still overlap or
       leave a gap somewhere in between. Exactly one banner day per year, no more. */
    check('exactly one milestone a year, and never two', (() => {
      const per = {};
      const start = Date.UTC(2026, 2, 2);
      for (let i = 0; i < 12 * 366; i++) {
        const ds = new Date(start + i * 86400000).toISOString().slice(0, 10);
        const m = T.milestone(ds);
        if (m) (per[ds.slice(0, 4)] = per[ds.slice(0, 4)] || []).push(m);
      }
      /* the RULE, not a magic total: the first year carries the half-year mark and every
         year after carries exactly one anniversary. A count would have to be re-derived
         every time the walk's length changed — and the first draft of this check got that
         count wrong by one, which is precisely the failure mode a rule avoids. */
      for (const y of Object.keys(per)) {
        if (per[y].length !== 1) return false;
        if (y === '2026' ? per[y][0] !== '6 MONTHS' : !/^\d+ YEARS?$/.test(per[y][0])) return false;
      }
      return Object.keys(per).length >= 11 && per['2026'] && per['2027'];
    })(), '2026 gets the half-year, every year after gets its anniversary');

    check('the sky markup carries the plane and the strip',
      /class="ts-banner"/.test(SKY_INC) && /class="ts-plane"/.test(SKY_INC) && /ts-banner-flag/.test(SKY_INC),
      '_includes/town-sky.html');
    check('…and the words come from the head, not from the markup',
      /--ms-text/.test(HEAD_INC) && /milestone-day/.test(HEAD_INC),
      'set before first paint, so the banner is never briefly wrong');
    check('…with a preview switch, like the other rare skies',
      /qp\.get\('milestone'\)!==null/.test(HEAD_INC), '?milestone=1');
  }

  await browser.close();
  done();
})().catch((e) => { console.error('\nABORT: ' + e.message); process.exit(2); });

function done() {
  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}
