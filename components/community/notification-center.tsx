"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { loadNotifications, readNotification } from "@/lib/community/notifications-live";
import type { NotificationRecord } from "@/types/database";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const unread = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  useEffect(() => {
    void loadNotifications().then(setNotifications);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative grid h-[44px] w-[44px] place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-blue-100/80 transition-colors hover:text-[#f1d1db]"
        aria-label="Уведомления"
      >
        <Bell className="h-4 w-4" />
        {unread ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#d23b6d] shadow-glow" /> : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-[#07112c]/95 p-3 shadow-card backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <p className="ui-value text-sm font-semibold">Уведомления</p>
            <Badge variant="accent">{unread} новых</Badge>
          </div>
          <div className="space-y-2">
            {notifications.length ? notifications.slice(0, 4).map((notification) => (
              <Link
                key={notification.id}
                href={notification.link}
                onClick={() => {
                  void readNotification(notification.id).then(setNotifications);
                  setOpen(false);
                }}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <p className="meta-label text-[10px]">{notification.createdAt}</p>
                <p className="ui-value mt-1 text-sm font-semibold">{notification.title}</p>
                <p className="ui-note mt-1 text-xs">{notification.description}</p>
              </Link>
            )) : <p className="ui-note rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs">Новых уведомлений нет.</p>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
