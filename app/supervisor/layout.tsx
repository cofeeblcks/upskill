import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

// Mock supervisor user data
const mockSupervisorUser = {
  name: "Roberto Díaz",
  email: "roberto.diaz@empresa.com",
  avatar: undefined,
  points: 1850,
}

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar role="SUPERVISOR" />
      <SidebarInset className="flex w-full flex-col">
        <DashboardTopbar user={mockSupervisorUser} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
