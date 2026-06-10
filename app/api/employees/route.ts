import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createEmployeeBodySchema } from "@/lib/schemas/employee";
import { buildUserProgressMap } from "@/lib/trainings/progress";

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

    const { data: users, error: uErr } = await supabase
      .from("users")
      .select(
        "id, name, email, department, role, points, is_active, position, created_at"
      )
      .order("name", { ascending: true });

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    const { data: assignments, error: aErr } = await supabase
      .from("assignments")
      .select("user_id, status, progress");

    if (aErr) {
      return NextResponse.json({ error: aErr.message }, { status: 500 });
    }

    const progressByUser = buildUserProgressMap(assignments ?? []);

    const payload = (users ?? []).map((u) => {
      const g = progressByUser.get(u.id) ?? {
        completed: 0,
        total: 0,
        progressPercent: 0,
      };
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        department: u.department ?? "",
        role: u.role,
        position: u.position ?? "—",
        points: u.points,
        progress: g.progressPercent,
        status: u.is_active ? "active" : "inactive",
        isActive: u.is_active,
        completedTrainings: g.completed,
        totalTrainings: g.total,
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

  const parsed = createEmployeeBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const id = globalThis.crypto.randomUUID();
  const tempPassword = await bcrypt.hash(
    `tmp-${id.slice(0, 8)}`,
    10
  );

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("users").insert({
      id,
      name: d.name,
      email: d.email.toLowerCase().trim(),
      password: tempPassword,
      role: d.role,
      department: d.department,
      position: d.position,
      is_active: true,
    });
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un usuario con ese correo" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch {
    return supabaseUnavailableResponse();
  }
}
