import { calculatePredictionPoints } from "@/lib/predictions/points";
import type {
  FanProfileInsights,
  GeniusRankType,
  LineupPredictionRecord,
  Match,
  MatchPredictionRecord,
  PlayerRankingRecord,
  TransferPredictionRecord,
} from "@/types/database";

function getRank(accuracyPercent: number): Pick<FanProfileInsights, "rank" | "rank_title" | "rank_description"> {
  const rank: GeniusRankType =
    accuracyPercent > 80 ? "genius" : accuracyPercent >= 50 ? "analyst" : "armchair";

  if (rank === "genius") {
    return {
      rank,
      rank_title: "Гений игры",
      rank_description: "Вы читаете матчи раньше остальных и почти не ошибаетесь в ключевых развилках.",
    };
  }

  if (rank === "analyst") {
    return {
      rank,
      rank_title: "Аналитик",
      rank_description: "У вас сильное понимание игры и хороший процент попаданий по исходам.",
    };
  }

  return {
    rank,
    rank_title: "Диванный эксперт",
    rank_description: "У вас есть интуиция, но ей пока не хватает стабильности на дистанции.",
  };
}

function getDnaProfile({
  predictions,
  lineups,
  exactScores,
}: {
  predictions: MatchPredictionRecord[];
  lineups: LineupPredictionRecord[];
  exactScores: number;
}) {
  const totalPredictions = predictions.length;
  const homePicks = predictions.filter((item) => item.result === "home").length;
  const nonHomePicks = predictions.filter((item) => item.result !== "home").length;
  const homeRatio = totalPredictions ? homePicks / totalPredictions : 0;
  const riskyRatio = totalPredictions ? nonHomePicks / totalPredictions : 0;
  const lineupsRatio = totalPredictions ? lineups.length / totalPredictions : 0;
  const exactRatio = totalPredictions ? exactScores / totalPredictions : 0;

  if (lineups.length >= 2 && lineupsRatio >= 0.45) {
    return {
      dna: "tactical" as const,
      dna_title: "Тактический стратег",
      dna_description: "Вы не просто выбираете победителя, а думаете структурой состава и рисунком игры.",
    };
  }

  if (riskyRatio >= 0.45) {
    return {
      dna: "risky" as const,
      dna_title: "Рискованный визионер",
      dna_description: "Вы не идёте за толпой и часто ставите на неожиданный сценарий матча.",
    };
  }

  if (homeRatio >= 0.7 && exactRatio < 0.35) {
    return {
      dna: "safe" as const,
      dna_title: "Надёжный прагматик",
      dna_description: "Вы чаще ставите на понятный сценарий и делаете спокойные, собранные прогнозы.",
    };
  }

  return {
    dna: "emotional" as const,
    dna_title: "Эмоциональный фанат",
    dna_description: "Вы чувствуете игру сердцем, а не только цифрами, и в этом ваш стиль прогноза.",
  };
}

export function buildFanProfileInsights({
  matches,
  predictions,
  lineups,
  transferPredictions,
  playerRankings,
}: {
  matches: Match[];
  predictions: MatchPredictionRecord[];
  lineups: LineupPredictionRecord[];
  transferPredictions: TransferPredictionRecord[];
  playerRankings: PlayerRankingRecord[];
}): FanProfileInsights {
  const matchMap = new Map(matches.map((match) => [match.id, match]));
  const finishedPredictions = predictions.filter((prediction) => {
    const match = matchMap.get(prediction.match_id);
    return match?.status === "finished";
  });

  const correctResults = finishedPredictions.filter((prediction) => {
    const match = matchMap.get(prediction.match_id);
    if (!match) {
      return false;
    }

    return (calculatePredictionPoints(match, prediction) ?? 0) >= 10;
  }).length;

  const exactScores = finishedPredictions.filter((prediction) => {
    const match = matchMap.get(prediction.match_id);
    if (!match || match.home_score === null || match.away_score === null) {
      return false;
    }

    return prediction.score.home === match.home_score && prediction.score.away === match.away_score;
  }).length;

  const accuracyPercent = finishedPredictions.length
    ? Math.round((correctResults / finishedPredictions.length) * 100)
    : 0;

  const rank = getRank(accuracyPercent);
  const dna = getDnaProfile({
    predictions,
    lineups,
    exactScores,
  });

  return {
    ...dna,
    ...rank,
    accuracy_percent: accuracyPercent,
    correct_results: correctResults,
    exact_scores: exactScores,
    finished_predictions: finishedPredictions.length,
    lineups_saved: lineups.length,
    transfer_calls: transferPredictions.length,
    player_rankings_submitted: playerRankings.length,
  };
}
