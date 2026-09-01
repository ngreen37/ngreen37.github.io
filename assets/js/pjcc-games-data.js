/* ============================================================
   PJCC games registry — single source of truth.
   Used by the /games/ hub (the Gauntlet Legends portal screen)
   and by every hall page (Arcade = Mega Man 2, etc.) via pjcc-hall.js.
   cat keys: learn | arcade | dev | vault | terminated
   ============================================================ */
window.PJCC_GAMES = [
  { slug:'notation-run',      name:'Notation Blitz',     cryptic:'Learn and keep up with the beautiful language of Chess', icon:'♫', accent:'#f8d800', cat:'learn',  score:['notation-run','score'] },
  // Free-Play Board — TAKEN OUT OF LEARN + ACADEMY 2026-07-15 (Nate: "take out the Free
  // Board completely. We'll do it later."). Delisted from the hub; the page still builds
  // at /games/free-play/. Restore by uncommenting this one line.
  // { slug:'free-play',         name:'Free-Play Board',    cryptic:'A quiet board to think on',        icon:'♟', accent:'#9fe8c0', cat:'learn' },
  // back to Learn 2026-07-14 (Nate: "pump this out as our main Puzzle Feature")
  // noHall (2026-07-22 Nate: "Take Fork in the Road OUT of the games page") — Fork is the
  // "Puzzles" link in the site drawer now, so it is hidden from the combined games grid.
  // The game + its page are untouched; only the hall card is suppressed (see pjcc-hall.js).
  { slug:'fork-in-the-road',  name:'Fork in the Road',   cryptic:'Spot the only move',               icon:'⚔', accent:'#00e436', cat:'learn',  score:['fork-in-the-road','solved'], engine:true, noHall:true },
  // ⛑ RENAMED TO *TABIYA* 2026-08-31 (Nate). A tabiya is the position an opening is
  // aiming at, which is exactly what this room drills you toward.
  // ⚠⚠ THE SLUG DID NOT MOVE, AND MUST NOT. `pirc-protocol` is an IDENTIFIER — it keys
  // the saved score (`score:` below), PJCC.BOUNTY_GAMES, the flawless-threshold table in
  // pjcc-profile.js and the dossier's label map, and it is the permalink. Renaming it would
  // orphan every score anybody has already banked. Same rule the two-brand split runs on:
  // display text changes, identifiers keep the old spelling. [[site-two-brand-split]]
  { slug:'pirc-protocol',     name:'Tabiya',             cryptic:'Learn the book by heart',          icon:'♚', accent:'#fc9838', cat:'dev',    score:['pirc-protocol','score'], neu:'2026-06-22', engine:true },
  // Shogi Island — slow-rolled 2026-07-04: pulled from the hub/halls; reachable only via the floating 将 icon on the splash. Restore by uncommenting.
  // { slug:'shogi-island',      name:'Shogi Island',       cryptic:'Foreign rules. Familiar war',      icon:'将', accent:'#fcbcb0', cat:'isle',   score:['shogi-island','solved'] },
  { slug:'clearance-delta',   name:'Clearance: DELTA',   cryptic:'Chess Trivia game',              icon:'Δ', accent:'#ff77a8', cat:'learn',  score:['clearance-delta','score'] },
  // Reading Room — slow-rolled 2026-07-04: pulled from the hub/halls; reachable only via the floating あ icon on the splash. Restore by uncommenting.
  // { slug:'reading-room',      name:'The Reading Room',   cryptic:'Learn to read, one mark at a time',    icon:'あ', accent:'#ff5050', cat:'isle', soon:true, score:['reading-room','score'], neu:'2026-06-22' },
  { slug:'sky-run',           name:'Sky Run',            cryptic:'Do a barrel roll!',              icon:'♞', accent:'#3cbcfc', cat:'arcade', score:['sky-run','score'] },
  // The Park Tables — LIVE, but NOT an arcade card (Nate 2026-07-14): it stands beside
  // the Gauntlet as a featured entrance on games.md and has its own splash glyph. Don't re-add here.
  { slug:'sand-mine-depths',  name:'Sand Mine Depths',   cryptic:"Descend. Don't look back",         icon:'⛏', accent:'#fcbc3c', cat:'arcade', score:['sand-mine-depths','points'] },
  { slug:'tower-defense',     name:'Siege on Chess City',cryptic:'Hold the gates. Tower Defense',  icon:'🏰', accent:'#ff77a8', cat:'arcade', score:['tower-defense','score'] },
  { slug:'dungeon',           name:'Princess Dungeon',   cryptic:'Every room is a tactic',           icon:'♟', accent:'#ff77a8', cat:'dev', score:['dungeon','floors'], neu:'2026-06-22' },
  // ⚑ THE NAME MOVED TO GODOT 2026-08-26 (Nate: "We're going to make murphy's law. It'll be
  // based on vampire survivor and Murph will be the main character with guns and chess pieces
  // are going to come at him" — then chose the Godot project, and "replace it" for this one).
  // *Murphy's Law* is now the survivors run in private/docs/godot/murphys_law/; this Mega Man
  // scroller keeps the character and the premise but loses the marquee, so it goes behind the
  // same soft gate as the other shelved prototypes. `score:` stays — a run banked in June is
  // still banked and still counts; only the card is gone. Reopen by deleting `playable:false`
  // here AND the gate script in games/murphys-law/index.html. Both, or the card leads to a
  // shut door.
  { slug:'murphys-law',       name:"Murphy's Law",       cryptic:'The pessimist was right',          icon:'☹', accent:'#3cbcfc', cat:'dev', score:['murphys-law','score'], neu:'2026-06-25', playable:false },
  // The Battle Room — TERMINATED 2026-07-14 (Nate: "make it unplayable. We'll keep
  // working on it."). Asset kept dark at assets/games/pjcc_battle_room.html; page deleted.
  { slug:'battle-room',       name:'The Battle Room',    cryptic:'Chess as an action sequence',      icon:'⚔', accent:'#56d0ff', cat:'terminated', playable:false },
  // ⚑ OFF THE WORKBENCH 2026-08-10 (Nate: "take Follow the Dog and Chess City off the
  // workbench and give them links the same way") — "the same way" = the way Duel and
  // MARCHLAND are handled, one item above this in the same batch: `playable:false` so the
  // combined hall drops them entirely, plus a soft key gate on the page so the link still
  // works for anyone he hands it to. Both pages still build and both games still run;
  // what changed is that a stranger no longer meets them. Flip `playable` back to true
  // and delete the gate script in the page when either one is ready to be met.
  { slug:'follow-the-dog',    name:'Follow the Dog',     cryptic:'Trust the run. Follow her',        icon:'✦', accent:'#8fb8ff', cat:'dev', playable:false },
  { slug:'chess-city',        name:'Chess City',         cryptic:'Platform the cursed board — the pieces have teeth',    icon:'♜', accent:'#ff5b6e', cat:'dev', score:['chess-city','score'], neu:'2026-06-25', playable:false },
  // MARCHLAND (2026-08-03) — deliberately cryptic and deliberately UNLINKED. `playable:false`
  // makes pjcc-hall.js render a <div> instead of an <a>, so the card shows in the Building
  // hall with no route in; the page itself is key-gated (see games/marchland/index.html).
  // Flip `playable` to true and delete the gate script when it's ready to open.
  { slug:'marchland',         name:'ChessWild: Campaign',cryptic:'Ten holdings and a border that moves',  icon:'⚄', accent:'#c9a7ff', cat:'dev', playable:false },
  // Duel Mode — the same soft-gated shape; the page is at games/duel/index.html.
  { slug:'duel',              name:'Duel Mode',          cryptic:'Say something about the position',       icon:'⚔', accent:'#9fe8ff', cat:'dev', playable:false },
  // The Gambit — LEFT the games section entirely (Nate 2026-07-14). It lives at
  // /the-gambit/ as its own ritual room, doored from the foot of the PJCC home.
  // ── The Vault (unlockable) ──
  { slug:'blindfold-puzzles', name:'Blindfold Puzzles',  cryptic:'No board. Only your mind',         icon:'◻', accent:'#c9a7ff', cat:'vault', score:['blindfold','solved'], locked:true, engine:true },
  // ── Terminated (retired roster) ──
  // (Knight's Tour, Ferry Delayed and Crockett's Zoomies were DELETED OUTRIGHT
  //  2026-07-14 — Nate: "Delete all the games in there, and all references to them."
  //  Pages + assets removed; restore from git before 3768221 if ever missed.
  //  The Battle Room above is the section's only resident now.)
];

/* Halls (the "Gauntlet Legends" boxes). route = page under /games/. */
window.PJCC_CATS = {
  learn:      { name:'Learn',     glyph:'♟', tag:'Sharpen your game', accent:'#00e436', route:'learn',      blurb:'Tactics, openings, notation — the training halls.' },
  arcade:     { name:'Arcade',    glyph:'♞', tag:'Pure play',         accent:'#3cbcfc', route:'arcade',     blurb:'Action, chases, and run-and-gun. The loud room.' },
  // ⚑ `tag` and `blurb` are LIVE COPY again (2026-08-05): the games hall prints them as the
  // heading and lede of its workbench row, so this object stopped being leftovers from the
  // deleted category portals. Title Case on the tag because it is a heading now
  // (tests/style.check.js rule 2). The blurb is untouched — it was already the honest line.
  dev:        { name:'Building',   glyph:'🛠', tag:'On the Workbench', accent:'#ffb020', route:'in-dev', blurb:'Half-built and humming — playable while they grow.' },
  isle:       { name:'Shogi Isle', glyph:'⛩', tag:'The island game', accent:'#e0483c', route:'isle', blurb:'The island game — foreign rules, learned across the sea.' },
  vault:      { name:'The Vault', glyph:'🔒', tag:'Unlock to enter', accent:'#9b96ad', route:'vault',  blurb:'Sealed. Earn the key and the door opens.' },
  terminated: { name:'Retired',   glyph:'☠', tag:'Off the roster',    accent:'#fc5454', route:'terminated', blurb:'Taken out of service. Kept for the record.' }
};
