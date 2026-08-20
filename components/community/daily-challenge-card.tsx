"use client";

import { useEffect, useState } from "react";

import { CommunityConsensus } from "@/components/community/community-consensus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { rewardStoredUserCustom } from "@/lib/community/storage";
import { mockCommunityUsers } from "@/lib/mocks/community-users";
import type { DailyChallengeRecord } from "@/types/database";

export function DailyChallengeCard({ challenge, compact = false }: { challenge: DailyChallengeRecord; compact?: boolean }) {
  const [answer, setAnswer] = useState<string | null>(null);

  useEffect(() => {
    setAnswer(window.localStorage.getItem(`barca-challenge:${challenge.id}`));
  }, [challenge.id]);

  function choose(option: string) {
    if (answer) return;
    window.localStorage.setItem(`barca-challenge:${challenge.id}`, option);
    rewardStoredUserCustom(mockCommunityUsers[0], {
      xp: challenge.rewardXP,
      points: challenge.rewardPoints,
    });
    setAnswer(option);
  }

  return (
    <Card className="barca-panel border-accent/15">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="meta-label text-xs">{challenge.type}</p>
            <h3 className="mt-2 text-xl font-semibold">{challenge.title}</h3>
            <p className="ui-note mt-2 text-sm">{challenge.description}</p>
          </div>
          <Badge variant="primary">+{challenge.rewardXP} опыта</Badge>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {challenge.options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => choose(option.label)}
              className={answer === option.label ? "spotlight-strip p-3 text-left text-sm font-semibold" : "soft-panel p-3 text-left text-sm ui-note"}
            >
              {option.label}
            </button>
          ))}
        </div>
        {answer ? <CommunityConsensus options={challenge.options} /> : null}
        <div className="flex items-center justify-between gap-3">
          <p className="ui-note text-xs">Истекает: {challenge.expiresAt}</p>
          <Badge variant="accent">+{challenge.rewardPoints} очков</Badge>
        </div>
        {compact ? null : (
          <Button variant="secondary" className="w-full" disabled>
            {answer ? "Ответ сохранён" : "Выберите вариант выше"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
