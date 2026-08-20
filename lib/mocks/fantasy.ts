import type { FantasyScoreRule, FantasySeason, FantasyTeam } from "@/types/database";

export const fantasyScoreRules: FantasyScoreRule[] = [
  { eventType: "goal", points: 5 },
  { eventType: "assist", points: 3 },
  { eventType: "clean_sheet_defender", points: 4 },
  { eventType: "clean_sheet_goalkeeper", points: 4 },
  { eventType: "correct_lineup_player", points: 2 },
  { eventType: "captain_multiplier", points: 0, multiplier: 2 },
  { eventType: "yellow_card", points: -1 },
  { eventType: "red_card", points: -3 },
];

export const mockFantasySeason: FantasySeason = {
  id: "fantasy-2026-27",
  title: "Fantasy 2026-27",
  startsAt: "2026-08-01",
  endsAt: "2027-06-01",
  isActive: false,
};

export const mockFantasyTeam: FantasyTeam = {
  id: "fantasy-team-preview",
  userId: "local-cule",
  matchId: "preview",
  players: [],
  captainId: "",
  createdAt: new Date().toISOString(),
  lockedAt: "Перед стартовым свистком",
  totalPoints: 0,
};
