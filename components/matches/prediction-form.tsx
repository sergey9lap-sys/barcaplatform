"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculatePredictionPreview } from "@/lib/predictions/points";
import { getStoredPrediction, MOCK_USER_ID, saveStoredPrediction } from "@/lib/predictions/storage";
import { createSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileExists } from "@/lib/supabase/ensure-profile";
import type { Match, MatchPredictionRecord, PredictionChoice } from "@/types/database";
import { cn } from "@/lib/utils";

const resultOptions: { value: PredictionChoice; label: string; description: string }[] = [
  { value: "home", label: "Победа", description: "Барса берёт три очка" },
  { value: "draw", label: "Ничья", description: "Равная игра и раздел очков" },
  { value: "away", label: "Поражение", description: "Соперник забирает результат" },
];

const resultLabels: Record<PredictionChoice, string> = {
  home: "победа",
  draw: "ничья",
  away: "поражение",
};

interface PredictionFormProps {
  match: Match;
  initialPrediction?: MatchPredictionRecord | null;
  userId?: string | null;
  backendEnabled?: boolean;
}

export function PredictionForm({ match, initialPrediction = null, userId = null, backendEnabled = false }: PredictionFormProps) {
  const [selectedResult, setSelectedResult] = useState<PredictionChoice>("home");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [savedPrediction, setSavedPrediction] = useState<MatchPredictionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isOpen = match.status === "upcoming";
  const requiresAuth = backendEnabled;

  useEffect(() => {
    if (backendEnabled) {
      if (!initialPrediction) {
        return;
      }

      setSavedPrediction(initialPrediction);
      setSelectedResult(initialPrediction.result);
      setHomeScore(initialPrediction.score.home?.toString() ?? "");
      setAwayScore(initialPrediction.score.away?.toString() ?? "");
      return;
    }

    const localPrediction = getStoredPrediction(match.id, MOCK_USER_ID);

    if (!localPrediction) {
      return;
    }

    setSavedPrediction(localPrediction);
    setSelectedResult(localPrediction.result);
    setHomeScore(localPrediction.score.home?.toString() ?? "");
    setAwayScore(localPrediction.score.away?.toString() ?? "");
  }, [backendEnabled, initialPrediction, match.id]);

  const previewPoints = useMemo(() => {
    return calculatePredictionPreview(match, {
      result: selectedResult,
      score: {
        home: homeScore === "" ? null : Number(homeScore),
        away: awayScore === "" ? null : Number(awayScore),
      },
    });
  }, [awayScore, homeScore, match, selectedResult]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isOpen) {
      setError("Для завершённого матча прогноз уже закрыт.");
      return;
    }

    if (requiresAuth && !userId) {
      setError("Чтобы сохранить прогноз, сначала войдите в аккаунт.");
      return;
    }

    const parsedHome = homeScore === "" ? null : Number(homeScore);
    const parsedAway = awayScore === "" ? null : Number(awayScore);

    if ((homeScore !== "" && Number.isNaN(parsedHome)) || (awayScore !== "" && Number.isNaN(parsedAway))) {
      setError("Счёт должен быть числом.");
      return;
    }

    let stored: MatchPredictionRecord;

    if (backendEnabled) {
      const supabase = createSupabaseClient();
      if (!supabase || !userId) {
        setError("Сохранение сейчас недоступно. Попробуйте войти позже.");
        return;
      }

      const { error: profileError } = await ensureProfileExists(supabase);
      if (profileError) {
        setError(profileError.message ?? "Не удалось подготовить профиль для сохранения прогноза.");
        return;
      }

      const { data, error: saveError } = await supabase
        .from("predictions")
        .upsert(
          {
            user_id: userId,
            match_id: match.id,
            predicted_result: selectedResult,
            predicted_home_score: parsedHome,
            predicted_away_score: parsedAway,
          },
          { onConflict: "user_id,match_id" },
        )
        .select()
        .single();

      if (saveError || !data) {
        setError(saveError?.message ?? "Не удалось сохранить прогноз.");
        return;
      }

      stored = {
        id: data.id,
        user_id: data.user_id,
        match_id: data.match_id,
        result: data.predicted_result,
        score: {
          home: data.predicted_home_score,
          away: data.predicted_away_score,
        },
        points_preview: data.points_awarded,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } else {
      stored = saveStoredPrediction({
        match,
        userId: MOCK_USER_ID,
        result: selectedResult,
        homeScore: parsedHome,
        awayScore: parsedAway,
      });
    }

    setSavedPrediction(stored);
    setSuccess(
      backendEnabled
        ? savedPrediction
          ? "Прогноз обновлён."
          : "Прогноз сохранён."
        : savedPrediction
          ? "Прогноз обновлён локально."
          : "Прогноз сохранён локально.",
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ваш прогноз</CardTitle>
        <CardDescription>
          {backendEnabled
            ? "Выберите исход матча и при желании добавьте точный счёт."
            : "Выберите исход матча и при желании добавьте точный счёт."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSave}>
          {backendEnabled && !userId ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm ui-value">
              Чтобы сохранять прогнозы, сначала <Link className="underline" href="/auth">войдите в аккаунт</Link>.
            </div>
          ) : null}

          {!isOpen ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              Матч завершён. Редактирование прогноза закрыто, но сохранённый выбор и расчёт очков остаются видимыми.
            </div>
          ) : null}

          <div className="grid gap-3">
            {resultOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedResult(option.value)}
                disabled={!isOpen}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition-colors",
                  selectedResult === option.value
                    ? "border-primary/50 bg-primary/12 text-[#f1d1db] shadow-glow"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-[#f1d1db]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{option.label}</p>
                  <span className="meta-label text-xs">
                    {selectedResult === option.value ? "Выбрано" : "Выбрать"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="meta-label text-xs">{match.home_team}</p>
              <Input
                inputMode="numeric"
                value={homeScore}
                onChange={(event) => setHomeScore(event.target.value)}
                placeholder="0"
                disabled={!isOpen}
              />
            </div>
            <div className="space-y-2">
              <p className="meta-label text-xs">{match.away_team}</p>
              <Input
                inputMode="numeric"
                value={awayScore}
                onChange={(event) => setAwayScore(event.target.value)}
                placeholder="0"
                disabled={!isOpen}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            {savedPrediction ? (
              <p>
                Сохранённый прогноз: <span className="text-[#f1d1db]">{resultLabels[savedPrediction.result]}</span>, счёт{" "}
                <span className="ui-value">
                  {savedPrediction.score.home ?? "-"}:{savedPrediction.score.away ?? "-"}
                </span>
                .
              </p>
            ) : (
              <p>Прогноз ещё не сохранён.</p>
            )}
            <p className="mt-2">
              Предпросмотр очков:{" "}
              <span className="text-[#f1d1db]">{previewPoints === null ? "будет рассчитано после результата" : `${previewPoints} очков`}</span>
            </p>
          </div>

          {error ? <p className="ui-status-error text-sm">{error}</p> : null}
          {success ? <p className="ui-status-success text-sm">{success}</p> : null}

          <Button className="w-full" disabled={!isOpen || (backendEnabled && !userId)}>
            {!isOpen ? "Прогноз закрыт" : savedPrediction ? "Обновить прогноз" : "Сохранить прогноз"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
