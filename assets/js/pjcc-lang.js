/* =============================================================================
 * PJCC language toggle (EN / 日本語) — WHOLE-SITE, NO-LIMIT edition
 * -----------------------------------------------------------------------------
 * Goal (Nate): the 日本語 toggle translates the ENTIRE site with NO character
 * limit (long paragraphs included) and keeps up with ALL updates automatically.
 *
 * How it works — three layers:
 *   1. Curated dictionary (DICT): brand + nav terms. Instant, perfect, offline.
 *   2. Machine translation, UNLIMITED LENGTH: any other English text is split into
 *      sentence-sized chunks, translated, and rejoined — so there is no per-string
 *      cap. Primary engine is Google's keyless endpoint (handles long text);
 *      MyMemory is an automatic fallback. Every result is cached in localStorage,
 *      so repeat strings/visits are instant and the API is barely touched.
 *   3. A MutationObserver re-translates anything rendered later (Dossier, boards,
 *      game cards, toasts) the moment it appears — "auto-updating always".
 *
 * Uncapped: there is no MAX-per-pass limit; every visible English string is queued
 * (concurrency-limited so we never hammer the endpoint). Fail-safe: if an endpoint
 * is down, those bits simply stay English — nothing breaks.
 * Protected: code, inputs, the operative pill + codenames, the Shogi sigil, the
 * in-world ticker, the walker, and anything [data-no-translate] / .notranslate.
 *
 * UPGRADE PATH (for total reliability): point PROVIDERS at your own Cloudflare
 * Worker proxying DeepL / Google Cloud Translate — everything else stays the same.
 * ========================================================================== */
(function () {
  'use strict';

  var KEY = 'pjcc.lang';
  var CACHE_KEY = 'pjcc.lang.cache.v2';
  var AUTO_MT = true;            // machine-translate beyond the dictionary
  var MT_CONCURRENCY = 6;        // parallel requests (cache makes most strings free)
  var GTX_CHUNK = 1000;          // max source chars per Google request (URL-safe)
  var MM_CHUNK = 450;            // max source chars per MyMemory request (its ~500 cap)
  var CACHE_MAX = 6000;          // soft cap on cached entries

  // Optional: your own Cloudflare Worker translation proxy — server-side, official
  // API, full reliability (and it keeps any API key secret). Deploy it per
  // docs/translation-worker.md, then paste the Worker URL here to make it the
  // PRIMARY engine. gtx + MyMemory stay as automatic fallbacks.
  // Empty string = unchanged (keyless Google endpoint stays primary).
  var WORKER_URL = 'https://pjcc-translate.nathgreen37.workers.dev';

  // 1) curated, brand-safe dictionary (instant; never sent to any service)
  var DICT = {
    'PJCC': 'PJCC', 'McPuppy Studios': 'マクパピー・スタジオ', 'McPuppy': 'マクパピー',
    'Games': 'ゲーム', 'Characters': 'キャラクター',
    'Characters & Locations': 'キャラクターとロケーション', 'Locations': 'ロケーション',
    'Academy': 'アカデミー',
    'Your Dossier': 'あなたのファイル', 'Dossier': 'ファイル', 'Operative Dossier': '機密ファイル', 'Your Profile': 'あなたのプロフィール', 'Profile': 'プロフィール',
    'Command Center': '司令部', 'Projects': 'プロジェクト', 'Blog': 'ブログ', 'Build Log': 'ビルドログ',
    'Mailing List': 'メール登録', 'For Educators': '教育者向け',
    'About / Contact': '概要・連絡', 'Contact': '連絡先', 'About': '概要', 'Support': 'サポート',
    'Leaderboard': 'ランキング', 'Leaderboards': 'ランキング',
    'Home': 'ホーム', 'Patreon': 'Patreon', 'Coming Soon': '近日公開', 'The World': 'ザ・ワールド',
    'The Goods': 'グッズ', 'Merch': 'グッズ', 'The Direct Line': 'ダイレクトライン', 'Direct Line': 'ダイレクトライン',
    'Podcast & Blog': 'ポッドキャスト・ブログ', 'Play Now': 'プレイ', 'Play': 'プレイ',
    'Read the Blog': 'ブログを読む', 'field notes': 'フィールドノート',
    'Princess and the Journey to Chess City': 'プリンセスとチェスシティへの旅',
    'Checker Town': 'チェッカータウン', 'Chess City': 'チェスシティ', 'Shogi Island': '将棋の島',
    'The Reading Room': '読書室', 'The Gauntlet': 'ガントレット', 'The Battle Room': 'バトルルーム',
    'The Gambit': 'ザ・ギャンビット', 'Princess': 'プリンセス', 'Sign in': 'サインイン', 'Sign out': 'サインアウト', 'Characters': 'キャラクター', 'Locations': 'ロケーション'
  };

  // memory cache of machine translations (loaded from localStorage)
  var cache = {};
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { cache = {}; }
  var saveTimer = null;
  function saveCache() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        var keys = Object.keys(cache);
        if (keys.length > CACHE_MAX) { cache = {}; }   // rare; reset rather than grow unbounded
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch (e) {}
    }, 600);
  }

  function current() { try { return localStorage.getItem(KEY) || 'en'; } catch (e) { return 'en'; } }
  // In-memory source of truth for the active language. Set synchronously at the TOP
  // of apply() so the async MT queue (pump) is gated on the language we're switching
  // TO — not the stale localStorage value during the pass that enqueues the work.
  var LANG = current();

  // Button label + a lightweight "translating…" state while machine-translation is
  // still landing (long paragraphs arrive a beat after the instant dictionary flip).
  function setBtnLabel() {
    var btn = document.getElementById('lang-toggle');
    if (!btn) return;
    var working = (LANG === 'jp') && (active > 0 || queue.length > 0);
    btn.textContent = (LANG === 'jp' ? 'EN' : '日本語') + (working ? ' …' : '');
    btn.setAttribute('aria-busy', working ? 'true' : 'false');
  }

  // ---- what NOT to translate ------------------------------------------------
  var SKIP_TAGS = { SCRIPT:1, STYLE:1, NOSCRIPT:1, CODE:1, PRE:1, KBD:1, SAMP:1,
                    TEXTAREA:1, INPUT:1, SELECT:1, OPTION:1, CANVAS:1, SVG:1 };
  var SKIP_SEL = '[data-no-translate], .notranslate, .pjcc-sigil,' +
                 ' #nav-operative, #lang-toggle, .world-ticker-wrap, .footer-ribbon-wrap,' +
                 ' [contenteditable], .pjcc-credits, .dsr-name, .lb-name, .cmdk-trigger-kbd';
  function skip(node) {
    var el = node.parentNode;
    while (el && el.nodeType === 1) {
      if (SKIP_TAGS[el.tagName]) return true;
      if (el.matches && el.matches(SKIP_SEL)) return true;
      if (el.getAttribute && el.getAttribute('translate') === 'no') return true;
      el = el.parentNode;
    }
    return false;
  }
  function hasJP(s) { return /[　-ヿ㐀-鿿＀-￯]/.test(s); }
  function hasLatin(s) { return /[A-Za-z]/.test(s); }

  // ---- core DOM walk --------------------------------------------------------
  function lookup(trimmed) { return DICT[trimmed] || cache[trimmed] || null; }
  function setNode(node, raw, translated) {
    var m = raw.match(/^(\s*)[\s\S]*?(\s*)$/);   // keep original surrounding whitespace
    node.nodeValue = (m ? m[1] : '') + translated + (m ? m[2] : '');
  }

  function translateTree(root, lang) {
    if (!root) return;
    if (root.nodeType === 3) { handleTextNode(root, lang); return; }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) handleTextNode(node, lang);
  }
  function handleTextNode(node, lang) {
    var raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    if (skip(node)) return;
    if (node.__pjEn === undefined) node.__pjEn = raw;       // remember the English once
    var trimmed = node.__pjEn.trim();

    if (lang === 'en') { node.nodeValue = node.__pjEn; return; }
    if (hasJP(trimmed) || !hasLatin(trimmed)) return;       // already JP / nothing to do

    var hit = lookup(trimmed);
    if (hit) { setNode(node, node.__pjEn, hit); return; }
    if (AUTO_MT) enqueue(trimmed, node);
  }

  // ---- machine translation: unlimited length via chunking + provider chain ---
  function splitChunks(text, max) {
    if (text.length <= max) return [text];
    var parts = text.split(/(\s+)/), chunks = [], cur = '';
    for (var i = 0; i < parts.length; i++) {
      if (cur && (cur + parts[i]).length > max) { chunks.push(cur); cur = ''; }
      cur += parts[i];
    }
    if (cur) chunks.push(cur);
    return chunks;
  }

  // Google's keyless endpoint — handles long text, no per-request char cap of note.
  function gtx(text) {
    var u = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ja&dt=t&q=' +
            encodeURIComponent(text);
    return fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      if (!d || !d[0]) return null;
      var out = '';
      for (var i = 0; i < d[0].length; i++) { if (d[0][i] && d[0][i][0]) out += d[0][i][0]; }
      return out || null;
    });
  }
  // MyMemory fallback (smaller chunks; ~500-char cap).
  function mymemory(text) {
    var u = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=en|ja';
    return fetch(u).then(function (r) { return r.json(); }).then(function (d) {
      var t = d && d.responseData && d.responseData.translatedText;
      if (!t || (d.responseStatus && d.responseStatus !== 200)) return null;
      if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(t)) return null;
      return t;
    });
  }
  // Your Cloudflare Worker proxy (only used if WORKER_URL is set above).
  function worker(text) {
    return fetch(WORKER_URL + '?sl=english&tl=japanese&q=' + encodeURIComponent(text))
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { return (d && d.translation) || null; });
  }
  var PROVIDERS = [];
  if (WORKER_URL) PROVIDERS.push({ fn: worker, chunk: 1500 });
  PROVIDERS.push({ fn: gtx, chunk: GTX_CHUNK });
  PROVIDERS.push({ fn: mymemory, chunk: MM_CHUNK });

  // translate every chunk in order with one provider; reject if any chunk fails
  function viaProvider(text, prov) {
    var chunks = splitChunks(text, prov.chunk), out = [], p = Promise.resolve();
    chunks.forEach(function (c) {
      p = p.then(function () {
        if (!c.trim()) { out.push(c); return; }
        return prov.fn(c).then(function (t) { if (t == null) throw 0; out.push(t); });
      });
    });
    return p.then(function () { return out.join(''); });
  }
  // try providers in order; resolve with the first full success, else null
  function translateText(text) {
    var p = Promise.reject();
    PROVIDERS.forEach(function (prov) {
      p = p.catch(function () { return viaProvider(text, prov); });
    });
    return p.catch(function () { return null; });
  }

  // ---- uncapped, concurrency-limited global queue ---------------------------
  var pending = {};     // key -> [text nodes awaiting this translation]
  var queued = {};      // key -> true (queued or attempted this session)
  var queue = [];
  var active = 0;
  function enqueue(key, node) {
    (pending[key] = pending[key] || []).push(node);
    if (!queued[key]) { queued[key] = true; queue.push(key); }
    pump();
  }
  function pump() {
    if (LANG !== 'jp') return;
    while (active < MT_CONCURRENCY && queue.length) {
      var key = queue.shift();
      active++;
      (function (k) {
        translateText(k).then(function (t) {
          active--;
          if (t) {
            cache[k] = t; saveCache();
            if (LANG === 'jp' && pending[k]) pending[k].forEach(function (n) {
              if (n.__pjEn !== undefined && document.contains(n)) setNode(n, n.__pjEn, t);
            });
          } else {
            delete queued[k];   // transient failure (cold start / rate-limit) — let it retry on a later toggle
          }
          delete pending[k];
          setBtnLabel();
          pump();
        });
      })(key);
    }
    setBtnLabel();
  }

  // ---- apply / toggle -------------------------------------------------------
  function apply(lang) {
    // Commit the language FIRST — in memory AND storage — BEFORE walking the DOM.
    // translateTree() enqueues machine-translation work and calls pump(), which is
    // gated on LANG === 'jp'. If we set the language AFTER (as it used to be), that
    // first enqueue pass runs while LANG is still 'en', pump() bails, and nothing
    // machine-translates on the first click. (Root cause of "toggle does nothing the
    // first time, then half-works." — Nate 2026-07-12)
    LANG = lang;
    try { localStorage.setItem(KEY, lang); } catch (e) {}

    // author-marked rich content: <tag data-jp="日本語">English</tag>
    Array.prototype.forEach.call(document.querySelectorAll('[data-jp]'), function (el) {
      var en = el.getAttribute('data-en-html');
      if (en === null) { en = el.innerHTML; el.setAttribute('data-en-html', en); }
      el.innerHTML = (lang === 'jp') ? el.getAttribute('data-jp') : en;
    });
    translateTree(document.body, lang);

    document.documentElement.setAttribute('lang', lang === 'jp' ? 'ja' : 'en');
    setBtnLabel();
    ensureObserver();
  }

  window.PJCCLang = {
    toggle: function () { apply(current() === 'jp' ? 'en' : 'jp'); },
    apply: apply, DICT: DICT
  };

  // ---- keep up with client-rendered content (auto-updating always) ----------
  var observer = null;
  function ensureObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (muts) {
      if (LANG !== 'jp') return;
      var roots = [];
      muts.forEach(function (m) {
        if (m.type === 'characterData' && m.target) { roots.push(m.target); return; }
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType === 1 || n.nodeType === 3) roots.push(n);
        });
      });
      if (roots.length) {
        clearTimeout(observer.__t);
        observer.__t = setTimeout(function () { roots.forEach(function (r) {
          if (r.nodeType === 1 || r.nodeType === 3) { if (document.contains(r)) translateTree(r, 'jp'); }
        }); }, 120);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function init() {
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.onclick = function () { window.PJCCLang.toggle(); };
    apply(current());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
