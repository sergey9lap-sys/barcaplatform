import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type VipArtworkId = "match-center" | "transfers" | "league" | "club" | "council" | "collection" | "lab" | "events";
export type FanArtworkId = "armchair" | "analyst" | "genius" | "tactician" | "scout" | "predictor";
const VIP_POSITIONS: Record<VipArtworkId, string> = { "match-center": "0% 0%", transfers: "33.333% 0%", league: "66.666% 0%", club: "100% 0%", council: "0% 100%", collection: "33.333% 100%", lab: "66.666% 100%", events: "100% 100%" };
const FAN_POSITIONS: Record<FanArtworkId, string> = { armchair: "0% 0%", analyst: "50% 0%", genius: "100% 0%", tactician: "0% 100%", scout: "50% 100%", predictor: "100% 100%" };
export function VipArtwork({ id, className }: { id: VipArtworkId; className?: string }) { const style = { backgroundImage: "url('/visuals/vip-worlds-cinematic.png')", backgroundPosition: VIP_POSITIONS[id], backgroundSize: "400% 200%" } satisfies CSSProperties; return <span aria-hidden="true" className={cn("block bg-cover bg-no-repeat", className)} style={style} />; }
export function FanArtwork({ id, className }: { id: FanArtworkId; className?: string }) { const style = { backgroundImage: "url('/visuals/fan-archetypes-cinematic.png')", backgroundPosition: FAN_POSITIONS[id], backgroundSize: "300% 200%" } satisfies CSSProperties; return <span aria-hidden="true" className={cn("block bg-cover bg-no-repeat", className)} style={style} />; }
