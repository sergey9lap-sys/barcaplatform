import type { VipArtworkId } from "@/components/visuals/vip-artwork";
export interface VipModuleDefinition { slug: string; artwork: VipArtworkId; title: string; tag: string; text: string }
export const vipModules: VipModuleDefinition[] = [
  { slug: "match-center", artwork: "match-center", title: "Закрытый матч-центр", tag: "К ближайшему матчу", text: "Обсуждение матча, предматчевый разбор и быстрые тактические опросы." },
  { slug: "transfers", artwork: "transfers", title: "Трансферная комната", tag: "Живые досье", text: "Досье целей, сравнение игроков, сценарии стоимости и закрытые прогнозы сообщества." },
  { slug: "league", artwork: "league", title: "Лига Socio", tag: "Сезон 2026/27", text: "Отдельный сезонный рейтинг участников без игрового преимущества и покупки очков." },
  { slug: "club", artwork: "club", title: "Закрытый клуб", tag: "Обсуждения участников", text: "Спокойные тематические комнаты: матчи, тактика, трансферы и Ла Масия." },
  { slug: "council", artwork: "council", title: "Совет Socio", tag: "Идёт голосование", text: "Выбор следующей темы, функции платформы и коллекционного выпуска месяца." },
  { slug: "collection", artwork: "collection", title: "Коллекционный выпуск", tag: "Выпуск месяца", text: "Цифровая карточка месяца, тема профиля и кинематографичный постер участника." },
  { slug: "lab", artwork: "lab", title: "Личная лаборатория", tag: "Все навыки", text: "Тренды точности, сильные стороны и динамика вашего футбольного интеллекта." },
  { slug: "events", artwork: "events", title: "Закрытые эфиры", tag: "Расписание событий", text: "Разборы, вопросы гостям и живые встречи участников по расписанию." },
];
