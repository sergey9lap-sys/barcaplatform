"use client";

import { BrainCircuit, Crosshair, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { defaultMasteryTracks, getMasteryLevel, getOverallXp } from "@/lib/community/mastery";
import { loadMasteryTracks } from "@/lib/community/mastery-storage";

export function FootballIntelligenceProfile() {
  const [tracks, setTracks] = useState(defaultMasteryTracks);
  useEffect(() => { void loadMasteryTracks().then(setTracks); }, []);
  const totalXp = useMemo(() => getOverallXp(tracks), [tracks]);
  const accountLevel = Math.floor(totalXp / 750) + 1;
  const nextLevelProgress = Math.round(((totalXp % 750) / 750) * 100);

  return (
    <Card className="barca-panel overflow-hidden border-accent/20">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-blue-300" /><p className="meta-label text-xs">Футбольный интеллект</p></div>
            <h3 className="mt-2 text-2xl font-semibold">Уровень {accountLevel} · Тактический архитектор</h3>
            <p className="ui-note mt-2 max-w-2xl text-sm">Общий уровень складывается из проверенных результатов во всех режимах. Ошибка не отнимает XP, но влияет на точность конкретного навыка.</p>
          </div>
          <Badge variant="accent">{totalXp.toLocaleString("ru-RU")} XP</Badge>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-xs"><span className="ui-note">До уровня {accountLevel + 1}</span><span className="ui-value">{750 - (totalXp % 750)} XP</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#2f72ff] via-[#6940c7] to-[#bd234f]" style={{ width: `${nextLevelProgress}%` }} /></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track) => {
            const accuracy = track.attempts ? Math.round((track.correct / track.attempts) * 100) : 0;
            const progress = ((track.xp % 250) / 250) * 100;
            return (
              <div key={track.key} className="ui-data-card transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="ui-value font-semibold">{track.title}</p><p className="ui-note mt-1 text-xs">{track.description}</p></div>
                  <span className="rounded-full border border-blue-300/20 bg-blue-400/10 px-2 py-1 text-xs text-blue-100">ур. {getMasteryLevel(track.xp)}</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-rose-500" style={{ width: `${progress}%` }} /></div>
                <div className="mt-3 flex justify-between text-xs"><span className="ui-note">{track.xp} XP</span><span className="ui-value">Точность {accuracy}%</span></div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Rule icon={ShieldCheck} title="Только подтверждённое" text="XP начисляется после официального результата." />
          <Rule icon={Crosshair} title="Без штрафа XP" text="Ошибки меняют точность, прогресс не сгорает." />
          <Rule icon={Sparkles} title="Без спама" text="Комментарии, клики и покупки XP не дают." />
        </div>
      </CardContent>
    </Card>
  );
}

function Rule({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><Icon className="h-4 w-4 text-rose-300" /><p className="ui-value mt-3 text-sm font-semibold">{title}</p><p className="ui-note mt-1 text-xs">{text}</p></div>;
}
