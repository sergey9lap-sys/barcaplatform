"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Ellipsis, Home, Trophy, UsersRound } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { SectionArtwork, type SectionArtworkId } from "@/components/visuals/section-artwork";

const PRIMARY_ITEMS = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/matches", label: "Матчи", icon: Trophy },
  { href: "/transfers", label: "Трансферы", icon: UsersRound },
];

const MORE_ITEMS = [
  { href: "/challenges", label: "Челленджи", artwork: "challenges" },
  { href: "/analytics", label: "Аналитика", artwork: "analytics" },
  { href: "/la-masia", label: "Ла Масия", artwork: "academy" },
  { href: "/leaderboards", label: "Рейтинги", artwork: "community" },
  { href: "/fantasy", label: "Фэнтези", artwork: "fantasy" },
  { href: "/membership", label: "Подписка", artwork: "shop" },
  { href: "/vip", label: "Socio 1899", artwork: "vip" },
  { href: "/shop", label: "Digital Store", artwork: "shop" },
  { href: "/profile", label: "Профиль", artwork: "community" },
] satisfies { href: string; label: string; artwork: SectionArtworkId }[];

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const moreActive = MORE_ITEMS.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <>
      {open ? (
        <div className="fixed inset-x-0 bottom-[5.8rem] z-40 mx-auto w-full max-w-md px-4 sm:max-w-3xl lg:max-w-2xl">
          <div className="nav-more-panel">
            <div className="grid grid-cols-2 gap-2">
              {MORE_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-2xl px-2.5 py-2 text-sm font-medium transition-colors",
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-gradient-to-r from-[#13377e] to-[#86183c] text-[#f1d1db] shadow-glow"
                      : "bg-white/[0.04] text-blue-100/70",
                  )}
                >
                  <SectionArtwork id={item.artwork} className="h-10 w-10 shrink-0 rounded-xl" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link href="/notifications" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-3 text-sm text-blue-100/70">
                <Bell className="h-4 w-4" />
                Уведомления
              </Link>
            </div>
          </div>
        </div>
      ) : null}
      <nav className="bottom-nav" aria-label="Основная навигация">
        <div className="grid grid-cols-4 gap-1">
          {PRIMARY_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-item",
                  active ? "nav-item-active" : "nav-item-idle",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={cn(
              "nav-item",
              moreActive || open ? "nav-item-active" : "nav-item-idle",
            )}
          >
            <Ellipsis className="h-[18px] w-[18px]" />
            Ещё
          </button>
        </div>
      </nav>
    </>
  );
}
