import { StandingsBoard } from "@/components/table/standings-board";
import { getLeagueStandings } from "@/lib/data";

export default async function TablePage() {
  const standings = await getLeagueStandings("Ла Лига", "2026-27");

  return <StandingsBoard standings={standings} seasonLabel="2026-27" competition="Ла Лига" />;
}
