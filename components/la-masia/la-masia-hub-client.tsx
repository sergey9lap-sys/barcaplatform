"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, Eye, ShieldCheck, Sparkles, Users } from "lucide-react";

import { CommunityConsensus } from "@/components/community/community-consensus";
import { ExplainYourTake } from "@/components/community/explain-your-take";
import { Badge } from "@/components/ui/badge";
import type { LaMasiaPlayerRecord, LaMasiaStatus, LaMasiaTeamLevel } from "@/types/database";

type TabId = "talents" | "atletic" | "u19" | "preseason" | "watchlist";
type Verdict = "Готов к основе" | "Взять на сборы" | "Нужна аренда" | "Пока рано";

const tabs: { id: TabId; label: string }[] = [
  { id: "talents", label: "Все таланты" },
  { id: "atletic", label: "Барса Атлетик" },
  { id: "u19", label: "U19" },
  { id: "preseason", label: "Кандидаты на сборы" },
  { id: "watchlist", label: "Мой список" },
];

const verdicts: Verdict[] = ["Готов к основе", "Взять на сборы", "Нужна аренда", "Пока рано"];

export function LaMasiaHubClient({ players }: { players: LaMasiaPlayerRecord[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("talents");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState(players[0]?.id ?? "");
  const [playerVerdicts, setPlayerVerdicts] = useState<Record<string, Verdict>>({});

  useEffect(() => {
    const savedWatchlist = window.localStorage.getItem("barca-la-masia-watchlist");
    const savedVerdicts = window.localStorage.getItem("barca-la-masia-verdicts");
    setWatchlist(savedWatchlist ? JSON.parse(savedWatchlist) : []);
    setPlayerVerdicts(savedVerdicts ? JSON.parse(savedVerdicts) : {});
  }, []);

  const visiblePlayers = useMemo(() => {
    const ordered = [...players].sort((a, b) => (b.priority ?? b.potential_score) - (a.priority ?? a.potential_score));
    if (activeTab === "watchlist") return ordered.filter((player) => watchlist.includes(player.id));
    if (activeTab === "atletic") return ordered.filter((player) => player.team_level === "Barca Atletic");
    if (activeTab === "u19") return ordered.filter((player) => player.team_level === "U19");
    if (activeTab === "preseason") return ordered.filter((player) => player.status === "preseason" || player.status === "first_team_candidate");
    return ordered;
  }, [activeTab, players, watchlist]);

  const selectedPlayer = players.find((player) => player.id === selectedId) ?? visiblePlayers[0] ?? players[0];
  const firstTeamCandidates = players.filter((player) => player.status === "first_team_candidate").length;
  const preseasonCandidates = players.filter((player) => player.status === "preseason").length;

  function toggleWatch(playerId: string) {
    setWatchlist((current) => {
      const next = current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId];
      window.localStorage.setItem("barca-la-masia-watchlist", JSON.stringify(next));
      return next;
    });
  }

  function saveVerdict(playerId: string, verdict: Verdict) {
    setPlayerVerdicts((current) => {
      const next = { ...current, [playerId]: verdict };
      window.localStorage.setItem("barca-la-masia-verdicts", JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Сводка по академии">
        <SummaryItem icon={Users} value={players.length} label="игроков под наблюдением" />
        <SummaryItem icon={ShieldCheck} value={firstTeamCandidates} label="ближе всего к основе" />
        <SummaryItem icon={Sparkles} value={preseasonCandidates} label="кандидатов на сборы" />
      </section>

      <div className="no-scrollbar overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2" role="tablist" aria-label="Фильтр игроков Ла Масии">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "ui-tab ui-tab-active" : "ui-tab ui-tab-idle bg-white/[0.03]"}
            >
              {tab.label}{tab.id === "watchlist" && watchlist.length ? ` · ${watchlist.length}` : ""}
            </button>
          ))}
        </div>
      </div>

      {visiblePlayers.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiblePlayers.map((player) => (
            <TalentCard
              key={player.id}
              player={player}
              selected={selectedPlayer?.id === player.id}
              watched={watchlist.includes(player.id)}
              verdict={playerVerdicts[player.id]}
              onSelect={() => setSelectedId(player.id)}
              onToggleWatch={() => toggleWatch(player.id)}
            />
          ))}
        </div>
      ) : (
        <div className="soft-panel p-6 text-sm text-blue-100/75">
          Ваш список пока пуст. Нажмите «Следить» на карточке любого таланта.
        </div>
      )}

      {selectedPlayer ? (
        <PlayerDesk
          player={selectedPlayer}
          verdict={playerVerdicts[selectedPlayer.id]}
          onVerdict={(verdict) => saveVerdict(selectedPlayer.id, verdict)}
        />
      ) : null}
    </div>
  );
}

function TalentCard({
  player,
  selected,
  watched,
  verdict,
  onSelect,
  onToggleWatch,
}: {
  player: LaMasiaPlayerRecord;
  selected: boolean;
  watched: boolean;
  verdict?: Verdict;
  onSelect: () => void;
  onToggleWatch: () => void;
}) {
  return (
    <article className={`group overflow-hidden rounded-2xl border bg-[#0b1738] transition duration-300 ${selected ? "border-blue-400/55 shadow-[0_18px_48px_rgba(8,18,52,0.38)]" : "border-white/10 hover:-translate-y-1 hover:border-blue-400/35"}`}>
      <button type="button" onClick={onSelect} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#07132f]">
          {player.image_url ? (
            <Image
              src={player.image_url}
              alt={player.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover object-top transition duration-500 group-hover:scale-[1.025]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#081532] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <Badge variant={statusVariant(player.status)}>{formatStatus(player.status)}</Badge>
            <span className="rounded-full bg-[#08142f]/85 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-md">
              потенциал {player.potential_score}
            </span>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-blue-200/70">
            {formatTeamLevel(player.team_level)} · {formatAge(player.age)}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{player.name}</h3>
          <p className="mt-1 text-sm text-blue-100/72">{player.position}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <CompactMetric label="Основа" value={player.first_team_chance} />
            <CompactMetric label="Флик" value={player.coach_system_fit_score} />
            <CompactMetric label="ДНК" value={player.barca_fit_score} />
          </div>
          {verdict ? <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-200"><Check className="h-3.5 w-3.5" />Ваш вердикт: {verdict}</p> : null}
        </div>
      </button>

      <div className="flex gap-2 border-t border-white/10 p-3">
        <button type="button" onClick={onSelect} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.055] px-3 py-2.5 text-sm font-semibold text-blue-50 transition hover:bg-white/[0.09]">
          <Eye className="h-4 w-4" /> Открыть досье
        </button>
        <button
          type="button"
          onClick={onToggleWatch}
          aria-label={watched ? `Убрать ${player.name} из списка` : `Следить за ${player.name}`}
          className={`rounded-xl px-3 transition ${watched ? "bg-blue-500 text-white" : "bg-white/[0.055] text-blue-100 hover:bg-white/[0.09]"}`}
        >
          <Bookmark className={`h-4 w-4 ${watched ? "fill-current" : ""}`} />
        </button>
      </div>
    </article>
  );
}

function PlayerDesk({ player, verdict, onVerdict }: { player: LaMasiaPlayerRecord; verdict?: Verdict; onVerdict: (verdict: Verdict) => void }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-blue-400/20 bg-[#0a1634] shadow-[0_22px_70px_rgba(3,10,30,0.32)]">
      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="relative min-h-72 overflow-hidden lg:min-h-full">
          {player.image_url ? <Image src={player.image_url} alt={player.name} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-top" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#091634] via-[#091634]/10 to-transparent lg:bg-gradient-to-r" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-sm font-semibold text-blue-100/75">Скаутское досье</p>
            <h2 className="mt-1 text-3xl font-semibold text-white">{player.name}</h2>
            <p className="mt-1 text-sm text-blue-100/75">{player.position}</p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <p className="max-w-2xl text-sm leading-6 text-blue-100/78">{player.short_description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Потенциал" value={player.potential_score} />
            <Metric label="Шанс первой команды" value={player.first_team_chance} />
            <Metric label="Совместимость с Фликом" value={player.coach_system_fit_score} />
            <Metric label="Совместимость с Барсой" value={player.barca_fit_score} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-white">Ваше решение по игроку</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {verdicts.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onVerdict(item)}
                  className={`rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${verdict === item ? "bg-gradient-to-br from-blue-600 to-[#a11249] text-white shadow-[0_10px_26px_rgba(19,66,160,0.25)]" : "bg-white/[0.055] text-blue-100 hover:bg-white/[0.09]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <CommunityConsensus options={consensusOptions(player)} />
          <ExplainYourTake targetType="la_masia" targetId={player.id} />
        </div>
      </div>
    </section>
  );
}

function SummaryItem({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-200"><Icon className="h-5 w-5" /></span>
      <div><p className="text-xl font-semibold tabular-nums text-white">{value}</p><p className="text-xs text-blue-100/68">{label}</p></div>
    </div>
  );
}

function CompactMetric({ label, value }: { label: string; value: number }) {
  return <div><p className="text-[11px] text-blue-100/55">{label}</p><p className="mt-0.5 text-sm font-semibold tabular-nums text-blue-50">{value}</p></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/[0.045] p-3">
      <div className="flex items-center justify-between gap-3"><p className="text-xs text-blue-100/65">{label}</p><p className="text-sm font-semibold tabular-nums text-white">{value}</p></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#397cff] to-[#d23b6d]" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function consensusOptions(player: LaMasiaPlayerRecord) {
  return [
    { label: "Готов к основе", votes: player.status === "first_team_candidate" ? 46 : 18 },
    { label: "Взять на сборы", votes: player.status === "preseason" ? 51 : 29 },
    { label: "Нужна аренда", votes: player.age >= 19 ? 32 : 14 },
    { label: "Пока рано", votes: player.age <= 17 ? 35 : 11 },
  ];
}

function statusVariant(status: LaMasiaStatus): "accent" | "primary" | "default" {
  return status === "first_team_candidate" ? "accent" : status === "preseason" ? "primary" : "default";
}

function formatTeamLevel(level: LaMasiaTeamLevel) {
  return level === "Barca Atletic" ? "Барса Атлетик" : level === "U19" ? "Юношеская команда U19" : "Ла Масия";
}

function formatStatus(status: LaMasiaStatus) {
  switch (status) {
    case "preseason": return "На сборах";
    case "loan_candidate": return "Нужна аренда";
    case "first_team_candidate": return "Близко к основе";
    default: return "Под наблюдением";
  }
}

function formatAge(age: number) {
  const lastTwo = age % 100;
  const last = age % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${age} лет`;
  if (last === 1) return `${age} год`;
  if (last >= 2 && last <= 4) return `${age} года`;
  return `${age} лет`;
}
