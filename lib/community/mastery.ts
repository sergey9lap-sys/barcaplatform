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
  { key: "results", title: "Результаты", description: "Исходы матчей", xp: 760, correct: 18, attempts: 27 },
  { key: "score", title: "Точный счёт", description: "Попадания в счёт", xp: 420, correct: 6, attempts: 27 },
  { key: "tactics", title: "Тактик", description: "Стартовые составы", xp: 940, correct: 173, attempts: 220 },
  { key: "transfers", title: "Трансферы", description: "Входы и выходы", xp: 380, correct: 9, attempts: 14 },
  { key: "fantasy", title: "Fantasy", description: "Очки пятёрки", xp: 520, correct: 12, attempts: 18 },
  { key: "duels", title: "Дуэлянт", description: "Матчи один на один", xp: 290, correct: 11, attempts: 19 },
  { key: "knowledge", title: "Знания", description: "Проверяемые челленджи", xp: 240, correct: 31, attempts: 40 },
  { key: "analyst", title: "Аналитик", description: "Разборы после проверки", xp: 180, correct: 7, attempts: 11 },
  { key: "scout", title: "Скаут", description: "Ла Масия и игроки", xp: 90, correct: 4, attempts: 7 },
];

export function getMasteryLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

export function getOverallXp(tracks: MasteryTrack[]) {
  return tracks.reduce((total, track) => total + track.xp, 0);
}
