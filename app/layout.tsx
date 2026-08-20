import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { canAccessAdmin } from "@/lib/admin";
import { getCurrentProfile, getCurrentUser } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: "Платформа болельщиков Барсы",
  description: "Мобильное приложение с прогнозами для футбольных болельщиков.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);
  const isAdmin = canAccessAdmin(user?.email, profile?.is_admin ?? false);

  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <AppShell profile={profile} isAdmin={isAdmin}>{children}</AppShell>
      </body>
    </html>
  );
}
