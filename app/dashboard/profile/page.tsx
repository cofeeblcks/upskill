import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Trophy, Flame, Star, CheckCircle2, Clock, TrendingUp } from "lucide-react"

const mockActivity = [
  { id: "1", training: "Cumplimiento Normativo y Ética Empresarial", status: "COMPLETED", points: 300, date: "5 Ene 2025" },
  { id: "2", training: "Seguridad en el Trabajo: Protocolos y Mejores Prácticas", status: "IN_PROGRESS", points: 0, date: "10 Ene 2025" },
  { id: "3", training: "Herramientas Digitales para el Trabajo Moderno", status: "COMPLETED", points: 250, date: "20 Dic 2024" },
  { id: "4", training: "Comunicación Efectiva en Equipos", status: "COMPLETED", points: 200, date: "12 Dic 2024" },
  { id: "5", training: "Liderazgo Efectivo para Supervisores", status: "NOT_STARTED", points: 0, date: "Pendiente" },
]

const statusLabel: Record<string, { label: string; color: string }> = {
  COMPLETED:    { label: "Completado",  color: "bg-success/15 text-success border-success/30" },
  IN_PROGRESS:  { label: "En Curso",    color: "bg-warning/15 text-warning border-warning/30" },
  NOT_STARTED:  { label: "Pendiente",   color: "bg-muted text-muted-foreground border-border" },
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y preferencias.</p>
        </div>
        <Button>Editar Perfil</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left — Info personal */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">CM</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">Carlos Mendoza</CardTitle>
            <div className="text-sm text-muted-foreground mt-1">carlos.mendoza@empresa.com</div>
            <Badge className="mt-3 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-0">Empleado</Badge>
          </CardHeader>
          <CardContent className="space-y-0 pt-4">
            {[
              { label: "Departamento", value: "Finanzas" },
              { label: "Posición",     value: "Analista" },
              { label: "Ingreso",      value: "12 Mar 2023" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right — Resumen de actividad */}
        <div className="md:col-span-2 space-y-5">
          {/* Stats rápidas */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: BookOpen, label: "Completadas",   value: "8 / 12", color: "text-primary",  bg: "bg-primary/10" },
              { icon: Trophy,   label: "Puntos",        value: "2,450",  color: "text-warning",  bg: "bg-warning/10" },
              { icon: Flame,    label: "Racha",         value: "5 días", color: "text-orange-500", bg: "bg-orange-500/10" },
              { icon: TrendingUp, label: "Ranking",     value: "#4",     color: "text-success",  bg: "bg-success/10" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progreso general */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" /> Progreso General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">8 de 12 capacitaciones completadas</span>
                <span className="font-semibold text-foreground">67%</span>
              </div>
              <Progress value={67} className="h-2.5" />
            </CardContent>
          </Card>

          {/* Historial de actividad */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Historial de Capacitaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockActivity.map((item) => {
                const s = statusLabel[item.status]
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.status === "COMPLETED" ? "text-success" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium text-foreground truncate">{item.training}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {item.points > 0 && (
                        <span className="text-xs font-semibold text-warning">+{item.points} pts</span>
                      )}
                      <Badge variant="outline" className={`text-xs ${s.color}`}>{s.label}</Badge>
                      <span className="text-xs text-muted-foreground hidden sm:block">{item.date}</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
