---
layout: default
title: About / Contact
permalink: /about/
body_class: theme-contact
---

<!-- ══════════ CONTACT ══════════ -->
<section class="contact-hero">
  <div class="contact-hero-piece" aria-hidden="true">♜</div>
  <p class="contact-eyebrow">Say Hello</p>
  <h1 class="contact-headline">Get In Touch</h1>
  <div class="contact-methods">
    <div class="contact-calc-wrapper" id="contact-calc-wrap">
      <div class="contact-calc-line" id="calc-line-1"></div>
      <div class="contact-calc-line" id="calc-line-2"></div>
    </div>
    <a href="mailto:nathgreen37@gmail.com" class="contact-email-link" id="contact-email" style="opacity:0;pointer-events:none">nathgreen37@gmail.com</a>
    <a href="https://github.com/ngreen37" class="contact-gh-btn" id="contact-gh" style="opacity:0;pointer-events:none" target="_blank" rel="noopener">♟&nbsp; GitHub — ngreen37</a>
  </div>

<script>
(function() {
  var line1 = document.getElementById('calc-line-1');
  var line2 = document.getElementById('calc-line-2');
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
    typeInto(line2, 'Calculating...', 200, function() {
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
      <h2 class="about-block-name">The Creator</h2>
    </div>
    <div class="about-block-bio">
      <h3>Career Highlights</h3>
      <ul>
        <li>Built a powerful mortgage calculator — a tool that brought real clarity to a complicated process</li>
        <li>Automated his "dream job" out of creative boredom, then wondered where coding and mathematics can take them</li>
        <li>Teaching chess — the current chapter, and the one that inspired this whole project</li>
      </ul>
      <h3>Other Hobbies</h3>
      <ul>
        <li>Hockey</li>
        <li>Attending concerts and listening to music</li>
        <li>Off-and-on endurance running</li>
      </ul>
    </div>
  </div>

</section>
