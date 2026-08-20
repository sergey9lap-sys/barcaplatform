import type { MasteryKey } from "@/lib/community/mastery";
import type {
  ChallengeCadence,
  ChallengeDayMode,
  ChallengePhase,
  ChallengeRecord,
  ChallengeResponseType,
  ChallengeVerificationType,
  Match,
} from "@/types/database";

export interface ChallengeTemplateDefinition {
  key: string;
  title: string;
  description: string;
  dayMode: ChallengeDayMode;
  phase: ChallengePhase;
  cadence: ChallengeCadence;
  responseType: ChallengeResponseType;
  verificationType: ChallengeVerificationType;
  rewardCoins: number;
  rewardXp: number;
  skillKey: MasteryKey | null;
  options: string[];
  linkedRoute?: string;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplateDefinition[] = [
  { key: "daily-opinion", title: "Вопрос дня", description: "Простой вопрос, в котором болельщики могут выразить своё мнение.", dayMode: "ordinary", phase: "daily", cadence: "daily", responseType: "single_choice", verificationType: "participation", rewardCoins: 15, rewardXp: 0, skillKey: null, options: ["Вариант 1", "Вариант 2", "Другой вариант"] },
  { key: "knowledge-quiz", title: "Викторина", description: "Проверяемый вопрос об истории, игроках или матчах Барселоны.", dayMode: "ordinary", phase: "daily", cadence: "daily", responseType: "single_choice", verificationType: "correct_answer", rewardCoins: 15, rewardXp: 10, skillKey: "knowledge", options: ["Ответ 1", "Ответ 2", "Ответ 3", "Ответ 4"] },
  { key: "transfer-debate", title: "Трансферное мнение", description: "Кого подписать, продать или оставить в составе.", dayMode: "ordinary", phase: "daily", cadence: "daily", responseType: "single_choice", verificationType: "participation", rewardCoins: 20, rewardXp: 0, skillKey: null, options: ["Подписать", "Не подписывать", "Продолжить наблюдение"] },
  { key: "squad-builder", title: "Идеальный состав", description: "Соберите собственную версию состава или тактической схемы.", dayMode: "ordinary", phase: "daily", cadence: "daily", responseType: "action", verificationType: "manual", rewardCoins: 20, rewardXp: 15, skillKey: "tactics", options: [], linkedRoute: "/matches" },
  { key: "match-score", title: "Прогноз на матч", description: "Укажите точный счёт до стартового свистка.", dayMode: "matchday", phase: "pre_match", cadence: "daily", responseType: "score", verificationType: "match_result", rewardCoins: 25, rewardXp: 40, skillKey: "score", options: [] },
  { key: "starting-lineup", title: "Стартовый состав", description: "Соберите стартовые одиннадцать до начала матча.", dayMode: "matchday", phase: "pre_match", cadence: "daily", responseType: "action", verificationType: "match_result", rewardCoins: 25, rewardXp: 35, skillKey: "tactics", options: [], linkedRoute: "/matches/{matchId}" },
  { key: "fantasy-five", title: "Fantasy-пятёрка", description: "Выберите пять игроков в рамках доступного бюджета.", dayMode: "matchday", phase: "pre_match", cadence: "daily", responseType: "action", verificationType: "match_result", rewardCoins: 25, rewardXp: 30, skillKey: "fantasy", options: [], linkedRoute: "/fantasy" },
  { key: "player-of-match", title: "Игрок матча", description: "Выберите лучшего футболиста после финального свистка.", dayMode: "matchday", phase: "post_match", cadence: "daily", responseType: "single_choice", verificationType: "participation", rewardCoins: 20, rewardXp: 0, skillKey: null, options: ["Игрок 1", "Игрок 2", "Игрок 3"] },
  { key: "post-ratings", title: "Оценки после матча", description: "Составьте рейтинг сыгравших футболистов.", dayMode: "matchday", phase: "post_match", cadence: "daily", responseType: "action", verificationType: "participation", rewardCoins: 30, rewardXp: 0, skillKey: null, options: [], linkedRoute: "/matches/{matchId}" },
  { key: "weekly-run", title: "Недельная серия", description: "Выполните пять ежедневных заданий за неделю.", dayMode: "any", phase: "daily", cadence: "weekly", responseType: "action", verificationType: "manual", rewardCoins: 150, rewardXp: 30, skillKey: "knowledge", options: [] },
  { key: "monthly-campaign", title: "Месяц кулес", description: "Закройте двадцать ежедневных заданий за месяц.", dayMode: "any", phase: "daily", cadence: "monthly", responseType: "action", verificationType: "manual", rewardCoins: 500, rewardXp: 75, skillKey: "knowledge", options: [] },
];

export interface ChallengeDayContext {
  mode: "ordinary" | "matchday";
  phase: ChallengePhase;
  match: Match | null;
  label: string;
  description: string;
}

function sameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function getChallengeDayContext(matches: Match[], now = new Date()): ChallengeDayContext {
  const match = [...matches]
    .sort((a, b) => Math.abs(new Date(a.kickoff_at).getTime() - now.getTime()) - Math.abs(new Date(b.kickoff_at).getTime() - now.getTime()))
    .find((item) => sameLocalDay(new Date(item.kickoff_at), now)) ?? null;

  if (!match) {
    return { mode: "ordinary", phase: "daily", match: null, label: "Обычный день", description: "Сегодня можно прокачать знания, трансферное мышление и мнение о составе." };
  }

  const kickoff = new Date(match.kickoff_at).getTime();
  if (match.status === "finished") {
    return { mode: "matchday", phase: "post_match", match, label: "После матча", description: "Оцените игроков, тренера и ключевые решения завершённой встречи." };
  }

  if (now.getTime() >= kickoff) {
    return { mode: "matchday", phase: "daily", match, label: "Матч идёт", description: "Предматчевые ответы закрыты. Послематчевые задания откроются после обновления результата." };
  }

  return { mode: "matchday", phase: "pre_match", match, label: "День матча", description: "Сделайте прогнозы и соберите состав до стартового свистка." };
}

export function isChallengeAvailable(challenge: ChallengeRecord, context: ChallengeDayContext, now = new Date()) {
  if (challenge.status !== "published") return false;
  if (challenge.opens_at && new Date(challenge.opens_at) > now) return false;
  if (challenge.closes_at && new Date(challenge.closes_at) < now) return false;
  if (challenge.cadence !== "daily") return true;
  if (challenge.day_mode !== "any" && challenge.day_mode !== context.mode) return false;
  if (challenge.day_mode === "matchday" && challenge.phase !== context.phase) return false;
  if (challenge.match_id && challenge.match_id !== context.match?.id) return false;
  return true;
}

export function resolveChallengeRoute(challenge: ChallengeRecord, context: ChallengeDayContext) {
  return challenge.linked_route?.replace("{matchId}", challenge.match_id ?? context.match?.id ?? "") ?? null;
}

export const CHALLENGE_LABELS = {
  dayMode: { ordinary: "Обычный день", matchday: "День матча", any: "Любой день" },
  phase: { daily: "В течение дня", pre_match: "До матча", post_match: "После матча" },
  cadence: { daily: "Ежедневный", weekly: "Недельный", monthly: "Месячный" },
  response: { single_choice: "Один вариант", multiple_choice: "Несколько вариантов", text: "Короткий текст", scale: "Шкала 1–10", score: "Прогноз счёта", action: "Действие на платформе" },
  verification: { participation: "За участие", correct_answer: "Правильный ответ", match_result: "После результата", manual: "Проверяет администратор" },
} as const;
