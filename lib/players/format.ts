const POSITION_LABELS: Record<string, string> = {
  GK: "Вратарь",
  DF: "Защитник",
  MF: "Полузащитник",
  FW: "Нападающий",
  COACH: "Главный тренер",
};

export function formatPlayerPosition(position: string | null | undefined) {
  if (!position) {
    return "Игрок";
  }

  return POSITION_LABELS[position] ?? position;
}
