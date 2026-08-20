"use client";

import { mockNotifications } from "@/lib/mocks/community";
import type { NotificationRecord } from "@/types/database";

const NOTIFICATIONS_KEY = "barca-notifications";
export const NOTIFICATIONS_UPDATED_EVENT = "barca-notifications-updated";

function emitNotificationsUpdated(notifications: NotificationRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: notifications }));
}

export function getStoredNotifications() {
  if (typeof window === "undefined") {
    return mockNotifications;
  }

  const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
  return raw ? (JSON.parse(raw) as NotificationRecord[]) : mockNotifications;
}

export function saveStoredNotifications(notifications: NotificationRecord[]) {
  if (typeof window === "undefined") {
    return notifications;
  }

  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  emitNotificationsUpdated(notifications);
  return notifications;
}

export function markNotificationRead(id: string) {
  const next = getStoredNotifications().map((notification) =>
    notification.id === id ? { ...notification, isRead: true } : notification,
  );
  return saveStoredNotifications(next);
}

export function markAllNotificationsRead() {
  return saveStoredNotifications(getStoredNotifications().map((notification) => ({ ...notification, isRead: true })));
}

export function pushStoredNotification(notification: NotificationRecord) {
  return saveStoredNotifications([notification, ...getStoredNotifications()]);
}
