"use client";

import type { PlayerRankingRecord } from "@/types/database";

const STORAGE_KEY = "barca-fan-platform:player-rankings";
export const MOCK_PLAYER_RANKING_USER_ID = "mock-user-local";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAllRankings() {
  if (!canUseStorage()) {
    return [] as PlayerRankingRecord[];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as PlayerRankingRecord[];
  }

  try {
    return JSON.parse(raw) as PlayerRankingRecord[];
  } catch {
    return [] as PlayerRankingRecord[];
  }
}

function writeAllRankings(rankings: PlayerRankingRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings));
}

export function getStoredPlayerRankingsForMatch(matchId: string) {
  return readAllRankings().filter((item) => item.match_id === matchId);
}

export function getStoredPlayerRankingsForUser(userId = MOCK_PLAYER_RANKING_USER_ID) {
  return readAllRankings().filter((item) => item.user_id === userId);
}

export function saveStoredPlayerRankings({
  matchId,
  rankings,
  userId = MOCK_PLAYER_RANKING_USER_ID,
}: {
  matchId: string;
  rankings: Array<{ match_player_id: string; rank_position: number }>;
  userId?: string;
}) {
  const allRankings = readAllRankings();
  const preserved = allRankings.filter((item) => !(item.match_id === matchId && item.user_id === userId));
  const timestamp = new Date().toISOString();

  const nextRankings: PlayerRankingRecord[] = rankings.map((item) => ({
    id: `ranking-${matchId}-${item.match_player_id}-${userId}`,
    match_id: matchId,
    match_player_id: item.match_player_id,
    user_id: userId,
    rank_position: item.rank_position,
    created_at: timestamp,
    updated_at: timestamp,
  }));

  writeAllRankings([...preserved, ...nextRankings]);
  return nextRankings;
}
