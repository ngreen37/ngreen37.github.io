#!/usr/bin/env node
/* ═══ THE DIALS SWEEP — npm run test:dials (2026-10-20; NOT in npm test, it takes about five minutes) ═══
 * Every Checker Town dial (core/tuning.gd's @export_range sliders) alone at each end of its slider with his other
 * values kept, then every dial low and every dial high: test:town on a throwaway copy of the game each time.
 * ⚠ A SLIDER HE MOVES MUST NOT STOP A PUSH, so every run must be green. Run it when a dial, a slider's ends, or a
 *   check that reads a dial changes; a red one is fixed by moving the slider's end or holding the ends in the check.
 * ⚠ EACH DIAL ALONE: every-low and every-high hide a dial that breaks a rule against ANOTHER dial's value
 *   (the bench's force at its low end against his load).
 * ⚠ ONE RUN AT A TIME: test:town serves on a fixed port.
 * ⚠ A GREEN WITH FEWER CHECKS THAN THE FIRST RUN IS RED: test:town skips the whole Godot half of a copy it cannot read. */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const GAME = process.env.CHECKERTOWN_PROJECT || 'C:/Users/Nate/Documents/checker-town';
const SITE = path.join(__dirname, '..');
const COPY = path.join(os.tmpdir(), 'checker-town-dials');
const GD = fs.readFileSync(path.join(GAME, 'core/tuning.gd'), 'utf8');
const RES = fs.readFileSync(path.join(GAME, 'core/tuning.tres'), 'utf8');
const NL = RES.includes('\r\n') ? '\r\n' : '\n';
const DIALS = [...GD.matchAll(/^@export_range\((-?[\d.]+), (-?[\d.]+)[^)]*\) var (\w+) := (-?[\d.]+)/gm)]
  .map((m) => ({ name: m[3], lo: m[1], hi: m[2] }));

function setDials(pairs) {
  let res = RES;
  for (const [name, v] of pairs) {
    const line = new RegExp('^' + name + ' = .*$', 'm');
    res = line.test(res) ? res.replace(line, name + ' = ' + v) : res.replace(/\s*$/, NL + name + ' = ' + v + NL);
  }
  fs.writeFileSync(path.join(COPY, 'core/tuning.tres'), res);
}

function town() {
  return new Promise((done) => {
    let out = '';
    const p = spawn(process.execPath, ['tests/town.check.js'], { cwd: SITE, env: { ...process.env, CHECKERTOWN_PROJECT: COPY } });
    p.stdout.on('data', (c) => { out += c; });
    p.stderr.on('data', (c) => { out += c; });
    p.on('close', () => {
      const m = /RESULT: (PASS|FAIL) \((?:\d+\/)?(\d+) checks[^,]*, (\d+) runtime errors?/.exec(out);
      done({
        pass: !!m && m[1] === 'PASS' && m[3] === '0',
        checks: m ? +m[2] : 0,
        verdict: m ? m[0] : 'no verdict: ' + out.trim().split('\n').slice(-3).join(' / ').slice(0, 300),
        red: out.split('\n').filter((l) => l.includes('✗')).map((l) => l.trim().slice(0, 220)),
      });
    });
  });
}

(async () => {
  if (DIALS.length === 0) { console.error('✗ no dials read off ' + path.join(GAME, 'core/tuning.gd')); process.exit(1); }
  fs.rmSync(COPY, { recursive: true, force: true });
  fs.cpSync(GAME, COPY, { recursive: true, filter: (src) => !/[\\/](\.godot|\.git|tests)$/.test(src) });
  const runs = [['his values', []]];
  for (const d of DIALS) for (const end of ['lo', 'hi']) runs.push([d.name + ' = ' + d[end], [[d.name, d[end]]]]);
  runs.push(['every dial low', DIALS.map((d) => [d.name, d.lo])], ['every dial high', DIALS.map((d) => [d.name, d.hi])]);
  console.log('THE DIALS SWEEP: ' + DIALS.length + ' dials, ' + runs.length + ' runs of test:town on a copy of ' + GAME);
  let want = 0;
  const red = [];
  for (const [label, pairs] of runs) {
    setDials(pairs);
    const r = await town();
    if (!want) {
      if (!r.pass) { console.log('✗ test:town is red at his own values, so the sweep says nothing:  ' + r.verdict + '\n    ' + r.red.join('\n    ')); process.exit(1); }
      want = r.checks;
    }
    if (r.pass && r.checks === want) { process.stdout.write('.'); continue; }
    red.push(label);
    console.log('\n✗ ' + label + '  ' + r.verdict + (r.pass ? '  (' + want + ' wanted: the copy was not read whole)' : '') + '\n    ' + r.red.join('\n    '));
  }
  fs.rmSync(COPY, { recursive: true, force: true });
  console.log('\n\nRESULT: ' + (red.length ? 'FAIL' : 'PASS') + ' (' + (runs.length - red.length) + ' of ' + runs.length + ' runs green, ' + want + ' checks each)'
    + (red.length ? '\n  red: ' + red.join(' · ') : ''));
  process.exit(red.length ? 1 : 0);
})();
