"use client";

import { defaultMasteryTracks, type MasteryTrack } from "@/lib/community/mastery";
import { createSupabaseClient } from "@/lib/supabase/client";

export async function loadMasteryTracks(): Promise<MasteryTrack[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return defaultMasteryTracks;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return defaultMasteryTracks;

  await supabase.rpc("bootstrap_game_profile");
  const { data, error } = await supabase.from("user_skill_progress").select("skill_key,xp,correct_count,attempts_count").eq("user_id", user.id);
  if (error || !data?.length) return defaultMasteryTracks;
  const progress = new Map(data.map((row) => [row.skill_key as string, row]));
  return defaultMasteryTracks.map((track) => {
    const row = progress.get(track.key);
    return row ? { ...track, xp: row.xp ?? 0, correct: row.correct_count ?? 0, attempts: row.attempts_count ?? 0 } : { ...track, xp: 0, correct: 0, attempts: 0 };
  });
}
