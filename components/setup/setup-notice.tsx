import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <Card className="barca-panel border-primary/20">
      <CardHeader>
        <CardTitle>База данных пока не подключена</CardTitle>
        <CardDescription>
          На этом этапе это нормально. Добавьте `NEXT_PUBLIC_SUPABASE_URL`,
          `NEXT_PUBLIC_SUPABASE_ANON_KEY` и выполните SQL-файлы из `supabase/`.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-100/75">
          Сейчас список матчей и основные прогнозы могут работать на встроенных тестовых данных. После подключения базы
          этот блок станет просто напоминанием, а данные переключатся на живой источник.
        </p>
        <p className="mt-3 text-sm text-blue-100/75">
          Подсказка: пошаговая настройка описана в `docs/setup/DEV_HANDOFF.md`.
        </p>
      </CardContent>
    </Card>
  );
}
