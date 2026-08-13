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
  const known = ['now', 'was', 'n', 'who', 'days', 'games'];
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
  const render = (ROOM.match(/function botRender\(\)\{[\s\S]*?\n  \}/) || [''])[0];
  check('greet() is NOT called from the render path', render.indexOf('PJCCAuston.greet') === -1,
    'it would reset her memory on every move');
  const start = (ROOM.match(/function botStart\(id\)\{[\s\S]*?\n  \}/) || [''])[0];
  check('…it is called from botStart, where sitting down happens',
    /PJCCAuston\.speaks\(id\)/.test(start) && /botSay = PJCCAuston\.greet\(id\)/.test(start),
    start ? 'found in botStart (' + start.length + ' chars)' : 'botStart not found');
  check('…and only on a board with no moves on it',
    /!saved\.done && !\(saved\.moves \|\| ''\)\.trim\(\)/.test(ROOM), 'a resumed game is not a hello');
  check('every finished game is logged, resignations included',
    /function botFinish[\s\S]{0,700}logFinished\(st,/.test(ROOM) &&
    /reason = 'resignation'[\s\S]{0,300}logFinished\(st,/.test(ROOM));
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
  const markLine = (ROOM.match(/^.*knows = !!.*$/m) || [''])[0];   // the assignment, not `var knows = false`
  check('…and it is earned — driven by her LEDGER, not by her name being Auston',
    /PJCCAuston\.knowsYou\(\)/.test(markLine) && /PJCCAuston\.speaks\(id\)/.test(markLine),
    'a mark every stranger can see is a badge, not a discovery');
  check('…read-only, because this runs on every render',
    !/greet\(/.test(markLine), 'greet() COMMITS the ledger — it must never touch a render path');
  check('…and wrapped, so an unloaded file cannot take the bench down',
    /try \{ knows = /.test(ROOM));
  check('knowsYou() answers yes/no and nothing about what she remembers',
    /knowsYou: function \(\) \{\s*try \{ return !!readJSON\(LEDGER_KEY, null\); \}/.test(SRC),
    'what she knows is hers to say out loud');
  /* it quotes the note's amber rather than inventing a color — one warm edge, two places */
  check('…in the same amber as the note she speaks',
    /\.pt-bot--knows \{[\s\S]{0,160}#ffb43a/.test(ROOM) && /\.pt-note \{[\s\S]{0,200}#ffb43a/.test(ROOM));
}

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
