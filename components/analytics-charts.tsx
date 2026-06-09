"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"

const completionByDepartment = [
  { department: "Finanzas", completion: 85 },
  { department: "Operaciones", completion: 72 },
  { department: "RRHH", completion: 91 },
  { department: "Ventas", completion: 68 },
  { department: "TI", completion: 78 },
  { department: "Marketing", completion: 82 },
]

const engagementOverTime = [
  { month: "Jul", trainings: 45, completions: 38 },
  { month: "Ago", trainings: 52, completions: 44 },
  { month: "Sep", trainings: 61, completions: 55 },
  { month: "Oct", trainings: 58, completions: 52 },
  { month: "Nov", trainings: 72, completions: 65 },
  { month: "Dic", trainings: 80, completions: 71 },
]

const pointsDistribution = [
  { range: "0-500", count: 12, fill: "var(--pending)" },
  { range: "501-1000", count: 28, fill: "var(--warning)" },
  { range: "1001-2000", count: 45, fill: "var(--chart-1)" },
  { range: "2001-3000", count: 52, fill: "var(--success)" },
  { range: "3000+", count: 19, fill: "var(--chart-4)" },
]

const categoryBreakdown = [
  { name: "Cumplimiento", value: 35, fill: "#1E6FD9" },
  { name: "Seguridad", value: 25, fill: "#F59E0B" },
  { name: "Liderazgo", value: 18, fill: "#8B5CF6" },
  { name: "Técnico", value: 15, fill: "#22C55E" },
  { name: "Habilidades Blandas", value: 7, fill: "#EC4899" },
]

const chartConfig = {
  completion: { label: "Completado", color: "var(--success)" },
  trainings: { label: "Asignadas", color: "var(--chart-1)" },
  completions: { label: "Completadas", color: "var(--success)" },
}

export default function AnalyticsCharts() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Completado por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionByDepartment} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis dataKey="department" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completion" fill="var(--success)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Engagement de Capacitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="trainings" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: "var(--chart-1)", r: 4 }} />
                  <Line type="monotone" dataKey="completions" stroke="var(--success)" strokeWidth={2} dot={{ fill: "var(--success)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Distribución de Puntos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pointsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="range" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {pointsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Capacitaciones por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <ChartContainer config={chartConfig} className="h-[250px] w-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} strokeWidth={0}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex-1 space-y-3">
                {categoryBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="flex-1 text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-muted-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
