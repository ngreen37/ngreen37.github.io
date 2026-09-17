/* gen-three.js — bundles the slice of three.js the site uses into ONE classic script.
 * Run:  npm run gen:three      Out: assets/vendor/three/three.pjcc.min.js  (global PJCC3)
 * npm three@0.186 ships no minified build (2 MB raw). Need another class in a page? Add it to
 * EXPORTS and re-run. The bundle is committed; three + esbuild are dev-only. */
'use strict';
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'vendor', 'three', 'three.pjcc.min.js');
// three's exports map hides package.json from require()
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules', 'three', 'package.json'), 'utf8')).version;

const EXPORTS = [
  'WebGLRenderer', 'Scene', 'PerspectiveCamera', 'Group', 'Color', 'Box3', 'Vector3',
  'HemisphereLight', 'DirectionalLight', 'PointLight', 'SRGBColorSpace', 'ACESFilmicToneMapping',
];

const entry = `export { ${EXPORTS.join(', ')} } from 'three';
export { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export const REVISION = ${JSON.stringify(VERSION)};`;

const res = esbuild.buildSync({
  stdin: { contents: entry, resolveDir: ROOT, loader: 'js' },
  bundle: true, minify: true, format: 'iife', globalName: 'PJCC3',
  target: 'es2019', legalComments: 'none', write: false,
});
const banner = `/* three.js ${VERSION} (MIT, three.js authors) — site slice, built by tests/gen-three.js. Do not hand-edit. */\n`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, banner + res.outputFiles[0].text);
console.log(`three ${VERSION} → ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
