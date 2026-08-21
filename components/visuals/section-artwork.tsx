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
    // The source is a 3×3 grid of square artworks. Scaling both axes to the
    // container distorted every non-square banner; width-only scaling keeps
    // each cell square and crops wide cards like a real cover image.
    backgroundSize: "300% auto",
  } satisfies CSSProperties;

  return <span aria-hidden="true" data-priority={priority || undefined} className={cn("section-artwork", className)} style={style} />;
}

export function SectionArtworkBanner({ id, className }: { id: SectionArtworkId; className?: string }) {
  const artworkStyle = {
    backgroundImage: "url('/visuals/section-worlds-v2-cinematic.png')",
    backgroundPosition: POSITIONS[id],
    backgroundSize: "300% 300%",
  } satisfies CSSProperties;

  return (
    <span aria-hidden="true" className={cn("section-artwork relative overflow-hidden bg-[#050916]", className)}>
      <span className="absolute left-1/2 top-1/2 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 bg-no-repeat" style={artworkStyle} />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,9,22,0.92)_0%,transparent_24%,transparent_76%,rgba(5,9,22,0.92)_100%)]" />
    </span>
  );
}
