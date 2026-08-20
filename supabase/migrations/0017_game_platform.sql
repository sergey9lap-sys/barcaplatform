-- Barça Platform: progression, Fantasy, memberships, digital goods and VIP.
-- Safe to run after migrations 0001-0016. Existing users and game data are preserved.

create extension if not exists "pgcrypto";

create table if not exists public.seasons (
  id text primary key,
  title text not null,
  starts_at date not null,
  ends_at date not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.seasons (id, title, starts_at, ends_at, status)
values ('2026-27', 'Сезон 2026/27', '2026-08-01', '2027-06-30', 'active')
on conflict (id) do update set title = excluded.title, starts_at = excluded.starts_at, ends_at = excluded.ends_at;

create table if not exists public.skill_definitions (
  key text primary key,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.skill_definitions (key, title, description, sort_order)
values
  ('results', 'Результаты', 'Исходы матчей', 10),
  ('score', 'Точный счёт', 'Попадания в точный счёт', 20),
  ('tactics', 'Тактик', 'Стартовые составы и тактические решения', 30),
  ('transfers', 'Трансферы', 'Прогнозы входящих и исходящих сделок', 40),
  ('fantasy', 'Fantasy', 'Результаты Fantasy-пятёрки', 50),
  ('duels', 'Дуэлянт', 'Проверенные результаты дуэлей', 60),
  ('knowledge', 'Знания', 'Проверяемые футбольные челленджи', 70),
  ('analyst', 'Аналитик', 'Проверенные аналитические прогнозы', 80),
  ('scout', 'Скаут', 'Ла Масия и оценка развития игроков', 90)
on conflict (key) do update
set title = excluded.title, description = excluded.description, sort_order = excluded.sort_order;

create table if not exists public.user_skill_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_key text not null references public.skill_definitions (key) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  attempts_count integer not null default 0 check (attempts_count >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, skill_key)
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_key text not null references public.skill_definitions (key) on delete cascade,
  amount integer not null default 0 check (amount >= 0),
  attempted boolean not null default true,
  was_correct boolean not null default false,
  source_type text not null,
  source_id text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, skill_key, source_type, source_id)
);

create table if not exists public.fantasy_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  match_id text not null,
  season_id text not null default '2026-27' references public.seasons (id),
  selected_player_ids text[] not null default '{}',
  captain_id text,
  budget_limit integer not null default 50,
  budget_spent integer not null default 0 check (budget_spent >= 0),
  total_points integer not null default 0,
  locked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, match_id)
);

create table if not exists public.fantasy_leagues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  season_id text not null default '2026-27' references public.seasons (id),
  title text not null,
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8)),
  is_private boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fantasy_league_members (
  league_id uuid not null references public.fantasy_leagues (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (league_id, user_id)
);

create table if not exists public.user_memberships (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'cule', 'pro', 'socio')),
  status text not null default 'test' check (status in ('test', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_end timestamptz,
  provider text,
  provider_customer_id text,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.digital_products (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  price_rub integer not null check (price_rub >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.digital_products (id, title, description, category, price_rub)
values
  ('frame-garnet', 'Рамка Blaugrana', 'Живая сине-гранатовая окантовка аватара.', 'Профиль', 49),
  ('stickers-classic', 'Стикеры Culé Classic', '12 реакций для матчевых обсуждений.', 'Общение', 79),
  ('field-night', 'Поле Night Camp', 'Тёмная дизайнерская тема тактической доски.', 'Тактика', 99),
  ('poster-matchday', 'Matchday Poster', 'Премиальный шаблон состава и прогноза.', 'Экспорт', 149),
  ('goal-reaction', 'Goal Pulse', 'Микро-анимация празднования в профиле.', 'Анимация', 39),
  ('profile-1899', 'Тема 1899', 'Историческая тема карточки болельщика.', 'Профиль', 299)
on conflict (id) do update
set title = excluded.title, description = excluded.description, category = excluded.category, price_rub = excluded.price_rub;

create table if not exists public.digital_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id text not null references public.digital_products (id),
  status text not null default 'test' check (status in ('test', 'paid', 'refunded')),
  amount_rub integer not null default 0 check (amount_rub >= 0),
  provider_payment_id text,
  purchased_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

create table if not exists public.vip_council_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  option_id text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, question_id)
);

create table if not exists public.vip_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  event_type text not null default 'watchalong',
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'live', 'finished', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vip_event_registrations (
  event_id uuid not null references public.vip_events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (event_id, user_id)
);

create table if not exists public.profile_cosmetics (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  active_frame_id text references public.digital_products (id) on delete set null,
  active_field_theme_id text references public.digital_products (id) on delete set null,
  active_reaction_id text references public.digital_products (id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.bootstrap_game_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.user_skill_progress (user_id, skill_key)
  select auth.uid(), key from public.skill_definitions
  on conflict (user_id, skill_key) do nothing;

  insert into public.user_memberships (user_id, tier, status)
  values (auth.uid(), 'free', 'test')
  on conflict (user_id) do nothing;
end;
$$;

grant execute on function public.bootstrap_game_profile() to authenticated;

create or replace function public.refresh_user_skill_progress(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_skill_progress (user_id, skill_key, xp, correct_count, attempts_count, updated_at)
  select
    target_user,
    definitions.key,
    coalesce(sum(events.amount), 0)::integer,
    coalesce(count(*) filter (where events.was_correct), 0)::integer,
    coalesce(count(*) filter (where events.attempted), 0)::integer,
    timezone('utc', now())
  from public.skill_definitions definitions
  left join public.xp_events events
    on events.skill_key = definitions.key and events.user_id = target_user
  group by definitions.key
  on conflict (user_id, skill_key) do update
  set xp = excluded.xp,
      correct_count = excluded.correct_count,
      attempts_count = excluded.attempts_count,
      updated_at = excluded.updated_at;
end;
$$;

create or replace function public.refresh_prediction_mastery_for_match(target_match uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  match_row public.matches%rowtype;
  prediction_row public.predictions%rowtype;
  actual_result text;
  result_correct boolean;
  score_correct boolean;
begin
  select * into match_row from public.matches where id = target_match;
  if match_row.status <> 'finished' or match_row.home_score is null or match_row.away_score is null then
    return;
  end if;

  actual_result := case when match_row.home_score > match_row.away_score then 'home' when match_row.home_score < match_row.away_score then 'away' else 'draw' end;

  for prediction_row in select * from public.predictions where match_id = target_match loop
    result_correct := prediction_row.predicted_result = actual_result;
    score_correct := prediction_row.predicted_home_score is not null
      and prediction_row.predicted_away_score is not null
      and prediction_row.predicted_home_score = match_row.home_score
      and prediction_row.predicted_away_score = match_row.away_score;

    insert into public.xp_events (user_id, skill_key, amount, attempted, was_correct, source_type, source_id, description)
    values (prediction_row.user_id, 'results', case when result_correct then 20 else 0 end, true, result_correct, 'match_result', target_match::text, 'Прогноз исхода матча')
    on conflict (user_id, skill_key, source_type, source_id) do update
    set amount = excluded.amount, was_correct = excluded.was_correct, metadata = excluded.metadata;

    if prediction_row.predicted_home_score is not null and prediction_row.predicted_away_score is not null then
      insert into public.xp_events (user_id, skill_key, amount, attempted, was_correct, source_type, source_id, description)
      values (prediction_row.user_id, 'score', case when score_correct then 50 else 0 end, true, score_correct, 'exact_score', target_match::text, 'Прогноз точного счёта')
      on conflict (user_id, skill_key, source_type, source_id) do update
      set amount = excluded.amount, was_correct = excluded.was_correct, metadata = excluded.metadata;
    end if;

    perform public.refresh_user_skill_progress(prediction_row.user_id);
  end loop;
end;
$$;

create or replace function public.trigger_refresh_prediction_mastery()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_prediction_mastery_for_match(new.id);
  return new;
end;
$$;

drop trigger if exists matches_refresh_prediction_mastery on public.matches;
create trigger matches_refresh_prediction_mastery
after update of home_score, away_score, status on public.matches
for each row execute function public.trigger_refresh_prediction_mastery();

drop trigger if exists fantasy_teams_set_updated_at on public.fantasy_teams;
create trigger fantasy_teams_set_updated_at before update on public.fantasy_teams
for each row execute function public.set_updated_at();

drop trigger if exists memberships_set_updated_at on public.user_memberships;
create trigger memberships_set_updated_at before update on public.user_memberships
for each row execute function public.set_updated_at();

drop trigger if exists vip_votes_set_updated_at on public.vip_council_votes;
create trigger vip_votes_set_updated_at before update on public.vip_council_votes
for each row execute function public.set_updated_at();

drop trigger if exists profile_cosmetics_set_updated_at on public.profile_cosmetics;
create trigger profile_cosmetics_set_updated_at before update on public.profile_cosmetics
for each row execute function public.set_updated_at();

alter table public.seasons enable row level security;
alter table public.skill_definitions enable row level security;
alter table public.user_skill_progress enable row level security;
alter table public.xp_events enable row level security;
alter table public.fantasy_teams enable row level security;
alter table public.fantasy_leagues enable row level security;
alter table public.fantasy_league_members enable row level security;
alter table public.user_memberships enable row level security;
alter table public.digital_products enable row level security;
alter table public.digital_purchases enable row level security;
alter table public.vip_council_votes enable row level security;
alter table public.vip_events enable row level security;
alter table public.vip_event_registrations enable row level security;
alter table public.profile_cosmetics enable row level security;

drop policy if exists "seasons public read" on public.seasons;
create policy "seasons public read" on public.seasons for select using (true);
drop policy if exists "skills public read" on public.skill_definitions;
create policy "skills public read" on public.skill_definitions for select using (true);
drop policy if exists "products public read" on public.digital_products;
create policy "products public read" on public.digital_products for select using (is_active = true or public.is_admin_user());
drop policy if exists "vip events member read" on public.vip_events;
create policy "vip events member read" on public.vip_events for select using (
  public.is_admin_user() or exists (select 1 from public.user_memberships m where m.user_id = auth.uid() and m.tier = 'socio' and m.status in ('test', 'active'))
);

drop policy if exists "users read own skill progress" on public.user_skill_progress;
create policy "users read own skill progress" on public.user_skill_progress for select using (auth.uid() = user_id or public.is_admin_user());
drop policy if exists "users read own xp events" on public.xp_events;
create policy "users read own xp events" on public.xp_events for select using (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "users manage own fantasy teams" on public.fantasy_teams;
create policy "users manage own fantasy teams" on public.fantasy_teams for all using (auth.uid() = user_id or public.is_admin_user()) with check (auth.uid() = user_id or public.is_admin_user());
drop policy if exists "users create fantasy leagues" on public.fantasy_leagues;
create policy "users create fantasy leagues" on public.fantasy_leagues for insert with check (auth.uid() = owner_id);
drop policy if exists "league members read leagues" on public.fantasy_leagues;
create policy "league members read leagues" on public.fantasy_leagues for select using (not is_private or owner_id = auth.uid() or exists (select 1 from public.fantasy_league_members m where m.league_id = id and m.user_id = auth.uid()) or public.is_admin_user());
drop policy if exists "users manage league membership" on public.fantasy_league_members;
create policy "users manage league membership" on public.fantasy_league_members for all using (auth.uid() = user_id or public.is_admin_user()) with check (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "users read own membership" on public.user_memberships;
create policy "users read own membership" on public.user_memberships for select using (auth.uid() = user_id or public.is_admin_user());
drop policy if exists "users set own test membership" on public.user_memberships;
create policy "users set own test membership" on public.user_memberships for insert with check (auth.uid() = user_id and status = 'test');
drop policy if exists "users update own test membership" on public.user_memberships;
create policy "users update own test membership" on public.user_memberships for update using (auth.uid() = user_id and status = 'test') with check (auth.uid() = user_id and status = 'test');

drop policy if exists "users read own purchases" on public.digital_purchases;
create policy "users read own purchases" on public.digital_purchases for select using (auth.uid() = user_id or public.is_admin_user());
drop policy if exists "users create own test purchases" on public.digital_purchases;
create policy "users create own test purchases" on public.digital_purchases for insert with check (auth.uid() = user_id and status = 'test' and amount_rub = 0);

drop policy if exists "socio users manage own council vote" on public.vip_council_votes;
create policy "socio users manage own council vote" on public.vip_council_votes for all using (
  auth.uid() = user_id and exists (select 1 from public.user_memberships m where m.user_id = auth.uid() and m.tier = 'socio' and m.status in ('test', 'active'))
) with check (
  auth.uid() = user_id and exists (select 1 from public.user_memberships m where m.user_id = auth.uid() and m.tier = 'socio' and m.status in ('test', 'active'))
);

drop policy if exists "socio users manage event registrations" on public.vip_event_registrations;
create policy "socio users manage event registrations" on public.vip_event_registrations for all using (
  auth.uid() = user_id and exists (select 1 from public.user_memberships m where m.user_id = auth.uid() and m.tier = 'socio' and m.status in ('test', 'active'))
) with check (
  auth.uid() = user_id and exists (select 1 from public.user_memberships m where m.user_id = auth.uid() and m.tier = 'socio' and m.status in ('test', 'active'))
);

drop policy if exists "users manage own cosmetics" on public.profile_cosmetics;
create policy "users manage own cosmetics" on public.profile_cosmetics for all using (auth.uid() = user_id or public.is_admin_user()) with check (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "admins manage seasons" on public.seasons;
create policy "admins manage seasons" on public.seasons for all using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "admins manage skills" on public.skill_definitions;
create policy "admins manage skills" on public.skill_definitions for all using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "admins manage skill progress" on public.user_skill_progress;
create policy "admins manage skill progress" on public.user_skill_progress for all using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "admins manage xp events" on public.xp_events;
create policy "admins manage xp events" on public.xp_events for all using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "admins manage memberships" on public.user_memberships;
create policy "admins manage memberships" on public.user_memberships for all using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "admins manage products" on public.digital_products;
create policy "admins manage products" on public.digital_products for all using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "admins manage purchases" on public.digital_purchases;
create policy "admins manage purchases" on public.digital_purchases for all using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "admins manage vip events" on public.vip_events;
create policy "admins manage vip events" on public.vip_events for all using (public.is_admin_user()) with check (public.is_admin_user());
