"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_LINEUP_USER_ID, getStoredLineupPredictions } from "@/lib/lineup/storage";
import { MOCK_PLAYER_RANKING_USER_ID, getStoredPlayerRankingsForUser } from "@/lib/player-rankings/storage";
import { buildFanProfileInsights } from "@/lib/profile/insights";
import { MOCK_USER_ID, getStoredPredictions } from "@/lib/predictions/storage";
import { MOCK_TRANSFER_USER_ID, getStoredTransferPredictions } from "@/lib/transfers/storage";
import type {
  FanProfileInsights,
  LineupPredictionRecord,
  Match,
  MatchPredictionRecord,
  PlayerRankingRecord,
  Profile,
  SeasonPlayerStat,
  TransferPredictionRecord,
} from "@/types/database";

interface ProfileInsightsClientProps {
  matches: Match[];
  profile: Profile | null;
  predictions: MatchPredictionRecord[];
  lineups: LineupPredictionRecord[];
  transferPredictions: TransferPredictionRecord[];
  playerRankings?: PlayerRankingRecord[];
  seasonPlayerStats?: SeasonPlayerStat[];
  backendEnabled?: boolean;
  compact?: boolean;
}

function emptyInsights(): FanProfileInsights {
  return {
    dna: "safe",
    dna_title: "Ваш стиль ещё формируется",
    dna_description: "Сделайте несколько прогнозов, и профиль начнёт показывать ваш настоящий футбольный характер.",
    rank: "armchair",
    rank_title: "Наблюдатель",
    rank_description: "Пока ещё мало данных, чтобы точно оценить вашу силу на дистанции.",
    accuracy_percent: 0,
    correct_results: 0,
    exact_scores: 0,
    finished_predictions: 0,
    lineups_saved: 0,
    transfer_calls: 0,
    player_rankings_submitted: 0,
  };
}

export function ProfileInsightsClient({
  matches,
  profile,
  predictions,
  lineups,
  transferPredictions,
  playerRankings = [],
  seasonPlayerStats = [],
  backendEnabled = false,
  compact = false,
}: ProfileInsightsClientProps) {
  const [localPredictions, setLocalPredictions] = useState<MatchPredictionRecord[]>([]);
  const [localLineups, setLocalLineups] = useState<LineupPredictionRecord[]>([]);
  const [localTransfers, setLocalTransfers] = useState<TransferPredictionRecord[]>([]);
  const [localPlayerRankings, setLocalPlayerRankings] = useState<PlayerRankingRecord[]>([]);

  useEffect(() => {
    if (backendEnabled) {
      return;
    }

    setLocalPredictions(getStoredPredictions(MOCK_USER_ID));
    setLocalLineups(getStoredLineupPredictions(MOCK_LINEUP_USER_ID));
    setLocalTransfers(getStoredTransferPredictions(MOCK_TRANSFER_USER_ID));
    setLocalPlayerRankings(getStoredPlayerRankingsForUser(MOCK_PLAYER_RANKING_USER_ID));
  }, [backendEnabled]);

  const effectivePredictions = backendEnabled ? predictions : localPredictions;
  const effectiveLineups = backendEnabled ? lineups : localLineups;
  const effectiveTransfers = backendEnabled ? transferPredictions : localTransfers;
  const effectivePlayerRankings = backendEnabled ? playerRankings : localPlayerRankings;

  const insights = useMemo(() => {
    if (!effectivePredictions.length && !effectiveLineups.length && !effectiveTransfers.length && !effectivePlayerRankings.length) {
      return emptyInsights();
    }

    return buildFanProfileInsights({
      matches,
      predictions: effectivePredictions,
      lineups: effectiveLineups,
      transferPredictions: effectiveTransfers,
      playerRankings: effectivePlayerRankings,
    });
  }, [effectiveLineups, effectivePlayerRankings, effectivePredictions, effectiveTransfers, matches]);

  const rankedSeasonPlayers = seasonPlayerStats.filter((item) => item.matches_ranked > 0);
  const topSeasonPlayer = rankedSeasonPlayers[0] ?? null;
  const bottomSeasonPlayer = rankedSeasonPlayers[rankedSeasonPlayers.length - 1] ?? null;

  if (compact) {
    return (
      <Card className="barca-panel border-accent/15">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-2">
            <p className="meta-label text-xs">Ваш профиль болельщика</p>
            <div>
              <p className="text-lg font-semibold text-[#f1d1db]">{insights.dna_title}</p>
              <p className="mt-1 text-sm text-blue-100/75">{insights.rank_title} · точность {insights.accuracy_percent}%</p>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href="/profile">Открыть профиль</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="barca-panel border-accent/15">
        <CardHeader>
          <CardTitle>{profile ? profile.display_name || profile.email : "Ваш футбольный профиль"}</CardTitle>
          <CardDescription>
            Здесь собирается ваш стиль прогноза, точность и место в общей картине сезона.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5 shadow-glow">
              <p className="meta-label text-xs">Стиль болельщика</p>
              <p className="mt-3 text-2xl font-semibold text-[#f1d1db]">{insights.dna_title}</p>
              <p className="mt-2 text-sm text-blue-100/75">{insights.dna_description}</p>
            </div>
            <div className="rounded-3xl border border-accent/20 bg-accent/10 p-5 shadow-glow">
              <p className="meta-label text-xs">Игровой уровень</p>
              <p className="mt-3 text-2xl font-semibold text-[#245ac7]">{insights.rank_title}</p>
              <p className="mt-2 text-sm text-blue-100/75">{insights.rank_description}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="meta-label text-xs">Точность</p>
              <p className="mt-2 text-2xl font-semibold text-[#f1d1db]">{insights.accuracy_percent}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="meta-label text-xs">Угаданных исходов</p>
              <p className="mt-2 text-2xl font-semibold text-[#f1d1db]">{insights.correct_results}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="meta-label text-xs">Точных счетов</p>
              <p className="mt-2 text-2xl font-semibold text-[#f1d1db]">{insights.exact_scores}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="meta-label text-xs">Сохранённых составов</p>
              <p className="mt-2 text-2xl font-semibold text-[#f1d1db]">{insights.lineups_saved}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-blue-100/75">
            <p>Завершённых прогнозов: <span className="text-[#f1d1db]">{insights.finished_predictions}</span></p>
            <p className="mt-2">Прогнозов по трансферам: <span className="text-[#f1d1db]">{insights.transfer_calls}</span></p>
            <p className="mt-2">Составленных порядков игроков: <span className="text-[#f1d1db]">{insights.player_rankings_submitted}</span></p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="meta-label text-xs">Игроки сезона</p>
                <p className="mt-2 text-lg font-semibold text-[#f1d1db]">Кто сейчас лучший, а кто провёл сезон слабее</p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href="/players">Открыть всю статистику</Link>
              </Button>
            </div>

            {seasonPlayerStats.length ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
                  <p className="meta-label text-xs">Лучший игрок сезона</p>
                  <p className="mt-2 text-xl font-semibold text-[#245ac7]">{topSeasonPlayer?.player_name}</p>
                  <p className="mt-2 text-sm text-blue-100/75">
                    {topSeasonPlayer?.total_points ?? 0} очков · среднее место {topSeasonPlayer?.average_rank_position ?? "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                  <p className="meta-label text-xs">Игрок с самым слабым сезоном</p>
                  <p className="mt-2 text-xl font-semibold text-[#f1d1db]">{bottomSeasonPlayer?.player_name}</p>
                  <p className="mt-2 text-sm text-blue-100/75">
                    {bottomSeasonPlayer?.total_points ?? 0} очков · среднее место {bottomSeasonPlayer?.average_rank_position ?? "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-blue-100/75">
                Сезонная таблица игроков появится после первых завершённых матчей и сохранённых порядков.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {!profile && backendEnabled ? (
        <div className="space-y-4">
          <Card className="barca-panel border-accent/15">
            <CardContent className="p-5">
              <p className="text-sm text-blue-100/80">
                Войдите в аккаунт, чтобы профиль строился по вашим реальным прогнозам и сохранялся между устройствами.
              </p>
            </CardContent>
          </Card>
          <AuthForm />
        </div>
      ) : null}

      {!profile && !backendEnabled ? (
        <Card className="barca-panel border-accent/15">
          <CardContent className="p-5 text-sm text-blue-100/80">
            Пока профиль считается по сохранённым на этом устройстве прогнозам. После полного подключения базы он будет работать на реальных данных аккаунта.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
