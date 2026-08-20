import { notFound } from "next/navigation";

import { LineupSelector } from "@/components/matches/lineup-selector";
import { ExplainYourTake } from "@/components/community/explain-your-take";
import { PlayerRankings } from "@/components/matches/player-rankings";
import { PredictionForm } from "@/components/matches/prediction-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCurrentUser,
  getMatchById,
  getMatchPlayedPlayers,
  getMatchPlayerRankings,
  getMatchPlayers,
  getUserLineupPrediction,
  getUserPlayerRankings,
  getUserPrediction,
} from "@/lib/data";
import { getSupabaseEnv } from "@/lib/env";
import { formatMatchDate } from "@/lib/format";

interface MatchDetailPageProps {
  params: Promise<{ matchId: string }>;
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { matchId } = await params;
  const { configured } = getSupabaseEnv();
  const [user, match, players] = await Promise.all([getCurrentUser(), getMatchById(matchId), getMatchPlayers(matchId)]);

  if (!match) {
    notFound();
  }

  const [prediction, lineup, playedPlayers, allRankings, userRankings] = await Promise.all([
    getUserPrediction(match.id, user?.id),
    getUserLineupPrediction(match.id, user?.id),
    getMatchPlayedPlayers(match.id),
    getMatchPlayerRankings(match.id),
    getUserPlayerRankings(match.id, user?.id),
  ]);

  return (
    <div className="space-y-6">
      <Card className="barca-panel overflow-hidden border-accent/15">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="meta-label text-xs">{match.competition}</p>
              <h2 className="mt-2 text-2xl font-semibold">
                {match.home_team} vs {match.away_team}
              </h2>
            </div>
            <Badge variant={match.status === "finished" ? "primary" : "accent"}>
              {match.status === "finished" ? "Завершён" : "Прогноз открыт"}
            </Badge>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p>{formatMatchDate(match.kickoff_at)}</p>
            <p>{match.venue}</p>
            {match.status === "finished" ? (
              <p className="text-[#f1d1db]">
                Итоговый счёт {match.home_score} - {match.away_score}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <PredictionForm
        match={match}
        initialPrediction={prediction}
        userId={user?.id}
        backendEnabled={configured}
      />
      <LineupSelector
        match={match}
        players={players}
        initialLineup={lineup}
        userId={user?.id}
        backendEnabled={configured}
      />
      <PlayerRankings
        match={match}
        players={players}
        playedPlayers={playedPlayers}
        initialRankings={allRankings}
        initialUserRankings={userRankings}
        userId={user?.id}
        backendEnabled={configured}
      />
      <ExplainYourTake targetType="match" targetId={match.id} />
    </div>
  );
}
