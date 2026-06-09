import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { updateEmployeeBodySchema } from "@/lib/schemas/employee";
import type { Database } from "@/types/database.types";

type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

function unavailable() {
  return NextResponse.json(
    {
      error:
        "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    },
    { status: 503 }
  );
}

const statusLabel: Record<string, string> = {
  NOT_STARTED: "Pendiente",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const sb = createServiceRoleClient();
    const { data: u, error } = await sb
      .from("users")
      .select(
        "id, name, email, role, department, position, points, is_active, created_at, supervisor_id"
      )
      .eq("id", id)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!u) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const { data: assigns } = await sb
      .from("assignments")
      .select("id, training_id, status, progress, score, updated_at")
      .eq("user_id", id)
      .order("updated_at", { ascending: false });
    const rows = assigns ?? [];
    const tids = [...new Set(rows.map((r) => r.training_id))];
    const { data: trainings } =
      tids.length > 0
        ? await sb
            .from("trainings")
            .select("id, title, category, duration_min")
            .in("id", tids)
        : { data: [] };
    const tmap = new Map((trainings ?? []).map((t) => [t.id, t]));

    const assignments = rows.map((a) => {
      const t = tmap.get(a.training_id);
      return {
        assignmentId: a.id,
        trainingId: a.training_id,
        title: t?.title ?? "Capacitación",
        category: t?.category ?? "—",
        durationMin: t?.duration_min ?? 0,
        status: a.status,
        statusLabel: statusLabel[a.status] ?? a.status,
        progress: a.progress,
        score: a.score,
        updatedAt: a.updated_at,
      };
    });

    const completed = rows.filter((r) => r.status === "COMPLETED").length;

    return NextResponse.json({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department ?? "",
      position: u.position ?? "",
      points: u.points,
      isActive: u.is_active,
      createdAt: u.created_at,
      supervisorId: u.supervisor_id,
      completedTrainings: completed,
      totalTrainings: rows.length,
      assignments,
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
  const parsed = updateEmployeeBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const row: UserUpdate = {};
  if (d.name !== undefined) row.name = d.name;
  if (d.email !== undefined) row.email = d.email.toLowerCase().trim();
  if (d.department !== undefined) row.department = d.department;
  if (d.position !== undefined) row.position = d.position;
  if (d.role !== undefined) row.role = d.role;
  if (d.isActive !== undefined) row.is_active = d.isActive;
  if (d.supervisorId !== undefined) row.supervisor_id = d.supervisorId;

  try {
    const sb = createServiceRoleClient();
    const { error } = await sb.from("users").update(row).eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un usuario con ese correo" },
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
