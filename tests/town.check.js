#!/usr/bin/env node
/* town.check.js — npm run test:town.  The seam Checker Town talks through: the town is a
   Godot build in an iframe that plays no chess, so it opens a Park Tables board and asks
   the site who won.  ⚠⚠ `beaten` is a DAY STAMP PER OPPONENT, not a set — union it the way
   `army` is unioned and a second device pays out a second piece from the same person on
   the same day. */
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

/* ══ 1 · the writer: Park Tables has to stamp the result at all ══ */
const PT = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');
const PROF = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');

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

/* An inner class: its header and every line indented under it (fnGd runs on to the end of the class). */
function clsGd(src, name) {
  const a = src.indexOf('class ' + name + ' extends');
  if (a < 0) return '';
  const lines = src.slice(a).split('\n');
  const out = [lines[0]];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() !== '' && !/^[\t ]/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}

/* The same idea for GDScript: a function is its header plus every line indented under it. */
function fnGd(src, name) {
  const a = src.indexOf('func ' + name + '(');
  if (a < 0) return '';
  const lines = src.slice(a).split('\n');
  const out = [lines[0]];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() !== '' && !/^[\t ]/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}

const markLast = fn(PT, 'markLast');
const finishAs = fn(PT, 'botFinishAs');
ok(markLast, 'Park Tables has a markLast()');
ok(/pjcc\.pt\.last\.v1/.test(markLast), '…and it writes pjcc.pt.last.v1');
ok(/\bat:\s*Date\.now\(\)/.test(markLast),
  '…stamped with Date.now(), or "did that just happen" has no answer');
ok(/won:\s*studyOK\(st\)/.test(markLast),
  '…and records who won  (⚠ botWon() means YOU won — the name reads backwards)');
/* ⚠⚠ A DRAW CAN BE THE WIN. */
ok(/function studyOK/.test(PT) && /goal === 'draw'/.test(fn(PT, 'studyOK'))
  && /'1\/2-1\/2'/.test(fn(PT, 'studyOK')),
  '…and a study whose goal is a DRAW counts a draw as done');
ok(/clean:\s*tierEarned\(st\)\s*===\s*'full'/.test(markLast),
  '…and whether it was CLEAN, off the same full-star test the bench already uses');
/* ⚠ SLICED FROM THE FUNCTION, never grepped from the file. */
ok(/markLast\(st\)/.test(finishAs),
  'botFinishAs calls it — the one funnel all four endings come through');
ok(finishAs.indexOf('markLast(st)') < finishAs.indexOf('logFinished('),
  '…before logFinished, so nothing that throws in the log can eat the stamp');
/* the loss half: a loss does not spend the day, but it does end the errand. */
ok(!/if\s*\(\s*botWon\(st\)\s*\)\s*\{[^}]*markLast/.test(finishAs),
  'and it is NOT inside the win branch — a loss has to clear the pending challenge too');

/* ══ 2 · the readers, in a real browser against the real file ══ */
const PAGE = `<!doctype html><meta charset="utf-8"><title>t</title>
<script src="/assets/js/pjcc-config.js"></script>
<script src="/assets/js/pjcc-systems.js"></script>
<script src="/assets/js/pjcc-profile.js"></script><body>`;

/* /games/fork-in-the-road/ minus Jekyll: the room reads the Champ's query off its PARENT. */
const FORK_WRAP = '<!doctype html><meta charset="utf-8"><iframe src="/assets/games/pjcc_fork.html" style="width:480px;height:556px"></iframe>';

const TYPES = { '.js': 'text/javascript', '.html': 'text/html' };
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/t/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(PAGE); }
  if (url === '/w/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(FORK_WRAP); }
  if (url === '/games/checker-town/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end('<title>town</title>'); }
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

    /* ══ townResult ══ */
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
      out.cleanOnLoss = PJCC.townClean('crockett', 0);
      set({ bot: 'crockett', result: '0-1', won: true, clean: false, at: 5000 * 1000 });
      out.helped = PJCC.townClean('crockett', 0);
      set({ bot: 'crockett', result: '0-1', won: true, clean: true, at: 5000 * 1000 });
      out.cleanWin = PJCC.townClean('crockett', 0);
      set({ bot: 'crockett', result: '0-1', won: true, at: 5000 * 1000 });   // pre-09-03 row
      out.legacy = PJCC.townClean('crockett', 0);
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
    ok(R.olderThanSince === null,
      'townResult: null when the result predates the challenge  (seconds vs ms)');
    ok(R.newerThanSince === true, '…and answers when the result came after it');
    ok(R.cleanWin === true, 'townClean: true on an unhelped win — that is what buys a square');
    ok(R.helped === false, 'townClean: false after a takeback or the analysis board');
    ok(R.cleanOnLoss === null, 'townClean: null on a loss — there is no win to be clean');
    /* ⚠ A row banked before the rule existed has no flag. */
    ok(R.legacy === true, 'townClean: a record with no `clean` field reads as clean');

    /* ══ mergeTown ══ */
    const M = await page.evaluate(() => {
      localStorage.removeItem('pjcc.town.v1');
      PJCC.mergeTown({ day: 4, ore: 10, hearts: { Auston: 4, Crockett: 1 },
                       army: [0, 5], ceo_beaten: false,
                       beaten: { crockett: 4, argus: 2 }, scouted: { crockett: 3 } });
      const first = JSON.parse(localStorage.getItem('pjcc.town.v1'));
      // the other device: further on in places, BEHIND in others
      const merged = PJCC.mergeTown({ day: 2, ore: 40, hearts: { Auston: 1, Crockett: 2 },
                                      army: [5, 11],
                                      ceo_beaten: true, beaten: { crockett: 1, kedar: 6 },
                                      scouted: { crockett: 1, argus: 2 } });
      return { first: first, m: merged, stored: JSON.parse(localStorage.getItem('pjcc.town.v1')) };
    });
    ok(M.first && M.first.ore === 10, 'mergeTown: writes pjcc.town.v1');
    ok(JSON.stringify(M.m.army) === JSON.stringify([0, 5, 11]),
      'mergeTown: army is a UNION of slot indices, deduped and sorted', JSON.stringify(M.m.army));
    /* ⛑ 2026-10-03, his: "we shouldn't count days in the game". There is no day to merge. */
    ok(!('day' in M.m), 'mergeTown: no day is merged any more — the town reads the real date', JSON.stringify(M.m.day));
    ok(M.m.ore === 40, 'mergeTown: ore takes the MAX');
    /* ⛑⛑ THIS CHECK USED TO ASSERT THE BUG, AND IT PASSED FOR THREE BATCHES. */
    ok(M.m.hearts && M.m.hearts.Auston === 4 && M.m.hearts.Crockett === 2,
      'mergeTown: hearts are a DICTIONARY and take the max PER PERSON',
      JSON.stringify(M.m.hearts));
    ok(M.m.ceo_beaten === true, 'mergeTown: ceo_beaten is sticky (OR) — you cannot un-beat him');
    ok(M.m.beaten.crockett === 4,
      '⚠⚠ mergeTown: beaten is MAX PER KEY, so a stale day cannot free a second piece today',
      'crockett=' + M.m.beaten.crockett);
    ok(M.m.beaten.kedar === 6, '…and a key only the other device knows is kept');
    ok(M.stored && M.stored.beaten.crockett === 4, '…and the merge is what gets stored');
    ok(M.m.scouted && M.m.scouted.crockett === 3,
      'mergeTown: scouted is MAX PER KEY too — a tendency you learned stays learned',
      'crockett=' + ((M.m.scouted || {}).crockett));
    ok(M.m.scouted && M.m.scouted.argus === 2, '…and a key only the other device knows is kept');
    /* ⭐ 2026-10-04: Pawn Crossing's best run joined the sync. Earned, so the max — tested BOTH ways,
       because a merge that only ever keeps its own copy passes a one-way test. */
    const XB = await page.evaluate(() => {
      localStorage.removeItem('pjcc.town.v1');
      PJCC.mergeTown({ crossing_best: 12 });
      const a = PJCC.mergeTown({ crossing_best: 7 }).crossing_best;
      localStorage.removeItem('pjcc.town.v1');
      PJCC.mergeTown({ crossing_best: 7 });
      const b = PJCC.mergeTown({ crossing_best: 12 }).crossing_best;
      return { a: a, b: b };
    });
    ok(XB.a === 12 && XB.b === 12, 'mergeTown: Pawn Crossing\'s best is the MAX both ways — no device rewinds it',
      JSON.stringify(XB));
    /* ⭐ 2026-10-12: the rating and the booth's nights. Both only climb, so the max, both ways. */
    const RB = await page.evaluate(() => {
      const two = (k, hi, lo) => {
        localStorage.removeItem('pjcc.town.v1');
        PJCC.mergeTown({ [k]: hi });
        const a = PJCC.mergeTown({ [k]: lo })[k];
        localStorage.removeItem('pjcc.town.v1');
        PJCC.mergeTown({ [k]: lo });
        return [a, PJCC.mergeTown({ [k]: hi })[k]];
      };
      const out = { rating: two('rating', 1460, 520), nights: two('booth_nights', 3, 1) };
      localStorage.removeItem('pjcc.town.v1');
      return out;
    });
    ok(RB.rating.join() === '1460,1460' && RB.nights.join() === '3,3',
      'mergeTown: your rating and the booth\'s nights are the MAX both ways — neither can be handed back',
      JSON.stringify(RB));

    /* ══ MONEY on the site's side (2026-09-30, his picks 1 5 9 and the synced half of 3 4 7) ══ */
    const MO = await page.evaluate(() => {
      const out = {};
      const set = (o) => localStorage.setItem('pjcc.pt.last.v1', JSON.stringify(o));
      set({ bot: 'maxwell', result: '1-0', won: true, pos: '', took: 17, at: 5000 * 1000 });
      out.took = PJCC.townTook('maxwell', 0);
      out.wrongKey = PJCC.townTook('nate', 0);
      set({ bot: 'maxwell', result: '0-1', won: false, pos: '', took: 17, at: 5000 * 1000 });
      out.loss = PJCC.townTook('maxwell', 0);
      set({ bot: 'maxwell', result: '1-0', won: true, pos: '', took: 999, at: 5000 * 1000 });
      out.capped = PJCC.townTook('maxwell', 0);
      set({ bot: 'maxwell', result: '1-0', won: true, pos: '', at: 5000 * 1000 });
      out.legacy = PJCC.townTook('maxwell', 0);
      out.credits = PJCC.townCredits();
      out.trade = PJCC.townExchange(1);
      out.result = PJCC.townExchangeResult();
      localStorage.removeItem('pjcc.town.v1');
      PJCC.mergeTown({ rent_on: '2026-09-30', bounty_done: { '2026-09-30:beat': 1 },
        favors: { Maxwell: 2 }, lessons_used: { Maxwell: 1 }, packs: { first: 1 } });
      out.m = PJCC.mergeTown({ rent_on: '2026-09-01', bounty_done: { '2026-09-29:mine': 1 },
        favors: { Maxwell: 1, Nate: 1 }, lessons_used: { Maxwell: 0 }, packs: {} });
      return out;
    });
    ok(MO.took === 17 && MO.wrongKey === 0 && MO.loss === 0,
      '⭐ townTook: the material you took, on a win against that person only', JSON.stringify(MO));
    ok(MO.capped === 39 && MO.legacy === 0,
      '…capped at a whole army (39), and 0 for a record from before the stamp — never a guess');
    ok(MO.credits === -1 && MO.trade === 'signed-out' && MO.result === '',
      '⭐ the exchange is shut signed out: no credits to show, and no trade starts');
    ok(MO.m.rent_on === '2026-09-30' && MO.m.bounty_done['2026-09-30:beat'] && MO.m.bounty_done['2026-09-29:mine']
      && MO.m.favors.Maxwell === 2 && MO.m.favors.Nate === 1 && MO.m.lessons_used.Maxwell === 1 && MO.m.packs.first,
      '⭐ mergeTown money: rent date LATER wins, bounties and packs UNION, favors and lessons MAX',
      JSON.stringify(MO.m).slice(0, 200));

    /* ⭐ materialTaken, lifted out of the Park Tables page and run against real games. */
    {
      const C = require('../assets/js/pjcc-chess.js');
      const pt = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8').replace(/\r\n/g, '\n');
      const src = (/function materialTaken\(st\)\{[\s\S]*?\n  \}\n/.exec(pt) || [''])[0];
      const replay = (st) => {
        let S = C.parseFEN(st.fen0 || C.START_FEN);
        for (const u of (st.moves || '').trim().split(/\s+/).filter(Boolean)) {
          const m = C.findMove(S, C.sqFromName(u.slice(0, 2)), C.sqFromName(u.slice(2, 4)), u[4] || null);
          if (!m) return { S: S, valid: false };
          S = C.makeMove(S, m);
        }
        return { S: S, valid: true };
      };
      const side = (st) => (st && st.pc === 'b') ? 'b' : 'w';
      let took = null;
      try { took = new Function('C', 'botGame', 'sidePlayed', src + '\nreturn materialTaken;')(C, replay, side); } catch (e) {}
      const t = (moves, pc) => took ? took({ moves: moves, pc: pc }) : NaN;
      ok(src !== '' && /took: materialTaken\(st\)/.test(pt),
        '⭐ Park Tables stamps the material you took on every result');
      ok(t('e2e4 d7d5 e4d5 d8d5', 'w') === 1 && t('e2e4 d7d5 e4d5 d8d5', 'b') === 1,
        '…a pawn each way is 1 for whichever side you played');
      ok(t('e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5c6 d7c6', 'b') === 3 && t('e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5c6 d7c6', 'w') === 3,
        '…a bishop for a knight is 3 and 3');
      ok(t('e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7', 'w') === 1 && t('e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7', 'b') === 0,
        '…the scholar\'s mate took one pawn, and Black took nothing');
      ok(t('e2e4 zz99', 'w') === 0, '…and a record it cannot replay pays 0, never a guess');
    }

    /* ══ 2b · the way BACK into the game ══ */
    const S = await page.evaluate(() => {
      localStorage.removeItem('pjcc.town.v1');
      const empty = PJCC.townState();
      PJCC.mergeTown({ day: 9, ore: 42, army: [0, 1, 2], beaten: { crockett: 8 } });
      return { empty: empty, after: PJCC.townState() };
    });
    ok(S.empty === null, 'townState: null before anything is known — not an empty object');
    ok(S.after && S.after.ore === 42 && S.after.army.length === 3,
      'townState: hands back the merged copy for the town to read at boot',
      'ore ' + (S.after || {}).ore);

    /* ══ 2b′ · three saves  (his, 2026-10-27: "Can each account have up to 3 saves?") ══ */
    const S3 = await page.evaluate(() => {
      const keys = () => Object.keys(localStorage).filter((k) => k.indexOf('pjcc.town.v1') === 0).sort();
      for (const k of keys()) localStorage.removeItem(k);
      const o = {};
      PJCC.mergeTown({ ore: 50, army: [0, 1, 2] });
      PJCC.mergeTown({ ore: 9, army: [5], run: 1000 }, 2);
      o.s1 = PJCC.townState(1); o.s1Bare = PJCC.townState(); o.s2 = PJCC.townState(2); o.s3 = PJCC.townState(3);
      o.keys = keys();
      o.same = PJCC.mergeTown({ ore: 4, army: [7], run: 1000 }, 2);
      o.later = PJCC.mergeTown({ ore: 1, army: [], run: 2000 }, 2);
      o.stale = PJCC.mergeTown({ ore: 99, army: [3, 4], run: 1000 }, 2);
      o.s2End = PJCC.townState(2);
      o.s1End = PJCC.townState(1);
      PJCC.mergeTown({ ore: 3 }, 7);
      o.keysEnd = keys();
      for (const k of keys()) localStorage.removeItem(k);
      return o;
    });
    ok(S3.s1 && S3.s1.ore === 50 && S3.s1Bare && S3.s1Bare.ore === 50 && S3.s2 && S3.s2.ore === 9 && S3.s3 === null
       && JSON.stringify(S3.keys) === JSON.stringify(['pjcc.town.v1', 'pjcc.town.v1.s2']),
      '⭐ three saves: each its own store, and Save 1 is the store it always was  (pjcc.town.v1, then .s2 and .s3)',
      JSON.stringify(S3.keys));
    ok(S3.same && S3.same.ore === 9 && JSON.stringify(S3.same.army) === '[5,7]',
      '…two copies of ONE run merge as they always have: the union', JSON.stringify(S3.same));
    ok(S3.later && S3.later.ore === 1 && S3.later.army.length === 0 && S3.later.run === 2000,
      '⛑⛑ …a LATER run, begun again somewhere else, replaces the old one whole',
      'the union would hand a New Game straight back the run it began over');
    ok(S3.stale && S3.stale.run === 2000 && S3.stale.ore === 1 && S3.s2End && S3.s2End.ore === 1 && S3.s2End.army.length === 0,
      '⛑ …and a late push of the run it replaced changes nothing', JSON.stringify(S3.s2End));
    ok(S3.s1End && S3.s1End.ore === 50 && JSON.stringify(S3.keysEnd) === JSON.stringify(['pjcc.town.v1', 'pjcc.town.v1.s2']),
      '…while Save 1 sat through all of it untouched, and a number that is not one of the three is Save 1, never a store of its own',
      JSON.stringify(S3.keysEnd));

    /* ══ 2c · the scouting facts, and whether they can be TRUE ══ */
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

    /* ══ 3 · the pull rides the existing request ══ */
    const PROF = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
    const pull = PROF.slice(PROF.indexOf('PJCC.ready.then('), PROF.indexOf("['catch']"));
    ok(/r\.game === 'checker-town'/.test(pull),
      'the town rides the ONE myStats() pull — no second round trip', 'in PJCC.ready.then');
    ok(/townMerge\(/.test(pull), '…and merges what comes back rather than overwriting');


    /* ⛑ THE TWO JAPANESE ROOMS CAME OFF THE SLOW-ROLL, 2026-09-03. */
    /* his: "it's time - let's just do it" */
    const GD_DATA = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-games-data.js'), 'utf8');
    const listed = (slug) => new RegExp("^\\s*\\{ slug:'" + slug + "'", 'm').test(GD_DATA);
    ok(listed('shogi-island'), 'Shogi Island is listed in the games registry, not commented out');
    ok(listed('reading-room'), '…and so is the Reading Room');
    ok(!/reading-room'[^\n]*soon:true/.test(GD_DATA),
      '…without a "coming soon" ribbon on a game that shipped in June');
    for (const g of ['shogi-island', 'reading-room']) {
      ok(!/^noindex:\s*true/m.test(fs.readFileSync(path.join(ROOT, 'games/' + g + '/index.html'), 'utf8')),
        '…and /games/' + g + '/ no longer hides from search  (no live game carries noindex)');
    }

    /* the head-to-head, before you sit down (2026-09-03). */
    ok(/function h2hWords\(/.test(PT) && /h2hWords\(id\)/.test(PT),
      'the bench card shows your record against a seat — ONE reader, two shapes');
    ok(/var rec = resume \? '' : h2hWords\(id\);/.test(PT),
      '…resume outranks it, and neither is glued onto the rating  (⚠ a 143px card wraps)');
    ok(/localStorage\.setItem\('pjcc\.puz\.log\.v1'/.test(fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_fork.html'), 'utf8')),
      'the puzzle room logs each result for the town');
    ok(/PJCC\.puzzleResult = function \(since\)/.test(PROF) && /JSON\.stringify\(out\)/.test(PROF),
      '…and the profile hands it over as a STRING — a JS array does not cross the bridge');
    ok(/local\.island_open = !!\(local\.island_open \|\| remote\.island_open\)/.test(PROF),
      '…the oars merge by OR, like every other earned thing');

    /* ══ THE CHAMP'S TAB CLOSES — 2026-09-21 ══ */
    /* his: "If there is a miss, the window closes. Currently, you can just keep doing puzzles and you may not realize why." */
    {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const now = () => page.evaluate(() => Date.now());
      await page.evaluate(() => localStorage.removeItem('pjcc.puz.log.v1'));
      const openRoom = async (q) => {
        const u = '/w/' + q;
        const tgt = browser.waitForTarget((t) => t.url().endsWith(u), { timeout: 10000 });
        await page.evaluate((x) => { window.open(x, '_blank'); }, u);
        const pop = await (await tgt).page();
        pop.on('pageerror', (e) => errs.push('room: ' + e.message));
        await pop.waitForFunction(() => { const f = document.querySelector('iframe');
          return f && f.contentWindow && typeof f.contentWindow.oarsOver === 'function'; }, { timeout: 15000 });
        const fr = pop.frames().find((f) => f.url().includes('pjcc_fork.html'));
        await fr.evaluate(() => document.getElementById('journey-btn').click());
        await fr.waitForFunction(() => typeof G !== 'undefined' && G && G.phase === 'await', { timeout: 10000 });
        return { pop, fr };
      };
      const settle = (fr, clean) => fr.evaluate((c) => { G.clean = c; puzzleSolved(); return { town: explainCard.town, id: G.p.id }; }, clean);
      const tap = (fr) => fr.evaluate(() => document.querySelector('canvas')
        .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 240, clientY: 300 })));
      const shut = (pop) => Promise.race([new Promise((r) => pop.once('close', () => r(true))), sleep(2000).then(() => pop.isClosed())]);

      let t0 = await now(), room = await openRoom('?oars=3&since=' + t0 + '&from=town');
      const a1 = await settle(room.fr, true); await tap(room.fr); await sleep(250);
      const a2 = await settle(room.fr, true); await tap(room.fr); await sleep(250);
      const openAfterTwo = !room.pop.isClosed();
      const a3 = await settle(room.fr, true); await tap(room.fr);
      ok(!a1.town && !a2.town && openAfterTwo && a3.town && await shut(room.pop),
        '⛑ the Champ\'s tab serves three clean, then its card says Town and the tap closes it',
        JSON.stringify({ a1: a1.town, a2: a2.town, openAfterTwo, a3: a3.town }));

      t0 = await now(); room = await openRoom('?oars=3&since=' + t0 + '&from=town');
      const b1 = await settle(room.fr, false); await tap(room.fr);
      ok(b1.town && await shut(room.pop), '…one miss closes it on the spot  (⚠ before, the room kept serving puzzles he stopped counting)');

      await page.evaluate(() => { const a = JSON.parse(localStorage.getItem('pjcc.puz.log.v1') || '[]');
        a.push({ c: 0, at: Date.now() - 5 }); localStorage.setItem('pjcc.puz.log.v1', JSON.stringify(a)); });
      await sleep(20);
      t0 = await now(); room = await openRoom('?oars=1&since=' + t0 + '&from=town');
      const c0 = await room.fr.evaluate(() => oarsOver());
      const c1 = await settle(room.fr, true); await tap(room.fr);
      ok(!c0 && c1.town && await shut(room.pop),
        '…"set me another" mid-run counts only what settled after `since`, and closes on the last one owed');

      room = await openRoom('?from=town');
      const d1 = await settle(room.fr, false); await tap(room.fr); await sleep(300);
      const d2 = await room.fr.evaluate(() => G && G.p && G.p.id);
      ok(!d1.town && !room.pop.isClosed() && d2 !== d1.id,
        '…and a visit with no `oars` is the plain room: a miss serves the next puzzle');
      await room.pop.close();

      t0 = await now(); room = await openRoom('?oars=2&since=' + t0 + '&from=town');
      await room.pop.evaluate(() => { window.close = () => {}; });
      await settle(room.fr, false);
      const nav = room.pop.waitForNavigation({ timeout: 3000 }).catch(() => null);
      await tap(room.fr); await nav;
      ok(/\/games\/checker-town\/$/.test(room.pop.url()),
        '…a tab no script may close (popup blocked, the installed app) WALKS back to the town', room.pop.url());
      await room.pop.close();
    }

    ok(errs.length === 0, 'no page errors', errs.join(' | '));

    /* ══ 4 · the Godot half asks, and the stand-in is off on web ══ */
    /* ⚠ THE GAME ITSELF, not a copy: the mirror in private/docs/godot/ was retired 2026-10-19. */
    const GD = process.env.CHECKERTOWN_PROJECT || 'C:/Users/Nate/Documents/checker-town';
    if (fs.existsSync(GD)) {
      /* ⚠ THE GAME IS IN FEATURE FOLDERS (2026-10-19): a check names a file and GDF finds it; GD_LIST is
         every file in the game by name. A name used twice is a red check, never a guess. */
      const GD_INDEX = new Map(), GD_DUPS = [];
      (function index(d) {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          if (['.godot', '.git', 'tests', 'engine'].includes(e.name)) continue;
          const f = path.join(d, e.name);
          if (e.isDirectory()) index(f);
          else if (!GD_INDEX.has(e.name)) GD_INDEX.set(e.name, f);
          else if (e.name !== 'README.md') GD_DUPS.push(e.name);
        }
      })(GD);
      const GDF = (f) => GD_INDEX.get(f) || path.join(GD, f);
      /* ⚠ town.gd IS READ WHOLE: its inner classes live in town/parts/ (2026-10-19) and are folded back in at the
         line that preloads each, so every check sees one town.gd and the parts are not listed on their own.
         split_town.py proved the fold gives back the original text. */
      const readRaw = fs.readFileSync;
      const IN_PARTS = path.join('town', 'parts') + path.sep;
      /* ⚠ game_state.gd IS READ AS ALL OF GameState (2026-10-20): the hub and its nine parts in core/state/, AS
         WRITTEN, so a check finds a function in whichever part holds it and the parts are not listed on their own.
         A name another part holds reads qualified where it is used: GameState.money.ore. */
      const IN_STATE = path.join('core', 'state') + path.sep;
      const GD_ALL = [...GD_INDEX.keys()].sort();
      const GD_LIST = GD_ALL.filter((n) => !GD_INDEX.get(n).includes(IN_PARTS) && !GD_INDEX.get(n).includes(IN_STATE));
      const GS_GD = path.resolve(GDF('game_state.gd'));
      const STATE_PART = /^const (\w+)Part := preload\("res:\/\/core\/state\/(state_\w+\.gd)"\)$/gm;
      const gsWhole = () => {
        const hub = readRaw.call(fs, GS_GD, 'utf8').replace(/\r\n/g, '\n');
        return [hub].concat([...hub.matchAll(STATE_PART)]
          .map((m) => readRaw.call(fs, GDF(m[2]), 'utf8').replace(/\r\n/g, '\n'))).join('\n');
      };
      const TOWN_GD = path.resolve(GDF('town.gd'));
      const PRELOAD = /^const (\w+) := preload\("res:\/\/town\/parts\/(\w+\.gd)"\)$/gm;
      const townWhole = () => {
        const text = readRaw.call(fs, TOWN_GD, 'utf8').replace(/\r\n/g, '\n');
        const inner = [...text.matchAll(PRELOAD)].map((m) => m[1]);
        if (!inner.length) return text;
        const qual = new RegExp('CheckerTown\\.(' + inner.join('|') + ')\\b', 'g');
        return text.replace(PRELOAD, (all, name, file) => {
          const pl = readRaw.call(fs, GDF(file), 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
          let k = 0;
          while (pl[k].startsWith('#')) k++;
          let base = pl[k].slice('extends '.length);
          const bm = base.match(/^"res:\/\/town\/parts\/(\w+)\.gd"$/);
          if (bm) base = inner.find((n) => n.toLowerCase() === bm[1].replace(/_/g, ''));
          return pl.slice(0, k).concat(['class ' + name + ' extends ' + base + ':'],
            pl.slice(k + 1).map((l) => (l === '' ? l : '\t' + l.replace(qual, '$1')))).join('\n');
        });
      };
      fs.readFileSync = function (p, ...rest) {
        const at = typeof p === 'string' ? path.resolve(p) : '';
        if (at === TOWN_GD || at === GS_GD) {
          const whole = at === TOWN_GD ? townWhole() : gsWhole();
          return rest.length ? whole : Buffer.from(whole, 'utf8');
        }
        return readRaw.call(fs, p, ...rest);
      };
      /* ⚠⚠ A NAME THAT MOVED AND WAS MISSED IS NOT A COMPILE ERROR: GameState.ore on a hub without one fails only
         on the day its line runs. So every GameState.<x> in the game must be the hub's own, and every
         GameState.<part>.<y> must be a member of that part, read off the files themselves. */
      {
        const gdMask = (s) => s.replace(/"""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|#[^\n]*/g, (t) => t.replace(/[^\n]/g, ' '));
        const declsOf = (s) => new Set([...gdMask(s).matchAll(/^(?:static )?(?:func|var|const|signal|enum|class) (\w+)/gm)].map((m) => m[1]));
        const hubSrc = readRaw.call(fs, GS_GD, 'utf8').replace(/\r\n/g, '\n');
        const held = [...hubSrc.matchAll(STATE_PART)].map((m) => ({ name: m[1].toLowerCase(), cls: m[1] + 'Part', file: m[2] }));
        const parts = {};
        for (const h of held) parts[h.name] = { src: readRaw.call(fs, GDF(h.file), 'utf8').replace(/\r\n/g, '\n'), ...h };
        for (const p of Object.values(parts)) p.decls = declsOf(p.src);
        const hubDecls = declsOf(hubSrc);
        const OBJ = new Set(['set', 'get', 'call', 'has_method', 'connect', 'is_connected', 'emit_signal', 'has_signal']);
        const once = held.filter((h) => new RegExp('^var ' + h.name + ': ' + h.cls + ' = ' + h.cls + '\\.new\\(\\)$', 'm').test(hubSrc)
          && /^extends RefCounted\n/.test(parts[h.name].src));
        ok(held.length === 9 && once.length === 9 && new Set(held.map((h) => h.name)).size === 9,
          '⭐ GameState is the save, the sync, the tick and the day, holding nine parts (core/state/): each a RefCounted, held once',
          held.map((h) => h.name).join(' '));
        const bad = [];
        let named = 0;
        for (const f of GD_ALL.filter((n) => n.endsWith('.gd'))) {
          const c = gdMask(readRaw.call(fs, GDF(f), 'utf8').replace(/\r\n/g, '\n'));
          for (const m of c.matchAll(/\bGameState\.(\w+)(?:\.(\w+))?/g)) {
            named++;
            if (parts[m[1]] ? !(m[2] && parts[m[1]].decls.has(m[2])) : !hubDecls.has(m[1]) && !OBJ.has(m[1])) bad.push(f + ': ' + m[0]);
          }
          if (f === 'game_state.gd') {
            for (const m of c.matchAll(new RegExp('(?<![.\\w])(' + Object.keys(parts).join('|') + ')\\.(\\w+)', 'g'))) {
              named++;
              if (!parts[m[1]].decls.has(m[2])) bad.push(f + ': ' + m[0]);
            }
          }
        }
        ok(named > 500 && bad.length === 0, '⚠⚠ …and every name in the game that says GameState is one GameState or its part declares',
          bad.length ? bad.slice(0, 6).join('  ') : named + ' names, every one declared where it points');
        const swapped = GD_ALL.filter((n) => n.endsWith('.gd')).filter((f) => new RegExp('\\bGameState\\.(' + Object.keys(parts).join('|')
          + ')\\s*=[^=]').test(gdMask(readRaw.call(fs, GDF(f), 'utf8')))
          || (f === 'game_state.gd' && new RegExp('^\\s+(' + Object.keys(parts).join('|') + ')\\s*=[^=]', 'm').test(gdMask(hubSrc))));
        ok(swapped.length === 0, '⚠ …and no part is ever replaced: a room connects to a part\'s own signals, and a new one would hear nothing',
          swapped.join(' ') || 'made once, in GameState');
        /* ⚠ load_state SETS SOME BY NAME (holders): a name on the wrong part is dropped without a word. */
        const holders = /var holders := \{([^}]*)\}/.exec(hubSrc);
        const pairs = holders ? [...holders[1].matchAll(/"(\w+)": (\w+)/g)] : [];
        const misheld = pairs.filter((m) => !parts[m[2]] || !new RegExp('^var ' + m[1] + '\\b', 'm').test(parts[m[2]].src));
        ok(pairs.length >= 8 && misheld.length === 0, '⚠ …and every value load_state sets by name is a variable of the part it names',
          misheld.length ? misheld.map((m) => m[1] + ' on ' + m[2]).join(' ') : pairs.length + ' set by name');
      }
      /* ⚠ THE DIALS ARE core/tuning.tres (2026-10-19): he sets them in the Inspector and Tuning.now() reads them. The
         gate holds a slider's ends (tuning.gd's @export_range), never the value between them, because a slider he
         moves must not stop a push. A const NAME a check still says is read off the dial it became (TUNED). */
      const TUNE_GD = readRaw.call(fs, GDF('tuning.gd'), 'utf8').replace(/\r\n/g, '\n');
      const TUNE_RES = readRaw.call(fs, GDF('tuning.tres'), 'utf8').replace(/\r\n/g, '\n');
      const tune = (n) => {
        const m = new RegExp('^' + n + ' = (-?[\\d.]+)$', 'm').exec(TUNE_RES) || new RegExp('var ' + n + ' := (-?[\\d.]+)').exec(TUNE_GD);
        return m ? +m[1] : NaN;
      };
      const tuneRange = (n) => {
        const m = new RegExp('@export_range\\((-?[\\d.]+), (-?[\\d.]+)[^)]*\\) var ' + n + ' :=').exec(TUNE_GD);
        return m ? [+m[1], +m[2]] : null;
      };
      const TUNED = { SPEED: 'walk_speed', RUN_SPEED: 'run_share', RUN_GRACE: 'run_grace', SKATE_TOP: 'skate_top', SKATE_PUSH: 'skate_push', SKATE_COAST: 'skate_coast', SKATE_TURN: 'skate_turn', SKATE_STRIDE: 'skate_stride', JUMP_SECS: 'jump_secs', JUMP_HIGH: 'jump_high', CAM_TRAIL: 'camera_trail', LOOK_REACH: 'look_reach', LOOK_RATE: 'look_rate', ENERGY_CAP: 'energy_cap', GAME_COST: 'game_cost', DRAIN_MINUTES: 'drain_minutes', RUN_TIRES_SECS: 'run_tires_secs', FULL_SETS: 'lift_full_sets', LOWER: 'lift_lower', FORCE: 'lift_force', LOAD: 'lift_load', MASH: 'lift_mash', PINNED: 'lift_pinned', RESTING: 'lift_resting', COUNTS: 'lift_counts', REP_GAIN: 'lift_rep_gain', REP_COST: 'lift_rep_cost', FAIL_COST: 'lift_fail_cost', LATE: 'lift_late', GALLOP: 'knight_gallop', HOLD_SECS: 'knight_hold_secs', WAIT_SECS: 'knight_wait_secs', GONE_AT: 'knight_gone_at', AGAIN_SECS: 'knight_again_secs' };
      const dial = (name, orConst) => (TUNED[name] ? tune(TUNED[name]) : orConst(name));
      /* ⚠ EVERYBODY'S WORDS ARE people/lines/<who>.txt (2026-10-19), read by the game's own rules (core/lines.gd):
         a [heading], one line a row, a row starting # a note. words(who)[heading] is what the game says. */
      /* ⚠ HIS HOME IS LAID OUT IN THE EDITOR (step 6, 2026-10-19): a Marker2D under Layout in home.tscn places each
         piece, and home.gd's number is only the fallback for a missing marker (NateHome.where). A position a check
         reads off home.gd is read off the marker first. */
      const HOME_PIECES = { BED_AT: 'Bed', DOG_BED_AT: 'PrincessBed', BOARD_AT: 'Board', MILO_BED_AT: 'MiloBed', ARGUS_BED_AT: 'ArgusBed', MILO_BOARD_AT: 'MiloBoard', ARGUS_BOARD_AT: 'ArgusBoard', FRIDGE_AT: 'Fridge', RUG_AT: 'Rug', RACK_AT: 'Rack', MAT_AT: 'Mat', SHOES_AT: 'Shoes', BLADES_AT: 'Blades', STAND_AT: 'Nightstand', CUSHION_AT: 'Cushion' };
      const HOME_TSCN = readRaw.call(fs, GDF('home.tscn'), 'utf8').replace(/\r\n/g, '\n');
      const marker = (piece) => {
        const at = HOME_TSCN.indexOf('[node name="' + piece + '" type="Marker2D" parent="Layout"]');
        if (at < 0) return null;
        const next = HOME_TSCN.indexOf('\n[', at + 1), body = HOME_TSCN.slice(at, next < 0 ? undefined : next);
        const m = /\nposition = Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(body);
        return m ? { x: +m[1], y: +m[2] } : { x: 0, y: 0 };
      };
      const layoutAt = (src, name) => (/class_name NateHome/.test(src) && HOME_PIECES[name] ? marker(HOME_PIECES[name]) : null);
      {
        const hg = readRaw.call(fs, GDF('home.gd'), 'utf8').replace(/\r\n/g, '\n');
        const lay = readRaw.call(fs, GDF('home_layout.gd'), 'utf8').replace(/\r\n/g, '\n');
        const missing = Object.values(HOME_PIECES).filter((p) => !marker(p));
        const unread = Object.entries(HOME_PIECES).filter(([c, p]) => !hg.includes('where("' + p + '", ' + c + ')')).map(([, p]) => p);
        ok(/\[node name="Layout" type="Node2D" parent="\."\]\nscript = ExtResource\(/.test(HOME_TSCN) && /path="res:\/\/rooms\/home_layout\.gd"/.test(HOME_TSCN)
           && missing.length === 0 && unread.length === 0
           && /func where\(piece: String, fallback: Vector2\) -> Vector2:\s*\n\s*var m := get_node_or_null\("Layout\/" \+ piece\) as Node2D\s*\n\s*return m\.position if m != null else fallback/.test(hg),
          '⭐ his home is laid out in the editor: a marker under Layout in home.tscn for every piece, and home.gd places each at its marker  (the code\u2019s number is only the fallback)',
          (missing.length ? 'no marker: ' + missing.join(' ') : Object.keys(HOME_PIECES).length + ' markers') + (unread.length ? '; not read: ' + unread.join(' ') : ''));
        ok(/^@tool/.test(lay) && /func _draw\(\) -> void:\s*\n\s*if not Engine\.is_editor_hint\(\):\s*\n\s*return/.test(lay)
           && Object.values(HOME_PIECES).every((p) => lay.includes('"' + p + '"')),
          '…and the Layout draws each piece\u2019s name and size in the editor only  (the game draws nothing for it)');
        /* ⚠ ON THE FLOOR: a piece dragged past the round wall is a bug, wherever else he puts it. */
        const ROOM = { mx: 0, my: 5, rx: 500, ry: 278 };
        const off = Object.values(HOME_PIECES).filter((p) => { const q = marker(p); return q && ((q.x - ROOM.mx) / ROOM.rx) ** 2 + ((q.y - ROOM.my) / ROOM.ry) ** 2 > 1; });
        ok(off.length === 0, '⚠ …and every marker stands on the floor, inside the round wall', off.join(' ') || 'all ' + Object.keys(HOME_PIECES).length + ' inside');
      }
      const LINES_DIR = path.join(GD, 'people', 'lines');
      const LINES_ALL = fs.existsSync(LINES_DIR) ? fs.readdirSync(LINES_DIR).filter((f) => f.endsWith('.txt')).sort() : [];
      const words = (who) => {
        const f = path.join(LINES_DIR, who.toLowerCase().replace(/ /g, '_') + '.txt'), out = {};
        if (!fs.existsSync(f)) return out;
        let h = '';
        for (const raw of readRaw.call(fs, f, 'utf8').split('\n')) {
          const row = raw.trim();
          if (row === '' || row.startsWith('#')) continue;
          if (row.startsWith('[') && row.endsWith(']') && !row.includes(' ')) { h = row.slice(1, -1); out[h] = out[h] || []; continue; }
          if (h) out[h].push(row);
        }
        return out;
      };
      {
        const lc = readRaw.call(fs, GDF('lines.gd'), 'utf8').replace(/\r\n/g, '\n');
        const empty = LINES_ALL.filter((f) => Object.values(words(f.replace(/\.txt$/, ''))).every((rows) => rows.length === 0));
        ok(/^class_name Lines/m.test(lc) && /static func list\(who: String, heading: String\) -> Array\[String\]:/.test(lc)
           && /if not FileAccess\.file_exists\(path\):\s*\n\s*return out/.test(lc) && LINES_ALL.length >= 15 && empty.length === 0,
          '⭐ everybody\u2019s words are one file each in people/lines/, read by name  (a missing file is a quiet person, not a stopped game)',
          LINES_ALL.length + ' files' + (empty.length ? '; nothing under any heading: ' + empty.join(' ') : ''));
        const codeish = LINES_ALL.filter((f) => /^\s*(func |var |const |extends |@|\w+ := )/m.test(readRaw.call(fs, path.join(LINES_DIR, f), 'utf8')));
        ok(codeish.length === 0, '…and they hold words only: headings, notes and lines', codeish.join(' ') || LINES_ALL.join(' '));
        ok(/include_filter="people\/lines\/\*\.txt"/.test(readRaw.call(fs, GDF('export_presets.cfg'), 'utf8')),
          '⚠ …and the web build carries them  (a .txt is not a resource, so export_presets.cfg lists them)');
        const typed = GD_ALL.filter((n) => /\.gd$/.test(n)).filter((n) => /\.(lines|board_lines) = \[\s*"|\.(local_line|self_line|razz_line|before_line|part_line) = "/
          .test(readRaw.call(fs, GDF(n), 'utf8')));
        ok(typed.length === 0, '⚠ …and no script types a person\u2019s words where they stand any more', typed.join(' ') || 'none do');
      }
      {
        const dials = [...TUNE_GD.matchAll(/^@export_range\(([^)]*)\) var (\w+) := (-?[\d.]+)/gm)].map((m) => m[2]);
        const keys = [...TUNE_RES.matchAll(/^(\w+) = /gm)].map((m) => m[1]).filter((k) => k !== 'script');
        const out = dials.filter((k) => { const v = tune(k), r = tuneRange(k); return !r || !(v >= r[0] && v <= r[1]); });
        const stray = keys.filter((k) => !dials.includes(k));
        ok(/^class_name Tuning\nextends Resource/m.test(TUNE_GD) && /static func now\(\) -> Tuning:[\s\S]*?_now = Tuning\.new\(\)/.test(TUNE_GD)
           && /path="res:\/\/core\/tuning\.gd"/.test(TUNE_RES) && /script = ExtResource\(/.test(TUNE_RES)
           && dials.length >= 30 && out.length === 0 && stray.length === 0,
          '⭐ the dials are one file he sets in the Inspector: each one a slider, each value inside its slider  (a missing file plays on the defaults)',
          dials.length + ' dials' + (out.length ? '; outside their slider: ' + out.join(' ') : '') + (stray.length ? '; not a dial: ' + stray.join(' ') : ''));
        const top = tuneRange('skate_top'), turn = tuneRange('skate_turn');
        ok(top && top[1] <= 1.5 && turn && turn[0] >= 6,
          '⛑ his two calls are the skating sliders\u2019 own ends: top speed at most 1.5\u00d7 the walk, turning at least 6 a second  (his: "the turns are too rounded and the top speed is significantly too high")',
          'skate_top ' + top + ' · skate_turn ' + turn);
        const homes = { 'player.gd': Object.keys(TUNED), 'dog.gd': ['TROT'], 'knight.gd': Object.keys(TUNED),
          'lift.gd': Object.keys(TUNED), 'game_state.gd': Object.keys(TUNED) };
        const still = Object.entries(homes).filter(([f, names]) =>
          new RegExp('^const (' + names.join('|') + ') := -?[\\d.]', 'm').test(readRaw.call(fs, GDF(f), 'utf8'))).map(([f]) => f);
        ok(still.length === 0, '\u26a0 …and no dial is still a constant where it used to live: one number, one place',
          still.join(' ') || 'player, dog, knight, lift and game_state read the dials');
      }
      ok(GD_DUPS.length === 0, 'every file in the game has a name of its own, so a check can find it by name',
        GD_DUPS.join(' '));
      /* ⚠ A DOOR TO A MOVED SCENE SILENTLY DOES NOTHING, so every typed path must name a file that is there. */
      {
        const dead = [];
        for (const f of GD_ALL.filter((n) => /\.(gd|tscn|godot)$/.test(n))) {
          for (const m of readRaw.call(fs, GDF(f), 'utf8')
            .matchAll(/res:\/\/([A-Za-z0-9_\/.\-]+\.(?:gd|tscn|tres|glb|png|ttf|ogg|svg|gdshader))/g)) {
            if (!fs.existsSync(path.join(GD, m[1]))) dead.push(f + ' -> res://' + m[1]);
          }
        }
        ok(dead.length === 0, 'every res:// path in the game names a file that is there',
          dead.length ? dead.slice(0, 6).join('  ') : 'scripts, scenes and project.godot read');
      }
      const gs = fs.readFileSync(GDF('game_state.gd'), 'utf8');
      const zone = fs.readFileSync(GDF('zone.gd'), 'utf8');
      ok(/func poll_challenge\(/.test(gs), 'GameState.challenge.poll_challenge exists');
      ok(/townResult/.test(gs), '…and it calls PJCC.townResult');
      ok(/"at":\s*Time\.get_unix_time_from_system\(\)/.test(gs),
        '…and begin_challenge stamps the errand, or an old win answers for it');
      ok(/return c === false \? 1 : 2;/.test(gs) && /if \(!v\) return 0;/.test(gs),
        '…returning 2/1/0/null, never a bare bool — false and null are one Variant');
      ok(/func resolve_challenge\(won: bool, clean: bool = true\)/.test(gs),
        'a NAMED SQUARE COSTS A CLEAN WIN — difficulty replaced the daily rhythm');
      ok(/if not clean:[\s\S]{0,200}return -2/.test(gs),
        '…and a helped win does NOT retire them: sloppy means go again, like a loss');
      /* ⭐ BOTH CASTLES SINCE 2026-09-12 (his call). */
      /* ⚠ includes(), NOT a regex. */
      ok(gs.includes('func castle_ready_long() -> bool:'),
        'the Assembly offers the long castle too');
      ok(gs.includes('open_at(4, HOME_RANK) and open_at(5, HOME_RANK) and open_at(6, HOME_RANK)'),
        '…and it clears THREE squares — b is empty for the ROOK, though the king never stands on it');
      ok(gs.includes('has_slot(4) and has_slot(0)') && gs.includes('cell_of(0) == Vector2i(7, HOME_RANK)'),
        '…and it is the A-ROOK it checks, slot 0 on file 7  (⚠ our kingside is the LOW files)');
      ok(gs.includes('out.append(Vector2i(5, HOME_RANK))'),
        '…the king is offered c(5), two squares the other way');
      ok(gs.includes('_put(0, Vector2i(4, HOME_RANK))'),
        '…and the a-rook lands on d(4), or the king castles by himself');
      ok(/_poll\.timeout\.connect\(_tick\)/.test(gs) && /\bpoll_challenge\(\)/.test(gs),
        '…on a timer: the new tab means the town never reloads, so nothing else asks');
      ok(/if not OS\.has_feature\("web"\) and not GameState\.worlds\.no_site\(\):\s*\n\s*add_child\(DevReferee/.test(zone),
        'the DevReferee stand-in is DESKTOP ONLY — on web it would hide a broken seam');
      /* ⚠ the half that was missing until 2026-09-03: the town has to READ the account. */
      ok(/func pull_from_site\(/.test(gs) && /townState/.test(gs),
        'GameState.pull_from_site asks the site for the account copy');
      ok(/func merge_in\(/.test(gs) && /int\(challenge\.beaten\.get\(k, -1\)\)/.test(gs),
        '…and merges it by the same rules  (⚠ beaten vs -1: day 0 is a real day)');
      ok(/_pulls_left/.test(gs) && /_poll\.timeout\.connect\(_tick\)/.test(gs),
        '…for the first ticks, so an async myStats() landing late still gets in');
      /* ⭐ the nine squares nobody in the town can give you. */
      ok(/func check_site_unlocks\(/.test(gs) && /townScore/.test(gs),
        'the dead squares are won from the REST OF THE SITE — the board can fill at all now');
      ok(/for \(i = 0; i < gs\.length; i\+\+\)/.test(gs),
        '…in ONE bridge crossing, not one per square on a 2s tick');
      ok(/str\(r\.get\("key", ""\)\) != "" or r\.has\("un"\)/.test(gs),
        '…and claimable() counts them, or army_full() locks the CEO behind them');
      /* ══ the three from 2026-09-03 ══ */
      const player = fs.readFileSync(GDF('player.gd'), 'utf8');
      const door = fs.readFileSync(GDF('door.gd'), 'utf8');
      const town = fs.readFileSync(GDF('town.gd'), 'utf8');
      /* ⛑ THE EDGE IS THE WINDOW'S NOW (2026-09-27), not the whole map's — but it is still
         ONE rect shared by the walls and the paint, which is what this always guarded. */
      ok(/world_bounds/.test(zone) && /world_bounds = region_rect\(region\)/.test(town)
        && /return region_rect\(region\)\.grow\(/.test(town),
        'the map has an edge, and it is the same rect the window paints from');
      ok(/limit_smoothed = true/.test(player) && /func _keep_inside\(/.test(player),
        '…the camera stops at it and so do the feet  (⚠ smoothing overshoots without it)');
      ok(/const GROUND_RECT/.test(town) && !/Rect2\(-1120\.0, -560\.0, 2240\.0, 1780\.0\), GROUND\)/.test(town),
        '…from ONE constant — two copies of the map size drift into a camera stopping in a field');
      /* the compounding thing, visible without going indoors. */
      ok(/func _draw_windows\(/.test(door) && /lit_windows/.test(door),
        'the Assembly wears the board on its face — 16 windows in slot order');
      ok(/GameState\.board\.army_changed\.connect\(_light_the_hall\)/.test(town),
        '…and relights them, because a square can fill from another tab');
      const audio = fs.readFileSync(GDF('town_audio.gd'), 'utf8');
      ok(/AudioStreamWAV/.test(audio) && /FORMAT_16_BITS/.test(audio),
        'there is sound now, synthesized in code — no binary to ship or license');
      ok(/a\.step\(\)/.test(player) && /_walked/.test(player),
        '…footsteps paced by DISTANCE, so they stop when you walk into a wall');

      /* ══ the cast, and the four squares that had no way in ══ */
      /* ⚠ SLICED TO `\n]`, NOT THE FIRST `]`. */
      const rStart = gs.indexOf('const ROSTER');
      const roster = gs.slice(rStart, gs.indexOf('\n]', rStart));
      ok(!/"key": ""\s*\}/.test(roster.replace(/"un":[^}]*/g, '')) || /"un"/.test(roster),
        'no square is a dead end — every one has a key or an "un"');
      ok(/"who": "Robert",\s*"key": "robert"/.test(roster),
        '⛑ Robert has a square — he stood in the town owning nothing you could win');
      ok(/_add_challenger\("Vince", "brother"/.test(town),
        '⛑ Vince is ON THE MAP — he owned the a-rook and was nowhere');
      /* ⛑ A TownDog since 2026-09-04, not _add_challenger. Outside the Assembly, and still the c-bishop. */
      ok(/var dog := TownDog\.princess\(\)/.test(town) && /dog\.position = HALL_AT \+/.test(town)
         && /"Princess": \{ "key": "princess"/.test(fs.readFileSync(GDF('dog.gd'), 'utf8')),
        '…and Princess stands outside the Assembly she gates  (built once, in dog.gd — the house has her too)');
      /* ⚠ the bench was NOT reshaped to fit the town — that failure has happened once. */
      const yml = fs.readFileSync(path.join(ROOT, '_data/regulars.yml'), 'utf8');
      const keys = [...roster.matchAll(/"key": "([a-z]+)"/g)].map((m) => m[1]);
      const real = [...yml.matchAll(/^- key:\s*(\S+)/gm)].map((m) => m[1]);
      ok(keys.every((k) => real.includes(k)),
        '…and every key is a REAL bench seat — a made-up key is a dead door',
        keys.filter((k) => !real.includes(k)).join(' ') || keys.length + ' checked');

      /* six hearts, and a card that works without a mouse. */
      ok(/const HEART_CAP := 6/.test(gs), 'hearts cap at six, not ten');
      ok(/clampi\(int\(people\.hearts\[k\]\), 0, people\.HEART_CAP\)/.test(gs),
        '…and a save from before today is clamped, or six pips sit beside a nine');
      const card = fs.readFileSync(GDF('npc_card.gd'), 'utf8');
      ok(/get_mouse_position/.test(card) && /active_npc\(\)/.test(card),
        'the relationship card has TWO ways in — hover, and standing there  (he is on iOS)');

      const acad = fs.readFileSync(GDF('academy.gd'), 'utf8');
      ok(/scene_path = "res:\/\/rooms\/academy.tscn"/.test(town),
        'the Academy is a building you enter, not a link');
      /* ⚠⚠ A ROOM THAT OPENS ONTO A 404 IS THE WHOLE POINT OF THIS CHECK. */
      const permalinks = new Set();
      const walk = (dir) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          if (e.name === 'node_modules' || e.name === '.git' || e.name === '_site') continue;
          const f = path.join(dir, e.name);
          if (e.isDirectory()) { walk(f); continue; }
          if (!/\.(md|html)$/.test(e.name)) continue;
          const head = fs.readFileSync(f, 'utf8').slice(0, 900);
          const m = head.match(/^permalink:\s*(\S+)\s*$/m);
          if (m) permalinks.add(m[1].replace(/^["']|["']$/g, ''));
          if (e.name === 'index.html' || e.name === 'index.md') {
            permalinks.add('/' + path.relative(ROOT, dir).replace(/\\/g, '/') + '/');
          }
        }
      };
      walk(ROOT);
      /* ⚠⚠ THE ROOMS ARE READ OUT OF THE FILE, NOT LISTED HERE. */
      const rooms = [...acad.matchAll(/_lesson\("[^"]*",\s*"([^"]+)"/g)].map((m) => m[1]);
      ok(rooms.length >= 3, 'the Academy has its lesson rooms', rooms.length + ' found');
      for (const u of rooms) {
        ok(permalinks.has(u), 'the room for ' + u + ' is a real page, not a 404');
      }
      ok(/world_bounds = Rect2/.test(acad),
        '…and the room has walls, or you walk out into black');

      const hall = fs.readFileSync(GDF('hall.gd'), 'utf8');
      /* ⛑⛑ SUPERSEDED 2026-09-04. */
      /* his: "the message to the left of the assembly board NOT read the names of those who are not there yet (it should be a mystery) but instead a cryptic line." */
      ok(/func _owed\(\)/.test(hall),
        'the lectern still reads the BOARD  (⚠ cryptic is not random — a riddle still points somewhere)');

      /* ══ 5 · MONKEY ISLAND: THE LINE LEFT THE BOX (2026-09-03) ══ */
      const speech = fs.readFileSync(GDF('speech.gd'), 'utf8');
      const inter = fs.readFileSync(GDF('interactable.gd'), 'utf8');
      const ui = fs.readFileSync(GDF('town_ui.gd'), 'utf8');
      const npc = fs.readFileSync(GDF('npc.gd'), 'utf8');
      const chal = fs.readFileSync(GDF('challenger.gd'), 'utf8');

      ok(/extends CanvasLayer/.test(speech) && /get_canvas_transform\(\)/.test(speech),
        'the line is drawn over the speaker — a layer that PROJECTS, not a Label in the world',
        '(a parented label at the map edge is drawn where the camera cannot reach)');
      ok(/u\.say\(text, seconds, self\)/.test(inter) && /u\.talk\(speaker, line, options, self\)/.test(inter),
        '…and every interactable names its own mouth');
      ok(/func speech_top\(/.test(chal) && /func speech_top\(/.test(npc),
        '…and anything taller than its radius raises the line clear of its own picture');
      ok(/var look: int = IDLE if \(_mode == SAY and _bubbled\) else _mode/.test(ui),
        '…a bubbled one-liner leaves the box LOOKING idle, so the prompt does not blink out');
      /* ⛑ REWORDED 2026-09-04, not weakened. speaker() answered "who is talking". */
      ok(/func speaking\(who: Node2D\) -> bool:/.test(
        fs.readFileSync(GDF('speech.gd'), 'utf8')),
        '…a speaker can be asked about, one at a time');
      /* ⚠⚠ THE BOX IS NOT DEAD CODE. */
      ok(/_ui\.say\("Word travels/.test(zone) && /func _bubble\(from: Node2D/.test(ui),
        '…and the BOX still answers when nobody on screen is speaking');

      /* the big fight — the only line in the town that knows the board's total. */
      ok(/"id": "big"/.test(chal) && /GameState\.board\.has_slot\(GameState\.board\.slot_for_key\(key\)\)/.test(chal),
        'a regular whose square you hold offers the big fight');
      ok(/func _big_fight_line\(/.test(chal) && /GameState\.board\.claimable\(\)/.test(chal),
        '…and reads the answer OFF THE BOARD, so it changes as the board fills');

      /* ⛑ the names came off the Assembly, 2026-09-03. */
      ok(/func _draw_plate\(/.test(hall) && !/NAME_OFF/.test(hall),
        'the Assembly wears blank NAMEPLATES — the name is the prize, not the label');
      ok(/if not won or f == null or who == "":\s*\n\s*return/.test(hall),
        '…and an unwon square is written on by nothing');

      /* the testing speed, and the two things that had to move with it. */
      /* his: "we were in the 500s and you sent me into the 1000s but your second-guess was correct." */
      ok(/position_smoothing_speed = maxf\(7\.0, speed \/ /.test(player),
        '…the camera is DERIVED from it, or you outrun your own view');
      ok(/_walked >= speed \* /.test(player),
        '…and so is the footstep, or the cadence is 15 a second');

      /* ══ 6 · SHOGI ISLAND, BY BOAT ══ */
      const isl = fs.readFileSync(GDF('island.gd'), 'utf8');
      /* ⛑⛑ 2026-09-03: this check asserted the OPPOSITE for one day. Do not restore it. */
      /* his: "let's open up the japanese games on Shogi island - it's time - let's just do it." */
      ok(/\burl\s*=\s*"\/games\/shogi-island\/"/.test(isl),
        'the island OPENS the shogi room now  (⛑ the 09-03 reversal, his call)');
      ok(/world_bounds = Rect2/.test(isl), '…and it has an edge');

      /* ══ 6c · THE CROSSING - YOU ROW THERE ══ */
      /* his: "when you get the oars to go to shogi island - can you make a dock on each side? so we don't teleport there, we row there." */
      const seaAt = GDF('sea.gd');
      ok(fs.existsSync(seaAt) && fs.existsSync(GDF('sea.tscn')),
        'the crossing is a room of its own');
      const sea = fs.existsSync(seaAt) ? fs.readFileSync(seaAt, 'utf8') : '';
      ok(/class_name SeaCrossing\s*\nextends TownZone/.test(sea),
        '\u2026a TownZone like every other room, so the HUD, the journal and the pad come free');
      ok(/boat\.scene_path = "res:\/\/rooms\/sea\.tscn"/.test(town)
         && !/scene_path = "res:\/\/rooms\/island\.tscn"/.test(town),
        'the town rowboat opens the WATER, and nothing in town opens the island directly');
      ok(/back\.scene_path = "res:\/\/rooms\/sea\.tscn"/.test(isl)
         && !/scene_path = "res:\/\/town\/town\.tscn"/.test(isl),
        '\u2026and the island rows back into the same water, not straight home');
      ok(/scene_path = "res:\/\/town\/town\.tscn"/.test(sea)
         && /scene_path = "res:\/\/rooms\/island\.tscn"/.test(sea),
        '\u2026which leaves the crossing as the only room that opens either end');

      /* ══ THE FOUR LANDING POINTS, EACH DERIVED AGAINST THE OTHER FILE ══ */
      const v2 = (src, name) => {
        const h = layoutAt(src, name); if (h) return h;
        const m = new RegExp('const ' + name + ' := Vector2\\((-?[\\d.]+), (-?[\\d.]+)\\)').exec(src);
        return m ? { x: +m[1], y: +m[2] } : null;
      };
      const rc = (src, name) => {
        const m = new RegExp('const ' + name + ' := Rect2\\('
          + '(-?[\\d.]+), (-?[\\d.]+), (-?[\\d.]+), (-?[\\d.]+)\\)').exec(src);
        return m ? { x: +m[1], y: +m[2], w: +m[3], h: +m[4] } : null;
      };
      const num = (src, name) => {
        const m = new RegExp('const ' + name + ' := (-?[\\d.]+)').exec(src);
        return m ? +m[1] : null;
      };
      const inR = (r, q) => !!r && !!q && q.x >= r.x && q.x <= r.x + r.w
        && q.y >= r.y && q.y <= r.y + r.h;
      const tieT = v2(sea, 'TOWN_TIE'), tieI = v2(sea, 'ISLE_TIE');
      const landT = v2(sea, 'TOWN_LANDING'), landI = v2(sea, 'ISLE_LANDING');
      ok(inR(rc(sea, 'TOWN_DOCK'), tieT) && inR(rc(sea, 'ISLE_DOCK'), tieI),
        'out on the water you are put down ON the dock at each end, not beside it');
      /* the town's planks, read the way section 16g reads them. */
      const jm = /const JETTY := Rect2\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(town);
      const km = /func _deck\(\) -> Rect2:\s*\n\s*return Rect2\(SEA_AT\.x - ([\d.]+), SEA_AT\.y - ([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(town);
      const sm = /const SEA_AT := Vector2\(([\d.]+), ([\d.]+)\)/.exec(town);
      const jetty2 = jm ? { x: +jm[1], y: +jm[2], w: +jm[3], h: +jm[4] } : null;
      const deck2 = km && sm
        ? { x: +sm[1] - +km[1], y: +sm[2] - +km[2], w: +km[3], h: +km[4] } : null;
      const onPlank = (q) => inR(jetty2, q) || inR(deck2, q);
      const rbRet = /boat\.return_at = Vector2\(([\d.]+), ([\d.]+)\)/.exec(town);
      ok(!!jetty2 && !!deck2 && onPlank(landT),
        '\u2026and the town end of the trip lands you on a plank, never in the sea');
      ok(!!rbRet && onPlank({ x: +rbRet[1], y: +rbRet[2] }),
        '\u2026and so does the rowboat own note  (⛑ 940,820 was open water for two days)');

      /* the island's dock, and the clamp that decides where a body may stand on it. */
      const dm2 = /const DOCK := Rect2\(-SPIT_HALF, ([\d.]+), SPIT_HALF \* 2\.0, ([\d.]+)\)/.exec(isl);
      const spitHalf = num(isl, 'SPIT_HALF'), spitTop = num(isl, 'SPIT_TOP');
      const mid = v2(isl, 'MID'), RX = num(isl, 'RX'), RY = num(isl, 'RY');
      const moor = v2(isl, 'MOORING');
      const iDock = dm2 && spitHalf
        ? { x: -spitHalf, y: +dm2[1], w: spitHalf * 2, h: +dm2[2] } : null;
      ok(!!iDock && inR(iDock, landI) && inR(iDock, moor),
        '\u2026and the island end lands you on its dock, where the boat is tied');
      const sandHalf = (y) => {
        const t = (y - mid.y) / RY;
        return RX * Math.sqrt(Math.max(0, 1 - t * t));
      };
      const halfAt = (y) => Math.max(sandHalf(y), y >= spitTop ? spitHalf : 0);
      const BODY = 17;                                   // TownPlayer.radius + 2
      let offIsland = 0;
      if (iDock && mid && RX && RY && spitTop !== null) {
        for (let y = iDock.y; y <= iDock.y + iDock.h; y += 2) {
          if (halfAt(y) + 0.001 < spitHalf) offIsland++;
        }
      }
      ok(offIsland === 0 && !!moor && Math.abs(moor.x) < halfAt(moor.y) - BODY
         && moor.y <= iDock.y + iDock.h - BODY,
        '\u2026and every plank of that dock is inside what the clamp lets you stand on',
        offIsland + ' rows of dock the island does not reach  (⚠⚠ raise SPIT_TOP past the '
        + 'dock and the boat is somewhere you cannot walk to)');

      /* ══ WHAT YOU ARE, OUT THERE ══ */
      ok(/func _make_player\(\) -> TownPlayer:\s*\n\s*return Rowing\.new\(\)/.test(sea)
         && /class Rowing extends TownPlayer/.test(sea),
        'the thing you steer across is a boat, not a man standing on the sea');
      ok(/velocity = velocity\.lerp\(want, 1\.0 - exp\(-k \* delta\)\)/.test(sea),
        '\u2026with drag, so a hull comes up to speed and coasts down from it',
        'exp(), NEVER a flat lerp by delta - that one is faster on a 144Hz monitor');
      ok(!/\.step\(\)/.test(sea), '\u2026and it does not go clop across open water');
      /* ⚠⚠ THE SHORES ARE OUT OF REACH BY GEOMETRY, NOT BY A WALL. world_bounds is the open water. */
      const wb = /world_bounds = Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(sea);
      const SW = num(sea, 'W'), SHORE = num(sea, 'SHORE');
      ok(!!wb && !!SW && !!SHORE && +wb[1] >= -SW + SHORE && +wb[1] + +wb[3] <= SW - SHORE,
        'the sailable water stops before either beach does',
        wb ? wb[1] + ' to ' + (+wb[1] + +wb[3]) + ', inside +/-' + (SW - SHORE) : 'no bounds');
      ok(/camera_bounds = Rect2\(-W, -H, W \* 2\.0, H \* 2\.0\)/.test(sea),
        '\u2026while the camera still shows them, or you set out toward nothing');
      ok(!!wb && inR({ x: +wb[1], y: +wb[2], w: +wb[3], h: +wb[4] }, tieT)
         && inR({ x: +wb[1], y: +wb[2], w: +wb[3], h: +wb[4] }, tieI),
        '\u2026and both tie-ups are inside it, or you arrive where the clamp will move you');

      ok(/static func hull\(\) -> PackedVector2Array/.test(sea)
         && /SeaCrossing\.moored\(self, GameState\.challenge\.island_open\)/.test(town)
         && /SeaCrossing\.moored\(self, true\)/.test(isl),
        'every boat in the town is drawn from one set of points');
      ok(/SeaCrossing\.plank_dock\(self, JETTY\)/.test(town)
         && /SeaCrossing\.plank_dock\(self, DOCK\)/.test(isl)
         && (sea.match(/plank_dock\(self, (?:TOWN|ISLE)_DOCK\)/g) || []).length === 2,
        '\u2026and every dock from one drawing, at all four places there is one');

      /* ══ AND THE ISLAND'S OWN SHORE ══ */
      ok(/class Beachcomber extends TownPlayer/.test(isl)
         && /func _keep_inside\(\) -> void/.test(isl)
         && /position\.y = clampf\(position\.y, top \+ 1\.0, ShogiIsland\.DOCK\.end\.y - r\)/.test(isl)
         && /var half: float = maxf\(ShogiIsland\.half_at\(position\.y\), r \+ 1\.0\)/.test(isl)
         && /position\.x = clampf\(position\.x, -half \+ r, half - r\)/.test(isl),
        'the island shore is a clamp on the player, not a ring of boxes');
      ok(!/StaticBody2D/.test(isl),
        '\u2026and nothing on the island pretends to be a wall standing in the water');
      ok(/var w: float = sand_half\(y\)/.test(isl)
         && (isl.match(/static func sand_half/g) || []).length === 1,
        '\u2026and the beach it draws and the edge it clamps to are ONE function');
      /* ⚠ THE SQUARE FOLLOWS THE GAME THAT WINS IT. */
      ok(/"who": "Matsu"/.test(roster) && !/Shogi Island",\s*"key"/.test(roster),
        '…and the d-pawn belongs to whoever\'s game wins it');
      /* ⚠⚠ MEASURED, NOT ASSUMED: Godot's built-in font has no kana. */
      const fontAt = GDF('kaede_jp.ttf');
      ok(fs.existsSync(fontAt), 'a font that can draw kana ships with the town');
      if (fs.existsSync(fontAt)) {
        ok(fs.statSync(fontAt).size < 200 * 1024,
          '…and it is a SUBSET, not a 9 MB CJK face', Math.round(fs.statSync(fontAt).size / 1024) + ' kB');
      }
      ok(/fv\.base_font = ThemeDB\.fallback_font/.test(speech) && /fv\.fallbacks = \[jp\]/.test(speech),
        '…as a FALLBACK, so the rest of the town does not change typeface');
      ok(/if jp == null:\s*\n\s*return null/.test(speech),
        '…and a missing font loses Kaede, not the English  [[down-never-stuck]]');
      ok(/no_seat_say/.test(chal) && /no_seat_say = /.test(isl),
        'his chess row is grayed and SAYS WHY — no bench seat was invented for him');

      ok(/const PUZZLE_RUN := 3/.test(gs) && /func poll_puzzle\(/.test(gs),
        'the Puzzle Champ keeps the oars until three clean in a row');
      ok(/challenge\.poll_challenge\(\)\s*\n\s*challenge\.poll_puzzle\(\)/.test(gs),
        '…counted on the SAME 2s tick, not a second timer');
      ok(/if typeof\(got\) != TYPE_ARRAY:/.test(gs),
        '…reading an ARRAY of results, or two puzzles inside one tick lose one  (⚠ the streak would never finish)');
      ok(/puz = \{ "failed_day": GameState\.day_no\(\) \}/.test(gs) && /!= GameState\.day_no\(\)/.test(fnGd(gs, 'puzzle_ready')),
        '…and one wrong answer ends it until tomorrow  (the real tomorrow since 2026-10-03)');
      ok(/func puzzle_more\(/.test(gs) && /NOT puzzle_begin/.test(gs),
        '…while "set me another" mid-run does NOT reset the count to zero');
      const pMore = fnGd(gs, 'puzzle_more');
      ok(/"%s\?oars=%d&since=%d" % \[PUZZLE_URL, PUZZLE_RUN - puzzle_streak\(\),\s*roundi\(/.test(pMore) &&
         /open_url\(url\)/.test(pMore) && /puzzle_more\(\)/.test(fnGd(gs, 'puzzle_begin')),
        '…and both doors tell the room what is still owed and since when, so it can close itself',
        'roundi, not int: truncating a float stamp a hair low recounts the last solve');
      /* ⚠ IT NAMES THE REFUSAL, not the flag. */
      ok(/class Rowboat extends TownDoor/.test(town) &&
         /if not GameState\.challenge\.island_open:\s*\n\s*say\("No oars/.test(town),
        'the boat refuses until the oars are won');
      ok(/class PuzzleChamp extends TownNPC/.test(town) && !/class PuzzleChamp extends TownChallenger/.test(town),
        '…and the Champ is NOT a challenger — he has no bench key and must never be given one');

      /* ══ 6b · THE JAPANESE LANE, OPENED 2026-09-03 ══ */
      /* his: "let's open up the japanese games on Shogi island - it's time - let's just do it. Get Kaede's sibling on the map too and let's do both japanese game (reading room and shogi) - let's do what we can to teach the user japanese if they wish." */
      const town2 = town;
      /* ⚑ MOVED 2026-09-21. */
      /* his: "move the Reading Room to the island" */
      ok(/url = "\/games\/reading-room\/"/.test(isl) && !/url = "\/games\/reading-room\/"/.test(town2),
        'the Reading Room is a building on Shogi Island, and no longer in town');
      /* ⚠⚠ EVERY SITE URL THE TOWN OPENS, PULLED OUT OF THE TOWN. */
      const arc = fs.readFileSync(GDF('arcade.gd'), 'utf8');
      const park = fs.readFileSync(GDF('park.gd'), 'utf8');
      const pit = fs.readFileSync(GDF('depths.gd'), 'utf8');
      const stair = fs.readFileSync(GDF('stairwell.gd'), 'utf8');
      /* ⭐ THE RINGS OPEN SITE GAMES SINCE 2026-10-03; the parked Arcade opens nothing. */
      const rings = fs.readFileSync(GDF('portal.gd'), 'utf8');
      /* ⛑⛑ AND THE SPELLINGS CHANGED UNDER IT, 2026-09-04. */
      const doors = [...(isl + town2 + rings + park + pit + stair + gs)
        .matchAll(/(?:\burl = |"url": |\b[A-Z_]*URL :?= )"(\/[^"]+)"/g)]
        .map((m) => m[1].split('?')[0]);
      ok(doors.length >= 5, 'the town opens real site pages', doors.length + ' doors read from source');
      for (const u of [...new Set(doors)]) {
        ok(permalinks.has(u), 'the door to ' + u + ' is a real page, not a 404');
      }
      /* ⚠⚠ CANON PUTS THEM IN DIFFERENT PLACES AND THE ASK DID NOT. */
      const kmd = fs.readFileSync(path.join(ROOT, '_characters/kaede.md'), 'utf8');
      const mmd = fs.readFileSync(path.join(ROOT, '_characters/matsu.md'), 'utf8');
      /* ⛑ SHE IS INSIDE THE ACADEMY SINCE 2026-09-24 (his: "Put Kaede and Robert into the
         academy building instead of outside"). Still Checker Town, which is what her file
         says — what changed is which side of the door. ⚠ AND NOT IN town.gd ANY MORE: two
         copies of a character is two characters. */
      ok(/last_seen:\s*CHECKER TOWN/.test(kmd) && /kaede\.who = "Kaede"/.test(acad)
        && !/kaede\.who = "Kaede"/.test(town2),
        'Kaede is in Checker Town, where her own character file puts her — inside the Academy',
        'academy.gd places her, town.gd no longer does');
      ok(/last_seen:\s*SHOGI ISLAND/.test(mmd) && /matsu\.who = "Matsu"/.test(isl),
        '…and Matsu is on the island, where his does');
      ok(/matsu\.no_english = true/.test(isl),
        '…he speaks no English, and the card says so rather than leaving you to guess');
      /* ⛑⛑ THE SIXTEEN WORDS CAME OUT 2026-09-07. */
      /* his: "let's remove the 'learn sixteen words' from the japanese characters in checker town" */
      ok(!/@export var teaches_words/.test(npc) && !/"id": "word"/.test(npc)
        && !/const WORDS :=/.test(gs) && !/func learn_word\(/.test(gs),
        'nobody in the town runs a vocabulary drill any more',
        '⚠ SHAPES, NOT THE WORD "teaches_words" — the comment recording the removal says it');
      const kLines = words('Kaede').lines || [], mLines = words('Matsu').lines || [];
      /* ⚠ EVERY LINE, NOT FOUR OF THEM. */
      const kEntries = kLines.length;
      const kBoth = kLines.filter((l) => l.includes(' — ')).length;
      ok(kEntries >= 4 && kBoth === kEntries,
        'Kaede says it in Japanese and then in English, on every line she has',
        kBoth + ' of ' + kEntries);
      /* ⭐⭐ EXACTLY ONE, AND THE COUNT IS THE POINT. */
      /* his: "a TINY bit of English" */
      ok(mLines.length > 0 && mLines.filter((l) => l.includes(' — ')).length === 1 && mLines[mLines.length - 1].includes(' — '),
        '…and Matsu cracks by exactly one English word, at the top of the hearts ladder',
        mLines.length ? mLines.filter((l) => l.includes(' — ')).length + ' of his lines carry any' : 'no lines');

      /* ⭐⭐ THE FONT COVERS WHAT THE SCRIPTS SAY. */
      const cover = (() => {
        const b = fs.readFileSync(fontAt);
        const num = b.readUInt16BE(4);
        let cmap = 0;
        for (let i = 0; i < num; i++) {
          const o = 12 + i * 16;
          if (b.toString('latin1', o, o + 4) === 'cmap') cmap = b.readUInt32BE(o + 8);
        }
        if (!cmap) return null;
        const set = new Set();
        const n = b.readUInt16BE(cmap + 2);
        for (let i = 0; i < n; i++) {
          const off = cmap + b.readUInt32BE(cmap + 4 + i * 8 + 4);
          if (b.readUInt16BE(off) !== 4) continue;          // format 4 covers the BMP
          const segX2 = b.readUInt16BE(off + 6), seg = segX2 / 2;
          const ends = off + 14, starts = ends + segX2 + 2, deltas = starts + segX2;
          for (let sgi = 0; sgi < seg; sgi++) {
            const e = b.readUInt16BE(ends + sgi * 2), st = b.readUInt16BE(starts + sgi * 2);
            if (st === 0xFFFF) continue;
            for (let c = st; c <= e && c !== 0x10000; c++) set.add(c);
          }
        }
        return set;
      })();
      ok(cover && cover.size > 200, 'the font\'s cmap is readable', cover ? cover.size + ' codepoints' : 'unreadable');
      if (cover) {
        const said = new Set();
        for (const f of GD_LIST) {
          if (!f.endsWith('.gd') && !LINES_ALL.includes(f)) continue;
          for (const ch of fs.readFileSync(GDF(f), 'utf8')) {
            const o = ch.codePointAt(0);
            if ((o >= 0x3000 && o <= 0x30FF) || (o >= 0x4E00 && o <= 0x9FFF)) said.add(ch);
          }
        }
        const missing = [...said].filter((ch) => !cover.has(ch.codePointAt(0)));
        ok(said.size > 20, 'the town actually says something in Japanese', said.size + ' characters');
        ok(missing.length === 0,
          '…and the font can draw EVERY one of them  (⚠ a missing glyph is silent — rerun make_font.py)',
          missing.length ? 'MISSING: ' + missing.join('') : said.size + ' checked');
      }

      /* ══ 7 · REWARD AND DEFEAT ══ */
      ok(/func cost\(\) -> int:/.test(chal) && !/GameState\.body\.spend\(energy_cost\)/.test(chal),
        'a rematch with somebody whose square you hold is FREE — and sit-down reads the same price');
      ok(/not razzed\.has\(key\)/.test(gs) && /razzed\[key\] = 1/.test(gs),
        '…and they notice the loss ONCE, ever  ("you don\'t have to hear it twice")');
      ok(/slot == -3\b/.test(zone) && /_razz_of\(who\)/.test(zone),
        '…in their own words, asked of the person rather than stored in the room');
      ok(/for k in \(d\.get\("razzed", \{\}\) as Dictionary\)/.test(gs),
        '…and it is a UNION across devices, or the phone says it again');

      {

      /* ══ 8 · TWO MOUTHS AT ONCE ══ */
      /* his: "find a way to have the user's character dialogue in white, above the character, without overlapping dialogue. the goodbye quote can end the conversation, but the user can move as well with the response of the character remaining visible for the proper amount of time." */
      const sp = fs.readFileSync(GDF('speech.gd'), 'utf8');
      const tui = fs.readFileSync(GDF('town_ui.gd'), 'utf8');
      const inter = fs.readFileSync(GDF('interactable.gd'), 'utf8');
      ok(/var _bubbles: Array/.test(sp) && /func _find\(who: Node2D\) -> Bubble:/.test(sp),
        'Speech holds MORE THAN ONE bubble — you and them, on screen together');
      ok(/func _unstack\(/.test(sp) && /up\.position\.y = maxf\(_top\(k\), want\)/.test(sp),
        '…and an overlapping pair is resolved by pushing the HIGHER one UP',
        'down is where the head that said it is');
      ok(/func _height\(/.test(sp) && /get_multiline_string_size/.test(sp),
        '…off the MEASURED text, not a fixed rect — a one-liner must not reserve three lines');
      ok(/const YOU := Color\("ffffff"\)/.test(tui) && /_you_say\(said\)/.test(tui),
        'YOUR line is white and it goes up when you pick the row');
      ok(/func _pick\(id: String, said: String = ""\)/.test(tui)
        && /b\.set_meta\("said", said\)/.test(tui),
        '…carried on the row, so a menu label and a spoken line can differ');
      ok(/_pick\(str\(b\.get_meta\("id", ""\)\), str\(b\.get_meta\("said", ""\)\)\)/.test(tui),
        '…and the NUMBER KEYS say it too, not only the mouse');
      ok(/func close_saying\(/.test(tui) && !/func close_saying[\s\S]{0,400}_drop_bubble\(\)/.test(tui),
        'the goodbye closes the menu WITHOUT clearing the bubbles',
        '⚠ _drop_bubble() in here would wipe the answer he asked to keep');
      ok(/func end_talk_saying\(/.test(inter) && /u\.chose\.disconnect\(_on_chose\)/.test(inter),
        '…through the same exit, so the listener is still disconnected');
      ok(/end_talk_saying\(_bye\(\), /.test(npc) && /func _bye\(\) -> String:/.test(npc),
        '…and "I\'ll let you get on." is answered rather than swallowed');
      ok(/func box_top\(\) -> float:/.test(tui) && /func _box_top\(\) -> float:/.test(sp),
        'a bubble asks the BOX where its top edge is, so it can never land inside an open menu');
      ok(/if u != null and u\.has_method\("box_top"\)/.test(sp),
        '…duck-typed, because naming TownUI from Speech is a cyclic class reference',
        'a parse error a web export does NOT report');
      ok(/if sp == null or not sp\.speaking\(self\):/.test(npc),
        'the nameplate still yields — per speaker, not for anybody talking anywhere');
      ok(/sp\.anyone\(\)/.test(card),
        '…and the relationship card still stands down for a conversation');
      ok(/func speech_color\(\) -> Color:[\s\S]{0,120}ffffff/.test(player),
        'the player has a mouth of their own, and it is NOT the Forge aura',
        'a signed-in player can pick a color you cannot read');

      /* ══ 9 · A ROOM WITH EDGES, WALLS AND A WAY OUT ══ */
      /* his: "limit the space on the inside of the assembly so you can't endlessly walk" */
      const hall = fs.readFileSync(GDF('hall.gd'), 'utf8');
      const xit = fs.readFileSync(GDF('exit_door.gd'), 'utf8');
      ok(/world_bounds = ROOM\.grow\(-WALL_T\)/.test(hall),
        'the Assembly has an edge — you could walk off it into flat violet for eight seconds');
      ok(/static func draw_walls\(/.test(zone),
        'there is ONE wall, and both interiors draw it');
      ok(/TownZone\.draw_walls\(self, ROOM/.test(hall)
        && /TownZone\.draw_walls\(self, Rect2\(-W/.test(acad)
        && /TownZone\.draw_walls\(self, ROOM/.test(pit),
        '…the Assembly, the Academy and the pit head');
      ok(/^class_name TownExit$/m.test(xit) && /func _arch\(/.test(xit),
        'the way out is a DOORWAY, not a cottage with a pitched roof');
      ok(/var out := TownExit\.new\(\)/.test(hall) && /var out := TownExit\.new\(\)/.test(acad),
        '…in both interiors  (⛑ asked once, fixed everywhere)');
      ok(/func _init\(\) -> void:[\s\S]{0,120}radius = 78\.0/.test(xit),
        '…and its radius is set in _init, not _ready_extra',
        '⚠ Interactable builds its shape BEFORE _ready_extra runs');
      ok(!/of 16 \u2014 and %d of the %d/.test(hall) && !/_won_claimable/.test(hall),
        'the "1 of 16… to win today" line is off the bottom of the Assembly');
      ok(/func _riddle\(slot: int\) -> String:/.test(hall),
        '…and the lectern speaks in riddles now');
      const lect = hall.slice(hall.indexOf('class Lectern'));
      ok(!/holder_at/.test(lect),
        '…that name NOBODY  (⚠ it read out a to-do list of the cast until today)',
        'the blank nameplates are the point');
      ok(/GameState\.board\.square_name\(slot\)/.test(lect) && /GameState\.board\.key_at\(slot\)/.test(lect),
        '…but are still read off the board, so a riddle still points somewhere');

      /* ══ 10 · THE LIGHT OUTSIDE LINES UP WITH THE PIECE INSIDE ══ */
      /* his: "let's line up the light on the outside to the piece you unlocked." */
      ok(/static func board_cell\(slot: int\) -> Vector2i:/.test(gs),
        'ONE function turns a slot into a cell on the board');
      /* ⚠ THE HALL REACHES IT ONE HOP FURTHER AWAY SINCE 09-05. */
      ok(/var c := board_cell\(slot\)/.test(gs) && /GameState\.board\.board_cell\(slot\)/.test(door)
        && /GameState\.board\.home_cell\(slot\)/.test(hall),
        '…and the Assembly AND the building\'s face both read it');
      ok(!/func _col\(/.test(hall) && !/window_cols/.test(door),
        '…neither keeps a private copy  (⚠ the private copy is what got them mirrored)');
      ok(/@export var camera_bounds: Rect2/.test(zone) && /player\.view = camera_bounds/.test(zone),
        'what you can SEE and what you can STAND ON are two rects now');
      ok(/var lim: Rect2 = view if view\.size\.x > 0\.0/.test(player),
        '…and the camera takes its limits from the first one');
      ok(/@export var camera_offset: Vector2/.test(zone) && /cam\.position = cam_offset/.test(player),
        '…and a room whose subject is on the back wall can aim the camera up at it');

      /* ══ 11 · THREE PUZZLES, AND A KEY TO TEST THEM WITH ══ */
      const dev = fs.readFileSync(GDF('dev_referee.gd'), 'utf8');
      ok(/func puzzle_report\(clean: bool/.test(gs),
        'ONE path settles a puzzle, won or lost');
      ok(/puzzle_report\(int\(rec\.get\("c", 0\)\) == 1/.test(gs),
        '…the live poll comes down it');
      ok(/GameState\.challenge\.puzzle_report\(clean, Time\.get_unix_time_from_system\(\)\)/.test(dev),
        '…and so do the Y/N test keys  (⚠ a test key with its own copy of the rule tests itself)');
      ok(/GameState\.challenge\.puzzle_running\(\) and \(k\.keycode == KEY_Y or k\.keycode == KEY_N\)/.test(dev),
        '…gated on a run being open, so Y does not settle a puzzle nobody set');
      ok(/puzzle %d of %d/.test(dev),
        '…and the bar says which one you are on');
      ok(/for i in GameState\.challenge\.PUZZLE_RUN:/.test(town2) && /puzzle_streak\(\)/.test(town2),
        'the Champ WEARS the run — three pips, filled as you go');
      ok(/GameState\.challenge\.puzzle_run\.connect\([\s\S]{0,90}queue_redraw\(\)\)/.test(town2),
        '…and redraws on it, or the count updates when you happen to walk past');

      /* ══ 12 · THE PLACE NAME IS AN ARRIVAL ══ */
      /* his: "the text saying Sand Mines gets in the way of the dialogue — that text shouldn't be permanently visible." */
      /* ⚠ THE `:=` IS THE ANCHOR. */
      ok(/const NAME_SECONDS :=/.test(town2) && /_place_left -= delta/.test(town2),
        'the place name arrives and goes');
      ok(/if sp != null and sp\.anyone\(\):[\s\S]{0,60}_place_left = 0\.0/.test(town2),
        '…and goes INSTANTLY when anybody speaks',
        '⚠ the timer alone is not a guarantee — you can talk within two seconds of arriving');
      ok(/if f == null or _place < 0 or _place_left <= 0\.0:/.test(town2),
        '…and draws nothing at all the rest of the time');
      const townProc = (() => { const m = /^func _process\(/m.exec(town2);
        return m ? fnGd(town2.slice(m.index), '_process') : ''; })();
      ok(/_namer\.queue_redraw\(\)/.test(townProc) && !/^\tqueue_redraw\(\)/m.test(townProc)
        && /move_child\(_namer, 0\)/.test(town2) && !/^\t_draw_place_names\(/m.test(fnGd(town2, '_draw')),
        '…and the fade repaints the NAME, never the town  (first child, so it still sits under everything)',
        '⛑ a town redraw is the whole window, every frame for 2.6 s (2026-10-01)');

      /* ══ 13 · THE ARCADE CAME OFF THE MAP (2026-10-03, his: "Let's put Campaign in one of them -
         take the arcade completely away. Make the sky run be the portal game for the near-the-Sea
         chessboard"). Two of its games went behind rings; arcade.gd is PARKED. Driven by a probe. ══ */
      const bareGd = (src) => src.replace(/\r\n/g, '\n').split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
      ok(!/arcade\.tscn/.test(town2) && !/ArcadeFront|ARCADE_AT|_furnish_arcade/.test(bareGd(town2)),
        'nothing on the map opens the Arcade, and its front and its lot went with it');
      ok(fs.existsSync(GDF('arcade.tscn')) && /PARKED, NOT DELETED/.test(arc),
        '…and the room is PARKED, not deleted — and its own first line says so');
      ok(!/Arcade\.CABS/.test(bareGd(fs.readFileSync(GDF('paper.gd'), 'utf8')) + bareGd(town2)),
        '…and nothing on the map still reads its machine list');
      const REG = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-games-data.js'), 'utf8');
      const live = new Set([...REG.matchAll(/^\s*\{ slug:'([a-z-]+)'(?![^\n]*cat:'terminated')/gm)]
        .map((m) => m[1]));
      const ringGames = [...rings.matchAll(/^\t"([a-z-]+)": \{ "name": /gm)].map((m) => m[1]);
      ok(ringGames.length >= 2 && ringGames.every((g) => live.has(g)),
        '⭐ every game behind a ring is a game the site still has', ringGames.join(' '));
      ok(/func slot_for_game\(game: String\) -> int:/.test(gs)
        && /func unlock_need\(slot: int\) -> int:/.test(gs),
        'a room can ask the ROSTER which square a score buys, and for how much');
      /* ⭐ 2026-09-30, his: "Make a very basic portal in each chess board - there's one in my home,
         there's one in sand mines. It just goes to a basic chessboard ... Character just spins a
         couple times and goes into the portal". Driven end to end by a probe: both trips out and
         back, two turns each, his feet on the ring with an arrow key held down. */
      {
        const rdc = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n')
          .split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const has = (f) => fs.existsSync(GDF(f));
        const por = has('portal.gd') ? rdc('portal.gd') : '';
        const cb = has('chessboard.gd') ? rdc('chessboard.gd') : '';
        const tw = rdc('town.gd'), hm = rdc('home.gd'), pl = rdc('player.gd');
        const hbx = hm.slice(hm.indexOf('class HomeBoard extends Interactable:'));
        ok(/class_name TownPortal\s*\nextends TownDoor/.test(por) && !/const BOARD :=/.test(por),
          '⭐ a portal is a door underneath, and no ring opens the dream\'s board any more');
        ok(/walk_in = false/.test(fnGd(por, '_init')),
          '…pressed, never walked into  (⚠ the camp\'s board is on the path through the camp)');
        /* ⭐ EACH RING ITS OWN GAME (2026-10-03, his: "for the chessboards themselves, each three should
           have a different mini-game theme"). Driven by a probe: 24 checks on the two site rings. */
        ok(/_draw_board\(CAMP_BOARD,/.test(tw) && /portal\.game = "marchland"\s*\n\s*portal\.position = CAMP_BOARD/.test(tw),
          '…the camp\'s ring opens CAMPAIGN, off the same number the board is drawn at  (his: "Let\'s put Campaign in one of them")');
        ok(/_draw_board\(SEA_BOARD,/.test(tw) && /portal\.game = "sky-run"\s*\n\s*portal\.position = SEA_BOARD/.test(tw),
          '…the dock\'s ring opens SKY RUN  (his: "Make the sky run be the portal game for the near-the-Sea chessboard")');
        ok(/_portal = TownPortal\.new\(\)/.test(hbx) && /_portal\.monitoring = false/.test(hbx)
          && /_portal\.game = "dungeon"/.test(hbx)
          && (hbx.match(/"id": "portal"/g) || []).length === 2 && /if id == "portal":/.test(fnGd(hbx, '_on_chose')),
          '…and the ring at home opens PRINCESS DUNGEON, from its menu with or without Princess  (his: "Princess Dungeon and Pawn Crossing sounds awesome. Let\'s do both.")');
        ok(/url = str\(GAMES\[game\]\["url"\]\) \+ "\?town=1"/.test(fnGd(por, '_ready_extra'))
          && /if game != "":\s*\n\s*super\.interact\(you\)\s*\n\s*if return_at\.is_finite\(\):\s*\n\s*you\.global_position = return_at\s*\n\s*you\.rise\(\)/.test(fnGd(por, '_enter'))
          && fnGd(por, '_enter').indexOf('await you.swallowed') < fnGd(por, '_enter').indexOf('super.interact(you)'),
          '⭐ a site game opens in a tab at the BOTTOM of the spin, carrying ?town=1, and he climbs back out of the ring',
          '⚠ there is no scene to change: without rise() he is left shrunk to nothing on the board');
        ok(/_climb\(delta\)/.test(fnGd(pl, '_process')) && /if _rising >= SINK_SECS:\s*\n\s*_rising = -1\.0\s*\n\s*_warp = -1\.0/.test(fnGd(pl, '_climb'))
          && !/_warp = -1/.test(fnGd(pl, 'rise')),
          '…and no key moves him until he is whole  (_warp clears at the top of the climb, never the bottom)');
        ok(/back\.scene_path = GameState\.portal_from if GameState\.portal_from != "" else "res:\/\/rooms\/home\.tscn"/.test(cb)
          && /var into_world := GameState\.worlds\.is_world\(scene_path\)/.test(por)
          && /if into_world and here != null:\s*\n\s*GameState\.portal_from/.test(por),
          '…and the board\'s own portal goes back where you came in, home if nothing says');
        ok(/TownFade\.landing\(self\)/.test(fnGd(cb, '_after_ready')) && /TownFade\.landing\(self\)/.test(fnGd(hm, '_after_ready')),
          '…and both rooms it lands in fade up out of the black it left in');
        ok(/const SPIN_TURNS := 2\.0/.test(pl) && /if _warp >= 0\.0 or aloft\(\):\s*\n\s*velocity = Vector2\.ZERO\s*\n\s*return/.test(fnGd(pl, '_physics_process')),
          '…he spins twice going in, and no key moves him while he does');
      }
      /* ══ CHESS ZOMBIES (2026-10-01, his: "pieces come in from the opposite side of the board and
         attack slowly in their patterns, and my gun upgrades over time"). Driven by a probe: 32
         checks, 7 mutations. Soaked: standing still dies in 56-104s, a reacting player 166-495s. */
      {
        const cb = fs.readFileSync(GDF('chessboard.gd'), 'utf8').replace(/\r\n/g, '\n')
          .split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        ok(/var sq := Vector2i\(f, 0\)/.test(fnGd(cb, '_spawn')) && /z\.at = open\[/.test(fnGd(cb, '_spawn')),
          '⭐ chess zombies rise on the FAR rank  (his: "from the opposite side of the board")');
        const pawn = (/"p":\n([\s\S]*?)\n\t\t"n", "k":/.exec(fnGd(cb, 'moves')) || ['', ''])[1];
        ok(/var take := from \+ Vector2i\(dx, 1\)\s*\n\s*if \(take == you or men\.has\(take\)\) and not taken\.has\(take\):\s*\n\s*out\.append\(\[take\]\)/.test(pawn)
          && /not taken\.has\(ahead\) and not men\.has\(ahead\) and ahead != you/.test(pawn) && !/Vector2i\([^)]*, -1\)/.test(pawn),
          '⭐ a pawn takes on the diagonal (him or one of his), never straight ahead, and never walks back');
        ok(/z\.code != "n" or u > 0\.8/.test(fnGd(cb, '_step')) && /center\(z\.dest\(\)\) if z\.code == "n" else _pos\(z\)/.test(fnGd(cb, '_step')),
          '…a knight jumps: only its landing square hits, and only as it lands');
        ok(/if _over or player\.warping\(\) or TownZone\.covered\(get_tree\(\)\) or _ui\.is_talking\(\):\s*\n\s*return/.test(fnGd(cb, '_process')),
          '⛑ the journal, a menu and the portal spin all stop the pieces  (or you die reading)');
        const guns = [];
        const gre = /"every": ([\d.]+), "dmg": ([\d.]+), "shots": (\d+), "fan": [\d.]+,\s+"pierce": (\d+)/g;
        for (let m; (m = gre.exec((/const GUN := \[[\s\S]*?\n\]/.exec(cb) || [''])[0]));) guns.push({ dps: +m[3] * +m[2] / +m[1], pierce: +m[4] });
        ok(guns.length >= 5 && guns.every((g, i) => i === 0 || (g.dps >= guns[i - 1].dps && g.pierce >= guns[i - 1].pierce))
          && /int\(_t \/ UPGRADE_SECS\)/.test(fnGd(cb, '_process')),
          '⭐ the gun upgrades on the clock, and no level is a downgrade  (damage per second and pierce only climb)',
          guns.map((g) => g.dps.toFixed(1)).join(' '));
        ok(!/func (legal|is_attacked|in_check|gen_moves)/.test(cb) && !/castl|en.?passant|checkmate|stalemate/i.test(cb),
          '⛑ enemy movement, not a referee: no check, no castling, no result  (real chess stays on the site)');
      }
      /* ══ THE DREAM AND THE NIGHTMARE (2026-10-01, his: "Murphy's down there trashing me about wanting
         to go to chess city - there's a dream option and a nightmare option ... the user can choose
         either one. Think Happy Gilmore and his happy place for the dream option"). Driven by probes
         at four window shapes: 80 checks, 15 mutations. Standing still, sixteen come home in 60-76s. */
      {
        const rdc = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n')
          .split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const has = (f) => fs.existsSync(GDF(f));
        const cb = rdc('chessboard.gd'), por = rdc('portal.gd'), g = rdc('game_state.gd'), hm = rdc('home.gd');
        const dr = has('dream.gd') ? rdc('dream.gd') : '';
        const hbx = hm.slice(hm.indexOf('class HomeBoard extends Interactable:'));
        const first = (/\{ "id": "first",[\s\S]*?\}/.exec(g) || [''])[0];
        ok(/"scene": "res:\/\/games\/chessboard\.tscn"/.test(first) && /"dream": "res:\/\/games\/dream\.tscn"/.test(first)
          && has('dream.tscn') && /path="res:\/\/games\/dream\.gd"/.test(fs.readFileSync(GDF('dream.tscn'), 'utf8'))
          && /class_name DreamBoard\s*\nextends PortalBoard/.test(dr),
          '⭐ the first board has two sides: the nightmare, and a dream built on the same board');
        ok(/str\(row\.get\("dream", ""\)\) == path/.test(fnGd(g, 'is_world')),
          '…and the dream counts as a board world, so its ring knows the way back');
        /* ⭐ THE BED ASKS NOW (2026-10-03, his: "Let's make the dream/nightmare thing only for when you
           go to bed, eventually making it so there's only a percentage [that a] dream or nightmare shows
           up at all"). Driven by a probe: 28 checks, the dial run at 1.0 and 0.3, 17 mutations. */
        const bd = rdc('bed.gd'), tw = rdc('town.gd');
        ok(/open_talk\("The bed", ASK, \[/.test(fnGd(bd, 'interact')) && /const ASK := "Which way down\?"/.test(bd)
          && ['dream', 'nightmare', 'stay'].every((id) => fnGd(bd, 'interact').includes('"id": "' + id + '"'))
          && /GameState\.worlds\.pack_dream\("first"\) if id == "dream" else GameState\.worlds\.pack_scene\("first"\)/.test(fnGd(bd, '_on_chose')),
          '⭐ the bed asks which way down: the dream, the nightmare, or not now  (his: "the user can choose either one")');
        /* ⛑ 2026-10-03, his: "we shouldn't count days in the game and instead just use the real time the
           user is in". His "Day %d." had no day left to say; you wake to the time. */
        /* ⛑ 2026-10-15, his: "Take out Go to Bed, Dick quote." */
        ok(/prompt_text = "Sleep"/.test(bd) && !/dick/i.test(bd) && /say\("%s\." % TownClock\.time_text\(\)\)/.test(fnGd(bd, '_morning')),
          '…the bed\'s old line is out, and you wake to the real time');
        ok(!/sleep\(\)|GameState\.day\b/.test(bd) && !/func sleep\(/.test(g)
          && /if id != "dream" and id != "nightmare":\s*\n\s*return/.test(fnGd(bd, '_on_chose')),
          '⚠ going to bed turns no day over, and "Not now." leaves it  (a phone has no Escape)');
        const dial = +((/const DREAM_CHANCE := ([\d.]+)/.exec(bd) || [])[1]);
        ok(dial > 0 && dial <= 1 && /if not TownBed\.dreams\(TownBed\.tonight\(\)\):\s*\n\s*say\(/.test(fnGd(bd, 'interact'))
          && /absi\(hash\("dream:%d" % night\)\) % 100 < int\(round\(DREAM_CHANCE \* 100\.0\)\)/.test(fnGd(bd, 'dreams'))
          && !/rand/.test(fnGd(bd, 'dreams')),
          '⭐ HIS DIAL: the share of nights that offer one at all, salted on the night  (a randf roll is re-rolled by reloading)',
          'DREAM_CHANCE ' + dial);
        ok(/Time\.get_datetime_dict_from_system\(false\)/.test(fnGd(bd, 'tonight')) && /n - 1 if int\(d\["hour"\]\) < 12 else n/.test(fnGd(bd, 'tonight'))
          && !/TownClock/.test(fnGd(bd, 'tonight')),
          '…the night is the DEVICE\'s, by the date of its evening  (a moved time zone must not re-roll it)');
        ok(/GameState\.portal_from = here\.scene_file_path/.test(fnGd(bd, '_on_chose'))
          && /GameState\.reentry\[here\.scene_file_path\] = global_position \+ WAKE_AT/.test(fnGd(bd, '_on_chose'))
          && /_waking = true/.test(fnGd(bd, '_on_chose')) && /if _waking:\s*\n\s*_waking = false/.test(fnGd(bd, '_ready_extra')),
          '…and "Wake up" lands you beside the bed, where it says the time  (once)');
        ok(!/pack_dream|chessboard\.tscn|dream\.tscn/.test(tw + hm + por) && !/"dream"|"nightmare"/.test(hbx),
          '⛑ no ring and no table opens the dream or the nightmare any more — only the bed');
        ok(dr !== '' && !/take_hit|_bite\(|_fire\(|Heckler|_heckle\(/.test(dr)
          && /func _caught\(z: PortalBoard\.Zombie\) -> void:\s*\n\s*_join\(z\)/.test(dr)
          && !/super\(/.test(fnGd(dr, '_after_ready')) && !/super\(/.test(fnGd(dr, '_process')),
          '⛑ nothing in the dream can hurt you: no gun, no bite, no Murphy — a piece that reaches you joins you');
        const set = (/const SET := "([a-z]+)"/.exec(dr) || [])[1] || '';
        const cnt = (c) => set.split(c).length - 1;
        ok(set.length === 16 && +((/const FULL := (\d+)/.exec(dr) || [])[1]) === 16 && cnt('p') === 8 && cnt('n') === 2
          && cnt('b') === 2 && cnt('r') === 2 && cnt('q') === 1 && cnt('k') === 1,
          '⭐ the dream deals one side of a chessboard, and sixteen is full', set);
        const reach = +((/const REACH := ([\d.]+)/.exec(dr) || [])[1]);
        ok(reach > 1 && reach < 1.41 && /distance_to\(player\.global_position\) < CELL \* REACH/.test(fnGd(dr, '_meet')),
          '⛑ a piece on the next square falls in  (a pawn straight ahead and an off-color bishop can never LAND on you: the deal stalled at 14)',
          'REACH ' + reach + ' squares: the four beside you, not the diagonals');
        const granted = (/const GRANTED := "([^"]+)"/.exec(dr) || [])[1] || '';
        ok(granted !== '' && fs.readFileSync(path.join(ROOT, '_locations/chess-city.md'), 'utf8').includes(granted),
          '⭐ the gate\'s line is HIS, verbatim off the Chess City page', granted);
        ok(dr !== '' && !/\.who = |open_talk\(|\.say\(|show_over\(/.test(dr),
          '⚠ nobody speaks in the dream and no person is in it  (what is in his happy place is his)');
        const over = (words('Murphy').nightmare_over || [])[0] || '';
        ok(over !== '' && fs.readFileSync(path.join(ROOT, '_characters/murphy.md'), 'utf8').includes(over)
          && /_heckle\("over", true\)/.test(fnGd(cb, '_on_hit')),
          '⭐ the last word in the nightmare is Murphy\'s own catchphrase, and it is never held back', over);
        ok(!/show_over\(/.test(cb) && /words\.size\.x = room\.size\.x\s*\n\s*words\.text = line\s*\n\s*words\.size\.y = 0\.0/.test(cb),
          '⛑ his line is a Label of his own, measured width-first  (a Speech bubble is 380 wide and screen-clamped: it landed on the board)');
        ok(/if _lit:\s*\n\s*set_highlight\(false\)/.test(fnGd(rdc('interactable.gd'), '_on_body_exited')),
          '⛑ only the LIT interactable puts the prompt down when you leave it  (Princess trotting off blanked the table\'s)');
      }
      /* ══ THE NIGHTMARE OPENS AS A STANDARD GAME (2026-10-02, his: "the nightmare starts off as
         starting moves in a standard game but your pieces don't move and you just slowly get
         attacked"). Driven by a probe (20 checks) and in Chrome (10). Soaked: standing still dies in
         35-53s, a reacting player 129-457s. ══ */
      {
        const rdc = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n')
          .split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const cb = rdc('chessboard.gd'), hl = rdc('hall.gd'), pm = rdc('player_model.gd'), pl = rdc('player.gd');
        const C = require('../assets/js/pjcc-chess.js');
        const name = (c, r) => 'hgfedcba'[c] + (r + 1);             /* column 0 is the h-file, row 0 their back rank */
        const book = ((/const BOOK := \[([\s\S]*?)\n\]/.exec(cb) || ['', ''])[1]).split('\n').filter((l) => /Vector2i/.test(l))
          .map((l) => [...l.matchAll(/Vector2i\((\d), (\d)\), Vector2i\((\d), (\d)\)/g)].map((m) => [name(+m[1], +m[2]), name(+m[3], +m[4])]));
        let S = C.parseFEN(C.START_FEN);
        const san = [];
        let legal = book.length === 10;
        for (const row of book) {
          const m = C.findMove(S, C.sqFromName(row[0][0]), C.sqFromName(row[0][1]));
          if (!m) { legal = false; san.push('ILLEGAL ' + row[0].join('-')); break; }
          san.push(C.toSAN(S, m));
          S = C.makeMove(S, m);
          if (row.length === 2 && !(S.b[C.sqFromName(row[1][1])] === 'R' && S.b[C.sqFromName(row[1][0])] === '')) legal = false;
          S.turn = 'w';                                               /* his side never answers */
          S.ep = -1;
        }
        ok(legal, '⭐ it opens with ten real moves: every one legal for White on the site\'s referee while Black stands still',
          san.join(' '));
        const back = (/const BACK := "([a-z]{8})"/.exec(cb) || [])[1] || '';
        const theirs = ((/const THEIR_BACK := \[([^\]]*)\]/.exec(hl) || ['', ''])[1].match(/[a-z]/g) || []);
        ok(back.length === 8 && theirs.length === 8 && back.split('').every((p, c) => p === theirs[7 - c])
          && /const KING_AT := Vector2i\(3, 7\)/.test(cb) && back[3] === 'k',
          '…on a board laid out the Assembly\'s way round  (column 0 is the h-file), and he stands on his own king\'s square', back);
        const outside = cb.replace(fnGd(cb, '_set_up'), '');
        ok(!/_men\[[^\]]+\] = /.test(outside) && /_men\.erase\(sq\)/.test(fnGd(cb, '_take')),
          '⭐ his pieces never move: they are set up, and after that only ever taken');
        ok(/if _book >= 0:\s*\n\s*_open\(delta\)\s*\n\s*else:[\s\S]*?_t \+= delta/.test(fnGd(cb, '_process')),
          '…while they play, the run\'s clock waits  (every dial was soaked on that clock)');
        ok(/z\.phase != RISE and not z\.asleep/.test(fnGd(cb, '_fire')) && /z\.asleep or hit\.has\(z\)/.test(fnGd(cb, '_fly'))
          && /if not z\.asleep and \(z\.phase == REST/.test(fnGd(cb, '_bite')) && /if not z\.asleep and z\.t >= z\.wait:/.test(fnGd(cb, '_step')),
          '…a piece still asleep is not in play: not shot, no bite, no move of its own');
        ok(/var z := _sleeper\(code\)\s*\n\s*if z != null:/.test(fnGd(cb, '_spawn')),
          '⭐ the arrivals wake what is standing there before anything rises  (so the soaked pace did not move)');
        ok(/_clip_hit = _match_clip\(\[/.test(pm) && /_clip_down = _match_clip\(\[/.test(pm)
          && /_model\.fall\(\)/.test(fnGd(pl, 'take_hit')) && /_model\.flinch\(\)/.test(fnGd(pl, 'take_hit'))
          && /_model\.stand\(\)/.test(fnGd(pl, 'heal_full')),
          '⭐ his clips have slots waiting: a hit, and going down on the last heart  (an action named for one plays, no code)');
      }
      /* ══ THE REAL DAY AND A MOVABLE CLOCK (2026-10-03, his: "we shouldn't count days in the game and
         instead just use the real time the user is in ... We can add a change time zone function as well,
         since some things will only be open during the day"). Driven by a probe: 17 checks. ══ */
      {
        const rdc = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n')
          .split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const g = rdc('game_state.gd'), clk = rdc('clock.gd'), zn = rdc('zone.gd'), jr = rdc('journal.gd'), pap = rdc('paper.gd');
        const readers = ['bed.gd', 'dog.gd', 'npc.gd', 'zone.gd', 'journal.gd', 'paper.gd', 'town.gd', 'home.gd', 'door.gd']
          .map(rdc).join('\n');
        ok(!/^var day\b/m.test(g) && !/\bday \+= 1/.test(g) && !/func sleep\(/.test(g) && !/GameState\.day\b/.test(readers),
          '⭐ there is no day counter: nothing adds to one and nothing reads one');
        ok(/var d := today\(\)\s*\n\s*if body\.energy_on >= d:\s*\n\s*return/.test(fnGd(g, '_new_day'))
          && /body\.energy = body\.energy_cap/.test(fnGd(g, '_new_day'))
          && /_new_day\(\)/.test(fnGd(g, 'morning')) && /_new_day\(\)/.test(fnGd(g, '_tick')),
          '⭐ the bar fills when the real calendar turns — asked on every room and every 2s tick, so midnight lands while you stand still',
          '⚠ >=, not !=: a device clock set back a day must not fill it twice');
        ok(/return Time\.get_date_string_from_system\(false\)/.test(fnGd(g, 'today'))
          && /Time\.get_date_dict_from_system\(false\)/.test(fnGd(g, 'day_no'))
          && !/TownClock/.test(fnGd(g, 'today') + fnGd(g, 'day_no') + fnGd(g, '_new_day')),
          '⚠⚠ the calendar that pays is the DEVICE\'s: a moved time zone cannot buy a second morning, rent or exchange cap');
        ok(/== GameState\.day_no\(\)/.test(fnGd(g, 'beaten_today')) && /= GameState\.day_no\(\)/.test(fnGd(g, 'retire_for_today')),
          '…and the once-a-day stamp is the real day  (still a number, still MAX-merged)');
        const save = fnGd(g, 'save_state');
        const pushed = g.slice(g.indexOf('var payload := JSON.stringify({'), g.indexOf('JavaScriptBridge.eval', g.indexOf('func push_to_site')));
        ok(/"clock_shift": clock_shift/.test(save) && /"energy_on": body\.energy_on/.test(save) && !/"day":/.test(save)
          && !/clock_shift|energy_on|"day":/.test(pushed),
          '⚠ the time zone is a DEVICE preference like the mute: saved, never pushed — and no day goes anywhere');
        ok(!/local\.day\s*=/.test(fn(PROF, 'townMerge')), '…and the site merges no day either');
        ok(/static var shift_hours: int = 0/.test(clk) && /shift_hours \* 3600/.test(fnGd(clk, '_now'))
          && /_now\(\)/.test(fnGd(clk, 'weekday')) && !/GameState/.test(clk),
          '⭐ the clock reads a shift in hours, and everything that lights or opens reads the clock  (which still sees no GameState)');
        ok(/TownClock\.shift_hours = clock_shift/.test(fnGd(g, 'set_clock_shift'))
          && /TownClock\.shift_hours = clock_shift/.test(fnGd(g, 'load_state')) && /wrapi\(h, -12, 13\)/.test(fnGd(g, 'set_clock_shift')),
          '…set from the save, up to twelve hours either way');
        ok(/_move_clock\(GameState\.clock_shift - 1\)/.test(jr) && /_move_clock\(GameState\.clock_shift \+ 1\)/.test(jr)
          && /_move_clock\(0\)/.test(jr) && /\["_retime", "_tick_clock"\]/.test(fnGd(jr, '_move_clock'))
          && /var town: bool = _tab == TOWN_TAB/.test(fnGd(jr, '_layout')) && /- bar\)/.test(fnGd(jr, '_layout')),
          '⭐ the journal\'s town tab moves the time zone an hour at a time, the sky turns at once, and the rows shrink to fit over the buttons');
        ok(/"a": "Time zone", "b": TownClock\.shift_text\(\)/.test(jr) && !/"a": "Day"/.test(jr),
          '…and says which time zone you are in, where the day count used to be');
        ok(!/Day %d|GameState\.day/.test(fnGd(zn, '_paint_hud') + fnGd(zn, '_greet')) && !/Day %d/.test(pap),
          '…and the HUD, the greeting and the paper count no days');
      }
      /* ══ PAWN CROSSING (2026-10-03, his pick of ten: "Princess Dungeon and Pawn Crossing sounds awesome.
         Let's do both."). Frogger on a chessboard. 2026-10-04, his "yes great do one, two, and three":
         SET THE BOARD, REAL MOVES, YOUR HAND. 2026-10-05, his "do numbers 4, 5, 6, 7, and 8": SCORE BY THE
         PIECE, NIGHT CROSSING, TACTIC CROSSINGS, BLACK PAWNS, ESCORT. Driven by a probe: 109 rules checks,
         a dash-and-slide run at 12, 30 and 60 fps, every piece soaked alone, the whole game soaked with a
         careful, a reckless, a dropping and a still bot, at noon and at rush hour. ══ */
      {
        const rdc = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n')
          .split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const has = (f) => fs.existsSync(GDF(f));
        const cr = has('crossing.gd') ? rdc('crossing.gd') : '';
        const tw = rdc('town.gd'), g = rdc('game_state.gd'), por = rdc('portal.gd');
        ok(/"id": "crossing", "name": "Pawn Crossing", "scene": "res:\/\/games\/crossing\.tscn", "free": true/.test(g)
          && has('crossing.tscn') && /path="res:\/\/games\/crossing\.gd"/.test(fs.readFileSync(GDF('crossing.tscn'), 'utf8'))
          && /class_name PawnCrossing\s*\nextends TownZone/.test(cr),
          '⭐ Pawn Crossing is a board world of its own, and free');
        ok(/portal\.pack = "crossing"\s*\n\s*portal\.scene_path = GameState\.worlds\.pack_scene\("crossing"\)\s*\n\s*portal\.position = SQUARE_BOARD/.test(tw)
          && /_draw_board\(SQUARE_BOARD,/.test(tw),
          '…behind a ring on a board in the square, on the Arcade\'s old lot, off the one number the board is drawn at');
        ok(/"Step into the portal  ·  %s" % GameState\.worlds\.pack_name\(pack\)/.test(fnGd(por, '_ready_extra')),
          '…and the ring says which game it opens');
        /* ⚠ 2026-10-10: "Castle" is now an ability's NAME, and a castle in one of their openings is two rows
           of a table. What stays out is the RULE: nothing here decides whether anybody may castle. */
        ok(!/func (is_attacked|in_check|gen_moves)/.test(cr) && !/checkmate|stalemate|castling_rights|can_castle|KQkq/i.test(cr)
          && !/func \w*castl\w*\(/i.test(cr),
          '⛑ piece geometry, not a referee: no check, no castling RULE, no result  (taking in passing is geometry, his 10-05 pick)');
        const legalP = (/"p":\n([\s\S]*?)\n\t\t"n", "k":/.exec(fnGd(cr, 'legal')) || ['', ''])[1];
        ok(/_at \+ Vector2i\(0, -1\)/.test(legalP) && /_at\.y == START_ROW and _open\(b\)/.test(legalP)
          && /if PortalBoard\.on_board\(t\) and \(foe_on\(t\) != null or \(_open\(t\) and _passer\(t\) != null\)\):/.test(legalP),
          '⭐ a pawn steps one, or two from its own rank, and takes only on the diagonal');
        ok((fnGd(cr, 'moves_of').match(/t\.y <= FOE_ROWS/g) || []).length === 2 && /const FOE_ROWS := 5/.test(cr)
          && /_rng\.randi_range\(0, FOE_ROWS\)/.test(fnGd(cr, '_free_square')),
          '⭐ no piece lands on the two ranks you start from: the start is safe, and the clock is the pressure');
        ok(/if f\.phase != MOVE and q == p:\s*\n\s*continue\s*\n\s*if _nearest\(was, feet, q, p\) < CELL \* 0\.42:/.test(fnGd(cr, '_bite'))
          && !/_grace/.test(cr) && /\(player as Crosser\)\.steady\(\)/.test(fnGd(cr, '_hurt')),
          '⛑ only a sliding piece bites, and there is no grace after a hit  (a knight crossed under it untouched, measured)');
        ok(/_feet_was = feet/.test(fnGd(cr, '_bite')) && /f\.seen = p/.test(fnGd(cr, '_bite'))
          && /clampf\(-d0\.dot\(v\) \/ vv, 0\.0, 1\.0\)/.test(fnGd(cr, '_nearest'))
          && /_feet_was = Vector2\.INF/.test(fnGd(cr, '_to_start')),
          '⛑ …and the bite is SWEPT between frames, not sampled at them',
          'the same dash-and-slide crossings: at 30 fps a sampled bite caught 2 of 12 and a swept one 6; at 12 fps, 0 and 8');
        ok(/if _hop >= 0\.0 or not live\(\) or not legal\(\)\.has\(sq\):/.test(fnGd(cr, 'go'))
          && /_seating <= 0\.0/.test(fnGd(cr, 'live')),
          '⛑ no step while a piece sits down  (a queen stepping along the far rank counted a crossing a step, measured)');
        ok(/if owed\(\):\s*\n\s*if not _ui\.is_talking\(\)/.test(fnGd(cr, '_process')),
          '⚠ the game-over menu, closed with Escape, comes back');
        const crossFn = fnGd(cr, '_cross');
        ok(/const HOME := "rnbqkbnr"/.test(cr) && /_seats\[_at\.x\] = true/.test(crossFn)
          && /_piece = HOME\[_at\.x\]/.test(crossFn) && !/PROMOTE/.test(cr),
          '⭐ SET THE BOARD: land on an open seat of r n b q k b n r, its piece sits down there, and you move like it next — no menu');
        ok(/bool\(_seats\[sq\.x\]\)/.test(fnGd(cr, 'mine')) && /_walls\.has\(sq\)/.test(fnGd(cr, 'mine'))
          && /if mine\(sq\)/.test(fnGd(cr, '_claimed')),
          '…a seat that is sat in, and a piece you dropped, are closed to you AND to them');
        ok(/if not _seats\.has\(false\):\s*\n\s*_sets \+= 1\s*\n\s*_seats\.fill\(false\)\s*\n\s*_piece = "p"/.test(fnGd(cr, '_next')),
          '…and a full rank is a set: it clears, and you are a pawn again');
        ok(/\(int\(c\) \+ BACK_ROW\) % 2 == x % 2/.test(fnGd(cr, '_start_for'))
          && /_start_col = _start_for\(_piece\)/.test(fnGd(cr, '_next')),
          '⛑ a bishop starts on the color of an open seat  (it never changes color: started wrong, it could never cross)');
        ok(/while PortalBoard\.on_board\(t\) and not mine\(t\):\s*\n\s*out\.append\(t\)\s*\n\s*if foe_on\(t\) != null or t == _stranded\(\):\s*\n\s*break/.test(fnGd(cr, 'legal'))
          && /HOP_SECS \+ DASH_SECS \* float\(maxi\(absi\(d\.x\), absi\(d\.y\)\) - 1\)/.test(fnGd(cr, 'hop_time'))
          && /var d := sq - _at/.test(fnGd(cr, 'go')) && /_hop_len = hop_time\(d\)/.test(fnGd(cr, 'go')),
          '⭐ REAL MOVES: a rook, bishop or queen takes the whole line, onto the first of theirs, and a long move takes longer');
        ok(/_take\(_prey\)/.test(fnGd(cr, '_hop_step')) && /_foes\.append\(_prey\)/.test(fnGd(cr, '_hurt')),
          '…a piece is taken on landing, so a dash bitten on the way takes nothing');
        ok(/const HAND_MAX := 3/.test(cr) && /if _hand\.size\(\) >= HAND_MAX:/.test(fnGd(cr, '_take'))
          && /_hand\.append\(f\.code\)/.test(fnGd(cr, '_take')),
          '⭐ YOUR HAND: a piece you take is kept to drop, three at most');
        ok(/sq\.y < 1 or sq\.y > FOE_ROWS/.test(fnGd(cr, 'can_drop')) && /f\.phase == MOVE and f\.path\.has\(sq\)/.test(fnGd(cr, 'can_drop')),
          '…dropped in the lanes only, and never into a slide already going');
        ok(/if f\.phase == WARN and f\.path\.has\(sq\):\s*\n\s*f\.path = f\.path\.slice\(0, f\.path\.find\(sq\)\)/.test(fnGd(cr, 'drop')),
          '⭐ …and a lit line through it stops short of it: stepping into a slide\'s way is what a hand is for');
        ok(/_walls\.clear\(\)/.test(fnGd(cr, '_hurt')) && /_walls\.clear\(\)/.test(fnGd(cr, '_next')),
          '⛑ your dropped pieces go with a heart and with the crossing  (one in front of a pawn would hold it there)');
        ok(/if _pick >= 0:\s*\n\s*if not drop\(_pick, PortalBoard\.square_of\(w\)\):\s*\n\s*_pick = -1\s*\n\s*get_viewport\(\)\.set_input_as_handled\(\)\s*\n\s*return/.test(fnGd(cr, '_input')),
          '⚠ with a piece picked up, a tap on the board drops it or puts it back — never a hop by accident');
        /* ⭐ 2026-10-05, his "do numbers 4, 5, 6, 7, and 8". */
        ok(/const VALUE := \{ "k": 1, "q": 2, "r": 2, "b": 2, "n": 4, "p": 6 \}/.test(cr)
          && /var was := _piece\s*\n\s*_seats\[_at\.x\] = true\s*\n\s*_piece = HOME\[_at\.x\]/.test(crossFn)
          && /var pts: int = VALUE\[was\]/.test(crossFn) && /_score \+= pts/.test(crossFn),
          '⭐ SCORE BY THE PIECE: a crossing pays what the piece you crossed AS is worth',
          'soaked one piece at a time: king 56.5 crossings, queen 26.5, rook 24, bishop 23, knight 12, pawn 8');
        ok(/_dark = TownClock\.is_dark\(\)/.test(fnGd(cr, '_wave'))
          && /return not _dark or f\.phase != REST or pos\(f\)\.distance_to\(_feet\(\)\) < LANTERN/.test(fnGd(cr, 'shows'))
          && /if g\.shows\(f\):\s*\n\s*ChessArt\.draw_piece\(self, f\.code/.test(cr),
          '⭐ NIGHT CROSSING: after dark on the town\'s clock a resting piece shows only by your lantern; a lit one always');
        ok(/var cut := hole\.intersection\(area\)/.test(fnGd(cr, '_night')) && /\(band as Rect2\)\.intersection\(area\)/.test(fnGd(cr, '_night')),
          '⚠ …and the dark is cut to the board by hand  (no clip rect in _draw: it would fall on the ring and the hand)');
        ok(/\(m >= 450 and m < 570\) or \(m >= 990 and m < 1110\)/.test(fnGd(cr, 'traffic')) && /var busy := traffic\(\)/.test(fnGd(cr, '_set_traffic')),
          '⭐ rush hour on the town\'s clock brings more pieces, the small hours fewer');
        ok(/if \(n \+ 1\) % TACTIC_EVERY != 0:/.test(fnGd(cr, 'tactic_of')) && /const TACTICS := \["discovered", "battery", "xray"\]/.test(cr)
          && /_set_piece\(_tactic, lanes\)/.test(fnGd(cr, '_set_traffic')),
          '⭐ TACTIC CROSSINGS: every fifth crossing is a set piece — a discovered attack, a battery, an x-ray, in turn');
        ok(/if _foes\.has\(f\.leader\) and f\.leader\.at == f\.leader_at:\s*\n\s*return/.test(fnGd(cr, '_step'))
          && /_light\(f, _line\(f, f\.aim\)\)/.test(fnGd(cr, '_step')),
          '…a piece behind another waits until that one leaves its square (or is taken), then its line is lit at once');
        ok(/f\.phase = WARN/.test(fnGd(cr, '_light')) && !/MOVE/.test(fnGd(cr, '_light')),
          '⚠ …lit, never sprung: a set piece still waits the whole warning');
        ok(/var over := not f\.xray/.test(fnGd(cr, 'moves_of')) && /if over:\s*\n\s*break/.test(fnGd(cr, 'moves_of')),
          '…and an x-ray slides over one piece in its way — yours too');
        ok(/if c == _at and c\.y <= FOE_ROWS and not _claimed\(c, f\):/.test(fnGd(cr, '_pawn_moves'))
          && /if one\.y <= FOE_ROWS and one != _at and not _claimed\(one, f\):/.test(fnGd(cr, '_pawn_moves'))
          && /if f\.code == "p" and not _pawn_ok\(f\):/.test(fnGd(cr, '_step')),
          '⭐ BLACK PAWNS take only on the diagonal and only him, walk only onto nobody, and never onto the start ranks');
        ok(/if f\.at\.y >= FOE_ROWS:\s*\n\s*f\.code = "q"/.test(fnGd(cr, '_step')),
          '…and one that reaches the last rank it may, queens');
        ok(/if stepped\.size\(\) == 2:\s*\n\s*f\.ep = stepped\[0\]/.test(fnGd(cr, '_step'))
          && /f\.code == "p" and f\.phase == REST and f\.ep_t > 0\.0 and f\.ep == t and f\.at == t \+ Vector2i\(0, 1\)/.test(fnGd(cr, '_passer')),
          '…a double step beside your pawn can be taken on the square it passed, just after');
        ok(/sq == _stranded\(\)/.test(fnGd(cr, '_claimed')) && /if \(n \+ 1\) % ESCORT_EVERY == 0:/.test(fnGd(cr, '_wave'))
          && /_ward_on = true/.test(fnGd(cr, '_hop_step')),
          '⭐ ESCORT: one of yours stranded every third crossing — safe where it waits — and it follows once reached');
        ok(/if _ward_on and _nearest\(ww, wp, q, p\) < CELL \* 0\.42:\s*\n\s*lost = true/.test(fnGd(cr, '_bite')),
          '…a slide across it takes it, and not a heart');
        ok(/var seat := _seat_for\(_ward, _at\.x\)/.test(crossFn) && /pts \*= 2/.test(crossFn),
          '…brought across, it sits down in its own seat, or the crossing pays double');
        const warnFloor = +((/const WARN_FLOOR := ([\d.]+)/.exec(cr) || [])[1]);
        ok(/MAX_FOES/.test(fnGd(cr, '_set_traffic')) && /CLOCK_FLOOR/.test(fnGd(cr, 'clock_for')) && /REST_FLOOR/.test(fnGd(cr, '_rest_for'))
          && /WARN_FLOOR/.test(fnGd(cr, 'warn_for')) && /if f\.t >= warn_for\(\):/.test(fnGd(cr, '_step')),
          '⛑ it ramps until every run ends: more pieces, shorter rests, a shorter clock, a shorter warning  (soaked: every run ends)');
        ok(warnFloor >= 0.5,
          '⚠ …but a slide is always lit long enough to see and step away from  (0.4s to react, 0.14s to hop)', 'WARN_FLOOR ' + warnFloor);
        ok(/func _input\(event: InputEvent\)/.test(cr) && /Time\.get_ticks_msec\(\) - _touch_ms < 400/.test(fnGd(cr, '_input')),
          '⚠ a tap on a dot is taken in _input, ahead of the touch pad — and Godot\'s mouse copy of that tap is not a second hop');
        /* ⚠ 2026-10-10: the keeping moved to _bank(), which a scoresheet picked up in the lanes calls too. */
        ok(/var was := GameState\.worlds\.crossing_best\s*\n\s*if _score <= was:\s*\n\s*return ""\s*\n\s*GameState\.worlds\.crossing_best = _score\s*\n\s*GameState\.save_state\(\)/.test(fnGd(cr, '_bank'))
          && /brought \+= _bank\(\)/.test(crossFn)
          && /if int\(d\.get\("crossing_best", 0\)\) > worlds\.crossing_best:/.test(fnGd(g, 'merge_in'))
          && /local\.crossing_best = Math\.max\(\+local\.crossing_best \|\| 0, \+remote\.crossing_best \|\| 0\)/.test(fn(PROF, 'townMerge'))
          && !/add_ore|spend/.test(cr),
          '⭐ the best is saved the moment it is beaten and syncs as a max — and nothing is paid');
      }
      /* ══ MONEY (2026-09-30, his picks 1 2 3 4 5 7 8 9 10) ══ Driven end to end by a probe
         (49 checks: prices, rent, bounties, favors, the exchange's rails, packs, the booth over 60
         mornings, save/load and merge). These hold the rules that make it not a money printer. */
      {
        const rdc = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n')
          .split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const g = rdc('game_state.gd'), ch = rdc('challenger.gd'), mo = rdc('money.gd'), po = rdc('portal.gd');
        ok(/if rent_on == GameState\.today\(\)/.test(fnGd(g, 'collect_rent')) && !/\bday\b/.test(fnGd(g, 'collect_rent'))
          && /var d := GameState\.today\(\)/.test(fnGd(g, 'bounties_today')) && /_new_day\(\)/.test(fnGd(g, 'morning')),
          '⛑ rent and bounties are keyed to the CALENDAR  (the day is the real one since 2026-10-03)');
        /* ⛑ 2026-10-12, his: "pays out the first two times, then offers to quintuple your money and takes
           it all and never comes back". It used to pay back less every night, forever.
           ⚠ THE CHECK THIS REPLACES COULD NOT FAIL: with its constant gone it read "" as one rate of 0. */
        const paysSrc = (/const BOOTH_PAYS := \[([^\]]*)\]/.exec(g) || [])[1];
        const pays = paysSrc === undefined ? [] : paysSrc.split(',').map((x) => Number(x.trim()));
        ok(pays.length === 2 && pays.every((r) => r > 1) && +(/const BOOTH_PROMISE := (\d+)/.exec(g) || [])[1] === 5,
          '⭐ the booth pays out MORE than you left, twice, and the third night promises five times over',
          'pays ' + pays.join(' and '));
        const pay = fnGd(g, 'booth_payout');
        ok(/if booth_nights >= BOOTH_PAYS\.size\(\):\s*booth_nights = BOOTH_PAYS\.size\(\) \+ 1\s*GameState\.save_state\(\)\s*booth_gone\.emit\(n\)\s*booth_changed\.emit\(\)\s*return 0/.test(pay)
           && /var back: int = ceili\(float\(n\) \* float\(BOOTH_PAYS\[booth_nights\]\)\)\s*booth_nights \+= 1\s*add_ore\(back\)/.test(pay)
           && pay.indexOf('booth = {}') > 0 && pay.indexOf('booth = {}') < pay.indexOf('if booth_nights >= BOOTH_PAYS.size()'),
          '⛑ …and that third night it hands back NOTHING, is gone for good, and says so once');
        ok(/or not booth_open\(\):\s*return false/.test(fnGd(g, 'booth_leave'))
           && /return booth_nights <= BOOTH_PAYS\.size\(\)/.test(fnGd(g, 'booth_open')),
          '   a booth that has run takes nothing more');
        const xo = +((/const EXCHANGE_OUT := (\d+)/.exec(g) || [])[1] || 0), xi = +((/const EXCHANGE_IN := (\d+)/.exec(g) || [])[1] || 0);
        ok(xo > xi && /const EXCHANGE_CAP := \d+/.test(g) && /GameState\.money\.exchange_left\("out"\)/.test(mo)
          && /GameState\.money\.exchange_left\("in"\)/.test(mo),
          '⛑ the exchange takes a cut both ways and is capped each way each day  (ore has no ceiling)',
          xo + ' ore out for a credit, ' + xi + ' back');
        ok(!/SCOUT_ORE|buy_scout/.test(ch) && /GameState\.people\.take_lesson\(who, key\)/.test(ch)
          && !/add_ore|spend_ore|ore -=/.test(fnGd(g, 'finish_favor')) && /\bbump\(who, FAVOR_HEARTS\)/.test(fnGd(g, 'finish_favor')),
          '⭐ people never take ore: a lesson is repaid for a favor, and a favor pays hearts, not ore');
        ok(!/"ore"/.test((/const PACKS := \[[\s\S]*?\n\]/.exec(g) || [''])[0]) && /GameState\.worlds\.pack_open\(pack\)/.test(po),
          '⭐ board worlds are free or bought on the site — never ore — and the portal asks');
        ok(/_took\(\) if n == 2 and str\(pending\.get\("pos", ""\)\) == ""/.test(g),
          '…captures pay only on a CLEAN game, never on a study');
        ok(['rent_on', 'bounty_done', 'favors', 'lessons_used', 'packs'].every((k) => new RegExp('d\\.get\\("' + k + '"').test(fnGd(g, 'merge_in'))),
          '…and every synced money field is merged coming back, not only sent');
      }
      /* ══ THE SEA BOARD (2026-09-30, his: "some pieces turn invisible for a few rounds, in the
         portal game by the sea"). His picks: the site's engine, both sides vanish, footprints, a
         bot at your level. Driven in Chrome against the real referee + Stockfish: 35 checks. ══ */
      {
        const rdc = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n')
          .split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const sb = fs.existsSync(GDF('sea_board.gd')) ? rdc('sea_board.gd') : '';
        const g = rdc('game_state.gd');
        ok(/"id": "sea",\s+"name": "[^"]+",\s+"scene": "res:\/\/games\/sea_board\.tscn",\s+"free": true/.test(g)
          && fs.existsSync(GDF('sea_board.tscn')),
          '⭐ the sea board is its own world, kept whole and free  (no ring opens it since 10-03)');
        ok(sb !== '' && /PJCCTownChess/.test(sb) && /_call\("state\(\)"\)/.test(sb) && /_call\("start\(\)"\)/.test(sb)
          && /_call\("move\(%d, %d\)"/.test(sb)
          && !/func (legal|attack|is_attacked|gen_moves|in_check|can_move)/.test(sb) && !/castle|en.?passant/i.test(fnGd(sb, 'use')),
          '⛑ NO CHESS IN GODOT: the page referees and plays; the sea board only draws and carries',
          '⚠ a second rulebook is a game that lies about chess');
        ok(/if c == "" or c\.to_lower\(\) == "k" or _hidden\.has\(i\):/.test(fnGd(sb, '_end_round'))
          && /const VANISH_EVERY := \d+/.test(sb) && /const HIDE_ROUNDS := \d+/.test(sb)
          && /for white in \[true, false\]:/.test(fnGd(sb, '_end_round')),
          '⭐ every few rounds one piece on EACH side goes missing — never a king');
        ok(/_prints\[s\] = PRINT_SECS/.test(fnGd(sb, '_carry')) && /_prints\[int\(moved\[s\]\)\] = PRINT_SECS/.test(fnGd(sb, '_carry')),
          '⭐ a hidden piece that moves leaves footprints at BOTH ends');
        ok(/if res != "" and GameState\.worlds\.sea_paid != _gid:/.test(fnGd(sb, '_refresh'))
          && /GameState\.money\.pay_captures\(int\(st\.get\("took", 0\)\)\)/.test(fnGd(sb, '_refresh')),
          '…a win pays its captures in ore, once per game');
        ok(/return "Reach into %s" % square_name\(sq\)/.test(fnGd(sb, 'prompt_for_player'))
          && /_table\.say\("Nothing of yours there\."/.test(fnGd(sb, 'use')),
          '…and the prompt never gives a hidden piece away  (yours, theirs or nothing read the same)');
        /* the page has to actually load what the town calls — and the referee before the door */
        const ctp = fs.readFileSync(path.join(ROOT, 'games/checker-town/index.html'), 'utf8');
        const order = ['pjcc-chess.js', 'pjcc-chess-ai.js', 'pjcc-gauntlet-engine.js', 'pjcc-adapt.js', 'pjcc-townchess.js']
          .map((f) => ctp.indexOf("/assets/js/" + f + "'"));
        ok(order.every((i) => i > 0) && order.every((i, k) => k === 0 || i > order[k - 1]),
          '⭐ the Checker Town page loads the referee, the engine, the dial and the door — in that order',
          order.join(' '));
        /* ⭐ THE DOOR ITSELF, run in node against a scripted opponent: fool's mate, and pacing. */
        const W = { _s: {} };
        const sandbox = { localStorage: { getItem: (k) => W._s[k] || null, setItem: (k, v) => { W._s[k] = String(v); } },
          Date: Date, setTimeout: setTimeout, JSON: JSON, Math: Math, String: String };
        sandbox.window = sandbox;
        sandbox.PJCCChess = require('../assets/js/pjcc-chess.js');
        const replies = ['e7e5', 'd8h4'];
        sandbox.PJCCGauntletEngine = {
          personaForElo: () => ({}), warmup: () => {},
          move: (S) => { const u = replies.shift(); const C = sandbox.PJCCChess;
            return Promise.resolve(C.findMove(S, C.sqFromName(u.slice(0, 2)), C.sqFromName(u.slice(2, 4)), null)); } };
        new Function('window', fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-townchess.js'), 'utf8'))(sandbox);
        const T = sandbox.PJCCTownChess, sq = (n) => sandbox.PJCCChess.sqFromName(n);
        const st = () => JSON.parse(T.state());
        const s0 = st();
        const illegal = T.move(sq('e2'), sq('e5'));
        const t0 = Date.now();
        const m1 = T.move(sq('f2'), sq('f3'));
        const thinking = st().thinking, early = T.move(sq('g2'), sq('g4'));
        await new Promise((r) => { const w = () => (st().ply === 2 ? r() : setTimeout(w, 20)); w(); });
        const took1 = Date.now() - t0;
        T.move(sq('g2'), sq('g4'));
        await new Promise((r) => { const w = () => (st().result ? r() : setTimeout(w, 20)); w(); });
        const end = st();
        ok(s0.ply === 0 && s0.turn === 'w' && s0.b.length === 64 && illegal === 'illegal' && m1 === 'ok',
          '⭐ PJCCTownChess: a fresh game, an illegal move refused, a legal one taken');
        ok(thinking === true && early === 'wait' && took1 >= 600,
          '…the bot thinks, you cannot move over it, and it never answers inside 650ms', took1 + 'ms');
        ok(end.result === '0-1' && end.why === 'checkmate' && end.last && end.last.to === sq('h4'),
          '…and fool\'s mate is checkmate, 0-1, with the queen\'s move as the last one');
        ok(T.move(sq('a2'), sq('a3')) === 'over' && T.start() === 'ok' && st().ply === 0 && st().gid !== end.gid,
          '…a finished game takes no moves, and start() sets up a new one');
      }
      ok(/var speed: float = Tuning\.now\(\)\.walk_speed/.test(player) && tune('walk_speed') > 0,
        'the feet go at the dials\u2019 walk_speed  (his: "can you slow me down 25%?")',
        'walk_speed ' + tune('walk_speed') + ' \u2014 TownDog.trot() reads it too, see §36b');

      /* ══ 14 · THE PARK TABLES ARE A ROOM ══ */
      /* his: "yes do Park Tables and The Depths." */
      ok(/scene_path = "res:\/\/rooms\/park\.tscn"/.test(town2)
        && !/url = "\/games\/park-tables\/"/.test(town2),
        'the Park Tables is a ROOM, not a link that opens the lobby in a new tab');
      ok(fs.existsSync(GDF('park.tscn')), '…and the scene exists');
      /* ⭐⭐ THE SAME TRICK THE ARCADE PLAYS ON THE GAMES REGISTRY, aimed at the bench. */
      /* ⚑ MINUS THE CEO (2026-09-21. */
      /* his: "The CEO should be removed" */
      const benchKeys = [...yml.matchAll(/^- key:\s*(\S+)/gm)].map((m) => m[1]).filter((k) => k !== 'ceo').sort();
      const tableKeys = [...park.matchAll(/\{ "key": "([a-z]+)"/g)].map((m) => m[1]).sort();
      ok(JSON.stringify(tableKeys) === JSON.stringify(benchKeys),
        '…and the tables ARE the bench minus the CEO, both ways',
        'tables: ' + tableKeys.join(' ') + '  |  bench: ' + benchKeys.join(' '));
      const ceoYml = /^- key:\s*ceo\s*\n\s*name:[^\n]*\n\s*icon:[^\n]*\n\s*elo:\s*(\d+)/m.exec(yml);   /* ⚠ `.` stops at a CRLF's \r */
      const ceoGd = /const CEO_ELO := (\d+)/.exec(gs);
      ok(!/"key": "ceo"/.test(park) && ceoYml && ceoGd && +ceoYml[1] === +ceoGd[1]
         && /_ceo\.elo = GameState\.ladder\.CEO_ELO/.test(fs.readFileSync(GDF('hall.gd'), 'utf8')),
        '⛑ the CEO has no park table, and his ONE rating is GameState.ladder.CEO_ELO, the bench\'s own',
        (ceoGd ? ceoGd[1] : '?') + ' vs bench ' + (ceoYml ? ceoYml[1] : '?'));
      /* every row, field for field, against the YAML the site prints from. */
      const ymlRows = {};
      for (const m of yml.matchAll(
        /^- key:\s*(\S+)\s*\n\s*name:\s*(.+?)\s*\n\s*icon:\s*"(.)"\s*\n\s*elo:\s*(\d+)/gm)) {
        ymlRows[m[1]] = { name: m[2], icon: m[3], elo: +m[4] };
      }
      const GLYPH = { '♖': 'r', '♜': 'r', '♘': 'n', '♞': 'n', '♗': 'b', '♝': 'b',
                      '♕': 'q', '♛': 'q', '♔': 'k', '♚': 'k', '♙': 'p', '♟': 'p' };
      const rows = [...park.matchAll(
        /\{ "key": "([a-z]+)",\s*"who": "([^"]+)",\s*"elo": (\d+),\s*"piece": "([a-z])"/g)];
      ok(rows.length === benchKeys.length,
        '…and every row was readable', rows.length + ' of ' + benchKeys.length);
      /* ⚑ 2026-10-10 — THE TOWN IS AHEAD OF THE SITE BY ONE NAME (his: "Change that dog's name to Milo.").
         GameState.RENAMED is the ONLY way a name here may differ from the bench's, and it is printed on
         every run until the site's bench says the same. */
      const renamedGd = Object.fromEntries([...((/const RENAMED := \{([^}]*)\}/.exec(gs) || [0, ''])[1])
        .matchAll(/"([^"]+)": "([^"]+)"/g)].map((m) => [m[1], m[2]]));
      const ahead = [];
      const wrong = rows.filter(([, k, who, elo, pc]) => {
        const r = ymlRows[k];
        /* ⚠ AUSTON'S 1200 IS THE DIAL'S INVISIBLE SEED, not a rating. */
        if (!r) return true;
        if (r.name !== who) {
          if (renamedGd[r.name] !== who) return true;
          ahead.push(r.name + ' is ' + who + ' in town');
        }
        if (GLYPH[r.icon] !== pc) return true;
        return +elo !== r.elo && +elo !== 0;
      }).map((m) => m[1]);
      ok(wrong.length === 0 && ahead.length <= 1,
        '…name, rating and PIECE all match the bench', wrong.join(' ') || rows.length + ' rows'
          + (ahead.length ? '  ⚑ ' + ahead.join(', ') + '; the bench on the site has not been renamed' : ''));
      ok(/"key": "auston"/.test(park.slice(park.indexOf('const OFF')))
        && /"key": "brother"/.test(park.slice(park.indexOf('const OFF')))
        && /adaptive: true/.test(PT) && /offLadder: true/.test(PT),
        '…and the two seats drawn OFF the ladder here are the two the bench draws off it');
      /* ⭐ y-sort, and the trap that comes with it. */
      ok(/y_sort_enabled = true/.test(park),
        '⭐ the pavilion is Y-SORTED — you walk behind the far tables');
      ok(/ground\.z_index = -1/.test(park) && /class Ground extends Node2D/.test(park),
        '…with the floor a CHILD at z_index -1',
        '⚠⚠ a y-sorted node draws its OWN art at its own Y — the zone\'s _draw() would cover the room');
      ok(/out\.z_index = -1/.test(park) && /_board\.z_index = -1/.test(park),
        '…and anything hung on a wall drops out of the sort too');
      ok(/func sit_down\(who: String, key: String, cost: int\) -> String:/.test(gs)
        && /if beaten_today\(key\):/.test(gs),
        '⭐ ONE function sits you down, and it owns the once-a-day stamp');
      ok(/GameState\.challenge\.sit_down\(who, key, cost\(\)\)/.test(chal)
        && /GameState\.challenge\.sit_down\(who, key, _cost\(\)\)/.test(park),
        '…and BOTH ways of taking a seat come down it',
        '⚠⚠ two copies of the daily rule is two pieces off Maxwell in one evening');
      /* ⚠ READING THE RULE IS NOT COPYING IT. */
      ok(!/begin_challenge/.test(chal) && !/GameState\.body\.spend\(/.test(chal)
        && !/retire_for_today/.test(chal),
        '…neither ENFORCES it  (⛑ the challenger had all three inline until today)');
      ok(!/begin_challenge/.test(park) && !/GameState\.body\.spend\(/.test(park)
        && !/retire_for_today/.test(park),
        '…and the table never had them');
      ok(/func _locked\(\) -> bool:/.test(park)
        && /the tables want a clean win over %s first/.test(park),
        'a locked seat says the price on the sign');
      const sitBody = park.slice(park.indexOf('\tfunc interact(_player: Node) -> void:'));
      ok(!/_locked\(\)/.test(sitBody.slice(0, sitBody.indexOf('func _lock_who'))),
        '…and still opens, because the STAR TABLE that really gates it is the site\'s',
        '⚠⚠ a door refusing on a copy of somebody else\'s rule is confidently wrong');
      /* ⭐ the room empties as you win. */
      ok(/_mine = _slot >= 0 and GameState\.board\.has_slot\(_slot\)/.test(park)
        && /theirs, pushed in/.test(park),
        '⭐ a seat whose square is yours has an empty chair and their piece on the table');
      ok(/func _cost\(\) -> int:\s*\n\s*return 0 if _mine else 10/.test(park),
        '…and a rematch there is free, the same rule as the person outside');
      ok(/GameState\.board\.army_changed\.connect/.test(park)
        && /GameState\.board\.site_slot_won\.connect/.test(park)
        && /GameState\.challenge\.challenge_resolved\.connect/.test(park),
        '…and every table notices, because you played in another tab');
      const pRoom = /const ROOM := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(park);
      const pRung = /const RUNG_Y := (-?[\d.]+)/.exec(park);
      /* ⛑ ALL OF THEM, NOT .exec()'s FIRST. */
      const pSeats = [...park.matchAll(
        /ChessArt\.draw_piece\(self, piece, Vector2\(0\.0, (-?[\d.]+)\), ([\d.]+),\s*tint/g)]
        .map((m) => +m[1] - +m[2] / 2);
      const pFeet = /const SEAT_FEET := (-?[\d.]+)/.exec(park);
      const pTall = /const TALL := ([\d.]+)/.exec(fs.readFileSync(GDF('player_model.gd'), 'utf8'));
      ok(pFeet && pTall && /TownPeople\.draw_person\(self, Vector2\(0\.0, SEAT_FEET\)/.test(park)
         && /SEAT_FEET - TownPlayerModel\.TALL/.test(park),
        'the seated player is measured too, off the model\'s own height',
        'drawn off the BAKED SHEET since 2026-09-29 \u2014 same feet, same height, no live rig');
      if (pFeet && pTall) pSeats.push(+pFeet[1] - +pTall[1]);
      /* …and a DOG at a table, drawn sitting, not a model: her crown is DOG_SEAT − SIT_TALL × scale. */
      const pDog = /const DOG_SEAT := (-?[\d.]+)/.exec(park), pDogS = /const DOG_SCALE := ([\d.]+)/.exec(park);
      const pSit = /const SIT_TALL := ([\d.]+)/.exec(fs.readFileSync(GDF('dog.gd'), 'utf8'));
      ok(pDog && pDogS && pSit && /TownDog\.paint_sitting\(self, who, Vector2\(0\.0, DOG_SEAT\), DOG_SCALE/.test(park),
        'a dog at a Pavilion table is measured too');
      if (pDog && pDogS && pSit) pSeats.push(+pDog[1] - +pSit[1] * +pDogS[1]);
      /* \u26d1\u26d1\u26d1 ONLY THE PLAYER MAY WEAR A LIVE RIG. A TownPlayerModel is a SubViewport with
         its own World3D, and the cost of this town has twice been the NUMBER of them rather
         than the price of one: seven in the town (fixed 09-26 by people_sheet.gd) and then
         seven more at the Pavilion's tables, which nobody carried the fix into. Measured in
         Chrome on his GPU, both arms twice: park 43.2fps / p95 33.40 / 760 dropped frames in
         45s, against the town's 60.1 / 16.80 / 0. After: 60.1 / 16.80 / 0.
         \u26a0 people_sheet.gd is the OTHER legal caller \u2014 it builds one rig to photograph the
         sheet and frees it again. Anyone else draws from the sheet. */
      {
        const rigs = GD_LIST.filter((f) => f.endsWith('.gd'))
          .filter((f) => /TownPlayerModel\.make\(/.test(fs.readFileSync(GDF(f), 'utf8')));
        /* \u26a0 lift.gd IS THE THIRD (2026-10-15): it is HIM, up close on the bench, and goes when the lift does.
           \u26a0 character_select.gd IS THE FOURTH (2026-10-23): a portrait of each person you can play, while the cards are up. */
        ok(rigs.length === 4 && rigs.includes('player.gd') && rigs.includes('people_sheet.gd') && rigs.includes('lift.gd')
           && rigs.includes('character_select.gd'),
          '\u26d1\u26d1\u26d1 only the PLAYER wears a live 3D rig \u2014 everybody else is a baked picture  (and the bench press is him, the cards who you can play)',
          rigs.length ? 'builds one: ' + rigs.join(', ') : 'nobody builds one at all');
      }

      ok(pRoom && pRung && pSeats.length >= 3,
        'the pavilion\'s frame is readable from source', pSeats.length + ' heads measured');
      if (pRoom && pRung && pSeats.length) {
        const roomTop = +pRoom[2], roomBottom = +pRoom[2] + +pRoom[4];
        const camLowest = Math.max(roomTop, roomBottom - 648);   /* the base viewport is 1152x648 */
        const pieceTop = +pRung[1] + Math.min(...pSeats);
        ok(pieceTop - camLowest >= 56,
          '…and the seated pieces clear the HUD from the camera\'s lowest position',
          'screen y ' + Math.round(pieceTop - camLowest) + ', the stat row ends at 50');
      }
      /* ══ YOU CAN WALK BEHIND THE TABLES — 2026-09-21 ══ */
      /* his: "let's be able to walk behind the tables." */
      {
        const PL = fs.readFileSync(GDF('player.gd'), 'utf8');
        const num = (re, src) => { const m = re.exec(src); return m ? +m[1] : NaN; };
        const backY = num(/const BACK_Y := (-?[\d.]+)/, park), camOff = num(/camera_offset = Vector2\(0\.0, (-?[\d.]+)\)/, park);
        const rad = num(/var radius: float = ([\d.]+)/, PL), feet = num(/const FEET := ([\d.]+)/, PL);
        const foot = /const FOOT := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(park);
        const nook = /const NOOK := Vector2\(([\d.]+), ([\d.]+)\)/.exec(park);
        const dial = /_dial\.position = Vector2\(w - ([\d.]+) \* k, ([\d.]+) \* k\)/.exec(fs.readFileSync(GDF('zone.gd'), 'utf8'));
        const dialH = num(/const DIAL := ([\d.]+)/, fs.readFileSync(GDF('zone.gd'), 'utf8'));
        const nums = [backY, camOff, rad, feet, dialH, pTall && +pTall[1], pRoom && +pRoom[2]];
        ok(nums.every((n) => Number.isFinite(n)) && foot && nook && dial && pRung,
          'the lane behind the tables is readable from source', nums.join(' '));
        if (nums.every((n) => Number.isFinite(n)) && foot && nook && dial && pRung) {
          const roomTop = +pRoom[2], roomRight = +pRoom[1] + +pRoom[3], roomBottom = roomTop + +pRoom[4], wallT = 28;
          const tall = +pTall[1];
          const back = backY + rad + 2;                                        /* player.gd's clamp */
          const camTop = (y) => Math.min(Math.max(y + camOff - 324, roomTop), roomBottom - 648);
          const behind = +pRung[1] + +foot[2] - rad;                           /* touching a table's back */
          ok(behind - back >= 20 && /box\.size = FOOT\.size/.test(park) && /StaticBody2D\.new\(\)/.test(park),
            '⭐ the tables are solid and there is a LANE behind them', Math.round(behind - back) + ' units');
          ok(back + feet - tall - camTop(back) >= 56,
            '…whose back edge keeps your head clear of the stat row',
            'screen y ' + Math.round(back + feet - tall - camTop(back)));
          /* ⚠ the clock hangs lower, top right. */
          const clockL = roomRight - +dial[1], clockBottom = +dial[2] + dialH;
          const besideNook = roomRight - wallT - +nook[1] - rad;
          const belowNook = roomTop + wallT + +nook[2] + rad;
          ok(besideNook + 20 <= clockL && belowNook + feet - tall - camTop(belowNook) >= clockBottom + 2
             && /for r in nooks\(\):/.test(park) && /for r in Pavilion\.nooks\(\):/.test(park),
            '…and a solid, DRAWN hedge fills the back corners, so you cannot stand under the clock',
            'beside ' + besideNook + ' vs clock ' + clockL + ' · head ' + Math.round(belowNook + feet - tall - camTop(belowNook)) + ' vs ' + clockBottom);
        }
      }

      /* ══ 15 · THE DEPTHS IS THE CAMP ABOVE THE SHAFT ══ */
      ok(/scene_path = "res:\/\/rooms\/depths\.tscn"/.test(town2)
        && !/shaft\.energy_cost = 20/.test(town2),
        'the shaft is a ROOM, and the energy moved inside with the cage');
      ok(fs.existsSync(GDF('depths.tscn')), '…and the scene exists');
      ok(/energy_cost = Tuning\.now\(\)\.mine_cost/.test(pit),
        '…charged ONCE, by the cage  (⚠ leaving it on the door too would charge you twice)');
      /* ⭐⭐ REAL SHADOWS — the technique this room exists to show. */
      ok(/shadow_enabled = true/.test(pit) && /LightOccluder2D\.new\(\)/.test(pit)
        && /OccluderPolygon2D\.new\(\)/.test(pit),
        '⭐ the pit head has REAL cast shadows — a light with shadows and an occluder per post');
      ok(/poly\.closed = true/.test(pit),
        '…and the occluder is CLOSED, or it casts from its edges and lights its own middle');
      ok(/_lamp\.position\.x = sin\(/.test(pit),
        '…and the lamp swings, so every shadow in the room sweeps');
      ok(/class Prop extends StaticBody2D/.test(pit) && /CollisionShape2D\.new\(\)/.test(pit),
        '…and the timber stops you  (⛑ scenery you walk through says the room is a picture)');
      ok(/CanvasModulate\.new\(\)/.test(pit) && /dim\.color = Color\(0\.5/.test(pit),
        '…and the room is still legible with the lights off  [[down-never-stuck]]');
      /* ⭐ the sentence neither the mine nor the site can say. */
      ok(/GameState\.board\.slot_for_game\("sand-mine-depths"\)/.test(pit)
        && /GameState\.board\.unlock_need\(_slot\)/.test(pit) && !/\b300\b/.test(pit)
        && /Sand Mine Depths pays it/.test(pit) && !/machine is in the Arcade/.test(pit),
        '⭐ the Martyr\'s stone says Sand Mine Depths pays his square, and asks the roster how much',
        '⚠ two mines share a name: the shaft pays ore, the site\'s game pays the g-pawn — and the Arcade is gone (10-03)');
      /* the run has to come back where you came in. */
      ok(/var mine_return: String/.test(gs)
        && /GameState\.mine_return = "res:\/\/rooms\/depths\.tscn"/.test(pit),
        'the shaft run knows which door it came through');
      const mineGd = fs.readFileSync(GDF('mine.gd'), 'utf8');
      ok(/GameState\.mine_return if GameState\.mine_return != "" else town_scene/.test(mineGd),
        '…and reads it, with the old export still the fallback',
        '⚠ an @export is read from the SCENE FILE — the caller cannot set it');

      /* ══ 16 · THE GAUNTLET IS OUT OF THE TOWN, AND PARKED ══ */
      /* his: "let's make the Gauntlet in Checker Town a skyscraper in Chess City — so… eliminate it from the game for now." */
      ok(!/stairwell\.tscn/.test(town2) && !/url = "\/games\/the-gauntlet\/"/.test(town2)
        && !/GAUNTLET_AT/.test(town2),
        'no door in the town opens the Gauntlet, and its lot went with it');
      ok(fs.existsSync(GDF('stairwell.tscn')) && /PARKED, NOT DELETED/.test(stair),
        '…and the room is PARKED, not deleted — and its own first line says so',
        'a stairwell is the inside of a skyscraper; writing it twice is writing it twice');
      /* ⚠⚠ AND THE MAP MUST NOT KEEP A ROAD TO IT. */
      ok(!/NORTH_Y/.test(town2) && /Rect2\(TRAIL_X - 26\.0, YARD\.end\.y/.test(town2),
        '…and the road north is ONE haul road now, ending in the yard  (no fork, no stub)');
      ok(/"un": \["the-gauntlet", \d+\]/.test(gs),
        '…and the h-rook still costs four floors of it — a SITE game, like Murphy\'s Law',
        'Siege and Murphy have never had a building here either');

      /* ══ 16e · THE SQUARE OPENED UP, AND THE TABLES ARE TABLES ══ */
      /* his: "For Park tables in checker town game, remove the house and replace it with a similar park table visual to when you Enter into it. Then move the academy a little further away from the Tables, same with the arcade." */
      ok(/class TableGrove extends TownDoor/.test(town2) && /var d := TableGrove\.new\(\)/.test(town2)
        && !/wall_color = Color\("2f5d3a"\)/.test(town2),
        'the Park Tables are TABLES, not a cottage with a green roof');
      /* ⚠ THE ROOM'S OWN GEOMETRY, SCALED — not a second guess at what a table looks like. */
      const grove = town2.slice(town2.indexOf('class TableGrove'), town2.indexOf('class CheckerShell'));
      for (const n of ['-58.0, -30.0, 116.0, 16.0', '-62.0, -104.0, 124.0, 78.0', '-17.0, -18.0, 34.0, 12.0'])
        ok(grove.includes(n) && park.includes(n),
          '   …and its ' + n.split(',')[2].trim() + '-wide piece is the one the room draws');
      /* ⛑ THE ARCADE'S LOT IS EMPTY SINCE 2026-10-03; the Academy still has to clear the grove. */
      const cx = /const ACADEMY_AT := Vector2\((-?[\d.]+),/.exec(town2);
      const gw = /d\.size = Vector2\(([\d.]+), [\d.]+\)\s*\n\s*d\.position = TABLES_AT/.exec(town2);
      ok(cx && gw && -(+cx[1]) - +gw[1] / 2 >= 380,
        '…and the Academy stands clear of the grove',
        cx && gw ? 'academy ' + cx[1] + ', grove ' + gw[1] + ' wide' : '?');
      /* ⚠ EVERYTHING IN THE ACADEMY'S YARD IS OFF ACADEMY_AT. */
      ok((town2.match(/ACADEMY_AT \+ Vector2\(/g) || []).length >= 4
        && /Rect2\(ACADEMY_AT\.x - 140\.0, -130\.0/.test(town2),
        '…and its yard, its board, its lamp and the two people in it moved with it');

      /* ══ 16f · NINE HOUSES YOU CANNOT GO INTO ══ */
      /* his: "add some more checkers scattered around that you can't get inside of, representing other homes." */
      ok(/class CheckerShell extends Node2D/.test(town2)
        && !/class CheckerShell extends (TownDoor|Interactable)/.test(town2),
        'the other homes are scenery, not doors that refuse',
        '⚠ a TownDoor with no scene says "Locked for now", which is a promise nobody kept');
      const homes = [...town2.matchAll(/\[Vector2\((-?[\d.]+), (-?[\d.]+)\), "[0-9a-f]{6}"\]/g)]
        .map((m) => [+m[1], +m[2]]);
      ok(homes.length >= 6, 'there are ' + homes.length + ' of them');
      let tooClose = [];
      for (let i = 0; i < homes.length; i++)
        for (let j = i + 1; j < homes.length; j++)
          if (Math.hypot(homes[i][0] - homes[j][0], homes[i][1] - homes[j][1]) < 260)
            tooClose.push(homes[i] + ' / ' + homes[j]);
      ok(tooClose.length === 0, '…and no two of them overlap', tooClose[0] || 'all clear');
      /* ⛑ AND THEY ARE ON THE MINIMAP. */
      const mapSrc = fs.readFileSync(GDF('map.gd'), 'utf8');
      const jrnSrc = fs.readFileSync(GDF('journal.gd'), 'utf8');
      ok(/add_to_group\("town_home"\)/.test(town2) && /is_in_group\("town_home"\)/.test(mapSrc)
        && /for h in TownMap\.homes:/.test(jrnSrc),
        '…and every one of them is drawn on the map, unnamed');
      const fixes = /for spot in \[([\s\S]*?)\]:/.exec(town2);
      ok(fixes && !/Vector2\(-400\.0, -100\.0\), "flowers"/.test(fixes[1])
        && (fixes[1].match(/(TABLES_AT|ACADEMY_AT) \+ Vector2\([^)]*\), "flowers"/g) || []).length === 4,
        '…and all four flower beds are placed off the building they belong to',
        'they flank the Academy\'s path and the grove, and they move when either does');

      /* ══ 16g · YOU CANNOT WALK ON WATER, AND THE CORNERS ARE FENCED ══ */
      /* his: "make it so user can not walk on water" */
      const r4 = (name) => {
        const m = new RegExp('const ' + name + ' := Rect2\\(' +
          '(-?[\\d.]+), (-?[\\d.]+), (-?[\\d.]+), (-?[\\d.]+)\\)').exec(town2);
        return m ? { x: +m[1], y: +m[2], w: +m[3], h: +m[4] } : null;
      };
      const inR = (r, x, y) => r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
      const water = r4('WATER_RECT'), jetty = r4('JETTY');
      const dm = /func _deck\(\) -> Rect2:\s*\n\s*return Rect2\(SEA_AT\.x - ([\d.]+), SEA_AT\.y - ([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(town2);
      const sea = /const SEA_AT := Vector2\(([\d.]+), ([\d.]+)\)/.exec(town2);
      const deck = dm && sea
        ? { x: +sea[1] - +dm[1], y: +sea[2] - +dm[2], w: +dm[3], h: +dm[4] } : null;
      const blocks = [...(/const WATER_BLOCK := \[([\s\S]*?)\n\]/.exec(town2) || [0, ''])[1]
        .matchAll(/Rect2\((-?[\d.]+), (-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\)/g)]
        .map((m) => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] }));
      ok(water && jetty && deck && blocks.length >= 4,
        'the sea, the dock, the jetty and the blockers all read off the file',
        blocks.length + ' blockers');
      let wet = 0, dry = 0;
      if (water && deck && jetty && blocks.length) {
        for (let x = water.x + 10; x < water.x + water.w; x += 20)
          for (let y = water.y + 10; y < water.y + water.h; y += 20) {
            const walkable = inR(deck, x, y) || inR(jetty, x, y);
            const blocked = blocks.some((b) => inR(b, x, y));
            if (!walkable && !blocked) wet++;          // open sea you could walk onto
            if (walkable && blocked) dry++;            // dock or jetty walled off
          }
      }
      ok(wet === 0, '…and not one square of open water is walkable', wet + ' unblocked samples');
      ok(dry === 0, '…while every plank of the dock and the jetty still is',
        dry + ' blocked samples on the dock  (⚠ block the jetty and Shogi Island is unreachable)');
      /* ⚠ AND THE ROWBOAT HAS TO BE ON A PLANK. */
      const rb = /boat\.position = Vector2\(([\d.]+), ([\d.]+)\)/.exec(town2);
      ok(rb && (inR(jetty, +rb[1], +rb[2]) || inR(deck, +rb[1], +rb[2])),
        '…and the rowboat is standing on one of them', rb ? rb[1] + ',' + rb[2] : '?');
      /* ⚠⚠ A FENCE OVER A DOOR IS A DOOR NOBODY CAN REACH, and nothing else would notice. */
      const fenced = [...(/const FENCED := \[([\s\S]*?)\n\]/.exec(town2) || [0, ''])[1]
        .matchAll(/Rect2\((-?[\d.]+), (-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\)/g)]
        .map((m) => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] }));
      /* the north-west corner is the woods since 2026-10-23, a window of its own */
      ok(fenced.length === 2, 'two corners are fenced off', fenced.length + ' rects');
      const named = {};
      for (const m of town2.matchAll(/const ([A-Z_]+_AT) := Vector2\((-?[\d.]+), (-?[\d.]+)\)/g))
        named[m[1]] = [+m[2], +m[3]];
      const walled = Object.keys(named).filter((k) => fenced.some((f) => inR(f, named[k][0], named[k][1])));
      ok(walled.length === 0, '…and not one of them is standing on a place',
        walled.join(', ') || Object.keys(named).length + ' places checked, all outside');
      ok(/func _draw_fences\(pr: Rect2\) -> void:/.test(town2)
        && /_draw_fences\(pr\)/.test(fnGd(town2, '_draw')),
        '…and the fence is DRAWN, because an invisible wall is a bug you cannot report',
        '⚠ it takes the window rect now — a corner nobody can reach is not drawn');
      /* ⛑⛑ AND NOTHING STANDS ON THE LINE IT DRAWS — 2026-09-24. The check above asks whether a
         place is INSIDE a fenced rect; this asks whether anything is ON its edge, which is where
         the rails and the posts actually go. A lot at (-700, 760) had its bottom at y 823 and the
         south-west fence runs along y 820: the rails went through the house and had done for days.
         ⚠⚠ NOBODY SAW IT WHILE THE FENCE WAS THREE UNITS WIDE AND THE COLOR OF THE SAND. Making a
         thing visible makes what it overlaps visible too. [[one-fix-every-instance]] */
      const lotsF = [...town2.slice(town2.indexOf('func _furnish_neighbors'),
        town2.indexOf('func _furnish_trees')).matchAll(/Vector2\((-?[\d.]+), (-?[\d.]+)\)/g)]
        .map((m) => [+m[1], +m[2]]);
      /* the two inside edges of each corner — the same six lines _draw_fences() walks */
      const lines = [];
      for (const f of fenced) {
        lines.push({ x0: f.x, x1: f.x + f.w, y0: f.y, y1: f.y });
        lines.push({ x0: f.x + f.w, x1: f.x + f.w, y0: f.y, y1: f.y + f.h });
        lines.push({ x0: f.x, x1: f.x, y0: f.y, y1: f.y + f.h });
      }
      /* a checker is 230 across and about 126 tall on screen; the posts stand 46 above the line */
      const straddle = lotsF.filter(([x, y]) => lines.some((L) =>
        Math.max(L.x0, L.x1) >= x - 115 && Math.min(L.x0, L.x1) <= x + 115
        && Math.max(L.y0, L.y1) >= y - 63 - 46 && Math.min(L.y0, L.y1) <= y + 63));
      ok(straddle.length === 0, '…and not one house is standing on a fence line',
        straddle.map((p) => p.join(',')).join(' · ') || lotsF.length + ' lots against '
          + lines.length + ' fence lines, all clear');

      /* ══ 16h · THERE IS A WAY BACK FROM THE GAMES THE TOWN OPENS ══ */
      /* his: "Make it so sky run and mine depths, you have the option to return to Game like we did with the puzzles." */
      /* ⛑ The Arcade's cabinets carried the flag until 2026-10-03; the rings carry it now. */
      ok(/url = str\(GAMES\[game\]\["url"\]\) \+ "\?town=1"/.test(rings),
        'every ring tells the page where you came from');
      for (const [slug, file] of [['sky-run', 'pjcc_sky_run.html'],
                                  ['sand-mine-depths', 'pjcc_sandmine.html'],
                                  ['dungeon', 'pjcc_princess_dungeon.html']]) {
        const wrap = fs.readFileSync(path.join(ROOT, 'games', slug, 'index.html'), 'utf8');
        ok(new RegExp('src="[^"]*' + file).test(wrap),
          '   /games/' + slug + '/ frames ' + file);
        const page = fs.readFileSync(path.join(ROOT, 'assets/games', file), 'utf8');
        ok(/function fromTown\(\)/.test(page) && /window\.parent\.location\.search/.test(page),
          '   …and it reads the flag off the WRAPPER as well as off itself');
        ok(/id="town-btn"/.test(page) && /wireTownButton\('town-btn'\)/.test(page)
          && /class="[^"]*\bhidden\b[^"]*" id="town-btn"/.test(page),
          '   …and the end card grows a TOWN button, hidden unless you came from there');
        ok(/w\.location\.href = '\/games\/checker-town\/'/.test(page),
          '   …which walks back when no script is allowed to close the tab');
        /* ⚠ Sand Mine Depths lost its town door with the Arcade; its page keeps the button. */
        if (slug !== 'sand-mine-depths')
          ok(new RegExp('^\\t"' + slug + '": \\{ "name": ', 'm').test(rings),
            '   …and a ring in the town opens it');
      }

      /* ══ 16c · THE LANDSCAPE IS SAND, AND GREEN MEANS SOMETHING ══ */
      /* his: "make the entire landscape mostly sand, then add some green by the park tables, and then put the river/sea past THAT, where the boat to shogi island is." */
      const bare = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
      const grd = /const GROUND := Color\("([0-9a-f]{6})"\)/.exec(town2);
      ok(grd && grd[1] !== '22301f',
        'the ground is sand, not the green it was', grd && ('#' + grd[1]));
      /* ⚠ AND IT IS STILL DARK ENOUGH TO STAND ON. */
      const lum = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
        .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
      ok(grd && lum(grd[1]) < 0.22,
        '…and dark enough that a person still reads on it', grd && lum(grd[1]).toFixed(3));
      /* ⚠⚠ SAND IS THE WORKED GROUND NOW, NOT THE GROUND. */
      const snd = /const SAND := Color\("([0-9a-f]{6})"\)/.exec(town2);
      ok(snd && grd && Math.abs(lum(snd[1]) - lum(grd[1])) > 0.04,
        '…and the worked sand still reads apart from the desert it sits on',
        snd && grd && (lum(grd[1]).toFixed(3) + ' vs ' + lum(snd[1]).toFixed(3)));
      /* ⭐ TWO GREENS, AND THEY ARE THE PAVILION'S OWN. */
      ok((town2.match(/_draw_green\(/g) || []).length === 3
        && /Pavilion\.GRASS_A/.test(town2) && /Pavilion\.GRASS_B/.test(town2)
        && !/Color\("2[0-9a-f]3[0-9a-f]1f"\)/.test(town2),
        'exactly TWO green places, both painted from the Pavilion\'s own grass',
        '⚠ a third patch of green costs the other two');
      ok(/const SHORE := Rect2\([\d.]+, [\d.]+, WATER_RECT\.end\.x - [\d.]+,\s*\n\s*WATER_RECT\.position\.y - [\d.]+ \+ 4\.0\)/.test(town2),
        '…and the river\'s green strip is DERIVED from the water, not typed beside it');
      /* ⭐ ONE RAGGED EDGE FOR ALL FOUR PATCHES. */
      ok(/func _draw_fringe\(area: Rect2, col: Color, seed_: int, skip_x: float = -1\.0\)/.test(town2)
        && /_draw_fringe\(SAND_RECT, SAND, \d+\)/.test(town2)
        && /_draw_fringe\(YARD, SAND, \d+, TRAIL_X\)/.test(town2)
        && /_draw_fringe\(area, Pavilion\.GRASS_A, seed_\)/.test(town2),
        '…and every patch that is not the ground ends in the same ragged edge',
        'the camp, the Assembly\'s pad and both green places, from one function');
      /* ⚠ NOTHING ON THIS GROUND IS RANDOM: it redraws on every resize. */
      const ground = town2.slice(town2.indexOf('func _draw() -> void:'),
        town2.indexOf('func _draw_board'));
      ok(!/randf|randi|RandomNumberGenerator/.test(bare(ground)),
        '…and not one grain of it is random  (the ground redraws on every resize)');

      /* ══ 16d · THE DOGS LIVE BY THE CHECKERS ══ */
      /* his: "Move Crockett and Argus to be around the checker houses." */
      ok(/func _furnish_dogs\(\) -> void:/.test(town2)
        && !/_add_challenger\("(Milo|Crockett|Argus)", "[a-z]+", \d+, "[a-z]", CAMP_AT/.test(town2),
        'Milo and Argus are off the Sand Mine camp');
      const dogs = town2.slice(town2.indexOf('func _furnish_dogs'),
        town2.indexOf('func _furnish_tables'));
      ok(/MAX_HOME_AT \+/.test(dogs) && /HOME_AT \+/.test(dogs),
        '…and both are placed off the two checkers, so moving a house moves its dog');
      /* ⚠ A DOG STANDING ON THE LANE IS A DOG IN THE ONLY ROAD TO TWO FRONT DOORS. */
      const lane = [...dogs.matchAll(/HOME_AT \+ Vector2\((-?[\d.]+), (-?[\d.]+)\)/g)]
        .map((m) => +m[2]).filter((dy) => Math.abs(dy) < 34.0);
      ok(lane.length === 0, '…and neither of them is standing in it',
        lane.length ? lane.join(', ') + ' is inside ±34 of the lane' : 'both clear');

      /* ══ 16b · THE ASSEMBLY IS A SHACK, AND ONE CRANE PUT IT UP ══ */
      /* his: "[it] should be more of a shack than a house — something that members of checker town, which is mostly sand … could conceivably build with basic construction tools, maybe ONE crane." */
      ok(/class AssemblyShack extends TownDoor/.test(town2)
        && /var hall := AssemblyShack\.new\(\)/.test(town2),
        'the Assembly is a shack — its own subclass, like the other bespoke fronts',
        '⚠ a wider TownDoor would have repainted every cottage on the map');
      /* ⚠⚠ THE ONE THING THE REPAINT MUST NOT TOUCH. */
      const shack = town2.slice(town2.indexOf('class AssemblyShack'),
        town2.indexOf('class BuildCrane'));
      ok(/_draw_windows\(half\)/.test(shack) && !/board_cell|ROSTER/.test(shack),
        '…and it asks TownDoor for the sixteen windows rather than numbering its own',
        '⚠⚠ the window a square lights is decided in one place and this is not it');
      ok(/hall\.board_face = true/.test(town2) && /hall\.lit_windows = GameState\.board\.army/.test(town2),
        '…so the board is still readable from the road');
      /* ⚠ THE ROOF IS TALLER THAN THE GABLE TownDoor ALLOWS FOR. */
      const foot = shack.slice(shack.indexOf('func footprint'), shack.indexOf('func speech_top'));
      ok(/-half\.y - RISE - EAVE,/.test(foot) && /size\.y \+ RISE \+ EAVE/.test(foot),
        '…and the lean-to is solid to its high corner, not to the flat 52 of a gable');
      ok((town2.match(/BuildCrane\.new\(\)/g) || []).length === 1
        && /const CRANE_AT :=/.test(town2),
        'ONE crane, and it is still standing on the pad', 'his word, and the count is the point');
      /* ⚠ SALTED, NEVER randf(). */
      const yardSrc = town2.slice(town2.indexOf('func _draw_yard'),
        town2.indexOf('func _draw_board'));
      for (const [name, src] of [['the shack', shack], ['the yard', yardSrc]]) {
        ok(!/randf|randi|RandomNumberGenerator/.test(bare(src)),
          '…nothing in ' + name + ' is random  (it redraws on every resize)');
      }
      /* ⚠⚠ THE YARD IS AN AREA, NOT A ROAD. */
      ok(/{ "rect": YARD, "color": SAND }/.test(town2),
        '…and the yard is on the minimap, so the haul road does not end in grass');
      ok([...stair.matchAll(/"\/games\/[^"]+"/g)].length === 1,
        '…with exactly ONE door in it, because the Gauntlet is one URL');
      /* ⭐⭐ THE TEN ARE THE GAUNTLET'S TEN, derived from the game itself, both ways. */
      const GAUNT = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_gauntlet.html'), 'utf8');
      const realFloors = [...GAUNT.matchAll(/\{ name:'([^']+)',[^\n]*?elo:(\d+),(\s*secret:true)?/g)]
        .map((m) => ({ who: m[1], elo: +m[2], secret: !!m[3] }));
      const publicFloors = realFloors.filter((f) => !f.secret);
      const drawn = [...stair.matchAll(/\{ "who": "([^"]+)",\s*"elo": (\d+) \}/g)]
        .map((m) => ({ who: m[1], elo: +m[2] }));
      ok(publicFloors.length === 10 && realFloors.length === 13,
        'the Gauntlet still has ten public floors and three secret ones',
        publicFloors.length + ' public, ' + (realFloors.length - publicFloors.length) + ' secret');
      ok(JSON.stringify(drawn) === JSON.stringify(publicFloors.map((f) => ({ who: f.who, elo: f.elo }))),
        '…and the stairwell draws exactly those ten, in order, with their real ratings',
        drawn.length + ' landings');
      /* ⚠⚠ the secret floors must NOT be in here. */
      const secretNames = realFloors.filter((f) => f.secret).map((f) => f.who);
      ok(secretNames.length > 0 && !secretNames.some((n) => stair.includes(n)),
        '…and NONE of the secret ones  [[gauntlet-secret-floors]]',
        secretNames.join(' · '));
      ok(/player\.add_child\(lamp\)/.test(stair) && /CanvasModulate\.new\(\)/.test(stair),
        '⭐ you carry the light up a dark stairwell — the lighting IS the fog of war');
      ok(/\.enabled = i < _cleared/.test(stair),
        '…and a landing is lit only if you have cleared it');
      ok(/_known = idx <= got or \(_slot >= 0 and idx \+ 1 == _need\)/.test(stair),
        '…so a floor you have not reached has no NAME on it either');
      ok(/_slot = GameState\.board\.slot_for_game\(Stairwell\.GAME\)/.test(stair)
        && /_need = GameState\.board\.unlock_need\(_slot\)/.test(stair),
        '…except the one that owes a square, and which floor that is comes off the ROSTER');
      ok(!/idx \+ 1 == 4|_need = 4/.test(stair),
        '…never typed  (⚠ a fourth-floor constant here is a second copy of the price)');
      const gameId = /const GAME := "([a-z-]+)"/.exec(stair);
      ok(gameId && gs.includes('"un": ["' + gameId[1] + '"'),
        '…and the id it asks with is the one the ROSTER pays on', gameId && gameId[1]);
      /* ⭐ narrow floor, wide room — the two rects, the other way round. */
      ok(/world_bounds = WELL/.test(stair) && /camera_bounds = ROOM/.test(stair),
        '⭐ the well you walk in is narrow and the room the camera sees is wide');
      const sRoom = /const ROOM := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(stair);
      ok(sRoom && +sRoom[3] >= 1152,
        '…and wide enough for the window, or the camera pins and shows the gray outside',
        sRoom && sRoom[3] + ' units');
      ok(/_poll\.wait_time = 2\.5/.test(stair) && /func _recheck\(\)/.test(stair),
        'this room polls, because the floor count MOVES THE DOOR');

      /* ══ 17 · THE CLIMB IS A NUMBER THE TOWN CAN READ ══ */
      /* ⚠ SLICED TO THE FUNCTION, never grepped from the whole file. */
      const scoreFn = PROF.slice(PROF.indexOf('PJCC.townScore ='),
        PROF.indexOf('PJCC.townPlayer ='));
      ok(/PJCC\.saveScore\('the-gauntlet',/.test(GAUNT),
        'the Gauntlet banks its climb under the id the ROSTER asks for');
      ok(/PJCC\.saveScore\('the-gauntlet', Object\.keys\(prog\.beaten\)\.length,/.test(GAUNT),
        '…and what it banks is a COUNT OF FLOORS, which is what "climb to the fourth" means',
        '⚠ a rating or a score here and the roster would be comparing 4 against 1250');
      ok(/prog\.beaten\[G\.idx\] = true;/.test(GAUNT)
        && GAUNT.indexOf('prog.beaten[G.idx] = true;') > GAUNT.indexOf('if (playerWon){'),
        '…and a floor only joins that count on a WIN');
      ok(/return PJCC\.localBest\(id\) \|\| 0;/.test(scoreFn)
        && !/gauntlet/.test(scoreFn),
        '…and townScore reads it by the ORDINARY path, with no special case of its own',
        '⚠⚠ a direct read of the game\'s private save would miss the account copy from myStats');
      const need = /"un": \["the-gauntlet", (\d+)\]/.exec(gs);
      ok(need && +need[1] <= publicFloors.length,
        '…so the h-rook is reachable: the roster asks for a floor inside the public ten',
        need && ('floor ' + need[1] + ' of ' + publicFloors.length));

      /* ══ 18 · CAMPAIGN IS THE CAMP'S RING ══ */
      /* his: "move Campaign into Arcade, but locked until half the assembly is lit up." */
      /* ⛑ 2026-09-07:. */
      /* his: "put the campaign on the workbench" */
      /* ⛑ 2026-10-03, his: "Let's put Campaign in one of them - take the arcade completely away". */
      ok(/slug:'marchland'[^\n]*cat:'dev'[^\n]*gate:'nrun'/.test(REG),
        'Campaign files under the WORKBENCH on the site now, behind its own earned gate',
        '⚠ §13 is what keeps its ring here from becoming a link to nothing');
      ok(/func assembly_half\(\) -> bool:\s*\n\s*return army_count\(\) \* 2 >= ROSTER\.size\(\)/.test(gs),
        '⭐ "half the Assembly" is ONE function');
      ok(!/claimable/.test(/func assembly_half[\s\S]{0,200}/.exec(gs)[0]),
        '…counted off the WHOLE roster',
        '⚠ tying it to what is currently winnable makes the lock cheaper every time a character lands');
      {
        const ringCode = bareGd(rings);
        ok(/return _half\(\) and not GameState\.board\.assembly_half\(\)/.test(fnGd(ringCode, 'dark')) && !/army_count\(\) \* 2/.test(ringCode),
          '…and the ring asks it rather than doing the arithmetic again');
        ok(/^\t"marchland": \{[^\n]*"half": true/m.test(ringCode) && (ringCode.match(/"half": true/g) || []).length === 1
          && /bool\(GAMES\[game\]\.get\("half", false\)\)/.test(fnGd(ringCode, '_half')),
          '…on exactly one ring, off a field  (⚠ not an `if game ==`)');
        ok(/dark until half the Assembly is lit  \(%d of %d\)/.test(fnGd(ringCode, '_line'))
          && /if dark\(\):\s*\n\s*say\(/.test(fnGd(ringCode, 'interact')),
          '…and a shut ring says its own price AND how far you have got, and a press only says so',
          '⚠ "Locked" alone is a door refusing to say what it wants');
        ok(/TownPortal\.paint\(self, Vector2\.ZERO, size\.x \* 0\.5, dark\(\) or GameState\.worlds\.later\(url\)\)/.test(ringCode)
          && /RING_DARK if shut else RING/.test(fnGd(ringCode, 'paint')),
          '…and is painted dark until it opens, and while what it opens is still being built');
        ok(/GameState\.board\.army_changed\.connect\(/.test(fnGd(ringCode, '_ready_extra')),
          '⚠ it lights while you stand at it: a square can fill from another tab');
      }

      /* ══ 19 · NIGHT ══ */
      /* his: "the town after dark is a different town." */
      const clk = fs.readFileSync(GDF('clock.gd'), 'utf8');
      ok(/^class_name TownClock$/m.test(clk), 'there is a clock');
      /* ⚠⚠ THE WALL CLOCK AND THE GAME'S DAY COUNTER ARE DIFFERENT THINGS. */
      const clkCode = clk.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
      ok(!/GameState/.test(clkCode),
        '…and it is the WALL clock — no line of it can see GameState.day',
        '⚠⚠ sleeping in a bed must not make it morning');
      /* ⚠ THE ABSENCE IS THE CHECK. hour() and weekday() both call this. */
      ok(/get_datetime_dict_from_system\(false\)/.test(clk)
        && !/get_datetime_dict_from_system\(true\)/.test(clk),
        '…in LOCAL time, in BOTH readers  (⚠ `true` is UTC: midnight here at four in the afternoon)');
      /* the darkest tint still has to be a town you can cross. */
      const nightTint = /const NIGHT_TINT := Color\(([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(clk);
      ok(nightTint && Math.max(+nightTint[1], +nightTint[2], +nightTint[3]) >= 0.35,
        '…and the darkest tint still leaves a walkable map  [[down-never-stuck]]',
        nightTint && nightTint.slice(1).join(', '));
      ok(/_sky\.color = TownClock\.tint\(\)/.test(town2) && /CanvasModulate\.new\(\)/.test(town2),
        'the map is tinted by the hour');
      ok(/_clock\.wait_time = 60\.0/.test(town2) && /_clock\.timeout\.connect\(_retime\)/.test(town2),
        '…on a minute\'s tick, because the hour arrives while the tab is open');
      ok(/func retime\(\) -> void:/.test(town2) && /n\.call\("retime"\)/.test(town2),
        '…and ONE function tells everything that cares',
        '⚠ three listeners on three timers is three chances to be in a different hour');
      ok(/_light\.enabled = dark(?: and not _broken\(\))?\n/.test(town2),
        'a street lamp is a REAL light after dark and dark in the day');
      /* ⛑⛑ ENABLED, NEVER ENERGY 0 (2026-10-01): six lights sat enabled at energy 0. Outside, under a
         half-GPU load: 455 doubled frames a minute, 47 with them disabled. */
      const noComments = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
      const parked = GD_LIST.filter((f) => f.endsWith('.gd')).filter((f) =>
        /\.energy = (?:0(?:\.0)?\s*(?:#|$|if\b)|[^\n#]*\belse 0(?:\.0)?\b)/m
          .test(noComments(fs.readFileSync(GDF(f), 'utf8'))));
      ok(parked.length === 0, '…and no light anywhere is parked at energy 0: a dark light is DISABLED',
        parked.join(' · ') || 'every .gd scanned');
      const retimeFn = fnGd(town2, '_retime');
      ok(/var flip := dark != _dark_was or day != _day_was/.test(retimeFn)
        && /elif flip and n is CanvasItem:/.test(retimeFn) && !/elif n is CanvasItem:/.test(retimeFn),
        '…and the minute tick repaints the map only when dusk, dawn or the day turns over',
        '⛑ every child each minute was a 40 ms frame (2026-10-01)');
      ok(/func _draw_lit\(/.test(door) && /if board_face or not TownClock\.is_dark\(\)/.test(door),
        '…and a building shows a light on — but never the Assembly',
        '⚠ that face already wears sixteen windows that MEAN something');

      /* ══ 20 · THE DOG ══ */
      /* his: "the dog is in the town — she follows you, and she finds things." */
      const dog = fs.readFileSync(GDF('dog.gd'), 'utf8');
      ok(/^class_name TownDog$/m.test(dog) && /extends TownChallenger/.test(dog),
        'the dog is a CHALLENGER with legs, not a new kind of thing');
      /* ⚠⚠ NO CHARACTER WAS INVENTED, and this is the check that says so. */
      const FTD = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_space_run.html'), 'utf8');
      const pmd = fs.readFileSync(path.join(ROOT, '_characters/princess.md'), 'utf8');
      ok(/function updatePrincess\(/.test(FTD) && /a dog who can learn/.test(pmd)
        && /static func princess\(\) -> TownDog:\s*\n\s*return TownDog\.of\("Princess"\)/.test(dog),
        '…and she is PRINCESS, because Follow the Dog is her game',
        '⚑ Crockett is the other dog and his file says "always around" — one word moves it');
      /* ⚠⚠ ANCHORED TO THE END OF THE LINE. */
      ok(/"Princess": \{ "key": "princess", "elo": 2100/.test(dog) && /dog\.away_chance = 0\.0(?!\d)/.test(dog),
        '…keeping her seat, and never randomly missing  (a companion who vanishes reads as a bug)');
      ok(/_follow = GameState\.people\.hearts_for\(who\) > 0/.test(dog),
        '…and she does not follow a stranger');
      /* ⛑⛑ AND SHE IS THE ONLY ONE WHO FOLLOWS (2026-09-24). */
      ok(/_follow = GameState\.people\.hearts_for\(who\) > 0 and not at_home and companion/.test(dog)
         && /if not companion:\s*\n\s*return super\(\)/.test(fnGd(dog, 'menu'))
         && /"companion": true/.test(dog) && (dog.match(/"companion": false/g) || []).length === 2,
        '…and she is the ONLY one who does  (the other two are dogs with her legs and none of her job)');
      ok(/npc\.away\(\)/.test(dog) && /GameState\.board\.claimable\(\)/.test(dog)
        && /GameState\.challenge\.island_open/.test(dog)
        && !['_find', '_who_is_out', '_first_owed'].some((f) => /rand/.test(fnGd(dog, f))),
        '⭐ every word she says is TRUE — who is out, what is owed, whether the boat is yours',
        '⚠ a companion who says "I smell something" and means nothing is one you stop asking');
      ok(/func away\(\) -> bool:/.test(npc),
        '…asked of the person, so she keeps no second copy of a roll salted by the day');
      ok(!/ChessArt/.test(dog),
        '…and she is DRAWN as a dog, not as her bench glyph over a nameplate');

      /* ══ 21 · THE PIECES TALK ══ */
      const says = [...roster.matchAll(/"say": "/g)].length;
      const whos = [...roster.matchAll(/"who": "/g)].length;
      ok(says === whos && whos === 16,
        'all sixteen squares carry the line their piece says', says + ' of ' + whos);
      ok(/func square_says\(slot: int\) -> String:/.test(gs) && /not has_slot\(slot\)/.test(gs),
        '…and an UNWON square says nothing  (nobody has lost it yet)');
      /* ⚠ IT IS A CELL AND NOT A SQUARE SINCE 09-05 (off-the-wall #3). */
      ok(/class Cell extends Interactable/.test(hall) && /sq\.f = f/.test(hall),
        'one mouth per square, standing where the piece stands');
      ok(/monitoring = slot >= 0 or legal/.test(hall),
        '…switched OFF unless something is on it OR you may legally move there',
        'forty-odd live cells take the prompt off the Lectern, and forty that offer a move '
        + 'and then refuse it are worse');
      ok(!/func _draw\(\)/.test(hall.slice(hall.indexOf('class Cell'),
                                           hall.indexOf('class Lectern'))),
        '…and it draws NOTHING — the room paints the board in one pass over the roster');

      /* ══ 22 · THE ROAD WEST ══ */
      /* his: "5 (but make it West instead of North)" */
      ok(/class CityGate extends TownDoor/.test(town2) && /url = GameState\.town\.CHESS_CITY_URL/.test(town2)
        && /const CHESS_CITY_URL := "\/games\/chess-city\/"/.test(gs),
        'the road west ends at a gate onto Chess City');
      ok(/if not GameState\.challenge\.ceo_beaten:[\s\S]{0,120}Barred from the other side/.test(town2),
        '…barred until the far chair is taken, and it SAYS what would open it',
        '⚠ "Locked for now" is a door refusing to name its own price');
      /* ⛑ the map grew and one loop had the old corners typed into it. */
      const gRect = /const GROUND_RECT := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/
        .exec(town2);
      const gateX = /const GATE_AT := Vector2\((-?[\d.]+),/.exec(town2);
      ok(gRect && gateX && +gateX[1] - 120 > +gRect[1],
        '…and the map reaches past it, so the gate is not standing in the edge',
        gateX && ('gate at ' + gateX[1] + ', edge at ' + gRect[1]));
      ok(/while x <= box\.end\.x:/.test(town2) && !/while x <= 1120\.0:/.test(town2)
        && /GROUND_RECT\.intersection\(pr\)/.test(town2),
        '…and the grid is drawn off the RECT, not off four typed corners',
        '⛑ it had -1120 in it and would have stopped 280 units short of the new edge');

      /* ══ 23 · THE VISITOR ON A REAL DAY ══ */
      /* his: "6 (make it Auston)" */
      ok(/@export var away_days: Array\[int\] = \[\]/.test(npc)
        && /if not away_days\.is_empty\(\):[\s\S]{0,80}TownClock\.weekday\(\)/.test(npc),
        'somebody can be out on a REAL weekday');
      ok(/auston\.away_chance = 0\.0(?!\d)/.test(town2) && /auston\.away_days = \[2, 4\]/.test(town2),
        '…and the calendar REPLACES the dice for her, it does not add to it',
        '⚠ two rules deciding whether she is here is a bug you cannot tell from a feature');
      ok(/auston\.gift_day = 0/.test(town2) && /It's %s\. Anything for me\?/.test(npc),
        '…and on her day the row says WHOSE day it is');
      /* ⚠⚠ A REAL DATE, NOT `day` — the whole point is that it is actually Sunday. */
      ok(/func take_gift\(\) -> String:/.test(gs) && /last_gift = GameState\.today\(\)/.test(gs)
        && /Time\.get_date_string_from_system\(false\)/.test(gs),
        '…stamped with the real DATE, so it is once a week and not once a sleep');
      ok(/if str\(d\.get\("last_gift", ""\)\) > people\.last_gift:/.test(gs),
        '…and the LATER date wins on a merge, or every device hands out its own copy');
      ok(/func recheck_attendance\(\) -> void:/.test(npc)
        && /n\.call\("recheck_attendance"\)/.test(town2),
        '…and midnight arriving with the tab open moves her');

      /* ══ 24 · THE STALL, AND THE BOARD YOU LEAVE A MOVE ON ══ */
      /* his: "7 (just use ore as currency for now)" */
      /* ⛑ THE STALL IS PARKED 2026-09-30, his: "Remove the hat shop for now". The shop left the
         square; the hats you own stay saved and synced, so it can come back with nothing lost. */
      ok(!/class Stall extends Interactable:/.test(town2) && !/Stall\.new\(\)/.test(town2)
        && !/"a": "Hats"/.test(fs.readFileSync(GDF('journal.gd'), 'utf8')),
        '⛑ the hat stall is parked: gone from the square, and the journal stops counting hats you cannot get');
      ok(/const HATS := \[/.test(gs) && /GameState\.people\.SCOUT_ORE/.test(fs.readFileSync(GDF('market.gd'), 'utf8')),
        '…the hats stay on the books, and ore still buys something (the Scorebooks)');
      /* ⚠ THE JOURNAL IS NOT ON THIS LIST AND MUST NOT BE ADDED TO IT. */
      const wearers = ['player.gd'];
      const readsHat = GD_LIST.filter((f) => f.endsWith('.gd'))
        .filter((f) => !wearers.includes(f) && f !== 'game_state.gd')
        .filter((f) => /GameState\.body\.hat\b/.test(fs.readFileSync(GDF(f), 'utf8')));
      ok(readsHat.length === 0,
        '…and NOTHING reads what you are wearing except the two things that draw it',
        readsHat.join(' ') || 'cosmetic only');
      ok(/func buy_hat\(/.test(gs) && /func wear_hat\(/.test(gs),
        'buying and wearing are two verbs');
      ok(/for k in \(d\.get\("hats", \{\}\) as Dictionary\):/.test(gs)
        && /if body\.hat == "" and str\(d\.get\("hat", ""\)\) != ""/.test(gs),
        '…and they SYNC differently: owning is a union, wearing is a preference',
        '⚠⚠ a union on the worn hat puts it back on every time you take it off');
      /* ⛑ THE BOARD BY THE ROAD CAME OFF 2026-09-23. */
      /* his: "Remove the Board by the Road, since we have actual park tables now" */
      ok(!/PostBoard/.test(town2),
        'the board by the road is gone, class and all',
        'the Park Tables are on the map now; it was a second door onto the same page');

      /* ══ 25 · THE JOURNAL ══ */
      /* his: "sixteen squares, sixteen different prices, and no single place that lists them." */
      const jrn = fs.readFileSync(GDF('journal.gd'), 'utf8');
      const pad = fs.readFileSync(GDF('touch_pad.gd'), 'utf8');
      ok(/^class_name TownJournal$/m.test(jrn), 'there is a journal');
      ok(/_journal = TownJournal\.new\(\)/.test(zone) && /add_child\(_journal\)/.test(zone),
        '…and every room builds one  (the board is the same board from any room)',
        '⚠ in zone.gd, not in town.gd — a panel you can open in one building you look at once');
      ok(/k\.keycode == KEY_J/.test(jrn), '…J opens it');
      ok(/func _journal_tab\(\) -> Control:/.test(zone) && /b\.text = "Journal"/.test(zone),
        '…and so does a tab in the corner, because he is on a phone',
        '[[hover-is-three-inputs]]');
      {
        /* 44px, measured off the offsets rather than trusted. */
        const top = /b\.offset_top = ([\d.]+)/.exec(zone);
        const bot = /b\.offset_bottom = ([\d.]+)/.exec(zone);
        ok(top && bot && (parseFloat(bot[1]) - parseFloat(top[1])) >= 44,
          '…and the tab is a real tap target',
          top && bot ? (parseFloat(bot[1]) - parseFloat(top[1])) + 'px tall' : 'no offsets');
        ok(/b\.anchor_right = 1\.0/.test(zone) && !/b\.position = /.test(zone),
          '…anchored, not positioned  (⚠ a Control position under a moved anchor is off-screen on every phone but mine)');
      }
      ok(/if k\.keycode == KEY_J and not _talking\(\)/.test(jrn),
        '…and it will not open over a conversation  (two things listening for 1-4 at once)');
      ok(/TownZone\.covered\(get_tree\(\)\)/.test(player) && /TownZone\.covered\(get_tree\(\)\)/.test(pad)
        && /TownJournal\.is_open\(t\)/.test(fnGd(zone, 'covered')),
        '…the player and the pad both stand down while it is up');
      ok(/func is_open\(t: SceneTree\) -> bool:/.test(jrn),
        '…and they ask ONE function, not two copies of the flag');
      {
        const rows = jrn.slice(jrn.indexOf('func _board_rows'), jrn.indexOf('func _progress'));
        const hits = (rows.match(/holder_at/g) || []).length;
        ok(hits === 1 && /if won:\s*\n\s*row\["b"\] = GameState\.board\.holder_at\(i\)/.test(rows),
          '⭐ an unwon square still names NOBODY  (⚠⚠ do not "fix" this — [[removed-not-forgotten]])',
          hits + ' mention(s) of holder_at in the board tab');
        ok(/somebody in this town/.test(rows),
          '…it says a person is behind it without saying which person');
      }
      ok(/GameState\.board\.unlock_say\(i\)/.test(jrn) && /row\["c"\] = _progress\(i\)/.test(jrn),
        '…and it prints the PRICE, which is the half of #2 nothing else showed');
      ok(/return "of %d" % need/.test(jrn) && /return "%d \/ %d"/.test(jrn),
        '⚠ an unknown score prints "of 20", never "0 / 20"',
        'off the site there is nothing to ask, and 0 is a different claim');
      ok(!/ScrollContainer/.test(jrn) && /clampf\(\(_body\.size\.y - 26\.0 \* k\) \/ float\(rows\.size\(\)\)/.test(jrn),
        '⚠⚠ NOTHING SCROLLS — the pitch shrinks instead',
        'the town is an iframe and a drag inside it belongs to the page [[mobile-window-slide]]');
      ok(/_journal\.shown\.connect/.test(zone) && /_hud\.visible = not on/.test(zone),
        '…and the HUD stands down, or "Day 1 · Energy" prints through the title');

      ok(/func site_scores\(ids: Array\) -> Dictionary:/.test(gs),
        'the site is asked for many scores in ONE crossing');
      ok((gs.match(/P\.townScore\(/g) || []).length === 1,
        '…and there is exactly one copy of that JavaScript in the whole project',
        'there were two before today and the journal would have been the third');
      ok(/if ids\.is_empty\(\) or not OS\.has_feature\("web"\):\s*\n\s*return \{\}/.test(gs),
        '…{} means NOT ASKED, which is not the same answer as zero');
      ok(/return int\(site_scores\(\[id\]\)\.get\(id, 0\)\)/.test(gs),
        '…and the single-score read goes through the same door');
      ok(/func game_at\(slot: int\) -> String:/.test(gs)
        && /return str\(\(r\["un"\] as Array\)\[0\]\) if r\.has\("un"\) else ""/.test(gs),
        '…the journal and slot_for_game read the SAME field, in opposite directions');

      /* ══ 26 · THE GAME THAT WON THE SQUARE ══ */
      ok(/var GAMES_KEY = 'pjcc\.pt\.games\.v1'/.test(PT), 'Park Tables banks a finished game');
      {
        const bank = fn(PT, 'bankGame');
        ok(/isStudy\(st\)/.test(bank), '…never a study  (it won no square, so it is nobody\u2019s record)');
        ok(/!botWon\(st\)/.test(bank) && /tierEarned\(st\) !== 'full'/.test(bank),
          '…and only a CLEAN WIN, which is exactly what a square costs');
        ok(/all\[st\.bot\] = \{ moves: st\.moves/.test(bank),
          '…one per regular, keyed by who you beat');
      }
      ok(/markLast\(st\);\s*\n\s*bankGame\(st\);/.test(PT),
        '…and botFinishAs calls it on every ending');
      ok(/PJCC\.townGame = function \(key\)/.test(PROF) && /pjcc\.pt\.games\.v1/.test(PROF),
        'the site will hand the town that game');
      ok(/func has_replay\(key: String\) -> bool:/.test(gs) && /P\.townGame/.test(gs),
        '…and the town asks rather than storing one');
      ok(/const REPLAY_URL := "\/games\/park-tables\/\?replay="/.test(gs),
        '…and opens the room that can draw it');
      {
        /* ⛑ THE DOOR MOVED 2026-09-09. */
        const sq = hall.slice(hall.indexOf('class Lectern extends Interactable'));
        ok(/if key != "" and GameState\.challenge\.has_replay\(key\):/.test(sq),
          '…a square won off the rest of the site offers no game back',
          '⚠ the row is ABSENT, not grayed — there was never a game at this board');
        ok(/GameState\.challenge\.watch_replay\(GameState\.board\.key_at\(_watch\)\)/.test(sq),
          '…and the one that was, does');
      }
      ok(/function askedForReplay/.test(PT) && /if \(rep\) showReplay\(rep\)/.test(PT),
        'Park Tables answers ?replay=');
      {
        const show = fn(PT, 'showReplay');
        const cut = show.indexOf('replaceState');
        ok(cut > 0 && cut < show.indexOf('PJCCReview'),
          '…and strips the parameter BEFORE opening anything',
          '⚠ route() can run twice on one load and would stack two overlays');
        ok(/PJCCReview/.test(show) && /PJCCAnalysis/.test(show),
          '…on the review board, falling back to the analysis board');
      }

      /* ══ 27 · SIX HEARTS BUYS A POSITION ══ */
      const STUD = require(path.join(ROOT, 'assets/js/pjcc-studies.js'));
      {
        const ids = STUD.all().map((r) => r.id).sort();
        const gdIds = [];
        const block = gs.slice(gs.indexOf('const STUDIES := ['), gs.indexOf('\nvar positions'));
        let m, re = /"id": "([a-z]+)"/g;
        while ((m = re.exec(block))) gdIds.push(m[1]);
        gdIds.sort();
        ok(ids.length === 7 && gdIds.join(',') === ids.join(','),
          '⭐⭐ the town names the same seven studies the site sets up',
          gdIds.join(',') + '  vs  ' + ids.join(','));
        /* ⚑ REVERSED 2026-10-26 (his: "Start with number 10", Route B): the town plays the position itself now, so
           it holds a copy of each, and the copy is held to this file field for field. */
        /* ⚠ THE STUDIES' BLOCK ONLY: another table's "id" first would carry the first study's fields off with it */
        const blockS = gs.slice(gs.indexOf('const STUDIES := ['), gs.indexOf('\n]', gs.indexOf('const STUDIES := [')));
        const rowsS = [...blockS.matchAll(/"id": "(\w+)",[\s\S]*?"side": "(\w)", "goal": "(\w+)", "fen": "([^"]+)"/g)];
        ok(rowsS.length === STUD.all().length
           && STUD.all().every((r) => rowsS.some((g) => g[1] === r.id && g[2] === r.side && g[3] === r.goal && g[4] === r.fen)),
          '⚠⚠ and the town\'s copy of every position is the site\'s, field for field: the board, the side, the goal',
          rowsS.length + ' town rows');
        const js = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-studies.js'), 'utf8');
        ok(!/who:|ask:|ore:/.test(js) && !/crockett|maxwell|robert/.test(js),
          '…and the site half names nobody: the ids are the joint');
      }
      {
        /* ⚠⚠ EVERY POSITION IS PROVED WITH THE PERFT-VERIFIED REFEREE. */
        const CH = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
        const WANT = { lucena: 'KRP|kr', philidor: 'KR|krp', ladder: 'KRR|k',
                       backrank: 'KR|krppp', qvp: 'KQ|kp', rookmate: 'KR|k',
                       bishops: 'KBB|k' };
        let bad = [];
        for (const r of STUD.all()) {
          let S = null;
          try { S = CH.parseFEN(r.fen); } catch (e) { bad.push(r.id + ':parse'); continue; }
          const tally = {};
          for (const p of S.b) if (p) tally[p] = (tally[p] || 0) + 1;
          const mat = 'K' + 'QRBNP'.split('').map((p) => p.repeat(tally[p] || 0)).join('') +
                      '|k' + 'qrbnp'.split('').map((p) => p.repeat(tally[p] || 0)).join('');
          if (S.turn !== r.side) bad.push(r.id + ':turn');
          if (CH.legalMoves(S).length === 0) bad.push(r.id + ':nomoves');
          if (CH.gameResult(S, 1)) bad.push(r.id + ':over');
          if (CH.inCheck(S, S.turn === 'w' ? 'b' : 'w')) bad.push(r.id + ':illegal');
          if (mat !== WANT[r.id]) bad.push(r.id + ':' + mat);
        }
        ok(bad.length === 0,
          '⭐⭐ every study position is legal, live, the right side to move, and the material it claims',
          bad.length ? bad.join(' ') : 'all seven');
        ok(STUD.get('qvp').fen.indexOf('3p4') > 0,
          '⚠ the queen study uses a d-PAWN  (queen against a rook or bishop pawn on the seventh is a DRAW)');
      }
      ok(/GameState\.people\.hearts_for\(who\) < GameState\.people\.HEART_CAP/.test(gs),
        '…offered at six hearts, which is the number the card actually shows you reaching');
      ok(/positions\.has\(str\(row\["id"\]\)\)/.test(gs), '…and only until you have beaten it');
      {
        const sit = gs.slice(gs.indexOf('func sit_study'), gs.indexOf('func win_study'));
        ok(!/spend\(/.test(sit),
          '⚠ FREE — six hearts is the price and it took a dozen games to pay');
        ok(/"pos": str\(row\["id"\]\)/.test(sit) && /table_wanted\.emit\(\)/.test(sit),
          '…and the errand names the position, and the table in the town sets it');
      }
      {
        const tl = fn(PROF, 'townLast');
        ok(/String\(r\.pos \|\| ''\) !== String\(pos \|\| ''\)/.test(tl),
          '⭐⭐ the site will not answer a game with a study, or a study with a game');
        const tr = PROF.slice(PROF.indexOf('PJCC.townResult ='), PROF.indexOf('PJCC.townGame ='));
        const tcl = PROF.slice(PROF.indexOf('PJCC.townClean ='), PROF.indexOf('PJCC.puzzleResult ='));
        ok(/townLast\(key, since, \w+\)/.test(tr) && /townLast\(key, since, \w+\)/.test(tcl),
          '…both readers FORWARD it to townLast()',
          '⚠ dropping the third argument silently reopens the door — the filter just stops running');
        ok(/JSON\.stringify\(str\(pending\.get\("pos", ""\)\)\)/.test(gs),
          '…and the town always sends one, "" included');
        ok(/bot: st\.bot, result: st\.result, won: studyOK\(st\), pos: st\.pos \|\| ''/.test(PT),
          '…because Park Tables stamps which errand it was');
      }
      {
        const rc = gs.slice(gs.indexOf('func resolve_challenge'), gs.indexOf('func _fill_their_slot'));
        const posAt = rc.indexOf('if pos != "":');
        ok(posAt > 0 && posAt < rc.indexOf('played(who, won)'),
          '⚠⚠ a study is settled BEFORE any of the lines about a game');
        const branch = rc.slice(posAt, rc.indexOf('played(who, won)'));
        ok(!/retire_for_today|_fill_their_slot|learn\(/.test(branch),
          '…so it fills no square, spends no day and buys no reveal',
          'the reward is the ore and a mark in the journal');
        ok(/return -4 if won and clean else -5/.test(branch),
          '…and reports itself as -4 or -5');
      }
      ok(/if slot == -4:/.test(zone) && /if slot == -5:/.test(zone),
        '…which the room knows how to say out loud');
      ok(/if \(botWon\(st\) && !isStudy\(st\)\) \{/.test(PT),
        '⚠⚠ a study awards no star, no beaten list and no day stamp');
      ok(/if \(botAdapt && !isStudy\(st\)\)/.test(PT), '…and does not move the adaptive dial');
      {
        for (const [f, why] of [['logRepertoire', 'a study has no opening'],
                                ['logPrepFail', 'and no prep to fail'],
                                ['studyMove', 'and Vince cannot answer an endgame with a first move'],
                                ['botSystemMove', 'and a setup is not a technique']]) {
          ok(/isStudy\(st\)/.test(fn(PT, f)), '…' + why, f + '()');
        }
      }
      ok(/var tc0 = study \? tcById\(''\) : tcById\(tcPref\(\)\)/.test(PT),
        '⚠ and it has no clock  (the default is Blitz 5+1 and an endgame under five minutes is a different exercise)');
      ok(/if \(saved && \(saved\.pos \|\| ''\) !== \(study \? study\.id : ''\)\) saved = null;/.test(PT),
        '⚠⚠ a resume must be the SAME errand, or a study quietly becomes a game that can take a square');
      {
        /* ⚠⚠ EVERY BOT-SIDE REBUILD GOES THROUGH botGame(). */
        const code = PT.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        const stray = code.split('\n').filter((ln) =>
          /M\.replayGame\(/.test(ln) && !/M\.replayGame\(m\.moves/.test(ln)
          && !/moves === undefined/.test(ln));
        ok(stray.length === 0,
          '⭐⭐ every bot-side rebuild goes through botGame(); the only bare calls left are the correspondence tables',
          stray.length ? stray[0].trim().slice(0, 60) : 'clean');
        const MATCH = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-match.js'), 'utf8');
        ok(/function replayGame\(movesStr, startFen\)/.test(MATCH)
          && /C\.parseFEN\(startFen \|\| C\.START_FEN\)/.test(MATCH),
          '…and the referee will start somewhere else, defaulting to the start');
      }
      ok(/for k in \(d\.get\("positions", \{\}\) as Dictionary\):/.test(gs),
        '…a study beaten on the phone is beaten here  (a union, like everything earned)');
      {
        const win = fnGd(gs, 'win_study');
        ok(/add_ore\(int\(\(row as Dictionary\)\.get\("ore", 0\)\)\)/.test(win)
          && !/army\.append|hearts\[|retire_for_today/.test(win),
          '⚠ the ore is the whole prize — no square, and no heart it could not raise anyway');
      }

      /* ══ 28 · THE AIR ══ */
      /* his: "one ambient bed per region." */
      ok(/const BEDS := \{/.test(audio) && /"town":|"night":|"deep":|"sea":|"room":/.test(audio),
        'there is a bed for each kind of place');
      {
        const beds = audio.slice(audio.indexOf('const BEDS := {'), audio.indexOf('static func bed('));
        const ids = (beds.match(/"(town|night|room|deep|sea)":\s*\{/g) || []).length;
        ok(ids === 5, '…five of them', ids + ' found');
        /* ⚠⚠ WHOLE CYCLES PER BUFFER, NOT FREQUENCIES. */
        const hz = [...beds.matchAll(/\[(\d+), [\d.]+\]/g)].map((x) => parseInt(x[1], 10));
        ok(hz.length >= 6 && hz.every((n) => Number.isInteger(n) && n > 0),
          '…and every tone is a whole number of cycles per loop', hz.join(' '));
      }
      ok(/loop_mode = AudioStreamWAV\.LOOP_FORWARD/.test(audio) && /loop_end = count - 1/.test(audio),
        '…they loop');
      ok(/const BED_FADE/.test(audio) && /buf\[i\] = buf\[i\] \* w \+ buf\[count \+ i\] \* \(1\.0 - w\)/.test(audio),
        '⚠⚠ …and the seam is cross-faded, because noise cannot join itself',
        'the last sample and the first are unrelated numbers');
      ok(/if not is_instance_valid\(_amb\) or id == _bed_id:/.test(audio),
        '…asking for the bed that is already playing does nothing',
        '⚠ town.gd asks again every sixty seconds and a restart would BE a seam');
      ok(/or not GameState\.sound_on:/.test(fnGd(audio, '_play')),
        '…and the mute silences the footsteps too');
      ok(/func set_sound\(on: bool\) -> void:/.test(gs) && /sound_changed\.emit\(on\)/.test(gs),
        'the journal can turn it off');
      {
        const push = gs.slice(gs.indexOf('func push_to_site'), gs.indexOf('func open_url'));
        const merge = gs.slice(gs.indexOf('func merge_in'), gs.indexOf('const SCOUT_ORE'));
        ok(!/sound_on/.test(push) && !/sound_on/.test(merge),
          '⚠⚠ and the mute is a DEVICE preference — it never syncs',
          'muting the phone you play on the bus must not mute the desk [[everything-earned-syncs]]');
      }
      ok(/func _bed_now\(\) -> String:/.test(town2)
        && /au\.play_bed\(_bed_now\(\)\)/.test(town2) && /ambient = _bed_now\(\)/.test(town2),
        '⭐ the air changes with the light, on the same minute the sky does');
      {
        /* Every room names a bed that exists. */
        const known = ['town', 'night', 'room', 'deep', 'sea'];
        const named = [...GD_LIST.filter((f) => f.endsWith('.gd'))
          .map((f) => fs.readFileSync(GDF(f), 'utf8')).join('\n')
          .matchAll(/ambient = "([a-z]+)"/g)].map((x) => x[1]);
        ok(named.length >= 3 && named.every((n) => known.includes(n)),
          '…and no room asks for air that does not exist', named.join(' '));
      }

      /* ══ 29 · THE PRICES ══ */
      {
        const games = [];
        let m, re = /"un": \["([a-z-]+)", (\d+)\]/g;
        while ((m = re.exec(gs))) games.push([m[1], parseInt(m[2], 10)]);
        ok(games.length === 7, 'seven squares are bought off the rest of the site', games.length + '');
        /* ⭐⭐ EVERY ONE OF THEM MUST BE A NUMBER SOMETHING ACTUALLY BANKS. */
        const bankers = fs.readdirSync(path.join(ROOT, 'assets/games'))
          .filter((f) => f.endsWith('.html'))
          .map((f) => fs.readFileSync(path.join(ROOT, 'assets/games', f), 'utf8'))
          .concat([fs.readFileSync(path.join(ROOT, 'academy-opening-trainer.html'), 'utf8'), PROF])
          .join('\n');
        const dead = games.map((g) => g[0]).filter((id) =>
          !bankers.includes("saveScore('" + id + "'") && !bankers.includes("id === '" + id + "'"));
        ok(dead.length === 0,
          '⭐⭐ …and every one of them is a score something actually banks',
          dead.length ? 'UNWINNABLE: ' + dead.join(' ') : 'all seven have a writer');
        ok(!games.some((g) => g[0] === 'tower-defense'),
          '⛑ the bishop no longer costs a SCORE of three on a game that scores in the hundreds');
        ok(games.some((g) => g[0] === 'siege-waves' && g[1] === 3),
          '…it costs three WAVES, which is what its sentence always said');
        ok(/PJCC\.saveScore\('siege-waves', G\.wave/.test(
             fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_tower_defense.html'), 'utf8')),
          '…and Siege on Chess City banks that number');
        {
          const td = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_tower_defense.html'), 'utf8');
          const line = td.split('\n').find((l) => /saveScore\('siege-waves'/.test(l)) || '';
          ok(!/G\.endless/.test(line.slice(0, line.indexOf('saveScore'))),
            '⚠ in EVERY mode, not only Endless  (the campaign is where you would go to hold three)');
        }
        ok(/"un_say": "beat four floors of the Gauntlet"/.test(gs),
          '⚠ and the Gauntlet sentence counts what the Gauntlet banks',
          'it banks floors BEATEN, so four of them means you are standing on the fifth');
      }

      /* ══ 30 · THE PHONE ══ */
      /* his: "measure it on a phone." */
      ok(/const BASE_H := 648\.0/.test(zone) && /static func ui_scale\(n: Node\) -> float:/.test(zone),
        'there is ONE number for how big a UI pixel is');
      ok(/return maxf\(1\.0, v \/ BASE_H\)/.test(zone),
        '\u26a0\u26a0 …and it is exactly 1.0 on a desktop  (648 / 648 \u2014 nothing about this machine changed)');
      ok(/n\.get_viewport\(\)\.get_visible_rect\(\)\.size\.y/.test(zone),
        '\u26a0 asked of the VIEWPORT, not of a CanvasItem rect  (a CanvasLayer is not a CanvasItem)');
      {
        /* Everything that draws UI has to be on the lever. */
        for (const [f, src] of [['zone.gd', zone], ['town_ui.gd',
              fs.readFileSync(GDF('town_ui.gd'), 'utf8')],
              ['journal.gd', jrn], ['touch_pad.gd', pad]]) {
          ok(/TownZone\.ui_scale\(/.test(src), '…' + f + ' is on it');
        }
      }
      ok(/func _fit_camera\(lim: Rect2\) -> void:/.test(player)
        && /_cam\.zoom = Vector2\(z, z\)/.test(player),
        '\u2b50 the camera zooms to fit the window it is in');
      ok(/get_viewport\(\)\.size_changed\.connect\(func\(\) -> void: _fit_camera\(lim\)\)/.test(player),
        '…and again when the window changes  (rotating a phone asks for a different amount of world)');
      {
        /* ⭐⭐ AND IT IS ARITHMETIC, NOT A PROMISE. */
        const BASE = { w: 1152, h: 648 };
        const rects = [];
        for (const f of GD_LIST.filter((x) => x.endsWith('.gd'))) {
          const src = fs.readFileSync(GDF(f), 'utf8');
          const m = /^const (?:ROOM|GROUND_RECT) := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/m.exec(src);
          if (m) rects.push({ f: f, w: parseFloat(m[3]), h: parseFloat(m[4]) });
        }
        const small = rects.filter((r) => r.w < BASE.w || r.h < BASE.h);
        ok(rects.length >= 6 && small.length === 0,
          '\u2b50\u2b50 …and on a desktop it is a NO-OP: every room is at least as big as the 1152x648 window',
          small.length ? small.map((r) => r.f + ' ' + r.w + 'x' + r.h).join(' · ')
                       : rects.length + ' rooms, smallest ' +
                         Math.min(...rects.map((r) => r.w)) + 'x' + Math.min(...rects.map((r) => r.h)));
        /* ⚠ AND THE PROJECT MUST NOT MOVE THAT WINDOW. */
        const proj = fs.existsSync(GDF('project.godot'))
          ? fs.readFileSync(GDF('project.godot'), 'utf8') : '';
        ok(!/window\/size\/viewport_height/.test(proj),
          '…and nothing has moved the base viewport out from under that 648');
      }
      {
        const town3 = town2;
        const gr = /const GROUND_RECT := Rect2\([^,]+, [^,]+, [\d.]+, ([\d.]+)\)/.exec(town3);
        const cap = /max_view = Vector2\(0\.0, ([\d.]+)\)/.exec(town3);
        ok(gr && cap && parseFloat(cap[1]) < parseFloat(gr[1]),
          '\u26a0\u26a0 the map does not hand over its whole length on a tall screen',
          gr && cap ? 'shows at most ' + cap[1] + ' of ' + gr[1] + ' deep'
                    : 'no GROUND_RECT or no cap');
        ok(/@export var max_view: Vector2 = Vector2\.ZERO/.test(zone),
          '…and every other room is uncapped, which is what ZERO means');
      }
      ok(/var wrap: bool = TownZone\.ui_scale\(self\) > 1\.4/.test(zone)
        && /"Ore %d"/.test(zone),
        '\u26a0 the stat row folds in two when the window is narrow  (one row ran under the Journal tab)');
      ok(/b\.clip_text = true/.test(fs.readFileSync(GDF('town_ui.gd'), 'utf8')),
        '\u26a0 and a long menu row is clipped rather than bled off the edge of the screen');
      ok(/var narrow: bool = w \/ k < 520\.0/.test(jrn),
        '\u26a0\u26a0 the journal asks "is this narrow" in BASE units, not viewport units',
        'w has already been multiplied — asking in viewport units is asking about a desktop');

      /* ══ 31 · THE FRONT OF THE ARCADE ══ */
      /* his: "build out the outside of the arcade building. Make it look nice." */
      /* ⛑ CAME OFF THE MAP WITH THE ROOM, 2026-10-03 (his: "take the arcade completely away"). */
      ok(!/ArcadeFront/.test(town2), 'the Arcade\'s front went with it');
      {
        /* …and only the ones we chose do. */
        const subs = [...town2.matchAll(/class (\w+) extends TownDoor:/g)]
          .map((m) => m[1]).sort();
        /* ⭐ CheckerHome JOINED 2026-09-21. */
        /* his: "make Nate's home a checker" */
        /* ⭐ AssemblyShack JOINED 2026-09-22. */
        /* his: "more of a shack than a house" */
        /* ⛑ TheaterFront LEFT and TableGrove ARRIVED, both 2026-09-23 and both his. */
        /* ⛑ TownSeam JOINED 2026-09-27 — the end of a road, and the ONLY TownDoor subclass
           that is not a building: it draws nothing and changes the window. */
        /* ⛑ ArcadeFront LEFT 2026-10-03 (his). */
        const want = ['AssemblyShack', 'CheckerHome', 'CityGate', 'Rowboat',
                      'TableGrove', 'TownSeam'];
        ok(subs.join(' ') === want.join(' '),
          '…and the bespoke buildings are exactly the ones we chose',
          subs.join(' ') || 'none');
      }

      /* ══ 31b · THE REPLAY THEATER ══ */
      /* his: "Let's make a theater building — deck it out like you did the arcade, and call it replay theater." */
      /* ⛑⛑ IT CAME OFF THE MAP 2026-09-23. */
      /* his: "Let's remove the Replay theater" */
      const theater = fs.readFileSync(GDF('theater.gd'), 'utf8');
      ok(!/TheaterFront/.test(town2) && !/theater\.tscn/.test(town2)
        && !/THEATER_AT/.test(town2),
        'nothing on the map opens the Replay Theater, and its lot went with it');
      ok(fs.existsSync(GDF('theater.tscn')) && /PARKED, NOT DELETED/.test(theater),
        '…and the room is PARKED, not deleted — and its own first line says so');

      /* ══ 32 · THE RHYTHM ══ */
      ok(tune('energy_cap') > 0 && tune('game_cost') > 0 && /var energy_cap: int = Tuning\.now\(\)\.energy_cap/.test(gs),
        'the two numbers that decide how long the campaign takes are in one place: the dials',
        tune('energy_cap') + ' / ' + tune('game_cost'));
      {
        /* ⚠ A NUMBER IN A COMMENT IS NOT A MEASUREMENT. */
        const rows = [...TUNE_GD.matchAll(/^##\s+(\d+) \/ (\d+)\s+(\d+)\s/gm)]
          .map((m) => [+m[1], +m[2], +m[3]]);
        const wrong = rows.filter((r) => Math.floor(r[0] / r[1]) !== r[2]);
        ok(rows.length === 4 && wrong.length === 0,
          '…and every row of the table beside them divides out',
          wrong.length ? wrong.map((r) => r[0] + '/' + r[1] + '\u2260' + r[2]).join(' ')
                       : rows.length + ' rows, all true');
      }
      ok(!/"energy_cap": energy_cap/.test(gs),
        '\u26a0\u26a0 the cap is NOT saved, so lowering it takes effect on the next load',
        'it used to be, which meant his pick would have looked like it did nothing');
      ok(/@export var energy_cost: int = -1/.test(chal)
        && /return Tuning\.now\(\)\.game_cost if energy_cost < 0 else energy_cost/.test(chal),
        '\u26a0 every bench seat charges the standard price rather than a literal 10',
        'a price typed on eight seats is a constant that cannot be changed');
      {
        /* the two that price themselves are dials of their own: two games each, today. */
        const dep = fs.readFileSync(GDF('depths.gd'), 'utf8');
        const both = [/energy_cost = Tuning\.now\(\)\.mine_cost/.test(dep), /_ceo\.energy_cost = Tuning\.now\(\)\.ceo_cost/.test(hall)];
        ok(both[0] && both[1] && tune('mine_cost') >= 0 && tune('ceo_cost') >= 0,
          '…and the shaft and the far chair price themselves off dials of their own', tune('mine_cost') + ' and ' + tune('ceo_cost'));
      }
      ok(/func games_left\(\) -> int:/.test(gs) && /games_left\(\)/.test(jrn),
        '\u2b50 and the journal prints how many you have left today',
        'a pacing rule nobody can see the edge of is not a pacing rule');

      /* ══ 33 · THE BOARD IS AN OPENING YOU PLAY INTO ══ */
      /* his: "you should only be able to make legal moves and you can't attack the enemy. Basically, you can set up your opening." */
      ok(!/func track\(|var ghost|_draw_ghost|trail_step/.test(gs + town2),
        '⛑ yesterday\u2019s ghost is gone from the state AND from the map',
        'a removal that leaves the recorder running is a save still growing for nothing');

      ok(/func legal_moves\(slot: int\) -> Array:/.test(gs)
        && /func move_piece\(slot: int, f: int, r: int\) -> bool:/.test(gs)
        && !/func place_piece\(/.test(gs),
        'a piece MOVES rather than being placed, and free placement is gone',
        'two ways to put a piece on a square is two sets of rules');
      ok(/if not legal_moves\(slot\)\.has\(to\):\s*\n\s*return false/.test(gs),
        '⚠⚠ …and the legality is asked in ONE place',
        'the room lights the squares from the same list, so a cell can only offer a move '
        + 'this function would allow');
      ok(/for m in GameState\.board\.legal_moves\(_carry\):/.test(hall),
        '…and the room LIGHTS that same list rather than holding a second opinion',
        'a room that lights a square the rules refuse is worse than a room that lights none');
      ok(/func open_at\(f: int, r: int\) -> bool:/.test(gs)
        && /r >= ARRANGE_LO and r <= ARRANGE_HI/.test(gs)
        && /const ARRANGE_LO := 2/.test(gs),
        '⚠ "you cannot attack the enemy" is a WALL, not a rule',
        'there are no captures at all and their two ranks are simply not squares — nothing '
        + 'has to know a white piece exists');
      /* ══ NOTHING STANDS ON ANYTHING — 2026-09-08 ══ */
      /* his: "you shouldn't be able to move pieces on top of each other, your own or enemy's... You should have to move pawns first before the bishops behind them." */
      ok(/and not blocked_at\(f, r\)/.test(gs),
        '⛑⛑ an open square is one with NOBODY on it, won or not',
        'the picture and the rules disagreed about who is standing where, and the picture '
        + 'was right');
      {
        const bl = fnGd(gs, 'blocked_at');
        ok(/for i in ROSTER\.size\(\)/.test(bl) && !/\barmy\b/.test(bl),
          '   …and it walks the whole ROSTER, not the pieces you own',
          'walking `army` is the bug itself — an unwon piece is drawn on its home square, '
          + 'so it is on the board whether you have won it or not');
        ok(/for i in army/.test(fnGd(gs, 'slot_at')),
          '   while slot_at STAYS narrow — it answers WHO, and a cell prints that name',
          'widening it would hand the player the whole cast on their first visit, which is '
          + 'the one thing the blank nameplates exist to stop');
        ok(/GameState\.board\.blocked_at\(f, r\)/.test(hall)
          && /Somebody is already standing there\./.test(hall),
          '   and the refusal names the right reason',
          '"the Bishop cannot reach that square" is a lie about a square it can see');
      }
      /* ══ AND YOU CAN ALWAYS PUT IT DOWN AGAIN — 2026-09-09 ══ */
      /* his: "we need to make the assembly so you can put the piece back where you find it. Right now you can't do that." */
      {
        const drop = fnGd(hall, 'drop_at');
        const iBack = drop.indexOf('GameState.board.cell_of(slot) == Vector2i(f, r)');
        const iMove = drop.indexOf('GameState.board.move_piece(slot, f, r)');
        ok(iBack > -1 && iMove > -1 && iBack < iMove,
          '⛑⛑ a piece can always go back on the square it came from',
          'and the branch is BEFORE move_piece — after it, it is unreachable code');
        /* ⚠ THE COUNT IS WHAT THE PIRC DOOR READS. */
        /* ⚠ IT READS _put_back(), NOT A SLICE OF drop_at. */
        ok(iBack > -1 && !/setup_moves/.test(fnGd(hall, '_put_back')),
          '   …and putting it back costs no move',
          'six put-backs must not open the door six moves of chess opens');
        ok(/relabel\("Put it back"\)/.test(hall) && /if slot == carry:/.test(hall),
          '   and the square it came from SAYS so while you are holding it',
          'the room skips drawing a piece that is in your hands, so that square reads as '
          + 'empty — with no prompt there is nothing to walk up to and nothing to press');
        /* ⚠ THE BANNER WAS THE OTHER HALF OF THE TRAP. */
        const pick = fnGd(hall, 'pick_up');
        ok(/legal_moves\(slot\)\.size\(\)/.test(pick) && /Put it back where it was/.test(pick),
          '   and it does not promise lit squares it has not got',
          'an opening-position bishop or rook has no legal move at all now');
      }
      /* ══ THE ERRAND COMES BACK — 2026-09-09 ══ */
      /* his: "Does the chess game have to open a new window... can we have it close after the game? With the option to review in-game at least?" */
      {
        ok(/url \+= \("&" if url\.contains\("\?"\) else "\?"\) \+ "from=town"/.test(fnGd(gs, 'open_url')),
          '⛑⛑ every tab the town opens knows where it came from',
          'six callers reach open_url and every one of them strands you — marking them one '
          + 'at a time is how the seventh gets forgotten');
        /* ⚠⚠ READ THE FUNCTION, NOT THE FILE. */
        const townFn = (PT.match(/function from\(\) \{[\s\S]*?\n  \}/) || [''])[0];
        ok(/sessionStorage\.setItem\(KEY/.test(townFn) && /sessionStorage\.getItem\(KEY/.test(townFn),
          '   and the Park Tables REMEMBERS it rather than re-reading the URL',
          'replaceState on sitting down strips the query, which is the one moment the way '
          + 'home has to survive');
        /* ⚠⚠ THE ESCAPE HATCH MUST NOT SHARE A FAILURE WITH THE ROOM IT ESCAPES. */
        const app = PT.indexOf("var TOWN_KEY") >= 0 ? -1 : PT.indexOf('window.PTTown');
        ok(app > -1 && app < PT.indexOf('function route()'),
          '   and the way home is its OWN script, above the app that needs a backend',
          'a player stranded because the chess room would not boot is the whole point of it');
        ok(/window\.close\(\)/.test(PT) && /\/games\/checker-town\//.test(PT),
          '   and it closes the tab, or WALKS back when there is no tab to close',
          'a popup blocker turns the open into a navigation, and this page is bookmarkable '
          + '— a button that silently does nothing is worse than a slow one');
        ok(/Review this game[\s\S]{0,400}data-town-back/.test(PT),
          '   and the review is offered BEFORE the door out, which is the order he asked for',
          '"with the option to review in-game at least"');
        /* ⛑⛑ AND THE INSTALLED APP HAS NO TAB TO OPEN. manifest.json is `display. */
        const open = fnGd(gs, 'open_url');
        ok(/display-mode: standalone/.test(open) && /navigator\.standalone/.test(open)
          && /w\.location\.href = u; return;/.test(open),
          '   …and in the installed app it navigates instead of popping a tab',
          'a _blank open from a standalone iOS app throws the player out into Safari');
        ok(/var w = window\.top;/.test(open),
          '   asking window.TOP, because the game runs inside an iframe',
          'the iframe is not in standalone mode — the page around it is');
      }
      /* ══ A MENU ROW IS A THUMB TALL — 2026-09-09 ══ */
      /* his: "the mobile buttons don't really work well… I can't test the park table thing because the buttons work poorly." */
      {
        const ui = fs.readFileSync(GDF('town_ui.gd'), 'utf8');
        ok(/const FINGER_CSS := 44\.0/.test(ui)
          && /maxf\(OPT_H \* k, \(FINGER_CSS \+ GAP_CSS\) \* _css_unit\(\)\)/.test(ui),
          '⛑⛑ a conversation row is at least 44 CSS px of thumb',
          'and the STRIDE carries the gap as well as the target — flooring the stride and '
          + 'then subtracting the gap left a 38px button, which is the thing you actually hit');
        ok(/opt_h - GAP_CSS \* _css_unit\(\)/.test(ui),
          '   …with air between the rows, so a near miss lands on NOTHING',
          'stacked rows do not make you miss, they make you hit the neighbor — "Sit down" '
          + 'and "Leave it where it is" are one bad tap apart');
        /* ⚠⚠ THE TRAP THAT WOULD HAVE MADE THIS SILENTLY WRONG ON HIS ACTUAL PHONE. */
        const css = fnGd(ui, '_css_unit');
        ok(/devicePixelRatio/.test(css) && /dpr \* vp\.x \/ win\.x/.test(css),
          '   and it divides the DEVICE pixel ratio back out',
          'DisplayServer.window_get_size() is in DEVICE pixels on the web — measured at dpr '
          + '1/2/3, a 264 CSS-px canvas reports 264/528/792 — so a dpr-3 iPhone would have got '
          + 'a third of the target it was promised');
      }
      /* ══ AND THE BOTTOM OF THE GAME IS ON THE SCREEN ══ */
      {
        const ct = fs.readFileSync(path.join(ROOT, 'games/checker-town/index.html'), 'utf8');
        ok(/game-frame-wrap fits-phone above-fold ct-frame/.test(ct),
          '⛑⛑ the Checker Town cabinet ends ABOVE the fold on a phone',
          'a control pinned to the bottom edge of a frame whose bottom edge is off the '
          + 'screen is a control that does not exist');
        ok(/#ct-stage \{ max-height: min\(calc\(100svh - 48px\), calc\(100svh - 210px\)\); \}/.test(ct),
          '   …and the placeholder stage carries the same cap, so the cabinet does not jump',
          'the stage is this page\u2019s own element and the classes only reach the iframe');
        /* ⛑ 2026-09-09. */
        /* his: "the Walk the town, fill the assembly should be removed, that description below the game. Then shorten the Chess is Played here description." */
        ok(!/Walk the town, and fill the Assembly/.test(ct)
          && /The chess is played here, on the site/.test(ct),
          '   and the page keeps ONE line under the game, not two',
          'the surviving line is the warning before a tab opens — the only thing down there '
          + 'the game itself has no way to say');
      }
      /* ══ ONE PRESS, NO DIALOGUE — 2026-09-09 ══ */
      /* his: "spacebar should pick up the piece and set it down. There shouldn't be a dialogue box to pick it up or leave it. Trying to put it somewhere erroneously or off the board, etc, should result in it going back to where it was picked up initially." */
      {
        const cell = hall.slice(hall.indexOf('class Cell extends Interactable'));
        const act = cell.slice(cell.indexOf('func interact'), cell.indexOf('func speech_top'));
        ok(/hall\.pick_up\(slot\)/.test(act) && !/open_talk/.test(act),
          '⛑⛑ pressing USE on your own piece picks it up — no box, no question',
          '"Leave it where it is" was a do-nothing answer to a question asked every time, in '
          + 'a room whose whole verb is moving pieces');
        /* ⭐ THE LINE IS THE THING THE MENU WAS FOR. */
        ok(/say\(GameState\.board\.square_says\(slot\)/.test(act),
          '   …and the piece still says its line, over its own head, for free',
          'a bubble costs no press');
        /* ⚠ THE REFUSAL PATH SPECIFICALLY. drop_at calls _put_back() twice. */
        const refuse = fnGd(hall, 'drop_at');
        ok(/cannot reach that square[\s\S]{0,80}_put_back\(\)/.test(refuse),
          '   and a refused move puts the piece BACK, rather than leaving it in your hands',
          'on a board where most pieces start with no legal move at all, a wrong press used '
          + 'to leave you holding something with nowhere to put it');
        ok(!/setup_moves/.test(fnGd(hall, '_put_back')),
          '   …for no move, because setup_moves is what the Pirc door counts',
          'six put-backs must not open what six moves of chess opens');
        /* ⚠⚠ A DOOR THAT MOVED, NOT A FEATURE THAT WAS DROPPED. */
        ok(/watch_replay/.test(hall) && /Show me the game that won/.test(hall),
          '   and the replay kept a door — the lectern has it now',
          'the cell menu was its only way in; deleting the menu would have deleted the feature');
      }
      /* ══ THE BOTTOM LINE IS FOUR KEYS, AND THEN IT IS GONE ══ */
      /* his: "Remove the 'the road runs south' — I don't even know what that means. WASD, arrows, Enter, and Spacebar should be the only text on the bottom, and it should disappear after a moment." */
      {
        const zone = fs.readFileSync(GDF('zone.gd'), 'utf8');
        const ui = fs.readFileSync(GDF('town_ui.gd'), 'utf8');
        ok(/return "WASD  ·  Arrows  ·  Enter  ·  Spacebar"/.test(zone),
          '⛑⛑ the hint names the four keys and nothing else');
        ok(/TouchPad\.probably_touch\(\)/.test(fnGd(zone, 'default_hint')),
          '   …except on a phone, which has no Spacebar to name',
          'naming four keys to somebody holding a piece of glass is the one thing this '
          + 'function has always refused to do');
        const suffix = ['academy', 'arcade', 'depths', 'island', 'park', 'sea', 'stairwell', 'town']
          .filter((z) => /default_hint\(\) \+/.test(fs.readFileSync(GDF(z + '.gd'), 'utf8')));
        ok(suffix.length === 0,
          '   and no zone appends a wayfinding aside to it any more',
          suffix.length ? suffix.join(', ') + ' still do'
            : 'eight zones clean — a room that needs to say where the exit is wants a sign, '
              + 'not the control legend');
        ok(/const HINT_SECS := 7\.0/.test(ui)
          && /if _hint_left > 0\.0:[\s\S]{0,200}_hint = ""/.test(fnGd(ui, '_process')),
          '   and it takes itself down after a moment',
          'the box has no background in IDLE, so what is left is the town');
        ok(/if _mode != SAY:/.test(fnGd(ui, '_process').split('_hint_left').pop() || ''),
          '   …with the clock ABOVE the SAY guard, which is the mode it runs in',
          'below that early return the walking-around line would never tick at all');
      }
      /* ══ AND THE LOADING SCREEN IS OURS ══ */
      /* his: "does it HAVE to show Godot loading screen or can it be a custom loading screen?" */
      {
        const built = fs.readFileSync(path.join(ROOT, 'assets/games/checker-town/index.html'), 'utf8');
        ok(/id = 'ct-boot'/.test(built) && /#status-splash \{ display: none/.test(built),
          '⛑⛑ the built game boots on OUR loading screen, not the engine\u2019s',
          'a #242424 rectangle with the Godot logo on it was the first thing anyone saw');
        ok(!/and a road south/.test(built),
          '   …and it does not repeat the phrase he struck out of the game',
          'a wait wants managing, not a riddle');
        const gen = fs.readFileSync(path.join(ROOT, 'tests/gen-checkertown.js'), 'utf8');
        ok(/html\/head_include=/.test(gen) && !/custom_html_shell="res:/.test(gen),
          '   and it is a head include, not a private copy of Godot\u2019s boot script',
          'a custom shell owns the feature detection, the service-worker retry and the '
          + 'progress plumbing, and drifts silently on every engine update');
        ok(/head_include/.test(gen.slice(gen.indexOf('const presetSrc'))) ||
           /stamped the loading screen/.test(gen),
          '   and an EXISTING preset gets it re-stamped, not just a fresh one',
          'the preset is only written when absent, so every machine that already had one '
          + 'would never have seen the loading screen');
      }
      {
        const lm = fnGd(gs, 'legal_moves');
        ok(/at\.y == PAWN_RANK and open_at\(at\.x, at\.y - 2\)/.test(lm),
          '⚠ forward is r MINUS one, and two only from home',
          'we sit on the black side: our pawns walk toward rank one');
        ok(!/at\.x [+-] 1, at\.y - 1/.test(lm),
          '…and a pawn has no diagonal at all, because nothing can be taken');
        ok(/"n":[\s\S]{0,400}Vector2i\(1, 2\)[\s\S]{0,300}Vector2i\(-1, 2\)/.test(lm),
          'a knight has all eight jumps');
        /* ⚠⚠ EACH BRANCH PINNED TO ITS OWN LINE. */
        ok(/"b":\s*\n\s*for d in diag:/.test(lm) && /"r":\s*\n\s*for d in orth:/.test(lm)
          && /"q":\s*\n\s*for d in diag \+ orth:/.test(lm)
          && /_ray\(out, at, d\.x, d\.y\)/.test(lm),
          '…and the sliders are rays that stop where something stands');
      }
      ok(/func castle_ready\(\) -> bool:/.test(gs)
        && /cell_of\(4\) == Vector2i\(3, HOME_RANK\)/.test(gs)
        && /cell_of\(7\) == Vector2i\(0, HOME_RANK\)/.test(gs)
        && /open_at\(1, HOME_RANK\) and open_at\(2, HOME_RANK\)/.test(gs),
        '⭐ castling is in, kingside only, from the two home squares',
        'the Pirc needs it — and there is no check to be in, so those halves of the rule '
        + 'have nothing here to test');
      ok(/_put\(7, Vector2i\(2, HOME_RANK\)\)/.test(gs),
        '⚠⚠ …and it moves the ROOK too, as one move',
        'a king walking e8-f8-g8 is two moves and opens nothing, which is correct');
      ok(/func reset_board\(\) -> void:/.test(gs) && /board_layout\.clear\(\)/.test(gs)
        && /setup_moves = 0/.test(gs),
        '⭐ and there is a way back — a pawn cannot walk backwards',
        'without it a board you have pushed around is a board you are stuck with');
      ok(/"id": "reset", "text": "Put every piece back\."/.test(hall)
        && /GameState\.board\.reset_board\(\)/.test(hall),
        '…offered by the Lectern, and only once something has moved',
        'on an untouched board that object behaves exactly as it did before');
      ok(/board_layout\.erase\(str\(slot\)\)/.test(gs),
        '⚠ back home is the ABSENCE of an entry, so an untouched board saves nothing',
        '…and the layout survives the roster being reordered, which its own header requires');

      /* ══ 34 · THE PIRC OPENS A DOOR ══ */
      /* his: "If you set up the pirc (at least 6 moves in) you can enter a secret room." */
      {
        const sysj = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-systems.js'), 'utf8');
        /* ⭐⭐ THE TOWN INVENTS NO CHESS, AND THIS IS WHAT THAT COSTS TO PROVE. */
        const row = (sysj.match(/pircb:[\s\S]{0,400}?'\*':\s*\[([^\]]+)\]/) || [])[1] || '';
        const book = row.split(',').map((x) => x.trim().replace(/'/g, ''))
          .filter(Boolean).slice(0, 6);
        const pirc = [...gs.matchAll(/\n\t(\d+): Vector2i\((\d), (\d)\),\s+# ([a-z-]+\s*\S*)/g)]
          .map((m) => ({ slot: +m[1], f: +m[2], r: +m[3] }));
        /* the town's (f, r) back into a board square. */
        const sq = (f, r) => 'hgfedcba'[f] + (r + 1);
        const homes = { 4: 'e8', 5: 'f8', 6: 'g8', 7: 'h8', 10: 'c7', 11: 'd7', 14: 'g7' };
        const got = pirc.map((p) => homes[p.slot] + sq(p.f, p.r)).sort();
        /* O-O is one book move and two of the town's squares — the rook's is implied by it. */
        const want = book.filter((m) => m !== 'e8g8').concat(['e8g8', 'h8f8']).sort();
        ok(pirc.length === 7 && got.length === 7 && got.join(' ') === want.join(' '),
          '⭐⭐ the town\u2019s Pirc IS the site\u2019s Pirc, square for square',
          got.join(' ') + (got.join(' ') === want.join(' ') ? '' : '   want: ' + want.join(' ')));
        ok(/const PIRC_MOVES := 6/.test(gs)
          && /if setup_moves < PIRC_MOVES:\s*\n\s*return false/.test(gs),
          '…and it wants six moves as well as seven squares',
          'his words: "at least 6 moves in"');
        ok(/func pirc_progress\(\) -> int:/.test(gs),
          '⚠ progress counts SQUARES, not moves',
          'five squares right is four moves, and "4 of 6" would be a lie');
      }
      {
        const sec = fs.readFileSync(GDF('secret.gd'), 'utf8');
        const scn = fs.readFileSync(GDF('secret.tscn'), 'utf8');
        ok(/class_name SecretRoom\s*\n/.test(sec) && /extends TownZone/.test(sec)
          && /path="res:\/\/rooms\/secret\.gd"/.test(scn),
          'the room behind the west wall exists, and its scene loads it');
        ok(/scene_path = "res:\/\/rooms\/secret\.tscn"/.test(hall)
          && /_secret\.visible = false/.test(hall),
          '⚠⚠ …and the door is INVISIBLE until the opening is set, not locked',
          'a door you can see and cannot open is a puzzle announcing itself');
        ok(/var found := GameState\.board\.pirc_set\(\)/.test(hall)
          && /GameState\.board\.board_changed\.connect\(_refresh\)/.test(hall),
          '…and it appears on the move that opens it, without leaving the room');
        ok(/if found and not _secret\.visible:/.test(hall),
          '⚠ the line is said ONCE',
          'a banner every time you walk past a door you have found is the room nagging you');
        ok(/scene_path = "res:\/\/rooms\/hall\.tscn"/.test(sec) && /TownExit\.new\(\)/.test(sec),
          '…and there is a way out of it');
        const stone = sec.slice(sec.indexOf('func _draw_stone'));
        ok(/for slot in GameState\.board\.PIRC:/.test(stone) && /ChessArt\.draw_piece/.test(stone),
          '⭐ the one thing in it is the board that opened it, read live from the rule',
          'a picture, not lore — the naming and the contents are his');
        /* ⛔ AND NOTHING IN IT IS INVENTED. */
        const signs = [...sec.matchAll(/sign_text = "([^"]*)"/g)].map((m) => m[1]);
        ok(signs.every((x) => x === 'Out') && !/TownNPC|TownChallenger/.test(sec),
          '⛔ …and it names nobody and says nothing that is his to write',
          'signs in the room: ' + (signs.join(', ') || 'none'));
        ok(!/_secret\.sign_text/.test(hall),
          '…nor does the door wear a sign, which would be a secret announcing itself');
        ok(/const ROOM := Rect2\(-576\.0, -450\.0, 1152\.0, 900\.0\)/.test(sec),
          '⚠⚠ …in a room exactly as wide as the window',
          'narrower shows gray down both sides; wider pans the camera off the walls and '
          + 'the room reads as a void with a stone in it');
      }

      {
        /* ⚠⚠ The sync contract: a new synced field = five places — save, load, push, merge_in, townMerge. */
        const push = gs.slice(gs.indexOf('var payload := JSON.stringify({'),
                              gs.indexOf('JavaScriptBridge.eval', gs.indexOf('func push_to_site')));
        const sent = [...push.matchAll(/"([a-z_]+)":/g)].map((m) => m[1]).sort();
        const merge = fn(PROF, 'townMerge');
        const merged = [...merge.matchAll(/local\.([a-z_]+)\s*=/g)].map((m) => m[1])
          .filter((k, i, a) => a.indexOf(k) === i).sort();
        const missed = sent.filter((k) => merged.indexOf(k) < 0);
        const orphan = merged.filter((k) => sent.indexOf(k) < 0);
        /* \u26a0\u26a0 BOTH DIRECTIONS, AND NOT A FLOOR. */
        ok(missed.length === 0 && orphan.length === 0 && sent.length >= 15,
          '\u2b50\u2b50 the field the town pushes and the field the site merges are the SAME SET',
          (missed.length ? 'DROPPED ON ARRIVAL: ' + missed.join(' ') + '  ' : '') +
          (orphan.length ? 'MERGED BUT NEVER SENT: ' + orphan.join(' ') : sent.length + ' fields'));
        ok(/local\.hearts = maxPerKey\(local\.hearts, remote\.hearts\)/.test(merge),
          '\u26d1\u26d1 hearts is a DICTIONARY and is merged per person',
          'Math.max(+{"Auston":4}) is NaN, so every push used to write the integer 0 over it');
        /* ⛑ `words` was a fourth until 2026-09-07. */
        ok(/local\.positions = union\(/.test(merge)
          && /local\.hats = union\(/.test(merge) && /local\.razzed = union\(/.test(merge),
          '\u26a0 the three sets of things that have happened to you are unions');
        ok(/if \(!local\.hat && remote\.hat\)/.test(merge)
          && /if \(!local\.board_layout \|\| !Object\.keys\(local\.board_layout\)\.length\)/.test(merge),
          '\u26a0\u26a0 …and the two PREFERENCES are sticky, not unions',
          'a union would put a hat you took off back on, and build a board nobody made');
      }
      {
        const ban = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-banner.js'), 'utf8');
        ok(/PJCC\.townBoard = function \(\)/.test(PROF) && /PJCC\.townBoard/.test(ban),
          'the site can ask for the board you built');
        ok(/"p": piece_at\(slot\)/.test(gs),
          '\u26a0 the banner is sent the REAL piece, not the town\u2019s custom mark',
          'Michael is drawn with his own glyph in the room and the site can only draw the six');
        /* ⚠⚠ AND THE BANNER HOLDS NO COPY OF THE ROSTER. */
        const cast = [...gs.matchAll(/"who": "([A-Za-z ]+)"/g)].map((m) => m[1]);
        const banCode = ban.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        ok(cast.length >= 10 && !cast.some((w) => banCode.includes(w)),
          '\u2b50\u2b50 …and not one character\u2019s name is written into the renderer');
        /* the square names it reads out, checked against the roster the town ships. */
        const B = require(path.join(ROOT, 'assets/js/pjcc-banner.js'));
        ok(B.sqName(0, 6) === 'h7' && B.sqName(7, 7) === 'a8' && B.sqName(0, 0) === 'h1',
          '\u26a0\u26a0 …and it names a square the way the room does',
          'we sit on the BLACK side: column 0 is the h-file and row 0 is rank one \u2014 ' +
          [B.sqName(0, 6), B.sqName(7, 7), B.sqName(0, 0)].join(' '));
        ok(/host\.parentNode\.removeChild\(host\)/.test(ban),
          '\u26a0 an empty board removes its own block  (sixty-four empty squares is a chore with a frame round it)');
        const dsr = fs.readFileSync(path.join(ROOT, 'dossier.md'), 'utf8');
        ok(/PJCCBanner\.mount/.test(dsr) && /pjcc-banner\.js/.test(dsr) && /pjcc-pieces\.js/.test(dsr),
          '…and the Dossier draws it, with the glyphs loaded before it');
        /* ⚠⚠ AND IT IS RUN, NOT JUST READ. */
        const shot = await page.evaluate((srcs) => {
          srcs.forEach((src) => {
            const el = document.createElement('script');
            el.textContent = src;
            document.head.appendChild(el);
          });
          const board = [{ p: 'r', who: 'Vince', f: 7, r: 7 },
                         { p: 'p', who: 'Milo', f: 0, r: 6 },
                         { p: 'q', who: 'Michael', f: 3, r: 3 }];
          function paint(rows) {
            const c = document.createElement('canvas');
            document.body.appendChild(c);
            const drew = window.PJCCBanner.draw(c, rows, { cell: 30 });
            const g = c.getContext('2d');
            const d = g.getImageData(0, 0, c.width, c.height).data;
            const seen = {};
            for (let i = 0; i < d.length; i += 4) seen[d[i] + ',' + d[i + 1] + ',' + d[i + 2]] = 1;
            return { drew: drew, colors: Object.keys(seen).length, w: c.width, h: c.height };
          }
          const bare = paint([]);
          const full = paint(board);
          return { bare: bare, full: full, glyphs: !!window.PJCCPieces,
                   label: window.PJCCBanner.label(board) };
        }, [fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-pieces.js'), 'utf8'),
            fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-banner.js'), 'utf8')]);
        ok(shot.glyphs === true,
          '\u26a0 …with the real glyph module loaded, not the plain-disc fallback',
          'the first version of this check injected only the banner, so the branch it was ' +
          'aiming at was dead code in the page and the mutation went blind');
        /* ⭐⭐ DIFFERENTIAL, so a frame with nothing in it can never satisfy it. */
        ok(shot.full.drew === true && shot.full.colors > shot.bare.colors + 4,
          '\u2b50\u2b50 …and the renderer actually paints PIECES in a browser',
          shot.bare.colors + ' colors empty \u2192 ' + shot.full.colors + ' with three pieces, on ' +
          shot.full.w + '\u00d7' + shot.full.h);
        ok(shot.label === 'Your Assembly board, 3 of 16: Vince on a8, Milo on h7, Michael on e4.',
          '…and reads itself out in board squares for anybody who cannot see it',
          shot.label);
      }

      /* ══ 38 · THE TRIBUNE, THE SUN, THE CLOCK AND THE DRAIN (2026-09-14) ══ */
      {
        const rd = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n');
        const code = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const clk8 = code(rd('clock.gd')), pap8 = code(rd('paper.gd')), zn8 = code(rd('zone.gd'));
        const gs8 = code(rd('game_state.gd')), twn8 = code(rd('town.gd')), jr8 = code(rd('journal.gd'));
        const mkt8 = code(rd('market.gd'));

        ok(/const MASTHEAD := "THE CHECKER TRIBUNE"/.test(pap8), 'the paper is the Checker Tribune');
        const list = (name) => {
          const m = new RegExp('const ' + name + ' := \\[([\\s\\S]*?)\\n\\]').exec(pap8);
          return m ? [...m[1].matchAll(/^\t"((?:[^"\\]|\\.)*)",?$/gm)].map((x) => x[1]) : [];
        };
        const bureau = list('BUREAU'), townNews = list('TOWN_NEWS');
        ok(bureau.length >= 6 && townNews.length >= 6
          && bureau.every((b) => /Bureau|ICB|Expanse Branch|checkpoint|Construction Co/i.test(b)),
          'a question for the Bureau and a town column in every edition, and every question is about the Bureau and its friends',
          bureau.length + ' questions, ' + townNews.length + ' town items');
        const hidden = /Alpine|Jenkins|53rd|Release Act|Convict|Subject|P&JCC|Pontiac|manifest|Robert|queen|Michael/i;
        const leaks = bureau.concat(townNews).filter((l) => hidden.test(l));
        ok(leaks.length === 0, '⚠⚠ …and nothing in it comes off a hidden page or a slow-rolled card', leaks.join(' | ') || 'clean');
        ok(!/\b(barks?|woofs?|growls?)\b|Princess (said|says)|(Milo|Crockett) (said|says)|Argus (said|says)/i.test(bureau.concat(townNews).join(' ')),
          '…and no animal says a word in it  [ONLY HUMANS TALK]');
        ok(/TownPaper\.pick\(TOWN_NEWS, "town"\)/.test(fnGd(pap8, 'edition')) && /TownPaper\.pick\(BUREAU, "bureau"\)/.test(fnGd(pap8, 'edition'))
          && /SkyDaily\.hash_str\(TownSeason\.date_key\(\) \+ "#" \+ salt\)/.test(fnGd(pap8, 'pick')),
          '…picked by the date, so everybody in town reads the same edition');
        ok(/TownClock\.time_text\(TownClock\.lamps_on\(\)\)/.test(pap8) && /TownClock\.time_text\(TownClock\.lamps_on\(\)\)/.test(mkt8),
          '…and the market hours it prints are the real dusk, not a typed hour');

        const num = (re) => { const m = re.exec(clk8); return m ? parseFloat(m[1]) : NaN; };
        const LAT = num(/const LATITUDE := ([\d.]+)/), NOON = num(/const SOLAR_NOON := ([\d.]+)/);
        const sunFn = fnGd(clk8, 'sun');
        ok(/deg_to_rad\(23\.44\) \* sin\(TAU \* \(float\(day_of_year\(\)\) - 81\.0\) \/ 365\.0\)/.test(sunFn)
          && /acos\(clampf\(c, -1\.0, 1\.0\)\)/.test(sunFn) && /1\.0 if _dst\(\) else 0\.0/.test(sunFn),
          'the sun rises and sets by the date: declination, latitude and daylight saving');
        const sunAt = (doy, dst) => {
          const d2r = Math.PI / 180, decl = 23.44 * d2r * Math.sin(2 * Math.PI * (doy - 81) / 365);
          const half = Math.acos(Math.max(-1, Math.min(1, -Math.tan(LAT * d2r) * Math.tan(decl)))) / d2r / 15;
          return [(NOON + (dst ? 1 : 0) - half) * 60, (NOON + (dst ? 1 : 0) + half) * 60];
        };
        const dec = sunAt(355, 0), jun = sunAt(172, 1);
        ok(dec[1] < 17 * 60 + 15 && dec[0] > 7 * 60 + 45 && jun[1] > 20 * 60 + 45 && jun[0] < 6 * 60 + 15,
          '⭐ …so December is dark before 5:15 pm and June is light past 8:45 — computed from the constants',
          'Dec ' + Math.round(dec[0]) + '-' + Math.round(dec[1]) + ' min, Jun ' + Math.round(jun[0]) + '-' + Math.round(jun[1]) + ' min');
        const ease = fnGd(clk8, '_ease');
        ok(/s\.x - 90\.0, s\.x - 35\.0, s\.x \+ 5\.0, s\.x \+ 60\.0, noon, s\.y - 150\.0,/.test(ease)
          && /s\.y - 60\.0, s\.y - 5\.0, s\.y \+ 30\.0, s\.y \+ 80\.0\]/.test(ease) && /smoothstep\(a, b, m\)/.test(ease),
          'the look of the day is placed against the sun and eased, never stepped on the hour');
        ok(/return _ease\(\[NIGHT_TINT, BLUE_HOUR, SUNRISE, MORNING_TINT, MIDDAY, AFTERNOON_TINT, GOLDEN, SUNSET, DUSK, NIGHT_TINT\]\)/.test(fnGd(clk8, 'tint')),
          '…night, blue hour, sunrise, morning, midday, afternoon, golden hour, sunset, dusk, night');
        ok(/blend_mode = CanvasItemMaterial\.BLEND_MODE_ADD/.test(fnGd(twn8, '_light_the_sky'))
          && /layer\.layer = 1/.test(fnGd(twn8, '_light_the_sky')) && /_skylight\.color = TownClock\.glow\(\)/.test(fnGd(twn8, '_retime')),
          '⚠ …with light ADDED at sunrise and golden hour, because a tint can only darken');
        ok(/return m < s\.x \+ 10\.0 or m >= s\.y - 15\.0/.test(fnGd(clk8, 'is_dark')) && /return int\(sun\(\)\.y - 15\.0\)/.test(fnGd(clk8, 'lamps_on')),
          '…and the lamps come on at the real dusk');

        ok(/return TownClock\.time_text\(\)/.test(fnGd(zn8, 'clock_text')) && /_dial\.draw\.connect\(_draw_dial\)/.test(zn8)
          && /clock_text\(\)/.test(fnGd(zn8, '_draw_dial'))
          && /if m == _shown_minute:\s*\n\s*return/.test(fnGd(zn8, '_tick_clock')) && /_dial\.queue_redraw\(\)/.test(fnGd(zn8, '_tick_clock')),
          'a clock in the HUD: a face and the time, repainted when the minute turns');
        ok(/_dial\.position = Vector2\(w - 110\.0 \* k, 62\.0 \* k\)/.test(fnGd(zn8, '_scale_hud'))
          && !/time_text|clock_text/.test(fnGd(zn8, '_paint_hud')),
          '⚠⚠ …under the Journal tab and NOT in the row: on a 390-wide phone the row has no room left (measured 970 and 791 against a tab at 761)');

        ok(tune('drain_minutes') > 0 && /body\.drain\(_poll\.wait_time\)/.test(fnGd(gs8, '_tick')),
          'energy drains with the clock, on the tick that already runs');
        const dr = fnGd(gs8, 'drain');
        ok(/if energy <= 0:\s*\n\s*return/.test(dr) && /energy -= 1/.test(dr) && /if energy % tune\.game_cost == 0:\s*\n\s*GameState\.save_state\(\)/.test(dr),
          '⚠ …never below empty, and saved only when a game\'s worth is gone: every save banks a row on the site');
        ok(/Tuning\.now\(\)\.drain_minutes/.test(jr8) && /TownClock\.sun\(\)/.test(jr8),
          '…and the journal says so, along with sunrise and sunset');
      }

      /* ══ 37 · THE PAPER, THE CALENDAR, THE CAMERA, THE DAILY, THE POST, THE MARKET, THE MAP ══ */
      {
        const rd = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n');
        const code = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const hap = code(rd('haptics.gd')), aud = code(rd('town_audio.gd')), gst = code(rd('game_state.gd'));
        const zn = code(rd('zone.gd')), twn = code(rd('town.gd')), pap = code(rd('paper.gd'));
        const sea = code(rd('season.gd')), sart = code(rd('season_art.gd')), dor = code(rd('door.gd'));
        const pho = code(rd('photo.gd')), hal = code(rd('hall.gd')), sky = code(rd('sky_daily.gd'));
        const arc9 = code(rd('arcade.gd')), mail = code(rd('mailbox.gd')), mkt = code(rd('market.gd'));
        const mapg = code(rd('map.gd')), jr9 = code(rd('journal.gd'));

        /* ── #9 · THE BUZZ ──. */
        ok(/if GameState\.sound_on:\s*\n\s*TownHaptics\.buzz\(\)/.test(fnGd(aud, 'piece_landed')),
          'a piece landing buzzes the phone, and the mute silences the buzz with the thunk');
        ok(/if OS\.has_feature\("web"\):\s*\n\s*JavaScriptBridge\.eval\(JS % ms, true\)/.test(fnGd(hap, 'buzz')),
          '…through one snippet, on the web only');
        const buzzJs = ((/const JS := """([\s\S]*?)"""/.exec(rd('haptics.gd')) || [])[1] || '');
        const buzz = (o) => page.evaluate((src, o) => {
          const old = document.getElementById('ct-buzz');
          if (old) old.remove();
          const calls = [];
          Object.defineProperty(navigator, 'vibrate', { configurable: true,
            value: o.vibrate ? (ms) => { calls.push(ms); return true; } : undefined });
          const mm = window.matchMedia;
          window.matchMedia = (q) => ({ matches: /coarse/.test(q) ? !!o.coarse : false });
          const keep = document.createElement('input');
          document.body.appendChild(keep);
          keep.focus();
          let flips = 0;
          const spy = (e) => { if (e.target && e.target.type === 'checkbox') flips++; };
          document.addEventListener('click', spy, true);
          let r = '';
          try { r = (0, eval)(src.replace('%d', '18')); } catch (e) { r = 'THREW ' + e.message; }
          const out = { r, calls, flips, sw: !!document.querySelector('#ct-buzz input[switch]'),
                        kept: document.activeElement === keep };
          document.removeEventListener('click', spy, true);
          window.matchMedia = mm;
          delete navigator.vibrate;
          keep.remove();
          return out;
        }, buzzJs, o);
        const android = await buzz({ vibrate: true, coarse: true });
        ok(android.r === 'vibrate' && android.calls.join() === '18' && !android.sw,
          '…an Android phone gets navigator.vibrate(18)', JSON.stringify(android));
        const iphone = await buzz({ vibrate: false, coarse: true });
        ok(iphone.r === 'switch' && iphone.sw && iphone.flips === 1 && iphone.kept,
          '…an iPhone, which has no vibrate, gets the switch haptic and keeps its focus', JSON.stringify(iphone));
        const mac = await buzz({ vibrate: false, coarse: false });
        ok(mac.r === 'none' && !mac.sw && mac.flips === 0 && mac.kept,
          '⚠ …and desktop Safari, which has no vibrate either, gets nothing — its keys stay with the town',
          JSON.stringify(mac));
        ok(/had\.focus\(\{ preventScroll: true \}\)/.test(buzzJs),
          '…the switch hands focus straight back to whatever had it');

        /* ── #1 · THE PAPER ──. */
        const tp = fnGd(gst, 'turn_paper');
        ok(/if not paper_fresh\(\):\s*\n\s*return/.test(tp) && /"was": paper\.get\("now", \{\}\)/.test(tp),
          'the paper\'s "since your last paper" moves once a day, not once a read');
        const sv9 = fnGd(gst, 'save_state'), ld9 = fnGd(gst, 'load_state'), push9 = fnGd(gst, 'push_to_site');
        ok(['"paper": town.paper', '"post_seen": town.post_seen', '"finale_seen": story.finale_seen'].every((k) => sv9.includes(k))
          && /paper = d\.get\("paper"/.test(ld9) && /post_seen = str\(d\.get\("post_seen"/.test(ld9)
          && /finale_seen = bool\(d\.get\("finale_seen"/.test(ld9)
          && !/paper|post_seen|finale_seen/.test(push9),
          '⚠ what you have read and seen is saved on this device and deliberately NOT synced');
        ok(/var paper := TownPaper\.new\(\)/.test(fnGd(zn, '_build_hud'))
          && /paper\.shown\.connect\(func\(on: bool\) -> void: _hud\.visible = not on\)/.test(fnGd(zn, '_build_hud')),
          '…every room carries the paper, and the HUD row steps out from under it');
        ok(/get_first_node_in_group\("town_cover"\) != null/.test(fnGd(zn, 'covered'))
          && /Time\.get_ticks_usec\(\) - _uncovered_us < 150000/.test(fnGd(zn, 'covered'))
          && /TownZone\.uncovered\(\)/.test(fnGd(pap, 'close')),
          '⚠⚠ the Enter that closes the paper cannot reopen it: a closed cover counts for 150ms');
        ok(/while fs > 10 and _column_height/.test(fnGd(pap, '_paint')),
          '…and the paper fits by bringing the type down — nothing in this town scrolls');
        ok(/GameState\.town\.paper_was\(\)/.test(fnGd(pap, '_lead')) && /npc\.away_days\.has\(wd\)/.test(fnGd(pap, '_around')),
          '⭐ every line is read off the save or the calendar — never a guess');
        ok(!/Arcade|THE ARCADE/.test(pap),
          '⛑ and it prints nothing about the Arcade, which came off the map on 2026-10-03  (a paper that reports what is not there is a town lying in print)');
        ok(/TownClock\.lamps_on\(\)/.test(pap) && /TownClock\.lamps_on\(\)/.test(mkt) && !/opens at \d/.test(pap + mkt),
          '…and the paper and the market read the same hour off the clock');
        ok(/TownPaper\.Stand\.new\(\)/.test(twn), '…sold from a stand in the town');

        /* ── #2 · THE CALENDAR ──. */
        const TIME = fs.readFileSync(path.join(ROOT, '_includes/pjcc-time.js'), 'utf8');
        const siteSeason = ((/function season\(\) \{[\s\S]*?(return \(mo[^;]*;)/.exec(TIME)) || [])[1] || '';
        const jsMonth = (mo) => { try { return new Function('mo', siteSeason)(mo); } catch (e) { return '?'; } };
        const w = /if m == 12 or m <= (\d+):\s*\n\s*return WINTER/.exec(sea);
        const sp = /if m <= (\d+):\s*\n\s*return SPRING/.exec(sea);
        const su = /if m <= (\d+):\s*\n\s*return SUMMER/.exec(sea);
        const gdMonth = (m) => !(w && sp && su) ? '?' : (m === 12 || m <= +w[1]) ? 'winter'
          : m <= +sp[1] ? 'spring' : m <= +su[1] ? 'summer' : 'fall';
        const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        ok(siteSeason && months.every((m) => jsMonth(m) === gdMonth(m)),
          '⭐⭐ the town\'s seasons are the site sky\'s quarters, month for month',
          months.map((m) => m + ':' + gdMonth(m)[0] + '/' + jsMonth(m)[0]).join(' '));
        ok(/T\.season \? T\.season\(\)/.test(sea) && /ds: T\.dateStr\(\)/.test(sea)
          && /var s := str\(site\(\)\.get\("season", ""\)\)/.test(fnGd(sea, 'now')),
          '…and on the site it asks PJCC_TIME first, so the town and the page agree on the day');
        ok(/season == TownSeason\.WINTER and TownSeason\.weather\(\) == "snow"/.test(sart),
          'snow falls only on a day the site sky is snowing');
        ok(/z\.outdoors and TownSeason\.now\(\) == TownSeason\.WINTER/.test(fnGd(dor, '_draw')),
          '…and lies on roofs outdoors only');
        const outdoorsSet = GD_LIST.filter((f) => f.endsWith('.gd'))
          .filter((f) => /^\s*outdoors = true/m.test(code(rd(f))));
        ok(outdoorsSet.join() === 'town.gd', '…where the town is the one place that is outdoors', outdoorsSet.join());
        ok(/if TownSeason\.december\(\):\s*\n\s*var tree := SeasonArt\.FirTree\.new\(\)/.test(twn),
          'the tree goes up in December and not before');
        ok(!/rand[fi]/.test(fnGd(sart, 'ground')), '…and a leaf on the ground is salted, not rolled: it must not crawl');

        /* ── #3 + #7 · THE CAMERA AND THE GALLERY ──. */
        ok(/PhotoMode\.Tripod\.new\(\)/.test(hal) && /add_child\(PhotoMode\.new\(self\)\)/.test(hal),
          'the Assembly has a camera on a tripod');
        ok(/if n is CanvasLayer and n != self/.test(fnGd(pho, '_hide_chrome'))
          && /\["town_player", "touch_pad"\]/.test(fnGd(pho, '_hide_chrome'))
          && /n\.visible = true/.test(fnGd(pho, 'close')) && /make_current\(\)/.test(fnGd(pho, 'close')),
          '…the frame loses the HUD, the box, the pad and you, and Done gives every one of them back');
        ok(/JavaScriptBridge\.download_buffer\(img\.save_png_to_buffer\(\)/.test(fnGd(pho, 'take')),
          '…Take it hands the phone a real PNG');
        ok(/if full and not GameState\.story\.finale_seen:/.test(fnGd(hal, '_refresh'))
          && /GameState\.story\.finale_seen = true/.test(fnGd(pho, 'finale')),
          '⭐ the finale plays in the gallery once, the first time the board is full');
        const hallConsts = new Set([...hal.matchAll(/^const ([A-Z_]+) :?=/gm)].map((m) => m[1]));
        const asked = [...new Set([...pho.matchAll(/C\.get\("([A-Z_]+)"/g)].map((m) => m[1]))];
        ok(/get_script_constant_map\(\)/.test(pho) && asked.length >= 7 && asked.every((k) => hallConsts.has(k)),
          '⚠ the gallery paints with the ROOM\'s own constants, so the two pictures cannot disagree',
          asked.filter((k) => !hallConsts.has(k)).join(' ') || asked.length + ' read');
        ok(/GameState\.board\.cell_of\(slot\) if won else GameState\.board\.home_cell\(slot\)/.test(fnGd(pho, '_paint_gallery'))
          && /GameState\.board\.board_cell\(f\)\.x/.test(fnGd(pho, '_paint_gallery')),
          '…and stands every piece where GameState says it stands');

        /* ── #4 · THE DAILY ON THE CABINET ──. */
        const SR = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_sky_run.html'), 'utf8');
        const spawnJs = fn(SR, 'spawnEnemy');
        const draws = (spawnJs.match(/\brr\(/g) || []).length + (spawnJs.match(/\br\(\)/g) || []).length - 1;
        const reg1 = (/\{ id:1,[^}]*pool:\[([^\]]*)\]/.exec(SR) || [])[1] || '';
        const gdPool = ((/const POOL := \[([^\]]*)\]/.exec(sky) || [])[1] || '').replace(/"/g, "'").replace(/\s/g, '');
        const enemy = (t) => (new RegExp(t + ':\\s*\\{[^}]*r:(\\d+), spd:(\\d+)').exec(SR) || []).slice(1).join('/');
        ok(/const W = 440, H = 640;/.test(SR) && /const W := 440\.0/.test(sky) && /const H := 640\.0/.test(sky)
          && reg1.replace(/\s/g, '') === gdPool
          && enemy('pawn') === '13/78' && /"pawn": 13\.0/.test(sky) && /"pawn": 78\.0/.test(sky)
          && enemy('bishop') === '14/70' && /"bishop": 14\.0/.test(sky) && /"bishop": 70\.0/.test(sky),
          '⭐⭐ the cabinet\'s field, region-one pool and enemy sizes are Sky Run\'s', reg1 + ' vs ' + gdPool);
        ok(/const groups = 2 \+ Math\.floor\(waveIdx\/2\);/.test(SR) && /for g in 2:/.test(sky)
          && /const n = 3 \+ Math\.floor\(\(region \+ waveIdx\)\/2\);/.test(SR) && /var n := 3/.test(sky)
          && /const gap = Math\.max\(0\.26, 0\.62 - region\*0\.04 - waveIdx\*0\.02\);/.test(SR) && /maxf\(0\.26, 0\.62 - 0\.04\)/.test(sky)
          && /let t = G\.time \+ 0\.5;/.test(SR) && /var at := 0\.5/.test(sky) && /t \+= 0\.7;/.test(SR) && /at \+= 0\.7/.test(sky),
          '…and so are the opening wave\'s groups, counts and timing');
        ok(/SRNG = daily \? mulberry32\(hashStr\('sky-run\|waves\|'\+day\)\) : null;/.test(SR)
          && /hash_str\("sky-run\|waves\|" \+ day\)/.test(sky)
          && /a=a\+0x6D2B79F5\|0; var t=Math\.imul\(a\^a>>>15,1\|a\); t=t\+Math\.imul\(t\^t>>>7,61\|t\)\^t; return \(\(t\^t>>>14\)>>>0\)\/4294967296;/.test(SR)
          && /0x6D2B79F5/.test(sky) && /imul\(a \^ \(a >> 15\), 1 \| a\)/.test(sky)
          && /imul\(t \^ \(t >> 7\), 61 \| t\)\) & SkyDaily\.M32\) \^ t/.test(sky) && /\(t \^ \(t >> 14\)\)/.test(sky),
          '…seeded the same way, through the same generator');
        ok(draws === 6 && /const DRAWS_PER_SPAWN := 6/.test(sky)
          && (SR.match(/srnd\(\)/g) || []).length === 2 && (SR.match(/\|\| srnd/g) || []).length === 1,
          '⚠⚠ and only genWave and spawnEnemy draw from the Daily stream, six draws a spawn — or the port is a guess',
          draws + ' draws');
        ok(/\(a \* \(b >> 16\)\) & 0xFFFF/.test(fnGd(sky, 'imul')),
          '⚠ Math.imul is split in 16-bit halves: a u32 × u32 can pass 2^63, undefined in C++ even where this build wraps');
        ok(/SkyDaily\.opening_wave\(TownSeason\.date_key\(\)\)/.test(fnGd(arc9, '_sky_live'))
          && /PJCC_TIME\.dateStr\(\)/.test(fn(SR, 'dayKey')),
          '…and the cabinet plays the date the game itself calls today');

        /* ── #5 · THE POST ──. */
        const loadPost = fn(PROF, 'loadTownPost');
        ok(/PJCC\.townPost = function/.test(PROF) && loadPost
          && !/\.insert\(|\.update\(|\.upsert\(|\.delete\(|rpc\(/.test(loadPost),
          'the post READS: nothing in it writes a row');
        ok(/from\('profiles'\)\.select\('id,codename'\)/.test(loadPost)
          && /from\('scores'\)\.select\('user_id,game,score,created_at'\)/.test(loadPost)
          && /from\('game_stats'\)\.select\('user_id,game,best_score'\)/.test(loadPost),
          '…only the public columns a player card already shows');
        {
          const ctx = { PJCC_GAMES: [{ slug: 'sky-run', name: 'Sky Run' }, { slug: 'tower-defense' },
            { slug: 'notation-run', name: 'Notation Blitz' }], POST_MAX: 3 };
          ctx.window = ctx;
          require('vm').runInNewContext(fn(PROF, 'gameName') + '\n' + fn(PROF, 'townLetters') +
            '\nthis.out = townLetters({ u1: "ACE", u2: "BEE" }, [' +
            '{ user_id: "u1", game: "sky-run", score: 90, created_at: "3" },' +
            '{ user_id: "u2", game: "park-bot", score: 5, created_at: "3" },' +
            '{ user_id: "u1", game: "sky-run", score: 50, created_at: "2" },' +
            '{ user_id: "u2", game: "tower-defense", score: 0, created_at: "2" },' +
            '{ user_id: "u2", game: "sky-run", score: 70, created_at: "2" },' +
            '{ user_id: "u1", game: "tower-defense", score: 7, created_at: "1" },' +
            '{ user_id: "u2", game: "notation-run", score: 1, created_at: "0" }],' +
            ' { "u2|sky-run": 120 }, function (g) { return g === "sky-run" ? 64 : 0; });', ctx);
          const L = ctx.out || [];
          ok(L.length === 3 && L[0].who === 'ACE' && L[0].score === 90 && L[1].who === 'BEE'
            && L[1].best === 120 && L[0].mine === 64 && L[0].name === 'Sky Run' && L[2].name === 'Tower Defense',
            '⭐ one letter per player per game, the newest, capped — and named the way the hall names it',
            JSON.stringify(L));
          ok(!L.some((l) => l.score <= 0 || l.game === 'park-bot'),
            '⚠⚠ …and a zero, or an id that is not a game, is not news — both are banked on the live table',
            JSON.stringify(L.map((l) => l.game + ':' + l.score)));
        }
        await page.evaluate(() => PJCC.townPost());
        await new Promise((r) => setTimeout(r, 120));
        ok((await page.evaluate(() => (PJCC.townPost() || {}).state)) === 'signed-out',
          '…and signed out it says so instead of pretending the box is empty');
        const letterKeys = [...new Set([...fnGd(mail, 'letter').matchAll(/l\.get\("(\w+)"/g)].map((m) => m[1]))].sort();
        ok(letterKeys.join() === 'at,best,game,mine,name,score,who',
          '⚠⚠ a letter is built from a name, a game and numbers — no field a person could have typed',
          letterKeys.join());
        ok(/str\(\(l as Dictionary\)\.get\("at", ""\)\) > post_seen/.test(fnGd(gst, 'post_unread'))
          && /post_seen = newest/.test(fnGd(gst, 'read_post')),
          '…the flag is up for letters newer than the last one read');
        ok(/pjcc-games-data\.js/.test(fs.readFileSync(path.join(ROOT, 'games/checker-town/index.html'), 'utf8')),
          '…and the town\'s page loads the games registry the letters name games from');

        /* ── #6 · THE NIGHT MARKET ──. */
        ok(/GameState\.people\.buy_scout\(GameState\.board\.key_at\(slot\)\)/.test(mkt) && !/ore\s*[-+]=/.test(mkt)
          && /GameState\.people\.SCOUT_ORE/.test(mkt),
          '⭐ a scorebook page is the face-to-face price, down the same buy_scout path');
        ok(/if not TownClock\.is_dark\(\):\s*\n\s*say\("Shuttered/.test(mkt),
          '…open after dark and shuttered by day, on the wall clock');
        ok(/GameState\.people\.met_at\(i\)/.test(mkt) && /return GameState\.people\.met_at\(slot\)/.test(fnGd(jr9, '_met')),
          '…stocked with people you have MET, by the journal\'s own definition');
        ok(/NightMarket\.new\(\)/.test(twn) && /func retime\(\) -> void:/.test(mkt),
          '…and it lights with the lamps');

        /* ── #8 · THE MAP ──. */
        ok(/const TABS := \[[^\]]*"Map"\]/.test(jr9) && /if k\.keycode == KEY_M and not _talking\(\):/.test(jr9) && /_paint_map\(f\)/.test(jr9),
          'M, or the journal\'s last tab, opens the map');
        const cap = fnGd(mapg, 'capture');
        ok(/not n2\.visible/.test(cap) && /not \(n is TownNPC\)/.test(cap),
          '⚠⚠ the map shows only places the town is showing — no people, and nothing hidden');
        /* ⛑⛑ fnGd() TAKES THE FIRST `func _draw(` IN THE FILE. */
        ok(twn.indexOf('func _draw(') < twn.indexOf('class '),
          '⛑⛑ town.gd\'s OWN _draw() comes before its first inner class',
          'six checks reach the ground through fnGd(twn, \'_draw\') and it takes the first match');
        /* ⛑ THE CAPTURE MOVED INTO _furnish() ON 2026-09-27 — it has to run BEFORE the window
           cull or the journal draws one fifth of the town. Same call, earlier. */
        ok(/for r in _roads\(\):/.test(fnGd(twn, '_draw_roads')) && !/Rect2\(/.test(fnGd(twn, '_draw_roads'))
          && /TownMap\.capture\(self, GROUND_RECT, \[/.test(twn)
          && /_roads\(\), GROUND\)/.test(fnGd(twn, '_furnish'))
          && /SAND_RECT/.test(fnGd(twn, '_draw')) && /SAND_RECT/.test(fnGd(twn, '_region')),
          '…drawn from the same rects the ground is painted from');
        /* ⛑⛑ AND IN THE SAME COLORS. journal.gd had "22301f" typed into it. */
        /* ⚠ THE GROUND FILL, NOT "no hex anywhere in _paint_map". */
        ok(/_body\.draw_rect\(to\.call\(g\), TownMap\.ground_tint\)/.test(jr9)
          && /ground_tint = tint/.test(cap),
          '⛑⛑ the minimap asks the town what color its ground is instead of remembering it');
        /* ⚠⚠ EVERY PATCH THAT IS NOT THE GROUND HAS TO BE IN THE AREA LIST. */
        /* ⛑ THE LIST MOVED INTO _furnish() WITH THE CAPTURE (2026-09-27), ahead of the cull. */
        for (const a of ['LAWN', 'SHORE', 'SAND_RECT', 'YARD', 'WATER_RECT'])
          ok(new RegExp('\\{ "rect": ' + a + ', "color": ').test(fnGd(twn, '_furnish')),
            '   …and ' + a + ' is on it');
        ok(/if t\.intersects\(box\):/.test(fnGd(jr9, '_paint_map')),
          '…and on a phone a name that would land on another name is left off');
      }

      /* ══ 36 · A PHONE CAN READ THE TOWN, AND A SAVE CANNOT EAT ITSELF (2026-09-14) ══ */
      {
        const rd = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n');
        const code = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const mineG = code(rd('mine.gd')), spc = code(rd('speech.gd')), zn = code(rd('zone.gd'));
        const cardG = code(rd('npc_card.gd')), tuiG = code(rd('town_ui.gd')), plG = code(rd('player.gd'));
        const gst = code(rd('game_state.gd')), jr = code(rd('journal.gd'));
        const over = fnGd(mineG, '_process').split('return')[0];
        ok(/pad\.take_accept\(\)/.test(over) && /_leave\(\)/.test(over),
          "the Sand Mine's result screen leaves on the pad's USE — a phone has no Enter");
        const fin = fnGd(mineG, '_finish');
        ok(/PROCESS_MODE_DISABLED/.test(fin) && /player\.set_physics_process\(false\)/.test(fin),
          '…and the run stops where it ends: the pieces and your feet');
        /* ⚑ 2026-10-13: the words are Pad's now, so a controller is named too ("press A"). */
        ok(/Pad\.use_words\(\)\]/.test(fin) && /return "tap USE" if TouchPad\.probably_touch\(\) else "press ENTER"/.test(fnGd(rd('pad.gd'), 'use_words')),
          '…and the line names the input you have');
        const hud = fnGd(mineG, '_layout_hud');
        ok(/TownZone\.ui_scale\(self\)/.test(hud) && /int\(42\.0 \* k\)/.test(hud) && /int\(20\.0 \* k\)/.test(hud),
          "…and the mine's HUD is scaled for the window");
        const place = fnGd(spc, '_place_all');
        ok(/var xf := vp\.get_canvas_transform\(\)/.test(place) && /xf \* world/.test(place) && !/get_screen_center_position/.test(spc),
          'a bubble is projected through the canvas transform, zoom included', 'on a phone the old arithmetic missed by 96 units');
        ok(/TownZone\.ui_scale\(self\)/.test(place) && /_fit\(b\.label, k\)/.test(place) && /int\(18\.0 \* k\)/.test(fnGd(spc, '_fit')),
          "…and its type is scaled for the window");
        ok(/Speech\.no_break\(text\)/.test(fnGd(spc, 'show_over')) && /\(\?<=\[A-Za-z0-9\]\)-\(\?=\[A-Za-z0-9\]\)/.test(spc),
          'a hyphenated name never breaks across a line');
        ok(/get_canvas_transform\(\) \* world/.test(fnGd(cardG, '_to_screen')) && /affine_inverse\(\) \* mouse/.test(cardG)
          && !/get_screen_center_position/.test(cardG), 'the relationship card projects the same way, in both directions');
        ok(/int\(16\.0 \* k\)/.test(fnGd(cardG, '_paint')), "…and is drawn at the window's scale");
        ok(/ui_scale\(n\) \/ maxf\(z, 0\.01\)/.test(fnGd(zn, 'read_scale')), "world text has a read scale off the camera's zoom");
        for (const f of ['npc.gd', 'door.gd', 'exit_door.gd']) {
          ok(/TownZone\.read_scale\(self\)/.test(code(rd(f))), '…' + f + ' draws its words with it');
        }
        ok(/propagate_call\("queue_redraw"\)/.test(fnGd(zn, '_scale_hud')), '…and a resized window redraws them');
        const paintHud = fnGd(zn, '_paint_hud');
        ok(/get_visible_rect\(\)\.size\.x - 150\.0 \* k/.test(paintHud) && /fs = maxi\(int\(float\(fs\) \* 0\.7\), int\(float\(fs\) \* room \/ tw\)\)/.test(paintHud)
          && /_stat\.add_theme_font_size_override\("font_size", fs\)/.test(paintHud) && !/font_size/.test(fnGd(zn, '_scale_hud').split('_tab')[0]),
          'the stat row is measured against the Journal tab, and one function owns its size', 'on a 390-wide phone "Energy 100/100" ran under the tab');
        ok(/_fit_row\(b, int\(17\.0 \* k\)/.test(fnGd(tuiG, '_layout')) && /int\(float\(fs\) \* 0\.7\)/.test(fnGd(tuiG, '_fit_row')),
          'a menu row shrinks to fit before it clips');
        const uin = fnGd(tuiG, '_unhandled_input');
        ok(/is_action_pressed\("ui_down"\)/.test(uin) && /is_action_pressed\("ui_accept"\) and _row >= 0/.test(uin),
          'the menu answers the keys the hint names: up, down and accept');
        ok(/if not _opts\[i\]\.disabled:/.test(fnGd(tuiG, '_step_row')), '…and skips a row you cannot take');
        ok(/_closed_us = Time\.get_ticks_usec\(\)/.test(fnGd(tuiG, 'close')) && /_closed_us = Time\.get_ticks_usec\(\)/.test(fnGd(tuiG, 'close_saying')),
          '…both ways out of a conversation stamp the close');
        /* ⚠ 2026-10-10: one `shut` for both ways in — the press, and a tap on the glass. */
        ok(/var shut: bool = u != null and u\.just_closed\(\)/.test(fnGd(plG, '_process'))
           && /if used and _active != null and not shut:/.test(fnGd(plG, '_process'))
           && /if tap\.is_finite\(\) and not shut:/.test(fnGd(plG, '_process')),
          '…and the press that closed it cannot reopen it  (nor can a tap)');
        const sv = fnGd(gst, 'save_state'), ld = fnGd(gst, 'load_state');
        ok(/FileAccess\.open\(_path\("\.tmp"\), FileAccess\.WRITE\)/.test(sv) && /rename_absolute\(_path\("\.tmp"\), _path\(\)\)/.test(sv),
          'a save is written aside and swapped in  (whichever of the two saves is in play)');
        ok(/rename_absolute\(_path\(\), _path\("\.bak"\)\)/.test(sv), '…keeping the one before it');
        ok(/for p in \[_path\(\), _path\("\.tmp"\), _path\("\.bak"\)\]:/.test(ld), '…and a torn save falls back instead of starting Day 1');
        ok(/GameState\.board\.check_site_unlocks\(\)[\s\S]*site_scores/.test(fnGd(jr, 'open')), 'the Journal fills a met price before it draws');
      }

      /* ══ 39 · THE STORY PICKS (2026-09-21) ══ */
      {
        const rd = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n');
        const code = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const npcG = code(rd('npc.gd')), dogG = code(rd('dog.gd')), townG = code(rd('town.gd'));
        const zoneG = code(rd('zone.gd')), gsG = code(rd('game_state.gd')), parkG = code(rd('park.gd'));
        /* ⛑ THREE PLACES PUT PEOPLE DOWN SINCE 2026-09-24 — the square, the Academy and the
           island. Anything that used to ask "is this person in the town?" has to ask all three. */
        const acadG = code(rd('academy.gd')), islG = code(rd('island.gd'));
        const chalG = code(rd('challenger.gd')), jrG = code(rd('journal.gd'));
        const strs = (s) => [...s.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);

        /* ⛑⛑ ONLY HUMANS TALK (his rule, 2026-07-15). */
        const coats = /const COATS := \{([\s\S]*?)\n\}/.exec(dogG);
        const animals = coats ? [...coats[1].matchAll(/"([A-Za-z ]+)":/g)].map((m) => m[1]) : [];
        ok(['Princess', 'Milo', 'Argus'].every((a) => animals.includes(a)),
          '⛑⛑ the three dogs are in ONE table, and it is the list of animals', animals.join(' '));
        ok(/c\.animal = TownDog\.is_animal\(name_\)/.test(townG) && /_animal = TownDog\.is_animal\(who\)/.test(parkG)
          && /func wears_model\(\) -> bool:\s*\n\s*return not animal/.test(npcG),
          '…the town and the Pavilion both ask it, and an animal never wears a person');
        /* ⛑⛑ THE THREE OF THEM ARE BUILT IN dog.gd SINCE 2026-09-24, in one CAST table. */
        const castM = /const CAST := \{([\s\S]*?)\n\}/.exec(dogG);
        const spoken = [];
        if (!castM) spoken.push('TownDog.CAST: NOT FOUND');
        const cast = castM ? castM[1] : '';
        for (const a of ['Princess', 'Milo', 'Argus']) {
          const at = cast.indexOf('"' + a + '": {');
          if (at < 0) { spoken.push(a + ': NOT IN THE CAST'); continue; }
          const end = cast.indexOf('\n\t"', at + 4);
          const row = cast.slice(at, end > 0 ? end : cast.length);
          /* ⚠ THE KEYS ARE STRINGS TOO — "key", "elo", "lines" and the slug are not lines. */
          strs(row).filter((s) => / /.test(s)).forEach((s) => {
            if (!s.startsWith(a)) spoken.push(a + ': ' + s);
          });
        }
        const pb = cast;
        for (const a of ['Princess', 'Milo', 'Argus']) {
          const row = new RegExp('"who": "' + a + '"[^\\n]*\\n[^\\n]*"say": "([^"]*)"').exec(gsG);
          if (!row || !row[1].startsWith(a)) spoken.push(a + ' (Assembly): ' + (row ? row[1] : 'NOT FOUND'));
        }
        ok(spoken.length === 0,
          '⛑⛑ …and every line a dog has is what the dog DOES, never a sentence it says',
          spoken.slice(0, 3).join(' | ') || 'Milo, Argus, Princess — town, camp and Assembly');
        ok(/npc\.razz_line if npc\.animal else/.test(zoneG) && /if TownDog\.is_animal\(who\):/.test(zoneG),
          '…and a dog’s razz goes out without quotes, even from another room');

        /* the people with a [before] line, by file name (lower case) */
        const bKeys = LINES_ALL.map((f) => f.replace(/\.txt$/, '')).filter((f) => (words(f).before || []).length > 0);
        ok(/if before_line != "" and SMALL_TALK\.has\(who\):\s*\n\s*rows\.append\(\{ "id": "before", "text": "What was it like before\?" \}\)/.test(npcG)
          && bKeys.length >= 6 && bKeys.every((k) => !animals.map((a) => a.toLowerCase()).includes(k)),
          '⭐ "What was it like before?" — a row where somebody remembers, and no animal remembers aloud',
          bKeys.join(', '));
        /* ══ TWO ROWS, TWO PEOPLE — 2026-09-24 ══ */
        /* his: "Take out the What's out this way? and 'What was it like before?' for all
           characters except for Nate and Murphy" */
        const talk = /const SMALL_TALK := \[([^\]]*)\]/.exec(npcG);
        const tNames = talk ? strs(talk[1]) : [];
        ok(tNames.length === 2 && tNames.includes('Jay') && tNames.includes('Murphy'),
          '⛑ only Jay (his Nate at the sea, renamed 10-26) and Murphy are asked what is out this way and what it was like before',
          tNames.join(', ') || 'no SMALL_TALK list');
        ok(/if SMALL_TALK\.has\(who\):\s*\n\s*rows\.append\(\{ "id": "local"/.test(npcG)
          && /rows\.append\(\{ "id": "self", "text": "How have you been\?" \}\)/.test(npcG),
          '…and "How have you been?" stays everybody\'s — it is the row about the person',
          '⚠ a menu with one row left is a character with nothing to say');
        /* ⚠⚠ A LIST OF NAMES, NOT A DELETION. Every line he wrote is still in the files; one
           word puts a character back. Deleting them would make this reversal a rewrite. */
        const stillThere = ['Maxwell', 'Kedar', 'Robert', 'Vince'].filter((n) => bKeys.includes(n.toLowerCase())
          && (words(n).local || []).length > 0);
        ok(stillThere.length === 4,
          '…and nobody\'s words were deleted to do it  [[text-changes-need-approval]]',
          stillThere.join(', ') + ' still have their before-lines on file');

        /* ══ YOUR NOTES LEFT THE CONVERSATION — 2026-09-24 ══ */
        /* his: "Take out 'Let me see what I've got on you' and move it to a different process,
           like the Journal" */
        ok(!/"id": "recall"/.test(chalG) && !/got on you/.test(chalG),
          '⛑ "Let me see what I\'ve got on you" is no longer a thing you say to somebody\'s face',
          '⚠ it was the one row that was not a sentence — you were reading your own notes AT them');
        /* ⚠⚠ MOVED, NOT DELETED. A row taken out of one place and not put in another is a
           feature quietly dropped, and nothing would ever say so. */
        ok(/"wide": true, "b": " "\.join\(PackedStringArray\(facts\)\)/.test(jrG)
          && /GameState\.people\.known_facts\(key\)/.test(fnGd(jrG, '_people_rows')),
          '…and the Journal\'s People tab carries it, under the person it is about',
          '⭐ readable anywhere now, not only while standing in front of them');
        /* ⚠⚠ ONE ROW PER PERSON, NOT ONE PER FACT. Nine people with three facts each is 27
           extra rows and this card does not scroll — the header says so twice. */
        ok(/if not facts\.is_empty\(\):\s*\n\s*out\.append\(\{ "wide": true/.test(jrG)
          && /w - 50\.0 \* k, size, DIM\)/.test(jrG),
          '…as ONE line per person that runs the whole card, ellipsized like every other row',
          '⚠ a row per fact would push the People tab off the bottom of a phone');

        /* ══ THE PARK KEEPS HOURS — 2026-09-24 ══ */
        /* his: "close down the park after 11:30pm. Open it back up at 5:30am." */
        ok(/const SHUT_AT := 23 \* 60 \+ 30/.test(parkG) && /const OPEN_AT := 5 \* 60 \+ 30/.test(parkG)
          && /return m >= OPEN_AT and m < SHUT_AT/.test(fnGd(parkG, 'is_open')),
          '⭐ the Park Tables shut at half eleven and open at half five');
        /* ⚠⚠ WALL-CLOCK MINUTES, NOT THE SUN. Everything that LIGHTS this town rides sunset and
           moves with the calendar; in June the sun is still up at half nine. Opening hours are
           three fixed numbers he named. Same argument as TownClock.greeting(). */
        ok(!/phase\(\)|is_dark\(\)|sun\(\)/.test(fnGd(parkG, 'is_open')),
          '…off the wall clock, so the sign says the same thing in June and in December');
        /* ⚠ ONE OWNER. The gate in the square and the room behind it disagreeing about when it
           is open is a bug that only shows itself at 11:31 at night. */
        const grove = townG.slice(townG.indexOf('class TableGrove extends TownDoor:'),
          townG.indexOf('class CheckerShell extends Node2D:'));
        ok(/Pavilion\.is_open\(\)/.test(grove) && !/23|11:30|5:30/.test(grove.replace(/Pavilion\.\w+\(\)/g, '')),
          '…and the gate in the square ASKS the park rather than carrying its own pair of numbers');
        /* ⚠⚠ A REFUSAL, NOT A DEAD DOOR. You walk ONTO this one, so a door that quietly did
           nothing after midnight is indistinguishable from the game having frozen. */
        ok(/if Pavilion\.is_open\(\):\s*\n\s*super\(player\)\s*\n\s*return\s*\n\s*say\("Closed for the night/.test(grove)
          && /Pavilion\.opens_text\(\)/.test(grove),
          '…and it says the hour out loud instead of doing nothing',
          '⚠ walk-in routes through interact() too, so one override covers both ways in');
        /* ⚠ AND THE SIGN CHANGES ON THE MINUTE, off town.gd's _retime walk — not the next time
           somebody happens to wander past. ⚠⚠ relabel(), never set_highlight(): a subclass that
           lights its own prompt lights it at _ready and never puts it down. */
        ok(/func retime\(\) -> void:/.test(grove) && /relabel\(_open_prompt if Pavilion\.is_open\(\)/.test(grove)
          && !/set_highlight\(true\)/.test(grove),
          '…and the prompt and the sign both go gray at half eleven, on the clock tick',
          '[[godot-draw-and-save-traps]]');

        /* ══ THE FENCE, DARKER AND THICKER — 2026-09-24, his ══ */
        const lum = (hex) => {
          const n = parseInt(hex, 16);
          return 0.2126 * (((n >> 16) & 255) / 255) + 0.7152 * (((n >> 8) & 255) / 255)
            + 0.0722 * ((n & 255) / 255);
        };
        const post = /const FENCE_POST := Color\("([0-9a-f]{6})"\)/.exec(townG);
        const rail = /const FENCE_RAIL := Color\("([0-9a-f]{6})"\)/.exec(townG);
        const floorC = /const GROUND := Color\("([0-9a-f]{6})"\)/.exec(townG);
        const sandC = /const SAND := Color\("([0-9a-f]{6})"\)/.exec(townG);
        /* ⚠⚠ AGAINST THE GROUND IT STANDS ON, NOT AN ABSOLUTE. The old rail (6d5636, 0.347) was
           LIGHTER than the desert floor it was drawn on (5b4f34, 0.312) — which is why a fence
           built to say NO read as a line of twigs. */
        ok(post && rail && floorC && sandC && lum(rail[1]) < lum(floorC[1]) * 0.65
          && lum(rail[1]) < lum(sandC[1]) * 0.45 && lum(post[1]) < lum(rail[1]),
          '⛑ the fence is darker than the floor and the sand, and the posts darker than the rails',
          post ? 'post ' + lum(post[1]).toFixed(3) + ' · rail ' + lum(rail[1]).toFixed(3)
            + ' vs floor ' + lum(floorC[1]).toFixed(3) + ' · sand ' + lum(sandC[1]).toFixed(3) : '?');
        /* ⚠ AND THE POSTS CLOSER WITH IT. Widening a rail without closing the gaps makes a
           heavier fence with exactly the same holes in it. */
        const fen = fnGd(townG, '_draw_fence');
        const railW = /FENCE_RAIL, ([\d.]+)\)/.exec(fen);
        const postW = /Rect2\(at\.x - ([\d.]+), at\.y - ([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(fen);
        const pitch = /distance_to\(b\) \/ ([\d.]+)\)/.exec(fen);
        ok(railW && postW && pitch && +railW[1] >= 5 && +postW[3] >= 9 && +pitch[1] <= 50,
          '…and thicker: the rails, the posts, and the gaps between them',
          railW ? 'rail ' + railW[1] + ' wide (was 3) · post ' + postW[3] + ' (was 6) · every '
            + pitch[1] + ' units (was 58)' : '?');

        /* ══ KAEDE AND ROBERT CAME INDOORS — 2026-09-24 ══ */
        /* his: "Put Kaede and Robert into the academy building instead of outside" */
        ok(/kaede\.who = "Kaede"/.test(acadG) && /rob\.who = "Robert"/.test(acadG)
          && !/_add_challenger\("Robert"/.test(townG) && !/kaede\.who/.test(townG),
          '⛑ Kaede and Robert are inside the Academy, and in only one file each');
        ok(/rob\.key = "robert"/.test(acadG) && /rob\.elo = 1800/.test(acadG),
          '…and Robert kept his bench seat and his rating through the move', 'robert / 1800');
        /* ⚠⚠ THE ROOM IS 1120 × 760 AND THREE LESSON DOORS TAKE THE TOP OF IT. A door's sign is
           drawn 62 above its roof, so anybody standing high in this room stands in a doorway. */
        const aW = num(acadG, 'W'), aH = num(acadG, 'H'), aT = num(acadG, 'WALL_T');
        const standing = [...acadG.matchAll(/(?:kaede|rob)\.position = Vector2\((-?[\d.]+), (-?[\d.]+)\)/g)]
          .map((m) => [+m[1], +m[2]]);
        const offFloor = standing.filter(([x, y]) =>
          Math.abs(x) > aW - aT || Math.abs(y) > aH - aT || y < 0 || Math.abs(x) < 70);
        ok(standing.length === 2 && offFloor.length === 0,
          '…both on the floor, in the bottom half clear of the lesson doors, and off the runner',
          offFloor.length ? 'BAD: ' + offFloor.map((p) => p.join(',')).join(' · ')
            : standing.map((p) => p.join(',')).join(' · ') + ' inside ±'
              + (aW - aT) + ', ±' + (aH - aT));

        /* #7 — Maxwell greets you off the board, not off the hearts. */
        ok(/_board_line\(\) if not board_lines\.is_empty\(\) else _line_for\(hearts\)/.test(npcG)
          && (words('Maxwell').board || []).length >= 3 && /GameState\.board\.army_count\(\)/.test(fnGd(npcG, '_board_line')),
          '⭐ Maxwell’s greeting reads how far your board has got');
        /* ⚠⚠ THE DOCK IS STILL HERS, IT IS JUST WINDOW-GATED NOW (2026-09-28). She waits at the
           Assembly, which is in the NORTH, and the dock is in the SOUTH — so in that window she
           is given no water and the night never fires. See section 47: unguarded she walked 893
           units off the painted map to reach it. The behavior is intact and dormant, not cut,
           and it comes back on its own the day her post and the dock share a window. */
        ok(/posmod\(hash\("water\|%d" % d\), 100\)/.test(dogG) && /not TownClock\.is_dark\(\)/.test(fnGd(dogG, '_water_night'))
          && /var wet := LOOKOUT_AT \+ Vector2\(66\.0, 6\.0\)/.test(townG)
          && /dog\.water = wet/.test(townG),
          '⭐ some nights Princess goes to the water, and only after dark  (where she can reach it)');
        const told = strs(dogG).concat(strs(pb)).filter((s) => /tilt|planet|bill|queen|manifest|imagin|pray/i.test(s));
        ok(told.length === 0 && /deg_to_rad\(-20\.0\) if tilt/.test(dogG),
          '⚠⚠ …the tilt is DRAWN, twenty degrees, and not one string explains it',
          told.join(' | ') || 'nobody knows what she is doing');
        /* #3 — the lookout stands on the dock, and its view is a cover the player cannot walk under. */
        const lk = code(rd('lookout.gd'));
        const sea = /const SEA_AT := Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(townG);
        const look = /const LOOKOUT_AT := Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(townG);
        const deck = sea && [+sea[1] - 270, +sea[2] - 160, 540, 360];
        ok(look && deck && +look[1] >= deck[0] && +look[1] <= deck[0] + deck[2]
          && +look[2] >= deck[1] && +look[2] <= deck[1] + deck[3] && /TownLookout\.new\(\)/.test(townG),
          '⭐ the lookout stands on the dock at the Sea', look ? look[1] + ',' + look[2] : 'no LOOKOUT_AT');
        ok(/add_to_group\("town_cover"\)/.test(lk) && /TownZone\.uncovered\(\)/.test(fnGd(lk, 'close'))
          && /class Vista extends CanvasLayer/.test(lk),
          '…and the view across the water holds the player still, and lets go cleanly');

        /* ══ THE TELESCOPE KNOWS WHAT TIME IT IS ══ */
        /* his: "Can we make it read the user's local time? This is an interesting touch I can take advantage of. Let's put a morning and daytime and nighttime sky on the telescope." */
        const skyFrom = lk.indexOf('var top := Color(');
        const sky = skyFrom < 0 ? '' : lk.slice(skyFrom, lk.indexOf('_grad(Rect2(0.0, 0.0, w, hz)'));
        const dflt = [...sky.matchAll(/var (?:top|low) := Color\("([0-9a-f]{6})"\)/g)].map((m) => m[1]);
        const named = [...sky.matchAll(
          /TownClock\.(\w+):\s*\n\s*top = Color\("([0-9a-f]{6})"\)[^\n]*\n\s*low = Color\("([0-9a-f]{6})"\)/g)];
        const phases = named.map((m) => m[1]).concat(['AFTERNOON (the default)']);
        const looks = named.map((m) => m[2] + m[3]).concat([dflt.join('')]);
        ok(dflt.length === 2 && named.length === 4,
          '⭐ the telescope has a sky for every phase of the clock', phases.join(' \u00b7 '));
        ok(looks.length === 5 && new Set(looks).size === 5,
          '\u2026and no two of them are the same picture',
          new Set(looks).size + ' distinct of ' + looks.length);
        ok(named.some((m) => m[1] === 'MORNING'),
          '\u2026morning among them, which is the one that was missing');
        /* ⭐ AND THE SUN IS WHERE IT REALLY IS - the payoff he asked for by name. */
        const body = fnGd(lk, '_sky_body');
        ok(/TownClock\.sun\(\)/.test(body) && /TownClock\.minute_of_day\(\)/.test(body),
          '⭐ the sun sits on the arc between the real sunrise and the real sunset');
        /* \u26a0\u26a0 `> 0 &&` IS NOT DECORATION. indexOf returns -1 when the call is GONE. */
        const sunAt = lk.indexOf('_sky_body(w, hz, ph)');
        ok(sunAt > 0 && sunAt < lk.indexOf('_tower(x, hz, tw, th'),
          '\u2026drawn, and drawn BEFORE the skyline so the city stands in front of it',
          'after, and a setting sun is a coin pasted over the towers');
        ok(/PackedColorArray\(\[mid, rim, rim\]\)/.test(lk) && !/draw_circle\(at, r \* 2\.6/.test(lk),
          '\u2026and its glow is a real gradient, not a stack of flat discs',
          'one low-alpha circle has a hard edge; six of them have six \u2014 both were rendered');

        /* #1 — Maxwell and your ore fix the town, and every repair is somewhere you can see it. */
        const block = (src, head) => { const a = src.indexOf(head); return a < 0 ? '' : src.slice(a, src.indexOf('\n]', a)); };
        /* ⚑ 2026-10-12: every row also names who likes you more for it (the evening batch's block checks that). */
        const reps = [...block(gsG, 'const REPAIRS := [').matchAll(/\{ "id": "([a-z]+)",\s+"name": "[^"]+",\s+"ore": (\d+),\s+"likes": \[[^\]]*\] \}/g)].map((m) => m[1]);
        const maxw = townG.slice(townG.indexOf('class Maxwell extends TownChallenger:'), townG.indexOf('class Fix extends Node2D:'));
        const placed = (id) => new RegExp('"' + id + '"\\]').test(townG) || new RegExp('fix_id = "' + id + '"').test(townG);
        const unplaced = reps.filter((id) => !placed(id) || !(words('Maxwell')['fix_' + id] || []).length);
        ok(reps.length >= 5 && unplaced.length === 0,
          '⭐ every repair Maxwell offers is drawn in the town and has his line',
          unplaced.length ? 'MISSING: ' + unplaced.join(' ') : reps.join(' '));
        const rep = fnGd(gsG, 'repair');
        ok(/if repairs\.has\(id\) or GameState\.money\.ore < cost:\s*\n\s*return false/.test(rep) && /GameState\.money\.ore -= cost/.test(rep)
          && /town_fixed\.emit\(id\)/.test(rep),
          '…it costs the ore it says, refuses what you cannot afford, and tells the town');

        const parts = [...block(gsG, 'const BOAT := [').matchAll(/\{ "id": "([a-z]+)",\s+"who": "([A-Za-z ]+)",\s+"name": "([^"]+)"/g)]
          .map((m) => ({ id: m[1], who: m[2], name: m[3] }));
        /* ⛑ ROBERT WENT INDOORS 2026-09-24, so "standing in the town" is three files now —
           the square, the Academy and the island. A giver in a room town.gd cannot walk is
           the exact bug that moved PART_LINES into GameState. */
        const placedIn = townG + acadG + islG;
        const people = new Set([...placedIn.matchAll(/_add_challenger\("([^"]+)"|\.who = "([^"]+)"/g)].map((m) => m[1] || m[2]));
        const bad = parts.filter((p) => animals.includes(p.who) || !people.has(p.who) || !(words(p.who).part || []).length);
        ok(parts.length === 6 && bad.length === 0,
          '⭐ six parts, each from a person standing somewhere you can walk to, each with their words',
          bad.length ? 'BAD: ' + bad.map((p) => p.who).join(' ') : parts.map((p) => p.who + ':' + p.id).join(' '));
        /* ⚠⚠ ONE TABLE, READ BY BOTH ROOMS. town.gd hands these out by walking its OWN
           children; a second copy of Robert's sentence in academy.gd is how the two drift. */
        ok(/get: return Lines\.one\(who, "part", _w_part\)/.test(npcG) && !/PART_LINES/.test(townG + acadG + gsG)
          && !/part_line = /.test(townG + acadG),
          '…and Robert\'s reaches him in the Academy out of his own file, read by name in any room',
          '⚠ town.gd once walked its own children, and a giver in another scene silently got the fallback');
        const robert = parts.find((p) => p.who === 'Robert');
        ok(robert && !/plank|wood|timber|nail|tool|hammer|carpent|beam|saw/i.test(robert.id + ' ' + robert.name),
          '⚠⚠ …and Robert’s part is nothing wooden and nothing a carpenter holds',
          robert ? robert.name : 'no Robert');
        ok(/if GameState\.people\.hearts_for\(who\) >= GameState\.town\.BOAT_HEARTS:/.test(npcG) && /const BOAT_HEARTS := 3/.test(gsG),
          '…asked only of somebody who knows you, and the grayed row says how well');
        ok(/if GameState\.town\.boat_done\(\):\s*\n(?:\s*#[^\n]*\n)?\s*if GameState\.worlds\.later\(GameState\.town\.CHESS_CITY_URL\):[\s\S]*?else:\s*\n\s*rows\.append\(\{ "id": "sail", "text": "It's finished\. I'm going\." \}\)/.test(maxw) && !/ceo_beaten/.test(maxw)
          && /open_url\(CHESS_CITY_URL\)/.test(fnGd(gsG, 'sail')) && /url = GameState\.town\.CHESS_CITY_URL/.test(townG),
          '⭐ his answer: it sails when it is FINISHED, not when the CEO falls — to the same city the gate opens on');
        ok(/if m != null and GameState\.town\.boat_done\(\):\s*\n\s*m\.stand_at\(MAXWELL_DOCK\)/.test(townG)
          && /GameState\.town\.boat_changed\.connect\(_seat_maxwell\)/.test(townG),
          '…and when it is, Maxwell is waiting on the dock, every day');
        const merge2 = fn(PROF, 'townMerge');
        ok(/local\.repairs = union\(/.test(merge2) && /local\.boat = union\(/.test(merge2)
          && /for k in \(d\.get\("repairs", \{\}\) as Dictionary\):/.test(gsG) && /for k in \(d\.get\("boat", \{\}\) as Dictionary\):/.test(gsG),
          '⚠ a repair and a boat part are EARNED, so both sides union them');

        /* #9 — Garrett writes from across the water, and his post needs no account. */
        const mbx = code(rd('mailbox.gd'));
        const gl = [...block(gsG, 'const GARRETT := [').matchAll(/"id": "([a-z0-9]+)"[^\n]*\n\s*"text": "([^"]+)"/g)];
        const inter = fnGd(mbx, 'interact');
        ok(gl.length >= 6 && gl.every((m) => /— G\.$/.test(m[2])),
          '⭐ six letters from Garrett, each one signed', gl.map((m) => m[1]).join(' '));
        ok(inter.indexOf('garrett_due()') >= 0 && inter.indexOf('garrett_due()') < inter.indexOf('GameState.town.post()')
          && /or not GameState\.story\.garrett_due\(\)\.is_empty\(\)/.test(mbx),
          '…read BEFORE the account checks, so a signed-out player still gets them, and the flag goes up');
        ok(!/\.who = "Garrett"/.test(townG) && /local\.garrett = union\(/.test(fn(PROF, 'townMerge'))
          && /for k in \(d\.get\("garrett", \{\}\) as Dictionary\):/.test(gsG),
          '…he is not in the town (he is where you are going), and a letter read stays read everywhere');

        /* #10 — Murphy prices you off real numbers and invents none. */
        /* ⛑ ON THE ROAD EAST, THEN ON SHOGI ISLAND (his, 09-24), AND SINCE 2026-10-12 WHERE THE BOOTH
           STOOD: his, "Put the underwriter in his place. Maybe he's a character you may not unlock and
           the game still plays the same." His class is TownMoney.Underwriter; the evening batch's
           block checks when he turns up. Here: nobody else places him, and nothing waits on him. */
        const monG = rd('money.gd');
        const uw = monG.slice(monG.indexOf('class Underwriter extends TownNPC:'));
        ok(/m\.who = "Murphy"/.test(uw) && !/Underwriter|\.who = "Murphy"/.test(code(islG))
          && !/\.who = "Murphy"/.test(townG) && /"who": "Murphy"/.test(gsG)
          && /\{ "p": "p", "who": "Murphy",\s+"key": "",[^\n]*\n\s*"un": \["murphys-law"/.test(gsG),
          '⭐ Murphy’s nameplate is his square’s name, and his square is won in a GAME, never off him',
          '⛑ so a player who never meets him loses nothing: he is in the town or nowhere, never on the island');
        ok(/Pavilion\.SEATS \+ Pavilion\.OFF/.test(uw) && /GameState\.ladder\.CEO_ELO/.test(uw) && !/2400|1800|1400/.test(uw) && /\/ 400\.0/.test(uw),
          '…every rating he quotes is read off the Pavilion’s own table, through Elo’s 400',
          '⚠ a second copy of the seat ratings is a bookmaker quoting last season’s odds');
        ok(/if me <= 0:\s*\n\s*return Lines\.one\("Murphy", "quote_unrated"\)/.test(uw)
          && /^No history/.test((words('Murphy').quote_unrated || [''])[0]) && /P\.puzzleRating\(\)\.rating/.test(fnGd(gsG, 'site_rating')),
          '…yours is the only number the site keeps, and with none he writes no policy');

        /* #8 — the board by the bed. */
        /* ⚑ 2026-09-21. */
        /* his: "give me a little inside room with the bed and the dog bed and the chess board princess and I play on" */
        const homeG = rd('home.gd');
        const hb = homeG.slice(homeG.indexOf('class HomeBoard extends Interactable:'));
        ok(/var bed := TownBed\.new\(\)/.test(homeG) && /HomeBoard\.new\(\)/.test(homeG)
           && /DogBed\.new\(\)/.test(homeG) && /dog\.at_home = true/.test(homeG)
           && !/TownBed\.new\(\)|HomeBoard/.test(townG),
          '⭐ the bed, her bed and the board are in the house, and out of the square  (for whoever keeps the dogs outdoors, theirs are in the yard home.gd builds)');
        const shown = /const SHOWN := \[([\s\S]*?)\n\t\]/.exec(hb);
        const sl = shown ? strs(shown[1]) : [];
        ok(sl.length === 4 && sl.every((s) => /^(She|You)\b/.test(s) && !/"/.test(s)),
          '⛑ …and every line is what she DOES or what you do — never a word from her');
        /* ⚑ THE "is she here" TEST MOVED INTO _princess() ON 2026-09-25 when the board became a
           conversation — same question, asked once instead of inline. */
        ok(/site_scores\(\["academy-bootcamp", "notation-run", "trainer-pirc"\]\)/.test(fnGd(gsG, 'academy_stage'))
          && /id === 'academy-bootcamp'/.test(PROF) && /pjcc\.academy\.bootcamp/.test(fn(PROF, 'townScore') || PROF)
          && /d\.companion and \(d\.with_you\(\) or d\.at_home\)/.test(hb),
          '…she is shown the furthest lesson YOU reached, and only when she is with you');

        /* ══ THE BOARD IN THE HOUSE IS THE ONLY TABLE SHE SITS AT — 2026-09-25 ══ */
        /* his: "That's the only place you challenge princess, and teach her, etc. It's also
           when you realize she can play." · "Make Argus and Crockett NOT sit at the park
           tables, and you CAN'T challenge them until you discover that the dogs can play." */
        ok(/"id": "play"/.test(hb) && /GameState\.challenge\.sit_down\("Princess", "princess"/.test(hb),
          '⭐ the board in your house is where you sit down with Princess');
        /* ⚠⚠ AND THE ONLY ONE. A second door would make "the only place" false: her row is
           refused wherever she is standing, discovered or not, and her table is gone. */
        ok(/if companion:\s*\n\s*return "she only plays on the board at home"/.test(dogG),
          '…and she refuses everywhere else, in a sentence rather than by vanishing');
        /* ⚠ THE LOCK IS A SENTENCE, NOT A BOOL — a row that is gray for no stated reason reads
           as a bug, which is the same argument that killed the timed second press. */
        ok(/func locked_say\(\) -> String:/.test(chalG) && /elif shut != "":/.test(chalG)
          && /play\["text"\] = "Sit down\. Let's play\. — %s" % shut/.test(chalG),
          '…off one hook on TownChallenger, so any seat can say why it is shut');
        ok(/if not GameState\.story\.dogs_play:\s*\n\s*return "he is a dog"/.test(dogG),
          '⛑ Milo and Argus cannot be challenged until you know dogs play');
        /* ⚠⚠ THE REFUSAL MUST NOT GIVE THE SECRET AWAY. "he is a dog" is what you would think
           looking at him; "he can play, you just have not found out" is the game spoiling itself. */
        /* ⚑ 2026-10-12: past the secret it falls through to the lock every seat shares (your rating). */
        const shutLine = /return "([^"]*)"\s*\n\s*return super\(\)/.exec(fnGd(dogG, 'locked_say'));
        ok(shutLine && !/chess|play|princess|secret|yet/i.test(shutLine[1]),
          '…and the refusal does not tell you what you have not found out',
          shutLine ? '"' + shutLine[1] + '"' : 'no line');
        /* ⭐ THE DISCOVERY: sticky, saved, and pushed BOTH WAYS or a new device forgets it. */
        ok(/var dogs_play: bool = false/.test(gsG) && /func discover_dogs_play\(\) -> bool:/.test(gsG)
          && /"dogs_play": story\.dogs_play/.test(gsG) && /dogs_play = bool\(d\.get\("dogs_play", false\)\)/.test(gsG)
          && /if bool\(d\.get\("dogs_play", false\)\) and not story\.dogs_play:/.test(gsG)
          && /local\.dogs_play = !!\(local\.dogs_play \|\| remote\.dogs_play\)/.test(PROF),
          '⭐⭐ …and finding out is EARNED: saved, pushed, and merged by OR on both sides',
          '⚠ one-way sync has shipped here once already  [[everything-earned-syncs]]');
        /* ⚠⚠ STAGE 0 IS HER LYING DOWN ON THE BOARD and must unlock nothing. */
        ok(/const PLAYS_AT := 1/.test(hb) && /_stage >= PLAYS_AT and GameState\.story\.discover_dogs_play\(\)/.test(hb),
          '⚠⚠ …and it takes a MOVE: at stage 0 she lies down on the board, which unlocks nothing');
        /* ══ NO DOG SITS AT A PARK TABLE ══ */
        ok(/static func tabled\(\) -> Array:/.test(parkG)
          && /if not TownDog\.is_animal\(str\(\(r as Dictionary\)\["who"\]\)\):/.test(fnGd(parkG, 'tabled'))
          && /for row in rungs:/.test(parkG) && !/for row in SEATS:/.test(parkG),
          '⛑ no dog gets a table in the Pavilion, and who is an animal is asked of TownDog');
        /* ⚠⚠ AND THE LADDER IS UNTOUCHED. Deleting the rows would re-rate the room and take
           the Underwriter's next-cheapest-seat answer with it. */
        const seatRows = [...(/const SEATS := \[([\s\S]*?)\n\]/.exec(parkG) || [0, ''])[1]
          .matchAll(/"key": "([a-z]+)"/g)].map((m) => m[1]);
        ok(seatRows.length === 7 && ['princess', 'crockett', 'argus'].every((k) => seatRows.includes(k)),
          '…while SEATS still carries all seven — their rungs and ratings are real',
          seatRows.join(' '));
        /* ⚠ AND THE SIGN COUNTS THE ROOM IT IS NAILED UP IN, not the whole bench — "nine seats"
           over six tables is a board lying about where it is standing.
           ⚠⚠ SCOPED TO Standings. `Table._lock_who()` resolves a lock key to a name and MUST
           still search the whole ladder: Vince is locked behind Crockett, who has no table now
           and is still the lock. A blanket ban on SEATS+OFF in this file would break that. */
        const stand = parkG.slice(parkG.indexOf('class Standings extends Interactable:'));
        ok(/Pavilion\.tabled\(\) \+ Pavilion\.OFF/.test(stand)
          && !/Pavilion\.SEATS \+ Pavilion\.OFF/.test(stand)
          && /Pavilion\.SEATS \+ Pavilion\.OFF/.test(fnGd(parkG, '_lock_who')),
          '…and the ladder board counts the tables actually out there, while a LOCK still reads the whole bench');

        /* ══ #8b · THREE BEDS, AND SHE GOES ROUND THEM ══ */
        /* his: "can you give a bed for crockett and argus inside my home too? And in Maxwell's, there is a bed for princess when we walk in. Princess slowly goes to the beds, or she slowly goes to the table to learn chess." */
        /* ⚠⚠ dogG AND townG ARE THE COMMENT-STRIPPED COPIES from the block above. */
        const bedRoom = rd('checker_room.gd');
        const bedMax = rd('maxwell_home.gd');
        /* ⭐ ONE BED DRAWING, IN THE SHELL BOTH ROOMS EXTEND. */
        ok(/class DogBed extends Node2D:/.test(bedRoom)
           && !/class DogBed/.test(homeG) && !/class DogBed/.test(bedMax)
           && /CheckerRoom\.DogBed\.new\(\)/.test(homeG) && /CheckerRoom\.DogBed\.new\(\)/.test(bedMax),
          '⭐ a dog bed is one drawing, in the shell both checkers are built from');
        ok(/TownDog\.paint_bed\(self, who\)/.test(bedRoom) && /static func paint_bed\(/.test(dogG)
           && /\(c\[0\] as Color\)\.darkened\(/.test(fnGd(dogG, 'paint_bed'))
           && /c\[2\]/.test(fnGd(dogG, 'paint_bed')),
          '\u2026painted out of TownDog.COATS \u2014 whose bed it is can be SEEN, in coat and collar',
          'a hex typed in a room file is the shade that survives the next repaint of a dog');
        const bedsFor = [...homeG.matchAll(/\[where\("\w+", ([A-Z_]+_BED_AT)\), "(\w+)"\]/g)].map((m) => m[2]);
        ok(bedsFor.join(' ') === 'Princess Milo Argus',
          '\u2026and all three dogs have one in Nate\u2019s checker', bedsFor.join(', ') || 'none');
        /* ⚠⚠ MAXWELL'S IS A CUSHION, NOT A BED YOU SLEEP IN. */
        ok(/cushion\.who = "Princess"/.test(bedMax) && !/TownBed/.test(code(bedMax)),
          '\u2026with a fourth in Maxwell\u2019s, empty, and still not a bed a day can end in');

        /* ⚠⚠ THE HAUNTS ARE DERIVED FROM THE FURNITURE, NOT TYPED. */
        const hm2 = /dog\.haunts = PackedVector2Array\(\[([\s\S]*?)\]\)/.exec(homeG);
        /* ⚠ SPLIT ON LINES, NOT ON COMMAS. */
        const legs = hm2
          ? hm2[1].split('\n').map((l) => l.trim().replace(/,$/, '')).filter(Boolean) : [];
        ok(legs.length === 4 && legs.every((l) => /^where\("\w+", [A-Z_]+_AT\) \+ Vector2\(/.test(l)),
          '⭐ she has four places to be, every one read off the furniture that is there',
          legs.join(' \u00b7 ') || 'no haunts');
        ok(legs.filter((l) => /_BED_AT\) \+/.test(l)).length === 3
           && legs.some((l) => /^where\("Board", BOARD_AT\) \+/.test(l)),
          '\u2026the three beds and the board  (his: "the beds, or \u2026 the table to learn chess")');
        const v2h = (src, name) => {
          const h = layoutAt(src, name); if (h) return h;
          const m = new RegExp('const ' + name + ' := Vector2\\((-?[\\d.]+), (-?[\\d.]+)\\)').exec(src);
          return m ? { x: +m[1], y: +m[2] } : null;
        };
        const fm = /const FLOOR := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(bedRoom);
        const floor = fm ? { x: +fm[1], y: +fm[2], w: +fm[3], h: +fm[4] } : null;
        const spotOf = (leg) => {
          const m = /^where\("\w+", ([A-Z_]+_AT)\) \+ Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(leg);
          const base = m && v2h(homeG, m[1]);
          return base ? { x: base.x + +m[2], y: base.y + +m[3] } : null;
        };
        const HER = 22;                                  // TownDog.radius_body
        const places = legs.map(spotOf);
        const outside = places.filter((q) => !q || !floor
          || q.x - HER < floor.x || q.x + HER > floor.x + floor.w
          || q.y - HER < floor.y || q.y + HER > floor.y + floor.h).length;
        ok(!!floor && outside === 0,
          '\u2026and every one is a place she fits, inside the room\u2019s own floor',
          outside + ' haunts outside CheckerRoom.FLOOR');
        /* ⚠⚠ BESIDE THE TABLE, NOT IN IT. */
        const bs = /_solid\(board, Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)\)/.exec(homeG);
        const sc = +(/board\.scale = Vector2\(([\d.]+),/.exec(homeG) || [0, 1])[1];
        const bAt = v2h(homeG, 'BOARD_AT');
        const box = bs && bAt ? { x: bAt.x + +bs[1] * sc, y: bAt.y + +bs[2] * sc,
          w: +bs[3] * sc, h: +bs[4] * sc } : null;
        const inBox = places.filter((q) => q && box && q.x > box.x - HER && q.x < box.x + box.w + HER
          && q.y > box.y - HER && q.y < box.y + box.h + HER).length;
        ok(!!box && inBox === 0,
          '\u2026and the table one is BESIDE the table, not standing inside it',
          inBox + ' haunts inside the board\u2019s solid box');


        /* ══ SHE RANGES AHEAD OF HIM NOW ══ */
        /* his: "can you slow me down 25%? And have Princess drift ahead of me and kind of move on her own using a randomizer function." */
        const plyG = rd('player.gd');
        const SPD = tune('walk_speed');
        const tf = +(/const TROT_SHARE := ([\d.]+)/.exec(dogG) || [0, 0])[1];
        ok(SPD > 0 && tf > 0 && tf < 0.9 && /static func trot\(\) -> float: return Tuning\.now\(\)\.walk_speed \* TROT_SHARE/.test(dogG),
          '⭐ her trot is a FRACTION OF HIS WALK, read off the dials',
          SPD + ' x ' + tf + ' = ' + Math.round(SPD * tf) + ' u/s');
        ok(tf * 1.6 > 1.05,
          '\u2026and her run is faster than he walks, or she can never get in front at all',
          'measured 09-23: at a trot alone she settled 35 units BEHIND him, every time');
        const leadM = /const LEAD := Vector2\(([\d.]+), ([\d.]+)\)/.exec(dogG);
        const settle = +(/const SETTLE := ([\d.]+)/.exec(dogG) || [0, 0])[1];
        ok(!!leadM && settle > 0 && +leadM[1] > settle,
          '\u2026and the nearest spot she picks is further ahead than she can ever lag',
          leadM ? 'nearest ' + leadM[1] + ' against a ' + settle + '-unit band' : 'no LEAD');
        ok(/var pace: float = trot\(\) \* 1\.6 if global_position\.distance_to\(spot\) > SETTLE else trot\(\)/.test(dogG),
          '\u2026she runs until she REACHES her spot, not until she is near RUN_AT of it',
          'RUN_AT is 260 wide and a trot loses ground every frame inside it');
        ok(/var aim := _cast\.rotated\(head\.angle\(\)\)/.test(dogG)
           && /p\.facing if p\.facing\.length_squared\(\)/.test(dogG),
          '\u2026and her spot is in HIS frame, so "ahead and a little left" survives a corner');
        ok(/if randf\(\) < 0\.34:\s*\n\s*_side = -_side/.test(dogG),
          '\u2026she keeps to one side and crosses now and then, rather than zig-zagging through him');

        /* ══ SLOWLY, WHICH IS A DIFFERENT NUMBER FROM HER FOLLOW SPEED ══ */
        const amble = +(/const AMBLE := ([\d.]+)/.exec(dogG) || [0, 0])[1];
        /* ⚑ DERIVED, NOT READ, SINCE 09-23. */
        /* ⚠ HELD AT THE WALK SLIDER'S LOW END, her slowest trot, so no walk he sets stops a push. */
        const trot = (tuneRange('walk_speed') || [NaN])[0] * tf;
        ok(amble > 0 && trot > 0 && amble < trot * 0.5,
          '⭐ she AMBLES indoors \u2014 under half the speed she catches you up at, however slow he walks',
          amble + ' u/s against her slowest trot, ' + trot + '  (at his walk: ' + Math.round(SPD * tf) + ')');
        ok(/var speed: float = pace if pace > 0\.0 else trot\(\) \* \(1\.6 if d > RUN_AT/.test(dogG),
          '\u2026and an amble never breaks into a run, the way the catch-up gait does');
        const am = fnGd(dogG, '_amble');
        ok(/if not _walk_to\(haunts\[_haunt\], [\d.]+, delta, AMBLE\):\s*\n\s*return false/.test(am)
           && /_dwell -= delta/.test((am.split('return false')[1] || '')),
          '\u2026and the dwell counts down only once she has ARRIVED',
          'ticking it while she walks ends a long haul in her turning round on the spot');
        /* \u26d1 THE PICK MOVED OUT OF _amble ON 2026-09-24 and grew a second rule with it. */
        /* his: "Princess tries any bed when open but the other dogs only use their own" */
        const ph = fnGd(dogG, '_pick_haunt');
        ok(/if i != _haunt and _free\(i\):/.test(ph) && /return -1/.test(ph)
           && /return open\[randi\(\) % open\.size\(\)\]/.test(ph),
          '\u2026and she never picks the haunt she is already sitting on, nor one with a dog on it',
          'sitting through two dwells is indistinguishable from being stuck');
        /* \u26a0\u26a0 "ONLY THEIR OWN" IS THE LIST, NOT A BRANCH. */
        const free = fnGd(dogG, '_free');
        ok(/var choosy := haunts\.size\(\) > 1/.test(am) && /d != self and d\.visible/.test(free)
           && /_lodger\("Milo", where\("MiloBed", MILO_BED_AT\)\)/.test(homeG)
           && /d\.haunts = PackedVector2Array\(\[at\]\)/.test(homeG),
          '\u2b50 she takes any cushion that is FREE, and the other two only ever their own',
          'the owner never yields: one haunt each, so there is nothing for them to check');
        /* \u26a0 A HIDDEN DOG HOLDS NOTHING. */
        ok(/d\.visible/.test(free), '\u2026and a dog who is out does not hold its bed against her');
        /* ⚠⚠ EMPTY IS THE OLD BEHAVIOR EXACTLY. */
        ok(/haunts\.is_empty\(\)/.test(dogG) && !/haunts/.test(townG),
          '\u2026while a dog with no haunts is the dog she has always been',
          'nothing outdoors sets them');
        /* ⚠⚠ THE BOB IS PACED BY DISTANCE. */
        /* ⚠ SINCE 2026-09-26 it is the distance she actually COVERED, not the step she asked
           for — a trunk can now stop her mid-stride and she must not trot on the spot. */
        ok(/_gait \+= \(global_position - was\)\.length\(\)/.test(dogG)
           && /_bob = sin\(_gait \/ [\d.]+\) \* 2\.0/.test(dogG)
           && !/_bob = sin\(_t \*/.test(dogG),
          '\u2026and her gait is paced by DISTANCE, so a slow walk looks slow');
      }
      /* ══ 36 · 2026-09-21 — HIS BATCH: WALK2, WALK-IN DOORS, SOLID TOWN, HOME, THE MOVE ══ */
      {
        const rd = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n');
        const code = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const pm = code(rd('player_model.gd')), dr = code(rd('door.gd')), ex = code(rd('exit_door.gd'));
        const np = code(rd('npc.gd')), dg = code(rd('dog.gd')), pl = code(rd('player.gd'));
        const ui = code(rd('town_ui.gd')), tw = code(rd('town.gd')), hm = code(rd('home.gd'));
        const GM = fs.readFileSync(path.join(ROOT, 'tests/gen-models.js'), 'utf8');

        /* his walk is "walk2", and 1.3 still carries Walk (Idle's copy) and a 1-frame Walk.001. */
        const mc = fnGd(pm, '_match_clip');
        ok(/_match_clip\(\["walk2", "walk"/.test(pm) && mc.indexOf('for w in words') >= 0
           && mc.indexOf('for w in words') < mc.indexOf('for a in _anim.get_animation_list()'),
          '⭐ "walk2" wins the walk slot — the word list is a PREFERENCE, so it loops outside the clips',
          'clips-outside, the first clip matching ANY word won and "Walk" beat "walk2"');

        /* ⛑⛑ THE TOWNSFOLK ARE A PHOTOGRAPH OF THE PLAYER'S MODEL, so a new nate.glb makes
           people_idle.png a picture of somebody who no longer exists — every NPC quietly stays
           the OLD Nate while the player is the new one, and people_sheet.gd's only guard is the
           atlas SIZE, which does not change. Nearly shipped that way on 2026-09-29 when Nate_1.5
           landed. Both files are generated into this folder, so the bake must not predate the
           export. ⚠ Re-bake with the sheet probe, then `npm run gen:checkertown`. */
        {
          const glb = GDF('nate.glb'), png = GDF('people_idle.png');
          const hasBoth = fs.existsSync(glb) && fs.existsSync(png);
          const gm = hasBoth ? fs.statSync(glb).mtimeMs : 0;
          const pmt = hasBoth ? fs.statSync(png).mtimeMs : 0;
          ok(hasBoth && pmt >= gm,
            '⛑⛑ the baked townsfolk are a picture of the CURRENT nate.glb, not an older one',
            !hasBoth ? 'one of nate.glb / people_idle.png is missing'
                     : 'sheet baked ' + Math.round((pmt - gm) / 1000) + 's after the model was exported');
        }

        /* doors: a step in, and only where a step is safe. */
        const pp = fnGd(dr, '_physics_process');
        /* ⚠ 2026-10-10: the test moved into walks_in(), which the tap asks as well. */
        const wi = fnGd(dr, 'walks_in');
        ok(/if not live or not walks_in\(\):\s*\n\s*return/.test(pp) && /\bwalk_in and scene_path != ""/.test(wi)
           && /url == ""/.test(wi) && /energy_cost <= 0/.test(wi) && /interact\(_you\)/.test(pp),
          '⭐ you WALK into a door — a scene door only',
          '⚠⚠ a url door from a footstep is a blocked popup, and open_url then navigates the town away');
        ok(/_armed = true/.test(pp) && /if not _armed/.test(pp) && /\.dot\(way\.normalized\(\)\) < aim/.test(pp),
          '…armed by stepping OFF the mat, and only when you are heading in',
          'you come back out standing on it; and sliding along a front must not pull you in');
        ok(/StaticBody2D\.new\(\)/.test(fnGd(dr, '_ready')) && /footprint\(\)/.test(fnGd(dr, '_ready'))
           && /_shape\.position = /.test(fnGd(dr, '_ready')),
          '⭐ a building is SOLID, and its reach moves to its door  (nobody can stand in its middle)');
        ok(/_body\.set_deferred\("disabled", not live\)/.test(pp),
          '…and a hidden door is not a wall  (the Assembly\'s secret one stands invisible)');
        ok(/return Rect2\(\)/.test(fnGd(ex, 'footprint')) && /Vector2\(0\.0, 80\.0\)/.test(fnGd(ex, 'door_into')),
          '…a room\'s way out is a hole you walk DOWN into');
        for (const [file, cls] of [['arcade.gd', 'class Cabinet extends TownDoor:'], ['depths.gd', 'class Cage extends TownDoor:'],
                                   ['stairwell.gd', 'class FloorDoor extends TownDoor:']]) {
          const src = rd(file), body = src.slice(src.indexOf(cls), src.indexOf('func _ready_extra', src.indexOf(cls)));
          ok(/solid = false/.test(body), '…and ' + cls.split(' ')[1] + ' stays a thing you stand at, not a wall');
        }

        /* people are solid; the dog at your heel is not, and she steps back. */
        ok(/StaticBody2D\.new\(\)/.test(fnGd(np, '_ready_extra')) && /_body\.set_deferred\("disabled", _away\)/.test(np),
          '⭐ people are SOLID, and not on a day they are out');
        ok(/solid = false/.test(fnGd(dg, '_init')) && /return _follow/.test(fnGd(dg, 'yields'))
           && /dog\.radius = 40\.0/.test(dg),
          '…Princess is not (solid, at heel, she would pin you) — her reach is 40, and she YIELDS');
        ok(/\(best_y and not y\)/.test(fnGd(pl, '_refresh_target')),
          '…so what you walked up to beats the dog behind you  (his: "she gets in the way")');

        /* the options go when you pick one. */
        const pk = fnGd(ui, '_pick');
        ok(/b\.visible = false/.test(pk) && /_hold = _read_secs\(said\)/.test(pk)
           && /_rows_back\(\)/.test(fnGd(ui, '_process')),
          '⭐ the rows VANISH on a pick and come back once the answer has had its time');
        ok(/if _hold > 0\.0:/.test(fnGd(ui, '_unhandled_input')) && /_rows_back\(\)/.test(fnGd(ui, '_input')),
          '…a hidden row cannot be picked, and a tap brings them back early');
        ok(/not \(holding and _bubbled\)/.test(fnGd(ui, '_layout')),
          '…and while they are gone there is no empty band over half the screen');

        const v = (name) => { const m = new RegExp('const ' + name + ' := Vector2\\((-?[\\d.]+), (-?[\\d.]+)\\)').exec(tw); return m ? [+m[1], +m[2]] : null; };
        /* ⛑ ONE BUILDING UP THERE SINCE 2026-09-22. */
        const hall = v('HALL_AT'), camp = v('CAMP_AT');
        ok(hall && hall[1] < -900 && /hall\.position = HALL_AT/.test(tw) && !/GAUNTLET_AT/.test(tw),
          '⭐ the Assembly is NORTH, and it is the only thing up there', hall + '');
        ok(hall && hall[1] <= -300 - 648 && hall[1] >= -300 - 1000
           && /Rect2\(TRAIL_X - 26\.0, YARD\.end\.y, 52\.0, -20\.0 - YARD\.end\.y\)/.test(tw),
          '…a whole window screen above the square\'s roofline, up ONE haul road',
          'the Assembly at ' + (hall && hall[1]) + '; the square\'s roofs reach -300 and the window is 648');
        /* ⚠ THE PAD HAS TO MEET THE SHACK'S FRONT AND HOLD THE CRANE'S FEET. */
        const yd = /const YARD := Rect2\(HALL_AT\.x - ([\d.]+), HALL_AT\.y \+ ([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(tw);
        const cr8 = /const CRANE_AT := Vector2\(HALL_AT\.x \+ ([\d.]+), HALL_AT\.y \+ ([\d.]+)\)/.exec(tw);
        const shackH = /hall\.size = Vector2\([\d.]+, ([\d.]+)\)/.exec(tw);
        ok(yd && cr8 && shackH && +yd[2] <= +shackH[1] / 2
           && +cr8[2] > +yd[2] && +cr8[2] < +yd[2] + +yd[4]
           && +cr8[1] + 48 <= +yd[3] - +yd[1],
          '…and the yard meets the shack\'s front and the crane is standing ON it',
          yd ? 'pad ' + yd[3] + '×' + yd[4] + ', crane at +' + cr8[1] + ',+' + cr8[2] : '?');
        const gr = /const GROUND_RECT := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(tw);
        const wr = /const WATER_RECT := Rect2\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(tw);
        ok(camp && camp[0] >= 1700 && /Rect2\(GATE_AT\.x - 90\.0, -20\.0, CAMP_AT\.x \+ 20\.0/.test(tw)
           && /_add_challenger\("Kedar", "dad", 1400, "k", CAMP_AT \+/.test(tw),
          '⭐ the Sand Mines are RIGHT and a walk away, and Kedar works there',
          'camp ' + camp + ' — most of a screen of road east of the square');
        /* ⚠ THE MAP AND THE SEA HAVE TO FOLLOW IT OUT: sand past the edge, or water stopping in grass. */
        ok(gr && wr && camp && +gr[1] + +gr[3] >= camp[0] + 360 + 100
           && +wr[1] + +wr[3] >= +gr[1] + +gr[3] - 1,
          '…and the ground reaches past the sand while the sea runs to the same edge',
          gr ? 'edge ' + (+gr[1] + +gr[3]) + ', sand ends ' + (camp[0] + 360) + ', water ends ' + (+wr[1] + +wr[3]) : '?');

        const ch = tw.slice(tw.indexOf('class CheckerHome extends TownDoor:'));
        ok(/TownProp\.make\("res:\/\/art\/checker\.glb"/.test(ch) && /sign_text = " "/.test(ch)
           && /solid = false/.test(ch) && /aim = -1\.0/.test(ch) && /scene_path = "res:\/\/rooms\/home\.tscn"/.test(tw)
           && fs.existsSync(GDF('home.tscn')) && fs.existsSync(GDF('checker.glb')),
          '⭐ Nate\'s home is HIS checker, nothing added outside, and you walk onto it to go in');
        ok(/\{ name: 'Checker', out: 'assets\/models\/checker\.glb', godot: 'art\/checker\.glb' \}/.test(GM),
          '…and gen:models carries the checker into the game, the way it carries him');
        const cr = code(rd('checker_room.gd'));
        ok(/const ROOM := Rect2\(-576\.0, -330\.0, 1152\.0, 660\.0\)/.test(cr) && /world_bounds = FLOOR/.test(cr)
           && /extends CheckerRoom/.test(hm),
          '…a LITTLE room inside: a window-sized room, a small lit floor  (one shell, both houses)');
      }
      /* ══ 37 · 2026-09-22 — THE DAY STARTS AND ENDS AT HOME, AND MAXWELL HAS ONE TOO ══ */
      {
        const rd = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n');
        const code = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const tw = code(rd('town.gd')), pr = code(rd('prop_model.gd')), hm = code(rd('home.gd'));
        /* the bed is the only way to turn the day over. */
        ok(/player_start = HOME_AT \+ Vector2\(CheckerHome\.WIDE \* 0\.5 \+ 44\.0, 0\.0\)/.test(tw),
          '⭐ the town\'s default arrival is your own front door, not the middle of the square',
          'his: "each day start and end inside the checker home"');
        ok(/var bed := TownBed\.new\(\)/.test(hm) && !/GameState\.sleep|func sleep\(/.test(rd('bed.gd') + rd('game_state.gd')),
          '…and the only bed in the game is in that house — the dreams are there; the day itself turns at midnight  (his, 2026-10-03)');
        /* his: "add the boot check to private" */
        const boot = /run\/main_scene="([^"]+)"/.exec(rd('project.godot'));
        ok(boot && boot[1] === 'res://rooms/home.tscn',
          '…and the game BOOTS in the house', boot ? boot[1] : 'no main_scene in project.godot');
        const mh = code(rd('maxwell_home.gd'));
        const at = (n) => { const m = new RegExp('const ' + n + ' := Vector2\\((-?[\\d.]+), (-?[\\d.]+)\\)').exec(tw); return m ? [+m[1], +m[2]] : null; };
        const red = at('HOME_AT'), black = at('MAX_HOME_AT');
        /* ⛑ SPACED OUT AND OFF THE LANE, 2026-09-24 (his: "Remove the road between black and
           red checker, and space them out a bit"). Two numbers moved: the gap between the two
           discs and where the lane stops. ⚠ STILL A NEIGHBOR, NOT A SUBURB — the checkers are
           230 across, so the band below is "more than one checker of clear ground, under three". */
        const gap = red && black ? Math.hypot(red[0] - black[0], red[1] - black[1]) - 230 : 0;
        ok(red && black && gap > 150 && gap < 700
           && /his\.position = MAX_HOME_AT/.test(tw) && /class CheckerHut extends CheckerHome:/.test(tw),
          '⭐ Maxwell\'s checker is spaced out from yours, and still on the same row',
          red + ' · ' + black + ' — ' + Math.round(gap) + ' of clear ground between the discs');
        /* ⚠⚠ THE LANE STOPS AT YOUR OWN DOOR. It used to start at MAX_HOME_AT and run past
           both, which is the thing he asked to have taken out. */
        ok(/Rect2\(HOME_AT\.x, HOME_AT\.y - 20\.0, -ROAD_X - HOME_AT\.x, 40\.0\)/.test(tw)
           && !/Rect2\(MAX_HOME_AT\.x, HOME_AT\.y - 20\.0/.test(tw),
          '…and there is no road between the two of them any more',
          '⚠ the lane runs from your checker to the main road, and nowhere else');
        /* ⚠ AND NO OTHER CHECKER MOVED INTO THE SPACE. A lot 180 away in x and 30 in y was
           overlapping the black disc by 50 units the moment it went out to -700. */
        const otherLots = [...tw.slice(tw.indexOf('func _furnish_neighbors'),
          tw.indexOf('func _furnish_trees')).matchAll(/Vector2\((-?[\d.]+), (-?[\d.]+)\)/g)]
          .map((m) => [+m[1], +m[2]]);
        const onTop = otherLots.filter(([x, y]) => [red, black].some((h) =>
          h && Math.abs(x - h[0]) < 230 && Math.abs(y - h[1]) < 126));
        ok(onTop.length === 0, '…and no neighbor\'s checker is parked on top of either of them',
          onTop.map((p) => p.join(',')).join(' · ') || otherLots.length + ' lots, all clear');
        ok(/his\.scene_path = "res:\/\/rooms\/maxwell\.tscn"/.test(tw) && fs.existsSync(GDF('maxwell.tscn'))
           && /extends CheckerRoom/.test(mh) && /_furnish_room/.test(mh),
          '…and it OPENS: a room like Nate\'s, out of the same shell');
        ok(!/TownBed/.test(mh) && /class Bunk extends Node2D:/.test(mh),
          '⚠⚠ …with his bunk as SCENERY — one bed in the game, or a day could end in his house');
        ok(/const BLACK := Color\("1b1a20"\)/.test(tw) && /m\.albedo_color = c/.test(fnGd(pr, '_tint'))
           && /src\.duplicate\(\)/.test(fnGd(pr, '_tint')),
          '…and BLACK is the scene dressing it: albedo on a DUPLICATED material',
          '⚠⚠ his dark material never left Blender — glTF writes only the materials faces use');
        /* ⚑ `_px` SINCE THE BAKE, 2026-09-24 — a TownProp is no longer the SubViewport itself,
           so it remembers the pixel size it asked for. Same rule, different name. */
        ok(/size = _prop\.draw_size\(WIDE\)/.test(tw) && /float\(_px\.y\) \/ float\(_px\.x\)/.test(pr),
          '…and both are drawn at the texture\'s own proportions  (the viewport carries 4% padding)',
          'one CheckerHome draws both houses — Maxwell\'s changes only the paint and the room');
      }
      /* ══ 35 · ONE REAL VOICE LINE EACH ══ */
      {
        const vc = fs.readFileSync(GDF('town_voice.gd'), 'utf8');
        ok(/^class_name TownVoice$/m.test(vc), 'there is somewhere for a recording to plug in');
        ok(/if ResourceLoader\.exists\(path\)/.test(vc),
          '\u26a0\u26a0 …and it asks before it loads',
          'load() on a path not in the .pck prints an engine error per call, thirteen a visit');
        ok(/_cache\[id\] = s/.test(vc) && /if _cache\.has\(id\):/.test(vc),
          '\u26a0 misses are cached too, or every conversation hits the filesystem again');
        ok(/not GameState\.sound_on/.test(vc), '\u26a0 and the mute silences it like everything else');
        ok(/v\.hello\(who\)/.test(npc), '\u2026a greeting plays when somebody opens their mouth');
        /* ⚠⚠ NO AUDIO SHIPS TODAY, and the whole design rests on that being true. */
        const voiceDir = GDF('voice');
        const files = fs.existsSync(voiceDir)
          ? fs.readdirSync(voiceDir).filter((f) => /\.ogg$/i.test(f)) : [];
        ok(true, '\u2026and today the folder holds ' + files.length + ' recording(s)',
          files.length ? files.join(' ') : 'the socket costs nothing while it is empty');
        /* ⭐⭐ THE SCRIPT CANNOT FALL BEHIND THE CAST. */
        const scriptPath = path.join(ROOT, 'private/docs/VOICE-SCRIPT.md');
        if (fs.existsSync(scriptPath)) {
          const doc = fs.readFileSync(scriptPath, 'utf8');
          const all = GD_LIST.filter((f) => f.endsWith('.gd'))
            .map((f) => fs.readFileSync(GDF(f), 'utf8')).join('\n');
          const speaks = new Set();
          [...all.matchAll(/\.who = "([^"]+)"/g)].forEach((m) => speaks.add(m[1]));
          [...all.matchAll(/_add_challenger\("([^"]+)"/g)].forEach((m) => speaks.add(m[1]));
          /* ⛑ And the three dogs, built out of TownDog.CAST since 2026-09-24 — neither shape above sees them. */
          const castRow = /const CAST := \{([\s\S]*?)\n\}/.exec(all);
          if (castRow) [...castRow[1].matchAll(/^\t"([^"]+)": \{/gm)].forEach((m) => speaks.add(m[1]));
          const slug = (w) => w.toLowerCase().replace(/ /g, '-');
          const listed = new Set([...doc.matchAll(/`([a-z-]+)\.ogg`/g)].map((m) => m[1]));
          const noRow = [...speaks].filter((w) => !listed.has(slug(w)));
          const noOne = [...listed].filter((f) => ![...speaks].some((w) => slug(w) === f));
          ok(speaks.size >= 12 && noRow.length === 0 && noOne.length === 0,
            '\u2b50\u2b50 the recording script names every character in the town, and nobody else',
            (noRow.length ? 'NO ROW: ' + noRow.join(' ') + '  ' : '') +
            (noOne.length ? 'NOBODY: ' + noOne.join(' ') : speaks.size + ' speak, ' + listed.size + ' listed'));
        } else {
          ok(false, 'private/docs/VOICE-SCRIPT.md is missing');
        }
      }

      /* ══ 38 · 2026-09-24 — HIS BATCH: THE ROWBOAT, THE DOGS' HOURS, ROUND ROOMS ══ */
      /* his: "The rowboat doesn't work - the screen just glitches; my user got stuck in between screens back and forth. Make sure no door can do that." */
      {
        const rd = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n');
        const code = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
        const dr = code(rd('door.gd')), dg = code(rd('dog.gd')), tw = code(rd('town.gd'));
        const cr = code(rd('checker_room.gd')), hm = code(rd('home.gd')), mx = code(rd('maxwell_home.gd'));
        const num = (src, n) => { const m = new RegExp('const ' + n + ' := (-?[\\d.]+)').exec(src); return m ? +m[1] : NaN; };

        /* ══ the rowboat, and every other door ══ */
        ok(!/overlaps_body/.test(dr) && !/_mat: Area2D/.test(dr),
          '⛑⛑ no door asks an Area2D whether you are standing on it',
          'an Area2D\'s overlap list is EMPTY on the frame a scene loads — it answers "no" and arms the door');
        const om = fnGd(dr, '_on_mat');
        ok(/clampf\(p\.x, m\.position\.x, m\.end\.x\)/.test(om)
           && /distance_squared_to\(near\) <= r \* r/.test(om) && /_you\.radius/.test(om),
          '…it MEASURES it — the mat is a rect, you are a circle, and the answer is true on frame zero');
        const pp2 = fnGd(dr, '_physics_process');
        /* ⚠⚠ THE HYSTERESIS IS INSET, NOT GROWN, and the difference is a doorway that opens. */
        ok(/if not _on_mat\(at, 0\.0\):\s*\n\s*_armed = true/.test(pp2)
           && /_on_mat\(at, -ARM_INSET\)/.test(pp2) && num(dr, 'ARM_INSET') > 0,
          '⭐ arming is "off the mat" and firing is "properly ON it" — the dead band is inside the doorstep',
          'arming and firing on one shared edge is a door a body can jitter open');
        const st = /const SETTLE_TICKS := (\d+)/.exec(dr);
        ok(/if _ticks <= SETTLE_TICKS:\s*\n\s*return/.test(pp2) && st && +st[1] >= 1 && +st[1] <= 4,
          '⭐ …and a door neither fires NOR ARMS for a tick or two after a scene loads',
          '⛑ doors are furnished before the player, so on tick one they read a position the clamp has not seen; '
          + 'and every tick after that is 9 units you walk unseen');
        /* ⛑⛑ THE SECOND BOUNCE THIS BATCH FOUND. */
        ok(/out\.return_at = Vector2\(MID\.x, MID\.y \+ RY - [\d.]+\)/.test(cr),
          '…and the checker rooms say where you come back IN, rather than leaving it to a fallback',
          'a landing point a clamp has to rescue is a landing point that arms the door you arrived by');
        /* ⚠⚠ THE OTHER HALF, AND IT IS WHY THE FIX HAD TO GO IN door.gd. */
        const onSelf = (src, tie, dock) => {
          const t = /const ([A-Z_]+_TIE) := Vector2\((-?[\d.]+), (-?[\d.]+)\)/g;
          const a = [...src.matchAll(t)].find((m) => m[1] === tie);
          const d = new RegExp('const ' + dock + ' := Rect2\\((-?[\\d.]+), (-?[\\d.]+), ([\\d.]+), ([\\d.]+)\\)').exec(src);
          if (!a || !d) return false;
          return +a[2] >= +d[1] && +a[2] <= +d[1] + +d[3]
              && +a[3] >= +d[2] && +a[3] <= +d[2] + +d[4];
        };
        const seaSrc = rd('sea.gd');
        ok(onSelf(seaSrc, 'TOWN_TIE', 'TOWN_DOCK') && onSelf(seaSrc, 'ISLE_TIE', 'ISLE_DOCK')
           && /const MOORING := Vector2\(0\.0, 398\.0\)/.test(rd('island.gd'))
           && /boat\.return_at = Vector2\(930\.0, 900\.0\)/.test(tw),
          '…and all four landing points still put you down IN the boat you arrived in',
          'that is the design; what was broken was the door reading it wrong');
        /* ⛑ HALF THE WATER, WHOLE DOCKS (2026-09-24. */
        /* his: "shorten the distance to shogi island by rowboat in half" */
        const tieA = /const TOWN_TIE := Vector2\((-?[\d.]+),/.exec(seaSrc);
        const tieB = /const ISLE_TIE := Vector2\((-?[\d.]+),/.exec(seaSrc);
        const dockW = /const TOWN_DOCK := Rect2\(-?[\d.]+, -?[\d.]+, ([\d.]+),/.exec(seaSrc);
        const gap = tieA && tieB ? +tieB[1] - +tieA[1] : 0;
        ok(gap > 1200 && gap < 1700 && dockW && +dockW[1] === 230,
          '⭐ the crossing is about 1,400 units of water, and the docks are still 230 across',
          gap + ' units tie to tie, dock ' + (dockW ? dockW[1] : '?'));

        /* ══ the dogs' hours ══ */
        const inAt = /const IN_AT := (\d+) \* 60/.exec(dg), outAt = /const OUT_AT := (\d+) \* 60/.exec(dg);
        const slop = /const SLOP := (\d+)/.exec(dg);
        ok(inAt && +inAt[1] === 20 && outAt && +outAt[1] === 6 && slop && +slop[1] === 15,
          '⭐ the dogs come in at eight and go out at six, give or take a quarter of an hour',
          inAt && outAt && slop ? inAt[1] + ':00 / ' + outAt[1] + ':00 ±' + slop[1] : 'missing');
        const cur = /const CURFEW := (\d+) \* 60 \+ (\d+)/.exec(dg);
        ok(cur && +cur[1] === 21 && +cur[2] === 30
           && /CURFEW if who_ == "Princess" else IN_AT \+ _slop/.test(dg),
          '⭐ …and hers is 9:30 ON THE DOT, with no slop on it',
          'his words: "goes home no matter where I am at 9:30 on the dot"');
        /* ⚠⚠ SALTED, NEVER randf(). */
        ok(/posmod\(hash\("dog\|%s\|%s\|%d" % \[who_, tag, night\]\), SLOP \* 2 \+ 1\) - SLOP/.test(dg)
           && !/rand/.test(fnGd(dg, 'indoors')) && !/rand/.test(fnGd(dg, '_visiting'))
           && !/rand/.test(fnGd(dg, '_slop')),
          '…and the hour a dog keeps is SALTED, so it does not move while you are looking at it');
        ok(/const DAY_VISITS := \d+/.test(dg) && /const VISIT_MINS := \d+/.test(dg)
           && /if who_ == "Princess":\s*\n\s*return false/.test(fnGd(dg, '_visiting')),
          '⭐ they drop in during the day too, and she does not  (she is at your heel all day)',
          'a second copy of her asleep at home while she walks beside you is two dogs');
        /* ⚠ THE NIGHT A MINUTE BELONGS TO IS THE DATE OF ITS EVENING. */
        ok(/var out_m: int = OUT_AT \+ _slop\(who_, "out", doy - 1\)/.test(dg),
          '…and the morning reads the slop the night went to sleep on');
        /* ⭐⭐ ONE DOG, TWO NODES, and the clock picks. */
        const duty = fnGd(dg, '_on_duty');
        ok(/return TownDog\.indoors\(who\) == at_home/.test(duty)
           && /if at_home and companion:\s*\n\s*return true/.test(duty),
          '⭐⭐ the clock decides which copy of a dog is on screen — the lane\'s or the room\'s',
          '⚠⚠ except HER indoor copy, which is never off: walk in at three in the afternoon and she is there');
        ok(/_body\.set_deferred\("disabled", true\)/.test(fnGd(dg, '_step_out')),
          '⚠⚠ …and a dog that has gone indoors takes its body with it',
          'Milo is solid and stands beside the only road to two front doors — a hidden solid is a wall nobody can report');
        ok(/if visible and door_home != Vector2\.ZERO and not _walk_to\(door_home/.test(fnGd(dg, '_process'))
           && /dog\.door_home = HOME_AT/.test(tw) && /d\.door_home = HOME_AT/.test(tw),
          '⭐ she WALKS home at half nine, she does not blink out — and every lane dog uses the door with the cushions behind it');
        /* ⛑ MILO WAS A PLAIN CHALLENGER AND GOT TownNPC's PATROL FOR FREE. */
        ok(/elif patrol != Vector2\.ZERO:\s*\n\s*sit = _pace\(delta\)/.test(dg)
           && /_lane_dog\("Milo", HOME_AT \+ Vector2\(-60\.0, 130\.0\)\)\.patrol = Vector2\(90\.0, 0\.0\)/.test(tw),
          '…and Milo still paces the lane after becoming a dog');
        ok(/d\.solid = false/.test(hm) && /dog\.solid = not dog\.companion/.test(dg),
          '⚠ the lane dogs stay solid and the room\'s do not  (a 1000-unit floor with two invisible-edged walls on it)');

        /* ══ round rooms ══ */
        const fl = /const FLOOR := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(cr);
        const mid = /const MID := Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(cr);
        const RX = num(cr, 'RX'), RY = num(cr, 'RY'), WT = num(cr, 'WALL_T');
        const M = mid ? { x: +mid[1], y: +mid[2] } : null;
        ok(fl && M && RX > 0 && RY > 0
           && +fl[1] === M.x - RX && +fl[2] === M.y - RY && +fl[3] === RX * 2 && +fl[4] === RY * 2,
          '⭐ the checker rooms are ROUND, and FLOOR is exactly the disc\'s bounding box',
          fl ? 'FLOOR ' + fl.slice(1).join(',') + ' vs MID ' + (M ? M.x + ',' + M.y : '?') + ' r ' + RX + 'x' + RY : 'no FLOOR');
        ok(/class Inside extends TownPlayer:/.test(cr) && /pow\(to\.x \/ rx, 2\.0\) \+ pow\(to\.y \/ ry, 2\.0\)/.test(cr)
           && /func _make_player\(\) -> TownPlayer:\s*\n\s*return Inside\.new\(\)/.test(cr)
           && !/draw_walls/.test(cr),
          '⛑⛑ …and the CLAMP is the wall, because a rect wall cannot fence a curve',
          'the island measured 166 units of walkable ocean off a band of StaticBody2D on the same shape of problem');
        ok(/static func half_at\(y: float\)/.test(cr) && /static func rim_y\(x: float\)/.test(cr)
           && /var half := CheckerRoom\.half_at\(y\)/.test(cr),
          '…and the planks stop where the floor does, off the ONE curve everything else reads');
        /* ⚠⚠ A ROUND ROOM HAS NO CORNERS. */
        const ell = (x, y) => Math.sqrt(Math.pow((x - M.x) / RX, 2) + Math.pow((y - M.y) / RY, 2));
        const outside = [];
        for (const [name_, src] of [['home.gd', hm], ['maxwell_home.gd', mx]]) {
          for (const m of src.matchAll(/_solid\((\w+), Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)\)/g)) {
            const av = new RegExp('const ([A-Z_]+) := Vector2\\((-?[\\d.]+), (-?[\\d.]+)\\)', 'g');
            let at = null;
            const want = new RegExp(m[1] + '\\.position = (?:where\\("\\w+", )?([A-Z_]+)').exec(src);
            if (!want) { outside.push(name_ + ':' + m[1] + ' has no position'); continue; }
            at = layoutAt(src, want[1]);
            if (!at) for (const c of src.matchAll(av)) if (c[1] === want[1]) at = { x: +c[2], y: +c[3] };
            if (!at) { outside.push(name_ + ':' + m[1] + ' has no ' + want[1]); continue; }
            const sc = +(new RegExp(m[1] + '\\.scale = Vector2\\(([\\d.]+),').exec(src) || [0, 1])[1];
            const corners = [[+m[2], +m[3]], [+m[2] + +m[4], +m[3]],
                             [+m[2], +m[3] + +m[5]], [+m[2] + +m[4], +m[3] + +m[5]]];
            for (const [cx, cy] of corners) {
              if (ell(at.x + cx * sc, at.y + cy * sc) > 1.0) outside.push(name_ + ':' + m[1]);
            }
          }
        }
        ok(M && outside.length === 0,
          '…and nothing either room stands on the floor sticks out through the round wall',
          outside.length ? [...new Set(outside)].join(' ') : 'every solid in both checkers is inside the disc');

        /* ══ you cannot walk on somebody else's roof ══ */
        const shell = tw.slice(tw.indexOf('class CheckerShell extends Node2D:'),
                               tw.indexOf('func _furnish_square_extras'));
        ok(/ConvexPolygonShape2D\.new\(\)/.test(shell) && /StaticBody2D\.new\(\)/.test(shell)
           && /cos\(a\) \* d\.x \* 0\.5 \* FILL/.test(shell) && !/solid = false/.test(shell),
          '⭐ the other people\'s checkers are SOLID, as a disc and not as its box',
          '⚠ a rect\'s corners are open sand, and sand you cannot walk on is a wall with nothing drawn in it');
        /* ⚠ CircleShape2D UNDER A SQUASHED NODE does not error — Godot quietly uses one axis. */
        ok(!/CircleShape2D/.test(shell),
          '…and not a circle shape under a non-uniform scale, which Godot ignores without saying so');
        const lots = [...tw.slice(tw.indexOf('func _furnish_neighbors'),
          tw.indexOf('func _furnish_trees')).matchAll(/Vector2\((-?[\d.]+), (-?[\d.]+)\)/g)]
          .map((m) => [+m[1], +m[2]]);
        ok(lots.length === 6, '⛑ …and there are six of them  (his: "remove three of them")',
          lots.length + ' lots');
        /* ⚠⚠ SOLID NOW, so a lot that overlaps a road is a road with a house parked in it. */
        const trail = num(tw, 'TRAIL_X'), WIDE = 230;
        const homeAt = /const HOME_AT := Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(tw);
        const maxAt = /const MAX_HOME_AT := Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(tw);
        const blocks = lots.filter(([x, y]) =>
          (Math.abs(x - trail) < WIDE * 0.5 + 26)
          || (homeAt && maxAt && Math.abs(y - +homeAt[2]) < WIDE * 0.28
              && x > Math.min(+maxAt[1], +homeAt[1]) - 40 && x < Math.max(+maxAt[1], +homeAt[1]) + 40));
        ok(blocks.length === 0, '…and not one of them stands in the haul road or in the lane',
          blocks.map((b) => b.join(',')).join(' · ') || 'the roads are clear');

        /* ══ the greeting reads the wall clock — 2026-09-24 ══ */
        /* his: "make the 'Good Morning, User' line reflect the true local time … good afternoon after noon local, and good evening after 5 pm local, then good morning again after midnight" */
        const clk = code(rd('clock.gd')), zn = code(rd('zone.gd'));
        const gf = fnGd(clk, 'greeting');
        ok(/const GREET_NOON := 12 \* 60/.test(clk) && /const GREET_EVENING := 17 \* 60/.test(clk)
           && /m >= GREET_EVENING:\s*\n\s*return "Evening"/.test(gf)
           && /m >= GREET_NOON:\s*\n\s*return "Afternoon"/.test(gf) && /return "Morning"/.test(gf),
          '⭐ the greeting turns over at noon, at five, and at midnight');
        ok(/TownClock\.greeting\(\)/.test(fnGd(zn, '_greet')) && !/"Morning, %s/.test(zn),
          '…and the room asks the clock for it rather than typing one in',
          'it said Morning at eleven at night');
        /* ⚠⚠ NOT phase(). Everything that LIGHTS the town rides the sun and moves with the
           calendar; a greeting is three fixed hours he named, the same every day of the year. */
        ok(!/phase\(\)|sun\(\)|is_dark\(\)/.test(gf),
          '⚠⚠ …off FIXED hours, not the sun  (in June 8 pm is broad daylight and phase() says so)');

        /* ══ a fridge in the checker ══ */
        /* his: "Let's add a fridge to my checker home." */
        ok(/const FRIDGE_AT := Vector2\(/.test(hm) && /class Fridge extends Node2D:/.test(hm)
           && /_solid\(fridge, Rect2\(/.test(hm),
          '⭐ there is a fridge in Nate\'s checker, and you walk round it',
          '⚠ the disc audit above already holds it inside the round wall, off FRIDGE_AT');

        /* ══ his fridge and rug, from Blender — 2026-09-30 ══ */
        /* his: "I made a fridge and a rug for my checker home in blender - can you add them in please?" */
        {
          const gmSrc = fs.readFileSync(path.join(ROOT, 'tests/gen-models.js'), 'utf8');
          const gone = ['fridge', 'rug'].filter((n) => !fs.existsSync(GDF(n + '.glb')));
          ok(/\{ name: 'Fridge', godot: 'art\/fridge\.glb' \}/.test(gmSrc) && /\{ name: 'Rug', godot: 'art\/rug\.glb' \}/.test(gmSrc)
             && gone.length === 0,
            '⭐ his fridge and rug ride gen:models into the game  (game only — no `out`, nothing on the site)',
            gone.length ? 'missing from the game: ' + gone.join(', ') + '.glb — npm run gen:models -- Fridge Rug' : 'both .glb in art/');
          ok(/TownProp\.make\("res:\/\/art\/fridge\.glb", TownPlayerModel\.TILT,/.test(hm)
             && /TownProp\.make\("res:\/\/art\/rug\.glb", rad_to_deg\(asin\(RY \/ RX\)\),/.test(hm)
             && /_rug\.draw_on\(self, Rect2\(where\("Rug", RUG_AT\) - d \* 0\.5, d\)\)/.test(hm),
            '…the fridge stood at the PEOPLE\'S angle, the rug lying at the FLOOR\'S',
            'a rug at 14° is a sliver; a fridge at the floor\'s 34° shows its roof');
        }

        /* ══ light through the window · the board up close · the other two dogs · his gear — 2026-10-09 ══ */
        /* his: "Can we make some light shine in to my checker house?  And let's have a way to zoom in to my board in the house so we can teach the dogs.   I can try and teach the other dogs but they fail hilariously (come back in to the room and instead of a piece moved properly, the pieces are on the floor).  Add some weightlifting equipment, running shoes, and rollerblades" */
        {
          const bv = fs.existsSync(GDF('board_view.gd')) ? code(rd('board_view.gd')) : '';
          const gs2 = code(rd('game_state.gd')), ui2 = code(rd('town_ui.gd'));
          const hb2 = hm.slice(hm.indexOf('class HomeBoard extends Interactable:'));
          const day = cr.slice(cr.indexOf('class Daylight extends Node2D:'));
          /* a method of an INNER class — fnGd() runs on to the next column-0 line. */
          const fnIn = (src, name) => {
            const a = src.indexOf('\tfunc ' + name + '(');
            if (a < 0) return '';
            const rest = src.slice(a + 1);
            const b = rest.search(/\n\t(?:static )?func |\n\S/);
            return b < 0 ? rest : rest.slice(0, b);
          };
          const v2 = (src, n) => {
            const h = layoutAt(src, n); if (h) return h;
            const m = new RegExp('const ' + n + ' := Vector2\\((-?[\\d.]+), (-?[\\d.]+)\\)').exec(src);
            return m ? { x: +m[1], y: +m[2] } : null;
          };
          const strs2 = (s) => [...s.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);

          /* ── the light ── */
          ok(/class Daylight extends Node2D:/.test(cr) && /\n\tadd_child\(Daylight\.new\(\)\)/.test(fnGd(cr, '_furnish'))
             && !/CanvasModulate/.test(cr) && !/CanvasModulate/.test(hm) && !/CanvasModulate/.test(mx),
            '⭐ light comes in at the checker window — in the shell both checkers are built from',
            '⚠ ADDED, never a CanvasModulate: if a renderer drops 2D lights the room is the room it was');
          ok(/\tl\.enabled = on/.test(day) && /_spill\.enabled = on/.test(day) && /var on := _power > 0\.02/.test(day),
            '⚠ …and a light with nothing to give is switched OFF, not left at energy 0',
            'energy 0 still runs on every pixel the light touches');
          const touch = num(day, 'TOUCH');
          ok(/light_mask = Daylight\.SCENERY/.test(cr) && /if c is CanvasItem and not \(c is TownNPC\):/.test(cr)
             && /_touch = _lamp\(pane\(\), LIVING\)/.test(day) && /_touch\.energy = _power \* TOUCH/.test(day)
             && touch > 0 && touch <= 0.5,
            '⚠⚠ the floor and the furniture take the whole patch, the dogs and you a fraction of it',
            'a 2D light multiplies what it lands on: at full strength a pink dog in the sun is a white dog');
          ok(/static func window\(\) -> Rect2:/.test(cr) && /static func sky\(\) -> Vector3:/.test(cr)
             && /var win := CheckerRoom\.window\(\)/.test(day) && /CheckerRoom\.sky\(\)/.test(day)
             && /\nfunc _draw\(\) -> void:[\s\S]*?var win := CheckerRoom\.window\(\)\s*\n\s*var sky := CheckerRoom\.sky\(\)/.test(cr),
            '…and the pane and the patch read ONE window and ONE sky');
          /* ⚠⚠ RE-DERIVED: every minute of four days, on both clocks. */
          const TH = v2(day, 'THROW'), SD = v2(day, 'SIDE');
          const LAT = num(clk, 'LATITUDE'), NOON = num(clk, 'SOLAR_NOON');
          let worstLit = 0, minutes = 0;
          if (TH && SD && M) {
            const wm = num(cr, 'WIN_X') + num(cr, 'WIN_W') / 2;
            const foot = { x: wm, y: M.y - RY * Math.sqrt(Math.max(0, 1 - Math.pow((wm - M.x) / RX, 2))) };
            for (const doy of [80, 172, 266, 355]) {
              for (const dst of [0, 1]) {
                const decl = 23.44 * Math.PI / 180 * Math.sin(2 * Math.PI * (doy - 81) / 365);
                const half = Math.acos(Math.min(1, Math.max(-1, -Math.tan(LAT * Math.PI / 180) * Math.tan(decl)))) * 180 / Math.PI / 15;
                const up = (NOON + dst - half) * 60, down = (NOON + dst + half) * 60;
                for (let m = 0; m < 1440; m++) {
                  const f = (m >= up && m < down) ? (m - up) / Math.max(down - up, 1)
                    : ((((m - down) % 1440) + 1440) % 1440) / Math.max(1440 - (down - up), 1);
                  const high = Math.sin(Math.PI * f);
                  const at = { x: foot.x + (2 * f - 1) * (SD.y + (SD.x - SD.y) * high), y: foot.y + TH.y + (TH.x - TH.y) * high };
                  worstLit = Math.max(worstLit, ell(at.x, at.y));
                  minutes++;
                }
              }
            }
          }
          ok(minutes === 11520 && worstLit < 0.97,
            '⚠⚠ …and on no minute of the year does the patch leave the round floor',
            'worst ' + worstLit.toFixed(3) + ' of the way to the wall, over ' + minutes + ' minutes');

          /* ── his gear ── */
          ok(/class Rack extends Node2D:/.test(hm) && /class FloorWeights extends Node2D:/.test(hm)
             && /class Shoes extends Node2D:/.test(hm) && /class Blades extends Node2D:/.test(hm)
             && /rack\.position = where\("Rack", RACK_AT\)/.test(hm) && /_solid\(rack, Rect2\(/.test(hm)
             && /\[FloorWeights\.new\(\), where\("Mat", MAT_AT\)\], \[shoes, where\("Shoes", SHOES_AT\)\], \[blades, where\("Blades", BLADES_AT\)\]/.test(hm),
            '⭐ a bench and a bar, weights on a mat, his running shoes and his rollerblades are in the checker',
            'the bench presses, the shoes and the rollerblades go on (10-15); the weights are scenery; only the rack is solid');
          const gear = ['RACK_AT', 'MAT_AT', 'SHOES_AT', 'BLADES_AT'].map((n) => [n, v2(hm, n)]);
          const offFloor = gear.filter(([, p]) => !p || ell(p.x, p.y) > 0.93).map(([n]) => n);
          ok(offFloor.length === 0, '…every one of them on the floor  (the rack\'s box is in the disc audit above)',
            offFloor.join(' ') || gear.map(([n, p]) => n + ' ' + ell(p.x, p.y).toFixed(2)).join(' · '));

          /* ── the board, up close ── */
          ok(bv !== '' && /^class_name BoardView\s*\nextends CanvasLayer$/m.test(bv)
             && /add_to_group\("town_cover"\)/.test(bv)
             && /remove_from_group\("town_cover"\)\s*\n\s*TownZone\.uncovered\(\)\s*\n\s*closed\.emit\(\)/.test(bv),
            '⭐ the board in the house has a close-up, and it holds your feet the way the paper does',
            '⚠ uncovered() on the way out, or the press that closed it opens the board again');
          /* ⛑⛑ 2026-10-09: `while y < s.y` with a step of zero ran Godot out of memory, four launches running. */
          ok(!/^\s*while\b/m.test(bv) && /_cell = maxf\(floorf\(/.test(bv) && num(bv, 'MIN_CELL') >= 8
             && /var plank: float = maxf\(c, MIN_CELL\)/.test(bv) && /var band_h: float = minf\(/.test(bv),
            '⛑⛑ …with no open-ended loop in its painter, a floor under the square and a cap on the caption',
            'a caption measured one letter to a line made the square negative and a plank loop endless');
          ok(/_cap\.size\.x = [^\n]+\n\s*_cap\.text = ""\s*\n\s*_cap\.text = str\(scene\.get\("line", ""\)\)\s*\n\s*_cap\.size\.y = 0\.0/.test(bv),
            '⚠⚠ …and its caption is measured WIDTH, then TEXT, then height',
            'a new Label is nothing wide: text first comes back taller than the screen');
          ok(/var bh: float = TownUI\.finger\(self\)/.test(bv) && /func css_unit\(\) -> float:/.test(ui2),
            '⚠ its buttons are a thumb tall in CSS pixels  (44 * k is 38px on his phone)');
          ok(/if _out >= 0\.0 or _t < DWELL or running\(\) or/.test(fnGd(bv, '_press'))
             && /elif running\(\):\s*\n\s*if accept:\s*\n\s*_lt = DONE/.test(fnGd(bv, '_unhandled_input')),
            '⚠ while a piece is moving a press finishes the move and nothing else',
            'a hurried Enter must not skip the lesson and teach the next dog in one go');
          ok(!/func (legal|attack|is_attacked|gen_moves|in_check|can_move|moves_for)/.test(bv) && /const LESSON := \{/.test(bv),
            '⛑ NO CHESS IN GODOT: what moves on that board is DATA');
          const sysj2 = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-systems.js'), 'utf8');
          const pirc6 = ((sysj2.match(/pircb:[\s\S]{0,400}?'\*':\s*\[([^\]]+)\]/) || [])[1] || '')
            .split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean).slice(0, 6);
          const lessons = {};
          for (const m of bv.matchAll(/"(\w+)": \{ "piece": "(\w)", "white": (true|false), "path": \[([^\]]+)\] \}/g)) {
            const squares = m[4].split(',').map((s) => s.trim().replace(/"/g, ''));
            lessons[m[1]] = { piece: m[2], white: m[3] === 'true', from: squares[0], move: squares[0] + squares[squares.length - 1] };
          }
          const kn = lessons.knight || {}, pw = lessons.pawn || {}, wt = lessons.watch || {};
          ok(pirc6.length === 6 && pirc6.includes(kn.move) && pirc6.includes(pw.move) && kn.white === false && pw.white === false,
            '⭐⭐ the knight and the pawn Princess moves ARE the Academy\'s Pirc',
            kn.move + ' ' + pw.move + '  in  ' + pirc6.join(' '));
          const hop = (mv) => {
            if (!mv) return false;
            const df = Math.abs(mv.charCodeAt(0) - mv.charCodeAt(2)), dr = Math.abs(+mv[1] - +mv[3]);
            return (df === 1 && dr === 2) || (df === 2 && dr === 1);
          };
          ok(wt.white === true && wt.piece === 'n' && wt.from === 'g1' && hop(wt.move) && hop(kn.move),
            '…and the move you show the other two is a knight\'s, from where a knight starts', wt.move || 'none');

          /* ── the other two: each at his own board since 2026-10-10 ── */
          const rowsFn = fnIn(hb2, '_rows'), theirs = fnIn(hb2, '_theirs');
          const menus = [...theirs.matchAll(/open_talk\(prompt_text, [^\n]+\[\s*\n((?:\s*\{ "id": [^\n]+\n?)+)/g)]
            .map((m) => (m[1].match(/"id": "(\w+)"/g) || []).join(' '));
          ok(/"id": "look", "text": "Look closer\."/.test(rowsFn) && !/Milo|Argus|Teach/.test(rowsFn)
             && menus.length === 2 && menus.every((m) => (m.match(/"id"/g) || []).length === 3)
             && /"id": "tidy"/.test(menus[0]) && /"id": "teach"/.test(menus[1]) && menus.every((m) => /"look"/.test(m) && /"bye"/.test(m)),
            '⭐ her menu is the one it was, and each of theirs is three rows',
            'three more rows on one board made that menu seven tall — most of his phone');
          const pupilsFn = fnIn(hb2, '_pupils');
          ok(/if dog == "Princess" and _princess\(\) != null:\s*\n\s*return \[\{ "id": "Princess", "text": "Teach Princess" \}\]\s*\n\s*return \[\]/.test(pupilsFn),
            '…and the close-up teaches Princess, at her own board, and nobody else from anywhere');
          const left = (/const LEFT := "([^"]*)"/.exec(hb2) || [0, ''])[1];
          const floored = [...((/const FLOORED := \{([\s\S]*?)\n\t\}/.exec(hb2) || [0, ''])[1]).matchAll(/"(\w+)": "([^"]*)"/g)]
            .map((m) => [m[1], m[2]]);
          const setUp = (/const SET_UP := "([^"]*)"/.exec(hb2) || [0, ''])[1];
          const spoil = /\b(plays?|played|knows?|knew|learn(s|ed|ing)?|understands?|chess)\b/i;
          ok(/^You /.test(left) && /%s/.test(left) && !spoil.test(left) && floored.length === 2 && setUp !== '' && !spoil.test(setUp)
             && floored.every(([who, line]) => line.startsWith(who + ' ') && !spoil.test(line))
             && floored.map(([who]) => who).join(' ') === 'Milo Argus'
             && floored.every(([who]) => new RegExp('"' + who + '":\\s+\\[Color').test(dg)),
            '⛑ ONLY HUMANS TALK: what you do, then what the dog did, starting with its name',
            '⚠ and no line at their boards may say a dog can play — that is Princess\'s to give away');
          ok(/\n\tnow = turn\(\)\s*\n\s*for d in left_out:\s*\n\s*tidy\.erase\(d\)\s*\n\s*bump\[d\] = int\(bump\.get\(d, 0\)\) \+ 1\s*\n\s*left_out\.clear\(\)/.test(fnGd(hm, 'arrive'))
             && /if not TownDog\.outdoors\(\):\s*\n\s*NateHome\.arrive\(\)/.test(fnGd(hm, '_furnish_room'))
             && /NateHome\.arrive\(\)/.test(fnGd(hm, 'furnish_yard'))
             && /static var left_out: Dictionary = \{\}/.test(hm) && /static var tidy: Dictionary = \{\}/.test(hm)
             && /static var bump: Dictionary = \{\}/.test(hm) && /static var seen: Dictionary = \{\}/.test(hm)
             && /NateHome\.left_out\[dog\] = true/.test(fnIn(hb2, 'leave_out'))
             && !/left_out|NateHome\.(now|tidy|bump|seen)\b/.test(gs2),
            '⭐ you leave the lesson out, and the room you come back into is what became of it',
            '⚠ static, never saved or pushed: it outlives the walk outside and nothing else');
          ok(/if NateHome\.wrecked\(dog\):\s*\n\s*open_talk\(prompt_text, _floored\(dog\)/.test(theirs)
             && theirs.indexOf('_floored(dog)') < theirs.indexOf('"id": "teach"')
             && /if id == "tidy":\s*\n\s*NateHome\.tidy\[dog\] = NateHome\.now\s*\n\s*queue_redraw\(\)\s*\n\s*changed\.emit\(\)/.test(fnIn(hb2, '_on_chose'))
             && /low\.changed\.connect\(queue_redraw\)/.test(hm),
            '…and the mess comes first: nobody is taught anything until the pieces are picked up',
            '⚠ and the FLOOR is the room\'s to repaint when you do');
          const sh = fnIn(hb2, 'show_her');
          ok(sh.indexOf('_open(') > 0 && sh.indexOf('_open(') < sh.indexOf('GameState.story.discover_dogs_play()')
             && /get_first_node_in_group\("town_cover"\) != null or TownJournal\.is_open\(get_tree\(\)\)/.test(fnGd(zn, '_story'))
             && /board\.stood_up\.connect\(_story\)/.test(hm),
            '⚠⚠ the secret is given away with the close-up already up, and its story beat waits until you look up',
            'a beat started under a cover narrates behind it and eats its key presses');
          /* ⚠ RE-DERIVED: in the disc, and inside no furniture's floor box. */
          const boardAt = v2(hm, 'BOARD_AT'), argusAt = v2(hm, 'ARGUS_BED_AT');
          const boxes = [];
          for (const m of hm.matchAll(/_solid\((\w+), Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)\)/g)) {
            const want = new RegExp(m[1] + '\\.position = (?:where\\("\\w+", )?([A-Z_]+)').exec(hm);
            const at = want && v2(hm, want[1]);
            const sc = +(new RegExp(m[1] + '\\.scale = Vector2\\(([\\d.]+),').exec(hm) || [0, 1])[1];
            if (at) boxes.push({ x: at.x + +m[2] * sc, y: at.y + +m[3] * sc, w: +m[4] * sc, h: +m[5] * sc });
          }
          /* ⚠ PRINCESS'S TABLE IS THE ONLY SOLID BOARD: the two on the floor are added as pictures, below. */
          const miloAt = v2(hm, 'MILO_BOARD_AT'), argusBoardAt = v2(hm, 'ARGUS_BOARD_AT');
          const lowS = +(/low\.scale = Vector2\(([\d.]+), ([\d.]+)\)/.exec(hm) || [0, 0])[1];
          const pic = (p) => ({ x: p.x - 23 * lowS, y: p.y - 47 * lowS, w: 46 * lowS, h: 46 * lowS });
          const cush = ['DOG_BED_AT', 'MILO_BED_AT', 'ARGUS_BED_AT'].map((n) => [n.replace('_BED_AT', ''), v2(hm, n)]);
          const scat = miloAt ? [...((/const SCATTER := \[([\s\S]*?)\n\]/.exec(hm) || [0, ''])[1])
            .matchAll(/Vector2\((-?[\d.]+), (-?[\d.]+)\)/g)]
            .map((m) => ({ x: miloAt.x + +m[1], y: miloAt.y + +m[2] })) : [];
          const inBox = (p, bx) => p.x > bx.x && p.x < bx.x + bx.w && p.y > bx.y && p.y < bx.y + bx.h;
          const covers = miloAt && argusBoardAt && lowS
            ? boxes.concat([pic(miloAt), pic(argusBoardAt)], cush.map(([, c]) => ({ x: c.x - 40, y: c.y - 20, w: 80, h: 40 }))) : [];
          const hidden = scat.filter((p) => ell(p.x, p.y) > 0.92 || covers.some((bx) => inBox(p, bx)));
          const piece = num(hm, 'FLOOR_PIECE');
          const clumped = scat.filter((p, i) => scat.some((q, j) => j < i && Math.hypot(p.x - q.x, p.y - q.y) < piece));
          ok(boxes.length >= 4 && covers.length === boxes.length + 5 && scat.length >= 10 && piece > 0 && hidden.length === 0 && clumped.length === 0,
            '…Milo\'s scatter lies on open floor: inside the disc, under no furniture, on no cushion and off both boards',
            hidden.length || clumped.length ? hidden.concat(clumped).map((p) => p.x + ',' + p.y).join(' ')
              : scat.length + ' spots against ' + covers.length + ' things, none within a piece of another');
          const rowM = /_floor_piece\(where\("ArgusBed", ARGUS_BED_AT\) \+ Vector2\((-?[\d.]+) \+ ([\d.]+) \* float\(i\), (-?[\d.]+)\)/.exec(hm);
          const rowN = ((/const ROW := "(\w+)"/.exec(hm) || [0, ''])[1]).length;
          const rowEnds = rowM && argusAt
            ? [0, rowN - 1].map((i) => ({ x: argusAt.x + +rowM[1] + +rowM[2] * i, y: argusAt.y + +rowM[3] })) : [];
          ok(rowEnds.length === 2 && rowN >= 6 && rowEnds.every((p) => ell(p.x, p.y) < 0.92) && +rowM[3] <= -60,
            '…and Argus\'s row stands along the back of his own cushion, clear of his nameplate',
            rowEnds.map((p) => p.x + ',' + p.y).join(' → ') || 'no row');
          const pf = fnGd(dg, 'paint_front');
          ok(/ci\.draw_set_transform\(at, 0\.0, Vector2\(s, s\)\)/.test(pf) && !/deg_to_rad|tilt/.test(pf),
            '⚠⚠ a dog across the board is never drawn with the head tilt  (the 20° is paint_sitting\'s, and canon)');
        }

        /* ══ a tap on the glass walks him there · a mark over what is new — 2026-10-10 ══ */
        /* his: "Let's work on how to engage someone easier on the mobile - it's a little hard to do.  Then, I'll want things to exclaim or glow when they have a new action to take, or if something has changed, like a letter in the mailbox or the at-home chess board." */
        {
          const padG = code(rd('touch_pad.gd')), ply = code(rd('player.gd')), itr = code(rd('interactable.gd'));
          const ntc = fs.existsSync(GDF('notice.gd')) ? code(rd('notice.gd')) : '';
          const znN = code(rd('zone.gd')), npcN = code(rd('npc.gd')), chN = code(rd('challenger.gd'));
          const mbN = code(rd('mailbox.gd')), papN = code(rd('paper.gd')), gsN = code(rd('game_state.gd'));
          const crsN = code(rd('crossing.gd')), mineN = code(rd('mine.gd')), spN = code(rd('speech.gd'));
          const fnIn2 = (src, name) => {
            const a = src.indexOf('\tfunc ' + name + '(');
            if (a < 0) return '';
            const rest = src.slice(a + 1);
            const b = rest.search(/\n\t(?:static )?func |\n\S/);
            return b < 0 ? rest : rest.slice(0, b);
          };

          /* ── the tap ── */
          const tapCss = num(padG, 'TAP_CSS'), tapMs = num(padG, 'TAP_MS'), keeps = num(padG, 'TAP_KEEPS_MS');
          ok(/if _slid <= TAP_CSS \* css\(\) and Time\.get_ticks_msec\(\) - _down_ms <= TAP_MS:\s*\n\s*_tap = t\.position/.test(fnGd(padG, '_unhandled_input'))
             && /_slid = maxf\(_slid, d\.position\.distance_to\(_origin\)\)/.test(padG)
             && tapCss >= 6 && tapCss <= 20 && tapMs >= 150 && tapMs <= 500,
            '⭐ a finger that lifts where it landed is a TAP; one that slid, or stayed, is still the stick',
            tapCss + ' CSS px · ' + tapMs + ' ms');
          ok(/return at if Time\.get_ticks_msec\(\) - _tap_ms <= TAP_KEEPS_MS else Vector2\.INF/.test(fnGd(padG, 'take_tap'))
             && /_tap = Vector2\.INF/.test(fnGd(padG, 'take_tap')) && keeps > 0 && keeps <= 400,
            '⚠ …taken once, and dropped if nobody takes it',
            'a tap made under a menu must not fire when the menu shuts');
          ok(/return u\.css_unit\(\) if u != null else k\(\)/.test(fnGd(padG, 'css')),
            '⚠ …and measured in CSS pixels, the unit a finger comes in  (k() holds TEXT a constant size)');
          const onTap = fnGd(ply, '_on_tap');
          const reachCss = num(ply, 'TAP_CSS');
          ok(/if it == null or not it\.is_visible_in_tree\(\) or not it\.monitoring:\s*\n\s*continue/.test(onTap)
             && /var r := it\.tap_rect\(\)\s*\n\s*if not r\.has_area\(\):\s*\n\s*continue/.test(onTap)
             && /var slop: float = TAP_CSS \* \(pad\.css\(\) if pad != null else 1\.0\) \/ maxf\(zoom, 0\.01\)/.test(onTap)
             && /if out > slop:\s*\n\s*continue/.test(onTap) && reachCss >= 18 && reachCss <= 36,
            '⭐ the tap means the thing under the finger, or the nearest within a fingertip of it',
            reachCss + ' CSS px — never somebody who is out today, never a thing with no picture');
          ok(/if _near\.has\(best\):\s*\n\s*_pin = best\s*\n\s*_refresh_target\(\)\s*\n\s*best\.interact\(self\)\s*\n\s*return\s*\n\s*_goal = best\s*\n\s*_way = best\.approach\(\)/.test(onTap),
            '…in reach it is a press; out of reach he walks to it');
          const phys = fnGd(ply, '_physics_process');
          ok(/if is_instance_valid\(_goal\):\s*\n\s*if dir\.length_squared\(\) > 0\.001:\s*\n\s*_goal = null\s*\n\s*else:\s*\n\s*dir = _toward_goal\(_delta\)/.test(phys)
             && /if _in_talk\(\):\s*\n\s*velocity = Vector2\.ZERO\s*\n\s*_goal = null/.test(phys),
            '⚠ his own hand ends the walk: a key, the stick, or a conversation that opened first');
          const tg = fnGd(ply, '_toward_goal');
          const stall = num(ply, 'STALL_SECS'), goalS = num(ply, 'GOAL_SECS');
          ok(/if global_position\.distance_to\(_stall_at\) < STALL_UNITS:\s*\n\s*_goal = null/.test(tg)
             && /if _goal_t > GOAL_SECS or not _goal\.is_visible_in_tree\(\) or not _goal\.monitoring:\s*\n\s*_goal = null/.test(tg)
             && !/^\s*while\b/m.test(tg) && stall > 0 && stall <= 1 && goalS > 1 && goalS <= 10,
            '⚠⚠ …and the walk gives up: against a wall, after a thing that left, after ' + goalS + ' seconds',
            'a walk that never ends is a player nobody can steer');
          ok(/if _near\.has\(it\):\s*\n\s*_pin = it\s*\n\s*_refresh_target\(\)\s*\n\s*if it\.tap_uses\(\):\s*\n\s*used = true/.test(fnGd(ply, '_process'))
             && /func tap_uses\(\) -> bool:\s*\n\s*return url == "" and not walks_in\(\)/.test(dr),
            '⛑⛑ a ring or a door that opens a PAGE is never used on arrival: he walks up, and the press is the next one',
            'a browser opens a tab only on a fresh press; seconds after the tap it navigates the town away instead');
          ok(/func walks_in\(\) -> bool:\s*\n\s*return walk_in and scene_path != "" and url == "" and energy_cost <= 0/.test(dr)
             && /if not live or not walks_in\(\):\s*\n\s*return/.test(fnGd(dr, '_physics_process'))
             && /return \[to_global\(Vector2\(m\.get_center\(\)\.x, m\.end\.y \+ [\d.]+\)\), to_global\(door_into\(\)\)\]/.test(fnGd(dr, 'approach'))
             && /func stops_in_reach\(\) -> bool:\s*\n\s*return not walks_in\(\)/.test(dr),
            '⚠ a door you walk into is WALKED into: to the front of its mat, then in',
            'one walks_in() answers for the door\'s own trigger and for the tap');
          const seamAt = tw.indexOf('class TownSeam extends TownDoor:');
          const seamEnd = tw.indexOf('\nclass ', seamAt + 10);
          ok(seamAt > 0 && /\tfunc tap_rect\(\) -> Rect2:\s*\n\s*return Rect2\(\)/.test(tw.slice(seamAt, seamEnd)),
            '⚠ the edge of a window is drawn as nothing, so it is not a thing to tap',
            'a tap near the edge of the screen would walk him out of the window');
          ok(/func _ready\(\) -> void:\s*\n\s*add_to_group\("town_use"\)/.test(itr),
            '…and everything you can use is in one group, which is all a tap looks through');
          ok(/var live: bool = p != null and p\.use_ready\(\)\s*\n\s*if live != _ready_was:/.test(fnGd(padG, '_process'))
             && /func use_ready\(\) -> bool:\s*\n\s*return use_always or is_instance_valid\(_active\)/.test(ply)
             && /p\.use_always = true/.test(fnGd(crsN, '_make_player')) && /_over = true\s*\n\s*player\.use_always = true/.test(mineN),
            '⭐ USE is lit when a press will do something, and only then',
            'the crossing (it pauses) and the end of a mine run (the way out) are always live');

          /* ── the marks ── */
          ok(ntc !== '' && /^class_name TownNotice\s*\nextends CanvasLayer$/m.test(ntc)
             && /add_child\(TownNotice\.new\(\)\)[^\n]*\n\s*_build_hud\(\)/.test(fnGd(znN, '_ready'))
             && /\n\tlayer = 1\n/.test(fnGd(ntc, '_ready')) && !/CanvasModulate/.test(ntc),
            '⭐ a mark hangs over anything with something new — on a layer of its own, under the HUD',
            '⚠ a layer, not the room: the night darkens everything drawn in the world');
          const shows = fnGd(ntc, 'shows');
          ok(/return \(u != null and u\.is_talking\(\)\) or TownZone\.covered\(get_tree\(\)\)/.test(fnGd(ntc, '_down'))
             && /if _down\(\) or not is_instance_valid\(it\) or not _marks\.has\(it\) or not it\.is_visible_in_tree\(\):\s*\n\s*return false/.test(shows)
             && /if p != null and p\.target\(\) == it:\s*\n\s*return false/.test(shows)
             && /return sp == null or not sp\.speaking\(it\)/.test(shows)
             && /if _down\(\):\s*\n\s*return/.test(fnGd(ntc, '_paint')) && /if not is_instance_valid\(n\) or not shows\(n\):/.test(fnGd(ntc, '_paint')),
            '⚠⚠ …and comes down for a conversation, a cover, the thing you are standing at, and whoever is speaking',
            'the 09-03 rule: the name and the line own the space over a head');
          const poll = num(ntc, 'POLL');
          ok(poll >= 0.25 && poll <= 2 && /if _left <= 0\.0:\s*\n\s*_left = POLL/.test(fnGd(ntc, '_process'))
             && /if busy or _drew:\s*\n\s*_art\.queue_redraw\(\)/.test(fnGd(ntc, '_process')) && !/^\s*while\b/m.test(ntc),
            '⚠ news is asked ' + (1 / poll).toFixed(0) + ' times a second, never every frame, and nothing is redrawn while nothing is marked',
            'news() can cross to the page');
          ok(/xf \* \(it\.global_position \+ it\.notice_at\(\)\)/.test(fnGd(ntc, '_paint')) && !/to_global\(it\.notice_at\(\)\)/.test(ntc),
            '⚠ a mark\'s place is an offset in the world, like speech_top()',
            'the board at home is scaled: through to_global() its mark hung off the top of the room');
          /* ⚠⚠ WHO CAN BE MARKED IS A LIST ON PURPOSE: a mark that never clears is furniture. */
          const marked = GD_LIST.filter((f) => f.endsWith('.gd') && /\n\t*func news\(\) -> String:/.test(code(rd(f)))).sort();
          ok(marked.join(' ') === 'challenger.gd home.gd interactable.gd mailbox.gd npc.gd paper.gd',
            '⚠⚠ what can be marked is these and nothing else: the post, the board at home, people, the paper',
            marked.join(' '));
          ok(/func news\(\) -> String:\s*\n\s*return ""/.test(itr), '…and by default a thing has nothing new');
          ok(/func _peek\(\) -> void:\s*\n\s*_up = GameState\.town\.post_unread\(\) > 0 or not GameState\.story\.garrett_due\(\)\.is_empty\(\)/.test(mbN)
             && /func news\(\) -> String:\s*\n\s*return "post" if _up else ""/.test(mbN)
             && !/post_unread|garrett_due/.test(fnGd(mbN, '_draw')) && /if _up:/.test(fnGd(mbN, '_draw'))
             && /_left = 5\.0\s*\n\s*_peek\(\)/.test(fnGd(mbN, '_process'))
             && /GameState\.town\.read_post\(\)\s*\n\s*_peek\(\)/.test(fnGd(mbN, '_show')),
            '⭐ a letter in the box: the flag and the mark read ONE answer, asked every five seconds and when you read',
            'post_unread() crosses to the page');
          const hbN = hm.slice(hm.indexOf('class HomeBoard extends Interactable:'));
          const bnews = fnIn2(hbN, 'news');
          ok(/var fresh: bool = int\(NateHome\.seen\.get\(dog, -1\)\) != NateHome\.stamp\(dog\)/.test(bnews)
             && /return "mess" if fresh and NateHome\.wrecked\(dog\) else ""/.test(bnews)
             && /if _lesson and not GameState\.story\.dogs_play and _princess\(\) != null:\s*\n\s*return "lesson"/.test(bnews)
             && /return "moved" if fresh and NateHome\.pirc_done\(\) > 0 else ""/.test(bnews)
             && /NateHome\.seen\[dog\] = NateHome\.stamp\(dog\)/.test(fnIn2(hbN, 'interact'))
             && /_asked = 5\.0\s*\n(?:\s*#[^\n]*\n)*\s*if dog == "Princess":\s*\n\s*_lesson = not GameState\.story\.dogs_play and GameState\.academy_stage\(\) >= PLAYS_AT/.test(fnIn2(hbN, '_process')),
            '⭐ the boards at home: what a dog did since you last LOOKED; and, until the secret is out, a lesson she has not been shown',
            '⚠ a mark that never goes out is wallpaper — opening the board is what puts it out');
          const nnews = fnGd(npcN, 'news');
          ok(/gift_day == TownClock\.weekday\(\) and GameState\.people\.gift_waiting\(\)/.test(nnews)
             && /GameState\.people\.hearts_for\(who\) >= GameState\.town\.BOAT_HEARTS/.test(nnews) && /not GameState\.town\.has_part\(/.test(nnews)
             && /if GameState\.board\.key_at\(i\) != "" and facts_left\(GameState\.board\.key_at\(i\)\) > 0:\s*\n\s*return true/.test(fnGd(gsN, 'gift_waiting'))
             && /if not gift_ready\(\):\s*\n\s*return false/.test(fnGd(gsN, 'gift_waiting')),
            '⭐ a person: her gift on her day when there is one to give, a part of the boat they would hand over now',
            '⚠ gift_ready() alone is true all day on the desktop, where nothing can be given');
          const cnews = fnGd(chN, 'news');
          ok(/if str\(f\.get\("who", ""\)\) == who and met:\s*\n\s*return "favor"/.test(cnews)
             && /str\(f\.get\("target_who", ""\)\) == who and not met:\s*\n\s*return "word"/.test(cnews)
             && /GameState\.people\.lessons_owed\(who\) > 0 and GameState\.people\.facts_left\(key\) > 0:\s*\n\s*return "lesson"/.test(cnews)
             && /return super\(\)/.test(cnews) && !/can_ask|study_offered|beaten_today/.test(cnews),
            '…a favor of theirs you have done, word you are carrying to them, a lesson they owe you',
            '⚠ NOT "Need a hand?" and not a study: those stand for weeks');
          ok(/func notice_up\(\) -> bool:\s*\n\s*return false/.test(npcN)
             && /return Vector2\(24\.0 if animal else 22\.0, _top\(\) - 6\.0\)/.test(fnGd(npcN, 'notice_at')),
            '⚠⚠ a person\'s mark hangs DOWN beside the head from under the name, never over it',
            'standing up from the shoulder it covered the name on his phone');
          ok(/return "paper" if GameState\.town\.paper_fresh\(\) else ""/.test(papN), '…and today\'s paper, until you open it');
          ok(/func _renotice\(\) -> void:/.test(itr) && (itr.match(/_talking = false\s*\n\s*_renotice\(\)/g) || []).length === 2,
            '…and a mark goes as the box shuts, not half a second later');
          ok(/if is_instance_valid\(b\.who\):\s*\n\s*_poke\(b\.who\)/.test(fnGd(spN, '_drop')),
            '⚠ a speaker freed mid-line is checked before it is handed on  (found by a probe, 10-10)');
        }

        /* ══ a thumb · a name under the HUD · a line under USE · the map's names — 2026-10-12 ══ */
        /* his: "Great please work through the Seen and Not Fixed" */
        /* ⚠ THE FIFTH THING ON THAT LIST HAS NO CHECK, BECAUSE IT WAS NEVER FOUND: two white marks at dusk,
           seen once, in one picture of the first desktop wrapper. Not reproduced in the game (native and
           web, pinned to that day and minute; the real build at real dusk) nor in the desktop program.
           The commit that added this block calls them the site's skyline windows. That was a guess,
           and letting the site's layers back over the game did not bring them back. Cause unknown. */
        {
          const uiS = code(rd('town_ui.gd')), znS = code(rd('zone.gd')), jrS = code(rd('journal.gd'));
          const papS = code(rd('paper.gd')), phoS = code(rd('photo.gd')), lkS = code(rd('lookout.gd'));
          const itS = code(rd('interactable.gd')), padS = code(rd('touch_pad.gd')), twS = code(rd('town.gd'));
          const mapS = code(rd('map.gd')), ptlS = code(rd('portal.gd')), drS = code(rd('door.gd'));
          const n1 = (re, src) => { const m = re.exec(src); return m ? +m[1] : NaN; };

          /* ── 1 · every button is a thumb tall ── */
          ok(/return maxf\(FINGER_CSS \* TownZone\.ui_scale\(n\), FINGER_CSS \* \(ui\.css_unit\(\) if ui != null else 1\.0\)\)/
               .test(fnGd(uiS, 'finger')) && /static func finger\(n: Node\) -> float:/.test(uiS),
            '⛑ ONE answer to "how tall is a button": 44 scaled units, and never under 44 CSS px on the glass',
            '44 * ui_scale alone was 38 CSS px on his phone (352x560), on every button that used it');
          {
            /* every file that makes a Button, found, not listed */
            /* ⚠ A PAD'S BUTTON PRESS IS NOT A BUTTON ON THE GLASS: pad.gd makes `InputEventJoypadButton`s. */
            const makers = GD_LIST.filter((f) => f.endsWith('.gd') && /Button\.new\(\)/.test(code(rd(f)).replace(/InputEventJoypadButton\.new\(\)/g, '')));
            const flat = makers.filter((f) => /Vector2\([^()\n]*, 44\.0 \* _?k\)|= 44\.0 \* _?k\s*$/m.test(code(rd(f))));
            const off = makers.filter((f) => f !== 'town_ui.gd' && !/TownUI\.finger\(self\)/.test(code(rd(f))));
            ok(makers.length >= 7 && flat.length === 0 && off.length === 0,
              '⛑ …and every file that makes a button asks it  (the Journal\'s nine, the corner tab, the paper, the telescope, the camera, the board)',
              makers.length + ' files make buttons; still 44 * k: ' + (flat.join(' ') || 'none') + '; never ask: ' + (off.join(' ') || 'none'));
          }
          ok(/_btns\[i\]\.size = Vector2\(bw, bh\)/.test(jrS) && /_sound\.size = Vector2\(w2, bh\)/.test(jrS) && /_who\.size = Vector2\(w2, bh\)/.test(jrS)
             && /_btns\[TABS\.size\(\)\]\.size = Vector2\(w2, bh\)/.test(jrS) && /zb\.size = Vector2\(zw, bh\)/.test(jrS)
             && /sb\.size = Vector2\(sw, bh\)/.test(jrS),
            '   the Journal: its tabs, Character, Sound, Close, the three time-zone buttons, the three saves and New Game');
          {
            /* ⚠ ON A DESKTOP NOTHING MOVES: a thumb there is 44, and each new sum is the old number. */
            const row = n1(/var row2: float = 50\.0 \* k \+ \(\(bh \+ ([\d.]+) \* k\) if narrow else 0\.0\)/, jrS);
            const top = n1(/_top = row2 \+ bh \+ ([\d.]+) \* k/, jrS);
            const bar = n1(/var bar: float = \(bh \+ ([\d.]+) \* k\) if town or saves else 0\.0/, jrS);
            const zy = n1(/float\(i\) \* \(zw \+ 6\.0 \* k\), h - ([\d.]+) \* k - bh\)/, jrS);
            const pc = n1(/_card\.size\.y - ([\d.]+) \* _k - _bh\)/, papS), pb = n1(/var bottom: float = h - ([\d.]+) \* k - _bh/, papS);
            const fy = n1(/b\.position = Vector2\(x, s\.y - ([\d.]+) \* _k - _bh\)/, phoS);
            const fh = n1(/s\.x - tw - 12\.0 \* _k, s\.y - ([\d.]+) \* _k - _bh\)/, phoS);
            const ly = n1(/_close\.position = Vector2\(s\.x - 124\.0 \* k, s\.y - ([\d.]+) \* k - bh\)/, lkS);
            const sums = [50 + 44 + row, 44 + top, 44 + bar, 44 + zy, 44 + pc, 44 + pb, 44 + fy, 44 + fh, 44 + ly];
            ok(sums.join(' ') === '100 54 54 62 58 70 56 66 58',
              '⚠ …each hung from the edge it was hung from, so on a desktop every one is where it was',
              'old numbers 100 54 54 62 58 70 56 66 58, now ' + sums.join(' '));
          }
          {
            const sh = fnGd(znS, '_scale_hud');
            ok(/_tab\.offset_bottom = 12\.0 \* k \+ TownUI\.finger\(self\)/.test(sh)
               && /_dial\.position = Vector2\(w - 110\.0 \* k, 62\.0 \* k\)\s*\n\s*_dial\.position\.y \+= TownUI\.finger\(self\) - 44\.0 \* k/.test(sh),
              '   the corner tab too, and the clock goes down by exactly what the tab grew  (nothing, on a desktop)');
          }
          ok(/var under: bool = not _bar\.is_empty\(\) and _bar\[0\]\.position\.x < s\.x \* 0\.5 \+ 12\.0 \* k/.test(phoS)
             && /\(s\.y - 40\.0 \* k - _bh\) if under else \(s\.y - 20\.0 \* k\)/.test(phoS),
            '⚠ and the camera\'s "Saved" line is written over the buttons where they reach the left edge',
            'on a phone the three buttons span the screen and are drawn on top of it: "Take it" answered with nothing');

          /* ── 2 · a name in the world gets out of the HUD's way ── */
          {
            const sg = fnGd(itS, '_sign'), tk = fnGd(itS, '_sign_tick'), ho = fnGd(znS, 'hud_over');
            ok(/_sign_box = Rect2\(at - Vector2\(0\.0, float\(fs\)\), wide\)/.test(sg) && /add_to_group\("town_sign"\)/.test(sg)
               && /if not _sign_off:\s*\n\s*draw_string\(f, at, text,/.test(sg),
              '⛑ a name over a door or a head is written by ONE function, which knows where it belongs');
            ok(/func _sign\(f: Font, at: Vector2, text: String, fs: int, col: Color, below: Vector2 = Vector2\.INF\) -> void:/.test(itS)
               && /_sign_low = Rect2\(below - Vector2\(0\.0, float\(fs\)\), wide\) if below\.is_finite\(\) else Rect2\(\)/.test(sg)
               && /elif below\.is_finite\(\):\s*\n\s*draw_string\(f, below, text,/.test(sg),
              '⛑ …and a DOOR gives it a second place, under the building, where it goes instead of nowhere',
              'the Academy\'s room cannot scroll on a phone: a name that only hid left its three lessons with no names');
            ok(/z\.hud_over\(get_global_transform_with_canvas\(\) \* _sign_box\)/.test(tk)
               && /if off != _sign_off:\s*\n\s*_sign_off = off\s*\n\s*queue_redraw\(\)/.test(tk),
              '⛑ …and it is not written while the HUD is standing on it  (asked on the SCREEN: the camera follows you)',
              'the top band had eaten a name five times and every fix was an offset, right for one camera position');
            ok(/if not is_instance_valid\(_hud\) or not _hud\.visible:\s*\n\s*return false/.test(ho)
               && /r = r\.grow\(10\.0 \* TownZone\.ui_scale\(self\)\)/.test(ho)
               && /_stat\.visible and r\.intersects\(Rect2\(_stat\.position, _stat\.get_minimum_size\(\)\)\)/.test(ho)
               && /r\.intersects\(_tab\.get_global_rect\(\)\)/.test(ho) && /r\.intersects\(Rect2\(_dial\.position, _dial\.size\)\)/.test(ho),
              '   the HUD is the stat row\'s TEXT, the Journal tab and the clock, and a little air round each',
              '⚠ the Label is 760 wide whatever it says: its whole box would hide every name in the top band');
            const watch = znS.slice(znS.indexOf('class SignWatch extends Node:'));
            ok(/class SignWatch extends Node:/.test(znS) && /add_child\(SignWatch\.new\(\)\)/.test(fnGd(znS, '_build_hud'))
               && /for n in get_tree\(\)\.get_nodes_in_group\("town_sign"\):\s*\n\s*\(n as Interactable\)\._sign_tick\(\)/.test(watch),
              '⚠ one walk a frame over every name in the room  (a tick per class would have lost the dogs: they override _process)');
            /* the six places a name floats, each through _sign() */
            /* ⚠ FOUR OF THEM ARE DOORS WITH GROUND IN FRONT, and say where under themselves the name goes.
               The way out stands on the bottom wall and a head has nowhere else: those two just step aside. */
            const sites = [
              ['door.gd', /_sign\(f, Vector2\(-w \* 0\.5, -half\.y - 62\.0\), sign_text, fs, Color\("f2e9ff"\),\s*\n\s*Vector2\(-w \* 0\.5, half\.y \+ 30\.0 \+ float\(fs\)\)\)/],
              ['town.gd', /_sign\(f, Vector2\(-w \* 0\.5, -half\.y - 16\.0\), text, fs, Color\("f2e9ff"\) if open else Color\("9a94a8"\),\s*\n\s*Vector2\(-w \* 0\.5, 62\.0 \+ float\(fs\)\)\)/],
              ['town.gd', /_sign\(f, Vector2\(-tw \* 0\.5, -size\.y - 38\.0\), t, 15, Color\("f2e9ff"\), Vector2\(-tw \* 0\.5, 34\.0\)\)/],
              ['depths.gd', /_sign\(f, Vector2\(-tw \* 0\.5, -size\.y - 22\.0\), s, 15, PitHead\.AMBER, Vector2\(-tw \* 0\.5, 34\.0\)\)/],
              ['exit_door.gd', /_sign\(f, Vector2\(-tw \* 0\.5, -h - 30\.0\), sign_text, fs, Color\("f2e9ff"\)\)/],
              ['npc.gd', /_sign\(f, Vector2\(-w \* 0\.5, _top\(\) - 10\.0\), who, fs, Color\("f2e9ff"\)\)/]];
            const lost = sites.filter((s) => !s[1].test(code(rd(s[0])))).map((s) => s[0]);
            ok(lost.length === 0,
              '⛑ …every one of them: a door, the grove, the west gate and the cage (each with its place below), the way out, and anybody\'s head',
              lost.length ? 'not through _sign(), or its place below is gone: ' + lost.join(' ') : '6 of 6');
          }

          /* ── 3 · the box's line goes round USE ── */
          {
            const lay = fnGd(uiS, '_layout'), rnd = fnGd(uiS, '_round_use'), use = fnGd(padS, 'use_rect');
            ok(/if not _shown\(\) or _talking\(\):\s*\n\s*return Rect2\(\)/.test(use)
               && /var r := \(R_BTN \+ 2\.0\) \* k\(\)\s*\n\s*var use := Rect2\(_btn_at\(\) - Vector2\(r, r\), Vector2\(r, r\) \* 2\.0\)\s*\n\s*if not _jumps\(\):\s*\n\s*return use\s*\n\s*var j := \(R_JUMP \+ 2\.0\) \* k\(\)\s*\n\s*return use\.merge\(Rect2\(_jump_at\(\) - Vector2\(j, j\), Vector2\(j, j\) \* 2\.0\)\)/.test(use),
              '⛑ the pad says where it is painting USE and JUMP, and "nowhere" while it paints none  (JUMP is not painted in a fight)');
            ok(/if _use\.has_area\(\):/.test(rnd) && /_line\.get_character_bounds\(i\)/.test(rnd)
               && /var rad: float = _use\.size\.x \* 0\.5 \+ GAP_CSS \* _css_unit\(\)/.test(rnd)
               && /if c\.distance_squared_to\(near\) <= rad \* rad:/.test(rnd),
              '⛑⛑ the box asks the LABEL where each letter landed, and measures it against the disc',
              'a Pawn Crossing banner read "when that k[USE]ight jumps": the pad is a layer above the box');
            ok(/var cut := t\.rfind\(" ", hit\) if hit > 0 else -1/.test(rnd) && /if cut <= 0 or cut < t\.rfind\("\\n", hit\):\s*\n\s*break/.test(rnd)
               && /_line\.text = head \+ "\\n" \+ t\.substr\(cut \+ 1\)\.lstrip\(" "\)/.test(rnd) && /for _pass in 8:/.test(rnd),
              '   …and breaks the line BEFORE the first word under it, again for each row beside the button',
              'rows below the button keep the whole width; a word that already starts its row is left alone');
            ok(/var top: float = at\.y \+ r\.position\.y \+ r\.size\.y \* 0\.2/.test(rnd),
              '⚠ the INK, not the row: the top fifth of a row is air, and counting it narrows the row below USE');
            ok(!/^\s*while\b/m.test(uiS), '⚠ and there is no open-ended loop anywhere in the box');
            /* the line as it was said is kept apart from the broken copy */
            const writes = (uiS.match(/_line\.text = /g) || []).length;
            ok(writes === 4 && /func _put\(text: String\) -> void:\s*\n\s*_raw = text\s*\n\s*_line\.text = text/.test(uiS)
               && /_put\(Speech\.no_break\(text\)\)/.test(fnGd(uiS, 'say')) && /_put\(Speech\.no_break\(line\)\)/.test(fnGd(uiS, 'talk'))
               && /_put\(line\)/.test(fnGd(uiS, 'retell')) && /var was := _line\.text\s*\n\s*if was != _raw:\s*\n\s*_line\.text = _raw/.test(rnd),
              '⛑ what was SAID is kept whole: every line comes in through _put(), and each layout breaks a fresh copy',
              writes + ' places write the label (wanted 4: _put, the reset, and the two in _round_use)');
            ok(/_use = _use_now\(\)\s*\n\s*_line\.add_theme_font_size_override\("font_size", int\(18\.0 \* k\)\)\s*\n\s*if _line\.text != _raw:\s*\n\s*_line\.text = _raw\s*\n\s*var pad := PAD \* k/.test(lay),
              '⚠ …at full size and unbroken BEFORE anything is measured  (a say box measured off the idle line\'s small type is too short)');
            ok(/if _mode != TALK and _use_now\(\) != _use:\s*\n\s*_layout\(\)/.test(fnGd(uiS, '_process')),
              '⚠ and the box asks every frame: the pad shows USE on the first touch, long after the box was laid out');
            ok(/line_h \+= grow\s*\n\s*for _pass in 5:\s*\n\s*if look != SAY or not _round_use\(Vector2\(x \+ pad, vp\.y - h - 12\.0 \* k \+ 14\.0 \* k\)\):\s*\n\s*break/.test(lay)
               && /h = minf\(h \+ more, vp\.y - 24\.0 \* k\)\s*\n\s*line_h \+= more/.test(lay),
              '⛑ a line SAID in the box goes round too, and the box grows for the row a break adds  (growth only)');
            const step = n1(/int\(18\.0 \* k \* \(1\.0 - ([\d.]+) \* float\(step\)\)\)/, lay), steps = n1(/for step in (\d+):/, lay);
            ok(/_raw = _prompt if _prompt != "" else _hint/.test(lay) && /_round_use\(_root\.position \+ _line\.position\)/.test(lay)
               && /var fit: float = vp\.y - 8\.0 \* k - \(y \+ _line\.position\.y\)/.test(lay)
               && /_line\.size\.y = 0\.0\s*\n\s*if _line\.size\.y <= fit:\s*\n\s*break/.test(lay)
               && Math.abs(1 - step * (steps - 1) - 0.7) < 1e-9,
              '⛑ the walking-around line ends above the bottom of the screen or its type comes down, to 70% and no further',
              'nothing may push this bar UP: Pawn Crossing\'s hand sits on top of it on a phone  (' + steps + ' steps of ' + step + ')');
          }

          /* ── 4 · the map names places, not buttons ── */
          {
            ok(/^var map_name: String = ""$/m.test(drS) && /if d\.map_name != "":\s*\n\s*return d\.map_name\s*\n\s*var s := d\.sign_text\.strip_edges\(\)/.test(fnGd(mapS, 'short_name')),
              '⛑ a door can tell the map its name, and the map asks that first');
            const re = fnGd(ptlS, '_ready_extra');
            ok(/map_name = GameState\.worlds\.pack_name\(pack\)/.test(re) && /map_name = str\(GAMES\[game\]\["name"\]\)/.test(re)
               && /home\.map_name = "Home"/.test(fnGd(twS, '_furnish_home')),
              '⛑ …a ring by its game and your checker by the game\'s own word for it',
              'all three rings read "Step into the portal", and inside your house the map said "You are inside: Go inside."');
            /* ⚠ AND NOTHING ELSE ON THE MAP IS A VERB: map.gd's own rule, run over every door the town gives a scene. */
            const short = (s) => {
              for (const cut of [',', ' — ', ' - ']) if (s.includes(cut)) s = s.slice(0, s.indexOf(cut));
              for (const pre of ['Enter the ', 'Enter ', 'Into the ', 'Play ']) if (s.startsWith(pre)) s = s.slice(pre.length);
              return s.trim();
            };
            const verbs = [];
            for (const m of twS.matchAll(/^\t(\w+)\.prompt_text = "([^"]+)"/gm)) {
              const v = m[1];
              if (!new RegExp('^\\t' + v + '\\.scene_path = ', 'm').test(twS)) continue;      /* not a door with a room behind it */
              const sign = new RegExp('^\\t' + v + '\\.sign_text = "([^"]+)"', 'm').exec(twS);
              const named = new RegExp('^\\t' + v + '\\.map_name = "([^"]+)"', 'm').exec(twS);
              const name = named ? named[1] : short(sign ? sign[1] : m[2]);
              if (/^(Go|Step|Read|Ride|Look|Walk|Open|Sit|Use)\b/.test(name)) verbs.push(v + ' = "' + name + '"');
            }
            ok(verbs.length === 0, '⚠ …and no door the town gives a room to reads as a verb on the map', verbs.join(' · ') || 'all nouns');
          }
        }

        /* ══ a crossing that goes dark · a fence with no false mouth · a dog that is not a conversation ·
              a knight on one key · a puzzle with no count — 2026-10-12, the evening batch ══ */
        /* his: "Switching windows walking around cuts to like a gray screen: can we eliminate that?" ·
           "Fix the fence at the bottom of the south end near Nate (bottom left)" · "Don't do How have you
           been or I'll let you Get on w/ the dogs. Take those out, don't make it a dialogue." · "I beat
           Maxwell, but ... it says 'You already took one off me' which would imply the opposite." ·
           "Frogger game: put in bold letters 'Hit Space to Exit' ... only offer the two options that go
           left/right 2 squares and up one" · "Maxwell asked for a puzzle completion, but the Puzzle Champ
           doesn't have that option" */
        {
          const fdE = code(rd('fade.gd')), twE = code(rd('town.gd')), npE = code(rd('npc.gd'));
          const chE = code(rd('challenger.gd')), gsE = code(rd('game_state.gd')), crE = code(rd('crossing.gd'));

          /* ── 1 · the crossing: one cover, on the root, with a size ── */
          ok(/_rect\.set_anchors_and_offsets_preset\(Control\.PRESET_FULL_RECT\)/.test(fdE)
             && !/\.set_anchors_preset\(/.test(fdE),
            '⛑⛑ the cover between two windows HAS A SIZE  (anchors AND offsets)',
            'anchors alone left a new ColorRect 0 by 0: the fade was never on screen and the engine\'s gray was');
          ok(/from\.get_tree\(\)\.root\.add_child\(f\)\s*_cover = f/.test(fnGd(fdE, 'cross'))
             && !/current_scene\.add_child/.test(fdE),
            '⛑ …and it hangs off the ROOT, so it is still black while the next window builds',
            'a child of the scene is freed with the scene');
          ok(/if is_instance_valid\(_cover\):\s*_cover\._lift\(\)\s*_cover = null\s*return/.test(fnGd(fdE, 'landing')),
            '   the window that was reached is what lifts it');
          ok(/_then\.call\(\)\s*get_tree\(\)\.create_timer\(float\(BUSY_US\) \/ 1000000\.0\)\.timeout\.connect\(_lift\)/.test(fnGd(fdE, '_done')),
            '⚠ …and a window that never says so cannot leave the screen black: the cover lifts itself');
          ok(/if not _hold:\s*return\s*_hold = false\s*remove_from_group\("town_cover"\)/.test(fnGd(fdE, '_lift')),
            '   lifting gives the feet back, once');

          /* ── 2 · the fence: a seam opens only the edge it stands at ── */
          {
            const bare = fnGd(twE, '_edge_bare');
            ok(/absf\(at\.x - p\.x\) <= s\.x \* 0\.5 \+ 14\.0 and absf\(at\.y - p\.y\) <= SEAM_NEAR/.test(bare)
               && /absf\(at\.y - p\.y\) <= s\.y \* 0\.5 \+ 14\.0 and absf\(at\.x - p\.x\) <= SEAM_NEAR/.test(bare),
              '⛑ a road out opens the fence on ITS edge, not on the one across the window',
              'the road in at the top of the south window cut the same hole in its bottom fence');
            /* the constant, against every seam and both of its window's parallel edges: derived, not trusted */
            const near = +(/const SEAM_NEAR := ([\d.]+)/.exec(twE) || [])[1];
            const topIn = +(/const EDGE_TOP_IN := ([\d.]+)/.exec(twE) || [])[1], sideIn = +(/const EDGE_SIDE_IN := ([\d.]+)/.exec(twE) || [])[1];
            const rects = { square: (/\n\treturn Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(fnGd(twE, 'region_rect')) || []).slice(1).map(Number) };
            for (const m of fnGd(twE, 'region_rect').matchAll(/"(\w+)":\s*return Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/g)) rects[m[1]] = m.slice(2).map(Number);
            const seamsSrc = twE.slice(twE.indexOf('const SEAMS := {'), twE.indexOf('\n}', twE.indexOf('const SEAMS := {')));
            let own = 0, across = Infinity, seams = 0, region = '';
            for (const line of seamsSrc.split('\n')) {
              const r = /^\t"(\w+)": \[/.exec(line);
              if (r) region = r[1];
              const s = /"at": Vector2\((-?[\d.]+), (-?[\d.]+)\), "size": Vector2\(([\d.]+), ([\d.]+)\)/.exec(line);
              if (!s || !rects[region]) continue;
              seams++;
              const [x, y, w, h] = rects[region], px = +s[1], py = +s[2], wide = +s[3] > +s[4];
              const d = wide ? [Math.abs(py - (y + topIn)), Math.abs(py - (y + h))] : [Math.abs(px - (x + sideIn)), Math.abs(px - (x + w - sideIn))];
              own = Math.max(own, Math.min(...d));
              across = Math.min(across, Math.max(...d));
            }
            ok(seams >= 10 && Object.keys(rects).length === 7 && own < near && near < across,
              '⚠ …and that distance sits between every seam\'s own fence and the one opposite it',
              seams + ' seams: furthest from its own edge ' + own + ', nearest opposite edge ' + across + ', SEAM_NEAR ' + near);
          }

          /* ── 3 · a dog is not a conversation ── */
          {
            const menu = fnGd(npE, 'menu'), act = fnGd(npE, 'interact');
            const self = menu.indexOf('"How have you been?"'), bye = menu.indexOf('"I\'ll let you get on."');
            const out = menu.search(/if animal:\s*return rows/);
            ok(out > 0 && self > out && bye > out,
              '⛑ an animal is never asked how it has been, nor told you will let it get on',
              'both rows are added after the menu has already handed an animal its rows');
            ok(/if animal:\s*if not rows\.any\(func \(r: Dictionary\) -> bool: return bool\(r\.get\("on", true\)\) or bool\(r\.get\("tell", false\)\)\):\s*say\(_greeted, 4\.2\)/.test(act),
              '⛑ …with nothing to DO with it, a dog does its line and no box opens');
            ok(/play\["tell"\] = key != "" and \(not animal or GameState\.story\.dogs_play\)/.test(fnGd(chE, 'menu')),
              '⚠ …but a gray row with news in it still opens one: a dog you KNOW plays can say why not today',
              'before the secret it cannot: "he is a dog" is the secret being kept');
            ok(/rows\.append\(\{ "id": "bye", "text": "Walk on\.", "said": "" \}\)\s*open_talk\(who, _greeted, rows\)/.test(act),
              '   …and with something to do, the way out is a thing you do: nothing is said over your head');
          }

          /* ── 4 · whose mouth the line is in ── */
          {
            const all = GD_LIST.filter((f) => f.endsWith('.gd')).filter((f) => /took one off me/.test(code(rd(f))));
            ok(/play\["text"\] = "Another game\? — you already took one off %s\." % who/.test(chE)
               && /return "You already took one off %s\." % who/.test(fnGd(gsE, 'sit_down')) && all.length === 0,
              '⛑ "you already took one off MAXWELL": the row is in your mouth, and "off me" said he had beaten you',
              all.length ? 'still says "off me": ' + all.join(' ') : 'both sentences name them');
          }

          /* ── 5 · the crossing's knight ── */
          {
            const ways = /const KNIGHT_WAYS: Array\[Vector2i\] = \[Vector2i\(-2, -1\), Vector2i\(2, -1\)\]/.test(crE);
            ok(ways && /for d in \(KNIGHT_WAYS if _piece == "n" else PortalBoard\.ORTH \+ PortalBoard\.DIAG\):/.test(fnGd(crE, 'legal')),
              '⛑ your knight is offered two jumps: two across and one up, left or right');
            ok(/if d\.x != 0:\s*go\(_at \+ \(KNIGHT_WAYS\[0\] if d\.x < 0 else KNIGHT_WAYS\[1\]\)\)/.test(fnGd(crE, '_unhandled_key_input'))
               && !/_leg\b|leg_ends/.test(crE),
              '⛑ …on ONE key, left or right  (the two-key leg and its 1.4 s are gone)');
            ok(/for d in \(PortalBoard\.JUMPS if f\.code == "n" else/.test(fnGd(crE, 'moves_of')),
              '   theirs keep all eight');
            /* seven jumps, every order of left and right, from each file a crossing can start on */
            const cols = (/var cols := \[([\d, ]+)\]/.exec(fnGd(crE, '_start_for')) || ['', ''])[1].split(',').map(Number);
            const back = +(/const BACK_ROW := (\d+)/.exec(crE) || [])[1];
            let bad = '';
            for (const c of cols) {
              const ends = new Set();
              for (let bits = 0; bits < (1 << back); bits++) {
                let x = c, on = true;
                for (let j = 0; j < back && on; j++) { x += (bits >> j) & 1 ? 2 : -2; on = x >= 0 && x <= 7; }
                if (on) ends.add(x);
              }
              const got = [...ends].sort((a, b) => a - b).join(','), want = [c - 2, c + 2].join(',');
              if (got !== want) bad += ' file ' + c + ' lands on ' + got;
            }
            ok(cols.length === 4 && back === 7 && bad === ''
               && /if code == "n":\s*for c in cols:\s*for x in \[int\(c\) - 2, int\(c\) \+ 2\]:\s*if not bool\(_seats\[x\]\):\s*return int\(c\)/.test(fnGd(crE, '_start_for')),
              '⛑ …and it starts where one of the two seats it can reach is open  (walked: every order of seven jumps)',
              bad || 'from files ' + cols.join(' ') + ' it can only ever land two files away');
            ok(/if _piece == "n" and _hop < 0\.0 and legal\(\)\.is_empty\(\):\s*_to_start\(\)/.test(fnGd(crE, '_process')),
              '⚠ a knight with no jump left walks back to the start; it does not wait there for the flag');
            /* ⚑ 2026-10-13: the words moved into _exit_words(), which also knows a controller ("Press A to Exit"). */
            ok(/_exit_tip\.text = _exit_words\(\)/.test(crE)
               && /return "Tap USE to Exit" if TouchPad\.probably_touch\(\) else "Hit Space to Exit"/.test(fnGd(crE, '_exit_words'))
               && /bold\.variation_embolden = 1\.0\s*_exit_tip\.add_theme_font_override\("font", bold\)/.test(crE)
               && /_hud\.add_child\(_exit_tip\)/.test(crE),
              '⛑ "Hit Space to Exit" is on the glass in bold  (the pad\'s word on a phone)');
          }

          /* ── 6 · a puzzle for its own sake ── */
          {
            const champ = twE.slice(twE.indexOf('class PuzzleChamp extends TownNPC:'));
            ok(/if not GameState\.challenge\.puzzle_running\(\) and not GameState\.challenge\.puzzle_ready\(\):\s*rows\.append\(\{ "id": "one", "text": "Set me one\. No count\." \}\)/.test(champ)
               && /"one":\s*end_talk\(\)\s*GameState\.challenge\.puzzle_practice\(\)/.test(champ),
              '⛑ with the oars won or today\'s run missed, the Puzzle Champ still sets ONE',
              'a favor or a bounty that asks for a puzzle could not be done from inside the game');
            const prac = fnGd(gsE, 'puzzle_practice');
            ok(/open_url\(PUZZLE_URL\)/.test(prac) && !/oars|puz\b|puz\[/.test(prac),
              '   …through the same door, with no run started and none touched');
            const said = [[0, (words('anyone').favor_puzzle || [''])[0]], /"id": "puzzle",[^\n]*"text": "([^"]+)"/.exec(gsE), /"puzzle":\s*return "([^"]+)"/.exec(fnGd(gsE, 'favor_line'))].map((m) => (m ? m[1] : ''));
            ok(said.every((s) => /Puzzle Champ's puzzles/.test(s) && !/site/.test(s)),
              '   and the three lines that send you there name HIM, not "the site"', said.join(' | '));
          }
        }

        /* ══ a rating at the top of the glass · a booth that runs · Murphy where it stood · fixes that
              mean something — 2026-10-12, the evening batch, second half ══ */
        /* his: "Let's put the player's rating top and center screen ... It's not the user's true rating, a
           beginner chess player can get their character up to 3200 in the game ... The rating unlocks
           higher rated players" · "pays out the first two times, then offers to quintuple your money and
           takes it all and never comes back. Put the underwriter in his place. Maybe he's a character you
           may not unlock and the game still plays the same." · "Let's make the Maxwell fixes more
           meaningful; the fixed lamp unveils something, ... makes the owner like you more, etc." */
        {
          const gsR = code(rd('game_state.gd')), znR = code(rd('zone.gd')), twR = code(rd('town.gd'));
          const mnR = code(rd('money.gd')), chR = code(rd('challenger.gd')), dgR = code(rd('dog.gd'));
          const pkR = code(rd('park.gd')), hmR = code(rd('home.gd')), jrR = code(rd('journal.gd'));
          const num1 = (name) => +(new RegExp('const ' + name + ' := (-?\\d+)').exec(gsR) || [])[1];

          /* ── 1 · the rating: it only climbs ── */
          const START = num1('RATING_START'), CAP = num1('RATING_CAP'), SQ = num1('RATING_SQUARE');
          const PER = num1('RATING_WIN_PER'), MIN = num1('RATING_WIN_MIN'), REACH = num1('RATING_REACH');
          ok(START === 400 && CAP === 3200 && /var rating: int = RATING_START/.test(gsR),
            '⭐ your rating starts at 400 and tops out at 3200  (his numbers)', START + ' to ' + CAP);
          {
            const rate = fnGd(gsR, 'rate');
            const sets = (gsR.match(/(^|[^\w.])(?:(?:GameState\.)?ladder\.)?rating = /g) || []).length;
            const drops = /(^|[^\w.])(?:(?:GameState\.)?ladder\.)?rating -= /.test(gsR);
            ok(/var up := mini\(RATING_CAP, rating \+ maxi\(0, by\)\) - rating\s*if up <= 0:\s*return\s*rating \+= up\s*rating_changed\.emit\(rating, up\)/.test(rate)
               && sets === 1 && !drops,
              '⛑ it ONLY EVER CLIMBS: one function raises it, nothing lowers it, and a loss is not mentioned',
              sets + ' plain assignment (the load), ' + (drops ? 'and something subtracts' : 'nothing subtracts'));
            ok(/ladder\.rating = clampi\(maxi\(int\(d\.get\("rating", 0\)\), ladder\.RATING_START \+ ladder\.RATING_SQUARE \* board\.army\.size\(\)\), ladder\.RATING_START, ladder\.RATING_CAP\)/.test(fnGd(gsR, 'load_state'))
               && fnGd(gsR, 'load_state').indexOf('army.sort()') < fnGd(gsR, 'load_state').indexOf('rating = clampi('),
              '⛑ a save from before the rating starts where its board put it, never at 400 with squares won',
              'the seats those squares came from would have locked behind a number nobody had been shown');
          }
          ok(/GameState\.money\.deed_won\(key\)\s*GameState\.ladder\.rate\(maxi\(GameState\.ladder\.RATING_WIN_MIN, GameState\.ladder\.seat_elo\(key\) \/ GameState\.ladder\.RATING_WIN_PER\)\)/.test(fnGd(gsR, 'resolve_challenge'))
             && /GameState\.board\.army_changed\.emit\(GameState\.board\.army\.size\(\)\)\s*GameState\.ladder\.rate\(GameState\.ladder\.RATING_SQUARE\)\s*return slot/.test(fnGd(gsR, '_fill_their_slot'))
             && /GameState\.ladder\.rate\(GameState\.ladder\.RATING_SQUARE \* won\.size\(\)\)/.test(fnGd(gsR, 'check_site_unlocks')),
            '⭐ a win raises it by their rating over ' + PER + ', and a square on your board by ' + SQ + ', wherever the square came from');
          {
            const need = fnGd(gsR, 'rating_needed'), sit = fnGd(gsR, 'sit_down');
            /* ⚑ HIS RULE, 2026-10-26: "you can't play an opponent that is rated 200 or more rating points higher than yours" */
            ok(REACH === 200 && /if key == "" or key == GameState\.challenge\.CEO_KEY or GameState\.board\.has_slot\(GameState\.board\.slot_for_key\(key\)\):\s*return 0\s*return maxi\(0, seat_elo\(key\) - RATING_REACH \+ 1\)/.test(need),
              '⛑ nobody rated 200 or more above you may be played  (his), EXCEPT one whose square you hold, and the CEO',
              'his chair is opened by the full board: a second lock on the finale is a grind in front of the ending');
            ok(sit.indexOf('rating_short(key)') > sit.indexOf('beaten_today(key)') && sit.indexOf('rating_short(key)') < sit.indexOf('spend(cost)'),
              '⛑ …refused in the ONE place that sits you down, before any energy is taken');
            ok(/func locked_say\(\) -> String:\s*return GameState\.ladder\.rating_short\(key\)/.test(chR)
               && /return "he is a dog"\s*return super\(\)/.test(fnGd(dgR, 'locked_say'))
               && /var short := GameState\.ladder\.rating_short\(key\)\s*if short != "":\s*return s \+ "  —  " \+ short/.test(pkR)
               && /elif GameState\.ladder\.rating_short\(key\) != "":/.test(hmR),
              '   and all four places that offer a seat say so in the same words: the person, the dog, the table, the board at home');
            /* the ladder, walked: each seat beaten once in rating order, nothing else done */
            const seatsSrc = pkR.slice(pkR.indexOf('const SEATS := ['), pkR.indexOf('\n]', pkR.indexOf('const OFF := [')));
            const seats = [...seatsSrc.matchAll(/\{ "key": "(\w+)",\s+"who": "(\w+)",\s+"elo": (\d+)/g)]
              .map((m) => ({ who: m[2], elo: +m[3] })).filter((s) => s.elo > 0 && s.who !== 'CEO').sort((a, b) => a.elo - b.elo);
            let r = START, open = 0, wall = '';
            for (const s of seats) {
              if (r < Math.max(0, s.elo - REACH + 1)) { wall = s.who + ' wants ' + (s.elo - REACH + 1) + ', the ladder alone gives ' + r; break; }
              open++;
              r += Math.max(MIN, Math.floor(s.elo / PER)) + SQ;
            }
            ok(seats.length >= 7 && open === seats.length,
              '⚠ …and from 400 every seat opens one after another, each beaten once  (the square is 200 so his rule leaves no wall)',
              open + ' of ' + seats.length + ' open in turn' + (wall ? '; then ' + wall : '; no wall'));
          }
          {
            const build = fnGd(znR, '_build_hud'), place = fnGd(znR, '_place_rating'), paint = fnGd(znR, '_paint_hud');
            ok(/_rate_cap\.text = "RATING"/.test(build) && /bold\.variation_embolden = 0\.8\s*_rate\.add_theme_font_override\("font", bold\)\s*_hud\.add_child\(_rate\)/.test(build)
               && /_rate\.text = str\(GameState\.ladder\.rating\)/.test(place)
               && /var x: float = \(get_viewport\(\)\.get_visible_rect\(\)\.size\.x - \(cap\.x \+ gap \+ num\.x\)\) \* 0\.5/.test(place),
              '⭐ the rating is on the glass, in bold, with its middle on the middle of the screen');
            ok(/_rate\.visible = _stat\.visible\s*_rate_cap\.visible = _stat\.visible/.test(place)
               && /_after_ready\(\)\s*_place_rating\(\)/.test(znR),
              '   it goes with the stat row: a room that hides one (the crossing, the nightmare) has its own score there');
            ok(/_place_rating\(\)\s*if not wrap and is_instance_valid\(_rate_cap\) and _rate_cap\.visible:\s*room = minf\(room, _rate_cap\.position\.x - _stat\.position\.x - 18\.0 \* k\)/.test(paint)
               && /_rate\.visible and r\.intersects\(Rect2\(_rate_cap\.position,/.test(fnGd(znR, 'hud_over')),
              '⚠ the stat row gives way to it, and a name in the world steps aside for it like the rest of the top');
            ok((znR.match(/_rating_note\(\)/g) || []).length === 5 && /_rated_by \+= by\s*_paint_hud\(\)\s*call_deferred\("_flush_rating"\)/.test(fnGd(znR, '_report_rating')),
              '   the win that raised it says by how much in its own line, once',
              (znR.match(/_rating_note\(\)/g) || []).length - 1 + ' sentences carry it (three wins and a square that arrives from a game)');
            ok(/"a": "Your rating"/.test(jrR), '   and the Journal has it under THE BOARD');
          }
          ok(/"rating": ladder\.rating, "booth_nights": money\.booth_nights[,\s]/.test(fnGd(gsR, 'save_state'))
             && /"rating": ladder\.rating, "booth_nights": money\.booth_nights,\s*"board": board\.banner\(\), "run": run_began \}\)/.test(gsR)
             && /if int\(d\.get\("rating", 0\)\) > ladder\.rating:/.test(fnGd(gsR, 'merge_in'))
             && /if int\(d\.get\("booth_nights", 0\)\) > money\.booth_nights:/.test(fnGd(gsR, 'merge_in'))
             && /local\.rating = Math\.max\(\+local\.rating \|\| 0, \+remote\.rating \|\| 0\)/.test(fn(PROF, 'townMerge'))
             && /local\.booth_nights = Math\.max\(\+local\.booth_nights \|\| 0, \+remote\.booth_nights \|\| 0\)/.test(fn(PROF, 'townMerge')),
            '⭐⭐ both new numbers are saved, loaded, pushed and merged as a MAX on both sides  [[everything-earned-syncs]]');

          /* ── 2 · the booth runs, and Murphy stands where it stood ── */
          {
            const booth = mnR.slice(mnR.indexOf('class Booth extends Interactable:'), mnR.indexOf('class Underwriter extends TownNPC:'));
            ok(/GameState\.money\.booth_changed\.connect\(func \(\) -> void:\s*if not GameState\.money\.booth_open\(\):\s*queue_free\(\)\)/.test(booth)
               && /\(LAST_PAGE % GameState\.money\.BOOTH_PROMISE\) if GameState\.money\.booth_last_night\(\) else PAGE/.test(booth)
               && /const LAST_PAGE := "[^"]*%d times over\."/.test(booth),
              '⛑ the third night the book promises five times over, and the booth is gone the morning it runs');
            const swap = fnGd(twR, '_booth_or_murphy');
            ok(/if GameState\.money\.booth_open\(\):\s*if not is_instance_valid\(_booth\):/.test(swap)
               && /booth\.position = BOOTH_AT/.test(swap)
               && /elif not is_instance_valid\(_murphy\):\s*_murphy = TownMoney\.Underwriter\.murphy\(BOOTH_AT\)\s*add_child\(_murphy\)/.test(swap)
               && /_booth_or_murphy\(\)\s*GameState\.money\.booth_changed\.connect\(_booth_or_murphy\)/.test(fnGd(twR, '_furnish_square_extras'))
               && (twR.match(/TownMoney\.Booth\.new\(\)/g) || []).length === 1 && (twR.match(/Underwriter\.murphy\(/g) || []).length === 1,
              '⛑ …and Murphy stands WHERE IT STOOD from that morning on: one or the other, never both, never twice',
              'a character you may never unlock: his square is won in a game, so nothing waits on him');
            ok(/GameState\.money\.booth_gone\.connect\(_report_booth_gone\)/.test(znR)
               && /_paid_lines\.append\("The booth is gone, and the %d ore you left in it" % taken\)/.test(fnGd(znR, '_report_booth_gone')),
              '   whichever room you wake in says what happened');
            ok(/else \("nothing" if GameState\.money\.booth_open\(\) else "it is gone"\)/.test(jrR), '   and the Journal stops offering it');
          }

          /* ── 3 · a fix means something ── */
          {
            const block2 = gsR.slice(gsR.indexOf('const REPAIRS := ['), gsR.indexOf('\n]', gsR.indexOf('const REPAIRS := [')));
            const rows = [...block2.matchAll(/\{ "id": "([a-z]+)",[^\n]*"likes": \[([^\]]*)\] \}/g)].map((m) => ({ id: m[1], likes: (m[2].match(/"([^"]+)"/g) || []).map((s) => s.slice(1, -1)) }));
            /* everybody named must be somebody who stands in the game: a heart for a typo is a heart for nobody */
            const everyGd = GD_LIST.filter((f) => f.endsWith('.gd')).map((f) => code(rd(f))).join('\n');
            const real = (n) => new RegExp('_add_challenger\\("' + n + '"|\\.who = "' + n + '"|"who": "' + n + '"').test(everyGd);
            const ghosts = [...new Set(rows.flatMap((r) => r.likes))].filter((n) => !real(n));
            ok(rows.length === 9 && rows.filter((r) => r.likes.length > 0).length >= 8 && ghosts.length === 0,
              '⭐ every repair names who likes you more for it, and each of them is somebody who stands in the game',
              ghosts.length ? 'NOBODY BY THAT NAME: ' + ghosts.join(', ') : rows.map((r) => r.id + ':' + (r.likes.join('+') || '-')).join(' '));
            ok(/repairs\[id\] = 1\s*for who in row\.get\("likes", \[\]\):\s*GameState\.people\.bump\(str\(who\), 1\)/.test(fnGd(gsR, 'repair'))
               && /var did := GameState\.town\.fix_note\(str\(r\["id"\]\)\)/.test(twR)
               && /\+ \("  \(%s\)" % did if did != "" else ""\)/.test(twR),
              '⛑ …a heart each the day it is mended, and Maxwell\'s line says who');
            const tin = twR.slice(twR.indexOf('class LampFind extends Interactable:'), twR.indexOf('class SignRead extends Interactable:'));
            const deadLamp = /for x in \[(-?[\d.]+), -?[\d.]+\]:\s*var lamp := TownLamp\.new\(\)\s*lamp\.position = Vector2\(x, -?[\d.]+\)\s*lamp\.fix_id = "lamp" if x < -1000\.0 else ""/.exec(twR);
            const tinAt = /var tin := LampFind\.new\(\)\s*tin\.position = Vector2\((-?[\d.]+), /.exec(twR);
            ok(/return GameState\.town\.fixed\("lamp"\) and TownClock\.is_dark\(\) and not GameState\.story\.found\("lamp"\)/.test(tin)
               && /visible = shown\(\)\s*monitoring = visible/.test(tin)
               && /GameState\.story\.find\("lamp"\)\s*GameState\.money\.add_ore\(GameState\.town\.LAMP_FIND\)/.test(tin)
               && deadLamp && tinAt && +deadLamp[1] === +tinAt[1] && +deadLamp[1] < -1000,
              '⭐ the mended west lamp UNVEILS something: a tin of ore at its own foot, in its light, after dark, once',
              deadLamp && tinAt ? 'lamp at x ' + deadLamp[1] + ', tin at x ' + tinAt[1] : 'not placed');
            ok(/return told\.has\("find:" \+ id\)/.test(fnGd(gsR, 'found')) && /told\["find:" \+ id\] = 1\s*GameState\.save_state\(\)/.test(fnGd(gsR, 'find'))
               && /"told": story\.told/.test(gsR) && /local\.told = union\(local\.told, remote\.told\)/.test(fn(PROF, 'townMerge')),
              '   …found once on every device: it is kept where the story\'s beats are, which already sync as a union');
            const post = twR.slice(twR.indexOf('class SignRead extends Interactable:'), twR.indexOf('const BOOTH_AT :='));
            const old = twR.slice(twR.indexOf('class Signpost extends Interactable:'), twR.indexOf('func _light_the_hall'));
            /* ⚠ THE STATEMENT, NOT THE WORDS: an earlier version of this passed on a listener's body while
               the post answered from the first morning. */
            ok(/prompt_text = "Read the chalk on the signpost"\s*monitoring = GameState\.town\.fixed\("sign"\)\s*func interact/.test(post)
               && /who != null and not who\.animal and who\.away\(\)/.test(post)
               && !/North|East|South|West/.test(post) && /North up the haul road/.test(old)
               && /if spot\[1\] == "sign":\s*var post := SignRead\.new\(\)/.test(twR),
              '⭐ the mended signpost says who is NOT OUT today  (the roads are the square\'s post\'s job, and stay it)');
          }
        }

        /* ══ a controller in the hand — 2026-10-13 ══ */
        /* his: "Can you make it so I can play using my nintendo switch controller?" */
        {
          const pdC = code(rd('pad.gd')), plC = code(rd('player.gd')), jrC = code(rd('journal.gd')), uiC = code(rd('town_ui.gd'));
          const znC = code(rd('zone.gd')), crC = code(rd('crossing.gd')), prj = rd('project.godot');
          ok(/\[autoload\][\s\S]*?\nPad="\*res:\/\/core\/pad\.gd"/.test(prj), '⭐ the pad\'s script is loaded with the game  (an autoload, so every room can ask it)');
          /* ── which make of pad: the list is the game's, the names are real browsers' ── */
          const marks = JSON.parse(((/const MARKS := (\[[^\]]*\])/.exec(pdC) || [0, '[]'])[1]));
          const isNin = (id) => marks.some((m) => id.toLowerCase().includes(m));
          const NIN = ['Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)', 'Joy-Con L+R (STANDARD GAMEPAD Vendor: 057e Product: 200e)',
            'Joy-Con (L) (Vendor: 057e Product: 2006)', '057e-2009-Pro Controller', 'Nintendo Switch Pro Controller'];
          const NOT = ['Xbox 360 Controller (XInput STANDARD GAMEPAD)', 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)',
            'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)', 'Standard Gamepad Mapping', ''];
          ok(marks.length > 0 && NIN.every(isNin) && !NOT.some(isNin)
             && /for mark in MARKS:\s*if n\.contains\(mark\):\s*return true\s*return false/.test(fnGd(pdC, 'is_nintendo')),
            '⛑ a Switch pad is known by its own name, as Chrome and Firefox word it, and an Xbox or a PlayStation one is not', marks.join(' · '));
          ok(/if OS\.has_feature\("web"\):\s*var id = JavaScriptBridge\.eval\(\s*"\(function\(\)\{try\{var p=navigator\.getGamepads\(\)\[%d\];return p\?String\(p\.id\):''\}catch\(e\)\{return ''\}\}\)\(\)" % device, true\)/.test(fnGd(pdC, '_name_of'))
             && /nintendo = is_nintendo\(_name_of\(_device\)\)/.test(fnGd(pdC, '_input')),
            '⛑ in a browser the make is read off the BROWSER\'s id  (the engine calls every standard pad "Standard Gamepad Mapping")');
          ok(/var swap := nintendo and by_print\s*_joy\("ui_accept", JOY_BUTTON_B if swap else JOY_BUTTON_A\)\s*_joy\("ui_cancel", JOY_BUTTON_A if swap else JOY_BUTTON_B\)/.test(fnGd(pdC, '_bind'))
             && /var by_print := OS\.has_feature\("web"\)/.test(pdC),
            '⛑ on his pad A is the RIGHT button and B the bottom one: accept and cancel are swapped, in a browser only');
          ok(/Input\.joy_connection_changed\.connect\(_plugged\)/.test(fnGd(pdC, '_ready')) && /_device = -1/.test(fnGd(pdC, '_plugged')),
            '   …and a pad that comes or goes is asked its name again');
          /* ── walking ── */
          ok(/Input\.get_vector\("ui_left", "ui_right", "ui_up", "ui_down", Pad\.WALK_DEADZONE\)/.test(plC)
             && /elif dir\.length\(\) < 0\.999:\s*push = lerpf\(CRAWL, 1\.0, dir\.length\(\)\)/.test(plC)
             && +(/const WALK_DEADZONE := ([\d.]+)/.exec(pdC) || [])[1] <= 0.3,
            '⭐ a stick has a middle: a part push is a slow walk, not nothing and then his full speed');
          /* ── the Journal, a conversation ── */
          const jIn = fnGd(jrC, '_unhandled_input');
          ok(/if Pad\.hit\(event, Pad\.TOP\) and not _talking\(\):\s*toggle\(\)/.test(jIn) && /elif Pad\.hit\(event, Pad\.MINUS\) and not _talking\(\):\s*_map_key\(\)/.test(jIn)
             && /elif _open and event\.is_action_pressed\("ui_cancel"\):\s*close\(\)/.test(jIn)
             && /elif _open and step != 0:\s*_pick\(wrapi\(_tab \+ step, 0, TABS\.size\(\)\)\)/.test(jIn),
            '⭐ the Journal on a pad: the top button opens it, Minus the map, the shoulders walk the tabs, B shuts it');
          const uIn = fnGd(uiC, '_unhandled_input');
          ok((uIn.match(/event\.is_action_pressed\("ui_cancel"\)/g) || []).length === 2 && !/KEY_ESCAPE/.test(uIn)
             && /is_action_pressed\("ui_cancel"\):\s*get_viewport\(\)\.set_input_as_handled\(\)\s*close\(\)\s*return\s*if not \(event is InputEventKey\)/.test(uIn),
            '⛑ B leaves a conversation the way Escape does, rows up or rows down  (asked BEFORE the keys-only line: a pad\'s B is no key)');
          /* ── the words follow the hand ── */
          ok(/if Pad\.using:\s*return "Stick or D-pad  ·  %sA  ·  %s%s Journal" % \["click it to run  ·  " if runs else "", "B jump  ·  " if jumps else "", Pad\.word\(Pad\.TOP\)\]/.test(fnGd(znC, 'default_hint'))
             && /if hint == "" or hint == TownZone\.default_hint\(true\) or hint == TownZone\.default_hint\(false\):\s*_keys_line = true\s*Pad\.changed\.connect\(_default_hint_again\)\s*hint = TownZone\.default_hint\(runs\(\), jumps\(\)\)\s*_ui\.set_hint\(hint\)/.test(znC)
             && /hint = TownZone\.default_hint\(runs\(\), jumps\(\)\)\s*_ui\.set_hint\(hint\)/.test(fnGd(znC, '_default_hint_again'))
             && /return player != null and player\.afoot\(\) and GameState\.body\.gear == ""/.test(fnGd(znC, 'runs'))
             && /return player != null and player\.afoot\(\)(?! and)/.test(fnGd(znC, 'jumps')),
            '⭐ the line at the bottom names the pad\'s buttons, and changes the moment a pad or a key is touched  (no "B jump" in a fight)');
          ok(/if using:\s*return "press A"/.test(fnGd(pdC, 'use_words')) && /Pad\.use_words\(\)/.test(code(rd('mine.gd'))) && /Pad\.use_words\(\)/.test(code(rd('sea_board.gd')))
             && /if Pad\.using:\s*return "Press A to Exit"/.test(fnGd(crC, '_exit_words')) && /Pad\.changed\.connect\(_pad_words\)/.test(crC),
            '   …and so does every "press ENTER", and the bold way out of Pawn Crossing');
          /* ── Pawn Crossing ── */
          ok(/var joy := v\.length\(\) < 0\.3\s*if joy:\s*v = Pad\.stick\(\)/.test(fnGd(crC, '_stick')) && !/get_vector/.test(crC)
             && /if d != Vector2\.ZERO:\s*return d\.normalized\(\)/.test(fnGd(pdC, 'stick')) && !/get_vector|is_action/.test(fnGd(pdC, 'stick')),
            '⛑ Pawn Crossing hops on a pad\'s OWN stick and D-pad, never on an action a key answers to  (a key that did both hopped twice)');
          const cIn = fnGd(crC, '_unhandled_input');
          ok(/var skill := \[Pad\.LEFT, Pad\.TOP, Pad\.R\]\.find\(b\.button_index\)/.test(cIn)
             && /if Pad\.hit\(event, Pad\.L\):\s*_pick = _pick \+ 1 if _pick \+ 1 < _hand\.size\(\) else -1/.test(cIn) && /elif skill >= 0:\s*use_skill\(skill\)/.test(cIn),
            '   …L walks your hand, and the three skills are the left button, the top one and R');

          /* ── a stick is not a key — 2026-10-14 ── */
          /* his: "using the joystick to choose dialogue options is erratic, it should be a smooth selection
             process. Right now you have to finesse it to select what you want" */
          const stepC = fnGd(pdC, 'menu_step'), numP = (name) => +(new RegExp('const ' + name + ' := ([\\d.]+)').exec(pdC) || [])[1];
          const uPr = fnGd(uiC, '_process');
          ok(/if event\.is_action_pressed\("ui_down"\) or event\.is_action_pressed\("ui_up"\):\s*get_viewport\(\)\.set_input_as_handled\(\)\s*if event is InputEventKey:\s*_step_row\(/.test(uIn)
             && /elif _mode == TALK:\s*var by := Pad\.menu_step\(delta\)\s*if by != 0:\s*_step_row\(by\)/.test(uPr),
            '⛑ the rows of a conversation step on a KEY where keys are heard, and on a pad ONCE A FRAME  (every report of a held stick was another press: one push ran down the list)');
          ok(numP('STEP_ON') >= 0.5 && numP('STEP_OFF') > 0 && numP('STEP_OFF') <= numP('STEP_ON') - 0.2
             && /absf\(v\.y\) > absf\(v\.x\) and absf\(v\.y\) > \(STEP_OFF if _step_dir != 0 else STEP_ON\)/.test(stepC),
            '⭐ a push has to go well over to count and come well back to count again, and a sideways one is not a push', 'on at ' + numP('STEP_ON') + ', off at ' + numP('STEP_OFF'));
          ok(/if sprung and _step_dir == 0 and _step_deaf > 0\.0 and want == -_step_was:\s*return 0/.test(stepC)
             && /if _step_dir != 0:\s*_step_was = _step_dir\s*_step_deaf = STEP_DEAF/.test(stepC) && numP('STEP_DEAF') >= 0.1 && numP('STEP_DEAF') <= 0.4,
            '⛑ a stick let go springs past the middle: the far side is deaf for a moment  (the STICK only: a D-pad pressed the other way is a press)', numP('STEP_DEAF') + ' s');
          ok(/_step_wait = STEP_FIRST\s*return want/.test(stepC) && /_step_wait -= delta\s*if _step_wait <= 0\.0:\s*_step_wait = STEP_NEXT\s*return want/.test(stepC)
             && numP('STEP_FIRST') >= 0.3 && numP('STEP_NEXT') >= 0.1 && numP('STEP_NEXT') < numP('STEP_FIRST'),
            '⭐ held, it walks on at a steady pace: a pause, then a row at a time', numP('STEP_FIRST') + ' s, then every ' + numP('STEP_NEXT') + ' s');
          ok(/var fresh := Engine\.get_process_frames\(\) - _step_frame > 1/.test(stepC) && /if fresh:\s*_step_block = want != 0/.test(stepC)
             && /if _step_block:\s*_step_block = want != 0\s*return 0/.test(stepC),
            '⚠ a list that opens under a stick already pushed (you walked up to somebody) waits for it to be let go');
          ok(/if _out >= 0\.0:\s*return\s*if event is InputEventJoypadMotion:\s*return/.test(fnGd(code(rd('board_view.gd')), '_unhandled_input'))
             && /elif \(not \(event is InputEventJoypadMotion\) and \(event\.is_action_pressed\("ui_left"\) or event\.is_action_pressed\("ui_right"\)\)\)/.test(code(rd('photo.gd'))),
            '   …and the two other places a held stick was counted over and over (a lesson\'s steps, the camera\'s flip) take a D-pad or a key');

          /* ── the six other buttons: running, the view — 2026-10-14 ── */
          /* his: "running should cost a little energy.  I like your idea: go for it" */
          const gsC = code(rd('game_state.gd')), numPl = (name) => dial(name, (x) => +(new RegExp('const ' + x + ' := ([\\d.]+)').exec(plC) || [])[1]);
          const numGs = (name) => dial(name, (x) => +(new RegExp('const ' + x + ' := ([\\d.]+)').exec(gsC) || [])[1]);
          const plIn = fnGd(plC, '_unhandled_input'), plPh = fnGd(plC, '_physics_process'), plView = fnGd(plC, '_pad_view');
          ok(/if _run_on:\s*if dir\.length_squared\(\) < 0\.001:\s*_run_still \+= _delta\s*if _run_still > tune\.run_grace:\s*_run_on = false\s*else:\s*_run_still = 0\.0\s*if not GameState\.body\.tire\(_delta\):\s*_run_on = false\s*var run := tune\.run_share if _run_on else 1\.0[\s\S]*?else:\s*_skate_push = false\s*velocity = dir\.normalized\(\) \* speed \* push \* run/.test(plPh)
             && /if Pad\.hit\(event, JOY_BUTTON_LEFT_STICK\):\s*get_viewport\(\)\.set_input_as_handled\(\)\s*_run_on = not _run_on and roams_here\(\)/.test(plIn)
             && numPl('RUN_SPEED') >= 1.2 && numPl('RUN_SPEED') <= 2 && numPl('RUN_GRACE') > 0 && numPl('RUN_GRACE') <= 1,
            '⭐ a click of the left stick runs, for as long as you keep moving: stand still and it is over',
            numPl('RUN_SPEED') + '× the walk, over after ' + numPl('RUN_GRACE') + ' s still');
          ok(/_run_s \+= seconds\s*if _run_s >= tune\.run_tires_secs:\s*_run_s -= tune\.run_tires_secs\s*energy = maxi\(0, energy - 1\)\s*energy_changed\.emit\(energy, energy_cap\)\s*if energy % tune\.game_cost == 0:\s*GameState\.save_state\(\)\s*return energy > 0/.test(fnGd(gsC, 'tire'))
             && numGs('RUN_TIRES_SECS') >= 10 && numGs('RUN_TIRES_SECS') <= 120,
            '⭐ running costs a little energy, and an empty bar ends the run', 'a point for every ' + numGs('RUN_TIRES_SECS') + ' s of running');
          ok(/if _in_talk\(\):\s*velocity = Vector2\.ZERO\s*_goal = null\s*_run_on = false/.test(plPh),
            '   …and a conversation ends it too');
          /* ⚠ A FIGHT'S PACE AND VIEW ARE THE GAME'S: zoomed in on the square, you walked into Chess Zombies
             unable to see the board. The Sand Mine run is no town room at all. */
          const roams = fnGd(plC, 'roams_here');
          const fights = ['chessboard.gd', 'crossing.gd'].filter((f) => /func is_fight\(\) -> bool:\s*return true/.test(code(rd(f))));
          ok(/var z := get_parent\(\) as TownZone\s*return z != null and not z\.is_fight\(\)/.test(roams)
             && /func is_fight\(\) -> bool:\s*return false/.test(znC) && fights.length === 2
             && /var z := maxf\(least, maxf\(1\.0, least\) \* \(Pad\.zoom if roams_here\(\) else 1\.0\)\)/.test(fnGd(plC, '_fit_camera'))
             && /if not is_instance_valid\(_cam\) or not roams_here\(\) or _in_talk\(\):\s*return/.test(plView)
             && /return roams_here\(\)/.test(fnGd(plC, 'afoot')) && /return player != null and player\.afoot\(\) and GameState\.body\.gear == ""/.test(fnGd(znC, 'runs')),
            '⛑ in a fight the pad neither runs nor moves the view, and the line does not offer it  (Chess Zombies, Pawn Crossing; the Sand Mine run is no town room)',
            'fights: ' + fights.join(' · '));
          ok(/var zt := Pad\.triggers\(\)\s*if absf\(zt\) > 0\.05:\s*Pad\.zoom = clampf\(Pad\.zoom \* exp\(zt \* Pad\.ZOOM_RATE \* delta\), Pad\.ZOOM_OUT, Pad\.ZOOM_IN\)\s*_fit_camera\(_lim\)/.test(plView)
             && /Input\.get_joy_axis\(_device, JOY_AXIS_TRIGGER_RIGHT\) - Input\.get_joy_axis\(_device, JOY_AXIS_TRIGGER_LEFT\)/.test(fnGd(pdC, 'triggers'))
             && /var z := maxf\(least, maxf\(1\.0, least\) \* \(Pad\.zoom if roams_here\(\) else 1\.0\)\)\s*_cam\.zoom = Vector2\(z, z\)/.test(fnGd(plC, '_fit_camera'))
             && /func _process\(delta: float\) -> void:\s*_pad_view\(delta\)/.test(plC)
             && numP('ZOOM_OUT') >= 0.5 && numP('ZOOM_OUT') < 1 && numP('ZOOM_IN') > 1 && numP('ZOOM_IN') <= 2,
            '⭐ ZL pulls the view out and ZR brings it in, and the room\'s own fit still wins: out never shows past its edge or its cap',
            'from ' + numP('ZOOM_OUT') + ' to ' + numP('ZOOM_IN') + ' of the room\'s fit');
          ok(/var lv := Pad\.look\(\)\s*if lv != Vector2\.ZERO:\s*var reach := get_viewport_rect\(\)\.size \* tune\.look_reach \/ _cam\.zoom\.x\s*_look = \(_look \+ lv \* reach \* tune\.look_rate \* delta\)\.clamp\(-reach, reach\)\s*_cam\.position = cam_offset \+ _look/.test(plView)
             && !/_cam\.offset/.test(plC) && numPl('LOOK_REACH') > 0 && numPl('LOOK_REACH') <= 0.5,
            '⛑ the right stick looks ahead by moving the CAMERA, never its offset  (an offset shows what is past the map\'s edge), and only so far',
            numPl('LOOK_REACH') + ' of the screen');
          ok(/if Pad\.hit\(event, JOY_BUTTON_RIGHT_STICK\):\s*get_viewport\(\)\.set_input_as_handled\(\)\s*Pad\.zoom = 1\.0\s*_look = Vector2\.ZERO\s*if is_instance_valid\(_cam\):\s*_cam\.position = cam_offset\s*_fit_camera\(_lim\)/.test(plIn),
            '   …and clicking it puts the view back, zoom and all');

          /* ── he stops to wave — 2026-10-14 ── */
          /* his: "waving and moving at the same time causes a funny instance of legs not moving and the character
             gliding while moving - can we make it so he can't wave and move at the same time?" */
          const pmC = code(rd('player_model.gd'));
          ok(/if _model != null and _model\.waving\(\) and roams_here\(\):\s*velocity = velocity\.move_toward\(Vector2\.ZERO, speed \* tune\.skate_coast \* _delta\) if skating\(\) else Vector2\.ZERO\s*_run_on = false/.test(plPh)
             && /if _model\.celebrate\(\) and roams_here\(\):\s*velocity = Vector2\.ZERO/.test(fnGd(plC, 'celebrate')),
            '⭐ he stops to wave and walks on when it is done, stopped by the press itself  (a fast screen draws a frame before the next physics step)');
          ok(/var walking := moved > 0\.0001\s*if _wave and walking:\s*_emote = 0\.0\s*_wave = false/.test(fnGd(pmC, 'advance'))
             && /return _wave and _emote > 0\.0/.test(fnGd(pmC, 'waving'))
             && /_emote = _anim\.get_animation\(_clip_win\)\.length \+ WIN_HOLD\s*_wave = true/.test(fnGd(pmC, 'celebrate'))
             && /_wave = false\s*return true/.test(fnGd(pmC, '_once')),
            '⛑ wherever something else moves him (a fight, a hop in Pawn Crossing), his first step ends the wave  (its clip owns the legs, and a body moved under it glides)');
        }

        /* ══ his gear works: the bench press, the rollerblades, the running shoes, a jump and the loop — 2026-10-15 ══ */
        /* his: "Let's do bench press and rollerblade functions now. pressing nothing lowers the bar, holding L and R
           triggers raises it. And hitting A repeatedly helps you get the last rep when character is failing to raise it
           high enough. Put little explainer text during the lift." Then: "Skating should cost as much as running,
           energy-wise. A set should burn energy too of course, weightlifting, and should have diminishing returns after
           3 sets a day, and should add to a health meter that starts in the middle. … Add a rack for the bar to rest
           on. A rep counts if it's lowered at least 75% of the way, but full gain comes from full range-of-motion. If
           fail, the weights end up all over the floor. It should all cost energy; extra energy if fail. Failure should
           come sooner after 3 sets." And: "the turns are too rounded and the top speed is significantly too high.
           let's activate the running shoes as well. No dog. Just you. We'll add a walking/running/skating trail to
           use. We'll be able to jump using skates, shoes, or default as well" (his picks: the loop round the park
           lawn, B jumps, in the running shoes he always runs). */
        {
          const lfC = code(rd('lift.gd')), hmC = code(rd('home.gd')), pmC = code(rd('player_model.gd')), plC = code(rd('player.gd'));
          const pdC = code(rd('pad.gd')), dgC = code(rd('dog.gd')), gsC = code(rd('game_state.gd')), twC = code(rd('town.gd'));
          const tpC = code(rd('touch_pad.gd')), znC2 = code(rd('zone.gd'));
          const numL = (name) => dial(name, (x) => +(new RegExp('const ' + x + ' := ([\\d.]+)').exec(lfC) || [])[1]);
          const numPl = (name) => dial(name, (x) => +(new RegExp('const ' + x + ' := ([\\d.]+)').exec(plC) || [])[1]);
          const lift = fnGd(lfC, '_lift'), press = fnGd(lfC, '_press'), rep = fnGd(lfC, '_rep');
          /* ── the bench ── */
          ok(/class BenchPress extends Interactable:/.test(hmC) && /var bench := BenchPress\.new\(\)\s*bench\.rack = rack\s*bench\.position = where\("Rack", RACK_AT\)/.test(hmC)
             && /var lift := LiftView\.new\(\)[\s\S]{0,200}p\.visible = false\s*lift\.closed\.connect\(func\(_reps: int, failed: bool\) -> void:\s*if is_instance_valid\(p\):\s*p\.visible = true\s*if failed:\s*NateHome\.spilled = true/.test(hmC)
             && /if GameState\.body\.energy < Tuning\.now\(\)\.lift_rep_cost:\s*say\(/.test(hmC),
            '⭐ A at the rack in his home lies him down on the bench  (he stands back up when the set is over; an empty bar is too tired to lift)');
          ok(/var v: float = clampf\(up, -tune\.lift_lower, 1\.0\) if _push else -tune\.lift_lower/.test(press)
             && /return Pad\.squeezed\(\) or Input\.is_action_pressed\("ui_up"\) or _mouse or _touches > 0/.test(fnGd(lfC, '_pushing'))
             && /var trig := Input\.get_joy_axis\(_device, JOY_AXIS_TRIGGER_LEFT\) > 0\.5 and Input\.get_joy_axis\(_device, JOY_AXIS_TRIGGER_RIGHT\) > 0\.5/.test(fnGd(pdC, 'squeezed'))
             && /return trig or held/.test(fnGd(pdC, 'squeezed')),
            '⭐ pressing nothing lowers the bar, and both triggers held press it up  (both shoulders as well: he called them L and R)');
          /* ⚠ HELD AT THE SLIDERS' ENDS: the weakest fresh press beats the heaviest load, so no pair he sets stops a push. */
          const fresh = numL('FORCE') * (1 - numL('DIP')), load = numL('LOAD');
          const heavy = tuneRange('lift_load'), weakest = (tuneRange('lift_force') || [NaN])[0] * (1 - numL('DIP'));
          ok(/_grit \+= tune\.lift_mash/.test(fnGd(lfC, '_mash')) && /_grit \*= exp\(-delta \/ GRIT_LIFE\)/.test(press)
             && !!heavy && weakest > heavy[1],
            '⭐ he tires a rep at a time until the triggers alone stall at the sticking point, and A mashed gets the last ones up  (the push from A fades by a share: at a flat rate it ran out between presses)',
            'the weakest fresh press ' + weakest.toFixed(2) + ' against the heaviest load ' + (heavy && heavy[1]) + '  (his: ' + fresh.toFixed(2) + ' against ' + load + ', ' + (fresh * (1 - 7 * numL('TIRE_REP'))).toFixed(2) + ' seven reps in)');
          ok(/if _h >= 0\.97 and _deep < 0\.97:\s*_rep\(\)/.test(press) && /if depth < tune\.lift_counts:/.test(rep)
             && /var part := 0\.5 \+ 0\.5 \* clampf\(\(depth - tune\.lift_counts\) \/ \(FULL - tune\.lift_counts\), 0\.0, 1\.0\)/.test(rep)
             && /_gain \+= tune\.lift_rep_gain \* part \* _worth/.test(rep) && numL('FULL') >= 0.9,
            '⭐ a rep counts lowered at least 75% of the way, and gains its whole worth only from his chest  (his)');
          ok(/GameState\.body\.burn\(tune\.lift_rep_cost\)/.test(rep) && /GameState\.body\.burn\(tune\.lift_fail_cost\)\s*_go\("fall"\)/.test(press)
             && /if GameState\.body\.energy <= 0:\s*_s = 0\.0/.test(rep),
            '⭐ every rep costs energy and a failed set costs more  (an empty bar has nothing left to press with)', 'a rep ' + numL('REP_COST') + ', a fall ' + numL('FAIL_COST') + ' more');
          ok(/_stuck = _stuck \+ delta if _push and up <= 0\.0 and _h < 0\.96 else 0\.0/.test(press)
             && /if _stuck >= tune\.lift_pinned or _rest >= tune\.lift_resting:/.test(press) && /if _lifted:\s*GameState\.body\.set_done\(_gain\)/.test(fnGd(lfC, '_end')),
            '   …a bar that will not move any more, wherever it stalled, is a failed set; any set off the rack is counted');
          ok(/return pow\(0\.5, float\(maxi\(0, sets_today\(\) - tune\.lift_full_sets \+ 1\)\)\)/.test(fnGd(gsC, 'set_worth')) && tune('lift_full_sets') >= 1
             && /var health := HEALTH_CAP \* 0\.5/.test(gsC) && /health = clampf\(health \+ gain, 0\.0, HEALTH_CAP\)/.test(fnGd(gsC, 'set_done'))
             && /"health": body\.health, "lift_day": body\.lift_day, "lift_sets": body\.lift_sets/.test(fnGd(gsC, 'save_state'))
             && !/"health"/.test(fnGd(gsC, 'push_to_site'))
             && /_s = maxf\(0\.4, 1\.0 - tune\.lift_late \* float\(late\)\)/.test(fnGd(lfC, '_ready')),
            '⭐ a set adds to his health, a meter that starts in the middle; after three a day each is worth half the last, and he fails sooner  (kept here, not on his account)');
          ok(/"Energy %d\/%d" \+ sep \+ "Health %d\/%d"/.test(fnGd(znC2, '_paint_hud')) && /GameState\.body\.health_changed\.connect/.test(znC2),
            '   …and the health is on the top row beside the energy');
          ok(/if _pushing\(\):\s*_go\("out"\)/.test(lift) && /if _h < 0\.9:\s*_note\("Press it up to rack it\."\)/.test(fnGd(lfC, 'rack'))
             && /var hook := _px\(_body\.bench_points\(1\.0, 1\.0\)\["near"\]\)/.test(fnGd(lfC, '_paint')),
            '⭐ the bar rests on a rack: lifted off it to start, and put back only from the top  (his: "Add a rack for the bar to rest on")');
          ok(/if loose:/.test(fnGd(lfC, '_paint')) && /var gone := 0\.5 \* S \* \(1\.0 - exp\(-tr \* 2\.2\)\)/.test(fnGd(lfC, '_rolled'))
             && /if NateHome\.spilled:/.test(fnGd(hmC.slice(hmC.indexOf('class Rack')), '_draw')) && /static var spilled := false/.test(hmC)
             && /if NateHome\.spilled:\s*NateHome\.spilled = false/.test(hmC),
            '⭐ a failed set puts the plates all over the floor, up close and in his room, until he picks them up');
          const say = fnGd(lfC, '_say');
          ok(/cap \+ " is failing\. " \+ \("Mash A!"/.test(say) && /"Pressing nothing lowers the bar\."/.test(say) && /" to lift it off the rack\."/.test(say)
             && /"Lower it further for a rep\."/.test(rep) && /"Rep %d, but not all the way down\."/.test(rep) && /The plates are all over the floor\./.test(say),
            '⭐ little words during the lift say what to press and when, in the hand he is holding');
          ok(/if not \(event is InputEventKey or event is InputEventJoypadButton\):\s*return\s*get_viewport\(\)\.set_input_as_handled\(\)/.test(fnGd(lfC, '_input'))
             && /add_to_group\("town_cover"\)/.test(fnGd(lfC, '_ready')),
            '⛑ the lift owns every button and key while it is up  (the Journal opens on the top button whatever covers the room)');
          ok(/mb\.button_index == MOUSE_BUTTON_LEFT and mb\.device != InputEvent\.DEVICE_ID_EMULATION/.test(fnGd(lfC, '_input')),
            '⛑ …and a finger counts once  (Godot copies every touch into a click, and the copy was a second mash per tap)');
          ok(/_body = TownPlayerModel\.make\(PX, 0\.0, GameState\.character\)/.test(lfC) && /var ik := TwoBoneIK3D\.new\(\)/.test(fnGd(pmC, 'lie_back'))
             && /\["Upper_Arm\.L", "Lower_Arm\.L", "Hand\.L"\]/.test(pmC) && /\["UpperLeg\.R", "LowerLeg\.R", "Foot\.R"\]/.test(pmC),
            '⭐ it is HIM on the bench (or her: whoever you play), side on, hands on the bar and feet on the floor by IK  (a level camera, so the bar\'s two plates are one)');
          /* ── what is on his feet ── */
          ok(/class GearSpot extends Interactable:/.test(hmC) && /GameState\.body\.gear = "" if GameState\.body\.gear == kind else kind/.test(hmC)
             && /\[shoes, where\("Shoes", SHOES_AT\), "runners"\], \[blades, where\("Blades", BLADES_AT\), "skates"\]/.test(hmC)
             && /const GEAR_NAMES := \{"skates": "rollerblades", "runners": "running shoes"\}/.test(gsC)
             && /if GameState\.body\.gear == "skates":\s*return/.test(fnGd(hmC.slice(hmC.indexOf('class Blades')), '_draw'))
             && /if GameState\.body\.gear == "runners":\s*return/.test(fnGd(hmC.slice(hmC.indexOf('class Shoes')), '_draw')),
            '⭐ A at the rollerblades or the running shoes by his door puts that pair on, the other off  (a pair is gone from the floor while he wears it)');
          /* his (2026-10-24): "Both should have an option to take them off anywhere by hitting a button" */
          ok(/signal gear_changed\(now: String\)/.test(gsC) && /var gear := "":\s*set\(v\):\s*if v == gear:\s*return\s*gear = v\s*gear_changed\.emit\(v\)/.test(gsC)
             && /GameState\.body\.gear_changed\.connect\(func\(_now: String\) -> void: _words\(\)\)/.test(fnGd(hmC.slice(hmC.indexOf('class GearSpot')), '_ready_extra'))
             && /GameState\.body\.gear_changed\.connect\(func\(_now: String\) -> void: _gear_changed\(\)\)/.test(znC2)
             && /refresh_keys\(\)/.test(fnGd(znC2, '_gear_changed')) && /_gear_words\(\)/.test(fnGd(znC2, '_gear_changed')),
            '⛑ …and every write to his feet says so: the words at both pairs, the bottom line ("click it to run" is a lie in either) and the Take Off button follow it, from his door or anywhere');
          const gearW = fnGd(znC2, '_gear_words'), offW = fnGd(znC2, 'take_off_gear');
          ok(/_gear_off = corner_button\(take_off_gear\)/.test(znC2) && /const GEAR_KEY := KEY_T/.test(znC2)
             && /set_corner\(_gear_off, "Take Off " \+ named\.capitalize\(\) \+ key, g != "" and player != null and player\.afoot\(\)\)/.test(gearW)
             && /key = "  \(%s\)" % Pad\.word\(Pad\.R\)/.test(gearW) && /key = "  \(T\)"/.test(gearW)
             && /if was == "" or not _gear_off\.visible/.test(offW) && /GameState\.body\.gear = ""/.test(offW)
             && /if \(Pad\.hit\(event, Pad\.R\) or \(k != null and k\.pressed and not k\.echo and k\.keycode == TownZone\.GEAR_KEY\)\) \\\s*and z != null and GameState\.body\.gear != "" and afoot\(\) and not _in_talk\(\):\s*get_viewport\(\)\.set_input_as_handled\(\)\s*z\.take_off_gear\(\)/.test(fnGd(plC, '_unhandled_input')),
            '⭐ …and either pair comes off anywhere he walks  (his): a button under the top row says which, and how (T on keys, the right shoulder on a pad); never in space, a boat or a fight');
          const cornW = fnGd(znC2, '_place_corners');
          ok(/y = _stat\.position\.y \+ _stat\.get_minimum_size\(\)\.y/.test(cornW) && /y = maxf\(y, _rate\.position\.y \+ _rate\.size\.y\)/.test(cornW)
             && /b\.custom_minimum_size = Vector2\(0\.0, TownUI\.finger\(self\)\)/.test(cornW) && /b\.offset_top = y/.test(cornW) && !/position = /.test(cornW)
             && /for b in _corners:\s*if b\.visible and r\.intersects\(b\.get_global_rect\(\)\):\s*return true/.test(fnGd(znC2, 'hud_over')),
            '⛑ …the buttons under the top row sit under the stat row AND the rating (on a phone the rating is the third line), a thumb tall, anchored by offsets, and no sign draws under one');
          /* ⚠ TIRED IS A SHARE OF HIS TOP SPEED (2026-10-23, his: "the rollerblading should be a lot slower"): as a flat
             1.0 the slider had to start above the walk, or tired skating outran fresh. */
          const tiredShare = numPl('SKATE_TIRED');
          ok(/head = head\.rotated\(clampf\(head\.angle_to\(aim\), -tune\.skate_turn \* _delta, tune\.skate_turn \* _delta\)\)/.test(plC)
             && /var want := speed \* top \* push/.test(plC) && /velocity = head \* move_toward\(spd, want, rate\)/.test(plC)
             && /var top := \(tune\.skate_top if GameState\.body\.tire\(_delta\) else tune\.skate_top \* SKATE_TIRED\) \* drag/.test(plC)
             && tiredShare > 0 && tiredShare < 1
             && /return GameState\.body\.gear == "skates" and roams_here\(\)/.test(fnGd(plC, 'skating'))
             && !!tuneRange('skate_top') && tuneRange('skate_top')[0] > 0 && tuneRange('skate_top')[1] <= 1.5 && !!tuneRange('skate_turn') && tuneRange('skate_turn')[0] >= 6,
            '⭐ on rollerblades he glides and turns tight, no faster than he ought, tired slower than fresh at any slider, and a push costs what running does  (his: "the turns are too rounded and the top speed is significantly too high")',
            'its sliders: ' + (tuneRange('skate_top') || []).join(' to ') + '× the walk (tired, ' + tiredShare + ' of it), turning ' + (tuneRange('skate_turn') || []).join(' to ') + ' radians a second  (his: ' + numPl('SKATE_TOP') + ', ' + numPl('SKATE_TURN') + ')');
          ok(/if runners and dir\.length_squared\(\) > 0\.001:\s*run = tune\.run_share if GameState\.body\.tire\(_delta\) else 1\.0/.test(plC)
             && /return GameState\.body\.gear == "runners" and roams_here\(\)/.test(fnGd(plC, 'in_runners')),
            '⭐ in his running shoes every step is a run, at a run\'s cost  (his pick)');
          ok(/var att := BoneAttachment3D\.new\(\)\s*att\.bone_name = "Foot\." \+ side/.test(fnGd(pmC, '_build_gear'))
             && /var pair := _skate_parts\(\) if kind == "skates" else _shoe_parts\(\)/.test(fnGd(pmC, '_build_gear'))
             && /var ground := _floor \+ _skate_lift/.test(fnGd(pmC, 'advance')) && !/"gear"/.test(fnGd(gsC, 'save_state')),
            '   …the pair is on his feet, and a new day wakes him in his own shoes');
          /* ── a jump ── */
          ok(/if \(\(jb != null and jb\.pressed and event\.is_action_pressed\("ui_cancel"\)\) or \(k != null and k\.pressed and not k\.echo and k\.keycode == KEY_SHIFT\)\) and can_jump\(\):\s*get_viewport\(\)\.set_input_as_handled\(\)\s*jump\(\)/.test(fnGd(plC, '_unhandled_input'))
             && /if can_jump\(\):\s*_jump = 0\.0/.test(fnGd(plC, 'jump')) && /return 4\.0 \* tune\.jump_high \* u \* \(1\.0 - u\)/.test(fnGd(plC, 'hop'))
             && /_model\.draw_on\(self, Vector2\(0\.0, FEET\), 0\.0 if floating else radius \* 1\.25, _shrink, hop\(\) \+ air\)/.test(plC)
             && /if pad != null and pad\.take_jump\(\):\s*jump\(\)/.test(plC) && /var jt := "JUMP"/.test(tpC),
            '⭐ B jumps, in any shoes or none  (Shift on keys, JUMP on the glass; his: "We\'ll be able to jump using skates, shoes, or default as well")');
          ok(/return afoot\(\) and _jump < 0\.0 and not _in_talk\(\) and _warp < 0\.0 and not aloft\(\) and not \(_model != null and _model\.waving\(\)\)/.test(fnGd(plC, 'can_jump'))
             && /return roams_here\(\)/.test(fnGd(plC, 'afoot'))
             && /var p := get_parent\(\) as TownPlayer\s*return p != null and p\.afoot\(\)/.test(fnGd(tpC, '_jumps'))
             && /if _jumps\(\) and t\.position\.distance_to\(_jump_at\(\)\) <= R_JUMP \* 1\.35 \* k\(\):/.test(tpC)
             && /and \(not _jumps\(\) or t\.position\.distance_to\(_jump_at\(\)\) > R_JUMP \* 1\.8 \* k\(\)\)/.test(tpC)
             && /if not _jumps\(\):\s*return\s*var jb := _jump_at\(\)/.test(fnGd(tpC, '_paint')),
            '⛑ …but only where he walks about: no jump in a fight or under a cover, and no JUMP on the glass there  (Shift + a direction is Pawn Crossing\'s "all the way"; JUMP sat on its board; photo mode never got its B)');
          ok(/class Rowing extends TownPlayer:[\s\S]*?func afoot\(\) -> bool:\s*return false/.test(code(rd('sea.gd'))),
            '⛑ …and the boat has no legs: at sea the line offers no run and no jump, and B is left alone  (the boat is a TownPlayer too)');
          /* ── the loop is off the park, a road instead — his, 2026-10-26: "take the outline trail off of park tables and
             instead include just a road" ── */
          const roadsT = [...fnGd(twC, '_roads').matchAll(/Rect2\((-?[\d.]+), (-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\)/g)].map((m) => m.slice(1).map(Number));
          const westRoad = roadsT.find((r) => r[0] + r[2] <= -260 && r[1] <= -430 && r[1] + r[3] >= -20);
          const topRoad = roadsT.find((r) => r[1] + r[3] <= -430 && r[0] <= -260 && r[0] + r[2] >= -120);
          ok(!/const LOOP :=|loop_points/.test(twC) && /if pr\.intersects\(FOREST\):\s*_draw_trail\(pr\)/.test(fnGd(twC, '_draw')) && !!westRoad && !!topRoad,
            '⭐ no trail round the park any more, just a road  (his): up the lawn\'s west side from the main road and along its top to the woods\' trail',
            westRoad && topRoad ? 'west ' + westRoad.join(',') + ' · top ' + topRoad.join(',') : 'no such road');
          /* ── no dog ── */
          ok(!/static var pack/.test(dgC) && !/TownDog\.gather/.test(twC) && /func yields\(\) -> bool:\s*return _follow\s/.test(dgC),
            '⛑ no dog skates with him  (his: "No dog. Just you.")');
        }

        /* ══ a lamp by the bed, a cushion that sends him to space, and the White Knight — 2026-10-16 ══ */
        /* his: "add a spot for meditating - blasts you off into space and you can travel in any direction.  Pitch
           black with random things like chess pieces.  Add a nightstand and a lamp … Add a white knight character -
           annoying, shows up on a horse - tries to intervene where he is unwelcome." */
        {
          const hmC = code(rd('home.gd')), plC = code(rd('player.gd')), spC = code(rd('space.gd')), knC = code(rd('knight.gd'));
          const uiC = code(rd('town_ui.gd')), twC = code(rd('town.gd')), ppC = code(rd('people_sheet.gd'));
          const cls = clsGd;
          const v2 =(src, name) => { const h = layoutAt(src, name); return h ? [h.x, h.y] : (new RegExp('const ' + name + ' := Vector2\\(([-\\d.]+), ([-\\d.]+)\\)').exec(src) || [0, NaN, NaN]).slice(1, 3).map(Number); };
          /* ── the nightstand and the lamp ── */
          const ns = cls(hmC, 'Nightstand'), stand = v2(hmC, 'STAND_AT'), bed = v2(hmC, 'BED_AT'), dogBed = v2(hmC, 'DOG_BED_AT');
          ok(/_pool = _light\(CheckerRoom\.Daylight\.SCENERY, GLOW\)\s*_touch = _light\(CheckerRoom\.Daylight\.LIVING, GLOW \* CheckerRoom\.Daylight\.TOUCH\)/.test(ns)
             && /l\.range_item_cull_mask = mask/.test(ns) && /_pool\.enabled = lit\s*_touch\.enabled = lit/.test(ns)
             && /func interact\(_player: Node\) -> void:\s*lit = not lit\s*_words\(\)/.test(ns)
             && /relabel\("Turn off the lamp" if lit else "Turn on the lamp"\)/.test(ns)
             && /var stand := Nightstand\.new\(\)\s*stand\.position = where\("Nightstand", STAND_AT\)[\s\S]*?_solid\(stand, Rect2\(-18\.0, -12\.0, 36\.0, 24\.0\)\)/.test(hmC)
             && stand[0] - 18 > bed[0] + 34 && stand[0] + 18 < dogBed[0] - 40,
            '⭐ a nightstand and a lamp by the bed  (his); A switches it, and its light is ADDED: the furniture takes it, the living a third, off is off',
            'the stand ' + (stand[0] - 18) + ' to ' + (stand[0] + 18) + ', the bed to ' + (bed[0] + 34) + ', Princess\'s cushion from ' + (dogBed[0] - 40));
          /* ── the cushion ── */
          const ms = cls(hmC, 'MeditateSpot'), cush = v2(hmC, 'CUSHION_AT'), fridge = v2(hmC, 'FRIDGE_AT'), rug = v2(hmC, 'RUG_AT');
          const rugW = +(/const RUG_W := ([\d.]+)/.exec(hmC) || [])[1], board = v2(hmC, 'BOARD_AT'), rack = v2(hmC, 'RACK_AT');
          ok(/relabel\("Meditate"\)/.test(ms) && /GameState\.reentry\[here\.scene_file_path\] = global_position/.test(ms)
             && /you\.launch\(\)\s*await you\.launched/.test(ms) && /change_scene_to_file\(OuterSpace\.SCENE\)/.test(ms) && /TownFade\.cross\(self, go\)/.test(ms)
             && /var seat := MeditateSpot\.new\(\)\s*seat\.position = where\("Cushion", CUSHION_AT\)/.test(hmC)
             && cush[0] - 30 > rug[0] + rugW / 2 && cush[0] + 30 < fridge[0] - 30 && cush[1] + 13 < rack[1] - 28 && cush[1] - 13 > board[1] + 16 * 1.8,
            '⭐ a spot to meditate  (his), on the open floor between the rug, the fridge, the rack and Princess\'s board: A sends him up and off to space',
            'the mat ' + (cush[0] - 30) + ' to ' + (cush[0] + 30) + ' across, ' + (cush[1] - 13) + ' to ' + (cush[1] + 13) + ' down');
          /* ── up, and back down ── */
          ok(/_lift = 0\.0/.test(fnGd(plC, 'launch')) && /return _lift >= 0\.0 or _drop >= 0\.0/.test(fnGd(plC, 'aloft'))
             && /if _warp >= 0\.0 or aloft\(\) or _in_talk\(\):\s*return/.test(fnGd(plC, '_process'))
             && /if was < HOVER_SECS \+ BLAST_SECS and _lift >= HOVER_SECS \+ BLAST_SECS:\s*launched\.emit\(\)/.test(plC)
             && /if _lift >= HOVER_SECS:\s*_streak\(air\)/.test(fnGd(plC, '_draw')),
            '⭐ he floats up off it, then blasts off out of the window, a streak to the floor; nothing moves him or answers a key meanwhile');
          ok(/elif _lift >= HOVER_SECS \+ BLAST_SECS \+ STRANDED_SECS:\s*_lift = -1\.0\s*_drop = 0\.0/.test(plC),
            '⛑ …and a lift-off that never changes the scene comes back down  (or he hangs out of sight, unable to move)');
          ok(/TownPlayer\.dropping = true/.test(fnGd(spC, 'come_back')) && /const BACK_TO := "res:\/\/rooms\/home\.tscn"/.test(spC)
             && /if dropping:\s*dropping = false\s*_drop = 0\.0/.test(fnGd(plC, '_ready'))
             && /var d := 1\.0 - minf\(_drop \/ DROP_SECS, 1\.0\)\s*return BLAST_HIGH \* d \* d/.test(fnGd(plC, '_air')),
            '⭐ …and back from space he comes down out of the sky onto the cushion, slowing as he lands');
          /* ── space ── */
          const thingsF = fnGd(spC, 'things');
          ok(/draw_rect\(OuterSpace\.view\(self\)\.grow\(64\.0\), Color\.BLACK\)/.test(fnGd(spC, '_draw'))
             && /world_bounds = Rect2\(\)\s*camera_bounds = Rect2\(\)/.test(spC) && /PieceArt\.draw_piece\(self, thing\["kind"\], Vector2\.ZERO, size/.test(fnGd(cls(spC, 'Bit'), '_draw'))
             && /"c", "c", "c", "C"\]/.test(spC) && (spC.match(/\[[\d.]+, [\d.]+, \d, [\d.]+\]/g) || []).length === 3,
            '⭐ space is pitch black with no edge, full of his pieces (his renders where there are any) and checkers, at three depths');
          ok(/rng\.seed = \(\(cx \* 73856093\) \^ \(cy \* 19349663\) \^ \(\(salt \+ 1\) \* 83492791\)\) & 0x7fffffff/.test(thingsF)
             && !/randomize\(|hash\(|(?<!rng\.)rand[fi]/.test(thingsF) && !/\bTime\./.test(thingsF),
            '⛑ …and what floats where is worked out from WHERE: any direction goes on for ever, and a place flown back to holds what it held  (my own arithmetic, not hash())');
          const fl = cls(spC, 'Floater');
          const flyN = (n) => +(new RegExp('const ' + n + ' := ([\\d.]+)').exec(fl) || [])[1];
          ok(/func afoot\(\) -> bool:\s*return false/.test(fl) && /floating = true/.test(fl) && flyN('DRIFT') < flyN('PUSH') / 3
             && /want = dir\.limit_length\(1\.0\) \* speed \* FLY/.test(fl) && /return Floater\.new\(\)/.test(fnGd(spC, '_make_player')),
            '⭐ he flies any way the stick points, and with nothing pressed drifts a long way before he stops: no legs, no shadow, no jump',
            'drift ' + flyN('DRIFT') + ' against a push of ' + flyN('PUSH'));
          const spLine = fnGd(spC, '_line');
          ok(/event\.is_action_pressed\("ui_accept"\) or event\.is_action_pressed\("ui_cancel"\)/.test(fnGd(spC, '_unhandled_input'))
             && /if pad != null and pad\.take_accept\(\):\s*come_back\(\)/.test(fnGd(spC, '_process'))
             && /return "WASD  ·  Arrows  ·  Spacebar takes you home"/.test(spLine) && /Pad\.changed\.connect\(_reline\)/.test(spC)
             && /\[node name="OuterSpace" type="Node2D"\]\s*script = ExtResource\("1"\)/.test(rd('space.tscn')),
            '⭐ …and A or B (Spacebar on keys, USE on the glass) brings him back down; the bottom line names the hand he is holding, the keys only his four');
          /* his (2026-10-24): "it needs to be clearer that spacebar or whatever the back button is will get you back home from the meditation space" */
          const homeW = fnGd(spC, '_home_words');
          ok(/_home = corner_button\(come_back\)/.test(fnGd(spC, '_after_ready')) && /set_corner\(_home, _home_words\(\)\)/.test(fnGd(spC, '_reline'))
             && /return "Back Home  \(A or B\)"/.test(homeW) && /return "Back Home  \(Spacebar\)"/.test(homeW) && /return "Back Home"\n/.test(homeW),
            '⭐ …and a Back Home button stays up the whole visit, naming the key on the hand he holds  (the bottom line goes after its seconds)');
          /* the lag (his, 2026-10-24: "I found it very laggy on PC: the space scene"): every thing redrawn every frame was
             9 ms of an 11 ms frame; drawn once and moved by its transform the scene is under 3 ms, cheaper than his checker */
          const depW = cls(spC, 'Depth'), bitsW = ['Bit', 'Checker', 'Jelly'].map((n) => cls(spC, n)).join('\n');
          ok(/process_priority = 1/.test(depW) && /position = seen\.get_center\(\) \* \(1\.0 - f\)/.test(depW) && /var b := OuterSpace\.bit\(thing, grow\)/.test(fnGd(depW, '_fill'))
             && /b\.move\(t\)/.test(depW) && bitsW.split('\n').length > 30 && !/queue_redraw\(/.test(depW + bitsW)
             && !/layer\.queue_redraw\(\)/.test(fnGd(spC, '_process')),
            '⛑ …and nothing in space is redrawn: each thing is its own node, drawn once as it comes into view and only turned or carried after, its depth placed after the camera moves');
          /* ── the White Knight ── */
          ok(/class_name WhiteKnight\s*extends Interactable/.test(knC) && /add_child\(WhiteKnight\.new\(\)\)/.test(fnGd(twC, '_after_ready'))
             && /var with := u\.talking_with\(\)[\s\S]*?_was_with = with if with is TownNPC else null/.test(fnGd(knC, '_watch'))
             && /func talking_with\(\) -> Node2D:\s*return _from if _mode == TALK else null/.test(uiC),
            '⭐ the White Knight  (his): a conversation with somebody ends, or a game comes back, and he gallops up to rescue you from it');
          ok(!/StaticBody2D|_solid\(/.test(knC) && /if _pending != "" and _quiet\(\):/.test(knC) && /func quiet\(\) -> bool:\s*return _mode == IDLE/.test(uiC)
             && /static var _last_us/.test(knC) && tune('knight_again_secs') >= 60
             && /if slot == -4 or who == "":\s*return/.test(fnGd(knC, '_on_result')) && /return p\.clamp\(b\.position, b\.end\)/.test(fnGd(knC, '_inside')),
            '⛑ …and never in the way: not solid, says his piece only when the box is quiet, rare, never over a study, and inside the window\'s walls');
          ok(/var side := -signf\(near\.x - you\.global_position\.x\)[\s\S]*?_to = _inside\(you\.global_position \+ Vector2\(side \* 105\.0, 24\.0\)\)/.test(fnGd(knC, '_come'))
             && /TownPeople\.dress\(self, WhiteKnight\.WHO, ""\)/.test(cls(knC, 'Rider')) && /"White Knight": "eef0f4"/.test(ppC),
            '⭐ …he stops right beside you on your other side from them, a white rider on a white horse  (halfway between you he stood on you both)');
        }

        /* ══ who you play, the dogs' boards, space thinned out and jellyfish — 2026-10-23 ══ */
        /* his: "the dog boards cover too much area in the checker house - let's make that smaller so it's less in-your-face.
           The meditation is cool but let's cut the amount of pieces in half.  Too many floating things.  But then let's add
           some jellyfish.  Let's make a select a character mode that occurs at the beginning of the game but is also an
           option mid-game to switch between characters.  Make a new character named Natalie.  When you play as Natalie, the
           white knight acts as he does now.  When you play as Nate, he does his thing a tiny bit but mostly just comes around
           to bro down.  Keep it extremely subtle but still noticeable" */
        {
          const pmW = code(rd('player_model.gd')), plW = code(rd('player.gd')), csW = code(rd('character_select.gd'));
          const gsW = code(rd('game_state.gd')), znW = code(rd('zone.gd')), jrW = code(rd('journal.gd'));
          const knW = code(rd('knight.gd')), spW = code(rd('space.gd')), ppW = code(rd('people_sheet.gd'));
          /* ── two people to play ── */
          const playable = [...((/const PLAYABLE := \{([^}]*)\}/.exec(pmW) || [0, ''])[1]).matchAll(/"(\w+)": "([^"]+)"/g)].map((m) => m[1]);
          const makeF = fnGd(pmW, 'make');
          ok(playable.includes('nate') && playable.includes('natalie')
             && /static func make\(px: int = 0, tilt: float = TILT, who: String = "nate"\) -> TownPlayerModel:/.test(pmW)
             && /var own := "res:\/\/art\/%s\.glb" % who\s*\n\s*var path := own if ResourceLoader\.exists\(own\) else MODEL_PATH/.test(makeF)
             && /if path == MODEL_PATH and LOOKS\.has\(who\):\s*\n\s*vp\._dress\(LOOKS\[who\]\)/.test(makeF)
             && /"natalie": \{/.test((/const LOOKS := \{([\s\S]*?)\n\}/.exec(pmW) || [0, ''])[1]),
            '⭐ Nate and Natalie to play  (his): art/<who>.glb is that person once it exists, until then nate.glb repainted',
            playable.join(' · ') || 'none');
          ok(/TownPlayerModel\.make\(CELL\)/.test(ppW) && !/GameState\.character/.test(ppW),
            '⚠ …and the townsfolk are never her: their one rig is baked off nate.glb as it ships',
            'make() builds "nate" unless it is told otherwise, and people_sheet.gd never tells it');
          const dressF = fnGd(pmW, '_dress'), hairF = fnGd(pmW, '_build_hair');
          ok(/mi\.mesh = _without_cap\(mi\.mesh\)/.test(dressF) && /src\.duplicate\(\) as StandardMaterial3D/.test(dressF)
             && /mi\.set_surface_override_material\(i, m\)/.test(dressF)
             && /if mat != null and mat\.resource_name == "eye":/.test(fnGd(pmW, '_without_cap'))
             && /if _top\(up, t\) != big:/.test(fnGd(pmW, '_drop_biggest'))
             && /att\.bone_name = "Head"/.test(hairF) && !/global_transform/.test(hairF + fnGd(pmW, '_in_pivot')),
            '⭐ …Natalie is his rig with the cap off and long hair held to the head bone, her paint on a copy  (the GLB\'s mesh and paint are everybody\'s)',
            '⚠ the cap and the eyes are one paint: the cap is its biggest piece, the eyes the two little ones');
          /* ── two more, 2026-10-25 ── his: "let's make two more characters:  one more boy and one more girl - call them
             Habsa and Munawar."  Asked which is which: "Habsa girl, Munawar boy" */
          const looksW = (/const LOOKS := \{([\s\S]*?)\n\}/.exec(pmW) || [0, ''])[1];
          const cutsW = (/const CUTS := \{([\s\S]*?)\n\}/.exec(pmW) || [0, ''])[1];
          const dressed = playable.filter((w) => w !== 'nate' && !fs.existsSync(path.join(GD, 'art', w + '.glb'))).map((w) => {
            const cut = (new RegExp('"' + w + '": \\{[^}]*"cut": "(\\w+)"').exec(looksW) || [])[1];
            return [w, cut && new RegExp('"' + cut + '": \\[').test(cutsW) ? cut : ''];
          });
          /* his, 2026-10-26: "add four more characters.  A japanese boy, japanese girl, a black girl, black boy.   Shohei, Hana,
             Jameis, and Emery."  Asked which is which: "Emery girl, Jameis boy" */
          ok(['nate', 'natalie', 'habsa', 'munawar', 'shohei', 'hana', 'jameis', 'emery'].every((w) => playable.includes(w)) && dressed.every(([, c]) => c)
             && /var cut: Array = CUTS\.get\(str\(look\.get\("cut", ""\)\), \[\]\)/.test(dressF) && /_build_hair\(cut, /.test(dressF),
            '⭐ eight to play: Nate, Natalie, Habsa, Munawar, Shohei, Hana, Jameis and Emery  (his); everyone without a .glb of their own wears a look and a haircut, or they are Nate, cap and all',
            dressed.map(([w, c]) => w + ' ' + (c || 'NO CUT')).join(' · '));
          /* his, 2026-10-26: "Natalie still gets called a "he" so let's correct that for the two female characters (i.e. when the
             weightlifting plates drop" */
          const pron = Object.fromEntries([...((/const PRONOUN := \{([^}]*)\}/.exec(pmW) || [0, ''])[1]).matchAll(/"(\w+)": "(\w+)"/g)].map((m) => [m[1], m[2]]));
          const sayL = fnGd(code(rd('lift.gd')), '_say');
          ok(playable.length > 0 && playable.every((w) => pron[w] === 'he' || pron[w] === 'she') && pron.natalie === 'she' && pron.habsa === 'she' && pron.hana === 'she' && pron.emery === 'she'
             && pron.shohei === 'he' && pron.jameis === 'he'
             && /var he: String = TownPlayerModel\.PRONOUN\.get\(GameState\.character, "he"\)/.test(sayL) && !/"He |"he |\bhe tires/.test(sayL),
            '⭐ the bench press says she for Natalie, Habsa, Hana and Emery  (his): everyone you can play has a he or a she, and no line of the lift types one',
            playable.map((w) => w + ' ' + (pron[w] || 'NONE')).join(' · '));
          /* his, 2026-10-26: "Let's make Habsa and Munawar a little darker skinned.  Let's put a hijab on Habsa." */
          const lin = (h) => [0, 2, 4].map((i) => { const c = parseInt(h.substr(i, 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
          const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
          let nateSkin = null;
          try {
            const glb = fs.readFileSync(path.join(GD, 'art', 'nate.glb')), jn = glb.readUInt32LE(12);
            const sk = (JSON.parse(glb.slice(20, 20 + jn).toString('utf8')).materials || []).find((m) => m.name === 'skin');
            nateSkin = sk ? sk.pbrMetallicRoughness.baseColorFactor.slice(0, 3) : null;
          } catch (e) { nateSkin = null; }
          const skinOf = (w) => (new RegExp('"' + w + '": \\{[^}]*"skin": "([0-9a-fA-F]{6})"').exec(looksW) || [])[1];
          const darker = ['habsa', 'munawar'].map((w) => [w, skinOf(w)]);
          ok(!!nateSkin && darker.every(([, s]) => s && lum(lin(s)) < lum(nateSkin))
             && /"habsa": \{[^}]*"cut": "hijab", "hijab": "[0-9a-fA-F]{6}"/.test(looksW) && /"hijab": \[/.test(cutsW)
             && /_build_hair\(cut, Color\(str\(look\.get\(str\(look\["cut"\]\), look\["hair"\]\)\)\)\)/.test(dressF),
            '⭐ Habsa wears a hijab, and she and Munawar are a little darker than Nate  (his; Nate\'s own skin read off nate.glb)',
            darker.map(([w, s]) => w + ' ' + (s || 'NO SKIN')).join(' · '));
          /* his, 2026-10-26: "let's default to having sound off during testing phase" */
          ok(/var sound_on: bool = false/.test(gsW) && /"sound": sound_on/.test(fnGd(gsW, 'save_state'))
             && /sound_on = bool\(d\.get\("sound", false\)\)/.test(fnGd(gsW, 'load_state')) && !/"sound_on"/.test(gsW)
             && /if now >= 0 and now != _program_sound:\s*\n\s*set_sound\(now == 1\)/.test(fnGd(gsW, '_follow_program_sound'))
             && /_follow_program_sound\(\)/.test(fnGd(gsW, '_tick')),
            '⭐ the game starts quiet while he tests  (his): kept under a new key so an older save is quiet too; in the desktop program its Sound row is the game\'s own switch, followed on a change only');
          /* ── the body on screen ── */
          ok(/_model = _make_model\(\)/.test(fnGd(plW, '_ready')) && /GameState\.character_changed\.connect\(_swap_model\.unbind\(1\)\)/.test(fnGd(plW, '_ready'))
             && /var m := TownPlayerModel\.make\(0, TownPlayerModel\.TILT, GameState\.character\)/.test(fnGd(plW, '_make_model'))
             && /if _model == null:\s*\n\s*return/.test(fnGd(plW, '_swap_model')),
            '⭐ the player wears whoever you play, and a change swaps the body where you stand  (not in the boat, which put its body away)');
          /* ── this device's ── */
          const pushW = gsW.slice(gsW.indexOf('func push_to_site'), gsW.indexOf('func pull_from_site'));
          ok(/"character": character/.test(fnGd(gsW, 'save_state'))
             && /character = str\(d\.get\("character", "nate"\)\)\s*\n\s*if not TownPlayerModel\.PLAYABLE\.has\(character\):\s*\n\s*character = "nate"/.test(fnGd(gsW, 'load_state'))
             && pushW.length > 0 && !/character/.test(pushW + fnGd(gsW, 'merge_in'))
             && /if who == character or not TownPlayerModel\.PLAYABLE\.has\(who\):\s*\n\s*return/.test(fnGd(gsW, 'set_character')),
            '⚠ who you play is this device\'s, like the mute: saved, checked on the way in, never pushed or merged');
          /* ── the cards ── */
          ok(/if not CharacterSelect\.asked and not is_fight\(\):\s*\n\s*CharacterSelect\.open\(self\)\.closed\.connect\(_story\)\s*\n\s*_story\(\)/.test(fnGd(znW, '_ready'))
             && /static var asked := false/.test(csW) && /asked = true/.test(fnGd(csW, '_ready')) && /add_to_group\("town_cover"\)/.test(fnGd(csW, '_ready')),
            '⭐ the cards come up at the start of the game  (his): once a session, at the first room that is not a fight, a cover the story waits under');
          const closeC = fnGd(csW, '_close');
          ok(closeC.indexOf('remove_from_group("town_cover")') >= 0 && closeC.indexOf('remove_from_group("town_cover")') < closeC.indexOf('closed.emit()')
             && /TownZone\.uncovered\(\)/.test(closeC),
            '⚠⚠ …out of the cover BEFORE they say they are shut: the story asks for a cover, and the cards are not freed yet',
            'otherwise the beat due as the cards close never plays');
          ok(/_who = _button\("Character", func\(\) -> void: _pick_character\(\)\)/.test(jrW)
             && /close\(\)\s*\n\s*CharacterSelect\.open\(get_tree\(\)\.current_scene\)/.test(fnGd(jrW, '_pick_character'))
             && /elif _open and Pad\.hit\(event, Pad\.LEFT\):\s*\n\s*_pick_character\(\)/.test(fnGd(jrW, '_unhandled_input')),
            '⭐ …and again mid-game  (his): the Journal\'s Character button, or a pad\'s left button while it is open');
          const inC = fnGd(csW, '_take');
          ok(/get_viewport\(\)\.set_input_as_handled\(\)/.test(inC) && /_light\(_at - 1\)/.test(inC) && /_light\(_at \+ 1\)/.test(inC)
             && /_take\(event\)/.test(fnGd(csW, '_unhandled_key_input')) && /_take\(event\)/.test(fnGd(csW, '_unhandled_input')) && !/func _input\(/.test(csW)
             && /_at = clampi\(i, 0, _ids\.size\(\) - 1\)/.test(fnGd(csW, '_light')) && /b\.pressed\.connect\(_choose\.bind\(i\)\)/.test(csW),
            '⚠ …every key and pad press stops at the cards (unhandled, so Pad still hears a pad picked up), a stick held over cannot wrap, a tap on a card plays it');
          const layC = fnGd(csW, '_layout');
          ok(/for c in range\(1, n \+ 1\):/.test(layC) && /_cols = c/.test(layC) && /var row := i \/ _cols/.test(layC)
             && /elif event\.is_action_pressed\("ui_up"\) and _at >= _cols:\s*\n\s*_light\(_at - _cols\)/.test(inC)
             && /elif event\.is_action_pressed\("ui_down"\) and _at \+ _cols < _ids\.size\(\):\s*\n\s*_light\(_at \+ _cols\)/.test(inC),
            '⚠ …and the cards wrap into rows on a tall window (four in a row on a phone are a thumb wide), up and down moving a row, never off the end');
          /* ── the White Knight's two moods ── */
          const comeK = fnGd(knW, '_come'), kw = words('White Knight'), nr = tuneRange('knight_nate_every');
          ok(/_bro = GameState\.character == "nate" and _visits % tune\.knight_nate_every != tune\.knight_nate_every - 1/.test(comeK)
             && /var pick := Lines\.list\(WHO, "bro" if _bro else kind\)/.test(comeK)
             && /Lines\.list\(WHO, "bro_thanks" if _bro else "thanks"\)/.test(fnGd(knW, 'interact'))
             && (kw.bro || []).length >= 1 && (kw.bro_thanks || []).length >= 1 && (kw.talk || []).length >= 1,
            '⭐ the White Knight rescues Natalie every time, and mostly just comes over to bro down with Nate  (his)',
            (kw.bro || []).length + ' [bro] lines, ' + (kw.bro_thanks || []).length + ' [bro_thanks]');
          ok(nr && nr[0] >= 3 && tune('knight_nate_every') >= nr[0],
            '⛑ …and "mostly" is the slider\'s own low end: his rescue is one visit in ' + (nr ? nr[0] : '?') + ' at the most, never half of them',
            'knight_nate_every ' + (nr ? nr.join('..') : 'missing'));
          ok(/var tip := _m\([^)]*\) if _bro else _m\([^)]*\)/.test(fnGd(knW, '_draw')),
            '⭐ …subtle and still noticeable: come to say hi, his lance rests back on his shoulder');
          /* ── space: half as many things, and jellyfish ── */
          const thingsW = fnGd(spW, 'things'), loopAt = thingsW.indexOf('for i in rng.randi_range(0, per):');
          ok(loopAt >= 0 && thingsW.indexOf('if rng.randf() < JELLY:') > loopAt && /"kind": "j"/.test(thingsW)
             && num(spW, 'JELLY') > 0 && num(spW, 'JELLY') < 1 && /"j":\s*b = Jelly\.new\(\)/.test(fnGd(spW, 'bit')),
            '⭐ space has jellyfish  (his), some cells and not all, rolled after the things in their cell so a jellyfish never moves a piece');
          /* ⚠ A SCALE THICKENS A LINE: the bell may squeeze on the beat; the tentacles hang straight in the picture and the
             shader bends them by ADDING to each vertex, so every one keeps its distance off its line. */
          const jellyW = clsGd(spW, 'Jelly'), bendW = (/const BEND := """([\s\S]*?)"""/.exec(spW) || [])[1] || '';
          const scales = [...jellyW.matchAll(/^\s*([\w.]*)scale\b[^=\n]*=/gm)].map((m) => m[1]);
          ok(/rotation = cos\(u \* 0\.5\) \* 0\.3/.test(jellyW) && scales.length === 2 && scales.every((w) => w === '_bell.' || w === '_rim.')
             && /_part\(_paint_legs\)\.material = _legs/.test(jellyW) && /_part\(_paint_arms\)\.material = _arms/.test(jellyW)
             && /VERTEX\.x \+=/.test(bendW) && !/VERTEX\.[xy]? ?\*=/.test(bendW) && /TownZone\.glow\(\)/.test(jellyW)
             && /func move\(t: float\) -> void:/.test(jellyW) && !/\bTime\.|rand/.test(jellyW + bendW),
            '⚠ …each one turned, never scaled but for its bell (a scale thickens its tentacles), glowing, and moved only by the clock it is handed',
            'scaled: ' + (scales.join(', ') || 'nothing'));
        }

        /* ══ the woods: a full trail off the loop, and what is under his wheels there — 2026-10-23 ══ */
        /* his: "the park trail just goes around the park tables - it's way too small - can you make a full trail that cuts
           to a new screen?  There are trees and sticks in the way and some gravel in spots, and in general the
           rollerblading should be a lot slower than it is now" */
        {
          const twW = code(rd('town.gd')), plW = code(rd('player.gd')), tbW = code(rd('trail_bit.gd'));
          const jrW = code(rd('journal.gd'));
          const V = (s) => [...s.matchAll(/Vector2\((-?[\d.]+), (-?[\d.]+)\)/g)].map((m) => [+m[1], +m[2]]);
          const block = (name) => (new RegExp('const ' + name + ' := \\[([\\s\\S]*?)\\n\\]').exec(twW) || [0, ''])[1];
          const T = V(block('TRAIL')), stem = V((/const TRAIL_STEM := \[([^\]]*)\]/.exec(twW) || [0, ''])[1]);
          const sticks = [...block('STICKS').matchAll(/\[Vector2\((-?[\d.]+), (-?[\d.]+)\), (-?[\d.]+), ([\d.]+)\]/g)].map((m) => ({ at: [+m[1], +m[2]], a: +m[3], len: +m[4] }));
          const gravel = [...block('GRAVEL').matchAll(/\[Vector2\((-?[\d.]+), (-?[\d.]+)\), (-?[\d.]+)\]/g)].map((m) => ({ at: [+m[1], +m[2]], a: +m[3] }));
          const trailW = +(/const TRAIL_W := ([\d.]+)/.exec(twW) || [])[1];
          /* trail_points(), redone: a closed Catmull-Rom curve through TRAIL, eight steps a span */
          const pts = [];
          for (let i = 0; i < T.length; i++) {
            const p0 = T[(i - 1 + T.length) % T.length], p1 = T[i], p2 = T[(i + 1) % T.length], p3 = T[(i + 2) % T.length];
            for (let s = 0; s < 8; s++) {
              const t = s / 8;
              pts.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t
                + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t * t * t)));
            }
          }
          if (pts.length) pts.push(pts[0]);
          const seg = (p, a, b) => { const ax = b[0] - a[0], ay = b[1] - a[1], L2 = ax * ax + ay * ay;
            const t = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * ax + (p[1] - a[1]) * ay) / L2)) : 0;
            return { d: Math.hypot(p[0] - a[0] - ax * t, p[1] - a[1] - ay * t), ang: Math.atan2(ay, ax) }; };
          const near = (p, line) => { let best = { d: Infinity, ang: 0 };
            for (let i = 0; i + 1 < line.length; i++) { const r = seg(p, line[i], line[i + 1]); if (r.d < best.d) best = r; } return best; };
          const turn = (a, b) => { const d = Math.abs(((a - b) % Math.PI + Math.PI) % Math.PI); return Math.min(d, Math.PI - d); };
          /* ── a window of its own, off the road ── */
          const wr = (/"woods":\s*\n\s*return Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(fnGd(twW, 'region_rect')) || []).slice(1).map(Number);
          const roadsLit = [...fnGd(twW, '_roads').matchAll(/Rect2\((-?[\d.]+), (-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\)/g)].map((m) => m.slice(1).map(Number));
          const onRoad = (p) => roadsLit.some((r) => p[0] >= Math.min(r[0], r[0] + r[2]) && p[0] <= Math.max(r[0], r[0] + r[2]) && p[1] >= Math.min(r[1], r[1] + r[3]) && p[1] <= Math.max(r[1], r[1] + r[3]));
          const sqSeam = /\{ "to": "woods", "at": Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(twW);
          const back = /"woods": \[\s*\n\s*\{ "to": "square", "at": Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(twW);
          ok(wr.length === 4 && /for r in \[[^\]]*"woods"[^\]]*\]:/.test(fnGd(twW, 'region_of')) && sqSeam && back && +sqSeam[1] === +back[1]
             && stem.length >= 2 && onRoad(stem[0]) && +stem[0][0] === +sqSeam[1] && stem[stem.length - 1][1] < wr[1] + wr[3] - trailW
             && T.length >= 8 && T[0][0] === stem[stem.length - 1][0] && T[0][1] === stem[stem.length - 1][1],
            '⭐ a full trail that cuts to a new screen  (his): it leaves the road along the park\'s top, goes through the fence and on round the woods, a window of its own',
            pts.length ? Math.round(pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)) + ' round' : 'no trail');
          const out = pts.filter((p) => !(p[0] > wr[0] + 47 && p[0] < wr[0] + wr[2] - 47 && p[1] > wr[1] + 47 && p[1] < wr[1] + wr[3] - 47));
          ok(pts.length > 50 && out.length === 0, '…and the whole of it is inside the woods, clear of its fence',
            out.length ? out.length + ' points off it: ' + out.slice(0, 2).join(' ') : pts.length + ' points');
          const fenced = [...((/const FENCED := \[([\s\S]*?)\n\]/.exec(twW) || [0, ''])[1]).matchAll(/Rect2\((-?[\d.]+), (-?[\d.]+), (-?[\d.]+), (-?[\d.]+)\)/g)].map((m) => m.slice(1).map(Number));
          const walls = fenced.filter((f) => wr.length && f[0] < wr[0] + wr[2] && wr[0] < f[0] + f[2] && f[1] < wr[1] + wr[3] && wr[1] < f[1] + f[3]);
          ok(walls.length === 0, '⚠ …and no fenced corner is left standing in it  (the north-west corner WAS the woods\' ground)', walls.join(' ') || 'none');
          /* ── what lies on it ── */
          const offS = sticks.filter((s) => { const r = near(s.at, pts); return r.d > 6 || turn(s.a, r.ang) < 0.9; });
          /* his, 2026-10-26: "take out the sticks in the park trail except for one.  Make the gravel even harder to roll
             through and teh same with grass and dirt." */
          ok(sticks.length === 1 && offS.length === 0 && sticks.every((s) => s.len > trailW),
            '⭐ one stick lies ACROSS the trail, longer than it is wide  (his "sticks in the way", then "except for one")',
            offS.length ? 'not across it: ' + offS.map((s) => s.at.join(',')).join(' ') : sticks.length + (sticks.length === 1 ? ' stick' : ' sticks'));
          const offG = gravel.filter((g) => { const r = near(g.at, pts); return r.d > 6 || turn(g.a, r.ang) > 0.5; });
          ok(gravel.length >= 3 && offG.length === 0, '⭐ …and gravel lies on it in spots, along it  (his)',
            offG.length ? 'not on it: ' + offG.map((g) => g.at.join(',')).join(' ') : gravel.length + ' patches');
          const tb = fnGd(twW, '_furnish_trees');
          /* ⚠ THE SECOND LIST: code() strips the comment that names it */
          const woods = V(tb.slice(tb.indexOf('for at in [', tb.indexOf('for at in [') + 1)));
          const inWay = woods.filter((p) => near(p, pts).d < trailW / 2);
          const close = woods.filter((p) => { const d = near(p, pts).d; return d >= trailW / 2 && d < trailW / 2 + 22; });
          ok(woods.length >= 40 && inWay.length === 3 && close.length === 0,
            '⭐ …and three trees stand IN the trail  (his "trees in the way"); every other trunk keeps well off it',
            woods.length + ' trees in the woods, ' + inWay.length + ' in the trail' + (close.length ? ', crowding it: ' + close.join(' ') : ''));
          /* ── what they do to his wheels ── */
          const phys = fnGd(plW, '_physics_process');
          ok(/if skate and rolling and _jump < 0\.0 and _stumble <= 0\.0 and _trips\(was\):\s*\n\s*_trip\(\)/.test(phys)
             && /func _trip\(\) -> void:\s*\n\s*velocity = Vector2\.ZERO\s*\n\s*_stumble = STUMBLE_SECS/.test(plW)
             && /_skate_push = dir\.length_squared\(\) > 0\.001 and _stumble <= 0\.0/.test(phys)
             && /return Geometry2D\.segment_intersects_segment\(a, b, position - half, position \+ half\) != null/.test(fnGd(tbW, 'trips'))
             && /add_to_group\("skate_ground"\)/.test(tbW),
            '⭐ on skates a stick stops him dead unless he is in the air: a jump clears it, and he cannot push until he has found his feet');
          const walkBranch = phys.slice(phys.indexOf('\telse:\n\t\t_skate_push = false'), phys.indexOf('var was := global_position'));
          const grR = tuneRange('skate_gravel');
          ok(phys.indexOf('var drag := _ground()') > phys.indexOf('if skate:') && !/_ground\(\)|drag/.test(walkBranch)
             && /var rate := speed \* tune\.skate_push \* _delta \/ \(drag if spd > want else 1\.0\)/.test(phys)
             && /speed \* tune\.skate_coast \/ drag \* _delta/.test(phys) && /return tune\.skate_gravel if /.test(fnGd(tbW, 'drag_at'))
             && !!grR && grR[0] > 0 && grR[1] < 0.35,
            '⭐ …and gravel drags at his wheels, grinding him down at once, "even harder" than the 0.35 it was (his); on foot he walks straight over both',
            'gravel leaves him ' + tune('skate_gravel') + ' of his speed, its slider ' + (grR || []).join(' to '));
          const fdT = fnGd(twW, 'floor_drag'), gsR = tuneRange('skate_grass'), dtR = tuneRange('skate_dirt');
          const pkW = code(rd('park.gd')), dpW = code(rd('depths.gd'));
          ok(/func floor_drag\(_p: Vector2\) -> float:\s*\n\s*return 1\.0/.test(code(rd('zone.gd')))
             && /var z := get_parent\(\) as TownZone\s*\n\s*var d := z\.floor_drag\(global_position\) if z != null else 1\.0/.test(fnGd(plW, '_ground'))
             && /var grass := LAWN\.has_point\(p\) or SHORE\.has_point\(p\)/.test(fdT) && /FOREST\.has_point\(p\)/.test(fdT)
             && /return Tuning\.now\(\)\.skate_grass if grass else Tuning\.now\(\)\.skate_dirt/.test(fdT)
             && /return Tuning\.now\(\)\.skate_grass/.test(fnGd(pkW, 'floor_drag'))
             && /return Tuning\.now\(\)\.skate_dirt if _floor\(\)\.has_point\(p\) else 1\.0/.test(fnGd(dpW, 'floor_drag'))
             && !!gsR && !!dtR && gsR[0] > 0 && gsR[1] < 1 && dtR[0] > 0 && dtR[1] < 1,
            '⭐ grass and dirt drag at his wheels too  (his): the park lawn, the shore and the Park Tables\' lawn on skate_grass, the woods\' floor and the pit head\'s on skate_dirt',
            'grass leaves him ' + tune('skate_grass') + ', dirt ' + tune('skate_dirt') + '; sliders ' + (gsR || []).join(' to ') + ' and ' + (dtR || []).join(' to '));
          ok(/for r in _roads\(\):\s*\n\s*if \(r as Rect2\)\.abs\(\)\.has_point\(p\):\s*\n\s*return 1\.0/.test(fdT) && /if _deck\(\)\.has_point\(p\):\s*\n\s*return 1\.0/.test(fdT)
             && /\[PackedVector2Array\(TRAIL_STEM\), TRAIL_W \* 0\.5 \+ 3\.0\]/.test(fdT)
             && /\[trail_points\(\), TRAIL_W \* 0\.5 \+ 3\.0\]/.test(fdT) && /for path in paths\(\):/.test(fnGd(pkW, 'floor_drag'))
             && /for path in Pavilion\.paths\(\):\s*\n\s*draw_rect\(path, Pavilion\.PAVE\)/.test(pkW),
            '⚠ …and a way rolls clean where it crosses them: the roads, the dock, the trail and the Park Tables\' paths  (painted and rolled off one list)');
          /* ── the map ── */
          ok(/TownMap\.trails = \[PackedVector2Array\(TRAIL_STEM\), trail_points\(\)\]/.test(fnGd(twW, '_furnish'))
             && /\{ "rect": FOREST, "color": NEEDLES \}/.test(fnGd(twW, '_furnish')) && /for t in TownMap\.trails:/.test(fnGd(jrW, '_paint_map')),
            '…and the Journal\'s map shows the woods and the trail');
          const needles = (/const NEEDLES := Color\("([0-9a-fA-F]{6})"\)/.exec(twW) || [0, '000000'])[1];
          const [nr, ng] = [parseInt(needles.slice(0, 2), 16), parseInt(needles.slice(2, 4), 16)];
          ok(ng <= nr, '⚠ …and the woods\' floor is needles, not grass: green stays the lawn\'s and the shore\'s', '#' + needles);
        }

        /* ══ nobody in town is your twin — 2026-10-11 ══ */
        /* his, 2026-09-20: "fine if everyone looks the same for now" · 2026-10-11: "play the skeptic on checker town, fix the worst thing you can find … This will be a game I'll eventually want to preview and sell on Steam, so think big." */
        {
          const ppl = code(rd('people_sheet.gd')), npcP = code(rd('npc.gd')), chP = code(rd('challenger.gd'));
          const parkP = code(rd('park.gd')), cbP = code(rd('chessboard.gd')), plP = code(rd('player.gd'));
          const zlib = require('zlib');
          const tbl = (src, name) => Object.fromEntries([...((new RegExp('const ' + name + ' := \\{([\\s\\S]*?)\\}').exec(src) || [0, ''])[1])
            .matchAll(/"([^"]+)": "([0-9a-fA-F]{6})"/g)].map((m) => [m[1], m[2].toLowerCase()]));
          const AURA = tbl(ppl, 'AURA'), OWN = tbl(ppl, 'OWN');

          /* ── a bench seat wears the color you win from it on the site ── */
          const ptHtml = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');
          const prof = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
          const siteAura = Object.fromEntries([...ptHtml.matchAll(/^\s{4}(\w+):\s*\{ name: '[^']*',[^\n]*?aura: '(\w+)'/gm)].map((m) => [m[1], m[2]]));
          const siteHex = Object.fromEntries([...((/var AURAS = \{([\s\S]*?)\};/.exec(prof) || [0, ''])[1])
            .matchAll(/(\w+):\s*'#([0-9a-fA-F]{6})'/g)].map((m) => [m[1], m[2].toLowerCase()]));
          const offSite = Object.keys(AURA).filter((k) => !siteAura[k] || siteHex[siteAura[k]] !== AURA[k]);
          const benchPeople = [...parkP.matchAll(/\{ "key": "([a-z]+)",\s*"who": "([^"]+)"/g)].map((m) => [m[1], m[2]])
            .filter(([, who]) => !new RegExp('"' + who + '":\\s+\\[Color').test(dg));
          const bare = benchPeople.filter(([k]) => !AURA[k]).map(([k]) => k);
          ok(Object.keys(AURA).length >= 7 && offSite.length === 0 && benchPeople.length >= 6 && bare.length === 0 && !!AURA.ceo,
            '⭐ everybody with a seat on the bench wears the color you win from them on the site',
            offSite.length || bare.length ? 'not the site\'s: ' + offSite.join(' ') + '  no row: ' + bare.join(' ')
              : Object.keys(AURA).map((k) => k + ' ' + siteAura[k]).join(' · '));

          /* ── RE-DERIVED: every look, worked out again here, and no two of them mixable ── */
          const salt = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.codePointAt(0)) % 100003; return h; };
          const rgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
          const fromHsv = (h, s, v) => {
            const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
            return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][((i % 6) + 6) % 6];
          };
          const lookFn = fnGd(ppl, 'look_of');
          const hueFn = /Color\.from_hsv\(float\(_salt\(who\) % 360\) \/ 360\.0, ([\d.]+), ([\d.]+)\)/.exec(lookFn);
          const shirtOf = (who, key) => AURA[key] ? rgb(AURA[key]) : OWN[who] ? rgb(OWN[who])
            : hueFn ? fromHsv((salt(who) % 360) / 360, +hueFn[1], +hueFn[2]) : [0, 0, 0];
          const cast = benchPeople.map(([k, who]) => [who, k]).concat([['The CEO', 'ceo']], Object.keys(OWN).map((w) => [w, '']));
          const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
          const NAVY = (/uniform vec3 shirt = vec3\(([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(ppl) || []).slice(1).map(Number);
          let closest = 9, pair = '';
          const twins = [];
          cast.forEach(([a, ka], i) => cast.slice(0, i).forEach(([b, kb]) => {
            const d = dist(shirtOf(a, ka), shirtOf(b, kb));
            if (d === 0) { twins.push(a + '=' + b); return; }
            if (d < closest) { closest = d; pair = a + ' / ' + b; }
          }));
          const likeHim = cast.concat([['Somebody New', '']]).filter(([w, k]) => dist(shirtOf(w, k), NAVY) < 0.3).map(([w]) => w);
          ok(cast.length >= 11 && hueFn && NAVY.length === 3 && closest >= 0.18 && likeHim.length === 0
             && twins.join(' ') === 'Puzzle Champ=The CEO',
            '⭐⭐ NOBODY IS YOUR TWIN: eleven named people, no two shirts you could mix up, and nobody\'s is his navy',
            likeHim.length ? 'too like his: ' + likeHim.join(' ') : 'closest ' + closest.toFixed(2) + ' (' + pair + '); the CEO and the Champ share gold and never a room'
              + (twins.length !== 1 ? '  ⚠ same shirt: ' + twins.join(' ') : ''));
          ok(/\n\tif set\.has\("shirt"\):[^\n]*\n[^\n]*\n\telif AURA\.has\(key\):[^\n]*\n[^\n]*\n\telif OWN\.has\(who\):/.test(lookFn)
             && /const LOOKS := \{/.test(ppl) && !/\bhash\(/.test(lookFn + fnGd(ppl, '_salt')) && !/rand/.test(lookFn),
            '…and a look is worked out from the NAME: his own row first, then the bench, then their own color, then a hue of their own',
            '⚠ never rolled and never hash(): Robert in the Academy is Robert at his table, and this file works it out again');

          /* ── the shader's three bands, held to the pixels of the sheet it dresses ── */
          const readPng = (file) => {
            const b = fs.readFileSync(file);
            let at = 8, w = 0, h = 0, type = -1, depth = 0, lace = 0;
            const idat = [];
            while (at < b.length) {
              const len = b.readUInt32BE(at), name = b.toString('ascii', at + 4, at + 8);
              if (name === 'IHDR') { w = b.readUInt32BE(at + 8); h = b.readUInt32BE(at + 12); depth = b[at + 16]; type = b[at + 17]; lace = b[at + 20]; }
              if (name === 'IDAT') idat.push(b.subarray(at + 8, at + 8 + len));
              at += 12 + len;
            }
            const bpp = type === 6 ? 4 : type === 2 ? 3 : 0;
            if (!bpp || depth !== 8 || lace !== 0) return null;
            const raw = zlib.inflateSync(Buffer.concat(idat)), line = w * bpp, out = Buffer.alloc(w * h * bpp);
            for (let y = 0; y < h; y++) {
              const f = raw[y * (line + 1)], src = y * (line + 1) + 1, dst = y * line;
              for (let x = 0; x < line; x++) {
                const a = x >= bpp ? out[dst + x - bpp] : 0, up = y ? out[dst + x - line] : 0, ul = y && x >= bpp ? out[dst + x - line - bpp] : 0;
                const pa = Math.abs(up - ul), pb = Math.abs(a - ul), pc = Math.abs(a + up - 2 * ul);
                const pred = f === 0 ? 0 : f === 1 ? a : f === 2 ? up : f === 3 ? (a + up) >> 1 : (pa <= pb && pa <= pc ? a : pb <= pc ? up : ul);
                out[dst + x] = (raw[src + x] + pred) & 255;
              }
            }
            return { w, h, bpp, px: out };
          };
          const dressSrc = (/const DRESS := """([\s\S]*?)"""/.exec(rd('people_sheet.gd')) || [0, ''])[1];
          const band = [
            /if \(k\.x > ([\d.]+) && k\.x < ([\d.]+) && k\.y > ([\d.]+)\) \{\s*\n\s*c = shirt \*/.exec(dressSrc),
            /else if \(k\.x > ([\d.]+) && k\.x < ([\d.]+) && k\.y > ([\d.]+)\) \{\s*\n\s*c = hair \*/.exec(dressSrc),
            /else if \(k\.y < ([\d.]+) && k\.z < ([\d.]+)\) \{\s*\n\s*c = cap \*/.exec(dressSrc),
          ];
          const sheetPng = fs.existsSync(GDF('people_idle.png')) ? readPng(GDF('people_idle.png')) : null;
          const share = { shirt: 0, hair: 0, cap: 0, skin: 0, n: 0 };
          if (sheetPng && sheetPng.bpp === 4 && band.every(Boolean)) {
            const p = sheetPng.px;
            for (let i = 0; i < p.length; i += 4) {
              if (p[i + 3] < 128) continue;
              share.n++;
              const r = p[i] / 255, g = p[i + 1] / 255, bl = p[i + 2] / 255, v = Math.max(r, g, bl), d = v - Math.min(r, g, bl);
              const s = v ? d / v : 0;
              let hh = 0;
              if (d) hh = (v === r ? ((g - bl) / d + 6) % 6 : v === g ? (bl - r) / d + 2 : (r - g) / d + 4) / 6;
              if (hh > +band[0][1] && hh < +band[0][2] && s > +band[0][3]) share.shirt++;
              else if (hh > +band[1][1] && hh < +band[1][2] && s > +band[1][3]) share.hair++;
              else if (s < +band[2][1] && v < +band[2][2]) share.cap++;
              else if ((hh < 0.10 || hh > 0.93) && v >= 0.34) share.skin++;
            }
          }
          const pct = (k) => share.n ? 100 * share[k] / share.n : 0;
          ok(sheetPng && share.n > 50000 && pct('shirt') >= 25 && pct('hair') >= 3 && pct('cap') >= 15 && pct('skin') >= 8,
            '⚠⚠ DRESS finds his shirt, his hair and his cap in the sheet as it is baked today',
            sheetPng ? 'shirt ' + pct('shirt').toFixed(1) + '% · hair ' + pct('hair').toFixed(1) + '% · cap and boots ' + pct('cap').toFixed(1)
              + '% · skin left alone ' + pct('skin').toFixed(1) + '%   ⚠ repaint nate.glb and these three bands must be measured again'
              : 'people_idle.png could not be read as an 8-bit RGBA PNG');
          ok(!/texture\(\s*TEXTURE/.test(dressSrc) && /varying vec4 tint;/.test(dressSrc) && /void vertex\(\) \{\s*\n\s*tint = COLOR;/.test(dressSrc)
             && /vec3 texel = COLOR\.rgb \/ max\(tint\.rgb, vec3\(0\.0001\)\);/.test(dressSrc) && /COLOR\.rgb = c \* tint\.rgb;/.test(dressSrc),
            '⚠⚠ …and it reads the picture by dividing the modulate back out, never by sampling again',
            'a name, a shadow or a table drawn by the same node is plain white to it, and is left alone');
          const capM = /var cap := Color\.from_hsv\(shirt\.h, clampf\(shirt\.s \+ [\d.]+, [\d.]+, [\d.]+\), ([\d.]+)\)/.exec(lookFn);
          const lightCaps = [...((/const LOOKS := \{([\s\S]*?)\n\}/.exec(ppl) || [0, ''])[1]).matchAll(/"cap": "([0-9a-fA-F]{6})"/g)]
            .filter((m) => Math.max(...rgb(m[1])) > 0.5).map((m) => m[1]);
          ok(capM && +capM[1] <= 0.5 && lightCaps.length === 0,
            '⚠ every cap is a DEEP shade — the band that finds a cap finds an eye too, and a light cap is two light eyes',
            lightCaps.join(' ') || 'value ' + (capM ? capM[1] : '?'));
          const wideM = /const WIDE := Vector2\(([\d.]+), ([\d.]+)\)/.exec(ppl), tallM = /const TALL := Vector2\(([\d.]+), ([\d.]+)\)/.exec(ppl);
          const spans = wideM && tallM ? [+wideM[1], +wideM[1] + 4 * +wideM[2], +tallM[1], +tallM[1] + 4 * +tallM[2]] : [];
          ok(spans.length === 4 && spans.every((x) => x >= 0.93 && x <= 1.08) && spans[1] - spans[0] >= 0.08 && spans[3] - spans[2] >= 0.08
             && /float\(b % 5\) \* WIDE\.y/.test(lookFn) && /float\(\(b \/ 7\) % 5\) \* TALL\.y/.test(lookFn),
            '…and a build is within eight in a hundred of his, five steps wide and five tall',
            spans.map((x) => x.toFixed(2)).join(' '));

          /* ── everybody who wears the model is dressed, once, in one place ── */
          ok(/\n\tif wears_model\(\):\s*\n\s*var look := TownPeople\.dress\(self, who, bench_key\(\)\)\s*\n\s*body_color = look\["shirt"\]\s*\n\s*_build = look\["build"\]/.test(fnGd(npcP, '_ready_extra'))
             && /func bench_key\(\) -> String:\s*\n\s*return ""/.test(npcP) && /func bench_key\(\) -> String:\s*\n\s*return key/.test(chP)
             && /TownPlayerModel\.TALL \* _build\.y\) if wears_model\(\)/.test(fnGd(npcP, '_top'))
             && /TownPeople\.draw_person\(self, Vector2\(0\.0, TownPlayer\.FEET\), _facing, _phase01, _walking, 18\.75, _build\)/.test(npcP),
            '⭐ a person is dressed as they arrive: their shirt is the color they speak in, and the nameplate sits over THEIR head');
          ok(/if not _animal:\s*\n\s*_build = TownPeople\.dress\(self, who, key\)\["build"\]/.test(parkP)
             && /TownPeople\.draw_person\(self, Vector2\(0\.0, SEAT_FEET\), Vector2\.DOWN, _phase01, false, 18\.75, _build\)/.test(parkP)
             && /var look := TownPeople\.dress\(self, "Murphy", ""\)\s*\n\s*_build = look\["build"\]\s*\n\s*ink = look\["shirt"\]/.test(cbP)
             && /TownPeople\.draw_person\(self, Vector2\.ZERO, _facing\(\), _phase, false, 18\.75, _build\)/.test(cbP),
            '…the six at the tables and Murphy at the nightmare\'s board the same way, in the same clothes');
          /* ⚠ A DOG'S IS ITS COAT (dog.gd), and that one assignment is the only other one there may be. */
          const byHand = GD_LIST.filter((f) => f.endsWith('.gd') && f !== 'npc.gd' && f !== 'dog.gd')
            .filter((f) => /\.body_color = /.test(code(rd(f))));
          ok(byHand.length === 0 && !/TownPeople\.dress/.test(plP + dg)
             && (dg.match(/\.body_color = /g) || []).length === 1 && /dog\.body_color = coat\[0\]/.test(dg),
            '⚠⚠ ONE SOURCE: nobody sets a person\'s color by hand, and neither you nor a dog is dressed by it',
            byHand.join(' ') || 'six hand-set colors retired into TownPeople; a dog\'s is its coat');
          const dressFn = fnGd(ppl, 'dress');
          ok(/if not _worn\.has\(who\):/.test(dressFn) && /ci\.material = _worn\[who\]/.test(dressFn)
             && /static var _worn: Dictionary = \{\}/.test(ppl) && !/modulate|apply_tint/.test(dressFn)
             && /Rect2\(feet \+ \(r\.position - feet\) \* build, r\.size \* build\)/.test(fnGd(ppl, 'draw_person'))
             && /Vector2\(build\.x, 0\.34\)/.test(fnGd(ppl, 'draw_person')),
            '⭐ still ONE sheet: one material a person for the session, the figure and its shadow grown from the heels',
            'not `modulate` and not apply_tint — white under the key light times a color is that color flat');
        }

        /* ══ a board each · the pieces change when you check back in · Milo — 2026-10-10 ══ */
        /* his: "please continue.  And then, when you check back in to checker town it would be cool if some of the pieces changed.  Make three boards, one for each dog.  Crockett's has pieces all over the place.  Change that dog's name to Milo.  Instead of one eye with black fur around it make it both. Keep the coat white with black spots." */
        {
          const gsM = code(rd('game_state.gd')), pkM = code(rd('park.gd')), bvM = code(rd('board_view.gd'));
          const hbM = hm.slice(hm.indexOf('class HomeBoard extends Interactable:'));
          const CM = require('../assets/js/pjcc-chess.js');
          const SYSM = require('../assets/js/pjcc-systems.js');
          const fnInM = (src, name) => {
            const a = src.indexOf('\tfunc ' + name + '(');
            if (a < 0) return '';
            const rest = src.slice(a + 1);
            const b = rest.search(/\n\t(?:static )?func |\n\S/);
            return b < 0 ? rest : rest.slice(0, b);
          };
          const v2M = (src, n) => {
            const h = layoutAt(src, n); if (h) return h;
            const m = new RegExp('const ' + n + ' := Vector2\\((-?[\\d.]+), (-?[\\d.]+)\\)').exec(src);
            return m ? { x: +m[1], y: +m[2] } : null;
          };

          /* ── the name ── */
          const stale = GD_LIST.filter((f) => f.endsWith('.gd'))
            .filter((f) => /"Crockett"/.test(code(rd(f)).replace(/const RENAMED := \{[^}]*\}/, '')));
          ok(stale.length === 0 && /"Milo": \{ "key": "crockett", "elo": 750/.test(dg) && !/"key": "milo"/.test(dg + gsM + pkM),
            '⛑ he is MILO: nothing the game can show says Crockett, and his bench key did not move',
            stale.length ? 'still "Crockett" in: ' + stale.join(' ') : 'the site\'s seat, his square and every stamp are kept by `crockett`');
          ok(/\{ "p": "p", "who": "Milo",\s+"key": "crockett",/.test(gsM) && /"say": "Milo stands on his square/.test(gsM)
             && /\{ "key": "crockett", "who": "Milo", "elo": 750,\s+"piece": "n", "ms": 160 \}/.test(pkM)
             && /_lane_dog\("Milo", /.test(tw) && /_lodger\("Milo", where\("MiloBed", MILO_BED_AT\)\)/.test(hm),
            '…on his square, on his rung, on the lane and on his own cushion');
          /* his, 2026-10-26: "Rename Nate NPC to Jay." The site renamed him too; the key `nate` stays everywhere. */
          ok(/\{ "p": "p", "who": "Jay",\s+"key": "nate",/.test(gsM) && /\{ "key": "nate",\s+"who": "Jay",/.test(pkM)
             && /_add_challenger\("Jay", "nate", /.test(tw) && fs.existsSync(path.join(GD, 'people', 'lines', 'jay.txt'))
             && !fs.existsSync(path.join(GD, 'people', 'lines', 'nate.txt')) && !/"key": "jay"/.test(gsM + pkM),
            '⭐ the Nate at the sea is JAY  (his): his square, his seat, his place by the sea and his words, and his key did not move');
          ok(/const RENAMED := \{ "Crockett": "Milo", "Nate": "Jay" \}/.test(gsM)
             && /by_name\[now\] = maxi\(int\(by_name\.get\(now, 0\)\), int\(by_name\[was\]\)\)\s*\n\s*by_name\.erase\(was\)/.test(fnGd(gsM, '_renamed'))
             && /hearts = d\.get\("hearts", \{\}\)\s*\n\s*_renamed\(people\.hearts\)/.test(fnGd(gsM, 'load_state'))
             && /var theirs: Dictionary = \(d\.get\("hearts", \{\}\) as Dictionary\)\.duplicate\(\)\s*\n\s*_renamed\(theirs\)\s*\n\s*for k in theirs:/.test(fnGd(gsM, 'merge_in')),
            '⛑⛑ the hearts he had as Crockett are Milo\'s, and Nate\'s are Jay\'s — from the file on this device AND from the account',
            'hearts are kept by NAME; the account\'s copy still says Crockett, and is read, never rewritten in place');

          /* ── his coat ── */
          const coatM = /"Milo":\s+\[Color\("([0-9a-f]{6})"\), Color\("([0-9a-f]{6})"\), Color\("[0-9a-f]{6}"\), (true|false)\]/.exec(dg);
          const lum = (hex) => (0.2126 * parseInt(hex.slice(0, 2), 16) + 0.7152 * parseInt(hex.slice(2, 4), 16)
            + 0.0722 * parseInt(hex.slice(4, 6), 16)) / 255;
          const pfM = fnGd(dg, 'paint_front'), pM = fnGd(dg, 'paint');
          ok(coatM && lum(coatM[1]) > 0.85 && lum(coatM[2]) < 0.15 && coatM[3] === 'true'
             && /12\.5, body\)[^\n]*\n\s*if c\[3\]:\s*\n(?:\s*ci\.draw_circle\(Vector2\(-?[\d.]+, -?[\d.]+\), [\d.]+, edge\)[^\n]*\n){2,}/.test(pfM),
            '⭐ his coat is still white with black spots', coatM ? coatM[1] + ' with ' + coatM[2] : 'no coat');
          const patch = /if c\[3\]:\s*\n\s*for sx in \[-1\.0, 1\.0\]:\s*\n\s*ci\.draw_circle\(Vector2\(sx \* ([\d.]+), (-?[\d.]+)\), ([\d.]+), edge\)/.exec(pfM);
          const eyeM = /var eye := Vector2\(sx \* ([\d.]+), (-?[\d.]+)\)\s*\n\s*ci\.draw_circle\(eye, ([\d.]+), Color/.exec(pfM);
          ok(patch && eyeM && patch[1] === eyeM[1] && patch[2] === eyeM[2] && +patch[3] >= +eyeM[3] + 1.5
             && pfM.indexOf(patch[0]) < pfM.indexOf(eyeM[0]),
            '⭐⭐ black fur round BOTH his eyes: a patch a side, where the eye is, wider than the eye and under it',
            patch && eyeM ? 'r ' + patch[3] + ' round an eye of r ' + eyeM[3] : 'not found');
          const dot = /ci\.draw_circle\(Vector2\(([\d.]+), (-?[\d.]+) \+ y\), ([\d.]+), edge\)/.exec(pM);
          const prof = /if c\[3\]:\s*\n\s*for s in \[((?:Vector3\([^)]*\)(?:, )?)+)\]:\s*\n\s*ci\.draw_circle\(Vector2\(s\.x, s\.y \+ y\), s\.z, edge\)\s*\n\s*ci\.draw_circle\(Vector2\(([\d.]+), (-?[\d.]+) \+ y\), ([\d.]+), edge\)\s*\n\s*ci\.draw_circle\(Vector2\(([\d.]+), (-?[\d.]+) \+ y\), ([\d.]+), body\)/.exec(pM);
          ok(prof && dot && prof[2] === dot[1] && prof[3] === dot[2] && +prof[4] > +dot[3] + 1
             && prof[5] === dot[1] && prof[6] === dot[2] && +prof[7] < +dot[3] && (prof[1].match(/Vector3/g) || []).length >= 2,
            '…in profile the patch goes round the one dot that is his eye at that size, with two spots still on his side',
            'a patch of its own between the ear and that dot was one blot');
          ok(/var eye: Color = edge\s*\n\s*if c\[3\]:\s*\n\s*ci\.draw_circle\(Vector2\(3\.0, -2\.0\), [\d.]+, edge\)\s*\n\s*eye = body/.test(fnGd(dg, 'paint_sitting'))
             && /ci\.draw_circle\(Vector2\(3\.0, -2\.0\), 1\.4, eye\)/.test(fnGd(dg, 'paint_sitting'))
             && /ci\.draw_arc\(Vector2\(-8\.5, 8\.5\), 2\.1, 0\.2, PI - 0\.2, 6, body if c\[3\] else edge, 1\.2\)/.test(fnGd(dg, 'paint_curled')),
            '⚠ …and on a patch the eye is drawn LIGHT, sitting up and asleep',
            'the coat\'s own dark eye on dark fur is no eye at all');

          /* ── a board each ── */
          const miloB = v2M(hm, 'MILO_BOARD_AT'), argusB = v2M(hm, 'ARGUS_BOARD_AT');
          const lowSc = +(/low\.scale = Vector2\(([\d.]+), ([\d.]+)\)/.exec(hm) || [0, 0])[1];
          const lowR = +(/low\.radius = ([\d.]+)/.exec(hm) || [0, 0])[1];
          const beds = { Princess: v2M(hm, 'DOG_BED_AT'), Milo: v2M(hm, 'MILO_BED_AT'), Argus: v2M(hm, 'ARGUS_BED_AT') };
          ok(/for spot in \[\[where\("MiloBoard", MILO_BOARD_AT\), "Milo"\], \[where\("ArgusBoard", ARGUS_BOARD_AT\), "Argus"\]\]:\s*\n\s*var low := HomeBoard\.new\(\)\s*\n\s*low\.dog = spot\[1\]/.test(hm)
             && /var dog := "Princess"/.test(hbM) && (fnGd(hm, '_furnish_dogs').match(/HomeBoard\.new\(\)/g) || []).length === 2
             && !/_solid\(low/.test(hm) && /prompt_text = "%s's board" % dog/.test(fnInM(hbM, '_ready_extra')),
            '⭐ three boards, one for each dog: hers on the table, theirs on the floor and never a wall',
            'in a room this size a solid thing you cannot see the edges of is a wall nobody can report');
          ok(/\n\t\t\t_shape\.position = Vector2\(0\.0, -24\.0\)/.test(fnInM(hbM, '_ready_extra')) && lowR >= 23 * Math.SQRT2 && lowR <= 46,
            '⚠ a floor board is used from any side: its reach is round the MIDDLE of it and takes in every corner',
            'left at its foot, somebody standing on the far half of the board was out of reach of it');
          const lows = miloB && argusB && lowSc && beds.Princess && beds.Milo && beds.Argus ? [['Milo', miloB], ['Argus', argusB]] : [];
          const picM = (p) => ({ x: p.x - 23 * lowSc, y: p.y - 47 * lowSc, w: 46 * lowSc, h: 46 * lowSc });
          const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
          const strays = lows.filter(([who, p]) => {
            const mid = { x: p.x, y: p.y - 24 * lowSc };
            const by = Object.keys(beds).sort((a, b) => Math.hypot(beds[a].x - mid.x, beds[a].y - mid.y)
              - Math.hypot(beds[b].x - mid.x, beds[b].y - mid.y))[0];
            const r = picM(p);
            return by !== who || [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].some(([x, y]) => ell(x, y) > 0.95);
          }).map(([who]) => who);
          ok(lows.length === 2 && strays.length === 0,
            '…each by its own dog\'s cushion and nobody else\'s, every corner of it on the round floor', strays.join(' ') || 'Milo · Argus');
          /* ⚠⚠ RE-DERIVED: the gold mark is R round, speech_top() above where the board stands. */
          const topM = +(/func speech_top\(\) -> float:\s*\n\s*return (-?[\d.]+) \* scale\.y/.exec(hbM) || [0, 0])[1];
          const markR = num(code(rd('notice.gd')), 'R');
          const fp = num(hm, 'FLOOR_PIECE');
          const rowM2 = /_floor_piece\(where\("ArgusBed", ARGUS_BED_AT\) \+ Vector2\((-?[\d.]+) \+ ([\d.]+) \* float\(i\), (-?[\d.]+)\)/.exec(hm);
          const rowN2 = ((/const ROW := "(\w+)"/.exec(hm) || [0, ''])[1]).length;
          const rowBox = rowM2 && beds.Argus ? { x: beds.Argus.x + +rowM2[1] - fp / 2, y: beds.Argus.y + +rowM2[3] - fp / 2,
            w: +rowM2[2] * (rowN2 - 1) + fp, h: fp } : null;
          const solids = [];
          for (const m of hm.matchAll(/_solid\((\w+), Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)\)/g)) {
            const want = new RegExp(m[1] + '\\.position = (?:where\\("\\w+", )?([A-Z_]+)').exec(hm);
            const at = want && v2M(hm, want[1]);
            const sc = +(new RegExp(m[1] + '\\.scale = Vector2\\(([\\d.]+),').exec(hm) || [0, 1])[1];
            if (at) solids.push({ x: at.x + +m[2] * sc, y: at.y + +m[3] * sc, w: +m[4] * sc, h: +m[5] * sc });
          }
          /* a cushion, and a dog sitting up on it */
          const seats = Object.keys(beds).filter((k) => beds[k]).map((k) => ({ x: beds[k].x - 40, y: beds[k].y - 50, w: 80, h: 70 }));
          const sat = lows.filter(([, p]) => {
            const mark = { x: p.x - markR, y: p.y + topM * lowSc - markR, w: markR * 2, h: markR * 2 };
            return seats.concat(solids, rowBox ? [rowBox] : []).some((bx) => hit(mark, bx) || hit(picM(p), bx));
          }).map(([who]) => who);
          ok(topM < 0 && markR > 0 && rowBox && solids.length >= 4 && lows.length === 2 && sat.length === 0 && !hit(picM(miloB), picM(argusB)),
            '⚠⚠ …and neither board nor its gold mark lands on a cushion, a dog sitting on one, the furniture or Argus\'s row',
            sat.length ? sat.join(' ') : 'straight below his cushion, Milo\'s mark was drawn on Milo: seen in the first screenshot');

          /* ── what you walk in on ── */
          const TM = num(hm, 'TURN_MINUTES');
          ok(TM >= 30 && TM <= 360 && 1440 % TM === 0
             && /return TownClock\.day_of_year\(\) \* \(1440 \/ TURN_MINUTES\) \+ TownClock\.minute_of_day\(\) \/ TURN_MINUTES/.test(fnGd(hm, 'turn'))
             && /static var now: int = 0/.test(hm) && (hm.match(/\bturn\(\)/g) || []).length === 2
             && /\n\tnow = turn\(\)\n/.test(fnGd(hm, 'arrive')),
            '⭐ when you check back in the pieces have changed: a turn is ' + TM + ' minutes of the town\'s clock, read ONCE, at the door',
            '⚠⚠ nothing else in the house asks the clock — pieces that jump in front of you are a glitch, not a dog');
          ok(/return now \* 16 \+ int\(bump\.get\(dog, 0\)\)/.test(fnGd(hm, 'stamp'))
             && /return dog != "Princess" and int\(tidy\.get\(dog, -1\)\) != now/.test(fnGd(hm, 'wrecked'))
             && /rng\.seed = hash\("%s\|%d" % \[dog, stamp\(dog\)\]\)/.test(fnGd(hm, '_dice'))
             && !/randomize\(\)/.test(hm) && !/(?<![.\w])rand[fi](?:_range)?\(/.test(hm) && !/^\s*while\b/m.test(hm),
            '⚠⚠ what a dog left is worked out from that turn, never rolled: the same mess every time you look',
            'home.gd throws no dice of its own — every one is rng.*, seeded by the stamp — and has no open-ended loop');

          /* ── Milo's ── */
          const spillFn = fnGd(hm, 'spill');
          const side = (/const SIDE := "(\w+)"/.exec(hm) || [0, ''])[1];
          const dealt = +(/for i in (\d+):\s*\n\s*all\.append\(\[SIDE\[i % 16\], i >= 16\]\)/.exec(spillFn) || [0, 0])[1];
          ok(side.split('').sort().join('') === 'bbknnppppppppqrr' && dealt === 31 && side[dealt % 16] === 'p'
             && /if act\(\) == "mess" and bool\(scene\.get\("happy", false\)\):\s*\n\s*_piece\("p", true,/.test(bvM),
            '⭐ Milo\'s are all over the place, and they add up: 31 dealt between the floor and his board, the 32nd in his mouth  (under his paw for whoever keeps the dogs outdoors)',
            'the one left out is white\'s last pawn — the pawn BoardView paints under his nose');
          const nSpots = (((/const SCATTER := \[([\s\S]*?)\n\]/.exec(hm) || [0, ''])[1]).match(/Vector2\(/g) || []).length;
          const nR = /var n := rng\.randi_range\(SCATTER\.size\(\) - (\d+), SCATTER\.size\(\) - (\d+)\)/.exec(spillFn);
          ok(nSpots >= 10 && nR && nSpots - +nR[1] >= 8 && +nR[2] >= 1
             && /on_floor\[\(first \+ i\) % SCATTER\.size\(\)\] = \[all\[i\]\[0\], all\[i\]\[1\],/.test(spillFn)
             && /for i in range\(n, all\.size\(\)\):/.test(spillFn)
             && /var lot: Array = NateHome\.spill\(\)\[0\]/.test(fnGd(hm, '_draw_mess'))
             && /mess\["pieces"\] = NateHome\.spill\(\)\[1\]/.test(fnInM(hbM, '_look')),
            '…never fewer than eight on the floor and never every spot, so WHICH spots are bare changes as well',
            nR ? (nSpots - +nR[1]) + ' to ' + (nSpots - +nR[2]) + ' of ' + nSpots + ' spots; the rest go to the close-up' : 'not found');
          const ax = /float\(cell % 9\) - ([\d.]+) \+ rng\.randf_range\(([\d.]+), ([\d.]+)\)/.exec(spillFn);
          const dn = /var down := float\(cell \/ 9\) \* ([\d.]+) \+ rng\.randf_range\(([\d.]+), ([\d.]+)\)/.exec(spillFn);
          const lip = +(/var top := _board\.grow\(c \* ([\d.]+)\)/.exec(bvM) || [0, 0])[1];
          const pieceH = +(/ChessArt\.draw_piece\(_art, code, at, _cell \* ([\d.]+), fill, line\)/.exec(bvM) || [0, 0])[1];
          const below = num(bvM, 'HIGH') - num(bvM, 'HEAD') - 8;
          const xs = ax ? [+ax[2] - +ax[1], 8 - +ax[1] + +ax[3]] : [NaN, NaN];
          const ys = dn ? [+dn[2], 8 * +dn[1] + +dn[3]] : [NaN, NaN];
          ok(ax && dn && lip > 0 && pieceH > 0 && xs[0] >= -lip && xs[1] <= 8 + lip && ys[0] > 0 && ys[1] + pieceH / 2 <= 8 + below + 1e-9
             && 1 - (+ax[3] - +ax[2]) >= 0.3 && +dn[1] - (+dn[3] - +dn[2]) >= 0.3
             && /for _try in 81:\s*\n\s*if not used\.has\(cell\):\s*\n\s*break\s*\n\s*cell = \(cell \+ 31\) % 81\s*\n\s*used\[cell\] = true/.test(spillFn),
            '⚠ up close no piece hides another, none is past the table\'s lip, none is cut in half by the caption',
            ax && dn ? 'across ' + xs[0].toFixed(2) + ' to ' + xs[1].toFixed(2) + ', down ' + ys[0].toFixed(2) + ' to ' + ys[1].toFixed(2)
              + ' squares; a square each on a 9 × 9, found by a counted loop' : 'not found');
          ok(/if scene\.has\("pieces"\):\s*\n\s*if act\(\) == "mess":\s*\n\s*_paint_prints\(\)\s*\n\s*for p in \(scene\["pieces"\] as Array\):\s*\n\s*_piece\(str\(p\[0\]\), bool\(p\[1\]\), _board\.position \+ Vector2\(float\(p\[2\]\), float\(p\[3\]\)\) \* c, float\(p\[4\]\)\)/.test(fnGd(bvM, '_paint'))
             && /if bool\(scene\.get\("ring", true\)\):\s*\n\s*TownPortal\.paint\(/.test(fnGd(bvM, '_paint'))
             && /scene\["ring"\] = dog == "Princess"/.test(fnInM(hbM, '_open')),
            '⭐ the close-up paints whatever stands where home.gd says, and the portal\'s ring is in HER board only');

          /* ── Argus's ── */
          const rowFn = fnGd(hm, 'row');
          ok(/var rng := _dice\("Argus"\)/.test(rowFn) && /var j := rng\.randi_range\(0, i\)\s*\n\s*var t: String = codes\[i\]\s*\n\s*codes\[i\] = codes\[j\]\s*\n\s*codes\[j\] = t/.test(rowFn)
             && /var first := \(now \+ int\(bump\.get\("Argus", 0\)\)\) % 2/.test(rowFn) && /i % 2 == first/.test(rowFn)
             && /if wrecked\("Argus"\):\s*\n\s*var order := NateHome\.row\(\)/.test(fnGd(hm, '_draw_mess'))
             && /"act": "mess", "by": dog,/.test(fnInM(hbM, '_look')) && /var wild := dog == "Milo"/.test(fnInM(hbM, '_look')),
            '⭐ Argus stands his by his bed in a new order each time — and light and dark swap ends every time, dice or no dice',
            'the same row twice running is "nothing changed"');

          /* ── hers: the site's own Pirc, on the site's referee ── */
          const pircRows = [...((/const PIRC := \[(.*)\]\n/.exec(hm) || [0, ''])[1]).matchAll(/\[([^\]]*)\]/g)]
            .map((m) => m[1].split(',').map((x) => x.trim().replace(/"/g, '')).filter(Boolean));
          const sysP = SYSM.get('pircb');
          let SP = CM.parseFEN(CM.START_FEN);
          const mine = {};
          SP.b.forEach((p, i) => { if (p) mine['abcdefgh'[i % 8] + (8 - Math.floor(i / 8))] = p; });
          const wantP = [];
          let drift = '';
          (sysP ? sysP.vs['*'] : []).forEach((uci, n) => {
            SP.turn = 'b';
            SP.ep = -1;
            const from = uci.slice(0, 2), to = uci.slice(2, 4);
            const mv = CM.findMove(SP, CM.sqFromName(from), CM.sqFromName(to));
            if (!mv) { drift = drift || uci + ' is not legal for Black with nobody answering'; return; }
            const row = [from + to];
            if (SP.b[CM.sqFromName(from)].toLowerCase() === 'k' && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2)
              row.push(to[0] === 'g' ? 'h' + from[1] + 'f' + from[1] : 'a' + from[1] + 'd' + from[1]);
            wantP.push(row.join(' '));
            SP = CM.makeMove(SP, mv);
            /* ⚠ AND THE REPLAY home.gd DOES — a square in, a square out — lands on the referee's board. */
            (pircRows[n] || []).forEach((hop) => { mine[hop.slice(2, 4)] = mine[hop.slice(0, 2)]; delete mine[hop.slice(0, 2)]; });
            for (let i = 0; i < 64; i++) {
              const sq = 'abcdefgh'[i % 8] + (8 - Math.floor(i / 8));
              if ((SP.b[i] || '') !== (mine[sq] || '')) drift = drift || 'after ' + uci + ', ' + sq + ' is "' + (mine[sq] || '') + '" here and "' + (SP.b[i] || '') + '" on the referee';
            }
          });
          ok(sysP && sysP.side === 'b' && wantP.length >= 6 && drift === ''
             && pircRows.map((r) => r.join(' ')).join('|') === wantP.join('|'),
            '⭐⭐ the moves that appear on Princess\'s board ARE the Academy\'s Pirc: same squares, same order, legal on the site\'s referee',
            drift || wantP.join(' · '));
          const doneFn = fnGd(hm, 'pirc_done');
          ok(/return now % \(PIRC\.size\(\) \+ 1\) if GameState\.story\.dogs_play else 0/.test(doneFn)
             && /if _left\.is_empty\(\) and GameState\.story\.dogs_play:\s*\n\s*var k := NateHome\.pirc_done\(\)\s*\n\s*scene\["pieces"\] = NateHome\.pirc_pieces\(k\)\s*\n\s*if k > 0:\s*\n\s*scene\["line"\] = MOVED/.test(fnInM(hbM, '_look'))
             && /if GameState\.story\.dogs_play:\s*\n\s*var out_at := 1 if NateHome\.pirc_done\(\) > 0 else -1/.test(fnInM(hbM, '_draw')),
            '⛑⛑ one more of them each check-in, then she sets it up again — and NOT ONE before the secret is out',
            'a piece moved properly while you were away IS the secret');
          const movedLine = (/const MOVED := "([^"]*)"/.exec(hbM) || [0, ''])[1];
          ok(movedLine.startsWith('Princess ') && !/\b(said|says|thinks?|told)\b/i.test(movedLine)
             && !/func (legal|attack|is_attacked|gen_moves|in_check|can_move|moves_for)/.test(hm),
            '⛑ ONLY HUMANS TALK, and NO CHESS IN GODOT: what she did, starting with her name; what moved is DATA', movedLine);
        }

        /* ══ Pawn Crossing: things in the lanes · abilities · their openings · the tide — 2026-10-10 ══ */
        /* his: "For the Frogger game, I want special abilities to unlock, items, maybe the opponent comes at you in an opening style like the catalan.  Maybe we can incorporate the sea board." */
        {
          const xg = code(rd('crossing.gd')), gsX = code(rd('game_state.gd')), seaX = code(rd('sea_board.gd'));
          const cbX = code(rd('chessboard.gd')), padX = code(rd('touch_pad.gd'));
          const CX = require('../assets/js/pjcc-chess.js');
          const SYSX = require('../assets/js/pjcc-systems.js');

          /* ── their openings: the site's own systems, played on the site's referee ── */
          const body = (/const OPENINGS := \[([\s\S]*?)\n\]/.exec(xg) || ['', ''])[1];
          const ops = [...body.matchAll(/\{ "id": "(\w+)", "name": "([^"]+)",[^\n]*\n\s*"moves": \[([\s\S]*?)\n\s*\] \}/g)].map((m) => ({
            id: m[1], name: m[2],
            rows: m[3].split('\n').filter((l) => /Vector2i/.test(l)).map((l) =>
              [...l.matchAll(/\[Vector2i\((\d), (\d)\), Vector2i\((\d), (\d)\)\]/g)].map((p) => [+p[1], +p[2], +p[3], +p[4]])),
          }));
          const sqName = (c, r) => 'hgfedcba'[c] + (r + 1);              /* column 0 is the h-file, row 0 their back rank */
          const derive = (id) => {
            const sys = SYSX.get(id);
            if (!sys || sys.side !== 'w') return null;
            let S = CX.parseFEN(CX.START_FEN);
            const rows = [];
            for (const uci of sys.moves) {
              const from = uci.slice(0, 2), to = uci.slice(2, 4);
              const mv = CX.findMove(S, CX.sqFromName(from), CX.sqFromName(to));
              if (!mv) continue;                                           /* the list's alternates: what next() skips too */
              const row = [from + to];
              if (S.b[CX.sqFromName(from)].toLowerCase() === 'k' && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2)
                row.push(to[0] === 'g' ? 'h' + from[1] + 'f' + from[1] : 'a' + from[1] + 'd' + from[1]);
              rows.push(row.join(' '));
              S = CX.makeMove(S, mv);
              S.turn = 'w';
              S.ep = -1;
            }
            return { name: sys.name.replace(/’/g, "'"), rows };
          };
          const wrong = ops.filter((o) => {
            const d = derive(o.id);
            const mine = o.rows.map((r) => r.map((p) => sqName(p[0], p[1]) + sqName(p[2], p[3])).join(' '));
            return !d || d.name !== o.name || d.rows.join('|') !== mine.join('|');
          }).map((o) => o.id);
          ok(ops.length >= 5 && wrong.length === 0,
            '⭐⭐ every opening that comes at you in Pawn Crossing IS one of the Park Tables\' own: same name, same squares, same order',
            wrong.length ? 'differs from pjcc-systems.js: ' + wrong.join(' ') : ops.map((o) => o.id).join(' ') + ' — replayed on the site\'s referee with nobody answering');
          ok(ops.length > 0 && ops[0].id === 'catalan', '…and the Catalan is the first of them  (the one he asked for)', (ops[0] || {}).id);
          const foeRows = num(xg, 'FOE_ROWS');
          const outside = ops.filter((o) => o.rows.some((r) => r.some((p) => p[3] > foeRows)));
          const homes = ops.filter((o) => {
            const at = new Set();
            return o.rows.some((r) => r.some((p) => {
              const key = p[0] + ',' + p[1], bad = !at.has(key) && p[1] > 1;
              at.delete(key); at.add(p[2] + ',' + p[3]);
              return bad;
            }));
          });
          ok(outside.length === 0 && homes.length === 0,
            '…every one of their pieces starts on its own two ranks and no move leaves the lanes',
            'a foe may never land on the two ranks you start on');
          const tips = (/const OPENING_TIPS := \{([\s\S]*?)\n\}/.exec(xg) || ['', ''])[1];
          ok(ops.every((o) => new RegExp('"' + o.id + '": "[^"]{12,}"').test(tips)),
            '…and each has its one line  (⚠ PLACEHOLDER COPY, his to rewrite)');
          ok(/if \(n \+ 1\) % OPENING_EVERY != 0 or tactic_of\(n\) != "":\s*\n\s*return -1/.test(fnGd(xg, 'opening_of'))
             && /_opening = opening_of\(n\) if _piece != "p" else -1/.test(fnGd(xg, '_wave')),
            '⚠ a set-piece crossing stays a set piece, and an opening is never met as a pawn',
            'a pawn cannot go round one of theirs asleep on its file: the flag falls on every heart');
          ok(/if f\.asleep:\s*\n\s*return/.test(fnGd(xg, '_step'))
             && /if f == null or not f\.asleep:\s*\n\s*break/.test(fnGd(xg, '_play_book'))
             && /_light\(f, _open_run\(f, _between\(row\[i\]\[0\], row\[i\]\[1\]\) if i == 0 else \[row\[i\]\[1\]\]\)\)/.test(fnGd(xg, '_play_book'))
             && /if _claimed\(sq, f\):\s*\n\s*break/.test(fnGd(xg, '_open_run'))
             && /if not taken\.has\(from\) and not mine\(from\):/.test(fnGd(xg, '_set_opening')),
            '⚠ their pieces wait for the opening to be played, and it is played like any other move: lit, then slid, never through one of yours',
            'no king (its square is a seat of yours) means no castle; a castling rook hops');
          ok(!/func (legal_moves|is_attacked|in_check|gen_moves|make_move|is_legal)\b/.test(xg),
            '⛑ and still NO CHESS IN GODOT: an opening is a table of squares');

          /* ── things in the lanes ── */
          const chance = num(xg, 'ITEM_CHANCE'), heartAt = num(xg, 'HEART_AT'), hpMax = num(xg, 'HP_MAX');
          ok(chance > 0 && chance <= 1 && heartAt >= 1 && heartAt < hpMax
             && /if player\.hp <= HEART_AT:\s*\n\s*kinds\.append\("heart"\)/.test(fnGd(xg, '_lay_item'))
             && /Vector2i\(_rng\.randi_range\(0, 7\), _rng\.randi_range\(1, 4\)\)\s*\n\s*if not _claimed\(sq, null\):/.test(fnGd(xg, '_lay_item'))
             && /if n > 0:\s*\n\s*_lay_item\(\)/.test(fnGd(xg, '_wave')),
            '⭐ a clock, a scoresheet or a heart lies in the lanes — on nobody, never on the first crossing, a heart only on your last',
            'soaked 10-10: with a heart laid whenever one was missing a careful player went from 16 crossings to 25');
          const hop = fnGd(xg, '_hop_step');
          ok(hop.indexOf('if u < 1.0:') > 0 && hop.indexOf('if _items.has(_at):') > hop.indexOf('if u < 1.0:')
             && /if _items\.has\(_at\):\s*\n\s*_grab\(_at\)/.test(hop),
            '⚠ a thing is taken by LANDING on it: a dash over it takes nothing, like a piece');

          /* ── abilities ── */
          const skills = [...((/const SKILLS := \[([\s\S]*?)\n\]/.exec(xg) || ['', ''])[1])
            .matchAll(/\{ "id": "(\w+)", "name": "([^"]+)", "need": (\d+), "cool": (\d+) \}/g)].map((m) => ({ id: m[1], need: +m[3], cool: +m[4] }));
          ok(skills.length === 3 && skills.map((s) => s.id).join(' ') === 'castle zugzwang promote'
             && skills.every((s, i) => s.cool >= 1 && s.need > (i ? skills[i - 1].need : 0))
             && /static func unlocked\(i: int\) -> bool:\s*\n\s*return GameState\.worlds\.crossing_best >= int\(SKILLS\[i\]\["need"\]\)/.test(xg)
             && [...gsX.matchAll(/\bcrossing_\w+/g)].every((m) => m[0] === 'crossing_best'),
            '⭐ Castle, Zugzwang, Promotion: each unlocked for good by your best score, and by nothing else',
            skills.map((s) => s.id + ' at ' + s.need).join(' · ') + ' — read off crossing_best, so there is nothing new to save, push or merge');
          const use = fnGd(xg, 'use_skill');
          ok(/if not can_use\(i\):\s*\n\s*return false/.test(use) && /_cool\[i\] = int\(SKILLS\[i\]\["cool"\]\)/.test(use)
             && /or int\(_cool\[i\]\) > 0 or not live\(\) or _hop >= 0\.0:\s*\n\s*return false/.test(fnGd(xg, 'can_use'))
             && /for i in _cool\.size\(\):\s*\n\s*_cool\[i\] = maxi\(0, int\(_cool\[i\]\) - 1\)/.test(fnGd(xg, '_cross'))
             && /_cool = \[0, 0, 0\]/.test(fnGd(xg, 'again')),
            '…a used one is gone for its crossings, comes back one crossing at a time, and a new run starts with all three');
          ok(/"castle":[\s\S]*?_ward_on = false\s*\n\s*_to_start\(\)/.test(use)
             && /if _frozen > 0\.0 and f\.phase != MOVE:\s*\n\s*return/.test(fnGd(xg, '_step'))
             && /"promote":\s*\n\s*_piece = "q"/.test(use) && /var pts: int = VALUE\[was\]/.test(fnGd(xg, '_cross')),
            '⚠ Castle leaves an escort where it stood, Zugzwang lets a slide already going land, and a promoted crossing pays what a queen pays',
            'an escort castled along is a crossing for free; a slide stopped halfway bites for three seconds');

          /* ── the tide ── */
          const diveEvery = num(xg, 'DIVE_EVERY'), diveSecs = num(xg, 'DIVE_SECS');
          ok(diveSecs > 0 && diveSecs < diveEvery && /if f\.under > 0\.0:\s*\n\s*return false/.test(fnGd(xg, 'shows'))
             && /if f\.under > 0\.0:\s*\n\s*for sq in stepped:\s*\n\s*_prints\[sq\] = PRINT_SECS/.test(fnGd(xg, '_step'))
             && /if _sea:\s*\n\s*_tide\(delta\)/.test(fnGd(xg, '_process')),
            '⭐ every seventh crossing the tide is in: ONE of theirs at a time goes under, and what you see of its slide is prints',
            'under for ' + diveSecs + 's of every ' + diveEvery + 's');
          const seaC = ['LIGHT', 'DARK', 'WATER', 'PRINT'];
          ok(seaC.every((c) => new RegExp('SeaBoardGame\\.' + c + '\\b').test(xg) && new RegExp('^const ' + c + ' := Color\\(', 'm').test(seaX)),
            '…in the sea board\'s OWN colors, read from sea_board.gd  (a retint there carries over)');

          /* ── a thumb reaches every slot, and none of them is under USE ── */
          const SLOT = num(xg, 'SLOT'), GAP = num(xg, 'SLOT_GAP'), REACH = num(xg, 'REACH');
          const CELL = num(cbX, 'CELL');
          const rBtn = num(padX, 'R_BTN');
          const mar = /const BTN_MARGIN := Vector2\(([\d.]+), ([\d.]+)\)/.exec(padX) || [0, 0, 0];
          const vpW = 1152, phoneW = 352, phoneH = 560;
          const vpH = vpW * phoneH / phoneW, k = vpH / 648;
          const frameW = CELL * 8 + 64, zoom = vpW / frameW, frameH = vpH / zoom;
          const rs = Math.min(2, Math.max(1, k / zoom));
          const useAt = { x: frameW / 2 - (+mar[1]) * k / zoom, y: frameH / 2 - (+mar[2]) * k / zoom }, useR = rBtn * k / zoom;
          const board = { x0: -CELL * 4, y0: -CELL * 4, x1: CELL * 4, y1: CELL * 4 };
          const handY = board.y1 + 20 * rs + 6, skillY = -frameH / 2 + 16 * rs;
          const rects = [];
          for (let i = 0; i < 3; i++) {
            rects.push({ x: board.x0 + i * (SLOT + GAP), y: handY, w: SLOT, h: SLOT, what: 'hand ' + i });
            rects.push({ x: board.x0 + i * (SLOT + GAP), y: skillY, w: SLOT, h: SLOT, what: 'ability ' + i });
          }
          const underUse = rects.filter((r) => Math.hypot(Math.max(r.x, Math.min(useAt.x, r.x + r.w)) - useAt.x,
            Math.max(r.y, Math.min(useAt.y, r.y + r.h)) - useAt.y) < useR).map((r) => r.what);
          const offScreen = rects.filter((r) => r.y < -frameH / 2 || r.y + r.h > frameH / 2 || r.x < -frameW / 2 || r.x + r.w > frameW / 2).map((r) => r.what);
          const thumb = (SLOT + 2 * REACH) * zoom / (vpW / phoneW);
          ok(/return Rect2\(BOARD\.position\.x \+ float\(i\) \* step, y, SLOT, SLOT\)/.test(fnGd(xg, 'slot_rect'))
             && /return Rect2\(BOARD\.end\.x \+ 24\.0, BOARD\.position\.y \+ float\(i\) \* step, SLOT, SLOT\)/.test(fnGd(xg, 'slot_rect'))
             && /_frame\(\)\.position\.y \+ 16\.0 \* TownZone\.read_scale\(self\)/.test(fnGd(xg, 'skill_rect'))
             && /back\.position = RING_AT\n/.test(xg) && underUse.length === 0 && offScreen.length === 0,
            '⛑ on his phone no slot is under the pad\'s USE: the hand is the LEFT of the row, the abilities the corner over the scores',
            underUse.concat(offScreen).join(', ') || 'USE at ' + useAt.x.toFixed(0) + ',' + useAt.y.toFixed(0) + ' r ' + useR.toFixed(0)
              + ' · hand row y ' + handY.toFixed(0) + ' · re-derived at ' + phoneW + 'x' + phoneH);
          ok(thumb >= 44 && /if r\.grow\(REACH\)\.has_point\(w\) and d < best_d:/.test(fnGd(xg, '_nearest_slot')),
            '⚠ …and a slot answers a thumb 44 CSS px across, the nearest middle winning', thumb.toFixed(1) + ' CSS px');
        }

        /* ══ a Blender prop BAKES and throws its viewport away — 2026-09-24 ══ */
        /* his: "yes, go for the bake. We're going grand-scale so we'll want to keep as many MB's available as possible." */
        const pr2 = code(rd('prop_model.gd'));
        ok(/^class_name TownProp\s*\nextends Node$/m.test(pr2) && !/extends SubViewport/.test(pr2),
          '⭐⭐ a prop is a picture, not a live 3D viewport',
          'measured: the town went 168 MB -> 107 MB of video memory, at the same 60 fps and 140 draws');
        const bk = fnGd(pr2, '_bake');
        ok(/ImageTexture\.create_from_image\(_vp\.get_texture\(\)\.get_image\(\)\)/.test(bk)
           && /_vp\.queue_free\(\)/.test(bk) && /_vp = null/.test(bk),
          '…it takes the picture and frees the machinery that drew it');
        /* ⚠⚠ UPDATE_ONCE PUTS ITSELF BACK TO DISABLED once it has drawn, and that is the only
           honest signal the picture exists. Read it early and you get a transparent image and
           no error — a prop that is simply not there. */
        ok(/_vp\.render_target_update_mode == SubViewport\.UPDATE_DISABLED/.test(bk),
          '…and waits for the viewport to say it has drawn, rather than for a frame count');
        /* ⚠⚠ THE PARENT ALREADY DREW WITH THE VIEWPORT'S TEXTURE and that RID is about to die. */
        ok(/var ci := get_parent\(\) as CanvasItem/.test(bk) && /ci\.queue_redraw\(\)/.test(bk),
          '…and repaints whoever drew it, or the prop goes blank the frame it is baked');
        ok(/static var _slot/.test(pr2) && /_slot = \(_slot \+ 1\) % 4/.test(pr2),
          '⚠ the readbacks are spread over four frames  (a GPU stall each, and a room loads many at once)');
        /* ⭐ AND MOVEMENT, ASKED IN THE SAME MESSAGE: *"what if I want it to sway in the wind?"*
           A shear on the baked picture — 0.12 MB and nothing per frame, against 1.47 MB for a
           12-frame baked strip and 28.9 MB for 12 live viewports. All three held 60 fps. */
        ok(/func draw_swayed\(ci: CanvasItem, r: Rect2, lean: float\)/.test(pr2)
           && /ci\.draw_polygon\(/.test(fnGd(pr2, 'draw_swayed')),
          '⭐ …and a baked prop can still sway, because a sway is a shear');
        /* ⚠ ACROSS IS X ALONE (2026-09-30). Framed on max(x, z), his rug — deeper than wide —
           baked with a third of its picture empty either side (284 of 440 px used). */
        ok(/var wide := maxf\(box\.size\.x, 0\.001\)/.test(fnGd(pr2, '_build'))
           && !/maxf\(maxf\(box\.size\.x, box\.size\.z\)/.test(pr2),
          '⚠ …and a prop is framed across on its width alone, not its depth',
          'measured: the rug went from 284 to 540 of 560 px wide');
        /* ⚠ A yaw on the GLB root is never framed — _aabb() stops at the root. */
        ok(/root\.add_child\(model\)/.test(fnGd(pr2, 'make')) && /prop\._build\(root,/.test(pr2),
          '…and a prop turned on the spot is turned inside a holder the framing can see');

        /* ══ the Academy takes you in any order ══ */
        const acad = rd('academy.gd');
        const page = fs.readFileSync(path.join(ROOT, 'academy.md'), 'utf8');
        /* ⚠ WHAT SHIPS, NOT WHAT IS EXPLAINED. */
        const shown = code(acad) + page.replace(/\{%-?\s*comment[\s\S]*?endcomment\s*-?%\}/g, '');
        ok(!/nobody starts in the middle|Start at the first one/i.test(shown),
          '⭐ nothing in the Academy tells you to start at the first lesson',
          'his: "allow them to pick any lesson they wish to (play notation blitz right away, for example)"');
        ok(/None of them is locked/.test(code(acad)) && /nothing here is locked/i.test(page)
           && /<h2 class="ac-h2">The Lessons<\/h2>/.test(page),
          '…and BOTH doors say so — the room in the town and the page on the site',
          'the same sentence lived in two files and only one of them would have been found');
        /* ⚠ THE THIRD CARD WAS THE ONLY ONE WITHOUT A "Start". */
        const l3 = page.slice(page.indexOf('/academy/opening-trainer/'), page.indexOf('</div>', page.indexOf('/academy/opening-trainer/')));
        ok(/ac-lesson-dev/.test(l3) && /ac-lesson-state/.test(l3)
           && /\.ac-lesson-dev \+ \.ac-lesson-state \{ margin-left: 0; \}/.test(page),
          '…and all three cards offer a way in, the third one alongside its In Dev pill');
      }

      /* ══ 40 · EPISODE 1, WALKABLE — the beat player (2026-09-25) ══════════════════════
         His: "I'm going to use the plotline to PJCC to build Checker Town - the Game."
         Scope the same day: Episode 1 end to end, and beats fire on what you already do. */
      {
        const rd = (f) => fs.readFileSync(GDF(f), 'utf8').replace(/\r\n/g, '\n');
        const st = rd('story.gd'), bt = rd('beat.gd');
        const znS = rd('zone.gd'), gsS = rd('game_state.gd');

        /* ⭐⭐ THE ONE LINE THAT IS HIS. It is quoted out of his canon file, so the two copies
           have to agree — a reword in either place is a character speaking somebody else's
           words, and nothing else in this repo would notice. */
        {
          const notes = path.join(ROOT, 'private/_pjcc/notes.md');
          const beats = [...st.matchAll(/^\t\t\t"(.+)",$/gm)].map((m) => m[1]);
          ok(beats.length >= 4, 'the beat table has lines in it', beats.length + '');
          if (fs.existsSync(notes)) {
            const canon = fs.readFileSync(notes, 'utf8');
            /* ⚠ THE WORDS, NOT THE FULL STOP. His notes write it as a bullet with no period
               and the box needs one; every other character is compared as typed. */
            const mono = (beats[0] || '').replace(/\.$/, '');
            ok(mono.length > 40 && canon.includes(mono),
              '⭐⭐ the monologue in the game is HIS line, verbatim from private/_pjcc/notes.md',
              mono ? '"' + mono.slice(0, 48) + '…"' : 'no first line');
          }
          ok(/PLACEHELD/.test(st) && /MEANT TO BE\s+(?:#\s+)?THROWN AWAY/.test(st),
            '⚠⚠ …and every other line says PLACEHELD, so a later session cannot mistake filler for his voice');
        }

        /* ⚠⚠ A TRIGGER WITH NO CONDITION IS A BEAT THAT NEVER FIRES, and it would look
           exactly like a beat he simply has not reached. */
        {
          const ats = [...st.matchAll(/"at": "([a-z]+)"/g)].map((m) => m[1]);
          const handled = [...fnGd(st, 'ready_for').matchAll(/^\t\t"([a-z]+)":$/gm)].map((m) => m[1]);
          const orphan = ats.filter((a) => handled.indexOf(a) < 0);
          ok(ats.length >= 3 && orphan.length === 0,
            'every beat names a trigger that ready_for() actually answers',
            orphan.length ? 'NEVER FIRES: ' + orphan.join(' ') : ats.join(' '));
        }

        /* ⛑⛑ THE RULE HE CHOSE: beats ride alongside, they never gate. If anything but the
           zone's own runner ever asks TownStory a question, something is being withheld. */
        {
          /* ⚠ COMMENTS DON'T COUNT — beat.gd and game_state.gd both NAME the table in prose. */
          const bare = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
          const askers = GD_LIST.filter((f) => f.endsWith('.gd'))
            .filter((f) => f !== 'story.gd' && /TownStory\./.test(bare(rd(f))));
          ok(askers.length === 1 && askers[0] === 'zone.gd',
            '⛑⛑ only zone.gd reads the story — no door, no lesson and no boat asks it for permission',
            askers.join(' ') || 'nobody');
        }

        /* ══ THE OPENING (2026-10-26) ══ His: "At the very beginning, you have two dogs, Milo and Argus.  You need to
           find princess - she's north of the assembly and you need to move the symbols around to spell Access (using
           c-shapes for the c's, e's, and s's).   You find her in a crater, staring up at the moon." */
        {
          const bareO = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
          const dogO = rd('dog.gd'), homeO = rd('home.gd'), twnO = rd('town.gd'), panO = rd('access_panel.gd');
          const stnO = rd('access_stones.gd'), herO = rd('crater_princess.gd'), moonO = rd('moon_view.gd'), ssO = rd('state_story.gd');
          ok(/if who_ != "Princess" and not GameState\.story\.found\("princess"\):\s*\n\s*return true/.test(fnGd(dogO, 'indoors'))
             && /if who == "Princess" and not GameState\.story\.found\("princess"\):\s*\n\s*return false/.test(fnGd(dogO, '_on_duty'))
             && /func _princess\(\) -> TownDog:\s*\n(?:\s*#[^\n]*\n)*\s*if not GameState\.story\.found\("princess"\):\s*\n\s*return null/.test(homeO)
             && /"at": "missing",\s*\n\s*"where": "res:\/\/rooms\/home\.tscn"/.test(st)
             && /"missing":\s*\n\s*return not GameState\.story\.found\("princess"\)/.test(fnGd(st, 'ready_for')),
            '⭐ the game begins with Milo and Argus at home and Princess missing  (his): she is nowhere, not even at the board at home, until she is found');
          const loadO = fnGd(gsS, 'load_state');
          ok(/if typeof\(parsed\) != TYPE_DICTIONARY:[\s\S]*?story\.told\["new:opening"\] = 1\s*\n\s*return/.test(loadO)
             && /if not story\.told\.has\("new:opening"\):\s*\n\s*for k in \["find:princess", "find:access", "ep1-found"\]:\s*\n\s*story\.told\[k\] = 1/.test(loadO)
             && /if their_told\.has\("ep1-arrive"\) and not their_told\.has\("new:opening"\):\s*\n\s*for k in \["find:princess", "find:access", "ep1-found"\]:/.test(fnGd(gsS, 'merge_in')),
            '⚠⚠ …a NEW game, that is: a save from before keeps her, and never sees her close-up for a find nobody made — loaded here, or pulled down from the site onto a device with no save of its own',
            'nobody\'s dog goes missing because the game changed');
          const word = (/const WORD := "(\w+)"/.exec(panO) || [])[1], start = (/const START := "(\w+)"/.exec(panO) || [])[1];
          const letters = (w) => (w || '').split('').sort().join('');
          const gl = fnGd(panO, 'glyph');
          const cut = (L) => (new RegExp('\\t\\t"' + L + '":\\n([\\s\\S]*?)(?=\\n\\t\\t"|$)').exec(gl) || [])[1] || '';
          ok(word === 'ACCESS' && !!start && start !== word && letters(start) === letters(word)
             && ['C', 'E', 'S'].every((L) => /draw_arc\(/.test(cut(L))) && (cut('S').match(/draw_arc\(/g) || []).length === 2
             && /draw_line\(/.test(cut('E')) && !/draw_line\(/.test(cut('C')),
            '⭐ the stones north of the Assembly are moved around to spell ACCESS  (his), every C, E and S cut from c-shapes: a C is one, an E one with a bar, an S two',
            (start || 'no START') + ' → ' + (word || 'no WORD'));
          ok(/if read\(\) == WORD:\s*\n\s*_done = 0\.0\s*\n\s*solved\.emit\(\)/.test(fnGd(panO, '_press'))
             && /GameState\.story\.find\("access"\)/.test(fnGd(stnO, '_solved')) && /town\.call\("open_crater"\)/.test(fnGd(stnO, '_solved'))
             && /_set_open\(GameState\.story\.found\("access"\)\)/.test(fnGd(stnO, '_ready_extra'))
             && /if str\(\(row as Dictionary\)\["to"\]\) == "crater" and not GameState\.story\.found\("access"\):\s*\n\s*continue/.test(fnGd(twnO, '_furnish_seams')),
            '⭐ …and only then is there a way to the crater: the slab stands aside and the seam is there, no reload',
            'until then the slab is solid, wall to wall in the gap in the north fence');
          ok(/_shut\.pressed\.connect\(_close\)/.test(panO) && /elif event\.is_action_pressed\("ui_cancel"\):/.test(fnGd(panO, '_take'))
             && /_cell = clampf\([^\n]*, TownUI\.finger\(self\) \/ 0\.92, /.test(fnGd(panO, '_layout')),
            '⛑ …and on a phone every stone is a thumb wide, and you can walk away from them unsolved: Esc, the pad\'s B, and a Close for the phone, which has neither',
            'the Close asks TownUI.finger() too, so the file-wide button check cannot see the stones shrink');
          const CRATER_LINE = 'You find her in a crater, staring up at the moon.';
          const fnd = (/\{\s*\n\s*"id": "ep1-found",([\s\S]*?)\n\t\},/.exec(st) || [])[1] || '';
          ok(fnd.includes('"' + CRATER_LINE + '"') && /"view": "moon"/.test(fnd) && /"where": "res:\/\/town\/town\.tscn"/.test(fnd)
             && /"found":\s*\n\s*return GameState\.story\.found\("princess"\)/.test(fnGd(st, 'ready_for')),
            '⭐⭐ "' + CRATER_LINE + '"  — HIS, verbatim, on the moon up close the moment you find her',
            fnd ? 'ep1-found' : 'no ep1-found row');
          ok(/if _view == "moon":[\s\S]*?MoonView\.open\(get_parent\(\), [^\n]*\)\.closed\.connect\(_finish\)/.test(fnGd(bt, '_ready'))
             && /found_one\.emit\(id\)/.test(fnGd(ssO, 'find')) && /GameState\.story\.found_one\.connect\(/.test(znS)
             && /GameState\.story\.find\("princess"\)/.test(fnGd(herO, 'interact')) && !/TownStory|MoonView/.test(bareO(herO)),
            '⚠⚠ …through the zone\'s own runner: finding her is all the crater does; the runner hears it and plays that beat on its picture, told when it shuts',
            'a crater that opened the picture itself would read the story table, and a beat that never fired would look like one not reached');
          ok(/TownDog\.paint_sitting\(_art, "Princess", [^\n]*, false, [\d.]+\)/.test(moonO)
             && /deg_to_rad\(-20\.0\) if tilt else deg_to_rad\(-look_up\)/.test(dogO),
            '⚠ …her head up with her eyes OPEN: staring at the moon, which is not the tilt (that stays canon and unshown)');
        }

        /* ══ THE TABLE IN THE TOWN (2026-10-26) ══ His: "Start with number 10" — Route B, decided 2026-10-11: "the
           board drawn in Godot, Stockfish beside it", the rules "ported once and held to the same tests the site's
           referee passes". The rules' own test is the game's tests/chess.sh (perft, and a corpus the site's referee
           writes, answered position for position); this holds the seams around them. */
        {
          const chT = rd('state_challenge.gd'), tabT = rd('chess_table.gd'), brT = rd('table_brain.gd');
          const aiT = rd('chess_ai.gd'), ruT = rd('chess_rules.gd'), znT = rd('zone.gd'), drT = rd('dev_referee.gd');
          const corpus = fs.existsSync(path.join(GD, 'tests/chess_corpus.js')) ? fs.readFileSync(path.join(GD, 'tests/chess_corpus.js'), 'utf8') : '';
          const suiteT = fs.existsSync(path.join(GD, 'tests/suite.sh')) ? fs.readFileSync(path.join(GD, 'tests/suite.sh'), 'utf8') : '';
          ok(/require\(path\.join\(SITE, 'assets\/js\/pjcc-chess\.js'\)\)/.test(corpus) && /bash "\$S\/chess\.sh"/.test(suiteT)
             && /static func legal_moves\(S: Dictionary\) -> Array:/.test(ruT) && /static func to_san\(S: Dictionary, m: Dictionary\) -> String:/.test(ruT)
             && /static func pos_key\(S: Dictionary\) -> String:/.test(ruT),
            '⭐⭐ the town has its own rules now (games/chess/chess_rules.gd), held to the site\'s referee by the game\'s tests/chess.sh, which its suite runs  (his: Route B)',
            'a corpus the site\'s pjcc-chess.js writes: legal moves, SAN, every move\'s outcome, check, results, repetition keys');
          const sitT = fnGd(chT, 'sit_down');
          ok(/begin_challenge\(who, key, cost\)\s*\n\s*table_wanted\.emit\(\)\s*\n\s*return ""/.test(sitT) && !/TABLE_URL/.test(chT)
             && !/open_url/.test(sitT + fnGd(chT, 'sit_study'))
             && /table_wanted\.emit\(\)\s*\n\s*return ""/.test(fnGd(chT, 'sit_study')),
            '⭐ sitting down opens the table in the town, a game or a study: no tab and no site, the errand written first',
            'a game walked out of half-played is still pending, and opens again where it was');
          ok(/GameState\.challenge\.table_wanted\.connect\(_open_table\)/.test(znT)
             && /if bool\(GameState\.challenge\.pending\.get\("table", false\)\):\s*\n\s*_open_table\(\)/.test(znT)
             && /ChessTable\.open\(self, GameState\.challenge\.pending\)/.test(fnGd(znT, '_open_table'))
             && /if n != self:\s*\n\s*other = true/.test(fnGd(tabT, '_process')),
            '…the zone opens it off the signal, and again on the way in while the errand stands, under any cover already up');
          ok(/if pending\.is_empty\(\) or bool\(pending\.get\("table", false\)\) or not OS\.has_feature\("web"\):/.test(fnGd(chT, 'poll_challenge'))
             && /not bool\(GameState\.challenge\.pending\.get\("table", false\)\)/.test(drT),
            '⚠ …and nothing else answers it: the site\'s poll and the editor\'s W/L keys are for an errand from before the table');
          const doneT = fnGd(chT, 'table_done');
          ok(/var slot := resolve_challenge\(won, clean\)/.test(doneT)
             && /if won and clean and not study and took > 0:\s*\n\s*GameState\.money\.pay_captures\(took\)/.test(doneT)
             && /GameState\.challenge\.table_done\(_goal_met\(\), tb_used == 0, _took\(\)\)/.test(fnGd(tabT, '_close'))
             && /if not study\.is_empty\(\) and str\(study\.get\("goal", ""\)\) == "draw":\s*\n\s*return result == "1\/2-1\/2" or _won\(\)/.test(fnGd(tabT, '_goal_met')),
            '⭐ the result settles the errand the one way a result ever has (resolve_challenge): a takeback is not clean, a study scores by its own goal, captures pay on a clean win',
            'the Philidor\'s held draw is its win');
          ok(/GameState\.body\.refund\(cost\)/.test(fnGd(chT, 'stand_up')) && /GameState\.challenge\.stand_up\(\)/.test(fnGd(tabT, '_leave'))
             && /if phase != SETUP:\s*\n\s*return/.test(fnGd(tabT, '_leave')),
            '…and up from the table before a move costs nothing: the energy comes back');
          ok(/var m := ChessRules\.from_uci\(S, uci\)\s*\n\s*if m\.is_empty\(\):\s*\n\s*_brain\.think\([^\n]*, true\)\s*\n\s*return/.test(fnGd(tabT, '_on_moved')),
            '⛑⛑ ENGINE PROPOSES, REFEREE DISPOSES: their move is played only if the table\'s own rules find it, and one they do not is handed to the stand-in');
          ok(/const TAKEBACKS := 1/.test(tabT) && /if phase != PLAY or result != "" or tb_used >= TAKEBACKS/.test(fnGd(tabT, '_takeback'))
             && /_end\("0-1" if turn == "w" else "1-0"/.test(fnGd(tabT, '_process'))
             && /left\[turn\] = maxf\(0\.0, float\(left\[turn\]\) - minf\(delta, 0\.25\) \* 1000\.0\)/.test(fnGd(tabT, '_process')),
            '…one takeback a game, as at the Park Tables, and a flag is a loss  (his: "flagging is a loss")',
            '⚠ and a pause is nobody\'s time: a frame charges a quarter second at most, so the first one back from a hidden tab or the program\'s menu cannot flag you');
          const canonT = fs.readFileSync(path.join(ROOT, '_sass/_pjcc-22-chess-canon.scss'), 'utf8');
          const tokT = (n) => ((new RegExp('--' + n + ':\\s*(#[0-9a-fA-F]{6})').exec(canonT) || [])[1] || '').toLowerCase();
          const gdcT = (n) => ((new RegExp('const ' + n + ' := Color\\("([0-9a-fA-F]{6})"\\)').exec(tabT) || [])[1] || '').toLowerCase();
          ok(tokT('chess-lt') === '#' + gdcT('LT') && tokT('chess-dk') === '#' + gdcT('DK') && tokT('chess-frame') === '#' + gdcT('FRAME')
             && /const MINT := Color\("6bffb8"\)/.test(tabT) && /const LAST := Color\(0\.961, 0\.773, 0\.094, 0\.42\)/.test(tabT),
            '⭐ the board is the Park Tables\' own: the woods, the frame, the gold last move, the mint ring  (his: "every new board defaults to Park Table Default")',
            gdcT('LT') + ' ' + gdcT('DK') + ' ' + gdcT('FRAME'));
          const engT = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-gauntlet-engine.js'), 'utf8');
          const rowsJ = [...engT.matchAll(/^\s*\[\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+),\s*([\d.]+),\s*(\d+),\s*([\d.]+),/gm)].map((m) => m.slice(1, 8).map(Number).join(','));
          const rowsG = [...aiT.matchAll(/^\t\[(\d+), (\d+), (\d+), ([\d.]+), ([\d.]+), (\d+), ([\d.]+),/gm)].map((m) => m.slice(1, 8).map(Number).join(','));
          ok(rowsJ.length === 12 && rowsJ.join(' ') === rowsG.join(' ')
             && /\[350, 2, 220, [^\n]*\{ "blunder": 0\.05 \}\]/.test(aiT) && /\[400, 2, 160, [^\n]*\{ "never_castle": true \}\]/.test(aiT),
            '⭐ off the web the stand-in plays the site\'s measured ladder under 1400, row for row, Maxwell refusing to castle',
            rowsG.length + ' rows');
          const ctpT = fs.readFileSync(path.join(ROOT, 'games/checker-town/index.html'), 'utf8');
          const atT = (f) => ctpT.indexOf("/assets/js/" + f + "'");
          ok(atT('pjcc-towntable.js') > atT('pjcc-gauntlet-engine.js') && atT('pjcc-towntable.js') > atT('pjcc-adapt.js')
             && atT('pjcc-systems.js') > 0 && atT('pjcc-systems.js') < atT('pjcc-towntable.js')
             && /"movetime":\{\{ r\.movetime \| default: 0 \}\},"adaptive":\{\{ r\.adaptive \| default: false \}\}/.test(ctpT)
             && /window\.parent\.PJCCTownTable/.test(brT),
            '⭐ on the web the site\'s own brain plays the regular: the page loads the door after the referee, the engine, the systems and the dial, and hands it each seat\'s pace');
          const ttT = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-towntable.js'), 'utf8');
          const ptThinkT = (PT.match(/function botThinkFor\(b, st, S\)\{[\s\S]*?\n  \}/) || [''])[0];
          const keyT = ['Math.min(base * 2.5, left / 8)', 'Math.min(base, left / 30)', 'Math.max(150, Math.floor(Math.min(want, left - 800)))', '(n >= 2 && n <= 4)'];
          const cpP = /var CP_LOSING = (-?\d+);[\s\S]*?var CP_SWING\s+= (-?\d+);/.exec(PT), cpD = /var CP_LOSING = (-?\d+);[\s\S]*?var CP_SWING\s+= (-?\d+);/.exec(ttT);
          ok(keyT.every((l) => ptThinkT.includes(l) && ttT.includes(l)) && !!cpP && !!cpD && cpP[1] === cpD[1] && cpP[2] === cpD[2]
             && /if \(persona\) \{ persona\.timeMs = ms; return \{ persona: persona, negamax: true, movetime: ms \}; \}/.test(ttT),
            '⚠ …and its dial and its pacing are the Park Tables\' own (botDial, botThinkFor), word for word where they decide',
            cpD ? cpD[1] + ' / ' + cpD[2] : 'no constants');
          /* ⭐ OFF THE WEB, STOCKFISH BESIDE THE GAME  (his, 2026-10-28: "yes, go ahead and build that brain") */
          const uciT = rd('uci_engine.gd'), paceT = rd('table_pace.gd'), parkT = rd('park.gd'), ladT = rd('state_ladder.gd');
          const gdTxt = (f) => (fs.existsSync(path.join(GD, f)) ? fs.readFileSync(path.join(GD, f), 'utf8').replace(/\r\n/g, '\n') : '');
          const getT = gdTxt('tests/get_stockfish.py'), mkT = gdTxt('tests/mkprobe.py'), ignT = gdTxt('.gitignore');
          const exeName = (/const BINARY := \{ "Windows": "([\w.-]+)" \}/.exec(uciT) || [])[1] || '';
          const thinkB = fnGd(brT, 'think');
          const atB = (t) => thinkB.indexOf(t);
          ok(atB('if _web and not stand_in:') >= 0
             && atB('if _web and not stand_in:') < atB('if not _web and not stand_in and elo >= ENGINE_FROM and _sf != null:')
             && atB('if not _web and not stand_in and elo >= ENGINE_FROM and _sf != null:') < atB('var persona := ChessAI.persona_for_elo(elo)')
             && /const ENGINE_FROM := 1400/.test(brT) && /if \(elo >= 1400\) return null;/.test(engT)
             && /if _web or elo < ENGINE_FROM or UciEngine\.path\(\) == "":\s*\n\t\treturn/.test(fnGd(brT, 'warm'))
             && /_brain\.moved\.connect\(_on_moved\)\s*\n\t_brain\.warm\(_seat_elo\(\)\)/.test(tabT),
            '⭐⭐ off the web the regular from 1400 up is Stockfish beside the game  (his 10-28: "go ahead and build that brain"): the web brain first, then Stockfish, then the stand-in under 1400 or with none',
            'started when the table opens, so it is ready by the first move');
          ok(/elif w\[0\] == "uciok":\s*\n\t\t_send\("setoption name UCI_LimitStrength value true"\)/.test(fnGd(uciT, '_line'))
             && /if l\.begins_with\("option name UCI_Elo "\):/.test(fnGd(uciT, '_line'))
             && /var e := clampi\(int\(_want\["elo"\]\), elo_min, elo_max\)/.test(fnGd(uciT, '_search'))
             && /_send\("setoption name UCI_Elo value %d" % e\)/.test(fnGd(uciT, '_search'))
             && /_send\("go movetime %d" % maxi\(50, int\(_want\["ms"\]\)\)\)/.test(fnGd(uciT, '_search')),
            '…at the seat\'s rating as Stockfish itself measures one (UCI_Elo), held inside the range it reports, for the seat\'s time');
          ok(/elif _sf\.state == UciEngine\.DEAD or Time\.get_ticks_msec\(\) > _sf_until:\s*\n(?:\t+#[^\n]*\n)?\t+_sf\.halt\(\)\s*\n\t+_sf_gen = -1\s*\n\t+answered_by = "stockfish"\s*\n\t+moved\.emit\(""\)/.test(fnGd(brT, '_process'))
             && /if _searching and Time\.get_ticks_msec\(\) - _looked_at > 500:/.test(fnGd(uciT, 'poll'))
             && /if not OS\.is_process_running\(_pid\):\s*\n\t+quit\(\)/.test(fnGd(uciT, 'poll'))
             && /if _stale > 0:\s*\n\t+_stale -= 1\s*\n\t+return/.test(fnGd(uciT, '_line'))
             && /_send\("stop"\)\s*\n\t+_stale \+= 1/.test(fnGd(uciT, 'halt'))
             && /if _sf != null:\s*\n\t\t_sf\.halt\(\)/.test(fnGd(brT, 'stop')),
            '⛑ …and one that dies or goes quiet hands its move to the stand-in, never a hang: a stopped search\'s answer is dropped, and a dead one is noticed within half a second');
          ok(/if _sf != null:\s*\n\t\t_sf\.quit\(\)/.test(fnGd(brT, '_exit_tree'))
             && /_send\("quit"\)\s*\n\t\t_pipe\.close\(\)/.test(fnGd(uciT, 'quit'))
             && /if OS\.is_process_running\(_pid\):\s*\n\t\t\tOS\.kill\(_pid\)/.test(fnGd(uciT, 'quit'))
             && /_boot\.start\(func\(\) -> Dictionary: return OS\.execute_with_pipe\(p, PackedStringArray\(\), false\)\)/.test(fnGd(uciT, 'start')),
            '⛑⛑ …started on a thread (its first launch ever is a virus scan of 100 MB), read without waiting, and gone when its table goes: told to quit, its input closed, killed if it lingers');
          ok(/var own := OS\.get_environment\("CT_STOCKFISH"\)\s*\n\tif own != "":\s*\n\t\treturn own if FileAccess\.file_exists\(own\) else ""/.test(fnGd(uciT, 'path'))
             && /for dir in \[OS\.get_executable_path\(\)\.get_base_dir\(\), ProjectSettings\.globalize_path\("res:\/\/"\)\]:/.test(fnGd(uciT, 'path'))
             && /\.path_join\("engine\/stockfish"\)/.test(fnGd(uciT, 'path')) && exeName !== '',
            '…found beside a native build\'s .exe, or in the project for the editor, or where CT_STOCKFISH says; with none the stand-in plays',
            exeName);
          const shaG = (/SHA256 = "([0-9a-f]{64})"/.exec(getT) || [])[1] || '';
          const assetG = (/ASSET = "([\w.-]+)"/.exec(getT) || [])[1] || '';
          ok(fs.existsSync(path.join(GD, 'engine/.gdignore')) && /^\/engine\/stockfish\/$/m.test(ignT)
             && shaG.length === 64 && /if h != SHA256:\s*\n\s*sys\.exit\("REFUSED/.test(getT)
             && /not i\.filename\.startswith\("stockfish\/"\) or "\.\." in i\.filename\.split\("\/"\)/.test(getT)
             && assetG.replace(/\.zip$/, '') + '.exe' === exeName && /SKIP_DIRS = \{[^}]*"engine"[^}]*\}/.test(mkT)
             && fs.statSync(path.join(ROOT, 'assets/games/checker-town/index.pck')).size < 20 * 1048576,
            '⛑⛑ …and never part of the game: engine/.gdignore keeps it out of every .pck (the web build stays 2 MB, not 100), git never carries it, and tests/get_stockfish.py fetches the release whole, its source and GPL beside it, refusing it unless its SHA-256 matches',
            assetG + ' ' + shaG.slice(0, 12));
          const seatMs = [...parkT.matchAll(/\{ "key": "([a-z]+)",[^\n]*"ms": (\d+)/g)].map((m) => [m[1], +m[2]]);
          const ceoMs = +((/const CEO_MS := (\d+)/.exec(ladT) || [])[1] || 0);
          const ymlMs = {};
          for (const chunk of yml.split(/\n- key:/).slice(1)) {
            const mt = /\n\s+movetime:\s*(\d+)/.exec('\n' + chunk);
            if (mt) ymlMs[chunk.trim().split(/\s/)[0]] = +mt[1];
          }
          const msOff = seatMs.concat([['ceo', ceoMs]]).filter(([k, ms]) => ymlMs[k] !== ms);
          ok(seatMs.length === 9 && msOff.length === 0 && /return int\(\(row as Dictionary\)\.get\("ms", 400\)\)/.test(fnGd(ladT, 'seat_ms')),
            '…each seat thinking at its own pace off the web: the bench\'s movetime to the millisecond, the CEO\'s included',
            msOff.map((r) => r.join(' ')).join(', ') || seatMs.length + ' seats and the CEO');
          const keyG = ['minf(base * 2.5, left / 8.0)', 'minf(base, left / 30.0)', 'maxi(150, int(floor(minf(want, left - 800.0))))', '(n >= 2 and n <= 4)'];
          const cpG = /const CP_LOSING := (-?\d+)[\s\S]*?const CP_SWING := (-?\d+)/.exec(paceT);
          ok(keyG.every((l) => paceT.includes(l)) && !!cpG && !!cpD && cpG[1] === cpD[1] && cpG[2] === cpD[2]
             && /ChessRules\.in_check\(S, str\(S\.turn\)\)/.test(paceT)
             && /var ms := TablePace\.ms\(GameState\.ladder\.seat_ms\(key\), S, clock, _cps\)/.test(brT)
             && /if _sf\.score\(\) != null:\s*\n\t+_cps\.append\(int\(_sf\.score\(\)\)\)/.test(fnGd(brT, '_process')),
            '…for as long as the site\'s thinkFor says: the same pace, thirtieth, 2.5 times and eighth, the same two pawns down and the same swing, off its own scores',
            cpG ? cpG[1] + ' / ' + cpG[2] : 'no constants');
          ok(/bash "\$S\/engine\.sh"/.test(suiteT) && /\btablesf\b/.test(suiteT) && /\btablesfnone\b/.test(suiteT),
            '…and the suite plays it: engine.sh against the real Stockfish (every pace branch, a mate in one, a stopped search, nothing left running), and a game at Robert\'s table with it and without it');
          /* ⭐ THE STANDALONE WINDOWS BUILD  (his, 2026-10-28: "build a standalone windows build") */
          const presetT = gdTxt('export_presets.cfg'), projT = gdTxt('project.godot');
          const winP = (/\[preset\.\d+\]\n\nname="Windows Desktop"[\s\S]*?(?=\n\[preset\.\d+\]\n|$)/.exec(presetT) || [''])[0];
          const wdS = rd('state_worlds.gd'), znS2 = rd('zone.gd'), pcS = rd('puzzle_champ.gd'), gsS2 = rd('game_state.gd');
          const expT = gdTxt('tests/export_windows.sh'), tplT = gdTxt('tests/get_templates.py'), saT = gdTxt('tests/standalone.sh');
          ok(/platform="Windows Desktop"/.test(winP) && /custom_features="standalone"/.test(winP)
             && /include_filter="people\/lines\/\*\.txt"/.test(winP) && /binary_format\/architecture="x86_64"/.test(winP)
             && /^\[preset\.0\]\n\nname="Web"/.test(presetT) && /'--export-release', 'Web'/.test(fs.readFileSync(path.join(ROOT, 'tests/gen-checkertown.js'), 'utf8')),
            '⭐⭐ the standalone Windows build  (his 10-28): its own preset, marked "standalone", carrying everybody\'s lines, beside the Web one the site builds by name',
            'a preset without people/lines/*.txt ships a town where nobody says anything');
          ok(/static func no_site\(\) -> bool:\s*\n\treturn OS\.has_feature\("standalone"\)/.test(wdS)
             && /return LATER\.has\(at\) or \(no_site\(\) and at\.begins_with\("\/"\)\)/.test(fnGd(wdS, 'later'))
             && /if no_site\(\):\s*\n\t\treturn true/.test(fnGd(wdS, 'later_game'))
             && /if GameState\.worlds\.later\(GameState\.challenge\.PUZZLE_URL\) and not GameState\.challenge\.island_open:/.test(fnGd(pcS, 'menu'))
             && /return GAMES\.has\(the_game\) and GameState\.worlds\.later\(str\(GAMES\[the_game\]\["url"\]\)\)/.test(fnGd(rd('portal.gd'), 'ring_later'))
             && /TownPortal\.paint\(self, o \+ Vector2\(cell \* 2\.0, cell \* 2\.0\), cell, TownPortal\.ring_later\("dungeon"\)\)/.test(rd('home.gd'))
             && /TownPortal\.paint\(_art, _board\.get_center\(\), c \* 1\.25, TownPortal\.ring_later\("dungeon"\)\)/.test(rd('board_view.gd')),
            '⛑ …where there is no site, so every site page is later: its door says Building and its square is not asked, and the CEO waits on the squares won at the tables  (as Wes\'s was in the desktop program)',
            'the puzzle run too, and the ring at home is drawn shut by the board that paints it');
          ok(/if not OS\.has_feature\("web"\) and not GameState\.worlds\.no_site\(\):\s*\n\t\tadd_child\(DevReferee\.new\(\)\)/.test(znS2)
             && /if worlds\.no_site\(\):\s*\n\t\tget_tree\(\)\.root\.title = "Checker Town"/.test(fnGd(gsS2, '_ready'))
             && /config\/name="CheckerTown"/.test(projT),
            '⛑⛑ …with no referee keys in it (W / L would settle a game nobody played), and its own name on the window while config/name keeps the save\'s folder');
          ok(/^boot_splash\/show_image=false$/m.test(projT) && /^boot_splash\/bg_color=Color\(0\.08627451, 0\.047058824, 0\.2, 1\)$/m.test(projT)
             && /^window\/size\/mode\.standalone=2$/m.test(projT),
            '…opening maximized, and with the site\'s own purple behind it at boot instead of Godot\'s logo  (his 09-09: "does it HAVE to show Godot loading screen")',
            '#160c33, the loading screen\'s');
          ok(/--export-release "Windows Desktop"/.test(expT) && /cp -r "\$SF" "\$NEW\/engine\/"/.test(expT)
             && /OUT="\$\{1:-\/c\/Users\/Nate\/Documents\/checker-town-windows\}"/.test(expT)
             && /mv "\$OUT" "\$OUT\.old" 2>\/dev\/null \|\| \{/.test(expT) && /timeout -k 5/.test(expT)
             && /if h\.hexdigest\(\) != SHA256:\s*\n\s*sys\.exit\("REFUSED/.test(tplT) && /KEEP = \["windows_release_x86_64\.exe"/.test(tplT),
            '…made by tests/export_windows.sh: outside every repo, Stockfish copied beside the .exe, built aside and swapped in, and never over one that is open (its templates fetched by digest, Windows only)');
          ok(/bash "\$S\/standalone\.sh"/.test(suiteT) && /export_windows\.sh" "\$OUT" "\$S\/probes\/town"/.test(saT)
             && /grep -q 'config\/name="CheckerTownProbe"'/.test(saT)
             && ['title:Checker Town', 'referee:0', 'useat:640,950;bubble:Building. Not open to visitors.', 'jrows:The CEO is waiting in the far chair', 'brainis:stockfish', 'sfgone'].every((t) => saT.includes(t))
             && /referee:1/.test((/^  later\) SEQ="[^\n]*/m.exec(rd('tests/cases.sh')) || [''])[0]),
            '…and the suite plays the build itself: the probe copy exported with the same preset (its save, never his) and a game run inside the .exe, Stockfish found beside it');
          /* ⭐ THE DOOR ITSELF, run in node with the site's own referee, negamax, engine bridge, systems and dial */
          const rowsY = [];
          for (const chunk of yml.split(/\n- key:/).slice(1)) {
            /* ⚠ THE FILE ENDS ITS LINES IN CRLF: a value read to the end of the line keeps the CR, and "london" + CR is no system */
            const g = (k) => (new RegExp('\\n\\s+' + k + ':\\s*"?([^"\\r\\n]*)"?')).exec('\n' + chunk);
            rowsY.push({ key: chunk.trim().split(/\s/)[0], name: (g('name') || [])[1], elo: +((g('elo') || [])[1] || 0),
              sys_w: (g('sys_w') || [, ''])[1], sys_b: (g('sys_b') || [, ''])[1], movetime: +((g('movetime') || [])[1] || 0),
              adaptive: (g('adaptive') || [])[1] === 'true' });
          }
          const W2 = { _s: {} };
          const sbT = { localStorage: { getItem: (k) => W2._s[k] || null, setItem: (k, v) => { W2._s[k] = String(v); } },
            document: { getElementById: (id) => (id === 'ct-facts-data' ? { textContent: JSON.stringify(rowsY) } : null) } };
          sbT.window = sbT;
          for (const f of ['pjcc-chess.js', 'pjcc-chess-ai.js', 'pjcc-gauntlet-engine.js', 'pjcc-systems.js', 'pjcc-adapt.js', 'pjcc-towntable.js']) {
            new Function('self', 'window', 'module', 'document', 'localStorage', fs.readFileSync(path.join(ROOT, 'assets/js', f), 'utf8'))(
              sbT, sbT, undefined, sbT.document, sbT.localStorage);
          }
          const TT = sbT.PJCCTownTable, CT = sbT.PJCCChess;
          const takeT = async (tok, ms) => {
            const t0 = Date.now();
            for (;;) {
              const r = TT.take(tok);
              if (r) return { r: JSON.parse(r), ms: Date.now() - t0 };
              if (Date.now() - t0 > ms) return null;
              await new Promise((res) => setTimeout(res, 15));
            }
          };
          const b0 = TT && TT.begin('maxwell');
          const a1 = TT ? await takeT(TT.think(JSON.stringify({ key: 'maxwell', fen0: CT.START_FEN, moves: '', clock: null, study: false })), 6000) : null;
          const fenS = '6k1/5ppp/8/8/8/8/1r6/R5K1 b - - 0 1';
          const a2 = TT ? await takeT(TT.think(JSON.stringify({ key: 'maxwell', fen0: fenS, moves: '', clock: null, study: true })), 9000) : null;
          const S2 = CT.parseFEN(fenS);
          const legal2 = !!(a2 && a2.r.uci && CT.findMove(S2, CT.sqFromName(a2.r.uci.slice(0, 2)), CT.sqFromName(a2.r.uci.slice(2, 4)), a2.r.uci[4] || null));
          if (TT) TT.finish(JSON.stringify({ key: 'maxwell', side: 'w', result: '1-0', moves: 'e2e4 e7e5', clean: true, study: false }));
          const beatenT = JSON.parse(W2._s['pjcc.pt.beaten.v1'] || '[]'), starsT = JSON.parse(W2._s['pjcc.pt.stars.v1'] || '{}');
          const gamesT = JSON.parse(W2._s['pjcc.pt.games.v1'] || '{}');
          const beforeT = JSON.stringify(W2._s);
          if (TT) TT.finish(JSON.stringify({ key: 'crockett', side: 'w', result: '1-0', moves: '', clean: true, study: true }));
          const studyWrote = JSON.stringify(W2._s) !== beforeT;
          if (TT) { TT.begin('auston'); TT.finish(JSON.stringify({ key: 'auston', side: 'b', result: '1-0', moves: 'e2e4', clean: true, study: false })); }
          const seedT = JSON.parse(W2._s['pjcc.adapt.v1'] || '{}');
          ok(b0 === 'ok' && !!a1 && a1.r.uci === 'd2d4' && a1.r.sys === true && a1.ms >= 100,
            '⭐ the door: Maxwell as White opens his London, d2d4, out of his own system and not in the same breath',
            a1 ? a1.r.uci + ' in ' + a1.ms + 'ms' : 'no answer');
          ok(!!a2 && legal2 && a2.r.sys === false,
            '…a study is no setup: the engine answers, and what it answers is legal', a2 ? a2.r.uci : 'no answer');
          ok(beatenT.includes('maxwell') && starsT.maxwell && starsT.maxwell.w === 'full' && gamesT.maxwell && gamesT.maxwell.moves === 'e2e4 e7e5'
             && !W2._s['pjcc.pt.last.v1'],
            '⭐ …and a win at the town\'s table leaves the site\'s own records: the beaten list, the full star for that color, the game for the replay door, never the result stamp the town polls');
          ok(!studyWrote && typeof seedT.auston === 'number',
            '…a study leaves none of them, and Auston keeps where she settled for next time');
        }

        /* ══ THE TEN WAYS, HIS PICKS (2026-10-26) ══ His: "let's do 1, 2, 4, 5 (each character their own narrator), 6, 7
           …, 8, 9, and 10 … Also, fix number 4 on the skeptic list regarding touch support." */
        {
          const padW = rd('pad.gd'), tpW = rd('touch_pad.gd'), homeW = rd('home.gd'), linW = rd('lines.gd');
          const npcW = rd('npc.gd'), beatW = rd('beat.gd'), uiW = rd('town_ui.gd'), stW = rd('story.gd'), znW = rd('zone.gd');
          const papRaw = rd('paper.gd');
          /* ── 9, and the skeptic's 4: the hints follow the hand in use ── */
          const inW = fnGd(padW, '_input');
          ok(/var touching := false/.test(padW) && /var hand_known := false/.test(padW)
             && /if event is InputEventScreenTouch or event is InputEventScreenDrag:\s*\n\s*finger = 1/.test(inW)
             && /event\.device != InputEvent\.DEVICE_ID_EMULATION/.test(inW)
             && /if finger != 0 and \(not hand_known or touching != \(finger == 1\)\):\s*\n\s*hand_known = true\s*\n\s*touching = finger == 1\s*\n\s*changed\.emit\(\)/.test(inW)
             && /if Pad\.hand_known:\s*\n\s*return Pad\.touching/.test(fnGd(tpW, 'probably_touch')),
            '⭐ the hints follow the hand in use  (his #9, the skeptic\'s #4): a PC with a touchscreen being typed on is a keyboard, and a finger is a finger the moment it touches',
            'the device\'s own guess stands only until anything is pressed; a mouse Godot copied from a finger is the finger');
          ok(/return _seen_touch and not \(Pad\.hand_known and not Pad\.touching\)/.test(fnGd(tpW, '_shown'))
             && /if not _shown\(\):\s*\n\s*return/.test(fnGd(tpW, '_paint')) && /return _shown\(\)/.test(fnGd(tpW, 'seen_touch'))
             && /Pad\.changed\.connect\(func\(\) -> void: _draw\.queue_redraw\(\)\)/.test(tpW),
            '…and the thumb pad goes away when the keys take over, and comes back with the next touch');
          ok(/if GameState\.body\.gear == "skates":\s*\n\s*say\("They roll on the roads and the trail\. Grass, dirt and gravel hold them back\."/.test(homeW),
            '⭐ where the skates go on, one line says where they roll  (his #9)');
          /* ── 4: the town says your name ── */
          ok(/own\[i\] = own\[i\]\.replace\("\{you\}", you\)/.test(fnGd(linW, 'list'))
             && /return str\(TownPlayerModel\.PLAYABLE\.get\(GameState\.character, "you"\)\)/.test(fnGd(linW, 'you_name'))
             && /if first_today and not animal:\s*\n\s*_greeted = "%s, %s\. %s" % \[TownClock\.greeting\(\), Lines\.you_name\(\), _greeted\]/.test(npcW),
            '⭐ the town says your name  (his #4): the first talk of the day opens "Morning, Habsa.", and {you} in any line is whoever you play',
            '⚠ ONLY HUMANS TALK: a dog says nobody\'s name');
          ok(/news\.append\("%s took %s: %s\." % \[you,/.test(papRaw) && /news\.append\("%s beat the CEO\." % you\)/.test(papRaw),
            '…and the paper names you for what you took');
          /* ── 5: each character their own narrator ── */
          ok(/var mine = \(beat\.get\("by", \{\}\) as Dictionary\)\.get\(GameState\.character, null\)/.test(fnGd(beatW, 'play'))
             && /b\._lines = \(\(mine if mine is Array else beat\.get\("lines", \[\]\)\) as Array\)\.duplicate\(\)/.test(fnGd(beatW, 'play'))
             && (beatW.match(/u\.say\([^\n]*, null, Lines\.you_name\(\)\)/g) || []).length === 2
             && /`by` gives any one of them their own words/.test(stW),
            '⭐ each character is their own narrator  (his #5): a beat can carry anybody\'s own words (`by`), and whoever you play is named over every line of it');
          ok(/func say\(text: String, seconds: float = 3\.4, from: Node2D = null, by: String = ""\) -> void:/.test(uiW)
             && /var told: bool = look == SAY and _by != "" and not _bubbled/.test(fnGd(uiW, '_layout'))
             && /_who\.visible = \(look == TALK or told\) and not _bubbled/.test(fnGd(uiW, '_layout'))
             && /h = \(66\.0 if k <= 1\.4 else 96\.0\) \* k \+ \(18\.0 \* k if told else 0\.0\)/.test(fnGd(uiW, '_layout')),
            '…in the bottom box as a person\'s name is, the box made taller for it');
          ok(/if is_instance_valid\(_beat\):\s*\n\s*_beat\.done\.connect\(_report_challenge\.bind\(who, won, slot, learned\), CONNECT_ONE_SHOT\)\s*\n\s*return/.test(fnGd(znW, '_report_challenge')),
            '⚠⚠ …and a win\'s report waits for the beat it set off: the first square\'s beat and "You beat Maxwell." land in one breath, and the report took the beat\'s first line out of the box before anybody read it',
            'found by the narrator probe, 10-26');
          /* ── 2: the road from start to finish, on one page ── */
          const jrW = rd('journal.gd');
          ok(/const TABS := \["Story", /.test(jrW) && /STORY_TAB: return _story_rows\(\)/.test(fnGd(jrW, '_rows'))
             && /out\.append\(\{ "mark": "·", "a": "Next", "b": _next_step\(\), "lit": true \}\)/.test(fnGd(jrW, '_story_rows'))
             && /if not GameState\.story\.found\("princess"\):\s*\n\s*return "Find Princess, north of the Assembly\."/.test(fnGd(jrW, '_next_step')),
            '⭐ the Journal opens on the story  (his #2): what has happened so far, and the next step by name');
          ok(/if GameState\.story\.dogs_play:\s*\n\s*out\.append\(\{ "mark": "✓", "a": "The secret"/.test(fnGd(jrW, '_story_rows'))
             && /if _met\(GameState\.board\.holder_at\(slot\), key, slot\):\s*\n\s*return "%s, %s" % \[GameState\.board\.holder_at\(slot\), where\]\s*\n\s*return "somebody " \+ where/.test(fnGd(jrW, '_found_at')),
            '⚠⚠ …and it keeps the town\'s mysteries: the secret is a row only once found, and the next step names a person only once you have met them  (his 09-03: "it should be a mystery")',
            'it names the place: "somebody at the camp"');
          /* ── 1: a finish ── */
          const hlW = rd('hall.gd'), crW = rd('credits_roll.gd'), gsW = rd('game_state.gd'), phW = rd('photo.gd');
          ok(/func interact\(player: Node\) -> void:\s*\n\t\tif not GameState\.challenge\.ceo_beaten:\s*\n\t\t\treturn\s*\n\t\tGameState\.story\.credits_due = true\s*\n\t\tGameState\.story\.tell\("end:door"\)\s*\n(?:\t\t#[^\n]*\n)?\t\tCheckerTown\.region = CheckerTown\.region_of\(arrive_at\)\s*\n\t\tsuper\(player\)/.test(hlW)
             && /_far\.scene_path = "res:\/\/town\/town\.tscn"/.test(hlW)
             && /_far\.visible = GameState\.challenge\.ceo_beaten\s*\n\s*_far\.monitoring = GameState\.challenge\.ceo_beaten/.test(fnGd(hlW, '_refresh')),
            '⭐ a finish  (his #1): the CEO beaten, the far door at the back of the Assembly opens and walks you out into the town',
            '⚠ the window is set to where you come out, or the town puts you back in the square  (found by the finish probe)');
          ok(/if GameState\.story\.credits_due:\s*\n\s*GameState\.story\.credits_due = false\s*\n\s*CreditsRoll\.open\(self\)/.test(znW)
             && /var credits_due := false/.test(gsW) && !/"credits_due"/.test(gsW)
             && /func finished\(\) -> bool:\s*\n\treturn told\.has\("end:door"\)/.test(gsW)
             && /add_to_group\("town_cover"\)/.test(crW) && /TownZone\.uncovered\(\)/.test(fnGd(crW, '_close'))
             && /\["The town stays open\.", /.test(crW),
            '…under the credits, once: it is kept that you went (`told`, a union), and the roll is a cover that hands the feet back',
            '⚠ credits_due is NOT saved: a save made at the door would play them on every load');
          {
            /* ⭐ HIS (2026-10-27): "Credit only McPuppy Studios." */
            const named = [...fnGd(crW, '_lines').matchAll(/\["([^"]*)", \d+/g)].map((m) => m[1]).filter((t) => t !== '');
            ok(JSON.stringify(named) === JSON.stringify(['CHECKER TOWN', 'McPuppy Studios', 'The town stays open.']),
              '⭐ …and the roll credits McPuppy Studios and nobody else  (his, 10-27): the title over it and the line under it are not credits',
              named.join(' | '));
          }
          {
            /* ⭐ THE LATER AREAS  (his, 2026-10-27: "block off the later areas of the game (your best discretion)") */
            const wdW = rd('state_worlds.gd'), drW = rd('door.gd'), ptW = rd('portal.gd'), cgW = rd('city_gate.gd'),
              mxW = rd('maxwell.gd'), sbW = rd('state_board.gd'), stW = rd('state_town.gd');
            const laterRows = [...((/const LATER := \{([\s\S]*?)\n\}/.exec(wdW) || [])[1] || '').matchAll(/^\t"([^"]+)": \["[^"]+", "([\w-]*)"\],/gm)];
            const laterAt = laterRows.map((m) => m[1]), laterGames = laterRows.map((m) => m[2]).filter((g) => g !== '');
            ok(/const BUILDING := "Building\. Not open to visitors\."/.test(wdW)
               && JSON.stringify(laterAt) === JSON.stringify(['/games/chess-city/', '/games/campaign/', '/games/murphys-law/', 'res://rooms/secret.tscn', '/games/the-gauntlet/'])
               && JSON.stringify(laterGames) === JSON.stringify(['siege-waves', 'murphys-law', 'the-gauntlet'])
               && /if where == "":\s*\n\t\treturn false\s*\n\tvar at := where\.get_slice\("\?", 0\)\s*\n\treturn LATER\.has\(at\)/.test(fnGd(wdW, 'later'))
               && !/LATER_GAMES/.test(wdW + sbW + rd('journal.gd')),
              '⭐ the later areas  (his 10-27): ONE list of what is still being built and the square each one holds, and his words for it  ("Building. Not open to visitors.")',
              laterAt.join(' ') + ' · ' + laterGames.join(' '));
            /* ⚠ THE SITE'S SHUT PAGES ARE LATER IN THE GAME, NOT THE REVERSE: a live game can be later in the town (the
               Gauntlet has no door yet, his 10-28), and a page behind the site's lock is never a door the town opens. */
            const page = (g) => path.join(ROOT, 'games', g, 'index.html');
            const shutPages = fs.readdirSync(path.join(ROOT, 'games')).filter((g) => fs.existsSync(page(g))
              && /class="proto-shut"/.test(fs.readFileSync(page(g), 'utf8')));
            const offWords = shutPages.filter((g) => !/<p class="proto-shut">Building\. Not open to visitors\.<\/p>/.test(fs.readFileSync(page(g), 'utf8')));
            const gameAll = GD_ALL.filter((f) => f.endsWith('.gd')).map((f) => rd(f)).join('\n');
            const opened = shutPages.filter((g) => g !== 'checker-town' && gameAll.includes('"/games/' + g + '/')
              && !laterAt.includes('/games/' + g + '/'));
            ok(shutPages.length >= 5 && offWords.length === 0 && opened.length === 0,
              '…and every page the site keeps shut says the same words, and is a later area wherever the game names it: the game never opens a door the site keeps shut',
              offWords.concat(opened).join(' ') || shutPages.join(' '));
            ok(/^\t# [^\n]*\n\tif GameState\.worlds\.later\(scene_path if scene_path != "" else url\):\s*\n\t\tsay\(GameState\.worlds\.BUILDING\)\s*\n\t\treturn\s*\n\tif energy_cost > 0/m.test(fnGd(drW, 'interact'))
               && /url = GameState\.town\.CHESS_CITY_URL/.test(cgW) && /_secret\.scene_path = "res:\/\/rooms\/secret\.tscn"/.test(hlW)
               && /"marchland": \{ "name": "ChessWild: Campaign", "url": "\/games\/campaign\/"/.test(ptW),
              '⛑ …every door asks it before it spends or opens anything: the west gate past the CEO, the camp\'s ring, the room behind the west wall',
              'a door that took your energy and then refused would charge you to read a sign');
            ok(/if GameState\.worlds\.later\(url\):\s*\n\t\tsay\(GameState\.worlds\.BUILDING, [\d.]+\)\s*\n\t\treturn\s*\n\tif dark\(\):/.test(fnGd(ptW, 'interact'))
               && /if GameState\.worlds\.later\(url\):\s*\n\t\treturn "%s  —  %s" % \[title, GameState\.worlds\.BUILDING\]\s*\n\tif dark\(\):/.test(fnGd(ptW, '_line'))
               && /elif GameState\.worlds\.later\(url\):\s*\n\t\trelabel\("The road west, to Chess City  —  %s" % GameState\.worlds\.BUILDING\)/.test(fnGd(cgW, '_relabel')),
              '…and says so before you press: the camp\'s ring ahead of its half-the-Assembly price, the gate on its label');
            ok(/^\treturn -size\.y \* 0\.5$/m.test(fnGd(cgW, 'speech_top')),
              '⚠ the gate speaks from its opening: from over its sign the line was off the top of the west window, and nothing it said ever showed',
              'found by the later probe: "Barred from the other side" never once reached the screen');
            ok(/if GameState\.worlds\.later\(GameState\.town\.CHESS_CITY_URL\):\s*\n\t\t\trows\.append\(\{ "id": "sail", "on": false,/.test(fnGd(mxW, 'menu'))
               && /^\tif GameState\.worlds\.later\(CHESS_CITY_URL\):\s*\n\t\treturn\s*\n\tboat\["sailed"\] = 1/m.test(fnGd(stW, 'sail')),
              '…the finished boat stays at the dock: Maxwell\'s row is gray and says why, and sail() refuses on its own');
            const rosterN = (sbW.match(/^\t\{ "p": "[prnbqk]", +"who":/gm) || []).length;
            const strays = laterGames.filter((g) => !new RegExp('"un": \\["' + g + '", \\d+\\]').test(sbW));
            ok(/if \(str\(r\.get\("key", ""\)\) != "" or r\.has\("un"\)\) and not later\(i\):/.test(fnGd(sbW, 'claimable'))
               && /return r\.has\("un"\) and GameState\.worlds\.later_game\(str\(\(r\["un"\] as Array\)\[0\]\)\)/.test(fnGd(sbW, 'later'))
               && /if game == "":\s*\n\t\treturn false[\s\S]*?for v in LATER\.values\(\):\s*\n\t\tif str\(\(v as Array\)\[1\]\) == game:\s*\n\t\t\treturn true\s*\n\treturn false/.test(fnGd(wdW, 'later_game'))
               && /for i in claimable\(\):/.test(fnGd(sbW, 'army_full')) && strays.length === 0 && rosterN === 16,
              '⛑⛑ …and a square won only in one of them is not asked of you yet: the CEO waits on the other ' + (rosterN - laterGames.length),
              strays.length ? 'not a square\'s game: ' + strays.join(' ') : 'a square nobody can win would lock the far chair for good');
            ok(/if GameState\.board\.later\(i\):\s*\n\t\t\tcontinue/.test(fnGd(jrW, '_next_step'))
               && /elif GameState\.board\.later\(i\):\s*\n\t\t\trow\["b"\] = GameState\.worlds\.BUILDING/.test(fnGd(jrW, '_board_rows')),
              '…the Journal never sends you to one, and its board says Building on those squares');
            ok(/^  later\) SEQ=/m.test(rd('tests/cases.sh')) && /\blater\b/.test((/CASES="\$\{\*:-([^}]*)\}"/.exec(rd('tests/suite.sh')) || [])[1] || ''),
              '…and the probe walks into every one of them  (cases.sh later, in the suite)');
          }
          ok(/for w in _crowd:\s*\n\s*w\.stand\(GameState\.challenge\.ceo_beaten\)/.test(fnGd(hlW, '_refresh'))
             && /_feet\.set_deferred\("disabled", not on\)/.test(hlW) && /_build = TownPeople\.dress\(self, who, key\)\["build"\]/.test(hlW)
             && /if THEIR_BACK\[f\] == "k" and GameState\.challenge\.ceo_beaten:/.test(fnGd(hlW, '_draw_theirs'))
             && /"down": str\(back\[f\]\) == "k" and GameState\.challenge\.ceo_beaten/.test(phW),
            '…the town stands along the walls, each in their own clothes, and his king lies down, in the room and in the photo',
            '⚠ a hidden body still blocks, and drawn on the room\'s own canvas all ten wore your clothes');
          ok(/return "The town is yours\." if GameState\.story\.finished\(\) else "Walk through the far door, at the back of the Assembly\."/.test(fnGd(jrW, '_next_step'))
             && /"a": "The far door"/.test(fnGd(jrW, '_story_rows')),
            '…and the Journal\'s next step says where the door is until you have gone through it');
          /* ── 7: the dogs know who you are, and Habsa and Munawar keep them outdoors ── */
          /* his: "7 (adhere to Habsa and Munawar's muslim views toward dogs in which no saliva can be transferred.  Dog
             must be DRY as well - don't make it a huge deal, though.  Also, the dogs cannot stay indoors for these
             characters... we'll have to work around that)" */
          const pmW = rd('player_model.gd'), dgW = rd('dog.gd'), hmW = rd('home.gd'), bvW = rd('board_view.gd');
          const twW = rd('town.gd'), lnW = rd('lines.gd');
          const playable = [...((/const PLAYABLE := \{([\s\S]*?)\}/.exec(pmW) || [0, ''])[1]).matchAll(/"(\w+)":/g)].map((m) => m[1]);
          const keepOut = (((/const DOGS_OUTDOORS := \[([^\]]*)\]/.exec(pmW) || [0, ''])[1]).match(/"\w+"/g) || []).map((x) => x.slice(1, -1));
          ok(keepOut.join(' ') === 'habsa munawar' && keepOut.every((k) => playable.includes(k))
             && /static func outdoors\(\) -> bool:\s*\n\treturn TownPlayerModel\.DOGS_OUTDOORS\.has\(GameState\.character\)/.test(dgW),
            '⭐ Habsa and Munawar keep the dogs outdoors  (his #7): one list, and the dogs ask it', keepOut.join(', '));
          const DOGS3 = ['Princess', 'Milo', 'Argus'];
          const hiMiss = [];
          for (const d of DOGS3) for (const id of playable) {
            const rows = words(d)['hello_' + id] || [];
            if (rows.length !== 1 || !rows[0].startsWith(d + ' ')) hiMiss.push(d + '/' + id);
          }
          ok(playable.length === 8 && hiMiss.length === 0
             && /if first_today and animal:\s*\n\s*_greeted = Lines\.one\(who, "hello_" \+ GameState\.character, _greeted\)/.test(npcW),
            '⭐ the dogs know who you are  (his #7): the first time each sees you in a day, its own trick for each of the eight',
            hiMiss.join(' ') || '24 rows, every one what the dog DOES, starting with its name');
          /* ⚠⚠ NO MOUTH, NO NOSE, NO WET DOG: every plain row with one of these has a _dry row the game reads instead */
          const MOUTH = /\b(mouths?|lick\w*|teeth|drool\w*|slobber\w*|chew\w*|carr(?:y|ies|ied)|nose[sd]?|nosing|chin|tongue|wet|soak\w*)\b/i;
          const wet = [];
          for (const d of DOGS3) {
            const w = words(d);
            for (const h of Object.keys(w)) {
              if (h.endsWith('_dry') || h.startsWith('hello_')) continue;
              if (!w[h].some((r) => MOUTH.test(r))) continue;
              const dry = w[h + '_dry'] || [];
              if (dry.length === 0) wet.push(d + ' [' + h + '] has no _dry rows');
            }
            for (const h of Object.keys(w)) {
              if (h.endsWith('_dry') || keepOut.some((k) => h === 'hello_' + k)) (w[h] || []).filter((r) => MOUTH.test(r)).forEach((r) => wet.push(d + ' [' + h + ']: ' + r));
            }
            if (w.lines_dry && w.lines_dry.length !== (w.lines || []).length) wet.push(d + ': [lines_dry] is not the ladder\'s length');
          }
          const listFn = fnGd(lnW, 'list');
          ok(wet.length === 0
             && /if TownDog\.is_animal\(who\) and TownDog\.outdoors\(\):\s*\n\s*own\.assign\(_of\(who\)\.get\(heading \+ "_dry", \[\]\)\)\s*\n\s*if own\.is_empty\(\):\s*\n\s*own\.assign\(_of\(who\)\.get\(heading, \[\]\)\)/.test(listFn),
            '⛑⛑ …and for them no dog\'s mouth or nose touches them or anything of theirs, and no wet dog leans on them: every row that says so has a dry one, read first',
            wet.slice(0, 3).join(' | ') || 'the dry rows are clean, and the [lines] ladder keeps its length');
          const hbW = hmW.slice(hmW.indexOf('class HomeBoard extends Interactable:'));
          const strsW = (t) => [...t.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
          const fnInW = (src, name) => {
            const a = src.indexOf('\tfunc ' + name + '(');
            if (a < 0) return '';
            const rest = src.slice(a + 1);
            const b = rest.search(/\n\t(?:static )?func |\n\S/);
            return b < 0 ? rest : rest.slice(0, b);
          };
          const shownL = strsW((/const SHOWN := \[([\s\S]*?)\n\t\]/.exec(hbW) || [0, ''])[1]);
          const shownD = Object.fromEntries([...((/const SHOWN_DRY := \{([\s\S]*?)\n\t\}/.exec(hbW) || [0, ''])[1]).matchAll(/(\d+): "([^"]*)"/g)].map((m) => [m[1], m[2]]));
          const floorL = Object.fromEntries([...((/const FLOORED := \{([\s\S]*?)\n\t\}/.exec(hbW) || [0, ''])[1]).matchAll(/"(\w+)": "([^"]*)"/g)].map((m) => [m[1], m[2]]));
          const floorD = Object.fromEntries([...((/const FLOORED_DRY := \{([\s\S]*?)\n\t\}/.exec(hbW) || [0, ''])[1]).matchAll(/"(\w+)": "([^"]*)"/g)].map((m) => [m[1], m[2]]));
          const boardWet = shownL.map((r, i) => [String(i), r]).filter(([, r]) => MOUTH.test(r)).filter(([i]) => !shownD[i] || MOUTH.test(shownD[i]))
            .concat(Object.entries(floorL).filter(([, r]) => MOUTH.test(r)).filter(([k]) => !floorD[k] || MOUTH.test(floorD[k])));
          ok(shownL.length === 4 && boardWet.length === 0 && Object.entries(floorD).every(([k, r]) => r.startsWith(k + ' '))
             && /return str\(SHOWN_DRY\.get\(i, SHOWN\[i\]\)\) if TownDog\.outdoors\(\) else str\(SHOWN\[i\]\)/.test(fnInW(hbW, '_shown'))
             && /return str\(FLOORED_DRY\.get\(d, FLOORED\[d\]\)\) if TownDog\.outdoors\(\) else str\(FLOORED\[d\]\)/.test(fnInW(hbW, '_floored'))
             && !/SHOWN\[_stage\]|FLOORED\[dog\]/.test(hbW),
            '…at the boards too: she pushes the knight with a paw, and Argus paws his pieces off rather than carry them',
            boardWet.map(([k]) => k).join(' ') || 'every board line with a mouth or nose in it has its dry line');
          const pd = fnGd(bvW, '_paint_dog');
          ok(/var dry := TownDog\.outdoors\(\)/.test(pd)
             && /if dry:\s*\n\s*at = home\.lerp\(push \+ Vector2\(0\.714, -0\.79\) \* c, lean\)\s*\n\s*reach = lean\s*\n\s*paw_to = \(move\["at"\] as Vector2\) \+ Vector2\(0\.0, -0\.3 \* c\)\s*\n\s*else:\s*\n\s*at = home\.lerp\(push, lean\)/.test(pd)
             && /TownDog\.paint_reach\(_art, dog, paw, paw\.lerp\(paw_to, reach\), c \* 0\.40\)/.test(pd)
             && /_piece\("p", true, at \+ \(Vector2\(-0\.6, 0\.9\) if dry else Vector2\(0\.0, 0\.34\)\) \* c, PI \* 0\.5\)\s*\n(?:\s*#[^\n]*\n)?\s*if dry:\s*\n\s*TownDog\.paint_reach\(/.test(pd),
            '…and up close the piece moves under a paw, and Milo\'s pawn is under his paw, never in his mouth');
          /* ⚠⚠ NEVER INDOORS: the house builds none of it for them, and the yard is built by the house's own code */
          ok(/if not TownDog\.outdoors\(\):\s*\n\s*_furnish_dogs\(\)/.test(fnGd(hmW, '_furnish_room'))
             && /if not TownDog\.outdoors\(\):\s*\n\s*_draw_mess\(\)/.test(fnGd(hmW, '_decor'))
             && /TownDog\.princess\(\)/.test(fnGd(hmW, '_furnish_dogs')) && /_lodger\("Argus", /.test(fnGd(hmW, '_furnish_dogs'))
             && !/TownDog\.(princess|of)\(|DogBed|HomeBoard/.test(fnGd(hmW, '_furnish_room')),
            '⭐⭐ the dogs never come into the house for them: no dog, no bed, no board and no mess indoors  (his: "the dogs cannot stay indoors for these characters")');
          const yardFn = fnGd(hmW, 'furnish_yard');
          const kennelC = hmW.slice(hmW.indexOf('class Kennel extends Node2D:'), hmW.indexOf('class YardMess extends Node2D:'));
          ok(/if TownDog\.outdoors\(\):\s*\n\s*NateHome\.furnish_yard\(self, HOME_AT\)/.test(fnGd(twW, '_furnish_home'))
             && (yardFn.match(/HomeBoard\.new\(\)/g) || []).length === 2 && /Kennel\.new\(\)/.test(yardFn) && /YardMess\.new\(\)/.test(yardFn)
             && /her\.at_home = true/.test(yardFn) && /NateHome\.lodge\(town, name_, yard_bed\(name_, home\) \+ Vector2\(0\.0, 6\.0\)\)\.door_home = yard_gate\(home\)/.test(yardFn)
             && /table\.stood_up\.connect\(town\._story\)/.test(yardFn)
             && /const DOORS := \["Princess", "Milo", "Argus"\]/.test(kennelC) && /draw_colored_polygon\(roof, ROOF\)/.test(kennelC),
            '⭐ …it is all out in a yard by his checker instead: a doghouse each with a roof over every bed, the three boards, and the house\'s copies of the three of them');
          ok(/if TownDog\.outdoors\(\):\s*\n\s*d\.door_home = NateHome\.yard_gate\(HOME_AT\)/.test(fnGd(twW, '_lane_dog'))
             && /if door_home != Vector2\.ZERO:\s*\n\s*global_position = door_home/.test(fnGd(dgW, '_step_in')),
            '…and the lane\'s copy and the yard\'s hand over at one gate, in plain view: one goes out of sight where the other comes in',
            'from the lane every bed is behind the kennel, and a dog walks a straight line');
          /* ⚠⚠ EVERY PIECE OF IT IN THE SQUARE'S WINDOW: the south window starts at x -200 below y 560, and the cull
             dropped two of the boards the first time. */
          const rrect = Object.fromEntries([...fnGd(twW, 'region_rect').matchAll(/"(\w+)":\s*\n\s*return Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/g)]
            .map((m) => [m[1], { x: +m[2], y: +m[3], w: +m[4], h: +m[5] }]));
          const sq = /\n\treturn Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(fnGd(twW, 'region_rect'));
          const homeAt = (/const HOME_AT := Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(twW) || [0, NaN, NaN]).slice(1).map(Number);
          const yardOff = (n) => (new RegExp('const YARD_' + n + ' := Vector2\\((-?[\\d.]+), (-?[\\d.]+)\\)').exec(hmW) || [0, NaN, NaN]).slice(1).map(Number);
          const inRect = (r, x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
          const strayYard = ['KENNEL', 'ARGUS', 'TABLE', 'MILO', 'GATE'].filter((n) => {
            const [ox, oy] = yardOff(n), x = homeAt[0] + ox, y = homeAt[1] + oy;
            return !Number.isFinite(x) || !sq || !inRect({ x: +sq[1], y: +sq[2], w: +sq[3], h: +sq[4] }, x, y)
              || Object.values(rrect).some((r) => inRect(r, x, y));
          });
          ok(Object.keys(rrect).length >= 6 && strayYard.length === 0 && !/StaticBody2D/.test(kennelC) && !/_solid\(/.test(yardFn),
            '⚠⚠ …every piece of the yard is in the square\'s own window, and it is scenery like the night market: nothing out there has a body',
            strayYard.length ? 'outside the square: ' + strayYard.join(' ') : 'kennel, three boards and the gate, all filed in the square');
          ok(/if dogs_room:\s*\n\s*var out := TownDog\.outdoors\(\)\s*\n\s*GameState\.character_changed\.connect\(func\(_w: String\) -> void:\s*\n\s*if TownDog\.outdoors\(\) != out:\s*\n\s*_dogs_moved\(\)\)/.test(fnGd(znW, '_ready'))
             && /\(n as CharacterSelect\)\.closed\.connect\(_rebuild, CONNECT_ONE_SHOT\)/.test(fnGd(znW, '_dogs_moved'))
             && /_rebuilding = true/.test(fnGd(znW, '_dogs_moved')) && /if is_instance_valid\(_beat\) or _rebuilding:/.test(fnGd(znW, '_story'))
             && /GameState\.reentry\[scene_file_path\] = player\.global_position/.test(fnGd(znW, '_rebuild'))
             && /dogs_room = true/.test(fnGd(twW, '_furnish')) && /dogs_room = true/.test(fnGd(hmW, '_furnish_room')),
            '⚠⚠ …and switching to one of them in the house rebuilds it where you stand, once the cards shut: a dog left indoors for them is the one thing this forbids',
            'no beat starts in the room that is going, or the opening plays twice');
          ok(/"by": \{\s*\n\s*"habsa": \["Out in the yard, /.test(stW) && /"munawar": \["Out in the yard, /.test(stW),
            '…and the opening says their beds are out in the yard');
          /* ── 6: one signature each ── */
          /* his: "One signature each, cosmetic only. A celebration pose, an idle and one item per character, shown on
             the cards and the title screen. Poses need no Blender (the bench press already bends the rig); your clips
             replace them." */
          const sigM = /const SIGNATURE := \{([\s\S]*?)\n\}/.exec(pmW);
          const sigs = sigM ? [...sigM[1].matchAll(/"(\w+)": \{ "item": "(\w+)", "idle": "(\w+)", "win": "(\w+)" \}/g)]
            .map((m) => ({ who: m[1], item: m[2], idle: m[3], win: m[4] })) : [];
          const posesM = /const POSES := \{([\s\S]*?)\n\}/.exec(pmW);
          const V3 = 'Vector3\\((-?[\\d.]+), (-?[\\d.]+), (-?[\\d.]+)\\)';
          const poses = posesM ? Object.fromEntries([...posesM[1].matchAll(new RegExp('"(\\w+)": \\[' + V3 + ', ' + V3, 'g'))]
            .map((m) => [m[1], [[+m[2], +m[3], +m[4]], [+m[5], +m[6], +m[7]]]])) : {};
          const itemsM = /const ITEMS := \{([\s\S]*?)\n\}/.exec(pmW);
          const items = itemsM ? [...itemsM[1].matchAll(/^\t"(\w+)": \["([\w.]+)"/gm)].map((m) => [m[1], m[2]]) : [];
          const sigBad = playable.filter((id) => {
            const g = sigs.find((x) => x.who === id);
            return !g || !items.some(([k]) => k === g.item) || !poses[g.idle] || !(poses[g.win] || g.win === 'clip');
          });
          ok(sigs.length === 8 && sigBad.length === 0 && new Set(sigs.map((g) => g.item)).size === 8
             && items.every(([, b]) => ['Head', 'Spine.2', 'Hand.L', 'Hand.R'].includes(b)),
            '⭐ one signature each  (his #6): a thing to carry, a way to stand and a celebration for every one of the eight, no two holding the same thing',
            sigBad.join(' ') || sigs.map((g) => g.who + ' ' + g.item).join(', '));
          const tooFar = Object.entries(poses).filter(([, lr]) => lr.some((v) => Math.hypot(v[0], v[1], v[2]) > 0.245)).map(([k]) => k);
          ok(Object.keys(poses).length >= 10 && tooFar.length === 0,
            '⚠ …every pose inside the reach of his short arms  (0.24 of his height: past it is an arm held straight at nothing)',
            tooFar.join(' ') || Object.keys(poses).length + ' poses');
          const csW6 = rd('character_select.gd'), prbW = rd('tests/probe.gd');
          const castStep = (prbW.split('\t\t\t"cast":')[1] || '').split('\n\t\t\t"')[0];
          ok(/add_child\(body\)\s*\n\s*body\.sign\(str\(_ids\[i\]\)\)/.test(fnGd(csW6, '_ready')) && /body\.sign_win\(\)/.test(fnGd(csW6, '_choose'))
             && /body\.sign\(who\)/.test(castStep)
             && !/\.sign\(|sign_win\(/.test(rd('player.gd') + rd('people_sheet.gd') + rd('npc.gd') + rd('lift.gd')),
            '…shown on the cards, where the one you pick celebrates their own way, and in the title screen\'s cast  (and nowhere else: cosmetic only)');
          ok(/and \(str\(w\)\.contains\("_"\) or not _signed_clip\(short\)\)/.test(fnGd(pmW, '_match_clip'))
             && /_match_clip\(\[who \+ "_idle"\], ""\)/.test(fnGd(pmW, 'sign')) && /_match_clip\(\[_who \+ "_win"\], ""\)/.test(fnGd(pmW, 'sign_win'))
             && /if own != "" or str\(_sign\.get\("win", ""\)\) == "clip":/.test(fnGd(pmW, 'sign_win')),
            '⭐ …and a clip of his replaces a pose: "<who>_win" or "<who>_idle" plays instead, and is never taken as everybody\'s',
            'Nate\'s celebration is already his own Wave');
          /* ── 8: New Game and the saves ── */
          /* his: "New Game and a second save. Continue / New Game on the title screen, so a finished run can start
             over with someone else first."  and 10-27: "Can each account have up to 3 saves?" */
          const gsS = rd('game_state.gd'), jrS8 = rd('journal.gd');
          ok(/const SAVE_COUNT := 3/.test(gsS) && /return SAVE_PATH if n <= 1 else "user:\/\/town%d\.json" % n/.test(fnGd(gsS, 'path_of'))
             && /return path_of\(save_slot\) \+ ext/.test(fnGd(gsS, '_path'))
             && !/SAVE_(PATH|TMP|BAK)\b/.test(fnGd(gsS, 'save_state') + fnGd(gsS, 'load_state')),
            '⭐ three saves  (his #8, and 10-27): Save 1 is the file it always was, Saves 2 and 3 their own, and all three are written and read the same way',
            'an old save is Save 1, untouched');
          const pushS = fnGd(gsS, 'push_to_site'), pullS = fnGd(gsS, 'pull_from_site');
          ok(!/save_slot != 1/.test(gsS) && /P\.mergeTown\(JSON\.parse\(t\), slot\)/.test(pushS) && /% \[JSON\.stringify\(payload\), save_slot\]/.test(pushS)
             && /P\.townState\(%d\)/.test(pullS) && /""" % save_slot, true\)/.test(pullS)
             && /_pulls_left = 15\s*\n/.test(fnGd(gsS, '_ready')) && /_pulls_left = 15\s*\n/.test(fnGd(gsS, 'use_save'))
             && /var TOWN_SAVES = 3;/.test(PROF) && /var data = \{\};\s*data\[townField\(slot\)\] = merged;/.test(PROF)
             && /for \(var ts = 1; ts <= TOWN_SAVES; ts\+\+\) \{\s*if \(tw && tw\.data && tw\.data\[townField\(ts\)\]\) townMerge\(tw\.data\[townField\(ts\)\], ts\);/.test(PROF),
            '⭐⭐ …and every one is kept with the account, each in a field of its own  (data.town, town2, town3), pushed and pulled by its number',
            '⚠ saveScore merges `data`, so writing one save leaves the other two where they were');
          const useFn = fnGd(gsS, 'use_save');
          ok(/var theirs_run := int\(d\.get\("run", 0\)\)\s*\n\tif theirs_run < run_began:\s*\n\t\treturn\s*\n\tif theirs_run > run_began:\s*\n\t\t_take_their_run\(d\)\s*\n\t\treturn/.test(fnGd(gsS, 'merge_in'))
             && /"run": run_began/.test(fnGd(gsS, 'save_state')) && /run_began = int\(d\.get\("run", 0\)\)/.test(fnGd(gsS, 'load_state'))
             && /"run": run_began \}\)/.test(pushS)
             && /var lr = \+local\.run \|\| 0, rr = \+remote\.run \|\| 0;\s*if \(rr < lr\) return local;[^\n]*\s*if \(rr > lr\) local = \{\};[^\n]*\s*local\.run = rr;/.test(fn(PROF, 'townMerge'))
             && /_reset_parts\(\)\s*\n\trun_began = int\(d\.get\("run", 0\)\)\s*\n\tmerge_in\(d\)/.test(fnGd(gsS, '_take_their_run')),
            '⛑⛑ …a run carries when it began: two copies of one run merge as they always have, and a LATER run replaces the earlier whole, in the game and on the site',
            'without it the union hands a New Game straight back the run it began over');
          ok(/func new_game\(\) -> void:\s*\n\tuse_save\(new_game_slot\(\), true\)/.test(gsS)
             && /for n in range\(1, SAVE_COUNT \+ 1\):\s*\n\t\tif n != save_slot and save_summary\(n\)\.is_empty\(\):\s*\n\t\t\treturn n\s*\n\treturn save_slot/.test(fnGd(gsS, 'new_game_slot'))
             && /d = _site_town\(n\)/.test(fnGd(gsS, 'save_summary'))
             && /run_began = 0\s*\n\tload_state\(\)\s*\n\tif fresh:\s*\n\t\trun_began = int\(Time\.get_unix_time_from_system\(\)\)/.test(useFn)
             && useFn.indexOf('run_began = int(Time') < useFn.lastIndexOf('save_state()'),
            '⛑⛑ …a New Game goes in the first save with no run in it, on this device or the account, and stamps its run and writes it at once',
            'a save begun on the phone is not an empty save on the desk');
          ok(useFn.indexOf('save_state()') < useFn.indexOf('save_slot = clampi(n, 1, SAVE_COUNT)')
             && /_reset_parts\(\)/.test(useFn) && /load_state\(\)/.test(useFn) && /NateHome\.forget\(\)/.test(useFn)
             && /CheckerTown\.region = "square"/.test(useFn) && /CharacterSelect\.asked = false/.test(useFn)
             && /sound_on = bool\(keep\[0\]\)/.test(useFn) && /get_tree\(\)\.change_scene_to_file\("res:\/\/rooms\/home\.tscn"\)/.test(useFn)
             && /var fresh: Object = \(part\.get_script\(\) as Script\)\.new\(\)/.test(fnGd(gsS, '_reset_parts'))
             && /if int\(prop\["usage"\]\) & PROPERTY_USAGE_SCRIPT_VARIABLE:/.test(fnGd(gsS, '_reset_parts')),
            '…switching writes the run you leave, then reads the other in its place: every part back to its own defaults, the house\'s mess forgotten, the cards up',
            'the mute and the clock stay as they are: they are the device\'s');
          ok(/save_slot = _read_slot\(\)/.test(fnGd(gsS, '_ready')) && /"user:\/\/saves\.json"/.test(gsS)
             && /if _program_new_game\(\):\s*\n\t\tsave_slot = new_game_slot\(\)\s*\n\t\t_write_slot\(\)\s*\n\t\t_wipe\(save_slot\)\s*\n\t\tload_state\(\)\s*\n\t\trun_began = int\(Time\.get_unix_time_from_system\(\)\)\s*\n\t\tsave_state\(\)/.test(fnGd(gsS, '_ready'))
             && /\(window\.townNewGame === true\) \? \(\(window\.townNewGame = false\), 1\) : 0/.test(fnGd(gsS, '_program_new_game'))
             && /program\.wait_time = 0\.25/.test(fnGd(gsS, '_ready'))
             && /window\.townSaves = %s;/.test(fnGd(gsS, '_publish_saves')) && /_publish_saves\(\)/.test(fnGd(gsS, '_tick'))
             && /_publish_saves\(\)/.test(useFn) && !/save_summary|_publish_saves/.test(fnGd(gsS, '_follow_program_saves')),
            '…which save is in play is the device\'s, New Game on the desktop program\'s title begins one before the first room is drawn, and the title is told which saves hold a run',
            '⚠ told on the 2s tick and on a switch, not the quarter second: it reads the other two saves off the disk and the site');
          ok(/for n in range\(1, GameState\.SAVE_COUNT \+ 1\):\s*\n\t\tvar which := n\s*\n\t\t_save_btns\.append\(_button\("Save %d" % n, func\(\) -> void: _play_save\(which\)\)\)/.test(jrS8)
             && /_save_btns\.append\(_button\("New Game", func\(\) -> void: _new_game\(\)\)\)/.test(jrS8)
             && /var over := GameState\.new_game_slot\(\) == GameState\.save_slot\s*\n\tif over and not _armed:\s*\n\t\t_armed = true\s*\n\t\t_save_btns\[_save_btns\.size\(\) - 1\]\.text = "Yes, start Save %d over" % GameState\.save_slot\s*\n\t\treturn/.test(fnGd(jrS8, '_new_game'))
             && /var sm := GameState\.save_summary\(n\)/.test(fnGd(jrS8, '_story_rows')) && /"lit": n == GameState\.save_slot/.test(fnGd(jrS8, '_story_rows')),
            '⭐ …in the Journal\'s story tab: all three saves and what is in each, and New Game, which asks first only when there is no save to spare');
          const casesS = rd('tests/cases.sh');
          ok(/rm -f [^\n]*"\$SAVE\/town2\.json"[^\n]*"\$SAVE\/town3\.json"[^\n]*"\$SAVE\/saves\.json"/.test(casesS),
            '⚠ …and every probe run starts from no save of any kind  (a Save 2 left behind walked into the next case)');
        }

        /* ⚠⚠ THE THREE WAYS A BEAT COULD HANG THE GAME, all of them one line. */
        ok(/add_to_group\("town_cover"\)/.test(bt) && /TownZone\.uncovered\(\)/.test(bt),
          'a beat takes the feet through the town\'s own cover, and hands them back through uncovered()',
          'without uncovered() the press that ends a beat opens whatever you are standing in');
        ok(/if _lines\.is_empty\(\) or u == null or u\.is_talking\(\):\s*\n\t\t_finish\(\)/.test(bt),
          '⚠⚠ an unwritten row, a missing box and an open menu all END the beat instead of covering a dead screen',
          'TownUI.say() refuses while a menu is open — a beat started there narrates nothing, forever');
        ok(/const DWELL := 0\.4/.test(bt) && /if _dwell > 0\.0/.test(bt),
          '⚠ and the press that FIRED the beat cannot also dismiss its first line');
        ok(/InputEventScreenTouch/.test(bt) && /pad\.take_accept\(\)/.test(bt)
          && /is_action_pressed\("ui_accept"\)/.test(bt),
          'a key, a tap and the pad\'s own button all advance it  [[hover-is-three-inputs]]');

        /* ⚠ THE RUNNER. Two live moments plus the room it loads in — anything else waits. */
        ok(/GameState\.story\.dogs_discovered\.connect\(_story\)/.test(znS)
          && /GameState\.board\.army_changed\.connect\(func\(_n: int\) -> void: _story\(\)\)/.test(znS)
          && /dogs_discovered\.emit\(\)/.test(gsS),
          'a beat can come due in the room you are standing in, not only on the next load');
        ok(/_ui\.is_talking\(\)/.test(fnGd(znS, '_story')),
          '⚠ …and it never starts over a conversation');

        /* ⭐ EARNED, SO IT UNIONS. The five places. */
        ok(/var told: Dictionary = \{\}/.test(gsS) && /"told": story\.told/.test(fnGd(gsS, 'save_state'))
          && /told = d\.get\("told", \{\}\)/.test(fnGd(gsS, 'load_state'))
          && /"told": story\.told/.test(fnGd(gsS, 'push_to_site'))
          && /for k in \(d\.get\("told", \{\}\) as Dictionary\)/.test(fnGd(gsS, 'merge_in'))
          && /local\.told = union\(local\.told, remote\.told\)/.test(PROF),
          '⭐ a beat that has played is EARNED — saved, loaded, pushed, merged, and unioned on the site',
          'the cold open would otherwise open a second time on the second device');

        /* ⛑⛑ THE SAY BOX GROWS TO ITS LINE. Narration is longer than anything that had come
           through this box, and on a 320-wide render the fourth wrapped row sat off the
           bottom of the screen. MEASURED both ways: the Label wanted 289 where
           get_multiline_string_size() said 210 — that call counts font_size per row and
           carries neither the font's line height nor line_spacing. */
        {
          const ui = rd('town_ui.gd'), lay = fnGd(ui, '_layout');
          ok(/_line\.size\.y = 0\.0\s*\n\s*var grow: float = maxf\(0\.0, _line\.size\.y - line_h\)/.test(lay)
            && /h = minf\(h \+ grow, vp\.y - 24\.0 \* k\)/.test(lay) && /line_h \+= grow/.test(lay),
            '⛑⛑ the say box is sized by the LABEL, which clamps up to its own wrapped content',
            'a typed height put the last row of a four-line beat below the bottom of the screen');
          /* ⚠ the comment above the fix NAMES the call it replaced — strip comments first. */
          ok(!/get_multiline_string_size/.test(ui.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')),
            '⚠⚠ …and never by get_multiline_string_size()  (it came back 79 units short and the row was still off-screen)');
          ok(/var grow: float = maxf\(0\.0,/.test(lay),
            '⚠ GROWTH ONLY — every line that already fit is laid out at exactly the numbers it had');
        }

        /* ══ 41 · THE TOWN DROPPED A FRAME IN TWENTY, AND IT WAS THE PEOPLE (2026-09-26) ══
           His: the web build was "a bit laggy" outside the home, smoother inside it. Every
           human wears a live 3D SubViewport with its own World3D; the town ran SEVEN of them
           every frame and his checker runs one — exactly the room boundary he described.
           MEASURED in Chrome on his own GPU, clock pinned to 12:30, each arm run twice:
             every frame (shipped)  p95 33.30  p99 33.40   51-55 fps
             every 2nd frame        p95 16.80  p99 33.30   59 fps    <- tail survives
             every 3rd frame        p95 16.80  p99 16.80   59-60 fps <- clean
             every NPC model gone   p95 16.80  p99 16.80   60 fps    <- the ceiling it matches
           ⚠⚠ THE MEDIAN IS 16.70 IN EVERY ARM. "Is it 60fps?" answers YES on a game that
           judders, so a FEEL complaint is read off p95/p99 and never off the average. */
        {
          const npcG = rd('npc.gd'), pm2 = rd('player_model.gd'), sheet = rd('people_sheet.gd');
          const plr = rd('player.gd');
          const proc = fnGd(npcG, '_process');
          const bare = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
          /* ⭐⭐ THE ANSWER WAS NOT A THROTTLE. Rendering each person one frame in three fixed
             the numbers and spoilt the walk — his: "the characters look a bit off now". So the
             3D left the NPCs entirely: one rig, photographed once, then freed.
             Re-measured on his GPU with the sheet in: p95 16.80  p99 16.80  60 fps,
             viewports_total=1 — the ceiling, and the 1 is the player. */
          ok(!/SubViewport/.test(bare(npcG)),
            '⛑⛑ an NPC carries NO SubViewport at all — they draw off TownPeople\'s baked sheet',
            'seven live render passes was the whole defect; making each one cheaper measured at nothing');
          ok(/const FACINGS := 16/.test(sheet),
            '⚠ sixteen facings — eight was rendered at 79px and the 0-to-45 jump is plainly stepped');
          ok(/const IDLES := 4/.test(sheet) && /walking: bool = slot >= IDLES/.test(sheet),
            '⚠⚠ …and the idle is its own bank, because frame 0 of a WALK clip is mid-stride');
          ok(/_filled \+= 1/.test(sheet) && /return _filled > 0/.test(fnGd(sheet, 'ready_to_draw')),
            '⛑⛑ "ready" counts cells that EXIST, not the array size',
            'resize() fills with nulls, so the sheet would report ready and draw bare shadows');
          ok(/_rig\.queue_free\(\)/.test(sheet) && /_rig = null/.test(sheet),
            '⭐ the rig is freed once it has been photographed — nothing 3D is left but the player');
          ok(/static var _cells: Array = \[\]/.test(sheet),
            '⚠ the cells are STATIC, so the town bakes once a SESSION and not once a room');
          ok(/queue_redraw\(\)/.test(sheet) && /_filled == 1/.test(sheet),
            '⚠⚠ …and the first cell repaints everybody, because nothing repaints a CanvasItem on its own');
          ok(/var now := TownPeople\.cell_id\(_facing, _phase01, _walking\)/.test(proc)
            && /if now != _cell_was:/.test(proc),
            '⚠ a person repaints only when their CELL changes, not every frame  (npc.gd is explicit about that cost)');
          /* ⛑⛑ THE ONE THING THAT BREAKS A SHARED SHEET. */
          {
            const tinters = GD_LIST.filter((f) => f.endsWith('.gd'))
              .filter((f) => /\.apply_tint\(/.test(bare(rd(f))));
            /* ⚠ lift.gd tints HIM: his own body, on the bench */
            ok(tinters.length >= 1 && tinters.every((f) => f === 'player.gd' || f === 'lift.gd') && tinters.includes('player.gd'),
              '⛑⛑ NOBODY BUT THE PLAYER IS TINTED — one painted NPC and a shared sheet is wrong for everyone',
              tinters.join(' ') || 'nobody');
          }
          /* ⚠⚠ THE TWO DIALS THAT LOOK LIKE THE FIX AND ARE NOT. Both measured at NO CHANGE:
             it is the NUMBER of render passes, not the cost of one. Do not "optimize" these. */
          ok(/msaa_3d = Viewport\.MSAA_4X/.test(pm2) && /const SUPERSAMPLE := 3\.0/.test(pm2),
            '⚠⚠ …and HIS look dials are untouched — MSAA off and supersample 2.0 both measured at NO change',
            'making each viewport cheaper does nothing; rendering fewer of them is the whole fix');
          /* ⭐ THE PLAYER KEEPS HIS OWN LIVE RIG. He is tinted and he is the one you look at. */
          ok(/UPDATE_ALWAYS/.test(plr) && /TownPlayerModel\.make\(0, TownPlayerModel\.TILT, GameState\.character\)/.test(plr),
            '⭐ …and YOUR own model is still live at 60  (his checker runs one and measured clean)');
        }

        /* ══ 42 · TRUNKS ARE SOLID, AND SO IS THE DOG'S WORLD (2026-09-26) ════════════════
           His: *"make it so I can't walk through trees, and that princess can't walk through
           water or trees or houses either"*. */
        {
          const twnT = rd('town.gd'), dogT = rd('dog.gd'), seaT = rd('season_art.gd');
          /* ⚠⚠ THE TRUNK, NOT THE CROWN. The note that used to sit here said a solid tree is a
             fence — true of the 34*k canopy, false of a 12*k trunk. */
          ok(/const TRUNK_R := 9\.0/.test(twnT) && /c\.radius = TRUNK_R \* k/.test(twnT)
            && /func _scale\(\) -> float:/.test(twnT),
            '⛑ a tree is solid at its TRUNK, off the same seed its drawing uses',
            'two copies of that hash would drift and the collider would stop matching the bark');
          ok(!/var k := 0\.84 \+ float\(h % 42\) \* 0\.008/.test(twnT),
            '⚠⚠ …and the scale is NOT computed twice  (one seed, two readers)');
          ok(/c\.radius = 11\.0/.test(seaT) && /StaticBody2D\.new\(\)/.test(seaT),
            '…and December\'s fir has one too');
          /* ⭐⭐ THE OLD WORRY, MEASURED. A trunk you cannot pass is fine; a ROW of them is a
             fence. Every pair has to leave more room than a player plus two trunks. */
          {
            const blk = twnT.slice(twnT.indexOf('func _furnish_trees'), twnT.indexOf('# ══ A TREE'));
            const pts = [...blk.matchAll(/Vector2\((-?[\d.]+), (-?[\d.]+)\)/g)]
              .map((m) => [parseFloat(m[1]), parseFloat(m[2])]);
            let worst = Infinity, pair = '';
            for (let i = 0; i < pts.length; i++) {
              for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
                const d = Math.hypot(dx, dy);
                if (d < worst) { worst = d; pair = pts[i] + ' / ' + pts[j]; }
              }
            }
            /* player radius 15 + two trunks at 9*1.18 worst case = ~36 of hard clearance. */
            ok(pts.length >= 16 && worst > 60,
              '⭐⭐ …and no two trunks stand close enough to fence anything',
              pts.length + ' trees, tightest pair ' + worst.toFixed(0) + ' apart  [' + pair + ']');
          }
          /* ⛑⛑ SHE IS AN Area2D AND MOVES BY ASSIGNMENT — there is no move_and_slide in dog.gd,
             so the step is tested against the space before it is taken. */
          /* ⛑⛑ THE CHECK MOVED TO npc.gd ON 2026-09-28 and these four assertions moved with it.
             It was written here for Princess, which is exactly why the PEOPLE walked through
             trunks for two days. Section 44 owns the move; this still owns HER use of it. */
          const npcT = rd('npc.gd');
          ok(/func _blocked\(at: Vector2\) -> bool:/.test(npcT)
            && /func _step_toward\(want: Vector2\) -> Vector2:/.test(npcT)
            && /_step_toward\(global_position \+ to \/ d \* step\)/.test(fnGd(dogT, '_walk_to')),
            '⛑ Princess tests every step against the physics space  (water, trunks, houses, fences)');
          ok(/q\.exclude = \[\(_body\.get_parent\(\) as StaticBody2D\)\.get_rid\(\)\]/.test(npcT),
            '⛑⛑ …and a SOLID walker excludes its own body, or every query hits itself and the check does nothing',
            'Milo, Argus and every solid person carry a StaticBody2D; Princess does not');
          ok(/if _blocked\(global_position\):\s*\n\t\tglobal_position = want/.test(npcT),
            '⚠⚠ …and anybody already inside something can still walk out  [[down-never-stuck]]');
          ok(/var ax := Vector2\(want\.x, global_position\.y\)/.test(npcT)
            && /var ay := Vector2\(global_position\.x, want\.y\)/.test(npcT),
            '⚠ …and she SLIDES round a trunk rather than stopping dead against it');
          ok(/_gait \+= \(global_position - was\)\.length\(\)/.test(fnGd(dogT, '_walk_to')),
            '⚠ …and her bob counts what she MOVED, so a pinned dog does not trot on the spot');
        }

        /* ══ 43 · THE MAP IS FIVE WINDOWS (2026-09-27) ═══════════════════════════════════
           His: *"let's have the road cut to a new window… Like the way Pokemon works… We need
           to improve performance significantly if we are going to add MORE things."*
           `town.gd` is ONE CanvasItem so Godot culls nothing it draws — measured 3,262 render
           objects for the whole map. Per window now: square 2,320 · north 1,347 · east 1,309 ·
           south 1,508 · west 662. */
        {
          const twn = rd('town.gd');
          const num = (re, src) => { const m = re.exec(src); return m ? m.slice(1).map(Number) : null; };
          /* Pull the rects straight out of region_rect() and rebuild the partition here.
             ⚠ THE WINDOWS ARE region_of()'s OWN LIST, read off it: a sixth (the woods, 2026-10-23) is checked like the rest. */
          const rects = {};
          const ORDER = ((/for r in \[([^\]]*)\]:/.exec(fnGd(twn, 'region_of')) || [0, ''])[1].match(/"(\w+)"/g) || []).map((q) => q.slice(1, -1));
          for (const key of ORDER) {
            const m = new RegExp('"' + key + '":\\s*\\n\\s*return Rect2\\(([-\\d.]+), ([-\\d.]+), ([-\\d.]+), ([-\\d.]+)\\)').exec(twn);
            if (m) rects[key] = m.slice(1, 5).map(Number);
          }
          /* ⚠ THE SQUARE IS THE FALL-THROUGH: the LAST `return Rect2` in region_rect(), after
             the match block. Sliced from the function, never grepped out of the whole file. */
          {
            const fn = fnGd(twn, 'region_rect');
            const all = [...fn.matchAll(/return Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/g)];
            const last = all[all.length - 1];
            if (last) rects.square = last.slice(1, 5).map(Number);
          }
          ok(ORDER.length >= 5 && Object.keys(rects).length === ORDER.length + 1, ORDER.length + 1 + ' windows, read out of region_of() and region_rect()',
            Object.keys(rects).join(' '));
          const inR = (r, p) => r && p[0] >= r[0] && p[0] <= r[0] + r[2] && p[1] >= r[1] && p[1] <= r[1] + r[3];
          const regionOf = (p) => ORDER.find((k) => inR(rects[k], p)) || 'square';

          /* ⛑⛑ THE ORPHAN. Written first as three standalone y/x tests, which filed the house
             at (-700, 690) "south" and left it outside the south rect — in no window at all. */
          const marks = {};
          for (const m of twn.matchAll(/^const ([A-Z_]+_AT) := Vector2\((-?[\d.]+), (-?[\d.]+)\)/gm)) {
            marks[m[1]] = [Number(m[2]), Number(m[3])];
          }
          const lost = Object.keys(marks).filter((k) => !inR(rects[regionOf(marks[k])], marks[k]));
          ok(Object.keys(marks).length >= 8 && lost.length === 0,
            '⛑⛑ every landmark is filed in a window whose rect actually CONTAINS it',
            lost.length ? 'UNREACHABLE: ' + lost.join(' ')
                        : Object.keys(marks).length + ' landmarks, none orphaned');

          /* ⚠⚠ A SEAM HAS TO STAND IN BOTH WINDOWS IT JOINS, or you cross at a wall. */
          {
            const blk = twn.slice(twn.indexOf('const SEAMS :='), twn.indexOf('func _furnish_seams'));
            let bad = [], n = 0;
            let cur = null;
            const seams = [];
            for (const line of blk.split('\n')) {
              const h = /^\t"([a-z]+)": \[/.exec(line);
              if (h) { cur = h[1]; continue; }
              /* ⚠ NON-GREEDY, AND OFF THE KEY NAMES. `.*Vector2\(` swallowed as far as it could
                 and captured the "size" as the bar's position — every seam then read as being
                 outside both windows, which looked exactly like a real partition bug. */
              const m = /"to": "([a-z]+)", "at": Vector2\((-?[\d.]+), (-?[\d.]+)\), "size": Vector2\((-?[\d.]+), (-?[\d.]+)\), "land": Vector2\((-?[\d.]+), (-?[\d.]+)\)/.exec(line);
              if (!m || !cur) continue;
              n++;
              const bar = [Number(m[2]), Number(m[3])], land = [Number(m[6]), Number(m[7])];
              seams.push({ from: cur, to: m[1], at: bar, size: [Number(m[4]), Number(m[5])] });
              if (!inR(rects[cur], bar) || !inR(rects[m[1]], bar)) bad.push(cur + '->' + m[1] + ' bar');
              if (!inR(rects[m[1]], land)) bad.push(cur + '->' + m[1] + ' landing');
            }
            ok(n >= 10 && bad.length === 0,
              '⚠⚠ …and every seam stands in BOTH windows, and lands inside the one it opens',
              bad.length ? bad.join(', ') : n + ' seams checked');

            /* ⛑⛑ AND IT HAS TO BE REACHABLE FROM THE CLAMP — 2026-09-28, his: *"I can't access
               the next frame south"*. Standing in both windows says the door is in the wall; this
               says it OPENS. `_keep_inside` stops a body `radius + 2` inside world_bounds, and
               TownDoor fires while a body of `radius` reaches the mat shrunk by ARM_INSET — so the
               mouth spans `at ± (size/2 - 9 + 15)` and the clamp line has to land inside it.
               ⚠⚠ MEASURED, NOT READ: the south seam sat 140 units short of its own wall and he
               walked out of his front door, straight down, and stopped against nothing. West and
               east were 4 units short of the same thing and nobody had found them. */
            const REACH = 15 + 2, MOUTH = 15 - 9;
            const shut = [];
            for (const s of seams) {
              const r = rects[s.from], a = s.at, z = s.size;
              /* ⚠ A SEAM OUT OF A WINDOW region_of() DOES NOT LIST is a seam nobody can stand at: red, never a crash */
              if (!r) { shut.push(s.from + '->' + s.to + ' leaves a window region_of() does not list'); continue; }
              const d = [[a[0] - r[0], 'L'], [r[0] + r[2] - a[0], 'R'],
                         [a[1] - r[1], 'T'], [r[1] + r[3] - a[1], 'B']];
              d.sort((x, y) => x[0] - y[0]);
              const side = d[0][1], vert = side === 'L' || side === 'R';
              const wall = side === 'L' ? r[0] : side === 'R' ? r[0] + r[2]
                         : side === 'T' ? r[1] : r[1] + r[3];
              const clamp = wall + ((side === 'L' || side === 'T') ? REACH : -REACH);
              const half = (vert ? z[0] : z[1]) / 2 + MOUTH;
              const off = Math.abs(clamp - (vert ? a[0] : a[1]));
              if (off > half) shut.push(s.from + '->' + s.to + ' short by ' + (off - half).toFixed(0));
            }
            ok(seams.length >= 10 && shut.length === 0,
              '⛑⛑ …and a body pressed against the wall is STILL on the seam\'s mat',
              shut.length ? 'CANNOT CROSS: ' + shut.join(', ')
                          : seams.length + ' seams, every mouth reaches the clamp');
          }
          /* ⛑⛑ THE BUG THAT MADE THE FIRST SEAM DO NOTHING AT ALL. */
          ok(/scene_path = "res:\/\/town\/town\.tscn"/.test(twn.slice(twn.indexOf('class TownSeam'))),
            '⛑⛑ a seam carries a scene_path even though interact() ignores it',
            'TownDoor._physics_process early-returns on an empty one, so it never arms or fires');
          ok(/GameState\.reentry\.erase\("res:\/\/town\/town\.tscn"\)/.test(twn),
            '⚠⚠ …and it erases the door note, because all five windows are ONE scene file');
          /* ⚠⚠ ORDER: capture the minimap, then cull, then add the seams. */
          const fur = fnGd(twn, '_furnish');
          ok(fur.indexOf('TownMap.capture') < fur.indexOf('_cull_to_region()')
            && fur.indexOf('_cull_to_region()') < fur.indexOf('_furnish_seams()'),
            '⛑⛑ the journal map is captured BEFORE the cull, and the seams are added AFTER it',
            'captured after, the map loses three quarters of the town; culled after, every seam is thrown away');
          ok(/world_bounds = region_rect\(region\)/.test(twn),
            '⚠ the walls are the window\'s, not the whole map\'s');
          /* ⛑⛑ AND THE SOLID THINGS ARE NOT THE WINDOW'S. One positionless StaticBody2D carries
             every water rect and every fenced corner, so `_cull_to_region` filed the lot by (0,0)
             — the square, where not one of them can be reached — and deleted them in the windows
             that DRAW them. Measured 2026-09-28 with a shape query: the sea was walkable in the
             south window and both fenced corners were open in the north. */
          ok(/func _furnish_walls[\s\S]{0,600}?add_to_group\("town_everywhere"\)/.test(twn),
            '⛑⛑ …and the water and the fences opt OUT of it, because a wall is the MAP\'s',
            'filed by position they all land in the square and the sea becomes walkable');
        }

        /* ══ 44. NOBODY WALKS THROUGH BARK ══════════════════════════════════════════════════
           2026-09-28. The trunks went solid on 09-26 but only the PLAYER and Princess were ever
           stopped by them: a person's `patrol` and Crockett's `_pace` both moved by assigning a
           position outright, and the check they needed was sitting on TownDog three functions
           away from one of them. It lives on TownNPC now and a walker inherits it by walking.
           Verified in the engine, square window, 16 assertions: a person and a dog each driven
           into real geometry for 900 frames, 0 frames left standing inside anything, both still
           able to slide round it. Five mutants armed, five killed — including one that shrank
           the walker's own probe circle, which SURVIVED until the probe stopped asking the code
           under test to mark its own homework. */
        {
          const npcW = rd('npc.gd'), dogW = rd('dog.gd');
          const bareW = (src) => src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
          ok(/func _blocked\(at: Vector2\) -> bool:/.test(npcW)
            && /func _step_toward\(want: Vector2\) -> Vector2:/.test(npcW),
            '⛑⛑ TownNPC owns the collision check, so every walker in town inherits it',
            'it used to live on TownDog, which is why the people walked through trees');
          ok(!/func _blocked\(/.test(bareW(dogW)) && !/func _step_toward\(/.test(bareW(dogW)),
            '…and TownDog no longer carries a second copy of it  [[one-fix-every-instance]]');
          /* ⚠⚠ THE PROBE IS NOT THE BODY. A dog fits through gaps a person does not. */
          ok(/func _foot_r\(\) -> float:\s*\n\s*return FOOT_R/.test(npcW),
            '⚠ a person probes with their own footprint');
          ok(/func _foot_r\(\) -> float:\s*\n\s*return PAW_R/.test(dogW)
            && /const PAW_R := 9\.0/.test(dogW),
            '…and a dog overrides it narrower  (9 against 14), so she is not a short human');
          /* ⛑⛑ THE TWO GAITS THAT DID NOT CALL IT. Both are a position assignment away from
             being the bug again, and neither has a test that would notice by looking. */
          const patW = fnGd(npcW, '_process');
          ok(/_step_toward\(_base \+ patrol/.test(patW)
            && !/position = _base \+ patrol/.test(bareW(patW)),
            '⛑⛑ a person\'s patrol STEPS, it does not assign a position',
            'assigning it walks them through trunks, fences, houses and each other');
          const paceW = fnGd(dogW, '_pace');
          ok(/_gait \+= _step_toward\(/.test(paceW)
            && !/global_position = _to|global_position = to/.test(bareW(paceW)),
            '⛑⛑ …and Milo\'s pace does too — the one gait in dog.gd that never checked');
          /* ⚠⚠ A GAIT PACED OFF THE STEP REQUESTED skates on the spot against a wall. */
          ok(/-> Vector2:/.test(fnGd(npcW, '_step_toward'))
            && /return global_position - was/.test(fnGd(npcW, '_step_toward')),
            '⚠⚠ _step_toward returns how far they ACTUALLY got, not how far they asked',
            'paced off the request, the legs run while the body is against a tree');
          ok(/_gait \+= \(global_position - was\)\.length\(\)/.test(fnGd(dogW, '_walk_to')),
            '…and _walk_to still measures the same way it always did');
        }

        /* ══ 45. A CROSSING LOOKS LIKE ONE ══════════════════════════════════════════════════
           2026-09-28. The five windows landed working and arrived HARD — you walked onto a seam
           and the town was instantly a different town, which reads as a stutter rather than a
           journey. fade.gd is the quarter second that fixes it: the window you leave fades to
           black and dies black, the one you arrive in is born black and clears.
           ⚠⚠ IT IS TWO NODES BECAUSE change_scene_to_file FREES THE SCENE. Nothing can live
           across the swap, so both ends are opaque at the hand-over and the seam is invisible. */
        {
          const fd = rd('fade.gd'), twF = rd('town.gd');
          ok(/class_name TownFade/.test(fd) && /extends CanvasLayer/.test(fd),
            '⭐ a seam crossing goes dark first  (fade.gd)');
          ok(/const OVER_ALL := 200/.test(fd),
            '⚠⚠ …on a layer above everything  (the highest else in the game is photo.gd at 108)');
          /* ⛑⛑ A SEAM FIRES EVERY PHYSICS FRAME YOU STAND ON IT, and change_scene_to_file does
             not swap until idle — so the ~10 ticks inside the fade would each queue another. */
          ok(/static func busy\(\) -> bool:/.test(fd) && /if busy\(\):\s*\n\s*return/.test(fd),
            '⛑⛑ …and a second crossing cannot start while one is running');
          ok(/_busy_us/.test(fd) && /Time\.get_ticks_usec\(\) - _busy_us < BUSY_US/.test(fd),
            '⚠ …a TIMESTAMP not a flag, so a fade that never hands over unblocks itself',
            'a stuck bool would wedge every future crossing shut  [[down-never-stuck]]');
          ok(/then\.call\(\)/.test(fnGd(fd, 'cross')),
            '⚠⚠ …and it still crosses if it cannot fade  (a transition may not eat the journey)');
          ok(/add_to_group\("town_cover"\)/.test(fd),
            '⚠ the feet stop while it goes dark, through the town\'s existing cover');
          /* ⚠⚠ uncovered() STARTS A 150ms WINDOW IN WHICH covered() IS STILL TRUE. The fade IN
             never covered anybody, so ringing it there freezes the feet on arrival. */
          /* ⚠ COMMENTS STRIPPED FIRST. The note explaining why this call must NOT be here says
             its name, and a regex reading the raw function cannot tell a warning from a bug. */
          const doneF = fnGd(fd, '_done').split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
          ok(!/TownZone\.uncovered\(\)/.test(doneF),
            '⛑⛑ …and the fade IN never calls uncovered(), which would freeze the feet it frees');
          ok(/TownFade\.landing\(self\)/.test(fnGd(twF, '_after_ready')),
            '…and the window you arrive in clears from black');
          ok(/if not _landed/.test(fnGd(fd, 'landing')),
            '⚠ …only when a SEAM put you there — a save or a house door opens on the town');
          /* ⚠⚠ NOTHING IS DECIDED UNTIL THE SCREEN IS BLACK. Setting the region up front would
             leave the statics describing a window that is not on screen for a fifth of a second. */
          const seamF = twF.slice(twF.indexOf('class TownSeam'));
          ok(/TownFade\.cross\(self, func\(\) -> void:/.test(seamF)
            && seamF.indexOf('TownFade.cross') < seamF.indexOf('CheckerTown.region = to_region'),
            '⛑⛑ the seam decides nothing until the fade has finished',
            'region set before the swap describes a window nobody is looking at yet');
        }

        /* ══ 46. THE TOWNSFOLK SHIP AS A PICTURE ════════════════════════════════════════════
           2026-09-28. Baking the idle bank at load cost 64 GPU readbacks and kept a whole rig
           alive while they happened. MEASURED, desktop GPU, same scene both ways:
             baking (as shipped 09-27)   first cell frame 9, all 64 at frame 513  (8.5 seconds)
             loading the atlas           first cell frame 1, all 64 at frame 1
           For 8.5 seconds every NPC was falling back to a cell of the wrong facing. The atlas
           costs 245 KB of PNG (2048x512, 19.7% of it figure) and +229 KB on a 977 KB pck —
           about 2% of what a player actually downloads, against a 37.7 MB engine.
           ⚠⚠ THE BAKE IS THE FALLBACK, NOT DEAD CODE. Proved by deleting the atlas: the town
           still fills with people, off ImageTextures instead of AtlasTextures. */
        {
          const sh = rd('people_sheet.gd');
          ok(/const SHEET := "res:\/\/art\/people_idle\.png"/.test(sh)
            && fs.existsSync(GDF('people_idle.png')),
            '⭐ the idle bank ships as one atlas instead of 64 readbacks at load');
          ok(fs.existsSync(GDF('people_idle.png.import')),
            '⚠ …and its .import rides along, or the export has a PNG nothing can load');
          const rdy = fnGd(sh, '_ready');
          ok(/if _load_sheet\(\):\s*\n\s*return/.test(rdy) && /_bake_all\(\)/.test(rdy),
            '⛑⛑ …and a missing or stale atlas BAKES instead, rather than emptying the town',
            'generated art must never be the only way to have a body  [[down-never-stuck]]');
          /* ⚠⚠ THE LAYOUT IS A CONTRACT SHARED WITH THE GENERATOR. Slice it differently from
             the way it was baked and everybody has a body, a shadow and the wrong face. */
          const ld = fnGd(sh, '_load_sheet');
          ok(/var slot := f \* IDLES \+ i/.test(ld),
            '⚠⚠ …sliced with the same arithmetic it was baked with  (slot = facing * IDLES + idle)');
          ok(/tex\.get_width\(\) != want_w \|\| tex\.get_height\(\) != want_h/.test(ld)
            || /tex\.get_width\(\) != want_w or tex\.get_height\(\) != want_h/.test(ld),
            '⚠ …and a sheet of the wrong SIZE is refused, not sliced into garbage');
          ok(/AtlasTexture/.test(ld) && /at\.atlas = tex/.test(ld),
            '⭐ …as 64 AtlasTextures into ONE image, so there is one texture in memory');
          ok(/static func filled\(\) -> int:/.test(sh),
            '⚠ filled() counts CELLS, not the array\'s size  (resize fills it with nulls)');
        }

        /* ══ 47. PRINCESS WAITS OUTSIDE THE ASSEMBLY ════════════════════════════════════════
           2026-09-28, his: *"can you have her wait outside the assembly for me?"* — chosen over
           making her a fixture and over teaching a follower to cross a seam. She is a NORTH
           character now: she stands at her post until you come up the road, heels while you are
           there, and is back at the post next time you climb it. Nothing about her was deleted.

           ⛑⛑ THE BUG THIS CLOSES IS A DOG WALKING OFF THE PAINTED MAP. A dog has no seam to
           walk through, and both of her destinations are in other windows — the home door is in
           the square, the dock is in the south. Measured with the guard reverted: at curfew she
           walks 893 units OUTSIDE the north window and ends on HOME_AT at (-246, 433), in full
           view, across a thousand units of unfurnished sand.
           ⚠⚠ NOTHING IN dog.gd CHANGED. Vector2.ZERO already meant exactly this in both places:
           an empty door_home skips the walk and steps her out where she stands, and an empty
           `water` is the first thing _water_night() tests. The fix is withholding a destination
           she cannot reach, not teaching her a new behavior.
           Verified in the engine over a full day of the clock: 14 assertions, midday through
           curfew and back to morning, sampling her position EVERY frame — 0 units outside the
           window at any point. Mutant armed and killed. */
        {
          const twP = rd('town.gd');
          const gk = fnGd(twP, '_furnish_gatekeepers');
          ok(/dog\.position = HALL_AT \+ Vector2\(210\.0, 120\.0\)/.test(gk),
            '⭐ Princess waits outside the Assembly  (his pick, 2026-09-28)');
          /* ⚠⚠ ASKED PER WINDOW, NOT HARD-CODED TO THE NORTH — move her and the door returns. */
          ok(/if region_of\(wet\) == region:\s*\n\s*dog\.water = wet/.test(gk),
            '⛑⛑ …and the dock is only given to her if it is in THIS window',
            'the dock is in the south: unguarded she walks out of the north to reach it');
          ok(/if region_of\(HOME_AT\) == region:\s*\n\s*dog\.door_home = HOME_AT/.test(gk),
            '⛑⛑ …and so is the home door  (it is in the square)',
            'measured unguarded: 893 units outside the window, ending on HOME_AT');
          /* ⚠ THE SENTINELS town.gd IS RELYING ON. If either stops meaning "nowhere", the
             guard above silently becomes a dog with no home and no water instead of a dog
             who stays put — and both read the same from the outside on a quiet afternoon. */
          const dogP = rd('dog.gd');
          ok(/if water == Vector2\.ZERO or not TownClock\.is_dark\(\):/.test(fnGd(dogP, '_water_night')),
            '⚠⚠ …and an empty `water` still means no water night');
          ok(/door_home != Vector2\.ZERO and not _walk_to\(door_home/.test(fnGd(dogP, '_process')),
            '⚠⚠ …and an empty door_home still means "step out where you stand"');
          ok(/if door_home != Vector2\.ZERO:\s*\n\s*global_position = door_home/.test(fnGd(dogP, '_step_in')),
            '⚠ …and coming back on duty does not teleport her to a door in another window  (an empty door_home is nowhere)');
          /* ⚠ SHE IS STILL THE COMPANION. The whole point of his pick over the other two. */
          ok(/"companion": true/.test(dogP),
            '⭐ …and she is still a companion — she heels while you are up there');
        }

        /* ⚠⚠ CANON, RULED 2026-08-14: nobody tells her and nobody knows. The beat lines are
           the easiest place in the project to break it, because they are narration. */
        ok(!/tilt|planet|\bBill\b|queen/i.test(st.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')),
          '⚠⚠ no beat explains what Princess is doing  [[private/_pjcc/notes.md — WHO KNOWS]]');
      }
      }
    } else {
      ok(false, 'the Godot project is missing from ' + GD);
    }
  } finally {
    await browser.close();
    server.close();
  }

  process.exit(report('CHECKER TOWN — the seam the site answers through', results, []) ? 0 : 1);
})();
