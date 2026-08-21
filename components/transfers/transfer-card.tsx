import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDecision, formatRecommendation, formatRiskLevel, formatTransferDirection, formatTransferStatus } from "@/lib/transfers/format";
import type { TransferPredictionRecord, TransferRumor } from "@/types/database";
import { TransferPredictionForm } from "@/components/transfers/transfer-prediction-form";
import { CommunityConsensus } from "@/components/community/community-consensus";
import { ExplainYourTake } from "@/components/community/explain-your-take";
import { getPlayerAvatarPath } from "@/lib/assets";

interface TransferCardProps {
  rumor: TransferRumor;
  prediction?: TransferPredictionRecord | null;
  userId?: string | null;
  backendEnabled?: boolean;
}

export function TransferCard({
  rumor,
  prediction = null,
  userId = null,
  backendEnabled = false,
}: TransferCardProps) {
  const playerImage = getPlayerAvatarPath(rumor.player_name, rumor.image_url);
  return (
    <Card className="barca-panel border-accent/15">
      <CardHeader className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[.04]">{playerImage ? <img src={playerImage} alt={rumor.player_name} className="h-full w-full object-cover object-top" /> : <span className="grid h-full w-full place-items-center text-lg font-semibold">{rumor.player_name.slice(0, 2)}</span>}</div>
            <div>
            <p className="meta-label text-xs">{rumor.window_label} · {formatTransferDirection(rumor.direction)}</p>
            <CardTitle className="mt-2 text-xl">{rumor.player_name}</CardTitle>
            <p className="ui-note mt-1 text-sm">
              {[rumor.position, rumor.age ? `${rumor.age} лет` : null, rumor.estimated_price].filter(Boolean).join(" · ")}
            </p>
            </div>
          </div>
          <Badge variant={rumor.status === "active" ? "accent" : "primary"}>
            {formatTransferStatus(rumor.status)}
          </Badge>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div>
            <p className="meta-label text-xs">Сейчас</p>
            <p className="ui-value mt-1 text-sm font-medium">{rumor.current_club}</p>
          </div>
          <div className="text-lg text-blue-200/80">→</div>
          <div className="text-right">
            <p className="meta-label text-xs">Куда</p>
            <p className="ui-value mt-1 text-sm font-medium">{rumor.target_club}</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-7">
          <div className="ui-data-card">
            <p className="meta-label text-xs">Вероятность</p>
            <p className="ui-value mt-2 text-lg font-semibold">{rumor.probability_score ?? "—"}/10</p>
          </div>
          <div className="ui-data-card">
            <p className="meta-label text-xs">Полезность</p>
            <p className="ui-value mt-2 text-lg font-semibold">{rumor.usefulness_score ?? "—"}/10</p>
          </div>
          <div className="ui-data-card">
            <p className="meta-label text-xs">Решение</p>
            <p className="ui-value mt-2 text-sm font-semibold">{formatRecommendation(rumor.recommendation, rumor.direction)}</p>
          </div>
          <ScoreBadge
            title="Под Барсу"
            value={rumor.barca_fit_score ?? 0}
            caption="Насколько игрок подходит Барселоне как клубу: стиль, техника, футбольный интеллект, характер, ДНК клуба и совместимость с раздевалкой."
          />
          <ScoreBadge
            title="Под тренера"
            value={rumor.coach_system_fit_score ?? 0}
            caption="Насколько игрок подходит под систему текущего тренера, требования к прессингу, роли, темпу, дисциплине и игре с мячом."
          />
          <div className="ui-data-card">
            <p className="meta-label text-xs">Риск</p>
            <p className="ui-value mt-2 text-lg font-semibold">{formatRiskLevel(rumor.risk_level)}</p>
            <p className="ui-note mt-1 text-xs">Зарплатный риск: {rumor.salary_risk ?? "medium"}</p>
          </div>
          <div className="ui-data-card">
            <p className="meta-label text-xs">Решение сообщества</p>
            <p className="ui-value mt-2 text-sm font-semibold">{formatDecision(rumor.decision, rumor.direction)}</p>
            <p className="ui-note mt-1 text-xs">{rumor.community_votes ?? 0} голосов</p>
          </div>
        </div>
        {rumor.short_reason || rumor.notes ? <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-5 ui-note">{rumor.short_reason ?? rumor.notes}</div> : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <TransferPredictionForm
          rumor={rumor}
          initialPrediction={prediction}
          userId={userId}
          backendEnabled={backendEnabled}
        />
        <details className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
          <summary className="cursor-pointer text-sm font-semibold text-blue-100">Мнение сообщества и обсуждение</summary>
          <div className="mt-3 space-y-3">
            <CommunityConsensus
              options={rumor.direction === "incoming" ? [{ label: "Купить", votes: rumor.decision === "buy" ? 58 : 31 }, { label: "Не покупать", votes: 14 }, { label: "Следить", votes: rumor.decision === "monitor" ? 42 : 21 }, { label: "Слишком рискованно", votes: rumor.risk_level === "high" ? 37 : 12 }] : rumor.direction === "loan" ? [{ label: "Вернуть", votes: 24 }, { label: "Продать", votes: 16 }, { label: "Оставить в аренде", votes: 31 }, { label: "Дать шанс на сборах", votes: 44 }] : [{ label: "Продать", votes: rumor.decision === "sell" ? 49 : 22 }, { label: "Оставить", votes: rumor.decision === "keep" ? 45 : 19 }, { label: "Следить", votes: 21 }, { label: "Слишком рискованно", votes: 13 }]}
            />
            <ExplainYourTake targetType="transfer" targetId={rumor.id} />
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

function ScoreBadge({ title, value, caption }: { title: string; value: number; caption: string }) {
  return (
    <div className="ui-data-card" title={caption}>
      <p className="meta-label text-xs">{title}</p>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#397cff] to-[#d23b6d]"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <p className="ui-value mt-2 text-lg font-semibold">{value || "—"}/100</p>
      <span className="sr-only">{caption}</span>
    </div>
  );
}
