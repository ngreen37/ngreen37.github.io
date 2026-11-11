/* =============================================================================
 * sim-clash.js — the odds a battle between two machines is decided at, in a war of three or four.
 *   npm run sim:clash
 *   env: N=3000 (battles) WORKERS=6 ENGINE_MS=25 SEC_PER_MOVE=1.7 LO=-12 BIN=3 BINS=12
 *
 * His pick #10 (11-10): "battles between computer players get decided instantly at the odds our tests measured". This
 * is the measuring. Each battle is mustered by the page's own musterBattle() (the dice, the pools, the caps, the board)
 * from stacks dealt at random on the ten-holding map, then played engine against engine by the page's own bestMove(),
 * the clock a move budget (CLOCK / (SEC_PER_MOVE - MOVE_DELAY)) as sim:campaign plays it. What it keeps of each: the
 * material gap on the mustered board (the attacker's points less the defender's), who took the ground, and the share
 * of its points each side still had standing.
 * It prints the table the page's CLASH holds: by gap, in bins of BIN from LO (the ends open), how often the attack
 * took the ground (p, made never to fall as the gap grows), and the shares a won attack (ka) and a held defense (kd)
 * kept. Paste it into CLASH, then `npm run gen:marchland`.
 * ⚠ A CALIBRATION INSTRUMENT, like sim:marchland: engine against engine at one strength, the clock as a budget.
 * ========================================================================== */
'use strict';
const path = require('path');
const { fork } = require('child_process');

const env = (k, d) => (process.env[k] != null && process.env[k] !== '' ? process.env[k] : d);
const N = +env('N', 3000);
const WORKERS = Math.max(1, +env('WORKERS', 6));
const ENGINE_MS = +env('ENGINE_MS', 25), SEC_PER_MOVE = +env('SEC_PER_MOVE', 1.7);
const LO = +env('LO', -12), BIN = +env('BIN', 3), BINS = +env('BINS', 12);
/* RULE: a place that fights its own chess (endgame | drops) — only battles for its ground; unset, only battles for ground
   with no rule. EG_SCALE overrides the page's endgame budget scale, for the sweep. */
const RULE = env('RULE', ''), EG = env('EG_SCALE', ''), DR = env('DR_EDGE', ''), PC = env('PC_EDGE', '');

function worker(count, seed) {
  const camp = require(path.join(__dirname, 'campaign-vm.js')).load();
  if (EG !== '') camp.setEgScale(+EG);
  if (DR !== '') camp.setDrEdge(+DR);
  if (PC !== '') camp.setPcEdge(+PC);
  const EFF = Math.max(0.15, SEC_PER_MOVE - camp.MOVE_DELAY);
  const movesAtt = Math.max(1, Math.round(camp.CLOCK_ATT / EFF));
  const movesDef = Math.max(1, Math.round(camp.CLOCK_DEF / EFF));
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (n) => Math.floor(rnd() * n);
  for (let c = 0; c < count; c++) {
    camp.newCampaign('medium', 'solo', { fog: false, cards: false });
    const G = camp.G;
    /* a map somewhere in a war: owners and stacks dealt at random, so chains come and go as they do */
    for (let i = 0; i < camp.LAND.length; i++) { G.own[i] = rnd() < 0.5 ? 'm' : 't'; G.ranks[i] = 1 + pick(8); }
    G.walls = []; G.down = [];
    const opts = [];
    camp.EDGES.forEach((e) => {
      if (G.own[e[0]] === G.own[e[1]]) return;
      [[e[0], e[1]], [e[1], e[0]]].forEach((x) => { if (camp.ruleAt(x[1]) === RULE) opts.push(x); });
    });
    if (!opts.length) { c--; continue; }
    const [from, to] = opts[pick(opts.length)];
    G.ranks[from] = 2 + pick(8);
    const P = camp.musterBattle(from, to, true);
    let S = camp.battleState(P);
    let usedW = 0, usedB = 0, how = null;
    while (!how) {
      const mover = S.turn;
      if ((mover === 'w' && usedW >= movesAtt) || (mover === 'b' && usedB >= movesDef)) {
        how = camp.loneKing(S.b, mover === 'w' ? 'b' : 'w', S.hand) ? 'draw' : mover === 'w' ? 'flag-att' : 'flag-def';
        break;
      }
      const pk = camp.bestMove(S, ENGINE_MS, 3, 0, 0);
      if (!pk || !pk.mv) { how = 'draw'; break; }
      let m = pk.mv;
      const pc = S.b[m.from];
      if (!m.promo && pc && pc.toLowerCase() === 'p' && ((m.to / 8 | 0) === 7 || (m.to / 8 | 0) === 0)) {
        m = { from: m.from, to: m.to, promo: mover === 'w' ? 'Q' : 'q' };
      }
      S = camp.bMake(S, m);
      if (mover === 'w') usedW++; else usedB++;
      const r = camp.bResult(S);
      if (r === 'checkmate') { how = mover === 'w' ? 'mate-att' : 'mate-def'; break; }
      if (r === 'queen-w' || r === 'queen-b') { how = r === 'queen-w' ? 'queen-att' : 'queen-def'; break; }
      if (r) { how = 'draw'; break; }
    }
    const won = how === 'mate-att' || how === 'flag-def' || how === 'queen-att';
    const am = camp.material(P.board, 'w'), dm = camp.material(P.board, 'b');
    process.stdout.write(JSON.stringify({ gap: am - dm, am, dm, won, how, castled: !!P.dInfo.castled, moved: P.aMoved,
      ka: camp.keptShare(P.board, S.b, 'w', S.hand), kd: camp.keptShare(P.board, S.b, 'b', S.hand), a: P.aRanks, d: P.dRanks,
      plies: usedW + usedB }) + '\n');
  }
}

function run() {
  const per = Math.ceil(N / WORKERS), jobs = [];
  for (let w = 0; w < WORKERS; w++) {
    const count = Math.min(per, N - w * per);
    if (count <= 0) break;
    jobs.push(new Promise((res) => {
      const lines = [];
      const kid = fork(__filename, [], { env: Object.assign({}, process.env, { SIM_WORKER: '1', SIM_COUNT: String(count), SIM_SEED: String(0x1110 + w * 7919) }),
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

/* pool-adjacent violators: the nearest never-falling run, weighted by how many battles each bin holds */
function monotone(v, w) {
  const blocks = v.map((x, i) => ({ v: x, w: w[i], n: 1 }));
  for (let i = 0; i < blocks.length - 1;) {
    if (blocks[i].v > blocks[i + 1].v) {
      const a = blocks[i], b = blocks[i + 1], ww = a.w + b.w;
      blocks.splice(i, 2, { v: ww ? (a.v * a.w + b.v * b.w) / ww : (a.v + b.v) / 2, w: ww, n: a.n + b.n });
      if (i > 0) i--;
    } else i++;
  }
  const out = [];
  blocks.forEach((b) => { for (let k = 0; k < b.n; k++) out.push(b.v); });
  return out;
}

if (process.env.SIM_WORKER) {
  worker(+process.env.SIM_COUNT, +process.env.SIM_SEED);
} else {
  (async () => {
    const t0 = Date.now();
    console.log(`=== CHESSWILD: CAMPAIGN — THE ODDS A MACHINES' BATTLE IS DECIDED AT ===`);
    console.log(`  ${N} battles · engine ${ENGINE_MS}ms · ${SEC_PER_MOVE}s a move · bins of ${BIN} from ${LO}, ${BINS} of them` +
                ` · ${RULE ? 'the ground of rule "' + RULE + '"' : 'ground with no rule'}${EG !== '' ? ' · EG_SCALE ' + EG : ''}` +
                `${DR !== '' ? ' · DR_EDGE ' + DR : ''}${PC !== '' ? ' · PC_EDGE ' + PC : ''}`);
    const rs = await run();
    if (process.env.RAW) require('fs').writeFileSync(process.env.RAW, rs.map((r) => JSON.stringify(r)).join('\n') + '\n');
    const bins = Array.from({ length: BINS }, () => ({ n: 0, won: 0, ka: 0, kn: 0, kd: 0, dn: 0 }));
    rs.forEach((r) => {
      const k = Math.max(0, Math.min(BINS - 1, Math.floor((r.gap - LO) / BIN)));
      const b = bins[k];
      b.n++;
      if (r.won) { b.won++; b.ka += r.ka; b.kn++; } else { b.kd += r.kd; b.dn++; }
    });
    const all = rs.filter((r) => r.won).length;
    console.log(`  ${(Date.now() - t0) / 60000 | 0} min · attacks that took the ground ${(100 * all / rs.length).toFixed(1)}% of ${rs.length}`);
    const hows = {};
    rs.forEach((r) => { hows[r.how] = (hows[r.how] || 0) + 1; });
    console.log('  how they ended: ' + Object.keys(hows).sort().map((k) => k + ' ' + (100 * hows[k] / rs.length).toFixed(0) + '%').join(' · '));
    console.log('\n  gap           battles   took    won kept   held kept');
    bins.forEach((b, i) => {
      const lo = i === 0 ? '   …' : String(LO + i * BIN).padStart(4), hi = i === BINS - 1 ? '…  ' : String(LO + (i + 1) * BIN - 1).padEnd(3);
      console.log(`  ${lo} to ${hi}   ${String(b.n).padStart(6)}   ${b.n ? (b.won / b.n).toFixed(2) : '  — '}    ` +
                  `${b.kn ? (b.ka / b.kn).toFixed(2) : '  — '}       ${b.dn ? (b.kd / b.dn).toFixed(2) : '  — '}`);
    });
    const raw = bins.map((b) => (b.n ? b.won / b.n : 0.5));
    const p = monotone(raw, bins.map((b) => b.n)).map((x) => Math.round(x * 100) / 100);
    /* a bin with no battles takes its neighbors' share; the shares are kept as measured (they need not run one way) */
    const fill = (vals, ns) => vals.map((v, i) => {
      if (ns[i]) return Math.round(v * 100) / 100;
      for (let d = 1; d < vals.length; d++) {
        if (ns[i - d]) return Math.round(vals[i - d] * 100) / 100;
        if (ns[i + d]) return Math.round(vals[i + d] * 100) / 100;
      }
      return 1;
    });
    const ka = fill(bins.map((b) => (b.kn ? b.ka / b.kn : 0)), bins.map((b) => b.kn));
    const kd = fill(bins.map((b) => (b.dn ? b.kd / b.dn : 0)), bins.map((b) => b.dn));
    console.log('\n  For the page\'s CLASH (assets/games/pjcc_marchland.html), then `npm run gen:marchland`:\n');
    const plies = rs.reduce((s, r) => s + (r.plies || 0), 0) / Math.max(1, rs.length);
    console.log(`  ${plies.toFixed(1)} plies a battle on average`);
    console.log(RULE ? `CLASHES.${RULE} = { lo: ${LO}, bin: ${BIN},` : `var CLASH = { lo: ${LO}, bin: ${BIN},`);
    console.log(`  p:  [${p.map((x) => x.toFixed(2)).join(', ')}],`);
    console.log(`  ka: [${ka.map((x) => x.toFixed(2)).join(', ')}],`);
    console.log(`  kd: [${kd.map((x) => x.toFixed(2)).join(', ')}] };`);
  })().catch((e) => { console.error('SIM CRASHED:', e); process.exit(1); });
}
