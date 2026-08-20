import { CHALLENGE_TEMPLATES } from "@/lib/challenges/engine";
import type { ChallengeRecord, Match } from "@/types/database";

function fromTemplate(key: string, overrides: Partial<ChallengeRecord>): ChallengeRecord {
  const template = CHALLENGE_TEMPLATES.find((item) => item.key === key)!;
  const now = new Date().toISOString();
  return {
    id: `mock-${key}`,
    title: template.title,
    description: template.description,
    template_key: key,
    day_mode: template.dayMode,
    phase: template.phase,
    cadence: template.cadence,
    response_type: template.responseType,
    verification_type: template.verificationType,
    skill_key: template.skillKey,
    match_id: null,
    options: template.options.map((label, index) => ({ id: `option-${index + 1}`, label, votes: 12 - index * 2 })),
    correct_answer: null,
    linked_route: template.linkedRoute ?? null,
    reward_coins: template.rewardCoins,
    reward_xp: template.rewardXp,
    target_count: template.cadence === "weekly" ? 5 : template.cadence === "monthly" ? 20 : 1,
    opens_at: null,
    closes_at: null,
    status: "published",
    featured: false,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

export function getMockChallenges(matches: Match[]) {
  const nextMatch = [...matches].filter((item) => item.status === "upcoming").sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())[0] ?? null;
  const matchId = nextMatch?.id ?? null;
  return [
    fromTemplate("daily-opinion", { id: "mock-position", title: "Какую позицию Барсе нужно усилить первой?", description: "Выберите самое важное усиление для следующего этапа сезона.", options: [{ id: "cb", label: "Центральный защитник", votes: 46 }, { id: "st", label: "Центральный нападающий", votes: 33 }, { id: "lw", label: "Левый вингер", votes: 14 }, { id: "none", label: "Состав уже укомплектован", votes: 7 }] }),
    fromTemplate("knowledge-quiz", { id: "mock-quiz", title: "Кто был самым молодым дебютантом Барсы в Ла Лиге?", description: "Один правильный ответ принесёт опыт в направление «Знания».", options: [{ id: "lamine", label: "Ламин Ямаль", votes: 58 }, { id: "bojan", label: "Боян Кркич", votes: 19 }, { id: "gavi", label: "Гави", votes: 15 }, { id: "messi", label: "Лионель Месси", votes: 8 }], correct_answer: "lamine" }),
    fromTemplate("transfer-debate", { id: "mock-transfer", title: "Какого форварда стоит подписать?", description: "Выберите профиль нападающего, который лучше подходит текущей Барсе.", options: [{ id: "alvarez", label: "Хулиан Альварес", votes: 42 }, { id: "lautaro", label: "Лаутаро Мартинес", votes: 31 }, { id: "gyokeres", label: "Виктор Гёкереш", votes: 20 }, { id: "academy", label: "Довериться Ла Масии", votes: 7 }] }),
    fromTemplate("match-score", { id: "mock-match-score", match_id: matchId, title: nextMatch ? `Точный счёт: ${nextMatch.home_team} — ${nextMatch.away_team}` : "Прогноз точного счёта" }),
    fromTemplate("starting-lineup", { id: "mock-lineup", match_id: matchId }),
    fromTemplate("fantasy-five", { id: "mock-fantasy", match_id: matchId }),
    fromTemplate("player-of-match", { id: "mock-motm", match_id: matchId, options: [{ id: "pedri", label: "Педри", votes: 35 }, { id: "lamine", label: "Ламин Ямаль", votes: 31 }, { id: "raphinha", label: "Рафинья", votes: 21 }, { id: "other", label: "Другой игрок", votes: 13 }] }),
    fromTemplate("post-ratings", { id: "mock-ratings", match_id: matchId }),
    fromTemplate("weekly-run", { id: "mock-weekly", featured: true, target_count: 5 }),
    fromTemplate("monthly-campaign", { id: "mock-monthly", featured: true, target_count: 20 }),
  ];
}
