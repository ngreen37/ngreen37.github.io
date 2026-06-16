---
layout: page
title: Quartermaster
permalink: /quartermaster/
---

<link rel="stylesheet" href="{{ '/assets/css/pjcc-profile.css' | relative_url }}">

<p class="qm-intro">Spend the credits you earn in the games on field avatars. Win runs, bank credits, requisition gear. Your eight starter avatars are always free.</p>

<div id="quartermaster"><p class="lb-empty">Loading…</p></div>

<script src="{{ '/assets/js/pjcc-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pjcc-profile.js' | relative_url }}"></script>
<script>
(function () {
  var el = document.getElementById('quartermaster');
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function render() {
    if (!PJCC.enabled) { el.innerHTML = '<p class="lb-empty">The Quartermaster is offline.</p>'; return; }
    var prof = PJCC.getProfile();
    if (!PJCC.currentUser() || !prof) {
      el.innerHTML = '<p class="lb-empty">Sign in from your <a href="/dossier/">Dossier</a> or any game to open your requisition account.</p>';
      return;
    }
    var owned = PJCC.ownedAvatars();
    var equipped = prof.companion && prof.companion.avatar;
    var html = '<div class="qm-bal">Balance: <strong>' + (prof.credits || 0) + '</strong> credits</div>' +
      '<div class="qm-grid">';
    PJCC.AVATAR_SHOP.forEach(function (item) {
      var isOwned = owned.indexOf(item.key) !== -1;
      var isOn = item.key === equipped;
      var canAfford = (prof.credits || 0) >= item.price;
      var action;
      if (isOn) action = '<button class="pjcc-btn-ghost" disabled>Equipped</button>';
      else if (isOwned) action = '<button class="pjcc-btn qm-equip" data-k="' + item.key + '">Equip</button>';
      else action = '<button class="pjcc-btn qm-buy" data-k="' + item.key + '"' + (canAfford ? '' : ' disabled') + '>' +
                    (canAfford ? 'Buy · ' + item.price : item.price + ' cr') + '</button>';
      html += '<div class="qm-item' + (isOn ? ' on' : '') + '">' +
        '<div class="qm-emoji">' + PJCC.AVATARS[item.key] + '</div>' +
        '<div class="qm-price">' + (isOwned ? 'Owned' : item.price + ' credits') + '</div>' +
        action + '</div>';
    });
    html += '</div>';
    el.innerHTML = html;

    Array.prototype.forEach.call(el.querySelectorAll('.qm-buy'), function (b) {
      b.onclick = function () {
        b.disabled = true; b.textContent = '…';
        PJCC.buyAvatar(b.getAttribute('data-k')).then(render).catch(function (e) {
          b.disabled = false; b.textContent = 'Try again';
        });
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
.qm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; max-width: 720px; }
.qm-item { background: #160c33; border: 1px solid #6b5fa0; border-radius: 12px; padding: 14px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.qm-item.on { border-color: #F5C518; box-shadow: 0 0 14px rgba(245,197,24,0.3); }
.qm-emoji { font-size: 38px; }
.qm-price { color: #b9a8e6; font-size: 0.78rem; }
</style>
