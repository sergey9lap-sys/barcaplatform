"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getStoredNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_UPDATED_EVENT,
} from "@/lib/community/notifications-storage";
import type { NotificationRecord } from "@/types/database";

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const unread = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  useEffect(() => {
    setNotifications(getStoredNotifications());

    function handleNotificationsUpdated(event: Event) {
      setNotifications((event as CustomEvent<NotificationRecord[]>).detail ?? getStoredNotifications());
    }

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
  }, []);

  return (
    <Card className="barca-panel border-accent/15">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="meta-label text-xs">Центр уведомлений</p>
            <h2 className="mt-2 text-2xl font-semibold">Что произошло в твоей фанатской активности</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">{unread} новых</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNotifications(markAllNotificationsRead())}
              disabled={!unread}
            >
              Прочитать всё
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link}
              onClick={() => setNotifications(markNotificationRead(notification.id))}
              className={notification.isRead ? "block rounded-2xl border border-white/10 bg-white/[0.03] p-4 opacity-70" : "block rounded-2xl border border-accent/25 bg-accent/10 p-4 shadow-glow"}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="meta-label text-xs">{notification.createdAt}</p>
                  <p className="ui-value mt-2 text-lg font-semibold">{notification.title}</p>
                  <p className="ui-note mt-1 text-sm">{notification.description}</p>
                </div>
                {!notification.isRead ? <Badge variant="primary">новое</Badge> : null}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
