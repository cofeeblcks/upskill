"use client"

import dynamic from "next/dynamic"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, TrendingUp, Users, CheckCircle2, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const completionByDept = [
  { dept: "Finanzas",       pct: 85 },
  { dept: "Operaciones",    pct: 63 },
  { dept: "Administración", pct: 45 },
]

const progressOverTime = [
  { week: "Sem 1", completions: 4 },
  { week: "Sem 2", completions: 7 },
  { week: "Sem 3", completions: 6 },
  { week: "Sem 4", completions: 11 },
]

const teamMembers = [
  { name: "Ana García",      dept: "Finanzas",       completed: 10, total: 10, points: 3200, risk: false },
  { name: "Carlos Mendoza",  dept: "Finanzas",       completed: 8,  total: 12, points: 2450, risk: false },
  { name: "Laura Sánchez",   dept: "Operaciones",    completed: 9,  total: 11, points: 2650, risk: false },
  { name: "Miguel Torres",   dept: "Finanzas",       completed: 7,  total: 10, points: 2890, risk: false },
  { name: "Patricia López",  dept: "Administración", completed: 3,  total: 8,  points: 980,  risk: true  },
  { name: "José Ramírez",    dept: "Operaciones",    completed: 4,  total: 9,  points: 1200, risk: true  },
]

const chartConfig = {
  pct:         { label: "% Completado", color: "var(--chart-1)" },
  completions: { label: "Completadas",  color: "var(--success)" },
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reportes del Equipo</h1>
          <p className="text-muted-foreground">Analiza el desempeño y progreso de tu equipo.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Miembros del Equipo"   value={12}    icon={Users}         accentColor="primary" />
        <StatCard title="Completado Promedio"   value="72%"   icon={TrendingUp}    accentColor="success" trend={{ value: 8, isPositive: true }} />
        <StatCard title="Capacitaciones Totales" value={48}   icon={CheckCircle2}  accentColor="warning" />
        <StatCard title="Requieren Atención"    value={2}     icon={AlertTriangle} accentColor="pending" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completado por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionByDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis dataKey="dept" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} width={90} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pct" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completaciones por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="completions" stroke="var(--success)" strokeWidth={2} dot={{ fill: "var(--success)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla individual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progreso Individual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((m) => {
              const pct = Math.round((m.completed / m.total) * 100)
              const initials = m.name.split(" ").map((n) => n[0]).join("").toUpperCase()
              return (
                <div key={m.name} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">{m.name}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">· {m.dept}</span>
                      {m.risk && <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30 ml-auto">En riesgo</Badge>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={pct} className={cn("h-1.5 flex-1", m.risk && "[&>div]:bg-destructive")} />
                      <span className="text-xs font-semibold text-foreground w-10 text-right">{pct}%</span>
                      <span className="text-xs text-muted-foreground w-16 text-right hidden sm:block">{m.completed}/{m.total} cap.</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
