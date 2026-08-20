drop policy if exists "player ratings are viewable by everyone" on public.player_ratings;
drop policy if exists "users can insert own player ratings" on public.player_ratings;
drop policy if exists "users can update own player ratings" on public.player_ratings;

drop trigger if exists player_ratings_set_updated_at on public.player_ratings;
drop table if exists public.player_ratings;

alter table public.match_played_players
drop constraint if exists match_played_players_match_id_match_player_id_key;

alter table public.match_played_players
add constraint match_played_players_match_id_match_player_id_key unique (match_id, match_player_id);
