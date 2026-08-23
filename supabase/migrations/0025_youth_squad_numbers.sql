-- Youth squad numbers for match predictions.
-- Safe to run repeatedly after migrations 0001-0024.

update public.match_players
set player_number = case player_name
  when 'Альваро Кортес' then 26
  when 'Брайан Фариньяс' then 28
  when 'Хамза Абделькарим' then 29
  when 'Жорди Пескер' then 33
  when 'Хави Эспарт' then 36
  else player_number
end
where player_name in (
  'Альваро Кортес',
  'Брайан Фариньяс',
  'Хамза Абделькарим',
  'Жорди Пескер',
  'Хави Эспарт'
);
