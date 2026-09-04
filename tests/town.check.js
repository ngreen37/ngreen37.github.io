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

const markLast = fn(PT, 'markLast');
const finishAs = fn(PT, 'botFinishAs');
ok(markLast, 'Park Tables has a markLast()');
ok(/pjcc\.pt\.last\.v1/.test(markLast), '…and it writes pjcc.pt.last.v1');
ok(/\bat:\s*Date\.now\(\)/.test(markLast),
  '…stamped with Date.now(), or "did that just happen" has no answer');
ok(/won:\s*!!botWon\(st\)/.test(markLast),
  '…and records who won  (⚠ botWon() means YOU won — the name reads backwards)');
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
      PJCC.mergeTown({ day: 4, ore: 10, hearts: 3, army: [0, 5], ceo_beaten: false,
                       beaten: { crockett: 4, argus: 2 }, scouted: { crockett: 3 } });
      const first = JSON.parse(localStorage.getItem('pjcc.town.v1'));
      // the other device: further on in places, BEHIND in others
      const merged = PJCC.mergeTown({ day: 2, ore: 40, hearts: 1, army: [5, 11],
                                      ceo_beaten: true, beaten: { crockett: 1, kedar: 6 },
                                      scouted: { crockett: 1, argus: 2 } });
      return { first: first, m: merged, stored: JSON.parse(localStorage.getItem('pjcc.town.v1')) };
    });
    ok(M.first && M.first.day === 4, 'mergeTown: writes pjcc.town.v1');
    ok(JSON.stringify(M.m.army) === JSON.stringify([0, 5, 11]),
      'mergeTown: army is a UNION of slot indices, deduped and sorted', JSON.stringify(M.m.army));
    ok(M.m.day === 4, 'mergeTown: day takes the MAX — a stale row cannot rewind the calendar');
    ok(M.m.ore === 40, 'mergeTown: ore takes the MAX');
    ok(M.m.hearts === 3, 'mergeTown: hearts take the MAX');
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
      ok(/_add_challenger\("Princess", "princess"/.test(town),
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
      /* ⚠ the lectern's own comment said listing Michael "would read as a quest you can
         start today, and neither of them is anywhere". Making them winnable made that true. */
      ok(/_owed_elsewhere\(/.test(hall) && /unlock_say/.test(hall),
        'the lectern separates who you can walk up to from what is waiting on you elsewhere');

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
      ok(/sp\.speaker\(\) != self/.test(npc),
        '…the nameplate yields to the words  (⛑ the exact 09-02 stacking, one layer up)');
      ok(/sp\.speaker\(\) != null/.test(fs.readFileSync(path.join(GD, 'npc_card.gd'), 'utf8')),
        '…and so does the relationship card');
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

      /* the testing speed, and the two things that had to move with it */
      ok(/@export var speed: float = 1180\.0/.test(player), 'the walk is at his 09-03 number');
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
      const doors = [...(isl + town2).matchAll(/url = "(\/[^"]+)"/g)].map((m) => m[1])
        .concat([...town2.matchAll(/_add_door\([^,]+,\s*"(\/[^"]+)"/g)].map((m) => m[1]));
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
    } else {
      ok(false, 'the Godot copy is missing from private/docs/godot/chess_town');
    }
  } finally {
    await browser.close();
    server.close();
  }

  process.exit(report('CHECKER TOWN — the seam the site answers through', results, []) ? 0 : 1);
})();
