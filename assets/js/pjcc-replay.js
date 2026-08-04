/* =============================================================================
 * PJCC Replay — step back and forward through the moves of a REAL game.
 * (2026-07-27, Nate: "For all real chess games like park bench and Gauntlet, I want
 *  users to be able to use back/forward buttons to see last moves.")
 *
 * One shared control for both boards, because the two games draw completely
 * differently — the Gauntlet paints a canvas, the Park Tables build a DOM grid —
 * and the only thing they truly share is the move list. So this module owns the
 * STATE (which ply you're looking at) and the BAR, and hands the host back a
 * rebuilt position to draw however it likes.
 *
 *   var nav = PJCCReplay.mount(el, {
 *     getUci: function () { return ['e2e4','e7e5', …]; },   // or a space-joined string
 *     onView: function (view) { … }   // view = { S, last, ply } while browsing, null = live
 *   });
 *   nav.refresh();     // a move was played — re-count (stays live if it was live)
 *   nav.live();        // jump back to the live position
 *   nav.viewing();     // true while the player is looking at the past
 *
 * Browsing NEVER touches the game: the host rebuilds a throwaway position from the
 * move list. Hosts are expected to refuse input while `viewing()` is true — the bar
 * says so, and the games gray the board.
 *
 * Requires pjcc-chess.js (the referee) for the rebuild. With no referee present the
 * bar simply doesn't mount, and the game behaves exactly as it did before.
 * ========================================================================== */
(function (root) {
  'use strict';

  function C() { return root.PJCCChess; }
  function toArr(x) {
    if (Array.isArray(x)) return x.slice();
    return (x ? String(x).trim() : '').split(/\s+/).filter(Boolean);
  }

  // Rebuild the position after `n` plies. Returns { S, last, ply } — `last` is the
  // move that produced it, so the host can still paint its from/to highlight.
  function stateAt(uci, n) {
    var Cc = C(); if (!Cc) return null;
    var S = Cc.parseFEN(Cc.START_FEN), last = null;
    for (var i = 0; i < n && i < uci.length; i++) {
      var u = uci[i];
      var m = Cc.findMove(S, Cc.sqFromName(u.slice(0, 2)), Cc.sqFromName(u.slice(2, 4)), u[4] || null);
      if (!m) break;                                  // a damaged record just stops early
      last = { from: m.from, to: m.to };
      S = Cc.makeMove(S, m);
    }
    return { S: S, last: last, ply: n };
  }

  function styles() {
    if (document.getElementById('pjr-css')) return;
    var s = document.createElement('style'); s.id = 'pjr-css';
    s.textContent =
      '.pjr{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;' +
      'margin:8px auto 0;font-family:inherit;}' +
      '.pjr button{font-family:inherit;font-weight:800;font-size:13px;line-height:1;cursor:pointer;' +
      'background:#1d1140;color:#cdbcf2;border:1px solid #4a3a86;border-radius:8px;padding:7px 11px;' +
      'min-width:38px;min-height:34px;transition:border-color .12s,color .12s;}' +
      '.pjr button:hover:not(:disabled){border-color:#F5C518;color:#F5C518;}' +
      '.pjr button:disabled{opacity:.38;cursor:default;}' +
      '.pjr .pjr-live{background:#F5C518;color:#1a0f3d;border-color:#F5C518;}' +
      '.pjr .pjr-live:disabled{opacity:1;background:#1d1140;color:#6b5fa0;border-color:#4a3a86;}' +
      '.pjr-count{font-size:11.5px;color:#9a7fd4;letter-spacing:.04em;min-width:92px;text-align:center;}' +
      '.pjr-count b{color:#f0e6ff;}' +
      '.pjr-past .pjr-count{color:#ffb066;}' +
      '.pjr-note{width:100%;text-align:center;font-size:11px;color:#ffb066;letter-spacing:.03em;}';
    document.head.appendChild(s);
  }

  function mount(el, opts) {
    if (!el || !C()) return null;
    opts = opts || {};
    styles();
    // `initialPly` restores where the player was WITHOUT firing onView. That matters for
    // hosts that re-render themselves from inside onView (the Park Tables rebuild the whole
    // table view): calling go() to restore would re-enter onView → re-render → re-mount →
    // restore → forever. Setting it quietly breaks that loop.
    var ply = (opts.initialPly === undefined || opts.initialPly === null) ? null : opts.initialPly;
    var uci = toArr(opts.getUci ? opts.getUci() : []);

    el.className = (el.className ? el.className + ' ' : '') + 'pjr';
    el.innerHTML =
      '<button type="button" data-go="first" title="First move (Home)">⏮</button>' +
      '<button type="button" data-go="prev" title="Back one move (←)">◀</button>' +
      '<span class="pjr-count"></span>' +
      '<button type="button" data-go="next" title="Forward one move (→)">▶</button>' +
      '<button type="button" data-go="last" title="Latest move (End)">⏭</button>' +
      '<button type="button" data-go="live" class="pjr-live" title="Back to the live position">● Live</button>' +
      '<span class="pjr-note"></span>';

    var count = el.querySelector('.pjr-count'), note = el.querySelector('.pjr-note');

    function total() { return uci.length; }
    function viewing() { return ply !== null && ply !== total(); }

    function paint() {
      var n = total(), at = (ply === null) ? n : ply;
      el.classList.toggle('pjr-past', viewing());
      count.innerHTML = n ? ('move <b>' + Math.ceil(at / 2) + '</b> of <b>' + Math.ceil(n / 2) + '</b>') : 'no moves yet';
      note.textContent = viewing() ? 'Looking back — press ● Live to play on.' : '';
      Array.prototype.forEach.call(el.querySelectorAll('[data-go]'), function (b) {
        var g = b.getAttribute('data-go');
        b.disabled =
          (g === 'first' || g === 'prev') ? at <= 0 :
          (g === 'next' || g === 'last')  ? at >= n :
          /* live */                        !viewing();
      });
    }

    function set(next) {
      var n = total();
      ply = (next === null || next >= n) ? null : Math.max(0, next);
      paint();
      if (opts.onView) opts.onView(ply === null ? null : stateAt(uci, ply));
    }

    Array.prototype.forEach.call(el.querySelectorAll('[data-go]'), function (b) {
      b.onclick = function () {
        var n = total(), at = (ply === null) ? n : ply, g = b.getAttribute('data-go');
        if (g === 'first') set(0);
        else if (g === 'prev') set(at - 1);
        else if (g === 'next') set(at + 1);
        else set(null);                                 // 'last' and 'live' are the same place
      };
    });

    // ← / → step, Home / End jump. Ignored while typing, and only while this bar lives.
    function key(e) {
      if (!document.body.contains(el)) { document.removeEventListener('keydown', key); return; }
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var n = total(), at = (ply === null) ? n : ply;
      if (e.key === 'ArrowLeft') { e.preventDefault(); set(at - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); set(at + 1); }
      else if (e.key === 'Home') { e.preventDefault(); set(0); }
      else if (e.key === 'End') { e.preventDefault(); set(null); }
    }
    document.addEventListener('keydown', key);

    paint();
    return {
      // a move was played (or the record reloaded): re-read the list. Browsing stays put,
      // live stays live — so a rival's reply never yanks you out of the history.
      refresh: function () { uci = toArr(opts.getUci ? opts.getUci() : []); paint(); },
      live: function () { set(null); },
      go: function (n) { set(n); },
      viewing: viewing,
      ply: function () { return ply === null ? total() : ply; },
      destroy: function () { document.removeEventListener('keydown', key); }
    };
  }

  root.PJCCReplay = { mount: mount, stateAt: function (x, n) { return stateAt(toArr(x), n); } };
})(typeof self !== 'undefined' ? self : this);
