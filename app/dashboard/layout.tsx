import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

// Mock user data - will be replaced with actual auth data
const mockUser = {
  name: "Carlos Mendoza",
  email: "carlos.mendoza@empresa.com",
  avatar: undefined,
  points: 2450,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar role="EMPLOYEE" />
      <SidebarInset className="flex w-full flex-col">
        <DashboardTopbar user={mockUser} />
        <main className="flex-1 p-4 pt-6 md:p-6 md:pt-6 overflow-x-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
