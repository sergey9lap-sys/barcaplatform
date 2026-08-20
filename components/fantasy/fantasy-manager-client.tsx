"use client";

import { Crown, Lock, Save, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPlayerAvatarPath } from "@/lib/assets";
import type { Match, MatchPlayer } from "@/types/database";

const BUDGET = 50;
const STORAGE_PREFIX = "barca-fantasy-v1";
const starPrices: Record<string, number> = { "Ламин Ямаль": 14, "Рафинья": 13, "Педри": 12, "Родри": 12, "Дани Ольмо": 11, "Энтони Гордон": 10, "Карим Адейеми": 10, "Жоау Канселу": 9 };
const priceFor = (player: MatchPlayer) => starPrices[player.player_name] ?? (player.position === "GK" ? 6 : player.position === "DF" ? 7 : 8);

export function FantasyManagerClient({ match, players }: { match: Match; players: MatchPlayer[] }) {
  const key = `${STORAGE_PREFIX}:${match.id}`;
  const [selected, setSelected] = useState<string[]>([]);
  const [captain, setCaptain] = useState("");
  const [saved, setSaved] = useState(false);
  const locked = new Date() >= new Date(match.kickoff_at);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try { const value = JSON.parse(raw) as { selected?: string[]; captain?: string }; setSelected(value.selected ?? []); setCaptain(value.captain ?? ""); setSaved(true); } catch { localStorage.removeItem(key); }
  }, [key]);

  const squad = useMemo(() => players.filter((player) => player.position !== "COACH"), [players]);
  const spent = selected.reduce((sum, id) => { const player = squad.find((item) => item.id === id); return sum + (player ? priceFor(player) : 0); }, 0);
  const complete = selected.length === 5 && Boolean(captain);

  function toggle(player: MatchPlayer) {
    if (locked) return;
    const active = selected.includes(player.id);
    if (active) { setSelected((items) => items.filter((id) => id !== player.id)); if (captain === player.id) setCaptain(""); setSaved(false); return; }
    if (selected.length >= 5 || spent + priceFor(player) > BUDGET) return;
    setSelected((items) => [...items, player.id]); setSaved(false);
  }

  function save() {
    if (!complete || locked) return;
    localStorage.setItem(key, JSON.stringify({ matchId: match.id, selected, captain, budget: BUDGET, savedAt: new Date().toISOString(), lockedAt: match.kickoff_at }));
    setSaved(true);
  }

  return <div className="space-y-5">
    <Card className="barca-panel border-accent/20"><CardContent className="space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="meta-label text-xs">Следующий тур · пять любых позиций</p><h3 className="mt-2 text-2xl font-semibold">{match.home_team} — {match.away_team}</h3><p className="ui-note mt-2 text-sm">Состав закрывается ровно в момент начала матча. Капитан получает x2.</p></div><Badge variant={locked ? "default" : "accent"}>{locked ? "Состав закрыт" : new Date(match.kickoff_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Badge></div>
      <div className="grid grid-cols-3 gap-3"><Metric label="Игроки" value={`${selected.length}/5`} /><Metric label="Бюджет" value={`${spent}/${BUDGET}`} /><Metric label="Капитан" value={captain ? "выбран" : "—"} /></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{squad.map((player) => {
        const active = selected.includes(player.id); const avatar = getPlayerAvatarPath(player.player_name); const unavailable = !active && (selected.length >= 5 || spent + priceFor(player) > BUDGET);
        return <div key={player.id} className={`rounded-2xl border p-3 transition-all duration-200 ${active ? "border-rose-400/45 bg-gradient-to-br from-blue-600/20 to-rose-600/15" : "border-white/10 bg-white/[0.025]"} ${unavailable ? "opacity-45" : "hover:-translate-y-0.5 hover:border-blue-300/30"}`}>
          <button type="button" disabled={locked || unavailable} onClick={() => toggle(player)} className="flex w-full items-center gap-3 text-left"><div className="h-12 w-12 shrink-0 rounded-full bg-white/90 bg-contain bg-bottom bg-no-repeat" style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}>{avatar ? null : <span className="grid h-full place-items-center text-sm font-bold text-[#071229]">{player.player_name.slice(0, 1)}</span>}</div><div className="min-w-0 flex-1"><p className="ui-value truncate text-sm font-semibold">{player.player_name}</p><p className="ui-note mt-1 text-xs">{player.position} · {priceFor(player)} cr</p></div><span className={`h-5 w-5 rounded-full border ${active ? "border-rose-300 bg-rose-500 shadow-glow" : "border-white/25"}`} /></button>
          {active ? <button type="button" onClick={() => { setCaptain(player.id); setSaved(false); }} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${captain === player.id ? "border-amber-300/40 bg-amber-400/15 text-amber-100" : "border-white/10 bg-white/[0.03] text-blue-100/65"}`}><Crown className="h-3.5 w-3.5" />{captain === player.id ? "Капитан x2" : "Назначить капитаном"}</button> : null}
        </div>;
      })}</div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/15 p-4"><div className="flex items-center gap-2 text-sm ui-note">{locked ? <Lock className="h-4 w-4" /> : <Users className="h-4 w-4" />}{complete ? "Команда готова" : "Выберите 5 игроков и капитана"}</div><Button disabled={!complete || locked} onClick={save}><Save className="mr-2 h-4 w-4" />{saved ? "Состав сохранён" : "Сохранить состав"}</Button></div>
    </CardContent></Card>
    <div className="grid gap-4 lg:grid-cols-3"><League title="Недельная лига" place="#14" players="1 284" /><League title="Месячная лига" place="#39" players="4 610" /><League title="Приватная лига" place="Создать" players="для друзей" /></div>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="ui-data-card"><p className="meta-label text-[10px]">{label}</p><p className="ui-value mt-2 text-lg font-semibold">{value}</p></div>; }
function League({ title, place, players }: { title: string; place: string; players: string }) { return <Card className="soft-panel"><CardContent className="p-5"><p className="meta-label text-xs">{title}</p><div className="mt-3 flex items-end justify-between"><p className="text-2xl font-semibold">{place}</p><p className="ui-note text-xs">{players}</p></div></CardContent></Card>; }
