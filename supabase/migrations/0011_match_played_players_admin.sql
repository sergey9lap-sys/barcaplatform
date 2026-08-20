drop policy if exists "match played players are manageable by authenticated users" on public.match_played_players;

create policy "match played players are manageable by authenticated users"
on public.match_played_players
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
