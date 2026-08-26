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

  /* ── …AND EVERY TERMINATED TAG STILL HAS TO MEAN SOMETHING ────────────────────────
     ⛑⛑ ADDED 2026-08-26, AFTER FIVE FAILED BUILDS. The rule above only asks whether a tag
     CLOSES. I wrote `assign` WITH ITS BRACES and no arguments inside a comment in
     projects.md — perfectly terminated, and a hard `Liquid::SyntaxError` that killed the
     Pages build for five pushes (two of them Nate's, stuck behind mine) while the live site
     served the old copy and looked merely stale.

     Same root cause as the rule above and worth restating: LIQUID TOKENIZES THE INSIDE OF A
     COMMENT BLOCK. Prose in a comment is not inert. The instinct to write a tag name with
     its delimiters "so the reader knows what I mean" is the thing that breaks the build —
     name it in backticks with no braces instead.

     ⚠ THIS IS ARGUMENT-SHAPE ONLY, NOT A LIQUID PARSER. It asks the question that actually
     fires: does a tag that REQUIRES arguments have any? `npm test` cannot do better —
     nothing on this machine parses Liquid — and a shallow check that catches the real
     failure beats a deep one nobody writes. Unknown tag names are left alone on purpose:
     Jekyll plugins add their own, and guessing at a whitelist would fail honest pages.
     ⚠ NO `raw` HANDLING, because the site has none. If a `raw` block is ever added, its
     body must be skipped here — inside `raw`, Liquid parses nothing and prose is safe. */
  const NEEDS_ARGS = {
    assign:    (a) => a.includes('='),
    for:       (a) => / in /.test(a),
    if:        (a) => a.length > 0,
    unless:    (a) => a.length > 0,
    elsif:     (a) => a.length > 0,
    case:      (a) => a.length > 0,
    when:      (a) => a.length > 0,
    include:   (a) => a.length > 0,
    capture:   (a) => a.length > 0,
    cycle:     (a) => a.length > 0,
    increment: (a) => a.length > 0,
    decrement: (a) => a.length > 0,
  };
  const wrong = [];
  for (const f of rendered) {
    const src = fs.readFileSync(f, 'utf8');
    const re = /\{%-?\s*([a-z_]+)([\s\S]*?)-?%\}/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const rule = NEEDS_ARGS[m[1]];
      if (!rule) continue;
      if (rule(m[2].trim())) continue;
      wrong.push(rel(f) + ':' + src.slice(0, m.index).split('\n').length +
                 ' — ' + JSON.stringify(m[0].slice(0, 40)));
    }
  }
  check('…and every Liquid tag that needs arguments has them', wrong.length === 0,
    wrong.length ? '\n      ' + wrong.join('\n      ')
                   + '\n      ← this FAILS THE PAGES BUILD; write the tag name WITHOUT braces in prose'
                 : 'argument-taking tags all carry arguments');
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

/* ── 10b. NO SHIPPED PUZZLE HAS AN ARMY NOBODY COULD HAVE ──────────────────────────
   2026-08-08, Nate with a screenshot of the front door: "There should never be two
   bishops on the same color." The same position also carried THREE black queens.

   ⚠ THE REFEREE WILL NEVER CATCH THIS, WHICH IS THE WHOLE POINT OF THE RULE. Two
   light-squared bishops is perfectly LEGAL — you get there by promoting a pawn — so every
   accuracy gate on this site looked at that board and correctly said nothing. It is a
   PLAUSIBILITY defect, not a legality one: these positions are meant to look like games
   somebody reached, and an army you cannot own without promoting is a tell that the board
   came out of a generator. That is the same standard the crowded-board pass was for.

   Both generators now refuse to build one. This reads the two SHIPPED pools — the front
   door's inline in index.md, /rating/'s inline in rating/index.html — because a rule that
   only lives in the tool that writes the file is a rule that stops applying the moment
   somebody hand-edits the file, and both pools carry a DO-NOT-EDIT-BY-HAND banner precisely
   because that is a thing people do. Static, no engine, runs on every push. */
{
  const CAP = { Q: 1, R: 2, B: 2, N: 2, P: 8 };
  const faults = [];
  let seen = 0;
  const pools = [
    ['index.md', /var POOL = \[([\s\S]*?)\];/, (e) => e.split(' ')[0]],
    ['rating/index.html', /var POOL = \[([\s\S]*?)\];/, (e) => e.split('|')[0]],
  ];
  for (const [file, re, fenOf] of pools) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    const m = fs.readFileSync(full, 'utf8').match(re);
    if (!m) { faults.push(file + ': POOL block not found'); continue; }
    for (const raw of m[1].split('\n')) {
      const q = raw.match(/'([^']+)'/);
      if (!q) continue;
      const fen = fenOf(q[1]);
      seen++;
      /* walk the board half of the FEN into (piece, isLight) pairs. Row 0 is rank 8 and
         file 0 is the a-file, so (row + file) EVEN is a light square — a8 is light. */
      const men = [];
      const rows = fen.split('/');
      for (let r = 0; r < rows.length; r++) {
        let f = 0;
        for (const ch of rows[r]) {
          if (ch >= '1' && ch <= '8') { f += +ch; continue; }
          men.push({ p: ch, light: (r + f) % 2 === 0 });
          f++;
        }
      }
      for (const up of [true, false]) {
        const mine = men.filter((x) => (x.p === x.p.toUpperCase()) === up);
        const side = up ? 'white' : 'black';
        for (const t in CAP) {
          const n = mine.filter((x) => x.p.toUpperCase() === t).length;
          if (n > CAP[t]) faults.push(`${file} ${fen}: ${side} has ${n}x${t}`);
        }
        const bs = mine.filter((x) => x.p.toUpperCase() === 'B');
        if (bs.length === 2 && bs[0].light === bs[1].light) {
          faults.push(`${file} ${fen}: ${side} has two ${bs[0].light ? 'light' : 'dark'}-squared bishops`);
        }
      }
    }
  }
  check('no shipped puzzle has an army nobody could have',
    seen > 0 && faults.length === 0,
    faults.length ? faults.slice(0, 3).join(' | ')
      : `${seen} positions — max one queen a side, bishops always on opposite colors`);
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


/* ── 15. THE DRAWER'S PER-ROOM ICON COLORS MAY NOT EAT THE "YOUR MOVE" SIGNAL ───────
   2026-08-10 gave every drawer icon its own hue (Nate: "change up the Gauntlet, Play Now,
   Puzzles and P&JCC symbols"). That is a look change sitting directly on top of a
   FUNCTIONAL one: green in this drawer means "there is a game waiting on your move", and
   pjcc-mymove.js paints it on the Play Now row — the same row that just got a permanent
   blue. Two ways that quietly dies, neither of which looks broken:

     · a per-room rule is written as a compound selector and out-specifies .dl-move
     · somebody picks green as one of the per-room hues, so the signal says nothing

   And a third failure this catches, which is not about green at all: 🎮 📖 🐾 are COLOR
   EMOJI and ignore `color` completely. A `color:` written on one of those rows is a fix
   that renders as no change whatsoever — which is exactly how the McPuppy paw sat at
   2.24:1 for weeks. Those rows must move with a filter or not at all. */
{
  const navScss = fs.readFileSync(path.join(ROOT, '_sass/_pjcc-13-nav.scss'), 'utf8');
  const header = fs.readFileSync(path.join(ROOT, '_includes/site-header.html'), 'utf8');

  check('the drawer still paints "your move" green on Play Now',
    /\.drawer-link\.dl-move\s+\.dl-ico\s*\{[^}]*color\s*:/.test(navScss),
    'pjcc-mymove.js has something to switch on');

  /* every per-room rule, as written */
  const rules = [...navScss.matchAll(/^(\.dl-ico--[a-z]+)\s*\{([^}]*)\}/gm)]
    .map((m) => ({ sel: m[1], body: m[2] }));
  check('every per-room icon rule is a single class, so .dl-move still outranks it',
    rules.length > 0 && rules.every((r) => /^\.dl-ico--[a-z]+$/.test(r.sel)),
    rules.length + ' rooms at (0,1,0) under a signal at (0,3,0)');

  /* no per-room hue may be green — hue 80°–170° with real saturation */
  const green = rules.filter((r) => {
    const m = r.body.match(/color\s*:\s*#([0-9a-f]{6})/i);
    if (!m) return false;
    const [rr, gg, bb] = [0, 2, 4].map((i) => parseInt(m[1].substr(i, 2), 16) / 255);
    const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb), d = max - min;
    if (d < 0.12) return false;                       // near-gray: no hue to speak of
    let h = 0;
    if (max === rr) h = 60 * (((gg - bb) / d) % 6);
    else if (max === gg) h = 60 * ((bb - rr) / d + 2);
    else h = 60 * ((rr - gg) / d + 4);
    if (h < 0) h += 360;
    return h >= 80 && h <= 170;
  }).map((r) => r.sel);
  check('no room took green — it means "your move" and nothing else',
    green.length === 0, green.length ? green.join(', ') + ' is in the green band' : rules.length + ' hues, none in 80°–170°');

  /* the emoji rows move with a filter, because color cannot reach them */
  const EMOJI_ROWS = ['dl-ico--arcade', 'dl-ico--studio'];
  const inked = EMOJI_ROWS.filter((c) => {
    const r = rules.find((x) => x.sel === '.' + c);
    return !r || /(^|[^-])color\s*:/.test(r.body) || !/filter\s*:/.test(r.body);
  });
  check('the emoji icons move with a filter, not with color',
    inked.length === 0,
    inked.length ? inked.join(', ') + ' — a color on a color emoji does nothing'
                 : 'the controller and the paw are both filtered');

  /* declared and used are the same set — a class on one side only is invisible either way */
  const declared = rules.map((r) => r.sel.slice(1)).sort();
  const used = [...new Set([...header.matchAll(/dl-ico--[a-z]+/g)].map((m) => m[0]))].sort();
  check('every per-room class is both declared and used',
    declared.join() === used.join(),
    declared.length === used.length ? declared.length + ' rooms wired' :
      'declared ' + declared.join(' ') + ' / used ' + used.join(' '));
}

/* ══ GREEN FILLS vs GREEN WORDS ═══════════════════════════════════════════════════════
   2026-08-11. `--fd-go` is the front door's BUTTON — its comment says "5.1:1 with white",
   which describes white text ON the green, not the green as text. Used as `color:` on the
   parchment it measures **2.62:1** against the darkest sky phase, and `--fd-go-2` measures
   3.57 — both real AA failures. I shipped one anyway, reading the 5.1 as if it were the
   token's contrast rather than the pair's.

   `--fd-go-ink` (#17492a, 5.36:1 measured off the painted sheet) exists for green WORDS,
   exactly as `--fd-wood-ink` exists beside the decorative `--fd-wood`. This gate stops the
   readable half from being skipped again.

   ⚠ It matches `color:` only. `background`, `border-color`, `box-shadow` and `fill` are
   what --fd-go is FOR, and none of them are text. */
{
  /* local reader — this file has no shared one, and `FILES` above is the whole-site walk */
  const slurp = (f) => {
    try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; }
  };
  const GREEN_FILES = ['index.md', '_sass/_pjcc-25-front-door.scss'];
  const offenders = [];
  for (const f of GREEN_FILES) {
    const raw = slurp(f);
    if (!raw) continue;
    /* ⚠ STRIP COMMENTS FIRST — and this is not hypothetical tidiness. The first run of this
       gate failed on the sentence "If you are about to write `color: var(--fd-go)`, you want
       this", which is the WARNING telling you not to. A gate that reads its own documentation
       as a violation teaches people to delete the documentation. Blanked, not removed, so the
       line numbers and the reported line text stay honest. */
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    const re = /(^|[^-\w])color\s*:\s*var\(\s*--fd-go(-2)?\s*\)/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      /* the token's own declaration line is not a use of it */
      const line = raw.slice(raw.lastIndexOf('\n', m.index) + 1, raw.indexOf('\n', m.index));
      if (/^\s*--fd-go/.test(line)) continue;
      offenders.push(f + ': ' + line.trim().slice(0, 72));
    }
  }
  check('green WORDS use --fd-go-ink, never the button green',
    offenders.length === 0,
    offenders.length ? offenders.join(' | ')
                     : '--fd-go stays a fill; #17492a is the one that clears AA as text');
  check('…and --fd-go-ink is actually defined',
    /--fd-go-ink:\s*#17492a/.test(slurp('_sass/_pjcc-25-front-door.scss')),
    'the readable green');
}

/* ══ EVERY CONTROL IN THE TOP BAR HAS A FINGER-SIZED HIT BOX ══════════════════════════
   Three phone passes (2026-08-04, 08-05, 08-13) have each found the same class of defect
   in the same place: a control in the site header that a fingertip cannot reliably hit.
   The 08-13 one was `.site-mark`, the header's own navigation between cW.com, P&JCC and
   McPuppy Studios — 12 CSS px tall on a phone, and it had never been in the tap-target
   file at all.

   ⭐ A RULE FOUND THREE TIMES BELONGS IN A GATE, NOT IN A NOTE. This is static and cheap:
   read the interactive elements out of the header include, and require each one to be
   named in `_pjcc-27-tap-targets.scss` or to be listed here as a deliberate exemption
   with a reason. It cannot measure pixels — a browser is needed for that, and the header
   is Liquid, so there is no local build to point one at — but it catches the thing that
   actually happened all three times: a control was ADDED to the bar and nobody added it
   to the fix. That is a coverage question, and coverage is checkable from source.

   ⚠ THE EXEMPTIONS ARE NOT A CONVENIENCE LIST. Each one is measured and explained. If you
   are about to add a name here to make the gate green, measure it on a phone first. */
{
  /* local reader — `slurp` above is const-scoped to its own block, and this file has no
     shared one. Same shape as the others: missing file reads as empty, never throws. */
  const slurp = (f) => {
    try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; }
  };
  const header = slurp('_includes/site-header.html');
  /* ⚠⚠ STRIP COMMENTS, AND THIS GATE PROVED WHY ON ITS OWN FIRST RUN — in the direction that
     is far more dangerous than the `--fd-go` gate's. That one failed on its own documentation
     and was noisy about it. This one PASSED on its own documentation: with the real
     `.site-mark` rule deleted, the coverage check stayed green because the block comment
     above the rule says ".site-mark" eight times. A gate that reads prose as code does not
     cry wolf — it goes quiet exactly when it is needed. Blanked, not removed, so any line
     numbers reported downstream stay honest. */
  const taps = slurp('_sass/_pjcc-27-tap-targets.scss')
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));

  /* only the TOP BAR — the drawer below it is a different surface with its own geometry
     (its links are full-width rows, which is a different kind of target). The bar ends at
     the drawer's opening tag. */
  const barEnd = header.search(/class="[^"]*drawer-panel|<nav[^>]+drawer/);
  const bar = barEnd > 0 ? header.slice(0, barEnd) : header;

  /* interactive elements in the bar, by their FIRST class — that is the hook a stylesheet
     would use, and it is what the tap-target file lists. */
  const found = new Set();
  const re = /<(a|button)\b[^>]*class="([^"]+)"/g;
  let m;
  while ((m = re.exec(bar)) !== null) found.add(m[2].trim().split(/\s+/)[0]);

  const EXEMPT = {
    /* measured 82.7 x 34.3 on desktop; on a phone it is `hidden` until a profile exists and
       renders as a full-height pill in the bar. Re-measure if it ever shows by default. */
    'nav-operative': 'hidden until signed in; renders full-height when shown',
    /* measured 82.1 x 32.4 desktop / not present in the phone probe's under-44 list — the
       phone layout drops it into the drawer rather than the bar. */
    'about-contact-btn': 'not in the phone bar; lives in the drawer at narrow widths'
  };

  const uncovered = [...found].filter(c =>
    !EXEMPT[c] && !new RegExp('\\.' + c.replace(/[-]/g, '\\-') + '\\b').test(taps));

  check('every control in the top bar has a 44px hit box (or a stated exemption)',
    uncovered.length === 0,
    uncovered.length
      ? 'NOT in _pjcc-27-tap-targets.scss: ' + uncovered.join(', ')
      : `${found.size} controls in the bar, ${Object.keys(EXEMPT).length} exempt by measurement`);

  /* ⚠ The `.site-mark` rule must NOT carry min-width — the two word marks sit 5px apart at
     390px, so a 44px minimum makes their hit boxes overlap and a short tap opens the WRONG
     brand. The width is `calc(100% + 5px)` on purpose, so the pair tiles the gap. */
  const markBlock = (taps.match(/\.site-mark::after\s*\{[\s\S]*?\}/) || [''])[0];
  const why = !markBlock
    ? 'no .site-mark::after rule at all — the marks have no hit box'
    : markBlock.includes('min-width')
      ? 'min-width is back on .site-mark::after — the marks now overlap'
      : !markBlock.includes('min-height')
        ? '.site-mark::after has no min-height — the marks are still 12px tall'
        : 'height grows to 44, width absorbs exactly the 5px gap';
  check('…and the marks tile the gap instead of overlapping it',
    !!markBlock && markBlock.includes('min-height') && !markBlock.includes('min-width'), why);
}

/* ══ THE WORD FOR A PERSON IS "PLAYER" ═══════════════════════════════════════════════
   2026-08-19, Nate: *"we aren't using Operative anymore — we need to think of a different,
   uniform name to call the users."* UNIFORM is the whole ask, and the reason this is a
   guard rather than a memory note is that "operative" had already been half-removed once
   (2026-07-28 took it out of plain chrome) and grew back into the leaderboard, the
   dossier, the invite copy and the news wire in the three weeks after.

   ⚠⚠ THIS IS NOT A BAN ON THE WORD, AND MUST NEVER BECOME ONE. Three uses are correct,
   and they are the reason a blind find-and-replace would have broken the site:

     1. THE RANK. `Operative` is rung 2 of BOTH ladders (RANKS + CLEARANCE). It names a
        rung some players have reached — which is exactly what it should mean now that it
        no longer ALSO means "everybody". Renaming the general noun FIXED the collision
        this repo has a long comment about (pjcc-profile.js, the pip tooltip); banning the
        rung would re-open that from the other side.
     2. THE LORE. /dead-drop/, /dispatch/, /archive/ — a real field agent is speaking in
        those, and they are opt-in artifacts. [[operative-theme-restraint]] drew that line
        on 2026-07-28 and it still holds. So does "Operative Gold", which is a COLOR.
     3. THE ENGLISH IDIOM. index.md and park-tables both say "X is the operative word."
        A regex that flagged those would be switched off inside a month.

   So this checks the SURFACES a player actually reads, and only the noun-shaped uses. */
{
  const PLAYER_SURFACES = [
    'leaderboards.md', 'dossier.md', 'mailing-list.md', 'shopkeeper.md',
    'the-gambit/index.html', 'games/shogi-island/index.html',
    'assets/js/pjcc-gift.js', 'assets/js/pjcc-leaderboard.js',
    'assets/js/pjcc-profile-bar.js', 'assets/js/pjcc-vs.js', '_layouts/home.html',
  ];
  /* ⚠ COMMENTS ARE STRIPPED FIRST. Half this repo's lines are prose explaining decisions,
     and several of those decisions are ABOUT the word "operative" — including the note
     directly above. A guard that reads its own explanation and fails is a guard that gets
     switched off rather than fixed. (Learned the expensive way in gifts.check.js, where
     the mirror image of this passed on a deleted <script> tag.) */
  const stripComments = (src) => src
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    // ⚠ TRAILING `//` TOO, not just whole-line. A comment sitting after code on the same
    //   line leaked the first offender this guard ever reported (dossier.md, a note about
    //   the header swap). The `[^:]` is what keeps it from eating `https://…`.
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  /* The NOUN, not the adjective. Three shapes — and the third exists only because a
     mutation test drove `<th>Operative</th>` straight past the first two. A bare label has
     no article in front of it and no noun behind it, and it happened to be the single
     most-read instance of the word on the entire site. Break the thing a guard guards, or
     the guard is just a sentence you wrote about yourself. */
  const PERSON_NOUN = new RegExp([
    // "an operative" · "every operative" · "your operative"
    /\b(?:an?|every|the|your|another|other|each)\s+operatives?\b/.source,
    // "operative dossier" · "operative profile" · "OPERATIVE STANDINGS"
    /\boperatives?\s+(?:dossier|profile|faces|network|card|standings|sign-in)\b/.source,
    // a bare label: <th>Operative</th> · <p class="gift-h">Operative</p> · 'Operative'
    /(?:>\s*|['"])operatives?(?:\s*<|['"])/.source,
  ].join('|'), 'i');
  const offenders = [];
  for (const f of PLAYER_SURFACES) {
    let src;
    try { src = fs.readFileSync(path.join(ROOT, f), 'utf8'); }
    catch (e) { offenders.push(f + ' → MISSING'); continue; }
    const hit = stripComments(src).match(PERSON_NOUN);
    if (hit) offenders.push(f + ' → "' + hit[0].trim() + '"');
  }
  check('a person is called a Player on every surface that names one',
    offenders.length === 0,
    offenders.length ? offenders.join('  |  ') : PLAYER_SURFACES.length + ' surfaces clean');

  // …and the rank it used to collide with is still there, still called Operative.
  const profSrc = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
  check('…while the RUNG keeps the name, which is the collision this fixed',
    /\{ name: 'Operative',\s+min: 75,/.test(profSrc) &&
    /\{ level: 2, name: 'Operative',/.test(profSrc),
    'rung 2 of both ladders — a rank some players hold, not a word for everybody');
}


console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
