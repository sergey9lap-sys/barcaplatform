"use client";

import { Check, Crown, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { membershipTiers, type MembershipTier } from "@/lib/premium/local";
import { loadMembershipTier, saveTestMembership } from "@/lib/premium/storage";

export function MembershipClient() {
  const [active, setActive] = useState<MembershipTier>("free");
  useEffect(() => { void loadMembershipTier().then(setActive); }, []);
  async function activate(tier: MembershipTier) { setActive(tier); await saveTestMembership(tier); window.dispatchEvent(new Event("barca-membership-change")); }
  return <div className="space-y-5">
    <div className="grid gap-4 lg:grid-cols-3">{membershipTiers.map((tier) => <Card key={tier.id} className={`relative overflow-hidden ${tier.id === "socio" ? "border-amber-300/30 bg-gradient-to-br from-[#111d43] via-[#30132e] to-[#090e22]" : "barca-panel border-white/10"}`}><CardContent className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="meta-label text-xs">Подписка</p><h3 className="mt-2 text-2xl font-semibold">{tier.name}</h3></div>{tier.id === "socio" ? <Crown className="h-6 w-6 text-amber-300" /> : <ShieldCheck className="h-6 w-6 text-blue-300" />}</div>
      <div><span className="text-3xl font-semibold">{tier.price.toLocaleString("ru-RU")} ₽</span><span className="ui-note text-sm"> / месяц</span><p className="ui-note mt-2 text-sm">{tier.description}</p></div>
      <div className="space-y-2">{tier.features.map((feature) => <div key={feature} className="flex gap-2 text-sm text-blue-100/80"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />{feature}</div>)}</div>
      <Button className="w-full" variant={tier.id === "socio" ? "default" : "outline"} onClick={() => activate(tier.id)}>{active === tier.id ? "Активна в тестовом режиме" : "Включить для теста"}</Button>
    </CardContent></Card>)}</div>
    <div className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4"><Badge variant="accent">Тестовый режим</Badge><p className="ui-note text-sm">Тариф сохраняется в аккаунте через Supabase, а при недоступной базе — резервно в этом браузере. Деньги не списываются. Все игровые механики и опыт остаются бесплатными.</p></div>
  </div>;
}
