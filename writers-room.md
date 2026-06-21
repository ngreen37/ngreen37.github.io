---
layout: page
title: The Writers' Room
permalink: /writers-room/
---

<div class="wr-intro">
  <div class="wr-kicker">Author the show</div>
  <p class="wr-sub">The pilot is being built in the open — so build with us. Story-board your own PJCC tale (or anything) using the same structures the pros swear by, preview it as a reel with a temp score, and <b>publish</b> a shareable link. For you, or any Operative.</p>
</div>

<!-- ===== TWO SCHOOLS ===== -->
<div class="wr-schools">
  <div class="wr-school">
    <div class="wr-school-name">◐ Dan Harmon — the Story Circle</div>
    <p>Harmon's distilled <i>monomyth</i>: a character in comfort <b>wants</b> something, crosses into the unknown, finds it, pays a price, and comes home <b>changed</b>. Eight beats around a circle — order up top, chaos below.</p>
    <p class="wr-muted">Great for a whole episode or arc — it guarantees the hero actually <i>changes</i>.</p>
  </div>
  <div class="wr-school">
    <div class="wr-school-name">▷ Trey Parker — "but / therefore"</div>
    <p>Parker &amp; Stone's rule: between every beat the word should be <b>“but”</b> or <b>“therefore”</b> — never <b>“and then.”</b> "And then" is just stuff happening; "but/therefore" is cause, consequence, and conflict.</p>
    <p class="wr-muted">Great for tightening a sequence — the Room flags any "and then" for you.</p>
  </div>
</div>

<!-- ===== READ VIEW (shown when opening a published link) ===== -->
<div class="wr-read selectable" id="wr-read" hidden></div>

<!-- ===== EDITOR ===== -->
<div class="wr-editor" id="wr-editor">

  <div class="wr-meta">
    <div class="wr-meta-row">
      <input id="wr-title" class="wr-in wr-title" maxlength="80" placeholder="Story title — e.g. “Fell From the Sky”" autocomplete="off">
      <select id="wr-method" class="wr-in wr-method">
        <option value="harmon">Method · Harmon Story Circle</option>
        <option value="parker">Method · Parker but/therefore</option>
        <option value="free">Method · Freeform beats</option>
      </select>
    </div>
    <div class="wr-meta-row">
      <input id="wr-logline" class="wr-in wr-logline" maxlength="160" placeholder="Logline — one sentence: who wants what, against what?" autocomplete="off">
      <input id="wr-author" class="wr-in wr-author" maxlength="32" placeholder="by — your handle" autocomplete="off">
    </div>
    <div class="wr-toolbar">
      <button class="wr-btn" id="wr-new" type="button">＋ New</button>
      <button class="wr-btn" id="wr-save" type="button">▣ Save draft</button>
      <span class="wr-example-wrap">
        <button class="wr-btn" id="wr-example-btn" type="button">≡ Load example ▾</button>
        <div class="wr-example-menu" id="wr-example-menu" hidden>
          <button type="button" data-ex="pilot">The Pilot — Story Circle</button>
          <button type="button" data-ex="louie">Auston's Fuse — but/therefore</button>
        </div>
      </span>
    </div>
  </div>

  <!-- Harmon circle + 8 fixed beats -->
  <div class="wr-harmon" id="wr-harmon">
    <div class="wr-circle-wrap">
      <svg id="wr-circle" class="wr-circle" viewBox="0 0 240 240" aria-hidden="true"></svg>
      <div class="wr-circle-hint">order<br><span>↑ ─────── ↓</span><br>chaos</div>
    </div>
    <div class="wr-harmon-beats" id="wr-harmon-beats"></div>
  </div>

  <!-- Parker / freeform dynamic beat list -->
  <div class="wr-list" id="wr-list" hidden>
    <div class="wr-list-beats" id="wr-list-beats"></div>
    <button class="wr-btn wr-add" id="wr-add" type="button">＋ Add beat</button>
  </div>

  <div class="wr-feedback" id="wr-feedback"></div>
</div>

<!-- ===== PREVIEW + PUBLISH ===== -->
<div class="wr-stage">
  <h3 class="wr-h3">◈ Preview the reel</h3>
  <div class="wr-screen">
    <div class="wr-frame" id="wr-frame">
      <div class="wr-thirds" aria-hidden="true"></div>
      <div class="wr-art" id="wr-art">🎬</div>
      <div class="wr-slate"><span id="wr-slug">—</span><span class="wr-comp" id="wr-comp">—</span></div>
      <div class="wr-vo" id="wr-vo"></div>
    </div>
    <div class="wr-progress"><i id="wr-progress-fill"></i></div>
  </div>
  <div class="wr-transport">
    <button class="wr-tbtn" id="wr-prev" type="button" aria-label="Previous panel">⏮</button>
    <button class="wr-tbtn wr-play" id="wr-play" type="button" aria-label="Play reel">▶</button>
    <button class="wr-tbtn" id="wr-next" type="button" aria-label="Next panel">⏭</button>
    <span class="wr-count" id="wr-count">— / —</span>
    <button class="wr-tbtn wr-mute" id="wr-mute" type="button" title="Temp score on">♪</button>
  </div>

  <h3 class="wr-h3">◈ Publish</h3>
  <p class="wr-muted">Publishing bakes the whole story into a link — no account needed. Anyone who opens it sees your reel and can remix it. <span class="wr-note-soon">(A shared studio gallery arrives with Operative accounts.)</span></p>
  <div class="wr-publish">
    <button class="wr-btn wr-pub" id="wr-publish" type="button">◈ Publish &amp; copy link</button>
    <button class="wr-btn" id="wr-copycode" type="button">⧉ Copy story code</button>
    <button class="wr-btn" id="wr-import" type="button">⇤ Load from code</button>
  </div>
  <div class="wr-share" id="wr-share" hidden>
    <input id="wr-share-link" class="wr-in" readonly>
    <span class="wr-share-flash" id="wr-share-flash">copied ✓</span>
  </div>
</div>

<!-- ===== MY DRAFTS ===== -->
<div class="wr-drafts">
  <h3 class="wr-h3">◈ Your drafts <span class="wr-muted">— saved on this device</span></h3>
  <div class="wr-draft-list" id="wr-draft-list"></div>
</div>

<script src="{{ '/assets/js/pjcc-leitmotif.js' | relative_url }}"></script>
<script>
(function () {
  "use strict";

  // ---- the eight Story Circle stages (Harmon) ----
  var HARMON = [
    ['You',    'A character is in a zone of comfort…'],
    ['Need',   '…but they want something.'],
    ['Go',     'They cross into an unfamiliar situation…'],
    ['Search', '…and adapt to it,'],
    ['Find',   '…finding what they wanted,'],
    ['Take',   '…paying a heavy price for it,'],
    ['Return', '…then heading back to the familiar,'],
    ['Change', '…having changed.']
  ];
  var SHOTS_TYPES = ['ESTABLISH','WIDE','MEDIUM','CLOSE','OTS','INSERT','POV'];
  var ART_PALETTE = ['🌌','🛸','📦','🌅','🐾','🐶','♞','🏙️','🌊','⛩','♟','♛','🔥','⚡','💥','🎬','🗺️','🌙','🕯️','📜'];

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function el(tag, cls, html){ var d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; }

  function beat(){ return { x:'', s:'WIDE', a:'', vo:'', c:'THEREFORE' }; }
  function blank(method){
    var beats = (method === 'harmon') ? HARMON.map(function(){ return beat(); }) : [beat(), beat(), beat()];
    return { v:1, title:'', logline:'', author:'', method:method, beats:beats };
  }

  var S = blank('harmon');

  // ============================================================
  //  EDITOR RENDER
  // ============================================================
  function syncMeta(){
    $('wr-title').value = S.title;
    $('wr-logline').value = S.logline;
    $('wr-author').value = S.author;
    $('wr-method').value = S.method;
  }

  function shotSelect(b){
    var sel = el('select', 'wr-mini wr-shot');
    SHOTS_TYPES.forEach(function (t) {
      var o = el('option'); o.value = t; o.textContent = t; if (t === b.s) o.selected = true; sel.appendChild(o);
    });
    sel.onchange = function(){ b.s = sel.value; onChange(); };
    return sel;
  }
  function artInput(b){
    var inp = el('input', 'wr-mini wr-artin'); inp.maxLength = 3; inp.value = b.a; inp.placeholder = '🎬';
    inp.title = 'Frame emoji';
    inp.oninput = function(){ b.a = inp.value; onChange(); };
    return inp;
  }
  function voInput(b){
    var inp = el('input', 'wr-mini wr-voin'); inp.maxLength = 160; inp.value = b.vo; inp.placeholder = 'VO / dialogue (optional)'; inp.autocomplete = 'off';
    inp.oninput = function(){ b.vo = inp.value; onChange(); };
    return inp;
  }

  function renderHarmon(){
    var wrap = $('wr-harmon-beats'); wrap.innerHTML = '';
    S.beats.forEach(function (b, i) {
      var stage = HARMON[i] || ['Beat ' + (i+1), ''];
      var row = el('div', 'wr-beat wr-hbeat');
      var head = el('div', 'wr-beat-head',
        '<span class="wr-beat-num">' + (i+1) + '</span>' +
        '<b class="wr-beat-stage">' + esc(stage[0]) + '</b>' +
        '<span class="wr-beat-prompt">' + esc(stage[1]) + '</span>');
      var ta = el('textarea', 'wr-ta'); ta.value = b.x; ta.rows = 2; ta.placeholder = 'What happens at "' + stage[0] + '"?';
      ta.oninput = function(){ b.x = ta.value; onChange(); };
      var panel = el('div', 'wr-panel');
      panel.appendChild(artInput(b)); panel.appendChild(shotSelect(b)); panel.appendChild(voInput(b));
      row.appendChild(head); row.appendChild(ta); row.appendChild(panel);
      wrap.appendChild(row);
    });
    buildCircle();
  }

  function renderList(){
    var wrap = $('wr-list-beats'); wrap.innerHTML = '';
    S.beats.forEach(function (b, i) {
      if (i > 0 && S.method === 'parker') {
        var conn = el('div', 'wr-conn');
        var btn = el('button', 'wr-conn-btn ' + (b.c === 'BUT' ? 'is-but' : 'is-therefore'));
        btn.type = 'button'; btn.textContent = b.c === 'BUT' ? 'BUT' : 'THEREFORE';
        btn.title = 'Click to switch the connective';
        btn.onclick = function(){ b.c = (b.c === 'BUT') ? 'THEREFORE' : 'BUT'; renderList(); onChange(); };
        conn.appendChild(btn);
        wrap.appendChild(conn);
      } else if (i > 0) {
        wrap.appendChild(el('div', 'wr-conn wr-conn-plain', 'then'));
      }
      var row = el('div', 'wr-beat wr-lbeat');
      var head = el('div', 'wr-beat-head',
        '<span class="wr-beat-num">' + (i+1) + '</span>' +
        '<b class="wr-beat-stage">Beat ' + (i+1) + '</b>');
      var tools = el('span', 'wr-beat-tools');
      var up = el('button', 'wr-icon', '↑'); up.type='button'; up.title='Move up'; up.disabled = (i===0);
      up.onclick = function(){ if (i>0){ var t=S.beats[i-1]; S.beats[i-1]=S.beats[i]; S.beats[i]=t; renderList(); onChange(); } };
      var dn = el('button', 'wr-icon', '↓'); dn.type='button'; dn.title='Move down'; dn.disabled = (i===S.beats.length-1);
      dn.onclick = function(){ if (i<S.beats.length-1){ var t=S.beats[i+1]; S.beats[i+1]=S.beats[i]; S.beats[i]=t; renderList(); onChange(); } };
      var rm = el('button', 'wr-icon wr-icon-del', '✕'); rm.type='button'; rm.title='Delete beat'; rm.disabled = (S.beats.length<=1);
      rm.onclick = function(){ if (S.beats.length>1){ S.beats.splice(i,1); renderList(); onChange(); } };
      tools.appendChild(up); tools.appendChild(dn); tools.appendChild(rm);
      head.appendChild(tools);
      var ta = el('textarea', 'wr-ta'); ta.value = b.x; ta.rows = 2; ta.placeholder = 'Action line for this beat…';
      ta.oninput = function(){ b.x = ta.value; onChange(); };
      var panel = el('div', 'wr-panel');
      panel.appendChild(artInput(b)); panel.appendChild(shotSelect(b)); panel.appendChild(voInput(b));
      row.appendChild(head); row.appendChild(ta); row.appendChild(panel);
      wrap.appendChild(row);
    });
  }

  function render(){
    $('wr-harmon').hidden = (S.method !== 'harmon');
    $('wr-list').hidden = (S.method === 'harmon');
    if (S.method === 'harmon') renderHarmon(); else renderList();
    onChange();
  }

  // ---- Story Circle SVG ----
  function buildCircle(){
    var svg = $('wr-circle'); svg.innerHTML = '';
    var cx = 120, cy = 120, R = 92;
    svg.appendChild(svgEl('circle', { cx:cx, cy:cy, r:R, class:'wr-c-ring' }));
    svg.appendChild(svgEl('line', { x1:cx-R, y1:cy, x2:cx+R, y2:cy, class:'wr-c-div' }));
    for (var i = 0; i < 8; i++) {
      var ang = (-90 + i * 45) * Math.PI / 180;       // 1 (You) at top, clockwise
      var x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
      var filled = !!(S.beats[i] && S.beats[i].x && S.beats[i].x.trim());
      var g = svgEl('g', { class: 'wr-c-node' + (filled ? ' is-filled' : '') });
      g.appendChild(svgEl('circle', { cx:x, cy:y, r:14 }));
      var tx = svgEl('text', { x:x, y:y+1 }); tx.textContent = String(i+1); g.appendChild(tx);
      var lbl = svgEl('text', { x:x, y:y+26, class:'wr-c-lbl' }); lbl.textContent = HARMON[i][0]; g.appendChild(lbl);
      svg.appendChild(g);
    }
  }
  function svgEl(tag, attrs){
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) if (k !== 'class') e.setAttribute(k, attrs[k]); else e.setAttribute('class', attrs[k]);
    return e;
  }

  // ---- feedback (Harmon completion / Parker and-then flags) ----
  function onChange(){
    if (S.method === 'harmon') buildCircle();
    var fb = $('wr-feedback'); fb.innerHTML = '';
    if (S.method === 'harmon') {
      var done = S.beats.filter(function (b) { return b.x && b.x.trim(); }).length;
      var missing = [];
      S.beats.forEach(function (b, i) { if (!(b.x && b.x.trim())) missing.push(HARMON[i][0]); });
      fb.appendChild(el('div', 'wr-fb-line', '<b>Story Circle:</b> ' + done + ' / 8 beats written' +
        (missing.length ? ' <span class="wr-muted">· still open: ' + esc(missing.join(', ')) + '</span>' : ' <span class="wr-ok">· complete ✓</span>')));
    } else if (S.method === 'parker') {
      var buts = 0, thens = 0, flags = [];
      S.beats.forEach(function (b, i) {
        if (i > 0) { if (b.c === 'BUT') buts++; else thens++; }
        if (/^\s*and\s+then\b/i.test(b.x) || /\band then\b/i.test(b.x)) flags.push(i + 1);
      });
      fb.appendChild(el('div', 'wr-fb-line', '<b>Connectives:</b> ' + buts + ' × but · ' + thens + ' × therefore'));
      if (flags.length) {
        fb.appendChild(el('div', 'wr-fb-line wr-warn', '⚠ "and then" detected in beat ' + flags.join(', ') +
          ' — that’s the enemy. Make the link a <b>but</b> or a <b>therefore</b>.'));
      } else {
        fb.appendChild(el('div', 'wr-fb-line wr-ok', 'No "and then" in sight. Every beat earns the next ✓'));
      }
    }
    buildPreviewIfIdle();
  }

  // ============================================================
  //  PREVIEW PLAYER
  // ============================================================
  var pv = { idx:0, playing:false, t:0, raf:null, muted:false, last:0, dur:3.6, beats:[] };
  function playable(){ return S.beats.filter(function (b) { return (b.x && b.x.trim()) || (b.a && b.a.trim()) || (b.vo && b.vo.trim()); }); }

  function buildPreviewIfIdle(){ if (!pv.playing) { pv.beats = playable(); if (pv.idx >= pv.beats.length) pv.idx = 0; showPanel(pv.idx, false); } }

  function showPanel(i, playMotif){
    pv.beats = playable();
    var n = pv.beats.length;
    var frame = $('wr-frame'), art = $('wr-art'), slug = $('wr-slug'), comp = $('wr-comp'), vo = $('wr-vo');
    if (!n) {
      art.textContent = '🎬'; slug.textContent = '—'; comp.textContent = '—';
      vo.innerHTML = '<i>Write a beat to preview your reel.</i>'; vo.classList.add('show');
      $('wr-count').textContent = '— / —'; $('wr-progress-fill').style.width = '0%';
      frame.style.background = ''; return;
    }
    pv.idx = ((i % n) + n) % n;
    var b = pv.beats[pv.idx];
    var stageName = (S.method === 'harmon') ? (HARMON[S.beats.indexOf(b)] ? HARMON[S.beats.indexOf(b)][0] : '') : '';
    art.textContent = (b.a && b.a.trim()) ? b.a.trim() : '🎬';
    art.style.animation = 'none'; void art.offsetWidth; art.style.animation = '';
    slug.textContent = (stageName ? stageName.toUpperCase() + ' · ' : '') + 'PANEL ' + (pv.idx + 1);
    comp.textContent = b.s || 'WIDE';
    if (b.vo && b.vo.trim()) vo.innerHTML = '“' + esc(b.vo.trim()) + '”';
    else if (b.x && b.x.trim()) vo.innerHTML = '<span class="wr-vo-act">' + esc(b.x.trim()) + '</span>';
    else vo.innerHTML = '<i>—</i>';
    vo.classList.add('show');
    frame.style.background = '';
    $('wr-count').textContent = (pv.idx + 1) + ' / ' + n;
    pv.t = 0; $('wr-progress-fill').style.width = '0%';
    if (playMotif && !pv.muted && window.PJCCLeitmotif) { try { PJCCLeitmotif.play((S.title || 'PJCC') + ' ' + pv.idx); } catch (e) {} }
  }
  function pvStep(now){
    if (!pv.playing) return;
    var dt = Math.min(0.05, (now - pv.last) / 1000); pv.last = now;
    pv.t += dt;
    $('wr-progress-fill').style.width = Math.min(100, pv.t / pv.dur * 100) + '%';
    if (pv.t >= pv.dur) {
      if (pv.idx >= pv.beats.length - 1) { pvPause(); $('wr-progress-fill').style.width = '100%'; return; }
      showPanel(pv.idx + 1, true);
    }
    pv.raf = requestAnimationFrame(pvStep);
  }
  function pvPlay(){ pv.beats = playable(); if (!pv.beats.length) return; pv.playing = true; $('wr-play').textContent = '⏸'; $('wr-play').classList.add('on'); pv.last = performance.now();
    if (!pv.muted && window.PJCCLeitmotif) { try { PJCCLeitmotif.play((S.title || 'PJCC') + ' ' + pv.idx); } catch (e) {} }
    pv.raf = requestAnimationFrame(pvStep); }
  function pvPause(){ pv.playing = false; $('wr-play').textContent = '▶'; $('wr-play').classList.remove('on'); if (pv.raf) cancelAnimationFrame(pv.raf); }
  $('wr-play').onclick = function(){ pv.playing ? pvPause() : pvPlay(); };
  $('wr-prev').onclick = function(){ showPanel(pv.idx - 1, true); if (pv.playing) pv.last = performance.now(); };
  $('wr-next').onclick = function(){ showPanel(pv.idx + 1, true); if (pv.playing) pv.last = performance.now(); };
  $('wr-mute').onclick = function(){ pv.muted = !pv.muted; $('wr-mute').classList.toggle('muted', pv.muted); $('wr-mute').title = pv.muted ? 'Temp score muted' : 'Temp score on'; };

  // ============================================================
  //  META INPUT WIRING
  // ============================================================
  $('wr-title').oninput   = function(){ S.title = this.value; };
  $('wr-logline').oninput = function(){ S.logline = this.value; };
  $('wr-author').oninput  = function(){ S.author = this.value; };
  $('wr-method').onchange = function(){
    var nm = this.value;
    if (nm === 'harmon' && S.method !== 'harmon') {
      // keep up to 8 of the existing beats, pad to 8
      var kept = S.beats.slice(0, 8);
      while (kept.length < 8) kept.push(beat());
      S.beats = kept;
    } else if (nm !== 'harmon' && S.method === 'harmon') {
      S.beats = S.beats.filter(function (b) { return b.x && b.x.trim(); });
      if (!S.beats.length) S.beats = [beat(), beat(), beat()];
    }
    S.method = nm; render();
  };
  $('wr-add').onclick = function(){ S.beats.push(beat()); renderList(); onChange(); };
  $('wr-new').onclick = function(){ if (confirm('Start a fresh story? Unsaved changes are lost.')) { S = blank(S.method); syncMeta(); render(); } };

  // ============================================================
  //  DRAFTS (local)
  // ============================================================
  var DKEY = 'pjcc.wr.drafts';
  function getDrafts(){ try { return JSON.parse(localStorage.getItem(DKEY) || '[]'); } catch (e) { return []; } }
  function setDrafts(a){ try { localStorage.setItem(DKEY, JSON.stringify(a)); } catch (e) {} }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  $('wr-save').onclick = function(){
    var drafts = getDrafts();
    var name = (S.title || 'Untitled').trim();
    var existing = drafts.findIndex(function (d) { return d.title === name; });
    var rec = { id: Date.now(), title: name, story: clone(S) };
    if (existing >= 0) drafts[existing] = rec; else drafts.unshift(rec);
    if (drafts.length > 16) drafts = drafts.slice(0, 16);
    setDrafts(drafts); renderDrafts(); flash($('wr-save'), 'saved ✓');
  };
  function renderDrafts(){
    var wrap = $('wr-draft-list'); wrap.innerHTML = '';
    var drafts = getDrafts();
    if (!drafts.length) { wrap.appendChild(el('div', 'wr-muted', 'No drafts yet — write something and hit “Save draft.”')); return; }
    drafts.forEach(function (d) {
      var card = el('div', 'wr-draft');
      var done = (d.story.beats || []).filter(function (b) { return b.x && b.x.trim(); }).length;
      card.appendChild(el('div', 'wr-draft-meta',
        '<b>' + esc(d.title) + '</b><small>' + esc(d.story.method) + ' · ' + done + ' beats</small>'));
      var acts = el('div', 'wr-draft-acts');
      var open = el('button', 'wr-icon', 'open'); open.type='button';
      open.onclick = function(){ S = clone(d.story); syncMeta(); render(); window.scrollTo({ top: $('wr-editor').offsetTop - 20, behavior: 'smooth' }); };
      var del = el('button', 'wr-icon wr-icon-del', 'delete'); del.type='button';
      del.onclick = function(){ var arr = getDrafts().filter(function (x) { return x.id !== d.id; }); setDrafts(arr); renderDrafts(); };
      acts.appendChild(open); acts.appendChild(del);
      card.appendChild(acts);
      wrap.appendChild(card);
    });
  }

  // ============================================================
  //  PUBLISH / SHARE / IMPORT  (URL-encoded — no backend)
  // ============================================================
  function pack(s){
    var o = { v:1, ti:s.title, lo:s.logline, au:s.author, me:s.method,
      b: s.beats.map(function (b) { return { x:b.x, s:b.s, a:b.a, vo:b.vo, c:b.c }; }) };
    return b64urlEnc(JSON.stringify(o));
  }
  function unpack(str){
    var o = JSON.parse(b64urlDec(str));
    return { v:1, title:o.ti||'', logline:o.lo||'', author:o.au||'', method:o.me||'free',
      beats: (o.b||[]).map(function (b) { return { x:b.x||'', s:b.s||'WIDE', a:b.a||'', vo:b.vo||'', c:b.c||'THEREFORE' }; }) };
  }
  function b64urlEnc(str){ return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
  function b64urlDec(str){ str = str.replace(/-/g,'+').replace(/_/g,'/'); while (str.length % 4) str += '='; return decodeURIComponent(escape(atob(str))); }

  function copy(text, cb){
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(cb).catch(function(){ legacyCopy(text); cb && cb(); }); }
    else { legacyCopy(text); cb && cb(); }
  }
  function legacyCopy(text){ var ta = el('textarea'); ta.value = text; ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); }
  function flash(btn, msg){ var t = btn.textContent; btn.textContent = msg; setTimeout(function(){ btn.textContent = t; }, 1400); }

  $('wr-publish').onclick = function(){
    var code = pack(S);
    var url = location.origin + location.pathname + '#s=' + code;
    var box = $('wr-share'); box.hidden = false;
    var inp = $('wr-share-link'); inp.value = url; inp.focus(); inp.select();
    copy(url, function(){ var f = $('wr-share-flash'); f.classList.add('show'); setTimeout(function(){ f.classList.remove('show'); }, 1600); });
  };
  $('wr-copycode').onclick = function(){ copy(pack(S), function(){ flash($('wr-copycode'), 'copied ✓'); }); };
  $('wr-import').onclick = function(){
    var code = prompt('Paste a story code (or a published link):');
    if (!code) return;
    var m = code.match(/#s=([^&]+)/); if (m) code = m[1];
    try { S = unpack(code.trim()); syncMeta(); render(); flash($('wr-import'), 'loaded ✓'); }
    catch (e) { alert('That code could not be read.'); }
  };

  // ---- example loaders ----
  var EXAMPLES = {
    pilot: { v:1, title:'Fell From the Sky', author:'McPuppy Studios', method:'harmon',
      logline:'A castaway pup who teaches herself chess must cross the sea to a city that may not want her.',
      beats: [
        { x:'Princess lives a small, warm life in Checker Town with the man who raised her.', s:'ESTABLISH', a:'🌅', vo:'', c:'THEREFORE' },
        { x:'She is haunted by where she came from, and dreams of Chess City across the sea.', s:'CLOSE', a:'🌌', vo:'There has to be more than this dust.', c:'THEREFORE' },
        { x:'She discovers chess — the board cracks her ordinary world wide open.', s:'INSERT', a:'♞', vo:'', c:'THEREFORE' },
        { x:'She trains, hustles games, and learns Checker Town is too small to hold her.', s:'MEDIUM', a:'♟', vo:'', c:'THEREFORE' },
        { x:'She earns real passage toward Chess City.', s:'WIDE', a:'🗺️', vo:'', c:'THEREFORE' },
        { x:'Crossing the sea costs her safety — and the man who raised her has to let her go.', s:'OTS', a:'🌊', vo:'Go on. I’ll be alright.', c:'BUT' },
        { x:'She reaches Chess City — but it is not the haven she imagined.', s:'WIDE', a:'🏙️', vo:'', c:'BUT' },
        { x:'She is no longer a town dog dreaming of the sky; she is a player who chose her board.', s:'CLOSE', a:'♛', vo:'There. That’s where we’re going.', c:'THEREFORE' }
      ] },
    louie: { v:1, title:'Auston’s Fuse', author:'McPuppy Studios', method:'parker',
      logline:'A festival prank lights a fuse only a chess move can stop.',
      beats: [
        { x:'Auston the Bomber rigs the town fireworks to launch over the festival.', s:'WIDE', a:'🎆', vo:'', c:'THEREFORE' },
        { x:'A stray spark drops into the old checker-dust mine.', s:'INSERT', a:'⚡', vo:'', c:'BUT' },
        { x:'Princess has to clear the board-path before the fuse reaches the powder.', s:'MEDIUM', a:'♟', vo:'', c:'THEREFORE' },
        { x:'The only safe line means sacrificing the one piece that was winning the game.', s:'CLOSE', a:'♛', vo:'Sometimes you protect what matters most.', c:'BUT' },
        { x:'She makes the sacrifice — the mine stays dark, and the town never knows how close it came.', s:'WIDE', a:'🌙', vo:'', c:'THEREFORE' }
      ] }
  };
  $('wr-example-btn').onclick = function(){ var m = $('wr-example-menu'); m.hidden = !m.hidden; };
  document.addEventListener('click', function (e) { if (!e.target.closest('.wr-example-wrap')) $('wr-example-menu').hidden = true; });
  Array.prototype.forEach.call($('wr-example-menu').querySelectorAll('button'), function (b) {
    b.onclick = function(){ S = clone(EXAMPLES[b.dataset.ex]); syncMeta(); render(); $('wr-example-menu').hidden = true; };
  });

  // ============================================================
  //  READ VIEW (published link)
  // ============================================================
  function renderRead(story){
    var read = $('wr-read'); read.hidden = false; $('wr-editor').style.display = 'none';
    var methodName = story.method === 'harmon' ? 'Harmon Story Circle' : (story.method === 'parker' ? 'Parker but/therefore' : 'Freeform');
    var panels = story.beats.map(function (b, i) {
      var stage = (story.method === 'harmon' && HARMON[i]) ? HARMON[i][0].toUpperCase() + ' · ' : '';
      var conn = (story.method === 'parker' && i > 0) ? '<div class="wr-rd-conn ' + (b.c === 'BUT' ? 'is-but' : 'is-therefore') + '">' + (b.c === 'BUT' ? 'BUT' : 'THEREFORE') + '</div>' : '';
      return conn + '<div class="wr-rd-panel">' +
        '<div class="wr-rd-art">' + esc(b.a || '🎬') + '</div>' +
        '<div class="wr-rd-body"><div class="wr-rd-slug">' + esc(stage) + 'PANEL ' + (i+1) + ' · <span>' + esc(b.s || 'WIDE') + '</span></div>' +
        '<div class="wr-rd-act">' + esc(b.x || '') + '</div>' +
        (b.vo ? '<div class="wr-rd-vo">“' + esc(b.vo) + '”</div>' : '') + '</div></div>';
    }).join('');
    read.innerHTML =
      '<div class="wr-rd-tag">◈ Published reel · ' + esc(methodName) + '</div>' +
      '<h2 class="wr-rd-title">' + esc(story.title || 'Untitled') + '</h2>' +
      (story.author ? '<div class="wr-rd-author">by ' + esc(story.author) + '</div>' : '') +
      (story.logline ? '<p class="wr-rd-logline">' + esc(story.logline) + '</p>' : '') +
      '<div class="wr-rd-panels">' + panels + '</div>' +
      '<div class="wr-rd-actions">' +
        '<button class="wr-btn wr-pub" id="wr-rd-remix" type="button">✎ Remix in the Room</button> ' +
        '<a class="wr-btn" href="' + location.pathname + '">＋ Write your own</a>' +
      '</div>';
    $('wr-rd-remix').onclick = function(){
      S = clone(story); read.hidden = true; $('wr-editor').style.display = '';
      if (history.replaceState) history.replaceState(null, '', location.pathname);
      syncMeta(); render();
      window.scrollTo({ top: $('wr-editor').offsetTop - 20, behavior: 'smooth' });
    };
  }

  // ============================================================
  //  INIT
  // ============================================================
  syncMeta();
  render();
  renderDrafts();

  var hash = location.hash.match(/#s=([^&]+)/);
  if (hash) { try { renderRead(unpack(hash[1])); } catch (e) { /* bad link — just show editor */ } }
})();
</script>

<style>
.wr-intro { max-width: 760px; margin-bottom: 14px; }
.wr-kicker { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: #ff8fd0; }
.wr-sub { color: #c9a7ff; line-height: 1.6; }
.wr-muted { color: #7d6bb0; font-size: 0.86em; }
.wr-ok { color: #6bffb8; }
.wr-h3 { color: #F5C518; margin: 22px 0 8px; font-size: 1.05rem; }
.wr-note-soon { color: #ff8fd0; }

.wr-schools { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
@media (max-width: 640px){ .wr-schools { grid-template-columns: 1fr; } }
.wr-school { background: rgba(45,27,105,0.4); border: 1px solid #3a2a6a; border-radius: 12px; padding: 14px 16px; }
.wr-school-name { color: #F5C518; font-weight: 800; margin-bottom: 6px; }
.wr-school p { color: #cfc3ee; font-size: 0.9rem; line-height: 1.55; margin: 0 0 6px; }
.wr-school b { color: #ffd36b; }

.wr-editor { background: rgba(20,12,45,0.5); border: 1px solid #3a2a6a; border-radius: 14px; padding: 14px; }
.wr-meta { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.wr-meta-row { display: flex; gap: 8px; flex-wrap: wrap; }
.wr-in { background: #1a1030; border: 1px solid #4a2f8a; border-radius: 8px; color: #f0e6ff; padding: 9px 11px; font-family: inherit; font-size: 0.9rem; }
.wr-in:focus { outline: none; border-color: #F5C518; }
.wr-title { flex: 1; min-width: 200px; font-weight: 700; }
.wr-method { flex: 0 0 auto; cursor: pointer; }
.wr-logline { flex: 1; min-width: 220px; }
.wr-author { width: 160px; flex: 0 0 auto; }

.wr-toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.wr-btn { background: #221444; border: 1px solid #4a2f8a; color: #c9a7ff; border-radius: 8px; padding: 8px 14px; font-family: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.12s; text-decoration: none; display: inline-block; }
.wr-btn:hover { border-color: #F5C518; color: #fff; }
.wr-pub { background: #F5C518; color: #1a0f3d; border-color: #F5C518; }
.wr-pub:hover { background: #ffd740; color: #1a0f3d; }
.wr-example-wrap { position: relative; }
.wr-example-menu { position: absolute; top: 110%; left: 0; z-index: 5; background: #1a1030; border: 1px solid #4a2f8a; border-radius: 10px; padding: 6px; min-width: 220px; display: flex; flex-direction: column; gap: 4px; }
.wr-example-menu button { background: transparent; border: none; color: #cfc3ee; text-align: left; padding: 8px 10px; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 0.85rem; }
.wr-example-menu button:hover { background: #2D1B69; color: #F5C518; }

.wr-harmon { display: grid; grid-template-columns: 240px 1fr; gap: 16px; align-items: start; }
@media (max-width: 720px){ .wr-harmon { grid-template-columns: 1fr; } }
.wr-circle-wrap { position: sticky; top: 12px; text-align: center; }
.wr-circle { width: 100%; max-width: 240px; }
.wr-c-ring { fill: none; stroke: #4a2f8a; stroke-width: 2; }
.wr-c-div { stroke: #3a2a6a; stroke-width: 1; stroke-dasharray: 4 4; }
.wr-c-node circle { fill: #1a1030; stroke: #4a2f8a; stroke-width: 2; transition: all 0.2s; }
.wr-c-node text { fill: #7d6bb0; font-size: 12px; font-weight: 800; text-anchor: middle; dominant-baseline: middle; font-family: 'Courier New', monospace; }
.wr-c-node .wr-c-lbl { fill: #6a5a98; font-size: 8px; font-weight: 700; }
.wr-c-node.is-filled circle { fill: #F5C518; stroke: #ffe27a; }
.wr-c-node.is-filled text { fill: #1a0f3d; }
.wr-c-node.is-filled .wr-c-lbl { fill: #c9a7ff; }
.wr-circle-hint { font-size: 0.62rem; color: #6a5a98; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 6px; line-height: 1.5; }
.wr-circle-hint span { color: #4a3a78; }

.wr-harmon-beats, .wr-list-beats { display: flex; flex-direction: column; gap: 10px; }
.wr-beat { background: rgba(45,27,105,0.45); border: 1px solid #3a2a6a; border-radius: 10px; padding: 10px 12px; }
.wr-beat-head { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; flex-wrap: wrap; }
.wr-beat-num { width: 22px; height: 22px; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; background: #2D1B69; border: 1px solid #6b5fa0; border-radius: 999px; color: #c9a7ff; font-size: 0.74rem; font-weight: 800; font-family: 'Courier New', monospace; }
.wr-beat-stage { color: #F5C518; font-size: 0.92rem; }
.wr-beat-prompt { color: #8a78ba; font-size: 0.78rem; font-style: italic; }
.wr-beat-tools { margin-left: auto; display: flex; gap: 4px; }
.wr-ta { width: 100%; background: #1a1030; border: 1px solid #4a2f8a; border-radius: 8px; color: #f0e6ff; padding: 8px 10px; font-family: inherit; font-size: 0.88rem; resize: vertical; line-height: 1.45; }
.wr-ta:focus { outline: none; border-color: #F5C518; }
.wr-panel { display: flex; gap: 6px; margin-top: 7px; flex-wrap: wrap; }
.wr-mini { background: #160c2c; border: 1px solid #3a2a6a; border-radius: 7px; color: #cfc3ee; padding: 6px 8px; font-family: inherit; font-size: 0.8rem; }
.wr-mini:focus { outline: none; border-color: #F5C518; }
.wr-artin { width: 52px; text-align: center; font-size: 1rem; }
.wr-shot { flex: 0 0 auto; cursor: pointer; }
.wr-voin { flex: 1; min-width: 140px; }
.wr-icon { background: #221444; border: 1px solid #4a2f8a; color: #9a7fd4; border-radius: 6px; padding: 3px 7px; font-size: 0.74rem; cursor: pointer; font-family: inherit; }
.wr-icon:hover:not(:disabled) { border-color: #F5C518; color: #fff; }
.wr-icon:disabled { opacity: 0.35; cursor: default; }
.wr-icon-del:hover:not(:disabled) { border-color: #ff5b6e; color: #ff5b6e; }
.wr-add { margin-top: 10px; }

.wr-conn { display: flex; align-items: center; padding-left: 30px; }
.wr-conn-plain { color: #6a5a98; font-style: italic; font-size: 0.8rem; }
.wr-conn-btn { border: 1px solid; border-radius: 999px; padding: 2px 12px; font-family: 'Courier New', monospace; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.08em; cursor: pointer; background: transparent; }
.wr-conn-btn.is-therefore { color: #6bffb8; border-color: #2f6f55; }
.wr-conn-btn.is-but { color: #ff8fd0; border-color: #7a3a60; }
.wr-conn-btn:hover { filter: brightness(1.25); }

.wr-feedback { margin-top: 12px; display: flex; flex-direction: column; gap: 5px; }
.wr-fb-line { font-size: 0.86rem; color: #c9a7ff; background: rgba(45,27,105,0.4); border: 1px solid #3a2a6a; border-radius: 8px; padding: 7px 11px; }
.wr-fb-line b { color: #f0e6ff; }
.wr-fb-line.wr-warn { color: #ffd36b; border-color: #6a4a1a; background: rgba(245,197,24,0.07); }
.wr-fb-line.wr-ok { color: #6bffb8; border-color: #2f6f55; }

/* preview player */
.wr-stage { margin-top: 18px; }
.wr-screen { position: relative; }
.wr-frame { position: relative; aspect-ratio: 16 / 9; max-width: 560px; margin: 0 auto; border-radius: 10px; overflow: hidden; border: 1px solid #4a2f8a; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg,#161033,#2d1b69); }
.wr-frame::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(120% 80% at 50% 32%, transparent 52%, rgba(0,0,0,0.5) 100%); }
.wr-thirds { position: absolute; inset: 0; pointer-events: none; opacity: 0.15; background-image: linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px); background-size: 33.333% 33.333%; background-position: center; }
.wr-art { font-size: clamp(48px, 13vw, 104px); filter: drop-shadow(0 6px 14px rgba(0,0,0,0.5)); z-index: 1; animation: wr-pop 0.5s ease; }
@keyframes wr-pop { from { transform: scale(0.86); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.wr-slate { position: absolute; top: 8px; left: 10px; z-index: 2; display: flex; gap: 8px; align-items: center; font-family: 'Courier New', monospace; font-size: 0.68rem; letter-spacing: 0.06em; color: #ffe9b0; background: rgba(0,0,0,0.45); padding: 3px 8px; border-radius: 6px; }
.wr-comp { color: #1a0f3d; background: #F5C518; border-radius: 4px; padding: 0 6px; font-weight: 800; }
.wr-vo { position: absolute; left: 10px; right: 10px; bottom: 10px; z-index: 2; text-align: center; background: rgba(0,0,0,0.55); color: #f0e6ff; font-size: 0.84rem; line-height: 1.4; padding: 6px 10px; border-radius: 8px; opacity: 0; transition: opacity 0.3s; }
.wr-vo.show { opacity: 1; }
.wr-vo-act { color: #cfc3ee; font-style: italic; }
.wr-progress { height: 5px; max-width: 560px; margin: 8px auto 0; background: rgba(157,127,212,0.18); border-radius: 999px; overflow: hidden; }
.wr-progress i { display: block; height: 100%; width: 0; background: linear-gradient(90deg,#6b5fa0,#F5C518); border-radius: 999px; }
.wr-transport { display: flex; align-items: center; gap: 8px; margin: 10px auto 0; max-width: 560px; }
.wr-tbtn { background: #221444; border: 1px solid #4a2f8a; color: #c9a7ff; border-radius: 8px; width: 40px; height: 34px; font-size: 1rem; cursor: pointer; font-family: inherit; transition: all 0.12s; }
.wr-tbtn:hover { border-color: #F5C518; color: #fff; }
.wr-play { background: #F5C518; color: #1a0f3d; border-color: #F5C518; font-weight: 800; }
.wr-play.on { background: #ff8fd0; border-color: #ff8fd0; }
.wr-count { font-family: 'Courier New', monospace; font-size: 0.78rem; color: #9a7fd4; }
.wr-mute { margin-left: auto; }
.wr-mute.muted { opacity: 0.45; text-decoration: line-through; }

.wr-publish { display: flex; gap: 8px; flex-wrap: wrap; }
.wr-share { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.wr-share .wr-in { flex: 1; min-width: 200px; font-size: 0.78rem; color: #9fe8ff; }
.wr-share-flash { color: #6bffb8; font-size: 0.82rem; opacity: 0; transition: opacity 0.2s; }
.wr-share-flash.show { opacity: 1; }

.wr-drafts { margin-top: 20px; }
.wr-draft-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.wr-draft { display: flex; justify-content: space-between; align-items: center; gap: 8px; background: rgba(45,27,105,0.45); border: 1px solid #3a2a6a; border-radius: 10px; padding: 10px 12px; }
.wr-draft-meta b { color: #f0e6ff; display: block; font-size: 0.88rem; }
.wr-draft-meta small { color: #8a78ba; font-size: 0.72rem; }
.wr-draft-acts { display: flex; gap: 4px; flex: 0 0 auto; }

/* read view */
.wr-read { background: rgba(20,12,45,0.5); border: 1px solid #4a2f8a; border-radius: 14px; padding: 18px 18px 16px; }
.wr-rd-tag { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.1em; color: #ff8fd0; text-transform: uppercase; }
.wr-rd-title { color: #F5C518; margin: 6px 0 2px; }
.wr-rd-author { color: #9fe8ff; font-size: 0.86rem; margin-bottom: 8px; }
.wr-rd-logline { color: #cfc3ee; font-style: italic; max-width: 620px; margin-bottom: 14px; }
.wr-rd-panels { display: flex; flex-direction: column; gap: 8px; }
.wr-rd-conn { align-self: flex-start; margin-left: 22px; font-family: 'Courier New', monospace; font-weight: 800; font-size: 0.7rem; letter-spacing: 0.08em; padding: 1px 10px; border: 1px solid; border-radius: 999px; }
.wr-rd-conn.is-therefore { color: #6bffb8; border-color: #2f6f55; }
.wr-rd-conn.is-but { color: #ff8fd0; border-color: #7a3a60; }
.wr-rd-panel { display: flex; gap: 12px; align-items: center; background: rgba(45,27,105,0.45); border: 1px solid #3a2a6a; border-radius: 10px; padding: 10px 12px; }
.wr-rd-art { font-size: 38px; flex: 0 0 auto; width: 50px; text-align: center; }
.wr-rd-slug { font-family: 'Courier New', monospace; font-size: 0.68rem; color: #ffd36b; letter-spacing: 0.05em; }
.wr-rd-slug span { color: #1a0f3d; background: #F5C518; border-radius: 4px; padding: 0 5px; font-weight: 800; }
.wr-rd-act { color: #f0e6ff; font-size: 0.92rem; margin: 3px 0; }
.wr-rd-vo { color: #c9a7ff; font-size: 0.85rem; font-style: italic; }
.wr-rd-actions { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
</style>
