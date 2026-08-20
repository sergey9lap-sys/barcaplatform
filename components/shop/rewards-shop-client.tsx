"use client";

import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pushStoredNotification } from "@/lib/community/notifications-storage";
import {
  getStoredAchievements,
  getStoredCommunityProfile,
  markAchievementGranted,
  rewardStoredUserCustom,
  saveStoredCommunityProfile,
} from "@/lib/community/storage";
import { mockCommunityUsers } from "@/lib/mocks/community-users";
import { rewardCollections } from "@/lib/mocks/rewards";
import { getPurchaseHistory, getPurchaseStatus, getWishlist, savePurchaseHistory, saveWishlist } from "@/lib/shop/storage";
import { cn } from "@/lib/utils";
import type { PurchaseHistoryRecord, RewardItemRecord, RewardRarity } from "@/types/database";

const sections = [
  "Избранное",
  "Формы",
  "Ретро",
  "Атрибутика",
  "Цифровые награды",
  "Привилегии",
  "Лимитированные",
  "Коллекции",
  "Spotify x Barça",
  "Wishlist",
  "Мои предметы",
] as const;

const rarityLabels: Record<RewardRarity, string> = {
  common: "обычный",
  rare: "редкий",
  epic: "эпический",
  legendary: "легендарный",
  ultra_legendary: "ультра-легендарный",
};

const rarityClasses: Record<RewardRarity, string> = {
  common: "border-white/10 bg-white/[0.035]",
  rare: "border-[#397cff]/35 bg-[#397cff]/10 shadow-[0_0_24px_rgba(57,124,255,0.12)]",
  epic: "border-[#9a5cff]/40 bg-[#7b3ff2]/12 shadow-[0_0_28px_rgba(154,92,255,0.16)]",
  legendary: "border-[#f2c14e]/45 bg-[#f2c14e]/12 shadow-[0_0_32px_rgba(242,193,78,0.18)]",
  ultra_legendary: "border-[#ffcf70]/60 bg-[#9b123d]/18 shadow-[0_0_38px_rgba(255,38,88,0.28)]",
};

export function RewardsShopClient({ items }: { items: RewardItemRecord[] }) {
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]>("Избранное");
  const [points, setPoints] = useState(mockCommunityUsers[0].points);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [history, setHistory] = useState<PurchaseHistoryRecord[]>([]);
  const [grantedAchievements, setGrantedAchievements] = useState<string[]>([]);
  const ownedIds = useMemo(() => new Set(history.map((purchase) => purchase.itemId)), [history]);

  useEffect(() => {
    const profile = getStoredCommunityProfile(mockCommunityUsers[0]);
    setPoints(profile.points);
    setWishlist(getWishlist());
    setHistory(getPurchaseHistory());
    setGrantedAchievements(getStoredAchievements());
  }, []);

  const visibleItems = useMemo(() => getItemsForSection(activeSection, items, wishlist, ownedIds), [activeSection, items, ownedIds, wishlist]);
  const spotifyOwned = rewardCollections.find((collection) => collection.name === "Spotify Collection")?.itemIds.filter((id) => ownedIds.has(id)).length ?? 0;

  function toggleWishlist(itemId: string) {
    const next = wishlist.includes(itemId) ? wishlist.filter((id) => id !== itemId) : [...wishlist, itemId];
    setWishlist(saveWishlist(next));
  }

  function buyItem(item: RewardItemRecord) {
    if (points < item.pricePoints || item.status === "soon" || item.status === "sold_out" || ownedIds.has(item.id)) return;

    const profile = getStoredCommunityProfile(mockCommunityUsers[0]);
    const nextProfile = { ...profile, points: Math.max(0, profile.points - item.pricePoints) };
    saveStoredCommunityProfile(nextProfile);
    setPoints(nextProfile.points);

    const purchase: PurchaseHistoryRecord = {
      id: `purchase-${Date.now()}`,
      itemId: item.id,
      title: item.title,
      category: item.category,
      pricePoints: item.pricePoints,
      purchasedAt: new Date().toLocaleDateString("ru-RU"),
      status: getPurchaseStatus(item),
    };
    const nextHistory = [purchase, ...history];
    setHistory(savePurchaseHistory(nextHistory));
    grantCompletedCollections(new Set(nextHistory.map((entry) => entry.itemId)), item.id);
  }

  function grantCompletedCollections(nextOwnedIds: Set<string>, sourceItemId: string) {
    rewardCollections.forEach((collection) => {
      const achievementId = `collection:${collection.name}`;
      const complete = collection.itemIds.every((id) => nextOwnedIds.has(id));

      if (!complete || grantedAchievements.includes(achievementId)) {
        return;
      }

      const nextAchievements = markAchievementGranted(achievementId);
      setGrantedAchievements(nextAchievements);

      if (collection.name === "Spotify Collection") {
        rewardStoredUserCustom(mockCommunityUsers[0], {
          xp: 500,
          points: 5000,
          badge: "Spotify x Barça Collector",
        });
        pushStoredNotification({
          id: `notification-${sourceItemId}-${Date.now()}`,
          type: "badge",
          title: "Коллекция Spotify x Barça собрана",
          description: "Получен бейдж Spotify x Barça Collector, profile glow и 5000 bonus points.",
          createdAt: "только что",
          isRead: false,
          link: "/profile",
        });
        return;
      }

      rewardStoredUserCustom(mockCommunityUsers[0], {
        xp: 180,
        points: 1500,
        badge: `${collection.name} Collector`,
      });
    });
  }

  return (
    <div className="space-y-5">
      <Card className="barca-panel border-accent/15">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="meta-label text-xs">Баланс коллекционера</p>
              <p className="ui-value mt-1 text-3xl font-semibold">{points} points</p>
            </div>
            <Badge variant="primary">{history.length} предметов собрано</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <CategoryCard title="Формы" value={items.filter((item) => item.category === "Формы").length} />
            <CategoryCard title="Spotify" value={`${spotifyOwned}/8`} />
            <CategoryCard title="Wishlist" value={wishlist.length} />
            <CategoryCard title="Лимитки" value={items.filter((item) => item.isLimited).length} />
          </div>
        </CardContent>
      </Card>

      <div className="no-scrollbar overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {sections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={activeSection === section ? "ui-tab ui-tab-active relative" : "ui-tab ui-tab-idle bg-white/[0.03]"}
            >
              {section}
              {activeSection === section ? <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-[#f2c14e]" /> : null}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "Коллекции" ? <CollectionsView ownedIds={ownedIds} /> : null}
      {activeSection === "Мои предметы" ? <OwnedView history={history} items={items} /> : null}

      {activeSection !== "Коллекции" && activeSection !== "Мои предметы" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleItems.map((item) => (
            <RewardCard
              key={item.id}
              item={item}
              points={points}
              owned={ownedIds.has(item.id)}
              wished={wishlist.includes(item.id)}
              onWishlist={() => toggleWishlist(item.id)}
              onBuy={() => buyItem(item)}
            />
          ))}
          {!visibleItems.length ? (
            <Card className="soft-panel md:col-span-2">
              <CardContent className="p-5 text-sm ui-note">В этом разделе пока пусто. Добавьте предметы в wishlist или купите награды.</CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getItemsForSection(section: string, items: RewardItemRecord[], wishlist: string[], ownedIds: Set<string>) {
  if (section === "Избранное") {
    return [
      ...items.filter((item) => item.rarity === "ultra_legendary"),
      ...items.filter((item) => item.tags?.includes("LIMITED")).slice(0, 12),
      ...items.filter((item) => item.rarity === "legendary").slice(0, 16),
    ];
  }
  if (section === "Wishlist") return items.filter((item) => wishlist.includes(item.id));
  if (section === "Лимитированные") return items.filter((item) => item.category === "Лимитированные" || item.isLimited);
  if (section === "Spotify x Barça") return items.filter((item) => item.category === "Spotify x Barça");
  if (section === "Мои предметы") return items.filter((item) => ownedIds.has(item.id));
  return items.filter((item) => item.category === section);
}

function RewardCard({
  item,
  points,
  owned,
  wished,
  onWishlist,
  onBuy,
}: {
  item: RewardItemRecord;
  points: number;
  owned: boolean;
  wished: boolean;
  onWishlist: () => void;
  onBuy: () => void;
}) {
  const unavailable = item.status === "soon" || item.status === "sold_out";
  const notEnough = points < item.pricePoints;
  const disabled = unavailable || notEnough || owned;

  return (
    <Card className={cn("overflow-hidden rounded-3xl border backdrop-blur-sm", rarityClasses[item.rarity], item.isLimited ? "ring-1 ring-[#d23b6d]/35" : "")}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="meta-label text-xs">{item.category}{item.season ? ` · ${item.season}` : ""}</p>
            <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
            <p className="ui-note mt-2 text-sm">{item.shortDescription ?? item.description}</p>
          </div>
          <button type="button" onClick={onWishlist} className={wished ? "spotlight-strip p-3" : "rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-blue-100/70"}>
            <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={item.rarity === "legendary" || item.rarity === "ultra_legendary" ? "primary" : item.rarity === "common" ? "default" : "accent"}>
            {rarityLabels[item.rarity]}
          </Badge>
          {item.tags?.map((tag) => (
            <Badge key={tag} variant={tag.includes("LIMITED") || tag.includes("RARE") || tag.includes("Spotify") ? "primary" : "default"}>{tag}</Badge>
          ))}
          {owned ? <Badge variant="accent">в коллекции</Badge> : <Badge variant="default">не собрано</Badge>}
          {item.isPremiumOnly ? <Badge variant="primary">Premium скоро</Badge> : null}
        </div>

        {item.collectionName ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="meta-label text-xs">Коллекция</p>
            <p className="ui-value mt-1 text-sm">{item.collectionName}</p>
          </div>
        ) : null}

        {item.expiresLabel ? <p className="ui-note text-xs">{item.expiresLabel}</p> : null}

        <div className="flex items-center justify-between gap-3">
          <p className="ui-value text-lg font-semibold">{item.pricePoints} очков</p>
          {item.stock != null ? <p className="meta-label text-xs">остаток {Math.max(0, item.stock - (owned ? 1 : 0))}</p> : null}
        </div>

        <Button className="min-h-11 w-full" variant="secondary" onClick={onBuy} disabled={disabled}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          {owned ? "Уже в коллекции" : unavailable ? formatStatus(item.status) : notEnough ? "Не хватает points" : "Купить за points"}
        </Button>
      </CardContent>
    </Card>
  );
}

function CollectionsView({ ownedIds }: { ownedIds: Set<string> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rewardCollections.map((collection) => {
        const owned = collection.itemIds.filter((id) => ownedIds.has(id)).length;
        const total = collection.itemIds.length;
        const percent = Math.round((owned / total) * 100);
        const complete = owned === total;

        return (
          <Card key={collection.name} className={complete ? "barca-panel border-accent/30" : "soft-panel"}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="meta-label text-xs">Коллекция</p>
                  <h3 className="mt-2 text-xl font-semibold">{collection.name}</h3>
                </div>
                <Badge variant={complete ? "accent" : "default"}>{owned}/{total}</Badge>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-[#397cff] to-[#f2c14e]" style={{ width: `${percent}%` }} />
              </div>
              <p className="ui-note text-sm">{complete ? "Коллекция сезона собрана" : `Собрано ${percent}%`}</p>
              <p className="ui-value text-sm">Бонус: {collection.bonus}</p>
              {collection.name === "Spotify Collection" && complete ? (
                <div className="spotlight-strip">
                  <p className="ui-value text-sm">
                    <Sparkles className="mr-2 inline h-4 w-4" />
                    Spotify x Barça Collector получен
                  </p>
                  <p className="ui-note mt-1 text-xs">Profile glow и bonus points будут активированы в профиле.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function OwnedView({ history, items }: { history: PurchaseHistoryRecord[]; items: RewardItemRecord[] }) {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  return (
    <div className="space-y-3">
      {history.map((purchase) => {
        const item = itemsById.get(purchase.itemId);
        return (
          <Card key={purchase.id} className="soft-panel">
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="meta-label text-xs">{purchase.category} · {purchase.purchasedAt}</p>
                <p className="ui-value mt-2 text-lg font-semibold">{purchase.title}</p>
                <p className="ui-note mt-1 text-sm">{purchase.status}</p>
              </div>
              <Badge variant={item?.rarity === "legendary" || item?.rarity === "ultra_legendary" ? "primary" : "accent"}>{purchase.pricePoints} очков</Badge>
            </CardContent>
          </Card>
        );
      })}
      {!history.length ? (
        <Card className="soft-panel">
          <CardContent className="p-5 text-sm ui-note">Мои предметы пока пусты. Начните с цифрового бейджа или ретро-постера.</CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function CategoryCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="meta-label text-xs">{title}</p>
      <p className="ui-value mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function formatStatus(status: string) {
  if (status === "soon") return "Скоро";
  if (status === "sold_out") return "Раскуплено";
  if (status === "limited") return "Лимитировано";
  return "Купить за points";
}
