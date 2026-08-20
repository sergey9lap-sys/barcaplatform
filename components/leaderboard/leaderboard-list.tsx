import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/database";

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  compact?: boolean;
}

export function LeaderboardList({ entries, currentUserId, compact = false }: LeaderboardListProps) {
  return (
    <Card className="barca-panel border-accent/15">
      <CardHeader>
        <CardTitle>{compact ? "Топ болельщиков" : "Рейтинг"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length ? (
          entries.map((entry, index) => {
            const active = entry.id === currentUserId;
            const isTopThree = index < 3;

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-4 py-3",
                  active
                    ? "border-primary/45 bg-gradient-to-r from-[#173b86]/60 to-[#8a173f]/45 shadow-glow"
                    : isTopThree
                      ? "border-accent/25 bg-gradient-to-r from-[#123576]/45 to-[#6e1636]/30"
                      : "border-blue-400/10 bg-gradient-to-r from-[#0f2250]/40 to-[#381229]/25",
                )}
              >
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "primary" : isTopThree ? "accent" : "default"}>#{index + 1}</Badge>
                  <div>
                    <p className="text-sm font-medium text-[#e2c1cb]">{entry.display_name || entry.email}</p>
                    {!compact ? <p className="text-sm text-blue-100/60">{entry.email}</p> : null}
                  </div>
                </div>
                <p className="ui-value text-sm font-semibold">{entry.total_points} очков</p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-blue-100/70">Пока нет участников рейтинга. Добавьте пользователей и прогнозы.</p>
        )}
      </CardContent>
    </Card>
  );
}
