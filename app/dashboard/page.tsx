import { BadgeGrid } from "@/components/badge-grid"
import { Leaderboard } from "@/components/leaderboard"
import { ProgressDonut } from "@/components/progress-donut"
import { StatCard } from "@/components/stat-card"
import { TrainingCard } from "@/components/training-card"
import { BookOpen, Trophy, Flame, Target } from "lucide-react"

// Mock data - will be replaced with actual database queries
const mockUser = {
  name: "Carlos",
  points: 2450,
  completedTrainings: 8,
  totalTrainings: 12,
  streak: 5,
}

const mockTrainings = [
  {
    id: "1",
    title: "Seguridad en el Trabajo: Protocolos y Mejores Prácticas",
    category: "Seguridad",
    duration: 45,
    progress: 75,
    status: "IN_PROGRESS" as const,
    dueDate: "15 Ene 2025",
  },
  {
    id: "2",
    title: "Liderazgo Efectivo para Supervisores",
    category: "Liderazgo",
    duration: 60,
    progress: 0,
    status: "NOT_STARTED" as const,
    dueDate: "22 Ene 2025",
  },
  {
    id: "3",
    title: "Cumplimiento Normativo y Ética Empresarial",
    category: "Cumplimiento",
    duration: 30,
    progress: 100,
    status: "COMPLETED" as const,
  },
]

const mockLeaderboard = [
  { rank: 1, name: "Ana García", points: 3200, avatar: undefined },
  { rank: 2, name: "Miguel Torres", points: 2890, avatar: undefined },
  { rank: 3, name: "Laura Sánchez", points: 2650, avatar: undefined },
  { rank: 4, name: "Carlos Mendoza", points: 2450, avatar: undefined, isCurrentUser: true },
  { rank: 5, name: "Roberto Díaz", points: 2100, avatar: undefined },
]

const mockBadges = [
  {
    id: "1",
    type: "FIRST_TRAINING",
    name: "Primera Capacitación",
    description: "Completaste tu primera capacitación",
    earnedAt: "10 Dic 2024",
    isEarned: true,
  },
  {
    id: "2",
    type: "STREAK_5",
    name: "Racha de 5",
    description: "Completa 5 capacitaciones seguidas",
    earnedAt: "20 Dic 2024",
    isEarned: true,
  },
  {
    id: "3",
    type: "TOP_SCORER",
    name: "Mejor Puntuación",
    description: "Obtén la mejor puntuación del mes",
    isEarned: false,
  },
  {
    id: "4",
    type: "PERFECT_SCORE",
    name: "Puntuación Perfecta",
    description: "Obtén 100% en una evaluación",
    earnedAt: "5 Ene 2025",
    isEarned: true,
  },
  {
    id: "5",
    type: "STREAK_10",
    name: "Racha de 10",
    description: "Completa 10 capacitaciones seguidas",
    isEarned: false,
  },
  {
    id: "6",
    type: "EARLY_BIRD",
    name: "Madrugador",
    description: "Completa una capacitación antes de la fecha límite",
    earnedAt: "12 Dic 2024",
    isEarned: true,
  },
]

export default function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bienvenido, {mockUser.name}
        </h1>
        <p className="text-muted-foreground">
          Continúa tu progreso y alcanza tus metas de capacitación.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Capacitaciones Completadas"
          value={mockUser.completedTrainings}
          description={`de ${mockUser.totalTrainings} asignadas`}
          icon={BookOpen}
          accentColor="success"
        />
        <StatCard
          title="Puntos Totales"
          value={mockUser.points}
          icon={Trophy}
          trend={{ value: 15, isPositive: true }}
          accentColor="primary"
        />
        <StatCard
          title="Racha Actual"
          value={`${mockUser.streak} días`}
          description="Sigue así!"
          icon={Flame}
          accentColor="warning"
        />
        <StatCard
          title="Ranking Mensual"
          value="#4"
          description="Top 10% de empleados"
          icon={Target}
          accentColor="pending"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Training Cards Section */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Mis Capacitaciones
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockTrainings.map((training) => (
                <TrainingCard key={training.id} {...training} />
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <BadgeGrid badges={mockBadges} title="Mis Logros" />
        </div>

        {/* Sidebar: Progress & Leaderboard */}
        <div className="space-y-6">
          <ProgressDonut
            completed={mockUser.completedTrainings}
            total={mockUser.totalTrainings}
          />
          <Leaderboard users={mockLeaderboard} title="Top 5 del Mes" />
        </div>
      </div>
    </div>
  )
}
