import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { previewEligibleBodySchema } from "@/lib/schemas/training";
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

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = previewEligibleBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const requiredRoles = [...parsed.data.requiredRoles];
  const positions = [...parsed.data.positions];

  try {
    const sb = createServiceRoleClient();
    const { data: users, error: uErr } = await sb
      .from("users")
      .select("id, name, email, role, position, department, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    const employees = (users ?? [])
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
      requiredRoles,
      positions,
      employees,
    });
  } catch {
    return unavailable();
  }
}
