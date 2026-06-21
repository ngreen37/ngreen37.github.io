/* ============================================================================
   PJCC Leitmotifs — a tiny, distinct musical signature for each character.
   Deterministic: the same name always plays the same motif (seeded melody +
   timbre + key), generated live with the Web Audio API. No audio files, offline.
   Usage:  PJCCLeitmotif.play('Princess')
   ========================================================================== */
window.PJCCLeitmotif = (function () {
  var actx = null;
  function ctx() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (actx && actx.state === 'suspended') { try { actx.resume(); } catch (e) {} }
    return actx;
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // Consonant scales keep every motif pleasant; the seed picks one per character.
  var SCALES = {
    majPent:  [0, 2, 4, 7, 9, 12, 14, 16],
    minPent:  [0, 3, 5, 7, 10, 12, 15, 17],
    dorian:   [0, 2, 3, 5, 7, 9, 10, 12],
    lydian:   [0, 2, 4, 6, 7, 9, 11, 12]
  };
  var SCALE_KEYS = ['majPent', 'minPent', 'dorian', 'lydian'];
  var TIMBRES = ['triangle', 'sine', 'square', 'sawtooth'];
  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function voice(c, dest, type, freq, t, dur, vol) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    o.connect(g); g.connect(dest);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.06);
  }

  var lastNote = 0;
  function play(name) {
    var c = ctx(); if (!c) return false;
    var seed = hash(String(name || 'pjcc'));
    var r = mulberry32(seed);
    var root = 50 + Math.floor(r() * 12);                       // ~D3–C4
    var scale = SCALES[SCALE_KEYS[Math.floor(r() * SCALE_KEYS.length)]];
    var lead = TIMBRES[Math.floor(r() * TIMBRES.length)];
    var bassType = r() < 0.5 ? 'sine' : 'triangle';
    var swing = r() < 0.5;

    var t = c.currentTime + 0.04;
    var master = c.createGain(); master.gain.value = 0.9; master.connect(c.destination);

    // soft bass drone under the phrase
    voice(c, master, bassType, midiToFreq(root - 12 + scale[0]), t, 1.8, 0.16);
    if (r() < 0.6) voice(c, master, bassType, midiToFreq(root - 12 + scale[4]), t + 0.9, 1.0, 0.12);

    // the melodic signature: 6–8 notes, occasional held note
    var n = 6 + Math.floor(r() * 3);
    var base = 0.20 + r() * 0.07;
    var cur = t + 0.02;
    for (var i = 0; i < n; i++) {
      var step = Math.floor(r() * scale.length);
      var midi = root + scale[step];
      var long = r() < 0.22;
      var d = base * (long ? 2 : 1) * (swing && i % 2 ? 1.25 : 1);
      voice(c, master, lead, midiToFreq(midi), cur, d * 0.92, 0.2);
      if (r() < 0.3) voice(c, master, lead, midiToFreq(midi + 12), cur, d * 0.6, 0.07); // sparkle octave
      cur += d;
    }
    lastNote = cur;
    return true;
  }

  return { play: play };
})();
