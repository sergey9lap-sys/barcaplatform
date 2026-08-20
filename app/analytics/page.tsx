import { AnalyticsHubClient } from "@/components/analytics/analytics-hub-client";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { mockAnalyticsPlayers } from "@/lib/mocks/analytics";
import { isPremiumFeatureOpen } from "@/lib/premium/features";

export default function AnalyticsPage() {
  const analyticsOpen = isPremiumFeatureOpen("advancedAnalytics");

  return (
    <div className="space-y-6">
      <Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.homeLeague, { position: "center 45%" })}>
        <CardContent className="p-5">
          <p className="meta-label text-xs">Аналитика</p>
          <h2 className="mt-2 text-2xl font-semibold">Совместимость с Барсой, подход под тренера и детальные профили игроков</h2>
          <p className="mt-2 text-sm text-blue-100/75">
            Игроки первой команды, трансферные цели, аренды и Ла Масия в одном компактном скаутском разделе.
          </p>
        </CardContent>
      </Card>

      {analyticsOpen ? <AnalyticsHubClient players={mockAnalyticsPlayers} /> : null}
    </div>
  );
}
