/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE OPENING TRAINER — every line it teaches is a legal Pirc, and it is wired in.
 * -----------------------------------------------------------------------------------
 *   node tests/trainer.check.js        (also runs inside `npm test` and `npm run test:games`)
 *
 * WHY THIS EXISTS. The trainer walks a student, move by move, into a position and then
 * tells them it is the Pirc. That is a CLAIM, and this site's rule is that a chess claim
 * gets re-proved rather than trusted ([[accuracy-above-all]]). Three separate ways this
 * room can lie, all of which render as a perfectly normal-looking page:
 *
 *   · a typo'd SAN token          -> the variation silently vanishes from the menu,
 *                                    because resolve() returns null rather than throwing
 *   · a line ending on WHITE      -> the hand-off gives White two moves in a row and the
 *                                    student's "first move of the game" is already a reply
 *   · a missing <script src>      -> the page renders in full and does nothing at all,
 *                                    which is [[feature-shipped-but-never-loaded]] exactly
 *
 * All three are invisible in source review and none of them throws. So they are gated
 * here, in pure Node, in milliseconds — no browser, no server.
 *
 * ⭐ AND THE CURVE CANNOT DRIFT. The six opponents are not hand-tuned: the book's `dial()`
 * carries a FALLBACK copy of the site's elo->skill/blunder formula for the Node case, and
 * §5 compares it against the real one in pjcc-gauntlet-engine.js. The last time a room set
 * its own numbers, "Medium" came out at ~1575 ([[park-tables-matchmaking]]).
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const C = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
const BOOK = require(path.join(ROOT, 'assets/js/pjcc-pirc-book.js'));

let PASS = 0, FAIL = 0;
const fails = [];
function ok(cond, msg, extra) {
  if (cond) { PASS++; console.log('  ✓ ' + msg + (extra ? '   ' + extra : '')); }
  else { FAIL++; fails.push(msg); console.log('  ✗ ' + msg + (extra ? '   ' + extra : '')); }
}
function section(t) { console.log('\n=== ' + t + ' ==='); }

console.log('\n══ THE OPENING TRAINER — ' + BOOK.VARIATIONS.length + ' variations, ' +
            BOOK.LEVELS.length + ' opponents ══');

/* ── 1 · every line replays through the referee, exactly as written ──────────────── */
section('1 · the repertoire is legal');
for (const v of BOOK.VARIATIONS) {
  const r = BOOK.resolve(v.id);
  ok(!!r, v.name + ': replays move for move through the referee');
  if (!r) continue;

  const toks = v.line.trim().split(/\s+/);
  ok(r.plies.length === toks.length,
     v.name + ': all ' + toks.length + ' plies resolved', '(' + r.plies.length + ')');

  /* Re-derive the SAN from the resolved squares and demand it matches the authored
     token. resolve() already matched on SAN, so this is a second, independent pass —
     it catches a line that resolved to a DIFFERENT legal move than the one written. */
  let S = C.parseFEN(), good = true, where = '';
  for (let i = 0; i < r.plies.length; i++) {
    const mv = C.findMove(S, r.plies[i].from, r.plies[i].to, r.plies[i].promo);
    if (!mv || C.toSAN(S, mv) !== toks[i]) { good = false; where = 'ply ' + (i + 1) + ' "' + toks[i] + '"'; break; }
    S = C.makeMove(S, mv);
  }
  ok(good, v.name + ': every resolved square round-trips back to its own SAN', where);
}

/* ── 2 · it is a PIRC trainer, for BLACK ─────────────────────────────────────────
   Nate's constraint, and the one a future "just one more opening" commit would break
   without noticing. 1.e4 d6 is the Pirc move order; anything else belongs in a new book. */
section('2 · Pirc only, Black only');
for (const v of BOOK.VARIATIONS) {
  const r = BOOK.resolve(v.id); if (!r) continue;
  ok(r.plies[0].san === 'e4' && r.plies[1].san === 'd6',
     v.name + ': opens 1.e4 d6', r.plies.slice(0, 2).map((p) => p.san).join(' '));

  /* ⚠ THE ONE THAT MATTERS MOST. The engine takes over the instant the book ends; a line
     ending on White would hand it a position with White already to move. */
  const lastPly = r.plies[r.plies.length - 1];
  ok(lastPly.color === 'b',
     v.name + ': ends on a BLACK move, so the hand-off is clean', 'last = ' + lastPly.san);
  ok(r.plies.length % 2 === 0, v.name + ': an even number of plies');

  /* the student must actually get to move — a book of nothing but White is not a lesson */
  const mine = r.plies.filter((p) => p.color === 'b').length;
  ok(mine >= 4, v.name + ': the student plays at least four moves of it', mine + ' Black moves');
}

/* ── 3 · the menu is well formed ─────────────────────────────────────────────────── */
section('3 · the menu');
{
  const ids = BOOK.VARIATIONS.map((v) => v.id);
  ok(new Set(ids).size === ids.length, 'every variation id is unique');
  ok(BOOK.all().length === BOOK.VARIATIONS.length,
     'every authored variation survives resolution and reaches the menu',
     BOOK.all().length + '/' + BOOK.VARIATIONS.length);
  for (const v of BOOK.VARIATIONS) {
    ok(/^[A-E]\d\d$/.test(v.eco), v.name + ': carries a real ECO code', v.eco);
    ok(!!v.plan && v.plan.length > 80,
       v.name + ': says what Black is actually trying to do once the book runs out');
    ok(!!v.note && !!v.white, v.name + ': names White\'s system and carries a one-line note');
    /* ⭐ THE ARGUMENT, NOT THE MOVES. `plan` says what to do; `why` says why the line is
       worth playing at all, and it is the half that makes this somebody's opening rather
       than a drill. A variation without one is a phone number. */
    ok(!!v.why && v.why.length > 120,
       v.name + ': carries the argument for the line, not just the plan');
    ok(!!v.why && v.why !== v.plan, v.name + ': …and it is not a copy of the plan');
  }

  /* the creed, and the reveal it deliberately does not spend */
  ok(!!BOOK.CREED && BOOK.CREED.length > 200, 'the repertoire has a creed');
  /* ⛑⛑ THIS CHECK USED TO ASSERT THE OPPOSITE, AND BOTH VERSIONS WERE RIGHT ON THEIR DAY.
     From 2026-08-31 it failed if the name **Michael** reached this page at all: he was
     deleted from the site in 4ce0b46 (2026-07-05), he owns this opening in canon, and the
     temptation to sign the creed with his name was therefore permanent and not mine to
     act on. On 2026-09-01 Nate spent the reveal himself — *"go ahead and call teacher
     Michael"* — so the guard now protects the DECISION instead of the secret.

     ⭐ THE THING WORTH GATING DID NOT CHANGE: that the byline is deliberate. A creed that
     silently loses its author reads as an editing accident, and a creed that gains one
     nobody chose is the leak the first version existed to stop. Either direction is caught
     by asking that TEACHER and the page agree. [[slow-roll-cast]] [[removed-not-forgotten]] */
  ok(BOOK.TEACHER === 'Michael', 'the creed is signed by the character who owns the opening',
     'Nate spent this reveal on 2026-09-01; a silent revert is the failure');
  const PAGE_SRC = read('academy-opening-trainer.html');
  ok(/BOOK\.TEACHER \? '<cite>— ' \+ esc\(BOOK\.TEACHER\)/.test(PAGE_SRC),
     '…and the page actually prints it, rather than holding a name it never renders',
     'the switch is only a switch if something reads it');
  /* ⚠ AND NO SECOND COPY OF THE NAME. It is typed once, in the book; a page that also
     hard-codes it is a page that keeps saying Michael the day the switch is flipped back. */
  ok(PAGE_SRC.split('<script').slice(1).join('<script').indexOf(">Michael") === -1 &&
     !/'Michael'/.test(PAGE_SRC),
     '…and the room never hard-codes the name itself', 'one switch, one spelling');
}

/* ── 4 · the six opponents ───────────────────────────────────────────────────────── */
section('4 · true beginner to perfect play');
{
  const L = BOOK.LEVELS;
  ok(L.length === 6, 'six levels, as asked', L.length + '');
  let rising = true, slower = true;
  for (let i = 1; i < L.length; i++) {
    if (L[i].elo <= L[i - 1].elo) rising = false;
    if (L[i].movetime <= L[i - 1].movetime) slower = false;
  }
  ok(rising, 'the advertised rating rises at every step',
     L.map((x) => x.elo).join(' → '));
  ok(slower, 'and so does the thinking time — a stronger level also thinks longer');
  ok(L[0].elo <= 400, 'level 1 really is a beginner', L[0].elo + '');
  ok(L[L.length - 1].elo >= 2400, 'level 6 is full strength', L[L.length - 1].elo + '');
  for (const x of L) ok(!!x.name && !!x.blurb, 'level ' + x.id + ' is named and described');

  /* the dial actually reaches the engine's extremes */
  const lo = BOOK.dial(1), hi = BOOK.dial(6);
  ok(hi.skill === 20, 'level 6 asks Stockfish for skill 20', 'got ' + hi.skill);
  ok(lo.skill === 0 && lo.blunder > 0.3,
     'level 1 pins to skill 0 and gets its weakness from the blunder rate',
     'skill ' + lo.skill + ', blunder ' + lo.blunder);
}

/* ── 5 · ONE CURVE, THREE ROOMS ──────────────────────────────────────────────────
   The book's Node fallback vs the real formula in the engine bridge. If somebody tunes
   the ladder in one file, this fails instead of the trainer quietly keeping the old one. */
section('5 · the strength curve has not drifted');
{
  const sandbox = { console };
  sandbox.self = sandbox; sandbox.window = sandbox;
  vm.createContext(sandbox);
  let ENG = null;
  try {
    vm.runInContext(read('assets/js/pjcc-gauntlet-engine.js'), sandbox);
    ENG = sandbox.PJCCGauntletEngine;
  } catch (e) { /* reported by the check below */ }

  ok(!!(ENG && ENG.skillForElo && ENG.blunderForElo),
     'the shared engine bridge loads and exposes the curve');
  if (ENG && ENG.skillForElo) {
    let same = true, bad = [];
    for (const L of BOOK.LEVELS) {
      const mine = BOOK.dial(L.id);
      if (mine.skill !== ENG.skillForElo(L.elo)) { same = false; bad.push(L.name + ' skill'); }
      if (mine.blunder !== ENG.blunderForElo(L.elo)) { same = false; bad.push(L.name + ' blunder'); }
    }
    ok(same, "the book's fallback curve matches pjcc-gauntlet-engine.js at all six levels",
       bad.length ? '-> drifted: ' + bad.join(', ') : '');
  }
}

/* ── 6 · the page is wired, and wired IN ORDER ───────────────────────────────────
   The referee first, the negamax fallback before the bridge that falls back to it, and the
   book last because it resolves through the referee at definition time. A page missing one
   of these renders perfectly and does nothing. [[feature-shipped-but-never-loaded]] */
section('6 · the page loads what it runs on');
{
  const PAGE = 'academy-opening-trainer.html';
  ok(fs.existsSync(path.join(ROOT, PAGE)), 'the trainer page exists');
  const src = read(PAGE);

  /* ⚑ pjcc-pieces.js JOINED 2026-09-01 — the shared drawn set. It has no dependency of its
     own, so it sits last; what matters is that it is ON THE PAGE, because without it every
     square falls back to a plain glyph and the board quietly stops being the canon board. */
  const NEED = ['pjcc-chess.js', 'pjcc-chess-ai.js', 'pjcc-gauntlet-engine.js', 'pjcc-pirc-book.js',
                'pjcc-pieces.js'];
  const at = NEED.map((n) => src.indexOf('/assets/js/' + n));
  NEED.forEach((n, i) => ok(at[i] > -1, 'loads ' + n));
  ok(at.every((x, i) => i === 0 || (x > -1 && x > at[i - 1])),
     'and loads them in dependency order', NEED.join(' → '));

  ok(/permalink:\s*\/academy\/opening-trainer\/\s*$/m.test(src),
     'it lives at /academy/opening-trainer/');
  ok(/body_class:\s*theme-academy/.test(src), 'it wears the Academy theme');
  ok(/var USER = 'b'/.test(src), 'the student is hard-wired to Black');
  ok(/ot-devpill[^>]*>In Development</.test(src), 'it says IN DEVELOPMENT on its face');
  ok(src.indexOf('BOOK.CREED') > -1 && src.indexOf('ot-creed') > -1,
     'the creed reaches the page');
  ok(src.indexOf('v.why') > -1 && src.indexOf('ot-why-b') > -1,
     'and the argument for each line reaches the room');

  /* the room must survive its dependencies going missing — a placeholder that cannot be
     reached is the same bug as no placeholder at all. [[down-never-stuck]] */
  ok(/if \(!C \|\| !BOOK\)/.test(src), 'it says so out loud when the engine did not load');

  /* ⭐ the status line's initial text must be a string the renderer can never emit — that
     is what makes "shipped dead" distinguishable from "shipped with no data" at a glance.
     [[markdown-eats-scripts]] */
  ok(src.indexOf('Loading the board…') > -1 &&
     src.indexOf("'Loading the board…'") === -1,
     'the placeholder text is one no engine state can produce');
}

/* ── 7 · nothing leads to a shut door ───────────────────────────────
   The trainer is an ACADEMY LESSON, not a games-hall game — Nate asked for it in the
   Academy, and that is the only door it has. ⚠ It is deliberately NOT in
   assets/js/pjcc-games-data.js: `pjcc-hall.js` builds every card's href as
   `/games/<slug>/`, so a registry row for a room that lives under /academy/ would render a
   card pointing at a page that does not exist. [[dead-game-links-trap]] If it should ever
   appear on the hall, the hall has to learn about off-hall pages FIRST. */
section('7 · the doors');
{
  const ACADEMY = read('academy.md');
  ok(ACADEMY.indexOf('/academy/opening-trainer/') > -1,
     'the Academy links to the trainer');
  ok(/<a class="ac-lesson[^"]*"[^>]*href="\{\{ '\/academy\/opening-trainer\/' \| relative_url \}\}"/.test(ACADEMY),
     'and links to it as a real, openable lesson — not a grayed-out Building card');
  ok(/ac-lesson-dev/.test(ACADEMY),
     '…carrying the IN DEVELOPMENT tag Nate asked for');

  const REG = read('assets/js/pjcc-games-data.js');
  ok(!/slug:'opening-trainer'/.test(REG),
     'it stays OUT of the games registry, whose cards all resolve to /games/<slug>/');
}

/* ── 8 · THE ACADEMY THEME IS ONE FILE, AND ITS POSITION IS THE FILE ─────────────
   Hoisted out of three page <style> blocks on 2026-08-31 (Nate: "keeping it uniform").
   ⚠⚠ `body.theme-academy .page-title` and `html.sky-* .page-title` are BOTH (0,2,1), so
   ONLY SOURCE ORDER decides which one paints the banner. Moving the import above
   20-town-sky was measured, not guessed: all three Academy pages lose the banner in all
   four sky phases — and the SCSS still compiles, the sweep still passes and every page
   still renders. No other gate in this repo would notice.
   ⭐ So this checks the halves that can drift apart: the partial exists and is imported
   AFTER town-sky, and no page has quietly grown its own copy back.
   ⚠ Plain indexOf on purpose — these are fixed selector strings, not patterns, and a
   regex here would only add escaping to get wrong. */
section('8 · the Academy theme, hoisted and ordered');
{
  /* ⚠ THE TRAILING BRACE IS THE WHOLE CHECK. Without it this matched the POINTER COMMENT
     each page now carries — prose that names the selector to explain where it went — and
     reported all three as still holding a local copy. A declaration has a `{`; a sentence
     about a declaration does not. Same false positive a crude grep gave seven times over
     in [[markdown-eats-scripts]]: matching a name, not a construct. */
  const TITLE = 'body.theme-academy .page-title {';
  const CARD  = 'body.theme-academy .page-card {';
  const PARTIAL = '_sass/_pjcc-30-academy.scss';
  ok(fs.existsSync(path.join(ROOT, PARTIAL)), 'the theme lives in one partial');

  const MANIFEST = read('assets/css/style.scss');
  const at30 = MANIFEST.indexOf("@import 'pjcc-30-academy'");
  const at20 = MANIFEST.indexOf("@import 'pjcc-20-town-sky'");
  ok(at30 > -1, '…and the manifest imports it');
  ok(at20 > -1 && at30 > at20,
     '…AFTER pjcc-20-town-sky, the only reason the banner survives',
     'town-sky @' + at20 + ', academy @' + at30);

  if (fs.existsSync(path.join(ROOT, PARTIAL))) {
    const P = read(PARTIAL);
    ok(P.indexOf(TITLE) > -1 && P.indexOf(CARD) > -1,
       '…and it actually carries the banner and the card');
  }

  /* the copies must not come back: a page re-declaring the theme is the drift this hoist
     removed, and from its own <style> it would silently out-order the partial */
  const PAGES = ['academy.md', 'academy-bootcamp.md', 'academy-opening-trainer.html'];
  const copies = PAGES.filter(function (f) {
    const src = read(f);
    return src.indexOf(TITLE) > -1 || src.indexOf(CARD) > -1;
  });
  ok(copies.length === 0,
     'no Academy page keeps a local copy of the theme' +
     (copies.length ? '  -> ' + copies.join(', ') : ''),
     PAGES.length + ' pages clean');

  /* and all three still ASK for it — a hoisted theme nobody opts into is worse than three
     copies, because from the stylesheet side it looks perfectly correct */
  const wearing = PAGES.filter(function (f) {
    return read(f).indexOf('body_class: theme-academy') > -1;
  });
  ok(wearing.length === PAGES.length,
     'and all three still wear body_class: theme-academy',
     wearing.length + '/' + PAGES.length);
}


/* ── 9 · the board is the SAME board as the Park Tables ──────────────────────────
   2026-09-01, Nate: *"Fix the colors on the opening trainer board to match the chessboards
   of the park tables. The shapes of the pieces and board as well."*

   ⭐ THIS COMPARES THE TWO FILES AGAINST EACH OTHER RATHER THAN AGAINST TYPED-IN VALUES.
   A gate that asserted "the light square is #e9d3a4 plus a 152deg key light" would go green
   forever while somebody retuned the Park Tables and left this room behind — which is
   precisely the drift that happened, and it survived a hundred and sixteen other checks
   because every one of them was about this page alone. The canon's own rule is that there
   is ONE board; the honest way to test that is to read both boards.
   ⚠ SO A DELIBERATE RETUNE OF THE PARK TABLES WILL FAIL THIS. That is the point: the fix
   is to move both, and this names the pair that disagreed. [[chess-visual-canon]] */
section('9 · the board and the pieces are the canon ones');
{
  const OT = read('academy-opening-trainer.html');
  const PT = read('games/park-tables/index.html');

  /* the declarations of one rule, normalized: selector dropped, whitespace collapsed, and
     the pt-/ot- prefix erased so two rules that differ only by room compare equal */
  /* ⚠⚠ THE LONGEST BODY, NOT THE FIRST. `.ot-board` is declared twice: the phone bleed
     (three properties, and it comes FIRST in the file) and then the board itself. A
     first-match reader compared the canon frame against `border-radius: 0` and reported
     three failures about a board that was correct — the check was reading the override.
     ⭐ Longest-wins is not a trick: an override exists to say less than the rule it edits. */
  function ruleOf(src, sel) {
    let at = src.indexOf(sel + ' {'), best = null;
    while (at > -1) {
      const j = src.indexOf('}', at);
      if (j > -1) {
        const body = src.slice(at + sel.length + 2, j).replace(/\s+/g, ' ').trim();
        if (!best || body.length > best.length) best = body;
      }
      at = src.indexOf(sel + ' {', at + 1);
    }
    return best;
  }
  const PAIRS = [['.pt-sq.lt', '.ot-sq.lt', 'the light wood'],
                 ['.pt-sq.dk', '.ot-sq.dk', 'the dark wood'],
                 ['.pt-sq.last', '.ot-sq.last', 'the last-move gold'],
                 ['.pt-sq.sel', '.ot-sq.sel', 'the selected square'],
                 ['.pt-co', '.ot-co', 'the coordinate marks'],
                 ['.pt-pc', '.ot-pc', 'the piece layer']];
  PAIRS.forEach(function (p) {
    const a = ruleOf(PT, p[0]), b = ruleOf(OT, p[1]);
    ok(a !== null && b !== null && a === b, p[2] + ' is declared identically in both rooms',
       a === null ? 'no ' + p[0] : b === null ? 'no ' + p[1] : (a === b ? 'byte for byte' : p[1] + ': ' + b));
  });

  /* the frame is not a whole-rule match — the two boards size themselves differently (this
     one fills its stage column, that one caps at 420px) — so the three values that make it
     LOOK like the same board are compared on their own. */
  const otB = ruleOf(OT, '.ot-board') || '', ptB = ruleOf(PT, '.pt-board') || '';
  [['border: 3px solid var(--chess-frame', 'a 3px timber frame'],
   ['border-radius: 6px', 'a 6px corner'],
   ['inset 0 -12px 22px rgba(0,0,0,0.32)', 'the recessed shadow, not a flat drop shadow']]
    .forEach(function (v) {
      ok(otB.indexOf(v[0]) > -1 && ptB.indexOf(v[0]) > -1, 'the board wears ' + v[1]);
    });

  /* ⚠⚠ THE PIECES ARE THE HALF THAT CANNOT BE TESTED BY COLOR. A text-stroked Unicode glyph
     and a drawn Staunton can both be "purple with a light edge" and look nothing alike — the
     shapes were what he was looking at. So this asserts the RENDERER and its ratios, and that
     the old glyph styling is gone rather than merely overridden. */
  ok(/PJCCPieces\.draw\(ctx, mid, mid, PC_PX \* 0\.8125/.test(OT),
     'the pieces are drawn by the shared renderer, at the shared inset');
  ok(/PJCCPieces\.draw\(ctx, mid, mid, PC_PX \* 0\.8125/.test(PT),
     '…the same call the Park Tables makes', 'one renderer, one livery');
  ok(OT.indexOf('var PC_PX = 160;') > -1 && PT.indexOf('var PC_PX = 160;') > -1,
     '…onto a bitmap of the same size', '160px covers a 3x phone square');
  ok(OT.indexOf('-webkit-text-stroke: 0.062em') === -1,
     'and the old text-stroked glyph styling is GONE, not overridden',
     'an outranked rule is a rule that comes back');
  ok(/canvas class="ot-pc"/.test(OT) && /canvas class="pt-pc"/.test(PT),
     'both rooms put a <canvas> in the square');

  /* the fallback, because pjcc-pieces.js is one script among five ([[down-never-stuck]]) */
  ok(OT.indexOf('if (window.PJCCPieces)') > -1,
     'a missing renderer still leaves pieces on the board');

  /* ⚑ THE BOOTCAMP BOARD JOINED THE DRAWN SET 2026-09-01. Its SQUARES had matched since
     July — same woods, same key light, same frame — and only the pieces were still
     text-stroked Unicode, which is the half of "uniform" that is hardest to see in a diff
     and easiest to see on the page. It is checked here rather than in a file of its own
     because these are the Academy's two boards and this section already owns that claim. */
  const BC = read('academy-bootcamp.md');
  ok(/pjcc-pieces\.js/.test(BC), 'the Bootcamp loads the shared renderer too');
  ok(/PJCCPieces\.draw\(ctx, mid, mid, PC_PX \* 0\.8125/.test(BC),
     '…and paints with the same call, at the same inset');
  ok(BC.indexOf('var PC_PX = 160;') > -1, '…onto the same size bitmap');
  ok(BC.indexOf("createElement('canvas')") > -1 && BC.indexOf("-webkit-text-stroke: 0.062em") === -1,
     '…and the old text-stroked glyph styling is gone, not overridden');
  ok(BC.indexOf('if (window.PJCCPieces)') > -1, '…with the same fallback if it fails to load');
  ok(ruleOf(BC, '.bc-sq.lt') === ruleOf(PT, '.pt-sq.lt') &&
     ruleOf(BC, '.bc-sq.dk') === ruleOf(PT, '.pt-sq.dk'),
     '…and its woods are declared exactly as the Park Tables\' are',
     'the squares matched before the pieces did');

  /* and the canon file has to KNOW about this board, or the next person tuning the woods
     has no way to learn it is out here reading them */
  const CANON = read('_sass/_pjcc-22-chess-canon.scss');
  ok(CANON.indexOf('.ot-sq/.ot-pc') > -1, 'the canon names this board in its roll call');
  ok(/html\.eclipse-total \.ot-sq/.test(CANON),
     '…and eases it through the eclipse with the others', 'or it snaps while they fade');
}


/* ── 10 · YOUR BOOK — the one thing this room remembers ──────────────────────────
   Idea #7, 2026-09-01. Two tiers: ☆ KNOWN (you walked the whole line with no help) and
   ★ HELD (you then won the game that came out of it, against a named opponent). It is
   EARNED progress, so it syncs, and the sync is where the silent failures live.

   ⭐ THE MERGE IS LIFTED OUT OF pjcc-profile.js AND RUN, not read. A merge is a claim about
   two devices, and the only honest way to check it is to hand it two states. §5 already does
   this for the elo curve; same trick, same reason. */
section('10 · the repertoire is a possession');
{
  const OT = read('academy-opening-trainer.html');
  const PROF = read('assets/js/pjcc-profile.js');
  const DOSS = read('dossier.md');
  const KEY = 'pjcc.trainer.book.v1';

  /* ── the merge, actually executed ──────────────────────────────────────────── */
  const src = PROF.slice(PROF.indexOf('var BOOK_KEY ='));
  const cut = src.indexOf('\n  var PJCC = {');
  const sandbox = {
    store: {},
    localStorage: {
      getItem(k) { return Object.prototype.hasOwnProperty.call(sandbox.store, k) ? sandbox.store[k] : null; },
      setItem(k, v) { sandbox.store[k] = String(v); },
      removeItem(k) { delete sandbox.store[k]; }
    },
    parseInt: parseInt, JSON: JSON, out: null
  };
  ok(cut > 0, 'the merge was found in pjcc-profile.js');
  try {
    vm.createContext(sandbox);
    vm.runInContext(src.slice(0, cut) + '\n out = { book: trainerBook, merge: trainerBookMerge };', sandbox);
  } catch (e) { ok(false, 'the merge parses on its own', e.message); }
  const M = sandbox.out;
  ok(!!(M && M.merge), 'and it runs outside a browser');

  if (M && M.merge) {
    const run = (local, remote) => {
      sandbox.store[KEY] = JSON.stringify(local);
      M.merge(remote);
      return JSON.parse(sandbox.store[KEY]);
    };
    /* ⚠⚠ DIRECTION INDEPENDENCE IS THE PROPERTY. A merge that works one way and loses data
       the other is exactly how a phone last opened in July rolls back this morning's win —
       and it passes every single-direction test ever written. [[everything-earned-syncs]] */
    const A = { austrian: { known: 1, held: 1700 }, byrne: { known: 1 } };
    const B = { austrian: { known: 1, held: 900 },  lion:  { known: 1, held: 350 } };
    const ab = run(A, B), ba = run(B, A);
    /* ⚠ COMPARED CANONICALLY. The first version stringified both results and failed on KEY
       ORDER — {byrne, lion} against {lion, byrne}, identical content, different insertion
       sequence. A merge has no opinion about key order and neither should this. */
    const canon = (o) => JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k].known || 0, o[k].held || 0]));
    ok(canon(ab) === canon(ba),
       'the merge gives the same answer whichever device speaks first',
       canon(ab) + '  vs  ' + canon(ba));
    ok(ab.austrian.held === 1700, 'held takes the MAX — a weaker win cannot walk a stronger one back',
       'held ' + ab.austrian.held);
    ok(ab.byrne && ab.byrne.known === 1 && ab.lion && ab.lion.known === 1,
       'known is a UNION — neither device loses a line the other learned',
       Object.keys(ab).sort().join(' · '));
    /* ⚠ STICKY. "I learned this line" cannot un-happen, so an account row that has never
       heard of a line must not erase it. */
    const kept = run({ lion: { known: 1 } }, { lion: {} });
    ok(kept.lion && kept.lion.known === 1, 'a remote row with no news cannot unlearn a line');
    /* garbage in must cost nothing — this reads a JSON blob off the network */
    let survived = true;
    try { M.merge(null); M.merge('nope'); M.merge({ x: 4 }); M.merge({ y: { held: 'lots' } }); }
    catch (e) { survived = false; }
    ok(survived, 'and junk from the wire is ignored rather than thrown', 'null · string · scalars');
  }

  /* ── the four ways to lose the mark, all wired ─────────────────────────────── */
  const HELP = [
    ['the walk-in hint', /G\.helped = 1;\s*\n\s*G\.hintSq = \{/],
    ['a wrong move',    /G\.helped = 1;\s*\n\s*G\.wrong = C\.toSAN/],
    ['a take-back',     /G\.helped = 1;\s*\n\s*rewindTo\(target\);/],
    ['skipping the book', /G\.helped = 1;\s*\n\s*toPlay\(\);/]
  ];
  HELP.forEach((h) => ok(h[1].test(OT), 'help is recorded for ' + h[0]));

  /* ⚠ THE TWO GRANTS ARE GUARDED, and the guards are the feature. Without the first, Skip to
     the Position is a shortcut to the whole trophy case; without the second, ★ can be won on
     a line you never learned, which makes the tiers meaningless. */
  ok(/if \(!G\.helped && grantKnown\(G\.v\.id, USER\)\)/.test(OT),
     'KNOWN is granted only on an unhelped walk-in, and only to the side that walked it');
  ok(/if \(loser !== USER && !G\.helped && grantHeld\(G\.v\.id, G\.lvl\.elo, USER\)\)/.test(OT),
     'HELD is granted only on an unhelped WIN, at the level actually played');
  ok(/if \(!all\[id\] \|\| !all\[id\]\[f\.known\]\) return false;/.test(OT),
     '…and never on a line that is not KNOWN first', 'the tiers are a ladder, not two switches');
  ok(/if \(\(all\[id\]\[f\.held\] \|\| 0\) >= elo\) return false;/.test(OT),
     '…and never downward', 'beating Fresh Recruit after Expert changes nothing');

  /* ── it reaches the account, and comes back ────────────────────────────────── */
  ok(/PJCC\.saveScore\('opening-trainer'/.test(OT), 'the book is banked to the account');
  ok(OT.indexOf('if (!(window.PJCC && PJCC.saveScore)) return;') > -1,
     '…guarded, so a missing profile module cannot take the room down');
  ok(/r\.game === 'opening-trainer'/.test(PROF) && /trainerBookMerge\(bk\.data\.book\)/.test(PROF),
     'and it is pulled back on every page, through PJCC.ready');
  /* ⚠ ONE REQUEST. myStats() returns every row; a second call for the book would be a
     duplicate round trip for data already in hand. */
  ok((PROF.match(/PJCC\.myStats\(\)\.then/g) || []).length === 1,
     '…inside the ONE myStats call, not a second round trip');

  /* ── the Dossier draws it, and stays quiet at zero ─────────────────────────── */
  ok(DOSS.indexOf('PJCC.trainerBook') > -1, 'the Dossier reads the book through the module');
  ok(/if \(bKnown > 0\)/.test(DOSS), '…and draws nothing until a line is actually learned',
     'a row saying "0 of 6" is an accusation');
  ok(DOSS.indexOf("href=\"/academy/opening-trainer/\"") > -1, '…and links back to the room');

  /* ⚠⚠ THE KEY IS SPELLED IN EXACTLY TWO FILES. A third copy is the drift this site has
     been bitten by more than once — the room that writes it and the module that merges it
     are the only two things allowed to know its name. */
  const spellers = ['academy-opening-trainer.html', 'assets/js/pjcc-profile.js',
                    'dossier.md', 'games/park-tables/index.html']
    /* ⚠⚠ THE QUOTES ARE THE CHECK. dossier.md NAMES the key in a comment explaining where
       the book comes from, and a bare indexOf read that as a third copy — the same false
       positive §8 produced when a pointer comment mentioned a selector. A declaration is
       quoted; a sentence about one is not. */
    .filter((f) => read(f).indexOf("'" + KEY + "'") > -1);
  ok(spellers.length === 2 && spellers.indexOf('dossier.md') === -1,
     'only the trainer and the profile module name the storage key', spellers.join(' · '));
}


/* ── 11 · ONE CHAIR, AND NO WAY INTO THE OTHER ───────────────────────────────────
   A White chair shipped on 2026-09-01 and Nate took it back out the same day: *"Opening
   Trainer should only be for Black right now ... when playing white, you'd HAVE to
   cooperate with the variation for Black's purposes."* He is right, and the reason is
   structural rather than a matter of taste — this room plays whichever side you are not
   sitting in, so the White chair had the room playing the Pirc AT the student. That is a
   rehearsal against an opponent who agreed in advance to walk into it.

   ⚠⚠ SO THIS SECTION GATES A REMOVAL, WHICH IS THE HARDER THING TO KEEP TRUE. A door comes
   out of four places on this page — the markup, the SIDES list, the click listener and the
   CSS — and the site's own record is that a half-removed thing keeps looking alive
   ([[read-before-you-delete]], [[one-fix-every-instance]]). All four are checked.
   ⭐ AND WHAT DELIBERATELY SURVIVED IS CHECKED TOO. The data model stays side-parameterized
   and the book keeps its white prose, because the anti-Pirc room that Nate does want is a
   NEW lesson that will need both. Re-opening a door is a line; rebuilding a sided mark
   format out of accounts that have already banked marks is a migration. */
section('11 · one chair — the room is Black\'s');
{
  const OT = read('academy-opening-trainer.html');
  const PROF = read('assets/js/pjcc-profile.js');

  /* ⚠⚠ THE POSITIVE ANCHOR COMES FIRST, AND IT IS NOT CEREMONY. Everything below is an
     ABSENCE check, and an absence check over a file that failed to load, got renamed or
     came back empty is unanimous and worthless — four of those shipped green on this page
     in one day. If the setup screen is not here, nothing under this line means anything.
     [[green-must-name-what-ran]] */
  ok(OT.length > 20000 && OT.indexOf("id=\"ot-vars\"") > -1 && OT.indexOf('function paintSetup()') > -1,
     'the room and its setup screen are actually here to be checked',
     OT.length + ' bytes, ot-vars present, paintSetup() present');

  /* ── the side is pinned, and nothing on the page can move it ───────────────── */
  ok(/var pickSide = 'b';/.test(OT), "pickSide is Black");
  ok((OT.match(/pickSide\s*=(?!=)/g) || []).length === 1,
     '…and it is assigned in exactly one place, so nothing can change it',
     'the picker used to write it from a click handler');
  ok(/\n    USER = 'b';/.test(OT) && OT.indexOf("USER = (pickSide === 'w')") === -1,
     "USER is set to Black in start(), not read from a choice");
  /* ⛑ THE FIRST VERSION OF THIS CHECK WAS AN `||` AND PASSED ON THE WRONG HALF. It read
     "no === 'w' anywhere OR no pickSide === 'w'", and the second clause was true the moment
     the picker went, so it went green over four live `USER === 'w'` branches — including
     the one that still turned the board around. An OR between a strong claim and a weak one
     is the weak one. [[green-must-name-what-ran]] */
  const WHITEQ = (OT.match(/(?:USER|pickSide) === 'w'/g) || []);
  ok(WHITEQ.length === 0, '…and no branch anywhere still asks whether the student is White',
     WHITEQ.length ? WHITEQ.length + ' live white branches' : 'not one');

  /* ── the door is out of all four places ────────────────────────────────────── */
  const DOORS = [
    ['the markup',     'id="ot-sides"'],
    ['the SIDES list', 'var SIDES = ['],
    ['the element lookup', "getElementById('ot-sides')"],
    ['the click listener', "closest('[data-s]')"],
    ['the painter',    'function paintSides()'],
    ['the CSS',        '.ot-side-btn']
  ];
  const left = DOORS.filter((d) => OT.indexOf(d[1]) > -1);
  ok(left.length === 0, 'the side picker is gone from every place it lived',
     left.map((d) => d[0]).join(' · ') || DOORS.length + ' places, all clear');

  /* ⚠ AND NO WHITE-SIDE COPY SURVIVES ON SCREEN. A dead branch that still holds a string is
     the version of this that ships wrong the day somebody flips a flag to "test it". */
  /* ⛑⛑ THE PROSE IS IN THIS LIST BECAUSE THE FIRST VERSION OF IT WAS NOT. Every control
     and every branch had gone, the room rendered perfectly — and the badge under the title
     still read "as Black, or from the other chair" while the lead paragraph still said "pick
     which end of the board you are sitting at". A removal is only finished when the page has
     stopped ADVERTISING the thing, and neither line lives near any code that changed, which
     is exactly why a source diff will not show them to you. Caught on a render.
     [[one-fix-every-instance]] */
  const COPY = ['You · White', 'What Black Is Trying to Do', 'Why He Plays It',
                'White, playing up the screen', 'BOOK.CREED_W',
                'or from the other chair', 'which end of the board'];
  const said = COPY.filter((c) => OT.indexOf(c) > -1);
  ok(said.length === 0, '…and so is every line of copy written for that chair',
     said.join(' · ') || COPY.length + ' strings, none of them reachable');

  ok(/var i = \(7 - dr\) \* 8 \+ \(7 - dc\);/.test(OT) && OT.indexOf("(USER === 'w') ? (dr * 8 + dc)") === -1,
     'the board is drawn from Black\'s side, without asking',
     'h1 is index 63 from this chair');

  /* ── what stays, so the anti-Pirc room is a build rather than a migration ──── */
  const FIELDED = ['grantKnown(G.v.id, USER)', 'grantHeld(G.v.id, G.lvl.elo, USER)',
                   'bookEntry(G.v.id, USER)', 'heldLevel(G.v.id, USER)',
                   'bookEntry(v.id, pickSide)', 'heldLevel(v.id, pickSide)',
                   "bookCounts('b')", 'bookCounts(pickSide)'];
  const sideless = FIELDED.filter((c) => OT.indexOf(c) === -1);
  ok(sideless.length === 0, 'every book call still names the side it is about',
     sideless.join(' · ') || FIELDED.length + ' call sites, all sided');
  ok(/var FIELD = \{ b: \{ known: 'known', held: 'held' \}, w: \{ known: 'wKnown', held: 'wHeld' \} \};/.test(OT),
     '…and the two field names still live in exactly one map',
     'ripping the white half out would be a migration, not a cleanup');
  ok(/\[\['known', 'held'\], \['wKnown', 'wHeld'\]\]\.forEach/.test(PROF),
     '…and the account merge still carries both halves');

  /* ⚠⚠ THE BOOK KEEPS ITS WHITE PROSE, AND THE BYLINE RULE KEEPS PROTECTING IT. Michael
     plays the Pirc; he does not play against it, so the day the anti-Pirc room is built its
     creed must still be unsigned rather than handed to him. Checked now, while the reason is
     written down, because that is the version of this rule that survives. [[slow-roll-cast]] */
  ok(!!BOOK.CREED_W && BOOK.CREED_W !== BOOK.CREED,
     'the white creed is still on file for the room that will use it');
  ok(BOOK.CREED_W.indexOf(BOOK.TEACHER) === -1,
     '…and it still does not name the teacher', 'he plays this opening; he does not play against it');
  const noWhy = BOOK.all().filter((v) => !v.whyW || v.whyW === v.why).map((v) => v.name);
  ok(noWhy.length === 0, '…and every line still has its white-side argument written',
     noWhy.join(', ') || BOOK.all().length + ' lines, all with whyW');
}


/* ── 12 · PREPARE FOR A NAMED REGULAR ────────────────────────────────────────────
   Idea #1, the one Nate called worth building: *"Not 'level 4' — Robert. The room shows what
   he actually plays, drills you against it, then sends you to the Park Tables to face him."*
   Its prerequisite — an opening book on the bench — is gated in test:regulars; this covers
   the Academy's half. */
section('12 · preparing for a named regular');
{
  const OT = read('academy-opening-trainer.html');
  const YML = read('_data/regulars.yml');

  /* ⚠⚠ THE ROSTER IS PRINTED FROM THE DATA FILE, NEVER TYPED. A third hand-typed copy of the
     bench is the trap test:regulars exists for, and this page would be the third. */
  ok(/site\.data\.regulars \| where_exp/.test(OT),
     'the roster is read from _data/regulars.yml at build time');
  /* ⛑⛑ ASKED OF THE PAGE WITH ITS COMMENTS STRIPPED, AND THE FIRST VERSION WAS NOT. The
     Liquid comment above this feature QUOTES Nate — "Not 'level 4' — Robert" — so a bare
     search for the name flagged the page for explaining itself. Third time this exact shape
     has bitten: a pointer comment naming a selector, a comment naming a storage key, and now
     a comment quoting the person the feature is about. Strip the prose, then ask. */
  const RENDERED = OT
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  const NAMES = [...YML.matchAll(/^ {2}name: (.+)$/gm)].map((m) => m[1].trim());
  const typed = NAMES.filter((n) => RENDERED.indexOf(n) > -1);
  ok(NAMES.length >= 8 && typed.length === 0,
     '…and not one regular is named in the page\'s own markup or code',
     typed.length ? 'TYPED: ' + typed.join(', ') : NAMES.length + ' names, none of them here');
  ok(/where_exp: "r", "r\.book"/.test(OT),
     '…and only seats with a BOOK are offered',
     'Auston adapts and Vince studies you — neither can be prepared for');

  /* the data file has to carry the field the page filters on */
  ok(/^ {2}book: \w+$/m.test(YML), 'the data file carries each seat\'s book');

  /* ⚠ A LIQUID LOOP THAT WRITES JAVASCRIPT CAN EMIT A SYNTAX ERROR FROM SOMEBODY'S NAME. A
     JSON island is inert text until one line parses it, and a bad parse costs the section
     rather than the page. [[down-never-stuck]] */
  ok(/<script id="ot-regs-data" type="application\/json">/.test(OT),
     'it arrives as a JSON island, not as generated JavaScript');
  ok(/JSON\.parse\(document\.getElementById\('ot-regs-data'\)\.textContent\)/.test(OT) &&
     /catch \(e\) \{ return \[\]; }/.test(OT),
     '…and a bad parse costs the section, not the room');

  /* ⭐ HIS RATING, NOT THE NEAREST RUNG — the bench does not sit on this room's six steps */
  ok(/dial: reg \? BOOK\.dialFor\(reg\.elo, lvl\.movetime\) : BOOK\.dial\(pickLvl\)/.test(OT),
     'a prepared game plays at the regular\'s own rating',
     'rounding 1800 to the 1700 rung is drilling against somebody else');
  ok(typeof BOOK.dialFor === 'function', '…through the same curve the rungs use');
  {
    const byRung = BOOK.dial(5), byElo = BOOK.dialFor(1700, byRung.movetime);
    ok(byRung.skill === byElo.skill && byRung.blunder === byElo.blunder,
       '…and the two doors agree where they meet', 'rung 5 is 1700: ' + JSON.stringify(byRung));
  }
  ok(/var mySeq = G\.seq, dial = G\.dial;/.test(OT),
     '…and the engine reads the dial the game was built with',
     'a fresh BOOK.dial(0) would quietly hand back Fresh Recruit');

  /* the loop closes, and only where it can */
  ok(/var canSit = !!\(reg && reg\.open\);/.test(OT),
     'the door to the tables opens only for a seat you can sit at',
     'the two locked rungs can be prepped for long before they open');
  ok(OT.indexOf("'/games/park-tables/?table=' + encodeURIComponent(reg.key)") > -1,
     '…and it goes to that seat\'s own table');
  /* ⛑⛑ AND IT NAMES THE CHAIR, WHICH IS THE SEAM BETWEEN THIS ROOM AND THE OTHER ONE.
     Shipped broken for a few hours on 2026-09-01 by two changes that were each correct:
     this door was built while the bench defaulted to White, and the bench then moved to
     Random. Half of every prepared walk-through arrived as WHITE — where the regular's book
     does not run at all — so the room taught a defense and then tossed a coin over whether
     any of it applied. Neither file changed in a way its own gate could see, because the
     defect lived in the space between them. Both ends are pinned now: the href here, and
     the arrival in test:parktables. */
  ok(/'&side=' \+ USER;/.test(OT),
     '…and it names the chair the student just trained in',
     'from USER, so the anti-Pirc room inherits a working door');

  /* ⚠ THE THREE PICKERS ARE NOT INDEPENDENT. Choosing a line or a rung by hand means you
     have stopped preparing for him, and the state has to say so or the screen lies. */
  const clears = (OT.match(/pickReg = null;/g) || []).length;
  ok(clears >= 3, 'choosing a line, a rung or the other tab all stop preparing for him',
     clears + ' places clear it');

  /* ⛑⛑ THE SWITCH: [hidden] LOSES TO A CLASS THAT SETS display, AND THIS SHIPPED BROKEN
     ONCE TODAY — sixteen driven checks passed over a list that had never gone away. Both
     panels set display:flex, so both need their [hidden] twin in the same block.
     [[silent-css-deletions]] */
  ['ot-regs', 'ot-levels'].forEach(function (c) {
    ok(OT.indexOf('.' + c + '[hidden] { display: none; }') > -1 ||
       new RegExp('\.' + c + '\[hidden\]\s*\{[^}]*display:\s*none').test(OT),
       '.' + c + ' carries its own [hidden] rule',
       'without it el.hidden = true changes nothing on screen');
  });
}


console.log('\n' + (FAIL ? '✗ ' + FAIL + ' FAILED' : '✓ all ' + PASS + ' checks passed'));
if (FAIL) { console.log('\nFailures:'); fails.forEach((f) => console.log('  · ' + f)); }
process.exit(FAIL ? 1 : 0);
