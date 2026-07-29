/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE GAMBIT ALTAR — the economy, checked against the SHIPPED source
 * -----------------------------------------------------------------------------------
 * This is a money system with no server-side referee: the wheel, the karma ledger and
 * the payout caps all live in the browser, so the only thing standing between a tuning
 * pass and an accidental credit printer is a test that runs the real arithmetic.
 *
 * IT RUNS THE ACTUAL FILE. `the-gambit/index.html`'s inline script is loaded into a
 * sandbox with just enough DOM to boot, and a hook is appended to hand its internals
 * back — the same instrument-a-copy trick as tests/harness.js. Nothing here re-implements
 * the maths; if the shipped numbers change, these numbers change.
 *
 * ⚠ THE BASELINE NUMBERS BELOW ARE THE POINT. `err miser` is the standing rule for this
 * economy: loosening later is a gift, tightening later is a takeaway. So the assertions
 * are one-sided — expected return may go DOWN without touching this file, and may never
 * go up past the ceilings written here without someone deciding to.
 *
 *   node tests/gambit.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
/* ⚠ NORMALISE LINE ENDINGS. These files are checked out CRLF on Windows, so every
   multi-line anchor below would miss against the raw text — and miss SILENTLY, as a
   "the script changed shape" abort that sends you looking at the wrong file. */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const GAMBIT = read('the-gambit/index.html');
const PROFILE = read('assets/js/pjcc-profile.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name + (detail ? '   ' + detail : '')); }
  else { fail++; console.log('  ✗ ' + name + (detail ? '   ' + detail : '')); }
}
function must(cond, msg) { if (!cond) { console.error('\nABORT: ' + msg); process.exit(2); } }

/* ── 1. load the altar's real script with a hook appended ─────────────────────────── */
const OPEN = '<script>\n(function () {';
const CLOSE = '  boot();\n})();';
must(GAMBIT.indexOf(OPEN) !== -1, 'the altar script no longer opens the way this test expects');
must(GAMBIT.indexOf(CLOSE) !== -1, 'the altar script no longer ends with boot(); — the hook has nowhere to go');

const body = GAMBIT.slice(GAMBIT.indexOf(OPEN) + '<script>\n'.length, GAMBIT.indexOf(CLOSE) + CLOSE.length)
  .replace(CLOSE, `  __out.push({
    TIERS: TIERS, squeeze: squeeze, multAt: multAt, weights: weights, odds: odds,
    oddsWord: oddsWord, courage: function (cred, offer, coll, best) {
      credits = cred; offerCredits = offer; selColl = coll; bestVal = best || 0; return courage();
    },
    offerValue: function (cred, offer, coll) { credits = cred; offerCredits = offer; selColl = coll; return offerValue(); },
    loadKarma: loadKarma, remember: remember, forget: forget, karmaScore: karmaScore,
    karmaWord: karmaWord, fadeWord: fadeWord, weightedPick: weightedPick,
    reachedCity: reachedCity, HALF_LIFE: HALF_LIFE, FADED: FADED, LEDGER_MAX: LEDGER_MAX
  });
})();`);

/* A DOM thin enough to be obviously fake and thick enough to boot. Everything the altar
   touches during module setup is an element read or a localStorage read; it never paints
   until applyAuth(), and PJCC.enabled:false sends it straight to the gate. */
function sandbox(store) {
  const el = () => new Proxy({ style: {}, classList: { add(){}, remove(){}, toggle(){} }, dataset: {} }, {
    get: (t, k) => (k in t ? t[k] : (typeof k === 'string' && /^(onclick|innerHTML|textContent|hidden|value|max|disabled)$/.test(k) ? t[k] : (() => {}))),
    set: (t, k, v) => { t[k] = v; return true; }
  });
  const localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
  return {
    document: { getElementById: el, createElement: el, querySelectorAll: () => [], addEventListener(){} },
    localStorage,
    window: { PJCC: { enabled: false }, matchMedia: () => ({ matches: false }), localStorage },
    PJCC: { enabled: false },
    performance: { now: () => Date.now() }
  };
}
function boot(store) {
  const out = [];
  const s = sandbox(store || {});
  new Function('document', 'localStorage', 'window', 'PJCC', 'performance', '__out', body)
    (s.document, s.localStorage, s.window, s.PJCC, s.performance, out);
  must(out.length === 1, 'the hook did not run — the altar script changed shape');
  return out[0];
}

console.log('\n── THE GAMBIT ALTAR ──────────────────────────────────────\n');
const G = boot();

/* ── 2. the six bands, straight out of pjcc-profile.js ────────────────────────────── */
const bandsSrc = /var BANDS = (\[[\s\S]*?\n  \]);/.exec(PROFILE);
must(bandsSrc, 'BANDS not found in pjcc-profile.js');
const BANDS = eval(bandsSrc[1]);
function rarity(v, vault) {
  let i = 0;
  for (let k = 0; k < BANDS.length; k++) if ((v || 0) >= BANDS[k].min) i = k;
  if (vault) i = Math.min(BANDS.length - 1, i + 1);
  return Object.assign({ tier: i + 1 }, BANDS[i]);
}
check('six rarity bands exist', BANDS.length === 6, BANDS.map(b => b.label).join(' · '));
check('band floors ascend', BANDS.every((b, i) => i === 0 || b.min > BANDS[i - 1].min),
  BANDS.map(b => b.min).join(' '));
check('band stakes ascend', BANDS.every((b, i) => i === 0 || b.stake > BANDS[i - 1].stake),
  BANDS.map(b => b.stake).join(' '));
check('the cheapest face is Common', rarity(25).key === 'common');
check('the 400cr Crown is Ultra-Rare', rarity(400).key === 'ultra');
check('a Vault piece gets a free band', rarity(200, true).tier === rarity(200).tier + 1,
  `200cr: ${rarity(200).label} → ${rarity(200, true).label}`);

/* ── 3. a collectable stakes its BAND, not its price ──────────────────────────────── */
const crown = { value: 400, band: rarity(400) };
const pawnish = { value: 25, band: rarity(25) };
check('the Crown stakes 90, not 400', G.offerValue(0, 0, crown) === 90, 'stake ' + G.offerValue(0, 0, crown));
check('a Common stakes 10', G.offerValue(0, 0, pawnish) === 10);
check('an offering is credits + stake', G.offerValue(100, 40, crown) === 130);

/* ── 4. courage comes from the band, not the sticker price ────────────────────────── */
const cCommon = G.courage(100, 0, pawnish, 0), cUltra = G.courage(100, 0, crown, 0);
check('an Ultra-Rare is braver than a Common', cUltra > cCommon, cCommon.toFixed(2) + ' → ' + cUltra.toFixed(2));
check('laying down an Ultra-Rare is maximum courage', cUltra >= 0.99, cUltra.toFixed(2));
check('giving away YOUR best still counts as bold', G.courage(100, 0, pawnish, 25) >= 0.95,
  G.courage(100, 0, pawnish, 25).toFixed(2));

/* ── 5. THE CAP NATE NAMED: all-in tops out at 1.4x ───────────────────────────────── */
const top = c => G.multAt(G.TIERS[G.TIERS.length - 1], c);
check('all-in caps at 1.4x', Math.abs(top(1) - 1.4) < 0.005, top(1).toFixed(3) + 'x');
check('a token offering still pays 2.2x at the top', Math.abs(top(0) - 2.2) < 0.005, top(0).toFixed(2) + 'x');
check('the ceiling FALLS as the stake rises (progressive)',
  [0, 0.25, 0.5, 0.75, 1].every((c, i, a) => i === 0 || top(c) < top(a[i - 1])),
  [0, 0.5, 1].map(c => top(c).toFixed(2) + 'x').join(' → '));

/* ── 6. the wheel: harder everywhere, and never a printer ─────────────────────────── */
function shape(c, karma) {
  const w = G.weights(c, karma), sum = w.reduce((a, b) => a + b, 0);
  let ev = 0, up = 0;
  G.TIERS.forEach((t, i) => { const m = G.multAt(t, c); ev += m * w[i] / sum; if (m > 1) up += w[i] / sum; });
  return { ev, up: up * 100, sum };
}
check('the weights are a probability distribution',
  [0, 0.5, 1].every(c => Math.abs(shape(c, 0).sum - 1) < 1e-9));
check('coming out ahead is likelier the braver you are',
  shape(1, 0).up > shape(0.5, 0).up && shape(0.5, 0).up > shape(0, 0).up,
  [0, 0.5, 1].map(c => shape(c, 0).up.toFixed(0) + '%').join(' → '));
/* THE HOUSE EDGE. If any of these three ever pass 1.0x the altar becomes the best-paying
   game on the site and every other loop on it stops mattering. */
check('a token offering loses money on average', shape(0, 0).ev < 0.60, shape(0, 0).ev.toFixed(2) + 'x');
check('all-in loses money on average', shape(1, 0).ev < 0.70, shape(1, 0).ev.toFixed(2) + 'x');
check('even MAXIMUM karma never breaks even', shape(1, 100).ev < 0.85, shape(1, 100).ev.toFixed(2) + 'x');
/* Regression against the wheel this replaced (Nate: "the odds should be reduced across
   the board. make it much harder"). The old one paid 0.66x → 0.89x and topped out at
   2.2x from ANY level of courage. */
check('strictly harder than the wheel it replaced',
  shape(0, 0).ev < 0.66 && shape(1, 0).ev < 0.89 && top(1) < 2.2,
  `${shape(0, 0).ev.toFixed(2)}x/${shape(1, 0).ev.toFixed(2)}x vs the old 0.66x/0.89x`);
check('"gone" is the single likeliest outcome at every courage',
  [0, 0.5, 1].every(c => { const w = G.weights(c, 0); return w[0] === Math.max.apply(null, w); }));

/* ── 7. the odds ladder still has live rungs across the real range ────────────────── */
const words = new Set([0, 0.25, 0.5, 0.75, 1].map(c => G.oddsWord(shape(c, 0).up))
  .concat([0, 1].map(c => G.oddsWord(shape(c, 100).up))));
check('the odds ladder is not stuck on one rung', words.size >= 3, [...words].join(' · '));

/* ── 8. karma: it remembers, it fades, and it lets go ─────────────────────────────── */
const DAY = 86400000;
{
  const store = {};
  const g = boot(store);
  g.remember({ weight: 20, cred: 100, label: 'a test sacrifice', glyph: '♟' });
  check('a bold loss is remembered', g.loadKarma().ledger.length === 1);
  check('karma rises with a fresh memory', g.karmaScore(g.loadKarma()) === 20,
    'karma ' + g.karmaScore(g.loadKarma()));

  /* Age it by hand — the decay is pure arithmetic on `at`, so backdating the stored
     record is the same as waiting, and it keeps the test instant. */
  const age = days => {
    const o = JSON.parse(store['pjcc.gambit.karma.v1']);
    o.ledger.forEach(e => { e.at = Date.now() - days * DAY; });
    store['pjcc.gambit.karma.v1'] = JSON.stringify(o);
  };
  age(6);
  check('a memory halves in six days', Math.abs(g.karmaScore(g.loadKarma()) - 10) <= 1,
    'karma ' + g.karmaScore(g.loadKarma()));
  age(12);
  check('and quarters in twelve', Math.abs(g.karmaScore(g.loadKarma()) - 5) <= 1,
    'karma ' + g.karmaScore(g.loadKarma()));
  age(16);
  const gone = g.loadKarma();
  check('a memory FALLS OFF once it fades past the floor', gone.ledger.length === 0,
    `${gone.lost} let go after 16 days`);
  check('the fall-off is counted, not silent', gone.lost === 1);
  check('and it stays gone on the next read', g.loadKarma().ledger.length === 0);
}

/* ── 9. the ledger is capped, and the oldest goes first ───────────────────────────── */
{
  const g = boot({});
  for (let i = 0; i < 12; i++) g.remember({ weight: 5, cred: 10, label: 'sac ' + i, glyph: '◈' });
  const k = g.loadKarma();
  check('the ledger is capped at ' + g.LEDGER_MAX, k.ledger.length === g.LEDGER_MAX, k.ledger.length + ' held');
  check('the four it dropped are counted as lost', k.lost === 4, k.lost + ' lost');
}

/* ── 10. v1 debt is migrated, not deleted ─────────────────────────────────────────── */
{
  const g = boot({ 'pjcc.gambit.owed': '250' });
  const k = g.loadKarma();
  check('an old v1 debt becomes a memory', k.ledger.length === 1 && k.ledger[0].cred === 250,
    'karma ' + g.karmaScore(k));
  check('and migrates exactly once', boot({ 'pjcc.gambit.owed': '250', 'pjcc.gambit.karma.v1':
    JSON.stringify({ v: 1, ledger: [], lost: 0, total: 0 }) }).loadKarma().ledger.length === 0);
}

/* ── 11. what comes home is weighted toward the fresh ─────────────────────────────── */
{
  const fresh = { w: 1, label: 'fresh' }, faint = { w: 0.2, label: 'faint' };
  let f = 0;
  for (let i = 0; i < 4000; i++) if (G.weightedPick([fresh, faint]).label === 'fresh') f++;
  check('a fresh memory comes home more often than a faint one', f > 3000 && f < 3700,
    (f / 40).toFixed(0) + '% of returns were the fresh one (expect ~83%)');
}

/* ── 12. the magnifying glass is locked until Chess City ──────────────────────────── */
check('the closer look is locked without the 1,000-puzzle stamp', boot({}).reachedCity() === false);
check('and unlocks with it', boot({ 'pjcc.fork.chesscity.v1':
  JSON.stringify({ at: new Date().toISOString(), laps: 1 }) }).reachedCity() === true);

/* ── 13. the phrase that had to go ────────────────────────────────────────────────── */
/* ⚠ Comments are stripped first, and deliberately: the block explaining WHY the line was
   retired names the line, and a test that can't tell a promise from a note about a
   promise would force the next person to delete the explanation to make it pass. */
const VISIBLE = GAMBIT.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '')
                      .replace(/^\s*\/\/.*$/gm, '');
check('"never wasted" is gone from what the visitor reads', VISIBLE.indexOf('never wasted') === -1,
  'memories can expire now, so the promise had to');
check('the replacement says memories fade', /Memories fade|memories here fade/.test(VISIBLE));

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
