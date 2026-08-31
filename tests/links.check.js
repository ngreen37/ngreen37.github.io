/* links.check.js — the "no broken internal link, no orphan page" gate.
 *
 * The site is built by GitHub Pages (Jekyll) on push, so there's no reliable local
 * _site to crawl. Instead this checks the SOURCE: it builds the set of URLs the
 * site will publish (permalinks, collection items, directory index pages, game
 * folders) and then flags every internal href/src that points at a path outside
 * that set — i.e. a link that will 404. It also reports pages nothing links to
 * (orphans) as a warning, not a failure.
 *
 * Run: npm run test:links   (exits non-zero if any internal link is broken)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Replace a matched block with the same number of newlines, so any line number reported
// downstream still points at the real line in the real file.
function blank(s) { return s.replace(/[^\n]/g, ' '); }

/* ---- gather every source file ---- */
// ⚠ `private/` is gitignored and is NEVER published — it holds notes, canon and the Godot
// docs. A path written down in a design document is an example, not a link the site serves,
// so scanning it can only ever produce false failures.
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '_site', 'tests', 'private'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
const files = walk(ROOT, []);
const read = f => fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');   // normalize CRLF so front-matter parses
// a linked .css may be compiled from a .scss source (Jekyll) — treat as present
function assetExists(p) {
  if (fs.existsSync(path.join(ROOT, p))) return true;
  if (/\.css$/i.test(p) && fs.existsSync(path.join(ROOT, p.replace(/\.css$/i, '.scss')))) return true;
  return false;
}

/* ---- normalize a URL path: drop origin, query, hash; ensure leading + trailing slash ---- */
function norm(u) {
  u = u.split('#')[0].split('?')[0].trim();
  if (!u) return '';
  u = u.replace(/^https?:\/\/[^/]+/i, '');        // absolute -> path (only same-site is checked below)
  if (!u.startsWith('/')) return '';               // relative/anchor-only handled by callers
  if (!/\.[a-z0-9]{1,5}$/i.test(u) && !u.endsWith('/')) u += '/';   // dir-style -> trailing slash
  return u;
}

/* ---- front-matter permalink, if any ---- */
function frontPermalink(txt) {
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const pm = m[1].match(/^permalink:\s*(.+)$/m);
  return pm ? norm(pm[1].trim().replace(/^["']|["']$/g, '')) : null;
}
function hasFrontMatter(txt) { return /^---\n[\s\S]*?\n---/.test(txt); }
function slugOf(file) { return path.basename(file).replace(/\.(md|html)$/i, ''); }

/* ---- build the set of URLs the site publishes ---- */
const VALID = new Set(['/', '/index.html']);
const COLLECTION_DIR = { _characters: 'characters', _locations: 'locations', _evolutions: 'evolutions', _tag_pages: 'tags' };

for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const ext = path.extname(f).toLowerCase();

  // directory index pages -> /dir/ (and an explicit permalink if it sets one —
  // e.g. games/space_run/index.html publishes to /games/follow-the-dog/)
  if (/(^|\/)index\.(html|md)$/i.test(rel)) {
    VALID.add(norm('/' + rel.replace(/index\.(html|md)$/i, '')));
    try { const pl = frontPermalink(read(f)); if (pl) VALID.add(pl); } catch (e) {}
    continue;
  }

  if (ext === '.md' || ext === '.html') {
    const txt = read(f);
    const pl = frontPermalink(txt);
    if (pl) VALID.add(pl);

    // collection items (characters/locations/evolutions/tag_pages)
    const topDir = rel.split('/')[0];
    if (COLLECTION_DIR[topDir] && !pl) VALID.add('/' + COLLECTION_DIR[topDir] + '/' + slugOf(f) + '/');

    // page files with front-matter but no explicit permalink -> Jekyll default /path/
    if (!pl && hasFrontMatter(txt) && !COLLECTION_DIR[topDir]) {
      VALID.add(norm('/' + rel.replace(/\.(md|html)$/i, '/')));
      VALID.add(norm('/' + rel.replace(/\.md$/i, '.html')));
    }
  } else {
    // static asset paths are valid targets too (images, js, css, wasm, game html…)
    VALID.add('/' + rel);
  }
}
// game folders under /games/<slug>/ (each has its own index or is a Jekyll page dir)
for (const e of (fs.existsSync(path.join(ROOT, 'games')) ? fs.readdirSync(path.join(ROOT, 'games'), { withFileTypes: true }) : [])) {
  if (e.isDirectory()) VALID.add('/games/' + e.name + '/');
}

/* ---- extract internal link targets from every source file ---- */
const LINK_RE = /(?:href|src)\s*=\s*(["'])(.*?)\1/gi;
// Liquid: {{ '/path/' | relative_url }}  or  {{ "/path/" | ... }}
const LIQUID_RE = /\{\{\s*["'](\/[^"']*?)["']\s*\|[^}]*\}\}/g;
const broken = [];       // {file, target}
const linkedTargets = new Set();

for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  if (!['.md', '.html'].includes(ext)) continue;
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  // ⚠ A URL INSIDE A COMMENT IS NOT A LINK. `_includes/clip.html` documents its own usage in a
  // Liquid comment, and the example path in it is not something the site publishes. Same trap
  // already written into style.check.js rule 13 — never trust a tag name found in a comment —
  // and it cuts both ways: don't spell one, and don't believe one. Newlines are preserved so
  // nothing downstream shifts.
  const txt = read(f)
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank);

  const targets = [];
  let m;
  while ((m = LINK_RE.exec(txt))) targets.push(m[2]);      // href/src literals
  while ((m = LIQUID_RE.exec(txt))) targets.push(m[1]);    // {{ '/path/' | relative_url }} → /path/

  for (let t of targets) {
    if (!t) continue;
    if (t.includes('{{')) continue;                          // dynamic Liquid slug — can't resolve statically
    if (!t.startsWith('/')) continue;                        // external / anchor / relative — skip
    const n = norm(t);
    if (!n) continue;
    linkedTargets.add(n);
    if (n.startsWith('/assets/') || /\.[a-z0-9]{1,5}$/i.test(n)) {   // asset link: valid if the file (or its .scss) exists
      if (!VALID.has(n) && !assetExists(n)) broken.push({ file: rel, target: t });
      continue;
    }
    if (!VALID.has(n)) broken.push({ file: rel, target: t });
  }
}

/* ---- report ---- */
console.log('LINK GATE — ' + VALID.size + ' publishable URLs, ' + linkedTargets.size + ' distinct internal targets linked');
// de-dupe broken
const seen = new Set(), uniq = [];
for (const b of broken) { const k = b.file + ' -> ' + b.target; if (!seen.has(k)) { seen.add(k); uniq.push(b); } }

if (uniq.length) {
  console.log('\n✗ ' + uniq.length + ' internal link(s) point at a path the site does not publish:');
  for (const b of uniq) console.log('  ' + b.file + '  →  ' + b.target);
  process.exit(1);
}
console.log('\n✓ every internal link resolves to a published page or asset');
process.exit(0);
