import type { MatchPlayer, PlayerRankingRecord, PlayerRankingSummary, SeasonPlayerStat } from "@/types/database";

export const MIN_MATCH_RANKINGS = 15;
export const MAX_MATCH_RANKINGS = 17;

export function isValidMatchRankingCount(count: number) {
  return count >= MIN_MATCH_RANKINGS && count <= MAX_MATCH_RANKINGS;
}

export function getSeasonPointsFromRank(rankPosition: number, rankedPlayerCount = 16) {
  const total = Math.max(2, rankedPlayerCount);
  const rank = Math.max(1, Math.min(rankPosition, total));

  // Keep every match equally valuable: first place is always 16 points and
  // last place is always 1 point, whether 15, 16 or 17 players took part.
  return Math.round(1 + ((total - rank) / (total - 1)) * 15);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function buildRankingSummaryByPlayer(
  players: MatchPlayer[],
  rankings: PlayerRankingRecord[],
) {
  return new Map<string, PlayerRankingSummary>(
    players.map((player) => {
      const playerRankings = rankings.filter((item) => item.match_player_id === player.id);
      const averageRankPosition = playerRankings.length
        ? round(playerRankings.reduce((sum, item) => sum + item.rank_position, 0) / playerRankings.length)
        : 0;

      return [
        player.id,
        {
          match_player_id: player.id,
          average_rank_position: averageRankPosition,
          rankings_count: playerRankings.length,
        },
      ];
    }),
  );
}

export function buildSeasonPlayerStats(
  rankings: PlayerRankingRecord[],
  matchPlayers: MatchPlayer[],
) {
  const playerMap = new Map(matchPlayers.map((player) => [player.id, player]));
  const seasonMap = new Map<string, SeasonPlayerStat>();
  const ballotSizes = new Map<string, number>();

  rankings.forEach((ranking) => {
    const ballotKey = `${ranking.match_id}:${ranking.user_id}`;
    ballotSizes.set(ballotKey, Math.max(ballotSizes.get(ballotKey) ?? 0, ranking.rank_position));
  });

  rankings.forEach((ranking) => {
    const matchPlayer = playerMap.get(ranking.match_player_id);
    if (!matchPlayer) {
      return;
    }

    const stablePlayerId = matchPlayer.player_id ?? `name:${matchPlayer.player_name}`;
    const existing = seasonMap.get(stablePlayerId);
    const ballotSize = ballotSizes.get(`${ranking.match_id}:${ranking.user_id}`) ?? 16;

    if (!existing) {
      seasonMap.set(stablePlayerId, {
        player_id: stablePlayerId,
        player_name: matchPlayer.player_name,
        total_points: getSeasonPointsFromRank(ranking.rank_position, ballotSize),
        average_rank_position: ranking.rank_position,
        matches_ranked: 1,
        first_place_count: ranking.rank_position === 1 ? 1 : 0,
        top_three_count: ranking.rank_position <= 3 ? 1 : 0,
        last_place_count: ranking.rank_position === ballotSize ? 1 : 0,
        goals: 0,
        assists: 0,
        pre_assists: 0,
        goal_influences: 0,
        matches_played: 0,
        minutes_played: 0,
        avatar_url: null,
      });
      return;
    }

    const nextMatchesRanked = existing.matches_ranked + 1;
    existing.total_points += getSeasonPointsFromRank(ranking.rank_position, ballotSize);
    existing.average_rank_position = round(
      (existing.average_rank_position * existing.matches_ranked + ranking.rank_position) / nextMatchesRanked,
    );
    existing.matches_ranked = nextMatchesRanked;
    existing.first_place_count += ranking.rank_position === 1 ? 1 : 0;
    existing.top_three_count += ranking.rank_position <= 3 ? 1 : 0;
    existing.last_place_count += ranking.rank_position === ballotSize ? 1 : 0;
  });

  return Array.from(seasonMap.values()).sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }

    if (b.first_place_count !== a.first_place_count) {
      return b.first_place_count - a.first_place_count;
    }

    if (b.top_three_count !== a.top_three_count) {
      return b.top_three_count - a.top_three_count;
    }

    if (a.average_rank_position !== b.average_rank_position) {
      return a.average_rank_position - b.average_rank_position;
    }

    return a.player_name.localeCompare(b.player_name, "ru");
  });
}
