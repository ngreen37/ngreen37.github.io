---
layout: character
title: Princess
full_name: Princess Sophia McPuppy
role: Main Character
image: /assets/images/Princess_Color_v01.jpg
permalink: /characters/princess/
order: 1
piece: ♞
chapters: 0,1
dossier_clearance: DELTA
last_seen: CHECKER TOWN
field_note: "The first time Princess lost a game she didn't sulk — she asked to watch the whole thing again, move by move, tail thumping at the exact square she went wrong. She can learn anything because she has never once been too proud to be a beginner."
---

Princess is the heart of the story -- a dog who can learn *anything*. Chess is simply the first thing she set out to master; the gift for charming everyone she meets runs a close second.

## Traits
- **Can learn anything** -- show her something once and she starts mastering it; chess was only the first thing
- A quick study at the board: natural instincts, sharper every game
- Loyal, obedient, and endlessly curious
- A people-dog: thrives on attention, affection, and treats
- Believes -- has since she was small, though no one will say who taught her, or whether they meant to -- that she will one day be a <a class="pp-broken" href="/characters/the-queen/">[QUEEN]</a>

## Background
She lives with Nate in Checker Town and accompanies him on every adventure -- from the local bank (where she is, without question, the Star of the Show) to the long road toward Chess City.

## Role in the Story
Princess is the reason everything happens. The journey to Chess City begins because of her, and it is her loyalty and curiosity that keep the story moving forward even when the odds are stacked against the both of them. And she never stops growing -- every game, every lesson, every new skill carries her another square forward.

{% comment %} REMOVED 2026-07-12 (Nate): the "Princess & You" panel — she was being used as
     the VISITOR's companion (training/bond/walks). Princess is her own character, not the
     player's pet; players will get a companion of their own later. The site-wide walker went
     with it. Also removed here: the "## Art" wireframe, and the "Real vs. Rendered" slider
     (SAVED — parked in FUTURE-IDEAS and restorable from git; the .img-compare styles remain).
{% endcomment %}

## The Ascension

<p class="pp-intro">She believes she will one day be a <a class="pp-broken" href="{{ '/characters/the-queen/' | relative_url }}">[QUEEN]</a>. The more of her world you explore, the more the board seems to agree — though no one will say it out loud.</p>

<div class="pp-ascension" id="pp-ascension">
  <div class="pp-asc-top"><span class="pp-asc-label">◈ ASCENSION</span><span class="pp-asc-tier" id="pp-asc-tier">—</span></div>
  <div class="pp-asc-bar"><i id="pp-asc-fill" style="width:0%"></i></div>
  <p class="pp-asc-whisper" id="pp-asc-whisper">—</p>
  <p class="pp-asc-foot">Spoiler-safe by design — this only ever hints. Where it leads is hers to reach.</p>
</div>
<script>
(function () {
  // A quiet "ascension" read that DEEPENS with your real progress (fragments found,
  // Gauntlet floors cleared, games touched) and reveals flavour — never plot.
  var WHISPERS = [
    'The board only knows her as a Checker Town dog. For now.',
    'Word travels fast. A dog who can learn anything is hard to keep quiet about.',
    'In the right rooms, they have started to say her name.',
    'Some pieces move a little differently when she is near.',
    'The far towers have taken notice. No one will say why.',
    'There is a chair at the end of every board. She is getting closer to hers.'
  ];
  var TIERS = ['UNRANKED', 'A RUMOUR', 'A NAME', 'A PRESENCE', 'A LEGEND', '—— ??? ——'];
  function countKeys(re) { var n = 0; try { for (var i = 0; i < localStorage.length; i++) { if (re.test(localStorage.key(i))) n++; } } catch (e) {} return n; }
  function cleared() { try { var p = JSON.parse(localStorage.getItem('pjcc.gauntlet.v2')) || {}, b = p.beaten || {}, c = 0; for (var k in b) if (b[k]) c++; return c; } catch (e) { return 0; } }
  var frags = countKeys(/^frag_/), games = countKeys(/^pjcc\.best\./), floors = cleared();
  var pct = Math.min(100, frags * 9 + floors * 5 + games * 4);
  var tier = pct < 10 ? 0 : pct < 30 ? 1 : pct < 50 ? 2 : pct < 72 ? 3 : pct < 92 ? 4 : 5;
  var fill = document.getElementById('pp-asc-fill'), tEl = document.getElementById('pp-asc-tier'), wEl = document.getElementById('pp-asc-whisper');
  if (fill) setTimeout(function () { fill.style.width = Math.max(5, pct) + '%'; }, 60);
  if (tEl) tEl.textContent = TIERS[tier];
  if (wEl) wEl.textContent = WHISPERS[tier];
})();
</script>

<style>
  .pp-broken { font-family: 'Courier New', monospace; font-size: 0.88em; color: #9a7fd4; text-decoration: none; border-bottom: 1px dashed rgba(154,127,212,0.55); }
  .pp-broken:hover { color: #F5C518; border-bottom-color: rgba(245,197,24,0.6); }
  .pp-intro { color: #c9a7ff; max-width: 640px; }

  /* The Ascension — a spoiler-safe status read that deepens with real progress. */
  .pp-ascension { max-width: 640px; margin: 14px 0; padding: 16px 18px; border-radius: 14px;
    background: linear-gradient(135deg, rgba(31,17,71,0.7), rgba(45,27,105,0.5)); border: 1px solid #4a2f8a; }
  .pp-asc-top { display: flex; justify-content: space-between; align-items: baseline; }
  .pp-asc-label { font-family: 'Share Tech Mono', monospace; font-size: 0.68rem; letter-spacing: 0.16em; color: #ff8fd0; }
  .pp-asc-tier { font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; letter-spacing: 0.1em; color: #F5C518; }
  .pp-asc-bar { height: 8px; background: #160c33; border: 1px solid #4a2f8a; border-radius: 999px; overflow: hidden; margin: 8px 0; }
  .pp-asc-bar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg,#6b5fa0,#ff8fd0,#F5C518); transition: width 1.2s ease; }
  .pp-asc-whisper { color: #e7dcff; font-style: italic; margin: 6px 0 2px; }
  .pp-asc-foot { color: #9a7fd4; font-size: 0.8rem; margin: 4px 0 0; }
</style>
