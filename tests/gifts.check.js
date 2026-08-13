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
check('the BOARD resolves it once before the first render',
  /PJCCGift\.available\(\)/.test(BOARD) && /giftsOn = !!on/.test(BOARD));
check('…and a failure leaves it OFF, which is the state that draws nothing',
  /function \(\) \{ giftsOn = false; \}/.test(BOARD));
check('no gift button is drawn on your own row',
  /giftsOn && !mine/.test(BOARD), 'offering an action that can only fail is worse than not offering it');

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
check('…with an accessible name that says what it does',
  /aria-label="Send credits to /.test(BOARD));
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

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
