import { unstable_noStore as noStore } from "next/cache";

import { mockLeaderboardEntries } from "@/lib/mocks/leaderboard";
import { mockDuels } from "@/lib/mocks/duels";
import { mockMatches } from "@/lib/mocks/matches";
import { mockMatchPlayers } from "@/lib/mocks/match-players";
import { mockMatchPlayedPlayers } from "@/lib/mocks/match-played-players";
import { mockLeagueStandings } from "@/lib/mocks/league-standings";
import { mockPlayerRankings } from "@/lib/mocks/player-rankings";
import { mockManualPlayerSeasonStatsWithUsefulness } from "@/lib/mocks/player-season-stats";
import { mockTransferRumors } from "@/lib/mocks/transfer-rumors";
import { mockTransferIdeas } from "@/lib/mocks/transfer-ideas";
import { mockLaMasiaPlayers } from "@/lib/mocks/la-masia";
import { getMockChallenges } from "@/lib/mocks/challenges";
import { buildSeasonPlayerStats } from "@/lib/player-rankings/stats";
import { ensureProfileExists } from "@/lib/supabase/ensure-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AnalyticsPlayerRecord,
  DuelRecord,
  ChallengeRecord,
  LeaderboardEntry,
  LaMasiaPlayerRecord,
  LeagueStanding,
  LineupPredictionRecord,
  ManualPlayerSeasonStat,
  Match,
  MatchPlayer,
  MatchPlayedPlayer,
  MatchPlayerStat,
  MatchPredictionRecord,
  PlayerRankingRecord,
  PlayerCatalogItem,
  Profile,
  PublicLeaderboardEntry,
  SeasonPlayerStat,
  TransferIdeaRecord,
  TransferPredictionRecord,
  TransferRumor,
} from "@/types/database";

function mergeSeasonStats(
  rankedStats: SeasonPlayerStat[],
  manualStats: ManualPlayerSeasonStat[],
  matchPlayers: MatchPlayer[],
) {
  const playersByStableId = new Map(
    matchPlayers.map((player) => [
      player.player_id ?? `name:${player.player_name}`,
      { player_name: player.player_name },
    ]),
  );

  const merged = new Map(rankedStats.map((stat) => [stat.player_id, { ...stat }]));

  manualStats.forEach((manual) => {
    const existing = merged.get(manual.player_id);
    if (existing) {
      existing.player_name = manual.player_name ?? existing.player_name;
      existing.goals = manual.goals;
      existing.assists = manual.assists;
      existing.matches_played = manual.matches_played;
      existing.minutes_played = manual.minutes_played;
      existing.avatar_url = manual.avatar_url;
      existing.total_points = manual.total_points_override ?? existing.total_points;
      existing.average_rank_position = manual.average_rank_position_override ?? existing.average_rank_position;
      existing.matches_ranked = manual.matches_ranked_override ?? existing.matches_ranked;
      existing.first_place_count = manual.first_place_count_override ?? existing.first_place_count;
      existing.top_three_count = manual.top_three_count_override ?? existing.top_three_count;
      existing.last_place_count = manual.last_place_count_override ?? existing.last_place_count;
      return;
    }

    merged.set(manual.player_id, {
      player_id: manual.player_id,
      player_name: manual.player_name ?? playersByStableId.get(manual.player_id)?.player_name ?? "Игрок Барселоны",
      total_points: manual.total_points_override ?? 0,
      average_rank_position: manual.average_rank_position_override ?? 0,
      matches_ranked: manual.matches_ranked_override ?? 0,
      first_place_count: manual.first_place_count_override ?? 0,
      top_three_count: manual.top_three_count_override ?? 0,
      last_place_count: manual.last_place_count_override ?? 0,
      goals: manual.goals,
      assists: manual.assists,
      matches_played: manual.matches_played,
      minutes_played: manual.minutes_played,
      avatar_url: manual.avatar_url,
    });
  });

  return Array.from(merged.values()).sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }

    if (b.goals !== a.goals) {
      return b.goals - a.goals;
    }

    if (b.assists !== a.assists) {
      return b.assists - a.assists;
    }

    return a.player_name.localeCompare(b.player_name, "ru");
  });
}

export async function getCurrentUser() {
  noStore();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data) {
    return (data as Profile) ?? null;
  }

  await ensureProfileExists(supabase);

  // Safe fallback for users that exist in Supabase Auth but do not yet
  // have a mirrored row in public.profiles.
  return {
    id: user.id,
    email: user.email ?? "",
    display_name:
      (typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null) ||
      (user.email ? user.email.split("@")[0] : null),
    total_points: 0,
    is_admin: false,
    created_at: new Date().toISOString(),
  } satisfies Profile;
}

export async function getPublicLeaderboard() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [] as PublicLeaderboardEntry[];
  const { data, error } = await supabase.rpc("get_public_leaderboard");
  if (error || !data) return [] as PublicLeaderboardEntry[];
  return data as PublicLeaderboardEntry[];
}

export async function getAnalyticsPlayers() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [] as AnalyticsPlayerRecord[];
  const { data, error } = await supabase
    .from("analytics_players")
    .select("id,name,role,position,source_label,technique,pressure_play,pressing,positional_discipline,intelligence,mentality,coach_compatibility,barca_compatibility,conclusion")
    .eq("is_active", true)
    .order("barca_compatibility", { ascending: false });
  if (error || !data) return [] as AnalyticsPlayerRecord[];
  return data as AnalyticsPlayerRecord[];
}

export async function getUpcomingMatches(limit?: number) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    const matches = mockMatches.filter((match) => match.status === "upcoming");
    return limit ? matches.slice(0, limit) : matches;
  }

  let query = supabase
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true })
    .eq("status", "upcoming")
    .gte("kickoff_at", new Date().toISOString());

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;
  const matches = (data as Match[] | null) ?? [];

  if (!matches.length) {
    const fallbackMatches = mockMatches.filter((match) => match.status === "upcoming");
    return limit ? fallbackMatches.slice(0, limit) : fallbackMatches;
  }

  return matches;
}

export async function getAllMatches() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockMatches;
  }

  const { data } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true })
    ;

  const matches = ((data as Match[] | null) ?? []).filter((match) => new Date(match.kickoff_at) >= new Date("2026-08-01T00:00:00.000Z"));
  return matches.length ? matches : mockMatches;
}

export async function getChallenges(includeUnpublished = false) {
  noStore();
  const matches = await getAllMatches();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return getMockChallenges(matches);

  let query = supabase.from("challenges").select("*").order("featured", { ascending: false }).order("created_at", { ascending: false });
  if (!includeUnpublished) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error || !data?.length) return getMockChallenges(matches);
  return data as ChallengeRecord[];
}

export async function getLaMasiaPlayers() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return mockLaMasiaPlayers;

  const { data, error } = await supabase
    .from("la_masia_players")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false })
    .order("potential_score", { ascending: false });

  if (error || !data?.length) return mockLaMasiaPlayers;
  return data as LaMasiaPlayerRecord[];
}

export async function getMatchById(matchId: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockMatches.find((match) => match.id === matchId) ?? null;
  }

  const { data } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  return (data as Match | null) ?? mockMatches.find((match) => match.id === matchId) ?? null;
}

export async function getMatchPlayers(matchId: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockMatchPlayers.filter((player) => player.match_id === matchId);
  }

  const { data } = await supabase
    .from("match_players")
    .select("*")
    .eq("match_id", matchId)
    .order("position", { ascending: true })
    .order("player_number", { ascending: true });

  const players = (data as MatchPlayer[] | null) ?? [];
  return players.length ? players : mockMatchPlayers.filter((player) => player.match_id === matchId);
}

export async function getAllMatchPlayers() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockMatchPlayers;
  }

  const { data } = await supabase
    .from("match_players")
    .select("*")
    .order("match_id", { ascending: true })
    .order("position", { ascending: true })
    .order("player_number", { ascending: true });

  const players = (data as MatchPlayer[] | null) ?? [];
  return players.length ? players : mockMatchPlayers;
}

export async function getPlayersCatalog() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    const seen = new Set<string>();
    return mockMatchPlayers
      .filter((player) => {
        const stableId = player.player_id ?? player.id;
        if (seen.has(stableId)) {
          return false;
        }
        seen.add(stableId);
        return true;
      })
      .map((player) => ({
        id: player.player_id ?? player.id,
        display_name: player.player_name,
        avatar_url: null,
      })) as PlayerCatalogItem[];
  }

  const { data, error } = await supabase.from("players").select("id, player_name, avatar_url").order("player_name", { ascending: true });
  if (error || !data) {
    const seen = new Set<string>();
    return mockMatchPlayers
      .filter((player) => {
        const stableId = player.player_id ?? player.id;
        if (seen.has(stableId)) {
          return false;
        }
        seen.add(stableId);
        return true;
      })
      .map((player) => ({
        id: player.player_id ?? player.id,
        display_name: player.player_name,
        avatar_url: null,
      })) as PlayerCatalogItem[];
  }

  return data.map((item) => ({
    id: item.id,
    display_name: item.player_name,
    avatar_url: item.avatar_url,
  })) as PlayerCatalogItem[];
}

export async function getLeaderboard(limit = 10) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockLeaderboardEntries.slice(0, limit);
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, email, total_points")
    .order("total_points", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  return (data as LeaderboardEntry[] | null) ?? [];
}

export async function getUserPrediction(matchId: string, userId?: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) {
    return null;
  }

  const { data } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    match_id: data.match_id,
    result: data.predicted_result,
    score: {
      home: data.predicted_home_score,
      away: data.predicted_away_score,
    },
    points_preview: data.points_awarded,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as MatchPredictionRecord;
}

export async function getUserLineupPrediction(matchId: string, userId?: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) {
    return null;
  }

  const { data } = await supabase
    .from("lineup_predictions")
    .select("*")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    ...data,
    player_layout: Array.isArray(data.player_layout) ? data.player_layout : [],
  } as LineupPredictionRecord;
}

export async function getTransferRumors() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockTransferRumors;
  }

  const { data } = await supabase
    .from("transfer_rumors")
    .select("*")
    .order("created_at", { ascending: false });

  const rumors = (data as TransferRumor[] | null) ?? [];
  const hasCurrentWindow = rumors.some((rumor) => rumor.player_name === "Родри" && rumor.status === "resolved");
  return hasCurrentWindow ? rumors : mockTransferRumors;
}

export async function getTransferIdeas() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockTransferIdeas;
  }

  const { data, error } = await supabase
    .from("transfer_ideas")
    .select("*, profiles(display_name,email)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockTransferIdeas;
  }

  return data.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    player_name: item.player_name,
    current_club: item.current_club,
    target_club: item.target_club,
    direction: item.direction,
    estimated_fee_millions: item.estimated_fee_millions,
    usefulness_score: item.usefulness_score,
    desire_score: item.desire_score,
    probability_score: item.probability_score,
    notes: item.notes,
    author_name:
      (Array.isArray(item.profiles) ? item.profiles[0]?.display_name || item.profiles[0]?.email : item.profiles?.display_name || item.profiles?.email) ?? null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  })) as TransferIdeaRecord[];
}

export async function getTransferIdeasForUser(userId?: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) {
    return [] as TransferIdeaRecord[];
  }

  const { data, error } = await supabase
    .from("transfer_ideas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [] as TransferIdeaRecord[];
  }

  return data as TransferIdeaRecord[];
}

export async function getTransferPredictionsForUser(userId?: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) {
    return [] as TransferPredictionRecord[];
  }

  const { data } = await supabase
    .from("transfer_predictions")
    .select("*")
    .eq("user_id", userId);

  return (data as TransferPredictionRecord[] | null) ?? [];
}

export async function getAllPredictionsForUser(userId?: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) {
    return [] as MatchPredictionRecord[];
  }

  const { data } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) {
    return [] as MatchPredictionRecord[];
  }

  return data.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    match_id: item.match_id,
    result: item.predicted_result,
    score: {
      home: item.predicted_home_score,
      away: item.predicted_away_score,
    },
    points_preview: item.points_awarded,
    created_at: item.created_at,
    updated_at: item.updated_at,
  })) as MatchPredictionRecord[];
}

export async function getAllLineupPredictionsForUser(userId?: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) {
    return [] as LineupPredictionRecord[];
  }

  const { data } = await supabase
    .from("lineup_predictions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) {
    return [] as LineupPredictionRecord[];
  }

  return data.map((item) => ({
    ...item,
    player_layout: Array.isArray(item.player_layout) ? item.player_layout : [],
  })) as LineupPredictionRecord[];
}

export async function getDuelsForUser(userId?: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) {
    return mockDuels.filter((duel) => duel.challenger_id === userId || duel.opponent_id === userId);
  }

  const { data } = await supabase
    .from("duels")
    .select("*")
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (!data) {
    return [] as DuelRecord[];
  }

  return data.map((item) => ({
    ...item,
    winner_id: item.winner_id ?? null,
    bonus_awarded: item.bonus_awarded ?? 0,
  })) as DuelRecord[];
}

export async function getPredictionsForUsers(userIds: string[]) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userIds.length) {
    return [] as MatchPredictionRecord[];
  }

  const { data } = await supabase
    .from("predictions")
    .select("*")
    .in("user_id", userIds);

  if (!data) {
    return [] as MatchPredictionRecord[];
  }

  return data.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    match_id: item.match_id,
    result: item.predicted_result,
    score: {
      home: item.predicted_home_score,
      away: item.predicted_away_score,
    },
    points_preview: item.points_awarded,
    created_at: item.created_at,
    updated_at: item.updated_at,
  })) as MatchPredictionRecord[];
}

export async function getMatchPlayedPlayers(matchId: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockMatchPlayedPlayers.filter((item) => item.match_id === matchId);
  }

  const { data, error } = await supabase
    .from("match_played_players")
    .select("*")
    .eq("match_id", matchId);

  if (error) {
    return mockMatchPlayedPlayers.filter((item) => item.match_id === matchId);
  }

  const playedPlayers = (data as MatchPlayedPlayer[] | null) ?? [];
  return playedPlayers.length ? playedPlayers : mockMatchPlayedPlayers.filter((item) => item.match_id === matchId);
}

export async function getAllMatchPlayedPlayers() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockMatchPlayedPlayers;
  }

  const { data, error } = await supabase
    .from("match_played_players")
    .select("*");

  if (error) {
    return mockMatchPlayedPlayers;
  }

  const playedPlayers = (data as MatchPlayedPlayer[] | null) ?? [];
  return playedPlayers.length ? playedPlayers : mockMatchPlayedPlayers;
}

export async function getAllMatchPlayerStats() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [] as MatchPlayerStat[];
  }

  const { data, error } = await supabase
    .from("match_player_stats")
    .select("*");

  if (error) {
    return [] as MatchPlayerStat[];
  }

  return (data as MatchPlayerStat[] | null) ?? [];
}

export async function getMatchPlayerRankings(matchId: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockPlayerRankings.filter((item) => item.match_id === matchId);
  }

  const { data, error } = await supabase
    .from("player_rankings")
    .select("*")
    .eq("match_id", matchId);

  if (error) {
    return mockPlayerRankings.filter((item) => item.match_id === matchId);
  }

  return (data as PlayerRankingRecord[] | null) ?? [];
}

export async function getUserPlayerRankings(matchId: string, userId?: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) {
    return [] as PlayerRankingRecord[];
  }

  const { data, error } = await supabase
    .from("player_rankings")
    .select("*")
    .eq("match_id", matchId)
    .eq("user_id", userId);

  if (error) {
    return [] as PlayerRankingRecord[];
  }

  return (data as PlayerRankingRecord[] | null) ?? [];
}

export async function getAllPlayerRankingsForUser(userId?: string) {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !userId) {
    return [] as PlayerRankingRecord[];
  }

  const { data, error } = await supabase
    .from("player_rankings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [] as PlayerRankingRecord[];
  }

  return (data as PlayerRankingRecord[] | null) ?? [];
}

export async function getSeasonPlayerStats() {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mergeSeasonStats(
      buildSeasonPlayerStats(mockPlayerRankings, mockMatchPlayers),
      mockManualPlayerSeasonStatsWithUsefulness,
      mockMatchPlayers,
    );
  }

  const [
    { data: rankings, error: rankingsError },
    { data: matchPlayers, error: playersError },
    { data: manualStats, error: manualStatsError },
  ] = await Promise.all([
    supabase.from("player_rankings").select("*"),
    supabase.from("match_players").select("*"),
    supabase.from("season_player_stats").select("*"),
  ]);

  if (rankingsError || playersError || manualStatsError) {
    return mergeSeasonStats(
      buildSeasonPlayerStats(mockPlayerRankings, mockMatchPlayers),
      mockManualPlayerSeasonStatsWithUsefulness,
      mockMatchPlayers,
    );
  }

  const manualStatsList = (manualStats as ManualPlayerSeasonStat[] | null) ?? [];

  return mergeSeasonStats(
    buildSeasonPlayerStats(
    (rankings as PlayerRankingRecord[] | null) ?? [],
    (matchPlayers as MatchPlayer[] | null) ?? [],
    ),
    manualStatsList.length ? manualStatsList : mockManualPlayerSeasonStatsWithUsefulness,
    (matchPlayers as MatchPlayer[] | null) ?? [],
  ) as SeasonPlayerStat[];
}

export async function getLeagueStandings(competition = "Ла Лига", seasonLabel = "2025-26") {
  noStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return mockLeagueStandings.filter((item) => item.competition === competition && item.season_label === seasonLabel);
  }

  const { data, error } = await supabase
    .from("league_standings")
    .select("*")
    .eq("competition", competition)
    .eq("season_label", seasonLabel)
    .order("position", { ascending: true });

  if (error) {
    return mockLeagueStandings.filter((item) => item.competition === competition && item.season_label === seasonLabel);
  }

  const standings = (data as LeagueStanding[] | null) ?? [];
  return standings.length
    ? standings
    : mockLeagueStandings.filter((item) => item.competition === competition && item.season_label === seasonLabel);
}
