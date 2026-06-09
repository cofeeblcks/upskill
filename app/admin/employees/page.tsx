import { getAdminEmployees } from "@/lib/data/queries";
import { AdminEmployeesClient } from "./admin-employees-client";

export default async function EmployeesPage() {
  const rows = await getAdminEmployees();

  return (
    <AdminEmployeesClient initialEmployees={rows ?? []} />
  );
}
