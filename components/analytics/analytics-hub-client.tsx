"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityConsensus } from "@/components/community/community-consensus";
import { ExplainYourTake } from "@/components/community/explain-your-take";
import type { AnalyticsPlayerRecord } from "@/types/database";

const metricLabels = [
  ["technique", "Техника"],
  ["pressure_play", "Игра под давлением"],
  ["pressing", "Прессинг"],
  ["positional_discipline", "Позиционная дисциплина"],
  ["intelligence", "Интеллект"],
  ["mentality", "Ментальность"],
  ["coach_compatibility", "Совместимость с тренером"],
  ["barca_compatibility", "Совместимость с Барселоной"],
] as const;

export function AnalyticsHubClient({ players }: { players: AnalyticsPlayerRecord[] }) {
  const [selectedId, setSelectedId] = useState(players[0]?.id ?? "");
  const selected = players.find((player) => player.id === selectedId) ?? players[0];
  const barcaFitIndex = Math.round(players.reduce((sum, player) => sum + player.barca_compatibility, 0) / players.length);
  const coachFitIndex = Math.round(players.reduce((sum, player) => sum + player.coach_compatibility, 0) / players.length);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <IndexCard label="Индекс совместимости с Барсой" value={barcaFitIndex} />
        <IndexCard label="Подход под тренера" value={coachFitIndex} />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Игроки и цели</h2>
          <Badge variant="accent">Все функции открыты</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {players.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => setSelectedId(player.id)}
              className={selectedId === player.id ? "spotlight-strip text-left" : "soft-panel p-4 text-left"}
            >
              <p className="meta-label text-xs">{player.source_label} · {player.position}</p>
              <p className="ui-value mt-2 text-lg font-semibold">{player.name}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <CompactMetric label="Тренер" value={player.coach_compatibility} />
                <CompactMetric label="Барса" value={player.barca_compatibility} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <Card className="barca-panel border-accent/15">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="meta-label text-xs">Аналитическая карточка</p>
              <h3 className="mt-2 text-2xl font-semibold">{selected.name}</h3>
              <p className="ui-note mt-1 text-sm">{selected.source_label} · {selected.position}</p>
            </div>

            <div className="grid gap-3">
              {metricLabels.map(([key, label]) => (
                <ProgressRow key={key} label={label} value={selected[key]} />
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="meta-label text-xs">Общий вывод</p>
              <p className="ui-note mt-2 text-sm">{selected.conclusion}</p>
            </div>
            <CommunityConsensus
              options={[
                { label: "Подходит системе", votes: selected.coach_compatibility },
                { label: "Спорный вариант", votes: Math.max(8, 100 - selected.coach_compatibility) },
                { label: "Не подходит", votes: selected.coach_compatibility < 72 ? 31 : 9 },
              ]}
            />
            <ExplainYourTake targetType="analytics" targetId={selected.id} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function IndexCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="soft-panel">
      <CardContent className="p-4">
        <p className="meta-label text-xs">{label}</p>
        <p className="ui-value mt-2 text-3xl font-semibold">{value}/100</p>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-gradient-to-r from-[#397cff] to-[#d23b6d]" style={{ width: `${value}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

function CompactMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
      <p className="meta-label text-[10px]">{label}</p>
      <p className="ui-value mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="ui-data-card">
      <div className="flex items-center justify-between gap-3">
        <p className="ui-value text-sm font-semibold">{label}</p>
        <p className="meta-label text-xs">{value}/100</p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#397cff] to-[#d23b6d]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
