---
layout: page
title: Fan Art
permalink: /fan-art/
---

<div class="fa-head">
  <h1 class="fa-title">Fan Art</h1>
</div>

<div class="fa-tools no-print">
  <button class="fa-btn" id="fa-pick" type="button">Choose a picture</button>
  <button class="fa-btn fa-btn--gold" id="fa-print" type="button">🖨 Print / Save PDF</button>
  <button class="fa-btn fa-btn--ghost" id="fa-reset" type="button">Reset</button>
</div>

<div class="fan-card" id="fan-card">
  <div class="fc-eyebrow">Fan Art</div>
  <div class="fc-brand"><span class="fc-star">★</span>PJCC<span class="fc-star">★</span></div>
  <div class="fc-frame" id="fa-frame">
    <img id="fa-img" alt="PJCC fan art">
    <div class="fc-hint no-print" id="fa-hint"><span class="fc-hint-big">＋🎨</span>Click here, or drag your picture in</div>
  </div>
  <div class="fc-flourish"><span class="fc-pc">♟ ♞ ♜ ♛ ♚ ♛ ♜ ♞ ♟</span></div>
</div>
<input type="file" id="fa-file" accept="image/*" hidden>

<!-- ── The Wall ──────────────────────────────────────────────── -->
<section class="fa-wall no-print">
  <h2 class="fa-h2">The Wall</h2>
  {% assign art = site.data.fanart %}
  {% if art and art.size > 0 %}
  <div class="fa-grid">
    {% for piece in art %}
    <figure class="fa-piece">
      <a href="{{ piece.img | relative_url }}" target="_blank" rel="noopener">
        <img src="{{ piece.img | relative_url }}" alt="{{ piece.title | default: 'PJCC fan art' }}" loading="lazy">
      </a>
      <figcaption>
        <span class="fa-piece-title">{{ piece.title }}</span>
        {% if piece.by %}<span class="fa-piece-by">— {{ piece.by }}</span>{% endif %}
      </figcaption>
    </figure>
    {% endfor %}
  </div>
  {% else %}
  <div class="fa-empty">
    <p>Wall is empty!</p>
    <a class="fa-empty-plus" href="/contact/" aria-label="Send in your art">＋</a>
  </div>
  {% endif %}
  <p class="fa-submit-note"><a href="/contact/">Send it in</a> and I’ll hang it here.</p>
</section>

<style>
.fa-head { text-align:center; max-width:680px; margin:0 auto 1.4rem; }
.fa-title { font-size:2.4rem; font-weight:900; color:#fff; margin:0.3rem 0 0.5rem; }
.fa-sub { color:#cdbcf2; font-size:0.95rem; line-height:1.6; }
.fa-sub strong { color:#F5C518; }
.fa-tools { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:1.4rem; }
.fa-btn { display:inline-block; text-decoration:none; cursor:pointer; font-family:inherit; font-weight:800; font-size:0.9rem;
  border-radius:999px; padding:10px 20px; background:rgba(80,30,180,0.25); color:#F5C518; border:2px solid rgba(150,65,255,0.6);
  transition:transform .12s, background .15s, border-color .15s; }
.fa-btn:hover { transform:translateY(-2px); border-color:#F5C518; }
.fa-btn--gold { background:#F5C518; color:#1a0f3d; border-color:#F5C518; }
.fa-btn--gold:hover { background:#ffd740; }
.fa-btn--ghost { background:transparent; }

/* ---- the card (print-friendly navy/gold/white) ---- */
.fan-card { max-width:560px; margin:0 auto; background:#fff; border:3px solid #002e6d; border-radius:18px;
  padding:26px 26px 20px; position:relative; color:#002e6d; }
.fan-card::before { content:''; position:absolute; inset:8px; border:1.5px solid #e3b008; border-radius:12px; pointer-events:none; }
.fc-eyebrow { text-align:center; font-size:11px; letter-spacing:5px; text-transform:uppercase; color:#e3b008; font-weight:800; }
.fc-brand { text-align:center; font-size:60px; font-weight:900; letter-spacing:4px; color:#002e6d; line-height:1; margin:3px 0 1px; }
.fc-star { color:#e3b008; font-size:0.55em; vertical-align:0.28em; margin:0 9px; }
.fc-brand-sub { text-align:center; font-size:14px; font-weight:700; color:#0a3f8a; margin-bottom:14px; }
.fc-frame { position:relative; width:100%; aspect-ratio:1/1; max-height:4.6in; margin:0 auto;
  background:radial-gradient(circle at 50% 40%, #fff 0%, #eaf2fc 78%); border:2px dashed #9bb4d8; border-radius:14px;
  overflow:hidden; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.fan-card.has-img .fc-frame { border-style:solid; border-color:#cfe0f5; cursor:default; }
#fa-img { max-width:100%; max-height:100%; object-fit:contain; display:none; }
.fan-card.has-img #fa-img { display:block; }
.fan-card.has-img .fc-hint { display:none; }
.fc-hint { text-align:center; color:#5b7bb0; font-size:14px; padding:18px; }
.fc-hint-big { display:block; font-size:32px; margin-bottom:6px; }
.fc-flourish { text-align:center; margin-top:14px; font-size:13px; letter-spacing:2px; color:#002e6d; font-weight:800; }
.fc-pc { color:#e3b008; }

/* ---- the wall ---- */
.fa-wall { max-width:920px; margin:2.4rem auto 0; }
.fa-h2 { color:#F5C518; font-size:1.3rem; font-weight:800; text-align:center; margin:0 0 0.5rem; }
.fa-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; margin:1rem 0; }
.fa-piece { margin:0; background:#160c33; border:1px solid #4a3a86; border-radius:12px; overflow:hidden; transition:transform .12s, border-color .12s; }
.fa-piece:hover { transform:translateY(-3px); border-color:#F5C518; }
.fa-piece img { display:block; width:100%; height:200px; object-fit:cover; background:#fff; }
.fa-piece figcaption { padding:10px 12px; font-size:0.82rem; }
.fa-piece-title { color:#f0e6ff; font-weight:700; }
.fa-piece-by { color:#9a8fc0; }
.fa-empty { text-align:center; padding:2rem 1rem 2.4rem; border:1px dashed #4a3a86; border-radius:14px; margin:1rem 0; color:#cdbcf2; }
/* the inviting plus — a warm, glowing button that begs to be pressed */
.fa-empty-plus { display:inline-flex; align-items:center; justify-content:center; width:72px; height:72px;
  margin-top:10px; border-radius:50%; text-decoration:none; font-size:2.4rem; line-height:1; font-weight:800;
  color:#1a0f3d; background:linear-gradient(135deg,#F5C518,#ffd740); box-shadow:0 0 26px -6px rgba(245,197,24,0.8);
  animation:faPlusBreathe 2.6s ease-in-out infinite; transition:transform .12s; }
.fa-empty-plus:hover { transform:scale(1.1); animation-play-state:paused; }
@keyframes faPlusBreathe { 0%,100% { transform:scale(1); box-shadow:0 0 20px -8px rgba(245,197,24,0.7); }
  50% { transform:scale(1.06); box-shadow:0 0 34px -4px rgba(245,197,24,0.95); } }
@media (prefers-reduced-motion: reduce){ .fa-empty-plus { animation:none; } }
.fa-submit-note { text-align:center; color:#9a8fc0; font-size:0.86rem; margin-top:0.6rem; }
.fa-submit-note a { color:#F5C518; font-weight:700; }

/* ---- print: ONLY the card ---- */
@media print {
  @page { size: Letter portrait; margin: 0.5in; }
  body * { visibility: hidden !important; }
  #fan-card, #fan-card * { visibility: visible !important; }
  #fan-card { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; margin: 0; }
  .no-print { display: none !important; }
  .fc-hint { display: none !important; }
}
</style>

<script>
(function () {
  var card = document.getElementById('fan-card');
  var frame = document.getElementById('fa-frame');
  var img = document.getElementById('fa-img');
  var file = document.getElementById('fa-file');
  var STORE = 'pjcc.fanart.card';

  // The picture never leaves this browser: FileReader → data URL → localStorage.
  function show(dataUrl) { img.src = dataUrl; card.classList.add('has-img'); frame.style.borderColor = ''; try { localStorage.setItem(STORE, dataUrl); } catch (e) {} }
  function load(f) { if (!f || !/^image\//.test(f.type)) return; var r = new FileReader(); r.onload = function () { show(r.result); }; r.readAsDataURL(f); }

  try { var saved = localStorage.getItem(STORE); if (saved) show(saved); } catch (e) {}

  function pick() { file.click(); }
  frame.addEventListener('click', function () { if (!card.classList.contains('has-img')) pick(); });
  document.getElementById('fa-pick').addEventListener('click', pick);
  file.addEventListener('change', function () { load(file.files[0]); });

  ['dragenter', 'dragover'].forEach(function (ev) { frame.addEventListener(ev, function (e) { e.preventDefault(); frame.style.borderColor = '#e3b008'; }); });
  ['dragleave', 'drop'].forEach(function (ev) { frame.addEventListener(ev, function (e) { e.preventDefault(); frame.style.borderColor = ''; }); });
  frame.addEventListener('drop', function (e) { var dt = e.dataTransfer; if (dt && dt.files && dt.files[0]) load(dt.files[0]); });

  document.getElementById('fa-print').addEventListener('click', function () { window.print(); });
  document.getElementById('fa-reset').addEventListener('click', function () {
    img.removeAttribute('src'); card.classList.remove('has-img'); try { localStorage.removeItem(STORE); } catch (e) {}
  });
})();
</script>
