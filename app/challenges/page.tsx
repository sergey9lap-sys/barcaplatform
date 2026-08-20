import { DailyChallengeCard } from "@/components/community/daily-challenge-card";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { mockDailyChallenges } from "@/lib/mocks/community";

export default function ChallengesPage() {
  return (
    <div className="space-y-6">
      <Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.homeStatus, { position: "center 52%" })}>
        <CardContent className="p-5">
          <p className="meta-label text-xs">Daily Challenges</p>
          <h2 className="mt-2 text-2xl font-semibold">Задания дня для XP, points и репутации</h2>
          <p className="mt-2 text-sm text-blue-100/75">
            Трансферные баттлы, La Masia picks, тактические вопросы и Barca DNA debate.
          </p>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {mockDailyChallenges.map((challenge) => (
          <DailyChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}
