export async function ensureProfileExists(supabase: {
  auth: { getUser: () => Promise<{ data: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null } | null } }> };
  from: (table: string) => any;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: null };
  }

  const displayName =
    typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()
      ? user.user_metadata.display_name
      : (user.email?.split("@")[0] ?? null);

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        display_name: displayName,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  return { user, error };
}
