create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  template_key text not null default 'custom',
  day_mode text not null default 'ordinary' check (day_mode in ('ordinary', 'matchday', 'any')),
  phase text not null default 'daily' check (phase in ('daily', 'pre_match', 'post_match')),
  cadence text not null default 'daily' check (cadence in ('daily', 'weekly', 'monthly')),
  response_type text not null default 'single_choice' check (response_type in ('single_choice', 'multiple_choice', 'text', 'scale', 'score', 'action')),
  verification_type text not null default 'participation' check (verification_type in ('participation', 'correct_answer', 'match_result', 'manual')),
  skill_key text references public.skill_definitions (key) on delete set null,
  match_id uuid references public.matches (id) on delete set null,
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb,
  linked_route text,
  reward_coins integer not null default 0 check (reward_coins between 0 and 10000),
  reward_xp integer not null default 0 check (reward_xp between 0 and 1000),
  target_count integer not null default 1 check (target_count between 1 and 1000),
  opens_at timestamptz,
  closes_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  answer jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('submitted', 'pending', 'verified', 'rejected')),
  was_correct boolean,
  coins_awarded integer not null default 0,
  xp_awarded integer not null default 0,
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  unique (challenge_id, user_id)
);

create table if not exists public.challenge_wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  coins integer not null default 0 check (coins >= 0),
  current_streak integer not null default 0 check (current_streak between 0 and 7),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_claimed_date date,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.challenge_daily_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  claim_date date not null,
  streak_day integer not null check (streak_day between 1 and 7),
  coins_awarded integer not null check (coins_awarded >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, claim_date)
);

create index if not exists challenges_schedule_idx on public.challenges (status, day_mode, phase, opens_at, closes_at);
create index if not exists challenge_submissions_user_idx on public.challenge_submissions (user_id, submitted_at desc);
create index if not exists challenge_submissions_challenge_idx on public.challenge_submissions (challenge_id, status);

drop trigger if exists challenges_set_updated_at on public.challenges;
create trigger challenges_set_updated_at before update on public.challenges
for each row execute function public.set_updated_at();

drop trigger if exists challenge_wallets_set_updated_at on public.challenge_wallets;
create trigger challenge_wallets_set_updated_at before update on public.challenge_wallets
for each row execute function public.set_updated_at();

alter table public.challenges enable row level security;
alter table public.challenge_submissions enable row level security;
alter table public.challenge_wallets enable row level security;
alter table public.challenge_daily_claims enable row level security;

drop policy if exists "published challenges public read" on public.challenges;
create policy "published challenges public read" on public.challenges for select using (status = 'published' or public.is_admin_user());
drop policy if exists "admins manage challenges" on public.challenges;
create policy "admins manage challenges" on public.challenges for all using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "users read own challenge submissions" on public.challenge_submissions;
create policy "users read own challenge submissions" on public.challenge_submissions for select using (auth.uid() = user_id or public.is_admin_user());
drop policy if exists "admins manage challenge submissions" on public.challenge_submissions;
create policy "admins manage challenge submissions" on public.challenge_submissions for all using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "users read own challenge wallet" on public.challenge_wallets;
create policy "users read own challenge wallet" on public.challenge_wallets for select using (auth.uid() = user_id or public.is_admin_user());
drop policy if exists "admins manage challenge wallets" on public.challenge_wallets;
create policy "admins manage challenge wallets" on public.challenge_wallets for all using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "users read own daily claims" on public.challenge_daily_claims;
create policy "users read own daily claims" on public.challenge_daily_claims for select using (auth.uid() = user_id or public.is_admin_user());
drop policy if exists "admins manage daily claims" on public.challenge_daily_claims;
create policy "admins manage daily claims" on public.challenge_daily_claims for all using (public.is_admin_user()) with check (public.is_admin_user());

create or replace function public.claim_daily_challenge_bonus()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid := auth.uid();
  today_moscow date := timezone('Europe/Moscow', now())::date;
  wallet public.challenge_wallets%rowtype;
  next_streak integer;
  reward integer;
begin
  if target_user is null then raise exception 'Authentication required'; end if;
  insert into public.challenge_wallets (user_id) values (target_user) on conflict (user_id) do nothing;
  select * into wallet from public.challenge_wallets where user_id = target_user for update;

  if wallet.last_claimed_date = today_moscow then
    return jsonb_build_object('claimed', false, 'reward', 0, 'coins', wallet.coins, 'streak', wallet.current_streak);
  end if;

  if wallet.last_claimed_date = today_moscow - 1 then
    next_streak := case when wallet.current_streak >= 7 then 1 else wallet.current_streak + 1 end;
  elsif wallet.current_streak > 1 then
    next_streak := wallet.current_streak - 1;
  else
    next_streak := 1;
  end if;

  reward := (array[10,15,20,25,30,40,50])[next_streak];
  insert into public.challenge_daily_claims (user_id, claim_date, streak_day, coins_awarded)
  values (target_user, today_moscow, next_streak, reward)
  on conflict (user_id, claim_date) do nothing;

  update public.challenge_wallets
  set coins = coins + reward,
      current_streak = next_streak,
      longest_streak = greatest(longest_streak, next_streak),
      last_claimed_date = today_moscow,
      updated_at = timezone('utc', now())
  where user_id = target_user
  returning * into wallet;

  return jsonb_build_object('claimed', true, 'reward', reward, 'coins', wallet.coins, 'streak', wallet.current_streak, 'longest_streak', wallet.longest_streak, 'last_claimed_date', wallet.last_claimed_date);
end;
$$;

grant execute on function public.claim_daily_challenge_bonus() to authenticated;

create or replace function public.submit_challenge_answer(target_challenge uuid, submitted_answer jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid := auth.uid();
  challenge_row public.challenges%rowtype;
  submission_row public.challenge_submissions%rowtype;
  answer_correct boolean := null;
  next_status text := 'pending';
  awarded_xp integer := 0;
begin
  if target_user is null then raise exception 'Authentication required'; end if;
  select * into challenge_row from public.challenges where id = target_challenge and status = 'published';
  if challenge_row.id is null then raise exception 'Challenge unavailable'; end if;
  if challenge_row.opens_at is not null and challenge_row.opens_at > now() then raise exception 'Challenge has not started'; end if;
  if challenge_row.closes_at is not null and challenge_row.closes_at < now() then raise exception 'Challenge is closed'; end if;

  if challenge_row.verification_type = 'participation' then
    next_status := 'verified';
  elsif challenge_row.verification_type = 'correct_answer' then
    answer_correct := submitted_answer = challenge_row.correct_answer;
    next_status := 'verified';
    awarded_xp := case when answer_correct then challenge_row.reward_xp else 0 end;
  end if;

  insert into public.challenge_submissions (challenge_id, user_id, answer, status, was_correct, coins_awarded, xp_awarded, reviewed_at)
  values (target_challenge, target_user, submitted_answer, next_status, answer_correct, challenge_row.reward_coins, awarded_xp, case when next_status = 'verified' then timezone('utc', now()) else null end)
  on conflict (challenge_id, user_id) do nothing
  returning * into submission_row;

  if submission_row.id is null then raise exception 'Challenge already completed'; end if;
  insert into public.challenge_wallets (user_id, coins) values (target_user, challenge_row.reward_coins)
  on conflict (user_id) do update set coins = public.challenge_wallets.coins + excluded.coins, updated_at = timezone('utc', now());

  if awarded_xp > 0 and challenge_row.skill_key is not null then
    insert into public.xp_events (user_id, skill_key, amount, attempted, was_correct, source_type, source_id, description)
    values (target_user, challenge_row.skill_key, awarded_xp, true, true, 'challenge', target_challenge::text, challenge_row.title)
    on conflict (user_id, skill_key, source_type, source_id) do nothing;
    perform public.refresh_user_skill_progress(target_user);
  end if;

  return jsonb_build_object('id', submission_row.id, 'status', next_status, 'was_correct', answer_correct, 'coins_awarded', challenge_row.reward_coins, 'xp_awarded', awarded_xp);
end;
$$;

grant execute on function public.submit_challenge_answer(uuid, jsonb) to authenticated;

create or replace function public.resolve_challenge_submission(target_submission uuid, approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  submission_row public.challenge_submissions%rowtype;
  challenge_row public.challenges%rowtype;
begin
  if not public.is_admin_user() then raise exception 'Admin access required'; end if;
  select * into submission_row from public.challenge_submissions where id = target_submission for update;
  if submission_row.id is null or submission_row.status <> 'pending' then return; end if;
  select * into challenge_row from public.challenges where id = submission_row.challenge_id;

  update public.challenge_submissions
  set status = case when approve then 'verified' else 'rejected' end,
      was_correct = case when approve then true else false end,
      xp_awarded = case when approve then challenge_row.reward_xp else 0 end,
      reviewed_at = timezone('utc', now())
  where id = target_submission;

  if approve and challenge_row.reward_xp > 0 and challenge_row.skill_key is not null then
    insert into public.xp_events (user_id, skill_key, amount, attempted, was_correct, source_type, source_id, description)
    values (submission_row.user_id, challenge_row.skill_key, challenge_row.reward_xp, true, true, 'challenge', challenge_row.id::text, challenge_row.title)
    on conflict (user_id, skill_key, source_type, source_id) do nothing;
    perform public.refresh_user_skill_progress(submission_row.user_id);
  end if;
end;
$$;

grant execute on function public.resolve_challenge_submission(uuid, boolean) to authenticated;

create or replace function public.get_challenge_consensus(target_challenge uuid)
returns table(option_id text, votes bigint)
language sql
security definer
set search_path = public
as $$
  select answer->>'value' as option_id, count(*) as votes
  from public.challenge_submissions
  where challenge_id = target_challenge and answer ? 'value'
  group by answer->>'value'
  order by count(*) desc;
$$;

grant execute on function public.get_challenge_consensus(uuid) to anon, authenticated;

insert into public.challenges (title, description, template_key, day_mode, phase, cadence, response_type, verification_type, options, correct_answer, reward_coins, reward_xp, skill_key, target_count, status, featured)
select seed.* from (values
  ('Какую позицию Барсе нужно усилить первой?', 'Выберите самое важное усиление для следующего этапа сезона.', 'daily-opinion', 'ordinary', 'daily', 'daily', 'single_choice', 'participation', '[{"id":"cb","label":"Центральный защитник"},{"id":"st","label":"Центральный нападающий"},{"id":"lw","label":"Левый вингер"},{"id":"none","label":"Состав уже укомплектован"}]'::jsonb, null::jsonb, 15, 0, null::text, 1, 'published', true),
  ('Кого стоит подписать в линию атаки?', 'Выберите игрока, который лучше всего подходит текущей Барсе.', 'transfer-debate', 'ordinary', 'daily', 'daily', 'single_choice', 'participation', '[{"id":"alvarez","label":"Хулиан Альварес"},{"id":"lautaro","label":"Лаутаро Мартинес"},{"id":"gyokeres","label":"Виктор Гёкереш"},{"id":"academy","label":"Довериться Ла Масии"}]'::jsonb, null::jsonb, 20, 0, null::text, 1, 'published', false),
  ('Угадай молодого рекордсмена', 'Кто был самым молодым дебютантом Барсы в Ла Лиге?', 'knowledge-quiz', 'ordinary', 'daily', 'daily', 'single_choice', 'correct_answer', '[{"id":"lamine","label":"Ламин Ямаль"},{"id":"bojan","label":"Боян Кркич"},{"id":"gavi","label":"Гави"},{"id":"messi","label":"Лионель Месси"}]'::jsonb, '{"value":"lamine"}'::jsonb, 15, 10, 'knowledge', 1, 'published', false),
  ('Прогноз точного счёта', 'Укажите счёт до стартового свистка ближайшего матча.', 'match-score', 'matchday', 'pre_match', 'daily', 'score', 'match_result', '[]'::jsonb, null::jsonb, 25, 40, 'score', 1, 'published', true),
  ('Соберите стартовый состав', 'Выберите стартовые одиннадцать до начала матча.', 'starting-lineup', 'matchday', 'pre_match', 'daily', 'action', 'match_result', '[]'::jsonb, null::jsonb, 25, 35, 'tactics', 1, 'published', false),
  ('Оценки после матча', 'Составьте рейтинг всех сыгравших футболистов.', 'post-ratings', 'matchday', 'post_match', 'daily', 'action', 'participation', '[]'::jsonb, null::jsonb, 30, 0, null::text, 1, 'published', true),
  ('Недельная серия', 'Выполните пять ежедневных заданий за неделю.', 'weekly-run', 'any', 'daily', 'weekly', 'action', 'manual', '[]'::jsonb, null::jsonb, 150, 30, 'knowledge', 5, 'published', true),
  ('Месяц кулес', 'Выполните двадцать ежедневных заданий за месяц.', 'monthly-campaign', 'any', 'daily', 'monthly', 'action', 'manual', '[]'::jsonb, null::jsonb, 500, 75, 'knowledge', 20, 'published', true)
) as seed(title,description,template_key,day_mode,phase,cadence,response_type,verification_type,options,correct_answer,reward_coins,reward_xp,skill_key,target_count,status,featured)
where not exists (select 1 from public.challenges existing where existing.template_key = seed.template_key and existing.title = seed.title);
