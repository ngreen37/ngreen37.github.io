---
layout: default
title: Hello
permalink: /about/
body_class: theme-hello
---

<div class="hello-page">

  <!-- ══════════ SAY HELLO ══════════ -->
  <section class="hello-hero">
    <p class="hello-eyebrow" data-jp="ご挨拶">Say Hello</p>
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
    <figcaption class="hello-princess-cap">Princess Sophia McPuppy — the real one.</figcaption>
  </figure>

  <!-- ══════════ THE OPERATOR (< 10 words) ══════════ -->
  <section class="hello-operator">
    <span class="hello-operator-glyph" aria-hidden="true">♚</span>
    <p class="hello-operator-line">One person behind the curtain. The work speaks.</p>
  </section>

  <!-- ══════════ CHESS LESSONS (one line) ══════════ -->
  <p class="hello-lessons">
    I also teach chess — any age, in person or online. <a href="mailto:nathgreen37@gmail.com">Email me</a>.
  </p>

</div>

<style>
/* ── Hello / About — "aurora ink" theme (replaces the old DOS-green look) ── */
.hello-page { max-width: 720px; margin: 0 auto; padding: 8px 0 56px;
  --gold:#ffd24a; --aqua:#6fe0d0; --ink:#e8e3ff; --panel:rgba(20,14,44,0.66); }

.hello-hero { position:relative; text-align:center; padding:64px 26px 54px; border-radius:22px; overflow:hidden;
  background:
    radial-gradient(120% 90% at 50% -10%, rgba(123,92,255,0.28), transparent 60%),
    linear-gradient(160deg, #16102f 0%, #0c0820 78%);
  border:1px solid rgba(111,224,208,0.22);
  box-shadow:0 24px 60px -28px rgba(123,92,255,0.5);
  animation: hello-rise .9s cubic-bezier(.22,1,.36,1) both; }
/* aurora ribbon across the top of the hero */
.hello-hero::before { content:""; position:absolute; inset:0 0 auto 0; height:4px;
  background:linear-gradient(90deg, var(--aqua), #7b5cff 50%, var(--gold));
  background-size:200% 100%; animation: hello-aurora 7s linear infinite; }

.hello-eyebrow { font-family:'Poppins',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase;
  letter-spacing:5px; color:var(--aqua); margin:0 0 14px; }
.hello-headline { font-family:'Poppins',sans-serif; font-weight:800; letter-spacing:-1px; line-height:1.05;
  font-size:clamp(38px,6.5vw,66px); margin:0 0 36px;
  background:linear-gradient(100deg, #fff 0%, var(--gold) 60%, var(--aqua) 100%);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
  display:inline-block; overflow:hidden; white-space:nowrap; border-right:3px solid var(--gold);
  width:0; animation: hello-type .9s steps(13) .35s forwards, hello-caret .7s step-end .35s 4, hello-caret-out .4s ease 3.2s forwards; }

.hello-methods { display:flex; flex-direction:column; align-items:center; gap:18px; }
.hello-calc-wrap { min-height:48px; display:flex; align-items:center; justify-content:center; }
.hello-calc-line { font-family:'Share Tech Mono','Courier New',monospace; font-size:17px; letter-spacing:2px;
  color:var(--aqua); text-shadow:0 0 12px rgba(111,224,208,0.45); }
.contact-calc-cursor { display:inline-block; width:9px; height:1em; background:var(--aqua); margin-left:2px;
  vertical-align:text-bottom; animation: hello-blink .65s step-end infinite; }

.hello-email { font-family:'Poppins',sans-serif; font-weight:700; letter-spacing:.4px; text-decoration:none;
  font-size:clamp(16px,2.4vw,22px); color:var(--gold); animation: hello-glow 3.6s ease-in-out infinite; }
.hello-email:hover { color:#fff; text-shadow:0 0 24px rgba(255,210,74,0.9); animation:none; text-decoration:none; }
.hello-gh { font-family:'Poppins',sans-serif; font-weight:700; font-size:14px; letter-spacing:.4px; text-decoration:none;
  color:var(--aqua); background:rgba(111,224,208,0.1); border:2px solid rgba(111,224,208,0.5); border-radius:999px;
  padding:11px 30px; transition:transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .3s, background .2s, color .2s; }
.hello-gh:hover { transform:translateY(-4px); color:#0c0820; background:var(--aqua); border-color:var(--aqua);
  box-shadow:0 12px 34px rgba(111,224,208,0.45); text-decoration:none; }

/* one photo of Princess */
.hello-princess { margin:46px auto 0; text-align:center; max-width:380px;
  animation: hello-rise .9s cubic-bezier(.22,1,.36,1) .15s both; }
.hello-princess-img { width:100%; border-radius:18px; display:block;
  border:1px solid rgba(123,92,255,0.3); box-shadow:0 20px 48px -22px rgba(0,0,0,0.7); }
.hello-princess-cap { margin:14px 0 0; font-size:13px; letter-spacing:.3px; color:rgba(232,227,255,0.6);
  font-family:'Poppins',sans-serif; }

/* operator — one short line */
.hello-operator { display:flex; align-items:center; justify-content:center; gap:12px; margin:46px auto 0;
  padding:22px; max-width:560px; border-radius:16px; background:var(--panel);
  border:1px solid rgba(123,92,255,0.22); }
.hello-operator-glyph { font-size:26px; color:var(--gold); opacity:.85; }
.hello-operator-line { margin:0; font-family:'Poppins',sans-serif; font-size:clamp(16px,2.4vw,20px);
  font-weight:600; color:var(--ink); }

.hello-lessons { text-align:center; margin:30px auto 0; max-width:520px; font-size:15px; line-height:1.7;
  color:rgba(232,227,255,0.78); }
.hello-lessons a { color:var(--gold); font-weight:700; }

@keyframes hello-rise { from{opacity:0; transform:translateY(26px) scale(.98);} to{opacity:1; transform:none;} }
@keyframes hello-aurora { to { background-position:200% 0; } }
@keyframes hello-type { from{width:0;} to{width:13ch;} }
@keyframes hello-caret { 0%,100%{border-right-color:var(--gold);} 50%{border-right-color:transparent;} }
@keyframes hello-caret-out { from{border-right-color:var(--gold);} to{border-right-color:transparent;} }
@keyframes hello-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
@keyframes hello-glow { 0%,100%{text-shadow:0 0 0 rgba(255,210,74,0);} 50%{text-shadow:0 0 26px rgba(255,210,74,0.7);} }

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
/* Keep the text effect: "Calculating…" types out, then the email + GitHub fade in. */
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
