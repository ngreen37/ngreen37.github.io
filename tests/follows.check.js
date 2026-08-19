/* ═══════════════════════════════════════════════════════════════════════════════════
 * FOLLOW — a private bookmark, and the four ways that could quietly stop being true
 * -----------------------------------------------------------------------------------
 * 2026-08-19, Nate asked to "add them as a friend"; the built thing is the ONE-WAY,
 * PRIVATE version, and almost everything worth defending here is a thing that is ABSENT
 * on purpose. Absences are what rot: nobody notices the day a follower count appears.
 *
 *   1. THE LIST IS PRIVATE TO THE FOLLOWER. The RLS policy is `auth.uid() = follower_id`
 *      and there is no second policy. A follow graph readable by anyone else is a map of
 *      who is interested in whom, on a site with children on it, and it cannot be
 *      un-published once it has been read.
 *   2. THERE IS NO FOLLOWER COUNT, ANYWHERE — not in the SQL, not in the client. A public
 *      count reads "nobody is here" on every card of a young site, and the moment it
 *      exists, being followed becomes a thing to perform.
 *   3. NOBODY IS NOTIFIED, AND THE UI SAYS SO. "They aren't told" is the entire difference
 *      between a bookmark and a friend request.
 *   4. NOTHING IS DRAWN BEFORE THE MIGRATION IS RUN, and the probe cannot write a row.
 *
 *   node tests/follows.check.js
 * ═══════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PROFILE = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-profile.js'), 'utf8');
const CARD = fs.readFileSync(path.join(ROOT, 'assets/js/pjcc-gift.js'), 'utf8');
const DOC = fs.readFileSync(path.join(ROOT, 'docs/follows-setup.md'), 'utf8');
const DOSSIER = fs.readFileSync(path.join(ROOT, 'dossier.md'), 'utf8');
const SCSS = fs.readFileSync(path.join(ROOT, '_sass/_pjcc-14-profile.scss'), 'utf8');

/* ⚠ NEGATIVE ASSERTIONS READ THE PROGRAM, NOT THE PROSE. This repo explains itself at
   length and several of those explanations are ABOUT the absent things below — a check
   for "no follower count" that trips on the paragraph promising there is no follower
   count is a check that gets deleted rather than fixed. (gifts.check.js learned this the
   expensive way, in both directions.) */
const code = (src) => src
  .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:])\/\/.*$/gm, '$1');
// the SQL block, with its own `--` commentary removed
const sql = (DOC.match(/```sql([\s\S]*?)```/) || ['', ''])[1].replace(/^\s*--.*$/gm, ' ');

let pass = 0, fail = 0;
const check = (n, c, d) => {
  if (c) { pass++; console.log('  ✓ ' + n + (d !== undefined ? '   ' + d : '')); }
  else { fail++; console.log('  ✗ ' + n + (d !== undefined ? '   ' + d : '')); }
};

console.log('\n── FOLLOW ────────────────────────────────────────────────\n');

/* ── 1. THE LIST IS PRIVATE ──────────────────────────────────────────────────────── */
check('the follow list is readable by the FOLLOWER and nobody else',
  /create policy "follows read own" on follows for select\s*\n\s*to authenticated using \(auth\.uid\(\) = follower_id\);/.test(sql),
  'not the person followed, and not the public');
check('…and that is the ONLY select policy on the table',
  (sql.match(/create policy[^;]*on follows for select/g) || []).length === 1,
  'a second, looser one would silently win');
check('the table has NO insert/update/delete policy — only the definer function writes',
  !/on follows for (insert|update|delete)/.test(sql),
  'same shape as credit_gifts');
check('following twice is impossible in the STORAGE, not in a check somebody can forget',
  /primary key \(follower_id, followee_id\)/.test(sql) && /on conflict do nothing/.test(sql));

/* ── 2. NO FOLLOWER COUNT EXISTS TO BE SHOWN ─────────────────────────────────────── */
/* ⚠⚠ THE ABSENCE THAT MATTERS MOST, because adding one is a two-line change that would
   look like a feature. The SQL must expose no way to count who follows a given person:
   every count in here is over `follower_id = me` (YOUR list, for the cap). A count keyed
   on `followee_id` is the shape that leaks it. */
check('no SQL function can count the followers OF somebody',
  !/count\([^)]*\)[\s\S]{0,80}followee_id/.test(sql) &&
  /select count\(\*\) into n from follows where follower_id = me;/.test(sql),
  'the only count is over your own list, for the cap');
check('…and the client never asks for one',
  !/follower[Cc]ount|followerCount|followers\b/.test(code(PROFILE) + code(CARD)),
  'there is no accessor to misuse later');
check('…and no card or panel renders a number beside the button',
  !/followers/i.test(code(CARD)) && !/followers/i.test(code(DOSSIER)));

/* ── 3. NOBODY IS NOTIFIED, AND THE PLAYER IS TOLD THAT ──────────────────────────── */
/* ⚠⚠ SCOPED TO THE INITIAL RENDER, and that correction came out of a mutation test. The
   first version of this check just searched the whole file for the phrase — so deleting it
   from `followBlock` (the only place a player reads it BEFORE deciding to follow) left the
   suite green, because the same words still appear in the click handler that repaints the
   note afterward. A reassurance you only see after you have acted is not a reassurance. */
const followBlockSrc = (CARD.match(/function followBlock\([\s\S]*?\n  \}/) || [''])[0];
check('the UI states that the other person is not told — before you press it',
  /aren.t told/.test(followBlockSrc),
  'the whole difference between a bookmark and a friend request');
check('…and it still says so after the state flips',
  (CARD.match(/aren.t told/g) || []).length >= 3, 'both toggle states carry it');
check('…and the style guard keeps that line from being tidied away',
  /\.op-fol-note \{/.test(SCSS));
check('the SQL sends nothing to the person followed',
  !/notif|insert into (?!follows)/i.test(sql), 'one insert, into follows, and that is all');

/* ── 4. INVISIBLE UNTIL MIGRATED, AND THE PROBE CANNOT WRITE ─────────────────────── */
check('the client PROBES for the function rather than assuming it',
  /PJCC\.followsEnabled/.test(PROFILE) && /rpc\('set_follow'/.test(PROFILE));
/* ⚠ THE PROBE MUST NOT BE ABLE TO CREATE A FOLLOW. An empty codename resolves to no
   target, and `p_on:false` is an UNFOLLOW — two independent reasons it writes nothing. */
check('…and it probes with an UNFOLLOW of nobody, so it cannot write a row',
  /rpc\('set_follow', \{ p_codename: '', p_on: false \}\)/.test(PROFILE) &&
  /if target is null then[\s\S]{0,90}'no_such_player'/.test(sql));
check('…cached per session, and a signed-out visitor never probes',
  /pjcc\.follows\.on/.test(PROFILE) &&
  /followProbe = \(async function \(\) \{\s*\n\s*if \(!sb \|\| !PJCC\.currentUser\(\)\) return false;/.test(PROFILE));
check('the button is absent unless the probe said yes, and never on your own card',
  /followsOn && !mine \? followBlock/.test(CARD) && /if \(followsOn && !mine\) wireFollow/.test(CARD));
check('the dossier panel is absent when the feature is off OR the list is empty',
  /if \(followsOn && follows\.length\)/.test(DOSSIER),
  'a heading over "nobody yet" is the Hall of Fame mistake again');

/* ── 5. THE THINGS THAT MAKE IT BEHAVE ───────────────────────────────────────────── */
check('follows go BY CODENAME — no page exposes a user id',
  /set_follow\(p_codename text, p_on boolean\)/.test(sql) &&
  !/followee_id|follower_id/.test(code(CARD) + code(DOSSIER)),
  'the rule gift_credits set');
check('you cannot follow yourself, and the server says so',
  /if target = me then[\s\S]{0,90}'self'/.test(sql));
check('every refusal the SQL can return has a sentence written for it',
  (() => {
    const reasons = [...sql.matchAll(/'reason',\s*'(\w+)'/g)].map(m => m[1]);
    const said = (CARD.match(/var FOLLOW_SAID = \{([\s\S]*?)\};/) || [])[1] || '';
    const keys = (said.match(/^\s*(\w+):/gm) || []).map(s => s.trim().replace(':', ''));
    const missing = [...new Set(reasons)].filter(r => keys.indexOf(r) < 0);
    check._missing = missing;
    return missing.length === 0;
  })(),
  (check._missing && check._missing.length) ? 'no wording for: ' + check._missing.join(', ') : 'all covered');
/* ⚠ THE CAP LIVES IN ONE FILE. Same rule as the gift's two rails: Nate edits the number in
   Supabase, nothing in the client breaks, and a stale copy in a comment out here would be
   a confident lie that outlives everyone who remembers the edit. */
check('the follow cap is written down in the SQL and NOWHERE in the client',
  /n >= 500/.test(sql) && !/\b500\b/.test(CARD) && !/follow[\s\S]{0,200}\b500\b/i.test(code(PROFILE)),
  'changing it is an edit in Supabase and nothing to redeploy');
/* ⚠⚠ PAINT FROM THE SERVER'S ANSWER, NEVER FROM THE INTENT. The same rule as the gift
   balance: if the server refused, the star must not move. Optimistic UI here would show a
   filled star for a follow that a full list had just rejected. */
check('the button repaints from the SERVER reply, not from what was clicked',
  /var on = !!r\.following;/.test(CARD) && /paint from the SERVER's answer, never from `want`/.test(CARD));
check('…and a double-tap cannot fire twice',
  /b\.disabled = true;/.test(CARD));
check('the toggle carries its state for a screen reader',
  /aria-pressed="' \+ \(on \? 'true' : 'false'\)/.test(CARD) &&
  /getAttribute\('aria-pressed'\) !== 'true'/.test(CARD),
  'and the visible label says Following, not Unfollow');
check('the follow list costs ONE round trip per session, not one per card',
  /var followCache = null;/.test(PROFILE) && /if \(followCache && !force\) return followCache;/.test(PROFILE));
check('…and "not loaded yet" is distinguishable from "following nobody"',
  /if \(!followCache\) return false;/.test(PROFILE),
  'null vs [] — otherwise the button guesses');

/* ── 6. IT IS REACHABLE, AND SO IS WHAT IT UNLOCKS ───────────────────────────────── */
check('the follow control is a real 44px button',
  /\.op-fol \{/.test(SCSS) && /min-height: 44px;/.test((SCSS.match(/\.op-fol \{[\s\S]*?\n\}/) || [''])[0]));
check('the dossier loads the card module its follow panel opens',
  /pjcc-gift\.js/.test(code(DOSSIER)), 'or every row is a button that does nothing');
check('…and the pet art the card needs, before it',
  code(DOSSIER).indexOf('pjcc-pet-art.js') < code(DOSSIER).indexOf('pjcc-gift.js') &&
  code(DOSSIER).indexOf('pjcc-pet-art.js') > -1);
check('each followed player re-opens the SHARED card, so no second bio can drift',
  /PJCCGift\.open\(b\.getAttribute\('data-card'\)\)/.test(DOSSIER));

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
