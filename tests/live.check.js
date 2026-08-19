/* tests/live.check.js — THE FOLLOW DOOR'S LIVE STATE
 * =============================================================================
 * Source assertions, not a browser run, and on purpose: the thing this feature must
 * get right is what it does when it CANNOT answer, and there is no way to make a
 * headless Chrome not-know something on demand. The invariants are structural.
 *
 * ⚠ THE ONE FAILURE THAT MATTERS IS A BADGE THAT LIES. `/follow/` has refused to paint
 * the words "LIVE NOW" since it shipped, because a badge the site paints itself is
 * wrong for every hour he is not streaming. These checks exist so that rule survives
 * the arrival of a real answer.
 * ============================================================================= */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const js     = read('assets/js/pjcc-live.js');
const layout = read('_layouts/default.html');
const front  = read('index.md');
const header = read('_includes/site-header.html');
const scss   = read('_sass/_pjcc-13-nav.scss');
const doc    = read('docs/twitch-live-worker.md');

/* ⚠⚠ A CHECK THAT READS A COMMENT IS NOT A CHECK. This site has shipped both flavors of
   that bug — a negative assertion tripping on the prose that explains it, and a POSITIVE
   one passing on a deleted <script> tag because the comment above it named the file. Every
   assertion below that is about CODE runs against a comment-stripped copy.
   [[green-must-name-what-ran]] */
function code(s) {
  return s
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}
const jsCode     = code(js);
const layoutCode = code(layout);
const frontCode  = code(front);
const headerCode = code(header);
const scssCode   = code(scss);

let pass = 0, fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log('  ✓ ' + name + (detail !== undefined ? '   ' + detail : '')); }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '   ' + detail : '')); }
};

console.log('\nTHE FOLLOW DOOR — live state\n');

/* ══ IT IS ACTUALLY LOADED ═══════════════════════════════════════════════════════════
   The site has shipped a finished feature that no page ever loaded. Check the TAG.
   [[feature-shipped-but-never-loaded]] */
check('the site loads pjcc-live.js',
      /<script[^>]+pjcc-live\.js/.test(layoutCode),
      'a feature no page loads is not a feature');

/* ══ BOTH SURFACES ARE REACHABLE, AND BY ATTRIBUTE, NOT BY HREF ══════════════════════ */
check('the front door\'s sixth box is tagged',
      /data-live-door="box"/.test(frontCode));
check('…and the nav rail\'s Follow row is tagged',
      /data-live-door="row"/.test(headerCode));
check('…and the script finds them by that attribute, never by href',
      /querySelectorAll\('\[data-live-door\]'\)/.test(jsCode) && !/href\*?=/.test(jsCode),
      'relative_url prefixes these paths on a project-pages build; an href match would rot');

/* ══ ⚠⚠ IT MAY ONLY PAINT ON A REAL `true` ══════════════════════════════════════════
   Four ways to have no answer — unconfigured, Worker down, network dead, garbage reply —
   and every one of them must leave the door alone. */
check('nothing is painted unless the reply says live === true',
      /if\s*\(\s*j\.live\s*\)\s*paint\(/.test(jsCode),
      'the one answer this must never invent is `true`');
check('…and a reply without a boolean `live` is treated as no answer',
      /typeof\s+j\.live\s*!==\s*'boolean'\s*\)\s*return/.test(jsCode));
check('…and a non-200 from the Worker yields null rather than a body',
      /r\.ok\s*\?\s*r\.json\(\)\s*:\s*null/.test(jsCode));
check('…and the fetch has a catch that does nothing at all',
      /\.catch\(function\s*\(\)\s*\{\}\)/.test(jsCode),
      'a retry or a "status unknown" state would be inventing information');
check('…and an unconfigured LIVE_URL returns before touching the DOM',
      /if\s*\(!LIVE_URL\)\s*return;/.test(jsCode),
      'blank is the OFF switch, not a TODO');

/* ⚠ THE FALLBACK MUST LOOK MISSING. The only way to guarantee that is for this file to
   have no code that takes anything away — then "did nothing" is the failure mode by
   construction rather than by care. */
check('the script only ever ADDS a state, never removes one',
      !/classList\.remove|removeChild|\.remove\(\)/.test(jsCode),
      'so every failure path is indistinguishable from a normal door');

/* ══ IT CANNOT MOVE THE FRONT DOOR ══════════════════════════════════════════════════
   The left column is measured against the board beside it, and a badge in flow would
   shove it the moment he went live. [[front-door-hero-stack]] */
check('the LIVE chip is out of flow',
      /\.live-chip\s*\{[^}]*position:\s*absolute/.test(scssCode),
      'in flow it would reflow the hero column the moment a stream starts');
check('…and only the box gets one, never the 246px rail row',
      /data-live-door'\)\s*===\s*'box'/.test(jsCode),
      'the rail subtitle is measured to fit one line');

/* ══ NOT COLOR ALONE ════════════════════════════════════════════════════════════════ */
check('the chip carries the WORD "LIVE", not just a red dot',
      /textContent\s*=\s*'LIVE'/.test(jsCode));
check('…and the rail says it in its subtitle too',
      /Live right now/.test(jsCode));
/* ⚠⚠ AND THE RAIL'S SUBTITLE MAY NOT GROW. It was chosen at 22 characters because that
   fits the 246px rail on ONE line; the game name wrapped it to two on the first render, and
   a taller row moves the collapsed rail's MEASURED 861px short-window guard. The replacement
   is 14 characters, so the row can only ever get shorter. [[nav-rail-collapsed-default]] */
{
  const m = jsCode.match(/'(Live right now)'/);
  /* ⚠ THIS WAS A PROXIMITY REGEX AND IT DID NOT WORK. The first version asked whether
     `railRow` appeared within 200 characters of `info.game`; the mutation that puts the game
     name back on the rail moved them 250 apart and the check went green on broken code. A
     WINDOW IS A GUESS ABOUT FORMATTING, not an assertion about behavior. This names the
     guard itself. [[green-must-name-what-ran]] */
  const railGuarded = /\(\s*!railRow\s*&&\s*info\s*&&\s*info\.game\s*\)\s*\?/.test(jsCode);
  check('…in a string no longer than the one it replaces',
        !!m && m[1].length <= 22, m ? m[1].length + ' chars vs 22 ("Twitch and the socials")' : 'not found');
  check('…and the game name is kept off the rail entirely',
        railGuarded, 'only the front-door box has room for it');
}

/* ⚠ SPECIFICITY IS MEASURED HERE, NOT ASSUMED — the same trap the drawer's own comments
   record: `.dl-ico--follow` sets the bone tint and a (0,1,0) override would tie and lose
   to whichever came last. */
{
  const liveIco = scssCode.indexOf('.drawer-link.is-live .dl-ico--follow');
  const baseIco = scssCode.indexOf('.dl-ico--follow   {');
  check('the live tint outranks the bone tint it replaces',
        liveIco > -1 && /\.drawer-link\.is-live \.dl-ico--follow/.test(scssCode),
        liveIco > baseIco ? '(0,3,0) over (0,1,0), and later in the file besides'
                          : 'rule not found');
}

/* ══ THE SETUP IS WRITTEN DOWN, INCLUDING THE PART ONLY HE CAN DO ═══════════════════ */
check('the Worker doc names both secrets by their exact variable names',
      /TWITCH_CLIENT_ID/.test(doc) && /TWITCH_CLIENT_SECRET/.test(doc));
check('…and the Worker never answers `true` on a failure path',
      !/catch[\s\S]{0,120}live:\s*true/.test(doc),
      'every failure in the pasted code returns live:false');
check('…and it states the off state plainly rather than as a missing piece',
      /Until it exists, nothing is broken/.test(doc));

console.log('\nRESULT: ' + (fail ? 'FAIL (' + fail + ')' : 'PASS (' + pass + ' checks)') + '\n');
process.exit(fail ? 1 : 0);
