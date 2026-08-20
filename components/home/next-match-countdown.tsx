"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import type { Match } from "@/types/database";
import { formatMatchDate } from "@/lib/format";

interface NextMatchCountdownProps {
  matches: Match[];
}

function getTimeParts(diffMs: number) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function NextMatchCountdown({ matches }: NextMatchCountdownProps) {
  const upcomingMatches = useMemo(
    () =>
      [...matches]
        .filter((match) => match.status === "upcoming")
        .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime()),
    [matches],
  );

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const referenceNow = now ?? 0;
  const nextMatch = upcomingMatches.find((match) => new Date(match.kickoff_at).getTime() > referenceNow) ?? null;

  if (!nextMatch) {
    return null;
  }

  const diffMs = now === null ? 0 : new Date(nextMatch.kickoff_at).getTime() - now;
  const { days, hours, minutes, seconds } = getTimeParts(diffMs);

  return (
    <div
      className="barca-panel overflow-hidden border-primary/20"
      style={createPhotoPanelStyle(SECTION_BACKGROUNDS.homeCountdown, { overlay: "strong", position: "center 58%" })}
    >
      <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-transparent px-5 py-3">
        <p className="meta-label text-xs">До матча осталось</p>
      </div>
      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <h2 className="ui-value text-2xl font-semibold">
            {nextMatch.home_team} vs {nextMatch.away_team}
          </h2>
          <p className="ui-note text-sm">{nextMatch.competition}</p>
          <p className="ui-note text-sm">{formatMatchDate(nextMatch.kickoff_at)}</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "дней", value: days.toString() },
            { label: "часов", value: pad(hours) },
            { label: "минут", value: pad(minutes) },
            { label: "секунд", value: pad(seconds) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center shadow-glow"
            >
              <div className="ui-value text-2xl font-semibold">{item.value}</div>
              <div className="meta-label mt-1 text-[11px]">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="ui-note text-sm">После старта таймер автоматически переключится на следующую игру.</p>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/matches/${nextMatch.id}`}>К матчу</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
