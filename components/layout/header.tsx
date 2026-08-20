import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { NotificationCenter } from "@/components/community/notification-center";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BARCA_BADGE_PATH } from "@/lib/assets";
import { CLUB_NAME } from "@/lib/constants";
import type { Profile } from "@/types/database";

interface HeaderProps {
  profile: Profile | null;
  isAdmin?: boolean;
}

export function Header({ profile, isAdmin = false }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="flex min-w-0 items-center gap-3">
        {BARCA_BADGE_PATH ? (
          <div
            className="club-avatar h-14 w-14 shrink-0 rounded-2xl bg-contain bg-center bg-no-repeat sm:h-12 sm:w-12"
            style={{ backgroundImage: `url(${BARCA_BADGE_PATH})` }}
            aria-hidden="true"
          />
        ) : null}
        <div className="min-w-0">
          <p className="brand-kicker">BARÇA HUB</p>
          <h1 className="brand-title">{CLUB_NAME}</h1>
        </div>
      </div>

      {profile ? (
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <NotificationCenter />
          {isAdmin ? (
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin">Админка</Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="ghost">
            <Link href="/profile"><UserRound className="mr-2 h-4 w-4" />Профиль</Link>
          </Button>
          <Badge variant="primary">{profile.total_points} очков</Badge>
          <SignOutButton />
        </div>
      ) : (
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <NotificationCenter />
          <Button asChild size="sm" variant="ghost">
            <Link href="/auth"><LogIn className="mr-2 h-4 w-4" />Войти</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth?mode=sign-up">Регистрация</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
