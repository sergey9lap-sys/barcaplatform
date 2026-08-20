import { Card, CardContent } from "@/components/ui/card";
import type { CommunityConsensusOption } from "@/types/database";

export function CommunityConsensus({ options }: { options: CommunityConsensusOption[] }) {
  const total = options.reduce((sum, option) => sum + option.votes, 0) || 1;
  const winner = [...options].sort((a, b) => b.votes - a.votes)[0];

  return (
    <Card className="soft-panel">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="meta-label text-xs">Мнение сообщества</p>
            <p className="ui-value mt-1 text-lg font-semibold">{winner?.label ?? "Пока нет решения"}</p>
          </div>
          <div className="rounded-2xl border border-accent/20 bg-accent/10 px-3 py-2 text-right">
            <p className="ui-value text-sm">{Math.round(((winner?.votes ?? 0) / total) * 100)}%</p>
            <p className="meta-label text-[10px]">лидер</p>
          </div>
        </div>
        <div className="space-y-2">
          {options.map((option) => {
            const percent = Math.round((option.votes / total) * 100);
            return (
              <div key={option.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="ui-note">{option.label}</span>
                  <span className="ui-value">{percent}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#397cff] to-[#d23b6d]" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
