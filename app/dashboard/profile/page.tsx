import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Trophy,
  Flame,
  Star,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { cookies } from "next/headers";
import { parseSessionCookie } from "@/lib/session";
import { getEmployeeProfile, resolveUserId } from "@/lib/data/queries";

const statusLabel: Record<string, { label: string; color: string }> = {
  COMPLETED: {
    label: "Completado",
    color: "bg-success/15 text-success border-success/30",
  },
  IN_PROGRESS: {
    label: "En Curso",
    color: "bg-warning/15 text-warning border-warning/30",
  },
  NOT_STARTED: {
    label: "Pendiente",
    color: "bg-muted text-muted-foreground border-border",
  },
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = parseSessionCookie(
    cookieStore.get("upskill-session")?.value
  );
  const userId = session ? await resolveUserId(session) : null;
  const profile = userId ? await getEmployeeProfile(userId) : null;

  if (!profile) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No se pudo cargar el perfil.
      </div>
    );
  }

  const { user, activity } = profile;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const pct =
    user.totalTrainings > 0
      ? Math.round((user.completedTrainings / user.totalTrainings) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y preferencias.
          </p>
        </div>
        <Button>Editar Perfil</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2 text-center">
            <Avatar className="mx-auto mb-4 h-24 w-24 border-2 border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">{user.email}</div>
            <Badge className="mt-3 border-0 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">
              {user.role}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-0 pt-4">
            {[
              { label: "Departamento", value: user.department },
              { label: "Posición", value: user.position },
              { label: "Ingreso", value: user.joinedAt },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5 md:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                icon: BookOpen,
                label: "Completadas",
                value: `${user.completedTrainings} / ${user.totalTrainings}`,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: Trophy,
                label: "Puntos",
                value: user.points.toLocaleString(),
                color: "text-warning",
                bg: "bg-warning/10",
              },
              {
                icon: Flame,
                label: "Racha",
                value: `${user.streak} días`,
                color: "text-orange-500",
                bg: "bg-orange-500/10",
              },
              {
                icon: TrendingUp,
                label: "Ranking",
                value: `#${user.rank}`,
                color: "text-success",
                bg: "bg-success/10",
              },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.bg}`}
                  >
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4 text-warning" /> Progreso general
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {user.completedTrainings} de {user.totalTrainings} capacitaciones
                  completadas
                </span>
                <span className="font-semibold text-foreground">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2.5" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" /> Historial de capacitaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
              ) : (
                activity.map((item) => {
                  const s = statusLabel[item.status];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 ${item.status === "COMPLETED" ? "text-success" : "text-muted-foreground"}`}
                        />
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.training}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {item.points > 0 && (
                          <span className="text-xs font-semibold text-warning">
                            +{item.points} pts
                          </span>
                        )}
                        <Badge variant="outline" className={`text-xs ${s.color}`}>
                          {s.label}
                        </Badge>
                        <span className="hidden text-xs text-muted-foreground sm:block">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
