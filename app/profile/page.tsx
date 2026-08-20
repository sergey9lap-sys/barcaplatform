import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommunityProfileCard } from "@/components/profile/community-profile-card";
import { ProfileInsightsClient } from "@/components/profile/profile-insights-client";
import { FootballIntelligenceProfile } from "@/components/profile/football-intelligence-profile";
import { ProfileSectionsClient } from "@/components/profile/profile-sections-client";
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

  if (!user || !profile) {
    return <div className="space-y-6"><Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.profileHero, { position: "center 38%" })}><CardContent className="p-5"><h2 className="text-2xl font-semibold">Ваш футбольный профиль</h2><p className="mt-2 max-w-2xl text-sm text-blue-100/75">Войдите, чтобы увидеть настоящий уровень, навыки, награды и историю прогнозов.</p></CardContent></Card><Card className="soft-panel"><CardContent className="grid min-h-64 place-items-center p-6 text-center"><div><h2 className="text-xl font-semibold">Начните собирать свою репутацию</h2><p className="ui-note mt-2 max-w-md text-sm">Подтверждённые прогнозы и игровые действия будут формировать ваш уникальный профиль.</p><Button asChild className="mt-5"><Link href="/auth">Войти или зарегистрироваться</Link></Button></div></CardContent></Card></div>;
  }

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

      <ProfileSectionsClient
        overview={<CommunityProfileCard profile={profile} userId={user.id} />}
        skills={<FootballIntelligenceProfile />}
        activity={<ProfileInsightsClient
        matches={matches}
        profile={profile}
        predictions={predictions}
        lineups={lineups}
        transferPredictions={transfers}
        playerRankings={playerRankings}
        seasonPlayerStats={seasonPlayerStats}
        backendEnabled={configured}
        />}
      />
    </div>
  );
}
