import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { AppMotion } from "@/components/motion/app-motion";
import type { Profile } from "@/types/database";

interface AppShellProps {
  children: ReactNode;
  profile: Profile | null;
  isAdmin?: boolean;
}

export function AppShell({ children, profile, isAdmin = false }: AppShellProps) {
  return (
    <>
      <main className="page-shell">
        <Header profile={profile} isAdmin={isAdmin} />
        <AppMotion>{children}</AppMotion>
      </main>
      <BottomNav />
    </>
  );
}
