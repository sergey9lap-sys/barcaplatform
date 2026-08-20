import type { TransferRumor } from "@/types/database";

const createdAt = new Date().toISOString();

type Seed = Pick<TransferRumor, "id" | "player_name" | "current_club" | "target_club" | "direction" | "position" | "status" | "resolved_outcome" | "probability_score" | "usefulness_score" | "barca_fit_score" | "coach_system_fit_score" | "risk_level" | "decision" | "short_reason">;

function rumor(seed: Seed): TransferRumor {
  return {
    ...seed,
    age: null,
    estimated_price: "Оценка клуба уточняется",
    salary_risk: seed.risk_level ?? "medium",
    community_votes: 320 + Number(seed.id.replace(/\D/g, "") || 1) * 41,
    window_label: "Лето 2026",
    recommendation: (seed.usefulness_score ?? 0) >= 7,
    notes: seed.status === "resolved" ? "Добавлен в актуальный состав локальной версии." : "Очки за прогноз будут начислены только после официального решения.",
    image_url: null,
    created_at: createdAt,
  };
}

export const mockTransferRumors: TransferRumor[] = [
  rumor({ id: "official-1", player_name: "Энтони Гордон", current_club: "Ньюкасл", target_club: "Барселона", direction: "incoming", position: "Левый вингер", status: "resolved", resolved_outcome: true, probability_score: 10, usefulness_score: 9, barca_fit_score: 88, coach_system_fit_score: 91, risk_level: "medium", decision: "buy", short_reason: "Темп, агрессия без мяча и вертикальная угроза на левом фланге." }),
  rumor({ id: "official-2", player_name: "Карим Адейеми", current_club: "Боруссия Дортмунд", target_club: "Барселона", direction: "incoming", position: "Нападающий", status: "resolved", resolved_outcome: true, probability_score: 10, usefulness_score: 8, barca_fit_score: 84, coach_system_fit_score: 89, risk_level: "medium", decision: "buy", short_reason: "Даёт глубину, скорость и несколько ролей в атакующей линии." }),
  rumor({ id: "official-3", player_name: "Джесси Бисиву", current_club: "Клуб уточняется", target_club: "Барселона", direction: "incoming", position: "Вингер", status: "resolved", resolved_outcome: true, probability_score: 10, usefulness_score: 7, barca_fit_score: 81, coach_system_fit_score: 80, risk_level: "low", decision: "buy", short_reason: "Молодой вертикальный профиль для глубины и развития." }),
  rumor({ id: "official-4", player_name: "Родри", current_club: "Манчестер Сити", target_club: "Барселона", direction: "incoming", position: "Опорный полузащитник", status: "resolved", resolved_outcome: true, probability_score: 10, usefulness_score: 10, barca_fit_score: 96, coach_system_fit_score: 94, risk_level: "medium", decision: "buy", short_reason: "Контроль темпа, позиционная надёжность и элитная игра под давлением." }),
  rumor({ id: "official-5", player_name: "Жоау Канселу", current_club: "Манчестер Сити", target_club: "Барселона", direction: "incoming", position: "Фланговый защитник", status: "resolved", resolved_outcome: true, probability_score: 10, usefulness_score: 8, barca_fit_score: 87, coach_system_fit_score: 82, risk_level: "medium", decision: "buy", short_reason: "Техническое качество, вариативность фланга и продвижение мяча." }),
  rumor({ id: "rumor-1", player_name: "Хулиан Альварес", current_club: "Атлетико Мадрид", target_club: "Барселона", direction: "incoming", position: "Нападающий", status: "active", resolved_outcome: null, probability_score: 5, usefulness_score: 10, barca_fit_score: 94, coach_system_fit_score: 95, risk_level: "high", decision: "monitor", short_reason: "Элитный прессингующий форвард, но сделка будет очень сложной и дорогой." }),
  rumor({ id: "rumor-2", player_name: "Лаутаро Мартинес", current_club: "Интер", target_club: "Барселона", direction: "incoming", position: "Нападающий", status: "active", resolved_outcome: null, probability_score: 4, usefulness_score: 9, barca_fit_score: 89, coach_system_fit_score: 90, risk_level: "high", decision: "monitor", short_reason: "Готовый лидер атаки с работой без мяча и сильной игрой в штрафной." }),
  rumor({ id: "rumor-3", player_name: "Кастелло Лукеба", current_club: "РБ Лейпциг", target_club: "Барселона", direction: "incoming", position: "Центральный защитник", status: "active", resolved_outcome: null, probability_score: 7, usefulness_score: 9, barca_fit_score: 91, coach_system_fit_score: 93, risk_level: "medium", decision: "buy", short_reason: "Мобильный левоногий ЦЗ для высокой линии и выхода из-под прессинга." }),
  rumor({ id: "rumor-4", player_name: "Эмерик Ляпорт", current_club: "Атлетик Бильбао", target_club: "Барселона", direction: "incoming", position: "Центральный защитник", status: "active", resolved_outcome: null, probability_score: 6, usefulness_score: 7, barca_fit_score: 86, coach_system_fit_score: 82, risk_level: "medium", decision: "monitor", short_reason: "Опыт и сильная первая передача, но возраст требует точной финансовой оценки." }),
  rumor({ id: "rumor-5", player_name: "Жорж Микаутадзе", current_club: "Вильярреал", target_club: "Барселона", direction: "incoming", position: "Нападающий", status: "active", resolved_outcome: null, probability_score: 6, usefulness_score: 8, barca_fit_score: 84, coach_system_fit_score: 86, risk_level: "medium", decision: "monitor", short_reason: "Подвижный форвард, способный связывать линии и атаковать пространство." }),
  rumor({ id: "rumor-6", player_name: "Николо Тресольди", current_club: "Брюгге", target_club: "Барселона", direction: "incoming", position: "Нападающий", status: "active", resolved_outcome: null, probability_score: 5, usefulness_score: 7, barca_fit_score: 82, coach_system_fit_score: 84, risk_level: "medium", decision: "monitor", short_reason: "Развивающийся профиль девятки с потенциалом и доступной ролью в ротации." }),
  rumor({ id: "rumor-7", player_name: "Виктор Гёкереш", current_club: "Арсенал", target_club: "Барселона", direction: "incoming", position: "Нападающий", status: "active", resolved_outcome: null, probability_score: 4, usefulness_score: 9, barca_fit_score: 87, coach_system_fit_score: 89, risk_level: "high", decision: "monitor", short_reason: "Мощный завершитель и угроза в переходах, но цена и роль делают сделку сложной." }),
  rumor({ id: "outgoing-1", player_name: "Эктор Форт", current_club: "Барселона", target_club: "Клуб уточняется", direction: "outgoing", position: "Правый защитник", status: "active", resolved_outcome: null, probability_score: 7, usefulness_score: 6, barca_fit_score: 76, coach_system_fit_score: 70, risk_level: "low", decision: "monitor", short_reason: "Возможный уход ради стабильного игрового времени и следующего шага развития." }),
];
