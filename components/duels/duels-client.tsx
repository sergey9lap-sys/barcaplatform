"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_DUEL_USER_ID, getStoredDuels, saveStoredDuel } from "@/lib/duels/storage";
import { mockDuelPredictions } from "@/lib/mocks/duel-predictions";
import { mockDuels } from "@/lib/mocks/duels";
import { calculatePredictionPoints } from "@/lib/predictions/points";
import { MOCK_USER_ID, getStoredPredictions } from "@/lib/predictions/storage";
import { calculateDuelBonusForUser } from "@/lib/scoring/extended-points";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { DuelRecord, LeaderboardEntry, Match, MatchPredictionRecord } from "@/types/database";

interface DuelsClientProps {
  matches: Match[];
  rivals: LeaderboardEntry[];
  initialDuels: DuelRecord[];
  initialPredictions: MatchPredictionRecord[];
  backendEnabled?: boolean;
  currentUserId?: string | null;
}

function formatPrediction(prediction: MatchPredictionRecord | null | undefined) {
  if (!prediction) {
    return "Прогноз ещё не сохранён";
  }

  const resultMap = {
    home: "победа",
    draw: "ничья",
    away: "поражение",
  } as const;

  return `${resultMap[prediction.result]}, ${prediction.score.home ?? "-"}:${prediction.score.away ?? "-"}`;
}

export function DuelsClient({
  matches,
  rivals,
  initialDuels,
  initialPredictions,
  backendEnabled = false,
  currentUserId = null,
}: DuelsClientProps) {
  const router = useRouter();
  const localUserId = currentUserId ?? MOCK_DUEL_USER_ID;
  const [duels, setDuels] = useState<DuelRecord[]>(initialDuels);
  const [predictions, setPredictions] = useState<MatchPredictionRecord[]>(initialPredictions);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [selectedOpponentId, setSelectedOpponentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const upcomingMatches = useMemo(
    () => matches.filter((match) => match.status === "upcoming"),
    [matches],
  );

  useEffect(() => {
    if (selectedMatchId || !upcomingMatches.length) {
      return;
    }

    setSelectedMatchId(upcomingMatches[0].id);
  }, [selectedMatchId, upcomingMatches]);

  useEffect(() => {
    if (selectedOpponentId || !rivals.length) {
      return;
    }

    setSelectedOpponentId(rivals[0].id);
  }, [rivals, selectedOpponentId]);

  useEffect(() => {
    if (backendEnabled) {
      setDuels(initialDuels);
      setPredictions(initialPredictions);
      return;
    }

    const localDuels = [...mockDuels, ...getStoredDuels(MOCK_DUEL_USER_ID)];
    const uniqueDuels = Array.from(new Map(localDuels.map((duel) => [duel.id, duel])).values());
    const localPredictions = getStoredPredictions(MOCK_USER_ID);
    const mergedPredictions = [...mockDuelPredictions.filter((item) => item.user_id !== MOCK_USER_ID), ...localPredictions];

    setDuels(uniqueDuels);
    setPredictions(mergedPredictions);
  }, [backendEnabled, initialDuels, initialPredictions]);

  async function handleCreateDuel() {
    setError(null);
    setSuccess(null);

    if (!selectedMatchId || !selectedOpponentId) {
      setError("Сначала выберите матч и соперника.");
      return;
    }

    if (backendEnabled && !currentUserId) {
      setError("Чтобы создать дуэль, сначала войдите в аккаунт.");
      return;
    }

    const exists = duels.some(
      (duel) =>
        duel.match_id === selectedMatchId &&
        ((duel.challenger_id === localUserId && duel.opponent_id === selectedOpponentId) ||
          (duel.challenger_id === selectedOpponentId && duel.opponent_id === localUserId)),
    );

    if (exists) {
      setError("Дуэль по этому матчу с этим соперником уже есть.");
      return;
    }

    setSubmitting(true);

    if (backendEnabled) {
      const supabase = createSupabaseClient();
      if (!supabase || !currentUserId) {
        setError("Создание дуэли сейчас недоступно.");
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from("duels").insert({
        match_id: selectedMatchId,
        challenger_id: currentUserId,
        opponent_id: selectedOpponentId,
      });

      if (insertError) {
        setError(insertError.message);
        setSubmitting(false);
        return;
      }

      setSuccess("Дуэль создана.");
      router.refresh();
      setSubmitting(false);
      return;
    }

    const stored = saveStoredDuel({
      matchId: selectedMatchId,
      challengerId: MOCK_DUEL_USER_ID,
      opponentId: selectedOpponentId,
    });

    setDuels((current) => [...current, stored]);
    setSuccess("Дуэль создана.");
    setSubmitting(false);
  }

  const predictionsMap = useMemo(() => {
    return new Map(predictions.map((prediction) => [`${prediction.user_id}:${prediction.match_id}`, prediction]));
  }, [predictions]);

  return (
    <div className="space-y-4">
      <Card className="barca-panel border-accent/15">
        <CardHeader>
          <CardTitle>Новая дуэль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {backendEnabled && !currentUserId ? (
            <p className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-white">
              Чтобы бросить вызов другому болельщику, сначала <Link className="underline" href="/auth">войдите в аккаунт</Link>.
            </p>
          ) : null}

          <div className="space-y-2">
            <p className="meta-label text-xs">Матч</p>
            <div className="grid gap-2">
              {upcomingMatches.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => setSelectedMatchId(match.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    selectedMatchId === match.id
                      ? "border-primary/50 bg-primary/12 text-white shadow-glow"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-white"
                  }`}
                >
                  <p className="text-sm font-semibold">{match.home_team} vs {match.away_team}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{match.competition}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="meta-label text-xs">Соперник</p>
            <div className="grid gap-2">
              {rivals.map((rival) => (
                <button
                  key={rival.id}
                  type="button"
                  onClick={() => setSelectedOpponentId(rival.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    selectedOpponentId === rival.id
                      ? "border-accent/45 bg-accent/12 text-white shadow-glow"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-white"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{rival.display_name || rival.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{rival.total_points} очков</p>
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-blue-200">{success}</p> : null}

          <Button className="w-full" onClick={handleCreateDuel} disabled={submitting || !upcomingMatches.length || !rivals.length}>
            {submitting ? "Создаём дуэль..." : "Бросить вызов"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {duels.length ? duels.map((duel) => {
          const match = matches.find((item) => item.id === duel.match_id);
          if (!match) {
            return null;
          }

          const opponentId = duel.challenger_id === localUserId ? duel.opponent_id : duel.challenger_id;
          const opponent = rivals.find((item) => item.id === opponentId);
          const yourPrediction = predictionsMap.get(`${localUserId}:${duel.match_id}`) ?? null;
          const opponentPrediction = predictionsMap.get(`${opponentId}:${duel.match_id}`) ?? null;
          const yourPoints = yourPrediction ? calculatePredictionPoints(match, yourPrediction) : null;
          const opponentPoints = opponentPrediction ? calculatePredictionPoints(match, opponentPrediction) : null;
          const finished = match.status === "finished" && yourPoints !== null && opponentPoints !== null;
          const duelWon = finished ? yourPoints > opponentPoints : false;
          const duelLost = finished ? yourPoints < opponentPoints : false;
          const duelBonus = backendEnabled
            ? duel.winner_id === localUserId
              ? duel.bonus_awarded
              : 0
            : calculateDuelBonusForUser(duel, localUserId, matches, predictions);

          return (
            <Card key={duel.id} className="barca-panel border-accent/15">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="meta-label text-xs">Дуэль</p>
                    <CardTitle className="mt-2 text-xl">{match.home_team} vs {match.away_team}</CardTitle>
                  </div>
                  <Badge variant={match.status === "finished" ? "primary" : "accent"}>
                    {match.status === "finished" ? "Матч завершён" : "Ожидает матч"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <p className="meta-label text-xs">Вы</p>
                    <p className="mt-2 text-sm text-[#f1d1db]">{formatPrediction(yourPrediction)}</p>
                    {yourPoints !== null ? <p className="mt-2 text-xs text-blue-100/70">{yourPoints} очков</p> : null}
                  </div>
                  <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
                    <p className="meta-label text-xs">{opponent?.display_name || opponent?.email || "Соперник"}</p>
                    <p className="mt-2 text-sm text-[#245ac7]">{formatPrediction(opponentPrediction)}</p>
                    {opponentPoints !== null ? <p className="mt-2 text-xs text-blue-100/70">{opponentPoints} очков</p> : null}
                  </div>
                </div>

                {match.status === "finished" ? (
                  finished ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                      <p className="text-[#f1d1db]">
                        {duelWon
                          ? "Вы выиграли дуэль."
                          : duelLost
                            ? "Эту дуэль забрал соперник."
                            : "Дуэль завершилась вничью."}
                      </p>
                      <p className="mt-2">Бонус победителя: <span className="text-[#f1d1db]">{duelBonus}</span> очков</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                      Чтобы увидеть исход дуэли, оба участника должны сохранить прогноз по этому матчу.
                    </div>
                  )
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                    {yourPrediction ? (
                      opponentPrediction
                        ? "Оба прогноза сохранены. Осталось дождаться матча."
                        : "Ваш прогноз уже есть. Теперь ждём ответ соперника."
                    ) : (
                      <>
                        Чтобы дуэль началась, сначала <Link className="underline" href={`/matches/${match.id}`}>сделайте прогноз на матч</Link>.
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }) : (
          <Card className="bg-white/[0.03]">
            <CardContent className="p-5 text-sm text-muted-foreground">
              Пока нет ни одной дуэли. Выберите матч выше и бросьте вызов первому сопернику.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
