"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Loader2, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface User {
  name: string
  email: string
  avatar?: string
  points?: number
}

interface DashboardTopbarProps {
  user: User
  title?: string
  showPoints?: boolean
}

export function DashboardTopbar({ user, title = "Panel", showPoints = true }: DashboardTopbarProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await new Promise((res) => setTimeout(res, 600))
    router.push("/")
  }
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-3 z-30 mx-4 flex h-14 items-center justify-between rounded-2xl bg-card/90 px-5 backdrop-blur-md shadow-[0_2px_20px_rgba(30,111,217,0.10),0_1px_6px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Points Badge */}
        {showPoints && user.points !== undefined && user.points > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {new Intl.NumberFormat("en-US").format(user.points)} pts
            </span>
          </div>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notificaciones</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">3 nuevas</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-sm">Nueva capacitación asignada</span>
                  <span className="text-xs text-muted-foreground">Hace 5 min</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  Se te ha asignado el curso 'Seguridad en el Trabajo'.
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-sm">Insignia desbloqueada</span>
                  <span className="text-xs text-muted-foreground">Hace 2 horas</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  ¡Felicidades! Has obtenido la insignia 'Primeros Pasos'.
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-sm opacity-70">Recordatorio</span>
                  <span className="text-xs text-muted-foreground opacity-70">Hace 1 día</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2 opacity-70">
                  Tu capacitación de 'Liderazgo' vence mañana. ¡No olvides completarla!
                </span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="w-full justify-center text-primary font-medium cursor-pointer">
              Marcar todas como leídas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-destructive focus:text-destructive"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando sesión...
                </>
              ) : (
                "Cerrar Sesión"
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
