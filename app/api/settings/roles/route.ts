import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createSettingsRoleSchema } from "@/lib/schemas/settings";

function unavailable() {
  return NextResponse.json(
    { error: "Supabase no configurado (service role)" },
    { status: 503 }
  );
}

export async function GET() {
  try {
    const sb = createServiceRoleClient();
    const { data, error } = await sb
      .from("settings_roles")
      .select("id, code, description, sort_order")
      .order("sort_order", { ascending: true })
      .order("code", { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const payload = (data ?? []).map((r) => ({
      id: r.id,
      name: r.code,
      description: r.description,
    }));
    return NextResponse.json(payload);
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = createSettingsRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const id = globalThis.crypto.randomUUID();
  try {
    const sb = createServiceRoleClient();
    const { error } = await sb.from("settings_roles").insert({
      id,
      code: parsed.data.code,
      description: parsed.data.description ?? "",
      sort_order: 99,
    });
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un rol con ese código" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      {
        id,
        name: parsed.data.code,
        description: parsed.data.description ?? "",
      },
      { status: 201 }
    );
  } catch {
    return unavailable();
  }
}
