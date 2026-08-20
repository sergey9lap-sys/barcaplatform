"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileExists } from "@/lib/supabase/ensure-profile";
import { formatTransferDirection } from "@/lib/transfers/format";
import type { TransferDirection } from "@/types/database";

interface TransferIdeaFormProps {
  userId?: string | null;
  backendEnabled?: boolean;
}

const directions: TransferDirection[] = ["incoming", "outgoing"];

export function TransferIdeaForm({
  userId = null,
  backendEnabled = false,
}: TransferIdeaFormProps) {
  const [direction, setDirection] = useState<TransferDirection>("incoming");
  const [playerName, setPlayerName] = useState("");
  const [currentClub, setCurrentClub] = useState("");
  const [targetClub, setTargetClub] = useState("Барселона");
  const [estimatedFee, setEstimatedFee] = useState("");
  const [usefulness, setUsefulness] = useState("8");
  const [desire, setDesire] = useState("8");
  const [probability, setProbability] = useState("6");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!backendEnabled) {
      setError("Эта форма заработает после полного подключения базы.");
      return;
    }

    if (!userId) {
      setError("Чтобы добавить свой трансфер, сначала войдите в аккаунт.");
      return;
    }

    if (!playerName.trim() || !currentClub.trim() || !targetClub.trim()) {
      setError("Заполните игрока, текущий клуб и клуб назначения.");
      return;
    }

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Сейчас не удалось подключиться к базе.");
      return;
    }

    setSaving(true);

    const { error: profileError } = await ensureProfileExists(supabase);
    if (profileError) {
      setError(profileError.message ?? "Не удалось подготовить профиль для сохранения идеи.");
      setSaving(false);
      return;
    }

    const { error: saveError } = await supabase.from("transfer_ideas").insert({
      user_id: userId,
      player_name: playerName.trim(),
      current_club: currentClub.trim(),
      target_club: targetClub.trim(),
      direction,
      estimated_fee_millions: estimatedFee ? Number(estimatedFee) : null,
      usefulness_score: Number(usefulness),
      desire_score: Number(desire),
      probability_score: Number(probability),
      notes: notes.trim() || null,
    });

    if (saveError) {
      setError(saveError.message || "Не удалось сохранить трансферную идею.");
      setSaving(false);
      return;
    }

    setPlayerName("");
    setCurrentClub("");
    setTargetClub(direction === "incoming" ? "Барселона" : "");
    setEstimatedFee("");
    setUsefulness("8");
    setDesire("8");
    setProbability("6");
    setNotes("");
    setSaving(false);
    setSuccess("Трансферная идея сохранена. Обновите страницу, чтобы увидеть её в ленте.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {backendEnabled && !userId ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm ui-value">
          Чтобы добавить свою идею, сначала <Link className="underline" href="/auth">войдите в аккаунт</Link>.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {directions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setDirection(item);
              setTargetClub(item === "incoming" ? "Барселона" : "");
            }}
            className={direction === item ? "spotlight-strip text-left text-[#f1d1db]" : "soft-panel px-4 py-3 text-left ui-note"}
          >
            <p className="text-sm font-semibold">{formatTransferDirection(item)}</p>
            <p className="ui-note mt-1 text-xs">
              {item === "incoming" ? "Кого клубу стоит подписать." : "С кем клубу пора расстаться."}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input className="form-control" value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Игрок" />
        <input className="form-control" value={currentClub} onChange={(event) => setCurrentClub(event.target.value)} placeholder="Текущий клуб" />
        <input
          className="form-control"
          value={targetClub}
          onChange={(event) => setTargetClub(event.target.value)}
          placeholder={direction === "incoming" ? "Клуб назначения" : "Клуб, куда отпускать"}
        />
        <input
          className="form-control"
          value={estimatedFee}
          onChange={(event) => setEstimatedFee(event.target.value)}
          placeholder="Стоимость, млн"
          inputMode="decimal"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="soft-panel p-3 text-sm ui-note">
          Полезность
          <input className="form-control mt-2" value={usefulness} onChange={(event) => setUsefulness(event.target.value)} inputMode="numeric" />
        </label>
        <label className="soft-panel p-3 text-sm ui-note">
          Насколько хочется
          <input className="form-control mt-2" value={desire} onChange={(event) => setDesire(event.target.value)} inputMode="numeric" />
        </label>
        <label className="soft-panel p-3 text-sm ui-note">
          Вероятность
          <input className="form-control mt-2" value={probability} onChange={(event) => setProbability(event.target.value)} inputMode="numeric" />
        </label>
      </div>

      <textarea
        className="form-control min-h-[110px] resize-none"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Почему именно этот трансфер нужен или наоборот логичен на выход?"
      />

      {error ? <p className="ui-status-error text-sm">{error}</p> : null}
      {success ? <p className="ui-status-success text-sm">{success}</p> : null}

      <Button className="w-full" variant="secondary" disabled={saving}>
        {saving ? "Сохраняем идею..." : "Добавить свой трансфер"}
      </Button>
    </form>
  );
}
