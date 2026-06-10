import { cookies } from "next/headers";
import { parseSessionCookie } from "@/lib/session";
import { resolveUserId } from "@/lib/data/queries";

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = parseSessionCookie(
    cookieStore.get("upskill-session")?.value
  );
  if (!session) return null;
  return resolveUserId(session);
}
