"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseClient() {
  const { url, anonKey, configured } = getSupabaseEnv();

  // TODO: After you add the real env vars in `.env.local`,
  // this will create the live Supabase browser client automatically.
  if (!configured || !url || !anonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}
