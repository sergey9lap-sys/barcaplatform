"use client";

import { createSupabaseClient } from "@/lib/supabase/client";
import { getStoredNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/community/notifications-storage";
import type { NotificationRecord } from "@/types/database";

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "только что";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(value));
}

export async function loadNotifications(): Promise<NotificationRecord[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return getStoredNotifications();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("user_notifications").select("id,type,title,description,link,is_read,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
  if (error || !data) return [];
  return data.map((item) => ({ id: item.id, type: item.type as NotificationRecord["type"], title: item.title, description: item.description, link: item.link, isRead: item.is_read, createdAt: relativeTime(item.created_at) }));
}

export async function readNotification(id: string) {
  const supabase = createSupabaseClient();
  if (!supabase) return markNotificationRead(id);
  await supabase.from("user_notifications").update({ is_read: true }).eq("id", id);
  return loadNotifications();
}

export async function readAllNotifications() {
  const supabase = createSupabaseClient();
  if (!supabase) return markAllNotificationsRead();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await supabase.from("user_notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
  return loadNotifications();
}
