import type { StandingZone, TransferDecision, TransferDirection, TransferRiskLevel, TransferRumor } from "@/types/database";

export function formatTransferDirection(direction: TransferDirection) {
  if (direction === "incoming") {
    return "На вход";
  }

  if (direction === "outgoing") {
    return "На выход";
  }

  return "Аренда";
}

export function formatTransferStatus(status: TransferRumor["status"]) {
  if (status === "resolved") {
    return "Закрыт";
  }

  if (status === "archived") {
    return "В архиве";
  }

  return "Открыт";
}

export function formatRecommendation(value: boolean | null, direction: TransferDirection) {
  if (value === null) {
    return "Без решения";
  }

  if (direction === "incoming") {
    return value ? "Стоит брать" : "Не стоит брать";
  }

  return value ? "Стоит отпускать" : "Лучше сохранить";
}

export function formatRiskLevel(value?: TransferRiskLevel | null) {
  if (value === "low") {
    return "Низкий";
  }

  if (value === "high") {
    return "Высокий";
  }

  return "Средний";
}

export function formatDecision(value?: TransferDecision | null, direction?: TransferDirection) {
  switch (value) {
    case "buy":
      return "Покупать";
    case "sell":
      return "Продавать";
    case "keep":
      return "Оставить";
    case "loan":
      return "В аренду";
    case "return":
      return "Вернуть";
    case "monitor":
      return "Наблюдать";
    default:
      return direction ? formatRecommendation(null, direction) : "Без решения";
  }
}

export function getZoneLabel(zone: StandingZone) {
  switch (zone) {
    case "ucl":
      return "Лига чемпионов";
    case "uel":
      return "Лига Европы";
    case "uecl":
      return "Лига конференций";
    case "relegation":
      return "Вылет";
    default:
      return "Середина таблицы";
  }
}

export function getZoneClassName(zone: StandingZone) {
  switch (zone) {
    case "ucl":
      return "bg-[#397cff]";
    case "uel":
      return "bg-[#ff9d1f]";
    case "uecl":
      return "bg-[#2bc769]";
    case "relegation":
      return "bg-[#ff4b4b]";
    default:
      return "bg-white/10";
  }
}
