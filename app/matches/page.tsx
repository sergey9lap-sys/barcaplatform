import { MatchCard } from "@/components/matches/match-card";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { getAllMatches } from "@/lib/data";

export default async function MatchesPage() {
  const matches = await getAllMatches();

  return (
    <div className="space-y-6">
      <Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.matchesHero, { position: "center 27%" })}>
        <CardContent className="p-5">
          <p className="meta-label text-xs">Матчи</p>
          <h2 className="mt-2 text-2xl font-semibold">Ближайшие и завершённые встречи</h2>
          <p className="mt-2 text-sm text-blue-100/80">
            Следите за ближайшими встречами, открывайте матч и сразу переходите к своему прогнозу.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
