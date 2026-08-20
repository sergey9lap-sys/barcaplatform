import type { CommunityUserRecord, ReputationType } from "@/types/database";

export type ActionType =
  | "submit_lineup"
  | "submit_transfer_opinion"
  | "submit_la_masia_prediction"
  | "write_analytics"
  | "receive_like"
  | "correct_prediction"
  | "daily_check_in";

const XP_REWARDS: Record<ActionType, number> = {
  submit_lineup: 50,
  submit_transfer_opinion: 30,
  submit_la_masia_prediction: 40,
  write_analytics: 80,
  receive_like: 10,
  correct_prediction: 150,
  daily_check_in: 20,
};

const POINT_REWARDS: Record<ActionType, number> = {
  submit_lineup: 20,
  submit_transfer_opinion: 10,
  submit_la_masia_prediction: 15,
  write_analytics: 30,
  receive_like: 5,
  correct_prediction: 80,
  daily_check_in: 10,
};

export function addUserXP(actionType: ActionType) {
  return XP_REWARDS[actionType];
}

export function addUserPoints(actionType: ActionType) {
  return POINT_REWARDS[actionType];
}

export function calculateLevel(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 90)) + 1);
}

export function getRankTitle(level: number) {
  if (level <= 3) return "Academy Fan";
  if (level <= 7) return "Culé Rookie";
  if (level <= 12) return "Barca Analyst";
  if (level <= 18) return "Tactical Scout";
  if (level <= 25) return "La Masia Expert";
  if (level <= 35) return "Elite Culé";
  return "Camp Nou Legend";
}

export function addReputation(type: ReputationType, amount: number) {
  return { type, amount };
}

export function getPrimaryRole(user: Pick<CommunityUserRecord, "analyst_reputation" | "scout_reputation" | "transfer_reputation" | "tactical_reputation" | "prediction_accuracy">) {
  const roles = [
    { label: "Analyst", value: user.analyst_reputation },
    { label: "Scout", value: user.scout_reputation },
    { label: "Transfer Guru", value: user.transfer_reputation },
    { label: "Tactical Expert", value: user.tactical_reputation },
    { label: "Prediction Master", value: user.prediction_accuracy },
  ];

  return roles.sort((a, b) => b.value - a.value)[0]?.label ?? "Analyst";
}
