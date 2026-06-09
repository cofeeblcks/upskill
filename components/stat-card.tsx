import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  accentColor?: "primary" | "success" | "warning" | "pending"
}

const iconBgColors = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  pending: "bg-pending/10 text-pending",
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  accentColor = "primary",
}: StatCardProps) {
  return (
    <Card className="border-none">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", iconBgColors[accentColor])}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              trend.isPositive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
