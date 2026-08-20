"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { rewardItems } from "@/lib/mocks/rewards";
import { getPurchaseHistory, getWishlist, SHOP_UPDATED_EVENT } from "@/lib/shop/storage";
import type { PurchaseHistoryRecord, RewardItemRecord } from "@/types/database";

export function RewardsProfileSection() {
  const [history, setHistory] = useState<PurchaseHistoryRecord[]>([]);
  const [wishlist, setWishlist] = useState<RewardItemRecord[]>([]);

  useEffect(() => {
    function refreshRewards() {
      setHistory(getPurchaseHistory());
      const ids = getWishlist();
      setWishlist(rewardItems.filter((item) => ids.includes(item.id)));
    }

    refreshRewards();
    window.addEventListener(SHOP_UPDATED_EVENT, refreshRewards);
    return () => window.removeEventListener(SHOP_UPDATED_EVENT, refreshRewards);
  }, []);

  return (
    <div className="space-y-5">
      <Card className="soft-panel">
        <CardContent className="space-y-4 p-5">
          <p className="meta-label text-xs">Мои награды</p>
          {history.length ? (
            <div className="space-y-3">
              {history.map((purchase) => (
                <div key={purchase.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="ui-value text-sm font-semibold">{purchase.title}</p>
                      <p className="ui-note mt-1 text-xs">{purchase.category} · {purchase.purchasedAt}</p>
                    </div>
                    <Badge variant="accent">{purchase.pricePoints} очков</Badge>
                  </div>
                  <p className="ui-note mt-2 text-xs">{purchase.status}</p>
                  {purchase.status === "physical pending" ? (
                    <p className="ui-note mt-2 text-xs">Физические награды будут обрабатываться вручную после запуска проекта.</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="ui-note text-sm">Покупок пока нет. Загляните в магазин наград.</p>
          )}
        </CardContent>
      </Card>

      <Card className="soft-panel">
        <CardContent className="space-y-4 p-5">
          <p className="meta-label text-xs">Список желаний</p>
          {wishlist.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {wishlist.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="ui-value text-sm font-semibold">{item.title}</p>
                  <p className="ui-note mt-1 text-xs">{item.pricePoints} очков · {item.rarity === "legendary" ? "легендарная" : item.rarity === "rare" ? "редкая" : "обычная"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="ui-note text-sm">Список желаний пуст. Добавьте награды сердечком в магазине.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
