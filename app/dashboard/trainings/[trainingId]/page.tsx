import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { parseSessionCookie } from "@/lib/session";
import {
  getEmployeeTrainingDetail,
  resolveUserId,
} from "@/lib/data/queries";
import { TrainingPlayerClient } from "./training-player-client";

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ trainingId: string }>;
}) {
  const { trainingId } = await params;
  const cookieStore = await cookies();
  const session = parseSessionCookie(
    cookieStore.get("upskill-session")?.value
  );
  const userId = session ? await resolveUserId(session) : null;

  if (!userId) {
    notFound();
  }

  const detail = await getEmployeeTrainingDetail(userId, trainingId);

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-medium text-foreground">
          Capacitación no encontrada
        </p>
        <p className="text-sm text-muted-foreground">
          No tienes esta capacitación asignada o ya no está disponible.
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/dashboard/trainings">Volver a Mis Capacitaciones</Link>
        </Button>
      </div>
    );
  }

  return <TrainingPlayerClient {...detail} />;
}
