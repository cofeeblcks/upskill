import { DataRefreshOnFocus } from "@/components/data-refresh-on-focus";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getLayoutSession } from "@/lib/layout-session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layout = await getLayoutSession();
  const topbarUser = layout?.topbarUser ?? {
    name: "Admin",
    email: "",
    points: 0,
  };

  return (
    <SidebarProvider>
      <DataRefreshOnFocus />
      <DashboardSidebar role="ADMIN_HR" />
      <SidebarInset className="flex w-full flex-col">
        <DashboardTopbar
          user={topbarUser}
          title="Gestión de Plataforma"
          showPoints={false}
        />
        <main className="flex-1 overflow-x-hidden p-4 pt-6 md:p-6 md:pt-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
