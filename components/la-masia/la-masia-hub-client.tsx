"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityConsensus } from "@/components/community/community-consensus";
import { ExplainYourTake } from "@/components/community/explain-your-take";
import type { LaMasiaPlayerRecord, LaMasiaStatus, LaMasiaTeamLevel } from "@/types/database";

type TabId = "talents" | "atletic" | "u19" | "preseason" | "watchlist";

const tabs: { id: TabId; label: string }[] = [
  { id: "talents", label: "Главные таланты" },
  { id: "atletic", label: "Барса Атлетик" },
  { id: "u19", label: "U19" },
  { id: "preseason", label: "Кандидаты на предсезонку" },
  { id: "watchlist", label: "Мой watchlist" },
];

const actionLabels = ["Следить за игроком", "Готов к основе", "Нужна аренда", "Взять на сборы", "Пока рано"] as const;

export function LaMasiaHubClient({ players }: { players: LaMasiaPlayerRecord[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("talents");
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("barca-la-masia-watchlist");
    setWatchlist(saved ? JSON.parse(saved) : []);
  }, []);

  const visiblePlayers = useMemo(() => {
    if (activeTab === "watchlist") {
      return players.filter((player) => watchlist.includes(player.id));
    }

    if (activeTab === "atletic") {
      return players.filter((player) => player.team_level === "Barca Atletic");
    }

    if (activeTab === "u19") {
      return players.filter((player) => player.team_level === "U19");
    }

    if (activeTab === "preseason") {
      return players.filter((player) => player.status === "preseason" || player.first_team_chance >= 75);
    }

    return [...players].sort((a, b) => b.potential_score - a.potential_score);
  }, [activeTab, players, watchlist]);

  function toggleWatch(playerId: string) {
    setWatchlist((current) => {
      const next = current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId];
      window.localStorage.setItem("barca-la-masia-watchlist", JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "ui-tab ui-tab-active" : "ui-tab ui-tab-idle bg-white/[0.03]"}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {visiblePlayers.map((player) => (
          <LaMasiaPlayerCard
            key={player.id}
            player={player}
            watched={watchlist.includes(player.id)}
            onToggleWatch={() => toggleWatch(player.id)}
          />
        ))}
        {!visiblePlayers.length ? (
          <Card className="soft-panel">
            <CardContent className="p-5 text-sm ui-note">Watchlist пока пуст. Добавьте игрока через действие “Следить за игроком”.</CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function LaMasiaPlayerCard({
  player,
  watched,
  onToggleWatch,
}: {
  player: LaMasiaPlayerRecord;
  watched: boolean;
  onToggleWatch: () => void;
}) {
  return (
    <Card className="barca-panel border-accent/15">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="meta-label text-xs">{formatTeamLevel(player.team_level)} · {player.position}</p>
            <h3 className="mt-2 text-xl font-semibold">{player.name}</h3>
            <p className="ui-note mt-1 text-sm">{player.age} лет · {formatStatus(player.status)}</p>
          </div>
          <Badge variant={watched ? "accent" : "primary"}>{watched ? "В watchlist" : "Скаутинг"}</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <Metric label="Потенциал" value={player.potential_score} />
          <Metric label="Шанс основы" value={player.first_team_chance} />
          <Metric label="Под тренера" value={player.coach_system_fit_score} />
          <Metric label="Под Барсу" value={player.barca_fit_score} />
        </div>

        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm ui-note">{player.short_description}</p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {actionLabels.map((action) => (
            <button
              key={action}
              type="button"
              onClick={action === "Следить за игроком" ? onToggleWatch : undefined}
              className={action === "Следить за игроком" && watched ? "spotlight-strip p-3 text-left text-sm font-semibold" : "soft-panel p-3 text-left text-sm ui-note"}
            >
              {action}
            </button>
          ))}
        </div>
        <CommunityConsensus
          options={[
            { label: "Готов к основе", votes: player.status === "first_team_candidate" ? 45 : 18 },
            { label: "Взять на сборы", votes: player.status === "preseason" ? 52 : 29 },
            { label: "Нужна аренда", votes: player.status === "loan_candidate" ? 41 : 16 },
            { label: "Пока рано", votes: player.age <= 17 ? 34 : 13 },
          ]}
        />
        <ExplainYourTake targetType="la_masia" targetId={player.id} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="ui-data-card">
      <p className="meta-label text-xs">{label}</p>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#397cff] to-[#d23b6d]" style={{ width: `${value}%` }} />
      </div>
      <p className="ui-value mt-2 text-lg font-semibold">{value}/100</p>
    </div>
  );
}

function formatTeamLevel(level: LaMasiaTeamLevel) {
  return level === "Barca Atletic" ? "Barça Atlètic" : level;
}

function formatStatus(status: LaMasiaStatus) {
  switch (status) {
    case "preseason":
      return "кандидат на сборы";
    case "loan_candidate":
      return "кандидат на аренду";
    case "first_team_candidate":
      return "кандидат в основу";
    default:
      return "наблюдать";
  }
}
