import { LaMasiaHubClient } from "@/components/la-masia/la-masia-hub-client";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { getLaMasiaPlayers } from "@/lib/data";

export default async function LaMasiaPage() {
  const players = await getLaMasiaPlayers();

  return (
    <div className="space-y-6">
      <Card className="hero-panel border-0" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.playersHero, { position: "center 42%" })}>
        <CardContent className="p-5 sm:p-7">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl">Следующее поколение Барсы</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/78 sm:text-base">
            Девять главных талантов академии: кто уже готов к первой команде, кого брать на сборы и за кем следить весь сезон.
          </p>
        </CardContent>
      </Card>

      <LaMasiaHubClient players={players} />
    </div>
  );
}
