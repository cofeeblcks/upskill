import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getLayoutSession } from "@/lib/layout-session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layout = await getLayoutSession();
  const topbarUser = layout?.topbarUser ?? {
    name: "Usuario",
    email: "",
    points: 0,
  };
  const role = (layout?.session.role ?? "EMPLOYEE") as
    | "EMPLOYEE"
    | "SUPERVISOR"
    | "ADMIN_HR";

  return (
    <SidebarProvider>
      <DashboardSidebar role={role} />
      <SidebarInset className="flex w-full flex-col">
        <DashboardTopbar user={topbarUser} />
        <main className="flex-1 overflow-x-hidden p-4 pt-6 md:p-6 md:pt-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
