import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardUser {
  rank: number
  name: string
  avatar?: string
  points: number
  isCurrentUser?: boolean
}

interface LeaderboardProps {
  users: LeaderboardUser[]
  title?: string
}

const rankConfig = {
  1: { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  2: { icon: Medal, color: "text-gray-300", bg: "bg-gray-300/10" },
  3: { icon: Award, color: "text-amber-600", bg: "bg-amber-600/10" },
}

export function Leaderboard({ users, title = "Leaderboard" }: LeaderboardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5 text-yellow-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.map((user) => {
          const initials = user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()

          const config = rankConfig[user.rank as keyof typeof rankConfig]

          return (
            <div
              key={user.rank}
              className={cn(
                "flex items-center gap-4 rounded-xl p-3 transition-colors",
                user.isCurrentUser
                  ? "bg-primary/10 ring-1 ring-primary/20"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              {/* Rank */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  config?.bg || "bg-muted"
                )}
              >
                {config ? (
                  <config.icon className={cn("h-4 w-4", config.color)} />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">
                    {user.rank}
                  </span>
                )}
              </div>

              {/* Avatar & Name */}
              <div className="flex flex-1 items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      user.isCurrentUser ? "text-primary" : "text-foreground"
                    )}
                  >
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Tú)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {user.points.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
