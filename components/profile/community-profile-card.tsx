"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { calculateLevel, getPrimaryRole, getRankTitle } from "@/lib/community/gamification";
import { COMMUNITY_PROFILE_UPDATED_EVENT, getStoredCommunityProfile } from "@/lib/community/storage";
import { communityBadges, mockCommunityUsers } from "@/lib/mocks/community-users";
import type { CommunityUserRecord, Profile } from "@/types/database";

export function CommunityProfileCard({ profile }: { profile: Profile | null }) {
  const [communityProfile, setCommunityProfile] = useState<CommunityUserRecord>(mockCommunityUsers[0]);

  useEffect(() => {
    setCommunityProfile(getStoredCommunityProfile(mockCommunityUsers[0]));

    function handleProfileUpdated(event: Event) {
      const nextProfile = (event as CustomEvent<CommunityUserRecord>).detail;
      setCommunityProfile(nextProfile ?? getStoredCommunityProfile(mockCommunityUsers[0]));
    }

    window.addEventListener(COMMUNITY_PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => window.removeEventListener(COMMUNITY_PROFILE_UPDATED_EVENT, handleProfileUpdated);
  }, []);

  const level = calculateLevel(communityProfile.xp);
  const rankTitle = getRankTitle(level);
  const primaryRole = getPrimaryRole(communityProfile);

  return (
    <div className="space-y-5">
      <Card className="barca-panel border-accent/15">
        <CardContent className="space-y-5 p-5">
          <div className="flex items-start gap-4">
            <div className="club-avatar h-16 w-16 rounded-3xl text-lg">{communityProfile.avatar}</div>
            <div className="min-w-0">
              <p className="meta-label text-xs">Профиль болельщика</p>
              <h3 className="mt-2 text-2xl font-semibold">{profile?.display_name || communityProfile.username}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="accent">{primaryRole}</Badge>
                <Badge variant="primary">{rankTitle}</Badge>
              </div>
              <p className="ui-note mt-3 text-sm">{communityProfile.short_bio}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Любимый игрок" value={communityProfile.favorite_player} />
            <Info label="Любимая эпоха" value={communityProfile.favorite_era} />
            <Info label="Любимый тренер" value={communityProfile.favorite_coach} />
            <Info label="Любимая схема" value={communityProfile.favorite_formation} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="Уровень" value={String(level)} />
            <Info label="XP" value={String(communityProfile.xp)} />
            <Info label="Points" value={String(communityProfile.points)} />
            <Info label="Текущая серия" value={`${communityProfile.current_streak} дней`} />
            <Info label="Лучшая серия" value={`${communityProfile.max_streak} дней`} />
            <Info label="Ранг" value={rankTitle} />
          </div>
        </CardContent>
      </Card>

      <Card className="soft-panel">
        <CardContent className="space-y-4 p-5">
          <p className="meta-label text-xs">Репутация</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Analyst" value={communityProfile.analyst_reputation} />
            <Metric label="Scout" value={communityProfile.scout_reputation} />
            <Metric label="Transfer" value={communityProfile.transfer_reputation} />
            <Metric label="Prediction Accuracy" value={communityProfile.prediction_accuracy} />
            <Metric label="Tactical" value={communityProfile.tactical_reputation} />
          </div>
        </CardContent>
      </Card>

      <Card className="soft-panel">
        <CardContent className="space-y-4 p-5">
          <p className="meta-label text-xs">Статистика</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="Прогнозов" value={String(communityProfile.total_predictions)} />
            <Info label="Верных прогнозов" value={String(communityProfile.correct_predictions)} />
            <Info label="Составов" value={String(communityProfile.submitted_lineups)} />
            <Info label="Аналитик" value={String(communityProfile.submitted_analytics)} />
            <Info label="Голоса по трансферам" value={String(communityProfile.transfer_votes)} />
            <Info label="La Masia watchlist" value={String(communityProfile.la_masia_follows)} />
            <Info label="Комментариев" value={String(communityProfile.comments_count)} />
          </div>
        </CardContent>
      </Card>

      <Card className="soft-panel">
        <CardContent className="space-y-4 p-5">
          <p className="meta-label text-xs">Бейджи</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {communityBadges.map((badge) => {
              const active = communityProfile.badges.includes(badge);
              return (
                <div key={badge} className={active ? "spotlight-strip min-h-24" : "soft-panel min-h-24 p-4 opacity-55"}>
                  <p className="ui-value text-sm font-semibold">{badge}</p>
                  <p className="ui-note mt-2 text-xs">{active ? "Получен" : "Скоро"}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-data-card">
      <p className="meta-label text-xs">{label}</p>
      <p className="ui-value mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="ui-data-card">
      <div className="flex items-center justify-between gap-3">
        <p className="ui-value text-sm">{label}</p>
        <p className="meta-label text-xs">{value}</p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#397cff] to-[#d23b6d]" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
