import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMatchDate } from "@/lib/format";
import type { Match } from "@/types/database";

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const isFinished = match.status === "finished";

  return (
    <Card className="barca-panel overflow-hidden border-accent/15">
      <CardContent className="space-y-4 p-5">
        <div className="-mx-5 -mt-5 h-1.5 bg-gradient-to-r from-[#194ac2] via-[#265fdd] to-[#8f173f]" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="meta-label text-xs">{match.competition}</p>
            <h3 className="mt-2 text-lg font-semibold">
              {match.home_team} — {match.away_team}
            </h3>
            <p className="mt-1 text-sm text-blue-100/70">{match.venue}</p>
          </div>
          <Badge variant={isFinished ? "primary" : "accent"}>{isFinished ? "Завершён" : "Открыт"}</Badge>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-blue-100/75">{formatMatchDate(match.kickoff_at)}</p>
            {isFinished ? (
              <p className="mt-1 text-base font-semibold">
                Итоговый счёт {match.home_score} - {match.away_score}
              </p>
            ) : null}
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href={`/matches/${match.id}`}>{isFinished ? "Детали" : "Прогноз"}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
