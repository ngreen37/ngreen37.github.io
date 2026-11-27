#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   godotgame.check.js  —  npm run test:godotgame  (also runs inside `npm test`)

   Guards `gen-godot-game.js`, the PGN → Godot converter.

   ⚑ WHY A GATE FOR A TOOL NOBODY VISITS. The converter is a THIN SHELL over
   `pjcc-chess.js` — it calls legalMoves, toSAN, makeMove, inCheck, isCheckmate, parseFEN,
   nameFromSq, colorOf and toFEN, and does no chess of its own. That is exactly why it is
   worth checking: rename any one of those exports and the tool dies, silently, until the
   next time it is reached for — which by design is the evening a big game finishes and
   there are about six hours of anybody caring. A gate here costs 80ms and buys the tool
   being there when it is wanted.

   The three cases below are the three the renderer cannot survive getting wrong, and none
   of them is caught by "does the position come out right" — the position is right in all
   three. Only the PICTURE is wrong:

     · CASTLING   two pieces move on one move. Miss the rook and it stands in the corner.
     · EN PASSANT the pawn that dies is NOT on the square the capturer lands on. Assume it
                  is and a ghost pawn sits there for the rest of the game.
     · PROMOTION  the piece that arrives is not the piece that left.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const { convert } = require('./gen-godot-game.js');

let pass = 0, fail = 0;
function ok(cond, what) {
  if (cond) { pass++; return; }
  fail++;
  console.log('  ✗ ' + what);
}
function eq(got, want, what) {
  ok(got === want, what + '   expected ' + JSON.stringify(want) + ', got ' + JSON.stringify(got));
}

console.log('=== PGN → GODOT — the three the picture cannot survive ===');

// ── a whole real game, ending in mate ────────────────────────────────────────────────
const OPERA = [
  '[Event "Paris Opera"] [White "Paul Morphy"] [Black "Duke and Count"] [Result "1-0"]',
  '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7',
  '8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7',
  '14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0'
].join('\n');

const g = convert(OPERA);
eq(g.moves.length, 33, 'the Opera Game is 33 plies');
eq(g.white, 'Paul Morphy', 'the White tag survives');
eq(g.start_pieces.length, 32, 'the opening position ships as 32 squares, not a FEN to parse');
ok(g.moves[32].mate === true, 'the last move is flagged as mate');
eq(g.moves[32].san, 'Rd8#', 'and it is Rd8#');
ok(g.moves[20].check === true, '11.Bxb5+ is flagged as check');

// ── CASTLING: the rook has to come along ─────────────────────────────────────────────
const castle = g.moves[22];                                   // 12.O-O-O
eq(castle.san, 'O-O-O', 'ply 23 is the long castle');
eq(castle.from + castle.to, 'e1c1', 'the king goes e1 → c1');
ok(castle.rook !== null, 'the castle carries a rook run');
eq(castle.rook.from + castle.rook.to, 'a1d1', 'and the rook goes a1 → d1');

// ── EN PASSANT: the victim is not on the destination square ──────────────────────────
const ep = convert('[White "a"] [Black "b"]\n1. e4 Nf6 2. e5 d5 3. exd6 e5 4. dxc7 Qd7 5. cxb8=Q Rxb8 *');
const took = ep.moves[4];                                     // 3.exd6, en passant
eq(took.san, 'exd6', 'ply 5 is the en passant');
eq(took.to, 'd6', 'the capturer lands on d6');
ok(took.capture !== null, 'and it is a capture');
eq(took.capture.sq, 'd5', '⚠ THE PAWN THAT DIES IS ON d5, NOT d6 — the whole reason capture.sq exists');
eq(took.capture.piece, 'p', 'and the thing that died is a black pawn');

// ── PROMOTION: the piece that arrives is not the piece that left ─────────────────────
const promo = ep.moves[8];                                    // 5.cxb8=Q
eq(promo.san, 'cxb8=Q', 'ply 9 is the promotion');
eq(promo.piece, 'P', 'a pawn left c7');
eq(promo.promo, 'Q', 'a queen arrives on b8');
eq(promo.capture.piece, 'n', 'taking the knight on the way');

// ── a bad token fails LOUDLY rather than drawing a wrong board ───────────────────────
let threw = '';
try { convert('[White "a"]\n1. e4 e5 2. Qxf7# *'); }
catch (e) { threw = e.message; }
ok(threw.indexOf('ply 3') >= 0, 'an illegal move names the ply it died on');
ok(threw.indexOf('Qxf7') >= 0, 'and names the token');

// ── commentary is stripped, moves are not ────────────────────────────────────────────
const messy = convert('[White "a"]\n1. e4 {a fine move} e5 $1 2. Nf3! (2. f4 exf4) 2... Nc6?! *');
eq(messy.moves.length, 4, 'comments, NAGs, the whole variation and !? are stripped; four real plies remain');
eq(messy.moves[3].san, 'Nc6', 'and the annotation comes off the move');

/* ══ THE WORLD CHAMPIONSHIP BROADCAST (2026-09-21) ═════════════════════════════════════
   His ten Tournament Board picks, against the real 2024 match (tests/fixtures/wc2024.pgn, the
   Lichess broadcast export: clocks and evals on every move). Offline, so it runs in npm test. */
const fs = require('fs');
const path = require('path');
const G = require('./gen-godot-game.js');
const W = require('./gen-broadcast.js');
const WC = W.splitGames(fs.readFileSync(path.join(__dirname, 'fixtures', 'wc2024.pgn'), 'utf8'));
const g1 = G.convert(WC[0]);
eq(WC.length, 14, 'the 2024 fixture holds all fourteen games');
eq(g1.moves[0].clock, 7196, '[%clk 1:59:56] after 1.e4 survives the converter as 7196 seconds');
const qe2 = g1.moves.find((m) => m.move === 17 && m.side === 'w');
ok(qe2 && qe2.spent > 33 * 60 && qe2.spent < 35 * 60, '…and 17.Qe2 took Gukesh 34 minutes — a true fact for the desk');
eq(g1.moves[0].eval, 18, '[%eval 0.18] survives as 18 centipawns for White');
eq(g1.graded_by, 'broadcast evals', 'a game with every eval is graded off the broadcast');
eq(g1.marks, true, '…and may carry marks');
eq([G.shortName('Ding, Liren'), G.shortName('Gukesh D'), G.shortName('Javokhir Sindarov'), G.shortName('Sindarov, Javokhir')].join(' '),
  'Ding Gukesh Sindarov Sindarov', 'short names for a caption');

/* ⭐⭐ THE GRADES ARE THE SITE'S OWN, AND THEY AGREE WITH LICHESS. Lichess writes its verdict into
   the PGN ("Inaccuracy. Rfe1 was best."); on every fully-evaluated game ours must match it —
   "Checkmate is now unavoidable" is Lichess's word for a blunder. */
const verdict = (note) => {
  if (/Checkmate is now unavoidable|Lost forced checkmate/.test(note)) return 'blunder';
  const m = /(Inaccuracy|Mistake|Blunder)\./.exec(note || '');
  return m ? m[1].toLowerCase() : null;
};
let agree = 0, flagged = 0;
const off = [];
WC.forEach((pgn, gi) => {
  const g = G.convert(pgn);
  if (g.graded_by !== 'broadcast evals') return;
  const p = G.readPGN(pgn);
  g.moves.forEach((m, i) => {
    const theirs = verdict(p.notes[i]);
    const ours = ['inaccuracy', 'mistake', 'blunder'].indexOf(m.cls) >= 0 ? m.cls : null;
    if (!theirs && !ours) return;
    flagged++;
    if (theirs === ours) agree++; else off.push('g' + (gi + 1) + ' ' + m.move + '.' + m.san + ' ' + theirs + '/' + ours);
  });
});
ok(flagged >= 25 && agree / flagged >= 0.95,
  'our grade matches Lichess on ' + agree + ' of ' + flagged + ' flagged moves   (' + off.join(', ') + ')');
const src = fs.readFileSync(path.join(__dirname, 'gen-godot-game.js'), 'utf8');
ok(/review\(\)\.grade\(/.test(src) && /function grade\(fens, moves, evals, bests\)/.test(
  fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'pjcc-game-review.js'), 'utf8')),
  'the grading IS the review\'s grade(), not a copy of it');
ok(/game\.marks = by === 'broadcast evals'/.test(src),
  '⚠⚠ a game graded only by our engine carries NO marks — measured: SF10 misgraded 2024 Game 1 at 3s a move');

/* the score comes off the games themselves */
const b3 = W.scoreBefore(WC, 3);
eq(b3['Gukesh D'] + '-' + b3['Ding, Liren'], '0.5-1.5', 'the score before Game 3 is summed from Games 1 and 2');
eq(W.tag(W.pick(WC, null), 'Round'), '14', 'with no game named, the latest finished one');
/* ⚠ 2026'S BROADCAST TAGS ITS ROUNDS "1.1", "2.1" (round.board): the same games, as that feed writes them */
{
  const WC26 = WC.map((g) => g.replace(/\[Round "(\d+)"\]/, '[Round "$1.1"]'));
  const b26 = W.scoreBefore(WC26, 3);
  eq([W.gameNo(WC26[0]), W.tag(W.pick(WC26, 7), 'Round'), W.tag(W.pick(WC26, null), 'Round'), b26['Gukesh D'] + '-' + b26['Ding, Liren']].join(' '),
    '1 7.1 14.1 0.5-1.5', '⚠ a round tagged "7.1" is Game 7: --game 7 finds it, the latest is 14, the score before Game 3 is the same');
  /* ⚠ …AND WRITES ITS TIME CONTROL FOR PEOPLE. 2024 Game 1 runs past move 40, so the bonus and the increment are both in it. */
  const a = G.convert(WC[0].replace(/\[TimeControl "[^"]*"\]/, '[TimeControl "120\'/40m + 30\'/end, 30/move from move 41"]'));
  const b = G.convert(WC[0]);
  eq(a.time_control + ' ' + a.moves.map((m) => m.spent).join(','), b.time_control + ' ' + b.moves.map((m) => m.spent).join(','),
    '⚠ 2026\'s "120\'/40m + 30\'/end, 30/move from move 41" is 2024\'s 40/7200:1800+30: clocks open at two hours, every move\'s time the same');
}
const bsrc = fs.readFileSync(path.join(__dirname, 'gen-broadcast.js'), 'utf8');
ok(/title: match\.title \|\| 'The World Championship'/.test(bsrc) && !/title:[^\n]*game\.event/.test(bsrc),
  '⚠ the card never prints the PGN\'s Event, which carries the sponsor\'s name');
/* ⭐ his 11-26: "the eval bar jumps way too much … This game was dead even the whole time" */
{
  const gsrc = fs.readFileSync(path.join(__dirname, 'gen-godot-game.js'), 'utf8').replace(/\r\n/g, '\n');
  const zz = G.smoothLocal([20, 100, 20, 100, 20, 100]), bl = G.smoothLocal([20, 25, 30, -400, -410, -420]);
  ok(zz.slice(1).every((v) => v === 60) && bl[3] < -150 && bl[4] <= -400 && G.smoothLocal([20, 300, 1500])[2] === 1500
     && /if \(!patch\) return applyGrade\(game, smoothLocal\(evW, L\.fens\), bests, 'stockfish '/.test(gsrc)
     && /return applyGrade\(game, evW, null, 'broadcast evals'\);/.test(gsrc)
     && /if \(\/\\b\(lower\|upper\)bound\\b\/\.test\(lines\[i\]\)\) continue;/.test(gsrc),
    '⭐ a local search\'s move-by-move zigzag is averaged out of the eval bar (Game 3: 287 win% points of travel to Lichess\'s 43); '
    + 'a blunder still lands, a mate stays a mate, a search\'s provisional bound is never read as its score, and Lichess\'s evals are never touched');
}

/* ⭐ HIS OWN LINES (desk.txt beside the voice file, his 11-25): each lands on the move it names, or nothing renders */
{
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'desk-'));
  const w9 = g1.moves.find((m) => m.move === 9 && m.side === 'w'), b9 = g1.moves.find((m) => m.move === 9 && m.side === 'b');
  const write = (s) => fs.writeFileSync(path.join(dir, 'desk.txt'), s);
  const tryDesk = () => { try { return W.deskIn(dir, g1, () => {}); } catch (e) { return { error: e.message }; } };
  eq(JSON.stringify(tryDesk()), '{}', 'no desk.txt, no lines of his');
  write('# a note\nnew: Garrett: New on our board.\n9. ' + w9.san + ': A question?\n9...' + b9.san + ': jacob: An answer.\n');
  eq(JSON.stringify(tryDesk()), JSON.stringify({ lines: [{ ply: 17, text: 'A question?' },
    { ply: 18, who: 'Jacob', text: 'An answer.' }], new: { text: 'New on our board.', who: 'Garrett' } }),
    '⭐ his lines land on the moves they name ("9." is ply 17, "9..." ply 18); "new:" is what changed on our board; '
    + 'a commentator\'s name after the colon says who speaks (his 11-26)');
  write('9. ' + g1.moves[0].san + ': on a move the game did not play\n');
  ok(/would land wrong/.test(tryDesk().error || ''), '⚠⚠ a line naming a move the game did not play stops the render: one ply off, it questions the wrong player');
  write('9. ' + w9.san + ': [BREAKING] a box from before the commentators\n');
  ok(/the \[BOX\]es are gone/.test(tryDesk().error || ''), '…and so does a leftover [BOX]: the boxes went with the ticker, and on screen it would be words');
  /* ⭐ his own lights (11-26: "highlight the stuck rook at move 19, and then unhighlight it after move 21. c3") */
  write('light A2 from 9. ' + w9.san + ' to 9... ' + b9.san + '\n');
  eq(JSON.stringify(tryDesk().lights), JSON.stringify([{ sq: 'a2', from: 17, to: 18 }]),
    '⭐ "light a2 from 9. … to 9... …" lights a square from one of the game\'s moves to another');
  write('light a2 from 9... ' + b9.san + ' to 9. ' + w9.san + '\n');
  ok(/would land wrong/.test(tryDesk().error || ''), '…a light that would end before it starts stops the render');
  write('light a2 from 9. ' + g1.moves[0].san + ' to 9... ' + b9.san + '\n');
  ok(/would land wrong/.test(tryDesk().error || ''), '…and so does one naming a move the game did not play');
  /* ⭐ his 11-26 after Game 3: a closing commentary, the board shaking on his cue, slow motion on his cue */
  write('shake from 9. ' + w9.san + ' to 9... ' + b9.san + '\nslow 9... ' + b9.san + '\nend: Garrett: That is a wrap.\nend: See you next game.\n');
  const cues = tryDesk();
  eq(JSON.stringify([cues.shakes, cues.slows, cues.end]), JSON.stringify([[{ from: 17, to: 18 }], [{ from: 18, to: 18 }],
    [{ who: 'Garrett', text: 'That is a wrap.' }, { text: 'See you next game.' }]]),
    '⭐ "shake …" and "slow …" take a stretch or one move; "end:" lines close the video in order, a commentator named or not');
  write('shake around move 9\n');
  ok(/would land wrong/.test(tryDesk().error || ''), '…and a cue without its moves stops the render');
  fs.rmSync(dir, { recursive: true, force: true });
}

/* the board side — read out of the mirror, which is what a rebuild restores */
const TB = path.join(__dirname, '..', 'private', 'docs', 'godot', 'tournament_board');
if (fs.existsSync(path.join(TB, 'booth.gd'))) {
  const booth = fs.readFileSync(path.join(TB, 'booth.gd'), 'utf8');
  const cast = fs.readFileSync(path.join(TB, 'broadcast.gd'), 'utf8');
  const seat = fs.readFileSync(path.join(TB, 'seat_model.gd'), 'utf8');
  const main = fs.readFileSync(path.join(TB, 'main.gd'), 'utf8');
  const lines = /const LINES := \{([\s\S]*?)\n\}/.exec(booth);
  const slots = lines ? [...lines[1].matchAll(/\{([a-z]+)\}/g)].map((m) => m[1]) : [];
  const allowed = ['w', 'o', 'san', 'min', 'clock', 'n', 'moves', 'sq', 'time'];
  ok(lines && slots.every((s) => allowed.indexOf(s) >= 0),
    '⚠⚠ the desk\'s templates have slots for facts only — no slot a state of mind could go in',
    slots.filter((s) => allowed.indexOf(s) < 0).join(' '));
  ok(lines && !/nerv|rattl|panic|feel|confiden|upset|angry|tired|pressure|scared|shak|emotion|stress/i.test(lines[1]),
    '⚠⚠ …and no line says how a real player FELT');

  /* ══ his Game 2 notes, 2026-11-25 ══ the mechanism, never the wording */
  const boothN = booth.replace(/\r\n/g, '\n'), castN0 = cast.replace(/\r\n/g, '\n'), mainN0 = main.replace(/\r\n/g, '\n');
  const guardAt = boothN.indexOf('\tif ply >= moves.size() - 1:\n\t\treturn {}');
  ok(guardAt > 0 && boothN.indexOf('_say("draw" + tail') < guardAt && boothN.indexOf('_say("castle"') < guardAt
     && guardAt < boothN.indexOf('_say("pace"') && guardAt < boothN.indexOf('_say("quiet"'),
    '⚠ nothing optional on the move before the last: Game 2\'s 20.Bg3 line was up 1.4 s before the result replaced it',
    'the result and the news still speak there');
  const sayCalls = boothN.match(/_say\(/g) || [], toldCalls = boothN.match(/return _say\([^()]+, f, told\)/g) || [];
  ok(/for i in range\(1, row\.size\(\)\):\n\t\tvar t: String = row\[i\]\n\t\tif told\.has\("t:" \+ t\):\n\t\t\tcontinue\n\t\ttold\["t:" \+ t\] = true/.test(boothN)
     && /for t in game\.get\("said_before", \[\]\):\n\t\ttold\["t:" \+ str\(t\)\] = true/.test(boothN)
     && toldCalls.length === sayCalls.length - 1,
    '⭐ no wording twice in the match (his 11-25, "let\'s not repeat lines from game 1"): the first wording no earlier video and no earlier line said, else silence');
  ok(/_game\["said_before"\] = _said_before\(\)\n\tcast\.load_game\(_game\)/.test(mainN0)
     && /var wiped := _clear_frames\(dir\)\n\t_record_said\(\)/.test(mainN0) && /all\[str\(n\)\] = used/.test(mainN0),
    '…the ledger (data/said.json) is read before a game is planned and written only by a recording, one entry per game');
  ok(/var limit := base \* n \/ 120/.test(boothN) && /took >= 0 and took < _base\(game\)/.test(boothN)
     && /var m := s \/ 60 \+ 1/.test(boothN) && /var h := s \/ 3600 \+ 1/.test(boothN),
    '⚠ "playing fast" and a quick game are measured against the time control, and "in under …" rounds UP',
    'by moves alone, 2024\'s Game 11 was "29 moves in under 4 hours"; 5 min 32 s is "under 6 minutes"');
  ok(/_text\(f, "MATCH SCORE"/.test(castN0) && /roll = clampf\(\(_card_t - MORPH_AT\) \/ MORPH_SECS, 0\.0, 1\.0\)/.test(castN0)
     && /\t_card_t \+= dt\n/.test(castN0) && /_card = kind\n\t_card_t = 0\.0/.test(castN0),
    '⭐ both cards say MATCH SCORE, and the end card rolls the old score into the new on the recorder\'s clock');
  ok(/static func schedule\(game: Dictionary\) -> Dictionary:/.test(boothN) && /_desk = Booth\.schedule\(g\)/.test(castN0)
     && /var said: Dictionary = _desk\.get\(ply, \{\}\)/.test(castN0) && /var said: Dictionary = _desk\.get\(0, \{\}\)/.test(castN0)
     && !/Booth\.observe\(/.test(castN0),
    '⭐ the desk plans the whole game before the first move (his lines, what is new, its own) and the ticker plays the plan');
  ok(/var need := Broadcast\.read_secs\(/.test(mainN0) && /if b >= 2 and gap < need:\n\t\t\t_holds\[b - 2\] \+= need - gap/.test(mainN0)
     && /clampf\(0\.6 \+ 0\.3 \* float\(text\.split\(" ", false\)\.size\(\)\), 2\.0, LINE_SECS\)/.test(castN0),
    '⭐ every line is read before the next replaces it: the board waits (his Game 2 lines sat one move apart)');
  ok(/if said\.size\(\) >= 2 and int\(said\[0\]\) == 0 and int\(said\[1\]\) == 1:\n\t\t_open_hold = maxf\(0\.0, Broadcast\.read_secs\(/.test(mainN0)
     && /if _ply == 0 and not _opened:\n\t\t_opened = true\n\t\tcast\.hide_card\(\)\n\t\tcast\.open_desk\(\)\n\t\tif _open_hold > 0\.0:\n\t\t\t_wait = _open_hold\n\t\t\treturn/.test(mainN0),
    '⚠ …the opening line too: with a line on move 1 it waits on the start position (Game 3\'s "Welcome back" was up 0.2 s)');
  ok(/func _unhandled_input\(event: InputEvent\) -> void:\n(?:\t#[^\n]*\n)*\tif _capturing:\n\t\treturn\n/.test(mainN0),
    '⚠ a recording takes no keys: its window comes up on his screen, and a stray End cut Game 3\'s vertical preview 23 s short');
  ok(/elif r != "1\/2-1\/2":\n\t\t\thead = "GAME %d CONTINUES"/.test(castN0),
    '…and a preview of a game still being played ends "GAME 3 CONTINUES", never "DRAWN"');
  /* ══ his 11-26 ══ two commentators, talking to each other, above the board */
  const fnGd = (src, name) => { const i = src.indexOf('\nfunc ' + name + '('); if (i < 0) return ''; const j = src.indexOf('\nfunc ', i + 1); return src.slice(i, j < 0 ? undefined : j); };
  const voices = ((/const VOICES := \[([^\]]*)\]/.exec(boothN) || [])[1] || '').split(',').map((v) => v.trim().replace(/"/g, '')).filter(Boolean);
  ok(voices.length === 2 && voices.join() === W.VOICES.join()
     && voices.every((v) => new RegExp('"' + v.toLowerCase() + '": Color\\("[0-9a-f]{6}"\\)').test(castN0))
     && /\t_voice\(out\)\n\treturn out\n/.test(boothN)
     && /if not who in VOICES:\n\t\t\twho = VOICES\[\(VOICES\.find\(last\) \+ 1\) % VOICES\.size\(\)\]\n\t\ts\["who"\] = who\n\t\tlast = who/.test(boothN),
    '⭐ his two commentators (' + voices.join(', ') + '), each in his own color, the clip machine\'s list the desk\'s: '
    + 'a line naming nobody goes to whoever did not speak last, so they talk to each other');
  ok(/\t_talk\(f, talk_rect\(vp\)\)\n/.test(castN0) && /var y := board_rect\.position\.y - _talk_room\(\)/.test(castN0)
     && !/_line/.test(fnGd(castN0, '_ticker')) && /_who = str\(said\.get\("who", ""\)\)/.test(castN0)
     && ['square', 'vertical', 'wide'].every((l) => new RegExp('"' + l + '": \\[[\\d.]+, \\d+\\]').test((/const TALK := \{[^}]*\}/.exec(castN0) || [''])[0]))
     && /"top": 30\.0 \* _k \+ talk/.test(castN0) && /"top": 126\.0 \* _k \+ talk/.test(castN0)
     && /board_rect\.position\.y - 130\.0 \* _k - _talk_room\(\)/.test(castN0),
    '⭐ the commentary is said right above the board in every cut, the board giving way (his 11-26: "move the commentary from the bottom of the screen")');
  ok(/if most > 1 and f\.get_string_size\(s, HORIZONTAL_ALIGNMENT_LEFT, -1, fs\)\.x > room:/.test(castN0)
     && /if m < worst:\n\t\t\t\tworst = m\n\t\t\t\trows = \[a, b\]/.test(castN0)
     && /1 if layout == "wide" else 2/.test(castN0),
    '⚠ a long line wraps to two rows at the word that evens them before it shrinks (his Game 3 opener is 94 characters)');
  ok(/var graded := bool\(game\.get\("marks", false\)\)/.test(booth)
    && /MARK\.has\(cls\) and bool\(game\.get\("marks", false\)\)/.test(cast),
    'the desk and the board both stay quiet about grades the broadcast did not give');
  ok(/ANIMATION_CALLBACK_MODE_PROCESS_MANUAL/.test(seat) && /func advance\(dt: float\)/.test(seat),
    'a character animates on the recorder\'s clock, not the engine\'s');
  ok(/--capture/.test(main) && /_thumbnail\(/.test(main) && /target_seconds/.test(main),
    'the board records from the command line, saves the biggest swing, and fits the clip to a length');

  /* ══ the clock, and the hand that presses it — 2026-10-10 ══ */
  /* his: "Pieces, board, players, clock.  It might be cool if the player hits the clock at the correct time." */
  const lf = (f) => (fs.existsSync(path.join(TB, f)) ? fs.readFileSync(path.join(TB, f), 'utf8').replace(/\r\n/g, '\n') : '');
  const clk = lf('game_clock.gd'), castN = lf('broadcast.gd'), seatN = lf('seat_model.gd'), mainN = lf('main.gd'), bview = lf('board_view.gd');
  const numG = (src, n) => { const m = new RegExp('const ' + n + ' := (-?[\\d.]+)').exec(src); return m ? +m[1] : NaN; };
  const lag = numG(clk, 'PRESS_LAG'), minHold = numG(clk, 'MIN_HOLD'), pressAt = numG(seatN, 'PRESS_AT');
  ok(clk !== '' && /^class_name GameClock\s*\nextends RefCounted$/m.test(clk) && /func advance\(dt: float\) -> String:/.test(clk)
     && !/Time\.get_ticks|create_tween|create_timer/.test(clk),
    '⭐ there is a chess clock beside the board, and it runs on the recorder\'s clock like everything else on the stage');
  ok(/board\.begin_move\(_moves\[_ply\], _slide_of\(_ply\)\)\n\tcast\.cue_press\(str\(\(_moves\[_ply\] as Dictionary\)\.get\("side", "w"\)\), _slide_of\(_ply\)\)/.test(mainN)
     && /var hit_in := slide_secs \+ GameClock\.PRESS_LAG\s*\n\s*clock\.cue\(side, hit_in\)/.test(castN)
     && /seat\.cue_press\(hit_in\)/.test(castN) && lag > 0 && lag <= 0.3,
    '⭐ the mover\'s hand lands on the clock ' + lag + 's after the piece does, cued as the piece starts to slide',
    'so a Press clip can begin early enough to arrive on time');
  ok(/_cue_in = maxf\(0\.0, hit_in - _anim\.get_animation\(a\)\.length \* PRESS_AT\)/.test(seatN) && pressAt > 0 && pressAt < 1
     && /_anim\.play\(_clip, 0\.0\)/.test(seatN),
    '…and a player\'s "Press" clip starts so that its ' + (pressAt * 100) + '% frame IS that instant',
    'no blend in: a cross-fade lands the hand late');
  ok(/var hit := clock\.advance\(dt\)\s*\n\s*if hit != "" and not _ended:\s*\n\s*_to_move = GameClock\.other\(hit\)/.test(castN)
     && !/_to_move = "b" if side == "w" else "w"/.test(castN),
    '⚠ the turn changes when the clock is pressed, not when the piece lands');
  ok(minHold >= lag + 0.02 && /var least: float = GameClock\.MIN_HOLD if cast\.clock\.on else 0\.12/.test(mainN)
     && /if _cue_side != "":\s*\n\s*running = GameClock\.other\(_cue_side\)/.test(clk),
    '⚠⚠ no press is ever lost: a move is held until the hand has landed, and one still in the air lands before the next is cued',
    'a hold of ' + minHold + 's against a lag of ' + lag + 's');
  ok(/clock\.set_time\(side, int\(_clock\[side\]\)\)/.test(castN)
     && /float\(_clock\[them\]\) - float\(\(moves\[ply\] as Dictionary\)\["spent"\]\)/.test(castN)
     && /if secs > 0\.0 and to >= 0\.0 and to < float\(_now\[side\]\) else 0\.0/.test(clk),
    '⚠⚠ every time the clock rests on is the broadcast\'s own; between two it counts down the seconds really spent, and only down',
    'a time control that adds time shows the new figure when the move lands, never a clock running backwards');
  ok(/func _has_times\(\) -> bool:/.test(castN) && /clock\.reset\(start, _has_times\(\)\)/.test(castN)
     && /if not clock\.on:\s*\n\s*return/.test(castN) && /if clock\.on:\s*\n\s*clock\.paint\(/.test(castN),
    '…and a game with no clock times has no clock: nothing drawn, nobody pressing');
  ok(/if clip in LOOPS:\s*\n\s*_rest = clip[\s\S]{0,220}?if _pressing:\s*\n\s*return/.test(seatN)
     && /_pressing = false\s*\n\s*play\(_rest\)/.test(seatN),
    '…a press is not cut short by the Think that follows it, and gives way to it once the hand is back');
  ok(/@export_file\("\*\.png"\) var board_art: String = "res:\/\/board\/board\.png"/.test(bview)
     && /if wood != null:[\s\S]*?if flipped:\s*\n\s*draw_set_transform\(Vector2\(side, side\), PI\)/.test(bview)
     && /\telse:\s*\n[^\n]*\n\s*for r in 8:/.test(bview),
    '⭐ his Blender board is one file dropped in (board/board.png); until then the squares are drawn',
    'turned with the board when it flips');
  /* ⭐ his 11-26: "for round 4, when we mention a specific piece, let's highlight it on the board ... we won't unveil it yet" */
  const boothL = lf('booth.gd');
  ok(/static func named\(text: String, at: Dictionary, wn: String, bn: String\) -> Array:/.test(boothL)
     && /RegEx\.create_from_string\("\\\\b\[KQRBN\]\?x\?\(\[a-h\]\[1-8\]\)\\\\b"\)/.test(boothL)
     && /if at\.has\(sq\) and not sq in out:/.test(boothL) && /if hits\.size\(\) == 1 and not hits\[0\] in out:/.test(boothL)
     && /\tif bool\(_game\.get\("point", false\)\):\n\t\tvar s: Array = cast\.saying\(\)/.test(mainN)
     && /\tboard\.fade\(delta, _flash_secs\)\n\t_light\(\)\n/.test(mainN)
     && /for sq in Booth\.named\(str\(s\[1\]\), now, /.test(mainN)
     && /if str\(now\.get\(sq, ""\)\) == str\(_lit\[sq\]\) and not lit\.has\(sq\):\n\t\t\t\t\tlit\[sq\] = c\n\tboard\.light\(lit\)/.test(mainN)
     && /for sq in _lit:\n\t\tvar lc: Color = _lit\[sq\]\n[^\n]*\n\t\tdraw_rect\(r, Color\(lc, lc\.a \* 0\.35\)\)/.test(bview)
     && /^const POINT_FROM = 3;$/m.test(bsrc) && /game\.point = !!\(o\.point \|\| m\.game >= POINT_FROM\);/.test(bsrc)
     && /else if \(a\[i\] === '--point'\) o\.point = true;/.test(bsrc),
    '⭐ from Round 3 the piece a line names is lit on the board in its speaker\'s color — a square with a piece on it, '
    + 'or a player\'s only king or queen; dark again once that piece moves or is taken; --point shows it early (his 11-26: '
    + 'first "for round 4", then "use the highlighted piece for the final version of round three")');
  ok(/for sp in _spans:\n\t\tif _ply >= int\(sp\["from"\]\) and _ply <= int\(sp\["to"\]\) and now\.has\(str\(sp\["sq"\]\)\):/.test(mainN)
     && /if not _held\(str\(sq\), int\(s\[0\]\)\):/.test(mainN) && /\t_plan\(\)\n\t_plan_lights\(\)\n/.test(mainN)
     && /if int\(p\) >= int\(l\["from"\]\) and int\(p\) <= int\(l\["to"\]\) and names\.search\(str\(said\["text"\]\)\) != null:/.test(mainN),
    '⭐ his own lights hold for their moves and govern their square: Game 3\'s stuck rook lit from 19. f3, dark after 21. c3 '
    + 'though the line about it is still up, in the color of whoever names it (his 11-26)');
  /* ⭐ his 11-26 after Game 3 */
  ok(/out\[after\] = \{ "tag": "", "text": str\(l\["text"\]\), "kind": "end", "who": str\(l\.get\("who", ""\)\) \}\n/.test(boothL)
     && boothL.indexOf('"kind": "end"') > 0 && boothL.indexOf('"kind": "end"') < boothL.indexOf('\t_voice(out)\n\treturn out')
     && /if _closing < _ends\.size\(\):\n\t\t\tcast\.say\(int\(_ends\[_closing\]\)\)\n\t\t\t_wait = Broadcast\.read_secs\(/.test(mainN)
     && mainN.indexOf('cast.say(int(_ends[_closing]))') < mainN.indexOf('cast.show_card("end")'),
    '⭐ his closing lines are said after the last move, each held to be read, before the end card ("let\'s add a closing commentary")');
  ok(/\t_light\(\)\n\t_shake\(delta\)\n/.test(mainN) && /^const SHAKE_PX := 3\.0 /m.test(mainN)
     && /for sp in _shakes:\n\t\tif _ply >= int\(sp\["from"\]\) and _ply <= int\(sp\["to"\]\):/.test(mainN)
     && /_shake_amp = move_toward\(_shake_amp, 1\.0 if on else 0\.0, delta \* 4\.0\)/.test(mainN) && /\t_home = board\.position\n/.test(mainN),
    '⭐ the board shakes a little when his desk.txt says so, eased in and out, and settles back where it stood (Sindarov\'s foot)');
  ok(/if marks and cls in \["blunder", "mistake"\]:\n\t\treturn true/.test(mainN) && /if _first_under\(i, 300\) or _first_under\(i, 60\):/.test(mainN)
     && /if marks and i \+ 1 == int\(_game\.get\("swing_ply", -1\)\):/.test(mainN) && /for sp in _slows:/.test(mainN)
     && /_slides\.append\(_move_secs \* \(SLOW_SLIDE if slow else 1\.0\)\)/.test(mainN) && /^const SLOW_SLIDE := 3\.0 /m.test(mainN),
    '⭐ critical moments play in slow motion and hold: graded blunders and mistakes, the punishment, the biggest swing, a clock first under 5 minutes and 1, and his "slow"');
  ok(/^const BOLT_AT := 8\.0$/m.test(castN0) && /^const BOLT_TOP := 3\.0$/m.test(castN0)
     && /if m\.get\("eval"\) != null and _struck\(was, _eval_to, ply\):/.test(castN0)
     && /return d >= BOLT_AT or \(ply == int\(game\.get\("swing_ply", -1\)\) and d >= BOLT_TOP\)/.test(castN0)
     && /\tif _bolt >= 0\.0:\n\t\t_strike\(r\)\n/.test(castN0),
    '⭐ lightning strikes the eval bar when it jumps 8 points on a move, or at the game\'s biggest swing (Game 3: 14. a3, 3.9)');
  ok(!/Booth\.DESK|STYLE\["live"\]/.test(castN0) && !/const DESK/.test(boothL)
     && /\t_text\(f, "chesswild\.com", r\.get_center\(\) \+ Vector2\(0\.0, 11\.0 \* _k\), 30, STYLE\["ink"\], true\)/.test(fnGd(castN0, '_ticker')),
    '⭐ along the bottom only the site, centered, bigger and in ink: the CHESSWILD 24 bug is gone (his 11-26)');
} else ok(false, 'the tournament board mirror is missing its new scripts');

(async () => {
  /* ⭐ A FEW HOLES ARE PATCHED: 2024 Game 7 is missing one eval. It keeps the broadcast's grades. */
  const g7 = await G.gradeWithEngine(G.convert(WC[6]), 300);
  eq(g7.graded_by, 'broadcast evals, 1 filled locally', 'Game 7 fills its one missing eval and keeps the rest');
  ok(g7.marks === true && g7.moves.some((m) => m.cls === 'mistake'), '…and keeps its marks');
  console.log('  ' + pass + ' passed, ' + fail + ' failed');
  if (fail) { console.log('RESULT: FAIL'); process.exit(1); }
  console.log('RESULT: PASS (' + pass + ' checks)');
  process.exit(0);
})();
