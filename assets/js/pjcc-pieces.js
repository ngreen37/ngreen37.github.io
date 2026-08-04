/* =============================================================================
 * PJCC Pieces — one shared chess-piece look used across the canvas games
 * (Pirc Protocol, Fork in the Road, Sand Mine Depths). A flat, high-contrast
 * "carved" piece: a bold outlined glyph with a soft drop shadow — far more
 * recognizable than a glossy disc, and themeable via a palette override.
 *
 *   PJCCPieces.draw(ctx, cx, cy, size, type, color, opts)
 *     size  = glyph height in px (≈ tile * 0.85 reads well)
 *     type  = 'K','Q','R','B','N','P'
 *     color = 'w' | 'b'
 *     opts  = { wFill, wEdge, bFill, bEdge, ring }  (all optional)
 * ========================================================================== */
(function () {
  var SOLID = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
  // Default palette: ivory pieces with a dark carve, ebony pieces with a light carve.
  var DEF = { wFill: '#f7edd4', wEdge: '#4a3618', bFill: '#241a3c', bEdge: '#efe4ff' };

  function draw(ctx, cx, cy, size, type, color, opts) {
    opts = opts || {};
    var g = SOLID[type] || '?';
    var fill = color === 'w' ? (opts.wFill || DEF.wFill) : (opts.bFill || DEF.bFill);
    var edge = color === 'w' ? (opts.wEdge || DEF.wEdge) : (opts.bEdge || DEF.bEdge);
    var y = cy + size * 0.02;           // optical centering for these glyphs

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // grounded shadow under the piece
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.40, size * 0.33, size * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '900 ' + Math.round(size) + 'px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols2",serif';

    // soft cast shadow of the glyph itself
    ctx.fillStyle = 'rgba(0,0,0,0.40)';
    ctx.fillText(g, cx + size * 0.035, y + size * 0.06);

    // carved body: thick contrasting outline, then the fill
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(2.5, size * 0.085);
    ctx.strokeStyle = edge;
    ctx.strokeText(g, cx, y);
    ctx.fillStyle = fill;
    ctx.fillText(g, cx, y);

    ctx.restore();
  }

  window.PJCCPieces = { draw: draw, SOLID: SOLID };
})();
