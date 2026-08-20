import type { MatchPlayer } from "@/types/database";

const createdAt = new Date().toISOString();

const currentSquad = [
  { player_id: "player-joan-garcia", player_name: "Жоан Гарсия", player_number: 13, position: "GK" },
  { player_id: "player-wojciech-szczesny", player_name: "Войцех Щенсны", player_number: 25, position: "GK" },
  { player_id: "player-alejandro-balde", player_name: "Алехандро Бальде", player_number: 3, position: "DF" },
  { player_id: "player-ronald-araujo", player_name: "Рональд Араухо", player_number: 4, position: "DF" },
  { player_id: "player-pau-cubarsi", player_name: "Пау Кубарси", player_number: 5, position: "DF" },
  { player_id: "player-andreas-christensen", player_name: "Андреас Кристенсен", player_number: 15, position: "DF" },
  { player_id: "player-gerard-martin", player_name: "Жерар Мартин", player_number: 18, position: "DF" },
  { player_id: "player-jules-kounde", player_name: "Жюль Кунде", player_number: 23, position: "DF" },
  { player_id: "player-eric-garcia", player_name: "Эрик Гарсия", player_number: 24, position: "DF" },
  { player_id: "player-joao-cancelo", player_name: "Жоау Канселу", player_number: 2, position: "DF" },
  { player_id: "player-gavi", player_name: "Гави", player_number: 6, position: "MF" },
  { player_id: "player-pedri", player_name: "Педри", player_number: 8, position: "MF" },
  { player_id: "player-fermin-lopez", player_name: "Фермин Лопес", player_number: 16, position: "MF" },
  { player_id: "player-marc-casado", player_name: "Марк Касадо", player_number: 17, position: "MF" },
  { player_id: "player-dani-olmo", player_name: "Дани Ольмо", player_number: 20, position: "MF" },
  { player_id: "player-frenkie-de-jong", player_name: "Френки де Йонг", player_number: 21, position: "MF" },
  { player_id: "player-marc-bernal", player_name: "Марк Берналь", player_number: 22, position: "MF" },
  { player_id: "player-rodri", player_name: "Родри", player_number: null, position: "MF" },
  { player_id: "player-ferran-torres", player_name: "Ферран Торрес", player_number: 7, position: "FW" },
  { player_id: "player-lamine-yamal", player_name: "Ламин Ямаль", player_number: 10, position: "FW" },
  { player_id: "player-raphinha", player_name: "Рафинья", player_number: 11, position: "FW" },
  { player_id: "player-roony-bardghji", player_name: "Руни Барджи", player_number: 19, position: "FW" },
  { player_id: "player-anthony-gordon", player_name: "Энтони Гордон", player_number: null, position: "FW" },
  { player_id: "player-karim-adeyemi", player_name: "Карим Адейеми", player_number: null, position: "FW" },
  { player_id: "player-jesse-bisiwu", player_name: "Джесси Бисиву", player_number: null, position: "FW" },
  { player_id: "coach-hansi-flick", player_name: "Ханси Флик", player_number: null, position: "COACH" },
] as const;

const matchIds = [
  "laliga-2026-01",
  "laliga-2026-02",
  "laliga-2026-03",
  "laliga-2026-04",
] as const;

export const mockMatchPlayers: MatchPlayer[] = matchIds.flatMap((matchId, matchIndex) =>
  currentSquad.map((player, playerIndex) => ({
    id: `p-${matchIndex + 1}-${playerIndex + 1}`,
    match_id: matchId,
    player_id: player.player_id,
    player_name: player.player_name,
    player_number: player.player_number,
    position: player.position,
    created_at: createdAt,
  })),
);
