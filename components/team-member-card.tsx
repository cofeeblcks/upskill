import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TeamMemberCardProps {
  name: string
  position: string
  department: string
  avatar?: string
  completedTrainings: number
  totalTrainings: number
  points: number
}

export function TeamMemberCard({
  name,
  position,
  department,
  avatar,
  completedTrainings,
  totalTrainings,
  points,
}: TeamMemberCardProps) {
  const completionRate =
    totalTrainings > 0
      ? Math.round((completedTrainings / totalTrainings) * 100)
      : 0

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const statusColor =
    completionRate >= 80
      ? "text-success"
      : completionRate >= 50
        ? "text-warning"
        : "text-destructive"

  return (
    <Card className="border-border bg-card transition-all hover:border-primary/50">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{position}</p>
            </div>

            <Badge variant="outline" className="border-border">
              {department}
            </Badge>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className={cn("font-medium", statusColor)}>
                  {completionRate}%
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedTrainings} de {totalTrainings} capacitaciones
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Puntos</span>
              <span className="text-sm font-semibold text-primary">
                {points.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
