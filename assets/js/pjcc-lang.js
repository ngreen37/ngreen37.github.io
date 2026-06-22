/* =============================================================================
 * PJCC language toggle (EN / 日本語)
 * -----------------------------------------------------------------------------
 * A light, charming bilingual flip for the navigation — leaning into the
 * Japanese-speaking world Princess falls into. Swaps known nav labels to
 * Japanese and back, remembered in localStorage. Unknown text is left in
 * English (partial translation is fine). The dynamic operative pill is left
 * alone so it never fights with the profile script.
 * ========================================================================== */
(function () {
  var DICT = {
    'PJCC': 'PJCC',
    'Games': 'ゲーム',
    'Daily Dispatch': 'デイリー速報',
    'Characters': 'キャラクター',
    'Locations': 'ロケーション',
    'Academy': 'アカデミー',
    'The Pilot': 'パイロット版',
    "Writers' Room": '脚本室',
    'Your Dossier': 'あなたのファイル',
    'Dossier': 'ファイル',
    'Operative Dossier': '機密ファイル',
    'Command Center': '司令部',
    'Projects': 'プロジェクト',
    'Blog': 'ブログ',
    'Mailing List': 'メール登録',
    'Press Pass': 'プレスパス',
    'For Educators': '教育者向け',
    'About / Contact': '概要・連絡',
    'Contact': '連絡先',
    'Leaderboard': 'ランキング',
    'Leaderboards': 'ランキング',
    'McPuppy Studios': 'マクパピー',
    'Home': 'ホーム',
    'Patreon': 'Patreon',
    'Coming Soon': '近日公開',
    'Podcast & Blog': 'ポッドキャスト・ブログ'
  };
  var SEL = '.page-link, .about-contact-btn, .nav-group-label';
  var KEY = 'pjcc.lang';

  function current() { try { return localStorage.getItem(KEY) || 'en'; } catch (e) { return 'en'; } }

  function apply(lang) {
    // 1) navigation labels via the shared dictionary
    var nodes = document.querySelectorAll(SEL);
    Array.prototype.forEach.call(nodes, function (el) {
      var en = el.getAttribute('data-en');
      if (en === null) { en = el.textContent.trim(); el.setAttribute('data-en', en); }
      el.textContent = (lang === 'jp' && DICT[en]) ? DICT[en] : en;
    });
    // 2) page-body content explicitly marked up by authors: <tag data-jp="日本語の文">English</tag>
    //    (carries the games' JP→EN spirit onto the marketing / lore pages)
    var marked = document.querySelectorAll('[data-jp]');
    Array.prototype.forEach.call(marked, function (el) {
      var en = el.getAttribute('data-en-html');
      if (en === null) { en = el.innerHTML; el.setAttribute('data-en-html', en); }
      el.innerHTML = (lang === 'jp') ? el.getAttribute('data-jp') : en;
    });
    document.documentElement.setAttribute('lang', lang === 'jp' ? 'ja' : 'en');
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = (lang === 'jp') ? 'EN' : '日本語';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  window.PJCCLang = { toggle: function () { apply(current() === 'jp' ? 'en' : 'jp'); }, apply: apply };

  function init() {
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.onclick = function () { window.PJCCLang.toggle(); };
    apply(current());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
