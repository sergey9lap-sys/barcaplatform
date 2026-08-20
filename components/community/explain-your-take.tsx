"use client";

import Link from "next/link";
import { Heart, LoaderCircle, MessageSquareText, Pin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { CommunityTargetType } from "@/types/database";

interface LiveOpinion { id: string; userId: string; userName: string; text: string; likes: number; liked: boolean; createdAt: string; isPinned: boolean; adminReply?: string | null }

export function ExplainYourTake({ targetType, targetId }: { targetType: CommunityTargetType; targetId: string }) {
  const [opinions, setOpinions] = useState<LiveOpinion[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createSupabaseClient();
    if (!supabase) { setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    if (user) {
      const { data: ownProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
      setIsAdmin(Boolean(ownProfile?.is_admin));
    }
    const { data, error } = await supabase.from("community_opinions").select("id,user_id,body,is_pinned,admin_reply,created_at,profiles(display_name),community_opinion_likes(user_id)").eq("target_type", targetType).eq("target_id", targetId).order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(40);
    if (error || !data) { setMessage("Мнения станут доступны после применения миграции 0021."); setLoading(false); return; }
    setOpinions(data.map((item) => { const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles; const likes = item.community_opinion_likes ?? []; return { id: item.id, userId: item.user_id, userName: profile?.display_name || "Кулес", text: item.body, likes: likes.length, liked: Boolean(user && likes.some((like: { user_id: string }) => like.user_id === user.id)), createdAt: relativeTime(item.created_at), isPinned: item.is_pinned, adminReply: item.admin_reply }; }));
    setLoading(false);
  }, [targetId, targetType]);

  useEffect(() => { void load(); }, [load]);

  async function addOpinion() {
    const body = text.trim();
    if (!userId || body.length < 2 || body.length > 1000) return;
    const supabase = createSupabaseClient(); if (!supabase) return;
    setSaving(true); setMessage(null);
    const { error } = await supabase.from("community_opinions").insert({ user_id: userId, target_type: targetType, target_id: targetId, body });
    setSaving(false);
    if (error) { setMessage("Не удалось сохранить мнение. Попробуйте ещё раз."); return; }
    setText(""); await load();
  }

  async function toggleLike(opinion: LiveOpinion) {
    if (!userId) return;
    const supabase = createSupabaseClient(); if (!supabase) return;
    if (opinion.liked) await supabase.from("community_opinion_likes").delete().eq("opinion_id", opinion.id).eq("user_id", userId);
    else await supabase.from("community_opinion_likes").insert({ opinion_id: opinion.id, user_id: userId });
    await load();
  }

  async function togglePin(opinion: LiveOpinion) {
    if (!isAdmin) return;
    const supabase = createSupabaseClient(); if (!supabase) return;
    await supabase.from("community_opinions").update({ is_pinned: !opinion.isPinned }).eq("id", opinion.id);
    await load();
  }

  return <Card className="soft-panel"><CardContent className="space-y-4 p-4">
    <div><p className="meta-label text-xs">Мнение болельщика</p><p className="ui-value mt-1 text-lg font-semibold">Объясните свою позицию</p></div>
    {userId ? <><textarea aria-label="Текст мнения" maxLength={1000} className="form-control min-h-24 resize-y" value={text} onChange={(event) => setText(event.target.value)} placeholder="Почему вы так думаете?" /><div className="flex items-center justify-between gap-3"><p className="ui-note text-xs">{text.length}/1000</p><Button onClick={() => void addOpinion()} disabled={saving || text.trim().length < 2}>{saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareText className="mr-2 h-4 w-4" />}Сохранить мнение</Button></div></> : <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-blue-100/75">Чтобы участвовать в обсуждении, <Link href="/auth" className="font-semibold text-white underline underline-offset-4">войдите в аккаунт</Link>.</div>}
    {message ? <p className="text-sm text-amber-100" role="status">{message}</p> : null}
    <div className="space-y-3">{loading ? <p className="ui-note py-5 text-center text-sm">Загружаем мнения…</p> : opinions.length ? opinions.map((opinion) => <article key={opinion.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="ui-value text-sm font-semibold">{opinion.userName}</p>{opinion.isPinned ? <Badge variant="primary">Закреплено</Badge> : null}</div><p className="mt-2 break-words text-sm leading-6 text-blue-100/80">{opinion.text}</p></div><p className="meta-label shrink-0 text-[10px]">{opinion.createdAt}</p></div>{opinion.adminReply ? <div className="mt-3 rounded-2xl bg-accent/10 p-3 text-sm text-blue-100/80"><span className="font-semibold text-white">Ответ команды: </span>{opinion.adminReply}</div> : null}<div className="mt-3 flex gap-2"><button type="button" onClick={() => void toggleLike(opinion)} disabled={!userId} aria-pressed={opinion.liked} className={opinion.liked ? "ui-tab ui-tab-active min-h-11" : "ui-tab ui-tab-idle min-h-11 bg-white/[0.04]"}><Heart className={`mr-2 h-4 w-4 ${opinion.liked ? "fill-current" : ""}`} />{opinion.likes}</button>{isAdmin ? <button type="button" onClick={() => void togglePin(opinion)} className="ui-tab ui-tab-idle min-h-11 bg-white/[0.04]"><Pin className="mr-2 h-4 w-4" />{opinion.isPinned ? "Открепить" : "Закрепить"}</button> : null}</div></article>) : <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center"><p className="ui-value font-semibold">Будьте первым</p><p className="ui-note mt-2 text-sm">Здесь пока нет мнений пользователей.</p></div>}</div>
  </CardContent></Card>;
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "только что";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(value));
}
