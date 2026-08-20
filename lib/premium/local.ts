export type MembershipTier = "free" | "cule" | "pro" | "socio";

export const MEMBERSHIP_KEY = "barca-membership-v1";
export const PURCHASES_KEY = "barca-digital-purchases-v1";

export const membershipTiers = [
  { id: "cule" as const, name: "Кулес", price: 499, description: "Стиль и удобство для активного болельщика", features: ["Синяя рамка профиля", "Расширенные реакции", "3 премиальных шаблона постеров", "История прогнозов без лимита"] },
  { id: "pro" as const, name: "Кулес Про", price: 1490, description: "Глубокая аналитика и персонализация", features: ["Всё из уровня «Кулес»", "Персональная аналитика навыков", "Все темы тактической доски", "Расширенный экспорт и сравнения"] },
  { id: "socio" as const, name: "Socio 1899", price: 3990, description: "Закрытый цифровой клуб", features: ["Всё из уровня «Кулес Про»", "Матч-центр и трансферная комната", "Лига Socio и закрытый клуб", "Совет участников", "Нумерованный ежемесячный выпуск", "Закрытые эфиры"] },
];

export const digitalProducts = [
  { id: "frame-garnet", title: "Сине-гранатовая рамка", price: 49, category: "Профиль", description: "Живая сине-гранатовая окантовка аватара." },
  { id: "stickers-classic", title: "Классические стикеры кулес", price: 79, category: "Общение", description: "12 реакций для матчевых обсуждений." },
  { id: "field-night", title: "Поле «Ночной стадион»", price: 99, category: "Тактика", description: "Тёмная дизайнерская тема тактической доски." },
  { id: "poster-matchday", title: "Постер матча", price: 149, category: "Экспорт", description: "Премиальный шаблон состава и прогноза." },
  { id: "goal-reaction", title: "Пульс гола", price: 39, category: "Анимация", description: "Микро-анимация празднования в профиле." },
  { id: "profile-1899", title: "Тема 1899", price: 299, category: "Профиль", description: "Историческая тема карточки болельщика." },
];
