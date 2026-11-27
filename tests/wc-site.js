/* wc-site.js — what the clip machine leaves on chesswild.com and for YouTube, each game day (his 11-26 picks #1 #2 #3 #5).
     · assets/data/<event>.json  the match for /wc/: schedule, results, and each game's puzzle (wc-puzzle.js)
     · predict_settle            the result, to the server, so the predictions leaderboard can score it
     · youtube.txt + thumbnail.png  one title, description, pinned comment and thumbnail pattern, every game
   ⚠ The puzzle search is a minute of Stockfish a game, so a game's puzzle is searched once: "puzzle": null in the
   file means searched and none found (Game 2, a quiet 20-move draw), and is not searched again. */
'use strict';
const fs = require('fs');
const path = require('path');
const P = require('./wc-puzzle.js');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://chesswild.com';
const PAGE = SITE + '/wc/';
const POINTS = { '1-0': 1, '0-1': 1, '1/2-1/2': 1 };

function dataPath(event) { return path.join(ROOT, 'assets', 'data', event + '.json'); }
function readData(event) { try { return JSON.parse(fs.readFileSync(dataPath(event), 'utf8')); } catch (e) { return null; } }
function keyOf(name) { return String(name || '').toLowerCase().replace(/[^a-z]/g, ''); }

/* The result as /wc/ and the server name it: the winner's key, or 'draw'. */
function resultKey(game) {
  if (game.result === '1/2-1/2') return 'draw';
  if (game.result === '1-0') return keyOf(game.white_short);
  if (game.result === '0-1') return keyOf(game.black_short);
  return null;
}

/* ⭐ The match for /wc/, from Lichess's own schedule and the finished games. */
async function refresh(match, rounds, finished, eng, log, G, known) {
  const event = match.event || 'wc2026';
  const was = readData(event) || {};
  const old = {};
  (was.games || []).forEach((g) => { old[g.game] = g; });
  const players = {};
  const games = rounds.map((r, i) => {
    const n = +((/(\d+)/.exec(r.name || '') || [])[1] || i + 1);
    return { game: n, starts: r.startsAt ? new Date(r.startsAt).toISOString() : null };
  });
  for (const g of games) {
    const pgn = finished[g.game];
    if (!pgn) continue;
    const game = G.convert(pgn);
    players[keyOf(game.white_short)] = game.white_short;
    players[keyOf(game.black_short)] = game.black_short;
    Object.assign(g, { white: keyOf(game.white_short), black: keyOf(game.black_short), result: resultKey(game),
      plies: game.moves.length });
    if (known && known[g.game] !== undefined) g.puzzle = known[g.game];
    else if (old[g.game] && 'puzzle' in old[g.game]) g.puzzle = old[g.game].puzzle;
    else if (eng) {
      log('  Game ' + g.game + ': looking for its puzzle');
      g.puzzle = await P.findPuzzle(game, eng, log);
    }
  }
  const data = { event: event, title: match.title || 'World Championship',
    players: Object.keys(players).sort().map((k) => ({ key: k, name: players[k] })), games: games };
  fs.mkdirSync(path.dirname(dataPath(event)), { recursive: true });
  fs.writeFileSync(dataPath(event), JSON.stringify(data, null, 1) + '\n');
  log('  → ' + path.relative(ROOT, dataPath(event)) + ': ' + games.filter((g) => g.result).length + ' result(s), '
    + games.filter((g) => g.puzzle).length + ' puzzle(s)');
  return data;
}

/* The public Supabase address and anon key, as the site itself uses them. */
function supabase() {
  const src = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'pjcc-config.js'), 'utf8');
  return { url: (/SUPABASE_URL:\s*'([^']+)'/.exec(src) || [])[1], anon: (/SUPABASE_ANON_KEY:\s*'([^']+)'/.exec(src) || [])[1] };
}

/* ⭐ The result to the server (docs/wc-predictions-setup.md): with match.json's predictKey, which only this PC holds. */
async function settle(match, n, result, log) {
  if (!result) return false;
  if (!match.predictKey) { log('  (no predictKey in match.json: Game ' + n + '\'s result is not sent)'); return false; }
  const sb = supabase();
  let r;
  try {
    r = await fetch(sb.url + '/rest/v1/rpc/predict_settle', { method: 'POST',
      headers: { apikey: sb.anon, Authorization: 'Bearer ' + sb.anon, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ev: match.event || 'wc2026', g: n, r: result, key: match.predictKey }) });
  } catch (e) { log('  ⚠ Game ' + n + '\'s result was not recorded: ' + e.message); return false; }
  if (r.status === 404) { log('  (predictions are not set up yet — docs/wc-predictions-setup.md — so no result was sent)'); return false; }
  if (!r.ok) { log('  ⚠ Game ' + n + '\'s result was not recorded: ' + r.status + ' ' + (await r.text()).slice(0, 160)); return false; }
  log('  Game ' + n + ' recorded for the predictions leaderboard: ' + result);
  return true;
}

function half(x) { return Math.floor(x) + (x % 1 ? '½' : ''); }
/* ⚠ What people SEARCH is "World Chess Championship": his on-screen header ("2026 World Championships") stays on screen. */
function champ(m) { return 'World Chess Championship ' + ((/(\d{4})/.exec(m.title || '') || [])[1] || ''); }

/* ⭐ HIS #5 (11-26): one pattern, every game. The hook is his desk.txt "hook:", else what happened. */
function hookOf(game) {
  if (game.desk && game.desk.hook) return game.desk.hook;
  const moves = Math.ceil(game.moves.length / 2);
  if (game.result === '1/2-1/2') return 'Drawn in ' + moves + ' moves';
  if (game.result === '1-0' || game.result === '0-1') return (game.result === '1-0' ? game.white_short : game.black_short) + ' wins in ' + moves;
  return '';
}

/* the game to predict next: none after the last, and none once a player is past half the games (7½ of 14 ends it),
   so a video, its description and the pinned comment never ask for a game that will not be played */
function nextGame(m) {
  const n = m.games || 14;
  return m.game < n && Math.max.apply(null, m.after || [0]) <= n / 2 ? m.game + 1 : 0;
}

function youtube(game, data, dir, secs) {
  const m = game.match, W = game.white_short, B = game.black_short, hook = hookOf(game);
  const next = nextGame(m);
  const pz = data && (data.games || []).filter((g) => g.game === m.game)[0];
  const score = W + ' ' + half(m.after[0]) + '–' + half(m.after[1]) + ' ' + B;
  const lines = [
    'TITLE (the wide video)',
    W + ' vs ' + B + ' · Game ' + m.game + (hook ? ' · ' + hook : '') + ' · ' + champ(m).trim(),
    '',
    'TITLE (the Short)',
    W + ' vs ' + B + ', Game ' + m.game + ' in ' + Math.round(secs) + ' seconds',
    '',
    'DESCRIPTION',
    'Game ' + m.game + ' of the ' + champ(m).trim() + ', ' + W + ' (White) vs ' + B + ' (Black), in '
      + Math.round(secs) + ' seconds' + (hook ? ': ' + hook.charAt(0).toLowerCase() + hook.slice(1) : '') + '. Match score: ' + score + '.',
    '',
  ];
  if (next) lines.push('Predict Game ' + next + ' (free): ' + PAGE);
  if (pz && pz.puzzle) lines.push('Try a puzzle from this game\'s position: ' + PAGE + '#game-' + m.game);
  lines.push('Play chess free: ' + SITE, '', 'Commentary by Garrett and Jacob in the ChessWild booth. Pieces modeled in Blender for ChessWild.',
    '', '#chess #WorldChessChampionship #' + W.replace(/\s+/g, '') + ' #' + B.replace(/\s+/g, ''), '',
    'PINNED COMMENT (the wide video)',
    (next ? 'Who wins Game ' + next + '? Predict it free at chesswild.com/wc' : 'Thanks for watching the whole match')
      + (pz && pz.puzzle ? ' — and try the puzzle from this game\'s position.' : next ? '.' : '!'), '');
  fs.writeFileSync(path.join(dir, 'youtube.txt'), lines.join('\n'));
  return lines;
}

/* The thumbnail: the wide cut's own frame at the game's turning point, GAME N and the hook beside it, 1280×720.
   ⚠ Nothing in the bottom-right corner: YouTube lays the video's length over it. */
async function thumbnail(game, dir, log) {
  const frame = path.join(dir, 'thumb-wide.png');
  if (!fs.existsSync(frame)) { log('  (no thumb-wide.png, so no thumbnail)'); return null; }
  const pp = require(path.join(ROOT, 'node_modules', 'puppeteer-core'));
  const { findChrome } = require('./harness');
  const font = (w) => fs.readFileSync(path.join(ROOT, 'assets', 'fonts', 'Poppins-' + w + '-latin.woff2')).toString('base64');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const m = game.match;
  const html = '<!doctype html><html><head><style>'
    + '@font-face{font-family:P8;src:url(data:font/woff2;base64,' + font(800) + ') format("woff2")}'
    + '@font-face{font-family:P6;src:url(data:font/woff2;base64,' + font(600) + ') format("woff2")}'
    + 'html,body{margin:0;width:1280px;height:720px;overflow:hidden;background:#14121b}'
    + '.f{position:absolute;left:0;top:0;height:720px;width:1280px;background:url(data:image/png;base64,'
    + fs.readFileSync(frame).toString('base64') + ') left center/auto 100% no-repeat}'
    + '.s{position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,18,27,0) 56%,rgba(20,18,27,.97) 59%,#14121b 61%)}'
    + '.t{position:absolute;right:56px;top:70px;width:520px;text-align:right;color:#f2e9ff}'
    + '.g{font:110px/1 P8;color:#f5c518;letter-spacing:-2px}'
    + '.h{font:68px/1.05 P8;text-transform:uppercase;margin-top:26px;text-shadow:0 4px 18px #000}'
    + '.n{font:30px/1.2 P6;color:#9d95b3;margin-top:28px;text-transform:uppercase;letter-spacing:1px}'
    + '.cw{position:absolute;right:56px;top:20px;font:40px/1 P8;color:#f2f4f7}.cw b{color:#ffa07a}'
    + '</style></head><body><div class="f"></div><div class="s"></div>'
    + '<div class="cw">c<b>W</b></div><div class="t"><div class="g">GAME ' + m.game + '</div>'
    + '<div class="h">' + esc(hookOf(game)) + '</div>'
    + '<div class="n">' + esc(game.white_short) + ' vs ' + esc(game.black_short) + '<br>' + esc(champ(m).trim()) + '</div>'
    + '</div></body></html>';
  const browser = await pp.launch({ executablePath: findChrome(), headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(dir, 'thumbnail.png');
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1280, height: 720 } });
    log('  → thumbnail.png (1280×720) and youtube.txt');
    return out;
  } finally { await browser.close(); }
}

module.exports = { refresh: refresh, settle: settle, youtube: youtube, thumbnail: thumbnail, resultKey: resultKey,
  hookOf: hookOf, nextGame: nextGame, readData: readData, dataPath: dataPath, keyOf: keyOf, PAGE: PAGE, POINTS: POINTS };
