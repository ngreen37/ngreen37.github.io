---
noindex: true
sitemap: false
layout: page
title: Share Card Maker
permalink: /share-card/
brand: mcpuppy
---

<div class="sc-head">
  <p class="sc-eyebrow">◈ Utility — social preview image</p>
  <h1>Share Card Maker</h1>
  <p class="sc-sub">Draws the 1200×630 image that shows when someone shares a link to the site (the Open-Graph card). Click <b>Download</b> for an exact-size PNG, drop it in <code>/assets/images/</code>, and point <code>_config.yml</code> <code>image:</code> at it.</p>
  <p class="sc-note">Open this <b>on the live site</b> (mcpuppystudios.com) so the Princess render loads and the export isn't blocked.</p>
</div>

<div class="sc-stage">
  <canvas id="sc-canvas" width="1200" height="630"></canvas>
</div>
<div class="sc-tools">
  <button class="sc-btn" id="sc-dl" type="button">⬇ Download share-card.png</button>
  <span class="sc-dim">1200 × 630</span>
</div>

<style>
  .sc-head { max-width: 760px; }
  .sc-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: #9a8fc0; }
  .sc-head h1 { color: #fff; font-size: 2rem; margin: 0.2rem 0 0.5rem; }
  .sc-sub { color: #cdbcf2; line-height: 1.6; }
  .sc-sub code, .sc-note code { background: rgba(0,0,0,0.3); padding: 1px 6px; border-radius: 4px; color: #9fe8ff; }
  .sc-note { color: #ffc9a0; font-size: 0.88rem; }
  .sc-stage { max-width: 720px; margin: 1rem 0; }
  #sc-canvas { width: 100%; height: auto; border: 2px solid #F5C518; border-radius: 10px; display: block; }
  .sc-tools { display: flex; align-items: center; gap: 14px; }
  .sc-btn { background: #F5C518; color: #1a0f3d; font-weight: 800; font-size: 1rem; border: none;
    border-radius: 999px; padding: 11px 24px; cursor: pointer; font-family: inherit; }
  .sc-btn:hover { background: #ffd740; }
  .sc-dim { color: #9a8fc0; font-family: 'Share Tech Mono', monospace; font-size: 0.82rem; }
</style>

<script>
(function () {
  var cv = document.getElementById('sc-canvas');
  var ctx = cv.getContext('2d');
  var W = 1200, H = 630;
  var IMG = {{ '/assets/images/Princess_Color_v01.jpg' | relative_url | jsonify }};

  function draw(img) {
    // background
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#1a0f3d'); g.addColorStop(0.55, '#2a1466'); g.addColorStop(1, '#140a30');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // faint chessboard band along the bottom
    ctx.globalAlpha = 0.05; ctx.fillStyle = '#ffffff';
    for (var x = 0; x < W; x += 60) for (var y = H - 120; y < H; y += 60)
      if (((x / 60) + (y / 60)) % 2 === 0) ctx.fillRect(x, y, 60, 60);
    ctx.globalAlpha = 1;

    // warm glow behind the portrait
    var cx = 940, cy = 300, R = 196;
    var rg = ctx.createRadialGradient(cx, cy, 40, cx, cy, R + 80);
    rg.addColorStop(0, 'rgba(245,197,24,0.28)'); rg.addColorStop(1, 'rgba(245,197,24,0)');
    ctx.fillStyle = rg; ctx.fillRect(cx - R - 90, cy - R - 90, (R + 90) * 2, (R + 90) * 2);

    // portrait (circular crop) + gold ring, or a fallback medallion
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    if (img) {
      var s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, cx - R, cy - R, R * 2, R * 2);
    } else {
      ctx.fillStyle = '#241453'; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.fillStyle = '#F5C518'; ctx.font = '160px serif'; ctx.textAlign = 'center'; ctx.fillText('♛', cx, cy + 56);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.lineWidth = 8; ctx.strokeStyle = '#F5C518'; ctx.stroke();
    ctx.font = '70px serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#F5C518';
    ctx.fillText('♛', cx, cy - R + 4);

    // text block (left)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd740'; ctx.font = '700 24px Poppins, sans-serif';
    ctx.fillText('M c P U P P Y   S T U D I O S   P R E S E N T S', 70, 132);

    ctx.fillStyle = '#F5C518'; ctx.font = '800 70px Poppins, sans-serif';
    ctx.fillText('Princess and the', 68, 230);
    ctx.fillText('Journey to', 68, 308);
    ctx.fillText('Chess City', 68, 386);

    ctx.fillStyle = '#cdbcf2'; ctx.font = '500 30px Poppins, sans-serif';
    ctx.fillText('An animated series + a world of games —', 70, 462);
    ctx.fillText('made in the open.', 70, 502);

    ctx.fillStyle = '#6bffb8'; ctx.font = '700 28px Poppins, sans-serif';
    ctx.fillText('mcpuppystudios.com', 70, 566);
  }

  function render() {
    var img = new Image();
    img.onload = function () { draw(img); };
    img.onerror = function () { draw(null); };
    img.src = IMG;
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(render); else render();

  document.getElementById('sc-dl').addEventListener('click', function () {
    try {
      cv.toBlob(function (blob) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'pjcc-share-card.png'; a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      }, 'image/png');
    } catch (e) { alert('Export blocked — make sure you opened this on the live site (same-origin image).'); }
  });
})();
</script>
