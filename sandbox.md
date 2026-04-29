---
layout: default
title: COMMAND CENTER
permalink: /sandbox/
---

<div class="cmd-wrap">

  <!-- ── HEADER ─────────────────────────────────────────── -->
  <header class="cmd-header">
    <div class="cmd-header-left">
      <div class="cmd-title">◈ PJCC COMMAND CENTER</div>
      <div class="cmd-sub">CLASSIFIED ACCESS &mdash; OPERATIVE NGREEN37</div>
    </div>
    <div class="cmd-header-right">
      <div class="cmd-signal-meter">
        <span class="cmd-signal-label">SIG</span>
        <span class="cmd-sig-bar" style="height:7px"></span>
        <span class="cmd-sig-bar" style="height:11px"></span>
        <span class="cmd-sig-bar" style="height:16px"></span>
        <span class="cmd-sig-bar" style="height:21px"></span>
      </div>
      <div id="cmd-clock" class="cmd-clock">--:--:-- UTC</div>
    </div>
  </header>

  <!-- ── GRID ───────────────────────────────────────────── -->
  <div class="cmd-grid">

    <!-- ┌─ MODULE: LIVE CONSOLE (full width) ─────────────── -->
    <div class="cmd-module cmd-module--wide">
      <div class="cmd-module-label">&#9672; LIVE TRANSMISSION LOG</div>
      <div class="console-outer">
        <div id="console-feed" class="console-feed"></div>
        <span class="console-cursor" id="console-cursor">&#9608;</span>
      </div>
    </div>

    <!-- ┌─ MODULE: PIECE CONSTELLATION ───────────────────── -->
    <div class="cmd-module cmd-module--constellation">
      <div class="cmd-module-label">&#9672; TACTICAL PIECE CONSTELLATION &mdash; 16 NODES ACTIVE</div>
      <div class="constellation-wrap-cmd">
        <svg class="cmd-constellation-svg" viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" aria-label="Chess piece constellation map">

          <!-- Background -->
          <rect width="400" height="280" fill="#080610"/>

          <!-- Ambient background stars -->
          <circle cx="30"  cy="22"  r="1"   fill="#4a3870" fill-opacity="0.6"/>
          <circle cx="80"  cy="14"  r="1.5" fill="#c4b5fd" fill-opacity="0.32"/>
          <circle cx="350" cy="27"  r="1"   fill="#4a3870" fill-opacity="0.5"/>
          <circle cx="382" cy="44"  r="1.5" fill="#9b87c0" fill-opacity="0.28"/>
          <circle cx="15"  cy="82"  r="1"   fill="#4a3870" fill-opacity="0.42"/>
          <circle cx="392" cy="112" r="1.5" fill="#4a3870" fill-opacity="0.5"/>
          <circle cx="362" cy="164" r="1"   fill="#c4b5fd" fill-opacity="0.28"/>
          <circle cx="377" cy="228" r="1.5" fill="#4a3870" fill-opacity="0.44"/>
          <circle cx="342" cy="268" r="1"   fill="#9b87c0" fill-opacity="0.33"/>
          <circle cx="282" cy="276" r="1.5" fill="#4a3870" fill-opacity="0.38"/>
          <circle cx="120" cy="278" r="1"   fill="#4a3870" fill-opacity="0.5"/>
          <circle cx="58"  cy="252" r="1.5" fill="#c4b5fd" fill-opacity="0.28"/>
          <circle cx="18"  cy="182" r="1"   fill="#4a3870" fill-opacity="0.44"/>
          <circle cx="9"   cy="132" r="1.5" fill="#9b87c0" fill-opacity="0.28"/>
          <circle cx="44"  cy="50"  r="1"   fill="#4a3870" fill-opacity="0.38"/>
          <circle cx="200" cy="8"   r="1"   fill="#c4b5fd" fill-opacity="0.28"/>
          <circle cx="242" cy="18"  r="1.5" fill="#4a3870" fill-opacity="0.48"/>
          <circle cx="322" cy="15"  r="1"   fill="#9b87c0" fill-opacity="0.32"/>
          <circle cx="168" cy="140" r="1"   fill="#2d2060" fill-opacity="0.8"/>
          <circle cx="232" cy="140" r="1"   fill="#2d2060" fill-opacity="0.8"/>

          <!-- ── CONSTELLATION LINES — Black pieces ─────── -->
          <g stroke="#2d2060" stroke-width="0.6" fill="none">
            <line x1="200" y1="55"  x2="158" y2="44"/>
            <line x1="158" y1="44"  x2="90"  y2="68"/>
            <line x1="200" y1="55"  x2="312" y2="68"/>
            <line x1="158" y1="44"  x2="124" y2="90"/>
            <line x1="200" y1="55"  x2="276" y2="90"/>
            <line x1="124" y1="90"  x2="64"  y2="106"/>
            <line x1="276" y1="90"  x2="336" y2="106"/>
            <line x1="90"  y1="68"  x2="64"  y2="106"/>
            <line x1="312" y1="68"  x2="336" y2="106"/>
          </g>

          <!-- ── CONSTELLATION LINES — White pieces ─────── -->
          <g stroke="#2d2060" stroke-width="0.6" fill="none">
            <line x1="200" y1="224" x2="242" y2="234"/>
            <line x1="242" y1="234" x2="90"  y2="210"/>
            <line x1="200" y1="224" x2="312" y2="210"/>
            <line x1="242" y1="234" x2="124" y2="190"/>
            <line x1="200" y1="224" x2="276" y2="190"/>
            <line x1="124" y1="190" x2="64"  y2="174"/>
            <line x1="276" y1="190" x2="336" y2="174"/>
            <line x1="90"  y1="210" x2="64"  y2="174"/>
            <line x1="312" y1="210" x2="336" y2="174"/>
          </g>

          <!-- ── AXIS OF OPPOSITION ─────────────────────── -->
          <line x1="200" y1="55" x2="200" y2="224" stroke="#5B2D8E" stroke-width="0.4" stroke-dasharray="4 6" fill="none" opacity="0.55"/>

          <!-- ── BLACK PIECES ────────────────────────────── -->
          <!-- ♚ King -->
          <g>
            <circle cx="200" cy="55" r="9"   fill="#a78bfa" fill-opacity="0.18" class="cmd-h-a"/>
            <circle cx="200" cy="55" r="4.5" fill="#a78bfa"                     class="cmd-c-a"/>
            <text   x="200"  y="42"  text-anchor="middle" font-size="13" fill="#c4b5fd" font-family="serif" class="cmd-c-a">&#9818;</text>
          </g>
          <!-- ♛ Queen -->
          <g>
            <circle cx="158" cy="44" r="10"  fill="#a78bfa" fill-opacity="0.16" class="cmd-h-b"/>
            <circle cx="158" cy="44" r="5.5" fill="#a78bfa"                     class="cmd-c-b"/>
            <text   x="158"  y="30"  text-anchor="middle" font-size="15" fill="#c4b5fd" font-family="serif" class="cmd-c-b">&#9819;</text>
          </g>
          <!-- ♜ Rooks -->
          <g>
            <circle cx="90"  cy="68" r="7"   fill="#9b87c0" fill-opacity="0.18" class="cmd-h-c"/>
            <circle cx="90"  cy="68" r="3.5" fill="#9b87c0"                     class="cmd-c-c"/>
            <text   x="90"   y="58"  text-anchor="middle" font-size="10" fill="#c4b5fd" font-family="serif" class="cmd-c-c">&#9820;</text>
          </g>
          <g>
            <circle cx="312" cy="68" r="7"   fill="#9b87c0" fill-opacity="0.18" class="cmd-h-d"/>
            <circle cx="312" cy="68" r="3.5" fill="#9b87c0"                     class="cmd-c-d"/>
            <text   x="312"  y="58"  text-anchor="middle" font-size="10" fill="#c4b5fd" font-family="serif" class="cmd-c-d">&#9820;</text>
          </g>
          <!-- ♝ Bishops -->
          <g>
            <circle cx="124" cy="90" r="6"   fill="#6b5a8e" fill-opacity="0.22" class="cmd-h-e"/>
            <circle cx="124" cy="90" r="3"   fill="#6b5a8e"                     class="cmd-c-e"/>
            <text   x="124"  y="82"  text-anchor="middle" font-size="9"  fill="#9b87c0" font-family="serif" class="cmd-c-e">&#9821;</text>
          </g>
          <g>
            <circle cx="276" cy="90" r="6"   fill="#6b5a8e" fill-opacity="0.22" class="cmd-h-a"/>
            <circle cx="276" cy="90" r="3"   fill="#6b5a8e"                     class="cmd-c-a"/>
            <text   x="276"  y="82"  text-anchor="middle" font-size="9"  fill="#9b87c0" font-family="serif" class="cmd-c-a">&#9821;</text>
          </g>
          <!-- ♞ Knights -->
          <g>
            <circle cx="64"  cy="106" r="5"   fill="#4a3870" fill-opacity="0.28" class="cmd-h-b"/>
            <circle cx="64"  cy="106" r="2.5" fill="#4a3870"                     class="cmd-c-b"/>
            <text   x="64"   y="98"   text-anchor="middle" font-size="9"  fill="#6b5a8e" font-family="serif" class="cmd-c-b">&#9822;</text>
          </g>
          <g>
            <circle cx="336" cy="106" r="5"   fill="#4a3870" fill-opacity="0.28" class="cmd-h-c"/>
            <circle cx="336" cy="106" r="2.5" fill="#4a3870"                     class="cmd-c-c"/>
            <text   x="336"  y="98"   text-anchor="middle" font-size="9"  fill="#6b5a8e" font-family="serif" class="cmd-c-c">&#9822;</text>
          </g>

          <!-- ── WHITE PIECES ────────────────────────────── -->
          <!-- ♔ King -->
          <g>
            <circle cx="200" cy="224" r="9"   fill="#F5C518" fill-opacity="0.18" class="cmd-h-d"/>
            <circle cx="200" cy="224" r="4.5" fill="#F5C518"                     class="cmd-c-d"/>
            <text   x="200"  y="211"  text-anchor="middle" font-size="13" fill="#FFE566" font-family="serif" class="cmd-c-d">&#9812;</text>
          </g>
          <!-- ♕ Queen -->
          <g>
            <circle cx="242" cy="234" r="10"  fill="#F5C518" fill-opacity="0.15" class="cmd-h-e"/>
            <circle cx="242" cy="234" r="5.5" fill="#F5C518"                     class="cmd-c-e"/>
            <text   x="242"  y="220"  text-anchor="middle" font-size="15" fill="#FFE566" font-family="serif" class="cmd-c-e">&#9813;</text>
          </g>
          <!-- ♖ Rooks -->
          <g>
            <circle cx="90"  cy="210" r="7"   fill="#FFE566" fill-opacity="0.13" class="cmd-h-a"/>
            <circle cx="90"  cy="210" r="3.5" fill="#FFE566"                     class="cmd-c-a"/>
            <text   x="90"   y="200"  text-anchor="middle" font-size="10" fill="#F5C518" font-family="serif" class="cmd-c-a">&#9814;</text>
          </g>
          <g>
            <circle cx="312" cy="210" r="7"   fill="#FFE566" fill-opacity="0.13" class="cmd-h-b"/>
            <circle cx="312" cy="210" r="3.5" fill="#FFE566"                     class="cmd-c-b"/>
            <text   x="312"  y="200"  text-anchor="middle" font-size="10" fill="#F5C518" font-family="serif" class="cmd-c-b">&#9814;</text>
          </g>
          <!-- ♗ Bishops -->
          <g>
            <circle cx="124" cy="190" r="6"   fill="#F5C518" fill-opacity="0.15" class="cmd-h-c"/>
            <circle cx="124" cy="190" r="3"   fill="#F5C518"                     class="cmd-c-c"/>
            <text   x="124"  y="182"  text-anchor="middle" font-size="9"  fill="#FFE566" font-family="serif" class="cmd-c-c">&#9815;</text>
          </g>
          <g>
            <circle cx="276" cy="190" r="6"   fill="#F5C518" fill-opacity="0.15" class="cmd-h-d"/>
            <circle cx="276" cy="190" r="3"   fill="#F5C518"                     class="cmd-c-d"/>
            <text   x="276"  y="182"  text-anchor="middle" font-size="9"  fill="#FFE566" font-family="serif" class="cmd-c-d">&#9815;</text>
          </g>
          <!-- ♘ Knights -->
          <g>
            <circle cx="64"  cy="174" r="5"   fill="#F5C518" fill-opacity="0.13" class="cmd-h-e"/>
            <circle cx="64"  cy="174" r="2.5" fill="#F5C518"                     class="cmd-c-e"/>
            <text   x="64"   y="166"  text-anchor="middle" font-size="9"  fill="#FFE566" font-family="serif" class="cmd-c-e">&#9816;</text>
          </g>
          <g>
            <circle cx="336" cy="174" r="5"   fill="#F5C518" fill-opacity="0.13" class="cmd-h-a"/>
            <circle cx="336" cy="174" r="2.5" fill="#F5C518"                     class="cmd-c-a"/>
            <text   x="336"  y="166"  text-anchor="middle" font-size="9"  fill="#FFE566" font-family="serif" class="cmd-c-a">&#9816;</text>
          </g>

          <!-- Sector labels -->
          <text x="200" y="147" text-anchor="middle" font-size="6" fill="#2d2060" font-family="Share Tech Mono, monospace" letter-spacing="2">AXIS OF OPPOSITION</text>
          <text x="22"  y="148" font-size="6" fill="#2D1B69" font-family="Share Tech Mono, monospace" letter-spacing="1">QUEENSIDE</text>
          <text x="316" y="148" font-size="6" fill="#2D1B69" font-family="Share Tech Mono, monospace" letter-spacing="1">KINGSIDE</text>
          <text x="148" y="275" font-size="6" fill="#2D1B69" font-family="Share Tech Mono, monospace" letter-spacing="1">WHITE SECTOR</text>
          <text x="155" y="14"  font-size="6" fill="#2d2060" font-family="Share Tech Mono, monospace" letter-spacing="1">BLACK SECTOR</text>
        </svg>
      </div>
    </div>

    <!-- ┌─ MODULE: OPERATIVE STATUS ──────────────────────── -->
    <div class="cmd-module">
      <div class="cmd-module-label">&#9672; OPERATIVE STATUS</div>
      <div class="op-rank-wrap">
        <div class="op-rank-piece" id="op-rank-piece">&#9823;</div>
        <div class="op-rank-name"  id="op-rank-name">PAWN</div>
        <div class="op-rank-desc"  id="op-rank-desc">Scanning for fragments...</div>
        <div class="op-rank-bar-wrap">
          <div class="op-rank-bar">
            <div class="op-rank-fill" id="op-rank-fill" style="width:0%"></div>
          </div>
        </div>
        <div class="op-rank-frags">
          <span id="op-frag-count">0</span> / 6 FRAGMENTS RECOVERED
        </div>
      </div>
    </div>

    <!-- ┌─ MODULE: MISSION COUNTDOWN ─────────────────────── -->
    <div class="cmd-module">
      <div class="cmd-module-label">&#9672; MISSION BRIEF &mdash; EP.01 RELEASE ETA</div>
      <div class="mission-countdown-wrap">
        <div class="mission-countdown-units">
          <div class="mcu-unit">
            <div class="mcu-num" id="mcd-days">---</div>
            <div class="mcu-label">DAYS</div>
          </div>
          <div class="mcu-sep">:</div>
          <div class="mcu-unit">
            <div class="mcu-num" id="mcd-hours">--</div>
            <div class="mcu-label">HRS</div>
          </div>
          <div class="mcu-sep">:</div>
          <div class="mcu-unit">
            <div class="mcu-num" id="mcd-mins">--</div>
            <div class="mcu-label">MIN</div>
          </div>
          <div class="mcu-sep">:</div>
          <div class="mcu-unit">
            <div class="mcu-num" id="mcd-secs">--</div>
            <div class="mcu-label">SEC</div>
          </div>
        </div>
        <div class="mission-target-label">TARGET: 2027.01.15 &mdash; EPISODE ONE PREMIERE</div>
      </div>
    </div>

    <!-- ┌─ MODULE: OPENING INTEL ─────────────────────────── -->
    <div class="cmd-module">
      <div class="cmd-module-label">&#9672; OPENING INTEL &mdash; TODAY</div>
      <div class="opening-wrap">
        <div class="ow-day-label" id="ow-day">---</div>
        <div class="ow-eco"        id="ow-eco">---</div>
        <div class="ow-name"       id="ow-name">Loading...</div>
        <div class="ow-moves-row">
          <span class="ow-moves-label">OPENING MOVES</span>
          <span class="ow-moves" id="ow-moves">---</span>
        </div>
        <div class="ow-tag-wrap">
          <span class="ow-tag" id="ow-tag">---</span>
        </div>
        <div class="ow-note" id="ow-note"></div>
      </div>
    </div>

    <!-- ┌─ MODULE: ASSET VALUES ──────────────────────────── -->
    <div class="cmd-module">
      <div class="cmd-module-label">&#9672; ASSET VALUES &mdash; PIECE HIERARCHY</div>
      <div class="av-table">
        <div class="av-row">
          <span class="av-piece">&#9823;</span>
          <span class="av-name">PAWN</span>
          <div class="av-bar-wrap"><div class="av-bar" style="width:11%"></div></div>
          <span class="av-val">1</span>
        </div>
        <div class="av-row">
          <span class="av-piece">&#9822;</span>
          <span class="av-name">KNIGHT</span>
          <div class="av-bar-wrap"><div class="av-bar" style="width:33%"></div></div>
          <span class="av-val">3</span>
        </div>
        <div class="av-row">
          <span class="av-piece">&#9821;</span>
          <span class="av-name">BISHOP</span>
          <div class="av-bar-wrap"><div class="av-bar" style="width:33%"></div></div>
          <span class="av-val">3</span>
        </div>
        <div class="av-row">
          <span class="av-piece">&#9820;</span>
          <span class="av-name">ROOK</span>
          <div class="av-bar-wrap"><div class="av-bar av-bar--rook" style="width:56%"></div></div>
          <span class="av-val">5</span>
        </div>
        <div class="av-row">
          <span class="av-piece">&#9819;</span>
          <span class="av-name">QUEEN</span>
          <div class="av-bar-wrap"><div class="av-bar av-bar--queen" style="width:100%"></div></div>
          <span class="av-val">9</span>
        </div>
        <div class="av-row av-row--king">
          <span class="av-piece">&#9818;</span>
          <span class="av-name">KING</span>
          <div class="av-bar-wrap"><div class="av-bar av-bar--king" style="width:100%"></div></div>
          <span class="av-val">&infin;</span>
        </div>
      </div>
    </div>

    <!-- ┌─ MODULE: FRAGMENT RECOVERY ─────────────────────── -->
    <div class="cmd-module">
      <div class="cmd-module-label">&#9672; FRAGMENT RECOVERY STATUS</div>
      <div id="frag-grid" class="frag-grid">
        <!-- populated by JS -->
      </div>
      <div class="frag-footer-note">Navigate the site to recover all fragments.</div>
    </div>

  </div><!-- /.cmd-grid -->

  <div class="cmd-footer-note">
    &#9672; CLASSIFIED &mdash; PJCC COMMAND CENTER &mdash; OPERATIVE ACCESS ONLY &mdash; ngreen37.github.io
  </div>

</div><!-- /.cmd-wrap -->

<script>
(function() {
  'use strict';

  /* ── CLOCK ───────────────────────────────────────── */
  var clockEl = document.getElementById('cmd-clock');
  function updateClock() {
    var n = new Date();
    var h = String(n.getUTCHours()).padStart(2,'0');
    var m = String(n.getUTCMinutes()).padStart(2,'0');
    var s = String(n.getUTCSeconds()).padStart(2,'0');
    if (clockEl) clockEl.textContent = h + ':' + m + ':' + s + ' UTC';
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ── CONSOLE FEED ────────────────────────────────── */
  var messages = [
    { t:'sys',  v:'[SYS ] ████████████████████████████████████████' },
    { t:'ok',   v:'[0000] PJCC COMMAND CENTER — ONLINE' },
    { t:'ok',   v:'[0001] SIGNAL ACQUISITION — COMPLETE' },
    { t:'ok',   v:'[0002] AUTHENTICATING... OPERATIVE NGREEN37 — CLEARED' },
    { t:'ok',   v:'[0003] WORLD STATE LOADING...' },
    { t:'ok',   v:'[0004] CHECKER TOWN — ♟ STATUS: STABLE' },
    { t:'ok',   v:'[0005] SAND MINES — ♟ ACTIVE EXTRACTION UNDERWAY' },
    { t:'ok',   v:'[0006] THE SEA — ♝ ROUTE B-7: NAVIGABLE' },
    { t:'ok',   v:'[0007] SHOGI ISLAND — ♞ MONITORING: ACTIVE' },
    { t:'warn', v:'[0008] CHESS CITY — ♛ STATUS: OCCUPIED — ACCESS RESTRICTED' },
    { t:'sys',  v:'[0009] MYSTERY CITY — ██████ — CLEARANCE REQUIRED' },
    { t:'ok',   v:'[0010] CHARACTER INDEX — 4 OPERATIVES CATALOGUED' },
    { t:'ok',   v:'[0011] PRINCESS — LAST FIELD LOG: CH.3 THE JOURNEY' },
    { t:'ok',   v:'[0012] FRAGMENT INDEX — SCANNING LOCAL CACHE...' },
    { t:'ok',   v:'[0013] WORLD MAP — PHASE 1 MAPPING: COMPLETE' },
    { t:'warn', v:'[0014] ARC STATUS — CH.7 THE TOURNAMENT — LOCKED' },
    { t:'ok',   v:'[0015] EPISODE 1 — STATUS: IN DEVELOPMENT' },
    { t:'ok',   v:'[0016] CHESS.COM FEED — NGREEN37 — CHANNEL OPEN' },
    { t:'sys',  v:'[0017] NOTICE: ALL TRANSMISSIONS ARE MONITORED' },
    { t:'sys',  v:'[0018] ████████████ REDACTED ████████████' },
    { t:'ok',   v:'[0019] SIGNAL STRENGTH — 94% — HOLDING STEADY' },
    { t:'sys',  v:'[0020] ARCHIVE ACCESS — DOUBLE QD5 SEQUENCE REQUIRED' },
    { t:'ok',   v:'[0021] PIECE CONSTELLATION — 16 NODES ACTIVE' },
    { t:'ok',   v:'[0022] DISPATCH CHANNEL — STANDING BY' },
    { t:'ok',   v:'[0023] MCPUPPY STUDIOS — SITE BUILD: ACTIVE' },
    { t:'sys',  v:'[0024] ████████████████████████████████████████' },
    { t:'ok',   v:'[0025] ALL SYSTEMS NOMINAL — AWAITING ORDERS' },
  ];

  var feed   = document.getElementById('console-feed');
  var cursor = document.getElementById('console-cursor');
  var idx    = 0;

  function addLine() {
    if (idx >= messages.length) {
      if (cursor) cursor.style.display = 'none';
      return;
    }
    var m   = messages[idx++];
    var div = document.createElement('div');
    div.className = 'console-line console-line--' + m.t;
    div.textContent = m.v;
    if (feed) {
      feed.appendChild(div);
      feed.scrollTop = feed.scrollHeight;
    }
    setTimeout(addLine, idx < 4 ? 280 : 420);
  }
  setTimeout(addLine, 700);

  /* ── OPERATIVE RANK ──────────────────────────────── */
  var fragKeys  = ['frag_classified','frag_archive','frag_dispatch','frag_404','frag_qd5','frag_konami'];
  var fragLabels = ['CLASSIFIED','ARCHIVE','DISPATCH','404','Qd5','KONAMI'];
  var found = [];
  try {
    fragKeys.forEach(function(k) { found.push(!!localStorage.getItem(k)); });
  } catch(e) { found = fragKeys.map(function(){ return false; }); }

  var score = found.filter(Boolean).length;
  var ranks = [
    { min:0, piece:'♟', name:'PAWN',        desc:'Unknown operative. No fragments recovered.',     color:'#9b87c0' },
    { min:1, piece:'♞', name:'KNIGHT',      desc:'First contact. Stay alert.',                    color:'#9b87c0' },
    { min:2, piece:'♝', name:'BISHOP',      desc:'Partial intel recovered. Continue searching.',  color:'#a78bfa' },
    { min:4, piece:'♜', name:'ROOK',        desc:'High-value operative. Significant discovery.',  color:'#c4b5fd' },
    { min:5, piece:'♛', name:'QUEEN',       desc:'Elite clearance. Near-complete discovery.',     color:'#FFE566' },
    { min:6, piece:'♚', name:'GRANDMASTER', desc:'Full clearance. All systems accessible.',       color:'#F5C518' },
  ];
  var rank = ranks[0];
  for (var r = 0; r < ranks.length; r++) {
    if (score >= ranks[r].min) rank = ranks[r];
  }
  var pct = Math.min(100, Math.round((score / 6) * 100));

  var pEl = document.getElementById('op-rank-piece');
  var nEl = document.getElementById('op-rank-name');
  var dEl = document.getElementById('op-rank-desc');
  var fEl = document.getElementById('op-rank-fill');
  var cEl = document.getElementById('op-frag-count');
  if (pEl) { pEl.textContent = rank.piece; pEl.style.color = rank.color; }
  if (nEl) { nEl.textContent = rank.name;  nEl.style.color = rank.color; }
  if (dEl) dEl.textContent = rank.desc;
  if (fEl) setTimeout(function(){ fEl.style.width = pct + '%'; }, 900);
  if (cEl) cEl.textContent = score;

  /* ── MISSION COUNTDOWN ───────────────────────────── */
  var target = new Date('2027-01-15T00:00:00Z').getTime();
  function pad(n,w){ return String(n).padStart(w,'0'); }
  function updateCountdown() {
    var diff = target - Date.now();
    if (diff <= 0) diff = 0;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000)  / 60000);
    var s = Math.floor((diff % 60000)    / 1000);
    var dEl = document.getElementById('mcd-days');
    var hEl = document.getElementById('mcd-hours');
    var mEl = document.getElementById('mcd-mins');
    var sEl = document.getElementById('mcd-secs');
    if (dEl) dEl.textContent = pad(d,3);
    if (hEl) hEl.textContent = pad(h,2);
    if (mEl) mEl.textContent = pad(m,2);
    if (sEl) sEl.textContent = pad(s,2);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ── OPENING INTEL ───────────────────────────────── */
  var days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  var openings = [
    { name:'Sicilian Defense',  eco:'B20–B99', moves:'1.e4 c5',                  tag:'SHARP',      note:'Most popular response to 1.e4. Dynamic, asymmetrical.' },
    { name:"Queen's Gambit",    eco:'D06–D69', moves:'1.d4 d5 2.c4',             tag:'SOLID',      note:'A classic. Fights for central control from move one.' },
    { name:'Ruy Lopez',         eco:'C60–C99', moves:'1.e4 e5 2.Nf3 Nc6 3.Bb5', tag:'CLASSIC',    note:'Named for a 16th-century Spanish priest. Timeless.' },
    { name:"King's Indian",     eco:'E60–E99', moves:'1.d4 Nf6 2.c4 g6',         tag:'DYNAMIC',    note:'Hypermodern. Black invites White to occupy the center.' },
    { name:'French Defense',    eco:'C00–C19', moves:'1.e4 e6',                  tag:'POSITIONAL', note:'Solid pawn structure. Black prepares ...d5 counterplay.' },
    { name:'Caro-Kann',         eco:'B10–B19', moves:'1.e4 c6',                  tag:'SOLID',      note:'Robust and reliable. Favored by positional players.' },
    { name:'English Opening',   eco:'A10–A39', moves:'1.c4',                     tag:'FLEXIBLE',   note:'A flank opening. White controls d5 without committing the d-pawn.' },
  ];
  var today = new Date().getDay();
  var op    = openings[today];
  var dayEl  = document.getElementById('ow-day');
  var ecoEl  = document.getElementById('ow-eco');
  var nameEl = document.getElementById('ow-name');
  var movEl  = document.getElementById('ow-moves');
  var tagEl  = document.getElementById('ow-tag');
  var noteEl = document.getElementById('ow-note');
  if (dayEl)  dayEl.textContent  = days[today];
  if (ecoEl)  ecoEl.textContent  = op.eco;
  if (nameEl) nameEl.textContent = op.name;
  if (movEl)  movEl.textContent  = op.moves;
  if (tagEl)  tagEl.textContent  = op.tag;
  if (noteEl) noteEl.textContent = op.note;

  /* ── FRAGMENT GRID ───────────────────────────────── */
  var grid = document.getElementById('frag-grid');
  if (grid) {
    var html = '';
    fragKeys.forEach(function(k, i) {
      var isFound = found[i];
      html += '<div class="frag-slot' + (isFound ? ' frag-slot--found' : '') + '">' +
        '<div class="frag-slot-id">'     + fragLabels[i] + '</div>' +
        '<div class="frag-slot-status">' + (isFound ? '✓' : '░░') + '</div>' +
      '</div>';
    });
    grid.innerHTML = html;
  }

})();
</script>
