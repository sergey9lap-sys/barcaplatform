import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockStreamPicks } from "@/lib/mocks/community";

export function StreamPicks({ compact = false }: { compact?: boolean }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-title">Выбор для эфира</h2>
        <Badge variant="primary">Premium скоро</Badge>
      </div>
      <Card className="soft-panel">
        <CardContent className="space-y-3 p-4">
          <div>
            <p className="meta-label text-xs">Мнение может попасть на стрим</p>
            <p className="ui-note mt-2 text-sm">
              Оставляй составы, прогнозы и аналитику — лучшие мнения будут разбираться на стриме.
            </p>
          </div>
          {mockStreamPicks.slice(0, compact ? 2 : mockStreamPicks.length).map((pick) => (
            <div key={pick.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="meta-label text-xs">{pick.user} · {formatType(pick.type)}</p>
                  <p className="ui-value mt-1 text-sm font-semibold">{pick.title}</p>
                  <p className="ui-note mt-1 text-xs">{pick.text}</p>
                </div>
                <Badge variant={pick.status === "selected_for_stream" ? "accent" : "default"}>{formatStatus(pick.status)}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function formatType(type: string) {
  return type === "la_masia" ? "La Masia" : type === "transfer" ? "Трансфер" : type === "analytics" ? "Аналитика" : "Состав";
}

function formatStatus(status: string) {
  if (status === "selected_for_stream") return "На эфир";
  if (status === "discussed") return "Обсудили";
  return "В подборке";
}
