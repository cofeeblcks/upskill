import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { updateTrainingCategorySchema } from "@/lib/schemas/settings";
import type { Database } from "@/types/database.types";

type TrainingCategoryUpdate =
  Database["public"]["Tables"]["training_categories"]["Update"];

function unavailable() {
  return NextResponse.json(
    { error: "Supabase no configurado" },
    { status: 503 }
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = updateTrainingCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const patch = parsed.data;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  }

  const row: TrainingCategoryUpdate = {};
  if (patch.name !== undefined) row.name = patch.name.trim();
  if (patch.color_variant !== undefined) row.color_variant = patch.color_variant;
  if (patch.sort_order !== undefined) row.sort_order = patch.sort_order;
  if (patch.is_active !== undefined) row.is_active = patch.is_active;

  try {
    const sb = createServiceRoleClient();
    const { error } = await sb
      .from("training_categories")
      .update(row)
      .eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Nombre duplicado" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return unavailable();
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const sb = createServiceRoleClient();
    const { data: cat } = await sb
      .from("training_categories")
      .select("name")
      .eq("id", id)
      .maybeSingle();
    if (!cat) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    const { count } = await sb
      .from("trainings")
      .select("*", { count: "exact", head: true })
      .eq("category", cat.name);
    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar: hay capacitaciones con esta categoría. Reasigna o edita esas capacitaciones primero.",
        },
        { status: 409 }
      );
    }
    const { error } = await sb.from("training_categories").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return unavailable();
  }
}
