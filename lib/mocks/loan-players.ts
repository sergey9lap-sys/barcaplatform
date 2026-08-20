import type { LoanPlayerRecord } from "@/types/database";

export const mockLoanPlayers: LoanPlayerRecord[] = [
  {
    id: "loan-ansu",
    name: "Ансу Фати",
    position: "Вингер",
    loan_club: "Севилья",
    loan_ends_at: "30 июня 2026",
    status: "Нужен сезон с минутами",
    coach_system_fit_score: 70,
    barca_fit_score: 84,
    community_decision: "Дать шанс на сборах",
  },
  {
    id: "loan-pablo-torre",
    name: "Пабло Торре",
    position: "Атакующий полузащитник",
    loan_club: "Жирона",
    loan_ends_at: "30 июня 2026",
    status: "Следить за прогрессом без мяча",
    coach_system_fit_score: 78,
    barca_fit_score: 86,
    community_decision: "Вернуть",
  },
  {
    id: "loan-vitor-roque",
    name: "Витор Роке",
    position: "Нападающий",
    loan_club: "Бетис",
    loan_ends_at: "30 июня 2026",
    status: "Решение зависит от роли в прессинге",
    coach_system_fit_score: 66,
    barca_fit_score: 72,
    community_decision: "Оставить в аренде",
  },
];
