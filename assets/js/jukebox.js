/* =============================================================================
 * PJCC Build Playlist jukebox
 * -----------------------------------------------------------------------------
 * A site-wide player driven by the Spotify IFrame API. Track list comes from
 * window.PJCC_SOUNDTRACK (generated from _data/soundtrack.yml). State (current
 * track, position, playing, hidden) is saved to localStorage so the same song
 * picks up on the next page.
 *
 * Cross-page note: browsers block silent auto-play, so after a page change the
 * jukebox loads the SAME song at the saved spot and tries to resume — if the
 * browser blocks it, one click of Spotify's play button continues it.
 *
 * Spotify note: listeners not logged into Spotify hear 30-second previews
 * (a Spotify limitation); logged-in listeners get full tracks + auto-advance.
 * ========================================================================== */
(function () {
  var TRACKS = window.PJCC_SOUNDTRACK || [];
  var bar = document.getElementById('pjcc-jukebox');
  if (!TRACKS.length || !bar) return;

  var KEY = 'pjcc.jukebox.v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var st = load();
  if (typeof st.idx !== 'number' || st.idx < 0 || st.idx >= TRACKS.length) st.idx = 0;
  if (typeof st.pos !== 'number') st.pos = 0;
  st.playing = !!st.playing;
  st.hidden = (st.hidden === undefined) ? true : !!st.hidden;

  var controller = null, advancing = false;
  var pendingPlay = st.playing, pendingSeek = st.pos;

  var titleEl = document.getElementById('jb-title');
  var listEl  = document.getElementById('jb-list');

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function setHidden(h) {
    st.hidden = h; save();
    bar.classList.toggle('jb-collapsed', h);
    document.body.classList.toggle('has-jukebox', !h);
  }
  function renderTitle() {
    titleEl.textContent = TRACKS[st.idx].ep + ' · ' + TRACKS[st.idx].title;
    Array.prototype.forEach.call(listEl.querySelectorAll('.jb-li'), function (b) {
      b.classList.toggle('sel', parseInt(b.getAttribute('data-i'), 10) === st.idx);
    });
  }
  function buildList() {
    listEl.innerHTML = TRACKS.map(function (t, i) {
      return '<button class="jb-li" data-i="' + i + '">' + (i + 1) + '. ' + esc(t.title) +
             '<span class="jb-li-ep">' + esc(t.ep) + '</span></button>';
    }).join('');
    Array.prototype.forEach.call(listEl.querySelectorAll('.jb-li'), function (b) {
      b.onclick = function () { playFrom(parseInt(b.getAttribute('data-i'), 10)); listEl.hidden = true; };
    });
  }

  function loadTrack(play) {
    renderTitle();
    if (controller) {
      controller.loadUri('spotify:track:' + TRACKS[st.idx].id);
      if (play) { setTimeout(function () { try { controller.play(); } catch (e) {} }, 400); }
    } else {
      pendingPlay = play;
    }
  }
  function setIdx(i) { st.idx = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length; st.pos = 0; pendingSeek = 0; save(); }
  function next()  { setIdx(st.idx + 1); loadTrack(true); }
  function prev()  { setIdx(st.idx - 1); loadTrack(true); }
  function playFrom(i) { setHidden(false); setIdx(i); loadTrack(true); }

  document.getElementById('jb-prev').onclick = prev;
  document.getElementById('jb-next').onclick = next;
  document.getElementById('jb-list-btn').onclick = function () { listEl.hidden = !listEl.hidden; };
  document.getElementById('jb-close').onclick = function () { setHidden(true); };
  document.getElementById('jb-tab').onclick = function () { setHidden(false); };

  buildList();
  renderTitle();
  setHidden(st.hidden);

  // --- Spotify IFrame API ---------------------------------------------------
  window.onSpotifyIframeApiReady = function (IFrameAPI) {
    var holder = document.getElementById('pjcc-jukebox-embed');
    IFrameAPI.createController(holder, {
      uri: 'spotify:track:' + TRACKS[st.idx].id, width: '100%', height: 80
    }, function (ctrl) {
      controller = ctrl;
      ctrl.addListener('ready', function () {
        if (pendingSeek > 2) { try { ctrl.seek(pendingSeek); } catch (e) {} }
        if (pendingPlay)     { try { ctrl.play(); } catch (e) {} }
      });
      ctrl.addListener('playback_update', function (e) {
        var d = e && e.data; if (!d) return;
        st.pos = d.position / 1000; st.playing = !d.isPaused; save();
        // Auto-advance at the end of a full track.
        if (d.duration > 0 && d.position >= d.duration - 900) {
          if (!advancing) { advancing = true; next(); }
        } else if (d.duration > 0 && d.position < d.duration - 1800) {
          advancing = false;
        }
      });
    });
  };

  // Public hook (used by the "Play all" button on the soundtrack page).
  window.PJCCJukebox = { playFrom: playFrom, next: next, prev: prev, show: function () { setHidden(false); } };
})();
