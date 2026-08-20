"use client";
import Link from "next/link";
import { ArrowUpRight, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VipArtwork } from "@/components/visuals/vip-artwork";
import type { MembershipTier } from "@/lib/premium/local";
import { loadMembershipTier } from "@/lib/premium/storage";
import { vipModules } from "@/lib/premium/vip";

export function VipHubClient() {
  const [tier, setTier] = useState<MembershipTier>("free");
  useEffect(() => { const refresh = () => { void loadMembershipTier().then(setTier); }; refresh(); window.addEventListener("barca-membership-change", refresh); return () => window.removeEventListener("barca-membership-change", refresh); }, []);
  if (tier !== "socio") return <Card className="overflow-hidden border-amber-300/20 bg-gradient-to-br from-[#101a3b] to-[#361129]"><CardContent className="grid min-h-[420px] place-items-center p-6 text-center"><div className="max-w-lg"><Crown className="mx-auto h-10 w-10 text-amber-300" /><Badge className="mt-5" variant="accent">Закрытый раздел</Badge><h2 className="mt-4 text-3xl font-semibold">Socio 1899</h2><p className="ui-note mt-3">Частный цифровой клуб с матч-центром, трансферной комнатой, личной лабораторией и закрытыми эфирами.</p><Button asChild className="mt-6"><Link href="/membership">Открыть тестовый доступ</Link></Button></div></CardContent></Card>;
  return <div className="space-y-5"><Card className="overflow-hidden border-amber-300/25 bg-gradient-to-br from-[#101a3b] via-[#2a1738] to-[#5a132c]"><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-amber-200"><Crown className="h-5 w-5" /><p className="meta-label text-xs text-amber-200/80">Закрытый клуб участников</p></div><h2 className="mt-3 text-3xl font-semibold">Socio 1899</h2><p className="mt-2 max-w-2xl text-sm text-blue-100/75">Ваша цифровая ложа: матчи, решения клуба, аналитика и сообщество людей, которые внимательно смотрят футбол.</p></div><Badge variant="accent">Участник №0189</Badge></div></CardContent></Card><div className="grid gap-4 md:grid-cols-2">{vipModules.map((module) => <Link key={module.slug} href={`/vip/${module.slug}`} className="group"><Card className="h-full overflow-hidden border-amber-300/15 bg-[#0a1024] transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-[0_18px_45px_rgba(0,0,0,.28)]"><VipArtwork id={module.artwork} className="h-44 w-full transition-transform duration-500 group-hover:scale-[1.025]" /><CardContent className="p-5"><div className="flex items-center justify-between gap-3"><Badge variant="primary">{module.tag}</Badge><ArrowUpRight className="h-4 w-4 text-amber-200" /></div><h3 className="mt-4 text-xl font-semibold">{module.title}</h3><p className="ui-note mt-2 text-sm">{module.text}</p></CardContent></Card></Link>)}</div></div>;
}
