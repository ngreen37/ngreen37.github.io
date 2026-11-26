/* pjcc-wc.js — chesswild.com/wc/: the World Championship. Predict the next game, a puzzle from every game, the best
   predictors, and every game's result.
   His 11-26, from the growth list: "let's do #1 and #2" — predict each game with a free account, and a puzzle from each
   game's position ("Try and solve a puzzle from this game's position at chessWild.com").
   · The match is assets/data/<event>.json, written by the clip machine each game day (tests/wc-site.js).
   · Predictions are Supabase's predict_* (docs/wc-predictions-setup.md). Until that SQL runs the panel is ABSENT:
     probed once, never drawn half-working.
   ⚠ window.PJCC loads AFTER this page's content: wait for it, never add a second copy of pjcc-profile.js.
   ⚠ The profile bar boots only if PJCC exists when it runs, so it is loaded from here, once PJCC does. */
(function () {
  'use strict';
  var root = document.getElementById('wc');
  if (!root) return;
  var C = window.PJCCChess;
  var DATA = null, EVENT = 'wc2026', SPLIT = null, MINE = {}, OPEN = false, BUSY = false;
  var PC_PX = 160;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nameOf(key) { var p = (DATA.players || []).filter(function (x) { return x.key === key; })[0]; return p ? p.name : key; }
  function half(x) { var w = Math.floor(x); return (w === 0 && x % 1 ? '' : String(w)) + (x % 1 ? '½' : ''); }
  function when(iso) {
    try { return new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return iso; }
  }
  function started(g) { return g.starts && Date.parse(g.starts) <= Date.now(); }

  /* ── the match ──────────────────────────────────────────────────────────────────── */
  function score() {
    var pts = {};
    (DATA.players || []).forEach(function (p) { pts[p.key] = 0; });
    DATA.games.forEach(function (g) {
      if (g.result === 'draw') { pts[g.white] += 0.5; pts[g.black] += 0.5; }
      else if (g.result && pts[g.result] != null) pts[g.result] += 1;
    });
    return pts;
  }
  function renderScore() {
    var pts = score(), ps = DATA.players || [];
    if (ps.length !== 2) return;
    $('wc-p1').textContent = ps[0].name;
    $('wc-p2').textContent = ps[1].name;
    $('wc-score').textContent = 'Match score ' + (half(pts[ps[0].key]) || '0') + ' – ' + (half(pts[ps[1].key]) || '0');
  }
  function renderGames() {
    var list = $('wc-game-list');
    list.innerHTML = DATA.games.map(function (g) {
      var line;
      if (g.result) {
        var r = g.result === 'draw' ? '½–½' : (g.result === g.white ? '1–0' : '0–1');
        line = '<span class="wc-g-who">' + esc(nameOf(g.white)) + ' – ' + esc(nameOf(g.black)) + '</span> <b class="wc-g-res">' + r + '</b>'
          + (g.puzzle ? ' <a class="wc-g-pz" href="#game-' + g.game + '">puzzle</a>' : '');
      } else if (started(g)) line = '<b class="wc-g-live">being played now</b>';
      else line = '<span class="wc-g-when">' + esc(when(g.starts)) + '</span>';
      return '<li class="wc-g' + (g.result ? ' done' : '') + '"><span class="wc-g-n">Game ' + g.game + '</span> ' + line + '</li>';
    }).join('');
  }

  /* ── a puzzle from every game: find the best move ──────────────────────────────── */
  function pal() {
    var s = getComputedStyle(document.documentElement);
    function v(k, d) { var x = s.getPropertyValue(k).trim(); return x || d; }
    return { wFill: v('--piece-w-fill', '#ffffff'), wEdge: v('--piece-w-line', '#2f2440'),
             bFill: v('--piece-b-fill', '#4a3585'), bEdge: v('--piece-b-line', '#f2e9ff') };
  }
  var GLYPH = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
  function paint(cv, pc) {
    var ctx = cv.getContext('2d'), mid = PC_PX * 0.5, white = pc === pc.toUpperCase();
    ctx.clearRect(0, 0, PC_PX, PC_PX);
    if (window.PJCCPieces) { PJCCPieces.draw(ctx, mid, mid, PC_PX * 0.8125, pc.toUpperCase(), white ? 'w' : 'b', pal()); return; }
    var P = pal();
    ctx.fillStyle = white ? P.wFill : P.bFill;
    ctx.font = '900 ' + Math.round(PC_PX * 0.75) + 'px "Segoe UI Symbol","Apple Symbols",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(GLYPH[pc.toUpperCase()], mid, PC_PX * 0.547);
  }

  function Puzzle(g, host) {
    var pz = g.puzzle, S = C.parseFEN(pz.fen), flip = pz.side === 'b', sel = -1, done = false;
    var mover = nameOf(pz.side === 'w' ? g.white : g.black);
    host.innerHTML = '<h3 class="wc-pz-h">Game ' + g.game + ' · ' + esc(mover) + ' to Move</h3>'
      + '<div class="wc-board" role="grid" aria-label="Game ' + g.game + ' puzzle board"></div>'
      + '<p class="wc-pz-say" aria-live="polite">Find the best move.</p>'
      + '<button type="button" class="wc-pz-again" hidden>Try it again</button>';
    var board = host.querySelector('.wc-board'), say = host.querySelector('.wc-pz-say'), again = host.querySelector('.wc-pz-again');
    function sqAt(r, f) { return flip ? (7 - r) * 8 + (7 - f) : r * 8 + f; }
    function draw(sol) {
      var legal = sel >= 0 ? C.legalMoves(S).filter(function (m) { return m.from === sel; }) : [];
      var html = '';
      for (var r = 0; r < 8; r++) for (var f = 0; f < 8; f++) {
        var i = sqAt(r, f), pc = S.b[i], lt = (Math.floor(i / 8) + i % 8) % 2 === 0;
        var go = legal.filter(function (m) { return m.to === i; }).length > 0;
        var cls = 'wc-sq ' + (lt ? 'lt' : 'dk') + (i === sel ? ' from' : '') + (go ? (pc ? ' cap' : ' go') : '')
          + (sol && (i === sol.from || i === sol.to) ? ' sol' : '');
        var name = C.nameFromSq(i);
        html += '<button type="button" class="' + cls + '" data-i="' + i + '" aria-label="' + name + (pc ? ' ' + pc : '') + '"'
          + (done ? ' tabindex="-1"' : '') + '>'
          + (pc ? '<canvas class="wc-pc" width="' + PC_PX + '" height="' + PC_PX + '" data-pc="' + pc + '"></canvas>' : '')
          + (f === 0 ? '<i class="wc-rank">' + name[1] + '</i>' : '') + (r === 7 ? '<i class="wc-file">' + name[0] + '</i>' : '')
          + '</button>';
      }
      board.innerHTML = html;
      Array.prototype.forEach.call(board.querySelectorAll('canvas.wc-pc'), function (cv) { paint(cv, cv.getAttribute('data-pc')); });
    }
    function answer() {
      var u = pz.uci;
      return C.legalMoves(S).filter(function (m) {
        return C.nameFromSq(m.from) === u.slice(0, 2) && C.nameFromSq(m.to) === u.slice(2, 4) && (!u[4] || (m.promo || '').toLowerCase() === u[4]);
      })[0];
    }
    function verdict(right) {
      var sol = answer(), num = pz.move + (pz.side === 'w' ? '. ' : '... ') + pz.san;
      done = true;
      sel = -1;
      say.innerHTML = right
        ? '<b class="wc-ok">Right: ' + esc(num) + '.</b> ' + (pz.found ? esc(mover) + ' found it in the game.' : 'In the game, ' + esc(mover) + ' played ' + esc(pz.played) + '.')
        : '<b class="wc-no">Not this one.</b> The best move is ' + esc(num) + (pz.found ? ', and ' + esc(mover) + ' found it in the game.' : '.');
      again.hidden = false;
      draw(sol);
      try { localStorage.setItem('wc.pz.' + EVENT + '.' + g.game, right ? 'right' : 'wrong'); } catch (e) {}
    }
    board.addEventListener('click', function (e) {
      var b = e.target.closest('.wc-sq');
      if (!b || done) return;
      var i = +b.getAttribute('data-i'), pc = S.b[i];
      if (sel >= 0) {
        var m = C.legalMoves(S).filter(function (x) { return x.from === sel && x.to === i; });
        if (m.length) {
          var sol = answer();
          verdict(!!sol && sol.from === m[0].from && sol.to === m[0].to);
          return;
        }
      }
      sel = pc && C.colorOf(pc) === S.turn && sel !== i ? i : -1;
      draw();
    });
    again.addEventListener('click', function () { done = false; sel = -1; again.hidden = true; say.textContent = 'Find the best move.'; draw(); });
    draw();
  }
  function renderPuzzles() {
    var list = $('wc-puzzle-list'), games = DATA.games.filter(function (g) { return g.puzzle; }).reverse();
    if (!games.length) { list.innerHTML = '<p class="wc-quiet">The first puzzle arrives with the first game.</p>'; return; }
    list.innerHTML = games.map(function (g) { return '<article class="wc-pz" id="game-' + g.game + '"></article>'; }).join('');
    games.forEach(function (g) { Puzzle(g, $('game-' + g.game)); });
    if (location.hash && $(location.hash.slice(1))) $(location.hash.slice(1)).scrollIntoView();
  }

  /* ── predict the next game (docs/wc-predictions-setup.md) ──────────────────────── */
  function db() { return window.PJCC && PJCC.enabled !== false && PJCC.db ? PJCC.db() : null; }
  function next() { return DATA.games.filter(function (g) { return !started(g) && !g.result; })[0] || null; }
  function renderPredict() {
    var g = next(), box = $('wc-predict');
    if (!OPEN || !g) { box.hidden = true; return; }
    box.hidden = false;
    var me = window.PJCC && PJCC.currentUser && PJCC.currentUser(), prof = window.PJCC && PJCC.getProfile && PJCC.getProfile();
    var mine = MINE[g.game], ps = DATA.players || [];
    $('wc-predict-h').textContent = 'Predict Game ' + g.game;
    $('wc-when').textContent = 'Starts ' + when(g.starts) + ' your time. Picks lock at the first move.';
    var opts = [[ps[0].key, ps[0].name + ' wins'], ['draw', 'Draw'], [ps[1].key, ps[1].name + ' wins']];
    $('wc-picks').innerHTML = opts.map(function (o) {
      return '<button type="button" class="wc-pick" data-pick="' + o[0] + '" aria-pressed="' + (mine === o[0]) + '">' + esc(o[1]) + '</button>';
    }).join('');
    var counts = {}, total = 0;
    (SPLIT || []).filter(function (r) { return r.game === g.game; }).forEach(function (r) { counts[r.pick] = (counts[r.pick] || 0) + r.n; total += r.n; });
    $('wc-split').textContent = total ? total + (total === 1 ? ' pick' : ' picks') + ' so far: ' + opts.map(function (o) {
      return (o[0] === 'draw' ? 'Draw' : nameOf(o[0])) + ' ' + Math.round(100 * (counts[o[0]] || 0) / total) + '%';
    }).join(' · ') : '';
    $('wc-note').textContent = !me ? 'Make your pick with a free account: sign in just below.'
      : !(prof && prof.codename) ? 'Claim a codename just below, then make your pick.'
      : mine ? 'Your pick is in. You can change it until the first move.' : 'Pick a result.';
  }
  function loadSplit() {
    return db().rpc('predict_split', { ev: EVENT }).then(function (r) { if (r.error) throw r.error; SPLIT = r.data || []; });
  }
  function loadMine() {
    MINE = {};
    var me = PJCC.currentUser && PJCC.currentUser();
    if (!me) return Promise.resolve();
    return db().from('predict_picks').select('game,pick').eq('event', EVENT).then(function (r) {
      (r.data || []).forEach(function (row) { MINE[row.game] = row.pick; });
    });
  }
  function loadBoard() {
    return db().rpc('predict_board', { ev: EVENT, top: 25 }).then(function (r) {
      var rows = (r.data || []).filter(function (x) { return x.called > 0; });
      $('wc-leaders').hidden = !rows.length;
      $('wc-board-list').innerHTML = rows.map(function (x) {
        return '<li><span class="wc-b-name">' + esc(x.codename) + '</span> <span class="wc-b-n">' + x.right_calls + ' of ' + x.called + ' right</span></li>';
      }).join('');
    });
  }
  function choose(pick) {
    var g = next(), me = PJCC.currentUser && PJCC.currentUser(), prof = PJCC.getProfile && PJCC.getProfile();
    if (!g || BUSY) return;
    if (!me || !(prof && prof.codename)) {
      var f = $('pjcc-email') || $('pjcc-codename');
      if (f) { f.scrollIntoView({ block: 'center' }); f.focus(); }
      return;
    }
    BUSY = true;
    db().from('predict_picks').upsert({ user_id: me.id, event: EVENT, game: g.game, pick: pick, at: new Date().toISOString() },
      { onConflict: 'user_id,event,game' }).then(function (r) {
      BUSY = false;
      if (r.error) { $('wc-note').textContent = Date.parse(g.starts) <= Date.now() ? 'Game ' + g.game + ' has started: picks are locked.' : 'That pick did not save. Try again in a moment.'; return; }
      MINE[g.game] = pick;
      return loadSplit().then(renderPredict);
    }, function () { BUSY = false; });
  }
  /* ⚠ PROBED ONCE A VISIT: a missing function stays missing, so a sign-in does not ask again (follows-setup's posture). */
  var probed = null;
  function route() {
    if (!db()) { OPEN = false; renderPredict(); return; }
    if (!probed) probed = loadSplit().then(function () { OPEN = true; }, function () { OPEN = false; });
    probed.then(function () {
      if (!OPEN) return null;
      return Promise.all([loadMine(), loadBoard(), loadSplit()]);
    }).then(renderPredict, renderPredict);
  }
  $('wc-picks').addEventListener('click', function (e) {
    var b = e.target.closest('.wc-pick');
    if (b) choose(b.getAttribute('data-pick'));
  });

  function whenPJCC(fn) {
    if (window.PJCC) { fn(); return; }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { if (window.PJCC) fn(); });
    else setTimeout(function () { if (window.PJCC) fn(); }, 0);
  }

  fetch(root.getAttribute('data-src'), { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    DATA = d;
    EVENT = d.event || EVENT;
    renderScore();
    renderGames();
    if (C) renderPuzzles();
    whenPJCC(function () {
      var bar = document.createElement('script');
      bar.src = root.getAttribute('data-bar');
      document.body.appendChild(bar);
      PJCC.ready.then(route);
      PJCC.onChange(route);
    });
  }, function () {
    $('wc-score').textContent = 'The match is not loading right now. Try again in a moment.';
  });
})();
