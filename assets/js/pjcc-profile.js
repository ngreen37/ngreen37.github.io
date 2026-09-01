/* =============================================================================
 * PJCC Operative Profile — shared client module
 * -----------------------------------------------------------------------------
 * One file every game imports. Wraps the Supabase SDK so games never touch SQL.
 *
 *   PJCC.ready                 -> Promise that resolves once init is done
 *   PJCC.enabled               -> true if Supabase keys are configured
 *   PJCC.currentUser()         -> auth user object, or null if guest
 *   PJCC.getProfile()          -> {codename, companion, credits, rank} | null
 *   PJCC.signInMagic(email)    -> emails a login link AND a 6-digit code
 *   PJCC.verifyCode(email, c)  -> signs in with that code (the installed-app path)
 *   PJCC.claimCodename(name)   -> creates the profile row after first login
 *   PJCC.signOut()
 *   PJCC.saveScore(game, score, extras)  -> writes score (server if logged in,
 *                                           localStorage fallback if guest)
 *   PJCC.leaderboard(game, {scope:'all'|'daily', seed, limit})
 *   PJCC.onChange(fn)          -> called whenever auth state changes
 *
 * Load order on a page:
 *   <script src="/assets/js/pjcc-config.js"></script>
 *   <script src="/assets/js/pjcc-profile.js"></script>
 * ========================================================================== */
(function () {
  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  var cfg = window.PJCC_CONFIG || {};
  var configured =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    cfg.SUPABASE_URL.indexOf('YOUR_') === -1 &&
    cfg.SUPABASE_ANON_KEY.indexOf('YOUR_') === -1;

  var sb = null;            // supabase client
  var profile = null;       // cached profile row
  var listeners = [];

  // Avatar catalog: key -> emoji. Stored on profile.companion.avatar.
  // The operative's *face* is one of 8 free humans; the companion *pet* is a
  // separate slot (companion.pet) driven by the pet system in pjcc-companion.js.
  // SHOP avatars are bought with credits.
  var AVATARS = {
    'human-1': '🕵️', 'human-2': '🥷', 'human-3': '🤵', 'human-4': '👸',
    'human-5': '🤴', 'human-6': '🧙', 'human-7': '👮', 'human-8': '🧑',
    // legacy free animals (now pets) kept so older profiles still render a face
    'dog-1': '🐕', 'dog-2': '🐩', 'dog-3': '🦮', 'cat-1': '🐈', 'bird-1': '🦜',
    // Quartermaster — chess set
    'pc-knight': '♞', 'pc-bishop': '♝', 'pc-rook': '♜', 'pc-queen': '♛', 'pc-king': '♚',
    // Quartermaster — field specials
    'sp-fox': '🦊', 'sp-owl': '🦉', 'sp-wolf': '🐺', 'sp-eagle': '🦅', 'sp-dragon': '🐉',
    // Quartermaster — the long shelf (2026-07-27): things worth saving for
    'sp-tiger': '🐯', 'sp-orca': '🐋', 'sp-raven': '🐦‍⬛', 'sp-lion': '🦁',
    'sp-phoenix': '🔥', 'sp-kraken': '🦑', 'sp-unicorn': '🦄', 'sp-ghost': '👻',
    'sp-robot': '🤖', 'sp-crown': '👑',
    // Quartermaster — the 2026-08-03 restock (Nate: "make a bunch of new collectibles")
    'sp-bear': '🐻', 'sp-otter': '🦦', 'sp-stag': '🦌', 'sp-octopus': '🐙',
    'sp-shark': '🦈', 'sp-tortoise': '🐢', 'sp-bat': '🦇', 'sp-moon': '🌙',
    // EARNED — no shop sells these and the altar never hands them out (see EARNED below)
    'ea-compass': '🧭', 'ea-scope': '🔭', 'ea-key': '🗝️', 'ea-laurel': '🏅'
  };
  var HUMAN_LABELS = {
    'human-1': 'The Sleuth', 'human-2': 'The Shadow', 'human-3': 'The Agent', 'human-4': 'The Princess',
    'human-5': 'The Heir', 'human-6': 'The Strategist', 'human-7': 'The Warden', 'human-8': 'The Recruit',
    // the long shelf (names are mine — veto open)
    'sp-tiger': 'The Tiger', 'sp-orca': 'The Orca', 'sp-raven': 'The Raven', 'sp-lion': 'The Lion',
    'sp-ghost': 'The Ghost', 'sp-robot': 'The Machine', 'sp-kraken': 'The Kraken',
    'sp-unicorn': 'The Unicorn', 'sp-phoenix': 'The Phoenix', 'sp-crown': 'The Crown',
    // the 2026-08-03 restock — names are mine, veto open, same as the shelf above
    'sp-bear': 'The Bear', 'sp-otter': 'The Otter', 'sp-stag': 'The Stag',
    'sp-octopus': 'The Octopus', 'sp-shark': 'The Shark', 'sp-tortoise': 'The Tortoise',
    'sp-bat': 'The Nightwing', 'sp-moon': 'The Moon',
    'ea-compass': 'The Compass', 'ea-scope': 'The Long View', 'ea-key': 'The Key',
    'ea-laurel': 'The Laurel'
  };
  var AVATAR_FREE = ['human-1', 'human-2', 'human-3', 'human-4', 'human-5', 'human-6', 'human-7', 'human-8'];
  /* PRICES (re-set 2026-07-27 — Nate: "just by gambling everything I had a few times, I
     got like 600 credits and bought the entire store, so let's modify prices (make them
     more expensive) and add some new items").

     The old shelf topped out at 50 and totalled 280 credits — a single lucky night at the
     altar cleared it. It ran 25 → 400 and totalled well over 2,000, so the top of the
     shelf is something you save toward across many sessions. Ten new faces extend the
     climb past the dragon. (The altar's own economy was cut back in the same pass; between
     the two, credits are earned by playing again.)
     ⚠ THE NUMBERS IN THIS PARAGRAPH ARE SUPERSEDED — see the 2026-08-04 re-tier below. */
  /* ⚑ RE-TIERED 2026-08-04 — Nate: "let's re-tier the cost of things and make things more
     expensive. By a lot."

     THE WHOLE SHELF WENT UP 3x (5,900 → 17,715 credits across 42 buyable items) and the
     rise is PROGRESSIVE, not a flat multiplier: 2.4x at the cheap end, 2.75x at the median,
     3.5x at the ceiling. That shape is the point. A flat 3x would have moved the first
     purchase — the one that teaches a new player that credits buy things at all — from 13
     plays out to 38, which taxes the beginner hardest to slow down the collector. Stretching
     the TOP instead leaves the on-ramp short and makes the far end a genuine destination:
     the Crown is a 1,400-credit object now, and nobody arrives at it by accident.

     ⚠ THE BAND FLOORS MOVED WITH THE PRICES (see BANDS below). Rarity is derived from
     price, so raising prices without raising floors would have promoted the entire
     catalogue — every face Ultra-Rare, every stake 65+, and the six bands collapsed into
     two. The spread was re-derived, not eyeballed: 2/9/16/12/16/7 → 3/10/14/11/16/8. */
  var AVATAR_SHOP = [
    { key: 'pc-knight', price: 60 }, { key: 'pc-bishop', price: 60 }, { key: 'pc-rook', price: 100 },
    { key: 'pc-queen', price: 190 }, { key: 'pc-king', price: 320 },
    { key: 'sp-fox', price: 210 }, { key: 'sp-owl', price: 210 }, { key: 'sp-wolf', price: 250 },
    { key: 'sp-eagle', price: 250 }, { key: 'sp-dragon', price: 400 },
    // the long shelf — new 2026-07-27
    { key: 'sp-tiger', price: 330 }, { key: 'sp-orca', price: 360 },
    { key: 'sp-raven', price: 440 }, { key: 'sp-lion', price: 510 },
    { key: 'sp-ghost', price: 580 }, { key: 'sp-robot', price: 660 },
    { key: 'sp-kraken', price: 770 }, { key: 'sp-unicorn', price: 920 },
    { key: 'sp-phoenix', price: 1100 }, { key: 'sp-crown', price: 1400 },
    /* THE RESTOCK, 2026-08-03 (Nate: "make a bunch of new collectibles (public-facing,
       locked, and only-available-through-gambit"). These are the PUBLIC-FACING half —
       ordinary stock, bought with credits, visible to a stranger who has never signed in.
       Priced to fill the GAPS in the existing shelf rather than to extend it: the old list
       had one Uncommon and a long thin tail, so a new player had almost nothing to aim at
       between their first 25-credit face and a 140-credit dragon. Six of these eight land
       in the bottom three bands on purpose. The ceiling stays the 400-credit Crown — the
       top of the shelf is a place you arrive, and moving it would move it for everyone
       who already got there. */
    { key: 'sp-bear', price: 150 }, { key: 'sp-otter', price: 165 },
    { key: 'sp-stag', price: 265 }, { key: 'sp-octopus', price: 375 },
    { key: 'sp-shark', price: 490 }, { key: 'sp-tortoise', price: 620 },
    { key: 'sp-bat', price: 810 }, { key: 'sp-moon', price: 1000 }
  ];

  /* ── THE VAULT — collectables that are NOT for sale (2026-07-27) ──────────────
     Nate: "maybe donating one, you have a chance to get a DIFFERENT collectable
     (even ones that AREN'T in the shop)."

     These have no price and appear in no shop. The ONLY way to hold one is to lay
     something down at the Gambit altar and have the board hand it back. They flow
     through the normal plumbing — avatars land in companion.owned (so setAvatar
     accepts them), titles carry rule:'vault', themes stay out of THEME_SHOP — so
     the Dossier and the Quartermaster can equip them with no special-casing.

     `value` is credits-equivalent, used by the altar's courage meter if one is ever
     laid back down. Names are mine and Nate's veto is open. ─────────────────── */
  /* ⚠ THE VAULT DOUBLED 2026-08-03 — six more, and that is a real economy change even
     though it is only data. The altar draws a boon from an unowned pool, so every piece
     added here makes any ONE of them rarer. That dilution is deliberate and it is HALF of
     "make the gambit a little more difficult to win": the credit wheel got harder by
     numbers (see the-gambit/index.html), and the Vault got harder by arithmetic. The boon
     RATE was left alone precisely because this list grew — doing both would have made the
     Vault unfinishable rather than harder. */
  var VAULT_AVATARS = { 'vt-comet': '☄️', 'vt-candle': '🕯️', 'vt-mask': '🎭',
    'vt-hourglass': '⏳', 'vt-anchor': '⚓', 'vt-thread': '🧵' };
  /* ⚑ VALUES RE-TIERED 2026-08-04 with the shop (x2.9). These are credits-EQUIVALENT, not
     prices — nothing here is for sale — but they are the number the band lookup reads, so
     leaving them behind while the shop tripled would have quietly DEMOTED the whole Vault
     to Common/Uncommon and dropped what a Vault piece stakes at the altar. The Vault is
     meant to sit mid-shelf against the catalogue it lives in; that is a RATIO, so it has to
     move whenever the catalogue does. */
  var VAULT = [
    { kind: 'avatar', key: 'vt-comet',  value: 760, label: 'The Comet' },
    { kind: 'avatar', key: 'vt-candle', value: 580, label: 'The Altar Keeper' },
    { kind: 'avatar', key: 'vt-mask',   value: 640, label: 'The Understudy' },
    { kind: 'title',  key: 'letgo',     value: 580, label: 'One Who Let Go' },
    { kind: 'title',  key: 'openhand',  value: 430, label: 'Open Hand' },
    { kind: 'theme',  key: 'ember',     value: 520, label: 'Altar Ember' },
    { kind: 'theme',  key: 'hollow',    value: 400, label: 'Empty Hands' },
    // 2026-08-03 — names are mine, veto open. Each one is named for something the altar
    // does, because that is the only place they come from.
    { kind: 'avatar', key: 'vt-hourglass', value: 700, label: 'The Hourglass' },
    { kind: 'avatar', key: 'vt-anchor',    value: 550, label: 'The Anchor' },
    { kind: 'avatar', key: 'vt-thread',    value: 610, label: 'The Long Thread' },
    { kind: 'title',  key: 'remembered',   value: 670, label: 'Remembered by the Board' },
    { kind: 'theme',  key: 'nothing',      value: 490, label: 'Nothing Comes Back' },
    { kind: 'theme',  key: 'sixdays',      value: 460, label: 'Six Days' }
  ];
  Object.keys(VAULT_AVATARS).forEach(function (k) { AVATARS[k] = VAULT_AVATARS[k]; });
  function vaultEntry(kind, key) {
    for (var i = 0; i < VAULT.length; i++) if (VAULT[i].kind === kind && VAULT[i].key === key) return VAULT[i];
    return null;
  }

  /* ══ EARNED — the LOCKED class (2026-08-03) ══════════════════════════════════════
     Nate asked for collectables in three flavors: "public-facing, locked, and
     only-available-through-gambit". The shop is the first, the Vault is the third, and
     this is the middle one — the pieces you cannot buy at any price and cannot win at the
     altar. You do the thing, and then it is yours.

     WHY "LOCKED" IS THE INTERESTING ONE. A shop item is a number you clear. A Vault item
     is luck. These are the only collectables on the site that are a STATEMENT about what
     you did, which is why the collection page shows their requirement in full rather than
     hiding them behind a silhouette: an unreachable mystery is a chore, but a named
     target is a reason to go play something.

     ⚠ THEY CANNOT BE SOLD AND CANNOT BE LAID ON THE ALTAR, and that is not flavor — it
     closes a printer. The requirement stays true forever, so a piece that could be burned
     could also be RE-CLAIMED, and burn → re-claim → burn is an infinite credit faucet with
     a trophy painted on it. The closure is structural rather than a rule anyone has to
     remember: ownedCollectables() is the list the altar and sellValue() both read, and
     nothing here is in it. Two doors, one lock.

     `rule` vocabulary — deliberately the same three shapes the TITLES map already uses,
     plus one new one:
       ach:<key>    an achievement from ACHIEVEMENTS below
       plays:<n>    total rounds played
       found:<lsk>  a localStorage flag — the hidden-board eggs and the Chess City stamp.
                    Local by design: they are found in a BROWSER, and gating a discovery
                    behind an account would mean a stranger who found one gets nothing.
                    They find it signed out, and claim it whenever they sign in.

     ⚠ NO SERVER REFEREE, same as every other cosmetic here. Someone who wants a face badly
     enough to edit their own localStorage was always going to be able to edit their own
     credits; the honest position is that this is a display case, not a ranking. */
  /* ⚑ VALUES RE-TIERED 2026-08-04 with the shop (x2.9), same reasoning as the Vault above.
     These can be neither bought nor sold nor staked, so the number does exactly one job:
     it puts the piece in a band on the collection page. Left behind, "Citizen of Chess
     City" — a thousand clean puzzles — would have ranked below a face you can buy in an
     afternoon. */
  var EARNED = [
    { kind: 'avatar', key: 'ea-laurel',  value: 820, label: 'The Laurel',
      rule: 'ach:crowned',       how: 'Clear all ten floors of the Gauntlet' },
    { kind: 'avatar', key: 'ea-scope',   value: 580, label: 'The Long View',
      rule: 'ach:tactician',     how: 'Solve 25 puzzles in the Puzzle Room' },
    { kind: 'avatar', key: 'ea-compass', value: 460, label: 'The Compass',
      rule: 'ach:globetrotter',  how: 'Play every game at least once' },
    { kind: 'theme',  key: 'ledger',     value: 350, label: 'Field Ledger',
      rule: 'plays:50',          how: 'Play 50 rounds across the arcade' },
    /* ⛑⛑ "THE FINDER" AND "THE KEY" CAME OUT WITH THE HIDDEN BOARDS — 2026-08-25.
       Nate: *"Just remove the chessboard collectables."* They were the only two EARNED pieces
       whose unlock condition was an egg that no longer exists, so leaving them would have put
       two permanently unobtainable items in a 62-piece set — a collection you cannot finish is
       worse than a smaller one.
       ⭐ STUBBING THE RULE WAS THE WRONG FIRST INSTINCT, AND THE GATE SAID SO. I first replaced
       both `rule:` strings with a placeholder, which left the entries in the set and crashed
       tests/collection.check.js on `undefined.rule`. The check counts `found:` rules and then
       reads each one — so a half-removal is louder than a whole one, which is the behavior you
       want from a gate. Delete the entry, not its condition.
       ⚠ THE COUNT MOVED: 62 → 60 collectables. Anything that states the total in prose needs to
       move with it — [[collection-and-hidden-boards]]. */
    { kind: 'title',  key: 'citizen',    value: 1050, label: 'Citizen of Chess City',
      rule: 'found:pjcc.fork.chesscity.v1', how: 'Walk all 1,000 puzzles to Chess City' }
  ];
  EARNED.forEach(function (e) { if (e.kind === 'avatar' && !AVATARS[e.key]) AVATARS[e.key] = '★'; });
  function earnedEntry(kind, key) {
    for (var i = 0; i < EARNED.length; i++) if (EARNED[i].kind === kind && EARNED[i].key === key) return EARNED[i];
    return null;
  }

  /* ══ THE SIX BANDS (2026-07-29) ═══════════════════════════════════════════════
     Nate: "Let's value the collectables into six categories of value, (up to
     'ultra-rare' or 'ultra-valuable, etc)."

     Rarity is DERIVED from price, never hand-assigned. One number already ranks the
     whole catalogue and it is the number the player has been staring at all along; a
     second, hand-kept rarity field would drift away from it the first time a price
     changed, and then two things on the same card would disagree. Add an item at a
     price and it lands in the right band with no further thought.

     WHY THIS EXISTS AT ALL: the altar used to weigh a collectable by its raw credit
     price, so laying down the 400-credit Crown put 400 credits in the pot and paid out
     against that — Nate: "the collectables fetch WAY too big a reward". `stake` is the
     fix. It is what the BOARD counts a piece as worth, which is deliberately a fraction
     of what a shop charges (a Legendary stakes 90 against a 400 sticker). The altar is
     not a pawn shop; it weighs the courage of the gesture, not the receipt.

     ⚠ LEGENDARY IS THE TOP BAND, ULTRA-RARE IS FIFTH — swapped 2026-08-03 (Nate: "Switch
     around the designations 'legendary' and 'ultra-rare'"). What moved is the DESIGNATION:
     the name, its glyph and its color traveled together to the other row, while `min` and
     `stake` stayed where they were, because those two are the LADDER and the ladder didn't
     change. Doing it that way is why `.band-legendary` / `.band-ultra` in the-gambit needed
     no edit at all — the CSS keys color to the name, and each name took its color with it.
     Anything that hard-codes 'ultra' as the ceiling is now wrong; compare `tier` instead.

     THE VAULT GETS A FREE BAND. Its pieces carry credit values in the same range as the
     mid shop shelf, but no shop stocks them and only the altar has ever handed one out —
     that is rarity by definition, and pricing them by their number alone would rank a
     Vault piece below a face anyone can buy on a good week.

     ⚠ `min` is a floor, and the list must stay ASCENDING — the lookup takes the LAST
     band whose floor the value clears. Names are mine; Nate's veto is open. ═══════ */
  /* ⚑ FLOORS RE-TIERED 2026-08-04 — they had to move, and this is the trap worth naming:
     RARITY IS DERIVED FROM PRICE, SO A PRICE PASS IS A RARITY PASS WHETHER YOU MEANT IT OR
     NOT. Tripling the shelf against floors of 0/40/80/150/220/320 would have made the
     cheapest face on the site Uncommon and almost everything else Legendary — six bands
     collapsed to two, and every collectable suddenly staking 65-90 at the altar, which is
     a payout change nobody asked for hiding inside a price change.

     The floors moved by the same ~2.8x the shelf did, and the resulting spread was
     RE-DERIVED from the real catalogue rather than assumed: 2/9/16/12/16/7 → 3/10/14/11/16/8
     across all 62 collectables. Same shape, same ladder, three times the money.

     THE STAKES DELIBERATELY DID NOT MOVE. What a piece is worth to the ALTAR is what the
     board counts the gesture as, and that was never pegged to the receipt — a Legendary
     staked a fraction of its price before and stakes a smaller fraction now. Raising stakes
     alongside prices would have quietly RAISED altar payouts in the same pass Nate asked
     for them to come down. */
  var BANDS = [
    { key: 'common',    label: 'Common',     min: 0,   glyph: '◦', stake: 10, color: '#9aa3b8' },
    { key: 'uncommon',  label: 'Uncommon',   min: 110, glyph: '◇', stake: 18, color: '#7fd4a8' },
    { key: 'rare',      label: 'Rare',       min: 230, glyph: '◆', stake: 30, color: '#56d0ff' },
    { key: 'veryrare',  label: 'Very Rare',  min: 430, glyph: '✦', stake: 45, color: '#b98fff' },
    { key: 'ultra',     label: 'Ultra-Rare', min: 640, glyph: '❈', stake: 65, color: '#ff8fd0' },
    { key: 'legendary', label: 'Legendary',  min: 960, glyph: '✶', stake: 90, color: '#ffb066' }
  ];
  /* ⚠ Attached to PJCC down in the object literal, NOT here — `var PJCC` is hoisted but
     still undefined at this point in the file, so `PJCC.BANDS = …` up here throws.
     `tier` is 1-6 and is the thing to compare; `key`/`label` are for display. Pass the
     collectable's own `vault` flag — see the free-band note above. */
  function rarityOf(value, vault) {
    var i = 0;
    for (var k = 0; k < BANDS.length; k++) if ((value || 0) >= BANDS[k].min) i = k;
    if (vault) i = Math.min(BANDS.length - 1, i + 1);
    var b = BANDS[i];
    return { tier: i + 1, key: b.key, label: b.label, glyph: b.glyph, stake: b.stake, color: b.color };
  }

  /* Rank ladder by total credits. Each rank unredacts a Subject Zero fragment.
     ⚠ INDEX-ALIGNED WITH `CLEARANCE` BELOW — same length, same order, same names. That
     alignment is not decoration, it is what `clearance()` reads to floor a player's rung
     at whatever their credits already earned them. Add a rung to one of these arrays and
     you MUST add it to the other, or every player above the insertion point silently
     wears the wrong name.

     ⚑ THE THRESHOLDS WENT UP ~13x, 2026-08-13 (Nate's call, picked off a costed ladder).
     Old top was 1,200 credits, which the shop's own numbers had long since made trivial —
     the shelf totals 17,715 across 42 items, so the ladder's summit cost less than four
     mid-shelf purchases. The top rung now costs about the whole shop on credits alone,
     which is the point: it gates a page ([[gauntlet-secret-floors]]-style), so the credit
     road to it should be the legend and the RATING road the one people actually walk.

     ⚠ THIS IS THE ONE TIGHTENING THIS ECONOMY HAS DONE, and it is worth naming rather
     than burying. The standing rule is that loosening later is a gift and tightening is a
     takeaway (see the sell-back economy note), and raising these mins does move a
     credit-floored player down a rung. It was asked for deliberately, with the demotion
     stated up front, because a top rung nobody can fail to reach is not a clearance. If
     it ever needs softening, soften it — that direction is free. */
  var RANKS = [
    { name: 'Recruit',          min: 0,     frag: 'SUBJECT ZERO — file sealed. You have just enough clearance to know it exists.' },
    { name: 'Operative',        min: 75,    frag: 'Fragment 1: The first dog through the portal was not the first attempt.' },
    { name: 'Field Agent',      min: 250,   frag: 'Fragment 2: The Checker Town mine shafts were dug looking for something — not for ore.' },
    { name: 'Cipher Clearance', min: 600,   frag: 'Fragment 3: "Princess" is a designation, not a name. There were others before her.' },
    { name: 'Theta Clearance',  min: 1400,  frag: 'Fragment 4: Two names were signed onto the same intake roll the day the Expanse Branch opened. Only one of them was a person.' },
    { name: 'Delta Clearance',  min: 3000,  frag: 'Fragment 5: The Rival\'s family was relocated to Chess City the same week Subject Zero went quiet.' },
    { name: 'Sigma Clearance',  min: 6000,  frag: 'Fragment 6: The partnership ran four and a half years and produced no incident reports. That is not a clean record. That is a missing one.' },
    { name: 'Omega Clearance',  min: 10500, frag: 'Fragment 7: The ferry to Shogi Island only runs for those who already know the way back.' },
    { name: 'Alpine Clearance', min: 16000, frag: 'Fragment 8: You were never solving the puzzles. The puzzles were measuring you.' }
  ];

  /* ══ CLEARANCE — ONE LADDER, ONE PIP, EVERYWHERE (2026-08-03) ═════════════════════
     Priority #3: "Wire the PJCC Rating → the Clearance ladder (RECRUIT → DELTA → … →
     OMEGA) so your codename wears a clearance pip that climbs, and the quiz game, the
     tables and the Profile finally speak one language. The clearance pip alone is the
     contained first slice."

     THE PROBLEM IT FIXES. The site had TWO ladders wearing the same word. `RANKS` above
     is a CREDIT ladder that hands out Subject Zero fragments and calls its rungs "Delta
     Clearance" and "Omega Clearance"; the Park Tables run a real chess Elo (`pjcc_rating`)
     that nothing outside the tables ever mentioned. So "clearance" meant *how much have
     you played* in one place and nothing at all in the other, and a strong player who had
     not ground credits wore RECRUIT forever.

     ⚠ IT IS THE MAX OF BOTH, AND THAT IS THE WHOLE DESIGN. Clearance is what your CHESS
     RATING earns you, **floored by what your credits already earned you**. Reading it as
     rating-only would have demoted every existing player the day it shipped — someone at
     Delta on 300 credits would have woken up a Recruit — and this economy's standing rule
     is that loosening later is a gift and tightening later is a takeaway
     ([[sell-back-economy]]). Nobody moves down. The rating simply becomes a second, faster
     road up the same ladder, which is what makes it one language instead of two.

     ⚠ THE FRAGMENTS DO NOT MOVE. `rankFor()` is untouched and still keyed to credits, so
     every Subject Zero fragment anyone has unlocked stays unlocked and unlocks the same
     way. Clearance is a DISPLAY rank; the rank ladder is a REWARD ladder. They share
     names on purpose and share nothing else.

     THE THRESHOLDS. 250 is where every operative starts at the Park Tables, so RECRUIT
     has to hold the whole opening stretch or the pip would be a participation badge.
     The top rung is deliberately out past where any of these bots live — it should be
     something you hear about before you see it.

     ⚑ NINE RUNGS SINCE 2026-08-13, AND THE TOP ONE IS A DOOR. Two were added in the
     middle (THETA under Delta, SIGMA over it) and the summit was renamed from "Above
     Omega" to ALPINE CLEARANCE, which is the rung `/characters/alpine/` checks before it
     opens his file. That is the first time a clearance level gates a PAGE rather than
     just decorating a name, and it is the reason the ladder needed more room: a
     seven-rung climb whose last step was also the only locked door made the whole middle
     of the ladder feel like waiting.

     ⚠ THE RATING THRESHOLDS OF THE SEVEN ORIGINAL RUNGS DID NOT MOVE — 0/400/600/800 and
     1000/1300/1600 are exactly where they were, and the two new rungs were fitted into
     the gaps (900, 1150). So no existing player's rating-derived rung changed NAME or
     changed HANDS; they only gained two stops between the ones they knew. The credit
     mins are the half that moved, and that is documented on RANKS above.

     ⚠ ADDING A RUNG IS A FOUR-FILE CHANGE. This array, `RANKS` above (index-aligned),
     `.pip-N` in _sass/_pjcc-14-profile.scss (an unstyled pip is invisible, not obviously
     broken), and tests/ladders.check.js. The legend on /leaderboards/ and the `hint`
     below both DERIVE their counts from here, so those two look after themselves. */
  var CLEARANCE = [
    { level: 1, name: 'Recruit',          pip: '·',  rating: 0 },
    { level: 2, name: 'Operative',        pip: '◦',  rating: 400 },
    { level: 3, name: 'Field Agent',      pip: '◇',  rating: 600 },
    { level: 4, name: 'Cipher Clearance', pip: '◆',  rating: 800 },
    { level: 5, name: 'Theta Clearance',  pip: '✧',  rating: 900 },
    { level: 6, name: 'Delta Clearance',  pip: '✦',  rating: 1000 },
    { level: 7, name: 'Sigma Clearance',  pip: '✶',  rating: 1150 },
    { level: 8, name: 'Omega Clearance',  pip: '✷',  rating: 1300 },
    { level: 9, name: 'Alpine Clearance', pip: '❈',  rating: 1600 }
  ];

  /* ══ AURA — AN OPERATIVE'S PERSONAL COLOR ═══════════════════════════════════════
     Chosen in the Identity Forge, stored at `companion.look.aura`, and drawn as the glow
     ring on the face art.

     ⚑ MOVED HERE FROM pjcc-creator.js ON 2026-08-13, and the move is the point. The Forge
     was the only file that knew these hex values, which was fine for exactly as
     long as the Forge was the only thing that drew them. The Park Tables VS streaks need
     the same colors on a page the Forge is not loaded on — and the alternative, a second
     copy of the palette in the room, is a palette that drifts the first time a color is
     tuned ([[dead-game-links-trap]]). One map, read by both.

     ⚠ pjcc-creator.js now READS `PJCC.AURAS` and keeps no copy. It loads only on
     /dossier/, after this file, so the dependency is satisfied by document order — the
     same rule that already governs face-art-before-creator on that page. */
  /* ⛑ A THIRTEENTH COLOR, 2026-08-20 — Nate: *"make the Dad character's aura turquoise to
     match the frequency of love and wisdom"*. Turquoise is the one hue this palette did not
     have: `ice` is a pale sky, `azure` a mid sky and `jade` a mint green, and turquoise sits
     in the gap between the last two — green-blue rather than blue or green. Nothing here
     could stand in for it, so the palette grew rather than the meaning bending to fit.
     ⚠ ADDING ONE IS ADDITIVE EVERYWHERE. The Forge draws its swatches from AURA_ORDER, so
     players get the new choice for free; nothing reads a hard count except one test, which
     names the number on purpose so a DELETION is caught too. */
  var AURAS = {
    gold:    '#F5C518', jade:   '#6bffb8', crimson: '#ff6b6b', sakura: '#ff8fd0',
    azure:   '#6bbfff', violet: '#b07bff', amber:   '#ff9f43', mono:   '#cdbcf2',
    emerald: '#2ecc71', ice:    '#a8e6ff', rose:    '#ff6b9d', lime:   '#c9ff6b',
    turquoise: '#40e0d0'
  };
  var AURA_ORDER = ['gold','jade','crimson','sakura','azure','violet','amber','mono','emerald','ice','rose','lime','turquoise'];

  /* ══ WHAT A COLOR MEANS, AND WHO YOU WIN IT FROM ══════════════════════════════
     2026-08-20, Nate: *"I love the 'earn aura' thing. Everyone except Auston since she is
     adaptive."*

     An aura used to be a preference. Beat one of the park regulars CLEANLY — a full star,
     no analysis board and no takeback — and their color becomes yours to wear, so it turns
     into a receipt: "I play in Robert's violet" means you outplayed him with nothing but
     the board.

     ⭐ A NAMED FREQUENCY IS ONE THAT BELONGS TO SOMEBODY. The nine bench colors carry a
     word; the other four (mono, azure, rose, lime) deliberately do not. They are free, they
     are unclaimed, and they are yours to mean whatever you like — which is also why they
     are the four a brand-new player picks from. The words are HIS.

     ⛑⛑ THEY CAME OFF ON 2026-08-20 AND WENT BACK ON THE SAME DAY, at his word both times:
     *"I don't want the actual text descriptions"*, then *"I take it back — I like those
     descriptions you had, can you bring them back?"* Recorded because the round trip is the
     useful part, not because anybody was wrong: **a reading he is weighing is cheaper to
     put back than to argue about.** They also still live in `private/_pjcc/notes.md`, which
     is why restoring them cost nothing — the canon file was written the moment they were
     deleted. [[text-changes-need-approval]]

     ⚠ WHAT THE ROUND TRIP PROVED, AND IT IS WORTH KEEPING: `word` and `from` are NOT the
     same feature. `from` is the MECHANIC — it is what auraUnlocked() reads and the whole of
     what makes a color a prize. `word` is a description OF it. One can come and go without
     the other moving, which is exactly what happened twice in a day.

     ⚠⚠ AUSTON'S CRIMSON IS NAMED BUT NEVER EARNABLE, and that is his instruction, not an
     oversight: she is the ADAPTIVE seat, so "beat Auston cleanly" is not a fixed feat the
     way beating a 1400 is — she would have met you at your own level, which makes the win
     mean something different every time. `from: null` is what says so, and it leaves her
     color free for anyone.

     ⚠⚠ NOTHING WAS TAKEN AWAY. An aura already on a profile stays selectable forever — see
     the grandfather clause in auraUnlocked(). The miser rule cuts one way: loosening later
     is a gift, tightening is a takeaway ([[sell-back-economy]]), and eight colors vanishing
     out of somebody's Forge would be the worst kind. */
  var AURA_MEANING = {
    emerald:   { word: 'home',                        from: 'maxwell'  },
    amber:     { word: 'gladness',                    from: 'crockett' },
    ice:       { word: 'the kept word',               from: 'argus'    },
    jade:      { word: 'a dream carried for someone else', from: 'nate' },
    turquoise: { word: 'love and wisdom',             from: 'dad'      },
    violet:    { word: 'certainty',                   from: 'robert'   },
    sakura:    { word: 'the beginner\'s heart',       from: 'princess' },
    gold:      { word: 'appetite',                    from: 'ceo'      },
    crimson:   { word: 'nerve',                       from: null       },
    /* ⚑ THE TENTH COLOR, 2026-08-31 — the Elder Brother took a seat, and every bench seat
       has to hold a color `test:regulars` can price. Lime came out of the free four
       (mono/azure/rose stay unclaimed), so a brand-new player picks from three instead of
       four and one more color became winnable. That is the direction the miser rule allows:
       loosening later is a gift, tightening is a takeaway — and nobody wearing lime today
       loses it, because auraUnlocked() grandfathers whatever is already on a profile.
       ⚠⚠ THE WORD IS A PLACEHOLDER AND IT IS HIS TO REPLACE. Every other frequency here is
       Nate's own; this one is lifted out of the brothers' character file — *"away, undone,
       and (eventually) the long road back"* — precisely so that it is a quotation rather
       than an invention. [[text-changes-need-approval]] */
    lime:      { word: 'the road back',               from: 'brother'  }
  };

  /* The Park Tables keep the stars; this only READS them. Same key, same shape:
     { botId: { w: 'full'|'half'|'quarter', b: … } } */
  var PT_STARS_KEY = 'pjcc.pt.stars.v1';
  function ptStars() {
    try { var o = JSON.parse(localStorage.getItem(PT_STARS_KEY)); return (o && typeof o === 'object') ? o : {}; }
    catch (e) { return {}; }
  }
  /* ⚠ EITHER COLOR COUNTS. The star pair records which SIDE you won with; the aura asks a
     different question — did you beat them outright — and you only have to do that once. */
  function beatClean(botId) {
    var r = ptStars()[botId];
    return !!(r && (r.w === 'full' || r.b === 'full'));
  }
  /* ⭐ AND THE ACCOUNT CAN RAISE THEM, ON ANY PAGE. This lives here rather than in the Park
     Tables because the FORGE is where an earned aura is spent, and the Forge is on
     /dossier/ — a player who signs in on a new phone and goes straight to their identity
     must find their colors already unlocked, without having to visit the park first.
     pjcc-profile.js is the one file both pages load.
     ⚠ MERGE, NEVER REPLACE. Local can be the fresher copy (a win banked seconds ago while
     the write was still in flight), so each seat keeps its BEST star per color — the same
     rule awardStar() applies in the room. A restore that overwrote would be a downgrade
     wearing the word "restore". */
  var STAR_RANK = { quarter: 1, half: 2, full: 3 };
  function ptStarsMerge(remote) {
    if (!remote || typeof remote !== 'object') return false;
    var local = ptStars(), changed = false;
    for (var id in remote) {
      var r = remote[id]; if (!r || typeof r !== 'object') continue;
      var mine = local[id] || (local[id] = {});
      ['w', 'b'].forEach(function (c) {
        if (!r[c] || !STAR_RANK[r[c]]) return;
        if (!mine[c] || STAR_RANK[r[c]] > STAR_RANK[mine[c]]) { mine[c] = r[c]; changed = true; }
      });
    }
    if (changed) { try { localStorage.setItem(PT_STARS_KEY, JSON.stringify(local)); } catch (e) {} }
    return changed;
  }


  /* ══ YOUR BOOK — the Opening Trainer's repertoire, merged per field ══════════════
     `pjcc.trainer.book.v1` = { <variationId>: { known: 1, held: <elo> } }. It is EARNED
     progress, so it syncs, and it merges rather than replaces ([[everything-earned-syncs]]):

       · `known` is STICKY TRUE — you learned the line; that cannot un-happen.
       · `held` takes the MAX — the strongest opponent you have held it against, so a phone
         you last opened in July can never walk this morning's win backwards.

     ⭐ THE MERGE IS DIRECTION-INDEPENDENT, which is the property that actually matters and
     the one `test:trainer` asserts both ways: M(a,b) and M(b,a) must agree, or the two
     devices disagree about which of them is right and the loser loses real progress.
     ⚠ IT LIVES HERE RATHER THAN IN THE ROOM because /dossier/ draws the book and never loads
     the trainer — the same reason the Park-Table stars pull from this file. */
  var BOOK_KEY = 'pjcc.trainer.book.v1';
  function trainerBook() {
    try { var o = JSON.parse(localStorage.getItem(BOOK_KEY)); return (o && typeof o === 'object') ? o : {}; }
    catch (e) { return {}; }
  }
  function trainerBookMerge(remote) {
    if (!remote || typeof remote !== 'object') return false;
    var local = trainerBook(), changed = false, id;
    for (id in remote) {
      if (!remote.hasOwnProperty(id)) continue;
      var r = remote[id];
      if (!r || typeof r !== 'object') continue;
      var mine = local[id] || (local[id] = {});
      if (r.known && !mine.known) { mine.known = 1; changed = true; }
      var held = parseInt(r.held, 10) || 0;
      if (held > (mine.held || 0)) { mine.held = held; changed = true; }
    }
    if (changed) { try { localStorage.setItem(BOOK_KEY, JSON.stringify(local)); } catch (e) {} }
    return changed;
  }

  var PJCC = {
    enabled: !!configured,
    ready: null,
    AURAS: AURAS,
    AURA_ORDER: AURA_ORDER,
    /* the Dossier draws this; the trainer owns the writing */
    trainerBook: trainerBook,
    trainerBookMerge: trainerBookMerge,
    AURA_MEANING: AURA_MEANING,
    /* the word under a swatch, or '' for the four that belong to nobody */
    auraWord: function (key) { return (AURA_MEANING[key] && AURA_MEANING[key].word) || ''; },
    /* which regular you take it from, or null if it was never theirs to give */
    auraFrom: function (key) { return (AURA_MEANING[key] && AURA_MEANING[key].from) || null; },
    ptStars: ptStars,
    beatClean: beatClean,
    /* ⚠⚠ THE GRANDFATHER CLAUSE IS THE WHOLE REASON THIS TAKES A PROFILE. Eight colors
       became earnable on 2026-08-20, and some of them were already on somebody's operative.
       An aura you are WEARING is unlocked whatever the stars say — a feature that reaches
       into a saved identity and confiscates part of it is not a feature.
       ⚠ It also fails OPEN when it cannot tell: no meaning entry means a free color. */
    auraUnlocked: function (key, prof) {
      var from = (AURA_MEANING[key] && AURA_MEANING[key].from) || null;
      if (!from) return true;                                  // free, or Auston's
      if (beatClean(from)) return true;                        // won it
      var look = prof && prof.companion ? (prof.companion.look || null) : null;
      if (look && look.aura === key) return true;              // already wearing it
      /* ⚠ AND THE LOCAL LOOK COUNTS TOO, not only the account's. The Forge saves to
         `pjcc.identity.v1` and works signed out — a guest who picked violet in June is
         wearing violet, and an account row is not the only place that can be true. */
      try { if (JSON.parse(localStorage.getItem('pjcc.identity.v1') || '{}').op.aura === key) return true; }
      catch (e) {}
      return false;
    },
    /* Takes whatever you happen to be holding — a profile row, a `look`, or a bare key —
       and returns a hex color. Never returns null: an operative with no aura yet still has
       to be drawable, and `mono` is the neutral the site uses for "no color chosen".
       ⚠ `mono`, not gold. Gold is the CTA color, and defaulting an unset identity to it
       would put the site's one action color on every stranger. */
    auraColor: function (x) {
      if (!x) return AURAS.mono;
      if (typeof x === 'string') return AURAS[x] || AURAS.mono;
      var look = x.companion ? (x.companion.look || null) : x;   // profile → look
      var key = look && look.aura;
      return AURAS[key] || AURAS.mono;
    },
    AVATARS: AVATARS,
    AVATAR_ORDER: AVATAR_FREE,
    AVATAR_FREE: AVATAR_FREE,
    AVATAR_SHOP: AVATAR_SHOP,
    HUMAN_LABELS: HUMAN_LABELS,
    RANKS: RANKS,
    BANDS: BANDS,
    rarity: rarityOf,
    currentUser: function () { return sb ? (sb.auth.__user || null) : null; },
    // The raw Supabase client, for modules with their own tables (pjcc-match.js /
    // the Park Tables). Null until init — callers await PJCC.ready first.
    db: function () { return sb || null; },
    getProfile: function () { return profile; },
    avatarEmoji: function (prof) {
      // A face built in the Identity Forge (companion.look) wins site-wide, so
      // the operative you created shows in the nav, leaderboards and share card.
      var look = prof && prof.companion && prof.companion.look;
      if (look && look.glyph) return look.glyph;
      var key = prof && prof.companion && prof.companion.avatar;
      return AVATARS[key] || AVATARS['human-1'];
    },
    /* THE SAME PERSON, WHEREVER MARKUP IS ALLOWED (2026-08-03). The operative became a
       DRAWN face that day (pjcc-face-art.js) so that eye color could exist at all — and a
       drawing cannot go everywhere an emoji went. `dossier.md`'s share card paints the
       avatar with `ctx.fillText` onto a canvas, and a cached copy is kept in localStorage
       as a string; both need a character, not an element. So there are two accessors and
       the split is by what the SURFACE can hold, not by what the look is:

           avatarEmoji(prof)   always a text glyph   → canvas, storage
           avatarMarkup(prof)  the drawn face        → the nav, the boards, the dossier

       Falls back to the emoji whenever pjcc-face-art.js is not on the page, so a surface
       that forgets to load it degrades to what it showed yesterday. */
    /* ⛑⛑ `.avatar()`, NOT `.svg()` — 2026-08-25. Nate: *"I don't see my headwear or eye
       color change."* This called `svg()`, which is the FACE. The hat and the emblem were
       composited only by the Forge, out of tables only the Forge could see, so every surface
       that goes through here — the nav, the leaderboards, the gift card, the follow rows —
       drew a perfectly correct head with nothing on it. The tables moved to pjcc-face-art.js
       and `avatar()` returns the whole character, self-contained.
       ⚠ `avatar()` FALLS BACK TO `svg()` for a hatless look, so a character wearing nothing
       renders byte-identically to yesterday. Only people with headwear see a change. */
    avatarMarkup: function (prof) {
      var c = prof && prof.companion;
      var look = c && c.look;
      if (look && window.PJCCFaceArt && (look.hair || look.base)) {
        try {
          var A = window.PJCCFaceArt;
          /* ⭐ THE COMPANION RIDES ALONG — 2026-08-25, his ask. Read off the SAME profile the
             face is, so a surface that shows your character shows your dog without being told
             about dogs. No pet → null → the avatar is byte-identical to before.
             ⛑ IT ALL SYNCS NOW (2026-08-25). This note used to say the opposite — only the
             SPECIES reached the account — and Nate's answer was the right one: *"Of course the
             companion should sync across all devices… every feature, stat, progress, and
             collectable is meant to be synced."* `companion.petLook` carries the coat, eye and
             nose now, written beside the face by the Forge's own debounce.
             ⚠ THE ACCOUNT IS READ FIRST, LOCAL IS THE FALLBACK, and that order is deliberate:
             this function runs on surfaces the Forge never loaded (leaderboards, the gift
             card, a game page), where `pjcc.identity.v1` may be a stale copy from a device
             that has not synced yet. The profile is the shared truth; local is what a
             signed-out visitor has instead. */
          var pl = null, ls = {};
          try { ls = JSON.parse(localStorage.getItem('pjcc.identity.v1') || '{}') || {}; } catch (e) {}
          try { pl = c.petLook || ls.pet; } catch (e) {}
          /* ⛑⛑ THE SPECIES IS RESOLVED, NOT READ — 2026-08-25. `c.pet` is written ONLY by
             `PJCC.setPet()`, which fires from the Den's species PICKER — so anybody who never
             opened that picker had no `companion.pet` at all, and this returned null and drew
             no dog. The local save file has had a default of `dog` since the Den shipped; the
             account simply never heard about it. **A default that lives on only one side of a
             sync is not a default.**
             ⚠ ACCOUNT → LOCAL → 'dog', in that order, so a device that has never opened the
             Den still shows the companion the account chose. */
          var showPet = c.petOnAvatar !== false;
          var species = c.pet || (petLocal() || {}).pet || 'dog';
          /* ⭐ AND OFF IS A REAL CHOICE (his: "You can choose NO COMPANION too"). It is a
             separate flag rather than a `none` species on purpose: the Den is a whole feature
             — bond, feeding, cosmetics — and hiding the dog from your avatar must not delete
             the dog. `!== false` so the default is SHOWN and an old profile with no flag is
             not silently opted out. */
          var pet = showPet ? {
            species: species,
            coat: (pl && pl.coat) || 'natural',
            eye:  (pl && pl.eye)  || 'brown',
            nose: (pl && pl.nose) || 'black'
          } : null;
          return A.avatar ? A.avatar(look, pet) : A.svg(look);
        } catch (e) {}
      }
      return PJCC.avatarEmoji(prof);
    },
    petKey: function (prof) {
      return (prof && prof.companion && prof.companion.pet) || 'dog-1';
    },
    rankFor: function (credits) {
      var r = RANKS[0];
      for (var i = 0; i < RANKS.length; i++) { if ((credits || 0) >= RANKS[i].min) r = RANKS[i]; }
      return r;
    },
    nextRank: function (credits) {
      for (var i = 0; i < RANKS.length; i++) { if ((credits || 0) < RANKS[i].min) return RANKS[i]; }
      return null;
    },

    /* ── the clearance pip (see the CLEARANCE note above) ────────────────────────────
       Takes a profile, or nothing (a guest reads as Recruit, which is true). Returns the
       rung plus `next` and `toNext`, so any surface can say how far the next pip is
       without re-deriving the ladder.

       `hint` IS THE TOOLTIP, AND IT LIVES HERE (2026-08-12, Nate: "the question mark
       doesn't tell me anything"). Every pip used to hover as just the rung name —
       "Operative" — on a leaderboard row whose column header already said OPERATIVE and
       whose sub-label already said · Operative. Three of the same word in one row meaning
       three different things (the site's word for a player, this rung, and the CREDIT
       ladder's rung), and the help cursor promised to sort them out and then repeated one
       of them.
       ⚑ TWO OF THOSE THREE ARE GONE SINCE 2026-08-19: the site's word for a person is now
       PLAYER everywhere (Nate: "we aren't using Operative anymore"), so this rung and the
       credit rank are the only things still called Operative — which is what they always
       were. The tooltip stays as it is; it now disambiguates two meanings, not three. The tooltip now carries what the row cannot already say: WHICH rung out of
       how many, and what moves it. Rendered in four places, so the sentence is built once
       here and the count is read off the ladder rather than typed. */
    CLEARANCE: CLEARANCE,
    /* THE LOWEST RUNG THAT WEARS A PIP ON A BOARD (2026-08-12). A leaderboard suppresses
       the Recruit pip on purpose — everyone starts there, so a dot on every row is not a
       badge, it is noise (the same argument as the THRESHOLDS note above: "the pip would be
       a participation badge"). Your OWN dossier and profile bar still show it, because one
       pip beside one codename is information, not clutter.

       ⚠ THIS NUMBER EXISTS BECAUSE THE RULE WAS SPELLED TWICE AND DRIFTED THE SAME DAY.
       The board had `cl.level > 1` inline, then the new legend was generated from the full
       ladder — so the legend documented a seven-rung ladder while the board could only ever
       show six of them, and Nate spotted the missing dot immediately ("It should show on
       number 2 and 3, right?"). A legend that explains a symbol you can never meet there is
       worse than no legend. Both surfaces read this now, so they cannot disagree again. */
    BOARD_PIP_MIN_LEVEL: 2,
    clearance: function (prof) {
      prof = (prof === undefined) ? profile : prof;
      var rating = (prof && prof.pjcc_rating) || 0;
      var byRating = CLEARANCE[0];
      for (var i = 0; i < CLEARANCE.length; i++) if (rating >= CLEARANCE[i].rating) byRating = CLEARANCE[i];
      /* THE FLOOR. RANKS is credit-keyed and index-aligned with CLEARANCE (same length,
         same names, same order) — so an existing player's credit rank is simply the
         lowest clearance they may ever show. Nobody moves down. */
      var credits = (prof && prof.credits) || 0, byCredits = 0;
      for (var k = 0; k < RANKS.length; k++) if (credits >= RANKS[k].min) byCredits = k;
      var idx = Math.max(byRating.level - 1, byCredits);
      var c = CLEARANCE[idx], nxt = CLEARANCE[idx + 1] || null;
      return { level: c.level, name: c.name, pip: c.pip, rating: rating,
               fromCredits: byCredits > (byRating.level - 1),
               hint: 'Clearance ' + c.level + ' of ' + CLEARANCE.length + ' · ' + c.name +
                     ' — climbs with your rating',
               next: nxt, toNext: nxt ? Math.max(0, nxt.rating - rating) : 0 };
    },

    /* ── NAME A RUNG, GET ITS NUMBER (2026-08-13) ────────────────────────────────────
       A clearance-gated page declares the rung it wants in its FRONT MATTER, by name
       ("Alpine Clearance"), and the gate resolves it here. Naming it rather than writing
       the level number means the gate cannot be broken by inserting a rung — which is
       exactly what just happened to this ladder twice in one change (Theta and Sigma both
       landed mid-ladder and pushed every level above them up by two). A page that had
       hardcoded `9` would have kept working by luck; a page that had hardcoded `7` would
       have quietly opened Bill Alpine's file to Sigma operatives.

       Returns null for an unknown name, and the caller treats null as LOCKED — a typo in
       front matter must fail closed, because the failure it would otherwise cause is a
       classified page hanging open. Comparison is case-insensitive and tolerates the bare
       word ("alpine"), since front matter is hand-typed. */
    levelOf: function (name) {
      var want = String(name == null ? '' : name).trim().toLowerCase();
      if (!want) return null;
      for (var i = 0; i < CLEARANCE.length; i++) {
        var n = CLEARANCE[i].name.toLowerCase();
        if (n === want || n.replace(/ clearance$/, '') === want) return CLEARANCE[i].level;
      }
      return null;
    },
    ownedAvatars: function () {
      var owned = (profile && profile.companion && profile.companion.owned) || [];
      return AVATAR_FREE.concat(owned.filter(function (k) { return AVATAR_FREE.indexOf(k) === -1; }));
    },
    onChange: function (fn) { listeners.push(fn); }
  };
  window.PJCC = PJCC;

  function emit() {
    // Cache the codename + avatar so light pages (the nav pill, the splash) can
    // show a returning operative INSTANTLY, without waiting on the SDK. Cleared
    // on sign-out. (#15 — keeps the account SDK off the critical path everywhere.)
    try {
      var c = profile && profile.codename;
      if (c) { localStorage.setItem('pjcc.codename', c); localStorage.setItem('pjcc.avataremoji', PJCC.avatarEmoji(profile)); }
      else { localStorage.removeItem('pjcc.codename'); localStorage.removeItem('pjcc.avataremoji'); }
    } catch (e) {}
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
  }

  // Remember a referral code from the landing URL (?ref=CODENAME) for later.
  try {
    var _ref = new URLSearchParams(location.search).get('ref');
    if (_ref) localStorage.setItem('pjcc.ref', _ref);
  } catch (e) {}

  // --- dynamic SDK loader ----------------------------------------------------
  function loadSDK() {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) return resolve();
      var s = document.createElement('script');
      s.src = SDK_URL;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function refreshSession() {
    var res = await sb.auth.getSession();
    var session = res && res.data ? res.data.session : null;
    sb.auth.__user = session ? session.user : null;
    if (sb.auth.__user) { await loadProfile(); } else { profile = null; }
  }

  /* ⚠ THE COLUMN LIST IS A COMPATIBILITY SURFACE, and adding to it can take the whole
     site down for everyone. Postgrest fails the WHOLE select if any named column is
     missing, so asking for a column before Nate has run its migration would mean no
     profile at all — not a missing rating, a missing codename, on every page. The two
     newest columns are therefore fetched in a SECOND, optional query whose failure is
     swallowed: the site works identically before and after the migration, and simply
     knows less. (`pjcc_rating` has shipped since the Park Tables v2 migration;
     `puzzle_rating` needs docs/puzzle-rating-setup.md run. Both are treated as optional
     because "which migrations has this database actually had" is not something the
     client can know.) */
  async function loadProfile() {
    var u = sb.auth.__user;
    if (!u) { profile = null; return null; }
    var r = await sb.from('profiles').select('codename,companion,credits,rank').eq('id', u.id).maybeSingle();
    profile = (r && r.data) ? r.data : null;
    if (profile) {
      try {
        var x = await sb.from('profiles').select('pjcc_rating,rated_games,puzzle_rating,puzzle_solved')
          .eq('id', u.id).maybeSingle();
        if (x && x.data) {
          profile.pjcc_rating = x.data.pjcc_rating;
          profile.rated_games = x.data.rated_games;
          profile.puzzle_rating = x.data.puzzle_rating;
          profile.puzzle_solved = x.data.puzzle_solved;
        }
      } catch (e) { /* migration not run yet — the ladders fall back to local + credits */ }
      /* ⚠⚠ `puzzle_clean` GETS ITS OWN QUERY, for the same reason the block above has one:
         Postgrest fails the WHOLE select if any named column is missing, so adding a column
         that ships ahead of its migration to the query above would cost the rating AND the
         played count on every database that has not run it. One new column, one new query,
         one failure that can only ever cost the thing it asked for. */
      try {
        var y = await sb.from('profiles').select('puzzle_clean').eq('id', u.id).maybeSingle();
        if (y && y.data && typeof y.data.puzzle_clean === 'number') {
          profile.puzzle_clean = y.data.puzzle_clean;
        }
      } catch (e) { /* not migrated — the clean count stays local, and syncs the day it is */ }
    }
    return profile;
  }

  // --- init ------------------------------------------------------------------
  async function initPJCC() {
    if (!configured) return false;   // keys not set yet -> stay in local-only mode
    try {
      await loadSDK();
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: {
          // Stay-signed-in: the session is written to localStorage and survives
          // reloads + closing the browser; the refresh token is auto-renewed.
          // (Shared across the site + every same-origin game iframe automatically.)
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // Use the IMPLICIT flow (token in the link) ON PURPOSE: it lets you
          // request a login link on your phone and open it on your PC (or
          // vice-versa). PKCE — the newer supabase-js default — stores a verifier
          // on the requesting device only, which would break that cross-device
          // sign-in we explicitly want to support.
          flowType: 'implicit'
        }
      });
      await refreshSession();
      sb.auth.onAuthStateChange(function () { refreshSession().then(emit); });
      emit();
      return true;
    } catch (e) {
      PJCC.enabled = false;          // SDK failed to load -> graceful fallback
      return false;
    }
  }
  // #15 — DEFER the ~100KB Supabase SDK off every page's critical render path:
  // start init at idle (2s cap so account pages still light up promptly). Light
  // pages render the nav pill from the cached codename/avatar meanwhile; pages
  // that await PJCC.ready (dossier, games, character pages) still get the live
  // account — just a beat after first paint. Auth behavior is otherwise unchanged.
  PJCC.ready = new Promise(function (resolve) {
    if (!configured) { resolve(false); return; }
    var start = function () { initPJCC().then(resolve, function () { resolve(false); }); };
    if (window.requestIdleCallback) requestIdleCallback(start, { timeout: 2000 });
    else setTimeout(start, 150);
  });

  /* ⛑ THE PARK-TABLE STARS COME BACK FROM THE ACCOUNT — 2026-08-20, ON EVERY PAGE.
     An aura you won by beating Robert cleanly is spent in the FORGE, on /dossier/, and a
     player who signs in on a new phone and goes straight to their identity must find it
     already unlocked. So the pull lives here, in the file every page loads, rather than in
     the room that happens to write them.
     ⚠ SIGNED OUT THIS COSTS NOTHING: myStats() returns [] with no request at all.
     ⚠ It only ever RAISES a star (ptStarsMerge keeps the best of each), so a stale row can
     never walk a local win backwards, and a failure is silent — the local stars are the
     working copy and the next clean win re-banks the lot. [[down-never-stuck]] */
  PJCC.ready.then(function () {
    try {
      if (!PJCC.myStats) return;
      PJCC.myStats().then(function (rows) {
        var row = (rows || []).find(function (r) { return r.game === 'park-bot'; });
        if (row && row.data && row.data.stars) ptStarsMerge(row.data.stars);
        /* ⚠ THE SAME REQUEST, NOT A SECOND ONE. myStats() returns every game_stats row this
           account owns, so a second pull for the trainer's book would be a duplicate round
           trip for data already in hand. */
        var bk = (rows || []).find(function (r) { return r.game === 'opening-trainer'; });
        if (bk && bk.data && bk.data.book) trainerBookMerge(bk.data.book);
      })['catch'](function () {});
    } catch (e) {}
  });

  // --- auth ------------------------------------------------------------------
  // Single-flight: a double-tap on "Send login link" (easy on phones) must not
  // fire two OTP requests — that's how you get two login emails.
  var magicInFlight = null, magicInFlightEmail = '';
  PJCC.signInMagic = async function (email) {
    if (!sb) throw new Error('profiles offline');
    if (magicInFlight && magicInFlightEmail === email) return magicInFlight;
    magicInFlightEmail = email;
    magicInFlight = sb.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: window.location.href }
    });
    magicInFlight.finally(function () {
      setTimeout(function () { magicInFlight = null; magicInFlightEmail = ''; }, 30000);
    });
    return magicInFlight;
  };

  // The 6-digit code is the ONLY sign-in that works inside the installed iOS app:
  // a tapped link always opens Safari, and an iOS home-screen app keeps its own
  // storage jar, so the link signs in the browser and the app stays a stranger.
  // Typing the code keeps the whole exchange inside the app's own jar.
  // Don't hard-code the length: Supabase's OTP length is a project setting (ours
  // emails 8 digits, not the documented default 6). Take whatever digits they typed.
  PJCC.verifyCode = async function (email, code) {
    if (!sb) throw new Error('profiles offline');
    code = String(code || '').replace(/\D/g, '');
    if (code.length < 6 || code.length > 10) throw new Error('bad code');
    var r = await sb.auth.verifyOtp({ email: email, token: code, type: 'email' });
    if (r.error) throw r.error;
    await refreshSession();
    emit();
    return r.data;
  };

  PJCC.signOut = async function () {
    if (!sb) return;
    await sb.auth.signOut();
    profile = null;
    emit();
  };

  PJCC.claimCodename = async function (name) {
    var u = PJCC.currentUser();
    if (!u) throw new Error('not signed in');
    name = String(name || '').trim().slice(0, 24);
    if (!name) throw new Error('codename required');
    // Moderation: the DB trigger (docs/username-moderation-setup.sql) is the real,
    // unbypassable gate. This RPC is just a friendly pre-check so we can say no
    // before inserting. If the RPC isn't deployed yet it returns an error/null and
    // we fall straight through — moderation is simply inactive until the SQL is run.
    try {
      var chk = await sb.rpc('is_codename_allowed', { p: name });
      if (chk && chk.data === false) throw new Error("that codename isn't allowed — try another");
    } catch (e) {
      if (e && /isn't allowed/.test(e.message || '')) throw e;
      /* RPC missing / offline: let the insert (and the trigger, once live) decide */
    }
    var r = await sb.from('profiles').insert({ id: u.id, codename: name }).select().maybeSingle();
    if (r.error) {
      if (r.error.code === '23505') throw new Error('codename taken');   // unique violation
      if (/PJCC_CODENAME_BLOCKED/.test(r.error.message || '')) throw new Error("that codename isn't allowed — try another");
      throw r.error;
    }
    profile = r.data;
    await PJCC.migrateGuest();       // pull any local bests up to the account
    // Redeem a pending referral (awards credits to both, server-side & one-time).
    try {
      var pendingRef = localStorage.getItem('pjcc.ref');
      if (pendingRef && pendingRef !== name) await PJCC.redeemReferral(pendingRef);
      localStorage.removeItem('pjcc.ref');
    } catch (e) {}
    emit();
    return profile;
  };

  // --- scores ----------------------------------------------------------------
  // Local fallback keys mirror the server so guest progress is never lost.
  function localKey(game) { return 'pjcc.best.' + game; }

  PJCC.localBest = function (game) {
    try { return parseInt(localStorage.getItem(localKey(game)), 10) || 0; } catch (e) { return 0; }
  };
  function setLocalBest(game, score) {
    try {
      var cur = PJCC.localBest(game);
      if (score > cur) localStorage.setItem(localKey(game), String(score));
    } catch (e) {}
  }

  /* saveScore(game, score, extras)
   *   extras = { seed, credits, data }
   *   - guest  : updates localStorage best only
   *   - account: appends to scores, upserts best in game_stats, grants credits  */
  PJCC.saveScore = async function (game, score, extras) {
    extras = extras || {};
    score = parseInt(score, 10) || 0;
    setLocalBest(game, score);                         // always keep a local copy
    try { PJCC.touchStreak(); } catch (e) {}           // any play keeps the daily flame alive

    var u = PJCC.currentUser();
    if (!sb || !u) return { saved: 'local' };

    try {
      // 1. leaderboard row
      await sb.from('scores').insert({ user_id: u.id, game: game, score: score, seed: extras.seed || null });

      // 2. best + play count
      var cur = await sb.from('game_stats').select('best_score,plays,data').eq('user_id', u.id).eq('game', game).maybeSingle();
      var prev = (cur && cur.data) ? cur.data : { best_score: 0, plays: 0, data: {} };
      await sb.from('game_stats').upsert({
        user_id: u.id, game: game,
        best_score: Math.max(prev.best_score || 0, score),
        plays: (prev.plays || 0) + 1,
        data: extras.data || prev.data || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,game' });

      // 3. credits (atomic via RPC) — doubled when this is the weekly bounty game
      if (extras.credits) {
        var award = extras.credits * (PJCC.bountyGame() === game ? 2 : 1);
        var cr = await sb.rpc('add_credits', { amount: award });
        if (!cr.error && typeof cr.data === 'number' && profile) profile.credits = cr.data;
      }
      emit();
      return { saved: 'server' };
    } catch (e) {
      return { saved: 'local', error: e };
    }
  };

  // Push any guest localStorage bests into game_stats once an account exists.
  PJCC.migrateGuest = async function () {
    var u = PJCC.currentUser();
    if (!sb || !u) return;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('pjcc.best.') === 0) {
          var game = key.slice('pjcc.best.'.length);
          var best = parseInt(localStorage.getItem(key), 10) || 0;
          if (best > 0) await PJCC.saveScore(game, best, {});
        }
      }
    } catch (e) {}
  };

  // --- profile / companion ---------------------------------------------------
  // Merge a patch into the companion jsonb (avatar, owned[], etc.) and persist.
  async function updateCompanion(patch) {
    var u = PJCC.currentUser();
    if (!sb || !u) throw new Error('not signed in');
    var comp = Object.assign({}, (profile && profile.companion) || {}, patch);
    var r = await sb.from('profiles')
      .update({ companion: comp, updated_at: new Date().toISOString() })
      .eq('id', u.id).select().maybeSingle();
    if (r.error) throw r.error;
    profile = r.data;
    emit();
    return profile;
  }

  PJCC.setAvatar = async function (key) {
    if (!AVATARS[key]) throw new Error('unknown avatar');
    if (PJCC.ownedAvatars().indexOf(key) === -1) throw new Error('avatar not owned');
    return updateCompanion({ avatar: key });
  };

  // Persist the active pet (the full pet experience lives in pjcc-companion.js;
  // here we only store which one follows the operative across devices).
  PJCC.setPet = async function (key) { return updateCompanion({ pet: key }); };

  /* ══ THE WHOLE COMPANION SYNCS, NOT JUST WHICH ANIMAL IT IS ═══════════════════
     ⛑⛑ 2026-08-25. Nate: *"Of course the companion should sync across all devices… It should
     be obvious that every feature, stat, progress, and collectable is meant to be synced."*

     He is right, and **this is the THIRD time the same defect has shipped**: the Gauntlet
     doors (2026-08-19), the Park Tables stars (08-20), and now the companion. Bond, its name,
     its unlocked cosmetics and the max-bond dig all lived in `pjcc.pet.v3` on ONE BROWSER.
     Sign in on a new phone and a dog you spent weeks bonding to 100 was a stranger at bond 6.
     ⭐⭐ [[when-he-repeats-himself]]: A REPEAT MEANS THE DEFECT IS ONE LAYER BEHIND WHAT I
     FIXED. Twice I patched the feature; the actual defect is that **local-first with a
     bolt-on mirror per feature makes syncing something you have to REMEMBER**, and three
     times running nobody did. So this is written as the shape every future one copies, and
     `tests/economy.check.js` now fails if an earned local store has no mirror at all.

     ⚠⚠ MERGE, NEVER REPLACE — and the merge is per-FIELD, because the fields mean different
     things. `bond`, `ownedCos` and `dug` are EARNED and monotonic: they take the max / the
     union / the sticky true, so no device can ever cost you progress. Everything else
     (needs, names, the active pet) is a preference and the FRESHER stamp wins. Taking the
     newer object wholesale would let a phone you last opened in July roll back a bond you
     raised this morning — which is precisely the "restore that is a downgrade wearing the
     word restore" the stars note warns about.
     ⚠ IT RIDES IN `profiles.companion`, WHICH ALREADY EXISTS AND IS ALREADY jsonb. No SQL for
     Nate to run, so this ships today rather than waiting on a migration. */
  function mergePet(local, remote) {
    if (!remote || typeof remote !== 'object') return local;
    if (!local || typeof local !== 'object') return remote;
    var lAt = +local.at || 0, rAt = +remote.at || 0;
    var win = rAt > lAt ? remote : local;      // the fresher device wins the preferences
    var out = {};
    for (var k in win) out[k] = win[k];
    /* — and then the earned fields are rescued from BOTH, whichever way that went — */
    out.bond = Math.max(+local.bond || 0, +remote.bond || 0);
    out.dug = !!(local.dug || remote.dug);
    var owned = {}, i, a;
    a = (local.ownedCos || []).concat(remote.ownedCos || []);
    for (i = 0; i < a.length; i++) owned[a[i]] = 1;
    out.ownedCos = Object.keys(owned);
    /* names are per-species and additive — naming a cat on one device must not un-name the
       dog you named on another */
    out.names = Object.assign({}, remote.names || {}, local.names || {});
    if (rAt > lAt) out.names = Object.assign({}, local.names || {}, remote.names || {});
    out.at = Math.max(lAt, rAt);
    return out;
  }
  PJCC.mergePet = mergePet;                    // exported so the gate can exercise it
  PJCC.setPetState = async function (state) { return updateCompanion({ petState: state || {} }); };
  /* The account's copy, for a device that is reading it in. Null when there is none — which
     is a brand-new account, not an empty companion, and the caller must tell those apart. */
  PJCC.getPetState = function () {
    try { var p = PJCC.getProfile(); return (p && p.companion && p.companion.petState) || null; }
    catch (e) { return null; }
  };

  /* ⭐ THE PET'S LOOK RIDES WITH THE PERSON'S. `setLook` has synced the FACE since the Forge
     shipped; the coat, eye and nose of the dog beside it did not, for no reason anybody
     chose. Same object, same call, same merge rules — one fewer thing to remember. */
  PJCC.setPetLook = async function (look) { return updateCompanion({ petLook: look || {} }); };

  /* ══ AUSTON REMEMBERS YOU ON EVERY DEVICE ═══════════════════════════════
     ⛑⛑ 2026-08-25, found auditing Nate's rule that *"every feature, stat, progress, and
     collectable is meant to be synced."* `pjcc.auston.v1` (what she knew when you last sat
     down) and `pjcc.pt.log.v1` (your last forty games) were **device-local with zero mirror**.

     ⭐⭐ THIS IS THE ONE THAT MATTERED MOST, AND NOT FOR THE OBVIOUS REASON. Auston's
     continuity is the thing this site has that Chess.com does not — the whole argument in
     `ten-chesswild-ideas.md` is *"Mittens has no episode two."* A character who forgets you
     the moment you pick up a different phone **does not have episode two either.** It was not
     a data-loss bug; it was the differentiator being device-local.

     ⚠ THE LOG MERGES BY UNION, NOT BY RECENCY, and the records make that free: every one
     carries `t`. Two devices hold two partial histories of the same person, so the true
     history is both of them, deduped and re-sorted — not whichever phone wrote last. The
     LEDGER is a snapshot of what she had already said, so there the fresher stamp wins:
     replaying a greeting she has already given you is the one failure she must not have. */
  function mergeAuston(local, remote) {
    if (!remote || typeof remote !== 'object') return local;
    if (!local || typeof local !== 'object') return remote;
    var out = {};
    var lAt = +(local.ledger && local.ledger.at) || 0;
    var rAt = +(remote.ledger && remote.ledger.at) || 0;
    out.ledger = rAt > lAt ? remote.ledger : local.ledger;
    /* the union of two partial histories, newest first, capped the way the room caps it */
    var seen = {}, all = (local.log || []).concat(remote.log || []), keep = [];
    all.sort(function (a, b) { return (+b.t || 0) - (+a.t || 0); });
    for (var i = 0; i < all.length; i++) {
      var r = all[i]; if (!r) continue;
      var id = String(r.t) + '|' + String(r.b) + '|' + String(r.r);
      if (seen[id]) continue;
      seen[id] = 1; keep.push(r);
    }
    if (keep.length > 40) keep.length = 40;
    out.log = keep;
    return out;
  }
  PJCC.mergeAuston = mergeAuston;
  PJCC.setAuston = async function (state) { return updateCompanion({ auston: state || {} }); };
  /* the Den's own save file, read WITHOUT loading the Den — avatarMarkup runs on surfaces
     pjcc-companion.js was never on, and the species default lives in there. */
  function petLocal() {
    try { return JSON.parse(localStorage.getItem('pjcc.pet.v3') || 'null'); } catch (e) { return null; }
  }
  PJCC.setPetOnAvatar = async function (on) { return updateCompanion({ petOnAvatar: !!on }); };
  PJCC.petOnAvatar = function () {
    try { var p = PJCC.getProfile(); return !(p && p.companion && p.companion.petOnAvatar === false); }
    catch (e) { return true; }
  };
  PJCC.getAuston = function () {
    try { var p = PJCC.getProfile(); return (p && p.companion && p.companion.auston) || null; }
    catch (e) { return null; }
  };

  // Persist the full operative look built in the Identity Forge (pjcc-creator.js).
  // Stored as companion.look = { base, tone, glyph, aura, hat, emblem, name, role, bio }.
  // glyph is the resolved emoji so avatarEmoji() can render it without the catalog.
  PJCC.setLook = async function (look) { return updateCompanion({ look: look || {} }); };

  // --- credits / store -------------------------------------------------------
  // Deduct credits atomically (add_credits RPC with a negative amount).
  PJCC.spendCredits = async function (amount) {
    var u = PJCC.currentUser();
    if (!sb || !u) throw new Error('not signed in');
    if (!profile || profile.credits < amount) throw new Error('not enough credits');
    var cr = await sb.rpc('add_credits', { amount: -Math.abs(amount) });
    if (cr.error) throw cr.error;
    if (typeof cr.data === 'number') profile.credits = cr.data;
    emit();
    return profile.credits;
  };

  PJCC.buyAvatar = async function (key) {
    var item = AVATAR_SHOP.filter(function (s) { return s.key === key; })[0];
    if (!item) throw new Error('not for sale');
    if (PJCC.ownedAvatars().indexOf(key) !== -1) throw new Error('already owned');
    await PJCC.spendCredits(item.price);
    var owned = ((profile.companion && profile.companion.owned) || []).slice();
    owned.push(key);
    return updateCompanion({ owned: owned, avatar: key });   // buy + equip
  };

  // All of my game_stats rows (per-game bests + play counts).
  PJCC.myStats = async function () {
    var u = PJCC.currentUser();
    if (!sb || !u) return [];
    var r = await sb.from('game_stats').select('game,best_score,plays,data,updated_at').eq('user_id', u.id);
    return (r && r.data) ? r.data : [];
  };

  // --- mailing list ----------------------------------------------------------
  // Insert-only (RLS); duplicate email is treated as success.
  PJCC.subscribe = async function (email) {
    if (!sb) throw new Error('offline');
    email = String(email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('invalid email');
    var r = await sb.from('subscribers').insert({ email: email });
    if (r.error && r.error.code !== '23505') throw r.error;  // 23505 = already subscribed
    return { ok: true, already: !!(r.error && r.error.code === '23505') };
  };

  // --- leaderboards ----------------------------------------------------------
  // Daily / raw scores board (one row per play; used for date-seeded boards).
  PJCC.leaderboard = async function (game, opts) {
    opts = opts || {};
    if (!sb) return [];
    var q = sb.from('scores').select('score,created_at,profiles(codename,companion)').eq('game', game);
    if (opts.scope === 'daily' && opts.seed) q = q.eq('seed', opts.seed);
    q = q.order('score', { ascending: false }).limit(opts.limit || 10);
    var r = await q;
    if (r.error || !r.data) return [];
    return r.data.map(function (row) {
      return { score: row.score, codename: row.profiles ? row.profiles.codename : 'unknown',
               companion: row.profiles ? row.profiles.companion : null };
    });
  };

  // All-time per-game board: best score per operative (from game_stats).
  // Paginated via offset/limit (range), with a stable secondary sort.
  PJCC.gameLeaderboard = async function (game, limit, offset) {
    if (!sb) return [];
    limit = limit || 25; offset = offset || 0;
    var r = await sb.from('game_stats')
      .select('best_score,plays,updated_at,profiles(codename,companion)')
      .eq('game', game)
      .order('best_score', { ascending: false })
      .order('updated_at', { ascending: true })
      .range(offset, offset + limit - 1);
    if (r.error || !r.data) return [];
    return r.data.map(function (row) {
      return { score: row.best_score, plays: row.plays,
               codename: row.profiles ? row.profiles.codename : 'unknown',
               companion: row.profiles ? row.profiles.companion : null };
    });
  };

  // Cumulative board: operatives ranked by total credits earned everywhere.
  PJCC.cumulativeLeaderboard = async function (limit, offset) {
    if (!sb) return [];
    limit = limit || 25; offset = offset || 0;
    /* `pjcc_rating` is here so the overall board can draw the clearance pip from the
       real thing rather than from credits alone (2026-08-03). Safe to name: it shipped
       with the Park Tables v2 migration and the ratings board already selects it. If it
       ever isn't there, this returns [] rather than a broken board — which is the same
       failure the rating board already handles. */
    var r = await sb.from('profiles')
      .select('codename,credits,rank,companion,pjcc_rating')
      .order('credits', { ascending: false })
      .order('codename', { ascending: true })
      .range(offset, offset + limit - 1);
    if (r.error || !r.data) return [];
    return r.data;
  };

  // ===========================================================================
  // Progression: companion levels, achievements, the journey, titles, referral
  // ===========================================================================

  // --- companion levels (XP = total rounds played, a monotonic stat) ---------
  var LEVELS = [
    { lvl: 1, at: 0,   stage: 'Stray' },
    { lvl: 2, at: 5,   stage: 'Recruit Pup' },
    { lvl: 3, at: 15,  stage: 'Scout' },
    { lvl: 4, at: 30,  stage: 'Tracker' },
    { lvl: 5, at: 55,  stage: 'Pathfinder' },
    { lvl: 6, at: 90,  stage: 'Vanguard' },
    { lvl: 7, at: 140, stage: 'Champion' },
    { lvl: 8, at: 210, stage: 'Legend of the Board' }
  ];
  PJCC.LEVELS = LEVELS;
  PJCC.companionLevel = function (plays) {
    plays = plays || 0;
    var cur = LEVELS[0], nxt = null;
    for (var i = 0; i < LEVELS.length; i++) {
      if (plays >= LEVELS[i].at) cur = LEVELS[i];
      else { nxt = LEVELS[i]; break; }
    }
    return { level: cur.lvl, stage: cur.stage, into: plays - cur.at, span: nxt ? nxt.at - cur.at : 0, next: nxt };
  };

  function statsCtx(prof, stats) {
    var map = {}; (stats || []).forEach(function (s) { map[s.game] = s; });
    return {
      profile: prof, credits: (prof && prof.credits) || 0,
      totalPlays: (stats || []).reduce(function (a, s) { return a + (s.plays || 0); }, 0),
      best: function (g) { return map[g] ? (map[g].best_score || 0) : 0; },
      played: function (g) { return !!(map[g] && map[g].plays > 0); }
    };
  }

  // --- achievements ----------------------------------------------------------
  /* ── ACHIEVEMENTS — re-cut 2026-07-27 (Nate: "Get rid of the Shogi or Reading Room
     achievements. Go through the achievements and update them.")

     Two things were wrong beyond the ask. SHOGI SCHOLAR asked for a score on Shogi
     Island — a game that's been slow-rolled off the site since 2026-07-04, so nobody
     could earn it. And GLOBETROTTER was measured against the journey's stops, which still
     LISTED Shogi Island — so "play every game" was unwinnable for everyone. Both are
     now measured against games a visitor can actually reach today.

     The thresholds moved too: they were set when Fork was a small side game, and
     "solve 5" is not an achievement now that it's the whole puzzle room. Anything
     here should take a real session to earn. ─────────────────────────────────── */
  var ACHIEVEMENTS = [
    { key: 'first-contact', icon: '📡', label: 'First Contact',  desc: 'Claim your codename',              test: function (c) { return !!c.profile; } },
    { key: 'tactician',     icon: '⚔', label: 'Tactician',      desc: 'Solve 25 puzzles',                 test: function (c) { return c.best('fork-in-the-road') >= 25; } },
    { key: 'deep-miner',    icon: '⛏', label: 'Deep Miner',     desc: 'Score 100 in Sand Mine Depths',    test: function (c) { return c.best('sand-mine-depths') >= 100; } },
    { key: 'analyst',       icon: 'Δ', label: 'Analyst',        desc: 'Score 500+ in Clearance: DELTA',   test: function (c) { return c.best('clearance-delta') >= 500; } },
    { key: 'on-the-beat',   icon: '♫', label: 'On the Beat',    desc: 'Score 1000+ in Notation Blitz',    test: function (c) { return c.best('notation-run') >= 1000; } },
    { key: 'updraft',       icon: '♞', label: 'Updraft',        desc: 'Score 2500+ in Sky Run',           test: function (c) { return c.best('sky-run') >= 2500; } },
    { key: 'held-the-gate', icon: '🏰', label: 'Held the Gate',  desc: 'Score 2000+ in Siege on Chess City', test: function (c) { return c.best('tower-defense') >= 2000; } },
    { key: 'the-climb',     icon: '♛', label: 'The Climb',      desc: 'Beat 3 floors of the Gauntlet',    test: function (c) { return c.best('the-gauntlet') >= 3; } },
    { key: 'crowned',       icon: '👑', label: 'Crowned',        desc: 'Clear all ten Gauntlet floors',    test: function (c) { return c.best('the-gauntlet') >= 10; } },
    { key: 'globetrotter',  icon: '🗺', label: 'Globetrotter',   desc: 'Play every game at least once',    test: function (c) { return JOURNEY.every(function (s) { return !s.game || c.played(s.game); }); } },
    { key: 'dedicated',     icon: '🔥', label: 'Dedicated',      desc: 'Play 50 rounds total',             test: function (c) { return c.totalPlays >= 50; } },
    { key: 'collector',     icon: '🛒', label: 'Collector',      desc: 'Own something from the Shopkeeper', test: function (c) { return !!(c.profile && c.profile.companion && (c.profile.companion.owned || []).length); } }
  ];
  PJCC.ACHIEVEMENTS = ACHIEVEMENTS;
  PJCC.earnedAchievements = function (prof, stats) {
    var c = statsCtx(prof, stats);
    return ACHIEVEMENTS.map(function (a) { return { key: a.key, icon: a.icon, label: a.label, desc: a.desc, earned: !!a.test(c) }; });
  };

  // --- the journey (game completion -> Princess's walk to Chess City) --------
  // Stops must be places a visitor can actually GO today. Shogi Island (slow-rolled off
  // the site) and Pirc Crossing (still IN DEV) were stops nobody could light up, which
  // also made the Globetrotter achievement unwinnable. Sky Run and the Siege took their
  // places — both are shipped, both are on the games hall. (2026-07-27)
  //
  // ⚠ THE SEVEN-DOT STRIP THIS FED IS GONE (2026-08-04, Nate: "Scrap the Journey map and
  // the little character by it"). THE ARRAY IS NOT DEAD — do not delete it on that basis:
  // it is what the GLOBETROTTER achievement tests ("play every game at least once", a few
  // hundred lines up), which is a live, winnable badge with nothing to do with the diagram.
  // `PJCC.JOURNEY` and `PJCC.journeyProgress` went with the map; the dossier was their only
  // caller. Restore both from git before this commit if the map ever comes back.
  //
  // (Renamed from WORLDMAP / worldProgress 2026-08-03 when the real World Map page was
  // deleted — this was never that page, and the old name was the sort of ghost that gets a
  // working feature deleted by mistake.)
  var JOURNEY = [
    { name: 'Checker Town',     game: 'notation-run' },
    { name: 'The Sand Mines',   game: 'sand-mine-depths' },
    { name: 'Fork in the Road', game: 'fork-in-the-road' },
    { name: 'Clearance HQ',     game: 'clearance-delta' },
    { name: 'The Updraft',      game: 'sky-run' },
    { name: 'The City Walls',   game: 'tower-defense' },
    { name: 'Chess City',       game: null }
  ];

  // --- titles (flair shown by your codename) ---------------------------------
  var TITLES = {
    'rookie':    { label: 'Rookie',              rule: 'free' },
    'regular':   { label: 'Regular',             rule: 'plays:25' },
    'veteran':   { label: 'Veteran',             rule: 'plays:75' },
    'tactician': { label: 'Tactician',           rule: 'ach:tactician' },
    'miner':     { label: 'Mine Survivor',       rule: 'ach:deep-miner' },
    // 'sensei' (Shogi Sensei) retired 2026-07-27 with the shogi-scholar achievement —
    // it hung off an achievement for a game that isn't on the site.
    'curator':   { label: 'Curator',             rule: 'buy:20' },
    'legend':    { label: 'Legend of the Board', rule: 'buy:60' },
    // 2026-08-03 restock — three more on the shelf
    'archivist': { label: 'The Archivist',       rule: 'buy:100' },
    'patient':   { label: 'The Patient One',     rule: 'buy:140' },
    'sharp':     { label: 'Sharp Eye',           rule: 'buy:90' },
    // vault titles — never for sale; the altar is the only door (see VAULT above)
    'letgo':      { label: 'One Who Let Go',          rule: 'vault' },
    'openhand':   { label: 'Open Hand',               rule: 'vault' },
    'remembered': { label: 'Remembered by the Board', rule: 'vault' },
    /* earned titles — no shop, no altar; the requirement is in EARNED above. `rule:'earned'`
       behaves exactly like `'vault'` in unlockedTitles() (you have it or you don't), and is
       a separate word only so the Quartermaster can say WHERE it came from. */
    'finder':    { label: 'The Finder',            rule: 'earned' },
    'citizen':   { label: 'Citizen of Chess City', rule: 'earned' }
  };
  PJCC.TITLES = TITLES;
  // ⚑ RE-TIERED 2026-08-04 with the avatar shelf — see the note on AVATAR_SHOP.
  PJCC.TITLE_SHOP = [{ key: 'curator', price: 150 }, { key: 'legend', price: 540 },
    { key: 'sharp', price: 230 }, { key: 'archivist', price: 260 }, { key: 'patient', price: 400 }];
  PJCC.unlockedTitles = function (prof, stats) {
    var c = statsCtx(prof, stats);
    var earned = {}; PJCC.earnedAchievements(prof, stats).forEach(function (a) { if (a.earned) earned[a.key] = true; });
    var ownedTitles = (prof && prof.companion && prof.companion.owned_titles) || [];
    return Object.keys(TITLES).filter(function (key) {
      var rule = TITLES[key].rule;
      if (rule === 'free') return true;
      if (rule.indexOf('plays:') === 0) return c.totalPlays >= parseInt(rule.slice(6), 10);
      if (rule.indexOf('ach:') === 0) return !!earned[rule.slice(4)];
      if (rule.indexOf('buy:') === 0) return ownedTitles.indexOf(key) !== -1;
      if (rule === 'vault') return ownedTitles.indexOf(key) !== -1;   // won at the altar, never sold
      if (rule === 'earned') return ownedTitles.indexOf(key) !== -1;  // claimed once the deed was done
      return false;
    });
  };
  PJCC.titleLabel = function (prof) {
    var key = prof && prof.companion && prof.companion.title;
    return (key && TITLES[key]) ? TITLES[key].label : '';
  };
  PJCC.setTitle = function (key) {
    if (key && !TITLES[key]) throw new Error('unknown title');
    return updateCompanion({ title: key || null });
  };
  PJCC.buyTitle = async function (key) {
    var item = PJCC.TITLE_SHOP.filter(function (t) { return t.key === key; })[0];
    if (!item) throw new Error('not for sale');
    var ownedTitles = (profile.companion && profile.companion.owned_titles) || [];
    if (ownedTitles.indexOf(key) !== -1) throw new Error('already owned');
    await PJCC.spendCredits(item.price);
    return updateCompanion({ owned_titles: ownedTitles.concat([key]), title: key });
  };

  // --- referral --------------------------------------------------------------
  PJCC.inviteLink = function (prof) {
    var code = (prof && prof.codename) ? prof.codename : '';
    return code ? (location.origin + '/?ref=' + encodeURIComponent(code)) : '';
  };
  PJCC.redeemReferral = async function (refCodename) {
    if (!sb || !PJCC.currentUser()) return { ok: false };
    refCodename = String(refCodename || '').trim();
    if (!refCodename) return { ok: false };
    try {
      var r = await sb.rpc('redeem_referral', { ref_codename: refCodename });
      if (r.error) return { ok: false, error: r.error };
      await loadProfile(); emit();
      return { ok: true, result: r.data };
    } catch (e) { return { ok: false, error: e }; }
  };

  // --- weekly bounty (one game per week pays 2x credits) ---------------------
  PJCC.BOUNTY_GAMES = ['clearance-delta', 'notation-run', 'fork-in-the-road', 'sand-mine-depths', 'pirc-protocol', 'shogi-island', 'tower-defense', 'sky-run'];
  PJCC.bountyGame = function () {
    var now = new Date();
    var week = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 3600 * 1000));
    return PJCC.BOUNTY_GAMES[week % PJCC.BOUNTY_GAMES.length];
  };

  // --- daily-active streak (the cross-game "flame": consecutive days you played) ---
  // Local-first so it works for guests; mirrors to the profile when signed in.
  var STREAK_KEY = 'pjcc.streak';
  function dayStamp(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2) + '-' + ('0'+d.getDate()).slice(-2); }
  PJCC.dayStamp = dayStamp;
  function loadStreak() { try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { current: 0, best: 0, last: '' }; } catch (e) { return { current: 0, best: 0, last: '' }; } }
  PJCC.touchStreak = function () {
    var s = loadStreak(), today = dayStamp();
    if (s.last === today) return s;                    // already counted today
    var y = new Date(); y.setDate(y.getDate() - 1);
    s.current = (s.last === dayStamp(y)) ? (s.current + 1) : 1;   // consecutive or reset to 1
    s.best = Math.max(s.best || 0, s.current);
    s.last = today;
    try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  };
  PJCC.streakInfo = function () {
    var s = loadStreak(), today = dayStamp();
    var y = new Date(); y.setDate(y.getDate() - 1);
    // a streak only counts as "alive" if the last active day was today or yesterday
    var alive = (s.last === today || s.last === dayStamp(y));
    return { current: alive ? (s.current || 0) : 0, best: s.best || 0, last: s.last || '', playedToday: s.last === today };
  };

  /* ══ THE PUZZLE RATING — an Elo for the SOLVER (2026-08-03) ══════════════════════
     Priority #2: "Puzzles wear honest ~ratings already. Give the SOLVER one — the same
     Elo the Park Tables run — and serve puzzles at it. The Journey's 1–10 difficulty
     becomes a real, comparable number, and 'rated 1240 puzzles' is a far better brag
     than 'step 340'."

     THE SAME ELO, NOT THE SAME NUMBER. It is the identical formula the Park Tables run
     server-side (`settle_park_rating`) — expected score from the gap, K times the
     surprise — but on the scale the PUZZLES already live on, which is roughly 400 to
     1500. Sharing the Park Tables' 250 start would have been sharing a number, not a
     system: a 250-rated solver would be served puzzles below anything the generator can
     make. **START 700**, a little under a mid-difficulty puzzle, so the first handful
     feel winnable and the number moves fast early.

     LOCAL-FIRST, AND THAT IS DELIBERATE. Puzzles are the one part of this site a
     stranger plays hardest and signs into least, and a rating that only exists for
     account holders would mean the people doing the most work see the least progress
     ([[account-is-free-not-optional-pitch]]). So it lives in localStorage, works signed
     out, and MIRRORS to the profile when there is one — exactly the shape the daily
     streak already uses. `takeHigher` on load means signing in on a new device lifts you
     to your real rating instead of resetting you to 700.

     ⚠ K FALLS AS YOU SETTLE. 40 for the first ten puzzles, then 24, then 16 past fifty.
     Without it a hundred-puzzle veteran's rating still swings 40 points on one unlucky
     mate-in-two, which makes the number noise rather than a measurement.
     ⚠ THE CALLER SCORES 1 OR 0 (changed 2026-08-10). There used to be a middle tier —
     0.6 for a solve after a wrong try, 0.25 for a reveal — and against a puzzle at or above
     your own rating a 0.6 settled POSITIVE, so the room said "no credit" and paid you
     anyway. Two outcomes is what makes the settle symmetric: at your own level a solve is
     +k/2 and a miss is −k/2. This function still accepts any score in [0,1]; the room's
     definition of a win lives in the room. */
  var PZ_KEY = 'pjcc.puzzle.rating.v1';
  /* ⚠ READ-ONLY, ONCE, AND ONLY BY seedClean() BELOW. This is the Puzzle Room's own key and
     this file has no other business with it — the coupling is deliberate, one-directional
     and documented rather than accidental. */
  var PZ_ROAD_KEY = 'pjcc.fork.journey.v2';
  var PZ_START = 700, PZ_FLOOR = 300, PZ_CEIL = 2600;
  function loadPz() {
    try {
      var o = JSON.parse(localStorage.getItem(PZ_KEY)) || {};
      return { rating: o.rating || PZ_START, solved: o.solved || 0, clean: o.clean || 0,
               cleanSeeded: !!o.cleanSeeded, peak: o.peak || o.rating || PZ_START };
    } catch (e) { return { rating: PZ_START, solved: 0, clean: 0, cleanSeeded: false, peak: PZ_START }; }
  }
  function savePz(o) { try { localStorage.setItem(PZ_KEY, JSON.stringify(o)); } catch (e) {} }

  /* ══ THE ONE-TIME BACKFILL, 2026-08-26 ═══════════════════════════════════════════════
     `clean` is new and every player who already has a history would start it at zero — so
     the front door would tell a solver of two hundred puzzles that they have solved one
     cleanly. That is worse than the wrong label it replaces.

     ⭐ BUT THE NUMBER IS RECOVERABLE, AND NOT BY GUESSING. The road only advances on an
     `earned` solve — no hint, no wrong first move, no reveal — and `mintHalfway()` in
     pjcc_fork.html already leans on exactly that: *"500 steps ARE 500 clean solves."* So the
     road's high-water mark is a PROVEN FLOOR under the clean count, measured by a different
     instrument that was running the whole time. It can only understate, never overstate.

     ⚠ IT RUNS EXACTLY ONCE, gated on its own flag rather than on `clean === 0` — otherwise a
     player who legitimately sits at zero re-seeds on every call, and a reset would silently
     undo itself. Same shape as `seedPuzzleRating()`'s "have I seeded yet" test. */
  function seedClean(o) {
    if (o.cleanSeeded) return o;
    o.cleanSeeded = true;
    try {
      var r = JSON.parse(localStorage.getItem(PZ_ROAD_KEY)) || {};
      var floor = Math.max(parseInt(r.best, 10) || 0, parseInt(r.step, 10) || 0);
      if (floor > o.clean) o.clean = floor;
    } catch (e) { /* storage denied — the count simply starts from here, which is honest */ }
    savePz(o);
    return o;
  }

  PJCC.PUZZLE_START = PZ_START;
  PJCC.puzzleRating = function () {
    var o = seedClean(loadPz());
    // the profile wins if it is HIGHER — see takeHigher above
    var p = profile && profile.puzzle_rating;
    if (typeof p === 'number' && p > o.rating) { o.rating = p; o.peak = Math.max(o.peak, p); savePz(o); }
    var ps = profile && profile.puzzle_solved;
    if (typeof ps === 'number' && ps > o.solved) { o.solved = ps; savePz(o); }
    var pc = profile && profile.puzzle_clean;
    if (typeof pc === 'number' && pc > o.clean) { o.clean = pc; savePz(o); }
    /* ⚠ A CLEAN SOLVE IS STILL A SOLVE, so `clean` can never exceed `solved` — and it CAN
       arrive higher, because the two are merged from different places (the road's floor above,
       a device that solved signed out, an un-migrated column). "26 played · 30 clean" is not a
       rounding wobble, it is a sentence that cannot be true, and a visitor would read it as the
       site being broken rather than as two counters disagreeing. */
    if (o.clean > o.solved) { o.solved = o.clean; savePz(o); }
    return o;
  };
  /* ONE-TIME SEED, for a player who arrives with a road behind them. It SETS the rating
     rather than nudging it, and it does NOT count a solve — so `solved` stays 0 and the
     caller's "have I seeded yet" test stays true exactly once. Refuses to lower anything:
     a seed may only ever lift you ([[sell-back-economy]] — no takeaways). */
  PJCC.seedPuzzleRating = function (rating) {
    var o = PJCC.puzzleRating(), r = parseInt(rating, 10) || 0;
    if (r <= o.rating) return o;
    o.rating = Math.min(PZ_CEIL, r); o.peak = Math.max(o.peak, o.rating);
    savePz(o);
    return o;
  };
  /* One puzzle's worth of movement. `score` is 1 aced · 0.6 solved after a wrong try ·
     0.25 revealed. Returns {before, after, delta, rating, solved} so the room can SHOW
     the swing — a rating that changes silently teaches nobody anything. */
  PJCC.settlePuzzle = function (puzzleRating, score) {
    var o = PJCC.puzzleRating();
    var pr = parseInt(puzzleRating, 10);
    if (!pr || pr < 100) return { before: o.rating, after: o.rating, delta: 0, rating: o.rating, solved: o.solved };
    var s = Math.max(0, Math.min(1, typeof score === 'number' ? score : 1));
    var k = o.solved < 10 ? 40 : o.solved < 50 ? 24 : 16;
    var expected = 1 / (1 + Math.pow(10, (pr - o.rating) / 400));
    var before = o.rating;
    var after = Math.max(PZ_FLOOR, Math.min(PZ_CEIL, Math.round(before + k * (s - expected))));
    o.rating = after; o.solved += 1; o.peak = Math.max(o.peak, after);
    /* ⚑ TWO COUNTERS SINCE 2026-08-26 (Nate: "I feel like it should be solved correctly, the
       puzzles. Or maybe we have both numbers there.").

       `solved` counts puzzles FINISHED and always did — a reveal routes through
       revealSolution() → playerCorrect() → puzzleSolved() → settlePuzzle(rating, 0), so it
       lands here like any other. The front door was calling that figure "solved correctly"
       on the strength of a code comment that asserted the room only counted clean solves. It
       did not, nothing measured the claim, and it was wrong for sixteen days.

       ⭐ A FULL SCORE IS THE CLEAN SIGNAL AND IT ALREADY EXISTED. The room computes
       `earned = clean && !revealed && hintLevel === 0` and passes `earned ? 1 : 0` — so
       `s >= 1` IS "solved it themselves", with no second definition to drift from the first.
       That is why this tests the score rather than taking a new argument. */
    if (s >= 1) o.clean += 1;
    savePz(o);
    // mirror to the account when there is one; a failure here is silent and harmless
    // (the local copy is the source of truth and will re-mirror on the next solve).
    if (sb && PJCC.currentUser()) {
      try {
        sb.from('profiles').update({ puzzle_rating: after, puzzle_solved: o.solved })
          .eq('id', PJCC.currentUser().id).then(function () {
            if (profile) { profile.puzzle_rating = after; profile.puzzle_solved = o.solved; }
          }, function () {});
        /* ⚠⚠ A SEPARATE STATEMENT, NOT A THIRD KEY IN THE ONE ABOVE. `puzzle_clean` ships
           ahead of its migration, and Postgrest rejects the WHOLE update if any named column
           is missing — folding it in would take the rating and the played count down with it
           on every unmigrated database, silently. Same reason loadProfile() asks for the
           newest columns in a query of their own. */
        sb.from('profiles').update({ puzzle_clean: o.clean })
          .eq('id', PJCC.currentUser().id).then(function () {
            if (profile) { profile.puzzle_clean = o.clean; }
          }, function () {});
      } catch (e) {}
    }
    return { before: before, after: after, delta: after - before, rating: after,
             solved: o.solved, clean: o.clean, k: k };
  };

  /* ══ REPORT A PUZZLE — a table, not an inbox (2026-08-03) ═════════════════════════
     Priority #1: "A Supabase `puzzle_reports` table, insert-only via RLS, written
     straight from the game… One tap, nothing lost." Plus: "Let the machine triage them.
     Attach the engine's own verdict to the report… so the only reports worth opening are
     the ones where the PLAYER IS RIGHT."

     ⚠ IT MUST FAIL SOFTLY AND SAY SO. The table does not exist until Nate runs
     docs/puzzle-reports-setup.md, and this ships before he does. So this NEVER throws:
     it resolves `{ok:false, reason}` and the room falls back to the Email/Copy pair that
     has always worked. A report button that silently swallows a report is worse than the
     mailto it replaced ([[down-never-stuck]]).

     ⚠ AND IT WORKS SIGNED OUT. The insert policy is `to anon, authenticated` on purpose:
     the person most likely to find a broken puzzle is a stranger doing their first ten,
     and requiring an account to say "this is wrong" would filter out exactly the reports
     worth having. `codename` is whatever they have, or null. */
  /* ══ CREDIT GIFTS ═══════════════════════════════════════════════════════════════════
     2026-08-13, Nate: *"how about a mechanism where a user can click on another user's
     name, and they can give them 1, 5, 10, 25, or 50 credits? That's the only thing they
     can interact with a specific user on for now."*

     ⭐ A NUMBER IS THE SAFEST THING TWO STRANGERS CAN SEND EACH OTHER. Typed chat does not
     exist on this site by construction — four preset phrases and nothing else — and this
     keeps that property exactly: a gift carries an amount and a sender, and there is no
     field anywhere in it that a person could put a sentence in. The feature is child-safe
     for the same structural reason the emotes are, not by moderation.

     ⚠ THE SERVER IS THE RULE. `GIFT_TIERS` below draws five buttons; the SQL refuses
     anything that is not one of the five, checks the balance inside the same atomic write
     that spends it, and counts TWO daily caps off its own ledger. Everything here is a
     convenience for the UI — see docs/credit-gifts-setup.md.

     ⭐⭐ THE CAPS ARE ASYMMETRIC ON PURPOSE — giving is loose, receiving is tight. Nate,
     2026-08-13: *"you can give out as much as you want, but you can only receive 50 per
     day."* Capping the giver slows one throwaway account down; capping the RECEIVER is
     what actually ceilings a funnel of them, and it is the half no honest player notices.
     ⚠ NEITHER NUMBER APPEARS IN THIS FILE and neither is checked here — the SQL is the only
     place they are written down, so changing one is an edit there and nothing to redeploy.

     ⭐ A GIFT THAT HITS A RAIL COMES BACK SHORTENED, NOT REFUSED: `{ok:true, amount, kept,
     limit}` where `amount` is what moved and `kept` never left the giver. `amount` can be
     smaller than what was asked for, so nothing downstream may assume the two are equal.

     ⚠ IT SHIPS BEFORE ITS MIGRATION, like the puzzle reports did, and degrades the same
     way: every call RESOLVES `{ok:false, reason}` and never throws. */
  var GIFT_TIERS = [1, 5, 10, 25, 50];
  PJCC.GIFT_TIERS = GIFT_TIERS;

  /* Does the function exist yet? Probed ONCE per session by calling it with an amount the
     ladder does not allow: if the function is there it answers `bad_amount` without
     touching a single credit, and if it is not there the call errors. That is the whole
     detection — no config flag to flip, no page to redeploy when Nate runs the SQL.
     ⚠ CACHED IN sessionStorage, not memory: every leaderboard render asks, and a probe per
     render would be a round trip per page view for an answer that cannot change mid-visit.
     ⚠ A signed-out visitor never probes. They cannot gift, so the answer is irrelevant and
     the request would be pure waste on the most common kind of visit. */
  var giftProbe = null;
  PJCC.giftsEnabled = function () {
    if (giftProbe) return giftProbe;
    giftProbe = (async function () {
      if (!sb || !PJCC.currentUser()) return false;
      try {
        var cached = sessionStorage.getItem('pjcc.gifts.on');
        if (cached === '1') return true;
        if (cached === '0') return false;
      } catch (e) {}
      var on = false;
      try {
        var r = await sb.rpc('gift_credits', { p_to_codename: '', p_amount: 0 });
        // the function answering AT ALL is the signal — what it says is irrelevant here
        on = !r.error;
      } catch (e) { on = false; }
      try { sessionStorage.setItem('pjcc.gifts.on', on ? '1' : '0'); } catch (e) {}
      return on;
    })();
    return giftProbe;
  };

  /* Hand somebody credits. Resolves {ok:true, amount, requested, kept, limit, to, balance}
     or {ok:false, reason}.
     ⚠ `amount` IS NOT `amount asked for` — a gift that runs into either daily rail is
     shortened by the server, and `kept` is the part that never left. Read `amount`.
     ⚠ The local profile's credit count is corrected from the SERVER's returned balance
     rather than by subtracting here — the two would agree today and drift the first time a
     gift races anything else that spends. Never compute a balance you were just told. */
  PJCC.giftCredits = async function (codename, amount) {
    if (!sb) return { ok: false, reason: 'offline' };
    if (!PJCC.currentUser()) return { ok: false, reason: 'signed_out' };
    if (GIFT_TIERS.indexOf(amount) < 0) return { ok: false, reason: 'bad_amount' };
    try {
      var r = await sb.rpc('gift_credits', { p_to_codename: String(codename || ''), p_amount: amount });
      if (r.error) return { ok: false, reason: 'offline' };
      var out = r.data || { ok: false, reason: 'offline' };
      if (out.ok && profile && typeof out.balance === 'number') {
        profile.credits = out.balance;
        emit();
      }
      return out;
    } catch (e) { return { ok: false, reason: 'offline' }; }
  };

  /* Gifts you have received, newest first — for a "somebody paid for your good day" line.
     Resolves [] on any failure, so a caller can render it without a guard. */
  PJCC.giftsReceived = async function (limit) {
    if (!sb || !PJCC.currentUser()) return [];
    try {
      var r = await sb.from('credit_gifts')
        .select('amount,created_at,from_id')
        .order('created_at', { ascending: false })
        .limit(limit || 10);
      return (r && r.data) ? r.data : [];
    } catch (e) { return []; }
  };

  /* ══ FOLLOW — A PRIVATE BOOKMARK, NOT A RELATIONSHIP ══════════════════════════════
     2026-08-19. Nate asked to "add them as a friend"; this is the one-way version, and the
     shape is deliberate — docs/follows-setup.md carries the argument in full:

       · your follow list is readable by YOU and nobody else (the RLS policy is
         `auth.uid() = follower_id`, full stop)
       · there is no follower count anywhere, and no SQL function that could return one
       · following somebody notifies them of nothing

     ⭐ THAT IS WHY IT ADDS NO MODERATION SURFACE. Nothing to accept, nothing to be
     rejected from, no popularity number to chase, and — as everywhere else on this site —
     no field a person can type a sentence into.

     ⚠ IT SHIPS BEFORE ITS MIGRATION, like the gifts and the puzzle reports, and degrades
     the same way: every call RESOLVES `{ok:false, reason}` and never throws. */

  /* Does the function exist yet? Probed ONCE per session by calling it with an empty
     codename and `false` — an UNFOLLOW of nobody, which cannot write a row whether the
     function exists or not. Exactly the trick `giftsEnabled` uses with an off-ladder
     amount, for exactly the same reason: the probe must not be able to change anything.
     ⚠ A signed-out visitor never probes; they cannot follow, so the request is pure waste. */
  var followProbe = null;
  PJCC.followsEnabled = function () {
    if (followProbe) return followProbe;
    followProbe = (async function () {
      if (!sb || !PJCC.currentUser()) return false;
      try {
        var cached = sessionStorage.getItem('pjcc.follows.on');
        if (cached === '1') return true;
        if (cached === '0') return false;
      } catch (e) {}
      var on = false;
      try {
        var r = await sb.rpc('set_follow', { p_codename: '', p_on: false });
        on = !r.error;                 // answering AT ALL is the signal
      } catch (e) { on = false; }
      try { sessionStorage.setItem('pjcc.follows.on', on ? '1' : '0'); } catch (e) {}
      return on;
    })();
    return followProbe;
  };

  /* THE WHOLE LIST, ONCE, AND THEN KEPT. Every card that opens wants to know one thing —
     "am I following this person" — and the honest way to answer it is not a query per card.
     One `list_following()` per session fills this cache; `setFollow` keeps it true
     afterward, so the button is never asking the server what it just told the server.
     ⚠ NULL means "not loaded yet", which is NOT the same as "following nobody" — the
     difference is why `isFollowing` can answer synchronously without ever guessing. */
  var followCache = null;

  PJCC.following = async function (force) {
    if (followCache && !force) return followCache;
    if (!sb || !PJCC.currentUser()) return (followCache = []);
    try {
      var r = await sb.rpc('list_following');
      followCache = (r && !r.error && Array.isArray(r.data)) ? r.data : [];
    } catch (e) { followCache = []; }
    return followCache;
  };

  // Synchronous, and deliberately so — a card renders in one pass. Returns false until
  // `following()` has resolved at least once, which is the state that draws "Follow".
  PJCC.isFollowing = function (codename) {
    if (!followCache) return false;
    for (var i = 0; i < followCache.length; i++) {
      if (followCache[i] && followCache[i].codename === codename) return true;
    }
    return false;
  };

  /* Follow or unfollow. Resolves {ok:true, following} or {ok:false, reason}.
     ⚠ THE CACHE IS UPDATED FROM THE SERVER'S ANSWER, never from the argument — same rule
     as the gift balance. If the server refused (a full list, a name that has since gone),
     the button must not move. */
  PJCC.setFollow = async function (codename, on) {
    if (!sb) return { ok: false, reason: 'offline' };
    if (!PJCC.currentUser()) return { ok: false, reason: 'signed_out' };
    try {
      var r = await sb.rpc('set_follow', { p_codename: String(codename || ''), p_on: !!on });
      if (r.error) return { ok: false, reason: 'offline' };
      var out = r.data || { ok: false, reason: 'offline' };
      if (out.ok && followCache) {
        followCache = followCache.filter(function (f) { return f && f.codename !== codename; });
        // re-read on the next `following()` so the panel gets the real row (companion, since)
        if (out.following) followCache = null;
      }
      return out;
    } catch (e) { return { ok: false, reason: 'offline' }; }
  };

  PJCC.reportPuzzle = async function (payload) {
    if (!sb) return { ok: false, reason: 'offline' };
    try {
      var u = PJCC.currentUser();
      var row = {
        puzzle_id: String(payload.puzzle_id || '').slice(0, 64),
        fen:       String(payload.fen || '').slice(0, 120),
        motif:     String(payload.motif || '').slice(0, 40),
        goal:      String(payload.goal || '').slice(0, 40),
        line:      String(payload.line || '').slice(0, 200),
        rating:    parseInt(payload.rating, 10) || null,
        mode:      String(payload.mode || '').slice(0, 24),
        step:      parseInt(payload.step, 10) || null,
        claim:     String(payload.claim || '').slice(0, 24),
        note:      String(payload.note || '').slice(0, 500),
        // THE TRIAGE — the machine's own opinion, written at report time
        verdict:   String(payload.verdict || '').slice(0, 24),
        verdict_cp: (payload.verdict_cp === null || payload.verdict_cp === undefined)
                     ? null : parseInt(payload.verdict_cp, 10),
        reporter:  u ? u.id : null,
        codename:  (profile && profile.codename) || null
      };
      var r = await sb.from('puzzle_reports').insert(row);
      /* ⚠ NAME THE CAUSE, DON'T JUST SAY NO (2026-08-24). This used to hand back the raw
         Postgrest string, which the panel then didn't print, so every failure looked the
         same: "could not send it from here". A report that bounces because the TABLE was
         never created and a report that bounces because the player is on a train are two
         different problems with two different fixes, and only one of them is mine.
         Classified exactly like PJCC.puzzleReports() below — one definition of "the
         migration has not been run", not two that can disagree. */
      if (r && r.error) {
        var m = (r.error.message || ''), code = r.error.code || '';
        var missing = code === '42P01' || code === 'PGRST205' || /does not exist|schema cache/i.test(m);
        return { ok: false, reason: missing ? 'no-table' : 'rejected', detail: m, code: code };
      }
      return { ok: true };
    } catch (e) { return { ok: false, reason: 'failed', detail: (e && e.message) || '' }; }
  };
  /* The private read side. Returns [] for anybody who is not the Creator — the RLS policy
     is what actually enforces that; this is only the query.

     ⚠ IT REPORTS *WHY* IT IS EMPTY, and the first version did not. It swallowed every
     error and returned `[]`, so the page could only offer a guess: "either no reports yet,
     or you are not signed in as the Creator, or the migration has not been run." Three
     causes, one blank screen, and nothing on the page or in the console to tell them
     apart — which is how you end up asking a person to debug a database from a sentence.
     Failing softly is right ([[down-never-stuck]]); failing ANONYMOUSLY is not, and they
     are not the same thing. `reason` is what the page prints. */
  PJCC.puzzleReports = async function (limit) {
    if (!sb) return { rows: [], reason: 'offline' };
    try {
      var r = await sb.from('puzzle_reports').select('*')
        .order('created_at', { ascending: false }).limit(limit || 200);
      if (r && r.error) {
        var m = (r.error.message || ''), code = r.error.code || '';
        // 42P01 = undefined_table. PostgREST also 404s an unknown table with PGRST205.
        var missing = code === '42P01' || code === 'PGRST205' || /does not exist|schema cache/i.test(m);
        return { rows: [], reason: missing ? 'no-table' : 'error', detail: m, code: code };
      }
      return { rows: (r && r.data) || [], reason: null };
    } catch (e) { return { rows: [], reason: 'error', detail: (e && e.message) || 'failed' }; }
  };
  /* Who the database thinks the Creator is — `match_config` is readable by any signed-in
     user (park-tables-setup.md), so the reports page can say "you are X, the Creator is Y"
     instead of leaving a blank page to be interpreted. Returns:
       a uuid   — the row exists
       null     — the table exists and is EMPTY (step 2 of park-tables-setup.md never run:
                  the read policy then compares auth.uid() against NULL and denies EVERYONE,
                  including Nate, which looks exactly like "no reports yet")
       false    — no match_config table at all */
  PJCC.creatorId = async function () {
    if (!sb) return false;
    try {
      var r = await sb.from('match_config').select('creator_id').limit(1);
      if (r && r.error) return false;
      return (r.data && r.data[0] && r.data[0].creator_id) || null;
    } catch (e) { return false; }
  };

  // --- "Beat the Creator" ghost scores -------------------------------------------
  // Nate's own marks, posted as the target to chase. Units match each leaderboard.
  // Update these as the creator sets new personal bests.
  var GHOSTS = {
    'clearance-delta': 850, 'notation-run': 1500, 'fork-in-the-road': 18,
    'sand-mine-depths': 200, 'pirc-protocol': 7, 'shogi-island': 40, 'blindfold': 12,
    'tower-defense': 4200, 'siege-endless': 22, 'sky-run': 9000, 'daily-dispatch': 100,
    'dungeon': 6, 'reading-room': 160
  };
  PJCC.GHOSTS = GHOSTS;
  PJCC.ghostFor = function (game) { return (typeof GHOSTS[game] === 'number') ? GHOSTS[game] : null; };
  // Compare a score to the creator's ghost: {target, beat, delta} or null if no ghost.
  PJCC.vsGhost = function (game, score) {
    var t = PJCC.ghostFor(game); if (t === null) return null;
    return { target: t, beat: (score || 0) >= t, delta: (score || 0) - t };
  };

  // --- Seasons / Tours (monthly legs of the Journey to Chess City) ----------------
  var SEASON_NAMES = [
    'Checker Town Open', 'Sand Mine Circuit', 'The Fork Trials', 'Dead Drop Season',
    'Delta Clearance Cup', 'Pirc Crossing Tour', 'Shogi Island Invitational', 'Chess City Masters',
    'Journey Road Rally', 'Quartermaster Classic', 'Royal Decree Series', "Founder's Finale"
  ];
  PJCC.seasonInfo = function (when) {
    var d = when || new Date();
    var y = d.getFullYear(), m = d.getMonth();           // 0..11
    var idx = (y * 12 + m);
    var name = SEASON_NAMES[m % SEASON_NAMES.length];
    var monthEnd = new Date(y, m + 1, 1);
    var daysLeft = Math.ceil((monthEnd - d) / 86400000);
    var id = y + '-' + ('0'+(m+1)).slice(-2);            // e.g. 2026-06 — usable as a score seed
    return { id: id, index: idx, name: name + ' ' + y, shortName: name, year: y, month: m + 1, daysLeft: daysLeft };
  };

  // Season race: this month's standings, tallied from scores posted since the 1st.
  // Date-bounded, so it auto-resets every month with no server changes. Returns
  // [{codename, companion, plays, points}] ranked by activity then points.
  PJCC.seasonRace = async function (limit) {
    if (!sb) return [];
    var s = PJCC.seasonInfo();
    var monthStart = new Date(s.year, s.month - 1, 1).toISOString();
    var r = await sb.from('scores')
      .select('score,created_at,profiles(codename,companion)')
      .gte('created_at', monthStart)
      .order('created_at', { ascending: false })
      .limit(2000);
    if (r.error || !r.data) return [];
    var tally = {};
    r.data.forEach(function (row) {
      var name = row.profiles ? row.profiles.codename : null; if (!name) return;
      if (!tally[name]) tally[name] = { codename: name, companion: row.profiles.companion, plays: 0, points: 0 };
      tally[name].plays += 1; tally[name].points += (row.score || 0);
    });
    return Object.keys(tally).map(function (k) { return tally[k]; })
      .sort(function (a, b) { return (b.plays - a.plays) || (b.points - a.points); })
      .slice(0, limit || 25);
  };

  // (PJCC.HALL_OF_FAME — the list of past season champions — was removed 2026-07-12
  //  with the Hall of Fame itself (Nate: "remove it completely, from all pages"). It
  //  never held a single entry: no season has ever closed. The idea is parked in
  //  FUTURE-IDEAS; restore this array and /hall-of-fame/ from git if it comes back.)

  // --- companion pet-mood (decays with time since last played) ---------------
  PJCC.petMood = function (stats) {
    var last = 0;
    (stats || []).forEach(function (s) { var t = s.updated_at ? Date.parse(s.updated_at) : 0; if (t > last) last = t; });
    if (!last) return { state: 'New', emoji: '🥚', line: 'Your companion is waiting for its first adventure.' };
    var hrs = (Date.now() - last) / 3600000;
    if (hrs < 24)  return { state: 'Happy',   emoji: '💛', line: 'Bright-eyed and ready — you played recently.' };
    if (hrs < 72)  return { state: 'Content', emoji: '🙂', line: "Doing fine, but wouldn't mind a round." };
    if (hrs < 168) return { state: 'Lonely',  emoji: '🥺', line: 'Misses you. A game would cheer it up.' };
    return { state: 'Restless', emoji: '😔', line: "It's been a while. Play a round to lift its spirits." };
  };

  // --- profile themes (cosmetic accent for the Dossier) ----------------------
  var THEMES = {
    'default': { label: 'Operative Gold',   price: 0,  accent: '#F5C518', bg: 'linear-gradient(135deg,#1f1147,#34206f)' },
    // ⚑ PRICES RE-TIERED 2026-08-04 with the avatar shelf — see the note on AVATAR_SHOP.
    'jade':    { label: 'Jade Dispatch',    price: 110, accent: '#6bffb8', bg: 'linear-gradient(135deg,#0f2a22,#143d31)' },
    'crimson': { label: 'Red Clearance',    price: 110, accent: '#ff6b6b', bg: 'linear-gradient(135deg,#2a0d12,#1a090c)' },
    'sakura':  { label: 'Shogi Sakura',     price: 190, accent: '#ff8fd0', bg: 'linear-gradient(135deg,#2a1030,#3d1640)' },
    'mono':    { label: 'Classified Mono',  price: 190, accent: '#cdbcf2', bg: 'linear-gradient(135deg,#16161c,#27272f)' },
    // new stock 2026-07-27 — the deep end of the shelf
    'tide':    { label: 'Sea Crossing',     price: 330, accent: '#56d0ff', bg: 'linear-gradient(135deg,#07253a,#0d4260)' },
    'sandmine':{ label: 'Mine Lantern',     price: 440, accent: '#fcbc3c', bg: 'linear-gradient(135deg,#2b1d09,#4a3410)' },
    'city':    { label: 'Chess City Neon',  price: 680, accent: '#ff77a8', bg: 'linear-gradient(135deg,#1b0f33,#3d1450)' },
    // 2026-08-03 restock. `maple` is the chess canon's own two woods (_pjcc-22-chess-canon)
    // wearing them as a profile accent for the first time.
    'maple':   { label: 'Maple & Walnut',   price: 250, accent: '#e9d3a4', bg: 'linear-gradient(135deg,#2b1d0f,#4a3320)' },
    'midnight':{ label: 'Midnight Board',   price: 840, accent: '#8fb8ff', bg: 'linear-gradient(135deg,#080b18,#131c33)' },
    // vault themes — no price, absent from THEME_SHOP; the altar hands these back
    'ember':   { label: 'Altar Ember',      accent: '#ffb066', bg: 'linear-gradient(135deg,#2e1608,#4a2410)', vault: true },
    'hollow':  { label: 'Empty Hands',      accent: '#9a7fd4', bg: 'linear-gradient(135deg,#14102a,#241a44)', vault: true },
    'nothing': { label: 'Nothing Comes Back', accent: '#ff8fa0', bg: 'linear-gradient(135deg,#24080f,#3d0f1a)', vault: true },
    'sixdays': { label: 'Six Days',         accent: '#6bffb8', bg: 'linear-gradient(135deg,#07231a,#0d3d2d)', vault: true },
    // earned theme — see EARNED. No price and not in THEME_SHOP, same as a vault one.
    'ledger':  { label: 'Field Ledger',     accent: '#cdbcf2', bg: 'linear-gradient(135deg,#1a1730,#2a2547)', earned: true }
  };
  PJCC.THEMES = THEMES;
  PJCC.THEME_SHOP = ['jade', 'crimson', 'sakura', 'maple', 'mono', 'tide', 'sandmine', 'city', 'midnight'];
  PJCC.themeFor = function (prof) { var k = prof && prof.companion && prof.companion.theme; return THEMES[k] || THEMES['default']; };
  PJCC.ownedThemes = function (prof) { return ['default'].concat((prof && prof.companion && prof.companion.owned_themes) || []); };
  var SKIN_KEY = 'pjcc.skin';
  PJCC.setTheme = function (key) {
    if (key && !THEMES[key]) throw new Error('unknown theme');
    try { localStorage.setItem(SKIN_KEY, key || 'default'); } catch (e) {}   // cache so games + guests can read it
    return updateCompanion({ theme: key || 'default' });
  };
  // The skin to use inside a game: cached local choice, else the signed-in profile's theme.
  PJCC.localTheme = function () {
    var k = null;
    try { k = localStorage.getItem(SKIN_KEY); } catch (e) {}
    if (!k && profile && profile.companion) k = profile.companion.theme;
    return THEMES[k] || THEMES['default'];
  };
  // Board skins in games: paint the chosen accent into a game's CSS variables.
  // Call once at boot, e.g. PJCC.applyGameSkin(['--gold']) or with an element root.
  PJCC.applyGameSkin = function (vars, root) {
    try {
      var t = PJCC.localTheme();
      var el = root || document.documentElement;
      el.style.setProperty('--pjcc-skin', t.accent);
      if (t !== THEMES['default']) (vars || []).forEach(function (v) { el.style.setProperty(v, t.accent); });   // only override when a skin is actually chosen
      return t;
    } catch (e) { return null; }
  };
  PJCC.buyTheme = async function (key) {
    var t = THEMES[key];
    if (!t || !t.price) throw new Error('not for sale');
    var owned = (profile.companion && profile.companion.owned_themes) || [];
    if (owned.indexOf(key) !== -1) throw new Error('already owned');
    await PJCC.spendCredits(t.price);
    return updateCompanion({ owned_themes: owned.concat([key]), theme: key });
  };

  // --- The Gambit (the altar of sacrifice) -----------------------------------
  // Reads the same credits / owned-gear the Shopkeeper writes, and lets a game
  // consume (sacrifice) or grant them. Values are credits-equivalent so the
  // altar's courage meter can weigh an offering.
  function prettyAvatar(k) {
    return HUMAN_LABELS[k] || k.replace(/^(pc|sp)-/, '').replace(/^\w/, function (c) { return c.toUpperCase(); });
  }
  /* Everything the operative owns that CAN BE LAID ON THE ALTAR, with a value.
     ⚠ EARNED PIECES ARE DELIBERATELY ABSENT FROM THIS LIST, and the omission is the lock.
     This is the list the altar offers you and the list sellValue() searches, so a piece
     that isn't here can be neither burned nor sold — which it must not be, because its
     requirement stays true forever and burn → re-claim → burn would print credits. See the
     EARNED block up top. `earnedOwned()` below is what surfaces them for wearing. */
  PJCC.ownedCollectables = function () {
    var comp = (profile && profile.companion) || {}, out = [];
    (comp.owned || []).forEach(function (k) {
      if (earnedEntry('avatar', k)) return;
      var a = AVATAR_SHOP.filter(function (s) { return s.key === k; })[0];
      var v = vaultEntry('avatar', k);
      if (a) out.push({ kind: 'avatar', key: k, value: a.price, glyph: AVATARS[k] || '★', label: prettyAvatar(k) });
      else if (v) out.push({ kind: 'avatar', key: k, value: v.value, glyph: AVATARS[k] || '★', label: v.label, vault: true });
    });
    (comp.owned_titles || []).forEach(function (k) {
      if (earnedEntry('title', k)) return;
      var t = PJCC.TITLE_SHOP.filter(function (s) { return s.key === k; })[0];
      var v = vaultEntry('title', k);
      out.push({ kind: 'title', key: k, value: t ? t.price : (v ? v.value : 20), glyph: '🏷', label: (TITLES[k] && TITLES[k].label) || k, vault: !!v });
    });
    (comp.owned_themes || []).forEach(function (k) {
      if (earnedEntry('theme', k)) return;
      var v = vaultEntry('theme', k);
      out.push({ kind: 'theme', key: k, value: (THEMES[k] && THEMES[k].price) || (v ? v.value : 15), glyph: '🎨', label: (THEMES[k] && THEMES[k].label) || k, vault: !!v });
    });
    return out.map(withBand);
  };
  /* Every list below hands back the same shape, so nothing downstream has to remember to
     call PJCC.rarity() — a rarity that is only right where somebody remembered to compute
     it is worse than none. Attached HERE, in the one place all three lists funnel through. */
  function withBand(c) { c.band = rarityOf(c.value, c.vault); return c; }
  // Collectables NOT yet owned — candidate "boons" the board can hand back.
  PJCC.unownedCollectables = function () {
    var have = {}; PJCC.ownedCollectables().forEach(function (c) { have[c.kind + ':' + c.key] = 1; });
    var out = [];
    AVATAR_SHOP.forEach(function (a) { if (!have['avatar:' + a.key]) out.push({ kind: 'avatar', key: a.key, value: a.price, glyph: AVATARS[a.key] || '★', label: prettyAvatar(a.key) }); });
    PJCC.TITLE_SHOP.forEach(function (t) { if (!have['title:' + t.key]) out.push({ kind: 'title', key: t.key, value: t.price, glyph: '🏷', label: (TITLES[t.key] && TITLES[t.key].label) || t.key }); });
    PJCC.THEME_SHOP.forEach(function (k) { if (!have['theme:' + k]) out.push({ kind: 'theme', key: k, value: THEMES[k].price, glyph: '🎨', label: THEMES[k].label }); });
    return out.map(withBand);
  };
  // THE VAULT — the unowned no-sale collectables. Only the altar hands these out,
  // so this list is deliberately separate from the shop pool above.
  PJCC.VAULT = VAULT;
  PJCC.vaultCollectables = function () {
    var have = {}; PJCC.ownedCollectables().forEach(function (c) { have[c.kind + ':' + c.key] = 1; });
    return VAULT.filter(function (v) { return !have[v.kind + ':' + v.key]; }).map(function (v) {
      return withBand({ kind: v.kind, key: v.key, value: v.value, vault: true, label: v.label,
        glyph: v.kind === 'avatar' ? (AVATARS[v.key] || '★') : v.kind === 'title' ? '🏷' : '🎨' });
    });
  };
  PJCC.isVault = function (kind, key) { return !!vaultEntry(kind, key); };

  /* ══ THE EARNED CLASS — met? held? and the claim ═══════════════════════════════════
     `met()` is the only place a requirement is ever evaluated, so the collection page, the
     claim and any future surface can never disagree about whether you've done the thing. */
  PJCC.EARNED = EARNED;
  PJCC.isEarned = function (kind, key) { return !!earnedEntry(kind, key); };
  function lsFlag(k) {
    try { var v = localStorage.getItem(k); return !!v && v !== '0' && v !== 'false'; } catch (e) { return false; }
  }
  PJCC.earnedMet = function (e, prof, stats) {
    var rule = e.rule || '';
    if (rule.indexOf('found:') === 0) return lsFlag(rule.slice(6));
    var c = statsCtx(prof || profile, stats);
    if (rule.indexOf('plays:') === 0) return c.totalPlays >= parseInt(rule.slice(6), 10);
    if (rule.indexOf('ach:') === 0) {
      var want = rule.slice(4), got = false;
      PJCC.earnedAchievements(prof || profile, stats).forEach(function (a) { if (a.key === want && a.earned) got = true; });
      return got;
    }
    return false;
  };
  PJCC.holdsEarned = function (e, prof) {
    var comp = ((prof || profile) && (prof || profile).companion) || {};
    var list = e.kind === 'avatar' ? (comp.owned || [])
             : e.kind === 'title'  ? (comp.owned_titles || []) : (comp.owned_themes || []);
    return list.indexOf(e.key) !== -1;
  };
  // Everything earned that you actually hold — for the Quartermaster's equip shelves.
  PJCC.earnedOwned = function (prof) {
    return EARNED.filter(function (e) { return PJCC.holdsEarned(e, prof); }).map(function (e) {
      return withBand({ kind: e.kind, key: e.key, value: e.value, earned: true, label: e.label, how: e.how,
        glyph: e.kind === 'avatar' ? (AVATARS[e.key] || '★') : e.kind === 'title' ? '🏷' : '🎨' });
    });
  };
  /* Claiming is EXPLICIT — a button, never a silent write on render. Two reasons and the
     second is the load-bearing one: a page that grants things while you look at it can't
     tell you that it did, so the moment you earned it passes unmarked; and a write that
     fires on every render of a page anyone can open is a write nobody is auditing. */
  PJCC.claimEarned = async function (kind, key, stats) {
    var u = PJCC.currentUser(); if (!sb || !u) throw new Error('not signed in');
    var e = earnedEntry(kind, key); if (!e) throw new Error('not an earned collectable');
    if (PJCC.holdsEarned(e)) throw new Error('already claimed');
    if (!PJCC.earnedMet(e, profile, stats)) throw new Error('not earned yet');
    await PJCC.grantCollectable(kind, key);
    return e;
  };

  /* ══ THE CATALOGUE — every collectable on the site, in one list ═══════════════════
     Nate 2026-08-03: "Create a 'pokedex' of collectables. Collect them all."

     ONE function, because a collection page that built its own list would drift from the
     shop the first time either changed, and a display case that is missing a piece is
     worse than no display case. Everything here is DERIVED — add an item to AVATAR_SHOP,
     VAULT or EARNED and it appears in the collection with no second edit.

     Each entry carries `source` ('shop' | 'vault' | 'earned'), `have`, and — for the
     earned ones — `met`, so the page can render locked / claimable / held without
     re-deriving any rule. `prof` and `stats` are passed in so it works SIGNED OUT: with
     no profile, everything simply reads as not-yet-held, which is exactly the right
     answer for a stranger and makes the page a catalogue rather than a locked door. */
  PJCC.catalogue = function (prof, stats) {
    prof = prof || profile;
    var comp = (prof && prof.companion) || {};
    var hasA = comp.owned || [], hasT = comp.owned_titles || [], hasH = comp.owned_themes || [];
    var has = function (kind, key) {
      return (kind === 'avatar' ? hasA : kind === 'title' ? hasT : hasH).indexOf(key) !== -1;
    };
    var out = [];
    AVATAR_SHOP.forEach(function (a) {
      out.push({ kind: 'avatar', key: a.key, label: prettyAvatar(a.key), glyph: AVATARS[a.key] || '★',
        value: a.price, source: 'shop', have: has('avatar', a.key) });
    });
    PJCC.TITLE_SHOP.forEach(function (t) {
      out.push({ kind: 'title', key: t.key, label: (TITLES[t.key] && TITLES[t.key].label) || t.key, glyph: '🏷',
        value: t.price, source: 'shop', have: has('title', t.key) });
    });
    PJCC.THEME_SHOP.forEach(function (k) {
      out.push({ kind: 'theme', key: k, label: THEMES[k].label, glyph: '🎨',
        value: THEMES[k].price, source: 'shop', have: has('theme', k) });
    });
    VAULT.forEach(function (v) {
      out.push({ kind: v.kind, key: v.key, label: v.label, vault: true, source: 'vault',
        glyph: v.kind === 'avatar' ? (AVATARS[v.key] || '★') : v.kind === 'title' ? '🏷' : '🎨',
        value: v.value, have: has(v.kind, v.key) });
    });
    EARNED.forEach(function (e) {
      var held = has(e.kind, e.key);
      out.push({ kind: e.kind, key: e.key, label: e.label, earned: true, source: 'earned', how: e.how,
        glyph: e.kind === 'avatar' ? (AVATARS[e.key] || '★') : e.kind === 'title' ? '🏷' : '🎨',
        value: e.value, have: held, met: held || PJCC.earnedMet(e, prof, stats) });
    });
    return out.map(withBand);
  };
  PJCC.catalogueCount = function (prof, stats) {
    var all = PJCC.catalogue(prof, stats), held = 0;
    all.forEach(function (c) { if (c.have) held++; });
    return { held: held, total: all.length };
  };
  // Award credits (positive add_credits) — the board's blessing.
  PJCC.grantCredits = async function (amount) {
    var u = PJCC.currentUser(); if (!sb || !u) throw new Error('not signed in');
    amount = Math.abs(parseInt(amount, 10) || 0); if (!amount) return profile ? profile.credits : 0;
    var cr = await sb.rpc('add_credits', { amount: amount });
    if (cr.error) throw cr.error;
    if (typeof cr.data === 'number' && profile) profile.credits = cr.data;
    emit(); return profile ? profile.credits : 0;
  };
  // Consume an owned collectable (the sacrifice); unequip it if it was active.
  PJCC.burnCollectable = async function (kind, key) {
    var comp = (profile && profile.companion) || {}, patch = {};
    if (kind === 'avatar') { patch.owned = (comp.owned || []).filter(function (k) { return k !== key; }); if (comp.avatar === key) patch.avatar = 'human-1'; }
    else if (kind === 'title') { patch.owned_titles = (comp.owned_titles || []).filter(function (k) { return k !== key; }); if (comp.title === key) patch.title = null; }
    else if (kind === 'theme') { patch.owned_themes = (comp.owned_themes || []).filter(function (k) { return k !== key; }); if (comp.theme === key) patch.theme = 'default'; }
    else throw new Error('unknown kind');
    return updateCompanion(patch);
  };
  /* ── SELLING BACK, AT A QUARTER (2026-07-28) ─────────────────────────────────────
     Nate: "Let's be able to sell items for 25% value. Shop, altar — I'd like to err on
     the side of miser, as opposed to generous. We can always make it more generous if we
     need later."

     So every number here leans mean, on purpose, and every one of them is a single edit:
       · SELL_RATE 0.25, and it FLOORS. A 25-credit piece returns 6, not 6.25 and not 7.
         (Floor, not round, is the miser choice on every price ending in an odd quarter.)
       · The VAULT DOESN'T SELL. Those are the no-sale collectables the altar hands back,
         and there are two reasons they stay out. The lore one: they are the one thing on
         the site that is yours rather than currency. The arithmetic one, which matters
         more — the altar can return a 260-value boon, so a sell path turns "lay something
         down and see what happens" into a repeatable 65-credit faucet. Closing it keeps
         the altar a gamble instead of a mint.
       · Nothing free is sellable. The eight starter faces aren't in AVATAR_SHOP, so
         ownedCollectables() never lists them and there is nothing to sell.
       · Sell → re-buy costs you 75%. That is the whole point: this is a way to undo a
         purchase you regret at a real cost, not a way to shuffle credits.

     Equipped gear can be sold; burnCollectable already unequips it and falls back to the
     free defaults, so the profile can never end up wearing something it doesn't own. The
     UI asks first — it is destructive and it cannot be undone. */
  var SELL_RATE = 0.25;
  PJCC.SELL_RATE = SELL_RATE;
  PJCC.sellValue = function (kind, key) {
    if (vaultEntry(kind, key)) return 0;                 // the vault is not for sale
    var owned = PJCC.ownedCollectables();
    for (var i = 0; i < owned.length; i++) {
      if (owned[i].kind === kind && owned[i].key === key) {
        return owned[i].vault ? 0 : Math.floor((owned[i].value || 0) * SELL_RATE);
      }
    }
    return 0;                                            // you don't own it
  };
  PJCC.sellCollectable = async function (kind, key) {
    var u = PJCC.currentUser(); if (!sb || !u) throw new Error('not signed in');
    var paid = PJCC.sellValue(kind, key);
    if (!paid) throw new Error('that one is not for sale');
    // Burn FIRST. If the credit grant fails we have taken the item and given nothing, which
    // is recoverable by hand; the other order hands out credits for an item still owned,
    // which is a duplication bug and a currency faucet.
    await PJCC.burnCollectable(kind, key);
    await PJCC.grantCredits(paid);
    return { paid: paid, credits: profile ? profile.credits : 0 };
  };

  // Grant an owned collectable (a rare boon the board hands back).
  PJCC.grantCollectable = async function (kind, key) {
    var comp = (profile && profile.companion) || {};
    if (kind === 'avatar') { var o = (comp.owned || []).slice(); if (o.indexOf(key) === -1) o.push(key); return updateCompanion({ owned: o }); }
    if (kind === 'title') { var ot = (comp.owned_titles || []).slice(); if (ot.indexOf(key) === -1) ot.push(key); return updateCompanion({ owned_titles: ot }); }
    if (kind === 'theme') { var oth = (comp.owned_themes || []).slice(); if (oth.indexOf(key) === -1) oth.push(key); return updateCompanion({ owned_themes: oth }); }
    throw new Error('unknown kind');
  };
})();
