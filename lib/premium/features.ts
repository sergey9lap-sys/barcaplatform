export const PREMIUM_FEATURES = {
  advancedAnalytics: { premium: true, enabled: true },
  fullBarcaFitReport: { premium: true, enabled: true },
  coachSystemFitReport: { premium: true, enabled: true },
  transferWarRoom: { premium: true, enabled: true },
  laMasiaScouting: { premium: true, enabled: true },
  tacticalBoardPublishing: { premium: true, enabled: true },
  deepTransferReports: { premium: true, enabled: true },
  laMasiaScoutReports: { premium: true, enabled: true },
  exportAnalytics: { premium: true, enabled: true },
  streamPriorityReview: { premium: true, enabled: true },
  rewardsShop: { premium: false, enabled: true },
  physicalRewards: { premium: true, enabled: true },
  digitalRewards: { premium: false, enabled: true },
  fantasyMode: { premium: true, enabled: true },
  fantasyLeaderboards: { premium: true, enabled: true },
  premiumShopItems: { premium: true, enabled: true },
} as const;

export type PremiumFeatureKey = keyof typeof PREMIUM_FEATURES;

export function isPremiumFeatureOpen(feature: PremiumFeatureKey) {
  return PREMIUM_FEATURES[feature].enabled;
}

export function isPremiumFeature(feature: PremiumFeatureKey) {
  return PREMIUM_FEATURES[feature].premium;
}

export function canAccessFeature(_user: unknown, _feature: PremiumFeatureKey) {
  return true;
}
