"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlayerAvatarPath } from "@/lib/assets";
import type { SeasonPlayerStat } from "@/types/database";

interface SeasonStatsBoardProps {
  stats: SeasonPlayerStat[];
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function fitText(context: CanvasRenderingContext2D, value: string, maxWidth: number) {
  if (context.measureText(value).width <= maxWidth) return value;
  let text = value;
  while (text.length > 1 && context.measureText(`${text}…`).width > maxWidth) text = text.slice(0, -1);
  return `${text}…`;
}

async function downloadSeasonCard(stats: SeasonPlayerStat[]) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) return;

  const background = context.createLinearGradient(0, 0, 1080, 1920);
  background.addColorStop(0, "#071733");
  background.addColorStop(.62, "#09132e");
  background.addColorStop(1, "#4b0a2d");
  context.fillStyle = background;
  context.fillRect(0, 0, 1080, 1920);

  const glow = context.createRadialGradient(120, 100, 20, 120, 100, 620);
  glow.addColorStop(0, "rgba(45,101,213,.42)");
  glow.addColorStop(1, "rgba(45,101,213,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 800, 760);

  context.fillStyle = "#f5c84b";
  context.font = '800 22px "Segoe UI", sans-serif';
  context.fillText("1899 BARCELONA VISION · СЕЗОН 2026/27", 56, 68);
  context.fillStyle = "#fff";
  context.font = '800 54px "Segoe UI", sans-serif';
  context.fillText("РЕЙТИНГ ИГРОКОВ БАРСЫ", 56, 142);
  context.fillStyle = "rgba(220,231,255,.72)";
  context.font = '600 21px "Segoe UI", sans-serif';
  context.fillText("Голосование болельщиков по завершённым матчам", 56, 184);

  const rowsPerColumn = Math.ceil(stats.length / 2);
  const rowHeight = Math.min(112, Math.floor(1490 / Math.max(1, rowsPerColumn)));
  stats.forEach((player, index) => {
    const column = Math.floor(index / rowsPerColumn);
    const row = index % rowsPerColumn;
    const x = 54 + column * 512;
    const y = 246 + row * rowHeight;
    const width = 482;
    const height = rowHeight - 10;

    roundedRect(context, x, y, width, height, 18);
    context.fillStyle = index < 3 ? "rgba(31,66,150,.78)" : "rgba(5,16,42,.78)";
    context.fill();
    context.strokeStyle = index < 3 ? "rgba(226,54,113,.5)" : "rgba(141,174,255,.18)";
    context.lineWidth = 2;
    context.stroke();

    const badge = context.createLinearGradient(x + 14, y + 14, x + 70, y + height - 14);
    badge.addColorStop(0, "#2d65d5");
    badge.addColorStop(1, "#a81652");
    roundedRect(context, x + 14, y + 13, 58, height - 26, 14);
    context.fillStyle = badge;
    context.fill();
    context.fillStyle = "#fff";
    context.textAlign = "center";
    context.font = '800 26px "Segoe UI", sans-serif';
    context.fillText(String(index + 1), x + 43, y + height / 2 + 9);

    context.textAlign = "left";
    context.fillStyle = "#fff";
    context.font = '750 21px "Segoe UI", sans-serif';
    context.fillText(fitText(context, player.player_name, 245), x + 90, y + 37);
    context.fillStyle = "rgba(219,229,255,.68)";
    context.font = '600 14px "Segoe UI", sans-serif';
    context.fillText(`Г ${player.goals} · А ${player.assists} · ПГ ${player.pre_assists} · ВГ ${player.goal_influences}`, x + 90, y + 66);
    context.fillStyle = "#f5c84b";
    context.textAlign = "right";
    context.font = '800 24px "Segoe UI", sans-serif';
    context.fillText(String(player.total_points), x + width - 18, y + 38);
    context.fillStyle = "rgba(219,229,255,.62)";
    context.font = '600 13px "Segoe UI", sans-serif';
    context.fillText("очков", x + width - 18, y + 63);
  });

  context.strokeStyle = "rgba(255,255,255,.16)";
  context.beginPath();
  context.moveTo(56, 1828);
  context.lineTo(1024, 1828);
  context.stroke();
  context.textAlign = "left";
  context.fillStyle = "rgba(229,236,255,.74)";
  context.font = '600 17px "Segoe UI", sans-serif';
  context.fillText("Г — голы · А — голевые · ПГ — предголевые · ВГ — ключевое влияние на гол", 56, 1870);
  context.textAlign = "right";
  context.fillStyle = "#f5c84b";
  context.font = '750 18px "Segoe UI", sans-serif';
  context.fillText("1899 Barcelona Vision", 1024, 1870);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `barca-season-ranking-2026-27-${Date.now()}.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function SeasonStatsBoard({ stats }: SeasonStatsBoardProps) {
  const [exporting, setExporting] = useState(false);
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Общая таблица игроков сезона 2026/27</CardTitle>
            <Button type="button" variant="secondary" size="sm" disabled={exporting} onClick={async () => {
              setExporting(true);
              try { await downloadSeasonCard(stats); } finally { setExporting(false); }
            }}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Готовим PNG..." : "Скачать таблицу"}
            </Button>
          </div>
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
                  <p className="meta-label text-xs">Предголевые</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{player.pre_assists}</p>
                </div>
                <div className="ui-data-card">
                  <p className="meta-label text-xs">Влияние на гол</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{player.goal_influences}</p>
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
