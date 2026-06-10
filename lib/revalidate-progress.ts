import { revalidatePath } from "next/cache";

/** Invalida vistas que muestran progreso de capacitaciones. */
export function revalidateProgressViews() {
  const paths = [
    "/dashboard",
    "/dashboard/trainings",
    "/dashboard/profile",
    "/dashboard/achievements",
    "/admin",
    "/admin/employees",
    "/admin/analytics",
    "/admin/trainings",
    "/supervisor",
    "/supervisor/reports",
  ];
  for (const path of paths) {
    revalidatePath(path);
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/supervisor", "layout");
}
