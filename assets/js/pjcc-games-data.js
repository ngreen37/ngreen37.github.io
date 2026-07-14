/* ============================================================
   PJCC games registry — single source of truth.
   Used by the /games/ hub (the Gauntlet Legends portal screen)
   and by every hall page (Arcade = Mega Man 2, etc.) via pjcc-hall.js.
   cat keys: learn | arcade | dev | vault | terminated
   ============================================================ */
window.PJCC_GAMES = [
  { slug:'notation-run',      name:'Notation Blitz',     cryptic:'Squares, on the beat.',          icon:'♫', accent:'#f8d800', cat:'learn',  score:['notation-run','score'] },
  { slug:'fork-in-the-road',  name:'Fork in the Road',   cryptic:'Spot the only move.',            icon:'⚔', accent:'#00e436', cat:'dev',    score:['fork-in-the-road','solved'], engine:true },
  { slug:'pirc-protocol',     name:'The Pirc Protocol',  cryptic:'Learn the book by heart.',       icon:'♚', accent:'#fc9838', cat:'dev',    score:['pirc-protocol','score'], neu:'2026-06-22', engine:true },
  // Shogi Island — slow-rolled 2026-07-04: pulled from the hub/halls; reachable only via the floating 将 icon on the splash. Restore by uncommenting.
  // { slug:'shogi-island',      name:'Shogi Island',       cryptic:'Foreign rules. Familiar war.',   icon:'将', accent:'#fcbcb0', cat:'isle',   score:['shogi-island','solved'] },
  { slug:'clearance-delta',   name:'Clearance: DELTA',   cryptic:'Answer, or stay outside.',       icon:'Δ', accent:'#ff77a8', cat:'learn',  score:['clearance-delta','score'] },
  // Reading Room — slow-rolled 2026-07-04: pulled from the hub/halls; reachable only via the floating あ icon on the splash. Restore by uncommenting.
  // { slug:'reading-room',      name:'The Reading Room',   cryptic:'Learn to read, one mark at a time.', icon:'あ', accent:'#ff5050', cat:'isle', soon:true, score:['reading-room','score'], neu:'2026-06-22' },
  { slug:'sky-run',           name:'Sky Run',            cryptic:'Climb the falling pieces.',      icon:'♞', accent:'#3cbcfc', cat:'arcade', score:['sky-run','score'] },
  // The Park Tables — BUILT 2026-07-13, dark until docs/park-tables-setup.md is run (Nate-gated). Uncomment to list:
  // { slug:'park-tables',       name:'The Park Tables',    cryptic:'Play a human. Or the Creator.',  icon:'♟', accent:'#6bffb8', cat:'arcade', engine:true },
  { slug:'sand-mine-depths',  name:'Sand Mine Depths',   cryptic:"Descend. Don't look back.",      icon:'⛏', accent:'#fcbc3c', cat:'arcade', score:['sand-mine-depths','points'] },
  { slug:'tower-defense',     name:'Siege on Chess City',cryptic:'Hold the gates.',                icon:'🏰', accent:'#ff77a8', cat:'arcade', score:['tower-defense','score'] },
  { slug:'dungeon',           name:'Princess Dungeon',   cryptic:'Every room is a tactic.',        icon:'♟', accent:'#ff77a8', cat:'dev', score:['dungeon','floors'], neu:'2026-06-22' },
  { slug:'murphys-law',       name:"Murphy's Law",       cryptic:'The pessimist was right.',       icon:'☹', accent:'#3cbcfc', cat:'dev', score:['murphys-law','score'], neu:'2026-06-25' },
  { slug:'battle-room',       name:'The Battle Room',    cryptic:'Chess as an action sequence.',   icon:'⚔', accent:'#56d0ff', cat:'dev', score:['battle-room','score'], neu:'2026-06-22' },
  { slug:'follow-the-dog',    name:'Follow the Dog',     cryptic:'Trust the run. Follow her.',     icon:'✦', accent:'#8fb8ff', cat:'dev' },
  { slug:'chess-city',        name:'Chess City',         cryptic:'Platform the cursed board — the pieces have teeth.', icon:'♜', accent:'#ff5b6e', cat:'dev', score:['chess-city','score'], neu:'2026-06-25' },
  { slug:'the-gambit',        name:'The Gambit',         cryptic:'Lay down your best. The board decides.', icon:'♟', accent:'#f8d800', cat:'dev' },
  // ── The Vault (unlockable) ──
  { slug:'blindfold-puzzles', name:'Blindfold Puzzles',  cryptic:'No board. Only your mind.',      icon:'◻', accent:'#c9a7ff', cat:'vault', score:['blindfold','solved'], locked:true, engine:true },
  // ── Terminated (retired roster) ──
  { slug:'knights-tour',      name:"Knight's Tour",      cryptic:'Touch every square. Once.',      icon:'♞', accent:'#c96bff', cat:'terminated', score:['knights-tour','score'] },
  { slug:'ferry-delayed',     name:'Ferry Delayed',      cryptic:'No departure date announced.',   icon:'⛴', accent:'#9aa0b8', cat:'terminated', playable:false },
  { slug:'zoomies',           name:"Crockett's Zoomies", cryptic:'Chase abandoned.', icon:'🐕', accent:'#fcbc3c', cat:'terminated', playable:false, score:['zoomies','bellies'] }
];

/* Halls (the "Gauntlet Legends" boxes). route = page under /games/. */
window.PJCC_CATS = {
  learn:      { name:'Learn',     glyph:'♟', tag:'Sharpen your game', accent:'#00e436', route:'learn',      blurb:'Tactics, openings, notation — the training halls.' },
  arcade:     { name:'Arcade',    glyph:'♞', tag:'Pure play',         accent:'#3cbcfc', route:'arcade',     blurb:'Action, chases, and run-and-gun. The loud room.' },
  dev:        { name:'In Development', glyph:'🛠', tag:'On the workbench', accent:'#ffb020', route:'in-dev', blurb:'Half-built and humming. Peek at the workbench.' },
  isle:       { name:'Shogi Isle', glyph:'⛩', tag:'The island game', accent:'#e0483c', route:'isle', blurb:'The island game — foreign rules, learned across the sea.' },
  vault:      { name:'The Vault', glyph:'🔒', tag:'Unlock to enter', accent:'#9b96ad', route:'vault',  blurb:'Sealed. Earn the key and the door opens.' },
  terminated: { name:'Terminated',glyph:'☠', tag:'Retired roster',    accent:'#fc5454', route:'terminated', blurb:'Decommissioned and delayed. Enter at your own risk.' }
};
