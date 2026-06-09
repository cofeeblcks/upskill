import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createTrainingBodySchema } from "@/lib/schemas/training";
import { createAssignmentsForUsers } from "@/lib/trainings/assignment-actions";

function supabaseUnavailableResponse() {
  return NextResponse.json(
    {
      error:
        "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.",
    },
    { status: 503 }
  );
}

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const { data: trainings, error: tErr } = await supabase
      .from("trainings")
      .select(
        "id, title, category, duration_min, is_active, required_roles, created_at"
      )
      .order("created_at", { ascending: true });

    if (tErr) {
      return NextResponse.json({ error: tErr.message }, { status: 500 });
    }

    const { data: assignments, error: aErr } = await supabase
      .from("assignments")
      .select("training_id, status");

    if (aErr) {
      return NextResponse.json({ error: aErr.message }, { status: 500 });
    }

    const byTraining = new Map<
      string,
      { assigned: number; completed: number }
    >();
    for (const row of assignments ?? []) {
      const cur = byTraining.get(row.training_id) ?? {
        assigned: 0,
        completed: 0,
      };
      cur.assigned += 1;
      if (row.status === "COMPLETED") cur.completed += 1;
      byTraining.set(row.training_id, cur);
    }

    const payload = (trainings ?? []).map((t) => {
      const stats = byTraining.get(t.id) ?? { assigned: 0, completed: 0 };
      const roles = [...(t.required_roles ?? [])] as string[];
      return {
        id: t.id,
        title: t.title,
        category: t.category,
        duration: t.duration_min,
        durationMin: t.duration_min,
        requiredRoles: roles,
        isActive: t.is_active,
        createdAt: (t.created_at ?? "").slice(0, 10),
        status: t.is_active ? "active" : "inactive",
        assignedCount: stats.assigned,
        completedCount: stats.completed,
      };
    });

    return NextResponse.json(payload);
  } catch {
    return supabaseUnavailableResponse();
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createTrainingBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const durationMin = d.durationMin ?? d.duration;
  const id = globalThis.crypto.randomUUID();

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("trainings")
      .insert({
        id,
        title: d.title,
        description: d.description ?? null,
        category: d.category,
        duration_min: durationMin,
        file_url: d.fileUrl ?? null,
        required_roles: d.requiredRoles,
        positions: d.positions ?? [],
        is_active: d.isActive,
      })
      .select("id, title, category, duration_min, is_active")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const assignIds = [...new Set(d.assignUserIds ?? [])];
    let createdAssign = 0;
    if (assignIds.length > 0) {
      const assignResult = await createAssignmentsForUsers(
        supabase,
        id,
        assignIds,
        {
          requiredRoles: d.requiredRoles,
          positions: d.positions ?? [],
        }
      );
      if (!assignResult.ok) {
        await supabase.from("trainings").delete().eq("id", id);
        return NextResponse.json(
          { error: assignResult.error },
          { status: assignResult.status }
        );
      }
      createdAssign = assignResult.created;
    }

    return NextResponse.json(
      {
        id: data.id,
        title: data.title,
        category: data.category,
        duration: data.duration_min,
        status: data.is_active ? "active" : "inactive",
        assignedCount: createdAssign,
        completedCount: 0,
      },
      { status: 201 }
    );
  } catch {
    return supabaseUnavailableResponse();
  }
}
