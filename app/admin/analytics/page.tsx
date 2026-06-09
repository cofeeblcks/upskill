import { getAdminAnalytics } from "@/lib/data/queries";
import { AdminAnalyticsClient } from "./admin-analytics-client";

export default async function AnalyticsPage() {
  const data = await getAdminAnalytics();

  if (!data) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No se pudieron cargar las analíticas. Revisa Supabase y las variables en
        .env.local.
      </div>
    );
  }

  return <AdminAnalyticsClient data={data} />;
}
