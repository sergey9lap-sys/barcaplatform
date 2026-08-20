import { Card, CardContent } from "@/components/ui/card";
import { formatTransferDirection } from "@/lib/transfers/format";
import type { TransferIdeaRecord } from "@/types/database";

interface TransferIdeaCardProps {
  idea: TransferIdeaRecord;
}

export function TransferIdeaCard({ idea }: TransferIdeaCardProps) {
  return (
    <Card className="soft-panel">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="meta-label text-xs">{formatTransferDirection(idea.direction)}</p>
            <p className="ui-value mt-2 text-lg font-semibold">{idea.player_name}</p>
            <p className="ui-note mt-1 text-sm">
              {idea.current_club} → {idea.target_club}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right text-xs ui-note">
            <p className="meta-label text-xs">Автор</p>
            <p className="ui-value mt-1 text-sm font-semibold">{idea.author_name ?? "Болельщик"}</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          <div className="ui-data-card">
            <p className="meta-label text-xs">Стоимость</p>
            <p className="ui-value mt-2 font-semibold">{idea.estimated_fee_millions ? `${idea.estimated_fee_millions} млн` : "Не указана"}</p>
          </div>
          <div className="ui-data-card">
            <p className="meta-label text-xs">Полезность</p>
            <p className="ui-value mt-2 font-semibold">{idea.usefulness_score ?? "—"}/10</p>
          </div>
          <div className="ui-data-card">
            <p className="meta-label text-xs">Желание</p>
            <p className="ui-value mt-2 font-semibold">{idea.desire_score ?? "—"}/10</p>
          </div>
          <div className="ui-data-card">
            <p className="meta-label text-xs">Вероятность</p>
            <p className="ui-value mt-2 font-semibold">{idea.probability_score ?? "—"}/10</p>
          </div>
        </div>

        {idea.notes ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm ui-note">{idea.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
