import { StatCard } from "@/components/stat-card";
import { TeamMemberCard } from "@/components/team-member-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  Download,
  Search,
} from "lucide-react";
import { cookies } from "next/headers";
import { parseSessionCookie } from "@/lib/session";
import { getSupervisorTeam, resolveUserId } from "@/lib/data/queries";

const departments = ["Todos", "Finanzas", "Operaciones", "Administración", "RRHH", "Ventas", "TI"];
const positions = ["Todas", "Analista", "Coordinador", "Asistente", "Técnico", "Gerente"];

export default async function SupervisorPage() {
  const cookieStore = await cookies();
  const session = parseSessionCookie(
    cookieStore.get("upskill-session")?.value
  );
  const userId = session ? await resolveUserId(session) : null;
  const team = userId ? await getSupervisorTeam(userId) : null;

  if (!team) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No se pudo cargar el equipo. Comprueba Supabase y que tu usuario sea
        supervisor con empleados asignados.
      </div>
    );
  }

  const { stats, members } = team;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mi Equipo
          </h1>
          <p className="text-muted-foreground">
            Monitorea el progreso de capacitación de tu equipo.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Miembros del Equipo"
          value={stats.totalMembers}
          icon={Users}
          accentColor="primary"
        />
        <StatCard
          title="Completado Promedio"
          value={`${stats.avgCompletion}%`}
          description="del equipo"
          icon={Target}
          accentColor="success"
        />
        <StatCard
          title="Mejor Desempeño"
          value={stats.topPerformer}
          description="por puntos"
          icon={TrendingUp}
          accentColor="warning"
        />
        <StatCard
          title="Requieren Atención"
          value={stats.atRisk}
          description="progreso bajo 50%"
          icon={AlertTriangle}
          accentColor="pending"
        />
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar empleado..."
                className="bg-secondary pl-9"
              />
            </div>
            <Select defaultValue="Todos">
              <SelectTrigger className="w-[180px] bg-secondary">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="Todas">
              <SelectTrigger className="w-[180px] bg-secondary">
                <SelectValue placeholder="Posición" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Empleados ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay empleados con tu usuario como supervisor en la base de datos.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <TeamMemberCard key={member.id} {...member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
