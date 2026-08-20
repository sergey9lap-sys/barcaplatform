import { getPlayerAvatarPath } from "@/lib/assets";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { SeasonStatsBoard } from "@/components/players/season-stats-board";
import { Card, CardContent } from "@/components/ui/card";
import { getSeasonPlayerStats } from "@/lib/data";

export default async function PlayersPage() {
  const stats = await getSeasonPlayerStats();
  const coachAvatar = getPlayerAvatarPath("Ханси Флик");

  return (
    <div className="space-y-6">
      <Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.playersHero, { position: "center 40%" })}>
        <CardContent className="p-5">
          <p className="meta-label text-xs">Игроки</p>
          <h2 className="mt-2 text-2xl font-semibold">Кто тащит сезон, а кто провёл его слабее</h2>
          <p className="mt-2 text-sm text-blue-100/75">
            После каждого завершённого матча игроки получают очки за место в вашем порядке. Здесь собирается общая картина сезона.
          </p>
        </CardContent>
      </Card>

      <Card className="soft-panel overflow-hidden" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.coachCard, { overlay: "medium", position: "center 10%" })}>
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className="club-avatar h-16 w-16 rounded-3xl bg-cover bg-center"
            style={coachAvatar ? { backgroundImage: `url(${coachAvatar})` } : undefined}
          >
            {coachAvatar ? null : "ХФ"}
          </div>
          <div>
            <p className="meta-label text-xs">Главный тренер</p>
            <h3 className="mt-2 text-2xl font-semibold">Ханси Флик</h3>
            <p className="mt-2 text-sm text-blue-100/75">Главный тренер команды в этом сезоне.</p>
          </div>
        </CardContent>
      </Card>

      <SeasonStatsBoard stats={stats} />
    </div>
  );
}
