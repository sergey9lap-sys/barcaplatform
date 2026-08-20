"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getPlayerAvatarPath } from "@/lib/assets";
import { formatPlayerPosition } from "@/lib/players/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MOCK_PLAYER_RANKING_USER_ID,
  getStoredPlayerRankingsForMatch,
  getStoredPlayerRankingsForUser,
  saveStoredPlayerRankings,
} from "@/lib/player-rankings/storage";
import { buildRankingSummaryByPlayer, getSeasonPointsFromRank, MAX_MATCH_RANKINGS } from "@/lib/player-rankings/stats";
import { createSupabaseClient } from "@/lib/supabase/client";
import { ensureProfileExists } from "@/lib/supabase/ensure-profile";
import { cn } from "@/lib/utils";
import type { Match, MatchPlayedPlayer, MatchPlayer, PlayerRankingRecord } from "@/types/database";

interface PlayerRankingsProps {
  match: Match;
  players: MatchPlayer[];
  playedPlayers: MatchPlayedPlayer[];
  initialRankings?: PlayerRankingRecord[];
  initialUserRankings?: PlayerRankingRecord[];
  userId?: string | null;
  backendEnabled?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function PlayerRankings({
  match,
  players,
  playedPlayers,
  initialRankings = [],
  initialUserRankings = [],
  userId = null,
  backendEnabled = false,
}: PlayerRankingsProps) {
  const [allRankings, setAllRankings] = useState<PlayerRankingRecord[]>(initialRankings);
  const [orderedPlayerIds, setOrderedPlayerIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isFinished = match.status === "finished";
  const rankingAvailable = isFinished || playedPlayers.length > 0;
  const playedPlayerIdSet = useMemo(() => new Set(playedPlayers.map((item) => item.match_player_id)), [playedPlayers]);
  const playedMatchPlayers = useMemo(
    () => players.filter((player) => playedPlayerIdSet.has(player.id) && player.position !== "COACH"),
    [playedPlayerIdSet, players],
  );

  useEffect(() => {
    const basePlayers = playedMatchPlayers.map((player) => player.id);

    if (backendEnabled) {
      setAllRankings(initialRankings);
      if (initialUserRankings.length) {
        const sorted = [...initialUserRankings]
          .sort((a, b) => a.rank_position - b.rank_position)
          .map((item) => item.match_player_id);
        setOrderedPlayerIds(sorted);
      } else {
        setOrderedPlayerIds(basePlayers);
      }
      return;
    }

    const localRankings = getStoredPlayerRankingsForMatch(match.id);
    const localUserRankings = getStoredPlayerRankingsForUser(MOCK_PLAYER_RANKING_USER_ID)
      .filter((ranking) => ranking.match_id === match.id);

    setAllRankings(localRankings);
    if (localUserRankings.length) {
      const sorted = [...localUserRankings]
        .sort((a, b) => a.rank_position - b.rank_position)
        .map((item) => item.match_player_id);
      setOrderedPlayerIds(sorted);
    } else {
      setOrderedPlayerIds(basePlayers);
    }
  }, [backendEnabled, initialRankings, initialUserRankings, match.id, playedMatchPlayers]);

  useEffect(() => {
    setCurrentUserId(userId);
  }, [userId]);

  useEffect(() => {
    if (!backendEnabled) {
      return;
    }

    const supabase = createSupabaseClient();
    if (!supabase) {
      return;
    }

    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) {
        return;
      }

      setCurrentUserId(data.user?.id ?? null);
    });

    return () => {
      active = false;
    };
  }, [backendEnabled]);

  const playedPlayersById = useMemo(
    () => new Map(playedMatchPlayers.map((player) => [player.id, player])),
    [playedMatchPlayers],
  );

  const orderedPlayers = useMemo(
    () => orderedPlayerIds.map((id) => playedPlayersById.get(id)).filter((player): player is MatchPlayer => Boolean(player)),
    [orderedPlayerIds, playedPlayersById],
  );

  const summaryByPlayerId = useMemo(
    () => buildRankingSummaryByPlayer(playedMatchPlayers, allRankings),
    [allRankings, playedMatchPlayers],
  );

  function handleMove(playerId: string, direction: "up" | "down") {
    setOrderedPlayerIds((current) => {
      const index = current.indexOf(playerId);
      if (index === -1) {
        return current;
      }

      if (direction === "up" && index > 0) {
        return moveItem(current, index, index - 1);
      }

      if (direction === "down" && index < current.length - 1) {
        return moveItem(current, index, index + 1);
      }

      return current;
    });
  }

  function handleMoveToRank(playerId: string, nextRank: number) {
    setOrderedPlayerIds((current) => {
      const fromIndex = current.indexOf(playerId);
      const toIndex = Math.max(0, Math.min(current.length - 1, nextRank - 1));

      if (fromIndex === -1 || fromIndex === toIndex) {
        return current;
      }

      return moveItem(current, fromIndex, toIndex);
    });
  }

  function handleAssignRankBySlot(slotIndex: number, playerId: string) {
    setOrderedPlayerIds((current) => {
      const currentIndex = current.indexOf(playerId);
      if (currentIndex === -1) {
        return current;
      }

      if (currentIndex === slotIndex) {
        return current;
      }

      const next = [...current];
      const displacedPlayerId = next[slotIndex];
      next[slotIndex] = playerId;
      next[currentIndex] = displacedPlayerId;
      return next;
    });
  }

  function handleDragStart(playerId: string) {
    setDraggedPlayerId(playerId);
  }

  function handleDrop(targetPlayerId: string) {
    if (!draggedPlayerId || draggedPlayerId === targetPlayerId) {
      setDraggedPlayerId(null);
      return;
    }

    setOrderedPlayerIds((current) => {
      const fromIndex = current.indexOf(draggedPlayerId);
      const toIndex = current.indexOf(targetPlayerId);
      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      return moveItem(current, fromIndex, toIndex);
    });
    setDraggedPlayerId(null);
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);

    if (!rankingAvailable) {
      setError("Порядок игроков откроется после публикации списка сыгравших.");
      return;
    }

    if (!playedMatchPlayers.length) {
      setError("Список сыгравших игроков для этого матча ещё не заполнен.");
      return;
    }

    if (playedMatchPlayers.length !== MAX_MATCH_RANKINGS) {
      setError("Для этого матча должен быть заполнен список из 16 сыгравших игроков.");
      return;
    }

    if (orderedPlayers.length !== playedMatchPlayers.length) {
      setError("Порядок игроков заполнен не полностью.");
      return;
    }

    if (backendEnabled && !currentUserId) {
      setError("Чтобы сохранить порядок игроков, сначала войдите в аккаунт.");
      return;
    }

    setSaving(true);

    const payload = orderedPlayers.map((player, index) => ({
      match_player_id: player.id,
      rank_position: index + 1,
    }));

    let storedRankings: PlayerRankingRecord[];

    if (backendEnabled) {
      const supabase = createSupabaseClient();
      if (!supabase) {
        setError("Сохранение сейчас недоступно. Попробуйте позже.");
        setSaving(false);
        return;
      }

      const { user, error: profileError } = await ensureProfileExists(supabase);
      if (profileError || !user?.id) {
        setError(profileError.message ?? "Не удалось подготовить профиль для сохранения порядка игроков.");
        setSaving(false);
        return;
      }

      const authUserId = user.id;
      setCurrentUserId(authUserId);

      const { error: deleteError } = await supabase
        .from("player_rankings")
        .delete()
        .eq("user_id", authUserId)
        .eq("match_id", match.id);

      if (deleteError) {
        setError(deleteError.message ?? "Не удалось очистить прошлый порядок игроков.");
        setSaving(false);
        return;
      }

      const { data, error: saveError } = await supabase
        .from("player_rankings")
        .insert(
          payload.map((item) => ({
            user_id: authUserId,
            match_id: match.id,
            match_player_id: item.match_player_id,
            rank_position: item.rank_position,
          })),
        )
        .select();

      if (saveError || !data) {
        setError(saveError?.message ?? "Не удалось сохранить порядок игроков.");
        setSaving(false);
        return;
      }

      storedRankings = data as PlayerRankingRecord[];
    } else {
      storedRankings = saveStoredPlayerRankings({
        matchId: match.id,
        rankings: payload,
        userId: MOCK_PLAYER_RANKING_USER_ID,
      });
    }

    setAllRankings((current) => {
      const otherRankings = current.filter((item) => !(item.match_id === match.id && item.user_id === storedRankings[0]?.user_id));
      return [...otherRankings, ...storedRankings];
    });
    setSaving(false);
    setSuccess("Порядок игроков сохранён.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Кто был лучшим в матче</CardTitle>
        <CardDescription>
          Расставьте 16 сыгравших футболистов сверху вниз: 1 место — лучший игрок матча, 16 место — тот, кто повлиял меньше всех.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {backendEnabled && !currentUserId ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm ui-value">
            Чтобы сохранять порядок игроков, сначала <Link className="underline" href="/auth">войдите в аккаунт</Link>.
          </div>
        ) : null}

        {!rankingAvailable ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            Порядок игроков откроется после финального свистка и публикации списка сыгравших.
          </div>
        ) : !playedMatchPlayers.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            Список сыгравших игроков для этого матча ещё не заполнен.
          </div>
        ) : playedMatchPlayers.length !== MAX_MATCH_RANKINGS ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            Для этого матча должен быть заполнен список из 16 сыгравших игроков.
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-blue-100/80">
              Быстрый режим удобнее всего: выбирайте игрока сразу на нужное место. Карточки можно оставить для более точной ручной перестановки.
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={viewMode === "table" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Быстрый режим
              </Button>
              <Button
                type="button"
                variant={viewMode === "cards" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                Карточки
              </Button>
            </div>

            {viewMode === "table" ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                <div className="grid gap-2 md:grid-cols-2">
                  {orderedPlayers.map((player, index) => {
                    const points = getSeasonPointsFromRank(index + 1);

                    return (
                      <div
                        key={`slot-${index + 1}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="meta-label text-[10px]">Место {index + 1}</p>
                            <p className="ui-value mt-1 text-sm">{points} очков за матч</p>
                          </div>
                          <select
                            value={player.id}
                            onChange={(event) => handleAssignRankBySlot(index, event.target.value)}
                            className="min-w-[180px] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#f1d1db] outline-none transition focus:border-primary/40"
                          >
                            {playedMatchPlayers.map((optionPlayer) => (
                              <option key={optionPlayer.id} value={optionPlayer.id}>
                                {optionPlayer.player_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {orderedPlayers.map((player, index) => {
                  const summary = summaryByPlayerId.get(player.id);
                  const points = getSeasonPointsFromRank(index + 1);
                  const avatarPath = getPlayerAvatarPath(player.player_name);

                  return (
                    <div
                      key={player.id}
                      draggable
                      onDragStart={() => handleDragStart(player.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(player.id)}
                      onDragEnd={() => setDraggedPlayerId(null)}
                      className={cn(
                        "rounded-3xl border p-4 transition-colors",
                        draggedPlayerId === player.id
                          ? "border-primary/40 bg-primary/10 shadow-glow"
                          : "border-white/10 bg-white/[0.03]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#18439a] to-[#85153d] text-white shadow-glow">
                            <span className="text-lg font-semibold">{index + 1}</span>
                            <span className="meta-label text-[10px]">место</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div
                              className="club-avatar h-12 w-12 rounded-2xl bg-cover bg-center text-xs"
                              style={avatarPath ? { backgroundImage: `url(${avatarPath})` } : undefined}
                            >
                              {avatarPath ? null : getInitials(player.player_name)}
                            </div>
                            <div>
                              <p className="ui-value text-sm font-semibold">{player.player_name}</p>
                              <p className="meta-label mt-1 text-xs">
                                {formatPlayerPosition(player.position)} {player.player_number ? `#${player.player_number}` : ""}
                              </p>
                              <p className="mt-2 text-sm text-blue-100/75">
                                Ваши очки за матч: <span className="ui-value">{points}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="meta-label text-xs">Среднее место</p>
                          <p className="ui-value mt-1 text-sm font-semibold">
                            {summary?.rankings_count ? summary.average_rank_position : "—"}
                          </p>
                          <p className="mt-1 text-xs text-blue-100/65">
                            {summary?.rankings_count ? `голосов: ${summary.rankings_count}` : "ещё нет голосов"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleMove(player.id, "up")}>
                          Выше
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleMove(player.id, "down")}>
                          Ниже
                        </Button>
                        <label className="ml-auto flex items-center gap-2 text-sm text-blue-100/75">
                          <span className="meta-label text-[10px]">На место</span>
                          <select
                            value={index + 1}
                            onChange={(event) => handleMoveToRank(player.id, Number(event.target.value))}
                            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#f1d1db] outline-none transition focus:border-primary/40"
                          >
                            {orderedPlayers.map((_, placeIndex) => (
                              <option key={`${player.id}-${placeIndex + 1}`} value={placeIndex + 1}>
                                {placeIndex + 1}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {error ? <p className="ui-status-error text-sm">{error}</p> : null}
        {success ? <p className="ui-status-success text-sm">{success}</p> : null}

        <Button
          className="w-full"
          variant="secondary"
          onClick={handleSave}
          disabled={
            saving ||
            !rankingAvailable ||
            playedMatchPlayers.length !== MAX_MATCH_RANKINGS ||
            orderedPlayers.length !== MAX_MATCH_RANKINGS ||
            (backendEnabled && !currentUserId)
          }
        >
          {saving ? "Сохраняем порядок..." : "Сохранить порядок игроков"}
        </Button>
      </CardContent>
    </Card>
  );
}
