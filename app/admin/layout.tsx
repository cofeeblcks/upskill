import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

// Mock admin user data - will be replaced with actual auth data
const mockAdminUser = {
  name: "María González",
  email: "maria.gonzalez@empresa.com",
  avatar: undefined,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar role="ADMIN_HR" />
      <SidebarInset className="flex w-full flex-col">
        <DashboardTopbar user={mockAdminUser} title="Gestión de Plataforma" showPoints={false} />
        <main className="flex-1 p-4 pt-6 md:p-6 md:pt-6 overflow-x-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
