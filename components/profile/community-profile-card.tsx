"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CalendarCheck2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarUploadClient } from "@/components/profile/avatar-upload-client";
import { ProfileEditorClient } from "@/components/profile/profile-editor-client";
import { FanArtwork } from "@/components/visuals/vip-artwork";
import { getRankTitle } from "@/lib/community/gamification";
import { defaultMasteryTracks, getAccountLevel, getOverallXp, type MasteryTrack } from "@/lib/community/mastery";
import { loadMasteryTracks } from "@/lib/community/mastery-storage";
import { getAccountLevelArtwork, getRoleArtwork } from "@/lib/profile/artwork";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function CommunityProfileCard({ profile, userId }: { profile: Profile | null; userId: string | null }) {
  const [tracks, setTracks] = useState<MasteryTrack[]>(defaultMasteryTracks);
  const [streak, setStreak] = useState({ current: profile?.current_streak ?? 0, longest: profile?.longest_streak ?? 0 });
  useEffect(() => {
    void loadMasteryTracks().then(setTracks);
    const supabase = createSupabaseClient();
    if (supabase && userId) void supabase.rpc("touch_user_activity").then(({ data }) => { if (data) setStreak({ current: Number(data.current_streak ?? 0), longest: Number(data.longest_streak ?? 0) }); });
  }, [userId]);

  const totalXp = getOverallXp(tracks);
  const level = getAccountLevel(totalXp);
  const role = useMemo(() => roleFromTracks(tracks), [tracks]);
  const rank = getRankTitle(level);
  const displayName = profile?.display_name || profile?.email?.split("@")[0] || "Кулес";
  const badges = profile?.badges ?? [];

  return <div className="space-y-5">
    <Card className="barca-panel border-accent/15"><CardContent className="space-y-5 p-5">
      <div className="flex flex-col items-start gap-4 sm:flex-row"><AvatarUploadClient userId={userId} initialUrl={profile?.avatar_url} initials={displayName.slice(0, 2).toUpperCase()} /><div className="min-w-0 flex-1"><p className="meta-label text-xs">Профиль болельщика</p><h3 className="mt-2 break-words text-2xl font-semibold">{displayName}</h3><div className="mt-2 flex flex-wrap gap-2"><Badge variant="accent">{role}</Badge><Badge variant="primary">{rank}</Badge></div><p className="ui-note mt-3 max-w-2xl text-sm">{profile?.short_bio || "Расскажите, как вы смотрите футбол и что цените в игре Барселоны."}</p></div></div>
      {profile ? <ProfileEditorClient profile={profile} /> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="Любимый игрок" value={profile?.favorite_player || "Не выбран"} /><Info label="Любимая эпоха" value={profile?.favorite_era || "Не выбрана"} /><Info label="Любимый тренер" value={profile?.favorite_coach || "Не выбран"} /><Info label="Любимая схема" value={profile?.favorite_formation || "Не выбрана"} /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="Уровень" value={String(level)} /><Info label="Опыт" value={totalXp.toLocaleString("ru-RU")} /><Info label="Очки" value={(profile?.total_points ?? 0).toLocaleString("ru-RU")} /><Info label="Серия" value={`${streak.current} дн. · рекорд ${streak.longest}`} /></div>
    </CardContent></Card>

    <Card className="soft-panel overflow-hidden"><CardContent className="space-y-4 p-5"><div className="grid gap-4 lg:grid-cols-2"><Portrait artwork={getRoleArtwork(role)} label="Ваш стиль эксперта" title={role} /><Portrait artwork={getAccountLevelArtwork(level)} label="Уровень аккаунта" title={rank} /></div><div><div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-blue-200" /><h3 className="font-semibold">Полученные бейджи</h3></div>{badges.length ? <div className="mt-3 flex flex-wrap gap-2">{badges.map((badge) => <Badge key={badge} variant="accent">{translateBadge(badge)}</Badge>)}</div> : <p className="ui-note mt-3 text-sm">Первый бейдж появится после подтверждённого игрового достижения.</p>}</div></CardContent></Card>
  </div>;
}

function roleFromTracks(tracks: MasteryTrack[]) {
  const best = [...tracks].sort((a, b) => b.xp - a.xp)[0];
  if (!best || best.xp === 0) return "Начинающий кулес";
  const names: Record<string, string> = { results: "Мастер прогнозов", score: "Специалист по счёту", tactics: "Тактический стратег", transfers: "Трансферный эксперт", fantasy: "Менеджер фэнтези", duels: "Дуэлянт", knowledge: "Знаток Барсы", analyst: "Аналитик", scout: "Скаут" };
  return names[best.key] ?? best.title;
}

function translateBadge(value: string) { const names: Record<string, string> = { "La Masia Scout": "Скаут Ла Масии", "Transfer Expert": "Трансферный эксперт", "Tactical Master": "Мастер тактики", "Lineup Prophet": "Пророк состава", "Elite Culé": "Элита кулес", "Barca DNA": "ДНК Барсы", "Stream Regular": "Завсегдатай эфиров", "Community Voice": "Голос сообщества" }; return names[value] ?? value; }
function Info({ label, value }: { label: string; value: string }) { return <div className="ui-data-card min-w-0"><p className="meta-label text-xs">{label}</p><p className="ui-value mt-2 break-words text-sm font-semibold">{value}</p></div>; }
function Portrait({ artwork, label, title }: { artwork: Parameters<typeof FanArtwork>[0]["id"]; label: string; title: string }) { return <div className="grid min-h-44 grid-cols-[7rem_1fr] overflow-hidden rounded-2xl bg-white/[0.025]"><FanArtwork id={artwork} className="h-full min-h-44 w-full bg-center" /><div className="self-center p-4"><p className="meta-label text-xs">{label}</p><h3 className="mt-2 text-xl font-semibold">{title}</h3><p className="ui-note mt-2 text-sm"><CalendarCheck2 className="mr-1 inline h-4 w-4" />Обновляется после подтверждённых результатов.</p></div></div>; }
