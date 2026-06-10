import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getLayoutSession } from "@/lib/layout-session";

export default async function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layout = await getLayoutSession();
  const topbarUser = layout?.topbarUser ?? {
    name: "Supervisor",
    email: "",
    points: 0,
  };

  return (
    <SidebarProvider>
      <DashboardSidebar role="SUPERVISOR" />
      <SidebarInset className="flex w-full flex-col">
        <DashboardTopbar user={topbarUser} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
