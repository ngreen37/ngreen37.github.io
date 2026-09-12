#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   pgn.check.js  —  npm run test:pgn  (also runs inside `npm test`)

   Guards `assets/js/pjcc-pgn.js`, the UCI → PGN writer, and the two rooms that use it.

   ⚑ WHY A GATE FOR A BUTTON. The PGN is the seam between a game somebody played here and
   `gen-godot-game.js` → the Godot board. It is reached for rarely and always in a hurry,
   and every way it can break is silent: a mislabeled date reads fine, a study replayed
   from the standard position is a legal-looking game of something that never happened,
   and a missing <script> tag leaves a button that does nothing at all.

   ⚠ THE ROOM CHECKS ARE HALF THE POINT. The library can be perfect and the feature still
   absent — that is [[feature-shipped-but-never-loaded]], and it has happened on this site
   before. So the tags and the wiring are pinned here too, by COUNT, because "a call
   exists" is not "all three call sites survived a refactor".
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const LIB = path.join(ROOT, 'assets', 'js', 'pjcc-pgn.js');

let pass = 0, fail = 0;
function ok(msg, detail) { pass++; console.log('  ✓ ' + msg + (detail ? '   ' + detail : '')); }
function bad(msg, detail) { fail++; console.log('  ✗ ' + msg + (detail ? '   ' + detail : '')); }
function is(cond, msg, detail) { cond ? ok(msg, detail) : bad(msg, detail); }

/* ── the library, loaded the way a page loads it ──────────────────────────────────── */
const M = require(LIB);
M.PJCCChess = require(path.join(ROOT, 'assets', 'js', 'pjcc-chess.js'));
const P = M.PJCCPgn;

console.log('\n── THE WRITER ────────────────────────────────\n');

is(P && typeof P.toPGN === 'function' && typeof P.copy === 'function',
   'the library exposes toPGN and copy');

/* A whole game, pinned exactly. This is the one check that would catch a SAN regression
   in the engine underneath — castling, piece letters, the result on the end of the line. */
const GAME = P.toPGN('e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 e1g1 f8c5', {
  event: 'Park Tables', date: '2026-08-20',
  whiteName: 'Elsa-BOT', blackName: 'ngreen37', result: '0-1',
  whiteRating: 150, blackRating: 746
});
const EXPECT = [
  '[Event "Park Tables"]',
  '[Site "chesswild.com"]',
  '[Date "2026.08.20"]',
  '[Round "?"]',
  '[White "Elsa-BOT"]',
  '[Black "ngreen37"]',
  '[Result "0-1"]',
  '[WhiteElo "150"]',
  '[BlackElo "746"]',
  '',
  '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. O-O Bc5 0-1',
  ''
].join('\n');
is(GAME === EXPECT, 'a whole game comes out byte-for-byte',
   GAME === EXPECT ? 'headers + movetext + result' : '\n--- got ---\n' + GAME);

/* ⚠⚠ THE TIMEZONE BUG, PINNED. `new Date('2026-08-20')` is UTC midnight and the LOCAL
   getters then report the 19th anywhere west of Greenwich. Both input shapes must agree. */
is(P.toPGN('e2e4', { date: '2026-08-20' }).indexOf('[Date "2026.08.20"]') !== -1,
   'a date-only string is taken verbatim', 'not routed through a local-time Date');
is(P.toPGN('e2e4', { date: Date.parse('2026-08-20T22:00:00Z') }).indexOf('[Date "2026.08.20"]') !== -1,
   '…and an epoch timestamp agrees with it', 'the two callers cannot disagree');

/* ⚠⚠ A STUDY DOES NOT BEGIN AT THE BEGINNING. Both tags, or a reader replays the wrong
   game — and the position is legal the whole way, so nothing downstream would object. */
const STUDY = P.toPGN('e6d6', { fen: '8/8/4k3/8/4K3/8/6Q1/8 b - - 0 24', result: '*' });
is(STUDY.indexOf('[SetUp "1"]') !== -1 && STUDY.indexOf('[FEN "8/8/4k3/8/4K3/8/6Q1/8 b - - 0 24"]') !== -1,
   'a non-standard start writes BOTH SetUp and FEN');
is(STUDY.indexOf('24... Kd6') !== -1,
   '…and the movetext resumes at the right move number and side', '24... Kd6');

/* Half a game under a full header reads as a real game and is not one. */
is(P.toPGN('e2e4 e7e5 e2e4', {}) === null, 'an illegal move returns null, not a partial game');
is(P.toPGN('e2e4 zz99', {}) === null, 'a malformed token returns null');
is(P.toPGN('', {}) === null, 'an empty move list returns null');
is(P.toPGN('e2e4', {}) !== null, '…and a legal one-move game still writes');

/* A quote inside a codename would close the tag early and break the whole header. */
const Q = P.toPGN('e2e4', { whiteName: 'a"b' });
is(Q.indexOf('[White "a\\"b"]') !== -1, 'a quote in a name is escaped, not left to end the tag');

console.log('\n── IT SURVIVES THE CONVERTER ──────────────────────\n');

/* ⭐ THE WHOLE POINT, END TO END. A PGN this writes must be one `gen-godot-game.js` can
   read, because that is the only reason it exists. */
const tmp = path.join(os.tmpdir(), 'pjcc_pgn_check_' + Date.now() + '.pgn');
const tmpOut = tmp.replace(/\.pgn$/, '.json');
let converted = '';
try {
  fs.writeFileSync(tmp, GAME);
  converted = execFileSync(process.execPath,
    [path.join(ROOT, 'tests', 'gen-godot-game.js'), tmp, '--out', tmpOut],
    { encoding: 'utf8' });
} catch (e) {
  converted = 'THREW: ' + ((e && e.stdout) || (e && e.message) || e);
}
is(/RESULT: PASS/.test(converted), 'the converter resolves every move of it',
   /RESULT: PASS/.test(converted) ? '8 plies, against the shipped generator' : converted.slice(0, 400));
let built = null;
try { built = JSON.parse(fs.readFileSync(tmpOut, 'utf8')); } catch (e) {}
is(built && built.white === 'Elsa-BOT' && built.black === 'ngreen37' && built.result === '0-1',
   '…and the names and result reach the board', built ? built.white + ' vs ' + built.black : 'no json');
is(built && Array.isArray(built.moves) && built.moves.length === 8,
   '…with every ply', built && built.moves ? built.moves.length + ' plies' : 'none');
try { fs.unlinkSync(tmp); fs.unlinkSync(tmpOut); } catch (e) {}

console.log('\n── THE ROOMS ACTUALLY LOAD IT ────────────────────\n');

const G = fs.readFileSync(path.join(ROOT, 'assets', 'games', 'pjcc_gauntlet.html'), 'utf8');
const T = fs.readFileSync(path.join(ROOT, 'games', 'park-tables', 'index.html'), 'utf8');
function count(hay, needle) { return hay.split(needle).length - 1; }

is(count(G, 'pjcc-pgn.js') === 1, 'the Gauntlet loads pjcc-pgn.js');
is(count(T, 'pjcc-pgn.js') === 1, 'the Park Tables load pjcc-pgn.js');
is(count(G, 'PJCCPgn.toPGN(') === 1, 'the Gauntlet builds a PGN', 'the end-of-game row');
/* ⚠ BY COUNT. Three rooms-within-the-room hand out a PGN — the bot board, the lobby list
   and a finished correspondence game — and losing one to a refactor would look like
   nothing at all from the other two. */
is(count(T, 'PJCCPgn.toPGN(') === 3, 'all THREE Park Tables call sites build a PGN',
   count(T, 'PJCCPgn.toPGN(') + ' found');
is(count(T, 'id="pt-bot-pgn"') === 1 && count(T, "getElementById('pt-bot-pgn')") === 1,
   'the bot board’s button exists and is wired');
is(count(T, 'data-pgn="') === 1 && count(T, "querySelectorAll('[data-pgn]')") === 1,
   'the lobby rows’ button exists and is wired');
is(count(T, 'id="pt-pgn"') === 1 && count(T, "getElementById('pt-pgn')") === 1,
   'the correspondence button exists and is wired');
/* ⛑ THIS CHECK WAS WORTHLESS UNTIL A MUTATION SAID SO (2026-09-11). It counted `st.fen0`
   across the whole file — but isStudy() is DEFINED from `st && st.fen0` two thousand lines
   up, so deleting the argument from this very call site left the count above zero and the
   check green. Read the HANDLER, not the file. */
const botPgnAt = T.indexOf("getElementById('pt-bot-pgn')");
const botPgnFn = botPgnAt === -1 ? '' : T.slice(botPgnAt, botPgnAt + 600);
is(botPgnFn.indexOf('PJCCPgn.toPGN(') !== -1 && botPgnFn.indexOf('st.fen0') !== -1,
   'the bot board passes a study’s own start position',
   'a study replayed from the standard start is a game that never happened');

console.log('\n' + (fail ? '  RESULT: FAIL — ' + fail + ' of ' + (pass + fail)
                          : '  RESULT: PASS (' + pass + ' checks)') + '\n');
process.exit(fail ? 1 : 0);
