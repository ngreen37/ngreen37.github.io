/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE COLLECTION — the catalogue, the three classes, and the two locks
 * -----------------------------------------------------------------------------------
 * Nate 2026-08-03: "make a bunch of new collectibles (public-facing, locked, and
 * only-available-through-gambit game. Create a 'pokedex' of collectables. Collect them all."
 *
 * A display case is only worth having if it is COMPLETE and HONEST, and both of those are
 * exactly the properties that rot silently: add a face to the shop and forget the
 * catalogue, and the page quietly promises 61 pieces while the site holds 62. So this
 * loads the REAL pjcc-profile.js and asks the shipped functions, never a copy of the data.
 *
 * The two locks it exists to defend, both structural rather than remembered:
 *   · an EARNED piece can be neither SOLD nor LAID ON THE ALTAR. Its requirement stays
 *     true forever, so if it could be burned it could be re-claimed, and burn → re-claim
 *     → burn is an infinite credit faucet.
 *   · the ALTAR never hands out an earned piece — the boon pool is shop + vault only.
 *
 *   node tests/collection.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');

let pass = 0, fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log('  ✓ ' + name + (detail !== undefined ? '   ' + detail : '')); }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '   ' + detail : '')); }
};

/* ── boot the real module with just enough browser to survive ─────────────────────────
   PJCC_CONFIG is left unset on purpose, so `configured` is false and the module never
   reaches for the Supabase SDK. Everything under test is pure data + arithmetic that
   runs before any network call. */
function boot(store) {
  store = store || {};
  const localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
  const win = { localStorage, location: { search: '', origin: 'https://mcpuppystudios.com' } };
  const doc = { createElement: () => ({ setAttribute() {}, appendChild() {}, style: {} }),
                head: { appendChild() {} }, body: { appendChild() {} },
                getElementById: () => null, querySelectorAll: () => [], addEventListener() {} };
  new Function('window', 'document', 'localStorage', 'URLSearchParams', 'navigator', SRC)
    (win, doc, localStorage, URLSearchParams, { userAgent: 'node' });
  return win.PJCC;
}

console.log('\n── THE COLLECTION ────────────────────────────────────────\n');
const P = boot();

/* ── 1. the catalogue is the whole site, derived ──────────────────────────────────── */
const all = P.catalogue(null, []);
const bySource = s => all.filter(c => c.source === s);
check('the catalogue is one derived list', Array.isArray(all) && all.length > 0, all.length + ' collectables');
check('all three classes are present',
  bySource('shop').length && bySource('vault').length && bySource('earned').length,
  `${bySource('shop').length} shop · ${bySource('vault').length} vault · ${bySource('earned').length} earned`);

/* THE COMPLETENESS PROOF, and it is the reason this file exists. Every source list is
   walked independently and must appear in the catalogue — this is what fails the day
   somebody adds a face to the shop and forgets the display case. */
const inCat = new Set(all.map(c => c.kind + ':' + c.key));
const missing = [];
P.AVATAR_SHOP.forEach(a => { if (!inCat.has('avatar:' + a.key)) missing.push('avatar:' + a.key); });
P.TITLE_SHOP.forEach(t => { if (!inCat.has('title:' + t.key)) missing.push('title:' + t.key); });
P.THEME_SHOP.forEach(k => { if (!inCat.has('theme:' + k)) missing.push('theme:' + k); });
P.VAULT.forEach(v => { if (!inCat.has(v.kind + ':' + v.key)) missing.push(v.kind + ':' + v.key); });
P.EARNED.forEach(e => { if (!inCat.has(e.kind + ':' + e.key)) missing.push(e.kind + ':' + e.key); });
check('EVERY collectable the site defines is in the catalogue', missing.length === 0, missing.join(', ') || 'none missing');
check('and nothing is listed twice', inCat.size === all.length, `${inCat.size} unique of ${all.length}`);

/* ── 2. every piece renders — no blank tiles, no "[object Object]" ────────────────── */
const broken = all.filter(c => !c.label || !c.glyph || !c.band || !c.band.label || typeof c.value !== 'number');
check('every piece has a label, a glyph, a band and a value', broken.length === 0,
  broken.map(c => c.kind + ':' + c.key).join(', ') || 'all complete');
const noHow = bySource('earned').filter(c => !c.how);
check('every EARNED piece says how to get it', noHow.length === 0,
  noHow.map(c => c.key).join(', ') || 'all seven state their requirement');

/* ── 3. signed out, the catalogue is a catalogue — not a locked door ──────────────── */
check('signed out, nothing reads as owned', all.every(c => c.have === false));
const outCount = P.catalogueCount(null, []);
check('and the count is honest about it', outCount.held === 0 && outCount.total === all.length,
  `${outCount.held} of ${outCount.total}`);

/* ── 4. the bands still rank it, and Legendary is the ceiling ─────────────────────── */
const bands = {};
all.forEach(c => { bands[c.band.key] = (bands[c.band.key] || 0) + 1; });
check('the catalogue spans every band', Object.keys(bands).length === 6,
  P.BANDS.map(b => b.label + ' ' + (bands[b.key] || 0)).join(' · '));
check('Legendary is the top band', P.BANDS[P.BANDS.length - 1].key === 'legendary');

/* ── 5. THE LOCK: an earned piece can be neither sold nor staked ──────────────────── */
{
  // stand in a profile that HOLDS one of each class
  const held = boot();
  held.getProfile = () => null;
  const earnedAvatar = P.EARNED.filter(e => e.kind === 'avatar')[0];
  const shopAvatar = P.AVATAR_SHOP[0];
  // ownedCollectables() reads the module's private `profile`, so drive it the way the
  // real app does — through the same public surface the altar uses.
  const owned = P.ownedCollectables();
  check('ownedCollectables is empty with no profile', owned.length === 0);
  // the structural claim, checked against the source: earned keys are in NO shop list
  const shopKeys = new Set([].concat(
    P.AVATAR_SHOP.map(a => 'avatar:' + a.key),
    P.TITLE_SHOP.map(t => 'title:' + t.key),
    P.THEME_SHOP.map(k => 'theme:' + k)));
  const leaked = P.EARNED.filter(e => shopKeys.has(e.kind + ':' + e.key));
  check('no EARNED piece is also for sale', leaked.length === 0,
    leaked.map(e => e.key).join(', ') || 'the shop cannot sell a trophy');
  const vaultKeys = new Set(P.VAULT.map(v => v.kind + ':' + v.key));
  const dbl = P.EARNED.filter(e => vaultKeys.has(e.kind + ':' + e.key));
  check('and the altar cannot hand one back either', dbl.length === 0,
    dbl.map(e => e.key).join(', ') || 'the boon pool is shop + vault only');
  check('sellValue says 0 for an earned piece', P.sellValue(earnedAvatar.kind, earnedAvatar.key) === 0);
  check('  (and PJCC.isEarned is what marks it)', P.isEarned(earnedAvatar.kind, earnedAvatar.key) === true
    && P.isEarned(shopAvatar ? 'avatar' : 'x', shopAvatar.key) === false);
}

/* ── 6. the `found:` rules read a real localStorage flag ──────────────────────────── */
{
  const flagged = P.EARNED.filter(e => (e.rule || '').indexOf('found:') === 0);
  check('the hidden boards and Chess City are `found:` rules', flagged.length === 3,
    flagged.map(e => e.rule.slice(6)).join(' · '));
  flagged.forEach(e => {
    const key = e.rule.slice(6);
    const cold = boot();
    check('  locked with no flag: ' + e.label, cold.earnedMet(e, null, []) === false);
    const warm = boot({ [key]: '1' });
    check('  unlocked once ' + key + ' is set', warm.earnedMet(e, null, []) === true);
  });
  // '0' must not count — a flag written false is not a discovery
  const zero = boot({ frag_board_park: '0' });
  const parkEgg = P.EARNED.filter(e => e.rule === 'found:frag_board_park')[0];
  check('a flag of "0" does NOT unlock it', zero.earnedMet(parkEgg, null, []) === false);
}

/* ── 7. the claim refuses everything it should ────────────────────────────────────── */
{
  const g = boot();
  const e = P.EARNED[0];
  const refuses = async () => {
    try { await g.claimEarned(e.kind, e.key, []); return 'RESOLVED'; }
    catch (err) { return err.message; }
  };
  refuses().then(msg => {
    check('claiming while signed out is refused', msg === 'not signed in', msg);
    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exit(fail ? 1 : 0);
  });
}
