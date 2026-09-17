/* stage.check.js — Blender models on the site (pjcc-stage.js + the three.js slice).
 *   node tests/stage.check.js
 * Static: every data-stage-model host points at a real GLB carrying its glow material, its page
 * loads the stage script, and every three.js class the script uses is in the bundle.
 * Live (headless Chrome, software WebGL): it draws, reacts, holds still when told, and a
 * missing bundle or model leaves the authored fallback in place. */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { findChrome } = require('./harness');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const STAGE = read('assets/js/pjcc-stage.js');
const GEN = read('tests/gen-three.js');
const GAMBIT = read('the-gambit/index.html');

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── STAGE (Blender models) ────────────────────────────────\n');

/* ── 1. every host, found by scanning the repo ── */
const SKIP = new Set(['node_modules', '.git', '_site', 'private', 'vendor', 'tests']);
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir ? dir + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(rel); }
    else if (/\.(html|md)$/.test(e.name)) pages.push(rel);
  }
})('');
const hosts = [];
for (const p of pages) {
  const src = read(p);
  for (const m of src.matchAll(/<[^>]*\bdata-stage-model="([^"]+)"[^>]*>/g)) {
    const url = m[1].replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/, '$1');
    const glow = (m[0].match(/data-stage-glow="([^"]+)"/) || [])[1];
    hosts.push({ page: p, src, url, glow });
  }
}
check('the scan read the site and found the Gambit\'s two altars', pages.length > 100 &&
  hosts.filter(h => h.page === 'the-gambit/index.html').length === 2, `${pages.length} pages, ${hosts.length} hosts`);

function glbJson(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'glTF' || b.readUInt32LE(4) !== 2) return null;
  return JSON.parse(b.toString('utf8', 20, 20 + b.readUInt32LE(12)));
}
for (const h of hosts) {
  const file = path.join(ROOT, h.url);
  const json = fs.existsSync(file) ? glbJson(file) : null;
  check(`${h.page}: ${h.url} is a glTF 2 binary`, !!json);
  const mats = json ? (json.materials || []).map(m => m.name) : [];
  check(`${h.page}: glow material "${h.glow}" is in the model`, !!h.glow && mats.includes(h.glow),
    'renamed in Blender? update data-stage-glow — ' + JSON.stringify(mats));
  check(`${h.page}: the page loads pjcc-stage.js`, /<script[^>]*src="[^"]*\/assets\/js\/pjcc-stage\.js[^"]*"/.test(h.src));
}

/* ── 2. the bundle the script loads is the one the generator writes, and it has every class used ── */
const libRel = (STAGE.match(/'(vendor\/three\/[\w.]+\.js)'/) || [])[1];
const genOut = (GEN.match(/path\.join\(ROOT, 'assets', 'vendor', 'three', '([\w.]+)'\)/) || [])[1];
check('pjcc-stage.js and gen-three.js name the same bundle', !!libRel && libRel === 'vendor/three/' + genOut, libRel);
const BUNDLE = libRel && fs.existsSync(path.join(ROOT, 'assets', libRel)) ? read('assets/' + libRel) : '';
check('the bundle is committed and defines PJCC3', /^var PJCC3=/m.test(BUNDLE), (BUNDLE.length / 1024 | 0) + ' KB');
const exportList = (GEN.match(/const EXPORTS = \[([\s\S]*?)\];/) || ['', ''])[1].match(/'(\w+)'/g) || [];
const exported = exportList.map(s => s.slice(1, -1)).concat('GLTFLoader');
const used = [...new Set([...STAGE.matchAll(/\bT\.([A-Z]\w+)/g)].map(m => m[1]))];
check('the stage script uses three.js classes (scan is not empty)', used.length >= 8, used.join(' '));
const missing = used.filter(n => !exported.includes(n) || !new RegExp('\\b' + n + ':').test(BUNDLE));
check('every class it uses is exported by the built bundle', missing.length === 0,
  missing.length ? 'missing: ' + missing.join(' ') + ' — add to EXPORTS, npm run gen:three' : '');

/* ── 3. the Gambit can never charge for an altar animation ── */
const fx = (GAMBIT.match(/function altarFx\(kind\) \{[^\n]*\}/) || [''])[0];
check('altarFx swallows its own errors', /^function altarFx\(kind\) \{ try \{[^\n]*pjccStage\.react\(kind\)[^\n]*\} catch \(e\) \{\} \}$/.test(fx));
const cs = GAMBIT.indexOf('async function commit()'), ce = GAMBIT.indexOf('function reveal(', cs);
const commit = cs > 0 && ce > cs ? GAMBIT.slice(cs, ce) : '';
check('commit() is in view', commit.length > 3000, commit.length + ' chars');
check('commit() touches the altar only through altarFx', !/pjccStage/.test(commit));
check('commit() lights the offering, the outcome and the rest',
  /altarFx\('offer'\)/.test(commit) &&
  /altarFx\(tier\.mult > 1 \? 'gain' : win \? 'even' : 'loss'\)/.test(commit) &&
  /rested = true; altarFx\('rest'\)/.test(commit));

/* ── 4. live ── */
const altarTag = (GAMBIT.match(/<div class="gambit-altar" id="gm-altar"[\s\S]*?<\/div>\s*<\/div>/) || [''])[0]
  .replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g, '$1');
const style = (GAMBIT.match(/<style>([\s\S]*?)<\/style>/) || ['', ''])[1];
const page = (extra) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#160c33}
${style} .gambit-coin{visibility:hidden} ${extra.css || ''}</style>
<div class="gambit" style="width:640px">${extra.body || altarTag}</div>
<script src="/assets/js/pjcc-stage.js" defer></script>`;
const PAGES = {
  '/p/main.html': page({}),
  '/p/pair.html': page({ body: altarTag + `<div hidden>${altarTag.replace('id="gm-altar"', 'id="gm-hidden"')}</div>` }),
  '/p/nomodel.html': page({ body: altarTag.replace(/gambit-altar\.glb/, 'nope.glb') }),
};

(async () => {
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    if (PAGES[u]) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGES[u]); }
    const f = path.join(ROOT, u);
    if (!u.startsWith('/assets/') || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'model/gltf-binary' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => srv.listen(0, r));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new',
    args: ['--no-sandbox', '--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function open(url, opts = {}) {
    const p = await browser.newPage();
    await p.setViewport({ width: 800, height: 600 });
    if (opts.reduce) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    if (opts.block) {
      await p.setRequestInterception(true);
      p.on('request', r => r.url().includes(opts.block) ? r.abort() : r.continue());
    }
    await p.goto(base + url);
    await p.waitForFunction(() => /live|down/.test(document.getElementById('gm-altar').dataset.stageState || ''), { timeout: 20000 })
      .catch(() => {});
    await sleep(400);
    return p;
  }
  const state = (p, id = 'gm-altar') => p.evaluate((i) => document.getElementById(i).dataset.stageState, id);
  const shot = async (p) => (await (await p.$('#gm-altar')).screenshot({ encoding: 'base64' }));
  // counts pixels of a screenshot in-page, so no PNG decoder is needed here
  const measure = (p, b64) => p.evaluate(async (src) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let body = 0, gold = 0, lum = 0;
    for (let i = 0; i < d.length; i += 4) {
      const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
      if (Math.abs(r - 0x16) + Math.abs(g - 0x0c) + Math.abs(b - 0x33) < 30) continue;
      body++; lum += r + g + b;
      if (r > 170 && g > 130 && b < 110) gold++;
    }
    return { body, gold, lum: body ? lum / body / 3 : 0 };
  }, b64);
  const react = (p, k) => p.evaluate((kind) => document.getElementById('gm-altar').pjccStage.react(kind), k);

  try {
    let p = await open('/p/main.html');
    check('the altar goes live', await state(p) === 'live');
    const live = await p.evaluate(() => ({
      canvas: !!document.querySelector('#gm-altar > canvas.stage-canvas'),
      glow: getComputedStyle(document.querySelector('#gm-altar .gambit-glow')).display,
    }));
    check('…with its canvas in, and the flat glow out', live.canvas && live.glow === 'none', JSON.stringify(live));
    const a = await shot(p), idle = await measure(p, a);
    check('the model is drawn (not an empty canvas)', idle.body > 3000, idle.body + ' px');
    await sleep(500);
    check('idle, it turns', (await shot(p)) !== a);
    await react(p, 'gain'); await sleep(700);
    const gain = await measure(p, await shot(p));
    // measured at 800px: gold 0 → ~556, mean 65 → ~126
    check('a gain turns the altar gold', gain.gold - idle.gold > 250 && gain.lum > idle.lum * 1.5,
      `${idle.gold} → ${gain.gold} gold px, ${idle.lum.toFixed(0)} → ${gain.lum.toFixed(0)} mean`);
    await sleep(2500);
    await react(p, 'loss'); await sleep(500);
    const loss = await measure(p, await shot(p));
    check('a loss dims it', loss.lum < idle.lum * 0.8, `${idle.lum.toFixed(0)} → ${loss.lum.toFixed(0)} mean`);
    await react(p, 'rest'); await sleep(1500);
    const r1 = await shot(p); await sleep(500);
    check('at rest, it holds still', (await shot(p)) === r1);
    await p.close();

    p = await open('/p/main.html', { reduce: true });
    const m1 = await shot(p); await sleep(600);
    check('Reduce Motion: live but not turning', await state(p) === 'live' && (await shot(p)) === m1);
    await p.close();

    p = await open('/p/pair.html');
    check('a hidden host costs nothing (never loads)', await state(p) === 'live' && await state(p, 'gm-hidden') === 'waiting');
    await p.close();

    for (const [what, url, opts] of [['bundle blocked', '/p/main.html', { block: 'three.pjcc' }], ['model missing', '/p/nomodel.html', {}]]) {
      p = await open(url, opts);
      const down = await p.evaluate(() => ({
        canvas: !!document.querySelector('canvas'),
        glow: getComputedStyle(document.querySelector('#gm-altar .gambit-glow')).display,
        coin: !!document.querySelector('#gm-altar .gambit-coin'),
      }));
      check(`${what}: the flat altar stays`, await state(p) === 'down' && !down.canvas && down.glow !== 'none' && down.coin, JSON.stringify(down));
      await p.close();
    }
  } catch (e) {
    check('live run finished', false, e.message);
  }
  await browser.close();
  srv.close();
  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})();
