"use client";

import { useMemo, useState } from "react";

import { TransferCard } from "@/components/transfers/transfer-card";
import { TransferIdeaCard } from "@/components/transfers/transfer-idea-card";
import { TransferIdeaForm } from "@/components/transfers/transfer-idea-form";
import { Card, CardContent } from "@/components/ui/card";
import type { LoanPlayerRecord, TransferIdeaRecord, TransferPredictionRecord, TransferRumor } from "@/types/database";

type TabId = "official" | "rumors" | "outgoing" | "ideas" | "community";

const tabs: { id: TabId; label: string }[] = [
  { id: "official", label: "Официально" },
  { id: "rumors", label: "Слухи" },
  { id: "outgoing", label: "На выход" },
  { id: "ideas", label: "Мои идеи" },
  { id: "community", label: "Рейтинг сообщества" },
];

interface TransferHubClientProps {
  rumors: TransferRumor[];
  ideas: TransferIdeaRecord[];
  loans: LoanPlayerRecord[];
  predictions: TransferPredictionRecord[];
  userId?: string | null;
  backendEnabled?: boolean;
}

export function TransferHubClient({
  rumors,
  ideas,
  loans,
  predictions,
  userId = null,
  backendEnabled = false,
}: TransferHubClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("official");
  const predictionsByRumorId = useMemo(() => new Map(predictions.map((item) => [item.rumor_id, item])), [predictions]);
  const officialArrivals = rumors.filter((rumor) => rumor.direction === "incoming" && rumor.status === "resolved");
  const incomingRumors = rumors.filter((rumor) => rumor.direction === "incoming" && rumor.status === "active");
  const outgoingRumors = rumors.filter((rumor) => rumor.direction === "outgoing");
  const incomingIdeas = ideas.filter((idea) => idea.direction === "incoming");
  const outgoingIdeas = ideas.filter((idea) => idea.direction === "outgoing");
  const communityRanking = [...rumors].sort((a, b) => (b.community_votes ?? 0) - (a.community_votes ?? 0));

  return (
    <div className="space-y-5">
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "ui-tab ui-tab-active" : "ui-tab ui-tab-idle bg-white/[0.03]"}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "official" ? (
        <HubList
          title="Подтверждённые пополнения состава"
          items={officialArrivals}
          ideas={[]}
          predictionsByRumorId={predictionsByRumorId}
          userId={userId}
          backendEnabled={backendEnabled}
        />
      ) : null}

      {activeTab === "rumors" ? (
        <HubList
          title="Центральный защитник и нападающий — главные цели окна"
          items={incomingRumors}
          ideas={incomingIdeas}
          predictionsByRumorId={predictionsByRumorId}
          userId={userId}
          backendEnabled={backendEnabled}
        />
      ) : null}

      {activeTab === "outgoing" ? (
        <HubList
          title="С кем клуб может расстаться"
          items={outgoingRumors}
          ideas={outgoingIdeas}
          predictionsByRumorId={predictionsByRumorId}
          userId={userId}
          backendEnabled={backendEnabled}
        />
      ) : null}

      {activeTab === "ideas" ? (
        <section className="space-y-4">
          <Card className="barca-panel border-accent/15">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="meta-label text-xs">Своя идея</p>
                <h3 className="mt-2 text-xl font-semibold">Добавить желаемый трансфер</h3>
                <p className="mt-2 text-sm text-blue-100/75">
                  Предлагайте варианты и оценивайте их по стоимости, полезности и вероятности.
                </p>
              </div>
              <TransferIdeaForm userId={userId} backendEnabled={backendEnabled} />
            </CardContent>
          </Card>
          {ideas.map((idea) => (
            <TransferIdeaCard key={idea.id} idea={idea} />
          ))}
        </section>
      ) : null}

      {activeTab === "community" ? (
        <section className="space-y-3">
          <div className="spotlight-strip">
            <p className="meta-label text-xs">Рейтинг сообщества</p>
            <h3 className="mt-2 text-xl font-semibold">Самые обсуждаемые решения окна</h3>
          </div>
          {communityRanking.map((rumor, index) => (
            <Card key={rumor.id} className="soft-panel">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="meta-label text-xs">#{index + 1} · {rumor.community_votes ?? 0} голосов</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{rumor.player_name}</p>
                  <p className="ui-note mt-1 text-sm">{rumor.short_reason ?? rumor.notes}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="ui-value text-xl font-semibold">{rumor.barca_fit_score ?? "—"}</p>
                  <p className="meta-label text-xs">Barca Fit</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function HubList({
  title,
  items,
  ideas,
  predictionsByRumorId,
  userId,
  backendEnabled,
}: {
  title: string;
  items: TransferRumor[];
  ideas: TransferIdeaRecord[];
  predictionsByRumorId: Map<string, TransferPredictionRecord>;
  userId?: string | null;
  backendEnabled?: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="spotlight-strip">
        <p className="meta-label text-xs">Transfer Hub 2.0</p>
        <h3 className="mt-2 text-xl font-semibold">{title}</h3>
      </div>
      {items.map((rumor) => (
        <TransferCard
          key={rumor.id}
          rumor={rumor}
          prediction={predictionsByRumorId.get(rumor.id) ?? null}
          userId={userId}
          backendEnabled={backendEnabled}
        />
      ))}
      {ideas.map((idea) => (
        <TransferIdeaCard key={idea.id} idea={idea} />
      ))}
    </section>
  );
}
