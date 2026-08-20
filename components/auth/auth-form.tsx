"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseEnv } from "@/lib/env";
import { ensureProfileExists } from "@/lib/supabase/ensure-profile";
import { createSupabaseClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { configured } = getSupabaseEnv();

  useEffect(() => {
    const requestedMode = searchParams?.get("mode");
    setMode(requestedMode === "sign-up" ? "sign-up" : "sign-in");
  }, [searchParams]);

  const title = useMemo(
    () => (mode === "sign-in" ? "С возвращением в игру" : "Создайте аккаунт болельщика"),
    [mode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError("Вход пока недоступен. Подключение данных ещё не завершено.");
      return;
    }

    setSubmitting(true);

    if (mode === "sign-up") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || null,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        await ensureProfileExists(supabase);
        setSuccess("Аккаунт создан. Теперь можно делать прогнозы.");
        router.replace("/");
        router.refresh();
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        await ensureProfileExists(supabase);
        router.replace("/");
        router.refresh();
      }
    }

    setSubmitting(false);
  }

  return (
    <Card className="barca-panel mx-auto w-full max-w-md border-accent/15">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Войдите или создайте аккаунт, чтобы сохранять прогнозы и видеть свои результаты.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
          <button
            className={mode === "sign-in" ? "ui-tab ui-tab-active" : "ui-tab ui-tab-idle"}
            onClick={() => setMode("sign-in")}
            type="button"
          >
            Вход
          </button>
          <button
            className={mode === "sign-up" ? "ui-tab ui-tab-active" : "ui-tab ui-tab-idle"}
            onClick={() => setMode("sign-up")}
            type="button"
          >
            Регистрация
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "sign-up" ? (
            <div className="space-y-2">
              <Label htmlFor="displayName">Имя в приложении</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Легенда Кулес"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Почта</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="barca@fan.ru"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 6 символов"
              minLength={6}
              required
            />
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-blue-200">{success}</p> : null}
          {!configured ? (
            <p className="text-sm text-muted-foreground">
              Подключение аккаунтов станет доступно после настройки данных проекта.
            </p>
          ) : null}

          <Button className="w-full" disabled={submitting}>
            {submitting ? "Сохраняем..." : mode === "sign-in" ? "Войти" : "Создать аккаунт"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
