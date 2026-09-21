#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   gen-broadcast.js  —  npm run wc

   Game day, in one command. His scope (2026-09-21): a finished clip within an HOUR of the
   game ending.

       npm run wc -- <any lichess broadcast URL of the match>     first time: remembers the match
       npm run wc                                                  the latest finished game
       npm run wc -- --game 7                                      a particular game
       npm run wc -- --render                                      …and record both clips
       npm run wc -- --rehearse [--render]                         every game, timed
       npm run wc -- --pgn file.pgn                                offline: a saved PGN instead

   Fetch → grade → the board's data/game.json → (with --render) Godot records the square and
   the vertical cut, ffmpeg stitches them, and a voice file in the folder is laid under both.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const G = require('./gen-godot-game.js');

const ROOT = path.join(__dirname, '..');
const BOARD = process.env.BOARD_PROJECT || path.join(os.homedir(), 'Documents', 'chesswild-board');
const MATCH_FILE = path.join(ROOT, 'private', 'docs', 'godot', 'tournament_board', 'match.json');
const GODOT = process.env.GODOT || path.join(os.homedir(), 'Desktop', 'Godot', 'Godot_v4.7-stable_win64_console.exe');
const VIDEOS = process.env.WC_OUT || path.join(os.homedir(), 'Videos', 'ChessWild');
const ENGINE_MS = 1000;            // the eval bar only — see `marks` in gen-godot-game.js
const FPS = 30;

function args() {
  const a = process.argv.slice(2), o = { url: null, game: null, render: false, rehearse: false, pgn: null, out: null };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--game') o.game = +a[++i];
    else if (a[i] === '--render') o.render = true;
    else if (a[i] === '--rehearse') o.rehearse = true;
    else if (a[i] === '--pgn') o.pgn = a[++i];
    else if (a[i] === '--out') o.out = a[++i];
    else if (/^https?:\/\//.test(a[i]) || /^[A-Za-z0-9]{8}$/.test(a[i])) o.url = a[i];
  }
  return o;
}

function readMatch() {
  try { return JSON.parse(fs.readFileSync(MATCH_FILE, 'utf8')); } catch (e) { return {}; }
}

async function get(url, kind) {
  const r = await fetch(url, { headers: { Accept: kind === 'json' ? 'application/json' : 'application/x-chess-pgn' } });
  if (!r.ok) throw new Error(url + ' answered ' + r.status);
  return kind === 'json' ? r.json() : r.text();
}

/* A broadcast URL names a ROUND (…/<roundId>[/<gameId>]); the whole match is its TOUR. */
async function tourFrom(ref) {
  if (/^[A-Za-z0-9]{8}$/.test(ref)) return ref;
  const ids = ref.split(/[/?#]/).filter((s) => /^[A-Za-z0-9]{8}$/.test(s));
  for (const id of ids) {
    try { const j = await get('https://lichess.org/api/broadcast/-/-/' + id, 'json'); if (j && j.tour) return j.tour.id; } catch (e) {}
  }
  throw new Error('no Lichess broadcast round found in ' + ref);
}

function splitGames(pgn) {
  return pgn.split(/\r?\n(?=\[Event )/).filter((s) => /\S/.test(s));
}

function tag(pgn, t) {
  const m = new RegExp('\\[' + t + ' "([^"]*)"\\]').exec(pgn);
  return m ? m[1] : '';
}

const POINTS = { '1-0': [1, 0], '0-1': [0, 1], '1/2-1/2': [0.5, 0.5] };

/* ⭐ THE SCORE COMES OFF THE GAMES THEMSELVES, never typed in: sum every finished game before
   this one, by player name. */
function scoreBefore(games, n) {
  const s = {};
  games.forEach((g) => {
    const r = parseFloat(tag(g, 'Round'));
    const p = POINTS[tag(g, 'Result')];
    if (!p || !(r < n)) return;
    s[tag(g, 'White')] = (s[tag(g, 'White')] || 0) + p[0];
    s[tag(g, 'Black')] = (s[tag(g, 'Black')] || 0) + p[1];
  });
  return s;
}

function pick(games, n) {
  if (n) {
    const g = games.find((x) => parseFloat(tag(x, 'Round')) === n);
    if (!g) throw new Error('no game ' + n + ' in the broadcast yet');
    return g;
  }
  const done = games.filter((x) => POINTS[tag(x, 'Result')]);
  if (!done.length) throw new Error('no finished game in the broadcast yet');
  return done.sort((a, b) => parseFloat(tag(a, 'Round')) - parseFloat(tag(b, 'Round')))[done.length - 1];
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

async function prepare(games, pgn, match, log) {
  const t0 = Date.now();
  const n = parseFloat(tag(pgn, 'Round')) || 0;
  let game = G.convert(pgn);
  if (!game.graded_by) {
    game = await G.gradeWithEngine(game, ENGINE_MS, (i, t) => { if (i % 20 === 0) log('    … ' + i + ' / ' + t); });
    if (!game.marks) {
      log('  ⚠ the broadcast has no engine evals for this game yet. Local Stockfish drove the eval bar, and the'
        + ' clip goes out WITHOUT ?! ? ?? marks. Run again once Lichess has analysed the game to get them.');
    }
  }
  const before = scoreBefore(games, n);
  const p = POINTS[game.result] || [0, 0];
  const w = before[game.white] || 0, b = before[game.black] || 0;
  game.match = {
    title: match.title || 'The World Championship',   // ⚠ never the PGN's Event: it carries the sponsor's name
    game: n,
    games: match.games || 14,
    before: [w, b],
    after: [w + p[0], b + p[1]],
  };
  return { game, seconds: (Date.now() - t0) / 1000 };
}

function writeGame(game) {
  const out = path.join(BOARD, 'data', 'game.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(game, null, 1), 'utf8');
  return out;
}

function half(x) { return Math.floor(x) + (x % 1 ? '½' : ''); }

/* ⚠ GODOT MUST RUN WINDOWED — a headless Godot renders nothing. The window size does not matter:
   the board renders at its layout size and the recorder saves the viewport, not the window. */
function record(layout, dir, log) {
  const t0 = Date.now();
  fs.mkdirSync(dir, { recursive: true });
  const r = spawnSync(GODOT, ['--path', BOARD, '--resolution', layout === 'vertical' ? '540x960' : '720x720',
    '--', '--capture', '--layout=' + layout, '--out=' + dir.replace(/\\/g, '/')],
    { encoding: 'utf8', timeout: 30 * 60 * 1000 });
  const said = (r.stdout || '') + (r.stderr || '');
  const wrote = /wrote (\d+) frames/.exec(said);
  if (!wrote) { log(said.split('\n').slice(-25).join('\n')); throw new Error('the ' + layout + ' recording did not finish'); }
  return { frames: +wrote[1], seconds: (Date.now() - t0) / 1000 };
}

function stitch(dir, mp4, voice) {
  const t0 = Date.now();
  const a = ['-y', '-framerate', String(FPS), '-i', path.join(dir, 'f%05d.png')];
  /* ⚠ PADDED, THEN CUT TO THE VIDEO: a short voice-over must not chop the clip (measured — -shortest
     alone cut an 80s clip to 31s under a 30s take). A long one ends when the clip does. */
  if (voice) a.push('-i', voice, '-map', '0:v', '-map', '1:a', '-af', 'apad', '-c:a', 'aac', '-shortest');
  a.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', mp4);
  execFileSync('ffmpeg', a, { stdio: 'ignore' });
  return (Date.now() - t0) / 1000;
}

function voiceIn(dir) {
  for (const ext of ['wav', 'm4a', 'mp3']) {
    const f = path.join(dir, 'voice.' + ext);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

async function one(games, pgn, match, o, log) {
  const t0 = Date.now();
  const { game, seconds } = await prepare(games, pgn, match, log);
  const file = writeGame(game);
  const m = game.match;
  log('  Game ' + m.game + ': ' + game.white_short + ' – ' + game.black_short + '  ' + game.result
    + '   (score before ' + half(m.before[0]) + '–' + half(m.before[1]) + ', after ' + half(m.after[0]) + '–' + half(m.after[1]) + ')');
  log('  ' + game.moves.length + ' plies · graded by ' + game.graded_by + ' · biggest swing at ply ' + game.swing_ply
    + ' · ' + seconds.toFixed(1) + 's');
  log('  → ' + file);
  const times = { prepare: seconds };
  if (o.render) {
    const dir = path.join(o.out || VIDEOS, slug(game.white_short + '-vs-' + game.black_short + '-game-' + m.game));
    const voice = voiceIn(dir);
    for (const layout of ['square', 'vertical']) {
      const r = record(layout, path.join(dir, layout), log);
      times[layout] = r.seconds;
      times[layout + '_mp4'] = stitch(path.join(dir, layout), path.join(dir, 'game-' + m.game + '-' + layout + '.mp4'), voice);
      log('  ' + layout + ': ' + r.frames + ' frames (' + (r.frames / FPS).toFixed(1) + 's of video) in '
        + r.seconds.toFixed(0) + 's, stitched in ' + times[layout + '_mp4'].toFixed(0) + 's');
    }
    log('  → ' + dir + (voice ? '   (voice: ' + path.basename(voice) + ')' : '   (no voice file — drop voice.wav in the folder and run again)'));
  }
  times.total = (Date.now() - t0) / 1000;
  return times;
}

async function main() {
  const o = args();
  const match = readMatch();
  const log = (s) => console.log(s);
  let pgn;
  if (o.pgn) pgn = fs.readFileSync(o.pgn, 'utf8');
  else {
    const tour = o.url ? await tourFrom(o.url) : match.tour;
    if (!tour) { console.log('usage: npm run wc -- <lichess broadcast URL of the match>   (only the first time)'); process.exit(1); }
    if (tour !== match.tour) {
      match.tour = tour;
      fs.mkdirSync(path.dirname(MATCH_FILE), { recursive: true });
      fs.writeFileSync(MATCH_FILE, JSON.stringify(match, null, 1));
      log('  remembered the match: lichess.org broadcast ' + tour);
    }
    pgn = await get('https://lichess.org/api/broadcast/' + tour + '.pgn', 'pgn');
  }
  const games = splitGames(pgn);
  log('=== ' + (tag(games[0] || '', 'Event') || 'the match') + ' — ' + games.length + ' game(s) in the broadcast ===');

  if (!o.rehearse) {
    const t = await one(games, pick(games, o.game), match, o, log);
    log('RESULT: DONE in ' + (t.total / 60).toFixed(1) + ' min');
    return;
  }
  const rows = [];
  for (const g of games.filter((x) => POINTS[tag(x, 'Result')])) {
    log('');
    rows.push({ n: tag(g, 'Round'), t: await one(games, g, match, o, log) });
  }
  log('\n=== REHEARSAL: minutes per game, fetch to finished clips ===');
  rows.forEach((r) => log('  game ' + r.n.padStart(2) + '   ' + (r.t.total / 60).toFixed(1) + ' min'));
  const worst = Math.max(...rows.map((r) => r.t.total)) / 60;
  log('RESULT: ' + (worst <= 60 ? 'PASS' : 'OVER') + ' — the slowest game took ' + worst.toFixed(1) + ' min of the 60');
}

/* ⚠ EXIT BY HAND: a Stockfish that graded a game keeps the process alive after the last line. */
if (require.main === module) main().then(() => process.exit(0), (e) => { console.error('FAILED — ' + e.message); process.exit(1); });
module.exports = { splitGames, scoreBefore, pick, tag, tourFrom, slug };
