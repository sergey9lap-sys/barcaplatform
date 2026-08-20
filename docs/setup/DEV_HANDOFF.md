# DEV HANDOFF — MVP Supabase Setup

Этот MVP уже работает локально в mock/localStorage режиме.
Чтобы переключить проект на реальный Supabase, сделайте шаги ниже.

## 1. ENV variables

Создайте файл `.env.local` в корне проекта и добавьте:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Источник примера:
- `.env.example`

## 2. SQL files

Выполните SQL в таком порядке:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_lineup_layout.sql`
3. `supabase/migrations/0003_transfers.sql`
4. `supabase/migrations/0004_duels.sql`
5. `supabase/migrations/0005_engagement_scoring.sql`
6. `supabase/seed.sql`

Что создаст schema SQL:
- `profiles`
- `matches`
- `match_players`
- `predictions`
- `lineup_predictions`
- `lineup_predictions.player_layout` для тактической расстановки на поле
- `transfer_rumors`
- `transfer_predictions`
- `duels`
- `player_ratings`

Также schema SQL:
- свяжет `auth.users` -> `profiles` через trigger
- включит RLS policies
- добавит базовый points recalculation для predictions

## 3. Что оживёт после этого

После добавления env и выполнения SQL:
- auth UI начнёт работать через Supabase Auth
- `lib/data.ts` начнёт читать реальные матчи, игроков и leaderboard
- prediction form начнёт сохранять в `predictions`
- lineup form начнёт сохранять в `lineup_predictions`
- тактическая доска начнёт сохранять координаты игроков в `lineup_predictions.player_layout`
- экран трансферов начнёт читать реальные слухи и сохранять прогнозы в `transfer_predictions`
- экран дуэлей начнёт создавать реальные дуэли между пользователями в `duels`
- очки за закрытые трансферы и бонусы за выигранные дуэли начнут попадать в общий `profiles.total_points`
- оценки игроков после матча начнут сохраняться в `player_ratings`
- leaderboard начнёт использовать реальные `profiles.total_points`
- server/client Supabase helpers станут активными integration points

## 4. Что пока остаётся временным

До замены на live data сейчас локально работают:
- `lib/predictions/storage.ts`
- `lib/lineup/storage.ts`
- `lib/mocks/matches.ts`
- `lib/mocks/match-players.ts`
- `lib/mocks/leaderboard.ts`

## 5. Что можно будет отключить позже

Когда реальный Supabase будет полностью подключён:
- fallback mock matches
- fallback mock players
- fallback mock leaderboard
- localStorage persistence для prediction/lineup
- mock user id `mock-user-local`

## 6. Проверка после setup

1. Запустите `npm run dev`
2. Откройте `/auth` и проверьте sign up / sign in
3. Откройте `/matches`
4. Сохраните prediction
5. Сохраните lineup
6. Откройте `/leaderboard`
7. Убедитесь, что данные приходят уже не из mock fallback
