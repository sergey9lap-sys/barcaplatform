import { Card, CardContent } from "@/components/ui/card";
import { CommunityProfileCard } from "@/components/profile/community-profile-card";
import { RewardsProfileSection } from "@/components/profile/rewards-profile-section";
import { ProfileInsightsClient } from "@/components/profile/profile-insights-client";
import { FootballIntelligenceProfile } from "@/components/profile/football-intelligence-profile";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import {
  getAllLineupPredictionsForUser,
  getAllMatches,
  getAllPlayerRankingsForUser,
  getAllPredictionsForUser,
  getCurrentProfile,
  getCurrentUser,
  getSeasonPlayerStats,
  getTransferPredictionsForUser,
} from "@/lib/data";
import { getSupabaseEnv } from "@/lib/env";

export default async function ProfilePage() {
  const { configured } = getSupabaseEnv();
  const [profile, user, matches, seasonPlayerStats] = await Promise.all([
    getCurrentProfile(),
    getCurrentUser(),
    getAllMatches(),
    getSeasonPlayerStats(),
  ]);

  const [predictions, lineups, transfers, playerRankings] = await Promise.all([
    getAllPredictionsForUser(user?.id),
    getAllLineupPredictionsForUser(user?.id),
    getTransferPredictionsForUser(user?.id),
    getAllPlayerRankingsForUser(user?.id),
  ]);

  return (
    <div className="space-y-6">
      <Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.profileHero, { position: "center 38%" })}>
        <CardContent className="p-5">
          <p className="meta-label text-xs">Профиль</p>
          <h2 className="mt-2 text-2xl font-semibold">Ваш стиль болельщика и уровень игры</h2>
          <p className="mt-2 text-sm text-blue-100/75">
            Здесь видно, как вы читаете футбол, как часто угадываете исходы и какой уровень уже набрали.
          </p>
        </CardContent>
      </Card>

      <CommunityProfileCard profile={profile} />

      <FootballIntelligenceProfile />

      <RewardsProfileSection />

      <ProfileInsightsClient
        matches={matches}
        profile={profile}
        predictions={predictions}
        lineups={lineups}
        transferPredictions={transfers}
        playerRankings={playerRankings}
        seasonPlayerStats={seasonPlayerStats}
        backendEnabled={configured}
      />
    </div>
  );
}
