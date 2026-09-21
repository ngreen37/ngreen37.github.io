#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   gen-godot-game.js  —  npm run gen:godotgame

   Turns a PGN into the JSON the Godot tournament board eats. Paste the game off Lichess
   or chess24 the moment it finishes, run this, drop the file in the Godot project, hit
   play. That is the whole loop, and it is the reason the board is worth building: during
   a Candidates round the window between "that was a beautiful game" and "nobody cares
   any more" is about six hours.

       node tests/gen-godot-game.js game.pgn
       node tests/gen-godot-game.js game.pgn --out private/docs/godot/tournament_board/data/game.json
       cat game.pgn | node tests/gen-godot-game.js -

   ⭐ THIS FILE IS "DATA CROSSES, RULES DON'T" TAKEN AS FAR AS IT GOES (private/docs/Godot.md §2).
   Godot gets NO chess in it. Not a move generator, not a SAN parser, not a castling rule,
   not an en-passant special case. Every move in the output already carries the four things
   a picture needs — which piece moved, where it went, what died and where it was standing,
   and which rook came along — so the Godot side is one function that reads a dictionary and
   slides sprites. That is ~60 lines instead of ~600, and none of the 600 could ever be as
   correct as this side already is.

   ⚠ THE SAN PARSER HERE IS NOT A PARSER. It never reads "Nbd7" and works out what it means.
   It asks pjcc-chess.js for every legal move, renders each one back to SAN with the shipped
   `toSAN()`, and takes the one that matches the token. So disambiguation, promotion,
   castling and check suffixes are all handled by the perft-verified generator that already
   runs the site, and an illegal or ambiguous token fails LOUDLY instead of drawing a wrong
   board. A second implementation is a second set of bugs.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('../assets/js/pjcc-chess.js');

/* ── the PGN, reduced to tokens ────────────────────────────────────────────────────────
   Comments, variations and annotation glyphs are commentary ON a game, not the game. A
   broadcast board plays the moves that were played. Variations are stripped whole —
   including nested ones, which is why this is a counter and not a regex. */
function stripVariations(s) {
  let out = '', depth = 0;
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') { if (depth > 0) depth--; }
    else if (depth === 0) out += ch;
  }
  return out;
}

function readPGN(text) {
  const tags = {};
  const tagRe = /\[\s*(\w+)\s*"([^"]*)"\s*\]/g;
  let m;
  while ((m = tagRe.exec(text))) tags[m[1]] = m[2];

  let body = text.replace(tagRe, '');
  /* ⚠ A COMMENT IS KEPT AS A MARKER, NOT DELETED: a broadcast puts the clock ([%clk]) and the
     engine's eval ([%eval]) in the comment after each move, and a board that shows the clock
     has to know which move it belongs to. The marker survives, the prose inside is ignored. */
  const notes = [];
  body = body.replace(/\{([^}]*)\}/g, function (_, c) { notes.push(c); return ' \u0001' + (notes.length - 1) + ' '; });
  body = body.replace(/;[^\n]*/g, ' ');     // ; rest-of-line comments
  body = stripVariations(body);
  body = body.replace(/\$\d+/g, ' ');       // NAGs
  body = body.replace(/\d+\s*\.(\.\.)?/g, ' ');
  body = body.replace(/[?!]+/g, '');        // !? annotations — not part of the move

  const tokens = [], after = [];
  body.split(/\s+/).filter(Boolean).forEach(function (t) {
    if (t[0] === '\u0001') { if (tokens.length) after[tokens.length - 1] += ' ' + notes[+t.slice(1)]; return; }
    if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t)) return;
    tokens.push(t);
    after.push('');
  });
  return { tags: tags, tokens: tokens, notes: after };
}

/* [%clk 1:59:56] → 7196 seconds left for the side that just moved. */
function clockOf(note) {
  const m = /\[%clk\s+(\d+):(\d\d):(\d\d)(?:\.\d+)?\]/.exec(note || '');
  return m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) : null;
}

/* [%eval 0.18] / [%eval #-3] → centipawns for WHITE, capped the way the review caps them. */
function evalOf(note) {
  const m = /\[%eval\s+(#?)(-?[\d.]+)[^\]]*\]/.exec(note || '');
  if (!m) return null;
  if (m[1] === '#') return (+m[2] >= 0 ? 1500 : -1500);
  return Math.max(-1500, Math.min(1500, Math.round(+m[2] * 100)));
}

/* ⭐ SHORT NAMES FOR A CAPTION. "Ding, Liren" → Ding · "Gukesh D" → Gukesh · "Javokhir Sindarov" →
   Sindarov. A trailing single letter is an initial, and a name before a comma is a surname. */
function shortName(n) {
  n = String(n || '').trim();
  if (n.indexOf(',') > 0) return n.split(',')[0].trim();
  const parts = n.split(/\s+/);
  if (parts.length > 1 && /^[A-Z]\.?$/.test(parts[parts.length - 1])) return parts[0];
  return parts[parts.length - 1] || n;
}

/* ── one token → one move, by asking the engine ───────────────────────────────────────── */
function normalize(san) {
  return String(san).replace(/[+#?!]/g, '').replace(/0/g, 'O').replace(/x/g, 'x');
}

function resolve(state, token) {
  const want = normalize(token);
  const legal = C.legalMoves(state);
  const hits = [];
  for (const mv of legal) if (normalize(C.toSAN(state, mv)) === want) hits.push(mv);
  if (hits.length === 1) return hits[0];
  if (hits.length === 0) {
    const sample = legal.slice(0, 12).map(function (mv) { return C.toSAN(state, mv); }).join(' ');
    throw new Error('no legal move matches "' + token + '". Legal here: ' + sample + (legal.length > 12 ? ' …' : ''));
  }
  throw new Error('"' + token + '" matches ' + hits.length + ' legal moves — the PGN is ambiguous');
}

/* ── the shape Godot reads ─────────────────────────────────────────────────────────────
   ⚠ EVERY FIELD HERE EXISTS BECAUSE THE PICTURE NEEDS IT, not because chess has it.
   `capture.sq` is a separate field rather than being assumed to equal `to` for exactly one
   reason: en passant. The pawn that dies is not standing on the square the capturer lands
   on, and a board that fades out the destination square on an en passant leaves a ghost
   pawn sitting on the board for the rest of the game. It is a one-line bug that survives
   every test you would think to write, because the position is still correct — only the
   picture is wrong. */
const ROOK_RUN = {
  K: { from: 63, to: 61 },   // white  O-O    h1 → f1
  Q: { from: 56, to: 59 },   // white  O-O-O  a1 → d1
  k: { from: 7,  to: 5  },   // black  O-O    h8 → f8
  q: { from: 0,  to: 3  }    // black  O-O-O  a8 → d8
};

function describe(state, mv, ply) {
  const san = C.toSAN(state, mv);
  const piece = state.b[mv.from];
  const side = C.colorOf(piece);

  let capture = null;
  if (mv.ep) {
    const dir = side === 'w' ? -1 : 1;
    const sq = (Math.floor(mv.to / 8) - dir) * 8 + (mv.to % 8);
    capture = { sq: C.nameFromSq(sq), piece: state.b[sq] };
  } else if (state.b[mv.to]) {
    capture = { sq: C.nameFromSq(mv.to), piece: state.b[mv.to] };
  }

  const rook = mv.castle ? {
    from: C.nameFromSq(ROOK_RUN[mv.castle].from),
    to:   C.nameFromSq(ROOK_RUN[mv.castle].to)
  } : null;

  const after = C.makeMove(state, mv);
  return {
    n: ply,
    move: Math.floor((ply + 1) / 2),
    side: side,
    san: san,
    piece: piece,
    from: C.nameFromSq(mv.from),
    to: C.nameFromSq(mv.to),
    capture: capture,
    rook: rook,
    promo: mv.promo || null,
    check: C.inCheck(after, after.turn),
    mate: C.isCheckmate(after)
  };
}

function piecesOf(state) {
  const out = [];
  for (let i = 0; i < 64; i++) if (state.b[i]) out.push({ sq: C.nameFromSq(i), piece: state.b[i] });
  return out;
}

function convert(pgnText) {
  const parsed = readPGN(pgnText);
  const startFEN = parsed.tags.FEN || C.START_FEN;
  let state = C.parseFEN(startFEN);

  const moves = [], fens = [C.toFEN(state)], line = [];
  parsed.tokens.forEach(function (token, i) {
    let mv;
    try { mv = resolve(state, token); }
    catch (e) { throw new Error('ply ' + (i + 1) + ' (' + token + '): ' + e.message); }
    const d = describe(state, mv, i + 1);
    d.clock = clockOf(parsed.notes[i]);
    d.eval = evalOf(parsed.notes[i]);
    line.push({ san: d.san, mover: state.turn, from: mv.from, to: mv.to,
      uci: C.nameFromSq(mv.from) + C.nameFromSq(mv.to) + (mv.promo ? mv.promo.toLowerCase() : '') });
    moves.push(d);
    state = C.makeMove(state, mv);
    fens.push(C.toFEN(state));
  });
  /* the position after a mate has no eval to report, and does not need one */
  const last = moves[moves.length - 1];
  if (last && last.mate && last.eval === null) last.eval = last.side === 'w' ? 1500 : -1500;
  spentOf(moves, parsed.tags.TimeControl);
  Object.defineProperty(moves, '_line', { value: { fens: fens, line: line }, enumerable: false });

  return finish({
    event:  parsed.tags.Event  || '',
    site:   parsed.tags.Site   || '',
    date:   parsed.tags.Date   || '',
    round:  parsed.tags.Round  || '',
    white:  parsed.tags.White  || 'White',
    black:  parsed.tags.Black  || 'Black',
    whiteElo: parsed.tags.WhiteElo || '',
    blackElo: parsed.tags.BlackElo || '',
    result: parsed.tags.Result || '*',
    eco:    parsed.tags.ECO    || '',
    opening: parsed.tags.Opening || '',
    /* ⭐ THE OPENING POSITION AS AN ARRAY, NOT A FEN. Godot could parse a FEN in eight lines —
       but eight lines of chess notation is still chess in the renderer, and the rule is that
       none crosses. This is a list of squares and letters, which is the only thing the view
       has ever actually wanted. The FEN is kept beside it for anyone reading the file. */
    start:  startFEN,
    start_pieces: piecesOf(C.parseFEN(startFEN)),
    endFEN: C.toFEN(state),
    white_short: shortName(parsed.tags.White || 'White'),
    black_short: shortName(parsed.tags.Black || 'Black'),
    time_control: parsed.tags.TimeControl || '',
    moves:  moves
  });
}

/* Seconds each move took: the mover's clock before, minus after, plus whatever the control added.
   ⚠ UNKNOWN IS null, NEVER A GUESS — a caption that says "he thought for 40 minutes" has to be true. */
function spentOf(moves, tc) {
  const m = /^(?:(\d+)\/)?(\d+)(?::(\d+))?(?:\+(\d+))?/.exec(tc || '');
  const start = m ? +m[2] : null, bonus = m && m[3] ? +m[3] : 0, byMove = m && m[1] ? +m[1] : 0;
  const inc = /\+(\d+)\s*$/.exec(tc || '');
  const prev = { w: start, b: start };
  moves.forEach(function (mv) {
    const had = prev[mv.side];
    let spent = null;
    if (had !== null && mv.clock !== null) {
      const fullMove = mv.move;
      const add = (inc && (!byMove || fullMove > byMove) ? +inc[1] : 0) + (byMove && fullMove === byMove ? bonus : 0);
      spent = had - mv.clock + add;
      if (spent < 0 || spent > 4 * 3600) spent = null;
    }
    mv.spent = spent;
    if (mv.clock !== null) prev[mv.side] = mv.clock;
  });
}

/* ⭐ GRADED BY THE SITE'S OWN RULES (pjcc-game-review.js `grade`), from the broadcast's evals when
   every position has one. `finish` does that; `gradeWithEngine` fills in when they do not. */
let Review = null;
function review() {
  if (Review) return Review;
  global.self = global;
  global.PJCCChess = C;
  require('../assets/js/pjcc-openings.js');
  require('../assets/js/pjcc-game-review.js');
  Review = global.PJCCReview;
  return Review;
}

const START_CP = 20;
function finish(game) {
  const evW = [START_CP].concat(game.moves.map(function (m) { return m.eval; }));
  if (evW.some(function (e) { return e === null; })) { game.graded_by = null; return game; }
  return applyGrade(game, evW, null, 'broadcast evals');
}

function applyGrade(game, evW, bests, by) {
  const L = game.moves._line;
  const stm = evW.map(function (e, i) { return L.fens[i].split(' ')[1] === 'w' ? e : -e; });
  const g = review().grade(L.fens, L.line, stm, bests || new Array(L.fens.length).fill(null));
  let top = -1, topSwing = -1;
  g.plies.forEach(function (p, i) {
    const m = game.moves[i];
    m.eval = evW[i + 1];
    m.cls = p.cls;
    m.swing = Math.round(p.winLoss * 10) / 10;
    m.best = p.bestSan;
    if (p.cls !== 'book' && p.winLoss > topSwing) { topSwing = p.winLoss; top = i + 1; }
  });
  game.eval0 = evW[0];
  game.swing_ply = top;
  game.opening = game.opening || g.opening.name || '';
  game.accuracy = g.accuracy;
  game.graded_by = by;
  /* ⚠⚠ MARKS ONLY FROM THE BROADCAST'S EVALS. Measured on 2024 Game 1: our Stockfish 10, even at
     3s a position, called 39.Bh3 a blunder, missed the real mistake 30.Qc2 and flagged eleven
     inaccuracies. A "??" on a World Championship move has to be true, so a local grade drives the
     eval bar and nothing else. */
  game.marks = by === 'broadcast evals';
  return game;
}

/* Stockfish 10 under Node, one position at a time. Side-to-move POV, like the review.
   ⚠ ONE PER PROCESS: the Emscripten build aborts if it is started a second time, so it is made
   once and kept — a rehearsal grades fourteen games on the same engine. */
let SF = null;
function engine() {
  if (SF) return SF;
  const sf = require(path.join(__dirname, '..', 'assets', 'vendor', 'stockfish', 'stockfish.js'))();
  let waiting = null, lines = [];
  sf.onmessage = function (l) { l = String(l); lines.push(l); if (waiting && waiting.test(l)) { const w = waiting; waiting = null; w.done(l); } };
  function until(test, ms) {
    return new Promise(function (res, rej) {
      const t = setTimeout(function () { rej(new Error('stockfish timed out')); }, ms);
      waiting = { test: test, done: function (l) { clearTimeout(t); res(l); } };
    });
  }
  let ready = (async function () { sf.postMessage('uci'); await until(function (l) { return l.startsWith('uciok'); }, 15000);
    sf.postMessage('isready'); await until(function (l) { return l.startsWith('readyok'); }, 15000); })();
  SF = {
    evaluate: async function (fen, ms) {
      await ready;
      lines = [];
      sf.postMessage('position fen ' + fen);
      sf.postMessage('go movetime ' + ms);
      const bm = await until(function (l) { return l.startsWith('bestmove'); }, ms + 15000);
      let cp = 0;
      for (let i = lines.length - 1; i >= 0; i--) {
        const c = /score cp (-?\d+)/.exec(lines[i]);
        if (c) { cp = Math.max(-1500, Math.min(1500, +c[1])); break; }
        const mt = /score mate (-?\d+)/.exec(lines[i]);
        if (mt) { cp = +mt[1] > 0 ? 1500 : -1500; break; }
      }
      const best = bm.split(/\s+/)[1];
      return { cp: cp, best: best && best !== '(none)' ? best : null };
    },
    quit: function () { try { sf.postMessage('quit'); } catch (e) {} }
  };
  return SF;
}

/* ⭐ A FEW HOLES ARE PATCHED, NOT A REASON TO THROW THE BROADCAST AWAY. Three of the 2024 match's
   fourteen games were missing 1–9 evals. Only those positions are searched here, and the moves
   that touch a patched position lose their mark (the grade rests on our shallower eval); every
   other move keeps the broadcast's. With most evals missing, the whole game is ours and unmarked. */
async function gradeWithEngine(game, ms, onStep) {
  if (game.graded_by) return game;
  const L = game.moves._line;
  const have = [START_CP].concat(game.moves.map(function (m) { return m.eval; }));
  const gaps = have.map(function (e, i) { return e === null ? i : -1; }).filter(function (i) { return i >= 0; });
  const patch = gaps.length <= Math.max(3, Math.floor(have.length * 0.15));
  const todo = patch ? gaps : have.map(function (_, i) { return i; });
  const evW = have.slice(), bests = new Array(have.length).fill(null), sf = engine();
  {
    for (let k = 0; k < todo.length; k++) {
      const i = todo[k], S = C.parseFEN(L.fens[i]);
      if (!C.legalMoves(S).length) {                 // mate or stalemate: nothing to search
        evW[i] = C.inCheck(S, S.turn) ? (S.turn === 'w' ? -1500 : 1500) : 0;
        continue;
      }
      const r = await sf.evaluate(L.fens[i], ms);
      evW[i] = S.turn === 'w' ? r.cp : -r.cp;
      if (!patch) bests[i] = r.best;
      if (onStep) onStep(k + 1, todo.length);
    }
  }
  if (!patch) return applyGrade(game, evW, bests, 'stockfish ' + ms + 'ms');
  applyGrade(game, evW, null, 'broadcast evals, ' + gaps.length + ' filled locally');
  gaps.forEach(function (g) {
    [g - 1, g].forEach(function (i) { if (game.moves[i]) { game.moves[i].cls = null; game.moves[i].swing = null; } });
  });
  game.marks = true;
  return game;
}

/* ── CLI ──────────────────────────────────────────────────────────────────────────────── */
function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === '--help' || args[0] === '-h') {
    console.log('usage: node tests/gen-godot-game.js <game.pgn|-> [--out <file.json>]');
    process.exit(args.length ? 0 : 1);
  }

  const src = args[0];
  const outIdx = args.indexOf('--out');
  const out = outIdx >= 0 ? args[outIdx + 1]
    : path.join(__dirname, '..', 'private', 'docs', 'godot', 'tournament_board', 'data', 'game.json');

  const pgn = src === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(src, 'utf8');

  let game;
  try { game = convert(pgn); }
  catch (e) { console.error('FAILED — ' + e.message); process.exit(1); }

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(game, null, 1), 'utf8');

  const last = game.moves[game.moves.length - 1];
  console.log('=== PGN → GODOT ===');
  console.log('  ' + game.white + ' vs ' + game.black + (game.event ? '  —  ' + game.event : ''));
  console.log('  ' + game.moves.length + ' plies, result ' + game.result +
              (last && last.mate ? '  (ends in mate: ' + last.san + ')' : ''));
  console.log('  wrote ' + path.relative(path.join(__dirname, '..'), out).replace(/\\/g, '/') +
              '  (' + fs.statSync(out).size + ' bytes)');
  console.log('RESULT: PASS — every move resolved against the shipped generator');
}

if (require.main === module) main();
module.exports = { convert: convert, readPGN: readPGN, gradeWithEngine: gradeWithEngine,
  shortName: shortName, clockOf: clockOf, evalOf: evalOf };
