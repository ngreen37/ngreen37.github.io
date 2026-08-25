---
sitemap: false
layout: easter-eggs
title: THE ALPINE FILE
permalink: /classified/
fragment_key: frag_classified
# ⛑ 2026-08-25: the Alpine File is FRAGMENT ONE of the six that open the world.
# `fragment_slot` is what the ledger reads (assets/js/pjcc-fragments.js); `fragment_key`
# above is the pre-overhaul flag and is kept only so nothing that already reads it breaks.
fragment_slot: alpine
# the other Alpine file — no weather, no sky (see _layouts/default.html)
no_sky: true
---

<!-- if you're reading this, you're already home -->

<div class="secret-page" id="secret-page">

  <header class="secret-header">
    <div class="secret-ping"><span>⊙</span></div>
    <div class="secret-statusbar">
      <span>SIGNAL ACQUIRED</span><span class="secret-dots">• • •</span><span>DECRYPTION COMPLETE</span>
    </div>
    <div class="secret-stamp-wrap">
      <span class="secret-stamp">CLASSIFIED</span>
      <span class="secret-stamp secret-stamp--over">DECLASSIFIED</span>
    </div>
    <h1 class="secret-title">THE ALPINE FILE</h1>
    <p class="secret-sub">RECOVERED FILE #001 · CHESS CITY RELEASE ACT OF 2078</p>
    <div class="secret-coords">
      ORIGIN:&nbsp;CHECKER&nbsp;TOWN &nbsp;·&nbsp; SUBJECT:&nbsp;PRINCESS &nbsp;·&nbsp; STATUS:&nbsp;<span class="secret-grant">COMPLETED</span>
    </div>
  </header>

  <!-- ══════════ THE REDACTED FILES (Nate's text, 2026-07-14 — the <redacted>
       marks render as true black bars; nothing hides behind them to inspect) ══════════ -->
  <section class="secret-letters">
    <div class="secret-letters-label">PETITION GRANTED — THREE PAGES SURVIVE</div>

    <blockquote class="secret-letter">
      <div class="secret-file-tab">REDACTED FILE</div>
      <p>One human on Earth, leading up to population of Checker Town, knew of Subject's
      abilities — the one that TAUGHT her this technique. Bill Alpine, 46 yrs.
      Worked for ICB's Expanse Branch.</p>
      <footer>page 1 of 3 · edge-charred</footer>
    </blockquote>

    <blockquote class="secret-letter secret-letter--alt">
      <div class="secret-file-tab">REDACTED FILE</div>
      <p>Number of Humans aware at time of event is unknown, but believed to be
      less than ten. Despite recent developments STRONGLY suggesting otherwise,
      optimism is significantly UP around camp. Progress came when w—</p>
      <footer>page 2 of 3 · water-damaged · the rest is gone</footer>
    </blockquote>

    <blockquote class="secret-letter">
      <div class="secret-file-tab">REDACTED FILE</div>
      <p>Person of Interest: Nate <span class="rx" role="img" aria-label="Redacted">█████████</span>
      — took in Princess and was main participant in
      <span class="rx" role="img" aria-label="Redacted">██████████</span>.</p>
      <footer>page 3 of 3 · the name is struck in every copy</footer>
    </blockquote>
  </section>

  <!-- ══════════ THE FOUND FILE — the memo itself. It develops like a photograph
       when you reach it (the old hardening trick, reused where it belongs). ══════════ -->
  <section class="secret-core">
    <div class="secret-core-eyebrow">FOUND FILE</div>
    <div class="secret-memo" id="secret-memo">
      <div class="secret-memo-date">March 1st, 2022</div>
      <p>If you somehow found this file, congratulations,
      <span class="rx" role="img" aria-label="Redacted">████████</span> but you're too late.
      <strong>It's already done.</strong> Once Subject learned what Belief was, she just needed
      to learn how, and, <span class="rx" role="img" aria-label="Redacted">██████</span>
      <span class="rx" role="img" aria-label="Redacted">███████████</span> and that
      <span class="rx" role="img" aria-label="Redacted">████</span> Convict #48125 made a
      decision for all of us, didn't he? <span class="rx" role="img" aria-label="Redacted">█████████</span>
      <span class="rx" role="img" aria-label="Redacted">███████</span> The story of the dog who can
      learn anything is still unfolding, but hope in keeping our control is slipping amongst my men.</p>
      <p>They don't even know how lost it is. I do.</p>
      <div class="secret-memo-sign">— Lt. Jenkins · 53rd Battalion · ICB</div>
      <footer class="secret-memo-cite">— Recovered File #001 from the Chess City Release Act of 2078 —
      Petition to Pull Records from the high-profile court case ALPINE&nbsp;vs.&nbsp;(ICB)&nbsp;Interplanetary&nbsp;Conduct&nbsp;Bureau</footer>
    </div>
  </section>

  <!-- ══════════ BURN AFTER READING (restored 2026-07-14 — Nate: "bring the burn
       function back"; countdown + flame wall + return to the surface, as before) ══════════ -->
  <div class="secret-destruct" id="secret-destruct">
    <div class="secret-destruct-label">⚠ &nbsp;READ CAREFULLY. THEN DESTROY.</div>
    <button class="secret-burn-btn" id="secret-burn-btn" type="button" onclick="igniteSequence()">▸ &nbsp;INITIATE BURN SEQUENCE</button>
  </div>

  <footer class="secret-footer">
    <a href="{{ '/' | relative_url }}" class="secret-return">⊘&nbsp;&nbsp;RETURN TO SURFACE</a>
  </footer>

</div>

<!-- the burn hardware: countdown digits + the flame wall -->
<div class="burn-count" id="burn-count" aria-hidden="true"><span id="burn-number"></span></div>
<div class="burn-overlay" id="burn-overlay" aria-hidden="true">
  <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
  <div class="burn-word" id="burn-word">✦ FRAGMENT RECOVERED — the fire keeps your secret</div>
</div>

<style>
.secret-page { max-width: 760px; margin: 0 auto; padding: 56px 26px 88px; position: relative; z-index: 1;
  --amber:#ff8c00; --gold:#ffd24a; --warm:#ffe9bf; }

/* header */
.secret-header { text-align: center; margin-bottom: 44px; }
.secret-ping { font-size: 30px; color: var(--gold); animation: secret-pulse 2.4s ease-in-out infinite; }
@keyframes secret-pulse { 0%,100%{ transform:scale(1); opacity:.7; } 50%{ transform:scale(1.18); opacity:1; text-shadow:0 0 22px var(--gold);} }
.secret-statusbar { display:flex; gap:12px; justify-content:center; align-items:center; flex-wrap:wrap;
  font-size:11px; letter-spacing:3px; color:rgba(255,140,0,0.7); margin:14px 0 20px; }
.secret-dots { letter-spacing:2px; animation: secret-blink 1.4s step-end infinite; }
@keyframes secret-blink { 50% { opacity:.25; } }
.secret-stamp-wrap { position:relative; display:inline-block; margin:6px 0 18px; }
.secret-stamp { display:inline-block; font-family:'Poppins',sans-serif; font-weight:800; letter-spacing:6px;
  font-size:13px; color:rgba(255,140,0,0.5); border:2px solid rgba(255,140,0,0.4); padding:7px 18px; border-radius:4px; }
.secret-stamp--over { position:absolute; left:50%; top:52%; transform:translate(-50%,-50%) rotate(-11deg);
  color:#0a0500; background:var(--gold); border-color:var(--gold); box-shadow:0 0 26px rgba(255,210,74,0.55);
  animation: secret-slam 1s cubic-bezier(.2,1.4,.4,1) .5s both; }
@keyframes secret-slam { 0%{ opacity:0; transform:translate(-50%,-50%) rotate(-11deg) scale(2.4);} 100%{ opacity:1; transform:translate(-50%,-50%) rotate(-11deg) scale(1);} }
/* ⛑ THE SLAM IS SMALLER ON A PHONE, AND IT IS NOT A TASTE CALL (2026-08-20). A TRANSFORM
   CREATES SCROLLABLE OVERFLOW: at scale(2.4) this stamp measures 496px against a 224px
   content box, so for the first second of this page the whole window could be panned
   sideways — exactly the thing Nate reported twice. `html{overflow-x:clip}` is a guard
   that HIDES this (and its own comment says so); the fix belongs where it starts.
   ⚠ The stamp shrinks too, so the smaller slam still has somewhere to come FROM: at
   11px/3px the base is ~156px, and 1.35× of that fits the narrowest phone. */
@media (max-width: 560px) {
  .secret-stamp { font-size:11px; letter-spacing:3px; padding:6px 12px; }
  @keyframes secret-slam { 0%{ opacity:0; transform:translate(-50%,-50%) rotate(-11deg) scale(1.35);} 100%{ opacity:1; transform:translate(-50%,-50%) rotate(-11deg) scale(1);} }
}
.secret-title { font-family:'Poppins',sans-serif; font-weight:800; font-size:clamp(34px,7.6vw,64px); letter-spacing:7px;
  color:var(--gold); margin:14px 0 8px; text-shadow:0 0 30px rgba(255,210,74,0.45); }
/* a11y 2026-07-22: 66% -> 76% amber (4.21:1 -> 4.6:1). A near-miss, but this line names
   the file you are reading, so it is content. The ██ .rx bars and the CLASSIFIED stamp on
   this page are left as they are ON PURPOSE — unreadable IS the redaction, and the stamp
   is a graphic. Same call as the archive page; see _sass/_pjcc-05-classified.scss. */
.secret-sub { font-size:11px; letter-spacing:4px; color:rgba(255,140,0,0.76); margin:0 0 18px; }
.secret-coords { font-size:11px; letter-spacing:1.5px; color:rgba(255,140,0,0.5); }
.secret-grant { color:var(--gold); }

/* the redaction bar — a TRUE bar: the blocks are the content, nothing hides behind it */
.rx { color:#050200; background:#050200; border-radius:2px; padding:0 2px;
  box-shadow:0 0 0 1px rgba(255,140,0,0.14); user-select:none; -webkit-user-select:none;
  letter-spacing:-1px; white-space:nowrap; }

/* the three surviving pages — worn, typed, slightly askew */
.secret-letters { margin:0 0 44px; display:grid; gap:18px; }
.secret-letters-label { font-size:10px; letter-spacing:4px; color:rgba(255,210,74,0.72); text-align:center; margin-bottom:2px; }
.secret-letter { position:relative; margin:0; padding:26px 24px 22px; border-radius:6px;
  background:linear-gradient(180deg, rgba(60,44,20,0.5), rgba(38,26,10,0.5));
  border:1px solid rgba(255,180,80,0.18); box-shadow:0 12px 30px -20px rgba(0,0,0,0.85);
  transform:rotate(-0.6deg); }
.secret-letter--alt { transform:rotate(0.7deg); }
.secret-file-tab { position:absolute; top:-9px; left:16px; font-size:9px; letter-spacing:3px;
  color:rgba(255,140,0,0.85); background:#160d02; border:1px solid rgba(255,140,0,0.35);
  border-radius:3px; padding:2px 9px; }
.secret-letter p { font-family:'Share Tech Mono', ui-monospace, monospace; font-size:14.5px; line-height:1.85;
  color:rgba(255,233,191,0.9); margin:0 0 10px; }
.secret-letter p:last-of-type { margin-bottom:0; }
.secret-letter footer { margin-top:14px; font-size:10px; letter-spacing:2px; text-transform:uppercase;
  color:rgba(255,140,0,0.5); }

/* the found file — the luminous frame holds the memo; it DEVELOPS on arrival */
.secret-core { padding:40px 30px; border-radius:var(--r-lg); margin:0 0 44px; position:relative; overflow:hidden;
  background:radial-gradient(120% 130% at 50% 0%, rgba(255,160,30,0.16), rgba(10,5,0,0.2) 65%);
  border:1px solid rgba(255,170,40,0.32); box-shadow:0 0 60px -18px rgba(255,170,40,0.5) inset; }
.secret-core::before { content:""; position:absolute; inset:0 0 auto 0; height:3px;
  background:linear-gradient(90deg, transparent, var(--gold), transparent); animation:secret-sweep 5s linear infinite; }
@keyframes secret-sweep { 0%{ transform:translateX(-100%);} 100%{ transform:translateX(100%);} }
.secret-core-eyebrow { text-align:center; font-size:10px; letter-spacing:4px; color:rgba(255,210,74,0.8); margin-bottom:22px; }
.secret-memo { max-width:600px; margin:0 auto;
  filter:blur(6px); opacity:0.25; transition:filter 3.2s ease, opacity 3.2s ease; }
.secret-memo.is-set { filter:blur(0); opacity:1; }
.secret-memo-date { font-family:'Share Tech Mono',ui-monospace,monospace; font-size:12px; letter-spacing:2px;
  color:var(--gold); margin-bottom:14px; }
.secret-memo p { font-family:'Share Tech Mono', ui-monospace, monospace; font-size:14.5px; line-height:2.0;
  color:rgba(255,233,191,0.92); margin:0 0 14px; }
.secret-memo strong { color:var(--gold); }
.secret-memo-cite { margin-top:18px; font-size:10.5px; letter-spacing:1.5px; line-height:1.9;
  text-transform:uppercase; color:rgba(255,140,0,0.55); }

/* burn after reading */
.secret-destruct { text-align:center; margin:54px 0 0; padding-top:36px; border-top:1px solid rgba(255,140,0,0.12); }
.secret-destruct-label { font-size:11px; letter-spacing:3px; color:var(--amber); margin-bottom:16px;
  animation: secret-glow 4.5s ease-in-out infinite; }
@keyframes secret-glow { 0%,100%{ text-shadow:0 0 14px rgba(255,140,0,0.18);} 50%{ text-shadow:0 0 30px rgba(255,140,0,0.5);} }
.secret-burn-btn { font-family:'Share Tech Mono','Courier New',monospace; font-size:13px; letter-spacing:3px;
  text-transform:uppercase; color:#ff5b3a; background:rgba(60,10,0,0.35); border:1px solid rgba(255,91,58,0.5);
  border-radius:2px; padding:13px 34px; cursor:pointer; transition:background .2s, box-shadow .2s, color .2s; }
.secret-burn-btn:hover { background:rgba(255,91,58,0.14); color:#ff8a66;
  box-shadow:0 0 24px rgba(255,91,58,0.35), 0 0 70px rgba(255,91,58,0.12); }
.secret-burn-btn:disabled { opacity:.7; cursor:default; }

/* countdown digits */
.burn-count { position:fixed; inset:0; z-index:11000; display:none; align-items:center; justify-content:center;
  pointer-events:none; }
.burn-count.on { display:flex; }
.burn-count span { font-family:'Poppins',sans-serif; font-weight:800; font-size:clamp(90px,24vw,220px);
  color:#ff5b3a; text-shadow:0 0 60px rgba(255,91,58,0.7); animation:burn-tick 0.7s ease both; }
@keyframes burn-tick { 0%{ transform:scale(1.6); opacity:0; } 30%{ opacity:1; } 100%{ transform:scale(0.92); opacity:.9; } }

/* the flame wall — transform/opacity only; embers are the <i> children */
.burn-overlay { position:fixed; inset:0; z-index:10999; pointer-events:none; opacity:0;
  background:
    linear-gradient(0deg, #000 0%, #1a0500 30%, #7a1d00 55%, #ff6a00 74%, #ffc23a 86%, transparent 100%);
  transform:translateY(102%); }
.burn-overlay.is-burning { animation:burn-rise 1.7s cubic-bezier(.55,.06,.68,.19) both; pointer-events:auto; }
@keyframes burn-rise { 0%{ transform:translateY(102%); opacity:1; } 70%{ transform:translateY(0); opacity:1; } 100%{ transform:translateY(0); opacity:1; } }
.burn-overlay i { position:absolute; bottom:-12px; width:5px; height:5px; border-radius:50%;
  background:#ffc23a; box-shadow:0 0 8px 2px rgba(255,150,40,0.8); opacity:0; }
.burn-overlay.is-burning i { animation:burn-ember 1.4s ease-out both; }
@keyframes burn-ember { 0%{ transform:translateY(0) scale(1); opacity:0; } 15%{ opacity:1; }
  100%{ transform:translateY(-92vh) scale(0.4); opacity:0; } }
.burn-overlay i:nth-child(1){ left:6%;  animation-delay:.05s; } .burn-overlay i:nth-child(2){ left:14%; animation-delay:.30s; }
.burn-overlay i:nth-child(3){ left:23%; animation-delay:.12s; } .burn-overlay i:nth-child(4){ left:31%; animation-delay:.42s; }
.burn-overlay i:nth-child(5){ left:40%; animation-delay:.02s; } .burn-overlay i:nth-child(6){ left:49%; animation-delay:.33s; }
.burn-overlay i:nth-child(7){ left:57%; animation-delay:.18s; } .burn-overlay i:nth-child(8){ left:66%; animation-delay:.48s; }
.burn-overlay i:nth-child(9){ left:74%; animation-delay:.08s; } .burn-overlay i:nth-child(10){ left:82%; animation-delay:.38s; }
.burn-overlay i:nth-child(11){ left:90%; animation-delay:.22s; } .burn-overlay i:nth-child(12){ left:96%; animation-delay:.14s; }
/* the page itself chars and crumples as the wall rises */
.secret-page.is-burning { transform-origin:50% 100%;
  animation:burn-char 1.7s cubic-bezier(.55,.06,.68,.19) both; }
@keyframes burn-char { 0%{ transform:none; opacity:1; } 60%{ opacity:.9; }
  100%{ transform:translateY(-3vh) scale(0.96) rotate(0.6deg); opacity:0; } }

/* footer */
.secret-footer { text-align:center; margin-top:40px; }
.secret-return { display:inline-block; font-family:'Poppins',sans-serif; font-weight:800; letter-spacing:2px; font-size:13px;
  color:var(--gold); text-decoration:none; border:2px solid rgba(255,210,74,0.6); border-radius:999px; padding:11px 28px;
  transition:transform .2s, background .2s, color .2s; }
.secret-return:hover { transform:translateY(-3px); background:var(--gold); color:#0a0500; }
.secret-memo-sign { margin-top:14px; font-family:'Share Tech Mono',ui-monospace,monospace;
  font-size:12px; letter-spacing:1px; color:var(--gold); }
/* the burner's reward line — rides the flame wall up */
.burn-word { position:absolute; left:0; right:0; top:38%; text-align:center; opacity:0;
  font-family:'Poppins',sans-serif; font-weight:800; font-size:clamp(13px,3vw,19px); letter-spacing:2px;
  color:#ffe9bf; text-shadow:0 0 22px rgba(255,140,0,0.8); }
.burn-overlay.is-burning .burn-word { animation:burn-word-in 1.4s ease .5s both; }
@keyframes burn-word-in { 0%{ opacity:0; transform:translateY(14px); } 100%{ opacity:1; transform:translateY(0); } }

@media (max-width:600px){ .secret-core, .secret-letter { padding:22px 18px; } .secret-page { padding:40px 16px 70px; } }

@media (prefers-reduced-motion: reduce){
  .secret-ping, .secret-dots, .secret-stamp--over, .secret-core::before, .secret-destruct-label { animation:none; }
  .secret-memo { filter:none; opacity:1; transition:none; }
}
</style>

<noscript><style>.secret-memo { filter:none; opacity:1; }</style></noscript>

<script>
/* the found file develops like a photograph once you reach it — one-way */
(function () {
  var el = document.getElementById('secret-memo');
  if (!el) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { el.style.transition = 'none'; el.classList.add('is-set'); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        setTimeout(function () { el.classList.add('is-set'); }, 350);
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(el);
})();

/* BURN AFTER READING — three, two, one, and the flame wall takes the page back to
   the surface. Burning is REWARDED (2026-07-14 Nate): the burner recovers a
   fragment (frag_burned → the site-wide fragment counter). Return to Surface stays
   a plain walk home — no reward, no penalty. */
function igniteSequence() {
  var btn = document.getElementById('secret-burn-btn');
  var overlay = document.getElementById('burn-overlay');
  var count = document.getElementById('burn-count');
  var num = document.getElementById('burn-number');
  var page = document.getElementById('secret-page');
  if (!btn || !overlay) return;
  btn.disabled = true; btn.textContent = '▸   BURNING…';
  try { localStorage.setItem('frag_burned', '1'); } catch (e) {}
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var home = '{{ "/" | relative_url }}' || '/';
  if (reduce) { window.location.href = home; return; }
  var n = 3;
  count.classList.add('on');
  (function tick() {
    if (n < 1) {
      count.classList.remove('on');
      overlay.classList.add('is-burning');
      if (page) page.classList.add('is-burning');
      setTimeout(function () { window.location.href = home; }, 2600);   // a beat to read the reward
      return;
    }
    num.textContent = n;
    num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
    n--;
    setTimeout(tick, 750);
  })();
}
</script>
