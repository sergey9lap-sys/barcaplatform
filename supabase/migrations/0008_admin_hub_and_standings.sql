alter table public.transfer_rumors
add column if not exists direction text not null default 'incoming' check (direction in ('incoming', 'outgoing')),
add column if not exists probability_score integer check (probability_score between 1 and 10),
add column if not exists usefulness_score integer check (usefulness_score between 1 and 10),
add column if not exists recommendation boolean,
add column if not exists notes text,
add column if not exists image_url text;

alter table public.players
add column if not exists avatar_url text;

alter table public.transfer_rumors
drop constraint if exists transfer_rumors_status_check;

alter table public.transfer_rumors
add constraint transfer_rumors_status_check check (status in ('active', 'resolved', 'archived'));

create table if not exists public.transfer_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  player_name text not null,
  current_club text not null,
  target_club text not null,
  direction text not null check (direction in ('incoming', 'outgoing')),
  estimated_fee_millions numeric(10, 2),
  usefulness_score integer check (usefulness_score between 1 and 10),
  desire_score integer check (desire_score between 1 and 10),
  probability_score integer check (probability_score between 1 and 10),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.league_standings (
  id uuid primary key default gen_random_uuid(),
  competition text not null,
  season_label text not null,
  team_name text not null,
  team_short_name text,
  badge_url text,
  position integer not null,
  played integer not null default 0,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  points integer not null default 0,
  goals_for integer not null default 0,
  goals_against integer not null default 0,
  goal_difference integer not null default 0,
  zone text not null default 'neutral' check (zone in ('ucl', 'uel', 'uecl', 'relegation', 'neutral')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (competition, season_label, team_name)
);

create table if not exists public.season_player_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  season_label text not null,
  goals integer not null default 0,
  assists integer not null default 0,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (player_id, season_label)
);

drop trigger if exists transfer_ideas_set_updated_at on public.transfer_ideas;
create trigger transfer_ideas_set_updated_at
before update on public.transfer_ideas
for each row execute function public.set_updated_at();

drop trigger if exists league_standings_set_updated_at on public.league_standings;
create trigger league_standings_set_updated_at
before update on public.league_standings
for each row execute function public.set_updated_at();

drop trigger if exists season_player_stats_set_updated_at on public.season_player_stats;
create trigger season_player_stats_set_updated_at
before update on public.season_player_stats
for each row execute function public.set_updated_at();

alter table public.transfer_ideas enable row level security;
alter table public.league_standings enable row level security;
alter table public.season_player_stats enable row level security;

drop policy if exists "transfer rumors are manageable by authenticated users" on public.transfer_rumors;
create policy "transfer rumors are manageable by authenticated users"
on public.transfer_rumors
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "transfer ideas are viewable by everyone" on public.transfer_ideas;
create policy "transfer ideas are viewable by everyone"
on public.transfer_ideas
for select
using (true);

drop policy if exists "users can insert own transfer ideas" on public.transfer_ideas;
create policy "users can insert own transfer ideas"
on public.transfer_ideas
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can update own transfer ideas" on public.transfer_ideas;
create policy "users can update own transfer ideas"
on public.transfer_ideas
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own transfer ideas" on public.transfer_ideas;
create policy "users can delete own transfer ideas"
on public.transfer_ideas
for delete
using (auth.uid() = user_id);

drop policy if exists "league standings are viewable by everyone" on public.league_standings;
create policy "league standings are viewable by everyone"
on public.league_standings
for select
using (true);

drop policy if exists "league standings are manageable by authenticated users" on public.league_standings;
create policy "league standings are manageable by authenticated users"
on public.league_standings
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "season player stats are viewable by everyone" on public.season_player_stats;
create policy "season player stats are viewable by everyone"
on public.season_player_stats
for select
using (true);

drop policy if exists "season player stats are manageable by authenticated users" on public.season_player_stats;
create policy "season player stats are manageable by authenticated users"
on public.season_player_stats
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
