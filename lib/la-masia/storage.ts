"use client";

import { createSupabaseClient } from "@/lib/supabase/client";

export type AcademyVerdict = "Готов к основе" | "Взять на сборы" | "Нужна аренда" | "Пока рано";

export async function loadAcademyWatchlist() {
  const supabase = createSupabaseClient();
  if (!supabase) return { authenticated: false, watchlist: [] as string[], verdicts: {} as Record<string, AcademyVerdict> };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authenticated: false, watchlist: [] as string[], verdicts: {} as Record<string, AcademyVerdict> };
  const { data } = await supabase.from("la_masia_watchlist").select("player_id,verdict").eq("user_id", user.id);
  const rows = data ?? [];
  return { authenticated: true, watchlist: rows.map((row) => row.player_id), verdicts: Object.fromEntries(rows.filter((row) => row.verdict).map((row) => [row.player_id, row.verdict as AcademyVerdict])) };
}

export async function toggleAcademyWatch(playerId: string, watched: boolean) {
  const supabase = createSupabaseClient(); if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return false;
  if (watched) await supabase.from("la_masia_watchlist").delete().eq("user_id", user.id).eq("player_id", playerId);
  else await supabase.from("la_masia_watchlist").upsert({ user_id: user.id, player_id: playerId }, { onConflict: "user_id,player_id" });
  return true;
}

export async function saveAcademyVerdict(playerId: string, verdict: AcademyVerdict) {
  const supabase = createSupabaseClient(); if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return false;
  await supabase.from("la_masia_watchlist").upsert({ user_id: user.id, player_id: playerId, verdict }, { onConflict: "user_id,player_id" });
  return true;
}
