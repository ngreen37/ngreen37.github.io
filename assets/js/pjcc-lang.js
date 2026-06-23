/* =============================================================================
 * PJCC language toggle (EN / 日本語) — WHOLE-SITE edition
 * -----------------------------------------------------------------------------
 * Goal (Nate, 2026-06-23): the 日本語 toggle should translate the ENTIRE site,
 * not just the nav, and keep up with any and all updates automatically.
 *
 * How it works — two layers:
 *   1. Curated dictionary (DICT): brand + nav + common terms. Instant, perfect,
 *      never sent anywhere. Brand-safe.
 *   2. Auto-fill machine translation: every other English text node is translated
 *      on demand via a free endpoint and CACHED in localStorage, so new content is
 *      picked up automatically (that's the "keeps up with updates" part) and repeat
 *      visits are instant. A MutationObserver re-translates client-rendered sections
 *      (the Dossier, leaderboards, game cards) as they appear.
 *
 * Always safe: anything not translated stays English; if the endpoint is down or
 * rate-limited, the page simply stays in English for those bits — nothing breaks.
 * Protected from translation: code, inputs, the operative pill + codenames, the
 * Shogi-gate sigil, the in-world ticker, the walker, and anything marked
 * [data-no-translate] / .notranslate.
 *
 * To swap in a higher-quality / higher-limit engine later, change MT_ENDPOINT
 * (e.g. a self-hosted LibreTranslate or a DeepL proxy) — everything else stays.
 * Set AUTO_MT = false to fall back to dictionary-only (no external calls).
 * ========================================================================== */
(function () {
  'use strict';

  var KEY = 'pjcc.lang';
  var CACHE_KEY = 'pjcc.lang.cache.v1';
  var AUTO_MT = true;                 // machine-translate beyond the dictionary
  var MAX_MT_PER_PASS = 140;          // be gentle on the free endpoint
  var MT_CONCURRENCY = 3;

  // 1) curated, brand-safe dictionary (instant; never sent to any service)
  var DICT = {
    'PJCC': 'PJCC', 'McPuppy Studios': 'マクパピー・スタジオ', 'McPuppy': 'マクパピー',
    'Games': 'ゲーム', 'Daily Dispatch': 'デイリー速報', 'Characters': 'キャラクター',
    'Characters & Locations': 'キャラクターとロケーション', 'Locations': 'ロケーション',
    'Academy': 'アカデミー', 'The Pilot': 'パイロット版', "Writers' Room": '脚本室',
    'Your Dossier': 'あなたのファイル', 'Dossier': 'ファイル', 'Operative Dossier': '機密ファイル',
    'Command Center': '司令部', 'Projects': 'プロジェクト', 'Blog': 'ブログ',
    'Mailing List': 'メール登録', 'Press Pass': 'プレスパス', 'For Educators': '教育者向け',
    'About / Contact': '概要・連絡', 'Contact': '連絡先', 'About': '概要',
    'Leaderboard': 'ランキング', 'Leaderboards': 'ランキング', 'Hall of Fame': '殿堂',
    'Home': 'ホーム', 'Patreon': 'Patreon', 'Coming Soon': '近日公開',
    'Podcast & Blog': 'ポッドキャスト・ブログ', 'Play Now': 'プレイ', 'Play': 'プレイ',
    'Read the Blog': 'ブログを読む', 'field notes': 'フィールドノート',
    'Princess and the Journey to Chess City': 'プリンセスとチェスシティへの旅',
    'Checker Town': 'チェッカータウン', 'Chess City': 'チェスシティ', 'Shogi Island': '将棋の島',
    'The Reading Room': '読書室', 'The Gauntlet': 'ガントレット', 'The Battle Room': 'バトルルーム',
    'Princess': 'プリンセス', 'Sign in': 'サインイン'
  };

  // memory cache of machine translations (loaded from localStorage)
  var cache = {};
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { cache = {}; }
  var saveTimer = null;
  function saveCache() { clearTimeout(saveTimer); saveTimer = setTimeout(function () {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
  }, 500); }

  function current() { try { return localStorage.getItem(KEY) || 'en'; } catch (e) { return 'en'; } }

  // ---- what NOT to translate ------------------------------------------------
  var SKIP_TAGS = { SCRIPT:1, STYLE:1, NOSCRIPT:1, CODE:1, PRE:1, KBD:1, SAMP:1,
                    TEXTAREA:1, INPUT:1, SELECT:1, OPTION:1, CANVAS:1, SVG:1 };
  var SKIP_SEL = '[data-no-translate], .notranslate, .pjcc-sigil, .princess-walker,' +
                 ' #nav-operative, #lang-toggle, .world-ticker-wrap, .footer-ribbon-wrap,' +
                 ' [contenteditable], .pjcc-credits, .dsr-name, .lb-name';
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

  // ---- the core DOM walk ----------------------------------------------------
  function lookup(trimmed) { return DICT[trimmed] || cache[trimmed] || null; }
  function setNode(node, raw, translated) {
    var m = raw.match(/^(\s*)[\s\S]*?(\s*)$/);   // keep the original surrounding whitespace
    node.nodeValue = (m ? m[1] : '') + translated + (m ? m[2] : '');
  }

  function translateTree(root, lang) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node, queueMap = {};   // trimmed -> [nodes] for the MT pass
    while ((node = walker.nextNode())) {
      var raw = node.nodeValue;
      if (!raw || !raw.trim()) continue;
      if (skip(node)) continue;
      if (node.__pjEn === undefined) node.__pjEn = raw;   // remember the English once
      var trimmed = node.__pjEn.trim();

      if (lang === 'en') { node.nodeValue = node.__pjEn; continue; }

      // jp
      if (hasJP(trimmed) || !hasLatin(trimmed)) continue;   // already JP / nothing to do
      var hit = lookup(trimmed);
      if (hit) { setNode(node, node.__pjEn, hit); continue; }
      if (AUTO_MT) { (queueMap[trimmed] = queueMap[trimmed] || []).push(node); }
    }
    if (lang === 'jp' && AUTO_MT) runMT(queueMap);
  }

  // ---- machine-translation auto-fill (cached, throttled, fail-safe) ---------
  var MT_ENDPOINT = function (text) {
    return 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=en|ja';
  };
  function mtOne(text) {
    return fetch(MT_ENDPOINT(text)).then(function (r) { return r.json(); }).then(function (d) {
      var t = d && d.responseData && d.responseData.translatedText;
      if (!t) return null;
      if (d.responseStatus && d.responseStatus !== 200) return null;     // quota / error
      if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(t)) return null;
      return t;
    }).catch(function () { return null; });
  }
  var inFlight = false;
  function runMT(queueMap) {
    var keys = Object.keys(queueMap).filter(function (k) { return !lookup(k); }).slice(0, MAX_MT_PER_PASS);
    if (!keys.length || inFlight) return;
    inFlight = true;
    var i = 0, active = 0;
    function pump() {
      if (current() !== 'jp') { inFlight = false; return; }          // user toggled back
      while (active < MT_CONCURRENCY && i < keys.length) {
        var key = keys[i++]; active++;
        (function (k) {
          mtOne(k).then(function (t) {
            active--;
            if (t) {
              cache[k] = t; saveCache();
              if (current() === 'jp') queueMap[k].forEach(function (n) {
                if (n.__pjEn !== undefined && document.contains(n)) setNode(n, n.__pjEn, t);
              });
            }
            if (i < keys.length) pump(); else if (active === 0) inFlight = false;
          });
        })(key);
      }
    }
    pump();
  }

  // ---- apply / toggle -------------------------------------------------------
  function apply(lang) {
    // author-marked rich content: <tag data-jp="日本語">English</tag>
    Array.prototype.forEach.call(document.querySelectorAll('[data-jp]'), function (el) {
      var en = el.getAttribute('data-en-html');
      if (en === null) { en = el.innerHTML; el.setAttribute('data-en-html', en); }
      el.innerHTML = (lang === 'jp') ? el.getAttribute('data-jp') : en;
    });
    // the whole document body
    translateTree(document.body, lang);

    document.documentElement.setAttribute('lang', lang === 'jp' ? 'ja' : 'en');
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = (lang === 'jp') ? 'EN' : '日本語';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    ensureObserver();
  }

  window.PJCCLang = { toggle: function () { apply(current() === 'jp' ? 'en' : 'jp'); }, apply: apply,
                      DICT: DICT };

  // ---- keep up with client-rendered content (Dossier, boards, cards) --------
  var observer = null;
  function ensureObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (muts) {
      if (current() !== 'jp') return;
      var roots = [];
      muts.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType === 1) roots.push(n);
          else if (n.nodeType === 3 && n.parentNode) roots.push(n.parentNode);
        });
      });
      if (roots.length) {
        // debounce a touch so big re-renders translate in one pass
        clearTimeout(observer.__t);
        observer.__t = setTimeout(function () { roots.forEach(function (r) { translateTree(r, 'jp'); }); }, 120);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.onclick = function () { window.PJCCLang.toggle(); };
    apply(current());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
