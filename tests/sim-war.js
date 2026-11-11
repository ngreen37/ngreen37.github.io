/* =============================================================================
 * sim-war.js — whole wars of three and four, every seat played by the machine.
 *   npm run sim:war
 *   env: N=400 (wars a mode) MODES=three,four LEVEL=medium CARDS=1 MAX_ROUNDS=80 WORKERS=6 WIN3= WIN4= (the line, 99 none)
 *
 * His pick #10 (11-10). sim:campaign measures a campaign of two with every battle played out; a war of three or four
 * is the same rules round more seats, and every battle here is decided the way two machines' battles are in the game
 * (the page's clash(): the muster, then the odds sim:clash measured), so a war takes milliseconds. What it answers:
 * how long a war runs, whether a seat wins more than its share (you sit first and move first), and how often the
 * general leading after round five is the one who wins.
 * ⚠ A CALIBRATION INSTRUMENT: the machine plays your seat too, by Red's plan, and nobody plays a battle.
 * ========================================================================== */
'use strict';
const path = require('path');
const { fork } = require('child_process');

const env = (k, d) => (process.env[k] != null && process.env[k] !== '' ? process.env[k] : d);
const N = +env('N', 400), MODES = env('MODES', 'three,four').split(','), LEVEL = env('LEVEL', 'medium');
const CARDS = env('CARDS', '1') === '1', MAX_ROUNDS = +env('MAX_ROUNDS', 80), WORKERS = Math.max(1, +env('WORKERS', 6));

function worker(mode, count) {
  const camp = require(path.join(__dirname, 'campaign-vm.js')).load();
  camp.useMap(camp.mapFor(mode));
  /* the page's victory line, or the one under test: WIN3 / WIN4 (99 = none, the last one standing) */
  const win = Object.assign({}, camp.WAR_WIN);
  if (process.env.WIN3) win.three = +process.env.WIN3;
  if (process.env.WIN4) win.four = +process.env.WIN4;
  camp.setWarWin(win);
  const need = win[mode];
  const held = (G, s) => G.own.filter((o) => o === s).length;
  for (let c = 0; c < count; c++) {
    camp.newCampaign(LEVEL, mode, { fog: false, cards: CARDS });
    const G = camp.G;
    const out = { mode, winner: null, rounds: 0, battles: 0, took: 0, out: [], at5: null, idle: 0, turns: 0 };
    let over = false;
    for (let round = 1; round <= MAX_ROUNDS && !over; round++) {
      out.rounds = round;
      for (const side of G.sides) {
        if (!held(G, side)) continue;
        G.side = side; G.down = [];
        const plan = camp.rivalPlan(side);
        plan.deploy.forEach((id) => { G.ranks[id]++; });
        let fought = 0;
        for (const a of plan.attacks) {
          if (G.own[a.from] !== side || G.ranks[a.from] < 2 || G.own[a.to] === side) continue;
          const P = camp.clash(a.from, a.to);
          fought++; out.battles++; if (P.won && !P.broke) out.took++;
          G.sides.forEach((s) => { if (s !== side && !held(G, s) && out.out.indexOf(s) < 0) out.out.push(s); });
          if (G.sides.filter((s) => held(G, s)).length === 1 || held(G, side) >= need) { over = true; break; }
        }
        out.turns++; if (!fought) out.idle++;
        if (over) break;
        const mv = plan.move;
        if (mv && G.own[mv.from] === side && G.own[mv.to] === side) {
          const n = Math.min(mv.n, Math.max(0, G.ranks[mv.from] - 1));
          if (n > 0) { G.ranks[mv.from] -= n; G.ranks[mv.to] += n; }
        }
      }
      if (round === 5) out.at5 = G.sides.map((s) => held(G, s));
      if (over) break;
      G.round++;
      camp.drawCard();
    }
    const alive = G.sides.filter((s) => held(G, s)), top = G.sides.filter((s) => held(G, s) >= need);
    out.winner = top.length ? top[0] : alive.length === 1 ? alive[0] : null;
    out.left = G.sides.map((s) => held(G, s));
    process.stdout.write(JSON.stringify(out) + '\n');
  }
}

function run(mode) {
  const per = Math.ceil(N / WORKERS), jobs = [];
  for (let w = 0; w < WORKERS; w++) {
    const count = Math.min(per, N - w * per);
    if (count <= 0) break;
    jobs.push(new Promise((res) => {
      const lines = [];
      const kid = fork(__filename, [], { env: Object.assign({}, process.env, { SIM_WORKER: '1', SIM_MODE: mode, SIM_COUNT: String(count) }),
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
const pct = (a, b) => (b ? (100 * a / b).toFixed(0) + '%' : '—');
const q = (a, f) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(f * s.length))]; };

if (process.env.SIM_WORKER) {
  worker(process.env.SIM_MODE, +process.env.SIM_COUNT);
} else {
  (async () => {
    console.log(`=== CHESSWILD: CAMPAIGN — WARS OF THREE AND FOUR, MACHINE AGAINST MACHINE ===`);
    console.log(`  ${LEVEL} · cards ${CARDS ? 'on' : 'off'} · every battle by clash() · ${N} wars a mode`);
    for (const mode of MODES) {
      const t0 = Date.now(), rs = await run(mode), sides = mode === 'three' ? ['m', 't', 'u'] : ['m', 't', 'u', 'v'];
      const done = rs.filter((r) => r.winner), rounds = done.map((r) => r.rounds);
      console.log(`\n── ${mode} · ${rs.length} wars · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      console.log(`   finished ${done.length} (${rs.length - done.length} still going at round ${MAX_ROUNDS}) · rounds: median ${q(rounds, 0.5)}` +
                  ` · middle half ${q(rounds, 0.25)}–${q(rounds, 0.75)} · 90% by ${q(rounds, 0.9)}`);
      console.log('   wins by seat (in turn order): ' + sides.map((s) => s + ' ' + pct(done.filter((r) => r.winner === s).length, done.length)).join(' · ') +
                  `  (a fair share is ${pct(1, sides.length)})`);
      const firstOut = {}; rs.forEach((r) => { if (r.out[0]) firstOut[r.out[0]] = (firstOut[r.out[0]] || 0) + 1; });
      console.log('   out first: ' + sides.map((s) => s + ' ' + pct(firstOut[s] || 0, rs.filter((r) => r.out.length).length)).join(' · '));
      let lead = 0, leadWon = 0;
      done.forEach((r) => {
        if (!r.at5) return;
        const top = Math.max.apply(null, r.at5), who = r.at5.map((v, i) => (v === top ? sides[i] : null)).filter(Boolean);
        if (who.length !== 1) return;
        lead++; if (who[0] === r.winner) leadWon++;
      });
      console.log(`   the general leading after round 5 won ${pct(leadWon, lead)} of ${lead}` +
                  ` · battles a war ${(rs.reduce((s, r) => s + r.battles, 0) / rs.length).toFixed(1)} · attacks that took ground ` +
                  pct(rs.reduce((s, r) => s + r.took, 0), rs.reduce((s, r) => s + r.battles, 0)) +
                  ` · turns with no attack ${pct(rs.reduce((s, r) => s + r.idle, 0), rs.reduce((s, r) => s + r.turns, 0))}`);
    }
  })().catch((e) => { console.error('SIM CRASHED:', e); process.exit(1); });
}
