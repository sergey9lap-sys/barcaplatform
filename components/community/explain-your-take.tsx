"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPrimaryRole } from "@/lib/community/gamification";
import { getStoredOpinions, saveStoredOpinions } from "@/lib/community/storage";
import { mockOpinions } from "@/lib/mocks/community";
import { mockCommunityUsers } from "@/lib/mocks/community-users";
import type { CommunityOpinionRecord, CommunityTargetType } from "@/types/database";

interface ExplainYourTakeProps {
  targetType: CommunityTargetType;
  targetId: string;
}

export function ExplainYourTake({ targetType, targetId }: ExplainYourTakeProps) {
  const localUser = mockCommunityUsers[0];
  const userRole = getPrimaryRole(localUser);
  const fallback = useMemo(
    () => mockOpinions.filter((opinion) => opinion.targetType === targetType && opinion.targetId === targetId),
    [targetId, targetType],
  );
  const [opinions, setOpinions] = useState<CommunityOpinionRecord[]>(fallback);
  const [text, setText] = useState("");

  useEffect(() => {
    setOpinions(getStoredOpinions(targetType, targetId, fallback));
  }, [fallback, targetId, targetType]);

  function persist(next: CommunityOpinionRecord[]) {
    setOpinions(saveStoredOpinions(targetType, targetId, next));
  }

  function addOpinion() {
    if (!text.trim()) return;
    persist([
      {
        id: `opinion-${Date.now()}`,
        userId: localUser.id,
        userName: localUser.username,
        userRole,
        targetType,
        targetId,
        text: text.trim(),
        likes: 0,
        createdAt: "только что",
        isPinnedByAdmin: false,
      },
      ...opinions,
    ]);
    setText("");
  }

  function likeOpinion(opinionId: string) {
    persist(opinions.map((opinion) => (opinion.id === opinionId ? { ...opinion, likes: opinion.likes + 1 } : opinion)));
  }

  function pinOpinion(opinionId: string) {
    persist(opinions.map((opinion) => ({ ...opinion, isPinnedByAdmin: opinion.id === opinionId ? !opinion.isPinnedByAdmin : opinion.isPinnedByAdmin })));
  }

  return (
    <Card className="soft-panel">
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="meta-label text-xs">Аргумент болельщика</p>
          <p className="ui-value mt-1 text-lg font-semibold">Объясни своё мнение</p>
        </div>
        <textarea
          className="form-control min-h-[92px] resize-none"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Почему ты так думаешь?"
        />
        <Button onClick={addOpinion} variant="secondary" className="w-full">
          Оставить мнение
        </Button>

        <div className="space-y-3">
          {opinions.map((opinion) => (
            <div key={opinion.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="ui-value text-sm font-semibold">{opinion.userName}</p>
                    <Badge variant={opinion.isPinnedByAdmin ? "accent" : "default"}>{opinion.userRole}</Badge>
                    {opinion.isPinnedByAdmin ? <Badge variant="primary">Закреплено</Badge> : null}
                  </div>
                  <p className="ui-note mt-2 text-sm">{opinion.text}</p>
                </div>
                <p className="meta-label shrink-0 text-[10px]">{opinion.createdAt}</p>
              </div>
              {opinion.adminReply ? (
                <div className="mt-3 rounded-2xl border border-accent/20 bg-accent/10 p-3 text-sm ui-note">
                  <span className="ui-value">Ответ админа: </span>
                  {opinion.adminReply}
                </div>
              ) : null}
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => likeOpinion(opinion.id)} className="ui-tab ui-tab-idle bg-white/[0.04]">
                  {opinion.likes} лайков
                </button>
                <button type="button" onClick={() => pinOpinion(opinion.id)} className="ui-tab ui-tab-idle bg-white/[0.04]">
                  Закрепить
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
