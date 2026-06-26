/* ============================================================
   PJCC games registry — single source of truth.
   Used by the /games/ hub (the Gauntlet Legends portal screen)
   and by every hall page (Arcade = Mega Man 2, etc.) via pjcc-hall.js.
   cat keys: learn | arcade | dev | vault | terminated
   ============================================================ */
window.PJCC_GAMES = [
  { slug:'notation-run',      name:'Notation Blitz',     cryptic:'Squares, on the beat.',          icon:'♫', accent:'#f8d800', cat:'learn',  score:['notation-run','score'] },
  { slug:'fork-in-the-road',  name:'Fork in the Road',   cryptic:'Spot the only move.',            icon:'⚔', accent:'#00e436', cat:'learn',  score:['fork-in-the-road','solved'] },
  { slug:'pirc-protocol',     name:'The Pirc Protocol',  cryptic:'Learn the book by heart.',       icon:'♚', accent:'#fc9838', cat:'learn',  score:['pirc-protocol','score'], neu:'2026-06-22' },
  { slug:'shogi-island',      name:'Shogi Island',       cryptic:'Foreign rules. Familiar war.',   icon:'将', accent:'#fcbcb0', cat:'learn',  score:['shogi-island','solved'] },
  { slug:'clearance-delta',   name:'Clearance: DELTA',   cryptic:'Answer, or stay outside.',       icon:'Δ', accent:'#ff77a8', cat:'learn',  score:['clearance-delta','score'] },
  { slug:'reading-room',      name:'The Reading Room',   cryptic:'Learn to read, one mark at a time.', icon:'あ', accent:'#ff5050', cat:'learn', score:['reading-room','score'], neu:'2026-06-22' },
  { slug:'sky-run',           name:'Sky Run',            cryptic:'Climb the falling pieces.',      icon:'♞', accent:'#3cbcfc', cat:'arcade', score:['sky-run','score'] },
  { slug:'sand-mine-depths',  name:'Sand Mine Depths',   cryptic:"Descend. Don't look back.",      icon:'⛏', accent:'#fcbc3c', cat:'arcade', score:['sand-mine-depths','depth'] },
  { slug:'tower-defense',     name:'Siege on Chess City',cryptic:'Hold the gates.',                icon:'🏰', accent:'#ff77a8', cat:'arcade', score:['tower-defense','score'] },
  { slug:'dungeon',           name:'Princess Dungeon',   cryptic:'Every room is a tactic.',        icon:'♟', accent:'#ff77a8', cat:'arcade', score:['dungeon','floors'], neu:'2026-06-22' },
  { slug:'zoomies',           name:"Crockett's Zoomies", cryptic:'Catch the dog. Mind the bathroom.', icon:'🐕', accent:'#fcbc3c', cat:'arcade', score:['zoomies','bellies'], neu:'2026-06-24' },
  { slug:'murphys-law',       name:"Murphy's Law",       cryptic:'The pessimist was right.',       icon:'☹', accent:'#3cbcfc', cat:'arcade', score:['murphys-law','score'], neu:'2026-06-25' },
  { slug:'battle-room',       name:'The Battle Room',    cryptic:'Chess as an action sequence.',   icon:'⚔', accent:'#56d0ff', cat:'dev', score:['battle-room','score'], neu:'2026-06-22' },
  { slug:'follow-the-dog',    name:'Follow the Dog',     cryptic:'Trust the run. Follow her.',     icon:'✦', accent:'#8fb8ff', cat:'dev' },
  { slug:'the-gambit',        name:'The Gambit',         cryptic:'Lay down your best. The board decides.', icon:'♟', accent:'#f8d800', cat:'dev', soon:true },
  // ── The Vault (unlockable) ──
  { slug:'blindfold-puzzles', name:'Blindfold Puzzles',  cryptic:'No board. Only your mind.',      icon:'◻', accent:'#c9a7ff', cat:'vault', score:['blindfold','solved'], locked:true },
  // ── Terminated (retired roster) ──
  { slug:'knights-tour',      name:"Knight's Tour",      cryptic:'Touch every square. Once.',      icon:'♞', accent:'#c96bff', cat:'terminated', score:['knights-tour','score'] },
  { slug:'ferry-delayed',     name:'Ferry Delayed',      cryptic:'No departure date announced.',   icon:'⛴', accent:'#9aa0b8', cat:'terminated', playable:false }
];

/* Halls (the "Gauntlet Legends" boxes). route = page under /games/. */
window.PJCC_CATS = {
  learn:      { name:'Learn',     glyph:'♟', tag:'Sharpen your game', accent:'#00e436', route:'learn',      blurb:'Tactics, openings, notation — the training halls.' },
  arcade:     { name:'Arcade',    glyph:'♞', tag:'Pure play',         accent:'#ff77a8', route:'arcade',     blurb:'Action, chases, and run-and-gun. The loud room.' },
  dev:        { name:'In Dev',    glyph:'🛠', tag:'On the workbench', accent:'#3cbcfc', route:'in-dev', blurb:'Half-built and humming. Peek at the workbench.' },
  vault:      { name:'The Vault', glyph:'🔒', tag:'Unlock to enter', accent:'#c9a7ff', route:'vault',  blurb:'Sealed. Earn the key and the door opens.' },
  terminated: { name:'Terminated',glyph:'☠', tag:'Retired roster',    accent:'#fc5454', route:'terminated', blurb:'Decommissioned and delayed. Enter at your own risk.' }
};
