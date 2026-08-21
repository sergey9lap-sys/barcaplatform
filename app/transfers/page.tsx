import { TransferHubClient } from "@/components/transfers/transfer-hub-client";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { getCurrentUser, getTransferIdeas, getTransferPredictionsForUser, getTransferRumors } from "@/lib/data";
import { getSupabaseEnv } from "@/lib/env";
import { mockLoanPlayers } from "@/lib/mocks/loan-players";

export default async function TransfersPage() {
  const { configured } = getSupabaseEnv();
  const [user, rumors, ideas] = await Promise.all([getCurrentUser(), getTransferRumors(), getTransferIdeas()]);
  const predictions = await getTransferPredictionsForUser(user?.id);

  return (
    <div className="space-y-4">
      <Card className="hero-panel" style={createPhotoPanelStyle(SECTION_BACKGROUNDS.transfersHero, { position: "center 23%" })}>
        <CardContent className="p-4">
          <p className="meta-label text-xs">Трансферы</p>
          <h2 className="mt-1.5 text-xl font-semibold sm:text-2xl">Transfer Hub 2.0: окно, аренды и решения сообщества</h2>
          <p className="mt-2 text-sm text-blue-100/75">
            Оценивайте входящие и исходящие сценарии через Barca Fit, Coach System Fit, риск, цену и голос сообщества.
          </p>
        </CardContent>
      </Card>

      <TransferHubClient
        rumors={rumors}
        ideas={ideas}
        loans={mockLoanPlayers}
        predictions={predictions}
        userId={user?.id}
        backendEnabled={configured}
      />

      {!rumors.length && !ideas.length ? (
        <Card className="bg-white/[0.03]">
          <CardContent className="p-5 text-sm text-muted-foreground">
            Пока нет ни клубных сценариев, ни пользовательских трансферных идей.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
