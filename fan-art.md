---
layout: page
title: Fan Art
permalink: /fan-art/
---

<div class="fa-tools no-print">
  <button class="fa-btn" id="fa-pick" type="button">Choose a picture</button>
  <button class="fa-btn" id="fa-draw" type="button">🖍 Draw one right here</button>
  <button class="fa-btn fa-btn--ghost" id="fa-reset" type="button">Reset</button>
</div>

<!-- ── Crayon mode: fat crayons, straight onto the card, nothing uploaded ── -->
<div class="fa-crayons no-print" id="fa-crayons" hidden>
  <canvas id="fa-canvas" width="480" height="480"></canvas>
  <div class="fa-cray-row" id="fa-cray-row"></div>
  <div class="fa-cray-tools">
    <button class="fa-btn fa-btn--ghost" id="fa-cray-clear" type="button">Start over</button>
    <button class="fa-btn fa-btn--gold" id="fa-cray-done" type="button">Put it on the card ▸</button>
  </div>
</div>

<div class="fan-card" id="fan-card">
  <div class="fc-eyebrow">Fan Art</div>
  <div class="fc-brand"><span class="fc-star">★</span>PJCC<span class="fc-star">★</span></div>
  <div class="fc-frame" id="fa-frame">
    <img id="fa-img" alt="PJCC fan art">
    <div class="fc-hint no-print" id="fa-hint"><span class="fc-hint-big">＋</span>Click here, or drag your picture in</div>
  </div>
  <div class="fc-flourish"><span class="fc-pc">♟ ♞ ♜ ♛ ♚ ♛ ♜ ♞ ♟</span></div>
</div>
<input type="file" id="fa-file" accept="image/*" hidden>

<!-- ── Submit for review: uploads the card image to a PRIVATE staging bucket +
     a fan_submissions row. Nothing goes public — McPuppy reviews, then hangs the
     keepers on The Wall via _data/fanart.yml. Shows only once a picture is on the card. ── -->
<div class="fa-submit no-print" id="fa-submit" hidden>
  <div class="fa-submit-head">Happy with it? Send it to McPuppy.</div>
  <div class="fa-submit-row">
    <input id="fa-title" class="fa-input" type="text" maxlength="60" placeholder="Title (optional)">
    <input id="fa-by" class="fa-input" type="text" maxlength="30" placeholder="Your name or codename (optional)">
  </div>
  <button class="fa-btn fa-btn--gold" id="fa-send" type="button">Submit to McPuppy ▸</button>
  <div class="fa-send-msg" id="fa-send-msg" role="status"></div>
  <div class="fa-submit-fine">Your picture is sent privately for review — it only appears on the wall if McPuppy hangs it.</div>
</div>

<!-- ── The Wall ──────────────────────────────────────────────── -->
<section class="fa-wall no-print">
  {% assign art = site.data.fanart %}
  {% assign art_count = art | size %}
  {% comment %} The wall levels up as pieces are hung: 5+ = The Gallery, 15+ = The Museum Wing. {% endcomment %}
  {% if art_count >= 15 %}{% assign wall_name = 'The Museum Wing' %}{% assign wall_tier = 'museum' %}{% elsif art_count >= 5 %}{% assign wall_name = 'The Gallery' %}{% assign wall_tier = 'gallery' %}{% else %}{% assign wall_name = 'The Wall' %}{% assign wall_tier = 'wall' %}{% endif %}
  <h2 class="fa-h2 fa-h2--{{ wall_tier }}">{{ wall_name }}</h2>
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
        <span class="fa-stamp" title="Screened, then hung by McPuppy."><i class="fa-stamp-mark" aria-hidden="true">SCREENED</i>✓ HUNG BY McPUPPY{% if piece.hung %} · {{ piece.hung }}{% endif %}</span>
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
  <p class="fa-submit-note">Made something above? Hit <b>Submit to McPuppy</b> — every piece is screened, then hung.</p>
</section>

<style>
.fa-tools { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:1.4rem; }
.fa-btn { display:inline-block; text-decoration:none; cursor:pointer; font-family:inherit; font-weight:800; font-size:0.9rem;
  border-radius:999px; padding:10px 20px; background:rgba(80,30,180,0.25); color:#F5C518; border:2px solid rgba(150,65,255,0.6);
  transition:transform .12s, background .15s, border-color .15s; }
.fa-btn:hover { transform:translateY(-2px); border-color:#F5C518; }
.fa-btn--gold { background:#F5C518; color:#1a0f3d; border-color:#F5C518; }
.fa-btn--gold:hover { background:#ffd740; }
.fa-btn--ghost { background:transparent; }

/* ---- submit-for-review panel ---- */
.fa-submit { max-width:560px; margin:1.2rem auto 0; text-align:center;
  background:rgba(80,30,180,0.12); border:1px solid #4a3a86; border-radius:14px; padding:16px 18px; }
.fa-submit-head { color:#f0e6ff; font-weight:800; margin-bottom:10px; }
.fa-submit-row { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:12px; }
.fa-input { flex:1 1 200px; max-width:240px; background:#0f0826; color:#f0e6ff; border:1px solid #4a3a86;
  border-radius:10px; padding:9px 12px; font-family:inherit; font-size:0.9rem; }
.fa-input:focus { outline:none; border-color:#F5C518; }
.fa-send-msg { min-height:1.2em; margin-top:10px; font-size:0.86rem; color:#9fe0d0; font-weight:700; }
.fa-send-msg.err { color:#ff9ec9; }
.fa-submit-fine { margin-top:8px; font-size:0.72rem; color:#9a8fc0; }

/* ---- crayon mode ---- */
.fa-crayons { max-width:520px; margin:0 auto 1.4rem; text-align:center; }
/* the drawing surface is dimmed to match the card, but kept a shade lighter than it —
   crayon needs somewhere bright to land */
#fa-canvas { width:100%; max-width:480px; aspect-ratio:1/1; background:#eeebe3; border:3px solid #002e6d;
  border-radius:14px; touch-action:none; cursor:crosshair; display:block; margin:0 auto 12px; }
.fa-cray-row { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:12px; }
.fa-cray { width:32px; height:46px; border:none; cursor:pointer; background:var(--c); padding:0;
  clip-path:polygon(50% 0, 86% 16%, 86% 100%, 14% 100%, 14% 16%);
  opacity:0.82; transition:transform .1s, opacity .1s; }
.fa-cray:hover { opacity:1; transform:translateY(-4px); }
.fa-cray.on { opacity:1; transform:translateY(-6px); filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4)); }
.fa-cray-tools { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }

/* ---- the curator's stamp: "SCREENED" is a faint diagonal watermark behind the line ---- */
.fa-stamp { position:relative; display:block; margin-top:8px; padding:8px 0; font-family:'Share Tech Mono',monospace;
  font-size:0.58rem; letter-spacing:0.08em; color:#6bffb8; opacity:0.85; }
.fa-stamp-mark { position:absolute; inset:0; margin:0 14%; display:flex; align-items:center; justify-content:center;
  transform:rotate(-11deg); font-size:0.95rem; font-weight:900; font-style:normal; letter-spacing:0.32em;
  color:rgba(107,255,184,0.12); border:1px solid rgba(107,255,184,0.10); border-radius:4px; pointer-events:none; }

/* ---- wall tiers: the wall levels up as pieces are hung ---- */
.fa-h2--gallery::after { content:''; display:block; width:130px; height:2px; margin:7px auto 0;
  background:linear-gradient(90deg, transparent, #F5C518, transparent); }
.fa-h2--museum::before { content:'✦ '; }
.fa-h2--museum::after { content:''; display:block; width:210px; height:5px; margin:7px auto 0;
  border-top:1px solid #F5C518; border-bottom:1px solid #F5C518; }

/* ---- the card (print-friendly navy/gold/paper) ----
   2026-07-12 (Nate: "the Fan Art upload box is TOO bright. The white is too bright.
   Can we dim it?"). It was #fff — a pure-white block the size of a poster, sitting on
   a near-black purple page. That's the brightest thing on the whole site by a mile.
   It's PAPER now (--fa-paper), a warm off-white that still reads as a card you'd pin
   up, and the drop frame inside it is dimmer again.
   The print rule at the foot of this file puts the pure white BACK for printing —
   the glare is a screen problem, and dimming the paper on a printout would just waste
   ink and grey out the card. */
/* the fan card is a PRINT POSTER — the navy/gold/paper and the fat 3px border are the
   whole point, and they stay. Only its radius joins the shared scale. */
.fan-card { --fa-paper:#e8e4da; --fa-paper-lit:#eeebe3; --fa-paper-dim:#d6d9e0;
  max-width:560px; margin:0 auto; background:var(--fa-paper); border:3px solid #002e6d; border-radius:var(--r-lg);
  padding:26px 26px 20px; position:relative; color:#002e6d; }
.fan-card::before { content:''; position:absolute; inset:8px; border:1.5px solid #e3b008; border-radius:12px; pointer-events:none; }
/* a11y sweep 2026-07-13: the gold #e3b008 read 1.6:1 on the paper — the worst contrast on
   the site. Poster TEXT now wears a dark ANTIQUE gold (5.2:1); the star glyph and the inner
   border keep the bright gold — ink and ornament are different jobs. */
.fc-eyebrow { text-align:center; font-size:11px; letter-spacing:5px; text-transform:uppercase; color:#77570a; font-weight:800; }
.fc-brand { text-align:center; font-size:60px; font-weight:900; letter-spacing:4px; color:#002e6d; line-height:1; margin:3px 0 1px; }
.fc-star { color:#e3b008; font-size:0.55em; vertical-align:0.28em; margin:0 9px; }
.fc-brand-sub { text-align:center; font-size:14px; font-weight:700; color:#0a3f8a; margin-bottom:14px; }
.fc-frame { position:relative; width:100%; aspect-ratio:1/1; max-height:4.6in; margin:0 auto;
  background:radial-gradient(circle at 50% 40%, var(--fa-paper-lit) 0%, var(--fa-paper-dim) 78%); border:2px dashed transparent; border-radius:14px;
  overflow:hidden; display:flex; align-items:center; justify-content:center; cursor:pointer; }
/* no border once art is in the frame — the picture stands on its own */
.fan-card.has-img .fc-frame { border:none; cursor:default; }
#fa-img { max-width:100%; max-height:100%; object-fit:contain; display:none; }
.fan-card.has-img #fa-img { display:block; }
.fan-card.has-img .fc-hint { display:none; }
.fc-hint { text-align:center; color:#5b7bb0; font-size:14px; padding:18px; }
/* the plus wears a small, plain border — the only frame on an empty card */
.fc-hint-big { display:inline-flex; align-items:center; justify-content:center; width:56px; height:56px;
  font-size:30px; line-height:1; margin-bottom:8px; border:1.5px solid #9bb4d8; border-radius:10px; color:#5b7bb0; }
.fc-flourish { text-align:center; margin-top:14px; font-size:13px; letter-spacing:2px; color:#002e6d; font-weight:800; }
.fc-pc { color:#77570a; }

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
  /* the card is dimmed ON SCREEN only (it was blinding on a dark page). On paper the
     white comes back — nobody wants a grey card, and the printer would only be laying
     down ink to make it. */
  #fan-card { --fa-paper:#ffffff; --fa-paper-lit:#ffffff; --fa-paper-dim:#f2f6fc; }
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

  document.getElementById('fa-reset').addEventListener('click', function () {
    img.removeAttribute('src'); card.classList.remove('has-img'); try { localStorage.removeItem(STORE); } catch (e) {}
  });

  // ---- Crayon mode: fat crayons on a white page; "done" drops it on the card ----
  (function () {
    var box = document.getElementById('fa-crayons'), cv = document.getElementById('fa-canvas');
    if (!box || !cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var COLORS = ['#d0342c', '#e8862c', '#f2c22e', '#3f9b45', '#2d6fc2', '#7a4bbf', '#8a5a2b', '#2b2b2b'];
    var color = COLORS[0], drawing = false, last = null;
    function paper() { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cv.width, cv.height); }
    paper();
    var row = document.getElementById('fa-cray-row');
    COLORS.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fa-cray' + (i === 0 ? ' on' : '');
      b.style.setProperty('--c', c); b.setAttribute('aria-label', 'crayon');
      b.onclick = function () {
        color = c;
        Array.prototype.forEach.call(row.children, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      };
      row.appendChild(b);
    });
    function pos(e) {
      var r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) };
    }
    function stroke(a, b) {
      ctx.strokeStyle = color; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.88;   // the slightly waxy, layered crayon look
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    cv.addEventListener('pointerdown', function (e) {
      e.preventDefault(); drawing = true; last = pos(e); stroke(last, last);
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    });
    cv.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pos(e); stroke(last, p); last = p; });
    ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { drawing = false; }); });
    document.getElementById('fa-draw').addEventListener('click', function () {
      box.hidden = !box.hidden;
      if (!box.hidden) { try { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }
    });
    document.getElementById('fa-cray-clear').addEventListener('click', paper);
    document.getElementById('fa-cray-done').addEventListener('click', function () {
      show(cv.toDataURL('image/png'));
      box.hidden = true;
      try { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    });
  })();
})();
</script>

<script>
// ── Submit for review → PRIVATE Supabase staging (bucket + fan_submissions row).
//    Nothing is published: McPuppy reviews in the dashboard, then hangs keepers on
//    The Wall via _data/fanart.yml. Reuses the site's PJCC_CONFIG + supabase SDK. ──
(function () {
  var CFG = window.PJCC_CONFIG;
  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  var BUCKET = 'fan-submissions';
  var card = document.getElementById('fan-card');
  var img = document.getElementById('fa-img');
  var panel = document.getElementById('fa-submit');
  var sendBtn = document.getElementById('fa-send');
  var msgEl = document.getElementById('fa-send-msg');
  var titleEl = document.getElementById('fa-title');
  var byEl = document.getElementById('fa-by');
  if (!card || !panel || !sendBtn) return;

  // the panel appears only once a picture is on the card
  function sync() { panel.hidden = !card.classList.contains('has-img'); }
  sync();
  try { new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}

  // prefill the name if they're a signed-in operative
  try { if (window.PJCC && PJCC.getProfile) { var p = PJCC.getProfile(); if (p && p.codename && byEl) byEl.value = p.codename; } } catch (e) {}

  function msg(text, isErr) { msgEl.textContent = text; msgEl.classList.toggle('err', !!isErr); }

  function loadSDK() {
    return new Promise(function (res, rej) {
      if (window.supabase && window.supabase.createClient) return res();
      var s = document.createElement('script'); s.src = SDK_URL; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  var client = null;
  function getClient() {
    if (client) return Promise.resolve(client);
    if (!CFG || !CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) return Promise.reject(new Error('offline'));
    return loadSDK().then(function () { client = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY); return client; });
  }

  // downscale to <=1200px PNG so uploads stay small
  function toBlob() {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () {
        var max = 1200, w = im.naturalWidth, h = im.naturalHeight, sc = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('encode')); }, 'image/png');
      };
      im.onerror = function () { rej(new Error('image')); };
      im.src = img.src;
    });
  }

  sendBtn.addEventListener('click', function () {
    if (!card.classList.contains('has-img')) { msg('Add a picture first.', true); return; }
    if (!CFG || !CFG.SUPABASE_URL) { msg('Submissions are offline right now — email it to nathgreen37@gmail.com.', true); return; }
    sendBtn.disabled = true; sendBtn.textContent = 'Sending…'; msg('');
    var title = (titleEl.value || '').trim().slice(0, 60);
    var by = (byEl.value || '').trim().slice(0, 30);
    Promise.all([getClient(), toBlob()]).then(function (r) {
      var sb = r[0], blob = r[1];
      if (blob.size > 5 * 1024 * 1024) throw new Error('That image is too large (max 5MB).');
      var path = 'incoming/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.png';
      return sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/png', upsert: false })
        .then(function (up) { if (up.error) throw up.error; return sb.from('fan_submissions').insert({ title: title || null, by: by || null, path: path }); })
        .then(function (ins) { if (ins.error) throw ins.error; });
    }).then(function () {
      panel.querySelector('.fa-submit-row').style.display = 'none';
      sendBtn.style.display = 'none';
      msg('🎉 Sent to McPuppy for review! If it makes the wall, you\'ll see it here.');
    }).catch(function (err) {
      sendBtn.disabled = false; sendBtn.textContent = 'Submit to McPuppy ▸';
      msg((err && err.message && err.message !== 'offline') ? ('Could not send — ' + err.message) : 'Could not send — please try again, or email it to nathgreen37@gmail.com.', true);
    });
  });
})();
</script>

{% comment %} "Princess visits the gallery" removed 2026-07-12 with the site-wide companion
     (she was the visitor's pet; she isn't any more). Restore from git. {% endcomment %}
