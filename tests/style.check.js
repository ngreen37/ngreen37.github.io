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

console.log('\n── HOUSE STYLE ───────────────────────────────────────────\n');

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
  const cr = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-creator.js'), 'utf8');
  check('the Forge labels are Title Case',
    /<h3>Skin Tone<\/h3>/.test(cr) && /<h3>Hair Color<\/h3>/.test(cr) && /<h3>Outer Ring /.test(cr),
    'Skin Tone · Hair Color · Outer Ring');
}

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
