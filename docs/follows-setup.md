# Follow a player — setup (Nate-gated, ~2 minutes)

Nate, 2026-08-19: *"when you click on a user, [be able to] add them as a friend and be able
to see a limited bio of the user."* → **"Follow is good."**

**Until you run this, the Follow button does not exist** — not broken, absent. The client
probes for the function once per session and only draws the button if it answers. Nothing on
any page changes before you paste this in. Same posture as `credit-gifts-setup.md`.

## What Follow is here — read this before changing it

**A follow is a bookmark, not a relationship.** That is a deliberate design position and the
SQL below enforces it:

- **Your follow list is visible to you and to nobody else.** The `select` policy is
  `auth.uid() = follower_id` — full stop. The person you follow cannot see that you did.
- **There are no follower counts anywhere**, and the SQL has no function that would return
  one. On a site this young a public count is a number that says "nobody is here" on every
  card; and once counts exist, being followed becomes a thing to perform. The
  count-*up* decision on the first-100,000 bar was the same argument.
- **Nothing is notified.** Following someone sends them nothing.

That combination means Follow adds **zero moderation surface**: no requests to accept, no
way to be told you were rejected, no leaderboard of popularity, and no free-text anywhere —
the same structural child-safety property that makes the four preset emotes the whole of
chat and a gift a bare number.

If you later want a mutual "friend", it is built on top of this (a follow both ways), not
instead of it. Loosening is a gift; tightening is a takeaway.

## Run it

Supabase → **SQL Editor** → New query → paste the whole block → **Run**. Idempotent; running
it twice is harmless.

```sql
-- ════════════════════════════════════════════════════════════════════════════════
--  FOLLOWS — one player keeps a private list of players they want to find again
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. THE TABLE ------------------------------------------------------------------
-- The pair IS the primary key, so following twice is impossible at the storage
-- layer rather than by a check somebody can forget to write.
create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (follower_id, followee_id)
);
create index if not exists follows_follower_idx on follows (follower_id, created_at desc);

alter table follows enable row level security;

-- ⚠ READABLE BY THE FOLLOWER ONLY. Not by the person followed, and not publicly.
--   A readable follow graph on a site whose audience includes children is a map of
--   who is interested in whom, and it can never be un-published once it has been read.
drop policy if exists "follows read own" on follows;
create policy "follows read own" on follows for select
  to authenticated using (auth.uid() = follower_id);

-- ⚠ NO insert / update / delete policy AT ALL. The function below is the only writer,
--   exactly as with credit_gifts.

-- 2. FOLLOW / UNFOLLOW -----------------------------------------------------------
-- Returns jsonb {ok:bool, ...} and NEVER raises for an ordinary refusal.
--
-- ⚠ BY CODENAME, NOT BY ID — `profiles.codename` is already `unique not null`, and it
--   means no page ever has to put a user's uuid in its HTML. (`gift_credits` and
--   `redeem_referral` set this pattern; keep it.)
--
-- ⚠ ONE FUNCTION FOR BOTH DIRECTIONS, and that is what makes the client's probe safe:
--   calling it with an empty codename and p_on = false answers `no_such_player` without
--   writing anything, so "does this feature exist yet" costs nothing and changes nothing.
create or replace function set_follow(p_codename text, p_on boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me     uuid := auth.uid();
  target uuid;
  n      int;
begin
  if me is null then
    return jsonb_build_object('ok', false, 'reason', 'signed_out');
  end if;

  select id into target from profiles where codename = p_codename;
  if target is null then
    return jsonb_build_object('ok', false, 'reason', 'no_such_player');
  end if;

  if target = me then
    return jsonb_build_object('ok', false, 'reason', 'self');
  end if;

  if p_on then
    -- ⚠ THE CAP IS COUNTED, NOT STORED, so a client that forgets to ask still hits it.
    --   It is not an anti-abuse rail so much as a shape: a list you can actually read.
    --   This is the ONLY place the number is written down — changing it is an edit here
    --   and nothing to redeploy.
    select count(*) into n from follows where follower_id = me;
    if n >= 500 then
      return jsonb_build_object('ok', false, 'reason', 'follow_cap');
    end if;
    insert into follows (follower_id, followee_id) values (me, target)
      on conflict do nothing;                     -- following twice is not an error
  else
    delete from follows where follower_id = me and followee_id = target;
  end if;

  return jsonb_build_object('ok', true, 'following', p_on);
end;
$$;

revoke all on function set_follow(text, boolean) from public;
grant execute on function set_follow(text, boolean) to authenticated;

-- 3. THE LIST --------------------------------------------------------------------
-- Everything the "Players you follow" panel needs, in ONE round trip.
--
-- ⚠ WHY A FUNCTION AND NOT A JOINED SELECT. PostgREST can embed `profiles` from
--   `follows`, but the embed has to be disambiguated by CONSTRAINT NAME because there
--   are two foreign keys to the same table — and a constraint name is exactly the sort
--   of thing that differs between a project built by hand and one built by this script.
--   A function has one name and one shape, forever.
--
-- ⚠ IT RETURNS ONLY WHAT A CARD ALREADY SHOWS (codename + companion). No credits, no
--   rating, no ids. The card itself re-reads the public tables for the rest.
create or replace function list_following()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(x order by x->>'since' desc), '[]'::jsonb)
  from (
    select jsonb_build_object(
             'codename',  p.codename,
             'companion', p.companion,
             'since',     f.created_at
           ) as x
    from follows f
    join profiles p on p.id = f.followee_id
    where f.follower_id = auth.uid()
  ) t;
$$;

revoke all on function list_following() from public;
grant execute on function list_following() to authenticated;
```

## Check it worked

**This is a smoke test, not part of the setup.** Nothing above depends on it and nothing
below needs it — the migration is already done. Run it in a **New query**; pasting it under
the block above just re-runs the whole migration (harmless, it is idempotent) and buries the
answer.

```sql
select set_follow('', false) as probe, list_following() as following;
```

One statement on purpose: the SQL Editor shows the result of the **last** statement it ran, so
two `select`s on two lines would quietly hide the first answer. This returns both in one row.

**Expect:**

| probe | following |
|---|---|
| `{"ok": false, "reason": "signed_out"}` | `[]` |

⚠ **`signed_out` IS THE CORRECT ANSWER HERE, and an earlier version of this file wrongly
predicted `no_such_player`.** Both functions read `auth.uid()`, and **in the SQL Editor there
is no logged-in user** — the editor is not a browser session, so `auth.uid()` is null and
`set_follow` returns on its very first guard. `no_such_player` is what the *browser* gets from
the same call once somebody is signed in, which is why the client probe treats **any** reply as
success: `on = !r.error` — answering at all is the signal, whatever the reason says.

⭐ So this test proves exactly what it needs to: **both functions exist, execute, and refuse
cleanly instead of raising.** If either name were missing you would get
`function set_follow(unknown, boolean) does not exist` instead of a row.

Then reload any page with a leaderboard **in a fresh tab** (the probe is cached per
session, same as gifts), open a player's card, and a **Follow** button is on it.

## What it touches

| | |
|---|---|
| New table | `follows` |
| New functions | `set_follow(text, boolean)` · `list_following()` |
| Existing tables changed | **none** |
| Existing policies changed | **none** |

Nothing here reads or writes `credits`, so it cannot interact with the gift ledger.
