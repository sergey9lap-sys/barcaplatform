import type { Match } from "@/types/database";

const createdAt = new Date().toISOString();

// Local 2026/27 seed. Supabase becomes the live schedule source after connection.
export const mockMatches: Match[] = [
  { id: "26000000-0000-4000-8000-000000000001", home_team: "Эльче", away_team: "Барселона", competition: "Ла Лига", venue: "Мануэль Мартинес Валеро", kickoff_at: "2026-08-23T19:30:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000002", home_team: "Барселона", away_team: "Атлетик Бильбао", competition: "Ла Лига", venue: "Камп Ноу", kickoff_at: "2026-08-27T19:00:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000003", home_team: "Барселона", away_team: "Райо Вальекано", competition: "Ла Лига", venue: "Камп Ноу", kickoff_at: "2026-08-31T19:30:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000004", home_team: "Валенсия", away_team: "Барселона", competition: "Ла Лига", venue: "Месталья", kickoff_at: "2026-09-06T14:15:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
];
