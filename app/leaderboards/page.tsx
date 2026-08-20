import { CommunityLeaderboardsClient } from "@/components/leaderboards/community-leaderboards-client";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { getPublicLeaderboard } from "@/lib/data";

export default async function LeaderboardsPage() {
  const entries = await getPublicLeaderboard();
  return (
    <div className="space-y-6">
      <Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.leaderboardHero, { position: "center 62%" })}>
        <CardContent className="p-5">
          <p className="meta-label text-xs">Рейтинги</p>
          <h2 className="mt-2 text-2xl font-semibold">Рейтинги прогнозистов, аналитиков, скаутов и трансферных экспертов</h2>
          <p className="mt-2 text-sm text-blue-100/75">
            Очки, уровень, роль, репутация и бейджи собираются из подтверждённых действий пользователей.
          </p>
        </CardContent>
      </Card>
      <CommunityLeaderboardsClient entries={entries} />
    </div>
  );
}
