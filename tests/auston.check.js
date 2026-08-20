/* ═══════════════════════════════════════════════════════════════════════════════════
 * AUSTON REMEMBERS — does she actually notice, and does she ever lie?
 * -----------------------------------------------------------------------------------
 * The module is pure logic over localStorage + the profile, so this boots the REAL file
 * in a sandbox with a fake storage and a fake profile, and drives it the way a season of
 * play would: sit down, play games, spend credits, come back.
 *
 * WHAT THIS IS DEFENDING, in order of how expensive the mistake would be:
 *
 *   1. SHE NEVER CLAIMS TO KNOW SOMETHING SHE CANNOT SEE. Signed out there is no credit
 *      balance and no rating, and a line about either would be a bot inventing a fact
 *      about a real person. Once a bot is caught being wrong about you, every other
 *      thing it says becomes noise — this is the assertion that protects the feature.
 *   2. SHE ONLY SPEAKS AT HER OWN TABLE. Giving all eight regulars a voice would turn a
 *      character into a notification system.
 *   3. HER LEDGER COMMITS EXACTLY ONCE PER SIT-DOWN. greet() writes "what she knew last
 *      time"; calling it from a render path would reset her memory on every move and she
 *      would notice nothing, forever, with no error.
 *   4. THE LOG CANNOT DOUBLE-COUNT. Her whole head-to-head is derived from it.
 *
 *   node tests/auston.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-auston.js'), 'utf8');
const ROOM = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

/* A world she can live in: one localStorage, one profile she may or may not be allowed
   to see, and a bench that matches the real one. */
function world(profile) {
  const store = {};
  const localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
  const win = {
    localStorage,
    PJCC: {
      getProfile: () => profile,
      puzzleRating: () => ({ rating: (profile && profile.puzzle_rating) || 700, solved: 0 })
    },
    PJCCParkBots: {
      maxwell: { name: 'Maxwell' }, crockett: { name: 'Crockett' }, argus: { name: 'Argus' },
      auston: { name: 'Auston' }, dad: { name: 'The Dad' }, robert: { name: 'Robert' },
      princess: { name: 'Princess' }, ceo: { name: 'The CEO' }
    }
  };
  new Function('window', 'localStorage', SRC)(win, localStorage);
  return { A: win.PJCCAuston, store, win, profile };
}

console.log('\n── AUSTON ────────────────────────────────────────────────\n');

/* ── 1. SHE ONLY SPEAKS AT HER OWN TABLE ─────────────────────────────────────────── */
{
  const { A } = world(null);
  check('she answers for her own seat', A.speaks('auston') === true);
  const others = ['maxwell', 'crockett', 'argus', 'dad', 'robert', 'princess', 'ceo'];
  check('…and for nobody else on the bench', others.every(id => A.speaks(id) === false),
    others.join(' · ') + ' all stay silent');
  check('…so greeting another regular returns nothing at all',
    others.every(id => A.greet(id) === null && A.farewell(id) === null));
}

/* ── 2. THE FIRST MEETING ────────────────────────────────────────────────────────── */
{
  const { A, store } = world(null);
  const g = A.greet('auston');
  check('a stranger gets the first-meeting line', !!g && g.kind === 'first', g && g.kind);
  check('…and it is a real sentence, with no {tokens} left in it',
    !!g && g.text.length > 20 && !/\{\w+\}/.test(g.text), g && '"' + g.text.slice(0, 58) + '…"');
  check('…and sitting down wrote her ledger', !!store['pjcc.auston.v1']);
}

/* ── 3. ⚠ SIGNED OUT, SHE NEVER MENTIONS MONEY OR RATING ─────────────────────────── */
{
  const { A } = world(null);                       // no profile at all
  A.greet('auston');
  for (let i = 0; i < 6; i++) A.logGame({ bot: 'auston', result: '0-1', plies: 40, reason: 'checkmate' });
  const kinds = new Set();
  for (let i = 0; i < 60; i++) {
    const g = A.greet('auston');
    if (g) kinds.add(g.kind);
  }
  const money = [...kinds].filter(k => /credits|rating|puzzle|shopping/.test(k));
  check('SIGNED OUT: not one line about credits, rating or the shop', money.length === 0,
    money.length ? money.join(', ') : 'over 60 greetings she stayed inside what she can see');
  check('…but she still has plenty to say', kinds.size >= 2, [...kinds].join(' · '));
}

/* ── 4. THE CREDIT LINE — the one he asked for by name ───────────────────────────── */
{
  const prof = { credits: 4000, pjcc_rating: 900, puzzle_rating: 700, companion: { owned: [] } };
  const { A } = world(prof);
  A.greet('auston');                                // she learns you had 4,000
  A.logGame({ bot: 'auston', result: '0-1', plies: 30, reason: 'checkmate' });

  prof.credits = 900;                               // …a shopping spree, or the altar
  let hit = null;
  for (let i = 0; i < 40 && !hit; i++) { const g = A.greet('auston'); if (/credits_down/.test(g.kind)) hit = g; }
  check('a big drop is noticed', !!hit, hit && hit.kind);
  check('…and she quotes BOTH real numbers, not one of them',
    !!hit && hit.text.includes('4,000') && hit.text.includes('900'),
    hit && '"' + hit.text + '"');
  /* ⚠ THE HONESTY ASSERTION. She saw the balance move; she did NOT see where it went.
     Asserting a cause would be a guess a player can catch her out on, so the line has to
     ASK. This is the difference between a bot that feels observant and one that feels
     wrong about you. */
  check('…and she ASKS why rather than claiming to know', !!hit && /\?/.test(hit.text),
    'sacrifice or spree — the number is all she has');

  prof.credits = 9000;                              // …and back up again
  let up = null;
  for (let i = 0; i < 40 && !up; i++) { const g = A.greet('auston'); if (/credits_up/.test(g.kind)) up = g; }
  check('a big gain is noticed too', !!up, up && '"' + up.text + '"');
}

/* ── 5. THE OTHER OPPONENTS — "it knows what happened in other games" ────────────── */
{
  const { A, store } = world(null);
  A.greet('auston');
  store['pjcc.pt.beaten.v1'] = JSON.stringify([]);
  A.logGame({ bot: 'auston', result: '0-1', plies: 30, reason: 'checkmate' });
  A.greet('auston');
  // now go and beat Robert somewhere else on the bench
  store['pjcc.pt.beaten.v1'] = JSON.stringify(['robert']);
  A.logGame({ bot: 'robert', result: '1-0', plies: 52, reason: 'checkmate' });

  let seen = null;
  for (let i = 0; i < 40 && !seen; i++) { const g = A.greet('auston'); if (/unlocked|beat_someone/.test(g.kind)) seen = g; }
  check('she hears about a win at somebody ELSE\'s table', !!seen, seen && seen.kind);
  check('…and names them, from the room\'s roster rather than her own copy',
    !!seen && seen.text.includes('Robert'), seen && '"' + seen.text + '"');
}

/* ── 6. THE HEAD-TO-HEAD IS DERIVED, AND CANNOT DOUBLE-COUNT ─────────────────────── */
{
  const { A } = world(null);
  for (let i = 0; i < 4; i++) A.logGame({ bot: 'auston', result: '1-0', plies: 40, reason: 'checkmate' });
  A.logGame({ bot: 'robert', result: '0-1', plies: 20, reason: 'checkmate' });
  const d = A.debug();
  check('her record counts only games against HER', d.vs.games === 4 && d.vs.w === 4,
    `${d.vs.w}W ${d.vs.l}L ${d.vs.d}D over ${d.vs.games}`);
  check('…and the streak runs from the newest game back', d.vs.streak === 4, d.vs.streak);
  /* a malformed entry must be dropped, not stored — a log is written on every game and a
     single bad row would skew every count she derives from it */
  A.logGame({ bot: null, result: '1-0' });
  A.logGame({ result: '1-0' });
  check('…and a malformed game is refused rather than logged', A.debug().log.length === 5);
}

/* ── 7. SHE DOES NOT REPEAT HERSELF ──────────────────────────────────────────────── */
{
  const prof = { credits: 5000, pjcc_rating: 900, puzzle_rating: 700, companion: { owned: [] } };
  const { A } = world(prof);
  A.greet('auston');
  A.logGame({ bot: 'auston', result: '0-1', plies: 30, reason: 'checkmate' });
  // hold the world completely still: the SAME observation stays true every time
  const kinds = [];
  for (let i = 0; i < 6; i++) { prof.credits -= 900; kinds.push(A.greet('auston').kind); }
  const runs = kinds.filter((k, i) => i > 0 && k === kinds[i - 1]).length;
  check('a still-true observation is not repeated back to back', runs === 0, kinds.join(' → '));
}

/* ── 8. EVERY LINE IN THE TABLE IS SHIPPABLE ─────────────────────────────────────── */
{
  const { A } = world(null);
  const bad = [];
  Object.keys(A.LINES).forEach(kind => {
    A.LINES[kind].forEach(text => {
      if (!/[.!?…]$/.test(text.trim())) bad.push(kind + ': no end punctuation');
      if (text.length > 220) bad.push(kind + ': ' + text.length + ' chars — too long for one bubble');
      if (/\bcolour|\bfavourite|\brealise|\banalyse|\bapologise/i.test(text)) bad.push(kind + ': British spelling');
    });
  });
  check('every line ends like a sentence, fits a bubble, and is American', bad.length === 0,
    bad.length ? bad.join(' | ') : Object.keys(A.LINES).length + ' kinds, ' +
      Object.values(A.LINES).reduce((n, a) => n + a.length, 0) + ' lines');
  /* ⚠ A TOKEN THAT IS NEVER FILLED SHIPS AS LITERAL "{n}" TO A PLAYER. The renderer
     leaves unknown tokens alone on purpose (better a brace than the word "undefined"),
     which means nothing at runtime would ever complain — so the table is checked here. */
  /* ⭐ DERIVED FROM THE OBSERVER, NOT RETYPED. This was a hand-kept allowlist until
     adding {you} made it wrong — a list copied from a source it does not read is a list
     that goes stale silently ([[dead-game-links-trap]]). Every token the observer can
     supply is a key in an `add(kind, weight, {…})` data object, so read them from there. */
  /* ⚠ kind and weight can both be TERNARIES (`add(open ? 'a' : 'b', open ? 880 : 700, …)`),
     so this may not assume `add('name', 123,` — it reads to the data object on the line. */
  const known = [...new Set(
    // ⚠ many add() calls trail an `if` on the same line, so this cannot anchor at ^;
    //   it drops the declaration line instead, whose params would add kind/weight/data.
    [...SRC.split('\n').filter((l) => !/function add\(/.test(l)).join('\n')
        .matchAll(/\badd\([^\n]*?\{([^}]*)\}/g)]
      .flatMap((m) => [...m[1].matchAll(/(\w+)\s*:/g)].map((k) => k[1])))];
  const stray = [];
  Object.keys(A.LINES).forEach(kind => A.LINES[kind].forEach(t => {
    (t.match(/\{(\w+)\}/g) || []).forEach(tok => {
      const name = tok.slice(1, -1);
      if (known.indexOf(name) < 0) stray.push(kind + ' uses ' + tok);
    });
  }));
  check('…and uses no token the observer never supplies', stray.length === 0,
    stray.length ? stray.join(', ') : known.map(k => '{' + k + '}').join(' '));
  check('every observation kind the observer can emit has words for it',
    (() => {
      const kinds = (SRC.match(/add\('(\w+)'/g) || []).map(m => m.slice(5, -1));
      const missing = kinds.filter(k => !A.LINES[k]);
      return missing.length === 0;
    })(), 'an observation with no line would fall through to silence');
}

/* ── 9. THE ROOM WIRES IT THE ONLY WAY THAT WORKS ────────────────────────────────── */
{
  /* ⚠⚠ THE ONE THAT WOULD DESTROY THE FEATURE SILENTLY. greet() commits her ledger, so
     it belongs in botStart (sitting down) and must NEVER be called from botRender (every
     move). If it moves, she resets her memory to "now" on move one and notices nothing
     ever again — with no error, no crash, and a bot that just seems boring. */
  /* ⚠⚠ SLICED BETWEEN NAMED FUNCTIONS, NOT BY A LAZY BRACE MATCH. Both windows here
     used to be `function foo(){[\\s\\S]*?\\n  }` — a non-greedy run to the first two-space
     closing brace. Two things were wrong with that and one of them bit on 2026-08-18:
       ⚠ it pins the SIGNATURE, so adding a parameter (`botStart(id, side)`, the side
         picker) made the window empty and the check reported "botStart not found" while the
         invariant it names was untouched;
       ⚠ worse, an EMPTY window silently PASSES the negative check above it. "greet() is
         not called from the render path" is trivially true of a zero-length string, so the
         one assertion here that would destroy the feature silently could itself fail
         silently. A gate whose failure mode is a false green is worse than no gate.
     Sliced by the next function's name instead, and both windows are asserted non-empty. */
  const slice = (from, to) => {
    const a = ROOM.indexOf('function ' + from + '(');
    const b = ROOM.indexOf('function ' + to + '(');
    return (a > -1 && b > a) ? ROOM.slice(a, b) : '';
  };
  const render = slice('botRender', 'botTap');
  const start = slice('botStart', 'markWin');
  check('the harness can actually see both functions it is about to judge',
    render.length > 400 && start.length > 400,
    'botRender ' + render.length + ' chars · botStart ' + start.length + ' chars');
  check('greet() is NOT called from the render path', render.indexOf('PJCCAuston.greet') === -1,
    'it would reset her memory on every move');
  check('…it is called from botStart, where sitting down happens',
    /PJCCAuston\.speaks\(id\)/.test(start) && /botSay = PJCCAuston\.greet\(id\)/.test(start),
    start ? 'found in botStart (' + start.length + ' chars)' : 'botStart not found');
  check('…and only on a board with no moves on it',
    /!saved\.done && !\(saved\.moves \|\| ''\)\.trim\(\)/.test(ROOM), 'a resumed game is not a hello');
  /* ⚠ WINDOWED ON THE FUNCTION, NOT ON A CHARACTER COUNT. The original form allowed 700
     characters between `botFinish` and its `logFinished` call, and a comment added inside
     that function in 2026-08-17 pushed it past the limit — a passing test turning red
     because prose grew. Anchored to the closing brace instead, so it measures the thing
     it is actually about: the call is inside this function. */
  /* ⛑ RE-AIMED 2026-08-20, and the new form is strictly stronger. The old one looked for a
     `logFinished` call inside botFinish AND a second one near the resignation handler —
     which is to say it enumerated the endings by hand, and would have gone quietly green
     the day a THIRD ending was added. A clock was added that same day, and a flag is
     exactly such an ending.
     ⚠⚠ SO ASK THE STRUCTURAL QUESTION INSTEAD: there is ONE place a bot game is declared
     over (`st.done = 1`), it lives in botFinishAs, and that function logs. Any future
     ending has to come through it or it is not an ending at all. */
  const botFinishFn = (ROOM.match(/function botFinishAs\(st, result, reason\)\{[\s\S]*?\n  \}/) || [''])[0];
  check('every finished game is logged, resignations and flags included',
    /logFinished\(st,/.test(botFinishFn) &&
    (ROOM.match(/st\.done = 1;/g) || []).length === 1 &&
    (ROOM.match(/(?<!function )botFinishAs\(st,/g) || []).length >= 3,
    'one ending, ' + (ROOM.match(/(?<!function )botFinishAs\(st,/g) || []).length +
      ' ways to reach it — a board result, a flag, a resignation');
  check('…exactly once, guarded on the SAVED state so a refresh cannot re-log it',
    /if \(!st \|\| st\.logged\) return;\s*\n\s*st\.logged = 1; botSave\(st\);/.test(ROOM));
  check('the room publishes its bench instead of her keeping a second copy',
    /window\.PJCCParkBots = BOTS;/.test(ROOM));
  check('every call into her is wrapped, so a missing file cannot break the bench',
    (ROOM.match(/PJCCAuston\./g) || []).length >= 4 &&
    /try \{\s*if \(window\.PJCCAuston/.test(ROOM));
  check('the page actually loads the file',
    /pjcc-auston\.js/.test(ROOM), 'an optional dependency fails SILENTLY — check the tag, not the logic');
  check('her line is rendered above the board, and is not a chat box',
    /class="pt-note/.test(ROOM) && /pt-note-t/.test(ROOM));
  /* ⚠⚠ SHE MUST NOT SHARE A CLASS WITH THE EMOTE STRIP. `.pt-say` belongs to the line a
     live opponent's emote prints; naming her note the same thing made the older rule
     override her margin while every emote inherited her warm panel — one collision, two
     wrong pictures, nothing thrown. Her block must not reach for the emote's name. */
  // her note's markup may not mention the emote's class, and vice versa
  const herMarkup = (ROOM.match(/'<div class="pt-note[\s\S]{0,320}?<\/div>'/) || [''])[0];
  const emoteMarkup = (ROOM.match(/say = '<div class="pt-say[^;]*;/) || [''])[0];
  check('…under a class the emote strip does not already own',
    herMarkup.length > 0 && !/pt-say/.test(herMarkup) &&
    emoteMarkup.length > 0 && !/pt-note/.test(emoteMarkup),
    'two features, two names');
  check('…and the emote line still has the rule it was already wearing',
    /^\.pt-say \{[^}]*\}/m.test(ROOM), 'renaming hers must not strip the one it collided with');

  /* ── HER CARD'S QUIET MARK ──────────────────────────────────────────────────────
     ⚠⚠ THE MARK MUST BE EARNED. If it rendered off the bot id alone it would be a badge
     every stranger sees, which is the opposite of what he asked for — the whole value is
     that it appears only to somebody she has already met. So it has to be driven by the
     LEDGER, and the guard is that `knowsYou` is in the same expression as the class. */
  check('her card can wear a mark the other seven cannot',
    /pt-bot--knows/.test(ROOM) && /\.pt-bot--knows \{/.test(ROOM));
  /* the whole block that decides how her card is drawn — guarded by speaks(), fed by the
     ledger, and never calling greet(), which commits */
  const markBlock = (ROOM.match(/var knows = false[\s\S]*?\} catch \(e\) \{\}/) || [''])[0];
  check('…and it is earned — driven by her LEDGER, not by her name being Auston',
    /PJCCAuston\.knowsYou\(\)/.test(markBlock) && /PJCCAuston\.speaks\(id\)/.test(markBlock),
    'a mark every stranger can see is a badge, not a discovery');
  check('…read-only, because this runs on every render',
    markBlock.length > 0 && !/\bgreet\(/.test(markBlock),
    'greet() COMMITS the ledger — it must never touch a render path');
  check('…and wrapped, so an unloaded file cannot take the bench down',
    /^\s*try \{$/m.test(markBlock.split('\n')[1] || '') || /try \{/.test(markBlock));
  check('knowsYou() answers yes/no and nothing about what she remembers',
    /knowsYou: function \(\) \{\s*try \{ return !!readJSON\(LEDGER_KEY, null\); \}/.test(SRC),
    'what she knows is hers to say out loud');
  /* it quotes the note's amber rather than inventing a color — one warm edge, two places.
     ⚑ RE-AIMED 2026-08-17: the note became a figurine plus a balloon, so the amber moved
     off `.pt-note` itself and onto the two parts that are actually warm. The assertion is
     unchanged in spirit — her lamp and her voice share one color — and now names the
     selectors that carry it rather than a byte offset into the file. */
  check('…in the same amber as the note she speaks',
    /\.pt-bot--knows \{[\s\S]{0,160}#ffb43a/.test(ROOM) &&
    /\.pt-note-who \{[\s\S]{0,200}#ffb43a/.test(ROOM) &&
    /\.pt-note-bub \{[\s\S]{0,260}255,180,58/.test(ROOM));

  /* ── SHE IS SOMETIMES ELSEWHERE ──────────────────────────────────────────────────
     ⚠⚠ THIS IS THE ONE FEATURE HERE THAT CAN TAKE SOMETHING AWAY FROM A PLAYER, so its
     guards are the ones worth pinning. Each check below is a bug that would otherwise
     be invisible until somebody lost access to a game they were in the middle of. */
  check('her seat can be empty for a day', /pt-bot--away/.test(ROOM) && /awayToday/.test(SRC));
  check('…rolled off the TOWN DATE, never per page load',
    /daySeed\(T\.parts\(\)\.ds \+ '#auston'\)/.test(SRC),
    'a refresh must not reroll her, and the whole town agrees about today');
  check('…with a SALTED seed, so it is not just the rainy days',
    /'#auston'/.test(SRC), 'the unsalted seed is the weather’s');
  check('…and an unfinished game outranks it',
    /function awayToday\(hasSavedGame\) \{\s*if \(hasSavedGame\) return false;/.test(SRC),
    'nobody is shut out of a board they already started');
  check('…and a missing clock leaves her PRESENT',
    /if \(!T \|\| !T\.daySeed \|\| !T\.parts\) return false;/.test(SRC),
    'an optional dependency that failed to load must never close a seat');
  check('the ROOM honors it at the card AND at the door',
    /pt-bot--away/.test(ROOM) && /PJCCAuston\.awayToday\(!!mine\)/.test(ROOM),
    '?table=auston is a real bookmark — the card alone would miss exactly the person who kept it');
  check('…and the away card is not dressed as a LOCKED one',
    !/pt-bot--away[\s\S]{0,240}border-style: dashed/.test(ROOM),
    'a lock is something unearned; this is somebody having a Tuesday');
  check('she notices you came by while she was out',
    /add\('was_away', 950\)/.test(SRC) && /noteAway/.test(ROOM));
  check('…one note per town day, not one per render',
    /if \(!d \|\| missedDay\(\) === d\) return;/.test(SRC), 'five visits in an afternoon is one missed visit');
  check('…and the note is SPENT when she says it',
    /localStorage\.removeItem\(MISS_KEY\)/.test(SRC), 'or she thanks you for it forever');

  /* ── YOUR NAME, AND THE GLYPH ────────────────────────────────────────────────── */
  check('she is the only seat that uses your codename',
    /by_name/.test(SRC) && /\{you\}/.test(SRC));
  check('…and never invents one when you are signed out',
    /return n \|\| null;/.test(SRC) && /if \(now\.you\) add\('by_name'/.test(SRC),
    'no fallback nickname — that is the opposite of the effect');
  check('her glyph turns over on a milestone',
    /milestone: function \(\) \{ return vsHer\(\)\.games >= MILESTONE; \}/.test(SRC),
    'counted off the log, never a stored tally');
  /* ⭐ ♘→♞ is the ONE pair that renders as two different pictures — ♖/♜, ♗/♝, ♕/♛, ♙/♟
     are indistinguishable at card size, measured when the eighth seat went in. */
  check('…to the solid knight, the one variant that actually reads',
    /&#9822;&#xFE0E;/.test(ROOM), '♞ with a text-presentation selector so color reaches it');
}

/* ══ SHE SPEAKS DURING THE GAME (2026-08-17) ═══════════════════════════════════════
   Nate: *"it would be nice if she said maybe 2 or 3 things mid-game as well."*

   The expensive mistakes here are different from the greeting's, and there are two:

     1. ⚠⚠ SHE MUST NOT BECOME A COACH. Not one mid-game line may carry information about
        the POSITION. An opponent who reacts to the move you just played is an engine hint
        with a friendly face, and it silently turns every game at her table into assisted
        play that nobody asked for or consented to. Every trigger must be a STREAK.
     2. ⚠⚠ THE RENDER PATH MUST NOT BE ABLE TO BURN HER LINES. botRender() runs on every
        tap of a square. If midGame() were called from there, picking a piece up and
        putting it down four times would spend all three of her lines on nothing. This is
        the same defect greet() is already guarded against, in a new place.
   ═══════════════════════════════════════════════════════════════════════════════════ */
{
  const { A } = world(null);

  check('mid-game lines are hers alone',
    ['maxwell', 'robert', 'ceo'].every(id => A.midGame(id, { ply: 30, win: 80 }) === null));

  /* ── the cap and the gap ─────────────────────────────────────────────────────── */
  {
    const { A } = world(null);
    A.newGame();
    const said = [];
    // a long game she has every reason to comment on: winning, climbing, an endgame
    for (let ply = 1; ply <= 120; ply++) {
      const got = A.midGame('auston', { ply, win: 78, level: 1500, seed: 1200, pieces: 10 });
      if (got) said.push({ ply, kind: got.kind });
    }
    check('she says at most three things in a game', said.length <= A.MID_CAP,
      said.length + ' of a possible ' + A.MID_CAP + ' — ' + said.map(s => s.kind).join(' · '));
    check('…and she does say SOMETHING when there is plenty to notice', said.length >= 2,
      said.map(s => '@' + s.ply).join(' '));
    const gaps = said.slice(1).map((s, i) => s.ply - said[i].ply);
    check('…never twice inside MID_GAP plies', gaps.every(g => g >= A.MID_GAP),
      gaps.length ? 'gaps: ' + gaps.join(', ') : 'only one line');
    check('…and never the same observation twice',
      new Set(said.map(s => s.kind)).size === said.length, said.map(s => s.kind).join(' · '));
  }

  /* ── ⚠ A NEW GAME REFILLS THEM; A RE-RENDER DOES NOT ─────────────────────────── */
  {
    const { A } = world(null);
    A.newGame();
    let first = 0;
    for (let ply = 1; ply <= 120; ply++) if (A.midGame('auston', { ply, win: 78, level: 1500, seed: 1200, pieces: 10 })) first++;
    A.newGame();
    let second = 0;
    for (let ply = 1; ply <= 120; ply++) if (A.midGame('auston', { ply, win: 78, level: 1500, seed: 1200, pieces: 10 })) second++;
    check('sitting down again refills her mid-game lines', first > 0 && second === first,
      first + ' then ' + second);
  }

  /* ── ⚠ SHE SAYS NOTHING SHE CANNOT SUPPORT ───────────────────────────────────── */
  {
    const { A } = world(null);
    A.newGame();
    let any = null;
    for (let ply = 1; ply <= 200; ply++) {
      const got = A.midGame('auston', { ply });        // no win%, no level, no piece count
      if (got) { any = got; break; }
    }
    check('with nothing measured she says nothing at all', any === null,
      'no win%, no level, no material — 200 plies of silence');
  }

  /* ── ⚠ A DEAD-LEVEL GAME IS NOT A LANDSLIDE ──────────────────────────────────── */
  {
    const { A } = world(null);
    A.newGame();
    const kinds = [];
    for (let ply = 1; ply <= 120; ply++) {
      const got = A.midGame('auston', { ply, win: 50, level: 1200, seed: 1200, pieces: 28 });
      if (got) kinds.push(got.kind);
    }
    check('a level game never produces an "ahead" or "behind" line',
      !kinds.some(k => k === 'mid_ahead' || k === 'mid_behind'),
      kinds.length ? kinds.join(' · ') : 'she stayed quiet');
  }

  /* ── ⚠⚠ THE ASSISTANCE RULE, ENFORCED ON THE WORDS THEMSELVES ────────────────── */
  {
    const { A } = world(null);
    const mids = Object.keys(A.LINES).filter(k => k.indexOf('mid_') === 0);
    check('there IS a mid-game set', mids.length >= 3, mids.join(' · '));
    const all = mids.reduce((acc, k) => acc.concat(A.LINES[k]), []).join(' ').toLowerCase();
    /* Words that would mean she is describing the position rather than the game.
       ⚠ If a new line legitimately needs one of these, the RULE is what has to be
       re-argued — not this list quietly extended. */
    const tells = ['blunder', 'hang', 'hung', 'mistake', 'careful', 'watch out',
                   'your queen', 'your rook', 'check', 'fork', 'threat', 'attack'];
    const leaked = tells.filter(w => all.indexOf(w) > -1);
    check('⚠ not one mid-game line describes the POSITION', leaked.length === 0,
      leaked.length ? 'LEAKED: ' + leaked.join(', ') : tells.length + ' coaching tells, none present');
  }

  /* ── the room wires it in the one safe place ─────────────────────────────────── */
  check('⚠⚠ midGame is called from botThink, NOT from the render path',
    /PJCCAuston\.midGame\(/.test(ROOM) && !/botRender[\s\S]{0,400}PJCCAuston\.midGame\(/.test(ROOM),
    'botRender runs on every tap — asking there would spend her lines on a piece being picked up');
  check('…and never over a finished board', /if \(!g\.result && window\.PJCCAuston/.test(ROOM),
    'that is the farewell’s moment; two of her talking at once is neither');
  check('the room refills her lines when you sit down',
    /PJCCAuston\.newGame\(\)/.test(ROOM));
}

/* ══ THE FIGURINE ══════════════════════════════════════════════════════════════════ */
{
  const { A, win } = world(null);
  check('without the art module she has no face, rather than a broken one',
    A.face() === null, 'the room then draws her ♘, which is what it drew before');
  win.PJCCFaceArt = { svg: o => '<svg data-hair="' + o.hair + '"></svg>' };
  const f = A.face();
  check('with it, she is drawn by the SAME code that draws the player',
    typeof f === 'string' && f.indexOf('<svg') === 0, f);
  /* ⭐ Her character file commits to exactly one detail about her appearance — Nate
     "braiding hair" — so it is the one this look is not free to change. */
  check('…wearing the one thing canon actually said about her', /braids/.test(f), A.LOOK.hair);
  check('the room falls back to the glyph, not to a hole',
    /\(face \|\| bot\.icon\)/.test(ROOM));
}

/* ══ SHE PLAYS AT YOUR LEVEL ═══════════════════════════════════════════════════════ */
{
  check('her seat is the adaptive one', /adaptive: true/.test(ROOM));
  check('⚠ strength still has exactly one door', /function botDial\(b, st, S\)\{[\s\S]{0,220}botElo\(b\)/.test(ROOM),
    'an adaptive seat that bypassed botDial would be a second source of truth about difficulty');
  check('⚠ her card does NOT advertise a fixed rating',
    /finds your level/.test(ROOM) && /b\.adaptive/.test(ROOM),
    'the house law is that a visible number keeps a difficulty honest — hers moves, so it cannot be fixed');
  check('…and her nameplate prints what she is playing at RIGHT NOW',
    /botElo\(bot\) \+ ' · '/.test(ROOM));
  check('a missing pjcc-adapt.js makes her a fixed 1200 again',
    /if \(!b\.adaptive\) return b\.elo;/.test(ROOM) && /\|\| b\.elo;/.test(ROOM),
    'never a silent 400 and never a silent 2400');
  check('the review is told where she SETTLED, not what she was seeded at',
    /botAdapt\.settled\(\)/.test(ROOM));
  check('…and a rematch starts from there too', /saveAdaptSeed\(st\.bot, botAdapt\.settled\(\)\)/.test(ROOM));
  check('⚠ the seed is written at game END only',
    !/botSave\(st\)[\s\S]{0,80}saveAdaptSeed/.test(ROOM),
    'per-move would let an abandoned losing game re-seed her low forever');
}

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
