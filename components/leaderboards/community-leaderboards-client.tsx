"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { calculateLevel, getPrimaryRole } from "@/lib/community/gamification";
import { mockCommunityUsers } from "@/lib/mocks/community-users";
import type { CommunityUserRecord } from "@/types/database";

type TabId = "predictions" | "analysts" | "scouts" | "transfers" | "la_masia" | "overall";

const tabs: { id: TabId; label: string }[] = [
  { id: "predictions", label: "Прогнозисты" },
  { id: "analysts", label: "Аналитики" },
  { id: "scouts", label: "Скауты" },
  { id: "transfers", label: "Трансферы" },
  { id: "la_masia", label: "La Masia" },
  { id: "overall", label: "Общий рейтинг" },
];

export function CommunityLeaderboardsClient() {
  const [activeTab, setActiveTab] = useState<TabId>("overall");
  const users = useMemo(() => rankUsers(activeTab), [activeTab]);

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

      <Card className="barca-panel border-accent/15">
        <CardContent className="space-y-3 p-4">
          {users.map((user, index) => (
            <LeaderboardRow key={user.id} user={user} place={index + 1} metric={getMetric(activeTab, user)} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function rankUsers(tab: TabId) {
  return [...mockCommunityUsers].sort((a, b) => getMetric(tab, b).value - getMetric(tab, a).value);
}

function getMetric(tab: TabId, user: CommunityUserRecord) {
  switch (tab) {
    case "predictions":
      return { label: "точность", value: user.prediction_accuracy };
    case "analysts":
      return { label: "аналитика", value: user.analyst_reputation };
    case "scouts":
      return { label: "скаутинг", value: user.scout_reputation };
    case "transfers":
      return { label: "трансферы", value: user.transfer_reputation };
    case "la_masia":
      return { label: "follows", value: user.la_masia_follows };
    default:
      return { label: "points", value: user.points };
  }
}

function LeaderboardRow({ user, place, metric }: { user: CommunityUserRecord; place: number; metric: { label: string; value: number } }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Badge variant={place <= 3 ? "accent" : "default"}>#{place}</Badge>
        <div className="club-avatar h-11 w-11 shrink-0 rounded-2xl text-xs">{user.avatar}</div>
        <div className="min-w-0">
          <p className="ui-value truncate text-sm font-semibold">{user.username}</p>
          <p className="ui-note mt-1 text-xs">{getPrimaryRole(user)} · level {calculateLevel(user.xp)}</p>
          <div className="mt-2 flex gap-1">
            {user.badges.slice(0, 3).map((badge) => (
              <span key={badge} className="h-2 w-2 rounded-full bg-[#d23b6d]" title={badge} />
            ))}
          </div>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="ui-value text-sm font-semibold">{metric.value}</p>
        <p className="meta-label text-[10px]">{metric.label}</p>
      </div>
    </div>
  );
}
