import { cookies } from "next/headers";
import { parseSessionCookie } from "@/lib/session";
import { getEmployeeDashboard, resolveUserId } from "@/lib/data/queries";
import { TrainingsClient } from "./trainings-client";

export default async function TrainingsPage() {
  const cookieStore = await cookies();
  const session = parseSessionCookie(
    cookieStore.get("upskill-session")?.value
  );
  const userId = session ? await resolveUserId(session) : null;
  const data = userId ? await getEmployeeDashboard(userId) : null;
  const initialTrainings = data?.trainings ?? [];

  return <TrainingsClient initialTrainings={initialTrainings} />;
}
