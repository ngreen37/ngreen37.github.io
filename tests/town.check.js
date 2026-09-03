#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   town.check.js  —  npm run test:town

   The seam Checker Town talks through. The town is a Godot build in an iframe that plays no
   chess: it opens a Park Tables board and asks the site who won. Two functions answer, and
   this file is the only thing standing between them and a loop that silently pays twice.

   ⚠⚠ THE ONE THAT COSTS REAL PROGRESS IS `beaten`. It is a DAY STAMP PER OPPONENT, not a
   set — union it the way `army` is unioned and the second device hands out a second piece
   from the same person on the same day, which is the rule the whole loop rests on.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');
const { findChrome, report } = require('./harness');

const ROOT = path.join(__dirname, '..');
const PORT = 8794;

const results = [];
/* report() prints only .msg, so a detail is folded in rather than silently dropped. */
const ok = (cond, msg, detail) => results.push({ pass: !!cond, msg: msg + (detail ? '   [' + detail + ']' : '') });

/* ── 1 · the writer: Park Tables has to stamp the result at all ────────────────── */
const PT = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');

function fn(src, name) {
  const a = src.indexOf('function ' + name + '(');
  if (a < 0) return '';
  let d = 0, i = src.indexOf('{', a);
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') d++;
    else if (src[j] === '}' && --d === 0) return src.slice(a, j + 1);
  }
  return '';
}

const markLast = fn(PT, 'markLast');
const finishAs = fn(PT, 'botFinishAs');
ok(markLast, 'Park Tables has a markLast()');
ok(/pjcc\.pt\.last\.v1/.test(markLast), '…and it writes pjcc.pt.last.v1');
ok(/\bat:\s*Date\.now\(\)/.test(markLast),
  '…stamped with Date.now(), or "did that just happen" has no answer');
ok(/won:\s*!!botWon\(st\)/.test(markLast),
  '…and records who won  (⚠ botWon() means YOU won — the name reads backwards)');
/* ⚠ SLICED FROM THE FUNCTION, never grepped from the file: a call in a comment would
   satisfy a whole-file grep, which is how a check in this repo once passed on prose. */
ok(/markLast\(st\)/.test(finishAs),
  'botFinishAs calls it — the one funnel all four endings come through');
ok(finishAs.indexOf('markLast(st)') < finishAs.indexOf('logFinished('),
  '…before logFinished, so nothing that throws in the log can eat the stamp');
/* the loss half: a loss does not spend the day, but it does end the errand */
ok(!/if\s*\(\s*botWon\(st\)\s*\)\s*\{[^}]*markLast/.test(finishAs),
  'and it is NOT inside the win branch — a loss has to clear the pending challenge too');

/* ── 2 · the readers, in a real browser against the real file ──────────────────── */
const PAGE = `<!doctype html><meta charset="utf-8"><title>t</title>
<script src="/assets/js/pjcc-config.js"></script>
<script src="/assets/js/pjcc-systems.js"></script>
<script src="/assets/js/pjcc-profile.js"></script><body>`;

const TYPES = { '.js': 'text/javascript', '.html': 'text/html' };
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/t/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(PAGE); }
  const f = path.join(ROOT, url);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }
  await new Promise((r) => server.listen(PORT, r));
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto('http://localhost:' + PORT + '/t/', { waitUntil: 'load', timeout: 20000 });
    await new Promise((r) => setTimeout(r, 300));

    ok(await page.evaluate(() => typeof window.PJCC === 'object'), 'window.PJCC exists');
    ok(await page.evaluate(() => typeof PJCC.townResult === 'function'), 'PJCC.townResult is a function');
    ok(await page.evaluate(() => typeof PJCC.mergeTown === 'function'), 'PJCC.mergeTown is a function');

    /* ── townResult ─────────────────────────────────────────────────────────────── */
    const R = await page.evaluate(() => {
      const set = (o) => localStorage.setItem('pjcc.pt.last.v1', JSON.stringify(o));
      const out = {};
      localStorage.removeItem('pjcc.pt.last.v1');
      out.noRecord = PJCC.townResult('crockett', 0);
      set({ bot: 'crockett', result: '0-1', won: true, at: 5000 * 1000 });
      out.hit = PJCC.townResult('crockett', 0);
      out.wrongKey = PJCC.townResult('argus', 0);
      out.noKey = PJCC.townResult('', 0);
      out.olderThanSince = PJCC.townResult('crockett', 9000);   // seconds; stamp is 5000s
      out.newerThanSince = PJCC.townResult('crockett', 4000);
      set({ bot: 'crockett', result: '1-0', won: false, at: 5000 * 1000 });
      out.loss = PJCC.townResult('crockett', 0);
      localStorage.setItem('pjcc.pt.last.v1', 'not json');
      out.garbage = PJCC.townResult('crockett', 0);
      return out;
    });
    ok(R.noRecord === null, 'townResult: null when no game has been played');
    ok(R.hit === true, 'townResult: true on a win against that opponent');
    ok(R.loss === false, 'townResult: false on a loss  (⚠ not null — a loss ends the errand)');
    ok(R.wrongKey === null, 'townResult: null for a different opponent');
    ok(R.noKey === null, 'townResult: null for an empty key');
    ok(R.garbage === null, 'townResult: null rather than throwing on a corrupt record');
    /* ⚠⚠ THE UNIT TRAP. Godot sends SECONDS, Park Tables stamps MILLISECONDS. Reverse the
       comparison and every past win reads as current — a piece per visit, forever. */
    ok(R.olderThanSince === null,
      'townResult: null when the result predates the challenge  (seconds vs ms)');
    ok(R.newerThanSince === true, '…and answers when the result came after it');

    /* ── mergeTown ──────────────────────────────────────────────────────────────── */
    const M = await page.evaluate(() => {
      localStorage.removeItem('pjcc.town.v1');
      PJCC.mergeTown({ day: 4, ore: 10, hearts: 3, army: [0, 5], ceo_beaten: false,
                       beaten: { crockett: 4, argus: 2 }, scouted: { crockett: 3 } });
      const first = JSON.parse(localStorage.getItem('pjcc.town.v1'));
      // the other device: further on in places, BEHIND in others
      const merged = PJCC.mergeTown({ day: 2, ore: 40, hearts: 1, army: [5, 11],
                                      ceo_beaten: true, beaten: { crockett: 1, kedar: 6 },
                                      scouted: { crockett: 1, argus: 2 } });
      return { first: first, m: merged, stored: JSON.parse(localStorage.getItem('pjcc.town.v1')) };
    });
    ok(M.first && M.first.day === 4, 'mergeTown: writes pjcc.town.v1');
    ok(JSON.stringify(M.m.army) === JSON.stringify([0, 5, 11]),
      'mergeTown: army is a UNION of slot indices, deduped and sorted', JSON.stringify(M.m.army));
    ok(M.m.day === 4, 'mergeTown: day takes the MAX — a stale row cannot rewind the calendar');
    ok(M.m.ore === 40, 'mergeTown: ore takes the MAX');
    ok(M.m.hearts === 3, 'mergeTown: hearts take the MAX');
    ok(M.m.ceo_beaten === true, 'mergeTown: ceo_beaten is sticky (OR) — you cannot un-beat him');
    ok(M.m.beaten.crockett === 4,
      '⚠⚠ mergeTown: beaten is MAX PER KEY, so a stale day cannot free a second piece today',
      'crockett=' + M.m.beaten.crockett);
    ok(M.m.beaten.kedar === 6, '…and a key only the other device knows is kept');
    ok(M.stored && M.stored.beaten.crockett === 4, '…and the merge is what gets stored');
    /* what a loss BOUGHT you. Dropped from this merge it lives only in the town's own save
       and dies on the first device that pulls the account copy down over it. */
    ok(M.m.scouted && M.m.scouted.crockett === 3,
      'mergeTown: scouted is MAX PER KEY too — a tendency you learned stays learned',
      'crockett=' + ((M.m.scouted || {}).crockett));
    ok(M.m.scouted && M.m.scouted.argus === 2, '…and a key only the other device knows is kept');

    /* ── 2b · the way BACK into the game ─────────────────────────────────────────────
       ⚠⚠ THE TWO STORES ARE NOT ONE STORE. The account's copy is localStorage; the town's
       own save is Godot's `user://`, which on web is IndexedDB. mergeTown alone shipped a
       one-way sync: a signed-in player on a new device had their state pulled down and then
       watched the town boot Day 1 straight over the top of it. */
    const S = await page.evaluate(() => {
      localStorage.removeItem('pjcc.town.v1');
      const empty = PJCC.townState();
      PJCC.mergeTown({ day: 9, ore: 42, army: [0, 1, 2], beaten: { crockett: 8 } });
      return { empty: empty, after: PJCC.townState() };
    });
    ok(S.empty === null, 'townState: null before anything is known — not an empty object');
    ok(S.after && S.after.day === 9 && S.after.army.length === 3,
      'townState: hands back the merged copy for the town to read at boot',
      'day ' + (S.after || {}).day);

    /* ── 2c · the scouting facts, and whether they can be TRUE ───────────────────────
       A loss reveals what an opponent plays. That is advice acted on at a real board, so an
       id in regulars.yml that pjcc-systems.js cannot name produces a BLANK fact — the reveal
       fires, the row is spent, and the player is told nothing. [[accuracy-above-all]] */
    const PAGE_SRC = fs.readFileSync(path.join(ROOT, 'games/checker-town/index.html'), 'utf8');
    ok(/id="ct-facts-data"/.test(PAGE_SRC) && /site\.data\.regulars/.test(PAGE_SRC),
      'the facts island is READ from _data/regulars.yml, never typed');
    ok(/window\.TOWN_FACTS/.test(PAGE_SRC), 'and it publishes window.TOWN_FACTS for the game');

    const YML = fs.readFileSync(path.join(ROOT, '_data/regulars.yml'), 'utf8');
    const sysIds = [...YML.matchAll(/^\s*sys_[wb]:\s*(\S+)\s*$/gm)].map((m) => m[1]);
    ok(sysIds.length > 0, 'regulars.yml still carries sys_w/sys_b', sysIds.length + ' ids');
    const named = await page.evaluate((ids) => {
      const bad = [];
      for (const id of ids) {
        const s = window.PJCCSystems && PJCCSystems.get(id);
        if (!s || !s.name) bad.push(id);
      }
      return bad;
    }, sysIds);
    ok(named.length === 0,
      '…and pjcc-systems.js can name every one of them — a blank fact spends the reveal',
      named.join(' · '));

    /* ── 3 · the pull rides the existing request ─────────────────────────────────── */
    const PROF = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
    const pull = PROF.slice(PROF.indexOf('PJCC.ready.then('), PROF.indexOf("['catch']"));
    ok(/r\.game === 'checker-town'/.test(pull),
      'the town rides the ONE myStats() pull — no second round trip', 'in PJCC.ready.then');
    ok(/townMerge\(/.test(pull), '…and merges what comes back rather than overwriting');

    ok(errs.length === 0, 'no page errors', errs.join(' | '));

    /* ── 4 · the Godot half asks, and the stand-in is off on web ─────────────────── */
    const GD = path.join(ROOT, 'private/docs/godot/chess_town');
    if (fs.existsSync(GD)) {
      const gs = fs.readFileSync(path.join(GD, 'game_state.gd'), 'utf8');
      const zone = fs.readFileSync(path.join(GD, 'zone.gd'), 'utf8');
      ok(/func poll_challenge\(/.test(gs), 'GameState.poll_challenge exists');
      ok(/townResult/.test(gs), '…and it calls PJCC.townResult');
      ok(/"at":\s*Time\.get_unix_time_from_system\(\)/.test(gs),
        '…and begin_challenge stamps the errand, or an old win answers for it');
      ok(/\?\s*null\s*:\s*\(v\s*\?\s*1\s*:\s*0\)/.test(gs),
        '…returning 1/0/null, never a bare bool — false and null are one Variant');
      ok(/_poll\.timeout\.connect\(_tick\)/.test(gs) && /\bpoll_challenge\(\)/.test(gs),
        '…on a timer: the new tab means the town never reloads, so nothing else asks');
      ok(/if not OS\.has_feature\("web"\):\s*\n\s*add_child\(DevReferee/.test(zone),
        'the DevReferee stand-in is DESKTOP ONLY — on web it would hide a broken seam');
      /* ⚠ the half that was missing until 2026-09-03: the town has to READ the account */
      ok(/func pull_from_site\(/.test(gs) && /townState/.test(gs),
        'GameState.pull_from_site asks the site for the account copy');
      ok(/func merge_in\(/.test(gs) && /int\(beaten\.get\(k, -1\)\)/.test(gs),
        '…and merges it by the same rules  (⚠ beaten vs -1: day 0 is a real day)');
      ok(/_pulls_left/.test(gs) && /_poll\.timeout\.connect\(_tick\)/.test(gs),
        '…for the first ticks, so an async myStats() landing late still gets in');
    } else {
      ok(false, 'the Godot copy is missing from private/docs/godot/chess_town');
    }
  } finally {
    await browser.close();
    server.close();
  }

  process.exit(report('CHECKER TOWN — the seam the site answers through', results, []) ? 0 : 1);
})();
