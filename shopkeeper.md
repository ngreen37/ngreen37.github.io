---
layout: page
title: Shopkeeper
permalink: /shopkeeper/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<p class="qm-intro">The Shopkeeper keeps the gear. Spend the credits you earn in the games on field avatars — and switch back to any of your free starters whenever you like.</p>

<div id="shopkeeper"><p class="lb-empty">Loading…</p></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  var el = document.getElementById('shopkeeper');

  function tile(key, priceLabel, action) {
    return '<div class="qm-item' + (action.on ? ' on' : '') + '">' +
      '<div class="qm-emoji">' + PJCC.AVATARS[key] + '</div>' +
      '<div class="qm-price">' + priceLabel + '</div>' + action.html + '</div>';
  }

  function render() {
    if (!PJCC.enabled) { el.innerHTML = '<p class="lb-empty">The Shopkeeper is away.</p>'; return; }
    var prof = PJCC.getProfile();
    if (!PJCC.currentUser() || !prof) {
      el.innerHTML = '<p class="lb-empty">Sign in from your <a href="/dossier/">Dossier</a> or any game to open your account.</p>';
      return;
    }
    var owned = PJCC.ownedAvatars();
    var equipped = prof.companion && prof.companion.avatar;

    var html = '<div class="qm-bal">Balance: <strong>' + (prof.credits || 0) + '</strong> credits</div>';

    // Starter avatars (always free, always owned)
    html += '<h2 class="qm-h">Starters (free)</h2><div class="qm-grid">';
    PJCC.AVATAR_FREE.forEach(function (key) {
      var on = key === equipped;
      var action = on
        ? { on: true, html: '<button class="pjcc-btn-ghost" disabled>Equipped</button>' }
        : { on: false, html: '<button class="pjcc-btn qm-equip" data-k="' + key + '">Equip</button>' };
      html += tile(key, 'Free', action);
    });
    html += '</div>';

    // Shop avatars (bought with credits)
    html += '<h2 class="qm-h">Field gear</h2><div class="qm-grid">';
    PJCC.AVATAR_SHOP.forEach(function (item) {
      var isOwned = owned.indexOf(item.key) !== -1;
      var on = item.key === equipped;
      var canAfford = (prof.credits || 0) >= item.price;
      var action;
      if (on) action = { on: true, html: '<button class="pjcc-btn-ghost" disabled>Equipped</button>' };
      else if (isOwned) action = { on: false, html: '<button class="pjcc-btn qm-equip" data-k="' + item.key + '">Equip</button>' };
      else action = { on: false, html: '<button class="pjcc-btn qm-buy" data-k="' + item.key + '"' + (canAfford ? '' : ' disabled') + '>' + (canAfford ? 'Buy · ' + item.price : item.price + ' cr') + '</button>' };
      html += tile(item.key, isOwned ? 'Owned' : item.price + ' credits', action);
    });
    html += '</div>';

    // Titles (purchasable flair shown by your codename)
    var ownedTitles = (prof.companion && prof.companion.owned_titles) || [];
    var equippedTitle = (prof.companion && prof.companion.title) || '';
    html += '<h2 class="qm-h">Titles</h2><div class="qm-grid">';
    PJCC.TITLE_SHOP.forEach(function (t) {
      var owned = ownedTitles.indexOf(t.key) !== -1;
      var on = equippedTitle === t.key;
      var canAfford = (prof.credits || 0) >= t.price;
      var action;
      if (on) action = '<button class="pjcc-btn-ghost" disabled>Equipped</button>';
      else if (owned) action = '<button class="pjcc-btn qm-tequip" data-k="' + t.key + '">Equip</button>';
      else action = '<button class="pjcc-btn qm-tbuy" data-k="' + t.key + '"' + (canAfford ? '' : ' disabled') + '>' + (canAfford ? 'Buy · ' + t.price : t.price + ' cr') + '</button>';
      html += '<div class="qm-item' + (on ? ' on' : '') + '"><div class="qm-title-label">' + PJCC.TITLES[t.key].label + '</div>' +
        '<div class="qm-price">' + (owned ? 'Owned' : t.price + ' credits') + '</div>' + action + '</div>';
    });
    html += '</div>';

    // Profile themes (Dossier accent)
    var ownedThemes = PJCC.ownedThemes(prof);
    var equippedTheme = (prof.companion && prof.companion.theme) || 'default';
    html += '<h2 class="qm-h">Profile themes</h2><div class="qm-grid">';
    PJCC.THEME_SHOP.forEach(function (key) {
      var t = PJCC.THEMES[key];
      var owned = ownedThemes.indexOf(key) !== -1;
      var on = equippedTheme === key;
      var canAfford = (prof.credits || 0) >= t.price;
      var action;
      if (on) action = '<button class="pjcc-btn-ghost" disabled>Equipped</button>';
      else if (owned) action = '<button class="pjcc-btn qm-thequip" data-k="' + key + '">Equip</button>';
      else action = '<button class="pjcc-btn qm-thbuy" data-k="' + key + '"' + (canAfford ? '' : ' disabled') + '>' + (canAfford ? 'Buy · ' + t.price : t.price + ' cr') + '</button>';
      html += '<div class="qm-item' + (on ? ' on' : '') + '"><div class="qm-swatch" style="background:' + t.bg + ';border-color:' + t.accent + '"></div>' +
        '<div class="qm-title-label" style="color:' + t.accent + '">' + t.label + '</div>' +
        '<div class="qm-price">' + (owned ? 'Owned' : t.price + ' credits') + '</div>' + action + '</div>';
    });
    html += '</div>';
    if (equippedTheme !== 'default') html += '<button class="pjcc-btn-ghost qm-thequip" data-k="default" style="margin-top:10px;">Reset to Operative Gold</button>';

    el.innerHTML = html;

    Array.prototype.forEach.call(el.querySelectorAll('.qm-thbuy'), function (b) {
      b.onclick = function () { b.disabled = true; b.textContent = '…'; PJCC.buyTheme(b.getAttribute('data-k')).then(render).catch(function () { b.disabled = false; b.textContent = 'Try again'; }); };
    });
    Array.prototype.forEach.call(el.querySelectorAll('.qm-thequip'), function (b) {
      b.onclick = function () { PJCC.setTheme(b.getAttribute('data-k')).then(render); };
    });
    Array.prototype.forEach.call(el.querySelectorAll('.qm-tbuy'), function (b) {
      b.onclick = function () { b.disabled = true; b.textContent = '…'; PJCC.buyTitle(b.getAttribute('data-k')).then(render).catch(function () { b.disabled = false; b.textContent = 'Try again'; }); };
    });
    Array.prototype.forEach.call(el.querySelectorAll('.qm-tequip'), function (b) {
      b.onclick = function () { PJCC.setTitle(b.getAttribute('data-k')).then(render); };
    });
    Array.prototype.forEach.call(el.querySelectorAll('.qm-buy'), function (b) {
      b.onclick = function () {
        b.disabled = true; b.textContent = '…';
        PJCC.buyAvatar(b.getAttribute('data-k')).then(render).catch(function () { b.disabled = false; b.textContent = 'Try again'; });
      };
    });
    Array.prototype.forEach.call(el.querySelectorAll('.qm-equip'), function (b) {
      b.onclick = function () { PJCC.setAvatar(b.getAttribute('data-k')).then(render); };
    });
  }

  PJCC.onChange(render);
  PJCC.ready.then(render);
})();
</script>

<style>
.qm-intro { color: #9a7fd4; max-width: 640px; }
.qm-bal { color: #f0e6ff; font-size: 1.05rem; margin: 0.4rem 0 1rem; }
.qm-bal strong { color: #6bffb8; }
.qm-h { color: #F5C518; font-size: 1rem; margin: 1.4rem 0 0.6rem; }
.qm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; max-width: 720px; }
.qm-item { background: #160c33; border: 1px solid #6b5fa0; border-radius: 12px; padding: 14px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.qm-item.on { border-color: #F5C518; box-shadow: 0 0 14px rgba(245,197,24,0.3); }
.qm-emoji { font-size: 38px; }
.qm-title-label { font-size: 0.95rem; font-weight: 800; color: #F5C518; min-height: 38px; display: flex; align-items: center; justify-content: center; text-align: center; }
.qm-swatch { width: 100%; height: 34px; border-radius: 8px; border: 2px solid #F5C518; margin-bottom: 4px; }
.qm-price { color: #b9a8e6; font-size: 0.78rem; }
</style>
