import type { VipArtworkId } from "@/components/visuals/vip-artwork";
export interface VipModuleDefinition { slug: string; artwork: VipArtworkId; title: string; tag: string; text: string }
export const vipModules: VipModuleDefinition[] = [
  { slug: "match-center", artwork: "match-center", title: "Закрытый матч-центр", tag: "23 августа · 20:45", text: "Обсуждение матча в реальном времени, предматчевый разбор и быстрые тактические опросы." },
  { slug: "transfers", artwork: "transfers", title: "Трансферная комната", tag: "Окно открыто", text: "Досье целей, сравнение игроков, сценарии стоимости и закрытые прогнозы сообщества." },
  { slug: "league", artwork: "league", title: "Лига Socio", tag: "27-е место из 614", text: "Отдельный сезонный рейтинг участников без игрового преимущества и покупки очков." },
  { slug: "club", artwork: "club", title: "Закрытый клуб", tag: "128 участников онлайн", text: "Спокойные тематические комнаты: матчи, тактика, трансферы и Ла Масия." },
  { slug: "council", artwork: "council", title: "Совет Socio", tag: "Идёт голосование", text: "Выбор следующей темы, функции платформы и коллекционного выпуска месяца." },
  { slug: "collection", artwork: "collection", title: "Коллекционный выпуск", tag: "Экземпляр №0189", text: "Цифровая карточка месяца, тема профиля и кинематографичный постер участника." },
  { slug: "lab", artwork: "lab", title: "Личная лаборатория", tag: "9 показателей", text: "Тренды точности, сильные стороны и динамика вашего футбольного интеллекта." },
  { slug: "events", artwork: "events", title: "Закрытые эфиры", tag: "2 события в августе", text: "Разборы, вопросы гостям и живые встречи участников по расписанию." },
];
