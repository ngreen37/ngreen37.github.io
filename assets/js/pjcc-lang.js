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
    'Characters': 'キャラクター',
    'Locations': 'ロケーション',
    'Evolution Log': '進化の記録',
    'World Map': '世界地図',
    'Projects': 'プロジェクト',
    'Games': 'ゲーム',
    'Leaderboard': 'ランキング',
    'Leaderboards': 'ランキング',
    'Dossier': 'ファイル',
    'Operative Dossier': '機密ファイル',
    'Chess Lessons': 'チェス教室',
    'In-Person Chess Lessons': '対面チェス教室',
    'Podcast': 'ポッドキャスト',
    'Blog': 'ブログ',
    'Soundtrack': 'サントラ',
    'Mailing List': 'メール登録',
    'About / Contact': '概要・連絡',
    'Contact': '連絡先',
    'Home': 'ホーム',
    'McPuppy Studios': 'マクパピー'
  };
  var SEL = '.page-link, .about-contact-btn, .nav-group-label';
  var KEY = 'pjcc.lang';

  function current() { try { return localStorage.getItem(KEY) || 'en'; } catch (e) { return 'en'; } }

  function apply(lang) {
    var nodes = document.querySelectorAll(SEL);
    Array.prototype.forEach.call(nodes, function (el) {
      var en = el.getAttribute('data-en');
      if (en === null) { en = el.textContent.trim(); el.setAttribute('data-en', en); }
      el.textContent = (lang === 'jp' && DICT[en]) ? DICT[en] : en;
    });
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
