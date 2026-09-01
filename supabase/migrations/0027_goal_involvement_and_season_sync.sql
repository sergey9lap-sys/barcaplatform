alter table public.match_player_stats
add column if not exists pre_assists integer not null default 0 check (pre_assists >= 0),
add column if not exists goal_influences integer not null default 0 check (goal_influences >= 0);

alter table public.season_player_stats
add column if not exists pre_assists integer not null default 0 check (pre_assists >= 0),
add column if not exists goal_influences integer not null default 0 check (goal_influences >= 0);

comment on column public.match_player_stats.pre_assists is
  'Предголевые передачи: пас перед официальной голевой передачей.';

comment on column public.match_player_stats.goal_influences is
  'Ключевое участие в голе без официального гола или ассиста: заработанный автогол, удар перед добиванием, ключевой прострел с рикошетом и аналогичные эпизоды.';
