/* =============================================================================
 * sim-scen.js — the scenarios (his #2 of 11-16) and the story's chapters (his #8 of 11-23), played whole.
 *   npm run sim:scen
 *   env: N=60 (runs a scenario) WORKERS=6 SCENS=id,id (default every one) ENGINE_MS=15 SEC_PER_MOVE=1.7
 *
 * Green is a player who knows the goal: on a take it musters on the holding nearest the target and attacks down the
 * shortest road to it, the target first whenever it can; on a hold it stacks the keep (and the second holding a star
 * asks for), never attacks out of the keep, and strikes elsewhere only at three troops to the good. Red is the page's own
 * rivalPlan(). Battles are the page's musterBattle() played by its bestMove(), the clock a move budget, as sim:campaign.
 * It prints, a scenario: how often at least one star, all three, and the mean.
 * ⚠ A CALIBRATION INSTRUMENT: the band the four set pieces were tuned to was 40-60% earning a star.
 * ========================================================================== */
'use strict';
const path = require('path');
const { fork } = require('child_process');

const env = (k, d) => (process.env[k] != null && process.env[k] !== '' ? process.env[k] : d);
const N = +env('N', 60);
const WORKERS = Math.max(1, +env('WORKERS', 6));
const ENGINE_MS = +env('ENGINE_MS', 15), SEC_PER_MOVE = +env('SEC_PER_MOVE', 1.7);

function worker(id, count) {
  const camp = require(path.join(__dirname, 'campaign-vm.js')).load();
  const C = camp.C;
  const EFF = Math.max(0.15, SEC_PER_MOVE - camp.MOVE_DELAY);
  function fight(from, to) {
    const P = camp.musterBattle(from, to, true);              // the attacker is White, as sim:campaign plays every battle
    const movesAtt = Math.max(1, Math.round(P.clocks.att / EFF)), movesDef = Math.max(1, Math.round(P.clocks.def / EFF));
    let S = { b: P.board.slice(), turn: 'w', cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
    let usedW = 0, usedB = 0, how = null;
    while (!how) {
      const mover = S.turn;
      if ((mover === 'w' && usedW >= movesAtt) || (mover === 'b' && usedB >= movesDef)) {
        how = camp.loneKing(S.b, mover === 'w' ? 'b' : 'w') ? 'draw' : mover === 'w' ? 'flag-att' : 'flag-def';
        break;
      }
      const pick = camp.bestMove(S, ENGINE_MS, 3, 0, 0);
      if (!pick || !pick.mv) { how = 'draw'; break; }
      let m = pick.mv;
      const pc = S.b[m.from];
      if (!m.promo && pc && pc.toLowerCase() === 'p' && ((m.to / 8 | 0) === 7 || (m.to / 8 | 0) === 0)) m = { from: m.from, to: m.to, promo: mover === 'w' ? 'Q' : 'q' };
      S = C.makeMove(S, m);
      if (mover === 'w') usedW++; else usedB++;
      const r = C.gameResult(S);
      if (r === 'checkmate') { how = mover === 'w' ? 'mate-att' : 'mate-def'; break; }
      if (r) { how = 'draw'; break; }
    }
    const won = how === 'mate-att' || how === 'flag-def';
    const kept = { a: camp.keptShare(P.board, S.b, 'w'), d: camp.keptShare(P.board, S.b, 'b'),
                   rout: how === 'mate-att' ? 'def' : how === 'mate-def' ? 'att' : null, mated: how === 'mate-def' };
    camp.resolveLand(P, won, kept);
  }
  /* roads (and the sea lane) out from `at`: how many steps every holding is from it */
  function steps(at) {
    const d = camp.LAND.map(() => 99); d[at] = 0;
    const q = [at];
    while (q.length) { const x = q.shift(); camp.fronts(x).forEach((y) => { if (d[y] > d[x] + 1) { d[y] = d[x] + 1; q.push(y); } }); }
    return d;
  }
  const out = [];
  for (let c = 0; c < count; c++) {
    const sc = camp.scenOf(id);
    camp.newCampaign(sc.level, 'scenario', { scen: id });
    const G = camp.G, d = steps(sc.at), start = G.own.slice();
    let took = 0, lost = false;
    for (let round = 1; round <= sc.rounds && !lost; round++) {
      G.round = round;
      /* ── Green ── */
      G.side = 'm'; G.down = []; G.sailed = false;
      const mine = () => camp.idsOf('m');
      let add = camp.deployFor('m');
      if (sc.kind === 'take') {
        const front = mine().sort((a, b) => d[a] - d[b] || G.ranks[b] - G.ranks[a])[0];
        if (front != null) G.ranks[front] += add;
      } else {
        const keep = [sc.at].concat(sc.also != null ? [sc.also] : []).filter((x) => G.own[x] === 'm');
        for (let i = 0; i < add; i++) { const k = keep.length ? keep[i % keep.length] : mine()[0]; if (k != null) G.ranks[k]++; }
      }
      for (let a = 0; a < camp.ATTACK_CAP; a++) {
        let best = null;
        mine().forEach((f) => {
          if (G.ranks[f] < 2 || (sc.kind === 'hold' && (f === sc.at || f === sc.also))) return;
          camp.fronts(f).forEach((t) => {
            if (G.own[t] === 'm' || camp.strikeOf(f, t) === '' || camp.strikeOf(f, t) === 'sailed') return;
            const edge = G.ranks[f] - G.ranks[t];
            if (sc.kind === 'hold' ? edge < 3 : (t !== sc.at && edge < 1)) return;
            const score = (t === sc.at ? 1000 : 0) - d[t] * 10 + edge;
            if (!best || score > best.s) best = { f, t, s: score };
          });
        });
        if (!best) break;
        if (camp.strikeOf(best.f, best.t) === 'sea') G.sailed = true;
        fight(best.f, best.t);
        if (sc.kind === 'take' && G.own[sc.at] === 'm' && !took) took = round;
        if (!camp.idsOf('m').length || (sc.kind === 'hold' && G.own[sc.at] !== 'm')) { lost = true; break; }
      }
      if (lost) break;
      /* fortify: the deepest holding's spare troops one step toward the target (a hold: into the keep) */
      const goal = sc.at;
      const from = mine().filter((x) => G.ranks[x] > 1 && x !== goal).sort((a, b) => d[b] - d[a])[0];
      if (from != null) {
        const to = camp.nbrs(from).filter((y) => G.own[y] === 'm').sort((a, b) => d[a] - d[b])[0];
        if (to != null && d[to] < d[from]) { G.ranks[to] += G.ranks[from] - 1; G.ranks[from] = 1; }
      }
      /* ── Red ── */
      G.side = 't'; G.down = [];
      const plan = camp.rivalPlan('t');
      plan.deploy.forEach((x) => { G.ranks[x]++; });
      for (const at of plan.attacks) {
        if (G.own[at.from] !== 't' || G.ranks[at.from] < 2 || G.own[at.to] === 't') continue;
        fight(at.from, at.to);
        if (!camp.idsOf('m').length || (sc.kind === 'hold' && G.own[sc.at] !== 'm')) { lost = true; break; }
      }
      if (lost) break;
      if (plan.move && G.own[plan.move.from] === 't' && G.own[plan.move.to] === 't') {
        const n = Math.min(plan.move.n, Math.max(0, G.ranks[plan.move.from] - 1));
        G.ranks[plan.move.from] -= n; G.ranks[plan.move.to] += n;
      }
    }
    const stars = lost ? 0 : camp.scenStars(sc, G.own, took, start);
    out.push(stars);
  }
  process.stdout.write(JSON.stringify(out) + '\n');
}

if (process.env.SIM_WORKER) {
  worker(process.env.SIM_SCEN, +process.env.SIM_COUNT);
} else {
  (async () => {
    const camp = require(path.join(__dirname, 'campaign-vm.js')).load();
    const ids = env('SCENS', camp.SCENARIOS.map((s) => s.id).join(',')).split(',');
    console.log('=== CHESSWILD: CAMPAIGN — SCENARIOS, PLAYED WHOLE ===  ' + N + ' runs each, ' + WORKERS + ' workers');
    for (const id of ids) {
      const t0 = Date.now(), per = Math.ceil(N / WORKERS);
      const jobs = [];
      for (let w = 0; w < WORKERS; w++) {
        const count = Math.min(per, N - w * per);
        if (count <= 0) break;
        jobs.push(new Promise((res) => {
          let buf = '';
          const kid = fork(__filename, [], { env: Object.assign({}, process.env, { SIM_WORKER: '1', SIM_SCEN: id, SIM_COUNT: String(count) }),
                                             stdio: ['ignore', 'pipe', 'inherit', 'ipc'] });
          kid.stdout.on('data', (x) => { buf += x; });
          kid.on('exit', () => res(buf.trim() ? JSON.parse(buf.trim().split('\n').pop()) : []));
        }));
      }
      const all = [].concat.apply([], await Promise.all(jobs));
      const one = all.filter((x) => x >= 1).length, three = all.filter((x) => x === 3).length;
      console.log(`  ${id.padEnd(12)} a star ${(100 * one / all.length).toFixed(0)}% · three ${(100 * three / all.length).toFixed(0)}% · mean ${(all.reduce((a, b) => a + b, 0) / all.length).toFixed(2)}` +
                  `  (${all.length} runs, ${((Date.now() - t0) / 60000).toFixed(1)} min)`);
    }
  })().catch((e) => { console.error('SIM CRASHED:', e); process.exit(1); });
}
