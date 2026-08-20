import type { Match, MatchPredictionRecord, PredictionChoice } from "@/types/database";

function getActualResult(match: Match): PredictionChoice | null {
  if (match.home_score === null || match.away_score === null) {
    return null;
  }

  if (match.home_score > match.away_score) {
    return "home";
  }

  if (match.home_score < match.away_score) {
    return "away";
  }

  return "draw";
}

export function calculatePredictionPoints(match: Match, prediction: Pick<MatchPredictionRecord, "result" | "score">) {
  const actualResult = getActualResult(match);

  if (!actualResult) {
    return null;
  }

  let points = 0;

  if (prediction.result === actualResult) {
    points += 10;
  }

  if (
    prediction.score.home !== null &&
    prediction.score.away !== null &&
    prediction.score.home === match.home_score &&
    prediction.score.away === match.away_score
  ) {
    points += 20;
  }

  return points;
}

export function calculatePredictionPreview(match: Match, prediction: Pick<MatchPredictionRecord, "result" | "score">) {
  return calculatePredictionPoints(match, prediction);
}

export function sumPredictionPoints(predictions: MatchPredictionRecord[], matches: Match[]) {
  const matchMap = new Map(matches.map((match) => [match.id, match]));

  return predictions.reduce((total, prediction) => {
    const match = matchMap.get(prediction.match_id);

    if (!match || match.status !== "finished") {
      return total;
    }

    return total + (calculatePredictionPoints(match, prediction) ?? 0);
  }, 0);
}
