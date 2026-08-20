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
