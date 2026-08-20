"use client";

import type { Match, MatchPredictionRecord, PredictionChoice } from "@/types/database";
import { calculatePredictionPreview } from "@/lib/predictions/points";

const STORAGE_KEY = "barca-fan-platform:predictions";
export const MOCK_USER_ID = "mock-user-local";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAllPredictions() {
  if (!canUseStorage()) {
    return [] as MatchPredictionRecord[];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [] as MatchPredictionRecord[];
  }

  try {
    return JSON.parse(raw) as MatchPredictionRecord[];
  } catch {
    return [] as MatchPredictionRecord[];
  }
}

function writeAllPredictions(predictions: MatchPredictionRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
}

export function getStoredPredictions(userId = MOCK_USER_ID) {
  return readAllPredictions().filter((prediction) => prediction.user_id === userId);
}

export function getStoredPrediction(matchId: string, userId = MOCK_USER_ID) {
  return readAllPredictions().find((prediction) => prediction.match_id === matchId && prediction.user_id === userId) ?? null;
}

export function saveStoredPrediction({
  match,
  userId = MOCK_USER_ID,
  result,
  homeScore,
  awayScore,
}: {
  match: Match;
  userId?: string;
  result: PredictionChoice;
  homeScore: number | null;
  awayScore: number | null;
}) {
  const predictions = readAllPredictions();
  const existing = predictions.find((prediction) => prediction.match_id === match.id && prediction.user_id === userId);
  const timestamp = new Date().toISOString();

  const nextPrediction: MatchPredictionRecord = {
    id: existing?.id ?? `prediction-${match.id}-${userId}`,
    match_id: match.id,
    user_id: userId,
    result,
    score: {
      home: homeScore,
      away: awayScore,
    },
    points_preview: calculatePredictionPreview(match, {
      result,
      score: {
        home: homeScore,
        away: awayScore,
      },
    }),
    created_at: existing?.created_at ?? timestamp,
    updated_at: timestamp,
  };

  const nextPredictions = existing
    ? predictions.map((prediction) => (prediction.id === existing.id ? nextPrediction : prediction))
    : [...predictions, nextPrediction];

  writeAllPredictions(nextPredictions);

  return nextPrediction;
}
