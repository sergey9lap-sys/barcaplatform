import { calculatePredictionPoints, sumPredictionPoints } from "@/lib/predictions/points";
import type {
  DuelRecord,
  Match,
  MatchPredictionRecord,
  TransferPredictionRecord,
  TransferRumor,
} from "@/types/database";

export function calculateTransferPredictionPoints(
  prediction: TransferPredictionRecord,
  rumor: TransferRumor,
  totalPredictionsForRumor = 0,
  correctPredictionsForRumor = 0,
) {
  if (rumor.status !== "resolved" || rumor.resolved_outcome === null) {
    return 0;
  }

  const predictedOutcome = prediction.prediction === "yes";
  if (predictedOutcome !== rumor.resolved_outcome) {
    return 0;
  }

  let points = 10;

  if (
    totalPredictionsForRumor >= 3 &&
    correctPredictionsForRumor > 0 &&
    correctPredictionsForRumor / totalPredictionsForRumor <= 0.35
  ) {
    points += 20;
  }

  return points;
}

export function sumTransferPoints(predictions: TransferPredictionRecord[], rumors: TransferRumor[]) {
  const predictionsByRumor = new Map<string, TransferPredictionRecord[]>();

  predictions.forEach((prediction) => {
    const current = predictionsByRumor.get(prediction.rumor_id) ?? [];
    current.push(prediction);
    predictionsByRumor.set(prediction.rumor_id, current);
  });

  return predictions.reduce((total, prediction) => {
    const rumor = rumors.find((item) => item.id === prediction.rumor_id);
    if (!rumor) {
      return total;
    }

    const rumorPredictions = predictionsByRumor.get(prediction.rumor_id) ?? [];
    const correctPredictions = rumorPredictions.filter((item) => {
      if (rumor.resolved_outcome === null) {
        return false;
      }

      return (item.prediction === "yes") === rumor.resolved_outcome;
    }).length;

    return total + calculateTransferPredictionPoints(prediction, rumor, rumorPredictions.length, correctPredictions);
  }, 0);
}

export function calculateDuelBonusForUser(
  duel: DuelRecord,
  userId: string,
  matches: Match[],
  predictions: MatchPredictionRecord[],
) {
  const match = matches.find((item) => item.id === duel.match_id);
  if (!match || match.status !== "finished") {
    return 0;
  }

  const challengerPrediction = predictions.find(
    (prediction) => prediction.user_id === duel.challenger_id && prediction.match_id === duel.match_id,
  );
  const opponentPrediction = predictions.find(
    (prediction) => prediction.user_id === duel.opponent_id && prediction.match_id === duel.match_id,
  );

  if (!challengerPrediction || !opponentPrediction) {
    return 0;
  }

  const challengerPoints = calculatePredictionPoints(match, challengerPrediction);
  const opponentPoints = calculatePredictionPoints(match, opponentPrediction);

  if (challengerPoints === null || opponentPoints === null || challengerPoints === opponentPoints) {
    return 0;
  }

  const winnerId = challengerPoints > opponentPoints ? duel.challenger_id : duel.opponent_id;

  return winnerId === userId ? 10 : 0;
}

export function sumDuelBonusPoints(
  duels: DuelRecord[],
  userId: string,
  matches: Match[],
  predictions: MatchPredictionRecord[],
) {
  return duels.reduce((total, duel) => total + calculateDuelBonusForUser(duel, userId, matches, predictions), 0);
}

export function calculateTotalLocalPoints({
  matches,
  predictions,
  rumors,
  transferPredictions,
  duels,
  userId,
}: {
  matches: Match[];
  predictions: MatchPredictionRecord[];
  rumors: TransferRumor[];
  transferPredictions: TransferPredictionRecord[];
  duels: DuelRecord[];
  userId: string;
}) {
  return (
    sumPredictionPoints(predictions, matches) +
    sumTransferPoints(transferPredictions, rumors) +
    sumDuelBonusPoints(duels, userId, matches, predictions)
  );
}
