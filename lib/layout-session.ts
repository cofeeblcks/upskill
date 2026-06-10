import { cookies } from "next/headers";
import { parseSessionCookie, type SessionPayload } from "@/lib/session";
import { getTopbarUser, resolveUserId } from "@/lib/data/queries";

export type LayoutSession = {
  session: SessionPayload;
  userId: string;
  topbarUser: {
    name: string;
    email: string;
    points: number;
    avatar?: string;
  };
};

export async function getLayoutSession(): Promise<LayoutSession | null> {
  const cookieStore = await cookies();
  const session = parseSessionCookie(
    cookieStore.get("upskill-session")?.value
  );
  if (!session?.email) return null;
  const userId = await resolveUserId(session);
  if (!userId) return null;
  const topbarUser = await getTopbarUser(userId);
  if (!topbarUser) {
    return {
      session,
      userId,
      topbarUser: {
        name: session.name,
        email: session.email,
        points: 0,
      },
    };
  }
  return { session, userId, topbarUser };
}
