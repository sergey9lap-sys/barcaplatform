"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download, LayoutTemplate } from "lucide-react";

import { getPlayerAvatarPath } from "@/lib/assets";
import { MOCK_LINEUP_USER_ID, getStoredLineupPrediction, saveStoredLineupPrediction } from "@/lib/lineup/storage";
import { formatPlayerPosition } from "@/lib/players/format";
import { createSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileExists } from "@/lib/supabase/ensure-profile";
import type { LineupPredictionRecord, Match, MatchPlayer, TacticalBoardPosition } from "@/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TACTICAL_FIELD_PATH = "/background/tactical-field-original.png";

const FORMATION_4231_LAYOUT: Array<{ x: number; y: number }> = [
  { x: 50, y: 90 },
  { x: 18, y: 72 },
  { x: 39, y: 75 },
  { x: 61, y: 75 },
  { x: 82, y: 72 },
  { x: 38, y: 57 },
  { x: 62, y: 57 },
  { x: 50, y: 41 },
  { x: 18, y: 29 },
  { x: 50, y: 17 },
  { x: 82, y: 29 },
];

interface LineupSelectorProps {
  match: Match;
  players: MatchPlayer[];
  initialLineup?: LineupPredictionRecord | null;
  userId?: string | null;
  backendEnabled?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDefaultPosition(index: number): TacticalBoardPosition {
  const fallback = FORMATION_4231_LAYOUT[index] ?? { x: 50, y: 50 };
  return {
    player_id: "",
    x: fallback.x,
    y: fallback.y,
  };
}

function createFormation4231Layout(players: MatchPlayer[]): TacticalBoardPosition[] {
  const groups = {
    GK: players.filter((player) => player.position === "GK"),
    DF: players.filter((player) => player.position === "DF"),
    MF: players.filter((player) => player.position === "MF"),
    FW: players.filter((player) => player.position === "FW"),
  };
  const positionsByRole = {
    GK: [FORMATION_4231_LAYOUT[0]],
    DF: FORMATION_4231_LAYOUT.slice(1, 5),
    MF: FORMATION_4231_LAYOUT.slice(5, 8),
    FW: FORMATION_4231_LAYOUT.slice(8, 11),
  };
  const assigned = new Set<string>();
  const layout: TacticalBoardPosition[] = [];

  (Object.keys(groups) as Array<keyof typeof groups>).forEach((role) => {
    groups[role].slice(0, positionsByRole[role].length).forEach((player, index) => {
      const position = positionsByRole[role][index];
      assigned.add(player.id);
      layout.push({ player_id: player.id, x: position.x, y: position.y });
    });
  });

  const unusedPositions = FORMATION_4231_LAYOUT.filter(
    (position) => !layout.some((item) => item.x === position.x && item.y === position.y),
  );
  players
    .filter((player) => !assigned.has(player.id))
    .forEach((player, index) => {
      const position = unusedPositions[index] ?? { x: 50, y: 50 };
      layout.push({ player_id: player.id, x: position.x, y: position.y });
    });

  return layout;
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${src}`));
    image.src = src;
  });
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  context.drawImage(image, (width - renderedWidth) / 2, (height - renderedHeight) / 2, renderedWidth, renderedHeight);
}

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const resolvedRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + resolvedRadius, y);
  context.arcTo(x + width, y, x + width, y + height, resolvedRadius);
  context.arcTo(x + width, y + height, x, y + height, resolvedRadius);
  context.arcTo(x, y + height, x, y, resolvedRadius);
  context.arcTo(x, y, x + width, y, resolvedRadius);
  context.closePath();
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function LineupSelector({
  match,
  players,
  initialLineup = null,
  userId = null,
  backendEnabled = false,
}: LineupSelectorProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [playerLayout, setPlayerLayout] = useState<TacticalBoardPosition[]>([]);
  const [savedLineup, setSavedLineup] = useState<LineupPredictionRecord | null>(null);
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const [exportingImage, setExportingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const selectedCount = selectedPlayerIds.length;
  const isOpen = match.status === "upcoming";
  const canSave = isOpen && selectedCount === 11;
  const requiresAuth = backendEnabled;
  const selectablePlayers = useMemo(() => players.filter((player) => player.position !== "COACH"), [players]);

  useEffect(() => {
    if (backendEnabled) {
      if (!initialLineup) {
        return;
      }

      setSavedLineup(initialLineup);
      setSelectedPlayerIds(initialLineup.selected_player_ids);
      setPlayerLayout(initialLineup.player_layout ?? []);
      return;
    }

    const localLineup = getStoredLineupPrediction(match.id, MOCK_LINEUP_USER_ID);

    if (!localLineup) {
      return;
    }

    setSavedLineup(localLineup);
    setSelectedPlayerIds(localLineup.selected_player_ids);
    setPlayerLayout(localLineup.player_layout ?? []);
  }, [backendEnabled, initialLineup, match.id]);

  const selectedPlayers = useMemo(
    () => selectablePlayers.filter((player) => selectedPlayerIds.includes(player.id)),
    [selectablePlayers, selectedPlayerIds],
  );

  const savedPlayerNames = useMemo(() => {
    if (!savedLineup) {
      return [];
    }

    return selectablePlayers
      .filter((player) => savedLineup.selected_player_ids.includes(player.id))
      .map((player) => player.player_name);
  }, [selectablePlayers, savedLineup]);

  function ensureLayoutForSelection(nextSelected: string[]) {
    setPlayerLayout((current) => {
      const filtered = current.filter((item) => nextSelected.includes(item.player_id));

      nextSelected.forEach((playerId, index) => {
        if (!filtered.some((item) => item.player_id === playerId)) {
          const basePosition = getDefaultPosition(index);
          filtered.push({
            player_id: playerId,
            x: basePosition.x,
            y: basePosition.y,
          });
        }
      });

      return filtered;
    });
  }

  function togglePlayer(playerId: string) {
    setError(null);
    setSuccess(null);

    setSelectedPlayerIds((current) => {
      let nextSelected: string[];

      if (current.includes(playerId)) {
        nextSelected = current.filter((id) => id !== playerId);
      } else {
        if (current.length >= 11) {
          setError("Можно выбрать только 11 игроков.");
          return current;
        }

        nextSelected = [...current, playerId];
      }

      ensureLayoutForSelection(nextSelected);
      return nextSelected;
    });
  }

  function updatePlayerPosition(playerId: string, clientX: number, clientY: number) {
    const field = fieldRef.current;
    if (!field) {
      return;
    }

    const rect = field.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 10, 90);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 10, 92);

    setPlayerLayout((current) =>
      current.map((item) => (item.player_id === playerId ? { ...item, x, y } : item)),
    );
  }

  function applyFormation4231() {
    setError(null);
    setSuccess(null);

    if (selectedPlayers.length !== 11) {
      setError("Чтобы применить 4‑2‑3‑1, сначала выберите 11 игроков.");
      return;
    }

    setPlayerLayout(createFormation4231Layout(selectedPlayers));
    setSuccess("Схема 4‑2‑3‑1 применена. Любого игрока можно передвинуть вручную.");
  }

  async function handleExportImage() {
    setError(null);
    setSuccess(null);

    if (!selectedPlayers.length) {
      setError("Сначала добавьте игроков на поле.");
      return;
    }

    setExportingImage(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 1500;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Не удалось подготовить изображение состава.");
      }

      const fieldImage = await loadCanvasImage(TACTICAL_FIELD_PATH);
      drawImageCover(context, fieldImage, canvas.width, canvas.height);

      const shade = context.createLinearGradient(0, 0, 0, canvas.height);
      shade.addColorStop(0, "rgba(3, 9, 26, 0.12)");
      shade.addColorStop(0.5, "rgba(4, 16, 34, 0.04)");
      shade.addColorStop(1, "rgba(35, 5, 22, 0.14)");
      context.fillStyle = shade;
      context.fillRect(0, 0, canvas.width, canvas.height);

      const playerImages = await Promise.all(
        selectedPlayers.map(async (player) => {
          const avatarPath = getPlayerAvatarPath(player.player_name);
          if (!avatarPath) {
            return { player, image: null };
          }

          try {
            return { player, image: await loadCanvasImage(avatarPath) };
          } catch {
            return { player, image: null };
          }
        }),
      );

      playerImages.forEach(({ player, image }) => {
        const position = playerLayout.find((item) => item.player_id === player.id);
        if (!position) {
          return;
        }

        const x = (position.x / 100) * canvas.width;
        const y = (position.y / 100) * canvas.height;
        const avatarRadius = 38;

        context.save();
        context.shadowColor = "rgba(1, 5, 18, 0.48)";
        context.shadowBlur = 22;
        context.shadowOffsetY = 10;
        context.beginPath();
        context.arc(x, y - 18, avatarRadius + 4, 0, Math.PI * 2);
        context.fillStyle = "rgba(249, 250, 255, 0.98)";
        context.fill();
        context.restore();

        context.save();
        context.beginPath();
        context.arc(x, y - 18, avatarRadius, 0, Math.PI * 2);
        context.clip();
        if (image) {
          const imageScale = Math.max((avatarRadius * 2) / image.naturalWidth, (avatarRadius * 2) / image.naturalHeight);
          const width = image.naturalWidth * imageScale;
          const height = image.naturalHeight * imageScale;
          context.drawImage(image, x - width / 2, y - 18 - height / 2, width, height);
        } else {
          context.fillStyle = "#183a84";
          context.fillRect(x - avatarRadius, y - 18 - avatarRadius, avatarRadius * 2, avatarRadius * 2);
          context.fillStyle = "#ffffff";
          context.font = '700 24px "Segoe UI", sans-serif';
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(getInitials(player.player_name), x, y - 18);
        }
        context.restore();

        const labelWidth = 128;
        const labelHeight = 54;
        const labelX = x - labelWidth / 2;
        const labelY = y + 25;
        roundedRectPath(context, labelX, labelY, labelWidth, labelHeight, 16);
        context.fillStyle = "rgba(5, 13, 34, 0.9)";
        context.fill();
        context.strokeStyle = "rgba(255, 255, 255, 0.18)";
        context.lineWidth = 2;
        context.stroke();

        context.fillStyle = "#ffffff";
        context.font = '700 18px "Segoe UI", sans-serif';
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(player.player_name.split(" ").slice(-1)[0], x, labelY + 18, labelWidth - 14);
        context.fillStyle = "#f2c95f";
        context.font = '700 15px "Segoe UI", sans-serif';
        context.fillText(`№ ${player.player_number ?? "—"}`, x, labelY + 39);
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Не удалось создать PNG."))), "image/png");
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `barca-lineup-${match.id}.png`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess("Изображение состава готово и скачано в PNG.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Не удалось скачать изображение состава.");
    } finally {
      setExportingImage(false);
    }
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);

    if (!isOpen) {
      setError("Для завершённого матча состав уже нельзя изменить.");
      return;
    }

    if (requiresAuth && !userId) {
      setError("Чтобы сохранить состав, сначала войдите в аккаунт.");
      return;
    }

    if (selectedPlayerIds.length !== 11) {
      setError("Нужно выбрать ровно 11 игроков.");
      return;
    }

    let stored: LineupPredictionRecord;

    if (backendEnabled) {
      const supabase = createSupabaseClient();
      if (!supabase || !userId) {
        setError("Сохранение сейчас недоступно. Попробуйте войти позже.");
        return;
      }

      const { error: profileError } = await ensureProfileExists(supabase);
      if (profileError) {
        setError(profileError.message ?? "Не удалось подготовить профиль для сохранения состава.");
        return;
      }

      const { data, error: saveError } = await supabase
        .from("lineup_predictions")
        .upsert(
          {
            user_id: userId,
            match_id: match.id,
            selected_player_ids: selectedPlayerIds,
            player_layout: playerLayout,
          },
          { onConflict: "user_id,match_id" },
        )
        .select()
        .single();

      if (saveError || !data) {
        setError(saveError?.message ?? "Не удалось сохранить состав.");
        return;
      }

      stored = {
        ...(data as LineupPredictionRecord),
        player_layout: Array.isArray(data.player_layout) ? (data.player_layout as TacticalBoardPosition[]) : [],
      };
    } else {
      stored = saveStoredLineupPrediction({
        matchId: match.id,
        selectedPlayerIds,
        playerLayout,
        userId: MOCK_LINEUP_USER_ID,
      });
    }

    setSavedLineup(stored);
    setSuccess(
      backendEnabled
        ? savedLineup
          ? "Состав и расстановка обновлены."
          : "Состав и расстановка сохранены."
        : savedLineup
          ? "Состав и расстановка обновлены локально."
          : "Состав и расстановка сохранены локально.",
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогноз состава</CardTitle>
        <CardDescription>Выберите стартовые 11 игроков и расставьте их на поле.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {backendEnabled && !userId ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-white">
            Чтобы сохранять состав, сначала <Link className="underline" href="/auth">войдите в аккаунт</Link>.
          </div>
        ) : null}

        {!isOpen ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            Матч завершён. Состав и тактическая доска остаются видимыми, но изменить их уже нельзя.
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Выбрано {selectedCount} из 11</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedCount === 11
              ? "Стартовый состав готов. Теперь можно подвинуть игроков по полю."
              : `Нужно выбрать ещё ${11 - selectedCount} игрок${11 - selectedCount === 1 ? "а" : "ов"}.`}
          </p>
        </div>

        <div className="grid gap-2">
          {selectablePlayers.map((player) => {
            const selected = selectedPlayerIds.includes(player.id);
            const avatarPath = getPlayerAvatarPath(player.player_name);

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                disabled={!isOpen && !selected}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                  selected
                    ? "border-accent/50 bg-accent/15 text-white shadow-glow"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="club-avatar h-12 w-12 rounded-2xl bg-cover bg-center text-xs"
                    style={avatarPath ? { backgroundImage: `url(${avatarPath})` } : undefined}
                  >
                    {avatarPath ? null : getInitials(player.player_name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{player.player_name}</p>
                    <p className="meta-label mt-1 text-xs">
                      {formatPlayerPosition(player.position)} {player.player_number ? `#${player.player_number}` : ""}
                    </p>
                  </div>
                </div>
                <span className="meta-label text-xs">{selected ? "В поле" : "Добавить"}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="ui-value text-sm font-medium">Тактическая доска · 4‑2‑3‑1</p>
              <p className="mt-1 text-sm ui-note">
                Перетаскивайте игроков в любое место или возвращайте их в базовую схему.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={applyFormation4231}>
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Расставить 4‑2‑3‑1
            </Button>
          </div>

          <div
            ref={fieldRef}
            className="lineup-field relative mx-auto overflow-hidden rounded-2xl border border-[#7f1d47]/35 shadow-card"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(4,10,27,0.12), rgba(7,14,35,0.04) 55%, rgba(66,8,35,0.12)), url("${TACTICAL_FIELD_PATH}")`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(2,7,22,0.18)_100%)]" />

            {selectedPlayers.map((player) => {
              const layout = playerLayout.find((item) => item.player_id === player.id);
              const avatarPath = getPlayerAvatarPath(player.player_name);
              if (!layout) {
                return null;
              }

              return (
                <button
                  key={player.id}
                  type="button"
                  disabled={!isOpen}
                  aria-label={`Переместить ${player.player_name}`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDraggingPlayerId(player.id);
                    updatePlayerPosition(player.id, event.clientX, event.clientY);
                  }}
                  onPointerMove={(event) => {
                    if (draggingPlayerId !== player.id) {
                      return;
                    }

                    updatePlayerPosition(player.id, event.clientX, event.clientY);
                  }}
                  onPointerUp={(event) => {
                    if (draggingPlayerId === player.id) {
                      updatePlayerPosition(player.id, event.clientX, event.clientY);
                    }

                    setDraggingPlayerId(null);
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                  }}
                  onPointerCancel={() => setDraggingPlayerId(null)}
                  onLostPointerCapture={() => setDraggingPlayerId(null)}
                  className={cn(
                    "lineup-player absolute flex h-24 w-20 -translate-x-1/2 -translate-y-1/2 touch-none flex-col items-center justify-start text-white",
                    draggingPlayerId === player.id && "is-dragging",
                  )}
                  style={{
                    left: `${layout.x}%`,
                    top: `${layout.y}%`,
                  }}
                >
                  <div
                    className="lineup-player-avatar club-avatar h-14 w-14 rounded-full border-2 border-white/30 bg-cover bg-center shadow-[0_12px_28px_rgba(7,16,42,0.45)]"
                    style={avatarPath ? { backgroundImage: `url(${avatarPath})` } : undefined}
                  >
                    {avatarPath ? null : getInitials(player.player_name)}
                  </div>
                  <div className="mt-1.5 flex w-full flex-col items-center gap-1 rounded-2xl border border-white/10 bg-[#07152f]/86 px-2 py-1.5 shadow-[0_10px_28px_rgba(2,8,24,0.38)] backdrop-blur-sm">
                    <span className="max-w-[64px] truncate text-[10px] font-medium leading-none text-[#f1d1db]">
                      {player.player_name.split(" ").slice(-1)[0]}
                    </span>
                    <span className="rounded-full border border-white/10 bg-gradient-to-r from-[#17439a] to-[#7f1d47] px-2.5 py-0.5 text-[10px] font-semibold leading-none text-[#f7d7e1]">
                      № {player.player_number ?? getInitials(player.player_name)}
                    </span>
                  </div>
                </button>
              );
            })}

            {!selectedPlayers.length ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-blue-100/80">
                Выберите игроков выше, и они появятся на поле.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
          {savedLineup ? (
            <>
              <p className="text-white">Сохранённый состав уже есть.</p>
              <p className="mt-2">{savedPlayerNames.join(", ")}</p>
            </>
          ) : (
            <p>Состав ещё не сохранён.</p>
          )}
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {success ? <p className="text-sm text-blue-200">{success}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="w-full" onClick={handleSave} disabled={!canSave || (backendEnabled && !userId)}>
            {!isOpen ? "Редактирование закрыто" : savedLineup ? "Сохранить изменения" : "Сохранить состав"}
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="secondary"
            onClick={handleExportImage}
            disabled={!selectedCount || exportingImage}
          >
            <Download className="mr-2 h-4 w-4" />
            {exportingImage ? "Готовим PNG…" : "Скачать состав в PNG"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
