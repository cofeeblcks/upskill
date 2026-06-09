import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { updateSettingsRoleSchema } from "@/lib/schemas/settings";
import type { Database } from "@/types/database.types";

type SettingsRoleUpdate = Database["public"]["Tables"]["settings_roles"]["Update"];

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
  const parsed = updateSettingsRoleSchema.safeParse(body);
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

  try {
    const sb = createServiceRoleClient();
    const row: SettingsRoleUpdate = {};
    if (patch.code !== undefined) row.code = patch.code;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.sort_order !== undefined) row.sort_order = patch.sort_order;

    const { error } = await sb.from("settings_roles").update(row).eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Código duplicado" },
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
    const { data: row } = await sb
      .from("settings_roles")
      .select("code")
      .eq("id", id)
      .maybeSingle();
    if (!row) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    const { count } = await sb
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", row.code as "EMPLOYEE" | "SUPERVISOR" | "ADMIN_HR");
    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar: hay usuarios con este rol. Cambia primero sus roles.",
        },
        { status: 409 }
      );
    }
    const { error } = await sb.from("settings_roles").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return unavailable();
  }
}
