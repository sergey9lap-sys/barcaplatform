import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_BACKGROUNDS, createPhotoPanelStyle } from "@/lib/backgrounds";
import { getCurrentProfile } from "@/lib/data";

export default async function AuthPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      <Card
        className="barca-panel border-accent/15 overflow-hidden"
        style={createPhotoPanelStyle(SECTION_BACKGROUNDS.authHero, { position: "center 66%" })}
      >
        <CardContent className="p-5">
          <p className="meta-label text-xs">Авторизация</p>
          <h2 className="mt-2 text-2xl font-semibold">Войдите в свой аккаунт</h2>
          <p className="mt-2 text-sm text-blue-100/75">
            Зарегистрируйтесь, войдите и возвращайтесь к своим прогнозам в любой момент.
          </p>
          {profile ? (
            <p className="mt-3 text-sm text-blue-200">Вы вошли как {profile.display_name || profile.email}.</p>
          ) : null}
        </CardContent>
      </Card>
      <AuthForm />
    </div>
  );
}
