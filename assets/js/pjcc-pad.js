/* A CONTROLLER A BROWSER DOES NOT KNOW — 2026-10-14
   His: "right now Y appears to be Use. Can you make it A?"

   A browser hands a pad it knows over in ONE standard order (button 0 is the bottom face button,
   12 to 15 are the D-pad). A pad it does not know comes RAW, in its maker's own order. His is a
   PowerA wired pad for the Switch, read off the real thing that day:
       "NSW Spectra Wired Controller (Vendor: 20d6 Product: a714)", mapping "", 14 buttons,
       axes [x, y, x2, 0, 0, y2, 0, 0, 0, dial]
   Its button 0 is Y. Its D-pad is a DIAL on axis 9 (it rests at 3.286, off the scale). Its right
   stick's second axis is axis 5. Everything that reads a pad here expects the standard order, so
   Y was "use" and the D-pad was dead.

   So navigator.getGamepads() is wrapped: a raw pad whose layout is known is handed on re-ordered
   and SAYING it is standard, and the two connection events carry the same re-ordered pad.
   ⚠ A PAD THE BROWSER KNOWS PASSES THROUGH UNTOUCHED, and so does a raw one that is not listed:
     guessing a layout puts every button in the wrong place.
   ⚠ ITS NAME GAINS "(Nintendo Switch layout)": the name is what tells the game and the desktop
     program that A is the RIGHT button.
   Loaded by the game's own page (web_head.html) and by the desktop program for its other pages. */
(function () {
  'use strict';
  if (!navigator.getGamepads) return;

  /* The wired Switch pads PowerA sells (20d6:a710 to a71f) send one report: 14 buttons in the order
     Y B A X · L R ZL ZR · Minus Plus · stick stick · Home Capture.
     `buttons` is, for each STANDARD place, which raw button stands there (null: made from the dial). */
  var KNOWN = [{
    says: 'Nintendo Switch layout',
    chrome: /vendor: 20d6 product: a71[0-9a-f]/i,
    firefox: /^20d6-a71[0-9a-f]-/i,
    buttons: [1, 2, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11, null, null, null, null, 12, 13],
    axes: [0, 1, 2, 5],
    dial: 9
  }];

  function known(pad) {
    if (!pad || pad.mapping === 'standard') return null;
    var id = String(pad.id || '');
    for (var i = 0; i < KNOWN.length; i++) if (KNOWN[i].chrome.test(id) || KNOWN[i].firefox.test(id)) return KNOWN[i];
    return null;
  }

  var UP = { pressed: false, touched: false, value: 0 }, DOWN = { pressed: true, touched: true, value: 1 };

  /* The dial has eight places a seventh of the scale apart, from up (-1) clockwise to up-left (1).
     At rest it is off the scale (3.286), which lands on no place below.
     ⚠ BEFORE ITS FIRST REPORT IT IS 0, which is no place either but would round to "down". */
  function dial(v) {
    if (typeof v !== 'number' || v === 0) return [false, false, false, false];
    var at = Math.round((v + 1) * 3.5);
    return [at === 7 || at === 0 || at === 1, at >= 3 && at <= 5, at >= 5 && at <= 7, at >= 1 && at <= 3];   // up, down, left, right
  }

  function standard(pad, k) {
    var d = dial(pad.axes[k.dial]), buttons = [], axes = [], i;
    for (i = 0; i < k.buttons.length; i++) buttons.push(k.buttons[i] === null ? (d[i - 12] ? DOWN : UP) : (pad.buttons[k.buttons[i]] || UP));
    for (i = 0; i < k.axes.length; i++) axes.push(pad.axes[k.axes[i]] || 0);
    return { id: pad.id + ' (' + k.says + ')', index: pad.index, connected: pad.connected, timestamp: pad.timestamp, mapping: 'standard',
      buttons: buttons, axes: axes, vibrationActuator: pad.vibrationActuator || null, hapticActuators: pad.hapticActuators || [] };
  }

  function wrap(pad) {
    var k = known(pad);
    return k ? standard(pad, k) : pad;
  }

  /* Loaded twice it is still right: the second wraps the first, whose pads already say "standard". */
  var real = navigator.getGamepads.bind(navigator);
  navigator.getGamepads = function () {
    var list = real(), out = [];
    for (var i = 0; i < list.length; i++) out.push(wrap(list[i]));
    return out;
  };

  /* ⚠ THE ENGINE DECIDES WHAT A PAD IS FROM THE CONNECTION EVENT, not from what it reads later: handed the
     raw pad there, it kept the maker's order however the pad was re-ordered afterward. */
  ['gamepadconnected', 'gamepaddisconnected'].forEach(function (type) {
    window.addEventListener(type, function (e) {
      if (!known(e.gamepad)) return;            // the re-ordered one says "standard", so it is not caught twice
      e.stopImmediatePropagation();
      var again = new Event(type);
      again.gamepad = wrap(e.gamepad);
      window.dispatchEvent(again);
    }, true);
  });
})();
