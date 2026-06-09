"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { UpSkillLogo } from "@/components/upskill-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react"

const employeeNavItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/trainings", label: "Mis Capacitaciones", icon: BookOpen },
  { href: "/dashboard/achievements", label: "Logros", icon: Trophy },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
]

const supervisorNavItems = [
  { href: "/supervisor", label: "Mi Equipo", icon: Users },
  { href: "/supervisor/reports", label: "Reportes", icon: BarChart3 },
]

const adminNavItems = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/trainings", label: "Capacitaciones", icon: BookOpen },
  { href: "/admin/employees", label: "Empleados", icon: Users },
  { href: "/admin/analytics", label: "Analíticas", icon: BarChart3 },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

interface DashboardSidebarProps {
  role?: "EMPLOYEE" | "SUPERVISOR" | "ADMIN_HR"
}

export function DashboardSidebar({ role = "EMPLOYEE" }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const navItems =
    role === "ADMIN_HR"
      ? adminNavItems
      : role === "SUPERVISOR"
        ? [...employeeNavItems, ...supervisorNavItems]
        : employeeNavItems

  return (
    <Sidebar variant="sidebar" className="border-0 my-3 ml-3 rounded-2xl shadow-[2px_0_24px_rgba(30,111,217,0.08)] overflow-hidden">
      <SidebarHeader className="flex h-16 shrink-0 items-center justify-center border-b border-border">
        <div className="w-full px-4 flex items-center justify-start">
          <UpSkillLogo />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href.split("/").length > 2
                ? pathname === item.href || pathname.startsWith(item.href + "/")
                : pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive} 
                  tooltip={item.label}
                  className={cn(
                    "font-medium transition-all duration-200 py-5 rounded-2xl",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className={cn("size-5 transition-transform duration-200", isActive && "scale-110")} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full py-5 font-medium transition-all duration-200 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              {isSigningOut ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <LogOut className="size-5" />
              )}
              <span>{isSigningOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
