import { LaMasiaHubClient } from "@/components/la-masia/la-masia-hub-client";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { mockLaMasiaPlayers } from "@/lib/mocks/la-masia";

export default function LaMasiaPage() {
  return (
    <div className="space-y-6">
      <Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.playersHero, { position: "center 42%" })}>
        <CardContent className="p-5">
          <p className="meta-label text-xs">Центр Ла Масии</p>
          <h2 className="mt-2 text-2xl font-semibold">Таланты, кандидаты на сборы и личный watchlist</h2>
          <p className="mt-2 text-sm text-blue-100/75">
            Следите за молодыми игроками по потенциалу, шансу первой команды, подходу под тренера и совместимости с Барсой.
          </p>
        </CardContent>
      </Card>

      <LaMasiaHubClient players={mockLaMasiaPlayers} />
    </div>
  );
}
