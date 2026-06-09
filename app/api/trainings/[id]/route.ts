import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  updateTrainingBodySchema,
} from "@/lib/schemas/training";
import type { Database } from "@/types/database.types";

type TrainingUpdate = Database["public"]["Tables"]["trainings"]["Update"];

function unavailable() {
  return NextResponse.json(
    {
      error:
        "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    },
    { status: 503 }
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const sb = createServiceRoleClient();
    const { data, error } = await sb
      .from("trainings")
      .select(
        "id, title, description, category, duration_min, file_url, required_roles, positions, is_active, created_at"
      )
      .eq("id", id)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      id: data.id,
      title: data.title,
      description: data.description ?? "",
      category: data.category,
      durationMin: data.duration_min,
      fileUrl: data.file_url ?? "",
      requiredRoles: [...(data.required_roles ?? [])],
      positions: [...(data.positions ?? [])],
      isActive: data.is_active,
      createdAt: data.created_at,
    });
  } catch {
    return unavailable();
  }
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
  const parsed = updateTrainingBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const row: TrainingUpdate = {};
  if (d.title !== undefined) row.title = d.title;
  if (d.description !== undefined) row.description = d.description;
  if (d.category !== undefined) row.category = d.category;
  const duration =
    d.durationMin ?? d.duration;
  if (duration !== undefined) row.duration_min = duration;
  if (d.fileUrl !== undefined) row.file_url = d.fileUrl;
  if (d.requiredRoles !== undefined) row.required_roles = d.requiredRoles;
  if (d.positions !== undefined) row.positions = d.positions;
  if (d.isActive !== undefined) row.is_active = d.isActive;

  try {
    const sb = createServiceRoleClient();
    const { error } = await sb.from("trainings").update(row).eq("id", id);
    if (error) {
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
    const { error } = await sb.from("trainings").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return unavailable();
  }
}
