/* =============================================================================
 * pjcc-hidden-board.js — the boards hidden around the world
 * -----------------------------------------------------------------------------
 * Nate, 2026-08-03: "easter egg - random chess boards hidden everywhere - but only
 * like two to start - put them on the PJCC pages or the game hall. they are very
 * small - when you click - it expands, you get rewarded for finding it, and the
 * puzzle once solved prompts you to the puzzle page if you wish"
 *
 * TWO TO START, and adding a third is one entry in BOARDS below plus one entry in
 * EARNED in pjcc-profile.js — nothing else in this file is per-board.
 *
 * WHAT "RANDOM" MEANS HERE. Each board has THREE candidate homes on its page and
 * takes one of them, chosen by the TOWN DATE — so it genuinely moves around, but it
 * is in the same place for everyone all day and it is never in a place nobody looks.
 * Seeding off the date rather than off the page load is the site's standing rule for
 * anything ambient ([[night-desk-rogue-decision]]): seed per load and the egg would
 * teleport on every navigation, which is not a hunt, it is a slot machine.
 *
 * THE REWARD IS A COLLECTABLE, and it is the reason this file and the collection
 * shipped together. Solving writes a `frag_board_*` flag to localStorage; that flag
 * IS the requirement for an EARNED piece (`rule: 'found:frag_board_park'`), which you
 * then claim at /collection/. Local, so a signed-out stranger who finds one keeps the
 * find and can claim it whenever they sign in — gating a discovery behind an account
 * would mean the person most likely to be delighted gets nothing.
 *
 * ⚠ BOTH POSITIONS ARE PROVED. Each is a UNIQUE mate in one, verified against the
 * site's own perft-verified referee (assets/js/pjcc-chess.js) before shipping —
 * `npm run test:hidden` re-proves it on every run. A puzzle that lies about chess is
 * worse than no puzzle, and an easter egg gets no exemption from that.
 *
 * ⚠ THE REFEREE IS NOT LOADED HERE, on purpose. This is one position with one answer
 * on a page that is about something else entirely; pulling 40KB of move generator onto
 * /pjcc/ to re-derive a fact already proved offline is the exact trade the front door
 * exists to refuse. The answer is a two-square comparison.
 * ========================================================================== */
(function () {
  'use strict';

  var BOARDS = [
    {
      id: 'park', page: '/pjcc/', flag: 'frag_board_park',
      /* 6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w — 27 legal moves, exactly one mate: Qd8#.
         The queen is the only piece that can reach the back rank. */
      fen: '6k1/5ppp/8/8/8/8/5PPP/3Q2K1',
      from: 59, to: 3, san: 'Qd8#',
      say: 'White to play. <b>Mate in one.</b>',
      won: '<b>Qd8#</b> — the back rank was open the whole time.'
    },
    {
      id: 'hall', page: '/games/', flag: 'frag_board_hall',
      /* 6rk/6pp/8/6N1/8/8/8/7K w — 9 legal moves, exactly one mate: Nf7#. A smothered
         mate: the king is boxed in by its OWN rook and pawns. */
      fen: '6rk/6pp/8/6N1/8/8/8/7K',
      from: 30, to: 13, san: 'Nf7#',
      say: 'White to play. <b>Mate in one.</b>',
      won: '<b>Nf7#</b> — smothered. His own pieces held the door shut.'
    }
  ];

  var GLYPH = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };

  function has(flag) {
    try { var v = localStorage.getItem(flag); return !!v && v !== '0'; } catch (e) { return false; }
  }
  function mark(flag) { try { localStorage.setItem(flag, '1'); } catch (e) {} }

  /* The town's own day stamp when it is available, so the board moves when the town
     does rather than when the visitor's clock does. Falls back to the local date. */
  function dayNumber() {
    var s = '';
    try { s = (window.PJCC && PJCC.dayStamp) ? PJCC.dayStamp() : new Date().toISOString().slice(0, 10); } catch (e) {}
    var n = 0;
    for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
    return n;
  }

  function boardFor(path) {
    path = (path || '').replace(/\/+$/, '') || '/';
    for (var i = 0; i < BOARDS.length; i++) {
      if (BOARDS[i].page.replace(/\/+$/, '') === path) return BOARDS[i];
    }
    return null;
  }

  /* ── WHERE A BOARD CAN LIVE: `data-hb` on the host page ────────────────────────────
     THE FIRST VERSION GUESSED, AND THE GUESS WAS WRONG. It hunted CSS selectors
     (`.page-card p`, `.page-card h2`) — and neither host page HAS a `.page-card`: /pjcc/
     renders through `_layouts/home.html` and /games/ through `default.html`, so both eggs
     would have been planted nowhere at all. The unit test passed anyway, because the test
     built its own tidy little page that did have one. That is
     [[feature-shipped-but-never-loaded]] almost exactly: shipped, loaded, and silently
     inert, with a green suite over the top.

     So the host page NAMES its own hiding places. `data-hb` is invisible, costs nothing,
     and — the point — it is GREPPABLE: `npm run test:hidden` asserts that every board's
     page still carries at least three of them, so deleting one during a redesign fails
     loudly instead of quietly retiring an easter egg nobody would think to check. */
  function plant(b) {
    var spots = document.querySelectorAll('[data-hb]');
    if (!spots.length) return null;
    /* One of them, chosen by the DAY — so it really does move around, it is in the same
       place for everybody all day, and it is never somewhere nobody looks. */
    var host = spots[dayNumber() % spots.length];
    if (!host) return null;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hb-mark';
    /* It has a real accessible name rather than aria-hidden. An egg nobody using a
       screen reader can ever find is not "hidden", it is excluded — and this one costs
       a sighted visitor nothing, because it is 13px of checkerboard in a paragraph. */
    btn.setAttribute('aria-label', 'A tiny chessboard');
    btn.innerHTML = '<i></i>';
    if (has(b.flag)) btn.classList.add('found');
    host.appendChild(btn);
    btn.addEventListener('click', function (e) { e.preventDefault(); open(b, btn); });
    return btn;
  }

  // ── the board, expanded ───────────────────────────────────────────────────────
  function squares(fen) {
    var rows = fen.split('/'), out = new Array(64).fill('');
    for (var r = 0; r < 8; r++) {
      var f = 0, row = rows[r] || '';
      for (var i = 0; i < row.length; i++) {
        var ch = row[i];
        if (ch >= '1' && ch <= '8') f += +ch; else { out[r * 8 + f] = ch; f++; }
      }
    }
    return out;
  }

  function open(b, btn) {
    if (document.getElementById('hb-wrap')) return;
    var men = squares(b.fen);
    var sel = -1, done = false;

    var wrap = document.createElement('div');
    wrap.className = 'hb-wrap'; wrap.id = 'hb-wrap';

    var grid = '', pieces = '';
    for (var i = 0; i < 64; i++) {
      var r = i >> 3, c = i & 7;
      grid += '<i class="hb-sq' + ((r + c) % 2 ? ' d' : '') + '" data-sq="' + i + '"></i>';
      var p = men[i];
      if (p) {
        var white = p === p.toUpperCase();
        pieces += '<b class="hb-p ' + (white ? 'w' : 'b') + '" data-sq="' + i + '"' +
          ' style="grid-area:' + (r + 1) + '/' + (c + 1) + '">' + GLYPH[p.toUpperCase()] + '</b>';
      }
    }

    wrap.innerHTML =
      '<div class="hb-card" role="dialog" aria-modal="true" aria-labelledby="hb-title">' +
        '<div class="hb-eyebrow">you found a board</div>' +
        '<div class="hb-title" id="hb-title">Somebody left this here.</div>' +
        '<div class="hb-board"><div class="hb-grid">' + grid + '</div>' +
          '<div class="hb-men">' + pieces + '</div></div>' +
        '<p class="hb-say" id="hb-say">' + b.say + '</p>' +
        '<div class="hb-after" id="hb-after" hidden></div>' +
        '<button type="button" class="hb-close" id="hb-close">Leave it</button>' +
      '</div>';
    document.body.appendChild(wrap);

    var say = wrap.querySelector('#hb-say');
    function tell(html, good) { say.innerHTML = html; say.classList.toggle('good', !!good); }
    function clear() {
      sel = -1;
      Array.prototype.forEach.call(wrap.querySelectorAll('.hb-p.lift'), function (p) { p.classList.remove('lift'); });
      Array.prototype.forEach.call(wrap.querySelectorAll('.hb-sq.hint'), function (s) { s.classList.remove('hint'); });
    }

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) { close(); return; }
      if (done) return;
      var cell = e.target.closest ? e.target.closest('[data-sq]') : null;
      if (!cell) return;
      var sq = +cell.getAttribute('data-sq');
      var piece = wrap.querySelector('.hb-p.w[data-sq="' + sq + '"]');

      if (sel < 0) {
        if (!piece) return;                       // only White moves here
        sel = sq; piece.classList.add('lift');
        tell('It’s up. <b>Where does it go?</b>');
        return;
      }
      if (sq === sel) { clear(); tell(b.say); return; }

      if (sel === b.from && sq === b.to) {
        done = true;
        var mover = wrap.querySelector('.hb-p.w[data-sq="' + sel + '"]');
        var r2 = (sq >> 3) + 1, c2 = (sq & 7) + 1;
        if (mover) { mover.style.gridArea = r2 + '/' + c2; mover.classList.remove('lift'); }
        var king = wrap.querySelector('.hb-p.b[data-sq]');
        Array.prototype.forEach.call(wrap.querySelectorAll('.hb-p.b'), function (p) {
          if (p.textContent === GLYPH.K) p.classList.add('mated');
        });
        clear();
        tell(b.won, true);
        win(b, wrap, btn);
        return;
      }
      // a wrong move tells the truth and lets you try again — same as the puzzle room
      clear();
      tell('Not that one. <b>There is exactly one mate here.</b>');
    });

    wrap.querySelector('#hb-close').addEventListener('click', close);
    document.addEventListener('keydown', esc);
    function esc(e) { if (e.key === 'Escape') close(); }
    function close() {
      document.removeEventListener('keydown', esc);
      try { wrap.remove(); } catch (e) {}
      try { btn.focus(); } catch (e) {}
    }
    setTimeout(function () { try { wrap.querySelector('#hb-close').focus(); } catch (e) {} }, 60);
  }

  /* THE REWARD. The flag is the whole mechanism — it is what the EARNED collectable's
     `found:` rule reads. Deliberately NOT a credit grant: credits need an account, and
     the person who most deserves this moment is the stranger who was not looking for one.
     The offer to the puzzle room is exactly that, an OFFER — solving does not move the
     page out from under you, which is the same call Nate made on the front door
     ([[front-door-palette]]: the win hands you a door instead of walking you through it). */
  function win(b, wrap, btn) {
    var first = !has(b.flag);
    mark(b.flag);
    if (btn) btn.classList.add('found');
    try { if (window.showTxToast) showTxToast(first ? 'You found a hidden board.' : 'Solved it again.'); } catch (e) {}
    var after = wrap.querySelector('#hb-after');
    after.hidden = false;
    after.innerHTML =
      (first ? '<p class="hb-prize">✦ <b>That’s a find.</b> A collectable is waiting for you in ' +
               '<a href="/collection/">the collection</a>.</p>' : '') +
      '<a class="hb-go" href="/games/fork-in-the-road/">' +
        '<span><b>There are 1,000 more</b><small>The Puzzle Room — one move wins</small></span>' +
        '<i aria-hidden="true">→</i></a>';
    wrap.querySelector('#hb-close').textContent = 'Take it';
  }

  // ── boot ──────────────────────────────────────────────────────────────────────
  /* Loaded site-wide from default.html and exits IMMEDIATELY on the ~430 pages that
     host nothing. That is cheaper than it looks (one small cached file) and it is the
     reason a third board is a one-line change instead of a page edit — see
     [[feature-shipped-but-never-loaded]] for why "just include it on the page that
     needs it" is the arrangement that quietly stops being true. */
  function boot() {
    var b = boardFor(location.pathname);
    if (!b) return;
    plant(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // for tests + the console: the data, and a way to place one on demand
  window.PJCCHiddenBoard = { BOARDS: BOARDS, open: open, boardFor: boardFor, squares: squares };
})();
