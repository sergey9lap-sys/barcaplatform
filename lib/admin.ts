import { isAdminEmail } from "@/lib/env";

export function canAccessAdmin(email?: string | null, profileIsAdmin = false) {
  return profileIsAdmin || isAdminEmail(email);
}
