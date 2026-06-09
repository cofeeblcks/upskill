"use client";

import dynamic from "next/dynamic";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminAnalyticsSnapshot } from "@/lib/data/queries";
import {
  TrendingUp,
  Users,
  BookOpen,
  Trophy,
  Download,
  Calendar,
} from "lucide-react";

const AnalyticsCharts = dynamic(() => import("@/components/analytics-charts"), {
  ssr: false,
  loading: () => <ChartsSkeleton />,
});

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border bg-card p-6"
          >
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border bg-card p-6"
          >
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAnalyticsClient({
  data,
}: {
  data: AdminAnalyticsSnapshot;
}) {
  const { headline } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analíticas y reportes
          </h1>
          <p className="text-muted-foreground">
            Métricas calculadas desde la base de datos (asignaciones, usuarios y
            capacitaciones).
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px] bg-secondary">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el historial</SelectItem>
              <SelectItem value="6m" disabled>
                Filtro por fechas (próximamente)
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" type="button" disabled>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasa de completado"
          value={`${headline.completionRate}%`}
          description="sobre todas las asignaciones"
          icon={TrendingUp}
          accentColor="success"
        />
        <StatCard
          title="Participantes"
          value={headline.participantsCount}
          description="usuarios con al menos una asignación"
          icon={Users}
          accentColor="primary"
        />
        <StatCard
          title="Capacitaciones activas"
          value={headline.activeTrainings}
          icon={BookOpen}
          accentColor="warning"
        />
        <StatCard
          title="Puntos en plataforma"
          value={headline.totalPointsSum.toLocaleString()}
          description="suma de puntos de usuarios activos"
          icon={Trophy}
          accentColor="pending"
        />
      </div>

      <AnalyticsCharts
        completionByDepartment={data.completionByDepartment}
        monthlyEngagement={data.monthlyEngagement}
        pointsDistribution={data.pointsDistribution}
        categoryBreakdown={data.categoryBreakdown}
      />
    </div>
  );
}
