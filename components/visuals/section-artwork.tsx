import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type SectionArtworkId = "matches" | "transfers" | "fantasy" | "analytics" | "academy" | "challenges" | "community" | "shop" | "vip";

const POSITIONS: Record<SectionArtworkId, string> = {
  matches: "0% 0%",
  transfers: "50% 0%",
  fantasy: "100% 0%",
  analytics: "0% 50%",
  academy: "50% 50%",
  challenges: "100% 50%",
  community: "0% 100%",
  shop: "50% 100%",
  vip: "100% 100%",
};

export function SectionArtwork({ id, className, priority = false }: { id: SectionArtworkId; className?: string; priority?: boolean }) {
  const style = {
    backgroundImage: "url('/visuals/section-worlds-v2-cinematic.png')",
    backgroundPosition: POSITIONS[id],
    backgroundSize: "300% 300%",
  } satisfies CSSProperties;

  return <span aria-hidden="true" data-priority={priority || undefined} className={cn("section-artwork", className)} style={style} />;
}
