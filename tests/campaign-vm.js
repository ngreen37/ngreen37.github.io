/* The Campaign's own script, run in Node: the page's inline game (assets/games/pjcc_marchland.html) with a DOM that
 * absorbs every call, and a hook spliced in before the closing `})();` that hands its insides out. Nothing here
 * re-implements a rule: the sim (tests/sim-campaign.js) and the town's corpus play the page's own functions.
 *   const camp = require('./campaign-vm').load();   camp.G, camp.musterBattle(...), camp.rivalPlan('m') …
 * ⚠ A NAME THE HOOK CANNOT FIND THROWS AT LOAD: the page changed shape, so read it again rather than stubbing it. */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGE = path.join(ROOT, 'assets/games/pjcc_marchland.html');

/* ⚠ THE MAP IS READ LIVE (getters, in the hook): useMap() points LAND, EDGES and ADJ at another map, and a value copied
   once stayed the ten — a war's corpus rows read ten holdings off a sixteen-holding war (11-10) */
const LIVE = ['LAND', 'EDGES', 'ADJ'];
const EXPOSE = ['LEVELS', 'START_OWN', 'START_RANKS', 'START_WALLS', 'ATTACK_CAP', 'FACES',
  'CLOCK_ATT', 'CLOCK_DEF', 'MOVE_DELAY', 'MATE_SCORE', 'VAL', 'CARDS', 'DECK', 'DAILY_ROUNDS',
  'newCampaign', 'musterBattle', 'resolveLand', 'rivalPlan', 'deployFor', 'idsOf', 'chained', 'chainCount', 'nbrs',
  'adj', 'drawCard', 'playCard', 'cardAtks', 'bestMove', 'material', 'loneKing', 'sieged', 'walled', 'breached',
  'wallsFor', 'fortReach', 'seeded', 'dailyStart', 'mulberry32', 'hashStr', 'poolFor', 'rollPool', 'bestOf',
  'matBudget', 'capsFor', 'muster', 'buildBoard', 'applyAttackerPos', 'applyDefenderPos', 'campaignCheck',
  'keptShare', 'troopsLine', 'RIVAL', 'MAXWELL_LINES', 'observeFile', 'habitsOf', 'lineFor', 'freshLog', 'noteAttack',
  'noteTurn', 'fileCampaign', 'loadFile', 'DOGS', 'dogOf', 'perkOf', 'dogStart', 'dogAfter', 'sniffable', 'variantOf', 'fogged', 'LESSON_STEPS', 'FIRST_MAP', 'MAIN_MAP', 'FIRST_START', 'useMap', 'mapFor',
  'firstPlan', 'teachNow',
  /* a war of three or four (11-10) */
  'SIDES', 'WAR3_MAP', 'WAR4_MAP', 'WAR_START', 'CLASH', 'clash', 'clashBin', 'sidesFor', 'nextSide', 'alive', 'generalOf',
  'GENERAL_LINES', 'multi', 'overFor',
  /* generals from your Assembly, and the war replayed (11-10) */
  'ORDERS', 'GENERALS', 'GENERAL_SAY', 'musterGenerals', 'orderOf', 'canOrder', 'giveOrder', 'held', 'barred',
  'warBegin', 'warNote', 'warTurn', 'warEnd', 'betterWar', 'keepBest', 'loadBest', 'warFrames', 'BEST_KEY',
  /* places that fight their own chess (11-11) */
  'RULES', 'RULE_SAY', 'ruleAt', 'EG_CAPS', 'egBudget', 'CLASHES', 'DROP_ORDER', 'battleState', 'dropsOf', 'bLegal',
  'bMake', 'bResult', 'handValue', 'evalPos', 'ordered', 'queened', 'EG_PUSH', 'capsOn'];

function gameScript() {
  const html = fs.readFileSync(PAGE, 'utf8').replace(/\r\n/g, '\n');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const src = blocks.find((b) => b.indexOf('function musterBattle(') >= 0);
  if (!src) throw new Error('campaign-vm: the game script is not in ' + PAGE);
  const at = src.lastIndexOf('})();');
  if (at < 0) throw new Error('campaign-vm: the end of the game IIFE moved');
  const hook = '\nwindow.__CAMP = { get G() { return G; }, set G(v) { G = v; }, get PEND() { return PEND; }, ' +
    'set PEND(v) { PEND = v; }, setRNG: function (f) { RNG = f; }, get SURVIVE() { return SURVIVE; }, ' +
    'setSurvive: function (v) { SURVIVE = v; }, ' +
    'setWarWin: function (win) { WAR_WIN = win; }, get WAR_WIN() { return WAR_WIN; }, ' +
    'setEgScale: function (v) { EG_SCALE = v; }, get EG_SCALE() { return EG_SCALE; }, ' +
    'setDrEdge: function (v) { DR_EDGE = v; }, get DR_EDGE() { return DR_EDGE; }, ' +
    'setPcEdge: function (v) { PC_EDGE = v; }, get PC_EDGE() { return PC_EDGE; }, ' +
    LIVE.map((k) => 'get ' + k + '() { return ' + k + '; }').join(', ') + ', ' +
    EXPOSE.map((k) => k + ': ' + k).join(', ') + ' };\n';
  return src.slice(0, at) + hook + src.slice(at);
}

/* an element that takes every property and every call, and is never anything in particular */
function absorb() {
  const fn = function () { return absorb(); };
  return new Proxy(fn, {
    get(t, k) {
      if (k === 'children' || k === 'childNodes') return [];
      if (k === 'classList') return { add() {}, remove() {}, toggle() {}, contains() { return false; } };
      if (k === 'style') return { setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } };
      if (k === 'dataset') return {};
      if (k === 'length') return 0;
      if (k === Symbol.toPrimitive) return () => '';
      if (k === 'then') return undefined;
      return absorb();
    },
    set() { return true; },
    apply() { return absorb(); },
  });
}

/* opts.random: the page's Math.random (the town's corpus hands the page a stream it records, draw for draw) */
function load(opts) {
  const store = {};
  const M = opts && opts.random ? Object.assign(Object.create(Math), { random: opts.random }) : Math;
  const ctx = {
    console, Math: M, Date, JSON, Array, Object, String, Number, Boolean, Error, Symbol, Proxy,
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
    navigator: absorb(),
    document: {
      getElementById: () => absorb(), querySelector: () => null, querySelectorAll: () => [],
      createElement: () => absorb(), addEventListener() {}, hidden: false, activeElement: null,
    },
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    },
    PJCCChess: require(path.join(ROOT, 'assets/js/pjcc-chess.js')),
    PJCCVs: { paint() {}, color() { return '#ffffff'; } },
  };
  ctx.window = ctx;
  ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(gameScript(), ctx, { filename: 'pjcc_marchland.html' });
  const camp = ctx.__CAMP;
  const missing = EXPOSE.filter((k) => typeof camp[k] === 'undefined');
  if (missing.length) throw new Error('campaign-vm: the page no longer has ' + missing.join(', '));
  camp.C = ctx.PJCCChess;
  camp.store = store;
  return camp;
}

module.exports = { load, gameScript };
