import { BadgeGrid } from "@/components/badge-grid";
import { Leaderboard } from "@/components/leaderboard";
import { ProgressDonut } from "@/components/progress-donut";
import { StatCard } from "@/components/stat-card";
import { TrainingCard } from "@/components/training-card";
import { cookies } from "next/headers";
import { parseSessionCookie } from "@/lib/session";
import { getEmployeeDashboard, resolveUserId } from "@/lib/data/queries";
import { BookOpen, Trophy, Flame, Target } from "lucide-react";

export default async function EmployeeDashboard() {
  const cookieStore = await cookies();
  const session = parseSessionCookie(
    cookieStore.get("upskill-session")?.value
  );
  const userId = session ? await resolveUserId(session) : null;
  const data = userId ? await getEmployeeDashboard(userId) : null;

  if (!data) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No se pudieron cargar los datos. Comprueba que Supabase esté configurado
        (.env.local) y que las migraciones estén aplicadas.
      </div>
    );
  }

  const { user, trainings, badges, leaderboard } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bienvenido, {user.name}
        </h1>
        <p className="text-muted-foreground">
          Continúa tu progreso y alcanza tus metas de capacitación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Capacitaciones Completadas"
          value={user.completedTrainings}
          description={`de ${user.totalTrainings} asignadas`}
          icon={BookOpen}
          accentColor="success"
        />
        <StatCard
          title="Puntos Totales"
          value={user.points}
          icon={Trophy}
          trend={{ value: 15, isPositive: true }}
          accentColor="primary"
        />
        <StatCard
          title="Racha Actual"
          value={`${user.streak} días`}
          description="Según capacitaciones completadas"
          icon={Flame}
          accentColor="warning"
        />
        <StatCard
          title="Ranking Mensual"
          value={`#${user.rank}`}
          description="Entre empleados"
          icon={Target}
          accentColor="pending"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Mis Capacitaciones
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trainings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no tienes capacitaciones asignadas.
                </p>
              ) : (
                trainings.map((training) => (
                  <TrainingCard key={training.id} {...training} />
                ))
              )}
            </div>
          </div>

          <BadgeGrid badges={badges} title="Mis Logros" />
        </div>

        <div className="space-y-6">
          <ProgressDonut
            completed={user.completedTrainings}
            total={Math.max(user.totalTrainings, 1)}
            progressPercent={user.overallProgressPercent}
          />
          <Leaderboard users={leaderboard} title="Top 5 del Mes" />
        </div>
      </div>
    </div>
  );
}
