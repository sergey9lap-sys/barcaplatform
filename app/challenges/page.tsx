import { ChallengeHubClient } from "@/components/challenges/challenge-hub-client";
import { getAllMatches, getChallenges, getCurrentUser } from "@/lib/data";
import { getSupabaseEnv } from "@/lib/env";

export default async function ChallengesPage() {
  const [{ configured }, challenges, matches, user] = await Promise.all([getSupabaseEnv(), getChallenges(), getAllMatches(), getCurrentUser()]);
  return <ChallengeHubClient initialChallenges={challenges} matches={matches} userId={user?.id ?? null} backendEnabled={configured} />;
}
