/* ═══════════════════════════════════════════════════════════════════════════════════
 * CREDIT GIFTS — the five amounts, the refusals, and the invisible-until-migrated rule
 * -----------------------------------------------------------------------------------
 * WHAT THIS DEFENDS, in order of how expensive the mistake would be:
 *
 *   1. THE CLIENT AND THE SERVER AGREE ON THE FIVE AMOUNTS. They are named in two files
 *      and only one of them enforces. A button the SQL refuses is a player watching a
 *      send fail for no reason they can see.
 *   2. NOTHING IS DRAWN BEFORE THE MIGRATION IS RUN. A dead gift button on a live board
 *      is worse than no gift button — it spends the one bit of trust the feature has.
 *   3. NO CALL EVER THROWS. Every refusal resolves {ok:false, reason} so the sheet shows
 *      a sentence, and every reason the SQL can return has a sentence written for it.
 *   4. THE BALANCE IS SPENT ATOMICALLY. A read-then-write in the SQL would let two tabs
 *      each pass a check the other invalidates.
 *   5. A SHORTENED GIFT CHARGES EXACTLY WHAT IT DELIVERS. Two daily rails can clip a gift
 *      mid-flight; debiting the ASK while crediting the CLIPPED amount would destroy the
 *      difference on every one of them, and every screen in the site would still add up.
 *
 *   node tests/gifts.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PROFILE = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
const GIFT = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-gift.js'), 'utf8');
const BOARD = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-leaderboard.js'), 'utf8');
const DOC = fs.readFileSync(path.join(ROOT, 'docs/credit-gifts-setup.md'), 'utf8');
const PAGE = fs.readFileSync(path.join(ROOT, 'leaderboards.md'), 'utf8');
const SCSS = fs.readFileSync(path.join(ROOT, '_sass/_pjcc-14-profile.scss'), 'utf8');
const PT   = fs.readFileSync(path.join(ROOT, 'games/park-tables/index.html'), 'utf8');
const SETUP = fs.readFileSync(path.join(ROOT, 'docs/supabase-setup.sql'), 'utf8');

/* ⚠⚠ A NEGATIVE ASSERTION MUST NOT READ THE COMMENTS. Two checks in section 8 failed the
   moment they were written, and both for the same reason: this codebase explains itself at
   length, so "the board no longer calls PJCCGift.available()" tripped on the comment SAYING
   it no longer calls it, and "no frag_ appears in the card" tripped on the paragraph
   explaining why secrets cannot be shown. Left alone, the only way to keep such a check
   green is to stop writing the sentence that documents the decision — which is precisely
   backwards. `code()` strips the prose so a "this is absent" check is about the program.
   ⚠ NOT for every check: the give-cap guard in section 6 scans the comments ON PURPOSE (a
   stale cap in a header block is a confident lie), so it keeps reading the raw file. */
const code = (src) => src
  .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, ' ')  // Liquid
  .replace(/\/\*[\s\S]*?\*\//g, ' ')                                          // block
  .replace(/^\s*\/\/.*$/gm, ' ');                                             // whole-line

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── CREDIT GIFTS ──────────────────────────────────────────\n');

/* ── 1. THE LADDER IS THE SAME ON BOTH SIDES ─────────────────────────────────────── */
const clientTiers = JSON.parse(
  (PROFILE.match(/var GIFT_TIERS = (\[[^\]]*\]);/) || [])[1] || '[]');
const sqlTiers = ((DOC.match(/p_amount not in \(([^)]*)\)/) || [])[1] || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

check('the client draws five amounts', clientTiers.length === 5, clientTiers.join(' · '));
check('…and the SQL enforces the same five, in the same order',
  JSON.stringify(clientTiers) === JSON.stringify(sqlTiers),
  'client ' + clientTiers.join(',') + '  vs  sql ' + sqlTiers.join(','));
check('…and they are the ones he asked for', JSON.stringify(clientTiers) === '[1,5,10,25,50]',
  clientTiers.join('/'));

/* ── 2. INVISIBLE UNTIL THE MIGRATION IS RUN ─────────────────────────────────────── */
check('the client PROBES for the function rather than assuming it',
  /giftsEnabled/.test(PROFILE) && /rpc\('gift_credits'/.test(PROFILE));
/* ⚠ the probe must not be able to move money. Calling with an amount off the ladder is
   refused by the SQL before it touches a balance — an amount ON the ladder would be a
   real gift fired on every page load. */
check('…and the probe uses an amount the ladder REFUSES, so it cannot spend anything',
  /p_amount: 0/.test(PROFILE) && clientTiers.indexOf(0) < 0,
  'probes with 0, which is not one of ' + clientTiers.join('/'));
check('…and the answer is cached per session, not asked per row or per render',
  /sessionStorage/.test(PROFILE) && /pjcc\.gifts\.on/.test(PROFILE));
check('a signed-out visitor never probes at all',
  /if \(!sb \|\| !PJCC\.currentUser\(\)\) return false;/.test(PROFILE),
  'the most common visit makes no request');
/* ⚠⚠ THE PROBE MOVED, 2026-08-19, AND THAT IS THE POINT. It used to live in the BOARD and
   decide whether a codename was clickable at all — which meant LOOKING at another operative
   was gated behind the credit-gift migration. The card reads only already-public tables, so
   the probe now sits inside the card and decides one thing: whether the SEND section draws.
   These three checks follow it rather than being deleted; the invariant they defend (nothing
   gift-shaped renders on a maybe) is unchanged. */
check('the CARD resolves it once per open, and never rejects',
  /PJCCGift\.available\(\)/.test(GIFT) && /giftsOn = both\[1\]/.test(GIFT));
check('…and a failure leaves it OFF, which is the state that draws nothing',
  /function \(\) \{ return false; \}\)/.test(GIFT));
check('no gift row is drawn on your own card',
  /giftsOn && !mine \? giftBlock/.test(GIFT) && /if \(giftsOn && !mine\)/.test(GIFT),
  'offering an action that can only fail is worse than not offering it');
check('…and the board itself asks NOTHING before its first render',
  /PJCC\.ready\.then\(load, load\);/.test(BOARD) &&
  !/var giftsOn/.test(code(BOARD)) && !/PJCCGift\.available/.test(code(BOARD)),
  'the standings are not behind a payments probe');
check('…nor does the park tables page',
  !/var giftsOn/.test(code(PT)) && !/PJCCGift\.available/.test(code(PT)),
  'the nameplate is a door, not a till');

/* ── 3. NOTHING THROWS, AND EVERY REFUSAL HAS WORDS ──────────────────────────────── */
const said = (GIFT.match(/var SAID = \{([\s\S]*?)\};/) || [])[1] || '';
const saidKeys = (said.match(/^\s*(\w+):/gm) || []).map(s => s.trim().replace(':', ''));
// every `reason` string the SQL can hand back
const sqlReasons = [...DOC.matchAll(/'reason',\s*'(\w+)'/g)].map(m => m[1]);
const uncovered = [...new Set(sqlReasons)].filter(r => saidKeys.indexOf(r) < 0);
check('every refusal the SQL can return has a sentence written for it', uncovered.length === 0,
  uncovered.length ? 'no wording for: ' + uncovered.join(', ') : sqlReasons.length + ' reasons, all covered');
check('…including the not-migrated case, which is not dressed up as an outage',
  /offline:\s*'Gifts aren.t switched on yet\.'/.test(GIFT));
check('giftCredits resolves a refusal instead of throwing',
  /catch \(e\) \{ return \{ ok: false, reason: 'offline' \}; \}/.test(PROFILE));
check('…and giftsReceived resolves [] so a caller needs no guard',
  /catch \(e\) \{ return \[\]; \}/.test(PROFILE));

/* ── 4. THE SQL SPENDS ATOMICALLY ────────────────────────────────────────────────── */
/* ⚠⚠ THE ONE THAT MATTERS. `select balance; if ok then update` is two statements, and two
   tabs in the gap between them can each pass a check the other invalidates. The balance
   test has to live in the WHERE of the update that spends it. */
check('the debit checks the balance INSIDE the update, not before it',
  /update profiles\s*\n\s*set credits = credits - v_send[\s\S]{0,120}where id = me and credits >= v_send/.test(DOC),
  'the check and the spend are one write');
check('…and a non-matching row is how "not enough" is detected',
  /returning credits into left_after;[\s\S]{0,140}if left_after is null then[\s\S]{0,120}'not_enough'/.test(DOC));
check('the ledger has NO insert policy — only the definer function writes it',
  /create policy "gifts read" on credit_gifts for select/.test(DOC) &&
  !/credit_gifts for insert/.test(DOC));
check('…and it is readable only by the two people involved',
  /auth\.uid\(\) = from_id or auth\.uid\(\) = to_id/.test(DOC));
check('you cannot gift yourself, and the server says so',
  /if target = me then[\s\S]{0,80}'self'/.test(DOC));

/* ── 5. THE TWO DAILY RAILS ──────────────────────────────────────────────────────── */
/* Nate 2026-08-13: "cap it at 75 per day for now … you can give out as much as you want,
   but you can only receive 50 per day". Both windows are COUNTED off the ledger rather
   than stored on the profile, so a second tab and a forgetful client both hit them. */
check('the GIVE rail counts what you sent, in a rolling 24h window',
  /sum\(amount\), 0\) into given_today[\s\S]{0,120}where from_id = me and created_at > now\(\) - interval '24 hours'/.test(DOC));
check('the HOLD rail counts what THEY received — the one that ceilings a funnel',
  /sum\(amount\), 0\) into got_today[\s\S]{0,120}where to_id = target and created_at > now\(\) - interval '24 hours'/.test(DOC),
  'capping the giver slows one mule; capping the receiver stops all of them');
check('…and the receiving rail is the TIGHTER of the two',
  /give_left := greatest\(75 - given_today, 0\);/.test(DOC) &&
  /hold_left := greatest\(50 - got_today, 0\);/.test(DOC),
  'give 75 / hold 50');
check('a full recipient is refused WITHOUT any numbers coming back',
  /'reason', 'recipient_full'\)/.test(DOC) &&
  !/'reason', 'recipient_full',/.test(DOC),
  'otherwise the refusal is a way to measure a stranger’s day');

/* ── 6. A GIFT THAT HITS A RAIL IS SHORTENED, NOT REFUSED ────────────────────────── */
/* "the giver will get a notification that the recipient has received as much as they can
   hold for the day and the difference remains with the original giver" */
check('the amount sent is clamped to BOTH rails and the ask',
  /v_send := least\(p_amount, give_left, hold_left\);/.test(DOC));
check('…and the ledger records what MOVED, not what was asked for',
  /insert into credit_gifts \(from_id, to_id, amount\) values \(me, target, v_send\);/.test(DOC),
  'the cap is counted off this table — logging the ask would charge twice');
/* ⚠⚠ THE EXPENSIVE BUG THIS CLASS PRODUCES: debit `p_amount`, credit `v_send`, and the
   difference is destroyed on every shortened gift while every screen still adds up. */
check('…and the giver is debited the same number the recipient is credited',
  (DOC.match(/set credits = credits - v_send/g) || []).length === 1 &&
  (DOC.match(/set credits = credits \+ v_send/g) || []).length === 1 &&
  !/credits - p_amount|credits \+ p_amount/.test(DOC),
  'nothing may be charged and not delivered');
check('the reply says what moved AND what stayed', /'kept', v_kept/.test(DOC) &&
  /'amount', v_send, 'requested', p_amount/.test(DOC));
check('…and names the rail that shortened it, not a number',
  /v_limit := case when hold_left <= give_left then 'them' else 'you' end;/.test(DOC));

/* the sheet has to report the SERVER's number — printing the button the player pressed
   would be a 50 that moved 20, which reads as a bug rather than a cap */
check('the sheet prints the amount that actually moved',
  /Sent ' \+ r\.amount \+ ' to '/.test(GIFT), 'never the button that was pressed');
check('…and tells the giver where the difference went',
  /stayed with you/.test(GIFT) && /SHORT\[r\.limit\]/.test(GIFT));
check('…in words that carry no number about the other person',
  !/\d/.test((GIFT.match(/var SHORT = \{([\s\S]*?)\};/) || [])[1] || 'x9'));
check('…and a shortened gift stays on screen longer than a clean one',
  /kept > 0 \? 3400 : 1600/.test(GIFT), 'two sentences and an unexpected number');
/* ⚠ THE CAPS LIVE IN ONE FILE. Not even a COMMENT out here may name them: Nate changes a
   number in the SQL, nothing in the client breaks, and the stale copy in a header block is
   then a confident lie that outlives everyone who remembers the edit.

   ⚠ ONLY THE GIVE CAP IS POLICEABLE. The hold cap is 50, which is also one of the five
   amounts and also a number in Nate's quoted ask — a scan for it would fire on all three
   and get switched off within a week. 75 and the retired 200 are unambiguous, so they are
   what this watches; the shape it protects covers both. */
const capNums = /(^|[^\w.])(75|200)\b/;
check('the give cap does not appear in the client at all — not even in a comment',
  !capNums.test(GIFT) &&
  !capNums.test((PROFILE.match(/══ CREDIT GIFTS[\s\S]*?var GIFT_TIERS/) || [''])[0]),
  'the SQL is the only place it is written down');
check('the function is not executable by anonymous callers',
  /revoke all on function gift_credits\(text, int\) from public;/.test(DOC) &&
  /grant execute on function gift_credits\(text, int\) to authenticated;/.test(DOC));
/* by codename, so no page ever has to put a user's uuid in its HTML */
check('gifts go BY CODENAME — no page exposes a user id',
  /gift_credits\(p_to_codename text, p_amount int\)/.test(DOC) &&
  !/data-gift-id|user_id/.test(BOARD));

/* ── 7. IT IS A REAL CONTROL, AND REACHABLE ──────────────────────────────────────── */
check('the name becomes a <button>, not a clickable cell',
  /<button class="lb-gift"/.test(BOARD), 'keyboard + screen reader + no hover needed');
/* ⚠ THE LABEL HAS TO MATCH WHAT THE PRESS ACTUALLY DOES. The board's button used to send
   credits and said so; it opens a card now, and a screen reader promised "Send credits to
   NAME" would be announcing a payment for what is a profile view. The SEND labels moved
   into the card with the buttons. */
check('…with an accessible name that says what it does — the board opens a file',
  /aria-label="Open the file on /.test(BOARD) && !/aria-label="Send credits to /.test(BOARD));
check('…and the park tables nameplate says the same thing',
  /aria-label="Open the file on /.test(PT) && !/aria-label="Send credits to /.test(PT));
check('…while the amounts inside the card are the ones that say "send"',
  /aria-label="Send ' \+ n \+ ' credits"/.test(GIFT));
check('…and a 44px hit box on touch that does not grow the row',
  /\.lb-gift \{ display: inline-block; padding: 12px 4px; margin: -12px -4px; \}/.test(SCSS));
/* ⚠⚠ CAUGHT BY A RENDER, NEVER BY A NUMBER. `.gift-ok` / `.gift-no` are worn by a <b> that
   sits inside `.gift-bal`, and `.gift-bal b` (0-1-1) outranks a bare class (0-1-0) — so the
   mint success and the red refusal both came out plain white, and every test here was green
   the whole time. Anything scoped under .gift-bal has to out-specify that rule. */
check('the outcome colors actually beat `.gift-bal b`',
  /\.gift-bal b\.gift-ok \{ color: #6bffb8; \}/.test(SCSS) &&
  /\.gift-bal b\.gift-no \{ color: #ff9b9b; \}/.test(SCSS),
  'a bare .gift-ok loses to .gift-bal b and renders as nothing at all');
check('a refusal no amount can beat leaves the buttons down',
  /var DEAD = \['offline', 'daily_cap', 'recipient_full'\];/.test(GIFT) &&
  /DEAD\.indexOf\(r\.reason\) < 0/.test(GIFT),
  'a spent rail refuses all five identically — do not invite a tour of the ladder');
check('the sheet is a real dialog and closes on Escape',
  /role="dialog" aria-modal="true"/.test(GIFT) && /e\.key === 'Escape'/.test(GIFT));
check('a double-tap cannot send twice — the row locks on the first press',
  /x\.disabled = true;/.test(GIFT), 'this one costs money');
check('the page loads the gift module BEFORE the board that asks about it',
  PAGE.indexOf('pjcc-gift.js') > -1 &&
  PAGE.indexOf('pjcc-gift.js') < PAGE.indexOf('pjcc-leaderboard.js'),
  'both are defer, which runs in document order');
check('the balance is taken from the SERVER reply, never recomputed locally',
  /profile\.credits = out\.balance;/.test(PROFILE),
  'never compute a number you were just told');

/* ── 8. THE OPERATIVE CARD (2026-08-19) ──────────────────────────────────────────────
   Nate: "when you click on a user… it shows their avatar and companion, their trophies,
   and secrets unlocked, and you can gift them credits from there."

   WHAT THIS SECTION DEFENDS:
     1. THE CARD NEEDS NO MIGRATION. It reads two tables that are already `select using
        (true)` and that the leaderboards already draw. The moment it needs an RPC or a new
        table, it inherits the gift's invisible-until-migrated problem for no reason.
     2. NO USER ID EVER REACHES THE MARKUP. The uuid has to be READ to ask game_stats a
        question; it must die in that function.
     3. THE TROPHY RULES ARE NOT COPIED. One list, in pjcc-profile.js, read by your dossier
        and by somebody else's card alike.
     4. NOTHING IS CLAIMED THAT IS NOT KNOWN. Secrets and pet colors are localStorage-only
        and there is no honest way to show a stranger's — so they are absent, not faked. */

check('the card reads the two PUBLIC tables and nothing else',
  /from\('profiles'\)/.test(GIFT) && /from\('game_stats'\)/.test(GIFT) && !/\.rpc\(/.test(code(GIFT)),
  'no new function, no new table, no migration');
/* ⚠ if either policy ever stops being public the card goes blank for everyone but you, and
   the failure is silent — an empty card, not an error. Pin both here. */
check('…and both of those really are readable by anyone',
  /create policy "profiles read"\s+on profiles for select using \(true\);/.test(SETUP) &&
  /create policy "stats read"\s+on game_stats for select using \(true\);/.test(SETUP),
  'the card is drawn from what the boards already show');
check('the uuid is used for the query and never rendered',
  /\.eq\('user_id', uid\)/.test(GIFT) &&
  !/(innerHTML|'\s*\+\s*(prof|res)\.id|data-[\w-]*id="'\s*\+\s*\w*\.id)/.test(
    (GIFT.match(/var uid = prof\.id;[\s\S]*?^  \}/m) || [''])[0]),
  'every identifier on the page is a codename');
check('a pre-Park-Tables server still gets a card',
  /select\(WIDE\)[\s\S]{0,220}select\(CORE\)/.test(GIFT),
  'the wide column list falls back rather than blanking the card');

check('trophies come from the ONE achievement list, not a copy',
  /PJCC\.earnedAchievements\(prof, stats\)/.test(GIFT) &&
  /PJCC\.ACHIEVEMENTS = ACHIEVEMENTS/.test(PROFILE),
  'add one to ACHIEVEMENTS and every card lights it up');
check('…and only the EARNED ones are shown to a stranger',
  /\.filter\(function \(a\) \{ return a\.earned; \}\)/.test(GIFT),
  'the full list with misses grayed out is a to-do list, and it is not yours');
check('the rating is hidden until it has been played for',
  /prof\.rated_games > 0 && prof\.pjcc_rating != null/.test(GIFT),
  'everyone starts at 250 — an unplayed 250 reads as a measurement');

/* ⚠⚠ THE HONEST-GAP CHECKS. Both of these are things Nate ASKED FOR that the server does
   not know, and the failure mode is not a crash — it is a card that quietly asserts
   something false about a person ("found no secrets", "owns a brown-eyed dog"). If either
   ever becomes real, it becomes a stored field first and these checks come out. */
check('secrets are not drawn, because nothing uploads them',
  !/frag_/.test(code(GIFT)) && !/localStorage/.test(code(GIFT)) &&
  /SECRETS ARE NOT ON THIS CARD/.test(GIFT),
  'the card touches no local storage, so it can only claim what the server knows');
check('…and the pet is drawn from the species alone, with the gap written down',
  /THE PET.S COLORS ARE LOCAL TOO/.test(GIFT) &&
  /coat: 'natural', eye: 'brown', nose: 'black'/.test(GIFT),
  'species and stage are true; the colors are the factory ones');
check('the companion stage is DERIVED from server-side rounds, not read',
  /PJCC\.companionLevel\(rounds\)/.test(GIFT) && /lv\.level >= 6 \? 2 : lv\.level >= 3 \? 1 : 0/.test(GIFT),
  'the Den bond level is in THEIR localStorage and is unknowable here');
check('…and its label is read off PJCC.LEVELS rather than typed here',
  /esc\(lv\.stage\)/.test(GIFT) && !/Pathfinder|Vanguard|Legend of the Board/.test(code(GIFT)),
  'a second copy of the stage names is a second thing to keep in sync');

check('the card opens on the tap, before it knows anything',
  /Opening the file…/.test(GIFT), 'a tap that does nothing for a beat is a tap made twice');
check('…and a card closed mid-fetch cannot paint over its replacement',
  /var my = \+\+openToken;/.test(GIFT) && /if \(my !== openToken\) return;/.test(GIFT),
  'the stale-render bug the per-open teardown exists to prevent');
check('a missing operative is a sentence, not an empty card',
  /SAID\[res\.reason\] \|\| SAID\.offline/.test(GIFT));

/* ⚠⚠ THE CARD MUST OPEN SHOWING THE PERSON. Both of these guard ONE bug, found only by
   looking at a render at 1280×420: the sheet's old `first.focus()` on the cheapest amount
   scrolled the card's own overflow box down to reveal it, so a short window opened straight
   onto the row of money with the name, face and clearance scrolled off above.
   ⚠ THE GEOMETRY CHECK SAID IT WAS FINE. The card's bounding rect was flawless — top 29,
   nothing clipped — because the damage was to `scrollTop` INSIDE the card, which no rect
   can see. Measuring the box is not measuring what is on screen.
   ⚠ AND IT ARMED A SPEND WITH A SPACEBAR, which is its own reason never to put it back. */
check('the card never puts focus on a money button',
  !/\[data-amt\][^;]*\.focus\(\)/.test(code(GIFT)) && /#gift-x'\)\.focus\(\)/.test(GIFT),
  'focus stays on close — the first thing a keyboard lands on must not spend');
check('…and it opens scrolled to the top, at the operative',
  /card\.scrollTop = 0;/.test(GIFT),
  'a card that opens at the send row shows money and no person');

/* pjcc-pet-art.js is NOT site-wide (it lives in the default layout's neighbors, not in
   it), so every page that opens a card has to bring it. Without it the companion section
   is absent — which is the right failure, but only if it is never silently expected. */
/* ⚠⚠ AND THE SAME TRAP RUNS THE OTHER WAY. These two were written as a plain search of
   the page source for "pjcc-pet-art.js" — and passed with the <script> tag DELETED, because
   the Liquid comment ABOVE the tag names the file while explaining why it is there. A gate
   that is satisfied by its own documentation is not a gate. Both read `code()` now, and the
   first looks for a real tag rather than a mention. (Caught by deleting the tag and watching
   66/0 stay green — the only way this class of bug is ever found.) */
const PAGE_C = code(PAGE), PT_C = code(PT);
const petTag = /<script src="\{\{ '\/assets\/js\/pjcc-pet-art\.js'/;
check('both card hosts load the pet art the companion needs',
  petTag.test(PAGE_C) && petTag.test(PT_C));
check('…before the card module that calls it',
  PAGE_C.indexOf('pjcc-pet-art.js') < PAGE_C.indexOf('pjcc-gift.js') &&
  PT_C.indexOf('pjcc-pet-art.js') < PT_C.indexOf('pjcc-gift.js'));
check('the card is a real dialog too, and the sheet styles are shared',
  /class="gift-sheet op-card"/.test(GIFT) && /\.op-card \{/.test(SCSS),
  'one modal, widened — not a second one to keep in step');
/* ⚠⚠ PAID FOR THREE TIMES NOW (the VS rail, Floor Ten, and this). A centered flex child
   taller than its container overflows off the TOP, where no scrollbar reaches. */
check('a card taller than the window loses its bottom, never its face',
  /\.gift-ov \{ align-items: safe center; \}/.test(SCSS) && /overflow-y: auto;/.test(SCSS));

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
