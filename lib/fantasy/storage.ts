"use client";

import { createSupabaseClient } from "@/lib/supabase/client";

const STORAGE_PREFIX = "barca-fantasy-v1";

export interface StoredFantasyTeam {
  selected: string[];
  captain: string;
  budgetSpent: number;
  savedAt?: string;
}

export async function loadFantasyTeam(matchId: string): Promise<StoredFantasyTeam | null> {
  const key = `${STORAGE_PREFIX}:${matchId}`;
  let fallback: StoredFantasyTeam | null = null;
  try { fallback = JSON.parse(localStorage.getItem(key) ?? "null") as StoredFantasyTeam | null; } catch {}
  const supabase = createSupabaseClient();
  if (!supabase) return fallback;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fallback;

  const { data, error } = await supabase.from("fantasy_teams").select("selected_player_ids,captain_id,budget_spent,updated_at").eq("user_id", user.id).eq("match_id", matchId).maybeSingle();
  if (error || !data) return fallback;
  const team = { selected: (data.selected_player_ids as string[]) ?? [], captain: (data.captain_id as string | null) ?? "", budgetSpent: data.budget_spent ?? 0, savedAt: data.updated_at };
  localStorage.setItem(key, JSON.stringify(team));
  return team;
}

export async function saveFantasyTeam(matchId: string, team: StoredFantasyTeam, lockedAt: string) {
  const key = `${STORAGE_PREFIX}:${matchId}`;
  localStorage.setItem(key, JSON.stringify(team));
  const supabase = createSupabaseClient();
  if (!supabase) return { persisted: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { persisted: false };

  const { error } = await supabase.from("fantasy_teams").upsert({
    user_id: user.id,
    match_id: matchId,
    season_id: "2026-27",
    selected_player_ids: team.selected,
    captain_id: team.captain,
    budget_limit: 50,
    budget_spent: team.budgetSpent,
    locked_at: lockedAt,
  }, { onConflict: "user_id,match_id" });
  return { persisted: !error, error };
}
