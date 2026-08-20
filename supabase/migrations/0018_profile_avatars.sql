alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public profile avatars" on storage.objects;
create policy "Public profile avatars" on storage.objects for select using (bucket_id = 'profile-avatars');
drop policy if exists "Users upload own profile avatar" on storage.objects;
create policy "Users upload own profile avatar" on storage.objects for insert to authenticated with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users update own profile avatar" on storage.objects;
create policy "Users update own profile avatar" on storage.objects for update to authenticated using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete own profile avatar" on storage.objects;
create policy "Users delete own profile avatar" on storage.objects for delete to authenticated using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Keep the live first-team pool aligned with the current editorial squad.
delete from public.match_players where player_name in ('Рональд Араухо', 'Ферран Торрес', 'Руни Барджи', 'Марк Касадо', 'Эктор Форт');
delete from public.players where player_name in ('Рональд Араухо', 'Ферран Торрес', 'Руни Барджи', 'Марк Касадо', 'Эктор Форт');

delete from public.transfer_rumors where player_name = 'Нико Уильямс';

insert into public.transfer_rumors (player_name, current_club, target_club, window_label, status, resolved_outcome, direction, probability_score, usefulness_score, recommendation, notes, image_url)
select seed.* from (values
  ('Энтони Гордон','Ньюкасл','Барселона','Лето 2026','resolved',true,'incoming',10,9,true,'Официально: добавлен в актуальный состав.','/players/энтони гордон.png'),
  ('Карим Адейеми','Боруссия Дортмунд','Барселона','Лето 2026','resolved',true,'incoming',10,8,true,'Официально: добавлен в актуальный состав.','/players/карим адейеми.png'),
  ('Джесси Бисиву','Клуб уточняется','Барселона','Лето 2026','resolved',true,'incoming',10,7,true,'Официально: добавлен в актуальный состав.','/players/джесси бисиву.png'),
  ('Родри','Манчестер Сити','Барселона','Лето 2026','resolved',true,'incoming',10,10,true,'Официально: добавлен в актуальный состав.','/players/родри.png'),
  ('Жоау Канселу','Манчестер Сити','Барселона','Лето 2026','resolved',true,'incoming',10,8,true,'Официально: возвращён в актуальный состав.','/players/жоао канселу.jpg'),
  ('Хулиан Альварес','Атлетико Мадрид','Барселона','Лето 2026','active',null,'incoming',5,10,true,'Сложная и дорогая цель в линию атаки.','/players/хулиан альварес.jpg'),
  ('Лаутаро Мартинес','Интер','Барселона','Лето 2026','active',null,'incoming',4,9,true,'Готовый лидер атаки и сильная игра без мяча.','/players/лаутаро мартинес.png'),
  ('Кастелло Лукеба','РБ Лейпциг','Барселона','Лето 2026','active',null,'incoming',7,9,true,'Левоногий центральный защитник для высокой линии.','/players/кастелло лукеба.png'),
  ('Эмерик Ляпорт','Атлетик Бильбао','Барселона','Лето 2026','active',null,'incoming',6,7,true,'Опытный центральный защитник с сильной первой передачей.','/players/эмерик лапорт.png'),
  ('Жорж Микаутадзе','Вильярреал','Барселона','Лето 2026','active',null,'incoming',6,8,true,'Подвижный нападающий для связи линий.','/players/жорж микаутадзе.png'),
  ('Николо Тресольди','Брюгге','Барселона','Лето 2026','active',null,'incoming',5,7,true,'Молодая девятка с потенциалом развития.','/players/николо тресольди.png'),
  ('Виктор Гёкереш','Арсенал','Барселона','Лето 2026','active',null,'incoming',4,9,true,'Мощный завершитель и угроза в переходах.','/players/виктор гёкереш.png')
) as seed(player_name,current_club,target_club,window_label,status,resolved_outcome,direction,probability_score,usefulness_score,recommendation,notes,image_url)
where not exists (select 1 from public.transfer_rumors existing where existing.player_name = seed.player_name);
