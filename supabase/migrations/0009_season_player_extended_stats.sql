alter table public.season_player_stats
add column if not exists matches_played integer not null default 0,
add column if not exists minutes_played integer not null default 0;
