"use client";

import type { DuelRecord } from "@/types/database";

const STORAGE_KEY = "barca-fan-platform:duels";
export const MOCK_DUEL_USER_ID = "mock-user-local";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAllDuels() {
  if (!canUseStorage()) {
    return [] as DuelRecord[];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as DuelRecord[];
  }

  try {
    return JSON.parse(raw) as DuelRecord[];
  } catch {
    return [] as DuelRecord[];
  }
}

function writeAllDuels(duels: DuelRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(duels));
}

export function getStoredDuels(userId = MOCK_DUEL_USER_ID) {
  return readAllDuels().filter((duel) => duel.challenger_id === userId || duel.opponent_id === userId);
}

export function saveStoredDuel({
  matchId,
  challengerId = MOCK_DUEL_USER_ID,
  opponentId,
}: {
  matchId: string;
  challengerId?: string;
  opponentId: string;
}) {
  const duels = readAllDuels();
  const existing = duels.find(
    (duel) =>
      duel.match_id === matchId &&
      ((duel.challenger_id === challengerId && duel.opponent_id === opponentId) ||
        (duel.challenger_id === opponentId && duel.opponent_id === challengerId)),
  );
  const timestamp = new Date().toISOString();

  if (existing) {
    return existing;
  }

  const nextDuel: DuelRecord = {
    id: `duel-${matchId}-${challengerId}-${opponentId}`,
    match_id: matchId,
    challenger_id: challengerId,
    opponent_id: opponentId,
    winner_id: null,
    bonus_awarded: 0,
    created_at: timestamp,
    updated_at: timestamp,
  };

  writeAllDuels([...duels, nextDuel]);

  return nextDuel;
}
