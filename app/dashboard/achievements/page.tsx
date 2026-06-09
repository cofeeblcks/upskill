import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Zap, Flame, Target, Star, Award, Rocket, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

const badges = [
  { id: "1", type: "FIRST_TRAINING", name: "Primera Capacitación", description: "Completaste tu primera capacitación", earnedAt: "10 Dic 2024", isEarned: true, points: 100 },
  { id: "2", type: "STREAK_5",       name: "Racha de 5",           description: "Completa 5 días consecutivos",          earnedAt: "20 Dic 2024", isEarned: true, points: 200 },
  { id: "3", type: "PERFECT_SCORE",  name: "Puntuación Perfecta",  description: "Obtén 100% en una evaluación",          earnedAt: "5 Ene 2025",  isEarned: true, points: 300 },
  { id: "4", type: "EARLY_BIRD",     name: "Madrugador",           description: "Completa una capacitación antes del plazo", earnedAt: "12 Dic 2024", isEarned: true, points: 150 },
  { id: "5", type: "TOP_SCORER",     name: "Mejor Puntuación",     description: "Obtén la mejor puntuación del mes",      isEarned: false, points: 500 },
  { id: "6", type: "STREAK_10",      name: "Racha de 10",          description: "Completa 10 días consecutivos",          isEarned: false, points: 400 },
  { id: "7", type: "TEAM_PLAYER",    name: "Jugador de Equipo",    description: "Ayuda a 3 compañeros en sus capacitaciones", isEarned: false, points: 250 },
]

const badgeConfig: Record<string, { icon: typeof Zap; bg: string; icon_color: string; ring: string }> = {
  FIRST_TRAINING: { icon: Zap,     bg: "bg-emerald-500/20", icon_color: "text-emerald-500", ring: "ring-emerald-500/40" },
  STREAK_5:       { icon: Flame,   bg: "bg-orange-500/20",  icon_color: "text-orange-500",  ring: "ring-orange-500/40" },
  STREAK_10:      { icon: Flame,   bg: "bg-red-500/20",     icon_color: "text-red-500",     ring: "ring-red-500/40" },
  TOP_SCORER:     { icon: Target,  bg: "bg-yellow-500/20",  icon_color: "text-yellow-500",  ring: "ring-yellow-500/40" },
  PERFECT_SCORE:  { icon: Star,    bg: "bg-purple-500/20",  icon_color: "text-purple-500",  ring: "ring-purple-500/40" },
  EARLY_BIRD:     { icon: Rocket,  bg: "bg-blue-500/20",    icon_color: "text-blue-500",    ring: "ring-blue-500/40" },
  TEAM_PLAYER:    { icon: Award,   bg: "bg-pink-500/20",    icon_color: "text-pink-500",    ring: "ring-pink-500/40" },
}

const earned = badges.filter((b) => b.isEarned)
const totalPoints = earned.reduce((acc, b) => acc + b.points, 0)

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Logros</h1>
        <p className="text-muted-foreground">Colecciona insignias completando capacitaciones y retos.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10">
              <Trophy className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{earned.length} / {badges.length}</p>
              <p className="text-sm text-muted-foreground">Insignias obtenidas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalPoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Puntos por logros</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso total</span>
              <span className="font-semibold">{Math.round((earned.length / badges.length) * 100)}%</span>
            </div>
            <Progress value={(earned.length / badges.length) * 100} className="h-2.5" />
            <p className="text-xs text-muted-foreground">{badges.length - earned.length} insignias por desbloquear</p>
          </CardContent>
        </Card>
      </div>

      {/* Obtenidas */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Insignias Desbloqueadas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {earned.map((badge) => {
            const cfg = badgeConfig[badge.type]
            const Icon = cfg.icon
            return (
              <Card key={badge.id} className="text-center">
                <CardContent className="p-5 flex flex-col items-center gap-3">
                  <div className={cn("flex h-16 w-16 items-center justify-center rounded-full ring-2 shadow-sm", cfg.bg, cfg.ring)}>
                    <Icon className={cn("h-8 w-8", cfg.icon_color)} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-warning">+{badge.points} pts</span>
                    <span className="text-xs text-muted-foreground">· {badge.earnedAt}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Bloqueadas */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Por Desbloquear</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {badges.filter((b) => !b.isEarned).map((badge) => {
            const cfg = badgeConfig[badge.type]
            const Icon = cfg.icon
            return (
              <Card key={badge.id} className="text-center opacity-60">
                <CardContent className="p-5 flex flex-col items-center gap-3">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full ring-2 bg-muted ring-muted-foreground/20 grayscale">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted-foreground/20">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">+{badge.points} pts al desbloquear</span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
