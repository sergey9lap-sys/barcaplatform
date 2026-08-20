const DEFAULT_ADMIN_EMAILS = ["9_lap_9@mail.ru"];

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  return {
    url,
    anonKey,
    // Safe fallback for the current stage:
    // if env vars are missing, UI still renders and live Supabase calls stay disabled.
    configured: Boolean(url && anonKey),
  };
}

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const configuredEmails = raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...configuredEmails]));
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.toLowerCase());
}
