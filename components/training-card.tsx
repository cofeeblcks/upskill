import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { BookOpen, Clock, Play, CheckCircle2 } from "lucide-react"

interface TrainingCardProps {
  id: string
  title: string
  category: string
  duration: number
  progress: number
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  dueDate?: string
}

const statusConfig = {
  NOT_STARTED: {
    label: "Pendiente",
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "En Curso",
    className: "bg-warning/15 text-warning border-warning/30",
    icon: Play,
  },
  COMPLETED: {
    label: "Completado",
    className: "bg-success/15 text-success border-success/30",
    icon: CheckCircle2,
  },
}

const categoryColors: Record<string, string> = {
  Cumplimiento: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Liderazgo: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Técnico: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Seguridad: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  "Habilidades Blandas": "bg-pink-500/15 text-pink-600 dark:text-pink-400",
}

export function TrainingCard({
  id,
  title,
  category,
  duration,
  progress,
  status,
  dueDate,
}: TrainingCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className="group relative rounded-2xl transition-all hover:-translate-y-0.5">
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <Badge variant="outline" className={cn("border text-xs", config.className)}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        <h3 className="mb-3 line-clamp-2 text-sm font-semibold text-foreground leading-snug">
          {title}
        </h3>

        <div className="mb-4 flex items-center gap-2">
          <Badge variant="secondary" className={cn("text-xs font-medium", categoryColors[category] || "bg-muted text-muted-foreground")}>
            {category}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {duration} min
          </span>
        </div>

        {status !== "NOT_STARTED" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {dueDate && (
          <p className="mt-3 text-xs text-muted-foreground">
            Vence: <span className="font-medium text-foreground">{dueDate}</span>
          </p>
        )}
      </CardContent>

      <CardFooter className="rounded-b-2xl border-t border-border/40 bg-muted/40 p-4">
        <Button
          asChild
          className="w-full rounded-xl"
          size="sm"
          variant={status === "COMPLETED" ? "secondary" : "default"}
        >
          <Link href={`/dashboard/trainings/${id}`}>
            {status === "NOT_STARTED"
              ? "Comenzar"
              : status === "IN_PROGRESS"
                ? "Continuar"
                : "Ver detalle"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
