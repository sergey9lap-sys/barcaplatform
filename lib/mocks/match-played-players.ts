import type { MatchPlayedPlayer } from "@/types/database";

const createdAt = new Date().toISOString();

const playedPlayerIndexes = [0, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 21, 22] as const;
const matchIds = [
  "mock-match-1",
  "mock-match-2",
  "mock-match-3",
  "mock-match-4",
  "mock-match-5",
  "mock-match-6",
  "mock-match-7",
  "mock-match-8",
  "mock-match-9",
  "mock-match-10",
] as const;

export const mockMatchPlayedPlayers: MatchPlayedPlayer[] = matchIds.flatMap((matchId, matchIndex) =>
  playedPlayerIndexes.map((playerIndex, playedIndex) => ({
    id: `played-${matchIndex + 1}-${playedIndex + 1}`,
    match_id: matchId,
    match_player_id: `p-${matchIndex + 1}-${playerIndex + 1}`,
    created_at: createdAt,
  })),
);
