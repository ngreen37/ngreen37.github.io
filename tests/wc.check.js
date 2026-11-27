/* wc.check.js — chesswild.com/wc/, the World Championship (his 11-26 growth picks #1 #2 #3 #5).   run: npm run test:wc
   · the data file's puzzles are PROVEN here, not trusted: each answer is legal in its position, is that position's
     side to move, and stands where the game says it does
   · the puzzle finder's rules, on a stand-in engine (no Stockfish in a gate)
   · the page in Chrome: two puzzles that grade a move, the predictions panel ABSENT until the SQL runs and whole
     when it has (a stand-in account), every pick a button, no codename unescaped, nothing sliding sideways on a phone
   · Championship Eye with the real pjcc-profile.js: the first try kept, and banked only for a finished match
   · game day: the sign-off says the URL, the clip machine settles results and writes the YouTube text */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const ROOT = path.join(__dirname, '..');
const C = require('../assets/js/pjcc-chess.js');
const P = require('./wc-puzzle.js');
const S = require('./wc-site.js');
const H = require('./harness.js');

let PASS = 0, FAIL = 0;
function ok(c, msg, why) { if (c) { PASS++; console.log('  ✓ ' + msg); } else { FAIL++; console.log('  ✗ ' + msg + (why ? '   ' + why : '')); } }
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

console.log('\n=== /wc/ — the World Championship ===');

/* ── 1. the data file: every puzzle proven ─────────────────────────────────────────────── */
const data = JSON.parse(read('assets/data/wc2026.json'));
const bad = [];
let puzzles = 0;
for (const g of data.games) {
  if (!g.puzzle) continue;
  puzzles++;
  const pz = g.puzzle, St = C.parseFEN(pz.fen);
  const mv = C.legalMoves(St).filter((m) => C.nameFromSq(m.from) === pz.uci.slice(0, 2) && C.nameFromSq(m.to) === pz.uci.slice(2, 4))[0];
  if (!mv) { bad.push('Game ' + g.game + ': ' + pz.uci + ' is not legal'); continue; }
  if (St.turn !== pz.side) bad.push('Game ' + g.game + ': the position has ' + St.turn + ' to move, the puzzle says ' + pz.side);
  if (C.toSAN(St, mv).replace(/[+#]$/, '') !== pz.san.replace(/[+#]$/, '')) bad.push('Game ' + g.game + ': ' + pz.uci + ' is ' + C.toSAN(St, mv) + ', not ' + pz.san);
  if (Math.ceil(pz.ply / 2) !== pz.move || (pz.ply % 2 === 1 ? 'w' : 'b') !== pz.side) bad.push('Game ' + g.game + ': ply ' + pz.ply + ' is not ' + pz.move + pz.side);
  if (pz.found !== (pz.played.replace(/[+#!?]+$/, '') === pz.san.replace(/[+#!?]+$/, ''))) bad.push('Game ' + g.game + ': "found" disagrees with the move played');
}
ok(bad.length === 0 && puzzles >= 2 && data.games.length === 14 && data.games.every((g) => g.starts),
  '⭐ every puzzle on /wc/ is proven: the answer is legal, the side to move\'s, and named as the game names it  [' + (bad.join(' · ') || puzzles + ' puzzles, 14 games scheduled') + ']');
ok(data.games.filter((g) => g.result).every((g) => g.result === 'draw' || g.result === g.white || g.result === g.black)
  && (data.players || []).length === 2,
  'every result is a draw or one of the two players, as predict_settle will take it');

/* ── 2. the finder's rules, on a stand-in engine ───────────────────────────────────────── */
(async () => {
  const pgn = fs.readFileSync(path.join(__dirname, 'fixtures', 'wc2024.pgn'), 'utf8');
  const G = require('./gen-godot-game.js');
  const W = require('./gen-broadcast.js');
  const game = G.convert(W.splitGames(pgn)[0]);
  const pos = P.positions(game);
  const target = pos[30], early = pos[6];
  const engine = (gaps) => ({ top2: async (fen) => {
    const g = gaps[fen];
    const legal = C.legalMoves(C.parseFEN(fen)).map((m) => C.nameFromSq(m.from) + C.nameFromSq(m.to));
    return g ? [{ move: g.move || legal[0], cp: g.cp || 30 }, { move: legal[1], cp: (g.cp || 30) - g.gap }] : [{ move: legal[0], cp: 20 }, { move: legal[1], cp: 0 }];
  } });
  let got = await P.findPuzzle(game, engine({ [target.fen]: { gap: 400 }, [early.fen]: { gap: 900 } }));
  ok(got && got.ply === 31, '⭐ the finder takes the position whose best move stands furthest above the next, never one in the opening\'s first eight moves  [' + (got && got.ply) + ']');
  got = await P.findPuzzle(game, engine({ [target.fen]: { gap: 400, cp: 1200 } }));
  ok(got === null, '…never a position already won or lost (+12 against +8 is a formality, not a puzzle)');
  got = await P.findPuzzle(game, engine({ [target.fen]: { gap: 100 } }));
  ok(got && got.ply === 31, '…and a quiet game still gets one at the softer gap, before none at all');
  got = await P.findPuzzle(game, engine({}));
  ok(got === null, '…but a game with nothing clear gets none (Game 2), and says nothing about a puzzle');

  /* ── 3. the page in Chrome ───────────────────────────────────────────────────────────── */
  const md = read('wc.md'), js = read('assets/js/pjcc-wc.js');
  ok(/data-src="\{\{ '\/assets\/data\/wc2026\.json' \| relative_url \}\}"/.test(md) && /<div id="pjcc-profile-bar"><\/div>/.test(md)
     && ['pjcc-chess.js', 'pjcc-pieces.js', 'pjcc-wc.js'].every((f) => md.indexOf("'/assets/js/" + f + "' | relative_url") > 0)
     && /bar\.src = root\.getAttribute\('data-bar'\)/.test(js) && !/pjcc-profile\.js/.test(md),
    'the page loads its data, the board\'s two scripts and its own; the sign-in bar is loaded once PJCC exists, and pjcc-profile.js never twice');
  ok(/window\.addEventListener\(PJCC\.WCPZ_EVENT, /.test(js) && !/pjcc:wcpuzzles/.test(js)
     && /WCPZ_EVENT = 'pjcc:wcpuzzles'/.test(read('assets/js/pjcc-profile.js')) && /window\.dispatchEvent\(new Event\(WCPZ_EVENT\)\)/.test(read('assets/js/pjcc-profile.js')),
    'tries merged in from another device redraw the puzzles: the page listens on the module\'s own event name, never a copy of it');
  const css = H.siteCss();
  const MOCK = (signedIn) => '<script>(function(){var picks={},split=[{game:4,pick:"draw",n:7},{game:4,pick:"gukesh",n:3}];'
    + 'var q=function(v){return Promise.resolve({data:v,error:null});};'
    + 'var api={rpc:function(f){return f==="predict_split"?q(split):q([{codename:"<img src=x onerror=window.PWNED=1>",right_calls:2,called:3}]);},'
    + 'from:function(){return {select:function(){return {eq:function(){return q(Object.keys(picks).map(function(g){return {game:+g,pick:picks[g]};}));}};},'
    + 'upsert:function(r){window.UPSERT=r;picks[r.game]=r.pick;return q(null);}};}};'
    + 'window.PJCC={enabled:true,db:function(){return api;},ready:Promise.resolve(),onChange:function(){},'
    + 'currentUser:function(){return ' + (signedIn ? '{id:"u1"}' : 'null') + ';},getProfile:function(){return ' + (signedIn ? '{codename:"ngreen37"}' : 'null') + ';}};})();</script>';
  /* ⚠ onChange FIRES, as the real module's does on its first auth event: a stand-in that never fires it cannot see a
     page that probes again on every change (the break went uncaught until it did) */
  const ABSENT = '<script>window.PJCC={enabled:true,ready:Promise.resolve(),onChange:function(f){setTimeout(f,50);setTimeout(f,120);},currentUser:function(){return null;},getProfile:function(){return null;},'
    + 'db:function(){return {rpc:function(){window.PROBES=(window.PROBES||0)+1;return Promise.resolve({data:null,error:{message:"function predict_split does not exist"}});}};}};</script>';
  let mode = 'absent', dataOver = null;
  const REAL = '<script src="/assets/js/pjcc-profile.js"></script>';
  const srv = http.createServer((req, rsp) => {
    const p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    if (p === '/__site.css') { rsp.writeHead(200, { 'Content-Type': 'text/css' }); rsp.end(css); return; }
    if (p === '/assets/data/wc2026.json' && dataOver) { rsp.writeHead(200, { 'Content-Type': 'application/json' }); rsp.end(JSON.stringify(dataOver)); return; }
    if (p === '/wc/') {
      const html = H.jekyllPage(md, '/__site.css', 'theme-hall').replace('</body>', (mode === 'absent' ? ABSENT : mode === 'real' ? REAL : MOCK(mode === 'in')) + '</body>');
      rsp.writeHead(200, { 'Content-Type': 'text/html' }); rsp.end(html); return;
    }
    if (p === '/assets/js/pjcc-profile-bar.js') { rsp.writeHead(200, { 'Content-Type': 'text/javascript' }); rsp.end(''); return; }
    fs.readFile(path.join(ROOT, p), (err, buf) => {
      if (err) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'Content-Type': { '.js': 'text/javascript', '.json': 'application/json' }[path.extname(p)] || 'application/octet-stream' });
      rsp.end(buf);
    });
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const url = 'http://127.0.0.1:' + srv.address().port + '/wc/';
  const pp = require(path.join(ROOT, 'node_modules', 'puppeteer-core'));
  const browser = await pp.launch({ executablePath: H.findChrome(), headless: 'new', args: ['--no-sandbox'] });
  const errs = [];
  async function open(w) {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errs.push(e.message));
    await page.setViewport({ width: w, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.querySelectorAll('.wc-pz').length > 0, { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 200));
    return page;
  }
  try {
    let page = await open(390);
    const a = await page.evaluate(() => ({ hidden: document.getElementById('wc-predict').hidden, leaders: document.getElementById('wc-leaders').hidden,
      probes: window.PROBES, score: document.getElementById('wc-score').textContent, pz: document.querySelectorAll('.wc-pz').length }));
    ok(a.hidden && a.leaders && a.probes === 1 && /1½ – 1½/.test(a.score) && a.pz === 2,
      '⭐ until the SQL runs, the predictions panel is ABSENT, probed once; the score and both puzzles are there anyway  ' + JSON.stringify(a));
    await page.close();
    mode = 'out';
    page = await open(390);
    const b = await page.evaluate(() => ({ shown: !document.getElementById('wc-predict').hidden, picks: Array.prototype.map.call(document.querySelectorAll('.wc-pick'), (x) => x.tagName + ':' + x.textContent),
      note: document.getElementById('wc-note').textContent, pwned: !!window.PWNED, names: document.getElementById('wc-board-list').textContent }));
    ok(b.shown && b.picks.join() === 'BUTTON:Gukesh wins,BUTTON:Draw,BUTTON:Sindarov wins' && /free account/.test(b.note) && !b.pwned && /<img/.test(b.names),
      '⭐ with the SQL in, three buttons — a player, a draw, the other — and signed out, the note sends you to the free account; a codename is shown as text, never run  ' + JSON.stringify({ note: b.note, pwned: b.pwned }));
    await page.close();
    mode = 'in';
    page = await open(390);
    await page.click('.wc-pick[data-pick="draw"]');
    await page.waitForFunction(() => window.UPSERT, { timeout: 4000 });
    const c = await page.evaluate(() => ({ up: window.UPSERT, pressed: (document.querySelector('.wc-pick[aria-pressed="true"]') || {}).textContent,
      split: document.getElementById('wc-split').textContent }));
    ok(c.up.event === 'wc2026' && c.up.game === 4 && c.up.pick === 'draw' && c.up.user_id === 'u1' && c.pressed === 'Draw' && /picks so far/.test(c.split),
      '⭐ signed in, a pick saves as (you, wc2026, Game 4, draw), the button stays pressed and the crowd\'s split shows  ' + JSON.stringify({ pressed: c.pressed, split: c.split }));
    const fen = data.games.filter((g) => g.puzzle).slice(-1)[0];
    const pz = fen.puzzle, from = C.sqFromName(pz.uci.slice(0, 2)), to = C.sqFromName(pz.uci.slice(2, 4));
    await page.evaluate((id) => document.getElementById(id).scrollIntoView(), 'game-' + fen.game);
    await page.click('#game-' + fen.game + ' .wc-sq[data-i="' + from + '"]');
    await page.click('#game-' + fen.game + ' .wc-sq[data-i="' + to + '"]');
    const right = await page.evaluate((id) => document.querySelector('#' + id + ' .wc-pz-say').textContent, 'game-' + fen.game);
    await page.click('#game-' + fen.game + ' .wc-pz-again');
    const wrongMove = C.legalMoves(C.parseFEN(pz.fen)).filter((m) => !(m.from === from && m.to === to))[0];
    await page.click('#game-' + fen.game + ' .wc-sq[data-i="' + wrongMove.from + '"]');
    await page.click('#game-' + fen.game + ' .wc-sq[data-i="' + wrongMove.to + '"]');
    const wrong = await page.evaluate((id) => [document.querySelector('#' + id + ' .wc-pz-say').textContent, document.querySelectorAll('#' + id + ' .wc-sq.sol').length,
      document.querySelectorAll('#' + id + ' .wc-sq.go, #' + id + ' .wc-sq.cap').length], 'game-' + fen.game);
    ok(/^Right: /.test(right) && /^Not this one\./.test(wrong[0]) && wrong[1] === 2 && wrong[2] === 0,
      '⭐ the puzzle grades a move: the answer is "Right", any other legal move "Not this one", the answer\'s two squares shown and no move dots left over  ' + JSON.stringify([right, wrong[0]]));
    await page.close();

    /* ⭐ CHAMPIONSHIP EYE (his 11-26), with the REAL pjcc-profile.js, signed out, each run in its own clean storage */
    mode = 'real';
    const [p1, p3] = data.games.filter((g) => g.puzzle);
    const best = (g) => ({ from: C.sqFromName(g.puzzle.uci.slice(0, 2)), to: C.sqFromName(g.puzzle.uci.slice(2, 4)) });
    const miss = (g) => C.legalMoves(C.parseFEN(g.puzzle.fen)).filter((m) => !(m.from === best(g).from && m.to === best(g).to))[0];
    const openIn = async (ctx) => {
      const p = await ctx.newPage();
      p.on('pageerror', (e) => errs.push(e.message));
      await p.setViewport({ width: 390, height: 900 });
      await p.goto(url, { waitUntil: 'networkidle0' });
      await p.waitForFunction(() => window.PJCC && PJCC.wcPuzzles && document.querySelectorAll('.wc-pz').length > 0, { timeout: 8000 });
      await new Promise((r) => setTimeout(r, 200));
      return p;
    };
    const play = async (p, g, m) => {
      await p.click('#game-' + g.game + ' .wc-sq[data-i="' + m.from + '"]');
      await p.click('#game-' + g.game + ' .wc-sq[data-i="' + m.to + '"]');
    };
    const say = (p, g) => p.evaluate((id) => document.querySelector('#' + id + ' .wc-pz-say').textContent, 'game-' + g.game);
    const tally = (p) => p.evaluate(() => { const t = document.getElementById('wc-pz-tally'); return t.hidden ? '(hidden)' : t.textContent; });
    const look = (p) => p.evaluate(() => ({ best: localStorage.getItem('pjcc.best.wc2026-puzzles'),
      tries: JSON.parse(localStorage.getItem('pjcc.wc2026.puzzles.v1') || '{}'), href: (document.querySelector('#wc-pz-tally a') || {}).href || '' }));
    let ctx = await browser.createBrowserContext();
    page = await openIn(ctx);
    const t0 = await tally(page), href0 = (await look(page)).href;
    await play(page, p3, best(p3));
    await page.click('#game-' + p3.game + ' .wc-pz-again');
    await play(page, p3, miss(p3));
    await play(page, p1, miss(p1));
    await page.click('#game-' + p1.game + ' .wc-pz-again');
    await play(page, p1, best(p1));
    const practice = await say(page, p1), kept = await look(page);
    await page.close();
    page = await openIn(ctx);
    const back = [await say(page, p3), await say(page, p1), await tally(page)];
    await page.close();
    const over = (unsearched) => {
      const d = JSON.parse(JSON.stringify(data));
      d.games.forEach((g) => { if (g.game >= 4 && g.game <= 10) { g.result = d.players[0].key; if (g.game !== unsearched) g.puzzle = null; } });
      return d;
    };
    dataOver = over(0);
    page = await openIn(ctx);
    const missed = (await look(page)).best;
    await ctx.close();
    dataOver = null;
    ok(/^Solve every puzzle from this match on the first try to earn the Championship Eye title\. Sign in to keep your solves\.$/.test(t0)
       && /\/dossier\/$/.test(href0) && kept.tries['g' + p3.game].r === 'right' && kept.tries['g' + p1.game].r === 'wrong'
       && /^Right: .*Practice only/.test(practice) && /^Solved on your first try: /.test(back[0]) && /^Missed on your first try\./.test(back[1])
       && back[2] === 'First try: 1 of 2 solved.' && missed === null,
      '⭐ the FIRST move on each puzzle is kept: a retry never changes it, a practice solve says so, a return visit shows it, and a miss never banks  '
      + JSON.stringify([kept.tries, practice, back, missed]));
    ctx = await browser.createBrowserContext();
    page = await openIn(ctx);
    await play(page, p1, best(p1));
    await play(page, p3, best(p3));
    const live = [await tally(page), (await look(page)).best];
    await page.close();
    dataOver = over(7);
    page = await openIn(ctx);
    const gap = (await look(page)).best;
    await page.close();
    dataOver = over(0);
    page = await openIn(ctx);
    const won = [await tally(page), (await look(page)).best];
    await ctx.close();
    dataOver = null;
    ok(/^First try: 2 of 2 solved\. Solve every/.test(live[0]) && live[1] === null && gap === null
       && won[0] === 'Every puzzle, solved on the first try. Sign in to claim Championship Eye.' && won[1] === '1',
      '⭐ a perfect record banks only once the match is OVER and every played game was searched, and a return visit finds it  ' + JSON.stringify([live, gap, won]));
    const slid = [];
    for (const w of [320, 390]) {
      page = await open(w);
      const over = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth);
      if (over > 0) slid.push(w + 'px +' + over);
      await page.close();
    }
    ok(slid.length === 0, 'nothing on /wc/ slides sideways on a phone, the predictions panel and the boards drawn  [' + (slid.join(' ') || '320 and 390') + ']');
    ok(errs.length === 0, 'no script error on the page', errs.join(' | '));
  } finally { await browser.close(); srv.close(); }

  /* ── 4. game day ─────────────────────────────────────────────────────────────────────── */
  const booth = fs.readFileSync(path.join(ROOT, 'private/docs/godot/tournament_board/booth.gd'), 'utf8').replace(/\r\n/g, '\n');
  const gb = read('tests/gen-broadcast.js').replace(/\r\n/g, '\n');
  ok(/const SIGN_OFF := \["Predict Game %d at chesswild\.com\/wc\.", "Try and solve a puzzle from this game's position at chesswild\.com\/wc\."\]/.test(booth)
     && /if int\(mt\.get\("next", 0\)\) > 0:/.test(booth) && /if bool\(game\.get\("puzzle", false\)\):/.test(booth)
     && /m\.next = m\.game < \(m\.games \|\| 14\) \? m\.game \+ 1 : 0;/.test(gb) && /game\.puzzle = !!puzzle;/.test(gb),
    '⭐ every match video signs off with the URL — the next game to predict, and its puzzle only when it has one ("say the URL", his #3)');
  ok(/await WCS\.settle\(match, m\.game, WCS\.resultKey\(game\), log\);/.test(gb) && /WCS\.youtube\(game, data, dir,/.test(gb) && /await WCS\.thumbnail\(game, dir, log\);/.test(gb)
     && /if \(o\.site\) \{/.test(gb),
    'game day settles the result for the leaderboard and writes the title, description, pinned comment and thumbnail (his #5); --site does it for every game');
  const fake = { white_short: 'Sindarov', black_short: 'Gukesh', result: '1/2-1/2', moves: new Array(120).fill({}),
    match: { game: 3, games: 14, title: '2026 World Championships', after: [1.5, 1.5] }, desk: {} };
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'wcyt-'));
  fs.writeFileSync(path.join(tmp, 'desk.txt'), 'hook: He never castled\n');
  const his = W.deskIn(tmp, game, () => {});
  ok(his.hook === 'He never castled' && S.hookOf(Object.assign({}, fake, { desk: his })) === 'He never castled',
    'his desk.txt "hook:" is the thumbnail\'s big words and the title\'s; without one, the result');
  const yt = S.youtube(fake, data, tmp, 103.8).join('\n');
  fs.rmSync(tmp, { recursive: true, force: true });
  ok(/^Sindarov vs Gukesh · Game 3 · Drawn in 60 moves · World Chess Championship 2026$/m.test(yt)
     && /Predict Game 4 \(free\): https:\/\/chesswild\.com\/wc\//.test(yt) && /#game-3/.test(yt) && /^Who wins Game 4\? Predict it free at chesswild\.com\/wc/m.test(yt),
    'one title pattern every game, searchable as "World Chess Championship", the links in the description and the pinned comment');
  const docSql = read('docs/wc-predictions-setup.md');
  const mf = path.join(ROOT, 'private/docs/godot/tournament_board/match.json');
  const key = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')).predictKey : null;
  const hash = key ? require('crypto').createHash('sha256').update(key).digest('hex') : null;
  ok(!key || docSql.indexOf(hash) > 0 && docSql.indexOf(key) < 0,
    '⚠ the setup SQL holds the result key\'s hash and never the key  [' + (key ? 'checked against match.json' : 'no match.json on this machine') + ']');

  console.log('\n' + (FAIL ? 'RESULT: FAIL (' + FAIL + '/' + (PASS + FAIL) + ')' : 'RESULT: PASS (' + PASS + ' checks)'));
  process.exit(FAIL ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
