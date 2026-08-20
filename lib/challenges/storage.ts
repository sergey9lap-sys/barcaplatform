"use client";

import type { ChallengeSubmissionRecord, ChallengeWalletRecord } from "@/types/database";

const SUBMISSIONS_KEY = "barca-challenge-submissions-v2";
const WALLET_KEY = "barca-challenge-wallet-v2";

const defaultWallet: ChallengeWalletRecord = {
  user_id: "local-user",
  coins: 120,
  current_streak: 0,
  longest_streak: 0,
  last_claimed_date: null,
  updated_at: new Date(0).toISOString(),
};

export function getLocalChallengeSubmissions() {
  if (typeof window === "undefined") return [] as ChallengeSubmissionRecord[];
  const value = window.localStorage.getItem(SUBMISSIONS_KEY);
  return value ? (JSON.parse(value) as ChallengeSubmissionRecord[]) : [];
}

export function saveLocalChallengeSubmission(submission: ChallengeSubmissionRecord) {
  const current = getLocalChallengeSubmissions();
  const next = [submission, ...current.filter((item) => item.challenge_id !== submission.challenge_id)];
  window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(next));
  return next;
}

export function getLocalChallengeWallet() {
  if (typeof window === "undefined") return defaultWallet;
  const value = window.localStorage.getItem(WALLET_KEY);
  return value ? ({ ...defaultWallet, ...JSON.parse(value) } as ChallengeWalletRecord) : defaultWallet;
}

export function saveLocalChallengeWallet(wallet: ChallengeWalletRecord) {
  window.localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  return wallet;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function claimLocalDailyBonus(now = new Date()) {
  const wallet = getLocalChallengeWallet();
  const today = toDateKey(now);
  if (wallet.last_claimed_date === today) return { wallet, reward: 0, claimed: false };

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const continued = wallet.last_claimed_date === toDateKey(yesterday);
  const streak = continued ? Math.min(7, wallet.current_streak + 1) : Math.max(1, wallet.current_streak - 1 || 1);
  const rewards = [10, 15, 20, 25, 30, 40, 50];
  const reward = rewards[streak - 1] ?? rewards[0];
  const next = saveLocalChallengeWallet({
    ...wallet,
    coins: wallet.coins + reward,
    current_streak: streak,
    longest_streak: Math.max(wallet.longest_streak, streak),
    last_claimed_date: today,
    updated_at: now.toISOString(),
  });
  return { wallet: next, reward, claimed: true };
}

export function addLocalChallengeCoins(amount: number) {
  const wallet = getLocalChallengeWallet();
  return saveLocalChallengeWallet({ ...wallet, coins: wallet.coins + amount, updated_at: new Date().toISOString() });
}
