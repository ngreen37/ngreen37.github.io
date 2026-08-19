/* pwa.check.js — proves the PWA layer is wired correctly and won't silently rot.
 *
 * Static checks (no browser needed): the manifest is valid JSON with the required
 * installability fields, every asset it references exists on disk, the service
 * worker + register script + offline page are present, and every <head> layout
 * actually pulls in the PWA include.
 *
 * Run: npm run test:pwa   (exits non-zero on any failure)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const results = [];
const ok = (cond, msg) => results.push({ pass: !!cond, msg });
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const nonEmpty = (rel) => { try { return fs.statSync(path.join(ROOT, rel)).size > 0; } catch (e) { return false; } }

/* ---- manifest ---- */
let m = null;
ok(exists('manifest.json'), 'manifest.json exists');
if (exists('manifest.json')) {
  try { m = JSON.parse(read('manifest.json')); ok(true, 'manifest.json is valid JSON'); }
  catch (e) { ok(false, 'manifest.json is valid JSON — ' + e.message); }
}
if (m) {
  ok(m.name && m.name.length, 'manifest has name');
  ok(m.short_name && m.short_name.length <= 12, 'manifest has short_name (<=12 chars)');
  ok(!!m.start_url, 'manifest has start_url');
  /* WHERE THE APP OPENS (2026-08-03). Two halves that have to agree, and neither is
   * visible in the other's file — which is exactly how the app spent a week opening on
   * a page that stopped being the front door in July.
   *   1. the manifest starts FRESH installs at the front door;
   *   2. the shared head redirects OLD launchers off the previous start_url, because
   *      start_url is baked into a launcher at install time and can never be corrected
   *      from the manifest side.
   * If the front door moves again, both of these fail — which is the point. */
  ok(/^\/(\?|$)/.test(m.start_url), 'manifest start_url is the front door (/) — ' + m.start_url);
  ok(m.display === 'standalone' || m.display === 'fullscreen' || m.display === 'minimal-ui', 'manifest display is app-like');
  ok(/^#[0-9a-f]{6}$/i.test(m.theme_color || ''), 'manifest theme_color is a hex color');
  ok(/^#[0-9a-f]{6}$/i.test(m.background_color || ''), 'manifest background_color is a hex color');

  const icons = m.icons || [];
  const sizesPresent = new Set(icons.map((i) => i.sizes));
  ok(sizesPresent.has('192x192'), 'manifest has a 192x192 icon');
  ok(sizesPresent.has('512x512'), 'manifest has a 512x512 icon');
  ok(icons.some((i) => (i.purpose || '').includes('maskable')), 'manifest has a maskable icon');

  // every referenced local asset (icons, screenshots, shortcut icons) exists + is non-empty
  const refs = [];
  icons.forEach((i) => refs.push(i.src));
  (m.screenshots || []).forEach((s) => refs.push(s.src));
  (m.shortcuts || []).forEach((s) => (s.icons || []).forEach((i) => refs.push(i.src)));
  refs.filter((r) => r && r.startsWith('/')).forEach((r) => {
    const rel = r.replace(/^\//, '').split('?')[0];
    ok(exists(rel) && nonEmpty(rel), 'manifest asset exists + non-empty: ' + r);
  });
}

/* ---- service worker + scripts + offline page ---- */
ok(exists('sw.js'), 'sw.js exists (at site root → whole-site scope)');
if (exists('sw.js')) {
  const sw = read('sw.js');
  ok(/offline\.html/.test(sw), 'sw.js wires an offline fallback');
  ok(/addEventListener\(['"]fetch['"]/.test(sw), 'sw.js has a fetch handler');
  ok(/addEventListener\(['"]activate['"]/.test(sw), 'sw.js purges old caches on activate');
  // every URL a launcher can still open has to be in the shell, or the app is a blank
  // screen on a plane — including /pjcc/, which now only exists to carry the redirect.
  ["'/'", "'/chess/'", "'/pjcc/'"].forEach((u) => {
    ok(sw.includes(u + ','), 'sw.js precaches ' + u + ' (a launcher can still open it)');
  });
}
ok(exists('offline.html'), 'offline.html exists');
ok(exists('assets/js/pwa-register.js'), 'pwa-register.js exists');
if (exists('assets/js/pwa-register.js')) {
  const reg = read('assets/js/pwa-register.js');
  ok(/serviceWorker/.test(reg) && /register\(/.test(reg), 'pwa-register.js registers the service worker');
  ok(/beforeinstallprompt/.test(reg), 'pwa-register.js handles the install prompt');
  // gated private-by-default: a launch switch + a per-browser preview flag
  ok(/var\s+ENABLED\s*=\s*(true|false)/.test(reg), 'pwa-register.js has the ENABLED launch switch');
  ok(/pjcc\.pwa\.dev/.test(reg) && /pwa['"]?\)?\s*===\s*['"]on['"]/.test(reg), 'pwa-register.js supports ?pwa=on private preview');
  // manifest + apple meta are injected by JS (kept OUT of the public HTML)
  ok(/manifest\.json/.test(reg), 'pwa-register.js injects the manifest when active');
  ok(/apple-touch-icon/.test(reg), 'pwa-register.js injects the apple-touch-icon when active');
}

/* ---- the include + every head layout pulls it in ---- */
ok(exists('_includes/pwa-head.html'), '_includes/pwa-head.html exists');
if (exists('_includes/pwa-head.html')) {
  const inc = read('_includes/pwa-head.html');
  ok(/pwa-register\.js/.test(inc), 'pwa-head include loads pwa-register.js');
  // the public HTML must NOT advertise the manifest while the PWA is private
  ok(!/rel=["']manifest["']/.test(inc), 'pwa-head include does not statically expose the manifest');
}
/* The four layouts no longer each pull pwa-head in themselves — they all share ONE
 * head (_includes/head.html), and that is what pulls in the PWA + weather. Check the
 * real chain: every layout -> head.html -> pwa-head.html. */
ok(exists('_includes/head.html'), '_includes/head.html exists (the single shared head)');
if (exists('_includes/head.html')) {
  const head = read('_includes/head.html');
  ok(/\{%\s*include\s+pwa-head\.html\s*%\}/.test(head), 'the shared head includes pwa-head.html');
  ok(/\{%\s*include\s+town-weather\.html\s*%\}/.test(head), 'the shared head includes town-weather.html');
  // the other half of the start_url pair — see the manifest check above
  ok(/source=pwa/.test(head) && /location\.replace/.test(head),
     'the shared head redirects an app LAUNCH off the old start_url');
  ok(/'\/\?source=pwa'/.test(head), 'the app-launch redirect points at the front door');
  // and it must fire before anything paints: above the stylesheet link
  const iRedirect = head.indexOf('source=pwa');
  const iSheet = head.indexOf('rel="stylesheet"');
  ok(iRedirect > -1 && iSheet > -1 && iRedirect < iSheet,
     'the app-launch redirect sits above the stylesheet (fires before first paint)');
}

/* THE THIRD GENERATION OF LAUNCHER (added 2026-08-03 with chesswild.com). There are now
 * three baked start_urls in the wild — /pjcc/ (before 2026-07-28), /chess/ (that week), and
 * / (now) — and each of the first two needs a redirect living INSIDE the document it opens.
 * /pjcc/'s is in the shared head, checked above. /chess/ is `layout: null`, so it does NOT
 * get the shared head and the check above cannot see it: its redirect has to be in its own
 * <head>, and if it ever goes missing the only symptom is an app that opens on a dead page.
 * It also has to carry ?source=pwa across the hop, or the launch arrives as a plain visit. */
ok(exists('chess.md'), 'chess.md exists (the /chess/ stub a 2026-07-28 launcher still opens)');
if (exists('chess.md')) {
  const stub = read('chess.md');
  ok(/layout:\s*null/.test(stub), '/chess/ is pinned layout: null (it renders standalone)');
  ok(/location\.replace/.test(stub), '/chess/ carries its own pre-paint redirect');
  ok(/source=pwa/.test(stub), '/chess/ carries the app marker across the hop');
  ok(/http-equiv="refresh"/.test(stub), '/chess/ redirects without JS too');
}
/* ⚑ 'studio-home' came off this list 2026-08-19 with the layout itself. ⚠ THE CHECK WOULD
   HAVE FAILED LOUDLY — `exists(rel) &&` makes a missing layout a red gate, which is exactly
   right and is how a deletion gets noticed rather than discovered later. */
['default', 'game', 'easter-eggs'].forEach((layout) => {
  const rel = '_layouts/' + layout + '.html';
  const has = exists(rel) && /\{%\s*include\s+head\.html/.test(read(rel));
  ok(has, layout + '.html uses the shared head');
});

/* ---- report ---- */
console.log('\n=== PWA CHECK ===');
let fails = 0;
for (const r of results) { console.log((r.pass ? '  ✓ PASS  ' : '  ✗ FAIL  ') + r.msg); if (!r.pass) fails++; }
const pass = fails === 0;
console.log(pass
  ? '\nRESULT: PASS (' + results.length + ' checks)\n'
  : '\nRESULT: FAIL (' + fails + '/' + results.length + ' checks failed)\n');
process.exit(pass ? 0 : 1);
