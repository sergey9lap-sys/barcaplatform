import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type VipArtworkId = "match-center" | "transfers" | "league" | "club" | "council" | "collection" | "lab" | "events";
export type FanArtworkId = "armchair" | "academy" | "supporter" | "analyst" | "scout" | "academy-expert" | "strategist" | "legend";

const VIP_POSITIONS: Record<VipArtworkId, string> = {
  "match-center": "0% 0%",
  transfers: "100% 0%",
  league: "0% 33.333%",
  club: "100% 33.333%",
  council: "0% 66.667%",
  collection: "100% 66.667%",
  lab: "0% 100%",
  events: "100% 100%",
};

const FAN_POSITIONS: Record<FanArtworkId, string> = {
  armchair: "0% 0%",
  academy: "33.333% 0%",
  supporter: "66.667% 0%",
  analyst: "100% 0%",
  scout: "0% 100%",
  "academy-expert": "33.333% 100%",
  strategist: "66.667% 100%",
  legend: "100% 100%",
};

export function VipArtwork({ id, className }: { id: VipArtworkId; className?: string }) {
  const style = {
    backgroundImage: "url('/visuals/vip-worlds-cinematic.png')",
    backgroundPosition: VIP_POSITIONS[id],
    backgroundSize: "200% 400%",
  } satisfies CSSProperties;

  return <span aria-hidden="true" className={cn("block bg-cover bg-no-repeat", className)} style={style} />;
}

export function FanArtwork({ id, className }: { id: FanArtworkId; className?: string }) {
  const style = {
    backgroundImage: "url('/visuals/fan-archetypes-cinematic.png')",
    backgroundPosition: FAN_POSITIONS[id],
    backgroundSize: "400% 200%",
  } satisfies CSSProperties;

  return <span aria-hidden="true" className={cn("block bg-cover bg-no-repeat", className)} style={style} />;
}
