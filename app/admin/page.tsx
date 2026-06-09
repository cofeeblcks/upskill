import { StatCard } from "@/components/stat-card"
import { TrainingTable } from "@/components/training-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Users,
  Trophy,
  TrendingUp,
  Plus,
  Download,
} from "lucide-react"
import Link from "next/link"

// Mock data for Admin HR Dashboard
const mockStats = {
  totalTrainings: 24,
  activeEmployees: 156,
  completionRate: 78,
  avgScore: 85,
}

const mockTrainings = [
  {
    id: "1",
    title: "Seguridad en el Trabajo: Protocolos y Mejores Prácticas",
    category: "Seguridad",
    durationMin: 45,
    requiredRoles: ["EMPLOYEE", "SUPERVISOR"],
    assignedCount: 120,
    completedCount: 95,
    isActive: true,
    createdAt: "2024-12-01",
  },
  {
    id: "2",
    title: "Liderazgo Efectivo para Supervisores",
    category: "Liderazgo",
    durationMin: 60,
    requiredRoles: ["SUPERVISOR"],
    assignedCount: 25,
    completedCount: 18,
    isActive: true,
    createdAt: "2024-12-05",
  },
  {
    id: "3",
    title: "Cumplimiento Normativo y Ética Empresarial",
    category: "Cumplimiento",
    durationMin: 30,
    requiredRoles: ["EMPLOYEE", "SUPERVISOR", "ADMIN_HR"],
    assignedCount: 156,
    completedCount: 142,
    isActive: true,
    createdAt: "2024-11-15",
  },
  {
    id: "4",
    title: "Introducción a Herramientas Digitales",
    category: "Técnico",
    durationMin: 40,
    requiredRoles: ["EMPLOYEE"],
    assignedCount: 80,
    completedCount: 45,
    isActive: true,
    createdAt: "2024-12-10",
  },
  {
    id: "5",
    title: "Comunicación Efectiva en el Equipo",
    category: "Habilidades Blandas",
    durationMin: 35,
    requiredRoles: ["EMPLOYEE", "SUPERVISOR"],
    assignedCount: 100,
    completedCount: 67,
    isActive: false,
    createdAt: "2024-10-20",
  },
]

const mockRecentActivity = [
  {
    id: "1",
    user: "Carlos Mendoza",
    action: "completó",
    training: "Seguridad en el Trabajo",
    time: "Hace 5 min",
  },
  {
    id: "2",
    user: "Ana García",
    action: "comenzó",
    training: "Liderazgo Efectivo",
    time: "Hace 15 min",
  },
  {
    id: "3",
    user: "Miguel Torres",
    action: "obtuvo 95% en",
    training: "Cumplimiento Normativo",
    time: "Hace 30 min",
  },
  {
    id: "4",
    user: "Laura Sánchez",
    action: "completó",
    training: "Herramientas Digitales",
    time: "Hace 1 hora",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Capacitaciones"
          value={mockStats.totalTrainings}
          description="activas en el sistema"
          icon={BookOpen}
          accentColor="primary"
        />
        <StatCard
          title="Empleados Activos"
          value={mockStats.activeEmployees}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          accentColor="success"
        />
        <StatCard
          title="Tasa de Completado"
          value={`${mockStats.completionRate}%`}
          description="promedio general"
          icon={Trophy}
          accentColor="warning"
        />
        <StatCard
          title="Puntuación Promedio"
          value={`${mockStats.avgScore}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          accentColor="pending"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Training Table */}
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
          <TrainingTable trainings={mockTrainings} />
        </div>

        {/* Recent Activity */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRecentActivity.map((activity) => (
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
