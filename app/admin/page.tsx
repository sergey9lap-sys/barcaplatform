import Link from "next/link";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessAdmin } from "@/lib/admin";
import {
  getAllMatchPlayerStats,
  getAllMatchPlayedPlayers,
  getAllMatchPlayers,
  getAllMatches,
  getChallenges,
  getCurrentProfile,
  getCurrentUser,
  getLeagueStandings,
  getPlayersCatalog,
  getSeasonPlayerStats,
  getTransferRumors,
} from "@/lib/data";
import { getSupabaseEnv } from "@/lib/env";

export default async function AdminPage() {
  const { configured } = getSupabaseEnv();
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  if (!configured) {
    return (
      <Card className="barca-panel border-primary/20">
        <CardContent className="p-5 text-sm text-blue-100/80">
          Админка откроется после полного подключения Supabase и перезапуска приложения.
        </CardContent>
      </Card>
    );
  }

  const canOpenAdmin = canAccessAdmin(user?.email, profile?.is_admin ?? false);

  if (!canOpenAdmin) {
    return (
      <Card className="barca-panel border-primary/20">
        <CardContent className="space-y-3 p-5">
          <p className="text-sm text-blue-100/80">
            Этот раздел доступен только администраторам из списка `ADMIN_EMAILS`.
          </p>
          <Link href="/" className="section-link underline">Вернуться на главную</Link>
        </CardContent>
      </Card>
    );
  }

  const [rumors, standings, players, seasonStats, matches, matchPlayers, playedPlayers, matchPlayerStats, challenges] = await Promise.all([
    getTransferRumors(),
    getLeagueStandings(),
    getPlayersCatalog(),
    getSeasonPlayerStats(),
    getAllMatches(),
    getAllMatchPlayers(),
    getAllMatchPlayedPlayers(),
    getAllMatchPlayerStats(),
    getChallenges(true),
  ]);

  return (
    <AdminDashboard
      rumors={rumors}
      standings={standings}
      players={players}
      seasonStats={seasonStats}
      matches={matches}
      matchPlayers={matchPlayers}
      playedPlayers={playedPlayers}
      matchPlayerStats={matchPlayerStats}
      challenges={challenges}
    />
  );
}
