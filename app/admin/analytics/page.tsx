"use client"

import dynamic from "next/dynamic"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, Users, BookOpen, Trophy, Download, Calendar } from "lucide-react"

const AnalyticsCharts = dynamic(() => import("@/components/analytics-charts"), {
  ssr: false,
  loading: () => <ChartsSkeleton />,
})

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analíticas y Reportes
          </h1>
          <p className="text-muted-foreground">
            Visualiza métricas clave y tendencias de capacitación.
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px] bg-secondary">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="365">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tasa de Completado" value="78%" icon={TrendingUp} trend={{ value: 12, isPositive: true }} accentColor="success" />
        <StatCard title="Empleados Activos" value={156} description="participando este mes" icon={Users} accentColor="primary" />
        <StatCard title="Capacitaciones Activas" value={24} icon={BookOpen} accentColor="warning" />
        <StatCard title="Puntos Otorgados" value="45.2K" description="este mes" icon={Trophy} accentColor="pending" />
      </div>

      <AnalyticsCharts />
    </div>
  )
}
