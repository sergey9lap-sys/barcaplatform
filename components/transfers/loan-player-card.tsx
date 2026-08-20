"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { CommunityConsensus } from "@/components/community/community-consensus";
import { ExplainYourTake } from "@/components/community/explain-your-take";
import { Card, CardContent } from "@/components/ui/card";
import type { LoanPlayerRecord } from "@/types/database";

const decisions = ["Вернуть", "Продать", "Оставить в аренде", "Дать шанс на сборах"] as const;

export function LoanPlayerCard({ player }: { player: LoanPlayerRecord }) {
  const storageKey = `barca-loan-opinion:${player.id}`;
  const [decision, setDecision] = useState<string>(player.community_decision);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    const saved = JSON.parse(raw) as { decision?: string; reason?: string };
    setDecision(saved.decision ?? player.community_decision);
    setReason(saved.reason ?? "");
  }, [player.community_decision, storageKey]);

  function saveOpinion(nextDecision = decision, nextReason = reason) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify({ decision: nextDecision, reason: nextReason }));
  }

  return (
    <Card className="soft-panel">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="meta-label text-xs">{player.position}</p>
            <p className="ui-value mt-2 text-lg font-semibold">{player.name}</p>
            <p className="ui-note mt-1 text-sm">
              {player.loan_club} · до {player.loan_ends_at}
            </p>
          </div>
          <Badge variant="primary">{player.status}</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Под тренера" value={player.coach_system_fit_score} />
          <Metric label="Под Барсу" value={player.barca_fit_score} />
          <div className="ui-data-card">
            <p className="meta-label text-xs">Решение сообщества</p>
            <p className="ui-value mt-2 text-sm font-semibold">{player.community_decision}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {decisions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setDecision(item);
                saveOpinion(item, reason);
              }}
              className={decision === item ? "spotlight-strip p-3 text-left text-sm font-semibold" : "soft-panel p-3 text-left text-sm ui-note"}
            >
              {item}
            </button>
          ))}
        </div>

        <textarea
          className="form-control min-h-[96px] resize-none"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            saveOpinion(decision, event.target.value);
          }}
          placeholder="Объясните своё мнение по игроку"
        />
        <CommunityConsensus
          options={[
            { label: "Вернуть", votes: player.community_decision === "Вернуть" ? 44 : 21 },
            { label: "Продать", votes: player.community_decision === "Продать" ? 39 : 14 },
            { label: "Оставить в аренде", votes: player.community_decision === "Оставить в аренде" ? 46 : 26 },
            { label: "Дать шанс на сборах", votes: player.community_decision === "Дать шанс на сборах" ? 51 : 33 },
          ]}
        />
        <ExplainYourTake targetType="transfer" targetId={player.id} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="ui-data-card">
      <p className="meta-label text-xs">{label}</p>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#397cff] to-[#d23b6d]" style={{ width: `${value}%` }} />
      </div>
      <p className="ui-value mt-2 text-lg font-semibold">{value}/100</p>
    </div>
  );
}
