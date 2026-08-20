import type { LeaderboardEntry } from "@/types/database";

export const mockLeaderboardEntries: LeaderboardEntry[] = [
  {
    id: "mock-fan-1",
    display_name: "Капитан кулес",
    email: "captain@barca.local",
    total_points: 52,
  },
  {
    id: "mock-fan-2",
    display_name: "Блауграна аналитик",
    email: "brain@barca.local",
    total_points: 44,
  },
  {
    id: "mock-fan-3",
    display_name: "Скаут Ла Масии",
    email: "scout@barca.local",
    total_points: 37,
  },
  {
    id: "mock-fan-4",
    display_name: "Предсказатель матча",
    email: "mystic@barca.local",
    total_points: 29,
  },
];
