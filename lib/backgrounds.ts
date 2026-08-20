import type { CSSProperties } from "react";

function backgroundAsset(fileName: string) {
  return encodeURI(`/background/${fileName}`);
}

export const SECTION_BACKGROUNDS = {
  homeHero: backgroundAsset("IMAGE 2026-04-07 19-02-37.jpg"),
  homeCountdown: backgroundAsset("IMAGE 2026-04-07 19-03-43.jpg"),
  homeStatus: backgroundAsset("IMAGE 2026-04-07 19-03-52.jpg"),
  homeLeague: backgroundAsset("IMAGE 2026-04-07 19-02-42.jpg"),
  homeTransfers: backgroundAsset("IMAGE 2026-04-07 19-02-45.jpg"),
  matchesHero: backgroundAsset("IMAGE 2026-04-07 19-02-49.jpg"),
  transfersHero: backgroundAsset("IMAGE 2026-04-07 19-03-45.jpg"),
  transfersIncoming: backgroundAsset("IMAGE 2026-04-07 19-04-01.jpg"),
  transfersOutgoing: backgroundAsset("IMAGE 2026-04-07 19-04-05.jpg"),
  playersHero: backgroundAsset("IMAGE 2026-04-07 19-02-55.jpg"),
  coachCard: backgroundAsset("IMAGE 2026-04-07 19-03-59.jpg"),
  profileHero: backgroundAsset("IMAGE 2026-04-07 19-02-56.jpg"),
  tableHero: backgroundAsset("IMAGE 2026-04-07 19-02-47.jpg"),
  duelsHero: backgroundAsset("IMAGE 2026-04-07 19-03-57.jpg"),
  authHero: backgroundAsset("IMAGE 2026-04-07 19-03-01.jpg"),
  leaderboardHero: backgroundAsset("IMAGE 2026-04-07 19-02-59.jpg"),
  adminHero: backgroundAsset("IMAGE 2026-04-07 19-03-03.jpg"),
} as const;

type OverlayStrength = "soft" | "medium" | "strong";

const OVERLAY_MAP: Record<OverlayStrength, string> = {
  soft: "linear-gradient(135deg, rgba(8, 20, 56, 0.52) 0%, rgba(10, 22, 63, 0.58) 50%, rgba(84, 10, 44, 0.48) 100%)",
  medium: "linear-gradient(135deg, rgba(7, 18, 52, 0.68) 0%, rgba(10, 22, 63, 0.78) 50%, rgba(96, 13, 48, 0.68) 100%)",
  strong: "linear-gradient(135deg, rgba(7, 18, 52, 0.82) 0%, rgba(9, 20, 58, 0.88) 50%, rgba(98, 12, 49, 0.8) 100%)",
};

export function createPhotoPanelStyle(
  imagePath: string,
  options?: {
    overlay?: OverlayStrength;
    position?: string;
  },
): CSSProperties {
  return {
    backgroundImage: `${OVERLAY_MAP[options?.overlay ?? "strong"]}, url("${imagePath}")`,
    backgroundSize: "cover",
    backgroundPosition: options?.position ?? "center",
    backgroundRepeat: "no-repeat",
  };
}
