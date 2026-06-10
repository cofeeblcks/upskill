import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createTrainingAssignmentsBodySchema } from "@/lib/schemas/assignment";
import { createAssignmentsForUsers } from "@/lib/trainings/assignment-actions";

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

const roleLabel: Record<string, string> = {
  EMPLOYEE: "Empleado",
  SUPERVISOR: "Supervisor",
  ADMIN_HR: "Admin HR",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: trainingId } = await context.params;
  try {
    const sb = createServiceRoleClient();
    const { data: rows, error } = await sb
      .from("assignments")
      .select("id, user_id, status, progress, score")
      .eq("training_id", trainingId)
      .order("id", { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const list = rows ?? [];
    const userIds = [...new Set(list.map((r) => r.user_id))];
    const { data: users } =
      userIds.length > 0
        ? await sb
            .from("users")
            .select("id, name, email, role, position")
            .in("id", userIds)
        : { data: [] };
    const byUser = new Map((users ?? []).map((u) => [u.id, u]));

    const payload = list.map((a) => {
      const u = byUser.get(a.user_id);
      return {
        assignmentId: a.id,
        userId: a.user_id,
        name: u?.name ?? "Usuario",
        email: u?.email ?? "",
        role: u?.role ? roleLabel[u.role] ?? u.role : "—",
        position: u?.position ?? "—",
        status: a.status,
        statusLabel: statusLabel[a.status] ?? a.status,
        progress: a.progress,
        score: a.score,
      };
    });
    return NextResponse.json({ assignments: payload });
  } catch {
    return unavailable();
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: trainingId } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = createTrainingAssignmentsBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const sb = createServiceRoleClient();
    const { data: training, error: tErr } = await sb
      .from("trainings")
      .select("id, required_roles, positions, is_active")
      .eq("id", trainingId)
      .maybeSingle();
    if (tErr) {
      return NextResponse.json({ error: tErr.message }, { status: 500 });
    }
    if (!training) {
      return NextResponse.json({ error: "Capacitación no encontrada" }, { status: 404 });
    }
    if (!training.is_active) {
      return NextResponse.json(
        { error: "Activa la capacitación antes de asignar empleados." },
        { status: 400 }
      );
    }

    const requiredRoles = [...(training.required_roles ?? [])] as string[];
    const positions = [...(training.positions ?? [])] as string[];

    const result = await createAssignmentsForUsers(
      sb,
      trainingId,
      parsed.data.userIds,
      { requiredRoles, positions }
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
    return NextResponse.json({ created: result.created }, { status: 201 });
  } catch {
    return unavailable();
  }
}
