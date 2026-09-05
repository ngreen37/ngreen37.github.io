/*! pjcc-banner.js — the board you built, drawn small.
 *
 *  2026-09-05, off-the-wall #3: *"sixteen won pieces on sixty-four squares: let the player
 *  place them however they like, and make that arrangement their BANNER on the rest of the
 *  site."* Checker Town is where you win the pieces and where you arrange them; this is the
 *  picture that comes out.
 *
 *  ⚠⚠ IT HOLDS NO COPY OF THE ROSTER. `PJCC.townBoard()` hands over
 *  `[{ p, who, f, r }, …]` — the piece letter, the name under it, and the square it stands
 *  on — because the town owns who is who. Rename a character in Godot and the banner renames
 *  itself; there is nothing here to fall out of step. Same split as pjcc-studies.js.
 *
 *  ⚠ AN EMPTY BOARD DRAWS NOTHING AND THE HOST REMOVES ITSELF. Sixty-four empty squares on a
 *  profile page is a chore with a frame round it. [[declutter-north-star]]
 *
 *  API (window.PJCCBanner):
 *    draw(canvas, board, opts)  -> paints one 8×8. opts: { cell }
 *    mount(host, board)         -> builds the canvas inside `host` and labels it.
 *                                  Returns true if anything was drawn.
 */
(function (root) {
  'use strict';

  /* The site's canon board, from _sass/_pjcc-22-chess-canon.scss — the same two squares the
     town paints its Assembly with, so the banner and the room are one picture. */
  var LIGHT = '#e9d3a4';
  var DARK = '#9c5f33';
  var FRAME = '#4a3320';
  /* ⚠ WE ARE BLACK IN THAT ROOM. The pieces you win are the dark set; drawing them ivory here
     would be a different board from the one you arranged. */
  var FILL = '#4a3585';
  var EDGE = '#f2e9ff';

  var FILES = 'abcdefgh';

  function sqName(f, r) {
    /* ⚠⚠ THE TOWN'S GRID, TRANSLATED, AND BOTH AXES ARE FLIPPED FROM THE OBVIOUS READING.
       We sit on the BLACK side of that board: column 0 is the left of the picture and the
       a-file is therefore on the RIGHT, and row 0 is the far rank, which is rank ONE.
       Checked against the roster: Crockett is the h-pawn and comes back as (0, 6) = h7, and
       Vince is the a-rook at (7, 7) = a8. Getting this backwards names every square wrong in
       the one place a screen reader gets to read the board. */
    return FILES[7 - f] + String(r + 1);
  }

  function draw(canvas, board, opts) {
    if (!canvas || !canvas.getContext) return false;
    opts = opts || {};
    var cell = opts.cell || 30;
    var pad = Math.round(cell * 0.24);
    var side = cell * 8 + pad * 2;
    /* crisp on a phone: the backing store is device pixels, the CSS box is not */
    var dpr = Math.min(3, root.devicePixelRatio || 1);
    canvas.width = Math.round(side * dpr);
    canvas.height = Math.round(side * dpr);
    canvas.style.width = side + 'px';
    canvas.style.height = side + 'px';

    var g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = FRAME;
    g.fillRect(0, 0, side, side);
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        g.fillStyle = ((f + r) % 2 === 0) ? LIGHT : DARK;
        g.fillRect(pad + f * cell, pad + r * cell, cell, cell);
      }
    }
    var P = root.PJCCPieces;
    (board || []).forEach(function (m) {
      if (!m || m.f == null || m.r == null) return;
      var cx = pad + (+m.f + 0.5) * cell;
      var cy = pad + (+m.r + 0.5) * cell;
      var t = String(m.p || 'p').toUpperCase();
      if (P && P.draw) {
        P.draw(g, cx, cy, cell * 0.82, t, 'b', { bFill: FILL, bEdge: EDGE });
      } else {
        /* ⚠ NO DEPENDENCY IS FATAL. pjcc-pieces.js is one <script> among several and a
           profile page that throws is worse than one with plain discs on it.
           [[down-never-stuck]] */
        g.fillStyle = FILL;
        g.beginPath();
        g.arc(cx, cy, cell * 0.30, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = EDGE;
        g.lineWidth = 2;
        g.stroke();
      }
    });
    return true;
  }

  /* ⚠ THE ALTERNATIVE TEXT IS THE ROSTER, NOT "a chess board". A picture of who you have
     beaten and where you stood them is worth reading out; "board" is not. */
  function label(board) {
    var who = (board || []).map(function (m) {
      return String(m.who || '?') + ' on ' + sqName(+m.f, +m.r);
    });
    return who.length
      ? 'Your Assembly board, ' + who.length + ' of 16: ' + who.join(', ') + '.'
      : '';
  }

  function mount(host, board) {
    if (!host) return false;
    var rows = board || (root.PJCC && root.PJCC.townBoard ? root.PJCC.townBoard() : []);
    if (!rows || !rows.length) {
      if (host.parentNode) host.parentNode.removeChild(host);
      return false;
    }
    var c = document.createElement('canvas');
    c.className = 'pjb-board';
    host.appendChild(c);
    draw(c, rows, { cell: 30 });
    host.setAttribute('role', 'img');
    host.setAttribute('aria-label', label(rows));
    return true;
  }

  root.PJCCBanner = { draw: draw, mount: mount, label: label, sqName: sqName };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PJCCBanner;
})(typeof window !== 'undefined' ? window : this);
