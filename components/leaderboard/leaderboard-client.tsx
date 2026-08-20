"use client";

import { useEffect, useMemo, useState } from "react";

import { LeaderboardList } from "@/components/leaderboard/leaderboard-list";
import { getStoredDuels, MOCK_DUEL_USER_ID } from "@/lib/duels/storage";
import { mockDuelPredictions } from "@/lib/mocks/duel-predictions";
import { MOCK_USER_ID, getStoredPredictions } from "@/lib/predictions/storage";
import { calculateTotalLocalPoints } from "@/lib/scoring/extended-points";
import { getStoredTransferPredictions, MOCK_TRANSFER_USER_ID } from "@/lib/transfers/storage";
import type { LeaderboardEntry, Match, TransferRumor } from "@/types/database";

interface LeaderboardClientProps {
  entries: LeaderboardEntry[];
  matches: Match[];
  rumors: TransferRumor[];
  compact?: boolean;
  currentUserId?: string;
  backendEnabled?: boolean;
}

export function LeaderboardClient({
  entries,
  matches,
  rumors,
  compact = false,
  currentUserId,
  backendEnabled = false,
}: LeaderboardClientProps) {
  const [localPoints, setLocalPoints] = useState(0);

  useEffect(() => {
    if (backendEnabled) {
      return;
    }

    const predictions = getStoredPredictions(MOCK_USER_ID);
    const duelPredictions = [...mockDuelPredictions.filter((item) => item.user_id !== MOCK_USER_ID), ...predictions];
    const transferPredictions = getStoredTransferPredictions(MOCK_TRANSFER_USER_ID);
    const duels = getStoredDuels(MOCK_DUEL_USER_ID);

    setLocalPoints(
      calculateTotalLocalPoints({
        matches,
        predictions: duelPredictions,
        rumors,
        transferPredictions,
        duels,
        userId: MOCK_USER_ID,
      }),
    );
  }, [backendEnabled, matches, rumors]);

  const mergedEntries = useMemo(() => {
    if (backendEnabled) {
      return entries.slice(0, compact ? 5 : 20);
    }

    const localEntry: LeaderboardEntry = {
      id: MOCK_USER_ID,
      display_name: "Вы",
      email: "ваш профиль",
      total_points: localPoints,
    };

    const withoutLocal = entries.filter((entry) => entry.id !== MOCK_USER_ID);
    return [...withoutLocal, localEntry].sort((a, b) => b.total_points - a.total_points).slice(0, compact ? 5 : 20);
  }, [backendEnabled, compact, entries, localPoints]);

  return <LeaderboardList entries={mergedEntries} currentUserId={backendEnabled ? currentUserId : MOCK_USER_ID} compact={compact} />;
}
