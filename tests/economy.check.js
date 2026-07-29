/* SELLING BACK, AT A QUARTER — the miser rules, checked as arithmetic.
 *
 * Nate 2026-07-28: "Let's be able to sell items for 25% value. Shop, altar — I'd like to
 * err on the side of miser, as opposed to generous. We can always make it more generous
 * if we need later."
 *
 * The transaction itself needs a signed-in Supabase account, which a headless run can't
 * have — so this checks the part that decides the NUMBERS, which is the part that would
 * quietly drift. PJCC.sellValue() reads PJCC.ownedCollectables(), a public method, so the
 * inventory can be stubbed and every rule exercised for real against the shipped code.
 *
 * ⚠ What this does NOT prove: that burn-then-grant round-trips against the live database.
 *    That is a signed-in check and it stays a manual one.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('./harness');
const REPO = path.join(__dirname, '..');
const PROFILE = fs.readFileSync(path.join(REPO, 'assets/js/pjcc-profile.js'), 'utf8');

let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log('  ✓ PASS  ' + n); }
                          else { fail++; console.log('  ✗ FAIL  ' + n + (x !== undefined ? '   ' + JSON.stringify(x) : '')); } };

(async () => {
  console.log('\n=== SELL-BACK ECONOMY ===\n');
  const b = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', r => r.url().includes('pjcc-profile.js')
    ? r.respond({ status: 200, contentType: 'application/javascript', body: PROFILE })
    : r.continue());
  await p.goto('https://mcpuppystudios.com/shopkeeper/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));

  const r = await p.evaluate(() => {
    if (!window.PJCC || !PJCC.sellValue) return { missing: true };
    // Stand in a known inventory. sellValue() reads this through the public method, so the
    // shipped arithmetic runs untouched.
    PJCC.ownedCollectables = function () {
      return [
        { kind: 'avatar', key: 'sp-crown',  value: 400 },   // 100
        { kind: 'avatar', key: 'pc-knight', value: 25 },    // 6.25 -> 6
        { kind: 'avatar', key: 'sp-wolf',   value: 95 },    // 23.75 -> 23
        { kind: 'theme',  key: 'ember',     value: 180, vault: true },
        { kind: 'avatar', key: 'vt-comet',  value: 260, vault: true }
      ];
    };
    return {
      rate: PJCC.SELL_RATE,
      crown: PJCC.sellValue('avatar', 'sp-crown'),
      knight: PJCC.sellValue('avatar', 'pc-knight'),
      wolf: PJCC.sellValue('avatar', 'sp-wolf'),
      vaultTheme: PJCC.sellValue('theme', 'ember'),
      vaultAvatar: PJCC.sellValue('avatar', 'vt-comet'),
      unowned: PJCC.sellValue('avatar', 'sp-dragon'),
      freeStarter: PJCC.sellValue('avatar', 'human-1'),
      isVault: PJCC.isVault('avatar', 'vt-comet')
    };
  });

  if (r.missing) { console.log('  ✗ FAIL  PJCC.sellValue is not exposed'); process.exit(1); }

  ok('the rate is a quarter', r.rate === 0.25, r.rate);
  ok('400 sells for 100', r.crown === 100, r.crown);
  // the miser rules, one assertion each — every one of them is a single edit to loosen
  ok('25 sells for 6, not 6.25 and not 7 (it FLOORS)', r.knight === 6, r.knight);
  ok('95 sells for 23, not 24', r.wolf === 23, r.wolf);
  ok('a Vault theme is not for sale', r.vaultTheme === 0, r.vaultTheme);
  ok('a Vault avatar is not for sale', r.vaultAvatar === 0, r.vaultAvatar);
  ok('  (and the Vault list is what says so)', r.isVault === true, r.isVault);
  ok('something you do not own sells for nothing', r.unowned === 0, r.unowned);
  ok('the free starter faces are not sellable', r.freeStarter === 0, r.freeStarter);
  // selling and re-buying must cost you — that IS the design, not a rounding artifact
  ok('sell + re-buy costs 75% of the price', 400 - r.crown === 300, 400 - r.crown);

  console.log(`\nRESULT: ${fail ? 'FAIL' : 'PASS'} — ${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
