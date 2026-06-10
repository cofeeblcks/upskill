import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isUserEligibleForTraining } from "@/lib/trainings/eligibility";

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
  const { id: trainingId } = await context.params;
  try {
    const sb = createServiceRoleClient();
    const { data: training, error: tErr } = await sb
      .from("trainings")
      .select("id, title, required_roles, positions, is_active")
      .eq("id", trainingId)
      .maybeSingle();
    if (tErr) {
      return NextResponse.json({ error: tErr.message }, { status: 500 });
    }
    if (!training) {
      return NextResponse.json({ error: "Capacitación no encontrada" }, { status: 404 });
    }

    const requiredRoles = [...(training.required_roles ?? [])] as string[];
    const positions = [...(training.positions ?? [])] as string[];

    const { data: assignedRows } = await sb
      .from("assignments")
      .select("user_id")
      .eq("training_id", trainingId);
    const assignedSet = new Set((assignedRows ?? []).map((r) => r.user_id));

    const { data: users, error: uErr } = await sb
      .from("users")
      .select("id, name, email, role, position, department, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    const eligible = (users ?? [])
      .filter((u) => !assignedSet.has(u.id))
      .filter((u) =>
        isUserEligibleForTraining({
          userRole: u.role,
          userPosition: u.position,
          requiredRoles,
          trainingPositions: positions,
        })
      )
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department ?? "",
        position: u.position ?? "",
      }));

    return NextResponse.json({
      training: {
        id: training.id,
        title: training.title,
        isActive: training.is_active,
        requiredRoles,
        positions,
      },
      employees: eligible,
    });
  } catch {
    return unavailable();
  }
}
