import { Card, CardContent } from "@/components/ui/card";
import { getTeamBadgePath } from "@/lib/assets";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { getZoneClassName, getZoneLabel } from "@/lib/transfers/format";
import type { LeagueStanding } from "@/types/database";

interface StandingsBoardProps {
  standings: LeagueStanding[];
  seasonLabel: string;
  competition: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function StandingsBoard({ standings, seasonLabel, competition }: StandingsBoardProps) {
  return (
    <div className="space-y-5">
      <Card className="hero-panel" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.tableHero, { position: "center 58%" })}>
        <CardContent className="space-y-3 p-5">
          <p className="meta-label text-xs">Таблица</p>
          <h2 className="text-2xl font-semibold">{competition} · {seasonLabel}</h2>
          <p className="ui-note max-w-md text-sm">Новый сезон начнётся с чистого листа. Таблица появится после первого тура.</p>
        </CardContent>
      </Card>

      <Card className="barca-panel border-accent/20">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2 text-xs ui-note">
            {[
              ["ucl", "Лига чемпионов"],
              ["uel", "Лига Европы"],
              ["uecl", "Лига конференций"],
              ["relegation", "Вылет"],
            ].map(([zone, label]) => (
              <div key={zone} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${getZoneClassName(zone as LeagueStanding["zone"])}`} />
                {label}
              </div>
            ))}
          </div>

          {!standings.length ? <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center"><p className="text-xl font-semibold">Таблица 2026/27 пока пуста</p><p className="ui-note mt-2 text-sm">Старые данные прошлого сезона удалены. Позиции обновятся после сыгранных матчей.</p></div> : <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="meta-label grid grid-cols-[10px_48px_minmax(220px,1fr)_48px_48px_48px_48px_56px_56px_56px_56px] items-center gap-3 border-b border-white/10 px-2 pb-3 text-[11px]">
                <div />
                <div>#</div>
                <div>Клуб</div>
                <div>И</div>
                <div>В</div>
                <div>Н</div>
                <div>П</div>
                <div>О</div>
                <div>ЗМ</div>
                <div>ПМ</div>
                <div>РМ</div>
              </div>

              {standings.map((team) => {
                const resolvedBadge = getTeamBadgePath(team.team_name, team.badge_url);

                return (
                  <div
                    key={team.id}
                    className={`grid grid-cols-[10px_48px_minmax(220px,1fr)_48px_48px_48px_48px_56px_56px_56px_56px] items-center gap-3 border-b border-white/10 px-2 py-3 last:border-b-0 ${
                      team.team_name === "Барселона" ? "bg-white/[0.035]" : ""
                    }`}
                  >
                    <div className={`h-12 rounded-full ${getZoneClassName(team.zone)}`} title={getZoneLabel(team.zone)} />
                    <div className="ui-table-strong text-lg">{team.position}</div>
                    <div className="flex items-center gap-3">
                      <div
                        className="club-avatar bg-cover bg-center"
                        style={resolvedBadge ? { backgroundImage: `url(${resolvedBadge})` } : undefined}
                      >
                        {resolvedBadge ? null : getInitials(team.team_name)}
                      </div>
                      <div>
                        <p className="ui-table-strong font-medium">{team.team_name}</p>
                        <p className="ui-note mt-1 text-xs">{getZoneLabel(team.zone)}</p>
                      </div>
                    </div>
                    <div className="ui-table-cell">{team.played}</div>
                    <div className="ui-table-cell">{team.wins}</div>
                    <div className="ui-table-cell">{team.draws}</div>
                    <div className="ui-table-cell">{team.losses}</div>
                    <div className="ui-table-strong text-lg">{team.points}</div>
                    <div className="ui-table-cell">{team.goals_for}</div>
                    <div className="ui-table-cell">{team.goals_against}</div>
                    <div className="ui-table-cell font-medium">{team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}</div>
                  </div>
                );
              })}
            </div>
          </div>}
        </CardContent>
      </Card>
    </div>
  );
}
