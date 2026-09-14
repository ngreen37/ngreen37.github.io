// Blindfold Puzzles gate (assets/games/pjcc_blindfold.html) — rules, the Daily, typed moves, the
// Mind's Eye, and the two unlocks that sync.   run: npm run test:blindfold
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const { findChrome } = require('./harness');
const pp = require(path.join(ROOT, 'node_modules/puppeteer-core'));

let PASS = 0, FAIL = 0;
function ok(cond, msg) { if (cond) { PASS++; console.log('  ✓ PASS  ' + msg); } else { FAIL++; console.log('  ✗ FAIL  ' + msg); } }
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const GAME = '/assets/games/pjcc_blindfold.html';
const MARKER = '  buildBoard(); buildMeBoard(); newPuzzle();';
// injected INSIDE the game's closure, so it can reach what the page keeps private
const HOOK = `
  window.__bf = {
    typed: function (fen, t) { return typedMoves(parseFEN(fen), t).map(function (m) { return nameFromSq(m.from) + nameFromSq(m.to) + (m.promo || ''); }); },
    state: function () { return { solved: st.solved, streak: st.streak, phase: phase, slip: curMistake, mode: mode, prob: !!prob,
      reveal: document.getElementById('reveal').disabled, msg: document.getElementById('msg').textContent }; },
    setProb: function (fen, goal, uci) {
      var S = parseFEN(fen), L = legalMoves(S);
      var sols = uci.map(function (u) { return L.filter(function (m) { return nameFromSq(m.from) === u.slice(0, 2) && nameFromSq(m.to) === u.slice(2, 4); })[0]; });
      prob = { S: S, goal: goal, sols: sols, from: nameFromSq(sols[0].from), to: nameFromSq(sols[0].to), clue: describeBoard(S.b), d: 5 };
      clearPieces(); clearMarks(); phase = 'from'; curMistake = false; document.getElementById('reveal').disabled = false;
    },
    submit: function (t) { document.getElementById('describe-in').value = t; submitDescribe(); },
    click: function (sq) { clickSquare(sq); },
    reveal: function () { failReveal(); },
    setMode: function (m) { document.querySelector('#modebar .mode-btn[data-mode="' + m + '"]').click(); },
    solFrom: function () { return prob ? prob.sols.map(function (s) { return nameFromSq(s.from); }) : []; },
    me: function () { return { busy: meBusy, promo: !!mePromo, w: meClockW, b: meClockB, ended: meEnded, board: ME ? ME.b.join('') : '',
      e8: ME ? ME.b[4] : '', turn: ME ? ME.turn : '', moves: meMoves.length, status: document.getElementById('me-status').textContent,
      log: Array.prototype.map.call(document.querySelectorAll('#me-log > div'), function (d) { return d.textContent; }) }; },
    setME: function (fen) { ME = parseFEN(fen); meMoves = []; meBook = null; meReps = {}; meHalf = 0; meEnded = false; meBusy = false; meSel = null; drawMe(); },
    clock: function (w, b) { meClockW = w; meClockB = b; },
    startClock: function () { startMeClock(); }
  };
`;

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(ROOT, p);
      fs.readFile(f, (err, buf) => {
        if (err) { rsp.writeHead(404); rsp.end(); return; }
        let body = buf;
        if (p === GAME) {
          const s = buf.toString('utf8'), i = s.lastIndexOf(MARKER);
          if (i < 0) { rsp.writeHead(500); rsp.end('marker missing'); return; }
          body = s.slice(0, i) + HOOK + s.slice(i);
        }
        const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream';
        rsp.writeHead(200, { 'Content-Type': type }); rsp.end(body);
      });
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  console.log('\n=== Blindfold Puzzles ===');

  /* ── the two unlocks sync: push, merge and event, read out of the source ─────────── */
  const PROF = read('assets/js/pjcc-profile.js'), NRUN = read('assets/games/notation_run.html');
  const BFSRC = read('assets/games/pjcc_blindfold.html'), WRAP = read('games/blindfold-puzzles/index.html');
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const push = strip((NRUN.match(/var pay = \{[\s\S]*?saveScore\('notation-run'[^\n]*/) || [''])[0]);
  ok(/getItem\('pjcc\.blindfold\.unlocked'\) === '1'\) pay\.bf = true/.test(push), 'Notation Blitz pushes the Blindfold door only when this browser has earned it');
  const iDoor = NRUN.indexOf("localStorage.setItem('pjcc.blindfold.unlocked', '1')"), iPush = NRUN.indexOf("saveScore('notation-run'");
  ok(iDoor > 0 && iPush > 0 && iDoor < iPush, '…and banks the door BEFORE the push that carries it  [door ' + iDoor + ' / push ' + iPush + ']');
  ok(/nr\.data\.bf && bfDoorMerge\(true\)/.test(PROF), 'pjcc-profile.js reads the same field back off the notation-run row');
  ok(/r\.game === 'blindfold'/.test(PROF) && /bfProgressMerge\(bfr\)/.test(PROF), '…and merges the blindfold row from the same pull');
  ok((PROF.match(/PJCC\.myStats\(\)/g) || []).length === 1, '…without a second myStats() round trip');
  const evt = (PROF.match(/dispatchEvent\(new Event\('([^']+)'\)\)/) || [])[1];
  ok(!!evt && strip(BFSRC).includes("addEventListener('" + evt + "'"), 'the game repaints on the event the merge fires  [' + evt + ']');
  ok(!!evt && strip(WRAP).includes("addEventListener('" + evt + "'"), 'the locked page opens on the same event');
  {
    const src = PROF.slice(PROF.indexOf('var NRUN_KEY ='), PROF.indexOf('var TOWN_KEY'));
    const box = { store: {}, out: null };
    box.localStorage = { getItem: k => (k in box.store ? box.store[k] : null), setItem: (k, v) => { box.store[k] = String(v); } };
    vm.createContext(box);
    try { vm.runInContext(src + '\nout = { door: bfDoorMerge, prog: bfProgressMerge };', box); } catch (e) { ok(false, 'the merges run outside a browser: ' + e.message); }
    const M = box.out || {};
    if (M.door && M.prog) {
      ok(M.door(true) === true && box.store['pjcc.blindfold.unlocked'] === '1' && M.door(true) === false, 'an account with the door opens it on a fresh device, once');
      ok(M.door(false) === false && box.store['pjcc.blindfold.unlocked'] === '1', '…and a row with no news cannot shut it');
      const got = M.prog({ best_score: 23, data: { trophy: 'minds-eye' } });
      const st = JSON.parse(box.store['pjcc.blindfold.v2'] || '{}');
      ok(got === true && st.solved === 23 && st.eye === true && st.trophy === true, "the account's solved count opens the Mind's Eye and brings the trophy  [solved=" + st.solved + ']');
      ok(M.prog({ best_score: 23, data: {} }) === false, '…and a second identical pull changes nothing');
      box.store['pjcc.blindfold.v2'] = JSON.stringify({ solved: 40, diff: 7, best: 40, streak: 3, eye: true, trophy: false });
      M.prog({ best_score: 12, data: {} });
      const kept = JSON.parse(box.store['pjcc.blindfold.v2']);
      ok(kept.solved === 40 && kept.diff === 7 && kept.streak === 3, 'a lower account count never walks a device backwards');
      box.store['pjcc.blindfold.v2'] = JSON.stringify({ solved: 3, diff: 2, best: 3, streak: 0, eye: false, trophy: false });
      M.prog({ best_score: 19, data: {} });
      ok(JSON.parse(box.store['pjcc.blindfold.v2']).eye === false, '…and 19 solved does not open a door that wants 20');
    }
  }

  const exe = findChrome();
  if (!exe) { console.log('No Chrome/Edge found.'); process.exit(2); }
  const srv = await serve();
  const port = srv.address().port;
  const browser = await pp.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--mute-audio'] });
  const errs = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 560, height: 900 });
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(`http://127.0.0.1:${port}${GAME}`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__bf, { timeout: 8000 });
    const B = (fn, ...a) => page.evaluate(fn, ...a);

    /* ── no position a game cannot reach ─────────────────────────────────────── */
    const gen = await B(() => {
      let bad = 0, withPawns = 0, n = 0;
      for (let d = 5; d <= 10; d++) for (let i = 0; i < 60; i++) {
        const b = genMate(d).S.b; n++;
        if (b.indexOf('p') >= 0) withPawns++;
        for (let f = 0; f < 8; f++) if (/[pP]/.test(b[f] || '') || /[pP]/.test(b[56 + f] || '')) { bad++; break; }
      }
      return { bad, withPawns, n };
    });
    ok(gen.bad === 0 && gen.withPawns > 20, 'no generated puzzle has a pawn on rank 1 or 8, and blockers still appear  [' + gen.bad + ' bad, ' + gen.withPawns + '/' + gen.n + ' with pawns]');

    /* ── a typed move is read like a referee reads it ────────────────────────── */
    const t = await B(() => {
      const T = window.__bf.typed, Q = '6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1', NN = '4k3/8/8/8/8/8/8/1N2KN2 w - - 0 1';
      const BB = '4k3/8/2n5/1P6/4B3/8/8/4K3 w - - 0 1', PR = '8/4P3/8/8/8/8/8/k6K w - - 0 1', CA = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
      return { qh5: T(Q, 'Qh5'), lower: T(Q, 'qh5'), coord: T(Q, 'd1h5'), bare: T(Q, 'h5'), nd2: T(NN, 'Nd2'), nbd2: T(NN, 'Nbd2'),
        bc6: T(BB, 'bc6'), Bc6: T(BB, 'Bc6'), bxc6: T(BB, 'bxc6'), e8: T(PR, 'e8'), e8n: T(PR, 'e8=N'), e7e8r: T(PR, 'e7e8r'),
        oo: T(CA, 'O-O'), ooo: T(CA, '0-0-0'), junk: T(Q, 'hello'), check: T(Q, 'Qd8+') };
    });
    ok(t.qh5.join() === 'd1h5' && t.lower.join() === 'd1h5' && t.coord.join() === 'd1h5', 'Qh5, qh5 and d1h5 all name the one queen move');
    ok(t.bare.length === 0, 'a bare square is a PAWN move, so "h5" is not the queen  [' + t.bare.join() + ']');
    ok(t.nd2.length === 2 && t.nbd2.join() === 'b1d2', '"Nd2" with two knights is ambiguous; "Nbd2" is not  [' + t.nd2.join('/') + ']');
    ok(t.bc6.length === 2 && t.Bc6.join() === 'e4c6', 'lowercase "bc6" could be the bishop or the b-pawn; "Bc6" is the bishop  [' + t.bc6.join('/') + ']');
    ok(t.bxc6.length === 2, '…and "bxc6" is read both ways too, rather than guessed');
    ok(t.e8.join() === 'e7e8Q' && t.e8n.join() === 'e7e8N' && t.e7e8r.join() === 'e7e8R', 'promotion: "e8" queens, "e8=N" and "e7e8r" pick the piece  [' + t.e8 + ' ' + t.e8n + ' ' + t.e7e8r + ']');
    ok(t.oo.join() === 'e1g1' && t.ooo.join() === 'e1c1', 'O-O and 0-0-0 both castle');
    ok(t.junk.length === 0 && t.check.join() === 'd1d8', 'nonsense names nothing; a check mark is ignored');

    // the describe flow: typing problems are not slips, a wrong move is
    const fl = await B(async () => {
      const bf = window.__bf; bf.setMode('describe'); await new Promise(r => setTimeout(r, 80));
      bf.setProb('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', 'Mate in one', ['a1a8']);
      const s0 = bf.state().streak;
      bf.submit('Qh5'); const afterIllegal = bf.state();
      bf.submit('Ra7'); const afterWrong = bf.state();
      bf.submit('Ra8'); const afterSolve = bf.state();
      bf.setProb('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', 'Mate in one', ['a1a8']);
      bf.submit('a1a8'); const clean = bf.state();
      return { s0, afterIllegal, afterWrong, afterSolve, clean };
    });
    ok(!fl.afterIllegal.slip && fl.afterIllegal.phase === 'from', 'an illegal typed move says so and is not counted as a slip  ["' + fl.afterIllegal.msg + '"]');
    ok(fl.afterWrong.slip === true, 'a legal wrong move is a slip');
    ok(fl.afterSolve.phase === 'done' && fl.afterSolve.streak === 0, '…and the solve after it is not clean');
    ok(fl.clean.phase === 'done' && fl.clean.streak === 1, 'a clean typed solve counts  [streak ' + fl.clean.streak + ']');

    /* ── Reveal after a solve costs nothing ──────────────────────────────────── */
    const rv = await B(() => { const bf = window.__bf; const before = bf.state(); bf.reveal(); const after = bf.state();
      const miss = JSON.parse(localStorage.getItem('pjcc.blindfold.missed.v1') || '[]').length;
      return { before, after, miss }; });
    ok(rv.before.reveal === true, 'the Reveal button is disabled once the puzzle is solved');
    ok(rv.after.streak === rv.before.streak && rv.after.phase === 'done', 'revealing a solved puzzle keeps the streak  [' + rv.before.streak + ' -> ' + rv.after.streak + ']');

    /* ── the Daily cannot be washed ──────────────────────────────────────────── */
    const dl = await B(async () => {
      const bf = window.__bf, wait = () => new Promise(r => setTimeout(r, 60));
      localStorage.removeItem('pjcc.bf.daily');
      bf.setMode('daily'); await wait();
      const from = bf.solFrom();
      const wrong = ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'a2', 'b2'].find(s => from.indexOf(s) < 0);
      bf.click(wrong); const slipped = bf.state().slip;
      const rec = JSON.parse(localStorage.getItem('pjcc.bf.daily') || '{}');
      bf.setMode('classic'); await wait(); bf.setMode('daily'); await wait();
      const back = bf.state();
      bf.reveal(); const recAfter = JSON.parse(localStorage.getItem('pjcc.bf.daily') || '{}');
      bf.setMode('classic'); await wait(); bf.setMode('daily'); await wait();
      return { slipped, recSlip: rec.slip, backSlip: back.slip, done: recAfter.done, againProb: bf.state().prob };
    });
    ok(dl.slipped && dl.recSlip === true, "a slip on today's Daily is written down");
    ok(dl.backSlip === true, '…so switching modes and back does not wash it');
    ok(dl.done === true && dl.againProb === false, 'revealing the Daily finishes it: it cannot be re-solved as clean');

    /* ── the flashlight works from a keyboard ───────────────────────────────── */
    await B(() => window.__bf.setMode('classic'));
    await sleep(80);
    const torchIsButton = await B(() => { const t = document.getElementById('bf-torch'); t.classList.remove('caught'); t.focus(); return t.tagName === 'BUTTON' && document.activeElement === t; });
    await page.keyboard.press('Enter');
    await sleep(60);
    ok(torchIsButton && (await B(() => document.getElementById('clue').classList.contains('lit'))), 'the flashlight is a button: Tab to it, Enter catches it');

    /* ── the Mind's Eye ─────────────────────────────────────────────────────── */
    await B(() => { localStorage.setItem('pjcc.blindfold.v2', JSON.stringify({ solved: 25, diff: 2, best: 25, streak: 0, eye: true, trophy: false })); });
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__bf && !!document.getElementById('me-launch'), { timeout: 8000 });
    await page.click('#me-launch');
    await sleep(150);
    const clockShown = await B(() => getComputedStyle(document.getElementById('me-clock')).display);
    ok(clockShown === 'none', 'with Blitz off there is no clock on screen  [display ' + clockShown + ']');
    const clockOn = await B(() => { const c = document.getElementById('me-blitz'); c.checked = true; document.getElementById('me-close').click(); document.getElementById('me-launch').click();
      const d = getComputedStyle(document.getElementById('me-clock')).display; c.checked = false; document.getElementById('me-close').click(); document.getElementById('me-launch').click(); return d; });
    ok(clockOn === 'flex', '…and with Blitz on, there is  [display ' + clockOn + ']');
    // promotion asks, and the answer is played
    const pr = await B(async () => {
      const bf = window.__bf, sq = s => document.querySelector('#me-board .me-sq[data-sq="' + s + '"]');
      bf.setME('k7/4P3/8/8/8/8/8/7K w - - 0 1');
      sq('e7').click(); sq('e8').click();
      const asking = bf.me();
      const vis = !document.getElementById('me-promo').hidden;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
      return { asking, vis, after: bf.me() };
    });
    ok(pr.vis && pr.asking.promo && pr.asking.moves === 0, 'a promotion stops and asks which piece  [' + pr.asking.status + ']');
    ok(pr.after.e8 === 'N' && pr.after.moves === 1, 'N underpromotes to a knight  [e8=' + pr.after.e8 + ']');

    // the move log pairs a move with its reply, even when the engine has to answer
    await B(() => { const bf = window.__bf; bf.setME('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); document.getElementById('me-log').innerHTML = '';
      window.__eng = window.PJCCGauntletEngine; window.PJCCGauntletEngine = { move: () => Promise.resolve(null), warmup() {}, newGame() {} };
      const sq = s => document.querySelector('#me-board .me-sq[data-sq="' + s + '"]'); sq('a2').click(); sq('a3').click(); });
    let lg = null;
    for (let i = 0; i < 40; i++) { await sleep(150); lg = await B(() => window.__bf.me()); if (lg.moves >= 2) break; }
    ok(lg.moves === 2 && !/Stalemate/.test(lg.status), 'an engine that answers nothing is not a stalemate: the local search replies  [' + lg.status + ']');
    ok(lg.log.length === 1 && /^1\.\s*a3\s+\S+$/.test(lg.log[0].trim()), 'the log reads "1. a3 …" on ONE line  [' + JSON.stringify(lg.log) + ']');

    // the blitz clock burns real time, and a flag against a lone king is a draw
    const ck = await B(async () => {
      const bf = window.__bf;
      bf.setME('4k3/8/8/8/8/8/4P3/4K3 w - - 0 1'); bf.clock(10, 10); bf.startClock();
      await new Promise(r => setTimeout(r, 450));
      const spent = 10 - bf.me().w;
      bf.clock(0.2, 10);
      await new Promise(r => setTimeout(r, 500));
      return { spent, lone: bf.me() };
    });
    ok(ck.spent > 0.25 && ck.spent < 0.75, 'half a second of thinking costs half a second  [' + ck.spent.toFixed(2) + 's]');
    ok(ck.lone.ended && /Drawn/.test(ck.lone.status), 'your flag falling against a lone king is a draw  [' + ck.lone.status + ']');
    const ck2 = await B(async () => {
      const bf = window.__bf; document.getElementById('me-close').click(); document.getElementById('me-launch').click();
      bf.setME('4k3/3q4/8/8/8/8/4P3/4K3 w - - 0 1'); bf.clock(0.2, 10); bf.startClock();
      await new Promise(r => setTimeout(r, 500));
      return bf.me();
    });
    ok(ck2.ended && /wins on time/.test(ck2.status), '…and against a queen it is a loss  [' + ck2.status + ']');

    /* ── the account's progress repaints the room ───────────────────────────── */
    await B(() => { document.getElementById('me-close').click(); window.PJCCGauntletEngine = window.__eng;
      localStorage.setItem('pjcc.blindfold.v2', JSON.stringify({ solved: 3, diff: 2, best: 3, streak: 0, eye: false, trophy: false })); });
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__bf, { timeout: 8000 });
    const sync = await B(() => {
      const before = !!document.getElementById('me-launch');
      localStorage.setItem('pjcc.blindfold.v2', JSON.stringify({ solved: 21, diff: 2, best: 21, streak: 0, eye: true, trophy: false }));
      window.dispatchEvent(new Event('pjcc:unlocks'));
      return { before, after: !!document.getElementById('me-launch'), solved: document.getElementById('solved').textContent };
    });
    ok(!sync.before && sync.after && sync.solved === '21', "progress merged from the account opens the Mind's Eye without a reload  [solved " + sync.solved + ']');

    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const calm = await B(() => getComputedStyle(document.getElementById('bf-torch')).animationName);
    ok(calm === 'none', 'reduced motion: the flashlight holds still  [animation ' + calm + ']');
  } catch (e) {
    FAIL++; console.log('  ✗ FAIL  harness threw: ' + e.message);
  } finally {
    await browser.close(); srv.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ' -> ' + errs.slice(0, 3).join(' | ') : ''));
  console.log('\nRESULT: ' + (FAIL ? 'FAIL (' + FAIL + '/' + (PASS + FAIL) + ' checks failed)' : 'PASS (' + PASS + ' checks)'));
  process.exit(FAIL ? 1 : 0);
})();
