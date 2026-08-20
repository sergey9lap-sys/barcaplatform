"use client";

import type { PurchaseHistoryRecord, PurchaseStatus, RewardItemRecord } from "@/types/database";

const PURCHASES_KEY = "barca-shop-purchases";
const WISHLIST_KEY = "barca-shop-wishlist";
export const SHOP_UPDATED_EVENT = "barca-shop-updated";

function emitShopUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(SHOP_UPDATED_EVENT));
}

export function getPurchaseHistory() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(PURCHASES_KEY);
  return raw ? (JSON.parse(raw) as PurchaseHistoryRecord[]) : [];
}

export function savePurchaseHistory(history: PurchaseHistoryRecord[]) {
  if (typeof window === "undefined") {
    return history;
  }

  window.localStorage.setItem(PURCHASES_KEY, JSON.stringify(history));
  emitShopUpdated();
  return history;
}

export function getWishlist() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(WISHLIST_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export function saveWishlist(ids: string[]) {
  if (typeof window === "undefined") {
    return ids;
  }

  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  emitShopUpdated();
  return ids;
}

export function getPurchaseStatus(item: RewardItemRecord): PurchaseStatus {
  if (!item.isDigital) return "physical pending";
  if (item.category === "Privileges") return "stream privilege unused";
  return "digital activated";
}
