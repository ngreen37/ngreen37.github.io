/* =============================================================================
 * sim-campaign.js — whole campaigns, machine against machine, on the page's own rules.
 *   npm run sim:campaign
 *   env: N=60 (campaigns per rule) WORKERS=6 RULES=off,win,both GREEN=medium RED=medium CARDS=1 WALLS=1
 *        ENGINE_MS=15 SEC_PER_MOVE=1.7 MAX_ROUNDS=60
 *
 * sim:marchland measures ONE battle: how often an attack fails. Nothing measured a CAMPAIGN — how long one runs, how
 * often the side behind comes back, whether the side that moves first wins too often, what the walls are worth. This
 * plays them whole: the page's script runs in Node (tests/campaign-vm.js), both colors plan with its own rivalPlan(),
 * every battle is mustered by its own musterBattle() and played out by its own bestMove(), and every result is
 * resolved by its own resolveLand(). The rule under test is the page's SURVIVE dial.
 *
 * ⚠ WHAT IT IS: a calibration instrument, like sim:marchland. Engine against engine at one strength, the clock as a
 * move budget (CLOCK / (SEC_PER_MOVE - MOVE_DELAY)), and Green played by the machine's plan rather than a person.
 * It says which way a rule moves the campaign and roughly how far.
 * ========================================================================== */
'use strict';
const path = require('path');
const { fork } = require('child_process');

const env = (k, d) => (process.env[k] != null && process.env[k] !== '' ? process.env[k] : d);
const N = +env('N', 60);
const WORKERS = Math.max(1, +env('WORKERS', 6));
const RULES = env('RULES', 'off,win,both').split(',');
const GREEN = env('GREEN', 'medium'), RED = env('RED', 'medium');
const CARDS = env('CARDS', '1') === '1', WALLS = env('WALLS', '1') === '1';
const ENGINE_MS = +env('ENGINE_MS', 15), SEC_PER_MOVE = +env('SEC_PER_MOVE', 1.7);
const MAX_ROUNDS = +env('MAX_ROUNDS', 60);
const CHECKPOINTS = [1, 3, 5, 10, 15, 20, 30];

/* ── one worker: COUNT campaigns under RULE, one JSON line each ── */
function worker(rule, count) {
  const camp = require(path.join(__dirname, 'campaign-vm.js')).load();
  const C = camp.C;
  camp.setSurvive(rule);
  const EFF = Math.max(0.15, SEC_PER_MOVE - camp.MOVE_DELAY);
  const movesAtt = Math.max(1, Math.round(camp.CLOCK_ATT / EFF));
  const movesDef = Math.max(1, Math.round(camp.CLOCK_DEF / EFF));

  function fight(from, to) {
    const P = camp.musterBattle(from, to, true);              // the attacker is White, as the page builds it
    let S = { b: P.board.slice(), turn: 'w', cast: { K: false, Q: false, k: false, q: false }, ep: -1, half: 0, full: 1 };
    let usedW = 0, usedB = 0, how = null, plies = 0;
    while (!how) {
      const mover = S.turn;
      if ((mover === 'w' && usedW >= movesAtt) || (mover === 'b' && usedB >= movesDef)) {
        /* a flag only loses to a side that could still mate (tickClock) */
        how = camp.loneKing(S.b, mover === 'w' ? 'b' : 'w') ? 'draw' : mover === 'w' ? 'flag-att' : 'flag-def';
        break;
      }
      const pick = camp.bestMove(S, ENGINE_MS, 3, 0, 0);
      if (!pick || !pick.mv) { how = 'draw'; break; }
      let m = pick.mv;
      const pc = S.b[m.from];
      if (!m.promo && pc && pc.toLowerCase() === 'p' && ((m.to / 8 | 0) === 7 || (m.to / 8 | 0) === 0)) {
        m = { from: m.from, to: m.to, promo: mover === 'w' ? 'Q' : 'q' };
      }
      S = C.makeMove(S, m);
      plies++;
      if (mover === 'w') usedW++; else usedB++;
      const r = C.gameResult(S);
      if (r === 'checkmate') { how = mover === 'w' ? 'mate-att' : 'mate-def'; break; }
      if (r) { how = 'draw'; break; }
    }
    const attackerWon = how === 'mate-att' || how === 'flag-def';
    const kept = { a: camp.keptShare(P.board, S.b, 'w'), d: camp.keptShare(P.board, S.b, 'b'),
                   rout: how === 'mate-att' ? 'def' : how === 'mate-def' ? 'att' : null };
    return { P, how, attackerWon, kept, plies };
  }

  const total = (G, side) => G.own.reduce((s, o, i) => s + (o === side ? G.ranks[i] : 0), 0);
  const held = (G, side) => G.own.filter((o) => o === side).length;

  for (let c = 0; c < count; c++) {
    camp.newCampaign(RED, 'solo', { fog: false, cards: CARDS });
    const G = camp.G;
    if (!WALLS) G.walls = [];
    const out = { rule, winner: null, rounds: 0, battles: 0, attWins: 0, breaches: 0, idleTurns: 0,
                  hows: {}, plies: 0, marched: 0, wentOnWin: 0, at: {} };
    let over = false;
    for (let round = 1; round <= MAX_ROUNDS && !over; round++) {
      out.rounds = round;
      for (const side of ['m', 't']) {
        G.side = side; G.down = []; G.diff = side === 'm' ? GREEN : RED;
        const plan = camp.rivalPlan(side);
        plan.deploy.forEach((id) => { G.ranks[id]++; });
        let fought = 0;
        for (const a of plan.attacks) {
          if (G.own[a.from] !== side || G.ranks[a.from] < 2 || G.own[a.to] === side) continue;
          const f = fight(a.from, a.to);
          fought++; out.battles++; out.plies += f.plies;
          out.hows[f.how] = (out.hows[f.how] || 0) + 1;
          if (f.attackerWon) out.attWins++;
          const broke = camp.resolveLand(f.P, f.attackerWon, f.kept);
          if (broke) out.breaches++;
          else if (f.attackerWon) { out.marched += G.troops.march; out.wentOnWin += G.troops.went; }
          if (!held(G, 'm') || !held(G, 't')) { over = true; break; }
        }
        if (!fought) out.idleTurns++;
        if (over) break;
        const mv = plan.move;
        if (mv && G.own[mv.from] === side && G.own[mv.to] === side) {
          const n = Math.min(mv.n, Math.max(0, G.ranks[mv.from] - 1));
          if (n > 0) { G.ranks[mv.from] -= n; G.ranks[mv.to] += n; }
        }
        G.down = [];
      }
      if (CHECKPOINTS.indexOf(round) >= 0) {
        out.at[round] = { m: held(G, 'm'), t: held(G, 't'), tm: total(G, 'm'), tt: total(G, 't') };
      }
      if (over) break;
      G.round++;
      camp.drawCard();
    }
    out.winner = !held(G, 't') ? 'm' : !held(G, 'm') ? 't' : null;
    process.stdout.write(JSON.stringify(out) + '\n');
  }
}

/* ── the master: WORKERS per rule, then one table ── */
function runRule(rule) {
  const per = Math.ceil(N / WORKERS);
  const jobs = [];
  for (let w = 0; w < WORKERS; w++) {
    const count = Math.min(per, N - w * per);
    if (count <= 0) break;
    jobs.push(new Promise((res) => {
      const lines = [];
      const kid = fork(__filename, [], { env: Object.assign({}, process.env, { SIM_WORKER: '1', SIM_RULE: rule, SIM_COUNT: String(count) }),
                                         stdio: ['ignore', 'pipe', 'inherit', 'ipc'] });
      let buf = '';
      kid.stdout.on('data', (d) => {
        buf += d;
        let i;
        while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l.trim()) lines.push(JSON.parse(l)); }
      });
      kid.on('exit', () => res(lines));
    }));
  }
  return Promise.all(jobs).then((all) => [].concat.apply([], all));
}

function pct(a, b) { return b ? (100 * a / b).toFixed(0) + '%' : '—'; }
function med(a) { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); return s[(s.length - 1) >> 1]; }
function q(a, f) { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(f * s.length))]; }
function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN; }

function report(rule, rs, ms) {
  const n = rs.length, done = rs.filter((r) => r.winner);
  const greenWins = rs.filter((r) => r.winner === 'm').length, redWins = rs.filter((r) => r.winner === 't').length;
  const rounds = done.map((r) => r.rounds);
  const battles = rs.reduce((s, r) => s + r.battles, 0), attWins = rs.reduce((s, r) => s + r.attWins, 0);
  /* a comeback: the side holding fewer after round 5 wins the campaign */
  let behind = 0, back = 0;
  rs.forEach((r) => {
    const a = r.at[5]; if (!a || !r.winner || a.m === a.t) return;
    behind++; if ((a.m < a.t && r.winner === 'm') || (a.t < a.m && r.winner === 't')) back++;
  });
  const hows = {}; rs.forEach((r) => Object.keys(r.hows).forEach((k) => { hows[k] = (hows[k] || 0) + r.hows[k]; }));
  const marched = rs.reduce((s, r) => s + r.marched, 0), went = rs.reduce((s, r) => s + r.wentOnWin, 0);
  console.log(`\n── SURVIVE = '${rule}'  ·  ${n} campaigns  ·  ${(ms / 60000).toFixed(1)} min`);
  console.log(`   finished ${done.length}/${n} (${n - done.length} still going at round ${MAX_ROUNDS})  ·  Green ${greenWins} · Red ${redWins}` +
              `  ·  Green, who moves first, wins ${pct(greenWins, done.length)} of the finished`);
  console.log(`   rounds to finish: median ${med(rounds)} · middle half ${q(rounds, 0.25)}–${q(rounds, 0.75)} · 90% by ${q(rounds, 0.9)}`);
  console.log(`   battles a campaign: ${mean(rs.map((r) => r.battles)).toFixed(1)} · attacks that took or broke the walls ${pct(attWins, battles)}` +
              ` · turns with no attack ${pct(rs.reduce((s, r) => s + r.idleTurns, 0), rs.reduce((s, r) => s + r.rounds * 2, 0))}`);
  console.log(`   how battles ended: ` + Object.keys(hows).sort().map((k) => k + ' ' + pct(hows[k], battles)).join(' · '));
  console.log(`   a win marched ${pct(marched, went)} of the troops that went  ·  the side behind after round 5 came back ${back} of ${behind} (${pct(back, behind)})`);
  const rows = CHECKPOINTS.map((k) => {
    const xs = rs.map((r) => r.at[k]).filter(Boolean);
    return xs.length ? `r${k}: ${mean(xs.map((x) => x.tm + x.tt)).toFixed(1)} troops (${xs.length} live)` : null;
  }).filter(Boolean);
  console.log('   troops on the map: ' + rows.join(' · '));
}

if (process.env.SIM_WORKER) {
  worker(process.env.SIM_RULE, +process.env.SIM_COUNT);
} else {
  (async () => {
    console.log(`=== CHESSWILD: CAMPAIGN — WHOLE CAMPAIGNS, MACHINE AGAINST MACHINE ===`);
    console.log(`  Green ${GREEN} · Red ${RED} · cards ${CARDS ? 'on' : 'off'} · walls ${WALLS ? 'on' : 'off'} · engine ${ENGINE_MS}ms · ` +
                `${SEC_PER_MOVE}s a move · ${N} campaigns a rule on ${WORKERS} workers`);
    for (const rule of RULES) {
      const t0 = Date.now();
      const rs = await runRule(rule);
      report(rule, rs, Date.now() - t0);
    }
  })().catch((e) => { console.error('SIM CRASHED:', e); process.exit(1); });
}
