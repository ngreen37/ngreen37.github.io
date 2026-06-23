---
layout: easter-eggs
title: Dead Drop
permalink: /dead-drop/
fragment_key: frag_classified
---

<div class="dead-drop-wrap">
  <div class="dead-drop-eyebrow">◈ PJCC — OPERATIVE FIELD DISPATCH</div>
  <div class="dead-drop-title" id="dd-title">—</div>
  <div class="dead-drop-date" id="dd-date">—</div>
  <div class="dead-drop-body" id="dd-body">Loading dispatch...</div>
  <div class="dead-drop-footer">CLASSIFIED — EYES ONLY — DESTROY AFTER READING &nbsp;|&nbsp; /dead-drop/ &nbsp;|&nbsp; OPERATIVE NGREEN37</div>
</div>

<script>
(function() {
  var day = new Date().getDay();
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var drops = [
    {
      title: 'The Crash Site — Status Report',
      body: 'Operative surveyed crash site at 0400. Debris field has expanded 12 meters northeast. Fresh excavation marks detected near grid reference C-7. No signs of official investigation. Recommend covert monitoring. Do not approach alone.\n\nThe ship didn\'t land here by accident.'
    },
    {
      title: 'Chess City — Entry Intelligence',
      body: 'Permit applications are being rejected at an elevated rate — 34% this cycle alone. No official explanation. The word from the inside: the tournament board has a list. If you\'re on the list, your permit clears same day. If you\'re not, it disappears.\n\nPrincess is not on the list. That might change.'
    },
    {
      title: 'Shogi Island — Movement Report',
      body: 'Ferry delays on the Shogi Island route are not mechanical. Someone is holding the schedule. The island hasn\'t responded to Checker Town bureau requests in 21 days. This is not typical. Recommend reconnoitering via the eastern passage.\n\nRecovered from the dockmaster\'s log, final entry: "one A, eight C — two struck large. The old ferry answers only the octave." We do not yet know what it opens.\n\n将棋の島 — 何かが起きている。'
    },
    {
      title: 'The Sand Mines — Dispatch',
      body: 'Work conditions in shafts 3 through 7 have deteriorated. The extraction equipment predates the crash by three years — which means it was installed before anyone knew there was anything worth extracting. Someone planned this.\n\nThe Father knows more than he has said. Watch the site.'
    },
    {
      title: 'Interplanetary Construction Co. — Cover Assessment',
      body: 'Their denial of the wreckage claim is the fourth denial in six months. Each denial uses the exact same language. Same syntax. Same paragraph breaks. This is not legal boilerplate — it\'s a template. Whoever is drafting these responses works from a script.\n\nThe ship didn\'t crash. It was delivered.'
    },
    {
      title: 'Checker Town — Sector 7 Update',
      body: 'The black market for checker pieces has moved underground — literally. Three transactions logged beneath the old civic hall basement this week. Prices have tripled since the shortage hit. Someone is hoarding.\n\nIf pieces stop falling from the sky, what keeps the game going? That question is the whole problem.'
    },
    {
      title: 'Princess — Field Observation',
      body: 'Subject located at the eastern edge of Checker Town, near the outer wall. Not running. Not hiding. Standing. Watching something across the water that we cannot see from this position.\n\nShe knows where she is going. The question is whether she knows what she\'ll find when she gets there.\n\n— Operative sign-off. Transmission ends.'
    }
  ];
  var d = drops[day];
  document.getElementById('dd-title').textContent = d.title;
  document.getElementById('dd-date').textContent = days[day].toUpperCase() + ' — ' + new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  var body = document.getElementById('dd-body');
  if (body) {
    body.innerHTML = d.body.split('\n\n').map(function(p) { return '<p>' + p + '</p>'; }).join('');
  }
})();
</script>
