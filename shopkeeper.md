---
layout: page
title: Shopkeeper
permalink: /shopkeeper/
---


<p class="qm-intro">The Shopkeeper keeps the gear. Spend the credits you earn in the games on field avatars — and switch back to any of your eight free operative faces whenever you like. Your <strong>companion pet</strong> is raised over in the <a href="/dossier/">Companion Den</a> on your Dossier.</p>

{% comment %} The counter points at the case (2026-08-03). This shop only stocks what is FOR
     SALE; the pieces you earn and the ones the altar keeps are not here, and without this
     line a visitor's only picture of "what exists" is the shelf in front of them — which
     is two thirds of the truth. {% endcomment %}
<p class="qm-intro"><a href="/collection/">🗃 See the whole collection →</a> — everything on
this shelf plus the pieces you earn and the ones only the altar gives back.</p>

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

  /* ── SELL IT BACK, FOR A QUARTER (2026-07-28) ──────────────────────────────────
     Returns '' unless there is genuinely something to sell, so every caller can just
     concatenate it. PJCC.sellValue() is the single authority on the number and on what
     is sellable at all — the Vault answers 0 there, so its tiles get no button without
     this file needing to know why.

     ⚠ ONLY WHAT YOU AREN'T WEARING. Selling equipped gear works (burnCollectable falls
     back to the free defaults), but "I sold a thing and my face changed" is a surprise
     nobody asked for. Take it off first. */
  function sellBtn(kind, key, equipped) {
    if (equipped || !PJCC.sellValue) return '';
    var v = PJCC.sellValue(kind, key);
    if (!v) return '';
    return '<button class="qm-sell" data-sk="' + kind + ':' + key + '" data-v="' + v + '">Sell · ' + v + '</button>';
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
      else if (isOwned) action = { on: false, html: '<button class="pjcc-btn qm-equip" data-k="' + item.key + '">Equip</button>' + sellBtn('avatar', item.key, on) };
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
      else if (owned) action = '<button class="pjcc-btn qm-tequip" data-k="' + t.key + '">Equip</button>' + sellBtn('title', t.key, on);
      else action = '<button class="pjcc-btn qm-tbuy" data-k="' + t.key + '"' + (canAfford ? '' : ' disabled') + '>' + (canAfford ? 'Buy · ' + t.price : t.price + ' cr') + '</button>';
      html += '<div class="qm-item' + (on ? ' on' : '') + '"><div class="qm-title-label">' + PJCC.TITLES[t.key].label + '</div>' +
        '<div class="qm-price">' + (owned ? 'Owned' : t.price + ' credits') + '</div>' + action + '</div>';
    });
    html += '</div>';

    // Profile themes (Dossier accent)
    var ownedThemes = PJCC.ownedThemes(prof);
    var equippedTheme = (prof.companion && prof.companion.theme) || 'default';
    html += '<h2 class="qm-h">Board skins &amp; themes</h2><p class="pjcc-sub" style="margin:0 0 8px;">Recolours your Dossier — and now skins the gold chrome inside the games too.</p><div class="qm-grid">';
    PJCC.THEME_SHOP.forEach(function (key) {
      var t = PJCC.THEMES[key];
      var owned = ownedThemes.indexOf(key) !== -1;
      var on = equippedTheme === key;
      var canAfford = (prof.credits || 0) >= t.price;
      var action;
      if (on) action = '<button class="pjcc-btn-ghost" disabled>Equipped</button>';
      else if (owned) action = '<button class="pjcc-btn qm-thequip" data-k="' + key + '">Equip</button>' + sellBtn('theme', key, on);
      else action = '<button class="pjcc-btn qm-thbuy" data-k="' + key + '"' + (canAfford ? '' : ' disabled') + '>' + (canAfford ? 'Buy · ' + t.price : t.price + ' cr') + '</button>';
      html += '<div class="qm-item' + (on ? ' on' : '') + '"><div class="qm-swatch" style="background:' + t.bg + ';border-color:' + t.accent + '"></div>' +
        '<div class="qm-title-label" style="color:' + t.accent + '">' + t.label + '</div>' +
        '<div class="qm-price">' + (owned ? 'Owned' : t.price + ' credits') + '</div>' + action + '</div>';
    });
    html += '</div>';
    if (equippedTheme !== 'default') html += '<button class="pjcc-btn-ghost qm-thequip" data-k="default" style="margin-top:10px;">Reset to Operative Gold</button>';

    // THE VAULT (2026-07-27) — collectables the Shopkeeper does NOT sell. They only
    // exist if the Gambit altar handed one back, so this section appears only when
    // you hold one, and every button here is Equip. Nothing is priced or buyable.
    var vaultOwned = (PJCC.ownedCollectables ? PJCC.ownedCollectables() : []).filter(function (c) { return c.vault; });
    if (vaultOwned.length) {
      html += '<h2 class="qm-h">The Vault</h2><p class="pjcc-sub" style="margin:0 0 8px;">Not for sale — the altar gave these back.</p><div class="qm-grid">';
      vaultOwned.forEach(function (c) {
        var on = c.kind === 'avatar' ? (equipped === c.key)
               : c.kind === 'title'  ? (equippedTitle === c.key)
               : (equippedTheme === c.key);
        var cls = c.kind === 'avatar' ? 'qm-equip' : c.kind === 'title' ? 'qm-tequip' : 'qm-thequip';
        var action = on ? '<button class="pjcc-btn-ghost" disabled>Equipped</button>'
                        : '<button class="pjcc-btn ' + cls + '" data-k="' + c.key + '">Equip</button>';
        html += '<div class="qm-item qm-vault' + (on ? ' on' : '') + '"><div class="qm-emoji">' + c.glyph + '</div>' +
          '<div class="qm-title-label">' + c.label + '</div><div class="qm-price">Vault</div>' + action + '</div>';
      });
      html += '</div>';
    }

    /* EARNED (2026-08-03) — the third class. Same shape as the Vault block above and for
       the same reason: no price, no Buy, Equip only. It is a SEPARATE list because
       PJCC.ownedCollectables() deliberately excludes earned pieces (they must be
       unsellable and un-stakeable — see the EARNED note in pjcc-profile.js), so the one
       call the Vault block uses cannot see them. Wearing them was never in question; this
       is the surface that lets you. */
    var earnedOwned = (PJCC.earnedOwned ? PJCC.earnedOwned(prof) : []);
    if (earnedOwned.length) {
      html += '<h2 class="qm-h">Earned</h2><p class="pjcc-sub" style="margin:0 0 8px;">No shop sells these and the altar never hands them out. You did the thing. — <a href="/collection/">see the whole case</a></p><div class="qm-grid">';
      earnedOwned.forEach(function (c) {
        var on = c.kind === 'avatar' ? (equipped === c.key)
               : c.kind === 'title'  ? (equippedTitle === c.key)
               : (equippedTheme === c.key);
        var cls = c.kind === 'avatar' ? 'qm-equip' : c.kind === 'title' ? 'qm-tequip' : 'qm-thequip';
        var action = on ? '<button class="pjcc-btn-ghost" disabled>Equipped</button>'
                        : '<button class="pjcc-btn ' + cls + '" data-k="' + c.key + '">Equip</button>';
        html += '<div class="qm-item qm-vault' + (on ? ' on' : '') + '"><div class="qm-emoji">' + c.glyph + '</div>' +
          '<div class="qm-title-label">' + c.label + '</div><div class="qm-price">Earned</div>' + action + '</div>';
      });
      html += '</div>';
    }

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
    /* SELLING IS IRREVERSIBLE, so it asks — but with the button itself, not a browser
       confirm() box. One tap arms it and says what you'll get; a second tap inside four
       seconds does it; anything else and it forgets. Same amount of protection as a modal,
       none of the interruption, and it can't be mistaken for a system dialog. */
    Array.prototype.forEach.call(el.querySelectorAll('.qm-sell'), function (b) {
      var armed = null;
      b.onclick = function () {
        if (!armed) {
          b.classList.add('armed');
          b.textContent = 'Sure? · ' + b.getAttribute('data-v');
          armed = setTimeout(function () {
            armed = null; b.classList.remove('armed');
            b.textContent = 'Sell · ' + b.getAttribute('data-v');
          }, 4000);
          return;
        }
        clearTimeout(armed); armed = null;
        var parts = b.getAttribute('data-sk').split(':');
        b.disabled = true; b.textContent = '…';
        PJCC.sellCollectable(parts[0], parts[1])
          .then(function (r) { try { if (window.showTxToast) showTxToast('Sold — ' + r.paid + ' credits'); } catch (e) {} render(); })
          .catch(function () { b.disabled = false; b.classList.remove('armed'); b.textContent = 'Try again'; });
      };
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
.qm-item { background: #160c33; border: 1px solid #6b5fa0; border-radius: var(--r-md); padding: 14px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.qm-item.on { border-color: #F5C518; box-shadow: 0 0 14px rgba(245,197,24,0.3); }
.qm-emoji { font-size: 38px; }
.qm-title-label { font-size: 0.95rem; font-weight: 800; color: #F5C518; min-height: 38px; display: flex; align-items: center; justify-content: center; text-align: center; }
.qm-swatch { width: 100%; height: 34px; border-radius: 8px; border: 2px solid #F5C518; margin-bottom: 4px; }
.qm-price { color: #b9a8e6; font-size: 0.78rem; }
/* The Vault: no-sale collectables won at the altar (2026-07-27) — amber, not gold, so
   they read as a different class of thing from anything the Shopkeeper stocks. */
/* SELL — deliberately the quietest thing on the tile. Buying and equipping are what the
   Quartermaster is for; selling back at a quarter is a way out of a purchase you regret,
   not a feature to advertise. It only speaks up once it's armed. */
.qm-sell { background: transparent; border: 1px solid rgba(185,168,230,0.32); color: #9a8fd4;
  border-radius: 999px; font: inherit; font-size: 0.72rem; padding: 5px 11px; min-height: 32px;
  cursor: pointer; transition: color .15s, border-color .15s, background .15s; }
.qm-sell:hover:not(:disabled) { color: #ffb066; border-color: rgba(255,176,102,0.55); }
.qm-sell.armed { color: #1a0f05; background: #ffb066; border-color: #ffb066; font-weight: 800; }
.qm-sell:disabled { opacity: .5; cursor: default; }
@media (pointer: coarse) { .qm-sell { min-height: 44px; padding: 5px 14px; } }
.qm-item.qm-vault { border-color: #ffb066; background: linear-gradient(160deg,#2a1608,#160c33); }
.qm-item.qm-vault .qm-price { color: #ffb066; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.66rem; font-weight: 800; }
.qm-item.qm-vault .qm-title-label { color: #ffd7a8; }
</style>
