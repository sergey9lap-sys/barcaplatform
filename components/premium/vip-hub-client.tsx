"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, Crown, MessageCircle, Radio, Shield, Sparkles, Vote } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MEMBERSHIP_KEY, type MembershipTier } from "@/lib/premium/local";

const modules = [
  { icon: Radio, title: "Matchroom", tag: "23 августа · 20:45", text: "Закрытый текстовый watchalong, голосовой pre-match и быстрые тактические опросы. Без трансляции видео матча." },
  { icon: Shield, title: "Transfer War Room", tag: "Окно открыто", text: "Досье целей, сравнительные карточки, сценарии стоимости и закрытые прогнозы сообщества." },
  { icon: BarChart3, title: "VIP League", tag: "#27 из 614", text: "Отдельный рейтинг Socio без дополнительных XP и игрового преимущества." },
  { icon: MessageCircle, title: "Закрытый клуб", tag: "128 онлайн", text: "Тематические комнаты без шума: матчи, тактика, трансферы и Ла Масия." },
  { icon: Vote, title: "VIP Council", tag: "Голосование", text: "Выбор следующей темы, функции и ежемесячного цифрового drop." },
  { icon: Sparkles, title: "Drop #001", tag: "Номер 0189", text: "Нумерованная цифровая карточка месяца, тема профиля и коллекционный постер." },
  { icon: BarChart3, title: "Personal Lab", tag: "9 метрик", text: "Глубокие тренды точности, сильные зоны и динамика футбольного интеллекта." },
  { icon: CalendarDays, title: "Live-события", tag: "2 в августе", text: "Разборы, AMA и закрытые эфиры с гостями по расписанию." },
];

export function VipHubClient() {
  const [tier, setTier] = useState<MembershipTier>("free");
  const [vote, setVote] = useState<string | null>(null);
  useEffect(() => { setTier((localStorage.getItem(MEMBERSHIP_KEY) as MembershipTier | null) ?? "free"); setVote(localStorage.getItem("barca-vip-council-vote")); }, []);
  if (tier !== "socio") return <Card className="overflow-hidden border-amber-300/20 bg-gradient-to-br from-[#101a3b] to-[#361129]"><CardContent className="grid min-h-[420px] place-items-center p-6 text-center"><div className="max-w-lg"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-amber-300/30 bg-amber-300/10"><Crown className="h-7 w-7 text-amber-300" /></div><Badge className="mt-5" variant="accent">Закрытый раздел</Badge><h2 className="mt-4 text-3xl font-semibold">Socio 1899</h2><p className="ui-note mt-3">Частный цифровой клуб с Matchroom, Transfer War Room, VIP-лигой, советом участников и ежемесячными drops.</p><Button asChild className="mt-6"><Link href="/membership">Открыть тестовый доступ</Link></Button></div></CardContent></Card>;
  return <div className="space-y-5">
    <Card className="overflow-hidden border-amber-300/25 bg-gradient-to-br from-[#101a3b] via-[#2a1738] to-[#5a132c]"><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-amber-200"><Crown className="h-5 w-5" /><p className="meta-label text-xs text-amber-200/80">Private members club</p></div><h2 className="mt-3 text-3xl font-semibold">Socio 1899</h2><p className="mt-2 max-w-2xl text-sm text-blue-100/75">Ваша цифровая ложа: матчи, решения клуба, аналитика и люди, которые действительно следят за футболом.</p></div><Badge variant="accent">Участник #0189</Badge></div></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2">{modules.map(({ icon: Icon, title, tag, text }) => <Card key={title} className="soft-panel transition-transform duration-200 hover:-translate-y-0.5"><CardContent className="p-5"><div className="flex items-start justify-between gap-4"><div className="grid h-10 w-10 place-items-center rounded-2xl border border-amber-300/15 bg-amber-300/[0.07]"><Icon className="h-5 w-5 text-amber-200" /></div><Badge variant="primary">{tag}</Badge></div><h3 className="mt-4 text-xl font-semibold">{title}</h3><p className="ui-note mt-2 text-sm">{text}</p>{title === "VIP Council" ? <div className="mt-4 flex flex-wrap gap-2">{["Новый Fantasy", "Профиль", "Matchroom"].map((option) => <button key={option} onClick={() => { localStorage.setItem("barca-vip-council-vote", option); setVote(option); }} className={`ui-tab ${vote === option ? "ui-tab-active" : "ui-tab-idle"}`}>{option}</button>)}</div> : null}</CardContent></Card>)}</div>
  </div>;
}
