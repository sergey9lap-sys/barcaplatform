"use client";

import { createSupabaseClient } from "@/lib/supabase/client";
import { MEMBERSHIP_KEY, PURCHASES_KEY, type MembershipTier } from "@/lib/premium/local";

const VIP_VOTE_KEY = "barca-vip-council-vote";
const VIP_QUESTION_ID = "roadmap-2026-08";

function localMembership() {
  return (localStorage.getItem(MEMBERSHIP_KEY) as MembershipTier | null) ?? "free";
}

export async function loadMembershipTier(): Promise<MembershipTier> {
  const fallback = localMembership();
  const supabase = createSupabaseClient();
  if (!supabase) return fallback;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fallback;

  await supabase.rpc("bootstrap_game_profile");
  const { data, error } = await supabase.from("user_memberships").select("tier").eq("user_id", user.id).maybeSingle();
  if (error || !data) return fallback;

  const tier = data.tier as MembershipTier;
  localStorage.setItem(MEMBERSHIP_KEY, tier);
  return tier;
}

export async function saveTestMembership(tier: MembershipTier) {
  localStorage.setItem(MEMBERSHIP_KEY, tier);
  const supabase = createSupabaseClient();
  if (!supabase) return { persisted: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { persisted: false };

  const { error } = await supabase.from("user_memberships").upsert({ user_id: user.id, tier, status: "test", provider: "local-test" }, { onConflict: "user_id" });
  return { persisted: !error, error };
}

export async function loadDigitalPurchases(): Promise<string[]> {
  let fallback: string[] = [];
  try { fallback = JSON.parse(localStorage.getItem(PURCHASES_KEY) ?? "[]") as string[]; } catch {}
  const supabase = createSupabaseClient();
  if (!supabase) return fallback;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fallback;

  const { data, error } = await supabase.from("digital_purchases").select("product_id").eq("user_id", user.id).in("status", ["test", "paid"]);
  if (error || !data) return fallback;
  const items = data.map((item) => item.product_id as string);
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(items));
  return items;
}

export async function saveTestPurchase(productId: string) {
  const current = await loadDigitalPurchases();
  const next = Array.from(new Set([...current, productId]));
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(next));
  const supabase = createSupabaseClient();
  if (!supabase) return { items: next, persisted: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { items: next, persisted: false };

  const { error } = await supabase.from("digital_purchases").insert({ user_id: user.id, product_id: productId, status: "test", amount_rub: 0 });
  return { items: next, persisted: !error || error.code === "23505", error };
}

export async function loadVipCouncilVote() {
  const fallback = localStorage.getItem(VIP_VOTE_KEY);
  const supabase = createSupabaseClient();
  if (!supabase) return fallback;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fallback;
  const { data, error } = await supabase.from("vip_council_votes").select("option_id").eq("user_id", user.id).eq("question_id", VIP_QUESTION_ID).maybeSingle();
  if (error || !data) return fallback;
  localStorage.setItem(VIP_VOTE_KEY, data.option_id);
  return data.option_id as string;
}

export async function saveVipCouncilVote(optionId: string) {
  localStorage.setItem(VIP_VOTE_KEY, optionId);
  const supabase = createSupabaseClient();
  if (!supabase) return { persisted: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { persisted: false };
  const { error } = await supabase.from("vip_council_votes").upsert({ user_id: user.id, question_id: VIP_QUESTION_ID, option_id: optionId }, { onConflict: "user_id,question_id" });
  return { persisted: !error, error };
}
