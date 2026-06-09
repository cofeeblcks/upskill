import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TrainingForm, type TrainingFormInitial } from "@/components/training-form";
import { Button } from "@/components/ui/button";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export default async function EditTrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initial: TrainingFormInitial | null = null;
  try {
    const sb = createServiceRoleClient();
    const { data, error } = await sb
      .from("trainings")
      .select(
        "title, description, category, duration_min, file_url, required_roles, positions"
      )
      .eq("id", id)
      .maybeSingle();
    if (!error && data) {
      initial = {
        title: data.title,
        description: data.description ?? "",
        category: data.category,
        durationMin: data.duration_min,
        fileUrl: data.file_url ?? "",
        requiredRoles: [...(data.required_roles ?? [])],
        positions: [...(data.positions ?? [])],
      };
    }
  } catch {
    notFound();
  }
  if (!initial) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/trainings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Editar capacitación
          </h1>
          <p className="text-muted-foreground">
            Modifica los mismos campos que al crear la capacitación.
          </p>
        </div>
      </div>

      <TrainingForm mode="edit" trainingId={id} initialValues={initial} />
    </div>
  );
}
