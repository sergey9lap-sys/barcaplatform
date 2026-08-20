function playerAsset(fileName: string) {
  return encodeURI(`/players/${fileName}`);
}

const PLAYER_AVATARS: Record<string, string> = {
  "Жоан Гарсия": playerAsset("joan-garcia-2026.jpg"),
  "Войцех Щенсны": playerAsset("szczesny-2026.jpg"),
  "Эдер Аллер": playerAsset("эдер аллер.jpg"),
  "Жоау Канселу": playerAsset("cancelo-2026.png"),
  "Алехандро Бальде": playerAsset("balde-2026.jpg"),
  "Рональд Араухо": playerAsset("рональд араухо.jpg"),
  "Пау Кубарси": playerAsset("cubarsi-2026.jpg"),
  "Андреас Кристенсен": playerAsset("christensen-2026.jpg"),
  "Жерар Мартин": playerAsset("gerard-martin-2026.jpg"),
  "Жюль Кунде": playerAsset("kounde-2026.jpg"),
  "Эрик Гарсия": playerAsset("eric-garcia-2026.jpg"),
  "Гави": playerAsset("gavi-2026.jpg"),
  "Педри": playerAsset("pedri-2026.jpg"),
  "Фермин Лопес": playerAsset("fermin-2026.jpg"),
  "Марк Касадо": playerAsset("марк касадо.jpg"),
  "Дани Ольмо": playerAsset("olmo-2026.jpg"),
  "Френки де Йонг": playerAsset("de-jong-2026.png"),
  "Марк Берналь": playerAsset("bernal-2026.jpg"),
  "Томми Маркес": playerAsset("тамми маркес.jpg"),
  "Ферран Торрес": playerAsset("ферран торрес.jpg"),
  "Роберт Левандовски": playerAsset("роберт левандовски.jpg"),
  "Ламин Ямаль": playerAsset("lamine-2026.jpg"),
  "Рафинья": playerAsset("raphinha-2026.jpg"),
  "Энтони Гордон": playerAsset("gordon-2026.jpg"),
  "Карим Адейеми": playerAsset("adeyemi-2026.jpg"),
  "Джесси Бисиву": playerAsset("bisiwu-2026.jpg"),
  "Родри": playerAsset("rodri-2026.png"),
  "Хулиан Альварес": playerAsset("хулиан альварес.jpg"),
  "Лаутаро Мартинес": playerAsset("лаутаро мартинес.png"),
  "Кастелло Лукеба": playerAsset("кастелло лукеба.png"),
  "Эмерик Ляпорт": playerAsset("эмерик лапорт.png"),
  "Жорж Микаутадзе": playerAsset("жорж микаутадзе.png"),
  "Николо Тресольди": playerAsset("николо тресольди.png"),
  "Виктор Гёкереш": playerAsset("виктор гёкереш.png"),
  "Маркус Рэшфорд": playerAsset("маркус рэшфорд.jpg"),
  "Руни Барджи": playerAsset("руни бардагжи.jpg"),
  "Хави Эспарт": playerAsset("хави эспарт.jpg"),
  "Ханси Флик": playerAsset("hansi-flick-2026.jpg"),
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
