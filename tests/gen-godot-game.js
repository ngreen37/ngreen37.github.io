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
  body = body.replace(/\{[^}]*\}/g, ' ');   // { comments }
  body = body.replace(/;[^\n]*/g, ' ');     // ; rest-of-line comments
  body = stripVariations(body);
  body = body.replace(/\$\d+/g, ' ');       // NAGs
  body = body.replace(/\d+\s*\.(\.\.)?/g, ' ');
  body = body.replace(/[?!]+/g, '');        // !? annotations — not part of the move

  const tokens = body.split(/\s+/).filter(Boolean).filter(function (t) {
    return !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t);
  });
  return { tags: tags, tokens: tokens };
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

  const moves = [];
  parsed.tokens.forEach(function (token, i) {
    let mv;
    try { mv = resolve(state, token); }
    catch (e) { throw new Error('ply ' + (i + 1) + ' (' + token + '): ' + e.message); }
    moves.push(describe(state, mv, i + 1));
    state = C.makeMove(state, mv);
  });

  return {
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
    moves:  moves
  };
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
module.exports = { convert: convert, readPGN: readPGN };
