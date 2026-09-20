import type { Match } from "@/types/database";

const createdAt = new Date().toISOString();

// Local 2026/27 seed. Supabase becomes the live schedule source after connection.
export const mockMatches: Match[] = [
  { id: "26000000-0000-4000-8000-000000000001", home_team: "Эльче", away_team: "Барселона", competition: "Ла Лига", venue: "Мануэль Мартинес Валеро", kickoff_at: "2026-08-23T19:30:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000002", home_team: "Барселона", away_team: "Атлетик Бильбао", competition: "Ла Лига", venue: "Камп Ноу", kickoff_at: "2026-08-27T19:00:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000003", home_team: "Барселона", away_team: "Райо Вальекано", competition: "Ла Лига", venue: "Камп Ноу", kickoff_at: "2026-08-31T19:30:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000004", home_team: "Валенсия", away_team: "Барселона", competition: "Ла Лига", venue: "Месталья", kickoff_at: "2026-09-06T14:15:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000005", home_team: "Барселона", away_team: "Фейеноорд", competition: "Лига чемпионов", venue: "Камп Ноу", kickoff_at: "2026-09-09T16:45:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000006", home_team: "Леванте", away_team: "Барселона", competition: "Ла Лига", venue: "Сьюдад де Валенсия", kickoff_at: "2026-09-13T14:15:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000007", home_team: "Барселона", away_team: "Расинг Сантандер", competition: "Ла Лига", venue: "Камп Ноу", kickoff_at: "2026-09-16T19:30:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000008", home_team: "Севилья", away_team: "Барселона", competition: "Ла Лига", venue: "Рамон Санчес Писхуан", kickoff_at: "2026-09-19T19:00:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000009", home_team: "Галатасарай", away_team: "Барселона", competition: "Лига чемпионов", venue: "RAMS Парк", kickoff_at: "2026-10-13T19:00:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000010", home_team: "Пари Сен-Жермен", away_team: "Барселона", competition: "Лига чемпионов", venue: "Парк де Пренс", kickoff_at: "2026-10-20T19:00:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000011", home_team: "Барселона", away_team: "Астон Вилла", competition: "Лига чемпионов", venue: "Камп Ноу", kickoff_at: "2026-11-03T20:00:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000012", home_team: "Сабах", away_team: "Барселона", competition: "Лига чемпионов", venue: "Бакинский олимпийский стадион", kickoff_at: "2026-11-25T17:45:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000013", home_team: "Барселона", away_team: "Манчестер Сити", competition: "Лига чемпионов", venue: "Камп Ноу", kickoff_at: "2026-12-08T20:00:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000014", home_team: "Спортинг", away_team: "Барселона", competition: "Лига чемпионов", venue: "Жозе Алваладе", kickoff_at: "2027-01-20T20:00:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
  { id: "26000000-0000-4000-8000-000000000015", home_team: "Барселона", away_team: "Комо", competition: "Лига чемпионов", venue: "Камп Ноу", kickoff_at: "2027-01-27T20:00:00.000Z", home_score: null, away_score: null, status: "upcoming", created_at: createdAt },
];
