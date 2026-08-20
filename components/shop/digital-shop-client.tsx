"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { digitalProducts } from "@/lib/premium/local";
import { loadDigitalPurchases, saveTestPurchase } from "@/lib/premium/storage";

export function DigitalShopClient() {
  const [owned, setOwned] = useState<string[]>([]);
  useEffect(() => { void loadDigitalPurchases().then(setOwned); }, []);
  async function buy(id: string) { const result = await saveTestPurchase(id); setOwned(result.items); }
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{digitalProducts.map((product) => { const active = owned.includes(product.id); return <Card key={product.id} className="soft-panel overflow-hidden"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-rose-500/20"><ShoppingBag className="h-5 w-5 text-blue-200" /></div><Badge variant="primary">{product.category}</Badge></div><h3 className="mt-5 text-xl font-semibold">{product.title}</h3><p className="ui-note mt-2 min-h-10 text-sm">{product.description}</p><div className="mt-5 flex items-center justify-between gap-3"><p className="text-2xl font-semibold">{product.price} ₽</p><Button disabled={active} onClick={() => void buy(product.id)}>{active ? <><Check className="mr-2 h-4 w-4" />Получено</> : "Купить для теста"}</Button></div></CardContent></Card>; })}</div><p className="ui-note rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm">Тестовый магазин: предмет сохраняется в аккаунте через Supabase, без списаний и платёжных запросов. Все предметы косметические.</p></div>;
}
