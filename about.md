---
layout: default
title: About / Contact
permalink: /about/
body_class: theme-contact
jukebox: true
---

<!-- ══════════ CONTACT ══════════ -->
<section class="contact-hero">
  <div class="contact-hero-piece" aria-hidden="true">♜</div>
  <p class="contact-eyebrow" data-jp="ご挨拶">Say Hello</p>
  <h1 class="contact-headline" data-jp="お問い合わせ">Get In Touch</h1>
  <div class="contact-methods">
    <div class="contact-calc-wrapper" id="contact-calc-wrap">
      <div class="contact-calc-line" id="calc-line-1"></div>
    </div>
    <a href="mailto:nathgreen37@gmail.com" class="contact-email-link" id="contact-email" style="opacity:0;pointer-events:none">nathgreen37@gmail.com</a>
    <a href="https://github.com/ngreen37" class="contact-gh-btn" id="contact-gh" style="opacity:0;pointer-events:none" target="_blank" rel="noopener">♟&nbsp; GitHub — ngreen37</a>
  </div>

<script>
(function() {
  var line1 = document.getElementById('calc-line-1');
  var wrap  = document.getElementById('contact-calc-wrap');
  var email = document.getElementById('contact-email');
  var gh    = document.getElementById('contact-gh');
  var cursor = '<span class="contact-calc-cursor"></span>';

  function typeInto(el, text, delay, cb) {
    setTimeout(function() {
      var i = 0;
      el.innerHTML = cursor;
      var t = setInterval(function() {
        el.innerHTML = text.slice(0, i + 1) + cursor;
        i++;
        if (i >= text.length) {
          clearInterval(t);
          setTimeout(function() { el.innerHTML = text; if (cb) cb(); }, 300);
        }
      }, 38);
    }, delay);
  }

  function fadeIn(el, cb) {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
    if (cb) setTimeout(cb, 600);
  }

  typeInto(line1, 'Calculating...', 500, function() {
    setTimeout(function() {
      wrap.style.transition = 'opacity 0.4s';
      wrap.style.opacity = '0';
      setTimeout(function() {
        wrap.style.display = 'none';
        fadeIn(email, function() {
          fadeIn(gh);
        });
      }, 420);
    }, 700);
  });
})();
</script>
</section>

<!-- ══════════ DIVIDER ══════════ -->
<div class="contact-about-divider" aria-hidden="true">
  <span class="divider-line"></span>
  <span class="divider-piece">♚</span>
  <span class="divider-line"></span>
</div>

<!-- ══════════ ABOUT ══════════ -->
<section class="about-wrap">

  <div class="about-block">
    <div class="about-block-header">
      <h2 class="about-block-name">Princess</h2>
      <span class="about-block-sub">Princess Sophia McPuppy</span>
    </div>
    <div class="about-photo-grid">
      <div class="about-photo-slot">
        <img src="{{ site.baseurl }}/assets/images/Princess-1.png" alt="Princess" class="about-photo">
      </div>
      <div class="about-photo-slot">
        <img src="{{ site.baseurl }}/assets/images/Princess-2.jpg" alt="Princess" class="about-photo">
      </div>
      <div class="about-photo-slot">
        <img src="{{ site.baseurl }}/assets/images/Princess-3.jpg" alt="Princess" class="about-photo" style="object-fit: contain; background: #071e22;">
      </div>
    </div>
    <p class="about-block-bio">The real Princess Sophia McPuppy — the inspiration behind McPuppy Studios and the heart of everything here. She loves running and chasing squirrels, cats, or anything she deems interesting. When I return from work, the podcasts I leave on for her have ended and either old Chess Tournament coverage or Toronto Maple Leafs sports talk shows are on.</p>
  </div>

  <div class="about-block">
    <div class="about-block-header">
      <h2 class="about-block-name">The Operator</h2>
    </div>
    <div class="about-block-bio">
      <p>There's one person behind the curtain in Checker Town. For now, they'd rather let the work do the talking — so the name stays in the margins, and the story stays the point.</p>
      <p>That said, the door is real and it's answered. For genuine business — collaborations, licensing, press, school programs, or commissions — reach out any time at <a href="mailto:nathgreen37@gmail.com">nathgreen37@gmail.com</a>. You'll get a real reply from a real person.</p>
    </div>
  </div>

  <div class="about-block">
    <div class="about-block-header">
      <h2 class="about-block-name">Chess Lessons</h2>
    </div>
    <div class="about-block-bio">
      <p>I teach chess for <strong>beginners and intermediate players of any age</strong> — whether you're learning how the pieces move or sharpening a game you already love. Lessons run <strong>in person and online</strong>, tailored to your schedule and goals.</p>
      <p>For availability and pricing, <a href="mailto:nathgreen37@gmail.com">email me</a> — I'd love to hear from you. Between lessons, the free <a href="{{ '/academy/' | relative_url }}">Checker Town Chess Academy</a> is a self-paced way to practice openings, tactics, and board vision through the games. You can also see a <a href="{{ '/chess-lessons/' | relative_url }}">live game feed &amp; daily puzzle →</a>.</p>
    </div>
  </div>

</section>
