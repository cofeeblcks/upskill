import { StatCard } from "@/components/stat-card";
import { TrainingTable } from "@/components/training-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Trophy,
  TrendingUp,
  Plus,
  Download,
} from "lucide-react";
import Link from "next/link";
import { getAdminOverview } from "@/lib/data/queries";

export default async function AdminDashboard() {
  const overview = await getAdminOverview();

  if (!overview) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No se pudieron cargar los datos de administración. Revisa Supabase y
        las variables en .env.local.
      </div>
    );
  }

  const { stats, trainings, recentActivity } = overview;
  const tableSlice = trainings.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Gestiona las capacitaciones y monitorea el progreso de tu equipo.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Link href="/admin/trainings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Capacitación
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Capacitaciones"
          value={stats.totalTrainings}
          description={`${stats.activeTrainings} activas · ${stats.totalAssignments} asignaciones`}
          icon={BookOpen}
          accentColor="primary"
        />
        <StatCard
          title="Empleados activos"
          value={stats.activeEmployees}
          description="rol empleado, cuenta activa"
          icon={Users}
          accentColor="success"
        />
        <StatCard
          title="Tasa de completado"
          value={`${stats.completionRate}%`}
          description="sobre todas las asignaciones"
          icon={Trophy}
          accentColor="warning"
        />
        <StatCard
          title="Puntuación media"
          value={`${stats.avgScore}%`}
          description="media de calificaciones registradas"
          icon={TrendingUp}
          accentColor="pending"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Capacitaciones
            </h2>
            <Link
              href="/admin/trainings"
              className="text-sm text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <TrainingTable trainings={tableSlice} />
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin registros en auditoría todavía.
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-bold text-primary">
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}{" "}
                      <span className="text-primary">{activity.training}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
