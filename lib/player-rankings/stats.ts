import type { MatchPlayer, PlayerRankingRecord, PlayerRankingSummary, SeasonPlayerStat } from "@/types/database";

export const MAX_MATCH_RANKINGS = 16;

export function getSeasonPointsFromRank(rankPosition: number) {
  return Math.max(1, MAX_MATCH_RANKINGS - rankPosition + 1);
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

  rankings.forEach((ranking) => {
    const matchPlayer = playerMap.get(ranking.match_player_id);
    if (!matchPlayer) {
      return;
    }

    const stablePlayerId = matchPlayer.player_id ?? `name:${matchPlayer.player_name}`;
    const existing = seasonMap.get(stablePlayerId);

    if (!existing) {
      seasonMap.set(stablePlayerId, {
        player_id: stablePlayerId,
        player_name: matchPlayer.player_name,
        total_points: getSeasonPointsFromRank(ranking.rank_position),
        average_rank_position: ranking.rank_position,
        matches_ranked: 1,
        first_place_count: ranking.rank_position === 1 ? 1 : 0,
        top_three_count: ranking.rank_position <= 3 ? 1 : 0,
        last_place_count: ranking.rank_position === MAX_MATCH_RANKINGS ? 1 : 0,
        goals: 0,
        assists: 0,
        matches_played: 0,
        minutes_played: 0,
        avatar_url: null,
      });
      return;
    }

    const nextMatchesRanked = existing.matches_ranked + 1;
    existing.total_points += getSeasonPointsFromRank(ranking.rank_position);
    existing.average_rank_position = round(
      (existing.average_rank_position * existing.matches_ranked + ranking.rank_position) / nextMatchesRanked,
    );
    existing.matches_ranked = nextMatchesRanked;
    existing.first_place_count += ranking.rank_position === 1 ? 1 : 0;
    existing.top_three_count += ranking.rank_position <= 3 ? 1 : 0;
    existing.last_place_count += ranking.rank_position === MAX_MATCH_RANKINGS ? 1 : 0;
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
