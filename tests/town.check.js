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
      ok(/GameState\.board_cell\(slot\)/.test(hall) && /GameState\.board_cell\(slot\)/.test(door),
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
