import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerAvatarPath } from "@/lib/assets";
import type { SeasonPlayerStat } from "@/types/database";

interface SeasonStatsBoardProps {
  stats: SeasonPlayerStat[];
}

export function SeasonStatsBoard({ stats }: SeasonStatsBoardProps) {
  const rankedPlayers = stats.filter((item) => item.matches_ranked > 0);
  const topPlayer = rankedPlayers[0] ?? null;
  const bottomPlayer = rankedPlayers[rankedPlayers.length - 1] ?? null;
  const topScorer = [...stats].sort((a, b) => b.goals - a.goals || b.assists - a.assists)[0] ?? null;
  const topPlaymaker = [...stats].sort((a, b) => b.assists - a.assists || b.goals - a.goals)[0] ?? null;

  function getInitials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  function renderAvatar(playerName: string, avatarUrl?: string | null) {
    const resolvedAvatar = getPlayerAvatarPath(playerName, avatarUrl);

    return (
      <div
        className="club-avatar bg-cover bg-center"
        style={resolvedAvatar ? { backgroundImage: `url(${resolvedAvatar})` } : undefined}
      >
        {resolvedAvatar ? null : getInitials(playerName)}
      </div>
    );
  }

  if (!stats.length) {
    return (
      <Card className="barca-panel border-accent/15">
        <CardContent className="p-5 text-sm text-blue-100/80">
          Сезонная таблица игроков появится после первых завершённых матчей, когда по ним начнут сохранять порядок игроков.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="barca-panel border-accent/15">
          <CardContent className="p-5">
            <p className="meta-label text-xs">Лучший игрок сезона</p>
            <p className="ui-value mt-3 text-2xl font-semibold">{topPlayer?.player_name ?? "Пока нет рейтинга"}</p>
            <p className="ui-note mt-2 text-sm">
              {topPlayer?.total_points ?? 0} очков · среднее место {topPlayer?.average_rank_position ?? "—"}
            </p>
            <p className="ui-note mt-2 text-sm">
              первых мест: {topPlayer?.first_place_count ?? 0} · попаданий в топ-3: {topPlayer?.top_three_count ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="barca-panel border-primary/20">
          <CardContent className="p-5">
            <p className="meta-label text-xs">Игрок с самым слабым сезоном</p>
            <p className="ui-value mt-3 text-2xl font-semibold">{bottomPlayer?.player_name ?? "Пока нет рейтинга"}</p>
            <p className="ui-note mt-2 text-sm">
              {bottomPlayer?.total_points ?? 0} очков · среднее место {bottomPlayer?.average_rank_position ?? "—"}
            </p>
            <p className="ui-note mt-2 text-sm">
              последних мест: {bottomPlayer?.last_place_count ?? 0} · матчей в таблице: {bottomPlayer?.matches_ranked ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="soft-panel">
          <CardContent className="p-5">
            <p className="meta-label text-xs">Лучший бомбардир</p>
            <div className="mt-3 flex items-center gap-3">
              {topScorer ? renderAvatar(topScorer.player_name, topScorer.avatar_url) : <div className="club-avatar">—</div>}
              <div>
                <p className="ui-value text-xl font-semibold">{topScorer?.player_name ?? "Пока нет данных"}</p>
                <p className="ui-note mt-1 text-sm">Голов: {topScorer?.goals ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="soft-panel">
          <CardContent className="p-5">
            <p className="meta-label text-xs">Лучший ассистент</p>
            <div className="mt-3 flex items-center gap-3">
              {topPlaymaker ? renderAvatar(topPlaymaker.player_name, topPlaymaker.avatar_url) : <div className="club-avatar">—</div>}
              <div>
                <p className="ui-value text-xl font-semibold">{topPlaymaker?.player_name ?? "Пока нет данных"}</p>
                <p className="ui-note mt-1 text-sm">Голевых передач: {topPlaymaker?.assists ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Общая таблица игроков сезона</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.map((player, index) => (
            <div key={player.player_id} className="ui-data-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="meta-label text-xs">#{index + 1} в сезоне</p>
                  <div className="mt-2 flex items-center gap-3">
                    {renderAvatar(player.player_name, player.avatar_url)}
                    <p className="ui-value text-lg font-semibold">{player.player_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="meta-label text-xs">Очки сезона</p>
                  <p className="ui-value mt-2 text-2xl font-semibold">{player.total_points}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="ui-data-card">
                  <p className="meta-label text-xs">Голы</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{player.goals}</p>
                </div>
                <div className="ui-data-card">
                  <p className="meta-label text-xs">Пасы</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{player.assists}</p>
                </div>
                <div className="ui-data-card">
                  <p className="meta-label text-xs">Среднее место</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{player.average_rank_position || "—"}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="ui-data-card">
                  <p className="meta-label text-xs">Первые места</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{player.first_place_count}</p>
                </div>
                <div className="ui-data-card">
                  <p className="meta-label text-xs">Топ-3</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{player.top_three_count}</p>
                </div>
                <div className="ui-data-card">
                  <p className="meta-label text-xs">Последние места</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{player.last_place_count}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
