import { getAdminOverview } from "@/lib/data/queries";
import { AdminTrainingsClient } from "./admin-trainings-client";

export default async function TrainingsPage() {
  const overview = await getAdminOverview();
  const initialTrainings = overview?.trainings ?? [];

  return <AdminTrainingsClient initialTrainings={initialTrainings} />;
}
