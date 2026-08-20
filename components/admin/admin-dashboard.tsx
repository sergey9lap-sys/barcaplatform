"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChallengeAdminPanel } from "@/components/admin/challenge-admin-panel";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { formatMatchDate } from "@/lib/format";
import { formatPlayerPosition } from "@/lib/players/format";
import { createSupabaseClient } from "@/lib/supabase/client";
import { formatTransferDirection, formatTransferStatus } from "@/lib/transfers/format";
import type {
  LeagueStanding,
  ChallengeRecord,
  Match,
  MatchPlayedPlayer,
  MatchPlayer,
  MatchPlayerStat,
  PlayerCatalogItem,
  SeasonPlayerStat,
  TransferDirection,
  TransferRumor,
} from "@/types/database";

function getSeasonLabelFromKickoff(kickoffAt?: string | null) {
  if (!kickoffAt) {
    return "2025-26";
  }

  const kickoffDate = new Date(kickoffAt);
  const year = kickoffDate.getUTCFullYear();
  const month = kickoffDate.getUTCMonth();
  const seasonStartYear = month >= 6 ? year : year - 1;

  return `${seasonStartYear}-${String((seasonStartYear + 1) % 100).padStart(2, "0")}`;
}

interface AdminDashboardProps {
  rumors: TransferRumor[];
  standings: LeagueStanding[];
  players: PlayerCatalogItem[];
  seasonStats: SeasonPlayerStat[];
  matches: Match[];
  matchPlayers: MatchPlayer[];
  playedPlayers: MatchPlayedPlayer[];
  matchPlayerStats: MatchPlayerStat[];
  challenges: ChallengeRecord[];
}

const defaultRumor = {
  id: "",
  player_name: "",
  current_club: "",
  target_club: "Барселона",
  direction: "incoming" as TransferDirection,
  window_label: "Лето 2026",
  status: "active" as TransferRumor["status"],
  probability_score: "6",
  usefulness_score: "7",
  recommendation: "true",
  resolved_outcome: "true",
  notes: "",
};

export function AdminDashboard({
  rumors,
  standings,
  players,
  seasonStats,
  matches,
  matchPlayers,
  playedPlayers,
  matchPlayerStats,
  challenges,
}: AdminDashboardProps) {
  const router = useRouter();
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rumorForm, setRumorForm] = useState(defaultRumor);
  const [standingForm, setStandingForm] = useState({
    id: "",
    competition: "Ла Лига",
    season_label: "2025-26",
    team_name: "",
    position: "1",
    played: "0",
    wins: "0",
    draws: "0",
    losses: "0",
    points: "0",
    goals_for: "0",
    goals_against: "0",
    goal_difference: "0",
    zone: "neutral" as LeagueStanding["zone"],
  });
  const [seasonStatForm, setSeasonStatForm] = useState({
    player_id: players[0]?.id ?? "",
    season_label: "2025-26",
    goals: "0",
    assists: "0",
    matches_played: "0",
    minutes_played: "0",
    avatar_url: "",
  });
  const [selectedMatchId, setSelectedMatchId] = useState(
    matches.find((match) => match.status === "finished")?.id ?? matches[0]?.id ?? "",
  );
  const [selectedPlayedPlayerIds, setSelectedPlayedPlayerIds] = useState<string[]>([]);
  const [matchResultForm, setMatchResultForm] = useState({
    status: "upcoming" as Match["status"],
    home_score: "",
    away_score: "",
  });
  const [matchStatsSeasonLabel, setMatchStatsSeasonLabel] = useState("2025-26");
  const [matchPlayerStatForm, setMatchPlayerStatForm] = useState<Record<string, { goals: string; assists: string }>>({});

  const seasonStatsByPlayerId = useMemo(
    () => new Map(seasonStats.map((item) => [item.player_id, item])),
    [seasonStats],
  );
  const matchPlayerStatsByMatchId = useMemo(() => {
    const grouped = new Map<string, MatchPlayerStat[]>();

    matchPlayerStats.forEach((item) => {
      const current = grouped.get(item.match_id) ?? [];
      current.push(item);
      grouped.set(item.match_id, current);
    });

    return grouped;
  }, [matchPlayerStats]);
  const playedPlayersByMatchId = useMemo(() => {
    const grouped = new Map<string, string[]>();

    playedPlayers.forEach((item) => {
      const current = grouped.get(item.match_id) ?? [];
      current.push(item.match_player_id);
      grouped.set(item.match_id, current);
    });

    return grouped;
  }, [playedPlayers]);
  const matchOptions = useMemo(
    () =>
      [...matches].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "finished" ? -1 : 1;
        }

        return new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime();
      }),
    [matches],
  );
  const selectedMatch = useMemo(
    () => matchOptions.find((match) => match.id === selectedMatchId) ?? null,
    [matchOptions, selectedMatchId],
  );
  const selectedMatchPlayers = useMemo(
    () =>
      matchPlayers.filter((player) => player.match_id === selectedMatchId && player.position !== "COACH"),
    [matchPlayers, selectedMatchId],
  );
  const groupedMatchPlayers = useMemo(() => {
    const order = ["GK", "DF", "MF", "FW"] as const;
    const labels: Record<string, string> = {
      GK: "Вратари",
      DF: "Защита",
      MF: "Полузащита",
      FW: "Атака",
    };

    return order
      .map((position) => ({
        position,
        title: labels[position],
        players: selectedMatchPlayers.filter((player) => player.position === position),
      }))
      .filter((group) => group.players.length);
  }, [selectedMatchPlayers]);

  useEffect(() => {
    setSelectedPlayedPlayerIds(playedPlayersByMatchId.get(selectedMatchId) ?? []);
  }, [playedPlayersByMatchId, selectedMatchId]);

  useEffect(() => {
    setMatchResultForm({
      status: selectedMatch?.status ?? "upcoming",
      home_score: selectedMatch?.home_score != null ? String(selectedMatch.home_score) : "",
      away_score: selectedMatch?.away_score != null ? String(selectedMatch.away_score) : "",
    });
  }, [selectedMatch]);

  useEffect(() => {
    if (!selectedMatch?.kickoff_at) {
      return;
    }

    setMatchStatsSeasonLabel(getSeasonLabelFromKickoff(selectedMatch.kickoff_at));
  }, [selectedMatch?.kickoff_at]);

  useEffect(() => {
    const statsForMatch = matchPlayerStatsByMatchId.get(selectedMatchId) ?? [];
    const nextForm = Object.fromEntries(
      selectedMatchPlayers.map((player) => {
        const current = statsForMatch.find((item) => item.match_player_id === player.id);
        return [
          player.id,
          {
            goals: String(current?.goals ?? 0),
            assists: String(current?.assists ?? 0),
          },
        ];
      }),
    );

    setMatchPlayerStatForm(nextForm);
  }, [matchPlayerStatsByMatchId, selectedMatchId, selectedMatchPlayers]);

  function fillStarterEleven() {
    setError(null);
    setMessage(null);

    const goalkeepers = selectedMatchPlayers.filter((player) => player.position === "GK").slice(0, 1);
    const defenders = selectedMatchPlayers.filter((player) => player.position === "DF").slice(0, 4);
    const midfielders = selectedMatchPlayers.filter((player) => player.position === "MF").slice(0, 3);
    const forwards = selectedMatchPlayers.filter((player) => player.position === "FW").slice(0, 3);

    let starterIds = [...goalkeepers, ...defenders, ...midfielders, ...forwards].map((player) => player.id);

    if (starterIds.length < 11) {
      const fallbackIds = selectedMatchPlayers.map((player) => player.id);
      starterIds = Array.from(new Set([...starterIds, ...fallbackIds])).slice(0, 11);
    }

    setSelectedPlayedPlayerIds(starterIds);
  }

  function fillBenchPlayers() {
    setError(null);
    setMessage(null);

    setSelectedPlayedPlayerIds((current) => {
      const remainingIds = selectedMatchPlayers
        .map((player) => player.id)
        .filter((playerId) => !current.includes(playerId));

      return [...current, ...remainingIds.slice(0, Math.max(0, 16 - current.length))].slice(0, 16);
    });
  }

  function clearPlayedPlayers() {
    setError(null);
    setMessage(null);
    setSelectedPlayedPlayerIds([]);
  }

  function togglePlayedPlayer(matchPlayerId: string) {
    setError(null);
    setMessage(null);

    setSelectedPlayedPlayerIds((current) => {
      if (current.includes(matchPlayerId)) {
        return current.filter((id) => id !== matchPlayerId);
      }

      if (current.length >= 16) {
        setError("Для послематчевого рейтинга нужно выбрать ровно 16 сыгравших игроков.");
        return current;
      }

      return [...current, matchPlayerId];
    });
  }

  async function recalculateSeasonStatsForPlayers(
    supabase: ReturnType<typeof createSupabaseClient>,
    playerIds: string[],
    seasonLabel: string,
    nextPlayedPlayers: MatchPlayedPlayer[],
    nextMatchStats: MatchPlayerStat[],
  ) {
    if (!supabase || !playerIds.length) {
      return null;
    }

    const seasonMatchIds = new Set(
      matches
        .filter((match) => getSeasonLabelFromKickoff(match.kickoff_at) === seasonLabel)
        .map((match) => match.id),
    );
    const matchPlayersById = new Map(matchPlayers.map((player) => [player.id, player]));
    const { data: currentSeasonStats, error: currentSeasonStatsError } = await supabase
      .from("season_player_stats")
      .select("*")
      .eq("season_label", seasonLabel)
      .in("player_id", playerIds);

    if (currentSeasonStatsError) {
      return currentSeasonStatsError.message;
    }

    const currentSeasonStatsByPlayerId = new Map(
      ((currentSeasonStats as SeasonPlayerStat[] | null) ?? []).map((item) => [item.player_id, item]),
    );
    const aggregatedGoalsAndAssistsByPlayerId = new Map<string, { goals: number; assists: number }>();
    const matchesPlayedByPlayerId = new Map<string, number>();

    nextMatchStats.forEach((item) => {
      if (!seasonMatchIds.has(item.match_id)) {
        return;
      }

      const matchPlayer = matchPlayersById.get(item.match_player_id);
      if (!matchPlayer?.player_id) {
        return;
      }

      const current = aggregatedGoalsAndAssistsByPlayerId.get(matchPlayer.player_id) ?? { goals: 0, assists: 0 };
      current.goals += item.goals;
      current.assists += item.assists;
      aggregatedGoalsAndAssistsByPlayerId.set(matchPlayer.player_id, current);
    });

    nextPlayedPlayers.forEach((item) => {
      if (!seasonMatchIds.has(item.match_id)) {
        return;
      }

      const matchPlayer = matchPlayersById.get(item.match_player_id);
      if (!matchPlayer?.player_id) {
        return;
      }

      matchesPlayedByPlayerId.set(matchPlayer.player_id, (matchesPlayedByPlayerId.get(matchPlayer.player_id) ?? 0) + 1);
    });

    for (const playerId of playerIds) {
      const aggregated = aggregatedGoalsAndAssistsByPlayerId.get(playerId) ?? { goals: 0, assists: 0 };
      const currentStat = currentSeasonStatsByPlayerId.get(playerId) ?? seasonStatsByPlayerId.get(playerId);
      const { error: statError } = await supabase.from("season_player_stats").upsert(
        {
          player_id: playerId,
          season_label: seasonLabel,
          goals: aggregated.goals,
          assists: aggregated.assists,
          matches_played: matchesPlayedByPlayerId.get(playerId) ?? 0,
          minutes_played: currentStat?.minutes_played ?? 0,
          avatar_url: currentStat?.avatar_url ?? null,
        },
        { onConflict: "player_id,season_label" },
      );

      if (statError) {
        return statError.message;
      }
    }

    return null;
  }

  async function savePlayedPlayers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSection("played");
    setError(null);
    setMessage(null);

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Нет подключения к базе.");
      setSavingSection(null);
      return;
    }

    if (!selectedMatchId) {
      setError("Сначала выберите матч.");
      setSavingSection(null);
      return;
    }

    if (selectedPlayedPlayerIds.length !== 16) {
      setError("Чтобы пользователи могли ранжировать игроков, выберите ровно 16 сыгравших.");
      setSavingSection(null);
      return;
    }

    const { error: deleteError } = await supabase.from("match_played_players").delete().eq("match_id", selectedMatchId);
    if (deleteError) {
      setError(deleteError.message);
      setSavingSection(null);
      return;
    }

    const { error: insertError } = await supabase.from("match_played_players").insert(
      selectedPlayedPlayerIds.map((matchPlayerId) => ({
        match_id: selectedMatchId,
        match_player_id: matchPlayerId,
      })),
    );

    if (insertError) {
      setError(insertError.message);
      setSavingSection(null);
      return;
    }

    const seasonLabel = getSeasonLabelFromKickoff(selectedMatch?.kickoff_at);
    const nextPlayedPlayers = [
      ...playedPlayers.filter((item) => item.match_id !== selectedMatchId),
      ...selectedPlayedPlayerIds.map((matchPlayerId, index) => ({
        id: `pending-played-${matchPlayerId}-${index}`,
        match_id: selectedMatchId,
        match_player_id: matchPlayerId,
        created_at: new Date().toISOString(),
      })),
    ];
    const affectedPlayerIds = Array.from(
      new Set(
        selectedMatchPlayers
          .map((player) => player.player_id)
          .filter((playerId): playerId is string => Boolean(playerId)),
      ),
    );
    const seasonStatsError = await recalculateSeasonStatsForPlayers(
      supabase,
      affectedPlayerIds,
      seasonLabel,
      nextPlayedPlayers,
      matchPlayerStats,
    );

    if (seasonStatsError) {
      setError(seasonStatsError);
      setSavingSection(null);
      return;
    }

    setMessage("Список сыгравших игроков сохранён. Матчи в общей статистике тоже пересчитаны автоматически.");
    setSavingSection(null);
    router.refresh();
  }

  async function saveMatchResult() {
    setSavingSection("match-result");
    setError(null);
    setMessage(null);

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Нет подключения к базе.");
      setSavingSection(null);
      return;
    }

    if (!selectedMatchId) {
      setError("Сначала выберите матч.");
      setSavingSection(null);
      return;
    }

    const payload = {
      status: matchResultForm.status,
      home_score: matchResultForm.home_score === "" ? null : Number(matchResultForm.home_score),
      away_score: matchResultForm.away_score === "" ? null : Number(matchResultForm.away_score),
    };

    const { error: saveError } = await supabase.from("matches").update(payload).eq("id", selectedMatchId);

    if (saveError) {
      setError(saveError.message);
      setSavingSection(null);
      return;
    }

    setMessage("Статус и счёт матча сохранены.");
    setSavingSection(null);
    router.refresh();
  }

  async function saveMatchPlayerStats() {
    setSavingSection("match-player-stats");
    setError(null);
    setMessage(null);

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Нет подключения к базе.");
      setSavingSection(null);
      return;
    }

    if (!selectedMatchId) {
      setError("Сначала выберите матч.");
      setSavingSection(null);
      return;
    }

    const missingStablePlayers = selectedMatchPlayers
      .filter((player) => {
        const stat = matchPlayerStatForm[player.id];
        const goals = Number(stat?.goals ?? 0);
        const assists = Number(stat?.assists ?? 0);
        return (goals > 0 || assists > 0) && !player.player_id;
      })
      .map((player) => player.player_name);

    if (missingStablePlayers.length) {
      setError(`У этих игроков нет привязки к каталогу игроков: ${missingStablePlayers.join(", ")}.`);
      setSavingSection(null);
      return;
    }

    const payload = selectedMatchPlayers
      .map((player) => {
        const stat = matchPlayerStatForm[player.id];
        const goals = Math.max(0, Number(stat?.goals ?? 0));
        const assists = Math.max(0, Number(stat?.assists ?? 0));

        return {
          match_id: selectedMatchId,
          match_player_id: player.id,
          goals,
          assists,
        };
      })
      .filter((item) => item.goals > 0 || item.assists > 0);

    const { error: deleteError } = await supabase.from("match_player_stats").delete().eq("match_id", selectedMatchId);
    if (deleteError) {
      setError(deleteError.message);
      setSavingSection(null);
      return;
    }

    if (payload.length) {
      const { error: insertError } = await supabase.from("match_player_stats").insert(payload);
      if (insertError) {
        setError(insertError.message);
        setSavingSection(null);
        return;
      }
    }

    const seasonLabel = matchStatsSeasonLabel.trim() || getSeasonLabelFromKickoff(selectedMatch?.kickoff_at);
    const nextMatchStats = [
      ...matchPlayerStats.filter((item) => item.match_id !== selectedMatchId),
      ...payload.map((item, index) => ({
        id: `pending-${item.match_player_id}-${index}`,
        match_id: item.match_id,
        match_player_id: item.match_player_id,
        goals: item.goals,
        assists: item.assists,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    ];
    const affectedPlayerIds = Array.from(
      new Set(
        selectedMatchPlayers
          .map((player) => player.player_id)
          .filter((playerId): playerId is string => Boolean(playerId)),
      ),
    );

    const seasonStatsError = await recalculateSeasonStatsForPlayers(
      supabase,
      affectedPlayerIds,
      seasonLabel,
      playedPlayers,
      nextMatchStats,
    );

    if (seasonStatsError) {
      setError(seasonStatsError);
      setSavingSection(null);
      return;
    }

    setMessage("Голы, ассисты и матчи в общей статистике игроков пересчитаны автоматически.");
    setSavingSection(null);
    router.refresh();
  }

  async function saveRumor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSection("rumor");
    setError(null);
    setMessage(null);

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Нет подключения к базе.");
      setSavingSection(null);
      return;
    }

    const payload = {
      ...(rumorForm.id ? { id: rumorForm.id } : {}),
      player_name: rumorForm.player_name,
      current_club: rumorForm.current_club,
      target_club: rumorForm.target_club,
      direction: rumorForm.direction,
      window_label: rumorForm.window_label,
      status: rumorForm.status,
      probability_score: Number(rumorForm.probability_score),
      usefulness_score: Number(rumorForm.usefulness_score),
      recommendation: rumorForm.recommendation === "true",
      notes: rumorForm.notes || null,
      resolved_outcome: rumorForm.status === "resolved" ? rumorForm.resolved_outcome === "true" : null,
    };

    const query = rumorForm.id
      ? supabase.from("transfer_rumors").update(payload).eq("id", rumorForm.id)
      : supabase.from("transfer_rumors").insert(payload);
    const { error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
      setSavingSection(null);
      return;
    }

    setMessage("Трансферный сценарий сохранён.");
    setRumorForm(defaultRumor);
    setSavingSection(null);
    router.refresh();
  }

  async function saveStanding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSection("standing");
    setError(null);
    setMessage(null);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Нет подключения к базе.");
      setSavingSection(null);
      return;
    }

    const payload = {
      ...(standingForm.id ? { id: standingForm.id } : {}),
      competition: standingForm.competition,
      season_label: standingForm.season_label,
      team_name: standingForm.team_name,
      position: Number(standingForm.position),
      played: Number(standingForm.played),
      wins: Number(standingForm.wins),
      draws: Number(standingForm.draws),
      losses: Number(standingForm.losses),
      points: Number(standingForm.points),
      goals_for: Number(standingForm.goals_for),
      goals_against: Number(standingForm.goals_against),
      goal_difference: Number(standingForm.goal_difference),
      zone: standingForm.zone,
    };

    const query = standingForm.id
      ? supabase.from("league_standings").update(payload).eq("id", standingForm.id)
      : supabase.from("league_standings").insert(payload);
    const { error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
      setSavingSection(null);
      return;
    }

    setMessage("Строка таблицы сохранена.");
    setSavingSection(null);
    router.refresh();
  }

  async function saveSeasonStat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSection("player");
    setError(null);
    setMessage(null);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Нет подключения к базе.");
      setSavingSection(null);
      return;
    }

    const { error: saveError } = await supabase.from("season_player_stats").upsert(
      {
        player_id: seasonStatForm.player_id,
        season_label: seasonStatForm.season_label,
        goals: Number(seasonStatForm.goals),
        assists: Number(seasonStatForm.assists),
        matches_played: Number(seasonStatForm.matches_played),
        minutes_played: Number(seasonStatForm.minutes_played),
        avatar_url: seasonStatForm.avatar_url || null,
      },
      { onConflict: "player_id,season_label" },
    );

    if (saveError) {
      setError(saveError.message);
      setSavingSection(null);
      return;
    }

    setMessage("Статистика игрока сохранена.");
    setSavingSection(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="hero-panel" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.adminHero, { position: "center 68%" })}>
        <CardContent className="space-y-2 p-5">
          <p className="meta-label text-xs">Админка</p>
          <h2 className="text-2xl font-semibold">Ручное управление контентом сезона</h2>
          <p className="ui-note text-sm">
            Отсюда можно поддерживать трансферы, турнирную таблицу и базовую статистику игроков без похода в SQL.
          </p>
        </CardContent>
      </Card>

      {error ? <p className="ui-status-error text-sm">{error}</p> : null}
      {message ? <p className="ui-status-success text-sm">{message}</p> : null}

      <ChallengeAdminPanel challenges={challenges} matches={matches} players={players} />

      <Card className="barca-panel border-accent/15">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="meta-label text-xs">Матчи</p>
            <h3 className="ui-value mt-2 text-xl font-semibold">Сыгравшие игроки после матча</h3>
            <p className="ui-note mt-2 text-sm">
              Выберите матч и отметьте 16 футболистов, которые реально выходили на поле. После этого на странице матча откроется рейтинг лучших и худших игроков.
            </p>
          </div>

          <form onSubmit={savePlayedPlayers} className="space-y-4">
            <select
              className="form-control"
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
            >
              {matchOptions.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.home_team} vs {match.away_team} · {formatMatchDate(match.kickoff_at)} · {match.status === "finished" ? "завершён" : "ещё не сыгран"}
                </option>
              ))}
            </select>

            {selectedMatch ? (
              <div className="soft-panel px-4 py-3 text-sm ui-note">
                <p className="ui-value font-semibold">
                  {selectedMatch.home_team} vs {selectedMatch.away_team}
                </p>
                <p className="mt-1">{formatMatchDate(selectedMatch.kickoff_at)} · {selectedMatch.venue}</p>
                <p className="mt-2">
                  Отмечено сыгравших: <span className="ui-value">{selectedPlayedPlayerIds.length}</span> из 16
                </p>
              </div>
            ) : null}

            <div className="soft-panel space-y-3 px-4 py-4">
              <div>
                <p className="meta-label text-xs">Итог матча</p>
                <p className="ui-note mt-2 text-sm">
                  Здесь можно пометить матч завершённым и указать счёт, чтобы все послематчевые блоки открывались корректно.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  className="form-control"
                  value={matchResultForm.status}
                  onChange={(e) => setMatchResultForm((current) => ({ ...current, status: e.target.value as Match["status"] }))}
                >
                  <option value="upcoming">Ещё не завершён</option>
                  <option value="finished">Завершён</option>
                </select>
                <input
                  className="form-control"
                  placeholder={`${selectedMatch?.home_team ?? "Хозяева"}: голы`}
                  value={matchResultForm.home_score}
                  onChange={(e) => setMatchResultForm((current) => ({ ...current, home_score: e.target.value }))}
                  inputMode="numeric"
                />
                <input
                  className="form-control"
                  placeholder={`${selectedMatch?.away_team ?? "Гости"}: голы`}
                  value={matchResultForm.away_score}
                  onChange={(e) => setMatchResultForm((current) => ({ ...current, away_score: e.target.value }))}
                  inputMode="numeric"
                />
              </div>

              <Button type="button" variant="outline" onClick={() => void saveMatchResult()} disabled={savingSection === "match-result"}>
                {savingSection === "match-result" ? "Сохраняем итог..." : "Сохранить статус и счёт"}
              </Button>
            </div>

            <div className="soft-panel space-y-4 px-4 py-4">
              <div>
                <p className="meta-label text-xs">События матча</p>
                <h4 className="ui-value mt-2 text-lg font-semibold">Кто забил и кто отдал голевую</h4>
                <p className="ui-note mt-2 text-sm">
                  Внесите голы и ассисты по игрокам для выбранного матча. После сохранения эти значения попадут в общую сезонную статистику игроков.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                <input
                  className="form-control"
                  placeholder="Сезон для общей статистики"
                  value={matchStatsSeasonLabel}
                  onChange={(e) => setMatchStatsSeasonLabel(e.target.value)}
                />
                <div className="soft-panel px-4 py-3 text-sm ui-note">
                  Сохраняется по матчу, а затем суммируется в сезон.
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  {selectedMatchPlayers.map((player) => {
                    const stat = matchPlayerStatForm[player.id] ?? { goals: "0", assists: "0" };

                    return (
                      <div key={player.id} className="soft-panel grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_120px_120px] sm:items-center">
                        <div>
                          <p className="ui-value font-semibold">
                            {player.player_name}
                            {player.player_number ? ` · №${player.player_number}` : ""}
                          </p>
                          <p className="ui-note mt-1 text-xs">{formatPlayerPosition(player.position)}</p>
                        </div>
                        <input
                          className="form-control"
                          inputMode="numeric"
                          placeholder="Голы"
                          value={stat.goals}
                          onChange={(e) =>
                            setMatchPlayerStatForm((current) => ({
                              ...current,
                              [player.id]: { ...current[player.id], goals: e.target.value },
                            }))
                          }
                        />
                        <input
                          className="form-control"
                          inputMode="numeric"
                          placeholder="Пасы"
                          value={stat.assists}
                          onChange={(e) =>
                            setMatchPlayerStatForm((current) => ({
                              ...current,
                              [player.id]: { ...current[player.id], assists: e.target.value },
                            }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>

                <Button type="button" className="w-full" variant="secondary" onClick={() => void saveMatchPlayerStats()} disabled={savingSection === "match-player-stats"}>
                  {savingSection === "match-player-stats" ? "Сохраняем голы и ассисты..." : "Сохранить голы и ассисты по матчу"}
                </Button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Button type="button" variant="outline" onClick={fillStarterEleven}>
                Выбрать стартовые 11
              </Button>
              <Button type="button" variant="outline" onClick={fillBenchPlayers}>
                Добрать 5 замен
              </Button>
              <Button type="button" variant="ghost" onClick={clearPlayedPlayers}>
                Очистить выбор
              </Button>
            </div>

            <div className="space-y-4">
              {groupedMatchPlayers.map((group) => (
                <div key={group.position} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="meta-label text-xs">{group.title}</p>
                    <p className="ui-note text-xs">{group.players.length} игроков</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.players.map((player) => {
                      const selected = selectedPlayedPlayerIds.includes(player.id);

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => togglePlayedPlayer(player.id)}
                          className={
                            selected
                              ? "soft-panel border border-accent/40 bg-accent/15 px-4 py-3 text-left shadow-glow"
                              : "soft-panel border border-white/10 px-4 py-3 text-left"
                          }
                        >
                          <p className="ui-value font-semibold">
                            {player.player_name}
                            {player.player_number ? ` · №${player.player_number}` : ""}
                          </p>
                          <p className="ui-note mt-1 text-xs">{formatPlayerPosition(player.position)}</p>
                          <p className="ui-note mt-2 text-xs">{selected ? "Отмечен как сыгравший" : "Нажмите, чтобы отметить"}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" variant="secondary" disabled={savingSection === "played" || selectedPlayedPlayerIds.length !== 16}>
              {savingSection === "played" ? "Сохраняем..." : "Сохранить сыгравших игроков"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="barca-panel border-accent/15">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="meta-label text-xs">Трансферы</p>
            <h3 className="ui-value mt-2 text-xl font-semibold">Сценарии и слухи клуба</h3>
          </div>
          <form onSubmit={saveRumor} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="form-control" placeholder="Игрок" value={rumorForm.player_name} onChange={(e) => setRumorForm((c) => ({ ...c, player_name: e.target.value }))} />
              <input className="form-control" placeholder="Текущее место" value={rumorForm.current_club} onChange={(e) => setRumorForm((c) => ({ ...c, current_club: e.target.value }))} />
              <input className="form-control" placeholder="Клуб назначения" value={rumorForm.target_club} onChange={(e) => setRumorForm((c) => ({ ...c, target_club: e.target.value }))} />
              <input className="form-control" placeholder="Окно" value={rumorForm.window_label} onChange={(e) => setRumorForm((c) => ({ ...c, window_label: e.target.value }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              <select className="form-control" value={rumorForm.direction} onChange={(e) => setRumorForm((c) => ({ ...c, direction: e.target.value as TransferDirection }))}>
                <option value="incoming">На вход</option>
                <option value="outgoing">На выход</option>
                <option value="loan">Аренда</option>
              </select>
              <select className="form-control" value={rumorForm.status} onChange={(e) => setRumorForm((c) => ({ ...c, status: e.target.value as TransferRumor["status"] }))}>
                <option value="active">Открыт</option>
                <option value="resolved">Закрыт</option>
                <option value="archived">Архив</option>
              </select>
              <input className="form-control" placeholder="Вероятность" value={rumorForm.probability_score} onChange={(e) => setRumorForm((c) => ({ ...c, probability_score: e.target.value }))} />
              <input className="form-control" placeholder="Полезность" value={rumorForm.usefulness_score} onChange={(e) => setRumorForm((c) => ({ ...c, usefulness_score: e.target.value }))} />
              <select className="form-control" value={rumorForm.recommendation} onChange={(e) => setRumorForm((c) => ({ ...c, recommendation: e.target.value }))}>
                <option value="true">Стоит</option>
                <option value="false">Не стоит</option>
              </select>
            </div>
            {rumorForm.status === "resolved" ? (
              <select className="form-control" value={rumorForm.resolved_outcome} onChange={(e) => setRumorForm((c) => ({ ...c, resolved_outcome: e.target.value }))}>
                <option value="true">Сделка состоялась</option>
                <option value="false">Сделка сорвалась</option>
              </select>
            ) : null}
            <textarea className="form-control min-h-[100px] resize-none" placeholder="Комментарий" value={rumorForm.notes} onChange={(e) => setRumorForm((c) => ({ ...c, notes: e.target.value }))} />
            <Button className="w-full" variant="secondary" disabled={savingSection === "rumor"}>
              {savingSection === "rumor" ? "Сохраняем..." : rumorForm.id ? "Обновить сценарий" : "Добавить сценарий"}
            </Button>
          </form>
          <div className="space-y-2">
            {rumors.map((rumor) => (
              <button
                key={rumor.id}
                type="button"
                onClick={() => setRumorForm({
                  id: rumor.id,
                  player_name: rumor.player_name,
                  current_club: rumor.current_club,
                  target_club: rumor.target_club,
                  direction: rumor.direction,
                  window_label: rumor.window_label,
                  status: rumor.status,
                  probability_score: String(rumor.probability_score ?? 0),
                  usefulness_score: String(rumor.usefulness_score ?? 0),
                  recommendation: String(rumor.recommendation ?? true),
                  resolved_outcome: String(rumor.resolved_outcome ?? true),
                  notes: rumor.notes ?? "",
                })}
                className="soft-panel flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="ui-value font-semibold">{rumor.player_name}</p>
                  <p className="ui-note mt-1 text-xs">{formatTransferDirection(rumor.direction)} · {formatTransferStatus(rumor.status)}</p>
                </div>
                <span className="ui-note text-xs">Редактировать</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="barca-panel border-accent/15">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="meta-label text-xs">Таблица</p>
            <h3 className="ui-value mt-2 text-xl font-semibold">Строки турнирной таблицы</h3>
          </div>
          <form onSubmit={saveStanding} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="form-control" placeholder="Турнир" value={standingForm.competition} onChange={(e) => setStandingForm((c) => ({ ...c, competition: e.target.value }))} />
              <input className="form-control" placeholder="Сезон" value={standingForm.season_label} onChange={(e) => setStandingForm((c) => ({ ...c, season_label: e.target.value }))} />
              <input className="form-control" placeholder="Команда" value={standingForm.team_name} onChange={(e) => setStandingForm((c) => ({ ...c, team_name: e.target.value }))} />
              <input className="form-control" placeholder="Позиция" value={standingForm.position} onChange={(e) => setStandingForm((c) => ({ ...c, position: e.target.value }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <input className="form-control" placeholder="И" value={standingForm.played} onChange={(e) => setStandingForm((c) => ({ ...c, played: e.target.value }))} />
              <input className="form-control" placeholder="В" value={standingForm.wins} onChange={(e) => setStandingForm((c) => ({ ...c, wins: e.target.value }))} />
              <input className="form-control" placeholder="Н" value={standingForm.draws} onChange={(e) => setStandingForm((c) => ({ ...c, draws: e.target.value }))} />
              <input className="form-control" placeholder="П" value={standingForm.losses} onChange={(e) => setStandingForm((c) => ({ ...c, losses: e.target.value }))} />
              <input className="form-control" placeholder="О" value={standingForm.points} onChange={(e) => setStandingForm((c) => ({ ...c, points: e.target.value }))} />
              <input className="form-control" placeholder="ЗМ" value={standingForm.goals_for} onChange={(e) => setStandingForm((c) => ({ ...c, goals_for: e.target.value }))} />
              <input className="form-control" placeholder="ПМ" value={standingForm.goals_against} onChange={(e) => setStandingForm((c) => ({ ...c, goals_against: e.target.value }))} />
              <input className="form-control" placeholder="РМ" value={standingForm.goal_difference} onChange={(e) => setStandingForm((c) => ({ ...c, goal_difference: e.target.value }))} />
            </div>
            <select className="form-control" value={standingForm.zone} onChange={(e) => setStandingForm((c) => ({ ...c, zone: e.target.value as LeagueStanding["zone"] }))}>
              <option value="ucl">Лига чемпионов</option>
              <option value="uel">Лига Европы</option>
              <option value="uecl">Лига конференций</option>
              <option value="neutral">Обычная зона</option>
              <option value="relegation">Вылет</option>
            </select>
            <Button className="w-full" variant="secondary" disabled={savingSection === "standing"}>
              {savingSection === "standing" ? "Сохраняем..." : standingForm.id ? "Обновить строку" : "Добавить строку"}
            </Button>
          </form>
          <div className="space-y-2">
            {standings.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStandingForm({
                  id: item.id,
                  competition: item.competition,
                  season_label: item.season_label,
                  team_name: item.team_name,
                  position: String(item.position),
                  played: String(item.played),
                  wins: String(item.wins),
                  draws: String(item.draws),
                  losses: String(item.losses),
                  points: String(item.points),
                  goals_for: String(item.goals_for),
                  goals_against: String(item.goals_against),
                  goal_difference: String(item.goal_difference),
                  zone: item.zone,
                })}
                className="soft-panel flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="ui-value font-semibold">{item.position}. {item.team_name}</p>
                  <p className="ui-note mt-1 text-xs">{item.points} очков · {item.competition}</p>
                </div>
                <span className="ui-note text-xs">Редактировать</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="barca-panel border-accent/15">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="meta-label text-xs">Игроки</p>
            <h3 className="ui-value mt-2 text-xl font-semibold">Статистика игроков по сезону</h3>
          </div>
          <form onSubmit={saveSeasonStat} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="form-control"
                value={seasonStatForm.player_id}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const currentStat = seasonStatsByPlayerId.get(nextId);
                  setSeasonStatForm({
                    player_id: nextId,
                    season_label: currentStat ? "2025-26" : "2025-26",
                    goals: String(currentStat?.goals ?? 0),
                    assists: String(currentStat?.assists ?? 0),
                    matches_played: String(currentStat?.matches_played ?? 0),
                    minutes_played: String(currentStat?.minutes_played ?? 0),
                    avatar_url: currentStat?.avatar_url ?? "",
                  });
                }}
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>{player.display_name}</option>
                ))}
              </select>
              <input className="form-control" placeholder="Сезон" value={seasonStatForm.season_label} onChange={(e) => setSeasonStatForm((c) => ({ ...c, season_label: e.target.value }))} />
              <input className="form-control" placeholder="Голы" value={seasonStatForm.goals} onChange={(e) => setSeasonStatForm((c) => ({ ...c, goals: e.target.value }))} />
              <input className="form-control" placeholder="Пасы" value={seasonStatForm.assists} onChange={(e) => setSeasonStatForm((c) => ({ ...c, assists: e.target.value }))} />
              <input className="form-control" placeholder="Матчи" value={seasonStatForm.matches_played} onChange={(e) => setSeasonStatForm((c) => ({ ...c, matches_played: e.target.value }))} />
              <input className="form-control" placeholder="Минуты" value={seasonStatForm.minutes_played} onChange={(e) => setSeasonStatForm((c) => ({ ...c, minutes_played: e.target.value }))} />
            </div>
            <input className="form-control" placeholder="Ссылка на фото игрока" value={seasonStatForm.avatar_url} onChange={(e) => setSeasonStatForm((c) => ({ ...c, avatar_url: e.target.value }))} />
            <Button className="w-full" variant="secondary" disabled={savingSection === "player"}>
              {savingSection === "player" ? "Сохраняем..." : "Сохранить статистику игрока"}
            </Button>
          </form>
          <div className="space-y-2">
            {seasonStats.map((item) => (
              <button
                key={item.player_id}
                type="button"
                onClick={() => setSeasonStatForm({
                  player_id: item.player_id,
                  season_label: "2025-26",
                  goals: String(item.goals),
                  assists: String(item.assists),
                  matches_played: String(item.matches_played),
                  minutes_played: String(item.minutes_played),
                  avatar_url: item.avatar_url ?? "",
                })}
                className="soft-panel flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="ui-value font-semibold">{item.player_name}</p>
                  <p className="ui-note mt-1 text-xs">Голы: {item.goals} · Пасы: {item.assists} · Матчи: {item.matches_played} · Минуты: {item.minutes_played}</p>
                </div>
                <span className="ui-note text-xs">Редактировать</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
