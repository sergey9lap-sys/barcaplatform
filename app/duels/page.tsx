import { DuelsClient } from "@/components/duels/duels-client";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { getAllMatches, getCurrentUser, getDuelsForUser, getLeaderboard, getPredictionsForUsers } from "@/lib/data";
import { getSupabaseEnv } from "@/lib/env";

export default async function DuelsPage() {
  const { configured } = getSupabaseEnv();
  const [user, matches, leaderboard] = await Promise.all([
    getCurrentUser(),
    getAllMatches(),
    getLeaderboard(12),
  ]);

  const rivals = leaderboard.filter((entry) => entry.id !== user?.id);
  const duels = await getDuelsForUser(user?.id);
  const predictionUserIds = user?.id
    ? Array.from(new Set([user.id, ...duels.flatMap((duel) => [duel.challenger_id, duel.opponent_id])]))
    : [];
  const predictions = await getPredictionsForUsers(predictionUserIds);

  return (
    <div className="space-y-6">
      <Card
        className="barca-panel border-accent/15 overflow-hidden"
        style={createPhotoPanelStyle(SECTION_BACKGROUNDS.duelsHero, { position: "center 54%" })}
      >
        <CardContent className="p-5">
          <p className="meta-label text-xs">Дуэли</p>
          <h2 className="mt-2 text-2xl font-semibold">Ваш прогноз против чужого</h2>
          <p className="mt-2 text-sm text-blue-100/75">
            Выбирайте матч, бросайте вызов сопернику и сравнивайте, кто точнее читает игру.
          </p>
        </CardContent>
      </Card>

      <DuelsClient
        matches={matches}
        rivals={rivals}
        initialDuels={duels}
        initialPredictions={predictions}
        backendEnabled={configured}
        currentUserId={user?.id}
      />
    </div>
  );
}
