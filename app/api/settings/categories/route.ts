import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createTrainingCategorySchema } from "@/lib/schemas/settings";

function unavailable() {
  return NextResponse.json(
    { error: "Supabase no configurado" },
    { status: 503 }
  );
}

export async function GET() {
  try {
    const sb = createServiceRoleClient();
    const { data, error } = await sb
      .from("training_categories")
      .select("id, name, color_variant, sort_order, is_active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const payload = (data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color_variant,
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
  const parsed = createTrainingCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const id = globalThis.crypto.randomUUID();
  try {
    const sb = createServiceRoleClient();
    const { error } = await sb.from("training_categories").insert({
      id,
      name: parsed.data.name.trim(),
      color_variant: parsed.data.color_variant,
      sort_order: parsed.data.sort_order ?? 99,
      is_active: true,
    });
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe una categoría con ese nombre" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      {
        id,
        name: parsed.data.name.trim(),
        color: parsed.data.color_variant,
      },
      { status: 201 }
    );
  } catch {
    return unavailable();
  }
}
