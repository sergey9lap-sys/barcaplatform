"use client";

import type { TransferPredictionChoice, TransferPredictionRecord } from "@/types/database";

const STORAGE_KEY = "barca-fan-platform:transfer-predictions";
export const MOCK_TRANSFER_USER_ID = "mock-user-local";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAllTransferPredictions() {
  if (!canUseStorage()) {
    return [] as TransferPredictionRecord[];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as TransferPredictionRecord[];
  }

  try {
    return JSON.parse(raw) as TransferPredictionRecord[];
  } catch {
    return [] as TransferPredictionRecord[];
  }
}

function writeAllTransferPredictions(predictions: TransferPredictionRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
}

export function getStoredTransferPrediction(rumorId: string, userId = MOCK_TRANSFER_USER_ID) {
  return readAllTransferPredictions().find((item) => item.rumor_id === rumorId && item.user_id === userId) ?? null;
}

export function getStoredTransferPredictions(userId = MOCK_TRANSFER_USER_ID) {
  return readAllTransferPredictions().filter((item) => item.user_id === userId);
}

export function saveStoredTransferPrediction({
  rumorId,
  userId = MOCK_TRANSFER_USER_ID,
  prediction,
  pointsAwarded = 0,
}: {
  rumorId: string;
  userId?: string;
  prediction: TransferPredictionChoice;
  pointsAwarded?: number;
}) {
  const predictions = readAllTransferPredictions();
  const existing = predictions.find((item) => item.rumor_id === rumorId && item.user_id === userId);
  const timestamp = new Date().toISOString();

  const nextPrediction: TransferPredictionRecord = {
    id: existing?.id ?? `transfer-${rumorId}-${userId}`,
    rumor_id: rumorId,
    user_id: userId,
    prediction,
    points_awarded: pointsAwarded,
    created_at: existing?.created_at ?? timestamp,
    updated_at: timestamp,
  };

  const nextPredictions = existing
    ? predictions.map((item) => (item.id === existing.id ? nextPrediction : item))
    : [...predictions, nextPrediction];

  writeAllTransferPredictions(nextPredictions);

  return nextPrediction;
}
