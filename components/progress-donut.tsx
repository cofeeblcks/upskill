"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import { Target } from "lucide-react"

interface ProgressDonutProps {
  completed: number
  total: number
  title?: string
}

export function ProgressDonut({
  completed,
  total,
  title = "Progreso General",
}: ProgressDonutProps) {
  const remaining = total - completed
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  const data = [
    { name: "Completados", value: completed, fill: "var(--success)" },
    { name: "Pendientes", value: remaining, fill: "var(--pending)" },
  ]

  const chartConfig = {
    completed: {
      label: "Completados",
      color: "var(--success)",
    },
    pending: {
      label: "Pendientes",
      color: "var(--pending)",
    },
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Target className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
            >
              <tspan
                x="50%"
                dy="-0.5em"
                className="text-3xl font-bold fill-foreground"
              >
                {percentage}%
              </tspan>
              <tspan
                x="50%"
                dy="1.5em"
                className="text-sm fill-muted-foreground"
              >
                completado
              </tspan>
            </text>
          </PieChart>
        </ChartContainer>

        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">
              {completed} Completados
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-pending" />
            <span className="text-sm text-muted-foreground">
              {remaining} Pendientes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
