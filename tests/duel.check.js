/* duel.check.js — the accuracy gate for Duel Mode.
 *
 * Every line the duel shows is a real opening trap, and the game teaches it by playing it.
 * So the chess has to be true, and "true" is not a thing you can eyeball across eleven
 * traps and forty-four replies. This re-proves the SHIPPED file against the site's
 * perft-verified referee (assets/js/pjcc-chess.js), which knows nothing about the game.
 *
 *   Run: npm run test:duel      Exits non-zero on any failure.
 *
 * What it proves, per trap:
 *   1. the setup line is legal from move one, and every SAN string is exactly right
 *   2. the decision position is BLACK to move — the player always answers as Black
 *   3. exactly one reply is marked right, there are four, and none repeat
 *   4. every reply is legal in the decision position, and its continuation is legal
 *   5. any line ending in '#' really is checkmate
 *   6. ⭐ a mate the OPPONENT threatens you with is FORCED against every defense
 *
 * ⚠ 6 IS THE ONE THAT MATTERS AND IT ONLY APPLIES ONE WAY. `then` alternates starting with
 * the opponent, so an odd-length line ends on THEIR move and an even one ends on YOURS.
 *   · they mate you → that is a PUNISHMENT the game threatens, so it must hold against
 *     every defense. A punishment you could have wriggled out of is a lie told to a
 *     beginner, and this game's whole pitch is that losing teaches you something true.
 *   · you mate them → it is a demonstration, and it CANNOT be forced: the loser always had
 *     the option of not walking into it. From's Gambit is exactly this — 2…Qh4+ mates if
 *     White grabs the g-pawn, and White does not have to.
 * The first version of this file demanded "forced" both ways and flagged Fool's Mate, where
 * the player's own move IS the mate and there is nothing left to force.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const C = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));

let PASS = 0, FAIL = 0;
const fails = [];
function ok(cond, msg) {
  if (cond) { PASS++; console.log('  ✓ ' + msg); }
  else { FAIL++; fails.push(msg); console.log('  ✗ ' + msg); }
}

/* ── READ THE TABLE ITSELF ─────────────────────────────────────────────────────────
   ⚠ READ, DO NOT RE-DECLARE. A test that carries its own copy of the data proves the copy
   — the site has been bitten by exactly that (two SQ64 alphabets in two files).

   ⭐ IT IS A PLAIN .json NOW, and that is the point of this whole arrangement: the same
   file is read by the web game (fetch), by this gate (readFileSync), and one day by a
   Godot project (`JSON.parse_string`). It used to live inline in the HTML and this file
   pulled it out with `vm` — which worked, but meant the port was theoretical, because a
   Godot project cannot read a JavaScript variable out of an HTML document. */
const TABLE = path.join(ROOT, 'assets/games/duel-traps.json');
const JSONDATA = JSON.parse(fs.readFileSync(TABLE, 'utf8'));
const TRAPS = JSONDATA.traps;
const FOES = JSONDATA.foes;
const SRC = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_duel.html'), 'utf8');

/* forced mate for the side to move within `plies` (odd), against EVERY defense */
function mateForced(S, plies) {
  if (plies <= 0) return false;
  for (const m of C.legalMoves(S)) {
    const ns = C.makeMove(S, m);
    if (C.isCheckmate(ns)) return true;
    if (plies >= 3) {
      const rep = C.legalMoves(ns);
      if (rep.length && rep.every(r => mateForced(C.makeMove(ns, r), plies - 2))) return true;
    }
  }
  return false;
}

function play(S, uci, san, where, errs) {
  const from = C.sqFromName(uci.slice(0, 2)), to = C.sqFromName(uci.slice(2, 4));
  const m = C.findMove(S, from, to, uci.length > 4 ? uci[4] : null);
  if (!m) { errs.push(where + ' ILLEGAL ' + uci + ' (' + san + ')'); return null; }
  const ref = C.toSAN(S, m);
  if (ref !== san.replace(/[?!]+$/, '')) errs.push(where + ' SAN "' + san + '" should be "' + ref + '"');
  return C.makeMove(S, m);
}

console.log('\n=== DUEL MODE — every line re-proved against the referee ===');
console.log('    ' + TRAPS.length + ' traps lifted from the shipped game\n');

for (const t of TRAPS) {
  const errs = [];
  let S = C.parseFEN(C.START_FEN);
  for (let i = 0; i < t.setup.length && S; i++) {
    S = play(S, t.setup[i][0], t.setup[i][1], 'setup ply ' + (i + 1), errs);
  }
  if (!S) { ok(false, t.id + ': setup line -> ' + errs.join('; ')); continue; }

  if (S.turn !== 'b') errs.push('decision position is ' + S.turn + ' to move; the player answers as BLACK');
  if (t.replies.length !== 4) errs.push('has ' + t.replies.length + ' replies, want 4');
  const rights = t.replies.filter(r => r.right).length;
  if (rights !== 1) errs.push('has ' + rights + ' correct replies, must be exactly 1');
  const seen = new Set();

  for (const r of t.replies) {
    if (seen.has(r.uci)) errs.push('duplicate reply ' + r.uci);
    seen.add(r.uci);
    if (!r.say) errs.push('reply ' + r.san + ' has no line to say');
    const afterReply = play(S, r.uci, r.san, 'reply ' + r.san, errs);
    if (!afterReply) continue;
    let R = afterReply;
    const then = r.then || [];
    for (let i = 0; i < then.length && R; i++) {
      R = play(R, then[i][0], then[i][1], 'reply ' + r.san + ' -> then ply ' + (i + 1), errs);
    }
    if (!R) continue;
    const last = then.length ? then[then.length - 1][1] : r.san;
    if (/#$/.test(last)) {
      if (!C.isCheckmate(R)) errs.push('reply ' + r.san + ': claims # but the position is not mate');
      if (then.length % 2 === 1 && !mateForced(afterReply, then.length)) {
        errs.push('reply ' + r.san + ': the punishment claims mate but it is NOT forced against every defense');
      }
    }
  }
  ok(errs.length === 0, t.id.padEnd(13) + t.name.padEnd(22) + t.setup.length + ' plies, 4 replies' +
     (errs.length ? '  -> ' + errs.join('; ') : ''));
}

/* ── the shape the game depends on ── */
const regulars = TRAPS.filter(t => !t.master);
const masters = TRAPS.filter(t => t.master);
ok(regulars.length >= 4, 'the bench has ' + regulars.length + ' everyday traps');
ok(masters.length >= 1, 'the Swordmaster has ' + masters.length + ' of her own');
ok(masters.every(m => m.echo && TRAPS.some(t => t.id === m.echo && !t.master)),
   "every Swordmaster trap echoes a regular one — that echo IS the joke and the lesson");
ok(masters.every(m => {
  const src = TRAPS.filter(t => t.id === m.echo)[0];
  const a = m.replies.filter(r => r.right)[0], b = src.replies.filter(r => r.right)[0];
  return a.say === b.say;
}), "…and the echoed comeback is word-for-word the one you already learned");
ok(new Set(TRAPS.map(t => t.id)).size === TRAPS.length, 'every trap id is unique');

/* ── the voice rule, checked rather than trusted ──────────────────────────────────
   ⚠ THE LINES MUST BE ABOUT THE POSITION, NEVER ABOUT THE PLAYER. That is the constraint
   that makes an insult-swordfighting homage safe on a site whose footing is good morals,
   and a constraint nobody re-reads is a constraint that drifts one line at a time. This is
   a coarse net — it cannot judge tone — but it catches the obvious slide into second-person
   name-calling, which is the direction this would drift if it drifted. */
const BANNED = /\b(stupid|idiot|fool|moron|dumb|ugly|loser|pathetic|coward|worthless|clown)\b/i;
const lines = [];
TRAPS.forEach(t => { lines.push([t.id, t.insult]); t.replies.forEach(r => lines.push([t.id, r.say])); });
const rude = lines.filter(([, s]) => BANNED.test(s));
ok(rude.length === 0, 'no line calls anybody a name (' + lines.length + ' lines checked)' +
   (rude.length ? ' -> ' + rude.map(x => x.join(': ')).join(' | ') : ''));
ok(lines.every(([, s]) => /[.!?]$/.test(s.trim())), 'every line is punctuated like speech');

/* ── the homage is DECLARED, and stays declared ───────────────────────────────────
   ⚠ This is the check most likely to be quietly deleted by a future tidy-up, so it is
   written as a test rather than a comment. We borrowed the shape of somebody's idea; the
   credit is the price and it is not optional. */
ok(/Monkey Island/i.test(SRC) && /Ron Gilbert/i.test(SRC),
   'the game file names The Secret of Monkey Island and Ron Gilbert');
const PAGE = fs.readFileSync(path.join(ROOT, 'games/duel/index.html'), 'utf8');
ok(/Monkey Island/i.test(PAGE), 'the page a visitor actually reads names it too');
/* …and the table travels alone, so the credit has to travel with it */
ok(/Monkey Island/i.test(JSONDATA._homage || ''), 'the trap table carries the credit in its own file');

/* ── the split that makes the Godot port real ────────────────────────────────────
   The table is FACTS; the game file is the MACHINE. If a move ever creeps back into the
   HTML, the two copies drift and the ported version quietly plays a different game. */
ok(!/\bsetup:\s*\[\[/.test(SRC), 'no trap data is left inline in the game file');
ok(!/\bdocument\b|\bwindow\b|\bstyle\b/.test(JSON.stringify(JSONDATA)),
   'the table mentions no browser — it is portable as it stands');
ok(SRC.includes("fetch('duel-traps.json'"), 'the game reads the table from the shared file');

/* ── the bench ── */
ok(FOES.length >= 3, 'the bench has ' + FOES.length + ' opponents');
const PARK = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');
for (const f of FOES) {
  if (!f.elo) continue;
  const m = PARK.match(new RegExp(f.id + ":\\s*\\{[^}]*elo:\\s*(\\d+)"));
  ok(m && +m[1] === f.elo, f.name + ' is rated ' + f.elo + ' here and at the Park Tables' +
     (m ? '' : ' (no Park Tables entry found)'));
}

/* ── ⚑ THE VS RAIL'S COLORS (2026-08-13) ──────────────────────────────────────────────
   The duel's top rail is painted from `foe.aura` in duel-traps.json. Four of these five
   are Park Tables regulars who ALREADY have an aura in `BOTS`, so this file is now the
   FIFTH place on the site that names one of those colors — and the regulars gate exists
   because a hand-typed copy of the bench has produced a wrong answer here before.
   So: every aura must be a real key in `PJCC.AURAS`, and where a foe is also a bot, the
   two keys must agree. The Swordmaster is duel-only and has no bot to agree with. */
const AURA_SRC = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
const AURA_KEYS = (AURA_SRC.match(/var AURA_ORDER = \[([^\]]*)\]/) || [, ''])[1]
  .split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
ok(AURA_KEYS.length === 12, 'read ' + AURA_KEYS.length + ' aura keys out of pjcc-profile.js');
for (const f of FOES) {
  ok(f.aura && AURA_KEYS.indexOf(f.aura) >= 0,
     f.name + "'s aura `" + f.aura + '` is a real key in PJCC.AURAS');
  const m = PARK.match(new RegExp(f.id + ":\\s*\\{[^}]*aura:\\s*'([a-z]+)'"));
  if (m) ok(m[1] === f.aura, f.name + ' wears ' + f.aura + ' here and at the Park Tables');
}
/* and the room actually reads it, rather than a hex somebody pasted in */
ok(/PJCCVs\.paint\('du-aura-opp', PJCCVs\.color\(foe\.aura\)\)/.test(SRC),
   'the duel paints its rival rail from foe.aura, not from a literal');

console.log('\n' + (FAIL === 0
  ? 'RESULT: PASS (' + PASS + ' checks)\n'
  : 'RESULT: FAIL (' + FAIL + '/' + (PASS + FAIL) + ')\n  ' + fails.join('\n  ') + '\n'));
process.exit(FAIL ? 1 : 0);
