"use client";

import { useMemo, useState } from "react";
import { Medal, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAccountLevel } from "@/lib/community/mastery";
import type { PublicLeaderboardEntry } from "@/types/database";

type TabId = "predictions" | "analysts" | "scouts" | "transfers" | "la_masia" | "overall";
const tabs: { id: TabId; label: string }[] = [
  { id: "predictions", label: "Прогнозисты" }, { id: "analysts", label: "Аналитики" },
  { id: "scouts", label: "Скауты" }, { id: "transfers", label: "Трансферы" },
  { id: "la_masia", label: "Ла Масия" }, { id: "overall", label: "Общий рейтинг" },
];

export function CommunityLeaderboardsClient({ entries }: { entries: PublicLeaderboardEntry[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("overall");
  const users = useMemo(() => [...entries].sort((a, b) => getMetric(activeTab, b).value - getMetric(activeTab, a).value), [activeTab, entries]);
  return <div className="space-y-5">
    <div className="no-scrollbar overflow-x-auto"><div className="flex min-w-max gap-2" role="tablist" aria-label="Направление рейтинга">
      {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "ui-tab ui-tab-active min-h-11" : "ui-tab ui-tab-idle min-h-11 bg-white/[0.03]"}>{tab.label}</button>)}
    </div></div>
    <Card className="barca-panel border-accent/15"><CardContent className="space-y-3 p-4">
      {users.length ? users.map((user, index) => <LeaderboardRow key={user.id} user={user} place={index + 1} metric={getMetric(activeTab, user)} />) : <div className="grid min-h-56 place-items-center px-5 py-10 text-center"><div><UsersRound className="mx-auto h-8 w-8 text-blue-200/70" /><h2 className="mt-4 text-xl font-semibold">Рейтинг только начинается</h2><p className="ui-note mt-2 max-w-md text-sm">После применения миграции 0021 здесь появятся реальные участники. Первые подтверждённые прогнозы сразу попадут в таблицу.</p></div></div>}
    </CardContent></Card>
  </div>;
}

function getMetric(tab: TabId, user: PublicLeaderboardEntry) {
  switch (tab) {
    case "predictions": return { label: "точность", value: user.prediction_accuracy, suffix: "%" };
    case "analysts": return { label: "опыт аналитика", value: user.analyst_reputation, suffix: "" };
    case "scouts": return { label: "опыт скаута", value: user.scout_reputation, suffix: "" };
    case "transfers": return { label: "опыт трансферов", value: user.transfer_reputation, suffix: "" };
    case "la_masia": return { label: "под наблюдением", value: user.la_masia_follows, suffix: "" };
    default: return { label: "очков", value: user.total_points, suffix: "" };
  }
}

function primaryRole(user: PublicLeaderboardEntry) {
  const roles = [[user.analyst_reputation, "Аналитик"], [user.scout_reputation, "Скаут"], [user.transfer_reputation, "Трансферный эксперт"], [user.tactical_reputation, "Тактический стратег"]] as const;
  return [...roles].sort((a, b) => b[0] - a[0])[0]?.[1] ?? "Начинающий кулес";
}

function LeaderboardRow({ user, place, metric }: { user: PublicLeaderboardEntry; place: number; metric: { label: string; value: number; suffix: string } }) {
  const initials = user.display_name.trim().slice(0, 2).toUpperCase() || "К";
  return <div className="flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"><div className="flex min-w-0 items-center gap-3"><Badge variant={place <= 3 ? "accent" : "default"}>{place <= 3 ? <Medal className="mr-1 h-3 w-3" /> : null}#{place}</Badge><div className="club-avatar h-11 w-11 shrink-0 overflow-hidden rounded-2xl text-xs" style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{user.avatar_url ? null : initials}</div><div className="min-w-0"><p className="ui-value truncate text-sm font-semibold">{user.display_name}</p><p className="ui-note mt-1 text-xs">{primaryRole(user)} · уровень {getAccountLevel(user.total_xp)}</p>{user.badges?.length ? <p className="mt-1 truncate text-[11px] text-rose-200/75">{user.badges.slice(0, 2).join(" · ")}</p> : null}</div></div><div className="shrink-0 text-right"><p className="ui-value text-sm font-semibold tabular-nums">{metric.value}{metric.suffix}</p><p className="meta-label text-[10px]">{metric.label}</p></div></div>;
}
