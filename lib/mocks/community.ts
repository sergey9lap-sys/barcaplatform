import type { CommunityOpinionRecord, DailyChallengeRecord, NotificationRecord, StreamPickRecord } from "@/types/database";

export const mockOpinions: CommunityOpinionRecord[] = [
  {
    id: "opinion-nico-1",
    userId: "marta-press",
    userName: "MartaPress",
    userRole: "Тактический эксперт",
    targetType: "transfer",
    targetId: "rumor-1",
    text: "Если брать Лукеба, важно, чтобы он быстро освоил высокую линию и продвижение мяча под давлением.",
    likes: 42,
    createdAt: "сегодня",
    isPinnedByAdmin: true,
    adminReply: "Отличный фокус на роли без мяча. Разберём на стриме.",
  },
  {
    id: "opinion-bernal-1",
    userId: "masia-eye",
    userName: "MasiaEye",
    userRole: "Скаут",
    targetType: "la_masia",
    targetId: "marc-bernal",
    text: "Берналу нужна предсезонка с основой: там сразу станет видно, выдерживает ли он скорость решений.",
    likes: 35,
    createdAt: "вчера",
    isPinnedByAdmin: false,
  },
  {
    id: "opinion-pedri-1",
    userId: "local-cule",
    userName: "Вы",
    userRole: "Аналитик",
    targetType: "analytics",
    targetId: "analytics-pedri",
    text: "Педри должен быть не просто восьмёркой, а регулятором темпа. Главный вопрос только в нагрузке.",
    likes: 19,
    createdAt: "2 часа назад",
    isPinnedByAdmin: false,
  },
];

export const mockDailyChallenges: DailyChallengeRecord[] = [
  {
    id: "challenge-left-wing",
    title: "Кого бы ты выбрал на левый фланг?",
    type: "Transfer Battle",
    description: "Нужен игрок, который даст ширину, прессинг и качество в изоляциях.",
    options: [
      { label: "Кастелло Лукеба", votes: 48 },
      { label: "Рафа Леау", votes: 24 },
      { label: "Искать другой профиль", votes: 18 },
      { label: "Поднять игрока из La Masia", votes: 10 },
    ],
    rewardXP: 30,
    rewardPoints: 10,
    expiresAt: "сегодня 23:59",
  },
  {
    id: "challenge-preseason",
    title: "Кто из молодых заслуживает предсезонку?",
    type: "La Masia Pick",
    description: "Выберите игрока, которому стоит дать шанс с первой командой.",
    options: [
      { label: "Марк Берналь", votes: 39 },
      { label: "Тони Фернандес", votes: 31 },
      { label: "Пау Прим", votes: 17 },
      { label: "Гилье Фернандес", votes: 13 },
    ],
    rewardXP: 40,
    rewardPoints: 15,
    expiresAt: "завтра 12:00",
  },
];

export const mockNotifications: NotificationRecord[] = [
  {
    id: "notif-reply",
    type: "reply",
    title: "Тебе ответили на мнение",
    description: "Админ отметил твой разбор по Кастелло Лукеба.",
    createdAt: "10 мин назад",
    isRead: false,
    link: "/transfers",
  },
  {
    id: "notif-badge",
    type: "badge",
    title: "Получен бейдж",
    description: "Бейдж «ДНК Барсы» добавлен в профиль.",
    createdAt: "сегодня",
    isRead: false,
    link: "/profile",
  },
  {
    id: "notif-challenge",
    type: "challenge",
    title: "Новый челлендж дня",
    description: "Выбери кандидата на левый фланг и получи опыт.",
    createdAt: "сегодня",
    isRead: true,
    link: "/challenges",
  },
];

export const mockStreamPicks: StreamPickRecord[] = [
  {
    id: "stream-transfer-nico",
    user: "MartaPress",
    type: "transfer",
    title: "Лукеба для высокой линии",
    text: "Лучшее мнение недели по трансферному флангу.",
    status: "selected_for_stream",
  },
  {
    id: "stream-masia-bernal",
    user: "MasiaEye",
    type: "la_masia",
    title: "Бернал на предсезонку",
    text: "Скаутский аргумент про темп решений и роль опорника.",
    status: "featured",
  },
  {
    id: "stream-analytics-pedri",
    user: "Вы",
    type: "analytics",
    title: "Педри как регулятор темпа",
    text: "Компактная аналитика для обсуждения в эфире.",
    status: "discussed",
  },
];
