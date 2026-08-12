/* ═══════════════════════════════════════════════════════════════════════════════════
 * RAW HTML BLOCKS CLOSE — a page may be wrong, but it may not be UNPARSEABLE.
 * -----------------------------------------------------------------------------------
 * Written 2026-08-12, after /leaderboards/ sat on "Tuning in…" in production for a few
 * hours. One commit had deleted a single `</style>` line. Everything after it — three
 * `<script src>` tags and an inline script — became CSS text, so the leaderboard engine
 * never loaded and the standings never arrived. Kramdown politely auto-closed the tag at
 * the very END of the page content, which is what makes this so quiet: the HTML that
 * ships is well-formed, nothing errors, nothing logs, and the page renders — just with a
 * chunk of itself swallowed. This is the SECOND time a one-character-class syntax slip
 * has taken a room down with every gate green ([[markdown-eats-scripts]] — a syntax
 * error took Park Tables down with 150+ gates passing).
 *
 * No test here knew how to fail, because every other gate reads SOURCE. Source looked
 * fine: the CSS was valid, the script tags were present and spelled right. The defect
 * only exists in the RELATIONSHIP between them, and only a parser sees it.
 *
 * So this walks every page and layout the way a browser does: `<style>` and `<script>`
 * are RAW TEXT elements, meaning once one opens, nothing inside it counts as markup
 * until its own closing tag. That single rule is what makes the check trustworthy — it
 * is why prose about `<script src>` inside a script comment, or the word `<style>` in a
 * CSS comment, cannot fool it. Liquid/HTML comments and Markdown code spans come out
 * first, so documentation that TALKS about these tags stays free to.
 *
 *   node tests/tags.check.js        (also runs inside `npm test`)
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── RAW HTML BLOCKS CLOSE ─────────────────────────────────\n');

const SKIP = /(node_modules|[\\/]\.git|[\\/]_site|assets[\\/]vendor|assets[\\/]backups)/;
const walk = (d, o) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (SKIP.test(f)) continue;
    if (e.isDirectory()) walk(f, o); else if (/\.(md|html)$/.test(e.name)) o.push(f);
  }
  return o;
};

/* Blank out a span but KEEP its newlines, so every reported line number is the real one. */
const blank = (s, re) => s.replace(re, (m) => m.replace(/[^\n]/g, ' '));

/* Comments and code spans are not markup. Stripping them is what lets the docs — and the
   long design comments this repo runs on — mention <style> and <script> without tripping. */
function decomment(src) {
  let s = src;
  s = blank(s, /\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g);
  s = blank(s, /<!--[\s\S]*?-->/g);
  s = blank(s, /^[ \t]*(```|~~~)[\s\S]*?^[ \t]*\1[ \t]*$/gm);  /* fenced code */
  s = blank(s, /`[^`\n]*`/g);                                   /* inline code span */
  return s;
}

/* A browser's raw-text rule, and nothing cleverer: find an opening tag, then look for
   ONLY that element's closing tag. Returns the unclosed opener, or null if all closed. */
function unclosed(src) {
  const s = decomment(src);
  const lineAt = (i) => s.slice(0, i).split('\n').length;
  const OPEN = /<(style|script)\b[^>]*>/gi;
  let i = 0;
  for (;;) {
    OPEN.lastIndex = i;
    const m = OPEN.exec(s);
    if (!m) return null;
    const tag = m[1].toLowerCase();
    /* self-closing (`<script … />`) opens nothing */
    if (/\/>$/.test(m[0])) { i = m.index + m[0].length; continue; }
    const close = new RegExp('</' + tag + '\\s*>', 'i');
    const rest = s.slice(m.index + m[0].length);
    const c = rest.search(close);
    if (c === -1) return { tag, line: lineAt(m.index), text: m[0].trim() };
    i = m.index + m[0].length + c;
  }
}

const pages = walk(ROOT, []);
const broken = [];
for (const f of pages) {
  const rel = path.relative(ROOT, f).split('\\').join('/');
  const u = unclosed(fs.readFileSync(f, 'utf8'));
  if (u) broken.push(rel + ':' + u.line + '  <' + u.tag + '> never closes');
}

check('every page and layout closes every <style> and <script>',
  broken.length === 0, pages.length + ' files scanned');
for (const b of broken) console.log('      ↳ ' + b);

/* ── THE ONE THAT BIT US ──────────────────────────────────────────────────────────
   A regression pin. The leaderboard's engine tag must be reachable — i.e. NOT sealed
   inside the page's stylesheet. Named explicitly because this page is the one that
   went down, and because "the standings are empty" is indistinguishable, from the
   outside, from "nobody has played yet". */
{
  const LB = fs.readFileSync(path.join(ROOT, 'leaderboards.md'), 'utf8');
  const s = decomment(LB);
  const eng = s.search(/pjcc-leaderboard\.js/);
  check('the leaderboard names its engine', eng !== -1);
  if (eng !== -1) {
    /* walk the raw-text blocks and make sure none of them contains that offset */
    let sealed = false;
    const OPEN = /<(style)\b[^>]*>/gi;
    let m;
    while ((m = OPEN.exec(s))) {
      const rest = s.slice(m.index + m[0].length);
      const c = rest.search(/<\/style\s*>/i);
      const end = c === -1 ? s.length : m.index + m[0].length + c;
      if (eng > m.index && eng < end) sealed = true;
    }
    check('…and the tag is not sealed inside a <style> block', !sealed,
      sealed ? 'the engine is CSS text — the board will read "Tuning in…" forever' : 'reachable');
  }
}

console.log('\n' + (fail ? '  ' + fail + ' FAILED' : '  all ' + pass + ' checks passed') + '\n');
process.exit(fail ? 1 : 0);
