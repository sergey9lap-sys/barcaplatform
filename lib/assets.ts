function playerAsset(fileName: string) {
  return encodeURI(`/players/${fileName}`);
}

const PLAYER_AVATARS: Record<string, string> = {
  "Жоан Гарсия": playerAsset("жоан гарсия.jpg"),
  "Войцех Щенсны": playerAsset("войцех щенсны.jpg"),
  "Эдер Аллер": playerAsset("эдер аллер.jpg"),
  "Жоау Канселу": playerAsset("жоао канселу.jpg"),
  "Алехандро Бальде": playerAsset("алехандро бальде.jpg"),
  "Рональд Араухо": playerAsset("рональд араухо.jpg"),
  "Пау Кубарси": playerAsset("пау кубарси.jpg"),
  "Андреас Кристенсен": playerAsset("андреас кристенсен.jpg"),
  "Жерар Мартин": playerAsset("жерар мартин.jpg"),
  "Жюль Кунде": playerAsset("жуль кунде.jpg"),
  "Эрик Гарсия": playerAsset("эрик гарсия.jpg"),
  "Гави": playerAsset("гави.jpg"),
  "Педри": playerAsset("педри.jpg"),
  "Фермин Лопес": playerAsset("фермин лопес.jpg"),
  "Марк Касадо": playerAsset("марк касадо.jpg"),
  "Дани Ольмо": playerAsset("дани ольмо.jpg"),
  "Френки де Йонг": playerAsset("френки де йонг.jpg"),
  "Марк Берналь": playerAsset("марк берналь.jpg"),
  "Томми Маркес": playerAsset("тамми маркес.jpg"),
  "Ферран Торрес": playerAsset("ферран торрес.jpg"),
  "Роберт Левандовски": playerAsset("роберт левандовски.jpg"),
  "Ламин Ямаль": playerAsset("ямаль.jpg"),
  "Рафинья": playerAsset("рафинья.jpg"),
  "Энтони Гордон": playerAsset("энтони гордон.png"),
  "Карим Адейеми": playerAsset("карим адейеми.png"),
  "Джесси Бисиву": playerAsset("джесси бисиву.png"),
  "Маркус Рэшфорд": playerAsset("маркус рэшфорд.jpg"),
  "Руни Барджи": playerAsset("руни бардагжи.jpg"),
  "Хави Эспарт": playerAsset("хави эспарт.jpg"),
  "Ханси Флик": playerAsset("ханси флик.jpg"),
};

const BARCA_CLEAN_BADGE_PATH = "/club/pngwing.com.png";

const TEAM_BADGES: Record<string, string> = {
  "Барселона": BARCA_CLEAN_BADGE_PATH,
};

export function getPlayerAvatarPath(playerName: string, avatarUrl?: string | null) {
  return avatarUrl || PLAYER_AVATARS[playerName] || null;
}

export function getTeamBadgePath(teamName: string, badgeUrl?: string | null) {
  return badgeUrl || TEAM_BADGES[teamName] || null;
}

export const BARCA_BADGE_PATH: string | null = BARCA_CLEAN_BADGE_PATH;
