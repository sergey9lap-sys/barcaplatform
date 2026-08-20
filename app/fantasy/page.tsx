import { FantasyManagerClient } from "@/components/fantasy/fantasy-manager-client";
import { FantasyLeaguesClient } from "@/components/fantasy/fantasy-leagues-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { getMatchPlayers, getUpcomingMatches } from "@/lib/data";

export default async function FantasyPage() {
  const [match] = await getUpcomingMatches(1);
  const players = match ? await getMatchPlayers(match.id) : [];
  return <div className="space-y-6">
    <Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.matchesHero, { position: "center 48%" })}><CardContent className="space-y-3 p-5"><Badge variant="primary">Фэнтези 2026/27</Badge><h2 className="text-2xl font-semibold">Пять решений. Один бюджет. Капитан ×2.</h2><p className="max-w-3xl text-sm text-blue-100/75">Берите любых пять игроков без ограничений по позициям. Бюджет не позволит собрать только звёзд, а состав автоматически блокируется в момент начала матча.</p></CardContent></Card>
    {match ? <FantasyManagerClient match={match} players={players} /> : <Card className="soft-panel"><CardContent className="p-5">Расписание ещё не загружено.</CardContent></Card>}
    <FantasyLeaguesClient />
  </div>;
}
