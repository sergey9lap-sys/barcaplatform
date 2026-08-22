-- Current squad numbers and the official Xavi Espart portrait.
-- Safe to run repeatedly after migrations 0001-0023.

update public.players
set avatar_url = '/players/xavi-espart-official-2026.jpg'
where player_name = 'Хави Эспарт';

update public.match_players
set player_number = case player_name
  when 'Энтони Гордон' then 17
  when 'Карим Адейеми' then 14
  when 'Джесси Бисиву' then 27
  when 'Хави Эспарт' then 28
  when 'Фермин Лопес' then 7
  when 'Родри' then 16
  else player_number
end
where player_name in (
  'Энтони Гордон',
  'Карим Адейеми',
  'Джесси Бисиву',
  'Хави Эспарт',
  'Фермин Лопес',
  'Родри'
);
