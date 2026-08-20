"use client";

import { Copy, LoaderCircle, Plus, Trophy, UserPlus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseClient } from "@/lib/supabase/client";

interface League { id: string; title: string; invite_code: string; member_count: number; is_owner: boolean }
interface Standing { user_id: string; display_name: string; avatar_url: string | null; points: number }
type Period = "week" | "month" | "season";

export function FantasyLeaguesClient() {
  const [period, setPeriod] = useState<Period>("season");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [title, setTitle] = useState(""); const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createSupabaseClient(); if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser(); setAuthenticated(Boolean(user));
    const { data: standingData } = await supabase.rpc("get_fantasy_standings", { period_key: period });
    setStandings((standingData ?? []) as Standing[]);
    if (user) { const { data } = await supabase.rpc("get_my_fantasy_leagues"); setLeagues((data ?? []) as League[]); }
  }, [period]);
  useEffect(() => { void load(); }, [load]);

  async function createLeague() {
    if (title.trim().length < 3) return;
    const supabase = createSupabaseClient(); if (!supabase) return;
    setBusy(true); const { error } = await supabase.rpc("create_fantasy_league", { league_title: title.trim() }); setBusy(false);
    if (error) setMessage("Не удалось создать лигу. Проверьте миграцию 0021."); else { setTitle(""); setMessage("Лига создана — поделитесь кодом с друзьями."); await load(); }
  }
  async function joinLeague() {
    if (code.trim().length < 4) return;
    const supabase = createSupabaseClient(); if (!supabase) return;
    setBusy(true); const { error } = await supabase.rpc("join_fantasy_league", { target_code: code.trim() }); setBusy(false);
    if (error) setMessage("Лига с таким кодом не найдена."); else { setCode(""); setMessage("Вы вступили в приватную лигу."); await load(); }
  }

  return <div className="space-y-5">
    <Card className="barca-panel border-accent/15"><CardContent className="space-y-4 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Рейтинг фэнтези</h2><p className="ui-note mt-1 text-sm">Очки начисляются после внесения официальной статистики матча.</p></div><div className="flex gap-2" role="tablist" aria-label="Период рейтинга">{([['week','Неделя'],['month','Месяц'],['season','Сезон']] as const).map(([id,label]) => <button key={id} type="button" role="tab" aria-selected={period===id} onClick={() => setPeriod(id)} className={period===id ? "ui-tab ui-tab-active min-h-11" : "ui-tab ui-tab-idle min-h-11"}>{label}</button>)}</div></div>
      <div className="space-y-2">{standings.length ? standings.slice(0,10).map((row,index) => <div key={row.user_id} className="flex min-h-16 items-center justify-between rounded-2xl bg-white/[0.035] p-3"><div className="flex items-center gap-3"><Badge variant={index<3?"accent":"default"}>#{index+1}</Badge><span className="font-semibold">{row.display_name}</span></div><span className="font-semibold tabular-nums">{row.points} очков</span></div>) : <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center"><Trophy className="mx-auto h-7 w-7 text-blue-200/60" /><p className="mt-3 font-semibold">Первый тур ещё не рассчитан</p><p className="ui-note mt-1 text-sm">После завершения матча таблица заполнится автоматически.</p></div>}</div>
    </CardContent></Card>

    <Card className="soft-panel"><CardContent className="space-y-4 p-5"><div><h2 className="text-xl font-semibold">Приватные лиги</h2><p className="ui-note mt-1 text-sm">Создайте свою компанию или вступите по коду приглашения.</p></div>{authenticated ? <><div className="grid gap-3 sm:grid-cols-2"><div className="flex gap-2"><Input value={title} maxLength={50} onChange={(event) => setTitle(event.target.value)} placeholder="Название новой лиги" /><Button onClick={() => void createLeague()} disabled={busy || title.trim().length<3} aria-label="Создать лигу"><Plus className="h-4 w-4" /></Button></div><div className="flex gap-2"><Input value={code} maxLength={12} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Код приглашения" /><Button onClick={() => void joinLeague()} disabled={busy || code.trim().length<4} aria-label="Вступить в лигу"><UserPlus className="h-4 w-4" /></Button></div></div>{busy ? <p className="ui-note flex items-center gap-2 text-sm"><LoaderCircle className="h-4 w-4 animate-spin" />Сохраняем…</p> : null}{message ? <p className="text-sm text-amber-100" role="status">{message}</p> : null}<div className="grid gap-3 sm:grid-cols-2">{leagues.map((league) => <div key={league.id} className="rounded-2xl bg-white/[0.035] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{league.title}</p><p className="ui-note mt-1 flex items-center gap-1 text-xs"><Users className="h-3.5 w-3.5" />{league.member_count} участников</p></div>{league.is_owner?<Badge variant="accent">Создатель</Badge>:null}</div><button type="button" onClick={() => void navigator.clipboard.writeText(league.invite_code)} className="mt-3 flex min-h-11 w-full items-center justify-between rounded-xl bg-black/20 px-3 text-sm"><span className="font-semibold tracking-widest">{league.invite_code}</span><Copy className="h-4 w-4" /></button></div>)}</div></> : <p className="rounded-2xl border border-dashed border-white/15 p-5 text-center text-sm text-blue-100/75">Войдите в аккаунт, чтобы создавать приватные лиги.</p>}</CardContent></Card>
  </div>;
}
