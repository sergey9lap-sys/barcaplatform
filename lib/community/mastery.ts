export type MasteryKey = "results" | "score" | "tactics" | "transfers" | "fantasy" | "duels" | "knowledge" | "analyst" | "scout";

export interface MasteryTrack {
  key: MasteryKey;
  title: string;
  description: string;
  xp: number;
  correct: number;
  attempts: number;
}

export const defaultMasteryTracks: MasteryTrack[] = [
  { key: "results", title: "Результаты", description: "Исходы матчей", xp: 0, correct: 0, attempts: 0 },
  { key: "score", title: "Точный счёт", description: "Попадания в счёт", xp: 0, correct: 0, attempts: 0 },
  { key: "tactics", title: "Тактик", description: "Стартовые составы", xp: 0, correct: 0, attempts: 0 },
  { key: "transfers", title: "Трансферы", description: "Входы и выходы", xp: 0, correct: 0, attempts: 0 },
  { key: "fantasy", title: "Фэнтези", description: "Очки пятёрки", xp: 0, correct: 0, attempts: 0 },
  { key: "duels", title: "Дуэлянт", description: "Матчи один на один", xp: 0, correct: 0, attempts: 0 },
  { key: "knowledge", title: "Знания", description: "Проверяемые футбольные вопросы", xp: 0, correct: 0, attempts: 0 },
  { key: "analyst", title: "Аналитик", description: "Проверенные разборы", xp: 0, correct: 0, attempts: 0 },
  { key: "scout", title: "Скаут", description: "Ла Масия и игроки", xp: 0, correct: 0, attempts: 0 },
];

export function getMasteryLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

export function getOverallXp(tracks: MasteryTrack[]) {
  return tracks.reduce((total, track) => total + track.xp, 0);
}

export function getAccountLevel(totalXp: number) {
  return Math.max(1, Math.floor(Math.max(0, totalXp) / 750) + 1);
}
