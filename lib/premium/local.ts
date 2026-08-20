export type MembershipTier = "free" | "cule" | "pro" | "socio";

export const MEMBERSHIP_KEY = "barca-membership-v1";
export const PURCHASES_KEY = "barca-digital-purchases-v1";

export const membershipTiers = [
  { id: "cule" as const, name: "Culé", price: 499, description: "Стиль и удобство для активного болельщика", features: ["Синяя рамка профиля", "Расширенные реакции", "3 премиум-шаблона постеров", "История прогнозов без лимита"] },
  { id: "pro" as const, name: "Culé Pro", price: 1490, description: "Глубокая аналитика и персонализация", features: ["Всё из Culé", "Персональная аналитика навыков", "Все темы тактической доски", "Расширенный экспорт и сравнения"] },
  { id: "socio" as const, name: "Socio 1899", price: 3990, description: "Закрытый цифровой клуб", features: ["Всё из Culé Pro", "Matchroom и Transfer War Room", "VIP-лига и закрытый клуб", "VIP Council", "Нумерованный ежемесячный drop", "Закрытые live-события"] },
];

export const digitalProducts = [
  { id: "frame-garnet", title: "Рамка Blaugrana", price: 49, category: "Профиль", description: "Живая сине-гранатовая окантовка аватара." },
  { id: "stickers-classic", title: "Стикеры Culé Classic", price: 79, category: "Общение", description: "12 реакций для матчевых обсуждений." },
  { id: "field-night", title: "Поле Night Camp", price: 99, category: "Тактика", description: "Тёмная дизайнерская тема тактической доски." },
  { id: "poster-matchday", title: "Matchday Poster", price: 149, category: "Экспорт", description: "Премиальный шаблон состава и прогноза." },
  { id: "goal-reaction", title: "Goal Pulse", price: 39, category: "Анимация", description: "Микро-анимация празднования в профиле." },
  { id: "profile-1899", title: "Тема 1899", price: 299, category: "Профиль", description: "Историческая тема карточки болельщика." },
];
