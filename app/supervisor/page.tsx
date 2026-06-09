import { StatCard } from "@/components/stat-card"
import { TeamMemberCard } from "@/components/team-member-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Target, TrendingUp, AlertTriangle, Download, Search } from "lucide-react"

// Mock data for Supervisor View
const mockTeamStats = {
  totalMembers: 12,
  avgCompletion: 72,
  topPerformer: "Ana García",
  atRisk: 2,
}

const mockTeamMembers = [
  {
    id: "1",
    name: "Ana García",
    position: "Analista Senior",
    department: "Finanzas",
    completedTrainings: 10,
    totalTrainings: 10,
    points: 3200,
  },
  {
    id: "2",
    name: "Carlos Mendoza",
    position: "Analista",
    department: "Finanzas",
    completedTrainings: 8,
    totalTrainings: 12,
    points: 2450,
  },
  {
    id: "3",
    name: "Laura Sánchez",
    position: "Coordinadora",
    department: "Operaciones",
    completedTrainings: 9,
    totalTrainings: 11,
    points: 2650,
  },
  {
    id: "4",
    name: "Miguel Torres",
    position: "Analista",
    department: "Finanzas",
    completedTrainings: 7,
    totalTrainings: 10,
    points: 2890,
  },
  {
    id: "5",
    name: "Patricia López",
    position: "Asistente",
    department: "Administración",
    completedTrainings: 3,
    totalTrainings: 8,
    points: 980,
  },
  {
    id: "6",
    name: "José Ramírez",
    position: "Técnico",
    department: "Operaciones",
    completedTrainings: 4,
    totalTrainings: 9,
    points: 1200,
  },
]

const departments = ["Todos", "Finanzas", "Operaciones", "Administración"]
const positions = ["Todas", "Analista", "Coordinador", "Asistente", "Técnico", "Gerente"]

export default function SupervisorPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Miembros del Equipo"
          value={mockTeamStats.totalMembers}
          icon={Users}
          accentColor="primary"
        />
        <StatCard
          title="Completado Promedio"
          value={`${mockTeamStats.avgCompletion}%`}
          description="del equipo"
          icon={Target}
          accentColor="success"
        />
        <StatCard
          title="Mejor Desempeño"
          value={mockTeamStats.topPerformer}
          description="este mes"
          icon={TrendingUp}
          accentColor="warning"
        />
        <StatCard
          title="Requieren Atención"
          value={mockTeamStats.atRisk}
          description="empleados con bajo progreso"
          icon={AlertTriangle}
          accentColor="pending"
        />
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
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

      {/* Team Members Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Empleados ({mockTeamMembers.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockTeamMembers.map((member) => (
            <TeamMemberCard key={member.id} {...member} />
          ))}
        </div>
      </div>
    </div>
  )
}
