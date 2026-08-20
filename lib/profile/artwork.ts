import type { FanArtworkId } from "@/components/visuals/vip-artwork";
import type { FanDnaType, GeniusRankType } from "@/types/database";

export function getFanDnaArtwork(dna: FanDnaType): FanArtworkId {
  if (dna === "tactical") return "strategist";
  if (dna === "risky") return "scout";
  if (dna === "emotional") return "supporter";
  return "analyst";
}

export function getGameRankArtwork(rank: GeniusRankType): FanArtworkId {
  if (rank === "genius") return "legend";
  if (rank === "analyst") return "analyst";
  return "armchair";
}

export function getAccountLevelArtwork(level: number): FanArtworkId {
  if (level <= 3) return "academy";
  if (level <= 7) return "supporter";
  if (level <= 12) return "analyst";
  if (level <= 18) return "scout";
  if (level <= 25) return "academy-expert";
  if (level <= 35) return "strategist";
  return "legend";
}

export function getRoleArtwork(role: string): FanArtworkId {
  if (role.includes("Скаут")) return "scout";
  if (role.includes("Трансфер")) return "academy-expert";
  if (role.includes("Тактическ")) return "strategist";
  if (role.includes("прогноз")) return "legend";
  return "analyst";
}
