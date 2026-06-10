"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AdminAnalyticsSnapshot } from "@/lib/data/queries";
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
} from "recharts";

export type AnalyticsChartsProps = {
  completionByDepartment: AdminAnalyticsSnapshot["completionByDepartment"];
  monthlyEngagement: AdminAnalyticsSnapshot["monthlyEngagement"];
  pointsDistribution: AdminAnalyticsSnapshot["pointsDistribution"];
  categoryBreakdown: AdminAnalyticsSnapshot["categoryBreakdown"];
};

const chartConfig = {
  completion: { label: "Completado %", color: "var(--success)" },
  assigned: { label: "Asignaciones nuevas", color: "var(--chart-1)" },
  completed: { label: "Completadas", color: "var(--success)" },
};

export default function AnalyticsCharts({
  completionByDepartment,
  monthlyEngagement,
  pointsDistribution,
  categoryBreakdown,
}: AnalyticsChartsProps) {
  const deptData =
    completionByDepartment.length > 0
      ? completionByDepartment
      : [{ department: "Sin datos", completion: 0 }];

  const lineData =
    monthlyEngagement.length > 0
      ? monthlyEngagement
      : [{ month: "—", assigned: 0, completed: 0 }];

  const pointsData =
    pointsDistribution.length > 0
      ? pointsDistribution
      : [{ range: "—", count: 0, fill: "var(--muted)" }];

  const pieData =
    categoryBreakdown.length > 0
      ? categoryBreakdown
      : [{ name: "Sin asignaciones", value: 100, fill: "var(--muted)" }];

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Completado por departamento</CardTitle>
            <p className="text-xs text-muted-foreground">
              % de asignaciones completadas por departamento del empleado.
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    dataKey="department"
                    type="category"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="completion"
                    fill="var(--success)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Asignaciones por mes</CardTitle>
            <p className="text-xs text-muted-foreground">
              Últimos 6 meses: nuevas asignaciones vs completadas en el mes.
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="assigned"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-1)", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="var(--success)"
                    strokeWidth={2}
                    dot={{ fill: "var(--success)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Empleados por rango de puntos</CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribución de empleados activos según sus puntos actuales.
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pointsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {pointsData.map((entry, index) => (
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
            <CardTitle>Asignaciones por categoría</CardTitle>
            <p className="text-xs text-muted-foreground">
              % del total de asignaciones según la categoría de la capacitación.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
              <ChartContainer config={chartConfig} className="h-[250px] w-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex w-full flex-1 flex-col space-y-3">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="flex-1 text-sm text-foreground">
                      {item.name}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
