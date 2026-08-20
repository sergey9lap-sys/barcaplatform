alter table public.lineup_predictions
add column if not exists player_layout jsonb not null default '[]'::jsonb;
