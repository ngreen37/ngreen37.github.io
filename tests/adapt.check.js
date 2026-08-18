/* ═══════════════════════════════════════════════════════════════════════════════════
 * THE ADAPTIVE DIAL — does it find a player, and can it ever lie about one?
 * -----------------------------------------------------------------------------------
 * pjcc-adapt.js turns the engine's own per-move score into a playing strength. It has no
 * DOM, no storage and no network, so this drives the real file directly with synthetic
 * games: a player who is always winning, one who is always losing, one who is dead level,
 * and one the engine never managed to score at all.
 *
 * WHAT THIS IS DEFENDING, in order of how expensive the mistake would be:
 *
 *   1. IT NEVER MOVES ON A GUESS. A search that produced no score must leave the dial
 *      exactly where it was. A dial that drifts on missing data is a difficulty setting
 *      changing itself for no reason the player can perceive, which is indistinguishable
 *      from the engine being broken. [[accuracy-above-all]]
 *   2. IT STAYS ON THE LADDER. Outside 400-2400 there is no `skillForElo` road left, so
 *      the dial would report numbers the engine cannot actually play.
 *   3. IT CLIMBS FASTER THAN IT FALLS. An opponent that rises to meet you reads as
 *      respect; one that sinks the moment you slip reads as pity. This is the ethic of
 *      the whole feature and it is one asymmetry in one constant — easy to "tidy" away.
 *   4. IT CANNOT COLLAPSE. FLOOR stops one bad patch turning a real opponent into a
 *      punching bag for the rest of the game.
 *   5. `settled()` DESCRIBES THE GAME, NOT THE SEED. It is what a rematch starts from,
 *      so if it carried the seed the dial would never actually learn anything.
 *
 *   node tests/adapt.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const path = require('path');
const A = require(path.join(__dirname, '..', 'assets', 'js', 'pjcc-adapt.js'));

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

/* Play `n` moves at a fixed engine score. ⚠ THE SIGN IS THE WHOLE TEST AND IT IS EASY TO
   GET BACKWARDS: the engine scores from the side to move, which is the BOT, so a POSITIVE
   cp means the bot is winning and the dial should come DOWN. */
function run(t, cp, n) { for (let i = 0; i < n; i++) t.note(cp); return t; }

console.log('\n=== ADAPTIVE DIAL ===\n');

/* ── 1. no signal, no movement ─────────────────────────────────────────────────── */
{
  const t = A.create({ seed: 1200 });
  const before = t.level();
  for (let i = 0; i < 40; i++) t.note(undefined);
  for (let i = 0; i < 40; i++) t.note(null);
  for (let i = 0; i < 40; i++) t.note(NaN);
  check('a search with no score never moves the dial', t.level() === before,
        before + ' → ' + t.level());
  check('…and does not count as a move either', t.moves() === 0, t.moves() + ' moves');
}

/* ── 2. it finds a player who is winning, and one who is losing ────────────────── */
{
  const up = run(A.create({ seed: 900 }), -300, 40);      // player up 3 pawns, every move
  check('a player who is winning drags the dial UP', up.level() > 900 + 200,
        '900 → ' + up.level());

  const down = run(A.create({ seed: 1600 }), 300, 40);     // bot up 3 pawns, every move
  check('a player who is losing brings the dial DOWN', down.level() < 1600 - 100,
        '1600 → ' + down.level());

  const level = run(A.create({ seed: 1200 }), 0, 40);
  check('a dead-level game leaves the dial alone', Math.abs(level.level() - 1200) <= 2,
        '1200 → ' + level.level());
}

/* ── 3. the ethic: up faster than down ─────────────────────────────────────────── */
{
  check('UP is a larger constant than DOWN', A.UP > A.DOWN, A.UP + ' vs ' + A.DOWN);
  // symmetric provocation, same magnitude, opposite sign — the travel must NOT match
  const climbed = run(A.create({ seed: 1200 }), -400, 25).level() - 1200;
  const sank    = 1200 - run(A.create({ seed: 1200 }), 400, 25).level();
  check('it climbs further than it sinks on equal provocation', climbed > sank,
        '+' + climbed + ' up vs -' + sank + ' down');
}

/* ── 4. the road, and the floor ────────────────────────────────────────────────── */
{
  const hi = run(A.create({ seed: 2300 }), -1500, 200);
  check('it can never climb off the top of the ladder', hi.level() <= A.MAX, hi.level() + ' ≤ ' + A.MAX);
  const lo = run(A.create({ seed: 500 }), 1500, 200);
  check('it can never sink off the bottom', lo.level() >= A.MIN, lo.level() + ' ≥ ' + A.MIN);

  /* FLOOR: climb first so there is a peak to fall from, then collapse. */
  const t = A.create({ seed: 1000 });
  run(t, -1500, 40);
  const peak = t.peak();
  run(t, 1500, 200);
  check('one bad patch cannot drop it more than FLOOR below its peak',
        t.level() >= Math.max(A.MIN, peak - A.FLOOR) - 1,
        'peak ' + peak + ' → ' + t.level() + ' (floor ' + A.FLOOR + ')');
}

/* ── 5. settled() describes the game, not the seed ─────────────────────────────── */
{
  /* Seeded badly low against a player who is plainly stronger. If settled() carried the
     seed, a rematch would start from the wrong place forever and she would never learn. */
  const t = run(A.create({ seed: 400 }), -600, 60);
  check('settled() leaves a badly wrong seed behind', t.settled() > 700,
        'seed 400 → settled ' + t.settled());
  check('settled() is not just the last value', typeof t.settled() === 'number');

  const short = A.create({ seed: 1100 });
  short.note(-50);
  check('settled() is safe on a game too short to have a second half',
        short.settled() >= A.MIN && short.settled() <= A.MAX, short.settled());
}

/* ── 6. the win% curve agrees with the Game Review's ───────────────────────────── */
{
  check('winPct(0) is dead even', Math.abs(A.winPct(0) - 50) < 0.001, A.winPct(0).toFixed(3));
  check('winPct saturates rather than running away',
        A.winPct(100000) <= 100 && A.winPct(-100000) >= 0,
        A.winPct(100000).toFixed(2) + ' / ' + A.winPct(-100000).toFixed(2));
  check('winPct is monotonic', A.winPct(300) > A.winPct(100) && A.winPct(-100) > A.winPct(-300));
}

/* ── 7. the first few moves are deliberately quiet ─────────────────────────────── */
{
  const t = A.create({ seed: 1200 });
  t.note(-800); t.note(-800); t.note(-800);
  check('it does not react to the opening (every opening evaluates near zero)',
        t.level() === 1200, 'still ' + t.level() + ' after 3 scored moves');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
console.log('RESULT: ' + (fail ? 'FAIL' : 'PASS') + '\n');
process.exit(fail ? 1 : 0);
