import type { RewardItemRecord } from "@/types/database";

const kitSeasons = [
  "2000/01",
  "2001/02",
  "2002/03",
  "2003/04",
  "2004/05",
  "2005/06",
  "2006/07",
  "2007/08",
  "2008/09",
  "2009/10",
  "2010/11",
  "2011/12",
  "2012/13",
  "2013/14",
  "2014/15",
  "2015/16",
  "2016/17",
  "2017/18",
  "2018/19",
  "2019/20",
  "2020/21",
  "2021/22",
  "2022/23",
  "2023/24",
  "2024/25",
  "2025/26",
];

const iconicSeasons = new Set(["2005/06", "2008/09", "2010/11", "2014/15", "2015/16", "2022/23", "2025/26"]);
const specialSeasons = new Set(["2005/06", "2008/09", "2010/11", "2014/15", "2015/16", "2018/19", "2022/23", "2023/24", "2024/25", "2025/26"]);

function kitPrice(season: string, type: string) {
  if (iconicSeasons.has(season) && type === "Домашняя") return 18000;
  if (type.includes("Специальная") || type.includes("El Clasico") || type.includes("Юбилейная")) return 14000;
  if (type === "Третья") return iconicSeasons.has(season) ? 9000 : 5000;
  if (type === "Гостевая") return iconicSeasons.has(season) ? 8000 : 4500;
  return iconicSeasons.has(season) ? 7000 : 3500;
}

function kitRarity(season: string, type: string) {
  if (iconicSeasons.has(season) && type === "Домашняя") return "legendary" as const;
  if (type.includes("Специальная") || type.includes("El Clasico") || type.includes("Юбилейная")) return "epic" as const;
  if (iconicSeasons.has(season)) return "rare" as const;
  return "common" as const;
}

const seasonKits: RewardItemRecord[] = kitSeasons.flatMap((season) => {
  const baseTypes = ["Домашняя", "Гостевая", "Третья"];
  const extraTypes = specialSeasons.has(season) ? ["Четвертая", "Специальная"] : [];

  return [...baseTypes, ...extraTypes].map((type) => ({
    id: `kit-${season.replace("/", "-")}-${type}`,
    title: `${type} форма ${season}`,
    description: `Коллекционная ${type.toLowerCase()} форма сезона ${season}. Текстовая карточка готова под будущую фотографию комплекта.`,
    category: "Формы",
    pricePoints: kitPrice(season, type),
    rarity: kitRarity(season, type),
    status: iconicSeasons.has(season) ? "limited" : "available",
    stock: iconicSeasons.has(season) ? 8 : 40,
    isDigital: false,
    season,
    type,
    collectionName: `Сезон ${season}`,
    isLimited: iconicSeasons.has(season),
    tags: iconicSeasons.has(season) ? ["LIMITED", "легендарный сезон"] : ["сезонная коллекция"],
  }));
});

const spotifyItems: RewardItemRecord[] = [
  ["spotify-drake-ovo", "Drake OVO Edition", "2022/23", "Drake", 20000, "OVO owl crest и первый громкий Spotify x Barça drop."],
  ["spotify-rosalia", "ROSALÍA MOTOMAMI Edition", "2022/23", "ROSALÍA", 22000, "MOTOMAMI-энергия на форме для El Clasico."],
  ["spotify-rolling-stones", "The Rolling Stones Edition", "2023/24", "The Rolling Stones", 25000, "Культовый tongue logo в красно-синем контексте."],
  ["spotify-karol-g", "KAROL G Edition", "2023/24", "KAROL G", 20000, "Музыкальный drop с ярким фанатским вайбом."],
  ["spotify-coldplay", "Coldplay Moon Music Edition", "2024/25", "Coldplay", 27000, "Moon Music glow для ночей больших матчей."],
  ["spotify-travis-scott", "Travis Scott Cactus Jack Edition", "2024/25", "Travis Scott", 42000, "Cactus Jack drop с ultra-hype статусом."],
  ["spotify-ed-sheeran", "Ed Sheeran PLAY Edition", "2025/26", "Ed Sheeran", 25000, "PLAY Edition для новой волны Spotify x Barça."],
  ["spotify-olivia-rodrigo", "Olivia Rodrigo Edition", "2025/26", "Olivia Rodrigo", 25000, "Лимитированный pop-culture drop будущего сезона."],
].map(([id, title, season, artistName, pricePoints, shortDescription]) => ({
  id: String(id),
  title: String(title),
  description: String(shortDescription),
  category: "Spotify x Barça",
  pricePoints: Number(pricePoints),
  rarity: "legendary",
  status: "limited",
  stock: 8,
  isDigital: false,
  season: String(season),
  type: "Spotify Edition",
  artistName: String(artistName),
  collectionName: "Spotify x Barça Collection",
  isLimited: true,
  shortDescription: String(shortDescription),
  tags: ["Spotify x Barça", "LIMITED", "RARE DROP"],
  expiresLabel: "таймер drop: скоро",
})) satisfies RewardItemRecord[];

const ultraRareSpotify: RewardItemRecord[] = [
  ["spotify-travis-match-edition", "Travis Scott Match Edition", 80000],
  ["spotify-rolling-signed", "Rolling Stones Signed Edition", 95000],
  ["spotify-1899-one", "Spotify x Barça 1 of 1899", 150000],
].map(([id, title, pricePoints]) => ({
  id: String(id),
  title: String(title),
  description: "Ultra rare предмет с красно-золотым glow. Текстовый слот готов под фото и серийный номер.",
  category: "Spotify x Barça",
  pricePoints: Number(pricePoints),
  rarity: "ultra_legendary",
  status: "limited",
  stock: 1,
  isDigital: false,
  type: "Ultra Rare",
  collectionName: "Spotify x Barça Collection",
  isLimited: true,
  tags: ["Spotify x Barça", "LIMITED", "1 of 1899"],
  expiresLabel: "таймер ultra drop: скоро",
})) satisfies RewardItemRecord[];

const specialKits: RewardItemRecord[] = [
  ["ronaldinho-legacy-kit", "Ronaldinho Legacy Kit", "Legacy Edition", 30000, "legendary"],
  ["senyera-kit", "Senyera Kit", "Специальная", 18000, "epic"],
  ["saint-jordi-kit", "Saint Jordi Kit", "Специальная", 16000, "epic"],
  ["125-years-kit", "125 Years Anniversary Kit", "Юбилейная", 28000, "legendary"],
  ["el-clasico-edition", "El Clasico Edition", "El Clasico Edition", 22000, "legendary"],
  ["ucl-special-kit", "Champions League Special", "Специальная", 20000, "legendary"],
  ["training-special", "Training Special Edition", "Специальная", 10000, "epic"],
  ["legacy-edition", "Legacy Edition", "Legacy Edition", 18000, "epic"],
].map(([id, title, type, pricePoints, rarity]) => ({
  id: String(id),
  title: String(title),
  description: "Специальная форма Барселоны для коллекционеров фанатской истории.",
  category: "Лимитированные",
  pricePoints: Number(pricePoints),
  rarity: rarity as RewardItemRecord["rarity"],
  status: "limited",
  stock: 10,
  isDigital: false,
  type: String(type),
  collectionName: "Специальные формы Барселоны",
  isLimited: true,
  tags: ["LIMITED", "ONLY THIS SEASON"],
  expiresLabel: "таймер сезона: скоро",
})) satisfies RewardItemRecord[];

const retroItems: RewardItemRecord[] = [
  "Эра Роналдиньо",
  "Эра Гвардиолы",
  "Эра MSN",
  "Классическая Blaugrana",
  "Легендарные Эль-Класико",
  "История Лиги Чемпионов",
].flatMap((collectionName, index) => [
  {
    id: `retro-kit-${index}`,
    title: `${collectionName}: форма`,
    description: "Ретро-форма из легендарной фанатской эпохи.",
    category: "Ретро",
    pricePoints: 9000 + index * 1200,
    rarity: index < 3 ? "legendary" : "epic",
    status: "available",
    isDigital: false,
    collectionName,
    tags: ["ретро", collectionName],
  },
  {
    id: `retro-poster-${index}`,
    title: `${collectionName}: постер`,
    description: "Постер для коллекции воспоминаний о великой эпохе.",
    category: "Ретро",
    pricePoints: 3000 + index * 500,
    rarity: "epic",
    status: "available",
    isDigital: false,
    collectionName,
    tags: ["постер", collectionName],
  },
  {
    id: `retro-special-${index}`,
    title: `${collectionName}: специальный предмет`,
    description: "Коллекционный предмет, связанный с историей клуба.",
    category: "Ретро",
    pricePoints: 5500 + index * 700,
    rarity: "rare",
    status: "available",
    isDigital: false,
    collectionName,
    tags: ["спецпредмет", collectionName],
  },
]) satisfies RewardItemRecord[];

const merchData = [
  ["Стикеры", 700, "common"],
  ["Брелки", 1600, "common"],
  ["Кружки", 3500, "rare"],
  ["Коврики для мышки", 4500, "rare"],
  ["Бутылки", 5500, "rare"],
  ["Подушки", 4200, "rare"],
  ["Постеры", 3200, "rare"],
  ["Чехлы", 3800, "rare"],
  ["Кепки", 6500, "epic"],
  ["Худи", 15000, "epic"],
  ["Флаги", 4800, "rare"],
  ["Браслеты", 1400, "common"],
  ["Тренировочные футболки", 8500, "epic"],
  ["Рюкзаки", 11000, "epic"],
  ["Полотенца", 5200, "rare"],
  ["Пеналы", 1800, "common"],
  ["Блокноты", 1500, "common"],
  ["Носки", 2200, "common"],
  ["Мини-мячи", 6000, "rare"],
  ["Фигурки игроков", 12000, "epic"],
  ["Куртки", 26000, "legendary"],
];

const merchItems: RewardItemRecord[] = Array.from({ length: 42 }, (_, index) => {
  const [type, price, rarity] = merchData[index % merchData.length];
  const variant = Math.floor(index / merchData.length) + 1;
  return {
    id: `merch-${index + 1}`,
    title: `${type} Blaugrana ${variant}`,
    description: `Фанатская атрибутика: ${String(type).toLowerCase()} в стиле Барселоны.`,
    category: "Атрибутика",
    pricePoints: Number(price) + variant * 300,
    rarity: rarity as RewardItemRecord["rarity"],
    status: "available",
    stock: 20 + index,
    isDigital: false,
    type: String(type),
    collectionName: "Атрибутика Culé",
    tags: [String(type)],
  };
});

const digitalNames = [
  "Camp Nou Legend",
  "Tactical Genius",
  "La Masia Scout",
  "Transfer Oracle",
  "Barca DNA Master",
  "Pressing Monster",
  "Elite Culé",
  "Blaugrana King",
  "Эра Гвардиолы",
  "MSN",
  "Camp Nou Nights",
  "Classic Blaugrana",
  "Dark Barca",
  "La Masia Theme",
  "Golden Touch",
  "Midfield Brain",
  "Culé Aura",
  "UCL Nights",
  "Senyera Glow",
  "Masia Future",
  "Lineup Prophet",
  "Community Voice",
  "Transfer Expert",
  "Stream Regular",
  "El Clasico Fire",
  "Tiki-Taka Loop",
  "Animated Blaugrana",
  "Profile Spotlight",
  "Scout Lens",
  "Captain Aura",
  "Camp Nou Shadow",
  "Legacy Crown",
];

const digitalTypes = ["Рамки профиля", "Анимированные рамки", "Фоны профиля", "Темы интерфейса", "Glow эффекты", "Анимации профиля", "Бейджи", "Коллекционные титулы"];

const digitalItems: RewardItemRecord[] = digitalNames.map((name, index) => ({
  id: `digital-${index + 1}`,
  title: name,
  description: `${digitalTypes[index % digitalTypes.length]} для будущей публичной карточки профиля.`,
  category: "Цифровые награды",
  pricePoints: 300 + index * 280,
  rarity: index > 25 ? "legendary" : index > 16 ? "epic" : index > 7 ? "rare" : "common",
  status: "available",
  isDigital: true,
  type: digitalTypes[index % digitalTypes.length],
  collectionName: "Цифровой профиль Culé",
  tags: [digitalTypes[index % digitalTypes.length]],
}));

const privilegeNames = [
  "Приоритетный разбор состава",
  "Разбор трансферной идеи на стриме",
  "Разбор аналитики на стриме",
  "Выбор темы челленджа",
  "Предложение темы стрима",
  "VIP статус на неделю",
  "Цветной ник",
  "Highlight профиля",
  "Закреп мнения на стриме",
  "Доступ к закрытому голосованию",
  "Персональный Barca Fit Report",
  "Coach System Fit мини-разбор",
  "Приоритет в Stream Picks",
  "Голос в выборе debate недели",
  "Публичный scout shoutout",
  "Фанатский титул недели",
];

const privilegeItems: RewardItemRecord[] = privilegeNames.map((name, index) => ({
  id: `privilege-${index + 1}`,
  title: name,
  description: "Комьюнити-привилегия для стримов, челленджей и публичных подборок.",
  category: "Привилегии",
  pricePoints: 3000 + index * 1400,
  rarity: index > 10 ? "legendary" : index > 5 ? "epic" : "rare",
  status: "available",
  isDigital: true,
  type: "Привилегия",
  collectionName: "Stream Privileges",
  tags: ["стрим", "комьюнити"],
}));

const limitedItems: RewardItemRecord[] = [
  "El Clasico Drop",
  "UCL Drop",
  "Debut Kit Reward",
  "Anniversary Reward",
  "Final Night Poster",
  "Captain Armband Replica",
  "La Masia Debut Drop",
  "Only This Season Badge",
  "Rare Matchday Set",
  "Blaugrana Vault Key",
].map((name, index) => ({
  id: `limited-${index + 1}`,
  title: name,
  description: "Лимитированный предмет события сезона с временным drop-окном.",
  category: "Лимитированные",
  pricePoints: 9000 + index * 2500,
  rarity: index > 6 ? "legendary" : "epic",
  status: "limited",
  stock: 3 + index,
  isDigital: index % 2 === 0,
  collectionName: "Season Drops",
  isLimited: true,
  tags: index % 2 === 0 ? ["LIMITED", "ONLY THIS SEASON"] : ["LIMITED", "RARE DROP"],
  expiresLabel: "таймер события: скоро",
}));

export const rewardCollections = [
  { name: "Требл 2015", itemIds: ["kit-2014-15-Домашняя", "kit-2014-15-Гостевая", "retro-kit-2", "retro-poster-2"], bonus: "3000 bonus points + Treble aura" },
  { name: "Эра MSN", itemIds: ["kit-2014-15-Домашняя", "kit-2015-16-Домашняя", "retro-kit-2", "retro-special-2"], bonus: "бейдж MSN Collector" },
  { name: "Camp Nou Legends", itemIds: ["digital-1", "digital-18", "retro-special-3"], bonus: "profile glow Camp Nou Nights" },
  { name: "La Masia Future", itemIds: ["digital-3", "digital-20", "digital-29"], bonus: "бейдж Future Scout" },
  { name: "Guardiola Era", itemIds: ["kit-2008-09-Домашняя", "kit-2010-11-Домашняя", "retro-kit-1"], bonus: "Tiki-Taka титул" },
  { name: "Ronaldinho Era", itemIds: ["ronaldinho-legacy-kit", "kit-2005-06-Домашняя", "retro-kit-0"], bonus: "Ronaldinho Legacy glow" },
  { name: "UCL Winners", itemIds: ["ucl-special-kit", "retro-kit-5", "limited-2"], bonus: "UCL Nights frame" },
  { name: "El Clasico Icons", itemIds: ["el-clasico-edition", "spotify-rosalia", "spotify-rolling-stones"], bonus: "El Clasico Fire badge" },
  { name: "Spotify Collection", itemIds: spotifyItems.map((item) => item.id), bonus: "Spotify x Barça Collector + profile glow + bonus points" },
];

export const rewardItems: RewardItemRecord[] = [
  ...seasonKits,
  ...spotifyItems,
  ...ultraRareSpotify,
  ...specialKits,
  ...retroItems,
  ...merchItems,
  ...digitalItems,
  ...privilegeItems,
  ...limitedItems,
];
