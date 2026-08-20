"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { getStoredDuels, MOCK_DUEL_USER_ID } from "@/lib/duels/storage";
import { mockDuelPredictions } from "@/lib/mocks/duel-predictions";
import { MOCK_USER_ID, getStoredPredictions } from "@/lib/predictions/storage";
import { calculateTotalLocalPoints } from "@/lib/scoring/extended-points";
import { getStoredTransferPredictions, MOCK_TRANSFER_USER_ID } from "@/lib/transfers/storage";
import type { Match, TransferRumor } from "@/types/database";

interface HomeStatusCardProps {
  matches: Match[];
  rumors: TransferRumor[];
  hasLiveProfile: boolean;
  profileLabel: string;
  profilePoints?: number;
  backendEnabled?: boolean;
}

export function HomeStatusCard({
  matches,
  rumors,
  hasLiveProfile,
  profileLabel,
  profilePoints = 0,
  backendEnabled = false,
}: HomeStatusCardProps) {
  const [localPoints, setLocalPoints] = useState(0);
  const [predictionCount, setPredictionCount] = useState(0);

  useEffect(() => {
    if (backendEnabled) {
      return;
    }

    const predictions = getStoredPredictions(MOCK_USER_ID);
    const duelPredictions = [...mockDuelPredictions.filter((item) => item.user_id !== MOCK_USER_ID), ...predictions];
    const transferPredictions = getStoredTransferPredictions(MOCK_TRANSFER_USER_ID);
    const duels = getStoredDuels(MOCK_DUEL_USER_ID);
    setPredictionCount(predictions.length);
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

  return (
    <Card
      className="barca-panel border-accent/15 overflow-hidden"
      style={createPhotoPanelStyle(SECTION_BACKGROUNDS.homeStatus, { overlay: "strong", position: "center 38%" })}
    >
      <CardContent className="flex flex-col items-stretch justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="meta-label text-xs">Ваш статус</p>
          <p className="ui-value mt-1 text-lg font-semibold">
            {hasLiveProfile ? profileLabel : "Гость"}
          </p>
          <p className="ui-note text-sm">
            {hasLiveProfile
              ? "Вы в игре. Продолжайте делать прогнозы и подниматься в рейтинге."
              : backendEnabled
                ? "Войдите, чтобы сохранять прогнозы и видеть свои очки."
                : predictionCount > 0
                  ? `Сохранено прогнозов: ${predictionCount}.`
                  : "Сделайте первый прогноз и начните зарабатывать очки."}
          </p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-left sm:min-w-44 sm:text-right">
          <p className="meta-label text-xs">Очки</p>
          <p className="ui-value mt-1 text-2xl font-semibold">{backendEnabled ? profilePoints : localPoints}</p>
          <p className="ui-note text-xs">учитываются только завершённые матчи</p>
        </div>
      </CardContent>
    </Card>
  );
}
