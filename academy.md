---
layout: page
title: PJCC Chess Academy
permalink: /academy/
own_title: true
body_class: theme-academy
---

{% comment %} THE ACADEMY, REBUILT FROM SCRATCH (2026-07-15, Nate: "tear it down and build
     it back up… scrap the Belt and all the lessons… it can't just be leveling up games…
     build a framework: start with the landing page — welcoming, animatic, it evolves, it
     draws people in").

     GONE: the belt ribbon + ladder, the five-hall COURSES list, the "next move" card that
     read game high-scores, the placement exam / homework / certificate remnants. All of it
     was "play a game to tick a box." Restore any of it from git before this date.

     NEW SHAPE — a framework, two lessons deep:
       · a living hero (the pieces rise into formation; the CTA + path evolve with YOUR
         progress and, over time, with the school itself)
       · Lesson 1 — Auston's Bootcamp Basics: a REAL board at /academy/bootcamp/
       · Lesson 2 — Notation Blitz with Crockett: coming soon
     Adding a lesson = one more `.ac-lesson` anchor here + its own page. No shared belt
     math to keep in sync any more. {% endcomment %}

<h1 class="page-title">PJCC Chess Academy</h1>

<div class="ac-hero">
  <div class="ac-strip" aria-hidden="true">
    <span style="--i:0">♟</span><span style="--i:1">♞</span><span style="--i:2">♝</span><span style="--i:3">♜</span><span style="--i:4">♛</span><span style="--i:5">♚</span>
  </div>
  <p class="ac-lead">Nobody is born knowing this game. You start where everyone starts — the pieces — and you climb from there. Welcome to the Academy.</p>
  <a class="ac-cta" id="ac-cta" href="{{ '/academy/bootcamp/' | relative_url }}">Start Lesson 1 — Auston's Bootcamp ▸</a>
</div>

<h2 class="ac-h2">The path</h2>
<div class="ac-lessons">

  <a class="ac-lesson ac-lesson--open" href="{{ '/academy/bootcamp/' | relative_url }}">
    <span class="ac-lesson-n">01</span>
    <span class="ac-lesson-ico" aria-hidden="true">💣</span>
    <span class="ac-lesson-main">
      <b>Auston's Bootcamp Basics</b>
      <small>How every piece moves — on a real board you can touch.</small>
    </span>
    <span class="ac-lesson-state" id="ac-l1-state">Start ▸</span>
  </a>

  <div class="ac-lesson ac-lesson--soon">
    <span class="ac-lesson-n">02</span>
    <span class="ac-lesson-ico" aria-hidden="true">♟</span>
    <span class="ac-lesson-main">
      <b>Notation Blitz with Crockett</b>
      <small>Read the board out loud — name any square at a glance.</small>
    </span>
    <span class="ac-soon">Coming soon</span>
  </div>

</div>

<h2 class="ac-h2 ac-h2--soft">A school that's still being built</h2>
<p class="ac-note">This is the ground floor. The Academy grows one honest lesson at a time — and the pieces you drill today get their real Blender renders as the studio models the set, on the same road that leads to the game in Godot and, one day, the show. You're early. Watch it grow. Participate, if you wish. <a href="{{ '/contact/' | relative_url }}">Contact me</a>.</p>

<script>
// The hero evolves with the visitor: Bootcamp progress (local-only) changes the CTA + the
// Lesson 1 state, so a returning student is met where they left off.
(function () {
  try {
    var s = JSON.parse(localStorage.getItem('pjcc.academy.bootcamp')) || {};
    var n = ['P', 'N', 'B', 'R', 'Q', 'K'].filter(function (k) { return s[k]; }).length;
    var state = document.getElementById('ac-l1-state'), cta = document.getElementById('ac-cta');
    if (n >= 6) {
      if (state) state.textContent = 'Review ✓';
      if (cta) cta.textContent = "Review Lesson 1 — Auston's Bootcamp ▸";
    } else if (n > 0) {
      if (state) state.textContent = 'Continue (' + n + '/6) ▸';
      if (cta) cta.textContent = "Continue Lesson 1 — Auston's Bootcamp ▸";
    }
  } catch (e) {}
})();
</script>

<script>
// A pawn that walks the whole ladder gets to choose what it becomes.
// Typed anywhere on this page (outside a text field). No hint exists anywhere.
// (Kept from the old Academy — catalogued egg frag_promotion; the gold now lights the hero.)
(function () {
  var KEY = 'pjcc.academy.promotion', buf = '', timer = null;
  function apply(on) { document.body.classList.toggle('ac-gold', on); }
  try { if (localStorage.getItem(KEY) === '1') apply(true); } catch (e) {}
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.length !== 1) return;
    buf = (buf + e.key).slice(-4);
    clearTimeout(timer); timer = setTimeout(function () { buf = ''; }, 1800);
    if (buf === 'e8=Q' || buf === 'e8=q') {
      buf = '';
      var on = !document.body.classList.contains('ac-gold');
      apply(on);
      try { localStorage.setItem(KEY, on ? '1' : '0'); localStorage.setItem('frag_promotion', '1'); } catch (e2) {}
      if (window.showTxToast) showTxToast(on
        ? 'e8=Q — PROMOTION. She was always going to rise.'
        : 'Underpromotion. Bold.');
    }
  });
})();
</script>

<style>
/* ══ THE ACADEMY THEME — "first light on the training field" (2026-07-16, Nate:
   "a completely different feel than the purple/gold… not too on-the-nose school").
   Deep pine greens, warm paper text, one EMBER-COPPER accent, fresh-leaf green for
   progress. Applied via body_class: theme-academy on /academy/ + /academy/bootcamp/
   only — the site header/footer stay standard PJCC chrome. ══ */
body.theme-academy .page-card { background: linear-gradient(165deg, #101d16 0%, #16281d 52%, #0b1710 100%);
  border-color: #2c4636; box-shadow: 0 14px 44px rgba(0, 10, 4, 0.6); }
body.theme-academy .page-body { color: #cfd8c8; }
/* the title banner leaves the purple sky for a pine tree-line at first light,
   and the section rules follow (out-specifies the html.sky-* phase gradients) */
body.theme-academy .page-title { color: #f2eddd;
  background: linear-gradient(180deg, #0d1811 0%, #16281d 62%, #2c4028 88%, #6a5426 100%);
  border-bottom: 2px solid #e08a3c; }
body.theme-academy .page-body h2 { border-bottom-color: #2c4636; }
/* the SIDES join the theme too (Nate 2026-07-16: "the green middle clashes with the
   purple sides") — the fixed town-sky behind the card turns deep pine, and the horizon
   glow warms to first-light copper. Same trick theme-bw uses; these land after the
   html.sky-* phase rules so they win every phase. */
body.theme-academy .town-sky { background: linear-gradient(180deg, #0a130e 0%, #0e1a12 55%, #142016 100%); }
body.theme-academy .ts-horizon { background: linear-gradient(180deg, rgba(0,0,0,0), rgba(224,138,60,0.09) 74%, rgba(224,138,60,0.15)); }

.page-body > .page-title { margin: 10px -44px 20px; border-radius: 0; }
@media (max-width: 700px) { .page-body > .page-title { margin: 8px -20px 16px; } }

/* ── The hero: the pieces rise into formation, then breathe ──────────────────── */
.ac-hero { text-align: center; margin: 4px 0 10px; }
.ac-strip { display: flex; gap: min(3.4vw, 20px); justify-content: center; line-height: 1; margin: 4px 0 16px;
  font-size: clamp(28px, 8vw, 48px); color: #e8b25c; }
.ac-strip span { display: inline-block; opacity: 0; transform: translateY(14px);
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.5));
  /* 2026-07-16 (Nate: "can they move more fluid? pretty choppy"). The choppiness was
     the browser re-rasterizing the glyph each frame — a 4px drift over seconds moves
     in visible whole-pixel snaps. will-change promotes each piece to its own
     compositor layer, so the float interpolates at sub-pixel smoothness; the drift
     itself is a touch deeper and slower (6px / 6.4s sine) so it reads as floating. */
  will-change: transform;
  animation: acRise 0.6s ease forwards, acBob 6.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: calc(var(--i) * 0.14s), calc(1.1s + var(--i) * 0.14s); }
@keyframes acRise { to { opacity: 1; transform: none; } }
@keyframes acBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.ac-lead { max-width: 560px; margin: 0 auto 18px; color: #e9e4d3; font-size: 1.04rem; line-height: 1.62; }
.ac-cta { display: inline-block; background: #e08a3c; color: #140e06; font-weight: 800; text-decoration: none;
  border-radius: 999px; padding: 12px 24px; font-size: 1rem; box-shadow: 0 6px 22px -6px rgba(224,138,60,0.55);
  transition: transform 0.12s, box-shadow 0.12s; }
.ac-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 28px -6px rgba(224,138,60,0.65); }

/* ── The path ─────────────────────────────────────────────────────────────── */
.ac-h2 { color: #ffb347; margin: 28px 0 10px; font-size: 1.15rem; }
.ac-h2--soft { color: #8fae94; font-size: 1rem; margin-top: 30px; }
.ac-lessons { display: flex; flex-direction: column; gap: 10px; max-width: 640px; }
.ac-lesson { display: flex; align-items: center; gap: 14px; padding: 13px 16px; text-decoration: none;
  background: rgba(23,42,30,0.7); border: 1px solid #2c4636;
  border-left: 3px solid #e08a3c; border-radius: var(--r-sm, 8px); transition: border-color 0.15s, background 0.15s; }
.ac-lesson--open:hover { border-color: #e08a3c; background: rgba(28,52,37,0.85); }
.ac-lesson--soon { border-left-color: rgba(143,174,148,0.45); background: rgba(23,42,30,0.35); }
.ac-lesson-n { font-family: 'Share Tech Mono', monospace; font-size: 1.05rem; font-weight: 700; color: #5d7a63; flex: 0 0 auto; }
.ac-lesson-ico { font-size: 26px; flex: 0 0 auto; }
.ac-lesson--soon .ac-lesson-ico { opacity: 0.55; }
.ac-lesson-main { flex: 1; min-width: 0; }
.ac-lesson-main b { display: block; color: #f2eddd; font-size: 1rem; }
.ac-lesson--soon .ac-lesson-main b { color: #b7c6b3; }
.ac-lesson-main small { display: block; color: #8fae94; font-size: 0.82rem; margin-top: 2px; }
.ac-lesson-state { flex: 0 0 auto; font-weight: 800; color: #ffb347; font-size: 0.9rem; white-space: nowrap; }
.ac-soon { flex: 0 0 auto; font-family: 'Share Tech Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: #93b39a; background: rgba(10,20,14,0.65); border: 1px solid #2c4636;
  border-radius: 999px; padding: 3px 9px; white-space: nowrap; }

.ac-note { max-width: 640px; color: #a9c2ab; font-size: 0.9rem; line-height: 1.65; }
.ac-note a { color: #ffb347; }

/* the e8=Q promotion egg lights the hero gold, found never given — the one place
   the old arcade gold still burns, and on pine it burns brighter */
body.ac-gold .ac-strip { color: #ffe08a; }
body.ac-gold .ac-cta { background: #ffd740; color: #1a0f3d; box-shadow: 0 0 30px rgba(245,197,24,0.4); }

@media (prefers-reduced-motion: reduce) {
  .ac-strip span { opacity: 1; transform: none; animation: none; }
  .ac-cta { transition: none; }
}
</style>
