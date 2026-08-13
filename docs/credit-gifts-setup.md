# Credit gifts — setup (Nate-gated, ~2 minutes)

Nate, 2026-08-13: *"how about a mechanism where a user can click on another user's name, and
they can give them 1, 5, 10, 25, or 50 credits? That's the only thing they can interact with
a specific user on for now."*

**Until you run this, the feature is invisible** — not broken, invisible. The client probes for
the function once per session and only draws the gift affordance if it answers. Nothing on any
page changes before you paste this in.

## Run it

Supabase → **SQL Editor** → New query → paste the whole block below → **Run**. It is
idempotent; running it twice is harmless.

```sql
-- ════════════════════════════════════════════════════════════════════════════════
--  CREDIT GIFTS — one operative hands another a few credits
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. THE LEDGER ------------------------------------------------------------------
-- Every gift is recorded. Two reasons, and the second is the load-bearing one:
--   · a recipient can be shown who paid for their good day
--   · the daily cap below is COUNTED from this table, so the cap cannot be bypassed
--     by a client that simply forgets to ask
create table if not exists credit_gifts (
  id         bigint generated always as identity primary key,
  from_id    uuid not null references profiles(id) on delete cascade,
  to_id      uuid not null references profiles(id) on delete cascade,
  amount     int  not null check (amount > 0),
  created_at timestamptz default now()
);
create index if not exists credit_gifts_from_idx on credit_gifts (from_id, created_at desc);
create index if not exists credit_gifts_to_idx   on credit_gifts (to_id,   created_at desc);

alter table credit_gifts enable row level security;
-- Readable only by the two people involved. NO insert/update/delete policy at all:
-- the only way a row appears is through the function below, which runs as definer.
drop policy if exists "gifts read" on credit_gifts;
create policy "gifts read" on credit_gifts for select
  to authenticated using (auth.uid() = from_id or auth.uid() = to_id);

-- 2. THE FUNCTION ----------------------------------------------------------------
-- Returns jsonb {ok:bool, reason:text, ...} and NEVER raises for an ordinary refusal,
-- so the client can show a plain sentence instead of a stack trace.
--
-- ⚠ BY CODENAME, NOT BY ID. `profiles.codename` is already `unique not null`, the
--   client already has the name it just rendered, and looking it up in here means no
--   page ever has to put a user's uuid in its HTML. (`redeem_referral` set the pattern.)
create or replace function gift_credits(p_to_codename text, p_amount int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me          uuid := auth.uid();
  target      uuid;
  left_after  int;
  given_today int;
  got_today   int;
  give_left   int;
  hold_left   int;
  v_send      int;
  v_kept      int;
  v_limit     text := null;
begin
  if me is null then
    return jsonb_build_object('ok', false, 'reason', 'signed_out');
  end if;

  -- ⚠ THE LADDER IS ENFORCED HERE, NOT IN THE BROWSER. The five amounts are the whole
  --   product decision; a client-side check is a suggestion.
  if p_amount not in (1, 5, 10, 25, 50) then
    return jsonb_build_object('ok', false, 'reason', 'bad_amount');
  end if;

  select id into target from profiles where codename = p_to_codename;
  if target is null then
    return jsonb_build_object('ok', false, 'reason', 'no_such_operative');
  end if;
  if target = me then
    return jsonb_build_object('ok', false, 'reason', 'self');
  end if;

  -- 3. THE TWO DAILY RAILS -------------------------------------------------------
  -- Credits are never CREATED here, only moved — so the abuse this guards is not
  -- inflation, it is a pile of throwaway accounts funnelling into one main.
  --
  -- ⭐⭐ WHICH IS WHY THE RECEIVING RAIL IS THE TIGHTER ONE. Nate, 2026-08-13:
  --    *"you can give out as much as you want, but you can only receive 50 per day."*
  --    Capping the giver only slows one mule down; capping the RECEIVER puts a hard
  --    ceiling on what any single account can be fed no matter how many mules point at
  --    it. Generosity is cheap to allow, and it is the only half an honest player feels.
  --
  --      GIVE  75 / 24h  ·  a rate limit on one account's outbound
  --      HOLD  50 / 24h  ·  the real defense — the most anyone can be handed in a day
  --
  -- ⚠ Both are counted off this ledger rather than stored on the profile, so a client
  --   that forgets to ask cannot skip them, and neither can a second tab.
  -- ⭐ Deliberately miser: loosening a cap later is a gift, tightening one is a takeaway.
  select coalesce(sum(amount), 0) into given_today
    from credit_gifts
   where from_id = me and created_at > now() - interval '24 hours';

  select coalesce(sum(amount), 0) into got_today
    from credit_gifts
   where to_id = target and created_at > now() - interval '24 hours';

  give_left := greatest(75 - given_today, 0);
  hold_left := greatest(50 - got_today, 0);

  if give_left <= 0 then
    return jsonb_build_object('ok', false, 'reason', 'daily_cap', 'cap', 75);
  end if;
  if hold_left <= 0 then
    -- ⚠ NO NUMBERS COME BACK WITH THIS ONE. How much somebody else has been given today
    --   is their business; a caller that could read it back could probe any operative's
    --   day one gift at a time. The giver learns only that the door is shut.
    return jsonb_build_object('ok', false, 'reason', 'recipient_full');
  end if;

  -- ⭐ THE PARTIAL FILL. Nate: *"the giver will get a notification that the recipient has
  --   received as much as they can hold for the day and the difference remains with the
  --   original giver."* So a gift that runs into a rail is SHORTENED, never refused: the
  --   five amounts are fixed buttons, and refusing outright would strand credits that no
  --   combination of 1/5/10/25/50 could spend. `v_kept` is what never left the giver —
  --   it is not held anywhere or owed later, it simply was not sent.
  v_send := least(p_amount, give_left, hold_left);
  v_kept := p_amount - v_send;
  if v_kept > 0 then
    v_limit := case when hold_left <= give_left then 'them' else 'you' end;
  end if;

  -- 4. THE SPEND -----------------------------------------------------------------
  -- ⚠⚠ THE BALANCE CHECK IS IN THE `where`, NOT AN `if` ABOVE IT. Reading the balance
  --    and then updating it is two statements with a gap between them, and two tabs in
  --    that gap can each pass a check the other invalidates. Here the row only matches
  --    if it can afford the gift, so the check and the spend are the same atomic write —
  --    and `returning ... into` coming back NULL is how we learn it could not.
  -- ⚠ It spends `v_send`, the shortened amount — never `p_amount`, which is only ever
  --   the ASK. Charging the ask and delivering the remainder is how a gift silently eats
  --   credits, and it would look exactly like a rounding bug.
  update profiles
     set credits = credits - v_send, updated_at = now()
   where id = me and credits >= v_send
  returning credits into left_after;

  if left_after is null then
    return jsonb_build_object('ok', false, 'reason', 'not_enough');
  end if;

  update profiles set credits = credits + v_send, updated_at = now() where id = target;
  insert into credit_gifts (from_id, to_id, amount) values (me, target, v_send);

  return jsonb_build_object('ok', true, 'amount', v_send, 'requested', p_amount,
                            'kept', v_kept, 'limit', v_limit,
                            'to', p_to_codename, 'balance', left_after);
end;
$$;

revoke all on function gift_credits(text, int) from public;
grant execute on function gift_credits(text, int) to authenticated;
```

## What the client does with it

- **`PJCC.giftsEnabled()`** probes once per session by calling the function with an amount
  the ladder does not allow. If it answers `{ok:false, reason:'bad_amount'}` the feature
  exists and the UI appears; if the call errors, the function is not there and **no gift
  affordance is ever drawn**. Nothing has to be switched on by hand.
- **`PJCC.giftCredits(codename, amount)`** resolves `{ok:…}` and never throws, so a refusal
  is a sentence rather than a crash. Same rule as `reportPuzzle()`.

## The two caps

|  | limit / 24h | what it is for |
|---|---|---|
| **give** | 75 | a rate limit on one account's outbound |
| **hold** | 50 | the real defense — the ceiling on what any one account can be *fed* |

Capping the giver only slows one throwaway account down. Capping the **receiver** puts a hard
ceiling on the whole funnel, however many throwaways point at it — so that is the tighter
number, and the generous half is the one an honest player actually feels.

Both are rolling 24-hour windows counted off `credit_gifts` itself, so a client that forgets
to ask cannot skip them.

## A gift that hits a rail is shortened, not refused

You ask for 50, they can only hold 20 today → **20 arrives, 30 never leaves you**, and the
sheet says so. The five amounts are fixed buttons, so refusing outright would strand credits
that no combination of 1/5/10/25/50 could spend. The reply carries `amount` (what moved),
`requested`, `kept`, and `limit` — `'them'` if their day filled up, `'you'` if yours did.

⚠ The kept credits are **not held anywhere and not owed later**. They simply were not sent.

## The refusals, and what each one says

| `reason` | when | what the player sees |
|---|---|---|
| `signed_out` | not signed in | the affordance is not drawn at all |
| `bad_amount` | not one of 1/5/10/25/50 | (only reachable by a hand-crafted call) |
| `no_such_operative` | codename gone | "That operative is no longer here." |
| `self` | your own row | your own row has no gift button |
| `not_enough` | balance too low | "You don't have that many credits." — unaffordable amounts are disabled |
| `daily_cap` | you have given 75 in 24h | "You've given all you can today. Back tomorrow." |
| `recipient_full` | they have received 50 in 24h | "They can't hold any more credits today." |

⚠ `recipient_full` returns **no numbers**. How much somebody else has been given today is
their business, and a reply that included it would let anyone probe an operative's day one
gift at a time.

## Changing the amounts or the caps

The five amounts are named in **two** places and both must agree: `p_amount not in (…)` in
the SQL above, and `GIFT_TIERS` in `assets/js/pjcc-profile.js`. The SQL is the one that
actually enforces; the client copy exists only to draw the buttons. `npm run test:gifts`
asserts the two lists match, so they cannot drift silently.

The two caps live in the SQL **only** — `75` and `50`, one line each. The client never knows
them; it reads back whatever the server did. So changing either is an edit here plus a re-run
of this block, and nothing needs redeploying.
