drop policy if exists "player rankings are viewable by everyone" on public.player_rankings;
create policy "player rankings are viewable by everyone"
on public.player_rankings
for select
using (true);

drop policy if exists "users can insert own player rankings" on public.player_rankings;
create policy "users can insert own player rankings"
on public.player_rankings
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can update own player rankings" on public.player_rankings;
create policy "users can update own player rankings"
on public.player_rankings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own player rankings" on public.player_rankings;
create policy "users can delete own player rankings"
on public.player_rankings
for delete
using (auth.uid() = user_id);
