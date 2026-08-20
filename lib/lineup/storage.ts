"use client";

import type { LineupPredictionRecord, TacticalBoardPosition } from "@/types/database";

const STORAGE_KEY = "barca-fan-platform:lineup-predictions";
export const MOCK_LINEUP_USER_ID = "mock-user-local";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAllLineups() {
  if (!canUseStorage()) {
    return [] as LineupPredictionRecord[];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as LineupPredictionRecord[];
  }

  try {
    return JSON.parse(raw) as LineupPredictionRecord[];
  } catch {
    return [] as LineupPredictionRecord[];
  }
}

function writeAllLineups(lineups: LineupPredictionRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lineups));
}

export function getStoredLineupPrediction(matchId: string, userId = MOCK_LINEUP_USER_ID) {
  return readAllLineups().find((item) => item.match_id === matchId && item.user_id === userId) ?? null;
}

export function getStoredLineupPredictions(userId = MOCK_LINEUP_USER_ID) {
  return readAllLineups().filter((item) => item.user_id === userId);
}

export function saveStoredLineupPrediction({
  matchId,
  selectedPlayerIds,
  playerLayout,
  userId = MOCK_LINEUP_USER_ID,
}: {
  matchId: string;
  selectedPlayerIds: string[];
  playerLayout: TacticalBoardPosition[];
  userId?: string;
}) {
  const lineups = readAllLineups();
  const existing = lineups.find((item) => item.match_id === matchId && item.user_id === userId);
  const timestamp = new Date().toISOString();

  const nextLineup: LineupPredictionRecord = {
    id: existing?.id ?? `lineup-${matchId}-${userId}`,
    match_id: matchId,
    user_id: userId,
    selected_player_ids: selectedPlayerIds,
    player_layout: playerLayout,
    created_at: existing?.created_at ?? timestamp,
    updated_at: timestamp,
  };

  const nextLineups = existing
    ? lineups.map((item) => (item.id === existing.id ? nextLineup : item))
    : [...lineups, nextLineup];

  writeAllLineups(nextLineups);

  return nextLineup;
}
