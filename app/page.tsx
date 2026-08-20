import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, UsersRound } from "lucide-react";

import { NextMatchCountdown } from "@/components/home/next-match-countdown";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";
import { HomeStatusCard } from "@/components/home/home-status-card";
import { MatchCard } from "@/components/matches/match-card";
import { ProfileInsightsClient } from "@/components/profile/profile-insights-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import {
  getAllLineupPredictionsForUser,
  getAllMatches,
  getAllPlayerRankingsForUser,
  getAllPredictionsForUser,
  getAnalyticsPlayers,
  getCurrentProfile,
  getCurrentUser,
  getLeaderboard,
  getLaMasiaPlayers,
  getSeasonPlayerStats,
  getTransferRumors,
  getTransferPredictionsForUser,
  getUpcomingMatches,
} from "@/lib/data";
import { getSupabaseEnv } from "@/lib/env";
import { mockLoanPlayers } from "@/lib/mocks/loan-players";
import { formatMatchDate } from "@/lib/format";
import { SectionArtwork, type SectionArtworkId } from "@/components/visuals/section-artwork";

export default async function HomePage() {
  const { configured } = getSupabaseEnv();
  const [profile, user, matches, allMatches, leaderboard, rumors, seasonPlayerStats, academyPlayers, analyticsPlayers] = await Promise.all([
    getCurrentProfile(),
    getCurrentUser(),
    getUpcomingMatches(3),
    getAllMatches(),
    getLeaderboard(5),
    getTransferRumors(),
    getSeasonPlayerStats(),
    getLaMasiaPlayers(),
    getAnalyticsPlayers(),
  ]);
  const [predictions, lineups, transfers, playerRankings] = await Promise.all([
    getAllPredictionsForUser(user?.id),
    getAllLineupPredictionsForUser(user?.id),
    getTransferPredictionsForUser(user?.id),
    getAllPlayerRankingsForUser(user?.id),
  ]);

  return (
    <div className="home-feed">
      <Card className="hero-panel home-hero border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.homeHero, { overlay: "soft", position: "center 54%" })}>
        <CardContent className="hero-content p-5 sm:p-8 lg:p-12">
          <div className="hero-copy">
            <p className="hero-live"><span aria-hidden="true" /> Прогнозы на ближайший матч открыты</p>
            <h2>Твой матч начинается здесь</h2>
            <p className="hero-lede">
              Собирай состав, делай прогнозы и сравнивай футбольное чутьё с сообществом кулес.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={matches[0] ? `/matches/${matches[0].id}` : "/matches"}>
                  Сделать прогноз <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/matches">Все матчи</Link>
              </Button>
            </div>
          </div>

          {matches[0] ? (
            <div className="hero-fixture">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <CalendarDays className="h-4 w-4" />
                {formatMatchDate(matches[0].kickoff_at)}
              </div>
              <p className="mt-4 text-sm text-white/58">{matches[0].competition}</p>
              <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                {matches[0].home_team} <span className="text-white/45">—</span> {matches[0].away_team}
              </p>
              <div className="mt-5 flex gap-5 text-sm text-white/66">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Составы</span>
                <span className="flex items-center gap-2"><UsersRound className="h-4 w-4" /> Сообщество</span>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <NextMatchCountdown matches={allMatches} />

      <HomeStatusCard
        matches={allMatches}
        rumors={rumors}
        hasLiveProfile={Boolean(profile)}
        profileLabel={profile ? `${profile.display_name || profile.email}` : "Гость"}
        profilePoints={profile?.total_points ?? 0}
        backendEnabled={configured}
      />

      <ProfileInsightsClient
        matches={allMatches}
        profile={profile}
        predictions={predictions}
        lineups={lineups}
        transferPredictions={transfers}
        playerRankings={playerRankings}
        seasonPlayerStats={seasonPlayerStats}
        backendEnabled={configured}
        compact
      />

      <section className="space-y-3">
        <h2 className="section-title">Быстрые действия</h2>
        <div className="no-scrollbar overflow-x-auto">
          <div className="flex min-w-max gap-3">
            <QuickAction href="/matches" label="Собрать состав" artwork="matches" />
            <QuickAction href="/challenges" label="Пройти челлендж" artwork="challenges" />
            <QuickAction href="/transfers" label="Оценить трансфер" artwork="transfers" />
            <QuickAction href="/la-masia" label="Следить за талантом" artwork="academy" />
            <QuickAction href="/fantasy" label="Собрать фэнтези" artwork="fantasy" />
            <QuickAction href="/vip" label="Войти в Socio 1899" artwork="vip" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Челлендж дня</h2>
          <Link className="section-link" href="/challenges">
            Все челленджи
          </Link>
        </div>
        <HomeFeatureCard label="Ежедневная серия" title="Новый челлендж уже открыт" text="Заберите ежедневный бонус, ответьте на вопрос или выполните задание ближайшего матча." href="/challenges" cta="Открыть челленджи" artwork="challenges" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Ближайшие матчи</h2>
          <Link className="section-link" href="/matches">
            Все матчи
          </Link>
        </div>
        <div className="space-y-3">
          {matches.length ? matches.map((match) => <MatchCard key={match.id} match={match} />) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Сезон и трансферы</h2>
          <Link className="section-link" href="/table">
            Открыть таблицу
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="soft-panel overflow-hidden" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.homeLeague, { overlay: "medium", position: "center 54%" })}>
            <CardContent className="space-y-2 p-5">
              <p className="meta-label text-xs">Ла Лига</p>
              <p className="ui-value text-xl font-semibold">Гонка за титул и еврокубки</p>
              <p className="ui-note text-sm">Следите за таблицей сезона и положением Барселоны в борьбе за вершину.</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/table">Смотреть таблицу</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="soft-panel overflow-hidden" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.homeTransfers, { overlay: "medium", position: "center 56%" })}>
            <CardContent className="space-y-2 p-5">
              <p className="meta-label text-xs">Окно</p>
              <p className="ui-value text-xl font-semibold">Трансферы на вход и на выход</p>
              <p className="ui-note text-sm">Клубные сценарии и ваши собственные идеи теперь собраны в одном месте.</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/transfers">Открыть трансферы</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Летний центр</h2>
          <Link className="section-link" href="/analytics">
            Открыть аналитику
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <HomeFeatureCard
            label="Трансферное окно"
            title={`${rumors.length} сценариев в трансферном центре`}
            text="Совместимость с Барсой, подход под тренера, риск, решение сообщества и ваши идеи по рынку."
            href="/transfers"
            cta="В трансферный центр"
            artwork="transfers"
          />
          <HomeFeatureCard
            label="Наблюдение за Ла Масией"
            title={`${academyPlayers.length} молодых игроков`}
            text="Главные таланты, Барса Атлетик, U19, кандидаты на сборы и личный список наблюдения."
            href="/la-masia"
            cta="Смотреть таланты"
            artwork="academy"
          />
          <HomeFeatureCard
            label="Аналитика игроков"
            title={`${analyticsPlayers.length} профиля`}
            text="Техника, прессинг, игра под давлением, ментальность и совместимость с тренером."
            href="/analytics"
            cta="Открыть карточки"
            artwork="analytics"
          />
          <HomeFeatureCard
            label="Игроки в аренде"
            title={`${mockLoanPlayers.length} решения`}
            text="Кого вернуть, продать, оставить в аренде или взять на предсезонные сборы."
            href="/transfers"
            cta="Оценить аренды"
            artwork="matches"
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Рейтинг мнений сообщества</h2>
          <Link className="section-link" href="/transfers">
            Все решения
          </Link>
        </div>
        <div className="space-y-3">
          {[...rumors]
            .sort((a, b) => (b.community_votes ?? 0) - (a.community_votes ?? 0))
            .slice(0, 3)
            .map((rumor, index) => (
              <Card key={rumor.id} className="soft-panel">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="meta-label text-xs">#{index + 1} · {rumor.community_votes ?? 0} голосов</p>
                    <p className="ui-value mt-2 text-lg font-semibold">{rumor.player_name}</p>
                    <p className="ui-note mt-1 text-sm">{rumor.short_reason ?? rumor.notes}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="ui-value text-xl font-semibold">{rumor.barca_fit_score ?? "—"}</p>
                    <p className="meta-label text-xs">Fit</p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Рейтинг болельщиков</h2>
          <Link className="section-link" href="/leaderboards">
            Весь рейтинг
          </Link>
        </div>
        <LeaderboardClient
          entries={leaderboard}
          matches={allMatches}
          rumors={rumors}
          compact
          currentUserId={profile?.id}
          backendEnabled={configured}
        />
      </section>
    </div>
  );
}

function QuickAction({ href, label, artwork }: { href: string; label: string; artwork: SectionArtworkId }) {
  return (
    <Link href={href} className="quick-action">
      <SectionArtwork id={artwork} className="h-11 w-11 shrink-0 rounded-xl" />
      <span>{label}</span>
      <ArrowRight className="ml-auto h-4 w-4" />
    </Link>
  );
}

function HomeFeatureCard({
  label,
  title,
  text,
  href,
  cta,
  artwork,
}: {
  label: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  artwork?: SectionArtworkId;
}) {
  return (
    <Card className="soft-panel">
      <CardContent className="space-y-3 p-5">
        {artwork ? <SectionArtwork id={artwork} className="mb-4 aspect-[16/7] w-full rounded-2xl" /> : null}
        <p className="meta-label text-xs">{label}</p>
        <p className="ui-value text-xl font-semibold">{title}</p>
        <p className="ui-note text-sm">{text}</p>
        <Button asChild variant="secondary" size="sm">
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
