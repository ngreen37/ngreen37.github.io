#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   gen-marchland-data.js  —  npm run gen:marchland

   Lifts the map and every balance dial out of the shipped game and writes them to
   assets/data/marchland.json.

   ⚑ WHY THIS EXISTS, 2026-08-24. Nate: "Can we combine JSON elements and Godot elements?"
   Yes — and the cheapest, highest-value version of that is not a bridge or an embed, it is
   ONE DATA FILE. The browser game keeps its constants inline (a self-contained page with no
   fetch and no failure mode, which is why it works from file://), and this pulls a copy out
   into JSON that a Godot build reads with:

       var d = JSON.parse_string(FileAccess.get_file_as_string("res://data/marchland.json"))

   So the map is designed and tuned ONCE, in the place it is played, and the Godot version
   inherits a balanced map instead of a retyped one.

   ⚠ THE JSON IS DERIVED, NEVER AUTHORED. The game is the source of truth. Hand-editing the
   JSON would put the two out of step silently, so `tests/marchland.check.js` fails if the
   file on disk does not match what this generator would produce right now. Same shape as
   gen:clock and gen:city — generate, commit, and let a gate catch the staleness.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAME = path.join(ROOT, 'assets/games/pjcc_marchland.html');
const OUT = path.join(ROOT, 'assets/data/marchland.json');

function slice(src, from, to) {
  const a = src.indexOf(from), b = src.indexOf(to, a);
  if (a < 0) throw new Error('gen:marchland — could not find "' + from + '" in the game');
  if (b < 0) throw new Error('gen:marchland — could not find "' + to + '" after "' + from + '"');
  return src.slice(a, b);
}

function build() {
  const src = fs.readFileSync(GAME, 'utf8');
  const code =
    slice(src, 'var LAND = [',     '/* ── THE CHAIN') +
    slice(src, 'var CHAIN_MIN',    '/* ── DIFFICULTY') +
    slice(src, 'var LEVELS = {',   'var G = null;') +
    /* ⚠⚠ THIS SLICE USED TO START AT `var DICE_CAP`, WHICH IS 27 LINES BELOW THE DIE.
       So `FACES` — the single number that says how big the die is — was not in the vm and
       therefore not in the JSON, and a Godot build reading this file to "inherit a tuned
       game" would have had to guess it. It guessed wrong for a day: the die was a d20 until
       2026-08-25 and every balance number in here was retuned around a d8.
       ⭐ THE LESSON IS ABOUT THE SLICE, NOT THE CONSTANT. A boundary picked to start at the
       first thing you happened to want silently excludes everything above it, and nothing
       fails — the export is simply missing a field, which reads as "Godot does not need
       that one". Start at the DEFINITION, not at the first line you were looking for. */
    slice(src, 'var FACES',        'function rollPool') +
    slice(src, 'var MAT_SCALE',    'function matBudget') +
    slice(src, 'var POS_CASTLE',   'function posSteps') +
    slice(src, 'var VAL = {',      'function capsFor') +
    slice(src, 'var CLOCK_ATT',    '/* THE REVEAL BEAT') +
    /* 11-10: what a result is worth, Maxwell and his words, the dogs, and the first campaign — data a port reads, so
       his words and the small map are typed once */
    slice(src, 'var SURVIVE',      '/* the share of its points') +
    slice(src, 'var RIVAL',        'var FILE_KEY') +
    slice(src, 'var DOGS',         'var DOG_KEY') +
    slice(src, 'var FIRST_MAP',    'var FIRST_DONE') +
    slice(src, 'var LESSON_STEPS', 'function mapFor') +
    /* the rest a port reads rather than retypes: the cards, the Daily's length, the engine's values, where the muster
       stands each piece, and the battle's beats */
    slice(src, 'var CARDS = {',      'function drawCard') +
    slice(src, 'var DAILY_ROUNDS',   'function variantOf') +
    slice(src, 'var EV = {',         'function evalPos') +
    slice(src, 'var MATE_SCORE',     '/* ⚠ RETURNS AN OBJECT') +
    slice(src, 'var W_BACK',         '/* ⛑⛑ A PAIR OF BISHOPS') +
    slice(src, 'var REVEAL_MS',      'function startBattle') +
    /* 11-10, his picks 6, 7, 9, 10: a war of three or four (the maps, the seats, the measured odds two machines' battle
       is decided at, the line that ends it, the other generals' words), and the orders your Assembly gives */
    slice(src, 'var SIDES',          'function sidesFor') +
    slice(src, 'var GENERAL_LINES',  '/* a general\'s face and line') +
    slice(src, 'var ORDERS',         'function assemblyNames');
  const G = { Math, Array };
  vm.createContext(G);
  vm.runInContext(code, G);

  const data = {
    _generated: 'GENERATED FILE — do not hand-edit. Source of truth is ' +
                'assets/games/pjcc_marchland.html; regenerate with `npm run gen:marchland`.',
    _purpose: 'Shared map + balance data. The browser game keeps these inline; a Godot build ' +
              'reads this file so both play the same tuned game.',
    name: 'ChessWild: Campaign',
    version: '0.5',
    holdings: G.LAND.map((L) => ({ id: L.id, name: L.nm, x: L.x, y: L.y })),
    edges: G.EDGES.map((e) => [e[0], e[1]]),
    start: { owner: G.START_OWN.slice(), ranks: G.START_RANKS.slice(), walls: G.START_WALLS.slice() },
    balance: {
      /* THE DIE ITSELF. Everything below is expressed in pips, so this is the first number
         a second implementation needs and the last one it can afford to assume. */
      faces: G.FACES,
      matScale: G.MAT_SCALE,
      /* ⚠ matBudget IS `die * matScale + matBase + floor(ranks/2) + edge` — matBase was
         added on 2026-08-25 with the d8 and was missed here, which made the exported
         formula off by one point of material on every muster in the game. Half a pawn,
         invisible in any single battle, decisive across a campaign. */
      matBase: G.MAT_BASE,
      attEdge: G.ATT_EDGE,
      defEdge: G.DEF_EDGE,
      diceCap: G.DICE_CAP,
      queenRanks: G.QUEEN_RANKS,
      queen2Chain: G.QUEEN2_CHAIN,   // a second queen needs a perfect roll AND this many chained
      chainMin: G.CHAIN_MIN,
      attackCap: G.ATTACK_CAP,
      posCastle: G.POS_CASTLE,
      posTop: G.POS_TOP,
      clockAtt: G.CLOCK_ATT,
      clockDef: G.CLOCK_DEF,
      moveDelay: G.MOVE_DELAY,
      pieceValues: G.VAL,
      survive: G.SURVIVE             // what's left on the board marches in: 'win' = the side that won the ground keeps a share
    },
    rival: { who: G.RIVAL.who, key: G.RIVAL.key, lines: G.MAXWELL_LINES },
    dogs: G.DOGS.map((d) => ({ id: d.id, name: d.name, perk: d.perk, says: G.DOG_SAY[d.perk] })),
    cards: Object.keys(G.CARDS).reduce((o, k) => { o[k] = { name: G.CARDS[k].nm, text: G.CARDS[k].txt }; return o; }, {}),
    deck: G.DECK.slice(),
    dailyRounds: G.DAILY_ROUNDS,
    engine: { ev: G.EV, mateScore: G.MATE_SCORE },
    placement: { wBack: G.W_BACK.slice(), wPawn: G.W_PAWN.slice(), bBack: G.B_BACK.slice(), bPawn: G.B_PAWN.slice() },
    battle: { revealMs: G.REVEAL_MS, mercyMs: G.MERCY_MS, mercyPly: G.MERCY_PLY, mercyOdds: G.MERCY_ODDS },
    /* a war of three or four: the seats (whose color, which general), each map and its dealt start, the line that ends
       it, the measured odds two machines' battle is decided at, and the other generals' words (HIS) */
    war: {
      sides: Object.keys(G.SIDES).reduce((o, k) => { const s = G.SIDES[k]; o[k] = { name: s.nm, color: s.col, bg: s.bg, who: s.who, key: s.key }; return o; }, {}),
      three: { holdings: G.WAR3_MAP.land.map((L) => ({ id: L.id, name: L.nm, x: L.x, y: L.y })), edges: G.WAR3_MAP.edges.map((e) => [e[0], e[1]]),
               start: { sides: G.WAR_START.three.sides.slice(), owner: G.WAR_START.three.own.slice(), ranks: G.WAR_START.three.ranks.slice(),
                        walls: G.WAR_START.three.walls.slice() }, win: G.WAR_WIN.three },
      four:  { holdings: G.WAR4_MAP.land.map((L) => ({ id: L.id, name: L.nm, x: L.x, y: L.y })), edges: G.WAR4_MAP.edges.map((e) => [e[0], e[1]]),
               start: { sides: G.WAR_START.four.sides.slice(), owner: G.WAR_START.four.own.slice(), ranks: G.WAR_START.four.ranks.slice(),
                        walls: G.WAR_START.four.walls.slice() }, win: G.WAR_WIN.four },
      clash: { lo: G.CLASH.lo, bin: G.CLASH.bin, p: G.CLASH.p.slice(), ka: G.CLASH.ka.slice(), kd: G.CLASH.kd.slice() },
      lines: G.GENERAL_LINES
    },
    /* your Assembly's generals: each order (named and worded HIS), who gives which, and what each says giving it */
    generals: {
      orders: Object.keys(G.ORDERS).reduce((o, k) => { o[k] = { name: G.ORDERS[k].nm, text: G.ORDERS[k].txt, at: !!G.ORDERS[k].at }; return o; }, {}),
      who: G.GENERALS, says: G.GENERAL_SAY
    },
    first: { holdings: G.FIRST_MAP.land.map((L) => ({ id: L.id, name: L.nm, x: L.x, y: L.y })),
             edges: G.FIRST_MAP.edges.map((e) => [e[0], e[1]]), start: { owner: G.FIRST_START.own.slice(),
             ranks: G.FIRST_START.ranks.slice(), walls: G.FIRST_START.walls.slice() }, lessons: G.LESSON_STEPS.slice() },
    levels: Object.keys(G.LEVELS).reduce((o, k) => {
      const L = G.LEVELS[k];
      o[k] = { name: L.nm, depth: L.depth, thinkMs: L.ms, slip: L.slip, slipCp: L.slipCp,
               paceMs: L.pace, note: L.note, minEdge: L.minEdge, maxAttacks: L.maxAtk,
               smart: L.smart, chainAware: L.chainAware };
      return o;
    }, {})
  };
  return JSON.stringify(data, null, 2) + '\n';
}

module.exports = { build, OUT };

if (require.main === module) {
  const json = build();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  fs.writeFileSync(OUT, json);
  const d = JSON.parse(json);
  console.log('\n  ' + (prev === json ? 'unchanged' : prev === null ? 'created' : 'UPDATED') +
              ': assets/data/marchland.json');
  console.log('    ' + d.holdings.length + ' holdings · ' + d.edges.length + ' borders · ' +
              d.start.ranks.reduce((s, v) => s + v, 0) + ' ranks · ' +
              Object.keys(d.levels).length + ' difficulty levels');
  console.log('    ATT_EDGE ' + d.balance.attEdge + ' · clocks ' + d.balance.clockAtt + '/' +
              d.balance.clockDef + ' · delay ' + d.balance.moveDelay + 's\n');
}
