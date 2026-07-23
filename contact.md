---
layout: default
title: Contact
permalink: /contact/
body_class: theme-bw
---

{% comment %} MERGED 2026-07-15 (Nate: "The About and Contact are redundant. Keep the About
     format but make it the McPuppy black/white background and call it Contact, combining the
     two. Then remove About."). This IS the old /about/ "Say Hello" page — same format, same
     type-out effect, same Princess photo — recoloured from the aurora-purple look into
     McPuppy's monochrome. The old bare /contact/ (email + GitHub) folded in here; /about/ is
     gone (redirects handled in _data/brands.yml + the command palette). {% endcomment %}

<div class="hello-page">

  <!-- ══════════ GET IN TOUCH ══════════ -->
  <section class="hello-hero">
    <h1 class="hello-headline" data-jp="お問い合わせ">Get in touch.</h1>
    <div class="hello-methods">
      <div class="hello-calc-wrap" id="contact-calc-wrap">
        <div class="hello-calc-line" id="calc-line-1"></div>
      </div>
      <a href="mailto:nathgreen37@gmail.com" class="hello-email" id="contact-email" style="opacity:0;pointer-events:none">nathgreen37@gmail.com</a>
      <a href="https://github.com/ngreen37" class="hello-gh" id="contact-gh" style="opacity:0;pointer-events:none" target="_blank" rel="noopener">♟&nbsp; GitHub — ngreen37</a>
    </div>
  </section>

  <!-- ══════════ PRINCESS ══════════ -->
  <figure class="hello-princess">
    <img src="{{ site.baseurl }}/assets/images/Princess-3.jpg" alt="Princess in her Minnesota Wild jersey" class="hello-princess-img">
    <figcaption class="hello-princess-cap">Princess Sophia McPuppy</figcaption>
  </figure>

  <!-- ══════════ THE OPERATOR (< 10 words) ══════════ -->
  <section class="hello-operator">
    <span class="hello-operator-glyph" aria-hidden="true">♚</span>
    <p class="hello-operator-line">One person behind the curtain.</p>
  </section>

  <!-- ══════════ CHESS LESSONS (one line) ══════════ -->
  <p class="hello-lessons">
    I also teach chess — any age, in person or online. <a href="mailto:nathgreen37@gmail.com">Email me</a>.
  </p>

</div>

<style>
/* ── Contact / "Say Hello" — McPuppy monochrome (recoloured from the old aurora look) ── */
.hello-page { max-width: 720px; margin: 0 auto; padding: 8px 0 56px;
  --line:#cfcfd6; --ink:#eeeef2; --mut:rgba(238,238,242,0.62); --panel:rgba(255,255,255,0.05); }

.hello-hero { position:relative; text-align:center; padding:64px 26px 54px; border-radius:22px; overflow:hidden;
  background:
    radial-gradient(120% 90% at 50% -10%, rgba(255,255,255,0.10), transparent 60%),
    linear-gradient(160deg, #1a1a1e 0%, #0b0b0d 78%);
  border:1px solid rgba(255,255,255,0.14);
  box-shadow:0 24px 60px -28px rgba(0,0,0,0.75);
  animation: hello-rise .9s cubic-bezier(.22,1,.36,1) both; }
/* a silver sweep across the top of the hero */
.hello-hero::before { content:""; position:absolute; inset:0 0 auto 0; height:4px;
  background:linear-gradient(90deg, #e8e8ee, #8a8a92 50%, #f4f4f6);
  background-size:200% 100%; animation: hello-aurora 7s linear infinite; }

.hello-headline { font-family:'Poppins',sans-serif; font-weight:800; letter-spacing:-1px; line-height:1.05;
  font-size:clamp(40px,6.83vw,69px); margin:0 0 36px;
  background:linear-gradient(100deg, #fff 0%, #d0d0d6 60%, #8a8a92 100%);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
  display:inline-block; overflow:hidden; white-space:nowrap; border-right:3px solid #e8e8ee;
  width:0; animation: hello-type .9s steps(13) .35s forwards, hello-caret .7s step-end .35s 4, hello-caret-out .4s ease 3.2s forwards; }

.hello-methods { display:flex; flex-direction:column; align-items:center; gap:18px; }
.hello-calc-wrap { min-height:48px; display:flex; align-items:center; justify-content:center; }
.hello-calc-line { font-family:'Share Tech Mono','Courier New',monospace; font-size:17px; letter-spacing:2px;
  color:var(--line); text-shadow:0 0 12px rgba(255,255,255,0.35); }
.contact-calc-cursor { display:inline-block; width:9px; height:1em; background:var(--line); margin-left:2px;
  vertical-align:text-bottom; animation: hello-blink .65s step-end infinite; }

@media (pointer: coarse) { .hello-email { padding: 12px 16px !important; } }  /* touch sweep 2026-07-13: was 221x27 */
.hello-email { font-family:'Poppins',sans-serif; font-weight:700; letter-spacing:.4px; text-decoration:none;
  font-size:clamp(16px,2.4vw,22px); color:#fff; animation: hello-glow 3.6s ease-in-out infinite; }
.hello-email:hover { color:#fff; text-shadow:0 0 24px rgba(255,255,255,0.9); animation:none; text-decoration:none; }
.hello-gh { font-family:'Poppins',sans-serif; font-weight:700; font-size:14px; letter-spacing:.4px; text-decoration:none;
  color:#e8e8ee; background:rgba(255,255,255,0.08); border:2px solid rgba(255,255,255,0.45); border-radius:999px;
  padding:11px 30px; transition:transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .3s, background .2s, color .2s; }
.hello-gh:hover { transform:translateY(-4px); color:#0b0b0d; background:#f4f4f6; border-color:#f4f4f6;
  box-shadow:0 12px 34px rgba(0,0,0,0.55); text-decoration:none; }

/* one photo of Princess */
.hello-princess { margin:46px auto 0; text-align:center; max-width:380px;
  animation: hello-rise .9s cubic-bezier(.22,1,.36,1) .15s both; }
.hello-princess-img { width:100%; border-radius:var(--r-lg); display:block;
  border:1px solid rgba(255,255,255,0.2); box-shadow:0 20px 48px -22px rgba(0,0,0,0.7); }
.hello-princess-cap { margin:14px 0 0; font-size:13px; letter-spacing:.3px; color:var(--mut);
  font-family:'Poppins',sans-serif; }

/* operator — one short line */
.hello-operator { display:flex; align-items:center; justify-content:center; gap:12px; margin:46px auto 0;
  padding:22px; max-width:560px; border-radius:var(--r-lg); background:var(--panel);
  border:1px solid rgba(255,255,255,0.14); }
.hello-operator-glyph { font-size:26px; color:#e8e8ee; opacity:.85; }
.hello-operator-line { margin:0; font-family:'Poppins',sans-serif; font-size:clamp(16px,2.4vw,20px);
  font-weight:600; color:var(--ink); }

.hello-lessons { text-align:center; margin:30px auto 0; max-width:520px; font-size:15px; line-height:1.7;
  color:var(--mut); }
.hello-lessons a { color:#fff; font-weight:700; text-decoration:underline; text-underline-offset:3px;
  text-decoration-thickness:1.5px; text-shadow:0 0 14px rgba(255,255,255,0.5); transition:text-shadow .2s; }
.hello-lessons a:hover { text-shadow:0 0 22px rgba(255,255,255,0.85); }

@keyframes hello-rise { from{opacity:0; transform:translateY(26px) scale(.98);} to{opacity:1; transform:none;} }
@keyframes hello-aurora { to { background-position:200% 0; } }
@keyframes hello-type { from{width:0;} to{width:13ch;} }
@keyframes hello-caret { 0%,100%{border-right-color:#e8e8ee;} 50%{border-right-color:transparent;} }
@keyframes hello-caret-out { from{border-right-color:#e8e8ee;} to{border-right-color:transparent;} }
@keyframes hello-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
@keyframes hello-glow { 0%,100%{text-shadow:0 0 0 rgba(255,255,255,0);} 50%{text-shadow:0 0 26px rgba(255,255,255,0.7);} }

@media (max-width:700px){
  .hello-hero { padding:48px 18px 42px; }
  .hello-operator { flex-direction:column; gap:10px; text-align:center; }
}
@media (prefers-reduced-motion: reduce){
  .hello-hero, .hello-princess, .hello-headline { animation:none; }
  .hello-headline { width:auto; border-right:none; }
}
</style>

<script>
/* Keep the text effect: "Opening the line…" types out, then the email + GitHub fade in. */
(function() {
  var line1  = document.getElementById('calc-line-1');
  var wrap   = document.getElementById('contact-calc-wrap');
  var email  = document.getElementById('contact-email');
  var gh     = document.getElementById('contact-gh');
  var cursor = '<span class="contact-calc-cursor"></span>';

  function typeInto(el, text, delay, cb) {
    setTimeout(function() {
      var i = 0;
      el.innerHTML = cursor;
      var t = setInterval(function() {
        el.innerHTML = text.slice(0, i + 1) + cursor;
        i++;
        if (i >= text.length) { clearInterval(t); setTimeout(function() { el.innerHTML = text; if (cb) cb(); }, 300); }
      }, 38);
    }, delay);
  }
  function fadeIn(el, cb) {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '1'; el.style.pointerEvents = 'auto';
    if (cb) setTimeout(cb, 600);
  }
  typeInto(line1, 'Opening the line…', 700, function() {
    setTimeout(function() {
      wrap.style.transition = 'opacity 0.4s'; wrap.style.opacity = '0';
      setTimeout(function() { wrap.style.display = 'none'; fadeIn(email, function() { fadeIn(gh); }); }, 420);
    }, 600);
  });
})();
</script>
