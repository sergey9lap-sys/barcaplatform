"use client";

import Link from "next/link";
import { ArrowLeft, Check, Clock3, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VipArtwork } from "@/components/visuals/vip-artwork";
import type { MembershipTier } from "@/lib/premium/local";
import { loadMembershipTier, loadVipCouncilVote, saveVipCouncilVote } from "@/lib/premium/storage";
import type { VipModuleDefinition } from "@/lib/premium/vip";

const details: Record<string, { heading: string; items: string[]; action: string }> = {
  "match-center": { heading: "Ближайший матч", items: ["Предматчевый тактический разбор", "Живой текстовый чат без задержки", "Опросы по заменам и рисунку игры"], action: "Напомнить о начале" },
  transfers: { heading: "На столе у сообщества", items: ["Сравнение центральных защитников", "Сценарии цены и зарплатного риска", "Закрытый прогноз по следующему трансферу"], action: "Открыть досье" },
  league: { heading: "Ваш сезон", items: ["27-е место среди участников", "72% точности прогнозов", "До следующего дивизиона — 180 очков"], action: "Посмотреть таблицу" },
  club: { heading: "Комнаты клуба", items: ["Матч-день", "Тактическая доска", "Трансферное окно"], action: "Войти в обсуждение" },
  council: { heading: "Что делаем следующим?", items: ["Новый режим фэнтези", "Развитие профиля", "Новый формат матч-центра"], action: "Голос сохранится в профиле" },
  collection: { heading: "Выпуск августа", items: ["Нумерованный постер участника", "Тема профиля «Ночная ложа»", "Коллекционная карточка месяца"], action: "Добавить в коллекцию" },
  lab: { heading: "Ваш сильнейший навык", items: ["Тактическое мышление — 80", "Точность результата — 72", "Трансферное чутьё — 61"], action: "Открыть полный отчёт" },
  events: { heading: "Расписание", items: ["23 августа — предматчевый разбор", "28 августа — вопросы трансферному аналитику", "31 августа — итоги месяца"], action: "Добавить напоминание" },
};

export function VipSectionClient({ module }: { module: VipModuleDefinition }) {
  const content = details[module.slug];
  const [tier, setTier] = useState<MembershipTier | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void loadMembershipTier().then(setTier);
    if (module.slug === "council") void loadVipCouncilVote().then(setSelected);
  }, [module.slug]);

  if (tier === null) return <Card className="soft-panel"><CardContent className="p-6 text-center text-sm text-blue-100/65">Открываем закрытый раздел…</CardContent></Card>;
  if (tier !== "socio") return <Card className="soft-panel"><CardContent className="grid min-h-80 place-items-center p-6 text-center"><div><Crown className="mx-auto h-8 w-8 text-amber-200" /><h1 className="mt-4 text-2xl font-semibold">Раздел Socio 1899</h1><p className="ui-note mt-2">Активируйте тестовую подписку, чтобы открыть этот модуль.</p><Button asChild className="mt-5"><Link href="/membership">Открыть подписку</Link></Button></div></CardContent></Card>;

  return <div className="space-y-5">
    <Button asChild variant="ghost"><Link href="/vip"><ArrowLeft className="mr-2 h-4 w-4" />Назад в Socio 1899</Link></Button>
    <Card className="overflow-hidden border-amber-300/20 bg-[#090f22]"><VipArtwork id={module.artwork} className="h-56 w-full sm:h-72" /><CardContent className="p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="meta-label text-xs text-amber-200/75">Socio 1899</p><h1 className="mt-2 text-3xl font-semibold">{module.title}</h1></div><Badge variant="accent">{module.tag}</Badge></div><p className="ui-note mt-3 max-w-2xl">{module.text}</p></CardContent></Card>
    <Card className="soft-panel"><CardContent className="p-5"><h2 className="text-xl font-semibold">{content.heading}</h2><div className="mt-4 grid gap-3">{content.items.map((item) => module.slug === "council" ? <button key={item} onClick={() => { setSelected(item); void saveVipCouncilVote(item); }} className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${selected === item ? "border-amber-300/45 bg-amber-300/10" : "border-white/10 bg-white/[.03] hover:border-white/20"}`}><span>{item}</span>{selected === item ? <Check className="h-4 w-4 text-amber-200" /> : null}</button> : <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"><Clock3 className="h-4 w-4 text-blue-200" /><span>{item}</span></div>)}</div>{module.slug !== "council" ? <Button className="mt-5" onClick={() => setDone(true)}>{done ? <><Check className="mr-2 h-4 w-4" />Готово</> : content.action}</Button> : <p className="ui-note mt-4 text-sm">{selected ? "Ваш голос сохранён." : "Выберите один вариант."}</p>}</CardContent></Card>
    <div className="flex items-center gap-2 text-xs text-blue-100/55"><Crown className="h-4 w-4 text-amber-200" />Доступно только участникам Socio 1899</div>
  </div>;
}
