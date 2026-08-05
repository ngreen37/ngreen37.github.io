/* ═══════════════════════════════════════════════════════════════════════════════════
 * HOUSE STYLE — American spelling, and Title Case on anything that names a thing.
 * -----------------------------------------------------------------------------------
 * Nate has asked for this TWICE:
 *   2026-07-21  "For Clearance Delta, and all pages and games, I want 'centre' to instead
 *                read 'center', I want 'colour' to instead read 'color', etc."
 *   2026-08-04  "please please commit to memory that we are using American English and we
 *                are capitalizing our headers properly… I want to see this done right the
 *                first time, with all due respect. We've already discussed the colour thing."
 *
 * A memory note was not enough, and it is worth being honest about why: the first sweep
 * fixed VISITOR-FACING TEXT ONLY and left every code comment British. Every session since
 * read those comments, absorbed the voice, and wrote "Hair colour" into a new UI label.
 * The drift had a source, and the source was in the repo.
 *
 * So this file is the guard rather than a third apology. It fails the build on:
 *   1. any British spelling anywhere in the source — COMMENTS INCLUDED, deliberately;
 *   2. any UI header or picker label that is in sentence case where it names a thing.
 *
 * ⚠ IDENTIFIERS ARE NEVER FLAGGED, and that is the difference between a guard and a
 * nuisance. `data-analyse`, `PJCC….catalogue` and `hairColor` are keys wired across files;
 * renaming half of one breaks a feature silently. The word list below deliberately excludes
 * the two British-looking words that ARE identifiers here, and every pattern is anchored on
 * word boundaries so `colourOf` and `--colour-x` could never match even if they existed.
 *
 *   node tests/style.check.js        (also runs inside `npm test`)
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

/* Third-party source, build output, and Nate's own writing. Lore and blog posts are HIS
   voice ([[text-changes-need-approval]]) — this file does not police how he writes. */
const SKIP = /(node_modules|[\\/]\.git|[\\/]_site|assets[\\/]vendor|assets[\\/]backups|[\\/]_posts[\\/]|[\\/]_characters[\\/]|[\\/]_locations[\\/]|[\\/]_evolutions[\\/]|[\\/]_pjcc[\\/])/;
const EXT = /\.(md|html|scss|css|js|yml)$/i;

const BRITISH = [
  'colour', 'colours', 'coloured', 'colouring', 'colourful', 'colourless',
  'recolour', 'recolours', 'recoloured', 'recolouring',
  'centre', 'centres', 'centred', 'centring',
  'defence', 'defences', 'offence',
  'grey', 'greys', 'greyed', 'greyish',
  'behaviour', 'behaviours', 'favourite', 'favourites', 'favour', 'favours',
  'honour', 'honours', 'neighbour', 'neighbours', 'harbour', 'armour',
  'rumour', 'rumours', 'labour', 'flavour', 'flavours',
  'metre', 'metres', 'theatre', 'litre',
  'travelled', 'travelling', 'cancelled', 'cancelling', 'modelling',
  'jewellery', 'practise', 'licence',
  'organise', 'organised', 'recognise', 'recognised', 'apologise', 'apologising',
  'realise', 'realised', 'emphasise', 'emphasised', 'summarise',
  'towards', 'afterwards', 'whilst',
  /* ⚠ `analyse` and `catalogue` are NOT here, on purpose. Both appear as identifiers
     (`data-analyse`, `pt-bot-analyse`, `pgr-analyse`, and a `.catalogue` property read from
     four files), and `-` / `.` are non-word characters, so a boundary match would hit them.
     Their DISPLAY text was corrected by hand and is checked below instead. */
];

/* Words that stay lowercase inside a Title Case header unless they lead it. */
const MINOR = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'for', 'of', 'in', 'on', 'to',
  'with', 'at', 'by', 'from', 'as', 'vs', 'per', 'into', 'off', 'up', 'out', 'your', 'my']);

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

function walk(d, out) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (SKIP.test(f)) continue;
    if (e.isDirectory()) walk(f, out);
    else if (EXT.test(e.name)) out.push(f);
  }
  return out;
}
const rel = (f) => path.relative(ROOT, f).split('\\').join('/');
const FILES = walk(ROOT, []);

console.log('\n── HOUSE RULES ───────────────────────────────────────────\n');

/* ── 1. AMERICAN SPELLING, COMMENTS INCLUDED ──────────────────────────────────── */
{
  const found = [];
  for (const f of FILES) {
    if (rel(f) === 'tests/style.check.js') continue;      // this file names them all
    const src = fs.readFileSync(f, 'utf8');
    for (const w of BRITISH) {
      const re = new RegExp(String.raw`\b${w}\b`, 'gi');
      const hits = src.match(re);
      if (hits) found.push(rel(f) + ' → ' + [...new Set(hits)].join(', '));
    }
  }
  check('no British spelling anywhere in source (comments included)', found.length === 0,
    found.length ? '\n      ' + found.slice(0, 12).join('\n      ') : FILES.length + ' files clean');
}

/* ── 2. TITLE CASE ON HEADERS AND PICKER LABELS ───────────────────────────────────
   Only strings that NAME something are judged. A heading that reads as a sentence — one
   with a verb in it, or closing punctuation, or more than five words — is voice, not a
   label, and this test stays out of it. That distinction is the whole reason this can run
   over the site's own copy without flattening it. */
{
  const bad = [];
  for (const f of FILES) {
    if (/tests[\\/]/.test(rel(f))) continue;              // fixtures and expected-output strings
    const src = fs.readFileSync(f, 'utf8');
    const judge = (tag, raw) => {
      const t = raw.replace(/&amp;/g, '&').replace(/&mdash;/g, '—').trim();
      if (!/^[A-Z]/.test(t)) return;                      // not a header at all, or lore
      if (/[.!?:,]$/.test(t)) return;                     // punctuated → a sentence
      const w = t.split(/\s+/);
      if (w.length < 2 || w.length > 5) return;
      if (/\b(is|are|was|were|you|we|it|that|this|has|have|can|will|does|do|there|when|if)\b/i.test(t)) return;
      const lower = w.slice(1).filter((x) => {
        const c = x.toLowerCase().replace(/[^a-z]/g, '');
        return /^[a-z]/.test(x) && c && !MINOR.has(c);
      });
      if (lower.length) bad.push(rel(f) + '  ' + tag + '  "' + t + '"');
    };
    let m;
    const h = /<h([1-4])[^>]*>([^<]{2,70})</g;
    while ((m = h.exec(src))) judge('h' + m[1], m[2]);
    if (/\.md$/.test(f)) {
      const t = /^title:\s*(.{2,70})$/gm;
      while ((m = t.exec(src))) judge('title:', m[1].replace(/^["']|["']$/g, ''));
    }
  }
  check('every UI header that names a thing is Title Case', bad.length === 0,
    bad.length ? '\n      ' + bad.slice(0, 12).join('\n      ') : 'clean');
}

/* ── 3. THE TWO HAND-FIXED LABELS STAY FIXED ──────────────────────────────────────
   `analyse` is excluded from the word list above because the attribute must keep its
   spelling, so the BUTTON is pinned here by name. Without this, the one string the sweep
   could not police is the one string most likely to come back. */
{
  const pt = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');
  check('the Park Tables review button reads "Analyze"',
    /⚗ Analyze<\/button>/.test(pt) && !/⚗ Analyse<\/button>/.test(pt),
    'the data-analyse ATTRIBUTE deliberately keeps its spelling — it is a key');
  /* ⚠ COMMENTS STRIPPED FIRST, and this rule proved why the moment it was edited. "Outer
     Ring" left on 2026-08-04 ("forget the outer eye — scrap it") and the block explaining
     what left NAMES it — so a bare `!/Outer Ring/` failed on the explanation rather than on
     the label, which forces the next person to delete the note to make the test pass. Same
     trap and same fix as creator.check.js §1. The rule FOLLOWS the labels rather than being
     retired with the one it happened to be watching: Both/Left/Right are exactly the kind of
     new UI string that drifts to sentence case. */
  const cr = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-creator.js'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  check('the Forge labels are Title Case',
    /<h3>Skin Tone<\/h3>/.test(cr) && /<h3>Hair Color<\/h3>/.test(cr) &&
    /'Both Eyes'/.test(cr) && /'Left'/.test(cr) && /'Right'/.test(cr) && !/Outer Ring/.test(cr),
    'Skin Tone · Hair Color · Both Eyes / Left / Right');
}

/* ── 4. A SCRIPT INCLUDE MAY NOT SIT INSIDE A SPAN-LEVEL TAG IN A .md PAGE ─────────
   Not spelling, but the same class of problem, which is why it lives here: a house rule the
   build will not enforce for you, that fails SILENTLY and stays broken for weeks.

   Kramdown treats a span-level element's contents as span-level MARKDOWN and HTML-escapes
   them. Wrap an include that carries a `<script>` in a `<span>` and its code ships as

       var on = !!(built &amp;&amp; (Date.now() - built) &lt; 12 * 3600 * 1000);

   — a syntax error, so the whole block never runs. The desk lamp shipped that way on the
   front door from the day the page was built (found 2026-08-04 by a skeptic pass on the live
   phone build). It looked perfect the entire time: the lamp is drawn in CSS, so the only
   thing missing was everything it DID. `/pjcc/` was fine — same include, but an HTML layout.
   Block-level containers are passed through untouched. */
{
  const SPANS = 'span|b|i|em|strong|small|a|u|label|code';
  const slurp = (p) => fs.readFileSync(p, 'utf8');
  const withScript = fs.readdirSync(path.join(ROOT, '_includes'))
    .filter((f) => /\.html$/.test(f) && /<script/i.test(slurp(path.join(ROOT, '_includes', f))));
  const bad = [];
  for (const f of FILES.filter((x) => /\.md$/.test(x))) {
    const src = slurp(f);
    for (const inc of withScript) {
      const re = new RegExp(`<(${SPANS})\\b[^>]*>\\s*\\{%-?\\s*include\\s+${inc.replace('.', '\\.')}`, 'gi');
      if (re.test(src)) bad.push(rel(f) + ' wraps ' + inc + ' in a span-level tag');
    }
  }
  check('no .md page span-wraps an include that carries a <script>', bad.length === 0,
    bad.length ? bad.join(' | ') + '  ← use a block-level container'
               : withScript.length + ' script-bearing includes, all block-level where used');
}

/* ── 5. AN INCLUDE A .md PAGE USES MAY NOT CARRY AN INLINE MULTI-LINE <script> ──────
   Rule 4 above was the RIGHT lesson and only HALF the trap, and the missing half shipped to
   the live front door on 2026-08-04. Moving the desk lamp out of a <span> and into a <div>
   fixed the escaping — and opened the other door: kramdown passes raw HTML through, but a raw
   HTML block ENDS AT THE FIRST BLANK LINE. One blank line sat in the middle of that function.
   Everything below it was re-parsed as markdown, and being indented four spaces it became an
   indented CODE BLOCK — forty lines of raw JavaScript printed on the page, in a black box,
   under the world card, with `</div>` and `</section>` following as visible text. Rule 4
   passed the whole time, because the container really was block-level.

   So the honest rule is not "wrap it correctly" — it is that an inline script has no business
   in an include a markdown page uses AT ALL. A one-line `<script src=…>` is fine and is the
   fix; what is banned is a script with a BODY, which is the only kind kramdown can eat.
   Checked against the includes each .md page actually uses, so a partial that only ever
   serves an HTML layout (town-weather.html, in <head>) is left alone — those are safe. */
{
  const slurp = (p) => fs.readFileSync(p, 'utf8');
  // a <script> whose body has real content spanning more than one line
  const INLINE = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  const bodied = (src) => {
    let m; INLINE.lastIndex = 0;
    while ((m = INLINE.exec(src))) if (m[1].trim() && /\n/.test(m[1].trim())) return true;
    return false;
  };
  const risky = fs.readdirSync(path.join(ROOT, '_includes'))
    .filter((f) => /\.html$/.test(f) && bodied(slurp(path.join(ROOT, '_includes', f))));
  const bad = [];
  for (const f of FILES.filter((x) => /\.md$/.test(x))) {
    const src = slurp(f);
    for (const inc of risky) {
      const re = new RegExp(`\\{%-?\\s*include\\s+${inc.replace('.', '\\.')}`, 'i');
      if (re.test(src)) bad.push(rel(f) + ' includes ' + inc);
    }
  }
  check('no .md page includes a partial with an inline multi-line <script>', bad.length === 0,
    bad.length ? bad.join(' | ') + '  ← move the code to assets/js/ and load it with src+defer'
               : 'kramdown cannot reach any script a markdown page pulls in');
}

/* ── 6. A LIQUID COMMENT MAY NOT CLOSE THE GAP BETWEEN A SPAN CLOSE AND A BLOCK OPEN ──
   The third kramdown break on the front door in one day, and the one that hid behind the
   other two. `{%- comment -%}` strips the whitespace around itself — INCLUDING the blank line
   that separates two HTML blocks in a markdown page. That is harmless after a block-level
   close like `</div>` or `</ul>`, which ends kramdown's paragraph by itself; it is fatal after
   a SPAN-level close like `</a>`, where the paragraph is still open and the blank line was the
   only thing that would have ended it. Joined into `</a><section class="mc-studio">`, kramdown
   reads the section as span content and HTML-escapes it — so the markup ships as VISIBLE TEXT
   on the page, the element is never created, and anything positioned inside it escapes.

   The whole failure is written into the source: after Liquid strips its comments, a span close
   sits flush against a block open on one line. So strip them the way Liquid does — honoring
   the `-` on each side — and look for exactly that. Nothing here needs a build or a network. */
{
  const SPAN_CLOSE = 'a|span|b|i|em|strong|small|u|label|code';
  const BLOCK_OPEN = 'section|div|ul|ol|dl|table|h[1-6]|aside|nav|figure|blockquote|pre|form|main|header|footer';
  // Liquid's whitespace control: `{%-` eats preceding whitespace, `-%}` eats following.
  const stripLiquidComments = (s) => s.replace(
    /(\s*)\{%(-?)\s*comment\s*(-?)%\}[\s\S]*?\{%(-?)\s*endcomment\s*(-?)%\}(\s*)/g,
    (_m, pre, openL, _openR, _closeL, closeR, post) =>
      (openL === '-' ? '' : pre) + (closeR === '-' ? '' : post));
  /* ⚠ COLUMN 0 IS THE WHOLE TEST, and leaving it out is a false positive factory. Kramdown's
     paragraph logic only applies to markup at the TOP LEVEL of the document; markup nested
     inside an already-open raw HTML block is passed through whatever it looks like. The first
     draft of this check flagged direct-line.md for
         <span class="dl-step-n">1</span><div><strong>…
     which is two levels deep inside `<div class="dl-steps">`, renders perfectly, and has no
     Liquid comment anywhere near it — verified against the live page before narrowing this.
     An indented tag is somebody's child and is not this check's business. */
  const spanEnd  = new RegExp(`</(?:${SPAN_CLOSE})>$`, 'i');
  const blockTop = new RegExp(`^<(?:${BLOCK_OPEN})\\b`, 'i');
  const welded   = new RegExp(`^</(?:${SPAN_CLOSE})>[ \\t]*<(?:${BLOCK_OPEN})\\b`, 'i');
  const bad = [];
  for (const f of FILES.filter((x) => /\.md$/.test(x))) {
    const lines = stripLiquidComments(fs.readFileSync(f, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      // (a) the comment ate the newline too — both tags landed on one line
      if (welded.test(line)) { bad.push(rel(f) + ' — welded onto one line: ' + line.trim().slice(0, 54)); return; }
      // (b) the comment ate only the blank line — a block tag with an open paragraph above it
      if (!blockTop.test(line)) return;
      const prev = lines[i - 1];
      if (prev === undefined || prev.trim() === '') return;      // blank line survived — safe
      if (spanEnd.test(prev.trim())) {
        bad.push(rel(f) + ' — ' + prev.trim().slice(-18) + ' then ' + line.trim().slice(0, 34));
      }
    });
  }
  check('no Liquid comment welds a span close onto a block open in a .md page', bad.length === 0,
    bad.length ? '\n      ' + bad.slice(0, 8).join('\n      ')
                 + '\n      ← drop the hyphens on the comment tag so the blank line survives'
               : 'every block-level tag in a markdown page still opens its own block');
}

/* ── 7. EVERY LIQUID TAG IS CLOSED — THE ONE THING THAT CAN STOP THE SITE DEAD ─────
   The other six rules are about a page rendering WRONG. This one is about the site not
   rendering at all, and it is the only check here that guards the build itself.

   ⚠ NOTHING ON THIS MACHINE PARSES LIQUID. There is no local Jekyll, so `npm test` can pass
   in full while the GitHub Pages build fails on the very next push — and it does so QUIETLY:
   the build job fails, the deploy job is SKIPPED, no deployment is created, and the live site
   just goes on serving the last good copy. It reads exactly like the flaky-deploy problem
   ([[pages-deploy-flaky]]) and it is not that at all. Three builds died this way on 2026-08-04
   (765ff1e, d0d811c, and Nate's post pushed on top of them) before anyone looked at a build log.

   THE CAUSE, AND WHY A COMMENT IS THE DANGEROUS PLACE: Liquid TOKENIZES THE INSIDE OF A COMMENT
   BLOCK. Prose in a comment is not inert — an opening tag delimiter typed there as an EXAMPLE is
   parsed as a real tag, and if no closing delimiter follows, Liquid swallows everything up to
   the next one and raises "was not properly terminated". A complete, properly closed tag inside
   a comment is fine and is discarded (see _includes/char-card-piece.html, which has always done
   this). It is the half-written delimiter that kills the build.

   The check is deliberately whole-file rather than comment-only, because an unclosed tag is
   fatal anywhere. Only files Jekyll actually RENDERS are scanned: _includes/ and _layouts/ are
   always processed, and elsewhere a file needs YAML front matter — without it Jekyll copies the
   bytes through untouched and its braces mean nothing (which is exactly why assets/games/*.html
   are excluded). */
{
  const rendered = FILES.filter((f) => {
    if (!/\.(md|html)$/.test(f)) return false;
    const r = rel(f).replace(/\\/g, '/');
    if (/^assets\//.test(r)) return false;
    if (/^_(includes|layouts)\//.test(r)) return true;
    return /^---\r?\n/.test(fs.readFileSync(f, 'utf8'));
  });
  const bad = [];
  for (const f of rendered) {
    const src = fs.readFileSync(f, 'utf8');
    for (let i = src.indexOf('{%'); i !== -1; i = src.indexOf('{%', i + 2)) {
      const close = src.indexOf('%}', i + 2);
      const next  = src.indexOf('{%', i + 2);
      if (close === -1 || (next !== -1 && next < close)) {
        const line = src.slice(0, i).split('\n').length;
        bad.push(rel(f) + ':' + line + ' — ' + JSON.stringify(src.substr(i, 34)));
        break;                       // one report per file is enough to act on
      }
    }
  }
  check('every Liquid tag in a rendered file is terminated', bad.length === 0,
    bad.length ? '\n      ' + bad.join('\n      ')
                 + '\n      ← this FAILS THE PAGES BUILD; describe a delimiter in words, never type one'
               : rendered.length + ' rendered files parse');
}

/* ── 8. NO BUTTON LABEL STARTS WITH A LOWERCASE WORD ──────────────────────────────
   2026-08-05, Nate, for the THIRD time: "Do a capitalization check please - There's nothing
   charming about lower-casing words that shouldn't be lower case… This is basic stuff.
   Commit it to memory and practice proper capitalization."

   Rule 2 above only ever judged HEADERS, and the drift had moved: the offenders were
   BUTTONS. Nine game shells shipped "☰ menu", two shipped "⚑ resign", the Gauntlet had
   "☰ tower", the Forge had "tweak", the Games Hall had "↺ reset local game progress".
   Every one of them sentence-case-free, lowercase on purpose, and wrong.

   ⚠ SCOPE. A button label, not a sentence and not an expression:
     · the text must be LITERAL — a label built out of `+`, `?:` or Liquid is judged at
       runtime and cannot be judged here without evaluating it;
     · leading glyphs (☰ ⚑ ↺ and entity escapes) are stripped before the first WORD is read,
       because the glyph is decoration and the word is the label. */
{
  const bad = [];
  const LEAD = /^(&[a-z]+;|&#\d+;|[^\p{L}\p{N}])+/u;
  for (const f of FILES) {
    if (/tests[\\/]/.test(rel(f))) continue;
    const src = fs.readFileSync(f, 'utf8');
    const re = /<button\b[^>]*>\s*([^<>\n][^<\n]{0,70}?)\s*<\/button>/g;
    let m;
    while ((m = re.exec(src))) {
      const raw = m[1];
      if (/[{%+?]|\bvar\b|'|"/.test(raw)) continue;            // built at runtime — not ours to judge
      const t = raw.replace(LEAD, '').trim();
      if (!t || !/^[a-z]/.test(t)) continue;
      bad.push(rel(f) + ':' + src.slice(0, m.index).split('\n').length + '  "' + raw.trim() + '"');
    }
  }
  check('no button label starts with a lowercase word', bad.length === 0,
    bad.length ? '\n      ' + bad.slice(0, 12).join('\n      ') : 'every literal button label is capitalized');
}

/* ── 9. THE PUZZLE ROOM'S OWN TWO STRINGS ─────────────────────────────────────────
   Both named by Nate on 2026-08-05 and both the kind of string a later edit rewrites by
   feel: the motif tagline ("Capitalize properly the tagline - Forks - Pins - Skewers")
   and the journey line ("the 'your' in 'your puzzle rating' should be 'Your puzzle
   rating'"). Pinned by name because neither is shaped like a header, so rule 2 cannot see
   them and rule 8 cannot either — one is a <b> and the other is built in a template. */
{
  const fk = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_fork.html'), 'utf8');
  check('the puzzle room tagline is Title Case',
    /Forks · Pins · Skewers · Discoveries · Mates · Winning Material/.test(fk),
    'Forks · Pins · Skewers · Discoveries · Mates · Winning Material');
  check('the journey line says "Your puzzle rating"',
    /Your puzzle rating/.test(fk) && !/your puzzle rating/.test(fk), 'capital Y, his wording');
}

/* ── 10. THE FRONT DOOR AND ITS GENERATOR AGREE ON THE SQUARE ALPHABET ─────────────
   The front-door puzzle pool packs White's whole legal move list two characters per move
   over a 64-symbol alphabet, and BOTH SIDES carry their own copy of that alphabet — the
   generator (tests/gen-front-puzzles.js) to write it, index.md to read it. They cannot
   share a constant: one is Node, the other is inline page script with no import.

   ⚠ A DRIFT HERE IS SILENT AND TOTAL. Reorder one character and the page decodes every
   move to the wrong square: legal moves become unplayable, illegal ones light up, and
   nothing throws. This is the cheapest possible guard against the most expensive possible
   typo. Same shape as townsky.check.js comparing two copies of a gradient. */
{
  const grab = (p) => (fs.readFileSync(path.join(ROOT, p), 'utf8')
    .match(/SQ64\s*=\s*'([^']+)'/) || [])[1];
  const a = grab('tests/gen-front-puzzles.js'), b = grab('index.md');
  check('index.md and the puzzle generator carry the same SQ64 alphabet',
    !!a && a === b && a.length === 64 && new Set(a).size === 64,
    a === b ? '64 distinct symbols, identical in both files' : 'generator=' + a + '  page=' + b);
}

/* ══ EVERY INLINE SCRIPT ACTUALLY PARSES ═══════════════════════════════════════════════
   Added 2026-08-05, immediately after shipping a SYNTAX ERROR to the live Park Tables page.
   A comment block was closed early, so the prose after it landed in the JS; `/games/park-
   tables/` said "Walking to the park…" forever and never seated anybody.

   ⭐⭐ AND ALL 150+ GATES STAYED GREEN, because not one of them PARSED the code. The suite
   compiled the SCSS, walked the links, swept for dead classes, matched a dozen strings — and
   the one thing nobody did was hand the JavaScript to a JavaScript parser. **A test that
   reads a file is not a test that the file works.** This site keeps a lot of behavior in
   inline page scripts (the front-door puzzle, the games hall, Park Tables, the home hero),
   and every one of them is a room that can go dark on its own.

   ⚠ LIQUID COMMENTS ARE STRIPPED FIRST, AND THAT IS NOT AN OPTIMISATION. A comment in
   _layouts/home.html describes the `<script src=…>` pair that used to stand there — a regex
   hunting for script tags believes it, and then runs the "body" on through the page's HTML
   and reports a phantom error 300 lines away. Same trap as the style tag spelled inside a
   Liquid comment on the front door: **never trust a tag name found in a comment.**

   ⚠ `{{ … }}` becomes an identifier and `{% … %}` disappears, which is enough for every page
   here today. A page that builds JS out of a Liquid LOOP would need more; if one ever does,
   widen the strip rather than skip the file — the skip is what lets the next outage through.
   ⚠ ld+json and x-template blocks are not JavaScript and are left alone. */
{
  const SKIP = /(node_modules|[\\/]\.git|[\\/]_site|assets[\\/]vendor|assets[\\/]backups)/;
  const walk = (d, o = []) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (SKIP.test(f)) continue;
      if (e.isDirectory()) walk(f, o); else if (/\.(md|html)$/.test(e.name)) o.push(f);
    }
    return o;
  };
  const deLiquid = (s) => s
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
    .replace(/\{\{[\s\S]*?\}\}/g, 'L')
    .replace(/\{%-?[\s\S]*?-?%\}/g, '');
  const vm = require('vm');
  let parsed = 0; const broken = [];
  for (const f of walk(ROOT)) {
    const src = fs.readFileSync(f, 'utf8')
      .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
      .replace(/<!--[\s\S]*?-->/g, '');
    const blocks = [...src.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter((m) => !/\bsrc\s*=/i.test(m[1]))
      .filter((m) => !/\btype\s*=/i.test(m[1]) ||
        /\btype\s*=\s*["']?(text\/javascript|application\/javascript|module)/i.test(m[1]));
    for (const m of blocks) {
      const code = deLiquid(m[2]);
      if (!code.trim()) continue;
      try { new vm.Script(code); parsed++; }
      catch (e) {
        broken.push(path.relative(ROOT, f).split('\\').join('/') + '  →  ' + e.message.split('\n')[0]);
      }
    }
  }
  check('every inline <script> on the site parses', broken.length === 0,
    broken.length ? '\n      ' + broken.join('\n      ') : parsed + ' inline scripts, all valid JavaScript');
}

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
