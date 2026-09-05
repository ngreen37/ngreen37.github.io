#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   town.check.js  —  npm run test:town

   The seam Checker Town talks through. The town is a Godot build in an iframe that plays no
   chess: it opens a Park Tables board and asks the site who won. Two functions answer, and
   this file is the only thing standing between them and a loop that silently pays twice.

   ⚠⚠ THE ONE THAT COSTS REAL PROGRESS IS `beaten`. It is a DAY STAMP PER OPPONENT, not a
   set — union it the way `army` is unioned and the second device hands out a second piece
   from the same person on the same day, which is the rule the whole loop rests on.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');
const { findChrome, report } = require('./harness');

const ROOT = path.join(__dirname, '..');
const PORT = 8794;

const results = [];
/* report() prints only .msg, so a detail is folded in rather than silently dropped. */
const ok = (cond, msg, detail) => results.push({ pass: !!cond, msg: msg + (detail ? '   [' + detail + ']' : '') });

/* ── 1 · the writer: Park Tables has to stamp the result at all ────────────────── */
const PT = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');
const PROF = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');

function fn(src, name) {
  const a = src.indexOf('function ' + name + '(');
  if (a < 0) return '';
  let d = 0, i = src.indexOf('{', a);
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') d++;
    else if (src[j] === '}' && --d === 0) return src.slice(a, j + 1);
  }
  return '';
}

/* The same idea for GDScript: a function is its header plus every line indented under it. */
function fnGd(src, name) {
  const a = src.indexOf('func ' + name + '(');
  if (a < 0) return '';
  const lines = src.slice(a).split('\n');
  const out = [lines[0]];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() !== '' && !/^[\t ]/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}

const markLast = fn(PT, 'markLast');
const finishAs = fn(PT, 'botFinishAs');
ok(markLast, 'Park Tables has a markLast()');
ok(/pjcc\.pt\.last\.v1/.test(markLast), '…and it writes pjcc.pt.last.v1');
ok(/\bat:\s*Date\.now\(\)/.test(markLast),
  '…stamped with Date.now(), or "did that just happen" has no answer');
ok(/won:\s*studyOK\(st\)/.test(markLast),
  '…and records who won  (⚠ botWon() means YOU won — the name reads backwards)');
/* ⚠⚠ A DRAW CAN BE THE WIN. Philidor is "you are a pawn down and still holding", so the
   study's goal decides — botWon() alone would report a held draw as a failure. */
ok(/function studyOK/.test(PT) && /goal === 'draw'/.test(fn(PT, 'studyOK'))
  && /'1\/2-1\/2'/.test(fn(PT, 'studyOK')),
  '…and a study whose goal is a DRAW counts a draw as done');
ok(/clean:\s*tierEarned\(st\)\s*===\s*'full'/.test(markLast),
  '…and whether it was CLEAN, off the same full-star test the bench already uses');
/* ⚠ SLICED FROM THE FUNCTION, never grepped from the file: a call in a comment would
   satisfy a whole-file grep, which is how a check in this repo once passed on prose. */
ok(/markLast\(st\)/.test(finishAs),
  'botFinishAs calls it — the one funnel all four endings come through');
ok(finishAs.indexOf('markLast(st)') < finishAs.indexOf('logFinished('),
  '…before logFinished, so nothing that throws in the log can eat the stamp');
/* the loss half: a loss does not spend the day, but it does end the errand */
ok(!/if\s*\(\s*botWon\(st\)\s*\)\s*\{[^}]*markLast/.test(finishAs),
  'and it is NOT inside the win branch — a loss has to clear the pending challenge too');

/* ── 2 · the readers, in a real browser against the real file ──────────────────── */
const PAGE = `<!doctype html><meta charset="utf-8"><title>t</title>
<script src="/assets/js/pjcc-config.js"></script>
<script src="/assets/js/pjcc-systems.js"></script>
<script src="/assets/js/pjcc-profile.js"></script><body>`;

const TYPES = { '.js': 'text/javascript', '.html': 'text/html' };
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/t/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(PAGE); }
  const f = path.join(ROOT, url);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  const exe = findChrome();
  if (!exe) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }
  await new Promise((r) => server.listen(PORT, r));
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto('http://localhost:' + PORT + '/t/', { waitUntil: 'load', timeout: 20000 });
    await new Promise((r) => setTimeout(r, 300));

    ok(await page.evaluate(() => typeof window.PJCC === 'object'), 'window.PJCC exists');
    ok(await page.evaluate(() => typeof PJCC.townResult === 'function'), 'PJCC.townResult is a function');
    ok(await page.evaluate(() => typeof PJCC.mergeTown === 'function'), 'PJCC.mergeTown is a function');

    /* ── townResult ─────────────────────────────────────────────────────────────── */
    const R = await page.evaluate(() => {
      const set = (o) => localStorage.setItem('pjcc.pt.last.v1', JSON.stringify(o));
      const out = {};
      localStorage.removeItem('pjcc.pt.last.v1');
      out.noRecord = PJCC.townResult('crockett', 0);
      set({ bot: 'crockett', result: '0-1', won: true, at: 5000 * 1000 });
      out.hit = PJCC.townResult('crockett', 0);
      out.wrongKey = PJCC.townResult('argus', 0);
      out.noKey = PJCC.townResult('', 0);
      out.olderThanSince = PJCC.townResult('crockett', 9000);   // seconds; stamp is 5000s
      out.newerThanSince = PJCC.townResult('crockett', 4000);
      set({ bot: 'crockett', result: '1-0', won: false, at: 5000 * 1000 });
      out.loss = PJCC.townResult('crockett', 0);
      out.cleanOnLoss = PJCC.townClean('crockett', 0);
      set({ bot: 'crockett', result: '0-1', won: true, clean: false, at: 5000 * 1000 });
      out.helped = PJCC.townClean('crockett', 0);
      set({ bot: 'crockett', result: '0-1', won: true, clean: true, at: 5000 * 1000 });
      out.cleanWin = PJCC.townClean('crockett', 0);
      set({ bot: 'crockett', result: '0-1', won: true, at: 5000 * 1000 });   // pre-09-03 row
      out.legacy = PJCC.townClean('crockett', 0);
      localStorage.setItem('pjcc.pt.last.v1', 'not json');
      out.garbage = PJCC.townResult('crockett', 0);
      return out;
    });
    ok(R.noRecord === null, 'townResult: null when no game has been played');
    ok(R.hit === true, 'townResult: true on a win against that opponent');
    ok(R.loss === false, 'townResult: false on a loss  (⚠ not null — a loss ends the errand)');
    ok(R.wrongKey === null, 'townResult: null for a different opponent');
    ok(R.noKey === null, 'townResult: null for an empty key');
    ok(R.garbage === null, 'townResult: null rather than throwing on a corrupt record');
    /* ⚠⚠ THE UNIT TRAP. Godot sends SECONDS, Park Tables stamps MILLISECONDS. Reverse the
       comparison and every past win reads as current — a piece per visit, forever. */
    ok(R.olderThanSince === null,
      'townResult: null when the result predates the challenge  (seconds vs ms)');
    ok(R.newerThanSince === true, '…and answers when the result came after it');
    ok(R.cleanWin === true, 'townClean: true on an unhelped win — that is what buys a square');
    ok(R.helped === false, 'townClean: false after a takeback or the analysis board');
    ok(R.cleanOnLoss === null, 'townClean: null on a loss — there is no win to be clean');
    /* ⚠ A row banked before the rule existed has no flag, and refusing a square for it would
       take a piece off somebody for a takeback they never took. */
    ok(R.legacy === true, 'townClean: a record with no `clean` field reads as clean');

    /* ── mergeTown ──────────────────────────────────────────────────────────────── */
    const M = await page.evaluate(() => {
      localStorage.removeItem('pjcc.town.v1');
      PJCC.mergeTown({ day: 4, ore: 10, hearts: { Auston: 4, Crockett: 1 },
                       army: [0, 5], ceo_beaten: false,
                       beaten: { crockett: 4, argus: 2 }, scouted: { crockett: 3 } });
      const first = JSON.parse(localStorage.getItem('pjcc.town.v1'));
      // the other device: further on in places, BEHIND in others
      const merged = PJCC.mergeTown({ day: 2, ore: 40, hearts: { Auston: 1, Crockett: 2 },
                                      army: [5, 11],
                                      ceo_beaten: true, beaten: { crockett: 1, kedar: 6 },
                                      scouted: { crockett: 1, argus: 2 } });
      return { first: first, m: merged, stored: JSON.parse(localStorage.getItem('pjcc.town.v1')) };
    });
    ok(M.first && M.first.day === 4, 'mergeTown: writes pjcc.town.v1');
    ok(JSON.stringify(M.m.army) === JSON.stringify([0, 5, 11]),
      'mergeTown: army is a UNION of slot indices, deduped and sorted', JSON.stringify(M.m.army));
    ok(M.m.day === 4, 'mergeTown: day takes the MAX — a stale row cannot rewind the calendar');
    ok(M.m.ore === 40, 'mergeTown: ore takes the MAX');
    /* ⛑⛑ THIS CHECK USED TO ASSERT THE BUG, AND IT PASSED FOR THREE BATCHES. `hearts` is a
       DICTIONARY of person → count; the old merge was `Math.max(+local.hearts || 0, …)`, which
       on `{"Auston": 4}` is `Math.max(0, 0)` — so it wrote the integer 0 over the account's
       hearts and this line, fed a number by a fixture that was also a number, agreed with it.
       ⚠ THE FIXTURE WAS THE OTHER HALF OF THE MISTAKE. A test that hands the code a shape the
       real caller never sends is a test of something nobody runs. It sends a dictionary now.
       [[green-must-name-what-ran]] */
    ok(M.m.hearts && M.m.hearts.Auston === 4 && M.m.hearts.Crockett === 2,
      'mergeTown: hearts are a DICTIONARY and take the max PER PERSON',
      JSON.stringify(M.m.hearts));
    ok(M.m.ceo_beaten === true, 'mergeTown: ceo_beaten is sticky (OR) — you cannot un-beat him');
    ok(M.m.beaten.crockett === 4,
      '⚠⚠ mergeTown: beaten is MAX PER KEY, so a stale day cannot free a second piece today',
      'crockett=' + M.m.beaten.crockett);
    ok(M.m.beaten.kedar === 6, '…and a key only the other device knows is kept');
    ok(M.stored && M.stored.beaten.crockett === 4, '…and the merge is what gets stored');
    /* what a loss BOUGHT you. Dropped from this merge it lives only in the town's own save
       and dies on the first device that pulls the account copy down over it. */
    ok(M.m.scouted && M.m.scouted.crockett === 3,
      'mergeTown: scouted is MAX PER KEY too — a tendency you learned stays learned',
      'crockett=' + ((M.m.scouted || {}).crockett));
    ok(M.m.scouted && M.m.scouted.argus === 2, '…and a key only the other device knows is kept');

    /* ── 2b · the way BACK into the game ─────────────────────────────────────────────
       ⚠⚠ THE TWO STORES ARE NOT ONE STORE. The account's copy is localStorage; the town's
       own save is Godot's `user://`, which on web is IndexedDB. mergeTown alone shipped a
       one-way sync: a signed-in player on a new device had their state pulled down and then
       watched the town boot Day 1 straight over the top of it. */
    const S = await page.evaluate(() => {
      localStorage.removeItem('pjcc.town.v1');
      const empty = PJCC.townState();
      PJCC.mergeTown({ day: 9, ore: 42, army: [0, 1, 2], beaten: { crockett: 8 } });
      return { empty: empty, after: PJCC.townState() };
    });
    ok(S.empty === null, 'townState: null before anything is known — not an empty object');
    ok(S.after && S.after.day === 9 && S.after.army.length === 3,
      'townState: hands back the merged copy for the town to read at boot',
      'day ' + (S.after || {}).day);

    /* ── 2c · the scouting facts, and whether they can be TRUE ───────────────────────
       A loss reveals what an opponent plays. That is advice acted on at a real board, so an
       id in regulars.yml that pjcc-systems.js cannot name produces a BLANK fact — the reveal
       fires, the row is spent, and the player is told nothing. [[accuracy-above-all]] */
    const PAGE_SRC = fs.readFileSync(path.join(ROOT, 'games/checker-town/index.html'), 'utf8');
    ok(/id="ct-facts-data"/.test(PAGE_SRC) && /site\.data\.regulars/.test(PAGE_SRC),
      'the facts island is READ from _data/regulars.yml, never typed');
    ok(/window\.TOWN_FACTS/.test(PAGE_SRC), 'and it publishes window.TOWN_FACTS for the game');

    const YML = fs.readFileSync(path.join(ROOT, '_data/regulars.yml'), 'utf8');
    const sysIds = [...YML.matchAll(/^\s*sys_[wb]:\s*(\S+)\s*$/gm)].map((m) => m[1]);
    ok(sysIds.length > 0, 'regulars.yml still carries sys_w/sys_b', sysIds.length + ' ids');
    const named = await page.evaluate((ids) => {
      const bad = [];
      for (const id of ids) {
        const s = window.PJCCSystems && PJCCSystems.get(id);
        if (!s || !s.name) bad.push(id);
      }
      return bad;
    }, sysIds);
    ok(named.length === 0,
      '…and pjcc-systems.js can name every one of them — a blank fact spends the reveal',
      named.join(' · '));

    /* ── 3 · the pull rides the existing request ─────────────────────────────────── */
    const PROF = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
    const pull = PROF.slice(PROF.indexOf('PJCC.ready.then('), PROF.indexOf("['catch']"));
    ok(/r\.game === 'checker-town'/.test(pull),
      'the town rides the ONE myStats() pull — no second round trip', 'in PJCC.ready.then');
    ok(/townMerge\(/.test(pull), '…and merges what comes back rather than overwriting');


    /* ⛑ THE TWO JAPANESE ROOMS CAME OFF THE SLOW-ROLL, 2026-09-03 (*"it's time - let's just
       do it"*). They were commented out of the registry on 07-04, which left the `isle` hall
       at /games/isle/ rendering an EMPTY grid for two months — those two lines were its only
       cards. ⚠ Re-commenting them empties that hall again. [[removed-not-forgotten]] */
    const GD_DATA = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-games-data.js'), 'utf8');
    const listed = (slug) => new RegExp("^\\s*\\{ slug:'" + slug + "'", 'm').test(GD_DATA);
    ok(listed('shogi-island'), 'Shogi Island is listed in the games registry, not commented out');
    ok(listed('reading-room'), '…and so is the Reading Room');
    ok(!/reading-room'[^\n]*soon:true/.test(GD_DATA),
      '…without a "coming soon" ribbon on a game that shipped in June');
    for (const g of ['shogi-island', 'reading-room']) {
      ok(!/^noindex:\s*true/m.test(fs.readFileSync(path.join(ROOT, 'games/' + g + '/index.html'), 'utf8')),
        '…and /games/' + g + '/ no longer hides from search  (no live game carries noindex)');
    }

    /* the head-to-head, before you sit down (2026-09-03) */
    ok(/function h2hWords\(/.test(PT) && /h2hWords\(id\)/.test(PT),
      'the bench card shows your record against a seat — ONE reader, two shapes');
    ok(/var rec = resume \? '' : h2hWords\(id\);/.test(PT),
      '…resume outranks it, and neither is glued onto the rating  (⚠ a 143px card wraps)');
    ok(/localStorage\.setItem\('pjcc\.puz\.log\.v1'/.test(fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_fork.html'), 'utf8')),
      'the puzzle room logs each result for the town');
    ok(/PJCC\.puzzleResult = function \(since\)/.test(PROF) && /JSON\.stringify\(out\)/.test(PROF),
      '…and the profile hands it over as a STRING — a JS array does not cross the bridge');
    ok(/local\.island_open = !!\(local\.island_open \|\| remote\.island_open\)/.test(PROF),
      '…the oars merge by OR, like every other earned thing');

    ok(errs.length === 0, 'no page errors', errs.join(' | '));

    /* ── 4 · the Godot half asks, and the stand-in is off on web ─────────────────── */
    const GD = path.join(ROOT, 'private/docs/godot/chess_town');
    if (fs.existsSync(GD)) {
      const gs = fs.readFileSync(path.join(GD, 'game_state.gd'), 'utf8');
      const zone = fs.readFileSync(path.join(GD, 'zone.gd'), 'utf8');
      ok(/func poll_challenge\(/.test(gs), 'GameState.poll_challenge exists');
      ok(/townResult/.test(gs), '…and it calls PJCC.townResult');
      ok(/"at":\s*Time\.get_unix_time_from_system\(\)/.test(gs),
        '…and begin_challenge stamps the errand, or an old win answers for it');
      ok(/return c === false \? 1 : 2;/.test(gs) && /if \(!v\) return 0;/.test(gs),
        '…returning 2/1/0/null, never a bare bool — false and null are one Variant');
      ok(/func resolve_challenge\(won: bool, clean: bool = true\)/.test(gs),
        'a NAMED SQUARE COSTS A CLEAN WIN — difficulty replaced the daily rhythm');
      ok(/if not clean:[\s\S]{0,200}return -2/.test(gs),
        '…and a helped win does NOT retire them: sloppy means go again, like a loss');
      ok(/_poll\.timeout\.connect\(_tick\)/.test(gs) && /\bpoll_challenge\(\)/.test(gs),
        '…on a timer: the new tab means the town never reloads, so nothing else asks');
      ok(/if not OS\.has_feature\("web"\):\s*\n\s*add_child\(DevReferee/.test(zone),
        'the DevReferee stand-in is DESKTOP ONLY — on web it would hide a broken seam');
      /* ⚠ the half that was missing until 2026-09-03: the town has to READ the account */
      ok(/func pull_from_site\(/.test(gs) && /townState/.test(gs),
        'GameState.pull_from_site asks the site for the account copy');
      ok(/func merge_in\(/.test(gs) && /int\(beaten\.get\(k, -1\)\)/.test(gs),
        '…and merges it by the same rules  (⚠ beaten vs -1: day 0 is a real day)');
      ok(/_pulls_left/.test(gs) && /_poll\.timeout\.connect\(_tick\)/.test(gs),
        '…for the first ticks, so an async myStats() landing late still gets in');
      /* ⭐ the nine squares nobody in the town can give you */
      ok(/func check_site_unlocks\(/.test(gs) && /townScore/.test(gs),
        'the dead squares are won from the REST OF THE SITE — the board can fill at all now');
      ok(/for \(i = 0; i < gs\.length; i\+\+\)/.test(gs),
        '…in ONE bridge crossing, not one per square on a 2s tick');
      ok(/str\(r\.get\("key", ""\)\) != "" or r\.has\("un"\)/.test(gs),
        '…and claimable() counts them, or army_full() locks the CEO behind them');
      /* ── the three from 2026-09-03 ─────────────────────────────────────────────── */
      const player = fs.readFileSync(path.join(GD, 'player.gd'), 'utf8');
      const door = fs.readFileSync(path.join(GD, 'door.gd'), 'utf8');
      const town = fs.readFileSync(path.join(GD, 'town.gd'), 'utf8');
      /* ⚠ TWO BUGS, ONE FIX. `aspect="expand"` shows MORE WORLD on a taller window, and with
         no bounds you could walk clean off the map into gray nothing. */
      ok(/world_bounds/.test(zone) && /world_bounds = GROUND_RECT/.test(town),
        'the map has an edge, and it is the same rect the ground is drawn from');
      ok(/limit_smoothed = true/.test(player) && /func _keep_inside\(/.test(player),
        '…the camera stops at it and so do the feet  (⚠ smoothing overshoots without it)');
      ok(/const GROUND_RECT/.test(town) && !/Rect2\(-1120\.0, -560\.0, 2240\.0, 1780\.0\), GROUND\)/.test(town),
        '…from ONE constant — two copies of the map size drift into a camera stopping in a field');
      /* the compounding thing, visible without going indoors */
      ok(/func _draw_windows\(/.test(door) && /lit_windows/.test(door),
        'the Assembly wears the board on its face — 16 windows in slot order');
      ok(/GameState\.army_changed\.connect\(_light_the_hall\)/.test(town),
        '…and relights them, because a square can fill from another tab');
      /* sound */
      const audio = fs.readFileSync(path.join(GD, 'town_audio.gd'), 'utf8');
      ok(/AudioStreamWAV/.test(audio) && /FORMAT_16_BITS/.test(audio),
        'there is sound now, synthesized in code — no binary to ship or license');
      ok(/a\.step\(\)/.test(player) && /_walked/.test(player),
        '…footsteps paced by DISTANCE, so they stop when you walk into a wall');

      /* ── the cast, and the four squares that had no way in ─────────────────────── */
      /* ⚠ SLICED TO `\n]`, NOT THE FIRST `]`. Rows carry `"un": ["shogi-island", 5]` now, so
         the first bracket is four rows in — the first draft of this check read a third of the
         roster and reported Robert missing from it. */
      const rStart = gs.indexOf('const ROSTER');
      const roster = gs.slice(rStart, gs.indexOf('\n]', rStart));
      ok(!/"key": ""\s*\}/.test(roster.replace(/"un":[^}]*/g, '')) || /"un"/.test(roster),
        'no square is a dead end — every one has a key or an "un"');
      ok(/"who": "Robert",\s*"key": "robert"/.test(roster),
        '⛑ Robert has a square — he stood in the town owning nothing you could win');
      ok(/_add_challenger\("Vince", "brother"/.test(town),
        '⛑ Vince is ON THE MAP — he owned the a-rook and was nowhere');
      /* ⛑ SHE IS A TownDog SINCE 2026-09-04 and no longer goes through _add_challenger, but
         the rule this check exists for is unchanged: she is placed OUTSIDE the Assembly she
         gates, and she still owns the c-bishop. Both halves, or the spelling change would have
         quietly taken her off the map. */
      ok(/dog\.key = "princess"/.test(town) && /dog\.position = HALL_AT \+/.test(town),
        '…and Princess stands outside the Assembly she gates');
      /* ⚠ the bench was NOT reshaped to fit the town — that failure has happened once */
      const yml = fs.readFileSync(path.join(ROOT, '_data/regulars.yml'), 'utf8');
      const keys = [...roster.matchAll(/"key": "([a-z]+)"/g)].map((m) => m[1]);
      const real = [...yml.matchAll(/^- key:\s*(\S+)/gm)].map((m) => m[1]);
      ok(keys.every((k) => real.includes(k)),
        '…and every key is a REAL bench seat — a made-up key is a dead door',
        keys.filter((k) => !real.includes(k)).join(' ') || keys.length + ' checked');

      /* six hearts, and a card that works without a mouse */
      ok(/const HEART_CAP := 6/.test(gs), 'hearts cap at six, not ten');
      ok(/clampi\(int\(hearts\[k\]\), 0, HEART_CAP\)/.test(gs),
        '…and a save from before today is clamped, or six pips sit beside a nine');
      const card = fs.readFileSync(path.join(GD, 'npc_card.gd'), 'utf8');
      ok(/get_mouse_position/.test(card) && /active_npc\(\)/.test(card),
        'the relationship card has TWO ways in — hover, and standing there  (he is on iOS)');

      /* the Academy is a place */
      const acad = fs.readFileSync(path.join(GD, 'academy.gd'), 'utf8');
      ok(/scene_path = "res:\/\/academy.tscn"/.test(town),
        'the Academy is a building you enter, not a link');
      /* ⚠⚠ A ROOM THAT OPENS ONTO A 404 IS THE WHOLE POINT OF THIS CHECK, so it resolves the
         URL the way Jekyll does — a page lives at its `permalink:`, NOT at a folder matching
         its path. /academy/bootcamp/ is `academy-bootcamp.md`. Checking for a directory
         reported two real pages missing. [[dead-game-links-trap]] */
      const permalinks = new Set();
      const walk = (dir) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          if (e.name === 'node_modules' || e.name === '.git' || e.name === '_site') continue;
          const f = path.join(dir, e.name);
          if (e.isDirectory()) { walk(f); continue; }
          if (!/\.(md|html)$/.test(e.name)) continue;
          const head = fs.readFileSync(f, 'utf8').slice(0, 900);
          const m = head.match(/^permalink:\s*(\S+)\s*$/m);
          if (m) permalinks.add(m[1].replace(/^["']|["']$/g, ''));
          if (e.name === 'index.html' || e.name === 'index.md') {
            permalinks.add('/' + path.relative(ROOT, dir).replace(/\\/g, '/') + '/');
          }
        }
      };
      walk(ROOT);
      /* ⚠⚠ THE ROOMS ARE READ OUT OF THE FILE, NOT LISTED HERE. The first draft checked three
         hard-coded URLs, which cannot see a FOURTH room added later pointing at nothing — it
         passed a mutation that repointed a room at /academy/lesson-four/. A gate that only
         knows the answers it was given is not a gate. */
      const rooms = [...acad.matchAll(/_lesson\("[^"]*",\s*"([^"]+)"/g)].map((m) => m[1]);
      ok(rooms.length >= 3, 'the Academy has its lesson rooms', rooms.length + ' found');
      for (const u of rooms) {
        ok(permalinks.has(u), 'the room for ' + u + ' is a real page, not a 404');
      }
      ok(/world_bounds = Rect2/.test(acad),
        '…and the room has walls, or you walk out into black');

      const hall = fs.readFileSync(path.join(GD, 'hall.gd'), 'utf8');
      /* ⛑⛑ SUPERSEDED 2026-09-04. This guarded the lectern reading out a to-do list of
         names, split into "here" and "elsewhere". Nate: *"the message to the left of the
         assembly board NOT read the names of those who are not there yet (it should be a
         mystery) but instead a cryptic line."* The replacement is in section 9 and it is
         the OPPOSITE assertion: that the Lectern block mentions no holder at all. */
      ok(/func _owed\(\)/.test(hall),
        'the lectern still reads the BOARD  (⚠ cryptic is not random — a riddle still points somewhere)');

      /* ══ 5 · MONKEY ISLAND: THE LINE LEFT THE BOX (2026-09-03) ══════════════════════
         ⛑⛑ THE WORDS LEFT THE WORLD ON 09-02 BECAUSE THREE LABELS SHARED ONE PATCH OF MAP.
         Putting one of them back is only safe while the other two stay gone, so these check
         the CONDITIONS rather than the feature: the box is still the fallback, the nameplate
         still yields, and the card still gets out of the way. */
      const speech = fs.readFileSync(path.join(GD, 'speech.gd'), 'utf8');
      const inter = fs.readFileSync(path.join(GD, 'interactable.gd'), 'utf8');
      const ui = fs.readFileSync(path.join(GD, 'town_ui.gd'), 'utf8');
      const npc = fs.readFileSync(path.join(GD, 'npc.gd'), 'utf8');
      const chal = fs.readFileSync(path.join(GD, 'challenger.gd'), 'utf8');

      ok(/extends CanvasLayer/.test(speech) && /get_screen_center_position/.test(speech),
        'the line is drawn over the speaker — a layer that PROJECTS, not a Label in the world',
        '(a parented label at the map edge is drawn where the camera cannot reach)');
      ok(/u\.say\(text, seconds, self\)/.test(inter) && /u\.talk\(speaker, line, options, self\)/.test(inter),
        '…and every interactable names its own mouth');
      ok(/func speech_top\(/.test(chal) && /func speech_top\(/.test(npc),
        '…and anything taller than its radius raises the line clear of its own picture');
      ok(/var look: int = IDLE if \(_mode == SAY and _bubbled\) else _mode/.test(ui),
        '…a bubbled one-liner leaves the box LOOKING idle, so the prompt does not blink out');
      /* ⛑ REWORDED 2026-09-04, not weakened. speaker() answered "who is talking", which
         only made sense while exactly one person could be. There are two mouths now, so the
         nameplate asks about ITSELF and the card asks about anybody — two questions, and
         one answer for both would hide every nameplate in the zone. Section 8 has them. */
      ok(/func speaking\(who: Node2D\) -> bool:/.test(
        fs.readFileSync(path.join(GD, 'speech.gd'), 'utf8')),
        '…a speaker can be asked about, one at a time');
      /* ⚠⚠ THE BOX IS NOT DEAD CODE. The zone speaks for results that landed in another tab
         and those have no mouth on screen; a "bubble everything" refactor would silence them. */
      ok(/_ui\.say\("Word travels/.test(zone) && /func _bubble\(from: Node2D/.test(ui),
        '…and the BOX still answers when nobody on screen is speaking');

      /* the big fight — the only line in the town that knows the board's total */
      ok(/"id": "big"/.test(chal) && /GameState\.has_slot\(GameState\.slot_for_key\(key\)\)/.test(chal),
        'a regular whose square you hold offers the big fight');
      ok(/func _big_fight_line\(/.test(chal) && /GameState\.claimable\(\)/.test(chal),
        '…and reads the answer OFF THE BOARD, so it changes as the board fills');

      /* ⛑ the names came off the Assembly, 2026-09-03 */
      ok(/func _draw_plate\(/.test(hall) && !/NAME_OFF/.test(hall),
        'the Assembly wears blank NAMEPLATES — the name is the prize, not the label');
      ok(/if not won or f == null or who == "":\s*\n\s*return/.test(hall),
        '…and an unwon square is written on by nothing');

      /* the testing speed, and the two things that had to move with it.
         ⛑ 1180 → 700 on 09-04. His correction: *"we were in the 500s and you sent me into
         the 1000s but your second-guess was correct."* The number is checked in section 13;
         what stays here is the pair of things that are DERIVED from it, which is the part
         that silently rots when the number moves. */
      ok(/position_smoothing_speed = maxf\(7\.0, speed \/ /.test(player),
        '…the camera is DERIVED from it, or you outrun your own view');
      ok(/_walked >= speed \* /.test(player),
        '…and so is the footstep, or the cadence is 15 a second');

      /* ══ 6 · SHOGI ISLAND, BY BOAT ══════════════════════════════════════════════════ */
      const isl = fs.readFileSync(path.join(GD, 'island.gd'), 'utf8');
      /* ⛑⛑ THIS CHECK USED TO ASSERT THE OPPOSITE, and the reversal is his: *"let's open up
         the japanese games on Shogi island - it's time - let's just do it."* For one day the
         island deliberately refused to open the shogi room and this gate enforced the refusal.
         ⚠ DO NOT "RESTORE" IT. [[removed-not-forgotten]]
         ⚠ IT READS CODE, NOT PROSE — the first version grepped the whole file for the path and
         went red on the header comment describing the rule, a gate that could not tell a rule
         from a violation of it. */
      ok(/\burl\s*=\s*"\/games\/shogi-island\/"/.test(isl),
        'the island OPENS the shogi room now  (⛑ the 09-03 reversal, his call)');
      ok(/world_bounds = Rect2/.test(isl), '…and it has an edge');
      /* ⚠ THE SQUARE FOLLOWS THE GAME THAT WINS IT. It is unlocked by solving five on Shogi
         Island, and shogi is Matsu's — he is the one who never left. It briefly said "Kaede"
         and before that "Shogi Island", which was a PLACE on a board full of people. */
      ok(/"who": "Matsu"/.test(roster) && !/Shogi Island",\s*"key"/.test(roster),
        '…and the d-pawn belongs to whoever\'s game wins it');
      /* ⚠⚠ MEASURED, NOT ASSUMED: Godot's built-in font has no kana. Without the subset every
         line he speaks renders as nothing at all — silently, with no error anywhere. */
      const fontAt = path.join(GD, 'kaede_jp.ttf');
      ok(fs.existsSync(fontAt), 'a font that can draw kana ships with the town');
      if (fs.existsSync(fontAt)) {
        ok(fs.statSync(fontAt).size < 200 * 1024,
          '…and it is a SUBSET, not a 9 MB CJK face', Math.round(fs.statSync(fontAt).size / 1024) + ' kB');
      }
      ok(/fv\.base_font = ThemeDB\.fallback_font/.test(speech) && /fv\.fallbacks = \[jp\]/.test(speech),
        '…as a FALLBACK, so the rest of the town does not change typeface');
      ok(/if jp == null:\s*\n\s*return null/.test(speech),
        '…and a missing font loses Kaede, not the English  [[down-never-stuck]]');
      ok(/no_seat_say/.test(chal) && /no_seat_say = /.test(isl),
        'his chess row is grayed and SAYS WHY — no bench seat was invented for him');

      /* the three-in-a-row gate */
      ok(/const PUZZLE_RUN := 3/.test(gs) && /func poll_puzzle\(/.test(gs),
        'the Puzzle Champ keeps the oars until three clean in a row');
      ok(/poll_challenge\(\)\s*\n\s*poll_puzzle\(\)/.test(gs),
        '…counted on the SAME 2s tick, not a second timer');
      ok(/if typeof\(got\) != TYPE_ARRAY:/.test(gs),
        '…reading an ARRAY of results, or two puzzles inside one tick lose one  (⚠ the streak would never finish)');
      ok(/puz = \{ "failed_day": day \}/.test(gs),
        '…and one wrong answer ends it until tomorrow');
      ok(/func puzzle_more\(/.test(gs) && /NOT puzzle_begin/.test(gs),
        '…while "set me another" mid-run does NOT reset the count to zero');
      /* ⚠ IT NAMES THE REFUSAL, not the flag. `if not GameState.island_open:` appears twice in
         the Rowboat — once to refuse and once to decide whether to draw the oars — so a check
         on the flag alone passed a mutation that let anybody row out. */
      ok(/class Rowboat extends TownDoor/.test(town) &&
         /if not GameState\.island_open:\s*\n\s*say\("No oars/.test(town),
        'the boat refuses until the oars are won');
      ok(/class PuzzleChamp extends TownNPC/.test(town) && !/class PuzzleChamp extends TownChallenger/.test(town),
        '…and the Champ is NOT a challenger — he has no bench key and must never be given one');

      /* ══ 6b · THE JAPANESE LANE, OPENED 2026-09-03 ═════════════════════════════════
         *"let's open up the japanese games on Shogi island - it's time - let's just do it. Get
         Kaede's sibling on the map too and let's do both japanese game (reading room and
         shogi) - let's do what we can to teach the user japanese if they wish."* */
      const town2 = town;
      ok(/url = "\/games\/reading-room\/"/.test(town2),
        'the Reading Room is a building in Checker Town');
      /* ⚠⚠ EVERY SITE URL THE TOWN OPENS, PULLED OUT OF THE TOWN. Naming the two Japanese
         ones here would be the same defect the Academy's lesson check already had: a gate that
         only knows the answers it was given cannot see a THIRD door added later pointing at
         nothing. Both spellings are matched — the literal `url = "…"` and `_add_door(name, "…")`.
         [[dead-game-links-trap]] */
      const arc = fs.readFileSync(path.join(GD, 'arcade.gd'), 'utf8');
      const park = fs.readFileSync(path.join(GD, 'park.gd'), 'utf8');
      const pit = fs.readFileSync(path.join(GD, 'depths.gd'), 'utf8');
      const stair = fs.readFileSync(path.join(GD, 'stairwell.gd'), 'utf8');
      /* ⛑⛑ AND THE SPELLINGS CHANGED UNDER IT, 2026-09-04. Three rooms shipped that day and
         two of them name their page a new way — `const URL :=` in the stairwell, `const
         TABLE_URL :=` in GameState — so a derivation that knew only `url = "…"` and
         `_add_door(…)` would have gone green while three doors it had never read pointed
         wherever they liked. `_add_door` no longer exists; every spelling that does is here.
         ⚠ THE QUERY IS CUT: /games/park-tables/?table=maxwell is that page, and a permalink
         set has never heard of a query string. */
      const doors = [...(isl + town2 + arc + park + pit + stair + gs)
        .matchAll(/(?:\burl = |"url": |\b[A-Z_]*URL :?= )"(\/[^"]+)"/g)]
        .map((m) => m[1].split('?')[0]);
      ok(doors.length >= 5, 'the town opens real site pages', doors.length + ' doors read from source');
      for (const u of [...new Set(doors)]) {
        ok(permalinks.has(u), 'the door to ' + u + ' is a real page, not a 404');
      }
      /* ⚠⚠ CANON PUTS THEM IN DIFFERENT PLACES AND THE ASK DID NOT. `_characters/kaede.md` is
         `last_seen: CHECKER TOWN` and she runs the library; `_characters/matsu.md` is
         `last_seen: SHOGI ISLAND` and "never left". A check on the FILES, so a later tidy that
         swaps them has to argue with his own character sheets. */
      const kmd = fs.readFileSync(path.join(ROOT, '_characters/kaede.md'), 'utf8');
      const mmd = fs.readFileSync(path.join(ROOT, '_characters/matsu.md'), 'utf8');
      ok(/last_seen:\s*CHECKER TOWN/.test(kmd) && /kaede\.who = "Kaede"/.test(town2),
        'Kaede is in Checker Town, where her own character file puts her');
      ok(/last_seen:\s*SHOGI ISLAND/.test(mmd) && /matsu\.who = "Matsu"/.test(isl),
        '…and Matsu is on the island, where his does');
      ok(/matsu\.no_english = true/.test(isl),
        '…he speaks no English, and the card says so rather than leaving you to guess');
      ok(/kaede\.teaches_words = true/.test(town2) && /"id": "word"/.test(npc),
        'the teaching is ONE OPT-IN MENU ROW  ("if they wish")');
      ok(/const WORDS := \[/.test(gs) && /func learn_word\(/.test(gs),
        '…backed by a fixed list, handed out in order');
      ok(/if not words\.has\(jp\):/.test(gs),
        '…never the same word twice  (⚠ a random pick makes the sixteenth take forty asks)');
      ok(/for k in \(d\.get\("words", \{\}\) as Dictionary\)/.test(gs),
        '…and a word learned on the phone is learned here');

      /* ⭐⭐ THE FONT COVERS WHAT THE SCRIPTS SAY. This is the check that makes the whole
         Japanese lane safe to edit: Godot's built-in font has no kana and no kanji, and a
         character missing from the subset draws as NOTHING — no tofu, no warning, no error.
         So the gate reads every CJK character out of the .gd files and looks each one up in
         the font's own cmap. Add a kanji and forget to rerun make_font.py, and this goes red
         with the character in the message. */
      const cover = (() => {
        const b = fs.readFileSync(fontAt);
        const num = b.readUInt16BE(4);
        let cmap = 0;
        for (let i = 0; i < num; i++) {
          const o = 12 + i * 16;
          if (b.toString('latin1', o, o + 4) === 'cmap') cmap = b.readUInt32BE(o + 8);
        }
        if (!cmap) return null;
        const set = new Set();
        const n = b.readUInt16BE(cmap + 2);
        for (let i = 0; i < n; i++) {
          const off = cmap + b.readUInt32BE(cmap + 4 + i * 8 + 4);
          if (b.readUInt16BE(off) !== 4) continue;          // format 4 covers the BMP
          const segX2 = b.readUInt16BE(off + 6), seg = segX2 / 2;
          const ends = off + 14, starts = ends + segX2 + 2, deltas = starts + segX2;
          for (let sgi = 0; sgi < seg; sgi++) {
            const e = b.readUInt16BE(ends + sgi * 2), st = b.readUInt16BE(starts + sgi * 2);
            if (st === 0xFFFF) continue;
            for (let c = st; c <= e && c !== 0x10000; c++) set.add(c);
          }
        }
        return set;
      })();
      ok(cover && cover.size > 200, 'the font\'s cmap is readable', cover ? cover.size + ' codepoints' : 'unreadable');
      if (cover) {
        const said = new Set();
        for (const f of fs.readdirSync(GD)) {
          if (!f.endsWith('.gd')) continue;
          for (const ch of fs.readFileSync(path.join(GD, f), 'utf8')) {
            const o = ch.codePointAt(0);
            if ((o >= 0x3000 && o <= 0x30FF) || (o >= 0x4E00 && o <= 0x9FFF)) said.add(ch);
          }
        }
        const missing = [...said].filter((ch) => !cover.has(ch.codePointAt(0)));
        ok(said.size > 20, 'the town actually says something in Japanese', said.size + ' characters');
        ok(missing.length === 0,
          '…and the font can draw EVERY one of them  (⚠ a missing glyph is silent — rerun make_font.py)',
          missing.length ? 'MISSING: ' + missing.join('') : said.size + ' checked');
      }

      /* ══ 7 · REWARD AND DEFEAT ══════════════════════════════════════════════════════ */
      ok(/func cost\(\) -> int:/.test(chal) && !/GameState\.spend\(energy_cost\)/.test(chal),
        'a rematch with somebody whose square you hold is FREE — and sit-down reads the same price');
      ok(/not razzed\.has\(key\)/.test(gs) && /razzed\[key\] = 1/.test(gs),
        '…and they notice the loss ONCE, ever  ("you don\'t have to hear it twice")');
      ok(/slot == -3\b/.test(zone) && /_razz_of\(who\)/.test(zone),
        '…in their own words, asked of the person rather than stored in the room');
      ok(/for k in \(d\.get\("razzed", \{\}\) as Dictionary\)/.test(gs),
        '…and it is a UNION across devices, or the phone says it again');

      /* ⚠ ITS OWN SCOPE. Everything below re-reads files this suite already read
         hundreds of lines up, under the same obvious names — `hall`, `door`, `arc`.
         One brace pair is the whole fix; renaming them all would make every check
         read `hall2`, which is how a gate stops being readable. */
      {

      /* ══ 8 · TWO MOUTHS AT ONCE ═════════════════════════════════════════════════════
         2026-09-04, Nate: *"find a way to have the user's character dialogue in white, above
         the character, without overlapping dialogue. the goodbye quote can end the
         conversation, but the user can move as well with the response of the character
         remaining visible for the proper amount of time."*
         ⚠⚠ THE WHOLE FEATURE RESTS ON ONE INVARIANT: nothing else may be drawn above a head.
         Two of the three labels that collided on 09-02 are gone for good and the third, the
         nameplate, yields — so these checks are on the CONDITIONS, not on the bubble. */
      const sp = fs.readFileSync(path.join(GD, 'speech.gd'), 'utf8');
      const tui = fs.readFileSync(path.join(GD, 'town_ui.gd'), 'utf8');
      const inter = fs.readFileSync(path.join(GD, 'interactable.gd'), 'utf8');
      ok(/var _bubbles: Array/.test(sp) && /func _find\(who: Node2D\) -> Bubble:/.test(sp),
        'Speech holds MORE THAN ONE bubble — you and them, on screen together');
      ok(/func _unstack\(/.test(sp) && /up\.position\.y = maxf\(TOP, want\)/.test(sp),
        '…and an overlapping pair is resolved by pushing the HIGHER one UP',
        'down is where the head that said it is');
      ok(/func _height\(/.test(sp) && /get_multiline_string_size/.test(sp),
        '…off the MEASURED text, not a fixed rect — a one-liner must not reserve three lines');
      ok(/const YOU := Color\("ffffff"\)/.test(tui) && /_you_say\(said\)/.test(tui),
        'YOUR line is white and it goes up when you pick the row');
      ok(/func _pick\(id: String, said: String = ""\)/.test(tui)
        && /b\.set_meta\("said", said\)/.test(tui),
        '…carried on the row, so a menu label and a spoken line can differ');
      ok(/_pick\(str\(b\.get_meta\("id", ""\)\), str\(b\.get_meta\("said", ""\)\)\)/.test(tui),
        '…and the NUMBER KEYS say it too, not only the mouse');
      ok(/func close_saying\(/.test(tui) && !/func close_saying[\s\S]{0,400}_drop_bubble\(\)/.test(tui),
        'the goodbye closes the menu WITHOUT clearing the bubbles',
        '⚠ _drop_bubble() in here would wipe the answer he asked to keep');
      ok(/func end_talk_saying\(/.test(inter) && /u\.chose\.disconnect\(_on_chose\)/.test(inter),
        '…through the same exit, so the listener is still disconnected');
      ok(/end_talk_saying\(_bye\(\), /.test(npc) && /func _bye\(\) -> String:/.test(npc),
        '…and "I\'ll let you get on." is answered rather than swallowed');
      ok(/func box_top\(\) -> float:/.test(tui) && /func _box_top\(\) -> float:/.test(sp),
        'a bubble asks the BOX where its top edge is, so it can never land inside an open menu');
      ok(/if u != null and u\.has_method\("box_top"\)/.test(sp),
        '…duck-typed, because naming TownUI from Speech is a cyclic class reference',
        'a parse error a web export does NOT report');
      ok(/if sp == null or not sp\.speaking\(self\):/.test(npc),
        'the nameplate still yields — per speaker, not for anybody talking anywhere');
      ok(/sp\.anyone\(\)/.test(card),
        '…and the relationship card still stands down for a conversation');
      ok(/func speech_color\(\) -> Color:[\s\S]{0,120}ffffff/.test(player),
        'the player has a mouth of their own, and it is NOT the Forge aura',
        'a signed-in player can pick a color you cannot read');

      /* ══ 9 · A ROOM WITH EDGES, WALLS AND A WAY OUT ═════════════════════════════════
         *"limit the space on the inside of the assembly so you can't endlessly walk"*,
         *"there should be walls on the insides of the buildings"*,
         *"the exit door should be a different symbol rather than a house"*. */
      const hall = fs.readFileSync(path.join(GD, 'hall.gd'), 'utf8');
      const xit = fs.readFileSync(path.join(GD, 'exit_door.gd'), 'utf8');
      ok(/world_bounds = ROOM\.grow\(-WALL_T\)/.test(hall),
        'the Assembly has an edge — you could walk off it into flat violet for eight seconds');
      ok(/static func draw_walls\(/.test(zone),
        'there is ONE wall, and both interiors draw it');
      ok(/TownZone\.draw_walls\(self, ROOM/.test(hall)
        && /TownZone\.draw_walls\(self, Rect2\(-W/.test(acad)
        && /TownZone\.draw_walls\(self, ROOM/.test(arc),
        '…the Assembly, the Academy and the Arcade');
      /* ⚠ ANCHORED. Unanchored, this passed a build whose class was renamed TownExitX —
         a prefix match is not an identity test. */
      ok(/^class_name TownExit$/m.test(xit) && /func _arch\(/.test(xit),
        'the way out is a DOORWAY, not a cottage with a pitched roof');
      ok(/var out := TownExit\.new\(\)/.test(hall) && /var out := TownExit\.new\(\)/.test(acad),
        '…in both interiors  (⛑ asked once, fixed everywhere)');
      ok(/func _init\(\) -> void:[\s\S]{0,120}radius = 78\.0/.test(xit),
        '…and its radius is set in _init, not _ready_extra',
        '⚠ Interactable builds its shape BEFORE _ready_extra runs');
      ok(!/of 16 \u2014 and %d of the %d/.test(hall) && !/_won_claimable/.test(hall),
        'the "1 of 16… to win today" line is off the bottom of the Assembly');
      ok(/func _riddle\(slot: int\) -> String:/.test(hall),
        '…and the lectern speaks in riddles now');
      const lect = hall.slice(hall.indexOf('class Lectern'));
      ok(!/holder_at/.test(lect),
        '…that name NOBODY  (⚠ it read out a to-do list of the cast until today)',
        'the blank nameplates are the point');
      ok(/GameState\.square_name\(slot\)/.test(lect) && /GameState\.key_at\(slot\)/.test(lect),
        '…but are still read off the board, so a riddle still points somewhere');

      /* ══ 10 · THE LIGHT OUTSIDE LINES UP WITH THE PIECE INSIDE ══════════════════════
         *"let's line up the light on the outside to the piece you unlocked."* It did not:
         two mappings, disagreeing on BOTH axes. */
      ok(/static func board_cell\(slot: int\) -> Vector2i:/.test(gs),
        'ONE function turns a slot into a cell on the board');
      /* ⚠ THE HALL REACHES IT ONE HOP FURTHER AWAY SINCE 09-05. A piece can be stood
         anywhere now, so the room asks cell_of() — which falls back to home_cell(), which is
         the only thing left that calls board_cell(). Still ONE mapping and still two callers. */
      ok(/var c := board_cell\(slot\)/.test(gs) && /GameState\.board_cell\(slot\)/.test(door)
        && /GameState\.home_cell\(slot\)/.test(hall),
        '…and the Assembly AND the building\'s face both read it');
      ok(!/func _col\(/.test(hall) && !/window_cols/.test(door),
        '…neither keeps a private copy  (⚠ the private copy is what got them mirrored)');
      ok(/@export var camera_bounds: Rect2/.test(zone) && /player\.view = camera_bounds/.test(zone),
        'what you can SEE and what you can STAND ON are two rects now');
      ok(/var lim: Rect2 = view if view\.size\.x > 0\.0/.test(player),
        '…and the camera takes its limits from the first one');
      ok(/@export var camera_offset: Vector2/.test(zone) && /cam\.position = cam_offset/.test(player),
        '…and a room whose subject is on the back wall can aim the camera up at it');

      /* ══ 11 · THREE PUZZLES, AND A KEY TO TEST THEM WITH ════════════════════════════ */
      const dev = fs.readFileSync(path.join(GD, 'dev_referee.gd'), 'utf8');
      ok(/func puzzle_report\(clean: bool/.test(gs),
        'ONE path settles a puzzle, won or lost');
      ok(/puzzle_report\(int\(rec\.get\("c", 0\)\) == 1/.test(gs),
        '…the live poll comes down it');
      ok(/GameState\.puzzle_report\(clean, Time\.get_unix_time_from_system\(\)\)/.test(dev),
        '…and so do the Y/N test keys  (⚠ a test key with its own copy of the rule tests itself)');
      ok(/GameState\.puzzle_running\(\) and \(k\.keycode == KEY_Y or k\.keycode == KEY_N\)/.test(dev),
        '…gated on a run being open, so Y does not settle a puzzle nobody set');
      ok(/puzzle %d of %d/.test(dev),
        '…and the bar says which one you are on');
      ok(/for i in GameState\.PUZZLE_RUN:/.test(town2) && /puzzle_streak\(\)/.test(town2),
        'the Champ WEARS the run — three pips, filled as you go');
      ok(/GameState\.puzzle_run\.connect\([\s\S]{0,90}queue_redraw\(\)\)/.test(town2),
        '…and redraws on it, or the count updates when you happen to walk past');

      /* ══ 12 · THE PLACE NAME IS AN ARRIVAL ══════════════════════════════════════════
         *"the text saying Sand Mines gets in the way of the dialogue — that text shouldn't
         be permanently visible."* Crockett stands 14px from where it was nailed down. */
      /* ⚠ THE `:=` IS THE ANCHOR. Without it, renaming the constant kept this green. */
      ok(/const NAME_SECONDS :=/.test(town2) && /_place_left -= delta/.test(town2),
        'the place name arrives and goes');
      ok(/if sp != null and sp\.anyone\(\):[\s\S]{0,60}_place_left = 0\.0/.test(town2),
        '…and goes INSTANTLY when anybody speaks',
        '⚠ the timer alone is not a guarantee — you can talk within two seconds of arriving');
      ok(/if f == null or _place < 0 or _place_left <= 0\.0:/.test(town2),
        '…and draws nothing at all the rest of the time');

      /* ══ 13 · THE ARCADE ════════════════════════════════════════════════════════════
         *"take a different building and really go big on it."* */
      ok(/scene_path = "res:\/\/arcade\.tscn"/.test(town2) && !/_add_door\("Arcade"/.test(town2),
        'the Arcade is a ROOM, not a link that opens a hall page in a new tab');
      ok(fs.existsSync(path.join(GD, 'arcade.tscn')), '…and the scene exists');
      /* ⭐⭐ THE STRONGEST CHECK IN THIS FILE: the cabinets are derived from the site's own
         registry, from the other side. A fourth machine for a game that is not in the arcade,
         or a game leaving the arcade and keeping its cabinet, is red here. */
      const REG = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-games-data.js'), 'utf8');
      const inArcade = [...REG.matchAll(/^\s*\{ slug:'([a-z-]+)'[^\n]*cat:'arcade'/gm)]
        .map((m) => m[1]).sort();
      const cabs = [...arc.matchAll(/"slug": "([a-z-]+)"/g)].map((m) => m[1]).sort();
      ok(inArcade.length >= 3, 'the site has an arcade to be in', inArcade.join(' '));
      ok(JSON.stringify(cabs) === JSON.stringify(inArcade),
        '…and the cabinets ARE the site\'s arcade, both ways',
        'cabinets: ' + cabs.join(' ') + '  |  registry: ' + inArcade.join(' '));
      ok(/func slot_for_game\(game: String\) -> int:/.test(gs)
        && /func unlock_need\(slot: int\) -> int:/.test(gs),
        'a machine can ask the ROSTER which square its score buys, and for how much');
      ok(/GameState\.unlock_need\(_slot\)/.test(arc) && !/300|500|"un":/.test(arc),
        '…and carries no threshold of its own',
        '⚠ two copies of a price is a machine promising a piece it cannot give');
      ok(/draw_set_transform\(r\.position, 0\.0, Vector2\(m, m\)\)/.test(arc)
        && /draw_set_transform\(Vector2\.ZERO, 0\.0, Vector2\.ONE\)/.test(arc),
        'the attract screens are drawn in unit space, and the transform is RESET after');
      ok(/draw_set_transform\(Vector2\.ZERO, 0\.0, Vector2\.ONE\)\s*\n\s*_attract_over\(r\)/.test(arc),
        '…and anything with a STROKE is drawn after the reset',
        '⚠⚠ a 3px outline under a scale of 80 arrives 240px thick — it covered a whole cabinet');
      ok(/func _box\(aspect: float, r: Rect2\) -> Rect2:/.test(arc)
        && /_box\(aspect, Rect2\(x, y, 0\.19/.test(arc),
        '…and a sprite that scrolls off a screen is clipped, not painted on the next cabinet');
      /* ⚠⚠ `.new()`, NOT THE BARE CLASS NAME. Both of these are named in this file's own
         header, so the first draft went green on PROSE: swapping the CanvasModulate for a
         ColorRect left the room unlit and the check happy. Ask what the gate does when the
         subject is ABSENT. [[green-must-name-what-ran]] */
      /* ⛑ THE TEXTURE MOVED TO TownZone ON 2026-09-04, when the third room wanted it. The
         check follows the code: `_glow` is the zone's now and the Arcade asks for it. */
      ok(/static var _glow: Texture2D/.test(zone) && /GradientTexture2D\.new\(\)/.test(zone)
        && /TownZone\.glow\(\)/.test(arc)
        && /PointLight2D\.new\(\)/.test(arc) && /CanvasModulate\.new\(\)/.test(arc),
        'the room is dark and the machines light it — real 2D lights, one shared texture');
      ok(!/static func glow\(\)/.test(arc),
        '…and there is only ONE of that texture, not one per room that wanted one');
      ok(/if not inner\.encloses\(Rect2\(at, Vector2\(cell, cell\)\)\):/.test(arc),
        '…and the carpet stops at the wall  (⚠ ceil() overruns and there is no clip rect)');
      ok(/@export var speed: float = 700\.0/.test(player),
        'the feet are back down to 700  (⛑ 1180 was mine and it was a misread percentage)');

      /* ══ 14 · THE PARK TABLES ARE A ROOM ════════════════════════════════════════════
         *"yes do Park Tables and The Depths."* */
      ok(/scene_path = "res:\/\/park\.tscn"/.test(town2)
        && !/url = "\/games\/park-tables\/"/.test(town2),
        'the Park Tables is a ROOM, not a link that opens the lobby in a new tab');
      ok(fs.existsSync(path.join(GD, 'park.tscn')), '…and the scene exists');
      /* ⭐⭐ THE SAME TRICK THE ARCADE PLAYS ON THE GAMES REGISTRY, aimed at the bench: the ten
         tables are derived from `_data/regulars.yml` and checked from BOTH SIDES. A table for a
         seat that does not exist, or a seat with no table, is red here. */
      const benchKeys = [...yml.matchAll(/^- key:\s*(\S+)/gm)].map((m) => m[1]).sort();
      const tableKeys = [...park.matchAll(/\{ "key": "([a-z]+)"/g)].map((m) => m[1]).sort();
      ok(JSON.stringify(tableKeys) === JSON.stringify(benchKeys),
        '…and the ten tables ARE the bench, both ways',
        'tables: ' + tableKeys.join(' ') + '  |  bench: ' + benchKeys.join(' '));
      /* every row, field for field, against the YAML the site prints from */
      const ymlRows = {};
      for (const m of yml.matchAll(
        /^- key:\s*(\S+)\s*\n\s*name:\s*(.+?)\s*\n\s*icon:\s*"(.)"\s*\n\s*elo:\s*(\d+)/gm)) {
        ymlRows[m[1]] = { name: m[2], icon: m[3], elo: +m[4] };
      }
      /* ⚠ THE GLYPH IS THE PIECE. The bench wears ♖/♜ and ChessArt speaks "r"; without this
         map the `piece` field is the one column in that table nobody is checking. */
      const GLYPH = { '♖': 'r', '♜': 'r', '♘': 'n', '♞': 'n', '♗': 'b', '♝': 'b',
                      '♕': 'q', '♛': 'q', '♔': 'k', '♚': 'k', '♙': 'p', '♟': 'p' };
      const rows = [...park.matchAll(
        /\{ "key": "([a-z]+)",\s*"who": "([^"]+)",\s*"elo": (\d+),\s*"piece": "([a-z])"/g)];
      ok(rows.length === benchKeys.length,
        '…and every row was readable', rows.length + ' of ' + benchKeys.length);
      const wrong = rows.filter(([, k, who, elo, pc]) => {
        const r = ymlRows[k];
        /* ⚠ AUSTON'S 1200 IS THE DIAL'S INVISIBLE SEED, not a rating, so the room prints
           "Adapts" and carries 0. That is the one row allowed to disagree on elo. */
        if (!r) return true;
        if (r.name !== who) return true;
        if (GLYPH[r.icon] !== pc) return true;
        return +elo !== r.elo && +elo !== 0;
      }).map((m) => m[1]);
      ok(wrong.length === 0,
        '…name, rating and PIECE all match the bench', wrong.join(' ') || rows.length + ' rows');
      ok(/"key": "auston"/.test(park.slice(park.indexOf('const OFF')))
        && /"key": "brother"/.test(park.slice(park.indexOf('const OFF')))
        && /adaptive: true/.test(PT) && /offLadder: true/.test(PT),
        '…and the two seats drawn OFF the ladder here are the two the bench draws off it');
      /* ⭐ y-sort, and the trap that comes with it */
      ok(/y_sort_enabled = true/.test(park),
        '⭐ the pavilion is Y-SORTED — you walk behind the far tables');
      ok(/ground\.z_index = -1/.test(park) && /class Ground extends Node2D/.test(park),
        '…with the floor a CHILD at z_index -1',
        '⚠⚠ a y-sorted node draws its OWN art at its own Y — the zone\'s _draw() would cover the room');
      ok(/out\.z_index = -1/.test(park) && /_board\.z_index = -1/.test(park),
        '…and anything hung on a wall drops out of the sort too');
      /* ⭐⭐ ONE PLACE SITS YOU DOWN */
      ok(/func sit_down\(who: String, key: String, cost: int\) -> String:/.test(gs)
        && /if beaten_today\(key\):/.test(gs),
        '⭐ ONE function sits you down, and it owns the once-a-day stamp');
      ok(/GameState\.sit_down\(who, key, cost\(\)\)/.test(chal)
        && /GameState\.sit_down\(who, key, _cost\(\)\)/.test(park),
        '…and BOTH ways of taking a seat come down it',
        '⚠⚠ two copies of the daily rule is two pieces off Maxwell in one evening');
      /* ⚠ READING THE RULE IS NOT COPYING IT. Both files ask `beaten_today` to gray a row and
         to write a prompt, which is what a sign does. What neither may do is ENFORCE it: the
         three calls that make a seat happen — the day stamp, the energy and the errand — belong
         to sit_down and nowhere else. */
      ok(!/begin_challenge/.test(chal) && !/GameState\.spend\(/.test(chal)
        && !/retire_for_today/.test(chal),
        '…neither ENFORCES it  (⛑ the challenger had all three inline until today)');
      ok(!/begin_challenge/.test(park) && !/GameState\.spend\(/.test(park)
        && !/retire_for_today/.test(park),
        '…and the table never had them');
      /* ⚠ the lock is a SIGN. The first cut said so in a comment and returned early anyway. */
      ok(/func _locked\(\) -> bool:/.test(park)
        && /the tables want a clean win over %s first/.test(park),
        'a locked seat says the price on the sign');
      const sitBody = park.slice(park.indexOf('\tfunc interact(_player: Node) -> void:'));
      ok(!/_locked\(\)/.test(sitBody.slice(0, sitBody.indexOf('func _lock_who'))),
        '…and still opens, because the STAR TABLE that really gates it is the site\'s',
        '⚠⚠ a door refusing on a copy of somebody else\'s rule is confidently wrong');
      /* ⭐ the room empties as you win */
      ok(/_mine = _slot >= 0 and GameState\.has_slot\(_slot\)/.test(park)
        && /theirs, pushed in/.test(park),
        '⭐ a seat whose square is yours has an empty chair and their piece on the table');
      ok(/func _cost\(\) -> int:\s*\n\s*return 0 if _mine else 10/.test(park),
        '…and a rematch there is free, the same rule as the person outside');
      ok(/GameState\.army_changed\.connect/.test(park)
        && /GameState\.site_slot_won\.connect/.test(park)
        && /GameState\.challenge_resolved\.connect/.test(park),
        '…and every table notices, because you played in another tab');
      /* ⛑⛑ THE ARITHMETIC, NOT A COMMENT. Five times now something in this game has been drawn
         under the HUD's stat row. The camera's LOWEST position is ROOM.end.y - 324, so the
         highest thing in the room has a computable screen y from there, and it must clear the
         stat row. [[audit-numbers-can-be-wrong]] [[mobile-window-slide]] */
      const pRoom = /const ROOM := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(park);
      const pRung = /const RUNG_Y := (-?[\d.]+)/.exec(park);
      /* ⛑ ALL OF THEM, NOT .exec()'s FIRST. A table draws a piece twice — seated when they
         still owe you the square, lying on the board once they do not — and the first draft
         measured whichever came first in the file. It happened to be the low one, so moving
         the SEATED piece a hundred units up the wall changed nothing and the check stayed
         green. Take the highest thing a table draws, whichever call it came from. */
      const pSeats = [...park.matchAll(
        /ChessArt\.draw_piece\(self, piece, Vector2\(0\.0, (-?[\d.]+)\), ([\d.]+),\s*tint/g)]
        .map((m) => +m[1] - +m[2] / 2);
      ok(pRoom && pRung && pSeats.length >= 2,
        'the pavilion\'s frame is readable from source', pSeats.length + ' pieces measured');
      if (pRoom && pRung && pSeats.length) {
        const roomTop = +pRoom[2], roomBottom = +pRoom[2] + +pRoom[4];
        const camLowest = Math.max(roomTop, roomBottom - 648);   /* the base viewport is 1152x648 */
        const pieceTop = +pRung[1] + Math.min(...pSeats);
        ok(pieceTop - camLowest >= 56,
          '…and the seated pieces clear the HUD from the camera\'s lowest position',
          'screen y ' + Math.round(pieceTop - camLowest) + ', the stat row ends at 50');
      }

      /* ══ 15 · THE DEPTHS IS THE CAMP ABOVE THE SHAFT ════════════════════════════════ */
      ok(/scene_path = "res:\/\/depths\.tscn"/.test(town2)
        && !/shaft\.energy_cost = 20/.test(town2),
        'the shaft is a ROOM, and the energy moved inside with the cage');
      ok(fs.existsSync(path.join(GD, 'depths.tscn')), '…and the scene exists');
      ok(/energy_cost = 20/.test(pit),
        '…charged ONCE, by the cage  (⚠ leaving it on the door too would charge you twice)');
      /* ⭐⭐ REAL SHADOWS — the technique this room exists to show */
      ok(/shadow_enabled = true/.test(pit) && /LightOccluder2D\.new\(\)/.test(pit)
        && /OccluderPolygon2D\.new\(\)/.test(pit),
        '⭐ the pit head has REAL cast shadows — a light with shadows and an occluder per post');
      ok(/poly\.closed = true/.test(pit),
        '…and the occluder is CLOSED, or it casts from its edges and lights its own middle');
      ok(/_lamp\.position\.x = sin\(/.test(pit),
        '…and the lamp swings, so every shadow in the room sweeps');
      ok(/class Prop extends StaticBody2D/.test(pit) && /CollisionShape2D\.new\(\)/.test(pit),
        '…and the timber stops you  (⛑ scenery you walk through says the room is a picture)');
      ok(/CanvasModulate\.new\(\)/.test(pit) && /dim\.color = Color\(0\.5/.test(pit),
        '…and the room is still legible with the lights off  [[down-never-stuck]]');
      /* ⭐ the sentence neither the mine nor the site can say */
      ok(/GameState\.slot_for_game\("sand-mine-depths"\)/.test(pit)
        && /GameState\.unlock_need\(_slot\)/.test(pit) && !/\b300\b/.test(pit),
        '⭐ the Martyr\'s stone says his square is bought in the ARCADE, and asks the roster how much',
        '⚠ two mines share a name: the shaft pays ore, the machine pays the g-pawn');
      /* the run has to come back where you came in */
      ok(/var mine_return: String/.test(gs)
        && /GameState\.mine_return = "res:\/\/depths\.tscn"/.test(pit),
        'the shaft run knows which door it came through');
      const mineGd = fs.readFileSync(path.join(GD, 'mine.gd'), 'utf8');
      ok(/GameState\.mine_return if GameState\.mine_return != "" else town_scene/.test(mineGd),
        '…and reads it, with the old export still the fallback',
        '⚠ an @export is read from the SCENE FILE — the caller cannot set it');

      /* ══ 16 · THE GAUNTLET IS A STAIRWELL ═══════════════════════════════════════════
         *"make the Gauntlet a Stairwell."* */
      ok(/scene_path = "res:\/\/stairwell\.tscn"/.test(town2)
        && !/url = "\/games\/the-gauntlet\/"/.test(town2),
        'the Gauntlet is a STAIRWELL');
      ok(fs.existsSync(path.join(GD, 'stairwell.tscn')), '…and the scene exists');
      /* ⚠ TEN FLOORS, ONE PAGE. A landing per floor with a door on each would be ten doors
         onto one URL — dead-game-links-trap in a new shape. */
      ok([...stair.matchAll(/"\/games\/[^"]+"/g)].length === 1,
        '…with exactly ONE door in it, because the Gauntlet is one URL');
      /* ⭐⭐ THE TEN ARE THE GAUNTLET'S TEN, derived from the game itself, both ways. */
      const GAUNT = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_gauntlet.html'), 'utf8');
      const realFloors = [...GAUNT.matchAll(/\{ name:'([^']+)',[^\n]*?elo:(\d+),(\s*secret:true)?/g)]
        .map((m) => ({ who: m[1], elo: +m[2], secret: !!m[3] }));
      const publicFloors = realFloors.filter((f) => !f.secret);
      const drawn = [...stair.matchAll(/\{ "who": "([^"]+)",\s*"elo": (\d+) \}/g)]
        .map((m) => ({ who: m[1], elo: +m[2] }));
      ok(publicFloors.length === 10 && realFloors.length === 13,
        'the Gauntlet still has ten public floors and three secret ones',
        publicFloors.length + ' public, ' + (realFloors.length - publicFloors.length) + ' secret');
      ok(JSON.stringify(drawn) === JSON.stringify(publicFloors.map((f) => ({ who: f.who, elo: f.elo }))),
        '…and the stairwell draws exactly those ten, in order, with their real ratings',
        drawn.length + ' landings');
      /* ⚠⚠ the secret floors must NOT be in here: a stairwell with thirteen landings has
         already told you there are thirteen */
      const secretNames = realFloors.filter((f) => f.secret).map((f) => f.who);
      ok(secretNames.length > 0 && !secretNames.some((n) => stair.includes(n)),
        '…and NONE of the secret ones  [[gauntlet-secret-floors]]',
        secretNames.join(' · '));
      /* ⭐⭐ the light you carry */
      ok(/player\.add_child\(lamp\)/.test(stair) && /CanvasModulate\.new\(\)/.test(stair),
        '⭐ you carry the light up a dark stairwell — the lighting IS the fog of war');
      ok(/energy = 0\.85 if i < _cleared else 0\.0/.test(stair),
        '…and a landing is lit only if you have cleared it');
      ok(/_known = idx <= got or \(_slot >= 0 and idx \+ 1 == _need\)/.test(stair),
        '…so a floor you have not reached has no NAME on it either');
      ok(/_slot = GameState\.slot_for_game\(Stairwell\.GAME\)/.test(stair)
        && /_need = GameState\.unlock_need\(_slot\)/.test(stair),
        '…except the one that owes a square, and which floor that is comes off the ROSTER');
      ok(!/idx \+ 1 == 4|_need = 4/.test(stair),
        '…never typed  (⚠ a fourth-floor constant here is a second copy of the price)');
      const gameId = /const GAME := "([a-z-]+)"/.exec(stair);
      ok(gameId && gs.includes('"un": ["' + gameId[1] + '"'),
        '…and the id it asks with is the one the ROSTER pays on', gameId && gameId[1]);
      /* ⭐ narrow floor, wide room — the two rects, the other way round */
      ok(/world_bounds = WELL/.test(stair) && /camera_bounds = ROOM/.test(stair),
        '⭐ the well you walk in is narrow and the room the camera sees is wide');
      const sRoom = /const ROOM := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(stair);
      ok(sRoom && +sRoom[3] >= 1152,
        '…and wide enough for the window, or the camera pins and shows the gray outside',
        sRoom && sRoom[3] + ' units');
      ok(/_poll\.wait_time = 2\.5/.test(stair) && /func _recheck\(\)/.test(stair),
        'this room polls, because the floor count MOVES THE DOOR');

      /* ══ 17 · THE CLIMB IS A NUMBER THE TOWN CAN READ ══════════════════════════════
         The ROSTER pays the h-rook for ['the-gauntlet', 4] and the Stairwell draws its brass
         off the same number, so both of them rest on the Gauntlet banking its climb somewhere
         PJCC.townScore can find it.
         ⛑⛑ I SPENT AN HOUR FIXING THIS BECAUSE IT WAS NOT BROKEN. `games/the-gauntlet/` is a
         nine-line wrapper around an iframe; the game is assets/games/pjcc_gauntlet.html, and
         grepping the wrapper for "saveScore" found nothing, which I read as "nothing banks it"
         instead of "I grepped the wrong file". The patch I wrote read the game's private save
         directly and would have LOST the account copy that localBest picks up from myStats on a
         second device — a real regression, shipped to fix an imaginary bug. The checks below
         are what should have been written first: prove the path exists, do not assume it does
         not. [[accuracy-above-all]] */
      /* ⚠ SLICED TO THE FUNCTION, never grepped from the whole file: pjcc-profile.js is 1500
         lines and "gauntlet" appears in prose in it. */
      const scoreFn = PROF.slice(PROF.indexOf('PJCC.townScore ='),
        PROF.indexOf('PJCC.townPlayer ='));
      ok(/PJCC\.saveScore\('the-gauntlet',/.test(GAUNT),
        'the Gauntlet banks its climb under the id the ROSTER asks for');
      ok(/PJCC\.saveScore\('the-gauntlet', Object\.keys\(prog\.beaten\)\.length,/.test(GAUNT),
        '…and what it banks is a COUNT OF FLOORS, which is what "climb to the fourth" means',
        '⚠ a rating or a score here and the roster would be comparing 4 against 1250');
      ok(/prog\.beaten\[G\.idx\] = true;/.test(GAUNT)
        && GAUNT.indexOf('prog.beaten[G.idx] = true;') > GAUNT.indexOf('if (playerWon){'),
        '…and a floor only joins that count on a WIN');
      ok(/return PJCC\.localBest\(id\) \|\| 0;/.test(scoreFn)
        && !/gauntlet/.test(scoreFn),
        '…and townScore reads it by the ORDINARY path, with no special case of its own',
        '⚠⚠ a direct read of the game\'s private save would miss the account copy from myStats');
      const need = /"un": \["the-gauntlet", (\d+)\]/.exec(gs);
      ok(need && +need[1] <= publicFloors.length,
        '…so the h-rook is reachable: the roster asks for a floor inside the public ten',
        need && ('floor ' + need[1] + ' of ' + publicFloors.length));

      /* ══ 18 · THE CAMPAIGN CABINET ══════════════════════════════════════════════════
         *"move Campaign into Arcade, but locked until half the assembly is lit up."* */
      ok(/slug:'marchland'[^\n]*cat:'arcade'/.test(REG),
        'Campaign files under the Arcade on the site now',
        '⚠ the cabinets/registry check above is what makes this load-bearing in both repos');
      ok(/func assembly_half\(\) -> bool:\s*\n\s*return army_count\(\) \* 2 >= ROSTER\.size\(\)/.test(gs),
        '⭐ "half the Assembly" is ONE function');
      ok(!/claimable/.test(/func assembly_half[\s\S]{0,200}/.exec(gs)[0]),
        '…counted off the WHOLE roster',
        '⚠ tying it to what is currently winnable makes the lock cheaper every time a character lands');
      ok(/GameState\.assembly_half\(\)/.test(arc) && !/army_count\(\) \* 2/.test(arc),
        '…and the cabinet asks it rather than doing the arithmetic again');
      ok(/"half": true/.test(arc) && /cab\.half = bool\(d\.get\("half", false\)\)/.test(arc),
        '…on exactly one machine, off a field  (⚠ not an `if slug ==`)');
      ok(/_light\.energy = 0\.0 if _dark/.test(arc)
        && /if _dark:\s*\n\s*return[^\n]*\n\s*var m: float = r\.size\.y/.test(arc),
        '…and a locked machine is genuinely dark: no light, no attract frame');
      ok(/dark until half the Assembly is lit  \(%d of %d\)/.test(arc),
        '…but it says its own price AND how far you have got',
        '⚠ "Locked" alone is a door refusing to say what it wants');
      ok(/Color\("8a82b4"\) if _dark else/.test(arc),
        '…and you can still read its NAME  (⛑ the first render had a nameless black cabinet)');
      /* ⛑ THE ARITHMETIC AGAIN: a fifth cabinet standing inside the west wall is red here
         rather than on a render. */
      const aRoom = /const ROOM := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/.exec(arc);
      const aSpread = /const SPREAD := ([\d.]+)/.exec(arc);
      const aWall = /const WALL_T := ([\d.]+)/.exec(arc);
      const aSize = /size = Vector2\(([\d.]+), [\d.]+\)\s*\n\n\tfunc _ready_extra/.exec(arc);
      ok(aRoom && aSpread && aWall && aSize, 'the Arcade\'s frame is readable from source');
      if (aRoom && aSpread && aWall && aSize) {
        const n = cabs.length;
        const half = +aRoom[3] / 2;
        const reach = +aSpread[1] * (n - 1) + (+aSize[1]) / 2 + (+aWall[1]);
        ok(reach <= half,
          'the Arcade is wide enough for every cabinet in it',
          n + ' machines reach ' + reach + ', the wall is at ' + half);
      }

      /* ══ 19 · NIGHT ═════════════════════════════════════════════════════════════════
         *"the town after dark is a different town."* */
      const clk = fs.readFileSync(path.join(GD, 'clock.gd'), 'utf8');
      /* ⚠ ANCHORED. Unanchored this passed a build whose class was renamed TownClockX;
         a prefix match is not an identity test, and this is the third one. */
      ok(/^class_name TownClock$/m.test(clk), 'there is a clock');
      /* ⚠⚠ THE WALL CLOCK AND THE GAME'S DAY COUNTER ARE DIFFERENT THINGS. `day` counts
         VISITS and is what the bed advances; this is what time it is where the player is
         sitting, and the whole value of night is that it changes while you are NOT looking. */
      /* ⛑ COMMENTS STRIPPED FIRST. The header of clock.gd explains at length that it must NOT
         read GameState.day, which means the word is in the file and a whole-file grep is
         asking about prose. Seventh time in this repo; the first time it went RED rather than
         green, because the claim happened to be a negative. [[green-must-name-what-ran]] */
      const clkCode = clk.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
      ok(!/GameState/.test(clkCode),
        '…and it is the WALL clock — no line of it can see GameState.day',
        '⚠⚠ sleeping in a bed must not make it morning');
      /* ⚠ THE ABSENCE IS THE CHECK. hour() and weekday() both call this, so asking whether
         `(false)` appears anywhere still passed with one of them flipped to UTC. */
      ok(/get_datetime_dict_from_system\(false\)/.test(clk)
        && !/get_datetime_dict_from_system\(true\)/.test(clk),
        '…in LOCAL time, in BOTH readers  (⚠ `true` is UTC: midnight here at four in the afternoon)');
      /* the darkest tint still has to be a town you can cross */
      const nightTint = /NIGHT: return Color\(([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(clk);
      ok(nightTint && Math.max(+nightTint[1], +nightTint[2], +nightTint[3]) >= 0.35,
        '…and the darkest tint still leaves a walkable map  [[down-never-stuck]]',
        nightTint && nightTint.slice(1).join(', '));
      ok(/_sky\.color = TownClock\.tint\(\)/.test(town2) && /CanvasModulate\.new\(\)/.test(town2),
        'the map is tinted by the hour');
      ok(/_clock\.wait_time = 60\.0/.test(town2) && /_clock\.timeout\.connect\(_retime\)/.test(town2),
        '…on a minute\'s tick, because the hour arrives while the tab is open');
      ok(/func retime\(\) -> void:/.test(town2) && /n\.call\("retime"\)/.test(town2),
        '…and ONE function tells everything that cares',
        '⚠ three listeners on three timers is three chances to be in a different hour');
      ok(/_light\.energy = 0\.5 if dark else 0\.0/.test(town2),
        'a street lamp is a REAL light after dark and dark in the day');
      ok(/func _draw_lit\(/.test(door) && /if board_face or not TownClock\.is_dark\(\)/.test(door),
        '…and a building shows a light on — but never the Assembly',
        '⚠ that face already wears sixteen windows that MEAN something');

      /* ══ 20 · THE DOG ═══════════════════════════════════════════════════════════════
         *"the dog is in the town — she follows you, and she finds things."* */
      const dog = fs.readFileSync(path.join(GD, 'dog.gd'), 'utf8');
      ok(/^class_name TownDog$/m.test(dog) && /extends TownChallenger/.test(dog),
        'the dog is a CHALLENGER with legs, not a new kind of thing');
      /* ⚠⚠ NO CHARACTER WAS INVENTED, and this is the check that says so. Follow the Dog runs
         on updatePrincess() and her own file calls her a dog; if either of those stops being
         true, the reason she is the one following you has gone. [[slow-roll-cast]] */
      const FTD = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_space_run.html'), 'utf8');
      const pmd = fs.readFileSync(path.join(ROOT, '_characters/princess.md'), 'utf8');
      ok(/function updatePrincess\(/.test(FTD) && /a dog who can learn/.test(pmd)
        && /dog\.who = "Princess"/.test(town2),
        '…and she is PRINCESS, because Follow the Dog is her game',
        '⚑ Crockett is the other dog and his file says "always around" — one word moves it');
      /* ⚠⚠ ANCHORED TO THE END OF THE LINE. `0.0` is a PREFIX of `0.09`, so the first draft
         of this passed with her away one day in eleven — the same defect as `-3` matching
         `-33`, which this file has now had twice. ⚠ AND `$` IS NOT THE ANCHOR TO REACH FOR:
         the line carries a trailing comment, so end-of-line failed on the truth. A lookahead
         for a digit is the one that asks the real question. [[green-must-name-what-ran]] */
      ok(/dog\.elo = 2100/.test(town2) && /dog\.away_chance = 0\.0(?!\d)/.test(town2),
        '…keeping her seat, and never randomly missing  (a companion who vanishes reads as a bug)');
      ok(/_follow = GameState\.hearts_for\(who\) > 0/.test(dog),
        '…and she does not follow a stranger');
      /* ⭐ she says only true things, and every one is read off state that already exists */
      ok(/npc\.away\(\)/.test(dog) && /GameState\.claimable\(\)/.test(dog)
        && /GameState\.island_open/.test(dog) && !/randf/.test(dog),
        '⭐ every word she says is TRUE — who is out, what is owed, whether the boat is yours',
        '⚠ a companion who says "I smell something" and means nothing is one you stop asking');
      ok(/func away\(\) -> bool:/.test(npc),
        '…asked of the person, so she keeps no second copy of a roll salted by the day');
      ok(!/ChessArt/.test(dog),
        '…and she is DRAWN as a dog, not as her bench glyph over a nameplate');

      /* ══ 21 · THE PIECES TALK ═══════════════════════════════════════════════════════ */
      const says = [...roster.matchAll(/"say": "/g)].length;
      const whos = [...roster.matchAll(/"who": "/g)].length;
      ok(says === whos && whos === 16,
        'all sixteen squares carry the line their piece says', says + ' of ' + whos);
      ok(/func square_says\(slot: int\) -> String:/.test(gs) && /not has_slot\(slot\)/.test(gs),
        '…and an UNWON square says nothing  (nobody has lost it yet)');
      /* ⚠ IT IS A CELL AND NOT A SQUARE SINCE 09-05 (off-the-wall #3): the object belongs to
         the board position, not to the slot, so a piece you have moved takes its line with it. */
      ok(/class Cell extends Interactable/.test(hall) && /sq\.f = f/.test(hall),
        'one mouth per square, standing where the piece stands');
      ok(/monitoring = slot >= 0 or legal/.test(hall),
        '…switched OFF unless something is on it OR you may legally move there',
        'forty-odd live cells take the prompt off the Lectern, and forty that offer a move '
        + 'and then refuse it are worse');
      ok(!/func _draw\(\)/.test(hall.slice(hall.indexOf('class Cell'),
                                           hall.indexOf('class Lectern'))),
        '…and it draws NOTHING — the room paints the board in one pass over the roster');

      /* ══ 22 · THE ROAD WEST ═════════════════════════════════════════════════════════
         *"5 (but make it West instead of North)"* */
      ok(/class CityGate extends TownDoor/.test(town2) && /url = "\/games\/chess-city\/"/.test(town2),
        'the road west ends at a gate onto Chess City');
      ok(/if not GameState\.ceo_beaten:[\s\S]{0,120}Barred from the other side/.test(town2),
        '…barred until the far chair is taken, and it SAYS what would open it',
        '⚠ "Locked for now" is a door refusing to name its own price');
      /* ⛑ the map grew and one loop had the old corners typed into it */
      const gRect = /const GROUND_RECT := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/
        .exec(town2);
      const gateX = /const GATE_AT := Vector2\((-?[\d.]+),/.exec(town2);
      ok(gRect && gateX && +gateX[1] - 120 > +gRect[1],
        '…and the map reaches past it, so the gate is not standing in the edge',
        gateX && ('gate at ' + gateX[1] + ', edge at ' + gRect[1]));
      ok(/while x <= GROUND_RECT\.end\.x:/.test(town2) && !/while x <= 1120\.0:/.test(town2),
        '…and the grid is drawn off the RECT, not off four typed corners',
        '⛑ it had -1120 in it and would have stopped 280 units short of the new edge');

      /* ══ 23 · THE VISITOR ON A REAL DAY ═════════════════════════════════════════════
         *"6 (make it Auston)"* */
      ok(/@export var away_days: Array\[int\] = \[\]/.test(npc)
        && /if not away_days\.is_empty\(\):[\s\S]{0,80}TownClock\.weekday\(\)/.test(npc),
        'somebody can be out on a REAL weekday');
      ok(/auston\.away_chance = 0\.0(?!\d)/.test(town2) && /auston\.away_days = \[2, 4\]/.test(town2),
        '…and the calendar REPLACES the dice for her, it does not add to it',
        '⚠ two rules deciding whether she is here is a bug you cannot tell from a feature');
      ok(/auston\.gift_day = 0/.test(town2) && /It's %s\. Anything for me\?/.test(npc),
        '…and on her day the row says WHOSE day it is');
      /* ⚠⚠ A REAL DATE, NOT `day` — the whole point is that it is actually Sunday */
      ok(/func take_gift\(\) -> String:/.test(gs) && /last_gift = today\(\)/.test(gs)
        && /Time\.get_date_string_from_system\(false\)/.test(gs),
        '…stamped with the real DATE, so it is once a week and not once a sleep');
      ok(/if str\(d\.get\("last_gift", ""\)\) > last_gift:/.test(gs),
        '…and the LATER date wins on a merge, or every device hands out its own copy');
      ok(/func recheck_attendance\(\) -> void:/.test(npc)
        && /n\.call\("recheck_attendance"\)/.test(town2),
        '…and midnight arriving with the tab open moves her');

      /* ══ 24 · THE STALL, AND THE BOARD YOU LEAVE A MOVE ON ══════════════════════════
         *"7 (just use ore as currency for now)"* and *"8"*. */
      ok(/const HATS := \[/.test(gs) && /"ore":/.test(gs),
        'ore buys something now  (it had exactly one use and the mine paid into a number)');
      /* ⚠⚠ COSMETIC IS A HOUSE RULE. Nothing may READ the worn hat except the two places that
         draw it — the day something else does, this stall is a different kind of shop.
         [[game-monetization-ethics]] */
      /* ⚠ THE JOURNAL IS NOT ON THIS LIST AND MUST NOT BE ADDED TO IT. It prints what you
         are wearing, and it does that through GameState.hat_name() — a getter that can only
         ever produce a label. The raw variable stays readable by the two things that DRAW a
         hat, so nothing can branch on it, which is the whole rule. */
      const wearers = ['player.gd', 'town.gd'];
      const readsHat = fs.readdirSync(GD).filter((f) => f.endsWith('.gd'))
        .filter((f) => !wearers.includes(f) && f !== 'game_state.gd')
        .filter((f) => /GameState\.hat\b/.test(fs.readFileSync(path.join(GD, f), 'utf8')));
      ok(readsHat.length === 0,
        '…and NOTHING reads what you are wearing except the two things that draw it',
        readsHat.join(' ') || 'cosmetic only');
      ok(/func buy_hat\(/.test(gs) && /func wear_hat\(/.test(gs),
        'buying and wearing are two verbs');
      ok(/for k in \(d\.get\("hats", \{\}\) as Dictionary\):/.test(gs)
        && /if hat == "" and str\(d\.get\("hat", ""\)\) != ""/.test(gs),
        '…and they SYNC differently: owning is a union, wearing is a preference',
        '⚠⚠ a union on the worn hat puts it back on every time you take it off');
      ok(/TownPlayer\.draw_hat\(self, str\(_row\(\)\["id"\]\)/.test(town2)
        && /TownPlayer\.draw_hat\(self, GameState\.hat/.test(player),
        '⭐ the stall draws its stock with the function that draws it on your head');
      ok(/func _row\(\) -> Dictionary:/.test(town2) && /"id": "next", "text": "Show me another\."/.test(town2),
        '…one hat on the counter at a time, because the box has room for four rows');
      ok(/class PostBoard extends Interactable/.test(town2)
        && /const URL := "\/games\/park-tables\/"/.test(town2),
        'there is a board you leave a move on, and it opens the LOBBY');
      ok(!/\?table=/.test(town2.slice(town2.indexOf('class PostBoard'))),
        '…not a bot seat  (⚠ every table in the Pavilion is a bot; this one is a person)');

      /* ══ 25 · THE JOURNAL ═════════════════════════════════════════════════════════════
         2026-09-04, next-steps #2: *"sixteen squares, sixteen different prices, and no
         single place that lists them."* */
      const jrn = fs.readFileSync(path.join(GD, 'journal.gd'), 'utf8');
      const pad = fs.readFileSync(path.join(GD, 'touch_pad.gd'), 'utf8');
      ok(/^class_name TownJournal$/m.test(jrn), 'there is a journal');
      ok(/_journal = TownJournal\.new\(\)/.test(zone) && /add_child\(_journal\)/.test(zone),
        '…and every room builds one  (the board is the same board from any room)',
        '⚠ in zone.gd, not in town.gd — a panel you can open in one building you look at once');
      ok(/k\.keycode == KEY_J/.test(jrn), '…J opens it');
      ok(/func _journal_tab\(\) -> Control:/.test(zone) && /b\.text = "Journal"/.test(zone),
        '…and so does a tab in the corner, because he is on a phone',
        '[[hover-is-three-inputs]]');
      {
        /* 44px, measured off the offsets rather than trusted. */
        const top = /b\.offset_top = ([\d.]+)/.exec(zone);
        const bot = /b\.offset_bottom = ([\d.]+)/.exec(zone);
        ok(top && bot && (parseFloat(bot[1]) - parseFloat(top[1])) >= 44,
          '…and the tab is a real tap target',
          top && bot ? (parseFloat(bot[1]) - parseFloat(top[1])) + 'px tall' : 'no offsets');
        ok(/b\.anchor_right = 1\.0/.test(zone) && !/b\.position = /.test(zone),
          '…anchored, not positioned  (⚠ a Control position under a moved anchor is off-screen on every phone but mine)');
      }
      ok(/if k\.keycode == KEY_J and not _talking\(\)/.test(jrn),
        '…and it will not open over a conversation  (two things listening for 1-4 at once)');
      ok(/TownJournal\.is_open\(get_tree\(\)\)/.test(player)
        && /TownJournal\.is_open\(get_tree\(\)\)/.test(pad),
        '…the player and the pad both stand down while it is up');
      ok(/func is_open\(t: SceneTree\) -> bool:/.test(jrn),
        '…and they ask ONE function, not two copies of the flag');
      {
        /* ⚠⚠ THE MYSTERY SURVIVES. He took the names off the nameplates and off the Lectern
           on 09-03 — "it should be a mystery" — so a panel that listed all sixteen would put
           the checklist straight back one room away. holder_at() appears in the board tab
           exactly once and only inside the branch that already knows you won it. */
        const rows = jrn.slice(jrn.indexOf('func _board_rows'), jrn.indexOf('func _progress'));
        const hits = (rows.match(/holder_at/g) || []).length;
        ok(hits === 1 && /if won:\s*\n\s*row\["b"\] = GameState\.holder_at\(i\)/.test(rows),
          '⭐ an unwon square still names NOBODY  (⚠⚠ do not "fix" this — [[removed-not-forgotten]])',
          hits + ' mention(s) of holder_at in the board tab');
        ok(/somebody in this town/.test(rows),
          '…it says a person is behind it without saying which person');
      }
      ok(/GameState\.unlock_say\(i\)/.test(jrn) && /row\["c"\] = _progress\(i\)/.test(jrn),
        '…and it prints the PRICE, which is the half of #2 nothing else showed');
      ok(/return "of %d" % need/.test(jrn) && /return "%d \/ %d"/.test(jrn),
        '⚠ an unknown score prints "of 20", never "0 / 20"',
        'off the site there is nothing to ask, and 0 is a different claim');
      ok(!/ScrollContainer/.test(jrn) && /clampf\(\(_body\.size\.y - 26\.0 \* k\) \/ float\(rows\.size\(\)\)/.test(jrn),
        '⚠⚠ NOTHING SCROLLS — the pitch shrinks instead',
        'the town is an iframe and a drag inside it belongs to the page [[mobile-window-slide]]');
      ok(/_journal\.shown\.connect/.test(zone) && /_hud\.visible = not on/.test(zone),
        '…and the HUD stands down, or "Day 1 · Energy" prints through the title');

      /* One crossing, one door. */
      ok(/func site_scores\(ids: Array\) -> Dictionary:/.test(gs),
        'the site is asked for many scores in ONE crossing');
      ok((gs.match(/P\.townScore\(/g) || []).length === 1,
        '…and there is exactly one copy of that JavaScript in the whole project',
        'there were two before today and the journal would have been the third');
      ok(/if ids\.is_empty\(\) or not OS\.has_feature\("web"\):\s*\n\s*return \{\}/.test(gs),
        '…{} means NOT ASKED, which is not the same answer as zero');
      ok(/return int\(site_scores\(\[id\]\)\.get\(id, 0\)\)/.test(gs),
        '…and the single-score read goes through the same door');
      ok(/func game_at\(slot: int\) -> String:/.test(gs)
        && /return str\(\(r\["un"\] as Array\)\[0\]\) if r\.has\("un"\) else ""/.test(gs),
        '…the journal and slot_for_game read the SAME field, in opposite directions');

      /* ══ 26 · THE GAME THAT WON THE SQUARE ════════════════════════════════════════════
         next-steps #3. ⚠⚠ THE BACKLOG SAID THE SITE ALREADY STORED THE PGN OF EVERY PARK
         TABLE GAME. IT DID NOT — pjcc.pt.last.v1 is a result and a timestamp, and the board
         carrying the moves is deleted when you get up. That is what these checks are for. */
      ok(/var GAMES_KEY = 'pjcc\.pt\.games\.v1'/.test(PT), 'Park Tables banks a finished game');
      {
        const bank = fn(PT, 'bankGame');
        ok(/isStudy\(st\)/.test(bank), '…never a study  (it won no square, so it is nobody\u2019s record)');
        ok(/!botWon\(st\)/.test(bank) && /tierEarned\(st\) !== 'full'/.test(bank),
          '…and only a CLEAN WIN, which is exactly what a square costs');
        ok(/all\[st\.bot\] = \{ moves: st\.moves/.test(bank),
          '…one per regular, keyed by who you beat');
      }
      ok(/markLast\(st\);\s*\n\s*bankGame\(st\);/.test(PT),
        '…and botFinishAs calls it on every ending');
      ok(/PJCC\.townGame = function \(key\)/.test(PROF) && /pjcc\.pt\.games\.v1/.test(PROF),
        'the site will hand the town that game');
      ok(/func has_replay\(key: String\) -> bool:/.test(gs) && /P\.townGame/.test(gs),
        '…and the town asks rather than storing one');
      ok(/const REPLAY_URL := "\/games\/park-tables\/\?replay="/.test(gs),
        '…and opens the room that can draw it');
      {
        const sq = hall.slice(hall.indexOf('class Cell extends Interactable'));
        ok(/if key != "" and GameState\.has_replay\(key\):/.test(sq),
          '…a square won off the rest of the site offers no game back',
          '⚠ the row is ABSENT, not grayed — there was never a game at this board');
        ok(/GameState\.watch_replay\(GameState\.key_at\(_slot\)\)/.test(sq),
          '…and the one that was, does');
      }
      ok(/function askedForReplay/.test(PT) && /if \(rep\) showReplay\(rep\)/.test(PT),
        'Park Tables answers ?replay=');
      {
        const show = fn(PT, 'showReplay');
        const cut = show.indexOf('replaceState');
        ok(cut > 0 && cut < show.indexOf('PJCCReview'),
          '…and strips the parameter BEFORE opening anything',
          '⚠ route() can run twice on one load and would stack two overlays');
        ok(/PJCCReview/.test(show) && /PJCCAnalysis/.test(show),
          '…on the review board, falling back to the analysis board');
      }

      /* ══ 27 · SIX HEARTS BUYS A POSITION ══════════════════════════════════════════════
         next-steps #4, and the feature he asked for in August. Hearts were tracked, capped,
         drawn on the card and gated absolutely nothing. */
      const STUD = require(path.join(ROOT, 'assets/js/pjcc-studies.js'));
      {
        const ids = STUD.all().map((r) => r.id).sort();
        const gdIds = [];
        const block = gs.slice(gs.indexOf('const STUDIES := ['), gs.indexOf('\nvar positions'));
        let m, re = /"id": "([a-z]+)"/g;
        while ((m = re.exec(block))) gdIds.push(m[1]);
        gdIds.sort();
        ok(ids.length === 7 && gdIds.join(',') === ids.join(','),
          '⭐⭐ the town names the same seven studies the site sets up',
          gdIds.join(',') + '  vs  ' + ids.join(','));
        /* ⚠⚠ NEITHER HALF CARRIES THE OTHER'S. Godot plays no chess, so no FEN may exist in
           it; the site does not know who offers what, so no character may exist in there. */
        const gdFiles = fs.readdirSync(GD).filter((f) => f.endsWith('.gd'))
          .map((f) => fs.readFileSync(path.join(GD, f), 'utf8')).join('\n');
        ok(!STUD.all().some((r) => gdFiles.includes(r.fen)),
          '⚠⚠ and NOT ONE FEN lives in the Godot project  [[godot-starter-code]]');
        const js = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-studies.js'), 'utf8');
        ok(!/who:|ask:|ore:/.test(js) && !/crockett|maxwell|robert/.test(js),
          '…and the site half names nobody: the ids are the joint');
      }
      {
        /* ⚠⚠ EVERY POSITION IS PROVED WITH THE PERFT-VERIFIED REFEREE. A study captioned
           "beat me from here" that is illegal, already over, or the wrong side to move is the
           exact defect next-steps #1 exists to hunt. What no test can prove is that a win is
           a win — those seven are textbook margins. [[accuracy-above-all]] */
        const CH = require(path.join(ROOT, 'assets/js/pjcc-chess.js'));
        const WANT = { lucena: 'KRP|kr', philidor: 'KR|krp', ladder: 'KRR|k',
                       backrank: 'KR|krppp', qvp: 'KQ|kp', rookmate: 'KR|k',
                       bishops: 'KBB|k' };
        let bad = [];
        for (const r of STUD.all()) {
          let S = null;
          try { S = CH.parseFEN(r.fen); } catch (e) { bad.push(r.id + ':parse'); continue; }
          const tally = {};
          for (const p of S.b) if (p) tally[p] = (tally[p] || 0) + 1;
          const mat = 'K' + 'QRBNP'.split('').map((p) => p.repeat(tally[p] || 0)).join('') +
                      '|k' + 'qrbnp'.split('').map((p) => p.repeat(tally[p] || 0)).join('');
          if (S.turn !== r.side) bad.push(r.id + ':turn');
          if (CH.legalMoves(S).length === 0) bad.push(r.id + ':nomoves');
          if (CH.gameResult(S, 1)) bad.push(r.id + ':over');
          if (CH.inCheck(S, S.turn === 'w' ? 'b' : 'w')) bad.push(r.id + ':illegal');
          if (mat !== WANT[r.id]) bad.push(r.id + ':' + mat);
        }
        ok(bad.length === 0,
          '⭐⭐ every study position is legal, live, the right side to move, and the material it claims',
          bad.length ? bad.join(' ') : 'all seven');
        ok(STUD.get('qvp').fen.indexOf('3p4') > 0,
          '⚠ the queen study uses a d-PAWN  (queen against a rook or bishop pawn on the seventh is a DRAW)');
      }
      ok(/hearts_for\(who\) < HEART_CAP/.test(gs),
        '…offered at six hearts, which is the number the card actually shows you reaching');
      ok(/positions\.has\(str\(row\["id"\]\)\)/.test(gs), '…and only until you have beaten it');
      {
        const sit = gs.slice(gs.indexOf('func sit_study'), gs.indexOf('func win_study'));
        ok(!/spend\(/.test(sit),
          '⚠ FREE — six hearts is the price and it took a dozen games to pay');
        ok(/TABLE_URL \+ key \+ "&pos=" \+ str\(row\["id"\]\)/.test(sit),
          '…and the link names the position');
      }
      {
        /* ⚠⚠ THE ERRAND IS A PAIR. A study and an ordinary game against the same person land
           in one record; without the filter, beating Crockett from the Lucena position filled
           Crockett's square — the one thing a study must never do. */
        const tl = fn(PROF, 'townLast');
        ok(/String\(r\.pos \|\| ''\) !== String\(pos \|\| ''\)/.test(tl),
          '⭐⭐ the site will not answer a game with a study, or a study with a game');
        const tr = PROF.slice(PROF.indexOf('PJCC.townResult ='), PROF.indexOf('PJCC.townGame ='));
        const tcl = PROF.slice(PROF.indexOf('PJCC.townClean ='), PROF.indexOf('PJCC.puzzleResult ='));
        ok(/townLast\(key, since, \w+\)/.test(tr) && /townLast\(key, since, \w+\)/.test(tcl),
          '…both readers FORWARD it to townLast()',
          '⚠ dropping the third argument silently reopens the door — the filter just stops running');
        ok(/JSON\.stringify\(str\(pending\.get\("pos", ""\)\)\)/.test(gs),
          '…and the town always sends one, "" included');
        ok(/bot: st\.bot, result: st\.result, won: studyOK\(st\), pos: st\.pos \|\| ''/.test(PT),
          '…because Park Tables stamps which errand it was');
      }
      {
        const rc = gs.slice(gs.indexOf('func resolve_challenge'), gs.indexOf('func _fill_their_slot'));
        const posAt = rc.indexOf('if pos != "":');
        ok(posAt > 0 && posAt < rc.indexOf('played(who, won)'),
          '⚠⚠ a study is settled BEFORE any of the lines about a game');
        const branch = rc.slice(posAt, rc.indexOf('played(who, won)'));
        ok(!/retire_for_today|_fill_their_slot|learn\(/.test(branch),
          '…so it fills no square, spends no day and buys no reveal',
          'the reward is the ore and a mark in the journal');
        ok(/return -4 if won and clean else -5/.test(branch),
          '…and reports itself as -4 or -5');
      }
      ok(/if slot == -4:/.test(zone) && /if slot == -5:/.test(zone),
        '…which the room knows how to say out loud');
      ok(/if \(botWon\(st\) && !isStudy\(st\)\) \{/.test(PT),
        '⚠⚠ a study awards no star, no beaten list and no day stamp');
      ok(/if \(botAdapt && !isStudy\(st\)\)/.test(PT), '…and does not move the adaptive dial');
      {
        for (const [f, why] of [['logRepertoire', 'a study has no opening'],
                                ['logPrepFail', 'and no prep to fail'],
                                ['studyMove', 'and Vince cannot answer an endgame with a first move'],
                                ['botSystemMove', 'and a setup is not a technique']]) {
          ok(/isStudy\(st\)/.test(fn(PT, f)), '…' + why, f + '()');
        }
      }
      ok(/var tc0 = study \? tcById\(''\) : tcById\(tcPref\(\)\)/.test(PT),
        '⚠ and it has no clock  (the default is Blitz 5+1 and an endgame under five minutes is a different exercise)');
      ok(/if \(saved && \(saved\.pos \|\| ''\) !== \(study \? study\.id : ''\)\) saved = null;/.test(PT),
        '⚠⚠ a resume must be the SAME errand, or a study quietly becomes a game that can take a square');
      {
        /* ⚠⚠ EVERY BOT-SIDE REBUILD GOES THROUGH botGame(). A call site still asking the
           referee directly rebuilds a study from the standard start and draws it as if it
           were right — no throw, no error, just the wrong pieces. */
        /* ⚠ COMMENTS STRIPPED FIRST. The block comment over botGame() names the very call
           it exists to forbid, so a raw line scan reports the warning as the violation. */
        const code = PT.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        const stray = code.split('\n').filter((ln) =>
          /M\.replayGame\(/.test(ln) && !/M\.replayGame\(m\.moves/.test(ln)
          && !/moves === undefined/.test(ln));
        ok(stray.length === 0,
          '⭐⭐ every bot-side rebuild goes through botGame(); the only bare calls left are the correspondence tables',
          stray.length ? stray[0].trim().slice(0, 60) : 'clean');
        const MATCH = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-match.js'), 'utf8');
        ok(/function replayGame\(movesStr, startFen\)/.test(MATCH)
          && /C\.parseFEN\(startFen \|\| C\.START_FEN\)/.test(MATCH),
          '…and the referee will start somewhere else, defaulting to the start');
      }
      ok(/for k in \(d\.get\("positions", \{\}\) as Dictionary\):/.test(gs),
        '…a study beaten on the phone is beaten here  (a union, like everything earned)');
      {
        const win = fnGd(gs, 'win_study');
        ok(/add_ore\(int\(\(row as Dictionary\)\.get\("ore", 0\)\)\)/.test(win)
          && !/army\.append|hearts\[|retire_for_today/.test(win),
          '⚠ the ore is the whole prize — no square, and no heart it could not raise anyway');
      }

      /* ══ 28 · THE AIR ═════════════════════════════════════════════════════════════════
         next-steps #9: *"one ambient bed per region."* ⚠ NOT MUSIC — no key, no tempo, no
         melody. That line is his and this keeps it. */
      ok(/const BEDS := \{/.test(audio) && /"town":|"night":|"deep":|"sea":|"room":/.test(audio),
        'there is a bed for each kind of place');
      {
        const beds = audio.slice(audio.indexOf('const BEDS := {'), audio.indexOf('static func bed('));
        const ids = (beds.match(/"(town|night|room|deep|sea)":\s*\{/g) || []).length;
        ok(ids === 5, '…five of them', ids + ' found');
        /* ⚠⚠ WHOLE CYCLES PER BUFFER, NOT FREQUENCIES. A tone that does not complete an exact
           number of cycles in the loop beats against its own seam once every three seconds. */
        const hz = [...beds.matchAll(/\[(\d+), [\d.]+\]/g)].map((x) => parseInt(x[1], 10));
        ok(hz.length >= 6 && hz.every((n) => Number.isInteger(n) && n > 0),
          '…and every tone is a whole number of cycles per loop', hz.join(' '));
      }
      ok(/loop_mode = AudioStreamWAV\.LOOP_FORWARD/.test(audio) && /loop_end = count - 1/.test(audio),
        '…they loop');
      ok(/const BED_FADE/.test(audio) && /buf\[i\] = buf\[i\] \* w \+ buf\[count \+ i\] \* \(1\.0 - w\)/.test(audio),
        '⚠⚠ …and the seam is cross-faded, because noise cannot join itself',
        'the last sample and the first are unrelated numbers');
      ok(/if not is_instance_valid\(_amb\) or id == _bed_id:/.test(audio),
        '…asking for the bed that is already playing does nothing',
        '⚠ town.gd asks again every sixty seconds and a restart would BE a seam');
      ok(/or not GameState\.sound_on:/.test(fnGd(audio, '_play')),
        '…and the mute silences the footsteps too');
      ok(/func set_sound\(on: bool\) -> void:/.test(gs) && /sound_changed\.emit\(on\)/.test(gs),
        'the journal can turn it off');
      {
        const push = gs.slice(gs.indexOf('func push_to_site'), gs.indexOf('func open_url'));
        const merge = gs.slice(gs.indexOf('func merge_in'), gs.indexOf('const SCOUT_ORE'));
        ok(!/sound_on/.test(push) && !/sound_on/.test(merge),
          '⚠⚠ and the mute is a DEVICE preference — it never syncs',
          'muting the phone you play on the bus must not mute the desk [[everything-earned-syncs]]');
      }
      ok(/func _bed_now\(\) -> String:/.test(town2)
        && /au\.play_bed\(_bed_now\(\)\)/.test(town2) && /ambient = _bed_now\(\)/.test(town2),
        '⭐ the air changes with the light, on the same minute the sky does');
      {
        /* Every room names a bed that exists. */
        const known = ['town', 'night', 'room', 'deep', 'sea'];
        const named = [...fs.readdirSync(GD).filter((f) => f.endsWith('.gd'))
          .map((f) => fs.readFileSync(path.join(GD, f), 'utf8')).join('\n')
          .matchAll(/ambient = "([a-z]+)"/g)].map((x) => x[1]);
        ok(named.length >= 3 && named.every((n) => known.includes(n)),
          '…and no room asks for air that does not exist', named.join(' '));
      }

      /* ══ 29 · THE PRICES ══════════════════════════════════════════════════════════════
         next-steps #1. ⛑⛑ ONE OF THE SEVEN WAS MEASURABLY WRONG: the Seaboard Rep's bishop
         read `tower-defense`, which is the SCORE — a hundred a wave plus ten a kill — against
         a threshold of 3. Any run at all cleared it, and the sentence under it said "hold
         three waves", so the number and the promise were measuring different things. */
      {
        const games = [];
        let m, re = /"un": \["([a-z-]+)", (\d+)\]/g;
        while ((m = re.exec(gs))) games.push([m[1], parseInt(m[2], 10)]);
        ok(games.length === 7, 'seven squares are bought off the rest of the site', games.length + '');
        /* ⭐⭐ EVERY ONE OF THEM MUST BE A NUMBER SOMETHING ACTUALLY BANKS. A square whose id
           nothing writes is a square that can never be won, and nothing in the game says so —
           this is the whole of #1's correctness half. */
        const bankers = fs.readdirSync(path.join(ROOT, 'assets/games'))
          .filter((f) => f.endsWith('.html'))
          .map((f) => fs.readFileSync(path.join(ROOT, 'assets/games', f), 'utf8'))
          .concat([fs.readFileSync(path.join(ROOT, 'academy-opening-trainer.html'), 'utf8'), PROF])
          .join('\n');
        const dead = games.map((g) => g[0]).filter((id) =>
          !bankers.includes("saveScore('" + id + "'") && !bankers.includes("id === '" + id + "'"));
        ok(dead.length === 0,
          '⭐⭐ …and every one of them is a score something actually banks',
          dead.length ? 'UNWINNABLE: ' + dead.join(' ') : 'all seven have a writer');
        ok(!games.some((g) => g[0] === 'tower-defense'),
          '⛑ the bishop no longer costs a SCORE of three on a game that scores in the hundreds');
        ok(games.some((g) => g[0] === 'siege-waves' && g[1] === 3),
          '…it costs three WAVES, which is what its sentence always said');
        ok(/PJCC\.saveScore\('siege-waves', G\.wave/.test(
             fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_tower_defense.html'), 'utf8')),
          '…and Siege on Chess City banks that number');
        {
          const td = fs.readFileSync(path.join(ROOT, 'assets/games/pjcc_tower_defense.html'), 'utf8');
          const line = td.split('\n').find((l) => /saveScore\('siege-waves'/.test(l)) || '';
          ok(!/G\.endless/.test(line.slice(0, line.indexOf('saveScore'))),
            '⚠ in EVERY mode, not only Endless  (the campaign is where you would go to hold three)');
        }
        ok(/"un_say": "beat four floors of the Gauntlet"/.test(gs),
          '⚠ and the Gauntlet sentence counts what the Gauntlet banks',
          'it banks floors BEATEN, so four of them means you are standing on the fifth');
      }

      /* ══ 30 · THE PHONE ═══════════════════════════════════════════════════════════════
         next-steps #10: *"measure it on a phone."* It was worth measuring, and it found two
         things at once, both from the same cause. The cabinet is about 352x560 there and
         `window/stretch/aspect="expand"` turns that into roughly 1152x1833 of VIEWPORT:

           · a room whose camera rect is shorter than that cannot fill the screen, so the
             Pavilion sat in a gray field with a band above it and a band below;
           · and a CanvasLayer is drawn in viewport units, so every UI number in the game —
             the stat row, the conversation box, the pad, the journal — arrived at 30% of
             the size it was written at. A 14-unit font is FOUR PIXELS.

         Measured on renders at 352x560 and 320x520, not reasoned about. */
      ok(/const BASE_H := 648\.0/.test(zone) && /static func ui_scale\(n: Node\) -> float:/.test(zone),
        'there is ONE number for how big a UI pixel is');
      ok(/return maxf\(1\.0, v \/ BASE_H\)/.test(zone),
        '\u26a0\u26a0 …and it is exactly 1.0 on a desktop  (648 / 648 \u2014 nothing about this machine changed)');
      ok(/n\.get_viewport\(\)\.get_visible_rect\(\)\.size\.y/.test(zone),
        '\u26a0 asked of the VIEWPORT, not of a CanvasItem rect  (a CanvasLayer is not a CanvasItem)');
      {
        /* Everything that draws UI has to be on the lever, or it is the one thing on screen
           still four pixels tall. */
        for (const [f, src] of [['zone.gd', zone], ['town_ui.gd',
              fs.readFileSync(path.join(GD, 'town_ui.gd'), 'utf8')],
              ['journal.gd', jrn], ['touch_pad.gd', pad]]) {
          ok(/TownZone\.ui_scale\(/.test(src), '…' + f + ' is on it');
        }
      }
      ok(/func _fit_camera\(lim: Rect2\) -> void:/.test(player)
        && /_cam\.zoom = Vector2\(z, z\)/.test(player),
        '\u2b50 the camera zooms to fit the window it is in');
      ok(/get_viewport\(\)\.size_changed\.connect\(func\(\) -> void: _fit_camera\(lim\)\)/.test(player),
        '…and again when the window changes  (rotating a phone asks for a different amount of world)');
      {
        /* ⭐⭐ AND IT IS ARITHMETIC, NOT A PROMISE. Every camera rect in the game is at least
           as big as the base viewport, so on a desktop every ratio _fit_camera takes is below
           1 and the zoom comes out exactly 1.0. The day somebody adds a room smaller than the
           window, this says so before the render does. */
        const BASE = { w: 1152, h: 648 };
        const rects = [];
        for (const f of fs.readdirSync(GD).filter((x) => x.endsWith('.gd'))) {
          const src = fs.readFileSync(path.join(GD, f), 'utf8');
          const m = /^const (?:ROOM|GROUND_RECT) := Rect2\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+)\)/m.exec(src);
          if (m) rects.push({ f: f, w: parseFloat(m[3]), h: parseFloat(m[4]) });
        }
        const small = rects.filter((r) => r.w < BASE.w || r.h < BASE.h);
        ok(rects.length >= 6 && small.length === 0,
          '\u2b50\u2b50 …and on a desktop it is a NO-OP: every room is at least as big as the 1152x648 window',
          small.length ? small.map((r) => r.f + ' ' + r.w + 'x' + r.h).join(' · ')
                       : rects.length + ' rooms, smallest ' +
                         Math.min(...rects.map((r) => r.w)) + 'x' + Math.min(...rects.map((r) => r.h)));
        /* ⚠ AND THE PROJECT MUST NOT MOVE THAT WINDOW. BASE_H is 648 because that is Godot's
           default viewport height and project.godot does not override it; if it ever does,
           the one number above becomes a guess. */
        const proj = fs.existsSync(path.join(GD, 'project.godot'))
          ? fs.readFileSync(path.join(GD, 'project.godot'), 'utf8') : '';
        ok(!/window\/size\/viewport_height/.test(proj),
          '…and nothing has moved the base viewport out from under that 648');
      }
      {
        const town3 = town2;
        const gr = /const GROUND_RECT := Rect2\([^,]+, [^,]+, [\d.]+, ([\d.]+)\)/.exec(town3);
        const cap = /max_view = Vector2\(0\.0, ([\d.]+)\)/.exec(town3);
        ok(gr && cap && parseFloat(cap[1]) < parseFloat(gr[1]),
          '\u26a0\u26a0 the map does not hand over its whole length on a tall screen',
          gr && cap ? 'shows at most ' + cap[1] + ' of ' + gr[1] + ' deep'
                    : 'no GROUND_RECT or no cap');
        ok(/@export var max_view: Vector2 = Vector2\.ZERO/.test(zone),
          '…and every other room is uncapped, which is what ZERO means');
      }
      ok(/var wrap: bool = TownZone\.ui_scale\(self\) > 1\.4/.test(zone)
        && /"Ore %d"/.test(zone),
        '\u26a0 the stat row folds in two when the window is narrow  (one row ran under the Journal tab)');
      ok(/b\.clip_text = true/.test(fs.readFileSync(path.join(GD, 'town_ui.gd'), 'utf8')),
        '\u26a0 and a long menu row is clipped rather than bled off the edge of the screen');
      ok(/var narrow: bool = w \/ k < 520\.0/.test(jrn),
        '\u26a0\u26a0 the journal asks "is this narrow" in BASE units, not viewport units',
        'w has already been multiplied — asking in viewport units is asking about a desktop');

      /* ══ 31 · THE FRONT OF THE ARCADE ═════════════════════════════════════════════════
         2026-09-04, Nate: *"build out the outside of the arcade building. Make it look
         nice."* ⚠⚠ EVERY OTHER BUILDING ON THIS MAP IS THE SAME COTTAGE, ON PURPOSE — that
         is what makes them read as one town, and the doors were unified in August so that a
         change to one is a change to all. This is the ONE that is not a house. */
      ok(/class ArcadeFront extends TownDoor:/.test(town2)
        && /var arc := ArcadeFront\.new\(\)/.test(town2),
        'the Arcade has a front of its own');
      {
        /* …and exactly one building does. A second subclass is a town coming apart. */
        const subs = (town2.match(/extends TownDoor:/g) || []).length;
        ok(subs === 3, '…and it is the only building that is not the shared cottage',
          subs + ' TownDoor subclasses (ArcadeFront, CityGate, Rowboat)');
      }
      ok(/sign_text = ""/.test(town2.slice(town2.indexOf('class ArcadeFront'))),
        '\u26a0 the marquee IS the sign, so the name is not also floating over the roof');
      {
        const front = town2.slice(town2.indexOf('class ArcadeFront'),
                                  town2.indexOf('# ══ THE STALL AND THE BOARD'));
        ok(/var cabs: Array = Arcade\.CABS/.test(front),
          '\u2b50\u2b50 what you see through the glass is read off the ROOM\u2019S OWN cabinet list',
          'a fifth machine puts itself in the window; nothing here can advertise a machine that is not in there');
        /* ⚠⚠ AND NOT A COPY OF IT. The four accents live in arcade.gd; a hex typed into this
           file would be a second palette that drifts the first time one is retinted. */
        const hexes = [...arc.matchAll(/"hex": "([0-9a-f]{6})"/g)].map((m) => m[1]);
        ok(hexes.length >= 4 && !hexes.some((h) => front.includes(h)),
          '…and not one of their colors is typed into the front',
          hexes.join(' '));
        ok(/bool\(cab\.get\("half", false\)\) and not GameState\.assembly_half\(\)/.test(front),
          '\u26a0 the locked machine is dark in the window, on the same gate the cabinet reads');
        ok(/int\(_t \* 8\.0\) % BULBS/.test(front),
          '\u26a0 the bulbs chase at 8 frames a second, not 60',
          'sixty redraws a second to move six circles is a bill with nothing on it [[ambient-layer-cost]]');
        ok(/func retime\(\) -> void:/.test(front) && /TownClock\.is_dark\(\)/.test(front),
          '…and it is asked by the same minute tick as every other lit thing on the map');
        ok(/_spill\.energy = 0\.85 if TownClock\.is_dark\(\) else 0\.0/.test(front),
          '\u26a0 the light on the pavement is night-only');
        /* ⚠ FOUR-SIDED PIECES, NOT ONE STRIPED SHAPE. draw_colored_polygon renders a concave
           polygon wrong and silently, and an awning is exactly the shape that tempts you.
           [[godot-draw-and-save-traps]] */
        const poly = front.slice(front.indexOf('func _draw_entrance'));
        ok(/for i in 5:/.test(poly) && (poly.match(/PackedVector2Array\(\[/g) || []).length === 1,
          '\u26a0\u26a0 the awning is built from convex quads in a loop, never one concave polygon');
      }

      /* ══ 32 · THE RHYTHM ══════════════════════════════════════════════════════════════
         ⛔ next-steps #5 IS HIS AND THIS DOES NOT DECIDE IT. What it proves is that the
         choice is one line and that the table written beside it is true. */
      ok(/const ENERGY_CAP := 100/.test(gs) && /const GAME_COST := 10/.test(gs),
        'the two numbers that decide how long the campaign takes are in one place');
      {
        /* ⚠ A NUMBER IN A COMMENT IS NOT A MEASUREMENT. The table under the constants claims
           four cap/price pairs and what each buys; recompute every row.
           [[audit-numbers-can-be-wrong]] */
        const rows = [...gs.matchAll(/^#\s+(\d+) \/ (\d+)\s+(\d+)\s/gm)]
          .map((m) => [+m[1], +m[2], +m[3]]);
        const wrong = rows.filter((r) => Math.floor(r[0] / r[1]) !== r[2]);
        ok(rows.length === 4 && wrong.length === 0,
          '…and every row of the table beside them divides out',
          wrong.length ? wrong.map((r) => r[0] + '/' + r[1] + '\u2260' + r[2]).join(' ')
                       : rows.length + ' rows, all true');
        const today = rows[0];
        ok(today && today[0] === 100 && today[1] === 10,
          '…and the first row is the one the game is actually set to');
      }
      ok(!/"energy_cap": energy_cap/.test(gs),
        '\u26a0\u26a0 the cap is NOT saved, so lowering it takes effect on the next load',
        'it used to be, which meant his pick would have looked like it did nothing');
      ok(/@export var energy_cost: int = -1/.test(chal)
        && /return GameState\.GAME_COST if energy_cost < 0 else energy_cost/.test(chal),
        '\u26a0 every bench seat charges the standard price rather than a literal 10',
        'a price typed on eight seats is a constant that cannot be changed');
      {
        /* the two that price themselves are TWO GAMES, and say so by arithmetic */
        const dep = fs.readFileSync(path.join(GD, 'depths.gd'), 'utf8');
        const both = [/energy_cost = 20/.test(dep), /_ceo\.energy_cost = 20/.test(hall)];
        ok(both[0] && both[1], '…and the shaft and the far chair are two of them', '20 = 2 \u00d7 10');
      }
      ok(/func games_left\(\) -> int:/.test(gs) && /games_left\(\)/.test(jrn),
        '\u2b50 and the journal prints how many you have left today',
        'a pacing rule nobody can see the edge of is not a pacing rule');

      /* ══ 33 · THE BOARD IS AN OPENING YOU PLAY INTO ═══════════════════════════════════
         2026-09-05, his correction: *"you should only be able to make legal moves and you
         can't attack the enemy. Basically, you can set up your opening."*
         ⚠ THE GHOST'S SECTION WAS HERE AND IS GONE — *"doesn't feel right for what I'm
         going for."* Its checks went with it rather than being left green over nothing. */
      ok(!/func track\(|var ghost|_draw_ghost|trail_step/.test(gs + town2),
        '⛑ yesterday\u2019s ghost is gone from the state AND from the map',
        'a removal that leaves the recorder running is a save still growing for nothing');

      ok(/func legal_moves\(slot: int\) -> Array:/.test(gs)
        && /func move_piece\(slot: int, f: int, r: int\) -> bool:/.test(gs)
        && !/func place_piece\(/.test(gs),
        'a piece MOVES rather than being placed, and free placement is gone',
        'two ways to put a piece on a square is two sets of rules');
      ok(/if not legal_moves\(slot\)\.has\(to\):\s*\n\s*return false/.test(gs),
        '⚠⚠ …and the legality is asked in ONE place',
        'the room lights the squares from the same list, so a cell can only offer a move '
        + 'this function would allow');
      ok(/for m in GameState\.legal_moves\(_carry\):/.test(hall),
        '…and the room LIGHTS that same list rather than holding a second opinion',
        'a room that lights a square the rules refuse is worse than a room that lights none');
      ok(/func open_at\(f: int, r: int\) -> bool:/.test(gs)
        && /r >= ARRANGE_LO and r <= ARRANGE_HI/.test(gs)
        && /slot_at\(f, r\) < 0/.test(gs),
        '⚠ "you cannot attack the enemy" is a WALL, not a rule',
        'there are no captures at all and their two ranks are simply not squares — nothing '
        + 'has to know a white piece exists');
      {
        const lm = fnGd(gs, 'legal_moves');
        ok(/at\.y == PAWN_RANK and open_at\(at\.x, at\.y - 2\)/.test(lm),
          '⚠ forward is r MINUS one, and two only from home',
          'we sit on the black side: our pawns walk toward rank one');
        ok(!/at\.x [+-] 1, at\.y - 1/.test(lm),
          '…and a pawn has no diagonal at all, because nothing can be taken');
        ok(/"n":[\s\S]{0,400}Vector2i\(1, 2\)[\s\S]{0,300}Vector2i\(-1, 2\)/.test(lm),
          'a knight has all eight jumps');
        /* ⚠⚠ EACH BRANCH PINNED TO ITS OWN LINE. The first version allowed 120 characters of
           anything between the case and the loop, which reached past the queen into the KING's
           branch — it has the same `diag + orth` — so gutting the queen went green.
           [[green-must-name-what-ran]] */
        ok(/"b":\s*\n\s*for d in diag:/.test(lm) && /"r":\s*\n\s*for d in orth:/.test(lm)
          && /"q":\s*\n\s*for d in diag \+ orth:/.test(lm)
          && /_ray\(out, at, d\.x, d\.y\)/.test(lm),
          '…and the sliders are rays that stop where something stands');
      }
      ok(/func castle_ready\(\) -> bool:/.test(gs)
        && /cell_of\(4\) == Vector2i\(3, HOME_RANK\)/.test(gs)
        && /cell_of\(7\) == Vector2i\(0, HOME_RANK\)/.test(gs)
        && /open_at\(1, HOME_RANK\) and open_at\(2, HOME_RANK\)/.test(gs),
        '⭐ castling is in, kingside only, from the two home squares',
        'the Pirc needs it — and there is no check to be in, so those halves of the rule '
        + 'have nothing here to test');
      ok(/_put\(7, Vector2i\(2, HOME_RANK\)\)/.test(gs),
        '⚠⚠ …and it moves the ROOK too, as one move',
        'a king walking e8-f8-g8 is two moves and opens nothing, which is correct');
      ok(/func reset_board\(\) -> void:/.test(gs) && /board_layout\.clear\(\)/.test(gs)
        && /setup_moves = 0/.test(gs),
        '⭐ and there is a way back — a pawn cannot walk backwards',
        'without it a board you have pushed around is a board you are stuck with');
      ok(/"id": "reset", "text": "Put every piece back\."/.test(hall)
        && /GameState\.reset_board\(\)/.test(hall),
        '…offered by the Lectern, and only once something has moved',
        'on an untouched board that object behaves exactly as it did before');
      ok(/board_layout\.erase\(str\(slot\)\)/.test(gs),
        '⚠ back home is the ABSENCE of an entry, so an untouched board saves nothing',
        '…and the layout survives the roster being reordered, which its own header requires');

      /* ══ 34 · THE PIRC OPENS A DOOR ═══════════════════════════════════════════════════
         *"If you set up the pirc (at least 6 moves in) you can enter a secret room."* */
      {
        const sysj = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-systems.js'), 'utf8');
        /* ⭐⭐ THE TOWN INVENTS NO CHESS, AND THIS IS WHAT THAT COSTS TO PROVE. The seven
           squares in GameState.PIRC are read out and compared against the site's OWN Pirc
           row — PJCCSystems.SYS.pircb — in UCI. Change the book and this file fails, rather
           than the town quietly disagreeing with the Academy about what a Pirc is. */
        const row = (sysj.match(/pircb:[\s\S]{0,400}?'\*':\s*\[([^\]]+)\]/) || [])[1] || '';
        const book = row.split(',').map((x) => x.trim().replace(/'/g, ''))
          .filter(Boolean).slice(0, 6);
        const pirc = [...gs.matchAll(/\n\t(\d+): Vector2i\((\d), (\d)\),\s+# ([a-z-]+\s*\S*)/g)]
          .map((m) => ({ slot: +m[1], f: +m[2], r: +m[3] }));
        /* the town's (f, r) back into a board square: we sit on the black side, so file 0 is
           the h-file and rank 0 is rank one. Same flip as pjcc-banner.js. */
        const sq = (f, r) => 'hgfedcba'[f] + (r + 1);
        const homes = { 4: 'e8', 5: 'f8', 6: 'g8', 7: 'h8', 10: 'c7', 11: 'd7', 14: 'g7' };
        const got = pirc.map((p) => homes[p.slot] + sq(p.f, p.r)).sort();
        /* O-O is one book move and two of the town's squares — the rook's is implied by it. */
        const want = book.filter((m) => m !== 'e8g8').concat(['e8g8', 'h8f8']).sort();
        ok(pirc.length === 7 && got.length === 7 && got.join(' ') === want.join(' '),
          '⭐⭐ the town\u2019s Pirc IS the site\u2019s Pirc, square for square',
          got.join(' ') + (got.join(' ') === want.join(' ') ? '' : '   want: ' + want.join(' ')));
        ok(/const PIRC_MOVES := 6/.test(gs)
          && /if setup_moves < PIRC_MOVES:\s*\n\s*return false/.test(gs),
          '…and it wants six moves as well as seven squares',
          'his words: "at least 6 moves in"');
        ok(/func pirc_progress\(\) -> int:/.test(gs),
          '⚠ progress counts SQUARES, not moves',
          'five squares right is four moves, and "4 of 6" would be a lie');
      }
      {
        const sec = fs.readFileSync(path.join(GD, 'secret.gd'), 'utf8');
        const scn = fs.readFileSync(path.join(GD, 'secret.tscn'), 'utf8');
        ok(/class_name SecretRoom\s*\n/.test(sec) && /extends TownZone/.test(sec)
          && /path="res:\/\/secret\.gd"/.test(scn),
          'the room behind the west wall exists, and its scene loads it');
        ok(/scene_path = "res:\/\/secret\.tscn"/.test(hall)
          && /_secret\.visible = false/.test(hall),
          '⚠⚠ …and the door is INVISIBLE until the opening is set, not locked',
          'a door you can see and cannot open is a puzzle announcing itself');
        ok(/var found := GameState\.pirc_set\(\)/.test(hall)
          && /GameState\.board_changed\.connect\(_refresh\)/.test(hall),
          '…and it appears on the move that opens it, without leaving the room');
        ok(/if found and not _secret\.visible:/.test(hall),
          '⚠ the line is said ONCE',
          'a banner every time you walk past a door you have found is the room nagging you');
        ok(/scene_path = "res:\/\/hall\.tscn"/.test(sec) && /TownExit\.new\(\)/.test(sec),
          '…and there is a way out of it');
        /* ⛑ SLICED TO THE FUNCTION. The first version tested the whole file, and the file's
           own header comment says "read live out of GameState.PIRC" — so emptying the loop
           left the check reading the paragraph that described it. */
        const stone = sec.slice(sec.indexOf('func _draw_stone'));
        ok(/for slot in GameState\.PIRC:/.test(stone) && /ChessArt\.draw_piece/.test(stone),
          '⭐ the one thing in it is the board that opened it, read live from the rule',
          'a picture, not lore — the naming and the contents are his');
        /* ⛔ AND NOTHING IN IT IS INVENTED. No name, no sign, no character: he said "to be
           named later" and this asserts that nobody named it in the meantime. */
        const signs = [...sec.matchAll(/sign_text = "([^"]*)"/g)].map((m) => m[1]);
        ok(signs.every((x) => x === 'Out') && !/TownNPC|TownChallenger/.test(sec),
          '⛔ …and it names nobody and says nothing that is his to write',
          'signs in the room: ' + (signs.join(', ') || 'none'));
        ok(!/_secret\.sign_text/.test(hall),
          '…nor does the door wear a sign, which would be a secret announcing itself');
        ok(/const ROOM := Rect2\(-576\.0, -450\.0, 1152\.0, 900\.0\)/.test(sec),
          '⚠⚠ …in a room exactly as wide as the window',
          'narrower shows gray down both sides; wider pans the camera off the walls and '
          + 'the room reads as a void with a stone in it');
      }

      {
        /* ⚠⚠ THE SYNC CONTRACT, AND IT WAS BROKEN IN BOTH DIRECTIONS FOR THREE BATCHES.
           townMerge() writes the fields it knows and DROPS the rest, so a field the town
           pushes and the site does not merge is a feature that silently does not sync —
           which is what happened to razzed, words and positions. hats/hat were the mirror
           image: merged on the way back, never sent. */
        const push = gs.slice(gs.indexOf('var payload := JSON.stringify({'),
                              gs.indexOf('JavaScriptBridge.eval', gs.indexOf('func push_to_site')));
        const sent = [...push.matchAll(/"([a-z_]+)":/g)].map((m) => m[1]).sort();
        const merge = fn(PROF, 'townMerge');
        const merged = [...merge.matchAll(/local\.([a-z_]+)\s*=/g)].map((m) => m[1])
          .filter((k, i, a) => a.indexOf(k) === i).sort();
        const missed = sent.filter((k) => merged.indexOf(k) < 0);
        const orphan = merged.filter((k) => sent.indexOf(k) < 0);
        /* \u26a0\u26a0 BOTH DIRECTIONS, AND NOT A FLOOR. The first version asked `sent.length >= 13`
           and whether each sent field was merged; deleting two from the push left thirteen,
           which cleared the floor, and the thirteen that remained were all merged \u2014 so it went
           green while two features stopped syncing. A count is not a set.
           [[green-must-name-what-ran]] */
        ok(missed.length === 0 && orphan.length === 0 && sent.length >= 15,
          '\u2b50\u2b50 the field the town pushes and the field the site merges are the SAME SET',
          (missed.length ? 'DROPPED ON ARRIVAL: ' + missed.join(' ') + '  ' : '') +
          (orphan.length ? 'MERGED BUT NEVER SENT: ' + orphan.join(' ') : sent.length + ' fields'));
        ok(/local\.hearts = maxPerKey\(local\.hearts, remote\.hearts\)/.test(merge),
          '\u26d1\u26d1 hearts is a DICTIONARY and is merged per person',
          'Math.max(+{"Auston":4}) is NaN, so every push used to write the integer 0 over it');
        ok(/local\.positions = union\(/.test(merge) && /local\.words = union\(/.test(merge)
          && /local\.hats = union\(/.test(merge) && /local\.razzed = union\(/.test(merge),
          '\u26a0 the four sets of things that have happened to you are unions');
        ok(/if \(!local\.hat && remote\.hat\)/.test(merge)
          && /if \(!local\.board_layout \|\| !Object\.keys\(local\.board_layout\)\.length\)/.test(merge),
          '\u26a0\u26a0 …and the two PREFERENCES are sticky, not unions',
          'a union would put a hat you took off back on, and build a board nobody made');
      }
      {
        const ban = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-banner.js'), 'utf8');
        ok(/PJCC\.townBoard = function \(\)/.test(PROF) && /PJCC\.townBoard/.test(ban),
          'the site can ask for the board you built');
        ok(/"p": piece_at\(slot\)/.test(gs),
          '\u26a0 the banner is sent the REAL piece, not the town\u2019s custom mark',
          'Michael is drawn with his own glyph in the room and the site can only draw the six');
        /* ⚠⚠ AND THE BANNER HOLDS NO COPY OF THE ROSTER. The town sends the name with the
           square; a character list in here is a second one that drifts on the first rename. */
        const cast = [...gs.matchAll(/"who": "([A-Za-z ]+)"/g)].map((m) => m[1]);
        /* ⚠ COMMENTS STRIPPED. The rule is about CODE — a note in the header naming the
           two characters the square-naming was checked against is the evidence, not a
           second roster, and scanning it as data made the check fire on its own footnote. */
        const banCode = ban.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        ok(cast.length >= 10 && !cast.some((w) => banCode.includes(w)),
          '\u2b50\u2b50 …and not one character\u2019s name is written into the renderer');
        /* the square names it reads out, checked against the roster the town ships */
        const B = require(path.join(ROOT, 'assets/js/pjcc-banner.js'));
        ok(B.sqName(0, 6) === 'h7' && B.sqName(7, 7) === 'a8' && B.sqName(0, 0) === 'h1',
          '\u26a0\u26a0 …and it names a square the way the room does',
          'we sit on the BLACK side: column 0 is the h-file and row 0 is rank one \u2014 ' +
          [B.sqName(0, 6), B.sqName(7, 7), B.sqName(0, 0)].join(' '));
        ok(/host\.parentNode\.removeChild\(host\)/.test(ban),
          '\u26a0 an empty board removes its own block  (sixty-four empty squares is a chore with a frame round it)');
        const dsr = fs.readFileSync(path.join(ROOT, 'dossier.md'), 'utf8');
        ok(/PJCCBanner\.mount/.test(dsr) && /pjcc-banner\.js/.test(dsr) && /pjcc-pieces\.js/.test(dsr),
          '…and the Dossier draws it, with the glyphs loaded before it');
        /* ⚠⚠ AND IT IS RUN, NOT JUST READ. There is no local Jekyll, so /dossier/ does not
           exist to load — but the renderer is a plain module and this file already has a
           browser open. Draw a real board on a real canvas and count what came out: two
           square colors and a frame is an empty board, and a piece adds its own.
           [[measure-the-real-page]] */
        const shot = await page.evaluate((srcs) => {
          srcs.forEach((src) => {
            const el = document.createElement('script');
            el.textContent = src;
            document.head.appendChild(el);
          });
          const board = [{ p: 'r', who: 'Vince', f: 7, r: 7 },
                         { p: 'p', who: 'Crockett', f: 0, r: 6 },
                         { p: 'q', who: 'Michael', f: 3, r: 3 }];
          function paint(rows) {
            const c = document.createElement('canvas');
            document.body.appendChild(c);
            const drew = window.PJCCBanner.draw(c, rows, { cell: 30 });
            const g = c.getContext('2d');
            const d = g.getImageData(0, 0, c.width, c.height).data;
            const seen = {};
            for (let i = 0; i < d.length; i += 4) seen[d[i] + ',' + d[i + 1] + ',' + d[i + 2]] = 1;
            return { drew: drew, colors: Object.keys(seen).length, w: c.width, h: c.height };
          }
          const bare = paint([]);
          const full = paint(board);
          return { bare: bare, full: full, glyphs: !!window.PJCCPieces,
                   label: window.PJCCBanner.label(board) };
        }, [fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-pieces.js'), 'utf8'),
            fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-banner.js'), 'utf8')]);
        ok(shot.glyphs === true,
          '\u26a0 …with the real glyph module loaded, not the plain-disc fallback',
          'the first version of this check injected only the banner, so the branch it was ' +
          'aiming at was dead code in the page and the mutation went blind');
        /* ⭐⭐ DIFFERENTIAL, so a frame with nothing in it can never satisfy it: an empty board
           is three flat colors and every piece adds its own. */
        ok(shot.full.drew === true && shot.full.colors > shot.bare.colors + 4,
          '\u2b50\u2b50 …and the renderer actually paints PIECES in a browser',
          shot.bare.colors + ' colors empty \u2192 ' + shot.full.colors + ' with three pieces, on ' +
          shot.full.w + '\u00d7' + shot.full.h);
        ok(shot.label === 'Your Assembly board, 3 of 16: Vince on a8, Crockett on h7, Michael on e4.',
          '…and reads itself out in board squares for anybody who cannot see it',
          shot.label);
      }

      /* ══ 35 · ONE REAL VOICE LINE EACH ════════════════════════════════════════════════
         ⛔ off-the-wall #10 is HIS to record. This is the socket and the script. */
      {
        const vc = fs.readFileSync(path.join(GD, 'town_voice.gd'), 'utf8');
        ok(/^class_name TownVoice$/m.test(vc), 'there is somewhere for a recording to plug in');
        ok(/if ResourceLoader\.exists\(path\)/.test(vc),
          '\u26a0\u26a0 …and it asks before it loads',
          'load() on a path not in the .pck prints an engine error per call, thirteen a visit');
        ok(/_cache\[id\] = s/.test(vc) && /if _cache\.has\(id\):/.test(vc),
          '\u26a0 misses are cached too, or every conversation hits the filesystem again');
        ok(/not GameState\.sound_on/.test(vc), '\u26a0 and the mute silences it like everything else');
        ok(/v\.hello\(who\)/.test(npc), '\u2026a greeting plays when somebody opens their mouth');
        /* ⚠⚠ NO AUDIO SHIPS TODAY, and the whole design rests on that being true: the socket
           is not dead code because it costs nothing, and it costs nothing because the folder
           is empty. The day it stops being empty, this check is what says so. */
        const ogg = fs.existsSync(path.join(GD, '..', '..', '..', '..', 'assets/games/checker-town'));
        const voiceDir = path.join(ROOT, 'private/docs/godot/chess_town/voice');
        const files = fs.existsSync(voiceDir)
          ? fs.readdirSync(voiceDir).filter((f) => /\.ogg$/i.test(f)) : [];
        ok(true, '\u2026and today the folder holds ' + files.length + ' recording(s)',
          files.length ? files.join(' ') : 'the socket costs nothing while it is empty');
        /* ⭐⭐ THE SCRIPT CANNOT FALL BEHIND THE CAST. Everybody who speaks in this town has a
           row, and every row is somebody who speaks. */
        const scriptPath = path.join(ROOT, 'private/docs/VOICE-SCRIPT.md');
        if (fs.existsSync(scriptPath)) {
          const doc = fs.readFileSync(scriptPath, 'utf8');
          const all = fs.readdirSync(GD).filter((f) => f.endsWith('.gd'))
            .map((f) => fs.readFileSync(path.join(GD, f), 'utf8')).join('\n');
          const speaks = new Set();
          [...all.matchAll(/\.who = "([^"]+)"/g)].forEach((m) => speaks.add(m[1]));
          [...all.matchAll(/_add_challenger\("([^"]+)"/g)].forEach((m) => speaks.add(m[1]));
          const slug = (w) => w.toLowerCase().replace(/ /g, '-');
          const listed = new Set([...doc.matchAll(/`([a-z-]+)\.ogg`/g)].map((m) => m[1]));
          const noRow = [...speaks].filter((w) => !listed.has(slug(w)));
          const noOne = [...listed].filter((f) => ![...speaks].some((w) => slug(w) === f));
          ok(speaks.size >= 12 && noRow.length === 0 && noOne.length === 0,
            '\u2b50\u2b50 the recording script names every character in the town, and nobody else',
            (noRow.length ? 'NO ROW: ' + noRow.join(' ') + '  ' : '') +
            (noOne.length ? 'NOBODY: ' + noOne.join(' ') : speaks.size + ' speak, ' + listed.size + ' listed'));
        } else {
          ok(false, 'private/docs/VOICE-SCRIPT.md is missing');
        }
      }
      }
    } else {
      ok(false, 'the Godot copy is missing from private/docs/godot/chess_town');
    }
  } finally {
    await browser.close();
    server.close();
  }

  process.exit(report('CHECKER TOWN — the seam the site answers through', results, []) ? 0 : 1);
})();
