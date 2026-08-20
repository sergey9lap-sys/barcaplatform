create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  total_points integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  competition text not null,
  venue text not null,
  kickoff_at timestamptz not null,
  home_score integer,
  away_score integer,
  status text not null check (status in ('upcoming', 'finished')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  player_name text not null,
  player_number integer,
  position text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  predicted_result text not null check (predicted_result in ('home', 'draw', 'away')),
  predicted_home_score integer,
  predicted_away_score integer,
  points_awarded integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, match_id)
);

create table if not exists public.lineup_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  selected_player_ids uuid[] not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, match_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.calculate_prediction_points(
  predicted_result text,
  predicted_home_score integer,
  predicted_away_score integer,
  actual_home_score integer,
  actual_away_score integer
)
returns integer
language plpgsql
as $$
declare
  actual_result text;
  points integer := 0;
begin
  if actual_home_score is null or actual_away_score is null then
    return 0;
  end if;

  if actual_home_score > actual_away_score then
    actual_result := 'home';
  elsif actual_home_score < actual_away_score then
    actual_result := 'away';
  else
    actual_result := 'draw';
  end if;

  if predicted_result = actual_result then
    points := points + 10;
  end if;

  if predicted_home_score is not null
    and predicted_away_score is not null
    and predicted_home_score = actual_home_score
    and predicted_away_score = actual_away_score then
    points := points + 20;
  end if;

  return points;
end;
$$;

create or replace function public.sync_prediction_points()
returns trigger
language plpgsql
as $$
declare
  actual_home_score integer;
  actual_away_score integer;
begin
  select home_score, away_score
  into actual_home_score, actual_away_score
  from public.matches
  where id = new.match_id;

  new.points_awarded := public.calculate_prediction_points(
    new.predicted_result,
    new.predicted_home_score,
    new.predicted_away_score,
    actual_home_score,
    actual_away_score
  );

  return new;
end;
$$;

create or replace function public.refresh_profile_total_points()
returns trigger
language plpgsql
as $$
declare
  affected_user uuid;
begin
  affected_user := coalesce(new.user_id, old.user_id);

  update public.profiles
  set total_points = coalesce((
    select sum(points_awarded)
    from public.predictions
    where user_id = affected_user
  ), 0)
  where id = affected_user;

  return coalesce(new, old);
end;
$$;

create or replace function public.refresh_match_prediction_points()
returns trigger
language plpgsql
as $$
begin
  update public.predictions
  set points_awarded = public.calculate_prediction_points(
    predicted_result,
    predicted_home_score,
    predicted_away_score,
    new.home_score,
    new.away_score
  )
  where match_id = new.id;

  update public.profiles
  set total_points = coalesce((
    select sum(points_awarded)
    from public.predictions
    where user_id = profiles.id
  ), 0)
  where id in (
    select distinct user_id
    from public.predictions
    where match_id = new.id
  );

  return new;
end;
$$;

drop trigger if exists predictions_set_updated_at on public.predictions;
create trigger predictions_set_updated_at
before update on public.predictions
for each row execute function public.set_updated_at();

drop trigger if exists predictions_sync_points on public.predictions;
create trigger predictions_sync_points
before insert or update on public.predictions
for each row execute function public.sync_prediction_points();

drop trigger if exists predictions_refresh_profile_points on public.predictions;
create trigger predictions_refresh_profile_points
after insert or update or delete on public.predictions
for each row execute function public.refresh_profile_total_points();

drop trigger if exists matches_refresh_prediction_points on public.matches;
create trigger matches_refresh_prediction_points
after update of home_score, away_score, status on public.matches
for each row execute function public.refresh_match_prediction_points();

drop trigger if exists lineup_predictions_set_updated_at on public.lineup_predictions;
create trigger lineup_predictions_set_updated_at
before update on public.lineup_predictions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.predictions enable row level security;
alter table public.lineup_predictions enable row level security;

create policy "profiles are viewable by everyone"
on public.profiles
for select
using (true);

create policy "users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "matches are viewable by everyone"
on public.matches
for select
using (true);

create policy "match players are viewable by everyone"
on public.match_players
for select
using (true);

create policy "users can view own predictions"
on public.predictions
for select
using (auth.uid() = user_id);

create policy "users can insert own predictions"
on public.predictions
for insert
with check (auth.uid() = user_id);

create policy "users can update own predictions"
on public.predictions
for update
using (auth.uid() = user_id);

create policy "users can view own lineup predictions"
on public.lineup_predictions
for select
using (auth.uid() = user_id);

create policy "users can insert own lineup predictions"
on public.lineup_predictions
for insert
with check (auth.uid() = user_id);

create policy "users can update own lineup predictions"
on public.lineup_predictions
for update
using (auth.uid() = user_id);
