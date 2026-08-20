"use client";

import { addUserPoints, addUserXP, type ActionType } from "@/lib/community/gamification";
import type { CommunityOpinionRecord, CommunityUserRecord, ReputationType } from "@/types/database";

const PROFILE_KEY = "barca-community-profile";
const ACHIEVEMENTS_KEY = "barca-community-achievements";
export const COMMUNITY_PROFILE_UPDATED_EVENT = "barca-profile-updated";

function emitProfileUpdated(profile: CommunityUserRecord) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(COMMUNITY_PROFILE_UPDATED_EVENT, { detail: profile }));
}

export function getStoredCommunityProfile(fallback: CommunityUserRecord) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(PROFILE_KEY);
  return raw ? ({ ...fallback, ...JSON.parse(raw) } as CommunityUserRecord) : fallback;
}

export function saveStoredCommunityProfile(profile: CommunityUserRecord) {
  if (typeof window === "undefined") {
    return profile;
  }

  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  emitProfileUpdated(profile);
  return profile;
}

export function rewardStoredUser(fallback: CommunityUserRecord, actionType: ActionType) {
  const profile = getStoredCommunityProfile(fallback);
  const next = {
    ...profile,
    xp: profile.xp + addUserXP(actionType),
    points: profile.points + addUserPoints(actionType),
  };
  return saveStoredCommunityProfile(next);
}

export function rewardStoredUserCustom(fallback: CommunityUserRecord, reward: { xp?: number; points?: number; badge?: string }) {
  const profile = getStoredCommunityProfile(fallback);
  const nextBadges = reward.badge && !profile.badges.includes(reward.badge) ? [...profile.badges, reward.badge] : profile.badges;
  return saveStoredCommunityProfile({
    ...profile,
    xp: profile.xp + (reward.xp ?? 0),
    points: profile.points + (reward.points ?? 0),
    badges: nextBadges,
  });
}

export function addStoredReputation(fallback: CommunityUserRecord, type: ReputationType, amount: number) {
  const profile = getStoredCommunityProfile(fallback);
  const field = `${type}_reputation` as keyof CommunityUserRecord;
  const current = typeof profile[field] === "number" ? profile[field] : 0;
  return saveStoredCommunityProfile({ ...profile, [field]: current + amount });
}

export function getStoredAchievements() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  const raw = window.localStorage.getItem(ACHIEVEMENTS_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export function saveStoredAchievements(ids: string[]) {
  if (typeof window === "undefined") {
    return ids;
  }

  window.localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
  return ids;
}

export function markAchievementGranted(id: string) {
  const current = getStoredAchievements();
  if (current.includes(id)) {
    return current;
  }

  return saveStoredAchievements([...current, id]);
}

export function getStoredOpinions(targetType: string, targetId: string, fallback: CommunityOpinionRecord[]) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const key = `barca-opinions:${targetType}:${targetId}`;
  const raw = window.localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as CommunityOpinionRecord[]) : fallback;
}

export function saveStoredOpinions(targetType: string, targetId: string, opinions: CommunityOpinionRecord[]) {
  if (typeof window === "undefined") {
    return opinions;
  }

  window.localStorage.setItem(`barca-opinions:${targetType}:${targetId}`, JSON.stringify(opinions));
  return opinions;
}
