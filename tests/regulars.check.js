#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   THE REGULARS — _data/regulars.yml vs the REAL bench

   The front door says how many regulars are at the tables. That number is DERIVED from
   `_data/regulars.yml`, and this gate is the only reason the data file is allowed to exist:
   it reads the actual `BOTS` object out of games/park-tables/index.html and fails if the two
   disagree. Without it the site would carry a THIRD hand-typed copy of the bench (the game,
   /rating/, and now the front door) — which is precisely the trap [[dead-game-links-trap]]
   describes, and the one that has already produced a wrong count on this site once.

   ⚠ The source of truth is BOTS. If this fails, fix the YAML, not the game.

   No YAML dependency: the data file is a flat list of scalar keys and a six-line parser is
   cheaper and more predictable than adding js-yaml for one file. If regulars.yml ever grows
   nested structure, this parser must grow with it — it throws rather than guessing.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TABLES = path.join(ROOT, 'games/park-tables/index.html');
const DATA = path.join(ROOT, '_data/regulars.yml');
const FRONT = path.join(ROOT, 'index.md');

const results = [];
function check(label, pass, detail) { results.push({ label, pass: !!pass, detail: detail || '' }); }

/* ── the bench, out of the game ─────────────────────────────────────────────────────── */
const tablesSrc = fs.readFileSync(TABLES, 'utf8');
const start = tablesSrc.indexOf('var BOTS = {');
if (start < 0) throw new Error('regulars.check: `var BOTS = {` not found — the roster moved');
const end = tablesSrc.indexOf('\n  };', start);
if (end < 0) throw new Error('regulars.check: could not find the end of the BOTS object');
const botsBlock = tablesSrc.slice(start, end);

const bots = [];
const entry = /(\w+):\s*\{([^}]*)\}/g;
let m;
while ((m = entry.exec(botsBlock)) !== null) {
  const body = m[2];
  const name = /name:\s*'([^']*)'/.exec(body);
  const elo = /elo:\s*(\d+)/.exec(body);
  /* icon added 2026-08-18 — the front door DRAWS the bench now, so the glyph is a third
     thing that can disagree with the game, and an unchecked copy is the whole reason this
     gate exists. */
  const icon = /icon:\s*'([^']*)'/.exec(body);
  const aura = /aura:\s*'([^']*)'/.exec(body);
  bots.push({
    key: m[1],
    name: name ? name[1] : null,
    elo: elo ? +elo[1] : null,
    icon: icon ? icon[1] : null,
    aura: aura ? aura[1] : null,
    /* ⚑ 2026-08-19 — the adaptive seat. It is a FOURTH thing that can disagree between the
       game and the data file, and the disagreement is silent AND wrong in the worst
       direction: if the YAML forgets the flag, the front door prints Auston's seed as a
       rating. That number is invisible everywhere else on purpose. */
    adaptive: /adaptive:\s*true/.test(body),
    open: !/locked:/.test(body)
  });
}

/* ── the data file ──────────────────────────────────────────────────────────────────── */
const yml = fs.readFileSync(DATA, 'utf8');
const rows = [];
for (const raw of yml.split(/\r?\n/)) {
  const line = raw.replace(/#.*$/, '').trimEnd();
  if (!line.trim()) continue;
  const item = /^-\s+(\w+):\s*(.+)$/.exec(line);
  const pair = /^\s+(\w+):\s*(.+)$/.exec(line);
  if (item) { rows.push({}); addPair(rows[rows.length - 1], item[1], item[2]); }
  else if (pair) {
    if (!rows.length) throw new Error('regulars.check: a key before any list item — the parser cannot read this file');
    addPair(rows[rows.length - 1], pair[1], pair[2]);
  } else if (line.trim() !== '---') {
    throw new Error('regulars.check: line the tiny parser cannot read: ' + JSON.stringify(line));
  }
}
function addPair(o, k, v) {
  v = v.trim();
  if (v === 'true') o[k] = true;
  else if (v === 'false') o[k] = false;
  else if (/^-?\d+$/.test(v)) o[k] = +v;
  else o[k] = v.replace(/^['"]|['"]$/g, '');
}

/* ── the comparison ─────────────────────────────────────────────────────────────────── */
check('the bench was found in the game', bots.length > 0, bots.length + ' seats in BOTS');
check('the data file has a row for every seat', rows.length === bots.length,
      'game ' + bots.length + ' · data ' + rows.length);
check('the seats are in the same order', rows.map(r => r.key).join() === bots.map(b => b.key).join(),
      rows.map(r => r.key).join(' · '));

for (let i = 0; i < Math.max(bots.length, rows.length); i++) {
  const b = bots[i], r = rows[i];
  if (!b || !r) { check('seat ' + (i + 1) + ' exists on both sides', false, 'missing'); continue; }
  check('· ' + b.key + ' — name', r.name === b.name, r.name + ' vs ' + b.name);
  check('· ' + b.key + ' — rating', r.elo === b.elo, r.elo + ' vs ' + b.elo);
  check('· ' + b.key + ' — icon', r.icon === b.icon, r.icon + ' vs ' + b.icon);
  check('· ' + b.key + ' — ' + (b.open ? 'open' : 'locked'), r.open === b.open,
        'data says ' + (r.open ? 'open' : 'locked') + ', the game says ' + (b.open ? 'open' : 'locked'));
  check('· ' + b.key + ' — ' + (b.adaptive ? 'adaptive' : 'a fixed rung'), !!r.adaptive === b.adaptive,
        'data says ' + (r.adaptive ? 'adaptive' : 'fixed') + ', the game says ' + (b.adaptive ? 'adaptive' : 'fixed'));
}

const openGame = bots.filter(b => b.open).length;
const openData = rows.filter(r => r.open).length;
check('the OPEN count agrees — this is the number the front door prints',
      openGame === openData && openGame > 0, openGame + ' seats playable with no account');

/* ── and the front door must DERIVE it, not type it ─────────────────────────────────── */
const front = fs.readFileSync(FRONT, 'utf8');
check('the front door filters the data file for open seats',
      /site\.data\.regulars\s*\|\s*where:\s*"open",\s*true/.test(front));
/* ⚑ 2026-08-18 — THE COUNT IS NO LONGER A SENTENCE, SO THIS GATE CHANGED SHAPE.
   It used to require the green door to PRINT `{{ open_seats | size }} regulars are at the
   tables`. Nate cut that sub-label ("the Play Now doesn't NEED the '6 regulars' description")
   and the bench under it draws one cell per open seat instead — so the claim is still derived
   from the same list, it is just SHOWN rather than said. What has to be true now is that the
   bench iterates `open_seats` and not the whole roster: looping `site.data.regulars` would put
   the two locked rungs back on the front door, which is exactly the state that had the page
   counting six and drawing eight. */
check('the bench iterates the OPEN seats, not the whole roster',
      /\{%-?\s*for r in open_seats\s*-?%\}/.test(front),
      'looping site.data.regulars here would draw the locked rungs and disagree with the count');
/* ══ THE ADAPTIVE SEAT PRINTS A WORD, NOT ITS SEED (2026-08-19) ═══════════════════════
   Nate: "they are not necessarily 1200 but completely adaptive." Auston's `elo` survives in
   BOTS and therefore in this data file, because it is the dial's STARTING POINT and the gate
   above compares every field — but it is not a rating and no surface may render it as one.
   ⚠ THE FAILURE IS SILENT AND FLATTERINGLY WRONG: drop the `{% if r.adaptive %}` and the
   front door quietly advertises a strength she will never play at, on the one seat whose
   entire premise is that it has no fixed strength. */
{
  const adaptiveSeats = bots.filter(b => b.adaptive);
  check('the bench has exactly one adaptive seat', adaptiveSeats.length === 1,
        adaptiveSeats.map(b => b.name).join(', ') || 'none');
  check('…and the front door branches on it instead of printing its rating',
        /\{%\s*if r\.adaptive\s*%\}Adapts to your level\{%\s*else\s*%\}\{\{\s*r\.elo\s*\}\}\{%\s*endif\s*%\}/.test(front),
        'the seed is not a rating and must never be drawn as one');
  check('…and its hover text does not say "rated" either',
        !/title="Sit down with \{\{ r\.name \}\} — rated/.test(front),
        'a tooltip saying "rated 1200" over a cell saying Adapts is the same lie, quieter');
}

/* ══ THE GRID MAY NOT ORPHAN A CELL (2026-08-19) ═══════════════════════════
   Seating Nate at 1200 took the bench from six to seven, and seven in a three-column grid is
   3 + 3 + 1: Auston alone in the bottom-left, reading as a leftover rather than as the one
   seat that is deliberately separate. Nothing failed — every existing check stayed green,
   because they all test the DATA and this is a fact about the LAYOUT.
   ⚠ SO THE ARITHMETIC IS THE GATE. The RATED seats must fill the columns exactly; the
   adaptive one is allowed to be the remainder ONLY because it spans the whole row. Add a rung
   and this fails the same day, instead of on the day somebody looks at the front door. */
{
  const colsM = front.match(/\.mc-bench-row\s*\{[^}]*repeat\((\d+),/);
  const cols  = colsM ? +colsM[1] : 0;
  const rated = rows.filter(r => r.open === true && !r.adaptive).length;
  check('the bench grid still declares its column count', cols > 0, cols + ' across');
  check('…and the RATED open seats fill those columns exactly',
        cols > 0 && rated % cols === 0,
        rated + ' rated seats across ' + cols + ' columns' +
        (cols && rated % cols ? ' — the last row would hold ' + (rated % cols) : ''));
  check('…and the adaptive seat spans the row instead of orphaning one',
        /\.mc-bench-seat--adapt\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/.test(front),
        'without the span it drops into a column and the row reads as a leftover');
  check('…and the front door tags that seat so the rule can reach it',
        /class="mc-bench-seat\{%\s*if r\.adaptive\s*%\}\s*mc-bench-seat--adapt/.test(front),
        'the CSS above matches nothing without the class on the <li>');
  /* ⚠⚠ DOCUMENT ORDER IS LOAD-BEARING HERE. `.mc-bench-seat--adapt > a` and `.mc-bench-seat > a`
     both score (0,2,1), so the later one wins — move this rule up and the wide row silently
     goes back to being a 62px column card. That is not hypothetical: the first candidate
     render measured "unchanged" for exactly this reason. */
  const gen = front.indexOf('.mc-bench-seat > a {');
  const ada = front.indexOf('.mc-bench-seat--adapt > a {');
  check('…and its rule sits AFTER the general seat rule, which is what makes it win',
        gen > -1 && ada > gen, 'general@' + gen + ' adaptive@' + ada);
}

check('no hand-typed seat count survives on the front door',
      !/\b(six|seven|eight|6|7|8)\s+regulars are at the tables/i.test(front),
      'a number here would go stale the day a seat is added');

/* ══ THE BENCH IS DRAWN, NOT DESCRIBED (2026-08-18) ════════════════════════════════════
   The front door shows the seats now, so three more things can go wrong quietly. */
/* ⛑ AND NO TWO WEAR THE SAME COLOR EITHER — 2026-08-19, Nate: *"Give each bot box a
   unique color, and that is their aura color for the intro."* The bench card is tinted with
   the seat's aura and the VS streak over the board is painted from the same key, so a
   REPEATED aura is two regulars who look like the same person in both places at once. There
   are twelve auras in `PJCC.AURAS` and nine seats, so uniqueness costs nothing to keep —
   which is exactly why it would go unnoticed the day somebody adds a tenth seat and reaches
   for a color that is already spoken for.

   ⚠ THIS ASKS `bots`, NOT `rows`. The aura lives in the GAME's BOTS object and nowhere
   else — `_data/regulars.yml` deliberately does not carry it, because the front door prints
   names and ratings and has no use for a color. The first version of this block read `rows`,
   found `aura: null` nine times, and reported "1 distinct colors ✓" — three of its four
   checks passed on data that was not there. [[green-must-name-what-ran]]
   ⚠ So every check below is guarded on the colors having been FOUND. A uniqueness test over
   nine nulls is unanimous and worthless. */
{
  const auras = bots.map(b => b.aura);
  const missing = bots.filter(b => !b.aura).map(b => b.key);
  const found = missing.length === 0;
  check('every regular has an aura', found,
        missing.length ? 'no aura on: ' + missing.join(', ') : auras.length + ' seats, all colored');

  const repeated = auras.filter((a, i) => a && auras.indexOf(a) !== i);
  check('no two regulars wear the same aura', found && repeated.length === 0,
        !found ? 'not asked — an aura is missing above'
               : repeated.length ? 'repeated: ' + [...new Set(repeated)].join(', ')
                                 : [...new Set(auras)].length + ' distinct colors');

  /* ⚠ `mono` IS BANNED, and it is not one of the twelve being difficult. It is the
     palette's literal "no color chosen" — the gray a stranger with no identity gets — so a
     seat wearing it reads as the one card that failed to load. The Dad wore it until today. */
  const neutral = bots.filter(b => b.aura === 'mono').map(b => b.key);
  check("…and nobody wears `mono`, the palette's \"no color chosen\"",
        found && neutral.length === 0,
        !found ? 'not asked' : neutral.join(', ') || 'every seat has a real hue');

  /* ⚠ AND THEY HAVE TO BE COLORS THE FORGE ACTUALLY OFFERS. A hand-typed hex or a
     misspelled key resolves to the neutral through `auraColor()`'s fallback — silently, and
     looking exactly like a seat that was never given a color at all. */
  const palette = /var AURAS = \{([\s\S]*?)\};/.exec(
    fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8'))[1];
  const known = [...palette.matchAll(/(\w+):\s*'#[0-9a-fA-F]{6}'/g)].map(m2 => m2[1]);
  const strangers = bots.filter(b => b.aura && !known.includes(b.aura)).map(b => b.key + ':' + b.aura);
  check('…and every one is a real key in PJCC.AURAS', found && strangers.length === 0,
        !found ? 'not asked' : strangers.join(', ') ||
          known.length + ' in the palette, ' + bots.length + ' seats drawing on it');

  /* ⛑ AND THE COLOR IS SOMETHING YOU WIN OFF THEM — 2026-08-20. Nate: *"I love the 'earn
     aura' thing. Everyone except Auston since she is adaptive."* `AURA_MEANING` in
     pjcc-profile.js names, per color, which regular you take it from; a `from` that points
     at nobody is a color that can never be unlocked, and a bench seat with no `from` is a
     color that was supposed to be a prize and is quietly free. Both are silent. */
  {
    const prof = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
    const meanSrc = (/var AURA_MEANING = \{([\s\S]*?)\};/.exec(prof) || [, ''])[1];
    const mean = {};
    [...meanSrc.matchAll(/(\w+):\s*\{[^}]*?from:\s*(?:'(\w+)'|null)/g)].forEach((m2) => { mean[m2[1]] = m2[2] || null; });
    const named = Object.keys(mean);
    check('the earn table was found and names every bench color', named.length === bots.length,
      named.length + ' named · ' + bots.length + ' seats');

    const seatKeys = bots.map((b) => b.key);
    const ghosts = named.filter((k) => mean[k] && !seatKeys.includes(mean[k])).map((k) => k + '←' + mean[k]);
    check('…and every `from` points at a real seat in BOTS', ghosts.length === 0,
      ghosts.join(', ') || 'a color nobody holds could never be unlocked');

    /* ⚠⚠ AUSTON IS THE ONE EXCEPTION AND IT IS HIS INSTRUCTION, not an omission. She is the
       ADAPTIVE seat — she meets you at your own level — so "beat Auston cleanly" is not a
       fixed feat the way beating a 1400 is, and her crimson stays free for anyone. */
    const adaptive = bots.filter((b) => b.adaptive).map((b) => b.key);
    const auraOf = {}; bots.forEach((b) => { auraOf[b.key] = b.aura; });
    const unearnable = named.filter((k) => !mean[k]);
    check('…and the ONLY color without a price is the adaptive seat\'s',
      adaptive.length === 1 && unearnable.length === 1 && unearnable[0] === auraOf[adaptive[0]],
      'free: ' + unearnable.join(', ') + '  ·  adaptive: ' + adaptive.join(', '));

    const wrong = bots.filter((b) => !b.adaptive && mean[b.aura] !== b.key)
      .map((b) => b.key + ' wears ' + b.aura + ' but it is won from ' + mean[b.aura]);
    check('…and you win each color from the seat that actually wears it', wrong.length === 0,
      wrong.join(' · ') || (bots.length - 1) + ' seats, each holding their own');
  }

  /* ⭐ AND THE CARD READS THE SAME LOOKUP THE STREAK DOES. The point of the colors is that
     the seat you tapped and the bar over the board are ONE identity; two call sites reaching
     for the same palette by different routes is how that quietly stops being true. */
  check('the bench card takes its color from PJCCVs, like the VS streak does',
        /function tint\(b\)\s*\{[\s\S]*?PJCCVs\.color\(b\.aura\)/.test(tablesSrc),
        'tint() -> PJCCVs.color(b.aura) -> the same hex applyOppAura paints the rail with');
  /* ⚠⚠ IT HAS TO BE THE BACKGROUND, NOT JUST 'somewhere near --bot'. Written first as
     "a color-mix(var(--bot)) within 400 characters of the tinted-card selector", this
     PASSED a mutation that replaced the card background with the plain surface — because the
     BORDER rule three lines down also mixes --bot and satisfied the window. The card was
     nine identical charcoal boxes with colored edges and the gate said the colors shipped. */
  const cardBg = /\[style\*="--bot"\]\s*\{[^}]*background:[^;]*var\(--bot\)/.test(tablesSrc);
  check('…and the card BACKGROUND is the thing --bot paints', /--bot:/.test(tablesSrc) && cardBg,
        cardBg ? 'the tint is the card itself, not only its edge'
               : 'the tinted-card rule no longer mixes --bot into its background');
}

const icons = rows.map(r => r.icon).filter(Boolean);
const dupes = icons.filter((g, i) => icons.indexOf(g) !== i);
check('no two regulars wear the same glyph',
      dupes.length === 0 && icons.length === rows.length,
      dupes.length ? dupes.join(' ') + ' is used twice — at card size ♖/♜, ♗/♝, ♕/♛ and ♙/♟ are the SAME PICTURE'
                   : icons.length + ' distinct faces');
/* ══ THE QUEEN DOES NOT COME BACK TO PRINCESS'S SEAT (2026-08-19) ═══════════════════
   Nate, 08-19: *"Make it a pawn - she'll graduate later."* He had the queen arc pulled off
   the public site on 07-16 and this bench went on wearing the ending for four more weeks,
   so the decision gets a TEST and not just a comment — the same treatment the hinted-solve
   rule got the same day. ⚠ CHECKED ON BOTH COPIES: a gate that reads one of them can be
   satisfied by editing the other, which is the exact failure this whole file exists for.
   ⚠ IT FAILS CLOSED. If her seat is gone entirely the check fails rather than passing on
   an empty find() — a missing seat is a thing to look at, not a thing to skip. */
const QUEENS = ['♛', '♕'];
for (const [where, seat] of [['the game', bots.find(b => b.key === 'princess')],
                             ['the data file', rows.find(r => r.key === 'princess')]]) {
  check('Princess does not wear a queen in ' + where,
        !!seat && !QUEENS.includes(seat.icon),
        seat ? 'she wears ' + seat.icon
             : 'no princess seat found at all');
}
/* (The old "draws the bench from site.data.regulars" check was removed 2026-08-18 — the loop
   is over `open_seats` now, and the check directly above says so more precisely. Two gates
   asserting the same fact with one of them out of date is worse than one.) */
/* ⚠ U+FE0E or the tint silently no-ops on a browser that reaches for its color emoji font —
   the same failure [[text-clip-glyph-technique]] records for the drawer icons. */
check('…and gives every seat glyph a text-presentation selector',
      /\{\{\s*r\.icon\s*\}\}&#xFE0E;/.test(front),
      'without U+FE0E a browser may paint these from the emoji font and ignore `color` entirely');

/* ══ ROUTE() STANDS DOWN WHILE YOU ARE SEATED (2026-08-14) ═══════════════════════════════
   Nate: "Sometimes when I try playing Auston, and I am RESUMING the game, the screen
   glitches and goes back to the park tables. It takes around the time it takes to refresh
   the screen while sitting on the park tables screen."

   Traced on the live room at ?table=auston with a half-played save. TWO callers race:

     t=884  route ← safeRoute ← pjcc-profile.js onChange   → botStart → the board is up
     t=909  route ← safeRoute ← PJCC.ready.then            → repainted the lobby over it

   The onChange listener guards itself on `cur || botCur`. `PJCC.ready.then(safeRoute)` has
   no guard at all, and route() fell through to lobby() because BOTH bot branches are
   written `!inRoom` — so being seated made it skip every branch that could keep him seated.

   ⚠ ASSERTED AS SOURCE, NOT BEHAVIOR, ON PURPOSE. The failure is a RACE — which caller
   wins depends on whether a stored session is restoring — so a browser test would be
   green most runs and tell nobody anything. The invariant is not timing-dependent:
   route() decides which room you belong in, and once you are in one there is no decision
   left to make. Anything that genuinely wants you out calls exitRoom()/leaveRoom() first. */
{
  const routeBody = tablesSrc.slice(tablesSrc.indexOf('function route(){'),
                                    tablesSrc.indexOf('function safeRoute('));
  check('route() stands down when you are already seated',
        /if\s*\(\s*inRoom\s*\)\s*return\s*;/.test(routeBody),
        routeBody ? '' : '(route() not found — did it get renamed?)');
  /* and the guard must come BEFORE the fallthrough it protects, or it protects nothing */
  const guardAt = routeBody.search(/if\s*\(\s*inRoom\s*\)\s*return\s*;/);
  const lobbyAt = routeBody.lastIndexOf('lobby()');
  check('…and it stands down before route() can reach lobby()',
        guardAt > -1 && lobbyAt > -1 && guardAt < lobbyAt,
        'guard@' + guardAt + ' lobby@' + lobbyAt);
  /* The one caller that USED to rely on the fallthrough to put a player back on their feet.

     ⚠ ASSERT THE ORDER, NOT THE LINE. This check was written as a single `[^\\n]*` regex
     against the whole file, which meant it was really testing that the three calls happened
     to sit on one line — and it failed the day the block grew a second branch (the analysis
     sandbox, 2026-08-18) while the invariant it names was perfectly intact. A gate that
     breaks on reformatting trains people to edit the gate. Rebuilt to read the actual block
     out of botRender and compare positions, which is both what the sentence claims and
     strictly narrower than the old pattern: `!g.valid` anywhere in the file used to satisfy
     it, and now only botRender's own guard does. */
  const rBody = tablesSrc.slice(tablesSrc.indexOf('function botRender(){'),
                                tablesSrc.indexOf('function botTap('));
  const badSave = rBody.indexOf('if (!g.valid)');
  const guardBlock = badSave < 0 ? '' : rBody.slice(badSave, badSave + 600);
  const exitAt = guardBlock.indexOf('exitRoom()');
  const routeAt = guardBlock.indexOf('safeRoute()');
  check('a corrupt bot save still leaves the room instead of stranding you on it',
        badSave > -1 && exitAt > -1 && routeAt > -1 && exitAt < routeAt,
        badSave < 0 ? 'botRender() has no `if (!g.valid)` guard at all'
                    : 'exitRoom()@' + exitAt + ' must come before safeRoute()@' + routeAt);
}

/* ── report ─────────────────────────────────────────────────────────────────────────── */
console.log('\n=== THE REGULARS — the front door vs the real bench ===\n');
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log('  ' + (r.pass ? '✓' : '✗') + ' ' + r.label + (r.detail ? '   ' + r.detail : ''));
}
console.log('\nRESULT: ' + (failed ? 'FAIL (' + failed + ')' : 'PASS (' + results.length + ' checks)') + '\n');
process.exit(failed ? 1 : 0);
