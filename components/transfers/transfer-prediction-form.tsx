"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { calculateTransferPredictionPoints } from "@/lib/scoring/extended-points";
import { cn } from "@/lib/utils";
import { createSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileExists } from "@/lib/supabase/ensure-profile";
import { getStoredTransferPrediction, MOCK_TRANSFER_USER_ID, saveStoredTransferPrediction } from "@/lib/transfers/storage";
import type {
  TransferPredictionChoice,
  TransferPredictionRecord,
  TransferRumor,
} from "@/types/database";

const options: Array<{ value: TransferPredictionChoice; title: string; description: string }> = [
  { value: "yes", title: "Будет переход", description: "Сделка реально дойдёт до подписи." },
  { value: "no", title: "Не будет перехода", description: "Шум останется слухом без трансфера." },
];

interface TransferPredictionFormProps {
  rumor: TransferRumor;
  initialPrediction?: TransferPredictionRecord | null;
  userId?: string | null;
  backendEnabled?: boolean;
}

export function TransferPredictionForm({
  rumor,
  initialPrediction = null,
  userId = null,
  backendEnabled = false,
}: TransferPredictionFormProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<TransferPredictionChoice>("yes");
  const [savedPrediction, setSavedPrediction] = useState<TransferPredictionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isOpen = rumor.status === "active";

  useEffect(() => {
    if (backendEnabled) {
      if (!initialPrediction) {
        return;
      }

      setSavedPrediction(initialPrediction);
      setSelectedPrediction(initialPrediction.prediction);
      return;
    }

    const localPrediction = getStoredTransferPrediction(rumor.id, MOCK_TRANSFER_USER_ID);
    if (!localPrediction) {
      return;
    }

    setSavedPrediction(localPrediction);
    setSelectedPrediction(localPrediction.prediction);
  }, [backendEnabled, initialPrediction, rumor.id]);

  async function handleSave() {
    setError(null);
    setSuccess(null);

    if (!isOpen) {
      setError("Этот сценарий уже закрыт и больше не редактируется.");
      return;
    }

    if (backendEnabled && !userId) {
      setError("Чтобы сохранить прогноз, сначала войдите в аккаунт.");
      return;
    }

    let stored: TransferPredictionRecord;

    if (backendEnabled) {
      const supabase = createSupabaseClient();
      if (!supabase || !userId) {
        setError("Сохранение сейчас недоступно. Попробуйте позже.");
        return;
      }

      const { error: profileError } = await ensureProfileExists(supabase);
      if (profileError) {
        setError(profileError.message ?? "Не удалось подготовить профиль для сохранения трансферного прогноза.");
        return;
      }

      const { data, error: saveError } = await supabase
        .from("transfer_predictions")
        .upsert(
          {
            user_id: userId,
            rumor_id: rumor.id,
            prediction: selectedPrediction,
          },
          { onConflict: "user_id,rumor_id" },
        )
        .select()
        .single();

      if (saveError || !data) {
        setError(saveError?.message ?? "Не удалось сохранить трансферный прогноз.");
        return;
      }

      stored = data as TransferPredictionRecord;
    } else {
      const pointsAwarded = calculateTransferPredictionPoints(
        {
          id: `transfer-${rumor.id}-${MOCK_TRANSFER_USER_ID}`,
          rumor_id: rumor.id,
          user_id: MOCK_TRANSFER_USER_ID,
          prediction: selectedPrediction,
          points_awarded: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        rumor,
        1,
        1,
      );

      stored = saveStoredTransferPrediction({
        rumorId: rumor.id,
        userId: MOCK_TRANSFER_USER_ID,
        prediction: selectedPrediction,
        pointsAwarded,
      });
    }

    setSavedPrediction(stored);
    setSuccess(savedPrediction ? "Прогноз обновлён." : "Прогноз сохранён.");
  }

  return (
    <details className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <summary className="cursor-pointer text-sm font-semibold text-blue-100">
        {isOpen ? "Сделать прогноз на трансфер" : "Результат трансферного прогноза"}
      </summary>
      <div className="mt-3 space-y-3">
      {backendEnabled && !userId ? (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm ui-value">
          Чтобы сохранять трансферные прогнозы, сначала <Link className="underline" href="/auth">войдите в аккаунт</Link>.
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedPrediction(option.value)}
            disabled={!isOpen}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left transition-colors",
              selectedPrediction === option.value
                ? "border-primary/50 bg-primary/12 text-[#f1d1db] shadow-glow"
                : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-[#f1d1db]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{option.title}</p>
              <span className="meta-label text-xs">
                {selectedPrediction === option.value ? "Выбрано" : "Выбрать"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-sm text-muted-foreground">
        {savedPrediction ? (
          <p>
            Ваш прогноз:{" "}
            <span className="ui-value">
              {savedPrediction.prediction === "yes" ? "переход будет" : "перехода не будет"}
            </span>
            .
          </p>
        ) : (
          <p>Прогноз по этому сценарию ещё не сохранён.</p>
        )}
        {rumor.status === "resolved" ? (
          <>
            <p className="mt-2">
              Итог: <span className="text-[#f1d1db]">{rumor.resolved_outcome ? "переход состоялся" : "сделка сорвалась"}</span>.
            </p>
            <p className="mt-2">
              Очки за этот прогноз: <span className="text-[#f1d1db]">{savedPrediction?.points_awarded ?? 0}</span>
            </p>
          </>
        ) : rumor.status === "archived" ? (
          <p className="mt-2">Сценарий убран в архив и не участвует в новом голосовании.</p>
        ) : (
          <p className="mt-2">Как только окно закроется, по этому прогнозу можно будет начислить очки.</p>
        )}
      </div>
 
      {error ? <p className="ui-status-error text-sm">{error}</p> : null}
      {success ? <p className="ui-status-success text-sm">{success}</p> : null}
 
      <Button className="w-full" onClick={handleSave} disabled={!isOpen || (backendEnabled && !userId)}>
        {!isOpen ? "Прогноз закрыт" : savedPrediction ? "Обновить прогноз" : "Сохранить прогноз"}
      </Button>
      </div>
    </details>
  );
}
