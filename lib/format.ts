export function formatMatchDate(value: string) {
  const isTimeTbd = /T00:00:00(?:\.000)?Z$/.test(value);
  const date = new Date(value);

  if (isTimeTbd) {
    const formattedDate = new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      timeZone: "Europe/Moscow",
    }).format(date);

    return `${formattedDate} · время уточняется`;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(date);
}
