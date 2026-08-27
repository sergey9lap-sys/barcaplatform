-- Remove Alvaro Cortes from current selections and assign Xavi Espart number 12.
-- Historical finished-match records stay untouched.

update public.match_players as player
set player_number = 12
from public.matches as match
where player.match_id = match.id
  and match.status = 'upcoming'
  and player.player_name = 'Хави Эспарт';

delete from public.match_players as player
using public.matches as match
where player.match_id = match.id
  and match.status = 'upcoming'
  and player.player_name = 'Альваро Кортес';

update public.la_masia_players
set is_active = false,
    updated_at = now()
where id = 'alvaro-cortes';
