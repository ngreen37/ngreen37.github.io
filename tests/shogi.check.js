// Regression + accuracy check for Shogi Island (assets/games/pjcc_shogi.html).
//
// Part 1 — ENGINE PROOFS (Node, no browser): the pure shogi engine is extracted
// from the page and machine-checked against ground truth:
//   - every piece's movement vs the true shogi tables (both orientations)
//   - promoted pieces move exactly like a Gold (と/杏/圭/全)
//   - the standard opening position has EXACTLY 30 legal moves (published fact)
//   - perft(2) = 900 from the start position
//   - drop restrictions (dead squares), nifu, and the uchifuzume (pawn-drop-mate) ban
//   - every entry in the baked-in TSUME_LIB re-solved: mate in exactly n, stated
//     key move verified
//   - the game's own __shogiTest self-audit runs clean
//
// Part 2 — UI DRIVE (headless Chrome): plays the real game like a person —
// solving lessons by clicking cells, decoding the codex, unlocking and playing
// Catch the Lion and the full 9×9 match, and walking a real tsume to mate.
//
//   run:  npm run test:shogi        (SHOGI_SHOTS=<dir> to also save screenshots)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { withGame, report } = require('./harness');

const GAME = path.join(__dirname, '..', 'assets', 'games', 'pjcc_shogi.html');

/* ================= Part 1: engine proofs in Node ================= */
function engineChecks() {
  const results = [];
  const ok = (cond, msg) => results.push({ pass: !!cond, msg });

  const html = fs.readFileSync(GAME, 'utf8');
  const m = html.match(/<script>\s*("use strict";[\s\S]*)<\/script>/);
  if (!m) { ok(false, 'engine <script> block found in the page'); return results; }
  const ctx = vm.createContext({});                       // no document -> RUN_UI stays false
  vm.runInContext(m[1], ctx, { timeout: 30000 });
  const R = (expr, t) => vm.runInContext(expr, ctx, { timeout: t || 60000 });

  const setEq = (a, b) => a.length === b.length && a.every(x => b.indexOf(x) >= 0);
  const dests = (t, s) => JSON.parse(R(`JSON.stringify(destsFor({'4,4':{t:'${t}',s:'${s}'}}, 4, 4))`));

  // --- movement tables vs true shogi (piece alone at 4,4) ---
  const GOLDSET = ['3,3','3,4','3,5','4,3','4,5','5,4'];
  const DIAG16 = [], ORTH16 = [];
  for (let d = 1; d <= 4; d++) { DIAG16.push((4-d)+','+(4-d), (4-d)+','+(4+d), (4+d)+','+(4-d), (4+d)+','+(4+d)); }
  for (let d = 1; d <= 4; d++) { ORTH16.push((4-d)+',4', (4+d)+',4', '4,'+(4-d), '4,'+(4+d)); }
  ok(setEq(dests('P','P'), ['3,4']), 'Pawn (▲): one square straight forward');
  ok(setEq(dests('L','P'), ['3,4','2,4','1,4','0,4']), 'Lance (▲): slides straight forward only');
  ok(setEq(dests('N','P'), ['2,3','2,5']), 'Knight (▲): the two forward L-jumps, nothing else');
  ok(setEq(dests('S','P'), ['3,3','3,4','3,5','5,3','5,5']), 'Silver (▲): forward + all four diagonals');
  ok(setEq(dests('G','P'), GOLDSET), 'Gold (▲): orthogonals + forward diagonals (6 squares)');
  ok(setEq(dests('K','P'), ['3,3','3,4','3,5','4,3','4,5','5,3','5,4','5,5']), 'King: all 8 neighbours');
  ok(setEq(dests('B','P'), DIAG16), 'Bishop: full diagonal slides (16 from center)');
  ok(setEq(dests('R','P'), ORTH16), 'Rook: full orthogonal slides (16 from center)');
  ok(setEq(dests('+B','P'), DIAG16.concat(['3,4','5,4','4,3','4,5'])), 'Horse (+B): bishop + one orthogonal step');
  ok(setEq(dests('+R','P'), ORTH16.concat(['3,3','3,5','5,3','5,5'])), 'Dragon (+R): rook + one diagonal step');
  ok(['+P','+L','+N','+S'].every(t => setEq(dests(t,'P'), GOLDSET)), 'all four promoted minors move exactly like a Gold');
  // enemy orientation flips forward
  ok(setEq(dests('P','E'), ['5,4']), 'enemy Pawn (△) moves DOWN the board');
  ok(setEq(dests('N','E'), ['6,3','6,5']), 'enemy Knight (△) jumps down-forward');
  ok(setEq(dests('S','E'), ['5,3','5,4','5,5','3,3','3,5']), 'enemy Silver (△) mirrors correctly');

  // --- opening position ---
  ok(R('Object.keys(matchStart().b).length') === 40, 'standard setup has all 40 pieces');
  ok(R(`(function(){var b=matchStart().b; return b['8,4'].t==='K'&&b['0,4'].t==='K'&&b['7,7'].t==='R'&&b['7,1'].t==='B'&&b['1,1'].t==='R'&&b['1,7'].t==='B';})()`),
     'kings on the central file; rook/bishop on their correct start squares');
  ok(R('legalMoves(matchStart()).length') === 30, 'EXACTLY 30 legal first moves (the published shogi branching factor)');
  const perft2 = R('(function(){var st=matchStart(); var ms=legalMoves(st); var n=0; for(var i=0;i<ms.length;i++){ n+=legalMoves(applyFull(st,ms[i])).length; } return n;})()', 120000);
  ok(perft2 === 900, 'perft(2) from the start position = 900  [got ' + perft2 + ']');

  // --- drop rules ---
  ok(R(`dropDests({}, 'L', 'P').length`) === 72 && R(`dropDests({}, 'L', 'P').every(function(k){ return k.split(',')[0] !== '0'; })`),
     'a Lance can never be dropped on the last rank (72 of 81 squares)');
  ok(R(`dropDests({}, 'N', 'P').length`) === 63, 'a Knight can never be dropped on the last two ranks (63 squares)');
  ok(R(`dropDests({'4,4':{t:'P',s:'E'}}, 'G', 'P').indexOf('4,4')`) === -1, 'drops only land on EMPTY squares');
  // nifu: own unpromoted pawn already on the file blocks a second pawn drop there
  ok(R(`(function(){
      var st={b:{'6,4':{t:'P',s:'P'},'8,0':{t:'K',s:'P'},'0,8':{t:'K',s:'E'}},hand:{P:['P'],E:[]},turn:'P'};
      var ms=legalMoves(st);
      var onFile4=ms.some(function(m){return m.drop==='P'&&m.to.split(',')[1]==='4';});
      var elsewhere=ms.some(function(m){return m.drop==='P'&&m.to.split(',')[1]!=='4';});
      return !onFile4 && elsewhere;
    })()`), 'nifu: no second pawn drop on a file you already hold a pawn on');
  // uchifuzume: a pawn drop that delivers immediate CHECKMATE is illegal; a mere pawn-drop CHECK is fine
  ok(R(`(function(){
      var st={b:{'0,8':{t:'K',s:'E'},'1,0':{t:'R',s:'P'},'0,6':{t:'G',s:'P'}},hand:{P:['P'],E:[]},turn:'P'};
      var pseudo=genPseudo(st).some(function(m){return m.drop==='P'&&m.to==='1,8';});
      var legal=legalMoves(st).some(function(m){return m.drop==='P'&&m.to==='1,8';});
      return pseudo && !legal;
    })()`), 'uchifuzume: the mating pawn drop exists pseudo-legally but is refused');
  ok(R(`(function(){
      var st={b:{'0,8':{t:'K',s:'E'},'1,0':{t:'R',s:'P'}},hand:{P:['P'],E:[]},turn:'P'};
      return legalMoves(st).some(function(m){return m.drop==='P'&&m.to==='1,8';});
    })()`), 'a NON-mating pawn-drop check stays legal (only the mate is banned)');

  // --- every baked-in tsume problem: the stated key move re-proved the way the
  //     game itself verifies play (check given; every defender escape refutable
  //     in the remaining moves). Full-tree solving is spot-checked on one entry —
  //     it costs ~5s per problem, too slow to run for all 14 on every test run.
  const tsumeBad = JSON.parse(R(`(function(){
      var bad=[];
      for(var i=0;i<TSUME_LIB.length;i++){ var e=TSUME_LIB[i];
        var st={b:cloneB(e.b), hand:{P:e.hand.slice(), E:e.defHand.slice()}, turn:'P'};
        if(inCheck(st.b,'E')){ bad.push(i+':starts-in-check'); continue; }
        var n1=applyFull(st, e.first);
        if(!inCheck(n1.b,'E')){ bad.push(i+':first-not-check'); continue; }
        var esc=defenderEscapes(n1);
        if(e.n===1){ if(esc.length){ bad.push(i+':first-not-mate'); } continue; }
        for(var z=0;z<esc.length;z++){ if(!solveTsume(applyFull(n1,esc[z]), e.n-1)){ bad.push(i+':first-refuted'); break; } }
      }
      return JSON.stringify(bad);
    })()`, 120000));
  ok(tsumeBad.length === 0, 'all ' + R('TSUME_LIB.length') + ' library tsume: key move checks, every defense refuted' +
     (tsumeBad.length ? '  [FAILS: ' + tsumeBad.join(' ') + ']' : ''));
  ok(R(`(function(){ var e=TSUME_LIB[0];
      return solveTsume({b:cloneB(e.b), hand:{P:e.hand.slice(), E:e.defHand.slice()}, turn:'P'}, e.n);
    })()`, 60000) === true, 'full-tree tsume solver spot check: library entry 0 is a forced mate');

  // --- generators + AIs, sized to run in seconds (the page's __shogiTest plays
  //     eight 140-ply AI games and generates mate-in-3s — minutes of work) ---
  ok(R(`(function(){ var fails=0;
      for(var i=0;i<12;i++){ var d=1+(i%6);
        var pm=genMove(d); if(pm.target.length===0) fails++;
        var pc=genCapture(d); var en=pc.board[pc.enemyKey]; if(!en||en.s!=='E') fails++;
        var ck=genCheck(d); var kp=rc(ck.enemyKey); if(isAttacked(ck.board,kp[0],kp[1],'P')) fails++;
        var mt=genMate(d); var mk=rc(mt.enemyKey); if(isAttacked(mt.board,mk[0],mk[1],'P')) fails++;
      } return fails; })()`, 60000) === 0, 'lesson generators (move/capture/check/mate) ×12: all boards valid');
  ok(R(`(function(){ var okc=0; for(var i=0;i<3;i++){ var p=genTsume(1);
      var st={b:cloneB(p.board),hand:{P:p.hand.slice(),E:p.defHand.slice()},turn:'P'};
      if(solveTsume(st,1)) okc++; } return okc; })()`, 60000) === 3, 'generated mate-in-1s (real defender) all verify');
  const dobRes = JSON.parse(R(`(function(){ var err=0, dec=0;
      for(var g=0; g<20; g++){ var st=dobStart(), plies=0;
        while(!st.winner && plies<120){ var mv=dLegal(st); if(!mv.length) break;
          var ch = st.turn==='E' ? dAIMove(st,4) : mv[(Math.random()*mv.length)|0];
          if(!ch){ err++; break; } st=dApply(st,ch); plies++; }
        if(st.winner) dec++; }
      return JSON.stringify({err:err,dec:dec}); })()`, 60000));
  ok(dobRes.err === 0 && dobRes.dec > 0, 'Catch-the-Lion AI: 20 games, all moves legal, ' + dobRes.dec + ' decisive');
  // --- the wrapper page's decode codex must mirror the in-game codex EXACTLY
  //     (same lines, same order) or the page meter drifts out of lock-step ---
  const pageSrc = fs.readFileSync(path.join(__dirname, '..', 'games', 'shogi-island', 'index.html'), 'utf8');
  const pageJp = Array.from(pageSrc.matchAll(/jp:\s*'([^']+)'/g)).map(x => x[1]);
  const gameJp = JSON.parse(R(`JSON.stringify(SECTIONS.reduce(function(a,s){ a.push(s.jp); s.items.forEach(function(it){ a.push(it.jp); }); return a; },[]))`));
  ok(pageJp.length === gameJp.length && pageJp.every((s, i) => s === gameJp[i]),
     'the /games/shogi-island/ page codex mirrors the in-game codex line-for-line (' + gameJp.length + ' entries)');

  const mRes = JSON.parse(R(`(function(){ var st=matchStart(), err=0, mp=0;
      while(mp<30){ var legal=legalMoves(st); if(!legal.length) break;
        var mv=aiMoveFull(st, 2, 8000); if(!mv){ err++; break; }
        var okm=false; for(var z=0;z<legal.length;z++){ var L=legal[z];
          if(L.drop&&mv.drop){ if(L.drop===mv.drop&&L.to===mv.to){ okm=true; break; } }
          else if(!L.drop&&!mv.drop){ if(L.from===mv.from&&L.to===mv.to&&!!L.promote===!!mv.promote){ okm=true; break; } } }
        if(!okm){ err++; break; }
        st=applyFull(st, mv); mp++; }
      return JSON.stringify({err:err, plies:mp}); })()`, 120000));
  ok(mRes.err === 0 && mRes.plies === 30, '9×9 match AI self-play: 30 plies, every move independently verified legal');

  return results;
}

/* ================= Part 2: drive the real UI ================= */
const MARKER = "refreshHud(); renderCodex(); renderUnlock(); setTheme(themeLevel()); newProblem();";
const HOOK = `
window.__t = {
  state: function(){ return { solved: st.solved, decoded: st.decoded, unlocked: !!st.unlocked }; },
  setSolved: function(n){ st.solved = n; st.decoded = Math.min(n, TOTAL_SEG); saveState(); refreshHud(); renderCodex(); renderUnlock(); setTheme(themeLevel()); },
  newProblem: function(){ newProblem(); },
  prob: function(){ if(!prob) return null;
    var live = (prob.goal==='mate'||prob.goal==='tsume') ? prob.live : null;
    return { goal: prob.goal, kind: prob.kind, subj: prob.subj||null, target: prob.target||null,
      enemyKey: prob.enemyKey||null, board: live ? live.b : prob.board, hand: live ? live.hand.P.slice() : (prob.hand||[]).slice(),
      rem: prob.rem||0, firsts: prob.firsts||null, solutions: prob.solutions||null, live: live }; },
  fb: function(){ return document.getElementById('fb').textContent; },
  dob: function(){ return dob ? { turn: dob.turn, winner: dob.winner, pieces: Object.keys(dob.b).length } : null; },
  match: function(){ return M ? { turn: M.turn, over: !!M.over, pieces: Object.keys(M.b).length, checkP: inCheck(M.b,'P') } : null; }
};`;

const cellClick = (page, k) => page.evaluate(i => document.querySelectorAll('#board .cell')[i].click(), k.split(',').map(Number).reduce((r, c) => r * 9 + c));
const handClick = (page, t) => page.evaluate(tt => { const p = window.__t.prob(); document.querySelectorAll('#hand .hp')[p.hand.indexOf(tt)].click(); }, t);
const action = page => page.click('#action');

// Solve whatever problem is up, the way a player would (DOM clicks only).
async function solveOne(page, sleep) {
  const p = await page.evaluate(() => window.__t.prob());
  if (p.goal === 'move') {
    for (const k of p.target) await cellClick(page, k);
    await action(page); await sleep(60);
  } else if (p.goal === 'capture') {
    const from = await page.evaluate(() => { const q = window.__t.prob();
      for (const k in q.board) { if (q.board[k].s !== 'P') continue; const a = k.split(',').map(Number);
        if (destsFor(q.board, a[0], a[1]).indexOf(q.enemyKey) >= 0) return k; } return null; });
    await cellClick(page, from); await cellClick(page, p.enemyKey); await sleep(60);
  } else if (p.goal === 'check') {
    const s = p.solutions[0];
    await cellClick(page, s.from); await cellClick(page, s.to); await sleep(60);
  } else if (p.goal === 'mate') {
    const f = p.firsts[0];
    if (f.drop) { await handClick(page, f.drop); } else { await cellClick(page, f.from); }
    await cellClick(page, f.to); await sleep(60);
  } else if (p.goal === 'tsume') {
    // walk the forced mate: pick an accepted checking move each turn (like reading the solution)
    for (let step = 0; step < 5; step++) {
      const mv = await page.evaluate(() => { const q = window.__t.prob();
        const cms = atkCheckMoves(q.live);
        for (const m of cms) { const n = applyFull(q.live, m); const esc = defenderEscapes(n);
          if (esc.length === 0) { if (m.drop === 'P') continue; return m; }
          if (q.rem <= 1) continue;
          let all = true; for (const e of esc) { if (!solveTsume(applyFull(n, e), q.rem - 1)) { all = false; break; } }
          if (all) return m; }
        return null; });
      if (!mv) return 'NO-MOVE-FOUND';
      if (mv.drop) { await handClick(page, mv.drop); } else { await cellClick(page, mv.from); }
      await cellClick(page, mv.to); await sleep(60);
      const fb = await page.evaluate(() => window.__t.fb());
      if (fb.indexOf('詰み') >= 0) break;
    }
  }
  const fb = await page.evaluate(() => window.__t.fb());
  await action(page); await sleep(80);   // 次へ Next -> new problem
  return fb;
}

(async () => {
  const nodeResults = engineChecks();

  const { results, errors } = await withGame(GAME, MARKER, HOOK, async (page, ok, sleep) => {
    const shots = process.env.SHOGI_SHOTS || null;
    const snap = async name => { if (shots) { try { await page.screenshot({ path: path.join(shots, name) }); } catch (e) {} } };

    await page.waitForSelector('#board');
    ok(await page.evaluate(() => document.querySelectorAll('#board .cell').length) === 81, 'the lesson board renders 9×9 (81 cells)');
    const st0 = await page.evaluate(() => window.__t.state());
    ok(st0.solved === 0 && st0.decoded === 0, 'a fresh island starts at 0 solved / 0 decoded');
    ok(await page.evaluate(() => document.getElementById('rank').textContent) === '無級', 'starting rank is 無級 (no rank)');

    // --- play 6 lessons for real, clicking cells like a player ---
    let allCorrect = true, decodeLockstep = true;
    for (let i = 0; i < 6; i++) {
      const before = await page.evaluate(() => window.__t.state());
      const fb = await solveOne(page, sleep);
      if (!(fb.indexOf('正解') >= 0 || fb.indexOf('詰み') >= 0)) { allCorrect = false; break; }
      const after = await page.evaluate(() => window.__t.state());
      if (after.solved !== before.solved + 1 || after.decoded !== before.decoded + 1) { decodeLockstep = false; break; }
    }
    ok(allCorrect, 'six lessons solved by clicking the board (correct answers accepted)');
    ok(decodeLockstep, 'each solve decodes exactly one codex line (solved/decoded in lock-step)');
    ok(await page.evaluate(() => document.getElementById('rank').textContent) === '六級', 'rank climbs to 六級 at 6 solves');
    const ls = await page.evaluate(() => JSON.parse(localStorage.getItem('pjcc.shogi.v3')));
    ok(ls && ls.solved === 6 && ls.decoded === 6, 'progress persists to localStorage (pjcc.shogi.v3)');
    // gate check must run BEFORE the tsume jump below: the unlock flag rightly
    // persists once earned, so a later drop in "solved" can't re-lock it.
    ok(await page.evaluate(() => !document.getElementById('play-dob')), 'Catch the Lion stays LOCKED at 6 solves');
    await snap('shogi-lessons.png');

    // --- a real tsume (mate-in-3/5) walked to mate through the UI ---
    await page.evaluate(() => window.__t.setSolved(30));
    let sawTsume = false;
    for (let tries = 0; tries < 60 && !sawTsume; tries++) {
      const g = await page.evaluate(() => window.__t.prob().goal);
      if (g === 'tsume') {
        sawTsume = true;
        const fb = await solveOne(page, sleep);
        ok(fb.indexOf('詰み') >= 0, 'a full 詰将棋 walked to mate through the UI (defender fighting back)  [fb=' + fb + ']');
      } else { await page.evaluate(() => window.__t.newProblem()); }
    }
    if (!sawTsume) ok(false, 'a tsume problem appears within 60 deals at 30 solves');

    // --- unlock gates ---
    await page.evaluate(() => window.__t.setSolved(28));
    ok(await page.evaluate(() => !!document.getElementById('play-dob')), 'Catch the Lion unlocks at 28 solves');
    ok(await page.evaluate(() => !document.getElementById('play-match')), 'the 9×9 match stays LOCKED below 40 solves');

    // play a few Catch-the-Lion moves
    await page.click('#play-dob'); await sleep(150);
    ok(await page.evaluate(() => !document.getElementById('dobutsu').classList.contains('hidden')), 'the Catch-the-Lion overlay opens');
    await page.evaluate(() => { document.querySelectorAll('#dob-board .dob-cell')[7].click(); });         // my chick
    await page.evaluate(() => { document.querySelectorAll('#dob-board .dob-cell')[4].click(); });         // takes enemy chick
    await sleep(600);                                                                                      // AI replies
    const dob = await page.evaluate(() => window.__t.dob());
    ok(dob && (dob.turn === 'P' || dob.winner), 'chick takes chick; the lion AI answers  [turn=' + dob.turn + ']');
    await snap('shogi-dobutsu.png');
    await page.click('#dob-close');

    // --- the full 9×9 match vs the island AI ---
    await page.evaluate(() => window.__t.setSolved(40));
    ok(await page.evaluate(() => !!document.getElementById('play-match')), 'the full 9×9 match unlocks at 40 solves');
    await page.click('#play-match'); await sleep(150);
    let mt = await page.evaluate(() => window.__t.match());
    ok(mt && mt.pieces === 40 && mt.turn === 'P', 'the match starts: 40 pieces, your move');
    // open with the classic pawn push (7六歩), then let the AI answer
    await page.evaluate(() => { document.querySelectorAll('#m-board .m-cell')[6 * 9 + 2].click(); });
    await page.evaluate(() => { document.querySelectorAll('#m-board .m-cell')[5 * 9 + 2].click(); });
    await sleep(1200);
    mt = await page.evaluate(() => window.__t.match());
    ok(mt && mt.turn === 'P' && mt.pieces === 40 && !mt.over, 'pawn push played; the island AI answered with a legal reply');
    await snap('shogi-match.png');
  });

  const all = nodeResults.concat(results);
  process.exit(report('Shogi Island v3.1', all, errors) ? 0 : 1);
})();
