"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PURCHASES_KEY, digitalProducts } from "@/lib/premium/local";

export function DigitalShopClient() {
  const [owned, setOwned] = useState<string[]>([]);
  useEffect(() => { try { setOwned(JSON.parse(localStorage.getItem(PURCHASES_KEY) ?? "[]") as string[]); } catch { setOwned([]); } }, []);
  function buy(id: string) { const next = Array.from(new Set([...owned, id])); localStorage.setItem(PURCHASES_KEY, JSON.stringify(next)); setOwned(next); }
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{digitalProducts.map((product) => { const active = owned.includes(product.id); return <Card key={product.id} className="soft-panel overflow-hidden"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-rose-500/20"><ShoppingBag className="h-5 w-5 text-blue-200" /></div><Badge variant="primary">{product.category}</Badge></div><h3 className="mt-5 text-xl font-semibold">{product.title}</h3><p className="ui-note mt-2 min-h-10 text-sm">{product.description}</p><div className="mt-5 flex items-center justify-between gap-3"><p className="text-2xl font-semibold">{product.price} ₽</p><Button disabled={active} onClick={() => buy(product.id)}>{active ? <><Check className="mr-2 h-4 w-4" />Получено</> : "Купить для теста"}</Button></div></CardContent></Card>; })}</div><p className="ui-note rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm">Тестовый магазин: покупка только активирует предмет в этом браузере. Списаний и платёжных запросов нет. Все предметы косметические.</p></div>;
}
