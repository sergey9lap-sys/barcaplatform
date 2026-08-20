"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseClient();
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth");
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      Выйти
    </Button>
  );
}
